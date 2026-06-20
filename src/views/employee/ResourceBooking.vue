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
            <span>Book Resource</span>
          </div>
          <div class="mobile-stats-badge">
            <span>{{ resources.length }}</span>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div>
              <h1>Book a Resource</h1>
              <p class="subtitle-modern">Schedule and manage resource bookings</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-cubes"></i>
            <span>{{ resources.length }} Resources Available</span>
          </div>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card" @click="filterBookings('all')">
            <i class="fas fa-bookmark"></i>
            <div class="stat-info">
              <span class="stat-value">{{ bookings.length }}</span>
              <span class="stat-label">My Bookings</span>
            </div>
          </div>
          <div class="stat-card" @click="filterBookings('active')">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ activeBookings }}</span>
              <span class="stat-label">Active</span>
            </div>
          </div>
        </div>

        <!-- Booking Form Card - Mobile Optimized -->
        <div class="card-premium">
          <div class="card-header-premium" @click="toggleForm">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-plus-circle"></i>
                <span>{{ editId ? 'Edit Booking' : 'Create New Booking' }}</span>
              </div>
              <i class="fas fa-chevron-down form-toggle" :class="{ 'rotated': formVisible }"></i>
            </div>
          </div>

          <div class="form-section" :class="{ 'form-hidden': !formVisible }">
            <div class="form-grid-premium">
              <div class="form-field">
                <label><i class="fas fa-cube"></i> Resource Type <span class="required">*</span></label>
                <div class="field-wrapper">
                  <i class="fas fa-list field-icon"></i>
                  <select v-model="form.resource_type" required>
                    <option disabled value="">Select Resource</option>
                    <option v-for="resource in resources" :key="resource.id" :value="resource.name">
                      {{ resource.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-field full-width">
                <label><i class="fas fa-tasks"></i> Purpose</label>
                <div class="field-wrapper">
                  <i class="fas fa-comment field-icon" style="top: 18px;"></i>
                  <textarea v-model="form.purpose" rows="3" placeholder="Reason for booking"></textarea>
                </div>
              </div>

              <div class="form-field">
                <label><i class="fas fa-calendar-alt"></i> From <span class="required">*</span></label>
                <div class="field-wrapper">
                  <i class="fas fa-calendar field-icon"></i>
                  <input type="datetime-local" v-model="form.from_date" required />
                </div>
              </div>

              <div class="form-field">
                <label><i class="fas fa-calendar-alt"></i> To <span class="required">*</span></label>
                <div class="field-wrapper">
                  <i class="fas fa-calendar-check field-icon"></i>
                  <input type="datetime-local" v-model="form.to_date" required />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-submit-premium" @click="submitBooking" :disabled="loading">
                <span v-if="loading">
                  <i class="fas fa-spinner fa-spin"></i> Processing...
                </span>
                <span v-else>
                  <i class="fas fa-save"></i> {{ editId ? 'Update' : 'Book' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- My Bookings Card -->
        <div class="card-premium">
          <div class="card-header-premium">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-list-ul"></i>
                <span>My Bookings</span>
                <span class="record-count-mobile" v-if="isMobile">{{ filteredBookings.length }}</span>
              </div>
            </div>
            <div class="table-info desktop-only">
              <i class="fas fa-file-alt"></i>
              <span>{{ bookings.length }} records</span>
            </div>
          </div>

          <!-- Mobile Search -->
          <div class="search-bar-mobile" v-if="isMobile && bookings.length > 0">
            <div class="search-group-mobile">
              <i class="fas fa-search"></i>
              <input type="text" v-model="searchQuery" placeholder="Search bookings..." class="search-input-mobile" />
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="b in filteredBookings" :key="b.id" class="booking-card">
              <div class="card-header">
                <div class="card-resource">
                  <span class="resource-badge-mobile">
                    <i class="fas fa-cube"></i>
                    {{ b.resource_type }}
                  </span>
                </div>
                <div class="card-actions">
                  <button class="action-btn-mobile edit" @click="editBooking(b)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn-mobile delete" @click="deleteBooking(b.id)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-calendar-alt"></i> From</span>
                  <span class="card-value">
                    <span class="date">{{ formatDate(b.from_date) }}</span>
                    <span class="time">{{ formatTime(b.from_date) }}</span>
                  </span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-calendar-check"></i> To</span>
                  <span class="card-value">
                    <span class="date">{{ formatDate(b.to_date) }}</span>
                    <span class="time">{{ formatTime(b.to_date) }}</span>
                  </span>
                </div>
                <div class="card-row" v-if="b.purpose">
                  <span class="card-label"><i class="fas fa-comment"></i> Purpose</span>
                  <span class="card-value purpose-text">{{ b.purpose }}</span>
                </div>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="filteredBookings.length === 0" class="empty-state-mobile">
              <i class="fas fa-calendar-times"></i>
              <h4>{{ searchQuery ? 'No Matching Bookings' : 'No Bookings Found' }}</h4>
              <p>{{ searchQuery ? 'Try adjusting your search' : 'Create your first booking using the form above' }}</p>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-wrapper-premium" v-else>
            <table class="booking-table-premium">
              <thead>
                <tr>
                  <th>Resource Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Purpose</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in filteredBookings" :key="b.id" class="booking-row">
                  <td class="resource-cell">
                    <span class="resource-badge">
                      <i class="fas fa-cube"></i>
                      {{ b.resource_type }}
                    </span>
                  </td>
                  <td class="datetime-cell">
                    <div class="datetime-block">
                      <span class="date">{{ formatDate(b.from_date) }}</span>
                      <span class="time">{{ formatTime(b.from_date) }}</span>
                    </div>
                  </td>
                  <td class="datetime-cell">
                    <div class="datetime-block">
                      <span class="date">{{ formatDate(b.to_date) }}</span>
                      <span class="time">{{ formatTime(b.to_date) }}</span>
                    </div>
                  </td>
                  <td class="purpose-cell" :title="b.purpose">
                    {{ truncateText(b.purpose, 50) }}
                  </td>
                  <td class="action-cell">
                    <div class="action-group">
                      <button class="action-icon edit" @click="editBooking(b)" title="Edit Booking">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="action-icon delete" @click="deleteBooking(b.id)" title="Delete Booking">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Desktop Empty State -->
                <tr v-if="filteredBookings.length === 0" class="empty-row">
                  <td colspan="5">
                    <div class="empty-state-premium">
                      <i class="fas fa-calendar-times"></i>
                      <h4>No Bookings Found</h4>
                      <p>Create your first booking using the form above</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

const api = axios.create({
  baseURL: 'https://employees.archenterprises.co.in/api',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    Accept: 'application/json'
  }
})

export default {
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      formVisible: false,
      searchQuery: '',
      filterType: 'all',
      resources: [],
      bookings: [],
      editId: null,
      loading: false,
      form: {
        resource_type: '',
        resource_name: '',
        from_date: '',
        to_date: '',
        purpose: ''
      }
    }
  },

  computed: {
    activeBookings() {
      const now = new Date();
      return this.bookings.filter(b => new Date(b.to_date) > now).length;
    },
    filteredBookings() {
      let filtered = this.bookings;
      
      // Status filter
      if (this.filterType === 'active') {
        const now = new Date();
        filtered = filtered.filter(b => new Date(b.to_date) > now);
      }
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(b => 
          b.resource_type.toLowerCase().includes(query) ||
          (b.purpose && b.purpose.toLowerCase().includes(query))
        );
      }
      
      return filtered;
    }
  },

  methods: {
    toggleForm() {
      if (this.isMobile) {
        this.formVisible = !this.formVisible;
      }
    },
    filterBookings(type) {
      this.filterType = this.filterType === type ? 'all' : type;
    },
    truncateText(text, length) {
      if (!text) return '—';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },

    formatDate(datetime) {
      if (!datetime) return '—';
      return new Date(datetime).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },

    formatTime(datetime) {
      if (!datetime) return '—';
      return new Date(datetime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },

    fetchResources() {
      axios.get("/api/resources")
        .then(response => {
          this.resources = response.data;
        })
        .catch(error => {
          console.error("Error fetching resources:", error);
          toastError("No resources found for your account");
        });
    },

    async fetchBookings() {
      try {
        const res = await api.get('/api/resource-bookings')
        this.bookings = res.data
      } catch (e) {
        console.error('Fetch failed', e)
        toastError('No bookings found for your account')
      }
    },

    async submitBooking() {
      if (!this.form.resource_type || !this.form.from_date || !this.form.to_date) {
        toastWarning('Please fill all required fields');
        return;
      }

      if (new Date(this.form.from_date) >= new Date(this.form.to_date)) {
        toastWarning('From date must be before to date');
        return;
      }

      this.loading = true
      try {
        if (this.editId) {
          await api.put(`/api/resource-bookings/${this.editId}`, this.form)
          toastSuccess('Booking updated successfully!')
        } else {
          await api.post('/api/resource-bookings', this.form)
          toastSuccess('Booking created successfully!')
        }

        this.resetForm()
        this.fetchBookings()
        if (this.isMobile) {
          this.formVisible = false
        }
      } catch (e) {
        toastError(e.response?.data?.message || 'Something went wrong')
      } finally {
        this.loading = false
      }
    },

    editBooking(b) {
      this.editId = b.id
      this.form = {
        resource_type: b.resource_type,
        resource_name: b.resource_name || '',
        from_date: b.from_date.replace(' ', 'T'),
        to_date: b.to_date.replace(' ', 'T'),
        purpose: b.purpose || ''
      }
      if (this.isMobile) {
        this.formVisible = true
        this.searchQuery = ''
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    async deleteBooking(id) {
      if (!confirm('Are you sure you want to delete this booking?')) return

      try {
        await api.delete(`/api/resource-bookings/${id}`)
        this.fetchBookings()
        toastSuccess('Booking deleted successfully!')
      } catch (e) {
        toastError(e.response?.data?.message || 'Delete failed')
      }
    },

    resetForm() {
      this.editId = null
      this.form = {
        resource_type: '',
        resource_name: '',
        from_date: '',
        to_date: '',
        purpose: ''
      }
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  },

  mounted() {
    this.fetchResources();
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
      return
    }

    this.fetchBookings()
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
  margin-top: 0;
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

.mobile-stats-badge {
  background: var(--primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
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
  margin-bottom: 28px;
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

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Card Premium */
.card-premium {
  background: white;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.card-header-premium {
  cursor: pointer;
}

.section-title-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-weight: 600;
  color: #1a1a2e;
  width: 100%;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title-modern i {
  color: var(--primary-color);
}

.form-toggle {
  transition: transform 0.3s ease;
  font-size: 14px;
  color: #9ca3af;
}

.form-toggle.rotated {
  transform: rotate(180deg);
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.record-count-mobile {
  background: var(--primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 4px;
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.3s ease;
}

.form-section.form-hidden {
  display: none;
}

.form-grid-premium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
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

.required {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
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

/* Search Bar - Mobile */
.search-bar-mobile {
  display: none;
  margin-bottom: 16px;
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

/* Table Styles */
.table-wrapper-premium {
  overflow-x: auto;
}

.booking-table-premium {
  width: 100%;
  border-collapse: collapse;
}

.booking-table-premium thead {
  background: #f8fafc;
}

.booking-table-premium th {
  text-align: left;
  padding: 14px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.booking-table-premium td {
  padding: 14px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.booking-row {
  transition: all 0.3s ease;
}

.booking-row:hover {
  background: #fafbfc;
}

/* Resource Cell */
.resource-cell {
  min-width: 130px;
}

.resource-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Datetime Cell */
.datetime-cell {
  min-width: 110px;
}

.datetime-block {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.datetime-block .date {
  font-weight: 600;
  font-size: 12px;
  color: #1a1a2e;
}

.datetime-block .time {
  font-size: 11px;
  color: #6b7280;
}

/* Purpose Cell */
.purpose-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #6b7280;
}

/* Action Group */
.action-cell {
  min-width: 80px;
}

.action-group {
  display: flex;
  gap: 8px;
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

.action-icon.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-icon.edit:hover {
  background: #c7d2fe;
  transform: translateY(-2px);
}

.action-icon.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-icon.delete:hover {
  background: #fecaca;
  transform: translateY(-2px);
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.booking-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-resource {
  flex: 1;
}

.resource-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn-mobile {
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

.action-btn-mobile.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-btn-mobile.edit:active {
  transform: scale(0.9);
}

.action-btn-mobile.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-btn-mobile.delete:active {
  transform: scale(0.9);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 50px;
}

.card-value {
  font-size: 13px;
  color: var(--dark);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.card-value .date {
  font-weight: 600;
  font-size: 12px;
}

.card-value .time {
  font-size: 11px;
  color: #6b7280;
}

.purpose-text {
  font-size: 12px;
  color: #6b7280;
  max-width: 60%;
  text-align: right;
  word-break: break-word;
}

/* Empty States */
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

.empty-state-mobile {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state-mobile i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-mobile h4 {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 6px;
}

.empty-state-mobile p {
  font-size: 13px;
}

/* Responsive */
@media (max-width: 1024px) {
  .form-grid-premium {
    grid-template-columns: 1fr;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .purpose-cell {
    max-width: 150px;
  }
}

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
    grid-template-columns: repeat(2, 1fr);
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
    font-size: 22px;
  }

  .stat-label {
    font-size: 11px;
  }

  .card-premium {
    padding: 16px;
    border-radius: 20px;
  }

  .form-grid-premium {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .field-wrapper input,
  .field-wrapper select,
  .field-wrapper textarea {
    font-size: 16px;
    padding: 10px 12px 10px 36px;
  }

  .form-actions {
    justify-content: stretch;
  }

  .btn-submit-premium {
    width: 100%;
    justify-content: center;
  }

  .search-bar-mobile {
    display: block;
  }

  .table-wrapper-premium {
    display: none;
  }

  .mobile-cards {
    display: flex;
  }

  .card-header-premium {
    margin-bottom: 12px;
  }

  .section-title-modern {
    font-size: 14px;
  }

  .table-info {
    display: none;
  }

  .booking-card {
    padding: 14px;
  }

  .card-row {
    flex-wrap: wrap;
  }

  .purpose-text {
    max-width: 100%;
    text-align: left;
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

  .stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-card i {
    font-size: 20px;
  }

  .stat-value {
    font-size: 18px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-stats-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .card-premium {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .card-actions {
    align-self: flex-end;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .card-value {
    align-items: flex-start;
    width: 100%;
  }

  .purpose-text {
    max-width: 100%;
    text-align: left;
  }

  .field-wrapper input,
  .field-wrapper select,
  .field-wrapper textarea {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }

  .search-input-mobile {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }

  .empty-state-mobile i {
    font-size: 40px;
  }

  .empty-state-mobile h4 {
    font-size: 15px;
  }
}

@media (max-width: 380px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: row;
    text-align: left;
  }
}

/* Utility Classes */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
}
</style>