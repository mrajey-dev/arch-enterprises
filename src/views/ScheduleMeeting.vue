<template>
  <div class="layout">
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Stationary Fixed Admin Sidebar -->
      <Sidebar ref="sidebarRef" />

      <section class="content">
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-calendar-plus"></i>
            <span>Schedule Meeting</span>
          </div>
          <div class="mobile-header-actions">
            <button 
              type="button" 
              class="btn-mobile-mode-switch"
              @click="selectTab(activeTab === 'online' ? 'offline' : 'online')"
            >
              <i :class="activeTab === 'online' ? 'fas fa-building' : 'fas fa-video'"></i>
              <span>{{ activeTab === 'online' ? 'Offline' : 'Online' }}</span>
            </button>
            <button class="btn-mobile-menu" @click="toggleMobileSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Header Banner -->
        <header class="schedule-top-banner">
          <div class="banner-left">
            <div class="banner-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>OPERATIONAL DISPATCH</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-video"></i> Meeting Scheduler
              </span>
              <span class="status-meta-pill" v-if="employees.length > 0">
                <i class="fas fa-users"></i> {{ employees.length }} Staff Directory
              </span>
            </div>
            <h1 class="page-title">Schedule a Meeting</h1>
            <p class="page-subtitle">
              Coordinate video conferences or in-office sessions with targeted employees, departments, and guests.
            </p>
          </div>

          <!-- Banner Right Controls: Mode Switcher & Reset -->
          <div class="banner-controls">
            <!-- Segmented Mode Switcher -->
            <div class="mode-segmented-pills">
              <button
                type="button"
                class="segmented-pill-btn"
                :class="{ active: activeTab === 'online' }"
                @click="selectTab('online')"
              >
                <i class="fas fa-video"></i>
                <span>Virtual Video</span>
              </button>
              <button
                type="button"
                class="segmented-pill-btn"
                :class="{ active: activeTab === 'offline' }"
                @click="selectTab('offline')"
              >
                <i class="fas fa-building"></i>
                <span>In-Person</span>
              </button>
            </div>

            <button class="btn-reset-header" @click="resetForm" :disabled="isSubmitting" title="Reset all fields">
              <i class="fas fa-undo"></i>
              <span>Reset</span>
            </button>
          </div>
        </header>

        <!-- Feedback Alert Messages -->
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

        <!-- 🌿 Main Responsive 2-Column Layout -->
        <div class="meeting-workspace-layout">
          
          <!-- ◀️ LEFT COLUMN: Forms & Directory Picker -->
          <div class="workspace-main-column">

            <!-- 1. SECTION: MEETING CORE DETAILS -->
            <div class="enterprise-form-card">
              <div class="card-section-header">
                <div class="header-step-badge">1</div>
                <div class="header-title-wrap">
                  <h2 class="card-section-title">Meeting Specifications</h2>
                  <p class="card-section-sub">Set title, date, time, and session parameters</p>
                </div>
                <span class="session-type-badge" :class="activeTab">
                  <i :class="activeTab === 'online' ? 'fas fa-video' : 'fas fa-map-marker-alt'"></i>
                  {{ activeTab === 'online' ? 'Online Conference' : 'In-Office Session' }}
                </span>
              </div>

              <div class="card-section-body">
                <!-- Meeting Title -->
                <div class="form-field-group">
                  <div class="label-row">
                    <label for="meetingTitle" class="form-label">
                      Meeting Title <span class="required-star">*</span>
                    </label>
                    <span class="char-counter">{{ meetingForm.title.length }}/100</span>
                  </div>
                  <input
                    type="text"
                    id="meetingTitle"
                    v-model="meetingForm.title"
                    class="form-text-input"
                    placeholder="e.g. Q4 Performance Strategy & Project Roadmap"
                    maxlength="100"
                  />
                </div>

                <!-- Description & Agenda -->
                <div class="form-field-group">
                  <div class="label-row">
                    <label for="meetingDescription" class="form-label">
                      Agenda & Discussion Topics
                    </label>
                    <span class="char-counter">{{ meetingForm.description.length }}/1000</span>
                  </div>
                  <textarea
                    id="meetingDescription"
                    v-model="meetingForm.description"
                    class="form-text-input textarea"
                    placeholder="Outline key discussion points, goals, deliverables or preparation notes..."
                    rows="3"
                    maxlength="1000"
                  ></textarea>
                </div>

                <!-- Date & Time Row -->
                <div class="form-two-col-row">
                  <div class="form-field-group">
                    <label for="meetingDate" class="form-label">
                      Meeting Date <span class="required-star">*</span>
                    </label>
                    <input
                      type="date"
                      id="meetingDate"
                      v-model="meetingForm.date"
                      class="form-text-input"
                      :min="today"
                    />
                  </div>

                  <div class="form-field-group">
                    <label for="meetingTime" class="form-label">
                      Start Time <span class="required-star">*</span>
                    </label>
                    <input
                      type="time"
                      id="meetingTime"
                      v-model="meetingForm.time"
                      class="form-text-input"
                    />
                  </div>
                </div>

                <!-- Duration & Location/Access Row -->
                <div class="form-two-col-row">
                  <div class="form-field-group">
                    <label for="durationSelect" class="form-label">
                      Duration
                    </label>
                    <div class="select-field-wrap">
                      <select id="durationSelect" v-model="meetingForm.duration" class="form-text-input select">
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
                  <div class="form-field-group" v-if="activeTab === 'offline'">
                    <label for="meetingLocation" class="form-label">
                      Room / Location <span class="optional-tag">Optional</span>
                    </label>
                    <input
                      type="text"
                      id="meetingLocation"
                      v-model="meetingForm.location"
                      class="form-text-input"
                      placeholder="e.g. Main Conference Room (Floor 2)"
                      maxlength="120"
                    />
                  </div>

                  <div class="form-field-group" v-else>
                    <label class="form-label">
                      Access Permission
                    </label>
                    <div class="select-field-wrap">
                      <select v-model="meetingForm.accessType" class="form-text-input select">
                        <option value="invited">🔒 Restricted: Selected Invitees Only</option>
                        <option value="anyone">🌐 Open: Anyone with Link</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Video Provider Row (Online) -->
                <div class="form-two-col-row" v-if="activeTab === 'online'">
                  <div class="form-field-group">
                    <label class="form-label">Video Conference Provider</label>
                    <div class="select-field-wrap">
                      <select v-model="videoProvider" class="form-text-input select">
                        <option value="auto">🎥 ARCH360 Video Room (Auto-Generated)</option>
                        <option value="custom">🔗 Custom Link (Google Meet, Zoom, Teams)</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-field-group" v-if="videoProvider === 'custom'">
                    <label class="form-label">
                      Custom Video URL <span class="required-star">*</span>
                    </label>
                    <input
                      type="url"
                      v-model="customMeetingUrl"
                      class="form-text-input"
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                    />
                  </div>

                  <div class="form-field-group" v-else>
                    <label class="form-label">Conference Status</label>
                    <div class="generated-link-indicator">
                      <i class="fas fa-shield-alt"></i>
                      <span>Built-in encrypted video room will be created</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. SECTION: PARTICIPANT DIRECTORY -->
            <div class="enterprise-form-card">
              <div class="card-section-header">
                <div class="header-step-badge highlight">2</div>
                <div class="header-title-wrap">
                  <h2 class="card-section-title">
                    Invited Participants <span class="required-star">*</span>
                    <span class="count-pill" :class="{ 'zero-count': allGuestEmails.length === 0 }">
                      {{ selectedEmployeeIds.length + externalGuests.length }} Selected
                    </span>
                  </h2>
                  <p class="card-section-sub">Select employees or add external guest emails</p>
                </div>

                <!-- Directory Mode Tabs -->
                <div class="directory-mode-pills">
                  <button 
                    type="button" 
                    class="mode-pill-btn"
                    :class="{ active: attendeeTab === 'specific' }"
                    @click="attendeeTab = 'specific'"
                  >
                    <i class="fas fa-users"></i>
                    <span>Employees ({{ employees.length }})</span>
                  </button>
                  <button 
                    type="button" 
                    class="mode-pill-btn"
                    :class="{ active: attendeeTab === 'department' }"
                    @click="attendeeTab = 'department'"
                  >
                    <i class="fas fa-sitemap"></i>
                    <span>By Team</span>
                  </button>
                  <button 
                    type="button" 
                    class="mode-pill-btn"
                    :class="{ active: attendeeTab === 'external' }"
                    @click="attendeeTab = 'external'"
                  >
                    <i class="fas fa-envelope"></i>
                    <span>External</span>
                  </button>
                </div>
              </div>

              <div class="card-section-body">
                <!-- Selected Attendees Pill Tray -->
                <div v-if="allGuestEmails.length > 0" class="attendees-tray">
                  <div class="tray-title-row">
                    <span class="tray-title">
                      <i class="fas fa-check-circle"></i>
                      <span>Selected Invitees ({{ allGuestEmails.length }})</span>
                    </span>
                    <button type="button" class="btn-clear-tray" @click="clearAllAttendees">
                      <i class="fas fa-times-circle"></i> Clear All
                    </button>
                  </div>

                  <div class="attendee-chips-row">
                    <!-- Selected Staff Chips -->
                    <div 
                      v-for="emp in selectedEmployees" 
                      :key="'selected-' + emp.id" 
                      class="attendee-chip"
                    >
                      <div class="chip-dot" :style="{ background: getAvatarColor(emp.name) }">
                        {{ getInitials(emp.name) }}
                      </div>
                      <span class="chip-name">{{ formatName(emp.name) }}</span>
                      <span class="chip-dept-pill">{{ emp.department || 'General' }}</span>
                      <button 
                        type="button" 
                        class="chip-remove-btn" 
                        @click="removeSelectedEmployee(emp.id)" 
                        title="Remove"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>

                    <!-- External Guest Chips -->
                    <div 
                      v-for="(guest, gIdx) in externalGuests" 
                      :key="'guest-' + gIdx" 
                      class="attendee-chip guest"
                    >
                      <div class="chip-dot guest">
                        <i class="fas fa-envelope"></i>
                      </div>
                      <span class="chip-name">{{ guest }}</span>
                      <span class="chip-dept-pill guest">Guest</span>
                      <button 
                        type="button" 
                        class="chip-remove-btn" 
                        @click="removeExternalGuest(gIdx)" 
                        title="Remove guest"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Empty Selection Hint -->
                <div v-else class="empty-selection-box">
                  <i class="fas fa-user-plus"></i>
                  <span>No participants chosen yet. Select at least 1 employee or enter a guest email.</span>
                </div>

                <!-- ────── SUB-VIEW 1: INDIVIDUAL EMPLOYEE DIRECTORY ────── -->
                <div v-if="attendeeTab === 'specific'" class="specific-directory-wrap">
                  <!-- Search & Selection Toolbar -->
                  <div class="directory-toolbar">
                    <div class="directory-search-box">
                      <i class="fas fa-search search-icon"></i>
                      <input
                        type="text"
                        v-model="searchQuery"
                        class="search-input"
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

                    <div class="directory-quick-actions">
                      <button 
                        type="button" 
                        class="quick-action-btn" 
                        @click="selectAllFiltered"
                        :disabled="filteredEmployees.length === 0"
                      >
                        <i class="fas fa-check-double"></i>
                        <span>Select All ({{ filteredEmployees.length }})</span>
                      </button>
                      <button 
                        type="button" 
                        class="quick-action-btn secondary" 
                        @click="deselectAllFiltered"
                        :disabled="filteredEmployees.length === 0"
                      >
                        <i class="fas fa-minus-circle"></i>
                        <span>Deselect</span>
                      </button>
                    </div>
                  </div>

                  <!-- Department Filter Pills -->
                  <div class="department-pills-bar" v-if="departmentList.length > 0">
                    <button
                      type="button"
                      class="dept-filter-pill"
                      :class="{ active: selectedDeptFilter === 'all' }"
                      @click="selectedDeptFilter = 'all'"
                    >
                      <span>All Staff</span>
                      <span class="count">{{ employees.length }}</span>
                    </button>
                    <button
                      v-for="dept in departmentList"
                      :key="dept.name"
                      type="button"
                      class="dept-filter-pill"
                      :class="{ active: selectedDeptFilter === dept.name }"
                      @click="selectedDeptFilter = dept.name"
                    >
                      <span>{{ dept.name }}</span>
                      <span class="count">{{ dept.count }}</span>
                    </button>
                  </div>

                  <!-- Loading / Error / Grid -->
                  <div v-if="loadingEmployees" class="loading-state-box">
                    <i class="fas fa-circle-notch fa-spin"></i>
                    <span>Loading company employee directory...</span>
                  </div>

                  <div v-else-if="employeeFetchError" class="error-state-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>{{ employeeFetchError }}</span>
                    <button type="button" class="btn-retry" @click="fetchEmployees">Retry</button>
                  </div>

                  <div v-else class="employee-cards-grid">
                    <div
                      v-for="emp in filteredEmployees"
                      :key="emp.id"
                      class="employee-card"
                      :class="{ selected: isEmployeeSelected(emp.id) }"
                      @click="toggleEmployee(emp)"
                    >
                      <div class="card-check" :class="{ checked: isEmployeeSelected(emp.id) }">
                        <i class="fas fa-check" v-if="isEmployeeSelected(emp.id)"></i>
                      </div>

                      <div class="card-avatar" :style="{ background: getAvatarColor(emp.name) }">
                        {{ getInitials(emp.name) }}
                      </div>

                      <div class="card-meta">
                        <div class="name-line">
                          <span class="emp-name" :title="emp.name">{{ formatName(emp.name) }}</span>
                          <span class="dept-badge">{{ emp.department || 'General' }}</span>
                        </div>
                        <span class="emp-email" :title="emp.email">{{ emp.email }}</span>
                      </div>
                    </div>

                    <div v-if="filteredEmployees.length === 0" class="no-results-box">
                      <i class="fas fa-user-slash"></i>
                      <span>No employees match "{{ searchQuery }}"</span>
                      <button type="button" class="btn-clear-filter" @click="searchQuery = ''; selectedDeptFilter = 'all'">
                        Reset Search
                      </button>
                    </div>
                  </div>
                </div>

                <!-- ────── SUB-VIEW 2: SELECT BY DEPARTMENT ────── -->
                <div v-if="attendeeTab === 'department'" class="department-directory-wrap">
                  <div class="dept-header-hint">
                    <i class="fas fa-sitemap"></i>
                    <span>Click a department card to toggle all active team members at once.</span>
                  </div>

                  <div class="department-cards-grid">
                    <div
                      v-for="dept in departmentList"
                      :key="dept.name"
                      class="team-card"
                      :class="{ 'is-selected': isDeptFullySelected(dept.name) }"
                      @click="toggleDepartment(dept.name)"
                    >
                      <div class="team-card-top">
                        <div class="team-icon-box">
                          <i class="fas fa-building"></i>
                        </div>
                        <span class="team-status-tag" :class="{ active: isDeptFullySelected(dept.name) }">
                          {{ isDeptFullySelected(dept.name) ? 'Added' : `${dept.count} Staff` }}
                        </span>
                      </div>
                      <h3 class="team-title">{{ dept.name }}</h3>
                      <span class="team-action-hint">
                        <i :class="isDeptFullySelected(dept.name) ? 'fas fa-check' : 'fas fa-plus'"></i>
                        {{ isDeptFullySelected(dept.name) ? 'Remove Team' : 'Add Team Members' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- ────── SUB-VIEW 3: EXTERNAL GUEST EMAILS ────── -->
                <div v-if="attendeeTab === 'external'" class="external-directory-wrap">
                  <div class="external-input-bar">
                    <div class="external-input-box">
                      <i class="fas fa-envelope"></i>
                      <input
                        type="email"
                        v-model="newExternalEmail"
                        class="form-text-input external"
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
                      <i class="fas fa-plus"></i>
                      <span>Add Guest</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ▶️ RIGHT COLUMN: Sticky Executive Summary Card -->
          <div class="workspace-side-column">
            <div class="executive-summary-card">
              <div class="summary-card-header">
                <span class="summary-mode-pill" :class="activeTab">
                  <i :class="activeTab === 'online' ? 'fas fa-video' : 'fas fa-building'"></i>
                  <span>{{ activeTab === 'online' ? 'Online Conference' : 'In-Office Session' }}</span>
                </span>
                <span class="summary-live-dot">
                  <span class="live-dot"></span> Live Summary
                </span>
              </div>

              <!-- Meeting Details Preview -->
              <div class="summary-body">
                <h3 class="summary-meeting-title">
                  {{ meetingForm.title || 'Untitled Meeting' }}
                </h3>
                <p class="summary-agenda-text" v-if="meetingForm.description">
                  {{ meetingForm.description }}
                </p>
                <p class="summary-agenda-empty" v-else>
                  No description added yet. Add agenda notes to brief participants.
                </p>

                <div class="summary-divider"></div>

                <!-- Meta Rows -->
                <div class="summary-meta-list">
                  <div class="summary-meta-item">
                    <div class="meta-icon">
                      <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="meta-text">
                      <span class="label">Date & Time</span>
                      <span class="value">
                        {{ meetingForm.date && meetingForm.time ? formatDateTime() : 'Not scheduled' }}
                      </span>
                    </div>
                  </div>

                  <div class="summary-meta-item">
                    <div class="meta-icon">
                      <i class="fas fa-hourglass-half"></i>
                    </div>
                    <div class="meta-text">
                      <span class="label">Duration</span>
                      <span class="value">{{ meetingForm.duration }} Minutes</span>
                    </div>
                  </div>

                  <div class="summary-meta-item" v-if="activeTab === 'offline'">
                    <div class="meta-icon">
                      <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="meta-text">
                      <span class="label">Location</span>
                      <span class="value">{{ meetingForm.location || 'Headquarters Office' }}</span>
                    </div>
                  </div>

                  <div class="summary-meta-item" v-else>
                    <div class="meta-icon">
                      <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="meta-text">
                      <span class="label">Access</span>
                      <span class="value">{{ meetingForm.accessType === 'anyone' ? 'Open link' : 'Invitees only' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Attendees Stack Preview -->
                <div class="summary-attendees-section">
                  <div class="attendees-section-title">
                    <span>Invited Attendees</span>
                    <span class="badge" :class="{ zero: allGuestEmails.length === 0 }">
                      {{ allGuestEmails.length }}
                    </span>
                  </div>

                  <div v-if="allGuestEmails.length > 0" class="attendees-stack-wrap">
                    <div class="avatar-stack-circles">
                      <div 
                        v-for="emp in previewAvatarList" 
                        :key="'stack-' + emp.id" 
                        class="stack-circle"
                        :style="{ background: getAvatarColor(emp.name) }"
                        :title="emp.name"
                      >
                        {{ getInitials(emp.name) }}
                      </div>
                      <div v-if="remainingAvatarCount > 0" class="stack-circle more">
                        +{{ remainingAvatarCount }}
                      </div>
                    </div>
                    <span class="attendees-summary-caption">{{ attendeeSummaryText }}</span>
                  </div>

                  <div v-else class="empty-attendee-warning">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Select at least 1 attendee</span>
                  </div>
                </div>

                <!-- Virtual Video Link Preview -->
                <div v-if="activeTab === 'online'" class="video-link-container">
                  <div class="video-link-header-row">
                    <span class="video-link-label">Meeting URL</span>
                    <span class="video-provider-badge">
                      <i :class="videoProvider === 'custom' ? 'fas fa-link' : 'fas fa-video'"></i>
                      {{ videoProvider === 'custom' ? 'Custom Provider' : 'ARCH360 Meet' }}
                    </span>
                  </div>
                  <div class="video-link-bar">
                    <span class="link-text">{{ meetingLink }}</span>
                    <div class="link-bar-actions">
                      <button type="button" class="btn-copy-link" @click="copyToClipboard" :title="copyTooltip">
                        <i :class="copyTooltip === 'Copied!' ? 'fas fa-check' : 'fas fa-copy'"></i>
                        <span>{{ copyTooltip === 'Copied!' ? 'Copied' : 'Copy' }}</span>
                      </button>
                      <a :href="meetingLink" target="_blank" rel="noopener noreferrer" class="btn-test-link" title="Test meeting room">
                        <i class="fas fa-external-link-alt"></i>
                        <span>Test</span>
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Media Controls (Online) -->
                <div v-if="activeTab === 'online'" class="media-controls-wrap">
                  <div class="media-toggle-row">
                    <span class="toggle-name"><i class="fas fa-video"></i> Host Video</span>
                    <label class="switch-control">
                      <input type="checkbox" v-model="meetingForm.hostVideo" />
                      <span class="slider-round"></span>
                    </label>
                  </div>
                  <div class="media-toggle-row">
                    <span class="toggle-name"><i class="fas fa-users"></i> Participant Video</span>
                    <label class="switch-control">
                      <input type="checkbox" v-model="meetingForm.guestVideo" />
                      <span class="slider-round"></span>
                    </label>
                  </div>
                </div>

                <!-- Action CTA Button -->
                <div class="summary-action-area">
                  <button
                    type="button"
                    class="btn-submit-schedule"
                    @click="handleSubmitMeeting"
                    :disabled="!isFormValid || isSubmitting"
                  >
                    <span v-if="!isSubmitting">
                      <i class="fas fa-paper-plane"></i>
                      <span>{{ activeTab === 'online' ? 'Schedule Video Meeting' : 'Schedule In-Person Meeting' }}</span>
                    </span>
                    <span v-else class="loading-wrap">
                      <i class="fas fa-circle-notch fa-spin"></i>
                      <span>Scheduling...</span>
                    </span>
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
      activeTab: 'online', // 'online' | 'offline'
      attendeeTab: 'specific', // 'specific' | 'department' | 'external'
      today: '',
      meetingId: '',
      copyTooltip: 'Copy to clipboard',
      isSubmitting: false,
      successMessage: '',
      errorMessage: '',

      // Core meeting form model
      videoProvider: 'auto', // 'auto' | 'custom'
      customMeetingUrl: '',
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
      if (this.videoProvider === 'custom' && this.customMeetingUrl && this.customMeetingUrl.trim()) {
        return this.customMeetingUrl.trim()
      }
      const baseUrl = window.location.origin
      return `${baseUrl}/meet/${this.meetingId}`
    },

    isFormValid() {
      const hasTitle = !!(this.meetingForm.title && this.meetingForm.title.trim())
      const hasDate = !!this.meetingForm.date
      const hasTime = !!this.meetingForm.time
      const hasMinOneUser = this.allGuestEmails.length >= 1
      const hasCustomLink = this.activeTab !== 'online' || this.videoProvider !== 'custom' || !!(this.customMeetingUrl && this.customMeetingUrl.trim())
      return hasTitle && hasDate && hasTime && hasMinOneUser && hasCustomLink
    },

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

    selectedEmployees() {
      return this.employees.filter(emp => 
        this.selectedEmployeeIds.some(id => String(id) === String(emp.id))
      )
    },

    allGuestEmails() {
      const empEmails = this.selectedEmployees.map(e => e.email).filter(Boolean)
      return [...new Set([...empEmails, ...this.externalGuests])]
    },

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
      this.isMobile = window.innerWidth <= 992
    },

    toggleMobileSidebar() {
      if (this.$refs.sidebarRef && typeof this.$refs.sidebarRef.toggleMobileMenu === 'function') {
        this.$refs.sidebarRef.toggleMobileMenu()
      } else {
        window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'))
      }
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
        'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'linear-gradient(135deg, #10b981 0%, #047857 100%)',
        'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)'
      ]
      let hash = 0
      for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return gradients[Math.abs(hash) % gradients.length]
    },

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
      this.videoProvider = 'auto'
      this.customMeetingUrl = ''
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

    async fetchEmployees() {
      this.loadingEmployees = true
      this.employeeFetchError = ''
      try {
        let resp
        try {
          resp = await axios.get('/api/users')
        } catch {
          resp = await axios.get('https://employees.archenterprises.co.in/api/api/users')
        }
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

    async handleSubmitMeeting() {
      if (!this.meetingForm.title || !this.meetingForm.title.trim() || !this.meetingForm.date || !this.meetingForm.time) {
        this.errorMessage = 'Please complete all required fields (Title, Date, Time).'
        toastError(this.errorMessage)
        return
      }

      if (this.activeTab === 'online' && this.videoProvider === 'custom' && (!this.customMeetingUrl || !this.customMeetingUrl.trim())) {
        this.errorMessage = 'Please enter a valid custom meeting URL (e.g. Google Meet or Zoom).'
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
        const scheduleEndpointCandidates = [
          '/api/meetings/schedule',
          'https://employees.archenterprises.co.in/api/api/meetings/schedule',
          '/api/meeting/schedule'
        ]

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

          let scheduled = false
          let lastErr = null
          for (const endpoint of scheduleEndpointCandidates) {
            try {
              await axios.post(endpoint, meetingData)
              scheduled = true
              break
            } catch (e) {
              lastErr = e
            }
          }
          if (!scheduled && lastErr) throw lastErr
          
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

          let scheduled = false
          let lastErr = null
          for (const endpoint of scheduleEndpointCandidates) {
            try {
              await axios.post(endpoint, meetingData)
              scheduled = true
              break
            } catch (e) {
              lastErr = e
            }
          }
          if (!scheduled && lastErr) throw lastErr
          
          this.successMessage = `In-person meeting scheduled successfully! Invitations dispatched to ${guests.length} participant(s).`
          toastSuccess('In-person meeting scheduled successfully!')
        }

        setTimeout(() => {
          this.resetForm()
        }, 4000)
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

*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Base Layout & Fixed Sidebar Flow */
.layout {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  padding: 20px 28px;
  gap: 28px;
  min-height: calc(100vh - 78px);
  position: relative;
  box-sizing: border-box;
  width: 100%;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-x: hidden;
}

/* 📱 Mobile Top Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.mobile-title i {
  color: #4f46e5;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-mode-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  color: #4338ca;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.btn-mobile-menu {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
}

/* 🏢 Modern Enterprise Header Banner */
.schedule-top-banner {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.banner-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #c7d2fe;
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.status-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
}

.status-meta-pill i {
  color: #4f46e5;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
  line-height: 1.45;
}

.banner-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Mode Segmented Pills */
.mode-segmented-pills {
  display: inline-flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
}

.segmented-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.segmented-pill-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.segmented-pill-btn.active i {
  color: #4f46e5;
}

.btn-reset-header {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-reset-header:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

/* Alert Banners */
.alert-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 500;
}

.alert-banner.success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.alert-banner.danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
}

/* 🌿 Main Workspace Layout: Form on Left + Summary on Right */
.meeting-workspace-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.workspace-main-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.workspace-side-column {
  width: 360px;
  max-width: 360px;
  flex-shrink: 0;
  position: sticky;
  top: 98px;
}

/* Enterprise Form Card */
.enterprise-form-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.card-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
  margin-bottom: 20px;
  gap: 14px;
  flex-wrap: wrap;
}

.header-step-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #475569;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-step-badge.highlight {
  background: #4f46e5;
  color: #ffffff;
}

.header-title-wrap {
  flex: 1;
  min-width: 0;
}

.card-section-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.01em;
}

.card-section-sub {
  font-size: 12.5px;
  color: #64748b;
  margin: 2px 0 0 0;
}

.count-pill {
  font-size: 11.5px;
  font-weight: 700;
  color: #10b981;
  background: #ecfdf5;
  padding: 2px 8px;
  border-radius: 6px;
}

.count-pill.zero-count {
  color: #d97706;
  background: #fffbeb;
}

.session-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.session-type-badge.online {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.session-type-badge.offline {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

/* Form Fields */
.card-section-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.required-star {
  color: #ef4444;
}

.optional-tag {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  margin-left: 4px;
}

.char-counter {
  font-size: 11.5px;
  color: #94a3b8;
}

.form-text-input {
  box-sizing: border-box !important;
  width: 100%;
  height: 40px;
  padding: 0 14px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: inherit;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
}

.form-text-input:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.form-text-input.textarea {
  height: auto;
  padding: 10px 14px;
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.form-two-col-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.select-field-wrap {
  position: relative;
}

.form-text-input.select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 14px;
  padding-right: 36px;
  cursor: pointer;
}

/* 🌿 Directory Mode Pills (Step 2) */
.directory-mode-pills {
  display: inline-flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 9px;
  gap: 4px;
}

.mode-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.mode-pill-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Attendees Tray */
.attendees-tray {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
}

.tray-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tray-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
}

.tray-title i {
  color: #10b981;
}

.btn-clear-tray {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.attendee-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.attendee-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  padding: 3px 8px 3px 3px;
  font-size: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.chip-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 9.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-dot.guest {
  background: #6366f1;
}

.chip-name {
  font-weight: 600;
  color: #0f172a;
}

.chip-dept-pill {
  font-size: 10px;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
  padding: 1px 5px;
  border-radius: 4px;
}

.chip-dept-pill.guest {
  background: #e0e7ff;
  color: #4338ca;
}

.chip-remove-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  font-size: 11px;
}

.chip-remove-btn:hover {
  color: #ef4444;
}

.empty-selection-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fffbeb;
  border: 1px dashed #fde68a;
  border-radius: 10px;
  color: #92400e;
  font-size: 12.5px;
}

.empty-selection-box i {
  color: #d97706;
}

/* Directory Toolbar */
.directory-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.directory-search-box {
  position: relative;
  flex: 1;
  min-width: 240px;
}

.directory-search-box .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.directory-search-box .search-input {
  box-sizing: border-box !important;
  width: 100%;
  height: 38px;
  padding: 0 32px 0 34px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
}

.directory-search-box .search-input:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 11px;
}

