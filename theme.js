function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);/*Sauvegarde le thème dans le navigateur pour le conserver après rechargement*/
  // Update the dropdown to reflect current theme
  const themeSelect = document.getElementById('theme');
  if (themeSelect) {
    themeSelect.value = theme;}
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';/*Récupère le thème stocké ("dark" ou "light"). Si aucun thème n’est stocké, utilise "light" par défaut*/
  setTheme(savedTheme);/*Applique le thème récupéré*/
  // Set up theme selector change handler
  const themeSelect = document.getElementById('theme');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      setTheme(e.target.value);
    });
  }
}

document.addEventListener('DOMContentLoaded', initTheme);