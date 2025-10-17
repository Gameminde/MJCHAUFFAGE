// frontend/src/services/optimizationService.ts
// ⚡ Service d'optimisation système et performance (Admin)

import { api } from '@/lib/api';

/**
 * Types pour l'optimisation système
 */
export interface OptimizationResult {
  success: boolean;
  itemsProcessed: number;
  savedBytes?: number;
  duration: number;
  errors?: string[];
  details?: Record<string, any>;
}

export interface SystemStats {
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cacheSize: number;
  databaseSize: number;
  imageCount: number;
  unoptimizedImages: number;
  lastOptimization?: string;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface PerformanceAnalysis {
  score: number; // 0-100
  metrics: PerformanceMetrics;
  recommendations: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'database' | 'cache' | 'images' | 'code' | 'server';
    message: string;
    impact: string;
    solution: string;
  }>;
  bottlenecks: string[];
}

export interface ImageOptimizationOptions {
  quality?: number; // 1-100
  format?: 'webp' | 'jpg' | 'png' | 'avif';
  maxWidth?: number;
  maxHeight?: number;
  preserveMetadata?: boolean;
}

export interface DatabaseOptimizationOptions {
  vacuum?: boolean;
  reindex?: boolean;
  analyzeQueries?: boolean;
  cleanupOldData?: boolean;
}

export interface CacheStrategy {
  ttl: number; // Time to live en secondes
  invalidateOn: string[]; // Events qui invalident le cache
  warmup: boolean; // Pré-charger le cache
}

/**
 * Service d'optimisation système
 */
