## Backend LinkContact (Django REST)

Backend **production-ready V1** pour l'application SaaS **LinkContact**, 100% compatible avec le frontend React existant (`frontend/`).

### 1. Stack & Dépendances

- **Python 3**
- **Django 4.2**
- **Django REST Framework**
- **SimpleJWT** (JWT access + refresh)
- **Pillow** (images)
- **django-cors-headers**
- Base de données : **SQLite** (dev)

Installez les dépendances depuis le dossier `backend` :

```bash
pip install -r requirements.txt
```

> Si vous n’avez pas encore généré le `requirements.txt`, installez directement :
> `pip install Django djangorestframework djangorestframework-simplejwt Pillow django-cors-headers`

### 2. Configuration Django

- Projet Django : dossier `config/`
- Apps locales :
  - `apps.accounts` (User + Auth JWT)
  - `apps.shops` (Shop)
  - `apps.products` (Product)
  - `apps.stats` (Visit / statistiques)
- Utilisateur custom : `apps.accounts.models.User` (hérite de `AbstractUser`)
  - Champs ajoutés : `email` (unique, utilisé comme identifiant), `shop_name`, `slug`, `whatsapp_number`
  - `AUTH_USER_MODEL = 'accounts.User'`
- CORS ouvert pour le frontend :
  - `CORS_ALLOW_ALL_ORIGINS = True`
- Fichiers statiques / médias :
  - `MEDIA_URL = '/media/'`
  - `MEDIA_ROOT = BASE_DIR / 'media'`

**Auth globale DRF** (`REST_FRAMEWORK` dans `config/settings.py`) :

- `DEFAULT_AUTHENTICATION_CLASSES = (JWTAuthentication,)`
- `DEFAULT_PERMISSION_CLASSES = (IsAuthenticated,)`
- Parsers JSON + `multipart/form-data` déjà activés.

### 3. Modèles

- **User** (`apps.accounts.models.User`)
  - Hérite de `AbstractUser`
  - Champs : `username`, `email (unique)`, `password`, `shop_name`, `slug (unique)`, `whatsapp_number`
  - `USERNAME_FIELD = 'email'` (login via email côté frontend)

- **Shop** (`apps.shops.models.Shop`)
  - `user` (`OneToOne` vers `User`)
  - `description` (`TextField`)
  - `logo` (`ImageField`, upload vers `shops/logos/<user_id>/...`)

- **Product** (`apps.products.models.Product`)
  - `user` (`ForeignKey` vers `User`)
  - `name`, `description`
  - `price` (`DecimalField(max_digits=10, decimal_places=2)`)
  - `image` (`ImageField`, upload vers `products/<user_id>/...`)
  - `created_at` (`DateTimeField(auto_now_add=True)`)

- **Visit** (`apps.stats.models.Visit`)
  - `shop_slug` (slug de la boutique)
  - `action` (`view` | `whatsapp_click` | `visit`)
    - `visit` est accepté et mappé sur `view` pour compatibilité frontend
  - `created_at`

### 4. Authentification JWT (SimpleJWT)

Tout est préfixé par `/api/`.

- **POST `/api/auth/register/`**

  Body accepté (frontend actuel) :

  ```json
  {
    "email": "user@example.com",
    "password": "********",
    "first_name": "John",
    "last_name": "Doe",
    "shop_name": "Ma Boutique"
  }
  ```

  Le backend accepte également les champs spécifiés dans le cahier des charges :

  ```json
  {
    "username": "john",
    "email": "user@example.com",
    "password": "********",
    "shop_name": "Ma Boutique",
    "slug": "ma-boutique",
    "whatsapp_number": "+33 6 12 34 56 78"
  }
  ```

  Actions :

  - Création du `User`
  - Génération automatique du `slug` depuis `shop_name` si non fourni (et garantie d’unicité)
  - Création automatique du `Shop` associé
  - Retour des tokens + user

  **Réponse :**

  ```json
  {
    "access": "<ACCESS_TOKEN>",
    "refresh": "<REFRESH_TOKEN>",
    "user": {
      "id": 1,
      "username": "user@example.com",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "shop_name": "Ma Boutique",
      "slug": "ma-boutique",
      "whatsapp_number": "+33 6 12 34 56 78"
    }
  }
  ```

- **POST `/api/auth/login/`**

  Compatible cahier des charges **et** frontend :

  Body frontend :

  ```json
  { "email": "user@example.com", "password": "********" }
  ```

  Body cahier des charges (optionnel) :

  ```json
  { "username": "user@example.com", "password": "********" }
  ```

  **Réponse :**

  ```json
  {
    "access": "<ACCESS_TOKEN>",
    "refresh": "<REFRESH_TOKEN>"
  }
  ```

- **POST `/api/auth/refresh/`**

  Body :

  ```json
  { "refresh": "<REFRESH_TOKEN>" }
  ```

  **Réponse :**

  ```json
  { "access": "<NEW_ACCESS_TOKEN>" }
  ```

- **GET `/api/auth/me/`** (auth requise)

  Headers :

  - `Authorization: Bearer <ACCESS_TOKEN>`

  **Réponse :**

  ```json
  {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "shop_name": "Ma Boutique",
    "slug": "ma-boutique",
    "whatsapp_number": "+33 6 12 34 56 78"
  }
  ```

