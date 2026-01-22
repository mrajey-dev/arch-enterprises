<template>
  <div class="layout">
    <!-- Header -->
     <header class="header">
    <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;  border-radius: 9px;"
          alt="Logo"
        />
         </a>
         Arch 360
     
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="announcement-board" v-if="!isMobile || !isSidebarVisible">
        <h2> Daily Small Improvement (DSI)</h2>
<div class="dsi-header-actions">
<button
  type="button"
  class="view-all-btn"
  @click="openAllDsiPopup"
>
 View All DSI
</button>

</div>


<!-- SINGLE ROW INPUT -->
<div class="dsi-row">
  <textarea
    v-model="newDSI.problem"
    placeholder="Problem Statement"
    rows="2"
    class="dsi-textarea"
  ></textarea>

  <textarea
    v-model="newDSI.solution"
    placeholder="Solution"
    rows="2"
    class="dsi-textarea"
  ></textarea>

  <textarea
    v-model="newDSI.result"
    placeholder="Result / Outcome"
    rows="2"
    class="dsi-textarea"
  ></textarea>

  <!-- IMAGE UPLOAD ROW -->
<div class="image-upload-row">

  <!-- BEFORE IMAGE -->
  <label class="image-upload-card">
    <input
      type="file"
      accept="image/*"
      @change="onImageChange($event, 'before')"
      hidden
    />

    <div v-if="!newDSI.beforeImage" class="upload-placeholder">
      📷
      <span>Before Image</span>
    </div>

    <img
      v-else
      :src="newDSI.beforeImage"
      class="upload-preview"
    />
  </label>

  <!-- AFTER IMAGE -->
  <label class="image-upload-card">
    <input
      type="file"
      accept="image/*"
      @change="onImageChange($event, 'after')"
      hidden
    />

    <div v-if="!newDSI.afterImage" class="upload-placeholder">
      🛠️
      <span>After Image</span>
    </div>

    <img
      v-else
      :src="newDSI.afterImage"
      class="upload-preview"
    />
  </label>

</div>


<button
  class="add-btn"
  @click="addDSI"
  :disabled="isSubmitting"
>
  <span v-if="!isSubmitting">➕ Add</span>
  <span v-else class="loader"></span>
</button>

</div>


<div class="dsi-table-wrapper">
  <table class="dsi-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Problem</th>
        <th>Solution</th>
        <th>Result</th>
        <th>Before</th>
        <th>After</th>
        <th>Date</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(item, index) in dsiList" :key="index">
        <td class="sr">{{ index + 1 }}</td>
      <td data-label="Problem">{{ item.problem }}</td>
<td data-label="Solution">{{ item.solution }}</td>
<td data-label="Result">{{ item.result }}</td>

        <td class="img-cell">
          <img
            v-if="item.beforeImage"
            :src="item.beforeImage"
            class="dsi-thumb"
            @click="openImage(item.beforeImage)"
          />
        </td>

        <td class="img-cell">
          <img
            v-if="item.afterImage"
            :src="item.afterImage"
            class="dsi-thumb"
            @click="openImage(item.afterImage)"
          />
        </td>

     <td  data-label="Date" class="date-cell">
  {{ formatDate(item.date) }}
</td>


      <td  data-label="Status">
  <span
    class="status-pill"
    :class="{
      waiting: item.status === 'Waiting',
      approved: item.status === 'Approved',
      rejected: item.status === 'Rejected',

    }"
  >
  {{ capitalizeFirstLetter(item.status) }}

  </span>
</td>



        <td>
          <button
  class="delete-btn"
  @click="deleteDSI(item.id, index)"
>
  🗑️
