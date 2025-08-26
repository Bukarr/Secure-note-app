// === Global State ===
let notes = [];
let password = '';
let folders = JSON.parse(localStorage.getItem('folders')) || [];
let editingId = null;

// === Unlock Notes with Password ===
function unlockNotes() {
  const input = document.getElementById('passwordInput');
  if (!input) return console.error('Missing password input field');

  password = input.value;
  const encrypted = localStorage.getItem('secureNotes');

  if (encrypted) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
      notes = JSON.parse(decrypted);
      renderNotes();
    } catch (err) {
      console.error('Decryption failed:', err);
      alert('Incorrect password or corrupted data.');
    }
  }

  updateFolderSelect();
}

// === Create New Folder ===
function createFolder() {
  const input = document.getElementById('newFolderInput');
  if (!input) return console.error('Missing folder input field');

  const folder = input.value.trim();
  if (folder && !folders.includes(folder)) {
    folders.push(folder);
    localStorage.setItem('folders', JSON.stringify(folders));
    updateFolderSelect();
    input.value = '';
  }
}

// === Save or Update Note ===
function saveNote() {
  const textInput = document.getElementById('noteInput');
  const tagInput = document.getElementById('tagInput');
  const folderSelect = document.getElementById('folderSelect');
  const dateInput = document.getElementById('dateInput');

  if (!textInput || !tagInput || !folderSelect || !dateInput) {
    return console.error('Missing one or more note input fields');
  }

  const text = textInput.value.trim();
  const tags = tagInput.value.split(',').map(t => t.trim()).filter(Boolean);
  const folder = folderSelect.value;
  const date = dateInput.value || new Date().toISOString().split('T')[0];

  if (!text || !password) {
    alert('Note text and password are required.');
    return;
  }

  if (editingId) {
    const index = notes.findIndex(n => n.id === editingId);
    if (index !== -1) {
      notes[index] = { text, tags, folder, date, id: editingId };
    }
    editingId = null;
  } else {
    notes.push({ text, tags, folder, date, id: Date.now() });
  }

  persistNotes();
  textInput.value = '';
  tagInput.value = '';
  renderNotes();
}

// === Delete Note by ID ===
function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  persistNotes();
  renderNotes();
}

// === Edit Note by ID ===
function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return console.warn('Note not found:', id);

  document.getElementById('noteInput').value = note.text;
  document.getElementById('tagInput').value = note.tags.join(', ');
  document.getElementById('folderSelect').value = note.folder;
  document.getElementById('dateInput').value = note.date;
  editingId = id;
}

// === Encrypt and Save Notes to Local Storage ===
function persistNotes() {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(notes), password).toString();
    localStorage.setItem('secureNotes', encrypted);
  } catch (err) {
    console.error('Failed to save notes:', err);
  }
}
