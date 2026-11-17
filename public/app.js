const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const appearance = {
  widget: document.querySelector('#theme-widget'),
  trigger: document.querySelector('#theme-trigger'),
  popup: document.querySelector('#theme-palette-popup'),
  modeButton: document.querySelector('#mode-toggle'),
  colorButtons: [...document.querySelectorAll('.color-dot')],
};

const appearanceKeys = {
  color: 'sync_market_accent',
  mode: 'sync_market_theme',
};
const legacyAppearanceKeys = {
  color: 'pricepulse_accent',
  mode: 'pricepulse_theme',
};

function setAccentColor(color, persist = true) {
  if (!/^#[\da-f]{6}$/i.test(color)) return;
  document.documentElement.style.setProperty('--accent-color', color);
  appearance.colorButtons.forEach((button) => {
    const selected = button.dataset.color.toLowerCase() === color.toLowerCase();
    button.setAttribute('aria-pressed', String(selected));
  });
  if (persist) {
    try { localStorage.setItem(appearanceKeys.color, color); } catch { /* Keep the selected color for this visit. */ }
  }
}

function toggleDarkMode(persist = true) {
  const light = !document.body.classList.contains('light-mode');
  document.body.classList.toggle('light-mode', light);
  if (appearance.modeButton) {
    appearance.modeButton.textContent = light ? '🌙 Tema escuro' : '☀️ Tema claro';
    appearance.modeButton.setAttribute('aria-pressed', String(light));
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f8fafc' : '#11130f');
  if (persist) {
    try { localStorage.setItem(appearanceKeys.mode, light ? 'light' : 'dark'); } catch { /* Keep the selected mode for this visit. */ }
  }
}

try {
  const savedColor = localStorage.getItem(appearanceKeys.color)
    || localStorage.getItem(legacyAppearanceKeys.color);
  if (savedColor) setAccentColor(savedColor, false);
  const savedMode = localStorage.getItem(appearanceKeys.mode)
    || localStorage.getItem(legacyAppearanceKeys.mode);
  if (savedMode === 'light') document.body.classList.add('light-mode');
  if (savedMode === 'dark') document.body.classList.remove('light-mode');
  if (savedMode === 'light' || savedMode === 'dark') {
    const light = savedMode === 'light';
    if (appearance.modeButton) {
      appearance.modeButton.textContent = light ? '🌙 Tema escuro' : '☀️ Tema claro';
      appearance.modeButton.setAttribute('aria-pressed', String(light));
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f8fafc' : '#11130f');
  }
} catch {
  // Appearance still works for this visit when browser storage is unavailable.
}

const setPaletteOpen = (open) => {
  appearance.widget?.classList.toggle('is-open', open);
  appearance.trigger?.setAttribute('aria-expanded', String(open));
  appearance.popup?.setAttribute('aria-hidden', String(!open));
};

appearance.trigger?.addEventListener('click', () => {
  setPaletteOpen(!appearance.widget.classList.contains('is-open'));
});

appearance.colorButtons.forEach((button) => {
  button.addEventListener('click', () => setAccentColor(button.dataset.color));
});

appearance.modeButton?.addEventListener('click', () => {
  toggleDarkMode();
});

document.addEventListener('click', (event) => {
  if (appearance.widget && !appearance.widget.contains(event.target)) setPaletteOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && appearance.widget?.classList.contains('is-open')) {
    setPaletteOpen(false);
    appearance.trigger?.focus();
  }
});

const form = document.querySelector('#lead-form');
const feedback = document.querySelector('#form-feedback');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());
  button.disabled = true;
  button.innerHTML = 'Enviando…';
  feedback.textContent = '';
  feedback.dataset.state = '';

  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Não foi possível enviar agora.');
    form.reset();
    feedback.textContent = 'Interesse enviado. Obrigado pela mensagem!';
    feedback.dataset.state = 'success';
  } catch (error) {
    feedback.textContent = error.message.includes('DATABASE_URL')
      ? 'Formulário temporariamente indisponível. Tente novamente em instantes.'
      : error.message;
    feedback.dataset.state = 'error';
  } finally {
    button.disabled = false;
    button.innerHTML = 'Enviar interesse <span>↗</span>';
  }
});

