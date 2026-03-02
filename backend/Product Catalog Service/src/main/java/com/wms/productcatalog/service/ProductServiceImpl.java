package com.wms.productcatalog.service;

import com.wms.productcatalog.dto.ProductDTO;
import com.wms.productcatalog.entity.Product;
import com.wms.productcatalog.exception.DuplicateSkuException;
import com.wms.productcatalog.exception.ResourceNotFoundException;
import com.wms.productcatalog.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        if (productRepository.existsBySkuCode(productDTO.getSkuCode())) {
            throw new DuplicateSkuException("Product with SKU code '" + productDTO.getSkuCode() + "' already exists");
        }

        Product product = mapToEntity(productDTO);
        Product savedProduct = productRepository.save(product);
        return mapToDTO(savedProduct);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!existingProduct.getSkuCode().equals(productDTO.getSkuCode())
                && productRepository.existsBySkuCode(productDTO.getSkuCode())) {
            throw new DuplicateSkuException("Product with SKU code '" + productDTO.getSkuCode() + "' already exists");
        }

        existingProduct.setName(productDTO.getName());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setSkuCode(productDTO.getSkuCode());
        existingProduct.setPrice(productDTO.getPrice());
        existingProduct.setCategory(productDTO.getCategory());
        existingProduct.setImageUrl(productDTO.getImageUrl());

        if (productDTO.getActive() != null) {
            existingProduct.setActive(productDTO.getActive());
        }

        Product updatedProduct = productRepository.save(existingProduct);
        return mapToDTO(updatedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    @Override
    public ProductDTO activateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setActive(true);
        Product updatedProduct = productRepository.save(product);
        return mapToDTO(updatedProduct);
    }

    @Override
    public ProductDTO deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setActive(false);
        Product updatedProduct = productRepository.save(product);
        return mapToDTO(updatedProduct);
    }

    private ProductDTO mapToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .skuCode(product.getSkuCode())
                .price(product.getPrice())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .active(product.getActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private Product mapToEntity(ProductDTO dto) {
        return Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .skuCode(dto.getSkuCode())
                .price(dto.getPrice())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
    }
}
