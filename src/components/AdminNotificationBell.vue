<template>
  <div class="admin-bell-container" ref="bellContainer">
    <!-- 🔔 Notification Trigger Button -->
    <button 
      class="admin-bell-btn" 
      :class="{ 'has-unread': unseenCount > 0, 'is-active': isOpen }"
      @click="toggleDropdown"
      title="Admin Alerts & Notifications"
      aria-label="Admin Notifications"
    >
      <i class="fas fa-bell bell-icon" :class="{ 'ring-anim': unseenCount > 0 }"></i>
      <span v-if="unseenCount > 0" class="bell-badge">
        {{ unseenCount > 99 ? '99+' : unseenCount }}
      </span>
      <span v-if="unseenCount > 0" class="badge-ping"></span>
    </button>

    <!-- 📋 Notification Dropdown Card -->
    <transition name="dropdown-fade">
      <div v-if="isOpen" class="admin-notif-dropdown">
        <!-- Header -->
        <div class="notif-header">
          <div class="header-title-wrap">
            <div class="live-dot-pulse" :class="{ 'idle': unseenCount === 0 }"></div>
            <div class="title-text">
              <h3>Admin Notifications</h3>
              <span class="total-pill">
                {{ unseenCount > 0 ? `${unseenCount} New Alert${unseenCount === 1 ? '' : 's'}` : 'All caught up' }}
              </span>
            </div>
          </div>
          <div class="header-actions">
            <button 
              v-if="unseenCount > 0"
              class="btn-mark-all-seen" 
              @click.stop="markAllAsSeen"
              title="Mark all as seen"
            >
              <i class="fas fa-check-double"></i> Mark Seen
            </button>
            <button 
              class="btn-icon-action" 
              @click.stop="fetchNotifications(true)" 
              :disabled="loading"
              title="Refresh"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            </button>
            <button 
              class="btn-icon-action close-btn" 
              @click.stop="isOpen = false"
              title="Close"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Mode Bar (Unseen vs All) -->
        <div class="filter-controls-bar">
          <div class="mode-toggle">
            <button 
              class="mode-btn" 
              :class="{ active: viewMode === 'unseen' }"
              @click.stop="viewMode = 'unseen'"
            >
              <i class="fas fa-bell"></i> Unseen ({{ unseenCount }})
            </button>
            <button 
              class="mode-btn" 
              :class="{ active: viewMode === 'all' }"
              @click.stop="viewMode = 'all'"
            >
              <i class="fas fa-history"></i> Recent Active ({{ items.length }})
            </button>
          </div>
        </div>

        <!-- 4 Main Category Tabs -->
        <div class="notif-tabs-scroll">
          <div class="notif-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: activeCategory === 'all' }"
              @click.stop="activeCategory = 'all'"
            >
              <span>All</span>
              <span class="tab-count">{{ displayedItems.length }}</span>
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeCategory === 'leave' }"
              @click.stop="activeCategory = 'leave'"
            >
              <i class="fas fa-umbrella-beach"></i>
              <span>Leaves</span>
              <span class="tab-count" v-if="categoryCounts.leave">{{ categoryCounts.leave }}</span>
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeCategory === 'request_desk' }"
              @click.stop="activeCategory = 'request_desk'"
            >
              <i class="fas fa-headset"></i>
              <span>Request Desk</span>
              <span class="tab-count" v-if="categoryCounts.request_desk">{{ categoryCounts.request_desk }}</span>
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeCategory === 'resource_booking' }"
              @click.stop="activeCategory = 'resource_booking'"
            >
              <i class="fas fa-calendar-check"></i>
              <span>Resource Booking</span>
              <span class="tab-count" v-if="categoryCounts.resource_booking">{{ categoryCounts.resource_booking }}</span>
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeCategory === 'chat' }"
              @click.stop="activeCategory = 'chat'"
            >
              <i class="fas fa-comments"></i>
              <span>Chat</span>
              <span class="tab-count" v-if="categoryCounts.chat">{{ categoryCounts.chat }}</span>
            </button>
          </div>
        </div>

        <!-- Notification List -->
        <div class="notif-body">
          <div v-if="loading && items.length === 0" class="notif-loading">
            <i class="fas fa-circle-notch fa-spin"></i>
            <span>Loading notifications...</span>
          </div>

          <div v-else-if="filteredItems.length === 0" class="notif-empty">
            <div class="empty-icon-wrap">
              <i class="fas fa-check-circle"></i>
            </div>
            <h4>No {{ viewMode === 'unseen' ? 'New' : '' }} Notifications</h4>
            <p v-if="viewMode === 'unseen'">
              You're all caught up with leave applications, request desk, resource bookings, and chat!
            </p>
            <p v-else>
              No active notifications found in this category.
            </p>
          </div>

          <div v-else class="notif-list">
            <div 
              v-for="item in filteredItems" 
              :key="item.id" 
              class="notif-card"
              :class="[item.type, { 'is-unseen': isItemUnseen(item.id) }]"
              @click="handleCardClick(item)"
            >
              <div class="card-icon-col" :style="{ backgroundColor: item.color + '18', color: item.color }">
                <i :class="item.icon"></i>
              </div>
              
              <div class="card-content-col">
                <div class="card-top-row">
                  <div class="tags-group">
                    <span class="category-tag" :style="{ color: item.color, borderColor: item.color + '33', backgroundColor: item.color + '12' }">
                      {{ item.category_label }}
                    </span>
                    <span v-if="isItemUnseen(item.id)" class="new-pill">NEW</span>
                  </div>
                  <span class="card-time">
                    <i class="far fa-clock"></i> {{ item.time }}
                  </span>
                </div>
                
                <h4 class="card-title">{{ item.title }}</h4>
                <p class="card-desc">{{ item.description }}</p>
                
                <div class="card-footer-row">
                  <span class="card-user" v-if="item.user_name">
                    <i class="far fa-user"></i> {{ item.user_name }}
                  </span>
                  <span class="action-hint">
                    View & Action <i class="fas fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="notif-footer">
          <button 
            class="btn-footer-link" 
            @click="markAllAsSeen" 
            :disabled="unseenCount === 0"
          >
            <i class="fas fa-check-circle"></i> Clear Badge
          </button>
          <div class="footer-links">
            <span class="quick-link" @click="goTo('/pendingleaves')">Leaves</span>
            <span class="quick-link" @click="goTo('/RequestDesk')">Desk</span>
            <span class="quick-link" @click="goTo('/ResourceBooking')">Bookings</span>
            <span class="quick-link" @click="goTo('/rcahelp')">Chat</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import { toastSuccess, toastError, toastInfo } from '@/utils/toast.js'

