🚀 Phase 2 : Configuration + Refactoring
Étape 2.1 : Configuration Unimported (2 min)
Je vais te générer les configs pour chaque app :
A. Frontend
json{
  "name": "frontend",
  "unimported": {
    "ignorePaths": [
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/error.tsx",
      "src/app/**/not-found.tsx",
      "src/app/**/loading.tsx",
      "src/middleware.ts",
      "tests/**",
      "__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "playwright.config.ts",
      "jest.config.*",
      "next.config.js"
    ]
  }
}
B. Admin-Frontend
json{
  "name": "admin-frontend",
  "unimported": {
    "ignorePaths": [
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/error.tsx",
      "src/app/**/not-found.tsx",
      "src/middleware.ts",
      "tests/**",
      "__tests__/**",
      "jest.config.*",
      "next.config.js"
    ]
  }
}

Étape 2.2 : Refactoring Prioritaire (Impact Maximum)
Voici l'ordre optimal basé sur le ratio Gain/Effort :
PrioritéRefactoringGain LignesTempsRisque🔥 1Admin-Frontend API Client-200 lignes15 minFaible🔥 2Backend HTTP Helpers-150 lignes20 minFaible🟡 3Frontend ErrorLayout-80 lignes10 minTrès faible🟡 4Backend Auth Guards-80 lignes15 minFaible🟢 5Frontend AdminPageShell-60 lignes10 minTrès faible🟢 6Frontend AuthForm-100 lignes15 minMoyen

🎬 Je Commence : Refactoring #1 (API Client)
Pourquoi celui-ci d'abord ?

Impact MAX : -200 lignes dupliquées
Risque MIN : Encapsulation simple, pas de logique métier
Effet boule de neige : Facilite tous les futurs appels API
📦 Fichier à CréerAdmin API Client (Centralisé) : 
// admin-v2/admin-frontend/src/lib/api.ts
// 🎯 Client HTTP centralisé pour éliminer la duplication des appels API

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

interface RequestConfig extends Omit<RequestInit, 'body' | 'method'> {
  data?: unknown;
  params?: Record<string, string | number | boolean>;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;
  private tokenKey = 'admin_token';

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Récupère le token d'authentification
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Définit le token d'authentification
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Supprime le token d'authentification
   */
  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Construit l'URL avec les query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Construit les headers de la requête
   */
  private buildHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Gère les erreurs HTTP
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: unknown;
    let errorMessage = 'Une erreur est survenue';

    try {
      errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
        errorMessage = String(errorData.message);
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    // Déconnexion automatique si 401
    if (response.status === 401) {
      this.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const error: ApiError = {
      message: errorMessage,
      status: response.status,
      data: errorData,
    };

    throw error;
  }

  /**
   * Effectue une requête HTTP
   */
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint, config?.params);
    const headers = this.buildHeaders(config?.headers);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: config?.data ? JSON.stringify(config.data) : undefined,
        credentials: 'include',
        ...config,
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      // Gestion des réponses vides (204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
    } catch (error) {
      // Re-throw ApiError tel quel
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }

      // Erreur réseau ou autre
      throw {
        message: error instanceof Error ? error.message : 'Erreur réseau',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, config);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, { ...config, data });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...config, data });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, { ...config, data });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, config);
  }

  /**
   * Upload de fichier(s)
   */
  async upload<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
    const url = this.buildUrl(endpoint, config?.params);
    const token = this.getToken();

    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config?.headers,
    };

    // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
    delete (headers as Record<string, string>)['Content-Type'];

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
        ...config,
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      return response.json();
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }

      throw {
        message: error instanceof Error ? error.message : 'Erreur upload',
        status: 0,
      } as ApiError;
    }
  }
}

// Instance exportée
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const api = new ApiClient(apiBaseUrl);

// Types exportés
export type { ApiError, RequestConfig, PaginatedResponse };
📝 Exemple d'Utilisation (Avant/Après)
❌ Avant (code dupliqué partout)
typescript// Dans chaque composant...
const fetchProducts = async () => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch('http://localhost:3001/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
✅ Après (une seule ligne)
typescriptimport { api } from '@/lib/api';

const fetchProducts = async () => {
  return api.get<Product[]>('/products');
};

// Avec paramètres
const fetchProductsPaginated = async (page: number) => {
  return api.get<PaginatedResponse<Product>>('/products', {
    params: { page, limit: 10 }
  });
};

// POST avec data
const createProduct = async (product: CreateProductDto) => {
  return api.post<Product>('/products', product);
};

// Upload de fichier
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.upload<{ url: string }>('/products/image', formData);
};

🔧 Fichiers à Modifier Ensuite
Une fois le api.ts créé, voici les fichiers à refactoriser (par ordre) :

Login/Auth (priorité MAX)

src/app/login/page.tsx
src/contexts/AuthContext.tsx


Dashboard

src/app/dashboard/page.tsx
src/app/dashboard/orders/page.tsx
src/app/dashboard/products/page.tsx


Autres composants

Tout fichier contenant fetch('...') ou localStorage.getItem('admin_token')




📋 Script de Migration Automatique
Voici un script pour identifier tous les fichiers à migrer :
bash# Trouve tous les fetch() dans le code
cd admin-v2/admin-frontend
grep -r "fetch(" src/ --include="*.tsx" --include="*.ts" | wc -l

# Liste les fichiers concernés
grep -rl "fetch(" src/ --include="*.tsx" --include="*.ts" > files-to-migrate.txt