<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- 📱 Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-calendar-plus"></i>
            <span>Schedule Meeting</span>
          </div>
        </div>

        <!-- 🏢 Desktop Header Banner -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-calendar-plus"></i>
            </div>
            <div>
              <h1 class="page-title">Schedule a Meeting</h1>
              <p class="subtitle-modern">Create video conference calls or organize in-person office meetings</p>
            </div>
          </div>
        </div>

        <!-- 🌿 Main Card Wrapper -->
        <div class="schedule-card-wrapper">
          
          <!-- Segmented Tab Switcher -->
          <div class="tabs-segmented-wrapper">
            <button
              :class="['tab-btn', { active: activeTab === 'online' }]"
              @click="selectTab('online')"
            >
              <i class="fas fa-video"></i>
              <span>Online Video Meeting</span>
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'offline' }]"
              @click="selectTab('offline')"
            >
              <i class="fas fa-building"></i>
              <span>Offline In-Person Meeting</span>
            </button>
          </div>

          <!-- Success Alert Message -->
          <transition name="fade">
            <div v-if="successMessage" class="alert-banner success">
              <div class="alert-content">
                <i class="fas fa-check-circle alert-icon"></i>
                <span>{{ successMessage }}</span>
              </div>
              <button type="button" class="alert-close" @click="successMessage = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </transition>

          <!-- Error Alert Message -->
          <transition name="fade">
            <div v-if="errorMessage" class="alert-banner danger">
              <div class="alert-content">
                <i class="fas fa-exclamation-circle alert-icon"></i>
                <span>{{ errorMessage }}</span>
              </div>
              <button type="button" class="alert-close" @click="errorMessage = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </transition>

          <!-- Form Grid (Left Column Form, Right Column Preview) -->
          <div class="schedule-grid">
            
            <!-- ◀️ LEFT COLUMN: Meeting Details -->
            <div class="form-column-left">

              <!-- ─── 1. ONLINE MEETING FORM ─── -->
              <div v-if="activeTab === 'online'" class="form-fields-container">
                
                <!-- Meeting Title -->
                <div class="form-group">
                  <label for="meetingTitle" class="field-label">
                    <i class="fas fa-heading"></i> Meeting Title <span class="required-star">*</span>
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="text"
                      id="meetingTitle"
                      v-model="formData.title"
                      class="form-control"
                      placeholder="e.g. Quarterly Product Strategy Review"
                      maxlength="100"
                    />
                  </div>
                  <small class="char-count">{{ formData.title.length }}/100</small>
                </div>

                <!-- Description -->
                <div class="form-group">
                  <label for="description" class="field-label">
                    <i class="fas fa-align-left"></i> Description & Agenda
                  </label>
                  <textarea
                    id="description"
                    v-model="formData.description"
                    class="form-control textarea"
                    placeholder="Add meeting agenda, discussion topics, or notes..."
                    rows="3"
                    maxlength="500"
                  ></textarea>
                  <small class="char-count">{{ formData.description.length }}/500</small>
                </div>

                <!-- Date & Time Row -->
                <div class="form-row-2">
                  <div class="form-group">
                    <label for="meetingDate" class="field-label">
                      <i class="fas fa-calendar-alt"></i> Meeting Date <span class="required-star">*</span>
                    </label>
                    <input
                      type="date"
                      id="meetingDate"
                      v-model="formData.date"
                      class="form-control"
                      :min="today"
                    />
                  </div>

                  <div class="form-group">
                    <label for="meetingTime" class="field-label">
                      <i class="fas fa-clock"></i> Start Time <span class="required-star">*</span>
                    </label>
                    <input
                      type="time"
                      id="meetingTime"
                      v-model="formData.time"
                      class="form-control"
                    />
                  </div>
                </div>

                <!-- Duration -->
                <div class="form-group">
                  <label for="duration" class="field-label">
                    <i class="fas fa-hourglass-half"></i> Duration
                  </label>
                  <div class="select-wrapper">
                    <select id="duration" v-model="formData.duration" class="form-control select-field">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour (60 mins)</option>
                      <option value="90">1.5 hours (90 mins)</option>
                      <option value="120">2 hours (120 mins)</option>
                      <option value="180">3 hours (180 mins)</option>
                    </select>
                  </div>
                </div>

                <!-- Access / Privacy Selection -->
                <div class="form-group">
                  <label class="field-label">
                    <i class="fas fa-shield-alt"></i> Meeting Access Permissions
                  </label>
                  <div class="access-radio-grid">
                    <label 
                      class="access-option-card" 
                      :class="{ selected: formData.accessType === 'anyone' }"
                    >
                      <input
                        type="radio"
                        v-model="formData.accessType"
                        value="anyone"
                      />
                      <div class="option-icon">
                        <i class="fas fa-globe"></i>
                      </div>
                      <div class="option-info">
                        <strong>Anyone with link</strong>
                        <small>Open to everyone who possesses the meeting URL</small>
                      </div>
                    </label>

                    <label 
                      class="access-option-card" 
                      :class="{ selected: formData.accessType === 'invited' }"
                    >
                      <input
                        type="radio"
                        v-model="formData.accessType"
                        value="invited"
                      />
                      <div class="option-icon">
                        <i class="fas fa-user-lock"></i>
                      </div>
                      <div class="option-info">
                        <strong>Invited guests only</strong>
                        <small>Restricted to participants on the guest invitation list</small>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              <!-- ─── 2. OFFLINE MEETING FORM ─── -->
              <div v-if="activeTab === 'offline'" class="form-fields-container">
                <div class="form-group">
                  <label for="offlineTitle" class="field-label">
                    <i class="fas fa-heading"></i> Meeting Title <span class="required-star">*</span>
                  </label>
                  <input 
                    id="offlineTitle" 
                    type="text" 
                    v-model="offlineForm.title" 
                    class="form-control" 
                    placeholder="e.g. Monthly Branch Review Meeting" 
                    maxlength="100" 
                  />
                  <small class="char-count">{{ offlineForm.title.length }}/100</small>
                </div>

                <div class="form-group">
                  <label for="offlineDescription" class="field-label">
                    <i class="fas fa-align-left"></i> Description & Agenda
                  </label>
                  <textarea 
                    id="offlineDescription" 
                    v-model="offlineForm.description" 
                    class="form-control textarea" 
                    rows="3" 
                    maxlength="5000" 
                    placeholder="Provide details, conference room location, or agenda..."
                  ></textarea>
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label for="offlineDate" class="field-label">
                      <i class="fas fa-calendar-alt"></i> Date <span class="required-star">*</span>
                    </label>
                    <input id="offlineDate" type="date" v-model="offlineForm.date" class="form-control" :min="today" />
                  </div>
                  <div class="form-group">
                    <label for="offlineTime" class="field-label">
                      <i class="fas fa-clock"></i> Time <span class="required-star">*</span>
                    </label>
                    <input id="offlineTime" type="time" v-model="offlineForm.time" class="form-control" />
                  </div>
                </div>

                <!-- Team Email Invitations -->
                <div class="form-group">
                  <label class="field-label">
                    <i class="fas fa-paper-plane"></i> Automated Email Invitations <span class="required-star">*</span>
                  </label>
                  <div class="team-checkbox-grid">
                    <label class="team-checkbox-card" :class="{ checked: offlineForm.inviteAll }">
                      <input type="checkbox" v-model="offlineForm.inviteAll" />
                      <div class="checkbox-indicator">
                        <i class="fas fa-check" v-if="offlineForm.inviteAll"></i>
                      </div>
                      <div class="team-info">
                        <div class="team-name">All Employees</div>
                        <span class="team-desc">Broadcast notification to entire workforce</span>
                      </div>
                    </label>

                    <label class="team-checkbox-card" :class="{ checked: offlineForm.inviteIT }">
                      <input type="checkbox" v-model="offlineForm.inviteIT" />
                      <div class="checkbox-indicator">
                        <i class="fas fa-check" v-if="offlineForm.inviteIT"></i>
                      </div>
                      <div class="team-info">
                        <div class="team-name">IT & Development Team</div>
                        <span class="team-desc">Codes: DM, OW001, IT</span>
                      </div>
                    </label>

                    <label class="team-checkbox-card" :class="{ checked: offlineForm.inviteService }">
                      <input type="checkbox" v-model="offlineForm.inviteService" />
                      <div class="checkbox-indicator">
                        <i class="fas fa-check" v-if="offlineForm.inviteService"></i>
                      </div>
                      <div class="team-info">
                        <div class="team-name">Sales & Service Operations</div>
                        <span class="team-desc">Codes: SALE01, ACC01, SERVICE01, MANG01</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

            </div>

            <!-- ▶️ RIGHT COLUMN: Live Meeting Preview & Guest Manager -->
            <div class="form-column-right">

              <!-- Live Interactive Preview Card -->
              <div class="preview-card-elevated">
                <div class="preview-card-header">
                  <div class="preview-badge-pill">
                    <i :class="activeTab === 'online' ? 'fas fa-video' : 'fas fa-building'"></i>
                    <span>{{ activeTab === 'online' ? 'Online Session' : 'In-Office Session' }}</span>
                  </div>
                  <span class="status-live-dot"></span>
                </div>

                <!-- Preview Content -->
                <div class="preview-summary-block">
                  <h3 class="preview-title-text">
                    {{ (activeTab === 'online' ? formData.title : offlineForm.title) || 'Untitled Meeting' }}
                  </h3>
                  
                  <div class="preview-meta-list">
                    <div class="preview-meta-item">
                      <i class="fas fa-calendar-day"></i>
                      <div>
                        <span class="meta-label">Date & Time</span>
                        <p class="meta-val">
                          {{ (activeTab === 'online' ? formData.date : offlineForm.date) && (activeTab === 'online' ? formData.time : offlineForm.time) ? formatDateTime() : 'Date & Time not set' }}
                        </p>
                      </div>
                    </div>

                    <div v-if="activeTab === 'online'" class="preview-meta-item">
                      <i class="fas fa-hourglass-end"></i>
                      <div>
                        <span class="meta-label">Duration</span>
                        <p class="meta-val">{{ formData.duration }} Minutes</p>
                      </div>
                    </div>

                    <div v-if="activeTab === 'online'" class="preview-meta-item">
                      <i class="fas fa-lock"></i>
                      <div>
                        <span class="meta-label">Access Level</span>
                        <p class="meta-val">{{ formData.accessType === 'anyone' ? 'Anyone with link' : 'Invited guests only' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Online Meeting Link Generator Box -->
                <div v-if="activeTab === 'online'" class="meeting-link-wrapper">
                  <span class="section-micro-label">Meeting Join URL</span>
                  <div class="meeting-link-card">
                    <span class="link-url-text">{{ meetingLink }}</span>
                    <button
                      class="copy-link-btn"
                      @click="copyToClipboard"
                      :title="copyTooltip"
                    >
                      <i :class="copyTooltip === 'Copied!' ? 'fas fa-check' : 'fas fa-copy'"></i>
                      <span>{{ copyTooltip === 'Copied!' ? 'Copied' : 'Copy' }}</span>
                    </button>
                  </div>
                </div>

                <!-- Guests Invitation Section (Online Meetings) -->
                <div v-if="activeTab === 'online'" class="guests-manager-section">
                  <span class="section-micro-label">Invite Participants ({{ formData.guests.length }})</span>
                  <div class="guest-add-row">
                    <div class="guest-input-wrap">
                      <i class="fas fa-envelope"></i>
                      <input
                        type="email"
                        v-model="guestEmail"
                        class="guest-input"
                        placeholder="guest@example.com"
                        @keyup.enter="addGuest"
                      />
                    </div>
                    <button class="add-guest-btn" @click="addGuest" title="Add Guest Email">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>

                  <!-- Guest Chips List -->
                  <div v-if="formData.guests.length > 0" class="guest-chips-wrap">
                    <div v-for="(guest, index) in formData.guests" :key="index" class="guest-chip">
                      <span class="guest-chip-avatar">{{ guest.charAt(0).toUpperCase() }}</span>
                      <span class="guest-chip-email">{{ guest }}</span>
                      <button class="remove-chip-btn" @click="removeGuest(index)" title="Remove">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Online Video Call Toggles -->
                <div v-if="activeTab === 'online'" class="media-settings-section">
                  <span class="section-micro-label">Device & Media Settings</span>
                  
                  <div class="toggle-row">
                    <div class="toggle-text">
                      <i class="fas fa-video"></i>
                      <span>Host Video Camera</span>
                    </div>
                    <label class="switch-toggle">
                      <input type="checkbox" v-model="formData.hostVideo" />
                      <span class="slider round"></span>
                    </label>
                  </div>

                  <div class="toggle-row">
                    <div class="toggle-text">
                      <i class="fas fa-users"></i>
                      <span>Guest Video Camera</span>
                    </div>
                    <label class="switch-toggle">
                      <input type="checkbox" v-model="formData.guestVideo" />
                      <span class="slider round"></span>
                    </label>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <!-- Bottom Action Buttons -->
          <div class="form-bottom-actions">
            <button class="btn-clear-form" @click="resetForm">
              <i class="fas fa-redo-alt"></i>
              <span>Clear Form</span>
            </button>
            <button
              class="btn-schedule-submit"
              @click="activeTab === 'online' ? scheduleMeeting() : scheduleOffline()"
              :disabled="!isFormValid || isSubmitting"
            >
              <span v-if="!isSubmitting">
                <i class="fas fa-calendar-check"></i>
                <span>{{ activeTab === 'online' ? 'Schedule Online Meeting' : 'Schedule Offline Meeting' }}</span>
              </span>
              <span v-else class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Scheduling Session...</span>
              </span>
            </button>
          </div>

        </div>
      </section>
    </div>
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
  name: 'ScheduleMeeting',
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      activeTab: 'online',
      today: '',
      meetingId: '',
      copyTooltip: 'Copy to clipboard',
      guestEmail: '',
      isSubmitting: false,
      successMessage: '',
      errorMessage: '',

      // Online form data
      formData: {
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        accessType: 'invited',
        guests: [],
        hostVideo: true,
        guestVideo: true,
        requireVideo: false
      },

      // Offline form data
      offlineForm: {
        title: '',
        description: '',
        date: '',
        time: '',
        inviteAll: false,
        inviteIT: false,
        inviteService: false
      }
    }
  },

  computed: {
    meetingLink() {
      const baseUrl = window.location.origin
      return `${baseUrl}/meet/${this.meetingId}`
    },

    isFormValid() {
      if (this.activeTab === 'online') {
        return !!(this.formData.title && this.formData.date && this.formData.time)
      } else {
        return !!(this.offlineForm.title && this.offlineForm.date && this.offlineForm.time)
      }
    }
  },

  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    selectTab(tab) {
      this.activeTab = tab
      this.errorMessage = ''
      this.successMessage = ''
    },

    formatDateTime() {
      const date = this.activeTab === 'online' ? this.formData.date : this.offlineForm.date
      const time = this.activeTab === 'online' ? this.formData.time : this.offlineForm.time
      if (!date || !time) return ''

      const dateObj = new Date(`${date}T${time}`)
      return dateObj.toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    addGuest() {
      const email = this.guestEmail.trim()
      if (!email) return

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        toastError('Please enter a valid email address')
        return
      }

      if (this.formData.guests.includes(email)) {
        toastWarning('This email is already added')
        return
      }

      this.formData.guests.push(email)
      this.guestEmail = ''
    },

    removeGuest(index) {
      this.formData.guests.splice(index, 1)
    },

    copyToClipboard() {
      navigator.clipboard.writeText(this.meetingLink).then(() => {
        this.copyTooltip = 'Copied!'
        toastSuccess('Meeting link copied to clipboard!')
        setTimeout(() => {
          this.copyTooltip = 'Copy to clipboard'
        }, 2500)
      })
    },

    resetForm() {
      this.meetingId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)

      this.formData = {
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        accessType: 'invited',
        guests: [],
        hostVideo: true,
        guestVideo: true,
        requireVideo: false
      }
      
      this.offlineForm = {
        title: '',
        description: '',
        date: '',
        time: '',
        inviteAll: false,
        inviteIT: false,
        inviteService: false
      }
      
      this.guestEmail = ''
      this.errorMessage = ''
      this.successMessage = ''
    },

    async scheduleOffline() {
      if (!this.isFormValid) {
        this.errorMessage = 'Please fill in all required fields'
        return
      }

      if (!this.offlineForm.inviteAll && !this.offlineForm.inviteIT && !this.offlineForm.inviteService) {
        this.errorMessage = 'Please select at least one invitation option (All, IT, or Service)'
        return
      }

      this.isSubmitting = true
      this.errorMessage = ''

      try {
        let guests = []

        if (this.offlineForm.inviteAll) {
          try {
            const resp = await axios.get('https://employees.archenterprises.co.in/api/api/users')
            const users = resp.data || []
            guests = users.map(u => u.email).filter(Boolean)
          } catch (e) {
            console.warn('Failed to fetch users for invitations', e)
          }
        } else {
          const departmentCodes = []
          if (this.offlineForm.inviteIT) {
            departmentCodes.push('DM', 'OW001', 'IT')
          }
          if (this.offlineForm.inviteService) {
            departmentCodes.push('SALE01', 'ACC01', 'SERVICE01', 'MANG01', 'OW001')
          }

          if (departmentCodes.length > 0) {
            try {
              const resp = await axios.post('https://employees.archenterprises.co.in/api/api/users/by-department-codes', {
                department_codes: departmentCodes
              })
              const users = resp.data || []
              guests = users.map(u => u.email).filter(Boolean)
            } catch (e) {
              console.warn('Failed to fetch users by departments', e)
            }
          }
        }

        guests = [...new Set(guests)]

        if (guests.length === 0) {
          this.errorMessage = 'No users found for the selected invitation options'
          this.isSubmitting = false
          return
        }

        const meetingData = {
          meeting_id: this.meetingId,
          type: 'offline',
          title: this.offlineForm.title.trim(),
          description: this.offlineForm.description,
          meeting_date: this.offlineForm.date,
          meeting_time: this.offlineForm.time,
          guests: guests,
          email_subject: 'Offline meeting schedule',
          email_body: `Offline meeting schedule\n\nTitle: ${this.offlineForm.title}\nDescription: ${this.offlineForm.description || '-'}\nDate: ${this.offlineForm.date}\nTime: ${this.offlineForm.time}`
        }

        await axios.post('https://employees.archenterprises.co.in/api/api/meetings/schedule', meetingData)

        this.successMessage = `Offline meeting scheduled successfully! Invitations dispatched to ${guests.length} participant(s).`
        toastSuccess('Offline meeting scheduled successfully!')

        setTimeout(() => {
          this.resetForm()
        }, 3000)
      } catch (error) {
        console.error('Error scheduling offline meeting:', error)
        this.errorMessage = error.response?.data?.message || 'Failed to schedule meeting. Please try again.'
        toastError(this.errorMessage)
      } finally {
        this.isSubmitting = false
      }
    },

    async scheduleMeeting() {
      if (!this.isFormValid) {
        this.errorMessage = 'Please fill in all required fields'
        return
      }

      this.isSubmitting = true
      this.errorMessage = ''

      try {
        const meetingData = {
          meeting_id: this.meetingId,
          meeting_link: this.meetingLink,
          title: this.formData.title,
          description: this.formData.description,
          meeting_date: this.formData.date,
          meeting_time: this.formData.time,
          duration: this.formData.duration,
          access_type: this.formData.accessType,
          guests: this.formData.guests,
          host_video: this.formData.hostVideo,
          guest_video: this.formData.guestVideo,
          require_video: this.formData.requireVideo
        }

        await axios.post('https://employees.archenterprises.co.in/api/api/meetings/schedule', meetingData)

        this.successMessage = `Meeting scheduled successfully! Meeting Link: ${this.meetingLink}`
        toastSuccess('Online meeting scheduled successfully!')
        
        setTimeout(() => {
          this.resetForm()
        }, 3500)
      } catch (error) {
        console.error('Error scheduling meeting:', error)
        this.errorMessage = error.response?.data?.message || 'Failed to schedule meeting. Please try again.'
        toastError(this.errorMessage)
      } finally {
        this.isSubmitting = false
      }
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }

    this.today = new Date().toISOString().split('T')[0]
    this.meetingId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* 🌿 Root & Variables - Emerald Mint Theme */
