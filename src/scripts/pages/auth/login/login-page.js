import LoginPresenter from './login-presenter.js';
import Navbar from '../../../components/navbar.js';
import { showLoader, hideLoader } from '../../../templates.js';

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <h1>Login</h1>
        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Masukkan email" 
              autocomplete="username" 
              required />
          </div>

          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Masukkan password" 
              autocomplete="current-password" 
              required />
          </div>

          <button type="submit" id="loginBtn" class="btn-primary">
            Masuk
          </button>
        </form>

        <p id="message" class="form-message"></p>

        <p class="auth-switch">
          Belum punya akun? <a href="#/register">Daftar di sini</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#loginForm');
    const messageEl = document.querySelector('#message');
    const button = document.querySelector('#loginBtn');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value.trim();

      if (!email || !password) {
        messageEl.textContent = 'Email dan password wajib diisi.';
        messageEl.style.color = 'red';
        return;
      }

      showLoader();
      button.disabled = true;
      messageEl.textContent = '';

      try {
        const result = await LoginPresenter.login(email, password);

        hideLoader();
        button.disabled = false;

        messageEl.textContent = result.message;
        messageEl.style.color = result.success ? 'green' : 'red';

        if (result.success) {
          localStorage.setItem('token', result.token);

          const header = document.querySelector('#app-header');
          const navbar = new Navbar({ navigationDrawer: null });
          header.innerHTML = navbar.render();
          navbar.afterRender();

          setTimeout(() => {
            window.location.hash = '/';
          }, 600);
        }
      } catch (err) {
        hideLoader(); 
        button.disabled = false;
        messageEl.textContent = `Terjadi kesalahan: ${err.message}`;
        messageEl.style.color = 'red';
      }
    });
  }
}