.directory-quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  color: #4338ca;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.quick-action-btn.secondary {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.quick-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Department Filter Pills */
.department-pills-bar {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-top: 8px;
  scrollbar-width: none;
}

.department-pills-bar::-webkit-scrollbar {
  display: none;
}

.dept-filter-pill {
  box-sizing: border-box !important;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
}

.dept-filter-pill.active {
  background: #4f46e5;
  border-color: #4338ca;
  color: #ffffff;
}

.dept-filter-pill .count {
  font-size: 10px;
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 5px;
  border-radius: 9999px;
}

.dept-filter-pill.active .count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Employee Cards Grid */
.employee-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
  margin-top: 8px;
  padding: 2px;
}

.employee-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 0;
}

.employee-card:hover {
  border-color: #cbd5e1;
  background: #fbfbfe;
  transform: translateY(-1px);
}

.employee-card.selected {
  border-color: #4f46e5;
  background: #f5f3ff;
  box-shadow: 0 0 0 1px #4f46e5;
}

.card-check {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #ffffff;
  flex-shrink: 0;
}

.card-check.checked {
  background: #4f46e5;
  border-color: #4f46e5;
}

.card-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.emp-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dept-badge {
  font-size: 9.5px;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
  padding: 1px 4px;
  border-radius: 3px;
}

