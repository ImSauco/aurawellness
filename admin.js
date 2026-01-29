/**
 * BY AURA - Panel Administrativo
 * Gestión de usuarios, pagos y eventos
 */

// ===== CONFIGURACIÓN =====
const API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:8000'
  : 'https://aurawellness.onrender.com'; 
let TOKEN = null;
let CURRENT_USER = null;
let MESSAGES_CACHE = new Map();
let ACTIVE_MESSAGE_ID = null;
let CREATE_PRODUCT_AUTOSAVING = false;
const CURRENCY_FORMATTER = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
});

function formatCurrency(value) {
  const number = Number(value) || 0;
  return CURRENCY_FORMATTER.format(number);
}

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", () => {
  // Verificar si ya hay token guardado
  const savedToken = localStorage.getItem("access_token");
  if (savedToken) {
    TOKEN = savedToken;
    CURRENT_USER = JSON.parse(localStorage.getItem("user"));
    mostrarPanel();
  } else {
    mostrarLoginModal();
  }

  // Event listeners
  document.getElementById("login-form")?.addEventListener("submit", handleLogin);
  document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
  document.getElementById("edit-user-form")?.addEventListener("submit", handleEditUser);
  document.getElementById("create-user-form")?.addEventListener("submit", handleCreateUser);
  document.getElementById("edit-payment-form")?.addEventListener("submit", handleEditPayment);
  document.getElementById("create-payment-form")?.addEventListener("submit", handleCreatePayment);
  document.getElementById("event-form")?.addEventListener("submit", handleSaveEvent);
  document.getElementById("create-product-form")?.addEventListener("submit", handleCreateProduct);
  document.getElementById("edit-product-form")?.addEventListener("submit", handleEditProduct);
  document.getElementById("change-password-form")?.addEventListener("submit", handleChangePassword);

  document.getElementById("create-product-image-file")?.addEventListener("change", handleCreateProductImageChange);
  document.getElementById("edit-product-image-file")?.addEventListener("change", handleEditProductImageChange);

  document.getElementById("create-product-name")?.addEventListener("input", tryAutoCreateProduct);
  document.getElementById("create-product-sku")?.addEventListener("input", tryAutoCreateProduct);
  document.getElementById("create-product-price")?.addEventListener("input", tryAutoCreateProduct);
  document.getElementById("create-product-stock")?.addEventListener("input", tryAutoCreateProduct);
  document.getElementById("create-product-active")?.addEventListener("change", tryAutoCreateProduct);

  document.getElementById("change-password-btn")?.addEventListener("click", abrirModalCambiarPassword);

  const menuToggle = document.querySelector(".nav-logo-btn");
  const adminMenu = document.getElementById("admin-menu");

  function openMenu() {
    if (!adminMenu || !menuToggle) return;
    adminMenu.hidden = false;
    adminMenu.dataset.open = "true";
    menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!adminMenu || !menuToggle) return;
    adminMenu.dataset.open = "false";
    adminMenu.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = adminMenu?.dataset.open === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener("click", (e) => {
    if (!adminMenu || !menuToggle) return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (adminMenu.contains(target) || menuToggle.contains(target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = e.target.dataset.tab;
      switchTab(tab);
      const menuToggle = document.querySelector(".nav-logo-btn");
      const adminMenu = document.getElementById("admin-menu");
      if (adminMenu) {
        adminMenu.hidden = true;
      }
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Filtros
  document.getElementById("filter-status")?.addEventListener("change", cargarPagos);
  document.getElementById("search-users")?.addEventListener("keyup", filtrarUsuarios);
});

// ===== AUTENTICACIÓN =====
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error("Email o contraseña incorrectos");
    }

    const data = await response.json();

    // Verificar que sea admin
    if (data.user.role !== "admin") {
      throw new Error("Solo los administradores pueden acceder aquí");
    }

    // Guardar token
    TOKEN = data.access_token;
    CURRENT_USER = data.user;
    localStorage.setItem("access_token", TOKEN);
    localStorage.setItem("user", JSON.stringify(CURRENT_USER));

    errorEl.textContent = "";
    mostrarPanel();

  } catch (error) {
    errorEl.textContent = "❌ " + error.message;
  }
}

