
package com.example.demo.controller;

import com.example.demo.entity.PurchaseRequest;
import com.example.demo.service.PurchaseRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class PurchaseRequestController {

    private final PurchaseRequestService requestService;

    public PurchaseRequestController(PurchaseRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseRequest createRequest(@RequestBody CreateRequest request) {
        return requestService.createRequest(
                request.itemName(),
                request.description(),
                request.quantity(),
                request.amount(),
                request.reason(),
                request.employeeId(),
                request.teamId()
        );
    }

    @GetMapping("/employee/{employeeId}")
    public List<PurchaseRequest> getEmployeeRequests(
            @PathVariable Long employeeId) {
        return requestService.getEmployeeRequests(employeeId);
    }


    @PutMapping("/{requestId}/approve")
    public PurchaseRequest approveRequest(
            @PathVariable Long requestId,
            @RequestParam Long managerId) {

        return requestService.approveRequest(requestId, managerId);
    }

    @PutMapping("/{requestId}/reject")
    public PurchaseRequest rejectRequest(
            @PathVariable Long requestId,
            @RequestParam Long managerId,
            @RequestBody RejectRequest request) {

        return requestService.rejectRequest(
                requestId, managerId, request.rejectionReason());
    }

    public record RejectRequest(String rejectionReason) {}

    @GetMapping("/team/{teamId}/pending")
    public List<PurchaseRequest> getPendingRequestsByTeam(
            @PathVariable Long teamId) {

        return requestService.getPendingRequestsByTeam(teamId);
    }


    public record CreateRequest(
            String itemName,
            String description,
            Integer quantity,
            BigDecimal amount,
            String reason,
            Long employeeId,
            Long teamId
    ) {}
}
