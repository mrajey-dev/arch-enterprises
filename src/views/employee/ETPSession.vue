<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="session-board-premium" v-if="!isMobile || !isSidebarVisible">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
        
          <div class="mobile-title">
            <i class="fas fa-chalkboard-teacher"></i>
            <span>ETP Ratings</span>
          </div>
          <button class="mobile-add-btn" @click="openAddSessionModal">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <div>
              <h1>Saturday ETP Ratings</h1>
              <p class="subtitle-modern">Rate sessions conducted by employees | Every Saturday</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-star"></i>
            <span>{{ totalSessions }} Sessions</span>
          </div>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card" @click="activeTab = 'sessions'">
            <i class="fas fa-calendar-week"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalSessions }}</span>
              <span class="stat-label">Sessions</span>
            </div>
          </div>
          <div class="stat-card" @click="activeTab = 'leaderboard'">
            <i class="fas fa-users"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalRatings }}</span>
              <span class="stat-label">Ratings</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-chart-line"></i>
            <div class="stat-info">
              <span class="stat-value">{{ avgRatingOverall }}</span>
              <span class="stat-label">Avg Rating</span>
            </div>
          </div>
          <div class="stat-card" @click="openAddSessionModal">
            <i class="fas fa-plus-circle"></i>
            <div class="stat-info">
              <span class="stat-value action-stat">+ New</span>
              <span class="stat-label">Add Session</span>
            </div>
          </div>
        </div>

        <!-- Tabs: Sessions List & Leaderboard - Mobile Optimized -->
        <div class="tabs-modern">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'sessions' }"
            @click="activeTab = 'sessions'"
          >
            <i class="fas fa-list"></i> <span class="tab-text">Sessions</span>
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'leaderboard' }"
            @click="activeTab = 'leaderboard'"
          >
            <i class="fas fa-trophy"></i> <span class="tab-text">Leaderboard</span>
          </button>
        </div>

        <!-- Sessions List Tab -->
        <div v-show="activeTab === 'sessions'">
          <!-- Filter Section - Mobile Optimized -->
          <div class="filter-section">
            <div class="search-wrapper">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                @input="debouncedSearch"
                placeholder="Search sessions..."
                class="search-input"
              >
            </div>
            <select v-model="selectedMonth" class="month-select" @change="loadSessions">
              <option value="">All Months</option>
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ isMobile ? month.short : month.name }}
              </option>
            </select>
          </div>

          <!-- Sessions Grid - Mobile Optimized -->
          <div class="sessions-section">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-chalkboard"></i>
                <span>Session History</span>
                <span class="record-count-mobile" v-if="isMobile">{{ sessions.length }}</span>
              </div>
              <button class="btn-add-small" @click="openAddSessionModal">
                <i class="fas fa-plus"></i> <span class="btn-text">Add</span>
              </button>
            </div>

            <div v-if="loading" class="loading-state">
              <i class="fas fa-spinner fa-pulse"></i>
              <p>Loading sessions...</p>
            </div>

            <div v-else-if="sessions.length" class="sessions-grid-premium">
              <div v-for="session in sessions" :key="session.id" class="session-card-premium" :class="{ 'mobile-card': isMobile }">
                <div class="card-accent" :style="{ background: session.accent_color || 'linear-gradient(135deg, #1e3c72, #2a5298)' }"></div>
                
                <div class="session-header" :class="{ 'mobile-header': isMobile }">
                  <div class="session-icon">
                    <i class="fas fa-chalkboard-teacher"></i>
                  </div>
                  <div class="session-title-wrap">
                    <h3>{{ truncateText(session.topic, isMobile ? 30 : 40) }}</h3>
                    <div class="session-meta">
                      <span><i class="fas fa-user"></i> {{ session.presenter_name }}</span>
                      <span><i class="fas fa-calendar-alt"></i> {{ formatDateShort(session.session_date) }}</span>
                    </div>
                  </div>
                  <div
                    class="session-actions"
                    v-if="session.created_by === currentUserId"
                  >
                    <button class="action-btn edit-btn" @click="editSession(session)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" @click="confirmDeleteSession(session)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>

                <!-- Key Points -->
                <div class="key-points" v-if="session.key_points">
                  <div class="points-label">
                    <i class="fas fa-lightbulb"></i> Key Points
                  </div>
                  <div class="key-points-content">
                    <pre class="key-points-text" :class="{ 'collapsed': !session.keyPointsExpanded && isLongText(session.key_points) }">
                      <span v-html="formatKeyPoints(session.key_points)"></span>
                    </pre>
                    <button 
                      v-if="isLongText(session.key_points)" 
                      class="read-more-btn"
                      @click="toggleKeyPoints(session)"
                    >
                      {{ session.keyPointsExpanded ? 'Read less' : 'Read more' }}
                      <i :class="session.keyPointsExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    </button>
                  </div>
                </div>

                <!-- Rating Section - Mobile Optimized -->
                <div class="rating-section" :class="{ 'mobile-rating': isMobile }">
                  <div class="rating-label">
                    <i class="fas fa-star"></i> Rate this session (1-5)
                  </div>
                  <div class="rating-input" :class="{ 'mobile-rating-input': isMobile }">
                    <div class="stars-input">
                      <span 
                        v-for="star in 5" 
                        :key="star"
                        class="star"
                        :class="{ 'filled': session.userRating && session.userRating >= star }"
                        @click="setRating(session, star)"
                      >
                        <i class="fas fa-star"></i>
                      </span>
                    </div>
                    <button 
                      v-if="session.userRating && session.userRating > 0 && !session.ratingSubmitted"
                      class="btn-submit-rating"
                      @click="submitRating(session)"
                      :disabled="ratingSubmitting === session.id"
                    >
                      <i v-if="ratingSubmitting === session.id" class="fas fa-spinner fa-pulse"></i>
                      Submit
                    </button>
                    <span v-if="session.userRatingSubmitted" class="rating-submitted-badge">
                      <i class="fas fa-check-circle"></i> {{ session.userRatingSubmitted }}/5
                    </span>
                  </div>
                </div>

                <!-- Individual Ratings List -->
                <div class="ratings-list-section" v-if="session.ratings && session.ratings.length > 0">
                  <div class="ratings-label" @click="toggleRatingsList(session)">
                    <i class="fas fa-users"></i>
                    <span>Reviews ({{ session.ratings.length }})</span>
                    <i class="fas fa-chevron-down" :class="{ 'rotated': session.ratingsVisible }"></i>
                  </div>
                  
                  <div class="ratings-list" :class="{ 'ratings-hidden': !session.ratingsVisible }">
                    <div 
                      v-for="rating in session.ratings" 
                      :key="rating.id" 
                      class="rating-item"
                      :class="{ 
                        'current-user-rating': rating.user_id === currentUserId,
                        'mobile-rating-item': isMobile 
                      }"
                    >
                      <div class="rating-user-info">
                        <i class="fas fa-user-circle"></i>
                        <span class="rating-user-name">{{ truncateText(rating.user_name || 'Anonymous', isMobile ? 15 : 25) }}</span>
                        <span class="rating-user-badge" v-if="rating.user_id === currentUserId">(You)</span>
                      </div>
                      <div class="rating-stars-display">
                        <i v-for="star in 5" :key="star" class="fas fa-star" :class="{ 'filled': rating.rating >= star }"></i>
                        <span class="rating-value-text">{{ rating.rating }}/5</span>
                      </div>
                      <div class="rating-date" v-if="!isMobile">
                        <i class="fas fa-clock"></i> {{ formatDateTime(rating.created_at) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Average Rating -->
                <div class="avg-rating" v-if="session.avg_rating" :class="{ 'mobile-avg': isMobile }">
                  <div class="avg-rating-stars">
                    <i class="fas fa-chart-simple"></i> Avg: 
                    <span class="rating-value">{{ session.avg_rating }}/5</span>
                    <span class="star-rating-display">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'filled': Math.round(session.avg_rating) >= n }"></i>
                    </span>
                  </div>
                  <span class="rating-count">({{ session.rating_count || 0 }})</span>
                </div>

                <div class="session-footer" :class="{ 'mobile-footer': isMobile }">
                  <div class="badge-duration" v-if="session.duration_minutes">
                    <i class="fas fa-clock"></i> {{ session.duration_minutes }} min
                  </div>
                  <div class="badge-presenter">
                    <i class="fas fa-user-circle"></i> {{ truncateText(session.presenter_name, isMobile ? 15 : 25) }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
              <i class="fas fa-calendar-times"></i>
              <h4>No Sessions Found</h4>
              <p>{{ searchQuery ? 'Try a different search' : 'Click "Add Session" to create your first Saturday session' }}</p>
              <button class="btn-primary-empty" @click="openAddSessionModal">
                <i class="fas fa-plus-circle"></i> Add First Session
              </button>
            </div>
          </div>
        </div>

        <!-- Leaderboard Tab - Mobile Optimized -->
        <div v-show="activeTab === 'leaderboard'" class="leaderboard-section">
          <div class="section-title-modern">
            <i class="fas fa-trophy"></i>
            <span>Employee Leaderboard</span>
          </div>
          
          <div v-if="loadingLeaderboard" class="loading-state">
            <i class="fas fa-spinner fa-pulse"></i>
            <p>Loading leaderboard...</p>
          </div>
          
          <div v-else-if="leaderboard.length" class="leaderboard-table-wrapper">
            <!-- Mobile Card View -->
            <div class="leaderboard-cards" v-if="isMobile">
              <div v-for="(employee, index) in leaderboard" :key="employee.presenter_name" class="leaderboard-card">
                <div class="card-rank">
                  <span v-if="index === 0" class="rank-badge gold">🥇</span>
                  <span v-else-if="index === 1" class="rank-badge silver">🥈</span>
                  <span v-else-if="index === 2" class="rank-badge bronze">🥉</span>
                  <span v-else class="rank-number">{{ index + 1 }}</span>
                </div>
                <div class="card-content">
                  <div class="presenter-name">
                    <i class="fas fa-user-circle"></i> {{ employee.presenter_name }}
                  </div>
                  <div class="card-stats">
                    <div class="stat-chip">
                      <span class="stat-label">Sessions</span>
                      <span class="stat-number">{{ employee.sessions_count }}</span>
                    </div>
                    <div class="stat-chip">
                      <span class="stat-label">Ratings</span>
                      <span class="stat-number">{{ employee.total_ratings_received || 0 }}</span>
                    </div>
                    <div class="stat-chip">
                      <span class="stat-label">Avg</span>
                      <span class="stat-number rating">{{ employee.avg_rating || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="progress-bar-mini">
                    <div class="progress-fill-mini" :style="{ width: ((employee.avg_rating || 0) / 5 * 100) + '%' }"></div>
                  </div>
                  <div class="stars-mini-display">
                    <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'filled': Math.round(employee.avg_rating) >= n }"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop Table View -->
            <table class="leaderboard-table" v-else>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Presenter</th>
                  <th>Sessions</th>
                  <th>Ratings</th>
                  <th>Average</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(employee, index) in leaderboard" :key="employee.presenter_name">
                  <td class="rank-cell">
                    <span v-if="index === 0" class="rank-badge gold">🥇 1</span>
                    <span v-else-if="index === 1" class="rank-badge silver">🥈 2</span>
                    <span v-else-if="index === 2" class="rank-badge bronze">🥉 3</span>
                    <span v-else class="rank-number">{{ index + 1 }}</span>
                  </td>
                  <td class="presenter-cell">
                    <i class="fas fa-user-circle"></i> {{ employee.presenter_name }}
                  </td>
                  <td>{{ employee.sessions_count }}</td>
                  <td>{{ employee.total_ratings_received || 0 }}</td>
                  <td class="rating-cell">
                    <span class="avg-rating-value">{{ employee.avg_rating || 'N/A' }}</span>
                    <span class="stars-mini">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'filled': Math.round(employee.avg_rating) >= n }"></i>
                    </span>
                  </td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: ((employee.avg_rating || 0) / 5 * 100) + '%' }"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
            <i class="fas fa-chart-simple"></i>
            <h4>No Data Available</h4>
            <p>Add sessions and ratings to see the leaderboard</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Form Modal - Mobile Optimized -->
    <div v-if="showSessionModal" class="modal-overlay" @click.self="closeSessionModal">
      <div class="modal-container-premium modal-form" :class="{ 'mobile-modal': isMobile }">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-edit"></i>
          </div>
          <h2>{{ editingSession ? 'Edit Session' : 'Add New Session' }}</h2>
          <button class="close-modal" @click="closeSessionModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSessionSubmit">
            <div class="form-row-grid" :class="{ 'mobile-grid': isMobile }">
              <div class="form-group">
                <label><i class="fas fa-heading"></i> Topic *</label>
                <input type="text" v-model="sessionForm.topic" placeholder="Enter topic" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-user"></i> Presenter *</label>
                <select v-model="sessionForm.presenter_name" required class="employee-select">
                  <option value="">Select Employee</option>
                  <option v-for="employee in employees" :key="employee.id" :value="employee.name">
                    {{ employee.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row-grid" :class="{ 'mobile-grid': isMobile }">
              <div class="form-group">
                <label><i class="fas fa-calendar-alt"></i> Date *</label>
                <input type="date" v-model="sessionForm.session_date" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-clock"></i> Duration (min)</label>
                <input type="number" v-model.number="sessionForm.duration_minutes" placeholder="60">
              </div>
            </div>

            <div class="form-group">
              <label><i class="fas fa-lightbulb"></i> Key Points</label>
              <textarea v-model="sessionForm.key_points" rows="4" placeholder="Enter key points line by line..."></textarea>
              <small class="form-hint">Press Enter for line breaks.</small>
            </div>

            <div class="form-group" v-if="!isMobile">
              <label><i class="fas fa-palette"></i> Accent Color</label>
              <input type="color" v-model="sessionForm.accent_color" class="color-picker">
            </div>

            <div class="modal-actions" :class="{ 'mobile-actions': isMobile }">
              <button type="button" class="btn-secondary" @click="closeSessionModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                <i v-if="submitting" class="fas fa-spinner fa-pulse"></i>
                <i v-else class="fas fa-save"></i>
                {{ submitting ? 'Saving...' : (editingSession ? 'Update' : 'Add') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal - Mobile Optimized -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-container-premium" :class="{ 'mobile-modal': isMobile }">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-trash-alt" style="color: #ef4444;"></i>
          </div>
          <h2>Confirm Deletion</h2>
          <button class="close-modal" @click="showDeleteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Delete <strong>{{ sessionToDelete?.topic }}</strong>? This will remove all ratings.</p>
          <div class="modal-actions" :class="{ 'mobile-actions': isMobile }" style="margin-top: 24px;">
            <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button class="btn-danger" @click="deleteSession" :disabled="deleting">
              <i v-if="deleting" class="fas fa-spinner fa-pulse"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import { toastSuccess, toastError } from "@/utils/toast.js";

const API_BASE = 'https://employees.archenterprises.co.in/api/api';

export default {
  name: "SaturdaySessionRatings",
  components: { Sidebar },
  data() {
    return {
      employees: [],
      isMobile: false,
      isSidebarVisible: true,
      activeTab: 'sessions',
      
      sessions: [],
      totalSessions: 0,
      totalRatings: 0,
      avgRatingOverall: '0.0',
      
      leaderboard: [],
      loadingLeaderboard: false,
      
      loading: false,
      submitting: false,
      deleting: false,
      ratingSubmitting: null,
      
      showSessionModal: false,
      showDeleteModal: false,
      sessionToDelete: null,
      
      searchQuery: '',
      searchTimeout: null,
      selectedMonth: '',
      
      months: [
        { value: '1', name: 'January', short: 'Jan' },
        { value: '2', name: 'February', short: 'Feb' },
        { value: '3', name: 'March', short: 'Mar' },
        { value: '4', name: 'April', short: 'Apr' },
        { value: '5', name: 'May', short: 'May' },
        { value: '6', name: 'June', short: 'Jun' },
        { value: '7', name: 'July', short: 'Jul' },
        { value: '8', name: 'August', short: 'Aug' },
        { value: '9', name: 'September', short: 'Sep' },
        { value: '10', name: 'October', short: 'Oct' },
        { value: '11', name: 'November', short: 'Nov' },
        { value: '12', name: 'December', short: 'Dec' }
      ],
      
      editingSession: null,
      sessionForm: {
        id: null,
        topic: '',
        presenter_name: '',
        session_date: new Date().toISOString().split('T')[0],
        duration_minutes: null,
        key_points: '',
        accent_color: '#2a5298'
      }
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadEmployees();
    this.loadSessions();
    this.loadLeaderboard();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  computed: {
    currentUserId() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.id || null;
    }
  },
  methods: {
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    toggleRatingsList(session) {
      if (this.isMobile) {
        session.ratingsVisible = !session.ratingsVisible;
      }
    },
    openAddSessionModal() {
      this.resetSessionForm();
      this.showSessionModal = true;
    },
    
    closeSessionModal() {
      this.showSessionModal = false;
      this.resetSessionForm();
    },
    
    async loadEmployees() {
      try {
        const response = await fetch(`${API_BASE}/employees`);
        const data = await response.json();
        this.employees = data;
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    },
    
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },

    async loadSessions() {
      this.loading = true;
      try {
        let url = `${API_BASE}/sessions`;
        const params = new URLSearchParams();
        if (this.searchQuery) params.append('search', this.searchQuery);
        if (this.selectedMonth) params.append('month', this.selectedMonth);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          this.sessions = data.data.map(session => ({
            ...session,
            userRating: null,
            ratingSubmitted: false,
            userRatingSubmitted: null,
            keyPointsExpanded: false,
            ratingsVisible: false,
            ratings: []
          }));
          this.totalSessions = data.total || this.sessions.length;
          this.totalRatings = data.total_ratings || 0;
          this.avgRatingOverall = data.avg_rating_overall || '0.0';
          
          await this.loadUserRatings();
          await this.loadRatingsFromDB();
        } else {
          toastError('Failed to load sessions');
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        toastError('Network error while loading sessions');
      } finally {
        this.loading = false;
      }
    },

    async loadUserRatings() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user.id;
        const response = await fetch(`${API_BASE}/user-ratings?user_id=${userId}`);
        const data = await response.json();
        
        if (data.success && data.ratings) {
          this.sessions.forEach(session => {
            const userRating = data.ratings.find(r => r.session_id === session.id);
            if (userRating) {
              session.userRating = userRating.rating;
              session.ratingSubmitted = true;
              session.userRatingSubmitted = userRating.rating;
            }
          });
        }
      } catch (error) {
        console.error('Error loading user ratings:', error);
      }
    },

    async loadRatingsFromDB() {
      try {
        const response = await fetch(`${API_BASE}/session-ratings`);
        const data = await response.json();
        
        if (data.success && data.ratings) {
          const ratingsBySession = {};
          data.ratings.forEach(rating => {
            if (!ratingsBySession[rating.session_id]) {
              ratingsBySession[rating.session_id] = [];
            }
            ratingsBySession[rating.session_id].push({
              id: rating.id,
              rating: rating.rating,
              user_id: rating.user_id,
              user_name: rating.user_name || 'Anonymous User',
              created_at: rating.created_at
            });
          });
          
          this.sessions.forEach(session => {
            session.ratings = ratingsBySession[session.id] || [];
            session.ratings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            if (session.ratings.length > 0) {
              const sum = session.ratings.reduce((acc, r) => acc + r.rating, 0);
              session.avg_rating = (sum / session.ratings.length).toFixed(1);
              session.rating_count = session.ratings.length;
            }
          });
        }
      } catch (error) {
        console.error('Error loading ratings:', error);
      }
    },

    async loadLeaderboard() {
      this.loadingLeaderboard = true;
      try {
        const response = await fetch(`${API_BASE}/leaderboard`);
        const data = await response.json();
        
        if (data.success) {
          this.leaderboard = data.data;
        } else {
          toastError('Failed to load leaderboard');
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        toastError('Network error while loading leaderboard');
      } finally {
        this.loadingLeaderboard = false;
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.loadSessions();
      }, 500);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    formatDateShort(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    isLongText(text) {
      if (!text) return false;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      return lines.length > 3;
    },

    toggleKeyPoints(session) {
      session.keyPointsExpanded = !session.keyPointsExpanded;
    },

    formatKeyPoints(text) {
      if (!text) return '';
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      return escaped.replace(/\r?\n/g, '<br>');
    },

    setRating(session, rating) {
      if (session.ratingSubmitted) {
        toastError('You have already rated this session');
        return;
      }
      session.userRating = rating;
    },

    async submitRating(session) {
      if (!session.userRating || session.userRating < 1 || session.userRating > 5) {
        toastError('Please select a rating from 1 to 5');
        return;
      }
      
      this.ratingSubmitting = session.id;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user.id;
        const userName = user.name;
        
        const response = await fetch(`${API_BASE}/ratings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: session.id,
            user_id: userId,
            user_name: userName,
            rating: session.userRating
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          toastSuccess(`Thank you! You rated "${session.topic}" ${session.userRating}/5`);
          session.ratingSubmitted = true;
          session.userRatingSubmitted = session.userRating;
          
          await this.loadSessions();
          await this.loadLeaderboard();
        } else {
          toastError(data.message || 'Failed to submit rating');
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
        toastError('Network error while submitting rating');
      } finally {
        this.ratingSubmitting = null;
      }
    },

    resetSessionForm() {
      this.editingSession = null;
      this.sessionForm = {
        id: null,
        topic: '',
        presenter_name: '',
        session_date: new Date().toISOString().split('T')[0],
        duration_minutes: null,
        key_points: '',
        accent_color: '#2a5298'
      };
    },

    editSession(session) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (session.created_by !== user.id) {
        toastError('You can edit only your own sessions');
        return;
      }
      this.editingSession = session;
      this.sessionForm = {
        id: session.id,
        topic: session.topic,
        presenter_name: session.presenter_name,
        session_date: session.session_date,
        duration_minutes: session.duration_minutes,
        key_points: session.key_points || '',
        accent_color: session.accent_color || '#2a5298'
      };
      this.showSessionModal = true;
    },

    async handleSessionSubmit() {
      if (!this.sessionForm.topic || !this.sessionForm.presenter_name || !this.sessionForm.session_date) {
        toastError('Please fill required fields: Topic, Presenter Name, and Session Date');
        return;
      }
      this.submitting = true;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const payload = {
          ...this.sessionForm,
          created_by: user.id
        };
        const url = this.editingSession
          ? `${API_BASE}/sessions/${this.editingSession.id}`
          : `${API_BASE}/sessions`;
        const method = this.editingSession ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
          toastSuccess(this.editingSession ? 'Session updated successfully!' : 'Session added successfully!');
          this.closeSessionModal();
          await this.loadSessions();
          await this.loadLeaderboard();
        } else {
          toastError(data.message || 'Operation failed');
        }
      } catch (error) {
        console.error('Error saving session:', error);
        toastError('Network error');
      } finally {
        this.submitting = false;
      }
    },

    confirmDeleteSession(session) {
      this.sessionToDelete = session;
      this.showDeleteModal = true;
    },

    async deleteSession() {
      if (!this.sessionToDelete) return;
      this.deleting = true;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_BASE}/sessions/${this.sessionToDelete.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ created_by: user.id })
        });
        const data = await response.json();
        if (data.success) {
          toastSuccess(`Session "${this.sessionToDelete.topic}" deleted successfully`);
          await this.loadSessions();
          await this.loadLeaderboard();
          this.showDeleteModal = false;
          this.sessionToDelete = null;
        } else {
          toastError(data.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error deleting session:', error);
        toastError('Network error');
      } finally {
        this.deleting = false;
      }
    }
  }
}
</script>

<style scoped>
/* Base Layout */
.layout {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f4f7fc;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.session-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
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
  color: var(--dark, #1a1a2e);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark, #1a1a2e);
}

.mobile-title i {
  color: #2a5298;
}

.mobile-add-btn {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
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

/* Header */
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
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
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

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #2a5298;
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:last-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
}

.stat-card:active {
  transform: scale(0.97);
}

.stat-card i {
  font-size: 32px;
  color: #2a5298;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.action-stat {
  font-size: 20px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Tabs */
.tabs-modern {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px 12px 0 0;
}

.tab-btn i {
  margin-right: 8px;
}

.tab-btn.active {
  color: #2a5298;
  background: #eef2ff;
  border-bottom: 3px solid #2a5298;
}

.tab-text {
  display: inline;
}

/* Filter Section */
.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #f9fafb;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #2a5298;
  background: white;
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
}

.month-select {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #f9fafb;
  cursor: pointer;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
  justify-content: space-between;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-count-mobile {
  background: #2a5298;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 4px;
}

.btn-add-small {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  border: none;
  padding: 6px 14px;
  border-radius: 30px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add-small:active {
  transform: scale(0.95);
}

.btn-text {
  display: inline;
}

/* Sessions Grid */
.sessions-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.session-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.session-card-premium.mobile-card {
  border-radius: 16px;
}

.session-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.12);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.session-header {
  display: flex;
  padding: 18px;
  gap: 14px;
  align-items: flex-start;
  background: #fafbfc;
  border-bottom: 1px solid #eef2f6;
}

.session-header.mobile-header {
  flex-direction: column;
  align-items: stretch;
  padding: 14px;
}

.session-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #2a5298;
}

.session-title-wrap {
  flex: 1;
}

.session-title-wrap h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.session-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: #6c757d;
}

.session-meta i {
  margin-right: 4px;
}

.session-actions {
  display: flex;
  gap: 6px;
}

.session-actions .action-btn:active {
  transform: scale(0.9);
}

.action-btn {
  background: transparent;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 16px;
}

.edit-btn { color: #f59e0b; }
.edit-btn:hover { background: #fed7aa; }
.delete-btn { color: #ef4444; }
.delete-btn:hover { background: #fee2e2; }

/* Key Points */
.key-points {
  padding: 14px 18px;
  background: #f0fdf4;
  border-bottom: 1px solid #dcfce7;
}

.points-label {
  font-size: 11px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 8px;
}

.key-points-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.key-points-text {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: #14532d;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  background: transparent;
  border: none;
  padding: 0;
}

.key-points-text.collapsed {
  max-height: calc(1.5em * 3 + 12px);
  overflow: hidden;
  position: relative;
}

.key-points-text.collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(to bottom, transparent, #f0fdf4);
  pointer-events: none;
}

.read-more-btn {
  background: transparent;
  border: none;
  color: #2a5298;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 16px;
  transition: all 0.2s;
  width: fit-content;
}

.read-more-btn:active {
  transform: scale(0.95);
}

/* Rating Section */
.rating-section {
  padding: 14px 18px;
  background: #fffbeb;
  border-bottom: 1px solid #fde68a;
}

.rating-section.mobile-rating {
  padding: 12px 14px;
}

.rating-label {
  font-size: 12px;
  font-weight: 600;
  color: #b45309;
  margin-bottom: 10px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.rating-input.mobile-rating-input {
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.stars-input {
  display: flex;
  gap: 6px;
}

.star {
  cursor: pointer;
  font-size: 22px;
  color: #d1d5db;
  transition: 0.2s;
}

.star.filled {
  color: #fbbf24;
}

.star:active {
  transform: scale(0.9);
}

.btn-submit-rating {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  padding: 6px 16px;
  border-radius: 30px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.btn-submit-rating:active {
  transform: scale(0.95);
}

.rating-submitted-badge {
  font-size: 12px;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Individual Ratings List */
.ratings-list-section {
  padding: 12px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.ratings-label {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.ratings-label .fa-chevron-down {
  transition: transform 0.3s ease;
  margin-left: auto;
}

.ratings-label .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.ratings-count-badge {
  background: #cbd5e1;
  color: #1e293b;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.ratings-list.ratings-hidden {
  display: none;
}

.rating-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 14px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.rating-item.mobile-rating-item {
  flex-direction: column;
  align-items: flex-start;
}

.rating-item.current-user-rating {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.rating-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}

.rating-user-info i {
  color: #2a5298;
  font-size: 16px;
}

.rating-user-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.rating-user-badge {
  font-size: 11px;
  color: #3b82f6;
  font-weight: 500;
}

.rating-stars-display {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-stars-display i {
  font-size: 14px;
  color: #d1d5db;
}

.rating-stars-display i.filled {
  color: #fbbf24;
}

.rating-value-text {
  font-size: 12px;
  font-weight: 600;
  color: #2a5298;
  margin-left: 6px;
}

.rating-date {
  font-size: 10px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Average Rating */
.avg-rating {
  padding: 10px 18px;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.avg-rating.mobile-avg {
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.avg-rating-stars {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rating-value {
  font-weight: 700;
  color: #2a5298;
}

.star-rating-display {
  display: inline-flex;
  gap: 2px;
  margin-left: 4px;
}

.star-rating-display i {
  font-size: 12px;
  color: #d1d5db;
}

.star-rating-display i.filled {
  color: #fbbf24;
}

.rating-count {
  font-size: 11px;
  color: #6b7280;
}

/* Session Footer */
.session-footer {
  padding: 10px 18px;
  display: flex;
  gap: 16px;
  background: #f9fafb;
  flex-wrap: wrap;
}

.session-footer.mobile-footer {
  padding: 8px 14px;
  gap: 10px;
}

.badge-duration, .badge-presenter {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 30px;
  background: #eef2ff;
  color: #1e40af;
}

/* Leaderboard */
.leaderboard-section {
  margin-top: 16px;
}

.leaderboard-table-wrapper {
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.leaderboard-table th {
  text-align: left;
  padding: 16px;
  background: #f8fafc;
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
}

.leaderboard-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

/* Leaderboard Mobile Cards */
.leaderboard-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.leaderboard-card {
  display: flex;
  gap: 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-rank {
  flex-shrink: 0;
}

.rank-badge {
  font-size: 28px;
}

.rank-number {
  font-weight: 600;
  color: #6b7280;
  font-size: 20px;
}

.card-content {
  flex: 1;
}

.presenter-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 8px;
}

.presenter-name i {
  margin-right: 6px;
  color: #2a5298;
}

.card-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 9px;
  color: #6b7280;
  text-transform: uppercase;
}

.stat-number {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.stat-number.rating {
  color: #2a5298;
}

.progress-bar-mini {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.3s;
}

.stars-mini-display {
  display: flex;
  gap: 2px;
}

.stars-mini-display i {
  font-size: 12px;
  color: #d1d5db;
}

.stars-mini-display i.filled {
  color: #fbbf24;
}

.rank-cell {
  width: 70px;
}

.rank-badge.gold {
  background: #fef3c7;
  color: #92400e;
}

.rank-badge.silver {
  background: #e5e7eb;
  color: #4b5563;
}

.rank-badge.bronze {
  background: #fed7aa;
  color: #9a3412;
}

.presenter-cell i {
  margin-right: 8px;
  color: #2a5298;
}

.rating-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.avg-rating-value {
  font-weight: 700;
  color: #2a5298;
}

.stars-mini {
  display: inline-flex;
  gap: 2px;
}

.stars-mini i {
  font-size: 12px;
  color: #d1d5db;
}

.stars-mini i.filled {
  color: #fbbf24;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 4px;
  transition: width 0.3s;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container-premium {
  background: white;
  width: 90%;
  max-width: 650px;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.modal-container-premium.mobile-modal {
  max-width: 95%;
  border-radius: 24px;
}

.modal-container-premium.modal-form {
  max-width: 700px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.mobile-modal .modal-header {
  padding: 16px 20px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  margin-left: 12px;
}

.mobile-modal .modal-header h2 {
  font-size: 17px;
}

.modal-icon {
  font-size: 28px;
  color: #2a5298;
}

.close-modal {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
  transition: 0.2s;
}

.close-modal:active {
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.mobile-modal .modal-body {
  padding: 16px;
}

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 18px;
}

.form-row-grid.mobile-grid {
  grid-template-columns: 1fr;
  gap: 0;
}

.form-group {
  margin-bottom: 18px;
}

.mobile-grid .form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.mobile-modal .form-group label {
  font-size: 13px;
}

.form-group input, 
.form-group textarea,
.employee-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  font-family: inherit;
  transition: 0.2s;
  font-size: 14px;
}

.mobile-modal .form-group input,
.mobile-modal .form-group textarea,
.mobile-modal .employee-select {
  font-size: 16px;
  padding: 10px 12px;
}

.form-group textarea {
  resize: vertical;
  line-height: 1.5;
}

.form-group input:focus, 
.form-group textarea:focus,
.employee-select:focus {
  outline: none;
  border-color: #2a5298;
  box-shadow: 0 0 0 2px rgba(42, 82, 152, 0.2);
}

.form-hint {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.color-picker {
  height: 48px;
  padding: 4px;
}

.employee-select {
  background-color: white;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions.mobile-actions {
  flex-direction: column;
}

.modal-actions.mobile-actions button {
  width: 100%;
  justify-content: center;
  padding: 14px;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
}

.btn-primary:active {
  transform: scale(0.97);
}

.btn-secondary {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-secondary:active {
  transform: scale(0.97);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:active {
  transform: scale(0.97);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 28px;
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

.btn-primary-empty {
  margin-top: 20px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  border: none;
  padding: 10px 24px;
  border-radius: 40px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content { flex-direction: column; padding: 12px; }
  .session-board-premium { padding: 16px; border-radius: 20px; }
  .sessions-grid-premium { grid-template-columns: 1fr; gap: 16px; }
  .form-row-grid { grid-template-columns: 1fr; gap: 0; }
  .stats-bar { grid-template-columns: 1fr 1fr; gap: 10px; }
  .filter-section { flex-direction: column; gap: 10px; }
  .search-wrapper { max-width: 100%; }
  
  .mobile-header { display: flex; }
  .content-header-modern { display: none; }
  
  .leaderboard-table { display: none; }
  .leaderboard-cards { display: flex; }
  
  .tab-text { display: inline; }
  .btn-text { display: none; }
  .btn-add-small { padding: 6px 12px; }
  
  .modal-container-premium { width: 95%; }
  .modal-header h2 { font-size: 18px; }
  .rating-item { flex-direction: column; align-items: flex-start; }
  .rating-user-info { min-width: auto; }
}

@media (max-width: 480px) {
  .main-content { padding: 8px; }
  .session-board-premium { padding: 12px; border-radius: 16px; }
  .mobile-title { font-size: 16px; }
  .mobile-add-btn { width: 32px; height: 32px; font-size: 14px; }
  .stats-bar { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card { padding: 12px; flex-direction: column; text-align: center; gap: 6px; }
  .stat-card i { font-size: 24px; }
  .stat-value { font-size: 22px; }
  .action-stat { font-size: 16px; }
  .stat-label { font-size: 10px; }
  
  .session-card-premium.mobile-card { border-radius: 14px; }
  .session-header.mobile-header { padding: 12px; }
  .session-title-wrap h3 { font-size: 15px; }
  
  .rating-section.mobile-rating { padding: 10px 12px; }
  .rating-input.mobile-rating-input { gap: 8px; }
  .star { font-size: 18px; }
  
  .rating-item.mobile-rating-item { padding: 8px 12px; }
  .leaderboard-card { padding: 12px; }
  .card-rank .rank-badge { font-size: 22px; }
  .presenter-name { font-size: 13px; }
  .stat-chip { padding: 2px 8px; }
  .stat-number { font-size: 12px; }
  
  .modal-header h2 { font-size: 16px; }
  .modal-icon { font-size: 24px; }
  .modal-body { padding: 12px; }
  
  .empty-state-premium i { font-size: 40px; }
  .empty-state-premium h4 { font-size: 15px; }
  .search-input { font-size: 15px; padding: 10px 12px 10px 36px; }
}
</style>