function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  TOKEN = null;
  CURRENT_USER = null;
  location.reload();
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${TOKEN}`
  };
}

// ===== CAMBIO DE VISTAS =====
function mostrarLoginModal() {
  document.getElementById("login-modal").classList.add("active");
  document.getElementById("admin-panel").style.display = "none";
}

function mostrarPanel() {
  document.getElementById("login-modal").classList.remove("active");
  document.getElementById("admin-panel").style.display = "block";

  document.getElementById("admin-name").textContent = CURRENT_USER.full_name || CURRENT_USER.email;

  // Cargar dashboard al iniciar
  cargarDashboard();
}

function abrirModalCambiarPassword() {
  const modal = document.getElementById("change-password-modal");
  const form = document.getElementById("change-password-form");
  form?.reset();
  modal?.classList.add("active");
}

function cerrarModalCambiarPassword() {
  document.getElementById("change-password-modal")?.classList.remove("active");
  document.getElementById("change-password-form")?.reset();
}

async function handleChangePassword(e) {
  e.preventDefault();

  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-new-password").value;

  if (newPassword !== confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    if (!response.ok) throw new Error("No se pudo cambiar la contraseña");

    alert("✅ Contraseña actualizada");
    cerrarModalCambiarPassword();
  } catch (error) {
    alert("Error: " + error.message);
  }
}

function switchTab(tabName) {
  // Remover activo de todos los tabs
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  // Activar tab seleccionado
  document.getElementById(tabName).classList.add("active");
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  // Cargar datos según tab
  if (tabName === "users") cargarUsuarios();
  if (tabName === "payments") cargarPagos();
  if (tabName === "events") cargarEventos();
  if (tabName === "products") cargarProductos();
  if (tabName === "web") cargarContenidoWeb();
  if (tabName === "messages") cargarMensajes();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ===== DASHBOARD =====
async function cargarDashboard() {
  try {
    const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando dashboard");

    const stats = await response.json();

    document.getElementById("stat-users").textContent = stats.total_users;
    document.getElementById("stat-revenue").textContent = formatCurrency(stats.total_revenue);
    document.getElementById("stat-pending").textContent = stats.pending_payments;
    document.getElementById("stat-completed").textContent = stats.completed_payments;
    document.getElementById("stat-events").textContent = stats.active_events;
    document.getElementById("stat-total-payments").textContent = stats.total_payments;

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
}

// ===== MENSAJES =====
async function cargarMensajes() {
  try {
    const response = await fetch(`${API_BASE}/admin/messages?skip=0&limit=200`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando mensajes");

    const mensajes = await response.json();
    const tbody = document.getElementById("messages-tbody");

    MESSAGES_CACHE = new Map();
    mensajes.forEach(mensaje => {
      MESSAGES_CACHE.set(mensaje.id, mensaje);
    });

    if (!mensajes.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay mensajes</td></tr>';
      return;
    }

    tbody.innerHTML = mensajes.map(mensaje => {
      const fecha = mensaje.created_at ? new Date(mensaje.created_at).toLocaleString("es-ES") : "-";
      const resumen = mensaje.message?.length > 120
        ? `${mensaje.message.slice(0, 120)}...`
        : (mensaje.message || "-");

      return `
        <tr class="message-row" onclick="verMensaje(${mensaje.id})">
          <td>${escapeHtml(fecha)}</td>
          <td>${escapeHtml(mensaje.name)}</td>
          <td>${escapeHtml(mensaje.email)}</td>
          <td>${escapeHtml(mensaje.subject || "-")}</td>
          <td>${escapeHtml(mensaje.source || "-")}</td>
          <td>${escapeHtml(resumen)}</td>
        </tr>
      `;
    }).join("");
  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
}

function verMensaje(id) {
  const mensaje = MESSAGES_CACHE.get(id);
  if (!mensaje) return;

  ACTIVE_MESSAGE_ID = id;

  const fecha = mensaje.created_at ? new Date(mensaje.created_at).toLocaleString("es-ES") : "-";
  document.getElementById("message-modal-name").textContent = mensaje.name || "-";
  document.getElementById("message-modal-email").textContent = mensaje.email || "-";
  document.getElementById("message-modal-subject").textContent = mensaje.subject || "-";
  document.getElementById("message-modal-source").textContent = mensaje.source || "-";
  document.getElementById("message-modal-date").textContent = fecha;
  document.getElementById("message-modal-body").textContent = mensaje.message || "-";

  document.getElementById("message-modal").classList.add("active");
}

function cerrarModalMensaje() {
  document.getElementById("message-modal").classList.remove("active");
  ACTIVE_MESSAGE_ID = null;
}

async function borrarMensaje(id) {
  if (!confirm("¿Seguro que quieres eliminar este mensaje?")) return;
  await eliminarMensaje(id);
}

async function borrarMensajeActivo() {
  if (!ACTIVE_MESSAGE_ID) return;
  await eliminarMensaje(ACTIVE_MESSAGE_ID);
  cerrarModalMensaje();
}

async function eliminarMensaje(id) {
  try {
    const response = await fetch(`${API_BASE}/admin/messages/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error eliminando mensaje");

    MESSAGES_CACHE.delete(id);
    cargarMensajes();
  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
}

