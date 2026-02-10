<template>
  <div class="notification-bell-wrapper" @click="handleNotificationClick">

    <i class="fas fa-bell"></i>

    <!-- Badge -->
    <span v-if="unreadMentionsCount > 0" class="badge">
      {{ unreadMentionsCount }}
    </span>

    <!-- Latest message -->
    <div v-if="latestMessage" class="latest-message">
      {{ latestMessage }}
    </div>
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

export default {
  name: "NotificationBell",
  

  data() {
    return {
      
      unreadMentionsCount: 0,
      poller: null,
        latestMessage: '',
         // 🔔 sound-related
      audio: null,
      userInteracted: false,
      lastUnreadCount: 0
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
      } catch (err) {
        console.error("Failed to mark notifications as read", err)
      }

      this.$router.push("/employee/help")
    },

    enableSound() {
      this.userInteracted = true
    },

    playSound() {
      if (this.userInteracted && this.audio) {
        this.audio.currentTime = 0
        this.audio.play().catch(() => {})
      }
    },

    async fetchNotifications() {
      try {
        // 1️⃣ Fetch unread count
        const resCount = await axios.get("/api/mentions/unread-count")
        const newCount = resCount.data.count ?? 0

        // 🔥 Play sound ONLY if count increased
        if (newCount > this.lastUnreadCount) {
          this.playSound()
        }

        this.lastUnreadCount = newCount
        this.unreadMentionsCount = newCount

        // 2️⃣ Fetch latest notification
        const resNotif = await axios.get("/api/notifications")

        if (newCount > 0 && resNotif.data.length) {
          const data = JSON.parse(resNotif.data[0].data)

          const username = data.mentioned_user ?? 'Greetings!'
          const message = 'You are mentioned in comment'

          this.latestMessage = `${username}, ${message}.`
        } else {
          this.latestMessage = ''
        }

      } catch (err) {
        console.error("Notification fetch failed", err)
      }
    },

    async fetchUnreadMentions() {
      try {
        // 🚨 NO /api here
        const res = await axios.get("/api/mentions/unread-count")
        this.unreadMentionsCount = res.data.count ?? 0
      } catch (err) {
        console.error("Notification fetch failed", err)
      }
    },


  },

mounted() {
   // 🔊 prepare audio
    this.audio = new Audio('https://employees.archenterprises.co.in/sounds/notification.mp3')
       // unlock sound after first click anywhere
    window.addEventListener('click', this.enableSound, { once: true })
  // Initial fetch
  this.fetchNotifications()

  // Poll every 30s
this.poller = setInterval(() => {
  this.fetchNotifications()
}, 5000)

},

  beforeUnmount() {
    clearInterval(this.poller)
  }
}
</script>

<style scoped>
.notification-bell-wrapper {
  position: fixed;
  top: 42px;
  right: 20px;
  z-index: 9999;
  font-size: 22px;
  cursor: pointer;
}

.fa-bell {
  color: white;
}

.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: red;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 50%;
}
.notification-bell-wrapper {
  position: fixed;
  top: 42px;
  right: 20px;
  z-index: 9999;
  font-size: 22px;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: red;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 50%;
}

/* Latest message below the icon */
.latest-message {
  position: absolute;
  top: 30px; /* adjust as needed */
  right: 0;
  background: #ff0000;
  color: #fff;
  font-size: 14px;
  padding: 13px 17px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
</style>
