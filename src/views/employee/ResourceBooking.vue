<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Mobile Top Navigation Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <div class="mobile-icon-box">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div>
              <span class="m-title-text">Book a Resource</span>
              <span class="m-sub-text">Company Asset Booking</span>
            </div>
          </div>
          <button class="m-action-btn primary" @click="toggleForm" :title="formVisible ? 'Hide Form' : 'New Booking'">
            <i class="fas" :class="formVisible ? 'fa-chevron-up' : 'fa-plus'"></i>
          </button>
        </div>

        <!-- Desktop Hero Banner -->
        <div class="hero-banner" v-else>
          <div class="hero-content">
            <div class="hero-tag">
              <i class="fas fa-sparkles"></i>
              <span>ARCH ASSET CONCIERGE</span>
            </div>
            <h1 class="hero-title">Book Company Resources</h1>
            <p class="hero-subtitle">
              Reserve meeting rooms, development hardware, projection units, and company vehicles seamlessly.
            </p>
          </div>

          <div class="hero-stats-badge">
            <div class="hero-stat-item">
              <span class="h-stat-num">{{ resources.length }}</span>
              <span class="h-stat-lbl">Resources Available</span>
            </div>
            <div class="hero-stat-sep"></div>
            <div class="hero-stat-item">
              <span class="h-stat-num text-emerald">{{ activeBookingsCount }}</span>
              <span class="h-stat-lbl">My Active Bookings</span>
            </div>
          </div>
        </div>

        <!-- Quick Resource Catalog Carousel / Grid -->
        <div class="catalog-section" v-if="resources.length > 0">
          <div class="section-header-row">
            <div class="sec-title-wrap">
              <i class="fas fa-layer-group text-indigo"></i>
              <h3>Available Company Resources</h3>
            </div>
            <span class="sec-hint desktop-only">Click any resource below to autofill and book instantly</span>
          </div>

          <div class="catalog-cards-carousel">
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
                <h4>{{ res.name }}</h4>
                <p>{{ res.description || 'Ready for reservation' }}</p>
              </div>
              <div class="quick-book-action">
                <span class="btn-quick-select">
                  <i class="fas" :class="form.resource_type === res.name ? 'fa-check-circle' : 'fa-arrow-right'"></i>
                  {{ form.resource_type === res.name ? 'Selected' : 'Book Now' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Form Container (Collapsible Card) -->
        <div class="booking-form-card" id="bookingFormSection">
          <div class="form-header" @click="toggleForm">
            <div class="form-header-left">
              <div class="form-icon-circle">
                <i class="fas" :class="editId ? 'fa-edit' : 'fa-calendar-plus'"></i>
              </div>
              <div>
                <h2>{{ editId ? 'Modify Your Booking' : 'Create a New Resource Booking' }}</h2>
                <p>{{ editId ? 'Update your reservation details below' : 'Select time slot, duration, and purpose' }}</p>
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
                  <div class="form-group-modern">
                    <label class="input-label">
                      <i class="fas fa-cube"></i> Select Resource <span class="req">*</span>
                    </label>
                    <div class="custom-select-wrapper">
                      <i class="fas fa-list select-icon"></i>
                      <select v-model="form.resource_type" required class="form-input select-input">
                        <option disabled value="">Choose a resource from the list...</option>
                        <option v-for="r in resources" :key="r.id" :value="r.name">{{ r.name }}</option>
                      </select>
                    </div>
                  </div>

                  <!-- Quick Duration Helpers -->
                  <div class="form-group-modern full-span">
                    <label class="input-label">
                      <i class="fas fa-magic"></i> Quick Duration Preset
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
                      <i class="fas fa-calendar-alt"></i> From Date & Time <span class="req">*</span>
                    </label>
                    <div class="input-field-wrapper">
                      <i class="fas fa-clock field-icon"></i>
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
                      <i class="fas fa-calendar-check"></i> To Date & Time <span class="req">*</span>
                    </label>
                    <div class="input-field-wrapper">
                      <i class="fas fa-clock field-icon"></i>
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
                      <i class="fas fa-comment-dots"></i> Purpose of Booking
                    </label>
                    <div class="input-field-wrapper">
                      <i class="fas fa-align-left field-icon textarea-icon"></i>
                      <textarea 
                        v-model="form.purpose" 
                        rows="2" 
                        placeholder="e.g., Client meeting, QA release verification, site inspection..."
                        class="form-input textarea-input"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Live Duration Preview & Form Actions -->
                <div class="form-footer-bar">
                  <div class="duration-live-preview" v-if="calculatedDuration">
                    <i class="fas fa-hourglass-half text-indigo"></i>
                    <span>Booking Duration: <strong>{{ calculatedDuration }}</strong></span>
                  </div>

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

        <!-- My Bookings Workspace -->
        <div class="my-bookings-card">
          <div class="bookings-header-toolbar">
            <div class="toolbar-left">
              <div class="b-title-wrap">
                <i class="fas fa-bookmark text-indigo"></i>
                <h2>My Bookings</h2>
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
          <div v-if="loadingBookings" class="loading-box">
            <div class="spinner-custom"></div>
            <p>Loading your reservations...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredBookings.length === 0" class="empty-bookings-box">
            <div class="empty-icon-wrap">
              <i class="fas fa-calendar-times"></i>
            </div>
            <h3>No Bookings Found</h3>
            <p>{{ searchQuery ? 'No bookings matched your search query.' : 'You have not made any bookings in this tab yet.' }}</p>
            <button class="btn-book-now-empty" @click="focusBookingForm">
              <i class="fas fa-plus"></i> Book a Resource Now
            </button>
          </div>

          <!-- Bookings Cards / Grid -->
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
                    <h4>{{ b.resource_type }}</h4>
                    <span class="b-id-tag">#BK-{{ b.id }}</span>
                  </div>
                </div>

                <span class="b-status-pill" :class="getBookingStatusClass(b)">
                  <span class="pip"></span>
                  {{ getBookingStatusLabel(b) }}
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
                    <i class="fas fa-pen"></i> Edit
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
      // Return all bookings loaded for the current employee
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
      
      // If dates not set, set default start & end
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

      // Default fallback
      if (this.resources.length === 0) {
        this.resources = [
          { id: 1, name: 'Conference Room', description: 'Main Meeting & Board Room' },
          { id: 2, name: 'Projector', description: 'HD Wireless Presentation Projector' },
          { id: 3, name: 'Testing Laptop', description: 'QA Development Laptop' },
          { id: 4, name: 'Company Vehicle', description: 'Official Site Visit Vehicle' },
          { id: 5, name: 'Camera Kit', description: 'Photography & Event Recording Kit' }
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
          if (success) toastSuccess('Resource booked successfully!')
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
      const cls = this.getBookingStatusClass(b)
      if (cls === 'active-now') return 'Active Now'
      if (cls === 'upcoming') return 'Upcoming'
      return 'Completed'
    },

    calculateDuration(from, to) {
      if (!from || !to) return '—'
      const start = new Date(from)
      const end = new Date(to)
      const diffMs = end - start
      if (isNaN(diffMs) || diffMs <= 0) return '—'

      const diffMins = Math.round(diffMs / 60000)
      if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'}`
      const diffHrs = (diffMins / 60).toFixed(1)
      if (parseFloat(diffHrs) < 24) return `${parseFloat(diffHrs)} hr${parseFloat(diffHrs) === 1 ? '' : 's'}`
      const diffDays = Math.round(diffMins / (60 * 24))
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`
    },

    getResourceIcon(type) {
      const t = (type || '').toLowerCase()
      if (t.includes('room') || t.includes('conference') || t.includes('cabin')) return 'fas fa-door-open'
      if (t.includes('laptop') || t.includes('computer') || t.includes('mac') || t.includes('pc')) return 'fas fa-laptop'
      if (t.includes('projector') || t.includes('screen') || t.includes('tv')) return 'fas fa-video'
      if (t.includes('car') || t.includes('vehicle') || t.includes('van') || t.includes('bike')) return 'fas fa-car'
      if (t.includes('camera') || t.includes('dslr') || t.includes('mic')) return 'fas fa-camera'
      return 'fas fa-cube'
    },

    getResourceStyle(type) {
      const t = (type || '').toLowerCase()
      if (t.includes('room') || t.includes('conference')) return { background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#4338ca' }
      if (t.includes('laptop') || t.includes('computer')) return { background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', color: '#0369a1' }
      if (t.includes('projector') || t.includes('screen')) return { background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#b45309' }
      if (t.includes('car') || t.includes('vehicle')) return { background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d' }
      if (t.includes('camera')) return { background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', color: '#be185d' }
      return { background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', color: '#7e22ce' }
    },

    formatDate(dateStr) {
      if (!dateStr) return '—'
      try {
        return new Date(dateStr).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (e) {
        return dateStr
      }
    },

    formatTime(dateStr) {
      if (!dateStr) return ''
      try {
        return new Date(dateStr).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      } catch (e) {
        return ''
      }
    },

    formatToDatetimeLocal(dateObj) {
      const pad = n => (n < 10 ? '0' + n : n)
      const year = dateObj.getFullYear()
      const month = pad(dateObj.getMonth() + 1)
      const day = pad(dateObj.getDate())
      const hours = pad(dateObj.getHours())
      const mins = pad(dateObj.getMinutes())
      return `${year}-${month}-${day}T${hours}:${mins}`
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
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchResources()

    const token = localStorage.getItem('token') || localStorage.getItem('admin_token')
    if (!token) {
      this.$router.push('/auth')
      return
    }

    this.fetchBookings()
    this.applyDurationPreset(2)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.layout {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: 100vh;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hero Banner */
.hero-banner {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
  border-radius: 24px;
  padding: 32px 36px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(49, 46, 129, 0.2);
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent 70%);
  pointer-events: none;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  margin-bottom: 10px;
}

.hero-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 14px;
  color: #c7d2fe;
  margin: 0;
  max-width: 550px;
  line-height: 1.5;
}

.hero-stats-badge {
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 16px 28px;
}

.hero-stat-item {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.h-stat-num {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
}

.h-stat-lbl {
  font-size: 11px;
  font-weight: 600;
  color: #c7d2fe;
  margin-top: 2px;
}

.hero-stat-sep {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
}

.text-emerald { color: #34d399; }
.text-indigo { color: #4f46e5; }

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.m-title-text {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  display: block;
}

.m-sub-text {
  font-size: 11px;
  color: #64748b;
  display: block;
}

.m-action-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
}

/* Catalog Carousel Section */
.catalog-section {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 28px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.sec-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sec-title-wrap i {
  font-size: 18px;
}

.sec-title-wrap h3 {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.sec-hint {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.catalog-cards-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.quick-resource-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
}

.quick-resource-card:hover {
  transform: translateY(-3px);
  border-color: #818cf8;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(79, 70, 229, 0.08);
}

.quick-resource-card.selected {
  border-color: #4f46e5;
  background: linear-gradient(180deg, #ffffff 0%, #eef2ff 100%);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.12);
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.quick-text h4 {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.quick-text p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
  min-height: 34px;
}

.btn-quick-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  color: #4f46e5;
  background: #eef2ff;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s;
}

.quick-resource-card:hover .btn-quick-select,
.quick-resource-card.selected .btn-quick-select {
  background: #4f46e5;
  color: #ffffff;
}

/* Booking Form Card */
.booking-form-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.form-header {
  padding: 22px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #f1f5f9;
}

.form-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.form-header-left h2 {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px;
}

.form-header-left p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.btn-toggle-form {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.25s ease;
}

.btn-toggle-form i.rotated {
  transform: rotate(-90deg);
}

.form-body {
  padding: 28px;
}

.form-grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.full-span {
  grid-column: 1 / -1;
}

.form-group-modern {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-label i {
  color: #6366f1;
}

.req { color: #ef4444; }

.custom-select-wrapper,
.input-field-wrapper {
  position: relative;
}

.select-icon,
.field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.textarea-icon {
  top: 16px;
  transform: none;
}

.form-input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 13px;
  font-family: inherit;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  background: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.textarea-input {
  padding-top: 12px;
  resize: vertical;
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
  font-size: 11px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-pill:hover {
  background: #e0e7ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.form-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.duration-live-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #334155;
  background: #eef2ff;
  padding: 8px 16px;
  border-radius: 12px;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-form-cancel {
  background: #f1f5f9;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.btn-form-submit {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  border: none;
  padding: 12px 28px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

.btn-form-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(79, 70, 229, 0.4);
}

/* My Bookings Section */
.my-bookings-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 28px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.bookings-header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
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
  gap: 8px;
}

.b-title-wrap h2 {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.bookings-tabs {
  display: flex;
  background: #f8fafc;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  gap: 4px;
}

.b-tab {
  background: transparent;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.b-tab.active {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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
  gap: 10px;
}

.search-wrap {
  position: relative;
  min-width: 240px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 12px;
  outline: none;
}

.btn-clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.btn-refresh-bookings {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* My Bookings Grid */
.my-bookings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 18px;
}

.my-booking-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #f1f5f9;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  transition: all 0.2s;
}

.my-booking-card:hover {
  transform: translateY(-3px);
  border-color: #cbd5e1;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.my-booking-card.active-now {
  border-color: #a7f3d0;
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}

.b-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.b-res-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.b-res-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.b-res-info h4 {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.b-id-tag {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.b-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.b-status-pill .pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.b-status-pill.active-now { background: #d1fae5; color: #065f46; }
.b-status-pill.active-now .pip { background: #10b981; }

.b-status-pill.upcoming { background: #e0f2fe; color: #0369a1; }
.b-status-pill.upcoming .pip { background: #0284c7; }

.b-status-pill.completed { background: #f1f5f9; color: #64748b; }
.b-status-pill.completed .pip { background: #94a3b8; }

.b-time-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.b-time-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.b-time-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.b-time-val {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.b-time-divider {
  height: 1px;
  background: #e2e8f0;
}

.b-purpose-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  color: #475569;
}

.purpose-icon {
  color: #94a3b8;
  font-size: 10px;
  margin-top: 2px;
}

.b-purpose-row p {
  margin: 0;
  line-height: 1.4;
}

.b-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.b-duration-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  padding: 4px 10px;
  border-radius: 20px;
}

.b-actions-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-b-action {
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-b-action.edit { background: #f1f5f9; color: #334155; }
.btn-b-action.edit:hover { background: #e2e8f0; }

.btn-b-action.delete { background: #fee2e2; color: #dc2626; width: 28px; height: 28px; padding: 0; justify-content: center; }
.btn-b-action.delete:hover { background: #fca5a5; }

/* Empty & Loading */
.loading-box {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.spinner-custom {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-bookings-box {
  text-align: center;
  padding: 48px 20px;
}

.empty-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 12px;
}

.empty-bookings-box h3 {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.empty-bookings-box p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 16px;
}

.btn-book-now-empty {
  background: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* Transitions */
.expand-form-enter-active,
.expand-form-leave-active {
  transition: all 0.3s ease;
  max-height: 800px;
  overflow: hidden;
}

.expand-form-enter-from,
.expand-form-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    flex-direction: column;
  }
  .catalog-section,
  .booking-form-card,
  .my-bookings-card {
    padding: 16px;
    border-radius: 20px;
  }
  .catalog-cards-carousel {
    grid-template-columns: 1fr;
  }
  .form-grid-layout {
    grid-template-columns: 1fr;
  }
  .my-bookings-grid {
    grid-template-columns: 1fr;
  }
  .search-wrap {
    min-width: 100%;
  }
}
</style>