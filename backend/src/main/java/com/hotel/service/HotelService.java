package com.hotel.service;

import com.hotel.dto.HotelDto;
import com.hotel.entity.Hotel;
import com.hotel.entity.Room;
import com.hotel.entity.RoomType;
import com.hotel.entity.User;
import com.hotel.repository.HotelRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.RoomTypeRepository;
import com.hotel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelService {

        private final HotelRepository hotelRepository;
        private final RoomTypeRepository roomTypeRepository;
        private final RoomRepository roomRepository;
        private final UserRepository userRepository;

        @Transactional
        public HotelDto.HotelResponse createHotel(HotelDto.HotelRequest request, String username) {
                User owner = userRepository.findByUsername(username).orElseThrow();

                Hotel hotel = Hotel.builder()
                                .name(request.getName())
                                .address(request.getAddress())
                                .description(request.getDescription())
                                .owner(owner)
                                .bankName(request.getBankName())
                                .accountHolder(request.getAccountHolder())
                                .accountNumber(request.getAccountNumber())
                                .build();

                Hotel saved = hotelRepository.save(hotel);
                return mapToHotelResponse(saved);
        }

        @Transactional(readOnly = true)
        public List<HotelDto.HotelResponse> getMyHotels(String username) {
                User user = userRepository.findByUsername(username).orElseThrow();
                List<Hotel> hotels;
                if (user.getRole() == User.Role.ADMIN) {
                        hotels = hotelRepository.findAll();
                } else {
                        hotels = hotelRepository.findByOwnerId(user.getId());
                }
                return hotels.stream()
                                .map(this::mapToHotelResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        public HotelDto.RoomTypeResponse addRoomType(Long hotelId, HotelDto.RoomTypeRequest request) {
                Hotel hotel = hotelRepository.findById(hotelId).orElseThrow();

                RoomType roomType = RoomType.builder()
                                .hotel(hotel)
                                .name(request.getName())
                                .description(request.getDescription())
                                .capacity(request.getCapacity())
                                .basePrice(request.getPriceUsd()) // Fallback/Legacy
                                .priceKrw(request.getPriceKrw())
                                .priceUsd(request.getPriceUsd())
                                .pricePhp(request.getPricePhp())
                                .build();

                RoomType saved = roomTypeRepository.save(roomType);
                return mapToRoomTypeResponse(saved);
        }

        @Transactional
        public HotelDto.RoomResponse addRoom(Long roomTypeId, HotelDto.RoomRequest request) {
                RoomType roomType = roomTypeRepository.findById(roomTypeId).orElseThrow();

                Room room = Room.builder()
                                .roomType(roomType)
                                .roomNumber(request.getRoomNumber())
                                .build();

                Room saved = roomRepository.save(room);
                return mapToRoomResponse(saved);
        }

        @Transactional
        public HotelDto.HotelResponse updateHotel(Long hotelId, HotelDto.HotelRequest request, String username) {
                // Verify ownership (simplified: check if hotel exists and belongs to user)
                Hotel hotel = hotelRepository.findById(hotelId).orElseThrow();
                if (!hotel.getOwner().getUsername().equals(username)) {
                        throw new RuntimeException("Not authorized to update this hotel");
                }

                hotel.setName(request.getName());
                hotel.setAddress(request.getAddress());
                hotel.setDescription(request.getDescription());
                hotel.setBankName(request.getBankName());
                hotel.setAccountHolder(request.getAccountHolder());
                hotel.setAccountNumber(request.getAccountNumber());

                Hotel saved = hotelRepository.save(hotel);
                return mapToHotelResponse(saved);
        }

        @Transactional
        public HotelDto.RoomTypeResponse updateRoomType(Long roomTypeId, HotelDto.RoomTypeRequest request,
                        String username) {
                RoomType roomType = roomTypeRepository.findById(roomTypeId).orElseThrow();
                // Verify ownership via hotel owner
                if (!roomType.getHotel().getOwner().getUsername().equals(username)) {
                        throw new RuntimeException("Not authorized to update this room type");
                }

                roomType.setName(request.getName());
                roomType.setDescription(request.getDescription());
                roomType.setCapacity(request.getCapacity());
                roomType.setBasePrice(request.getPriceUsd()); // Fallback/Legacy update
                roomType.setPriceKrw(request.getPriceKrw());
                roomType.setPriceUsd(request.getPriceUsd());
                roomType.setPricePhp(request.getPricePhp());

                RoomType saved = roomTypeRepository.save(roomType);
                return mapToRoomTypeResponse(saved);
        }

        @Transactional
        public HotelDto.RoomResponse updateRoom(Long roomId, HotelDto.RoomRequest request, String username) {
                Room room = roomRepository.findById(roomId).orElseThrow();
                // Verify ownership
                if (!room.getRoomType().getHotel().getOwner().getUsername().equals(username)) {
                        throw new RuntimeException("Not authorized to update this room");
                }

                room.setRoomNumber(request.getRoomNumber());

                Room saved = roomRepository.save(room);
                return mapToRoomResponse(saved);
        }

        private HotelDto.HotelResponse mapToHotelResponse(Hotel hotel) {
                return HotelDto.HotelResponse.builder()
                                .id(hotel.getId())
                                .name(hotel.getName())
                                .address(hotel.getAddress())
                                .description(hotel.getDescription())
                                .bankName(hotel.getBankName())
                                .accountHolder(hotel.getAccountHolder())
                                .accountNumber(hotel.getAccountNumber())
                                .roomTypes(hotel.getRoomTypes() != null
                                                ? hotel.getRoomTypes().stream().map(this::mapToRoomTypeResponse)
                                                                .collect(Collectors.toList())
                                                : null)
                                .build();
        }

        private HotelDto.RoomTypeResponse mapToRoomTypeResponse(RoomType roomType) {
                return HotelDto.RoomTypeResponse.builder()
                                .id(roomType.getId())
                                .name(roomType.getName())
                                .description(roomType.getDescription())
                                .capacity(roomType.getCapacity())
                                .basePrice(roomType.getBasePrice())
                                .priceKrw(roomType.getPriceKrw())
                                .priceUsd(roomType.getPriceUsd())
                                .pricePhp(roomType.getPricePhp())
                                .rooms(roomType.getRooms() != null
                                                ? roomType.getRooms().stream().map(this::mapToRoomResponse)
                                                                .collect(Collectors.toList())
                                                : null)
                                .build();
        }

        private HotelDto.RoomResponse mapToRoomResponse(Room room) {
                return HotelDto.RoomResponse.builder()
                                .id(room.getId())
                                .roomNumber(room.getRoomNumber())
                                .build();
        }
}
