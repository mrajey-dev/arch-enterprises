<template>
  <div class="colleague-social-card">
    <!-- Card Header -->
    <div class="card-header">
      <h3>
        <i class="fas fa-share-nodes"></i> Colleague Social Profiles
      </h3>
      <div class="header-actions">
        <!-- Search input -->
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search colleague..."
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Filter tabs -->
        <div class="filter-tabs">
          <button
            class="tab-btn"
            :class="{ active: filterMode === 'all' }"
            @click="filterMode = 'all'"
          >
            All ({{ otherUsers.length }})
          </button>
          <button
            class="tab-btn"
            :class="{ active: filterMode === 'social' }"
            @click="filterMode = 'social'"
          >
            Connected ({{ withSocialCount }})
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="mini-spinner"></div>
      <p>Loading colleague profiles...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredUsers.length === 0" class="state-container">
      <i class="far fa-user-circle empty-icon"></i>
      <p v-if="searchQuery">No colleagues match "{{ searchQuery }}"</p>
      <p v-else>No colleague profiles found</p>
    </div>

    <!-- Contained List Grid (Scrolls vertically inside the card) -->
    <div v-else class="colleagues-list">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="colleague-row"
        :class="{ 'highlight-connected': hasAnySocial(user) }"
      >
        <!-- User Info -->
        <div class="user-identity">
          <div class="avatar-wrap">
            <img
              v-if="getAvatarUrl(user)"
              :src="getAvatarUrl(user)"
              :alt="user.name"
              class="avatar-img"
              @error="onAvatarError($event, user)"
            />
            <div
              v-else
              class="avatar-fallback"
              :style="{ backgroundColor: getAvatarColor(user.id) }"
            >
              {{ getInitials(user.name) }}
            </div>
          </div>

          <div class="user-details">
            <div class="name-line">
              <strong class="user-name" :title="user.name">{{ user.name }}</strong>
              <span class="dept-badge" v-if="user.department">{{ user.department }}</span>
            </div>
            <span class="user-handle" v-if="user.handle">@{{ user.handle }}</span>
            <span class="user-handle muted" v-else>{{ user.email || 'Team Member' }}</span>
          </div>
        </div>

        <!-- Social Media Action Icons -->
        <div class="social-links-wrap">
          <a
            v-if="formatUrl(user.linkedin)"
            :href="formatUrl(user.linkedin)"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link-btn linkedin"
            title="LinkedIn Profile"
          >
            <i class="fab fa-linkedin-in"></i>
          </a>

          <a
            v-if="formatUrl(user.instagram)"
            :href="formatUrl(user.instagram)"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link-btn instagram"
            title="Instagram Profile"
          >
            <i class="fab fa-instagram"></i>
          </a>

          <a
            v-if="formatUrl(user.youtube)"
            :href="formatUrl(user.youtube)"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link-btn youtube"
            title="YouTube Channel"
          >
            <i class="fab fa-youtube"></i>
          </a>

          <a
            v-if="formatUrl(user.portfolio)"
            :href="formatUrl(user.portfolio)"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link-btn portfolio"
            title="Portfolio / Website"
          >
            <i class="fas fa-globe"></i>
          </a>

          <span v-if="!hasAnySocial(user)" class="no-links-tag">
            No links
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ColleagueSocials',
  props: {
    currentUserId: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      users: [],
      loading: false,
      searchQuery: '',
      filterMode: 'all', // 'all' | 'social'
      avatarErrors: {}
    };
  },
  computed: {
    effectiveCurrentUserId() {
      if (this.currentUserId) return Number(this.currentUserId);
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          return Number(u.id) || null;
        }
      } catch (e) {}
      return null;
    },

    otherUsers() {
      const myId = this.effectiveCurrentUserId;
      return this.users.filter(u => {
        if (!u || !u.name) return false;
        if (myId && Number(u.id) === myId) return false;
        return true;
      });
    },

    withSocialCount() {
      return this.otherUsers.filter(u => this.hasAnySocial(u)).length;
    },

    filteredUsers() {
      let list = [...this.otherUsers];

      if (this.filterMode === 'social') {
        list = list.filter(u => this.hasAnySocial(u));
      }

      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(u => {
          const name = (u.name || '').toLowerCase();
          const handle = (u.handle || '').toLowerCase();
          const dept = (u.department || '').toLowerCase();
          return name.includes(q) || handle.includes(q) || dept.includes(q);
        });
      }

      // Prioritize colleagues who have social profiles, then sort alphabetically
      return list.sort((a, b) => {
        const aHas = this.hasAnySocial(a) ? 1 : 0;
        const bHas = this.hasAnySocial(b) ? 1 : 0;
        if (aHas !== bHas) return bHas - aHas;
        return (a.name || '').localeCompare(b.name || '');
      });
    }
  },
  methods: {
    async fetchColleagues() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (Array.isArray(res.data)) {
          this.users = res.data.map(u => {
            const cachedPhoto = localStorage.getItem(`profilePhoto_${u.id}`);
            return {
              ...u,
              finalPhoto: cachedPhoto || u.profile_photo || null
            };
          });
        }
      } catch (err) {
        console.error('Failed to fetch colleagues:', err);
      } finally {
        this.loading = false;
      }
    },

    formatUrl(url) {
      if (!url || typeof url !== 'string') return '';
      url = url.trim();
      if (url === 'null' || url === 'undefined' || url === '') return '';
      if (!/^https?:\/\//i.test(url)) {
        return 'https://' + url;
      }
      return url;
    },

    hasAnySocial(user) {
      return Boolean(
        this.formatUrl(user.linkedin) ||
        this.formatUrl(user.instagram) ||
        this.formatUrl(user.youtube) ||
        this.formatUrl(user.portfolio)
      );
    },

    getAvatarUrl(user) {
      if (this.avatarErrors[user.id]) return null;
      const photo = user.finalPhoto || user.profile_photo;
      if (!photo) return null;
      if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
        return photo;
      }
      if (photo.includes('/')) {
        return `https://employees.archenterprises.co.in/backend/public/storage/${photo}`;
      }
      return `https://employees.archenterprises.co.in/${photo}`;
    },

    onAvatarError(event, user) {
      this.avatarErrors[user.id] = true;
    },

    getInitials(name) {
      if (!name) return 'U';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    },

    getAvatarColor(id) {
      const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#6366f1'
      ];
      return colors[(Number(id) || 0) % colors.length];
    }
  },
  mounted() {
    this.fetchColleagues();
  }
};
</script>

