package com.wms.Storage.Location.Service.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiError {

    private OffsetDateTime timestamp;
    private String path;
    private String errorCode;
    private String message;
    private List<String> details;
}
