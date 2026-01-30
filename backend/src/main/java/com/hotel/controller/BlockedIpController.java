package com.hotel.controller;

import com.hotel.dto.BlockedIpDto;
import com.hotel.service.BlockedIpService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/blocked-ips")
@RequiredArgsConstructor
public class BlockedIpController {

    private final BlockedIpService blockedIpService;

    @GetMapping
    public ResponseEntity<Page<BlockedIpDto>> getAllBlockedIps(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(blockedIpService.getAllBlockedIps(pageable));
    }

    @PostMapping
    public ResponseEntity<Void> addBlockedIp(@RequestBody BlockedIpDto dto) {
        blockedIpService.addBlockedIp(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBlockedIp(@PathVariable Long id, @RequestBody BlockedIpDto dto) {
        blockedIpService.updateBlockedIp(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlockedIp(@PathVariable Long id) {
        blockedIpService.deleteBlockedIp(id);
        return ResponseEntity.ok().build();
    }
}
