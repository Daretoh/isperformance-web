// ── Carrito (localStorage) ──────────────────────────────────────────
const Carrito = {
  get() {
    try { return JSON.parse(localStorage.getItem('isp_cart') || '[]'); } catch { return []; }
  },
  save(items) {
    localStorage.setItem('isp_cart', JSON.stringify(items));
    Carrito.updateBadge();
  },
  add(producto) {
    const items = Carrito.get();
    const existe = items.find(i => i.shopifyId === producto.shopifyId);
    if (existe) {
      existe.qty       = (existe.qty || 1) + 1;
      existe.variantId = existe.variantId || producto.variantId;
      existe.precio    = existe.precio    || producto.precio;
    } else {
      items.push({ shopifyId: producto.shopifyId, nombre: producto.nombre,
                   imagen: producto.imagen, precio: producto.precio,
                   variantId: producto.variantId, qty: 1 });
    }
    Carrito.save(items);
  },
  remove(shopifyId) {
    Carrito.save(Carrito.get().filter(i => i.shopifyId !== shopifyId));
  },
  clear() { Carrito.save([]); },
  count() { return Carrito.get().reduce((n, i) => n + (i.qty || 1), 0); },
  updateBadge() {
    const c = Carrito.count();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = c;
      el.style.display = c > 0 ? 'flex' : 'none';
    });
  }
};

// ── Utilidades ───────────────────────────────────────────────────────
function formatCLP(n) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function checkoutUrl(items) {
  const lineas = items
    .filter(i => i.variantId)
    .map(i => `${i.variantId}:${i.qty || 1}`)
    .join(',');
  return lineas ? `https://is-perfomance.myshopify.com/cart/${lineas}` : null;
}

// ── Compatibilidad en carrito ────────────────────────────────────────
function actualizarCompatCarrito() {
  const marca  = document.getElementById('sol-marca')?.value.trim() || '';
  const modelo = document.getElementById('sol-modelo')?.value.trim() || '';
  const año    = parseInt(document.getElementById('sol-año')?.value) || 0;

  document.querySelectorAll('.cart-item-compat').forEach(el => {
    if (!marca) { el.textContent = ''; el.className = 'cart-item-compat'; return; }
    const prod = (window._todosProductos || []).find(p => p.nombre === el.dataset.nombre);
    if (!prod || !prod.vehiculos.length) { el.textContent = ''; return; }
    const ok = prod.vehiculos.some(v => {
      if (marca && v.marca !== marca) return false;
      if (modelo && v.modelo !== modelo) return false;
      if (año && !v.años.includes(año)) return false;
      return true;
    });
    el.textContent = ok ? '✓ Compatible' : '✗ No compatible con tu vehículo';
    el.className = 'cart-item-compat ' + (ok ? 'compat-ok' : 'compat-no');
  });
}

// ── Modal carrito ────────────────────────────────────────────────────
function cerrarCarrito() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  setTimeout(() => overlay.remove(), 250);
}

