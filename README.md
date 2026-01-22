# By Aura - Sitio Web Oficial

Sitio web moderno y responsivo para By Aura, especialistas en bienestar y entrenamiento corporativo.

## Estructura del Proyecto

```
by-aura/
├── index.html              # Página principal
├── eventos.html            # Página de eventos
├── privacidad.html         # Política de privacidad
├── devoluciones.html       # Política de devoluciones
├── aviso-legal.html        # Aviso legal
├── formsubmit.html         # Página de confirmación de formularios
├── style.css               # Estilos principales
├── app.js                  # JavaScript principal
├── img/
│   ├── logos/              # Logos y favicons
│   └── media/              # Imágenes y videos
└── README.md               # Este archivo
```

## Características

- ✅ Diseño responsivo (Mobile First)
- ✅ Navegación fija con menú desplegable
- ✅ Modales interactivos para formularios
- ✅ Secciones dinámicas (Hero, Servicios, Eventos, Tienda, Testimonios)
- ✅ Scroll horizontal para tarjetas
- ✅ Accesibilidad (ARIA, semantic HTML)
- ✅ Optimizado para SEO
- ✅ Integración con Formspree para contactos

## Estructura HTML

### Componentes Principales

1. **Navegación (`<nav class="nav">`)**
   - Logo clickeable que abre menú
   - Menú fijo con navegación de secciones

2. **Hero Section (`<header>`)**
   - Video de fondo
   - Botón de contacto

3. **Main Content (`<main>`)**
   - Sección About: Quiénes somos
   - Sección Companies: Servicios empresariales
   - Sección Collaborations: Empresas colaboradoras
   - Sección Services: Servicios adicionales
   - Sección Scroll: Tarjetas horizontales
   - Sección News: Últimos eventos
   - Sección Shop: Tienda de productos
   - Sección Testimonials: Testimonios de clientes

4. **Modales**
   - Contacto general
   - Presupuesto empresas
   - Consultas de productos

5. **Footer**
   - Links legales
   - Copyright

## Estilos CSS

### Variables Definidas

```css
:root {
  --space: clamp(12px, 2vw, 24px);      /* Espaciado responsivo */
  --h1: clamp(28px, 5vw, 48px);         /* Título H1 */
  --h2: clamp(22px, 3.2vw, 32px);       /* Título H2 */
  --p: clamp(14px, 1.6vw, 18px);        /* Párrafo */
  --gap: 1.25rem;                        /* Gap entre elementos */
  --panelBorder: rgba(255,255,255,.12); /* Borde de paneles */
  --brand-dark: rgb(1, 1, 50);           /* Color primario */
  --brand-accent: rgb(100, 1, 30);       /* Color acento */
}
```

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 899px
- **Desktop**: 900px+
- **Large**: 1200px+

## JavaScript

### Funcionalidades

1. **Navegación (app.js)**
   - Control de visibilidad del menú
   - Gestión de eventos de click, ESC, etc.

2. **Modales (app.js)**
   - Apertura y cierre de modales
   - Cierre con ESC o click externo
   - Gestión del overflow del body

3. **Scroll (app.js)**
   - Ocultar navegación al hacer scroll
   - Smooth scroll behavior

## Formularios

Todos los formularios utilizan Formspree para el envío de emails:
- URL: `https://formspree.io/f/xanrbqnr`
- Redirección post-envío: `formsubmit.html`

### Campos Comunes

- `nombre` (text, required)
- `email` (email, required)
- `mensaje` (textarea, required)
- `_subject` (hidden)
- `_next` (hidden)

## Accesibilidad

- Uso de atributos ARIA
- Navegación semántica
- Contraste de colores adecuado
- Texto alternativo en imágenes
- Soporte para reducción de movimiento

## Optimizaciones

- Fluid typography con `clamp()`
- Imágenes responsivas
- Grid layout adaptivo
- Transiciones suaves
- Z-index organizados
- Scroll snap en tarjetas

## Páginas Legales

### privacidad.html
- Responsable del tratamiento
- Finalidad de datos
- Derechos de usuarios
- Medidas de seguridad

### devoluciones.html
- Derecho de desistimiento
- Condiciones de productos
- Proceso de reembolso
- Gestión de cambios

### aviso-legal.html
- Datos de contacto
- Propiedad intelectual
- Responsabilidades legales

## Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Mejoras Futuras

- [ ] Internacionalización (i18n)
- [ ] Dark mode
- [ ] Blog de contenido
- [ ] Sistema de reservas
- [ ] Newsletter signup
- [ ] Chat en vivo

## Contacto

- Email: info@byaurawell.com
- Sitio: https://byaurawell.com

---

**Última actualización:** Enero 2025  
**Versión:** 1.0 (Limpio y Ordenado)
