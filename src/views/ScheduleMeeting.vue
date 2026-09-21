<template>
  <div class="layout">
    <!-- Main Content Area -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-calendar-plus"></i>
            <span>Schedule Meeting</span>
          </div>
          <button 
            type="button" 
            class="mobile-tab-pill"
            @click="selectTab(activeTab === 'online' ? 'offline' : 'online')"
          >
            <i :class="activeTab === 'online' ? 'fas fa-building' : 'fas fa-video'"></i>
            <span>Switch to {{ activeTab === 'online' ? 'Offline' : 'Online' }}</span>
          </button>
        </div>

        <!-- 🏢 Desktop Header Banner -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div>
              <div class="header-badge-row">
                <span class="badge-accent">Enterprise Hub</span>
                <span class="badge-status-dot">
                  <span class="dot-pulse"></span> Synchronized Directory
                </span>
              </div>
              <h1 class="page-title">Schedule a Meeting</h1>
              <p class="subtitle-modern">
                Organize video conferences or in-office sessions with targeted employees and teams
              </p>
            </div>
          </div>

          <div class="header-right-actions">
            <div class="directory-quick-stat">
              <i class="fas fa-user-check"></i>
              <span><strong>{{ employees.length }}</strong> Team Members Available</span>
            </div>
          </div>
        </div>

        <!-- 🌿 Main Card Wrapper -->
        <div class="schedule-card-wrapper">
          
          <!-- Segmented Tab Switcher (Online vs Offline) -->
          <div class="tabs-header-bar">
            <div class="tabs-segmented-wrapper">
              <button
                type="button"
                :class="['tab-btn', { active: activeTab === 'online' }]"
                @click="selectTab('online')"
              >
                <div class="tab-icon-wrap">
                  <i class="fas fa-video"></i>
                </div>
                <div class="tab-text-wrap">
                  <span class="tab-main-label">Online Meeting</span>
                  <span class="tab-sub-label">Instant Video Conference</span>
                </div>
              </button>

              <button
                type="button"
                :class="['tab-btn', { active: activeTab === 'offline' }]"
                @click="selectTab('offline')"
              >
                <div class="tab-icon-wrap">
                  <i class="fas fa-building"></i>
                </div>
                <div class="tab-text-wrap">
                  <span class="tab-main-label">In-Person Meeting</span>
                  <span class="tab-sub-label">On-Site Office Session</span>
                </div>
              </button>
            </div>

            <!-- Quick Attendees Counter in Tab Bar -->
            <div class="tab-bar-summary">
              <div class="attendees-badge-pill" :class="{ 'has-attendees': allGuestEmails.length > 0 }">
                <i class="fas fa-user-friends"></i>
                <span><strong>{{ allGuestEmails.length }}</strong> Attendee{{ allGuestEmails.length === 1 ? '' : 's' }} Selected</span>
              </div>
            </div>
          </div>

          <!-- Success Alert Message -->
          <transition name="fade">
            <div v-if="successMessage" class="alert-banner success">
              <div class="alert-content">
                <i class="fas fa-check-circle alert-icon"></i>
                <span>{{ successMessage }}</span>
              </div>
              <button type="button" class="alert-close" @click="successMessage = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </transition>

          <!-- Error Alert Message -->
          <transition name="fade">
            <div v-if="errorMessage" class="alert-banner danger">
              <div class="alert-content">
                <i class="fas fa-exclamation-circle alert-icon"></i>
                <span>{{ errorMessage }}</span>
              </div>
              <button type="button" class="alert-close" @click="errorMessage = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </transition>

          <!-- Form Grid (Left: Form Details & Attendees Selector | Right: Executive Live Preview) -->
          <div class="schedule-grid">
            
            <!-- ◀️ LEFT COLUMN: Form & Attendee Directory -->
            <div class="form-column-left">

              <!-- ============================================== -->
              <!-- 1. SECTION: MEETING CORE DETAILS                -->
              <!-- ============================================== -->
              <div class="form-card-section">
                <div class="section-title-bar">
                  <div class="section-title-left">
                    <span class="step-num">1</span>
                    <div>
                      <h3 class="section-heading">Meeting Details</h3>
                      <p class="section-subheading">Define the agenda, schedule, and environment</p>
                    </div>
                  </div>
                  <span class="type-pill" :class="activeTab">
                    <i :class="activeTab === 'online' ? 'fas fa-globe' : 'fas fa-map-marker-alt'"></i>
                    {{ activeTab === 'online' ? 'Virtual Video Room' : 'Physical Conference' }}
                  </span>
                </div>

                <div class="section-body">
                  <!-- Meeting Title -->
                  <div class="form-group">
                    <label for="meetingTitle" class="field-label">
                      <i class="fas fa-heading"></i> Meeting Title <span class="required-star">*</span>
                    </label>
                    <div class="input-wrapper">
                      <input
                        type="text"
                        id="meetingTitle"
                        v-model="meetingForm.title"
                        class="form-control"
                        placeholder="e.g. Q4 Performance Strategy & Project Roadmap"
                        maxlength="100"
                      />
                    </div>
                    <div class="field-footer-info">
                      <span class="hint-text">Give your meeting a concise, descriptive title</span>
                      <small class="char-count">{{ meetingForm.title.length }}/100</small>
                    </div>
                  </div>

                  <!-- Description & Agenda -->
                  <div class="form-group">
                    <label for="meetingDescription" class="field-label">
                      <i class="fas fa-align-left"></i> Description & Discussion Topics
                    </label>
                    <textarea
                      id="meetingDescription"
                      v-model="meetingForm.description"
                      class="form-control textarea"
                      placeholder="Outline key discussion points, goals, deliverables or preparation notes..."
                      rows="3"
                      maxlength="1000"
                    ></textarea>
                    <div class="field-footer-info">
                      <span class="hint-text">Will be included in the invitation email sent to participants</span>
                      <small class="char-count">{{ meetingForm.description.length }}/1000</small>
                    </div>
                  </div>

                  <!-- Date & Time Row -->
                  <div class="form-row-2">
                    <div class="form-group">
                      <label for="meetingDate" class="field-label">
                        <i class="fas fa-calendar-day"></i> Meeting Date <span class="required-star">*</span>
                      </label>
                      <div class="input-with-icon">
                        <input
                          type="date"
                          id="meetingDate"
                          v-model="meetingForm.date"
                          class="form-control"
                          :min="today"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="meetingTime" class="field-label">
                        <i class="fas fa-clock"></i> Start Time <span class="required-star">*</span>
                      </label>
                      <div class="input-with-icon">
                        <input
                          type="time"
                          id="meetingTime"
                          v-model="meetingForm.time"
                          class="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Duration & Location/Access Row -->
                  <div class="form-row-2">
                    <div class="form-group">
                      <label for="durationSelect" class="field-label">
                        <i class="fas fa-hourglass-half"></i> Estimated Duration
                      </label>
                      <div class="select-wrapper">
                        <select id="durationSelect" v-model="meetingForm.duration" class="form-control select-field">
                          <option value="15">15 Minutes (Brief Standup)</option>
                          <option value="30">30 Minutes (Standard Review)</option>
                          <option value="45">45 Minutes (Extended Discussion)</option>
                          <option value="60">1 Hour (Deep Dive Session)</option>
                          <option value="90">1.5 Hours (Workshop / Planning)</option>
                          <option value="120">2 Hours (Comprehensive Meeting)</option>
                          <option value="180">3 Hours (Quarterly Board)</option>
                        </select>
                      </div>
                    </div>

                    <!-- Location (Offline) OR Access Control (Online) -->
                    <div class="form-group" v-if="activeTab === 'offline'">
                      <label for="meetingLocation" class="field-label">
                        <i class="fas fa-location-arrow"></i> Room / Location <span class="optional-pill">Optional</span>
                      </label>
                      <input
                        type="text"
                        id="meetingLocation"
                        v-model="meetingForm.location"
                        class="form-control"
                        placeholder="e.g. Main Conference Room (Floor 2)"
                        maxlength="120"
                      />
                    </div>

                    <div class="form-group" v-else>
                      <label class="field-label">
                        <i class="fas fa-shield-alt"></i> Access Permission
                      </label>
                      <div class="select-wrapper">
                        <select v-model="meetingForm.accessType" class="form-control select-field">
                          <option value="invited">🔒 Restricted: Selected Invitees Only</option>
                          <option value="anyone">🌐 Open: Anyone with Link</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <!-- ============================================== -->
              <!-- 2. SECTION: SELECT PARTICIPANTS (CORE FEATURE) -->
              <!-- ============================================== -->
              <div class="form-card-section attendees-section">
                <div class="section-title-bar">
                  <div class="section-title-left">
                    <span class="step-num highlight">2</span>
                    <div>
                      <h3 class="section-heading">
                        Select Participants <span class="required-star">*</span>
                        <span class="badge-count-inline" :class="{ 'zero-count': allGuestEmails.length === 0 }">
                          {{ selectedEmployeeIds.length + externalGuests.length }} selected (Min 1 required)
                        </span>
                      </h3>
                      <p class="section-subheading">
                        Pick specific employees from your directory instead of notifying everyone
                      </p>
                    </div>
                  </div>

                  <!-- Quick Select Modes -->
                  <div class="attendee-mode-switch">
                    <button 
                      type="button" 
                      class="mode-btn"
                      :class="{ active: attendeeTab === 'specific' }"
                      @click="attendeeTab = 'specific'"
                    >
                      <i class="fas fa-users"></i>
                      <span>Employees ({{ employees.length }})</span>
                    </button>
                    <button 
                      type="button" 
                      class="mode-btn"
                      :class="{ active: attendeeTab === 'department' }"
                      @click="attendeeTab = 'department'"
                    >
                      <i class="fas fa-sitemap"></i>
                      <span>By Team</span>
                    </button>
                    <button 
                      type="button" 
                      class="mode-btn"
                      :class="{ active: attendeeTab === 'external' }"
                      @click="attendeeTab = 'external'"
                    >
                      <i class="fas fa-envelope-open-text"></i>
                      <span>External Guests</span>
                    </button>
                  </div>
                </div>

                <div class="section-body">

                  <!-- 🌿 SELECTED EMPLOYEES TRAY (Shown if any employee/guest is chosen) -->
                  <div v-if="allGuestEmails.length > 0" class="selected-tray-card">
                    <div class="tray-header">
                      <div class="tray-title">
                        <i class="fas fa-check-circle text-emerald"></i>
                        <span>Invited Participants <strong>({{ allGuestEmails.length }})</strong></span>
                      </div>
                      <button type="button" class="btn-clear-all" @click="clearAllAttendees">
                        <i class="fas fa-trash-alt"></i> Clear All
                      </button>
                    </div>

                    <!-- Selected Chips Grid -->
                    <div class="selected-chips-container">
                      <!-- Selected Employees -->
                      <div 
                        v-for="emp in selectedEmployees" 
                        :key="'selected-' + emp.id" 
                        class="participant-chip"
                      >
                        <div class="chip-avatar" :style="{ background: getAvatarColor(emp.name) }">
                          {{ getInitials(emp.name) }}
                        </div>
                        <div class="chip-info">
                          <span class="chip-name">{{ formatName(emp.name) }}</span>
                          <span class="chip-dept">{{ emp.department || 'General' }}</span>
                        </div>
                        <button 
                          type="button" 
                          class="chip-remove" 
                          @click="removeSelectedEmployee(emp.id)" 
                          title="Remove"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>

                      <!-- External Guests -->
                      <div 
                        v-for="(guest, gIdx) in externalGuests" 
                        :key="'guest-' + gIdx" 
                        class="participant-chip external"
                      >
                        <div class="chip-avatar external">
                          <i class="fas fa-envelope"></i>
                        </div>
                        <div class="chip-info">
                          <span class="chip-name">{{ guest }}</span>
                          <span class="chip-dept badge-ext">Guest</span>
                        </div>
                        <button 
                          type="button" 
                          class="chip-remove" 
                          @click="removeExternalGuest(gIdx)" 
                          title="Remove guest"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Empty Tray Notice with Minimum 1 requirement hint -->
                  <div v-else class="empty-tray-notice">
                    <div class="notice-icon">
                      <i class="fas fa-user-plus"></i>
                    </div>
                    <div>
                      <strong>No individual participants selected yet (Minimum 1 Required)</strong>
                      <p>Click on employee cards below to invite specific team members to this session.</p>
                    </div>
                  </div>


                  <!-- ────── SUB-VIEW 1: INDIVIDUAL EMPLOYEE PICKER ────── -->
                  <div v-if="attendeeTab === 'specific'" class="specific-picker-wrap">
                    
                    <!-- Search & Quick Filter Controls -->
                    <div class="directory-filter-bar">
                      <div class="directory-search-input-wrap">
                        <i class="fas fa-search search-icon"></i>
                        <input
                          type="text"
                          v-model="searchQuery"
                          class="directory-search-input"
                          placeholder="Search employee by name, email, or department..."
                        />
                        <button 
                          v-if="searchQuery" 
                          type="button" 
                          class="clear-search-btn" 
                          @click="searchQuery = ''"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>

                      <!-- Selection Controls Toolbar -->
                      <div class="selection-actions-bar">
                        <button 
                          type="button" 
                          class="tool-btn" 
                          @click="selectAllFiltered"
                          :disabled="filteredEmployees.length === 0"
                        >
                          <i class="fas fa-check-double"></i>
                          <span>Select All Filtered ({{ filteredEmployees.length }})</span>
                        </button>
                        <button 
                          type="button" 
                          class="tool-btn secondary" 
                          @click="deselectAllFiltered"
                          :disabled="filteredEmployees.length === 0"
                        >
                          <i class="fas fa-minus-circle"></i>
                          <span>Deselect Filtered</span>
                        </button>
                      </div>
                    </div>

                    <!-- Department Quick Filter Pills -->
                    <div class="dept-pills-scroll" v-if="departmentList.length > 0">
                      <button
                        type="button"
                        class="dept-pill"
                        :class="{ active: selectedDeptFilter === 'all' }"
                        @click="selectedDeptFilter = 'all'"
                      >
                        All Staff ({{ employees.length }})
                      </button>
                      <button
                        v-for="dept in departmentList"
                        :key="dept.name"
                        type="button"
                        class="dept-pill"
                        :class="{ active: selectedDeptFilter === dept.name }"
                        @click="selectedDeptFilter = dept.name"
                      >
                        {{ dept.name }}
                        <span class="pill-count">{{ dept.count }}</span>
                      </button>
                    </div>

                    <!-- Loading State -->
                    <div v-if="loadingEmployees" class="employees-loading-box">
                      <i class="fas fa-circle-notch fa-spin"></i>
                      <span>Loading employee directory...</span>
                    </div>

                    <!-- Fetch Error Notice -->
                    <div v-else-if="employeeFetchError" class="employees-error-box">
                      <i class="fas fa-exclamation-triangle"></i>
                      <span>{{ employeeFetchError }}</span>
                      <button type="button" class="btn-retry" @click="fetchEmployees">
                        <i class="fas fa-redo"></i> Retry
                      </button>
                    </div>

                    <!-- Employee Cards Grid -->
                    <div v-else class="employee-selection-grid">
                      <div
                        v-for="emp in filteredEmployees"
                        :key="emp.id"
                        class="employee-pick-card"
                        :class="{ selected: isEmployeeSelected(emp.id) }"
                        @click="toggleEmployee(emp)"
                      >
                        <!-- Checkbox Indicator -->
                        <div class="pick-checkbox" :class="{ checked: isEmployeeSelected(emp.id) }">
                          <i class="fas fa-check" v-if="isEmployeeSelected(emp.id)"></i>
                        </div>

                        <!-- Avatar -->
                        <div class="pick-avatar" :style="{ background: getAvatarColor(emp.name) }">
                          {{ getInitials(emp.name) }}
                        </div>

                        <!-- Employee Meta Details -->
                        <div class="pick-details">
                          <div class="pick-name-row">
                            <span class="pick-name" :title="emp.name">{{ formatName(emp.name) }}</span>
                            <span class="dept-tag">{{ emp.department || 'General' }}</span>
                          </div>
                          <div class="pick-email" :title="emp.email">
                            <i class="fas fa-envelope"></i> {{ emp.email }}
                          </div>
                        </div>
                      </div>

                      <!-- Empty State when filtering finds nothing -->
                      <div v-if="filteredEmployees.length === 0" class="no-employees-found">
                        <i class="fas fa-user-slash"></i>
                        <p>No employees match "<strong>{{ searchQuery }}</strong>"</p>
                        <button type="button" class="btn-reset-filter" @click="searchQuery = ''; selectedDeptFilter = 'all'">
                          Clear Search Filters
                        </button>
                      </div>
                    </div>

                  </div>


                  <!-- ────── SUB-VIEW 2: SELECT BY DEPARTMENT / TEAM ────── -->
                  <div v-if="attendeeTab === 'department'" class="department-picker-wrap">
                    <div class="dept-intro-banner">
                      <i class="fas fa-sitemap"></i>
                      <div>
                        <strong>Team Quick-Add</strong>
                        <p>Click any department card below to instantly add or remove all its members.</p>
                      </div>
                    </div>

                    <div class="dept-cards-grid">
                      <div
                        v-for="dept in departmentList"
                        :key="dept.name"
                        class="dept-card-item"
                        :class="{ 'all-selected': isDeptFullySelected(dept.name) }"
                        @click="toggleDepartment(dept.name)"
                      >
                        <div class="dept-card-header">
                          <div class="dept-card-icon">
                            <i class="fas fa-building"></i>
                          </div>
                          <div class="dept-card-badge">
                            <i class="fas fa-check-circle" v-if="isDeptFullySelected(dept.name)"></i>
                            <span v-else>{{ dept.count }} staff</span>
                          </div>
                        </div>

                        <h4 class="dept-card-title">{{ dept.name }}</h4>
                        <p class="dept-card-desc">
                          {{ dept.count }} active team member{{ dept.count === 1 ? '' : 's' }}
                        </p>

                        <div class="dept-card-action">
                          <span v-if="isDeptFullySelected(dept.name)" class="action-selected">
                            <i class="fas fa-check"></i> Entire Team Added
                          </span>
                          <span v-else class="action-add">
                            <i class="fas fa-plus-circle"></i> Add All {{ dept.count }} Members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>


                  <!-- ────── SUB-VIEW 3: EXTERNAL GUEST EMAILS ────── -->
                  <div v-if="attendeeTab === 'external'" class="external-picker-wrap">
                    <div class="external-intro-box">
                      <i class="fas fa-envelope-open-text"></i>
                      <div>
                        <strong>Invite External Guests & Partners</strong>
                        <p>Need to include a client, vendor, or non-staff partner? Enter their email address below.</p>
                      </div>
                    </div>

                    <div class="external-input-row">
                      <div class="ext-input-group">
                        <i class="fas fa-envelope input-icon"></i>
                        <input
                          type="email"
                          v-model="newExternalEmail"
                          class="form-control ext-input"
                          placeholder="client.partner@company.com"
                          @keyup.enter="addExternalGuest"
                        />
                      </div>
                      <button 
                        type="button" 
                        class="btn-add-external" 
                        @click="addExternalGuest"
                        :disabled="!newExternalEmail"
                      >
                        <i class="fas fa-user-plus"></i>
                        <span>Add Guest</span>
                      </button>
                    </div>

                    <div v-if="externalGuests.length > 0" class="external-guests-list">
                      <div class="ext-list-header">
                        <span>External Guests Added ({{ externalGuests.length }})</span>
                      </div>
                      <div class="ext-tags-row">
                        <span 
                          v-for="(guest, gIdx) in externalGuests" 
                          :key="gIdx" 
                          class="ext-guest-tag"
                        >
                          <i class="fas fa-at"></i>
                          <span>{{ guest }}</span>
                          <button type="button" @click="removeExternalGuest(gIdx)" title="Remove">
                            <i class="fas fa-times"></i>
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            <!-- ▶️ RIGHT COLUMN: Live Executive Preview & Actions -->
            <div class="form-column-right">

              <!-- Executive Preview Card -->
              <div class="preview-card-elevated">
                <div class="preview-card-top">
                  <div class="preview-badge-pill" :class="activeTab">
                    <i :class="activeTab === 'online' ? 'fas fa-video' : 'fas fa-building'"></i>
                    <span>{{ activeTab === 'online' ? 'Online Conference' : 'In-Office Session' }}</span>
                  </div>
                  <div class="preview-live-indicator">
                    <span class="indicator-dot"></span>
                    <span>Live Preview</span>
                  </div>
                </div>

                <!-- Preview Main Body -->
                <div class="preview-content-box">
                  <h3 class="preview-title-text">
                    {{ meetingForm.title || 'Untitled Meeting' }}
                  </h3>
                  <p class="preview-description-text" v-if="meetingForm.description">
                    {{ meetingForm.description }}
                  </p>
                  <p class="preview-description-empty" v-else>
                    No description added yet. Add agenda notes to brief participants.
                  </p>

                  <div class="preview-divider"></div>

                  <!-- Key Meta Info -->
                  <div class="preview-meta-grid">
                    <div class="preview-meta-row">
                      <div class="meta-icon-bubble">
                        <i class="fas fa-calendar-alt"></i>
                      </div>
                      <div class="meta-content">
                        <span class="meta-label">Date & Time</span>
                        <p class="meta-val">
                          {{ meetingForm.date && meetingForm.time ? formatDateTime() : 'Date & Time not set' }}
                        </p>
                      </div>
                    </div>

                    <div class="preview-meta-row">
                      <div class="meta-icon-bubble">
                        <i class="fas fa-hourglass-half"></i>
                      </div>
                      <div class="meta-content">
                        <span class="meta-label">Duration</span>
                        <p class="meta-val">{{ meetingForm.duration }} Minutes</p>
                      </div>
                    </div>

                    <!-- Offline: Location -->
                    <div class="preview-meta-row" v-if="activeTab === 'offline'">
                      <div class="meta-icon-bubble">
                        <i class="fas fa-map-marker-alt"></i>
                      </div>
                      <div class="meta-content">
                        <span class="meta-label">Location / Room</span>
                        <p class="meta-val">{{ meetingForm.location || 'Headquarters Office' }}</p>
                      </div>
                    </div>

                    <!-- Online: Access Type -->
                    <div class="preview-meta-row" v-else>
                      <div class="meta-icon-bubble">
                        <i class="fas fa-lock"></i>
                      </div>
                      <div class="meta-content">
                        <span class="meta-label">Security & Access</span>
                        <p class="meta-val">{{ meetingForm.accessType === 'anyone' ? 'Open to link holders' : 'Restricted to invited guests' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 👥 Invited Attendees Visual Pile -->
                  <div class="preview-attendees-block">
                    <div class="attendees-header-mini">
                      <span class="mini-label">Invited Participants</span>
                      <span class="attendees-count-tag" :class="{ 'zero-tag': allGuestEmails.length === 0 }">
                        {{ allGuestEmails.length }} Person{{ allGuestEmails.length === 1 ? '' : 's' }}
                      </span>
                    </div>

                    <div v-if="allGuestEmails.length > 0" class="attendees-preview-content">
                      <div class="avatar-stack">
                        <div 
                          v-for="emp in previewAvatarList" 
                          :key="'stack-' + emp.id" 
                          class="stack-avatar"
                          :style="{ background: getAvatarColor(emp.name) }"
                          :title="emp.name"
                        >
                          {{ getInitials(emp.name) }}
                        </div>
                        <div v-if="remainingAvatarCount > 0" class="stack-avatar more-avatar" :title="`+${remainingAvatarCount} more`">
                          +{{ remainingAvatarCount }}
                        </div>
                      </div>
                      <p class="attendees-summary-text">
                        {{ attendeeSummaryText }}
                      </p>
                    </div>

                    <div v-else class="empty-attendees-preview">
                      <i class="fas fa-exclamation-circle text-warning"></i>
                      <span>Please select at least 1 employee to schedule</span>
                    </div>
                  </div>

                  <!-- Online Link Preview (Online meetings only) -->
                  <div v-if="activeTab === 'online'" class="meeting-link-box">
                    <span class="mini-label">Generated Video URL</span>
                    <div class="meeting-link-card">
                      <span class="link-url-text">{{ meetingLink }}</span>
                      <button
                        type="button"
                        class="copy-link-btn"
                        @click="copyToClipboard"
                        :title="copyTooltip"
                      >
                        <i :class="copyTooltip === 'Copied!' ? 'fas fa-check' : 'fas fa-copy'"></i>
                        <span>{{ copyTooltip === 'Copied!' ? 'Copied' : 'Copy' }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Media Settings (Online) -->
                  <div v-if="activeTab === 'online'" class="media-settings-card">
                    <span class="mini-label">Default Call Controls</span>
                    <div class="toggle-row">
                      <div class="toggle-text">
                        <i class="fas fa-video"></i>
                        <span>Host Video Enabled</span>
                      </div>
                      <label class="switch-toggle">
                        <input type="checkbox" v-model="meetingForm.hostVideo" />
                        <span class="slider round"></span>
                      </label>
                    </div>
                    <div class="toggle-row">
                      <div class="toggle-text">
                        <i class="fas fa-users"></i>
                        <span>Participant Video Enabled</span>
                      </div>
                      <label class="switch-toggle">
                        <input type="checkbox" v-model="meetingForm.guestVideo" />
                        <span class="slider round"></span>
                      </label>
                    </div>
                  </div>

                </div>

                <!-- Submit Button in Preview Card -->
                <div class="preview-action-block">
                  <button
                    type="button"
                    class="btn-schedule-main"
                    @click="handleSubmitMeeting"
                    :disabled="!isFormValid || isSubmitting"
                  >
                    <span v-if="!isSubmitting">
                      <i class="fas fa-paper-plane"></i>
                      <span>{{ activeTab === 'online' ? 'Schedule Online Meeting' : 'Schedule In-Person Meeting' }}</span>
                    </span>
                    <span v-else class="loading-state">
                      <i class="fas fa-circle-notch fa-spin"></i>
                      <span>Sending Invitations...</span>
                    </span>
                  </button>

                  <div v-if="allGuestEmails.length === 0" class="min-attendee-warning">
                    <i class="fas fa-info-circle"></i>
                    <span>Select at least 1 employee to enable scheduling</span>
                  </div>

                  <button 
                    type="button" 
                    class="btn-reset-light" 
                    @click="resetForm" 
                    :disabled="isSubmitting"
                  >
                    <i class="fas fa-redo-alt"></i>
                    <span>Reset Form</span>
                  </button>
                </div>

              </div>

            </div>

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
  name: 'ScheduleMeeting',
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      activeTab: 'online', // 'online' | 'offline'
      attendeeTab: 'specific', // 'specific' | 'department' | 'external'
      today: '',
      meetingId: '',
      copyTooltip: 'Copy to clipboard',
      isSubmitting: false,
      successMessage: '',
      errorMessage: '',

      // Core meeting form model
      meetingForm: {
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        location: '',
        accessType: 'invited',
        hostVideo: true,
        guestVideo: true,
      },

      // Employee directory state
      employees: [],
      loadingEmployees: false,
      employeeFetchError: '',
      selectedEmployeeIds: [],
      externalGuests: [],
      newExternalEmail: '',

      // Directory filter controls
      searchQuery: '',
      selectedDeptFilter: 'all',
    }
  },

  computed: {
    meetingLink() {
      const baseUrl = window.location.origin
      return `${baseUrl}/meet/${this.meetingId}`
    },

    // Form validity requires Title, Date, Time, AND minimum 1 attendee selected
    isFormValid() {
      const hasTitle = !!(this.meetingForm.title && this.meetingForm.title.trim())
      const hasDate = !!this.meetingForm.date
      const hasTime = !!this.meetingForm.time
      const hasMinOneUser = this.allGuestEmails.length >= 1
      return hasTitle && hasDate && hasTime && hasMinOneUser
    },

    // Department grouping list with member counts
    departmentList() {
      const counts = {}
      this.employees.forEach(emp => {
        const dept = emp.department ? emp.department.trim() : 'General'
        counts[dept] = (counts[dept] || 0) + 1
      })

      return Object.keys(counts).sort().map(deptName => ({
        name: deptName,
        count: counts[deptName]
      }))
    },

    // Filtered employees list based on search and active department pill
    filteredEmployees() {
      let list = this.employees

      if (this.selectedDeptFilter !== 'all') {
        list = list.filter(emp => (emp.department || 'General') === this.selectedDeptFilter)
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase()
        list = list.filter(emp => 
          (emp.name && emp.name.toLowerCase().includes(q)) ||
          (emp.email && emp.email.toLowerCase().includes(q)) ||
          (emp.department && emp.department.toLowerCase().includes(q)) ||
          (emp.emp_id && String(emp.emp_id).toLowerCase().includes(q))
        )
      }

      return list
    },

    // Full objects for all selected employees (type-safe comparison)
    selectedEmployees() {
      return this.employees.filter(emp => 
        this.selectedEmployeeIds.some(id => String(id) === String(emp.id))
      )
    },

    // All combined guest emails (Selected employees + external emails)
    allGuestEmails() {
      const empEmails = this.selectedEmployees.map(e => e.email).filter(Boolean)
      return [...new Set([...empEmails, ...this.externalGuests])]
    },

    // Preview list for avatar stack in the right card
    previewAvatarList() {
      return this.selectedEmployees.slice(0, 4)
    },

    remainingAvatarCount() {
      const totalSelected = this.selectedEmployees.length + this.externalGuests.length
      return totalSelected > 4 ? totalSelected - 4 : 0
    },

    attendeeSummaryText() {
      const count = this.allGuestEmails.length
      if (count === 0) return 'No attendees selected'
      if (count === 1) {
        return this.selectedEmployees[0] ? this.formatName(this.selectedEmployees[0].name) : this.externalGuests[0]
      }
      if (count === 2) {
        const first = this.selectedEmployees[0] ? this.formatName(this.selectedEmployees[0].name) : this.externalGuests[0]
        const second = this.selectedEmployees[1] ? this.formatName(this.selectedEmployees[1].name) : this.externalGuests[1]
        return `${first} & ${second}`
      }
      const first = this.selectedEmployees[0] ? this.formatName(this.selectedEmployees[0].name) : this.externalGuests[0]
      return `${first} + ${count - 1} other participant(s)`
    }
  },

  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    selectTab(tab) {
      this.activeTab = tab
      this.errorMessage = ''
      this.successMessage = ''
    },

    formatDateTime() {
      if (!this.meetingForm.date || !this.meetingForm.time) return ''
      try {
        const dateObj = new Date(`${this.meetingForm.date}T${this.meetingForm.time}`)
        return dateObj.toLocaleString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return `${this.meetingForm.date} ${this.meetingForm.time}`
      }
    },

    formatName(name) {
      if (!name) return ''
      return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },

    getInitials(name) {
      if (!name) return '??'
      const parts = name.trim().split(/\s+/)
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    },

    getAvatarColor(name) {
      const gradients = [
        'linear-gradient(135deg, #2cb67d 0%, #16935b 100%)',
        'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      ]
      let hash = 0
      for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return gradients[Math.abs(hash) % gradients.length]
    },

    // ─── Employee Selection Methods (Type-Safe) ───
    isEmployeeSelected(id) {
      return this.selectedEmployeeIds.some(empId => String(empId) === String(id))
    },

    toggleEmployee(emp) {
      const stringId = String(emp.id)
      const idx = this.selectedEmployeeIds.findIndex(id => String(id) === stringId)
      if (idx > -1) {
        this.selectedEmployeeIds.splice(idx, 1)
      } else {
        this.selectedEmployeeIds.push(emp.id)
      }
    },

    removeSelectedEmployee(id) {
      const stringId = String(id)
      this.selectedEmployeeIds = this.selectedEmployeeIds.filter(empId => String(empId) !== stringId)
    },

    selectAllFiltered() {
      this.filteredEmployees.forEach(emp => {
        if (!this.isEmployeeSelected(emp.id)) {
          this.selectedEmployeeIds.push(emp.id)
        }
      })
      toastSuccess(`Selected ${this.filteredEmployees.length} employee(s)`)
    },

    deselectAllFiltered() {
      const filteredIdStrings = new Set(this.filteredEmployees.map(e => String(e.id)))
      this.selectedEmployeeIds = this.selectedEmployeeIds.filter(id => !filteredIdStrings.has(String(id)))
    },

    clearAllAttendees() {
      this.selectedEmployeeIds = []
      this.externalGuests = []
      toastSuccess('All selected participants removed')
    },

    // ─── Department Toggle Methods ───
    isDeptFullySelected(deptName) {
      const deptMembers = this.employees.filter(e => (e.department || 'General') === deptName)
      return deptMembers.length > 0 && deptMembers.every(e => this.isEmployeeSelected(e.id))
    },

    toggleDepartment(deptName) {
      const deptMembers = this.employees.filter(e => (e.department || 'General') === deptName)
      const allSelected = deptMembers.every(e => this.isEmployeeSelected(e.id))

      if (allSelected) {
        const deptIdStrings = new Set(deptMembers.map(e => String(e.id)))
        this.selectedEmployeeIds = this.selectedEmployeeIds.filter(id => !deptIdStrings.has(String(id)))
        toastWarning(`Removed all ${deptMembers.length} members of ${deptName}`)
      } else {
        deptMembers.forEach(e => {
          if (!this.isEmployeeSelected(e.id)) {
            this.selectedEmployeeIds.push(e.id)
          }
        })
        toastSuccess(`Added all ${deptMembers.length} members of ${deptName}`)
      }
    },

    // ─── External Guests Methods ───
    addExternalGuest() {
      const email = this.newExternalEmail.trim().toLowerCase()
      if (!email) return

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        toastError('Please enter a valid email address')
        return
      }

      if (this.allGuestEmails.includes(email)) {
        toastWarning('This email is already on the invitation list')
        return
      }

      this.externalGuests.push(email)
      this.newExternalEmail = ''
      toastSuccess(`Guest email (${email}) added`)
    },

    removeExternalGuest(idx) {
      this.externalGuests.splice(idx, 1)
    },

    // ─── Meeting Links & Form Reset ───
    copyToClipboard() {
      navigator.clipboard.writeText(this.meetingLink).then(() => {
        this.copyTooltip = 'Copied!'
        toastSuccess('Meeting link copied to clipboard!')
        setTimeout(() => {
          this.copyTooltip = 'Copy to clipboard'
        }, 2500)
      })
    },

    resetForm() {
      this.generateMeetingId()
      this.meetingForm = {
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        location: '',
        accessType: 'invited',
        hostVideo: true,
        guestVideo: true,
      }
      this.selectedEmployeeIds = []
      this.externalGuests = []
      this.newExternalEmail = ''
      this.searchQuery = ''
      this.selectedDeptFilter = 'all'
      this.errorMessage = ''
      this.successMessage = ''
    },

    generateMeetingId() {
      this.meetingId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    },

    // ─── Fetch Active Employees ───
    async fetchEmployees() {
      this.loadingEmployees = true
      this.employeeFetchError = ''
      try {
        const resp = await axios.get('https://employees.archenterprises.co.in/api/api/users')
        const raw = resp.data || []
        const userList = Array.isArray(raw) ? raw : (raw.data || [])
        this.employees = userList.filter(u => u && u.email && u.status !== 'inactive')
      } catch (err) {
        console.error('Failed to load employee list:', err)
        this.employeeFetchError = 'Could not load company employees automatically. You may still add participant emails manually.'
      } finally {
        this.loadingEmployees = false
      }
    },

    // ─── Unified Submit Action ───
    async handleSubmitMeeting() {
      if (!this.meetingForm.title || !this.meetingForm.title.trim() || !this.meetingForm.date || !this.meetingForm.time) {
        this.errorMessage = 'Please complete all required fields (Title, Date, Time).'
        toastError(this.errorMessage)
        return
      }

      const guests = this.allGuestEmails
      if (guests.length === 0) {
        this.errorMessage = 'Please select minimum 1 employee or enter a participant email before scheduling.'
        toastError(this.errorMessage)
        return
      }

      this.isSubmitting = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        if (this.activeTab === 'online') {
          const meetingData = {
            meeting_id: this.meetingId,
            type: 'online',
            title: this.meetingForm.title.trim(),
            description: this.meetingForm.description,
            meeting_date: this.meetingForm.date,
            meeting_time: this.meetingForm.time,
            duration: this.meetingForm.duration,
            access_type: this.meetingForm.accessType,
            guests: guests,
            host_video: this.meetingForm.hostVideo,
            guest_video: this.meetingForm.guestVideo,
            require_video: false,
            meeting_link: this.meetingLink
          }

          await axios.post('https://employees.archenterprises.co.in/api/api/meetings/schedule', meetingData)
          
          this.successMessage = `Online meeting scheduled successfully! Invitations dispatched to ${guests.length} participant(s).`
          toastSuccess('Online video meeting scheduled successfully!')
        } else {
          const locationNote = this.meetingForm.location ? `\nLocation: ${this.meetingForm.location}` : ''
          const meetingData = {
            meeting_id: this.meetingId,
            type: 'offline',
            title: this.meetingForm.title.trim(),
            description: `${this.meetingForm.description || ''}${locationNote}`.trim(),
            meeting_date: this.meetingForm.date,
            meeting_time: this.meetingForm.time,
            duration: this.meetingForm.duration,
            guests: guests,
            email_subject: `In-Person Meeting: ${this.meetingForm.title.trim()}`,
            email_body: `In-Person Meeting Schedule\n\nTitle: ${this.meetingForm.title}\nDate: ${this.meetingForm.date}\nTime: ${this.meetingForm.time}\nLocation: ${this.meetingForm.location || 'Company Office'}\nDescription: ${this.meetingForm.description || '-'}`
          }

          await axios.post('https://employees.archenterprises.co.in/api/api/meetings/schedule', meetingData)
          
          this.successMessage = `In-person meeting scheduled successfully! Invitations dispatched to ${guests.length} participant(s).`
          toastSuccess('In-person meeting scheduled successfully!')
        }

        setTimeout(() => {
          this.resetForm()
        }, 3500)
      } catch (error) {
        console.error('Error scheduling meeting:', error)
        this.errorMessage = error.response?.data?.message || 'Failed to schedule meeting. Please verify details and try again.'
        toastError(this.errorMessage)
      } finally {
        this.isSubmitting = false
      }
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }

    this.today = new Date().toISOString().split('T')[0]
    this.generateMeetingId()
    this.fetchEmployees()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* 🌿 Root & Variables - Professional Emerald Theme */