export default {
  name: 'AdminNotificationBell',
  data() {
    return {
      isOpen: false,
      loading: false,
      viewMode: 'unseen', // 'unseen' or 'all'
      activeCategory: 'all',
      pollingTimer: null,
      seenIds: new Set(),
      counts: {
        leaves: 0,
        request_desk: 0,
        resource_bookings: 0,
        chat: 0
      },
      items: []
    }
  },
  computed: {
    unseenItems() {
      return this.items.filter(item => !this.seenIds.has(item.id))
    },
    unseenCount() {
      return this.unseenItems.length
    },
    displayedItems() {
      return this.viewMode === 'unseen' ? this.unseenItems : this.items
    },
    categoryCounts() {
      const source = this.displayedItems
      return {
        leave: source.filter(i => i.type === 'leave').length,
        request_desk: source.filter(i => i.type === 'request_desk').length,
        resource_booking: source.filter(i => i.type === 'resource_booking').length,
        chat: source.filter(i => i.type === 'chat').length
      }
    },
    filteredItems() {
      const source = this.displayedItems
      if (this.activeCategory === 'all') return source
      return source.filter(item => item.type === this.activeCategory)
    }
  },
  methods: {
    loadSeenIds() {
      try {
        const stored = localStorage.getItem('admin_seen_notifications_v2')
        if (stored) {
          const arr = JSON.parse(stored)
          if (Array.isArray(arr)) {
            this.seenIds = new Set(arr)
          }
        }
      } catch (e) {
        this.seenIds = new Set()
      }
    },
    saveSeenIds() {
      try {
        const arr = Array.from(this.seenIds).slice(-200)
        localStorage.setItem('admin_seen_notifications_v2', JSON.stringify(arr))
      } catch (e) {
        // ignore
      }
    },
    isItemUnseen(id) {
      return !this.seenIds.has(id)
    },
    markItemSeen(id) {
      this.seenIds.add(id)
      this.saveSeenIds()
    },
    markAllAsSeen() {
      this.items.forEach(item => {
        this.seenIds.add(item.id)
      })
      this.saveSeenIds()
      this.markChatReadBackend()
      toastSuccess('All notifications marked as seen')
    },
    toggleDropdown() {
      this.isOpen = !this.isOpen
      if (this.isOpen) {
        this.fetchNotifications(false)
      }
    },
    closeDropdown(e) {
      if (this.$refs.bellContainer && !this.$refs.bellContainer.contains(e.target)) {
        this.isOpen = false
      }
    },
    goTo(route) {
      this.isOpen = false
      if (this.$route.path !== route) {
        this.$router.push(route)
      }
    },
    handleCardClick(item) {
      this.markItemSeen(item.id)
      this.isOpen = false
      if (item.route) {
        if (this.$route.path !== item.route) {
          this.$router.push(item.route)
        }
      }
    },
    async fetchNotifications(showToast = false) {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token') || ''
      this.loading = true
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      try {
        let res = null
        const endpoints = [
          '/admin/notifications/summary',
          '/api/admin/notifications/summary',
          'https://employees.archenterprises.co.in/api/admin/notifications/summary',
          'https://employees.archenterprises.co.in/api/api/admin/notifications/summary'
        ]

        for (const ep of endpoints) {
          try {
            res = await axios.get(ep, { headers })
            if (res && res.data && res.data.counts) {
              break
            }
          } catch (e) {
            // try next endpoint
          }
        }

        if (res && res.data && res.data.counts) {
          this.counts = res.data.counts
          this.items = res.data.items || []

          if (showToast) {
            toastSuccess('Notifications refreshed')
          }
        }
      } catch (err) {
        console.error('Failed to fetch admin notifications:', err)
        if (showToast) {
          toastError('Failed to refresh notifications')
        }
      } finally {
        this.loading = false
      }
    },
    async markChatReadBackend() {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token') || ''
      if (!token) return

      const headers = { Authorization: `Bearer ${token}` }
      try {
        const endpoints = [
          '/admin/notifications/mark-read',
          '/api/admin/notifications/mark-read',
          'https://employees.archenterprises.co.in/api/admin/notifications/mark-read'
        ]
        for (const ep of endpoints) {
          try {
            await axios.post(ep, {}, { headers })
            break
          } catch (e) {
            // next
          }
        }
      } catch (err) {
        // silent
      }
    }
  },
  mounted() {
    this.loadSeenIds()
    this.fetchNotifications(false)
    document.addEventListener('click', this.closeDropdown)

    // Polling every 25 seconds
    this.pollingTimer = setInterval(() => {
      this.fetchNotifications(false)
    }, 25000)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdown)
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
    }
  }
}
</script>