</button>

        </td>
      </tr>

      <tr v-if="!dsiList.length">
        <td colspan="9" class="no-data">
          No DSI submitted yet
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ALL DSI POPUP -->
<div v-if="showAllDsiPopup" class="dsi-popup-backdrop">
  <div class="dsi-popup">

    <!-- HEADER -->
    <div class="dsi-popup-header">
      <h3>📋 All Daily Small Improvements</h3>
      <button class="close-btn" @click="closeAllDsiPopup">✖</button>
    </div>

    <!-- TABLE -->
    <div class="dsi-popup-body">
      <table class="dsi-table">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Problem</th>
            <th>Solution</th>
            <th>Result</th>
            <th>Before</th>
            <th>After</th>
            <th>Date</th>
            <th>Status</th>

          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, i) in dsiList" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ item.user }}</td>
            <td>{{ item.problem }}</td>
            <td>{{ item.solution }}</td>
            <td>{{ item.result }}</td>

            <td  data-label="Before" class="img-cell">
              <img
                v-if="item.beforeImage"
                :src="item.beforeImage"
                class="dsi-thumb"
                @click="openImage(item.beforeImage)"
              />
            </td>

            <td  data-label="After" class="img-cell">
              <img
                v-if="item.afterImage"
                :src="item.afterImage"
                class="dsi-thumb"
                @click="openImage(item.afterImage)"
              />
            </td>

            <td class="date-cell">
  {{ formatDate(item.date) }}
</td>

             <td>
  <span
    class="status-pill"
    :class="{
      waiting: item.status === 'Waiting',
      approved: item.status === 'Approved',
      rejected: item.status === 'Rejected',

    }"
  >
  {{ capitalizeFirstLetter(item.status) }}

  </span>
  </td>
          </tr>

          <tr v-if="!dsiList.length">
            <td colspan="8" class="no-data">No DSI Found</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>


<!-- IMAGE MODAL -->
<div v-if="previewImage" class="image-backdrop" @click="previewImage = null">
  <div class="image-modal">
    <img :src="previewImage" />
  </div>
</div>

</div>


      
      </div>
    </div>
 
</template>


<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'

export default {
  name: "ViewDsi",
  components: {
    Sidebar
  },
  data() {
    return {
      isSubmitting: false,
         showAllDsiPopup: false,
      username: '',
      isMobile: false,
      isSidebarVisible: true,
     // DSI
   newDSI: {
      problem: "",
      solution: "",
      result: "",
       beforeImage: null,
  afterImage: null,
     beforeImageFile: null, // for upload
  afterImageFile: null,  // for upload

    },
    dsiList: [],
    previewImage: null,

    }
  },
  mounted() {
  this.checkIfMobile()
  window.addEventListener('resize', this.checkIfMobile)
  this.loadDSIs()        // <-- load DSIs from backend
},
  methods: {
     formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB')
  },
    capitalizeFirstLetter(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },
    async deleteDSI(id, index) {
  if (!confirm('Are you sure you want to delete this DSI?')) return;

  try {
    await axios.delete(`/api/dsis/${id}`);

    // Remove from list (reactive)
    this.dsiList.splice(index, 1);

    alert('DSI deleted successfully');
  } catch (error) {
    console.error(error);
    alert('Failed to delete DSI');
  }
},
    async openAllDsiPopup() {
    this.showAllDsiPopup = true;
    await this.fetchAllDSI();
  },

  async fetchAllDSI() {
    try {
      const res = await axios.get('/api/dsis/all');
      this.dsiList = res.data;
    } catch (e) {
      alert('Failed to load DSI');
    }
  },

  closeAllDsiPopup() {
    this.showAllDsiPopup = false;
    setTimeout(() => {
  window.location.reload();
}, 10); // 1000 ms = 1 second

  },
async loadDSIs() {
  try {
    const res = await axios.get('/api/dsis');

    this.dsiList = res.data.map(dsi => {
      const fixUrl = (url) =>
        url ? url.replace('/api/backend', '/backend') : null;

      return {
        id: dsi.id,
        problem: dsi.problem,
        solution: dsi.solution,
        result: dsi.result,
        beforeImage: fixUrl(dsi.before_image),
        afterImage: fixUrl(dsi.after_image),
        date: dsi.created_at,
        status: dsi.status || 'Waiting'
      };
    });
  } catch (error) {
    console.error('Failed to load DSIs:', error);
  }
},



async addDSI() {
  if (this.isSubmitting) return   // 🚫 prevent double click

  this.isSubmitting = true        // 🔄 start loader

  try {
    const formData = new FormData()
    formData.append('problem', this.newDSI.problem)
    formData.append('solution', this.newDSI.solution)
    formData.append('result', this.newDSI.result)

    if (this.newDSI.beforeImageFile) {
      formData.append('before_image', this.newDSI.beforeImageFile)
    }
    if (this.newDSI.afterImageFile) {
      formData.append('after_image', this.newDSI.afterImageFile)
    }

    const res = await axios.post('/api/dsis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    // 🔥 FIX URL HERE
    const fixUrl = (url) =>
      url ? url.replace('/api/backend', '/backend') : null

    const newDsi = {
      id: res.data.dsi.id,
      problem: res.data.dsi.problem,
      solution: res.data.dsi.solution,
      result: res.data.dsi.result,
      beforeImage: fixUrl(res.data.dsi.before_image),
      afterImage: fixUrl(res.data.dsi.after_image),
      date: res.data.dsi.created_at,
      status: res.data.dsi.status || 'Waiting'
    }

    this.dsiList.unshift(newDsi)

    // Reset form
    this.newDSI = {
      problem: '',
      solution: '',
      result: '',
      beforeImage: null,
      afterImage: null,
      beforeImageFile: null,
      afterImageFile: null
    }

    alert('DSI added successfully!')
  } catch (error) {
    console.error(error)
    alert('All Fields Required.')
  } finally {
    this.isSubmitting = false     // ✅ stop loader (always)
  }
},





  onImageChange(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === 'before') {
        this.newDSI.beforeImage = event.target.result; // preview
        this.newDSI.beforeImageFile = file; // for formData
      } else {
        this.newDSI.afterImage = event.target.result;
        this.newDSI.afterImageFile = file;
      }
    };
    reader.readAsDataURL(file);
  },
