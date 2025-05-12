# MyChatGPT

Une application de chat basée sur l'architecture DDD (Domain-Driven Design) et Hexagonale, permettant de converser avec un modèle d'IA.

## Objectifs du Projet

- Tester de façon unitaire son code
- Tester une interface grâce aux tests e2e
- Maîtriser une méthodologie de test : Test Driven Development (TDD)
- Linter et méthode de refactoring

## Description du Projet

L'objectif est de concevoir un ChatGPT personnalisé sous la forme d'une architecture DDD et Hexagonale. Cette solution permet d'ouvrir une conversation et d'y dialoguer avec un modèle type ChatGPT, en différenciant les demandes de l'utilisateur et les réponses du modèle.

## Architecture

Le projet est divisé en trois parties principales :

1. **Frontend** - Interface graphique permettant d'écrire les messages à l'API avec une gestion par conversation.
2. **Backend** - API qui utilise un modèle d'IA et stocke en base de données les conversations pour en garder un historique.
3. **Base de données** - Permet de stocker l'historique des conversations.

### Backend (NestJS)

L'architecture du backend suit une structure modulaire typique de NestJS :

```
src/
  modules/
    ai/
      # Module de gestion de l'IA
    auth/
      # Module d'authentification
    chat/
      controllers/  # Points d'entrée API
      dto/          # Objets de transfert de données
      entities/     # Modèles de données
      interfaces/   # Définitions de types
      services/     # Logique métier
    user/
      # Module de gestion des utilisateurs
```

Chaque module est responsable d'une fonctionnalité spécifique de l'application et contient tous les composants nécessaires à son fonctionnement.

## Fonctionnalités

### Backend

- Authentification par utilisateur
- Recherche de conversation par mot clé
- Recherche de messages dans une conversation
- Partage d'une conversation via un lien unique en publique

### Frontend

- Création et visualisation des conversations
- Affichage correct du code généré par l'IA
- Modification et renvoi de messages à l'IA

## Routes API

### Authentification

- `POST /auth/register` - Inscription d'un nouvel utilisateur
- `POST /auth/login` - Connexion d'un utilisateur
- `POST /auth/logout` - Déconnexion d'un utilisateur

### Conversations

- `GET /conversations` - Récupérer toutes les conversations de l'utilisateur
- `GET /conversations/:id` - Récupérer une conversation spécifique
- `POST /conversations` - Créer une nouvelle conversation
- `PUT /conversations/:id` - Mettre à jour une conversation
- `DELETE /conversations/:id` - Supprimer une conversation
- `GET /conversations/search?q=<query>` - Rechercher des conversations par mot-clé

### Messages

- `GET /conversations/:conversationId/messages` - Récupérer tous les messages d'une conversation
- `POST /conversations/:conversationId/messages` - Ajouter un message à une conversation
- `PUT /conversations/:conversationId/messages/:id` - Modifier un message
- `DELETE /conversations/:conversationId/messages/:id` - Supprimer un message

### Partage

- `POST /conversations/:id/share` - Partager une conversation
- `GET /share/:shareId` - Accéder à une conversation partagée

## Technologies

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: TypeORM
- **Base de données**: PostgreSQL
- **Tests unitaires**: Jest
- **Authentification**: JWT

### Frontend
- **Framework**: NuxtJS 3 (Vue.js 3)
- **CSS**: TailwindCSS
- **State Management**: Pinia
- **Tests unitaires**: Vitest
- **Tests E2E**: Playwright

### Outils de qualité de code
- **Linter**: ESLint
- **Formatage**: Prettier
- **Hooks Git**: Husky
- **Validation des commits**: commitlint

## Installation

### Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL

### Backend

```bash
# Accéder au dossier du serveur
cd server

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement dans le fichier .env

# Démarrer le serveur en mode développement
npm run start:dev
```

## Tests

### Backend

```bash
# Exécuter les tests unitaires
cd server
npm run test

# Exécuter les tests avec couverture
npm run test:cov

# Exécuter les tests e2e
npm run test:e2e
```

### Frontend

```bash
# Exécuter les tests unitaires
cd client
npm run test

# Exécuter les tests en mode watch
npm run test:watch

# Exécuter les tests avec couverture
npm run test:coverage
```

### Tests E2E (Playwright)

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Exécuter le test de base
npm run test:e2e:basic

# Exécuter le test de flux de connexion
npm run test:e2e:login
```

## Contribution

Les commits doivent suivre la convention [Conventional Commits](https://www.conventionalcommits.org/) pour faciliter la lecture, la compréhension et la gestion des versions.
