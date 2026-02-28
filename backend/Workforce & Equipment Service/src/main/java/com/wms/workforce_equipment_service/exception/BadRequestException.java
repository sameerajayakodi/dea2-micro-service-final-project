package com.wms.workforce_equipment_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a bad request is made.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends ServiceException {

    public BadRequestException(String message) {
        super(message);
    }
}
