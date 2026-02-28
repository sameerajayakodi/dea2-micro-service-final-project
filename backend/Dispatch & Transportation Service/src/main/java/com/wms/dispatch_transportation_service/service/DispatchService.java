package com.wms.dispatch_transportation_service.service;

import com.wms.dispatch_transportation_service.dto.request.DispatchRequest;
import com.wms.dispatch_transportation_service.dto.response.DispatchResponse;
import com.wms.dispatch_transportation_service.exception.ResourceNotFoundException;
import com.wms.dispatch_transportation_service.model.Dispatch;
import com.wms.dispatch_transportation_service.repository.DispatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DispatchService implements IDispatchService {

    private final DispatchRepository dispatchRepository;

    @Override
    public List<DispatchResponse> getAllDispatches() {
        return dispatchRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DispatchResponse getDispatchById(Long id) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch not found with id: " + id));
        return mapToResponse(dispatch);
    }

    @Override
    public DispatchResponse createDispatch(DispatchRequest request) {
        Dispatch dispatch = new Dispatch();
        dispatch.setVehicleNo(request.getVehicleNo());
        dispatch.setDeliveryStatus(request.getDeliveryStatus());
        dispatch.setOrderId(request.getOrderId());
        dispatch.setDate(request.getDate());

        Dispatch saved = dispatchRepository.save(dispatch);
        return mapToResponse(saved);
    }

    @Override
    public DispatchResponse updateDispatch(Long id, DispatchRequest request) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch not found with id: " + id));

        dispatch.setVehicleNo(request.getVehicleNo());
        dispatch.setDeliveryStatus(request.getDeliveryStatus());
        dispatch.setOrderId(request.getOrderId());
        dispatch.setDate(request.getDate());

        Dispatch updated = dispatchRepository.save(dispatch);
        return mapToResponse(updated);
    }

    @Override
    public void deleteDispatch(Long id) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch not found with id: " + id));
        dispatchRepository.delete(dispatch);
    }

    private DispatchResponse mapToResponse(Dispatch dispatch) {
        return new DispatchResponse(
                dispatch.getId(),
                dispatch.getVehicleNo(),
                dispatch.getDeliveryStatus(),
                dispatch.getOrderId(),
                dispatch.getDate()
        );
    }
}
