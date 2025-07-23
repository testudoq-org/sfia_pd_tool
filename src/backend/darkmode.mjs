// Dark mode and accessibility logic for csv2json.htm

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'high-contrast', 'sepia');
  if (theme === 'dark') root.classList.add('dark');
  if (theme === 'high-contrast') root.classList.add('high-contrast');
  if (theme === 'sepia') root.classList.add('sepia');
}
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function loadPreferences() {
  const prefs = JSON.parse(localStorage.getItem('accessibilityPrefs') || '{}');
  return prefs;
}
function savePreferences(prefs) {
  localStorage.setItem('accessibilityPrefs', JSON.stringify(prefs));
}
function setFontSize(size) {
  document.body.style.fontSize = size + 'px';
}
function setLineHeight(lh) {
  document.body.style.lineHeight = lh;
}
function setDyslexiaFont(enabled) {
  document.body.classList.toggle('font-dyslexic', enabled);
  const output = document.getElementById('output');
  if (output) {
    output.classList.toggle('font-dyslexic', enabled);
  }
}
function setHighContrast(enabled) {
  document.documentElement.classList.toggle('high-contrast', enabled);
}
function setReadingRuler(enabled) {
  document.getElementById('reading-ruler').classList.toggle('hidden', !enabled);
}
function setTheme(theme) {
  if (theme === 'system') {
    applyTheme(getSystemTheme());
  } else {
    applyTheme(theme);
  }
}
function resetAccessibility() {
  setFontSize(18);
  setLineHeight(1.6);
  setDyslexiaFont(false);
  setHighContrast(false);
  setReadingRuler(false);
  setTheme('system');
  document.getElementById('font-size-slider').value = 18;
  document.getElementById('font-size-value').textContent = '18px';
  document.getElementById('line-height-slider').value = 1.6;
  document.getElementById('line-height-value').textContent = '1.6';
  document.getElementById('dyslexia-toggle').checked = false;
  document.getElementById('contrast-toggle').checked = false;
  document.getElementById('ruler-toggle').checked = false;
  document.getElementById('theme-select').value = 'system';
  savePreferences({});
}

// Accessibility panel logic
document.addEventListener('DOMContentLoaded', function () {
  // Theme
  const prefs = loadPreferences();
  setFontSize(prefs.fontSize || 18);
  setLineHeight(prefs.lineHeight || 1.6);
  setDyslexiaFont(prefs.dyslexiaFont || false);
  setHighContrast(prefs.highContrast || false);
  setReadingRuler(prefs.readingRuler || false);
  setTheme(prefs.theme || 'system');
  // Font size
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeValue = document.getElementById('font-size-value');
  fontSizeSlider.value = prefs.fontSize || 18;
  fontSizeValue.textContent = (prefs.fontSize || 18) + 'px';
  fontSizeSlider.addEventListener('input', function () {
    setFontSize(this.value);
    fontSizeValue.textContent = this.value + 'px';
    prefs.fontSize = Number(this.value);
    savePreferences(prefs);
  });
  // Line height
  const lineHeightSlider = document.getElementById('line-height-slider');
  const lineHeightValue = document.getElementById('line-height-value');
  lineHeightSlider.value = prefs.lineHeight || 1.6;
  lineHeightValue.textContent = (prefs.lineHeight || 1.6);
  lineHeightSlider.addEventListener('input', function () {
    setLineHeight(this.value);
    lineHeightValue.textContent = this.value;
    prefs.lineHeight = Number(this.value);
    savePreferences(prefs);
  });
  // Dyslexia font
  const dyslexiaToggle = document.getElementById('dyslexia-toggle');
  dyslexiaToggle.checked = prefs.dyslexiaFont || false;
  dyslexiaToggle.addEventListener('change', function () {
    setDyslexiaFont(this.checked);
    prefs.dyslexiaFont = this.checked;
    savePreferences(prefs);
  });
  // High contrast
  const contrastToggle = document.getElementById('contrast-toggle');
  contrastToggle.checked = prefs.highContrast || false;
  contrastToggle.addEventListener('change', function () {
    setHighContrast(this.checked);
    prefs.highContrast = this.checked;
    savePreferences(prefs);
  });
  // Reading ruler
  const rulerToggle = document.getElementById('ruler-toggle');
  rulerToggle.checked = prefs.readingRuler || false;
  rulerToggle.addEventListener('change', function () {
    setReadingRuler(this.checked);
    prefs.readingRuler = this.checked;
    savePreferences(prefs);
  });
  // Theme selector
  const themeSelect = document.getElementById('theme-select');
  themeSelect.value = prefs.theme || 'system';
  themeSelect.addEventListener('change', function () {
    setTheme(this.value);
    prefs.theme = this.value;
    savePreferences(prefs);
  });
  // Reset
  document.getElementById('reset-accessibility').addEventListener('click', resetAccessibility);
  // Close panel
  document.getElementById('close-access-panel').addEventListener('click', function () {
    document.getElementById('accessibility-panel').style.display = 'none';
    document.getElementById('main-content').focus();
  });
  // Keyboard shortcut: Alt+A to open panel
  document.addEventListener('keydown', function (e) {
    if (e.altKey && e.key.toLowerCase() === 'a') {
      document.getElementById('accessibility-panel').style.display = 'block';
      document.getElementById('accessibility-panel').focus();
    }
  });
  // Reading ruler follows mouse/focus
  document.addEventListener('mousemove', function (e) {
    if (!prefs.readingRuler && !document.getElementById('reading-ruler').classList.contains('hidden')) return;
    const ruler = document.getElementById('reading-ruler');
    if (ruler.classList.contains('hidden')) return;
    ruler.style.top = (e.clientY - 24) + 'px';
  });
  // System dark mode detection
  if ((prefs.theme || 'system') === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if ((prefs.theme || 'system') === 'system') {
        if (e.matches) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    });
  }
});