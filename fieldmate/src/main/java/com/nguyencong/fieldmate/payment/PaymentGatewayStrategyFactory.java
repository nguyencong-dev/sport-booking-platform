package com.nguyencong.fieldmate.payment;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.nguyencong.fieldmate.entity.enums.PaymentMethod;
import com.nguyencong.fieldmate.exception.BusinessRuleViolationException;

@Component
public class PaymentGatewayStrategyFactory {

    private final Map<PaymentMethod, PaymentGatewayStrategy> strategies;

    public PaymentGatewayStrategyFactory(List<PaymentGatewayStrategy> strategyList) {

        this.strategies = new EnumMap<>(PaymentMethod.class);

        for (PaymentGatewayStrategy strategy : strategyList) {

            PaymentMethod paymentMethod = strategy.getPaymentMethod();

            if (strategies.containsKey(paymentMethod)) {
                throw new IllegalStateException("Trùng strategy cho phương thức: " + paymentMethod);
            }

            strategies.put(paymentMethod, strategy);
        }
    }

    public PaymentGatewayStrategy getStrategy(PaymentMethod paymentMethod) {

        PaymentGatewayStrategy strategy = strategies.get(paymentMethod);

        if (strategy == null) {
            throw new BusinessRuleViolationException("Phương thức thanh toán chưa được hỗ trợ");
        }

        return strategy;
    }
}