:root {
  --primary: #2cb67d;
  --primary-dark: #209961;
  --primary-light: #eaf7f1;
  --text: #0f2e22;
  --text-light: #6b8f81;
  --bg-app: #edf7f2;
  --card: #ffffff;
  --border: #dff0e7;
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background: var(--bg-app, #edf7f2);
  font-family: var(--font-body, 'Inter', sans-serif);
  color: #0f2e22;
}

.main-content {
  display: flex;
  min-height: 100vh;
  padding: 18px 24px;
  gap: 24px;
}

.content {
  flex: 1;
  background: transparent;
  overflow-x: hidden;
}

/* 📱 Mobile Top Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #ffffff;
  border-radius: 18px;
  margin-bottom: 18px;
  border: 1px solid #e0f0e8;
  box-shadow: 0 4px 16px rgba(44, 182, 125, 0.06);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
}

.mobile-title i {
  color: #2cb67d;
}

.mobile-tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f0fdf4;
  border: 1px solid #cbe9dc;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #16935b;
  cursor: pointer;
}

/* 🏢 Desktop Header Banner */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
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
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  box-shadow: 0 8px 20px rgba(44, 182, 125, 0.28);
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 3px;
}

.badge-accent {
  font-size: 11px;
  font-weight: 800;
  color: #16935b;
  background: #eaf7f1;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-status-dot {
  font-size: 11.5px;
  color: #6b8f81;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.dot-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2cb67d;
  display: inline-block;
  box-shadow: 0 0 0 2px rgba(44, 182, 125, 0.3);
}

