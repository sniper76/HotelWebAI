package com.hotel.dto;

import com.hotel.entity.DiscountPolicy;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DiscountPolicyDto {
    private Long id;
    private String name;
    private Integer minDays;
    private String type; // PERCENTAGE, FIXED_AMOUNT
    private BigDecimal discountRate;
    private BigDecimal discountAmount;
    private Long hotelId;

    public static DiscountPolicyDto from(DiscountPolicy policy) {
        return DiscountPolicyDto.builder()
                .id(policy.getId())
                .name(policy.getName())
                .minDays(policy.getMinDays())
                .type(policy.getType().name())
                .discountRate(policy.getDiscountRate())
                .discountAmount(policy.getDiscountAmount())
                .hotelId(policy.getHotel() != null ? policy.getHotel().getId() : null)
                .build();
    }
}
