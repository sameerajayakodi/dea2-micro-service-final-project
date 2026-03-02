package com.wms.inbound_receiving_service.exception;

public class ExternalServiceException extends RuntimeException {
    public ExternalServiceException(String message) {
        super(message);
    }
}