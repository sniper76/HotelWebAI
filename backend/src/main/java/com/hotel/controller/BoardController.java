package com.hotel.controller;

import com.hotel.dto.BoardDto;
import com.hotel.dto.CommentDto;
import com.hotel.entity.BoardCategory;
import com.hotel.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<Page<BoardDto>> getBoards(
            @RequestParam(required = false) BoardCategory category,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(boardService.getBoards(category, searchType, keyword, pageable));
    }

    @PostMapping
    public ResponseEntity<Long> createBoard(@RequestBody BoardDto dto) {
        return ResponseEntity.ok(boardService.createBoard(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDto> getBoardDetail(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.getBoardDetail(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBoard(@PathVariable Long id, @RequestBody BoardDto dto) {
        boardService.updateBoard(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id) {
        boardService.toggleLike(id);
        return ResponseEntity.ok().build();
    }

    // --- Comments ---

    @PostMapping("/{id}/comments")
    public ResponseEntity<Long> createComment(@PathVariable Long id, @RequestBody CommentDto dto) {
        return ResponseEntity.ok(boardService.createComment(id, dto));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Void> updateComment(@PathVariable String id, @PathVariable Long commentId,
            @RequestBody CommentDto dto) {
        boardService.updateComment(commentId, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id, @PathVariable Long commentId) {
        boardService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }
}
