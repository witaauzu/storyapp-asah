import BookmarkPresenter from './bookmark-presenter.js';
import Database from '../../data/database.js';

export default class BookmarkPage {
  constructor() {
    this.presenter = new BookmarkPresenter({
      dbModel: Database,
      view: this,
    });
  }

  async render() {
    return `
      <main id="mainContent" class="main-content container">
        <h1>Bookmark Story</h1>
        <h2 class="section-title">Daftar Bookmark</h2>
        <div id="stories-list-loading"></div>
        <div id="stories-list" class="story-list"></div>
      </main>
    `;
  }

  async afterRender() {
    await this.presenter.loadBookmarkedStories();
  }

  showLoading() {
    document.getElementById('stories-list-loading').innerHTML = `<p>Loading...</p>`;
  }

  hideLoading() {
    document.getElementById('stories-list-loading').innerHTML = '';
  }

  showStoriesList(stories) {
    const html = stories.map(story => {
      const createdDate = new Date(story.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      return `
        <div class="story-card" data-lat="${story.lat}" data-lon="${story.lon}">
          <img 
            src="${story.photoUrl || './assets/no-image.jpg'}"
            alt="${story.description || 'Foto cerita tanpa deskripsi'}"
            loading="lazy"
          />

          <h3>${story.name}</h3>

          <p class="story-date">
            Dibuat pada:
            <time datetime="${story.createdAt}">
              ${createdDate}
            </time>
          </p>

          <p>
            ${story.description ? story.description.slice(0, 100) : ''}
          </p>

          <div class="story-actions">
            <a href="#/detail/${story.id}" class="detail-btn">Selengkapnya</a>
            <button 
              data-id="${story.id}" 
              class="remove-bookmark-btn"
            >
              Hapus Bookmark
            </button>
          </div>
        </div>
      `;
    }).join('');

    const listEl = document.getElementById('stories-list');
    listEl.innerHTML = html;

    // event hapus bookmark
    document.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await Database.removeStory(id);
        await this.presenter.loadBookmarkedStories();
      });
    });
  }

  showEmptyList() {
    document.getElementById('stories-list').innerHTML =
      `<p>Belum ada cerita yang di-bookmark.</p>`;
  }

  showError(message) {
    document.getElementById('stories-list').innerHTML =
      `<p style="color:red;">Error: ${message}</p>`;
  }
}