.page-title {
  font-size: 23px;
  font-weight: 800;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
  margin: 0;
  letter-spacing: -0.3px;
}

.subtitle-modern {
  color: #6b8f81;
  font-size: 13.5px;
  margin-top: 3px;
  font-weight: 500;
}

.directory-quick-stat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #dff0e7;
  padding: 10px 16px;
  border-radius: 14px;
  font-size: 13px;
  color: #2b5e4c;
  box-shadow: 0 4px 12px rgba(44, 182, 125, 0.05);
}

.directory-quick-stat i {
  color: #2cb67d;
  font-size: 15px;
}

/* 🌿 Main Schedule Card */
.schedule-card-wrapper {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #dff0e7;
  padding: 24px 28px;
  box-shadow: 0 6px 24px rgba(44, 182, 125, 0.06);
}

/* Tabs Header Bar */
.tabs-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 14px;
}

.tabs-segmented-wrapper {
  display: flex;
  background: #f4fbf7;
  border: 1px solid #e0f0e8;
  border-radius: 16px;
  padding: 6px;
  gap: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #6b8f81;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: left;
}

.tab-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e8f6ef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #2cb67d;
  transition: all 0.25s ease;
}

.tab-main-label {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: #0f2e22;
}

.tab-sub-label {
  display: block;
  font-size: 11px;
  color: #7d9e92;
  margin-top: 1px;
}

