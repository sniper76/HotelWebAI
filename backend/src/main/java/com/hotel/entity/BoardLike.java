package com.hotel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "board_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "board_id", "user_id" })
})
public class BoardLike extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @Column(name = "user_id", nullable = false)
    private String userId; // Storing username
}
