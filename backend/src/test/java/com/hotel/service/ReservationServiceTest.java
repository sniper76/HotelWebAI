package com.hotel.service;

import com.hotel.dto.HotelDto;
import com.hotel.dto.HotelRoomDto;
import com.hotel.dto.ReservationDto;
import com.hotel.entity.*;
import com.hotel.repository.HotelRepository;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

        @Mock
        private ReservationRepository reservationRepository;
        @Mock
        private RoomRepository roomRepository;
        @Mock
        private UserRepository userRepository;
        @Mock
        private HotelRepository hotelRepository;

        @InjectMocks
        private ReservationService reservationService;

        private Room room;
        private User user;
        private HotelRoomDto hotelRoomDto;

        @BeforeEach
        void setUp() {
                Hotel hotel = Hotel.builder().id(1L).name("Test Hotel").build();
                RoomType roomType = RoomType.builder().id(1L).hotel(hotel).name("Deluxe")
                                .basePrice(BigDecimal.valueOf(100))
                                .priceUsd(BigDecimal.valueOf(100))
                                .capacity(2).build();
                room = Room.builder().id(1L).roomType(roomType).roomNumber("101").build();
                user = User.builder().id(1L).username("testuser").build();

                hotelRoomDto = new HotelRoomDto() {
                        @Override
                        public Room getRoom() {
                                return room;
                        }

                        @Override
                        public Hotel getHotel() {
                                return hotel;
                        }
                };
        }

        @Test
        void searchAvailableRooms_ShouldReturnRoom_WhenNoConflicts() {
                when(roomRepository.findAll()).thenReturn(Collections.singletonList(room));
                when(reservationRepository.findConflictingReservations(anyLong(), any(), any()))
                                .thenReturn(Collections.emptyList());

                List<ReservationDto.AvailableRoomResponse> result = reservationService.searchAvailableRooms(
                                LocalDateTime.now(), LocalDateTime.now().plusDays(1), 2);

                assertFalse(result.isEmpty());
                assertEquals("101", result.get(0).getRoomNumber());
        }

        @Test
        void createReservation_ShouldSuccess_WhenRoomAvailable() {
                ReservationDto.CreateReservationRequest request = ReservationDto.CreateReservationRequest.builder()
                                .roomIds(Collections.singletonList(1L))
                                .checkInTime(LocalDateTime.now())
                                .checkOutTime(LocalDateTime.now().plusDays(1))
                                .isLateCheckout(false)
                                .build();

                when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
                when(roomRepository.findHotelRoomsAllById(any())).thenReturn(Collections.singletonList(hotelRoomDto));
                when(reservationRepository.findConflictingReservations(anyLong(), any(), any()))
                                .thenReturn(Collections.emptyList());
                when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> {
                        Reservation r = (Reservation) i.getArguments()[0];
                        r.setId(1L);
                        return r;
                });
                when(reservationRepository.findById(1L)).thenAnswer(i -> {
                        Reservation r = Reservation.builder()
                                        .id(1L)
                                        .user(user)
                                        .checkInTime(request.getCheckInTime())
                                        .checkOutTime(request.getCheckOutTime())
                                        .isLateCheckout(false)
                                        .status(Reservation.ReservationStatus.PENDING)
                                        .totalPrice(BigDecimal.valueOf(100))
                                        .currency("USD")
                                        .rooms(Collections.singletonList(room))
                                        .build();
                        return Optional.of(r);
                });

                ReservationDto.ReservationResponse response = reservationService.createReservation(request, "testuser");

                assertNotNull(response);
                assertEquals(BigDecimal.valueOf(100), response.getTotalPrice());
        }

        @Test
        void createReservation_ShouldFail_WhenRoomConflict() {
                ReservationDto.CreateReservationRequest request = ReservationDto.CreateReservationRequest.builder()
                                .roomIds(Collections.singletonList(1L))
                                .checkInTime(LocalDateTime.now())
                                .checkOutTime(LocalDateTime.now().plusDays(1))
                                .isLateCheckout(false)
                                .build();

                when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
                when(roomRepository.findHotelRoomsAllById(any())).thenReturn(Collections.singletonList(hotelRoomDto));
                when(reservationRepository.findConflictingReservations(anyLong(), any(), any()))
                                .thenReturn(Collections.singletonList(new Reservation()));

                assertThrows(RuntimeException.class, () -> reservationService.createReservation(request, "testuser"));
        }
}
