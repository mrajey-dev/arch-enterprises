<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="session-board-premium" v-if="!isMobile || !isSidebarVisible">
        <!-- 📱 Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-chalkboard-teacher"></i>
            <span>Saturday ETP Ratings</span>
          </div>
          <button class="mobile-add-btn" @click="openAddSessionModal" title="Add Session">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- 🏢 Desktop Header Banner -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <div>
              <div class="header-tag-row">
                <span class="header-badge-sub">Employee Training Program</span>
                <span class="header-schedule-tag"><i class="fas fa-calendar-check"></i> Every Saturday</span>
              </div>
              <h1>Saturday ETP Ratings</h1>
              <p class="subtitle-modern">Rate, review, and celebrate learning sessions conducted by team members</p>
            </div>
          </div>
          <div class="header-right-actions">
            <div class="stats-badge-header">
              <i class="fas fa-star text-gold"></i>
              <span><strong>{{ totalSessions }}</strong> Sessions Tracked</span>
            </div>
            <button class="btn-primary-header" @click="openAddSessionModal">
              <i class="fas fa-plus-circle"></i>
              <span>Add New Session</span>
            </button>
          </div>
        </div>

        <!-- 📊 Stats Overview Bar -->
        <div class="stats-bar">
          <div class="stat-card" :class="{ 'card-active': activeTab === 'sessions' }" @click="activeTab = 'sessions'">
            <div class="stat-icon-wrap blue">
              <i class="fas fa-calendar-week"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalSessions }}</span>
              <span class="stat-label">Total Sessions</span>
            </div>
          </div>

          <div class="stat-card" :class="{ 'card-active': activeTab === 'leaderboard' }" @click="activeTab = 'leaderboard'">
            <div class="stat-icon-wrap indigo">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalRatings }}</span>
              <span class="stat-label">Submitted Ratings</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap amber">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ avgRatingOverall }}<span class="max-rate">/5</span></span>
              <span class="stat-label">Overall Average</span>
            </div>
          </div>

          <div class="stat-card add-stat-card" @click="openAddSessionModal">
            <div class="stat-icon-wrap green">
              <i class="fas fa-plus"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value action-stat">New Session</span>
              <span class="stat-label">Click to conduct</span>
            </div>
          </div>
        </div>

        <!-- 🗂️ TABS BAR (Cleanly Separated & Modern Segmented Pill Style) -->
        <div class="etp-tabs-bar-container">
          <div class="etp-segmented-tabs">
            <button 
              type="button"
              class="tab-btn" 
              :class="{ active: activeTab === 'sessions' }"
              @click="activeTab = 'sessions'"
            >
              <i class="fas fa-chalkboard"></i>
              <span class="tab-text">Sessions List</span>
              <span class="tab-badge-counter">{{ sessions.length }}</span>
            </button>

            <button 
              type="button"
              class="tab-btn" 
              :class="{ active: activeTab === 'leaderboard' }"
              @click="activeTab = 'leaderboard'"
            >
              <i class="fas fa-trophy"></i>
              <span class="tab-text">Leaderboard</span>
              <span class="tab-badge-counter">{{ leaderboard.length }}</span>
            </button>
          </div>

          <!-- Quick Right Info in Tab Bar -->
          <div class="tab-bar-right-info" v-if="!isMobile">
            <span class="live-pulse-dot"></span>
            <span class="tab-live-text">{{ activeTab === 'sessions' ? 'Viewing Saturday Sessions' : 'Presenter Rankings' }}</span>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- TAB 1: SESSIONS LIST VIEW                              -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div v-show="activeTab === 'sessions'" class="tab-pane-transition">
          
          <!-- 🔍 Filter & Search Toolbar (Distinct & Separated Card) -->
          <div class="filter-toolbar-card">
            <div class="toolbar-left">
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  @input="debouncedSearch"
                  placeholder="Search by topic, presenter name, or key point..."
                  class="search-input"
                >
                <button v-if="searchQuery" type="button" class="btn-clear-search" @click="searchQuery = ''; loadSessions()">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="select-month-wrapper">
                <i class="fas fa-calendar-alt select-icon"></i>
                <select v-model="selectedMonth" class="month-select" @change="loadSessions">
                  <option value="">All Months</option>
                  <option v-for="month in months" :key="month.value" :value="month.value">
                    {{ isMobile ? month.short : month.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="toolbar-right">
              <span class="results-counter-pill">
                <i class="fas fa-layer-group"></i> {{ sessions.length }} Session{{ sessions.length === 1 ? '' : 's' }}
              </span>
              <button class="btn-add-inline" @click="openAddSessionModal">
                <i class="fas fa-plus"></i>
                <span>Add Session</span>
              </button>
            </div>
          </div>

          <!-- 📋 Sessions Section Header -->
          <div class="sessions-section">
            <div class="section-title-modern">
              <div class="title-left">
                <span class="section-indicator-dot"></span>
                <span>Saturday Sessions Archive</span>
              </div>
              <span class="archive-date-hint">Updated weekly</span>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <i class="fas fa-circle-notch fa-spin"></i>
              <p>Loading Saturday ETP sessions...</p>
            </div>

            <!-- Sessions Grid -->
            <div v-else-if="sessions.length" class="sessions-grid-premium">
              <div 
                v-for="session in sessions" 
                :key="session.id" 
                class="session-card-premium" 
                :class="{ 'mobile-card': isMobile }"
              >
                <!-- Top Color Accent Stripe -->
                <div class="card-accent" :style="{ background: session.accent_color || 'linear-gradient(135deg, #1e3c72, #2a5298)' }"></div>
                
                <!-- Card Header -->
                <div class="session-card-header">
                  <div class="session-card-title-row">
                    <div class="session-icon" :style="{ background: getLightAccent(session.accent_color) }">
                      <i class="fas fa-chalkboard-teacher" :style="{ color: session.accent_color || '#2a5298' }"></i>
                    </div>
                    <div class="session-title-wrap">
                      <h3 :title="session.topic">{{ session.topic }}</h3>
                      <div class="session-meta">
                        <span class="meta-tag presenter">
                          <i class="fas fa-user-circle"></i> {{ session.presenter_name }}
                        </span>
                        <span class="meta-tag date">
                          <i class="fas fa-calendar-alt"></i> {{ formatDateShort(session.session_date) }}
                        </span>
                        <span class="meta-tag duration" v-if="session.duration_minutes">
                          <i class="fas fa-clock"></i> {{ session.duration_minutes }} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Creator Action Buttons -->
                  <div
                    class="session-actions"
                    v-if="session.created_by === currentUserId"
                  >
                    <button class="action-btn edit-btn" @click="editSession(session)" title="Edit Session">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" @click="confirmDeleteSession(session)" title="Delete Session">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>

                <!-- Key Points Block -->
                <div class="key-points-wrapper" v-if="session.key_points">
                  <div class="points-header">
                    <i class="fas fa-lightbulb"></i>
                    <span>Key Takeaways & Highlights</span>
                  </div>
                  <div class="key-points-body">
                    <div class="key-points-text" :class="{ 'collapsed': !session.keyPointsExpanded && isLongText(session.key_points) }">
                      <span v-html="formatKeyPoints(session.key_points)"></span>
                    </div>
                    <button 
                      v-if="isLongText(session.key_points)" 
                      type="button"
                      class="read-more-btn"
                      @click="toggleKeyPoints(session)"
                    >
                      {{ session.keyPointsExpanded ? 'Show less' : 'Read full key points' }}
                      <i :class="session.keyPointsExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    </button>
                  </div>
                </div>

                <!-- Rating Section -->
                <div class="rating-section-card">
                  <div class="rating-header-row">
                    <span class="rating-label">
                      <i class="fas fa-star text-gold"></i> Your Rating
                    </span>
                    <span v-if="session.userRatingSubmitted" class="rating-submitted-badge">
                      <i class="fas fa-check-circle"></i> Rated {{ session.userRatingSubmitted }}/5
                    </span>
                  </div>

                  <div class="rating-input-row">
                    <div class="stars-input-wrap">
                      <span 
                        v-for="star in 5" 
                        :key="star"
                        class="star"
                        :class="{ 'filled': session.userRating && session.userRating >= star, 'disabled': session.ratingSubmitted }"
                        @click="setRating(session, star)"
                        :title="`Rate ${star} star${star > 1 ? 's' : ''}`"
                      >
                        <i class="fas fa-star"></i>
                      </span>
                    </div>

                    <button 
                      v-if="session.userRating && session.userRating > 0 && !session.ratingSubmitted"
                      type="button"
                      class="btn-submit-rating"
                      @click="submitRating(session)"
                      :disabled="ratingSubmitting === session.id"
                    >
                      <i v-if="ratingSubmitting === session.id" class="fas fa-spinner fa-pulse"></i>
                      <i v-else class="fas fa-paper-plane"></i>
                      <span>Submit {{ session.userRating }}/5</span>
                    </button>
                  </div>
                </div>

                <!-- Individual Ratings Reviews Drawer -->
                <div class="ratings-list-section" v-if="session.ratings && session.ratings.length > 0">
                  <div class="ratings-label-bar" @click="toggleRatingsList(session)">
                    <div class="reviews-title">
                      <i class="fas fa-comments"></i>
                      <span>Peer Reviews & Ratings ({{ session.ratings.length }})</span>
                    </div>
                    <div class="reviews-toggle-icon">
                      <i class="fas fa-chevron-down" :class="{ 'rotated': session.ratingsVisible }"></i>
                    </div>
                  </div>
                  
                  <div class="ratings-list" :class="{ 'ratings-hidden': !session.ratingsVisible }">
                    <div 
                      v-for="rating in session.ratings" 
                      :key="rating.id" 
                      class="rating-item"
                      :class="{ 'current-user-rating': rating.user_id === currentUserId }"
                    >
                      <div class="rating-user-info">
                        <i class="fas fa-user-circle"></i>
                        <span class="rating-user-name">{{ rating.user_name || 'Anonymous User' }}</span>
                        <span class="rating-user-badge" v-if="rating.user_id === currentUserId">You</span>
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

                <!-- Card Footer with Overall Rating -->
                <div class="session-card-footer">
                  <div class="avg-rating-pill" v-if="session.avg_rating">
                    <i class="fas fa-chart-simple"></i>
                    <span class="rating-value">Avg: <strong>{{ session.avg_rating }}</strong>/5</span>
                    <span class="star-rating-display">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'filled': Math.round(session.avg_rating) >= n }"></i>
                    </span>
                    <span class="rating-count">({{ session.rating_count || 0 }} reviews)</span>
                  </div>
                  <div class="avg-rating-pill no-rating" v-else>
                    <i class="far fa-star"></i>
                    <span>No ratings yet</span>
                  </div>

                  <div class="footer-presenter-pill">
                    <i class="fas fa-user-tie"></i>
                    <span>{{ session.presenter_name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
              <div class="empty-icon-wrap">
                <i class="fas fa-calendar-times"></i>
              </div>
              <h4>No Saturday Sessions Found</h4>
              <p>{{ searchQuery ? 'Try adjusting your search query or month filter' : 'Create your first Saturday session to start collecting ratings' }}</p>
              <button class="btn-primary-empty" @click="openAddSessionModal">
                <i class="fas fa-plus-circle"></i> Add First Session
              </button>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- TAB 2: LEADERBOARD VIEW                                -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div v-show="activeTab === 'leaderboard'" class="leaderboard-section tab-pane-transition">
          <div class="section-title-modern">
            <div class="title-left">
              <span class="section-indicator-dot trophy"></span>
              <span>Saturday ETP Presenter Rankings</span>
            </div>
            <span class="archive-date-hint">Ranked by peer ratings</span>
          </div>
          
          <div v-if="loadingLeaderboard" class="loading-state">
            <i class="fas fa-circle-notch fa-spin"></i>
            <p>Loading leaderboard rankings...</p>
          </div>
          
          <div v-else-if="leaderboard.length" class="leaderboard-table-wrapper">
            <!-- Mobile Card View -->
            <div class="leaderboard-cards" v-if="isMobile">
              <div v-for="(employee, index) in leaderboard" :key="employee.presenter_name" class="leaderboard-card">
                <div class="card-rank">
                  <span v-if="index === 0" class="rank-badge gold">🥇</span>
                  <span v-else-if="index === 1" class="rank-badge silver">🥈</span>
                  <span v-else-if="index === 2" class="rank-badge bronze">🥉</span>
                  <span v-else class="rank-number">#{{ index + 1 }}</span>
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
                      <span class="stat-label">Average</span>
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
            <div class="table-responsive-container" v-else>
              <table class="leaderboard-table">
                <thead>
                  <tr>
                    <th class="th-rank">Rank</th>
                    <th>Presenter Name</th>
                    <th>Sessions Conducted</th>
                    <th>Total Ratings</th>
                    <th>Average Rating</th>
                    <th>Score Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(employee, index) in leaderboard" :key="employee.presenter_name">
                    <td class="rank-cell">
                      <span v-if="index === 0" class="rank-badge gold">🥇 1</span>
                      <span v-else-if="index === 1" class="rank-badge silver">🥈 2</span>
                      <span v-else-if="index === 2" class="rank-badge bronze">🥉 3</span>
                      <span v-else class="rank-number">#{{ index + 1 }}</span>
                    </td>
                    <td class="presenter-cell">
                      <div class="presenter-cell-wrap">
                        <div class="presenter-avatar-circle">
                          {{ getInitials(employee.presenter_name) }}
                        </div>
                        <span class="presenter-cell-name">{{ employee.presenter_name }}</span>
                      </div>
                    </td>
                    <td class="numeric-cell">
                      <span class="stat-bubble">{{ employee.sessions_count }} session{{ employee.sessions_count === 1 ? '' : 's' }}</span>
                    </td>
                    <td class="numeric-cell">
                      <span class="stat-bubble gray">{{ employee.total_ratings_received || 0 }} rating{{ employee.total_ratings_received === 1 ? '' : 's' }}</span>
                    </td>
                    <td class="rating-cell">
                      <span class="avg-rating-value">{{ employee.avg_rating || 'N/A' }}</span>
                      <span class="stars-mini">
                        <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'filled': Math.round(employee.avg_rating) >= n }"></i>
                      </span>
                    </td>
                    <td>
                      <div class="progress-cell-wrap">
                        <div class="progress-bar">
                          <div class="progress-fill" :style="{ width: ((employee.avg_rating || 0) / 5 * 100) + '%' }"></div>
                        </div>
                        <span class="progress-pct">{{ Math.round(((employee.avg_rating || 0) / 5) * 100) }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-else class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
            <div class="empty-icon-wrap">
              <i class="fas fa-trophy"></i>
            </div>
            <h4>No Rankings Available Yet</h4>
            <p>Conduct sessions and submit ratings to populate the leaderboard</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- 📝 SESSION MODAL FORM (Clean Alignment & Separation)    -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-if="showSessionModal" class="modal-overlay" @click.self="closeSessionModal">
      <div class="modal-container-premium modal-form-pro" :class="{ 'mobile-modal': isMobile }">
        <!-- Modal Header -->
        <div class="modal-header-pro">
          <div class="modal-header-left">
            <div class="modal-icon-badge">
              <i :class="editingSession ? 'fas fa-edit' : 'fas fa-calendar-plus'"></i>
            </div>
            <div>
              <h2 class="modal-title">{{ editingSession ? 'Edit Saturday Session' : 'Add New Saturday Session' }}</h2>
              <p class="modal-subtitle">Enter session details, presenter, date, and key discussion highlights</p>
            </div>
          </div>
          <button type="button" class="close-modal-pro" @click="closeSessionModal" title="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body & Form -->
        <div class="modal-body-pro">
          <form @submit.prevent="handleSessionSubmit" class="pro-session-form">
            
            <!-- 📌 Section 1: Session Topic / Title (Full Width for complete readability) -->
            <div class="form-group-pro full-width">
              <label class="field-label-pro">
                <i class="fas fa-chalkboard"></i> Session Topic / Title <span class="required-star">*</span>
              </label>
              <div class="input-wrap-pro">
                <input 
                  type="text" 
                  v-model="sessionForm.topic" 
                  placeholder="e.g. Advanced Vue.js Architecture & Performance" 
                  class="form-control-pro"
                  required
                  maxlength="150"
                >
              </div>
            </div>

            <!-- 📌 Section 2: Presenter & Session Date (2 Clean Separated Columns) -->
            <div class="form-grid-row">
              <div class="form-group-pro">
                <label class="field-label-pro">
                  <i class="fas fa-user-tie"></i> Presenter Employee <span class="required-star">*</span>
                </label>
                <div class="select-wrap-pro">
                  <select v-model="sessionForm.presenter_name" required class="form-control-pro select-field-pro">
                    <option value="">Select Employee Presenter</option>
                    <option v-for="employee in employees" :key="employee.id" :value="employee.name">
                      {{ employee.name }} ({{ employee.department || 'General' }})
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group-pro">
                <label class="field-label-pro">
                  <i class="fas fa-calendar-alt"></i> Session Date <span class="required-star">*</span>
                </label>
                <div class="input-wrap-pro">
                  <input 
                    type="date" 
                    v-model="sessionForm.session_date" 
                    class="form-control-pro date-input-pro"
                    required
                  >
                </div>
              </div>
            </div>

            <!-- 📌 Section 3: Duration with Quick Presets & Theme Color (2 Clean Separated Columns) -->
            <div class="form-grid-row">
              <div class="form-group-pro">
                <label class="field-label-pro">
                  <i class="fas fa-clock"></i> Duration (Minutes)
                </label>
                <div class="input-wrap-pro">
                  <input 
                    type="number" 
                    v-model.number="sessionForm.duration_minutes" 
                    placeholder="e.g. 60" 
                    min="10"
                    max="360"
                    class="form-control-pro"
                  >
                </div>
                <!-- Quick Duration Presets -->
                <div class="duration-presets">
                  <span class="preset-label">Quick:</span>
                  <button 
                    v-for="mins in [30, 45, 60, 90]" 
                    :key="mins" 
                    type="button" 
                    class="preset-pill"
                    :class="{ 'active': sessionForm.duration_minutes === mins }"
                    @click="sessionForm.duration_minutes = mins"
                  >
                    {{ mins }}m
                  </button>
                </div>
              </div>

              <div class="form-group-pro" v-if="!isMobile">
                <label class="field-label-pro">
                  <i class="fas fa-palette"></i> Card Theme Color Accent
                </label>
                <div class="color-picker-palette-row">
                  <!-- Preset Color Swatches -->
                  <button 
                    v-for="color in presetColors" 
                    :key="color"
                    type="button" 
                    class="color-swatch-btn"
                    :style="{ background: color }"
                    :class="{ 'swatch-active': sessionForm.accent_color === color }"
                    @click="sessionForm.accent_color = color"
                    :title="color"
                  >
                    <i class="fas fa-check" v-if="sessionForm.accent_color === color"></i>
                  </button>

                  <!-- Custom Color Picker Input -->
                  <div class="custom-color-input-wrap">
                    <input type="color" v-model="sessionForm.accent_color" class="custom-color-input" title="Custom color picker">
                    <span class="custom-color-hex">{{ sessionForm.accent_color }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 📌 Section 4: Key Discussion Points & Agenda (Full Width) -->
            <div class="form-group-pro full-width">
              <div class="field-label-between">
                <label class="field-label-pro">
                  <i class="fas fa-list-check"></i> Key Discussion Points & Agenda
                </label>
                <span class="hint-badge-pro"><i class="fas fa-info-circle"></i> 1 line per bullet point</span>
              </div>
              <div class="input-wrap-pro">
                <textarea 
                  v-model="sessionForm.key_points" 
                  rows="4" 
                  placeholder="• Architecture overview and module separation&#10;• Best practices for reactive state&#10;• Q&A and practical takeaways"
                  class="form-control-pro textarea-pro"
                ></textarea>
              </div>
              <small class="form-hint-pro">Each line will be displayed as a distinct key point bullet in the session card.</small>
            </div>

            <!-- Form Actions Bar -->
            <div class="modal-actions-pro" :class="{ 'mobile-actions': isMobile }">
              <button type="button" class="btn-cancel-pro" @click="closeSessionModal">
                Cancel
              </button>
              <button type="submit" class="btn-submit-pro" :disabled="submitting">
                <i v-if="submitting" class="fas fa-circle-notch fa-spin"></i>
                <i v-else :class="editingSession ? 'fas fa-save' : 'fas fa-plus-circle'"></i>
                <span>{{ submitting ? 'Saving Session...' : (editingSession ? 'Update Session' : 'Create Session') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 🗑️ DELETE CONFIRMATION MODAL -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-container-premium delete-modal-pro" :class="{ 'mobile-modal': isMobile }">
        <div class="modal-header-pro delete-header">
          <div class="modal-header-left">
            <div class="modal-icon-badge danger">
              <i class="fas fa-trash-alt"></i>
            </div>
            <div>
              <h2 class="modal-title danger">Delete Saturday Session</h2>
              <p class="modal-subtitle">This action will permanently delete the session and its ratings</p>
            </div>
          </div>
          <button type="button" class="close-modal-pro" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body-pro">
          <div class="delete-warning-box">
            <p>Are you sure you want to delete the session:</p>
            <div class="delete-topic-pill">
              <i class="fas fa-chalkboard"></i>
              <strong>{{ sessionToDelete?.topic }}</strong>
            </div>
            <p class="delete-warning-note">All ratings and peer reviews associated with this session will be permanently erased.</p>
          </div>

          <div class="modal-actions-pro" :class="{ 'mobile-actions': isMobile }">
            <button type="button" class="btn-cancel-pro" @click="showDeleteModal = false">
              Keep Session
            </button>
            <button type="button" class="btn-danger-pro" @click="deleteSession" :disabled="deleting">
              <i v-if="deleting" class="fas fa-circle-notch fa-spin"></i>
              <i v-else class="fas fa-trash-alt"></i>
              <span>{{ deleting ? 'Deleting...' : 'Delete Permanently' }}</span>
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
      activeTab: 'sessions', // 'sessions' | 'leaderboard'
      
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
      
      presetColors: [
        '#2a5298',
        '#10b981',
        '#6366f1',
        '#f59e0b',
        '#ec4899',
        '#06b6d4',
        '#8b5cf6'
      ],

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
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.id || null;
      } catch (e) {
        return null;
      }
    }
  },

  methods: {
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },

    getInitials(name) {
      if (!name) return '??';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },

    getLightAccent(color) {
      return color ? `${color}18` : '#eef2ff';
    },

    toggleRatingsList(session) {
      session.ratingsVisible = !session.ratingsVisible;
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
        this.employees = Array.isArray(data) ? data : (data.data || []);
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
        if (!user || !user.id) return;
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
      }, 400);
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
        const userId = user?.id;
        const userName = user?.name;
        
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
          toastError('Failed to submit rating');
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
      if (session.created_by !== user?.id) {
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
          created_by: user?.id
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
          toastError('Operation failed');
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
          body: JSON.stringify({ created_by: user?.id })
        });
        const data = await response.json();
        if (data.success) {
          toastSuccess(`Session "${this.sessionToDelete.topic}" deleted successfully`);
          await this.loadSessions();
          await this.loadLeaderboard();
          this.showDeleteModal = false;
          this.sessionToDelete = null;
        } else {
          toastError('Delete failed');
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
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* 🌿 Base Layout */
.layout {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f4f7fc;
}

.main-content {
  display: flex;
  gap: 24px;
  padding: 20px 24px;
  min-height: 100vh;
}

.session-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  overflow-x: hidden;
}

/* 📱 Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.mobile-title i {
  color: #2a5298;
}

.mobile-add-btn {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 10px rgba(42, 82, 152, 0.25);
}

/* 🏢 Desktop Header Banner */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 24px rgba(42, 82, 152, 0.28);
}

