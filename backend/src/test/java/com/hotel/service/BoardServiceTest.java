package com.hotel.service;

import com.hotel.entity.Board;
import com.hotel.entity.BoardLike;
import com.hotel.repository.BoardLikeRepository;
import com.hotel.repository.BoardRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private BoardLikeRepository boardLikeRepository;

    @InjectMocks
    private BoardService boardService;

    private final String TEST_USER = "testuser";

    @BeforeEach
    void setUp() {
        // Mock Security Context
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication())
                .thenReturn(new UsernamePasswordAuthenticationToken(TEST_USER, "password"));
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void toggleLike_WhenNotLiked_ShouldAddLike() {
        // Given
        Long boardId = 1L;
        Board board = new Board();
        board.setId(boardId);

        when(boardLikeRepository.findByBoardIdAndUserId(boardId, TEST_USER)).thenReturn(Optional.empty());
        when(boardRepository.getReferenceById(boardId)).thenReturn(board);

        // When
        boardService.toggleLike(boardId);

        // Then
        verify(boardLikeRepository, times(1)).save(any(BoardLike.class));
        verify(boardLikeRepository, never()).delete(any(BoardLike.class));
    }

    @Test
    void toggleLike_WhenAlreadyLiked_ShouldRemoveLike() {
        // Given
        Long boardId = 1L;
        BoardLike existingLike = new BoardLike();
        existingLike.setId(10L);
        existingLike.setUserId(TEST_USER);

        when(boardLikeRepository.findByBoardIdAndUserId(boardId, TEST_USER)).thenReturn(Optional.of(existingLike));

        // When
        boardService.toggleLike(boardId);

        // Then
        verify(boardLikeRepository, times(1)).delete(existingLike);
        verify(boardLikeRepository, never()).save(any(BoardLike.class));
    }
}
