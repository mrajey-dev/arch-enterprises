<template>
  <div class="layout">
    <!-- Header -->
   <header class="header">
     <a href="https://employees.archenterprises.co.in/">
  <img src="https://archenterprises.co.in/ajay/ajay.png" style="height: 65px;" alt="Logo">
</a>

      🅰️RCH360⚙️
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Hide announcement board if sidebar is visible on mobile -->
      <div v-if="!isMobile || !isSidebarVisible" class="announcement-board">
        <h2><i class="fa-solid fa-bullhorn"></i> Announcements</h2>

        <form @submit.prevent="addAnnouncement" class="announcement-form">
          <input
            type="text"
            v-model="newAnnouncement.title"
            placeholder="Announcement Title"
            required
          />
          <textarea
            v-model="newAnnouncement.message"
            placeholder="Write your message..."
            rows="4"
            required
          ></textarea>
         <button type="submit" :disabled="isLoading">
  <span v-if="!isLoading">
    <i class="fa-solid fa-paper-plane"></i>
    {{ editingId ? 'Update' : 'Post' }}
  </span>

  <span v-else>
    <i class="fa-solid fa-spinner fa-spin"></i>
    Please wait...
  </span>
</button>


        </form>

       <div class="announcement-list">
  <div
    class="announcement-card"
    v-for="(announcement, index) in displayedAnnouncements"
    :key="announcement.id"
  >
    <div class="card-header">
      <h3>{{ announcement.title }}</h3>
      <span class="date">{{ announcement.date }}</span>
    </div>

    <p class="card-message" v-text="announcement.message"></p>

    <div class="card-actions">
      <button class="edit-btn" @click="editAnnouncement(index)">
        <i class="fa-solid fa-pen"></i> Edit
      </button>
      <button class="delete-btn" @click="deleteAnnouncement(announcement.id)">
        <i class="fa-solid fa-trash"></i> Delete
      </button>
    </div>
  </div>
</div>
<div v-if="announcements.length > 1" class="more-btn-wrapper">
  <button class="more-btn" @click="showAll = !showAll">
    {{ showAll ? 'Show Less' : 'More Announcements' }}
  </button>
</div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'

export default {
  name: "AnnouncementBoard",
  components: {
    Sidebar
  },
  data() {
    return {
      showAll: false,
        isLoading: false,
       editingId: null, // New for tracking edits
      isMobile: false,
      isSidebarVisible: true,
      announcements: [],
      newAnnouncement: {
        title: "",
        message: ""
      }
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchAnnouncements()
  },
  computed: {
  displayedAnnouncements() {
    if (this.showAll) {
      return this.announcements;
    }
    // show only latest one
    return this.announcements.length
      ? [this.announcements[0]]
      : [];
  }
},

  methods: {
    editAnnouncement(index) {
    const announcement = this.announcements[index];
    this.newAnnouncement.title = announcement.title;
    this.newAnnouncement.message = announcement.message;

    // Store ID for update
    this.editingId = announcement.id;
  },

  async deleteAnnouncement(id) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await axios.delete(`https://employees.archenterprises.co.in/api/api/announcements/${id}`);
      this.fetchAnnouncements();
    } catch (error) {
      console.error('❌ Failed to delete announcement:', error);
      alert('Delete failed!');
    }
  },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },

    async fetchAnnouncements() {
  try {
    const res = await axios.get('https://employees.archenterprises.co.in/api/api/announcements');
    const records = res.data.data;

    this.announcements = records.map(item => ({
      id: item.id, // ✅ include ID
      title: item.title,
      message: item.message,
      date: new Date(item.created_at).toLocaleString()
    }));
  } catch (error) {
    console.error('❌ Failed to fetch announcements:', error);
  }
},

async addAnnouncement() {
  this.isLoading = true;   // 🔵 START loader

  try {
    const payload = {
      title: this.newAnnouncement.title,
      message: this.newAnnouncement.message
    };

    if (this.editingId) {
      await axios.put(
        `https://employees.archenterprises.co.in/api/api/announcements/${this.editingId}`,
        payload
      );
      this.editingId = null;
    } else {
      await axios.post(
        'https://employees.archenterprises.co.in/api/api/announcements',
        payload
      );
    }

    this.newAnnouncement.title = '';
    this.newAnnouncement.message = '';
    await this.fetchAnnouncements();

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    alert('Failed: ' + (error.response?.data?.message || 'Unknown'));
  } finally {
    this.isLoading = false; // 🔴 STOP loader (always runs)
  }
},



    logout() {
      const token = localStorage.getItem('token')
      axios
        .post(
          'https://employees.archenterprises.co.in/api/logout',
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        .finally(() => {
          localStorage.removeItem('token')
          this.$router.push('/auth')
        })
    }
  }
}
</script>





<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.more-btn-wrapper {
  text-align: center;
  margin-top: 15px;
}

.more-btn {
  background: #007bff;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
}

.more-btn:hover {
  background: #0056b3;
}

button[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

.card-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.card-actions .edit-btn,
.card-actions .delete-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.card-actions .edit-btn {
 background-color: #072dff;
    color: #ffffff;
}

.card-actions .edit-btn:hover {
  background-color: #001797;
}

.card-actions .delete-btn {
  background-color: #dc3545;
  color: white;
}

.card-actions .delete-btn:hover {
  background-color: #bb2d3b;
}

.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .sidebar {
    position: absolute;
    z-index: 1000;
    width: 240px;
    height: 100vh;
    background-color: #2c3e50;
  }

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
}