export const optimizationService = {
  /**
   * Optimise les images du système
   */
  async optimizeImages(options?: ImageOptimizationOptions): Promise<OptimizationResult> {
    const response = await api.post<OptimizationResult>(
      '/admin/optimize/images',
      options || {}
    );
    return response.data;
  },

  /**
   * Vide le cache applicatif
   */
  async clearCache(pattern?: string): Promise<OptimizationResult> {
    const response = await api.post<OptimizationResult>('/admin/optimize/cache', {
      pattern, // Ex: 'products:*' pour vider uniquement le cache produits
    });
    return response.data;
  },

  /**
   * Optimise la base de données (VACUUM, REINDEX, etc.)
   */
  async optimizeDatabase(options?: DatabaseOptimizationOptions): Promise<OptimizationResult> {
    const response = await api.post<OptimizationResult>(
      '/admin/optimize/database',
      options || { vacuum: true, reindex: true }
    );
    return response.data;
  },

  /**
   * Analyse les performances du système
   */
  async analyzePerformance(): Promise<PerformanceAnalysis> {
    const response = await api.get<PerformanceAnalysis>('/admin/optimize/analyze');
    return response.data;
  },

  /**
   * Récupère les statistiques système
   */
  async getStats(): Promise<SystemStats> {
    const response = await api.get<SystemStats>('/admin/optimize/stats');
    return response.data;
  },

  /**
   * Lance une optimisation complète (images + cache + DB)
   */
  async runFullOptimization(): Promise<{
    images: OptimizationResult;
    cache: OptimizationResult;
    database: OptimizationResult;
    totalSaved: number;
    totalDuration: number;
  }> {
    const startTime = Date.now();

    const [images, cache, database] = await Promise.all([
      this.optimizeImages(),
      this.clearCache(),
      this.optimizeDatabase(),
    ]);

    const totalSaved = 
      (images.savedBytes || 0) + 
      (cache.savedBytes || 0) + 
      (database.savedBytes || 0);

    const totalDuration = Date.now() - startTime;

    return {
      images,
      cache,
      database,
      totalSaved,
      totalDuration,
    };
  },

  /**
   * Génère un rapport de santé système
   */
  async generateHealthReport(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: Array<{
      severity: 'low' | 'medium' | 'high';
      component: string;
      message: string;
    }>;
    uptime: number;
    lastCheck: string;
  }> {
    const response = await api.get('/admin/optimize/health');
    return response.data;
  },

  /**
   * Configure une stratégie de cache
   */
  async setCacheStrategy(key: string, strategy: CacheStrategy): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>(
      '/admin/optimize/cache/strategy',
      { key, strategy }
    );
    return response.data;
  },

  /**
   * Pré-charge le cache (warmup) pour des clés spécifiques
   */
  async warmupCache(keys: string[]): Promise<OptimizationResult> {
    const response = await api.post<OptimizationResult>(
      '/admin/optimize/cache/warmup',
      { keys }
    );
    return response.data;
  },

  /**
   * Nettoie les fichiers temporaires et logs anciens
   */
  async cleanupFiles(olderThanDays = 30): Promise<OptimizationResult> {
    const response = await api.post<OptimizationResult>('/admin/optimize/cleanup', {
      olderThanDays,
    });
    return response.data;
  },

  /**
   * Analyse les requêtes SQL lentes
   */
  async analyzeSlowQueries(): Promise<Array<{
    query: string;
    averageTime: number;
    callCount: number;
    impact: 'low' | 'medium' | 'high';
    suggestions: string[];
  }>> {
    const response = await api.get('/admin/optimize/slow-queries');
    return response.data;
  },

  /**
   * Optimise une image spécifique
   */
  async optimizeSingleImage(
    imageId: string,
    options?: ImageOptimizationOptions
  ): Promise<OptimizationResult> {
    const response = await api.post<OptimizationResult>(
      `/admin/optimize/images/${imageId}`,
      options || {}
    );
    return response.data;
  },

  /**
   * Teste la vitesse du système (benchmark)
   */
  async runBenchmark(): Promise<{
    apiLatency: number;
    databaseLatency: number;
    cacheLatency: number;
    diskIO: number;
    score: number;
  }> {
    const response = await api.post('/admin/optimize/benchmark', {});
    return response.data;
  },

  /**
   * Planifie une optimisation automatique
   */
  async scheduleOptimization(schedule: {
    type: 'images' | 'cache' | 'database' | 'full';
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string; // HH:MM format
    enabled: boolean;
  }): Promise<{ scheduled: boolean; nextRun: string }> {
    const response = await api.post('/admin/optimize/schedule', schedule);
    return response.data;
  },

  /**
   * Récupère l'historique des optimisations
   */
  async getOptimizationHistory(limit = 20): Promise<Array<{
    id: string;
    type: string;
    timestamp: string;
    duration: number;
    itemsProcessed: number;
    savedBytes?: number;
    success: boolean;
  }>> {
    const response = await api.get('/admin/optimize/history', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Surveille les performances en temps réel (WebSocket ou polling)
   */
  async monitorPerformance(
    callback: (metrics: PerformanceMetrics) => void,
    intervalMs = 5000
  ): Promise<() => void> {
    // Polling simple (peut être remplacé par WebSocket)
    const interval = setInterval(async () => {
      try {
        const response = await api.get<PerformanceMetrics>('/admin/optimize/metrics/live');
        callback(response.data);
      } catch (error) {
        console.error('Erreur monitoring performance:', error);
      }
    }, intervalMs);

    // Retourne une fonction de nettoyage
    return () => clearInterval(interval);
  },
};

/**
 * Helpers pour formater les valeurs
 */
export const OptimizationUtils = {
  /**
   * Formate les octets en unité lisible
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  /**
   * Formate la durée en secondes/minutes
   */
  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  },

  /**
   * Calcule le score de performance (0-100)
   */
  calculatePerformanceScore(metrics: PerformanceMetrics): number {
    const weights = {
      pageLoadTime: 0.3,
      apiResponseTime: 0.25,
      databaseQueryTime: 0.2,
      cacheHitRate: 0.15,
      memoryUsage: 0.05,
      cpuUsage: 0.05,
    };

    // Normaliser chaque métrique (plus bas = meilleur, sauf cacheHitRate)
    const scores = {
      pageLoadTime: Math.max(0, 100 - (metrics.pageLoadTime / 30) * 100), // Max 3s = 0 points
      apiResponseTime: Math.max(0, 100 - (metrics.apiResponseTime / 10) * 100), // Max 1s = 0 points
      databaseQueryTime: Math.max(0, 100 - (metrics.databaseQueryTime / 5) * 100), // Max 500ms = 0 points
      cacheHitRate: metrics.cacheHitRate * 100, // Déjà en pourcentage
      memoryUsage: Math.max(0, 100 - metrics.memoryUsage), // Déjà en pourcentage
      cpuUsage: Math.max(0, 100 - metrics.cpuUsage), // Déjà en pourcentage
    };

    const totalScore = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + scores[key as keyof typeof scores] * weight;
    }, 0);

    return Math.round(totalScore);
  },

  /**
   * Détermine la couleur du badge selon le score
   */
  getScoreColor(score: number): string {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  },

  /**
   * Détermine le statut système selon le score
   */
  getSystemStatus(score: number): 'healthy' | 'warning' | 'critical' {
    if (score >= 80) return 'healthy';
    if (score >= 50) return 'warning';
    return 'critical';
  },

  /**
   * Calcule le pourcentage d'amélioration
   */
  calculateImprovement(before: number, after: number): number {
    if (before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  },
};

export default optimizationService;
