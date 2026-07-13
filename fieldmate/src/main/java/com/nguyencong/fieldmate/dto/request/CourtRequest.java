package com.nguyencong.fieldmate.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourtRequest {

    @NotBlank
    private String name;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal pricePerHour;

    @NotNull
    private Long sportTypeId;
}