/* ══════════════════════════════════════════
   Gestión de Contactos – app.js
══════════════════════════════════════════ */

// ── DATA MODEL ──────────────────────────
let contacts = [
  { id: 1, nombre: 'Ana García', entidad: 'Cliente', email: 'ana@ejemplo.com', phone: '3001234567', estado: 'ACTIVO', registro: '2024-03-01 10:00 AM' },
  { id: 2, nombre: 'Luis Martínez', entidad: 'Proveedor', email: 'luis@proveedor.com', phone: '', estado: 'INACTIVO', registro: '2024-02-28 09:15 AM' }
];

let nextId = 3;
let filteredContacts = [];
let currentPage = 1;
let perPage = 10;
let sortCol = -1;
let sortAsc = true;

// ── INITIALIZATION ───────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  renderTable();
});

function initEvents() {
  document.getElementById('btnNuevoContacto').addEventListener('click', () => {
    setupModalForCreate();
    openModal('modalContacto');
  });
}

// ── RENDER TABLE ─────────────────────────
function renderTable() {
  applyLogicFilters();
  const body = document.getElementById('tableBody');
  const start = (currentPage - 1) * perPage;
  const pageData = filteredContacts.slice(start, start + perPage);

  body.innerHTML = pageData.length ? pageData.map(c => `
        <tr class="${c.estado === 'INACTIVO' ? 'row-inactive' : ''}">
            <td>
                <div class="contact-cell">
                    <div class="avatar-sm" style="background:${getAvatarColor(c.nombre)}">${getInitials(c.nombre)}</div>
                    <span>${c.nombre}</span>
                </div>
            </td>
            <td><span class="entity-pill">${c.entidad}</span></td>
            <td>
                <div class="contact-methods">
                    ${c.email ? `<div class="subtext"><i class="fa fa-envelope tiny"></i> ${c.email}</div>` : ''}
                    ${c.phone ? `<div class="subtext"><i class="fa fa-phone tiny"></i> ${c.phone}</div>` : ''}
                </div>
            </td>
            <td><span class="status-badge ${c.estado.toLowerCase()}">${c.estado}</span></td>
            <td class="subtext">${c.registro}</td>
            <td>
                <div class="actions">
                    <button class="action-btn" onclick="setupModalForEdit(${c.id})" title="Editar"><i class="fa fa-pen"></i></button>
                    <button class="action-btn ${c.estado === 'ACTIVO' ? 'danger' : 'success'}" onclick="toggleStatus(${c.id})" title="${c.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}">
                        <i class="fa ${c.estado === 'ACTIVO' ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="6" class="empty-state">No se hallaron contactos que coincidan con la vista.</td></tr>`;

  updateUI();
}

// Subtarea: "Implementar backend..." (Validaciones y Filtrado)
function applyLogicFilters() {
  const onlyActive = document.getElementById('filterActiveOnly').checked;

  // Criterio de Aceptación 3: Solo se muestran activos por defecto
  let list = [...contacts];
  if (onlyActive) {
    list = list.filter(c => c.estado === 'ACTIVO');
  }

  // Ordenar si aplica
  if (sortCol >= 0) {
    const keys = ['nombre', 'entidad', 'email', 'estado', 'registro'];
    const key = keys[sortCol];
    list.sort((a, b) => {
      const vA = a[key] || '';
      const vB = b[key] || '';
      return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
    });
  }

  filteredContacts = list;
}

// ── CRUD LOGIC ─────────────────────────────
function handleSaveContact() {
  const id = document.getElementById('editId').value;
  const nombre = document.getElementById('contactName').value.trim();
  const entidad = document.getElementById('contactEntity').value;
  const email = document.getElementById('contactEmail').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const estado = document.getElementById('contactStatus').value;

  // Criterio de Aceptación 1: Nombre y al menos un medio obligatorios
  if (!nombre) return showToast('El nombre es obligatorio', 'error');
  if (!email && !phone) return showToast('Debe ingresar un correo o un teléfono', 'error');

  // Criterio de Aceptación 2: No duplicados por correo en la misma entidad
  if (email) {
    const isDuplicate = contacts.some(c =>
      c.email.toLowerCase() === email.toLowerCase() &&
      c.entidad === entidad &&
      c.id != id
    );
    if (isDuplicate) return showToast(`Ya existe un contacto con ese correo en ${entidad}`, 'error');
  }

  const now = new Date().toLocaleString();

  if (id) {
    // Editar
    const idx = contacts.findIndex(c => c.id == id);
    contacts[idx] = { ...contacts[idx], nombre, entidad, email, phone, estado };
    showToast('Contacto actualizado', 'success');
  } else {
    // Crear
    contacts.unshift({
      id: nextId++,
      nombre, entidad, email, phone, estado,
      registro: now
    });
    showToast('Contacto registrado', 'success');
  }

  closeModal('modalContacto');
  renderTable();
}

function toggleStatus(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  c.estado = (c.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO');
  renderTable();
  showToast(`Contacto ${c.estado === 'ACTIVO' ? 'activado' : 'inactivado'}`, 'info');
}

// ── HELPERS ────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function setupModalForCreate() {
  document.getElementById('modalTitle').textContent = 'Registrar Contacto';
  document.getElementById('editId').value = '';
  document.getElementById('contactForm').reset();
  document.getElementById('contactStatus').value = 'ACTIVO';
}

function setupModalForEdit(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  document.getElementById('modalTitle').textContent = 'Editar Contacto';
  document.getElementById('editId').value = c.id;
  document.getElementById('contactName').value = c.nombre;
  document.getElementById('contactEntity').value = c.entidad;
  document.getElementById('contactStatus').value = c.estado;
  document.getElementById('contactEmail').value = c.email;
  document.getElementById('contactPhone').value = c.phone;
  openModal('modalContacto');
}

function updateUI() {
  document.getElementById('recordCount').textContent = `${filteredContacts.length} registros`;
  document.getElementById('pageIndicator').textContent = currentPage;
  const pages = Math.ceil(filteredContacts.length / perPage) || 1;
  document.getElementById('btnPrev').disabled = currentPage <= 1;
  document.getElementById('btnNext').disabled = currentPage >= pages;
}

function changePage(dir) {
  const pages = Math.ceil(filteredContacts.length / perPage) || 1;
  currentPage = Math.min(Math.max(1, currentPage + dir), pages);
  renderTable();
}

function sortTable(col) {
  if (sortCol === col) sortAsc = !sortAsc;
  else { sortCol = col; sortAsc = true; }
  currentPage = 1;
  renderTable();
}

function getAvatarColor(name) {
  const colors = ['#ff7a59', '#6941e0', '#0091ae', '#f59e0b', '#10b981'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xFFFF;
  return colors[h % colors.length];
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast-mini ${type}`;
  t.innerHTML = `<i class="fa ${type === 'success' ? 'fa-check-circle' : 'fa-circle-info'}"></i> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}
