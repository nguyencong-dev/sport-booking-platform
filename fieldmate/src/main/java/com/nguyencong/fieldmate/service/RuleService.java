package com.nguyencong.fieldmate.service;

import com.nguyencong.fieldmate.dto.request.RuleRequest;
import com.nguyencong.fieldmate.dto.response.RuleResponse;

public interface RuleService {

    RuleResponse createRule(Long venueId, RuleRequest request);
    RuleResponse updateRule(Long id, RuleRequest request);
    void deleteRule(Long id);
}