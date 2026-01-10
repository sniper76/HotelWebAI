package com.hotel.service;

import com.hotel.dto.BoardDto;
import com.hotel.dto.CommentDto;
import com.hotel.entity.Board;
import com.hotel.entity.BoardCategory;
import com.hotel.entity.Comment;
import com.hotel.entity.BoardLike;
import com.hotel.repository.BoardLikeRepository;
import com.hotel.repository.BoardRepository;
import com.hotel.repository.CommentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository;
    private final BoardLikeRepository boardLikeRepository;

    public Page<BoardDto> getBoards(BoardCategory category, String searchType, String keyword, Pageable pageable) {
        Specification<Board> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("useYn"), "Y"));

            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                if ("title".equals(searchType)) {
                    predicates.add(cb.like(root.get("title"), "%" + keyword + "%"));
                } else if ("content".equals(searchType)) {
                    predicates.add(cb.like(root.get("content"), "%" + keyword + "%"));
                } else if ("all".equals(searchType)) {
                    Predicate titleLike = cb.like(root.get("title"), "%" + keyword + "%");
                    Predicate contentLike = cb.like(root.get("content"), "%" + keyword + "%");
                    predicates.add(cb.or(titleLike, contentLike));
                }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return boardRepository.findAll(spec, pageable).map(this::convertToDto);
    }

    @Transactional
    public Long createBoard(BoardDto dto) {
        Board board = new Board();
        board.setCategory(dto.getCategory());
        board.setTitle(dto.getTitle());
        board.setContent(dto.getContent());
        // createdBy handled by auditing or manually if needed, but BaseEntity usually
        // handles it if properly set up with SecurityContext
        // For simplicity in this mono-repo setup without full auditing config, we might
        // need to set it manually from context if BaseEntity doesn't catch it.
        // Assuming BaseEntity works with SecurityContextHolder.

        return boardRepository.save(board).getId();
    }

    @Transactional
    public BoardDto getBoardDetail(Long id) {
        Board board = boardRepository.findById(id).orElseThrow(() -> new RuntimeException("Board not found"));
        board.incrementViewCount();

        BoardDto dto = convertToDto(board);

        // Fetch comments
        List<Comment> comments = commentRepository.findByBoardId(id);
        // Organize comments into hierarchy
        // 1. Get top level comments (parent is null)
        List<CommentDto> commentDtos = comments.stream()
                .filter(c -> c.getParent() == null)
                .map(this::convertCommentToDto)
                .collect(Collectors.toList());

        // 2. Map replies
        Map<Long, List<Comment>> repliesMap = comments.stream()
                .filter(c -> c.getParent() != null)
                .collect(Collectors.groupingBy(c -> c.getParent().getId()));

        commentDtos.forEach(c -> attachReplies(c, repliesMap));

        dto.setComments(commentDtos);

        return dto;
    }

    private void attachReplies(CommentDto parent, Map<Long, List<Comment>> repliesMap) {
        List<Comment> replies = repliesMap.get(parent.getId());
        if (replies != null) {
            List<CommentDto> replyDtos = replies.stream()
                    .map(this::convertCommentToDto)
                    .collect(Collectors.toList());
            parent.setReplies(replyDtos);
            // If we supported multi-level deep nesting, we would recurse here.
            // Requirement says "1st level reply only" (comments on comments), so this is
            // sufficient for 1 level deep.
        } else {
            parent.setReplies(new ArrayList<>());
        }
    }

    @Transactional
    public void updateBoard(Long id, BoardDto dto) {
        Board board = boardRepository.findById(id).orElseThrow(() -> new RuntimeException("Board not found"));
        checkOwnership(board.getCreatedBy());

        board.setTitle(dto.getTitle());
        board.setContent(dto.getContent());
        board.setCategory(dto.getCategory());
        // Automatic Dirty Checking updates DB
    }

    @Transactional
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id).orElseThrow(() -> new RuntimeException("Board not found"));
        // checkOwnership(board.getCreatedBy()); // Admin might want to delete too? For
        // now, ownership.

        // For soft delete
        board.setUseYn("N");
    }

    // --- Like Methods ---

    @Transactional
    public void toggleLike(Long boardId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        // Check if already liked
        BoardLike existingLike = boardLikeRepository.findByBoardIdAndUserId(boardId, username).orElse(null);
        if (existingLike != null) {
            boardLikeRepository.delete(existingLike);
        } else {
            Board board = boardRepository.getReferenceById(boardId);
            BoardLike like = new BoardLike();
            like.setBoard(board);
            like.setUserId(username);
            boardLikeRepository.save(like);
        }
    }

    // --- Comment Methods ---

    @Transactional
    public Long createComment(Long boardId, CommentDto dto) {
        Board board = boardRepository.getReferenceById(boardId);
        Comment comment = new Comment();
        comment.setBoard(board);
        comment.setContent(dto.getContent());

        if (dto.getParentId() != null) {
            Comment parent = commentRepository.getReferenceById(dto.getParentId());
            // Enforce 1-level depth?
            // "게시글에 답글과 답글의 1차 댓글만 가능" means:
            // Post -> Comment -> Reply (OK)
            // Post -> Comment -> Reply -> Reply (NO)
            if (parent.getParent() != null) {
                throw new RuntimeException("Cannot reply to a reply (max depth 1)");
            }
            comment.setParent(parent);
        }

        return commentRepository.save(comment).getId();
    }

    @Transactional
    public void updateComment(Long id, CommentDto dto) {
        Comment comment = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        checkOwnership(comment.getCreatedBy());
        comment.setContent(dto.getContent());
    }

    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        checkOwnership(comment.getCreatedBy());
        // Soft delete or hard delete? "삭제권한은 로그인 사용자가 할수 있으며"
        // Usually soft delete for comments too to preserve tree? Or just mark as
        // deleted.
        comment.setUseYn("N");
    }

    private void checkOwnership(String owner) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        // Assuming SecurityContext returns username.
        // Also allow ADMIN?
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !currentUsername.equals(owner)) {
            throw new RuntimeException("No permission");
        }
    }

    private BoardDto convertToDto(Board e) {
        BoardDto dto = new BoardDto();
        dto.setId(e.getId());
        dto.setCategory(e.getCategory());
        dto.setTitle(e.getTitle());
        dto.setContent(e.getContent());
        dto.setViewCount(e.getViewCount());
        dto.setLikeCount(e.getLikeCount());
        dto.setCommentCount(e.getCommentCount());
        dto.setCreatedBy(e.getCreatedBy());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setUpdatedBy(e.getUpdatedBy());
        dto.setUpdatedAt(e.getUpdatedAt());
        return dto;
    }

    private CommentDto convertCommentToDto(Comment e) {
        CommentDto dto = new CommentDto();
        dto.setId(e.getId());
        dto.setBoardId(e.getBoard().getId());
        if (e.getParent() != null) {
            dto.setParentId(e.getParent().getId());
        }
        dto.setContent(e.getContent());
        dto.setCreatedBy(e.getCreatedBy());
        dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }
}
