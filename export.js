function formatNoteForExport(note, index = null) {
  const title = index !== null ? `Note ${index + 1}` : `Note`;
  const divider = '========================================';

  return `
${title}
${divider}
Text:
${note.text.trim()}

Tags: ${note.tags.join(', ')}
Folder: ${note.folder}
Date: ${new Date(note.date).toLocaleDateString()}

${divider}\n`;
}

// Main export function
function exportAllNotes() {
  const format = prompt("Choose export format: pdf, txt, doc, docx").toLowerCase();
  if (!['pdf', 'txt', 'doc', 'docx'].includes(format)) {
    alert("Unsupported format. Please choose pdf, txt, doc, or docx.");
    return;
  }

  if (!notes || notes.length === 0) {
    alert("No notes to export.");
    return;
  }

  if (format === 'pdf') {
    exportAsPDF();
  } else {
    exportAsText(format);
  }
}

// 📄 Export as PDF
function exportAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  notes.forEach((note, i) => {
    const content = formatNoteForExport(note, i);
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, y);
    y += lines.length * 7;

    if (y > 270 && i < notes.length - 1) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save('vaultlify_notes.pdf');
}

// 📄 Export as TXT, DOC, or DOCX
function exportAsText(format) {
  const content = notes.map((note, i) => formatNoteForExport(note, i)).join('\n');
  let mimeType = 'text/plain';

  if (format === 'doc' || format === 'docx') {
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vaultlify_notes.${format}`;
  link.click();
  URL.revokeObjectURL(link.href);
}
