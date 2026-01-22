# Guía de Estilo - By Aura

Documento que establece los estándares de código, estructura y mejores prácticas para el sitio web de By Aura.

## 📋 Tabla de Contenidos

1. [HTML](#html)
2. [CSS](#css)
3. [JavaScript](#javascript)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Convenciones](#convenciones)

---

## HTML

### Estructura Básica

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <!-- Meta tags -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="...">
  
  <!-- Título -->
  <title>Título - By Aura</title>
  
  <!-- Estilos -->
  <link rel="stylesheet" href="style.css">
  
  <!-- Favicons -->
  <link rel="icon" type="image/png" href="...">
</head>
<body>
  <!-- Contenido -->
  <script src="app.js"></script>
</body>
</html>
```

### Reglas de Indentación

- Usar 2 espacios para indentación
- Usar indentación consistente en todos los elementos
- Comentarios de sección: `<!-- NOMBRE DE SECCIÓN -->`

### Atributos

```html
<!-- ✅ Correcto -->
<div class="card">
  <img src="..." alt="Descripción clara">
  <p>Contenido</p>
</div>

<!-- ❌ Incorrecto -->
<div class = "card">
  <img src="...">
  <p>Contenido</p>
</div>
```

### Accesibilidad

```html
<!-- ARIA attributes -->
<button aria-label="Abrir menú" aria-expanded="false" aria-controls="menu">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Texto alternativo -->
<img src="..." alt="Descripción significativa">

<!-- Roles semánticos -->
<nav role="navigation">...</nav>
<main role="main">...</main>
```

---

## CSS

### Organización

El archivo `style.css` debe organizarse en secciones claramente comentadas:

```css
/* ========================================
   NOMBRE DE SECCIÓN
   ======================================== */
```

### Orden de Secciones

1. Reset y estilos globales
2. Variables y tipografía
3. Navegación
4. Hero section
5. Modales
6. Main
7. Secciones de contenido
8. Footer
9. Media queries
10. Accesibilidad

### Variables CSS

```css
:root {
  /* Espaciado */
  --space: clamp(12px, 2vw, 24px);
  --gap: 1.25rem;
  
  /* Tipografía */
  --h1: clamp(28px, 5vw, 48px);
  --h2: clamp(22px, 3.2vw, 32px);
  --p: clamp(14px, 1.6vw, 18px);
  
  /* Colores */
  --brand-dark: rgb(1, 1, 50);
  --brand-accent: rgb(100, 1, 30);
  --panelBorder: rgba(255, 255, 255, 0.12);
}
```

### Nombrado de Clases

- Usar kebab-case: `class="card-title"`
- Nombres descriptivos: `class="product-card"` NO `class="card1"`
- Prefijos: `.nav-`, `.modal-`, `.btn-`

### Estructura de Clase

```css
/* ✅ Correcto */
.card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* ❌ Incorrecto */
.card{ display:flex; gap:1rem; padding:1rem; border-radius:8px; transition:all .2s ease;}
```

### Responsive Design

Usar Mobile-First:

```css
/* Mobile (< 768px) */
.card {
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .card {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop */
@media (min-width: 900px) {
  .card {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

### Fluid Typography

```css
/* Usar clamp() para tipografía responsive */
h1 {
  font-size: clamp(28px, 5vw, 48px);
}

p {
  font-size: clamp(14px, 1.6vw, 18px);
}
```

---

## JavaScript

### Estructura Básica

```javascript
/**
 * BY AURA - Descripción del módulo
 * Responsabilidad: Lo que hace
 */

// ===== FUNCIÓN: Descripción =====
(() => {
  // Código IIFE para evitar contaminación global
})();
```

### Nombrado

```javascript
// ✅ Correcto
const openModal = (modal) => { ... }
const closeMenu = () => { ... }

// ❌ Incorrecto
const open = (m) => { ... }
const close_menu = () => { ... }
```

### Comentarios

```javascript
// Comentario de una línea
// Explicar el "por qué", no el "qué"

/* 
 * Comentario de múltiples líneas
 * Cuando necesites más contexto
 */
```

### Event Listeners

```javascript
// ✅ Usar addEventListener
button.addEventListener('click', (e) => {
  e.preventDefault();
  // acción
});

// ❌ Evitar onclick inline
<button onclick="function()">Click</button>
```

---

## Estructura de Archivos

```
by-aura/
├── index.html              # Página principal (actualizada)
├── eventos.html            # Página eventos (actualizada)
├── privacidad.html         # Política privacidad (actualizada)
├── devoluciones.html       # Política devoluciones (actualizada)
├── aviso-legal.html        # Aviso legal (actualizada)
├── formsubmit.html         # Confirmación de formularios
│
├── style.css               # Estilos únicos y centralizados
├── app.js                  # JavaScript principal
│
├── img/
│   ├── logos/              # Logos y favicons
│   └── media/              # Imágenes y videos
│
├── README.md               # Documentación del proyecto
└── STYLE_GUIDE.md         # Este archivo
```

### Reglas de Archivos

- ✅ Usar minúsculas en nombres de archivos
- ✅ Usar guiones para separar palabras: `about-section.css`
- ✅ NO usar espacios ni caracteres especiales
- ✅ Agrupar archivos por función

---

## Convenciones

### Indentación

```html
<!-- 2 espacios -->
<div class="container">
  <div class="card">
    <h2>Título</h2>
    <p>Contenido</p>
  </div>
</div>
```

### Espacios en Blanco

```html
<!-- Entre secciones -->
<!-- ===== NUEVA SECCIÓN ===== -->

<!-- Entre elementos relacionados -->
<p>Párrafo 1</p>

<p>Párrafo 2</p>

<!-- Sin espacios para elementos estrechamente acoplados -->
<p>Texto <strong>importante</strong> aquí</p>
```

### Atributos

```html
<!-- Orden recomendado -->
<button
  type="button"
  class="btn btn-primary"
  id="submit-btn"
  aria-label="Enviar formulario"
  data-target="modal"
  disabled>
  Enviar
</button>
```

### Commits

```
feat: Agregar sección de testimonios
fix: Corregir responsive en modales
style: Limpiar indentación en index.html
docs: Actualizar guía de estilo
```

---

## Checklist para Nuevas Páginas

- [ ] Usar `style.css` (no crear CSS separados)
- [ ] Usar `app.js` (no crear JS separados)
- [ ] Meta tags: charset, viewport, description
- [ ] Lang="es" en html
- [ ] Favicons en head
- [ ] Comentarios de sección en HTML
- [ ] Indentación consistente
- [ ] Alt text en imágenes
- [ ] ARIA attributes donde sea necesario
- [ ] Links al footer con políticas
- [ ] Testeado en mobile y desktop

---

## Herramientas Recomendadas

### Verificación de Código

```bash
# HTML
npm install -g html-validate

# CSS
npm install -g stylelint

# JavaScript
npm install -g eslint
```

### Validación Online

- [W3C HTML Validator](https://validator.w3.org/)
- [W3C CSS Validator](https://jigsaw.w3.org/css-validator/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## Mejores Prácticas

1. **DRY** - Don't Repeat Yourself
   - Reutilizar clases CSS
   - Consolidar formularios similares
   - Crear componentes reutilizables

2. **KISS** - Keep It Simple, Stupid
   - Código legible sobre clever
   - Evitar nested selectors profundos
   - Funciones simples y enfocadas

3. **Accesibilidad**
   - Siempre usar alt text
   - Contraste de colores >= 4.5:1
   - Navegación con teclado
   - Considerar screen readers

4. **Performance**
   - Usar lazy loading para imágenes
   - Minimizar requests HTTP
   - Optimizar imágenes
   - CSS antes de JS

---

## Referencias

- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev by Google](https://web.dev/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Semantic HTML](https://html.spec.whatwg.org/multipage/)

---

**Última actualización:** Enero 2025  
**Versión:** 1.0