<style scoped>
.admin-bell-container {
  position: relative;
  display: inline-block;
  user-select: none;
}

/* 🔔 Bell Button Trigger */
.admin-bell-btn {
  position: relative;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  color: #334155;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.admin-bell-btn:hover,
.admin-bell-btn.is-active {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.12);
}

.bell-icon {
  font-size: 1.15rem;
  transition: transform 0.2s ease;
}

.admin-bell-btn:hover .bell-icon {
  transform: rotate(12deg) scale(1.08);
}

/* Bell Badge */
.bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.45);
  z-index: 2;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.badge-ping {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background-color: #ef4444;
  opacity: 0.75;
  animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
  z-index: 1;
}

@keyframes ping {
  75%, 100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@keyframes popIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

@keyframes ring {
  0%, 100% { transform: rotate(0); }
  20%, 60% { transform: rotate(15deg); }
  40%, 80% { transform: rotate(-15deg); }
}

.ring-anim {
  animation: ring 1.2s ease infinite;
}

/* 📋 Dropdown Card */
.admin-notif-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 440px;
  max-width: calc(100vw - 24px);
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.08);
  border: 1px solid #f1f5f9;
  z-index: 99999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: #1e293b;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

/* Header */
.notif-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.live-dot-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulseDot 2s infinite;
}

