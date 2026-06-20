<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="apps-board-premium" v-if="!isMobile || !isSidebarVisible">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
         
          <div class="mobile-title">
            <i class="fas fa-mobile-alt"></i>
            <span>My Apps</span>
          </div>
          <button class="mobile-add-btn" @click="scrollToAddForm">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
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

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fab fa-google-play"></i>
            <div class="stat-info">
              <span class="stat-value">{{ stats.total_apps || 0 }}</span>
              <span class="stat-label">Total</span>
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
              <span class="stat-label">Downloads</span>
            </div>
          </div>
          <div class="stat-card" @click="scrollToAddForm">
            <i class="fas fa-plus-circle"></i>
            <div class="stat-info">
              <span class="stat-value action-stat">+ Add</span>
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
              placeholder="Search apps..."
              class="search-input"
            >
            <button v-if="searchQuery" @click="clearSearch" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Apps Grid - Mobile Optimized -->
        <div class="apps-section">
          

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-pulse"></i>
            <p>Loading apps...</p>
          </div>

          <div v-else-if="apps.length" class="apps-grid-premium">
            <div v-for="app in apps" :key="app.id" class="app-card-premium" :class="{ 'mobile-card': isMobile }">
              <div class="card-accent" :style="{ background: app.accent_color || 'linear-gradient(135deg, #1e3c72, #2a5298)' }"></div>
              
              <div class="app-header" :class="{ 'mobile-header': isMobile }">
                <div class="app-logo-wrapper">
                  <img v-if="app.logo_url" :src="app.logo_url" class="app-logo" :class="{ 'mobile-logo': isMobile }" :alt="app.name">
                  <div v-else class="app-logo-placeholder" :class="{ 'mobile-logo': isMobile }">
                    <i class="fas fa-app-store"></i>
                  </div>
                </div>
                <div class="app-title-wrap">
                  <h3>{{ truncateText(app.name, isMobile ? 20 : 30) }}</h3>
                  <div class="app-meta">
                    <span><i class="fas fa-code-branch"></i> {{ truncateText(app.package_name, isMobile ? 15 : 25) }}</span>
                    <span><i class="fas fa-calendar-alt"></i> {{ formatDate(app.release_date) }}</span>
                  </div>
                </div>
                <div class="app-actions" :class="{ 'mobile-actions': isMobile }">
                  <a v-if="app.play_store_link" :href="app.play_store_link" target="_blank" class="action-btn playstore-btn" title="Play Store">
                    <i class="fab fa-google-play"></i>
                  </a>
                  <a v-if="app.github_link" :href="app.github_link" target="_blank" class="action-btn github-btn" title="GitHub">
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

              <div class="tech-stack" v-if="app.technologies" :class="{ 'mobile-tech': isMobile }">
                <div class="tech-label">
                  <i class="fas fa-microchip"></i> Technologies
                </div>
                <div class="tech-badges">
                  <span v-for="tech in app.technologies.split(',')" :key="tech" class="tech-badge" :class="{ 'mobile-badge': isMobile }">
                    {{ tech.trim() }}
                  </span>
                </div>
              </div>

              <div class="short-description" :class="{ 'mobile-desc': isMobile }">
                <i class="fas fa-align-left"></i>
                <span>{{ truncateText(app.short_description, isMobile ? 80 : 120) }}</span>
              </div>

              <div class="revenue-structure" v-if="app.revenue_model" :class="{ 'mobile-revenue': isMobile }">
                <i class="fas fa-chart-line"></i>
                <span class="revenue-label">Revenue:</span>
                <span class="revenue-value">{{ truncateText(app.revenue_model, isMobile ? 20 : 30) }}</span>
              </div>

              <!-- Documentation Section - Mobile Optimized -->
              <div class="documentation-section" v-if="hasDocumentationContent(app)">
                <div class="doc-header" @click="toggleDocumentation(app.id)">
                  <i class="fas fa-book-open"></i>
                  <span>Documentation</span>
                  <i :class="expandedDocumentation[app.id] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="doc-toggle-icon"></i>
                </div>
                <div v-show="expandedDocumentation[app.id]" class="doc-content" :class="{ 'mobile-doc': isMobile }">
                  <div class="doc-text" v-html="renderDocumentation(app.documentation)" style="white-space: pre-line;"></div>
                  
                  <div v-if="app.documentation_url && app.documentation_url.trim()" class="doc-link">
                    <i class="fas fa-external-link-alt"></i>
                    <a :href="app.documentation_url" target="_blank" rel="noopener noreferrer">
                      {{ app.documentation_url_label || 'Read Full Documentation' }}
                    </a>
                  </div>

                  <div class="doc-actions" :class="{ 'mobile-doc-actions': isMobile }" v-if="hasDocumentationContent(app)">
                    <button v-if="app.documentation_url" class="doc-action-btn" @click="openDocumentationUrl(app.documentation_url)">
                      <i class="fas fa-external-link-alt"></i> Open
                    </button>
                    <button class="doc-action-btn copy-btn" @click="copyDocumentationLink(app)" v-if="app.documentation_url">
                      <i class="fas fa-copy"></i> Copy
                    </button>
                  </div>
                </div>
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

              <div class="app-footer" :class="{ 'mobile-footer': isMobile }">
                <div class="badge-version" v-if="app.version">
                  <i class="fas fa-tag"></i> v{{ app.version }}
                </div>
                <div class="badge-downloads" v-if="app.download_count">
                  <i class="fas fa-download"></i> {{ formatNumber(app.download_count) }}+
                </div>
                <div class="badge-rating" v-if="app.rating">
                  <i class="fas fa-star"></i> {{ app.rating }}
                </div>
                <div class="badge-docs" v-if="hasDocumentationContent(app)">
                  <i class="fas fa-book"></i> Docs
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
            <i class="fas fa-rocket"></i>
            <h4>No Apps Found</h4>
            <p>{{ searchQuery ? 'Try a different search term' : 'Click the "Add App" button to showcase your applications' }}</p>
            <button class="btn-primary-empty" @click="scrollToAddForm">
              <i class="fas fa-plus-circle"></i> {{ searchQuery ? 'Clear & Add' : 'Add Your First App' }}
            </button>
          </div>
        </div>

        <!-- Add/Edit Form Section - Mobile Optimized -->
        <div id="addAppSection" class="form-section-premium">
          <div class="section-title-modern">
            <i class="fas fa-edit"></i>
            <span>{{ editingApp ? 'Edit Application' : 'Add New Application' }}</span>
          </div>
          
          <div class="app-form-container" :class="{ 'mobile-form': isMobile }">
            <form @submit.prevent="handleAppSubmit">
              <div class="form-row-grid" :class="{ 'mobile-grid': isMobile }">
                <div class="form-group">
                  <label><i class="fas fa-heading"></i> App Name *</label>
                  <input type="text" v-model="formData.name" placeholder="e.g., TaskFlow Pro" required>
                </div>
                <div class="form-group">
                  <label><i class="fas fa-tag"></i> Package Name *</label>
                  <input type="text" v-model="formData.package_name" placeholder="com.yourcompany.appname" required>
                </div>
              </div>

              <div class="form-row-grid" :class="{ 'mobile-grid': isMobile }">
                <div class="form-group">
                  <label><i class="fas fa-image"></i> App Logo URL</label>
                  <input type="url" v-model="formData.logo_url" placeholder="https://.../logo.png">
                </div>
                <div class="form-group">
                  <label><i class="fas fa-microchip"></i> Technologies *</label>
                  <input type="text" v-model="formData.technologies" placeholder="Flutter, Firebase, Node.js" required>
                </div>
              </div>

              <div class="form-row-grid" :class="{ 'mobile-grid': isMobile }">
                <div class="form-group">
                  <label><i class="fab fa-google-play"></i> Play Store Link</label>
                  <input type="url" v-model="formData.play_store_link" placeholder="https://play.google.com/store/apps/details?id=...">
                </div>
                <div class="form-group">
                  <label><i class="fab fa-github"></i> GitHub Link</label>
                  <input type="url" v-model="formData.github_link" placeholder="https://github.com/username/repo">
                </div>
              </div>

              <!-- Documentation Fields -->
              <div class="form-section-divider">
                <i class="fas fa-book-open"></i>
                <span>Documentation</span>
              </div>

              <div class="form-group">
                <label><i class="fas fa-link"></i> Documentation URL</label>
                <input type="url" v-model="formData.documentation_url" placeholder="https://yourdomain.com/docs/app-name">
                <small class="form-hint">Link to hosted documentation</small>
              </div>

              <div class="form-group">
                <label><i class="fas fa-tag"></i> Documentation Link Label</label>
                <input type="text" v-model="formData.documentation_url_label" placeholder="e.g., API Reference, User Guide">
                <small class="form-hint">Custom text for the documentation link</small>
              </div>

              <div class="form-group">
                <label><i class="fas fa-file-alt"></i> Documentation Content</label>
                <div class="rich-text-editor">
                  <div class="editor-toolbar" :class="{ 'mobile-toolbar': isMobile }">
                    <button type="button" @click="formatDocText('bold')" title="Bold"><i class="fas fa-bold"></i></button>
                    <button type="button" @click="formatDocText('italic')" title="Italic"><i class="fas fa-italic"></i></button>
                    <button type="button" @click="formatDocText('underline')" title="Underline"><i class="fas fa-underline"></i></button>
                    <button type="button" @click="formatDocText('h2')" title="H2"><i class="fas fa-heading"></i> H2</button>
                    <button type="button" @click="formatDocText('h3')" title="H3"><i class="fas fa-heading"></i> H3</button>
                    <button type="button" @click="formatDocText('link')" title="Link"><i class="fas fa-link"></i></button>
                    <button type="button" @click="formatDocText('ul')" title="List"><i class="fas fa-list-ul"></i></button>
                    <button type="button" @click="formatDocText('code')" title="Code"><i class="fas fa-code"></i></button>
                  </div>
                  <textarea 
                    v-model="formData.documentation" 
                    placeholder="Write detailed documentation here..."
                    rows="8"
                    class="doc-textarea"
                    :class="{ 'mobile-textarea': isMobile }"
                  ></textarea>
                </div>
                <small class="form-hint">
                  <i class="fas fa-info-circle"></i> Supports HTML formatting
                </small>
              </div>

              <div class="form-group">
                <label><i class="fas fa-align-left"></i> Short Description *</label>
                <textarea v-model="formData.short_description" rows="2" placeholder="Brief overview (max 200 chars)" maxlength="200" required></textarea>
              </div>

              <div class="form-group">
                <label><i class="fas fa-file-alt"></i> Long Description</label>
                <textarea v-model="formData.long_description" rows="4" placeholder="Detailed description, features, use cases..."></textarea>
              </div>

              <div class="form-row-grid" :class="{ 'mobile-grid': isMobile }">
                <div class="form-group">
                  <label><i class="fas fa-chart-line"></i> Revenue Model</label>
                  <input type="text" v-model="formData.revenue_model" placeholder="e.g., Freemium, Subscription">
                </div>
                <div class="form-group">
                  <label><i class="fas fa-tag"></i> Version</label>
                  <input type="text" v-model="formData.version" placeholder="1.0.0">
                </div>
              </div>

              <div class="form-row-grid" :class="{ 'mobile-grid': isMobile }">
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

              <div class="modal-actions" :class="{ 'mobile-actions': isMobile }">
                <button type="button" class="btn-secondary" @click="resetForm">Cancel</button>
                <button type="submit" class="btn-primary" :disabled="submitting">
                  <i v-if="submitting" class="fas fa-spinner fa-pulse"></i>
                  <i v-else class="fas fa-save"></i>
                  {{ submitting ? 'Saving...' : (editingApp ? 'Update' : 'Add') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal - Mobile Optimized -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-container-premium" :class="{ 'mobile-modal': isMobile }">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-trash-alt" style="color: #ef4444;"></i>
          </div>
          <h2>Confirm Deletion</h2>
          <button class="close-modal" @click="showDeleteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Delete <strong>{{ appToDelete?.name }}</strong>? This cannot be undone.</p>
          <div class="modal-actions" style="margin-top: 24px;" :class="{ 'mobile-actions': isMobile }">
            <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button class="btn-danger" @click="deleteApp" :disabled="deleting">
              <i v-if="deleting" class="fas fa-spinner fa-pulse"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification Container -->
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
        <i :class="toast.icon"></i>
        <span>{{ toast.message }}</span>
        <button @click="removeToast(toast.id)">&times;</button>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'

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
      expandedDocumentation: {},
      showDeleteModal: false,
      appToDelete: null,
      editingApp: null,
      toasts: [],
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
        release_date: new Date().toISOString().split('T')[0],
        documentation: '',
        documentation_url: '',
        documentation_url_label: ''
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
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
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
          this.showToast('Failed to load apps', 'error');
        }
      } catch (error) {
        console.error('Error loading apps:', error);
        this.showToast('Network error while loading apps', 'error');
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

    toggleDocumentation(appId) {
      this.expandedDocumentation[appId] = !this.expandedDocumentation[appId];
    },

    hasDocumentationContent(app) {
      return (app.documentation && app.documentation.trim()) || 
             (app.documentation_url && app.documentation_url.trim());
    },

    renderDocumentation(content) {
      if (!content) return '';
      
      let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      if (/<[^>]+>/g.test(sanitized)) {
        return sanitized;
      }
      
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/\s\s/g, ' &nbsp;');
      
      return sanitized;
    },

    openDocumentationUrl(url) {
      if (url) {
        window.open(url, '_blank');
      }
    },

    async copyDocumentationLink(app) {
      if (app.documentation_url) {
        try {
          await navigator.clipboard.writeText(app.documentation_url);
          this.showToast('Documentation link copied!', 'success');
        } catch (err) {
          this.showToast('Failed to copy link', 'error');
        }
      }
    },

    formatDocText(format) {
      const textarea = document.querySelector('.doc-textarea');
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = this.formData.documentation.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `<strong>${selectedText || 'bold text'}</strong>`;
          break;
        case 'italic':
          formattedText = `<em>${selectedText || 'italic text'}</em>`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText || 'underlined text'}</u>`;
          break;
        case 'h2':
          formattedText = `<h2>${selectedText || 'Heading 2'}</h2>`;
          break;
        case 'h3':
          formattedText = `<h3>${selectedText || 'Heading 3'}</h3>`;
          break;
        case 'link':
          const url = prompt('Enter URL:', 'https://');
          if (url) {
            formattedText = `<a href="${url}" target="_blank" rel="noopener noreferrer">${selectedText || 'link text'}</a>`;
          }
          break;
        case 'ul':
          formattedText = `<ul>\n  <li>${selectedText || 'list item'}</li>\n</ul>`;
          break;
        case 'code':
          formattedText = `<code>${selectedText || 'code here'}</code>`;
          break;
        default:
          return;
      }
      
      this.formData.documentation = 
        this.formData.documentation.substring(0, start) + 
        formattedText + 
        this.formData.documentation.substring(end);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      }, 0);
    },

    showToast(message, type = 'info') {
      const id = Date.now();
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
      };
      this.toasts.push({ id, message, type, icon: icons[type] || icons.info });
      setTimeout(() => this.removeToast(id), 3000);
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    },

    scrollToAddForm() {
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
        release_date: new Date().toISOString().split('T')[0],
        documentation: '',
        documentation_url: '',
        documentation_url_label: ''
      };
    },

    editApp(app) {
      console.log('Editing app:', app);
      
      this.editingApp = app;
      
      this.formData = {
        id: app.id || null,
        name: app.name || '',
        package_name: app.package_name || '',
        logo_url: app.logo_url || '',
        technologies: app.technologies || '',
        play_store_link: app.play_store_link || '',
        github_link: app.github_link || '',
        short_description: app.short_description || '',
        long_description: app.long_description || '',
        revenue_model: app.revenue_model || '',
        version: app.version || '',
        download_count: app.download_count || null,
        rating: app.rating || null,
        accent_color: app.accent_color || '#2a5298',
        release_date: app.release_date || new Date().toISOString().split('T')[0],
        documentation: app.documentation || '',
        documentation_url: app.documentation_url || '',
        documentation_url_label: app.documentation_url_label || ''
      };
      
      this.scrollToAddForm();
      this.showToast('Loading app data for editing...', 'info');
    },

    async handleAppSubmit() {
      if (!this.formData.name || !this.formData.package_name || !this.formData.short_description) {
        this.showToast('Please fill required fields', 'error');
        return;
      }

      this.submitting = true;
      try {
        const url = this.editingApp 
          ? `${API_BASE}/apps/${this.editingApp.id}`
          : `${API_BASE}/apps`;
        
        const method = this.editingApp ? 'PUT' : 'POST';
        
        const submitData = {
          name: this.formData.name,
          package_name: this.formData.package_name,
          logo_url: this.formData.logo_url,
          technologies: this.formData.technologies,
          play_store_link: this.formData.play_store_link,
          github_link: this.formData.github_link,
          short_description: this.formData.short_description,
          long_description: this.formData.long_description,
          revenue_model: this.formData.revenue_model,
          version: this.formData.version,
          download_count: this.formData.download_count,
          rating: this.formData.rating,
          accent_color: this.formData.accent_color,
          release_date: this.formData.release_date,
          documentation: this.formData.documentation,
          documentation_url: this.formData.documentation_url,
          documentation_url_label: this.formData.documentation_url_label
        };
        
        const response = await fetch(url, {
          method,
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(submitData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.showToast(this.editingApp ? 'App updated successfully!' : 'App added successfully!', 'success');
          this.resetForm();
          await this.loadApps();
          await this.loadStats();
        } else {
          this.showToast(data.message || 'Operation failed', 'error');
        }
      } catch (error) {
        console.error('Error saving app:', error);
        this.showToast('Network error: ' + error.message, 'error');
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
          this.showToast(`"${this.appToDelete.name}" deleted successfully`, 'success');
          await this.loadApps();
          await this.loadStats();
          this.showDeleteModal = false;
          this.appToDelete = null;
        } else {
          this.showToast(data.message || 'Delete failed', 'error');
        }
      } catch (error) {
        console.error('Error deleting app:', error);
        this.showToast('Network error', 'error');
      } finally {
        this.deleting = false;
      }
    }
  }
}
</script>

<style scoped>
/* All existing styles with mobile additions */
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

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--dark);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark);
}

.mobile-title i {
  color: var(--primary-color);
}

.mobile-add-btn {
  background: var(--primary);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-add-btn:active {
  transform: scale(0.9);
}

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

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
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

.btn-text {
  display: inline;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

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

.app-card-premium.mobile-card {
  border-radius: 16px;
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

.app-header.mobile-header {
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 14px;
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

.app-logo.mobile-logo {
  width: 48px;
  height: 48px;
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

.app-logo-placeholder.mobile-logo {
  width: 48px;
  height: 48px;
  font-size: 24px;
}

.app-title-wrap {
  flex: 1;
}

.mobile-header .app-title-wrap {
  width: 100%;
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
  flex-shrink: 0;
}

.app-actions.mobile-actions {
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  margin-top: 8px;
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

.tech-stack.mobile-tech {
  padding: 10px 14px;
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

.tech-badge.mobile-badge {
  font-size: 10px;
  padding: 3px 8px;
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

.short-description.mobile-desc {
  padding: 10px 14px;
  font-size: 12px;
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

.revenue-structure.mobile-revenue {
  padding: 8px 14px;
  font-size: 11px;
}

.revenue-label {
  font-weight: 700;
  color: #b45309;
}

.revenue-value {
  color: #92400e;
}

.documentation-section {
  border-top: 1px solid #eef2f6;
  background: #fafcff;
}

.doc-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #f0f4ff, #e8edf8);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: var(--primary-color);
  transition: all 0.2s ease;
}

.doc-header:hover {
  background: linear-gradient(135deg, #e8edff, #e0e5f0);
}

.doc-header i:first-child {
  font-size: 14px;
}

.doc-toggle-icon {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s;
}

.doc-content {
  padding: 16px 18px;
  border-top: 1px solid #eef2f6;
  animation: slideDown 0.3s ease;
}

.doc-content.mobile-doc {
  padding: 12px 14px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.doc-text {
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 16px;
}

.doc-text h2 {
  font-size: 16px;
  margin: 12px 0 8px 0;
  color: #1f2937;
}

.doc-text h3 {
  font-size: 14px;
  margin: 10px 0 6px 0;
  color: #374151;
}

.doc-text ul, .doc-text ol {
  margin: 8px 0;
  padding-left: 20px;
}

.doc-text li {
  margin: 4px 0;
}

.doc-text code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #d63384;
}

.doc-text pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
  margin: 10px 0;
}

.doc-text a {
  color: var(--primary-color);
  text-decoration: none;
}

.doc-text a:hover {
  text-decoration: underline;
}

.doc-link {
  margin: 12px 0;
  padding: 8px 12px;
  background: #f0f4ff;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.doc-link i {
  color: var(--primary-color);
  font-size: 12px;
}

.doc-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}

.doc-link a:hover {
  text-decoration: underline;
}

.doc-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eef2f6;
}

.doc-actions.mobile-doc-actions {
  flex-direction: column;
  gap: 8px;
}

.doc-action-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4b5563;
}

.mobile-doc-actions .doc-action-btn {
  width: 100%;
  justify-content: center;
  padding: 8px;
}

.doc-action-btn:hover {
  background: #f1f5f9;
  border-color: var(--primary-color);
}

.doc-action-btn.copy-btn:hover {
  background: #eef2ff;
  color: var(--primary-color);
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

.app-footer.mobile-footer {
  padding: 10px 14px;
  gap: 8px;
}

.badge-version, .badge-downloads, .badge-rating, .badge-docs {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 30px;
  background: #eef2ff;
  color: #1e40af;
}

.mobile-footer .badge-version,
.mobile-footer .badge-downloads,
.mobile-footer .badge-rating,
.mobile-footer .badge-docs {
  font-size: 10px;
  padding: 3px 8px;
}

.badge-downloads {
  background: #d1fae5;
  color: #065f46;
}

.badge-rating {
  background: #fef3c7;
  color: #92400e;
}

.badge-docs {
  background: #e0e7ff;
  color: #3730a3;
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

.app-form-container.mobile-form {
  padding: 16px;
}

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.form-row-grid.mobile-grid {
  grid-template-columns: 1fr;
  gap: 12px;
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

.form-section-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0 16px 0;
  padding: 8px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: var(--primary-color);
}

.rich-text-editor {
  border: 1px solid #d1d5db;
  border-radius: 14px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.editor-toolbar.mobile-toolbar {
  gap: 3px;
  padding: 6px 8px;
}

.editor-toolbar button {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.editor-toolbar.mobile-toolbar button {
  padding: 4px 8px;
  font-size: 10px;
}

.editor-toolbar button:hover {
  background: #eef2ff;
  border-color: var(--primary-color);
}

.doc-textarea {
  width: 100%;
  padding: 12px 14px;
  border: none;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  resize: vertical;
  line-height: 1.5;
}

.doc-textarea.mobile-textarea {
  font-size: 15px;
  padding: 10px 12px;
}

.doc-textarea:focus {
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions.mobile-actions {
  flex-direction: column;
  gap: 10px;
}

.modal-actions.mobile-actions button {
  width: 100%;
  justify-content: center;
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

.empty-state-premium.empty-mobile {
  padding: 40px 16px;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-mobile .empty-state-premium i {
  font-size: 48px;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-mobile .empty-state-premium h4 {
  font-size: 16px;
}

.empty-state-premium p {
  font-size: 14px;
}

.empty-mobile .empty-state-premium p {
  font-size: 13px;
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

.modal-container-premium.mobile-modal {
  border-radius: 24px;
  max-width: 95%;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.mobile-modal .modal-header {
  padding: 16px 20px;
}

.modal-icon {
  font-size: 28px;
}

.modal-header h2 {
  font-size: 20px;
}

.mobile-modal .modal-header h2 {
  font-size: 17px;
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

.mobile-modal .modal-body {
  padding: 16px;
}

.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideInRight 0.3s ease;
  min-width: 280px;
}

.toast.success {
  border-left: 4px solid var(--success);
  background: #f0fdf4;
}

.toast.error {
  border-left: 4px solid var(--danger);
  background: #fef2f2;
}

.toast.info {
  border-left: 4px solid var(--info);
  background: #eff6ff;
}

.toast.warning {
  border-left: 4px solid var(--warning);
  background: #fffbeb;
}

.toast i {
  font-size: 18px;
}

.toast.success i { color: var(--success); }
.toast.error i { color: var(--danger); }
.toast.info i { color: var(--info); }
.toast.warning i { color: var(--warning); }

.toast span {
  flex: 1;
  font-size: 13px;
  color: #374151;
}

.toast button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .apps-board-premium {
    padding: 16px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 14px;
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }

  .stat-card i {
    font-size: 24px;
  }

  .stat-value {
    font-size: 22px;
  }

  .action-stat {
    font-size: 16px;
  }

  .stat-label {
    font-size: 10px;
  }

  .apps-grid-premium {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .app-card-premium.mobile-card {
    border-radius: 14px;
  }

  .app-header.mobile-header {
    padding: 12px;
  }

  .app-actions.mobile-actions {
    gap: 4px;
  }

  .action-btn {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .btn-text {
    display: none;
  }

  .btn-add-small {
    padding: 6px 12px;
  }

  .search-section {
    margin-bottom: 20px;
  }

  .empty-state-premium.empty-mobile {
    padding: 30px 16px;
  }

  .form-section-premium {
    margin-top: 32px;
    padding-top: 16px;
  }

  .app-form-container.mobile-form {
    padding: 12px;
  }

  .form-row-grid.mobile-grid {
    grid-template-columns: 1fr;
  }

  .modal-container-premium.mobile-modal {
    border-radius: 20px;
  }

  .modal-actions.mobile-actions {
    flex-direction: column;
  }

  .modal-actions.mobile-actions button {
    width: 100%;
  }

  .editor-toolbar.mobile-toolbar {
    flex-wrap: wrap;
  }

  .toast {
    min-width: auto;
    max-width: 90vw;
    padding: 10px 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .apps-board-premium {
    padding: 12px;
    border-radius: 16px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-add-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-card {
    padding: 10px;
  }

  .stat-card i {
    font-size: 20px;
  }

  .stat-value {
    font-size: 18px;
  }

  .app-title-wrap h3 {
    font-size: 15px;
  }

  .app-meta {
    font-size: 10px;
    gap: 8px;
  }

  .tech-stack.mobile-tech {
    padding: 8px 12px;
  }

  .short-description.mobile-desc {
    padding: 8px 12px;
    font-size: 11px;
  }

  .doc-content.mobile-doc {
    padding: 10px 12px;
  }

  .doc-text {
    font-size: 12px;
  }

  .doc-actions.mobile-doc-actions {
    flex-direction: column;
  }

  .doc-action-btn {
    width: 100%;
    justify-content: center;
    padding: 8px;
  }

  .app-footer.mobile-footer {
    gap: 6px;
  }

  .badge-version,
  .badge-downloads,
  .badge-rating,
  .badge-docs {
    font-size: 9px;
    padding: 2px 8px;
  }

  .search-input {
    font-size: 13px;
    padding: 10px 12px 10px 36px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-group input,
  .form-group textarea {
    font-size: 15px;
    padding: 10px 12px;
  }

  .doc-textarea.mobile-textarea {
    font-size: 14px;
    padding: 8px 10px;
  }

  .modal-header h2 {
    font-size: 16px;
  }

  .modal-icon {
    font-size: 24px;
  }

  .empty-state-premium i {
    font-size: 40px;
  }

  .empty-state-premium h4 {
    font-size: 15px;
  }
}
</style>