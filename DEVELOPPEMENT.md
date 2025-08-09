# Guide de Développement - Frontend MapQuiz

## 🚀 **Installation Rapide**

### **Prérequis Système**

- **Node.js** : v18+ (recommandé v22.16.0)
- **Package Manager** : pnpm (recommandé) ou npm
- **Git** : Gestion des versions
- **Navigateur** : Chrome/Firefox/Safari moderne

### **Outils Globaux Recommandés**

```bash
# Package manager rapide (recommandé)
npm install -g pnpm

# TypeScript pour développement
npm install -g typescript

# Outils de développement
npm install -g @vitejs/create-vite
```

## ⚡ **Démarrage Express**

### **1. Installation**

```bash
# Cloner le repository
git clone https://github.com/map-quiz/mapquiz-front.git
cd mapquiz-frontend

# Installer les dépendances (préférer pnpm)
pnpm install
# ou
npm install
```

### **2. Configuration**

```bash
# Copier le template de configuration
cp env.example .env.local

# Éditer .env.local avec vos valeurs
nano .env.local  # ou votre éditeur préféré
```

### **3. Démarrage**

```bash
# Mode développement avec hot-reload
pnpm dev
# ou
npm run dev

# Vérifier que ça fonctionne
open http://localhost:5173
```

**🌐 Application disponible** : http://localhost:5173

## 🛠️ **Stack Technique Détaillée**

### **Framework et Runtime**

- **React 19** : Framework UI avec nouvelles fonctionnalités
- **TypeScript** : Langage avec typage statique
- **Vite** : Build tool ultra-rapide avec HMR
- **Node.js** : Runtime pour outils de build

### **Routing et Navigation**

- **TanStack Router** : Routage type-safe moderne
- **Router DevTools** : Debug des routes en développement
- **File-based routing** : Routes générées automatiquement

### **State Management**

- **TanStack Query** : Gestion état serveur (cache, sync)
- **React Context** : État global application
- **useState/useReducer** : État local des composants
- **Custom hooks** : Logique métier réutilisable

### **Styling et UI**

- **Tailwind CSS** : Framework CSS utilitaire
- **Shadcn/ui** : Composants pré-stylés accessibles
- **Radix UI** : Primitives UI accessibles
- **Lucide React** : Icônes modernes
- **CSS Variables** : Thèmes dynamiques

### **Communication Backend**

- **Fetch API** : Requêtes HTTP natives
- **WebSocket** : Communication temps réel
- **Better Auth React** : Authentification intégrée
- **TanStack Query** : Cache et synchronisation

## 📁 **Structure du Projet**

```
src/
├── components/              # Composants React
│   ├── ui/                     # Composants base (Shadcn)
│   │   ├── button.tsx             # Boutons stylés
│   │   ├── card.tsx               # Cartes
│   │   ├── dialog.tsx             # Modales
│   │   └── ...                    # Autres composants UI
│   ├── game/                   # Composants de jeu
│   │   ├── common/                # Composants partagés
│   │   ├── quiz/                  # Mode quiz
│   │   └── training/              # Mode entraînement
│   ├── multiplayer/            # Jeu multijoueur
│   │   ├── CreateLobby.tsx        # Création de lobby
│   │   ├── LobbyRoom.tsx          # Interface lobby
│   │   └── MultiplayerGame.tsx    # Jeu en temps réel
│   ├── social/                 # Système social
│   │   ├── FriendsList.tsx        # Liste d'amis
│   │   ├── AddFriend.tsx          # Ajout d'amis
│   │   └── UserSummary.tsx        # Profil utilisateur
│   └── layout/                 # Structure de page
│       ├── Nav.tsx                # Navigation
│       ├── Footer.tsx             # Pied de page
│       └── Grid.tsx               # Layout grid
├── context/                 # Contextes React
│   ├── WebSocketContext.tsx    # Gestion WebSocket
│   ├── LobbyProvider.tsx       # État des lobbies
│   ├── GameContext.tsx         # État du jeu
│   └── ThemeProvider.tsx       # Gestion thèmes
├── hooks/                   # Hooks personnalisés
│   ├── queries/                # TanStack Query hooks
│   │   ├── useFriends.ts          # Gestion amis
│   │   ├── useScoreHistory.ts     # Historique scores
│   │   └── useSaveScore.ts        # Sauvegarde scores
│   ├── useWebSocket.ts         # Hook WebSocket
│   ├── useMapGame.ts          # Logique de jeu
│   └── useMultiplayerGame.ts  # Jeu multijoueur
├── lib/                     # Utilitaires
│   ├── api.ts                  # Client API
│   ├── auth-client.ts          # Configuration auth
│   ├── utils.ts                # Utilitaires généraux
│   ├── constants.ts            # Constantes
│   └── data.ts                 # Données statiques
├── routes/                  # Définition des routes
│   ├── __root.tsx              # Layout racine
│   ├── index.tsx               # Page d'accueil
│   ├── quiz.tsx                # Mode quiz
│   ├── training.tsx            # Mode entraînement
│   ├── _authenticated/         # Routes protégées
│   │   ├── multiplayer/           # Zone multijoueur
│   │   └── social.tsx             # Page sociale
│   └── bug-report.tsx          # Rapport de bugs
├── types/                   # Types TypeScript
│   ├── game.ts                 # Types de jeu
│   ├── lobby.ts                # Types lobby
│   └── continent.ts            # Types géographiques
└── assets/                  # Assets statiques
    └── google-icon.svg         # Icônes personnalisées
```

