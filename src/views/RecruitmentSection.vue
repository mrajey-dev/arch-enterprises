<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- 📱 Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <div class="mobile-title-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <span>Recruitment</span>
          </div>
          <div class="mobile-header-actions">
            <button class="mobile-add-btn" @click="openAddForm" title="Add Candidate">
              <i class="fas fa-plus"></i>
              <span>Add</span>
            </button>
            <button class="btn-mobile-menu" @click="isSidebarVisible = !isSidebarVisible" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Top Banner -->
        <header class="recruitment-top-banner" v-else>
          <div class="banner-left">
            <div class="banner-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>TALENT ACQUISITION & HIRING</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-users"></i> {{ candidates.length }} Applications
              </span>
              <span class="status-meta-pill warning" v-if="pendingCount > 0">
                <i class="fas fa-clock"></i> {{ pendingCount }} Pending
              </span>
              <span class="status-meta-pill info" v-if="followUpCount > 0">
                <i class="fas fa-phone-alt"></i> {{ followUpCount }} Follow Up
              </span>
              <span class="status-meta-pill success" v-if="successfulCount > 0">
                <i class="fas fa-check-circle"></i> {{ successfulCount }} Hired
              </span>
            </div>
            <h1 class="page-title">Recruitment & Candidates</h1>
            <p class="page-subtitle">
              Manage candidate pipelines, evaluate applicant credentials, schedule interviews, and track recruitment progress in real time.
            </p>
          </div>

          <div class="banner-right-actions">
            <button class="add-candidate-btn" @click="openAddForm">
              <i class="fas fa-user-plus"></i>
              <span>Add Candidate</span>
            </button>
          </div>
        </header>

        <!-- 📊 Interactive Status Filter Metric Strip -->
        <div class="summary-strip">
          <div 
            class="summary-pill" 
            :class="{ active: !statusFilter }"
            @click="clearFilter"
            title="Show All Applications"
          >
            <div class="pill-icon-halo all"><i class="fas fa-th-list"></i></div>
            <div class="pill-info">
              <span class="pill-label">Total Applicants</span>
              <span class="pill-value">{{ candidates.length }}</span>
            </div>
            <span class="active-dot" v-if="!statusFilter"></span>
          </div>

          <div 
            class="summary-pill" 
            :class="{ active: statusFilter === 'Pending' }"
            @click="filterByStatus('Pending')"
            title="Filter by Pending"
          >
            <div class="pill-icon-halo pending"><i class="fas fa-clock"></i></div>
            <div class="pill-info">
              <span class="pill-label">Pending</span>
              <span class="pill-value text-pending">{{ pendingCount }}</span>
            </div>
            <span class="active-dot" v-if="statusFilter === 'Pending'"></span>
          </div>

          <div 
            class="summary-pill" 
            :class="{ active: statusFilter === 'Follow Up' }"
            @click="filterByStatus('Follow Up')"
            title="Filter by Follow Up"
          >
            <div class="pill-icon-halo followup"><i class="fas fa-phone-alt"></i></div>
            <div class="pill-info">
              <span class="pill-label">Follow Up</span>
              <span class="pill-value text-followup">{{ followUpCount }}</span>
            </div>
            <span class="active-dot" v-if="statusFilter === 'Follow Up'"></span>
          </div>

          <div 
            class="summary-pill" 
            :class="{ active: statusFilter === 'Successful' }"
            @click="filterByStatus('Successful')"
            title="Filter by Successful"
          >
            <div class="pill-icon-halo successful"><i class="fas fa-check-circle"></i></div>
            <div class="pill-info">
              <span class="pill-label">Successful</span>
              <span class="pill-value text-successful">{{ successfulCount }}</span>
            </div>
            <span class="active-dot" v-if="statusFilter === 'Successful'"></span>
          </div>

          <div 
            class="summary-pill" 
            :class="{ active: statusFilter === 'Rejected' }"
            @click="filterByStatus('Rejected')"
            title="Filter by Rejected"
          >
            <div class="pill-icon-halo rejected"><i class="fas fa-times-circle"></i></div>
            <div class="pill-info">
              <span class="pill-label">Rejected</span>
              <span class="pill-value text-rejected">{{ rejectedCount }}</span>
            </div>
            <span class="active-dot" v-if="statusFilter === 'Rejected'"></span>
          </div>
        </div>

        <!-- 🔍 Unified Toolbar: Search + Active Filter + View Switcher -->
        <div class="recruitment-toolbar">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by candidate name, job title, email, phone, or notes..."
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''" title="Clear search">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="toolbar-right">
            <!-- Active Filter Chip -->
            <div v-if="statusFilter" class="active-filter-badge" @click="statusFilter = ''" title="Click to clear filter">
              <span>Status: <strong>{{ statusFilter }}</strong></span>
              <i class="fas fa-times-circle"></i>
            </div>

            <!-- Results Counter -->
            <div class="results-count-pill">
              <span>Showing <strong>{{ filteredCandidates.length }}</strong> of {{ candidates.length }}</span>
            </div>

            <!-- View Switcher -->
            <div class="view-mode-toggle">
              <button 
                class="view-toggle-btn" 
                :class="{ active: viewMode === 'cards' }"
                @click="viewMode = 'cards'"
                title="Grid Cards View"
              >
                <i class="fas fa-th-large"></i>
                <span class="view-btn-text">Cards</span>
              </button>
              <button 
                class="view-toggle-btn" 
                :class="{ active: viewMode === 'table' }"
                @click="viewMode = 'table'"
                title="Data Table View"
              >
                <i class="fas fa-table-list"></i>
                <span class="view-btn-text">Table</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ⏳ Modern Loading State -->
        <div v-if="loadingLeaves" class="modern-loading-card">
          <div class="loading-ring-wrap">
            <div class="loading-ring"></div>
            <i class="fas fa-user-tie loading-icon"></i>
          </div>
          <h3 class="loading-title">Loading Candidate Pipeline...</h3>
          <p class="loading-subtitle">Retrieving applications, interview status, and attached resumes</p>
          <div class="loading-progress-bar"><div class="progress-indeterminate"></div></div>
        </div>

        <!-- 👥 Empty State (When no results) -->
        <div v-else-if="filteredCandidates.length === 0" class="empty-state-card">
          <div class="empty-icon-halo">
            <i class="fas fa-user-slash"></i>
          </div>
          <h3 class="empty-title">{{ searchQuery || statusFilter ? 'No Matching Candidates' : 'No Candidates Registered Yet' }}</h3>
          <p class="empty-desc">
            {{ searchQuery || statusFilter ? 'Try adjusting your search query or reset status filters to see all candidates.' : 'Start tracking talent applications by registering your first candidate.' }}
          </p>
          <div class="empty-actions">
            <button v-if="searchQuery || statusFilter" class="btn-reset-filters" @click="clearFilter">
              <i class="fas fa-redo"></i> Reset Filters
            </button>
            <button class="add-candidate-btn" @click="openAddForm">
              <i class="fas fa-plus"></i> Add Candidate
            </button>
          </div>
        </div>

        <!-- 👥 View 1: Candidate Cards Grid -->
        <div v-else-if="viewMode === 'cards'" class="candidates-grid">
          <div v-for="candidate in filteredCandidates" :key="candidate.id" class="candidate-card-modern">
            <div class="card-accent" :class="getStatusClass(candidate.status)"></div>
            
            <!-- Card Header -->
            <div class="card-header-modern">
              <div class="candidate-profile-meta">
                <div class="candidate-avatar" :class="getAvatarColorClass(candidate.id || candidate.name)">
                  {{ getInitials(candidate.name) }}
                </div>
                <div class="candidate-name-box">
                  <h3 class="candidate-name">{{ candidate.name }}</h3>
                  <span class="job-role-badge">
                    <i class="fas fa-briefcase"></i>
                    {{ candidate.job_title || 'Applicant' }}
                  </span>
                </div>
              </div>

              <!-- Pipeline Status Dropdown -->
              <div class="status-dropdown-wrap">
                <select
                  class="status-select-pill"
                  :class="getStatusClass(candidate.status)"
                  v-model="candidate.status"
                  @change="updateStatus(candidate)"
                  title="Update candidate pipeline status"
                >
                  <option value="Pending">⏳ Pending</option>
                  <option value="Follow Up">📞 Follow Up</option>
                  <option value="Successful">✅ Successful</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body-modern">
              <!-- Contact Details Grid -->
              <div class="contact-details-grid">
                <a :href="'mailto:' + candidate.email" class="contact-item" title="Send email">
                  <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                  <span class="contact-text">{{ candidate.email || '—' }}</span>
                </a>
                <a :href="'tel:' + candidate.phone" class="contact-item" title="Call phone">
                  <div class="contact-icon"><i class="fas fa-phone-alt"></i></div>
                  <span class="contact-text">{{ candidate.phone || '—' }}</span>
                </a>
                <div class="contact-item static">
                  <div class="contact-icon"><i class="fas fa-calendar-alt"></i></div>
                  <span class="contact-text">Applied: {{ formatDate(candidate.created_at) }}</span>
                </div>
              </div>

              <!-- Resume File Pill -->
              <div v-if="candidate.resume" class="resume-chip" @click.stop="viewCV(candidate)" title="Open resume in new tab">
                <div class="resume-icon"><i class="fas fa-file-pdf"></i></div>
                <div class="resume-info">
                  <span class="resume-label">Attached Resume</span>
                  <span class="resume-name">{{ getFileName(candidate.resume) }}</span>
                </div>
                <i class="fas fa-external-link-alt resume-arrow"></i>
              </div>

              <!-- Interview Status Box -->
              <div v-if="candidate.interview" class="interview-badge-box">
                <div class="interview-left">
                  <div class="interview-icon-circle">
                    <i class="fas fa-video" v-if="candidate.interview.mode === 'online'"></i>
                    <i class="fas fa-building" v-else-if="candidate.interview.mode === 'in-person'"></i>
                    <i class="fas fa-phone" v-else></i>
                  </div>
                  <div>
                    <span class="interview-label">Interview Scheduled</span>
                    <span class="interview-time">
                      <i class="fas fa-clock"></i> {{ formatInterviewDate(candidate.interview.date) }} {{ candidate.interview.time ? '• ' + candidate.interview.time : '' }}
                    </span>
                  </div>
                </div>
                <button class="btn-view-interview" @click="viewInterviewDetails(candidate)" title="View session details">
                  <i class="fas fa-eye"></i> Details
                </button>
              </div>

              <!-- Notes / Message -->
              <div v-if="candidate.message" class="candidate-notes-box">
                <div class="notes-header">
                  <i class="fas fa-sticky-note"></i>
                  <span>Notes / Message</span>
                </div>
                <p class="notes-content" :class="{ collapsed: !candidate.expanded }">
                  {{ candidate.message }}
                </p>
                <button
                  v-if="candidate.message && candidate.message.length > 100"
                  class="btn-show-notes"
                  @click="candidate.expanded = !candidate.expanded"
                >
                  <span>{{ candidate.expanded ? 'Show less' : 'Read more' }}</span>
                  <i :class="candidate.expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                </button>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer-modern">
              <button
                class="btn-schedule-action"
                @click="openScheduleInterview(candidate)"
                :class="{ 'has-interview': candidate.interview }"
              >
                <i :class="candidate.interview ? 'fas fa-calendar-check' : 'fas fa-calendar-plus'"></i>
                <span>{{ candidate.interview ? 'Reschedule Interview' : 'Schedule Interview' }}</span>
              </button>

              <div class="card-footer-icons">
                <button
                  v-if="candidate.resume"
                  class="btn-icon-cv"
                  @click.stop="viewCV(candidate)"
                  title="Open resume in new tab"
                >
                  <i class="fas fa-file-pdf"></i>
                </button>
                <button
                  class="btn-icon-delete"
                  @click="deleteCandidate(candidate)"
                  title="Delete Candidate Record"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 👥 View 2: High Density Data Table View -->
        <div v-else class="candidates-table-container">
          <div class="table-card">
            <div class="table-responsive">
              <table class="enterprise-candidates-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Position</th>
                    <th>Contact Information</th>
                    <th>Resume</th>
                    <th>Interview Session</th>
                    <th>Hiring Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="candidate in filteredCandidates" :key="candidate.id" class="table-row-hover">
                    <!-- Candidate -->
                    <td>
                      <div class="table-candidate-cell">
                        <div class="table-avatar" :class="getAvatarColorClass(candidate.id || candidate.name)">
                          {{ getInitials(candidate.name) }}
                        </div>
                        <div class="table-candidate-info">
                          <span class="table-candidate-name">{{ candidate.name }}</span>
                          <span class="table-applied-date">
                            <i class="fas fa-calendar-alt"></i> Applied {{ formatDate(candidate.created_at) }}
                          </span>
                        </div>
                      </div>
                    </td>

                    <!-- Applied Position -->
                    <td>
                      <span class="table-role-badge">
                        {{ candidate.job_title || 'General Applicant' }}
                      </span>
                    </td>

                    <!-- Contact Information -->
                    <td>
                      <div class="table-contact-box">
                        <a :href="'mailto:' + candidate.email" class="table-contact-line">
                          <i class="fas fa-envelope"></i> {{ candidate.email || '—' }}
                        </a>
                        <a :href="'tel:' + candidate.phone" class="table-contact-line">
                          <i class="fas fa-phone-alt"></i> {{ candidate.phone || '—' }}
                        </a>
                      </div>
                    </td>

                    <!-- Resume -->
                    <td>
                      <button 
                        v-if="candidate.resume"
                        class="table-resume-btn" 
                        @click.stop="viewCV(candidate)"
                        title="Open resume in new tab"
                      >
                        <i class="fas fa-file-pdf"></i>
                        <span>Resume</span>
                        <i class="fas fa-external-link-alt resume-ext-icon"></i>
                      </button>
                      <span v-else class="text-muted-dash">—</span>
                    </td>

                    <!-- Interview Session -->
                    <td>
                      <div v-if="candidate.interview" class="table-interview-chip" @click="viewInterviewDetails(candidate)" title="View interview details">
                        <i class="fas fa-calendar-check text-success"></i>
                        <span>{{ formatInterviewDate(candidate.interview.date) }}</span>
                      </div>
                      <span v-else class="table-no-interview">Not scheduled</span>
                    </td>

                    <!-- Hiring Status -->
                    <td>
                      <select
                        class="status-select-pill sm"
                        :class="getStatusClass(candidate.status)"
                        v-model="candidate.status"
                        @change="updateStatus(candidate)"
                      >
                        <option value="Pending">⏳ Pending</option>
                        <option value="Follow Up">📞 Follow Up</option>
                        <option value="Successful">✅ Successful</option>
                        <option value="Rejected">❌ Rejected</option>
                      </select>
                    </td>

                    <!-- Actions -->
                    <td class="text-right">
                      <div class="table-actions-row">
                        <button 
                          class="action-btn-sm primary"
                          @click="openScheduleInterview(candidate)"
                          :title="candidate.interview ? 'Reschedule Interview' : 'Schedule Interview'"
                        >
                          <i :class="candidate.interview ? 'fas fa-calendar-check' : 'fas fa-calendar-plus'"></i>
                        </button>
                        <button 
                          v-if="candidate.interview"
                          class="action-btn-sm info"
                          @click="viewInterviewDetails(candidate)"
                          title="View Interview Details"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button 
                          class="action-btn-sm danger"
                          @click="deleteCandidate(candidate)"
                          title="Delete Candidate"
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
        </div>
      </section>
    </div>

    <!-- 🌟 Add Candidate Modal -->
    <div v-if="showAddForm" class="modal-overlay" @click="closeAddForm">
      <div class="modal-content" @click.stop>
        <div class="modal-decoration"></div>
        <div class="modal-header">
          <div class="modal-title">
            <div class="header-icon-circle">
              <i class="fas fa-user-plus"></i>
            </div>
            <div>
              <h2>Add New Candidate</h2>
              <p>Record a candidate application profile</p>
            </div>
          </div>
          <button class="modal-close" @click="closeAddForm">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitCandidate" class="candidate-form" enctype="multipart/form-data">
            <div class="form-row">
              <div class="form-group">
                <label for="name" class="field-label">Full Name <span class="required">*</span></label>
                <input
                  id="name"
                  type="text"
                  v-model="formData.name"
                  required
                  placeholder="Enter candidate full name"
                  class="form-input"
                  :class="{ 'error': errors.name }"
                />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>
              <div class="form-group">
                <label for="email" class="field-label">Email Address <span class="required">*</span></label>
                <input
                  id="email"
                  type="email"
                  v-model="formData.email"
                  required
                  placeholder="candidate@example.com"
                  class="form-input"
                  :class="{ 'error': errors.email }"
                />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone" class="field-label">Phone Number <span class="required">*</span></label>
                <input
                  id="phone"
                  type="tel"
                  v-model="formData.phone"
                  required
                  placeholder="e.g. +91 9876543210"
                  class="form-input"
                  :class="{ 'error': errors.phone }"
                />
                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
              </div>
              <div class="form-group">
                <label for="job_title" class="field-label">Job Title <span class="required">*</span></label>
                <input
                  id="job_title"
                  type="text"
                  v-model="formData.job_title"
                  required
                  placeholder="e.g., Software Engineer, Sales Manager"
                  class="form-input"
                  :class="{ 'error': errors.job_title }"
                />
                <span v-if="errors.job_title" class="error-message">{{ errors.job_title }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="status" class="field-label">Application Status</label>
                <select id="status" v-model="formData.status" class="form-input">
                  <option value="Pending">⏳ Pending</option>
                  <option value="Follow Up">📞 Follow Up</option>
                  <option value="Successful">✅ Successful</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
              </div>
              <div class="form-group">
                <label for="resume" class="field-label">Resume URL (Optional)</label>
                <input
                  id="resume"
                  type="url"
                  v-model="formData.resume"
                  placeholder="https://drive.google.com/..."
                  class="form-input"
                />
              </div>
            </div>

            <!-- File Upload Section -->
            <div class="form-row full-width">
              <div class="form-group file-upload-group">
                <label class="field-label">Upload Resume (PDF, DOC, DOCX) <span class="optional">(Optional)</span></label>
                <div class="file-upload-wrapper" :class="{ 'has-file': formData.resumeFile }">
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileUpload"
                    accept=".pdf,.doc,.docx"
                    class="file-input-hidden"
                  />
                  <div class="file-drop-zone" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
                    <div v-if="!formData.resumeFile" class="file-upload-placeholder">
                      <i class="fas fa-cloud-upload-alt"></i>
                      <p>Drag & drop resume file here</p>
                      <span>or click to browse from device</span>
                      <small>Supported formats: PDF, DOC, DOCX (Max 5MB)</small>
                    </div>
                    <div v-else class="file-upload-preview">
                      <i class="fas fa-file-pdf"></i>
                      <div class="file-info">
                        <span class="file-name">{{ formData.resumeFile.name }}</span>
                        <span class="file-size">{{ formatFileSize(formData.resumeFile.size) }}</span>
                      </div>
                      <button type="button" class="remove-file" @click.stop="removeFile">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <span v-if="errors.resume" class="error-message">{{ errors.resume }}</span>
              </div>
            </div>

            <!-- Email Notification Toggle Section -->
            <div class="form-row full-width">
              <div class="form-group email-notification-group">
                <div class="email-toggle-wrapper">
                  <label class="email-toggle-label">
                    <div class="toggle-switch">
                      <input 
                        type="checkbox" 
                        v-model="formData.sendEmail" 
                        id="sendEmailToggle"
                      />
                      <span class="toggle-slider"></span>
                    </div>
                    <div class="toggle-content">
                      <span class="toggle-title">
                        <i class="fas fa-envelope"></i>
                        Send Email Notification
                      </span>
                      <span class="toggle-subtitle">
                        {{ formData.sendEmail ? 'Candidate will receive an automated acknowledgement email' : 'Email notification disabled' }}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group full-width">
              <label for="message" class="field-label">Message / Interview Notes</label>
              <textarea
                id="message"
                v-model="formData.message"
                rows="3"
                placeholder="Enter any additional candidate notes or interview comments..."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeAddForm">
                Cancel
              </button>
              <button type="submit" class="btn-submit" :disabled="submitting">
                <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                <span v-else><i class="fas fa-save"></i> Save Candidate</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 🌟 Schedule Interview Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click="closeScheduleModal">
      <div class="modal-content schedule-modal" @click.stop>
        <div class="modal-decoration"></div>
        <div class="modal-header">
          <div class="modal-title">
            <div class="header-icon-circle">
              <i class="fas fa-calendar-plus"></i>
            </div>
            <div>
              <h2>Schedule Interview</h2>
              <p>Configure interview time and location/call link</p>
            </div>
          </div>
          <button class="modal-close" @click="closeScheduleModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="candidate-summary" v-if="selectedCandidate">
            <div class="summary-avatar">
              {{ getInitials(selectedCandidate.name) }}
            </div>
            <div class="summary-info">
              <h4>{{ selectedCandidate.name }}</h4>
              <p>{{ selectedCandidate.email }} • {{ selectedCandidate.phone }}</p>
              <span class="job-title-pill">{{ selectedCandidate.job_title }}</span>
            </div>
          </div>

          <form @submit.prevent="submitInterview" class="interview-form">
            <div class="form-group">
              <label for="interview_title" class="field-label">Interview Title <span class="required">*</span></label>
              <input
                id="interview_title"
                type="text"
                v-model="interviewData.title"
                required
                placeholder="e.g., Technical Interview Round 1"
                class="form-input"
                :class="{ 'error': errors.interview_title }"
              />
              <span v-if="errors.interview_title" class="error-message">{{ errors.interview_title }}</span>
            </div>

            <div class="form-group">
              <label for="interview_description" class="field-label">Description / Topics</label>
              <textarea
                id="interview_description"
                v-model="interviewData.description"
                rows="2"
                placeholder="Enter interview details, key topics to cover, etc."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="interview_date" class="field-label">Interview Date <span class="required">*</span></label>
                <input
                  id="interview_date"
                  type="date"
                  v-model="interviewData.date"
                  required
                  class="form-input"
                  :class="{ 'error': errors.interview_date }"
                  :min="todayDate"
                />
                <span v-if="errors.interview_date" class="error-message">{{ errors.interview_date }}</span>
              </div>
              <div class="form-group">
                <label for="interview_time" class="field-label">Interview Time <span class="required">*</span></label>
                <input
                  id="interview_time"
                  type="time"
                  v-model="interviewData.time"
                  required
                  class="form-input"
                  :class="{ 'error': errors.interview_time }"
                />
                <span v-if="errors.interview_time" class="error-message">{{ errors.interview_time }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="field-label">Interview Mode <span class="required">*</span></label>
              <div class="mode-selector">
                <div 
                  class="mode-option" 
                  :class="{ active: interviewData.mode === 'online' }"
                  @click="interviewData.mode = 'online'"
                >
                  <i class="fas fa-video"></i>
                  <span>Online Meeting</span>
                </div>
                <div 
                  class="mode-option" 
                  :class="{ active: interviewData.mode === 'in-person' }"
                  @click="interviewData.mode = 'in-person'"
                >
                  <i class="fas fa-building"></i>
                  <span>In-Person</span>
                </div>
                <div 
                  class="mode-option" 
                  :class="{ active: interviewData.mode === 'phone' }"
                  @click="interviewData.mode = 'phone'"
                >
                  <i class="fas fa-phone"></i>
                  <span>Phone Call</span>
                </div>
              </div>
              <span v-if="errors.interview_mode" class="error-message">{{ errors.interview_mode }}</span>
            </div>

            <div v-if="interviewData.mode === 'online'" class="form-group">
              <label for="video_link" class="field-label">Video Call Link <span class="required">*</span></label>
              <input
                id="video_link"
                type="url"
                v-model="interviewData.video_link"
                required
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                class="form-input"
                :class="{ 'error': errors.video_link }"
              />
              <span v-if="errors.video_link" class="error-message">{{ errors.video_link }}</span>
            </div>

            <div v-if="interviewData.mode === 'in-person'" class="form-group">
              <label for="location" class="field-label">Office Location <span class="required">*</span></label>
              <input
                id="location"
                type="text"
                v-model="interviewData.location"
                required
                placeholder="Enter office address / meeting room"
                class="form-input"
                :class="{ 'error': errors.location }"
              />
              <span v-if="errors.location" class="error-message">{{ errors.location }}</span>
            </div>

            <div class="form-group">
              <label for="interview_notes" class="field-label">Additional Instructions for Candidate</label>
              <textarea
                id="interview_notes"
                v-model="interviewData.notes"
                rows="2"
                placeholder="Bring portfolio, prepare presentation, etc..."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeScheduleModal">
                Cancel
              </button>
              <button type="submit" class="btn-submit" :disabled="submittingInterview">
                <i v-if="submittingInterview" class="fas fa-spinner fa-spin"></i>
                <span v-else><i class="fas fa-calendar-check"></i> Schedule Interview</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 🌟 View Interview Details Modal -->
    <div v-if="showInterviewDetails" class="modal-overlay" @click="closeInterviewDetails">
      <div class="modal-content interview-details-modal" @click.stop>
        <div class="modal-decoration"></div>
        <div class="modal-header">
          <div class="modal-title">
            <div class="header-icon-circle">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div>
              <h2>Interview Details</h2>
              <p>Scheduled session overview</p>
            </div>
          </div>
          <button class="modal-close" @click="closeInterviewDetails">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" v-if="selectedCandidate && selectedCandidate.interview">
          <div class="candidate-summary">
            <div class="summary-avatar">
              {{ getInitials(selectedCandidate.name) }}
            </div>
            <div class="summary-info">
              <h4>{{ selectedCandidate.name }}</h4>
              <p>{{ selectedCandidate.email }} • {{ selectedCandidate.phone }}</p>
              <span class="job-title-pill">{{ selectedCandidate.job_title }}</span>
            </div>
            <button
              v-if="selectedCandidate.resume"
              type="button"
              class="summary-resume-btn"
              @click.stop="viewCV(selectedCandidate)"
              title="Open resume in new tab"
            >
              <i class="fas fa-file-pdf"></i>
              <span>View Resume</span>
              <i class="fas fa-external-link-alt"></i>
            </button>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <i class="fas fa-tag"></i>
              <div>
                <label>Interview Title</label>
                <p>{{ selectedCandidate.interview.title }}</p>
              </div>
            </div>

            <div class="detail-item">
              <i class="fas fa-calendar-day"></i>
              <div>
                <label>Date & Time</label>
                <p>{{ formatFullDateTime(selectedCandidate.interview.date, selectedCandidate.interview.time) }}</p>
              </div>
            </div>

            <div class="detail-item">
              <i class="fas fa-video" v-if="selectedCandidate.interview.mode === 'online'"></i>
              <i class="fas fa-building" v-else-if="selectedCandidate.interview.mode === 'in-person'"></i>
              <i class="fas fa-phone" v-else></i>
              <div>
                <label>Mode</label>
                <p style="text-transform: capitalize;">{{ selectedCandidate.interview.mode }}</p>
              </div>
            </div>

            <div v-if="selectedCandidate.interview.video_link" class="detail-item full-width">
              <i class="fas fa-link"></i>
              <div>
                <label>Video Call Link</label>
                <p>
                  <a :href="selectedCandidate.interview.video_link" target="_blank" class="video-link">
                    {{ selectedCandidate.interview.video_link }}
                    <i class="fas fa-external-link-alt"></i>
                  </a>
                </p>
              </div>
            </div>

            <div v-if="selectedCandidate.interview.location" class="detail-item full-width">
              <i class="fas fa-map-marker-alt"></i>
              <div>
                <label>Location</label>
                <p>{{ selectedCandidate.interview.location }}</p>
              </div>
            </div>

            <div v-if="selectedCandidate.interview.description" class="detail-item full-width">
              <i class="fas fa-align-left"></i>
              <div>
                <label>Description</label>
                <p>{{ selectedCandidate.interview.description }}</p>
              </div>
            </div>

            <div v-if="selectedCandidate.interview.notes" class="detail-item full-width">
              <i class="fas fa-sticky-note"></i>
              <div>
                <label>Notes</label>
                <p>{{ selectedCandidate.interview.notes }}</p>
              </div>
            </div>
          </div>

          <div class="interview-actions">
            <button class="btn-edit-interview" @click="editInterview(selectedCandidate)">
              <i class="fas fa-edit"></i> Edit Interview
            </button>
            <button class="btn-cancel-interview" @click="cancelInterview(selectedCandidate)">
              <i class="fas fa-times"></i> Cancel Interview
            </button>
          </div>
        </div>
      </div>
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
  name: 'RecruitmentSection',
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loadingLeaves: false,
      candidates: [],
      viewMode: 'cards', // 'cards' | 'table'
      searchQuery: '',
      statusFilter: '',
      showAddForm: false,
      submitting: false,
      formData: {
        name: '',
        email: '',
        phone: '',
        job_title: '',
        status: 'Pending',
        resume: '',
        resumeFile: null,
        message: '',
        sendEmail: true
      },
      errors: {},
      
      // Interview scheduling data
      showScheduleModal: false,
      selectedCandidate: null,
      submittingInterview: false,
      interviewData: {
        title: '',
        description: '',
        date: '',
        time: '',
        mode: 'online',
        video_link: '',
        location: '',
        notes: ''
      },
      interviewErrors: {},
      
      // View interview details
      showInterviewDetails: false
    }
  },

  computed: {
    pendingCount() {
      return this.candidates.filter(c => c.status === 'Pending').length
    },
    followUpCount() {
      return this.candidates.filter(c => c.status === 'Follow Up').length
    },
    successfulCount() {
      return this.candidates.filter(c => c.status === 'Successful').length
    },
    rejectedCount() {
      return this.candidates.filter(c => c.status === 'Rejected').length
    },
    filteredCandidates() {
      let filtered = this.candidates;
      
      if (this.statusFilter) {
        filtered = filtered.filter(c => c.status === this.statusFilter);
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(c => 
          (c.name && c.name.toLowerCase().includes(query)) ||
          (c.email && c.email.toLowerCase().includes(query)) ||
          (c.phone && c.phone.includes(query)) ||
          (c.job_title && c.job_title.toLowerCase().includes(query)) ||
          (c.message && c.message.toLowerCase().includes(query))
        );
      }
      
      return filtered;
    },
    todayDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
  },

  methods: {
    getAvatarColorClass(val) {
      const str = String(val || 'cand');
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const classes = ['avatar-indigo', 'avatar-emerald', 'avatar-violet', 'avatar-amber', 'avatar-sky', 'avatar-rose'];
      return classes[Math.abs(hash) % classes.length];
    },
    getInitials(name) {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase()
      if (s === 'pending') return 'pending'
      if (s === 'follow up') return 'followup'
      if (s === 'successful') return 'successful'
      if (s === 'rejected') return 'rejected'
      return 'pending'
    },
    formatDate(dateStr) {
      if (!dateStr) return '—'
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    formatInterviewDate(dateStr) {
      if (!dateStr) return '';
      try {
        let date;
        if (dateStr.includes(' ')) {
          const parts = dateStr.split(' ');
          const dateParts = parts[0].split('-');
          date = new Date(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2])
          );
        } else {
          date = new Date(dateStr);
        }
        
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    },
    formatFullDateTime(dateStr, timeStr) {
      if (!dateStr) return 'Invalid Date';
      
      try {
        let date;
        if (timeStr) {
          const dateParts = dateStr.split('-');
          const timeParts = timeStr.split(':');
          date = new Date(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1])
          );
        } else if (dateStr.includes(' ')) {
          const parts = dateStr.split(' ');
          const dateParts = parts[0].split('-');
          const timeParts = parts[1].split(':');
          date = new Date(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1])
          );
        } else {
          date = new Date(dateStr);
        }
        
        if (isNaN(date.getTime())) {
          return 'Invalid Date';
        }
        
        return date.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    },
    getFileName(path) {
      if (!path) return ''
      return path.split('/').pop()
    },
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    getResumeUrl(candidateOrPath) {
      let candidate = null
      let path = ''

      if (candidateOrPath && typeof candidateOrPath === 'object') {
        candidate = candidateOrPath
        path = candidate.resume || ''
      } else if (typeof candidateOrPath === 'string') {
        path = candidateOrPath
        candidate = this.candidates.find(c => c.resume === path) || { resume: path }
      }

      const rawResume = String(path || (candidate && candidate.resume) || '').trim()
      if (!rawResume) return ''

      // If it's an external absolute URL (e.g. Google Drive, S3, external site)
      if (rawResume.startsWith('http://') || rawResume.startsWith('https://')) {
        return rawResume
      }

      // Clean relative path and extract file name
      const clean = rawResume.replace(/^\/+/, '')
      const fileName = clean.split('/').pop()

      // Primary streaming endpoint: Uses backend controller streaming in inline mode
      if (candidate && candidate.id) {
        return `https://employees.archenterprises.co.in/api/api/recruitment/${candidate.id}/resume`
      }

      // Fallback direct storage URL if candidate ID is not available
      if (clean.startsWith('resumes/')) {
        return `https://employees.archenterprises.co.in/backend/public/storage/${clean}`
      }

      return `https://employees.archenterprises.co.in/backend/public/storage/resumes/${fileName}`
    },

    async viewCV(candidateOrPath) {
      let candidate = null
      let path = ''

      if (candidateOrPath && typeof candidateOrPath === 'object') {
        candidate = candidateOrPath
        path = candidate.resume || ''
      } else if (typeof candidateOrPath === 'string') {
        path = candidateOrPath
        candidate = this.candidates.find(c => c.resume === path) || { resume: path }
      }

      const rawResume = String(path || (candidate && candidate.resume) || '').trim()

      if (!rawResume) {
        toastError('No resume document attached to this candidate')
        return
      }

      // Open new tab immediately on user click to prevent browser popup blockers from intercepting
      const newTab = window.open('about:blank', '_blank')
      if (newTab) {
        try {
          newTab.document.write(`
            <!DOCTYPE html>
            <html>
              <head><title>Opening Resume...</title></head>
              <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;">
                <div style="text-align:center;">
                  <div style="width:36px;height:36px;border:3px solid rgba(255,255,255,0.2);border-top-color:#38bdf8;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 14px;"></div>
                  <p style="margin:0;font-size:14px;font-weight:600;letter-spacing:0.3px;">Opening resume document...</p>
                </div>
                <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
              </body>
            </html>
          `)
          newTab.document.close()
        } catch (e) {
          // Ignore if document.write restricted
        }
      }

      // 1. If it's an external absolute URL (e.g. Google Drive, S3, external site)
      if (rawResume.startsWith('http://') || rawResume.startsWith('https://')) {
        if (newTab) {
          newTab.location.href = rawResume
        } else {
          window.open(rawResume, '_blank', 'noopener,noreferrer')
        }
        return
      }

      // Clean relative path and extract file name
      const clean = rawResume.replace(/^\/+/, '')
      const fileName = clean.split('/').pop()
      const token = localStorage.getItem('token')

      // Fallback public storage URL
      const storageUrl = clean.startsWith('resumes/')
        ? `https://employees.archenterprises.co.in/backend/public/storage/${clean}`
        : `https://employees.archenterprises.co.in/backend/public/storage/resumes/${fileName}`

      // Candidate file URLs to try with authentication
      const urlsToTry = []
      if (candidate && candidate.id) {
        urlsToTry.push(`https://employees.archenterprises.co.in/api/api/recruitment/${candidate.id}/resume`)
      }
      urlsToTry.push(storageUrl)
      if (clean) {
        urlsToTry.push(`https://employees.archenterprises.co.in/backend/public/storage/${clean}`)
      }

      let opened = false

      for (const targetUrl of urlsToTry) {
        try {
          const config = {
            responseType: 'blob',
            timeout: 6000
          }
          if (token && targetUrl.includes('/api/')) {
            config.headers = { Authorization: `Bearer ${token}` }
          }

          const response = await axios.get(targetUrl, config)
          const data = response.data

          if (data && data.size > 200 && data.type !== 'text/html') {
            const isPdf = data.type && data.type.includes('pdf')
            const pdfBlob = isPdf ? data : new Blob([data], { type: 'application/pdf' })
            const blobUrl = URL.createObjectURL(pdfBlob)

            if (newTab && !newTab.closed) {
              newTab.location.href = blobUrl
            } else {
              window.open(blobUrl, '_blank')
            }
            opened = true
            break
          }
        } catch (err) {
          // Continue to next candidate URL
        }
      }

      if (!opened) {
        // Fallback: Navigate new tab directly to candidate streaming endpoint or storage URL
        const fallbackTarget = (candidate && candidate.id)
          ? `https://employees.archenterprises.co.in/api/api/recruitment/${candidate.id}/resume`
          : storageUrl

        if (newTab && !newTab.closed) {
          newTab.location.href = fallbackTarget
        } else {
          window.open(fallbackTarget, '_blank', 'noopener,noreferrer')
        }
      }
    },
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status;
    },
    clearFilter() {
      this.statusFilter = '';
      this.searchQuery = '';
    },
    
    // Interview Methods
    openScheduleInterview(candidate) {
      this.selectedCandidate = candidate;
      this.interviewData = {
        title: `Interview - ${candidate.job_title || 'Position'}`,
        description: '',
        date: '',
        time: '',
        mode: 'online',
        video_link: '',
        location: '',
        notes: ''
      };
      this.interviewErrors = {};
      this.showScheduleModal = true;
    },
    closeScheduleModal() {
      this.showScheduleModal = false;
      this.selectedCandidate = null;
      this.submittingInterview = false;
      this.interviewErrors = {};
    },
    async submitInterview() {
      this.interviewErrors = {};
      let isValid = true;
      
      if (!this.interviewData.title.trim()) {
        this.interviewErrors.interview_title = 'Interview title is required';
        isValid = false;
      }
      
      if (!this.interviewData.date) {
        this.interviewErrors.interview_date = 'Interview date is required';
        isValid = false;
      }
      
      if (!this.interviewData.time) {
        this.interviewErrors.interview_time = 'Interview time is required';
        isValid = false;
      }
      
      if (!this.interviewData.mode) {
        this.interviewErrors.interview_mode = 'Interview mode is required';
        isValid = false;
      }
      
      if (this.interviewData.mode === 'online' && !this.interviewData.video_link.trim()) {
        this.interviewErrors.video_link = 'Video call link is required for online interviews';
        isValid = false;
      }
      
      if (this.interviewData.mode === 'in-person' && !this.interviewData.location.trim()) {
        this.interviewErrors.location = 'Location is required for in-person interviews';
        isValid = false;
      }
      
      if (!isValid) return;
      
      this.submittingInterview = true;
      
      try {
        const token = localStorage.getItem('token');
        
        const interviewPayload = {
          candidate_id: this.selectedCandidate.id,
          title: this.interviewData.title.trim(),
          description: this.interviewData.description.trim(),
          date: this.interviewData.date,
          time: this.interviewData.time,
          mode: this.interviewData.mode,
          video_link: this.interviewData.video_link.trim() || null,
          location: this.interviewData.location.trim() || null,
          notes: this.interviewData.notes.trim() || null
        };
        
        const response = await axios.post(
          'https://employees.archenterprises.co.in/api/api/interviews',
          interviewPayload,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        
        toastSuccess('Interview scheduled successfully!');
        
        const updatedCandidate = {
          ...this.selectedCandidate,
          interview: response.data.data
        };
        
        const index = this.candidates.findIndex(c => c.id === this.selectedCandidate.id);
        if (index !== -1) {
          this.candidates[index] = updatedCandidate;
        }
        
        if (this.selectedCandidate.status === 'Pending') {
          updatedCandidate.status = 'Follow Up';
          await this.updateStatus(updatedCandidate);
        }
        
        this.closeScheduleModal();
        
      } catch (error) {
        console.error('Error scheduling interview:', error);
        if (error.response) {
          const errorMessage = error.response.data.message || 'Failed to schedule interview';
          if (error.response.status === 422) {
            const errors = error.response.data.errors;
            if (errors) {
              Object.keys(errors).forEach(key => {
                if (this.interviewErrors.hasOwnProperty(key)) {
                  this.interviewErrors[key] = errors[key][0];
                } else {
                  toastError(errors[key][0]);
                }
              });
            }
          } else {
            toastError(errorMessage);
          }
        } else {
          toastError('Failed to schedule interview. Please try again.');
        }
      } finally {
        this.submittingInterview = false;
      }
    },
    viewInterviewDetails(candidate) {
      this.selectedCandidate = candidate;
      this.showInterviewDetails = true;
    },
    closeInterviewDetails() {
      this.showInterviewDetails = false;
      this.selectedCandidate = null;
    },
    editInterview(candidate) {
      this.closeInterviewDetails();
      if (candidate.interview) {
        this.interviewData = {
          title: candidate.interview.title || '',
          description: candidate.interview.description || '',
          date: candidate.interview.date || '',
          time: candidate.interview.time || '',
          mode: candidate.interview.mode || 'online',
          video_link: candidate.interview.video_link || '',
          location: candidate.interview.location || '',
          notes: candidate.interview.notes || ''
        };
        delete candidate.interview;
        this.openScheduleInterview(candidate);
      }
    },
    async cancelInterview(candidate) {
      if (!confirm(`Are you sure you want to cancel the interview for ${candidate.name}?`)) {
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(
          `https://employees.archenterprises.co.in/api/api/interviews/${candidate.interview.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toastSuccess('Interview cancelled successfully');
        delete candidate.interview;
        
        this.closeInterviewDetails();
        
      } catch (error) {
        console.error('Error cancelling interview:', error);
        toastError('Failed to cancel interview');
      }
    },
    
    // Existing methods
    openAddForm() {
      this.showAddForm = true;
      this.resetForm();
      this.errors = {};
    },
    closeAddForm() {
      this.showAddForm = false;
      this.submitting = false;
      this.errors = {};
    },
    resetForm() {
      this.formData = {
        name: '',
        email: '',
        phone: '',
        job_title: '',
        status: 'Pending',
        resume: '',
        resumeFile: null,
        message: '',
        sendEmail: true
      };
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      this.validateAndSetFile(file);
    },
    handleDrop(event) {
      const file = event.dataTransfer.files[0];
      this.validateAndSetFile(file);
    },
    validateAndSetFile(file) {
      if (!file) return;
      
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toastError('Please upload a PDF, DOC, or DOCX file');
        this.$refs.fileInput.value = '';
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toastError('File size must be less than 5MB');
        this.$refs.fileInput.value = '';
        return;
      }
      
      this.formData.resumeFile = file;
      this.errors.resume = '';
    },
    removeFile() {
      this.formData.resumeFile = null;
      this.$refs.fileInput.value = '';
    },
    validateForm() {
      this.errors = {};
      let isValid = true;
      
      if (!this.formData.name.trim()) {
        this.errors.name = 'Name is required';
        isValid = false;
      }
      
      if (!this.formData.email.trim()) {
        this.errors.email = 'Email is required';
        isValid = false;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.formData.email)) {
          this.errors.email = 'Please enter a valid email address';
          isValid = false;
        }
      }
      
      if (!this.formData.phone.trim()) {
        this.errors.phone = 'Phone number is required';
        isValid = false;
      } else if (this.formData.phone.replace(/\D/g, '').length < 10) {
        this.errors.phone = 'Please enter a valid phone number (minimum 10 digits)';
        isValid = false;
      }
      
      if (!this.formData.job_title.trim()) {
        this.errors.job_title = 'Job title is required';
        isValid = false;
      }
      
      return isValid;
    },
    async submitCandidate() {
      if (!this.validateForm()) return;
      
      this.submitting = true;
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', this.formData.name.trim());
        formData.append('email', this.formData.email.trim());
        formData.append('phone', this.formData.phone.trim());
        formData.append('job_title', this.formData.job_title.trim());
        formData.append('status', this.formData.status);
        formData.append('message', this.formData.message.trim() || '');
        formData.append('send_email', this.formData.sendEmail ? '1' : '0');
        
        if (this.formData.resumeFile) {
          formData.append('resume', this.formData.resumeFile);
        }
        
        if (this.formData.resume.trim() && !this.formData.resumeFile) {
          formData.append('resume_url', this.formData.resume.trim());
        }
        
        const response = await axios.post(
          'https://employees.archenterprises.co.in/api/api/recruitment',
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        toastSuccess(this.formData.sendEmail ? 'Candidate added & email sent successfully!' : 'Candidate added successfully!');
        
        const newCandidate = {
          ...response.data.data,
          expanded: false
        };
        this.candidates.unshift(newCandidate);
        
        this.closeAddForm();
        this.resetForm();
        this.errors = {};
        
      } catch (error) {
        console.error('Error adding candidate:', error);
        if (error.response) {
          const errorMessage = error.response.data.message || 'Failed to add candidate';
          toastError(errorMessage);
        } else {
          toastError('Failed to add candidate. Please try again.');
        }
      } finally {
        this.submitting = false;
      }
    },
    async updateStatus(candidate) {
      const prevStatus = candidate._prevStatus || candidate.status;
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const payload = { status: candidate.status };

        // The Laravel API expects PATCH /recruitment/{id}/status
        try {
          await axios.patch(
            `https://employees.archenterprises.co.in/api/api/recruitment/${candidate.id}/status`,
            payload,
            config
          );
        } catch (patchErr) {
          // Robust fallback for PUT /recruitment/{id}/status or PUT /recruitment/{id}
          try {
            await axios.put(
              `https://employees.archenterprises.co.in/api/api/recruitment/${candidate.id}/status`,
              payload,
              config
            );
          } catch (putErr) {
            await axios.put(
              `https://employees.archenterprises.co.in/api/api/recruitment/${candidate.id}`,
              payload,
              config
            );
          }
        }
        candidate._prevStatus = candidate.status;
        toastSuccess(`Status updated to ${candidate.status}`);
      } catch (error) {
        console.error('Error updating status:', error);
        candidate.status = prevStatus;
        const msg = (error.response && error.response.data && error.response.data.message) || 'Failed to update status';
        toastError(msg);
      }
    },
    async deleteCandidate(candidate) {
      if (!confirm(`Are you sure you want to delete candidate ${candidate.name}?`)) return
      
      try {
        const token = localStorage.getItem('token')
        await axios.delete(
          `https://employees.archenterprises.co.in/api/api/recruitment/${candidate.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toastSuccess('Candidate deleted successfully')
        this.candidates = this.candidates.filter(c => c.id !== candidate.id)
      } catch (error) {
        console.error('Error deleting candidate:', error)
        toastError('Failed to delete candidate')
      }
    },
    async fetchCandidates() {
      this.loadingLeaves = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/recruitment', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.candidates = (response.data.data || []).map(c => ({
          ...c,
          _prevStatus: c.status,
          expanded: false
        }))
      } catch (error) {
        console.error('Error fetching candidates:', error)
        toastError('Failed to load candidates')
      } finally {
        this.loadingLeaves = false
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
    this.fetchCandidates()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ================= 🏢 MODERN ENTERPRISE DESIGN SYSTEM ================= */
.layout {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px 24px;
  min-height: 100vh;
  box-sizing: border-box;
}

.content {
  flex: 1;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 15px -5px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  transition: all 0.3s ease;
}

.expanded-content {
  margin-left: 0 !important;
  width: 100% !important;
}

/* ================= 📱 MOBILE HEADER ================= */
.mobile-header {
  display: none;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.mobile-title-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
}

.btn-mobile-menu {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}

/* ================= 🏢 MODERN TOP ENTERPRISE BANNER ================= */
.recruitment-top-banner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.banner-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.banner-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid #e0e7ff;
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4f46e5;
  box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  animation: pulseDot 2s infinite;
}

@keyframes pulseDot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
}

.status-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.status-meta-pill.warning {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.status-meta-pill.info {
  background: #f0f9ff;
  color: #0369a1;
  border-color: #bae6fd;
}

.status-meta-pill.success {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0 0;
  letter-spacing: -0.4px;
}

.page-subtitle {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
  max-width: 680px;
  line-height: 1.45;
}

.banner-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.add-candidate-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.add-candidate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
}

/* ================= 📊 STATUS FILTER METRIC CARDS STRIP ================= */
.summary-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.summary-pill {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.summary-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.summary-pill.active {
  background: #f8fafc;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15), 0 4px 12px rgba(79, 70, 229, 0.08);
}

.pill-icon-halo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.pill-icon-halo.all { background: #f1f5f9; color: #475569; }
.pill-icon-halo.pending { background: #fef3c7; color: #d97706; }
.pill-icon-halo.followup { background: #e0f2fe; color: #0284c7; }
.pill-icon-halo.successful { background: #ecfdf5; color: #059669; }
.pill-icon-halo.rejected { background: #fee2e2; color: #dc2626; }

.pill-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.pill-label {
  font-size: 11.5px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.pill-value {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.text-pending { color: #d97706; }
.text-followup { color: #0284c7; }
.text-successful { color: #059669; }
.text-rejected { color: #dc2626; }

.active-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4f46e5;
}

/* ================= 🔍 RECRUITMENT TOOLBAR ================= */
.recruitment-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 260px;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13.5px;
}

.search-input {
  width: 100%;
  padding: 9px 36px 9px 38px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 9px;
}

.clear-search:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.active-filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.active-filter-badge:hover {
  background: #dbeafe;
}

.results-count-pill {
  font-size: 12.5px;
  color: #64748b;
  font-weight: 500;
}

.results-count-pill strong {
  color: #0f172a;
}

.view-mode-toggle {
  display: inline-flex;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.view-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle-btn.active {
  background: #4f46e5;
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);
}

.view-toggle-btn:hover:not(.active) {
  background: #f1f5f9;
  color: #1e293b;
}

/* ================= ⏳ MODERN DIRECTORY LOADING CARD ================= */
.modern-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.loading-ring-wrap {
  position: relative;
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.loading-ring {
  position: absolute;
  inset: 0;
  border: 3px solid #f1f5f9;
  border-top-color: #4f46e5;
  border-right-color: #818cf8;
  border-radius: 50%;
  animation: loadingRingSpin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
}

@keyframes loadingRingSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-icon {
  font-size: 22px;
  color: #4f46e5;
  animation: loadingIconPulse 1.8s ease-in-out infinite;
}

@keyframes loadingIconPulse {
  0%, 100% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
}

.loading-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.loading-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 18px;
}

.loading-progress-bar {
  width: 220px;
  height: 4px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.progress-indeterminate {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%);
  border-radius: 999px;
  animation: indeterminateSlide 1.5s ease-in-out infinite;
}

@keyframes indeterminateSlide {
  0% { left: -40%; width: 30%; }
  50% { left: 40%; width: 50%; }
  100% { left: 100%; width: 30%; }
}

/* ================= 👥 EMPTY STATE ================= */
.empty-state-card {
  padding: 56px 24px;
  text-align: center;
  background: #f8fafc;
  border-radius: 18px;
  border: 1px dashed #cbd5e1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-halo {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 14px;
}

.empty-title {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: #64748b;
  max-width: 460px;
  margin: 0 0 18px;
  line-height: 1.45;
}

.empty-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-reset-filters {
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.btn-reset-filters:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* ================= 👥 CANDIDATES GRID (CARDS VIEW) ================= */
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.candidate-card-modern {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.candidate-card-modern:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03);
  border-color: #cbd5e1;
}

.card-accent {
  height: 4px;
  width: 100%;
}

.card-accent.pending { background: #f59e0b; }
.card-accent.followup { background: #0284c7; }
.card-accent.successful { background: #10b981; }
.card-accent.rejected { background: #ef4444; }

.card-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 20px 14px;
  gap: 12px;
}

.candidate-profile-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.candidate-avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

/* Dynamic avatar colors */
.avatar-indigo { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); }
.avatar-emerald { background: linear-gradient(135deg, #10b981 0%, #047857 100%); }
.avatar-violet { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); }
.avatar-amber { background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); }
.avatar-sky { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); }
.avatar-rose { background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%); }

.candidate-name-box {
  min-width: 0;
  flex: 1;
}

.candidate-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.job-role-badge i {
  color: #64748b;
  font-size: 10px;
}

.status-dropdown-wrap {
  flex-shrink: 0;
}

.status-select-pill {
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.15s ease;
}

.status-select-pill.pending { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.status-select-pill.followup { background: #f0f9ff; color: #0284c7; border-color: #bae6fd; }
.status-select-pill.successful { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
.status-select-pill.rejected { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

.status-select-pill.sm {
  padding: 4px 8px;
  font-size: 11px;
}

/* Card Body */
.card-body-modern {
  padding: 0 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.contact-details-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #334155;
  font-size: 12.5px;
  font-weight: 500;
  transition: color 0.15s ease;
}

.contact-item:not(.static):hover {
  color: #4f46e5;
}

.contact-icon {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 11px;
  flex-shrink: 0;
}

.contact-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-item.static {
  color: #64748b;
  font-size: 11.5px;
}

/* Resume Chip */
.resume-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.resume-chip:hover {
  background: #ffe4e6;
  border-color: #fda4af;
  transform: translateY(-1px);
}

.resume-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #ffffff;
  color: #e11d48;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}

.resume-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.resume-label {
  font-size: 10px;
  font-weight: 700;
  color: #9f1239;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.resume-name {
  font-size: 12px;
  font-weight: 600;
  color: #be123c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resume-arrow {
  color: #e11d48;
  font-size: 11px;
}

/* Interview Badge Box */
.interview-badge-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
}

.interview-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.interview-icon-circle {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #dcfce7;
  color: #15803d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.interview-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  color: #166534;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.interview-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #14532d;
}

.interview-time i {
  font-size: 10px;
}

.btn-view-interview {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  background: #ffffff;
  border: 1px solid #86efac;
  border-radius: 6px;
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.btn-view-interview:hover {
  background: #dcfce7;
}

/* Notes / Message */
.candidate-notes-box {
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.notes-content {
  font-size: 12px;
  color: #334155;
  line-height: 1.45;
  margin: 0;
}

.notes-content.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-show-notes {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 0 0;
}

/* Card Footer */
.card-footer-modern {
  padding: 12px 18px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-schedule-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #ffffff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-schedule-action:hover {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
}

.btn-schedule-action.has-interview {
  color: #047857;
  border-color: #a7f3d0;
}

.btn-schedule-action.has-interview:hover {
  background: #059669;
  color: #ffffff;
  border-color: #059669;
}

.card-footer-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-icon-cv {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #fecdd3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.btn-icon-cv:hover {
  background: #e11d48;
  color: #ffffff;
}

.btn-icon-delete {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #ffffff;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.btn-icon-delete:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* ================= 👥 DATA TABLE VIEW ================= */
.candidates-table-container {
  display: flex;
  flex-direction: column;
}

.table-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.enterprise-candidates-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  text-align: left;
}

.enterprise-candidates-table th {
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.enterprise-candidates-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
}

.table-row-hover:hover {
  background: #f8fafc;
}

.table-candidate-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}

.table-candidate-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.table-candidate-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
}

.table-applied-date {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}

.table-role-badge {
  display: inline-block;
  padding: 3px 8px;
  background: #f1f5f9;
  color: #334155;
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.table-contact-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.table-contact-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
}

.table-contact-line:hover {
  color: #4f46e5;
}

.table-contact-line i {
  color: #94a3b8;
  font-size: 10px;
  width: 14px;
}

.table-resume-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #fecdd3;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.table-resume-btn:hover {
  background: #e11d48;
  color: #ffffff;
}

.text-muted-dash {
  color: #94a3b8;
  font-size: 13px;
}

.table-interview-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: #065f46;
  cursor: pointer;
  transition: all 0.15s ease;
}

.table-interview-chip:hover {
  background: #d1fae5;
}

.table-no-interview {
  font-size: 11.5px;
  color: #94a3b8;
  font-style: italic;
}

.text-right {
  text-align: right;
}

.table-actions-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.action-btn-sm {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.action-btn-sm.primary {
  color: #4f46e5;
  border-color: #c7d2fe;
}

.action-btn-sm.primary:hover {
  background: #4f46e5;
  color: #ffffff;
}

.action-btn-sm.info {
  color: #0284c7;
  border-color: #bae6fd;
}

.action-btn-sm.info:hover {
  background: #0284c7;
  color: #ffffff;
}

.action-btn-sm.danger {
  color: #94a3b8;
}

.action-btn-sm.danger:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* ================= 🌿 MODAL STYLES ================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  position: relative;
  background: #ffffff;
  border-radius: 22px;
  width: 100%;
  max-width: 620px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  animation: modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleIn {
  from { opacity: 0; transform: scale(0.96) translateY(-8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-decoration {
  height: 4px;
  background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 50%, #10b981 100%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 3px 8px rgba(79, 70, 229, 0.25);
}

.modal-title h2 {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.modal-title p {
  font-size: 12px;
  color: #64748b;
  margin: 1px 0 0;
}

.modal-close {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.modal-close:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.modal-body {
  padding: 22px 24px;
  overflow-y: auto;
}

/* Forms */
.candidate-form,
.interview-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-row.full-width {
  grid-template-columns: 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 5px;
}

.required {
  color: #ef4444;
}

.optional {
  font-weight: 400;
  color: #94a3b8;
  font-size: 11px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.form-input.error {
  border-color: #ef4444;
  background: #fff5f5;
}

.error-message {
  color: #ef4444;
  font-size: 11px;
  margin-top: 3px;
  font-weight: 600;
}

/* File Drop Zone */
.file-drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-drop-zone:hover {
  border-color: #4f46e5;
  background: #eef2ff;
}

.file-upload-placeholder i {
  font-size: 26px;
  color: #4f46e5;
  margin-bottom: 4px;
}

.file-upload-placeholder p {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.file-upload-placeholder span {
  font-size: 11.5px;
  color: #64748b;
}

.file-upload-placeholder small {
  display: block;
  font-size: 10.5px;
  color: #94a3b8;
  margin-top: 3px;
}

.file-upload-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.file-upload-preview i {
  font-size: 26px;
  color: #e11d48;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  display: block;
}

.file-size {
  font-size: 11px;
  color: #64748b;
}

.remove-file {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.file-input-hidden {
  display: none;
}

/* Email Toggle */
.email-toggle-wrapper {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
}

.email-toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #4f46e5;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(18px);
}

.toggle-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-subtitle {
  font-size: 11px;
  color: #64748b;
  display: block;
}

/* Mode selector */
.mode-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mode-option {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  transition: all 0.15s ease;
}

.mode-option i {
  font-size: 16px;
}

.mode-option.active {
  background: #eef2ff;
  border-color: #4f46e5;
  color: #4338ca;
}

/* Candidate summary box in schedule modal */
.candidate-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin-bottom: 16px;
}

.summary-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
}

.summary-info h4 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.summary-info p {
  font-size: 11.5px;
  color: #64748b;
  margin: 2px 0 4px;
}

.job-title-pill {
  font-size: 11px;
  font-weight: 700;
  color: #4338ca;
  background: #eef2ff;
  padding: 1px 8px;
  border-radius: 6px;
}

/* Details grid */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 18px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item i {
  color: #4f46e5;
  font-size: 13px;
  margin-top: 2px;
}

.detail-item label {
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  display: block;
}

.detail-item p {
  font-size: 12.5px;
  color: #0f172a;
  font-weight: 600;
  margin: 2px 0 0;
}

.video-link {
  color: #0284c7;
  text-decoration: none;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* Interview Actions */
.interview-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-edit-interview {
  padding: 9px 16px;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-cancel-interview {
  padding: 9px 16px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.btn-submit {
  padding: 10px 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  transition: all 0.15s ease;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 10px 16px;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* ================= 📄 RESUME ACTION BUTTONS ================= */
.resume-ext-icon {
  font-size: 10px;
  margin-left: 2px;
  opacity: 0.85;
}

.summary-resume-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #fecdd3;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-left: auto;
}

.summary-resume-btn:hover {
  background: #e11d48;
  color: #ffffff;
  border-color: #e11d48;
}

/* ================= 📱 MEDIA QUERIES ================= */
@media (max-width: 1200px) {
  .summary-strip {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .candidates-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .recruitment-top-banner {
    display: none;
  }

  .main-content {
    padding: 12px;
  }

  .content {
    padding: 16px;
    border-radius: 16px;
  }

  .summary-strip {
    grid-template-columns: repeat(2, 1fr);
  }

  .recruitment-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input-wrapper {
    max-width: 100%;
  }

  .toolbar-right {
    justify-content: space-between;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .summary-strip {
    grid-template-columns: 1fr;
  }
  
  .view-btn-text {
    display: none;
  }
}
</style>