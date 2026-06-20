<template>
  <div class="layout" :class="{ 'focus-overlay-active': showFocusOverlay }">
    <!-- Focus Overlay for highlighting SBU button -->
    <div v-if="showFocusOverlay" class="focus-overlay" @click="dismissFocusOverlay"></div>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Calendar Filters - Mobile Toggle -->
        <div class="filters-header" @click="toggleFilters">
          <span class="filters-toggle-label">
            <i class="fas fa-sliders-h"></i> Filters
            <span class="filter-count" v-if="activeFilterCount > 0">{{ activeFilterCount }}</span>
          </span>
          <i class="fas fa-chevron-down" :class="{ 'rotated': showFiltersPanel }"></i>
        </div>

        <div class="calendar-filters" :class="{ 'filters-expanded': showFiltersPanel, 'filters-collapsed': !showFiltersPanel }">
          <label>
            <input type="checkbox" v-model="showFilters.meetings" />
            Meetings
          </label>
          <label>
            <input type="checkbox" v-model="showFilters.services" />
            Services
          </label>
          <label>
            <input type="checkbox" v-model="showFilters.visits" />
            Visits
          </label>
          <label>
            <input type="checkbox" v-model="showFilters.birthdays" />
            Birthdays
          </label>
          <label>
            <input type="checkbox" v-model="showFilters.holidays" />
            Holidays
          </label>
          <label>
            <input type="checkbox" v-model="showFilters.events" />
            Events
          </label>
          <label>
            <input type="checkbox" v-model="showFilters.notes" />
            Notes
          </label>
          <label>
            <input type="checkbox" v-model="showFilters.attendance" />
            Attendance
          </label>
        </div>

        <div v-if="showDatePopup" class="modal-backdrop" @click.self="closeDatePopup">
          <div class="modal-card calendar-modal">
            <div class="modal-header">
              <h3 class="modal-title">{{ selectedDate }}</h3>
              <button class="icon-close" @click="closeDatePopup">✕</button>
            </div>
            <div class="modal-body">
              <div class="action-buttons">
                <button class="btn note" @click="openForm('note')">📝 Note</button>
              </div>
              <div v-if="formType" class="form-group fade-in">
                <input v-if="formType !== 'note'" v-model="form.title" placeholder="Enter title" />
                <textarea v-model="form.description" placeholder="Add description"></textarea>
                <button class="btn-save" @click="saveCalendarData">
                  <i class="fa fa-save" style="font-size:13px"></i> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar Header -->
        <div class="calendar-header">
          <button @click="prevMonth" class="nav-arrow" aria-label="Previous month">‹</button>
          <h3 class="month-year-title">{{ currentMonthYear }}</h3>
          <button @click="nextMonth" class="nav-arrow" aria-label="Next month">›</button>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
          <div class="day-name" v-for="day in days" :key="day">{{ day }}</div>

          <div
            class="date-cell"
            v-for="date in calendarDates"
            :key="date.fullDate"
            :class="{ today: date.isToday, 'has-events': date.events.length > 0 }"
            @click="openDatePopup(date)"
            @dragover.prevent
            @drop="onDrop(date)"
          >
            <span class="date-number">{{ date.day }}</span>
            <div class="event-dots" v-if="date.events.length > 0">
              <span class="dot" v-for="(event, idx) in date.events.slice(0, 3)" :key="idx" :class="event.type"></span>
              <span class="dot more" v-if="date.events.length > 3">+{{ date.events.length - 3 }}</span>
            </div>

            <div
              v-for="event in date.events"
              :key="event.id"
              class="event"
              :class="event.type"
              :draggable="isDraggable(event)"
              @dragstart="onDragStart(event)"
              @click.stop="handleEventClick(event)"
            >
              {{ event.title }}
              <div v-if="isCustomEvent(event)" class="event-actions">
                <i class="fa fa-edit" style="font-size:13px"></i>
                <span @click.stop="editCustomEvent(event)">Edit</span>
                |
                🗑️
                <span @click.stop="deleteCustomEvent(event)">Delete</span>
              </div>
            </div>
          </div>
        </div>

        <!-- View Note / Event Popup -->
        <div v-if="showViewModal" class="modal-backdrop" @click.self="showViewModal=false">
          <div class="modal-card small professional">
            <div class="modal-header">
              <h3 class="modal-title">{{ viewEvent.title }}</h3>
              <span class="status-badge">{{ viewEvent.type }}</span>
            </div>
            <div class="modal-body">
              <div class="info-item">
                <span class="label">Date</span>
                <span class="value">{{ viewEvent.date }}</span>
              </div>
              <div class="info-item" style="margin-top:12px">
                <span class="label">Description</span>
                <p style="white-space: pre-line">{{ viewEvent.description }}</p>
              </div>
              <div class="info-item" v-if="selectedMeeting.guests?.length">
                <span class="label">Guests</span>
                <ul class="guest-list">
                  <li v-for="(g, i) in displayedGuests" :key="i">{{ g }}</li>
                </ul>
                <button v-if="selectedMeeting.guests.length > 2" class="show-btn" @click="showAllGuests = !showAllGuests">
                  {{ showAllGuests ? "Show Less" : "Show All" }}
                </button>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-close" @click="showViewModal=false"><i class="fa fa-close" style="font-size:13px"></i> Close</button>
            </div>
          </div>
        </div>

        <!-- Interview Popup -->
        <div v-if="showMeetingModal" class="modal-backdrop" @click.self="closeMeeting">
          <div class="modal-card small professional">
            <div class="modal-header">
              <h3 class="modal-title">{{ selectedMeeting.title }}</h3>
              <span class="status-badge" :class="selectedMeeting.type">
                {{ selectedMeeting.type === 'offline' ? 'Offline' : 'Online' }}
              </span>
            </div>
            <div class="modal-body">
              <div class="info-grid single">
                <div class="info-item">
                  <span class="label">Date</span>
                  <span class="value">{{ selectedMeeting.meeting_date }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Time</span>
                  <span class="value">{{ selectedMeeting.meeting_time }}</span>
                </div>
                <div class="info-item" v-if="selectedMeeting.description">
                  <span class="label">Description</span>
                  <span class="value">{{ selectedMeeting.description }}</span>
                </div>
                <span class="label">Meeting Topics</span>
                <button class="btn-edit-topics" @click="enableTopicEdit">
                  <i class="fa fa-edit" style="font-size:13px"></i> Edit Topics
                </button>
                <div class="info-item full-width">
                  <div v-if="!isEditingTopics" class="topics-view">
                    <div v-if="selectedMeeting.topics" v-html="sanitizedTopics" class="topics-content"></div>
                    <p v-else class="no-topics">No topics added.</p>
                  </div>
                  <div v-else class="topics-edit fade-in">
                    <QuillEditor v-model:content="meetingTopics" contentType="html" theme="snow" :toolbar="toolbarOptions" style="height: 220px" />
                    <div class="topic-actions">
                      <button class="btn-save-topics" @click="saveTopics"><i class="fa fa-save" style="font-size:13px"></i> Save</button>
                      <button class="btn-cancel-topics" @click="cancelTopicEdit"><i class="fa fa-close" style="font-size:13px"></i> Cancel</button>
                    </div>
                  </div>
                </div>
                <div class="info-item" v-if="selectedMeeting.meeting_link">
                  <span class="label">Meeting Link</span>
                  <a :href="selectedMeeting.meeting_link" target="_blank" class="join-btn">
                    <i class="fas fa-video"></i> Join Meeting
                  </a>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-close" @click="closeMeeting"><i class="fa fa-close" style="font-size:13px"></i> Close</button>
            </div>
          </div>
        </div>

        <div v-if="showServiceModal" class="modal-backdrop" @click.self="showServiceModal=false">
          <div class="modal-card medium professional">
            <div class="modal-header">
              <h3 class="modal-title">{{ selectedService.company_name }}</h3>
              <span class="status-badge" :class="selectedService.status?.toLowerCase()">
                {{ selectedService.status }}
              </span>
            </div>
            <div class="modal-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">PO Number</span>
                  <span class="value">{{ selectedService.po_number || '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Visit Date</span>
                  <span class="value">{{ selectedService.visit_date }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Assigned To</span>
                  <span class="value">{{ selectedService.assign_to_name }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Service Type</span>
                  <span class="value">
                    {{ selectedService.isVisit ? selectedService.service_type : selectedService.type_of_service }}
                  </span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-close" @click="showServiceModal=false"><i class="fa fa-close" style="font-size:13px"></i> Close</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Google Form Popup Modal -->
    <div class="modal-overlay" v-if="showGoogleFormModal">
      <div class="modal google-form-modal">
        <div class="modal-header google-form-header">
          <h2><i class="fab fa-google"></i> Strategic Business Unit Discussion – SBU</h2>
          <span class="close-btn" @click="closeGoogleForm">&times;</span>
        </div>
        <div class="google-form-body">
          <div class="form-info-banner">
            <i class="fas fa-info-circle"></i>
            <span>Topic: Strategic Business Proposal Discussion – SBU | Presented by: Prasad Sir</span>
          </div>
          <iframe :src="googleFormUrl" frameborder="0" class="google-form-iframe" title="SBU Discussion Form"></iframe>
        </div>
        <div class="google-form-footer">
          <button @click="closeGoogleForm" class="remind-later-btn"><i class="fas fa-clock"></i> Remind Later</button>
          <button @click="openFormInNewTab" class="open-new-tab-btn"><i class="fas fa-external-link-alt"></i> Open in New Tab</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import DOMPurify from 'dompurify'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  components: { Sidebar, QuillEditor },

  data() {
    return {
      // Header related data
      currentUser: {},
      unreadMentionsCount: 0,
      showNotificationPanel: false,
      notifications: [],
      showDownloadMenu: false,
      showGoogleFormModal: false,
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfwz35YgfHbSIm3-zapvywqD8pw56fXc-U5EwpCmcG3v3zwrg/viewform?embedded=true',
      showFocusOverlay: false,
      focusTimer: null,
      refreshTimer: null,

      // Calendar data
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
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
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
        services: false,
        visits: false,
        birthdays: true,
        holidays: true,
        events: true,
        notes: true,
        attendance: false
      },
      showFiltersPanel: false,
      visitEvents: [],
      events: [],
      serviceEvents: [],
      showMeetingModal: false,
      showServiceModal: false,
      selectedMeeting: {},
      selectedService: {},
      isMobile: false,
      isSidebarVisible: true,
      currentDate: new Date(),
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  },

  computed: {
    activeFilterCount() {
      let count = 0;
      for (const key in this.showFilters) {
        if (this.showFilters[key]) count++;
      }
      return count;
    },
    displayedGuests() {
      if (!this.selectedMeeting?.guests) return [];
      return this.showAllGuests ? this.selectedMeeting.guests : this.selectedMeeting.guests.slice(0, 2);
    },
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    },
    sanitizedTopics() {
      return DOMPurify.sanitize(this.selectedMeeting.topics || '')
    },
    recentNotifications() {
      return this.notifications.slice(0, 4);
    },
    calendarDates() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const firstDay = new Date(year, month, 1).getDay()
      const totalDays = new Date(year, month + 1, 0).getDate()
      const dates = []

      for (let i = 0; i < firstDay; i++) {
        dates.push({ day: '', events: [], fullDate: null })
      }

      for (let day = 1; day <= totalDays; day++) {
        const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        dates.push({
          day,
          fullDate,
          isToday: fullDate === new Date().toISOString().split('T')[0],
          events: [
            ...(this.showFilters.meetings ? this.events.filter(e => e.date === fullDate) : []),
            ...(this.showFilters.services ? this.serviceEvents.filter(s => s.date === fullDate) : []),
            ...(this.showFilters.visits ? this.visitEvents.filter(v => v.date === fullDate) : []),
            ...(this.showFilters.attendance ? this.attendanceEvents.filter(a => a.date === fullDate) : []),
            ...(this.customCalendarEvents.filter(c =>
              c.date === fullDate &&
              ((c.type === 'holiday' && this.showFilters.holidays) ||
               (c.type === 'event' && this.showFilters.events) ||
               (c.type === 'note' && this.showFilters.notes))
            )),
            ...(this.showFilters.birthdays ? this.birthdayEvents.filter(b => b.month === month + 1 && b.day === day) : [])
          ]
        })
      }
      return dates
    }
  },

  methods: {
    toggleFilters() {
      this.showFiltersPanel = !this.showFiltersPanel;
    },
    // Header methods
    getAuthHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` };
    },

    async fetchCurrentUser() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
          headers: this.getAuthHeaders()
        });
        this.currentUser = response.data;
      } catch (err) {
        console.error('fetchCurrentUser error:', err);
      }
    },

    async fetchNotifications() {
      try {
        const token = localStorage.getItem('token');
        const [mentionsRes, unreadRes] = await Promise.all([
          axios.get('https://employees.archenterprises.co.in/api/api/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://employees.archenterprises.co.in/api/api/mentions/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        this.notifications = mentionsRes.data || [];
        this.unreadMentionsCount = unreadRes.data?.count || 0;
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    },

    formatFirstName(fullName) {
      if (!fullName) return '';
      return fullName.split(' ')[0];
    },

    formatTimeAgo(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    toggleNotificationPanel() {
      this.showNotificationPanel = !this.showNotificationPanel;
      if (this.showNotificationPanel) {
        setTimeout(() => {
          document.addEventListener('click', this.closeNotificationPanel);
        }, 100);
      } else {
        document.removeEventListener('click', this.closeNotificationPanel);
      }
    },

    closeNotificationPanel(e) {
      if (!this.$el.querySelector('.notification-bell-wrapper')?.contains(e.target)) {
        this.showNotificationPanel = false;
        document.removeEventListener('click', this.closeNotificationPanel);
      }
    },

    logout() {
      axios.post('https://employees.archenterprises.co.in/api/api/logout', {}, {
        headers: this.getAuthHeaders()
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    },

    downloadApk() {
      toastInfo('APK download starting...');
    },
    downloadIos() {
      toastInfo('iOS app coming soon!');
    },
    toggleDownloadMenu() {
      this.showDownloadMenu = !this.showDownloadMenu;
    },

    openGoogleForm() {
      this.showGoogleFormModal = true;
      document.body.style.overflow = 'hidden';
      if (this.showFocusOverlay) {
        this.dismissFocusOverlay();
      }
    },

    closeGoogleForm() {
      this.showGoogleFormModal = false;
      document.body.style.overflow = '';
    },

    openFormInNewTab() {
      window.open('https://docs.google.com/forms/d/e/1FAIpQLSfwz35YgfHbSIm3-zapvywqD8pw56fXc-U5EwpCmcG3v3zwrg/viewform', '_blank');
    },

    showFocusOnSBUButton() {
      const hasSeenFocus = localStorage.getItem('hasSeenSBUFocus');
      if (hasSeenFocus) return;

      setTimeout(() => {
        const btn = this.$refs.googleFormBtn;
        if (btn) {
          this.showFocusOverlay = true;
          this.focusTimer = setTimeout(() => {
            this.dismissFocusOverlay();
          }, 10000);
        }
      }, 1500);
    },

    dismissFocusOverlay() {
      this.showFocusOverlay = false;
      if (this.focusTimer) {
        clearTimeout(this.focusTimer);
      }
      localStorage.setItem('hasSeenSBUFocus', 'true');
    },

    // Calendar methods
    openAttendance(event) {
      if (!event) return
      const employeeName = event.name || 'Missing Name'
      const travelFrom = event.travel_from || '-'
      const travelTo = event.travel_to || '-'
      const siteName = event.site_name || '-'
      let description = ''
      if (event.status === 'Traveling') {
        description = `Employee: ${employeeName}\nTravel From: ${travelFrom}\nTravel To: ${travelTo}`
      } else if (event.status === 'OnSite') {
        description = `Employee: ${employeeName}\nSite: ${siteName}`
      }
      this.viewEvent = {
        title: event.title || 'Attendance',
        description,
        type: 'attendance',
        date: event.date
      }
      this.showViewModal = true
    },

    async fetchAttendanceCalendar() {
      try {
        const res = await fetch('https://employees.archenterprises.co.in/api/api/attendance/calendar', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        this.attendanceEvents = data
          .filter(a => a.status === 'Traveling' || a.status === 'OnSite')
          .map(a => {
            let title = ''
            if (a.status === 'Traveling') {
              title = `🚗 ${a.travel_from} → ${a.travel_to}`
            } else if (a.status === 'OnSite') {
              title = `📍 ${a.site_name}`
            }
            return {
              id: a.id,
              date: a.date,
              title: title,
              name: a.name || a.employee_name || 'Missing Name',
              travel_from: a.travel_from,
              travel_to: a.travel_to,
              site_name: a.site_name,
              status: a.status,
              type: 'attendance'
            }
          })
      } catch (e) {
        console.error('Attendance fetch failed', e)
      }
    },

    enableTopicEdit() {
      this.meetingTopics = this.selectedMeeting.topics || ''
      this.isEditingTopics = true
    },

    cancelTopicEdit() {
      this.isEditingTopics = false
    },

    isCustomEvent(event) {
      return event.type === 'note'
    },

    isDraggable(event) {
      return event.type === 'note'
    },

    onDragStart(event) {
      if (!this.isCustomEvent(event)) return
      this.draggedEvent = event
    },

    async onDrop(date) {
      if (!this.draggedEvent || !date.fullDate) return
      if (this.draggedEvent.date === date.fullDate) return
      try {
        await fetch(`https://employees.archenterprises.co.in/api/api/arch-calendar/${this.draggedEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ calendar_date: date.fullDate })
        })
        this.draggedEvent = null
        this.fetchCustomCalendarData()
      } catch (e) {
        console.error('Drag update failed', e)
      }
    },

    editCustomEvent(event) {
      this.selectedDate = event.date
      this.formType = event.type
      this.form = {
        title: event.rawTitle || event.title.replace(/^(Public Holiday: |Event: |📝 )/, ''),
        description: event.description || ''
      }
      this.editingId = event.id
      this.showDatePopup = true
    },

    openDatePopup(date) {
      if (!date.fullDate) return
      this.selectedDate = date.fullDate
      this.showDatePopup = true
      this.formType = null
      this.form = { title: '', description: '' }
    },

    openForm(type) {
      this.formType = type
      this.form = { title: '', description: '' }
    },

    closeDatePopup() {
      this.showDatePopup = false
      this.selectedDate = null
    },

    async saveCalendarData() {
      try {
        const url = this.editingId
          ? `https://employees.archenterprises.co.in/api/api/arch-calendar/${this.editingId}`
          : 'https://employees.archenterprises.co.in/api/api/arch-calendar'
        const method = this.editingId ? 'PUT' : 'POST'
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
        })
        this.editingId = null
        this.closeDatePopup()
        this.fetchCustomCalendarData()
      } catch (e) {
        console.error('Save failed', e)
      }
    },

    async deleteCustomEvent(event) {
      if (!confirm('Delete this item?')) return
      try {
        await fetch(`https://employees.archenterprises.co.in/api/api/arch-calendar/${event.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.fetchCustomCalendarData()
      } catch (e) {
        console.error('Delete failed', e)
      }
    },

    async fetchCustomCalendarData() {
      const res = await fetch('https://employees.archenterprises.co.in/api/api/arch-calendar', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      this.customCalendarEvents = data.map(d => ({
        id: d.id,
        date: d.calendar_date,
        title: d.type === 'holiday' ? `Public Holiday: ${d.title}` : d.type === 'event' ? `Event: ${d.title}` : d.type === 'note' ? `Note` : '',
        description: d.description,
        type: d.type
      }))
    },

    async fetchBirthdays() {
      try {
        const res = await fetch('https://employees.archenterprises.co.in/api/api/birthdays/calendar', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        this.birthdayEvents = data.map(b => {
          const dob = new Date(b.date)
          return {
            id: b.id,
            month: dob.getMonth() + 1,
            day: dob.getDate(),
            title: `🎂 ${b.name}`,
            type: 'birthday'
          }
        })
      } catch (e) {
        console.error('Birthday fetch failed', e)
      }
    },

    async fetchVisitAssignments() {
      try {
        const res = await fetch('https://employees.archenterprises.co.in/api/api/visit-assign/calendar', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        this.visitEvents = data.map(v => ({
          id: v.id,
          date: v.visit_date,
          title: v.company_name,
          type: 'visit'
        }))
      } catch (e) {
        console.error(e)
      }
    },

    async openVisit(id) {
      try {
        const res = await fetch(`https://employees.archenterprises.co.in/api/api/visit-assign/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const result = await res.json()
        this.selectedService = {
          ...result.data,
          isVisit: true
        }
        this.showServiceModal = true
      } catch (e) {
        console.error(e)
      }
    },

    handleEventClick(event) {
      switch (event.type) {
        case 'attendance':
          this.openAttendance(event)
          break
        case 'service':
          this.openService(event.id)
          break
        case 'visit':
          this.openVisit(event.id)
          break
        case 'online':
        case 'offline':
          this.openMeeting(event)
          break
        case 'note':
        case 'event':
        case 'holiday':
          this.openViewEvent(event)
          break
      }
    },

    openViewEvent(event) {
      this.viewEvent = {
        title: event.title,
        description: event.description || '—',
        type: event.type,
        date: event.date
      }
      this.showViewModal = true
    },

    async openService(id) {
      const res = await fetch(`https://employees.archenterprises.co.in/api/api/service-assign/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const result = await res.json()
      this.selectedService = result.data
      this.showServiceModal = true
    },

    async fetchServiceAssignments() {
      try {
        const res = await fetch('https://employees.archenterprises.co.in/api/api/service-assign/calendar', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        this.serviceEvents = data.map(s => ({
          id: s.id,
          date: s.visit_date,
          title: s.company_name,
          type: 'service'
        }))
      } catch (e) {
        console.error(e)
      }
    },

    async openMeeting(event) {
      try {
        const res = await fetch(`https://employees.archenterprises.co.in/api/api/meetings/${event.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const result = await res.json()
        this.selectedMeeting = result.data
        this.meetingTopics = this.selectedMeeting.topics || ''
        this.showMeetingModal = true
      } catch (err) {
        console.error('Failed to fetch meeting', err)
      }
    },

    async saveTopics() {
      const meetingId = this.selectedMeeting.id
      if (!meetingId) {
        toastError("Meeting ID not found")
        return
      }
      try {
        await fetch(`https://employees.archenterprises.co.in/api/api/meetings/${meetingId}/topics`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ topics: this.meetingTopics })
        })
        this.selectedMeeting.topics = this.meetingTopics
        toastSuccess('Topics saved successfully')
      } catch (e) {
        console.error('Failed to save topics', e)
      }
    },

    closeMeeting() {
      this.showMeetingModal = false
      this.selectedMeeting = {}
      this.isEditingTopics = false
    },

    async fetchMeetings() {
      try {
        const res = await fetch('https://employees.archenterprises.co.in/api/api/meetings/interviews', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        this.events = data.map(m => ({
          id: m.id,
          date: m.date,
          title: m.title,
          type: m.type === 'offline' ? 'offline' : 'online'
        }))
      } catch (err) {
        console.error('Failed to load meetings', err)
      }
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },

    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    document.addEventListener('click', (e) => {
      if (!this.$el.querySelector('.download-app')?.contains(e.target)) {
        this.showDownloadMenu = false
      }
    })

    const token = localStorage.getItem('token')
    if (!token) this.$router.push('/auth')

    this.fetchCurrentUser()
    this.fetchNotifications()
    this.fetchAttendanceCalendar()
    this.fetchServiceAssignments()
    this.fetchVisitAssignments()
    this.fetchMeetings()
    this.fetchBirthdays()
    this.fetchCustomCalendarData()
    this.showFocusOnSBUButton()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
    document.body.style.overflow = ''
    if (this.focusTimer) {
      clearTimeout(this.focusTimer)
    }
    document.removeEventListener('click', this.closeNotificationPanel)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary: #4361ee;
  --primary-dark: #3a56d4;
  --secondary: #06ffa5;
  --dark: #1e293b;
  --gray: #64748b;
  --light: #f8fafc;
  --border: #e2e8f0;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
  --text: #1f7f6f;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
}

