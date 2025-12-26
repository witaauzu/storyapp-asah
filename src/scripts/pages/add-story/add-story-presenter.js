import Api from '../../data/api.js';

const AddStoryPresenter = {
  async submitStory(formData, token) {
    try {
      const response = await Api.addStory(formData, token);

      if (response.error) {
        throw new Error(response.message || 'Terjadi kesalahan saat mengirim cerita.');
      }

      return {
        success: true,
        message: 'Cerita berhasil dikirim ke server!',
      };
    } catch (error) {
      console.error('Error kirim cerita:', error);
      return {
        success: false,
        message: error.message || 'Gagal mengirim cerita. Periksa koneksi atau coba lagi.',
      };
    }
  },
};

export default AddStoryPresenter;
