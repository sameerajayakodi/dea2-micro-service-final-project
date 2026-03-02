package com.wms.productcatalog.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateSkuException extends RuntimeException {

    public DuplicateSkuException(String message) {
        super(message);
    }

    public DuplicateSkuException(String message, Throwable cause) {
        super(message, cause);
    }
}
