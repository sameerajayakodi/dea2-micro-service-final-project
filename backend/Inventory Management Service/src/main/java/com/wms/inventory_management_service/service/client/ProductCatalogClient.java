package com.wms.inventory_management_service.service.client;

import java.util.UUID;

public interface ProductCatalogClient {

    ProductCatalogProduct getProductById(UUID productId);

    record ProductCatalogProduct(UUID id, String name, Boolean active) {}
}
