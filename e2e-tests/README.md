# Tests E2E pour MyChatGPT

Ce répertoire contient les tests de bout en bout (E2E) pour l'application MyChatGPT, utilisant Playwright.

## Prérequis

- Node.js (version 14 ou supérieure)
- npm

## Installation

Pour installer les dépendances nécessaires, exécutez la commande suivante à la racine du projet :

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

## Structure des tests

- `tests/chat-flow.spec.ts` : Test du flux complet (connexion, création de conversation, envoi de message)
- `tests/edit-message.spec.ts` : Test de la fonctionnalité d'édition des messages

## Exécution des tests

Pour exécuter tous les tests E2E :

```bash
cd e2e-tests
npx playwright test
```

Pour exécuter un test spécifique :

```bash
cd e2e-tests
npx playwright test tests/chat-flow.spec.ts
```

Pour exécuter les tests avec l'interface utilisateur de Playwright :

```bash
cd e2e-tests
npx playwright test --ui
```

## Visualisation des rapports

Après l'exécution des tests, un rapport HTML est généré. Pour le visualiser :

```bash
cd e2e-tests
npx playwright show-report
```

## Notes importantes

- Les tests supposent que l'application est accessible à l'URL `http://localhost:3000`
- Les tests utilisent les identifiants suivants : 
  - Email : `theo@gmail.com`
  - Mot de passe : `theo`
- Assurez-vous que ces identifiants existent dans votre base de données de test
