# Map Quiz - Frontend

## 🚀 Description

Application frontend pour Map Quiz, un jeu de quiz géographique interactif avec système d'amis et authentification sociale.

## 🛠️ Technologies

- **Framework**: React 19 + Vite
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: TanStack Query
- **Authentification**: Better Auth React
- **Cartes**: React Simple Maps + D3 Geo
- **Langage**: TypeScript

## ✨ Fonctionnalités

- 🗺️ **Quiz géographiques** interactifs
- 👥 **Système d'amis** avec demandes
- 🔐 **Authentification Google** OAuth
- 🎯 **Mode entraînement**
- 📱 **Interface responsive**
- 🌙 **Mode sombre/clair**

## 📋 Prérequis

- Node.js 18+
- npm ou pnpm

## 🔧 Installation

1. Clonez le repository

```bash
git clone <votre-repo>
cd frontend
```

2. Installez les dépendances

```
pnpm install
# ou
npm install
```

3. Configurez les variables d'environnement

```
cp .env.example .env.local
```

Variables requises :

```
VITE_API_URL="http://localhost:3000/api"
BETTER_AUTH_URL="http://localhost:3000"
```

## 🚀 Démarrage

### Développement

```
pnpm dev
# ou
npm run dev
```

L'application sera disponible sur http://localhost:5173

### Build de production

```
pnpm build
pnpm preview
```

## 📱 Pages disponibles

- / - Page d'accueil avec dashboard
- /quiz - Interface de quiz (en développement)
- /training - Mode entraînement
- /social - Gestion des amis et profil

## 📝 Scripts disponibles

- pnpm dev - Démarrage en mode développement
- pnpm build - Build de production
- pnpm preview - Aperçu du build
- pnpm lint - Vérification ESLint

## 🔧 Configuration

### Vite

- Configuration dans vite.config.ts
- Plugins : React, TanStack Router
- Alias : @ pour /src

### Tailwind CSS

- Configuration dans tailwind.config.js
- Thème personnalisé avec variables CSS
- Animations avec tw-animate-css

### TypeScript

- Configuration stricte
- Types pour les composants React
- Types pour les données géographiques
