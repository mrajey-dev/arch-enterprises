<template>
  <div class="layout">

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
         
          <div class="mobile-title">
            <i class="fas fa-bullhorn"></i>
            <span>Announcements</span>
          </div>
          <button class="mobile-add-btn" @click="scrollToForm">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
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

        <!-- Create Announcement Card - Mobile Optimized -->
        <div class="create-card" ref="formRef">
          <div class="section-title-modern" @click="toggleForm">
            <div class="title-left">
              <i class="fas fa-pen-alt"></i>
              <span>{{ editingId ? 'Edit Announcement' : 'Create New Announcement' }}</span>
            </div>
            <i class="fas fa-chevron-down form-toggle" :class="{ 'rotated': formVisible }"></i>
          </div>
          
          <form @submit.prevent="addAnnouncement" class="announcement-form-premium" :class="{ 'form-hidden': !formVisible }">
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

            <div class="form-actions" :class="{ 'mobile-actions': isMobile }">
              <button type="submit" class="btn-submit-premium" :disabled="isLoading">
                <span v-if="!isLoading">
                  <i :class="editingId ? 'fas fa-save' : 'fas fa-paper-plane'"></i>
                  {{ editingId ? 'Update' : 'Post' }}
                </span>
                <span v-else>
                  <i class="fas fa-spinner fa-spin"></i>
                  Please wait...
                </span>
              </button>
              <button v-if="editingId" type="button" class="btn-cancel-premium" @click="cancelEdit">
                <i class="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>

        <!-- Announcements List -->
        <div class="announcements-section">
          <div class="section-title-modern">
            <div class="title-left">
              <i class="fas fa-list-alt"></i>
              <span>Recent Announcements</span>
              <span class="badge-count">{{ announcements.length }}</span>
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="announcements-grid">
            <div
              v-for="announcement in displayedAnnouncements"
              :key="announcement.id"
              class="announcement-card-premium"
              :class="{ 'mobile-card': isMobile }"
            >
              <div class="card-accent"></div>
              <div class="card-header-premium" :class="{ 'mobile-header': isMobile }">
                <div class="header-info">
                  <div class="announcement-icon" :class="{ 'mobile-icon': isMobile }">
                    <i class="fas fa-bullhorn"></i>
                  </div>
                  <div>
                    <h3 :class="{ 'mobile-title': isMobile }">{{ announcement.title }}</h3>
                    <div class="meta-info">
                      <i class="fas fa-calendar-alt"></i>
                      <span>{{ announcement.date }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-actions-premium" :class="{ 'mobile-actions': isMobile }">
                  <button class="action-icon edit" @click="editAnnouncement(announcement.id)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-icon delete" @click="deleteAnnouncement(announcement.id)" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="card-body-premium" :class="{ 'mobile-body': isMobile }">
                <p>{{ announcement.message }}</p>
              </div>
            </div>

            <!-- Empty State - Mobile Optimized -->
            <div v-if="announcements.length === 0" class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
              <i class="fas fa-bullhorn"></i>
              <h4>No Announcements Yet</h4>
              <p>Create your first announcement to share with your team</p>
            </div>
          </div>

          <!-- Show More Button - Mobile Optimized -->
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
  toastInfo,
} from "@/utils/toast.js";

export default {
  name: "AnnouncementBoard",
  components: {
    Sidebar
  },
  data() {
    return {
      showAll: false,
      formVisible: true,
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
    toggleForm() {
      if (this.isMobile) {
        this.formVisible = !this.formVisible;
      }
    },
    scrollToForm() {
      this.$refs.formRef?.scrollIntoView({ behavior: 'smooth' });
      if (this.isMobile) {
        this.formVisible = true;
      }
    },
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
        if (this.isMobile) {
          this.formVisible = true;
        }
        // Scroll to form
        this.$refs.formRef?.scrollIntoView({ behavior: 'smooth' });
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
      if (this.isMobile) {
        this.formVisible = false;
      } else {
        this.formVisible = true;
      }
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
        if (this.isMobile) {
          this.formVisible = false;
        }
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
  --primary: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--dark);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark);
}

.mobile-title i {
  color: var(--primary-color);
}

