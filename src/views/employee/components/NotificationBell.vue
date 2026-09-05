<template>
  <div class="notification-bell-wrapper" @click="handleNotificationClick" title="Chat Mentions & Alerts">
    <div class="bell-inner-btn">
      <i class="fas fa-bell bell-icon" :class="{ 'ring-anim': unreadMentionsCount > 0 }"></i>

      <!-- Nicely Styled Badge -->
      <transition name="badge-pop">
        <span v-if="unreadMentionsCount > 0" class="badge" :class="{ 'pill-badge': unreadMentionsCount > 9 }">
          {{ unreadMentionsCount > 99 ? '99+' : unreadMentionsCount }}
        </span>
      </transition>
      
      <!-- Subtle radar ping animation -->
      <span v-if="unreadMentionsCount > 0" class="badge-ping"></span>
    </div>

    <!-- Latest message popup toast preview -->
    <transition name="toast-fade">
      <div v-if="latestMessage" class="latest-message">
        <div class="message-dot"></div>
        <span>{{ latestMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios"
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";
import { 
  showDesktopNotification, 
  updateTabBadgeCount 
} from '@/utils/webNotification.js'

export default {
  name: "NotificationBell",
  data() {
    return {
      unreadMentionsCount: 0,
      poller: null,
      latestMessage: '',
      lastUnreadCount: 0,
      isFirstCheck: true
    }
  },

  methods: {
    async handleNotificationClick() {
      try {
        await axios.post("/api/mentions/mark-as-read")

        // Reset UI
        this.unreadMentionsCount = 0
        this.latestMessage = ''
        this.lastUnreadCount = 0
        updateTabBadgeCount(0)
      } catch (err) {
        console.error("Failed to mark notifications as read", err)
      }

      this.$router.push("/employee/help")
    },

    async fetchNotifications() {
      try {
        // 1️⃣ Fetch unread count
        const resCount = await axios.get("/api/mentions/unread-count")
        const newCount = resCount.data.count ?? 0

        // 2️⃣ Fetch latest notification
        const resNotif = await axios.get("/api/notifications")

        if (newCount > 0 && resNotif.data && resNotif.data.length) {
          let username = 'Team Member'
          let message = 'You were mentioned in chat'

          try {
            const data = typeof resNotif.data[0].data === 'string' 
              ? JSON.parse(resNotif.data[0].data) 
              : resNotif.data[0].data

            username = data.mentioned_user ?? 'Greetings'
            message = 'You are mentioned in comment'
          } catch (e) {
            // fallback
          }

          this.latestMessage = `${username}, ${message}.`

          // If count increased and not first check, trigger desktop notification outside app
          if (newCount > this.lastUnreadCount && !this.isFirstCheck) {
            showDesktopNotification({
              title: `New Mention from ${username}`,
              body: message,
              icon: '/Arch360.png',
              tag: 'mention_' + Date.now(),
              onClick: () => {
                this.handleNotificationClick()
              }
            })
          }
        } else {
          this.latestMessage = ''
        }

        this.lastUnreadCount = newCount
        this.unreadMentionsCount = newCount
        this.isFirstCheck = false

        if (newCount > 0) {
          updateTabBadgeCount(newCount)
        }
      } catch (err) {
        console.error("Notification fetch failed", err)
      }
    }
  },

  mounted() {
    // Initial fetch
    this.fetchNotifications()

    // Poll every 15s
    this.poller = setInterval(() => {
      this.fetchNotifications()
    }, 15000)
  },

  beforeUnmount() {
    if (this.poller) {
      clearInterval(this.poller)
    }
  }
}
</script>

<style scoped>
.notification-bell-wrapper {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 9999;
  cursor: pointer;
  user-select: none;
}

.bell-inner-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.bell-inner-btn:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.18);
}

.bell-icon {
  font-size: 1.25rem;
  color: #334155;
  transition: transform 0.2s ease, color 0.2s ease;
}

.bell-inner-btn:hover .bell-icon {
  color: #2563eb;
  transform: rotate(12deg) scale(1.08);
}

/* 🌟 Nicely Styled Badge */
.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.45);
  z-index: 3;
  letter-spacing: -0.2px;
  animation: popScale 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.badge.pill-badge {
  min-width: 24px;
  padding: 0 6px;
  border-radius: 12px;
}

.badge-ping {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background-color: #ef4444;
  opacity: 0.65;
  animation: pingRing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  z-index: 1;
  pointer-events: none;
}

@keyframes popScale {
  0% { transform: scale(0); opacity: 0; }
  80% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pingRing {
  0% { transform: scale(1); opacity: 0.7; }
  75%, 100% { transform: scale(2.2); opacity: 0; }
}

.badge-pop-enter-active,
.badge-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.badge-pop-enter-from,
.badge-pop-leave-to {
  transform: scale(0);
  opacity: 0;
}

/* 🔔 Bell Ring Animation */
@keyframes bellSwing {
  0% { transform: rotate(0); }
  15% { transform: rotate(14deg); }
  30% { transform: rotate(-12deg); }
  45% { transform: rotate(10deg); }
  60% { transform: rotate(-6deg); }
  75% { transform: rotate(3deg); }
  100% { transform: rotate(0); }
}

.ring-anim {
  animation: bellSwing 1.8s ease-in-out infinite;
  transform-origin: top center;
}

/* Latest message below the icon */
.latest-message {
  position: absolute;
  top: 52px;
  right: 0;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #f8fafc;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 10px;
  white-space: nowrap;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10000;
}

.message-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
