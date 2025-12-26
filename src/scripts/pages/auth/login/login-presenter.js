export default class LoginPresenter {
  static async login(email, password) {
    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      return {
        success: true,
        message: 'Login berhasil!',
        token: result.loginResult.token,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat login',
      };
    }
  }
}
