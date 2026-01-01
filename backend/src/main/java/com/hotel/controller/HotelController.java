package com.hotel.controller;

import com.hotel.dto.HotelDto;
import com.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @PostMapping("/hotels")
    public ResponseEntity<HotelDto.HotelResponse> createHotel(
            @RequestBody HotelDto.HotelRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(hotelService.createHotel(request, userDetails.getUsername()));
    }

    @GetMapping("/hotels")
    public ResponseEntity<List<HotelDto.HotelResponse>> getMyHotels(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(hotelService.getMyHotels(userDetails.getUsername()));
    }

    @PostMapping("/hotels/{hotelId}/room-types")
    public ResponseEntity<HotelDto.RoomTypeResponse> addRoomType(
            @PathVariable Long hotelId,
            @RequestBody HotelDto.RoomTypeRequest request) {
        return ResponseEntity.ok(hotelService.addRoomType(hotelId, request));
    }

    @PostMapping("/room-types/{roomTypeId}/rooms")
    public ResponseEntity<HotelDto.RoomResponse> addRoom(
            @PathVariable Long roomTypeId,
            @RequestBody HotelDto.RoomRequest request) {
        return ResponseEntity.ok(hotelService.addRoom(roomTypeId, request));
    }

    @PutMapping("/hotels/{hotelId}")
    public ResponseEntity<HotelDto.HotelResponse> updateHotel(
            @PathVariable Long hotelId,
            @RequestBody HotelDto.HotelRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(hotelService.updateHotel(hotelId, request, userDetails.getUsername()));
    }

    @PutMapping("/room-types/{roomTypeId}")
    public ResponseEntity<HotelDto.RoomTypeResponse> updateRoomType(
            @PathVariable Long roomTypeId,
            @RequestBody HotelDto.RoomTypeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(hotelService.updateRoomType(roomTypeId, request, userDetails.getUsername()));
    }

    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<HotelDto.RoomResponse> updateRoom(
            @PathVariable Long roomId,
            @RequestBody HotelDto.RoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(hotelService.updateRoom(roomId, request, userDetails.getUsername()));
    }
}
