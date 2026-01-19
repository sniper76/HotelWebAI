package com.hotel.repository;

import com.hotel.entity.AccessLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {
    Page<AccessLog> findAllByOrderByTimestampDesc(Pageable pageable);

    Page<AccessLog> findAllByClientIpNot(String clientIp, Pageable pageable);
}
