<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- 📱 Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-user-plus"></i>
            <span>Recruitment</span>
          </div>
          <button class="mobile-add-btn" @click="openAddForm">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- 🏢 Desktop Header Banner -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <div>
              <h1 class="page-title">Recruitment & Candidates</h1>
              <p class="subtitle-modern">Manage candidate applications, hiring pipelines, and interviews</p>
            </div>
          </div>
          <div class="header-actions">
            <div class="stats-badge-header">
              <i class="fas fa-users"></i>
              <span>{{ candidates.length }} Candidates</span>
            </div>
            <button class="add-candidate-btn" @click="openAddForm">
              <i class="fas fa-plus"></i>
              <span>Add Candidate</span>
            </button>
          </div>
        </div>

        <!-- 📊 Status Filter Stats Bar -->
        <div class="stats-bar">
          <div 
            class="stat-card pending" 
            :class="{ active: statusFilter === 'Pending' }"
            @click="filterByStatus('Pending')"
          >
            <div class="stat-icon-wrap amber">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
            <span class="filter-pill" v-if="statusFilter === 'Pending'">Active</span>
          </div>

          <div 
            class="stat-card followup" 
            :class="{ active: statusFilter === 'Follow Up' }"
            @click="filterByStatus('Follow Up')"
          >
            <div class="stat-icon-wrap sky">
              <i class="fas fa-phone-alt"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ followUpCount }}</span>
              <span class="stat-label">Follow Up</span>
            </div>
            <span class="filter-pill" v-if="statusFilter === 'Follow Up'">Active</span>
          </div>

          <div 
            class="stat-card successful" 
            :class="{ active: statusFilter === 'Successful' }"
            @click="filterByStatus('Successful')"
          >
            <div class="stat-icon-wrap emerald">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ successfulCount }}</span>
              <span class="stat-label">Successful</span>
            </div>
            <span class="filter-pill" v-if="statusFilter === 'Successful'">Active</span>
          </div>

          <div 
            class="stat-card rejected" 
            :class="{ active: statusFilter === 'Rejected' }"
            @click="filterByStatus('Rejected')"
          >
            <div class="stat-icon-wrap rose">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ rejectedCount }}</span>
              <span class="stat-label">Rejected</span>
            </div>
            <span class="filter-pill" v-if="statusFilter === 'Rejected'">Active</span>
          </div>

          <div 
            class="stat-card all" 
            :class="{ active: !statusFilter }"
            @click="clearFilter"
          >
            <div class="stat-icon-wrap slate">
              <i class="fas fa-th-list"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ candidates.length }}</span>
              <span class="stat-label">All</span>
            </div>
            <span class="filter-pill" v-if="!statusFilter">All</span>
          </div>
        </div>

        <!-- 🔍 Search Bar Container -->
        <div class="search-bar-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search candidates by name, email, phone, or job title..."
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="search-counter-badge">
            <span>Showing <strong>{{ filteredCandidates.length }}</strong> of {{ candidates.length }} Applications</span>
          </div>
        </div>

        <!-- ⏳ Loading Spinner -->
        <div v-if="loadingLeaves" class="loading-container">
          <div class="spinner"></div>
          <p>Loading candidate profiles...</p>
        </div>

        <!-- 👥 Candidate Cards Grid -->
        <div v-else class="candidates-grid">
          <div v-for="candidate in filteredCandidates" :key="candidate.id" class="candidate-card-premium">
            <div class="card-accent" :class="getStatusClass(candidate.status)"></div>
            
            <!-- Card Header -->
            <div class="card-header-premium">
              <div class="candidate-info">
                <div class="candidate-avatar">
                  {{ getInitials(candidate.name) }}
                </div>
                <div class="candidate-text">
                  <h3 class="candidate-name">{{ candidate.name }}</h3>
                  <span class="job-title-badge">{{ candidate.job_title }}</span>
                </div>
              </div>
              <select
                class="status-select-premium"
                :class="getStatusClass(candidate.status)"
                v-model="candidate.status"
                @change="updateStatus(candidate)"
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Follow Up">📞 Follow Up</option>
                <option value="Successful">✅ Successful</option>
                <option value="Rejected">❌ Rejected</option>
              </select>
            </div>

            <!-- Card Body -->
            <div class="card-body-premium">
              <div class="info-row">
                <div class="info-icon-box">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="info-details">
                  <span class="info-label">Email</span>
                  <p class="info-value">{{ candidate.email }}</p>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon-box">
                  <i class="fas fa-phone-alt"></i>
                </div>
                <div class="info-details">
                  <span class="info-label">Phone</span>
                  <p class="info-value">{{ candidate.phone }}</p>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon-box">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="info-details">
                  <span class="info-label">Applied On</span>
                  <p class="info-value">{{ formatDate(candidate.created_at) }}</p>
                </div>
              </div>

              <div class="info-row message-row">
                <div class="info-icon-box">
                  <i class="fas fa-comment"></i>
                </div>
                <div class="info-details">
                  <span class="info-label">Message / Notes</span>
                  <p :class="{ collapsed: !candidate.expanded }" class="message-text">
                    {{ candidate.message || 'No message provided' }}
                  </p>
                  <button
                    v-if="candidate.message && candidate.message.length > 120"
                    class="show-more-btn-premium"
                    @click="candidate.expanded = !candidate.expanded"
                  >
                    <i :class="candidate.expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    {{ candidate.expanded ? 'Show less' : 'Show more' }}
                  </button>
                </div>
              </div>

              <!-- Resume File Info -->
              <div v-if="candidate.resume" class="info-row resume-info">
                <div class="info-icon-box file-box">
                  <i class="fas fa-file-pdf"></i>
                </div>
                <div class="info-details">
                  <span class="info-label">Attached Resume</span>
                  <p class="resume-filename">
                    {{ getFileName(candidate.resume) }}
                  </p>
                </div>
              </div>

              <!-- Interview Info -->
              <div v-if="candidate.interview" class="info-row interview-info">
                <div class="info-icon-box interview-box">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="info-details">
                  <span class="info-label">Scheduled Interview</span>
                  <p class="interview-details">
                    <span class="interview-status scheduled">
                      <i class="fas fa-clock"></i> {{ formatInterviewDate(candidate.interview.date) }}
                    </span>
                  </p>
                  <button 
                    class="view-interview-btn"
                    @click="viewInterviewDetails(candidate)"
                  >
                    <i class="fas fa-eye"></i> View Details
                  </button>
                </div>
              </div>
            </div>

            <!-- Card Footer Action Buttons -->
            <div class="card-footer-premium">
              <button
                class="schedule-interview-btn"
                @click="openScheduleInterview(candidate)"
              >
                <i class="fas fa-calendar-plus"></i> Schedule Interview
              </button>
              <button
                v-if="candidate.resume"
                class="view-cv-btn-premium"
                @click="viewCV(candidate.resume)"
                title="View Resume PDF"
              >
                <i class="fas fa-file-pdf"></i>
              </button>
              <button
                class="delete-candidate-btn"
                @click="deleteCandidate(candidate)"
                title="Delete candidate profile"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredCandidates.length === 0" class="empty-state-premium">
            <div class="empty-icon-circle">
              <i class="fas fa-users-slash"></i>
            </div>
            <h4>{{ searchQuery || statusFilter ? 'No Matching Candidates Found' : 'No Candidate Applications Yet' }}</h4>
            <p>{{ searchQuery || statusFilter ? 'Try clearing your search or status filter' : 'Applications from candidates will appear here automatically' }}</p>
            <button class="add-candidate-btn inline-btn" @click="openAddForm">
              <i class="fas fa-plus"></i>
              <span>Add First Candidate</span>
            </button>
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
    viewCV(path) {
      const RESUME_BASE_URL = 'https://it.archenterprises.co.in'
      window.open(`${RESUME_BASE_URL}/${path}`, '_blank')
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
      try {
        const token = localStorage.getItem('token')
        await axios.put(
          `https://employees.archenterprises.co.in/api/api/recruitment/${candidate.id}`,
          { status: candidate.status },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toastSuccess(`Status updated to ${candidate.status}`)
      } catch (error) {
        console.error('Error updating status:', error)
        toastError('Failed to update status')
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

/* 🌿 Root & Variables - Emerald Mint Theme */
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

/* 📱 Mobile Header */
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
  font-size: 18px;
  font-weight: 700;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
}

.mobile-title i {
  color: #2cb67d;
}

.mobile-add-btn {
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: white;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(44, 182, 125, 0.3);
}

/* 🏢 Desktop Header Banner */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

.page-title {
  font-size: 22px;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #dff0e7;
  font-weight: 700;
  font-size: 13px;
  color: #0f2e22;
  box-shadow: 0 2px 8px rgba(44, 182, 125, 0.04);
}

.stats-badge-header i {
  color: #2cb67d;
}

.add-candidate-btn {
  padding: 12px 22px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s ease;
  box-shadow: 0 6px 18px rgba(44, 182, 125, 0.3);
}

.add-candidate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(44, 182, 125, 0.4);
}

/* 📊 Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #dff0e7;
  box-shadow: 0 4px 16px rgba(44, 182, 125, 0.04);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(44, 182, 125, 0.1);
}

.stat-card.active {
  border-color: #2cb67d;
  background: #f7fcf9;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.16);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.stat-icon-wrap.amber { background: #fef3c7; color: #d97706; }
.stat-icon-wrap.sky { background: #e0f2fe; color: #0284c7; }
.stat-icon-wrap.emerald { background: #eaf7f1; color: #16935b; }
.stat-icon-wrap.rose { background: #fee2e2; color: #ef4444; }
.stat-icon-wrap.slate { background: #f1f5f9; color: #475569; }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
  line-height: 1.1;
  display: block;
}

.stat-label {
  font-size: 12px;
  color: #6b8f81;
  font-weight: 600;
  margin-top: 3px;
  display: block;
}

.filter-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  background: #2cb67d;
  color: #ffffff;
  border-radius: 999px;
  position: absolute;
  top: 10px;
  right: 12px;
}

/* 🔍 Search Bar */
.search-bar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 540px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #2cb67d;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 44px;
  background: #ffffff;
  border: 1px solid #dff0e7;
  border-radius: 14px;
  font-size: 13.5px;
  color: #0f2e22;
  font-weight: 500;
  outline: none;
  box-shadow: 0 2px 10px rgba(44, 182, 125, 0.04);
  transition: all 0.25s ease;
}

