<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section
        class="content"
        v-show="!isMobile || !isSidebarVisible"
        :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
      >
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-bullhorn text-teal"></i>
            <span>Announcements</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-mobile-refresh" @click="fetchAnnouncements" :disabled="loadingAnnouncements">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingAnnouncements }"></i>
            </button>
            <button class="btn-mobile-menu" @click="toggleSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Header Banner -->
        <header class="executive-header">
          <div class="header-main">
            <div class="header-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>OFFICIAL COMMUNICATIONS</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-broadcast-tower text-teal"></i> Live Broadcast Board
              </span>
            </div>
            <div class="title-with-icon">
              <div class="header-icon-box">
                <i class="fas fa-bullhorn"></i>
              </div>
              <div>
                <h1 class="header-title">Announcement Board</h1>
                <p class="header-subtitle">Stay informed with official company broadcasts, policy guidelines, and event notices</p>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button class="btn-secondary-action" @click="fetchAnnouncements" :disabled="loadingAnnouncements">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingAnnouncements }"></i>
              <span>Refresh Feed</span>
            </button>
          </div>
        </header>

        <!-- 📊 KPI Metric Cards -->
        <section class="metrics-grid">
          <!-- Total Broadcasts -->
          <div class="metric-card" :class="{ 'card-active': !selectedCategory }" @click="selectedCategory = ''">
            <div class="metric-header">
              <span class="metric-title">Total Broadcasts</span>
              <div class="metric-icon-wrap icon-all">
                <i class="fas fa-newspaper"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ announcements.length }}</span>
              <span class="metric-tag tag-all">All releases</span>
            </div>
          </div>

          <!-- Active This Month -->
          <div class="metric-card card-month">
            <div class="metric-header">
              <span class="metric-title">This Month</span>
              <div class="metric-icon-wrap icon-month">
                <i class="fas fa-calendar-check"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ thisMonthCount }}</span>
              <span class="metric-tag tag-month">{{ currentMonthName }}</span>
            </div>
          </div>

          <!-- Latest Update -->
          <div class="metric-card card-latest">
            <div class="metric-header">
              <span class="metric-title">Latest Notice</span>
              <div class="metric-icon-wrap icon-latest">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number metric-number-sm">{{ latestFormattedMonth }}</span>
              <span class="metric-tag tag-latest">Latest release</span>
            </div>
          </div>

          <!-- Urgent / Important Notices -->
          <div class="metric-card card-urgent" :class="{ 'card-active': selectedCategory === 'Urgent' }" @click="toggleCategory('Urgent')">
            <div class="metric-header">
              <span class="metric-title">Action Items</span>
              <div class="metric-icon-wrap icon-urgent">
                <i class="fas fa-exclamation-circle"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ urgentCount }}</span>
              <span class="metric-tag tag-urgent">High priority</span>
            </div>
          </div>
        </section>

        <!-- 🏷️ Search & Category Filter Toolbar -->
        <div class="feed-controls-bar">
          <div class="search-box-wrap">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search announcements by headline or keywords..."
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Category Filter Pills -->
          <div class="category-pills-wrap">
            <button
              class="category-pill"
              :class="{ active: !selectedCategory }"
              @click="selectedCategory = ''"
            >
              All Notices
            </button>
            <button
              v-for="cat in availableCategories"
              :key="cat"
              class="category-pill"
              :class="{ active: selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- 📢 Announcements Feed Stream -->
        <div class="announcements-feed-container">
          <div class="feed-header-bar">
            <div class="fh-left">
              <div class="fh-icon-box">
                <i class="fas fa-stream text-teal"></i>
              </div>
              <div>
                <h3 class="fh-title">Company Notice Bulletin</h3>
                <span class="fh-sub">
                  Showing {{ filteredAnnouncements.length }} of {{ announcements.length }} published {{ announcements.length === 1 ? 'notice' : 'notices' }}
                </span>
              </div>
            </div>
            <div class="fh-right" v-if="filteredAnnouncements.length > 0">
              <span class="feed-badge-pulse">
                <span class="pulse-dot"></span> Live Channel
              </span>
            </div>
          </div>

          <!-- Feed Cards List -->
          <div class="feed-cards-list">
            <article
              class="notice-card-premium"
              v-for="(announcement, index) in filteredAnnouncements"
              :key="index"
              :class="getCategoryThemeClass(announcement.category)"
            >
              <!-- Card Accent Bar -->
              <div class="card-accent-strip"></div>

              <!-- Card Header -->
              <div class="nc-header">
                <div class="nc-header-left">
                  <div class="nc-icon-wrap">
                    <i :class="getCategoryIcon(announcement.category)"></i>
                  </div>
                  <div class="nc-title-block">
                    <div class="nc-badge-row">
                      <span class="nc-category-pill" :class="getCategoryPillClass(announcement.category)">
                        {{ announcement.category }}
                      </span>
                      <span class="nc-broadcast-source">
                        <i class="fas fa-shield-alt"></i> Official HR Broadcast
                      </span>
                    </div>
                    <h3 class="nc-title">{{ announcement.title }}</h3>
                  </div>
                </div>

                <div class="nc-header-right">
                  <div class="nc-date-chip">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ announcement.date }}</span>
                  </div>
                </div>
              </div>

              <!-- Card Body / Content -->
              <div class="nc-body">
                <div class="nc-message-content">
                  <p
                    v-for="(paragraph, pIdx) in formatMessageParagraphs(announcement.message)"
                    :key="pIdx"
                    :class="{
                      'nc-highlight-line': isHighlightLine(paragraph),
                      'nc-bullet-line': isBulletLine(paragraph),
                      'nc-signoff-line': isSignoffLine(paragraph)
                    }"
                  >
                    <span v-if="isBulletLine(paragraph)" class="bullet-dot">•</span>
                    <span>{{ cleanBulletText(paragraph) }}</span>
                  </p>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="nc-footer">
                <div class="nc-footer-meta">
                  <span class="nc-meta-item">
                    <i class="fas fa-building"></i> Arch Enterprises Corporate
                  </span>
                  <span class="nc-meta-dot">•</span>
                  <span class="nc-meta-item">
                    <i class="fas fa-users"></i> All Employees
                  </span>
                </div>

                <div class="nc-footer-actions">
                  <button
                    class="btn-copy-notice"
                    @click="copyAnnouncementText(announcement)"
                    title="Copy announcement content"
                  >
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </article>

            <!-- Empty State -->
            <div v-if="filteredAnnouncements.length === 0" class="empty-feed-card">
              <div class="empty-icon-wrap">
                <i class="fas fa-bullhorn"></i>
              </div>
              <h4 class="empty-title">No Announcements Found</h4>
              <p class="empty-desc">
                {{ searchQuery || selectedCategory ? 'No announcements matched your search filter. Try clearing filters.' : 'There are currently no active announcements on the board. Check back later!' }}
              </p>
              <button
                v-if="searchQuery || selectedCategory"
                class="btn-reset-filters"
                @click="resetFilters"
              >
                <i class="fas fa-undo"></i> Reset Filters
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue'
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
      isMobile: false,
      isSidebarVisible: true,
      announcements: [],
      loadingAnnouncements: false,
      searchQuery: '',
      selectedCategory: '',
      availableCategories: ['Events & Culture', 'HR & Policy', 'Urgent Action', 'General Update']
    }
  },
  computed: {
    latestFormattedMonth() {
      if (!this.announcements.length) return 'No updates';
      const first = this.announcements[0];
      const d = new Date(first.rawDate || first.date);
      if (isNaN(d)) return 'Recent';
      return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    },
    currentMonthName() {
      return new Date().toLocaleDateString('en-IN', { month: 'long' });
    },
    thisMonthCount() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      return this.announcements.filter(a => {
        const d = new Date(a.rawDate || a.date);
        return !isNaN(d) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }).length;
    },
    urgentCount() {
      return this.announcements.filter(a => a.category === 'Urgent Action' || a.category === 'Urgent').length;
    },
    filteredAnnouncements() {
      let list = this.announcements;

      if (this.selectedCategory) {
        list = list.filter(a => {
          if (this.selectedCategory === 'Urgent') {
            return a.category === 'Urgent Action' || a.category === 'Urgent';
          }
          return a.category === this.selectedCategory;
        });
      }

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(a =>
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.message && a.message.toLowerCase().includes(q)) ||
          (a.date && a.date.toLowerCase().includes(q))
        );
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
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    toggleCategory(cat) {
      this.selectedCategory = this.selectedCategory === cat ? '' : cat;
    },
    resetFilters() {
      this.searchQuery = '';
      this.selectedCategory = '';
    },
    categorizeAnnouncement(title = '', message = '') {
      const text = `${title} ${message}`.toLowerCase();
      if (text.includes('urgent') || text.includes('mandatory') || text.includes('immediate') || text.includes('attention')) {
        return 'Urgent Action';
      }
      if (text.includes('photoshoot') || text.includes('event') || text.includes('celebration') || text.includes('party') || text.includes('gathering') || text.includes('festival') || text.includes('diwali') || text.includes('independence')) {
        return 'Events & Culture';
      }
      if (text.includes('policy') || text.includes('dress code') || text.includes('leave') || text.includes('attendance') || text.includes('salary') || text.includes('rules') || text.includes('appraisal')) {
        return 'HR & Policy';
      }
      return 'General Update';
    },
    getCategoryThemeClass(cat) {
      if (cat === 'Urgent Action' || cat === 'Urgent') return 'theme-urgent';
      if (cat === 'Events & Culture') return 'theme-event';
      if (cat === 'HR & Policy') return 'theme-policy';
      return 'theme-general';
    },
    getCategoryPillClass(cat) {
      if (cat === 'Urgent Action' || cat === 'Urgent') return 'pill-urgent';
      if (cat === 'Events & Culture') return 'pill-event';
      if (cat === 'HR & Policy') return 'pill-policy';
      return 'pill-general';
    },
    getCategoryIcon(cat) {
      if (cat === 'Urgent Action' || cat === 'Urgent') return 'fas fa-exclamation-triangle';
      if (cat === 'Events & Culture') return 'fas fa-camera';
      if (cat === 'HR & Policy') return 'fas fa-clipboard-check';
      return 'fas fa-bullhorn';
    },
    formatMessageParagraphs(msg) {
      if (!msg) return [];
      return msg
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    },
    isHighlightLine(line) {
      const lower = line.toLowerCase();
      return (
        lower.startsWith('dress code') ||
        lower.startsWith('date & time') ||
        lower.startsWith('venue') ||
        lower.startsWith('note:') ||
        lower.startsWith('important:')
      );
    },
    isBulletLine(line) {
      return line.startsWith('-') || line.startsWith('•') || line.startsWith('*');
    },
    cleanBulletText(line) {
      if (this.isBulletLine(line)) {
        return line.replace(/^[-•*]\s*/, '');
      }
      return line;
    },
    isSignoffLine(line) {
      const lower = line.toLowerCase();
      return (
        lower.startsWith('regards') ||
        lower.startsWith('best regards') ||
        lower.startsWith('thanks') ||
        lower.startsWith('hr executive') ||
        lower.startsWith('team arch')
      );
    },
    async copyAnnouncementText(announcement) {
      const textToCopy = `${announcement.title}\n${announcement.date}\n\n${announcement.message}`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        toastSuccess('Announcement copied to clipboard');
      } catch (e) {
        toastError('Could not copy text');
      }
    },
    async fetchAnnouncements() {
      this.loadingAnnouncements = true;
      try {
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/announcements');
        const records = res.data?.data || res.data || [];
        this.announcements = records.map(item => ({
          title: item.title,
          message: item.message,
          rawDate: item.created_at,
          category: this.categorizeAnnouncement(item.title, item.message),
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
      } finally {
        this.loadingAnnouncements = false;
      }
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

.text-teal { color: #0d9488 !important; }

/* ════════ Mobile Top Header ════════ */
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

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-refresh {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  cursor: pointer;
}

.btn-mobile-menu {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

/* ════════ Top Executive Banner ════════ */
.executive-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.header-badge-row {
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
  color: #0d9488;
  letter-spacing: 0.6px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0d9488;
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

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}

.header-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary-action:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* ════════ KPI Metrics Grid ════════ */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 16px 18px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
}

.metric-card.card-active {
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.metric-card.card-month { border-left: 3px solid #3b82f6; }
.metric-card.card-latest { border-left: 3px solid #8b5cf6; }
.metric-card.card-urgent { border-left: 3px solid #f59e0b; }

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.metric-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.metric-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.icon-all { background: #f0fdfa; color: #0d9488; }
.icon-month { background: #eff6ff; color: #2563eb; }
.icon-latest { background: #f5f3ff; color: #7c3aed; }
.icon-urgent { background: #fffbeb; color: #d97706; }

.metric-body {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metric-number {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
}

.metric-number-sm {
  font-size: 18px;
}

.metric-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
}

.tag-all { background: #f0fdfa; color: #0d9488; }
.tag-month { background: #eff6ff; color: #1d4ed8; }
.tag-latest { background: #f5f3ff; color: #6d28d9; }
.tag-urgent { background: #fffbeb; color: #b45309; }

/* ════════ Controls Bar ════════ */
.feed-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.search-box-wrap {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 38px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  transition: all 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
}

.category-pills-wrap {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.category-pill {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.category-pill:hover {
  background: #f8fafc;
  color: #0f172a;
}

.category-pill.active {
  background: #0d9488;
  border-color: #0d9488;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
}

/* ════════ Announcements Feed Container ════════ */
.announcements-feed-container {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.feed-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  background: #fafbfd;
}

.fh-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fh-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.fh-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.fh-sub {
  font-size: 12px;
  color: #64748b;
}

.feed-badge-pulse {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  color: #0d9488;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.25);
}

/* ════════ Feed Cards List ════════ */
.feed-cards-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notice-card-premium {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  position: relative;
}

.notice-card-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.card-accent-strip {
  height: 4px;
  width: 100%;
}

.theme-event .card-accent-strip { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.theme-policy .card-accent-strip { background: linear-gradient(90deg, #0d9488, #2dd4bf); }
.theme-urgent .card-accent-strip { background: linear-gradient(90deg, #f59e0b, #ef4444); }
.theme-general .card-accent-strip { background: linear-gradient(90deg, #3b82f6, #60a5fa); }

/* Notice Card Header */
.nc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #f1f5f9;
  gap: 16px;
  flex-wrap: wrap;
}

.nc-header-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
}

.nc-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.theme-event .nc-icon-wrap { background: #f5f3ff; color: #7c3aed; }
.theme-policy .nc-icon-wrap { background: #f0fdfa; color: #0d9488; }
.theme-urgent .nc-icon-wrap { background: #fffbeb; color: #d97706; }
.theme-general .nc-icon-wrap { background: #eff6ff; color: #2563eb; }

.nc-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nc-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nc-category-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.pill-event { background: #f5f3ff; color: #7c3aed; border: 1px solid #ede9fe; }
.pill-policy { background: #f0fdfa; color: #0d9488; border: 1px solid #ccfbf1; }
.pill-urgent { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.pill-general { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

.nc-broadcast-source {
  font-size: 11.5px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nc-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.35;
}

.nc-date-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
}

.nc-date-chip i {
  color: #94a3b8;
  font-size: 11px;
}

/* Notice Card Body */
.nc-body {
  padding: 16px 20px;
}

.nc-message-content {
  font-size: 13.5px;
  line-height: 1.65;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nc-message-content p {
  margin: 0;
}

.nc-highlight-line {
  font-weight: 700;
  color: #0f172a;
  margin-top: 6px !important;
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: 6px;
  border-left: 3px solid #0d9488;
}

.nc-bullet-line {
  padding-left: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #334155;
}

.bullet-dot {
  color: #0d9488;
  font-size: 16px;
  line-height: 1;
}

.nc-signoff-line {
  font-style: italic;
  color: #64748b;
  margin-top: 6px !important;
}

/* Notice Card Footer */
.nc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fafbfd;
  border-top: 1px solid #f1f5f9;
  font-size: 12px;
  color: #64748b;
  flex-wrap: wrap;
  gap: 8px;
}

.nc-footer-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nc-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.nc-meta-dot {
  color: #cbd5e1;
}

.btn-copy-notice {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-copy-notice:hover {
  background: #f1f5f9;
  color: #0d9488;
  border-color: #99f6e4;
}

/* Empty State */
.empty-feed-card {
  text-align: center;
  padding: 50px 20px;
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: #0d9488;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin: 0 auto 16px;
}

.empty-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 16px;
  line-height: 1.5;
}

.btn-reset-filters {
  background: #0d9488;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* ════════ Responsive ════════ */
@media (max-width: 992px) {
  .main-content {
    padding: 14px;
  }

  .executive-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-secondary-action {
    flex: 1;
    justify-content: center;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .feed-controls-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box-wrap {
    max-width: 100%;
  }

  .nc-header {
    flex-direction: column;
  }

  .nc-date-chip {
    align-self: flex-start;
  }
}

@media (max-width: 576px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>