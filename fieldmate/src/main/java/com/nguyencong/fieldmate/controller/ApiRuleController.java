package com.nguyencong.fieldmate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.RuleRequest;
import com.nguyencong.fieldmate.dto.response.RuleResponse;
import com.nguyencong.fieldmate.service.RuleService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Rule")
@RestController
@RequestMapping("/api")
public class ApiRuleController {
    @Autowired
    private RuleService ruleService;

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PostMapping("/secure/venues/{id}/rules")
    public ResponseEntity<RuleResponse> createRule(
            @PathVariable Long id,
            @Valid @RequestBody RuleRequest request) {

        return new ResponseEntity<>(this.ruleService.createRule(id, request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PutMapping("/secure/rules/{id}")
    public ResponseEntity<RuleResponse> updateRule(
            @PathVariable Long id,
            @Valid @RequestBody RuleRequest request) {

        return new ResponseEntity<>(this.ruleService.updateRule(id, request), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @DeleteMapping("/secure/rules/{id}")
    public ResponseEntity<Void> deleteRule(
            @PathVariable Long id) {

        ruleService.deleteRule(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
