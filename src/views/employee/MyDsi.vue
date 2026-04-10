<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="dsi-board-premium" v-if="!isMobile || !isSidebarVisible">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div>
              <h1>Daily Small Improvement</h1>
              <p class="subtitle-modern">Track and share your improvement ideas</p>
            </div>
          </div>
          <button class="view-all-btn-premium" @click="openAllDsiPopup">
            <i class="fas fa-eye"></i> View All DSI
          </button>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-lightbulb"></i>
            <div class="stat-info">
              <span class="stat-value">{{ dsiList.length }}</span>
              <span class="stat-label">Total Improvements</span>
            </div>
          </div>
          <div class="stat-card approved">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ approvedCount }}</span>
              <span class="stat-label">Approved</span>
            </div>
          </div>
          <div class="stat-card pending">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
        </div>

        <!-- Add DSI Form -->
        <div class="form-card-premium">
          <div class="section-title-modern">
            <i class="fas fa-plus-circle"></i>
            <span>Add New Improvement</span>
          </div>

          <div class="dsi-form-grid">
            <div class="form-field">
              <label><i class="fas fa-exclamation-triangle"></i> Problem Statement</label>
              <textarea v-model="newDSI.problem" rows="2" placeholder="Describe the problem..." class="dsi-textarea-premium"></textarea>
            </div>

            <div class="form-field">
              <label><i class="fas fa-lightbulb"></i> Solution</label>
              <textarea v-model="newDSI.solution" rows="2" placeholder="Describe your solution..." class="dsi-textarea-premium"></textarea>
            </div>

            <div class="form-field">
              <label><i class="fas fa-chart-line"></i> Result / Outcome</label>
              <textarea v-model="newDSI.result" rows="2" placeholder="Describe the expected outcome..." class="dsi-textarea-premium"></textarea>
            </div>

            <div class="form-field image-upload-section">
              <label><i class="fas fa-camera"></i> Before & After Images</label>
              <div class="image-upload-row-premium">
                <label class="image-upload-card-premium">
                  <input type="file" accept="image/*" @change="onImageChange($event, 'before')" hidden />
                  <div v-if="!newDSI.beforeImage" class="upload-placeholder-premium">
                    <i class="fas fa-image"></i>
                    <span>Before</span>
                  </div>
                  <img v-else :src="newDSI.beforeImage" class="upload-preview-premium" />
                </label>

                <label class="image-upload-card-premium">
                  <input type="file" accept="image/*" @change="onImageChange($event, 'after')" hidden />
                  <div v-if="!newDSI.afterImage" class="upload-placeholder-premium">
                    <i class="fas fa-check-circle"></i>
                    <span>After</span>
                  </div>
                  <img v-else :src="newDSI.afterImage" class="upload-preview-premium" />
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-submit-premium" @click="addDSI" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin"></i> Submitting...
              </span>
              <span v-else>
                <i class="fas fa-plus-circle"></i> Add Improvement
              </span>
            </button>
          </div>
        </div>

        <!-- DSI Table -->
        <div class="table-card-premium">
          <div class="table-header-premium">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>My Improvements</span>
            </div>
            <div class="table-info">
              <i class="fas fa-file-alt"></i>
              <span>{{ dsiList.length }} records</span>
            </div>
          </div>

          <div class="table-wrapper-premium">
            <table class="dsi-table-premium">
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
                <tr v-for="(item, index) in dsiList" :key="item.id" class="dsi-row-premium">
                  <td class="serial">{{ index + 1 }}</td>
                  <td class="problem-cell" :title="item.problem">{{ truncateText(item.problem, 50) }}</td>
                  <td class="solution-cell" :title="item.solution">{{ truncateText(item.solution, 50) }}</td>
                  <td class="result-cell" :title="item.result">{{ truncateText(item.result, 50) }}</td>
                  <td class="image-cell">
                    <img v-if="item.beforeImage" :src="item.beforeImage" class="dsi-thumb-premium" @click="openImage(item.beforeImage)" />
                    <span v-else class="no-image">—</span>
                  </td>
                  <td class="image-cell">
                    <img v-if="item.afterImage" :src="item.afterImage" class="dsi-thumb-premium" @click="openImage(item.afterImage)" />
                    <span v-else class="no-image">—</span>
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i> {{ formatDate(item.date) }}
                  </td>
                  <td class="status-cell">
                    <span :class="['status-badge-premium', getStatusClass(item.status)]">
                      <i :class="getStatusIcon(item.status)"></i>
                      {{ capitalizeFirstLetter(item.status) }}
                    </span>
                  </td>
                  <td class="action-cell">
                    <button class="action-icon delete" @click="deleteDSI(item.id, index)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="dsiList.length === 0" class="empty-row">
                  <td colspan="9">
                    <div class="empty-state-premium">
                      <i class="fas fa-lightbulb"></i>
                      <h4>No Improvements Yet</h4>
                      <p>Submit your first DSI using the form above</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- All DSI Popup Modal -->
    <div v-if="showAllDsiPopup" class="modal-premium" @click.self="closeAllDsiPopup">
      <div class="modal-premium-container xlarge">
        <div class="modal-premium-header">
          <div class="modal-icon">
            <i class="fas fa-list-alt"></i>
          </div>
          <h2>All Daily Small Improvements</h2>
          <button class="modal-close" @click="closeAllDsiPopup">×</button>
        </div>
        <div class="modal-premium-body">
          <div class="table-wrapper-premium">
            <table class="dsi-table-premium">
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
                <tr v-for="(item, i) in dsiList" :key="i" class="dsi-row-premium">
                  <td class="serial">{{ i + 1 }}</td>
                  <td class="user-cell">{{ item.user || 'Me' }}</td>
                  <td class="problem-cell" :title="item.problem">{{ truncateText(item.problem, 40) }}</td>
                  <td class="solution-cell" :title="item.solution">{{ truncateText(item.solution, 40) }}</td>
                  <td class="result-cell" :title="item.result">{{ truncateText(item.result, 40) }}</td>
                  <td class="image-cell">
                    <img v-if="item.beforeImage" :src="item.beforeImage" class="dsi-thumb-premium" @click="openImage(item.beforeImage)" />
                    <span v-else class="no-image">—</span>
                  </td>
                  <td class="image-cell">
                    <img v-if="item.afterImage" :src="item.afterImage" class="dsi-thumb-premium" @click="openImage(item.afterImage)" />
                    <span v-else class="no-image">—</span>
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i> {{ formatDate(item.date) }}
                  </td>
                  <td class="status-cell">
                    <span :class="['status-badge-premium', getStatusClass(item.status)]">
                      <i :class="getStatusIcon(item.status)"></i>
                      {{ capitalizeFirstLetter(item.status) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="dsiList.length === 0" class="empty-row">
                  <td colspan="9">
                    <div class="empty-state-premium">
                      <i class="fas fa-inbox"></i>
                      <p>No DSI records found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-premium-footer">
          <button class="btn-primary-modern" @click="closeAllDsiPopup">
            <i class="fas fa-check"></i> Close
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="previewImage" class="modal-premium image-modal" @click.self="previewImage = null">
      <div class="image-modal-content" @click.stop>
        <button class="image-close-btn" @click="previewImage = null">
          <i class="fas fa-times"></i>
        </button>
        <img :src="previewImage" alt="Preview" />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

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
      newDSI: {
        problem: "",
        solution: "",
        result: "",
        beforeImage: null,
        afterImage: null,
        beforeImageFile: null,
        afterImageFile: null,
      },
      dsiList: [],
      previewImage: null,
    }
  },
  computed: {
    approvedCount() {
      return this.dsiList.filter(item => item.status === 'Approved').length;
    },
    pendingCount() {
      return this.dsiList.filter(item => item.status === 'Waiting' || item.status === 'Pending').length;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadDSIs();
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    truncateText(text, length) {
      if (!text) return '—';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'approved';
      if (s === 'rejected') return 'rejected';
      return 'pending';
    },
    getStatusIcon(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'fas fa-check-circle';
      if (s === 'rejected') return 'fas fa-times-circle';
      return 'fas fa-clock';
    },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    capitalizeFirstLetter(text) {
      if (!text) return '—';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    async deleteDSI(id, index) {
      if (!confirm('Are you sure you want to delete this DSI?')) return;
      try {
        await axios.delete(`/api/dsis/${id}`);
        this.dsiList.splice(index, 1);
        toastSuccess('DSI deleted successfully');
      } catch (error) {
        console.error(error);
        toastError('Failed to delete DSI');
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
        toastError('Failed to load DSI');
      }
    },
    closeAllDsiPopup() {
      this.showAllDsiPopup = false;
    },
    async loadDSIs() {
      try {
        const res = await axios.get('/api/dsis');
        const fixUrl = (url) => url ? url.replace('/api/backend', '/backend') : null;
        this.dsiList = res.data.map(dsi => ({
          id: dsi.id,
          problem: dsi.problem,
          solution: dsi.solution,
          result: dsi.result,
          beforeImage: fixUrl(dsi.before_image),
          afterImage: fixUrl(dsi.after_image),
          date: dsi.created_at,
          status: dsi.status || 'Waiting',
          user: dsi.user_name || dsi.user
        }));
      } catch (error) {
        console.error('Failed to load DSIs:', error);
        toastError('Failed to load improvements');
      }
    },
    async addDSI() {
      if (this.isSubmitting) return;
      if (!this.newDSI.problem || !this.newDSI.solution || !this.newDSI.result) {
        toastWarning('Please fill all fields');
        return;
      }

      this.isSubmitting = true;
      try {
        const formData = new FormData();
        formData.append('problem', this.newDSI.problem);
        formData.append('solution', this.newDSI.solution);
        formData.append('result', this.newDSI.result);
        if (this.newDSI.beforeImageFile) formData.append('before_image', this.newDSI.beforeImageFile);
        if (this.newDSI.afterImageFile) formData.append('after_image', this.newDSI.afterImageFile);

        const res = await axios.post('/api/dsis', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const fixUrl = (url) => url ? url.replace('/api/backend', '/backend') : null;
        const newDsi = {
          id: res.data.dsi.id,
          problem: res.data.dsi.problem,
          solution: res.data.dsi.solution,
          result: res.data.dsi.result,
          beforeImage: fixUrl(res.data.dsi.before_image),
          afterImage: fixUrl(res.data.dsi.after_image),
          date: res.data.dsi.created_at,
          status: res.data.dsi.status || 'Waiting'
        };
        this.dsiList.unshift(newDsi);
        this.newDSI = {
          problem: '', solution: '', result: '',
          beforeImage: null, afterImage: null,
          beforeImageFile: null, afterImageFile: null
        };
        toastSuccess('Improvement added successfully!');
      } catch (error) {
        console.error(error);
        toastError('All fields are required');
      } finally {
        this.isSubmitting = false;
      }
    },
    onImageChange(e, type) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'before') {
          this.newDSI.beforeImage = event.target.result;
          this.newDSI.beforeImageFile = file;
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
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    logout() {
      const token = localStorage.getItem('token');
      axios.post('https://employees.archenterprises.co.in/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
   ;
}

.dsi-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

/* Content Header */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.subtitle-modern {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.view-all-btn-premium {
  padding: 10px 22px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.view-all-btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card.approved {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}
.stat-card.approved i { color: #065f46; }

.stat-card.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}
.stat-card.pending i { color: #d97706; }

.stat-card i {
  font-size: 28px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.section-title-modern i {
  color: var(--primary-color);
}

/* Form Card */
.form-card-premium {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.dsi-form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-field label i {
  color: var(--primary-color);
}

.dsi-textarea-premium {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 13px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
}

.dsi-textarea-premium:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Image Upload */
.image-upload-section {
  grid-column: span 3;
}

.image-upload-row-premium {
  display: flex;
  gap: 16px;
}

.image-upload-card-premium {
  flex: 1;
  min-height: 100px;
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  transition: all 0.3s ease;
  overflow: hidden;
}

.image-upload-card-premium:hover {
  /* border-color: var(--primary-color); */
  background: #07080a;
}

.upload-placeholder-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 24px;
  color: #9ca3af;
}

.upload-placeholder-premium span {
  font-size: 12px;
  font-weight: 500;
}

.upload-preview-premium {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-submit-premium {
  padding: 10px 24px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-submit-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Table Card */
.table-card-premium {
  background: white;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.table-wrapper-premium {
  overflow-x: auto;
}

.dsi-table-premium {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.dsi-table-premium thead {
  background: #f8fafc;
}

.dsi-table-premium th {
  text-align: left;
  padding: 14px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.dsi-table-premium td {
  padding: 14px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  vertical-align: middle;
}

.dsi-row-premium {
  transition: all 0.3s ease;
}

.dsi-row-premium:hover {
  background: #fafbfc;
}

.serial {
  font-weight: 600;
  color: #9ca3af;
  width: 50px;
}

.problem-cell, .solution-cell, .result-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4b5563;
}

.image-cell {
  text-align: center;
  width: 60px;
}

.dsi-thumb-premium {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.dsi-thumb-premium:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.no-image {
  color: #9ca3af;
  font-size: 12px;
}

.date-cell {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.date-cell i {
  margin-right: 6px;
  font-size: 11px;
}

.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge-premium.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-premium.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-premium.pending {
  background: #fef3c7;
  color: #d97706;
}

.action-cell {
  width: 60px;
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-icon.delete:hover {
  /* background: var(--danger); */
  color: rgb(6, 3, 3);
  transform: translateY(-2px);
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-state-premium p {
  font-size: 14px;
}

/* Modal Styles */
.modal-premium {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: modalBackdropIn 0.3s ease;
}

@keyframes modalBackdropIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(10px); }
}

.modal-premium-container {
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 1200px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.modal-premium-container.xlarge { max-width: 1200px; }

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-premium-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 20px;
}

.modal-premium-header h2 {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.modal-close:hover {
  /* background: var(--danger); */
  color: rgb(9, 3, 3);
  transform: rotate(90deg);
}

.modal-premium-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fafbfc;
}

.modal-premium-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-primary-modern {
  padding: 10px 20px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Image Modal */
.image-modal {
  background: rgba(0, 0, 0, 0.9);
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.image-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.image-close-btn:hover {
  /* background: var(--danger); */
  color: rgb(0, 0, 0);
  transform: rotate(90deg);
}

/* Responsive */
@media (max-width: 1024px) {
  .dsi-form-grid {
    grid-template-columns: 1fr;
  }
  .image-upload-section {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }
  .dsi-board-premium {
    padding: 20px;
  }
  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }
  .view-all-btn-premium {
    justify-content: center;
  }
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
  .dsi-form-grid {
    grid-template-columns: 1fr;
  }
  .image-upload-row-premium {
    flex-direction: column;
  }
  .image-upload-card-premium {
    min-height: 80px;
  }
  .dsi-table-premium {
    min-width: 800px;
  }
  .modal-premium-container {
    max-width: 95%;
  }
  .modal-premium-header {
    padding: 16px 20px;
  }
  .modal-premium-body {
    padding: 16px;
  }
  .modal-premium-footer {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
}
</style>