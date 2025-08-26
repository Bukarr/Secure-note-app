// === Theme Toggle ===
function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle('dark-mode');

  // Save preference
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// === Load Theme on Startup ===
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
}

// === Initialize Theme on Page Load ===
document.addEventListener('DOMContentLoaded', loadTheme);
document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
