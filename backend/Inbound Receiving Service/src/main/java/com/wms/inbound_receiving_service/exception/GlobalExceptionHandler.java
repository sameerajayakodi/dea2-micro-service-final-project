package com.wms.inbound_receiving_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    // 1. Handle ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        return buildResponse(ex.getMessage(), request.getDescription(false), HttpStatus.NOT_FOUND);
    }

    // 2. Handle Validation Errors (e.g., @NotBlank, @Min in DTOs)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return buildResponse("Validation Failed", errors, HttpStatus.BAD_REQUEST);
    }

    // 3. Handle Feign Client Errors (Connecting to EC2 Supplier/Product Services)
    // This catches when Feign can't find the external service
    @ExceptionHandler(feign.FeignException.class)
    public ResponseEntity<?> handleFeignException(feign.FeignException ex) {
        return buildResponse("External Service Error", "Communication with remote service failed: " + ex.status(), HttpStatus.SERVICE_UNAVAILABLE);
    }

    // 4. Handle all other general exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex, WebRequest request) {
        return buildResponse("Internal Server Error", ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Helper method to keep code clean
    private ResponseEntity<Map<String, Object>> buildResponse(String message, String details, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", message);
        body.put("details", details);
        body.put("status", status.value());
        return new ResponseEntity<>(body, status);
    }
}