.header-tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.header-badge-sub {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #eef2ff;
  color: #2a5298;
  padding: 2px 8px;
  border-radius: 6px;
}

.header-schedule-tag {
  font-size: 11.5px;
  color: #10b981;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.content-header-modern h1 {
  font-size: 24px;
  font-weight: 800;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

.subtitle-modern {
  color: #64748b;
  font-size: 13.5px;
  margin-top: 3px;
  font-weight: 500;
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
}

.text-gold {
  color: #f59e0b;
}

.btn-primary-header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(42, 82, 152, 0.25);
  transition: all 0.2s;
}

.btn-primary-header:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(42, 82, 152, 0.35);
}

/* 📊 Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  transition: all 0.25s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.stat-card.card-active {
  border-color: #2a5298;
  background: #f8faff;
  box-shadow: 0 4px 14px rgba(42, 82, 152, 0.1);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.stat-icon-wrap.blue { background: #eff6ff; color: #2563eb; }
.stat-icon-wrap.indigo { background: #eef2ff; color: #4f46e5; }
.stat-icon-wrap.amber { background: #fef3c7; color: #d97706; }
.stat-icon-wrap.green { background: #ecfdf5; color: #059669; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

.max-rate {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.add-stat-card {
  border-style: dashed;
  background: #fafcff;
}

.action-stat {
  font-size: 16px;
  color: #059669;
}

/* 🗂️ TABS BAR (Clean Segmented Architecture) */
.etp-tabs-bar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eef2f6;
  flex-wrap: wrap;
  gap: 14px;
}

