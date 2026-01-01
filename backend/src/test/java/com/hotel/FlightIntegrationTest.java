package com.hotel;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.dto.FlightDto;
import com.hotel.repository.AirlineRepository;
import com.hotel.repository.FlightTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class FlightIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AirlineRepository airlineRepository;

    @Autowired
    private FlightTicketRepository flightTicketRepository;

    @BeforeEach
    void setUp() {
        flightTicketRepository.deleteAll();
        airlineRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createAndGetAirline() throws Exception {
        // Create Airline
        FlightDto.AirlineRequest request = new FlightDto.AirlineRequest();
        request.setName("Test Airline");
        request.setCode("TA");

        MvcResult result = mockMvc.perform(post("/api/admin/airlines")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        FlightDto.AirlineResponse response = objectMapper.readValue(result.getResponse().getContentAsString(),
                FlightDto.AirlineResponse.class);
        assertThat(response.getName()).isEqualTo("Test Airline");

        // Get Airlines
        mockMvc.perform(get("/api/airlines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Airline"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createAndGetFlightTicket() throws Exception {
        // Create Airline first
        FlightDto.AirlineRequest airlineRequest = new FlightDto.AirlineRequest();
        airlineRequest.setName("Test Airline");
        airlineRequest.setCode("TA");

        MvcResult airlineResult = mockMvc.perform(post("/api/admin/airlines")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(airlineRequest)))
                .andExpect(status().isOk())
                .andReturn();

        FlightDto.AirlineResponse airline = objectMapper.readValue(airlineResult.getResponse().getContentAsString(),
                FlightDto.AirlineResponse.class);

        // Create Flight Ticket
        FlightDto.FlightTicketRequest ticketRequest = new FlightDto.FlightTicketRequest();
        ticketRequest.setAirlineId(airline.getId());
        ticketRequest.setDepartureAirport("ICN");
        ticketRequest.setDepartureTime(LocalTime.of(10, 0));
        ticketRequest.setArrivalAirport("NRT");
        ticketRequest.setArrivalTime(LocalTime.of(12, 30));

        mockMvc.perform(post("/api/admin/flights")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(ticketRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.departureAirport").value("ICN"))
                .andExpect(jsonPath("$.departureTime").value("10:00:00"));

        // Get Flight Tickets
        mockMvc.perform(get("/api/flights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].departureAirport").value("ICN"));
    }
}
