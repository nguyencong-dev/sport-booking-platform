package com.nguyencong.fieldmate.service.impl;

import com.nguyencong.fieldmate.config.MomoConfig;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.dto.request.MomoIpnRequest;
import com.nguyencong.fieldmate.dto.request.PaymentRequest;
import com.nguyencong.fieldmate.dto.response.PaymentResponse;
import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.enums.BookingStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentMethod;
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
import com.nguyencong.fieldmate.repository.PaymentRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.PaymentService;
import com.nguyencong.fieldmate.utils.HmacUtils;
import java.security.MessageDigest;


@Service
public class PaymentServiceImpl implements PaymentService {
    @Autowired
    private MomoConfig momoConfig;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private CurrentUserProvider currentUserProvider;
    @Autowired
    private PaymentGatewayStrategyFactory strategyFactory;

    PaymentServiceImpl(MomoConfig momoConfig) {
        this.momoConfig = momoConfig;
    }

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

        boolean pendingPaymentExists = paymentRepository.existsByBookingIdAndStatus(bookingId, PaymentStatus.PENDING);

        if (pendingPaymentExists) {
            throw new BusinessRuleViolationException("Booking đang có một giao dịch chờ thanh toán");
        }

        BigDecimal paidAmount = calculatePaidAmount(booking);

        BigDecimal amount = calculatePaymentAmount(booking, paidAmount, request.getPaymentType());

        Payment payment = Payment.builder()
                .booking(booking)
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
    }

    private void validatePaymentMethod(
            PaymentMethod paymentMethod) {

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

        validateMomoIpnSignature(request);

        if (!momoConfig.getPartnerCode().equals(request.getPartnerCode())) {
            throw new BadRequestException("Partner code MoMo không hợp lệ");
        }

        Payment payment = paymentRepository.findByTransactionCode(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch"));

        if (payment.getPaymentMethod() != PaymentMethod.MOMO) {
            throw new BadRequestException("Giao dịch không sử dụng MoMo");
        }

        BigDecimal momoAmount = BigDecimal.valueOf(request.getAmount());

        if (payment.getAmount().compareTo(momoAmount) != 0) {
            throw new BadRequestException("Số tiền thanh toán không khớp");
        }

        if (payment.getStatus() == PaymentStatus.PAID) {
            return;
        }

        if (request.getResultCode() != 0) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return;
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());

        Booking booking = payment.getBooking();

        BigDecimal paidAmount = booking.getPayments().stream()
                .filter(item -> item.getStatus() == PaymentStatus.PAID)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (booking.getStatus() == BookingStatus.PENDING && paidAmount.compareTo(booking.getRequiredDeposit()) >= 0) {

            booking.setStatus(BookingStatus.CONFIRMED);
        }

        paymentRepository.save(payment);
        bookingRepository.save(booking);
    }

    private void validateMomoIpnSignature(MomoIpnRequest request) {

        String rawSignature = "accessKey=" + momoConfig.getAccessKey()
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

        String expectedSignature = HmacUtils.hmacSha256(rawSignature, momoConfig.getSecretKey());

        boolean valid = MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8),
                request.getSignature().toLowerCase().getBytes(StandardCharsets.UTF_8));

        if (!valid) {
            throw new BadRequestException("Chữ ký IPN MoMo không hợp lệ");
        }
    }
}