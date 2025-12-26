import '../styles/styles.css';
import App from './pages/app.js';
import Navbar from './components/navbar.js';
import { registerServiceWorker } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  const header = document.querySelector('#app-header');

  const navbar = new Navbar({ navigationDrawer: null });
  header.innerHTML = navbar.render();
  navbar.afterRender();

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();
  await registerServiceWorker();
  console.log('Berhasil mendaftarkan service worker.');

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
