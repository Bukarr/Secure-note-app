function searchNotes() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return renderNotes();

  const fuse = new Fuse(notes, {
    keys: ['text', 'tags', 'folder'],
    threshold: 0.3
  });

  const results = fuse.search(query).map(r => r.item);
  renderNotes(results);
}
