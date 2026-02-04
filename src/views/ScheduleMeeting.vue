
<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
      <div class="head-title">
        <a href="https://employees.archenterprises.co.in/">
          <img
            src="https://archenterprises.co.in/ajay/ajay.png"
            style="height: 65px; border-radius: 9px;"
            alt="Logo"
          />
        </a>
        Arch 360
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="schedule-container">
          <div class="schedule-header">
              <h1>Schedule a meeting</h1>
              <p class="subtitle">Create and schedule a new meeting</p>
            </div>

            <!-- Tabs -->
          <div class="tabs">
  <button
    :class="['tab', { active: activeTab === 'offline' }]"
    @click="selectTab('offline')"
  >
    Offline
  </button>

  <button
    :class="['tab', { active: activeTab === 'online' }]"
    @click="selectTab('online')"
  >
    Online
  </button>
</div>

          <!-- Success Message -->
          <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
            <button type="button" class="btn-close" @click="successMessage = ''"></button>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
            <button type="button" class="btn-close" @click="errorMessage = ''"></button>
          </div>

          <div class="form-container">
            <!-- Left Column -->
            <div class="form-left">
              <!-- Offline Form -->
              <div v-if="activeTab === 'offline'">
                <div class="form-group">
                  <label for="offlineTitle" class="form-label"><i class="fas fa-heading"></i> Title</label>
                  <input id="offlineTitle" type="text" v-model="offlineForm.title" class="form-control" placeholder="Enter title" maxlength="100" />
                  <small class="char-count">{{ offlineForm.title.length }}/100</small>
                </div>

                <div class="form-group">
                  <label for="offlineDescription" class="form-label"><i class="fas fa-align-left"></i> Description</label>
                  <textarea id="offlineDescription" v-model="offlineForm.description" class="form-control textarea" rows="3" maxlength="500" placeholder="Describe the meeting"></textarea>
                </div>

                <!-- <div class="form-group">
                  <label for="importantPoints" class="form-label"><i class="fas fa-thumbtack"></i> Important Points</label>
                  <textarea id="importantPoints" v-model="offlineForm.importantPoints" class="form-control textarea" rows="3" maxlength="500" placeholder="Add important points or agenda"></textarea>
                </div> -->

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label for="offlineDate" class="form-label"><i class="fas fa-calendar"></i> Date</label>
                    <input id="offlineDate" type="date" v-model="offlineForm.date" class="form-control" :min="today" />
                  </div>
                  <div class="form-group flex-1">
                    <label for="offlineTime" class="form-label"><i class="fas fa-clock"></i> Time</label>
                    <input id="offlineTime" type="time" v-model="offlineForm.time" class="form-control" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label"><i class="fas fa-envelope"></i> Invitations</label>
                  <div class="radio-group">
                    <label class="radio-item">
                      <input type="checkbox" v-model="offlineForm.inviteAll" />
                      <span class="radio-label">Invite all employees (send email to everyone)</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Online Form (existing) -->
              <div v-if="activeTab === 'online'">
              <!-- Meeting Title -->
              <div class="form-group">
                <label for="meetingTitle" class="form-label">
                  <i class="fas fa-heading"></i> Meeting Title
                </label>
                <input
                  type="text"
                  id="meetingTitle"
                  v-model="formData.title"
                  class="form-control"
                  placeholder="Enter meeting title"
                  maxlength="100"
                />
                <small class="char-count">{{ formData.title.length }}/100</small>
              </div>

              <!-- Description -->
              <div class="form-group">
                <label for="description" class="form-label">
                  <i class="fas fa-align-left"></i> Description
                </label>
                <textarea
                  id="description"
                  v-model="formData.description"
                  class="form-control textarea"
                  placeholder="Add optional details about your meeting"
                  rows="4"
                  maxlength="500"
                ></textarea>
                <small class="char-count">{{ formData.description.length }}/500</small>
              </div>

              <!-- Date -->
              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="meetingDate" class="form-label">
                    <i class="fas fa-calendar"></i> Date
                  </label>
                  <input
                    type="date"
                    id="meetingDate"
                    v-model="formData.date"
                    class="form-control"
                    :min="today"
                  />
                </div>

                <!-- Time -->
                <div class="form-group flex-1">
                  <label for="meetingTime" class="form-label">
                    <i class="fas fa-clock"></i> Time
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
                <label for="duration" class="form-label">
                  <i class="fas fa-hourglass-end"></i> Duration
                </label>
                <div class="duration-selector">
                  <select v-model="formData.duration" class="form-control">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>
              </div>

              <!-- Meeting Privacy -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-lock"></i> Meeting Access
                </label>
                <div class="radio-group">
                  <label class="radio-item">
                    <input
                      type="radio"
                      v-model="formData.accessType"
                      value="anyone"
                    />
                    <span class="radio-label">Anyone with the link</span>
                  </label>
                  <label class="radio-item">
                    <input
                      type="radio"
                      v-model="formData.accessType"
                      value="invited"
                    />
                    <span class="radio-label">Only invited guests</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="form-right">
              <!-- Preview Card (only for online meetings) -->
              <div v-if="activeTab === 'online'" class="preview-card">
                <div class="preview-header">
                  <i class="fas fa-video"></i>
                  <span>Meeting Preview</span>
                </div>

                <!-- Meeting Details Preview -->
                <div class="preview-details">
                  <div class="preview-item">
                    <span class="preview-label">Title:</span>
                    <span class="preview-value">
                      {{ formData.title || "Untitled meeting" }}
                    </span>
                  </div>

                  <div class="preview-item">
                    <span class="preview-label">Date & Time:</span>
                    <span class="preview-value">
                      {{
                        formData.date && formData.time
                          ? formatDateTime()
                          : "Not set"
                      }}
                    </span>
                  </div>

                  <div class="preview-item">
                    <span class="preview-label">Duration:</span>
                    <span class="preview-value">{{ formData.duration }} mins</span>
                  </div>

                  <div class="preview-item">
                    <span class="preview-label">Access:</span>
                    <span class="preview-value capitalize">
                      {{ formData.accessType === 'anyone' ? 'Anyone with link' : 'Invited only' }}
                    </span>
                  </div>
                </div>

                <!-- Meeting Link -->
                <div class="meeting-link-section">
                  <div class="meeting-link-label">Meeting Link</div>
                  <div class="meeting-link-box">
                   <a :href="meetingLink" target="_blank" class="meeting-link-input">
  {{ meetingLink }}
