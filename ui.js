// === Global State ===
let notes = [];
let folders = JSON.parse(localStorage.getItem('folders')) || [];
let password = '';
let editingId = null;

// === UI Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  updateFolderSelect();
  renderNotes();

  // Event Listeners
  document.getElementById('folderSelect').addEventListener('change', () => renderNotes());
  document.getElementById('noteInput').addEventListener('input', updateSaveButtonLabel);
  document.getElementById('clearNoteBtn').addEventListener('click', clearNoteInput);
  document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
  document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
  document.getElementById('noteInput').addEventListener('dragover', e => e.preventDefault());
  document.getElementById('noteInput').addEventListener('drop', handleDrop);
  document.getElementById('searchInput').addEventListener('input', searchNotes);
  document.getElementById('importInput').addEventListener('change', e => importNotes(e.target));
  document.getElementById('imageInput').addEventListener('change', e => scanImage(e.target));
  document.getElementById('speechBtn').addEventListener('click', startSpeechToText);
  document.getElementById('createFolderBtn').addEventListener('click', createFolder);
  document.getElementById('unlockBtn').addEventListener('click', unlockNotes);
  document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
  document.getElementById('exportAllBtn').addEventListener('click', exportAllNotes);
});

// === Theme Handling ===
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('toggleTheme').textContent = 'Light Mode';
  }
}