.tab-btn.active {
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(44, 182, 125, 0.15);
}

.tab-btn.active .tab-icon-wrap {
  background: #2cb67d;
  color: #ffffff;
}

.tab-btn.active .tab-main-label {
  color: #16935b;
}

.attendees-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 12.5px;
  color: #64748b;
  font-weight: 600;
}

.attendees-badge-pill.has-attendees {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #16935b;
}

.attendees-badge-pill i {
  font-size: 13px;
}

/* Alerts */
.alert-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-radius: 16px;
  margin-bottom: 22px;
  font-size: 13.5px;
  font-weight: 600;
}

.alert-banner.success {
  background: #eaf7f1;
  color: #16935b;
  border: 1px solid #cbe9dc;
}

.alert-banner.danger {
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-icon {
  font-size: 16px;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}

/* 🌟 Grid Layout */
.schedule-grid {
  display: grid;
  grid-template-columns: 1fr 390px;
  gap: 28px;
  align-items: start;
}

/* Form Column Left */
.form-column-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card-section {
  background: #fbfdfc;
  border: 1px solid #e5f2eb;
  border-radius: 20px;
  padding: 20px 22px;
}

.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eef6f2;
  flex-wrap: wrap;
  gap: 10px;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #eaf7f1;
  color: #16935b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

.step-num.highlight {
  background: #2cb67d;
  color: #ffffff;
}

.section-heading {
  font-size: 16px;
  font-weight: 800;
  color: #0f2e22;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-subheading {
  font-size: 12px;
  color: #7d9e92;
  margin-top: 2px;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

.type-pill.online {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.type-pill.offline {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #133a2c;
  margin-bottom: 6px;
}

.field-label i {
  color: #2cb67d;
  font-size: 13px;
}

.required-star {
  color: #ef4444;
}

.optional-pill {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
}

.form-control {
  width: 100%;
  padding: 11px 15px;
  background: #ffffff;
  border: 1px solid #d9e7e0;
  border-radius: 12px;
  font-size: 13.5px;
  color: #0f2e22;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #2cb67d;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.16);
}

.textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.field-footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.hint-text {
  font-size: 11px;
  color: #8da49b;
}

.char-count {
  font-size: 11px;
  color: #94a3b8;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.select-wrapper {
  position: relative;
}

.select-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b8f81'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 40px;
}

/* ================================================= */
/* 👥 PARTICIPANT SELECTION STYLES                  */
/* ================================================= */
.badge-count-inline {
  font-size: 11px;
  font-weight: 700;
  background: #eaf7f1;
  color: #16935b;
  padding: 2px 8px;
  border-radius: 999px;
}

.badge-count-inline.zero-count {
  background: #fee2e2;
  color: #ef4444;
}

.attendee-mode-switch {
  display: flex;
  background: #f1f7f4;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn.active {
  background: #ffffff;
  color: #16935b;
  box-shadow: 0 2px 8px rgba(44, 182, 125, 0.15);
}

/* Selected Tray */
.selected-tray-card {
  background: #ffffff;
  border: 1px solid #dff0e7;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(44, 182, 125, 0.04);
}

.tray-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tray-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #0f2e22;
}

.text-emerald {
  color: #2cb67d;
}

.btn-clear-all {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.btn-clear-all:hover {
  color: #ef4444;
}

.selected-chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 4px;
}

.participant-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 4px 10px 4px 5px;
  transition: all 0.2s;
}