/* Focus Overlay Styles */
.layout.focus-overlay-active {
  overflow: hidden;
}

.focus-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Main Layout */
.main-content {
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
}

.content {
  flex: 1;
  background: transparent;
  border-radius: 24px;
  transition: all 0.3s ease;
  margin-top: 0;
  padding: 30px 40px;
  background-color: #a5d5cf33;
  border-radius: 15px;
  overflow-x: auto;
}

/* Filters Header - Mobile Toggle */
.filters-header {
  display: none;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.filters-toggle-label {
  font-weight: 600;
  color: var(--dark);
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-count {
  background: var(--primary);
  color: white;
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 20px;
}

.filters-header i {
  transition: transform 0.3s ease;
  color: var(--gray);
}

.filters-header i.rotated {
  transform: rotate(180deg);
}

/* Calendar Filters */
.calendar-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 14px;
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.calendar-filters label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.calendar-filters label:hover {
  background: rgba(31, 127, 111, 0.08);
}

.calendar-filters input {
  accent-color: var(--text);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Calendar Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.calendar-header button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-header button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.calendar-header button:active {
  transform: scale(0.95);
}

.month-year-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-name {
  text-align: center;
  font-weight: 700;
  color: var(--primary);
  padding: 8px 0;
  font-size: 14px;
}

.date-cell {
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  padding: 8px;
  min-height: 90px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: relative;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.date-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.date-cell.today {
  border-color: var(--primary);
  background: #f0f4ff;
}

.date-cell.has-events {
  background: #fafafa;
}

.date-number {
  font-size: 13px;
  font-weight: 600;
  color: var(--dark);
}

/* Event Dots - Mobile Friendly */
.event-dots {
  display: flex;
  gap: 3px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.meeting { background: #4caf50; }
.dot.service { background: #17a2b8; }
.dot.visit { background: #20c997; }
.dot.birthday { background: #fd20dc; }
.dot.holiday { background: #dc3545; }
.dot.event { background: #6f42c1; }
.dot.note { background: #c084fc; }
.dot.attendance { background: #35ff50; }
.dot.more {
  background: var(--gray);
  color: white;
  font-size: 7px;
  font-weight: 700;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event {
  margin-top: 4px;
  padding: 3px 6px;
  font-size: 11px;
  border-radius: 6px;
  display: none;
}

/* Show events only on larger screens */
@media (min-width: 769px) {
  .event {
    display: block;
  }
  .event-dots {
    display: none;
  }
}

/* Event Types */
.event.service { background: #17a2b8; color: white; }
.event.interview { background: #6f42c1; color: white; }
.event.resource { background: #fd7e14; color: white; }
.event.holiday { background: #dc3545!important; color: white; }
.event.online { background: #4caf50; cursor: help; color: white; }
.event.offline { cursor: help; background: #ff9800; color: white; }
.event.birthday { cursor: not-allowed; background: linear-gradient(135deg, #fd20dc, #83067a); color: #ffffff; font-weight: 600; }
.event.visit { cursor: help; background: linear-gradient(135deg, #20c997, #63e6be); color: #053b2e; font-weight: 600; }
.event.note { cursor: help; background: linear-gradient(135deg, #c084fc, #e9d5ff); color: #3b0764; font-weight: 600; }
.event.attendance { background: #35ff50; }

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(4px);
  padding: 16px;
}

.calendar-modal {
  width: 420px;
  max-width: 95%;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.25s ease;
  overflow: hidden;
  font-family: "Inter", system-ui, sans-serif;
  max-height: 90vh;
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  background: linear-gradient(135deg, var(--primary), var(--text))!important;
  color: #fff;
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  word-break: break-word;
}

.icon-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.8;
  padding: 4px 8px;
}

.icon-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 22px;
  max-height: 70vh;
  overflow-y: auto;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.btn {
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: 0.2s ease;
}

.btn.holiday { background: #ffe8cc; color: #b45309; }
.btn.event { background: #e0f2fe; color: #0369a1; }
.btn.note { background: #f3e8ff; color: #7e22ce; }

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 13px;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1f7f6f;
}

.btn-save {
  width: 100%;
  background: var(--text);
  color: white;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-save:hover {
  background: #176b5e;
}

.fade-in {
  animation: fadeUp 0.3s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-card.professional {
  padding: 0;
  overflow: hidden;
  border-radius: 14px;
  max-width: 95%;
  background: #ffffff;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
}

.modal-card.medium {
  width: 520px;
  max-width: 95%;
}

.modal-card.small {
  width: 80%;
  max-width: 500px;
}

.status-badge {
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 20px;
  font-weight: 600;
  background: rgba(255,255,255,0.2);
  text-transform: capitalize;
}

.status-badge.online { background: #dcfce7; color: #16a34a; }
.status-badge.offline { background: #fee2e2; color: #dc2626; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.info-grid.single {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
  border-bottom-style: inset;
}

.info-item.full-width {
  margin-top: 10px;
  border: ridge;
  padding: 12px;
  max-height: 340px;
  overflow: auto;
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 14px;
  color: #111827;
  word-break: break-word;
}

.modal-footer {
  padding: 16px 22px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  background: #f9fafb;
  gap: 8px;
}

.btn-close {
  background: var(--text);
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.btn-close:hover {
  background: var(--primary);
}

.join-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 9px 16px;
  background: linear-gradient(135deg, var(--primary), var(--text));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 6px 14px rgba(31, 127, 111, 0.25);
}

.join-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(31, 127, 111, 0.35);
}

.event-actions {
  font-size: 10px;
  margin-top: 3px;
  opacity: 0.85;
  cursor: pointer;
}

.event-actions span:hover {
  text-decoration: underline;
}

.topics-display {
  max-height: 220px;
  overflow-y: auto;
  padding: 14px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  line-height: 1.6;
}

.show-btn {
  margin-top: 6px;
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.btn-edit-topics {
  margin-top: 14px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  width: 156px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-save-topics {
  margin-top: 10px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #4f46e5;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel-topics {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #374151;
  cursor: pointer;
  margin-left: 8px;
}

.guest-list {
  padding-left: 18px;
  margin: 0;
}

/* Google Form Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
}

.google-form-modal {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 900px;
  height: 85vh;
  max-height: 700px;
  padding: 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.google-form-header {
  background: var(--primary);
}

.google-form-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.form-info-banner {
  background: #e8f0fe;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #1967d2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.google-form-iframe {
  width: 100%;
  height: calc(100% - 45px);
  border: none;
}

.google-form-footer {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  background: var(--light);
  flex-wrap: wrap;
}

.remind-later-btn, .open-new-tab-btn {
  padding: 0.5rem 1rem;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
}

.remind-later-btn {
  border: 1px solid var(--border);
  background: white;
}

.open-new-tab-btn {
  border: none;
  background: var(--primary);
  color: white;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ============================================
   RESPONSIVE STYLES
   ============================================ */

/* Tablet */
@media (max-width: 1024px) {
  .content {
    padding: 20px;
  }
  .calendar-grid {
    gap: 6px;
  }
  .date-cell {
    min-height: 75px;
    padding: 6px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .content {
    padding: 16px;
    border-radius: 12px;
    margin-left: 0;
    overflow-x: visible;
  }
  
  .expanded-content {
    margin-left: 0 !important;
  }
  
  /* Filters */
  .filters-header {
    display: flex;
  }
  
  .calendar-filters {
    display: none;
    gap: 8px;
    margin-bottom: 12px;
    padding: 12px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  
  .calendar-filters.filters-expanded {
    display: flex;
  }
  
  .calendar-filters.filters-collapsed {
    display: none;
  }
  
  .calendar-filters label {
    font-size: 13px;
    padding: 4px 6px;
  }
  
  .calendar-filters label input {
    width: 14px;
    height: 14px;
  }
  
  /* Calendar */
  .calendar-grid {
    gap: 4px;
  }
  
  .day-name {
    font-size: 11px;
    padding: 4px 0;
  }
  
  .date-cell {
    min-height: 60px;
    padding: 4px;
    border-radius: 8px;
  }
  
  .date-number {
    font-size: 11px;
  }
  
  .month-year-title {
    font-size: 16px;
  }
  
  .calendar-header button {
    padding: 6px 12px;
    font-size: 16px;
    min-width: 36px;
    min-height: 36px;
  }
  
  /* Event dots on mobile */
  .dot {
    width: 6px;
    height: 6px;
  }
  
  .dot.more {
    width: 12px;
    height: 12px;
    font-size: 6px;
  }
  
  /* Modals */
  .modal-backdrop {
    padding: 12px;
  }
  
  .calendar-modal {
    width: 100%;
    max-width: 100%;
    margin: 0 8px;
    border-radius: 16px;
  }
  
  .modal-card.small {
    width: 95%;
    max-width: 95%;
  }
  
  .modal-card.medium {
    width: 95%;
    max-width: 95%;
  }
  
  .modal-header {
    padding: 14px 16px;
  }
  
  .modal-title {
    font-size: 16px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .modal-footer {
    padding: 12px 16px;
    flex-direction: column;
  }
  
  .modal-footer button {
    width: 100%;
    justify-content: center;
  }
  
  /* Google Form Modal */
  .google-form-modal {
    width: 98%;
    height: 92vh;
    max-height: 92vh;
    border-radius: 16px;
  }
  
  .google-form-header h2 {
    font-size: 16px;
  }
  
  .form-info-banner {
    font-size: 12px;
    padding: 0.5rem 0.75rem;
  }
  
  .google-form-footer {
    flex-direction: column;
    padding: 0.75rem;
  }
  
  .google-form-footer button {
    width: 100%;
    justify-content: center;
  }
  
  .join-btn {
    width: 100%;
    justify-content: center;
  }
  
  .btn-edit-topics {
    width: 100%;
  }
  
  .topic-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .topic-actions button {
    width: 100%;
  }
  
  .btn-cancel-topics {
    margin-left: 0;
  }
}

/* Small phones */
@media (max-width: 480px) {
  .main-content {
    padding: 0.5rem;
  }
  
  .content {
    padding: 12px;
    border-radius: 10px;
  }
  
  .calendar-grid {
    gap: 3px;
  }
  
  .date-cell {
    min-height: 50px;
    padding: 3px;
    border-radius: 6px;
  }
  
  .date-number {
    font-size: 10px;
  }
  
  .day-name {
    font-size: 10px;
    padding: 3px 0;
  }
  
  .month-year-title {
    font-size: 14px;
  }
  
  .calendar-header button {
    padding: 4px 10px;
    font-size: 14px;
    min-width: 32px;
    min-height: 32px;
  }
  
  .dot {
    width: 5px;
    height: 5px;
  }
  
  .dot.more {
    width: 10px;
    height: 10px;
    font-size: 5px;
  }
  
  .filters-header {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .calendar-filters {
    padding: 8px;
    gap: 4px;
  }
  
  .calendar-filters label {
    font-size: 11px;
    padding: 2px 4px;
  }
  
  .calendar-filters label input {
    width: 12px;
    height: 12px;
  }
  
  .modal-header {
    padding: 12px 14px;
  }
  
  .modal-title {
    font-size: 14px;
  }
  
  .modal-body {
    padding: 12px;
  }
  
  .modal-card.professional {
    max-width: 100%;
  }
  
  .action-buttons {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  
  .btn {
    font-size: 12px;
    padding: 8px;
  }
  
  .google-form-header h2 {
    font-size: 14px;
  }
  
  .form-info-banner {
    font-size: 10px;
    flex-wrap: wrap;
  }
  
  .close-btn {
    font-size: 24px;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  .date-cell,
  .calendar-header button,
  .filters-header,
  .btn,
  .modal-close,
  .btn-close,
  .join-btn,
  .google-form-footer button {
    min-height: 44px;
    min-width: 44px;
  }
  
  .date-cell:hover {
    transform: none;
  }
  
  .calendar-header button:hover {
    transform: none;
  }
}
</style>