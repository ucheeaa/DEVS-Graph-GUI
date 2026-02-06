export function startI18n() {

  let translations = {};
  let userLang = localStorage.getItem('lang') || navigator.language.split('-')[0] || 'en';

  const languageSelect = document.getElementById('languageSelect');
  languageSelect.value = userLang;

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`i18n/${lang}.json`);
      translations = await response.json();
      updateTexts();
      localStorage.setItem('lang', lang); // persist user choice
    } catch (err) {
      console.error(`Could not load ${lang} translations.`, err);
      if (lang !== 'en') loadTranslations('en');
    }
  }

  function updateTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });
  }

  // Event listener for language switching
  languageSelect.addEventListener('change', (e) => {
    loadTranslations(e.target.value);
  });

  // Load initial language
  loadTranslations(userLang);

}