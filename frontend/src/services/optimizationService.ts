// frontend/src/services/optimizationService.ts
// ⚡ Service d'optimisation système et performance (Admin)

import { api } from '@/lib/api';

// Helpers
function toQuery(params?: Record<string, any>): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, String(v)));
    } else {
      sp.append(key, String(value));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

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
  score: number;
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
  quality?: number;
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
  ttl: number;
  invalidateOn: string[];
  warmup: boolean;
}
/**
 * Service d'optimisation système
 */
export const optimizationService = {
  /**
   * Optimise les images du système
   */
  async optimizeImages(options?: ImageOptimizationOptions): Promise<OptimizationResult> {
    const result = await api.post<{ success: boolean; data: OptimizationResult }>(
      '/admin/optimize/images',
      options || {}
    );
    return result.data as OptimizationResult;
  },

  /**
   * Vide le cache applicatif
   */
  async clearCache(pattern?: string): Promise<OptimizationResult> {
    const result = await api.post<{ success: boolean; data: OptimizationResult }>(
      '/admin/optimize/cache',
      { pattern }
    );
    return result.data as OptimizationResult;
  },

  /**
   * Optimise la base de données (VACUUM, REINDEX, etc.)
   */
  async optimizeDatabase(options?: DatabaseOptimizationOptions): Promise<OptimizationResult> {
    const result = await api.post<{ success: boolean; data: OptimizationResult }>(
      '/admin/optimize/database',
      options || { vacuum: true, reindex: true }
    );
    return result.data as OptimizationResult;
  },

  /**
   * Analyse les performances du système
   */
  async analyzePerformance(): Promise<PerformanceAnalysis> {
    const result = await api.get<{ success: boolean; data: PerformanceAnalysis }>(
      '/admin/optimize/analyze'
    );
    return result.data as PerformanceAnalysis;
  },

  /**
   * Récupère les statistiques système
   */
  async getStats(): Promise<SystemStats> {
    const result = await api.get<{ success: boolean; data: SystemStats }>(
      '/admin/optimize/stats'
    );
    return result.data as SystemStats;
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
    const totalSaved = (images.savedBytes || 0) + (cache.savedBytes || 0) + (database.savedBytes || 0);
    const totalDuration = Date.now() - startTime;
    return { images, cache, database, totalSaved, totalDuration };
  },

  /**
   * Génère un rapport de santé système
   */
  async generateHealthReport(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: Array<{ severity: 'low' | 'medium' | 'high'; component: string; message: string }>;
    uptime: number;
    lastCheck: string;
  }> {
    const result = await api.get<{ success: boolean; data: any }>(
      '/admin/optimize/health'
    );
    return result.data as {
      status: 'healthy' | 'warning' | 'critical';
      issues: Array<{ severity: 'low' | 'medium' | 'high'; component: string; message: string }>;
      uptime: number;
      lastCheck: string;
    };
  },

  /**
   * Configure une stratégie de cache
   */
  async setCacheStrategy(key: string, strategy: CacheStrategy): Promise<{ success: boolean }> {
    const result = await api.post<{ success: boolean; data: { success: boolean } }>(
      '/admin/optimize/cache/strategy',
      { key, strategy }
    );
    return result.data as { success: boolean };
  },
  /**
   * Pré-charge le cache (warmup) pour des clés spécifiques
   */
  async warmupCache(keys: string[]): Promise<OptimizationResult> {
    const result = await api.post<{ success: boolean; data: OptimizationResult }>(
      '/admin/optimize/cache/warmup',
      { keys }
    );
    return result.data as OptimizationResult;
  },

  /**
   * Nettoie les fichiers temporaires et logs anciens
   */
  async cleanupFiles(olderThanDays = 30): Promise<OptimizationResult> {
    const result = await api.post<{ success: boolean; data: OptimizationResult }>(
      '/admin/optimize/cleanup',
      { olderThanDays }
    );
    return result.data as OptimizationResult;
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
    const result = await api.get<{
      success: boolean;
      data: Array<{ query: string; averageTime: number; callCount: number; impact: 'low' | 'medium' | 'high'; suggestions: string[] }>;
    }>(`/admin/optimize/slow-queries`);
    return (result.data || []) as Array<{
      query: string;
      averageTime: number;
      callCount: number;
      impact: 'low' | 'medium' | 'high';
      suggestions: string[];
    }>;
  },

  /**
   * Optimise une image spécifique
   */
  async optimizeSingleImage(
    imageId: string,
    options?: ImageOptimizationOptions
  ): Promise<OptimizationResult> {
    const result = await api.post<{ success: boolean; data: OptimizationResult }>(
      `/admin/optimize/images/${imageId}`,
      options || {}
    );
    return result.data as OptimizationResult;
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
    const result = await api.post<{ success: boolean; data: any }>(
      '/admin/optimize/benchmark',
      {}
    );
    return result.data as {
      apiLatency: number;
      databaseLatency: number;
      cacheLatency: number;
      diskIO: number;
      score: number;
    };
  },
  /**
   * Planifie une optimisation automatique
   */
  async scheduleOptimization(schedule: {
    type: 'images' | 'cache' | 'database' | 'full';
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    enabled: boolean;
  }): Promise<{ scheduled: boolean; nextRun: string }> {
    const result = await api.post<{ success: boolean; data: { scheduled: boolean; nextRun: string } }>(
      '/admin/optimize/schedule',
      schedule
    );
    return result.data as { scheduled: boolean; nextRun: string };
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
    const qs = toQuery({ limit });
    const result = await api.get<{
      success: boolean;
      data: Array<{ id: string; type: string; timestamp: string; duration: number; itemsProcessed: number; savedBytes?: number; success: boolean }>;
    }>(`/admin/optimize/history${qs}`);
    return (result.data || []) as Array<{
      id: string;
      type: string;
      timestamp: string;
      duration: number;
      itemsProcessed: number;
      savedBytes?: number;
      success: boolean;
    }>;
  },

  /**
   * Surveille les performances en temps réel (polling)
   */
  async monitorPerformance(
    callback: (metrics: PerformanceMetrics) => void,
    intervalMs = 5000
  ): Promise<() => void> {
    const interval = setInterval(async () => {
      try {
        const result = await api.get<{ success: boolean; data: PerformanceMetrics }>(
          '/admin/optimize/metrics/live'
        );
        callback(result.data as PerformanceMetrics);
      } catch (error) {
        console.error('Erreur monitoring performance:', error);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  },
};

/**
 * Helpers pour formater les valeurs
 */
export const OptimizationUtils = {
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  },

  calculatePerformanceScore(metrics: PerformanceMetrics): number {
    const weights = {
      pageLoadTime: 0.3,
      apiResponseTime: 0.25,
      databaseQueryTime: 0.2,
      cacheHitRate: 0.15,
      memoryUsage: 0.05,
      cpuUsage: 0.05,
    };

    const scores = {
      pageLoadTime: Math.max(0, 100 - (metrics.pageLoadTime / 30) * 100),
      apiResponseTime: Math.max(0, 100 - (metrics.apiResponseTime / 10) * 100),
      databaseQueryTime: Math.max(0, 100 - (metrics.databaseQueryTime / 5) * 100),
      cacheHitRate: metrics.cacheHitRate * 100,
      memoryUsage: Math.max(0, 100 - metrics.memoryUsage),
      cpuUsage: Math.max(0, 100 - metrics.cpuUsage),
    };

    const totalScore = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (scores[key as keyof typeof scores] as number) * weight;
    }, 0);

    return Math.round(totalScore);
  },

  getScoreColor(score: number): string {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  },

  getSystemStatus(score: number): 'healthy' | 'warning' | 'critical' {
    if (score >= 80) return 'healthy';
    if (score >= 50) return 'warning';
    return 'critical';
  },

  calculateImprovement(before: number, after: number): number {
    if (before === 0) return 0;
    return Math.round(((before - after) / before) * 100);
  },
};

export default optimizationService;
