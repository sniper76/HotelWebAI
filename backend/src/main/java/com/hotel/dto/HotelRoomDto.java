package com.hotel.dto;

import com.hotel.entity.Hotel;
import com.hotel.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelRoomDto {
    private Hotel hotel;
    private Room room;
}
