package com.hotel.controller;

import com.hotel.dto.ReservationDto;
import com.hotel.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping("/search")
    public ResponseEntity<List<ReservationDto.AvailableRoomResponse>> searchRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime checkInTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime checkOutTime,
            @RequestParam Integer guestCount) {
        return ResponseEntity.ok(reservationService.searchAvailableRooms(checkInTime, checkOutTime, guestCount));
    }

    @PostMapping
    public ResponseEntity<ReservationDto.ReservationResponse> createReservation(
            @RequestBody ReservationDto.CreateReservationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.createReservation(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<ReservationDto.ReservationResponse>> getMyReservations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.getMyReservations(userDetails.getUsername()));
    }

    @PutMapping("/{id}/check-in")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('OWNER')")
    public ResponseEntity<ReservationDto.ReservationResponse> checkIn(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.checkIn(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}/check-out")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('OWNER')")
    public ResponseEntity<ReservationDto.ReservationResponse> checkOut(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.checkOut(id, userDetails.getUsername()));
    }

    @GetMapping("/settlement")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('OWNER')")
    public ResponseEntity<List<ReservationDto.ReservationResponse>> getSettlement(
            @RequestParam Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity
                .ok(reservationService.getSettlement(hotelId, startDate, endDate, userDetails.getUsername()));
    }

    @GetMapping("/manager")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('OWNER')")
    public ResponseEntity<List<ReservationDto.ReservationResponse>> getManagerReservations(
            @RequestParam Long hotelId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reservationService.getManagerReservations(hotelId, date, userDetails.getUsername()));
    }
}
