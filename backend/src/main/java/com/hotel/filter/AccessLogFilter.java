package com.hotel.filter;

import com.hotel.entity.AccessLog;
import com.hotel.repository.AccessLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@RequiredArgsConstructor
public class AccessLogFilter extends OncePerRequestFilter {

    private final AccessLogRepository accessLogRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Log "before" is usually not needed unless for debugging, relevant info is
        // status which is after.
        // We capture info before to get timestamp/request details.
        String method = request.getMethod();
        String url = request.getRequestURI();
        String clientIp = getClientIp(request);
        String requestParams = request.getQueryString();

        try {
            filterChain.doFilter(request, response);
        } finally {
            // After request is processed, we have the status code and final user context
            // (if auth happened)
            // Even if exception occurs (which might be handled by global exception handler
            // setting status),
            // or bubble up (status might be 500 but response not committed yet? Usually
            // controller advice handles it).
            // We'll log in 'finally' block to ensure we catch it.

            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String username = (auth != null && auth.isAuthenticated()
                        && !"anonymousUser".equals(auth.getPrincipal()))
                                ? auth.getName()
                                : null;

                // If it's anonymous, auth.getName() returns "anonymousUser". We check
                // specifically.

                // Exclude Admin Menus
                // if (url.startsWith("/api/admin")) {
                // return;
                // }

                AccessLog accessLog = AccessLog.builder()
                        .method(method)
                        .url(url)
                        .status(response.getStatus())
                        .clientIp(clientIp)
                        .username(username)
                        .requestParams(requestParams)
                        .timestamp(LocalDateTime.now())
                        .build();

                accessLogRepository.save(accessLog);
            } catch (Exception e) {
                log.error("Failed to save access log", e);
            }
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
