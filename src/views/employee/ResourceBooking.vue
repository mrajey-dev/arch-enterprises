<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- 📱 Mobile Top Navigation Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-calendar-check text-teal"></i>
            <span>Resource Booking</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-mobile-action" @click="toggleForm" :title="formVisible ? 'Hide Form' : 'New Booking'">
              <i class="fas" :class="formVisible ? 'fa-chevron-up' : 'fa-plus'"></i>
            </button>
            <button class="btn-mobile-menu" @click="toggleSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Header Banner -->
        <header class="executive-header">
          <div class="header-main">
            <div class="header-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>ARCH ASSET CONCIERGE</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-cube text-teal"></i> Equipment & Room Reservations
              </span>
            </div>
            <div class="title-with-icon">
              <div class="header-icon-box">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div>
                <h1 class="header-title">Book Company Resources</h1>
                <p class="header-subtitle">
                  Reserve meeting rooms, testing hardware, projection units, and company vehicles seamlessly
                </p>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button class="btn-secondary-action" @click="fetchBookings" :disabled="loadingBookings" title="Reload bookings">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingBookings }"></i>
              <span>Refresh</span>
            </button>
            <button class="btn-primary-action" @click="focusBookingForm">
              <i class="fas fa-plus"></i>
              <span>{{ editId ? 'Edit Booking' : 'New Booking' }}</span>
            </button>
          </div>
        </header>

        <!-- 📊 KPI Metrics Grid -->
        <section class="metrics-grid">
          <!-- Available Pool -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">Resource Pool</span>
              <div class="metric-icon-wrap icon-pool">
                <i class="fas fa-cubes"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ resources.length }}</span>
              <span class="metric-tag tag-pool">Ready to book</span>
            </div>
          </div>

          <!-- Active & Upcoming -->
          <div class="metric-card card-active-res" :class="{ 'card-active': filterType === 'active' }" @click="filterType = 'active'">
            <div class="metric-header">
              <span class="metric-title">Active & Upcoming</span>
              <div class="metric-icon-wrap icon-active">
                <i class="fas fa-calendar-check"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ activeBookingsCount }}</span>
              <span class="metric-tag tag-active">Scheduled</span>
            </div>
          </div>

          <!-- Past Reservations -->
          <div class="metric-card card-past-res" :class="{ 'card-active': filterType === 'past' }" @click="filterType = 'past'">
            <div class="metric-header">
              <span class="metric-title">Past Reservations</span>
              <div class="metric-icon-wrap icon-past">
                <i class="fas fa-history"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ pastBookingsCount }}</span>
              <span class="metric-tag tag-past">Completed</span>
            </div>
          </div>

          <!-- Total Reservations -->
          <div class="metric-card card-total-res" :class="{ 'card-active': filterType === 'all' }" @click="filterType = 'all'">
            <div class="metric-header">
              <span class="metric-title">My Total Bookings</span>
              <div class="metric-icon-wrap icon-total">
                <i class="fas fa-bookmark"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ myBookings.length }}</span>
              <span class="metric-tag tag-total">All records</span>
            </div>
          </div>
        </section>

        <!-- 🚀 Quick Resource Catalog Cards Grid -->
        <div class="catalog-section" v-if="resources.length > 0">
          <div class="section-header-row">
            <div class="sec-title-wrap">
              <div class="sec-icon-box">
                <i class="fas fa-layer-group text-teal"></i>
              </div>
              <div>
                <h3 class="sec-heading">Available Company Resources</h3>
                <span class="sec-sub">Click any asset below to select and autofill reservation details</span>
              </div>
            </div>
            <span class="sec-hint desktop-only">
              <i class="fas fa-mouse-pointer"></i> Instant Select
            </span>
          </div>

          <div class="catalog-cards-grid">
            <div 
              v-for="res in resources" 
              :key="res.id" 
              class="quick-resource-card"
              :class="{ selected: form.resource_type === res.name }"
              @click="selectQuickResource(res.name)"
            >
              <div class="quick-icon" :style="getResourceStyle(res.name)">
                <i :class="getResourceIcon(res.name)"></i>
              </div>
              <div class="quick-text">
                <h4 class="quick-title">{{ res.name }}</h4>
                <p class="quick-desc">{{ res.description || 'Ready for reservation' }}</p>
              </div>
              <div class="quick-book-action">
                <span class="btn-quick-select" :class="{ 'is-selected': form.resource_type === res.name }">
                  <i class="fas" :class="form.resource_type === res.name ? 'fa-check' : 'fa-arrow-right'"></i>
                  <span>{{ form.resource_type === res.name ? 'Selected' : 'Book Now' }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 📝 Booking Form Container (Collapsible Card) -->
        <div class="booking-form-card" id="bookingFormSection" :class="{ 'form-card-editing': editId }">
          <div class="form-header" @click="toggleForm">
            <div class="form-header-left">
              <div class="form-icon-circle" :class="editId ? 'icon-amber' : 'icon-teal'">
                <i class="fas" :class="editId ? 'fa-edit' : 'fa-calendar-plus'"></i>
              </div>
              <div>
                <h2 class="form-title">{{ editId ? 'Modify Reservation' : 'Create a New Resource Booking' }}</h2>
                <p class="form-sub">{{ editId ? 'Update your booking dates, duration, or purpose' : 'Select asset, time slot, duration preset, and meeting context' }}</p>
              </div>
            </div>
            <button class="btn-toggle-form" :title="formVisible ? 'Collapse' : 'Expand'">
              <i class="fas fa-chevron-down" :class="{ 'rotated': !formVisible }"></i>
            </button>
          </div>

          <transition name="expand-form">
            <div v-if="formVisible" class="form-body">
              <form @submit.prevent="submitBooking">
                <div class="form-grid-layout">
                  <!-- Resource Selection -->
                  <div class="form-group-modern full-span">
                    <label class="input-label">
                      <span>Select Resource Asset</span>
                      <span class="req">*</span>
                    </label>
                    <div class="custom-select-wrapper">
                      <i class="fas fa-cube select-icon"></i>
                      <select v-model="form.resource_type" required class="form-input select-input">
                        <option disabled value="">Choose a resource from the company fleet...</option>
                        <option v-for="r in resources" :key="r.id" :value="r.name">{{ r.name }}</option>
                      </select>
                    </div>
                  </div>

                  <!-- Quick Duration Helpers -->
                  <div class="form-group-modern full-span">
                    <label class="input-label">
                      <span>Quick Duration Presets</span>
                      <small class="hint-small">(Auto-adjusts To Date based on duration)</small>
                    </label>
                    <div class="duration-presets">
                      <button type="button" class="preset-pill" @click="applyDurationPreset(1)">+ 1 Hour</button>
                      <button type="button" class="preset-pill" @click="applyDurationPreset(2)">+ 2 Hours</button>
                      <button type="button" class="preset-pill" @click="applyDurationPreset(4)">Half Day (4h)</button>
                      <button type="button" class="preset-pill" @click="applyDurationPreset(8)">Full Day (8h)</button>
                      <button type="button" class="preset-pill" @click="applyDurationPreset(24)">Tomorrow</button>
                    </div>
                  </div>

                  <!-- From Datetime -->
                  <div class="form-group-modern">
                    <label class="input-label">
                      <span>From Date & Time</span>
                      <span class="req">*</span>
                    </label>
                    <div class="input-field-wrapper">
                      <i class="fas fa-calendar-alt field-icon"></i>
                      <input 
                        type="datetime-local" 
                        v-model="form.from_date" 
                        required 
                        class="form-input" 
                      />
                    </div>
                  </div>

                  <!-- To Datetime -->
                  <div class="form-group-modern">
                    <label class="input-label">
                      <span>To Date & Time</span>
                      <span class="req">*</span>
                    </label>
                    <div class="input-field-wrapper">
                      <i class="fas fa-calendar-check field-icon"></i>
                      <input 
                        type="datetime-local" 
                        v-model="form.to_date" 
                        required 
                        class="form-input" 
                      />
                    </div>
                  </div>

                  <!-- Purpose -->
                  <div class="form-group-modern full-span">
                    <label class="input-label">
                      <span>Purpose / Meeting Agenda</span>
                      <small class="hint-small">(Optional)</small>
                    </label>
                    <div class="input-field-wrapper">
                      <i class="fas fa-comment-dots field-icon textarea-icon"></i>
                      <textarea 
                        v-model="form.purpose" 
                        rows="2" 
                        placeholder="e.g., Client demo, cross-functional sprint planning, site audit..."
                        class="form-input textarea-input"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Live Duration Preview & Form Actions -->
                <div class="form-footer-bar">
                  <div class="duration-live-preview" v-if="calculatedDuration">
                    <i class="fas fa-hourglass-half text-teal"></i>
                    <span>Booking Duration: <strong>{{ calculatedDuration }}</strong></span>
                  </div>
                  <div v-else></div>

                  <div class="action-buttons-group">
                    <button 
                      type="button" 
                      class="btn-form-cancel" 
                      v-if="editId" 
                      @click="resetForm"
                    >
                      <i class="fas fa-times"></i> Cancel Edit
                    </button>
                    <button 
                      type="submit" 
                      class="btn-form-submit" 
                      :disabled="loading"
                    >
                      <i class="fas fa-spinner fa-spin" v-if="loading"></i>
                      <i class="fas fa-check-circle" v-else></i>
                      <span>{{ editId ? 'Update Booking' : 'Confirm & Reserve' }}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </transition>
        </div>

        <!-- 📋 My Bookings Workspace -->
        <div class="my-bookings-card">
          <div class="bookings-header-toolbar">
            <div class="toolbar-left">
              <div class="b-title-wrap">
                <div class="b-icon-box">
                  <i class="fas fa-bookmark text-teal"></i>
                </div>
                <div>
                  <h3 class="b-heading">My Reservations</h3>
                  <span class="b-sub">Manage and review your active and past resource allocations</span>
                </div>
              </div>

              <!-- Filter Tabs -->
              <div class="bookings-tabs">
                <button 
                  class="b-tab" 
                  :class="{ active: filterType === 'all' }" 
                  @click="filterType = 'all'"
                >
                  All ({{ myBookings.length }})
                </button>
                <button 
                  class="b-tab" 
                  :class="{ active: filterType === 'active' }" 
                  @click="filterType = 'active'"
                >
                  <span class="live-pip" v-if="activeBookingsCount > 0"></span>
                  Active & Upcoming ({{ activeBookingsCount }})
                </button>
                <button 
                  class="b-tab" 
                  :class="{ active: filterType === 'past' }" 
                  @click="filterType = 'past'"
                >
                  Past ({{ pastBookingsCount }})
                </button>
              </div>
            </div>

            <!-- Search & Refresh -->
            <div class="toolbar-right">
              <div class="search-wrap">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search my bookings..." 
                  class="search-input"
                />
                <button v-if="searchQuery" class="btn-clear-search" @click="searchQuery = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <button class="btn-refresh-bookings" @click="fetchBookings" :disabled="loadingBookings" title="Refresh">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingBookings }"></i>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loadingBookings" class="state-container">
            <i class="fas fa-circle-notch fa-spin state-spinner text-teal"></i>
            <h4>Loading your reservations...</h4>
            <p>Fetching scheduled assets from database</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredBookings.length === 0" class="state-container empty-state">
            <div class="empty-icon-wrap">
              <i class="fas fa-calendar-times"></i>
            </div>
            <h4>No Bookings Found</h4>
            <p>{{ searchQuery ? 'No bookings matched your search query.' : 'You have not made any bookings in this view yet.' }}</p>
            <button class="btn-book-now-empty" @click="focusBookingForm">
              <i class="fas fa-plus"></i> Book a Resource Now
            </button>
          </div>

          <!-- Bookings Cards Grid -->
          <div v-else class="my-bookings-grid">
            <div 
              v-for="b in filteredBookings" 
              :key="b.id" 
              class="my-booking-card"
              :class="getBookingStatusClass(b)"
            >
              <div class="b-card-top">
                <div class="b-res-info">
                  <div class="b-res-icon" :style="getResourceStyle(b.resource_type)">
                    <i :class="getResourceIcon(b.resource_type)"></i>
                  </div>
                  <div>
                    <h4 class="b-res-name">{{ b.resource_type }}</h4>
                    <span class="b-id-tag">#BK-{{ b.id }}</span>
                  </div>
                </div>

                <span class="b-status-pill" :class="getBookingStatusClass(b)">
                  <span class="status-pulse-dot"></span>
                  <span>{{ getBookingStatusLabel(b) }}</span>
                </span>
              </div>

              <div class="b-time-box">
                <div class="b-time-item">
                  <span class="b-time-lbl"><i class="fas fa-play-circle"></i> From</span>
                  <span class="b-time-val">{{ formatDate(b.from_date) }} • {{ formatTime(b.from_date) }}</span>
                </div>
                <div class="b-time-divider"></div>
                <div class="b-time-item">
                  <span class="b-time-lbl"><i class="fas fa-flag-checkered"></i> To</span>
                  <span class="b-time-val">{{ formatDate(b.to_date) }} • {{ formatTime(b.to_date) }}</span>
                </div>
              </div>

              <div class="b-purpose-row" v-if="b.purpose">
                <i class="fas fa-quote-left purpose-icon"></i>
                <p>{{ b.purpose }}</p>
              </div>

              <div class="b-card-footer">
                <div class="b-duration-tag">
                  <i class="fas fa-clock"></i>
                  <span>{{ calculateDuration(b.from_date, b.to_date) }}</span>
                </div>

                <div class="b-actions-group">
                  <button class="btn-b-action edit" @click="editBooking(b)" title="Edit this booking">
                    <i class="fas fa-pen"></i> <span>Edit</span>
                  </button>
                  <button class="btn-b-action delete" @click="deleteBooking(b.id)" title="Cancel booking">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue'
import { toastSuccess, toastError, toastWarning } from '@/utils/toast.js'

export default {
  name: 'ResourceBookingEmp',
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      formVisible: true,
      searchQuery: '',
      filterType: 'all', // 'all', 'active', 'past'
      resources: [],
      bookings: [],
      editId: null,
      loading: false,
      loadingBookings: false,
      form: {
        resource_type: '',
        from_date: '',
        to_date: '',
        purpose: ''
      }
    }
  },

  computed: {
    myBookings() {
      return this.bookings
    },
    activeBookingsCount() {
      const now = new Date()
      return this.myBookings.filter(b => b.to_date && new Date(b.to_date) >= now).length
    },
    pastBookingsCount() {
      const now = new Date()
      return this.myBookings.filter(b => b.to_date && new Date(b.to_date) < now).length
    },
    filteredBookings() {
      let list = this.myBookings
      const now = new Date()

      if (this.filterType === 'active') {
        list = list.filter(b => b.to_date && new Date(b.to_date) >= now)
      } else if (this.filterType === 'past') {
        list = list.filter(b => b.to_date && new Date(b.to_date) < now)
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase()
        list = list.filter(b => 
          (b.resource_type && b.resource_type.toLowerCase().includes(q)) ||
          (b.purpose && b.purpose.toLowerCase().includes(q))
        )
      }

      return list
    },
    calculatedDuration() {
      if (!this.form.from_date || !this.form.to_date) return ''
      const start = new Date(this.form.from_date)
      const end = new Date(this.form.to_date)
      const diffMs = end - start
      if (isNaN(diffMs) || diffMs <= 0) return ''

      const diffMins = Math.round(diffMs / 60000)
      if (diffMins < 60) return `${diffMins} Minutes`
      const diffHrs = (diffMins / 60).toFixed(1)
      if (parseFloat(diffHrs) < 24) return `${parseFloat(diffHrs)} Hours`
      const diffDays = Math.round(diffMins / (60 * 24))
      return `${diffDays} Day${diffDays === 1 ? '' : 's'}`
    }
  },

  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token') || ''
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json'
        }
      }
    },

    toggleForm() {
      this.formVisible = !this.formVisible
    },

    focusBookingForm() {
      this.formVisible = true
      const el = document.getElementById('bookingFormSection')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    },

    selectQuickResource(name) {
      this.form.resource_type = name
      this.formVisible = true
      
      if (!this.form.from_date) {
        this.applyDurationPreset(2)
      }

      const el = document.getElementById('bookingFormSection')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },

    applyDurationPreset(hours) {
      const now = new Date()
      let start = this.form.from_date ? new Date(this.form.from_date) : new Date(now.getTime() + 15 * 60000)
      if (isNaN(start.getTime()) || start < now) {
        start = new Date(now.getTime() + 15 * 60000)
      }

      const end = new Date(start.getTime() + hours * 3600000)
      this.form.from_date = this.formatToDatetimeLocal(start)
      this.form.to_date = this.formatToDatetimeLocal(end)
    },

    formatToDatetimeLocal(dateObj) {
      const pad = n => (n < 10 ? '0' + n : n)
      const yyyy = dateObj.getFullYear()
      const mm = pad(dateObj.getMonth() + 1)
      const dd = pad(dateObj.getDate())
      const hh = pad(dateObj.getHours())
      const mi = pad(dateObj.getMinutes())
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
    },

    async fetchResources() {
      const endpoints = [
        '/resources',
        '/api/resources',
        'https://employees.archenterprises.co.in/api/resources',
        'https://employees.archenterprises.co.in/api/api/resources'
      ]

      for (const ep of endpoints) {
        try {
          const res = await axios.get(ep, this.getAuthHeaders())
          if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
            this.resources = res.data
            return
          }
        } catch (err) {}
      }

      // Default company fleet fallback
      if (this.resources.length === 0) {
        this.resources = [
          { id: 1, name: 'Company Car', description: 'Official Site Visit & Client Transportation' },
          { id: 2, name: 'Meeting Room', description: 'Conference Room A with VC System' },
          { id: 3, name: 'Projector Screen', description: 'HD Wireless Presentation Projector' },
          { id: 4, name: 'Whiteboard', description: 'Collaboration & Brainstorming Board' }
        ]
      }
    },

    async fetchBookings() {
      this.loadingBookings = true
      const endpoints = [
        '/resource-bookings',
        '/api/resource-bookings',
        'https://employees.archenterprises.co.in/api/resource-bookings',
        'https://employees.archenterprises.co.in/api/api/resource-bookings'
      ]

      for (const ep of endpoints) {
        try {
          const res = await axios.get(ep, this.getAuthHeaders())
          if (res && res.data) {
            const arr = Array.isArray(res.data) ? res.data : (res.data.data || [])
            this.bookings = arr
            break
          }
        } catch (e) {}
      }
      this.loadingBookings = false
    },

    async submitBooking() {
      if (!this.form.resource_type || !this.form.from_date || !this.form.to_date) {
        toastWarning('Please select a Resource and specify both From and To dates.')
        return
      }

      if (new Date(this.form.from_date) >= new Date(this.form.to_date)) {
        toastWarning('From date & time must be earlier than To date & time.')
        return
      }

      this.loading = true
      const payload = {
        resource_type: this.form.resource_type,
        resource_name: this.form.resource_type,
        from_date: this.form.from_date.replace('T', ' '),
        to_date: this.form.to_date.replace('T', ' '),
        purpose: this.form.purpose || ''
      }

      try {
        let success = false
        if (this.editId) {
          const updateEndpoints = [
            `/resource-bookings/${this.editId}`,
            `/api/resource-bookings/${this.editId}`,
            `https://employees.archenterprises.co.in/api/resource-bookings/${this.editId}`
          ]
          for (const ep of updateEndpoints) {
            try {
              await axios.put(ep, payload, this.getAuthHeaders())
              success = true
              break
            } catch (err) {}
          }
          if (success) toastSuccess('Booking updated successfully!')
        } else {
          const storeEndpoints = [
            '/resource-bookings',
            '/api/resource-bookings',
            'https://employees.archenterprises.co.in/api/resource-bookings'
          ]
          for (const ep of storeEndpoints) {
            try {
              await axios.post(ep, payload, this.getAuthHeaders())
              success = true
              break
            } catch (err) {}
          }
          if (success) toastSuccess('Resource reserved successfully!')
        }

        if (success) {
          this.resetForm()
          this.fetchBookings()
        } else {
          toastError('Failed to complete booking. Please try again.')
        }
      } catch (e) {
        toastError('Failed to save booking')
      } finally {
        this.loading = false
      }
    },

    editBooking(b) {
      this.editId = b.id
      this.form = {
        resource_type: b.resource_type || '',
        from_date: b.from_date ? b.from_date.replace(' ', 'T').substring(0, 16) : '',
        to_date: b.to_date ? b.to_date.replace(' ', 'T').substring(0, 16) : '',
        purpose: b.purpose || ''
      }
      this.formVisible = true
      this.focusBookingForm()
    },

    async deleteBooking(id) {
      if (!confirm('Are you sure you want to cancel this booking?')) return

      const deleteEndpoints = [
        `/resource-bookings/${id}`,
        `/api/resource-bookings/${id}`,
        `https://employees.archenterprises.co.in/api/resource-bookings/${id}`
      ]

      let success = false
      for (const ep of deleteEndpoints) {
        try {
          await axios.delete(ep, this.getAuthHeaders())
          success = true
          break
        } catch (e) {}
      }

      if (success) {
        toastSuccess('Booking cancelled successfully!')
        this.fetchBookings()
      } else {
        toastError('Cancel failed')
      }
    },

    resetForm() {
      this.editId = null
      this.form = {
        resource_type: '',
        from_date: '',
        to_date: '',
        purpose: ''
      }
    },

    getBookingStatusClass(b) {
      if (!b.to_date || !b.from_date) return 'completed'
      const now = new Date()
      const start = new Date(b.from_date)
      const end = new Date(b.to_date)

      if (now >= start && now <= end) return 'active-now'
      if (now < start) return 'upcoming'
      return 'completed'
    },

    getBookingStatusLabel(b) {
      if (!b.to_date || !b.from_date) return 'Finished'
      const now = new Date()
      const start = new Date(b.from_date)
      const end = new Date(b.to_date)

      if (now >= start && now <= end) return 'Active Now'
      if (now < start) return 'Upcoming'
      return 'Finished'
    },

    getResourceIcon(name) {
      const n = (name || '').toLowerCase()
      if (n.includes('car') || n.includes('vehicle')) return 'fas fa-car'
      if (n.includes('room') || n.includes('hall') || n.includes('conference')) return 'fas fa-door-open'
      if (n.includes('projector') || n.includes('screen') || n.includes('video')) return 'fas fa-video'
      if (n.includes('whiteboard') || n.includes('board')) return 'fas fa-chalkboard'
      if (n.includes('laptop') || n.includes('macbook') || n.includes('computer')) return 'fas fa-laptop'
      if (n.includes('camera')) return 'fas fa-camera'
      return 'fas fa-cube'
    },

    getResourceStyle(name) {
      const n = (name || '').toLowerCase()
      if (n.includes('car') || n.includes('vehicle')) {
        return { background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }
      }
      if (n.includes('room') || n.includes('hall')) {
        return { background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }
      }
      if (n.includes('projector') || n.includes('screen')) {
        return { background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }
      }
      if (n.includes('whiteboard') || n.includes('board')) {
        return { background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }
      }
      return { background: '#f0fdfa', color: '#0d9488', borderColor: '#ccfbf1' }
    },

    formatDate(dt) {
      if (!dt) return '—'
      try {
        return new Date(dt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (e) {
        return dt
      }
    },

    formatTime(dt) {
      if (!dt) return ''
      try {
        return new Date(dt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return ''
      }
    },

    calculateDuration(from, to) {
      if (!from || !to) return '—'
      const start = new Date(from)
      const end = new Date(to)
      const diffMs = end - start
      if (isNaN(diffMs) || diffMs <= 0) return '—'

      const diffMins = Math.round(diffMs / 60000)
      if (diffMins < 60) return `${diffMins} min`
      const diffHrs = (diffMins / 60).toFixed(1)
      if (parseFloat(diffHrs) < 24) return `${parseFloat(diffHrs)} hrs`
      const diffDays = Math.round(diffMins / (60 * 24))
      return `${diffDays} Day${diffDays === 1 ? '' : 's'}`
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 992
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchResources()
    this.fetchBookings()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* ════════ Master Page Layout ════════ */
.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg-app, #f8fafc);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text, #0f172a);
}

.main-content {
  display: flex;
  flex: 1;
  padding: 20px 28px;
  gap: 24px;
}

.content {
  flex: 1;
  min-width: 0;
  background: transparent;
  overflow-x: hidden;
}

.text-teal { color: #0d9488 !important; }

/* ════════ Mobile Top Header ════════ */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid var(--border, #e2e8f0);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-action {
  background: #0d9488;
  color: #ffffff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.btn-mobile-menu {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

/* ════════ Executive Header Banner ════════ */
.executive-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: #0d9488;
  letter-spacing: 0.6px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.status-meta-pill {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}

.header-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary-action:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border: none;
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
  transition: all 0.15s ease;
}

.btn-primary-action:hover {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  transform: translateY(-1px);
}

/* ════════ KPI Metrics Grid (4 Columns) ════════ */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
}

.metric-card.card-active {
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.metric-card.card-active-res { border-left: 3px solid #10b981; }
.metric-card.card-past-res { border-left: 3px solid #8b5cf6; }
.metric-card.card-total-res { border-left: 3px solid #3b82f6; }

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.metric-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.metric-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.icon-pool { background: #f0fdfa; color: #0d9488; }
.icon-active { background: #ecfdf5; color: #059669; }
.icon-past { background: #f5f3ff; color: #7c3aed; }
.icon-total { background: #eff6ff; color: #2563eb; }

.metric-body {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metric-number {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
}

.metric-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
}

.tag-pool { background: #f0fdfa; color: #0d9488; }
.tag-active { background: #ecfdf5; color: #047857; }
.tag-past { background: #f5f3ff; color: #6d28d9; }
.tag-total { background: #eff6ff; color: #1d4ed8; }

/* ════════ Quick Resource Catalog Section ════════ */
.catalog-section {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sec-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sec-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.sec-heading {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.sec-sub {
  font-size: 12px;
  color: #64748b;
}

.sec-hint {
  font-size: 11.5px;
  font-weight: 600;
  color: #0d9488;
  display: flex;
  align-items: center;
  gap: 5px;
}

.catalog-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 14px;
}

.quick-resource-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-resource-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.quick-resource-card.selected {
  background: #f0fdfa;
  border-color: #99f6e4;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.18);
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.quick-text {
  flex: 1;
}

.quick-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.quick-desc {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.btn-quick-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #0d9488;
}

.btn-quick-select.is-selected {
  color: #047857;
  font-weight: 700;
}

/* ════════ Booking Form Card ════════ */
.booking-form-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.form-card-editing {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  background: #fafbfd;
  cursor: pointer;
  user-select: none;
}

.form-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.icon-teal { background: #f0fdfa; border: 1px solid #ccfbf1; color: #0d9488; }
.icon-amber { background: #fffbeb; border: 1px solid #fde68a; color: #d97706; }

.form-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.form-sub {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.btn-toggle-form {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-toggle-form .rotated {
  transform: rotate(180deg);
}

.form-body {
  padding: 20px;
}

.form-grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group-modern {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group-modern.full-span {
  grid-column: 1 / -1;
}

.input-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 5px;
}

.req { color: #ef4444; font-weight: 700; }
.hint-small { font-size: 11px; color: #94a3b8; font-weight: 400; }

.custom-select-wrapper,
.input-field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon,
.field-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
}

.textarea-icon {
  top: 14px;
}

.form-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: #ffffff;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  transition: all 0.15s ease;
}

.textarea-input {
  resize: vertical;
  line-height: 1.5;
  min-height: 70px;
}

.form-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.duration-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-pill {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-pill:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Form Footer */
.form-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 12px;
}

.duration-live-preview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: #0d9488;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-form-cancel {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-form-submit {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border: none;
  color: #ffffff;
  padding: 9px 20px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
  transition: all 0.15s ease;
}

.btn-form-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  transform: translateY(-1px);
}

.btn-form-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ════════ My Bookings Workspace ════════ */
.my-bookings-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.bookings-header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  background: #fafbfd;
  flex-wrap: wrap;
  gap: 14px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.b-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.b-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.b-heading {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.b-sub {
  font-size: 11.5px;
  color: #64748b;
}

.bookings-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  gap: 4px;
}

.b-tab {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.b-tab.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.live-pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-wrap {
  position: relative;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 12px;
}

.search-input {
  width: 100%;
  padding: 8px 28px 8px 34px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  font-size: 12.5px;
  color: #0f172a;
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.12);
}

.btn-clear-search {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  font-size: 11px;
}

.btn-refresh-bookings {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
}

/* My Bookings Grid */
.my-bookings-grid {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.my-booking-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.my-booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  border-color: #cbd5e1;
}

.my-booking-card.active-now {
  border-left: 4px solid #10b981;
}

.my-booking-card.upcoming {
  border-left: 4px solid #0d9488;
}

.my-booking-card.completed {
  border-left: 4px solid #94a3b8;
}

.b-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.b-res-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.b-res-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.b-res-name {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.b-id-tag {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.b-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.b-status-pill.active-now {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.b-status-pill.upcoming {
  background: #f0fdfa;
  color: #0f766e;
  border: 1px solid #ccfbf1;
}

.b-status-pill.completed {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.status-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.b-time-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.b-time-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.b-time-lbl {
  font-size: 10.5px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 4px;
}

.b-time-val {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.b-time-divider {
  width: 1px;
  height: 24px;
  background: #cbd5e1;
}

.b-purpose-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #475569;
  background: #fafbfd;
  padding: 6px 10px;
  border-radius: 6px;
  line-height: 1.4;
}

.purpose-icon {
  color: #94a3b8;
  font-size: 10px;
  margin-top: 3px;
}

.b-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.b-duration-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
}

.b-actions-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-b-action {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-b-action.edit:hover {
  background: #f0fdfa;
  color: #0d9488;
  border-color: #99f6e4;
}

.btn-b-action.delete {
  padding: 4px 8px;
}

.btn-b-action.delete:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

/* State Containers */
.state-container {
  padding: 50px 20px;
  text-align: center;
  color: #64748b;
  max-width: 380px;
  margin: 0 auto;
}

.state-spinner {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: #0d9488;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 14px;
}

.state-container h4 {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.state-container p {
  font-size: 12.5px;
  color: #64748b;
  margin: 0 0 16px;
  line-height: 1.5;
}

.btn-book-now-empty {
  background: #0d9488;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* ════════ Responsive ════════ */
@media (max-width: 992px) {
  .main-content {
    padding: 14px;
  }

  .executive-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-secondary-action, .btn-primary-action {
    flex: 1;
    justify-content: center;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-grid-layout {
    grid-template-columns: 1fr;
  }

  .bookings-header-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left, .toolbar-right {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrap {
    width: 100%;
  }

  .bookings-tabs {
    overflow-x: auto;
  }
}

@media (max-width: 576px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .catalog-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>