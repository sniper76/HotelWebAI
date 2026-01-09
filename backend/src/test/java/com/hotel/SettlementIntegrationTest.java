package com.hotel;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.dto.HotelDto;
import com.hotel.dto.HotelRoomDto;
import com.hotel.dto.ReservationDto;
import com.hotel.entity.*;
import com.hotel.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SettlementIntegrationTest {

        @Autowired
        private MockMvc mockMvc;
        @Autowired
        private ObjectMapper objectMapper;
        @Autowired
        private UserRepository userRepository;
        @Autowired
        private HotelRepository hotelRepository;
        @Autowired
        private RoomTypeRepository roomTypeRepository;
        @Autowired
        private RoomRepository roomRepository;
        @Autowired
        private ReservationRepository reservationRepository;
        @Autowired
        private PasswordEncoder passwordEncoder;

        private User owner;
        private User user1;
        private User user2;
        private Hotel hotelA;
        private Hotel hotelB;
        private Room roomA1;
        private Room roomB1;
        private Room roomA2;

        @BeforeEach
        void setUp() {
                reservationRepository.deleteAll();
                roomRepository.deleteAll();
                roomTypeRepository.deleteAll();
                hotelRepository.deleteAll();
                userRepository.deleteAll();
                userRepository.flush();

                // 1. Create Users
                owner = userRepository.save(User.builder()
                                .username("owner_settle")
                                .password(passwordEncoder.encode("password"))
                                .role(User.Role.OWNER)
                                .build());

                user1 = userRepository.save(User.builder()
                                .username("user1_settle")
                                .password(passwordEncoder.encode("password"))
                                .role(User.Role.USER)
                                .build());

                user2 = userRepository.save(User.builder()
                                .username("user2_settle")
                                .password(passwordEncoder.encode("password"))
                                .role(User.Role.USER)
                                .build());

                // 2. Create Hotels
                hotelA = hotelRepository.save(Hotel.builder()
                                .name("Hotel A")
                                .address("Address A")
                                .owner(owner)
                                .build());

                hotelB = hotelRepository.save(Hotel.builder()
                                .name("Hotel B")
                                .address("Address B")
                                .owner(owner)
                                .build());

                // 3. Create Room Types
                RoomType typeA = roomTypeRepository.save(RoomType.builder()
                                .hotel(hotelA)
                                .name("Standard A")
                                .basePrice(new BigDecimal("100.00")) // 100 USD
                                .priceUsd(new BigDecimal("100.00"))
                                .capacity(2)
                                .build());

                RoomType typeB = roomTypeRepository.save(RoomType.builder()
                                .hotel(hotelB)
                                .name("Deluxe B")
                                .basePrice(new BigDecimal("200.00")) // 200 USD
                                .priceUsd(new BigDecimal("200.00"))
                                .capacity(2)
                                .build());

                // 4. Create Rooms
                roomA1 = roomRepository.save(Room.builder().roomType(typeA).roomNumber("101").build());
                roomA2 = roomRepository.save(Room.builder().roomType(typeA).roomNumber("102").build());
                roomB1 = roomRepository.save(Room.builder().roomType(typeB).roomNumber("201").build());
        }

        @Test
        @WithMockUser(username = "owner_settle", roles = "OWNER")
        void testSettlementLogic() throws Exception {
                // --- Scenario ---
                // User 1 books Hotel A (1 Night) = 100 USD
                // User 2 books Hotel A (2 Nights) = 200 USD
                // User 1 books Hotel B (1 Night) = 200 USD

                LocalDate today = LocalDate.now();
                LocalDate tomorrow = today.plusDays(1);
                LocalDate dayAfter = today.plusDays(2);

                // 1. Create Reservations
                createReservation(user1, roomA1, today, tomorrow, "USD");
                createReservation(user2, roomA2, today, dayAfter, "USD"); // 100 * 2 = 200
                createReservation(user1, roomB1, today, tomorrow, "USD"); // 200

                // 2. Perform Check-in and Check-out for ALL
                List<Reservation> allReservations = reservationRepository.findAll();
                for (Reservation res : allReservations) {
                        // Check In
                        mockMvc.perform(put("/api/reservations/" + res.getId() + "/check-in"))
                                        .andExpect(status().isOk());

                        // Check Out
                        mockMvc.perform(put("/api/reservations/" + res.getId() + "/check-out"))
                                        .andExpect(status().isOk());
                }

                // 3. Verify Settlement for Hotel A
                // Expected: Res 1 (100) + Res 2 (200) = 300 USD
                MvcResult resultA = mockMvc.perform(get("/api/reservations/settlement")
                                .param("hotelId", hotelA.getId().toString())
                                .param("startDate", today.toString())
                                .param("endDate", today.toString()))
                                .andExpect(status().isOk())
                                .andReturn();

                List<ReservationDto.ReservationResponse> settlementA = objectMapper.readValue(
                                resultA.getResponse().getContentAsString(),
                                objectMapper.getTypeFactory().constructCollectionType(List.class,
                                                ReservationDto.ReservationResponse.class));

                assertThat(settlementA).hasSize(2);
                BigDecimal totalA = settlementA.stream()
                                .map(ReservationDto.ReservationResponse::getTotalPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                assertThat(totalA).isEqualByComparingTo("300.00");

                // 4. Verify Settlement for Hotel B
                // Expected: Res 3 (200) = 200 USD
                MvcResult resultB = mockMvc.perform(get("/api/reservations/settlement")
                                .param("hotelId", hotelB.getId().toString())
                                .param("startDate", today.toString())
                                .param("endDate", today.toString()))
                                .andExpect(status().isOk())
                                .andReturn();

                List<ReservationDto.ReservationResponse> settlementB = objectMapper.readValue(
                                resultB.getResponse().getContentAsString(),
                                objectMapper.getTypeFactory().constructCollectionType(List.class,
                                                ReservationDto.ReservationResponse.class));

                assertThat(settlementB).hasSize(1);
                BigDecimal totalB = settlementB.stream()
                                .map(ReservationDto.ReservationResponse::getTotalPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                assertThat(totalB).isEqualByComparingTo("200.00");
        }

        private void createReservation(User user, Room room, LocalDate checkIn, LocalDate checkOut, String currency)
                        throws Exception {
                BigDecimal pricePerNight = room.getRoomType().getPriceUsd();
                long nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
                BigDecimal totalPrice = pricePerNight.multiply(BigDecimal.valueOf(nights));

                Reservation res = Reservation.builder()
                                .user(user)
                                .rooms(new ArrayList<>(Collections.singletonList(room))) // Mutable List
                                .checkInTime(checkIn.atTime(13, 0))
                                .checkOutTime(checkOut.atTime(11, 0))
                                .totalPrice(totalPrice)
                                .currency(currency)
                                .status(Reservation.ReservationStatus.PENDING)
                                .isLateCheckout(false)
                                .build();

                reservationRepository.save(res);
        }
}
