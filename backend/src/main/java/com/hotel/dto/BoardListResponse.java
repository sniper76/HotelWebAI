package com.hotel.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
public class BoardListResponse {
    private List<BoardDto> notices;
    private Page<BoardDto> page;
}
