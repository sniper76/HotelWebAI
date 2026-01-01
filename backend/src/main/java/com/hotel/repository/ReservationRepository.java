package com.hotel.repository;

import com.hotel.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
       List<Reservation> findByUserId(Long userId);

       @Query("SELECT r FROM Reservation r JOIN r.rooms rm WHERE rm.id = :roomId AND " +
                     "((r.checkInDate < :checkOutDate AND r.checkOutDate > :checkInDate)) AND " +
                     "r.status <> 'CANCELLED'")
       List<Reservation> findConflictingReservations(@Param("roomId") Long roomId,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate);

       @Query("SELECT DISTINCT r FROM Reservation r JOIN r.rooms rm WHERE rm.roomType.hotel.id = :hotelId AND " +
                     "r.status = 'CHECKED_OUT' AND r.actualCheckOutTime BETWEEN :start AND :end")
       List<Reservation> findSettlementReservations(@Param("hotelId") Long hotelId,
                     @Param("start") java.time.LocalDateTime start,
                     @Param("end") java.time.LocalDateTime end);

       @Query("""
              SELECT DISTINCT r FROM Reservation r JOIN r.rooms rm 
              WHERE rm.roomType.hotel.id = :hotelId 
              AND (
                     r.checkInDate >= :date 
                     OR r.checkOutDate <= :date
              )
       """)
       List<Reservation> findManagerReservations(@Param("hotelId") Long hotelId,
                     @Param("date") LocalDate date);
}
