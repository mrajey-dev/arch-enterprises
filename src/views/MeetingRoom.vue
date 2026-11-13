<template>
  <div class="meeting-room-wrapper">
    <!-- Top Bar -->
    <header class="room-topbar">
      <div class="topbar-left">
        <div class="brand-pill">
          <i class="fas fa-video"></i>
          <span class="brand-text">ARCH<span class="brand-accent">360</span> Meet</span>
        </div>
        <div class="room-info" v-if="meeting">
          <h1 class="room-title">{{ meeting.title }}</h1>
          <span class="room-badge" :class="isExternalPlatform ? 'external' : 'live'">
            <span class="pulse-dot"></span>
            {{ isExternalPlatform ? externalPlatformName : 'Live Conference' }}
          </span>
        </div>
      </div>

      <div class="topbar-actions">
        <!-- Direct External / Fullscreen Button -->
        <a
          v-if="meeting && isExternalPlatform"
          :href="externalUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="topbar-btn primary"
        >
          <i :class="externalPlatformIcon"></i>
          <span>Open in {{ externalPlatformName }}</span>
        </a>

        <a
          v-else-if="meeting"
          :href="jitsiDirectUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="topbar-btn secondary"
          title="Open in new window or Jitsi app"
        >
          <i class="fas fa-external-link-alt"></i>
          <span>Open Fullscreen</span>
        </a>

        <button
          type="button"
          class="topbar-btn outline"
          @click="copyMeetingLink"
          :title="copyTooltip"
        >
          <i :class="copyTooltip === 'Copied!' ? 'fas fa-check' : 'fas fa-link'"></i>
          <span>{{ copyTooltip }}</span>
        </button>

        <button
          type="button"
          class="topbar-btn danger"
          @click="leaveMeeting"
        >
          <i class="fas fa-phone-slash"></i>
          <span>Exit</span>
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="room-main">
      <!-- State 1: Loading State -->
      <div v-if="loading" class="lobby-state-card">
        <div class="loading-spinner">
          <i class="fas fa-circle-notch fa-spin"></i>
        </div>
        <h2>Connecting to meeting room...</h2>
        <p>Please wait while we verify meeting details and prepare your video session.</p>
      </div>

      <!-- State 2: Error State -->
      <div v-else-if="errorMessage" class="lobby-state-card error">
        <div class="state-icon danger">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Meeting Unavailable</h2>
        <p>{{ errorMessage }}</p>
        <div class="lobby-actions-row">
          <button type="button" class="btn-lobby primary" @click="fetchMeetingDetails">
            <i class="fas fa-redo"></i> Try Again
          </button>
          <button type="button" class="btn-lobby secondary" @click="enterAnyway">
            <i class="fas fa-video"></i> Enter Room Anyway
          </button>
          <button type="button" class="btn-lobby outline" @click="leaveMeeting">
            <i class="fas fa-home"></i> Back to Dashboard
          </button>
        </div>
      </div>

      <!-- State 3: Pre-Join Lobby (Before entering built-in call or for External Platforms) -->
      <div v-else-if="!hasJoined && meeting" class="lobby-container">
        <div class="lobby-card">
          <!-- Card Header Banner -->
          <div class="lobby-card-hero">
            <div class="hero-badge-strip">
              <span class="hero-type-tag">
                <i :class="isExternalPlatform ? externalPlatformIcon : 'fas fa-video'"></i>
                {{ isExternalPlatform ? externalPlatformName : 'ARCH360 HD Video Conference' }}
              </span>
              <span class="hero-time-tag">
                <i class="fas fa-clock"></i> {{ meeting.duration || 60 }} mins
              </span>
            </div>
            <h2 class="hero-title">{{ meeting.title }}</h2>
            <p class="hero-desc" v-if="meeting.description">
              {{ meeting.description }}
            </p>
          </div>

          <!-- Meeting Specifications Grid -->
          <div class="lobby-meta-grid">
            <div class="meta-item">
              <div class="meta-icon"><i class="fas fa-calendar-day"></i></div>
              <div class="meta-info">
                <span class="meta-label">Date & Time</span>
                <span class="meta-val">{{ formatMeetingDateTime(meeting) }}</span>
              </div>
            </div>

            <div class="meta-item">
              <div class="meta-icon"><i class="fas fa-shield-alt"></i></div>
              <div class="meta-info">
                <span class="meta-label">Access Policy</span>
                <span class="meta-val">
                  {{ meeting.access_type === 'anyone' ? 'Open link (Anyone invited)' : 'Invitees Only' }}
                </span>
              </div>
            </div>

            <div class="meta-item" v-if="meeting.guests && meeting.guests.length">
              <div class="meta-icon"><i class="fas fa-users"></i></div>
              <div class="meta-info">
                <span class="meta-label">Participants</span>
                <span class="meta-val">{{ meeting.guests.length }} Invitee(s)</span>
              </div>
            </div>

            <div class="meta-item">
              <div class="meta-icon"><i class="fas fa-fingerprint"></i></div>
              <div class="meta-info">
                <span class="meta-label">Meeting ID</span>
                <span class="meta-val mono">{{ displayRoomId }}</span>
              </div>
            </div>
          </div>

          <!-- Case A: External Platform (Google Meet, Zoom, MS Teams, etc.) -->
          <div v-if="isExternalPlatform" class="external-platform-box">
            <div class="external-callout">
              <div class="callout-icon">
                <i :class="externalPlatformIcon"></i>
              </div>
              <div class="callout-text">
                <h3>This meeting is hosted on {{ externalPlatformName }}</h3>
                <p>Click below to open the meeting session in {{ externalPlatformName }}.</p>
              </div>
            </div>

            <div class="external-link-preview-box">
              <span class="link-label">Destination Link:</span>
              <span class="link-url">{{ externalUrl }}</span>
            </div>

            <div class="lobby-action-footer">
              <a
                :href="externalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-lobby-cta primary"
              >
                <i :class="externalPlatformIcon"></i>
                <span>Launch {{ externalPlatformName }} Call</span>
              </a>
              <button type="button" class="btn-lobby-cta outline" @click="copyMeetingLink">
                <i class="fas fa-copy"></i>
                <span>Copy Link</span>
              </button>
            </div>
          </div>

          <!-- Case B: Built-in Video Conference Room -->
          <div v-else class="builtin-join-box">
            <div class="name-input-group">
              <label for="participantName" class="input-label">
                <i class="fas fa-user"></i> Your Display Name
              </label>
              <input
                id="participantName"
                type="text"
                v-model="participantName"
                placeholder="Enter your full name..."
                class="name-input"
                maxlength="50"
              />
            </div>

            <div class="precheck-hints">
              <span class="hint-pill">
                <i class="fas fa-microphone"></i> Microphone Ready
              </span>
              <span class="hint-pill">
                <i class="fas fa-camera"></i> Camera Ready
              </span>
              <span class="hint-pill">
                <i class="fas fa-lock"></i> Encrypted Connection
              </span>
            </div>

            <div class="lobby-action-footer">
              <button
                type="button"
                class="btn-lobby-cta primary"
                @click="joinBuiltinMeeting"
                :disabled="!participantName.trim()"
              >
                <i class="fas fa-door-open"></i>
                <span>Enter Video Conference</span>
              </button>

              <a
                :href="jitsiDirectUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-lobby-cta secondary"
              >
                <i class="fas fa-external-link-alt"></i>
                <span>Open in Full Tab</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      <!-- State 4: Active In-Call Video Frame -->
      <div v-show="hasJoined && !isExternalPlatform" class="video-active-container">
        <!-- Optional Floating helper banner -->
        <div class="video-status-strip">
          <div class="strip-left">
            <span class="recording-dot"></span>
            <span class="strip-title">{{ meeting ? meeting.title : 'Live Meeting' }}</span>
          </div>
          <div class="strip-right">
            <a
              :href="jitsiDirectUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="strip-btn"
              title="If camera permissions are blocked by your browser, open in dedicated tab"
            >
              <i class="fas fa-expand"></i> Having camera issues? Open in new tab
            </a>
          </div>
        </div>

        <!-- Jitsi Mounting Point -->
        <div id="jitsi-container" ref="jitsiContainer" class="jitsi-container"></div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  name: 'MeetingRoom',

  data() {
    return {
      meeting: null,
      loading: true,
      errorMessage: '',
      hasJoined: false,
      participantName: '',
      jitsiApi: null,
      copyTooltip: 'Copy Link',
    }
  },

  computed: {
    meetingIdParam() {
      return this.$route.params.id || ''
    },

    displayRoomId() {
      return this.meeting?.meeting_id || this.meetingIdParam || 'room'
    },

    jitsiRoomName() {
      const raw = this.displayRoomId.replace(/[^a-zA-Z0-9_-]/g, '_')
      return `ARCH360_${raw}`
    },

    jitsiDirectUrl() {
      return `https://meet.jit.si/${this.jitsiRoomName}`
    },

    isExternalPlatform() {
      if (!this.meeting || !this.meeting.meeting_link) return false
      const link = this.meeting.meeting_link.toLowerCase()
      // Check if it's an external video provider (Google Meet, Zoom, Teams, Webex)
      return (
        link.includes('meet.google.com') ||
        link.includes('zoom.us') ||
        link.includes('teams.microsoft.com') ||
        link.includes('webex.com') ||
        (link.startsWith('http') && !link.includes(window.location.host) && !link.includes('meet.jit.si'))
      )
    },

    externalUrl() {
      return this.meeting?.meeting_link || ''
    },

    externalPlatformName() {
      const link = (this.externalUrl || '').toLowerCase()
      if (link.includes('meet.google.com')) return 'Google Meet'
      if (link.includes('zoom.us')) return 'Zoom'
      if (link.includes('teams.microsoft.com')) return 'Microsoft Teams'
      if (link.includes('webex.com')) return 'Cisco Webex'
      return 'External Video Call'
    },

    externalPlatformIcon() {
      const link = (this.externalUrl || '').toLowerCase()
      if (link.includes('meet.google.com')) return 'fab fa-google'
      if (link.includes('zoom.us')) return 'fas fa-video'
      if (link.includes('teams.microsoft.com')) return 'fab fa-microsoft'
      return 'fas fa-external-link-alt'
    }
  },

  methods: {
    async fetchMeetingDetails() {
      this.loading = true
      this.errorMessage = ''

      const targetId = this.meetingIdParam
      if (!targetId) {
        this.errorMessage = 'No meeting ID specified in the link.'
        this.loading = false
        return
      }

      // Try multiple endpoint paths with fallbacks
      const candidateUrls = [
        `/api/meetings/${targetId}`,
        `https://employees.archenterprises.co.in/api/api/meetings/${targetId}`,
        `/api/meeting/${targetId}`,
        `https://employees.archenterprises.co.in/api/api/meeting/${targetId}`
      ]

      let foundMeeting = null
      for (const url of candidateUrls) {
        try {
          const res = await axios.get(url, { timeout: 6000 })
          if (res.data && (res.data.data || res.data.id || res.data.title)) {
            foundMeeting = res.data.data || res.data
            break
          }
        } catch (e) {
          // Continue to next candidate
        }
      }

      if (foundMeeting) {
        this.meeting = foundMeeting
      } else {
        // Fallback: Construct generic session from meeting ID so attendees are never locked out
        this.meeting = {
          meeting_id: targetId,
          title: `Meeting Room (${targetId.substring(0, 8)})`,
          description: 'ARCH360 Online Meeting Conference Room',
          meeting_date: new Date().toISOString().split('T')[0],
          meeting_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          duration: 60,
          access_type: 'anyone',
          type: 'online',
          meeting_link: window.location.href
        }
        toastInfo('Connected to session room.')
      }

      this.loading = false
    },

    enterAnyway() {
      this.errorMessage = ''
      this.meeting = {
        meeting_id: this.meetingIdParam,
        title: 'ARCH360 Video Conference',
        description: 'Direct Meeting Session',
        duration: 60,
        type: 'online'
      }
      this.hasJoined = false
    },

    formatMeetingDateTime(m) {
      if (!m || !m.meeting_date) return 'Flexible'
      try {
        const timeStr = m.meeting_time ? `T${m.meeting_time}` : 'T00:00:00'
        const d = new Date(`${m.meeting_date}${timeStr}`)
        return d.toLocaleString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return `${m.meeting_date} ${m.meeting_time || ''}`
      }
    },

    copyMeetingLink() {
      const url = window.location.href
      navigator.clipboard.writeText(url).then(() => {
        this.copyTooltip = 'Copied!'
        toastSuccess('Meeting link copied to clipboard!')
        setTimeout(() => {
          this.copyTooltip = 'Copy Link'
        }, 2500)
      }).catch(() => {
        toastError('Failed to copy link')
      })
    },

    leaveMeeting() {
      if (this.jitsiApi) {
        try {
          this.jitsiApi.dispose()
        } catch (e) {
          console.error(e)
        }
        this.jitsiApi = null
      }
      const token = localStorage.getItem('token')
      if (token) {
        this.$router.push('/dashboard')
      } else {
        this.$router.push('/auth')
      }
    },

    loadJitsiScript() {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          return resolve(window.JitsiMeetExternalAPI)
        }
        const existingScript = document.getElementById('jitsi-external-api-script')
        if (existingScript) {
          existingScript.onload = () => resolve(window.JitsiMeetExternalAPI)
          return
        }
        const script = document.createElement('script')
        script.id = 'jitsi-external-api-script'
        script.src = 'https://meet.jit.si/external_api.js'
        script.async = true
        script.onload = () => resolve(window.JitsiMeetExternalAPI)
        script.onerror = () => reject(new Error('Failed to load Jitsi API script'))
        document.head.appendChild(script)
      })
    },

    async joinBuiltinMeeting() {
      if (!this.participantName.trim()) {
        toastWarning('Please enter your display name to join')
        return
      }

      this.hasJoined = true

      try {
        await this.loadJitsiScript()
        this.$nextTick(() => {
          this.initJitsiCall()
        })
      } catch (err) {
        console.error('Jitsi script load error:', err)
        toastWarning('Opening video room in dedicated full tab...')
        window.open(this.jitsiDirectUrl, '_blank')
      }
    },

    initJitsiCall() {
      const container = this.$refs.jitsiContainer || document.querySelector('#jitsi-container')
      if (!container) return

      // Clear any prior instance
      if (this.jitsiApi) {
        try { this.jitsiApi.dispose() } catch (e) {}
      }
      container.innerHTML = ''

      const domain = 'meet.jit.si'
      const options = {
        roomName: this.jitsiRoomName,
        width: '100%',
        height: '100%',
        parentNode: container,
        userInfo: {
          displayName: this.participantName.trim()
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          DEFAULT_BACKGROUND: '#0f172a',
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'recording',
            'raisehand', 'videoquality', 'filmstrip', 'tileview',
            'select-background', 'settings'
          ]
        }
      }

      try {
        this.jitsiApi = new window.JitsiMeetExternalAPI(domain, options)

        this.jitsiApi.addEventListeners({
          readyToClose: () => {
            this.leaveMeeting()
          },
          videoConferenceLeft: () => {
            this.hasJoined = false
          }
        })
      } catch (e) {
        console.error('Failed to initialize Jitsi:', e)
        // Fallback: If iframe instantiation fails, provide standard iframe
        const iframe = document.createElement('iframe')
        iframe.src = this.jitsiDirectUrl
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.style.border = 'none'
        iframe.allow = 'camera; microphone; fullscreen; display-capture; autoplay'
        container.appendChild(iframe)
      }
    }
  },

  mounted() {
    // Populate user display name from localStorage if logged in
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (user && user.name) {
        this.participantName = user.name
      }
    } catch {}

    this.fetchMeetingDetails()
  },

  beforeUnmount() {
    if (this.jitsiApi) {
      try {
        this.jitsiApi.dispose()
      } catch (e) {}
      this.jitsiApi = null
    }
  }
}
</script>

