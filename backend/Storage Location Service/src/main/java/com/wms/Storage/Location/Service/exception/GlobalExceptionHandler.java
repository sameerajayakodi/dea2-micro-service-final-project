package com.wms.Storage.Location.Service.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFoundException(NotFoundException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .errorCode("NOT_FOUND")
                .message(ex.getMessage())
                .details(List.of())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(CapacityExceededException.class)
    public ResponseEntity<ApiError> handleCapacityExceededException(CapacityExceededException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .errorCode("CAPACITY_EXCEEDED")
                .message(ex.getMessage())
                .details(List.of())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .errorCode("BAD_REQUEST")
                .message(ex.getMessage())
                .details(List.of())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.toList());

        ApiError error = ApiError.builder()
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .errorCode("VALIDATION_ERROR")
                .message("Validation failed")
                .details(fieldErrors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex, HttpServletRequest request) {
        ApiError error = ApiError.builder()
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .errorCode("INTERNAL_ERROR")
                .message("An unexpected error occurred")
                .details(List.of(ex.getMessage() != null ? ex.getMessage() : "Unknown error"))
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
