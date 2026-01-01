package com.hotel.repository;

import com.hotel.dto.HotelRoomDto;
import com.hotel.dto.ReservationDto;
import com.hotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByRoomTypeId(Long roomTypeId);

    @Query("""
            select new com.hotel.dto.HotelRoomDto(
                r.roomType.hotel,
                r
            )
            from Room r
            where r.id in :roomIds
            """)
    List<HotelRoomDto> findHotelRoomsAllById(@Param("roomIds") List<Long> roomIds);
}
