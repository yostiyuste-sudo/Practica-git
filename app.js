/* ══════════════════════════════════════════
   Contactos – app.js
══════════════════════════════════════════ */

// ── DATA ──────────────────────────────────
const AVATAR_COLORS = [
  '#ff7a59', '#0091ae', '#6941e0', '#f59e0b',
  '#10b981', '#e56db1', '#3b82f6', '#ef4444',
];

let contacts = [
  { id: 1, nombre: 'Andrea Fernández', email: 'andrea.fernandez@email.com', phone: '+1 (555) 201-4432', created: '22 oct. de 2024 5:09 PM', owner: 'Carlos López', status: 'En curso', active: true },
  { id: 2, nombre: 'Roberto Castillo', email: 'roberto.castillo@empresa.mx', phone: '+1 (555) 318-7720', created: '22 oct. de 2024 4:07 PM', owner: 'Ana Torres', status: 'En curso', active: true },
  { id: 3, nombre: 'Sandra Jiménez', email: 'sandra.jimenez@outlook.com', phone: '+1 (555) 442-9901', created: '22 oct. de 2024 3:52 PM', owner: 'Miguel Soto', status: 'En curso', active: true },
  { id: 4, nombre: 'Felipe Morales', email: 'felipe.morales@gmail.com', phone: '+1 (555) 187-3344', created: '12 may. de 2022 12:56 PM', owner: 'Laura Gómez', status: 'Nuevo', active: true },
  { id: 5, nombre: 'Valentina Ríos', email: 'val.rios@corporativa.co', phone: '+1 (555) 563-0087', created: '11 may. de 2022 12:35 PM', owner: 'Carlos López', status: 'Nuevo', active: true },
];

let nextId = 6;
let filteredContacts = [...contacts];
let currentPage = 1;
let perPage = 5;
let sortCol = -1;
let sortAsc = true;


// ── INIT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTable();
  bindViewToggle();
  bindCrearBtn();
  // Global search in topnav filters the table
  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('input', () => {
      currentPage = 1;
      renderTable();
    });
  }
});

