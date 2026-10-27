
package com.example.demo.service;

import com.example.demo.entity.PurchaseRequest;
import com.example.demo.repository.PurchaseRequestRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PurchaseRequestService {

    private final PurchaseRequestRepository requestRepository;

    public PurchaseRequestService(PurchaseRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
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
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
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
}
