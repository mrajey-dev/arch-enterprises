

<template>
  <div class="layout">
    <!-- Header -->
          <header class="header">
      <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;  border-radius: 9px;"
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
  <!-- <h2>Arch Calendar</h2> -->
<!-- Calendar Filters -->
<div class="calendar-filters">
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

  
</div>
<div v-if="showDatePopup" class="modal-backdrop" @click.self="closeDatePopup">
  <div class="modal-card calendar-modal">

    <!-- Header -->
    <div class="modal-header">
      <h3 class="modal-title">{{ selectedDate }}</h3>
      <button class="icon-close" @click="closeDatePopup">✕</button>
    </div>

    <!-- Body -->
    <div class="modal-body">

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn holiday" @click="openForm('holiday')">
          🎉 Holiday
        </button>
  <button class="btn note" @click="openForm('note')">
          📝 Note
        </button>
        <button class="btn event" @click="openForm('event')">
          📅 Event
        </button>

      
      </div>

      <!-- Form -->
      <div v-if="formType" class="form-group fade-in">
        <input
          v-if="formType !== 'note'"
          v-model="form.title"
          placeholder="Enter title"
        />

        <textarea
          v-model="form.description"
          placeholder="Add description"
        ></textarea>

        <button class="btn-save" @click="saveCalendarData">
          Save Changes
        </button>
      </div>

    </div>

  </div>
</div>


  <!-- Calendar Header -->
  <div class="calendar-header">
    <button @click="prevMonth">‹</button>
    <h3>{{ currentMonthYear }}</h3>
    <button @click="nextMonth">›</button>
  </div>

  <!-- Calendar Grid -->
  <div class="calendar-grid">
    <div class="day-name" v-for="day in days" :key="day">{{ day }}</div>

 <div
  class="date-cell"
  v-for="date in calendarDates"
  :key="date.fullDate"
  :class="{ today: date.isToday }"
  @click="openDatePopup(date)"
  @dragover.prevent
  @drop="onDrop(date)"
>


      <span class="date-number">{{ date.day }}</span>

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

  <!-- Edit / Delete (only custom events) -->
  <div
    v-if="isCustomEvent(event)"
    class="event-actions"
  >
    ✏️
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
        <p class="value">{{ viewEvent.description }}</p>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-close" @click="showViewModal=false">Close</button>
    </div>

  </div>
</div>


  <!-- Interview Popup -->
<div v-if="showMeetingModal" class="modal-backdrop" @click.self="closeMeeting">
  <div class="modal-card small professional">

    <!-- Header -->
    <div class="modal-header">
      <h3 class="modal-title">{{ selectedMeeting.title }}</h3>

      <span class="status-badge"
            :class="selectedMeeting.type">
        {{ selectedMeeting.type === 'offline' ? 'Offline' : 'Online' }}
      </span>
    </div>

    <!-- Body -->
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
        <div class="info-item full-width">
  <span class="label">Meeting Topics</span>

  <QuillEditor
    v-model:content="meetingTopics"
    contentType="html"
    theme="snow"
    :toolbar="toolbarOptions"
    style="height: 220px"
  />

  <button class="btn-save-topics" @click="saveTopics">
    Save Topics
  </button>
</div>
         <div class="info-item" v-if="selectedMeeting.guests?.length">
  <span class="label">Guests</span>

  <ul class="guest-list">
    <li
      v-for="(g, i) in displayedGuests"
      :key="i"
    >
      {{ g }}
    </li>
  </ul>

  <!-- Show button only if more than 2 guests -->
  <button
    v-if="selectedMeeting.guests.length > 2"
    class="show-btn"
    @click="showAllGuests = !showAllGuests"
  >
    {{ showAllGuests ? "Show Less" : "Show All" }}
  </button>
</div>






      

        <div class="info-item" v-if="selectedMeeting.meeting_link">
  <span class="label">Meeting Link</span>

  <a
    :href="selectedMeeting.meeting_link"
    target="_blank"
    class="join-btn"
  >
    <i class="fas fa-video"></i>
    Join Meeting
  </a>
</div>


      </div>
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <button class="btn-close" @click="closeMeeting">Close</button>
    </div>

  </div>
</div>


<div v-if="showServiceModal" class="modal-backdrop" @click.self="showServiceModal=false">
  <div class="modal-card medium professional">

    <!-- Header -->
    <div class="modal-header">
      <h3 class="modal-title">{{ selectedService.company_name }}</h3>
      <span class="status-badge" :class="selectedService.status?.toLowerCase()">
        {{ selectedService.status }}
      </span>
    </div>

    <!-- Body -->
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
            {{ selectedService.isVisit
              ? selectedService.service_type
              : selectedService.type_of_service
            }}
          </span>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <button class="btn-close" @click="showServiceModal=false">
        Close
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
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import DOMPurify from 'dompurify'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  components: { Sidebar,  QuillEditor },

