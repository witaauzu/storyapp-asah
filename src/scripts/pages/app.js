import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { generateUnsubscribeButtonTemplate, generateSubscribeButtonTemplate } from '../templates';
import { isServiceWorkerAvailable } from '../utils';
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #drawerOverlay = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#drawerOverlay = document.querySelector('.drawer-overlay');

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this._toggleDrawer();
    });

    if (this.#drawerOverlay) {
      this.#drawerOverlay.addEventListener('click', () => {
        this._closeDrawer();
      });
    }

    this.#navigationDrawer.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        this._closeDrawer();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this._closeDrawer();
      }
    });
  }

  _toggleDrawer() {
    const isOpen = this.#navigationDrawer.classList.toggle('open');
    this.#drawerButton.setAttribute('aria-expanded', isOpen);

    if (this.#drawerOverlay) {
      this.#drawerOverlay.classList.toggle('active', isOpen);
    }

    if (isOpen) {
      const firstLink = this.#navigationDrawer.querySelector('a');
      if (firstLink) firstLink.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  _closeDrawer() {
    this.#navigationDrawer.classList.remove('open');
    this.#drawerButton.setAttribute('aria-expanded', 'false');

    if (this.#drawerOverlay) {
      this.#drawerOverlay.classList.remove('active');
    }

    document.body.style.overflow = '';
    this.#drawerButton.focus();
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });      
      return;
    }
    
    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').addEventListener('click', () => {
       subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      console.error('Route tidak ditemukan:', url);
      this.#content.innerHTML = '<p>Halaman tidak ditemukan</p>';
      return;
    }
  
    const renderContent = async () => {
      if (!this.#content) {
        console.error('Elemen #main-content tidak ditemukan');
        return;
      }
  
      const newPage = await page.render();
      this.#content.innerHTML = newPage;
  
      if (page.afterRender) {
        await page.afterRender();
      }
  
      this.#content.setAttribute('role', 'main');
      this.#content.setAttribute('tabindex', '-1');
      this.#content.focus();
  
      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => renderContent());
    } else {
      await renderContent();
    }
  }
}


export default App;
