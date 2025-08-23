# MapQuiz Frontend

> 🚀 **Documentation Complète** : Consultez [DEVELOPPEMENT.md](./DEVELOPPEMENT.md) pour le guide d'installation et [DEPLOIEMENT.md](./DEPLOIEMENT.md) pour le protocole de déploiement.

## 🎯 **Vue d'Ensemble**

Interface utilisateur moderne pour MapQuiz - un jeu de géographie multijoueur en temps réel avec système social intégré.

## ✨ **Fonctionnalités Principales**

- 🗺️ **Quiz géographiques** avec cartes interactives
- 🎮 **Multijoueur temps réel** via WebSockets
- 👥 **Système social** - amis, lobbies, classements
- 🔐 **Authentification Google** OAuth sécurisée
- 🎯 **Mode entraînement** pour progression personnelle
- 📱 **Design responsive** optimisé mobile/desktop
- 🌙 **Thème sombre/clair** avec persistance
- ⚡ **Performance optimisée** avec lazy loading

## 🛠️ **Stack Technique**

- **Framework** : React 19 + TypeScript
- **Build Tool** : Vite (fast, modern bundling)
- **Routing** : TanStack Router (type-safe)
- **State** : TanStack Query (server state)
- **Styling** : Tailwind CSS + Shadcn/ui
- **Maps** : React Simple Maps + D3 Geo
- **WebSocket** : Native WebSocket client
- **Tests** : Vitest + Testing Library

## ⚡ **Démarrage Rapide**

### **Installation**

```bash
cd frontend
npm install  # ou pnpm install
```

### **Configuration**

```bash
# Copier le template de configuration
cp env.example .env.local
# Éditer .env.local avec vos valeurs
```

### **Démarrage**

```bash
# Mode développement avec hot-reload
npm run dev

# Tests avec interface
npm run test:ui
```

**🌐 Application disponible** : http://localhost:5173

## 🏗️ **Architecture de l'Application**

### **Pages et Routes**

```
/ (index)                    # Dashboard principal
├── /quiz                   # Mode quiz solo
├── /training              # Mode entraînement libre
├── /bug-report           # Rapport de bugs
└── /multiplayer          # Zone multijoueur
    ├── /                 # Lobbies disponibles
    ├── /:lobbyId         # Interface lobby
    ├── /:lobbyId/game    # Jeu en cours
    └── /:lobbyId/result  # Résultats de partie
```

### **Composants Principaux**

- **Game/** - Logique de jeu (quiz, training, controls)
- **Multiplayer/** - Gestion lobbies et multijoueur
- **Social/** - Système d'amis et interactions
- **UI/** - Composants d'interface réutilisables

### **Contextes**

- `WebSocketContext` - Communication temps réel
- `LobbyProvider` - État des lobbies
- `GameContext` - État des jeux
- `ThemeProvider` - Gestion des thèmes

## 📋 **Scripts de Développement**

```bash
# Développement
npm run dev                # Mode développement + HMR
npm run build:check       # Vérification TypeScript

# Tests
npm run test              # Tests interactifs
npm run test:ui           # Interface graphique des tests
npm run test:coverage     # Couverture de tests

# Qualité
npm run lint              # ESLint
npm run lint:fix          # Correction automatique

# Production
npm run build             # Build optimisé
npm run preview           # Aperçu du build
```

## 🎨 **Design System**

**Tailwind CSS + Shadcn/ui :**

- Composants pré-stylés et accessibles
- Thème personnalisé adapté au jeu
- Variables CSS pour cohérence
- Animations fluides et performance

**Structure :**

```
src/
├── components/
│   ├── ui/              # Composants base (Shadcn)
│   ├── game/            # Composants de jeu
│   ├── layout/          # Structure de page
│   └── social/          # Interface sociale
├── hooks/               # Hooks personnalisés
├── lib/                 # Utilitaires
└── routes/             # Définition des routes
```

## 🔌 **Intégrations**

**API Backend :**

- REST API pour données statiques
- WebSocket pour temps réel
- TanStack Query pour cache intelligent

**Services Externes :**

- Google OAuth (authentification)
- Géolocalisation (cartes)

## 🧪 **Tests & Qualité**

**Stratégie de Test :**

- Tests unitaires (hooks, utils)
- Tests de composants (interactions)
- Tests d'intégration (routes)

**Outils Qualité :**

- TypeScript strict mode
- ESLint configuration étendue
- Vitest pour performance
- Coverage rapports

## 📱 **Performance & Optimisations**

**Optimisations Vite :**

- Code splitting automatique
- Lazy loading des routes
- Tree shaking optimisé
- Bundle analysis

**Optimisations React :**

- Memo pour composants coûteux
- Suspense pour chargements
- Virtual scrolling (listes)

## 🚀 **Build & Déploiement**

**Configuration Multi-Environnements :**

- Développement local
- Staging (preview branches)
- Production (Fly.io)

**Variables d'environnement :**

```env
VITE_API_URL     # URL de l'API backend
BETTER_AUTH_URL  # URL d'authentification
VITE_WS_URL      # URL WebSocket
```

**🔗 Liens utiles :**

- [Guide développement complet](./DEVELOPPEMENT.md)
- [Protocole de déploiement](./DEPLOIEMENT.md)
- [Configuration Vite](./vite.config.ts)
- [Configuration Tailwind](./tailwind.config.js)
- [Backend MapQuiz](https://github.com/map-quiz/mapquiz-back)
