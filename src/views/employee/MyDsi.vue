<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="dsi-container" v-if="!isMobile || !isSidebarVisible">
        <!-- Hero Header -->
        <header class="dsi-hero">
          <div class="hero-content">
            <div class="hero-title-group">
              <div class="hero-icon-badge">
                <i class="fas fa-lightbulb"></i>
              </div>
              <div>
                <div class="hero-badge">EMPLOYEE INNOVATION HUB</div>
                <h1 class="hero-title">Daily Small Improvement (DSI)</h1>
                <p class="hero-subtitle">Propose ideas, streamline operations, and showcase the impact of your daily improvements.</p>
              </div>
            </div>

            <div class="hero-actions">
              <button class="btn-hero-secondary" @click="loadDSIs" :disabled="loading" title="Refresh List">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                <span class="desktop-only">Refresh</span>
              </button>
              <button class="btn-hero-primary" @click="openAllDsiPopup">
                <i class="fas fa-globe"></i>
                <span>View All DSI</span>
              </button>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div 
              class="stat-pill total" 
              :class="{ active: statusFilter === '' || statusFilter === 'all' }"
              @click="filterByStatus('all')"
            >
              <div class="stat-pill-icon"><i class="fas fa-layer-group"></i></div>
              <div class="stat-pill-content">
                <span class="stat-num">{{ dsiList.length }}</span>
                <span class="stat-txt">Total Ideas</span>
              </div>
            </div>

            <div 
              class="stat-pill approved" 
              :class="{ active: statusFilter === 'Approved' }"
              @click="filterByStatus('Approved')"
            >
              <div class="stat-pill-icon"><i class="fas fa-check-circle"></i></div>
              <div class="stat-pill-content">
                <span class="stat-num">{{ approvedCount }}</span>
                <span class="stat-txt">Approved</span>
              </div>
            </div>

            <div 
              class="stat-pill pending" 
              :class="{ active: statusFilter === 'Waiting' || statusFilter === 'Pending' }"
              @click="filterByStatus('Waiting')"
            >
              <div class="stat-pill-icon"><i class="fas fa-hourglass-half"></i></div>
              <div class="stat-pill-content">
                <span class="stat-num">{{ pendingCount }}</span>
                <span class="stat-txt">Under Review</span>
              </div>
            </div>

            <div 
              class="stat-pill rejected" 
              :class="{ active: statusFilter === 'Rejected' }"
              @click="filterByStatus('Rejected')"
            >
              <div class="stat-pill-icon"><i class="fas fa-times-circle"></i></div>
              <div class="stat-pill-content">
                <span class="stat-num">{{ rejectedCount }}</span>
                <span class="stat-txt">Rejected</span>
              </div>
            </div>
          </div>
        </header>

        <!-- ATTRACTIVE SUBMIT NEW IMPROVEMENT FORM SECTION -->
        <section class="form-section-card">
          <div class="form-section-header" @click="formVisible = !formVisible">
            <div class="header-tagline">
              <div class="tag-icon">
                <i class="fas fa-plus"></i>
              </div>
              <div>
                <h3 class="tag-title">Submit New Improvement</h3>
                <p class="tag-desc">Fill in the 3 steps below and attach visual proof to submit your innovation.</p>
              </div>
            </div>
            <button type="button" class="btn-toggle-form" :class="{ rotated: formVisible }">
              <i class="fas fa-chevron-down"></i>
            </button>
          </div>

          <transition name="expand">
            <div v-show="formVisible" class="form-body-wrapper">
              <form @submit.prevent="addDSI" class="dsi-creation-form">
                
                <!-- 3 STEP CARDS GRID (Clearly isolated & beautifully styled) -->
                <div class="steps-grid">
                  
                  <!-- Step 1: Problem Card -->
                  <div class="step-card step-problem">
                    <div class="step-card-header">
                      <div class="step-badge problem-badge">
                        <span class="step-number">1</span>
                        <i class="fas fa-exclamation-triangle"></i>
                      </div>
                      <div class="step-title-wrap">
                        <h4 class="step-title">Problem Statement</h4>
                        <span class="step-subtitle">What challenge did you face?</span>
                      </div>
                      <span class="req-indicator">*Required</span>
                    </div>

                    <div class="step-card-body">
                      <textarea 
                        v-model="newDSI.problem" 
                        rows="4" 
                        maxlength="300"
                        placeholder="Describe the current issue, bottleneck, quality concern, or waste of time/resources..." 
                        class="step-textarea problem-textarea"
                        required
                      ></textarea>
                    </div>

                    <div class="step-card-footer">
                      <span class="hint"><i class="fas fa-info-circle"></i> Clear & factual</span>
                      <span class="counter" :class="{ 'counter-full': (newDSI.problem || '').length >= 300 }">
                        {{ (newDSI.problem || '').length }} / 300
                      </span>
                    </div>
                  </div>

                  <!-- Step 2: Solution Card -->
                  <div class="step-card step-solution">
                    <div class="step-card-header">
                      <div class="step-badge solution-badge">
                        <span class="step-number">2</span>
                        <i class="fas fa-lightbulb"></i>
                      </div>
                      <div class="step-title-wrap">
                        <h4 class="step-title">Innovative Solution</h4>
                        <span class="step-subtitle">What is your proposed fix?</span>
                      </div>
                      <span class="req-indicator">*Required</span>
                    </div>

                    <div class="step-card-body">
                      <textarea 
                        v-model="newDSI.solution" 
                        rows="4" 
                        maxlength="300"
                        placeholder="Explain the new method, process, tool, automation, or creative approach you implemented..." 
                        class="step-textarea solution-textarea"
                        required
                      ></textarea>
                    </div>

                    <div class="step-card-footer">
                      <span class="hint"><i class="fas fa-tools"></i> Step-by-step method</span>
                      <span class="counter" :class="{ 'counter-full': (newDSI.solution || '').length >= 300 }">
                        {{ (newDSI.solution || '').length }} / 300
                      </span>
                    </div>
                  </div>

                  <!-- Step 3: Result Card -->
                  <div class="step-card step-result">
                    <div class="step-card-header">
                      <div class="step-badge result-badge">
                        <span class="step-number">3</span>
                        <i class="fas fa-chart-line"></i>
                      </div>
                      <div class="step-title-wrap">
                        <h4 class="step-title">Measurable Result</h4>
                        <span class="step-subtitle">What value was created?</span>
                      </div>
                      <span class="req-indicator">*Required</span>
                    </div>

                    <div class="step-card-body">
                      <textarea 
                        v-model="newDSI.result" 
                        rows="4" 
                        maxlength="300"
                        placeholder="Time saved (e.g. 30 mins/day), errors reduced, cost efficiency, safety boost, or cleaner output..." 
                        class="step-textarea result-textarea"
                        required
                      ></textarea>
                    </div>

                    <div class="step-card-footer">
                      <span class="hint"><i class="fas fa-award"></i> Quantifiable impact</span>
                      <span class="counter" :class="{ 'counter-full': (newDSI.result || '').length >= 300 }">
                        {{ (newDSI.result || '').length }} / 300
                      </span>
                    </div>
                  </div>

                </div>

                <!-- SUPPORTING MEDIA UPLOAD SECTION -->
                <div class="media-upload-wrapper">
                  <div class="media-section-head">
                    <div class="media-head-left">
                      <div class="media-icon-badge">
                        <i class="fas fa-camera"></i>
                      </div>
                      <div>
                        <h4 class="media-title">Visual Evidence (Before & After)</h4>
                        <p class="media-subtitle">Photos showcase real impact. Attach images of the previous state vs new state.</p>
                      </div>
                    </div>
                    <span class="optional-badge">Optional</span>
                  </div>

                  <div class="media-boxes-grid">
                    <!-- Before Dropzone -->
                    <div class="media-box before-box" :class="{ 'is-uploaded': !!newDSI.beforeImage }">
                      <input 
                        type="file" 
                        ref="beforeInput"
                        accept="image/png, image/jpeg, image/webp" 
                        @change="onImageChange($event, 'before')" 
                        hidden 
                      />
                      
                      <div v-if="!newDSI.beforeImage" class="media-placeholder" @click="$refs.beforeInput.click()">
                        <div class="media-action-circle before-circle">
                          <i class="fas fa-cloud-arrow-up"></i>
                        </div>
                        <div class="media-text-wrap">
                          <span class="media-drop-title">Upload "BEFORE" Photo</span>
                          <span class="media-drop-sub">JPG, PNG, WebP up to 5MB</span>
                        </div>
                        <span class="btn-browse-pill before-pill">Choose File</span>
                      </div>

                      <div v-else class="media-preview-container">
                        <img :src="newDSI.beforeImage" alt="Before Preview" />
                        <div class="media-preview-glass-bar">
                          <span class="tag-pill before-tag-pill"><i class="fas fa-clock-rotate-left"></i> BEFORE</span>
                          <div class="media-ctrl-buttons">
                            <button type="button" class="btn-ctrl view-btn" @click.stop="openImage(newDSI.beforeImage)" title="Zoom Image">
                              <i class="fas fa-expand"></i>
                            </button>
                            <button type="button" class="btn-ctrl delete-btn" @click.stop="removeImage('before')" title="Remove Image">
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- After Dropzone -->
                    <div class="media-box after-box" :class="{ 'is-uploaded': !!newDSI.afterImage }">
                      <input 
                        type="file" 
                        ref="afterInput"
                        accept="image/png, image/jpeg, image/webp" 
                        @change="onImageChange($event, 'after')" 
                        hidden 
                      />
                      
                      <div v-if="!newDSI.afterImage" class="media-placeholder" @click="$refs.afterInput.click()">
                        <div class="media-action-circle after-circle">
                          <i class="fas fa-cloud-arrow-up"></i>
                        </div>
                        <div class="media-text-wrap">
                          <span class="media-drop-title">Upload "AFTER" Photo</span>
                          <span class="media-drop-sub">JPG, PNG, WebP up to 5MB</span>
                        </div>
                        <span class="btn-browse-pill after-pill">Choose File</span>
                      </div>

                      <div v-else class="media-preview-container">
                        <img :src="newDSI.afterImage" alt="After Preview" />
                        <div class="media-preview-glass-bar">
                          <span class="tag-pill after-tag-pill"><i class="fas fa-circle-check"></i> AFTER</span>
                          <div class="media-ctrl-buttons">
                            <button type="button" class="btn-ctrl view-btn" @click.stop="openImage(newDSI.afterImage)" title="Zoom Image">
                              <i class="fas fa-expand"></i>
                            </button>
                            <button type="button" class="btn-ctrl delete-btn" @click.stop="removeImage('after')" title="Remove Image">
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- FORM SUBMIT CONTROLS -->
                <div class="form-footer-action-bar">
                  <button type="button" class="btn-clear-form" @click="resetForm" :disabled="isSubmitting">
                    <i class="fas fa-arrow-rotate-left"></i> Reset Fields
                  </button>
                  <button type="submit" class="btn-submit-gradient" :disabled="isSubmitting">
                    <span v-if="isSubmitting" class="flex-center gap-8">
                      <i class="fas fa-circle-notch fa-spin"></i> Submitting Improvement...
                    </span>
                    <span v-else class="flex-center gap-8">
                      <i class="fas fa-paper-plane"></i> Publish DSI Improvement
                    </span>
                  </button>
                </div>

              </form>
            </div>
          </transition>
        </section>

        <!-- Listing Section Card -->
        <section class="listing-section-card">
          <!-- Filter / Search Toolbar -->
          <div class="listing-toolbar">
            <div class="toolbar-title-group">
              <div class="toolbar-icon"><i class="fas fa-list-check"></i></div>
              <div>
                <h3 class="toolbar-title">My Improvements Directory</h3>
                <p class="toolbar-desc">Showing {{ filteredDsiList.length }} of {{ dsiList.length }} logged submissions</p>
              </div>
            </div>

            <div class="toolbar-controls">
              <!-- Search box -->
              <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search problem, solution or result..." 
                  class="search-field"
                />
                <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- Status filter pills -->
              <div class="filter-pills-row">
                <button 
                  class="filter-pill" 
                  :class="{ active: statusFilter === '' || statusFilter === 'all' }"
                  @click="filterByStatus('all')"
                >
                  All
                </button>
                <button 
                  class="filter-pill pill-approved" 
                  :class="{ active: statusFilter === 'Approved' }"
                  @click="filterByStatus('Approved')"
                >
                  <span class="dot approved-dot"></span> Approved
                </button>
                <button 
                  class="filter-pill pill-pending" 
                  :class="{ active: statusFilter === 'Waiting' || statusFilter === 'Pending' }"
                  @click="filterByStatus('Waiting')"
                >
                  <span class="dot pending-dot"></span> Review
                </button>
                <button 
                  class="filter-pill pill-rejected" 
                  :class="{ active: statusFilter === 'Rejected' }"
                  @click="filterByStatus('Rejected')"
                >
                  <span class="dot rejected-dot"></span> Rejected
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="state-container loading-state">
            <i class="fas fa-circle-notch fa-spin state-icon"></i>
            <h4>Loading improvements...</h4>
            <p>Fetching your recorded DSI submissions</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredDsiList.length === 0" class="state-container empty-state">
            <div class="empty-icon-wrap">
              <i class="fas fa-lightbulb"></i>
            </div>
            <h4>No Improvements Found</h4>
            <p v-if="searchQuery || statusFilter">
              No DSI items match your current filter settings. Try adjusting your query.
            </p>
            <p v-else>
              You haven't submitted any DSI improvements yet. Use the form above to share your first innovation!
            </p>
            <button v-if="searchQuery || statusFilter" class="btn-clear-filters" @click="clearFilters">
              <i class="fas fa-filter-circle-xmark"></i> Reset Filters
            </button>
          </div>

          <!-- Mobile Cards View -->
          <div v-else-if="isMobile" class="mobile-dsi-feed">
            <div 
              v-for="(item, index) in filteredDsiList" 
              :key="item.id || index" 
              class="mobile-dsi-card"
            >
              <div class="card-top-bar">
                <div class="top-date-wrap">
                  <span class="card-seq">#{{ filteredDsiList.length - index }}</span>
                  <span class="card-date-badge"><i class="far fa-calendar-alt"></i> {{ formatDate(item.date) }}</span>
                </div>
                
                <div class="top-status-wrap">
                  <span :class="['status-chip', getStatusClass(item.status)]">
                    <i :class="getStatusIcon(item.status)"></i>
                    {{ capitalizeFirstLetter(item.status) }}
                  </span>
                  <button 
                    class="btn-delete-item" 
                    @click="deleteDSI(item.id, index)" 
                    title="Delete DSI"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>

              <!-- Content Cards -->
              <div class="mobile-sections-list">
                <div class="mobile-section-block problem-block">
                  <span class="section-badge"><i class="fas fa-exclamation-circle"></i> Problem</span>
                  <p class="section-para">
                    {{ isExpanded(item.id, 'problem') ? (item.problem || '—') : truncateText(item.problem, 80) }}
                  </p>
                  <button 
                    v-if="isTextLong(item.problem, 80)" 
                    @click.stop="toggleReadMore(item.id, 'problem')"
                    class="btn-read-toggle"
                  >
                    {{ isExpanded(item.id, 'problem') ? 'Read Less' : 'Read More' }}
                  </button>
                </div>

                <div class="mobile-section-block solution-block">
                  <span class="section-badge"><i class="fas fa-lightbulb"></i> Solution</span>
                  <p class="section-para">
                    {{ isExpanded(item.id, 'solution') ? (item.solution || '—') : truncateText(item.solution, 80) }}
                  </p>
                  <button 
                    v-if="isTextLong(item.solution, 80)" 
                    @click.stop="toggleReadMore(item.id, 'solution')"
                    class="btn-read-toggle"
                  >
                    {{ isExpanded(item.id, 'solution') ? 'Read Less' : 'Read More' }}
                  </button>
                </div>

                <div class="mobile-section-block result-block">
                  <span class="section-badge"><i class="fas fa-chart-line"></i> Result</span>
                  <p class="section-para">
                    {{ isExpanded(item.id, 'result') ? (item.result || '—') : truncateText(item.result, 80) }}
                  </p>
                  <button 
                    v-if="isTextLong(item.result, 80)" 
                    @click.stop="toggleReadMore(item.id, 'result')"
                    class="btn-read-toggle"
                  >
                    {{ isExpanded(item.id, 'result') ? 'Read Less' : 'Read More' }}
                  </button>
                </div>
              </div>

              <!-- Visual Attachments -->
              <div class="mobile-photos-row" v-if="item.beforeImage || item.afterImage">
                <div 
                  v-if="item.beforeImage" 
                  class="photo-thumb-wrap" 
                  @click="openImage(item.beforeImage)"
                >
                  <img :src="item.beforeImage" alt="Before" loading="lazy" />
                  <span class="thumb-tag before-tag">Before</span>
                </div>
                <div 
                  v-if="item.afterImage" 
                  class="photo-thumb-wrap" 
                  @click="openImage(item.afterImage)"
                >
                  <img :src="item.afterImage" alt="After" loading="lazy" />
                  <span class="thumb-tag after-tag">After</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Modern Table View -->
          <div v-else class="desktop-table-container">
            <table class="dsi-modern-table">
              <thead>
                <tr>
                  <th class="th-num">#</th>
                  <th class="th-date">Date</th>
                  <th class="th-problem">Problem Statement</th>
                  <th class="th-solution">Solution</th>
                  <th class="th-result">Result</th>
                  <th class="th-media">Before</th>
                  <th class="th-media">After</th>
                  <th class="th-status">Status</th>
                  <th class="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredDsiList" :key="item.id || index" class="dsi-table-row">
                  <td class="td-num">
                    <span class="row-index-badge">{{ filteredDsiList.length - index }}</span>
                  </td>
                  <td class="td-date">
                    <div class="date-stacked">
                      <span class="date-main">{{ formatDateMain(item.date) }}</span>
                      <span class="date-year">{{ formatDateYear(item.date) }}</span>
                    </div>
                  </td>

                  <!-- Problem -->
                  <td class="td-problem">
                    <div class="content-cell">
                      <span class="cell-text">
                        {{ isExpanded(item.id, 'problem') ? (item.problem || '—') : truncateText(item.problem, 55) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.problem, 55)" 
                        @click.stop="toggleReadMore(item.id, 'problem')"
                        class="cell-read-more"
                      >
                        {{ isExpanded(item.id, 'problem') ? 'Less' : 'More' }}
                      </button>
                    </div>
                  </td>

                  <!-- Solution -->
                  <td class="td-solution">
                    <div class="content-cell">
                      <span class="cell-text">
                        {{ isExpanded(item.id, 'solution') ? (item.solution || '—') : truncateText(item.solution, 55) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.solution, 55)" 
                        @click.stop="toggleReadMore(item.id, 'solution')"
                        class="cell-read-more"
                      >
                        {{ isExpanded(item.id, 'solution') ? 'Less' : 'More' }}
                      </button>
                    </div>
                  </td>

                  <!-- Result -->
                  <td class="td-result">
                    <div class="content-cell">
                      <span class="cell-text">
                        {{ isExpanded(item.id, 'result') ? (item.result || '—') : truncateText(item.result, 55) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.result, 55)" 
                        @click.stop="toggleReadMore(item.id, 'result')"
                        class="cell-read-more"
                      >
                        {{ isExpanded(item.id, 'result') ? 'Less' : 'More' }}
                      </button>
                    </div>
                  </td>

                  <!-- Before Image -->
                  <td class="td-media">
                    <div v-if="item.beforeImage" class="table-img-hover" @click="openImage(item.beforeImage)">
                      <img :src="item.beforeImage" alt="Before" loading="lazy" />
                      <span class="img-badge before">Before</span>
                    </div>
                    <span v-else class="no-img-dash">—</span>
                  </td>

                  <!-- After Image -->
                  <td class="td-media">
                    <div v-if="item.afterImage" class="table-img-hover" @click="openImage(item.afterImage)">
                      <img :src="item.afterImage" alt="After" loading="lazy" />
                      <span class="img-badge after">After</span>
                    </div>
                    <span v-else class="no-img-dash">—</span>
                  </td>

                  <!-- Status -->
                  <td class="td-status">
                    <span :class="['status-pill-badge', getStatusClass(item.status)]">
                      <i :class="getStatusIcon(item.status)"></i>
                      {{ capitalizeFirstLetter(item.status) }}
                    </span>
                  </td>

                  <!-- Action -->
                  <td class="td-action">
                    <button 
                      class="btn-table-delete" 
                      @click="deleteDSI(item.id, index)" 
                      title="Delete this DSI record"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>

    <!-- All DSI Modal Popup -->
    <div v-if="showAllDsiPopup" class="modal-backdrop" @click.self="closeAllDsiPopup">
      <div class="modal-panel animate-scale">
        <div class="modal-panel-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge"><i class="fas fa-globe"></i></div>
            <div>
              <h3>Organization Improvement Feed</h3>
              <p>All innovation contributions submitted across the company</p>
            </div>
          </div>
          <button class="btn-modal-close" @click="closeAllDsiPopup" title="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Search Bar -->
        <div class="modal-search-row">
          <div class="modal-search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="allDsiSearch" 
              placeholder="Filter company-wide DSI submissions by keyword or author..." 
            />
          </div>
          <span class="records-pill">{{ filteredAllDsiList.length }} Records</span>
        </div>

        <div class="modal-panel-body">
          <div v-if="allDsiLoading" class="modal-loading-wrap">
            <i class="fas fa-circle-notch fa-spin"></i>
            <span>Loading company DSI records...</span>
          </div>

          <div v-else-if="filteredAllDsiList.length === 0" class="modal-empty-wrap">
            <i class="fas fa-inbox"></i>
            <p>No records match your query.</p>
          </div>

          <div v-else class="modal-table-wrap">
            <table class="modal-custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Contributor</th>
                  <th>Problem</th>
                  <th>Solution</th>
                  <th>Result</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in filteredAllDsiList" :key="item.id || i">
                  <td class="modal-td-num">{{ i + 1 }}</td>
                  <td class="modal-td-user">
                    <div class="user-avatar-badge">
                      <div class="avatar-circle">{{ getInitials(item.user || item.user_name || 'Emp') }}</div>
                      <span>{{ item.user || item.user_name || 'Colleague' }}</span>
                    </div>
                  </td>
                  <td class="modal-td-text">
                    <div class="content-cell">
                      <span>{{ isPopupExpanded(item.id, 'problem') ? (item.problem || '—') : truncateText(item.problem, 40) }}</span>
                      <button v-if="isTextLong(item.problem, 40)" @click.stop="togglePopupReadMore(item.id, 'problem')" class="cell-read-more">
                        {{ isPopupExpanded(item.id, 'problem') ? 'Less' : 'More' }}
                      </button>
                    </div>
                  </td>
                  <td class="modal-td-text">
                    <div class="content-cell">
                      <span>{{ isPopupExpanded(item.id, 'solution') ? (item.solution || '—') : truncateText(item.solution, 40) }}</span>
                      <button v-if="isTextLong(item.solution, 40)" @click.stop="togglePopupReadMore(item.id, 'solution')" class="cell-read-more">
                        {{ isPopupExpanded(item.id, 'solution') ? 'Less' : 'More' }}
                      </button>
                    </div>
                  </td>
                  <td class="modal-td-text">
                    <div class="content-cell">
                      <span>{{ isPopupExpanded(item.id, 'result') ? (item.result || '—') : truncateText(item.result, 40) }}</span>
                      <button v-if="isTextLong(item.result, 40)" @click.stop="togglePopupReadMore(item.id, 'result')" class="cell-read-more">
                        {{ isPopupExpanded(item.id, 'result') ? 'Less' : 'More' }}
                      </button>
                    </div>
                  </td>
                  <td class="modal-td-media">
                    <img v-if="item.beforeImage" :src="item.beforeImage" class="mini-thumb" @click="openImage(item.beforeImage)" alt="Before" />
                    <span v-else class="no-img-dash">—</span>
                  </td>
                  <td class="modal-td-media">
                    <img v-if="item.afterImage" :src="item.afterImage" class="mini-thumb" @click="openImage(item.afterImage)" alt="After" />
                    <span v-else class="no-img-dash">—</span>
                  </td>
                  <td class="modal-td-date">{{ formatDate(item.date) }}</td>
                  <td class="modal-td-status">
                    <span :class="['status-pill-badge', getStatusClass(item.status)]">
                      {{ capitalizeFirstLetter(item.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-panel-footer">
          <button class="btn-modal-done" @click="closeAllDsiPopup">
            <i class="fas fa-check"></i> Done
          </button>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div v-if="previewImage" class="lightbox-backdrop" @click="previewImage = null">
      <div class="lightbox-panel animate-scale" @click.stop>
        <button class="lightbox-close-btn" @click="previewImage = null" title="Close Preview">
          <i class="fas fa-times"></i>
        </button>
        <img :src="previewImage" alt="DSI Evidence Preview" class="lightbox-full-img" />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "MyDsi",
  components: {
    Sidebar
  },
  data() {
    return {
      loading: false,
      allDsiLoading: false,
      isSubmitting: false,
      showAllDsiPopup: false,
      isMobile: false,
      isSidebarVisible: true,
      formVisible: true,
      searchQuery: '',
      allDsiSearch: '',
      statusFilter: '',
      expandedTexts: new Map(),
      popupExpandedTexts: new Map(),
      newDSI: {
        problem: "",
        solution: "",
        result: "",
        beforeImage: null,
        afterImage: null,
        beforeImageFile: null,
        afterImageFile: null,
      },
      dsiList: [],
      allDsiList: [],
      previewImage: null,
    }
  },
  computed: {
    approvedCount() {
      return this.dsiList.filter(item => (item.status || '').toLowerCase() === 'approved').length;
    },
    pendingCount() {
      return this.dsiList.filter(item => {
        const s = (item.status || '').toLowerCase();
        return s === 'waiting' || s === 'pending' || s === '';
      }).length;
    },
    rejectedCount() {
      return this.dsiList.filter(item => (item.status || '').toLowerCase() === 'rejected').length;
    },
    filteredDsiList() {
      let filtered = this.dsiList;
      
      // Status filter
      if (this.statusFilter && this.statusFilter !== 'all') {
        const target = this.statusFilter.toLowerCase();
        filtered = filtered.filter(item => {
          const s = (item.status || '').toLowerCase();
          if (target === 'waiting' || target === 'pending') {
            return s === 'waiting' || s === 'pending' || s === '';
          }
          return s === target;
        });
      }

      // Search filter
      if (this.searchQuery && this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(item => 
          (item.problem && item.problem.toLowerCase().includes(query)) ||
          (item.solution && item.solution.toLowerCase().includes(query)) ||
          (item.result && item.result.toLowerCase().includes(query))
        );
      }
      
      return filtered;
    },
    filteredAllDsiList() {
      if (!this.allDsiSearch || !this.allDsiSearch.trim()) {
        return this.allDsiList;
      }
      const q = this.allDsiSearch.toLowerCase().trim();
      return this.allDsiList.filter(item => 
        (item.problem && item.problem.toLowerCase().includes(q)) ||
        (item.solution && item.solution.toLowerCase().includes(q)) ||
        (item.result && item.result.toLowerCase().includes(q)) ||
        (item.user && item.user.toLowerCase().includes(q)) ||
        (item.user_name && item.user_name.toLowerCase().includes(q))
      );
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadDSIs();
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    clearFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
    },
    filterByStatus(status) {
      if (status === 'all') {
        this.statusFilter = '';
      } else {
        this.statusFilter = this.statusFilter === status ? '' : status;
      }
    },
    getExpandKey(id, field) {
      return `${id}_${field}`;
    },
    isExpanded(id, field) {
      const key = this.getExpandKey(id, field);
      return this.expandedTexts.get(key) === true;
    },
    isPopupExpanded(id, field) {
      const key = this.getExpandKey(id, field);
      return this.popupExpandedTexts.get(key) === true;
    },
    isTextLong(text, length) {
      if (!text || typeof text !== 'string') return false;
      return text.length > length;
    },
    truncateText(text, length) {
      if (!text || typeof text !== 'string') return '—';
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    },
    toggleReadMore(id, field) {
      const key = this.getExpandKey(id, field);
      const currentState = this.expandedTexts.get(key) || false;
      this.expandedTexts.set(key, !currentState);
      this.expandedTexts = new Map(this.expandedTexts);
    },
    togglePopupReadMore(id, field) {
      const key = this.getExpandKey(id, field);
      const currentState = this.popupExpandedTexts.get(key) || false;
      this.popupExpandedTexts.set(key, !currentState);
      this.popupExpandedTexts = new Map(this.popupExpandedTexts);
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'status-approved';
      if (s === 'rejected') return 'status-rejected';
      return 'status-pending';
    },
    getStatusIcon(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'fas fa-check-circle';
      if (s === 'rejected') return 'fas fa-times-circle';
      return 'fas fa-hourglass-half';
    },
    formatDate(date) {
      if (!date) return '—';
      try {
        return new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch (e) {
        return '—';
      }
    },
    formatDateMain(date) {
      if (!date) return '—';
      try {
        return new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short'
        });
      } catch (e) {
        return '—';
      }
    },
    formatDateYear(date) {
      if (!date) return '';
      try {
        return new Date(date).getFullYear();
      } catch (e) {
        return '';
      }
    },
    getInitials(name) {
      if (!name) return 'DS';
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    },
    capitalizeFirstLetter(text) {
      if (!text || typeof text !== 'string') return 'Pending';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    resetForm() {
      this.newDSI = {
        problem: '',
        solution: '',
        result: '',
        beforeImage: null,
        afterImage: null,
        beforeImageFile: null,
        afterImageFile: null
      };
      if (this.$refs.beforeInput) this.$refs.beforeInput.value = '';
      if (this.$refs.afterInput) this.$refs.afterInput.value = '';
    },
    removeImage(type) {
      if (type === 'before') {
        this.newDSI.beforeImage = null;
        this.newDSI.beforeImageFile = null;
        if (this.$refs.beforeInput) this.$refs.beforeInput.value = '';
      } else {
        this.newDSI.afterImage = null;
        this.newDSI.afterImageFile = null;
        if (this.$refs.afterInput) this.$refs.afterInput.value = '';
      }
    },
    async deleteDSI(id, index) {
      if (!confirm('Are you sure you want to delete this DSI entry? This action cannot be undone.')) return;
      try {
        await axios.delete(`/api/dsis/${id}`);
        this.dsiList.splice(index, 1);
        toastSuccess('DSI removed successfully.');
      } catch (error) {
        console.error('Delete error:', error);
        toastError('Failed to delete DSI item.');
      }
    },
    async openAllDsiPopup() {
      this.showAllDsiPopup = true;
      await this.fetchAllDSI();
    },
    async fetchAllDSI() {
      this.allDsiLoading = true;
      try {
        const res = await axios.get('/api/dsis/all');
        const fixUrl = (url) => url ? url.replace('/api/backend', '/backend') : null;
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.allDsiList = list.map(dsi => ({
          id: dsi.id,
          problem: dsi.problem || '',
          solution: dsi.solution || '',
          result: dsi.result || '',
          beforeImage: fixUrl(dsi.before_image),
          afterImage: fixUrl(dsi.after_image),
          date: dsi.created_at,
          status: dsi.status || 'Waiting',
          user: dsi.user_name || dsi.user || 'Team Member'
        }));
      } catch (e) {
        console.error('Failed to load all DSIs:', e);
        toastError('Failed to load organizational DSI records.');
      } finally {
        this.allDsiLoading = false;
      }
    },
    closeAllDsiPopup() {
      this.showAllDsiPopup = false;
      this.allDsiSearch = '';
      this.popupExpandedTexts.clear();
      this.popupExpandedTexts = new Map();
    },
    async loadDSIs() {
      this.loading = true;
      try {
        const res = await axios.get('/api/dsis');
        const fixUrl = (url) => url ? url.replace('/api/backend', '/backend') : null;
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.dsiList = list.map(dsi => ({
          id: dsi.id,
          problem: dsi.problem || '',
          solution: dsi.solution || '',
          result: dsi.result || '',
          beforeImage: fixUrl(dsi.before_image),
          afterImage: fixUrl(dsi.after_image),
          date: dsi.created_at,
          status: dsi.status || 'Waiting',
          user: dsi.user_name || dsi.user
        }));
      } catch (error) {
        console.error('Failed to load DSIs:', error);
        toastError('Failed to load your improvements.');
      } finally {
        this.loading = false;
      }
    },
    async addDSI() {
      if (this.isSubmitting) return;
      if (!this.newDSI.problem.trim() || !this.newDSI.solution.trim() || !this.newDSI.result.trim()) {
        toastWarning('Please fill in Problem, Solution, and Result.');
        return;
      }

      this.isSubmitting = true;
      try {
        const formData = new FormData();
        formData.append('problem', this.newDSI.problem.trim());
        formData.append('solution', this.newDSI.solution.trim());
        formData.append('result', this.newDSI.result.trim());
        if (this.newDSI.beforeImageFile) formData.append('before_image', this.newDSI.beforeImageFile);
        if (this.newDSI.afterImageFile) formData.append('after_image', this.newDSI.afterImageFile);

        const res = await axios.post('/api/dsis', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const fixUrl = (url) => url ? url.replace('/api/backend', '/backend') : null;
        const rawDsi = res.data?.dsi || res.data;
        const newDsi = {
          id: rawDsi.id || Date.now(),
          problem: rawDsi.problem || this.newDSI.problem,
          solution: rawDsi.solution || this.newDSI.solution,
          result: rawDsi.result || this.newDSI.result,
          beforeImage: fixUrl(rawDsi.before_image) || this.newDSI.beforeImage,
          afterImage: fixUrl(rawDsi.after_image) || this.newDSI.afterImage,
          date: rawDsi.created_at || new Date().toISOString(),
          status: rawDsi.status || 'Waiting'
        };
        this.dsiList.unshift(newDsi);
        this.resetForm();
        toastSuccess('🎉 Improvement submitted successfully!');
      } catch (error) {
        console.error('Add DSI error:', error);
        const msg = error.response?.data?.message || 'Failed to submit improvement. Please try again.';
        toastError(msg);
      } finally {
        this.isSubmitting = false;
      }
    },
    onImageChange(e, type) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toastWarning('Image size must be under 5MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'before') {
          this.newDSI.beforeImage = event.target.result;
          this.newDSI.beforeImageFile = file;
        } else {
          this.newDSI.afterImage = event.target.result;
          this.newDSI.afterImageFile = file;
        }
      };
      reader.readAsDataURL(file);
    },
    openImage(img) {
      if (img) {
        this.previewImage = img;
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 860;
      this.isSidebarVisible = !this.isMobile;
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Global Reset & Base */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.layout {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.dsi-container {
  flex: 1;
  padding: 24px 32px;
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.flex-center {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.gap-8 {
  gap: 8px;
}

/* ========================================================
   HERO HEADER
   ======================================================== */
.dsi-hero {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%);
  border-radius: 24px;
  padding: 30px;
  color: #ffffff;
  box-shadow: 0 20px 40px -15px rgba(49, 46, 129, 0.35);
  position: relative;
  overflow: hidden;
}

.dsi-hero::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.hero-title-group {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-icon-badge {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fde047;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.hero-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #a5b4fc;
  margin-bottom: 4px;
}

.hero-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 13.5px;
  color: #c7d2fe;
  margin-top: 6px;
  max-width: 580px;
  line-height: 1.45;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.btn-hero-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-size: 13.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(16, 185, 129, 0.45);
}

.btn-hero-secondary {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 11px 16px;
  font-size: 13.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-hero-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  position: relative;
  z-index: 1;
}

.stat-pill {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);
}

.stat-pill:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stat-pill.active {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.stat-pill-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.stat-pill.total .stat-pill-icon {
  background: rgba(99, 102, 241, 0.25);
  color: #c7d2fe;
}

.stat-pill.approved .stat-pill-icon {
  background: rgba(16, 185, 129, 0.25);
  color: #6ee7b7;
}

.stat-pill.pending .stat-pill-icon {
  background: rgba(245, 158, 11, 0.25);
  color: #fde68a;
}

.stat-pill.rejected .stat-pill-icon {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}

.stat-pill-content {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
  color: #ffffff;
}

.stat-txt {
  font-size: 11.5px;
  color: #e0e7ff;
  font-weight: 500;
}

/* ========================================================
   ATTRACTIVE FORM SECTION & STEP CARDS
   ======================================================== */
.form-section-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-section-header {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  user-select: none;
}

.form-section-header:hover {
  background: #f8fafc;
}

.header-tagline {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tag-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
  flex-shrink: 0;
}

.tag-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.tag-desc {
  font-size: 12.5px;
  color: #64748b;
  margin-top: 2px;
}

.btn-toggle-form {
  background: #f1f5f9;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-toggle-form.rotated {
  transform: rotate(180deg);
  background: #e0e7ff;
  color: #4338ca;
}

.form-body-wrapper {
  padding: 24px;
  background: #fcfdfe;
}

/* 3 Step Cards Grid */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.step-card {
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s ease;
  min-width: 0; /* Prevents overflow mashing */
}

/* Problem Card Theme */
.step-problem {
  background: #fff8f8;
  border: 1.5px solid #fed7d7;
}

.step-problem:focus-within {
  border-color: #e53e3e;
  box-shadow: 0 6px 18px rgba(229, 62, 62, 0.12);
  background: #ffffff;
}

.problem-badge {
  background: #fee2e2;
  color: #dc2626;
}

.problem-textarea:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

/* Solution Card Theme */
.step-solution {
  background: #fffdf5;
  border: 1.5px solid #feebc8;
}

.step-solution:focus-within {
  border-color: #dd6b20;
  box-shadow: 0 6px 18px rgba(221, 107, 32, 0.12);
  background: #ffffff;
}

.solution-badge {
  background: #fef3c7;
  color: #d97706;
}

.solution-textarea:focus {
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
}

/* Result Card Theme */
.step-result {
  background: #f6fdf9;
  border: 1.5px solid #c6f6d5;
}

.step-result:focus-within {
  border-color: #38a169;
  box-shadow: 0 6px 18px rgba(56, 161, 105, 0.12);
  background: #ffffff;
}

.result-badge {
  background: #dcfce7;
  color: #16a34a;
}

.result-textarea:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
}

/* Step Card Header */
.step-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  gap: 3px;
  flex-shrink: 0;
}

.step-number {
  font-size: 12px;
}

.step-title-wrap {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

.step-subtitle {
  font-size: 11px;
  color: #64748b;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.req-indicator {
  font-size: 10.5px;
  font-weight: 700;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
  padding: 2px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}

/* Step Card Body & Textarea */
.step-card-body {
  width: 100%;
}

.step-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  color: #1e293b;
  background: #ffffff;
  resize: vertical;
  min-height: 100px;
  line-height: 1.45;
  transition: all 0.2s ease;
}

.step-textarea::placeholder {
  color: #94a3b8;
  font-size: 12.5px;
}

.step-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #64748b;
  padding-top: 2px;
}

.step-card-footer .hint {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
}

.step-card-footer .counter {
  font-weight: 700;
  color: #94a3b8;
}

.step-card-footer .counter-full {
  color: #dc2626;
}

/* ========================================================
   MEDIA UPLOAD SECTION
   ======================================================== */
.media-upload-wrapper {
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 24px;
}

.media-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.media-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.media-icon-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #e0e7ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.media-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #1e293b;
}

.media-subtitle {
  font-size: 12px;
  color: #64748b;
}

.optional-badge {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  background: #e2e8f0;
  padding: 3px 8px;
  border-radius: 6px;
}

.media-boxes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.media-box {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  min-height: 140px;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

.media-box:hover {
  border-color: #818cf8;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.08);
}

.media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 22px;
  cursor: pointer;
  text-align: center;
  height: 100%;
}

.media-action-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.before-circle {
  background: #e0e7ff;
  color: #4f46e5;
}

.after-circle {
  background: #dcfce7;
  color: #16a34a;
}

.media-drop-title {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
}

.media-drop-sub {
  display: block;
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
}

.btn-browse-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

.before-pill {
  background: #e0e7ff;
  color: #4338ca;
}

.after-pill {
  background: #dcfce7;
  color: #15803d;
}

.media-preview-container {
  width: 100%;
  height: 150px;
  position: relative;
}

.media-preview-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-preview-glass-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, transparent 60%);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 10px 14px;
}

.tag-pill {
  font-size: 10.5px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.before-tag-pill {
  background: #4f46e5;
}

.after-tag-pill {
  background: #10b981;
}

.media-ctrl-buttons {
  display: flex;
  gap: 6px;
}

.btn-ctrl {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-ctrl.view-btn {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
}

.btn-ctrl.delete-btn {
  background: #ef4444;
}

.btn-ctrl:hover {
  transform: scale(1.1);
}

/* Form Action Footer */
.form-footer-action-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.btn-clear-form {
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 13.5px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-clear-form:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-submit-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
  transition: all 0.25s ease;
}

.btn-submit-gradient:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(79, 70, 229, 0.45);
}

.btn-submit-gradient:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ========================================================
   DIRECTORY / LISTING SECTION
   ======================================================== */
.listing-section-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.listing-toolbar {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
}

.toolbar-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #e0e7ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.toolbar-desc {
  font-size: 12px;
  color: #64748b;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.search-field {
  width: 100%;
  padding: 9px 32px 9px 34px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.search-field:focus {
  outline: none;
  background: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.search-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
}

.filter-pills-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}

.filter-pill {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.filter-pill.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.approved-dot { background: #10b981; }
.pending-dot { background: #f59e0b; }
.rejected-dot { background: #ef4444; }

/* States */
.state-container {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.state-icon {
  font-size: 36px;
  color: #6366f1;
  margin-bottom: 14px;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 14px;
}

.empty-state h4 {
  font-size: 16px;
  font-weight: 800;
  color: #334155;
  margin-bottom: 4px;
}

.empty-state p {
  font-size: 13px;
  color: #64748b;
  max-width: 400px;
}

.btn-clear-filters {
  margin-top: 14px;
  background: #e0e7ff;
  color: #4338ca;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ========================================================
   DESKTOP TABLE VIEW
   ======================================================== */
.desktop-table-container {
  width: 100%;
  overflow-x: auto;
}

.dsi-modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.dsi-modern-table thead tr {
  background: #f8fafc;
}

.dsi-modern-table th {
  padding: 14px 18px;
  font-size: 11.5px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1.5px solid #e2e8f0;
}

.th-num { width: 50px; text-align: center; }
.th-date { width: 90px; }
.th-problem { width: 22%; }
.th-solution { width: 22%; }
.th-result { width: 22%; }
.th-media { width: 70px; text-align: center; }
.th-status { width: 110px; text-align: center; }
.th-action { width: 60px; text-align: center; }

.dsi-table-row {
  transition: background 0.2s ease;
}

.dsi-table-row:hover {
  background: #f8fafc;
}

.dsi-modern-table td {
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 13px;
}

.row-index-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
}

.date-stacked {
  display: flex;
  flex-direction: column;
}

.date-main {
  font-weight: 800;
  color: #1e293b;
  font-size: 13px;
}

.date-year {
  font-size: 11px;
  color: #94a3b8;
}

.content-cell {
  position: relative;
  line-height: 1.45;
  color: #334155;
}

.cell-text {
  word-break: break-word;
}

.cell-read-more {
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  margin-left: 4px;
  padding: 0;
  text-decoration: underline;
}

/* Image Thumbnails in Table */
.table-img-hover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  margin: 0 auto;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.table-img-hover:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  border-color: #6366f1;
}

.table-img-hover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 8.5px;
  font-weight: 800;
  text-align: center;
  color: #ffffff;
  padding: 1px 0;
  text-transform: uppercase;
}

.img-badge.before { background: rgba(79, 70, 229, 0.85); }
.img-badge.after { background: rgba(16, 185, 129, 0.85); }

.no-img-dash {
  color: #cbd5e1;
  text-align: center;
  display: block;
  font-size: 16px;
}

/* Status Badges */
.status-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.status-approved {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-pending {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.status-rejected {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.btn-table-delete {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-table-delete:hover {
  background: #ef4444;
  color: #ffffff;
  transform: scale(1.1);
}

/* ========================================================
   MOBILE FEED VIEW
   ======================================================== */
.mobile-dsi-feed {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-dsi-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.card-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.top-date-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-seq {
  font-weight: 800;
  color: #6366f1;
  font-size: 13px;
}

.card-date-badge {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.top-status-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-chip {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-delete-item {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.mobile-sections-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.mobile-section-block {
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
}

.section-badge {
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}

.problem-block .section-badge { color: #dc2626; }
.solution-block .section-badge { color: #d97706; }
.result-block .section-badge { color: #16a34a; }

.section-para {
  font-size: 12.5px;
  color: #334155;
  line-height: 1.4;
}

.btn-read-toggle {
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 0 0 0;
  text-decoration: underline;
}

.mobile-photos-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 8px;
}

.photo-thumb-wrap {
  height: 90px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e2e8f0;
}

.photo-thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 9px;
  font-weight: 800;
  text-align: center;
  color: #ffffff;
  padding: 2px 0;
}

/* ========================================================
   MODAL PANEL (ALL DSI)
   ======================================================== */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-panel {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 1100px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.modal-panel-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #e0e7ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.modal-title-wrap h3 {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.modal-title-wrap p {
  font-size: 12px;
  color: #64748b;
}

.btn-modal-close {
  background: #f1f5f9;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-close:hover {
  background: #fee2e2;
  color: #ef4444;
}

.modal-search-row {
  padding: 12px 24px;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-search-box {
  position: relative;
  flex: 1;
}

.modal-search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.modal-search-box input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
}

.records-pill {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  background: #e2e8f0;
  padding: 4px 10px;
  border-radius: 8px;
}

.modal-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.modal-loading-wrap, .modal-empty-wrap {
  text-align: center;
  padding: 50px 20px;
  color: #64748b;
}

.modal-loading-wrap i {
  font-size: 28px;
  color: #6366f1;
  margin-bottom: 10px;
  display: block;
}

.modal-custom-table {
  width: 100%;
  border-collapse: collapse;
}

.modal-custom-table th {
  background: #f8fafc;
  padding: 12px 14px;
  font-size: 11.5px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  border-bottom: 1.5px solid #e2e8f0;
  text-align: left;
}

.modal-custom-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 12.5px;
}

.user-avatar-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #1e293b;
}

.avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #6366f1;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-thumb {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
}

.modal-panel-footer {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.btn-modal-done {
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ========================================================
   LIGHTBOX MODAL
   ======================================================== */
.lightbox-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 20px;
}

.lightbox-panel {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox-full-img {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  object-fit: contain;
}

.lightbox-close-btn {
  position: absolute;
  top: -14px;
  right: -14px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffffff;
  color: #0f172a;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Animations */
.animate-scale {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.desktop-only {
  display: inline-block;
}

/* Responsive */
@media (max-width: 1080px) {
  .dsi-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .desktop-only {
    display: none;
  }

  .hero-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }

  .media-boxes-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-controls {
    width: 100%;
    flex-direction: column;
  }

  .search-input-wrapper {
    width: 100%;
  }

  .filter-pills-row {
    width: 100%;
    justify-content: space-between;
  }
}
</style>