// ── AVATAR ────────────────────────────────
function avatarColor(name) {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// ── STATUS BADGE ──────────────────────────
function statusClass(status) {
  const map = {
    'En curso': 'en-curso', 'Nuevo': 'nuevo',
    'Abierto': 'abierto', 'Ganado': 'ganado', 'Perdido': 'perdido',
  };
  return 'status-badge status-' + (map[status] || 'nuevo');
}

// ── RENDER TABLE ──────────────────────────
function renderTable() {
  applyFilters();
  const body = document.getElementById('tableBody');
  const start = (currentPage - 1) * perPage;
  const page = filteredContacts.slice(start, start + perPage);

  body.innerHTML = page.length ? page.map(c => `
    <tr onclick="openDetalle(${c.id})" style="${c.active ? '' : 'opacity: 0.6; background: #f1f5f9;'}">
      <td class="col-check" onclick="event.stopPropagation()">
        <input type="checkbox" class="row-cb" data-id="${c.id}" onchange="updateSelectAll()"/>
      </td>
      <td>
        <div class="contact-cell">
          <div class="contact-avatar" style="background:${avatarColor(c.nombre)}">${initials(c.nombre)}</div>
          <div>
            <div class="contact-name">${c.nombre}</div>
            <div class="contact-email">${c.email}</div>
          </div>
        </div>
      </td>
      <td>${c.phone}</td>
      <td>${c.created}</td>
      <td>${c.owner}</td>
      <td><span class="${statusClass(c.status)}">${c.status}</span></td>
      <td>
        <div class="action-cell" onclick="event.stopPropagation()">
          <button class="row-action" title="Ver detalle" onclick="openDetalle(${c.id})">
            <i class="fa fa-eye"></i>
          </button>
          <button class="row-action" title="Editar" onclick="editContact(${c.id})">
            <i class="fa fa-pen"></i>
          </button>
          <button class="row-action ${c.active ? '' : 'danger'}" title="${c.active ? 'Inactivar' : 'Activar'}" onclick="toggleContactStatus(${c.id})">
            <i class="fa ${c.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="7" style="text-align:center;padding:40px;color:#94a3b8;">
        <i class="fa fa-users" style="font-size:2rem;margin-bottom:8px;display:block"></i>
        No se encontraron contactos
      </td>
    </tr>`;

  updatePagination();
  updateRecordCount();
}

// ── FILTERS ───────────────────────────────
function applyFilters() {
  const q = (document.getElementById('globalSearch')?.value || '').toLowerCase();
  let list = [...contacts];

  if (q) {
    list = list.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }

  if (sortCol >= 0) {
    const keys = ['nombre', 'phone', 'created', 'owner', 'status'];
    list.sort((a, b) => {
      const av = Object.values(a)[sortCol + 1] || '';
      const bv = Object.values(b)[sortCol + 1] || '';
      return sortAsc
        ? av.toString().localeCompare(bv.toString())
        : bv.toString().localeCompare(av.toString());
    });
  }

  filteredContacts = list;
}



// ── SORT ─────────────────────────────────
function sortTable(col) {
  if (sortCol === col) sortAsc = !sortAsc;
  else { sortCol = col; sortAsc = true; }
  currentPage = 1;
  renderTable();

  document.querySelectorAll('th.sortable i').forEach((icon, i) => {
    icon.className = i === col
      ? (sortAsc ? 'fa fa-sort-up' : 'fa fa-sort-down')
      : 'fa fa-sort';
  });
}

// ── PAGINATION ───────────────────────────
function updatePagination() {
  const total = filteredContacts.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (currentPage > pages) currentPage = pages;
  document.getElementById('pageIndicator').textContent = currentPage;
  document.getElementById('btnPrev').disabled = currentPage <= 1;
  document.getElementById('btnNext').disabled = currentPage >= pages;
}

function changePage(dir) {
  const pages = Math.ceil(filteredContacts.length / perPage);
  currentPage = Math.min(Math.max(1, currentPage + dir), pages);
  renderTable();
}

function changePerPage() {
  perPage = parseInt(document.getElementById('perPageSelect').value);
  currentPage = 1;
  renderTable();
}

function updateRecordCount() {
  document.getElementById('recordCount').textContent =
    `${filteredContacts.length} registro${filteredContacts.length !== 1 ? 's' : ''}`;
}

// ── SELECT ALL ───────────────────────────
function toggleAll(masterCb) {
  document.querySelectorAll('.row-cb').forEach(cb => cb.checked = masterCb.checked);
}
function updateSelectAll() {
  const cbs = document.querySelectorAll('.row-cb');
  const all = [...cbs].every(cb => cb.checked);
  document.getElementById('selectAll').checked = all && cbs.length > 0;
}



// ── VIEW TOGGLE ──────────────────────────
function bindViewToggle() {
  document.querySelectorAll('.vtoggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vtoggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const title = btn.title;
      if (title !== 'Lista') showToast(`Vista "${title}" no disponible en este plan`, 'info');
    });
  });
}



// ── CREAR CONTACTO ───────────────────────
function bindCrearBtn() {
  document.getElementById('btnCrearContacto')
    .addEventListener('click', () => openModal('modalCrear'));
}

function createContact() {
  const fn = document.getElementById('newFirstName').value.trim();
  const ln = document.getElementById('newLastName').value.trim();
  if (!fn || !ln) {
    showToast('Por favor ingresa nombre y apellido', 'error'); return;
  }
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  contacts.unshift({
    id: nextId++,
    nombre: `${fn} ${ln}`,
    email: document.getElementById('newEmail').value.trim() || '—',
    phone: document.getElementById('newPhone').value.trim() || '—',
    created: dateStr,
    owner: document.getElementById('newOwner').value,
    status: document.getElementById('newStatus').value,
    active: true,
  });
  closeModal('modalCrear');
  clearForm(['newFirstName', 'newLastName', 'newEmail', 'newPhone']);
  currentPage = 1;
  renderTable();
  showToast('Contacto creado correctamente', 'success');
}

