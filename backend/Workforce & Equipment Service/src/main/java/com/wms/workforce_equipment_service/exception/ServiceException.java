package com.wms.workforce_equipment_service.exception;

/**
 * Base exception class for service-related exceptions.
 */
public class ServiceException extends RuntimeException {

    public ServiceException(String message) {
        super(message);
    }

    public ServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
