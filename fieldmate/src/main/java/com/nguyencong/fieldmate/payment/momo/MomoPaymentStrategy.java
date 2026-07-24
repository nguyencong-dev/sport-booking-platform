package com.nguyencong.fieldmate.payment.momo;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.nguyencong.fieldmate.config.MomoConfig;
import com.nguyencong.fieldmate.dto.request.MomoCreateRequest;
import com.nguyencong.fieldmate.dto.response.MomoCreateResponse;
import com.nguyencong.fieldmate.entity.MomoCredential;
import com.nguyencong.fieldmate.entity.OwnerPaymentAccount;
import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentMethod;
import com.nguyencong.fieldmate.entity.enums.PaymentProvider;
import com.nguyencong.fieldmate.exception.BusinessRuleViolationException;
import com.nguyencong.fieldmate.payment.PaymentGatewayResult;
import com.nguyencong.fieldmate.payment.PaymentGatewayStrategy;
import com.nguyencong.fieldmate.repository.MomoCredentialRepository;
import com.nguyencong.fieldmate.service.CredentialEncryptionService;
import com.nguyencong.fieldmate.utils.HmacUtils;

@Service
public class MomoPaymentStrategy implements PaymentGatewayStrategy {
    @Autowired
    private MomoCredentialRepository momoCredentialRepository;
    @Autowired
    private MomoConfig momoConfig;
    @Autowired
    @Qualifier("momoRestClient")
    private RestClient momoRestClient;
    @Autowired
    private CredentialEncryptionService credentialEncryptionService;

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.MOMO;
    }

    @Override
    public PaymentGatewayResult createPayment(Payment payment) {

        OwnerPaymentAccount account = payment.getPaymentAccount();

        if (account == null
                || account.getProvider() != PaymentProvider.MOMO
                || account.getStatus() != PaymentAccountStatus.ACTIVE) {
            throw new BusinessRuleViolationException(
                    "Tài khoản MoMo của chủ sân không hoạt động");
        }

        MomoCredential credential = momoCredentialRepository
                .findByPaymentAccount_Id(account.getId())
                .orElseThrow(() -> new BusinessRuleViolationException("Không tìm thấy thông tin MoMo của chủ sân"));

        String accessKey = credentialEncryptionService.decrypt(credential.getAccessKey());

        String secretKey = credentialEncryptionService.decrypt(credential.getSecretKey());

        MomoCreateRequest request = createRequest(payment, credential, accessKey, secretKey);

        MomoCreateResponse response = momoRestClient.post()
                .uri(momoConfig.getCreatePath())
                .body(request)
                .retrieve()
                .body(MomoCreateResponse.class);

        if (response == null) {
            throw new IllegalStateException("MoMo không phản hồi");
        }

        if (response.getResultCode() == null || response.getResultCode() != 0) {
            throw new IllegalStateException(
                    "Không thể khởi tạo thanh toán MoMo: "
                            + response.getMessage());
        }

        return new PaymentGatewayResult(
                response.getPayUrl(),
                response.getDeeplink(),
                response.getQrCodeUrl(),
                request.getRequestId());
    }

    private MomoCreateRequest createRequest(Payment payment, MomoCredential credential, String accessKey,
            String secretKey) {

        String orderId = payment.getTransactionCode();

        String requestId = "REQ_" + UUID.randomUUID().toString().replace("-", "");

        long amount = payment.getAmount().longValueExact();

        String orderInfo = "Thanh toan booking " + payment.getBooking().getId();

        String extraData = "";

        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + momoConfig.getIpnUrl()
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + credential.getPartnerCode()
                + "&redirectUrl=" + momoConfig.getRedirectUrl()
                + "&requestId=" + requestId
                + "&requestType=" + momoConfig.getRequestType();

        String signature = HmacUtils.hmacSha256(rawSignature, secretKey);

        return MomoCreateRequest.builder()
                .partnerCode(credential.getPartnerCode())
                .requestType(momoConfig.getRequestType())
                .ipnUrl(momoConfig.getIpnUrl())
                .redirectUrl(momoConfig.getRedirectUrl())
                .orderId(orderId)
                .amount(amount)
                .orderInfo(orderInfo)
                .requestId(requestId)
                .extraData(extraData)
                .signature(signature)
                .lang(momoConfig.getLanguage())
                .build();
    }
}
