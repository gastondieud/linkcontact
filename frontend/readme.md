
# 🚀 LinkContact Frontend V1

Bienvenue sur le frontend de **LinkContact**, la solution SaaS moderne pour les vendeurs locaux.

## 🛠 Stack Technique
- **React 18** & **Vite**
- **TypeScript** (pour une maintenance et robustesse accrue)
- **Tailwind CSS** (Design mobile-first & minimaliste)
- **Zustand** (Gestion d'état globale légère)
- **Axios** (Client HTTP avec interceptors JWT)
- **React Router 6** (Navigation)
- **Lucide React** (Iconographie)
- **Recharts** (Statistiques visuelles)

## 📁 Architecture du projet
- `services/api.ts`: Instance Axios configurée avec gestion automatique du Bearer Token et du Refresh Token.
- `store/useStore.ts`: Store unique gérant l'authentification, les données de la boutique, les produits et les stats.
- `components/`: Composants réutilisables (Layout, Sidebar, etc.).
- `pages/`: Vues principales de l'application (Dashboard, Login, Settings, Boutique publique).

## 🔑 Fonctionnalités clés
1. **Authentification JWT**: Inscription et Connexion avec stockage sécurisé et rafraîchissement auto du token.
2. **Dashboard Vendeur**: Visualisation des statistiques de visites (graphiques Recharts) et liste des produits.
3. **Gestion de Boutique**: Modification du slug (lien personnalisé), description et numéro WhatsApp.
4. **Catalogue Produits**: CRUD complet avec téléchargement d'images via `multipart/form-data`.
5. **Page Publique (`/shop/:slug`)**: Page optimisée pour les clients avec bouton de commande WhatsApp direct.
6. **Statistiques**: Suivi des visites et des clics WhatsApp via l'API.

## 🚀 Installation & Lancement
1. Assurez-vous que votre backend tourne sur `http://localhost:8000`.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## 📝 Notes pour le Backend
Le frontend s'attend aux endpoints suivants :
- `POST /auth/register/` & `POST /auth/login/`
- `GET /auth/me/`
- `GET /shops/me/` & `PUT /shops/me/`
- `GET /shops/{slug}/` (Public)
- `GET /products/` (CRUD complet)
- `GET /stats/me/` (Données formatées pour graphiques)
- `POST /stats/visit/` (Tracking)
