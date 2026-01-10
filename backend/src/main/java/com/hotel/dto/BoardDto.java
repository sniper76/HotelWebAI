package com.hotel.dto;

import com.hotel.entity.BoardCategory;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BoardDto {
    private Long id;
    private BoardCategory category;
    private String title;
    private String content;
    private Long viewCount;
    private Long likeCount;
    private Long commentCount;
    private String createdBy; // username
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;

    // For list view, we might not need comments
    // For detail view, we will need them
    private List<CommentDto> comments;
}
