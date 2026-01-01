package com.hotel.service;

import com.hotel.dto.AuthDto;
import com.hotel.entity.User;
import com.hotel.repository.UserRepository;
import com.hotel.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;

        public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
                var user = User.builder()
                                .username(request.getUsername())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .fullName(request.getFullName())
                                .email(request.getEmail())
                                .role(User.Role.valueOf(request.getRole().toUpperCase()))
                                .language(request.getLanguage())
                                .build();

                userRepository.save(user);

                // Auto login after register or just return success? Let's return token.
                // Actually, for simplicity, let's just save. But user might want to login
                // immediately.
                // Let's generate token.
                // Need UserDetails.
                // Simplified: just return empty token or force login.
                // Let's force login for simplicity in this demo, or just generate token
                // manually.

                return authenticate(new AuthDto.AuthRequest(request.getUsername(), request.getPassword()));
        }

        public AuthDto.AuthResponse authenticate(AuthDto.AuthRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

                var user = userRepository.findByUsername(request.getUsername()).orElseThrow();
                var jwtToken = jwtUtil.generateToken(new org.springframework.security.core.userdetails.User(
                                user.getUsername(), user.getPassword(),
                                java.util.Collections
                                                .singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                "ROLE_" + user.getRole().name()))));

                return AuthDto.AuthResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole().name())
                                .username(user.getUsername())
                                .language(user.getLanguage())
                                .build();
        }
}
