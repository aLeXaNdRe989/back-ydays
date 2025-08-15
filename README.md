Altern’ Work – Back‑end API
 
 

Ce dépôt contient le code serveur de la plateforme Altern’ Work. Il s’agit d’une API REST construite avec Node.js, Express et MongoDB (via Mongoose), qui gère les utilisateurs, les entreprises, les offres d’alternance, les diplômes, les écoles et les évaluations.

Fonctionnalités principales
Authentification et autorisations : inscription et connexion via JWT, gestion des rôles (candidat, entreprise, administrateur).

CRUD sur les entités : utilisateurs, entreprises, offres, diplômes, écoles, évaluations, photos.

Documentation : génération automatique de la spécification OpenAPI avec swagger-jsdoc et consultation via /api/docs.

Tests automatisés : suite de tests avec Jest, Supertest et mongodb-memory-server.

Prérequis
Node.js (version 18 ou ultérieure).

npm (installé avec Node).

Un accès à MongoDB (par exemple MongoDB Atlas) ou un serveur local.

Installation
Clonez ce dépôt :

bash
Copier
Modifier
git clone https://github.com/aLeXaNdRe989/back-ydays.git
cd back-ydays
Installez les dépendances :

bash
Copier
Modifier
npm install
Créez un fichier .env à la racine du projet avec les variables suivantes :

env
Copier
Modifier
PORT=3000
JWT_SECRET=monSuperSecretJWT
MONGO_URI=chaine_de_connexion_mongodb

Lancement
Pour lancer le serveur en mode production :

bash
Copier
Modifier
npm start
Le serveur démarre sur le port défini dans le fichier .env (3000 par défaut) et expose l’API sous http://localhost:PORT/api.

Pour lancer en mode développement avec rechargement automatique (nodemon) :

bash
Copier
Modifier
npm run dev
Tests
L’exécution des tests s’effectue avec :

bash
Copier
Modifier
npm test
Cette commande lance les tests écrits avec Jest et Supertest. Une instance de MongoDB en mémoire est utilisée pour l’occasion, ce qui évite de polluer votre base de données.

Pour générer un rapport de couverture :

bash
Copier
Modifier
npm run test:coverage
Documentation de l’API

bash
Copier
Modifier
http://localhost:PORT/api/docs

Commandes utiles
Commande	Description
npm start	Démarre le serveur en production
npm run dev	Démarre le serveur avec nodemon pour recharger automatiquement
npm test	Exécute les tests avec Jest et Supertest
npm run test:coverage	Génère un rapport de couverture

Déploiement
Le projet est conçu pour être déployé sur Render. Une fois le dépôt connecté, Render installe les dépendances, lit les variables d’environnement (PORT, JWT_SECRET, MONGO_URI) et lance npm start. L’URL publique générée servira de base pour le client. N’oubliez pas de reporter vos variables .env dans la section Environment de Render.

Contribution
Tableau des routes API
Voici un aperçu des principaux endpoints exposés par l’API. Pour plus de détails et de paramètres, consultez la documentation Swagger.

Méthode	Route	Description
POST	/auth/register	Inscription d’un nouvel utilisateur
POST	/auth/login	Authentification et génération de JWT
GET	/entreprises	Liste des entreprises
POST	/entreprises	Création d’une entreprise (entreprise/admin)
GET	/offres	Liste des offres d’alternance
POST	/offres	Création d’une offre (entreprise/admin)
GET	/diplomes	Liste des diplômes
GET	/ecoles	Liste des écoles
GET	/evaluations	Liste des évaluations
POST	/evaluations	Déposer une évaluation (candidat)
GET	/api/docs	Interface Swagger de la documentation

Technologies principales
Ce projet utilise Node.js et Express pour le serveur HTTP, Mongoose pour la base de données MongoDB, Bcrypt et JSON Web Token pour l’authentification et la sécurité, et Jest avec Supertest pour les tests. La documentation est générée par swagger-jsdoc et servie par swagger-ui-express. Des middlewares assurent l’authentification (authMiddleware), la gestion des rôles et la protection des routes.