function toggleTheme() {
  const body = document.body;
  const themeBtn = document.getElementById('toggleTheme');
  const isDark = body.classList.toggle('dark-theme');
  themeBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// === Folder Management ===
function updateFolderSelect() {
  const select = document.getElementById('folderSelect');
  select.innerHTML = `<option value="">All Folders</option>`;
  folders.forEach(folder => {
    const opt = document.createElement('option');
    opt.value = folder;
    opt.textContent = folder;
    select.appendChild(opt);
  });
}

// === Notes Rendering ===
function renderNotes(filtered = notes) {
  const container = document.getElementById('notesContainer');
  const selectedFolder = document.getElementById('folderSelect').value;
  container.innerHTML = '';

  filtered
    .filter(note => !selectedFolder || note.folder === selectedFolder)
    .forEach(note => {
      const card = document.createElement('div');
      card.className = 'card note-card';
      card.innerHTML = `
        <div class="card-body">
          <p>${note.text}</p>
          <small class="text-muted">
            Tags: ${note.tags.join(', ')} | Folder: ${note.folder} | Date: ${note.date}
          </small>
          <div class="mt-2 d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-danger" onclick="deleteNote(${note.id})">Delete</button>
            <button class="btn btn-sm btn-warning" onclick="editNote(${note.id})">Edit</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="exportNote(${note.id}, 'txt')">TXT</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="exportNote(${note.id}, 'doc')">DOC</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="exportNote(${note.id}, 'pdf')">PDF</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
}

// === Note Editing ===
function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  document.getElementById('noteInput').value = note.text;
  document.getElementById('tagInput').value = note.tags.join(', ');
  document.getElementById('folderSelect').value = note.folder;
  document.getElementById('dateInput').value = note.date;
  editingId = id;
  updateSaveButtonLabel();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(notes), password).toString();
  localStorage.setItem('secureNotes', encrypted);
  renderNotes();

  if (editingId === id) {
    clearNoteInput();
    updateSaveButtonLabel();
  }
}

function clearNoteInput() {
  document.getElementById('noteInput').value = '';
  document.getElementById('tagInput').value = '';
  editingId = null;
}

function updateSaveButtonLabel() {
  const btn = document.getElementById('saveNoteBtn');
  btn.textContent = editingId ? 'Update Note' : 'Save Note';
}

// === Password Visibility ===
function togglePasswordVisibility() {
  const pwdInput = document.getElementById('passwordInput');
  const toggleBtn = document.getElementById('togglePassword');
  const isVisible = pwdInput.type === 'text';
  pwdInput.type = isVisible ? 'password' : 'text';
  toggleBtn.textContent = isVisible ? 'Show' : 'Hide';
}
function unlockNotes() {
  password = document.getElementById('passwordInput').value;
  const encrypted = localStorage.getItem('secureNotes');
  if (encrypted) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
      notes = JSON.parse(decrypted);
      renderNotes();
    } catch {
      alert("Incorrect password or corrupted data.");
    }
  }
  updateFolderSelect();
}
function createFolder() {
  const folder = document.getElementById('newFolderInput').value.trim();
  if (folder && !folders.includes(folder)) {
    folders.push(folder);
    localStorage.setItem('folders', JSON.stringify(folders));
    updateFolderSelect();
    document.getElementById('newFolderInput').value = '';
  }
}
function saveNote() {
  const text = document.getElementById('noteInput').value.trim();
  const tags = document.getElementById('tagInput').value.split(',').map(t => t.trim()).filter(Boolean);
  const folder = document.getElementById('folderSelect').value;
  const date = document.getElementById('dateInput').value || new Date().toISOString().split('T')[0];
  if (!text || !password) return;

  if (editingId) {
    const index = notes.findIndex(n => n.id === editingId);
    notes[index] = { text, tags, folder, date, id: editingId };
    editingId = null;
  } else {
    notes.push({ text, tags, folder, date, id: Date.now() });
  }

  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(notes), password).toString();
  localStorage.setItem('secureNotes', encrypted);
  document.getElementById('noteInput').value = '';
  document.getElementById('tagInput').value = '';
  renderNotes();
    updateSaveButtonLabel();
}
function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(notes), password).toString();
  localStorage.setItem('secureNotes', encrypted);
    renderNotes();
    if (editingId === id) {
        clearNoteInput();
        updateSaveButtonLabel();
    }
}
function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  document.getElementById('noteInput').value = note.text;
  document.getElementById('tagInput').value = note.tags.join(', ');
  document.getElementById('folderSelect').value = note.folder;
  document.getElementById('dateInput').value = note.date;
  editingId = id;
  updateSaveButtonLabel();
}
function clearNoteInput() {
  document.getElementById('noteInput').value = '';
  document.getElementById('tagInput').value = '';
  editingId = null;
  updateSaveButtonLabel();
}
function updateSaveButtonLabel() {
  const btn = document.getElementById('saveNoteBtn');
  btn.textContent = editingId ? 'Update Note' : 'Save Note';
}
function togglePasswordVisibility() {
  const pwdInput = document.getElementById('passwordInput');
  const toggleBtn = document.getElementById('togglePassword');
  const isVisible = pwdInput.type === 'text';
  pwdInput.type = isVisible ? 'password' : 'text';
  toggleBtn.textContent = isVisible ? 'Show' : 'Hide';
}
function unlockNotes() {
  password = document.getElementById('passwordInput').value;
  const encrypted = localStorage.getItem('secureNotes');
  if (encrypted) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
      notes = JSON.parse(decrypted);
      renderNotes();
    } catch {
      alert("Incorrect password or corrupted data.");
    }
  }
  updateFolderSelect();
}
function createFolder() {
  const folder = document.getElementById('newFolderInput').value.trim();
  if (folder && !folders.includes(folder)) {
    folders.push(folder);
    localStorage.setItem('folders', JSON.stringify(folders));
    updateFolderSelect();
    document.getElementById('newFolderInput').value = '';
  }
}
function saveNote() {
  const text = document.getElementById('noteInput').value.trim();
  const tags = document.getElementById('tagInput').value.split(',').map(t => t.trim()).filter(Boolean);
  const folder = document.getElementById('folderSelect').value;
  const date = document.getElementById('dateInput').value || new Date().toISOString().split('T')[0];
  if (!text || !password) return;

  if (editingId) {
    const index = notes.findIndex(n => n.id === editingId);
    notes[index] = { text, tags, folder, date, id: editingId };
    editingId = null;
  } else {
    notes.push({ text, tags, folder, date, id: Date.now() });
  }

  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(notes), password).toString();
  localStorage.setItem('secureNotes', encrypted);
  document.getElementById('noteInput').value = '';
  document.getElementById('tagInput').value = '';
  renderNotes();
  updateSaveButtonLabel();
}
function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(notes), password).toString();
  localStorage.setItem('secureNotes', encrypted);
    renderNotes();
    if (editingId === id) {
        clearNoteInput();
        updateSaveButtonLabel();
    }
}
function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  document.getElementById('noteInput').value = note.text;
  document.getElementById('tagInput').value = note.tags.join(', ');
  document.getElementById('folderSelect').value = note.folder;
  document.getElementById('dateInput').value = note.date;
  editingId = id;
  updateSaveButtonLabel();
}
function clearNoteInput() {
  document.getElementById('noteInput').value = '';
  document.getElementById('tagInput').value = '';
  editingId = null;
  updateSaveButtonLabel();
}
function updateSaveButtonLabel() {
  const btn = document.getElementById('saveNoteBtn');
  btn.textContent = editingId ? 'Update Note' : 'Save Note';
}
function togglePasswordVisibility() {
  const pwdInput = document.getElementById('passwordInput');
  const toggleBtn = document.getElementById('togglePassword');
  const isVisible = pwdInput.type === 'text';
  pwdInput.type = isVisible ? 'password' : 'text';
  toggleBtn.textContent = isVisible ? 'Show' : 'Hide';
}
function unlockNotes() {
  password = document.getElementById('passwordInput').value;
  const encrypted = localStorage.getItem('secureNotes');
  if (encrypted) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
      notes = JSON.parse(decrypted);
      renderNotes();
    } catch {
      alert("Incorrect password or corrupted data.");
    }
  }
  updateFolderSelect();
}
function createFolder() {
  const folder = document.getElementById('newFolderInput').value.trim();
  if (folder && !folders.includes(folder)) {
    folders.push(folder);
    localStorage.setItem('folders', JSON.stringify(folders));
    updateFolderSelect();
    document.getElementById('newFolderInput').value = '';
  }
}
function saveNote() {
  const text = document.getElementById('noteInput').value.trim();
  const tags = document.getElementById('tagInput').value.split(',').map(t => t.trim()).filter(Boolean);
  const folder = document.getElementById('folderSelect').value;
  const date = document.getElementById('dateInput').value || new Date().toISOString().split('T')[0];
  if (!text || !password) return;

  if (editingId) {
    const index = notes.findIndex(n => n.id === editingId);
    notes[index] = { text, tags, folder, date, id: editingId };
    editingId = null;
  } else {
    notes.push({ text, tags, folder, date, id: Date.now() });
  }

  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(notes), password).toString();
  localStorage.setItem('secureNotes', encrypted);
  document.getElementById('noteInput').value = '';
  document.getElementById('tagInput').value = '';
  renderNotes();
  updateSaveButtonLabel();
}
function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(notes), password).toString();
  localStorage.setItem('secureNotes', encrypted);
    renderNotes();
    if (editingId === id) {
        clearNoteInput();
        updateSaveButtonLabel();
    }
}