.participant-chip.external {
  border-color: #fed7aa;
  background: #fffbeb;
}

.chip-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
}

.chip-avatar.external {
  background: #f59e0b;
}

.chip-info {
  display: flex;
  flex-direction: column;
}

.chip-name {
  font-size: 12px;
  font-weight: 700;
  color: #0f2e22;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-dept {
  font-size: 9.5px;
  color: #64748b;
}

.badge-ext {
  color: #b45309;
}

.chip-remove {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 50%;
  transition: all 0.15s;
}

.chip-remove:hover {
  color: #ef4444;
  background: #fee2e2;
}

.empty-tray-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
}

.notice-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
  flex-shrink: 0;
}

.empty-tray-notice strong {
  display: block;
  font-size: 12.5px;
  color: #334155;
}

.empty-tray-notice p {
  font-size: 11px;
  color: #64748b;
  margin: 1px 0 0;
}

/* Directory Filter Bar */
.directory-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.directory-search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 240px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.directory-search-input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  background: #ffffff;
  border: 1px solid #d9e7e0;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.directory-search-input:focus {
  border-color: #2cb67d;
}

.clear-search-btn {
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

.selection-actions-bar {
  display: flex;
  gap: 8px;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #eaf7f1;
  color: #16935b;
  border: 1px solid #cbe9dc;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover:not(:disabled) {
  background: #2cb67d;
  color: #ffffff;
}

.tool-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border-color: #e2e8f0;
}

