
package com.example.demo.repository;

import com.example.demo.entity.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PurchaseRequestRepository
        extends JpaRepository<PurchaseRequest, Long> {

    List<PurchaseRequest> findByEmployeeId(Long employeeId);

    List<PurchaseRequest> findByTeamId(Long teamId);

    List<PurchaseRequest> findByTeamIdAndStatus(
            Long teamId, String status);

    @Query("""
            SELECT p FROM PurchaseRequest p
            WHERE (:employeeId IS NULL OR p.employeeId = :employeeId)
            AND (:teamId IS NULL OR p.teamId = :teamId)
            AND (:status IS NULL OR UPPER(p.status) = UPPER(:status))
            AND (:fromDate IS NULL OR p.createdAt >= :fromDate)
            AND (:toDate IS NULL OR p.createdAt <= :toDate)
            ORDER BY p.createdAt DESC
            """)
    List<PurchaseRequest> filterRequests(
            @Param("employeeId") Long employeeId,
            @Param("teamId") Long teamId,
            @Param("status") String status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
