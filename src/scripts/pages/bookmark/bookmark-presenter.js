export default class BookmarkPresenter {
  #view;
  #dbModel;

  constructor({ view, dbModel }) {
    this.#view = view;
    this.#dbModel = dbModel;
  }

  async loadBookmarkedStories() {
    this.#view.showLoading();

    try {
      const stories = await this.#dbModel.getAllStories();
      
      if (stories.length === 0) {
        this.#view.showEmptyList();
      } else {
        this.#view.showStoriesList(stories);
      }
    } catch (error) {
      console.error('Error loading bookmarked stories:', error);
      this.#view.showError(error.message || 'Gagal memuat data');
    } finally {
      this.#view.hideLoading();
    }
  }

  async removeBookmark(storyId) {
    try {
      await this.#dbModel.removeStory(storyId);
      await this.loadBookmarkedStories();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      this.#view.showError('Gagal menghapus bookmark');
    }
  }
}