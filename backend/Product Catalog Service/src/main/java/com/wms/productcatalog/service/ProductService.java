package com.wms.productcatalog.service;

import com.wms.productcatalog.dto.ProductDTO;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    ProductDTO createProduct(ProductDTO productDTO);

    ProductDTO updateProduct(UUID id, ProductDTO productDTO);

    ProductDTO getProductById(UUID id);

    List<ProductDTO> getAllProducts();

    void deleteProduct(UUID id);

    ProductDTO activateProduct(UUID id);

    ProductDTO deactivateProduct(UUID id);
}
