package com.nguyencong.fieldmate.payment.momo;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.nguyencong.fieldmate.config.MomoConfig;
import com.nguyencong.fieldmate.dto.request.MomoCreateRequest;
import com.nguyencong.fieldmate.dto.response.MomoCreateResponse;
import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.entity.enums.PaymentMethod;
import com.nguyencong.fieldmate.payment.PaymentGatewayResult;
import com.nguyencong.fieldmate.payment.PaymentGatewayStrategy;
import com.nguyencong.fieldmate.utils.HmacUtils;

@Service
public class MomoPaymentStrategy implements PaymentGatewayStrategy {

    private final MomoConfig momoConfig;
    private final RestClient momoRestClient;

    public MomoPaymentStrategy(
            MomoConfig momoConfig,
            @Qualifier("momoRestClient")
            RestClient momoRestClient) {

        this.momoConfig = momoConfig;
        this.momoRestClient = momoRestClient;
    }

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.MOMO;
    }

    @Override
    public PaymentGatewayResult createPayment(Payment payment) {

        MomoCreateRequest request = createRequest(payment);

        MomoCreateResponse response =momoRestClient.post()
                        .uri(momoConfig.getCreatePath())
                        .body(request)
                        .retrieve()
                        .body(MomoCreateResponse.class);

        if (response == null) {
            throw new IllegalStateException("MoMo không phản hồi");
        }

        if (response.getResultCode() == null || response.getResultCode() != 0) {
            throw new IllegalStateException("Không thể khởi tạo thanh toán MoMo: " + response.getMessage());
        }

        return new PaymentGatewayResult(
                response.getPayUrl(),
                response.getDeeplink(),
                response.getQrCodeUrl(),
                request.getRequestId());
    }

    private MomoCreateRequest createRequest(Payment payment) {

        String orderId = payment.getTransactionCode();

        String requestId = "REQ_" + UUID.randomUUID().toString().replace("-", "");

        long amount = payment.getAmount().longValueExact();

        String orderInfo = "Thanh toan booking " + payment.getBooking().getId();

        String extraData = "";

        String rawSignature =
                "accessKey="
                        + momoConfig.getAccessKey()
                        + "&amount="
                        + amount
                        + "&extraData="
                        + extraData
                        + "&ipnUrl="
                        + momoConfig.getIpnUrl()
                        + "&orderId="
                        + orderId
                        + "&orderInfo="
                        + orderInfo
                        + "&partnerCode="
                        + momoConfig.getPartnerCode()
                        + "&redirectUrl="
                        + momoConfig.getRedirectUrl()
                        + "&requestId="
                        + requestId
                        + "&requestType="
                        + momoConfig.getRequestType();

        String signature = HmacUtils.hmacSha256(rawSignature, momoConfig.getSecretKey());

        return MomoCreateRequest.builder()
                .partnerCode(momoConfig.getPartnerCode())
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
