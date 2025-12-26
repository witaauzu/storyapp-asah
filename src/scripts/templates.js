export function showLoader() {
  const existingLoader = document.querySelector('.loader-overlay');
  if (existingLoader) return;

  const loader = document.createElement('div');
  loader.className = 'loader-overlay';
  loader.innerHTML = `
    <div class="loader" role="status" aria-live="polite" aria-label="Memuat..."></div>
  `;
  document.body.appendChild(loader);
}

export function hideLoader() {
  const loader = document.querySelector('.loader-overlay');
  if (loader) loader.remove();
}

export function generateMainTemplate(content) {
  return `
    <main id="mainContent" class="main-content container" role="main" tabindex="-1">
      ${content}
    </main>
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}