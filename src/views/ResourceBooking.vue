<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
         
          <div class="mobile-title">
            <i class="fas fa-calendar-check"></i>
            <span>Resources</span>
          </div>
          <button class="mobile-add-btn" @click="showAddModal = true">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div>
              <h1>Resource Booking</h1>
              <p class="subtitle-modern">Manage and track resource bookings</p>
            </div>
          </div>
          <button class="register-btn-modern" @click="showAddModal = true">
            <i class="fas fa-plus-circle"></i>
            <span>Add New Resource</span>
          </button>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card" @click="filterByStatus('all')">
            <i class="fas fa-cubes"></i>
            <div class="stat-info">
              <span class="stat-value">{{ resources.length }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
          <div class="stat-card" @click="filterByStatus('available')">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ availableCount }}</span>
              <span class="stat-label">Available</span>
            </div>
          </div>
          <div class="stat-card" @click="filterByStatus('booked')">
            <i class="fas fa-bookmark"></i>
            <div class="stat-info">
              <span class="stat-value">{{ bookedCount }}</span>
              <span class="stat-label">Booked</span>
            </div>
          </div>
        </div>

        <!-- Search - Mobile -->
        <div class="search-bar-mobile" v-if="isMobile && resources.length > 0">
          <div class="search-group-mobile">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Search resources..." class="search-input-mobile" />
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loadingResources" class="loading-container">
          <div class="spinner"></div>
          <p>Loading resources...</p>
        </div>

        <!-- Resource Cards Grid - Mobile Optimized -->
        <div v-else class="resources-grid">
          <div
            v-for="resource in filteredResources"
            :key="resource.id"
            class="resource-card-premium"
            :class="{ 'booked': resource.status === 'booked', 'mobile-card': isMobile }"
          >
            <div class="card-glow"></div>
            <div class="resource-header-premium">
              <div class="resource-icon">
                <i class="fas fa-laptop"></i>
              </div>
              <div class="resource-info">
                <h3>{{ truncateText(resource.resource_type, isMobile ? 20 : 30) }}</h3>
                <span class="status-badge-premium" :class="resource.status === 'booked' ? 'booked' : 'available'">
                  <i :class="resource.status === 'booked' ? 'fas fa-clock' : 'fas fa-check-circle'"></i>
                  {{ resource.status === 'booked' ? 'Booked' : 'Available' }}
                </span>
              </div>
            </div>

            <div class="resource-details">
              <div class="detail-item">
                <i class="fas fa-user"></i>
                <div>
                  <span class="detail-label">Booked By</span>
                  <p class="detail-value">{{ resource.user?.name || 'Not assigned' }}</p>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-calendar-alt"></i>
                <div>
                  <span class="detail-label">From Date</span>
                  <p class="detail-value">{{ formatDate(resource.from_date) }}</p>
                </div>
              </div>
              <div class="detail-item" v-if="!isMobile">
                <i class="fas fa-calendar-check"></i>
                <div>
                  <span class="detail-label">To Date</span>
                  <p class="detail-value">{{ formatDate(resource.to_date) }}</p>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-tasks"></i>
                <div>
                  <span class="detail-label">Purpose</span>
                  <p class="detail-value">{{ resource.purpose || 'Not specified' }}</p>
                </div>
              </div>
            </div>

            <button class="btn-book-premium" disabled>
              <i class="fas fa-check"></i> Already Booked
            </button>
          </div>

          <!-- Empty State - Mobile Optimized -->
          <div v-if="filteredResources.length === 0" class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
            <i class="fas fa-box-open"></i>
            <h4>{{ searchQuery ? 'No Matching Resources' : 'No Resources Found' }}</h4>
            <p>{{ searchQuery ? 'Try adjusting your search' : 'Click "Add New Resource" to create your first resource' }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Booking Confirmation Modal - Mobile Optimized -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
        <div class="premium-modal success-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          <div class="modal-header-premium">
            <div class="header-icon-premium success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="header-text">
              <h2>Booking Confirmed!</h2>
              <p>Resource booked successfully</p>
            </div>
            <button class="close-btn-premium" @click="showModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body-premium">
            <div class="confirmation-message">
              <i class="fas fa-calendar-check"></i>
              <p>You have successfully booked <strong>{{ bookedResourceName }}</strong>.</p>
              <p class="small-text">The resource has been reserved for your use.</p>
            </div>
          </div>
          <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
            <button class="btn-submit-premium" @click="showModal = false">
              <i class="fas fa-check"></i> Done
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Add Resource Modal - Mobile Optimized -->
    <transition name="modal-fade">
      <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
        <div class="premium-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-plus-circle"></i>
            </div>
            <div class="header-text">
              <h2>{{ isMobile ? 'Add Resource' : 'Add New Resource' }}</h2>
              <p>{{ isMobile ? 'Create a new bookable resource' : 'Create a new bookable resource' }}</p>
            </div>
            <button class="close-btn-premium" @click="showAddModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <form @submit.prevent="addResource">
              <div class="form-section">
                <div class="form-field">
                  <label>Resource Name <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-tag field-icon"></i>
                    <input 
                      v-model="newResource.name" 
                      type="text" 
                      placeholder="e.g., Conference Room A, Projector"
                      required 
                    />
                  </div>
                </div>

                <div class="form-field full-width">
                  <label>Description</label>
                  <div class="field-wrapper">
                    <i class="fas fa-align-left field-icon" style="top: 18px;"></i>
                    <textarea 
                      v-model="newResource.description" 
                      placeholder="Enter resource description (optional)"
                      rows="3"
                    ></textarea>
                  </div>
                </div>

                <div class="form-field" v-if="!isMobile">
                  <label>Status</label>
                  <div class="field-wrapper">
                    <i class="fas fa-toggle-on field-icon"></i>
                    <select v-model="newResource.available">
                      <option :value="1">Available</option>
                      <option :value="0">Booked</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
                <button type="button" class="btn-cancel-premium" @click="showAddModal = false">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn-submit-premium">
                  <i class="fas fa-save"></i> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loadingResources: true,
      resources: [],
      showModal: false,
      bookedResourceName: '',
      showAddModal: false,
      searchQuery: '',
      statusFilter: 'all',
      newResource: {
        name: '',
        description: '',
        available: 1
      }
    }
  },

  computed: {
    availableCount() {
      return this.resources.filter(r => r.status === 'available').length
    },
    bookedCount() {
      return this.resources.filter(r => r.status === 'booked').length
    },
    filteredResources() {
      let filtered = this.resources;
      
      // Status filter
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === this.statusFilter);
      }
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
          r.resource_type.toLowerCase().includes(query) ||
          (r.purpose && r.purpose.toLowerCase().includes(query)) ||
          (r.user?.name && r.user.name.toLowerCase().includes(query))
        );
      }
      
      return filtered;
    }
  },

  methods: {
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? 'all' : status;
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    formatDate(date) {
      if (!date) return 'Not specified'
      return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    async addResource() {
      if (!this.newResource.name) {
        toastWarning('Please enter resource name')
        return
      }

      try {
        await axios.post('/api/resource-booking', {
          name: this.newResource.name,
          description: this.newResource.description
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        this.showAddModal = false
        this.newResource = { name: '', description: '', available: 1 }
        toastSuccess('Resource added successfully!')
        this.fetchResources()
      } catch (error) {
        console.error(error)
        toastError('Failed to add resource')
      }
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    async fetchResources() {
      this.loadingResources = true
      try {
        const response = await axios.get('/api/resource-bookings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.resources = response.data
      } catch (error) {
        console.error(error)
        toastError('Failed to load resources')
      } finally {
        this.loadingResources = false
      }
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchResources()

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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

/* Search Bar - Mobile */
.search-bar-mobile {
  display: none;
  margin-bottom: 20px;
  padding: 0 4px;
}

.search-group-mobile {
  position: relative;
  flex: 1;
}

.search-group-mobile i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input-mobile {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}

.search-input-mobile:focus {
  outline: none;
  border-color: var(--primary-color);
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
  font-size: 22px;
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

.register-btn-modern {
  padding: 12px 24px;
  background: var(--primary);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.register-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
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

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card:active {
  transform: scale(0.97);
}

.stat-card i {
  font-size: 36px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Resources Grid */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

/* Resource Card Premium */
.resource-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.resource-card-premium.mobile-card {
  padding: 16px;
  border-radius: 16px;
}

.resource-card-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

.resource-card-premium.booked::before {
  background: var(--danger);
}

.resource-card-premium:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.15);
}

.resource-card-premium.mobile-card:active {
  transform: scale(0.98);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(102, 126, 234, 0.05), transparent);
  pointer-events: none;
}

/* Resource Header */
.resource-header-premium {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.mobile-card .resource-header-premium {
  margin-bottom: 14px;
  gap: 12px;
}

.resource-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 20px;
}

.mobile-card .resource-icon {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.resource-info {
  flex: 1;
}

.resource-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px 0;
}

.mobile-card .resource-info h3 {
  font-size: 15px;
}

.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.mobile-card .status-badge-premium {
  font-size: 10px;
  padding: 3px 10px;
}

.status-badge-premium.available {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-premium.booked {
  background: #fee2e2;
  color: #991b1b;
}

/* Resource Details */
.resource-details {
  margin-bottom: 20px;
}

.mobile-card .resource-details {
  margin-bottom: 14px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.mobile-card .detail-item {
  margin-bottom: 10px;
  gap: 10px;
}

.detail-item i {
  width: 20px;
  color: var(--primary-color);
  font-size: 14px;
  margin-top: 2px;
}

.mobile-card .detail-item i {
  font-size: 13px;
  width: 18px;
}

.detail-item > div {
  flex: 1;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 2px;
}

.mobile-card .detail-label {
  font-size: 10px;
}

.detail-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.mobile-card .detail-value {
  font-size: 13px;
}

/* Book Button */
.btn-book-premium {
  width: 100%;
  padding: 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  cursor: not-allowed;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0.7;
}

.mobile-card .btn-book-premium {
  padding: 10px;
  font-size: 13px;
  border-radius: 12px;
}

/* Empty States */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  grid-column: 1 / -1;
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

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.premium-modal {
  position: relative;
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 550px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.premium-modal.mobile-modal {
  max-width: 95%;
  border-radius: 24px;
  max-height: 90vh;
}

.premium-modal.success-modal {
  max-width: 450px;
}

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

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

/* Modal Header */
.modal-header-premium {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.mobile-modal .modal-header-premium {
  padding: 16px 20px;
  gap: 12px;
}

.header-icon-premium {
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

.mobile-modal .header-icon-premium {
  width: 40px;
  height: 40px;
  font-size: 18px;
}

.header-icon-premium.success-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.mobile-modal .header-text h2 {
  font-size: 18px;
}

.header-text p {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.mobile-modal .header-text p {
  font-size: 12px;
}

.close-btn-premium {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.close-btn-premium:hover {
  background: var(--danger);
  color: white;
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body-premium {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: #fafbfc;
}

.mobile-modal .modal-body-premium {
  padding: 16px;
}

.modal-body-premium::-webkit-scrollbar {
  width: 6px;
}

.modal-body-premium::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 10px;
}

.modal-body-premium::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

/* Confirmation Message */
.confirmation-message {
  text-align: center;
  padding: 20px;
}

.mobile-modal .confirmation-message {
  padding: 12px;
}

.confirmation-message i {
  font-size: 64px;
  color: var(--success);
  margin-bottom: 20px;
}

.mobile-modal .confirmation-message i {
  font-size: 48px;
}

.confirmation-message p {
  font-size: 16px;
  color: #374151;
  margin-bottom: 10px;
}

.mobile-modal .confirmation-message p {
  font-size: 14px;
}

.confirmation-message .small-text {
  font-size: 13px;
  color: #6b7280;
}

.mobile-modal .confirmation-message .small-text {
  font-size: 12px;
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mobile-modal .form-section {
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
}

.mobile-modal .form-field.full-width {
  grid-column: span 1;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.mobile-modal .form-field label {
  font-size: 12px;
}

.required-star {
  color: var(--danger);
}

.field-wrapper {
  position: relative;
}

.field-wrapper .field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.field-wrapper textarea + .field-icon {
  top: 18px;
  transform: none;
}

.field-wrapper input,
.field-wrapper select,
.field-wrapper textarea {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.mobile-modal .field-wrapper input,
.mobile-modal .field-wrapper select,
.mobile-modal .field-wrapper textarea {
  font-size: 16px;
  padding: 10px 12px 10px 36px;
}

.field-wrapper textarea {
  padding-top: 12px;
  resize: vertical;
}

.field-wrapper input:focus,
.field-wrapper select:focus,
.field-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Modal Footer */
.modal-footer-premium {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.modal-footer-premium.mobile-footer {
  flex-direction: column;
  padding: 16px 20px;
}

.btn-cancel-premium,
.btn-submit-premium {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  border: none;
}

.mobile-footer .btn-cancel-premium,
.mobile-footer .btn-submit-premium {
  padding: 14px;
}

.btn-cancel-premium {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel-premium:hover {
  background: #e5e7eb;
}

.btn-submit-premium {
  background: var(--primary);
  color: white;
}

.btn-submit-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .content {
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
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
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
    font-size: 18px;
  }

  .stat-label {
    font-size: 10px;
  }

  .search-bar-mobile {
    display: block;
  }

  .resources-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .resource-card-premium.mobile-card {
    padding: 16px;
  }

  .premium-modal {
    max-width: 95%;
  }

  .modal-header-premium {
    padding: 16px 20px;
  }

  .modal-body-premium {
    padding: 16px;
  }

  .modal-footer-premium {
    padding: 16px 20px;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .content {
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
    font-size: 16px;
  }

  .resource-card-premium.mobile-card {
    padding: 12px;
  }

  .resource-header-premium {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .resource-info h3 {
    font-size: 14px;
  }

  .detail-item {
    flex-direction: column;
    gap: 4px;
  }

  .detail-item i {
    display: none;
  }

  .detail-label {
    font-size: 10px;
  }

  .detail-value {
    font-size: 12px;
  }

  .btn-book-premium {
    padding: 10px;
    font-size: 12px;
  }

  .empty-state-premium {
    padding: 30px 16px;
  }

  .empty-state-premium i {
    font-size: 40px;
  }

  .empty-state-premium h4 {
    font-size: 15px;
  }

  .search-input-mobile {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }

  .modal-footer-premium.mobile-footer button {
    width: 100%;
  }
}
</style>