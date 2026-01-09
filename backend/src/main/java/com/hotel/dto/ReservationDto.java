package com.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReservationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchRequest {
        private java.time.LocalDateTime checkInTime;
        private java.time.LocalDateTime checkOutTime;
        private Integer guestCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReservationRequest {
        private List<Long> roomIds;
        private java.time.LocalDateTime checkInTime;
        private java.time.LocalDateTime checkOutTime;
        private boolean isLateCheckout;
        private String currency; // KRW, USD, PHP
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservationResponse {
        private Long id;
        private java.time.LocalDateTime checkInTime;
        private java.time.LocalDateTime checkOutTime;
        private boolean isLateCheckout;
        private String status;
        private BigDecimal totalPrice;
        private String currency;
        private List<HotelDto.RoomResponse> rooms;
        private java.time.LocalDateTime actualCheckInTime;
        private java.time.LocalDateTime actualCheckOutTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailableRoomResponse {
        private Long hotelId;
        private String hotelName;
        private Long roomId;
        private String roomNumber;
        private String roomType;
        private Integer capacity;
        private BigDecimal price; // Deprecated or default
        private BigDecimal priceKrw;
        private BigDecimal priceUsd;
        private BigDecimal pricePhp;
    }
}
