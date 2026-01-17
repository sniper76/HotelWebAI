package com.hotel.service;

import com.hotel.dto.HotelRoomDto;
import com.hotel.dto.ReservationDto;
import com.hotel.dto.HotelDto;
import com.hotel.entity.Hotel;
import com.hotel.entity.Reservation;
import com.hotel.entity.Room;
import com.hotel.entity.User;
import com.hotel.repository.HotelRepository;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    private final HotelRepository hotelRepository;
    private final com.hotel.repository.DiscountPolicyRepository discountPolicyRepository;

    @Transactional(readOnly = true)
    public List<ReservationDto.AvailableRoomResponse> searchAvailableRooms(java.time.LocalDateTime checkIn,
            java.time.LocalDateTime checkOut,
            Integer guests) {
        List<Room> allRooms = roomRepository.findAll();
        List<ReservationDto.AvailableRoomResponse> availableRooms = new ArrayList<>();

        for (Room room : allRooms) {
            if (isRoomAvailable(room.getId(), checkIn, checkOut, false)) { // Check standard availability
                availableRooms.add(ReservationDto.AvailableRoomResponse.builder()
                        .hotelId(room.getRoomType().getHotel().getId())
                        .hotelName(room.getRoomType().getHotel().getName())
                        .roomId(room.getId())
                        .roomNumber(room.getRoomNumber())
                        .roomType(room.getRoomType().getName())
                        .capacity(room.getRoomType().getCapacity())
                        .price(room.getRoomType().getBasePrice()) // Deprecated
                        .priceKrw(room.getRoomType().getPriceKrw())
                        .priceUsd(room.getRoomType().getPriceUsd())
                        .pricePhp(room.getRoomType().getPricePhp())
                        .build());
            }
        }
        return availableRooms;
    }

    @Transactional
    public ReservationDto.ReservationResponse createReservation(ReservationDto.CreateReservationRequest request,
            String username) {
        User user = userRepository.findByUsername(username).orElseThrow();

        List<HotelRoomDto> rooms = roomRepository.findHotelRoomsAllById(
                request.getRoomIds());

        // Validate availability for ALL rooms
        for (HotelRoomDto room : rooms) {
            if (!isRoomAvailable(room.getRoom().getId(), request.getCheckInTime(), request.getCheckOutTime(),
                    request.isLateCheckout())) {
                throw new RuntimeException(
                        "Room " + room.getRoom().getRoomNumber() + " is not available for the selected dates.");
            }
        }

        Map<Long, List<HotelRoomDto>> roomsByHotelId = rooms.stream()
                .collect(Collectors.groupingBy(
                        dto -> dto.getHotel().getId()));

        AtomicReference<Long> firstSavedId = new AtomicReference<>(0l);
        roomsByHotelId.forEach((hotelId, roomList) -> {
            // Calculate total price based on NIGHTS (Dates)
            BigDecimal totalPrice = BigDecimal.ZERO;
            long nights = java.time.temporal.ChronoUnit.DAYS.between(
                    request.getCheckInTime().toLocalDate(),
                    request.getCheckOutTime().toLocalDate());

            if (nights < 1)
                nights = 1; // Minimum 1 night

            for (HotelRoomDto room : roomList) {
                BigDecimal pricePerNight;
                String currency = request.getCurrency();
                if ("KRW".equalsIgnoreCase(currency)) {
                    pricePerNight = room.getRoom().getRoomType().getPriceKrw();
                } else if ("PHP".equalsIgnoreCase(currency)) {
                    pricePerNight = room.getRoom().getRoomType().getPricePhp();
                } else {
                    pricePerNight = room.getRoom().getRoomType().getPriceUsd(); // Default to USD
                }

                if (pricePerNight == null) {
                    pricePerNight = room.getRoom().getRoomType().getBasePrice();
                }

                BigDecimal roomPrice = pricePerNight.multiply(BigDecimal.valueOf(nights));
                totalPrice = totalPrice.add(roomPrice);
            }

            // Apply Discount Logic
            List<com.hotel.entity.DiscountPolicy> policies = discountPolicyRepository.findByHotelId(hotelId);
            BigDecimal discountAmount = BigDecimal.ZERO;
            String appliedPolicyName = null;

            com.hotel.entity.DiscountPolicy bestPolicy = null;
            BigDecimal maxDiscount = BigDecimal.ZERO;

            for (com.hotel.entity.DiscountPolicy policy : policies) {
                if (paymentEligibleForDiscount(nights, policy.getMinDays())) {
                    BigDecimal currentDiscount = BigDecimal.ZERO;
                    if (policy.getType() == com.hotel.entity.DiscountPolicy.DiscountType.PERCENTAGE) {
                        if (policy.getDiscountRate() != null) {
                            currentDiscount = totalPrice.multiply(policy.getDiscountRate())
                                    .divide(BigDecimal.valueOf(100));
                        }
                    } else if (policy.getType() == com.hotel.entity.DiscountPolicy.DiscountType.FIXED_AMOUNT) {
                        if (policy.getDiscountAmount() != null) {
                            currentDiscount = policy.getDiscountAmount().multiply(BigDecimal.valueOf(nights));
                        }
                    }

                    if (currentDiscount.compareTo(maxDiscount) > 0) {
                        maxDiscount = currentDiscount;
                        bestPolicy = policy;
                    }
                }
            }

            if (bestPolicy != null) {
                discountAmount = maxDiscount;
                appliedPolicyName = bestPolicy.getName();
                totalPrice = totalPrice.subtract(discountAmount);
                if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
                    totalPrice = BigDecimal.ZERO;
                }
            }

            Reservation reservation = Reservation.builder()
                    .user(user)
                    .checkInTime(request.getCheckInTime())
                    .checkOutTime(request.getCheckOutTime())
                    .isLateCheckout(request.isLateCheckout())
                    .status(Reservation.ReservationStatus.PENDING)
                    .totalPrice(totalPrice)
                    .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                    .discountPrice(discountAmount)
                    .discountPolicyName(appliedPolicyName)
                    .rooms(roomList.stream().map(HotelRoomDto::getRoom).toList())
                    .build();

            Reservation saved = reservationRepository.save(reservation);
            firstSavedId.set(saved.getId());
        });

        return mapToReservationResponse(
                reservationRepository.findById(firstSavedId.get())
                        .orElseThrow());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto.ReservationResponse> getMyReservations(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return reservationRepository.findByUserId(user.getId()).stream()
                .map(this::mapToReservationResponse)
                .collect(Collectors.toList());
    }

    private boolean isRoomAvailable(Long roomId, java.time.LocalDateTime checkIn, java.time.LocalDateTime checkOut,
            boolean isLateCheckout) {
        // 1. Check strict overlap with LocalDateTime
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(roomId, checkIn, checkOut);
        if (!conflicts.isEmpty())
            return false;
        return true;
    }

    @Transactional
    public ReservationDto.ReservationResponse checkIn(Long reservationId, String username) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        validateReservationAccess(reservation, username);

        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING &&
                reservation.getStatus() != Reservation.ReservationStatus.CONFIRMED) {
            throw new RuntimeException("Reservation is not in a valid state for check-in");
        }

        reservation.setStatus(Reservation.ReservationStatus.CHECKED_IN);
        reservation.setActualCheckInTime(java.time.LocalDateTime.now());

        return mapToReservationResponse(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationDto.ReservationResponse checkOut(Long reservationId, String username) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        validateReservationAccess(reservation, username);

        if (reservation.getStatus() != Reservation.ReservationStatus.CHECKED_IN) {
            throw new RuntimeException("Reservation is not in a valid state for check-out");
        }

        reservation.setStatus(Reservation.ReservationStatus.CHECKED_OUT);
        reservation.setActualCheckOutTime(java.time.LocalDateTime.now());

        return mapToReservationResponse(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public List<ReservationDto.ReservationResponse> getSettlement(Long hotelId, LocalDate startDate,
            LocalDate endDate, String username) {
        validateHotelAccess(hotelId, username);

        // Start of day to End of day
        java.time.LocalDateTime start = startDate.atStartOfDay();
        java.time.LocalDateTime end = endDate.atTime(23, 59, 59);

        List<Reservation> reservations = reservationRepository.findSettlementReservations(hotelId, start, end);
        return reservations.stream()
                .map(this::mapToReservationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto.ReservationResponse> getManagerReservations(Long hotelId, LocalDate date,
            String username) {
        validateHotelAccess(hotelId, username);

        if (date == null)
            date = LocalDate.now();

        // Query for the whole day
        java.time.LocalDateTime start = date.atStartOfDay();
        java.time.LocalDateTime end = date.atTime(23, 59, 59);

        List<Reservation> reservations = reservationRepository.findManagerReservations(hotelId, start, end);
        return reservations.stream()
                .map(this::mapToReservationResponse)
                .collect(Collectors.toList());
    }

    private void validateReservationAccess(Reservation reservation, String username) {
        // Assume all rooms in reservation belong to same hotel (simplification)
        // Or check all.
        // For this task, getting the first room's hotel is enough.
        if (reservation.getRooms().isEmpty())
            return;
        Long hotelId = reservation.getRooms().get(0).getRoomType().getHotel().getId();
        validateHotelAccess(hotelId, username);
    }

    private void validateHotelAccess(Long hotelId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        if (user.getRole() == User.Role.ADMIN)
            return;

        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new RuntimeException("Hotel not found"));
        if (hotel.getOwner() == null || !hotel.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to access this hotel's data");
        }
    }

    private ReservationDto.ReservationResponse mapToReservationResponse(Reservation reservation) {
        return ReservationDto.ReservationResponse.builder()
                .id(reservation.getId())
                .checkInTime(reservation.getCheckInTime())
                .checkOutTime(reservation.getCheckOutTime())
                .isLateCheckout(reservation.isLateCheckout())
                .status(reservation.getStatus().name())
                .totalPrice(reservation.getTotalPrice())
                .currency(reservation.getCurrency())
                .discountPrice(reservation.getDiscountPrice())
                .discountPolicyName(reservation.getDiscountPolicyName())
                .actualCheckInTime(reservation.getActualCheckInTime())
                .actualCheckOutTime(reservation.getActualCheckOutTime())
                .guestName(reservation.getUser().getFullName())
                .guestEmail(reservation.getUser().getEmail())
                .rooms(reservation.getRooms().stream()
                        .map(r -> HotelDto.RoomResponse.builder()
                                .id(r.getId())
                                .roomNumber(r.getRoomNumber())
                                .hotel(mapToHotelResponse(r.getRoomType().getHotel()))
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private HotelDto.HotelResponse mapToHotelResponse(Hotel hotel) {
        return HotelDto.HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .address(hotel.getAddress())
                .description(hotel.getDescription())
                .accountHolder(hotel.getAccountHolder())
                .accountNumber(hotel.getAccountNumber())
                .bankName(hotel.getBankName())
                .build();
    }

    private boolean paymentEligibleForDiscount(long nights, Integer minDays) {
        if (minDays == null)
            return true;
        return nights >= minDays;
    }
}
