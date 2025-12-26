import Api from '../../data/api.js';

export default class DetailPresenter {
  #dbModel;
  #apiModel;
  #storyId;
  #storyData;
  #view;

  constructor(storyId, { view, apiModel, dbModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async getStoryDetail(token) {
    try {
      const response = await this.#apiModel.getStoryDetail(this.#storyId, token);
      this.#storyData = response.story;
      return response.story;
    } catch (error) {
      throw error;
    }
  }

  async saveStory() {
    if (!this.#storyData) throw new Error('Story data belum tersedia');
    if (!this.#storyData.id) this.#storyData.id = this.#storyId;
    await this.#dbModel.putStory(this.#storyData);
    this.#view.notifySave('Story berhasil disimpan!');
  }

  async removeStory() {
    await this.#dbModel.removeStory(this.#storyId);
    this.#view.notifyRemove('Story dihapus dari bookmark!');
  }

  async isStorySaved() {
    const story = await this.#dbModel.getStoryById(this.#storyId);
    return !!story;
  }
}