package com.hotel;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.dto.HotelDto;
import com.hotel.dto.ReservationDto;
import com.hotel.dto.UserDto;
import com.hotel.entity.Hotel;
import com.hotel.entity.Room;
import com.hotel.entity.RoomType;
import com.hotel.entity.User;
import com.hotel.repository.HotelRepository;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.RoomTypeRepository;
import com.hotel.repository.UserRepository;
import com.hotel.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ReservationIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

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

        @Autowired
        private JwtUtil jwtUtil;

        @Autowired
        private ObjectMapper objectMapper;

        private User user1, user2, user3;
        private User manager1, manager2, manager3;
        private User admin1, admin2;
        private Hotel hotelA, hotelB, hotelC, hotelD, hotelE;
        private Room roomA101;

        @BeforeEach
        void setUp() {
                // Create Users
                user1 = createUser("user1", User.Role.USER);
                user2 = createUser("user2", User.Role.USER);
                user3 = createUser("user3", User.Role.USER);

                // Create Managers
                manager1 = createUser("manager1", User.Role.OWNER); // Manager 1 (1 Hotel)
                manager2 = createUser("manager2", User.Role.OWNER); // Manager 2 (2 Hotels)
                manager3 = createUser("manager3", User.Role.OWNER); // Manager 3 (2 Hotels)

                // Create Admins
                admin1 = createUser("admin1", User.Role.ADMIN);
                admin2 = createUser("admin2", User.Role.ADMIN);

                // Create Hotels
                hotelA = createHotel("Hotel A", manager1);
                hotelB = createHotel("Hotel B", manager2);
                hotelC = createHotel("Hotel C", manager2);
                hotelD = createHotel("Hotel D", manager3);
                hotelE = createHotel("Hotel E", manager3);

                // Create Room in Hotel A for User1 to book
                RoomType rtA = createRoomType(hotelA, "Deluxe", 2, new BigDecimal("100"));
                roomA101 = createRoom(rtA, "101");
        }

        private User createUser(String username, User.Role role) {
                return userRepository.save(User.builder()
                                .username(username)
                                .password(passwordEncoder.encode("password"))
                                .role(role)
                                .fullName(username + " FullName")
                                .email(username + "@test.com")
                                .build());
        }

        private Hotel createHotel(String name, User owner) {
                return hotelRepository.save(Hotel.builder()
                                .name(name)
                                .address("Address " + name)
                                .description("Description " + name)
                                .owner(owner)
                                .build());
        }

        private RoomType createRoomType(Hotel hotel, String name, int capacity, BigDecimal price) {
                return roomTypeRepository.save(RoomType.builder()
                                .hotel(hotel)
                                .name(name)
                                .capacity(capacity)
                                .basePrice(price)
                                .priceUsd(price)
                                .priceKrw(price.multiply(new BigDecimal("1300")))
                                .pricePhp(price.multiply(new BigDecimal("55")))
                                .build());
        }

        private Room createRoom(RoomType roomType, String roomNumber) {
                return roomRepository.save(Room.builder()
                                .roomType(roomType)
                                .roomNumber(roomNumber)
                                .build());
        }

        private String getToken(User user) {
                org.springframework.security.core.userdetails.UserDetails userDetails = org.springframework.security.core.userdetails.User
                                .builder()
                                .username(user.getUsername())
                                .password(user.getPassword())
                                .authorities("ROLE_" + user.getRole().name())
                                .build();
                return "Bearer " + jwtUtil.generateToken(userDetails);
        }

        @Test
        void testReservationFlow() throws Exception {
                // 1. User1 Reserves Room 101 in Hotel A
                ReservationDto.CreateReservationRequest reservationRequest = ReservationDto.CreateReservationRequest
                                .builder()
                                .roomIds(List.of(roomA101.getId()))
                                .checkInTime(LocalDate.now().atTime(13, 0))
                                .checkOutTime(LocalDate.now().plusDays(2).atTime(11, 0)) // 2 Nights
                                .isLateCheckout(false)
                                .currency("USD")
                                .build();

                String resJson = mockMvc.perform(post("/api/reservations")
                                .header("Authorization", getToken(user1))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(reservationRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("PENDING"))
                                .andExpect(jsonPath("$.totalPrice").value(200.0)) // 100 * 2
                                .andReturn().getResponse().getContentAsString();

                ReservationDto.ReservationResponse resResponse = objectMapper.readValue(resJson,
                                ReservationDto.ReservationResponse.class);
                Long reservationId = resResponse.getId();

                // 2. Manager1 Checks In User1
                mockMvc.perform(put("/api/reservations/" + reservationId + "/check-in")
                                .header("Authorization", getToken(manager1)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("CHECKED_IN"))
                                .andExpect(jsonPath("$.actualCheckInTime").isNotEmpty());

                // 3. Manager1 Checks Out User1
                mockMvc.perform(put("/api/reservations/" + reservationId + "/check-out")
                                .header("Authorization", getToken(manager1)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("CHECKED_OUT"))
                                .andExpect(jsonPath("$.actualCheckOutTime").isNotEmpty());

                // 4. Manager1 Views Settlement
                mockMvc.perform(get("/api/reservations/settlement")
                                .header("Authorization", getToken(manager1))
                                .param("hotelId", hotelA.getId().toString())
                                .param("startDate", LocalDate.now().toString())
                                .param("endDate", LocalDate.now().toString()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].id").value(reservationId))
                                .andExpect(jsonPath("$[0].totalPrice").value(200.0));

                // 5. Admin1 Views Settlement for Hotel A (Should succeed)
                mockMvc.perform(get("/api/reservations/settlement")
                                .header("Authorization", getToken(admin1))
                                .param("hotelId", hotelA.getId().toString())
                                .param("startDate", LocalDate.now().toString())
                                .param("endDate", LocalDate.now().toString()))
                                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1));

                // 6. Manager2 Views Settlement for Hotel A (Should fail or return
                // forbidden/empty?)
                // Since my implementation uses `@PreAuthorize("hasRole('ADMIN') or
                // hasRole('OWNER')")`
                // but DOES NOT check inside the method if the owner owns the hotel...
                // Wait, `findSettlementReservations` filters by `hotelId`.
                // BUT, does it check if the caller owns `hotelId`?
                // The Service just calls repo. Access control might be missing in Service!
                // As per request "만약 현재 소스에 오류가 있다면 수정해주세요", this is arguably a bug/security
                // flaw.
                // A Manager should not see another Manager's hotel settlement.

                // I will first assert what HAPPENS, then fixes if needed.
                // Currently, it probably returns the data because only Role is checked.

                // Let's verify if Manager2 CAN see Hotel A's data. If so, I need to fix it.
        }

        @Test
        void testManagerAccessControl() throws Exception {
                // Setup a checked-out reservation for Hotel A
                ReservationDto.CreateReservationRequest req = ReservationDto.CreateReservationRequest.builder()
                                .roomIds(List.of(roomA101.getId()))
                                .checkInTime(LocalDate.now().atTime(13, 0))
                                .checkOutTime(LocalDate.now().plusDays(1).atTime(11, 0))
                                .build();

                // Make reservation, checkin, checkout directly via repo/service to save time in
                // this test?
                // Or just use the flow.
                String resJson = mockMvc.perform(post("/api/reservations")
                                .header("Authorization", getToken(user1))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isOk())
                                .andReturn().getResponse().getContentAsString();
                ReservationDto.ReservationResponse res = objectMapper.readValue(resJson,
                                ReservationDto.ReservationResponse.class);

                mockMvc.perform(put("/api/reservations/" + res.getId() + "/check-in")
                                .header("Authorization", getToken(manager1))).andExpect(status().isOk());

                mockMvc.perform(put("/api/reservations/" + res.getId() + "/check-out")
                                .header("Authorization", getToken(manager1))).andExpect(status().isOk());

                // Manager 2 tries to access Hotel A settlement (Should Fail)
                mockMvc.perform(get("/api/reservations/settlement")
                                .header("Authorization", getToken(manager2))
                                .param("hotelId", hotelA.getId().toString())
                                .param("startDate", LocalDate.now().toString())
                                .param("endDate", LocalDate.now().toString()))
                                .andExpect(result -> {
                                        // It could be 500 (RuntimeException) or 403.
                                        // Since I threw RuntimeException, it will be mapped to 500 or handled by
                                        // GlobalExceptionHandler if exists.
                                        // Let's expect not 2xx.
                                        if (result.getResponse().getStatus() >= 200
                                                        && result.getResponse().getStatus() < 300) {
                                                throw new AssertionError("Expected failure but got "
                                                                + result.getResponse().getStatus());
                                        }
                                });
        }
}