</a>

                    <button
                      class="copy-btn"
                      @click="copyToClipboard"
                      :title="copyTooltip"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                </div>

                <!-- Guests Section -->
                <div class="guests-section">
                  <div class="guests-label">Add Guests</div>
                  <div class="guest-input-group">
                    <input
                      type="email"
                      v-model="guestEmail"
                      class="form-control"
                      placeholder="Add guest email"
                      @keyup.enter="addGuest"
                    />
                    <button class="btn-add-guest" @click="addGuest">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>

                  <!-- Guest List -->
                  <div v-if="formData.guests.length > 0" class="guest-list">
                    <div v-for="(guest, index) in formData.guests" :key="index" class="guest-item">
                      <div class="guest-info">
                        <div class="guest-avatar">
                          {{ guest.charAt(0).toUpperCase() }}
                        </div>
                        <div class="guest-details">
                          <div class="guest-email">{{ guest }}</div>
                          <div class="guest-status">Awaiting response</div>
                        </div>
                      </div>
                      <button
                        class="btn-remove-guest"
                        @click="removeGuest(index)"
                        title="Remove guest"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Meeting Settings -->
                <div class="settings-section">
                  <div class="settings-label">Meeting Settings</div>
                  <div class="toggle-item">
                    <div class="toggle-info">
                      <i class="fas fa-microphone"></i>
                      <span>Host video</span>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="formData.hostVideo" />
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="toggle-item">
                    <div class="toggle-info">
                      <i class="fas fa-headphones"></i>
                      <span>Guest video</span>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="formData.guestVideo" />
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="toggle-item">
                    <div class="toggle-info">
                      <i class="fas fa-hand-paper"></i>
                      <span>Require participants to turn on video</span>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="formData.requireVideo" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="btn btn-secondary" @click="resetForm">
              <i class="fas fa-redo"></i> Clear
            </button>
            <button
              class="btn btn-primary"
              @click="activeTab === 'online' ? scheduleMeeting() : scheduleOffline()"
              :disabled="!isFormValid || isSubmitting"
            >
              <span v-if="!isSubmitting">
                <i class="fas fa-calendar-check"></i>
                {{ activeTab === 'online' ? 'Schedule Meeting' : 'Schedule Offline Meeting' }}
              </span>
              <span v-else>
                <i class="fas fa-spinner fa-spin"></i>
                Scheduling...
              </span>
            </button>
          </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import axios from 'axios'

