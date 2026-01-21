package com.hotel;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.dto.BlockedIpDto;
import com.hotel.entity.User;
import com.hotel.repository.BlockedIpRepository;
import com.hotel.repository.UserRepository;
import com.hotel.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=update")
public class BlockedIpIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BlockedIpRepository blockedIpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private User admin;
    private User user;

    @BeforeEach
    void setUp() {
        admin = userRepository.save(User.builder()
                .username("admin_test")
                .password(passwordEncoder.encode("password"))
                .role(User.Role.ADMIN)
                .fullName("Admin Test")
                .email("admin@test.com")
                .build());

        user = userRepository.save(User.builder()
                .username("user_test")
                .password(passwordEncoder.encode("password"))
                .role(User.Role.USER)
                .fullName("User Test")
                .email("user@test.com")
                .build());
    }

    private String getToken(User u) {
        org.springframework.security.core.userdetails.UserDetails userDetails = org.springframework.security.core.userdetails.User
                .builder()
                .username(u.getUsername())
                .password(u.getPassword())
                .authorities("ROLE_" + u.getRole().name())
                .build();
        return "Bearer " + jwtUtil.generateToken(userDetails);
    }

    @Test
    void testIpBlockingFlow() throws Exception {
        String testIp = "10.0.0.99";

        // 1. Initially, IP should NOT be blocked
        mockMvc.perform(get("/api/boards")
                .header("X-Forwarded-For", testIp))
                .andExpect(status().isOk());

        // 2. Admin blocks the IP
        BlockedIpDto dto = new BlockedIpDto();
        dto.setIpAddress(testIp);
        dto.setReason("Malicious activity");

        mockMvc.perform(post("/api/admin/blocked-ips")
                .header("Authorization", getToken(admin))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        assertTrue(blockedIpRepository.existsByIpAddress(testIp));

        // 3. Blocked IP tries to access API -> Should be 403 Forbidden
        mockMvc.perform(get("/api/boards")
                .header("X-Forwarded-For", testIp))
                .andExpect(status().isForbidden());

        // 4. Admin unblocks the IP via Delete API
        // First find ID
        Long id = blockedIpRepository.findAll().stream()
                .filter(ip -> ip.getIpAddress().equals(testIp))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(delete("/api/admin/blocked-ips/" + id)
                .header("Authorization", getToken(admin)))
                .andExpect(status().isOk());

        assertFalse(blockedIpRepository.existsByIpAddress(testIp));

        // 5. IP should work again
        mockMvc.perform(get("/api/boards")
                .header("X-Forwarded-For", testIp))
                .andExpect(status().isOk());
    }
}
