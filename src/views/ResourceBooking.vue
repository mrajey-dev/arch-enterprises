<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Mobile Top Navigation -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <div class="mobile-icon-box">
              <i class="fas fa-cubes"></i>
            </div>
            <div>
              <span class="m-title-text">Resource Booking</span>
              <span class="m-sub-text">Admin Management</span>
            </div>
          </div>
          <div class="mobile-header-actions">
            <button class="m-action-btn primary" @click="openAddBookingModal" title="Book Resource">
              <i class="fas fa-plus"></i>
            </button>
            <button class="m-action-btn secondary" @click="showResourceCatalogModal = true" title="Manage Resources">
              <i class="fas fa-layer-group"></i>
            </button>
          </div>
        </div>

        <!-- Desktop Executive Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon-wrapper">
              <div class="title-icon">
                <i class="fas fa-layer-group"></i>
              </div>
              <div class="pulse-ring"></div>
            </div>
            <div>
              <div class="badge-tag">ADMIN WORKSPACE</div>
              <h1 class="page-title">Resource Booking Management</h1>
              <p class="subtitle-modern">Monitor, schedule, and configure company assets, rooms, and devices.</p>
            </div>
          </div>

          <div class="header-actions-group">
            <button class="btn-secondary-modern" @click="fetchData(true)" :disabled="loading" title="Refresh all data">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              <span>Refresh</span>
            </button>
            <button class="btn-outline-modern" @click="showResourceCatalogModal = true">
              <i class="fas fa-cogs"></i>
              <span>Resource Catalog ({{ resourceTypes.length }})</span>
            </button>
            <button class="btn-primary-modern" @click="openAddBookingModal">
              <i class="fas fa-plus-circle"></i>
              <span>New Booking</span>
            </button>
          </div>
        </div>

        <!-- Executive Statistics Dashboard -->
        <div class="stats-grid">
          <div class="stat-card" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
            <div class="stat-icon-box bg-indigo">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ bookings.length }}</span>
              <span class="stat-label">Total Bookings</span>
            </div>
            <div class="stat-trend">All Time</div>
          </div>

          <div class="stat-card" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
            <div class="stat-icon-box bg-emerald">
              <i class="fas fa-bolt"></i>
              <span class="live-dot"></span>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ activeBookingsCount }}</span>
              <span class="stat-label">Active & Upcoming</span>
            </div>
            <div class="stat-trend text-emerald">Live Assets</div>
          </div>

          <div class="stat-card" :class="{ active: activeTab === 'today' }" @click="activeTab = 'today'">
            <div class="stat-icon-box bg-amber">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ todayBookingsCount }}</span>
              <span class="stat-label">Today's Schedule</span>
            </div>
            <div class="stat-trend">Scheduled Today</div>
          </div>

          <div class="stat-card" :class="{ active: activeTab === 'catalog' }" @click="activeTab = 'catalog'">
            <div class="stat-icon-box bg-purple">
              <i class="fas fa-box-open"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ resourceTypes.length }}</span>
              <span class="stat-label">Configured Types</span>
            </div>
            <div class="stat-trend">Resource Catalog</div>
          </div>
        </div>

        <!-- Main Workspace Card -->
        <div class="workspace-card">
          <!-- Filter & Search Toolbar -->
          <div class="workspace-toolbar">
            <!-- Navigation Tabs -->
            <div class="tabs-group">
              <button class="nav-tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
                <i class="fas fa-list-ul"></i>
                <span>All ({{ bookings.length }})</span>
              </button>
              <button class="nav-tab" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
                <i class="fas fa-check-circle"></i>
                <span>Active & Upcoming ({{ activeBookingsCount }})</span>
              </button>
              <button class="nav-tab" :class="{ active: activeTab === 'past' }" @click="activeTab = 'past'">
                <i class="fas fa-history"></i>
                <span>Past ({{ pastBookingsCount }})</span>
              </button>
              <button class="nav-tab" :class="{ active: activeTab === 'catalog' }" @click="activeTab = 'catalog'">
                <i class="fas fa-th-large"></i>
                <span>Resource Types</span>
              </button>
            </div>

            <!-- Controls (Search, Filter, View Switch) -->
            <div class="toolbar-controls" v-if="activeTab !== 'catalog'">
              <div class="search-box">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search by employee, resource, or purpose..." 
                />
                <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="select-filter" v-if="resourceTypes.length > 0">
                <select v-model="selectedResourceTypeFilter">
                  <option value="">All Resource Types</option>
                  <option v-for="r in resourceTypes" :key="r.id" :value="r.name">{{ r.name }}</option>
                </select>
              </div>

              <!-- View Switcher (Cards vs Table) -->
              <div class="view-switch-btns desktop-only">
                <button 
                  class="switch-btn" 
                  :class="{ active: viewMode === 'grid' }" 
                  @click="viewMode = 'grid'"
                  title="Grid View"
                >
                  <i class="fas fa-th-large"></i>
                </button>
                <button 
                  class="switch-btn" 
                  :class="{ active: viewMode === 'table' }" 
                  @click="viewMode = 'table'"
                  title="Table View"
                >
                  <i class="fas fa-table"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state-box">
            <div class="spinner-custom"></div>
            <p>Loading resource booking data...</p>
          </div>

          <!-- =================== TAB 1/2/3: BOOKINGS VIEW =================== -->
          <div v-else-if="activeTab !== 'catalog'">
            <!-- Empty State -->
            <div v-if="filteredBookings.length === 0" class="empty-state-modern">
              <div class="empty-icon-wrap">
                <i class="fas fa-calendar-times"></i>
              </div>
              <h3>No Bookings Found</h3>
              <p>{{ searchQuery || selectedResourceTypeFilter ? 'Try clearing your search or filter parameters.' : 'No resource bookings match this category yet.' }}</p>
              <button class="btn-empty-action" @click="openAddBookingModal">
                <i class="fas fa-plus"></i> Create First Booking
              </button>
            </div>

            <!-- GRID CARD VIEW -->
            <div v-else-if="viewMode === 'grid' || isMobile" class="bookings-cards-grid">
              <div 
                v-for="b in filteredBookings" 
                :key="b.id" 
                class="booking-item-card"
                :class="getBookingStatusClass(b)"
              >
                <!-- Card Header -->
                <div class="card-top">
                  <div class="resource-badge-wrap">
                    <div class="resource-avatar" :style="getResourceStyle(b.resource_type)">
                      <i :class="getResourceIcon(b.resource_type)"></i>
                    </div>
                    <div class="resource-info">
                      <h4>{{ b.resource_type }}</h4>
                      <span class="booking-id-tag">#BK-{{ b.id }}</span>
                    </div>
                  </div>

                  <span class="status-pill" :class="getBookingStatusClass(b)">
                    <span class="dot"></span>
                    {{ getBookingStatusLabel(b) }}
                  </span>
                </div>

                <!-- Card Body -->
                <div class="card-details-grid">
                  <div class="detail-row">
                    <div class="detail-label">
                      <i class="fas fa-user-circle"></i>
                      <span>Booked By</span>
                    </div>
                    <div class="detail-val user-val">
                      <div class="user-chip">
                        <span class="user-init">{{ getUserInitials(b.user?.name) }}</span>
                        <strong>{{ b.user?.name || (b.user_id ? 'User #' + b.user_id : 'Staff Member') }}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="detail-row">
                    <div class="detail-label">
                      <i class="fas fa-calendar-alt"></i>
                      <span>From Time</span>
                    </div>
                    <div class="detail-val highlight">
                      <span class="date-tag">{{ formatDate(b.from_date) }}</span>
                      <span class="time-tag">{{ formatTime(b.from_date) }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <div class="detail-label">
                      <i class="fas fa-calendar-check"></i>
                      <span>To Time</span>
                    </div>
                    <div class="detail-val highlight">
                      <span class="date-tag">{{ formatDate(b.to_date) }}</span>
                      <span class="time-tag">{{ formatTime(b.to_date) }}</span>
                    </div>
                  </div>

                  <div class="detail-row full" v-if="b.purpose">
                    <div class="detail-label">
                      <i class="fas fa-comment-dots"></i>
                      <span>Purpose / Notes</span>
                    </div>
                    <div class="detail-val purpose-box">
                      {{ b.purpose }}
                    </div>
                  </div>
                </div>

                <!-- Card Footer Actions -->
                <div class="card-bottom-actions">
                  <div class="duration-chip">
                    <i class="fas fa-hourglass-half"></i>
                    <span>{{ calculateDuration(b.from_date, b.to_date) }}</span>
                  </div>

                  <div class="btn-group">
                    <button class="btn-action edit" @click="openEditBookingModal(b)" title="Edit Booking">
                      <i class="fas fa-pen"></i> Edit
                    </button>
                    <button class="btn-action delete" @click="deleteBooking(b.id)" title="Delete Booking">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TABLE VIEW -->
            <div v-else class="table-responsive-wrapper">
              <table class="modern-executive-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Resource</th>
                    <th>Employee</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Purpose</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in filteredBookings" :key="b.id">
                    <td class="id-col">#{{ b.id }}</td>
                    <td class="resource-col">
                      <div class="table-resource-cell">
                        <div class="t-icon" :style="getResourceStyle(b.resource_type)">
                          <i :class="getResourceIcon(b.resource_type)"></i>
                        </div>
                        <span class="t-resource-name">{{ b.resource_type }}</span>
                      </div>
                    </td>
                    <td class="user-col">
                      <div class="table-user-cell">
                        <span class="t-user-avatar">{{ getUserInitials(b.user?.name) }}</span>
                        <div class="t-user-text">
                          <span class="t-user-name">{{ b.user?.name || (b.user_id ? 'User #' + b.user_id : 'Staff') }}</span>
                          <span class="t-user-dept" v-if="b.user?.department">{{ b.user.department }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="datetime-col">
                      <div class="datetime-pill">
                        <span class="d-date">{{ formatDate(b.from_date) }}</span>
                        <span class="d-time">{{ formatTime(b.from_date) }}</span>
                      </div>
                    </td>
                    <td class="datetime-col">
                      <div class="datetime-pill">
                        <span class="d-date">{{ formatDate(b.to_date) }}</span>
                        <span class="d-time">{{ formatTime(b.to_date) }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="table-duration">{{ calculateDuration(b.from_date, b.to_date) }}</span>
                    </td>
                    <td>
                      <span class="status-pill" :class="getBookingStatusClass(b)">
                        <span class="dot"></span>
                        {{ getBookingStatusLabel(b) }}
                      </span>
                    </td>
                    <td class="purpose-col" :title="b.purpose || 'No purpose recorded'">
                      {{ truncateText(b.purpose || '—', 35) }}
                    </td>
                    <td class="actions-col text-right">
                      <div class="t-actions">
                        <button class="t-btn edit" @click="openEditBookingModal(b)" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="t-btn delete" @click="deleteBooking(b.id)" title="Delete">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- =================== TAB 4: RESOURCE CATALOG MANAGEMENT =================== -->
          <div v-else class="catalog-management-view">
            <div class="catalog-top-banner">
              <div class="banner-text">
                <h3>Configured Company Resources</h3>
                <p>Define meeting rooms, testing hardware, equipment, and vehicles available for staff reservations.</p>
              </div>
              <button class="btn-primary-modern" @click="openAddResourceTypeModal">
                <i class="fas fa-plus"></i> Add New Resource Type
              </button>
            </div>

            <div class="catalog-grid">
              <div v-for="r in resourceTypes" :key="r.id" class="catalog-card">
                <div class="catalog-card-icon" :style="getResourceStyle(r.name)">
                  <i :class="getResourceIcon(r.name)"></i>
                </div>
                <div class="catalog-card-body">
                  <div class="catalog-title-row">
                    <h4>{{ r.name }}</h4>
                    <span class="active-badge">Active</span>
                  </div>
                  <p class="catalog-desc">{{ r.description || 'No specific description provided.' }}</p>
                  
                  <div class="catalog-meta">
                    <span class="usage-count">
                      <i class="fas fa-calendar-check"></i>
                      {{ getBookingsCountForResource(r.name) }} Bookings
                    </span>
                  </div>
                </div>

                <div class="catalog-actions">
                  <button class="c-btn edit" @click="openEditResourceTypeModal(r)" title="Edit Resource Type">
                    <i class="fas fa-pen"></i> Edit
                  </button>
                  <button class="c-btn delete" @click="deleteResourceType(r.id)" title="Delete Resource Type">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- =================== MODAL 1: CREATE / EDIT BOOKING =================== -->
    <transition name="modal-fade">
      <div v-if="showBookingModal" class="modal-backdrop" @click.self="showBookingModal = false">
        <div class="modal-card-modern" @click.stop>
          <div class="modal-header-gradient">
            <div class="m-icon-wrap">
              <i class="fas fa-calendar-plus"></i>
            </div>
            <div class="m-header-text">
              <h3>{{ bookingForm.id ? 'Edit Resource Booking' : 'Create New Resource Booking' }}</h3>
              <p>Reserve equipment or facilities with scheduled time ranges.</p>
            </div>
            <button class="m-close-btn" @click="showBookingModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="submitBookingForm" class="modal-body-form">
            <!-- Resource Type Selector -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-layer-group"></i> Resource Type <span class="req">*</span>
              </label>
              <div class="input-wrap">
                <select v-model="bookingForm.resource_type" required class="custom-select">
                  <option disabled value="">Select a resource...</option>
                  <option v-for="r in resourceTypes" :key="r.id" :value="r.name">{{ r.name }}</option>
                </select>
              </div>
            </div>

            <!-- Quick Duration Helpers -->
            <div class="duration-helper-bar">
              <span class="helper-label">Quick Duration:</span>
              <div class="helper-chips">
                <button type="button" class="helper-chip" @click="setQuickDuration(1)">1 Hour</button>
                <button type="button" class="helper-chip" @click="setQuickDuration(2)">2 Hours</button>
                <button type="button" class="helper-chip" @click="setQuickDuration(4)">Half Day (4h)</button>
                <button type="button" class="helper-chip" @click="setQuickDuration(8)">Full Day</button>
              </div>
            </div>

            <!-- Date Range (From / To) -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-clock"></i> From Date & Time <span class="req">*</span>
                </label>
                <div class="input-wrap">
                  <input type="datetime-local" v-model="bookingForm.from_date" required class="custom-input" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-clock"></i> To Date & Time <span class="req">*</span>
                </label>
                <div class="input-wrap">
                  <input type="datetime-local" v-model="bookingForm.to_date" required class="custom-input" />
                </div>
              </div>
            </div>

            <!-- Purpose / Description -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-comment-alt"></i> Purpose / Notes
              </label>
              <div class="input-wrap">
                <textarea 
                  v-model="bookingForm.purpose" 
                  rows="3" 
                  placeholder="e.g., Client presentation in Conference Room, Testing QA release on Laptop..."
                  class="custom-textarea"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer-modern">
              <button type="button" class="btn-modal-cancel" @click="showBookingModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-modal-submit" :disabled="submitting">
                <i class="fas fa-spinner fa-spin" v-if="submitting"></i>
                <i class="fas fa-check-circle" v-else></i>
                <span>{{ bookingForm.id ? 'Save Changes' : 'Confirm Booking' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- =================== MODAL 2: ADD / EDIT RESOURCE TYPE =================== -->
    <transition name="modal-fade">
      <div v-if="showResourceTypeModal" class="modal-backdrop" @click.self="showResourceTypeModal = false">
        <div class="modal-card-modern" @click.stop>
          <div class="modal-header-gradient purple-theme">
            <div class="m-icon-wrap">
              <i class="fas fa-box"></i>
            </div>
            <div class="m-header-text">
              <h3>{{ resourceTypeForm.id ? 'Edit Resource Type' : 'Add New Resource Type' }}</h3>
              <p>Configure a new bookable asset category for employees.</p>
            </div>
            <button class="m-close-btn" @click="showResourceTypeModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="submitResourceTypeForm" class="modal-body-form">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-tag"></i> Resource Name <span class="req">*</span>
              </label>
              <div class="input-wrap">
                <input 
                  type="text" 
                  v-model="resourceTypeForm.name" 
                  placeholder="e.g., Board Room 1, 4K Drone Kit, Testing Tablet" 
                  required 
                  class="custom-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-align-left"></i> Description
              </label>
              <div class="input-wrap">
                <textarea 
                  v-model="resourceTypeForm.description" 
                  rows="3" 
                  placeholder="Specifications, location, capacity, or guidelines..." 
                  class="custom-textarea"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer-modern">
              <button type="button" class="btn-modal-cancel" @click="showResourceTypeModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-modal-submit purple-btn" :disabled="submittingType">
                <i class="fas fa-spinner fa-spin" v-if="submittingType"></i>
                <i class="fas fa-save" v-else></i>
                <span>{{ resourceTypeForm.id ? 'Update Resource' : 'Create Resource' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import { toastSuccess, toastError, toastWarning } from '@/utils/toast.js'

export default {
  name: 'AdminResourceBooking',
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loading: false,
      submitting: false,
      submittingType: false,
      activeTab: 'all', // 'all', 'active', 'today', 'past', 'catalog'
      viewMode: 'grid', // 'grid' or 'table'
      searchQuery: '',
      selectedResourceTypeFilter: '',
      
      bookings: [],
      resourceTypes: [],

      showBookingModal: false,
      bookingForm: {
        id: null,
        resource_type: '',
        from_date: '',
        to_date: '',
        purpose: ''
      },

      showResourceTypeModal: false,
      showResourceCatalogModal: false,
      resourceTypeForm: {
        id: null,
        name: '',
        description: ''
      }
    }
  },

  computed: {
    activeBookingsCount() {
      const now = new Date()
      return this.bookings.filter(b => b.to_date && new Date(b.to_date) >= now).length
    },
    todayBookingsCount() {
      const todayStr = new Date().toISOString().substring(0, 10)
      return this.bookings.filter(b => {
        const fromStr = b.from_date ? b.from_date.substring(0, 10) : ''
        return fromStr === todayStr
      }).length
    },
    pastBookingsCount() {
      const now = new Date()
      return this.bookings.filter(b => b.to_date && new Date(b.to_date) < now).length
    },
    filteredBookings() {
      let list = this.bookings
      const now = new Date()
      const todayStr = now.toISOString().substring(0, 10)

      // Tab Filtering
      if (this.activeTab === 'active') {
        list = list.filter(b => b.to_date && new Date(b.to_date) >= now)
      } else if (this.activeTab === 'today') {
        list = list.filter(b => b.from_date && b.from_date.substring(0, 10) === todayStr)
      } else if (this.activeTab === 'past') {
        list = list.filter(b => b.to_date && new Date(b.to_date) < now)
      }

      // Resource Filter
      if (this.selectedResourceTypeFilter) {
        list = list.filter(b => b.resource_type === this.selectedResourceTypeFilter)
      }

      // Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase()
        list = list.filter(b => 
          (b.resource_type && b.resource_type.toLowerCase().includes(q)) ||
          (b.purpose && b.purpose.toLowerCase().includes(q)) ||
          (b.user?.name && b.user.name.toLowerCase().includes(q))
        )
      }

      return list
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

    async fetchData(showToast = false) {
      this.loading = true
      await Promise.all([this.fetchResourceTypes(), this.fetchBookings()])
      this.loading = false
      if (showToast) {
        toastSuccess('Resource bookings data refreshed')
      }
    },

    async fetchResourceTypes() {
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
            this.resourceTypes = res.data
            return
          }
        } catch (e) {
          // next
        }
      }

      // Fallback
      if (this.resourceTypes.length === 0) {
        this.resourceTypes = [
          { id: 1, name: 'Conference Room', description: 'Main Meeting & Conference Room' },
          { id: 2, name: 'Projector', description: 'HD Presentation Projector' },
          { id: 3, name: 'Testing Laptop', description: 'QA Development Laptop' },
          { id: 4, name: 'Company Vehicle', description: 'Site Visit Car' },
          { id: 5, name: 'Camera Kit', description: 'Photography & Recording Gear' }
        ]
      }
    },

    async fetchBookings() {
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
            return
          }
        } catch (e) {
          // next
        }
      }
    },

    openAddBookingModal() {
      const now = new Date()
      const start = new Date(now.getTime() + 15 * 60000)
      const end = new Date(now.getTime() + 75 * 60000)

      this.bookingForm = {
        id: null,
        resource_type: this.resourceTypes.length > 0 ? this.resourceTypes[0].name : '',
        from_date: this.formatToDatetimeLocal(start),
        to_date: this.formatToDatetimeLocal(end),
        purpose: ''
      }
      this.showBookingModal = true
    },

    openEditBookingModal(b) {
      this.bookingForm = {
        id: b.id,
        resource_type: b.resource_type || '',
        from_date: b.from_date ? b.from_date.replace(' ', 'T').substring(0, 16) : '',
        to_date: b.to_date ? b.to_date.replace(' ', 'T').substring(0, 16) : '',
        purpose: b.purpose || ''
      }
      this.showBookingModal = true
    },

    setQuickDuration(hours) {
      let start = this.bookingForm.from_date ? new Date(this.bookingForm.from_date) : new Date()
      if (isNaN(start.getTime())) start = new Date()
      const end = new Date(start.getTime() + hours * 3600000)

      this.bookingForm.from_date = this.formatToDatetimeLocal(start)
      this.bookingForm.to_date = this.formatToDatetimeLocal(end)
    },

    async submitBookingForm() {
      if (!this.bookingForm.resource_type || !this.bookingForm.from_date || !this.bookingForm.to_date) {
        toastWarning('Please select a Resource and specify both From and To dates.')
        return
      }

      if (new Date(this.bookingForm.from_date) >= new Date(this.bookingForm.to_date)) {
        toastWarning('From date must be earlier than To date.')
        return
      }

      this.submitting = true
      const payload = {
        resource_type: this.bookingForm.resource_type,
        from_date: this.bookingForm.from_date.replace('T', ' '),
        to_date: this.bookingForm.to_date.replace('T', ' '),
        purpose: this.bookingForm.purpose || ''
      }

      try {
        let success = false
        if (this.bookingForm.id) {
          const endpoints = [
            `/resource-bookings/${this.bookingForm.id}`,
            `/api/resource-bookings/${this.bookingForm.id}`,
            `https://employees.archenterprises.co.in/api/resource-bookings/${this.bookingForm.id}`
          ]
          for (const ep of endpoints) {
            try {
              await axios.put(ep, payload, this.getAuthHeaders())
              success = true
              break
            } catch (e) {}
          }
        } else {
          const endpoints = [
            '/resource-bookings',
            '/api/resource-bookings',
            'https://employees.archenterprises.co.in/api/resource-bookings'
          ]
          for (const ep of endpoints) {
            try {
              await axios.post(ep, payload, this.getAuthHeaders())
              success = true
              break
            } catch (e) {}
          }
        }

        if (success) {
          toastSuccess(this.bookingForm.id ? 'Booking updated successfully!' : 'Resource booked successfully!')
          this.showBookingModal = false
          this.fetchBookings()
        } else {
          toastError('Failed to save booking. Please try again.')
        }
      } catch (err) {
        toastError('Failed to save booking')
      } finally {
        this.submitting = false
      }
    },

    async deleteBooking(id) {
      if (!confirm('Are you sure you want to delete this resource booking?')) return

      const endpoints = [
        `/resource-bookings/${id}`,
        `/api/resource-bookings/${id}`,
        `https://employees.archenterprises.co.in/api/resource-bookings/${id}`
      ]

      let success = false
      for (const ep of endpoints) {
        try {
          await axios.delete(ep, this.getAuthHeaders())
          success = true
          break
        } catch (e) {}
      }

      if (success) {
        toastSuccess('Booking deleted successfully')
        this.fetchBookings()
      } else {
        toastError('Could not delete booking')
      }
    },

    openAddResourceTypeModal() {
      this.resourceTypeForm = { id: null, name: '', description: '' }
      this.showResourceTypeModal = true
    },

    openEditResourceTypeModal(r) {
      this.resourceTypeForm = { id: r.id, name: r.name, description: r.description || '' }
      this.showResourceTypeModal = true
    },

    async submitResourceTypeForm() {
      if (!this.resourceTypeForm.name.trim()) {
        toastWarning('Please provide a resource name.')
        return
      }

      this.submittingType = true
      const payload = {
        name: this.resourceTypeForm.name,
        description: this.resourceTypeForm.description
      }

      try {
        let success = false
        if (this.resourceTypeForm.id) {
          const endpoints = [
            `/resources/${this.resourceTypeForm.id}`,
            `/api/resources/${this.resourceTypeForm.id}`,
            `https://employees.archenterprises.co.in/api/resources/${this.resourceTypeForm.id}`
          ]
          for (const ep of endpoints) {
            try {
              await axios.put(ep, payload, this.getAuthHeaders())
              success = true
              break
            } catch (e) {}
          }
        } else {
          const endpoints = [
            '/resources',
            '/api/resources',
            'https://employees.archenterprises.co.in/api/resources'
          ]
          for (const ep of endpoints) {
            try {
              await axios.post(ep, payload, this.getAuthHeaders())
              success = true
              break
            } catch (e) {}
          }
        }

        if (success) {
          toastSuccess(this.resourceTypeForm.id ? 'Resource updated!' : 'Resource created successfully!')
          this.showResourceTypeModal = false
          this.fetchResourceTypes()
        } else {
          toastError('Failed to save resource type')
        }
      } catch (e) {
        toastError('Failed to save resource type')
      } finally {
        this.submittingType = false
      }
    },

    async deleteResourceType(id) {
      if (!confirm('Are you sure you want to delete this resource category?')) return

      const endpoints = [
        `/resources/${id}`,
        `/api/resources/${id}`,
        `https://employees.archenterprises.co.in/api/resources/${id}`
      ]

      let success = false
      for (const ep of endpoints) {
        try {
          await axios.delete(ep, this.getAuthHeaders())
          success = true
          break
        } catch (e) {}
      }

      if (success) {
        toastSuccess('Resource category deleted')
        this.fetchResourceTypes()
      } else {
        toastError('Failed to delete resource category')
      }
    },

    getBookingsCountForResource(name) {
      if (!name) return 0
      return this.bookings.filter(b => (b.resource_type || '').toLowerCase() === name.toLowerCase()).length
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
      if (parseFloat(diffHrs) < 24) {
        return `${parseFloat(diffHrs)} hr${parseFloat(diffHrs) === 1 ? '' : 's'}`
      }

      const diffDays = Math.round(diffMins / (60 * 24))
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`
    },

    getResourceIcon(type) {
      const t = (type || '').toLowerCase()
      if (t.includes('room') || t.includes('conference') || t.includes('cabin')) return 'fas fa-door-open'
      if (t.includes('laptop') || t.includes('computer') || t.includes('mac') || t.includes('pc')) return 'fas fa-laptop'
      if (t.includes('projector') || t.includes('screen') || t.includes('tv') || t.includes('display')) return 'fas fa-video'
      if (t.includes('car') || t.includes('vehicle') || t.includes('van') || t.includes('bike')) return 'fas fa-car'
      if (t.includes('camera') || t.includes('dslr') || t.includes('mic') || t.includes('audio')) return 'fas fa-camera'
      if (t.includes('tool') || t.includes('kit') || t.includes('meter')) return 'fas fa-tools'
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

    getUserInitials(name) {
      if (!name) return 'U'
      const parts = name.trim().split(' ')
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return name.substring(0, 2).toUpperCase()
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

    truncateText(text, len) {
      if (!text) return ''
      return text.length > len ? text.substring(0, len) + '...' : text
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
    this.fetchData()

    const token = localStorage.getItem('token') || localStorage.getItem('admin_token')
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
}

/* Header Modern */
.content-header-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 24px 32px;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title-icon-wrapper {
  position: relative;
}

.title-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

.badge-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #4f46e5;
  background: #eef2ff;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
}

.subtitle-modern {
  font-size: 13px;
  color: #64748b;
  margin: 2px 0 0;
}

.header-actions-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-primary-modern {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  border: none;
  padding: 12px 22px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.3);
}

.btn-primary-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
}

.btn-secondary-modern {
  background: #f8fafc;
  color: #334155;
  border: 1.5px solid #e2e8f0;
  padding: 11px 18px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary-modern:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-outline-modern {
  background: #ffffff;
  color: #4f46e5;
  border: 1.5px solid #c7d2fe;
  padding: 11px 18px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-outline-modern:hover {
  background: #eef2ff;
  border-color: #818cf8;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 18px;
  margin-bottom: 16px;
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

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.m-action-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
}

.m-action-btn.primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

.m-action-btn.secondary {
  background: #f1f5f9;
  color: #334155;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  border: 1.5px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.stat-card:hover,
.stat-card.active {
  transform: translateY(-3px);
  border-color: #c7d2fe;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.08);
}

.stat-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  position: relative;
  flex-shrink: 0;
}

.bg-indigo { background: #eef2ff; color: #4f46e5; }
.bg-emerald { background: #ecfdf5; color: #10b981; }
.bg-amber { background: #fffbeb; color: #f59e0b; }
.bg-purple { background: #f5f3ff; color: #8b5cf6; }

.live-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px #ffffff;
  animation: pulseLive 2s infinite;
}

@keyframes pulseLive {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  display: block;
  line-height: 1.1;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-top: 3px;
  display: block;
}

.stat-trend {
  position: absolute;
  top: 16px;
  right: 18px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.text-emerald { color: #059669; }

/* Workspace Card */
.workspace-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  padding: 24px;
}

/* Toolbar */
.workspace-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 24px;
}

.tabs-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 5px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.nav-tab {
  background: transparent;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.nav-tab.active {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  min-width: 280px;
}

.search-box input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  background: #ffffff;
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.select-filter select {
  padding: 10px 16px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  outline: none;
  cursor: pointer;
}

.view-switch-btns {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
}

.switch-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.switch-btn.active {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

/* Cards Grid View */
.bookings-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.booking-item-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #f1f5f9;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.booking-item-card:hover {
  transform: translateY(-4px);
  border-color: #cbd5e1;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
}

.booking-item-card.active-now {
  border-color: #a7f3d0;
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}

.booking-item-card.upcoming {
  border-color: #bae6fd;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.resource-badge-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.resource-info h4 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.booking-id-tag {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  text-transform: uppercase;
}

.status-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-pill.active-now {
  background: #d1fae5;
  color: #065f46;
}
.status-pill.active-now .dot { background: #10b981; }

.status-pill.upcoming {
  background: #e0f2fe;
  color: #0369a1;
}
.status-pill.upcoming .dot { background: #0284c7; }

.status-pill.completed {
  background: #f1f5f9;
  color: #64748b;
}
.status-pill.completed .dot { background: #94a3b8; }

/* Card Details */
.card-details-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 14px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-row.full {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.detail-label i {
  color: #94a3b8;
  font-size: 12px;
}

.detail-val {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-init {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-val.highlight {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-tag {
  color: #0f172a;
}

.time-tag {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 11px;
  color: #334155;
}

.purpose-box {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

/* Card Bottom Actions */
.card-bottom-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.duration-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  padding: 6px 12px;
  border-radius: 20px;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-action {
  border: none;
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-action.edit {
  background: #f1f5f9;
  color: #334155;
}
.btn-action.edit:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-action.delete {
  background: #fee2e2;
  color: #dc2626;
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
}
.btn-action.delete:hover {
  background: #fca5a5;
  color: #991b1b;
}

/* Table View Styles */
.table-responsive-wrapper {
  overflow-x: auto;
}

.modern-executive-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.modern-executive-table thead th {
  background: #f8fafc;
  padding: 14px 16px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
}

.modern-executive-table tbody td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.modern-executive-table tbody tr:hover td {
  background: #fafafa;
}

.id-col {
  font-weight: 700;
  color: #94a3b8;
}

.table-resource-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.t-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.t-resource-name {
  font-weight: 700;
  color: #0f172a;
}

.table-user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.t-user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.t-user-name {
  font-weight: 700;
  color: #1e293b;
  display: block;
}

.t-user-dept {
  font-size: 11px;
  color: #64748b;
  display: block;
}

.datetime-pill {
  display: flex;
  flex-direction: column;
}

.d-date {
  font-weight: 600;
  color: #0f172a;
}

.d-time {
  font-size: 11px;
  color: #64748b;
}

.table-duration {
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.t-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.t-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.t-btn.edit { background: #f1f5f9; color: #334155; }
.t-btn.edit:hover { background: #e2e8f0; color: #0f172a; }

.t-btn.delete { background: #fee2e2; color: #dc2626; }
.t-btn.delete:hover { background: #fca5a5; color: #991b1b; }

/* Catalog Management View */
.catalog-management-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.catalog-top-banner {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border: 1.5px solid #ddd6fe;
  border-radius: 18px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.banner-text h3 {
  font-size: 18px;
  font-weight: 800;
  color: #4c1d95;
  margin: 0 0 4px;
}

.banner-text p {
  font-size: 13px;
  color: #6d28d9;
  margin: 0;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.catalog-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #f1f5f9;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.2s;
}

.catalog-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  border-color: #c7d2fe;
}

.catalog-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.catalog-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.catalog-title-row h4 {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.active-badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  background: #d1fae5;
  color: #065f46;
  padding: 2px 8px;
  border-radius: 10px;
}

.catalog-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 10px;
  min-height: 38px;
}

.catalog-meta {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.catalog-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.c-btn {
  flex: 1;
  padding: 8px;
  border-radius: 10px;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.c-btn.edit { background: #f1f5f9; color: #334155; }
.c-btn.edit:hover { background: #e2e8f0; color: #0f172a; }

.c-btn.delete { background: #fee2e2; color: #dc2626; flex: 0 0 36px; }
.c-btn.delete:hover { background: #fca5a5; color: #991b1b; }

/* Empty & Loading States */
.loading-state-box {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner-custom {
  width: 44px;
  height: 44px;
  border: 3px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state-modern {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}

.empty-state-modern h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.empty-state-modern p {
  font-size: 13px;
  color: #64748b;
  margin: 0 auto 20px;
  max-width: 380px;
}

.btn-empty-action {
  background: #4f46e5;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
}

.modal-card-modern {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: scaleModal 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleModal {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header-gradient {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.modal-header-gradient.purple-theme {
  background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%);
}

.m-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.m-header-text h3 {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.m-header-text p {
  font-size: 12px;
  color: #94a3b8;
  margin: 2px 0 0;
}

.m-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.m-close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.modal-body-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-label i {
  color: #6366f1;
}

.req { color: #ef4444; }

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.custom-input,
.custom-select,
.custom-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
  background: #ffffff;
}

.custom-input:focus,
.custom-select:focus,
.custom-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.duration-helper-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.helper-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
}

.helper-chips {
  display: flex;
  gap: 6px;
}

.helper-chip {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.helper-chip:hover {
  background: #e0e7ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.modal-footer-modern {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.btn-modal-cancel {
  background: #f1f5f9;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.btn-modal-cancel:hover { background: #e2e8f0; color: #1e293b; }

.btn-modal-submit {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-modal-submit.purple-btn {
  background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%);
}

.btn-modal-submit:hover:not(:disabled) {
  opacity: 0.95;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    flex-direction: column;
  }
  .workspace-card {
    padding: 16px;
    border-radius: 20px;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .stat-card {
    padding: 14px;
    gap: 12px;
  }
  .stat-icon-box {
    width: 42px;
    height: 42px;
    font-size: 18px;
  }
  .stat-number {
    font-size: 20px;
  }
  .stat-trend {
    display: none;
  }
  .bookings-cards-grid {
    grid-template-columns: 1fr;
  }
  .search-box {
    min-width: 100%;
  }
  .select-filter {
    width: 100%;
  }
  .select-filter select {
    width: 100%;
  }
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>