.etp-segmented-tabs {
  display: inline-flex;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 5px;
  gap: 6px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 13.5px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab-btn i {
  font-size: 14px;
}

.tab-btn:hover:not(.active) {
  color: #0f172a;
}

.tab-btn.active {
  background: #ffffff;
  color: #2a5298;
  box-shadow: 0 4px 14px rgba(42, 82, 152, 0.12);
}

.tab-badge-counter {
  font-size: 11px;
  font-weight: 700;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 7px;
  border-radius: 999px;
  transition: all 0.2s;
}

.tab-btn.active .tab-badge-counter {
  background: #eef2ff;
  color: #2a5298;
}

.tab-bar-right-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: #64748b;
}

.live-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
}

/* 🔍 Filter & Search Toolbar (Card) */
.filter-toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 14px 20px;
  margin-bottom: 24px;
  gap: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  width: 340px;
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13.5px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 42px;
  box-sizing: border-box !important;
  padding: 0 36px 0 38px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13.5px;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s ease;
  color: #0f172a;
}

.search-input:focus {
  border-color: #2a5298;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.12);
}

.search-input::placeholder {
  color: #94a3b8;
}

.btn-clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.15s ease;
}

.btn-clear-search:hover {
  background: #cbd5e1;
  color: #0f172a;
}