.emp-email {
  font-size: 11px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-results-box {
  grid-column: 1 / -1;
  text-align: center;
  padding: 28px;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

/* Team Cards Grid */
.dept-header-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  color: #475569;
  margin-top: 6px;
  margin-bottom: 12px;
}

.department-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.team-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.team-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.team-card.is-selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.team-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.team-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.team-status-tag {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
}

.team-status-tag.active {
  background: #dcfce7;
  color: #15803d;
}

.team-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.team-action-hint {
  font-size: 11.5px;
  font-weight: 600;
  color: #4f46e5;
}

.team-card.is-selected .team-action-hint {
  color: #15803d;
}

/* External Guest Input */
.external-input-bar {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.external-input-box {
  position: relative;
  flex: 1;
}

.external-input-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.form-text-input.external {
  padding-left: 34px;
}

.btn-add-external {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  background: #4f46e5;
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-add-external:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading & Error States */
.loading-state-box,
.error-state-box {
  padding: 24px;
  text-align: center;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
}

.btn-retry {
  padding: 4px 10px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 11.5px;
  cursor: pointer;
}

/* ▶️ RIGHT COLUMN: Executive Live Summary Card */
.executive-summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
  width: 100%;
}

.summary-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.summary-mode-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 9999px;
}

.summary-mode-pill.online {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.summary-mode-pill.offline {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.summary-live-dot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
}

.summary-meeting-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
  word-break: break-word;
}

.summary-agenda-text {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.45;
  margin: 0;
  word-break: break-word;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-agenda-empty {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
}

.summary-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 14px 0;
}

.summary-meta-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #f1f5f9;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.meta-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.meta-text .label {
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.meta-text .value {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Summary Attendees */
.summary-attendees-section {
  margin-top: 14px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.attendees-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.attendees-section-title .badge {
  font-size: 10.5px;
  background: #ecfdf5;
  color: #065f46;
  padding: 1px 6px;
  border-radius: 9999px;
}

.attendees-section-title .badge.zero {
  background: #fffbeb;
  color: #92400e;
}

.avatar-stack-circles {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.stack-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -6px;
}

.stack-circle:first-child {
  margin-left: 0;
}

.stack-circle.more {
  background: #475569;
}

.attendees-summary-caption {
  font-size: 11.5px;
  color: #475569;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-attendee-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #b45309;
}

/* Virtual Video Link */
.video-link-container {
  margin-top: 12px;
}

.video-link-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.video-link-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.video-provider-badge {
  font-size: 10px;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 2px 7px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.video-link-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 5px 8px;
  gap: 8px;
}

.link-text {
  font-size: 11.5px;
  font-family: monospace;
  color: #4338ca;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.link-bar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn-copy-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.btn-copy-link:hover {
  background: #4338ca;
}

.btn-test-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.btn-test-link:hover {
  background: #0369a1;
}

.generated-link-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-size: 12.5px;
  font-weight: 600;
}
.generated-link-indicator i {
  color: #16a34a;
  font-size: 15px;
}

/* Media Controls */
.media-controls-wrap {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.media-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #334155;
}

.toggle-name i {
  color: #64748b;
  font-size: 11px;
}

.switch-control {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}

.switch-control input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider-round {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  transition: .3s;
  border-radius: 34px;
}

.slider-round:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider-round {
  background-color: #4f46e5;
}

input:checked + .slider-round:before {
  transform: translateX(14px);
}

/* Action CTA Area */
.summary-action-area {
  margin-top: 16px;
}

.btn-submit-schedule {
  box-sizing: border-box !important;
  width: 100%;
  padding: 11px 16px;
  background: #4f46e5;
  border: 1px solid #4338ca;
  border-radius: 10px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-submit-schedule:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.35);
}

.btn-submit-schedule:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

/* 📱 Responsive Breakpoints */
@media (max-width: 1180px) {
  .meeting-workspace-layout {
    flex-direction: column;
  }

  .workspace-side-column {
    width: 100%;
    max-width: 100%;
    position: static;
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 16px;
    gap: 0;
  }

  .schedule-top-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .banner-controls {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .form-two-col-row {
    grid-template-columns: 1fr;
  }

  .card-section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .directory-mode-pills {
    width: 100%;
    overflow-x: auto;
  }

  .directory-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .directory-quick-actions {
    justify-content: space-between;
  }

  .external-input-bar {
    flex-direction: column;
  }

  .btn-add-external {
    height: 38px;
    justify-content: center;
  }
}
</style>