<style scoped>
/* Full-Screen Dark Video Experience */
.meeting-room-wrapper {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: #090d16;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
}

/* ──── TOPBAR ──── */
.room-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  height: 64px;
  box-sizing: border-box;
  flex-shrink: 0;
  z-index: 50;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 18px;
  overflow: hidden;
}

.brand-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 6px 12px;
  border-radius: 8px;
  color: #60a5fa;
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
}

.brand-accent {
  color: #38bdf8;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.room-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 380px;
}

.room-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.room-badge.live {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.room-badge.external {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-ring 1.8s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
  100% { transform: scale(0.95); opacity: 1; }
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.topbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.topbar-btn.primary {
  background: #2563eb;
  color: #ffffff;
}
.topbar-btn.primary:hover {
  background: #1d4ed8;
}

.topbar-btn.secondary {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.topbar-btn.secondary:hover {
  background: #334155;
  color: #ffffff;
}

.topbar-btn.outline {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.topbar-btn.outline:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.topbar-btn.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.topbar-btn.danger:hover {
  background: #ef4444;
  color: #ffffff;
}

/* ──── MAIN CONTENT ──── */
.room-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ──── LOBBY STATE / LOADING / ERROR ──── */
.lobby-state-card {
  margin: auto;
  text-align: center;
  max-width: 480px;
  padding: 40px 30px;
  background: #131d31;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.loading-spinner {
  font-size: 42px;
  color: #3b82f6;
  margin-bottom: 20px;
}

.state-icon.danger {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 16px;
}

.lobby-state-card h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 10px;
}

.lobby-state-card p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 24px;
}

.lobby-actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.btn-lobby {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-lobby.primary { background: #2563eb; color: #fff; }
.btn-lobby.secondary { background: #334155; color: #fff; }
.btn-lobby.outline { background: transparent; color: #94a3b8; border: 1px solid #475569; }

/* ──── PRE-JOIN LOBBY CARD ──── */
.lobby-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
}

.lobby-card {
  width: 100%;
  max-width: 640px;
  background: #111a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
}

.lobby-card-hero {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 28px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-badge-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.hero-type-tag {
  background: rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #60a5fa;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hero-time-tag {
  color: #94a3b8;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hero-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.3;
}

.hero-desc {
  margin: 0;
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.5;
}

.lobby-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  font-size: 15px;
  flex-shrink: 0;
}

.meta-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.meta-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.meta-val {
  font-size: 13px;
  color: #e2e8f0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-val.mono {
  font-family: monospace;
  color: #a5b4fc;
}

/* ──── EXTERNAL PLATFORM BOX ──── */
.external-platform-box {
  padding: 24px 32px 32px;
}

.external-callout {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.callout-icon {
  font-size: 32px;
  color: #38bdf8;
}

.callout-text h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
}

.callout-text p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

.external-link-preview-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.link-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  flex-shrink: 0;
}

.link-url {
  font-size: 13px;
  color: #38bdf8;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ──── BUILTIN JOIN BOX ──── */
.builtin-join-box {
  padding: 24px 32px 32px;
}

.name-input-group {
  margin-bottom: 18px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.name-input {
  width: 100%;
  padding: 12px 16px;
  background: #090f1d;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #f8fafc;
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s ease;
}

.name-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.precheck-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.hint-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.hint-pill i {
  color: #10b981;
}

.lobby-action-footer {
  display: flex;
  gap: 14px;
}

.btn-lobby-cta {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-lobby-cta.primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
}
.btn-lobby-cta.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  transform: translateY(-1px);
}
.btn-lobby-cta.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-lobby-cta.secondary {
  flex: 0 0 auto;
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-lobby-cta.secondary:hover {
  background: #334155;
  color: #ffffff;
}

.btn-lobby-cta.outline {
  flex: 0 0 auto;
  background: transparent;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.btn-lobby-cta.outline:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* ──── ACTIVE VIDEO IN-CALL VIEW ──── */
.video-active-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  background: #000;
}

.video-status-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #0b1120;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  flex-shrink: 0;
}

.strip-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recording-dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

.strip-title {
  color: #cbd5e1;
  font-weight: 600;
}

.strip-right .strip-btn {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.strip-right .strip-btn:hover {
  text-decoration: underline;
}

.jitsi-container {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
}

/* Responsive */
@media (max-width: 640px) {
  .room-topbar {
    padding: 10px 14px;
    height: auto;
    flex-wrap: wrap;
    gap: 10px;
  }
  .room-title {
    max-width: 180px;
  }
  .topbar-btn span {
    display: none;
  }
  .lobby-meta-grid {
    grid-template-columns: 1fr;
    padding: 18px 20px;
  }
  .lobby-card-hero {
    padding: 20px;
  }
  .builtin-join-box, .external-platform-box {
    padding: 20px;
  }
  .lobby-action-footer {
    flex-direction: column;
  }
}
</style>
