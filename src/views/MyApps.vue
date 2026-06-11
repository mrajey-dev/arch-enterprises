<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="apps-board-premium" v-if="!isMobile || !isSidebarVisible">
        <!-- Header Section -->
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <div>
              <h1>My Apps Portfolio</h1>
              <p class="subtitle-modern">Published on Google Play Store & GitHub</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fab fa-google-play"></i>
            <span>{{ stats.total_apps || 0 }} Apps Published</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fab fa-google-play"></i>
            <div class="stat-info">
              <span class="stat-value">{{ stats.total_apps || 0 }}</span>
              <span class="stat-label">Total Apps</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fab fa-github"></i>
            <div class="stat-info">
              <span class="stat-value">{{ openSourceApps }}</span>
              <span class="stat-label">Open Source</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-download"></i>
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(stats.total_downloads) }}</span>
              <span class="stat-label">Total Downloads</span>
            </div>
          </div>
          <div class="stat-card" @click="scrollToAddForm">
            <i class="fas fa-plus-circle"></i>
            <div class="stat-info">
              <span class="stat-value action-stat">+ Add New</span>
              <span class="stat-label">Submit App</span>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-section">
          <div class="search-wrapper">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="debouncedSearch"
              placeholder="Search by app name, technology, or description..."
              class="search-input"
            >
            <button v-if="searchQuery" @click="clearSearch" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Apps Grid -->
        <div class="apps-section">
          <div class="section-title-modern">
            <i class="fas fa-star"></i>
            <span>All Published Applications</span>
            <button class="btn-add-small" @click="scrollToAddForm">
              <i class="fas fa-plus"></i> Add App
            </button>
          </div>

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-pulse"></i>
            <p>Loading apps...</p>
          </div>

          <div v-else-if="apps.length" class="apps-grid-premium">
            <div v-for="app in apps" :key="app.id" class="app-card-premium">
              <div class="card-accent" :style="{ background: app.accent_color || 'linear-gradient(135deg, #1e3c72, #2a5298)' }"></div>
              
              <div class="app-header">
                <div class="app-logo-wrapper">
                  <img v-if="app.logo_url" :src="app.logo_url" class="app-logo" :alt="app.name">
                  <div v-else class="app-logo-placeholder">
                    <i class="fas fa-app-store"></i>
                  </div>
                </div>
                <div class="app-title-wrap">
                  <h3>{{ app.name }}</h3>
                  <div class="app-meta">
                    <span><i class="fas fa-code-branch"></i> {{ app.package_name }}</span>
                    <span><i class="fas fa-calendar-alt"></i> {{ formatDate(app.release_date) }}</span>
                  </div>
                </div>
                <div class="app-actions">
                  <a v-if="app.play_store_link" :href="app.play_store_link" target="_blank" class="action-btn playstore-btn" title="View on Play Store">
                    <i class="fab fa-google-play"></i>
                  </a>
                  <a v-if="app.github_link" :href="app.github_link" target="_blank" class="action-btn github-btn" title="GitHub Repository">
                    <i class="fab fa-github"></i>
                  </a>
                  <button class="action-btn edit-btn" @click="editApp(app)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" @click="confirmDelete(app)" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>

              <div class="tech-stack" v-if="app.technologies">
                <div class="tech-label">
                  <i class="fas fa-microchip"></i> Technologies
                </div>
                <div class="tech-badges">
                  <span v-for="tech in app.technologies.split(',')" :key="tech" class="tech-badge">
                    {{ tech.trim() }}
                  </span>
                </div>
              </div>

              <div class="short-description">
                <i class="fas fa-align-left"></i>
                <span>{{ app.short_description }}</span>
              </div>

              <div class="revenue-structure" v-if="app.revenue_model">
                <i class="fas fa-chart-line"></i>
                <span class="revenue-label">Revenue:</span>
                <span class="revenue-value">{{ app.revenue_model }}</span>
              </div>

              <div class="long-description" v-if="app.long_description">
                <button class="toggle-desc-btn" @click="toggleDescription(app.id)">
                  <i :class="expandedDescriptions[app.id] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                  {{ expandedDescriptions[app.id] ? 'Show less' : 'Read more' }}
                </button>
                <div v-show="expandedDescriptions[app.id]" class="long-desc-content">
                  {{ app.long_description }}
                </div>
              </div>

              <div class="app-footer">
                <div class="badge-version" v-if="app.version">
                  <i class="fas fa-tag"></i> v{{ app.version }}
                </div>
                <div class="badge-downloads" v-if="app.download_count">
                  <i class="fas fa-download"></i> {{ formatNumber(app.download_count) }}+
                </div>
                <div class="badge-rating" v-if="app.rating">
                  <i class="fas fa-star"></i> {{ app.rating }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state-premium">
            <i class="fas fa-rocket"></i>
            <h4>No Apps Found</h4>
            <p>{{ searchQuery ? 'Try a different search term' : 'Click the "Add App" button to showcase your applications' }}</p>
            <button class="btn-primary-empty" @click="scrollToAddForm">
              <i class="fas fa-plus-circle"></i> {{ searchQuery ? 'Clear Search & Add App' : 'Add Your First App' }}
            </button>
          </div>
        </div>

        <!-- Add/Edit Form Section -->
        <div id="addAppSection" class="form-section-premium">
          <div class="section-title-modern">
            <i class="fas fa-edit"></i>
            <span>{{ editingApp ? 'Edit Application' : 'Add New Application' }}</span>
          </div>
          
          <div class="app-form-container">
            <form @submit.prevent="handleAppSubmit">
              <div class="form-row-grid">
                <div class="form-group">
                  <label><i class="fas fa-heading"></i> App Name *</label>
                  <input type="text" v-model="formData.name" placeholder="e.g., TaskFlow Pro" required>
                </div>
                <div class="form-group">
                  <label><i class="fas fa-tag"></i> Package Name *</label>
                  <input type="text" v-model="formData.package_name" placeholder="com.yourcompany.appname" required>
                </div>
              </div>

              <div class="form-row-grid">
                <div class="form-group">
                  <label><i class="fas fa-image"></i> App Logo URL</label>
                  <input type="url" v-model="formData.logo_url" placeholder="https://.../logo.png">
                </div>
                <div class="form-group">
                  <label><i class="fas fa-microchip"></i> Technologies *</label>
                  <input type="text" v-model="formData.technologies" placeholder="Flutter, Firebase, Node.js" required>
                </div>
              </div>

              <div class="form-row-grid">
                <div class="form-group">
                  <label><i class="fab fa-google-play"></i> Play Store Link</label>
                  <input type="url" v-model="formData.play_store_link" placeholder="https://play.google.com/store/apps/details?id=...">
                </div>
                <div class="form-group">
                  <label><i class="fab fa-github"></i> GitHub Link</label>
                  <input type="url" v-model="formData.github_link" placeholder="https://github.com/username/repo">
                </div>
              </div>

              <div class="form-group">
                <label><i class="fas fa-align-left"></i> Short Description *</label>
                <textarea v-model="formData.short_description" rows="2" placeholder="Brief overview (max 200 chars)" maxlength="200" required></textarea>
              </div>

              <div class="form-group">
                <label><i class="fas fa-file-alt"></i> Long Description</label>
                <textarea v-model="formData.long_description" rows="4" placeholder="Detailed description, features, use cases..."></textarea>
              </div>

              <div class="form-row-grid">
                <div class="form-group">
                  <label><i class="fas fa-chart-line"></i> Revenue Model</label>
                  <input type="text" v-model="formData.revenue_model" placeholder="e.g., Freemium, Subscription, One-time purchase">
                </div>
                <div class="form-group">
                  <label><i class="fas fa-tag"></i> Version</label>
                  <input type="text" v-model="formData.version" placeholder="1.0.0">
                </div>
              </div>

              <div class="form-row-grid">
                <div class="form-group">
                  <label><i class="fas fa-download"></i> Download Count</label>
                  <input type="number" v-model.number="formData.download_count" placeholder="1000">
                </div>
                <div class="form-group">
                  <label><i class="fas fa-star"></i> Rating (0-5)</label>
                  <input type="number" step="0.1" min="0" max="5" v-model.number="formData.rating" placeholder="4.5">
                </div>
              </div>

              <div class="form-group">
                <label><i class="fas fa-palette"></i> Accent Color</label>
                <input type="color" v-model="formData.accent_color" class="color-picker">
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" @click="resetForm">Cancel</button>
                <button type="submit" class="btn-primary" :disabled="submitting">
                  <i v-if="submitting" class="fas fa-spinner fa-pulse"></i>
                  <i v-else class="fas fa-save"></i>
                  {{ submitting ? 'Saving...' : (editingApp ? 'Update App' : 'Add App') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-container-premium">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-trash-alt" style="color: #ef4444;"></i>
          </div>
          <h2>Confirm Deletion</h2>
          <button class="close-modal" @click="showDeleteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ appToDelete?.name }}</strong>? This action cannot be undone.</p>
          <div class="modal-actions" style="margin-top: 24px;">
            <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button class="btn-danger" @click="deleteApp" :disabled="deleting">
              <i v-if="deleting" class="fas fa-spinner fa-pulse"></i>
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import { toastSuccess, toastError } from "@/utils/toast.js";

// Update this to your actual API endpoint
const API_BASE = 'https://employees.archenterprises.co.in/api/api';

export default {
  name: "MyAppsPortfolio",
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      apps: [],
      stats: {
        total_apps: 0,
        total_downloads: 0,
        avg_rating: 0
      },
      loading: false,
      submitting: false,
      deleting: false,
      searchQuery: '',
      searchTimeout: null,
      expandedDescriptions: {},
      showDeleteModal: false,
      appToDelete: null,
      editingApp: null,
      formData: {
        id: null,
        name: '',
        package_name: '',
        logo_url: '',
        technologies: '',
        play_store_link: '',
        github_link: '',
        short_description: '',
        long_description: '',
        revenue_model: '',
        version: '',
        download_count: null,
        rating: null,
        accent_color: '#2a5298',
        release_date: new Date().toISOString().split('T')[0]
      }
    }
  },
  computed: {
    openSourceApps() {
      return this.apps.filter(app => app.github_link && app.github_link.trim() !== '').length;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadApps();
    this.loadStats();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    async loadApps() {
      this.loading = true;
      try {
        let url = `${API_BASE}/apps`;
        if (this.searchQuery) {
          url += `?search=${encodeURIComponent(this.searchQuery)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          this.apps = data.data;
        } else {
          toastError('Failed to load apps');
        }
      } catch (error) {
        console.error('Error loading apps:', error);
        toastError('Network error while loading apps');
      } finally {
        this.loading = false;
      }
    },

    async loadStats() {
      try {
        const response = await fetch(`${API_BASE}/apps/stats`);
        const data = await response.json();
        if (data.success) {
          this.stats = data.data;
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.loadApps();
      }, 500);
    },

    clearSearch() {
      this.searchQuery = '';
      this.loadApps();
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    formatNumber(num) {
      if (!num) return '0';
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    },

    toggleDescription(appId) {
      this.expandedDescriptions[appId] = !this.expandedDescriptions[appId];
    },

    scrollToAddForm() {
      this.resetForm();
      const element = document.getElementById('addAppSection');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    resetForm() {
      this.editingApp = null;
      this.formData = {
        id: null,
        name: '',
        package_name: '',
        logo_url: '',
        technologies: '',
        play_store_link: '',
        github_link: '',
        short_description: '',
        long_description: '',
        revenue_model: '',
        version: '',
        download_count: null,
        rating: null,
        accent_color: '#2a5298',
        release_date: new Date().toISOString().split('T')[0]
      };
    },

    editApp(app) {
      this.editingApp = app;
      this.formData = { ...app };
      this.scrollToAddForm();
    },

    async handleAppSubmit() {
      if (!this.formData.name || !this.formData.package_name || !this.formData.short_description) {
        toastError('Please fill required fields');
        return;
      }

      this.submitting = true;
      try {
        const url = this.editingApp 
          ? `${API_BASE}/apps/${this.editingApp.id}`
          : `${API_BASE}/apps`;
        
        const method = this.editingApp ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          toastSuccess(this.editingApp ? 'App updated successfully!' : 'App added successfully!');
          this.resetForm();
          this.loadApps();
          this.loadStats();
        } else {
          toastError(data.message || 'Operation failed');
        }
      } catch (error) {
        console.error('Error saving app:', error);
        toastError('Network error');
      } finally {
        this.submitting = false;
      }
    },

    confirmDelete(app) {
      this.appToDelete = app;
      this.showDeleteModal = true;
    },

    async deleteApp() {
      if (!this.appToDelete) return;
      
      this.deleting = true;
      try {
        const response = await fetch(`${API_BASE}/apps/${this.appToDelete.id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
          toastSuccess(`"${this.appToDelete.name}" deleted successfully`);
          this.loadApps();
          this.loadStats();
          this.showDeleteModal = false;
          this.appToDelete = null;
        } else {
          toastError(data.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error deleting app:', error);
        toastError('Network error');
      } finally {
        this.deleting = false;
      }
    }
  }
}
</script>

<style scoped>
/* Add your existing styles here - same as your SOP page */
/* Copy all the styles from your CompanySOP component and adjust as needed */

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.search-section {
  margin-bottom: 32px;
}

.search-wrapper {
  position: relative;
  max-width: 500px;
}

.search-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #f9fafb;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #2a5298;
  background: white;
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
}

.clear-search:hover {
  color: #ef4444;
}

/* All styles from original SOP page, adjusted for apps */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  --primary-color: #2a5298;
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f4f7fc;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.apps-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

/* Header */
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
  font-size: 20px;
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

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:last-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
}

.stat-card i {
  font-size: 32px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.action-stat {
  font-size: 20px;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
  justify-content: space-between;
}

.btn-add-small {
  background: var(--primary);
  border: none;
  padding: 6px 14px;
  border-radius: 30px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add-small:hover {
  opacity: 0.9;
  transform: scale(0.97);
}

/* Apps Grid */
.apps-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.app-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.app-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.12);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

.app-header {
  display: flex;
  padding: 18px;
  gap: 14px;
  align-items: flex-start;
  background: #fafbfc;
  border-bottom: 1px solid #eef2f6;
}

.app-logo-wrapper {
  flex-shrink: 0;
}

.app-logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  object-fit: cover;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.app-logo-placeholder {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--primary-color);
}

.app-title-wrap {
  flex: 1;
}

.app-title-wrap h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.app-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: #6c757d;
}

.app-meta i {
  margin-right: 4px;
}

.app-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: transparent;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.playstore-btn { color: #3b82f6; }
.playstore-btn:hover { background: #e0e7ff; }
.github-btn { color: #1f2937; }
.github-btn:hover { background: #e5e7eb; }
.edit-btn { color: #f59e0b; }
.edit-btn:hover { background: #fed7aa; }
.delete-btn { color: #ef4444; }
.delete-btn:hover { background: #fee2e2; }

.tech-stack {
  padding: 12px 18px;
  background: #f9fafb;
  border-bottom: 1px solid #f0f0f0;
}

.tech-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.tech-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-badge {
  font-size: 11px;
  padding: 4px 10px;
  background: #eef2ff;
  color: #1e40af;
  border-radius: 20px;
  font-weight: 500;
}

.short-description {
  padding: 14px 18px;
  font-size: 13px;
  color: #4b5563;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.revenue-structure {
  padding: 10px 18px;
  font-size: 12px;
  background: #fffbeb;
  border-bottom: 1px solid #fde68a;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.revenue-label {
  font-weight: 700;
  color: #b45309;
}

.revenue-value {
  color: #92400e;
}

.long-description {
  padding: 8px 18px 14px;
}

.toggle-desc-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.long-desc-content {
  margin-top: 10px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
  padding: 10px;
  background: #f9fafb;
  border-radius: 12px;
}

.app-footer {
  padding: 12px 18px;
  display: flex;
  gap: 12px;
  background: #f9fafb;
  flex-wrap: wrap;
}

.badge-version, .badge-downloads, .badge-rating {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 30px;
  background: #eef2ff;
  color: #1e40af;
}

.badge-downloads {
  background: #d1fae5;
  color: #065f46;
}

.badge-rating {
  background: #fef3c7;
  color: #92400e;
}

/* Form Section */
.form-section-premium {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 2px solid #e5e7eb;
}

.app-form-container {
  background: #f9fafb;
  border-radius: 24px;
  padding: 24px;
}

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  font-family: inherit;
  transition: 0.2s;
  font-size: 14px;
}

.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  ring: 2px solid var(--primary-color);
}

.color-picker {
  height: 48px;
  padding: 4px;
}

.form-hint {
  font-size: 11px;
  color: #6b7280;
  margin-top: 5px;
  display: block;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 28px;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.btn-primary-empty {
  margin-top: 20px;
  background: var(--primary);
  border: none;
  padding: 10px 24px;
  border-radius: 40px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container-premium {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-icon {
  font-size: 28px;
}

.close-modal {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

@media (max-width: 768px) {
  .main-content { flex-direction: column; padding: 12px; }
  .apps-board-premium { padding: 16px; }
  .apps-grid-premium { grid-template-columns: 1fr; }
  .form-row-grid { grid-template-columns: 1fr; gap: 0; }
}
</style>