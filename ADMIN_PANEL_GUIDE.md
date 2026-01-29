# 🔐 Panel Administrativo - Guía de Uso

## 📍 Acceso al Panel Admin

### URL
```
http://localhost:8000/admin.html
```

O desde el menú del sitio: **"🔐 Panel Admin"**

---

## 🔑 Login Administrativo

1. **Entra a la página del admin**: `/admin.html`
2. **Ingresa credenciales**:
   - Email: `admin@byaura.com` (o el del primer usuario registrado)
   - Contraseña: Tu contraseña de admin

> ⚠️ **Solo los usuarios con rol ADMIN pueden acceder**

---

## 📊 Dashboard - Estadísticas Principales

El dashboard muestra 6 tarjetas con información clave:

- **👥 Usuarios Totales** - Cantidad de usuarios registrados
- **💰 Ingresos Totales** - Suma de todos los pagos completados
- **⏳ Pagos Pendientes** - Pagos sin confirmar
- **✅ Pagos Completados** - Pagos finalizados
- **📅 Eventos Activos** - Eventos en vigor
- **📈 Total Pagos** - Cantidad total de registros de pago

---

## 👥 Gestión de Usuarios

### Funcionalidades:

#### 🔍 **Buscar Usuario**
- Campo de búsqueda en tiempo real
- Filtra por email, nombre o ID

#### 📋 **Listar Usuarios**
Tabla con columnas:
- ID
- Email
- Nombre Completo
- Rol (Admin / Usuario)
- Estado (Activo / Inactivo)
- Fecha de Registro
- Acciones

#### ✏️ **Editar Usuario**
1. Click en botón "Editar"
2. Modifica: Email y Nombre Completo
3. Click en "Guardar Cambios"

#### 👑 **Cambiar Rol**
1. Click en "Cambiar Rol"
2. El usuario pasa de User → Admin o viceversa
3. Requiere confirmación

#### 🔄 **Activar/Desactivar**
1. Click en "Activar/Desactivar"
2. Un usuario inactivo **no puede** loguearse
3. Útil para usuarios que se dan de baja

#### 🗑️ **Eliminar Usuario**
- Elimina completamente el usuario
- ⚠️ Esta acción NO se puede deshacer
- Se eliminarán todos sus registros relacionados

---

## 💳 Gestión de Pagos

### Funcionalidades:

#### 🔤 **Filtrar por Estado**
Dropdown con opciones:
- Todos los estados
- ⏳ Pendiente
- ✅ Completado
- ❌ Fallido
- ↩️ Reembolsado

#### 📋 **Tabla de Pagos**
Columnas:
- ID del pago
- Email del usuario
- Monto ($)
- Estado actual
- Descripción
- Método de pago
- Fecha del pago
- Acciones

#### ✏️ **Editar Pago**
1. Click en "Editar"
2. Cambia el **Estado** del pago:
   - De "pending" a "completed" para confirmar
   - De "completed" a "refunded" para reembolsar
   - etc.
3. Agrega o modifica la descripción
4. Click en "Guardar Cambios"

#### 🗑️ **Eliminar Pago**
- Elimina un registro de pago
- ⚠️ NO se puede deshacer
- Afecta estadísticas de ingresos

#### 📊 **Ver Estadísticas de Pagos**
- Total ingresos (pagos completados)
- Cantidad de pagos completados
- Cantidad de pagos pendientes
- Cantidad de pagos fallidos
- Cantidad de pagos reembolsados

---

## 📅 Gestión de Eventos

### Funcionalidades:

#### ➕ **Crear Evento**
1. Click en "+ Crear Evento"
2. Completa el formulario:
   - **Título** (obligatorio)
   - **Descripción** (opcional)
   - **Fecha de Inicio** (obligatorio)
   - **Fecha de Fin** (opcional)
   - **Ubicación** (opcional)
   - **Capacidad** (número de lugares, default: 100)
   - **Precio** ($, default: 0)
   - **URL de Imagen** (link a imagen)
3. Click en "Guardar Evento"

#### 📊 **Vista de Grid**
- Cards con información visual del evento
- Muestra imagen, título, descripción
- Barra de capacidad (participantes/total)
- Badge de estado (Activo/Inactivo)

#### ✏️ **Editar Evento**
1. Click en "Editar" en la tarjeta del evento
2. Modifica los campos
3. Click en "Guardar Evento"