.tool-btn.secondary:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Department Scroll Pills */
.dept-pills-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 10px 0 4px;
}

.dept-pill {
  padding: 5px 12px;
  background: #ffffff;
  border: 1px solid #d9e7e0;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.dept-pill:hover {
  background: #f0fdf4;
  border-color: #86efac;
}

.dept-pill.active {
  background: #16935b;
  color: #ffffff;
  border-color: #16935b;
}

.pill-count {
  font-size: 10px;
  opacity: 0.85;
}

/* Employee Cards Grid */
.employee-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
  max-height: 290px;
  overflow-y: auto;
  padding-right: 4px;
  margin-top: 6px;
}

.employee-pick-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.employee-pick-card:hover {
  border-color: #86efac;
  background: #f0fdf4;
  transform: translateY(-1px);
}

.employee-pick-card.selected {
  background: #f0fdf4;
  border-color: #2cb67d;
  box-shadow: 0 2px 8px rgba(44, 182, 125, 0.15);
}

.pick-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #ffffff;
  flex-shrink: 0;
  transition: all 0.2s;
}

.pick-checkbox.checked {
  background: #2cb67d;
  border-color: #2cb67d;
}

.pick-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

.pick-details {
  flex: 1;
  min-width: 0;
}

.pick-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.pick-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f2e22;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dept-tag {
  font-size: 9.5px;
  font-weight: 700;
  color: #16935b;
  background: #eaf7f1;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.pick-email {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.pick-email i {
  font-size: 9px;
  margin-right: 2px;
}