:root {
  --primary: #2cb67d;
  --primary-dark: #209961;
  --primary-light: #eaf7f1;
  --text: #0f2e22;
  --text-light: #6b8f81;
  --bg-app: #edf7f2;
  --card: #ffffff;
  --border: #dff0e7;
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background: var(--bg-app, #edf7f2);
  font-family: var(--font-body, 'Inter', sans-serif);
  color: #0f2e22;
}

.main-content {
  display: flex;
  min-height: 100vh;
  padding: 18px 24px;
  gap: 24px;
}

.content {
  flex: 1;
  background: transparent;
  overflow-x: hidden;
}

/* 📱 Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #ffffff;
  border-radius: 18px;
  margin-bottom: 18px;
  border: 1px solid #e0f0e8;
  box-shadow: 0 4px 16px rgba(44, 182, 125, 0.06);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
}

.mobile-title i {
  color: #2cb67d;
}

/* 🏢 Desktop Header Banner */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  box-shadow: 0 8px 20px rgba(44, 182, 125, 0.28);
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
  margin: 0;
  letter-spacing: -0.3px;
}

.subtitle-modern {
  color: #6b8f81;
  font-size: 13.5px;
  margin-top: 3px;
  font-weight: 500;
}

/* 🌿 Main Schedule Card */
.schedule-card-wrapper {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #dff0e7;
  padding: 24px 28px;
  box-shadow: 0 6px 24px rgba(44, 182, 125, 0.06);
}

