package com.hotel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "boards")
public class Board extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BoardCategory category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    public void incrementViewCount() {
        this.viewCount++;
    }

    // Virtual columns
    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM board_likes bl WHERE bl.board_id = id)")
    private Long likeCount;

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM comments c WHERE c.board_id = id AND c.use_yn = 'Y')")
    private Long commentCount;
}
