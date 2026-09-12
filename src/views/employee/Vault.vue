<template>
  <div class="layout">
    <div class="main-content">
      <AdminSidebar v-if="isAdminOrHrContext && (!isMobile || isSidebarVisible)" />
      <Sidebar v-else-if="!isMobile || isSidebarVisible" />

      <div class="vault-board-premium" :class="{ 'mobile-view': isMobile }">
        
        <!-- ==================================================== -->
        <!-- 🔒 STATE 1: 2-STEP VERIFICATION GATEWAY (LOCKED)      -->
        <!-- ==================================================== -->
        <div v-if="!isVaultUnlocked" class="vault-lock-screen">
          <div class="lock-card-premium">
            <div class="lock-shield-halo">
              <div class="lock-shield-ico">
                <i class="fas fa-shield-alt"></i>
              </div>
            </div>

            <div class="lock-header-text">
              <span class="security-chip"><i class="fas fa-lock"></i> AES-256 Protected</span>
              <h2>{{ isHrUser ? 'HR & Enterprise Security Vault' : 'Security Vault' }}</h2>
              <p class="lock-subtitle">
                {{ currentStep === 1 
                  ? 'Confirm your account password to initiate 2-step verification.' 
                  : 'Enter the 6-digit verification code dispatched to your email.' }}
              </p>
            </div>

            <!-- Profile Summary -->
            <div class="user-verification-badge">
              <div class="user-avatar-mini">
                <img :src="profilePhoto" @error="profilePhoto = defaultPhoto" alt="Profile" />
              </div>
              <div class="user-info-mini">
                <span class="user-name-label">{{ user.name || (isHrUser ? 'HR Administrator' : 'Employee') }}</span>
                <span class="user-email-label">{{ user.email || (isHrUser ? 'admin@archenterprises.co.in' : 'employee@arch.com') }}</span>
              </div>
              <span v-if="isHrUser" class="hr-badge-pill"><i class="fas fa-user-shield"></i> HR / Admin Access</span>
            </div>

            <!-- 1️⃣ STEP 1: PASSWORD CONFIRMATION -->
            <form v-if="currentStep === 1" @submit.prevent="requestVaultOtp" class="lock-form">
              <div class="input-field-group">
                <label for="vaultEmail">Account Username / Email</label>
                <div class="input-wrap-icon">
                  <i class="fas fa-user-circle input-ico"></i>
                  <input 
                    id="vaultEmail"
                    v-model="authEmail" 
                    type="text" 
                    placeholder="Enter username or email (e.g. admin, hr, or hr@archenterprises.co.in)" 
                    class="vault-input"
                    required
                  />
                </div>
              </div>

              <div class="input-field-group">
                <label for="vaultPassword">Account Password</label>
                <div class="input-wrap-icon">
                  <i class="fas fa-key input-ico"></i>
                  <input 
                    id="vaultPassword"
                    v-model="password" 
                    :type="showPassword ? 'text' : 'password'" 
                    placeholder="Enter your account password" 
                    class="vault-input"
                    required
                  />
                  <button type="button" class="btn-toggle-eye" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>

              <div v-if="authError" class="auth-error-banner">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ authError }}</span>
              </div>

              <button type="submit" class="btn-lock-action" :disabled="sendingOtp">
                <span v-if="sendingOtp"><i class="fas fa-spinner fa-spin"></i> Dispatching OTP...</span>
                <span v-else><i class="fas fa-arrow-right"></i> Send 2-Step OTP Code</span>
              </button>
            </form>

            <!-- 2️⃣ STEP 2: 6-DIGIT EMAIL OTP VERIFICATION -->
            <form v-else @submit.prevent="verifyVaultOtp" class="lock-form">
              <div class="otp-box-section">
                <label>6-Digit Verification Code</label>
                <div class="otp-digit-inputs">
                  <input 
                    v-for="(digit, idx) in 6" 
                    :key="idx" 
                    ref="otpInputRefs"
                    v-model="otpDigits[idx]"
                    type="text" 
                    maxlength="1" 
                    class="otp-digit-box"
                    @input="handleOtpInput(idx, $event)"
                    @keydown="handleOtpKeydown(idx, $event)"
                    @paste="handleOtpPaste($event)"
                  />
                </div>
                
                <div class="timer-resend-row">
                  <span class="timer-countdown" :class="{ 'expired': timerSeconds === 0 }">
                    <i class="fas fa-stopwatch"></i> Code expires in: {{ formattedTimer }}
                  </span>
                  <button 
                    type="button" 
                    class="btn-resend-code" 
                    :disabled="timerSeconds > 0 || resendingOtp"
                    @click="requestVaultOtp"
                  >
                    <span v-if="resendingOtp"><i class="fas fa-spinner fa-spin"></i> Resending...</span>
                    <span v-else>Resend Code</span>
                  </button>
                </div>
              </div>

              <div v-if="authError" class="auth-error-banner">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ authError }}</span>
              </div>

              <div class="otp-actions-stack">
                <button type="submit" class="btn-lock-action unlock" :disabled="verifyingOtp || otpCode.length < 6">
                  <span v-if="verifyingOtp"><i class="fas fa-spinner fa-spin"></i> Authenticating...</span>
                  <span v-else><i class="fas fa-unlock-alt"></i> Unlock Security Vault</span>
                </button>
                <button type="button" class="btn-back-step" @click="backToPasswordStep">
                  <i class="fas fa-arrow-left"></i> Change Password / Re-verify
                </button>
              </div>
            </form>

            <div class="lock-footer-info">
              <i class="fas fa-info-circle"></i>
              <span>Vault session remains active for 15 minutes of activity.</span>
            </div>
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- 🔓 STATE 2: UNLOCKED SECURITY VAULT WORKSPACE         -->
        <!-- ==================================================== -->
        <div v-else class="vault-workspace">
          
          <!-- 🌟 Vault Header Section -->
          <div class="vault-header-card">
            <div class="header-left">
              <div class="vault-icon-badge">
                <i class="fas fa-vault"></i>
              </div>
              <div class="vault-title-group">
                <div class="title-row">
                  <h2>Security Vault</h2>
                  <span class="vault-status-pill">
                    <span class="pulse-dot"></span> Unlocked (Protected)
                  </span>
                  <span v-if="isHrUser" class="hr-indicator-badge">
                    <i class="fas fa-user-shield"></i> HR & Management Mode
                  </span>
                </div>
                <p class="vault-subtext">
                  Confidential document repository, HR records, digital signatures & restricted company files.
                </p>
              </div>
            </div>

            <div class="header-right-actions">
              <button class="btn-vault-upload" @click="showUploadModal = true">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Upload Document</span>
              </button>
              <button class="btn-vault-lock" @click="lockVault" title="Instantly Lock Vault">
                <i class="fas fa-lock"></i>
                <span>Lock Vault</span>
              </button>
            </div>
          </div>

          <!-- 📊 Security Vault KPI Cards -->
          <div class="vault-kpi-grid">
            <div class="vault-kpi-card">
              <div class="kpi-icon-square blue">
                <i class="fas fa-folder-open"></i>
              </div>
              <div class="kpi-info">
                <span class="kpi-num">{{ files.length }}</span>
                <span class="kpi-text">Total Secured Files</span>
              </div>
            </div>

            <div class="vault-kpi-card">
              <div class="kpi-icon-square green">
                <i class="fas fa-user-lock"></i>
              </div>
              <div class="kpi-info">
                <span class="kpi-num">{{ myFilesCount }}</span>
                <span class="kpi-text">My Personal Vault</span>
              </div>
            </div>

            <div class="vault-kpi-card">
              <div class="kpi-icon-square purple">
                <i class="fas fa-share-alt"></i>
              </div>
              <div class="kpi-info">
                <span class="kpi-num">{{ sharedWithMeCount }}</span>
                <span class="kpi-text">Shared With Me</span>
              </div>
            </div>

            <div v-if="isHrUser" class="vault-kpi-card">
              <div class="kpi-icon-square amber">
                <i class="fas fa-building-shield"></i>
              </div>
              <div class="kpi-info">
                <span class="kpi-num">{{ hrFilesCount }}</span>
                <span class="kpi-text">HR Confidential</span>
              </div>
            </div>
          </div>

          <!-- 🔍 Filter Tabs & Search Controls -->
          <div class="vault-controls-bar">
            <div class="search-input-wrap">
              <i class="fas fa-search search-icon"></i>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search files by name, uploader, or category..." 
                class="search-bar"
              />
              <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="filter-tab-pills">
              <button 
                class="tab-pill" 
                :class="{ active: activeCategory === 'all' }"
                @click="activeCategory = 'all'"
              >
                <i class="fas fa-layer-group"></i> All Files ({{ files.length }})
              </button>
              <button 
                class="tab-pill" 
                :class="{ active: activeCategory === 'personal' }"
                @click="activeCategory = 'personal'"
              >
                <i class="fas fa-user"></i> Personal ({{ myFilesCount }})
              </button>
              <button 
                class="tab-pill" 
                :class="{ active: activeCategory === 'shared' }"
                @click="activeCategory = 'shared'"
              >
                <i class="fas fa-share-alt"></i> Shared ({{ sharedWithMeCount }})
              </button>
              <button 
                v-if="isHrUser"
                class="tab-pill hr-tab" 
                :class="{ active: activeCategory === 'hr_confidential' }"
                @click="activeCategory = 'hr_confidential'"
              >
                <i class="fas fa-user-shield"></i> HR Records ({{ hrFilesCount }})
              </button>
              <button 
                class="tab-pill" 
                :class="{ active: activeCategory === 'contract' }"
                @click="activeCategory = 'contract'"
              >
                <i class="fas fa-file-contract"></i> Contracts
              </button>
            </div>
          </div>

          <!-- 📄 Files Table / Content Area -->
          <div class="vault-files-container">
            <div v-if="loadingFiles" class="loading-state-card">
              <i class="fas fa-spinner fa-spin loader-icon"></i>
              <p>Decrypting and fetching your vault items...</p>
            </div>

            <div v-else-if="filteredFiles.length === 0" class="empty-state-card">
              <div class="empty-halo">
                <i class="fas fa-folder-open"></i>
              </div>
              <h3>No Secured Documents Found</h3>
              <p>Upload a file to keep your critical documents encrypted and protected.</p>
              <button class="btn-empty-upload" @click="showUploadModal = true">
                <i class="fas fa-cloud-upload-alt"></i> Upload New File
              </button>
            </div>

            <div v-else class="files-table-wrapper">
              <table class="vault-files-table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Category</th>
                    <th>Size</th>
                    <th>Uploader</th>
                    <th>Date Uploaded</th>
                    <th>Access / Permissions</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="file in filteredFiles" :key="file.id" class="file-table-row">
                    
                    <!-- Document Name with Type Icon -->
                    <td>
                      <div class="file-name-cell">
                        <div class="file-type-icon" :class="getFileIconClass(file.filename)">
                          <i :class="getFileIcon(file.filename)"></i>
                        </div>
                        <div class="file-meta-col">
                          <span class="file-title" :title="file.filename">{{ file.filename }}</span>
                          <span v-if="file.description" class="file-desc-sub">{{ file.description }}</span>
                        </div>
                      </div>
                    </td>

                    <!-- Category Badge -->
                    <td>
                      <span class="category-tag-badge" :class="file.category">
                        {{ formatCategoryLabel(file.category) }}
                      </span>
                    </td>

                    <!-- File Size -->
                    <td>
                      <span class="size-text">{{ file.file_size || '—' }}</span>
                    </td>

                    <!-- Uploader -->
                    <td>
                      <div class="uploader-info-cell">
                        <span class="uploader-name">{{ file.uploader_name }}</span>
                        <span class="uploader-dept">{{ file.uploader_dept }}</span>
                      </div>
                    </td>

                    <!-- Upload Date -->
                    <td>
                      <span class="date-text">{{ file.created_at }}</span>
                    </td>

                    <!-- Access Info -->
                    <td>
                      <div class="access-pill-wrapper">
                        <span class="access-status-badge" :class="file.access_type">
                          <i :class="getAccessIcon(file.access_type)"></i>
                          {{ formatAccessLabel(file.access_type) }}
                        </span>
                        <span v-if="file.shared_with && file.shared_with.length" class="shared-count-chip">
                          +{{ file.shared_with.length }} Shared
                        </span>
                      </div>
                    </td>

                    <!-- Action Buttons -->
                    <td class="text-right">
                      <div class="action-buttons-group">
                        <a 
                          :href="file.download_url" 
                          target="_blank" 
                          class="action-btn download" 
                          title="Download Document"
                        >
                          <i class="fas fa-download"></i>
                        </a>

                        <button 
                          v-if="file.can_share" 
                          class="action-btn share" 
                          @click="openShareModal(file)" 
                          title="Share / Grant Access"
                        >
                          <i class="fas fa-user-plus"></i>
                        </button>

                        <button 
                          v-if="file.is_owner" 
                          class="action-btn delete" 
                          @click="deleteFile(file)" 
                          title="Delete File (Owner Only)"
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

        <!-- ==================================================== -->
        <!-- 📤 MODAL 1: UPLOAD SECURE DOCUMENT                   -->
        <!-- ==================================================== -->
        <div v-if="showUploadModal" class="modal-backdrop" @click.self="showUploadModal = false">
          <div class="vault-modal-card">
            <div class="modal-header">
              <div class="modal-title-row">
                <i class="fas fa-shield-alt modal-ico"></i>
                <h3>Secure File Upload</h3>
              </div>
              <button class="btn-close-modal" @click="showUploadModal = false">&times;</button>
            </div>

            <form @submit.prevent="submitUpload" class="modal-body-form">
              <!-- Dropzone -->
              <div 
                class="file-dropzone" 
                :class="{ 'has-file': selectedUploadFile, 'dragging': isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleFileDrop"
                @click="$refs.fileInput.click()"
              >
                <input 
                  type="file" 
                  ref="fileInput" 
                  @change="handleFileSelect" 
                  style="display: none" 
                />
                
                <div v-if="!selectedUploadFile" class="dropzone-prompt">
                  <div class="drop-halo">
                    <i class="fas fa-cloud-upload-alt"></i>
                  </div>
                  <p class="drop-main-text">Click to browse or drag & drop documents</p>
                  <span class="drop-sub-text">Supports PDF, DOCX, XLSX, PNG, JPG, ZIP (Max 50MB)</span>
                </div>

                <div v-else class="dropzone-file-preview">
                  <i class="fas fa-file-invoice selected-file-ico"></i>
                  <div class="preview-text">
                    <span class="preview-name">{{ selectedUploadFile.name }}</span>
                    <span class="preview-size">{{ formatBytes(selectedUploadFile.size) }}</span>
                  </div>
                  <button type="button" class="btn-remove-file" @click.stop="selectedUploadFile = null">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Category -->
              <div class="form-row-group">
                <label>Document Category</label>
                <select v-model="uploadCategory" class="modal-select" required>
                  <option value="personal">🔒 Personal Confidential Document</option>
                  <option v-if="isHrUser" value="hr_confidential">🏢 HR / Company Confidential</option>
                  <option value="contract">📜 Employment Contract & Offer Letter</option>
                  <option value="payslip">💰 Payslip / Tax Declaration</option>
                  <option value="general">📁 General Secured File</option>
                </select>
              </div>

              <!-- Notes / Description -->
              <div class="form-row-group">
                <label>Description / Security Note (Optional)</label>
                <input 
                  v-model="uploadDescription" 
                  type="text" 
                  placeholder="e.g. FY 2026 Appraisal Contract Signed" 
                  class="modal-input"
                />
              </div>

              <div class="modal-actions-footer">
                <button type="button" class="btn-cancel" @click="showUploadModal = false">Cancel</button>
                <button type="submit" class="btn-submit-upload" :disabled="uploadingFile || !selectedUploadFile">
                  <span v-if="uploadingFile"><i class="fas fa-spinner fa-spin"></i> Encrypting & Uploading...</span>
                  <span v-else><i class="fas fa-lock"></i> Encrypt & Save to Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- 👥 MODAL 2: GRANT / SHARE FILE ACCESS (HR & OWNER)   -->
        <!-- ==================================================== -->
        <div v-if="showShareModal" class="modal-backdrop" @click.self="showShareModal = false">
          <div class="vault-modal-card">
            <div class="modal-header">
              <div class="modal-title-row">
                <i class="fas fa-user-plus modal-ico"></i>
                <h3>Grant File Access</h3>
              </div>
              <button class="btn-close-modal" @click="showShareModal = false">&times;</button>
            </div>

            <div class="modal-share-body">
              <div class="target-file-summary">
                <i class="fas fa-file-alt"></i>
                <div>
                  <strong>{{ activeShareFile?.filename }}</strong>
                  <p>{{ activeShareFile?.category }} • Uploaded by {{ activeShareFile?.uploader_name }}</p>
                </div>
              </div>

              <!-- Share Form -->
              <form @submit.prevent="submitGrantAccess" class="share-form">
                <div class="form-row-group">
                  <label>Select Employee</label>
                  <select v-model="selectedShareUserId" class="modal-select" required>
                    <option disabled value="">-- Choose Employee --</option>
                    <option v-for="emp in usersList" :key="emp.id" :value="emp.id">
                      {{ emp.name }} ({{ emp.department || 'Employee' }} - {{ emp.email }})
                    </option>
                  </select>
                </div>

                <div class="form-row-group">
                  <label>Permission Level</label>
                  <select v-model="selectedShareAccessType" class="modal-select" required>
                    <option value="read">👁️ Read Only (Download & View)</option>
                  </select>
                  <small style="color: #64748b; font-size: 0.74rem; margin-top: 2px;">
                    <i class="fas fa-lock"></i> Recipients receive read & download access. Only the document owner can delete this record.
                  </small>
                </div>

                <button type="submit" class="btn-submit-upload" :disabled="grantingAccess || !selectedShareUserId">
                  <span v-if="grantingAccess"><i class="fas fa-spinner fa-spin"></i> Granting...</span>
                  <span v-else><i class="fas fa-share-alt"></i> Grant Read Access</span>
                </button>
              </form>

              <!-- Currently Shared List -->
              <div v-if="activeShareFile?.shared_with && activeShareFile.shared_with.length" class="existing-shares-box">
                <h4>Currently Shared With:</h4>
                <div class="shares-list">
                  <div v-for="share in activeShareFile.shared_with" :key="share.access_id" class="share-item">
                    <div class="share-user-meta">
                      <strong>{{ share.name }}</strong>
                      <span>{{ share.email }} • {{ share.access_type === 'write' ? 'Read & Write' : 'Read Only' }}</span>
                    </div>
                    <button class="btn-revoke-share" @click="revokeAccess(share.access_id)" title="Revoke Access">
                      <i class="fas fa-times"></i> Revoke
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from '@/views/employee/components/Sidebar.vue';
import AdminSidebar from '@/components/Sidebar.vue';
import { toastSuccess, toastError, toastWarning, toastInfo } from '@/utils/toast.js';