function abrirModalCarrito() {
  document.getElementById('cart-overlay')?.remove();

  const items = Carrito.get();
  const total = items.reduce((s, i) => s + (i.precio || 0) * (i.qty || 1), 0);

  const overlay = document.createElement('div');
  overlay.id = 'cart-overlay';
  overlay.innerHTML = `
    <div class="cart-modal">
      <div class="cart-modal-header">
        <h3>Tu selección</h3>
        <button class="cart-close" id="cart-close">✕</button>
      </div>
      <div class="cart-modal-items">
        ${items.length === 0
          ? '<p class="cart-empty">No has seleccionado productos.</p>'
          : items.map(i => `
            <div class="cart-item">
              <img src="${i.imagen}" alt="${i.nombre}" onerror="this.style.display='none'" />
              <div class="cart-item-info">
                <span class="cart-item-name">${i.nombre}</span>
                <span class="cart-item-qty">x${i.qty}${i.precio ? ' · ' + formatCLP(i.precio * i.qty) : ''}</span>
                <span class="cart-item-compat" data-nombre="${i.nombre}"></span>
              </div>
              <button class="cart-item-remove" data-id="${i.shopifyId}">✕</button>
            </div>`).join('')}
      </div>
      ${items.length > 0 ? `
        ${total > 0 ? `<div class="cart-total">Total referencial: <strong>${formatCLP(total)}</strong></div>` : ''}
        <div class="cart-solicitud">
          <p class="cart-solicitud-info">Los productos se retiran e instalan en tienda. Completa tus datos y te contactamos para confirmar tu cita.</p>
          <div class="cart-form">
            <input id="sol-nombre" type="text" placeholder="Tu nombre *" autocomplete="name" />
            <input id="sol-telefono" type="tel" placeholder="Teléfono / WhatsApp *" autocomplete="tel" />
            <div class="cart-form-vehiculo">
              <input id="sol-marca" type="text" placeholder="Marca (ej: Toyota)" />
              <input id="sol-modelo" type="text" placeholder="Modelo (ej: Hilux)" />
              <input id="sol-año" type="number" placeholder="Año" min="1990" max="2030" />
            </div>
            <textarea id="sol-nota" placeholder="¿Alguna consulta adicional? (opcional)" rows="2"></textarea>
          </div>
        </div>
        <div class="cart-modal-footer">
          <button class="btn btn-secondary" id="cart-seguir">← Seguir eligiendo</button>
          <div class="cart-footer-ctas">
            <button class="btn btn-outline" id="cart-checkout">Comprar sin instalación</button>
            <button class="btn btn-primary" id="cart-solicitar">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.108.55 4.086 1.512 5.802L0 24l6.389-1.674A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.213-3.724.976.994-3.622-.234-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
              Solicitar instalación
            </button>
          </div>
        </div>` : ''}
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));

  document.getElementById('cart-close')?.addEventListener('click', cerrarCarrito);
  document.getElementById('cart-seguir')?.addEventListener('click', cerrarCarrito);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarCarrito(); });

  document.getElementById('cart-checkout')?.addEventListener('click', () => {
    const url = checkoutUrl(Carrito.get());
    if (url) window.open(url, '_blank');
  });

  ['sol-marca', 'sol-modelo', 'sol-año'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', actualizarCompatCarrito);
  });

  overlay.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      Carrito.remove(parseInt(btn.dataset.id));
      abrirModalCarrito();
    });
  });

  document.getElementById('cart-solicitar')?.addEventListener('click', () => {
    const nombre   = document.getElementById('sol-nombre').value.trim();
    const telefono = document.getElementById('sol-telefono').value.trim();
    const marca    = document.getElementById('sol-marca').value.trim();
    const modelo   = document.getElementById('sol-modelo').value.trim();
    const año      = document.getElementById('sol-año').value.trim();
    const nota     = document.getElementById('sol-nota').value.trim();

    if (!nombre || !telefono) {
      document.getElementById('sol-nombre').style.borderColor   = nombre   ? '' : '#f87171';
      document.getElementById('sol-telefono').style.borderColor = telefono ? '' : '#f87171';
      return;
    }

    const vehiculo = [marca, modelo, año].filter(Boolean).join(' ') || 'No especificado';
    const its  = Carrito.get();
    const prod = its.map(i => `- ${i.nombre} x${i.qty}${i.precio ? ' (' + formatCLP(i.precio * i.qty) + ')' : ''}`).join('\n');
    const tot  = its.reduce((s, i) => s + (i.precio || 0) * (i.qty || 1), 0);

    const msg = encodeURIComponent(
      `*Solicitud de instalación — ISperformance*\n\n` +
      `*Nombre:* ${nombre}\n` +
      `*Teléfono:* ${telefono}\n` +
      `*Vehículo:* ${vehiculo}\n\n` +
      `*Productos:*\n${prod}\n\n` +
      `*Total referencial:* ${formatCLP(tot)}` +
      (nota ? `\n\n*Consulta:* ${nota}` : '')
    );

    window.open(`https://wa.me/56985615636?text=${msg}`, '_blank');
    Carrito.clear();
    cerrarCarrito();
    mostrarToast('Solicitud enviada. Te contactaremos pronto.', true);
  });
}

// ── Toast ────────────────────────────────────────────────────────────
function mostrarToast(mensaje, esConfirmacion = false) {
  document.getElementById('isp-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'isp-toast';
  if (esConfirmacion) {
    toast.innerHTML = `<span>✓ ${mensaje}</span>`;
  } else {
    toast.innerHTML = `
      <span>✓ <strong>${mensaje}</strong> agregado</span>
      <div class="toast-btns">
        <button id="toast-seguir">Seguir eligiendo</button>
        <button id="toast-carrito" class="toast-primary">Ver selección</button>
      </div>`;
  }
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));

  const hide = () => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 300); };
  document.getElementById('toast-seguir')?.addEventListener('click', hide);
  document.getElementById('toast-carrito')?.addEventListener('click', () => { hide(); abrirModalCarrito(); });
  setTimeout(hide, esConfirmacion ? 4000 : 5000);
}

// ── Inicializar badge y botón de carrito en navbar ───────────────────
document.addEventListener('DOMContentLoaded', () => {
  Carrito.updateBadge();
  document.getElementById('nav-cart-btn')?.addEventListener('click', abrirModalCarrito);
});
