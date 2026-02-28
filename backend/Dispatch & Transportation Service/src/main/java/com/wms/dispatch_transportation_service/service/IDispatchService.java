package com.wms.dispatch_transportation_service.service;

import com.wms.dispatch_transportation_service.dto.request.DispatchRequest;
import com.wms.dispatch_transportation_service.dto.response.DispatchResponse;

import java.util.List;

public interface IDispatchService {

    List<DispatchResponse> getAllDispatches();

    DispatchResponse getDispatchById(Long id);

    DispatchResponse createDispatch(DispatchRequest request);

    DispatchResponse updateDispatch(Long id, DispatchRequest request);

    void deleteDispatch(Long id);
}
