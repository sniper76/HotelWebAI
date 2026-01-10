package com.hotel.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentDto {
    private Long id;
    private Long boardId;
    private Long parentId;
    private String content;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;

    // Nested replies for frontend convenience
    private List<CommentDto> replies;
}