## 🔧 **Configuration Détaillée**

### **Variables d'Environnement**

**Fichier `.env.local` (copier depuis `env.example`) :**

```env
# API Backend (VITE_ prefix requis pour client)
VITE_API_URL="http://localhost:3000/api"
VITE_WS_URL="ws://localhost:3000/ws"

# Authentication (pas de VITE_ prefix - gestion spéciale)
BETTER_AUTH_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"
```

### **Configuration Vite**

**Fichier `vite.config.ts` :**

```typescript
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(), // Génération des routes
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true, // Ouvre le navigateur automatiquement
  },
});
```

### **Configuration Tailwind**

**Classes personnalisées et thèmes :**

```css
/* Variables CSS pour thèmes */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

## 📋 **Scripts de Développement**

### **Scripts Principaux**

```bash
# Développement
pnpm dev                    # Mode développement avec HMR
pnpm build                  # Build de production
pnpm preview               # Aperçu du build
pnpm build:check           # Vérification TypeScript uniquement

# Tests
pnpm test                  # Tests interactifs (Vitest)
pnpm test:ui               # Interface graphique des tests
pnpm test:coverage         # Tests avec couverture
pnpm test:run              # Tests en une fois (CI)

# Qualité de code
pnpm lint                  # ESLint
pnpm lint:fix              # Correction automatique ESLint
pnpm type-check            # Vérification TypeScript

# Utilitaires
pnpm clean                 # Nettoyer node_modules et dist
pnpm analyze               # Analyser la taille du bundle
```

## 🧪 **Tests et Qualité**

### **Stratégie de Tests**

**Types de tests :**

- **Unitaires** : Hooks et utilitaires isolés
- **Composants** : Rendu et interactions
- **Intégration** : Flows utilisateur complets

**Configuration Vitest :**

- Environnement jsdom (DOM simulé)
- Testing Library React
- Coverage avec v8
- Hot reload des tests

### **Lancer les Tests**

```bash
# Tests en mode interactif
pnpm test

# Interface graphique complète
pnpm test:ui

# Tests avec couverture
pnpm test:coverage

# Tests pour CI (une seule fois)
pnpm test:run
```

### **Structure des Tests**

```
src/
├── components/
│   └── __tests__/           # Tests des composants
├── hooks/
│   └── __tests__/           # Tests des hooks
├── lib/
│   └── __tests__/           # Tests des utilitaires
└── test/
    ├── setup.ts             # Configuration tests
    ├── mocks/               # Mocks et fixtures
    └── utils/               # Utilitaires de test
```

### **Exemple de Test**

```typescript
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Button } from '../ui/button';

