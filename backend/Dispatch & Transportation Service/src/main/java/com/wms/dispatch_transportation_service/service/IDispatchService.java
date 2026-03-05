package com.wms.dispatch_transportation_service.service;

import com.wms.dispatch_transportation_service.dto.request.DispatchRequest;
import com.wms.dispatch_transportation_service.dto.response.DispatchResponse;

import java.util.List;

public interface IDispatchService {

    List<DispatchResponse> getAllDispatches();

    DispatchResponse getDispatchById(String id);

    DispatchResponse createDispatch(DispatchRequest request);

    DispatchResponse updateDispatch(String id, DispatchRequest request);

    void deleteDispatch(String id);
}
