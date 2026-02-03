<template>
  <div class="meeting-room">
    <!-- <h2>Meeting: {{ meeting?.title || 'Loading...' }}</h2>
    <p>
      Date: {{ meeting?.meeting_date }} |
      Time: {{ meeting?.meeting_time }}
    </p> -->

    <iframe
      v-if="meeting"
      :src="videoUrl"
      width="100%"
      height="600"
      allow="camera; microphone; fullscreen"
    ></iframe>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return { meeting: null }
  },
  computed: {
    videoUrl() {
      return `https://meet.jit.si/${this.$route.params.id}`
    }
  },
  async mounted() {
    try {
      const res = await axios.get(`/api/meetings/${this.$route.params.id}`)
      this.meeting = res.data.data
    } catch {
      alert('Meeting not found or expired')
      this.$router.push('/')
    }
  }
}
</script>