test('Button renders with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

## 🔍 **Debug et Développement**

### **Outils de Debug React**

**React DevTools :**

- Extension navigateur indispensable
- Inspection des props et state
- Profiler de performance

**TanStack DevTools :**

- Debug des requêtes et cache
- Visualisation des mutations
- État des queries en temps réel

### **Debug Vite et Build**

```bash
# Mode debug Vite
pnpm dev --debug

# Analyse du bundle
pnpm build --analyze

# Build avec source maps détaillées
pnpm build --sourcemap
```

### **Outils Recommandés**

**VS Code Extensions :**

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer

**DevTools Navigateur :**

- React Developer Tools
- TanStack Query DevTools
- Lighthouse (audit performance)

## 🚀 **Workflow de Développement**

### **Nouvelle Fonctionnalité**

```bash
# 1. Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer avec hot-reload
pnpm dev          # Terminal 1
pnpm test:ui      # Terminal 2 (optionnel)

# 3. Vérifier la qualité
pnpm lint
pnpm test:run
pnpm build:check
pnpm build        # Test du build

# 4. Commit et push
git add .
git commit -m "feat: description de la fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

### **Développement de Composant**

```bash
# Créer un nouveau composant
mkdir src/components/mon-composant
touch src/components/mon-composant/MonComposant.tsx
touch src/components/mon-composant/__tests__/MonComposant.test.tsx

# Développer avec Storybook (si configuré)
pnpm storybook
```

### **Intégration Continue**

**À chaque PR :**

- Tests automatiques (Vitest)
- Vérification ESLint
- Type checking TypeScript
- Build de validation

**À chaque merge sur main :**

- Déploiement automatique
- Tests post-déploiement
- Health check

## 📊 **Performance et Optimisations**

### **Métriques de Développement**

- **Démarrage dev** : < 2 secondes
- **Hot reload** : < 500ms
- **Tests complets** : < 30 secondes
- **Build production** : < 1 minute

### **Optimisations Vite**

**Code splitting automatique :**

```typescript
// Lazy loading des routes
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Suspense pour le loading
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### **Optimisations React**

```typescript
// Mémoisation des composants coûteux
const MemoizedComponent = memo(({ data }) => {
  return <ExpensiveRender data={data} />;
});

// Mémoisation des calculs
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

## 🔌 **Intégration Backend**

### **Configuration API**

```typescript
// lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    return response.json();
  },
  // ... autres méthodes
};
```

### **WebSocket Integration**

```typescript
// hooks/useWebSocket.ts
export function useWebSocket() {
  const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";

  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    return () => ws.close();
  }, [wsUrl]);

  return socket;
}
```

### **Authentication Integration**

```typescript
// Configuration Better Auth
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:3000",
});
```

## 🎨 **Design System et UI**

### **Composants Shadcn/ui**

```typescript
// Utilisation des composants
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardContent>
        <Button variant="primary">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### **Thèmes et Variables CSS**

```typescript
// Changement de thème
const { theme, setTheme } = useTheme();

// Toggle dark/light
const toggleTheme = () => {
  setTheme(theme === "dark" ? "light" : "dark");
};
```

## 🚀 **Build et Déploiement**

### **Build de Production**

```bash
# Build optimisé
pnpm build

# Analyser le bundle
pnpm build --analyze

# Tester le build localement
pnpm preview
```

### **Variables d'Environnement Production**

```env
# Production
VITE_API_URL="https://backend-solitary-moon-1875.fly.dev/api"
VITE_WS_URL="wss://backend-solitary-moon-1875.fly.dev/ws"
BETTER_AUTH_URL="https://backend-solitary-moon-1875.fly.dev"
```

### **Optimisations Build**

- **Tree shaking** : Élimination du code mort
- **Code splitting** : Découpage par routes
- **Asset optimization** : Compression images et CSS
- **Bundle analysis** : Identification des gros modules

---

**Besoin d'aide ?**

- 📖 [Documentation API Backend](https://github.com/map-quiz/mapquiz-back)
- 🎨 [Shadcn/ui Documentation](https://ui.shadcn.com/)
- 🚀 [Protocole de déploiement](./DEPLOIEMENT.md)
- 🐛 Créer une issue sur GitHub

**Dernière mise à jour** : Janvier 2025  
**Maintenu par** : Équipe Frontend MapQuiz
