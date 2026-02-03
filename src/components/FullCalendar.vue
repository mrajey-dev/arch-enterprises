<template>
  <FullCalendar :options="calendarOptions" />
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import axios from '@/axios'

export default {
  components: { FullCalendar },

  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: []
      }
    }
  },

  async mounted() {
    try {
      const res = await axios.get('/api/meetings')

      this.calendarOptions.events = res.data.data.map(m => ({
        id: m.meeting_id,
        title: m.title,
        start: `${m.date}T${m.start_time}`,
        end: `${m.date}T${m.end_time}`
      }))
    } catch (error) {
      console.error('Failed to load meetings', error)
    }
  },

  methods: {
    onEventClick(info) {
      this.$router.push(`/meeting/${info.event.id}`)
    }
  },

  created() {
    // Attach handler AFTER component is created
    this.calendarOptions.eventClick = this.onEventClick
  }
}
</script>
