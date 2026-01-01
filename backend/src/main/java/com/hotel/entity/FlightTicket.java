package com.hotel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "flight_tickets")
public class FlightTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "airline_id", nullable = false)
    private Airline airline;

    @Column(nullable = false)
    private String departureAirport;

    @Column(nullable = false)
    private LocalTime departureTime;

    @Column(nullable = false)
    private String arrivalAirport;

    @Column(nullable = false)
    private LocalTime arrivalTime;
}
