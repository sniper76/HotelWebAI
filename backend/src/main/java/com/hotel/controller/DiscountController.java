package com.hotel.controller;

import com.hotel.dto.DiscountPolicyDto;
import com.hotel.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<DiscountPolicyDto>> getPolicies(
            @RequestParam Long hotelId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(discountService.getPolicies(hotelId, userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<DiscountPolicyDto> createPolicy(
            @RequestBody DiscountPolicyDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(discountService.createPolicy(dto, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> deletePolicy(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        discountService.deletePolicy(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
