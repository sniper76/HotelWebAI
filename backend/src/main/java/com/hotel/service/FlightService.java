package com.hotel.service;

import com.hotel.dto.FlightDto;
import com.hotel.entity.Airline;
import com.hotel.entity.FlightTicket;
import com.hotel.repository.AirlineRepository;
import com.hotel.repository.FlightTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final AirlineRepository airlineRepository;
    private final FlightTicketRepository flightTicketRepository;

    public List<FlightDto.AirlineResponse> getAllAirlines() {
        return airlineRepository.findAll().stream()
                .map(a -> new FlightDto.AirlineResponse(a.getId(), a.getName(), a.getCode()))
                .collect(Collectors.toList());
    }

    @Transactional
    public FlightDto.AirlineResponse createAirline(FlightDto.AirlineRequest request) {
        Airline airline = new Airline(request.getName(), request.getCode());
        Airline saved = airlineRepository.save(airline);
        return new FlightDto.AirlineResponse(saved.getId(), saved.getName(), saved.getCode());
    }

    @Transactional
    public FlightDto.AirlineResponse updateAirline(Long id, FlightDto.AirlineRequest request) {
        Airline airline = airlineRepository.findById(id).orElseThrow(() -> new RuntimeException("Airline not found"));
        airline.setName(request.getName());
        airline.setCode(request.getCode());
        return new FlightDto.AirlineResponse(airline.getId(), airline.getName(), airline.getCode());
    }

    @Transactional
    public void deleteAirline(Long id) {
        if (!flightTicketRepository.findByAirlineId(id).isEmpty()) {
            throw new RuntimeException("Cannot delete airline with existing flight tickets");
        }
        airlineRepository.deleteById(id);
    }

    public List<FlightDto.FlightTicketResponse> getAllFlightTickets() {
        return flightTicketRepository.findAllByUseYn("Y").stream()
                .map(this::mapToFlightTicketResponse)
                .collect(Collectors.toList());
    }

    public List<FlightDto.FlightTicketResponse> getFlightTicketsByAirline(Long airlineId) {
        return flightTicketRepository.findByAirlineIdAndUseYn(airlineId, "Y").stream()
                .map(this::mapToFlightTicketResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FlightDto.FlightTicketResponse createFlightTicket(FlightDto.FlightTicketRequest request) {
        Airline airline = airlineRepository.findById(request.getAirlineId())
                .orElseThrow(() -> new RuntimeException("Airline not found"));

        FlightTicket ticket = new FlightTicket();
        ticket.setAirline(airline);
        ticket.setDepartureAirport(request.getDepartureAirport());
        ticket.setDepartureTime(request.getDepartureTime());
        ticket.setArrivalAirport(request.getArrivalAirport());
        ticket.setArrivalTime(request.getArrivalTime());
        ticket.setUseYn(request.getUseYn());

        FlightTicket saved = flightTicketRepository.save(ticket);
        return mapToFlightTicketResponse(saved);
    }

    @Transactional
    public FlightDto.FlightTicketResponse updateFlightTicket(Long id, FlightDto.FlightTicketRequest request) {
        FlightTicket ticket = flightTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Airline airline = airlineRepository.findById(request.getAirlineId())
                .orElseThrow(() -> new RuntimeException("Airline not found"));

        ticket.setAirline(airline);
        ticket.setDepartureAirport(request.getDepartureAirport());
        ticket.setDepartureTime(request.getDepartureTime());
        ticket.setArrivalAirport(request.getArrivalAirport());
        ticket.setArrivalTime(request.getArrivalTime());
        ticket.setUseYn(request.getUseYn());

        FlightTicket saved = flightTicketRepository.save(ticket);
        return mapToFlightTicketResponse(saved);
    }

    @Transactional
    public void deleteFlightTicket(Long id) {
        flightTicketRepository.deleteById(id);
    }

    private FlightDto.FlightTicketResponse mapToFlightTicketResponse(FlightTicket ticket) {
        return new FlightDto.FlightTicketResponse(
                ticket.getId(),
                ticket.getAirline().getId(),
                ticket.getAirline().getName(),
                ticket.getDepartureAirport(),
                ticket.getDepartureTime(),
                ticket.getArrivalAirport(),
                ticket.getArrivalTime());
    }
}
