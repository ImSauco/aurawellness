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
  const openBtns = document.querySelectorAll('[data-open-modal]');

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

  // Abrir modal al hacer clic en botón
  openBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const targetId = btn.dataset.target || 'contact-modal';
      const modal = document.getElementById(targetId);
      if (!modal) return;
      openModal(modal);
    });
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