export default {
  name: 'SecurityVault',
  components: {
    Sidebar,
    AdminSidebar
  },
  data() {
    const localUser = (() => {
      try {
        let u = JSON.parse(localStorage.getItem('user') || '{}');
        const adminEmail = localStorage.getItem('admin_email');
        const adminName = localStorage.getItem('admin_name');
        
        if (!u || !u.email) {
          if (adminEmail || adminName) {
            u = {
              id: 1,
              name: adminName || 'HR Management',
              email: adminEmail || 'admin@archenterprises.co.in',
              department: 'HR Management',
              role: 'hr'
            };
          }
        }
        return u || {};
      } catch (e) {
        return {};
      }
    })();

    const initPhoto = (() => {
      try {
        const adminPhoto = localStorage.getItem('admin_photo');
        if (adminPhoto) return adminPhoto;
        if (localUser && localUser.id) {
          const cached = localStorage.getItem(`profilePhoto_${localUser.id}`);
          if (cached) return cached;
        }
        if (localUser && typeof localUser.profile_photo === 'string' && localUser.profile_photo.includes('/')) {
          return `https://employees.archenterprises.co.in/backend/public/storage/${localUser.profile_photo}`;
        }
      } catch (e) {}
      return 'https://cdn-icons-png.flaticon.com/512/219/219983.png';
    })();

    // Check if vault session exists in sessionStorage
    const isUnlocked = sessionStorage.getItem('arch_vault_unlocked') === 'true';

    return {
      isMobile: window.innerWidth <= 768,
      isSidebarVisible: true,
      user: localUser,
      authEmail: (localUser.email || localStorage.getItem('admin_email') || 'hr@archenterprises.co.in').trim(),
      profilePhoto: initPhoto,
      defaultPhoto: 'https://cdn-icons-png.flaticon.com/512/219/219983.png',

      // 🔐 2-Step Verification State
      isVaultUnlocked: isUnlocked,
      currentStep: 1, // 1 = Password, 2 = 6-digit OTP
      password: '',
      showPassword: false,
      sendingOtp: false,
      resendingOtp: false,
      verifyingOtp: false,
      authError: '',
      otpDigits: ['', '', '', '', '', ''],
      timerSeconds: 600, // 10 minutes
      timerInterval: null,

      // 📁 Vault Workspace State
      files: [],
      usersList: [],
      loadingFiles: false,
      searchQuery: '',
      activeCategory: 'all',

      // 📤 Upload Modal State
      showUploadModal: false,
      selectedUploadFile: null,
      uploadCategory: 'personal',
      uploadDescription: '',
      isDragging: false,
      uploadingFile: false,

      // 👥 Share Modal State
      showShareModal: false,
      activeShareFile: null,
      selectedShareUserId: '',
      selectedShareAccessType: 'read',
      grantingAccess: false,
    };
  },
  computed: {
    otpCode() {
      return this.otpDigits.join('');
    },
    formattedTimer() {
      const mins = Math.floor(this.timerSeconds / 60);
      const secs = this.timerSeconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },
    isAdminOrHrContext() {
      const adminEmail = localStorage.getItem('admin_email');
      const adminName = localStorage.getItem('admin_name');
      const dept = String(this.user?.department || '').trim().toLowerCase();
      const role = String(this.user?.role || '').trim().toLowerCase();
      const path = String(this.$route?.path || '').trim().toLowerCase();
      return !!adminEmail || !!adminName || dept === 'hr' || dept === 'human resources' || dept === 'owner' || dept === 'management' || role === 'admin' || role === 'hr' || path.startsWith('/hr') || path.startsWith('/admin') || path === '/vault';
    },
    isHrUser() {
      const dept = String(this.user?.department || '').trim().toLowerCase();
      const role = String(this.user?.role || '').trim().toLowerCase();
      const adminEmail = localStorage.getItem('admin_email');
      const adminName = localStorage.getItem('admin_name');
      return !!adminEmail || !!adminName || dept === 'hr' || dept === 'human resources' || dept === 'owner' || dept === 'management' || role === 'admin' || role === 'hr' || role === 'owner';
    },
    myFilesCount() {
      return this.files.filter(f => f.is_owner).length;
    },
    sharedWithMeCount() {
      return this.files.filter(f => !f.is_owner).length;
    },
    hrFilesCount() {
      return this.files.filter(f => f.category === 'hr_confidential').length;
    },
    filteredFiles() {
      return this.files.filter(file => {
        // Category filter
        if (this.activeCategory === 'personal' && !file.is_owner) return false;
        if (this.activeCategory === 'shared' && file.is_owner) return false;
        if (this.activeCategory === 'hr_confidential' && file.category !== 'hr_confidential') return false;
        if (this.activeCategory === 'contract' && file.category !== 'contract') return false;

        // Search query
        if (this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase();
          const nameMatch = (file.filename || '').toLowerCase().includes(q);
          const uploaderMatch = (file.uploader_name || '').toLowerCase().includes(q);
          const catMatch = (file.category || '').toLowerCase().includes(q);
          const descMatch = (file.description || '').toLowerCase().includes(q);
          return nameMatch || uploaderMatch || catMatch || descMatch;
        }

        return true;
      });
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    if (this.isVaultUnlocked) {
      this.fetchVaultFiles();
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.timerInterval) clearInterval(this.timerInterval);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    },

    // ==========================================
    // 🔐 2-STEP VERIFICATION METHODS
    // ==========================================
    async requestVaultOtp() {
      this.authError = '';
      this.sendingOtp = true;
      this.resendingOtp = true;

      const targetEmail = (this.authEmail || this.user.email || this.user.name || localStorage.getItem('admin_email') || localStorage.getItem('admin_name') || 'hr@archenterprises.co.in').trim();

      if (!targetEmail) {
        this.authError = 'Please enter your username or email address.';
        toastError(this.authError);
        this.sendingOtp = false;
        this.resendingOtp = false;
        return;
      }

      try {
        const payload = {
          email: targetEmail,
          password: this.password,
          user_id: this.user?.id
        };

        const res = await axios.post('/api/employee/vault/send-otp', payload);

        if (res.data.success) {
          toastSuccess('Verification code sent to ' + targetEmail + '!');
          this.currentStep = 2;
          this.startCountdownTimer();
          this.$nextTick(() => {
            if (this.$refs.otpInputRefs && this.$refs.otpInputRefs[0]) {
              this.$refs.otpInputRefs[0].focus();
            }
          });
        } else {
          this.authError = res.data.message || 'Verification failed.';
          toastError(this.authError);
        }
      } catch (err) {
        this.authError = err.response?.data?.message || 'Invalid credentials or failed to send OTP.';
        toastError(this.authError);
      } finally {
        this.sendingOtp = false;
        this.resendingOtp = false;
      }
    },

    async verifyVaultOtp() {
      if (this.otpCode.length < 6) {
        this.authError = 'Please enter all 6 digits of your verification code.';
        return;
      }

      this.authError = '';
      this.verifyingOtp = true;

      const targetEmail = (this.authEmail || this.user.email || this.user.name || localStorage.getItem('admin_email') || localStorage.getItem('admin_name') || 'hr@archenterprises.co.in').trim();

      try {
        const payload = {
          email: targetEmail,
          otp: this.otpCode,
          user_id: this.user?.id
        };

        const res = await axios.post('/api/employee/vault/verify-otp', payload);

        if (res.data.success) {
          sessionStorage.setItem('arch_vault_unlocked', 'true');
          this.isVaultUnlocked = true;
          toastSuccess('Vault Unlocked Successfully!');
          this.fetchVaultFiles();
        } else {
          this.authError = res.data.message || 'Invalid code.';
          toastError(this.authError);
        }
      } catch (err) {
        this.authError = err.response?.data?.message || 'Incorrect verification code. Please try again.';
        toastError(this.authError);
      } finally {
        this.verifyingOtp = false;
      }
    },

    backToPasswordStep() {
      this.currentStep = 1;
      this.otpDigits = ['', '', '', '', '', ''];
      this.authError = '';
      if (this.timerInterval) clearInterval(this.timerInterval);
    },

    startCountdownTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerSeconds = 600; // 10 minutes
      this.timerInterval = setInterval(() => {
        if (this.timerSeconds > 0) {
          this.timerSeconds--;
        } else {
          clearInterval(this.timerInterval);
        }
      }, 1000);
    },

    handleOtpInput(index, event) {
      const val = event.target.value;
      if (val && index < 5) {
        this.$refs.otpInputRefs[index + 1].focus();
      }
      if (this.otpCode.length === 6) {
        this.verifyVaultOtp();
      }
    },

    handleOtpKeydown(index, event) {
      if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
        this.$refs.otpInputRefs[index - 1].focus();
      }
    },

    handleOtpPaste(event) {
      event.preventDefault();
      const pastedData = (event.clipboardData || window.clipboardData).getData('text').trim();
      if (/^\d{6}$/.test(pastedData)) {
        for (let i = 0; i < 6; i++) {
          this.otpDigits[i] = pastedData[i];
        }
        this.verifyVaultOtp();
      }
    },

    lockVault() {
      sessionStorage.removeItem('arch_vault_unlocked');
      this.isVaultUnlocked = false;
      this.currentStep = 1;
      this.password = '';
      this.otpDigits = ['', '', '', '', '', ''];
      toastInfo('Security Vault Locked.');
    },

    // ==========================================
    // 📁 VAULT FILES & DATA OPERATIONS
    // ==========================================
    async fetchVaultFiles() {
      this.loadingFiles = true;
      try {
        const res = await axios.get('/api/employee/vault/files', {
          params: { user_id: this.user.id, email: this.user.email }
        });

        if (res.data.success) {
          this.files = res.data.files || [];
          this.usersList = res.data.users || [];
        }
      } catch (err) {
        toastError('Failed to load secured vault files.');
      } finally {
        this.loadingFiles = false;
      }
    },

    handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) {
        this.selectedUploadFile = file;
      }
    },

    handleFileDrop(e) {
      this.isDragging = false;
      const file = e.dataTransfer.files[0];
      if (file) {
        this.selectedUploadFile = file;
      }
    },

    async submitUpload() {
      if (!this.selectedUploadFile) {
        toastWarning('Please select a document to upload.');
        return;
      }

      this.uploadingFile = true;
      const formData = new FormData();
      formData.append('file', this.selectedUploadFile);
      formData.append('user_id', this.user.id);
      formData.append('category', this.uploadCategory);
      formData.append('description', this.uploadDescription);

      try {
        const res = await axios.post('/api/employee/vault/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.success) {
          toastSuccess('Document encrypted and stored successfully!');
          this.showUploadModal = false;
          this.selectedUploadFile = null;
          this.uploadDescription = '';
          this.fetchVaultFiles();
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to upload document.');
      } finally {
        this.uploadingFile = false;
      }
    },

    async deleteFile(file) {
      if (!confirm(`Are you sure you want to delete "${file.filename}" permanently from the Security Vault?`)) {
        return;
      }

      try {
        const res = await axios.delete(`/api/employee/vault/file/${file.id}`, {
          params: { user_id: this.user.id }
        });

        if (res.data.success) {
          toastSuccess('Document removed from vault.');
          this.fetchVaultFiles();
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to delete file.');
      }
    },

    async openShareModal(file) {
      this.activeShareFile = file;
      this.selectedShareUserId = '';
      this.selectedShareAccessType = 'read';
      this.showShareModal = true;
      if (!this.usersList || this.usersList.length === 0) {
        await this.fetchVaultFiles();
      }
    },

    async submitGrantAccess() {
      if (!this.selectedShareUserId) return;

      this.grantingAccess = true;
      try {
        const payload = {
          file_id: this.activeShareFile.id,
          user_id: this.selectedShareUserId,
          granter_id: this.user.id,
          access_type: this.selectedShareAccessType
        };

        const res = await axios.post('/api/employee/vault/grant-access', payload);

        if (res.data.success) {
          toastSuccess(res.data.message || 'Access granted successfully!');
          this.showShareModal = false;
          this.fetchVaultFiles();
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to grant access.');
      } finally {
        this.grantingAccess = false;
      }
    },

    async revokeAccess(accessId) {
      try {
        const res = await axios.delete(`/api/employee/vault/access/${accessId}`);
        if (res.data.success) {
          toastSuccess('Access revoked.');
          this.fetchVaultFiles();
          if (this.activeShareFile) {
            this.activeShareFile.shared_with = this.activeShareFile.shared_with.filter(s => s.access_id !== accessId);
          }
        }
      } catch (err) {
        toastError('Failed to revoke access.');
      }
    },

    // Helpers
    getFileIcon(filename) {
      if (!filename) return 'fas fa-file';
      const ext = filename.split('.').pop().toLowerCase();
      if (['pdf'].includes(ext)) return 'fas fa-file-pdf';
      if (['doc', 'docx'].includes(ext)) return 'fas fa-file-word';
      if (['xls', 'xlsx', 'csv'].includes(ext)) return 'fas fa-file-excel';
      if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext)) return 'fas fa-file-image';
      if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return 'fas fa-file-archive';
      return 'fas fa-file-alt';
    },

    getFileIconClass(filename) {
      if (!filename) return 'doc-generic';
      const ext = filename.split('.').pop().toLowerCase();
      if (['pdf'].includes(ext)) return 'doc-pdf';
      if (['doc', 'docx'].includes(ext)) return 'doc-word';
      if (['xls', 'xlsx', 'csv'].includes(ext)) return 'doc-excel';
      if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext)) return 'doc-img';
      if (['zip', 'rar'].includes(ext)) return 'doc-zip';
      return 'doc-generic';
    },

    formatCategoryLabel(cat) {
      switch (cat) {
        case 'personal': return 'Personal';
        case 'hr_confidential': return 'HR Confidential';
        case 'contract': return 'Contract';
        case 'payslip': return 'Payslip/Tax';
        default: return 'General';
      }
    },

    formatAccessLabel(access) {
      switch (access) {
        case 'owner': return 'Owner';
        case 'hr_admin': return 'HR Admin';
        case 'write': return 'Read & Write';
        default: return 'Read Only';
      }
    },

    getAccessIcon(access) {
      switch (access) {
        case 'owner': return 'fas fa-crown';
        case 'hr_admin': return 'fas fa-user-shield';
        case 'write': return 'fas fa-pen';
        default: return 'fas fa-eye';
      }
    },

    formatBytes(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.layout {
  min-height: 100vh;
  background: #f4f6fa;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.vault-board-premium {
  flex: 1;
  min-width: 0;
  margin-left: 0;
  max-width: 100%;
  box-sizing: border-box;
}

/* ==================================================== */
/* 🔒 LOCK SCREEN / 2-STEP VERIFICATION STYLES          */
/* ==================================================== */
.vault-lock-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.lock-card-premium {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08);
  width: 100%;
  max-width: 480px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.lock-card-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #2563eb, #7c3aed, #db2777);
}

