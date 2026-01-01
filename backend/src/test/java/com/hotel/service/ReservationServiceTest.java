package com.hotel.service;

import com.hotel.dto.ReservationDto;
import com.hotel.entity.*;
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
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

        @Mock
        private ReservationRepository reservationRepository;
        @Mock
        private RoomRepository roomRepository;
        @Mock
        private UserRepository userRepository;

        @InjectMocks
        private ReservationService reservationService;

        private Room room;
        private User user;

        @BeforeEach
        void setUp() {
                Hotel hotel = Hotel.builder().id(1L).name("Test Hotel").build();
                RoomType roomType = RoomType.builder().id(1L).hotel(hotel).name("Deluxe")
                                .basePrice(BigDecimal.valueOf(100))
                                .capacity(2).build();
                room = Room.builder().id(1L).roomType(roomType).roomNumber("101").build();
                user = User.builder().id(1L).username("testuser").build();
        }

        @Test
        void searchAvailableRooms_ShouldReturnRoom_WhenNoConflicts() {
                when(roomRepository.findAll()).thenReturn(Collections.singletonList(room));
                when(reservationRepository.findConflictingReservations(anyLong(), any(), any()))
                                .thenReturn(Collections.emptyList());

                List<ReservationDto.AvailableRoomResponse> result = reservationService.searchAvailableRooms(
                                LocalDate.now(), LocalDate.now().plusDays(1), 2);

                assertFalse(result.isEmpty());
                assertEquals("101", result.get(0).getRoomNumber());
        }

        @Test
        void createReservation_ShouldSuccess_WhenRoomAvailable() {
                ReservationDto.CreateReservationRequest request = ReservationDto.CreateReservationRequest.builder()
                                .roomIds(Collections.singletonList(1L))
                                .checkInDate(LocalDate.now())
                                .checkOutDate(LocalDate.now().plusDays(1))
                                .isLateCheckout(false)
                                .build();

                when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
                when(roomRepository.findAllById(any())).thenReturn(Collections.singletonList(room));
                when(reservationRepository.findConflictingReservations(anyLong(), any(), any()))
                                .thenReturn(Collections.emptyList());
                when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArguments()[0]);

                ReservationDto.ReservationResponse response = reservationService.createReservation(request, "testuser");

                assertNotNull(response);
                assertEquals(BigDecimal.valueOf(100), response.getTotalPrice());
        }

        @Test
        void createReservation_ShouldFail_WhenRoomConflict() {
                ReservationDto.CreateReservationRequest request = ReservationDto.CreateReservationRequest.builder()
                                .roomIds(Collections.singletonList(1L))
                                .checkInDate(LocalDate.now())
                                .checkOutDate(LocalDate.now().plusDays(1))
                                .isLateCheckout(false)
                                .build();

                when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
                when(roomRepository.findAllById(any())).thenReturn(Collections.singletonList(room));
                when(reservationRepository.findConflictingReservations(anyLong(), any(), any()))
                                .thenReturn(Collections.singletonList(new Reservation()));

                assertThrows(RuntimeException.class, () -> reservationService.createReservation(request, "testuser"));
        }

        @Test
        void createReservation_shouldThrowException_whenRoomIsAlreadyBooked() {
                // Given
                ReservationDto.CreateReservationRequest request = ReservationDto.CreateReservationRequest.builder()
                                .roomIds(Collections.singletonList(1L))
                                .checkInDate(LocalDate.now())
                                .checkOutDate(LocalDate.now().plusDays(1))
                                .build();

                when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
                when(roomRepository.findAllById(any())).thenReturn(Collections.singletonList(room));
                // Mock conflict finding to return a list containing a reservation
                when(reservationRepository.findConflictingReservations(anyLong(), any(), any()))
                                .thenReturn(Collections.singletonList(new Reservation()));

                // When & Then
                RuntimeException exception = assertThrows(RuntimeException.class,
                                () -> reservationService.createReservation(request, "testuser"));

                // Optional: Verify message
                assertTrue(exception.getMessage().contains("not available"));
        }
}
