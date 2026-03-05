package com.wms.productcatalog.controller;

import com.wms.productcatalog.dto.ProductDTO;
import com.wms.productcatalog.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product Controller", description = "REST APIs for managing products in the catalog")
public class ProductController {

        private final ProductService productService;

        /**
         * Create a new product
         */
        @Operation(summary = "Create a new product", description = "Creates a new product in the catalog. SKU code must be unique. Name and price are required.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Product created successfully", content = @Content(schema = @Schema(implementation = ProductDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Validation error - missing or invalid fields", content = @Content),
                        @ApiResponse(responseCode = "409", description = "Duplicate SKU code", content = @Content)
        })
        @PostMapping
        public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) {
                ProductDTO createdProduct = productService.createProduct(productDTO);
                return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
        }

        /**
         * Update an existing product
         */
        @Operation(summary = "Update an existing product", description = "Updates all fields of an existing product by its UUID. All required fields must be provided.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Product updated successfully", content = @Content(schema = @Schema(implementation = ProductDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Validation error", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Product not found", content = @Content),
                        @ApiResponse(responseCode = "409", description = "Duplicate SKU code", content = @Content)
        })
        @PutMapping("/{id}")
        public ResponseEntity<ProductDTO> updateProduct(
                        @Parameter(description = "UUID of the product to update", required = true) @PathVariable UUID id,
                        @Valid @RequestBody ProductDTO productDTO) {
                ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
                return ResponseEntity.ok(updatedProduct);
        }

        /**
         * Get all products
         */
        @Operation(summary = "Get all products", description = "Retrieves a list of all products in the catalog")
        @ApiResponse(responseCode = "200", description = "Successfully retrieved all products", content = @Content(schema = @Schema(implementation = ProductDTO.class)))
        @GetMapping
        public ResponseEntity<List<ProductDTO>> getAllProducts() {
                List<ProductDTO> products = productService.getAllProducts();
                return ResponseEntity.ok(products);
        }

        /**
         * Get a single product by ID
         */
        @Operation(summary = "Get product by ID", description = "Retrieves a single product by its unique UUID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Product found", content = @Content(schema = @Schema(implementation = ProductDTO.class))),
                        @ApiResponse(responseCode = "404", description = "Product not found", content = @Content)
        })
        @GetMapping("/{id}")
        public ResponseEntity<ProductDTO> getProductById(
                        @Parameter(description = "UUID of the product to retrieve", required = true) @PathVariable UUID id) {
                ProductDTO product = productService.getProductById(id);
                return ResponseEntity.ok(product);
        }

        /**
         * Activate a product
         */
        @Operation(summary = "Activate a product", description = "Sets the product's active status to true")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Product activated successfully", content = @Content(schema = @Schema(implementation = ProductDTO.class))),
                        @ApiResponse(responseCode = "404", description = "Product not found", content = @Content)
        })
        @PatchMapping("/{id}/activate")
        public ResponseEntity<ProductDTO> activateProduct(
                        @Parameter(description = "UUID of the product to activate", required = true) @PathVariable UUID id) {
                ProductDTO activatedProduct = productService.activateProduct(id);
                return ResponseEntity.ok(activatedProduct);
        }

        /**
         * Deactivate a product
         */
        @Operation(summary = "Deactivate a product", description = "Sets the product's active status to false")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Product deactivated successfully", content = @Content(schema = @Schema(implementation = ProductDTO.class))),
                        @ApiResponse(responseCode = "404", description = "Product not found", content = @Content)
        })
        @PatchMapping("/{id}/deactivate")
        public ResponseEntity<ProductDTO> deactivateProduct(
                        @Parameter(description = "UUID of the product to deactivate", required = true) @PathVariable UUID id) {
                ProductDTO deactivatedProduct = productService.deactivateProduct(id);
                return ResponseEntity.ok(deactivatedProduct);
        }

        /**
         * Delete a product
         */
        @Operation(summary = "Delete a product", description = "Permanently deletes a product from the catalog by its UUID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Product deleted successfully"),
                        @ApiResponse(responseCode = "404", description = "Product not found", content = @Content)
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteProduct(
                        @Parameter(description = "UUID of the product to delete", required = true) @PathVariable UUID id) {
                productService.deleteProduct(id);
                return ResponseEntity.noContent().build();
        }
}
