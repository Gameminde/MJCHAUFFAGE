// Types et utilitaires d'authentification utilisés par les routes API et guards
export interface SessionData {
  isLoggedIn?: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export function requireAuth() {
  // Fonction placeholder d'exigence d'authentification.
  // À implémenter selon la logique de session maison (iron-session / JWT).
  return true;
}