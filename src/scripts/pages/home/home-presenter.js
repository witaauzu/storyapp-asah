import Api from '../../data/api.js';

const HomePresenter = {
  async getStories(token) {
    try {
      const data = await Api.getAllStories(token);
     
      return { success: true, data: data.listStory || [] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

export default HomePresenter;