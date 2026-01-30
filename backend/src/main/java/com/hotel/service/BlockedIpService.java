package com.hotel.service;

import com.hotel.dto.BlockedIpDto;
import com.hotel.entity.BlockedIp;
import com.hotel.repository.BlockedIpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlockedIpService {

    private final BlockedIpRepository blockedIpRepository;

    public Page<BlockedIpDto> getAllBlockedIps(Pageable pageable) {
        return blockedIpRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    public boolean isBlocked(String ipAddress) {
        return blockedIpRepository.existsByIpAddress(ipAddress);
    }

    @Transactional
    public void addBlockedIp(BlockedIpDto dto) {
        if (blockedIpRepository.existsByIpAddress(dto.getIpAddress())) {
            throw new RuntimeException("IP address already blocked");
        }
        BlockedIp blockedIp = new BlockedIp();
        blockedIp.setIpAddress(dto.getIpAddress());
        blockedIp.setReason(dto.getReason());
        blockedIpRepository.save(blockedIp);
    }

    @Transactional
    public void updateBlockedIp(Long id, BlockedIpDto dto) {
        BlockedIp blockedIp = blockedIpRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IP not found"));
        // IP address modification usually not allowed or needs check unique.
        // For simplicity let's allow reason update only or ip if unique.
        if (!blockedIp.getIpAddress().equals(dto.getIpAddress())
                && blockedIpRepository.existsByIpAddress(dto.getIpAddress())) {
            throw new RuntimeException("IP address already exists");
        }
        blockedIp.setIpAddress(dto.getIpAddress());
        blockedIp.setReason(dto.getReason());
    }

    @Transactional
    public void deleteBlockedIp(Long id) {
        blockedIpRepository.deleteById(id);
    }

    private BlockedIpDto convertToDto(BlockedIp e) {
        BlockedIpDto dto = new BlockedIpDto();
        dto.setId(e.getId());
        dto.setIpAddress(e.getIpAddress());
        dto.setReason(e.getReason());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setCreatedBy(e.getCreatedBy());
        return dto;
    }
}
