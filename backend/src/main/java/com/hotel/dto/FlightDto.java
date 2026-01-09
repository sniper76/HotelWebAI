package com.hotel.dto;

import lombok.Data;
import java.time.LocalTime;

public class FlightDto {

    @Data
    public static class AirlineRequest {
        private String name;
        private String code;
        private String useYn;
    }

    @Data
    public static class AirlineResponse {
        private Long id;
        private String name;
        private String code;
        private String useYn;

        public AirlineResponse(Long id, String name, String code) {
            this.id = id;
            this.name = name;
            this.code = code;
        }
    }

    @Data
    public static class FlightTicketRequest {
        private Long airlineId;
        private String departureAirport;
        private LocalTime departureTime;
        private String arrivalAirport;
        private LocalTime arrivalTime;
        private String useYn;
    }

    @Data
    public static class FlightTicketResponse {
        private Long id;
        private Long airlineId;
        private String airlineName;
        private String departureAirport;
        private LocalTime departureTime;
        private String arrivalAirport;
        private LocalTime arrivalTime;
        private String useYn;

        public FlightTicketResponse(Long id, Long airlineId, String airlineName, String departureAirport,
                LocalTime departureTime, String arrivalAirport, LocalTime arrivalTime) {
            this.id = id;
            this.airlineId = airlineId;
            this.airlineName = airlineName;
            this.departureAirport = departureAirport;
            this.departureTime = departureTime;
            this.arrivalAirport = arrivalAirport;
            this.arrivalTime = arrivalTime;
        }
    }
}
