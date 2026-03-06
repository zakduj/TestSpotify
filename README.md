# Test Spotify

Application Node.js pour tester l'intégration avec l'API Spotify, containerisée avec Docker.

## Configuration rapide

```bash
# Construire l'image
docker-compose build

# Démarrer le conteneur
docker-compose up
```

## Variables d'environnement

Copier `.env.example` vers `.env` et remplir vos identifiants Spotify:

```bash
cp .env.example .env
```

Puis éditer `.env` avec vos valeurs:
- `SPOTIFY_CLIENT_ID`: Votre Client ID Spotify
- `SPOTIFY_CLIENT_SECRET`: Votre Client Secret Spotify
- `SPOTIFY_REDIRECT_URI`: URL de redirection (par défaut: http://127.0.0.1:3000/callback)

## Routes disponibles

- `GET /` - Welcome message
- `GET /health` - Health check du serveur

## Architecture minimum viable

```text
src/
  index.ts                 # Entree de l'API Express
  config/                  # Chargement config/env et validation
  routes/                  # Declaration des endpoints HTTP
  controllers/             # Orchestration req/res (sans logique metier lourde)
  services/spotify/        # Appels Spotify (token, recherche, details artistes)
  middlewares/             # Gestion erreurs, auth, logs
  types/                   # Types/DTO TypeScript backend
  utils/                   # Fonctions utilitaires pures

web/
  src/pages/               # Pages UI (home, recherche, detail artiste)
  src/components/          # Composants UI reutilisables
  src/services/            # Appels HTTP vers votre API
  src/assets/              # Images, icones, styles statiques

shared/
  types/                   # Types partages front/back (Artist, SearchResult...)

tests/
  unit/                    # Tests unitaires (services, utils)
  integration/             # Tests API (routes + middlewares)

docs/                      # Notes techniques, conventions, decisions
```