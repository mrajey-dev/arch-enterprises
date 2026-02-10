<template>
  <div class="join-meeting">
    <div v-if="loading">Loading meeting...</div>

    <div v-else-if="error" class="error">
      ❌ {{ error }}
    </div>

    <div v-else class="meeting-card">
      <h1>{{ meeting.title }}</h1>

      <p v-if="meeting.host_name">
        👤 Host: {{ meeting.host_name }}
      </p>

      <p>
        📅 {{ meeting.date }}
        | ⏰ {{ meeting.start_time }} - {{ meeting.end_time }}
      </p>

      <button
        class="join-btn"
        :disabled="!canJoin"
        @click="joinMeeting"
      >
        {{ joinButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";
export default {
  data() {
    return {
      meeting: null,
      loading: true,
      error: null
    }
  },

  async mounted() {
    try {
      const res = await axios.get(`/api/meetings/${this.$route.params.id}`)

      if (!res.data.data) {
        throw new Error('Meeting not found')
      }

      this.meeting = res.data.data
    } catch (err) {
      this.error = 'Invalid or expired meeting link'
    } finally {
      this.loading = false
    }
  },

  computed: {
    canJoin() {
      if (!this.meeting) return false

      const now = new Date()
      const start = new Date(`${this.meeting.date}T${this.meeting.start_time}`)
      const end = new Date(`${this.meeting.date}T${this.meeting.end_time}`)

      return now >= start && now <= end
    },

    joinButtonText() {
      if (!this.meeting) return 'Join Meeting'

      const now = new Date()
      const start = new Date(`${this.meeting.date}T${this.meeting.start_time}`)

      if (now < start) return 'Meeting not started yet'
      return '🚀 Join Meeting'
    }
  },

  methods: {
    joinMeeting() {
      // Placeholder for real video integration
      toastSuccess(`Joining meeting: ${this.meeting.title}`)
    }
  }
}
</script>
