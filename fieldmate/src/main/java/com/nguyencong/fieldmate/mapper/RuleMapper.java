package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.request.RuleRequest;
import com.nguyencong.fieldmate.dto.response.RuleResponse;
import com.nguyencong.fieldmate.entity.Rule;

public class RuleMapper {

    private RuleMapper() {
    }

    public static RuleResponse toResponse(Rule rule) {
        if (rule == null) {
            return null;
        }

        return RuleResponse.builder()
                .id(rule.getId())
                .name(rule.getName())
                .build();
    }

    public static Rule toEntity(RuleRequest request) {
        if (request == null) {
            return null;
        }

        return Rule.builder()
                .name(request.getName().trim())
                .build();
    }

    public static void updateEntity(
            Rule rule,
            RuleRequest request) {

        if (rule == null || request == null) {
            return;
        }

        rule.setName(request.getName().trim());
    }
}