/* Segmented Tabs */
.tabs-segmented-wrapper {
  display: flex;
  background: #f4fbf7;
  border: 1px solid #e0f0e8;
  border-radius: 16px;
  padding: 6px;
  gap: 8px;
  margin-bottom: 24px;
  max-width: 540px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 18px;
  border: none;
  background: transparent;
  color: #6b8f81;
  font-size: 13.5px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab-btn i {
  font-size: 15px;
}

.tab-btn.active {
  background: #ffffff;
  color: #16935b;
  box-shadow: 0 4px 14px rgba(44, 182, 125, 0.15);
}

/* Alerts */
.alert-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-radius: 16px;
  margin-bottom: 20px;
  font-size: 13.5px;
  font-weight: 600;
}

.alert-banner.success {
  background: #eaf7f1;
  color: #16935b;
  border: 1px solid #cbe9dc;
}

.alert-banner.danger {
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-icon {
  font-size: 16px;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}

/* 🌟 Grid Layout */
.schedule-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 28px;
  align-items: start;
}

/* Form Column Left */
.form-fields-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #0f2e22;
  margin-bottom: 6px;
}

.field-label i {
  color: #2cb67d;
  font-size: 13px;
}

.required-star {
  color: #ef4444;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 13.5px;
  color: #0f2e22;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.form-control:focus {
  background: #ffffff;
  border-color: #2cb67d;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.16);
}

