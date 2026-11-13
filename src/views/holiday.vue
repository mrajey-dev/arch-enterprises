<template>
  <div class="layout">
    <!-- Main Content Flow -->
    <div class="main-content">
      <!-- Stationary Fixed Admin Sidebar -->
      <Sidebar ref="sidebarRef" />

      <section class="content">
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-calendar-alt"></i>
            <span>Holiday Calendar</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-add-holiday-sm" @click="openAddModal" title="Add Holiday">
              <i class="fas fa-plus"></i>
              <span>Add</span>
            </button>
            <button class="btn-mobile-menu" @click="toggleMobileSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Top Banner -->
        <header class="holiday-top-banner">
          <div class="banner-left">
            <div class="banner-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>COMPANY CALENDAR</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-calendar-alt"></i> {{ filteredHolidays.length }} Holidays in {{ filterYear }}
              </span>
              <span class="status-meta-pill success">
                <i class="fas fa-check-circle"></i> {{ activeHolidaysCount }} Active
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-sync-alt"></i> {{ recurringCount }} Recurring Annual
              </span>
              <span class="status-meta-pill upcoming-pill" v-if="nextUpcomingHoliday">
                <i class="fas fa-gift"></i> Next: <strong>{{ nextUpcomingHoliday.name }}</strong> ({{ formatDayAndMonth(nextUpcomingHoliday) }})
              </span>
            </div>
            <h1 class="page-title">Holiday Management</h1>
            <p class="page-subtitle">
              Configure official public and company holidays, manage recurring annual observances, and schedule workforce non-working calendar days.
            </p>
          </div>

          <div class="banner-right-actions">
            <button class="btn-add-holiday" @click="openAddModal">
              <i class="fas fa-plus-circle"></i>
              <span>Add New Holiday</span>
            </button>
          </div>
        </header>

        <!-- 📊 Holiday Summary KPI Cards -->
        <div class="holiday-stats-grid">
          <div class="holiday-stat-card">
            <div class="stat-icon-halo primary">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-details">
              <span class="stat-label">Total Holidays</span>
              <div class="stat-value-row">
                <span class="stat-value">{{ filteredHolidays.length }}</span>
                <span class="stat-sub-tag">{{ filterYear }} Calendar</span>
              </div>
            </div>
          </div>

          <div class="holiday-stat-card">
            <div class="stat-icon-halo emerald">
              <i class="fas fa-globe-americas"></i>
            </div>
            <div class="stat-details">
              <span class="stat-label">Public Holidays</span>
              <div class="stat-value-row">
                <span class="stat-value">{{ publicCount }}</span>
                <span class="stat-sub-tag success">Mandatory Paid</span>
              </div>
            </div>
          </div>

          <div class="holiday-stat-card">
            <div class="stat-icon-halo purple">
              <i class="fas fa-sync-alt"></i>
            </div>
            <div class="stat-details">
              <span class="stat-label">Annual Recurring</span>
              <div class="stat-value-row">
                <span class="stat-value">{{ recurringCount }}</span>
                <span class="stat-sub-tag">Auto-repeats</span>
              </div>
            </div>
          </div>

          <div class="holiday-stat-card next-holiday-card" v-if="nextUpcomingHoliday">
            <div class="stat-icon-halo amber">
              <i class="fas fa-gift"></i>
            </div>
            <div class="stat-details">
              <span class="stat-label">Next Observance</span>
              <div class="stat-value-row">
                <span class="stat-holiday-name">{{ nextUpcomingHoliday.name }}</span>
                <span class="stat-days-badge" v-if="nextUpcomingHoliday.diffDays !== undefined">
                  {{ nextUpcomingHoliday.diffDays === 0 ? 'Today!' : nextUpcomingHoliday.diffDays === 1 ? 'Tomorrow' : `In ${nextUpcomingHoliday.diffDays} days` }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 🔍 Unified Toolbar & Filter Bar -->
        <div class="holiday-toolbar-card">
          <div class="toolbar-search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="filterHolidays"
              class="toolbar-search-input"
              placeholder="Search holidays by name or description..." 
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''; filterHolidays()" title="Clear search">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="toolbar-filter-controls">
            <!-- Year Selector -->
            <div class="select-pill-wrapper">
              <i class="fas fa-calendar filter-select-icon"></i>
              <select v-model="filterYear" @change="filterHolidays" class="toolbar-select">
                <option v-for="year in yearOptions" :key="year" :value="year">
                  Year {{ year }}
                </option>
              </select>
            </div>

            <!-- Type Filter -->
            <div class="select-pill-wrapper">
              <i class="fas fa-tag filter-select-icon"></i>
              <select v-model="filterType" @change="filterHolidays" class="toolbar-select">
                <option value="all">All Holiday Types</option>
                <option value="public">Public Holidays</option>
                <option value="company">Company Holidays</option>
              </select>
            </div>

            <!-- View Switcher -->
            <div class="view-mode-tabs">
              <button 
                type="button" 
                class="view-tab-btn" 
                :class="{ active: viewMode === 'table' }"
                @click="viewMode = 'table'"
                title="Data Table View"
              >
                <i class="fas fa-table"></i>
                <span>Table</span>
              </button>
              <button 
                type="button" 
                class="view-tab-btn" 
                :class="{ active: viewMode === 'cards' }"
                @click="viewMode = 'cards'"
                title="Visual Calendar Cards View"
              >
                <i class="fas fa-th-large"></i>
                <span>Cards</span>
              </button>
            </div>
          </div>

          <div class="toolbar-stats-pill">
            <i class="fas fa-filter"></i>
            <span>{{ filteredHolidays.length }} of {{ holidays.length }} Holidays</span>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- 📋 1. DATA TABLE VIEW                                    -->
        <!-- ========================================================= -->
        <div v-if="viewMode === 'table'" class="table-card-wrapper">
          <div class="table-responsive-box">
            <table class="holiday-table">
              <thead>
                <tr>
                  <th class="th-num">#</th>
                  <th class="th-holiday">Holiday Name</th>
                  <th class="th-date">Scheduled Date</th>
                  <th class="th-day">Day of Week</th>
                  <th class="th-type">Type</th>
                  <th class="th-cadence">Cadence</th>
                  <th class="th-status">Status</th>
                  <th class="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="8" class="table-state-cell">
                    <div class="empty-content">
                      <i class="fas fa-spinner fa-spin text-primary"></i>
                      <h4>Loading holidays...</h4>
                      <p>Fetching holiday schedule from server</p>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="filteredHolidays.length === 0">
                  <td colspan="8" class="table-state-cell">
                    <div class="empty-content">
                      <i class="fas fa-calendar-times"></i>
                      <h4>No holidays found</h4>
                      <p>No records match your selected year or filter query.</p>
                      <button type="button" class="btn-clear-table-search" @click="resetFilters">
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-for="(holiday, index) in paginatedHolidays" :key="holiday.id" class="holiday-row">
                  <td class="td-num">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  
                  <td class="td-holiday">
                    <div class="holiday-name-cell">
                      <div class="holiday-tile-badge" :class="holiday.type">
                        <i :class="getTypeIcon(holiday.type)"></i>
                      </div>
                      <div class="holiday-meta-col">
                        <span class="holiday-title">{{ holiday.name }}</span>
                        <span v-if="holiday.description" class="holiday-desc" :title="holiday.description">
                          {{ holiday.description }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td class="td-date">
                    <div class="date-chip">
                      <i class="fas fa-calendar-day"></i>
                      <span class="date-txt">
                        <template v-if="holiday.is_recurring">
                          {{ formatMonthDay(holiday.month_day) }}
                        </template>
                        <template v-else>
                          {{ formatDate(holiday.date) }}
                        </template>
                      </span>
                    </div>
                  </td>

                  <td class="td-day">
                    <span class="day-chip">
                      {{ getHolidayDayOfWeek(holiday, filterYear) }}
                    </span>
                  </td>

                  <td class="td-type">
                    <span class="type-pill" :class="holiday.type">
                      <i :class="getTypeIcon(holiday.type)"></i>
                      <span>{{ capitalize(holiday.type) }}</span>
                    </span>
                  </td>

                  <td class="td-cadence">
                    <span class="cadence-pill" :class="holiday.is_recurring ? 'recurring' : 'single'">
                      <i :class="holiday.is_recurring ? 'fas fa-sync-alt' : 'fas fa-calendar-check'"></i>
                      <span>{{ holiday.is_recurring ? 'Annual Repeat' : 'One-time Event' }}</span>
                    </span>
                  </td>

                  <td class="td-status">
                    <span class="status-pill" :class="holiday.is_active ? 'active' : 'inactive'">
                      <span class="status-dot"></span>
                      <span>{{ holiday.is_active ? 'Active' : 'Inactive' }}</span>
                    </span>
                  </td>

                  <td class="td-actions">
                    <div class="actions">
                      <button 
                        class="action-btn edit" 
                        @click="openEditModal(holiday)" 
                        title="Edit Holiday Details"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        class="action-btn toggle" 
                        :class="holiday.is_active ? 'deactivate' : 'activate'" 
                        @click="toggleStatus(holiday)" 
                        :title="holiday.is_active ? 'Deactivate Holiday' : 'Activate Holiday'"
                      >
                        <i :class="holiday.is_active ? 'fas fa-pause' : 'fas fa-play'"></i>
                      </button>
                      <button 
                        class="action-btn delete" 
                        @click="confirmDelete(holiday)" 
                        title="Delete Holiday"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div class="pagination-bar" v-if="totalPages > 1">
            <div class="pagination-info">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredHolidays.length) }} of {{ filteredHolidays.length }} holidays
            </div>
            <div class="pagination-controls">
              <button 
                class="btn-page-nav" 
                @click="prevPage" 
                :disabled="currentPage === 1"
                aria-label="Previous Page"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="page-pills">
                <button 
                  v-for="page in totalPages" 
                  :key="page" 
                  class="btn-page-num" 
                  :class="{ active: currentPage === page }"
                  @click="currentPage = page"
                >
                  {{ page }}
                </button>
              </div>
              <button 
                class="btn-page-nav" 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
                aria-label="Next Page"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- 🎨 2. VISUAL CALENDAR CARDS GRID VIEW                    -->
        <!-- ========================================================= -->
        <div v-else class="cards-view-wrapper">
          <div class="holiday-cards-grid">
            <div 
              v-for="holiday in paginatedHolidays" 
              :key="holiday.id" 
              class="holiday-visual-card"
              :class="{ 'inactive': !holiday.is_active }"
            >
              <!-- Top Color Stripe based on type -->
              <div class="card-color-stripe" :class="holiday.type"></div>

              <div class="card-body-section">
                <!-- Tear-off calendar date badge -->
                <div class="calendar-date-sheet" :class="holiday.type">
                  <div class="sheet-month-bar">
                    {{ getHolidayMonthStr(holiday, filterYear) }}
                  </div>
                  <div class="sheet-day-num">
                    {{ getHolidayDayNum(holiday) }}
                  </div>
                  <div class="sheet-weekday">
                    {{ getHolidayDayOfWeekShort(holiday, filterYear) }}
                  </div>
                </div>

                <!-- Info Block -->
                <div class="card-info-block">
                  <div class="card-tags-row">
                    <span class="type-pill" :class="holiday.type">
                      <i :class="getTypeIcon(holiday.type)"></i> {{ capitalize(holiday.type) }}
                    </span>
                    <span class="cadence-mini-chip" :class="holiday.is_recurring ? 'recurring' : 'single'">
                      <i :class="holiday.is_recurring ? 'fas fa-sync-alt' : 'fas fa-calendar-check'"></i>
                      {{ holiday.is_recurring ? 'Annual' : 'One-time' }}
                    </span>
                    <span class="status-pill" :class="holiday.is_active ? 'active' : 'inactive'">
                      <span class="status-dot"></span>
                      {{ holiday.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>

                  <h3 class="holiday-card-title">{{ holiday.name }}</h3>
                  <p class="holiday-card-desc" v-if="holiday.description">
                    {{ holiday.description }}
                  </p>
                  <p class="holiday-card-desc empty" v-else>
                    No specific observance details provided.
                  </p>
                </div>
              </div>

              <!-- Card Action Buttons -->
              <div class="card-footer-actions">
                <button class="btn-card-action edit" @click="openEditModal(holiday)" title="Edit">
                  <i class="fas fa-edit"></i>
                  <span>Edit</span>
                </button>
                <button 
                  class="btn-card-action toggle" 
                  :class="holiday.is_active ? 'deactivate' : 'activate'"
                  @click="toggleStatus(holiday)"
                  :title="holiday.is_active ? 'Deactivate' : 'Activate'"
                >
                  <i :class="holiday.is_active ? 'fas fa-pause' : 'fas fa-play'"></i>
                  <span>{{ holiday.is_active ? 'Pause' : 'Activate' }}</span>
                </button>
                <button class="btn-card-action delete" @click="confirmDelete(holiday)" title="Delete">
                  <i class="fas fa-trash-alt"></i>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="filteredHolidays.length === 0" class="cards-empty-state">
            <i class="fas fa-calendar-times"></i>
            <h4>No holidays match your query</h4>
            <p>Try switching to another year or reset your search filters.</p>
            <button type="button" class="btn-clear-table-search" @click="resetFilters">
              Reset Filters
            </button>
          </div>

          <!-- Cards View Pagination -->
          <div class="pagination-bar cards-mode" v-if="totalPages > 1">
            <div class="pagination-info">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredHolidays.length) }} of {{ filteredHolidays.length }} holidays
            </div>
            <div class="pagination-controls">
              <button class="btn-page-nav" @click="prevPage" :disabled="currentPage === 1">
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="page-pills">
                <button 
                  v-for="page in totalPages" 
                  :key="page" 
                  class="btn-page-num" 
                  :class="{ active: currentPage === page }"
                  @click="currentPage = page"
                >
                  {{ page }}
                </button>
              </div>
              <button class="btn-page-nav" @click="nextPage" :disabled="currentPage === totalPages">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ========================================================= -->
    <!-- 🌟 ADD / EDIT HOLIDAY MODAL - PREMIUM ENTERPRISE          -->
    <!-- ========================================================= -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="premium-modal" @click.stop>
          <div class="modal-top-stripe"></div>

          <div class="modal-header-premium">
            <div class="header-icon-box">
              <i :class="isEditing ? 'fas fa-calendar-edit' : 'fas fa-calendar-plus'"></i>
            </div>
            <div class="header-text-block">
              <h2>{{ isEditing ? 'Edit Holiday Observance' : 'Schedule New Holiday' }}</h2>
              <p>Configure observance details, recurrence, and holiday classification.</p>
            </div>
            <button class="modal-close-btn" @click="closeModal" aria-label="Close modal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="saveHoliday" class="modal-form-content">
            <div class="form-body-scroll">
              <div class="form-fields-grid">
                <!-- Holiday Name -->
                <div class="form-field full-width">
                  <label for="holidayName">
                    <span>Holiday Name</span>
                    <span class="required-star">*</span>
                  </label>
                  <div class="input-wrapper">
                    <i class="fas fa-tag field-icon"></i>
                    <input 
                      type="text" 
                      id="holidayName" 
                      v-model="form.name" 
                      required 
                      class="premium-input"
                      placeholder="e.g. Republic Day, Independence Day, Diwali..."
                    />
                  </div>
                </div>

                <!-- Holiday Type -->
                <div class="form-field">
                  <label for="holidayType">
                    <span>Holiday Classification</span>
                    <span class="required-star">*</span>
                  </label>
                  <div class="input-wrapper">
                    <i class="fas fa-layer-group field-icon"></i>
                    <select id="holidayType" v-model="form.type" required class="premium-select">
                      <option value="public">Public Holiday (Gazetted)</option>
                      <option value="company">Company Specific Holiday</option>
                    </select>
                  </div>
                </div>

                <!-- Active Status Toggle -->
                <div class="form-field">
                  <label>
                    <span>Status</span>
                  </label>
                  <div class="status-toggle-card" @click="form.is_active = !form.is_active">
                    <div class="toggle-control-dot" :class="{ 'on': form.is_active }">
                      <span class="switch-ball"></span>
                    </div>
                    <div class="toggle-text-block">
                      <strong>{{ form.is_active ? 'Active Holiday' : 'Inactive (Draft)' }}</strong>
                      <span>{{ form.is_active ? 'Recognized in attendance calendar' : 'Paused, not applied to records' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Recurrence Toggle Card -->
                <div class="form-field full-width">
                  <div class="recurring-option-card" :class="{ 'active': form.is_recurring }" @click="form.is_recurring = !form.is_recurring">
                    <div class="checkbox-indicator">
                      <i :class="form.is_recurring ? 'fas fa-check-square' : 'far fa-square'"></i>
                    </div>
                    <div class="recurring-info">
                      <div class="recurring-title-row">
                        <strong>Annual Recurring Observance</strong>
                        <span class="badge-pill-recurring">Repeats Every Year</span>
                      </div>
                      <p>Enable for fixed-date yearly observances (e.g. 26 Jan, 15 Aug, 02 Oct). The date automatically repeats across all past and future years.</p>
                    </div>
                  </div>
                </div>

                <!-- Date or Month-Day Input -->
                <div class="form-field full-width">
                  <label for="holidayDate">
                    <span>{{ form.is_recurring ? 'Annual Month & Day (MM-DD)' : 'Holiday Date' }}</span>
                    <span class="required-star">*</span>
                  </label>
                  
                  <div v-if="!form.is_recurring" class="input-wrapper">
                    <i class="fas fa-calendar-alt field-icon"></i>
                    <input 
                      type="date" 
                      id="holidayDate" 
                      v-model="form.date" 
                      required 
                      class="premium-input"
                    />
                  </div>

                  <div v-else class="input-wrapper">
                    <i class="fas fa-calendar-day field-icon"></i>
                    <input 
                      type="text" 
                      id="holidayDate" 
                      v-model="form.month_day" 
                      required 
                      class="premium-input"
                      placeholder="MM-DD (e.g. 01-26 for Jan 26, 08-15 for Aug 15)"
                      pattern="\d{2}-\d{2}"
                    />
                    <span class="input-hint-chip">Format: MM-DD</span>
                  </div>
                  <span class="field-helper-txt" v-if="form.is_recurring">
                    Example: Enter <strong>01-26</strong> for January 26th, or <strong>10-02</strong> for October 2nd.
                  </span>
                </div>

                <!-- Description -->
                <div class="form-field full-width">
                  <label for="holidayDescription">
                    <span>Observance Description / Note</span>
                    <span class="optional-tag">(Optional)</span>
                  </label>
                  <div class="input-wrapper textarea-wrapper">
                    <i class="fas fa-align-left field-icon textarea-icon"></i>
                    <textarea 
                      id="holidayDescription" 
                      v-model="form.description" 
                      placeholder="Brief note about the holiday, historical context, or company celebration plans..."
                      rows="3"
                      class="premium-textarea"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer-premium">
              <button type="button" class="btn-cancel" @click="closeModal">
                <i class="fas fa-times"></i>
                <span>Cancel</span>
              </button>
              <button type="submit" class="btn-submit" :disabled="isSaving">
                <i :class="isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                <span>{{ isSaving ? 'Saving Holiday...' : isEditing ? 'Update Holiday' : 'Save Holiday' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- ========================================================= -->
    <!-- ⚠️ DELETE CONFIRMATION MODAL                              -->
    <!-- ========================================================= -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
        <div class="delete-modal-card" @click.stop>
          <div class="delete-top-stripe"></div>
          
          <div class="delete-icon-box">
            <i class="fas fa-exclamation-triangle"></i>
          </div>

          <h3 class="delete-title">Delete Holiday Observance?</h3>
          <p class="delete-message">
            Are you sure you want to permanently remove <strong>"{{ deleteHoliday?.name }}"</strong> from the holiday calendar?
          </p>
          <div class="delete-warning-box">
            <i class="fas fa-info-circle"></i>
            <span>This action cannot be undone. Attendance tracking records for this date may require recalculation.</span>
          </div>

          <div class="delete-modal-actions">
            <button class="btn-delete-cancel" @click="closeDeleteModal" :disabled="isDeleting">
              <i class="fas fa-times"></i>
              <span>Cancel</span>
            </button>
            <button class="btn-delete-confirm" @click="deleteHolidayConfirm" :disabled="isDeleting">
              <i :class="isDeleting ? 'fas fa-spinner fa-spin' : 'fas fa-trash-alt'"></i>
              <span>{{ isDeleting ? 'Deleting...' : 'Yes, Delete Holiday' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from '../components/Sidebar.vue';
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  name: 'HolidayManagement',
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      isEditing: false,
      showModal: false,
      showDeleteModal: false,
      viewMode: sessionStorage.getItem('arch_holiday_view_mode') || 'table',
      
      // Filters
      filterYear: new Date().getFullYear(),
      filterType: 'all',
      searchQuery: '',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Data
      holidays: [],
      filteredHolidays: [],
      deleteHoliday: null,
      
      // Form
      form: {
        id: null,
        name: '',
        date: '',
        month_day: '',
        is_recurring: false,
        type: 'public',
        description: '',
        is_active: true
      },
      
      // Options
      yearOptions: []
    };
  },
  watch: {
    viewMode(newMode) {
      sessionStorage.setItem('arch_holiday_view_mode', newMode);
    },
    filterYear() {
      this.filterHolidays();
    },
    filterType() {
      this.filterHolidays();
    },
    showModal(val) {
      document.body.style.overflow = val ? 'hidden' : '';
    },
    showDeleteModal(val) {
      document.body.style.overflow = val ? 'hidden' : '';
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredHolidays.length / this.itemsPerPage) || 1;
    },
    paginatedHolidays() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredHolidays.slice(start, start + this.itemsPerPage);
    },
    activeHolidaysCount() {
      return this.filteredHolidays.filter(h => h.is_active).length;
    },
    recurringCount() {
      return this.filteredHolidays.filter(h => h.is_recurring).length;
    },
    publicCount() {
      return this.filteredHolidays.filter(h => h.type === 'public').length;
    },
    nextUpcomingHoliday() {
      if (!this.holidays || !this.holidays.length) return null;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const upcoming = [];
      this.holidays.forEach(h => {
        if (!h.is_active) return;
        let targetDate = null;
        if (h.is_recurring && h.month_day) {
          const parts = String(h.month_day).split('-');
          if (parts.length === 2) {
            const mm = parseInt(parts[0], 10);
            const dd = parseInt(parts[1], 10);
            targetDate = new Date(now.getFullYear(), mm - 1, dd);
            if (targetDate < today) {
              targetDate = new Date(now.getFullYear() + 1, mm - 1, dd);
            }
          }
        } else if (h.date) {
          targetDate = new Date(h.date);
        }
        
        if (targetDate && !isNaN(targetDate.getTime()) && targetDate >= today) {
          const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
          upcoming.push({ ...h, targetDate, diffDays });
        }
      });
      
      upcoming.sort((a, b) => a.targetDate - b.targetDate);
      return upcoming.length ? upcoming[0] : null;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.generateYearOptions();
    this.fetchHolidays();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
    document.body.style.overflow = '';
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleMobileSidebar() {
      if (this.$refs.sidebarRef && typeof this.$refs.sidebarRef.toggleCollapse === 'function') {
        this.$refs.sidebarRef.toggleCollapse();
      }
    },
    generateYearOptions() {
      const currentYear = new Date().getFullYear();
      this.yearOptions = [];
      for (let year = currentYear - 3; year <= currentYear + 4; year++) {
        this.yearOptions.push(year);
      }
    },
    async fetchHolidays() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'https://employees.archenterprises.co.in/api/api/holidays/all',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data && response.data.success) {
          this.holidays = response.data.data || [];
          this.filterHolidays();
        } else {
          toastError('Failed to fetch holidays');
        }
      } catch (error) {
        console.error('Error fetching holidays:', error);
        toastError('Error loading holidays');
      } finally {
        this.isLoading = false;
      }
    },
    filterHolidays() {
      let filtered = [...this.holidays];
      
      // Filter by year
      if (this.filterYear) {
        filtered = filtered.filter(h => {
          if (h.is_recurring) {
            return true; // Recurring holidays show across all years
          }
          if (h.date) {
            return new Date(h.date).getFullYear() === parseInt(this.filterYear, 10);
          }
          return false;
        });
      }
      
      // Filter by type
      if (this.filterType !== 'all') {
        filtered = filtered.filter(h => h.type === this.filterType);
      }
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(h => 
          (h.name && h.name.toLowerCase().includes(query)) ||
          (h.description && h.description.toLowerCase().includes(query))
        );
      }
      
      // Sort: chronological
      filtered.sort((a, b) => {
        const dateA = this.getComparableDate(a, this.filterYear);
        const dateB = this.getComparableDate(b, this.filterYear);
        return dateA - dateB;
      });
      
      this.filteredHolidays = filtered;
      this.currentPage = 1;
    },
    getComparableDate(h, year) {
      if (h.is_recurring && h.month_day) {
        const parts = String(h.month_day).split('-');
        if (parts.length === 2) {
          return new Date(year, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
        }
      }
      if (h.date) {
        return new Date(h.date);
      }
      return new Date(9999, 11, 31);
    },
    resetFilters() {
      this.searchQuery = '';
      this.filterType = 'all';
      this.filterYear = new Date().getFullYear();
      this.filterHolidays();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    openAddModal() {
      this.isEditing = false;
      this.form = {
        id: null,
        name: '',
        date: '',
        month_day: '',
        is_recurring: false,
        type: 'public',
        description: '',
        is_active: true
      };
      this.showModal = true;
    },
    openEditModal(holiday) {
      this.isEditing = true;
      this.form = {
        id: holiday.id,
        name: holiday.name,
        date: holiday.date || '',
        month_day: holiday.month_day || '',
        is_recurring: Boolean(holiday.is_recurring),
        type: holiday.type || 'public',
        description: holiday.description || '',
        is_active: holiday.is_active !== undefined ? Boolean(holiday.is_active) : true
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.isSaving = false;
    },
    async saveHoliday() {
      if (!this.form.name.trim()) {
        toastWarning('Holiday name is required');
        return;
      }
      
      if (this.form.is_recurring) {
        if (!this.form.month_day || !this.form.month_day.match(/^\d{2}-\d{2}$/)) {
          toastWarning('Please enter date in MM-DD format (e.g., 01-26)');
          return;
        }
      } else {
        if (!this.form.date) {
          toastWarning('Holiday date is required');
          return;
        }
      }
      
      this.isSaving = true;
      try {
        const token = localStorage.getItem('token');
        const url = this.isEditing 
          ? `https://employees.archenterprises.co.in/api/api/holidays/${this.form.id}`
          : 'https://employees.archenterprises.co.in/api/api/holidays';
        
        const method = this.isEditing ? 'put' : 'post';
        
        const payload = {
          name: this.form.name.trim(),
          type: this.form.type,
          description: this.form.description ? this.form.description.trim() : '',
          is_active: Boolean(this.form.is_active),
          is_recurring: Boolean(this.form.is_recurring)
        };
        
        if (this.form.is_recurring) {
          payload.month_day = this.form.month_day;
          payload.date = null;
        } else {
          payload.date = this.form.date;
          payload.month_day = null;
        }
        
        const response = await axios[method](url, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.success) {
          toastSuccess(this.isEditing ? 'Holiday updated successfully!' : 'Holiday scheduled successfully!');
          this.closeModal();
          this.fetchHolidays();
        } else {
          toastError('Failed to save holiday');
        }
      } catch (error) {
        console.error('Error saving holiday:', error);
        toastError(error.response?.data?.message || 'Error saving holiday');
      } finally {
        this.isSaving = false;
      }
    },
    confirmDelete(holiday) {
      this.deleteHoliday = holiday;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteHoliday = null;
      this.isDeleting = false;
    },
    async deleteHolidayConfirm() {
      if (!this.deleteHoliday) return;
      
      this.isDeleting = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(
          `https://employees.archenterprises.co.in/api/api/holidays/${this.deleteHoliday.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data && response.data.success) {
          toastSuccess('Holiday removed from calendar');
          this.closeDeleteModal();
          this.fetchHolidays();
        } else {
          toastError('Failed to delete holiday');
        }
      } catch (error) {
        console.error('Error deleting holiday:', error);
        toastError('Error deleting holiday');
      } finally {
        this.isDeleting = false;
      }
    },
    async toggleStatus(holiday) {
      try {
        const token = localStorage.getItem('token');
        const newStatus = !holiday.is_active;
        const response = await axios.put(
          `https://employees.archenterprises.co.in/api/api/holidays/${holiday.id}`,
          {
            ...holiday,
            is_active: newStatus
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data && response.data.success) {
          holiday.is_active = newStatus;
          toastSuccess(`Holiday ${newStatus ? 'activated' : 'deactivated'}`);
        } else {
          toastError('Failed to update status');
        }
      } catch (error) {
        console.error('Error toggling holiday status:', error);
        toastError('Error updating holiday status');
      }
    },
    formatDate(date) {
      if (!date) return '—';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    formatMonthDay(monthDay) {
      if (!monthDay) return '—';
      const parts = String(monthDay).split('-');
      if (parts.length !== 2) return monthDay;
      const mm = parseInt(parts[0], 10);
      const dd = parseInt(parts[1], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${dd} ${months[mm - 1] || ''} (Annual)`;
    },
    formatDayAndMonth(holiday) {
      if (!holiday) return '';
      if (holiday.month_day) {
        const parts = String(holiday.month_day).split('-');
        if (parts.length === 2) {
          const mm = parseInt(parts[0], 10);
          const dd = parseInt(parts[1], 10);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${dd} ${months[mm - 1]}`;
        }
      }
      if (holiday.date) {
        const d = new Date(holiday.date);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }
      return '';
    },
    getHolidayDayOfWeek(holiday, year) {
      let targetDate = null;
      if (holiday.is_recurring && holiday.month_day) {
        const parts = String(holiday.month_day).split('-');
        if (parts.length === 2) {
          targetDate = new Date(year, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
        }
      } else if (holiday.date) {
        targetDate = new Date(holiday.date);
      }
      if (!targetDate || isNaN(targetDate.getTime())) return '—';
      return targetDate.toLocaleDateString('en-IN', { weekday: 'long' });
    },
    getHolidayDayOfWeekShort(holiday, year) {
      let targetDate = null;
      if (holiday.is_recurring && holiday.month_day) {
        const parts = String(holiday.month_day).split('-');
        if (parts.length === 2) {
          targetDate = new Date(year, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
        }
      } else if (holiday.date) {
        targetDate = new Date(holiday.date);
      }
      if (!targetDate || isNaN(targetDate.getTime())) return '';
      return targetDate.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
    },
    getHolidayMonthStr(holiday, year) {
      let targetDate = null;
      if (holiday.is_recurring && holiday.month_day) {
        const parts = String(holiday.month_day).split('-');
        if (parts.length === 2) {
          targetDate = new Date(year, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
        }
      } else if (holiday.date) {
        targetDate = new Date(holiday.date);
      }
      if (!targetDate || isNaN(targetDate.getTime())) return 'CAL';
      return targetDate.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
    },
    getHolidayDayNum(holiday) {
      if (holiday.month_day) {
        const parts = String(holiday.month_day).split('-');
        if (parts.length === 2) return parts[1];
      }
      if (holiday.date) {
        const d = new Date(holiday.date);
        if (!isNaN(d.getTime())) return String(d.getDate()).padStart(2, '0');
      }
      return '—';
    },
    getTypeIcon(type) {
      const icons = {
        public: 'fas fa-globe-americas',
        company: 'fas fa-building',
        optional: 'fas fa-calendar-check'
      };
      return icons[type] || 'fas fa-calendar-day';
    },
    capitalize(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* Variables */
:root {
  --primary: #4f46e5;
  --primary-color: #4f46e5;
  --dark: #0f172a;
  --gray: #f8fafc;
  --border: #e2e8f0;
  --success: #10b981;
  --danger: #ef4444;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background-color: transparent;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

/* Main Content Styles & Stationary Sidebar Flow */
.main-content {
  display: flex;
  padding: 20px 24px;
  gap: 20px;
  min-height: calc(100vh - 78px);
  position: relative;
  box-sizing: border-box;
  width: 100%;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-x: hidden;
}

/* 📱 Mobile Top Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.mobile-title i {
  color: #4f46e5;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add-holiday-sm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-mobile-menu {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
}

/* 🏢 Modern Enterprise Top Banner */
.holiday-top-banner {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.banner-left {
  flex: 1;
}

.banner-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #c7d2fe;
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.status-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
}

.status-meta-pill i {
  color: #4f46e5;
}

.status-meta-pill.success {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}

.status-meta-pill.success i {
  color: #059669;
}

.status-meta-pill.upcoming-pill {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

.status-meta-pill.upcoming-pill i {
  color: #d97706;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
  line-height: 1.45;
}

.banner-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-add-holiday {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #4f46e5;
  border: 1px solid #4338ca;
  border-radius: 10px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);
  white-space: nowrap;
}

.btn-add-holiday:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

/* 📊 Holiday Summary KPI Cards Grid */
.holiday-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.holiday-stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.holiday-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.stat-icon-halo {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-icon-halo.primary {
  background: #eef2ff;
  color: #4f46e5;
}

.stat-icon-halo.emerald {
  background: #ecfdf5;
  color: #059669;
}

.stat-icon-halo.purple {
  background: #faf5ff;
  color: #7c3aed;
}

.stat-icon-halo.amber {
  background: #fffbeb;
  color: #d97706;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.stat-sub-tag {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 6px;
}

.stat-sub-tag.success {
  background: #ecfdf5;
  color: #065f46;
}

.stat-holiday-name {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.stat-days-badge {
  font-size: 11px;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  padding: 2px 8px;
  border-radius: 9999px;
  white-space: nowrap;
}

/* 🔍 Unified Toolbar & Filter Bar */
.holiday-toolbar-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.toolbar-search-wrapper {
  position: relative;
  flex: 1;
  min-width: 240px;
  max-width: 380px;
}

.toolbar-search-wrapper .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13.5px;
  pointer-events: none;
}

.toolbar-search-input {
  box-sizing: border-box !important;
  width: 100%;
  height: 40px;
  padding: 8px 36px 8px 38px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.toolbar-search-input:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 50%;
  font-size: 12px;
}

.clear-search-btn:hover {
  color: #ef4444;
}

.toolbar-filter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.select-pill-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.filter-select-icon {
  position: absolute;
  left: 12px;
  color: #64748b;
  font-size: 12px;
  pointer-events: none;
}

.toolbar-select {
  height: 38px;
  padding: 0 28px 0 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 14px;
}

.toolbar-select:focus {
  border-color: #4f46e5;
  background-color: #ffffff;
}

/* View Mode Switcher Segmented Control */
.view-mode-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 10px;
  gap: 3px;
  border: 1px solid #e2e8f0;
}

.view-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.view-tab-btn:hover {
  color: #0f172a;
}

.view-tab-btn.active {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.toolbar-stats-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.toolbar-stats-pill i {
  color: #4f46e5;
}

/* ========================================================= */
/* 📋 1. MODERN ENTERPRISE TABLE STYLES                      */
/* ========================================================= */
.table-card-wrapper {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 24px;
  width: 100%;
}

.table-responsive-box {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.table-responsive-box::-webkit-scrollbar {
  height: 6px;
}

.table-responsive-box::-webkit-scrollbar-track {
  background: #f8fafc;
}

.table-responsive-box::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-responsive-box::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.holiday-table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  text-align: left;
}

.holiday-table thead th {
  padding: 12px 14px;
  background: #f8fafc;
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.holiday-table thead th.th-num {
  width: 44px;
  min-width: 44px;
  max-width: 44px;
  text-align: center;
  padding: 12px 6px;
}

.holiday-table thead th.th-holiday {
  min-width: 220px;
}

.holiday-table thead th.th-date {
  min-width: 160px;
}

.holiday-table thead th.th-day {
  min-width: 120px;
}

.holiday-table thead th.th-type {
  min-width: 110px;
}

.holiday-table thead th.th-cadence {
  min-width: 140px;
}

.holiday-table thead th.th-status {
  min-width: 95px;
}

.holiday-table thead th.th-actions {
  min-width: 130px;
  text-align: right;
  padding-right: 18px;
  position: sticky;
  right: 0;
  background: #f8fafc;
  z-index: 3;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.04);
}

.holiday-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.holiday-row:hover {
  background-color: #f8fafc;
}

.holiday-row td {
  padding: 11px 14px;
  font-size: 13px;
  color: #334155;
  vertical-align: middle;
}

.holiday-row td.td-num {
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  padding: 11px 6px;
}

.holiday-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.holiday-tile-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.holiday-tile-badge.public {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.holiday-tile-badge.company {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.holiday-meta-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.holiday-title {
  font-weight: 700;
  font-size: 13.5px;
  color: #0f172a;
}

.holiday-desc {
  font-size: 11.5px;
  color: #64748b;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1e293b;
  font-weight: 600;
  font-size: 12.5px;
}

.date-chip i {
  color: #4f46e5;
  font-size: 12px;
}

.day-chip {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 600;
  text-transform: capitalize;
}

.type-pill.public {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.type-pill.company {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.cadence-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 600;
}

.cadence-pill.recurring {
  background: #faf5ff;
  color: #6b21a8;
  border: 1px solid #e9d5ff;
}

.cadence-pill.recurring i {
  color: #7c3aed;
}

.cadence-pill.single {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 600;
}

.status-pill.active {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-pill.inactive {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-pill.active .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}

.status-pill.inactive .status-dot {
  background: #94a3b8;
}

/* Actions in Table */
.holiday-row td.td-actions {
  text-align: right;
  padding-right: 18px;
  position: sticky;
  right: 0;
  background: #ffffff;
  z-index: 2;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.04);
}

.holiday-row:hover td.td-actions {
  background: #f8fafc;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.edit:hover {
  background: #e0e7ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.action-btn.toggle.activate:hover {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

.action-btn.toggle.deactivate:hover {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.table-state-cell {
  padding: 48px 20px;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-content i {
  font-size: 38px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.empty-content h4 {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.empty-content p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 10px 0;
}

.btn-clear-table-search {
  padding: 6px 14px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

/* Pagination Bar */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-bar.cards-mode {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  margin-top: 16px;
}

.pagination-info {
  font-size: 12.5px;
  font-weight: 500;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-page-nav {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-page-nav:hover:not(:disabled) {
  border-color: #4f46e5;
  color: #4f46e5;
}

.btn-page-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-pills {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-page-num {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #475569;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-page-num:hover {
  background: #e2e8f0;
}

.btn-page-num.active {
  background: #4f46e5;
  color: #ffffff;
}

/* ========================================================= */
/* 🎨 2. VISUAL CALENDAR CARDS GRID                          */
/* ========================================================= */
.cards-view-wrapper {
  width: 100%;
  margin-bottom: 24px;
}

.holiday-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
}

.holiday-visual-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.holiday-visual-card:hover {
  transform: translateY(-3px);
  border-color: #c7d2fe;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
}

.holiday-visual-card.inactive {
  opacity: 0.7;
  background: #f8fafc;
}

.card-color-stripe {
  height: 4px;
  width: 100%;
}

.card-color-stripe.public {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.card-color-stripe.company {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.card-body-section {
  display: flex;
  padding: 16px 18px;
  gap: 14px;
  flex: 1;
}

/* Calendar Date Tear-Off Sheet */
.calendar-date-sheet {
  width: 60px;
  height: 70px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  background: #ffffff;
}

.sheet-month-bar {
  background: #4f46e5;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  text-align: center;
  padding: 2px 0;
  letter-spacing: 0.05em;
}

.calendar-date-sheet.public .sheet-month-bar {
  background: #059669;
}

.calendar-date-sheet.company .sheet-month-bar {
  background: #2563eb;
}

.sheet-day-num {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding-top: 2px;
}

.sheet-weekday {
  font-size: 9.5px;
  font-weight: 700;
  color: #64748b;
  text-align: center;
  padding-bottom: 4px;
}

.card-info-block {
  flex: 1;
  min-width: 0;
}

.card-tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.cadence-mini-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.cadence-mini-chip.recurring {
  background: #faf5ff;
  color: #7c3aed;
  border: 1px solid #e9d5ff;
}

.cadence-mini-chip.single {
  background: #f1f5f9;
  color: #64748b;
}

.holiday-card-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.holiday-card-desc {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.holiday-card-desc.empty {
  color: #94a3b8;
  font-style: italic;
}

.card-footer-actions {
  display: flex;
  border-top: 1px solid #f1f5f9;
  background: #fcfdfe;
}

.btn-card-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-card-action + .btn-card-action {
  border-left: 1px solid #f1f5f9;
}

.btn-card-action.edit:hover {
  background: #eef2ff;
  color: #4338ca;
}

.btn-card-action.toggle.activate:hover {
  background: #ecfdf5;
  color: #065f46;
}

.btn-card-action.toggle.deactivate:hover {
  background: #fffbeb;
  color: #b45309;
}

.btn-card-action.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.cards-empty-state {
  padding: 48px 24px;
  text-align: center;
  background: #ffffff;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  width: 100%;
}

.cards-empty-state i {
  font-size: 40px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.cards-empty-state h4 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.cards-empty-state p {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}

/* ========================================================= */
/* 🌟 PREMIUM MODAL STYLES                                   */
/* ========================================================= */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.premium-modal {
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-14px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-top-stripe {
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%);
}

.modal-header-premium {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 26px 18px 26px;
  border-bottom: 1px solid #f1f5f9;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  background: #eef2ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  font-size: 20px;
  flex-shrink: 0;
}

.header-text-block {
  flex: 1;
}

.header-text-block h2 {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.header-text-block p {
  font-size: 12.5px;
  color: #64748b;
  margin: 3px 0 0 0;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
  transform: rotate(90deg);
}

.modal-form-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.form-body-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 26px;
}

.form-body-scroll::-webkit-scrollbar {
  width: 6px;
}

.form-body-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

.form-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full-width {
  grid-column: span 2;
}

.form-field label {
  font-size: 12.5px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-star {
  color: #ef4444;
}

.optional-tag {
  font-size: 11px;
  font-weight: normal;
  color: #94a3b8;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 13.5px;
  pointer-events: none;
}

.input-wrapper.textarea-wrapper {
  align-items: flex-start;
}

.textarea-icon {
  top: 14px;
}

.premium-input,
.premium-select,
.premium-textarea {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13.5px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.premium-textarea {
  padding-top: 10px;
  resize: vertical;
  min-height: 75px;
}

.premium-input:focus,
.premium-select:focus,
.premium-textarea:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-hint-chip {
  position: absolute;
  right: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #e2e8f0;
  padding: 2px 7px;
  border-radius: 5px;
}

.field-helper-txt {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}

/* Recurring Option Card */
.recurring-option-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recurring-option-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.recurring-option-card.active {
  background: #faf5ff;
  border-color: #d8b4fe;
}

.checkbox-indicator {
  font-size: 18px;
  color: #94a3b8;
  margin-top: 2px;
}

.recurring-option-card.active .checkbox-indicator {
  color: #7c3aed;
}

.recurring-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.recurring-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.recurring-title-row strong {
  font-size: 13.5px;
  color: #0f172a;
}

.badge-pill-recurring {
  font-size: 10.5px;
  font-weight: 700;
  color: #7c3aed;
  background: #ede9fe;
  padding: 2px 7px;
  border-radius: 9999px;
}

.recurring-info p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

/* Status Toggle Card */
.status-toggle-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  min-height: 42px;
  transition: all 0.2s ease;
}

.toggle-control-dot {
  width: 36px;
  height: 20px;
  background: #cbd5e1;
  border-radius: 9999px;
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.switch-ball {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-control-dot.on {
  background: #10b981;
}

.toggle-control-dot.on .switch-ball {
  transform: translateX(16px);
}

.toggle-text-block {
  display: flex;
  flex-direction: column;
}

.toggle-text-block strong {
  font-size: 12.5px;
  color: #0f172a;
}

.toggle-text-block span {
  font-size: 10.5px;
  color: #64748b;
}

.modal-footer-premium {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 26px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  background: #4f46e5;
  border: 1px solid #4338ca;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background: #4338ca;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

.btn-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ========================================================= */
/* ⚠️ DELETE CONFIRMATION MODAL CARD                         */
/* ========================================================= */
.delete-modal-card {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  padding: 28px 24px 22px 24px;
  text-align: center;
  position: relative;
  animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.delete-top-stripe {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ef4444 0%, #f97316 100%);
}

.delete-icon-box {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
}

.delete-title {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.delete-message {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.delete-message strong {
  color: #0f172a;
}

.delete-warning-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 8px;
  text-align: left;
  font-size: 11.5px;
  color: #92400e;
  line-height: 1.4;
  margin-bottom: 20px;
}

.delete-warning-box i {
  color: #d97706;
  margin-top: 2px;
  flex-shrink: 0;
}

.delete-modal-actions {
  display: flex;
  gap: 10px;
}

.btn-delete-cancel {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.btn-delete-cancel:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-delete-confirm {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #ef4444;
  border: 1px solid #dc2626;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.25);
}

.btn-delete-confirm:hover:not(:disabled) {
  background: #dc2626;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.35);
}

/* Modal Fade Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ========================================================= */
/* 📱 RESPONSIVE MEDIA QUERIES                               */
/* ========================================================= */
@media (max-width: 1200px) {
  .main-content {
    padding: 16px 20px;
    gap: 16px;
  }

  .holiday-top-banner {
    padding: 18px 22px;
    gap: 16px;
  }
}

@media (max-width: 992px) {
  .holiday-top-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 18px;
  }

  .banner-right-actions {
    width: 100%;
  }

  .btn-add-holiday {
    width: 100%;
    justify-content: center;
  }

  .holiday-toolbar-card {
    gap: 12px;
  }

  .toolbar-search-wrapper {
    min-width: 100%;
    max-width: 100%;
    order: 1;
  }

  .toolbar-filter-controls {
    order: 2;
    width: 100%;
    justify-content: space-between;
  }

  .toolbar-stats-pill {
    order: 3;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
    gap: 14px;
  }

  .content {
    gap: 14px;
  }

  .mobile-header {
    display: flex;
  }

  .holiday-top-banner {
    padding: 14px 16px;
    border-radius: 14px;
  }

  .holiday-top-banner .banner-right-actions {
    display: none;
  }

  .page-title {
    font-size: 18px;
  }

  .page-subtitle {
    font-size: 12.5px;
  }

  .holiday-stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .holiday-stat-card {
    padding: 12px 14px;
    gap: 10px;
    border-radius: 12px;
  }

  .stat-icon-halo {
    width: 38px;
    height: 38px;
    font-size: 16px;
    border-radius: 10px;
  }

  .stat-value {
    font-size: 20px;
  }

  .toolbar-filter-controls {
    flex-direction: column;
    gap: 8px;
  }

  .select-pill-wrapper,
  .toolbar-select,
  .view-mode-tabs {
    width: 100%;
  }

  .view-tab-btn {
    flex: 1;
    justify-content: center;
  }

  .form-fields-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .premium-modal {
    max-width: 96%;
    max-height: 88vh;
    border-radius: 18px;
    margin: 8px;
  }

  .modal-header-premium {
    padding: 16px 18px;
  }

  .form-body-scroll {
    padding: 16px 18px;
  }

  .modal-footer-premium {
    padding: 14px 18px;
    flex-direction: column;
    gap: 8px;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }

  .holiday-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px 6px;
  }

  .holiday-top-banner {
    padding: 12px 14px;
  }

  .banner-badge-row {
    gap: 6px;
  }

  .portal-badge-pill,
  .status-meta-pill {
    font-size: 10.5px;
    padding: 3px 8px;
  }

  .page-title {
    font-size: 16.5px;
  }

  .holiday-stats-grid {
    grid-template-columns: 1fr;
  }

  .delete-modal-card {
    padding: 20px 16px;
  }

  .delete-modal-actions {
    flex-direction: column;
  }
}
</style>