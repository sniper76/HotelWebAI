package com.hotel.repository;

import com.hotel.entity.DiscountPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscountPolicyRepository extends JpaRepository<DiscountPolicy, Long> {
    List<DiscountPolicy> findByHotelId(Long hotelId);
}