.lock-shield-halo {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.2);
}

.lock-shield-ico {
  font-size: 2rem;
  color: #2563eb;
}

.security-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.lock-header-text h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.lock-subtitle {
  font-size: 0.86rem;
  color: #64748b;
  margin: 0 0 20px 0;
  line-height: 1.45;
}

.user-verification-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 14px;
  width: 100%;
  margin-bottom: 24px;
  box-sizing: border-box;
}

.user-avatar-mini img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info-mini {
  display: flex;
  flex-direction: column;
  text-align: left;
  flex: 1;
}

.user-name-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.user-email-label {
  font-size: 0.74rem;
  color: #64748b;
}

.hr-badge-pill {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
}

.lock-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.input-field-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}

.input-wrap-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-ico {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.vault-input {
  width: 100%;
  padding: 12px 42px 12px 40px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.vault-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.btn-toggle-eye {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.9rem;
}

.otp-box-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.otp-digit-inputs {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.otp-digit-box {
  width: 48px;
  height: 54px;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  font-size: 1.4rem;
  font-weight: 800;
  text-align: center;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.otp-digit-box:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.timer-resend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  margin-top: 4px;
}

.timer-countdown {
  color: #64748b;
  font-weight: 600;
}

.timer-countdown.expired {
  color: #e11d48;
}

.btn-resend-code {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-resend-code:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.auth-error-banner {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  font-size: 0.8rem;
  padding: 8px 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.btn-lock-action {
  width: 100%;
  padding: 13px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border: none;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-lock-action.unlock {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
}

.btn-lock-action:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-lock-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.otp-actions-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-back-step {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  padding: 6px;
}

.lock-footer-info {
  margin-top: 20px;
  font-size: 0.72rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ==================================================== */
/* 🔓 UNLOCKED VAULT WORKSPACE STYLES                   */
/* ==================================================== */
.vault-workspace {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vault-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 22px 24px;
  border-radius: 18px;
  border: 1px solid #e5eaf2;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.vault-icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.3rem;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
  flex-shrink: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.title-row h2 {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.vault-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}

.hr-indicator-badge {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.vault-subtext {
  font-size: 0.84rem;
  color: #64748b;
  margin: 4px 0 0 0;
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-vault-upload {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.btn-vault-upload:hover {
  transform: translateY(-2px);
}

.btn-vault-lock {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-vault-lock:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* KPI Cards */
.vault-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.vault-kpi-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5eaf2;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.kpi-icon-square {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.kpi-icon-square.blue { background: #eff6ff; color: #2563eb; }
.kpi-icon-square.green { background: #ecfdf5; color: #059669; }
.kpi-icon-square.purple { background: #f5f3ff; color: #7c3aed; }
.kpi-icon-square.amber { background: #fffbeb; color: #d97706; }

.kpi-info {
  display: flex;
  flex-direction: column;
}

.kpi-num {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
}

.kpi-text {
  font-size: 0.74rem;
  font-weight: 600;
  color: #64748b;
}

/* Controls Bar */
.vault-controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 260px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.88rem;
}

.search-bar {
  width: 100%;
  padding: 9px 34px 9px 36px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  font-size: 0.86rem;
  color: #1e293b;
  outline: none;
  box-sizing: border-box;
}

.search-bar:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.filter-tab-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-pill:hover {
  background: #f8fafc;
  color: #1e293b;
}

.tab-pill.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.tab-pill.hr-tab.active {
  background: #7c3aed;
  border-color: #7c3aed;
}

/* Files Table */
.vault-files-container {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e5eaf2;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.loading-state-card,
.empty-state-card {
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loader-icon {
  font-size: 2rem;
  color: #2563eb;
}

.empty-halo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #94a3b8;
}

.empty-state-card h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.empty-state-card p {
  color: #64748b;
  font-size: 0.86rem;
  margin: 0 0 10px 0;
}

.btn-empty-upload {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.files-table-wrapper {
  overflow-x: auto;
}

.vault-files-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.vault-files-table th {
  padding: 14px 18px;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.vault-files-table td {
  padding: 16px 18px;
  font-size: 0.84rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.file-table-row:hover td {
  background: #fafbfc;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-type-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.file-type-icon.doc-pdf { background: #fee2e2; color: #dc2626; }
.file-type-icon.doc-word { background: #eff6ff; color: #2563eb; }
.file-type-icon.doc-excel { background: #ecfdf5; color: #059669; }
.file-type-icon.doc-img { background: #fdf2f8; color: #db2777; }
.file-type-icon.doc-zip { background: #fef3c7; color: #d97706; }
.file-type-icon.doc-generic { background: #f1f5f9; color: #64748b; }

.file-meta-col {
  display: flex;
  flex-direction: column;
}

.file-title {
  font-weight: 700;
  color: #0f172a;
}

.file-desc-sub {
  font-size: 0.72rem;
  color: #94a3b8;
}

.category-tag-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.category-tag-badge.personal { background: #eff6ff; color: #2563eb; }
.category-tag-badge.hr_confidential { background: #f5f3ff; color: #7c3aed; }
.category-tag-badge.contract { background: #fffbeb; color: #d97706; }
.category-tag-badge.payslip { background: #ecfdf5; color: #059669; }
.category-tag-badge.general { background: #f1f5f9; color: #475569; }

.uploader-info-cell {
  display: flex;
  flex-direction: column;
}

.uploader-name {
  font-weight: 600;
  color: #0f172a;
}

.uploader-dept {
  font-size: 0.7rem;
  color: #94a3b8;
}

.access-pill-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.access-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
}

.access-status-badge.owner { background: #fef3c7; color: #b45309; }
.access-status-badge.hr_admin { background: #f5f3ff; color: #7c3aed; }
.access-status-badge.write { background: #ecfdf5; color: #059669; }
.access-status-badge.read { background: #f1f5f9; color: #475569; }

.shared-count-chip {
  font-size: 0.68rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 6px;
  border-radius: 4px;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.8rem;
  transition: all 0.15s ease;
}

.action-btn.download:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.action-btn.share:hover { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }
.action-btn.delete:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

.text-right { text-align: right; }

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.vault-modal-card {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 18px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-ico {
  font-size: 1.2rem;
  color: #2563eb;
}

.modal-title-row h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body-form,
.modal-share-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  padding: 30px 20px;
  text-align: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-dropzone.dragging,
.file-dropzone:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.file-dropzone.has-file {
  border-style: solid;
  border-color: #a7f3d0;
  background: #f0fdf4;
}

.drop-halo {
  font-size: 2rem;
  color: #2563eb;
  margin-bottom: 8px;
}

.drop-main-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.drop-sub-text {
  font-size: 0.74rem;
  color: #64748b;
}

.dropzone-file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.selected-file-ico {
  font-size: 1.8rem;
  color: #059669;
}

.preview-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.preview-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.88rem;
}

.preview-size {
  font-size: 0.72rem;
  color: #64748b;
}

.btn-remove-file {
  background: none;
  border: none;
  color: #e11d48;
  font-size: 1rem;
  cursor: pointer;
}

.form-row-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}

.modal-select,
.modal-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.86rem;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  box-sizing: border-box;
}

.modal-select:focus,
.modal-input:focus {
  border-color: #2563eb;
}

.modal-actions-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.btn-cancel {
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.86rem;
  color: #64748b;
  cursor: pointer;
}

.btn-submit-upload {
  padding: 10px 20px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-submit-upload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.target-file-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
}

.target-file-summary i {
  font-size: 1.5rem;
  color: #2563eb;
}

.target-file-summary strong {
  font-size: 0.88rem;
  color: #0f172a;
}

.target-file-summary p {
  font-size: 0.74rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.share-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.existing-shares-box {
  margin-top: 10px;
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
}

.existing-shares-box h4 {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 8px 0;
}

.shares-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.share-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
}

.share-user-meta {
  display: flex;
  flex-direction: column;
}

.share-user-meta strong {
  font-size: 0.82rem;
  color: #0f172a;
}

.share-user-meta span {
  font-size: 0.72rem;
  color: #64748b;
}

.btn-revoke-share {
  background: none;
  border: none;
  color: #e11d48;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 992px) {
  .vault-header-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-right-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
