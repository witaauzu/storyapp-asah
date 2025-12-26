import RegisterPresenter from './register-presenter.js';
import { showLoader, hideLoader } from '../../../templates.js';

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h1>Daftar Akun Baru</h1>
        <form id="registerForm" class="auth-form">
          <div class="form-group">
            <label for="name">Nama:</label>
            <input 
              type="text" 
              id="name" 
              placeholder="Masukkan nama lengkap" 
              autocomplete="name" 
              required />
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Masukkan email" 
              autocomplete="email" 
              required />
          </div>

          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Masukkan password minimal 6 karakter" 
              minlength="6"
              autocomplete="new-password" 
              required />
          </div>

          <button type="submit" id="registerBtn" class="btn-primary">
            Daftar
          </button>
        </form>

        <p id="message" class="form-message"></p>

        <p class="auth-switch">
          Sudah punya akun? <a href="#/login">Login di sini</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#registerForm');
    const messageEl = document.querySelector('#message');
    const button = document.querySelector('#registerBtn');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.querySelector('#name').value.trim();
      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value.trim();

      // Validasi input sederhana
      if (!name || !email || !password) {
        messageEl.textContent = 'Semua kolom wajib diisi.';
        messageEl.style.color = 'red';
        return;
      }

      if (password.length < 6) {
        messageEl.textContent = 'Password minimal 6 karakter.';
        messageEl.style.color = 'red';
        return;
      }

      showLoader();
      button.disabled = true;
      messageEl.textContent = '';

      try {
        const result = await RegisterPresenter.register(name, email, password);

        hideLoader();
        button.disabled = false;

        messageEl.textContent = result.message;
        messageEl.style.color = result.success ? 'green' : 'red';

        if (result.success) {
          setTimeout(() => {
            window.location.hash = '/login';
          }, 800);
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