.select-month-wrapper {
  position: relative;
  width: 160px;
}

.select-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #2a5298;
  font-size: 12.5px;
  pointer-events: none;
}

.month-select {
  width: 100%;
  height: 42px;
  box-sizing: border-box !important;
  padding: 0 34px 0 36px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  background: #f8fafc;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.month-select:focus {
  border-color: #2a5298;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.12);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.results-counter-pill {
  height: 42px;
  box-sizing: border-box !important;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0 16px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.btn-add-inline {
  height: 42px;
  box-sizing: border-box !important;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 18px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(42, 82, 152, 0.22);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-add-inline:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(42, 82, 152, 0.32);
}

/* 📋 Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.section-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2a5298;
}

.section-indicator-dot.trophy {
  background: #f59e0b;
}

.archive-date-hint {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

/* 📦 Sessions Grid */
.sessions-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.session-card-premium {
  position: relative;
  background: white;
  border-radius: 22px;
  overflow: hidden;
  transition: all 0.25s ease;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.session-card-premium:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px -8px rgba(42, 82, 152, 0.12);
  border-color: #cbd5e1;
}

.card-accent {
  height: 5px;
  width: 100%;
}

.session-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 20px 14px;
  gap: 12px;
}

.session-card-title-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.session-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.session-title-wrap {
  flex: 1;
  min-width: 0;
}

