package com.example.demo.repository;

import com.example.demo.entity.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseRequestRepository
        extends JpaRepository<PurchaseRequest, Long> {

    List<PurchaseRequest> findByEmployeeId(Long employeeId);

    List<PurchaseRequest> findByTeamId(Long teamId);

    List<PurchaseRequest> findByTeamIdAndStatus(
            Long teamId, String status);
}