.no-employees-found {
  grid-column: 1 / -1;
  text-align: center;
  padding: 24px;
  color: #64748b;
}

.no-employees-found i {
  font-size: 28px;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.btn-reset-filter {
  margin-top: 8px;
  padding: 6px 14px;
  background: #eaf7f1;
  color: #16935b;
  border: 1px solid #cbe9dc;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
}

/* Department Picker View */
.dept-intro-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #eaf7f1;
  border: 1px solid #cbe9dc;
  border-radius: 12px;
  color: #16935b;
  margin-top: 10px;
}

.dept-intro-banner i {
  font-size: 20px;
}

.dept-intro-banner strong {
  display: block;
  font-size: 13px;
  color: #0f2e22;
}

.dept-intro-banner p {
  font-size: 11.5px;
  color: #6b8f81;
  margin: 1px 0 0;
}

.dept-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.dept-card-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.dept-card-item:hover {
  border-color: #86efac;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 182, 125, 0.08);
}

.dept-card-item.all-selected {
  background: #f0fdf4;
  border-color: #2cb67d;
  box-shadow: 0 2px 10px rgba(44, 182, 125, 0.15);
}

.dept-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dept-card-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #eaf7f1;
  color: #16935b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.dept-card-badge {
  font-size: 11px;
  font-weight: 700;
  color: #16935b;
}

