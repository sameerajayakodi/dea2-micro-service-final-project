package com.wms.dispatch_transportation_service.service;

import com.wms.dispatch_transportation_service.dto.request.DispatchRequest;
import com.wms.dispatch_transportation_service.dto.response.DispatchResponse;
import com.wms.dispatch_transportation_service.exception.ResourceNotFoundException;
import com.wms.dispatch_transportation_service.model.Dispatch;
import com.wms.dispatch_transportation_service.repository.DispatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    public DispatchResponse getDispatchById(String id) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch (Shipment) not found with id: " + id));
        return mapToResponse(dispatch);
    }

    @Override
    public DispatchResponse createDispatch(DispatchRequest request) {
        Dispatch dispatch = new Dispatch();
        dispatch.setOrderId(request.getOrderId());
        dispatch.setVehicleId(request.getVehicleId());
        dispatch.setDriverId(request.getDriverId());
        
        if(request.getStatus() != null && !request.getStatus().isEmpty()) {
            dispatch.setStatus(request.getStatus());
        } else {
            dispatch.setStatus("PENDING");
        }
        
        dispatch.setRouteDetails(request.getRouteDetails());
        dispatch.setDeliveryNotes(request.getDeliveryNotes());
        dispatch.setCreatedAt(LocalDateTime.now());
        dispatch.setUpdatedAt(LocalDateTime.now());

        Dispatch saved = dispatchRepository.save(dispatch);
        return mapToResponse(saved);
    }

    @Override
    public DispatchResponse updateDispatch(String id, DispatchRequest request) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch (Shipment) not found with id: " + id));

        dispatch.setOrderId(request.getOrderId());
        dispatch.setVehicleId(request.getVehicleId());
        dispatch.setDriverId(request.getDriverId());
        
        if(request.getStatus() != null && !request.getStatus().isEmpty()) {
            dispatch.setStatus(request.getStatus());
        }
        
        dispatch.setRouteDetails(request.getRouteDetails());
        dispatch.setDeliveryNotes(request.getDeliveryNotes());
        dispatch.setUpdatedAt(LocalDateTime.now());

        Dispatch updated = dispatchRepository.save(dispatch);
        return mapToResponse(updated);
    }

    @Override
    public void deleteDispatch(String id) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch (Shipment) not found with id: " + id));
        dispatchRepository.delete(dispatch);
    }

    private DispatchResponse mapToResponse(Dispatch dispatch) {
        return new DispatchResponse(
                dispatch.getId(),
                dispatch.getOrderId(),
                dispatch.getVehicleId(),
                dispatch.getDriverId(),
                dispatch.getStatus(),
                dispatch.getRouteDetails(),
                dispatch.getDeliveryNotes(),
                dispatch.getCreatedAt(),
                dispatch.getUpdatedAt()
        );
    }
}
