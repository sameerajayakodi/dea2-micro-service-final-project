package com.wms.productcatalog.repository;

import com.wms.productcatalog.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySkuCode(String skuCode);

    boolean existsBySkuCode(String skuCode);
}