openImage(img) {
  this.previewImage = img;
},

   
  removeDSI(index) {
    this.dsiList.splice(index, 1)
  },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },



  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.head-title{
      color: white;
    display: flex;
    gap: 7px;
    text-decoration: none;
font-family: cursive;
    align-items: center; width: 100%;
}
@media (max-width: 768px) {
.head-title{
      color: white;
    display: flex;
    gap: 7px;
    display: none;
    text-decoration: none;
    align-items: center; width: 100%;
}
}
.loader {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-upload-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.image-upload-card {
  width: 131px;
    height: 47px;
  border: 2px dashed #9ca3af;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.image-upload-card:hover {
  border-color: var(--primary);
  background: #eef6f6;
  transform: translateY(-2px);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  color: #6b7280;
  gap: 4px;
}

.upload-placeholder span {
  font-size: 12px;
  font-weight: 600;
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.dsi-thumb {
  width: 45px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #ccc;
}

.image-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.image-modal img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
  background: #fff;
  padding: 10px;
}

.status-btn {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #facc15;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  cursor: not-allowed;
  white-space: nowrap;
}

.dsi-section {
  margin-top: 25px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.dsi-input {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.dsi-input input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.dsi-input button {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

.dsi-list {
  list-style: none;
  padding: 0;
}

.dsi-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
}

.dsi-list small {
  color: #6b7280;
  margin-left: 10px;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }
.main-content {
  align-self: center;
  width: 100%;
        background-color: #f6f7fb;

}
  .sidebar {
    position: absolute;
    z-index: 1000;
    width: 240px;
    height: 100vh;
    background-color: var(--text);
  }

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
}


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header h3 {
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

.card-header .date {
  font-size: 13px;
  color: #888;
}

.card-message {
  font-size: 15px;
  color: var(--text);
  margin-top: 5px;
  line-height: 1.5;
}
.password-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-wrapper input {
  flex: 1;
}

.toggle-btn,
.generate-btn {
  padding: 6px 10px;
  background-color: var(--primary);
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.toggle-btn i {
  pointer-events: none;
}

.toggle-btn:hover,
.generate-btn:hover {
  background-color: var(--text);
}

.user-table td .btn-group {
  display: flex;
  gap: 0.5rem;
}
/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

/* Header */
.header {
  font-size: 17px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: var(--primary); 
  color: white;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
}

.menu-btn, .logout-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-btn {
  background-color: #28a745;
  color: white;
  margin-right: 15px;
}

.menu-btn:hover {
  background-color: #218838;
}

.logout-btn {
  background-color: white;
  color: #003977;
  border: 2px solid #007bff;
}

.logout-btn:hover {
  background-color: #e7f1ff;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  background-color: #ffffff;
  width: 220px;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  font-weight: 600;
  color: var(--text);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 14px 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar li:hover {
  background-color: var(--primary);
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
  background-color: white;
  padding: 30px 40px;
  border-radius: 15px;
  box-shadow: 0 5px 30px rgba(0,0,0,0.08);
  overflow-x: auto;
}

h2 {
      text-transform: uppercase;
  margin-bottom: 30px;
  color: var(--text);
  font-weight: 800;
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}


/* Footer */
.footer {
  background-color: #343a40;
  color: white;
  text-align: center;
  padding: 15px 0;
  font-size: 14px;
  font-weight: 500;
  margin-top: auto;
  letter-spacing: 0.6px;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 97vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 15px;
}

/* Modal Card */
.modal-card {
  background-color: white;
  width: 100%;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  max-height: 86vh;
  overflow-y: auto;
  animation: slideDown 0.4s ease forwards;
  position: relative;

  /* Hide scrollbar but allow scroll */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.modal-card::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}


@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Title */
.modal-title {
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 35px;
  color: var(--text);
  letter-spacing: 1.3px;
}

/* Form Layout */
.attractive-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Form Rows */
.form-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.form-row .input-group {
  flex: 1 1 48%;
  display: flex;
  flex-direction: column;
}

/* Full width input group */
.input-group.full-width {
  flex: 1 1 100%;
}

/* Input Group */
.input-group label {
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 14px 18px;
  border: 2px solid #ced4da;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  background-color: #f9fbff;
}

/* Textarea resize */
.input-group textarea {
  resize: vertical;
  min-height: 56px;
  font-family: inherit;
}

/* Modal Buttons */
.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}



/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .form-row .input-group {
    flex: 1 1 100%;
  }

  .modal-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: row;
    gap: 10px;
    font-size: 17px;
  }
  .menu-btn, .logout-btn {
    width: 100%;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 35px;
}
@media (max-width: 768px) {
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 35px;
  margin-bottom: 6px;
      height: 52px;
}
}

.logo-img {
  height: 45px;
}

.header-title {
  flex: 1;
  text-align: center;
  color: white;
  margin: 0;
  font-size: 1.3rem;
}

.mobile-menu-icon {
  font-size: 22px;
  color: white;
  cursor: pointer;
}

.dsi-input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.dsi-input-grid textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  resize: none;
}

.add-btn {
  background: #92bbbf;
  color: white;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.dsi-item p {
  margin: 4px 0;
}


.dsi-btn-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.status-btn {
  background: #e5e7eb;
  color: var(--text);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px dashed #9ca3af;
  cursor: not-allowed;
  font-weight: 500;
}



.add-btn:hover {
  background: #6b969a;
}
@media (max-width: 480px) {
  .dsi-btn-row {
    flex-direction: column;
    align-items: stretch;
  }
}
.dsi-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.dsi-textarea {
  flex: 1;
  min-width: 200px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  resize: none;
}

.dsi-btn-row {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.status-btn {
  background: #e5e7eb;
  color: var(--text);
  border: 1px dashed #9ca3af;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .dsi-row {
    flex-direction: column;
    align-items: stretch;
  }

  .dsi-btn-row {
    justify-content: flex-end;
  }
}


.dsi-table-wrapper {
  margin-top: 20px;
  overflow-x: auto;
}

.dsi-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.dsi-table th,
.dsi-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: top;
}

.dsi-table th {
  background: #f3f4f6;
  font-weight: 600;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 15px;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}
.dsi-table-wrapper {
  margin-top: 25px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  overflow-x: auto;
}

.dsi-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 900px;
}

