<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        
        <!-- HERO / TOP BANNER -->
        <header class="dsi-hero-banner">
          <div class="banner-left">
            <div class="banner-icon-badge">
              <i class="fas fa-lightbulb"></i>
            </div>
            <div>
              <div class="banner-tag">
                <i class="fas fa-award"></i>
                <span>KAIZEN & CONTINUOUS IMPROVEMENT HUB</span>
              </div>
              <h1 class="banner-title">Daily Small Improvement (DSI)</h1>
              <p class="banner-subtitle">
                Evaluate employee Kaizen submissions, review Before vs After impact, and approve operational enhancements.
              </p>
            </div>
          </div>

          <div class="banner-actions">
            <button 
              class="btn-banner-action" 
              @click="fetchAllDSI" 
              :disabled="loading"
              title="Refresh submissions"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              <span>Refresh</span>
            </button>
            <div class="view-mode-toggle">
              <button 
                class="view-btn" 
                :class="{ active: viewMode === 'table' }"
                @click="viewMode = 'table'"
                title="Table View"
              >
                <i class="fas fa-table-list"></i>
                <span class="view-btn-label">Table</span>
              </button>
              <button 
                class="view-btn" 
                :class="{ active: viewMode === 'cards' }"
                @click="viewMode = 'cards'"
                title="Kaizen Cards View"
              >
                <i class="fas fa-grip-vertical"></i>
                <span class="view-btn-label">Cards</span>
              </button>
            </div>
          </div>
        </header>

        <!-- INTERACTIVE STATS / KPI BAR -->
        <div class="stats-row">
          <div 
            class="dsi-stat-card total" 
            :class="{ active: statusFilter === 'all' }"
            @click="setStatusFilter('all')"
          >
            <div class="stat-icon-wrap total-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="stat-details">
              <span class="stat-num">{{ dsiList.length }}</span>
              <span class="stat-label">Total Submissions</span>
            </div>
            <span class="stat-pill-indicator">All Ideas</span>
          </div>

          <div 
            class="dsi-stat-card pending" 
            :class="{ active: statusFilter === 'pending' }"
            @click="setStatusFilter('pending')"
          >
            <div class="stat-icon-wrap pending-icon">
              <i class="fas fa-hourglass-half"></i>
            </div>
            <div class="stat-details">
              <span class="stat-num">{{ pendingCount }}</span>
              <span class="stat-label">Pending Review</span>
            </div>
            <span v-if="pendingCount > 0" class="stat-badge-pulse">Needs Action</span>
            <span v-else class="stat-pill-indicator">All Clear</span>
          </div>

          <div 
            class="dsi-stat-card approved" 
            :class="{ active: statusFilter === 'approved' }"
            @click="setStatusFilter('approved')"
          >
            <div class="stat-icon-wrap approved-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-details">
              <span class="stat-num">{{ approvedCount }}</span>
              <span class="stat-label">Approved Ideas</span>
            </div>
            <span class="stat-pill-indicator" v-if="dsiList.length > 0">
              {{ approvalRate }}% Rate
            </span>
          </div>

          <div 
            class="dsi-stat-card rejected" 
            :class="{ active: statusFilter === 'rejected' }"
            @click="setStatusFilter('rejected')"
          >
            <div class="stat-icon-wrap rejected-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-details">
              <span class="stat-num">{{ rejectedCount }}</span>
              <span class="stat-label">Rejected</span>
            </div>
            <span class="stat-pill-indicator">Archived</span>
          </div>
        </div>

        <!-- MAIN CONTENT PANEL -->
        <div class="dsi-panel">
          
          <!-- CONTROLS & TOOLBAR -->
          <div class="toolbar-wrapper">
            <div class="toolbar-search">
              <i class="fas fa-search search-lens"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search by employee, problem, solution, or result..." 
                class="search-input"
              />
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''" 
                class="search-clear-btn" 
                title="Clear search"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="toolbar-filter-tabs">
              <button 
                class="filter-tab-pill" 
                :class="{ active: statusFilter === 'all' }"
                @click="setStatusFilter('all')"
              >
                <span>All</span>
                <span class="tab-count">{{ dsiList.length }}</span>
              </button>
              <button 
                class="filter-tab-pill pill-warn" 
                :class="{ active: statusFilter === 'pending' }"
                @click="setStatusFilter('pending')"
              >
                <span class="status-dot dot-warn"></span>
                <span>Pending</span>
                <span class="tab-count">{{ pendingCount }}</span>
              </button>
              <button 
                class="filter-tab-pill pill-success" 
                :class="{ active: statusFilter === 'approved' }"
                @click="setStatusFilter('approved')"
              >
                <span class="status-dot dot-success"></span>
                <span>Approved</span>
                <span class="tab-count">{{ approvedCount }}</span>
              </button>
              <button 
                class="filter-tab-pill pill-danger" 
                :class="{ active: statusFilter === 'rejected' }"
                @click="setStatusFilter('rejected')"
              >
                <span class="status-dot dot-danger"></span>
                <span>Rejected</span>
                <span class="tab-count">{{ rejectedCount }}</span>
              </button>
            </div>

            <div class="toolbar-right-meta">
              <span class="meta-results-count">
                Showing <strong>{{ filteredDsiList.length }}</strong> of <strong>{{ dsiList.length }}</strong> records
              </span>
            </div>
          </div>

          <!-- LOADING STATE -->
          <div v-if="loading" class="state-box">
            <i class="fas fa-circle-notch fa-spin state-spinner"></i>
            <h3>Loading DSI Submissions...</h3>
            <p>Fetching the latest Kaizen improvement entries.</p>
          </div>

          <!-- EMPTY STATE -->
          <div v-else-if="filteredDsiList.length === 0" class="state-box empty">
            <div class="empty-icon-circle">
              <i class="fas fa-lightbulb"></i>
            </div>
            <h3>No Improvements Found</h3>
            <p v-if="searchQuery || statusFilter !== 'all'">
              No submissions match your search query or status filter. Try clearing filters.
            </p>
            <p v-else>
              No employee DSI improvements have been submitted yet.
            </p>
            <button 
              v-if="searchQuery || statusFilter !== 'all'" 
              class="btn-reset-filters" 
              @click="resetFilters"
            >
              <i class="fas fa-rotate-left"></i> Reset All Filters
            </button>
          </div>

          <!-- VIEW MODE 1: MODERN DATA TABLE -->
          <div v-else-if="viewMode === 'table'" class="table-card">
            <div class="table-responsive">
              <table class="dsi-modern-table">
                <thead>
                  <tr>
                    <th class="col-seq">#</th>
                    <th class="col-user">Employee</th>
                    <th class="col-date">Date</th>
                    <th class="col-problem">Problem Statement</th>
                    <th class="col-solution">Proposed Solution</th>
                    <th class="col-result">Measurable Result</th>
                    <th class="col-media">Visual Proof</th>
                    <th class="col-status">Status</th>
                    <th class="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(item, i) in filteredDsiList" 
                    :key="item.id" 
                    class="dsi-table-row"
                    :class="{ 'row-highlighted': selectedDsi && selectedDsi.id === item.id }"
                  >
                    <!-- # Index -->
                    <td class="col-seq">
                      <span class="seq-badge">{{ i + 1 }}</span>
                    </td>

                    <!-- Employee Name & Avatar -->
                    <td class="col-user">
                      <div class="user-profile-cell">
                        <div class="user-avatar" :style="{ background: getUserColor(item.user) }">
                          {{ getInitials(item.user) }}
                        </div>
                        <div class="user-text">
                          <span class="user-name">{{ item.user || 'Unknown User' }}</span>
                          <span class="user-id-sub">DSI #{{ item.id }}</span>
                        </div>
                      </div>
                    </td>

                    <!-- Date -->
                    <td class="col-date">
                      <div class="date-chip">
                        <i class="far fa-calendar-alt"></i>
                        <span>{{ formatDate(item.date) }}</span>
                      </div>
                    </td>

                    <!-- Problem -->
                    <td class="col-problem">
                      <div class="cell-content problem-box">
                        <span class="step-tag tag-problem"><i class="fas fa-exclamation-triangle"></i> Problem</span>
                        <div class="cell-text-block">
                          <p :class="{ 'is-truncated': !isExpanded(item.id, 'problem') }">
                            {{ isExpanded(item.id, 'problem') ? (item.problem || '—') : truncateText(item.problem, 75) }}
                          </p>
                          <button 
                            v-if="isTextLong(item.problem, 75)" 
                            @click.stop="toggleReadMore(item.id, 'problem')"
                            class="btn-text-expand"
                          >
                            {{ isExpanded(item.id, 'problem') ? 'Show Less' : 'Read Full' }}
                          </button>
                        </div>
                      </div>
                    </td>

                    <!-- Solution -->
                    <td class="col-solution">
                      <div class="cell-content solution-box">
                        <span class="step-tag tag-solution"><i class="fas fa-lightbulb"></i> Solution</span>
                        <div class="cell-text-block">
                          <p :class="{ 'is-truncated': !isExpanded(item.id, 'solution') }">
                            {{ isExpanded(item.id, 'solution') ? (item.solution || '—') : truncateText(item.solution, 75) }}
                          </p>
                          <button 
                            v-if="isTextLong(item.solution, 75)" 
                            @click.stop="toggleReadMore(item.id, 'solution')"
                            class="btn-text-expand"
                          >
                            {{ isExpanded(item.id, 'solution') ? 'Show Less' : 'Read Full' }}
                          </button>
                        </div>
                      </div>
                    </td>

                    <!-- Result -->
                    <td class="col-result">
                      <div class="cell-content result-box">
                        <span class="step-tag tag-result"><i class="fas fa-chart-line"></i> Result</span>
                        <div class="cell-text-block">
                          <p :class="{ 'is-truncated': !isExpanded(item.id, 'result') }">
                            {{ isExpanded(item.id, 'result') ? (item.result || '—') : truncateText(item.result, 75) }}
                          </p>
                          <button 
                            v-if="isTextLong(item.result, 75)" 
                            @click.stop="toggleReadMore(item.id, 'result')"
                            class="btn-text-expand"
                          >
                            {{ isExpanded(item.id, 'result') ? 'Show Less' : 'Read Full' }}
                          </button>
                        </div>
                      </div>
                    </td>

                    <!-- Visual Proof (Before & After) -->
                    <td class="col-media">
                      <div class="media-pair-wrap">
                        <!-- Before Thumb -->
                        <div 
                          v-if="item.beforeImage" 
                          class="media-chip before-chip"
                          @click="openImage(item.beforeImage, 'Before State - ' + item.user)"
                          title="Click to view BEFORE photo"
                        >
                          <img :src="item.beforeImage" alt="Before" loading="lazy" />
                          <span class="media-chip-tag before">Before</span>
                          <div class="zoom-hover-overlay"><i class="fas fa-search-plus"></i></div>
                        </div>
                        <span v-else class="media-empty-chip">No Before</span>

                        <!-- After Thumb -->
                        <div 
                          v-if="item.afterImage" 
                          class="media-chip after-chip"
                          @click="openImage(item.afterImage, 'After Improvement - ' + item.user)"
                          title="Click to view AFTER photo"
                        >
                          <img :src="item.afterImage" alt="After" loading="lazy" />
                          <span class="media-chip-tag after">After</span>
                          <div class="zoom-hover-overlay"><i class="fas fa-search-plus"></i></div>
                        </div>
                        <span v-else class="media-empty-chip">No After</span>
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="col-status">
                      <span :class="['status-chip-pill', getStatusClass(item.status)]">
                        <i :class="getStatusIcon(item.status)"></i>
                        <span>{{ capitalizeFirst(item.status) }}</span>
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="col-actions">
                      <div class="action-btn-row">
                        <!-- Inspect / Comparison button -->
                        <button 
                          class="action-btn inspect-btn" 
                          @click="openInspectModal(item)"
                          title="Inspect Details & Side-by-Side Comparison"
                        >
                          <i class="fas fa-eye"></i>
                        </button>

                        <!-- Approve button -->
                        <button 
                          class="action-btn approve-btn" 
                          @click="updateStatus(item.id, 'Approved')"
                          :disabled="item.status === 'approved'"
                          :title="item.status === 'approved' ? 'Already Approved' : 'Approve this Improvement'"
                        >
                          <i class="fas fa-check"></i>
                        </button>

                        <!-- Reject button -->
                        <button 
                          class="action-btn reject-btn" 
                          @click="updateStatus(item.id, 'Rejected')"
                          :disabled="item.status === 'rejected'"
                          :title="item.status === 'rejected' ? 'Already Rejected' : 'Reject this Improvement'"
                        >
                          <i class="fas fa-times"></i>
                        </button>

                        <!-- Delete button -->
                        <button 
                          class="action-btn delete-btn" 
                          @click="deleteDSI(item.id, i)"
                          title="Delete DSI Record"
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- VIEW MODE 2: KAIZEN CARDS GRID -->
          <div v-else class="cards-grid-layout">
            <div 
              v-for="(item, i) in filteredDsiList" 
              :key="item.id" 
              class="kaizen-card"
            >
              <!-- Card Header -->
              <div class="kaizen-card-header">
                <div class="card-author-wrap">
                  <div class="user-avatar" :style="{ background: getUserColor(item.user) }">
                    {{ getInitials(item.user) }}
                  </div>
                  <div>
                    <h4 class="card-author-name">{{ item.user || 'Unknown User' }}</h4>
                    <span class="card-date-meta">
                      <i class="far fa-calendar-alt"></i> {{ formatDate(item.date) }} • #{{ item.id }}
                    </span>
                  </div>
                </div>

                <span :class="['status-chip-pill', getStatusClass(item.status)]">
                  <i :class="getStatusIcon(item.status)"></i>
                  <span>{{ capitalizeFirst(item.status) }}</span>
                </span>
              </div>

              <!-- 3-Step Kaizen Pillars -->
              <div class="kaizen-steps-container">
                <!-- Step 1: Problem -->
                <div class="kaizen-step problem-step">
                  <div class="step-header">
                    <span class="step-badge-num">1</span>
                    <i class="fas fa-exclamation-circle"></i>
                    <span class="step-label">Problem Statement</span>
                  </div>
                  <p class="step-text">
                    {{ isExpanded(item.id, 'card_problem') ? (item.problem || '—') : truncateText(item.problem, 120) }}
                  </p>
                  <button 
                    v-if="isTextLong(item.problem, 120)" 
                    @click.stop="toggleReadMore(item.id, 'card_problem')"
                    class="btn-step-toggle"
                  >
                    {{ isExpanded(item.id, 'card_problem') ? 'Read Less' : 'Read More' }}
                  </button>
                </div>

                <!-- Step 2: Solution -->
                <div class="kaizen-step solution-step">
                  <div class="step-header">
                    <span class="step-badge-num">2</span>
                    <i class="fas fa-lightbulb"></i>
                    <span class="step-label">Proposed Solution</span>
                  </div>
                  <p class="step-text">
                    {{ isExpanded(item.id, 'card_solution') ? (item.solution || '—') : truncateText(item.solution, 120) }}
                  </p>
                  <button 
                    v-if="isTextLong(item.solution, 120)" 
                    @click.stop="toggleReadMore(item.id, 'card_solution')"
                    class="btn-step-toggle"
                  >
                    {{ isExpanded(item.id, 'card_solution') ? 'Read Less' : 'Read More' }}
                  </button>
                </div>

                <!-- Step 3: Result -->
                <div class="kaizen-step result-step">
                  <div class="step-header">
                    <span class="step-badge-num">3</span>
                    <i class="fas fa-chart-line"></i>
                    <span class="step-label">Measurable Result</span>
                  </div>
                  <p class="step-text">
                    {{ isExpanded(item.id, 'card_result') ? (item.result || '—') : truncateText(item.result, 120) }}
                  </p>
                  <button 
                    v-if="isTextLong(item.result, 120)" 
                    @click.stop="toggleReadMore(item.id, 'card_result')"
                    class="btn-step-toggle"
                  >
                    {{ isExpanded(item.id, 'card_result') ? 'Read Less' : 'Read More' }}
                  </button>
                </div>
              </div>

              <!-- Before & After Comparison Showcase -->
              <div class="card-visual-showcase" v-if="item.beforeImage || item.afterImage">
                <div class="showcase-title">
                  <i class="fas fa-images"></i> Visual Proof
                </div>
                <div class="showcase-grid">
                  <div 
                    v-if="item.beforeImage" 
                    class="showcase-photo-box before-box"
                    @click="openImage(item.beforeImage, 'Before State - ' + item.user)"
                  >
                    <img :src="item.beforeImage" alt="Before" loading="lazy" />
                    <span class="photo-overlay-tag before-tag"><i class="fas fa-history"></i> BEFORE</span>
                  </div>
                  <div v-else class="showcase-photo-empty">
                    <i class="fas fa-image"></i>
                    <span>No Before</span>
                  </div>

                  <div 
                    v-if="item.afterImage" 
                    class="showcase-photo-box after-box"
                    @click="openImage(item.afterImage, 'After Improvement - ' + item.user)"
                  >
                    <img :src="item.afterImage" alt="After" loading="lazy" />
                    <span class="photo-overlay-tag after-tag"><i class="fas fa-check-circle"></i> AFTER</span>
                  </div>
                  <div v-else class="showcase-photo-empty">
                    <i class="fas fa-image"></i>
                    <span>No After</span>
                  </div>
                </div>
              </div>

              <!-- Card Action Footer -->
              <div class="kaizen-card-footer">
                <button class="btn-card-inspect" @click="openInspectModal(item)">
                  <i class="fas fa-magnifying-glass-plus"></i> Inspect Details
                </button>
                
                <div class="footer-status-actions">
                  <button 
                    class="btn-footer-approve" 
                    @click="updateStatus(item.id, 'Approved')"
                    :disabled="item.status === 'approved'"
                    title="Approve Idea"
                  >
                    <i class="fas fa-check"></i> Approve
                  </button>
                  <button 
                    class="btn-footer-reject" 
                    @click="updateStatus(item.id, 'Rejected')"
                    :disabled="item.status === 'rejected'"
                    title="Reject Idea"
                  >
                    <i class="fas fa-times"></i> Reject
                  </button>
                  <button 
                    class="btn-footer-delete" 
                    @click="deleteDSI(item.id, i)"
                    title="Delete record"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ============================================ -->
        <!-- SIDE-BY-SIDE INSPECTION & EVALUATION MODAL -->
        <!-- ============================================ -->
        <div v-if="selectedDsi" class="dsi-modal-backdrop" @click.self="closeInspectModal">
          <div class="dsi-inspect-modal animate-modal">
            <!-- Modal Header -->
            <div class="inspect-modal-header">
              <div class="inspect-header-left">
                <div class="user-avatar modal-avatar" :style="{ background: getUserColor(selectedDsi.user) }">
                  {{ getInitials(selectedDsi.user) }}
                </div>
                <div>
                  <div class="inspect-header-badge">DSI SUBMISSION #{{ selectedDsi.id }}</div>
                  <h2 class="inspect-modal-title">Kaizen Evaluation: {{ selectedDsi.user }}</h2>
                  <p class="inspect-modal-meta">
                    <i class="far fa-calendar-alt"></i> Submitted on {{ formatDate(selectedDsi.date) }}
                  </p>
                </div>
              </div>

              <div class="inspect-header-right">
                <span :class="['status-chip-pill', getStatusClass(selectedDsi.status)]">
                  <i :class="getStatusIcon(selectedDsi.status)"></i>
                  <span>{{ capitalizeFirst(selectedDsi.status) }}</span>
                </span>
                <button class="btn-inspect-close" @click="closeInspectModal" title="Close Modal">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="inspect-modal-body">
              
              <!-- VISUAL EVIDENCE SIDE-BY-SIDE COMPARISON -->
              <div class="inspect-comparison-section">
                <h3 class="section-heading">
                  <i class="fas fa-images"></i> Visual Proof Comparison (Before & After)
                </h3>
                <div class="comparison-grid">
                  <!-- Before View -->
                  <div class="comparison-card before-card">
                    <div class="comparison-card-top before-top">
                      <span><i class="fas fa-history"></i> BEFORE STATE</span>
                      <button 
                        v-if="selectedDsi.beforeImage" 
                        @click="openImage(selectedDsi.beforeImage, 'Before State - ' + selectedDsi.user)" 
                        class="btn-zoom-inline"
                      >
                        <i class="fas fa-expand"></i> Full View
                      </button>
                    </div>
                    <div class="comparison-img-wrap">
                      <img 
                        v-if="selectedDsi.beforeImage" 
                        :src="selectedDsi.beforeImage" 
                        alt="Before" 
                        @click="openImage(selectedDsi.beforeImage, 'Before State - ' + selectedDsi.user)"
                      />
                      <div v-else class="comparison-img-placeholder">
                        <i class="fas fa-image"></i>
                        <span>No Before photo attached</span>
                      </div>
                    </div>
                  </div>

                  <!-- After View -->
                  <div class="comparison-card after-card">
                    <div class="comparison-card-top after-top">
                      <span><i class="fas fa-check-circle"></i> AFTER IMPROVEMENT</span>
                      <button 
                        v-if="selectedDsi.afterImage" 
                        @click="openImage(selectedDsi.afterImage, 'After Improvement - ' + selectedDsi.user)" 
                        class="btn-zoom-inline"
                      >
                        <i class="fas fa-expand"></i> Full View
                      </button>
                    </div>
                    <div class="comparison-img-wrap">
                      <img 
                        v-if="selectedDsi.afterImage" 
                        :src="selectedDsi.afterImage" 
                        alt="After" 
                        @click="openImage(selectedDsi.afterImage, 'After Improvement - ' + selectedDsi.user)"
                      />
                      <div v-else class="comparison-img-placeholder">
                        <i class="fas fa-image"></i>
                        <span>No After photo attached</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3-STEP STRUCTURED DETAILS -->
              <div class="inspect-details-section">
                <h3 class="section-heading">
                  <i class="fas fa-list-check"></i> Kaizen 3-Step Breakdown
                </h3>

                <div class="inspect-steps-grid">
                  <!-- Problem Card -->
                  <div class="inspect-step-box box-problem">
                    <div class="step-box-header header-problem">
                      <span class="step-num-pill">Step 1</span>
                      <i class="fas fa-exclamation-triangle"></i>
                      <h4>Problem Statement</h4>
                    </div>
                    <div class="step-box-body">
                      <p>{{ selectedDsi.problem || 'No description provided.' }}</p>
                    </div>
                  </div>

                  <!-- Solution Card -->
                  <div class="inspect-step-box box-solution">
                    <div class="step-box-header header-solution">
                      <span class="step-num-pill">Step 2</span>
                      <i class="fas fa-lightbulb"></i>
                      <h4>Innovative Solution</h4>
                    </div>
                    <div class="step-box-body">
                      <p>{{ selectedDsi.solution || 'No description provided.' }}</p>
                    </div>
                  </div>

                  <!-- Result Card -->
                  <div class="inspect-step-box box-result">
                    <div class="step-box-header header-result">
                      <span class="step-num-pill">Step 3</span>
                      <i class="fas fa-chart-line"></i>
                      <h4>Quantifiable Result</h4>
                    </div>
                    <div class="step-box-body">
                      <p>{{ selectedDsi.result || 'No description provided.' }}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Modal Footer Controls -->
            <div class="inspect-modal-footer">
              <div class="footer-left-info">
                <span>Current Status: <strong>{{ capitalizeFirst(selectedDsi.status) }}</strong></span>
              </div>
              <div class="footer-right-actions">
                <button 
                  class="btn-modal-action approve"
                  @click="updateModalStatus('Approved')"
                  :disabled="selectedDsi.status === 'approved'"
                >
                  <i class="fas fa-check-circle"></i>
                  <span>Approve Kaizen</span>
                </button>
                <button 
                  class="btn-modal-action reject"
                  @click="updateModalStatus('Rejected')"
                  :disabled="selectedDsi.status === 'rejected'"
                >
                  <i class="fas fa-times-circle"></i>
                  <span>Reject Kaizen</span>
                </button>
                <button class="btn-modal-close-main" @click="closeInspectModal">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- HIGH-RESOLUTION LIGHTBOX IMAGE MODAL -->
        <!-- ============================================ -->
        <div 
          v-if="previewImage" 
          class="lightbox-overlay" 
          @click="closeImageModal"
        >
          <div class="lightbox-content" @click.stop>
            <div class="lightbox-top-bar">
              <span class="lightbox-title">{{ previewTitle || 'Image Preview' }}</span>
              <button class="lightbox-close" @click="closeImageModal" title="Close (Esc)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="lightbox-body">
              <img :src="previewImage" alt="Preview" class="lightbox-img" />
            </div>
          </div>
        </div>

      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
} from "@/utils/toast.js";

