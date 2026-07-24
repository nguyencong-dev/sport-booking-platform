package com.nguyencong.fieldmate.service.impl;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.dto.request.MomoIpnRequest;
import com.nguyencong.fieldmate.dto.request.PaymentRequest;
import com.nguyencong.fieldmate.dto.response.PaymentResponse;
import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.MomoCredential;
import com.nguyencong.fieldmate.entity.OwnerPaymentAccount;
import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.enums.BookingStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentMethod;
import com.nguyencong.fieldmate.entity.enums.PaymentProvider;
import com.nguyencong.fieldmate.entity.enums.PaymentStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentType;
import com.nguyencong.fieldmate.entity.enums.Role;
import com.nguyencong.fieldmate.exception.BadRequestException;
import com.nguyencong.fieldmate.exception.BusinessRuleViolationException;
import com.nguyencong.fieldmate.exception.ResourceNotFoundException;
import com.nguyencong.fieldmate.mapper.PaymentMapper;
import com.nguyencong.fieldmate.payment.PaymentGatewayResult;
import com.nguyencong.fieldmate.payment.PaymentGatewayStrategy;
import com.nguyencong.fieldmate.payment.PaymentGatewayStrategyFactory;
import com.nguyencong.fieldmate.repository.BookingRepository;
import com.nguyencong.fieldmate.repository.MomoCredentialRepository;
import com.nguyencong.fieldmate.repository.OwnerPaymentAccountRepository;
import com.nguyencong.fieldmate.repository.PaymentRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.CredentialEncryptionService;
import com.nguyencong.fieldmate.service.PaymentService;
import com.nguyencong.fieldmate.utils.HmacUtils;
import java.security.MessageDigest;

@Service
public class PaymentServiceImpl implements PaymentService {
    @Value("${booking.payment-timeout-minutes:15}")
    private long paymentTimeoutMinutes;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private CurrentUserProvider currentUserProvider;
    @Autowired
    private PaymentGatewayStrategyFactory strategyFactory;
    @Autowired
    private OwnerPaymentAccountRepository paymentAccountRepository;
    @Autowired
    private MomoCredentialRepository momoCredentialRepository;
    @Autowired
    private CredentialEncryptionService credentialEncryptionService;

    @Override
    @Transactional
    public PaymentResponse createPayment(Long bookingId, PaymentRequest request) {

        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch đặt sân"));

        User currentCustomer = currentUserProvider.getCurrentUser();

        if (!booking.getCustomer().getId().equals(currentCustomer.getId())) {
            throw new AccessDeniedException("Bạn không có quyền thanh toán booking này");
        }

        validateBooking(booking);
        validatePaymentMethod(request.getPaymentMethod());

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(paymentTimeoutMinutes);

        boolean pendingPaymentExists = paymentRepository.existsByBookingIdAndStatusAndCreatedAtAfter(bookingId,
                PaymentStatus.PENDING, cutoff);

        if (pendingPaymentExists) {
            throw new BusinessRuleViolationException("Booking đang có một giao dịch chờ thanh toán");
        }

        BigDecimal paidAmount = calculatePaidAmount(booking);

        BigDecimal amount = calculatePaymentAmount(booking, paidAmount, request.getPaymentType());

        Long ownerId = booking.getCourt()
                .getVenue()
                .getOwner()
                .getId();

        PaymentProvider provider = getProvider(request.getPaymentMethod());

        OwnerPaymentAccount paymentAccount = paymentAccountRepository
                .findByOwner_IdAndProviderAndStatus(ownerId, provider, PaymentAccountStatus.ACTIVE)
                .orElseThrow(
                        () -> new BusinessRuleViolationException("Chủ sân chưa có tài khoản thanh toán hoạt động"));

        Payment payment = Payment.builder()
                .booking(booking)
                .paymentAccount(paymentAccount)
                .amount(amount)
                .type(request.getPaymentType())
                .status(PaymentStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .transactionCode(generateTransactionCode())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        PaymentGatewayStrategy strategy = strategyFactory.getStrategy(request.getPaymentMethod());

        PaymentGatewayResult gatewayResult = strategy.createPayment(savedPayment);

        return PaymentMapper.toResponse(savedPayment, gatewayResult);
    }

    private void validateBooking(Booking booking) {

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessRuleViolationException("Booking đã bị hủy");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessRuleViolationException("Booking đã hoàn thành");
        }

        if (booking.getStatus() == BookingStatus.EXPIRED) {
            throw new BusinessRuleViolationException("Booking đã hết hạn thanh toán");
        }

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(paymentTimeoutMinutes);

        boolean pendingButExpired = booking.getStatus() == BookingStatus.PENDING
                && booking.getCreatedAt() != null
                && !booking.getCreatedAt().isAfter(cutoff);

        if (pendingButExpired) {
            throw new BusinessRuleViolationException("Booking đã hết hạn thanh toán");
        }
    }

    private void validatePaymentMethod(PaymentMethod paymentMethod) {

        if (paymentMethod == PaymentMethod.CASH) {
            throw new BadRequestException("Không thể khởi tạo thanh toán online bằng tiền mặt");
        }
    }

    private BigDecimal calculatePaidAmount(Booking booking) {

        return booking.getPayments()
                .stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculatePaymentAmount(Booking booking, BigDecimal paidAmount, PaymentType paymentType) {

        BigDecimal remainingAmount = booking.getTotalPrice().subtract(paidAmount);

        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleViolationException("Booking đã được thanh toán đầy đủ");
        }

        return switch (paymentType) {
            case DEPOSIT -> calculateDepositAmount(booking, paidAmount);

            case REMAINING -> calculateRemainingAmount(booking, paidAmount, remainingAmount);

            case FULL_PAYMENT -> remainingAmount;
        };
    }

