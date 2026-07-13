package com.nerdsoncall.repository;

import com.nerdsoncall.entity.TutorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorStatusRepository extends JpaRepository<TutorStatus, Long> {
    
    /**
     * Find tutor status by tutor ID
     */
    Optional<TutorStatus> findByTutorId(Long tutorId);
    
    /**
     * Find all online tutors
     */
    List<TutorStatus> findByStatus(TutorStatus.Status status);
    
    /**
     * Get list of online tutor IDs
     */
    @Query("SELECT ts.tutorId FROM TutorStatus ts WHERE ts.status = :status")
    List<Long> findTutorIdsByStatus(@Param("status") TutorStatus.Status status);
    
    /**
     * Check if a tutor is online
     */
    @Query("SELECT COUNT(ts) > 0 FROM TutorStatus ts WHERE ts.tutorId = :tutorId AND ts.status = 'ONLINE'")
    boolean isTutorOnline(@Param("tutorId") Long tutorId);
    
    /**
     * Get count of online tutors
     */
    @Query("SELECT COUNT(ts) FROM TutorStatus ts WHERE ts.status = 'ONLINE'")
    long countOnlineTutors();
    
    /**
     * Delete tutor status by tutor ID
     */
    void deleteByTutorId(Long tutorId);
    
    /**
     * Check if tutor status exists
     */
    boolean existsByTutorId(Long tutorId);
}