.dept-card-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #0f2e22;
  margin: 0 0 2px;
}

.dept-card-desc {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 12px;
}

.dept-card-action {
  font-size: 11.5px;
  font-weight: 700;
}

.action-selected {
  color: #16935b;
}

.action-add {
  color: #2563eb;
}

/* External Picker View */
.external-intro-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 12px;
  color: #b45309;
  margin-top: 10px;
}

.external-intro-box i {
  font-size: 20px;
}

.external-intro-box strong {
  display: block;
  font-size: 13px;
  color: #78350f;
}

.external-intro-box p {
  font-size: 11.5px;
  color: #92400e;
  margin: 1px 0 0;
}

.external-input-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.ext-input-group {
  position: relative;
  flex: 1;
}

.ext-input-group .input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.ext-input {
  padding-left: 36px;
}

.btn-add-external {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-add-external:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.external-guests-list {
  margin-top: 14px;
}

.ext-list-header {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.ext-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ext-guest-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #fef3c7;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: #b45309;
}

.ext-guest-tag button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 11px;
}

.ext-guest-tag button:hover {
  color: #ef4444;
}

/* Loading & Error */
.employees-loading-box,
.employees-error-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 30px;
  font-size: 13px;
  color: #64748b;
}

.employees-error-box {
  color: #dc2626;
  flex-direction: column;
}

.btn-retry {
  padding: 6px 14px;
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* ================================================= */
/* 🌟 PREVIEW CARD (RIGHT COLUMN)                    */
/* ================================================= */
.preview-card-elevated {
  background: #f7fcf9;
  border: 1px solid #dff0e7;
  border-radius: 24px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 4px 20px rgba(44, 182, 125, 0.05);
  position: sticky;
  top: 20px;
}

.preview-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

.preview-badge-pill.online {
  color: #16935b;
  background: #eaf7f1;
}

.preview-badge-pill.offline {
  color: #b45309;
  background: #fef3c7;
}

.preview-live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #2cb67d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2cb67d;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.25);
}

.preview-content-box {
  background: #ffffff;
  border: 1px solid #eef6f2;
  border-radius: 18px;
  padding: 18px;
}

.preview-title-text {
  font-size: 16px;
  font-weight: 800;
  color: #0f2e22;
  margin: 0 0 6px;
  word-break: break-word;
}

.preview-description-text {
  font-size: 12px;
  color: #475569;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-description-empty {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 0;
  font-style: italic;
}

.preview-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 14px 0;
}

.preview-meta-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-meta-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.meta-icon-bubble {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #eaf7f1;
  color: #16935b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.meta-content {
  flex: 1;
}

.meta-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #8da49b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
}

.meta-val {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f2e22;
  margin: 1px 0 0;
}

/* Preview Attendees Block */
.preview-attendees-block {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.attendees-header-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mini-label {
  font-size: 10.5px;
  font-weight: 800;
  color: #8da49b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.attendees-count-tag {
  font-size: 11px;
  font-weight: 700;
  color: #16935b;
  background: #eaf7f1;
  padding: 1px 6px;
  border-radius: 4px;
}

.attendees-count-tag.zero-tag {
  color: #ef4444;
  background: #fee2e2;
}

.attendees-preview-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.stack-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9.5px;
  font-weight: 800;
  margin-left: -6px;
}

.stack-avatar:first-child {
  margin-left: 0;
}

.more-avatar {
  background: #64748b !important;
  font-size: 9px;
}

.attendees-summary-text {
  font-size: 12px;
  font-weight: 600;
  color: #0f2e22;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-attendees-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  color: #dc2626;
  background: #fee2e2;
  padding: 8px 12px;
  border-radius: 10px;
}

.empty-attendees-preview i {
  font-size: 13px;
}

/* Meeting Link Box */
.meeting-link-box {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.meeting-link-card {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 6px 6px 6px 12px;
  gap: 8px;
  margin-top: 6px;
}

.link-url-text {
  flex: 1;
  font-size: 11.5px;
  color: #16935b;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.copy-link-btn:hover {
  box-shadow: 0 2px 8px rgba(44, 182, 125, 0.35);
}

/* Media Settings Card */
.media-settings-card {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.toggle-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #0f2e22;
}

.toggle-text i {
  color: #2cb67d;
  font-size: 12px;
}

/* Switch Toggle Component */
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 18px;
}

.switch-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .3s;
}

.slider.round {
  border-radius: 20px;
}

.slider.round:before {
  border-radius: 50%;
}

.slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
}

.switch-toggle input:checked + .slider {
  background-color: #2cb67d;
}

.switch-toggle input:checked + .slider:before {
  transform: translateX(16px);
}

/* Preview Actions */
.preview-action-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-schedule-main {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 20px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(44, 182, 125, 0.3);
  transition: all 0.2s ease;
}

.btn-schedule-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(44, 182, 125, 0.4);
}

.btn-schedule-main:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.min-attendee-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #b45309;
  background: #fef3c7;
  padding: 6px 10px;
  border-radius: 8px;
  justify-content: center;
  font-weight: 600;
}

.btn-reset-light {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 14px;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset-light:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 📱 Responsive Design */
@media (max-width: 1024px) {
  .schedule-grid {
    grid-template-columns: 1fr;
  }

  .preview-card-elevated {
    position: static;
  }
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .main-content {
    padding: 12px;
  }

  .schedule-card-wrapper {
    padding: 16px 14px;
  }

  .form-row-2 {
    grid-template-columns: 1fr;
  }

  .employee-selection-grid {
    grid-template-columns: 1fr;
  }

  .tabs-segmented-wrapper {
    width: 100%;
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
  }
}
</style>