import axios from 'axios';

// Create an Axios instance pointing to the API Gateway
const apiGateway = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://13.53.95.161:8222',
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add request/response interceptors here for auth tokens, etc.
apiGateway.interceptors.request.use(
  (config) => {
    // Example: Add Authorization Header if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiGateway;
