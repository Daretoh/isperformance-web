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

// ── Extraer specs desde HTML de descripción ─────────────────────────
function extraerSpecs(html) {
  if (!html) return {};
  const txt = html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  const get = (key) => {
    const m = txt.match(new RegExp(key + '[:\\s]+([^·\\n<]+)', 'i'));
    return m ? m[1].trim() : null;
  };
  // Tipo: primera línea en negrita (entre ** o al inicio)
  const tipoMatch = html.match(/<b>([^<]+)<\/b>/i);
  return {
    tipo:        tipoMatch ? tipoMatch[1].replace(/\.$/, '').trim() : null,
    material:    get('Material'),
    procedencia: get('Procedencia'),
  };
}

// ── Modal carrito ────────────────────────────────────────────────────
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
          <button class="btn btn-primary" id="cart-solicitar">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.108.55 4.086 1.512 5.802L0 24l6.389-1.674A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.213-3.724.976.994-3.622-.234-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
            Enviar consulta
          </button>
        </div>` : ''}
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));

  document.getElementById('cart-close')?.addEventListener('click', cerrarCarrito);
  document.getElementById('cart-seguir')?.addEventListener('click', cerrarCarrito);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrarCarrito(); });

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
    const prod = its.map(i => `• ${i.nombre} x${i.qty}${i.precio ? ' (' + formatCLP(i.precio * i.qty) + ')' : ''}`).join('\n');
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
    mostrarToast('¡Solicitud enviada! Te contactaremos pronto.');
  });
}

function cerrarCarrito() {
  const overlay = document.getElementById('cart-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  setTimeout(() => overlay.remove(), 250);
}

// ── Toast "agregado al carrito" ──────────────────────────────────────
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

// ── Página de detalle ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function () {
  const itemsActuales = Carrito.get();
  if (itemsActuales.some(i => !i.variantId)) {
    Carrito.save(itemsActuales.filter(i => i.variantId));
  }
  Carrito.updateBadge();

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const container = document.getElementById('detalle-container');

  if (!id) { container.innerHTML = '<div class="detalle-error">Producto no especificado.</div>'; return; }

  const productos = await cargarProductos();
  window._todosProductos = productos;
  const producto = productos.find(p => p.id === id);
  if (!producto) { container.innerHTML = '<div class="detalle-error">Producto no encontrado.</div>'; return; }

  document.title = producto.nombre + ' — ISperformance';

  const specs   = extraerSpecs(producto.descripcionHTML);
  const imgs    = producto.imagenes?.length ? producto.imagenes : [producto.imagen];
  const vehiculos = (producto.vehiculos || []).filter(v => v.marca);

  container.innerHTML = `
    <div class="detalle-grid">

      <!-- IMÁGENES -->
      <div class="detalle-imagenes">
        <div class="detalle-img-main">
          <img id="detalle-img-principal"
               src="${imgs[0]}"
               alt="${producto.nombre}"
               onerror="this.src='https://placehold.co/600x420/1A1A1A/FF6B00?text=${encodeURIComponent(producto.nombre)}'" />
        </div>
        ${imgs.length > 1 ? `
        <div class="detalle-thumbs">
          ${imgs.map((url, i) => `
            <div class="detalle-thumb${i === 0 ? ' active' : ''}" data-img="${url}">
              <img src="${url}" alt="${producto.nombre}" loading="lazy"
                   onerror="this.parentElement.style.display='none'" />
            </div>`).join('')}
        </div>` : ''}
      </div>

      <!-- INFO -->
      <div class="detalle-info">
        <div class="detalle-breadcrumb">
          <a href="index.html">ISperformance</a>
          <span>›</span>
          <span>${producto.categoria}</span>
        </div>

        <span class="detalle-cat">${producto.categoria}</span>
        <h1 class="detalle-title">${producto.nombre}</h1>
        <p class="detalle-vendor">Marca: <strong>${producto.vendor || 'ISPerformance'}</strong></p>

        <!-- Descripción completa -->
        <div class="detalle-desc-html">${producto.descripcionHTML || producto.descripcion}</div>

        <!-- Specs técnicas -->
        <div class="detalle-specs">
          ${specs.tipo ? `
          <div class="detalle-spec">
            <div class="detalle-spec-label">Tipo</div>
            <div class="detalle-spec-value">${specs.tipo}</div>
          </div>` : ''}
          ${specs.material ? `
          <div class="detalle-spec">
            <div class="detalle-spec-label">Material</div>
            <div class="detalle-spec-value">${specs.material}</div>
          </div>` : ''}
          ${specs.procedencia ? `
          <div class="detalle-spec">
            <div class="detalle-spec-label">Procedencia</div>
            <div class="detalle-spec-value">${specs.procedencia}</div>
          </div>` : ''}
        </div>

        <!-- Compatibilidad -->
        ${vehiculos.length ? `
        <div class="detalle-vehiculos">
          <div class="detalle-vehiculos-titulo">Compatible con (${vehiculos.length})</div>
          <div class="detalle-vehiculos-lista">
            ${vehiculos.map(v => {
              const rango = v.años.length ? `${Math.min(...v.años)}–${Math.max(...v.años)}` : '';
              return `<span class="compat-tag">${v.marca} ${v.modelo}${rango ? ' ' + rango : ''}</span>`;
            }).join('')}
          </div>
        </div>` : ''}

        <!-- Footer / acciones -->
        <div class="detalle-footer">
          <div class="detalle-precio-bloque">
            <span class="detalle-precio">${producto.precio ? formatCLP(producto.precio) : 'Consultar precio'}</span>
            ${producto.stock === null ? '' :
              producto.stock > 0
                ? `<span class="stock-badge stock-in">En stock (${producto.stock})</span>`
                : `<span class="stock-badge stock-out">Sin stock</span>`
            }
          </div>
          ${producto.stock === 0
            ? `<a class="btn btn-wa" href="https://wa.me/56985615636?text=${encodeURIComponent('Hola, me interesa ' + producto.nombre + ' que está sin stock. ¿Cuándo estará disponible?')}" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.108.55 4.086 1.512 5.802L0 24l6.389-1.674A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.213-3.724.976.994-3.622-.234-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
                Consultar disponibilidad
               </a>`
            : `<div class="detalle-acciones">
                <button class="btn btn-primary btn-carrito" id="btn-agregar-carrito">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.108.55 4.086 1.512 5.802L0 24l6.389-1.674A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.213-3.724.976.994-3.622-.234-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
                  Solicitar instalación
                </button>
                ${producto.variantId ? `
                <div class="detalle-acciones-compra">
                  <a class="btn btn-outline" href="https://is-perfomance.myshopify.com/cart/${producto.variantId}:1" target="_blank" rel="noopener">
                    Comprar ahora
                  </a>
                  <button class="btn btn-secondary" id="btn-add-directo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Agregar al carrito
                  </button>
                </div>
                <p class="detalle-acciones-hint">Sin instalación — retiras en tienda.</p>` : ''}
               </div>`
          }
        </div>
      </div>
    </div>`;

  // Galería: click en thumbnail
  document.querySelectorAll('.detalle-thumb').forEach(el => {
    el.addEventListener('click', function () {
      document.getElementById('detalle-img-principal').src = this.dataset.img;
      document.querySelector('.detalle-thumb.active')?.classList.remove('active');
      this.classList.add('active');
    });
  });

  document.getElementById('btn-agregar-carrito')?.addEventListener('click', () => {
    Carrito.add(producto);
    mostrarToast(producto.nombre, false);
  });

  document.getElementById('btn-add-directo')?.addEventListener('click', () => {
    Carrito.add(producto);
    mostrarToast(producto.nombre, false);
  });
});
