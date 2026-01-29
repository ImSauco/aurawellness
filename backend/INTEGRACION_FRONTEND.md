# 🔗 Integración Frontend → Backend

Guía para conectar tu sitio web actual (HTML/CSS/JS) con el backend FastAPI.

## 📡 URL Base del API

```javascript
const API_BASE = "http://localhost:8000";  // Desarrollo
// const API_BASE = "https://tu-dominio.com/api";  // Producción
```

## 🔐 Autenticación en Frontend

### 1. Registrar Usuario

```javascript
async function registrarUsuario(email, fullName, password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      full_name: fullName,
      password
    })
  });
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  return await response.json();
}
```

### 2. Login y Guardar Token

```javascript
async function loginUsuario(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error("Email o contraseña incorrectos");
  }
  
  const data = await response.json();
  
  // Guardar token en localStorage
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  
  return data;
}
```

### 3. Obtener Token para Requests

```javascript
function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}
```

### 4. Logout

```javascript
function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  window.location.href = "/";
}
```

---

## 💳 Implementar Pagos en el Formulario

### Actualizar tu formulario HTML existente:

```html
<form id="payment-form">
  <input type="number" id="amount" placeholder="Monto" required>
  <input type="text" id="description" placeholder="Descripción" required>
  <select id="payment-method">
    <option value="card">Tarjeta Crédito</option>
    <option value="bank_transfer">Transferencia Bancaria</option>
  </select>
  <button type="submit">Procesar Pago</button>
</form>
```

### JavaScript para procesar pago:

```javascript
document.getElementById("payment-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const paymentMethod = document.getElementById("payment-method").value;
  const user = JSON.parse(localStorage.getItem("user"));
  
  try {
    const response = await fetch(`${API_BASE}/payments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user_id: user.id,
        amount,
        description,
        payment_method: paymentMethod
      })
    });
    
    if (response.ok) {
      const payment = await response.json();
      alert(`✅ Pago creado: ID ${payment.id}`);
      
      // Limpiar formulario
      e.target.reset();
    } else {
      alert("❌ Error al procesar pago");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión");
  }
});
```

---

## 📅 Mostrar Eventos Dinámicos

### Obtener eventos del backend:

```javascript
async function cargarEventos() {
  try {
    const response = await fetch(`${API_BASE}/events`);
    const eventos = await response.json();
    
    // Renderizar eventos en HTML
    const container = document.getElementById("eventos-container");
    container.innerHTML = eventos.map(evento => `
      <div class="evento-card">
        <h3>${evento.title}</h3>
        <p>${evento.description}</p>
        <p>📅 ${new Date(evento.date_start).toLocaleDateString()}</p>
        <p>📍 ${evento.location}</p>
        <p>💵 $${evento.price}</p>
        <p>Lugares disponibles: ${evento.available_spots}/${evento.capacity}</p>
        <button onclick="agregarAlEvento(${evento.id})">Registrarse</button>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error cargando eventos:", error);
  }
}

// Agregar participante a evento
async function agregarAlEvento(eventId) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  try {
    const response = await fetch(
      `${API_BASE}/events/${eventId}/participants/${user.id}`,
      {
        method: "POST",
        headers: getAuthHeaders()
      }
    );
    
    if (response.ok) {
      alert("✅ Registrado en evento!");
      cargarEventos(); // Recargar lista
    } else {
      alert("❌ No se pudo registrar");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Cargar eventos al iniciar
cargarEventos();
```

---

## 👤 Panel Admin para Admins

### Mostrar panel solo si es admin:

```javascript
function mostrarPanelAdmin() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (user && user.role === "admin") {
    document.getElementById("admin-panel").style.display = "block";
  } else {
    document.getElementById("admin-panel").style.display = "none";
  }
}

// Cargar estadísticas del dashboard
async function cargarDashboard() {
  try {
    const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const stats = await response.json();
      
      document.getElementById("total-users").textContent = stats.total_users;
      document.getElementById("total-revenue").textContent = `$${stats.total_revenue}`;
      document.getElementById("pending-payments").textContent = stats.pending_payments;
      document.getElementById("total-events").textContent = stats.total_events;
    }
  } catch (error) {
    console.error("Error cargando dashboard:", error);
  }
}
```

### HTML para panel admin:

```html
<div id="admin-panel" style="display: none;">
  <h2>📊 Dashboard Admin</h2>
  
  <div class="stats">
    <div>
      <label>Usuarios Totales:</label>
      <span id="total-users">-</span>
    </div>
    <div>
      <label>Ingresos Totales:</label>
      <span id="total-revenue">$0</span>
    </div>
    <div>
      <label>Pagos Pendientes:</label>
      <span id="pending-payments">0</span>
    </div>
    <div>
      <label>Eventos Activos:</label>
      <span id="total-events">0</span>
    </div>
  </div>
  
  <h3>Gestionar Pagos</h3>
  <button onclick="irAPagos()">Ver Todos los Pagos</button>
  
  <h3>Gestionar Usuarios</h3>
  <button onclick="irAUsuarios()">Administrar Usuarios</button>
</div>
```

---

## 🛠️ Helpers Útiles

### Service/Utility para API:

```javascript
// api.js
class ByAuraAPI {
  constructor(baseURL = "http://localhost:8000") {
    this.baseURL = baseURL;
  }
  
  getHeaders() {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    };
  }
  
  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  // Métodos específicos
  async login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  }
  
  async getPayments() {
    return this.request("/payments");
  }
  
  async getEvents() {
    return this.request("/events");
  }
  
  async getDashboardStats() {
    return this.request("/admin/dashboard/stats");
  }
}

// Usar en tu app.js
const api = new ByAuraAPI();
```

---

## 🔒 CORS - Configuración Importante

El backend ya tiene CORS configurado para:
- `http://localhost:3000`
- `http://localhost:5173`
- `https://byaura.com`

Si cambias el dominio, edita `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://tu-nuevo-dominio.com"  # Agregar aquí
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📝 Ejemplo Completo: Formulario de Contacto → Pago

```javascript
// En tu app.js o en el formulario
const API = new ByAuraAPI("http://localhost:8000");

document.getElementById("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const service = document.getElementById("service").value;
  const amount = parseFloat(document.getElementById("amount").value);
  
  try {
    // 1. Registrar o login
    let user;
    try {
      user = await API.request("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          full_name: name,
          password: "TemporaryPass123!"  // Cambiar esto!
        })
      });
    } catch {
      // Intenta login si ya existe
      user = await API.login(email, "TemporaryPass123!");
      user = user.user;
    }
    
    // 2. Guardar token
    localStorage.setItem("access_token", user.access_token || localStorage.getItem("access_token"));
    
    // 3. Crear pago
    const payment = await API.request("/payments", {
      method: "POST",
      body: JSON.stringify({
        user_id: user.id,
        amount,
        description: `Servicio de ${service}`,
        payment_method: "form"
      })
    });
    
    alert(`✅ Pago registrado! ID: ${payment.id}`);
    
  } catch (error) {
    console.error(error);
    alert("❌ Error: " + error.message);
  }
});
```

---

## 📞 Soporte

Si tienes dudas sobre la integración:
1. Revisa los ejemplos en [EXAMPLES.md](./EXAMPLES.md)
2. Consulta la documentación interactiva: `http://localhost:8000/docs`
3. Verifica que el servidor está corriendo: `http://localhost:8000/health`