.mobile-add-btn {
  background: var(--primary);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-add-btn:active {
  transform: scale(0.9);
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
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
  cursor: pointer;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

.form-toggle {
  transition: transform 0.3s ease;
}

.form-toggle.rotated {
  transform: rotate(180deg);
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
  transition: all 0.3s ease;
}

.announcement-form-premium.form-hidden {
  display: none;
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

.form-actions.mobile-actions {
  flex-direction: column;
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

.mobile-actions .btn-submit-premium {
  width: 100%;
  justify-content: center;
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

.mobile-actions .btn-cancel-premium {
  width: 100%;
  justify-content: center;
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

.announcement-card-premium.mobile-card {
  border-radius: 16px;
}

.announcement-card-premium:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px -12px rgba(0, 0, 0, 0.15);
}

.announcement-card-premium.mobile-card:active {
  transform: scale(0.99);
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

.card-header-premium.mobile-header {
  padding: 14px 16px 10px 16px;
  flex-direction: column;
  gap: 10px;
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

.announcement-icon.mobile-icon {
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.header-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.header-info h3.mobile-title {
  font-size: 15px;
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

.card-actions-premium.mobile-actions {
  align-self: flex-end;
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

.mobile-actions .action-icon {
  width: 40px;
  height: 40px;
}

.action-icon.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-icon.edit:active {
  transform: scale(0.9);
}

.action-icon.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-icon.delete:active {
  transform: scale(0.9);
}

.card-body-premium {
  padding: 16px 24px 24px 24px;
}

.card-body-premium.mobile-body {
  padding: 12px 16px 16px 16px;
}

.card-body-premium p {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-line;
}

.mobile-body p {
  font-size: 13px;
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

.more-btn-premium:active {
  transform: scale(0.97);
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 20px;
}

.empty-state-premium.empty-mobile {
  padding: 40px 16px;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-mobile .empty-state-premium i {
  font-size: 48px;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-mobile .empty-state-premium h4 {
  font-size: 16px;
}

.empty-state-premium p {
  font-size: 14px;
}

.empty-mobile .empty-state-premium p {
  font-size: 13px;
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
    padding: 12px;
  }

  .content {
    padding: 16px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .create-card {
    padding: 16px;
    border-radius: 20px;
  }

  .section-title-modern {
    font-size: 14px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-submit-premium,
  .btn-cancel-premium {
    width: 100%;
    justify-content: center;
    padding: 14px;
  }

  .announcements-grid {
    gap: 16px;
  }

  .card-header-premium {
    flex-direction: column;
    gap: 10px;
  }

  .card-actions-premium {
    align-self: flex-end;
  }

  .header-info {
    width: 100%;
  }

  .announcement-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .header-info h3 {
    font-size: 15px;
  }

  .card-body-premium {
    padding: 12px 16px 16px 16px;
  }

  .card-body-premium p {
    font-size: 13px;
  }

  .empty-state-premium {
    padding: 40px 16px;
  }

  .empty-state-premium i {
    font-size: 48px;
  }

  .empty-state-premium h4 {
    font-size: 16px;
  }

  .more-btn-premium {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .content {
    padding: 12px;
    border-radius: 16px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-add-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .create-card {
    padding: 12px;
  }

  .section-title-modern {
    font-size: 13px;
  }

  .field-wrapper input,
  .field-wrapper textarea {
    font-size: 15px;
    padding: 10px 12px 10px 36px;
  }

  .btn-submit-premium,
  .btn-cancel-premium {
    padding: 12px;
    font-size: 13px;
  }

  .announcement-card-premium.mobile-card {
    border-radius: 14px;
  }

  .card-header-premium.mobile-header {
    padding: 12px;
  }

  .card-body-premium.mobile-body {
    padding: 10px 12px 12px 12px;
  }

  .header-info h3.mobile-title {
    font-size: 14px;
  }

  .meta-info {
    font-size: 10px;
  }

  .action-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .empty-state-premium {
    padding: 30px 12px;
  }

  .empty-state-premium i {
    font-size: 40px;
  }

  .empty-state-premium h4 {
    font-size: 15px;
  }

  .empty-state-premium p {
    font-size: 12px;
  }

  .more-btn-premium {
    font-size: 12px;
    padding: 10px;
  }
}
</style>