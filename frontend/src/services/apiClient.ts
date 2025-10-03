import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // Important pour envoyer les cookies
});

// Intercepteur pour la gestion des erreurs centralisée
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logique de gestion d'erreur globale (ex: redirection sur erreur 500)
    return Promise.reject(error);
  }
);

export default apiClient;