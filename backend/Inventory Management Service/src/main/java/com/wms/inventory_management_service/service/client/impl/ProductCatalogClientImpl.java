package com.wms.inventory_management_service.service.client.impl;

import com.wms.inventory_management_service.exception.ResourceNotFoundException;
import com.wms.inventory_management_service.exception.ServiceException;
import com.wms.inventory_management_service.service.client.ProductCatalogClient;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductCatalogClientImpl implements ProductCatalogClient {

    private static final String PRODUCT_CATALOG_BASE_URL = "http://product-catalog-service/api/products";

    private final RestClient.Builder restClientBuilder;

    @Value("${internal.auth.token:S3CR3T}")
    private String internalAuthToken;

    @Override
    public ProductCatalogProduct getProductById(UUID productId) {
        try {
            return restClientBuilder.build()
                    .get()
                    .uri(PRODUCT_CATALOG_BASE_URL + "/{id}", productId)
                    .headers(h -> h.set("X-Internal-Auth", internalAuthToken))
                    .retrieve()
                    .body(ProductCatalogProduct.class);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Product", "productId", productId);
        } catch (RestClientException ex) {
            throw new ServiceException("Unable to fetch product details from Product Catalog Service", ex);
        }
    }
}