#### 🗑️ **Eliminar Evento**
- Elimina el evento completamente
- ⚠️ NO se puede deshacer
- Los participantes se desasocian automáticamente

#### 📈 **Ver Capacidad**
- Barra visual: participantes / capacidad total
- Se actualiza en tiempo real
- Color rojo si está lleno

---

## 🎨 Interfaz Visual

### Navegación por Pestañas

El panel tiene 4 pestañas principales:

1. **📊 Dashboard** - Estadísticas generales
2. **👥 Usuarios** - Gestión completa de usuarios
3. **💳 Pagos** - Gestión de transacciones
4. **📅 Eventos** - Gestión de eventos

Navega haciendo click en cada tab.

### Diseño Responsivo

- ✅ Optimizado para **escritorio** (recomendado)
- ✅ Funciona en **tablets**
- ✅ Funciona en **móviles** (con overflow en tablas)

---

## 🔒 Seguridad

### Autenticación JWT
- Token válido durante **30 minutos**
- Después expira y debe volver a login
- Token guardado en `localStorage`

### Cierre de Sesión
- Click en "Cerrar Sesión"
- Elimina token y sesión
- Vuelve a la pantalla de login

---

## ⚠️ Confirmaciones Importantes

El sistema pide confirmación antes de:

- ❌ **Cambiar rol de usuario** - "¿Cambiar rol de este usuario?"
- ❌ **Activar/Desactivar usuario** - "¿Cambiar estado de este usuario?"
- ❌ **Eliminar evento** - "¿Eliminar este evento? Esta acción no se puede deshacer."
- ❌ **Eliminar pago** - "¿Eliminar este pago? Esta acción no se puede deshacer."

---

## 💡 Consejos Útiles

### 📱 Tabla de Pagos
- Si la tabla es muy ancha en móvil, usa el filtro para reducir resultados
- O abre en desktop para mejor visualización

### 🖼️ Eventos
- Agrega imagen URLs de buena calidad (min 300x200px)
- Usa el formato ISO 8601 para fechas: `2026-02-15T18:00`
- La barra de capacidad es visual, útil para ver eventos llenos

### 👥 Usuarios
- Busca rápidamente por email o nombre
- Mantén al menos 1 admin activo
- Los usuarios inactivos aparecen con ❌

---

## 🚨 Errores Comunes

### "Invalid or expired token"
**Causa**: Token expiró (30 minutos)  
**Solución**: Cierra sesión y vuelve a loguearte

### "Only admins can access this resource"
**Causa**: Tu usuario no es admin  
**Solución**: Usa una cuenta con rol ADMIN

### "Error: Network request failed"
**Causa**: Backend no está ejecutándose  
**Solución**: Inicia el servidor FastAPI: `python main.py` en la carpeta `/backend`

### Tabla no carga datos
**Causa**: API retorna error  
**Solución**: 
1. Verifica que el backend está corriendo
2. Revisa que tengas permisos de admin
3. Abre la consola (F12) y revisa errores

---

## 📞 Contacto y Soporte

Si tienes problemas:

1. **Verifica el servidor backend**: `http://localhost:8000/health`
2. **Abre consola** (F12 → Console) y revisa errores
3. **Revisa que CORS está configurado** correctamente en backend
4. **Intenta limpiar localStorage**: F12 → Application → localStorage → clear

---

## 🎯 Flujos Comunes

### Procesar un Pago
1. Ve a **Pagos**
2. Busca el pago con estado "pending"
3. Click en **Editar**
4. Cambia estado a "completed"
5. Agregue referencia en descripción (si quieres)
6. Click **Guardar**

### Registrar un Nuevo Admin
1. Ve a **Usuarios**
2. Busca el usuario a convertir en admin
3. Click en **Cambiar Rol**
4. Confirma
5. Ahora tiene acceso al panel

### Crear un Evento para la Semana
1. Ve a **Eventos**
2. Click **+ Crear Evento**
3. Completa datos del evento
4. Agrega URL de imagen
5. Click **Guardar Evento**
6. El evento aparece en la web automáticamente

---

## 📚 Más Información

- [README Backend](backend/README.md) - Documentación completa del API
- [SETUP Backend](backend/SETUP.md) - Instalación y configuración
- [EXAMPLES API](backend/EXAMPLES.md) - Ejemplos de requests
