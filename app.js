/**
 * BY AURA - JavaScript Principal
 * Gestiona navegación, modales y comportamientos interactivos
 */

// ===== NAVEGACIÓN: Ocultar nav al scroll =====
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  const headerHeight = document.querySelector('header').offsetHeight;

  if (window.scrollY > headerHeight) {
    nav.style.opacity = '0';
    nav.style.pointerEvents = 'none';
    nav.style.transition = 'opacity 0.3s ease';
  } else {
    nav.style.opacity = '1';
    nav.style.pointerEvents = 'auto';
  }
});

// ===== MODALES: Apertura y cierre =====
(() => {
  const body = document.body;

  function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
  }

  // Abrir modal con delegación (para elementos dinámicos)
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-open-modal]');
    if (!trigger) return;
    e.preventDefault();
    const targetId = trigger.dataset.target || 'contact-modal';
    const modal = document.getElementById(targetId);
    if (!modal) return;
    const source = trigger.dataset.source;
    if (source) {
      const form = modal.querySelector('[data-contact-form]');
      if (form) form.setAttribute('data-source', source);
    }
    openModal(modal);
  });

  // Cerrar modal al hacer clic fuera o en el botón de cerrar
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal);
    });
    modal.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => closeModal(modal));
    });
  });

  // Cerrar modal al presionar ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.open').forEach(modal => closeModal(modal));
    }
  });
})();

// ===== CONTENIDO DINÁMICO (Eventos + Tienda) =====
const API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:8000'
  : 'https://api.byaura.com';

async function loadWebContent() {
  try {
    const response = await fetch(`${API_BASE}/content/public`);
    if (!response.ok) return;
    const data = await response.json();

    const eventsTitle = document.getElementById('events-title');
    const eventsBody = document.getElementById('events-body');
    const eventsCta = document.getElementById('events-cta');
    const shopTitle = document.getElementById('shop-title');
    const shopHero = document.getElementById('shop-hero-image');

    // Dinámico de eventos desactivado temporalmente
    if (eventsTitle || eventsBody || eventsCta) {
      // Placeholder para futura activación del backend
    }

    if (shopTitle && data.shop_title) shopTitle.textContent = data.shop_title;
    if (shopHero && data.shop_hero_image) shopHero.setAttribute('src', data.shop_hero_image);
  } catch (error) {
    console.error(error);
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products/public`);
    if (!response.ok) return;
    const products = await response.json();
    const container = document.getElementById('shop-products');
    if (!container) return;

    if (!products.length) {
      container.innerHTML = '<p>No hay productos disponibles en este momento.</p>';
      return;
    }

    container.innerHTML = products.map(product => {
      const img = product.image_url || 'https://via.placeholder.com/400x300';
      return `
        <div class="shop-card">
          <img src="${img}" alt="${product.name}">
          <h3>${product.name}</h3>
          <a class="btn-shop" data-open-modal data-target="contact-modal" data-source="tienda">Preguntar disponibilidad</a>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadWebContent();
  loadProducts();
  initContactForms();
  initScrollReveal();
  initHeroParallax();
});

function initScrollReveal() {
  const targets = document.querySelectorAll(
    'section, .news-card, .shop-card, .scroll-card, .about-card, .additional-services-card, .testimonials-card'
  );
  if (!targets.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach(el => observer.observe(el));
}

function initHeroParallax() {
  const heroVideo = document.getElementById('hero-video');
  if (!heroVideo) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let ticking = false;

  function update() {
    const scrolled = window.scrollY || window.pageYOffset;
    const translateY = Math.min(scrolled * 0.15, 120);
    heroVideo.style.transform = `translate3d(0, ${translateY}px, 0)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  });
}

function showContactSuccess(targetElement) {
  const existing = document.getElementById('contact-success-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'contact-success-toast';
  toast.textContent = '✅ Mensaje enviado';
  toast.style.position = 'fixed';
  toast.style.background = '#1f2937';
  toast.style.color = '#fff';
  toast.style.padding = '14px 18px';
  toast.style.borderRadius = '10px';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
  toast.style.zIndex = '9999';
  toast.style.fontSize = '14px';
  toast.style.left = '24px';
  toast.style.top = '24px';

  document.body.appendChild(toast);

  const anchor = targetElement?.closest?.('.modal-content') || targetElement;
  if (anchor?.getBoundingClientRect) {
    const rect = anchor.getBoundingClientRect();
    const toastRect = toast.getBoundingClientRect();
    const margin = 12;
    let top = rect.top - toastRect.height - margin;
    let left = rect.left + (rect.width - toastRect.width) / 2;

    top = Math.max(margin, top);
    left = Math.max(margin, left);
    const maxLeft = window.innerWidth - toastRect.width - margin;
    if (left > maxLeft) left = maxLeft;

    toast.style.top = `${top}px`;
    toast.style.left = `${left}px`;
  }

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 350);
  }, 2000);
}

// ===== CONTACTO: Envío al backend =====
function initContactForms() {
  const forms = document.querySelectorAll('[data-contact-form]');
  if (!forms.length) return;

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const payload = {
        name: (formData.get('nombre') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        message: (formData.get('mensaje') || '').toString().trim(),
        subject: (formData.get('_subject') || '').toString().trim() || 'Nuevo mensaje desde la web By Aura',
        source: form.getAttribute('data-source') || window.location.pathname
      };

      if (!payload.name || !payload.email || !payload.message) {
        alert('Por favor, completa todos los campos.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(`${API_BASE}/contact/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let detail = 'No se pudo enviar el mensaje.';
          try {
            const data = await response.json();
            if (data?.detail) detail = Array.isArray(data.detail) ? data.detail[0]?.msg || detail : data.detail;
          } catch (e) {
            // ignore parse errors
          }
          throw new Error(detail);
        }

        form.reset();
        showContactSuccess(form);
      } catch (error) {
        console.error(error);
        alert(error.message || 'No se pudo enviar el mensaje. Inténtalo de nuevo en unos minutos.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
}

// ===== MENÚ: Abrir y cerrar =====
(() => {
  const btn = document.querySelector('.nav-logo-btn');
  const menu = document.getElementById('main-menu');

  if (!btn || !menu) return;

  function openMenu() {
    menu.hidden = false;
    menu.setAttribute('data-open', 'true');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.removeAttribute('data-open');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      menu.hidden = true;
    }, 180);
  }

  function toggleMenu() {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  }

  // Abrir/cerrar menú al hacer clic en logo
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (menu.hidden) return;
    if (!menu.contains(e.target) && e.target !== btn) closeMenu();
  });

  // Cerrar menú al presionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Cerrar menú al hacer clic en un enlace
  menu.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) closeMenu();
  });
})();
