import apiGateway from "@/lib/axios";

// Postman collection uses /api/customers
const BASE_URL = "/api/customers";

export const getAllCustomers = async () => {
    return await apiGateway.get(BASE_URL);
};

export const getCustomerById = async (id) => {
    return await apiGateway.get(`${BASE_URL}/${id}`);
};

export const createCustomer = async (customerData) => {
    return await apiGateway.post(BASE_URL, customerData);
};

export const updateCustomer = async (id, customerData) => {
    return await apiGateway.put(`${BASE_URL}/${id}`, customerData);
};

export const deactivateCustomer = async (id) => {
    return await apiGateway.delete(`${BASE_URL}/${id}`);
};
