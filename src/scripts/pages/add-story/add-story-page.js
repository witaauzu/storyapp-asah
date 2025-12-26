import AddStoryPresenter from './add-story-presenter.js';
import { generateMainTemplate, showLoader, hideLoader } from '../../templates.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default class AddStoryPage {
  async render() {
    return generateMainTemplate(`
      <section class="container" aria-labelledby="addStoryHeading">
        <h1 id="addStoryHeading">Tambah Cerita</h1>

        <form id="addStoryForm" aria-describedby="formInstruction">
          <p id="formInstruction">Isi semua field berikut untuk menambahkan cerita Anda ke peta.</p>

          <div class="form-group">
            <label for="description">Deskripsi:</label>
            <textarea id="description" name="description" rows="3" placeholder="Tulis cerita kamu..." required aria-required="true"></textarea>
          </div>

          <div class="form-group photo-group">
            <button type="button" id="showCameraBtn" aria-controls="cameraContainer">Gunakan Kamera</button>
            <div id="cameraContainer" hidden aria-hidden="true">
              <video id="camera" autoplay width="300"></video>
              <button type="button" id="capturePhotoBtn">Ambil Foto</button>
            </div>

            <label for="photo">Atau Upload Foto:</label>
            <input type="file" id="photo" accept="image/*" aria-describedby="photoHelp" />
            <img id="preview" src="" alt="Pratinjau foto yang diambil" style="display:none; max-width:300px; margin-top:10px;" />
          </div>

          <div class="form-group">
            <label for="map">Pilih Lokasi Cerita:</label>
            <div id="map" style="height: 300px; margin-bottom:10px;" role="region" aria-label="Peta untuk memilih lokasi cerita"></div>
            <p id="locationMessage">Klik peta untuk menandai lokasi cerita.</p>
          </div>

          <button type="submit" id="submitBtn">Kirim Cerita</button>
        </form>

        <p id="message" aria-live="polite"></p>
      </section>
    `);
  }

  async afterRender() {
    const form = document.querySelector('#addStoryForm');
    const messageEl = document.querySelector('#message');
    const submitBtn = document.querySelector('#submitBtn');

    const photoInput = document.querySelector('#photo');
    const showCameraBtn = document.querySelector('#showCameraBtn');
    const cameraContainer = document.querySelector('#cameraContainer');
    const video = document.querySelector('#camera');
    const capturePhotoBtn = document.querySelector('#capturePhotoBtn');
    const preview = document.querySelector('#preview');

    let cameraBlob = null;
    let stream = null;
    let selectedLat = null;
    let selectedLng = null;

    //kamera
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        cameraBlob = null;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          cameraContainer.hidden = true;
          cameraContainer.setAttribute('aria-hidden', 'true');
        }
      }
    });

    showCameraBtn.addEventListener('click', async () => {
      cameraContainer.hidden = false;
      cameraContainer.setAttribute('aria-hidden', 'false');
      preview.style.display = 'none';
      photoInput.value = '';

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
      } catch (error) {
        messageEl.textContent = 'Tidak bisa mengakses kamera.';
        messageEl.style.color = 'red';
      }
    });

    capturePhotoBtn.addEventListener('click', () => {
      if (!stream) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        cameraBlob = blob;
        preview.src = URL.createObjectURL(blob);
        preview.style.display = 'block';
      }, 'image/jpeg');

      stream.getTracks().forEach(track => track.stop());
      cameraContainer.hidden = true;
      cameraContainer.setAttribute('aria-hidden', 'true');
      stream = null;
    });

    //leaflet Map
    const map = L.map('map').setView([-6.200000, 106.816666], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker = null;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 14);
          marker = L.marker([latitude, longitude]).addTo(map)
            .bindPopup('Lokasi kamu saat ini').openPopup();
          selectedLat = latitude;
          selectedLng = longitude;
          document.querySelector('#locationMessage').textContent =
            `Lokasi otomatis terdeteksi: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        },
        () => {
          document.querySelector('#locationMessage').textContent =
            'GPS gagal, pilih lokasi manual di peta.';
        }
      );
    }

    map.on('click', (e) => {
      selectedLat = e.latlng.lat;
      selectedLng = e.latlng.lng;
      if (marker) map.removeLayer(marker);
      marker = L.marker([selectedLat, selectedLng]).addTo(map);
      document.querySelector('#locationMessage').textContent =
        `Lokasi dipilih: ${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`;
    });

    //submit cerita
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const description = document.querySelector('#description').value.trim();
      const filePhoto = photoInput.files[0];

      if (!description) {
        messageEl.textContent = 'Deskripsi wajib diisi.';
        messageEl.style.color = 'red';
        return;
      }

      if (!filePhoto && !cameraBlob) {
        messageEl.textContent = 'Silakan upload atau ambil foto.';
        messageEl.style.color = 'red';
        return;
      }

      if (!selectedLat || !selectedLng) {
        messageEl.textContent = 'Silakan pilih lokasi di peta.';
        messageEl.style.color = 'red';
        return;
      }

      showLoader();
      submitBtn.disabled = true;
      messageEl.textContent = '';

      const formData = new FormData();
      formData.append('description', `${description}`);
      formData.append('lat', selectedLat);
      formData.append('lon', selectedLng);
      formData.append('photo', cameraBlob ? cameraBlob : filePhoto);

      const token = localStorage.getItem('token') || '';
      let result;

      try {
        if (token) {
          result = await AddStoryPresenter.submitStory(formData, token);
        } else {
          result = { success: true, message: 'Cerita disimpan secara lokal (mode guest).' };
        }
      } catch (error) {
        result = { success: false, message: 'Terjadi kesalahan saat mengirim cerita.' };
      }

      hideLoader();
      submitBtn.disabled = false;
      messageEl.textContent = result.message;
      messageEl.style.color = result.success ? 'green' : 'red';

      if (result.success) {
        const localStories = JSON.parse(localStorage.getItem('guestStories') || '[]');
        const newStory = {
          id: 'guest-' + Date.now(),
          name: 'Guest',
          description,
          photoUrl: cameraBlob ? URL.createObjectURL(cameraBlob) : URL.createObjectURL(filePhoto),
          lat: selectedLat,
          lon: selectedLng,
        };
        localStories.unshift(newStory);
        localStorage.setItem('guestStories', JSON.stringify(localStories));

        form.reset();
        preview.src = '';
        preview.style.display = 'none';
        if (marker) map.removeLayer(marker);
        document.querySelector('#locationMessage').textContent = 'Klik peta untuk menandai lokasi cerita.';
      }
    });
  }
}
