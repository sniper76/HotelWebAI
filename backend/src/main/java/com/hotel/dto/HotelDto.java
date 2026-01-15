package com.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class HotelDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HotelRequest {
        private String name;
        private String address;
        private String description;
        private String bankName;
        private String accountHolder;
        private String accountNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HotelResponse {
        private Long id;
        private String name;
        private String address;
        private String description;
        private String bankName;
        private String accountHolder;
        private String accountNumber;
        private List<RoomTypeResponse> roomTypes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomTypeRequest {
        private String name;
        private String description;
        private Integer capacity;
        private BigDecimal basePrice;
        private BigDecimal priceKrw;
        private BigDecimal priceUsd;
        private BigDecimal pricePhp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomTypeResponse {
        private Long id;
        private String name;
        private String description;
        private Integer capacity;
        private BigDecimal basePrice;
        private BigDecimal priceKrw;
        private BigDecimal priceUsd;
        private BigDecimal pricePhp;
        private List<RoomResponse> rooms;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomRequest {
        private String roomNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomResponse {
        private Long id;
        private String roomNumber;
        private HotelResponse hotel;
    }
}