export default {
  components: { Sidebar },

 data() {
  return {
     meetingType: 'offline',
     activeTab: 'offline',
    meetingId: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
    isMobile: false,
    isSidebarVisible: true,
    isSubmitting: false,
    successMessage: '',
    errorMessage: '',
    copyTooltip: 'Copy link',
    guestEmail: '',
    today: new Date().toISOString().split('T')[0],
    // Online meeting form (existing)
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
    // Offline meeting form (new)
    offlineForm: {
      title: '',
      description: '',
      importantPoints: '',
      date: '',
      time: '',
      inviteAll: false
    }
  }
},


computed: {
  meetingLink() {
  const token = localStorage.getItem('token')
  return `${window.location.origin}/meeting/${this.meetingId}?token=${token}`
},

  isFormValid() {
    if (this.activeTab === 'online') {
      return (
        this.formData.title.trim() !== '' &&
        this.formData.date &&
        this.formData.time
      )
    }

    // offline
    return (
      this.offlineForm.title.trim() !== '' &&
      this.offlineForm.date &&
      this.offlineForm.time
    )
  }
},


  methods: {
     selectTab(type) {
    this.activeTab = type
    this.meetingType = type   // 👈 THIS is the key line
  },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    formatDateTime() {
      if (!this.formData.date || !this.formData.time) return ''
      const date = new Date(`${this.formData.date}T${this.formData.time}`)
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },

    generateMeetingId() {
      return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    },

    addGuest() {
      if (!this.guestEmail.trim()) {
        this.errorMessage = 'Please enter an email address'
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.guestEmail)) {
        this.errorMessage = 'Please enter a valid email address'
        return
      }

      if (this.formData.guests.includes(this.guestEmail)) {
        this.errorMessage = 'This guest is already added'
        return
      }

      this.formData.guests.push(this.guestEmail)
      this.guestEmail = ''
      this.errorMessage = ''
    },

    removeGuest(index) {
      this.formData.guests.splice(index, 1)
    },

    copyToClipboard() {
      navigator.clipboard.writeText(this.meetingLink).then(() => {
        this.copyTooltip = 'Copied!'
        setTimeout(() => {
          this.copyTooltip = 'Copy link'
        }, 2000)
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
      // reset offline form as well
      this.offlineForm = {
        title: '',
        description: '',
        importantPoints: '',
        date: '',
        time: '',
        inviteAll: false
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

      this.isSubmitting = true
      this.errorMessage = ''

      try {
        // If inviteAll is checked, fetch all user emails from backend
        let guests = []
        if (this.offlineForm.inviteAll) {
          try {
            const resp = await axios.get('/api/users')
            const users = resp.data || []
            guests = users.map(u => u.email).filter(Boolean)
          } catch (e) {
            // continue without guests if fetching fails
            console.warn('Failed to fetch users for invitations', e)
          }
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


        const response = await axios.post('/api/meetings/schedule', meetingData)

        this.successMessage = 'Offline meeting scheduled successfully!'

        // Reset form after short delay
        setTimeout(() => {
          this.resetForm()
        }, 1500)
      } catch (error) {
        console.error('Error scheduling offline meeting:', error)
        this.errorMessage = error.response?.data?.message || 'Failed to schedule meeting. Please try again.'
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
  meeting_date: this.formData.date,  // ✅ matches backend
  meeting_time: this.formData.time,  // ✅ matches backend
  duration: this.formData.duration,
  access_type: this.formData.accessType,
  guests: this.formData.guests,      // optional emails
  host_video: this.formData.hostVideo,
  guest_video: this.formData.guestVideo,
  require_video: this.formData.requireVideo
}



        // Send to backend API
        const response = await axios.post('/api/meetings/schedule', meetingData)

        this.successMessage = `Meeting scheduled successfully! Link: ${this.meetingLink}`
        
        // Reset form after 2 seconds
        setTimeout(() => {
          this.resetForm()
        }, 2000)
      } catch (error) {
        console.error('Error scheduling meeting:', error)
        this.errorMessage = error.response?.data?.message || 'Failed to schedule meeting. Please try again.'
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

    // Set today's date as minimum
    this.today = new Date().toISOString().split('T')[0]
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>


<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary: #1f7f6f;
  --primary-light: #a5d5cf;
  --danger: #dc3545;
  --success: #28a745;
  --warning: #ffc107;
  --text: #333;
  --border: #e0e0e0;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

/* Header */
.header {
  background-color: var(--primary);
  color: white;
  padding: 12px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.head-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-family: cursive;
  text-decoration: none;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}

.head-title a {
  display: flex;
  align-items: center;
}

.mobile-menu-icon {
  font-size: 22px;
  cursor: pointer;
  display: none;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Content */
.content {
  flex: 1;
  background: transparent;
  padding: 0;
  border-radius: 0;
  overflow-x: auto;
}

/* Schedule Container */
.schedule-container {
  max-width: 1400px;
  margin: 0 auto;
}

 .schedule-header {
  margin-bottom: 18px;
 }

.schedule-header h1 {
  font-size: 23px;
    font-weight: 800;
    text-transform: uppercase;
    margin: 0 0 8px;
    color: var(--text);

}

.tabs {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 22px;
  align-items: center;
}

.tab {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #555;
  transition: all 0.15s ease;
}

.tab:hover {
  background: #fff;
}

.tab.active {
  background: var(--primary);
  color: white;
  border-color: rgba(0,0,0,0.06);
  box-shadow: 0 4px 10px rgba(31,127,111,0.08);
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Alerts */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  font-size: 14px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.btn-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  margin-left: auto;
}

/* Form Container */
 .form-container {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  margin-bottom: 18px;
  min-height: auto;
  width: 100%;
  align-items: start;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text);
}

.form-label i {
  margin-right: 6px;
  color: var(--primary);
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  color: var(--text);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(31, 127, 111, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

/* Form Row */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.flex-1 {
  flex: 1;
}

/* Duration Selector */
.duration-selector {
  display: flex;
}

/* Radio Group */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.radio-item input[type="radio"] {
  cursor: pointer;
  margin-right: 8px;
  accent-color: var(--primary);
}

.radio-label {
  font-size: 14px;
  color: var(--text);
}

/* Preview Card */
 .preview-card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 96px;
  min-width: 260px;
  max-width: 360px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.preview-header i {
  color: var(--primary);
  font-size: 18px;
}

/* Preview Details */
.preview-details {
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
}

.preview-label {
  color: #666;
  font-weight: 500;
}

.preview-value {
  color: var(--text);
  font-weight: 600;
  text-align: right;
  max-width: 180px;
  word-break: break-word;
}

.capitalize {
  text-transform: capitalize;
}

/* Meeting Link */
.meeting-link-section {
  margin-bottom: 16px;
}

.meeting-link-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

 .meeting-link-box {
  display: flex;
  gap: 8px;
  align-items: center;
}

 .meeting-link-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #f9f9f9;
  color: var(--primary);
  font-weight: 500;
  cursor: pointer;
  display: inline-block;
}

.copy-btn {
  padding: 8px 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.copy-btn:hover {
  background-color: #1a6b5f;
}

/* Guests Section */
.guests-section {
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.guests-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

 .guest-input-group {
  display: flex;
  gap: 6px;
}

.guest-input-group .form-control {
  flex: 1;
  padding: 8px 10px;
  font-size: 12px;
}

.btn-add-guest {
  padding: 8px 10px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-add-guest:hover {
  background-color: #1a6b5f;
}

/* Guest List */
.guest-list {
  max-height: 250px;
  overflow-y: auto;
}

.guest-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.guest-item:last-child {
  border-bottom: none;
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.guest-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.guest-details {
  flex: 1;
  min-width: 0;
}

.guest-email {
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.guest-status {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.btn-remove-guest {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  transition: color 0.3s;
}

.btn-remove-guest:hover {
  color: var(--danger);
}

/* Settings Section */
.settings-section {
  margin-bottom: 0;
}

.settings-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.toggle-item:last-child {
  border-bottom: none;
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text);
}

.toggle-info i {
  color: var(--primary);
  font-size: 14px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(16px);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

 .btn {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary);
  box-shadow: 0 4px 12px rgba(31, 127, 111, 0.3);
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background-color: #efefef;
}

/* Form Left */
.form-left {
  flex: 1;
  display: block;
  width: 100%;
}

.form-right {
  width: 380px;
  display: block;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .form-container {
    grid-template-columns: 1fr;
  }

  .form-right {
    width: 100%;
  }

  .preview-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .main-content {
    flex-direction: column;
    padding: 15px;
  }

  .content {
    padding: 0;
    width: 100%;
  }

  .schedule-container {
    width: 100%;
  }

  .schedule-header h1 {
    font-size: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-container {
    gap: 18px;
    grid-template-columns: 1fr;
    display: grid;
    width: 100%;
  }

  .form-left {
    width: 100%;
  }

  .form-right {
    width: 100%;
    display: block;
  }

  .preview-card {
    margin-top: 0;
    position: relative;
    top: 0;
    box-shadow: none;
    padding: 14px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .expanded-content {
    margin-left: 0 !important;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .schedule-header h1 {
    font-size: 20px;
  }

  .form-container {
    gap: 15px;
  }

  .form-control {
    font-size: 16px;
  }

  .action-buttons {
    gap: 8px;
  }

  .btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}

.header {
  background: linear-gradient(135deg, var(--primary), #000000);
  color: white;
  padding: 12px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  transition: all 0.3s;
}

.header:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

.mobile-menu-icon {
  font-size: 24px;
  cursor: pointer;
  color: #fff;
  transition: transform 0.3s;
}

.mobile-menu-icon:hover {
  transform: rotate(90deg);
  color: #ffd700;
}
.tab {
  padding: 10px 18px;
  border-radius: 30px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  color: #555;
  transition: all 0.25s ease;
  background: #fff;
}

.tab:hover {
  background: #e6f7f3;
  transform: translateY(-2px);
}

.tab.active {
  background: var(--primary);
  color: white;
  border-color: rgba(0,0,0,0.06);
  box-shadow: 0 4px 15px rgba(31,127,111,0.15);
}
.form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
  color: var(--text);
  transition: all 0.3s;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.03);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 8px rgba(31,127,111,0.2);
}
.btn-primary {
  background: linear-gradient(120deg, var(--primary), #000000);
  color: white;
  border-radius: 8px;
  box-shadow: 0 6px 12px rgba(31,127,111,0.2);
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(120deg, var(--primary), #000000);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(31,127,111,0.3);
}

.btn-secondary {
  background: #fff;
  color: var(--primary);
  border: 1px solid var(--primary);
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: var(--primary-light);
  color: var(--primary);
  transform: translateY(-1px);
}
.preview-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.preview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.12);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  background: linear-gradient(90deg, var(--primary), #070707);
  padding: 8px 12px;
  border-radius: 12px;
  color: #fff;
}
.meeting-link-box {
  display: flex;
  gap: 8px;
  align-items: center;
  background: #f0fdfa;
  border: 1px solid var(--primary-light);
  border-radius: 8px;
  padding: 6px 8px;
}

.meeting-link-input {
  flex: 1;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
.guest-avatar {
  background: linear-gradient(135deg, var(--primary), #000000);
  color: #fff;
  font-weight: 600;
}

.btn-remove-guest:hover {
  color: #dc3545;
  transform: scale(1.2);
  transition: all 0.2s;
}
.slider {
  border-radius: 34px;
  background: #ccc;
}

input:checked + .slider {
  background: linear-gradient(135deg, var(--primary), #030404);
}

.slider:before {
  border-radius: 50%;
  background: white;
}
.layout {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6fdfc 0%, #e9f6f4 100%);
}


.form-container {
  gap: 24px;
}
.header {
  background: linear-gradient(135deg, var(--primary), #000000);
  padding: 14px 36px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}
.head-title {
  font-size: 22px;
  letter-spacing: 0.6px;
}
.schedule-container {
  background: white;
  padding: 28px;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.08);
}
.tabs {
  background: #f2fbfa;
  padding: 6px;
  border-radius: 40px;
}

.tab {
  border-radius: 30px;
  padding: 10px 22px;
  font-size: 14px;
}

.tab.active {
  background: linear-gradient(135deg, var(--primary), #000000);
  box-shadow: 0 6px 15px rgba(31,127,111,0.25);
}
.form-control {
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid #dfeeee;
  background: #fbfefe;
}

.form-control:focus {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(31,127,111,0.15);
}
.preview-card {
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f4fbfa);
  box-shadow: 0 18px 45px rgba(0,0,0,0.12);
}
.preview-header {
  background: linear-gradient(135deg, var(--primary), #000000);
  color: white;
  padding: 12px 16px;
  border-radius: 14px;
}
.meeting-link-box {
  background: linear-gradient(135deg, #e6faf6, #f0fdfa);
  border-radius: 12px;
  padding: 10px;
}

.copy-btn {
  border-radius: 10px;
}
.btn {
  border-radius: 12px;
  padding: 12px 22px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), #000000);
}

.btn-primary:hover {
  transform: translateY(-2px);
}
.form-group,
.preview-item {
  transition: transform 0.2s ease;
}

.form-group:hover {
  transform: translateY(-1px);
}

.form-control[type="date"],
.form-control[type="time"] {
  appearance: auto !important;
  -webkit-appearance: auto !important;
  background: white !important;
  cursor: pointer;
}

</style>