.live-dot-pulse.idle {
  background: #64748b;
  animation: none;
  box-shadow: none;
}

@keyframes pulseDot {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.title-text h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
  line-height: 1.2;
}

.total-pill {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-mark-all-seen {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 5px 9px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.btn-mark-all-seen:hover {
  background: rgba(16, 185, 129, 0.35);
  color: #ffffff;
}

.btn-icon-action {
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: #f8fafc;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-icon-action:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Filter Controls Bar */
.filter-controls-bar {
  padding: 8px 16px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mode-toggle {
  display: flex;
  background: #e2e8f0;
  padding: 2px;
  border-radius: 10px;
  width: 100%;
  gap: 2px;
}

.mode-btn {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
}

/* Tabs */
.notif-tabs-scroll {
  padding: 8px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin;
}

.notif-tabs-scroll::-webkit-scrollbar {
  height: 4px;
}

.notif-tabs-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.notif-tabs {
  display: flex;
  gap: 6px;
}

.tab-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 4px 11px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tab-btn:hover {
  border-color: #cbd5e1;
  color: #1e293b;
  background: #f1f5f9;
}

.tab-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.tab-count {
  background: rgba(0, 0, 0, 0.08);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 10px;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Body / List */
.notif-body {
  max-height: 380px;
  min-height: 180px;
  overflow-y: auto;
  padding: 12px;
  scrollbar-width: thin;
}

.notif-body::-webkit-scrollbar {
  width: 5px;
}

.notif-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.notif-loading,
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
}

.notif-loading i {
  font-size: 1.8rem;
  color: #3b82f6;
  margin-bottom: 12px;
}

.empty-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin-bottom: 12px;
}

.notif-empty h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.notif-empty p {
  font-size: 0.82rem;
  color: #94a3b8;
  max-width: 280px;
}

/* Notification Card */
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notif-card {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.notif-card.is-unseen {
  background: #f8fafc;
  border-color: #93c5fd;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
}

.notif-card:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.card-icon-col {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.card-content-col {
  flex: 1;
  min-width: 0;
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.tags-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-tag {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid transparent;
}

.new-pill {
  background: #ef4444;
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  letter-spacing: 0.04em;
}

.card-time {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
}

.card-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 3px 0;
  line-height: 1.3;
}

.card-desc {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
}

.card-user {
  color: #475569;
  font-weight: 600;
}

.action-hint {
  color: #3b82f6;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.2s ease;
}

.notif-card:hover .action-hint {
  transform: translateX(2px);
}

/* Footer */
.notif-footer {
  padding: 12px 18px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
}

.btn-footer-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.15s;
}

.btn-footer-link:hover:not(:disabled) {
  background: #eff6ff;
  color: #1d4ed8;
}

.btn-footer-link:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quick-link {
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s;
}

.quick-link:hover {
  color: #0f172a;
  text-decoration: underline;
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

@media (max-width: 640px) {
  .admin-notif-dropdown {
    width: calc(100vw - 20px);
    right: -10px;
  }
}
</style>