<style scoped>
.colleague-social-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  box-sizing: border-box;
}

/* Card Header matching Dashboard widgets */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.card-header h3 i {
  color: #14b8a6;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  width: 200px;
}

.search-box i.fa-search {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #94a3b8;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  height: 32px;
  padding: 0 26px 0 28px;
  border-radius: 20px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 12px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.search-box input:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.15);
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 11px;
  cursor: pointer;
  padding: 2px;
}

.clear-btn:hover {
  color: #475569;
}

.filter-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 2px;
  border-radius: 20px;
  gap: 2px;
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn.active {
  background: #ffffff;
  color: #0f766e;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
}

/* Loading & Empty */
.state-container {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #64748b;
  font-size: 0.85rem;
}

.mini-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 8px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 2.2rem;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
  display: block;
}

/* Contained List Grid (2 columns on desktop, 1 on small screens) */
.colleagues-list {
  max-height: 380px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 10px;
  padding-right: 4px;
}

.colleagues-list::-webkit-scrollbar {
  width: 5px;
}

.colleagues-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.colleagues-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.colleagues-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Individual Colleague Row */
.colleague-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
}

.colleague-row:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.colleague-row.highlight-connected {
  border-left: 3px solid #14b8a6;
}

/* Identity section */
.user-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.avatar-wrap {
  flex-shrink: 0;
}

.avatar-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.avatar-fallback {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.user-name {
  font-size: 0.85rem;
  color: #1e293b;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.dept-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.user-handle {
  font-size: 0.72rem;
  color: #0f766e;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.user-handle.muted {
  color: #94a3b8;
  font-weight: 400;
}

/* Social links button row */
.social-links-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: 8px;
}

.social-link-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-link-btn.linkedin {
  background: #e0f2fe;
  color: #0284c7;
}

.social-link-btn.linkedin:hover {
  background: #0284c7;
  color: #ffffff;
  transform: scale(1.1);
}

.social-link-btn.instagram {
  background: #fdf2f8;
  color: #db2777;
}

.social-link-btn.instagram:hover {
  background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  color: #ffffff;
  transform: scale(1.1);
}

.social-link-btn.youtube {
  background: #fee2e2;
  color: #dc2626;
}

.social-link-btn.youtube:hover {
  background: #dc2626;
  color: #ffffff;
  transform: scale(1.1);
}

.social-link-btn.portfolio {
  background: #ccfbf1;
  color: #0f766e;
}

.social-link-btn.portfolio:hover {
  background: #0f766e;
  color: #ffffff;
  transform: scale(1.1);
}

.no-links-tag {
  font-size: 10px;
  color: #94a3b8;
  padding: 3px 8px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .colleague-social-card {
    padding: 1rem;
    border-radius: 16px;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .filter-tabs {
    width: 100%;
  }

  .tab-btn {
    flex: 1;
    text-align: center;
  }

  .colleagues-list {
    grid-template-columns: 1fr;
    max-height: 340px;
  }

  .user-name {
    max-width: 110px;
  }
}
</style>
