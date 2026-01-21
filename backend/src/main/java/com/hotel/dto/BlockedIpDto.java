package com.hotel.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlockedIpDto {
    private Long id;
    private String ipAddress;
    private String reason;
    private LocalDateTime createdAt;
    private String createdBy;
}
