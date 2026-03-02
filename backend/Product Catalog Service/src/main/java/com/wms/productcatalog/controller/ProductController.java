package com.wms.productcatalog.controller;

import com.wms.productcatalog.dto.ProductDTO;
import com.wms.productcatalog.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * Create a new product
     */
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        ProductDTO createdProduct = productService.createProduct(productDTO);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    /**
     * Update an existing product
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO) {
        ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * Get all products
     */
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get a single product by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    /**
     * Activate a product
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ProductDTO> activateProduct(@PathVariable Long id) {
        ProductDTO activatedProduct = productService.activateProduct(id);
        return ResponseEntity.ok(activatedProduct);
    }

    /**
     * Deactivate a product
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ProductDTO> deactivateProduct(@PathVariable Long id) {
        ProductDTO deactivatedProduct = productService.deactivateProduct(id);
        return ResponseEntity.ok(deactivatedProduct);
    }

    /**
     * Delete a product
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