.announcement-board {
  flex: 1;
  width: 100%;
  margin: 0px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
}

.announcement-board h2 {
  text-align: center;
  font-size: 28px;
  color: #427172;
  margin-bottom: 25px;
}

.announcement-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.announcement-form input,
.announcement-form textarea {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  transition: all 0.3s ease;
  font-size: 15px;
}

.announcement-form input:focus,
.announcement-form textarea:focus {
  outline: none;
  border-color: #4caf50;
  background: #f4fff4;
}

.announcement-form button {
  align-self: flex-end;
  background-color: #5f9ea0;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  transition: 0.3s;
}

.announcement-form button:hover {
  background: #388e3c;
  box-shadow: 0 6px 14px rgba(0, 128, 0, 0.2);
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.announcement-card {
  background: #f9f9f9;
  border-left: 6px solid #007bff;
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
}

.announcement-card:hover {
  background: #f1fff1;
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header h3 {
  font-size: 18px;
  color: #427172;
  margin: 0;
}

.card-header .date {
  font-size: 13px;
  color: #888;
}

.card-message {
  font-size: 15px;
  color: #444;
  margin-top: 5px;
  line-height: 1.5;
   white-space: pre-line; /* ✅ Preserve line breaks */
}
.password-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-wrapper input {
  flex: 1;
}

.toggle-btn,
.generate-btn {
  padding: 6px 10px;
  background-color: #5f9ea0;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.toggle-btn i {
  pointer-events: none;
}

.toggle-btn:hover,
.generate-btn:hover {
  background-color: #426b6c;
}

.user-table td .btn-group {
  display: flex;
  gap: 0.5rem;
}
/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #427778;
}

.logo-img {
      height: 73px;
    margin-top: 4px;
}

.company-name {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
}
/* Header */
.header {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: cadetblue; 
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15); */
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
}

.menu-btn, .logout-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-btn {
  background-color: #28a745;
  color: white;
  margin-right: 15px;
}

.menu-btn:hover {
  background-color: #218838;
}

.logout-btn {
  background-color: white;
  color: #003977;
  border: 2px solid #007bff;
}

.logout-btn:hover {
  background-color: #e7f1ff;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  background-color: #ffffff;
  width: 220px;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  font-weight: 600;
  color: #495057;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 14px 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar li:hover {
  background-color: #5f9ea0;
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
  background-color: #f0f2f8;
  padding: 30px 40px;
  border-radius: 15px;
  /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: #417475;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 21px;
  border-bottom: 2px solid #5f9ea0;
  padding-bottom: 8px;
}

/* User Table */
.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
}

.user-table th,
.user-table td {
  padding: 14px 20px;
  text-align: left;
  font-size: 16px;
  color: #427778;
}

.user-table th {
  background-color: #f8f9fa;
  font-weight: 700;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.user-table tbody tr {
  background-color: #fefefe;
  box-shadow: 0 1px 5px rgba(0,0,0,0.07);
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.user-table tbody tr:hover {
  background-color: #e9f5ff;
  transform: translateX(5px);
}

.user-table tbody td {
  border: none;
  vertical-align: middle;
}

/* Footer */
.footer {
  background-color: #343a40;
  color: white;
  text-align: center;
  padding: 15px 0;
  font-size: 14px;
  font-weight: 500;
  margin-top: auto;
  letter-spacing: 0.6px;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 97vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 15px;
}

/* Modal Card */
.modal-card {
  background-color: white;
  width: 100%;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  max-height: 86vh;
  overflow-y: auto;
  animation: slideDown 0.4s ease forwards;
  position: relative;

  /* Hide scrollbar but allow scroll */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.modal-card::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}


@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Title */
.modal-title {
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 35px;
  color: #518587;
  letter-spacing: 1.3px;
}

/* Form Layout */
.attractive-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Form Rows */
.form-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.form-row .input-group {
  flex: 1 1 48%;
  display: flex;
  flex-direction: column;
}

/* Full width input group */
.input-group.full-width {
  flex: 1 1 100%;
}

/* Input Group */
.input-group label {
  font-weight: 700;
  margin-bottom: 10px;
  color: #427778;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 14px 18px;
  border: 2px solid #ced4da;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: #5f9ea0;
  outline: none;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  background-color: #f9fbff;
}

/* Textarea resize */
.input-group textarea {
  resize: vertical;
  min-height: 56px;
  font-family: inherit;
}

/* Modal Buttons */
.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.btn {
  flex: 1;
  padding: 14px 0;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.btn-primary {
  background-color: #5f9ea0;
  color: white;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.btn-primary:hover {
  background-color: #426b6c;
  box-shadow: 0 8px 18px rgba(0, 86, 179, 0.6);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover {
  background-color: #5a6268;
  box-shadow: 0 8px 18px rgba(90, 98, 104, 0.6);
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .form-row .input-group {
    flex: 1 1 100%;
  }

  .modal-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: row;
    gap: 10px;
  }
  .menu-btn, .logout-btn {
    width: 100%;
  }
}
.attractive-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.btn-primary.attractive-btn {
  background-color: #5f9ea0;
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: #426b6c;
  box-shadow: 0 4px 12px rgba(13,110,253,0.6);
}

.btn-danger.attractive-btn {
  background-color: #dc3545;
  border: none;
  color: white;
}

.btn-danger.attractive-btn:hover {
  background-color: #bb2d3b;
  box-shadow: 0 4px 12px rgba(220,53,69,0.6);
}

.attractive-btn i {
  font-size: 14px;
}

</style>
