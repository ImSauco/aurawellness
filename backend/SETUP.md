# 🚀 By Aura Backend - Guía de Instalación y Ejecución

## 📋 Requisitos

- Python 3.10+
- PostgreSQL instalado y ejecutándose
- pip (gestor de paquetes Python)

## 1️⃣ Configuración de PostgreSQL

### Windows con pgAdmin

1. Abre pgAdmin (gestor de PostgreSQL)
2. Crea una nueva base de datos:
   - **Name**: `byaura_db`
   - **Owner**: `postgres` (o tu usuario)

3. Obtén los detalles de conexión:
   - **Host**: `localhost`
   - **Port**: `5432` (por defecto)
   - **Database**: `byaura_db`
   - **Username**: `postgres`
   - **Password**: tu contraseña de PostgreSQL

## 2️⃣ Configuración del Backend

### Paso 1: Clonar variables de entorno

Edita el archivo `.env` con tus detalles de PostgreSQL:

```env
DATABASE_URL=postgresql://tu_usuario:tu_contraseña@localhost:5432/byaura_db
SECRET_KEY=tu-clave-secreta-muy-larga-y-segura-cambiar-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

⚠️ **IMPORTANTE**: En producción, usa una SECRET_KEY fuerte (mínimo 32 caracteres aleatorios).

### Paso 2: Instalar dependencias

```bash
# Navega a la carpeta backend
cd backend

# Instala las dependencias
pip install -r requirements.txt
```

### Paso 3: Ejecutar el servidor

```bash
# En desarrollo (con auto-reload)
python main.py

# O con uvicorn directamente
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: `http://localhost:8000`

## 3️⃣ Acceder a la API

### Documentación interactiva (Swagger UI)
- URL: `http://localhost:8000/docs`

### Documentación alternativa (ReDoc)
- URL: `http://localhost:8000/redoc`

## 4️⃣ Crear Admin Inicial

El **primer usuario registrado será automáticamente ADMIN**.

### Registrarse (POST)
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@byaura.com",
    "full_name": "Admin",
    "password": "AdminPassword123!"
  }'
```

**Respuesta exitosa**:
```json
{
  "id": 1,
  "email": "admin@byaura.com",
  "full_name": "Admin",
  "role": "admin",
  "is_active": true,
  "created_at": "2026-01-22T10:30:00",
  "updated_at": "2026-01-22T10:30:00"
}
```

### Login (POST)
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@byaura.com",
    "password": "AdminPassword123!"
  }'
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@byaura.com",
    "role": "admin",
    "is_active": true
  }
}
```

## 5️⃣ Usar el Token en Requests

Una vez tienes el token, úsalo en todos los requests autenticados:

```bash
curl -X GET "http://localhost:8000/admin/users" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 📊 Endpoints Principales

### 🔐 Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Login y obtener token
- `GET /auth/me` - Datos del usuario actual

### 💳 Pagos (Admin)
- `GET /payments` - Listar todos los pagos
- `POST /payments` - Crear pago
- `GET /payments/{id}` - Detalles del pago
- `PATCH /payments/{id}` - Actualizar estado
- `DELETE /payments/{id}` - Eliminar pago
- `GET /payments/stats/summary` - Estadísticas de pagos

### 📅 Eventos
- `GET /events` - Listar eventos
- `POST /events` - Crear evento (solo admin)
- `GET /events/{id}` - Detalles del evento
- `PATCH /events/{id}` - Actualizar evento (solo admin)
- `DELETE /events/{id}` - Eliminar evento (solo admin)
- `POST /events/{id}/participants/{user_id}` - Agregar participante

### 👥 Admin Panel
- `GET /admin/dashboard/stats` - Estadísticas del dashboard
- `GET /admin/users` - Listar usuarios
- `GET /admin/users/{id}` - Detalles del usuario
- `PATCH /admin/users/{id}` - Actualizar usuario
- `PATCH /admin/users/{id}/toggle-role` - Cambiar rol (admin/user)
- `PATCH /admin/users/{id}/toggle-active` - Activar/desactivar
- `DELETE /admin/users/{id}` - Eliminar usuario

## 🗄️ Estructura Base de Datos

### Tabla: users
```
id (PRIMARY KEY)
email (UNIQUE)
full_name
hashed_password
role (admin, user)
is_active
created_at
updated_at
```

### Tabla: payments
```
id (PRIMARY KEY)
user_id (FOREIGN KEY)
amount
status (pending, completed, failed, refunded)
description
payment_method
transaction_id (UNIQUE)
created_at
updated_at
```

### Tabla: events
```
id (PRIMARY KEY)
title
description
date_start
date_end
location
capacity
price
image_url
is_active
created_at
updated_at
```

### Tabla: user_event_association
```
user_id (FOREIGN KEY)
event_id (FOREIGN KEY)
```

## 🔧 Variables de Entorno (.env)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| DATABASE_URL | URL de conexión PostgreSQL | `postgresql://user:pass@localhost:5432/byaura_db` |
| SECRET_KEY | Clave para firmar JWT | `tu-clave-super-secreta-32-caracteres-minimo` |
| ALGORITHM | Algoritmo JWT | `HS256` |
| ACCESS_TOKEN_EXPIRE_MINUTES | Expiración del token (minutos) | `30` |

## 🚨 Problemas Comunes

### Error: `psycopg2.OperationalError`
**Causa**: No hay conexión a PostgreSQL
**Solución**: 
1. Verifica que PostgreSQL está ejecutándose
2. Revisa la DATABASE_URL en .env
3. Confirma usuario/contraseña

### Error: `ModuleNotFoundError: No module named 'fastapi'`
**Solución**: Instala dependencias: `pip install -r requirements.txt`

### Error: `401 Unauthorized`
**Causa**: Token inválido o expirado
**Solución**: Haz login nuevamente y obtén un nuevo token

## 📦 Despliegue en Producción

Para desplegar en producción (Railway, Heroku, etc.):

1. **Cambiar SECRET_KEY** a una clave fuerte
2. **Usar PostgreSQL remota** (no SQLite)
3. **Configurar CORS** con dominio correcto
4. **Usar HTTPS** obligatoriamente
5. **Variables de entorno** en el servidor de alojamiento

Ejemplo con Railway:
```bash
railway link
railway up
```

## 📚 Documentación Adicional

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Auth](https://python-jose.readthedocs.io/)