### 5. Endpoints Shop

- **GET `/api/shops/me/`** (auth requise)

  **Réponse :**

  ```json
  {
    "shop_name": "Ma Boutique",
    "name": "Ma Boutique",
    "slug": "ma-boutique",
    "description": "Texte libre",
    "whatsapp_number": "+33 6 12 34 56 78",
    "logo": "http://localhost:8000/media/shops/logos/1/logo.png"
  }
  ```

- **PUT `/api/shops/me/`** (auth requise, `multipart/form-data`)

  Champs gérés :

  - `name` (ou `shop_name`) : nom de la boutique
  - `slug`
  - `whatsapp_number`
  - `description`
  - `logo` (fichier image)

  **Réponse :** même format que `GET /api/shops/me/`.

- **GET `/api/shops/{slug}/`** (public)

  **Réponse :**

  ```json
  {
    "id": 1,
    "name": "Ma Boutique",
    "description": "Texte libre",
    "slug": "ma-boutique",
    "whatsapp_number": "+33 6 12 34 56 78",
    "logo": "http://localhost:8000/media/shops/logos/1/logo.png"
  }
  ```

- **GET `/api/shops/{slug}/products/`** (public)

  Retourne la liste des produits publics de la boutique :

  ```json
  [
    {
      "id": 1,
      "name": "Produit A",
      "description": "Description",
      "price": 19.9,
      "image": "http://localhost:8000/media/products/1/img.png"
    }
  ]
  ```

- **GET `/api/utils/check-slug/{slug}/`** (auth requise)

  Utilisé par le frontend pour vérifier la disponibilité d’un slug.

  **Réponse :**

  ```json
  { "available": true }
  ```

### 6. Endpoints Produits (CRUD)

Tous les endpoints produits nécessitent l’authentification (`IsAuthenticated`).

- **GET `/api/products/`**

  Liste les produits du user connecté.

  **Réponse :**

  ```json
  [
    {
      "id": 1,
      "name": "Produit A",
      "description": "Description",
      "price": 19.9,
      "image": "http://localhost:8000/media/products/1/img.png",
      "created_at": "2026-02-08T10:00:00Z",
      "user": 1
    }
  ]
  ```

- **POST `/api/products/`** (`multipart/form-data`)

  Champs :

  - `name` (str)
  - `description` (str)
  - `price` (decimal / str)
  - `image` (**obligatoire** à la création)

  **Réponse :** produit créé, même format que `GET /api/products/`.

- **GET `/api/products/{id}/`**

- **PUT `/api/products/{id}/`** (`multipart/form-data`, image facultative en édition)

- **DELETE `/api/products/{id}/`**

### 7. Endpoints Statistiques

- **POST `/api/stats/visit/`** (public)

  Body :

  ```json
  {
    "shop_slug": "ma-boutique",
    "action": "visit"
  }
  ```

  ou

  ```json
  {
    "shop_slug": "ma-boutique",
    "action": "whatsapp_click"
  }
  ```

  - `visit` est accepté et converti en `view` en base.

- **GET `/api/stats/me/`** (auth requise)

  Réponse compatible avec le frontend et Recharts :

  ```json
  {
    "total_visits": 42,
    "total_products": 5,
    "visits_by_day": [
      { "date": "2026-02-01", "count": 5 },
      { "date": "2026-02-02", "count": 8 }
    ],
    "chart_data": [
      { "date": "2026-02-01", "visits": 4, "whatsapp": 1, "count": 5 },
      { "date": "2026-02-02", "visits": 6, "whatsapp": 2, "count": 8 }
    ]
  }
  ```

- `total_visits` = nombre total de `Visit` pour le shop du user
- `total_products` = `request.user.products.count()`
- `visits_by_day` est utilisé par le Dashboard actuel (`dataKey="count"`)
- `chart_data` permet d’afficher des courbes séparées `visits` / `whatsapp` si besoin.

### 8. Lancement & Migrations

Depuis le dossier `backend` :

```bash
python manage.py makemigrations accounts shops products stats
python manage.py migrate
python manage.py runserver
```

Le backend est alors disponible sur :

- `http://localhost:8000/api/`

Le frontend (`frontend/`) est déjà configuré pour pointer sur cette base URL (`services/api.ts`).

### 9. Récapitulatif Compatibilité Frontend

- Base API : **`http://localhost:8000/api/`**
- Endpoints utilisés par le frontend :
  - `POST auth/register/`
  - `POST auth/login/`
  - `POST auth/refresh/`
  - `GET auth/me/`
  - `GET shops/me/`
  - `PUT shops/me/`
  - `GET shops/{slug}/`
  - `GET shops/{slug}/products/`
  - `GET products/` + `GET/PUT/DELETE products/{id}/`
  - `GET stats/me/`
  - `POST stats/visit/`
  - `GET utils/check-slug/{slug}/`

Tout le backend a été conçu pour respecter **strictement** :

- Les chemins d’URL attendus par le frontend existant
- Les formats de réponses JSON (clé / valeur)
- Les contraintes du cahier des charges (JWT, CORS, upload images, permissions).

