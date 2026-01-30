package com.hotel.controller;

import com.hotel.entity.AccessLog;
import com.hotel.repository.AccessLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/logs")
@RequiredArgsConstructor
public class AccessLogController {

    private final AccessLogRepository accessLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AccessLog>> getAccessLogs(
            @RequestParam(required = false) String searchIp,
            @PageableDefault(size = 20, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        if (searchIp != null && !searchIp.isEmpty()) {
            return ResponseEntity.ok(
                    accessLogRepository.findAllByClientIpContainingAndClientIpNot(searchIp, "113.199.42.24", pageable));
        }
        return ResponseEntity.ok(accessLogRepository.findAllByClientIpNot("113.199.42.24", pageable));
    }
}
