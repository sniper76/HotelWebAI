package com.hotel.controller;

import com.hotel.dto.FlightDto;
import com.hotel.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    // --- Public/User Endpoints ---

    @GetMapping("/airlines")
    public ResponseEntity<List<FlightDto.AirlineResponse>> getAllAirlines() {
        return ResponseEntity.ok(flightService.getAllAirlines());
    }

    @GetMapping("/flights")
    public ResponseEntity<List<FlightDto.FlightTicketResponse>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlightTickets());
    }

    @GetMapping("/airlines/{airlineId}/flights")
    public ResponseEntity<List<FlightDto.FlightTicketResponse>> getFlightsByAirline(@PathVariable Long airlineId) {
        return ResponseEntity.ok(flightService.getFlightTicketsByAirline(airlineId));
    }

    // --- Admin Endpoints ---

    @PostMapping("/admin/airlines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlightDto.AirlineResponse> createAirline(@RequestBody FlightDto.AirlineRequest request) {
        return ResponseEntity.ok(flightService.createAirline(request));
    }

    @PutMapping("/admin/airlines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlightDto.AirlineResponse> updateAirline(@PathVariable Long id,
            @RequestBody FlightDto.AirlineRequest request) {
        return ResponseEntity.ok(flightService.updateAirline(id, request));
    }

    @DeleteMapping("/admin/airlines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAirline(@PathVariable Long id) {
        flightService.deleteAirline(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/flights")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlightDto.FlightTicketResponse> createFlightTicket(
            @RequestBody FlightDto.FlightTicketRequest request) {
        return ResponseEntity.ok(flightService.createFlightTicket(request));
    }

    @PutMapping("/admin/flights/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlightDto.FlightTicketResponse> updateFlightTicket(@PathVariable Long id,
            @RequestBody FlightDto.FlightTicketRequest request) {
        return ResponseEntity.ok(flightService.updateFlightTicket(id, request));
    }

    @DeleteMapping("/admin/flights/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFlightTicket(@PathVariable Long id) {
        flightService.deleteFlightTicket(id);
        return ResponseEntity.ok().build();
    }
}
