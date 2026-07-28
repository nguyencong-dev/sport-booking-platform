package com.nguyencong.fieldmate.payment.vnpay;

import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.nguyencong.fieldmate.config.VnPayConfig;
import com.nguyencong.fieldmate.entity.OwnerPaymentAccount;
import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.entity.VnPayCredential;
import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentMethod;
import com.nguyencong.fieldmate.entity.enums.PaymentProvider;
import com.nguyencong.fieldmate.exception.BusinessRuleViolationException;
import com.nguyencong.fieldmate.payment.PaymentGatewayResult;
import com.nguyencong.fieldmate.payment.PaymentGatewayStrategy;
import com.nguyencong.fieldmate.repository.VnPayCredentialRepository;
import com.nguyencong.fieldmate.service.CredentialEncryptionService;
import com.nguyencong.fieldmate.utils.VnPayUtils;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class VnPayPaymentStrategy implements PaymentGatewayStrategy {

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Autowired
    private VnPayCredentialRepository vnPayCredentialRepository;

    @Autowired
    private CredentialEncryptionService credentialEncryptionService;

    @Autowired
    private VnPayConfig vnPayConfig;

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.VNPAY;
    }

    @Override
    public PaymentGatewayResult createPayment(Payment payment) {

        OwnerPaymentAccount account = payment.getPaymentAccount();

        if (account == null
                || account.getProvider() != PaymentProvider.VNPAY
                || account.getStatus() != PaymentAccountStatus.ACTIVE) {
            throw new BusinessRuleViolationException("Tài khoản VNPay của chủ sân không hoạt động");
        }

        VnPayCredential credential = vnPayCredentialRepository.findByPaymentAccount_Id(account.getId())
                .orElseThrow(() -> new BusinessRuleViolationException(
                        "Không tìm thấy thông tin VNPay của chủ sân"));

        String hashSecret = credentialEncryptionService.decrypt(credential.getHashSecret());

        Map<String, String> parameters = createParameters(payment, credential);

        String query = VnPayUtils.buildQuery(parameters);
        String secureHash = VnPayUtils.sign(parameters, hashSecret);
        String checkoutUrl = vnPayConfig.getPaymentUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;

        return new PaymentGatewayResult(
                checkoutUrl,
                null,
                null,
                payment.getTransactionCode());
    }

    private Map<String, String> createParameters(Payment payment, VnPayCredential credential) {

        LocalDateTime createTime = LocalDateTime.now(VIETNAM_ZONE);
        LocalDateTime expireTime = createTime.plusMinutes(vnPayConfig.getExpireMinutes());

        String amount = payment.getAmount()
                .movePointRight(2)
                .setScale(0, RoundingMode.UNNECESSARY)
                .toPlainString();

        Map<String, String> parameters = new LinkedHashMap<>();

        parameters.put("vnp_Version", vnPayConfig.getVersion());
        parameters.put("vnp_Command", vnPayConfig.getCommand());
        parameters.put("vnp_TmnCode", credential.getTmnCode().trim());
        parameters.put("vnp_Amount", amount);
        parameters.put("vnp_CurrCode", vnPayConfig.getCurrency());
        parameters.put("vnp_TxnRef", payment.getTransactionCode());
        parameters.put("vnp_OrderInfo", "Thanh toan booking " + payment.getBooking().getId());
        parameters.put("vnp_OrderType", vnPayConfig.getOrderType());
        parameters.put("vnp_Locale", vnPayConfig.getLocale());
        parameters.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        parameters.put("vnp_IpAddr", getClientIp());
        parameters.put("vnp_CreateDate", createTime.format(VNPAY_DATE_FORMAT));
        parameters.put("vnp_ExpireDate", expireTime.format(VNPAY_DATE_FORMAT));

        return parameters;
    }

    private String getClientIp() {

        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            return "127.0.0.1";
        }

        HttpServletRequest request = attributes.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }
}
