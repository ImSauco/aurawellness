# 🎯 By Aura Backend API

Backend de FastAPI para gestión de **pagos**, **eventos** y **usuarios** con **sistema de admin protegido por JWT**.

## ✨ Características

- ✅ **Autenticación JWT** - Tokens seguros con rol based access control
- ✅ **Panel de Admin** - Solo administradores pueden ver/editar pagos y usuarios
- ✅ **Base de Datos PostgreSQL** - Relacional, robusto, escalable
- ✅ **Modelos**: User, Payment, Event con relaciones Many-to-Many
- ✅ **Documentación Automática** - Swagger UI y ReDoc integrados
- ✅ **CORS Configurado** - Listo para conectar con frontend
- ✅ **Validación de Datos** - Pydantic para requests/responses
- ✅ **Password Hashing** - bcrypt para seguridad

## 🏗️ Estructura del Proyecto

```
backend/
├── main.py                    # Punto de entrada (FastAPI app)
├── requirements.txt           # Dependencias Python
├── .env                       # Variables de entorno (secretos)
├── .gitignore
├── SETUP.md                   # Guía de instalación
├── README.md                  # Este archivo
└── app/
    ├── __init__.py
    ├── config.py              # Configuración (settings)
    ├── database.py            # Conexión BD y sesiones
    ├── auth.py                # Lógica de autenticación JWT
    ├── models.py              # Modelos SQLAlchemy
    ├── schemas.py             # Validación Pydantic
    ├── dependencies.py        # get_current_user, get_admin_user
    └── routers/
        ├── __init__.py
        ├── auth.py            # POST /auth/register, /login
        ├── payments.py        # CRUD de pagos (protegido admin)
        ├── events.py          # CRUD de eventos
        └── admin.py           # Dashboard y gestión de usuarios
```

## 🔑 Modelos de Datos

### User
```python
{
  "id": 1,
  "email": "admin@byaura.com",
  "full_name": "Administrador",
  "role": "admin",  # o "user"
  "is_active": true,
  "created_at": "2026-01-22T10:30:00",
  "updated_at": "2026-01-22T10:30:00"
}
```

### Payment
```python
{
  "id": 1,
  "user_id": 1,
  "amount": 99.99,
  "status": "completed",  # pending, completed, failed, refunded
  "description": "Servicio de entrenamiento",
  "payment_method": "card",
  "transaction_id": "txn_123456",
  "created_at": "2026-01-22T10:30:00"
}
```

### Event
```python
{
  "id": 1,
  "title": "Workshop de Bienestar",
  "description": "Sesión de yoga corporativo",
  "date_start": "2026-02-15T18:00:00",
  "location": "Madrid, España",
  "capacity": 50,
  "price": 29.99,
  "participants_count": 12,
  "available_spots": 38,
  "is_active": true
}
```

## 🚀 Quick Start

### 1. Instalar dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar .env

```bash
# Edita .env con tus datos de PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/byaura_db
SECRET_KEY=tu-clave-secreta-cambiar-en-produccion
```

### 3. Ejecutar servidor

```bash
python main.py
```

### 4. Acceder a documentación

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 5. Registrarse como Admin

El **primer usuario** será automáticamente admin:

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@byaura.com",
    "full_name": "Admin",
    "password": "AdminPassword123!"
  }'
```

## 🔐 Autenticación

### Flujo de Login

1. **Registrarse**: `POST /auth/register`
2. **Login**: `POST /auth/login` → obtener `access_token`
3. **Usar token** en headers: `Authorization: Bearer <token>`

### Ejemplo con cURL

```bash
# 1. Login
TOKEN=$(curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@byaura.com","password":"AdminPassword123!"}' \
  | jq -r '.access_token')

# 2. Usar token
curl -X GET "http://localhost:8000/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Roles y Permisos

| Acción | User | Admin |
|--------|------|-------|
| Ver perfil | ✅ | ✅ |
| Crear pago | ✅ | ✅ |
| Ver todos los pagos | ❌ | ✅ |
| Editar estado de pago | ❌ | ✅ |
| Ver eventos | ✅ | ✅ |
| Crear evento | ❌ | ✅ |
| Editar evento | ❌ | ✅ |
| Eliminar evento | ❌ | ✅ |
| Ver usuarios | ❌ | ✅ |
| Cambiar rol de usuario | ❌ | ✅ |
| Ver dashboard | ❌ | ✅ |

## 🛣️ Rutas de la API

### 🔑 Autenticación (`/auth`)

```
POST   /auth/register          # Crear cuenta
POST   /auth/login             # Login (obtener token)
GET    /auth/me                # Datos del usuario actual
```

### 💳 Pagos (`/payments`)

```
POST   /payments               # Crear pago
GET    /payments               # Listar pagos (admin)
GET    /payments/{id}          # Detalles de pago (admin)
PATCH  /payments/{id}          # Editar estado (admin)
DELETE /payments/{id}          # Eliminar pago (admin)
GET    /payments/stats/summary # Estadísticas (admin)
```

### 📅 Eventos (`/events`)

```
POST   /events                 # Crear evento (admin)
GET    /events                 # Listar eventos
GET    /events/{id}            # Detalles del evento
PATCH  /events/{id}            # Editar evento (admin)
DELETE /events/{id}            # Eliminar evento (admin)
POST   /events/{id}/participants/{user_id}  # Agregar participante
DELETE /events/{id}/participants/{user_id}  # Remover participante (admin)
```

### 👥 Admin (`/admin`)

```
GET    /admin/dashboard/stats            # Estadísticas generales
GET    /admin/users                      # Listar usuarios
GET    /admin/users/{id}                 # Detalles del usuario
PATCH  /admin/users/{id}                 # Editar usuario
PATCH  /admin/users/{id}/toggle-role     # Cambiar rol admin/user
PATCH  /admin/users/{id}/toggle-active   # Activar/desactivar
DELETE /admin/users/{id}                 # Eliminar usuario
```

## 📚 Documentación Completa

Ver [SETUP.md](./SETUP.md) para:
- ✅ Instalación paso a paso
- ✅ Configuración de PostgreSQL
- ✅ Ejemplos de API calls
- ✅ Solución de problemas
- ✅ Guía de despliegue en producción

## 🛠️ Desarrollo

### Crear migraciones (si usas Alembic)

```bash
# Esto se puede implementar más adelante
alembic init migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Ejecutar tests (próximamente)

```bash
pytest tests/
```

## 🌐 Despliegue

### Railway (Recomendado)

```bash
railway link
railway up
```

### Variables en Producción

- `DATABASE_URL` → PostgreSQL remota
- `SECRET_KEY` → Clave fuerte (32+ caracteres)
- `ALGORITHM` → HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES` → 30

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ JWT con expiración configurable
- ✅ CORS restringido a dominios autorizados
- ✅ Role-based access control
- ✅ SQL injection protection (SQLAlchemy ORM)
- ✅ HTTPS recomendado en producción

## 📞 Soporte

Para problemas, revisa [SETUP.md](./SETUP.md#-problemas-comunes)

## 📄 Licencia

Por Aura 2026
