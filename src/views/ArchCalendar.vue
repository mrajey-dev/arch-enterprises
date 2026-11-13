<template>
  <div class="layout">
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Stationary Fixed Admin Sidebar -->
      <Sidebar ref="sidebarRef" />

      <section class="content">
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-calendar-alt"></i>
            <span>ARCH Calendar</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-mobile-today" @click="goToToday" title="Jump to Today">
              Today
            </button>
            <button class="btn-mobile-menu" @click="toggleMobileSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Header Banner -->
        <header class="calendar-top-banner">
          <div class="banner-left">
            <div class="banner-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>OPERATIONAL SCHEDULE</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-check-circle"></i> Live Sync
              </span>
              <span class="status-meta-pill holiday-meta-pill" v-if="currentMonthHolidaysCount > 0">
                <i class="fas fa-umbrella-beach"></i> {{ currentMonthHolidaysCount }} Holiday{{ currentMonthHolidaysCount > 1 ? 's' : '' }} this month
              </span>
            </div>
            <h1 class="page-title">ARCH Calendar</h1>
            <p class="page-subtitle">
              Coordinate schedules, meetings, service visits, employee birthdays, and company holidays.
            </p>
          </div>

          <!-- Month Navigation & Controls -->
          <div class="banner-controls">
            <div class="month-nav-pill">
              <button class="nav-arrow-btn" @click="prevMonth" title="Previous Month">
                <i class="fas fa-chevron-left"></i>
              </button>
              <h2 class="current-month-heading">{{ currentMonthYear }}</h2>
              <button class="nav-arrow-btn" @click="nextMonth" title="Next Month">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <div class="calendar-quick-actions">
              <button class="btn-today" @click="goToToday">
                <i class="fas fa-dot-circle"></i>
                <span>Today</span>
              </button>
              <button class="btn-add-event" @click="openTodayPopup">
                <i class="fas fa-plus"></i>
                <span>Add Note / Event</span>
              </button>
            </div>
          </div>
        </header>

        <!-- 🏷️ Interactive Filter Pills Bar -->
        <div class="calendar-filter-bar">
          <span class="filter-label">
            <i class="fas fa-filter"></i>
            <span>Filters:</span>
          </span>

          <div class="filter-pills-list">
            <!-- Meetings -->
            <button
              type="button"
              class="filter-pill pill-meetings"
              :class="{ active: showFilters.meetings }"
              @click="showFilters.meetings = !showFilters.meetings"
            >
              <span class="pill-dot dot-teal"></span>
              <i class="fas fa-video"></i>
              <span>Meetings</span>
              <span class="pill-badge" v-if="monthStats.meetings > 0">{{ monthStats.meetings }}</span>
            </button>

            <!-- Services -->
            <button
              type="button"
              class="filter-pill pill-services"
              :class="{ active: showFilters.services }"
              @click="showFilters.services = !showFilters.services"
            >
              <span class="pill-dot dot-blue"></span>
              <i class="fas fa-tools"></i>
              <span>Services</span>
              <span class="pill-badge" v-if="monthStats.services > 0">{{ monthStats.services }}</span>
            </button>

            <!-- Visits -->
            <button
              type="button"
              class="filter-pill pill-visits"
              :class="{ active: showFilters.visits }"
              @click="showFilters.visits = !showFilters.visits"
            >
              <span class="pill-dot dot-cyan"></span>
              <i class="fas fa-car-side"></i>
              <span>Visits</span>
              <span class="pill-badge" v-if="monthStats.visits > 0">{{ monthStats.visits }}</span>
            </button>

            <!-- Birthdays -->
            <button
              type="button"
              class="filter-pill pill-birthdays"
              :class="{ active: showFilters.birthdays }"
              @click="showFilters.birthdays = !showFilters.birthdays"
            >
              <span class="pill-dot dot-pink"></span>
              <i class="fas fa-birthday-cake"></i>
              <span>Birthdays</span>
              <span class="pill-badge" v-if="monthStats.birthdays > 0">{{ monthStats.birthdays }}</span>
            </button>

            <!-- Holidays -->
            <button
              type="button"
              class="filter-pill pill-holidays"
              :class="{ active: showFilters.holidays }"
              @click="showFilters.holidays = !showFilters.holidays"
            >
              <span class="pill-dot dot-red"></span>
              <i class="fas fa-umbrella-beach"></i>
              <span>Holidays</span>
              <span class="pill-badge" v-if="monthStats.holidays > 0">{{ monthStats.holidays }}</span>
            </button>

            <!-- Events -->
            <button
              type="button"
              class="filter-pill pill-events"
              :class="{ active: showFilters.events }"
              @click="showFilters.events = !showFilters.events"
            >
              <span class="pill-dot dot-purple"></span>
              <i class="fas fa-calendar-check"></i>
              <span>Events</span>
              <span class="pill-badge" v-if="monthStats.customEvents > 0">{{ monthStats.customEvents }}</span>
            </button>

            <!-- Notes -->
            <button
              type="button"
              class="filter-pill pill-notes"
              :class="{ active: showFilters.notes }"
              @click="showFilters.notes = !showFilters.notes"
            >
              <span class="pill-dot dot-amber"></span>
              <i class="fas fa-sticky-note"></i>
              <span>Notes</span>
              <span class="pill-badge" v-if="monthStats.notes > 0">{{ monthStats.notes }}</span>
            </button>

            <!-- Attendance -->
            <button
              type="button"
              class="filter-pill pill-attendance"
              :class="{ active: showFilters.attendance }"
              @click="showFilters.attendance = !showFilters.attendance"
            >
              <span class="pill-dot dot-indigo"></span>
              <i class="fas fa-user-check"></i>
              <span>Attendance</span>
              <span class="pill-badge" v-if="monthStats.attendance > 0">{{ monthStats.attendance }}</span>
            </button>
          </div>
        </div>

        <!-- 📅 Master Calendar Grid Card -->
        <div class="calendar-card-container">
          <!-- Day Name Headers (Sun to Sat) -->
          <div class="calendar-day-header">
            <div class="day-col-header" v-for="day in days" :key="day" :class="{ 'is-weekend': day === 'Sun' || day === 'Sat' }">
              <span class="day-name-txt">{{ day }}</span>
              <span class="day-sub-txt" v-if="day === 'Sun' || day === 'Sat'">Weekend</span>
            </div>
          </div>

          <!-- Calendar Dates Grid -->
          <div class="calendar-dates-grid">
            <div
              v-for="(date, idx) in calendarDates"
              :key="idx"
              class="date-cell"
              :class="{
                'empty-cell': !date.day,
                'is-today': date.isToday,
                'is-holiday-cell': date.isHoliday,
                'is-weekend-cell': isWeekend(date.fullDate),
                'has-events': date.events && date.events.length > 0
              }"
              @click="openDatePopup(date)"
              @dragover.prevent
              @drop="onDrop(date)"
            >
              <!-- Cell Header: Date Number + Quick Add Hint -->
              <div class="cell-top-row" v-if="date.day">
                <div class="cell-top-left">
                  <span class="cell-add-hint" title="Add event on this date">
                    <i class="fas fa-plus"></i>
                  </span>
                  <span class="today-tag-pill" v-if="date.isToday">TODAY</span>
                  <span class="holiday-tag-pill" v-else-if="date.isHoliday">HOLIDAY</span>
                </div>
                <span class="date-badge-num" :class="{ 'today-badge': date.isToday, 'holiday-badge': date.isHoliday && !date.isToday }">
                  {{ date.day }}
                </span>
              </div>

              <!-- Events List inside cell -->
              <div class="cell-events-list" v-if="date.day">
                <div
                  v-for="event in date.events"
                  :key="event.id"
                  class="calendar-event-badge"
                  :class="getEventClass(event)"
                  :draggable="isDraggable(event)"
                  @dragstart="onDragStart(event)"
                  @click.stop="handleEventClick(event)"
                  :title="event.title"
                >
                  <div class="badge-icon-wrap">
                    <i :class="getEventIcon(event)"></i>
                  </div>
                  <span class="event-title-text">{{ event.title }}</span>

                  <!-- Edit / Delete for custom notes/events -->
                  <div v-if="isCustomEvent(event)" class="event-quick-actions" @click.stop>
                    <button class="ev-action-btn" @click.stop="editCustomEvent(event)" title="Edit">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button class="ev-action-btn delete" @click.stop="deleteCustomEvent(event)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════ MODAL 1: Add/Edit Date Popup (Holiday / Note / Event) ════════ -->
        <div v-if="showDatePopup" class="modal-backdrop" @click.self="closeDatePopup">
          <div class="modal-card-premium calendar-popup-modal">
            <!-- Modal Header -->
            <div class="modal-header-premium">
              <div class="mhp-title-row">
                <div class="mhp-icon-box">
                  <i class="fas fa-calendar-day"></i>
                </div>
                <div>
                  <h3 class="mhp-title">{{ formatSelectedDateHeader(selectedDate) }}</h3>
                  <p class="mhp-subtitle">Add or edit schedule markers on this date</p>
                </div>
              </div>
              <button class="mhp-close-btn" @click="closeDatePopup">✕</button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body-premium">
              <!-- Type Selector Buttons -->
              <div class="event-type-selector">
                <button
                  type="button"
                  class="type-btn type-holiday"
                  :class="{ active: formType === 'holiday' }"
                  @click="openForm('holiday')"
                >
                  <i class="fas fa-umbrella-beach"></i>
                  <span>Holiday</span>
                </button>
                <button
                  type="button"
                  class="type-btn type-note"
                  :class="{ active: formType === 'note' }"
                  @click="openForm('note')"
                >
                  <i class="fas fa-sticky-note"></i>
                  <span>Note</span>
                </button>
                <button
                  type="button"
                  class="type-btn type-event"
                  :class="{ active: formType === 'event' }"
                  @click="openForm('event')"
                >
                  <i class="fas fa-calendar-check"></i>
                  <span>Event</span>
                </button>
              </div>

              <!-- Input Form for Selected Type -->
              <div v-if="formType" class="event-input-form">
                <div class="form-group" v-if="formType !== 'note'">
                  <label class="form-label">
                    <span>Title</span>
                    <span class="required-star">*</span>
                  </label>
                  <div class="input-wrapper">
                    <i class="fas fa-heading input-icon"></i>
                    <input
                      v-model="form.title"
                      placeholder="e.g. Diwali Holiday, Product Launch, Client Visit..."
                      class="custom-input"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <span>{{ formType === 'note' ? 'Note Details' : 'Description / Remarks' }}</span>
                  </label>
                  <div class="input-wrapper textarea-wrapper">
                    <i class="fas fa-align-left input-icon textarea-icon"></i>
                    <textarea
                      v-model="form.description"
                      placeholder="Enter description, details, notes, or instructions..."
                      rows="3"
                      class="custom-input custom-textarea"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div v-else class="event-type-prompt">
                <p>Select a marker type above to add a holiday, note, or event for this date.</p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer-premium">
              <button class="btn-ghost-modal" @click="closeDatePopup">Cancel</button>
              <button v-if="formType" class="btn-primary-modal" @click="saveCalendarData">
                <i class="fas fa-save"></i>
                <span>{{ editingId ? 'Update' : 'Save' }} Marker</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ════════ MODAL 2: View / Edit Note & Event Details ════════ -->
        <div v-if="showViewModal" class="modal-backdrop" @click.self="closeViewModal">
          <div class="modal-card-premium view-event-modal">
            <div class="modal-header-premium">
              <div class="mhp-title-row">
                <div class="mhp-icon-box" :class="{ 'bg-red-tint': viewEvent.type === 'holiday' }">
                  <i :class="viewEvent.type === 'holiday' ? 'fas fa-umbrella-beach text-red' : viewEvent.type === 'note' ? 'fas fa-sticky-note' : 'fas fa-calendar-alt'"></i>
                </div>
                <div>
                  <h3 class="mhp-title">
                    {{ isEditingView ? 'Edit ' + viewEvent.type : viewEvent.title }}
                  </h3>
                  <div class="tag-row" style="display: flex; gap: 6px; align-items: center; margin-top: 4px; flex-wrap: wrap;">
                    <span class="event-type-tag" :class="viewEvent.type">{{ viewEvent.type }}</span>
                    <span v-if="viewEvent.isOfficial" class="official-pill">
                      <i class="fas fa-shield-alt"></i> {{ viewEvent.holidayClassification === 'company' ? 'Company Holiday' : 'Gazetted Public Holiday' }}
                    </span>
                    <span v-if="viewEvent.isRecurring" class="recurring-pill">
                      <i class="fas fa-sync-alt"></i> Annual Recurring
                    </span>
                  </div>
                </div>
              </div>

              <div class="header-actions-right">
                <button
                  v-if="isCustomEvent(viewEvent) && !isEditingView"
                  class="btn-edit-icon"
                  @click="startEditFromView"
                  title="Edit details"
                >
                  <i class="fas fa-pen"></i>
                </button>
                <button class="mhp-close-btn" @click="closeViewModal">✕</button>
              </div>
            </div>

            <div class="modal-body-premium">
              <!-- View Mode -->
              <div v-if="!isEditingView" class="event-details-view">
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-val-highlight">{{ viewEvent.date }}</span>
                </div>
                <div class="detail-row" v-if="viewEvent.isOfficial">
                  <span class="detail-label">Holiday Classification:</span>
                  <span class="detail-val-highlight">
                    {{ viewEvent.holidayClassification === 'company' ? 'Company Specific Holiday' : 'Public Holiday (Mandatory Paid)' }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Description:</span>
                  <p class="detail-desc-box">{{ viewEvent.description || 'No description provided.' }}</p>
                </div>
                <div v-if="viewEvent.isOfficial" class="official-holiday-note-box">
                  <i class="fas fa-info-circle"></i>
                  <span>Official holiday scheduled across company calendar and workforce operations.</span>
                </div>
              </div>

              <!-- Edit Mode -->
              <div v-else class="event-details-edit">
                <div class="form-group" v-if="viewEvent.type !== 'note'">
                  <label class="form-label">Title</label>
                  <input v-model="editForm.title" placeholder="Enter title" class="custom-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea v-model="editForm.description" placeholder="Edit description" rows="3" class="custom-input custom-textarea"></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer-premium">
              <template v-if="!isEditingView">
                <button class="btn-primary-modal" @click="closeViewModal">Close</button>
              </template>
              <template v-else>
                <button class="btn-ghost-modal" @click="cancelEditView">Cancel</button>
                <button class="btn-primary-modal" @click="updateFromView">
                  <i class="fas fa-save"></i> Save Changes
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- ════════ MODAL 3: Meeting Details & Topics ════════ -->
        <div v-if="showMeetingModal" class="modal-backdrop" @click.self="closeMeeting">
          <div class="modal-card-premium meeting-detail-modal">
            <div class="modal-header-premium">
              <div class="mhp-title-row">
                <div class="mhp-icon-box bg-teal-tint">
                  <i class="fas fa-video text-teal"></i>
                </div>
                <div>
                  <h3 class="mhp-title">{{ selectedMeeting.title }}</h3>
                  <span class="status-badge-pill" :class="selectedMeeting.type">
                    {{ selectedMeeting.type === 'offline' ? 'Offline Session' : 'Online Video' }}
                  </span>
                </div>
              </div>
              <button class="mhp-close-btn" @click="closeMeeting">✕</button>
            </div>

            <div class="modal-body-premium">
              <div class="meeting-meta-grid">
                <div class="meta-item-box">
                  <span class="meta-item-label">Meeting Date</span>
                  <span class="meta-item-val">{{ selectedMeeting.meeting_date }}</span>
                </div>
                <div class="meta-item-box">
                  <span class="meta-item-label">Meeting Time</span>
                  <span class="meta-item-val">{{ selectedMeeting.meeting_time }}</span>
                </div>
              </div>

              <div class="meeting-desc-section" v-if="selectedMeeting.description">
                <span class="meta-item-label">Description</span>
                <p class="desc-box">{{ selectedMeeting.description }}</p>
              </div>

              <!-- Meeting Link -->
              <div class="meeting-link-bar" v-if="selectedMeeting.meeting_link">
                <div class="link-label-group">
                  <i class="fas fa-link"></i>
                  <span>Meeting Room URL</span>
                </div>
                <a :href="selectedMeeting.meeting_link" target="_blank" class="btn-join-room">
                  <i class="fas fa-video"></i>
                  <span>Join Meeting</span>
                </a>
              </div>

              <!-- Meeting Topics Section -->
              <div class="meeting-topics-section">
                <div class="topics-header-row">
                  <span class="meta-item-label">Meeting Agenda & Notes</span>
                  <button v-if="!isEditingTopics" class="btn-edit-topics-pill" @click="enableTopicEdit">
                    <i class="fas fa-pen"></i> Edit Topics
                  </button>
                </div>

                <div v-if="!isEditingTopics" class="topics-display-box">
                  <div v-if="selectedMeeting.topics" v-html="sanitizedTopics" class="topics-html"></div>
                  <p v-else class="empty-topics-text">No topics added for this meeting yet.</p>
                </div>

                <div v-else class="topics-editor-box">
                  <QuillEditor
                    v-model:content="meetingTopics"
                    contentType="html"
                    theme="snow"
                    :toolbar="toolbarOptions"
                    style="height: 180px;"
                  />
                  <div class="editor-action-row">
                    <button class="btn-ghost-sm" @click="cancelTopicEdit">Cancel</button>
                    <button class="btn-save-sm" @click="saveTopics">
                      <i class="fas fa-save"></i> Save Topics
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer-premium">
              <button class="btn-primary-modal" @click="closeMeeting">Close</button>
            </div>
          </div>
        </div>

        <!-- ════════ MODAL 4: Service Assignment Modal ════════ -->
        <div v-if="showServiceModal" class="modal-backdrop" @click.self="showServiceModal = false">
          <div class="modal-card-premium service-detail-modal">
            <div class="modal-header-premium">
              <div class="mhp-title-row">
                <div class="mhp-icon-box bg-blue-tint">
                  <i class="fas fa-tools text-blue"></i>
                </div>
                <div>
                  <h3 class="mhp-title">{{ selectedService.company_name }}</h3>
                  <span class="status-badge-pill" :class="selectedService.status?.toLowerCase()">
                    {{ selectedService.status || 'Active' }}
                  </span>
                </div>
              </div>
              <button class="mhp-close-btn" @click="showServiceModal = false">✕</button>
            </div>

            <div class="modal-body-premium">
              <div class="service-details-grid">
                <div class="srv-detail-card">
                  <span class="srv-label">PO Number</span>
                  <span class="srv-value">{{ selectedService.po_number || '—' }}</span>
                </div>
                <div class="srv-detail-card">
                  <span class="srv-label">Visit Date</span>
                  <span class="srv-value">{{ selectedService.visit_date }}</span>
                </div>
                <div class="srv-detail-card">
                  <span class="srv-label">Assigned Technician</span>
                  <span class="srv-value">{{ selectedService.assign_to_name || 'Unassigned' }}</span>
                </div>
                <div class="srv-detail-card">
                  <span class="srv-label">Service Type</span>
                  <span class="srv-value">{{ selectedService.isVisit ? selectedService.service_type : selectedService.type_of_service }}</span>
                </div>
              </div>
            </div>

            <div class="modal-footer-premium">
              <button class="btn-primary-modal" @click="showServiceModal = false">Close</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import DOMPurify from 'dompurify'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  name: "ArchCalendar",
  components: { Sidebar, QuillEditor },

  data() {
    return {
      officialHolidays: [],
      isEditingView: false,
      editForm: {
        title: '',
        description: ''
      },
      attendanceEvents: [],
      isEditingTopics: false,
      showAllGuests: false,
      meetingTopics: '',
      toolbarOptions: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: [1, 2, 3, false] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['clean']
      ],
      showViewModal: false,
      viewEvent: {},
      editingId: null,
      draggedEvent: null,
      showDatePopup: false,
      selectedDate: null,

      formType: null,
      form: {
        title: '',
        description: ''
      },

      customCalendarEvents: [],
      birthdayEvents: [],
      showFilters: {
        meetings: true,
        services: true,
        visits: true,
        birthdays: true,
        holidays: true,
        events: true,
        notes: true,
        attendance: true
      },
      visitEvents: [],
      events: [],
      serviceEvents: [],

      showMeetingModal: false,
      showServiceModal: false,

      selectedMeeting: {},
      selectedService: {},

      isMobile: false,
      currentDate: new Date(),
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  },

  computed: {
    displayedGuests() {
      if (!this.selectedMeeting?.guests) return [];
      return this.showAllGuests
        ? this.selectedMeeting.guests
        : this.selectedMeeting.guests.slice(0, 2);
    },

    currentMonthYear() {
      return this.currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    },

    sanitizedTopics() {
      return DOMPurify.sanitize(this.selectedMeeting.topics || '');
    },

    currentMonthHolidaysCount() {
      const monthDates = this.calendarDates;
      let count = 0;
      monthDates.forEach(d => {
        if (d.events) {
          count += d.events.filter(e => e.type === 'holiday').length;
        }
      });
      return count;
    },

    monthStats() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const padM = String(month + 1).padStart(2, '0');
      const yearMonth = `${year}-${padM}`;

      const meetings = this.events.filter(e => e.date && e.date.startsWith(yearMonth)).length;
      const services = this.serviceEvents.filter(s => s.date && s.date.startsWith(yearMonth)).length;
      const visits = this.visitEvents.filter(v => v.date && v.date.startsWith(yearMonth)).length;
      const attendance = this.attendanceEvents.filter(a => a.date && a.date.startsWith(yearMonth)).length;
      const birthdays = this.birthdayEvents.filter(b => b.month === month + 1).length;
      const customEvents = this.customCalendarEvents.filter(c => c.date && c.date.startsWith(yearMonth) && c.type === 'event').length;
      const notes = this.customCalendarEvents.filter(c => c.date && c.date.startsWith(yearMonth) && c.type === 'note').length;
      const holidays = this.currentMonthHolidaysCount;

      return {
        meetings,
        services,
        visits,
        attendance,
        birthdays,
        customEvents,
        notes,
        holidays
      };
    },

    calendarDates() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();

      const dates = [];

      for (let i = 0; i < firstDay; i++) {
        dates.push({ day: '', events: [] });
      }

      for (let day = 1; day <= totalDays; day++) {
        const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const mmDd = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const dayHolidays = this.showFilters.holidays ? this.getHolidaysForDate(fullDate, mmDd, year) : [];

        dates.push({
          day,
          fullDate,
          isToday: fullDate === new Date().toISOString().split('T')[0],
          isHoliday: dayHolidays.length > 0,
          events: [
            ...dayHolidays,

            ...(this.showFilters.meetings
              ? this.events.filter(e => e.date === fullDate)
              : []),

            ...(this.showFilters.services
              ? this.serviceEvents.filter(s => s.date === fullDate)
              : []),

            ...(this.showFilters.visits
              ? this.visitEvents.filter(v => v.date === fullDate)
              : []),

            ...(this.showFilters.attendance
              ? this.attendanceEvents.filter(a => a.date === fullDate)
              : []),

            ...this.customCalendarEvents.filter(c =>
              c.date === fullDate &&
              (
                (c.type === 'holiday' && this.showFilters.holidays) ||
                (c.type === 'event' && this.showFilters.events) ||
                (c.type === 'note' && this.showFilters.notes)
              )
            ),

            ...(this.showFilters.birthdays
              ? this.birthdayEvents.filter(b =>
                  b.month === month + 1 && b.day === day
                )
              : [])
          ]
        });
      }

      return dates;
    }
  },

  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);

    const token = localStorage.getItem('token');
    if (!token) this.$router.push('/auth');

    this.fetchOfficialHolidays();
    this.fetchAttendanceCalendar();
    this.fetchServiceAssignments();
    this.fetchVisitAssignments();
    this.fetchMeetings();
    this.fetchBirthdays();
    this.fetchCustomCalendarData();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },

  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 992;
    },

    toggleMobileSidebar() {
      if (this.$refs.sidebarRef) {
        this.$refs.sidebarRef.isMobileOpen = !this.$refs.sidebarRef.isMobileOpen;
      }
    },

    goToToday() {
      this.currentDate = new Date();
    },

    openTodayPopup() {
      const today = new Date().toISOString().split('T')[0];
      this.selectedDate = today;
      this.formType = 'event';
      this.form = { title: '', description: '' };
      this.editingId = null;
      this.showDatePopup = true;
    },

    prevMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      );
    },

    nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      );
    },

    formatSelectedDateHeader(dateStr) {
      if (!dateStr) return 'Select Date';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },

    getEventClass(event) {
      const t = (event.type || '').toLowerCase();
      if (t === 'online') return 'ev-online';
      if (t === 'offline') return 'ev-offline';
      if (t === 'service') return 'ev-service';
      if (t === 'visit') return 'ev-visit';
      if (t === 'birthday') return 'ev-birthday';
      if (t === 'holiday') return 'ev-holiday';
      if (t === 'event') return 'ev-custom-event';
      if (t === 'note') return 'ev-note';
      if (t === 'attendance') return 'ev-attendance';
      return 'ev-default';
    },

    getEventIcon(event) {
      const t = (event.type || '').toLowerCase();
      if (t === 'online') return 'fas fa-video';
      if (t === 'offline') return 'fas fa-building';
      if (t === 'service') return 'fas fa-tools';
      if (t === 'visit') return 'fas fa-car-side';
      if (t === 'birthday') return 'fas fa-birthday-cake';
      if (t === 'holiday') return 'fas fa-umbrella-beach';
      if (t === 'event') return 'fas fa-calendar-check';
      if (t === 'note') return 'fas fa-sticky-note';
      if (t === 'attendance') {
        if (event.status === 'Traveling') return 'fas fa-car-side';
        if (event.status === 'OnSite') return 'fas fa-map-marker-alt';
        return 'fas fa-user-check';
      }
      return 'fas fa-circle';
    },

    isWeekend(dateStr) {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const day = d.getDay();
      return day === 0 || day === 6;
    },

    closeViewModal() {
      this.showViewModal = false;
      this.isEditingView = false;
    },

    startEditFromView() {
      this.isEditingView = true;
      this.editForm = {
        title: this.viewEvent.title.replace(/^(Public Holiday: |Event: |📝 )/, ''),
        description: this.viewEvent.description
      };
    },

    cancelEditView() {
      this.isEditingView = false;
    },

    async updateFromView() {
      try {
        await fetch(
          `https://employees.archenterprises.co.in/api/api/arch-calendar/${this.viewEvent.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              calendar_date: this.viewEvent.date,
              type: this.viewEvent.type,
              title: this.editForm.title,
              description: this.editForm.description
            })
          }
        );

        this.isEditingView = false;
        this.showViewModal = false;
        this.fetchCustomCalendarData();
        toastSuccess('Marker updated successfully');
      } catch (e) {
        console.error(e);
        toastError('Failed to update marker');
      }
    },

    openAttendance(event) {
      if (!event) return;

      const employeeName = event.name || 'Missing Name';
      const travelFrom = event.travel_from || '-';
      const travelTo = event.travel_to || '-';
      const siteName = event.site_name || '-';

      let description = '';

      if (event.status === 'Traveling') {
        description = `Employee: ${employeeName}\nTravel From: ${travelFrom}\nTravel To: ${travelTo}`;
      } else if (event.status === 'OnSite') {
        description = `Employee: ${employeeName}\nSite: ${siteName}`;
      }

      this.viewEvent = {
        title: event.title || 'Attendance',
        description,
        type: 'attendance',
        date: event.date
      };

      this.showViewModal = true;
    },

    async fetchAttendanceCalendar() {
      try {
        const res = await fetch(
          'https://employees.archenterprises.co.in/api/api/attendance/calendar',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await res.json();

        this.attendanceEvents = (Array.isArray(data) ? data : [])
          .filter(a => a.status === 'Traveling' || a.status === 'OnSite')
          .map(a => {
            let title = '';
            if (a.status === 'Traveling') {
              title = `${a.travel_from || '-'} → ${a.travel_to || '-'}`;
            } else if (a.status === 'OnSite') {
              title = a.site_name || 'On Site';
            }

            return {
              id: a.id,
              date: a.date,
              title: title,
              name: a.name || a.employee_name || 'missing name',
              travel_from: a.travel_from,
              travel_to: a.travel_to,
              site_name: a.site_name,
              status: a.status,
              type: 'attendance'
            };
          });
      } catch (e) {
        console.error(e);
      }
    },

    isCustomEvent(event) {
      if (event.isOfficial) return false;
      return ['holiday', 'event', 'note'].includes(event.type);
    },

    isDraggable(event) {
      return this.isCustomEvent(event);
    },

    onDragStart(event) {
      if (!this.isCustomEvent(event)) return;
      this.draggedEvent = event;
    },

    async onDrop(date) {
      if (!this.draggedEvent || !date.fullDate) return;
      if (this.draggedEvent.date === date.fullDate) return;

      try {
        await fetch(
          `https://employees.archenterprises.co.in/api/api/arch-calendar/${this.draggedEvent.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              calendar_date: date.fullDate
            })
          }
        );

        this.draggedEvent = null;
        this.fetchCustomCalendarData();
        toastSuccess('Marker moved to ' + date.fullDate);
      } catch (e) {
        console.error('Drag update failed', e);
        toastError('Failed to move marker');
      }
    },

    editCustomEvent(event) {
      this.selectedDate = event.date;
      this.formType = event.type;
      this.form = {
        title: event.rawTitle || event.title.replace(/^(Public Holiday: |Event: |📝 )/, ''),
        description: event.description || ''
      };
      this.editingId = event.id;
      this.showDatePopup = true;
    },

    openDatePopup(date) {
      if (!date.fullDate) return;

      this.selectedDate = date.fullDate;
      this.showDatePopup = true;
      this.formType = null;
      this.form = { title: '', description: '' };
      this.editingId = null;
    },

    openForm(type) {
      this.formType = type;
      this.form = { title: '', description: '' };
    },

    closeDatePopup() {
      this.showDatePopup = false;
      this.selectedDate = null;
      this.editingId = null;
    },

    async saveCalendarData() {
      if (!this.formType) return;
      if (this.formType !== 'note' && !this.form.title.trim()) {
        toastWarning('Please enter a title');
        return;
      }

      try {
        const url = this.editingId
          ? `https://employees.archenterprises.co.in/api/api/arch-calendar/${this.editingId}`
          : 'https://employees.archenterprises.co.in/api/api/arch-calendar';

        const method = this.editingId ? 'PUT' : 'POST';

        await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            calendar_date: this.selectedDate,
            type: this.formType,
            title: this.form.title,
            description: this.form.description
          })
        });

        this.editingId = null;
        this.closeDatePopup();
        this.fetchCustomCalendarData();
        toastSuccess(this.editingId ? 'Marker updated!' : 'Marker created!');
      } catch (e) {
        console.error('Save failed', e);
        toastError('Failed to save marker');
      }
    },

    async deleteCustomEvent(event) {
      if (!confirm('Are you sure you want to delete this marker?')) return;

      try {
        await fetch(
          `https://employees.archenterprises.co.in/api/api/arch-calendar/${event.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        this.fetchCustomCalendarData();
        toastSuccess('Marker deleted');
      } catch (e) {
        console.error('Delete failed', e);
        toastError('Failed to delete marker');
      }
    },

    async fetchOfficialHolidays() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          'https://employees.archenterprises.co.in/api/api/holidays/all',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data)) {
          this.officialHolidays = data.data;
        } else if (Array.isArray(data)) {
          this.officialHolidays = data;
        } else if (data && Array.isArray(data.data)) {
          this.officialHolidays = data.data;
        }
      } catch (e) {
        console.error('Failed to fetch official holidays:', e);
      }
    },

    getLocalDateStr(dateVal) {
      if (!dateVal) return '';
      if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        return dateVal;
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },

    getHolidaysForDate(fullDate, mmDd, year) {
      if (!this.officialHolidays || !this.officialHolidays.length) return [];

      return this.officialHolidays
        .filter(h => {
          if (h.is_active === false || h.is_active === 0 || h.is_active === '0') return false;

          const isRecurring = Boolean(h.is_recurring) || Boolean(h.month_day && !h.date);
          if (isRecurring) {
            let targetMonthDay = h.month_day;
            if (!targetMonthDay && h.date) {
              const localDateStr = this.getLocalDateStr(h.date);
              if (localDateStr) {
                targetMonthDay = localDateStr.substring(5, 10);
              }
            }
            if (targetMonthDay) {
              const parts = String(targetMonthDay).split('-');
              if (parts.length === 2) {
                targetMonthDay = `${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}`;
              }
            }
            return targetMonthDay === mmDd;
          } else if (h.date) {
            const localDateStr = this.getLocalDateStr(h.date);
            return localDateStr === fullDate;
          }
          return false;
        })
        .map(h => {
          const isPublic = (h.type || '').toLowerCase() === 'public';
          const typeLabel = isPublic ? 'Public Holiday' : 'Company Holiday';
          return {
            id: `official-holiday-${h.id}`,
            rawId: h.id,
            date: fullDate,
            title: h.name,
            rawTitle: h.name,
            description: h.description || `${typeLabel} observance for all employees.`,
            type: 'holiday',
            holidayClassification: h.type || 'public',
            isOfficial: true,
            isRecurring: Boolean(h.is_recurring)
          };
        });
    },

    async fetchCustomCalendarData() {
      try {
        const res = await fetch(
          'https://employees.archenterprises.co.in/api/api/arch-calendar',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.data || []);

        this.customCalendarEvents = arr.map(d => ({
          id: d.id,
          date: d.calendar_date,
          rawTitle: d.title,
          title:
            d.type === 'holiday' ? `Public Holiday: ${d.title}` :
            d.type === 'event' ? `Event: ${d.title}` :
            d.type === 'note' ? `📝 Note` : (d.title || 'Marker'),
          description: d.description,
          type: d.type
        }));
      } catch (e) {
        console.error(e);
      }
    },

    async fetchBirthdays() {
      try {
        const res = await fetch(
          'https://employees.archenterprises.co.in/api/api/birthdays/calendar',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.data || []);

        this.birthdayEvents = arr.map(b => {
          const dob = new Date(b.date);
          return {
            id: b.id,
            month: dob.getMonth() + 1,
            day: dob.getDate(),
            title: b.name,
            type: 'birthday'
          };
        });
      } catch (e) {
        console.error('Birthday fetch failed', e);
      }
    },

    async fetchVisitAssignments() {
      try {
        const res = await fetch(
          'https://employees.archenterprises.co.in/api/api/visit-assign/calendar',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.data || []);

        this.visitEvents = arr.map(v => ({
          id: v.id,
          date: v.visit_date,
          title: v.company_name,
          type: 'visit'
        }));
      } catch (e) {
        console.error(e);
      }
    },

    async openVisit(id) {
      try {
        const res = await fetch(
          `https://employees.archenterprises.co.in/api/api/visit-assign/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const result = await res.json();
        this.selectedService = {
          ...result.data,
          isVisit: true
        };
        this.showServiceModal = true;
      } catch (e) {
        console.error(e);
      }
    },

    handleEventClick(event) {
      switch (event.type) {
        case 'attendance':
          this.openAttendance(event);
          break;
        case 'service':
          this.openService(event.id);
          break;
        case 'visit':
          this.openVisit(event.id);
          break;
        case 'online':
        case 'offline':
          this.openMeeting(event);
          break;
        case 'note':
        case 'event':
        case 'holiday':
          this.openViewEvent(event);
          break;
      }
    },

    openViewEvent(event) {
      this.viewEvent = {
        id: event.id,
        rawId: event.rawId,
        title: event.title,
        rawTitle: event.rawTitle || event.title,
        description: event.description || '',
        type: event.type,
        date: event.date,
        isOfficial: event.isOfficial || false,
        holidayClassification: event.holidayClassification || 'public',
        isRecurring: event.isRecurring || false
      };

      this.isEditingView = false;
      this.showViewModal = true;
    },

    async openService(id) {
      try {
        const res = await fetch(
          `https://employees.archenterprises.co.in/api/api/service-assign/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const result = await res.json();
        this.selectedService = result.data || {};
        this.showServiceModal = true;
      } catch (e) {
        console.error(e);
      }
    },

    async fetchServiceAssignments() {
      try {
        const res = await fetch(
          'https://employees.archenterprises.co.in/api/api/service-assign/calendar',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.data || []);

        this.serviceEvents = arr.map(s => ({
          id: s.id,
          date: s.visit_date,
          title: s.company_name,
          type: 'service'
        }));
      } catch (e) {
        console.error(e);
      }
    },

    async openMeeting(event) {
      try {
        const res = await fetch(
          `https://employees.archenterprises.co.in/api/api/meetings/${event.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const result = await res.json();
        this.selectedMeeting = result.data || {};
        this.meetingTopics = this.selectedMeeting.topics || '';
        this.showMeetingModal = true;
      } catch (err) {
        console.error('Failed to fetch meeting', err);
      }
    },

    enableTopicEdit() {
      this.isEditingTopics = true;
    },

    cancelTopicEdit() {
      this.isEditingTopics = false;
      this.meetingTopics = this.selectedMeeting.topics || '';
    },

    async saveTopics() {
      const meetingId = this.selectedMeeting.id;
      if (!meetingId) {
        toastError('Meeting ID not found');
        return;
      }

      try {
        await fetch(
          `https://employees.archenterprises.co.in/api/api/meetings/${meetingId}/topics`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              topics: this.meetingTopics
            })
          }
        );

        this.selectedMeeting.topics = this.meetingTopics;
        this.isEditingTopics = false;
        toastSuccess('Topics saved successfully');
      } catch (e) {
        console.error('Failed to save topics', e);
        toastError('Failed to save topics');
      }
    },

    closeMeeting() {
      this.showMeetingModal = false;
      this.selectedMeeting = {};
      this.isEditingTopics = false;
    },

    async fetchMeetings() {
      try {
        const res = await fetch('https://employees.archenterprises.co.in/api/api/meetings/interviews', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.data || []);

        this.events = arr.map(m => ({
          id: m.id,
          date: m.date,
          title: m.title,
          type: m.type === 'offline' ? 'offline' : 'online'
        }));
      } catch (err) {
        console.error('Failed to load meetings', err);
      }
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

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

.mobile-title i {
  color: var(--primary, #0d9488);
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-today {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
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

/* ════════ Top Banner ════════ */
.calendar-top-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.banner-badge-row {
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
  color: var(--primary, #0d9488);
  letter-spacing: 0.6px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary, #0d9488);
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

.status-meta-pill i {
  color: #10b981;
}

.page-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.banner-controls {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.month-nav-pill {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
  padding: 4px;
}

.nav-arrow-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.nav-arrow-btn:hover {
  background: var(--primary, #0d9488);
  color: #ffffff;
  border-color: var(--primary, #0d9488);
}

.current-month-heading {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  padding: 0 16px;
  white-space: nowrap;
}

.calendar-quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-today {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid var(--border, #e2e8f0);
  color: #334155;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-today:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-add-event {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary-gradient, linear-gradient(135deg, #0d9488 0%, #0f766e 100%));
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(13, 148, 136, 0.2);
}

.btn-add-event:hover {
  opacity: 0.94;
  transform: translateY(-1px);
}

/* ════════ Filter Pills Bar ════════ */
.calendar-filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 10px 18px;
  margin-bottom: 20px;
  overflow-x: auto;
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.04);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
}

.filter-pills-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.filter-pill:hover {
  background: #f8fafc;
  color: #0f172a;
  transform: translateY(-1px);
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.dot-teal { background: #0d9488; }
.dot-blue { background: #2563eb; }
.dot-cyan { background: #0891b2; }
.dot-pink { background: #db2777; }
.dot-red { background: #ef4444; }
.dot-purple { background: #7c3aed; }
.dot-amber { background: #f59e0b; }
.dot-indigo { background: #4f46e5; }

.pill-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  margin-left: 2px;
  transition: all 0.15s ease;
}

.filter-pill.active {
  color: #0f172a;
  box-shadow: 0 2px 6px -1px rgba(0, 0, 0, 0.08);
}

.filter-pill.active .pill-badge {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.filter-pill.pill-meetings.active { border-color: #99f6e4; background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); color: #0f766e; }
.filter-pill.pill-services.active { border-color: #bfdbfe; background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%); color: #1d4ed8; }
.filter-pill.pill-visits.active { border-color: #a5f3fc; background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%); color: #0e7490; }
.filter-pill.pill-birthdays.active { border-color: #fbcfe8; background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); color: #be185d; }
.filter-pill.pill-holidays.active { border-color: #fecaca; background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); color: #b91c1c; }
.filter-pill.pill-events.active { border-color: #ddd6fe; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); color: #6d28d9; }
.filter-pill.pill-notes.active { border-color: #fde68a; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); color: #b45309; }
.filter-pill.pill-attendance.active { border-color: #c7d2fe; background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); color: #4338ca; }

/* ════════ Calendar Card & Grid ════════ */
.calendar-card-container {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
}

.calendar-day-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid var(--border, #e2e8f0);
}

.day-col-header {
  padding: 13px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.day-name-txt {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.day-sub-txt {
  font-size: 10px;
  font-weight: 600;
  color: #fb7185;
  letter-spacing: 0.2px;
}

.day-col-header.is-weekend .day-name-txt {
  color: #e11d48;
}

.calendar-dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #e2e8f0;
  gap: 1px;
}

.date-cell {
  background: #ffffff;
  min-height: 124px;
  padding: 9px 10px 12px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.date-cell:hover:not(.empty-cell) {
  background: #fcfdfe;
  box-shadow: inset 0 0 0 1.5px rgba(13, 148, 136, 0.4);
  z-index: 2;
}

.date-cell:hover .cell-add-hint {
  opacity: 1;
  transform: scale(1);
}

.empty-cell {
  background: #f8fafc;
  cursor: default;
}

.is-weekend-cell:not(.empty-cell):not(.is-today):not(.is-holiday-cell) {
  background: #fafcff;
}

.is-today {
  background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%) !important;
  border-top: 3px solid #0d9488 !important;
}

.is-holiday-cell {
  background: linear-gradient(180deg, #fffbf9 0%, #ffffff 100%) !important;
  border-top: 3px solid #f43f5e !important;
}

.cell-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
  min-height: 24px;
}

.cell-top-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.cell-add-hint {
  opacity: 0;
  font-size: 10px;
  color: #64748b;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  transition: all 0.15s ease;
  transform: scale(0.9);
}

.cell-add-hint:hover {
  background: var(--primary, #0d9488);
  color: #ffffff;
  transform: scale(1.1);
}

.today-tag-pill {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.6px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #0d9488;
  color: #ffffff;
  text-transform: uppercase;
  box-shadow: 0 1px 3px rgba(13, 148, 136, 0.25);
}

.holiday-tag-pill {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.6px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #ffe4e6;
  color: #e11d48;
  text-transform: uppercase;
  border: 1px solid #fecdd3;
}

.date-badge-num {
  font-size: 13.5px;
  font-weight: 700;
  color: #334155;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease;
  margin-left: auto;
}

.today-badge {
  background: #0d9488 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.35);
  font-weight: 800;
}

.holiday-badge {
  color: #e11d48;
  font-weight: 800;
}

.cell-events-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.calendar-event-badge {
  padding: 5px 8px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  border-left: 3.5px solid transparent;
}

.calendar-event-badge:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  z-index: 5;
}

.badge-icon-wrap {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.7);
}

.event-title-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  font-size: 11.5px;
  letter-spacing: -0.1px;
}

.event-quick-actions {
  display: none;
  align-items: center;
  gap: 3px;
  margin-left: auto;
}

.calendar-event-badge:hover .event-quick-actions {
  display: flex;
}

.ev-action-btn {
  background: rgba(255, 255, 255, 0.85);
  border: none;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ev-action-btn:hover {
  background: #ffffff;
  color: #0f172a;
}

.ev-action-btn.delete:hover {
  color: #ef4444;
}

/* 🎨 Event Color Schemes - Premium Gradients & Accents */
.ev-holiday {
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  color: #9f1239;
  border: 1px solid #fecdd3;
  border-left: 3.5px solid #f43f5e;
}
.ev-holiday .badge-icon-wrap {
  background: rgba(244, 63, 94, 0.15);
  color: #e11d48;
}

.ev-attendance {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  color: #3730a3;
  border: 1px solid #c7d2fe;
  border-left: 3.5px solid #6366f1;
}
.ev-attendance .badge-icon-wrap {
  background: rgba(99, 102, 241, 0.15);
  color: #4f46e5;
}

.ev-birthday {
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  color: #9d174d;
  border: 1px solid #fbcfe8;
  border-left: 3.5px solid #ec4899;
}
.ev-birthday .badge-icon-wrap {
  background: rgba(236, 72, 153, 0.15);
  color: #db2777;
}

.ev-online {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border: 1px solid #a7f3d0;
  border-left: 3.5px solid #10b981;
}
.ev-online .badge-icon-wrap {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.ev-offline {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #92400e;
  border: 1px solid #fde68a;
  border-left: 3.5px solid #f59e0b;
}
.ev-offline .badge-icon-wrap {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.ev-service {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
  border: 1px solid #bfdbfe;
  border-left: 3.5px solid #3b82f6;
}
.ev-service .badge-icon-wrap {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.ev-visit {
  background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%);
  color: #155e75;
  border: 1px solid #a5f3fc;
  border-left: 3.5px solid #06b6d4;
}
.ev-visit .badge-icon-wrap {
  background: rgba(6, 182, 212, 0.15);
  color: #0891b2;
}

.ev-custom-event {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  color: #5b21b6;
  border: 1px solid #ddd6fe;
  border-left: 3.5px solid #8b5cf6;
}
.ev-custom-event .badge-icon-wrap {
  background: rgba(139, 92, 246, 0.15);
  color: #7c3aed;
}

.ev-note {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  color: #9a3412;
  border: 1px solid #fed7aa;
  border-left: 3.5px solid #ea580c;
}
.ev-note .badge-icon-wrap {
  background: rgba(234, 88, 12, 0.15);
  color: #c2410c;
}

.ev-default {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-left: 3.5px solid #64748b;
}
.ev-default .badge-icon-wrap {
  background: rgba(100, 116, 139, 0.15);
  color: #475569;
}

/* ════════ Modal Styles ════════ */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card-premium {
  background: #ffffff;
  border-radius: 14px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border, #e2e8f0);
}

.modal-header-premium {
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fafbfc;
}

.mhp-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mhp-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f0fdfa;
  color: var(--primary, #0d9488);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.mhp-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.mhp-subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 2px 0 0;
}

.mhp-close-btn {
  background: #f1f5f9;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s ease;
}

.mhp-close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.header-actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit-icon {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #2563eb;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
}

.modal-body-premium {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 75vh;
  overflow-y: auto;
}

.modal-footer-premium {
  padding: 14px 22px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  background: #fafbfc;
}

/* Event Type Selector Buttons in Popup */
.event-type-selector {
  display: flex;
  gap: 10px;
}

.type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-btn:hover {
  background: #f1f5f9;
}

.type-btn.active.type-holiday { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
.type-btn.active.type-note { background: #fffbeb; border-color: #fde68a; color: #b45309; }
.type-btn.active.type-event { background: #f5f3ff; border-color: #ddd6fe; color: #6d28d9; }

.event-type-prompt {
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}

.event-input-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.required-star {
  color: #ef4444;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 13px;
}

.textarea-wrapper {
  align-items: flex-start;
}

.textarea-icon {
  top: 12px;
}

.custom-input {
  width: 100%;
  padding: 9px 12px 9px 34px;
  background: #f8fafc;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  font-size: 13.5px;
  color: #0f172a;
  outline: none;
  font-family: inherit;
  transition: all 0.15s ease;
}

.custom-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.custom-input:focus {
  background: #ffffff;
  border-color: var(--primary, #0d9488);
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.12);
}

.btn-ghost-modal {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary-modal {
  background: var(--primary, #0d9488);
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Meeting Details Modal Styles */
.status-badge-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 3px;
}

.status-badge-pill.online { background: #ecfdf5; color: #065f46; }
.status-badge-pill.offline { background: #fffbeb; color: #92400e; }

.meeting-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.meta-item-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
}

.meta-item-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 3px;
}

.meta-item-val {
  font-size: 13.5px;
  font-weight: 600;
  color: #0f172a;
}

.desc-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #334155;
  margin: 4px 0 0;
  line-height: 1.5;
}

.meeting-link-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  padding: 10px 14px;
  border-radius: 8px;
}

.link-label-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: #0f766e;
}

.btn-join-room {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--primary, #0d9488);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.topics-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.btn-edit-topics-pill {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.topics-display-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
  min-height: 70px;
}

.topics-html {
  font-size: 13px;
  line-height: 1.5;
  color: #1e293b;
}

.editor-action-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.btn-ghost-sm {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.btn-save-sm {
  background: var(--primary, #0d9488);
  color: #ffffff;
  border: none;
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

/* Service Detail Modal */
.service-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.srv-detail-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 10px 14px;
  border-radius: 8px;
}

.srv-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  display: block;
  margin-bottom: 2px;
}

.srv-value {
  font-size: 13.5px;
  font-weight: 600;
  color: #0f172a;
}

/* View Event Details */
.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.detail-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.detail-val-highlight {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.detail-desc-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  white-space: pre-line;
  line-height: 1.5;
  margin: 0;
}

/* 🌴 Holiday Specific Indicators & Badges */
.status-meta-pill.holiday-meta-pill {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #b91c1c;
  padding: 2px 9px;
  border-radius: 999px;
  font-weight: 700;
}

.status-meta-pill.holiday-meta-pill i {
  color: #ef4444;
}

.is-holiday-cell {
  background: #fffafa !important;
}

.official-pill {
  font-size: 10.5px;
  font-weight: 700;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 2px 7px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.recurring-pill {
  font-size: 10.5px;
  font-weight: 700;
  color: #6b21a8;
  background: #f3e8ff;
  border: 1px solid #e9d5ff;
  padding: 2px 7px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.official-holiday-note-box {
  margin-top: 10px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #991b1b;
  font-weight: 500;
}

.official-holiday-note-box i {
  font-size: 14px;
  color: #ef4444;
}

.bg-red-tint {
  background: #fef2f2 !important;
}

.text-red {
  color: #ef4444 !important;
}

/* ════════ Responsive Breakpoints ════════ */
@media (max-width: 992px) {
  .main-content {
    padding: 16px 14px;
    gap: 16px;
    flex-direction: column;
  }

  .calendar-top-banner {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    gap: 14px;
  }

  .banner-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .month-nav-pill {
    justify-content: space-between;
  }

  .calendar-quick-actions {
    justify-content: flex-end;
  }

  .date-cell {
    min-height: 85px;
    padding: 6px 4px;
  }

  .date-badge-num {
    font-size: 11px;
    width: 20px;
    height: 20px;
  }

  .calendar-event-badge {
    font-size: 10px;
    padding: 2px 4px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px 10px;
  }

  .date-cell {
    min-height: 65px;
    padding: 4px 2px;
  }

  .day-col-header {
    font-size: 10.5px;
    padding: 8px 2px;
  }

  .calendar-event-badge {
    font-size: 9px;
    padding: 1px 3px;
  }

  .event-title-text {
    font-size: 9px;
  }

  .meeting-meta-grid,
  .service-details-grid {
    grid-template-columns: 1fr;
  }
}
</style>