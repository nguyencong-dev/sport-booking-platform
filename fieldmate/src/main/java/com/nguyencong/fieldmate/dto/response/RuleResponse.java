package com.nguyencong.fieldmate.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RuleResponse {

    private Long id;
    private String name;
}