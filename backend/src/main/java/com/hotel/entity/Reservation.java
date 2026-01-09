package com.hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reservations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime checkInTime;

    @Column(nullable = false)
    private LocalDateTime checkOutTime;

    @Column(nullable = false)
    private boolean isLateCheckout;

    @Column
    private LocalDateTime actualCheckInTime;

    @Column
    private LocalDateTime actualCheckOutTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private String currency;

    @ManyToMany
    @JoinTable(name = "reservation_rooms", joinColumns = @JoinColumn(name = "reservation_id"), inverseJoinColumns = @JoinColumn(name = "room_id"))
    private List<Room> rooms;

    public enum ReservationStatus {
        PENDING, CONFIRMED, CANCELLED, CHECKED_IN, CHECKED_OUT
    }
}
