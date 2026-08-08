# Backend — API de gestion de livres

Ce dossier contient l’API backend du projet. Elle utilise Node.js, Express, TypeScript et MongoDB.

## Prérequis

Avant l’installation, vérifiez que les outils suivants sont disponibles :

- Node.js 22 ou une version plus récente ;
- pnpm 10 ;
- une base de données MongoDB locale ou hébergée.

Pour vérifier les versions installées :

```bash
node --version
pnpm --version
```

## Installation des dépendances

Placez-vous dans le dossier backend :

```bash
cd Backend
```

Installez ensuite les dépendances :

```bash
pnpm install
```

## Configuration de l’environnement

Créez un fichier `.env` à partir du fichier d’exemple :

Renseignez ensuite les variables dans `.env` :

```dotenv
MONGODB_URI=mongodb://localhost:27017/nom_de_la_base
PORT=4000
JWT_SECRET=une_cle_secrete_longue_et_aleatoire
```

- `MONGODB_URI` : adresse de connexion à MongoDB ;
- `PORT` : port d’écoute de l’API, `4000` par défaut ;
- `JWT_SECRET` : clé privée utilisée pour signer les jetons d’authentification. Elle doit être longue, aléatoire et ne doit pas être publiée.

Le fichier `.env` est ignoré par Git et ne doit jamais être ajouté au dépôt.

## Démarrage du backend

Lancez le serveur avec :

```bash
pnpm start
```

Par défaut, l’API est accessible à l’adresse suivante :

http://localhost:4000

Au démarrage, le terminal doit confirmer l’écoute du serveur et la connexion à MongoDB.