.textarea {
  resize: vertical;
  min-height: 90px;
}

.char-count {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
  margin-top: 3px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Access Radio Cards */
.access-radio-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.access-option-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.access-option-card input {
  display: none;
}

.access-option-card.selected {
  background: #f0fdf4;
  border-color: #2cb67d;
  box-shadow: 0 0 0 2px rgba(44, 182, 125, 0.2);
}

.option-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #eaf7f1;
  color: #16935b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.access-option-card.selected .option-icon {
  background: #2cb67d;
  color: #ffffff;
}

.option-info strong {
  display: block;
  font-size: 13px;
  color: #0f2e22;
}

.option-info small {
  display: block;
  font-size: 11px;
  color: #6b8f81;
  margin-top: 2px;
  line-height: 1.3;
}

/* Team Checkbox Cards (Offline) */
.team-checkbox-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.team-checkbox-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.team-checkbox-card input {
  display: none;
}

.team-checkbox-card.checked {
  background: #f0fdf4;
  border-color: #2cb67d;
}

.checkbox-indicator {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #ffffff;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.team-checkbox-card.checked .checkbox-indicator {
  background: #2cb67d;
  border-color: #2cb67d;
}

.team-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f2e22;
}

.team-desc {
  font-size: 11.5px;
  color: #6b8f81;
}

