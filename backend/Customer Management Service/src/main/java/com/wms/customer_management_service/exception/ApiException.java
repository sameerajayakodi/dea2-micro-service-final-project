package com.wms.customer_management_service.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard API error response body.
 * Used by GlobalExceptionHandler to return a consistent JSON error structure
 * containing the HTTP status, error message, and timestamp.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiException {
    private int status;
    private String message;
    private LocalDateTime timestamp;
}
