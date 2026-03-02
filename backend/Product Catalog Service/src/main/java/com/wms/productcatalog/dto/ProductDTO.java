package com.wms.productcatalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {

    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotBlank(message = "SKU code is required")
    private String skuCode;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    private Double price;

    private String category;

    private String imageUrl;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