export default {
  name: "EmpDsi",
  components: {
    Sidebar
  },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loading: false,
      dsiList: [],
      searchQuery: '',
      statusFilter: 'all', // 'all', 'pending', 'approved', 'rejected'
      viewMode: 'table', // 'table' or 'cards'
      previewImage: null,
      previewTitle: '',
      selectedDsi: null, // For inspection modal
      expandedTexts: new Map(),
    }
  },
  computed: {
    pendingCount() {
      return this.dsiList.filter(item => {
        const s = (item.status || '').toLowerCase()
        return s === 'pending' || s === 'waiting' || !s
      }).length
    },
    approvedCount() {
      return this.dsiList.filter(item => (item.status || '').toLowerCase() === 'approved').length
    },
    rejectedCount() {
      return this.dsiList.filter(item => (item.status || '').toLowerCase() === 'rejected').length
    },
    approvalRate() {
      if (!this.dsiList.length) return 0
      return Math.round((this.approvedCount / this.dsiList.length) * 100)
    },
    filteredDsiList() {
      let list = [...this.dsiList]

      // Filter by Status
      if (this.statusFilter !== 'all') {
        if (this.statusFilter === 'pending') {
          list = list.filter(item => {
            const s = (item.status || '').toLowerCase()
            return s === 'pending' || s === 'waiting' || !s
          })
        } else {
          list = list.filter(item => (item.status || '').toLowerCase() === this.statusFilter)
        }
      }

      // Filter by Search Query
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase()
        list = list.filter(item => {
          const user = (item.user || '').toLowerCase()
          const problem = (item.problem || '').toLowerCase()
          const solution = (item.solution || '').toLowerCase()
          const result = (item.result || '').toLowerCase()
          const id = String(item.id || '')
          return (
            user.includes(q) ||
            problem.includes(q) ||
            solution.includes(q) ||
            result.includes(q) ||
            id.includes(q)
          )
        })
      }

      return list
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    window.addEventListener('keydown', this.handleKeyDown)
    this.fetchAllDSI()

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
    window.removeEventListener('keydown', this.handleKeyDown)
    document.body.style.overflow = ''
  },
  methods: {
    handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (this.previewImage) {
          this.closeImageModal()
        } else if (this.selectedDsi) {
          this.closeInspectModal()
        }
      }
    },
    setStatusFilter(status) {
      this.statusFilter = status
    },
    resetFilters() {
      this.searchQuery = ''
      this.statusFilter = 'all'
    },
    getExpandKey(id, field) {
      return `${id}_${field}`
    },
    isExpanded(id, field) {
      return this.expandedTexts.get(this.getExpandKey(id, field)) === true
    },
    isTextLong(text, length) {
      if (!text || typeof text !== 'string') return false
      return text.length > length
    },
    truncateText(text, length) {
      if (!text || typeof text !== 'string') return '—'
      if (text.length <= length) return text
      return text.substring(0, length) + '...'
    },
    toggleReadMore(id, field) {
      const key = this.getExpandKey(id, field)
      const current = this.expandedTexts.get(key) || false
      this.expandedTexts.set(key, !current)
      this.expandedTexts = new Map(this.expandedTexts)
    },
    getInitials(name) {
      if (!name) return '?'
      return name
        .trim()
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    getUserColor(name) {
      if (!name) return 'linear-gradient(135deg, #6366f1, #4f46e5)'
      const colors = [
        'linear-gradient(135deg, #6366f1, #4f46e5)', // Indigo
        'linear-gradient(135deg, #0ea5e9, #0284c7)', // Sky
        'linear-gradient(135deg, #10b981, #059669)', // Emerald
        'linear-gradient(135deg, #f59e0b, #d97706)', // Amber
        'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Purple
        'linear-gradient(135deg, #ec4899, #db2777)', // Pink
        'linear-gradient(135deg, #14b8a6, #0d9488)', // Teal
      ]
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      const index = Math.abs(hash) % colors.length
      return colors[index]
    },
    formatDate(dateStr) {
      if (!dateStr) return '—'
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (e) {
        return dateStr
      }
    },
    capitalizeFirst(str) {
      if (!str) return 'Pending'
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase()
      if (s === 'approved') return 'approved'
      if (s === 'rejected') return 'rejected'
      return 'pending'
    },
    getStatusIcon(status) {
      const s = (status || '').toLowerCase()
      if (s === 'approved') return 'fas fa-check-circle'
      if (s === 'rejected') return 'fas fa-times-circle'
      return 'fas fa-clock'
    },
    openInspectModal(item) {
      this.selectedDsi = item
      document.body.style.overflow = 'hidden'
    },
    closeInspectModal() {
      this.selectedDsi = null
      if (!this.previewImage) {
        document.body.style.overflow = ''
      }
    },
    openImage(img, title = '') {
      this.previewImage = img
      this.previewTitle = title
      document.body.style.overflow = 'hidden'
    },
    closeImageModal() {
      this.previewImage = null
      this.previewTitle = ''
      if (!this.selectedDsi) {
        document.body.style.overflow = ''
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    async fetchAllDSI() {
      this.loading = true
      try {
        const res = await axios.get('/api/dsis/all')
        this.dsiList = (res.data || []).map(item => ({
          ...item,
          problem: item.problem || '',
          solution: item.solution || '',
          result: item.result || '',
          status: (item.status || 'pending').toLowerCase()
        }))
      } catch (e) {
        console.error('Failed to load DSI:', e)
        toastError('Failed to load DSI records')
      } finally {
        this.loading = false
      }
    },
    async updateStatus(dsiId, status) {
      try {
        const statusToSend = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        await axios.put(`/api/dsis/${dsiId}/status`, { 
          status: statusToSend 
        })
        
        const index = this.dsiList.findIndex(item => item.id === dsiId)
        if (index !== -1) {
          this.dsiList[index].status = status.toLowerCase()
          this.dsiList = [...this.dsiList]
        }

        if (this.selectedDsi && this.selectedDsi.id === dsiId) {
          this.selectedDsi.status = status.toLowerCase()
        }
        
        toastSuccess(`DSI #${dsiId} marked as ${statusToSend}`)
      } catch (error) {
        console.error('Update status error:', error)
        toastError('Failed to update status')
      }
    },
    async updateModalStatus(status) {
      if (!this.selectedDsi) return
      await this.updateStatus(this.selectedDsi.id, status)
    },
    async deleteDSI(id, index) {
      if (!confirm(`Are you sure you want to delete DSI #${id}? This action cannot be undone.`)) {
        return
      }
      try {
        await axios.delete(`/api/dsis/${id}`)
        this.dsiList = this.dsiList.filter(item => item.id !== id)
        if (this.selectedDsi && this.selectedDsi.id === id) {
          this.closeInspectModal()
        }
        toastSuccess(`DSI #${id} deleted successfully.`)
      } catch (error) {
        console.error('Delete error:', error)
        toastError('Failed to delete DSI record.')
      }
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* ======================================================== */
/* DESIGN TOKENS & RESET                                    */
/* ======================================================== */
:root {
  --primary: #4f46e5;
  --primary-light: #e0e7ff;
  --primary-dark: #3730a3;
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-900: #0f172a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: 100vh;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ======================================================== */
/* HERO / TOP BANNER                                        */
/* ======================================================== */
.dsi-hero-banner {
  background: white;
  border-radius: 20px;
  padding: 24px 28px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.banner-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 26px;
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.25);
  flex-shrink: 0;
}

.banner-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #d97706;
  background: #fef3c7;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 6px;
}

.banner-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0;
}

.banner-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  max-width: 650px;
  line-height: 1.4;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-banner-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 9px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-banner-action:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
}

.view-mode-toggle {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* ======================================================== */
/* INTERACTIVE STATS / KPI BAR                              */
/* ======================================================== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.dsi-stat-card {
  background: white;
  border-radius: 18px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.02);
}

.dsi-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  border-color: #cbd5e1;
}

.dsi-stat-card.active {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15), 0 8px 20px rgba(79, 70, 229, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #fafbff 100%);
}

.stat-icon-wrap {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.total-icon {
  background: #ede9fe;
  color: #6366f1;
}

.pending-icon {
  background: #fef3c7;
  color: #d97706;
}

.approved-icon {
  background: #dcfce7;
  color: #16a34a;
}

.rejected-icon {
  background: #fee2e2;
  color: #dc2626;
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-top: 2px;
}

.stat-pill-indicator {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 8px;
}

.stat-badge-pulse {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid #fde68a;
  animation: softPulse 2s infinite ease-in-out;
}

@keyframes softPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.97); }
}

/* ======================================================== */
/* MAIN CONTENT PANEL & TOOLBAR                             */
/* ======================================================== */
.dsi-panel {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f1f5f9;
}

.toolbar-search {
  position: relative;
  flex: 1;
  min-width: 260px;
  max-width: 420px;
}

.search-lens {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 38px 10px 38px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.search-clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.search-clear-btn:hover {
  color: #0f172a;
}

.toolbar-filter-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab-pill:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.filter-tab-pill.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

.filter-tab-pill.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.tab-count {
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 700;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.dot-warn { background: #f59e0b; }
.dot-success { background: #10b981; }
.dot-danger { background: #ef4444; }

.toolbar-right-meta {
  font-size: 12px;
  color: #64748b;
}

/* ======================================================== */
/* STATES: LOADING & EMPTY                                  */
/* ======================================================== */
.state-box {
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
}

.state-spinner {
  font-size: 38px;
  color: #4f46e5;
}

.empty-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fef3c7;
  color: #d97706;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-box h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.state-box p {
  font-size: 13px;
  max-width: 440px;
}

.btn-reset-filters {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #4f46e5;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-reset-filters:hover {
  background: #4338ca;
}

/* ======================================================== */
/* VIEW 1: DATA TABLE STYLING                              */
/* ======================================================== */
.table-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  background: white;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.dsi-modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1100px;
  font-size: 13px;
}

.dsi-modern-table thead {
  background: #f8fafc;
}

.dsi-modern-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.dsi-modern-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  background: white;
  transition: background 0.15s ease;
}

.dsi-table-row:hover td {
  background: #f8fafc;
}

.dsi-table-row.row-highlighted td {
  background: #eef2ff;
}

/* Table Column Widths & Alignments */
.col-seq { width: 44px; text-align: center; }
.col-user { width: 180px; }
.col-date { width: 110px; }
.col-problem { width: 220px; }
.col-solution { width: 220px; }
.col-result { width: 200px; }
.col-media { width: 140px; }
.col-status { width: 120px; }
.col-actions { width: 140px; text-align: center; }

.seq-badge {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

.user-profile-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 13px;
}

.user-id-sub {
  font-size: 11px;
  color: #94a3b8;
  font-family: monospace;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
}

.date-chip i {
  color: #94a3b8;
}

/* 3-Step Content Cells */
.cell-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 6px;
  width: fit-content;
}

.tag-problem {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.tag-solution {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}

.tag-result {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
}

.cell-text-block p {
  font-size: 12px;
  line-height: 1.45;
  color: #334155;
  margin: 0;
}

.cell-text-block p.is-truncated {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-text-expand {
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 0 0 0;
  text-decoration: underline;
  display: block;
}

.btn-text-expand:hover {
  color: #3730a3;
}

/* Media Pair Cell */
.media-pair-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.media-chip {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.media-chip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-chip:hover {
  transform: scale(1.08);
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.media-chip-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 8px;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
  color: white;
  padding: 1px 0;
}

.media-chip-tag.before {
  background: rgba(217, 119, 6, 0.9);
}

.media-chip-tag.after {
  background: rgba(16, 185, 129, 0.9);
}

.zoom-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.media-chip:hover .zoom-hover-overlay {
  opacity: 1;
}

.media-empty-chip {
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
  display: inline-block;
  min-width: 48px;
  text-align: center;
}

/* Status Chips */
.status-chip-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.status-chip-pill.approved {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-chip-pill.pending {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.status-chip-pill.rejected {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* Actions Column */
.action-btn-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.inspect-btn {
  background: #eff6ff;
  color: #2563eb;
  border-color: #dbeafe;
}

.inspect-btn:hover {
  background: #2563eb;
  color: white;
  transform: translateY(-1px);
}

.approve-btn {
  background: #ecfdf5;
  color: #059669;
  border-color: #d1fae5;
}

.approve-btn:hover:not(:disabled) {
  background: #059669;
  color: white;
  transform: translateY(-1px);
}

.approve-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reject-btn {
  background: #fff1f2;
  color: #e11d48;
  border-color: #ffe4e6;
}

.reject-btn:hover:not(:disabled) {
  background: #e11d48;
  color: white;
  transform: translateY(-1px);
}

.reject-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.delete-btn {
  background: #f8fafc;
  color: #64748b;
  border-color: #e2e8f0;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  transform: translateY(-1px);
}

/* ======================================================== */
/* VIEW 2: KAIZEN CARDS GRID                                */
/* ======================================================== */
.cards-grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.kaizen-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.25s ease;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.02);
}

.kaizen-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  border-color: #cbd5e1;
}

.kaizen-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-author-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-author-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.card-date-meta {
  font-size: 11px;
  color: #64748b;
}

.kaizen-steps-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kaizen-step {
  padding: 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.problem-step {
  background: #fffbeb;
  border: 1px solid #fef3c7;
}

.problem-step .step-header {
  color: #b45309;
}

.solution-step {
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.solution-step .step-header {
  color: #1d4ed8;
}

.result-step {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
}

.result-step .step-header {
  color: #15803d;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.step-badge-num {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: currentColor;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
}

.step-text {
  font-size: 12px;
  line-height: 1.5;
  color: #334155;
  margin: 0;
}

.btn-step-toggle {
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-align: left;
  text-decoration: underline;
}

/* Card Visual Showcase */
.card-visual-showcase {
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.showcase-title {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.showcase-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.showcase-photo-box {
  position: relative;
  height: 90px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.showcase-photo-box:hover {
  transform: scale(1.02);
  border-color: #6366f1;
}

.showcase-photo-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
  color: white;
  letter-spacing: 0.03em;
}

.before-tag { background: rgba(217, 119, 6, 0.9); }
.after-tag { background: rgba(16, 185, 129, 0.9); }

.showcase-photo-empty {
  height: 90px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #94a3b8;
  font-size: 11px;
}

/* Card Footer */
.kaizen-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.btn-card-inspect {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-card-inspect:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.footer-status-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-footer-approve {
  background: #10b981;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.btn-footer-approve:hover:not(:disabled) {
  background: #059669;
}

.btn-footer-approve:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-footer-reject {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.btn-footer-reject:hover:not(:disabled) {
  background: #dc2626;
}

.btn-footer-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-footer-delete {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
}

.btn-footer-delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* ======================================================== */
/* INSPECTION & EVALUATION MODAL                            */
/* ======================================================== */
.dsi-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dsi-inspect-modal {
  background: white;
  width: 100%;
  max-width: 960px;
  max-height: 92vh;
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.inspect-modal-header {
  padding: 20px 28px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.inspect-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-avatar {
  width: 48px;
  height: 48px;
  font-size: 16px;
  border-radius: 14px;
}

.inspect-header-badge {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #6366f1;
  background: #e0e7ff;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 4px;
}

.inspect-modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.inspect-modal-meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.inspect-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-inspect-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  background: white;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-inspect-close:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
  transform: rotate(90deg);
}

.inspect-modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-heading {
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

/* Comparison Grid */
.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.comparison-card {
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.before-card { border-color: #fde68a; }
.after-card { border-color: #bbf7d0; }

.comparison-card-top {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.before-top { background: #fef3c7; color: #b45309; }
.after-top { background: #dcfce7; color: #15803d; }

.btn-zoom-inline {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  color: inherit;
}

.comparison-img-wrap {
  position: relative;
  height: 240px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.comparison-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.comparison-img-wrap:hover img {
  transform: scale(1.03);
}

.comparison-img-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 13px;
}

.comparison-img-placeholder i {
  font-size: 36px;
}

/* 3-Step Breakdown */
.inspect-steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.inspect-step-box {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.step-box-header {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-box-header h4 {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.header-problem { background: #fff1f2; color: #be123c; }
.header-solution { background: #eff6ff; color: #1d4ed8; }
.header-result { background: #ecfdf5; color: #047857; }

.step-num-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  background: white;
  color: inherit;
}

.step-box-body {
  padding: 14px;
  background: white;
  font-size: 13px;
  line-height: 1.55;
  color: #334155;
  flex: 1;
}

/* Modal Footer */
.inspect-modal-footer {
  padding: 18px 28px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}

.footer-left-info {
  font-size: 13px;
  color: #475569;
}

.footer-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-modal-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-modal-action.approve {
  background: #10b981;
  color: white;
}

.btn-modal-action.approve:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-modal-action.reject {
  background: #ef4444;
  color: white;
}

.btn-modal-action.reject:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-modal-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-modal-close-main {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-modal-close-main:hover {
  background: #f1f5f9;
}

/* ======================================================== */
/* LIGHTBOX IMAGE VIEWER                                    */
/* ======================================================== */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(8px);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  cursor: pointer;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.lightbox-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  color: white;
  margin-bottom: 8px;
}

.lightbox-title {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.lightbox-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.lightbox-body {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-img {
  max-width: 88vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 14px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
}

/* ======================================================== */
/* RESPONSIVE BREAKPOINTS                                   */
/* ======================================================== */
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
  .inspect-steps-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    gap: 14px;
  }

  .content {
    gap: 14px;
  }

  .dsi-hero-banner {
    padding: 18px 20px;
  }

  .banner-title {
    font-size: 20px;
  }

  .stats-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .toolbar-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-search {
    max-width: 100%;
  }

  .cards-grid-layout {
    grid-template-columns: 1fr;
  }
}
</style>