    private BigDecimal calculateDepositAmount(Booking booking, BigDecimal paidAmount) {

        BigDecimal depositAmount = booking.getRequiredDeposit().subtract(paidAmount);

        if (depositAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleViolationException("Booking đã thanh toán đủ tiền cọc");
        }

        return depositAmount;
    }

    private BigDecimal calculateRemainingAmount(Booking booking, BigDecimal paidAmount, BigDecimal remainingAmount) {

        if (paidAmount.compareTo(booking.getRequiredDeposit()) < 0) {
            throw new BusinessRuleViolationException("Booking chưa thanh toán đủ tiền cọc");
        }

        return remainingAmount;
    }

    private String generateTransactionCode() {

        return "PAY_" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .toUpperCase();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByBookingId(Long bookingId) {

        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch đặt sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        boolean isCustomer = booking.getCustomer().getId().equals(currentUser.getId());

        boolean isCourtOwner = booking.getCourt().getVenue().getOwner().getId().equals(currentUser.getId());

        if (!isAdmin && !isCustomer && !isCourtOwner) {
            throw new AccessDeniedException("Bạn không có quyền xem giao dịch của booking này");
        }

        return paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId).stream().map(PaymentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {

        Payment payment = paymentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch"));

        User currentUser = currentUserProvider.getCurrentUser();

        Booking booking = payment.getBooking();

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        boolean isCustomer = booking.getCustomer().getId().equals(currentUser.getId());

        boolean isCourtOwner = booking.getCourt().getVenue().getOwner().getId().equals(currentUser.getId());

        if (!isAdmin && !isCustomer && !isCourtOwner) {
            throw new AccessDeniedException("Bạn không có quyền xem giao dịch này");
        }

        return PaymentMapper.toResponse(payment);
    }

    @Override
    @Transactional
    public void handleMomoIpn(MomoIpnRequest request) {

        Payment payment = paymentRepository
                .findByTransactionCode(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch"));

        if (payment.getPaymentMethod() != PaymentMethod.MOMO) {
            throw new BadRequestException("Giao dịch không sử dụng MoMo");
        }

        OwnerPaymentAccount paymentAccount = payment.getPaymentAccount();

        if (paymentAccount == null
                || paymentAccount.getProvider() != PaymentProvider.MOMO) {
            throw new BadRequestException("Giao dịch không có tài khoản MoMo hợp lệ");
        }

        MomoCredential credential = momoCredentialRepository
                .findByPaymentAccount_Id(paymentAccount.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin MoMo của chủ sân"));

        if (!credential.getPartnerCode()
                .equals(request.getPartnerCode())) {
            throw new BadRequestException("Partner code MoMo không hợp lệ");
        }

        validateMomoIpnSignature(request, credential);

        BigDecimal momoAmount = BigDecimal.valueOf(request.getAmount());

        if (payment.getAmount().compareTo(momoAmount) != 0) {
            throw new BadRequestException("Số tiền thanh toán không khớp");
        }

        if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.REFUNDED) {
            return;
        }

        if (request.getResultCode() != 0) {

            if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }

            return;
        }

        LocalDateTime now = LocalDateTime.now();

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(now);

        paymentRepository.save(payment);

        Booking booking = payment.getBooking();

        LocalDateTime cutoff = now.minusMinutes(paymentTimeoutMinutes);

        boolean bookingTimedOut = booking.getCreatedAt() != null && !booking.getCreatedAt().isAfter(cutoff);

        boolean bookingExpired = booking.getStatus() == BookingStatus.EXPIRED
                || (booking.getStatus() == BookingStatus.PENDING && bookingTimedOut);

        if (bookingExpired) {
            return;
        }

        BigDecimal paidAmount = booking.getPayments()
                .stream()
                .filter(item -> item.getStatus() == PaymentStatus.PAID)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (booking.getStatus() == BookingStatus.PENDING && paidAmount.compareTo(booking.getRequiredDeposit()) >= 0) {

            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
        }
    }

    private void validateMomoIpnSignature(MomoIpnRequest request, MomoCredential credential) {

        String accessKey = credentialEncryptionService.decrypt(credential.getAccessKey());

        String secretKey = credentialEncryptionService.decrypt(credential.getSecretKey());

        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + request.getAmount()
                + "&extraData=" + request.getExtraData()
                + "&message=" + request.getMessage()
                + "&orderId=" + request.getOrderId()
                + "&orderInfo=" + request.getOrderInfo()
                + "&orderType=" + request.getOrderType()
                + "&partnerCode=" + request.getPartnerCode()
                + "&payType=" + request.getPayType()
                + "&requestId=" + request.getRequestId()
                + "&responseTime=" + request.getResponseTime()
                + "&resultCode=" + request.getResultCode()
                + "&transId=" + request.getTransId();

        String expectedSignature = HmacUtils.hmacSha256(rawSignature, secretKey);

        boolean valid = MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8),
                request.getSignature().toLowerCase().getBytes(StandardCharsets.UTF_8));

        if (!valid) {
            throw new BadRequestException("Chữ ký IPN MoMo không hợp lệ");
        }
    }

    private PaymentProvider getProvider(PaymentMethod method) {
        return switch (method) {
            case MOMO -> PaymentProvider.MOMO;
            case VNPAY -> PaymentProvider.VNPAY;
            case CASH -> throw new BadRequestException("Tiền mặt không sử dụng tài khoản thanh toán online");
        };
    }
}