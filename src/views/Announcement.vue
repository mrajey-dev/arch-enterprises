<template>
  <div class="layout">
    <div class="main-content">
      <!-- Fixed Stationary Admin Sidebar -->
      <Sidebar ref="sidebarRef" />

      <!-- Main Announcement Content Area -->
      <section class="content">
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-bullhorn"></i>
            <span>Announcements</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-mobile-create" @click="openCreateForm">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn-mobile-menu" @click="toggleMobileSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Header Banner -->
        <header class="announcement-top-banner">
          <div class="banner-left">
            <div class="banner-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>OFFICIAL COMMUNICATIONS</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-check-circle"></i> Live Broadcast Board
              </span>
            </div>
            <h1 class="page-title">Announcement Board</h1>
            <p class="page-subtitle">
              Publish and manage company-wide notices, team updates, and executive guidelines.
            </p>
          </div>

          <div class="banner-right">
            <button class="btn-publish-notice" @click="openCreateForm">
              <i class="fas fa-plus-circle"></i>
              <span>Create Announcement</span>
            </button>
          </div>
        </header>

        <!-- 📊 Quick Summary Metric Strip -->
        <div class="announcement-metrics-strip">
          <div class="metric-card">
            <div class="metric-icon-box bg-teal-tint">
              <i class="fas fa-bullhorn text-teal"></i>
            </div>
            <div class="metric-info">
              <span class="metric-label">Total Broadcasts</span>
              <h3 class="metric-value">{{ announcements.length }}</h3>
              <span class="metric-sub">Published notices</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box bg-blue-tint">
              <i class="fas fa-calendar-check text-blue"></i>
            </div>
            <div class="metric-info">
              <span class="metric-label">Active This Month</span>
              <h3 class="metric-value">{{ thisMonthCount }}</h3>
              <span class="metric-sub">{{ currentMonthName }} notices</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box bg-purple-tint">
              <i class="fas fa-history text-purple"></i>
            </div>
            <div class="metric-info">
              <span class="metric-label">Latest Announcement</span>
              <h3 class="metric-value metric-value-sm">{{ latestAnnouncementDate }}</h3>
              <span class="metric-sub">Most recent release</span>
            </div>
          </div>
        </div>

        <!-- ✍️ Create / Edit Announcement Card (Collapsible Drawer / Card) -->
        <transition name="slide-fade">
          <div v-if="formVisible" class="announcement-compose-card" ref="formRef">
            <div class="compose-header">
              <div class="compose-title-left">
                <div class="compose-icon-pill" :class="editingId ? 'is-edit' : 'is-create'">
                  <i :class="editingId ? 'fas fa-edit' : 'fas fa-pen-nib'"></i>
                </div>
                <div>
                  <h3 class="compose-heading">
                    {{ editingId ? 'Edit Announcement' : 'Compose New Announcement' }}
                  </h3>
                  <p class="compose-sub">
                    {{ editingId ? 'Update details of this existing broadcast notice' : 'Draft a message to broadcast to all employees in real-time' }}
                  </p>
                </div>
              </div>
              <button class="btn-close-composer" @click="cancelEdit" title="Close Composer">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <form @submit.prevent="addAnnouncement" class="compose-form">
              <div class="form-grid-row">
                <!-- Title Field -->
                <div class="form-group flex-2">
                  <label class="form-label">
                    <span>Announcement Title</span>
                    <span class="required-star">*</span>
                  </label>
                  <div class="input-wrapper">
                    <i class="fas fa-heading input-icon"></i>
                    <input
                      type="text"
                      v-model="newAnnouncement.title"
                      placeholder="e.g., Annual Town Hall 2026 Scheduled for Next Friday"
                      required
                      class="custom-input"
                    />
                  </div>
                </div>

                <!-- Priority / Tag Selector -->
                <div class="form-group flex-1">
                  <label class="form-label">
                    <span>Notice Tag</span>
                  </label>
                  <div class="input-wrapper">
                    <i class="fas fa-tag input-icon"></i>
                    <select v-model="selectedTag" class="custom-input custom-select">
                      <option value="General Update">General Update</option>
                      <option value="Urgent Notice">Urgent Notice</option>
                      <option value="Holiday & Event">Holiday & Event</option>
                      <option value="Policy & HR">Policy & HR</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Message Textarea -->
              <div class="form-group">
                <div class="label-with-hint">
                  <label class="form-label">
                    <span>Announcement Content</span>
                    <span class="required-star">*</span>
                  </label>
                  <span class="char-count">{{ (newAnnouncement.message || '').length }} characters</span>
                </div>
                <div class="input-wrapper textarea-wrapper">
                  <i class="fas fa-align-left input-icon textarea-icon"></i>
                  <textarea
                    v-model="newAnnouncement.message"
                    placeholder="Type the full announcement message, details, instructions, or meeting links..."
                    rows="4"
                    required
                    class="custom-input custom-textarea"
                  ></textarea>
                </div>
              </div>
              <!-- Compose Action Bar -->
              <div class="compose-action-bar">
                <div class="compose-hint">
                  <i class="fas fa-info-circle"></i>
                  <span>Broadcasted announcements are visible immediately across employee portals.</span>
                </div>
                <div class="compose-btns">
                  <button type="button" class="btn-ghost" @click="cancelEdit">
                    <i class="fas fa-times"></i>
                    <span>Cancel</span>
                  </button>
                  <button type="submit" class="btn-primary-action" :disabled="isLoading">
                    <span v-if="!isLoading">
                      <i :class="editingId ? 'fas fa-save' : 'fas fa-paper-plane'"></i>
                      <span>{{ editingId ? 'Save Changes' : ' Publish' }}</span>
                    </span>
                    <span v-else class="loading-inline">
                      <i class="fas fa-spinner fa-spin"></i>
                      <span>Publishing...</span>
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </transition>

        <!-- 🔍 Filter Toolbar & Feed Header -->
        <div class="announcement-toolbar">
          <div class="search-box-pill">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search announcements by title or content..."
              class="toolbar-search-input"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="toolbar-actions">
            <!-- Filter Pills -->
            <div class="filter-pills-group">
              <button
                type="button"
                class="filter-pill-btn"
                :class="{ active: activeFilter === 'all' }"
                @click="activeFilter = 'all'"
              >
                <span>All ({{ announcements.length }})</span>
              </button>
              <button
                type="button"
                class="filter-pill-btn"
                :class="{ active: activeFilter === 'recent' }"
                @click="activeFilter = 'recent'"
              >
                <span>Recent (7 Days)</span>
              </button>
              <button
                type="button"
                class="filter-pill-btn"
                :class="{ active: activeFilter === 'month' }"
                @click="activeFilter = 'month'"
              >
                <span>This Month</span>
              </button>
            </div>

            <!-- Sort Toggle -->
            <button
              type="button"
              class="btn-sort-toggle"
              @click="sortDescending = !sortDescending"
              :title="sortDescending ? 'Sorting: Newest first' : 'Sorting: Oldest first'"
            >
              <i :class="sortDescending ? 'fas fa-sort-amount-down' : 'fas fa-sort-amount-up'"></i>
              <span>{{ sortDescending ? 'Newest' : 'Oldest' }}</span>
            </button>
          </div>
        </div>

        <!-- 📋 Announcements Card Grid -->
        <div class="announcements-feed-container">
          <!-- Empty State -->
          <div v-if="filteredAnnouncements.length === 0" class="announcement-empty-state">
            <div class="empty-icon-circle">
              <i class="fas fa-bullhorn"></i>
            </div>
            <h3 class="empty-heading">
              {{ searchQuery ? 'No Matching Announcements Found' : 'No Announcements Published Yet' }}
            </h3>
            <p class="empty-desc">
              {{ searchQuery ? 'Try adjusting your search query or switching active filter tabs.' : 'Share the first organizational update or team broadcast with your employees.' }}
            </p>
            <button v-if="!searchQuery" class="btn-create-first" @click="openCreateForm">
              <i class="fas fa-plus"></i>
              <span>Create Announcement</span>
            </button>
          </div>

          <!-- Cards Grid -->
          <div v-else class="announcement-cards-grid">
            <article
              v-for="item in filteredAnnouncements"
              :key="item.id"
              class="announcement-card"
              :class="{ 'card-highlight': editingId === item.id }"
            >
              <!-- Card Top Meta Bar -->
              <div class="card-meta-bar">
                <div class="card-tag-pill" :class="getTagClass(item.title)">
                  <i :class="getTagIcon(item.title)"></i>
                  <span>{{ inferTag(item.title) }}</span>
                </div>
                
                <div class="card-date-badge">
                  <i class="far fa-calendar-alt"></i>
                  <span>{{ item.date }}</span>
                </div>

                <!-- Action Buttons -->
                <div class="card-action-btns">
                  <button
                    type="button"
                    class="action-btn edit"
                    @click="editAnnouncement(item.id)"
                    title="Edit Announcement"
                  >
                    <i class="fas fa-pen"></i>
                  </button>
                  <button
                    type="button"
                    class="action-btn delete"
                    @click="deleteAnnouncement(item.id)"
                    title="Delete Announcement"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>

              <!-- Card Content Body -->
              <div class="card-content-body">
                <h3 class="announcement-card-title">{{ item.title }}</h3>
                <p class="announcement-card-message">{{ item.message }}</p>
              </div>

              <!-- Card Bottom Verified Footer -->
              <div class="card-footer-bar">
                <div class="author-badge">
                  <span class="author-dot"></span>
                  <span class="author-name">Official Notice &bull; HR & Operations</span>
                </div>
                <span class="verified-pill">
                  <i class="fas fa-check-circle"></i> Published
                </span>
              </div>
            </article>
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
      formVisible: false,
      isLoading: false,
      editingId: null,
      isMobile: false,
      announcements: [],
      searchQuery: "",
      activeFilter: "all",
      sortDescending: true,
      selectedTag: "General Update",
      newAnnouncement: {
        title: "",
        message: ""
      }
    }
  },
  computed: {
    currentMonthName() {
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      return months[new Date().getMonth()];
    },

    thisMonthCount() {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return this.announcements.filter(item => {
        if (!item.rawDate) return true;
        const d = new Date(item.rawDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;
    },

    latestAnnouncementDate() {
      if (!this.announcements.length) return "None yet";
      return this.announcements[0]?.date?.split(',')[0] || "Just now";
    },

    filteredAnnouncements() {
      let list = [...this.announcements];

      // 1. Text Search Filter
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(item =>
          (item.title || "").toLowerCase().includes(q) ||
          (item.message || "").toLowerCase().includes(q)
        );
      }

      // 2. Tab Filter
      if (this.activeFilter === "recent") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        list = list.filter(item => {
          if (!item.rawDate) return true;
          return new Date(item.rawDate) >= sevenDaysAgo;
        });
      } else if (this.activeFilter === "month") {
        const now = new Date();
        list = list.filter(item => {
          if (!item.rawDate) return true;
          const d = new Date(item.rawDate);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
      }

      // 3. Sort Order
      if (!this.sortDescending) {
        list.reverse();
      }

      return list;
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
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 992;
    },

    toggleMobileSidebar() {
      if (this.$refs.sidebarRef) {
        this.$refs.sidebarRef.isMobileOpen = !this.$refs.sidebarRef.isMobileOpen;
      }
    },

    openCreateForm() {
      this.editingId = null;
      this.newAnnouncement = { title: "", message: "" };
      this.selectedTag = "General Update";
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.formRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },

    cancelEdit() {
      this.editingId = null;
      this.newAnnouncement = { title: "", message: "" };
      this.formVisible = false;
    },

    editAnnouncement(id) {
      const announcement = this.announcements.find(a => a.id === id);
      if (announcement) {
        this.newAnnouncement.title = announcement.title;
        this.newAnnouncement.message = announcement.message;
        this.editingId = announcement.id;
        this.selectedTag = this.inferTag(announcement.title);
        this.formVisible = true;
        this.$nextTick(() => {
          this.$refs.formRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    },

    async deleteAnnouncement(id) {
      if (!confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) return;

      try {
        await axios.delete(`https://employees.archenterprises.co.in/api/api/announcements/${id}`);
        toastSuccess('Announcement deleted successfully!');
        if (this.editingId === id) {
          this.cancelEdit();
        }
        await this.fetchAnnouncements();
      } catch (error) {
        console.error('Failed to delete announcement:', error);
        toastError('Failed to delete announcement');
      }
    },

    async fetchAnnouncements() {
      try {
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/announcements');
        const records = res.data.data || res.data || [];
        this.announcements = records.map(item => ({
          id: item.id,
          title: item.title,
          message: item.message,
          rawDate: item.created_at,
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
          title: this.newAnnouncement.title.trim(),
          message: this.newAnnouncement.message.trim()
        };

        if (this.editingId) {
          await axios.put(
            `https://employees.archenterprises.co.in/api/api/announcements/${this.editingId}`,
            payload
          );
          toastSuccess('Announcement updated successfully!');
        } else {
          await axios.post(
            'https://employees.archenterprises.co.in/api/api/announcements',
            payload
          );
          toastSuccess('Announcement broadcasted successfully!');
        }

        this.newAnnouncement = { title: "", message: "" };
        this.editingId = null;
        this.formVisible = false;
        await this.fetchAnnouncements();
      } catch (error) {
        console.error('Error saving announcement:', error.response?.data || error.message);
        toastError('Failed to save announcement');
      } finally {
        this.isLoading = false;
      }
    },

    inferTag(title = '') {
      const lower = title.toLowerCase();
      if (lower.includes('urgent') || lower.includes('alert') || lower.includes('attention') || lower.includes('important')) {
        return 'Urgent Notice';
      }
      if (lower.includes('holiday') || lower.includes('festival') || lower.includes('celebration') || lower.includes('party') || lower.includes('event')) {
        return 'Holiday & Event';
      }
      if (lower.includes('policy') || lower.includes('rule') || lower.includes('guideline') || lower.includes('timing') || lower.includes('payroll')) {
        return 'Policy & HR';
      }
      return 'General Update';
    },

    getTagClass(title = '') {
      const tag = this.inferTag(title);
      if (tag === 'Urgent Notice') return 'tag-urgent';
      if (tag === 'Holiday & Event') return 'tag-holiday';
      if (tag === 'Policy & HR') return 'tag-policy';
      return 'tag-general';
    },

    getTagIcon(title = '') {
      const tag = this.inferTag(title);
      if (tag === 'Urgent Notice') return 'fas fa-exclamation-triangle';
      if (tag === 'Holiday & Event') return 'fas fa-gift';
      if (tag === 'Policy & HR') return 'fas fa-shield-alt';
      return 'fas fa-info-circle';
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ════════ Master Page Layout ════════ */
.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg-app, #f8fafc);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text, #0f172a);
}

.main-content {
  display: flex;
  flex: 1;
  padding: 20px 28px;
  gap: 24px;
}

.content {
  flex: 1;
  min-width: 0;
  background: transparent;
  overflow-x: hidden;
}

/* ════════ Mobile Header ════════ */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid var(--border, #e2e8f0);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.mobile-title i {
  color: var(--primary, #0d9488);
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-create {
  background: var(--primary, #0d9488);
  color: #ffffff;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
}

.btn-mobile-menu {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}

/* ════════ Enterprise Top Header Banner ════════ */
.announcement-top-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.banner-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: var(--primary, #0d9488);
  letter-spacing: 0.6px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary, #0d9488);
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.status-meta-pill {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-meta-pill i {
  color: #10b981;
}

.page-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.btn-publish-notice {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary-gradient, linear-gradient(135deg, #0d9488 0%, #0f766e 100%));
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(13, 148, 136, 0.2);
}

.btn-publish-notice:hover {
  opacity: 0.94;
  transform: translateY(-1px);
}

/* ════════ Metrics Strip ════════ */
.announcement-metrics-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.metric-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.bg-teal-tint {
  background: #f0fdfa;
}
.text-teal {
  color: #0d9488;
}

.bg-blue-tint {
  background: #eff6ff;
}
.text-blue {
  color: #2563eb;
}

.bg-purple-tint {
  background: #f5f3ff;
}
.text-purple {
  color: #7c3aed;
}

.metric-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.metric-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0 1px;
  line-height: 1.2;
}

.metric-value-sm {
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-sub {
  font-size: 11.5px;
  color: #94a3b8;
}

/* ════════ Compose New / Edit Card ════════ */
.announcement-compose-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.06);
}

.compose-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 18px;
}

.compose-title-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.compose-icon-pill {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.compose-icon-pill.is-create {
  background: #f0fdfa;
  color: #0d9488;
}

.compose-icon-pill.is-edit {
  background: #fff7ed;
  color: #ea580c;
}

.compose-heading {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
}

.compose-sub {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.btn-close-composer {
  background: #f1f5f9;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-close-composer:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.compose-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid-row {
  display: flex;
  gap: 16px;
}

.flex-2 {
  flex: 2;
}

.flex-1 {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
}

.label-with-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 11px;
  color: #94a3b8;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
}

.textarea-wrapper {
  align-items: flex-start;
}

.textarea-icon {
  top: 14px;
}

.custom-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: #fafbfc;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  font-size: 13.5px;
  color: #0f172a;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;
}

.custom-select {
  cursor: pointer;
  font-weight: 500;
}

.custom-textarea {
  resize: vertical;
  min-height: 90px;
  line-height: 1.5;
}

.custom-input:focus {
  background: #ffffff;
  border-color: var(--primary, #0d9488);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.compose-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.compose-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.compose-hint i {
  color: var(--primary, #0d9488);
}

.compose-btns {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid var(--border, #e2e8f0);
  color: #475569;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-ghost:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary-gradient, linear-gradient(135deg, #0d9488 0%, #0f766e 100%));
  color: #ffffff;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(13, 148, 136, 0.2);
}

.btn-primary-action:hover:not(:disabled) {
  opacity: 0.94;
  transform: translateY(-1px);
}

.btn-primary-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ════════ Search & Filter Toolbar ════════ */
.announcement-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 20px;
}

.search-box-pill {
  flex: 1;
  max-width: 440px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 13px;
}

.toolbar-search-input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
}

.toolbar-search-input:focus {
  background: #ffffff;
  border-color: var(--primary, #0d9488);
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-pills-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
}

.filter-pill-btn {
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-pill-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.btn-sort-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-sort-toggle:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* ════════ Announcements Grid & Cards ════════ */
.announcements-feed-container {
  min-height: 200px;
}

.announcement-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.announcement-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.announcement-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px -4px rgba(0, 0, 0, 0.05);
}

.card-highlight {
  border-color: var(--primary, #0d9488) !important;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2) !important;
}

.card-meta-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.card-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 2.5px 8px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.tag-general {
  background: #f0fdfa;
  color: #0d9488;
  border: 1px solid #ccfbf1;
}

.tag-urgent {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.tag-holiday {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #ede9fe;
}

.tag-policy {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}

.card-date-badge {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-action-btns {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.edit {
  color: #64748b;
}

.action-btn.edit:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.action-btn.delete {
  color: #94a3b8;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.card-content-body {
  margin-bottom: 14px;
}

.announcement-card-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
  line-height: 1.35;
}

.announcement-card-message {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.55;
  margin: 0;
  white-space: pre-line;
  word-break: break-word;
}

.card-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f8fafc;
  font-size: 11px;
}

.author-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-weight: 500;
}

.author-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.verified-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #059669;
  font-weight: 600;
  background: #ecfdf5;
  padding: 1.5px 7px;
  border-radius: 4px;
}

/* ════════ Empty State ════════ */
.announcement-empty-state {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0fdfa;
  color: var(--primary, #0d9488);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 12px;
}

.empty-heading {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: #64748b;
  max-width: 440px;
  margin: 0 0 18px;
  line-height: 1.5;
}

.btn-create-first {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary, #0d9488);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-create-first:hover {
  opacity: 0.94;
  transform: translateY(-1px);
}

/* ════════ Animations ════════ */
.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* ════════ Responsive Breakpoints ════════ */
@media (max-width: 1200px) {
  .announcement-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 16px 14px;
    gap: 16px;
    flex-direction: column;
  }

  .announcement-top-banner {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    gap: 14px;
  }

  .btn-publish-notice {
    width: 100%;
    justify-content: center;
  }

  .announcement-metrics-strip {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .metric-card {
    padding: 14px;
    gap: 10px;
  }

  .metric-value {
    font-size: 18px;
  }

  .announcement-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-box-pill {
    max-width: 100%;
  }

  .toolbar-actions {
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px 10px;
  }

  .announcement-metrics-strip {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .form-grid-row {
    flex-direction: column;
    gap: 12px;
  }

  .compose-action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .compose-btns {
    width: 100%;
  }

  .compose-btns button {
    flex: 1;
    justify-content: center;
  }

  .filter-pills-group {
    width: 100%;
    overflow-x: auto;
  }

  .card-meta-bar {
    flex-wrap: wrap;
  }
}
</style>