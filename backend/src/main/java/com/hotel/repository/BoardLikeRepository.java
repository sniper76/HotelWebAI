package com.hotel.repository;

import com.hotel.entity.BoardLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardLikeRepository extends JpaRepository<BoardLike, Long> {
    Optional<BoardLike> findByBoardIdAndUserId(Long boardId, String userId);

    boolean existsByBoardIdAndUserId(Long boardId, String userId);
}