/* 🌟 Preview Card (Right Column) */
.preview-card-elevated {
  background: #f7fcf9;
  border: 1px solid #dff0e7;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 4px 18px rgba(44, 182, 125, 0.04);
}

.preview-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #16935b;
  background: #eaf7f1;
  padding: 4px 10px;
  border-radius: 999px;
}

.status-live-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2cb67d;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.3);
}

.preview-summary-block {
  background: #ffffff;
  border: 1px solid #eef6f2;
  border-radius: 16px;
  padding: 16px;
}

.preview-title-text {
  font-size: 15px;
  font-weight: 800;
  color: #0f2e22;
  margin: 0 0 12px;
  word-break: break-word;
}

.preview-meta-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-meta-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.preview-meta-item i {
  color: #2cb67d;
  font-size: 13px;
  margin-top: 2px;
}

.meta-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #7d9e92;
  text-transform: uppercase;
  display: block;
}

.meta-val {
  font-size: 12.5px;
  font-weight: 600;
  color: #0f2e22;
  margin: 1px 0 0;
}

/* Meeting Link Box */
.section-micro-label {
  font-size: 11px;
  font-weight: 800;
  color: #7d9e92;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 6px;
}

.meeting-link-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #dff0e7;
  border-radius: 12px;
  padding: 6px 6px 6px 12px;
  gap: 8px;
}

