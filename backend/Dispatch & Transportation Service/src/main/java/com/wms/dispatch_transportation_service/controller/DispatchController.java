package com.wms.dispatch_transportation_service.controller;

import com.wms.dispatch_transportation_service.dto.request.DispatchRequest;
import com.wms.dispatch_transportation_service.dto.response.DispatchResponse;
import com.wms.dispatch_transportation_service.service.IDispatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dispatches")
@RequiredArgsConstructor
public class DispatchController {

    private final IDispatchService dispatchService;

    @GetMapping("/hello")
    public String sayHi() {
        return "Hi";
    }

    @GetMapping
    public ResponseEntity<List<DispatchResponse>> getAllDispatches() {
        return ResponseEntity.ok(dispatchService.getAllDispatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispatchResponse> getDispatchById(@PathVariable Long id) {
        return ResponseEntity.ok(dispatchService.getDispatchById(id));
    }

    @PostMapping
    public ResponseEntity<DispatchResponse> createDispatch(@Valid @RequestBody DispatchRequest request) {
        DispatchResponse created = dispatchService.createDispatch(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DispatchResponse> updateDispatch(@PathVariable Long id,
                                                             @Valid @RequestBody DispatchRequest request) {
        return ResponseEntity.ok(dispatchService.updateDispatch(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDispatch(@PathVariable Long id) {
        dispatchService.deleteDispatch(id);
        return ResponseEntity.noContent().build();
    }
}
