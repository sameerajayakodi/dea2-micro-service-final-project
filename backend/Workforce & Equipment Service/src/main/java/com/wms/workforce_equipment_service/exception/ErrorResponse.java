package com.wms.workforce_equipment_service.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Record representing a standardized error response.
 */
public record ErrorResponse(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp,
        Map<String, String> validationErrors
) {

    public ErrorResponse(int status, String error, String message, String path) {
        this(status, error, message, path, LocalDateTime.now(), null);
    }

    public ErrorResponse(int status, String error, String message, String path, Map<String, String> validationErrors) {
        this(status, error, message, path, LocalDateTime.now(), validationErrors);
    }
}
