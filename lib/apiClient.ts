import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // URL de tu backend Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a *todas* las peticiones
apiClient.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    
    // El 'window' asegura que esto solo se ejecute en el cliente (navegador)
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;