// ===== USUARIOS =====
async function cargarUsuarios() {
  try {
    const response = await fetch(`${API_BASE}/admin/users?skip=0&limit=100`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando usuarios");

    const usuarios = await response.json();
    const tbody = document.getElementById("users-tbody");

    if (usuarios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay usuarios</td></tr>';
      return;
    }

    tbody.innerHTML = usuarios.map(usuario => `
      <tr class="message-row" onclick="abrirEditarUsuario(${usuario.id})">
        <td>#${usuario.id}</td>
        <td>${usuario.email}</td>
        <td>${usuario.full_name || "-"}</td>
        <td>
          <span class="badge badge-${usuario.role}">
            ${usuario.role === "admin" ? "👑 Admin" : "👤 Usuario"}
          </span>
        </td>
        <td>
          <span class="badge ${usuario.is_active ? "badge-success" : "badge-danger"}">
            ${usuario.is_active ? "✅ Activo" : "❌ Inactivo"}
          </span>
        </td>
        <td>${new Date(usuario.created_at).toLocaleDateString("es-ES")}</td>
      </tr>
    `).join("");

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
}

async function abrirEditarUsuario(userId) {
  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando usuario");

    const usuario = await response.json();

    document.getElementById("edit-user-id").value = usuario.id;
    document.getElementById("edit-user-email").value = usuario.email;
    document.getElementById("edit-user-name").value = usuario.full_name || "";
    document.getElementById("edit-user-role").value = usuario.role;

    document.getElementById("edit-user-modal").classList.add("active");

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function handleEditUser(e) {
  e.preventDefault();

  const userId = document.getElementById("edit-user-id").value;
  const email = document.getElementById("edit-user-email").value;
  const fullName = document.getElementById("edit-user-name").value;
  const role = document.getElementById("edit-user-role").value;

  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        email,
        full_name: fullName
      })
    });

    if (!response.ok) throw new Error("Error actualizando usuario");

    alert("✅ Usuario actualizado");
    cerrarModalUsuario();
    cargarUsuarios();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function cambiarRol(userId) {
  if (!confirm("¿Cambiar rol de este usuario?")) return;

  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/toggle-role`, {
      method: "PATCH",
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cambiando rol");

    alert("✅ Rol actualizado");
    cargarUsuarios();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function toggleActivo(userId) {
  if (!confirm("¿Cambiar estado de este usuario?")) return;

  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/toggle-active`, {
      method: "PATCH",
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error actualizando estado");

    alert("✅ Estado actualizado");
    cargarUsuarios();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function eliminarUsuario(userId) {
  if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;

  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error eliminando usuario");

    alert("✅ Usuario eliminado");
    cerrarModalUsuario();
    cargarUsuarios();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

function cerrarModalUsuario() {
  document.getElementById("edit-user-modal").classList.remove("active");
  document.getElementById("edit-user-form").reset();
}

function abrirCrearUsuarioModal() {
  document.getElementById("create-user-form").reset();
  document.getElementById("create-user-modal").classList.add("active");
}

function cerrarModalCrearUsuario() {
  document.getElementById("create-user-modal").classList.remove("active");
  document.getElementById("create-user-form").reset();
}

async function handleCreateUser(e) {
  e.preventDefault();

  const email = document.getElementById("create-user-email").value;
  const fullName = document.getElementById("create-user-name").value;
  const password = document.getElementById("create-user-password").value;
  const role = document.getElementById("create-user-role").value;

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        full_name: fullName,
        password
      })
    });

    if (!response.ok) throw new Error("Error creando usuario");

    const newUser = await response.json();

    if (role === "admin" && newUser.role !== "admin") {
      const promote = await fetch(`${API_BASE}/admin/users/${newUser.id}/toggle-role`, {
        method: "PATCH",
        headers: getHeaders()
      });

      if (!promote.ok) throw new Error("Usuario creado, pero no se pudo asignar rol admin");
    }

    alert("✅ Usuario creado");
    cerrarModalCrearUsuario();
    cargarUsuarios();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

