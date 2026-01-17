package com.hotel;

import com.hotel.dto.DiscountPolicyDto;
import com.hotel.dto.HotelDto;
import com.hotel.dto.ReservationDto;
import com.hotel.entity.DiscountPolicy;
import com.hotel.entity.Hotel;
import com.hotel.entity.Room;
import com.hotel.entity.RoomType;
import com.hotel.entity.User;
import com.hotel.repository.DiscountPolicyRepository;
import com.hotel.repository.HotelRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.RoomTypeRepository;
import com.hotel.repository.UserRepository;
import com.hotel.service.DiscountService;
import com.hotel.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class DiscountIntegrationTest {

    @Autowired
    private DiscountService discountService;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DiscountPolicyRepository discountPolicyRepository;

    private User owner;
    private User guest;
    private Hotel hotel;
    private Room room;

    @BeforeEach
    void setUp() {
        // Create Owner
        owner = userRepository.findByUsername("owner1").orElseGet(() -> userRepository.save(User.builder()
                .username("owner1")
                .password("password")
                .role(User.Role.OWNER)
                .fullName("Owner One")
                .build()));

        // Create Guest
        guest = userRepository.findByUsername("guest1").orElseGet(() -> userRepository.save(User.builder()
                .username("guest1")
                .password("password")
                .role(User.Role.USER)
                .fullName("Guest One")
                .build()));

        // Create Hotel
        hotel = hotelRepository.save(Hotel.builder()
                .name("Discount Hotel")
                .owner(owner)
                .address("123 Street")
                .description("Test Hotel")
                .build());

        // Create RoomType
        RoomType roomType = roomTypeRepository.save(RoomType.builder()
                .hotel(hotel)
                .name("Standard")
                .basePrice(BigDecimal.valueOf(100)) // 100 USD
                .priceUsd(BigDecimal.valueOf(100))
                .capacity(2)
                .build());

        // Create Room
        room = roomRepository.save(Room.builder()
                .roomType(roomType)
                .roomNumber("101")
                .build());
    }

    @Test
    @DisplayName("Should apply percentage discount for long stay")
    @WithMockUser(username = "owner1", roles = "OWNER")
    void testPercentageDiscount() {
        // Given: 10% discount for 5+ nights
        DiscountPolicyDto policyDto = DiscountPolicyDto.builder()
                .name("Long Stay 10%")
                .minDays(5)
                .type("PERCENTAGE")
                .discountRate(BigDecimal.valueOf(10))
                .hotelId(hotel.getId())
                .build();

        discountService.createPolicy(policyDto, "owner1");

        // When: Book for 5 nights
        LocalDateTime checkIn = LocalDateTime.now().plusDays(1);
        LocalDateTime checkOut = checkIn.plusDays(5);

        ReservationDto.CreateReservationRequest request = ReservationDto.CreateReservationRequest.builder()
                .roomIds(Collections.singletonList(room.getId()))
                .checkInTime(checkIn)
                .checkOutTime(checkOut)
                .currency("USD")
                .build();

        ReservationDto.ReservationResponse response = reservationService.createReservation(request,
                guest.getUsername());

        // Then
        // Original Price: 100 * 5 = 500
        // Discount: 500 * 10% = 50
        // Total: 450
        assertEquals(0, BigDecimal.valueOf(450.00).compareTo(response.getTotalPrice()));
        assertEquals(0, BigDecimal.valueOf(50.00).compareTo(response.getDiscountPrice()));
        assertEquals("Long Stay 10%", response.getDiscountPolicyName());
    }

    @Test
    @DisplayName("Should apply fixed amount discount per night")
    @WithMockUser(username = "owner1", roles = "OWNER")
    void testFixedAmountDiscount() {
        // Given: 10 USD off per night for 3+ nights
        DiscountPolicyDto policyDto = DiscountPolicyDto.builder()
                .name("Special Promo")
                .minDays(3)
                .type("FIXED_AMOUNT")
                .discountAmount(BigDecimal.valueOf(10))
                .hotelId(hotel.getId())
                .build();

        discountService.createPolicy(policyDto, "owner1");

        // When: Book for 4 nights
        LocalDateTime checkIn = LocalDateTime.now().plusDays(10);
        LocalDateTime checkOut = checkIn.plusDays(4);

        ReservationDto.CreateReservationRequest request = ReservationDto.CreateReservationRequest.builder()
                .roomIds(Collections.singletonList(room.getId()))
                .checkInTime(checkIn)
                .checkOutTime(checkOut)
                .currency("USD")
                .build();

        ReservationDto.ReservationResponse response = reservationService.createReservation(request,
                guest.getUsername());

        // Then
        // Original Price: 100 * 4 = 400
        // Discount: 10 * 4 = 40
        // Total: 360
        assertEquals(0, BigDecimal.valueOf(360.00).compareTo(response.getTotalPrice()));
        assertEquals(0, BigDecimal.valueOf(40.00).compareTo(response.getDiscountPrice()));
        assertEquals("Special Promo", response.getDiscountPolicyName());
    }

    @Test
    @DisplayName("Should apply best discount when multiple overlap")
    @WithMockUser(username = "owner1", roles = "OWNER")
    void testBestDiscountSelection() {
        // Given:
        // Policy A: 5% for 3+ nights
        // Policy B: 10% for 5+ nights

        discountService.createPolicy(DiscountPolicyDto.builder()
                .name("Policy A")
                .minDays(3)
                .type("PERCENTAGE")
                .discountRate(BigDecimal.valueOf(5))
                .hotelId(hotel.getId())
                .build(), "owner1");

        discountService.createPolicy(DiscountPolicyDto.builder()
                .name("Policy B")
                .minDays(5)
                .type("PERCENTAGE")
                .discountRate(BigDecimal.valueOf(10))
                .hotelId(hotel.getId())
                .build(), "owner1");

        // When: Book for 5 nights
        LocalDateTime checkIn = LocalDateTime.now().plusDays(20);
        LocalDateTime checkOut = checkIn.plusDays(5);

        ReservationDto.CreateReservationRequest request = ReservationDto.CreateReservationRequest.builder()
                .roomIds(Collections.singletonList(room.getId()))
                .checkInTime(checkIn)
                .checkOutTime(checkOut)
                .currency("USD")
                .build();

        ReservationDto.ReservationResponse response = reservationService.createReservation(request,
                guest.getUsername());

        // Then
        // Should choose Policy B (10%)
        // Original: 500
        // Discount: 50
        // Total: 450
        assertEquals(0, BigDecimal.valueOf(450.00).compareTo(response.getTotalPrice()));
        assertEquals("Policy B", response.getDiscountPolicyName());
    }
}
