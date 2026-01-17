package com.hotel.service;

import com.hotel.dto.DiscountPolicyDto;
import com.hotel.entity.DiscountPolicy;
import com.hotel.entity.Hotel;
import com.hotel.entity.User;
import com.hotel.repository.DiscountPolicyRepository;
import com.hotel.repository.HotelRepository;
import com.hotel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountPolicyRepository discountPolicyRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DiscountPolicyDto> getPolicies(Long hotelId, String username) {
        validateHotelAccess(hotelId, username);
        return discountPolicyRepository.findByHotelId(hotelId).stream()
                .map(DiscountPolicyDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public DiscountPolicyDto createPolicy(DiscountPolicyDto dto, String username) {
        validateHotelAccess(dto.getHotelId(), username);

        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        DiscountPolicy policy = DiscountPolicy.builder()
                .name(dto.getName())
                .minDays(dto.getMinDays())
                .type(DiscountPolicy.DiscountType.valueOf(dto.getType()))
                .discountRate(dto.getDiscountRate())
                .discountAmount(dto.getDiscountAmount())
                .hotel(hotel)
                .build();

        return DiscountPolicyDto.from(discountPolicyRepository.save(policy));
    }

    @Transactional
    public void deletePolicy(Long id, String username) {
        DiscountPolicy policy = discountPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        validateHotelAccess(policy.getHotel().getId(), username);

        discountPolicyRepository.delete(policy);
    }

    private void validateHotelAccess(Long hotelId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        if (user.getRole() == User.Role.ADMIN)
            return;

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        if (hotel.getOwner() == null || !hotel.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }
    }
}
