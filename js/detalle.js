// ── Extraer specs desde HTML de descripción ─────────────────────────
function extraerSpecs(html) {
  if (!html) return {};
  const txt = html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  const get = (key) => {
    const m = txt.match(new RegExp(key + '[:\\s]+([^·\\n<]+)', 'i'));
    return m ? m[1].trim() : null;
  };
  const tipoMatch = html.match(/<b>([^<]+)<\/b>/i);
  return {
    tipo:        tipoMatch ? tipoMatch[1].replace(/\.$/, '').trim() : null,
    material:    get('Material'),
    procedencia: get('Procedencia'),
  };
}

// ── Página de detalle ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function () {
  const itemsActuales = Carrito.get();
  if (itemsActuales.some(i => !i.variantId)) {
    Carrito.save(itemsActuales.filter(i => i.variantId));
  }

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const container = document.getElementById('detalle-container');

  if (!id) { container.innerHTML = '<div class="detalle-error">Producto no especificado.</div>'; return; }

  const productos = await cargarProductos();
  window._todosProductos = productos;
  const producto = productos.find(p => p.id === id);
  if (!producto) { container.innerHTML = '<div class="detalle-error">Producto no encontrado.</div>'; return; }

  document.title = producto.nombre + ' — ISperformance';

  const specs    = extraerSpecs(producto.descripcionHTML);
  const imgs     = producto.imagenes?.length ? producto.imagenes : [producto.imagen];
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

        <div class="detalle-desc-html">${producto.descripcionHTML || producto.descripcion}</div>

        <div class="detalle-specs">
          ${specs.tipo ? `<div class="detalle-spec"><div class="detalle-spec-label">Tipo</div><div class="detalle-spec-value">${specs.tipo}</div></div>` : ''}
          ${specs.material ? `<div class="detalle-spec"><div class="detalle-spec-label">Material</div><div class="detalle-spec-value">${specs.material}</div></div>` : ''}
          ${specs.procedencia ? `<div class="detalle-spec"><div class="detalle-spec-label">Procedencia</div><div class="detalle-spec-value">${specs.procedencia}</div></div>` : ''}
        </div>

        ${vehiculos.length ? `
        <div class="detalle-vehiculos">
          <div class="detalle-vehiculos-titulo">Compatible con (${vehiculos.length})</div>
          <div class="detalle-vehiculos-lista">
            ${vehiculos.map(v => {
              const rango = v.años.length ? `${Math.min(...v.años)}-${Math.max(...v.años)}` : '';
              return `<span class="compat-tag">${v.marca} ${v.modelo}${rango ? ' ' + rango : ''}</span>`;
            }).join('')}
          </div>
        </div>` : ''}

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
                ${producto.variantId ? `
                <div class="detalle-acciones-compra">
                  <button class="btn btn-primary" id="btn-add-carrito">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Agregar al carrito
                  </button>
                  <button class="btn btn-outline" id="btn-comprar-ahora">Comprar ahora</button>
                </div>
                <p class="detalle-acciones-hint">Para solicitar instalación, agrega al carrito y usa el ícono <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> en la barra.</p>` : ''}
               </div>`
          }
        </div>
      </div>
    </div>`;

  document.querySelectorAll('.detalle-thumb').forEach(el => {
    el.addEventListener('click', function () {
      document.getElementById('detalle-img-principal').src = this.dataset.img;
      document.querySelector('.detalle-thumb.active')?.classList.remove('active');
      this.classList.add('active');
    });
  });

  document.getElementById('btn-add-carrito')?.addEventListener('click', () => {
    Carrito.add(producto);
    mostrarToast(producto.nombre, false);
  });

  document.getElementById('btn-comprar-ahora')?.addEventListener('click', () => {
    Carrito.add(producto);
    const url = checkoutUrl(Carrito.get());
    if (url) window.open(url, '_blank');
  });
});
