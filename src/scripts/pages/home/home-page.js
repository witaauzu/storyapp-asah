import HomePresenter from './home-presenter.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { showLoader, hideLoader } from '../../templates.js'; 

export default class HomePage {
  async render() {
    return `
      <main id="mainContent" class="main-content container" style="display:none;">
        <h1>Beranda</h1>
        <div id="map" style="height: 400px; margin-bottom: 20px;"></div>

        <!-- Hanya satu judul section -->
        <h2 class="section-title">Daftar Cerita</h2>

        <div id="storyList" class="story-list"></div>
      </main>
    `;
  }

  async afterRender() {
    showLoader();

    const token = localStorage.getItem('token') || '';
    const storyListEl = document.querySelector('#storyList');
    const mapContainer = document.querySelector('#map');
    mapContainer.setAttribute('role', 'region');
    mapContainer.setAttribute('aria-label', 'Peta lokasi cerita pengguna');

    setTimeout(async () => {
      if (!token) {
        hideLoader();
        document.querySelector('#mainContent').style.display = 'block';
        storyListEl.innerHTML = '<p>Silakan login untuk melihat cerita.</p>';
        mapContainer.style.display = 'none';
        return;
      }

      const result = await HomePresenter.getStories(token);

      if (!result.success) {
        hideLoader();
        document.querySelector('#mainContent').style.display = 'block';
        storyListEl.innerHTML = `<p>Error: ${result.message}</p>`;
        return;
      }

      const stories = result.data;
      if (stories.length === 0) {
        hideLoader();
        document.querySelector('#mainContent').style.display = 'block';
        storyListEl.innerHTML = '<p>Belum ada cerita.</p>';
        return;
      }

storyListEl.innerHTML = stories.map(story => {
  const createdDate = new Date(story.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
    <div class="story-card" data-lat="${story.lat}" data-lon="${story.lon}">
      <img 
        src="${story.photoUrl}" 
        alt="${story.description || 'Foto cerita tanpa deskripsi'}" 
        loading="lazy" 
      />

      <h3>${story.name}</h3>

      <p class="story-date">
        Dibuat pada: <time datetime="${story.createdAt}">${createdDate}</time>
      </p>

      <p>
        ${story.description ? story.description.slice(0, 100) : ''}
      </p>

      <a href="#/detail/${story.id}" class="detail-btn">Selengkapnya</a>
    </div>
  `;
}).join('');


      const defaultLat = -2.5489;
      const defaultLon = 118.0149;

      if (window._leafletMap) {
        window._leafletMap.remove();
      }

      const map = L.map('map').setView([defaultLat, defaultLon], 5);
      window._leafletMap = map;

      const baseLayers = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }),
        "Topo Map": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenTopoMap contributors'
        })
      };

      baseLayers.OpenStreetMap.addTo(map);
      L.control.layers(baseLayers).addTo(map);

      const markers = [];
      stories.forEach(story => {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          const marker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<strong>${story.name}</strong><br>${story.description}`);
          markers.push({ element: marker, id: story.id });
        } else {
          console.warn(`Cerita "${story.name}" tidak punya lokasi valid — dilewati.`);
        }
      });

      const cards = document.querySelectorAll('.story-card');
      cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Lihat detail cerita berjudul ${card.querySelector('h3').textContent}`);

        card.addEventListener('click', () => {
          const lat = parseFloat(card.getAttribute('data-lat'));
          const lon = parseFloat(card.getAttribute('data-lon'));
          if (!isNaN(lat) && !isNaN(lon)) {
            map.setView([lat, lon], 10);
          }
        });

        card.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') card.click();
        });
      });

      hideLoader();
      const mainContent = document.querySelector('#mainContent');
      mainContent.style.display = 'block';

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }, 500);
  }
}
