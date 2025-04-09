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

L'architecture du backend suit une structure DDD et Hexagonale :

```
src/
  domains/
    <domaine>/
      entities/
      services/
      repositories/
  application/
    usecases/
  infrastructure/
    adapters/
```

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

## Technologies

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: NuxtJS
- **Tests**: Jest (backend), Cypress (frontend)
- **CI/CD**: GitHub Actions
- **Authentification**: JWT

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

# Exécuter les tests e2e
npm run test:e2e
```

## Contribution

Les commits doivent suivre la convention [Conventional Commits](https://www.conventionalcommits.org/) pour faciliter la lecture, la compréhension et la gestion des versions.
