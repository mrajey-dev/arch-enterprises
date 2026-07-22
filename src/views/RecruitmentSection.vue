<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-users"></i>
            </div>
            <div>
              <h1>Recruitment</h1>
              <p class="subtitle-modern">Manage candidate applications</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="add-candidate-btn" @click="openAddForm">
              <i class="fas fa-plus"></i>
              <span>Add Candidate</span>
            </button>
            <div class="stats-badge-header">
              <i class="fas fa-user-plus"></i>
              <span>{{ candidates.length }} Candidates</span>
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card pending" @click="filterByStatus('Pending')">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card followup" @click="filterByStatus('Follow Up')">
            <i class="fas fa-phone-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{ followUpCount }}</span>
              <span class="stat-label">Follow Up</span>
            </div>
          </div>
          <div class="stat-card successful" @click="filterByStatus('Successful')">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ successfulCount }}</span>
              <span class="stat-label">Successful</span>
            </div>
          </div>
          <div class="stat-card rejected" @click="filterByStatus('Rejected')">
            <i class="fas fa-times-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ rejectedCount }}</span>
              <span class="stat-label">Rejected</span>
            </div>
          </div>
          <div class="stat-card all" @click="clearFilter">
            <i class="fas fa-th-list"></i>
            <div class="stat-info">
              <span class="stat-value">{{ candidates.length }}</span>
              <span class="stat-label">All</span>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-bar-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
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
        </div>

        <!-- Loading Spinner -->
        <div v-if="loadingLeaves" class="loading-container">
          <div class="spinner"></div>
          <p>Loading candidates...</p>
        </div>

        <!-- Candidate Cards Grid -->
        <div v-else class="candidates-grid">
          <div v-for="candidate in filteredCandidates" :key="candidate.id" class="candidate-card-premium">
            <div class="card-accent" :class="getStatusClass(candidate.status)"></div>
            
            <div class="card-header-premium">
              <div class="candidate-info">
                <div class="candidate-avatar">
                  {{ getInitials(candidate.name) }}
                </div>
                <div>
                  <h3>{{ candidate.name }}</h3>
                  <span class="job-title">{{ candidate.job_title }}</span>
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

            <div class="card-body-premium">
              <div class="info-row">
                <i class="fas fa-envelope"></i>
                <div>
                  <span class="info-label">Email</span>
                  <p>{{ candidate.email }}</p>
                </div>
              </div>
              <div class="info-row">
                <i class="fas fa-phone-alt"></i>
                <div>
                  <span class="info-label">Phone</span>
                  <p>{{ candidate.phone }}</p>
                </div>
              </div>
              <div class="info-row">
                <i class="fas fa-calendar-alt"></i>
                <div>
                  <span class="info-label">Applied On</span>
                  <p>{{ formatDate(candidate.created_at) }}</p>
                </div>
              </div>
              <div class="info-row message-row">
                <i class="fas fa-comment"></i>
                <div>
                  <span class="info-label">Message</span>
                  <p :class="{ collapsed: !candidate.expanded }" class="message-text">
                    {{ candidate.message || 'No message provided' }}
                  </p>
                  <button
                    v-if="candidate.message && candidate.message.length > 150"
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
                <i class="fas fa-file-pdf"></i>
                <div>
                  <span class="info-label">Resume</span>
                  <p class="resume-filename">
                    <i class="fas fa-file-pdf"></i>
                    {{ getFileName(candidate.resume) }}
                  </p>
                </div>
              </div>
              <!-- Interview Info -->
              <div v-if="candidate.interview" class="info-row interview-info">
                <i class="fas fa-calendar-check"></i>
                <div>
                  <span class="info-label">Interview Scheduled</span>
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
              >
                <i class="fas fa-file-pdf"></i>
              </button>
              <button
                class="delete-candidate-btn"
                @click="deleteCandidate(candidate)"
                title="Delete candidate"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredCandidates.length === 0" class="empty-state-premium">
            <i class="fas fa-users-slash"></i>
            <h4>{{ searchQuery || statusFilter ? 'No Matching Candidates' : 'No Candidates Found' }}</h4>
            <p>{{ searchQuery || statusFilter ? 'Try adjusting your filters' : 'No recruitment applications have been submitted yet' }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Add Candidate Modal -->
    <div v-if="showAddForm" class="modal-overlay" @click="closeAddForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <i class="fas fa-user-plus"></i>
            <h2>Add New Candidate</h2>
          </div>
          <button class="modal-close" @click="closeAddForm">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitCandidate" class="candidate-form" enctype="multipart/form-data">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Full Name <span class="required">*</span></label>
                <input
                  id="name"
                  type="text"
                  v-model="formData.name"
                  required
                  placeholder="Enter full name"
                  class="form-input"
                  :class="{ 'error': errors.name }"
                />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>
              <div class="form-group">
                <label for="email">Email Address <span class="required">*</span></label>
                <input
                  id="email"
                  type="email"
                  v-model="formData.email"
                  required
                  placeholder="Enter email address"
                  class="form-input"
                  :class="{ 'error': errors.email }"
                />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone Number <span class="required">*</span></label>
                <input
                  id="phone"
                  type="tel"
                  v-model="formData.phone"
                  required
                  placeholder="Enter phone number"
                  class="form-input"
                  :class="{ 'error': errors.phone }"
                />
                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
              </div>
              <div class="form-group">
                <label for="job_title">Job Title <span class="required">*</span></label>
                <input
                  id="job_title"
                  type="text"
                  v-model="formData.job_title"
                  required
                  placeholder="Enter job title"
                  class="form-input"
                  :class="{ 'error': errors.job_title }"
                />
                <span v-if="errors.job_title" class="error-message">{{ errors.job_title }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" v-model="formData.status" class="form-input">
                  <option value="Pending">⏳ Pending</option>
                  <option value="Follow Up">📞 Follow Up</option>
                  <option value="Successful">✅ Successful</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
              </div>
              <div class="form-group">
                <label for="resume">Resume URL (Optional)</label>
                <input
                  id="resume"
                  type="url"
                  v-model="formData.resume"
                  placeholder="Enter resume URL"
                  class="form-input"
                />
              </div>
            </div>

            <!-- File Upload Section -->
            <div class="form-row full-width">
              <div class="form-group file-upload-group">
                <label>Upload Resume (PDF, DOC, DOCX) <span class="optional">(Optional)</span></label>
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
                      <p>Drag & drop your resume here</p>
                      <span>or click to browse</span>
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

            <div class="form-group full-width">
              <label for="message">Message / Notes</label>
              <textarea
                id="message"
                v-model="formData.message"
                rows="4"
                placeholder="Enter any additional notes or message..."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeAddForm">
                Cancel
              </button>
              <button type="submit" class="btn-submit" :disabled="submitting">
                <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                <span v-else><i class="fas fa-save"></i> Add Candidate</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Schedule Interview Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click="closeScheduleModal">
      <div class="modal-content schedule-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <i class="fas fa-calendar-plus"></i>
            <h2>Schedule Interview</h2>
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
              <span class="job-title-badge">{{ selectedCandidate.job_title }}</span>
            </div>
          </div>

          <form @submit.prevent="submitInterview" class="interview-form">
            <div class="form-group">
              <label for="interview_title">Interview Title <span class="required">*</span></label>
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
              <label for="interview_description">Description</label>
              <textarea
                id="interview_description"
                v-model="interviewData.description"
                rows="3"
                placeholder="Enter interview details, topics to cover, etc."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="interview_date">Interview Date <span class="required">*</span></label>
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
                <label for="interview_time">Interview Time <span class="required">*</span></label>
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
              <label>Interview Mode <span class="required">*</span></label>
              <div class="mode-selector">
                <div 
                  class="mode-option" 
                  :class="{ active: interviewData.mode === 'online' }"
                  @click="interviewData.mode = 'online'"
                >
                  <i class="fas fa-video"></i>
                  <span>Online</span>
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
                  <span>Phone</span>
                </div>
              </div>
              <span v-if="errors.interview_mode" class="error-message">{{ errors.interview_mode }}</span>
            </div>

            <div v-if="interviewData.mode === 'online'" class="form-group">
              <label for="video_link">Video Call Link <span class="required">*</span></label>
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
              <label for="location">Location <span class="required">*</span></label>
              <input
                id="location"
                type="text"
                v-model="interviewData.location"
                required
                placeholder="Enter office address"
                class="form-input"
                :class="{ 'error': errors.location }"
              />
              <span v-if="errors.location" class="error-message">{{ errors.location }}</span>
            </div>

            <div class="form-group">
              <label for="interview_notes">Additional Notes</label>
              <textarea
                id="interview_notes"
                v-model="interviewData.notes"
                rows="2"
                placeholder="Any additional instructions for the candidate..."
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

    <!-- View Interview Details Modal -->
    <div v-if="showInterviewDetails" class="modal-overlay" @click="closeInterviewDetails">
      <div class="modal-content interview-details-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <i class="fas fa-calendar-check"></i>
            <h2>Interview Details</h2>
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
              <span class="job-title-badge">{{ selectedCandidate.job_title }}</span>
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <i class="fas fa-tag"></i>
              <div>
                <label>Title</label>
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
                <p>{{ selectedCandidate.interview.mode | capitalize }}</p>
              </div>
            </div>

            <div v-if="selectedCandidate.interview.video_link" class="detail-item full-width">
              <i class="fas fa-link"></i>
              <div>
                <label>Video Link</label>
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
        message: ''
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
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
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

  filters: {
    capitalize(value) {
      if (!value) return '';
      return value.charAt(0).toUpperCase() + value.slice(1);
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
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    formatFullDateTime(dateStr, timeStr) {
      if (!dateStr || !timeStr) return ''
      const date = new Date(dateStr + ' ' + timeStr)
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getFileName(path) {
      if (!path) return ''
      return path.split('/').pop()
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
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
      // Validate
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
        
        // Create interview data
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
        
        // Submit to API
        const response = await axios.post(
          '/api/interviews',
          interviewPayload,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        
        toastSuccess('Interview scheduled successfully!');
        
        // Update candidate with interview data
        const updatedCandidate = {
          ...this.selectedCandidate,
          interview: response.data.data
        };
        
        const index = this.candidates.findIndex(c => c.id === this.selectedCandidate.id);
        if (index !== -1) {
          this.candidates[index] = updatedCandidate;
        }
        
        // Optionally update status to 'Follow Up'
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
      // Pre-fill interview data
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
        // Remove interview so it can be rescheduled
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
          `/api/interviews/${candidate.interview.id}`,
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
        message: ''
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
        
        if (this.formData.resumeFile) {
          formData.append('resume', this.formData.resumeFile);
        }
        
        if (this.formData.resume.trim() && !this.formData.resumeFile) {
          formData.append('resume_url', this.formData.resume.trim());
        }
        
        const response = await axios.post(
          '/api/recruitment',
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        toastSuccess('Candidate added successfully!');
        
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
          
          if (error.response.status === 405) {
            toastError('API endpoint not configured for POST. Please check your Laravel routes.');
          } else if (error.response.status === 422) {
            const errors = error.response.data.errors;
            if (errors) {
              this.errors = {};
              Object.keys(errors).forEach(key => {
                if (key === 'resume') {
                  this.errors.resume = errors[key][0];
                } else if (key === 'name') {
                  this.errors.name = errors[key][0];
                } else if (key === 'email') {
                  this.errors.email = errors[key][0];
                } else if (key === 'phone') {
                  this.errors.phone = errors[key][0];
                } else if (key === 'job_title') {
                  this.errors.job_title = errors[key][0];
                } else {
                  toastError(errors[key][0]);
                }
              });
            } else {
              toastError(errorMessage);
            }
          } else {
            toastError(errorMessage);
          }
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
        await axios.patch(
          `/api/recruitment/${candidate.id}/status`,
          { status: candidate.status },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toastSuccess(`Status updated to ${candidate.status}`)
      } catch (error) {
        console.error(error)
        toastError('Failed to update status')
      }
    },
    async deleteCandidate(candidate) {
      if (!confirm(`Are you sure you want to delete ${candidate.name}?`)) {
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `/api/recruitment/${candidate.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        this.candidates = this.candidates.filter(c => c.id !== candidate.id);
        toastSuccess('Candidate deleted successfully');
      } catch (error) {
        console.error('Error deleting candidate:', error);
        toastError('Failed to delete candidate');
      }
    },
    async fetchCandidates() {
      this.loadingLeaves = true
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/recruitment', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.candidates = res.data.data.map(candidate => ({
          ...candidate,
          expanded: false,
          interview: candidate.interview || null
        }))
      } catch (error) {
        console.error(error)
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

/* Variables */
:root {
  --primary: linear-gradient(135deg, #667eea 0%, #7c3aed 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Content Header */
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary);
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
  color: var(--primary-color);
}

.add-candidate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.add-candidate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.add-candidate-btn i {
  font-size: 16px;
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.stat-card.all {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
}
.stat-card.all i { color: #4b5563; }

.stat-card.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}
.stat-card.pending i { color: #d97706; }

.stat-card.followup {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}
.stat-card.followup i { color: #4338ca; }

.stat-card.successful {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}
.stat-card.successful i { color: #065f46; }

.stat-card.rejected {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}
.stat-card.rejected i { color: #991b1b; }

.stat-card i {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
}

/* Search Bar */
.search-bar-container {
  margin-bottom: 24px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper i {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
}

.clear-search:hover {
  color: #6b7280;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Candidates Grid */
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

/* Candidate Card */
.candidate-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.candidate-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.card-accent.pending { background: #f59e0b; }
.card-accent.followup { background: #3b82f6; }
.card-accent.successful { background: #10b981; }
.card-accent.rejected { background: #ef4444; }

.card-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.candidate-avatar {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.candidate-info h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.job-title {
  font-size: 12px;
  color: #6b7280;
}

/* Status Select */
.status-select-premium {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-select-premium.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-select-premium.followup {
  background: #e0e7ff;
  color: #4338ca;
}

.status-select-premium.successful {
  background: #d1fae5;
  color: #065f46;
}

.status-select-premium.rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Card Body */
.card-body-premium {
  padding: 20px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.info-row i {
  width: 18px;
  color: var(--primary-color);
  margin-top: 2px;
  font-size: 14px;
}

.info-row > div {
  flex: 1;
}

.info-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 2px;
}

.info-row p {
  font-size: 13px;
  color: #374151;
  margin: 0;
  word-break: break-word;
}

.message-row p {
  line-height: 1.5;
}

.message-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.show-more-btn-premium {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
}

.show-more-btn-premium:hover {
  text-decoration: underline;
}

.resume-info p {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-color);
}

.resume-filename {
  font-size: 13px;
  font-weight: 500;
}

/* Interview Info */
.interview-info {
  background: #f0fdf4;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #bbf7d0;
}

.interview-info i {
  color: #16a34a;
}

.interview-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.interview-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.interview-status.scheduled {
  background: #dcfce7;
  color: #16a34a;
}

.view-interview-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.view-interview-btn:hover {
  text-decoration: underline;
}

/* Card Footer */
.card-footer-premium {
  padding: 16px 20px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.schedule-interview-btn {
  flex: 1;
  padding: 10px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.schedule-interview-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.view-cv-btn-premium {
  padding: 10px 14px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: var(--primary-color);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-cv-btn-premium:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.delete-candidate-btn {
  padding: 10px 14px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-candidate-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  grid-column: 1 / -1;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-state-premium p {
  font-size: 14px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 24px;
  max-width: 600px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-content.schedule-modal {
  max-width: 650px;
}

.modal-content.interview-details-modal {
  max-width: 650px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #f0f2f5;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 24px 24px 0 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title i {
  font-size: 22px;
  color: var(--primary-color);
  background: #eef2ff;
  padding: 10px;
  border-radius: 12px;
}

.modal-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
}

.modal-close {
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.modal-close:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

/* Candidate Summary */
.candidate-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  margin-bottom: 20px;
}

.summary-avatar {
  width: 50px;
  height: 50px;
  background: var(--primary);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 20px;
  flex-shrink: 0;
}

.summary-info {
  flex: 1;
}

.summary-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.summary-info p {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #6b7280;
}

.job-title-badge {
  display: inline-block;
  padding: 2px 12px;
  background: #e0e7ff;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
}

/* Form Styles */
.candidate-form,
.interview-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
  width: 100%;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group.full-width {
  flex: 0 0 100%;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.optional {
  color: #9ca3af;
  font-weight: 400;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #fafbfc;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
}

.error-message {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Mode Selector */
.mode-selector {
  display: flex;
  gap: 12px;
}

.mode-option {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.mode-option:hover {
  border-color: var(--primary-color);
  background: #f0f4ff;
}

.mode-option.active {
  border-color: var(--primary-color);
  background: #eef2ff;
  color: var(--primary-color);
}

.mode-option i {
  display: block;
  font-size: 24px;
  margin-bottom: 6px;
}

.mode-option span {
  font-size: 13px;
  font-weight: 500;
}

/* File Upload Styles */
.file-upload-group {
  flex: 0 0 100%;
}

.file-upload-wrapper {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: #fafbfc;
  overflow: hidden;
}

.file-upload-wrapper.has-file {
  border-color: var(--primary-color);
  background: #f0f4ff;
}

.file-input-hidden {
  display: none;
}

.file-drop-zone {
  padding: 24px;
  text-align: center;
  cursor: pointer;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.file-drop-zone:hover {
  background: #f0f4ff;
}

.file-upload-placeholder i {
  font-size: 40px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.file-upload-placeholder p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.file-upload-placeholder span {
  font-size: 12px;
  color: #9ca3af;
}

.file-upload-placeholder small {
  display: block;
  font-size: 11px;
  color: #b0b8c4;
  margin-top: 8px;
}

.file-upload-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 8px 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.file-upload-preview i {
  font-size: 32px;
  color: #ef4444;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: #9ca3af;
}

.remove-file {
  background: #fee2e2;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ef4444;
  transition: all 0.2s ease;
}

.remove-file:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 10px 24px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  padding: 10px 28px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Interview Details Styles */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.detail-item i {
  font-size: 18px;
  color: var(--primary-color);
  margin-top: 2px;
  flex-shrink: 0;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 2px;
}

.detail-item p {
  margin: 0;
  font-size: 14px;
  color: #1a1a2e;
}

.video-link {
  color: var(--primary-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  word-break: break-all;
}

.video-link:hover {
  text-decoration: underline;
}

.interview-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-edit-interview {
  flex: 1;
  padding: 10px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-edit-interview:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-cancel-interview {
  flex: 1;
  padding: 10px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel-interview:hover {
  background: #fecaca;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 1024px) {
  .candidates-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .content {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .stats-badge-header {
    align-self: flex-start;
  }

  .add-candidate-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-bar {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .candidates-grid {
    grid-template-columns: 1fr;
  }

  .card-header-premium {
    flex-direction: column;
    gap: 12px;
  }

  .status-select-premium {
    align-self: flex-start;
  }

  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: unset;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }

  .modal-content {
    max-width: 100%;
    margin: 10px;
    max-height: 95vh;
  }

  .file-drop-zone {
    padding: 16px;
    min-height: 100px;
  }

  .file-upload-preview {
    flex-wrap: wrap;
    justify-content: center;
  }

  .file-info {
    text-align: center;
  }

  .mode-selector {
    flex-direction: column;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .interview-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Scrollbar styles */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #c1c7d0;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a0a8b4;
}
</style>