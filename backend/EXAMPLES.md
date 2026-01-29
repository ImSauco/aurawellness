# 🧪 Ejemplos de Requests para By Aura API

## 📋 Índice

1. [Autenticación](#autenticación)
2. [Pagos](#pagos)
3. [Eventos](#eventos)
4. [Admin Panel](#admin-panel)

---

## 🔐 Autenticación

### 1. Registrarse como Admin (Primer Usuario)

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@byaura.com",
    "full_name": "Administrador By Aura",
    "password": "AdminPassword123!"
  }'
```

**Respuesta (201)**:
```json
{
  "id": 1,
  "email": "admin@byaura.com",
  "full_name": "Administrador By Aura",
  "role": "admin",
  "is_active": true,
  "created_at": "2026-01-22T10:30:00",
  "updated_at": "2026-01-22T10:30:00"
}
```

### 2. Registrarse como Usuario Regular

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "full_name": "Juan García",
    "password": "SecurePass123!"
  }'
```

### 3. Login (Obtener Token)

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
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBieWF1cmEuY29tIiwiZXhwIjoxNjM3MjM2MDAwfQ.X...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@byaura.com",
    "full_name": "Administrador By Aura",
    "role": "admin",
    "is_active": true
  }
}
```

**Guardar token para requests posteriores**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Obtener Info del Usuario Actual

```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💳 Pagos

### 1. Crear Pago

```bash
curl -X POST "http://localhost:8000/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "user_id": 2,
    "amount": 99.99,
    "description": "Servicio de entrenamiento corporativo",
    "payment_method": "card"
  }'
```

**Respuesta**:
```json
{
  "id": 1,
  "user_id": 2,
  "amount": 99.99,
  "status": "pending",
  "description": "Servicio de entrenamiento corporativo",
  "payment_method": "card",
  "transaction_id": null,
  "created_at": "2026-01-22T10:30:00",
  "updated_at": "2026-01-22T10:30:00"
}
```

### 2. Listar Todos los Pagos (Admin)

```bash
curl -X GET "http://localhost:8000/payments/?skip=0&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Listar Pagos Pendientes (Admin)

```bash
curl -X GET "http://localhost:8000/payments/?status_filter=pending" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Obtener Detalles de un Pago (Admin)

```bash
curl -X GET "http://localhost:8000/payments/1" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Actualizar Estado de Pago (Admin)

```bash
curl -X PATCH "http://localhost:8000/payments/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "completed",
    "description": "Pago confirmado por tarjeta"
  }'
```

### 6. Obtener Estadísticas de Pagos (Admin)

```bash
curl -X GET "http://localhost:8000/payments/stats/summary" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta**:
```json
{
  "total_amount": 299.97,
  "completed_count": 3,
  "pending_count": 1,
  "failed_count": 0,
  "refunded_count": 0
}
```

### 7. Eliminar Pago (Admin)

```bash
curl -X DELETE "http://localhost:8000/payments/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📅 Eventos

### 1. Crear Evento (Admin)

```bash
curl -X POST "http://localhost:8000/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Workshop de Yoga Corporativo",
    "description": "Sesión de yoga diseñada para empresas",
    "date_start": "2026-02-15T18:00:00",
    "date_end": "2026-02-15T19:30:00",
    "location": "Madrid, España",
    "capacity": 50,
    "price": 29.99,
    "image_url": "https://example.com/yoga.jpg"
  }'
```

### 2. Listar Eventos

```bash
curl -X GET "http://localhost:8000/events/?skip=0&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Obtener Detalles de Evento

```bash
curl -X GET "http://localhost:8000/events/1" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Actualizar Evento (Admin)

```bash
curl -X PATCH "http://localhost:8000/events/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Workshop de Yoga Corporativo - Actualizado",
    "capacity": 75,
    "price": 39.99
  }'
```

### 5. Agregar Participante a Evento

```bash
curl -X POST "http://localhost:8000/events/1/participants/2" \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Remover Participante (Admin)

```bash
curl -X DELETE "http://localhost:8000/events/1/participants/2" \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Eliminar Evento (Admin)

```bash
curl -X DELETE "http://localhost:8000/events/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 👥 Admin Panel

### 1. Ver Dashboard de Estadísticas (Admin)

```bash
curl -X GET "http://localhost:8000/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta**:
```json
{
  "total_users": 5,
  "total_payments": 10,
  "total_revenue": 599.90,
  "pending_payments": 2,
  "completed_payments": 8,
  "total_events": 3,
  "active_events": 2
}
```

### 2. Listar Todos los Usuarios (Admin)

```bash
curl -X GET "http://localhost:8000/admin/users/?skip=0&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Ver Detalles de Usuario (Admin)

```bash
curl -X GET "http://localhost:8000/admin/users/2" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Actualizar Usuario (Admin)

```bash
curl -X PATCH "http://localhost:8000/admin/users/2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "full_name": "Juan García Pérez",
    "email": "juan.garcia@example.com"
  }'
```

### 5. Cambiar Rol de Usuario (Admin)

```bash
curl -X PATCH "http://localhost:8000/admin/users/2/toggle-role" \
  -H "Authorization: Bearer $TOKEN"
```

**Usuario pasa de "user" a "admin" (o viceversa)**

### 6. Activar/Desactivar Usuario (Admin)

```bash
curl -X PATCH "http://localhost:8000/admin/users/2/toggle-active" \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Eliminar Usuario (Admin)

```bash
curl -X DELETE "http://localhost:8000/admin/users/2" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐍 Script Python Útil para Testing

```python
import requests
import json

BASE_URL = "http://localhost:8000"
TOKEN = None

def login():
    global TOKEN
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "admin@byaura.com",
            "password": "AdminPassword123!"
        }
    )
    TOKEN = response.json()["access_token"]
    print(f"✅ Login exitoso. Token: {TOKEN[:30]}...")

def get_headers():
    return {"Authorization": f"Bearer {TOKEN}"}

def create_payment(user_id, amount, description):
    response = requests.post(
        f"{BASE_URL}/payments",
        headers=get_headers(),
        json={
            "user_id": user_id,
            "amount": amount,
            "description": description,
            "payment_method": "card"
        }
    )
    return response.json()

def list_payments():
    response = requests.get(
        f"{BASE_URL}/payments",
        headers=get_headers()
    )
    return response.json()

def get_stats():
    response = requests.get(
        f"{BASE_URL}/admin/dashboard/stats",
        headers=get_headers()
    )
    return response.json()

if __name__ == "__main__":
    login()
    
    print("\n📊 Dashboard Stats:")
    stats = get_stats()
    print(json.dumps(stats, indent=2))
    
    print("\n💳 Todos los pagos:")
    payments = list_payments()
    print(json.dumps(payments, indent=2))
```

---

## 🔒 Errores Comunes

### 401 Unauthorized
- Token inválido o expirado
- **Solución**: Haz login nuevamente

### 403 Forbidden
- No tienes permisos (no eres admin)
- **Solución**: Usa una cuenta de admin

### 404 Not Found
- Recurso no existe
- **Solución**: Verifica el ID

### 400 Bad Request
- Validación de datos fallida
- **Solución**: Revisa el formato JSON

---

## 💡 Tips

- Usa Postman o Insomnia para testing más fácil
- Copia el TOKEN en variable de entorno: `export TOKEN="..."`
- Usa `jq` para parsear JSON: `curl ... | jq '.access_token'`
- Documentación interactiva en: `http://localhost:8000/docs`