/* Header */
.dsi-table thead th {
  border-left: 1px ridge var(--primary);
  background: linear-gradient(135deg, var(--primary), var(--primary));
  color: white;
  font-weight: 700;
  padding: 14px;
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 1;
}

/* Body rows */
.dsi-table tbody tr {
  transition: all 0.25s ease;
}

.dsi-table tbody tr:nth-child(even) {
  background: #f8fafc;
}

.dsi-table tbody tr:hover {
  background: #eef6f6;
  transform: scale(1.005);
}

/* Cells */
.dsi-table td {
  padding: 12px 14px;
  font-size: 14px;
  color: var(--text);
      border-left: 1px ridge #6cc4c7;
  border-bottom: 1px solid #6cc4c7;
  vertical-align: middle;
}

/* Serial */
.sr {
  font-weight: 700;
  color: #2563eb;
}

/* Image cell */
.img-cell {
  text-align: center;
}

/* Thumbnail */
.dsi-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dsi-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 15px rgba(0,0,0,0.25);
}

/* Date */
.date-cell {
  white-space: nowrap;
  font-size: 13px;
  color: #6b7280;
}

/* Status pill */
.status-pill {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-pill.waiting {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

/* Delete */
.delete-btn {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.2);
}
@media (max-width: 768px) {
  .dsi-table {
    min-width: 1000px;
  }
}

.dsi-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.view-all-btn {
  background: linear-gradient(135deg, var(--primary), #3c6769);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
  transition: all 0.35s ease;
}

.view-all-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 28px rgba(79, 70, 229, 0.55);
 background: linear-gradient(135deg, #3c6769, var(--primary));
}

.view-all-btn:active {
  transform: scale(0.96);
}

.dsi-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dsi-popup {
  width: 95%;
  height: 90%;
  background: #fff;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.dsi-popup-header {
  padding: 16px 22px;
  background: linear-gradient(135deg, #5f9e9f, #02032f);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 18px;
  padding: 6px 10px;
  border-radius: 50%;
  cursor: pointer;
}

.dsi-popup-body {
  padding: 16px;
  overflow-y: auto;
}

.status-pill {
display: inline-block;
    padding: 6px 14px;
    border-radius: 9px;
    font-size: .9rem;
    font-weight: 600;
    background-color: #d6d6d4;
    /* color: #fff; */
    text-align: center;
    transition: all .3s ease;
    /* box-shadow: 0 2px 6px var(--text)26; */
      cursor: not-allowed;
}

.status-pill.waiting {
  background: linear-gradient(45deg, #f9a825, #ffb74d);
}

.status-pill.approved {
  background: linear-gradient(45deg, #43a047, #66bb6a);
}

.status-pill.rejected {
  background: linear-gradient(45deg, #e53935, #ef5350);
}

.status-pill.inprogress {
  background: linear-gradient(45deg, #1e88e5, #42a5f5);
}

.status-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
  min-width: 90px;
  text-align: center;
}

/* Waiting */
.status-pill.waiting {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

/* Approved */
.status-pill.approved {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

/* Rejected */
.status-pill.rejected {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
/* ===============================
   MOBILE RESPONSIVE (<=768px)
================================ */
@media (max-width: 768px) {
.view-all-btn{
  display: none!important;
}
  /* INPUT ROW */
  .dsi-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.main-content{
  justify-content: center!important;
}
h2{
  font-size: 15px!important;
}
  .dsi-textarea {
    width: 100%;
    font-size: 14px;
  }

  /* IMAGE UPLOAD */
  .image-upload-row {
    display: flex;
    gap: 10px;
  }

  .image-upload-card {
    width: 50%;
    height: 120px;
  }

  .upload-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* ADD BUTTON */
  .add-btn {
    width: 100%;
    padding: 12px;
    font-size: 16px;
  }

  /* ===============================
     TABLE → CARD VIEW
  ================================ */

  .dsi-table,
  .dsi-table thead {
    display: none;
  }

  .dsi-table-wrapper tbody,
  .dsi-table-wrapper tr {
    display: block;
    width: 100%;
  }

  .dsi-table-wrapper tr {
    background: #fff;
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .dsi-table-wrapper td {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 14px;
  }

  .dsi-table-wrapper td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text);
  }

  .img-cell img {
    width: 70px;
    height: 70px;
    border-radius: 8px;
  }

  /* STATUS */
  .status-pill {
    padding: 5px 12px;
    font-size: 12px;
  }

  /* DELETE BUTTON */
  .delete-btn {
    font-size: 18px;
  }

  /* ===============================
     POPUP FULL SCREEN
  ================================ */

  .dsi-popup {
    width: 95%;
    height: 95%;
    border-radius: 12px;
  }

  .dsi-popup-body {
    overflow-y: auto;
  }
}


</style>