function clearForm(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// ── DETALLE ───────────────────────────────
function openDetalle(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  document.getElementById('detalleNombre').textContent = c.nombre;
  document.getElementById('detalleEmail').textContent = c.email;
  document.getElementById('detalleTelefono').textContent = c.phone;
  document.getElementById('detallePropietario').textContent = c.owner;
  document.getElementById('detalleEstado').textContent = c.status;
  document.getElementById('detalleFecha').textContent = c.created;
  const av = document.getElementById('detalleAvatar');
  av.textContent = initials(c.nombre);
  av.style.background = avatarColor(c.nombre);
  const btnAccion = document.getElementById('btnToggleStatusDetalle');
  btnAccion.textContent = c.active ? 'Inactivar contacto' : 'Activar contacto';
  btnAccion.className = c.active ? 'btn btn-danger' : 'btn btn-success';
  btnAccion.onclick = () => {
    toggleContactStatus(id);
    closeModal('modalDetalle');
  };
  openModal('modalDetalle');
}

// ── EDITAR ────────────────────────────────
function editContact(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  const [fn, ...lnArr] = c.nombre.split(' ');
  document.getElementById('newFirstName').value = fn;
  document.getElementById('newLastName').value = lnArr.join(' ');
  document.getElementById('newEmail').value = c.email !== '—' ? c.email : '';
  document.getElementById('newPhone').value = c.phone !== '—' ? c.phone : '';
  document.getElementById('newOwner').value = c.owner;
  document.getElementById('newStatus').value = c.status;

  // swap button to "Guardar"
  const footer = document.querySelector('#modalCrear .modal-footer');
  const oldBtn = footer.querySelector('.btn-primary');
  const newBtn = oldBtn.cloneNode(true);
  newBtn.textContent = 'Guardar cambios';
  newBtn.onclick = () => saveEdit(id);
  oldBtn.replaceWith(newBtn);

  document.querySelector('#modalCrear .modal-header h2').textContent = 'Editar contacto';
  openModal('modalCrear');
}

function saveEdit(id) {
  const fn = document.getElementById('newFirstName').value.trim();
  const ln = document.getElementById('newLastName').value.trim();
  if (!fn || !ln) { showToast('Por favor ingresa nombre y apellido', 'error'); return; }
  const idx = contacts.findIndex(x => x.id === id);
  if (idx < 0) return;
  contacts[idx] = {
    ...contacts[idx],
    nombre: `${fn} ${ln}`,
    email: document.getElementById('newEmail').value.trim() || '—',
    phone: document.getElementById('newPhone').value.trim() || '—',
    owner: document.getElementById('newOwner').value,
    status: document.getElementById('newStatus').value,
  };
  closeModal('modalCrear');
  renderTable();
  showToast('Contacto actualizado', 'success');
}

// ── ACTIVAR/INACTIVAR ────────────────────
function toggleContactStatus(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  c.active = !c.active;
  renderTable();
  showToast(`Contacto ${c.active ? 'activado' : 'inactivado'} correctamente`, 'success');
}











function showCopilot(e, id) { /* handled by delegate above */ }

// ── MODALS ───────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  // reset crear modal header/btn if it was in edit mode
  if (id === 'modalCrear') {
    document.querySelector('#modalCrear .modal-header h2').textContent = 'Crear contacto';
    const footer = document.querySelector('#modalCrear .modal-footer');
    const btn = footer.querySelector('.btn-primary');
    btn.textContent = 'Crear contacto';
    btn.onclick = createContact;
    clearForm(['newFirstName', 'newLastName', 'newEmail', 'newPhone']);
  }
}

// close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ── TOAST ────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa ${icons[type] || icons.info}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'none';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
