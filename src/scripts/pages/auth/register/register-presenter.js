export default class RegisterPresenter {
  static async register(name, email, password) {
    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      return {
        success: true,
        message: 'Pendaftaran berhasil! Silakan login.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat mendaftar',
      };
    }
  }
}
