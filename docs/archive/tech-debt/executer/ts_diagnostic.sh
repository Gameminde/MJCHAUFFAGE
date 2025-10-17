#!/bin/bash
# Script de diagnostic TypeScript complet

echo "🔍 DIAGNOSTIC TYPESCRIPT - MJ CHAUFFAGE"
echo "========================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier backend
echo -e "\n${YELLOW}📦 Backend TypeScript Check${NC}"
cd backend
npm run type-check 2>&1 | tee ../typescript-errors-backend.log

# Compter les erreurs
BACKEND_ERRORS=$(grep -c "error TS" ../typescript-errors-backend.log || echo "0")
echo -e "${RED}Erreurs Backend: $BACKEND_ERRORS${NC}"

# 2. Vérifier admin-backend
echo -e "\n${YELLOW}📦 Admin Backend TypeScript Check${NC}"
cd ../admin-v2/admin-backend
npm run build 2>&1 | tee ../../typescript-errors-admin-backend.log

ADMIN_BACKEND_ERRORS=$(grep -c "error TS" ../../typescript-errors-admin-backend.log || echo "0")
echo -e "${RED}Erreurs Admin Backend: $ADMIN_BACKEND_ERRORS${NC}"

# 3. Vérifier frontend
echo -e "\n${YELLOW}📦 Frontend TypeScript Check${NC}"
cd ../../frontend
npm run build 2>&1 | tee ../typescript-errors-frontend.log

FRONTEND_ERRORS=$(grep -c "Type error" ../typescript-errors-frontend.log || echo "0")
echo -e "${RED}Erreurs Frontend: $FRONTEND_ERRORS${NC}"

# 4. Vérifier admin-frontend
echo -e "\n${YELLOW}📦 Admin Frontend TypeScript Check${NC}"
cd ../admin-v2/admin-frontend
npm run build 2>&1 | tee ../../typescript-errors-admin-frontend.log

ADMIN_FRONTEND_ERRORS=$(grep -c "Type error" ../../typescript-errors-admin-frontend.log || echo "0")
echo -e "${RED}Erreurs Admin Frontend: $ADMIN_FRONTEND_ERRORS${NC}"

# 5. Résumé
cd ../..
echo -e "\n${YELLOW}📊 RÉSUMÉ DES ERREURS${NC}"
echo "================================"
echo -e "Backend:         ${RED}$BACKEND_ERRORS${NC} erreurs"
echo -e "Admin Backend:   ${RED}$ADMIN_BACKEND_ERRORS${NC} erreurs"
echo -e "Frontend:        ${RED}$FRONTEND_ERRORS${NC} erreurs"
echo -e "Admin Frontend:  ${RED}$ADMIN_FRONTEND_ERRORS${NC} erreurs"
echo "================================"

TOTAL_ERRORS=$((BACKEND_ERRORS + ADMIN_BACKEND_ERRORS + FRONTEND_ERRORS + ADMIN_FRONTEND_ERRORS))
echo -e "TOTAL:           ${RED}$TOTAL_ERRORS${NC} erreurs"

# 6. Extraire les erreurs critiques
echo -e "\n${YELLOW}🔥 TOP 5 FICHIERS AVEC LE PLUS D'ERREURS${NC}"
cat typescript-errors-*.log | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -5

# 7. Générer rapport JSON
cat > typescript-report.json <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "errors": {
    "backend": $BACKEND_ERRORS,
    "adminBackend": $ADMIN_BACKEND_ERRORS,
    "frontend": $FRONTEND_ERRORS,
    "adminFrontend": $ADMIN_FRONTEND_ERRORS,
    "total": $TOTAL_ERRORS
  },
  "logFiles": [
    "typescript-errors-backend.log",
    "typescript-errors-admin-backend.log",
    "typescript-errors-frontend.log",
    "typescript-errors-admin-frontend.log"
  ]
}
EOF

echo -e "\n${GREEN}✅ Rapport sauvegardé: typescript-report.json${NC}"
echo -e "${GREEN}✅ Logs sauvegardés: typescript-errors-*.log${NC}"
