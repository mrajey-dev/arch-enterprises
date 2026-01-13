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

export default {
  name: "NotificationBell",

  data() {
    return {
      unreadMentionsCount: 0,
      poller: null,
        latestMessage: ''
    }
  },

  methods: {
    async handleNotificationClick() {
    try {
      // 1️⃣ Mark notifications as read in backend
      await axios.post("/api/mentions/mark-as-read")

      // 2️⃣ Reset UI immediately
      this.unreadMentionsCount = 0
      this.latestMessage = ''
    } catch (err) {
      console.error("Failed to mark notifications as read", err)
    }

    // 3️⃣ Redirect to help page
    this.$router.push("/employee/help")
  },
   async fetchNotifications() {
  try {
    // Fetch unread count
    const resCount = await axios.get("/api/mentions/unread-count")
    this.unreadMentionsCount = resCount.data.count ?? 0

    // Fetch latest notification
    const resNotif = await axios.get("/api/notifications")

    // ✅ IMPORTANT CHECK
   if (this.unreadMentionsCount > 0 && resNotif.data.length) {
  const data = JSON.parse(resNotif.data[0].data)

  const username = data.mentioned_user ?? 'Greetings!'
//   const message = data.message ?? 'You are mentioned in comment'
  const message = 'You are mentioned in comment'

  // ✅ final formatted message
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
  // Initial fetch
  this.fetchNotifications()

  // Poll every 30s
  this.poller = setInterval(() => {
    this.fetchNotifications()
    this.fetchUnreadMentions()
  }, 30000)
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
