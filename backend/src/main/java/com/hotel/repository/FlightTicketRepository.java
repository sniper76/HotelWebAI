package com.hotel.repository;

import com.hotel.entity.FlightTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FlightTicketRepository extends JpaRepository<FlightTicket, Long> {
    List<FlightTicket> findByAirlineId(Long airlineId);

    List<FlightTicket> findByAirlineIdAndUseYn(Long airlineId, String useYn);

    List<FlightTicket> findAllByUseYn(String useYn);
}
