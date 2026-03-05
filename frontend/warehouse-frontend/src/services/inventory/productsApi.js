import api from "@/lib/axios";

const BASE = "/api/products";

const mapDtoToInventoryProduct = (dto) => ({
  productId: dto.id,
  productName: dto.name,
  unitPrice: dto.price,
  category: dto.category,
  skuCode: dto.skuCode,
  active: dto.active,
});

const mapInventoryProductToDto = (data) => {
  const generatedSku = `SKU-${Date.now()}`;
  return {
    id: data.productId || undefined,
    name: data.productName,
    price: Number(data.unitPrice),
    category: data.category || null,
    skuCode: data.skuCode || generatedSku,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    active: data.active ?? true,
  };
};

export const getAllInventoryProducts = async () => {
  const response = await api.get(BASE);
  return {
    ...response,
    data: Array.isArray(response.data)
      ? response.data.map(mapDtoToInventoryProduct)
      : [],
  };
};

export const getInventoryProductById = async (productId) => {
  const response = await api.get(`${BASE}/${productId}`);
  return {
    ...response,
    data: response.data ? mapDtoToInventoryProduct(response.data) : response.data,
  };
};

export const createInventoryProduct = (data) =>
  api.post(BASE, mapInventoryProductToDto(data));

export const updateInventoryProduct = (productId, data) =>
  api.put(`${BASE}/${productId}`, mapInventoryProductToDto(data));

export const deleteInventoryProduct = (productId) => api.delete(`${BASE}/${productId}`);