.search-input:focus {
  border-color: #2cb67d;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.16);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  font-size: 10px;
}

.search-counter-badge {
  font-size: 13px;
  color: #6b8f81;
  font-weight: 500;
}

.search-counter-badge strong {
  color: #16935b;
}

/* ⏳ Loading Spinner */
.loading-container {
  padding: 60px 20px;
  text-align: center;
  color: #6b8f81;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #e0f0e8;
  border-top-color: #2cb67d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 👥 Candidates Grid */
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.candidate-card-premium {
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #dff0e7;
  box-shadow: 0 6px 20px rgba(44, 182, 125, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.25s ease;
}

.candidate-card-premium:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(44, 182, 125, 0.1);
  border-color: #cbe9dc;
}

.card-accent {
  height: 4px;
  width: 100%;
}

.card-accent.pending { background: #f59e0b; }
.card-accent.followup { background: #0284c7; }
.card-accent.successful { background: #10b981; }
.card-accent.rejected { background: #ef4444; }

.card-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 20px 14px;
  gap: 12px;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.candidate-avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(44, 182, 125, 0.25);
  flex-shrink: 0;
}

.candidate-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0 0 3px;
}

.job-title-badge {
  font-size: 11.5px;
  font-weight: 700;
  color: #16935b;
  background: #eaf7f1;
  padding: 2px 9px;
  border-radius: 6px;
  display: inline-block;
}

.status-select-premium {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  background: #f8fafc;
  color: #0f2e22;
  transition: all 0.2s ease;
}

.status-select-premium.pending { background: #fef3c7; color: #d97706; border-color: #fde68a; }
.status-select-premium.followup { background: #e0f2fe; color: #0284c7; border-color: #bae6fd; }
.status-select-premium.successful { background: #eaf7f1; color: #16935b; border-color: #bbf7d0; }
.status-select-premium.rejected { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

/* Card Body */
.card-body-premium {
  padding: 0 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #f4fbf7;
  color: #2cb67d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}

.info-icon-box.file-box { background: #fee2e2; color: #ef4444; }
.info-icon-box.interview-box { background: #e0f2fe; color: #0284c7; }

.info-details {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 11px;
  font-weight: 700;
  color: #7d9e92;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  display: block;
}

.info-value {
  font-size: 13px;
  color: #0f2e22;
  font-weight: 600;
  margin: 1px 0 0;
  word-break: break-all;
}

.message-text {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.4;
  margin: 2px 0 0;
}

.message-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.show-more-btn-premium {
  background: none;
  border: none;
  color: #2cb67d;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.resume-filename {
  font-size: 12.5px;
  font-weight: 600;
  color: #ef4444;
  margin: 1px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.interview-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #0284c7;
  background: #e0f2fe;
  padding: 2px 10px;
  border-radius: 999px;
  margin-top: 2px;
}

.view-interview-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #0284c7;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
}

/* Card Footer */
.card-footer-premium {
  padding: 14px 20px;
  background: #f7fcf9;
  border-top: 1px solid #eef6f2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-interview-btn {
  flex: 1;
  padding: 9px 14px;
  background: #eaf7f1;
  color: #16935b;
  border: 1px solid #cbe9dc;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.schedule-interview-btn:hover {
  background: #2cb67d;
  color: #ffffff;
  border-color: #2cb67d;
}

.view-cv-btn-premium {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-cv-btn-premium:hover {
  background: #ef4444;
  color: #ffffff;
}

.delete-candidate-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #ffffff;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-candidate-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

/* 🌿 Modal Overlay & Content */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 46, 34, 0.45);
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
  border-radius: 28px;
  width: 100%;
  max-width: 620px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(15, 46, 34, 0.2);
  border: 1px solid #dff0e7;
  animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: scale(0.96) translateY(-14px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-decoration {
  height: 5px;
  background: linear-gradient(90deg, #34b782, #2cb67d, #0284c7);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: #f7fcf9;
  border-bottom: 1px solid #e0f0e8;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(44, 182, 125, 0.25);
}

.modal-title h2 {
  font-size: 18px;
  font-weight: 800;
  color: #0f2e22;
  font-family: var(--font-display, sans-serif);
  margin: 0;
}

.modal-title p {
  font-size: 12px;
  color: #6b8f81;
  margin: 1px 0 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e0f0e8;
  cursor: pointer;
  color: #6b8f81;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
}

/* Forms */
.candidate-form,
.interview-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  font-size: 12.5px;
  font-weight: 700;
  color: #0f2e22;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.optional {
  font-weight: 400;
  color: #94a3b8;
  font-size: 11.5px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 11px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13.5px;
  color: #0f2e22;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  background: #ffffff;
  border-color: #2cb67d;
  box-shadow: 0 0 0 3px rgba(44, 182, 125, 0.16);
}

.form-input.error {
  border-color: #ef4444;
  background: #fff5f5;
}

.error-message {
  color: #ef4444;
  font-size: 11.5px;
  margin-top: 4px;
  font-weight: 600;
}

/* File Drop Zone */
.file-drop-zone {
  border: 2px dashed #cbe9dc;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  background: #f7fcf9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-drop-zone:hover {
  border-color: #2cb67d;
  background: #f0fdf4;
}

.file-upload-placeholder i {
  font-size: 30px;
  color: #2cb67d;
  margin-bottom: 6px;
}

.file-upload-placeholder p {
  font-size: 13px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0;
}

.file-upload-placeholder span {
  font-size: 12px;
  color: #6b8f81;
}

.file-upload-placeholder small {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

.file-upload-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.file-upload-preview i {
  font-size: 28px;
  color: #ef4444;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f2e22;
  display: block;
}

.file-size {
  font-size: 11px;
  color: #6b8f81;
}

.remove-file {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Email Toggle */
.email-toggle-wrapper {
  background: #f7fcf9;
  border: 1px solid #e0f0e8;
  border-radius: 14px;
  padding: 12px 16px;
}

.email-toggle-label {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
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
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #2cb67d;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f2e22;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-subtitle {
  font-size: 11.5px;
  color: #6b8f81;
  display: block;
}

/* Mode selector */
.mode-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mode-option {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 700;
  color: #475569;
  transition: all 0.2s ease;
}

.mode-option i {
  font-size: 18px;
}

.mode-option.active {
  background: #eaf7f1;
  border-color: #2cb67d;
  color: #16935b;
}

/* Candidate summary box in schedule modal */
.candidate-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #f7fcf9;
  border: 1px solid #e0f0e8;
  border-radius: 16px;
  margin-bottom: 18px;
}

.summary-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.summary-info h4 {
  font-size: 14.5px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0;
}

.summary-info p {
  font-size: 12px;
  color: #6b8f81;
  margin: 2px 0 4px;
}

.job-title-pill {
  font-size: 11px;
  font-weight: 700;
  color: #16935b;
  background: #eaf7f1;
  padding: 1px 8px;
  border-radius: 6px;
}

/* Details grid */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item i {
  color: #2cb67d;
  font-size: 14px;
  margin-top: 2px;
}

.detail-item label {
  font-size: 11px;
  font-weight: 700;
  color: #6b8f81;
  text-transform: uppercase;
  display: block;
}

.detail-item p {
  font-size: 13px;
  color: #0f2e22;
  font-weight: 600;
  margin: 2px 0 0;
}

.video-link {
  color: #0284c7;
  text-decoration: none;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Interview Actions */
.interview-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-edit-interview {
  padding: 10px 18px;
  background: #eaf7f1;
  color: #16935b;
  border: 1px solid #cbe9dc;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-cancel-interview {
  padding: 10px 18px;
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 13px;
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
  gap: 12px;
  margin-top: 10px;
}

.btn-submit {
  padding: 11px 22px;
  background: linear-gradient(135deg, #34b782 0%, #209961 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(44, 182, 125, 0.28);
}

.btn-cancel {
  padding: 11px 18px;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

/* Empty state */
.empty-state-premium {
  grid-column: 1 / -1;
  padding: 48px 20px;
  text-align: center;
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #dff0e7;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #eaf7f1;
  color: #2cb67d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin: 0 auto 14px;
}

.empty-state-premium h4 {
  font-size: 16px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0 0 6px;
}

.empty-state-premium p {
  font-size: 13px;
  color: #6b8f81;
  margin: 0 0 16px;
}

.inline-btn {
  margin: 0 auto;
}

/* 📱 Media Queries */
@media (max-width: 1024px) {
  .stats-bar {
    grid-template-columns: repeat(3, 1fr);
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

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }

  .candidates-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>