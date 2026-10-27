
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