data() {
  return {
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

    customCalendarEvents: [], // 👈 NEW (holidays / notes / events)

    birthdayEvents: [],
    showFilters: {
  meetings: true,
  services: true,
  visits: true,
  birthdays: true,
  holidays: true,
  events: true,
  notes: true
},
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
     displayedGuests() {
    if (!this.selectedMeeting?.guests) return [];

    return this.showAllGuests
      ? this.selectedMeeting.guests
      : this.selectedMeeting.guests.slice(0, 2);
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
    calendarDates() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()

      const firstDay = new Date(year, month, 1).getDay()
      const totalDays = new Date(year, month + 1, 0).getDate()

      const dates = []

      for (let i = 0; i < firstDay; i++) {
        dates.push({ day: '', events: [] })
      }

      for (let day = 1; day <= totalDays; day++) {
        const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        dates.push({
          day,
          fullDate,
          isToday: fullDate === new Date().toISOString().split('T')[0],
   events: [
  ...(this.showFilters.meetings
    ? this.events.filter(e => e.date === fullDate)
    : []),

  ...(this.showFilters.services
    ? this.serviceEvents.filter(s => s.date === fullDate)
    : []),

  ...(this.showFilters.visits
    ? this.visitEvents.filter(v => v.date === fullDate)
    : []),

  ...(this.customCalendarEvents.filter(c =>
  c.date === fullDate &&
  (
    (c.type === 'holiday' && this.showFilters.holidays) ||
    (c.type === 'event' && this.showFilters.events) ||
    (c.type === 'note' && this.showFilters.notes)
  )
)),


  ...(this.showFilters.birthdays
    ? this.birthdayEvents.filter(b =>
        b.month === month + 1 && b.day === day
      )
    : [])
]




        })
      }

      return dates
    }
  },

  methods: {
    
    isCustomEvent(event) {
  return ['holiday', 'event', 'note'].includes(event.type)
},

isDraggable(event) {
  return this.isCustomEvent(event)
},
onDragStart(event) {
  if (!this.isCustomEvent(event)) return
  this.draggedEvent = event
},

async onDrop(date) {
  if (!this.draggedEvent || !date.fullDate) return

  // same date → ignore
  if (this.draggedEvent.date === date.fullDate) return

  try {
    await fetch(
      `https://employees.archenterprises.co.in/api/api/arch-calendar/${this.draggedEvent.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          calendar_date: date.fullDate
        })
      }
    )

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
    await fetch(
      `https://employees.archenterprises.co.in/api/api/arch-calendar/${event.id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    this.fetchCustomCalendarData()
  } catch (e) {
    console.error('Delete failed', e)
  }
},

async fetchCustomCalendarData() {
  const res = await fetch(
    'https://employees.archenterprises.co.in/api/api/arch-calendar',
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )

  const data = await res.json()

  this.customCalendarEvents = data.map(d => ({
  id: d.id,
  date: d.calendar_date,
  title:
    d.type === 'holiday' ? `Public Holiday: ${d.title}` :
    d.type === 'event' ? `Event: ${d.title}` :
    d.type === 'note' ? `Note` : '',
  description: d.description,
  type: d.type
}))

},





async fetchBirthdays() {
  try {
    const res = await fetch(
      'https://employees.archenterprises.co.in/api/api/birthdays/calendar',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    const data = await res.json()

    this.birthdayEvents = data.map(b => {
      const dob = new Date(b.date)

      return {
        id: b.id,
        month: dob.getMonth() + 1, // 1–12
        day: dob.getDate(),        // 1–31
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
    const res = await fetch(
      'https://employees.archenterprises.co.in/api/api/visit-assign/calendar',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

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
}
,
async openVisit(id) {
  try {
    const res = await fetch(
      `https://employees.archenterprises.co.in/api/api/visit-assign/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    const result = await res.json()

    this.selectedService = {
      ...result.data,
      isVisit: true   // 👈 flag
    }

    this.showServiceModal = true
  } catch (e) {
    console.error(e)
  }
},

handleEventClick(event) {
  switch (event.type) {
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
}
,

   async openService(id) {
    const res = await fetch(
      `https://employees.archenterprises.co.in/api/api/service-assign/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    const result = await res.json()
    this.selectedService = result.data
    this.showServiceModal = true
  },
    async fetchServiceAssignments() {
  try {
    const res = await fetch(
      'https://employees.archenterprises.co.in/api/api/service-assign/calendar',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

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
    const res = await fetch(
      `https://employees.archenterprises.co.in/api/api/meetings/${event.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    const result = await res.json()

    this.selectedMeeting = result.data

  console.log("FULL API RESPONSE:", result)
console.log("RESULT.DATA:", result.data)
console.log("ID FIELD:", result.data?.id)
console.log("MEETING_ID FIELD:", result.data?.meeting_id)

    this.meetingTopics = this.selectedMeeting.topics || ''
    this.showMeetingModal = true

  } catch (err) {
    console.error('Failed to fetch meeting', err)
  }
},
async saveTopics() {

  console.log("Saving Meeting:", this.selectedMeeting)

  const meetingId = this.selectedMeeting.id

  if (!meetingId) {
    toastError("Meeting ID not found")
    return
  }

  try {
    await fetch(
      `https://employees.archenterprises.co.in/api/api/meetings/${meetingId}/topics`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          topics: this.meetingTopics
        })
      }
    )

    this.selectedMeeting.topics = this.meetingTopics
    toastSuccess('Topics saved successfully')

  } catch (e) {
    console.error('Failed to save topics', e)
  }
},

closeMeeting() {
  this.showMeetingModal = false
  this.selectedMeeting = {}
}
,
    async fetchMeetings() {
    try {
      const res = await fetch('https://employees.archenterprises.co.in/api/api/meetings/interviews', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
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
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      )
    },

    nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      )
    }
  },

mounted() {
  this.checkIfMobile()
  window.addEventListener('resize', this.checkIfMobile)

  const token = localStorage.getItem('token')
  if (!token) this.$router.push('/auth')

  this.fetchServiceAssignments()
  this.fetchVisitAssignments()
  this.fetchMeetings()
  this.fetchBirthdays()
  this.fetchCustomCalendarData() // ✅ IMPORTANT
},


  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>



<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

/* Header */
.header {
  background-color: var(--primary);
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.head-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: white;
  font-family: cursive;
  text-decoration: none;
      font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;

}

.mobile-menu-icon {
  font-size: 22px;
  cursor: pointer;
  display: none;
}

/* Main */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  width: 220px;
  background: #fff;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

/* Content */
.content {
  flex: 1;
  background-color:#a5d5cf33;
  padding: 30px 40px;
  border-radius: 15px;
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  font-weight: 800;
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}

/* Mobile */
@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .main-content {
    flex-direction: column;
    padding: 20px 15px;
  }

  .sidebar {
    width: 100%;
    border-radius: 10px;
  }

  .expanded-content {
    margin-left: 0 !important;
  }
}


/* Calendar */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 18px;
  border-radius: 6px;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-name {
  text-align: center;
  font-weight: 700;
  color: var(--primary);
}

.date-cell {
  background: #fff;
  border-radius: 10px;
  padding: 8px;
   cursor: pointer;
  min-height: 90px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  position: relative;
}

.date-cell.today {
  border: 2px solid var(--primary);
}

.date-number {
  font-size: 13px;
  font-weight: bold;
}

.event {
  margin-top: 4px;
  padding: 3px 6px;
  font-size: 11px;
  border-radius: 6px;
      background-color: #59c8d8;
}

/* Event Types */
.event.service { background: #17a2b8; }
.event.interview { background: #6f42c1; }
.event.resource { background: #fd7e14; }
.event.holiday { background: #dc3545!important; }
.event.online {
  background: #4caf50;
  cursor: help;
  color: white;
}

.event.offline {
   cursor: help;
  background: #ff9800;
  color: white;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-card.small {
  background: #fff;
  width: 80%;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.modal-title {
  margin-bottom: 10px;
  font-size: 18px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 15px;
}

.badge.online {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge.offline {
  background: #fff3e0;
  color: #ef6c00;
}

.modal-row {
  margin-bottom: 10px;
  font-size: 14px;
}

.modal-row ul {
  padding-left: 18px;
}

.btn-close {
  margin-top: 15px;
  background: var(--text);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
.event.service {
   cursor: help;
  background: #1f7f6f;
  color: #fff;
}

.modal-card.medium {
  background: #fff;
  width: 520px;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.calendar-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 14px;
}

.calendar-filters label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
}

.calendar-filters input {
  accent-color: var(--text);
}
.modal-card.professional {
  padding: 0;
  overflow: hidden;
  border-radius: 14px;
}

/* Header */
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
}

/* Status badge */
.status-badge {
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 20px;
  font-weight: 600;
  background: rgba(255,255,255,0.2);
  text-transform: capitalize;
}

/* Body */
.modal-body {
  padding: 22px;
    max-height: 70vh;
  overflow-y: auto;
}

/* Info grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

/* Footer */
.modal-footer {
  padding: 16px 22px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

/* Button */
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

/* Mobile */
@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
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

.join-btn i {
  font-size: 14px;
}

.join-btn:hover {
  background: linear-gradient(135deg, var(--primary), var(--text));
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(31, 127, 111, 0.35);
}

.event.birthday {
  cursor: not-allowed;
  background: linear-gradient(135deg, #fd20dc, #83067a);
  color: #ffffff;
  font-weight: 600;
}

.date-cell.today .event.birthday {
  box-shadow: 0 0 0 2px #ff6b6b;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(4px);
}

.calendar-modal {
  width: 420px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.25s ease;
  overflow: hidden;
  font-family: "Inter", system-ui, sans-serif;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Header */
.modal-header {
  background: linear-gradient(135deg, #1f7f6f, #2fa28f);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
}

.icon-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.8;
}
.icon-close:hover {
  opacity: 1;
}

/* Body */
.modal-body {
  padding: 20px;
}

/* Action Buttons */
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

.btn.holiday {
  background: #ffe8cc;
  color: #b45309;
}
.btn.event {
  background: #e0f2fe;
  color: #0369a1;
}
.btn.note {
  background: #f3e8ff;
  color: #7e22ce;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* Form */
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 13px;
  resize: none;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1f7f6f;
}

/* Save Button */
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

/* Animations */
.fade-in {
  animation: fadeUp 0.3s ease;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Custom Calendar Event Colors ===== */

.event.holiday {
   cursor: help;
  background: linear-gradient(135deg, #ff6b6b, #ff8787);
  color: #fff;
  font-weight: 600;
}


.event.note {
   cursor: help;
  background: linear-gradient(135deg, #c084fc, #e9d5ff);
  color: #3b0764;
  font-weight: 600;
}

.event.visit {
   cursor: help;
  background: linear-gradient(135deg, #20c997, #63e6be);
  color: #053b2e;
  font-weight: 600;
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
.topics-textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-top: 6px;
  font-size: 13px;
}

.btn-save-topics {
  margin-top: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: var(--text);
  color: white;
  cursor: pointer;
}

.btn-save-topics:hover {
  background: var(--primary);
}
.topics-display {
  white-space: pre-line;
}
.topics-display {
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
  line-height: 1.6;
}

.topics-display ul,
.topics-display ol {
  padding-left: 20px;
}
/* Topics Display Box */
.topics-display {
  max-height: 220px;
  overflow-y: auto;
  padding: 14px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

/* Scrollbar Styling */
.topics-display::-webkit-scrollbar {
  width: 6px;
}

.topics-display::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* Proper spacing for rich text */
.topics-display p {
  margin: 6px 0;
}

.topics-display ul,
.topics-display ol {
  padding-left: 18px;
  margin: 6px 0;
}

.topics-display h1,
.topics-display h2,
.topics-display h3 {
  margin: 8px 0;
  font-weight: 600;
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

.show-btn:hover {
  text-decoration: underline;
}

/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* Card */
.modal-card.professional {

  max-width: 95%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: fadeInScale 0.25s ease;
}

/* Header */
.modal-header {
  padding: 18px 22px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

/* Status Badge */
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.online {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.offline {
  background: #fee2e2;
  color: #dc2626;
}

/* Body */
.modal-body {
  padding: 20px;
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
}

.info-item.full-width {
  margin-top: 10px;
}

/* Labels */
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
}

/* Quill Editor */
.ql-container {
  border-radius: 10px;
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
  transition: 0.2s ease;
}

.btn-save-topics:hover {
  background: #4338ca;
}

/* Guests */
.guest-list {
  padding-left: 18px;
  margin: 0;
}

.guest-list li {
  font-size: 14px;
  margin-bottom: 4px;
  color: #374151;
}

.show-btn {
  margin-top: 6px;
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 13px;
  cursor: pointer;
}

/* Join Button */
.join-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #10b981;
  color: white;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: 0.2s ease;
}

.join-btn:hover {
  background: #059669;
}

/* Footer */
.modal-footer {
  padding: 15px 20px;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #e5e7eb;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-close:hover {
  background: #d1d5db;
}

/* Animation */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

</style>