.link-url-text {
  flex: 1;
  font-size: 12px;
  color: #16935b;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.copy-link-btn:hover {
  box-shadow: 0 2px 8px rgba(44, 182, 125, 0.35);
}

/* Guests Manager Section */
.guest-add-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.guest-input-wrap {
  position: relative;
  flex: 1;
}

.guest-input-wrap i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #2cb67d;
  font-size: 12px;
}

.guest-input {
  width: 100%;
  padding: 8px 10px 8px 34px;
  background: #ffffff;
  border: 1px solid #dff0e7;
  border-radius: 10px;
  font-size: 12.5px;
  outline: none;
}

.add-guest-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #eaf7f1;
  color: #16935b;
  border: 1px solid #cbe9dc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.guest-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 140px;
  overflow-y: auto;
}

.guest-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e0f0e8;
  border-radius: 999px;
  padding: 3px 8px 3px 4px;
}

.guest-chip-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2cb67d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
}

.guest-chip-email {
  font-size: 11.5px;
  font-weight: 600;
  color: #0f2e22;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-chip-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 10px;
  padding: 0 2px;
}

.remove-chip-btn:hover {
  color: #ef4444;
}

/* Media Settings Toggles */
.media-settings-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #eef6f2;
}

.toggle-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: #0f2e22;
}

.toggle-text i {
  color: #2cb67d;
  font-size: 13px;
}

/* Switch Toggle Component */
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 20px;
}

.switch-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .3s;
}

.slider.round {
  border-radius: 20px;
}

.slider.round:before {
  border-radius: 50%;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
}

.switch-toggle input:checked + .slider {
  background-color: #2cb67d;
}

.switch-toggle input:checked + .slider:before {
  transform: translateX(18px);
}

/* Bottom Action Buttons */
.form-bottom-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eef6f2;
}

.btn-clear-form {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear-form:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-schedule-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 26px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(44, 182, 125, 0.3);
  transition: all 0.2s ease;
}

.btn-schedule-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(44, 182, 125, 0.4);
}

.btn-schedule-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 📱 Responsive Adjustments */
@media (max-width: 992px) {
  .schedule-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .main-content {
    padding: 12px;
  }

  .schedule-card-wrapper {
    padding: 18px 16px;
  }

  .form-row-2,
  .access-radio-grid {
    grid-template-columns: 1fr;
  }
}
</style>