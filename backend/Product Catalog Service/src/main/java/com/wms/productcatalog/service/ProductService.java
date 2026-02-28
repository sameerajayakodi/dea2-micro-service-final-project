package com.wms.productcatalog.service;

import com.wms.productcatalog.dto.ProductDTO;

import java.util.List;

public interface ProductService {

    ProductDTO createProduct(ProductDTO productDTO);

    ProductDTO updateProduct(Long id, ProductDTO productDTO);

    ProductDTO getProductById(Long id);

    List<ProductDTO> getAllProducts();

    void deleteProduct(Long id);

    ProductDTO activateProduct(Long id);

    ProductDTO deactivateProduct(Long id);
}