function filtrarUsuarios() {
  const searchTerm = document.getElementById("search-users").value.toLowerCase();
  const rows = document.querySelectorAll("#users-tbody tr");

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// ===== PAGOS =====
async function cargarPagos() {
  try {
    const status = document.getElementById("filter-status")?.value || "";
    const url = status 
      ? `${API_BASE}/payments?status_filter=${status}` 
      : `${API_BASE}/payments`;

    const response = await fetch(url, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando pagos");

    const pagos = await response.json();
    const tbody = document.getElementById("payments-tbody");

    if (pagos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay pagos</td></tr>';
      return;
    }

    tbody.innerHTML = pagos.map(pago => `
      <tr class="message-row" onclick="abrirEditarPago(${pago.id})">
        <td>#${pago.id}</td>
        <td>${pago.user.email}</td>
        <td>${formatCurrency(pago.amount)}</td>
        <td>
          <span class="badge badge-${getStatusClass(pago.status)}">
            ${getStatusLabel(pago.status)}
          </span>
        </td>
        <td>${pago.description || "-"}</td>
        <td>${pago.payment_method || "-"}</td>
        <td>${new Date(pago.created_at).toLocaleDateString("es-ES")}</td>
      </tr>
    `).join("");

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
}

async function abrirEditarPago(pagoId) {
  try {
    const response = await fetch(`${API_BASE}/payments/${pagoId}`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando pago");

    const pago = await response.json();

    document.getElementById("edit-payment-id").value = pago.id;
    document.getElementById("edit-payment-status").value = pago.status;
    document.getElementById("edit-payment-description").value = pago.description || "";

    document.getElementById("edit-payment-modal").classList.add("active");

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function handleEditPayment(e) {
  e.preventDefault();

  const pagoId = document.getElementById("edit-payment-id").value;
  const status = document.getElementById("edit-payment-status").value;
  const description = document.getElementById("edit-payment-description").value;

  try {
    const response = await fetch(`${API_BASE}/payments/${pagoId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        status,
        description
      })
    });

    if (!response.ok) throw new Error("Error actualizando pago");

    alert("✅ Pago actualizado");
    cerrarModalPago();
    cargarPagos();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function eliminarPago(pagoId) {
  if (!confirm("¿Eliminar este pago? Esta acción no se puede deshacer.")) return;

  try {
    const response = await fetch(`${API_BASE}/payments/${pagoId}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error eliminando pago");

    alert("✅ Pago eliminado");
    cerrarModalPago();
    cargarPagos();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

function cerrarModalPago() {
  document.getElementById("edit-payment-modal").classList.remove("active");
  document.getElementById("edit-payment-form").reset();
}

async function cargarUsuariosParaPago() {
  const select = document.getElementById("create-payment-user");
  if (!select) return;

  select.innerHTML = '<option value="">Cargando usuarios...</option>';

  try {
    const response = await fetch(`${API_BASE}/admin/users?skip=0&limit=100`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando usuarios");

    const usuarios = await response.json();

    if (usuarios.length === 0) {
      select.innerHTML = '<option value="">No hay usuarios</option>';
      return;
    }

    select.innerHTML = usuarios.map(usuario => {
      const label = `${usuario.email}${usuario.full_name ? ` (${usuario.full_name})` : ""}`;
      return `<option value="${usuario.id}">${label}</option>`;
    }).join("");

  } catch (error) {
    select.innerHTML = '<option value="">Error cargando usuarios</option>';
  }
}

function abrirCrearPagoModal() {
  document.getElementById("create-payment-form").reset();
  cargarUsuariosParaPago();
  document.getElementById("create-payment-modal").classList.add("active");
}

function cerrarModalCrearPago() {
  document.getElementById("create-payment-modal").classList.remove("active");
  document.getElementById("create-payment-form").reset();
}

async function handleCreatePayment(e) {
  e.preventDefault();

  const userId = parseInt(document.getElementById("create-payment-user").value, 10);
  const amount = parseFloat(document.getElementById("create-payment-amount").value);
  const description = document.getElementById("create-payment-description").value;
  const paymentMethod = document.getElementById("create-payment-method").value;

  if (!userId) {
    alert("Selecciona un usuario válido");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/payments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        user_id: userId,
        amount,
        description,
        payment_method: paymentMethod
      })
    });

    if (!response.ok) throw new Error("Error creando pago");

    alert("✅ Pago creado (estado pendiente)");
    cerrarModalCrearPago();
    cargarPagos();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

function getStatusClass(status) {
  const classes = {
    "pending": "warning",
    "completed": "success",
    "failed": "danger",
    "refunded": "info"
  };
  return classes[status] || "secondary";
}

function getStatusLabel(status) {
  const labels = {
    "pending": "⏳ Pendiente",
    "completed": "✅ Completado",
    "failed": "❌ Fallido",
    "refunded": "↩️ Reembolsado"
  };
  return labels[status] || status;
}

// ===== EVENTOS =====
async function cargarEventos() {
  try {
    const response = await fetch(`${API_BASE}/events?active_only=false&skip=0&limit=100`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando eventos");

    const eventos = await response.json();
    const grid = document.getElementById("events-grid");

    if (eventos.length === 0) {
      grid.innerHTML = '<div class="no-data">No hay eventos</div>';
      return;
    }

    grid.innerHTML = eventos.map(evento => `
      <div class="event-card">
        <div class="event-image">
          <img src="${evento.image_url || 'https://via.placeholder.com/300x200'}" alt="${evento.title}">
          <span class="badge ${evento.is_active ? 'badge-success' : 'badge-danger'}">
            ${evento.is_active ? "✅ Activo" : "❌ Inactivo"}
          </span>
        </div>
        <div class="event-content">
          <h3>${evento.title}</h3>
          <p>${evento.description || ""}</p>
          <div class="event-meta">
            <span>📅 ${new Date(evento.date_start).toLocaleDateString("es-ES")}</span>
            <span>📍 ${evento.location || "Sin ubicación"}</span>
            <span>💵 ${formatCurrency(evento.price)}</span>
          </div>
          <div class="event-capacity">
            <span>${evento.participants_count}/${evento.capacity} participantes</span>
            <div class="capacity-bar">
              <div class="capacity-fill" style="width: ${(evento.participants_count / evento.capacity) * 100}%"></div>
            </div>
          </div>
          <div class="event-actions">
            <button class="btn btn-sm btn-info" onclick="abrirEditarEvento(${evento.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarEvento(${evento.id})">Eliminar</button>
          </div>
        </div>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
}

function abrirCrearEventoModal() {
  document.getElementById("event-id").value = "";
  document.getElementById("event-modal-title").textContent = "Crear Evento";
  document.getElementById("event-form").reset();
  document.getElementById("event-modal").classList.add("active");
}

async function abrirEditarEvento(eventoId) {
  try {
    const response = await fetch(`${API_BASE}/events/${eventoId}`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando evento");

    const evento = await response.json();

    document.getElementById("event-id").value = evento.id;
    document.getElementById("event-title").value = evento.title;
    document.getElementById("event-description").value = evento.description || "";
    document.getElementById("event-start").value = evento.date_start.replace("Z", "").slice(0, 16);
    document.getElementById("event-end").value = evento.date_end ? evento.date_end.replace("Z", "").slice(0, 16) : "";
    document.getElementById("event-location").value = evento.location || "";
    document.getElementById("event-capacity").value = evento.capacity;
    document.getElementById("event-price").value = evento.price;
    document.getElementById("event-image").value = evento.image_url || "";

    document.getElementById("event-modal-title").textContent = "Editar Evento";
    document.getElementById("event-modal").classList.add("active");

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function handleSaveEvent(e) {
  e.preventDefault();

  const eventoId = document.getElementById("event-id").value;
  const data = {
    title: document.getElementById("event-title").value,
    description: document.getElementById("event-description").value,
    date_start: new Date(document.getElementById("event-start").value).toISOString(),
    date_end: document.getElementById("event-end").value 
      ? new Date(document.getElementById("event-end").value).toISOString() 
      : null,
    location: document.getElementById("event-location").value,
    capacity: parseInt(document.getElementById("event-capacity").value),
    price: parseFloat(document.getElementById("event-price").value),
    image_url: document.getElementById("event-image").value
  };

  try {
    const url = eventoId 
      ? `${API_BASE}/events/${eventoId}`
      : `${API_BASE}/events`;
    const method = eventoId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Error guardando evento");

    alert("✅ Evento guardado");
    cerrarModalEvento();
    cargarEventos();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function eliminarEvento(eventoId) {
  if (!confirm("¿Eliminar este evento? Esta acción no se puede deshacer.")) return;

  try {
    const response = await fetch(`${API_BASE}/events/${eventoId}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error eliminando evento");

    alert("✅ Evento eliminado");
    cargarEventos();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

function cerrarModalEvento() {
  document.getElementById("event-modal").classList.remove("active");
  document.getElementById("event-form").reset();
}

// ===== PRODUCTOS =====
async function cargarProductos() {
  try {
    const response = await fetch(`${API_BASE}/products?skip=0&limit=100`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando productos");

    const productos = await response.json();
    const tbody = document.getElementById("products-tbody");

    if (productos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay productos</td></tr>';
      return;
    }

    tbody.innerHTML = productos.map(producto => `
      <tr class="message-row" onclick="abrirEditarProducto(${producto.id})">
        <td>#${producto.id}</td>
        <td>${producto.name}</td>
        <td>${producto.sku}</td>
        <td>${producto.sort_order ?? 0}</td>
        <td>${formatCurrency(producto.price)}</td>
        <td>${producto.stock}</td>
        <td>
          <span class="badge ${producto.is_active ? "badge-success" : "badge-danger"}">
            ${producto.is_active ? "✅ Activo" : "❌ Inactivo"}
          </span>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    console.error(error);
    alert("Error: " + error.message);
  }
}

function abrirCrearProductoModal() {
  document.getElementById("create-product-form").reset();
  document.getElementById("create-product-active").checked = true;
  document.getElementById("create-product-order").value = 0;
  document.getElementById("create-product-modal").classList.add("active");
}

function cerrarModalCrearProducto() {
  document.getElementById("create-product-modal").classList.remove("active");
  document.getElementById("create-product-form").reset();
  CREATE_PRODUCT_AUTOSAVING = false;
}

function getCreateProductPayload(imageUrl) {
  const name = document.getElementById("create-product-name").value.trim();
  const sku = document.getElementById("create-product-sku").value.trim();
  const price = parseFloat(document.getElementById("create-product-price").value);
  const stock = parseInt(document.getElementById("create-product-stock").value, 10);
  const sortOrder = parseInt(document.getElementById("create-product-order").value, 10);

  if (!name || !sku || Number.isNaN(price) || Number.isNaN(stock) || Number.isNaN(sortOrder)) {
    return null;
  }

  return {
    name,
    sku,
    price,
    stock,
    sort_order: sortOrder,
    image_url: imageUrl || null,
    description: document.getElementById("create-product-description").value || null,
    is_active: document.getElementById("create-product-active").checked
  };
}

async function createProductWithPayload(payload) {
  if (CREATE_PRODUCT_AUTOSAVING) return;
  CREATE_PRODUCT_AUTOSAVING = true;

  const response = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    CREATE_PRODUCT_AUTOSAVING = false;
    throw new Error("Error creando producto");
  }

  alert("✅ Producto creado");
  cerrarModalCrearProducto();
  cargarProductos();
}

function tryAutoCreateProduct() {
  const modal = document.getElementById("create-product-modal");
  if (!modal?.classList.contains("active")) return;

  const imageUrl = document.getElementById("create-product-image").value || null;
  if (!imageUrl) return;

  const payload = getCreateProductPayload(imageUrl);
  if (!payload) return;

  createProductWithPayload(payload).catch((error) => {
    alert("Error: " + error.message);
  });
}

async function handleCreateProductImageChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const imageUrl = await uploadProductImage(file);
    document.getElementById("create-product-image").value = imageUrl;

    const payload = getCreateProductPayload(imageUrl);
    if (payload) {
      await createProductWithPayload(payload);
      return;
    }

    alert("✅ Imagen subida. Completa los campos obligatorios para guardar automáticamente.");
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function handleEditProductImageChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const productId = document.getElementById("edit-product-id").value;
  if (!productId) {
    alert("Primero selecciona un producto para editar.");
    return;
  }

  try {
    const imageUrl = await uploadProductImage(file);
    const editImageInput = document.getElementById("edit-product-image");
    editImageInput.value = imageUrl;
    editImageInput.dataset.original = imageUrl;

    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ image_url: imageUrl })
    });

    if (!response.ok) throw new Error("Error guardando imagen");

    alert("✅ Imagen guardada");
    cargarProductos();
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/products/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error("Error subiendo imagen");
  }

  const data = await response.json();
  return data.url;
}

async function handleCreateProduct(e) {
  e.preventDefault();

  const imageFile = document.getElementById("create-product-image-file").files[0];
  let imageUrl = document.getElementById("create-product-image").value || null;

  try {
    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile);
      document.getElementById("create-product-image").value = imageUrl;
    }

    const payload = getCreateProductPayload(imageUrl);
    if (!payload) throw new Error("Completa los campos obligatorios.");

    await createProductWithPayload(payload);

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function abrirEditarProducto(productId) {
  try {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando producto");

    const producto = await response.json();

    document.getElementById("edit-product-id").value = producto.id;
    document.getElementById("edit-product-name").value = producto.name;
    document.getElementById("edit-product-sku").value = producto.sku;
    document.getElementById("edit-product-price").value = producto.price;
    document.getElementById("edit-product-stock").value = producto.stock;
    document.getElementById("edit-product-order").value = producto.sort_order ?? 0;
    const editImageInput = document.getElementById("edit-product-image");
    editImageInput.value = producto.image_url || "";
    editImageInput.dataset.original = producto.image_url || "";
    const editFileInput = document.getElementById("edit-product-image-file");
    if (editFileInput) editFileInput.value = "";
    document.getElementById("edit-product-description").value = producto.description || "";
    document.getElementById("edit-product-active").checked = !!producto.is_active;

    document.getElementById("edit-product-modal").classList.add("active");

  } catch (error) {
    alert("Error: " + error.message);
  }
}

function cerrarModalEditarProducto() {
  document.getElementById("edit-product-modal").classList.remove("active");
  document.getElementById("edit-product-form").reset();
}

async function handleEditProduct(e) {
  e.preventDefault();

  const productId = document.getElementById("edit-product-id").value;
  const imageFile = document.getElementById("edit-product-image-file").files[0];
  const editImageInput = document.getElementById("edit-product-image");
  if (!editImageInput.value && editImageInput.dataset.original) {
    editImageInput.value = editImageInput.dataset.original;
  }
  let imageUrl = editImageInput.value || editImageInput.dataset.original || null;

  try {
    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile);
      editImageInput.value = imageUrl;
      editImageInput.dataset.original = imageUrl;
    }

    const payload = {
        name: document.getElementById("edit-product-name").value,
        sku: document.getElementById("edit-product-sku").value,
        price: parseFloat(document.getElementById("edit-product-price").value),
        stock: parseInt(document.getElementById("edit-product-stock").value, 10),
        sort_order: parseInt(document.getElementById("edit-product-order").value, 10),
        description: document.getElementById("edit-product-description").value || null,
      is_active: document.getElementById("edit-product-active").checked
      };

    if (imageUrl) {
      payload.image_url = imageUrl;
    }

    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Error actualizando producto");

    alert("✅ Producto actualizado");
    cerrarModalEditarProducto();
    cargarProductos();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function eliminarProducto(productId) {
  if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;

  try {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error eliminando producto");

    alert("✅ Producto eliminado");
    cerrarModalEditarProducto();
    cargarProductos();

  } catch (error) {
    alert("Error: " + error.message);
  }
}

// ===== CONTENIDO WEB =====
document.getElementById("web-content-form")?.addEventListener("submit", handleSaveWebContent);

async function cargarContenidoWeb() {
  try {
    const response = await fetch(`${API_BASE}/content`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error("Error cargando contenido web");

    const data = await response.json();

    document.getElementById("web-events-title").value = data.events_title || "";
    document.getElementById("web-events-body").value = data.events_body || "";
    document.getElementById("web-events-cta-text").value = data.events_cta_text || "";
    document.getElementById("web-events-cta-link").value = data.events_cta_link || "";
    document.getElementById("web-shop-title").value = data.shop_title || "";
    document.getElementById("web-shop-hero").value = data.shop_hero_image || "";

  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function handleSaveWebContent(e) {
  e.preventDefault();

  const payload = {
    events_title: document.getElementById("web-events-title").value,
    events_body: document.getElementById("web-events-body").value,
    events_cta_text: document.getElementById("web-events-cta-text").value,
    events_cta_link: document.getElementById("web-events-cta-link").value,
    shop_title: document.getElementById("web-shop-title").value,
    shop_hero_image: document.getElementById("web-shop-hero").value
  };

  try {
    const response = await fetch(`${API_BASE}/content`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Error guardando contenido web");

    alert("✅ Contenido web actualizado");

  } catch (error) {
    alert("Error: " + error.message);
  }
}
