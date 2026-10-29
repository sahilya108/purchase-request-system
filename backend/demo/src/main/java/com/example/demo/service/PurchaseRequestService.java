
package com.example.demo.service;

import com.example.demo.entity.PurchaseRequest;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.PurchaseRequestRepository;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PurchaseRequestService {

    private static final Logger logger =
            LoggerFactory.getLogger(PurchaseRequestService.class);

    private final PurchaseRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public PurchaseRequestService(
            PurchaseRequestRepository requestRepository,
            UserRepository userRepository,
            EmailService emailService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public PurchaseRequest createRequest(
            String itemName,
            String description,
            Integer quantity,
            BigDecimal amount,
            String reason,
            Long employeeId,
            Long teamId) {

        if (itemName == null || itemName.isBlank()) {
            throw new IllegalArgumentException("Item name is required");
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero");
        }

        PurchaseRequest request = new PurchaseRequest();
        request.setItemName(itemName);
        request.setDescription(description);
        request.setQuantity(quantity);
        request.setAmount(amount);
        request.setReason(reason);
        request.setEmployeeId(employeeId);
        request.setTeamId(teamId);
        request.setStatus("PENDING");

        return requestRepository.save(request);
    }

    public List<PurchaseRequest> getEmployeeRequests(Long employeeId) {
        return requestRepository.findByEmployeeId(employeeId);
    }

    public List<PurchaseRequest> getPendingRequestsByTeam(Long teamId) {
        return requestRepository.findByTeamIdAndStatus(teamId, "PENDING");
    }

    public PurchaseRequest approveRequest(Long requestId, Long managerId) {
        PurchaseRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Purchase request not found with ID: " + requestId));

        validateManagerTeam(request, managerId);

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalArgumentException(
                    "Only pending requests can be reviewed");
        }

        request.setStatus("APPROVED");
        request.setManagerId(managerId);
        request.setReviewedAt(java.time.LocalDateTime.now());

        PurchaseRequest approvedRequest = requestRepository.save(request);

        // Email failure must not undo a successful approval.
        try {
            emailService.sendApprovalEmail(approvedRequest);
        } catch (Exception ex) {
            logger.error(
                    "Request {} was approved, but the notification email failed.",
                    approvedRequest.getId(),
                    ex);
        }

        return approvedRequest;
    }

    public PurchaseRequest rejectRequest(
            Long requestId,
            Long managerId,
            String rejectionReason) {

        PurchaseRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        validateManagerTeam(request, managerId);

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalArgumentException(
                    "Only pending requests can be reviewed");
        }

        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        request.setStatus("REJECTED");
        request.setManagerId(managerId);
        request.setRejectionReason(rejectionReason);
        request.setReviewedAt(java.time.LocalDateTime.now());

        return requestRepository.save(request);
    }

    private void validateManagerTeam(
            PurchaseRequest request, Long managerId) {

        boolean validManager = userRepository
                .existsByIdAndRoleAndTeamId(
                        managerId, "MANAGER", request.getTeamId());

        if (!validManager) {
            throw new IllegalArgumentException(
                    "Manager does not belong to this request's team");
        }
    }
}
