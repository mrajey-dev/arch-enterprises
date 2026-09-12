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
                    placeholder="Enter username or email" 
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
          
          <!-- Vault Top Bar -->
          <div class="vault-top-banner">
            <div class="banner-title-area">
              <div class="vault-shield-badge">
                <i class="fas fa-vault"></i>
              </div>
              <div>
                <div class="vault-badge-line">
                  <span class="vault-status-active"><i class="fas fa-check-circle"></i> Vault Active & Unlocked</span>
                  <span v-if="isHrUser" class="hr-indicator-badge"><i class="fas fa-user-shield"></i> HR Management Mode</span>
                </div>
                <h1>{{ isHrUser ? 'HR & Enterprise Security Vault' : 'Employee Security Vault' }}</h1>
                <p class="vault-description">
                  Confidential document repository, HR records, digital signatures & restricted company files.
                </p>
              </div>
            </div>

            <div class="header-right-actions">
              <button class="btn-vault-upload" @click="openUploadStudio">
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

            <div class="vault-kpi-card">
              <div class="kpi-icon-square teal">
                <i class="fas fa-file-signature"></i>
              </div>
              <div class="kpi-info">
                <span class="kpi-num">{{ signedFilesCount }}</span>
                <span class="kpi-text">Digitally Signed</span>
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
                placeholder="Search files by name, uploader, signer, or category..." 
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
                <i class="fas fa-user-lock"></i> Personal
              </button>
              <button 
                v-if="isHrUser"
                class="tab-pill hr-tab" 
                :class="{ active: activeCategory === 'hr_confidential' }"
                @click="activeCategory = 'hr_confidential'"
              >
                <i class="fas fa-building-shield"></i> HR Confidential
              </button>
              <button 
                class="tab-pill" 
                :class="{ active: activeCategory === 'contract' }"
                @click="activeCategory = 'contract'"
              >
                <i class="fas fa-file-contract"></i> Contracts
              </button>
              <button 
                class="tab-pill" 
                :class="{ active: activeCategory === 'payslip' }"
                @click="activeCategory = 'payslip'"
              >
                <i class="fas fa-file-invoice-dollar"></i> Payslips
              </button>
              <button 
                class="tab-pill" 
                :class="{ active: activeCategory === 'signed' }"
                @click="activeCategory = 'signed'"
              >
                <i class="fas fa-certificate"></i> Signed & Verified
              </button>
            </div>
          </div>

          <!-- 📂 Vault Documents Table -->
          <div class="vault-files-container">
            <div v-if="loadingFiles" class="loading-state-card">
              <i class="fas fa-spinner fa-spin loader-icon"></i>
              <p>Decrypting & loading vault records...</p>
            </div>

            <div v-else-if="filteredFiles.length === 0" class="empty-state-card">
              <div class="empty-halo"><i class="fas fa-folder-open"></i></div>
              <h3>No Secured Documents Found</h3>
              <p>Upload contracts, certificates, ID proofs or confidential documents to your encrypted vault.</p>
              <button class="btn-empty-upload" @click="openUploadStudio">
                <i class="fas fa-cloud-upload-alt"></i> Upload First Document
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
                    <th>Digital Signature</th>
                    <th>Upload Date</th>
                    <th>Access</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="file in filteredFiles" :key="file.id" class="file-table-row">
                    <!-- File Name & Info -->
                    <td>
                      <div class="file-name-cell">
                        <div class="file-type-icon" :class="getFileIconClass(file.filename)">
                          <i :class="getFileIcon(file.filename)"></i>
                        </div>
                        <div class="file-meta-col">
                          <div class="d-flex align-center gap-2">
                            <span class="file-title" :title="file.filename">{{ file.filename }}</span>
                            <span v-if="file.is_digitally_signed" class="signed-mini-badge" title="Digitally Signed & Verified">
                              <i class="fas fa-check-circle"></i>
                            </span>
                            <span v-if="file.has_password" class="pwd-mini-badge" title="Password Protected Document">
                              <i class="fas fa-key"></i>
                            </span>
                          </div>
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

                    <!-- Digital Signature Status -->
                    <td>
                      <div v-if="file.is_digitally_signed" class="signature-status-pill verified" @click="openCertificateModal(file)" title="Click to view digital certificate">
                        <div class="sig-status-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="sig-status-text">
                          <span class="sig-status-title">Digitally Signed</span>
                          <small class="sig-signer-name">{{ file.signer_name || file.uploader_name }}</small>
                        </div>
                      </div>
                      <div v-else class="signature-status-pill unsigned" @click="openSignStudio(file)" title="Click to attach digital signature">
                        <div class="sig-status-icon"><i class="fas fa-pen-nib"></i></div>
                        <div class="sig-status-text">
                          <span class="sig-status-title">Not Signed</span>
                          <small class="sig-action-hint">Click to Sign</small>
                        </div>
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

                        <!-- Digital Signature Action Button -->
                        <button 
                          v-if="!file.is_digitally_signed" 
                          class="action-btn sign-btn" 
                          @click="openSignStudio(file)" 
                          title="Attach Digital Signature"
                        >
                          <i class="fas fa-signature"></i>
                        </button>
                        <button 
                          v-else 
                          class="action-btn cert-btn" 
                          @click="openCertificateModal(file)" 
                          title="View Digital Verification Certificate"
                        >
                          <i class="fas fa-award"></i>
                        </button>

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

        <!-- ========================================================================= -->
        <!-- 🚀 ODOO DIGITAL SIGN FULL-SCREEN STUDIO (UPLOAD & SIGN / SIGN EXISTING)  -->
        <!-- ========================================================================= -->
        <div v-if="showSignStudio" class="odoo-fullscreen-studio">
          
          <!-- 1. STUDIO TOP NAVIGATION BAR (ODOO SIGN STYLE) -->
          <header class="odoo-studio-navbar">
            <div class="navbar-left-group">
              <button type="button" class="btn-studio-back" @click="closeSignStudio" title="Discard and return to vault">
                <i class="fas fa-arrow-left"></i>
                <span>Discard & Exit</span>
              </button>
              
              <div class="studio-doc-brand">
                <div class="brand-badge-ico"><i class="fas fa-file-signature"></i></div>
                <div class="brand-text-col">
                  <span class="studio-app-title">Arch Enterprises Digital Sign Studio</span>
                  <div class="studio-active-filename" :title="currentStudioFilename">
                    {{ currentStudioFilename || 'Select or drop a document to begin' }}
                    <span v-if="selectedUploadFile" class="file-size-pill">{{ formatBytes(selectedUploadFile.size) }}</span>
                    <span v-else-if="activeSignFile?.file_size" class="file-size-pill">{{ activeSignFile.file_size }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Center: Multi-page & Zoom Tools (For PDF) -->
            <div class="navbar-center-tools">
              <!-- Page navigation -->
              <div v-if="isPdf && totalPdfPages > 1" class="page-nav-pill">
                <button type="button" class="page-nav-btn" :disabled="currentPdfPage <= 1" @click="prevPdfPage" title="Previous Page">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-nav-counter">Page <strong>{{ currentPdfPage }}</strong> of <strong>{{ totalPdfPages }}</strong></span>
                <button type="button" class="page-nav-btn" :disabled="currentPdfPage >= totalPdfPages" @click="nextPdfPage" title="Next Page">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>

              <!-- Zoom Controls -->
              <div v-if="isPdf" class="zoom-controls-pill">
                <button type="button" class="zoom-btn" @click="zoomOutPdf" title="Zoom Out"><i class="fas fa-minus"></i></button>
                <span class="zoom-level">{{ Math.round(pdfZoom * 100) }}%</span>
                <button type="button" class="zoom-btn" @click="zoomInPdf" title="Zoom In"><i class="fas fa-plus"></i></button>
                <button type="button" class="btn-fit-width" @click="fitPdfWidth" title="Reset / Fit Zoom"><i class="fas fa-expand-alt"></i></button>
              </div>
            </div>

            <!-- Right: Action Button -->
            <div class="navbar-right-group">
              <span v-if="uploadFilePassword" class="pwd-indicator-badge">
                <i class="fas fa-key"></i> Password Protected
              </span>

              <button 
                type="button" 
                class="btn-studio-validate" 
                :disabled="isSavingStudio || (studioMode === 'upload' && !selectedUploadFile)"
                @click="validateAndSignDocument"
              >
                <span v-if="isSavingStudio">
                  <i class="fas fa-spinner fa-spin"></i> Stamping & Encrypting...
                </span>
                <span v-else>
                  <i class="fas fa-check-double"></i>
                  {{ studioMode === 'upload' ? 'Validate & Save to Vault' : 'Validate & Sign Document' }}
                </span>
              </button>
            </div>
          </header>

          <!-- 2. STUDIO SPLIT WORKSPACE: LEFT TOOLS SIDEBAR + RIGHT FULL PDF VIEWPORT -->
          <div class="odoo-studio-body">
            
            <!-- 👈 LEFT SIDEBAR: Document Metadata & Signature Tools -->
            <aside class="odoo-studio-sidebar custom-scrollbar">
              
              <!-- SECTION A: Document Source (If Upload Mode) -->
              <div v-if="studioMode === 'upload'" class="sidebar-block">
                <div class="block-header">
                  <span class="block-number">1</span>
                  <h4>Document Upload</h4>
                </div>

                <input 
                  type="file" 
                  ref="studioFileInput" 
                  accept=".pdf,image/png,image/jpeg,image/webp" 
                  style="display: none" 
                  @change="handleStudioFileSelect" 
                />

                <div 
                  v-if="!selectedUploadFile"
                  class="studio-dropzone" 
                  :class="{ 'dragging': isDraggingFile }"
                  @dragover.prevent="isDraggingFile = true"
                  @dragleave.prevent="isDraggingFile = false"
                  @drop.prevent="handleStudioFileDrop"
                  @click="$refs.studioFileInput.click()"
                >
                  <div class="drop-icon-halo"><i class="fas fa-cloud-upload-alt"></i></div>
                  <p class="drop-primary">Click or drop document here</p>
                  <span class="drop-secondary">PDF, PNG, JPG (Full PDF rendering)</span>
                </div>

                <div v-else class="studio-selected-file-card">
                  <div class="file-card-ico"><i :class="getFileIcon(selectedUploadFile.name)"></i></div>
                  <div class="file-card-details">
                    <strong class="file-card-name">{{ selectedUploadFile.name }}</strong>
                    <span class="file-card-size">{{ formatBytes(selectedUploadFile.size) }}</span>
                  </div>
                  <button type="button" class="btn-change-file" @click="$refs.studioFileInput.click()" title="Change Document">
                    <i class="fas fa-sync-alt"></i>
                  </button>
                </div>

                <!-- Category & Notes -->
                <div class="sidebar-field-group mt-3">
                  <label>Document Category</label>
                  <select v-model="uploadCategory" class="sidebar-select">
                    <option value="personal">🔒 Personal Confidential Document</option>
                    <option v-if="isHrUser" value="hr_confidential">🏢 HR / Company Confidential</option>
                    <option value="contract">📜 Employment Contract & Offer Letter</option>
                    <option value="payslip">💰 Payslip / Tax Declaration</option>
                    <option value="general">📁 General Secured File</option>
                  </select>
                </div>

                <div class="sidebar-field-group mt-2">
                  <label>Description (Optional)</label>
                  <input v-model="uploadDescription" type="text" placeholder="e.g. FY 2026 Appraisal Contract Signed" class="sidebar-input" />
                </div>

                <!-- Password Protection Field with Eye Toggle -->
                <div class="sidebar-field-group mt-2">
                  <label class="d-flex justify-between align-center">
                    <span><i class="fas fa-key text-amber"></i> Document Password</span>
                    <small class="text-muted">Optional</small>
                  </label>
                  <div class="sidebar-input-wrap">
                    <i class="fas fa-lock input-prefix-icon"></i>
                    <input 
                      v-model="uploadFilePassword" 
                      :type="showUploadPassword ? 'text' : 'password'" 
                      placeholder="Enter password to lock this document" 
                      class="sidebar-input with-prefix with-suffix"
                    />
                    <button type="button" class="btn-toggle-eye-sidebar" @click="showUploadPassword = !showUploadPassword">
                      <i :class="showUploadPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- SECTION B: Digital Signature Creator (Odoo Style) -->
              <div class="sidebar-block">
                <div class="block-header">
                  <span class="block-number">{{ studioMode === 'upload' ? '2' : '1' }}</span>
                  <h4>Digital Signature</h4>
                </div>

                <!-- Mode Switcher Tabs -->
                <div class="odoo-sig-tabs">
                  <button type="button" class="odoo-tab-btn" :class="{ active: signatureMode === 'draw' }" @click="setSignatureMode('draw')">
                    <i class="fas fa-pen-nib"></i> Draw
                  </button>
                  <button type="button" class="odoo-tab-btn" :class="{ active: signatureMode === 'type' }" @click="setSignatureMode('type')">
                    <i class="fas fa-font"></i> Type
                  </button>
                  <button type="button" class="odoo-tab-btn" :class="{ active: signatureMode === 'upload' }" @click="setSignatureMode('upload')">
                    <i class="fas fa-image"></i> Upload
                  </button>
                  <button type="button" class="odoo-tab-btn" :class="{ active: signatureMode === 'seal' }" @click="setSignatureMode('seal')">
                    <i class="fas fa-certificate"></i> Seal
                  </button>
                </div>

                <!-- 1. DRAW SIGNATURE -->
                <div v-show="signatureMode === 'draw'" class="tab-content-pane">
                  <div class="canvas-toolbar">
                    <div class="pen-palette">
                      <button 
                        type="button" 
                        v-for="c in penColors" 
                        :key="c.hex" 
                        class="pen-color-dot" 
                        :class="{ active: penColor === c.hex }" 
                        :style="{ backgroundColor: c.hex }" 
                        @click="penColor = c.hex" 
                        :title="c.name"
                      ></button>
                    </div>
                    <div class="toolbar-btn-group">
                      <button type="button" class="btn-clear-drawing" @click="clearDrawCanvas" title="Clear Canvas">
                        <i class="fas fa-eraser"></i> Clear
                      </button>
                      <button 
                        type="button" 
                        class="btn-drag-to-doc" 
                        :class="{ active: isDragModeActive }"
                        @click="toggleDragMode"
                        title="Toggle drag-to-document mode"
                      >
                        <i class="fas fa-hand-paper"></i>
                        {{ isDragModeActive ? 'Dragging...' : 'Drag to Doc' }}
                      </button>
                    </div>
                  </div>

                  <div class="draw-canvas-container">
                    <canvas 
                      ref="studioDrawCanvas" 
                      class="studio-draw-canvas" 
                      width="420" 
                      height="130"
                      @mousedown="startDrawing"
                      @mousemove="draw"
                      @mouseup="stopDrawing"
                      @mouseleave="stopDrawing"
                      @touchstart="handleTouchStart"
                      @touchmove="handleTouchMove"
                      @touchend="stopDrawing"
                    ></canvas>
                    <div class="canvas-sign-guideline">
                      <span><i class="fas fa-pen"></i> Sign above this line</span>
                    </div>
                  </div>
                </div>

                <!-- 2. TYPE SIGNATURE -->
                <div v-show="signatureMode === 'type'" class="tab-content-pane">
                  <div class="sidebar-field-group">
                    <input 
                      v-model="typedSignatureName" 
                      type="text" 
                      placeholder="Type your legal full name" 
                      class="sidebar-input"
                    />
                  </div>

                  <div class="font-styles-selection-list">
                    <div 
                      v-for="f in fontStyles" 
                      :key="f.class" 
                      class="font-choice-card" 
                      :class="{ active: typedFontClass === f.class }"
                      @click="typedFontClass = f.class"
                    >
                      <span :class="['font-preview-text', f.class]">
                        {{ typedSignatureName || user.name || 'Your Signature' }}
                      </span>
                      <small class="font-label-name">{{ f.name }}</small>
                    </div>
                  </div>

                  <div class="drag-mode-row mt-2">
                    <button 
                      type="button" 
                      class="btn-drag-to-doc" 
                      :class="{ active: isDragModeActive }"
                      @click="toggleDragMode"
                    >
                      <i class="fas fa-hand-paper"></i>
                      {{ isDragModeActive ? 'Dragging on Doc...' : 'Drag to Doc' }}
                    </button>
                  </div>
                </div>

                <!-- 3. UPLOAD IMAGE SIGNATURE -->
                <div v-show="signatureMode === 'upload'" class="tab-content-pane">
                  <input 
                    type="file" 
                    ref="sigImageFileInput" 
                    accept="image/png, image/jpeg, image/webp" 
                    style="display: none" 
                    @change="handleSigImageUpload" 
                  />

                  <div v-if="!uploadedSignatureImage" class="sig-upload-box" @click="$refs.sigImageFileInput.click()">
                    <i class="fas fa-image text-emerald"></i>
                    <span>Click to upload transparent signature image (PNG / JPG)</span>
                  </div>

                  <div v-else class="sig-uploaded-preview">
                    <img :src="uploadedSignatureImage" alt="Signature preview" />
                    <div class="sig-preview-actions">
                      <button type="button" class="btn-remove-sig-img" @click.stop="uploadedSignatureImage = null">
                        <i class="fas fa-times"></i> Remove
                      </button>
                      <button 
                        type="button" 
                        class="btn-drag-to-doc" 
                        :class="{ active: isDragModeActive }"
                        @click="toggleDragMode"
                      >
                        <i class="fas fa-hand-paper"></i>
                        {{ isDragModeActive ? 'Dragging...' : 'Drag to Doc' }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 4. OFFICIAL SEAL -->
                <div v-show="signatureMode === 'seal'" class="tab-content-pane">
                  <div class="enterprise-seal-box">
                    <div class="seal-icon-halo"><i class="fas fa-shield-alt"></i></div>
                    <div class="seal-details">
                      <strong>{{ user.name || 'Authorized Signatory' }}</strong>
                      <span>{{ user.department || 'Arch Enterprises' }} • Official AES-256 Seal</span>
                    </div>
                  </div>
                  <div class="drag-mode-row mt-2">
                    <button 
                      type="button" 
                      class="btn-drag-to-doc" 
                      :class="{ active: isDragModeActive }"
                      @click="toggleDragMode"
                    >
                      <i class="fas fa-hand-paper"></i>
                      {{ isDragModeActive ? 'Dragging on Doc...' : 'Drag to Doc' }}
                    </button>
                  </div>
                </div>

                <!-- 🔒 LIVE DIGITAL AUDIT TRAIL (DATE, TIMESTAMP, IP) IN SIGNATURE SECTION -->
                <div class="sig-audit-metadata-card mt-3">
                  <div class="sig-audit-header">
                    <i class="fas fa-shield-alt text-emerald"></i>
                    <span>Arch Enterprises Security Audit</span>
                  </div>
                  <div class="sig-audit-grid">
                    <div class="sig-audit-item">
                      <span class="sig-audit-label"><i class="far fa-calendar-alt"></i> Signing Date</span>
                      <span class="sig-audit-val bold">{{ stampCurrentDate || todayDateFormatted }}</span>
                    </div>
                    <div class="sig-audit-item">
                      <span class="sig-audit-label"><i class="far fa-clock"></i> Timestamp</span>
                      <span class="sig-audit-val bold font-mono">{{ stampCurrentTime || todayTimeFormatted }}</span>
                    </div>
                    <div class="sig-audit-item ip-span">
                      <span class="sig-audit-label"><i class="fas fa-network-wired"></i> Current Device IP</span>
                      <span class="sig-audit-val bold font-mono ip-val">{{ currentDeviceIp || 'Fetching IP...' }}</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- SECTION C: Signer Credentials & Placement Options -->
              <div class="sidebar-block">
                <div class="block-header">
                  <span class="block-number">{{ studioMode === 'upload' ? '3' : '2' }}</span>
                  <h4>Signer Credentials & Stamp</h4>
                </div>

                <div class="sidebar-field-group">
                  <label>Signatory Name</label>
                  <input v-model="signerName" type="text" class="sidebar-input" />
                </div>

                <div class="sidebar-field-group mt-2">
                  <label>Department / Authority</label>
                  <input v-model="signerDept" type="text" class="sidebar-input" />
                </div>

                <div class="sidebar-field-group mt-2">
                  <label>Signing Reason / Purpose</label>
                  <select v-model="signatureReason" class="sidebar-select">
                    <option value="Digitally Authenticated & Approved">🔒 Digitally Authenticated & Approved</option>
                    <option value="Verified & Confirmed by Employee">✅ Verified & Confirmed by Employee</option>
                    <option value="HR Official Acknowledgment">🏢 HR Official Acknowledgment</option>
                    <option value="Employment Agreement Accepted">📜 Employment Agreement Accepted</option>
                    <option value="Legal & Financial Authorization">💼 Legal & Financial Authorization</option>
                  </select>
                </div>

                <!-- Digital Security Info Note -->
                <div class="digital-cert-info-card mt-3">
                  <div class="cert-card-header">
                    <i class="fas fa-shield-alt text-primary"></i>
                    <span>Arch Enterprises Security Seal</span>
                  </div>
                  <p class="cert-card-desc">
                    Your digital signature, live timestamp, and client device IP will be cryptographically embedded with this document in the Security Vault.
                  </p>
                  <div class="cert-card-pill">
                    <i class="fas fa-fingerprint"></i>
                    <span>Arch Enterprises AES-256 Audit Trail</span>
                  </div>
                </div>

              </div>

            </aside>

            <!-- 👉 RIGHT VIEWPORT: FULL REAL PDF DOCUMENT -->
            <main 
              class="odoo-studio-viewport" 
              ref="pdfViewportContainer"
              @mousemove="isDragModeActive ? onDragStamp($event) : null"
              @mouseup="isDragModeActive ? stopDragStamp() : null"
              @mouseleave="isDragModeActive ? stopDragStamp() : null"
              @touchmove="isDragModeActive ? onDragStampTouch($event) : null"
              @touchend="isDragModeActive ? stopDragStamp() : null"
            >
              
              <!-- State A: Loading PDF -->
              <div v-if="loadingPdf" class="viewport-loader">
                <i class="fas fa-spinner fa-spin loader-spin-ico"></i>
                <p>Loading & Rendering Full PDF Document...</p>
              </div>

              <!-- State B: No Document Selected Yet (Upload Mode) -->
              <div v-else-if="!selectedUploadFile && studioMode === 'upload'" class="viewport-empty-stage" @click="$refs.studioFileInput.click()">
                <div class="empty-stage-halo"><i class="fas fa-file-pdf"></i></div>
                <h3>No Document Selected</h3>
                <p>Select or drag a PDF document into the studio to preview.</p>
                <button type="button" class="btn-browse-stage"><i class="fas fa-folder-open"></i> Browse PDF / Image</button>
              </div>

              <!-- State C: REAL DOCUMENT RENDERED (PDF or Image) -->
              <div v-else class="pdf-stage-scroll-area">
                
                <div 
                  class="pdf-canvas-wrapper" 
                  ref="pdfCanvasContainer"
                  :style="{ transform: `scale(${pdfZoom})`, transformOrigin: 'top center' }"
                  @click="isDragModeActive ? onPdfCanvasClick($event) : null"
                >
                  <!-- 1a. When drag mode active: canvas pages (stamp scrolls with content) -->
                  <div v-if="isDragModeActive && isPdf" class="pdf-canvas-pages-stack">
                    <canvas
                      v-for="(pg, idx) in dragPdfPages"
                      :key="idx"
                      class="pdf-drag-page-canvas"
                      :width="pg.width"
                      :height="pg.height"
                      :ref="'dragPageCanvas_' + idx"
                      :style="{ width: pg.cssWidth + 'px', height: pg.cssHeight + 'px' }"
                    ></canvas>
                    <div v-if="dragPdfPages.length === 0" class="drag-pdf-loading">
                      <i class="fas fa-spinner fa-spin"></i> Rendering PDF pages...
                    </div>
                  </div>

                  <!-- 1b. Normal iframe view (non-drag mode) -->
                  <iframe 
                    v-else-if="isPdf && pdfBlobUrl && !isDragModeActive" 
                    :src="pdfBlobUrl" 
                    class="real-pdf-iframe" 
                    :class="{ 'is-dragging-active': isDraggingStamp }"
                    title="Full PDF Document"
                  ></iframe>

                  <!-- 2. Real Image (If document is PNG/JPG) -->
                  <img v-else-if="isImage" :src="imagePreviewUrl" class="real-image-preview" alt="Document Preview" />

                  <!-- 🏷️ DRAGGABLE SIGNATURE STAMP OVERLAY (drag mode: absolute pixel position within stacked canvases) -->
                  <div 
                    v-if="isDragModeActive"
                    class="interactive-odoo-stamp" 
                    :class="[stampSize, { 'is-dragging': isDraggingStamp }]"
                    :style="{ left: stampPosAbsX + 'px', top: stampPosAbsY + 'px', position: 'absolute', transform: 'translate(-50%, -50%)' }"
                    @mousedown.stop="startDragStamp"
                    @touchstart.stop="startDragStampTouch"
                    title="Drag to place signature anywhere on this document"
                  >
                    <!-- Drag handle header -->
                    <div class="stamp-header-badge">
                      <i class="fas fa-arrows-alt"></i>
                      <span>Drag to Place</span>
                    </div>

                    <!-- Stamp Body Content -->
                    <div class="stamp-render-area">
                      <!-- A. Drawn Signature -->
                      <div v-if="signatureMode === 'draw'" class="stamp-draw-view">
                        <img v-if="drawnSignatureData" :src="drawnSignatureData" class="stamp-sig-img" alt="Signature" />
                        <span v-else class="stamp-placeholder-hint"><i class="fas fa-pen-nib"></i> Draw on left panel</span>
                      </div>

                      <!-- B. Typed Signature -->
                      <div v-else-if="signatureMode === 'type'" class="stamp-type-view">
                        <span :class="['stamp-font-styled', typedFontClass]">
                          {{ typedSignatureName || signerName || user.name || 'Authorized Signatory' }}
                        </span>
                      </div>

                      <!-- C. Uploaded Image Signature -->
                      <div v-else-if="signatureMode === 'upload'" class="stamp-upload-view">
                        <img v-if="uploadedSignatureImage" :src="uploadedSignatureImage" class="stamp-sig-img" alt="Signature" />
                        <span v-else class="stamp-placeholder-hint"><i class="fas fa-image"></i> Upload on left</span>
                      </div>

                      <!-- D. Seal -->
                      <div v-else-if="signatureMode === 'seal'" class="stamp-seal-view">
                        <i class="fas fa-certificate text-gold"></i>
                        <div class="seal-txt">
                          <strong>{{ signerName || user.name }}</strong>
                          <small>{{ signerDept || user.department || 'Arch Enterprises' }}</small>
                        </div>
                      </div>

                      <!-- Stamp Footer -->
                      <div class="stamp-footer-row">
                        <div class="signer-tag">
                          <i class="fas fa-user-check"></i> {{ signerName || user.name }}
                        </div>
                        <div class="stamp-meta-line">
                          <span><i class="far fa-calendar-alt"></i> {{ stampCurrentDate || todayDateFormatted }}</span>
                          <span><i class="far fa-clock"></i> {{ stampCurrentTime || todayTimeFormatted }}</span>
                        </div>
                        <div class="stamp-audit-row">
                          <span class="stamp-ip-badge"><i class="fas fa-network-wired"></i> IP: {{ currentDeviceIp || 'Detecting...' }}</span>
                          <span class="verified-tag"><i class="fas fa-shield-alt"></i> ARCH ENTERPRISES</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </main>

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

        <!-- ==================================================== -->
        <!-- 📜 MODAL 3: DIGITAL VERIFICATION CERTIFICATE VIEWER  -->
        <!-- ==================================================== -->
        <div v-if="showCertificateModal" class="modal-backdrop" @click.self="showCertificateModal = false">
          <div class="vault-modal-card certificate-modal-card">
            <div class="modal-header cert-header">
              <div class="modal-title-row">
                <i class="fas fa-award modal-ico text-gold"></i>
                <h3>Digital Signature Certificate</h3>
              </div>
              <button class="btn-close-modal" @click="showCertificateModal = false">&times;</button>
            </div>

            <div class="certificate-container" id="printableCertificate">
              <!-- Official Certificate Header -->
              <div class="cert-banner">
                <div class="cert-logo-row">
                  <div class="cert-brand">
                    <i class="fas fa-shield-alt"></i>
                    <span>ARCH ENTERPRISES SECURITY VAULT</span>
                  </div>
                  <div class="cert-badge-valid">
                    <i class="fas fa-check-circle"></i> VERIFIED & AUTHENTIC
                  </div>
                </div>
                <h2>Digital Verification Certificate</h2>
                <p class="cert-subtitle">Cryptographic Verification & Digital Signature Audit Trail</p>
              </div>

              <!-- Certificate Body Grid -->
              <div class="cert-body-grid">
                <!-- Document Info Box -->
                <div class="cert-info-card">
                  <div class="card-header-mini"><i class="fas fa-file-contract"></i> Secured Document Details</div>
                  <div class="cert-key-val">
                    <span class="key">Document Name:</span>
                    <span class="val bold">{{ activeCertData?.filename }}</span>
                  </div>
                  <div class="cert-key-val">
                    <span class="key">File Size:</span>
                    <span class="val">{{ activeCertData?.file_size }}</span>
                  </div>
                  <div class="cert-key-val">
                    <span class="key">Category:</span>
                    <span class="val">{{ formatCategoryLabel(activeCertData?.category) }}</span>
                  </div>
                  <div class="cert-key-val">
                    <span class="key">Vault Document ID:</span>
                    <span class="val">#{{ activeCertData?.document_id || activeCertData?.id }}</span>
                  </div>
                </div>

                <!-- Signer Info Box -->
                <div class="cert-info-card">
                  <div class="card-header-mini"><i class="fas fa-user-check"></i> Signatory Credentials</div>
                  <div class="cert-key-val">
                    <span class="key">Signer Name:</span>
                    <span class="val bold">{{ activeCertData?.signer_name }}</span>
                  </div>
                  <div class="cert-key-val">
                    <span class="key">Department:</span>
                    <span class="val">{{ activeCertData?.signer_department || 'Arch Enterprises' }}</span>
                  </div>
                  <div class="cert-key-val">
                    <span class="key">Signing Timestamp:</span>
                    <span class="val">{{ activeCertData?.signed_at }}</span>
                  </div>
                  <div class="cert-key-val">
                    <span class="key">Device IP Address:</span>
                    <span class="val bold" style="color: #0369a1; font-family: monospace;">{{ activeCertData?.client_ip || activeCertData?.metadata?.client_ip || 'Captured' }}</span>
                  </div>
                  <div class="cert-key-val">
                    <span class="key">Purpose / Reason:</span>
                    <span class="val italic">{{ activeCertData?.signature_reason || 'Digitally Authenticated' }}</span>
                  </div>
                </div>
              </div>

              <!-- Visual Signature Box -->
              <div class="cert-signature-showcase">
                <div class="sig-seal-column">
                  <div class="official-stamp-graphic">
                    <div class="stamp-inner-circle">
                      <i class="fas fa-shield-alt"></i>
                      <span>DIGITALLY SIGNED</span>
                      <small>ARCH ENTERPRISES</small>
                    </div>
                  </div>
                </div>
                <div class="sig-image-column">
                  <label>Official Signature Representation:</label>
                  <div class="sig-render-box">
                    <img v-if="activeCertData?.signature_data && isBase64OrUrl(activeCertData?.signature_data)" :src="activeCertData?.signature_data" alt="Digital Signature" class="cert-rendered-sig-img" />
                    <div v-else class="cert-text-signature">{{ activeCertData?.signature_data || activeCertData?.signer_name }}</div>
                  </div>
                </div>
              </div>

              <!-- Cryptographic Verification Bar -->
              <div class="cert-crypto-bar">
                <div class="crypto-hash-block">
                  <span class="hash-label">CERTIFICATE HASH / TOKEN:</span>
                  <code class="hash-code">{{ activeCertData?.certificate_hash || activeCertData?.signature_hash }}</code>
                </div>
                <button type="button" class="btn-copy-hash" @click="copyHash(activeCertData?.certificate_hash || activeCertData?.signature_hash)" title="Copy Hash">
                  <i class="fas fa-copy"></i>
                </button>
              </div>

              <div class="cert-footer-disclaimer">
                <i class="fas fa-lock"></i>
                <span>This document certificate has been cryptographically generated and stored within the Arch Enterprises AES-256 Encrypted Security Vault. Authenticated and tamper-evident.</span>
              </div>
            </div>

            <div class="modal-actions-footer cert-modal-actions">
              <button type="button" class="btn-cancel" @click="showCertificateModal = false">Close</button>
              <button type="button" class="btn-print-cert" @click="printCertificate">
                <i class="fas fa-print"></i> Print / Save Certificate
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { PDFDocument } from 'pdf-lib';
import Sidebar from '@/views/employee/components/Sidebar.vue';
import AdminSidebar from '@/components/Sidebar.vue';
import { toastSuccess, toastError, toastWarning, toastInfo } from '@/utils/toast.js';

// Configure bundled pdfjs worker
if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

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
        if (u && (u.id || u.email || u.name)) {
          return u;
        }
        const adminEmail = localStorage.getItem('admin_email');
        const adminName = localStorage.getItem('admin_name');
        if (adminEmail || adminName) {
          return {
            id: 1,
            name: adminName || 'Admin',
            email: adminEmail || 'admin@archenterprises.co.in',
            department: 'Management',
            role: 'admin'
          };
        }
        return {};
      } catch (e) {
        return {};
      }
    })();

    const initPhoto = (() => {
      try {
        if (localUser && localUser.id) {
          const cached = localStorage.getItem(`profilePhoto_${localUser.id}`);
          if (cached) return cached;
        }
        if (localUser && typeof localUser.profile_photo === 'string' && localUser.profile_photo.includes('/')) {
          return `https://employees.archenterprises.co.in/backend/public/storage/${localUser.profile_photo}`;
        }
        const adminPhoto = localStorage.getItem('admin_photo');
        if (adminPhoto) return adminPhoto;
      } catch (e) {}
      return 'https://cdn-icons-png.flaticon.com/512/219/219983.png';
    })();

    // Check if vault session exists in sessionStorage
    const isUnlocked = sessionStorage.getItem('arch_vault_unlocked') === 'true';

    return {
      isMobile: window.innerWidth <= 768,
      isSidebarVisible: true,
      user: localUser,
      authEmail: (localUser.email || localUser.name || '').trim(),
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

      // 🚀 FULL-SCREEN ODOO DIGITAL SIGN STUDIO STATE
      showSignStudio: false,
      studioMode: 'upload', // 'upload' | 'sign_existing'
      selectedUploadFile: null,
      activeSignFile: null,
      uploadCategory: 'personal',
      uploadDescription: '',
      uploadFilePassword: '',
      showUploadPassword: false,
      isDraggingFile: false,

      // PDF & Document Rendering State
      pdfRawBuffer: null,
      pdfBlobUrl: null,
      pdfDocProxy: null,
      totalPdfPages: 1,
      currentPdfPage: 1,
      pdfZoom: 1.0,
      loadingPdf: false,
      isPdf: false,
      isImage: false,
      imagePreviewUrl: null,
      // Canvas-based drag mode rendering
      dragPdfPages: [],       // [{width, height, dataUrl}, ...] for each page
      stampPosAbsY: 0,        // absolute Y in pixels from top of stacked pages
      stampPosAbsX: 0,        // absolute X in pixels from left of page

      // Signature Studio Settings
      signatureMode: 'draw', // 'draw', 'type', 'upload', 'seal'
      drawnSignatureData: null,
      typedSignatureName: localUser.name || '',
      typedFontClass: 'sig-font-1',
      uploadedSignatureImage: null,
      signerName: localUser.name || 'Authorized Signatory',
      signerDept: localUser.department || 'Arch Enterprises',
      signatureReason: 'Digitally Authenticated & Approved',

      // Interactive Draggable Stamp State
      stampPosX: 50, // percentage (0 - 100)
      stampPosY: 80, // percentage (0 - 100)
      stampPage: 1,  // page number where stamp is located
      stampSize: 'medium', // 'small', 'medium', 'large'
      isDraggingStamp: false,
      isDragModeActive: false, // toggled by "Drag to Doc" button
      isSavingStudio: false,
      currentDeviceIp: '',
      stampCurrentDate: '',
      stampCurrentTime: '',
      stampClockInterval: null,

      // Drawing canvas internal state
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      penColor: '#0f172a',
      penColors: [
        { name: 'Deep Slate', hex: '#0f172a' },
        { name: 'Royal Navy', hex: '#1e3a8a' },
        { name: 'Emerald Seal', hex: '#065f46' },
        { name: 'Crimson Red', hex: '#991b1b' }
      ],
      fontStyles: [
        { name: 'Elegance Script', class: 'sig-font-1' },
        { name: 'Executive Flow', class: 'sig-font-2' },
        { name: 'Modern Signature', class: 'sig-font-3' },
        { name: 'Formal Calligraphy', class: 'sig-font-4' }
      ],

      // 📜 Digital Certificate Modal State
      showCertificateModal: false,
      activeCertData: null,
      loadingCertificate: false,

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
    todayDateCode() {
      const d = new Date();
      return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    },
    todayDateFormatted() {
      const d = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    },
    todayTimeFormatted() {
      const d = new Date();
      return d.toLocaleTimeString('en-US', { hour12: true });
    },
    isAdminOrHrContext() {
      const role = String(this.user?.role || '').trim().toLowerCase();
      if (this.user?.id && role !== 'admin' && role !== 'superadmin') {
        return false;
      }
      return role === 'admin' || role === 'superadmin';
    },
    isHrUser() {
      const dept = String(this.user?.department || '').trim().toLowerCase();
      const role = String(this.user?.role || '').trim().toLowerCase();
      return role === 'admin' || role === 'superadmin' || role === 'hr' || role === 'owner' || dept === 'hr' || dept === 'human resources';
    },
    myFilesCount() {
      return this.files.filter(f => f.is_owner).length;
    },
    sharedWithMeCount() {
      return this.files.filter(f => !f.is_owner).length;
    },
    signedFilesCount() {
      return this.files.filter(f => f.is_digitally_signed).length;
    },
    hrFilesCount() {
      return this.files.filter(f => f.category === 'hr_confidential').length;
    },
    filteredFiles() {
      return this.files.filter(file => {
        if (this.activeCategory === 'personal' && file.category !== 'personal') return false;
        if (this.activeCategory === 'hr_confidential' && file.category !== 'hr_confidential') return false;
        if (this.activeCategory === 'contract' && file.category !== 'contract') return false;
        if (this.activeCategory === 'payslip' && file.category !== 'payslip') return false;
        if (this.activeCategory === 'signed' && !file.is_digitally_signed) return false;

        if (this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase();
          const matchName = file.filename && file.filename.toLowerCase().includes(q);
          const matchUploader = file.uploader_name && file.uploader_name.toLowerCase().includes(q);
          const matchSigner = file.signer_name && file.signer_name.toLowerCase().includes(q);
          const matchDesc = file.description && file.description.toLowerCase().includes(q);
          return matchName || matchUploader || matchSigner || matchDesc;
        }

        return true;
      });
    },
    currentStudioFilename() {
      if (this.studioMode === 'upload') {
        return this.selectedUploadFile ? this.selectedUploadFile.name : '';
      }
      return this.activeSignFile ? this.activeSignFile.filename : '';
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    if (this.isVaultUnlocked) {
      this.fetchVaultFiles();
    }
    this.fetchDeviceIp();
    this.startStampClock();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.stampClockInterval) {
      clearInterval(this.stampClockInterval);
    }
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    },

    async fetchDeviceIp() {
      // 1. Try public IP service with fast timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.ip) {
            this.currentDeviceIp = data.ip;
            return;
          }
        }
      } catch (e) {
        // Fallback to backend
      }

      // 2. Fallback to server's client-ip endpoint
      try {
        const res = await axios.get('/api/employee/vault/client-ip');
        if (res.data && res.data.ip) {
          this.currentDeviceIp = res.data.ip;
          return;
        }
      } catch (e) {
        // Fallback
      }

      if (!this.currentDeviceIp) {
        this.currentDeviceIp = '127.0.0.1';
      }
    },

    startStampClock() {
      this.updateStampClock();
      if (this.stampClockInterval) clearInterval(this.stampClockInterval);
      this.stampClockInterval = setInterval(() => {
        this.updateStampClock();
      }, 1000);
    },

    updateStampClock() {
      const d = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.stampCurrentDate = `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
      this.stampCurrentTime = d.toLocaleTimeString('en-US', { hour12: true });
    },

    // 🔐 2-STEP OTP & AUTHENTICATION
    async requestVaultOtp() {
      this.authError = '';
      this.sendingOtp = true;
      try {
        const payload = {
          user_id: this.user.id || null,
          email: this.authEmail,
          password: this.password
        };

        const res = await axios.post('/api/employee/vault/request-otp', payload);
        if (res.data.success) {
          toastSuccess(res.data.message || 'Verification OTP dispatched to your registered email!');
          this.currentStep = 2;
          this.startOtpTimer();
          this.$nextTick(() => {
            if (this.$refs.otpInputRefs && this.$refs.otpInputRefs[0]) {
              this.$refs.otpInputRefs[0].focus();
            }
          });
        }
      } catch (err) {
        this.authError = err.response?.data?.message || 'Authentication failed. Please verify your credentials.';
        toastError(this.authError);
      } finally {
        this.sendingOtp = false;
        this.resendingOtp = false;
      }
    },

    startOtpTimer() {
      this.timerSeconds = 600;
      if (this.timerInterval) clearInterval(this.timerInterval);
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
      if (val.length === 1 && index < 5) {
        this.$nextTick(() => {
          this.$refs.otpInputRefs[index + 1]?.focus();
        });
      }
    },

    handleOtpKeydown(index, event) {
      if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
        this.$nextTick(() => {
          this.$refs.otpInputRefs[index - 1]?.focus();
        });
      }
    },

    handleOtpPaste(event) {
      event.preventDefault();
      const pasteData = (event.clipboardData || window.clipboardData).getData('text').trim();
      if (/^\d{6}$/.test(pasteData)) {
        for (let i = 0; i < 6; i++) {
          this.otpDigits[i] = pasteData[i];
        }
        this.$refs.otpInputRefs[5]?.focus();
      }
    },

    async verifyVaultOtp() {
      if (this.otpCode.length < 6) {
        this.authError = 'Please enter all 6 digits of the OTP.';
        return;
      }

      this.authError = '';
      this.verifyingOtp = true;
      try {
        const payload = {
          user_id: this.user.id || null,
          email: this.authEmail,
          otp: this.otpCode
        };

        const res = await axios.post('/api/employee/vault/verify-otp', payload);
        if (res.data.success) {
          toastSuccess('Security Vault unlocked successfully!');
          this.isVaultUnlocked = true;
          sessionStorage.setItem('arch_vault_unlocked', 'true');
          if (res.data.user) {
            this.user = { ...this.user, ...res.data.user };
          }
          await this.fetchVaultFiles();
        }
      } catch (err) {
        this.authError = err.response?.data?.message || 'Invalid or expired OTP code.';
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

    lockVault() {
      this.isVaultUnlocked = false;
      sessionStorage.removeItem('arch_vault_unlocked');
      this.currentStep = 1;
      this.password = '';
      this.otpDigits = ['', '', '', '', '', ''];
      toastInfo('Security Vault locked.');
    },

    // 📁 LOAD VAULT FILES
    async fetchVaultFiles() {
      this.loadingFiles = true;
      try {
        const res = await axios.get('/api/employee/vault/files', {
          params: {
            user_id: this.user.id,
            email: this.user.email
          }
        });

        if (res.data.success) {
          this.files = res.data.files || [];
          this.usersList = res.data.users || [];
        }
      } catch (err) {
        toastError('Failed to fetch secured vault documents.');
      } finally {
        this.loadingFiles = false;
      }
    },

    // =========================================================================
    // 🚀 FULL-SCREEN ODOO DIGITAL SIGN STUDIO METHODS
    // =========================================================================
    openUploadStudio() {
      this.studioMode = 'upload';
      this.selectedUploadFile = null;
      this.activeSignFile = null;
      this.uploadCategory = 'personal';
      this.uploadDescription = '';
      this.uploadFilePassword = '';
      this.showUploadPassword = false;
      this.pdfRawBuffer = null;
      if (this.pdfBlobUrl) {
        URL.revokeObjectURL(this.pdfBlobUrl);
        this.pdfBlobUrl = null;
      }
      this.pdfDocProxy = null;
      this.totalPdfPages = 1;
      this.currentPdfPage = 1;
      this.pdfZoom = 1.0;
      this.isPdf = false;
      this.isImage = false;
      this.imagePreviewUrl = null;
      this.stampPosX = 70;
      this.stampPosY = 80;
      this.stampPage = 1;
      this.stampSize = 'medium';
      this.signatureMode = 'draw';
      this.typedSignatureName = this.user.name || '';
      this.signerName = this.user.name || 'Authorized Signatory';
      this.signerDept = this.user.department || 'Arch Enterprises';
      this.showSignStudio = true;
      this.fetchDeviceIp();
      this.startStampClock();

      this.$nextTick(() => {
        this.initDrawCanvas();
      });
    },

    async openSignStudio(file) {
      this.studioMode = 'sign_existing';
      this.activeSignFile = file;
      this.selectedUploadFile = null;
      this.uploadFilePassword = file.file_password || '';
      this.showUploadPassword = false;
      if (this.pdfBlobUrl) {
        URL.revokeObjectURL(this.pdfBlobUrl);
        this.pdfBlobUrl = null;
      }
      this.stampPosX = 70;
      this.stampPosY = 80;
      this.stampPage = 1;
      this.stampSize = 'medium';
      this.signatureMode = 'draw';
      this.typedSignatureName = this.user.name || '';
      this.signerName = this.user.name || 'Authorized Signatory';
      this.signerDept = this.user.department || 'Arch Enterprises';
      this.showSignStudio = true;
      this.fetchDeviceIp();
      this.startStampClock();

      this.$nextTick(() => {
        this.initDrawCanvas();
      });

      // Fetch file buffer for live rendering
      this.loadingPdf = true;
      try {
        const fileUrl = file.preview_url || file.download_url;
        const res = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        this.pdfRawBuffer = res.data;

        const fname = (file.filename || '').toLowerCase();
        if (fname.endsWith('.pdf')) {
          this.isPdf = true;
          this.isImage = false;
          const blob = new Blob([this.pdfRawBuffer], { type: 'application/pdf' });
          this.pdfBlobUrl = URL.createObjectURL(blob) + '#toolbar=0&navpanes=0&scrollbar=1';
          this.loadingPdf = false;
        } else if (this.isImageFile(fname)) {
          this.isPdf = false;
          this.isImage = true;
          const blob = new Blob([this.pdfRawBuffer]);
          this.imagePreviewUrl = URL.createObjectURL(blob);
          this.loadingPdf = false;
        } else {
          this.isPdf = false;
          this.isImage = false;
          this.loadingPdf = false;
        }
      } catch (err) {
        console.error('Failed to load file preview:', err);
        toastError('Could not load document preview.');
        this.loadingPdf = false;
      }
    },

    closeSignStudio() {
      this.showSignStudio = false;
      this.selectedUploadFile = null;
      this.activeSignFile = null;
      this.pdfRawBuffer = null;
      this.dragPdfPages = [];
      this.isDragModeActive = false;
      if (this.pdfBlobUrl) {
        URL.revokeObjectURL(this.pdfBlobUrl);
        this.pdfBlobUrl = null;
      }
      this.pdfDocProxy = null;
      this.imagePreviewUrl = null;
    },

    async handleStudioFileSelect(e) {
      const file = e.target.files[0];
      if (file) {
        await this.processStudioFile(file);
      }
    },

    async handleStudioFileDrop(e) {
      this.isDraggingFile = false;
      const file = e.dataTransfer.files[0];
      if (file) {
        await this.processStudioFile(file);
      }
    },

    async processStudioFile(file) {
      if (file.size > 50 * 1024 * 1024) {
        toastWarning('File size exceeds maximum allowed limit of 50MB.');
        return;
      }

      this.selectedUploadFile = file;
      this.loadingPdf = true;
      if (this.pdfBlobUrl) {
        URL.revokeObjectURL(this.pdfBlobUrl);
        this.pdfBlobUrl = null;
      }

      try {
        const buffer = await file.arrayBuffer();
        this.pdfRawBuffer = buffer;

        const fname = (file.name || '').toLowerCase();
        if (fname.endsWith('.pdf')) {
          this.isPdf = true;
          this.isImage = false;
          const blob = new Blob([buffer], { type: 'application/pdf' });
          this.pdfBlobUrl = URL.createObjectURL(blob) + '#toolbar=0&navpanes=0&scrollbar=1';
          this.loadingPdf = false;
        } else if (this.isImageFile(fname)) {
          this.isPdf = false;
          this.isImage = true;
          this.imagePreviewUrl = URL.createObjectURL(file);
          this.totalPdfPages = 1;
          this.currentPdfPage = 1;
          this.stampPage = 1;
          this.loadingPdf = false;
        } else {
          this.isPdf = false;
          this.isImage = false;
          this.loadingPdf = false;
          toastInfo('Document uploaded. Drag the digital stamp to position it.');
        }
      } catch (err) {
        console.error('Error reading file:', err);
        toastError('Error processing file.');
        this.loadingPdf = false;
      }
    },

    // Render all PDF pages as stacked canvases for drag mode
    async renderAllPdfPagesForDrag() {
      if (!this.pdfRawBuffer || !this.isPdf) return;
      this.dragPdfPages = [];
      try {
        const loadingTask = pdfjsLib.getDocument({
          // .slice(0) creates a copy — pdfjs detaches the original ArrayBuffer
          data: new Uint8Array(this.pdfRawBuffer.slice(0)),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/standard_fonts/'
        });
        const pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;
        const scale = 1.5;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale });
          const offscreen = document.createElement('canvas');
          offscreen.width = Math.floor(viewport.width);
          offscreen.height = Math.floor(viewport.height);
          const ctx = offscreen.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, offscreen.width, offscreen.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          pages.push({
            width: offscreen.width,
            height: offscreen.height,
            cssWidth: Math.floor(viewport.width),
            cssHeight: Math.floor(viewport.height),
            imageData: ctx.getImageData(0, 0, offscreen.width, offscreen.height)
          });
        }
        this.dragPdfPages = pages;

        // Set initial stamp position near center-bottom of first page
        await this.$nextTick();
        this.stampPosAbsX = pages[0] ? Math.floor(pages[0].cssWidth / 2) : 300;
        this.stampPosAbsY = pages[0] ? Math.floor(pages[0].cssHeight * 0.8) : 400;

        // Draw each page onto its canvas ref
        await this.$nextTick();
        for (let i = 0; i < pages.length; i++) {
          const canvasEl = this.$refs['dragPageCanvas_' + i];
          const el = Array.isArray(canvasEl) ? canvasEl[0] : canvasEl;
          if (el) {
            const ctx = el.getContext('2d');
            ctx.putImageData(pages[i].imageData, 0, 0);
          }
        }
      } catch (e) {
        console.error('Error rendering drag PDF pages:', e);
      }
    },

    // 📄 PDF.js Loading and Page Rendering
    async loadPdfFromBuffer(buffer) {
      this.loadingPdf = true;
      this.isPdf = true;
      this.isImage = false;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/standard_fonts/'
        });
        this.pdfDocProxy = await loadingTask.promise;
        this.totalPdfPages = this.pdfDocProxy.numPages;
        this.currentPdfPage = 1;
        this.stampPage = 1;
        this.pdfZoom = 1.0;
        await this.$nextTick();
        await this.renderPdfPage(1);
      } catch (e) {
        console.error('PDF.js loading error:', e);
        toastError('Could not render PDF document: ' + (e.message || 'Invalid PDF'));
      } finally {
        this.loadingPdf = false;
      }
    },

    async renderPdfPage(pageNum) {
      if (!this.pdfDocProxy) return;
      try {
        if (this.currentRenderTask) {
          try {
            this.currentRenderTask.cancel();
          } catch (cancelErr) {}
        }

        await this.$nextTick();
        const page = await this.pdfDocProxy.getPage(pageNum);
        const canvas = this.$refs.pdfCanvas;
        if (!canvas) {
          console.error('Canvas element not found in DOM');
          return;
        }

        const ctx = canvas.getContext('2d');
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        // Calculate a crisp high-res width (standard 850px base on desktop)
        const container = this.$refs.pdfViewportContainer;
        const availableW = container ? Math.max(container.clientWidth - 100, 700) : 850;
        const baseScale = Math.min(availableW / unscaledViewport.width, 1.6);
        const finalScale = Math.max(0.85, baseScale);

        const viewport = page.getViewport({ scale: finalScale });

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        // Fill white background before drawing
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext = {
          canvasContext: ctx,
          transform: transform,
          viewport: viewport
        };

        this.currentRenderTask = page.render(renderContext);
        await this.currentRenderTask.promise;
        this.currentRenderTask = null;
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('PDF renderPage error:', err);
        }
      }
    },

    async prevPdfPage() {
      if (this.currentPdfPage > 1) {
        this.currentPdfPage--;
        await this.renderPdfPage(this.currentPdfPage);
      }
    },

    async nextPdfPage() {
      if (this.currentPdfPage < this.totalPdfPages) {
        this.currentPdfPage++;
        await this.renderPdfPage(this.currentPdfPage);
      }
    },

    zoomInPdf() {
      this.pdfZoom = Math.min(2.0, parseFloat((this.pdfZoom + 0.15).toFixed(2)));
    },

    zoomOutPdf() {
      this.pdfZoom = Math.max(0.5, parseFloat((this.pdfZoom - 0.15).toFixed(2)));
    },

    fitPdfWidth() {
      this.pdfZoom = 1.0;
    },

    moveStampToCurrentPage() {
      this.stampPage = this.currentPdfPage;
      toastSuccess(`Stamp moved to Page ${this.currentPdfPage}`);
    },

    toggleDragMode() {
      this.isDragModeActive = !this.isDragModeActive;
      if (this.isDragModeActive) {
        this.stampPosAbsX = 0;
        this.stampPosAbsY = 0;
        this.stampPage = 1;
        // If PDF is loaded, render all pages as canvases
        if (this.isPdf && this.pdfRawBuffer) {
          this.$nextTick(() => {
            this.renderAllPdfPagesForDrag();
          });
        }
      } else {
        this.dragPdfPages = [];
      }
    },

    // 🖋️ INTERACTIVE DRAG & DROP & CLICK-TO-PLACE ON PDF
    startDragStamp(e) {
      this.isDraggingStamp = true;
      e.preventDefault();
      e.stopPropagation();
    },

    startDragStampTouch(e) {
      this.isDraggingStamp = true;
      e.stopPropagation();
    },

    onDragStamp(e) {
      if (!this.isDraggingStamp) return;
      const container = this.$refs.pdfCanvasContainer;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (clientX === undefined || clientY === undefined) return;

      // Store as absolute pixel position relative to canvas container
      const rawX = clientX - rect.left + container.scrollLeft;
      const rawY = clientY - rect.top + container.scrollTop;
      this.stampPosAbsX = Math.max(0, rawX);
      this.stampPosAbsY = Math.max(0, rawY);
    },

    onDragStampTouch(e) {
      if (!this.isDraggingStamp) return;
      if (e.touches && e.touches[0]) {
        const container = this.$refs.pdfCanvasContainer;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const rawX = e.touches[0].clientX - rect.left + container.scrollLeft;
        const rawY = e.touches[0].clientY - rect.top + container.scrollTop;
        this.stampPosAbsX = Math.max(0, rawX);
        this.stampPosAbsY = Math.max(0, rawY);
      }
    },

    stopDragStamp() {
      this.isDraggingStamp = false;
    },

    onPdfCanvasClick(e) {
      if (this.isDraggingStamp) return;
      const container = this.$refs.pdfCanvasContainer;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const rawX = e.clientX - rect.left + container.scrollLeft;
      const rawY = e.clientY - rect.top + container.scrollTop;
      this.stampPosAbsX = Math.max(0, rawX);
      this.stampPosAbsY = Math.max(0, rawY);
    },

    // 🖋️ SIGNATURE DRAWING & CREATION
    setSignatureMode(mode) {
      this.signatureMode = mode;
      if (mode === 'draw') {
        this.$nextTick(() => {
          this.initDrawCanvas();
        });
      }
    },

    initDrawCanvas() {
      const canvas = this.$refs.studioDrawCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!this.drawnSignatureData) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },

    startDrawing(e) {
      this.isDrawing = true;
      const canvas = this.$refs.studioDrawCanvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      this.lastX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      this.lastY = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    },

    draw(e) {
      if (!this.isDrawing) return;
      const canvas = this.$refs.studioDrawCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const currentX = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const currentY = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(currentX, currentY);
      ctx.strokeStyle = this.penColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      this.lastX = currentX;
      this.lastY = currentY;
    },

    stopDrawing() {
      this.isDrawing = false;
      const canvas = this.$refs.studioDrawCanvas;
      if (canvas) {
        this.drawnSignatureData = canvas.toDataURL('image/png');
      }
    },

    handleTouchStart(e) {
      e.preventDefault();
      this.startDrawing(e);
    },

    handleTouchMove(e) {
      e.preventDefault();
      this.draw(e);
    },

    clearDrawCanvas() {
      const canvas = this.$refs.studioDrawCanvas;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      this.drawnSignatureData = null;
    },

    handleSigImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toastWarning('Signature image must be less than 5MB.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          this.uploadedSignatureImage = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    // 🎨 Render High-Resolution Signature Stamp Image for Baking
    async generateSignatureStampPng() {
      const offscreen = document.createElement('canvas');
      offscreen.width = 600;
      offscreen.height = 250;
      const ctx = offscreen.getContext('2d');

      // Transparent background
      ctx.clearRect(0, 0, 600, 250);

      if (this.signatureMode === 'draw') {
        if (this.drawnSignatureData) {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = this.drawnSignatureData;
          });
          ctx.drawImage(img, 20, 10, 560, 160);
        }
      } else if (this.signatureMode === 'type') {
        ctx.fillStyle = '#0f172a';
        let fontName = 'Great Vibes';
        if (this.typedFontClass === 'sig-font-2') fontName = 'Dancing Script';
        if (this.typedFontClass === 'sig-font-3') fontName = 'Caveat';
        if (this.typedFontClass === 'sig-font-4') fontName = 'Sacramento';

        ctx.font = `64px "${fontName}", cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.typedSignatureName || this.signerName || 'Authorized Signatory', 300, 90);
      } else if (this.signatureMode === 'upload') {
        if (this.uploadedSignatureImage) {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = this.uploadedSignatureImage;
          });
          ctx.drawImage(img, 50, 10, 500, 160);
        }
      } else if (this.signatureMode === 'seal') {
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 20, 540, 150);
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ARCH ENTERPRISES AUTHENTICATED', 300, 65);
        ctx.font = '18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(this.signerName || 'Authorized Signatory', 300, 105);
        ctx.fillText(`${this.signerDept || 'Arch Enterprises'} • Official Seal`, 300, 135);
      }

      if (!this.currentDeviceIp) {
        await this.fetchDeviceIp();
      }

      // Draw bottom verification border line and signer caption
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(25, 172);
      ctx.lineTo(575, 172);
      ctx.stroke();

      // Signer Name
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px "Plus Jakarta Sans", -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Digitally Signed by: ${this.signerName || this.user.name || 'Signatory'}`, 25, 192);

      // Verified Badge on Right
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 12px "Plus Jakarta Sans", -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('✔ ARCH ENTERPRISES VERIFIED', 575, 192);

      // Date, Timestamp, and Device IP
      const dateStr = this.stampCurrentDate || this.todayDateFormatted;
      const timeStr = this.stampCurrentTime || this.todayTimeFormatted;
      const ipStr = this.currentDeviceIp || '127.0.0.1';

      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 12px "Plus Jakarta Sans", -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Date: ${dateStr}   |   Time: ${timeStr}   |   IP: ${ipStr}`, 25, 212);

      // Reason & Certificate Reference
      ctx.fillStyle = '#64748b';
      ctx.font = '11px "Plus Jakarta Sans", -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Reason: ${this.signatureReason || 'Official Document Approval'}  •  Arch Enterprises Ref: AE-DS-${this.todayDateCode}`, 25, 232);

      return offscreen.toDataURL('image/png');
    },

    // 🚀 STAMP & BAKE SIGNATURE INTO PDF USING PDF-LIB (pixel-accurate, multi-page)
    async stampPdfDocument(pdfBuffer, filename) {
      // .slice(0) ensures we work on a fresh copy — pdf-lib can detach the original
      const pdfDoc = await PDFDocument.load(pdfBuffer.slice ? pdfBuffer.slice(0) : pdfBuffer);
      const sigPngUrl = await this.generateSignatureStampPng();
      const pngImage = await pdfDoc.embedPng(sigPngUrl);

      const pdfPages = pdfDoc.getPages();

      // These MUST match the CSS values in .pdf-canvas-pages-stack
      const STACK_PAD_TOP = 12; // padding-top of .pdf-canvas-pages-stack
      const PAGE_GAP      = 8;  // gap between canvas pages

      // stampPosAbsY is absolute px from top of .pdf-canvas-wrapper scroll area.
      // Subtract the top padding of the stack to get position within the page stack.
      let absY = this.stampPosAbsY - STACK_PAD_TOP;
      let absX = this.stampPosAbsX;

      // Walk pages to find which page and the relative Y within that page
      let targetPageIdx = this.dragPdfPages.length > 0 ? this.dragPdfPages.length - 1 : 0;
      let relYInPage = 0;

      if (this.dragPdfPages.length > 0) {
        let y = absY;
        for (let i = 0; i < this.dragPdfPages.length; i++) {
          const pageH = this.dragPdfPages[i].cssHeight;
          if (y <= pageH) {
            // Stamp is within this page
            targetPageIdx = i;
            relYInPage = Math.max(0, y);
            break;
          }
          // Stamp is past this page — subtract page height and gap before next
          y -= (pageH + PAGE_GAP);

          // If this is the last page, clamp to bottom
          if (i === this.dragPdfPages.length - 1) {
            targetPageIdx = i;
            relYInPage = Math.min(pageH, Math.max(0, y + pageH));
          }
        }
      } else {
        // Fallback: no canvas data, use percentage-based position on stamp page
        targetPageIdx = Math.max(0, (this.stampPage || 1) - 1);
        relYInPage = 0;
      }

      const safeIdx = Math.min(targetPageIdx, pdfPages.length - 1);
      const targetPage = pdfPages[safeIdx];
      const { width: pdfW, height: pdfH } = targetPage.getSize();

      // Rendered canvas size at scale=1.5 (must match renderAllPdfPagesForDrag)
      const renderedW = this.dragPdfPages[safeIdx]?.cssWidth  || pdfW;
      const renderedH = this.dragPdfPages[safeIdx]?.cssHeight || pdfH;

      // Map rendered pixel coords → PDF point coords
      const pdfX = (absX       / renderedW) * pdfW;
      const pdfY = (relYInPage / renderedH) * pdfH;

      // Stamp size
      const relWidth = this.stampSize === 'large' ? 0.38 : (this.stampSize === 'small' ? 0.22 : 0.30);
      const stampW = pdfW * relWidth;
      const stampH = stampW * (250 / 600); // aspect ratio

      const finalX = Math.max(10, Math.min(pdfW - stampW - 10, pdfX - stampW / 2));
      // PDF origin is BOTTOM-LEFT, so invert Y axis
      const finalY = Math.max(10, Math.min(pdfH - stampH - 10, pdfH - pdfY - stampH / 2));

      targetPage.drawImage(pngImage, { x: finalX, y: finalY, width: stampW, height: stampH });

      const modifiedBytes = await pdfDoc.save();
      return new File([modifiedBytes], filename, { type: 'application/pdf' });
    },


    // 🚀 VALIDATE & SIGN (SUBMITS FILE & DIGITAL SIGNATURE TO VAULT)
    async validateAndSignDocument() {
      if (this.studioMode === 'upload' && !this.selectedUploadFile) {
        toastWarning('Please select or drop a document first.');
        return;
      }

      this.isSavingStudio = true;
      try {
        let finalFileToUpload = this.selectedUploadFile;
        const targetFilename = this.studioMode === 'upload'
          ? (this.selectedUploadFile?.name || 'document.pdf')
          : (this.activeSignFile?.filename || 'document.pdf');

        // If drag mode was used on a PDF, bake the signature into the PDF at stamp position
        if (this.isDragModeActive && this.isPdf && this.pdfRawBuffer) {
          // .slice(0) copies the buffer so it isn't detached by prior pdfjs usage
          finalFileToUpload = await this.stampPdfDocument(this.pdfRawBuffer.slice(0), targetFilename);
        }

        if (!this.currentDeviceIp) {
          await this.fetchDeviceIp();
        }

        const sigDataUrl = await this.generateSignatureStampPng();

        if (this.studioMode === 'upload') {
          // UPLOAD NEW SECURED DOCUMENT
          const formData = new FormData();
          formData.append('file', finalFileToUpload);
          formData.append('user_id', this.user.id);
          formData.append('category', this.uploadCategory);
          formData.append('description', this.uploadDescription);
          if (this.uploadFilePassword) {
            formData.append('file_password', this.uploadFilePassword);
          }
          formData.append('is_digitally_signed', '1');
          formData.append('signer_name', this.signerName || this.user.name || 'Authorized Signatory');
          formData.append('signer_department', this.signerDept || this.user.department || 'Arch Enterprises');
          formData.append('signature_reason', this.signatureReason);
          formData.append('signature_type', this.signatureMode);
          formData.append('signature_data', sigDataUrl);
          formData.append('client_ip', this.currentDeviceIp || '');
          if (this.isDragModeActive) {
            formData.append('signature_position', JSON.stringify({
              x: this.stampPosX,
              y: this.stampPosY,
              page: this.stampPage,
              size: this.stampSize
            }));
          }

          const res = await axios.post('/api/employee/vault/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data.success) {
            toastSuccess('Document digitally signed and encrypted into vault successfully!');
            this.closeSignStudio();
            await this.fetchVaultFiles();
          }
        } else {
          // SIGN EXISTING VAULT DOCUMENT
          const formData = new FormData();
          formData.append('user_id', this.user.id);
          formData.append('signer_name', this.signerName || this.user.name || 'Authorized Signatory');
          formData.append('signer_department', this.signerDept || this.user.department || 'Arch Enterprises');
          formData.append('signature_data', sigDataUrl);
          formData.append('signature_reason', this.signatureReason);
          formData.append('signature_type', this.signatureMode);
          formData.append('client_ip', this.currentDeviceIp || '');
          if (this.isDragModeActive && finalFileToUpload) {
            formData.append('file', finalFileToUpload);
          }
          if (this.isDragModeActive) {
            formData.append('signature_position', JSON.stringify({
              x: this.stampPosX,
              y: this.stampPosY,
              page: this.stampPage,
              size: this.stampSize
            }));
          }

          const res = await axios.post(`/api/employee/vault/sign-file/${this.activeSignFile.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data.success) {
            toastSuccess('Digital signature attached to document successfully!');
            this.closeSignStudio();
            await this.fetchVaultFiles();
            this.openCertificateModal(res.data.file || this.activeSignFile);
          }
        }
      } catch (err) {
        console.error('Signing failed:', err);
        toastError(err.response?.data?.message || 'Failed to apply digital signature.');
      } finally {
        this.isSavingStudio = false;
      }
    },

    // 👥 SHARE MODAL METHODS
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

    // 📜 CERTIFICATE VIEWER
    async openCertificateModal(file) {
      this.loadingCertificate = true;
      this.showCertificateModal = true;
      this.activeCertData = {
        filename: file.filename,
        file_size: file.file_size,
        category: file.category,
        document_id: file.id,
        signer_name: file.signer_name || file.uploader_name,
        signer_department: file.signer_department || file.uploader_dept,
        signed_at: file.signed_at || file.created_at,
        client_ip: file.client_ip || file.signature_metadata?.client_ip || this.currentDeviceIp || '',
        signature_reason: file.signature_reason || 'Digitally Authenticated & Approved',
        signature_data: file.signature_data,
        certificate_hash: file.signature_hash || `ARCH-DS-${this.todayDateCode}-${file.id}`
      };

      try {
        const res = await axios.get(`/api/employee/vault/certificate/${file.id}`);
        if (res.data.success && res.data.certificate) {
          this.activeCertData = res.data.certificate;
        }
      } catch (err) {
        // Fallback
      } finally {
        this.loadingCertificate = false;
      }
    },

    copyHash(hash) {
      if (!hash) return;
      navigator.clipboard.writeText(hash).then(() => {
        toastSuccess('Certificate Hash copied to clipboard!');
      }).catch(() => {
        toastInfo(`Hash: ${hash}`);
      });
    },

    printCertificate() {
      window.print();
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

    isImageFile(filename) {
      if (!filename) return false;
      return /\.(png|jpe?g|webp|gif|svg)$/i.test(filename);
    },

    isBase64OrUrl(str) {
      if (!str) return false;
      return str.startsWith('data:image') || str.startsWith('http://') || str.startsWith('https://');
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Sacramento&display=swap');

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
  border-radius: 50%;
  background: #eff6ff;
  border: 2px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.lock-shield-ico {
  font-size: 2rem;
  color: #2563eb;
}

.security-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 10px;
}

.lock-header-text h2 {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.lock-subtitle {
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.45;
  margin: 0 0 20px 0;
}

.user-verification-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  width: 100%;
  margin-bottom: 24px;
  box-sizing: border-box;
}

.user-avatar-mini img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
}

.user-info-mini {
  display: flex;
  flex-direction: column;
  text-align: left;
  flex: 1;
}

.user-name-label {
  font-weight: 700;
  font-size: 0.88rem;
  color: #1e293b;
}

.user-email-label {
  font-size: 0.76rem;
  color: #64748b;
}

.hr-badge-pill {
  font-size: 0.7rem;
  font-weight: 700;
  color: #7c3aed;
  background: #f5f3ff;
  padding: 3px 8px;
  border-radius: 6px;
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
  text-align: left;
  gap: 6px;
}

.input-field-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
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
  font-size: 0.95rem;
}

.vault-input {
  width: 100%;
  padding: 11px 40px 11px 40px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #1e293b;
  outline: none;
  background: #ffffff;
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
  padding: 4px;
}

.btn-lock-action {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transition: all 0.2s ease;
}

.btn-lock-action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.btn-lock-action:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-lock-action.unlock {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.auth-error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.8rem;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: left;
}

.otp-box-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}

.otp-box-section label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}

.otp-digit-inputs {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.otp-digit-box {
  width: 50px;
  height: 56px;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  outline: none;
  background: #ffffff;
  transition: all 0.2s ease;
}

.otp-digit-box:focus {
  border-color: #059669;
  box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.15);
}

.timer-resend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.timer-countdown {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
}

.timer-countdown.expired {
  color: #dc2626;
}

.btn-resend-code {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.btn-resend-code:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.otp-actions-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}

.btn-back-step {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 6px;
}

.lock-footer-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  font-size: 0.74rem;
  color: #94a3b8;
}

/* ==================================================== */
/* 🔓 UNLOCKED VAULT WORKSPACE STYLES                   */
/* ==================================================== */
.vault-workspace {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vault-top-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 20px;
  padding: 24px 28px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15);
}

.banner-title-area {
  display: flex;
  align-items: center;
  gap: 18px;
}

.vault-shield-badge {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #60a5fa;
}

.vault-badge-line {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.vault-status-active {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #34d399;
  background: rgba(16, 185, 129, 0.15);
  padding: 3px 8px;
  border-radius: 12px;
}

.hr-indicator-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #c084fc;
  background: rgba(168, 85, 247, 0.15);
  padding: 3px 8px;
  border-radius: 12px;
}

.banner-title-area h1 {
  font-size: 1.45rem;
  font-weight: 800;
  margin: 2px 0 4px 0;
}

.vault-description {
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 0;
}

.header-right-actions {
  display: flex;
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
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.btn-vault-upload:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.btn-vault-lock {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-vault-lock:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #ffffff;
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
.kpi-icon-square.teal { background: #f0fdfa; color: #0d9488; }
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

.signed-mini-badge {
  color: #059669;
  font-size: 0.85rem;
}

.pwd-mini-badge {
  color: #d97706;
  font-size: 0.8rem;
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

/* Digital Signature Status Pill */
.signature-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.signature-status-pill.verified {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.signature-status-pill.verified .sig-status-icon {
  color: #059669;
  font-size: 1rem;
}

.signature-status-pill.verified .sig-status-title {
  font-weight: 700;
  font-size: 0.76rem;
  color: #065f46;
}

.signature-status-pill.verified .sig-signer-name {
  font-size: 0.68rem;
  color: #059669;
}

.signature-status-pill.unsigned {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
}

.signature-status-pill.unsigned:hover {
  background: #eff6ff;
  border-color: #3b82f6;
}

.signature-status-pill.unsigned .sig-status-icon {
  color: #64748b;
}

.signature-status-pill.unsigned .sig-status-title {
  font-weight: 700;
  font-size: 0.76rem;
  color: #475569;
}

.signature-status-pill.unsigned .sig-action-hint {
  font-size: 0.68rem;
  color: #2563eb;
  font-weight: 600;
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
.action-btn.sign-btn:hover { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
.action-btn.cert-btn:hover { background: #fffbeb; color: #d97706; border-color: #fde68a; }
.action-btn.share:hover { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }
.action-btn.delete:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

.text-right { text-align: right; }

/* ========================================================================= */
/* 🚀 ODOO DIGITAL SIGN FULLSCREEN STUDIO STYLES                             */
/* ========================================================================= */
.odoo-fullscreen-studio {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100000;
  background: #0b0f19;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Studio Navbar */
.odoo-studio-navbar {
  height: 64px;
  background: #111827;
  border-bottom: 1px solid #1f2937;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 10;
}

.navbar-left-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-studio-back {
  background: #1f2937;
  border: 1px solid #374151;
  color: #cbd5e1;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-studio-back:hover {
  background: #374151;
  color: #ffffff;
}

.studio-doc-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-badge-ico {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.2);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.brand-text-col {
  display: flex;
  flex-direction: column;
}

.studio-app-title {
  font-size: 0.72rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.studio-active-filename {
  font-size: 0.92rem;
  font-weight: 800;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size-pill {
  font-size: 0.68rem;
  background: #1f2937;
  color: #38bdf8;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

/* Center Tools */
.navbar-center-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-nav-pill,
.zoom-controls-pill {
  display: flex;
  align-items: center;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 4px 6px;
  gap: 6px;
}

.page-nav-btn,
.zoom-btn,
.btn-fit-width {
  background: none;
  border: none;
  color: #cbd5e1;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.76rem;
  transition: all 0.15s ease;
}

.page-nav-btn:hover:not(:disabled),
.zoom-btn:hover,
.btn-fit-width:hover {
  background: #374151;
  color: #ffffff;
}

.page-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-nav-counter {
  font-size: 0.78rem;
  color: #94a3b8;
  padding: 0 4px;
}

.page-nav-counter strong {
  color: #ffffff;
}

.zoom-level {
  font-size: 0.76rem;
  font-weight: 700;
  color: #38bdf8;
  padding: 0 4px;
  min-width: 42px;
  text-align: center;
}

/* Right Actions */
.navbar-right-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pwd-indicator-badge {
  font-size: 0.74rem;
  background: rgba(217, 119, 6, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(217, 119, 6, 0.4);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
}

.btn-studio-validate {
  background: linear-gradient(135deg, #059669, #047857);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
  transition: all 0.2s ease;
}

.btn-studio-validate:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(5, 150, 105, 0.45);
}

.btn-studio-validate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Studio Body */
.odoo-studio-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Left Sidebar */
.odoo-studio-sidebar {
  width: 400px;
  flex-shrink: 0;
  background: #111827;
  border-right: 1px solid #1f2937;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-block {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 16px;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.block-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
}

.block-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
}

.studio-dropzone {
  border: 2px dashed #475569;
  border-radius: 12px;
  padding: 20px 14px;
  text-align: center;
  cursor: pointer;
  background: #0f172a;
  transition: all 0.2s ease;
}

.studio-dropzone:hover,
.studio-dropzone.dragging {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.05);
}

.drop-icon-halo {
  font-size: 1.8rem;
  color: #38bdf8;
  margin-bottom: 6px;
}

.drop-primary {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 2px 0;
}

.drop-secondary {
  font-size: 0.72rem;
  color: #94a3b8;
}

.studio-selected-file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 10px 12px;
}

.file-card-ico {
  font-size: 1.4rem;
  color: #38bdf8;
}

.file-card-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.file-card-name {
  font-size: 0.84rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-card-size {
  font-size: 0.7rem;
  color: #94a3b8;
}

.btn-change-file {
  background: #1f2937;
  border: 1px solid #374151;
  color: #38bdf8;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.76rem;
}

.sidebar-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-field-group label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #94a3b8;
}

.sidebar-select,
.sidebar-input {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 9px 12px;
  color: #ffffff;
  font-size: 0.84rem;
  outline: none;
  box-sizing: border-box;
  width: 100%;
}

.sidebar-select:focus,
.sidebar-input:focus {
  border-color: #38bdf8;
}

.sidebar-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix-icon {
  position: absolute;
  left: 10px;
  color: #64748b;
  font-size: 0.85rem;
}

.sidebar-input.with-prefix {
  padding-left: 32px;
}

.sidebar-input.with-suffix {
  padding-right: 36px;
}

.btn-toggle-eye-sidebar {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

/* Odoo Sig Tabs */
.odoo-sig-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  background: #0f172a;
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.odoo-tab-btn {
  background: none;
  border: none;
  color: #94a3b8;
  padding: 7px 4px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s ease;
}

.odoo-tab-btn:hover {
  color: #ffffff;
}

.odoo-tab-btn.active {
  background: #2563eb;
  color: #ffffff;
}

/* Tab Panes */
.tab-content-pane {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.canvas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pen-palette {
  display: flex;
  gap: 8px;
}

.pen-color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pen-color-dot.active {
  border-color: #ffffff;
  transform: scale(1.15);
}

.btn-clear-drawing {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.toolbar-btn-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-drag-to-doc {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #60a5fa;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.btn-drag-to-doc:hover {
  background: rgba(37, 99, 235, 0.22);
  border-color: #3b82f6;
}

.btn-drag-to-doc.active {
  background: rgba(5, 150, 105, 0.15);
  border-color: rgba(16, 185, 129, 0.6);
  color: #34d399;
  animation: drag-pulse 1.8s ease-in-out infinite;
}

@keyframes drag-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
}

.drag-mode-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.sig-preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.draw-canvas-container {
  background: #ffffff;
  border-radius: 10px;
  border: 2px dashed #94a3b8;
  position: relative;
  overflow: hidden;
}

.studio-draw-canvas {
  width: 100%;
  height: 110px;
  display: block;
  cursor: crosshair;
}

.canvas-sign-guideline {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  font-size: 0.68rem;
  color: #94a3b8;
  border-top: 1px dashed #e2e8f0;
  padding-top: 4px;
}

/* Type Signature Cards */
.font-styles-selection-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.font-choice-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.font-choice-card:hover {
  border-color: #64748b;
}

.font-choice-card.active {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.font-preview-text {
  display: block;
  font-size: 1.25rem;
  color: #ffffff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-label-name {
  font-size: 0.65rem;
  color: #94a3b8;
}

.sig-font-1 { font-family: 'Great Vibes', cursive; }
.sig-font-2 { font-family: 'Dancing Script', cursive; }
.sig-font-3 { font-family: 'Caveat', cursive; }
.sig-font-4 { font-family: 'Sacramento', cursive; }

/* Image Upload Signature */
.sig-upload-box {
  background: #0f172a;
  border: 2px dashed #334155;
  border-radius: 10px;
  padding: 18px 12px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #94a3b8;
}

.sig-uploaded-preview {
  background: #ffffff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sig-uploaded-preview img {
  max-height: 70px;
  max-width: 100%;
  object-fit: contain;
}

.btn-remove-sig-img {
  background: #fee2e2;
  border: none;
  color: #dc2626;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

/* Seal */
.enterprise-seal-box {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.seal-icon-halo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.seal-details {
  display: flex;
  flex-direction: column;
}

.seal-details strong {
  font-size: 0.86rem;
  color: #ffffff;
}

.seal-details span {
  font-size: 0.72rem;
  color: #94a3b8;
}

/* Live Audit Metadata Card in Signature Section */
.sig-audit-metadata-card {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #1e293b;
  border-left: 3px solid #10b981;
  border-radius: 10px;
  padding: 10px 12px;
}

.sig-audit-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.70rem;
  font-weight: 700;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sig-audit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.sig-audit-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sig-audit-item.ip-span {
  grid-column: span 2;
}

.sig-audit-label {
  font-size: 0.65rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sig-audit-val {
  font-size: 0.76rem;
  color: #f1f5f9;
}

.sig-audit-val.ip-val {
  color: #38bdf8;
  letter-spacing: 0.3px;
}

/* Digital Certificate Info Card */
.digital-cert-info-card {
  background: #0f172a;
  border: 1px solid #1e3a8a;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cert-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  color: #60a5fa;
}

.cert-card-desc {
  font-size: 0.74rem;
  color: #94a3b8;
  line-height: 1.45;
  margin: 0;
}

.cert-card-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #93c5fd;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  align-self: flex-start;
}

/* RIGHT VIEWPORT (FULL PDF ONLY) */
.odoo-studio-viewport {
  flex: 1;
  background: #0b0f19;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
}

.viewport-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  gap: 14px;
  color: #94a3b8;
}

.loader-spin-ico {
  font-size: 2.2rem;
  color: #38bdf8;
}

.viewport-empty-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  max-width: 460px;
  text-align: center;
  background: #111827;
  border: 2px dashed #374151;
  border-radius: 20px;
  padding: 40px 24px;
  cursor: pointer;
}

.empty-stage-halo {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 14px;
}

.viewport-empty-stage h3 {
  margin: 0 0 6px 0;
  color: #ffffff;
  font-size: 1.2rem;
}

.viewport-empty-stage p {
  color: #94a3b8;
  font-size: 0.84rem;
  margin: 0 0 16px 0;
}

.btn-browse-stage {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
}

.pdf-stage-scroll-area {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
}

.pdf-canvas-wrapper {
  position: relative;
  background: #ffffff;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  width: 100%;
  max-width: 960px;
  height: calc(100vh - 120px);
  min-height: 700px;
  overflow-y: auto;  /* allows scrolling when canvases are stacked */
  overflow-x: hidden;
  transition: transform 0.15s ease;
  user-select: none;
  display: flex;
  flex-direction: column;
}

/* Stacked PDF canvas pages for drag mode */
.pdf-canvas-pages-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background: #525659;
  gap: 8px;
  padding: 12px 0;
  min-height: 100%;
}

.pdf-drag-page-canvas {
  display: block;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  background: #fff;
  max-width: 100%;
}

.drag-pdf-loading {
  color: #94a3b8;
  padding: 40px;
  text-align: center;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}


.real-pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
  display: block;
}

.real-pdf-iframe.is-dragging-active {
  pointer-events: none;
}

.real-image-preview {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  margin: auto;
}

/* Interactive Draggable Stamp */
.interactive-odoo-stamp {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: grab;
  z-index: 50;
  background: rgba(255, 255, 255, 0.94);
  border: 2px solid #2563eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35);
  backdrop-filter: blur(4px);
  user-select: none;
  touch-action: none;
  transition: box-shadow 0.15s ease;
}

.interactive-odoo-stamp.is-dragging {
  cursor: grabbing;
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.6);
  border-color: #059669;
}

.interactive-odoo-stamp.small { width: 170px; }
.interactive-odoo-stamp.medium { width: 230px; }
.interactive-odoo-stamp.large { width: 300px; }

.stamp-header-badge {
  background: #2563eb;
  color: #ffffff;
  padding: 3px 8px;
  font-size: 0.64rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 4px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.stamp-render-area {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stamp-draw-view,
.stamp-type-view,
.stamp-upload-view,
.stamp-seal-view {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.stamp-sig-img {
  max-height: 48px;
  max-width: 100%;
  object-fit: contain;
}

.stamp-placeholder-hint {
  font-size: 0.7rem;
  color: #64748b;
  font-style: italic;
}

.stamp-font-styled {
  font-size: 1.35rem;
  color: #0f172a;
  text-align: center;
  line-height: 1.1;
}

.stamp-seal-view {
  display: flex;
  align-items: center;
  gap: 6px;
}

.seal-txt {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.seal-txt strong {
  font-size: 0.74rem;
  color: #065f46;
}

.seal-txt small {
  font-size: 0.64rem;
  color: #059669;
}

.stamp-footer-row {
  width: 100%;
  margin-top: 5px;
  padding-top: 4px;
  border-top: 1px solid #cbd5e1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.signer-tag {
  font-size: 0.65rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stamp-meta-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 0.54rem;
  color: #475569;
  white-space: nowrap;
  line-height: 1.2;
}

.stamp-audit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 0.52rem;
  line-height: 1.2;
}

.stamp-ip-badge {
  color: #0369a1;
  font-weight: 700;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.verified-tag {
  font-size: 0.54rem;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

/* ==================================================== */
/* MODAL COMMON & SHARE / CERTIFICATE STYLES            */
/* ==================================================== */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
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

.certificate-modal-card {
  max-width: 680px;
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
  gap: 12px;
}

.modal-ico {
  font-size: 1.3rem;
  color: #2563eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-share-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.target-file-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.target-file-summary i {
  font-size: 1.4rem;
  color: #2563eb;
}

.target-file-summary strong {
  display: block;
  font-size: 0.88rem;
  color: #0f172a;
}

.target-file-summary p {
  margin: 0;
  font-size: 0.74rem;
  color: #64748b;
}

.share-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.modal-select,
.modal-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.86rem;
  color: #1e293b;
  outline: none;
  box-sizing: border-box;
}

.modal-select:focus,
.modal-input:focus {
  border-color: #2563eb;
}

.btn-submit-upload {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.existing-shares-box {
  border-top: 1px solid #e2e8f0;
  padding-top: 14px;
}

.existing-shares-box h4 {
  margin: 0 0 10px 0;
  font-size: 0.82rem;
  color: #64748b;
  text-transform: uppercase;
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
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.share-user-meta strong {
  display: block;
  font-size: 0.82rem;
  color: #0f172a;
}

.share-user-meta span {
  font-size: 0.72rem;
  color: #64748b;
}

.btn-revoke-share {
  background: #fee2e2;
  border: none;
  color: #dc2626;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  cursor: pointer;
}

/* Certificate Styles */
.certificate-container {
  padding: 24px;
  background: #ffffff;
}

.cert-banner {
  text-align: center;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.cert-logo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.cert-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 0.92rem;
  color: #0f172a;
}

.cert-badge-valid {
  font-size: 0.74rem;
  font-weight: 800;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 3px 8px;
  border-radius: 20px;
}

.cert-banner h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.cert-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.cert-body-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.cert-info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-header-mini {
  font-size: 0.76rem;
  font-weight: 800;
  color: #2563eb;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.cert-key-val {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
}

.cert-key-val .key {
  color: #64748b;
}

.cert-key-val .val {
  color: #1e293b;
}

.cert-key-val .val.bold {
  font-weight: 700;
}

.cert-signature-showcase {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.official-stamp-graphic {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 2px dashed #059669;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stamp-inner-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #059669;
  font-size: 0.65rem;
  font-weight: 800;
  text-align: center;
}

.stamp-inner-circle i {
  font-size: 1.3rem;
  margin-bottom: 2px;
}

.sig-image-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sig-image-column label {
  font-size: 0.74rem;
  font-weight: 700;
  color: #64748b;
}

.sig-render-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cert-rendered-sig-img {
  max-height: 55px;
  max-width: 100%;
}

.cert-text-signature {
  font-family: 'Great Vibes', cursive;
  font-size: 1.8rem;
  color: #0f172a;
}

.cert-crypto-bar {
  background: #0f172a;
  color: #ffffff;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.hash-label {
  font-size: 0.68rem;
  color: #94a3b8;
  display: block;
}

.hash-code {
  font-size: 0.8rem;
  color: #34d399;
  font-family: monospace;
}

.btn-copy-hash {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.cert-footer-disclaimer {
  font-size: 0.7rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.4;
}

.modal-actions-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #e2e8f0;
  border: none;
  color: #475569;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-print-cert {
  background: #0f172a;
  border: none;
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #111827;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 3px;
}

/* Print Styles */
@media print {
  .layout, .main-content, .vault-board-premium {
    background: #ffffff !important;
    padding: 0 !important;
  }
  .modal-backdrop {
    position: static !important;
    background: none !important;
    padding: 0 !important;
  }
  .vault-modal-card {
    box-shadow: none !important;
    border: none !important;
    max-width: 100% !important;
  }
  .modal-header, .modal-actions-footer {
    display: none !important;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
  .vault-top-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .odoo-studio-body {
    flex-direction: column;
  }
  .odoo-studio-sidebar {
    width: 100%;
    height: 45vh;
  }
  .cert-body-grid {
    grid-template-columns: 1fr;
  }
}
</style>
