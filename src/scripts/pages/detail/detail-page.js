import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Database from '../../data/database';
import { parseActivePathname } from '../../routes/url-parser';
import Api from '../../data/api.js';
import DetailPresenter from './detail-presenter.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

export default class DetailPage {
  constructor() {
    this.dbModel = Database;
    this.presenter = null;
    this.storyData = null;
  }

  async render() {
    return `
      <section class="detail-page container">
        <div class="detail-card" id="detailContainer"></div>
        <div id="save-actions-container"></div>
        <div class="detail-map" id="map"></div>
        <a href="#/" class="detail-back-btn">⬅ Kembali ke Beranda</a>
      </section>
    `;
  }

  async afterRender() {
    const container = document.querySelector('#detailContainer');
    const mapContainer = document.querySelector('#map');
    const token = localStorage.getItem('token') || '';
    const { id } = parseActivePathname();

    this.presenter = new DetailPresenter(id, {
      view: this,
      apiModel: Api,
      dbModel: this.dbModel,
    });

    try {
      const story = await this.presenter.getStoryDetail(token);
      this.storyData = story;

      container.innerHTML = `
        <h1 class="detail-title">${story.name || 'Tanpa Judul'}</h1>
        <img src="${story.photoUrl || './assets/no-image.jpg'}" alt="${story.description || ''}" class="detail-image" />
        <div class="detail-text">
          <div class="detail-item">
            <h2>Deskripsi:</h2>
            <p>${story.description || 'Tidak ada deskripsi.'}</p>
          </div>
          <div class="detail-item">
            <h2>Lokasi:</h2>
            <p>${
              story.lat && story.lon
                ? `Latitude: ${story.lat.toFixed(5)}, Longitude: ${story.lon.toFixed(5)}`
                : 'Lokasi tidak tersedia'
            }</p>
          </div>
        </div>
      `;

      this.renderMap(story.lat, story.lon, story.name, story.description);
      await this.renderSaveButton();
    } catch (error) {
      container.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${error.message}</p>`;
      mapContainer.innerHTML = '';
    }
  }

  renderMap(lat, lon, name, description) {
    const mapContainer = document.getElementById('map');
    if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
      const map = L.map('map').setView([lat, lon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<b>${name || 'Cerita'}</b><br>${description || ''}`)
        .openPopup();
    } else {
      mapContainer.innerHTML = `<p class="map-placeholder">Lokasi tidak tersedia untuk cerita ini.</p>`;
    }
  }

  async renderSaveButton() {
    const saved = await this.presenter.isStorySaved();
    const container = document.getElementById('save-actions-container');

    if (saved) {
      container.innerHTML = `<button id="remove-bookmark-btn">Hapus dari Bookmark</button>`;
      document.getElementById('remove-bookmark-btn').addEventListener('click', async () => {
        await this.presenter.removeStory();
        this.renderSaveButton();
      });
    } else {
      container.innerHTML = `<button id="save-bookmark-btn">Simpan ke Bookmark</button>`;
      document.getElementById('save-bookmark-btn').addEventListener('click', async () => {
        await this.presenter.saveStory();
        this.renderSaveButton();
      });
    }
  }

  notifySave(message) {
    alert(message);
  }

  notifyRemove(message) {
    alert(message);
  }
}