.session-title-wrap h3 {
  font-size: 15.5px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px;
  line-height: 1.35;
  word-break: break-word;
}

.session-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.meta-tag.presenter { background: #eef2ff; color: #2a5298; }
.meta-tag.date { background: #f1f5f9; color: #475569; }
.meta-tag.duration { background: #fef3c7; color: #b45309; }

.session-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.edit-btn { color: #2563eb; }
.edit-btn:hover { background: #eff6ff; border-color: #bfdbfe; }

.delete-btn { color: #ef4444; }
.delete-btn:hover { background: #fee2e2; border-color: #fecaca; }

/* Key Points Box */
.key-points-wrapper {
  margin: 0 20px 14px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  padding: 12px 14px;
}

.points-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.points-header i { color: #f59e0b; }

.key-points-text {
  font-size: 12.5px;
  color: #334155;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.key-points-text.collapsed {
  max-height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.read-more-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 0 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Rating Section Card */
.rating-section-card {
  margin: 0 20px 14px;
  background: #fafcff;
  border: 1px solid #e0e7ff;
  border-radius: 14px;
  padding: 12px 14px;
}

.rating-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rating-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-submitted-badge {
  font-size: 11px;
  font-weight: 700;
  color: #059669;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ecfdf5;
  padding: 2px 8px;
  border-radius: 999px;
}

.rating-input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.stars-input-wrap {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 20px;
  color: #cbd5e1;
  cursor: pointer;
  transition: transform 0.15s ease, color 0.15s ease;
}

.star:hover:not(.disabled) {
  transform: scale(1.15);
  color: #fbbf24;
}

.star.filled {
  color: #fbbf24;
}

.star.disabled {
  cursor: default;
}

.btn-submit-rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit-rating:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
}

/* Reviews Drawer */
.ratings-list-section {
  margin: 0 20px 14px;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  background: #f8fafc;
  overflow: hidden;
}

.ratings-label-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  background: #f1f5f9;
}

.reviews-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: #334155;
}

.reviews-toggle-icon i {
  font-size: 11px;
  color: #64748b;
  transition: transform 0.2s ease;
}

.reviews-toggle-icon i.rotated {
  transform: rotate(180deg);
}

.ratings-list {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
}

.ratings-list.ratings-hidden {
  display: none;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
}

.rating-item.current-user-rating {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.rating-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #1e293b;
}

.rating-user-badge {
  font-size: 9.5px;
  font-weight: 700;
  background: #dbeafe;
  color: #1e40af;
  padding: 1px 5px;
  border-radius: 4px;
}

.rating-stars-display {
  display: flex;
  align-items: center;
  gap: 2px;
}

.rating-stars-display i {
  font-size: 10px;
  color: #cbd5e1;
}

.rating-stars-display i.filled {
  color: #fbbf24;
}

.rating-value-text {
  font-size: 11px;
  font-weight: 700;
  color: #2a5298;
  margin-left: 4px;
}

.rating-date {
  font-size: 10.5px;
  color: #94a3b8;
}

/* Card Footer */
.session-card-footer {
  margin-top: auto;
  padding: 12px 20px;
  background: #fbfcfd;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.avg-rating-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 4px 10px;
  border-radius: 999px;
}

.avg-rating-pill i { color: #f59e0b; }

.star-rating-display i {
  font-size: 10px;
  color: #cbd5e1;
}

.star-rating-display i.filled {
  color: #fbbf24;
}

.rating-count {
  font-size: 11px;
  color: #64748b;
}

.avg-rating-pill.no-rating {
  color: #94a3b8;
}

.footer-presenter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
}

/* ═══════════════════════════════════════════════════════ */
/* 🏆 LEADERBOARD STYLES                                  */
/* ═══════════════════════════════════════════════════════ */
.leaderboard-table-wrapper {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.leaderboard-table th {
  padding: 14px 18px;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.leaderboard-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13.5px;
  color: #1e293b;
}

.leaderboard-table tr:hover td {
  background: #f8faff;
}

.th-rank { width: 90px; }

.rank-cell {
  font-weight: 700;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 13px;
}

.rank-badge.gold { background: #fef3c7; color: #92400e; }
.rank-badge.silver { background: #f1f5f9; color: #475569; }
.rank-badge.bronze { background: #fed7aa; color: #9a3412; }

.rank-number {
  font-size: 13px;
  color: #64748b;
  font-weight: 700;
}

.presenter-cell-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.presenter-avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

.presenter-cell-name {
  font-weight: 700;
  color: #0f172a;
}

.stat-bubble {
  font-size: 12px;
  font-weight: 600;
  background: #eff6ff;
  color: #2563eb;
  padding: 3px 10px;
  border-radius: 6px;
}

.stat-bubble.gray {
  background: #f1f5f9;
  color: #475569;
}

.rating-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avg-rating-value {
  font-weight: 800;
  color: #2a5298;
  font-size: 14px;
}

.stars-mini i {
  font-size: 11px;
  color: #cbd5e1;
}

.stars-mini i.filled {
  color: #fbbf24;
}

.progress-cell-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 7px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  max-width: 140px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 999px;
}

.progress-pct {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  min-width: 32px;
}

/* Mobile Leaderboard Cards */
.leaderboard-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.leaderboard-card {
  display: flex;
  gap: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
}

.card-stats {
  display: flex;
  gap: 8px;
  margin: 8px 0;
}

.stat-chip {
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.stat-chip .stat-label { font-size: 9px; }
.stat-chip .stat-number { font-size: 12.5px; font-weight: 700; }
.stat-chip .stat-number.rating { color: #2a5298; }

.progress-bar-mini {
  height: 5px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill-mini {
  height: 100%;
  background: #10b981;
}

.stars-mini-display i {
  font-size: 11px;
  color: #cbd5e1;
}

.stars-mini-display i.filled { color: #fbbf24; }

/* ═══════════════════════════════════════════════════════ */
/* 📝 PROFESSIONAL MODAL FORM STYLES                     */
/* ═══════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container-premium {
  background: #ffffff;
  width: 100%;
  max-width: 680px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* Ensure box-sizing border-box across the entire modal and all form controls */
.modal-container-premium,
.modal-container-premium *,
.modal-container-premium *::before,
.modal-container-premium *::after {
  box-sizing: border-box;
}

.modal-header-pro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 26px;
  background: #f8fafc;
  border-bottom: 1px solid #eef2f6;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #eef2ff;
  color: #2a5298;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.modal-icon-badge.danger {
  background: #fee2e2;
  color: #ef4444;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.modal-title.danger {
  color: #b91c1c;
}

.modal-subtitle {
  font-size: 12.5px;
  color: #64748b;
  margin: 2px 0 0;
}

.close-modal-pro {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.15s;
}

.close-modal-pro:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.modal-body-pro {
  padding: 24px 28px;
  overflow-y: auto;
}

.pro-session-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* 2-Column Grid Row with safe minimum width and generous gap */
.form-grid-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  width: 100%;
}

.form-group-pro {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

.form-group-pro.full-width {
  width: 100%;
}

.input-wrap-pro,
.select-wrap-pro {
  width: 100%;
  min-width: 0;
  position: relative;
}

.field-label-pro {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  letter-spacing: -0.1px;
}

.field-label-pro i {
  color: #2a5298;
  font-size: 12.5px;
}

.required-star {
  color: #ef4444;
  font-weight: 800;
}

.field-label-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.hint-badge-pro {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.form-control-pro {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box !important;
  padding: 11px 15px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13.5px;
  color: #0f172a;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.form-control-pro:focus {
  background: white;
  border-color: #2a5298;
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.12);
}

.form-control-pro::placeholder {
  color: #94a3b8;
}

.select-field-pro {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 38px;
  cursor: pointer;
}

.textarea-pro {
  resize: vertical;
  min-height: 95px;
  line-height: 1.55;
}

.form-hint-pro {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 6px;
  display: block;
}

/* Quick Duration Presets */
.duration-presets {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

.preset-pill {
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-pill:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.preset-pill.active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
  font-weight: 700;
}

/* Color Picker Palette */
.color-picker-palette-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.color-swatch-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.color-swatch-btn:hover {
  transform: scale(1.1);
}

.color-swatch-btn.swatch-active {
  border-color: #0f172a;
  box-shadow: 0 0 0 2px white, 0 2px 6px rgba(0, 0, 0, 0.25);
  transform: scale(1.05);
}

.custom-color-input-wrap {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 3px 9px 3px 4px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
}

.custom-color-input {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.custom-color-hex {
  font-size: 11px;
  font-family: monospace;
  font-weight: 700;
  color: #475569;
}

/* Modal Actions Footer */
.modal-actions-pro {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 6px;
  padding-top: 20px;
  border-top: 1px solid #eef2f6;
}

.btn-cancel-pro {
  padding: 11px 22px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-pro:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-submit-pro {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 26px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(42, 82, 152, 0.25);
  transition: all 0.2s;
}

.btn-submit-pro:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(42, 82, 152, 0.35);
}

.btn-submit-pro:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Delete Modal Styling */
.delete-modal-pro {
  max-width: 500px;
}

.delete-warning-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
}

.delete-warning-box p {
  margin: 0;
  font-size: 13.5px;
  color: #7f1d1d;
}

.delete-topic-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #fca5a5;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #991b1b;
  margin: 10px 0;
  word-break: break-word;
}

.delete-warning-note {
  font-size: 11.5px !important;
  color: #b91c1c !important;
}

.btn-danger-pro {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger-pro:hover:not(:disabled) {
  background: #dc2626;
}

/* Empty & Loading States */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-state i {
  font-size: 36px;
  color: #2a5298;
  margin-bottom: 12px;
}

.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 20px;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #94a3b8;
  margin-bottom: 14px;
}

.empty-state-premium h4 {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px;
}

.empty-state-premium p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 18px;
}

.btn-primary-empty {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
}

/* 📱 Responsive Adjustments */
@media (max-width: 1024px) {
  .sessions-grid-premium {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .session-board-premium {
    padding: 16px 14px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .form-grid-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .filter-toolbar-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .toolbar-left {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .search-wrapper {
    width: 100%;
  }

  .select-month-wrapper {
    width: 100%;
  }

  .month-select {
    width: 100%;
  }

  .toolbar-right {
    justify-content: space-between;
    width: 100%;
  }

  .leaderboard-table-wrapper .table-responsive-container {
    display: none;
  }

  .leaderboard-cards {
    display: flex;
  }

  .modal-actions-pro.mobile-actions {
    flex-direction: column;
  }

  .modal-actions-pro.mobile-actions button {
    width: 100%;
    justify-content: center;
  }
}
</style>