export default class Navbar {
  constructor() {
    this.drawerButton = null;
    this.navigationDrawer = null;
    this.overlay = null;
    this.isDrawerOpen = false;
  }

  render() {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    return `
      <!-- Skip to Content Link (WCAG) -->
      <a href="#main-content" class="skip-to-content">
        Langsung ke konten utama
      </a>

      <!-- Header / Navbar -->
      <header role="banner">
        <div class="container main-header">
          <!-- Brand Logo -->
          <a 
            href="#/" 
            class="brand-name" 
            aria-label="StoryApp - Kembali ke beranda"
          >
            StoryApp
          </a>

          <!-- Hamburger Button (Mobile Only) -->
          <button 
            id="drawer-button" 
            class="drawer-button" 
            aria-label="Buka menu navigasi" 
            aria-controls="navigation-drawer"
            aria-expanded="false"
            type="button"
          >
            <span aria-hidden="true">☰</span>
          </button>

          <!-- Navigation Menu -->
          <nav 
            id="navigation-drawer" 
            class="navigation-drawer" 
            role="navigation" 
            aria-label="Menu navigasi utama"
          >
            <ul class="nav-list" role="list">
              <li>
                <a href="#/" aria-current="page">
                  Beranda
                </a>
              </li>
              ${this._renderAuthMenu(isAuthenticated)}
            </ul>
          </nav>
        </div>
      </header>

      <!-- Overlay untuk mobile drawer -->
      <div 
        id="drawer-overlay" 
        class="drawer-overlay" 
        aria-hidden="true"
      ></div>
    `;
  }

  _renderAuthMenu(isAuthenticated) {
    if (isAuthenticated) {
      return `
        <li>
          <a href="#/add-story">
            Tambah Cerita
          </a>
        </li>
        <li><a href="#/bookmark">Bookmark</a></li>
        <li><div id="push-notification-tools" class="push-tools"></div></li>
        <li>
          <a href="#" id="logout-btn" role="button">
            Logout
          </a>
        </li>
      `;
    }

    return `
      <li>
        <a href="#/login">
          Login
        </a>
      </li>
      <li>
        <a href="#/register">
          Register
        </a>
      </li>
    `;
  }

  afterRender() {
    this.drawerButton = document.querySelector('#drawer-button');
    this.navigationDrawer = document.querySelector('#navigation-drawer');
    this.overlay = document.querySelector('#drawer-overlay');
    const logoutBtn = document.querySelector('#logout-btn');

    if (this.drawerButton && this.navigationDrawer && this.overlay) {
      this._setupDrawer();
    }

    if (logoutBtn) {
      this._setupLogout(logoutBtn);
    }

    this._highlightActiveLink();
  }

 _setupDrawer() {
    this.drawerButton.addEventListener('click', (e) => {
      e.stopPropagation(); 
      this._toggleDrawer();
    });

    this.overlay.addEventListener('click', () => {
      this._closeDrawer();
    });

    const navLinks = this.navigationDrawer.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this._closeDrawer();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isDrawerOpen) {
        this._closeDrawer();
        this.drawerButton.focus();
      }
    });
  }

  _toggleDrawer() {
    if (this.isDrawerOpen) {
      this._closeDrawer();
    } else {
      this._openDrawer();
    }
  }

  _openDrawer() {
    this.isDrawerOpen = true;
    this.navigationDrawer.classList.add('open');
    this.overlay.classList.add('active');
    
    this.drawerButton.setAttribute('aria-expanded', 'true');
    this.drawerButton.setAttribute('aria-label', 'Tutup menu navigasi');
    this.overlay.setAttribute('aria-hidden', 'false');

    const firstLink = this.navigationDrawer.querySelector('a');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }

    if (window.innerWidth < 900) {
      document.body.style.overflow = 'hidden';
    }
  }

  _closeDrawer() {
    this.isDrawerOpen = false;
    this.navigationDrawer.classList.remove('open');
    this.overlay.classList.remove('active');
    
    this.drawerButton.setAttribute('aria-expanded', 'false');
    this.drawerButton.setAttribute('aria-label', 'Buka menu navigasi');
    this.overlay.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
  }

  _setupLogout(logoutBtn) {
    const handleLogout = (event) => {
      event.preventDefault();

      const confirmed = confirm('Apakah Anda yakin ingin keluar?');
      if (!confirmed) return;

      localStorage.removeItem('token');
      
      this._announceToScreenReader('Anda telah berhasil logout');

      window.location.hash = '#/login';
      window.location.reload();
    };

    logoutBtn.addEventListener('click', handleLogout);
    
    logoutBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleLogout(e);
      }
    });
  }

  _highlightActiveLink() {
    const currentHash = window.location.hash || '#/';
    const navLinks = this.navigationDrawer.querySelectorAll('a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      if (href === currentHash) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
  
  _announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    announcement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}