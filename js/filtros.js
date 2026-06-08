document.addEventListener('DOMContentLoaded', async function () {

  window.productos = await cargarProductos();

  const marcaEl = document.getElementById('filtro-marca');
  const modeloEl = document.getElementById('filtro-modelo');
  const añoEl = document.getElementById('filtro-ano');
  const buscarBtn = document.getElementById('filtro-buscar');
  const limpiarBtn = document.getElementById('filtro-limpiar');
  const resultadosEl = document.getElementById('equipos-resultados');
  const totalEl = document.getElementById('equipos-total');

  function uniqueSorted(arr) {
    return [...new Set(arr)].sort();
  }

  function getMarcas() {
    const marcas = new Set();
    productos.forEach(p => p.vehiculos.forEach(v => { if (v.marca) marcas.add(v.marca); }));
    return [...marcas].sort();
  }

  function getModelos(marca) {
    const modelos = new Set();
    productos.forEach(p => p.vehiculos.forEach(v => {
      if (v.marca === marca && v.modelo) modelos.add(v.modelo);
    }));
    return [...modelos].sort();
  }

  function getAños(marca, modelo) {
    const añosSet = new Set();
    productos.forEach(p => p.vehiculos.forEach(v => {
      if (v.marca === marca && v.modelo === modelo) {
        v.años.forEach(a => añosSet.add(a));
      }
    }));
    return [...añosSet].sort((a, b) => b - a);
  }

  function poblarMarca() {
    marcaEl.innerHTML = '<option value="">Selecciona una marca</option>';
    getMarcas().forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      marcaEl.appendChild(opt);
    });
    marcaEl.disabled = false;
  }

  function poblarModelo(marca) {
    modeloEl.innerHTML = '<option value="">Selecciona un modelo</option>';
    if (!marca) {
      modeloEl.disabled = true;
      añoEl.innerHTML = '<option value="">Selecciona un año</option>';
      añoEl.disabled = true;
      return;
    }
    const modelos = getModelos(marca);
    modelos.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      modeloEl.appendChild(opt);
    });
    modeloEl.disabled = false;
  }

  function poblarAño(marca, modelo) {
    añoEl.innerHTML = '<option value="">Selecciona un año</option>';
    if (!marca || !modelo) {
      añoEl.disabled = true;
      return;
    }
    const años = getAños(marca, modelo);
    años.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      añoEl.appendChild(opt);
    });
    añoEl.disabled = false;
  }

  function buildCardHtml(p, marca, modelo, año, hayFiltro) {
    const vehiculosFiltrados = p.vehiculos.filter(v => {
      if (marca && v.marca !== marca) return false;
      if (modelo && v.modelo !== modelo) return false;
      if (año && !v.años.includes(parseInt(año))) return false;
      return true;
    });

    const vehiculosMostrar = hayFiltro && vehiculosFiltrados.length ? vehiculosFiltrados : p.vehiculos;
    const compatItems = vehiculosMostrar.filter(v => v.marca);
    const compatVisible = compatItems.slice(0, 2);
    const compatResto = compatItems.length - 2;
    let compatTags = compatVisible.map(v => {
      const rango = v.años.length ? `${Math.min(...v.años)}–${Math.max(...v.años)}` : '';
      return `<span class="compat-tag">${v.marca} ${v.modelo}${rango ? ' ' + rango : ''}</span>`;
    }).join('');
    if (compatResto > 0) compatTags += `<span class="compat-tag compat-tag-more">+${compatResto} más</span>`;

    const waMsg = encodeURIComponent(`Hola, me interesa el producto: ${p.nombre}. ¿Podrían darme más información y precio?`);
    const waLink = `https://wa.me/56985615636?text=${waMsg}`;
    const sinStock = p.stock !== null && p.stock === 0;
    const stockBadge = p.stock === null ? '' :
      p.stock > 0
        ? `<span class="stock-badge stock-in">En stock</span>`
        : `<span class="stock-badge stock-out">Sin stock</span>`;

    return `
      <article class="equipo-card${sinStock ? ' sin-stock' : ''}" data-id="${p.id}">
        <div class="equipo-card-img">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
               onerror="this.src='https://placehold.co/400x280/1A1A1A/FF6B00?text=${encodeURIComponent(p.nombre)}'" />
          ${stockBadge ? `<div class="card-stock-badge">${stockBadge}</div>` : ''}
        </div>
        <div class="equipo-card-body">
          <span class="equipo-card-cat">${p.categoria}</span>
          <h3 class="equipo-card-title">${p.nombre}</h3>
          <p class="equipo-card-desc">${p.descripcion}</p>
          <div class="equipo-card-compat">${compatTags}</div>
          <div class="equipo-card-footer">
            <span class="equipo-card-precio">${p.precio ? '$' + Math.round(p.precio).toLocaleString('es-CL') : 'Consultar precio'}</span>
            <a class="btn btn-wa" href="${waLink}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.108.55 4.086 1.512 5.802L0 24l6.389-1.674A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.213-3.724.976.994-3.622-.234-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
              Consultar
            </a>
          </div>
        </div>
      </article>`;
  }

  function renderProductos(lista) {
    if (!lista || lista.length === 0) {
      resultadosEl.innerHTML = `
        <div class="equipos-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p>No se encontraron productos para esta combinación.</p>
        </div>`;
      totalEl.textContent = '0 productos';
      return;
    }

    totalEl.textContent = lista.length + ' producto' + (lista.length !== 1 ? 's' : '');

    const marca = marcaEl.value;
    const modelo = modeloEl.value;
    const año = añoEl.value;
    const hayFiltro = marca || modelo || año;

    const ordenCategorias = ['Tapas', 'Pisaderas', 'Barras'];
    const agrupado = {};
    lista.forEach(p => {
      const cat = p.categoria || 'Otros';
      if (!agrupado[cat]) agrupado[cat] = [];
      agrupado[cat].push(p);
    });

    let html = '';
    ordenCategorias.forEach(cat => {
      const items = agrupado[cat];
      if (!items || !items.length) return;

      html += `
        <div class="cat-carousel">
          <div class="cat-carousel-header">
            <h3 class="cat-carousel-title">${cat}</h3>
            <span class="cat-carousel-count">${items.length} producto${items.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="cat-carousel-scroll">
            ${items.map(p => buildCardHtml(p, marca, modelo, año, hayFiltro)).join('')}
          </div>
        </div>`;
    });

    resultadosEl.innerHTML = html;
  }

  function aplicarFiltros() {
    const marca = marcaEl.value;
    const modelo = modeloEl.value;
    const año = añoEl.value;

    if (!marca && !modelo && !año) {
      renderProductos(productos);
      return;
    }

    const filtrados = productos.filter(p =>
      p.vehiculos.some(v => {
        if (marca && v.marca !== marca) return false;
        if (modelo && v.modelo !== modelo) return false;
        if (año && !v.años.includes(parseInt(año))) return false;
        return true;
      })
    );

    renderProductos(filtrados);
  }

  function limpiarFiltros() {
    marcaEl.value = '';
    poblarModelo('');
    poblarAño('', '');
    aplicarFiltros();
  }

  marcaEl.addEventListener('change', function () {
    poblarModelo(this.value);
    poblarAño(this.value, '');
    aplicarFiltros();
  });

  modeloEl.addEventListener('change', function () {
    poblarAño(marcaEl.value, this.value);
    aplicarFiltros();
  });

  añoEl.addEventListener('change', aplicarFiltros);

  buscarBtn.addEventListener('click', aplicarFiltros);
  limpiarBtn.addEventListener('click', limpiarFiltros);

  // ── Navegar a detalle del producto ──
  resultadosEl.addEventListener('click', e => {
    const card = e.target.closest('.equipo-card');
    if (!card) return;
    const titleEl = card.querySelector('.equipo-card-title');
    const catEl = card.querySelector('.equipo-card-cat');
    if (!titleEl || !catEl) return;
    const nombre = titleEl.textContent;
    const categoria = catEl.textContent;
    const producto = window.productos.find(p => p.nombre === nombre && p.categoria === categoria);
    if (producto) window.location.href = 'producto.html?id=' + producto.id;
  });

  poblarMarca();
  limpiarFiltros();

  // ── Hero filtro ──
  const heroMarcaEl  = document.getElementById('hero-marca');
  const heroModeloEl = document.getElementById('hero-modelo');
  const heroAnoEl    = document.getElementById('hero-ano');
  const heroBuscarBtn = document.getElementById('hero-buscar');

  if (heroMarcaEl) {
    heroMarcaEl.innerHTML = '<option value="">Marca</option>';
    getMarcas().forEach(m => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = m;
      heroMarcaEl.appendChild(opt);
    });

    heroMarcaEl.addEventListener('change', function () {
      const marca = this.value;
      heroModeloEl.innerHTML = '<option value="">Modelo</option>';
      heroAnoEl.innerHTML = '<option value="">Año</option>';
      heroAnoEl.disabled = true;
      if (marca) {
        getModelos(marca).forEach(m => {
          const opt = document.createElement('option');
          opt.value = opt.textContent = m;
          heroModeloEl.appendChild(opt);
        });
        heroModeloEl.disabled = false;
      } else {
        heroModeloEl.disabled = true;
      }
    });

    heroModeloEl.addEventListener('change', function () {
      const modelo = this.value;
      heroAnoEl.innerHTML = '<option value="">Año</option>';
      if (modelo) {
        getAños(heroMarcaEl.value, modelo).forEach(a => {
          const opt = document.createElement('option');
          opt.value = opt.textContent = a;
          heroAnoEl.appendChild(opt);
        });
        heroAnoEl.disabled = false;
      } else {
        heroAnoEl.disabled = true;
      }
    });

    if (heroBuscarBtn) {
      heroBuscarBtn.addEventListener('click', () => {
        marcaEl.value = heroMarcaEl.value;
        poblarModelo(heroMarcaEl.value);
        modeloEl.value = heroModeloEl.value;
        poblarAño(heroMarcaEl.value, heroModeloEl.value);
        añoEl.value = heroAnoEl.value;
        aplicarFiltros();
        document.getElementById('equipos').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }
});
