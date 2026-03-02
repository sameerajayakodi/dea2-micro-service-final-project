package com.wms.workforce_equipment_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a conflict occurs during a request.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends ServiceException {

    public ConflictException(String message) {
        super(message);
    }
}
