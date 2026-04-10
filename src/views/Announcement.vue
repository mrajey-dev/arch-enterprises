<template>
  <div class="layout">

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-bullhorn"></i>
            </div>
            <div>
              <h1>Announcement Board</h1>
              <p class="subtitle-modern">Share important updates with your team</p>
            </div>
          </div>
        </div>

        <!-- Create Announcement Card -->
        <div class="create-card">
          <div class="section-title-modern">
            <i class="fas fa-pen-alt"></i>
            <span>{{ editingId ? 'Edit Announcement' : 'Create New Announcement' }}</span>
          </div>
          
          <form @submit.prevent="addAnnouncement" class="announcement-form-premium">
            <div class="form-field">
              <div class="field-wrapper">
                <i class="fas fa-heading field-icon"></i>
                <input
                  type="text"
                  v-model="newAnnouncement.title"
                  placeholder="Announcement title"
                  required
                />
              </div>
            </div>

            <div class="form-field">
              <div class="field-wrapper">
                <i class="fas fa-align-left field-icon" style="top: 18px;"></i>
                <textarea
                  v-model="newAnnouncement.message"
                  placeholder="Write your announcement message..."
                  rows="4"
                  required
                ></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-submit-premium" :disabled="isLoading">
                <span v-if="!isLoading">
                  <i :class="editingId ? 'fas fa-save' : 'fas fa-paper-plane'"></i>
                  {{ editingId ? 'Update Announcement' : 'Post Announcement' }}
                </span>
                <span v-else>
                  <i class="fas fa-spinner fa-spin"></i>
                  Please wait...
                </span>
              </button>
              <button v-if="editingId" type="button" class="btn-cancel-premium" @click="cancelEdit">
                <i class="fas fa-times"></i> Cancel Edit
              </button>
            </div>
          </form>
        </div>

        <!-- Announcements List -->
        <div class="announcements-section">
          <div class="section-title-modern">
            <i class="fas fa-list-alt"></i>
            <span>Recent Announcements</span>
            <span class="badge-count">{{ announcements.length }}</span>
          </div>

          <div class="announcements-grid">
            <div
              v-for="announcement in displayedAnnouncements"
              :key="announcement.id"
              class="announcement-card-premium"
            >
              <div class="card-accent"></div>
              <div class="card-header-premium">
                <div class="header-info">
                  <div class="announcement-icon">
                    <i class="fas fa-bullhorn"></i>
                  </div>
                  <div>
                    <h3>{{ announcement.title }}</h3>
                    <div class="meta-info">
                      <i class="fas fa-calendar-alt"></i>
                      <span>{{ announcement.date }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions-premium">
                  <button class="action-icon edit" @click="editAnnouncement(announcement.id)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-icon delete" @click="deleteAnnouncement(announcement.id)" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="card-body-premium">
                <p>{{ announcement.message }}</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="announcements.length === 0" class="empty-state-premium">
              <i class="fas fa-bullhorn"></i>
              <h4>No Announcements Yet</h4>
              <p>Create your first announcement to share with your team</p>
            </div>
          </div>

          <!-- Show More Button -->
          <div v-if="announcements.length > 1" class="more-btn-wrapper">
            <button class="more-btn-premium" @click="showAll = !showAll">
              <i :class="showAll ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              {{ showAll ? 'Show Less' : `Show All (${announcements.length})` }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "AnnouncementBoard",
  components: {
    Sidebar
  },
  data() {
    return {
      showAll: false,
      isLoading: false,
      editingId: null,
      isMobile: false,
      isSidebarVisible: true,
      announcements: [],
      newAnnouncement: {
        title: "",
        message: ""
      }
    }
  },
  computed: {
    displayedAnnouncements() {
      if (this.showAll) {
        return this.announcements;
      }
      return this.announcements.length ? [this.announcements[0]] : [];
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchAnnouncements();
    
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    cancelEdit() {
      this.editingId = null;
      this.newAnnouncement = { title: "", message: "" };
      toastInfo('Edit cancelled');
    },

    editAnnouncement(id) {
      const announcement = this.announcements.find(a => a.id === id);
      if (announcement) {
        this.newAnnouncement.title = announcement.title;
        this.newAnnouncement.message = announcement.message;
        this.editingId = announcement.id;
        // Scroll to form
        document.querySelector('.create-card')?.scrollIntoView({ behavior: 'smooth' });
      }
    },

    async deleteAnnouncement(id) {
      if (!confirm("Are you sure you want to delete this announcement?")) return;

      try {
        await axios.delete(`https://employees.archenterprises.co.in/api/api/announcements/${id}`);
        toastSuccess('Announcement deleted successfully!');
        this.fetchAnnouncements();
      } catch (error) {
        console.error('Failed to delete announcement:', error);
        toastError('Delete failed!');
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
          id: item.id,
          title: item.title,
          message: item.message,
          date: new Date(item.created_at).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        toastError('Failed to load announcements');
      }
    },

    async addAnnouncement() {
      if (!this.newAnnouncement.title.trim()) {
        toastWarning('Please enter an announcement title');
        return;
      }
      if (!this.newAnnouncement.message.trim()) {
        toastWarning('Please enter an announcement message');
        return;
      }

      this.isLoading = true;
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
          toastSuccess('Announcement updated successfully!');
          this.editingId = null;
        } else {
          await axios.post(
            'https://employees.archenterprises.co.in/api/api/announcements',
            payload
          );
          toastSuccess('Announcement posted successfully!');
        }

        this.newAnnouncement = { title: "", message: "" };
        await this.fetchAnnouncements();
      } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        toastError(error.response?.data?.message || 'Failed to save announcement');
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      const token = localStorage.getItem('token');
      axios
        .post('https://employees.archenterprises.co.in/api/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .finally(() => {
          localStorage.removeItem('token');
          this.$router.push('/auth');
        });
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
   ;
  min-height: 100vh;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Content Header */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.subtitle-modern {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

.badge-count {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  margin-left: 8px;
}

/* Create Card */
.create-card {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.announcement-form-premium {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-wrapper {
  position: relative;
}

.field-wrapper .field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.field-wrapper textarea + .field-icon {
  top: 18px;
  transform: none;
}

.field-wrapper input,
.field-wrapper textarea {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.field-wrapper textarea {
  padding-top: 12px;
  resize: vertical;
}

.field-wrapper input:focus,
.field-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-submit-premium {
  padding: 12px 28px;
  background: var(--primary);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-submit-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel-premium {
  padding: 12px 28px;
  background: #f3f4f6;
  border: none;
  border-radius: 14px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-cancel-premium:hover {
  background: #e5e7eb;
}

/* Announcements Section */
.announcements-section {
  margin-top: 8px;
}

.announcements-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Announcement Card */
.announcement-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.announcement-card-premium:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px -12px rgba(0, 0, 0, 0.15);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary);
}

.card-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 12px 24px;
  background: #fafbfc;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.announcement-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 20px;
}

.header-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.meta-info i {
  font-size: 11px;
}

.card-actions-premium {
  display: flex;
  gap: 8px;
}

.action-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-icon.edit:hover {
  color: rgb(12, 2, 2);
  transform: translateY(-2px);
}

.action-icon.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-icon.delete:hover {
  color: rgb(12, 1, 1);
  transform: translateY(-2px);
}

.card-body-premium {
  padding: 16px 24px 24px 24px;
}

.card-body-premium p {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-line;
}

/* More Button */
.more-btn-wrapper {
  text-align: center;
  margin-top: 24px;
}

.more-btn-premium {
  background: #f3f4f6;
  border: none;
  padding: 10px 24px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.more-btn-premium:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 20px;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-state-premium p {
  font-size: 14px;
}

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .content {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .card-header-premium {
    flex-direction: column;
    gap: 12px;
  }

  .card-actions-premium {
    align-self: flex-end;
  }

  .header-info {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-submit-premium,
  .btn-cancel-premium {
    justify-content: center;
  }

  .announcement-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .header-info h3 {
    font-size: 16px;
  }
}

/* Disabled Button State */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>