<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div v-if="!isMobile || !isSidebarVisible" class="profile-card-premium">
        <!-- Top Executive Header Banner -->
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-id-badge"></i>
            </div>
            <div>
              <div class="header-badge-row">
                <h1>Official Employee ID Card</h1>
                <span class="status-verified-chip">
                  <i class="fas fa-shield-check"></i> Verified Profile
                </span>
              </div>
              <p class="subtitle-modern">Arch IT Solutions & Enterprises Digital Identity Card</p>
            </div>
          </div>

          <div class="header-actions">
            <button 
              type="button" 
              class="action-btn secondary-btn"
              @click="toggleCardSide"
              v-if="!editMode"
              :title="isFlipped ? 'View Front Side' : 'View Back Side'"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin-once': isFlipped }"></i>
              <span>{{ isFlipped ? 'Show Front' : 'Flip to Back' }}</span>
            </button>

            <button 
              type="button" 
              class="action-btn print-btn"
              @click="printCard"
              v-if="!editMode"
              title="Print official ID card badge"
            >
              <i class="fas fa-print"></i>
              <span>Print ID Card</span>
            </button>

            <button 
              v-if="!editMode"
              class="action-btn edit-btn-premium" 
              @click="editMode = true"
            >
              <i class="fas fa-user-edit"></i>
              <span>Edit Profile</span>
            </button>

            <button 
              v-else
              class="action-btn cancel-header-btn" 
              @click="cancelEdit"
            >
              <i class="fas fa-arrow-left"></i>
              <span>Back to ID Card</span>
            </button>
          </div>
        </div>

        <div v-if="user" class="profile-container-premium">
          <!-- ================= VIEW MODE ================= -->
          <template v-if="!editMode">
            <!-- LEFT COLUMN: REALISTIC COMPANY ID CARD -->
            <div class="id-card-stage">
              <!-- Lanyard Attachment Mechanism -->
              <div class="lanyard-rig">
                <div class="lanyard-strap">
                  <span class="strap-text">ARCH IT SOLUTIONS • SECURE ACCESS BADGE • ARCH ENTERPRISES</span>
                </div>
                <div class="lanyard-ring"></div>
                <div class="lanyard-clip">
                  <div class="clip-jaw"></div>
                  <div class="clip-spring"></div>
                </div>
              </div>

              <!-- 3D Perspective Card Flipper -->
              <div class="id-card-wrapper" :class="{ 'is-flipped': isFlipped }" id="employee-id-card-print">
                <!-- ================= FRONT OF ID CARD ================= -->
                <div class="id-card-face id-card-front">
                  <!-- Lanyard Oval Punch Slot -->
                  <div class="lanyard-slot-hole">
                    <div class="slot-cutout"></div>
                  </div>

                  <!-- Header: Corporate Branding -->
                  <div class="id-card-header">
                    <div class="company-brand-row">
                      <div class="logo-box">
                        <img 
                          :src="cardCompanyLogo" 
                          :alt="cardCompanyName" 
                          class="company-logo-img" 
                        />
                      </div>
                      <div class="company-text">
                        <h2 class="company-name">{{ cardCompanyName }}</h2>
                        <span class="company-division" v-if="!isArchEnterprises">DIVISION OF ARCH ENTERPRISES</span>
                      </div>
                    </div>
                    <div class="badge-ribbon-strip">
                      <span>EMPLOYEE IDENTITY CARD</span>
                    </div>
                  </div>

                  <!-- ID Card Body -->
                  <div class="id-card-body">
                    <!-- Photo Frame Container -->
                    <div class="id-photo-container">
                      <div class="id-photo-frame" @click="editMode = true" title="Click to update photo">
                        <img 
                          v-if="profileImageUrl && !imageFailed" 
                          :src="profileImageUrl" 
                          @error="imageFailed = true"
                          alt="Employee Photo"
                          class="id-employee-photo"
                        />
                        <div v-else class="id-photo-fallback">
                          <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="photo-overlay-badge">
                          <i class="fas fa-check-circle"></i> VERIFIED
                        </div>
                      </div>
                      <div class="chip-nfc-indicator">
                        <div class="smart-chip-graphic">
                          <div class="chip-contact"></div>
                          <div class="chip-contact"></div>
                          <div class="chip-contact"></div>
                          <div class="chip-contact"></div>
                        </div>
                        <div class="nfc-wave">
                          <i class="fas fa-wifi"></i>
                        </div>
                      </div>
                    </div>

                    <!-- Employee Primary Identity -->
                    <div class="id-identity-info">
                      <h3 class="id-employee-name">{{ user.name || 'EMPLOYEE NAME' }}</h3>
                      <div class="id-role-pill">
                        <i class="fas fa-briefcase"></i>
                        <span>{{ user.department || 'IT Lead' }}</span>
                      </div>
                    </div>

                    <!-- Key Identity Attributes Grid -->
                    <div class="id-attributes-matrix">
                      <div class="matrix-item">
                        <span class="matrix-label">EMP ID</span>
                        <span class="matrix-value emp-id-highlight">
                          ARCH-{{ formatEmpId(user.emp_id || user.id) }}
                        </span>
                      </div>

                      <div class="matrix-item">
                        <span class="matrix-label">BLOOD GRP</span>
                        <span class="matrix-value blood-group-pill">
                          <i class="fas fa-tint"></i> {{ user.bloodgroup || 'B+' }}
                        </span>
                      </div>

                      <div class="matrix-item">
                        <span class="matrix-label">PHONE</span>
                        <span class="matrix-value">{{ user.mobile || '—' }}</span>
                      </div>

                      <div class="matrix-item">
                        <span class="matrix-label">EMAIL</span>
                        <span class="matrix-value email-highlight" :title="user ? user.email : ''">
                          {{ (user && user.email) || '—' }}
                        </span>
                      </div>
                    </div>

                    <!-- Scannable Code Bar & QR Section -->
                    <div class="id-card-footer-codes">
                      <div class="qr-code-box" title="Scan to verify employee credentials">
                        <!-- High Precision Inline SVG QR Code Pattern -->
                        <svg class="qr-svg" viewBox="0 0 74 74" fill="currentColor">
                          <!-- Corner Finder Patterns -->
                          <rect x="0" y="0" width="22" height="22" fill="#0f172a" rx="3" />
                          <rect x="3" y="3" width="16" height="16" fill="#ffffff" rx="2" />
                          <rect x="6" y="6" width="10" height="10" fill="#009688" rx="1" />

                          <rect x="52" y="0" width="22" height="22" fill="#0f172a" rx="3" />
                          <rect x="55" y="3" width="16" height="16" fill="#ffffff" rx="2" />
                          <rect x="58" y="6" width="10" height="10" fill="#009688" rx="1" />

                          <rect x="0" y="52" width="22" height="22" fill="#0f172a" rx="3" />
                          <rect x="3" y="55" width="16" height="16" fill="#ffffff" rx="2" />
                          <rect x="6" y="58" width="10" height="10" fill="#009688" rx="1" />

                          <!-- Internal Data Grid Matrix -->
                          <rect x="26" y="4" width="4" height="4" fill="#0f172a" />
                          <rect x="34" y="4" width="4" height="4" fill="#0f172a" />
                          <rect x="42" y="4" width="4" height="4" fill="#0f172a" />
                          <rect x="30" y="10" width="4" height="4" fill="#0f172a" />
                          <rect x="38" y="10" width="4" height="4" fill="#0f172a" />
                          <rect x="26" y="16" width="8" height="4" fill="#0f172a" />
                          <rect x="38" y="16" width="4" height="4" fill="#0f172a" />

                          <rect x="4" y="26" width="4" height="4" fill="#0f172a" />
                          <rect x="12" y="26" width="4" height="4" fill="#0f172a" />
                          <rect x="20" y="26" width="4" height="4" fill="#0f172a" />
                          <rect x="28" y="26" width="4" height="4" fill="#009688" />
                          <rect x="36" y="26" width="6" height="4" fill="#0f172a" />
                          <rect x="46" y="26" width="6" height="4" fill="#0f172a" />
                          <rect x="56" y="26" width="4" height="4" fill="#0f172a" />
                          <rect x="64" y="26" width="4" height="4" fill="#0f172a" />

                          <rect x="4" y="34" width="6" height="4" fill="#0f172a" />
                          <rect x="14" y="34" width="4" height="4" fill="#0f172a" />
                          <rect x="24" y="34" width="4" height="4" fill="#0f172a" />
                          <rect x="32" y="34" width="8" height="6" fill="#009688" />
                          <rect x="44" y="34" width="4" height="4" fill="#0f172a" />
                          <rect x="54" y="34" width="6" height="4" fill="#0f172a" />
                          <rect x="64" y="34" width="4" height="4" fill="#0f172a" />

                          <rect x="4" y="42" width="4" height="4" fill="#0f172a" />
                          <rect x="12" y="42" width="6" height="4" fill="#0f172a" />
                          <rect x="26" y="42" width="4" height="4" fill="#009688" />
                          <rect x="36" y="42" width="6" height="4" fill="#0f172a" />
                          <rect x="48" y="42" width="4" height="4" fill="#0f172a" />
                          <rect x="58" y="42" width="4" height="4" fill="#0f172a" />
                          <rect x="66" y="42" width="4" height="4" fill="#0f172a" />

                          <rect x="26" y="52" width="6" height="4" fill="#0f172a" />
                          <rect x="36" y="52" width="4" height="4" fill="#0f172a" />
                          <rect x="44" y="52" width="8" height="4" fill="#0f172a" />
                          <rect x="56" y="52" width="4" height="4" fill="#0f172a" />
                          <rect x="64" y="52" width="4" height="4" fill="#0f172a" />

                          <rect x="26" y="60" width="4" height="6" fill="#0f172a" />
                          <rect x="34" y="60" width="6" height="4" fill="#0f172a" />
                          <rect x="44" y="60" width="4" height="6" fill="#0f172a" />
                          <rect x="52" y="60" width="6" height="4" fill="#0f172a" />
                          <rect x="62" y="60" width="6" height="6" fill="#0f172a" />
                        </svg>
                      </div>

                      <div class="barcode-container">
                        <!-- High Density 1D Barcode Pattern -->
                        <div class="barcode-lines">
                          <span class="bar b-2"></span><span class="bar b-1"></span>
                          <span class="bar b-3"></span><span class="bar b-1"></span>
                          <span class="bar b-1"></span><span class="bar b-2"></span>
                          <span class="bar b-3"></span><span class="bar b-2"></span>
                          <span class="bar b-1"></span><span class="bar b-4"></span>
                          <span class="bar b-2"></span><span class="bar b-1"></span>
                          <span class="bar b-3"></span><span class="bar b-2"></span>
                          <span class="bar b-1"></span><span class="bar b-2"></span>
                          <span class="bar b-4"></span><span class="bar b-1"></span>
                          <span class="bar b-2"></span><span class="bar b-3"></span>
                          <span class="bar b-1"></span><span class="bar b-2"></span>
                          <span class="bar b-3"></span><span class="bar b-1"></span>
                          <span class="bar b-2"></span><span class="bar b-4"></span>
                          <span class="bar b-1"></span><span class="bar b-3"></span>
                        </div>
                        <div class="barcode-string">*ARCH-EMP-{{ formatEmpId(user.emp_id || user.id) }}*</div>
                      </div>
                    </div>
                  </div>

                  <!-- Card Bottom Safety Microtext Stripe -->
                  <div class="id-card-bottom-strip">
                    <span>SECURITY CLEARANCE LEVEL 1 • {{ cardCompanyName }} AUTHORIZED</span>
                  </div>
                </div>

                <!-- ================= BACK OF ID CARD ================= -->
                <div class="id-card-face id-card-back">
                  <!-- Lanyard Oval Punch Slot -->
                  <div class="lanyard-slot-hole">
                    <div class="slot-cutout"></div>
                  </div>

                  <!-- Magnetic Stripe -->
                  <div class="magnetic-stripe"></div>

                  <!-- Back Content Area -->
                  <div class="id-back-content">
                    <!-- Registered Office Contact Block -->
                    <div class="back-section company-info-block">
                      <div class="back-brand-title">
                        <i class="fas fa-building"></i>
                        <span>{{ isArchEnterprises ? 'ARCH ENTERPRISES' : 'ARCH IT SOLUTIONS & ENTERPRISES' }}</span>
                      </div>
                      <p class="company-address-text">
                        Plot No. 49, Prathamesh, Khutwadnagar, Nashik, Maharashtra - 422008
                      </p>
                      <div class="back-contact-pills">
                        <span><i class="fas fa-phone-alt"></i> +91 8390704453</span>
                        <span><i class="fas fa-globe"></i> {{ isArchEnterprises ? 'www.archenterprises.co.in' : 'www.it.archenterprises.co.in' }}</span>
                      </div>
                    </div>

                    <!-- Cardholder Residence & Emergency Info -->
                    <div class="back-section employee-residence-block">
                      <div class="back-section-heading">
                        <i class="fas fa-map-marker-alt"></i> RESIDENTIAL ADDRESS
                      </div>
                      <p class="residence-address-text">
                        {{ user.address || '06, Smita Bunglow, Near Saptsthrungi Devi Temple, Bahaduri - 422205' }}
                      </p>
                      <div class="residence-meta-grid">
                        <div class="res-meta-item">
                          <span class="res-label">City:</span>
                          <span class="res-val">{{ user.city || 'NASHIK' }}</span>
                        </div>
                        <div class="res-meta-item">
                          <span class="res-label">DOB:</span>
                          <span class="res-val">{{ formatDate(user.dateofbirth) }}</span>
                        </div>
                        <div class="res-meta-item">
                          <span class="res-label">Emergency:</span>
                          <span class="res-val">{{ user.mobile || '+91 9322880856' }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Terms of Card Issuance -->
                    <div class="back-section terms-block">
                      <div class="back-section-heading">
                        <i class="fas fa-shield-alt"></i> TERMS & CONDITIONS
                      </div>
                      <ol class="terms-list">
                        <li>This card is official company property and must be carried at all times on premises.</li>
                        <li>Non-transferable; report loss immediately to HR & Security.</li>
                        <li>If found, please drop in nearest mailbox or return to the registered office.</li>
                      </ol>
                    </div>

                    <!-- Official Authorization & Seal -->
                    <div class="back-signatory-block">
                      <div class="stamp-seal-badge">
                        <div class="seal-circle">
                          <i class="fas fa-stamp"></i>
                          <span>ARCH CERTIFIED</span>
                        </div>
                      </div>
                      <div class="signatory-signature">
                        <img 
                          v-if="signatureImage" 
                          :src="signatureImage" 
                          alt="Authorized Signatory" 
                          class="signature-asset-img"
                        />
                        <div v-else class="signature-text-fallback">Prasad W.</div>
                        <div class="signature-line"></div>
                        <span class="signatory-label">Authorized Signatory</span>
                      </div>
                    </div>
                  </div>

                  <!-- Card Bottom Bar -->
                  <div class="id-card-bottom-strip back-strip">
                    <span>IF FOUND PLEASE RETURN TO ARCH IT SOLUTIONS • NASHIK</span>
                  </div>
                </div>
              </div>

              <!-- Interactive Card Controls Below Badge -->
              <div class="card-interaction-dock">
                <button 
                  type="button" 
                  class="dock-pill-btn" 
                  @click="toggleCardSide"
                  :class="{ active: isFlipped }"
                >
                  <i class="fas fa-retweet"></i>
                  <span>{{ isFlipped ? 'View Front Side' : 'Flip to Back Side' }}</span>
                </button>
                <button 
                  type="button" 
                  class="dock-pill-btn"
                  @click="copyEmployeeId"
                >
                  <i class="fas fa-copy"></i>
                  <span>Copy ID</span>
                </button>
                <button 
                  type="button" 
                  class="dock-pill-btn"
                  @click="printCard"
                >
                  <i class="fas fa-download"></i>
                  <span>Download / Print</span>
                </button>
              </div>
            </div>

            <!-- RIGHT COLUMN: OFFICIAL PROFILE DOSSIER -->
            <div class="profile-right-premium">
              <!-- Personal Information Dossier -->
              <div class="info-section dossier-card">
                <div class="section-header">
                  <div class="header-icon-pill">
                    <i class="fas fa-user-shield"></i>
                  </div>
                  <div>
                    <span class="section-title">Personal & Employment Dossier</span>
                    <span class="section-sub">Official HR verified credentials</span>
                  </div>
                </div>

                <div class="info-grid">
                  <div class="info-item">
                    <label><i class="fas fa-envelope"></i> Work / Primary Email</label>
                    <p class="highlight-val">{{ user.email }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-phone-alt"></i> Mobile Number</label>
                    <p class="highlight-val">{{ user.mobile || '—' }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-id-card"></i> Employee ID Code</label>
                    <p class="code-val">ARCH-{{ formatEmpId(user.emp_id || user.id) }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-briefcase"></i> Assigned Department</label>
                    <p>{{ user.department || 'IT Lead / Engineering' }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-venus-mars"></i> Gender</label>
                    <p>{{ user.gender || '—' }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-tint"></i> Blood Group</label>
                    <p><span class="blood-pill-inline">{{ user.bloodgroup || '—' }}</span></p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-calendar-alt"></i> Date of Birth</label>
                    <p>{{ formatDate(user.dateofbirth) }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-map-marker-alt"></i> Registered City</label>
                    <p>{{ user.city || '—' }}</p>
                  </div>
                  <div class="info-item full-width">
                    <label><i class="fas fa-location-dot"></i> Permanent Residence Address</label>
                    <p class="address-text">{{ user.address || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Social Links & Online Portfolios -->
              <div class="info-section social-dossier-card">
                <div class="section-header">
                  <div class="header-icon-pill social-pill">
                    <i class="fas fa-share-nodes"></i>
                  </div>
                  <div>
                    <span class="section-title">Professional & Social Connect</span>
                    <span class="section-sub">External links and professional profiles</span>
                  </div>
                </div>

                <div v-if="user.instagram || user.portfolio || user.youtube || user.linkedin" class="social-links">
                  <a v-if="user.instagram" :href="user.instagram" target="_blank" class="social-link instagram">
                    <i class="fab fa-instagram"></i> Instagram
                  </a>
                  <a v-if="user.portfolio" :href="user.portfolio" target="_blank" class="social-link portfolio">
                    <i class="fas fa-globe"></i> Portfolio
                  </a>
                  <a v-if="user.youtube" :href="user.youtube" target="_blank" class="social-link youtube">
                    <i class="fab fa-youtube"></i> YouTube
                  </a>
                  <a v-if="user.linkedin" :href="user.linkedin" target="_blank" class="social-link linkedin">
                    <i class="fab fa-linkedin"></i> LinkedIn
                  </a>
                </div>
                <div v-else class="empty-social-state">
                  <i class="fas fa-link-slash"></i>
                  <span>No social links attached yet. Click <strong>Edit Profile</strong> to add your portfolio or LinkedIn.</span>
                </div>
              </div>

              <!-- Security & Card Details Card -->
              <div class="info-section security-meta-card">
                <div class="security-meta-grid">
                  <div class="security-stat">
                    <i class="fas fa-badge-check text-emerald"></i>
                    <div>
                      <h4>Badge Status</h4>
                      <p>Active & In Good Standing</p>
                    </div>
                  </div>
                  <div class="security-stat">
                    <i class="fas fa-id-card-clip text-teal"></i>
                    <div>
                      <h4>Card Format</h4>
                      <p>Standard ISO/IEC 7810 ID-1</p>
                    </div>
                  </div>
                  <div class="security-stat">
                    <i class="fas fa-key-skeleton text-indigo"></i>
                    <div>
                      <h4>System Handle</h4>
                      <p>{{ user.handle || 'ajay' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ================= EDIT MODE ================= -->
          <template v-else>
            <div class="edit-mode-wrapper">
              <div class="edit-header-alert">
                <i class="fas fa-info-circle"></i>
                <span>Updating your personal details will instantly reflect on your official Company ID Card and system records.</span>
              </div>

              <form @submit.prevent="updateProfile" class="edit-form-premium" enctype="multipart/form-data">
                <div class="edit-form-grid">
                  <!-- Profile Photo Upload -->
                  <div class="form-field full-width">
                    <label><i class="fas fa-camera"></i> Official ID Card Photograph</label>
                    <div class="profile-upload-container">
                      <div class="profile-preview">
                        <img 
                          v-if="profilePreview || (profileImageUrl && !imageFailed)" 
                          :src="profilePreview || profileImageUrl" 
                          @error="handleImgError"
                          alt="Profile Preview"
                          class="profile-preview-img"
                        />
                        <div v-else class="profile-preview-placeholder">
                          <i class="fas fa-user-circle"></i>
                        </div>
                      </div>
                      <div class="upload-controls">
                        <div class="upload-btns-row">
                          <label class="upload-btn-premium">
                            <i class="fas fa-upload"></i> Upload New Photo
                            <input 
                              type="file" 
                              @change="handleImageUpload" 
                              accept="image/*"
                              hidden
                            />
                          </label>
                          <button type="button" class="remove-photo-btn" @click="removePhoto" v-if="profileImageUrl || profilePreview">
                            <i class="fas fa-trash-alt"></i> Remove Photo
                          </button>
                        </div>
                        <small class="upload-hint">Recommended: Square portrait with clear background, max 5MB (PNG/JPG)</small>
                      </div>
                    </div>
                  </div>

                  <div class="form-field">
                    <label><i class="fas fa-id-card"></i> Employee ID (System Fixed)</label>
                    <input v-model="form.emp_id" disabled class="readonly-field" />
                  </div>

                  <div class="form-field">
                    <label><i class="fas fa-user"></i> Full Name (Official Record)</label>
                    <input v-model="form.name" @input="validateName" placeholder="Enter your name" disabled class="readonly-field" />
                  </div>

                  <div class="form-field">
                    <label><i class="fas fa-envelope"></i> Email Address</label>
                    <input v-model="form.email" disabled class="readonly-field" />
                  </div>

                  <div class="form-field">
                    <label><i class="fas fa-phone-alt"></i> Mobile Number</label>
                    <div class="mobile-input-wrapper">
                      <span class="country-code">+91</span>
                      <input :value="form.mobile" @input="handleMobile" @keydown="allowOnlyNumbers" placeholder="9876543210" />
                    </div>
                    <small v-if="mobileError" class="error-text">Mobile number must be 10 digits</small>
                  </div>

                  <div class="form-field">
                    <label><i class="fas fa-venus-mars"></i> Gender</label>
                    <select v-model="form.gender">
                      <option disabled value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div class="form-field">
                    <label><i class="fas fa-tint"></i> Blood Group</label>
                    <select v-model="form.bloodgroup">
                      <option disabled value="">Select Blood Group</option>
                      <option>A+</option><option>A-</option>
                      <option>B+</option><option>B-</option>
                      <option>AB+</option><option>AB-</option>
                      <option>O+</option><option>O-</option>
                    </select>
                  </div>

                  <div class="form-field">
                    <label><i class="fas fa-calendar-alt"></i> Date of Birth</label>
                    <input type="date" v-model="form.dateofbirth" disabled class="readonly-field" />
                  </div>

                  <div class="form-field">
                    <label><i class="fas fa-city"></i> City</label>
                    <input v-model="form.city" @input="validateCity" placeholder="Enter your city" />
                    <small v-if="cityError" class="error-text">City name is required</small>
                  </div>

                  <div class="form-field full-width">
                    <label><i class="fas fa-location-dot"></i> Permanent Address (Printed on ID Card Back)</label>
                    <textarea v-model="form.address" @input="validateAddress" rows="3" placeholder="Enter your full residential address"></textarea>
                    <small v-if="addressError" class="error-text">Address is required for ID Card documentation</small>
                  </div>

                  <!-- Social Links Section -->
                  <div class="form-field full-width social-section">
                    <label><i class="fab fa-instagram"></i> Instagram Profile</label>
                    <input v-model="form.instagram" placeholder="https://instagram.com/username" />
                  </div>

                  <div class="form-field">
                    <label><i class="fas fa-briefcase"></i> Portfolio Website</label>
                    <input v-model="form.portfolio" placeholder="https://yourwebsite.com" />
                  </div>

                  <div class="form-field">
                    <label><i class="fab fa-youtube"></i> YouTube Channel</label>
                    <input v-model="form.youtube" placeholder="https://youtube.com/@channel" />
                  </div>

                  <div class="form-field full-width">
                    <label><i class="fab fa-linkedin"></i> LinkedIn Profile</label>
                    <input v-model="form.linkedin" placeholder="https://linkedin.com/in/username" />
                  </div>

                  <!-- Password Change Section -->
                  <div class="form-field full-width password-section">
                    <div class="section-header">
                      <i class="fas fa-lock"></i>
                      <span>Change Security Password (Optional)</span>
                    </div>
                    <div class="password-grid">
                      <div class="form-field">
                        <label>Current Password</label>
                        <input type="password" v-model="form.current_password" placeholder="Enter current password" />
                      </div>
                      <div class="form-field">
                        <label>New Password</label>
                        <input type="password" v-model="form.new_password" placeholder="Enter new password" />
                      </div>
                      <div class="form-field">
                        <label>Confirm Password</label>
                        <input type="password" v-model="form.new_password_confirmation" placeholder="Confirm new password" />
                      </div>
                    </div>
                    <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
                  </div>
                </div>

                <div class="form-actions-premium">
                  <button type="button" class="btn-cancel-premium" @click="cancelEdit">
                    <i class="fas fa-times"></i> Cancel
                  </button>
                  <button type="submit" class="btn-submit-premium">
                    <i class="fas fa-save"></i> Save & Update ID Card
                  </button>
                </div>
              </form>
            </div>
          </template>
        </div>

        <div v-else class="loading-container">
          <div class="spinner"></div>
          <p>Loading company ID card credentials...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'
import logoArchEnterprisesTransparent from '@/assets/logo-arch-enterprises-transparent.png'
import logoArchITTransparent from '@/assets/logo-arch-it-transparent.png'
import signatureImg from '@/assets/signature.png'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "UpdateProfile",
  components: { Sidebar },

  data() {
    let localUser = null;
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        localUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse cached user:', e);
    }

    return {
      companyLogo: logoArchITTransparent,
      signatureImage: signatureImg,
      isFlipped: false,
      cityError: false,
      addressError: false,
      mobileError: false,
      nameError: false,
      isMobile: false,
      isSidebarVisible: true,
      user: localUser,
      editMode: false,
      profileImageFile: null,
      profilePreview: null,
      removePhotoFlag: false,
      cacheBuster: Date.now(),
      imageFailed: false,
      form: {
        mobile: localUser?.mobile || '',
        instagram: localUser?.instagram || '',
        portfolio: localUser?.portfolio || '',
        youtube: localUser?.youtube || '',
        linkedin: localUser?.linkedin || '',
        dateofbirth: localUser?.dateofbirth || '',
        city: localUser?.city || '',
        address: localUser?.address || '',
        name: localUser?.name || '',
        emp_id: localUser?.emp_id || localUser?.id || '',
        email: localUser?.email || '',
        gender: localUser?.gender || '',
        bloodgroup: localUser?.bloodgroup || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      },
      passwordError: ''
    }
  },

  computed: {
    isArchEnterprises() {
      const dept = (this.user?.department || '').trim().toLowerCase();
      return (
        dept === 'management' ||
        dept === 'service' ||
        dept === 'hr' ||
        dept === 'ownership' ||
        dept.includes('management') ||
        dept.includes('service') ||
        dept.includes('hr') ||
        dept.includes('ownership')
      );
    },
    cardCompanyName() {
      return this.isArchEnterprises ? 'ARCH ENTERPRISES' : 'ARCH IT SOLUTIONS';
    },
    cardCompanyLogo() {
      return this.isArchEnterprises ? logoArchEnterprisesTransparent : logoArchITTransparent;
    },
    profileImageUrl() {
      if (!this.user || !this.user.profile_photo) return null
      const photo = this.user.profile_photo
      if (typeof photo === 'string' && (photo.startsWith('http://') || photo.startsWith('https://'))) {
        return photo
      }
      return `https://employees.archenterprises.co.in/backend/public/storage/${photo}?v=${this.cacheBuster}`
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchUserProfile()
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  },

  methods: {
    toggleCardSide() {
      this.isFlipped = !this.isFlipped
    },

    formatEmpId(id) {
      if (!id) return '0107'
      const num = String(id).replace(/\D/g, '')
      return num ? num.padStart(4, '0') : String(id).toUpperCase()
    },

    formatDate(date) {
      if (!date) return '—'
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },

    copyEmployeeId() {
      if (!this.user) return
      const idString = `ARCH-${this.formatEmpId(this.user.emp_id || this.user.id)}`
      navigator.clipboard?.writeText(idString).then(() => {
        toastSuccess(`Employee ID ${idString} copied to clipboard!`)
      }).catch(() => {
        toastSuccess(`Employee ID: ${idString}`)
      })
    },

    printCard() {
      window.print()
    },

    validateAddress() {
      this.form.address = this.form.address.replace(/\s+/g, ' ').trimStart()
      this.addressError = this.form.address.trim() === ''
    },

    validateCity() {
      this.form.city = this.form.city.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trimStart()
      this.cityError = this.form.city.trim() === ''
    },

    validateName() {
      this.form.name = this.form.name.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trimStart()
      this.nameError = this.form.name.trim() === ''
    },

    allowOnlyNumbers(e) {
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
      if (allowedKeys.includes(e.key)) return
      if (!/^\d$/.test(e.key)) e.preventDefault()
    },

    handleMobile(e) {
      let value = e.target.value.replace(/\D/g, '')
      if (value.startsWith('91')) value = value.slice(2)
      this.form.mobile = value.slice(0, 10)
      this.mobileError = this.form.mobile.length !== 10
    },

    normalizeUrl(url) {
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return `https://${url}`
    },

    handleImageUpload(e) {
      const file = e.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        toastWarning('Please upload an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toastWarning('Image size should be less than 5MB')
        return
      }

      this.profileImageFile = file
      this.removePhotoFlag = false
      this.imageFailed = false
      const reader = new FileReader()
      reader.onload = (event) => {
        this.profilePreview = event.target.result
      }
      reader.readAsDataURL(file)
    },

    handleImgError() {
      if (!this.profilePreview) {
        this.imageFailed = true
      }
    },

    removePhoto() {
      this.profileImageFile = null
      this.profilePreview = null
      this.form.profile_photo = null
      if (this.user) {
        this.user.profile_photo = null
      }
      this.removePhotoFlag = true
      this.imageFailed = false
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    async fetchUserProfile() {
      try {
        const res = await axios.get('/api/user-profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const fetchedUser = res.data?.data || res.data;
        if (fetchedUser) {
          this.user = fetchedUser
          localStorage.setItem('user', JSON.stringify(fetchedUser))
          this.cacheBuster = Date.now()
          this.imageFailed = false
          this.form = {
            ...this.user,
            instagram: this.user.instagram || '',
            portfolio: this.user.portfolio || '',
            youtube: this.user.youtube || '',
            linkedin: this.user.linkedin || '',
            dateofbirth: this.user.dateofbirth || '',
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        // If we already have localUser from localStorage, don't show alarming error unless necessary
        if (!this.user) {
          toastError('Failed to load profile')
        }
      }
    },

    cancelEdit() {
      this.editMode = false
      this.removePhotoFlag = false
      this.imageFailed = false
      this.form = {
        ...this.user,
        instagram: this.user.instagram || '',
        portfolio: this.user.portfolio || '',
        youtube: this.user.youtube || '',
        linkedin: this.user.linkedin || '',
        dateofbirth: this.user.dateofbirth || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      }
      this.profileImageFile = null
      this.profilePreview = null
      this.passwordError = ''
      this.fetchUserProfile()
    },

    async updateProfile() {
      try {
        this.passwordError = ''

        if (this.form.new_password || this.form.new_password_confirmation || this.form.current_password) {
          if (!this.form.current_password || !this.form.new_password || !this.form.new_password_confirmation) {
            this.passwordError = 'All password fields are required to change password.'
            return
          }
          if (this.form.new_password !== this.form.new_password_confirmation) {
            this.passwordError = 'New passwords do not match.'
            return
          }
        }

        this.form.instagram = this.normalizeUrl(this.form.instagram)
        this.form.portfolio = this.normalizeUrl(this.form.portfolio)
        this.form.youtube = this.normalizeUrl(this.form.youtube)
        this.form.linkedin = this.normalizeUrl(this.form.linkedin)

        const formData = new FormData()
        
        Object.keys(this.form).forEach(key => {
          if (!['current_password', 'new_password', 'new_password_confirmation'].includes(key)) {
            if (this.form[key] !== null && this.form[key] !== undefined && this.form[key] !== '') {
              if (key === 'dateofbirth' && this.form[key]) {
                const dateValue = new Date(this.form[key])
                if (!isNaN(dateValue.getTime())) {
                  const formattedDate = dateValue.toISOString().split('T')[0]
                  formData.append(key, formattedDate)
                } else {
                  formData.append(key, this.form[key])
                }
              } else {
                formData.append(key, this.form[key])
              }
            }
          }
        })

        if (this.profileImageFile) {
          formData.append('profile_photo', this.profileImageFile)
          formData.append('photo', this.profileImageFile)
        } else if (this.removePhotoFlag) {
          formData.append('remove_photo', '1')
        }

        const response = await axios.post('/api/update-profile', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        })

        const updatedUser = response.data?.user || this.user
        this.cacheBuster = Date.now()

        if (updatedUser) {
          this.user = { ...this.user, ...updatedUser }

          try {
            const storedUserStr = localStorage.getItem('user')
            const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {}
            const mergedUser = { ...storedUser, ...updatedUser }
            localStorage.setItem('user', JSON.stringify(mergedUser))

            if (updatedUser.id) {
              if (updatedUser.profile_photo) {
                const freshPhotoUrl = `https://employees.archenterprises.co.in/backend/public/storage/${updatedUser.profile_photo}?v=${this.cacheBuster}`
                localStorage.setItem(`profilePhoto_${updatedUser.id}`, freshPhotoUrl)
              } else if (this.removePhotoFlag) {
                localStorage.removeItem(`profilePhoto_${updatedUser.id}`)
              }
            }

            window.dispatchEvent(new CustomEvent('auth-change', { detail: mergedUser }))
          } catch (storageErr) {
            console.error('Failed to sync auth in storage:', storageErr)
          }
        }

        if (this.form.current_password && this.form.new_password) {
          await this.changePassword()
        }

        this.editMode = false
        this.profileImageFile = null
        this.profilePreview = null
        this.removePhotoFlag = false
        this.imageFailed = false
        await this.fetchUserProfile()
        toastSuccess('Profile & Company ID Card updated successfully!')
      } catch (err) {
        console.error('Profile update failed:', err)
        toastError('Failed to update profile')
      }
    },

    async changePassword() {
      try {
        const passwordData = {
          current_password: this.form.current_password,
          new_password: this.form.new_password,
          new_password_confirmation: this.form.new_password_confirmation
        }
        await axios.post('/api/change-password', passwordData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        toastSuccess('Password changed successfully!')
      } catch (err) {
        console.error('Password change failed:', err)
        this.passwordError = err.response?.data?.message || 'Failed to change password.'
        throw err
      }
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');

/* Master Variables */
:root {
  --primary: #009688;
  --primary-dark: #00796b;
  --primary-gradient: linear-gradient(135deg, #009688 0%, #004d40 100%);
  --accent: #0284c7;
  --card-width: 350px;
  --card-height: 570px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.layout {
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

.main-content {
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: 100vh;
}

.profile-card-premium {
  flex: 1;
  background: #ffffff;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

/* ================= HEADER SECTION ================= */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.title-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #009688 0%, #004d40 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 26px;
  box-shadow: 0 8px 20px rgba(0, 150, 136, 0.25);
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.content-header-modern h1 {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0;
}

.status-verified-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.subtitle-modern {
  color: #64748b;
  font-size: 14px;
  margin-top: 4px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.secondary-btn {
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.secondary-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.print-btn {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.print-btn:hover {
  background: #d1fae5;
  color: #065f46;
  transform: translateY(-1px);
}

.edit-btn-premium {
  background: linear-gradient(135deg, #009688 0%, #00796b 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(0, 150, 136, 0.3);
}

.edit-btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 150, 136, 0.4);
}

.cancel-header-btn {
  background: #f1f5f9;
  color: #475569;
}

.cancel-header-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* ================= PROFILE CONTAINER ================= */
.profile-container-premium {
  display: flex;
  gap: 36px;
  align-items: flex-start;
}

/* ================= ID CARD STAGE (LEFT) ================= */
.id-card-stage {
  flex: 0 0 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  perspective: 1200px;
}

/* Lanyard Rig & Strap */
.lanyard-rig {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: -14px;
  z-index: 10;
  pointer-events: none;
}

.lanyard-strap {
  width: 52px;
  height: 55px;
  background: repeating-linear-gradient(
    45deg,
    #004d40,
    #004d40 10px,
    #00695c 10px,
    #00695c 20px
  );
  border-radius: 4px 4px 0 0;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.strap-text {
  position: absolute;
  writing-mode: vertical-lr;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

.lanyard-ring {
  width: 22px;
  height: 12px;
  border: 3px solid #94a3b8;
  border-radius: 50%;
  background: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: -3px;
}

.lanyard-clip {
  width: 32px;
  height: 22px;
  background: linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%);
  border-radius: 4px;
  border: 1px solid #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  position: relative;
}

.clip-jaw {
  width: 14px;
  height: 14px;
  background: #475569;
  border-radius: 2px;
  border: 1px solid #334155;
}

/* 3D ID Card Wrapper */
.id-card-wrapper {
  width: 350px;
  min-height: 575px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
}

.id-card-wrapper.is-flipped {
  transform: rotateY(180deg);
}

/* Face Shared Styles */
.id-card-face {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 
    0 20px 40px -15px rgba(0, 77, 64, 0.25),
    0 0 0 1px rgba(15, 23, 42, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Lanyard Slot Hole Cutout */
.lanyard-slot-hole {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}

.slot-cutout {
  width: 44px;
  height: 9px;
  background: #f1f5f9;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* ================= FRONT OF CARD ================= */
.id-card-front {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.id-card-header {
  background: linear-gradient(135deg, #004d40 0%, #00796b 50%, #009688 100%);
  padding: 26px 18px 12px 18px;
  color: white;
  position: relative;
  border-bottom: 3px solid #ffb300;
}

.company-brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-box {
  width: 48px;
  height: 48px;
  background: transparent;
  border-radius: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.company-logo-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}

.company-logo-fallback {
  color: #009688;
  font-size: 22px;
}

.company-text {
  flex: 1;
}

.company-name {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.company-division {
  font-size: 9px;
  font-weight: 700;
  color: #a7f3d0;
  letter-spacing: 0.6px;
  display: block;
  margin-top: 2px;
}

/* Hologram Seal */
.hologram-seal {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef08a 0%, #67e8f9 50%, #f472b6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.holo-shimmer {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 70%
  );
  animation: shimmer 3s infinite linear;
}

@keyframes shimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.holo-icon {
  font-size: 14px;
  color: rgba(15, 23, 42, 0.7);
  z-index: 2;
}

.badge-ribbon-strip {
  margin-top: 10px;
  text-align: center;
  background: rgba(0, 0, 0, 0.25);
  padding: 3px 0;
  border-radius: 6px;
}

.badge-ribbon-strip span {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #fef08a;
}

/* ID Card Body */
.id-card-body {
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Photo Frame Container */
.id-photo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  margin-bottom: 12px;
}

.id-photo-frame {
  width: 124px;
  height: 130px;
  border-radius: 16px;
  background: #f8fafc;
  border: 3.5px solid #009688;
  box-shadow: 0 8px 24px rgba(0, 150, 136, 0.25);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.id-photo-frame:hover {
  transform: scale(1.02);
}

.id-employee-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.id-photo-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: #94a3b8;
  background: #f1f5f9;
}

.photo-overlay-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 77, 64, 0.85);
  backdrop-filter: blur(4px);
  color: #a7f3d0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 3px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Smart Chip Graphic Beside Photo */
.chip-nfc-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.smart-chip-graphic {
  width: 30px;
  height: 24px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 4px;
  border: 1px solid #b45309;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 2px;
  gap: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.chip-contact {
  background: rgba(254, 243, 199, 0.6);
  border-radius: 1px;
}

.nfc-wave {
  color: #64748b;
  font-size: 13px;
  transform: rotate(90deg);
}

/* Identity Name & Role */
.id-identity-info {
  margin-bottom: 14px;
}

.id-employee-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
  margin-bottom: 5px;
}

.id-role-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

/* Attributes Matrix */
.id-attributes-matrix {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  text-align: left;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 14px;
}

.matrix-item {
  display: flex;
  flex-direction: column;
}

.matrix-label {
  font-size: 9px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.matrix-value {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.emp-id-highlight {
  color: #00796b;
  font-family: 'Space Grotesk', monospace;
  font-weight: 800;
}

.blood-group-pill {
  color: #dc2626;
  font-weight: 800;
}

.status-perm {
  color: #059669;
  font-weight: 800;
}

.email-highlight {
  color: #0284c7;
  font-size: 10.5px;
  font-weight: 750;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
}

/* Codes Section: Barcode & QR */
.id-card-footer-codes {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 4px;
  border-top: 1px dashed #cbd5e1;
}

.qr-code-box {
  width: 52px;
  height: 52px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 3px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.qr-svg {
  width: 100%;
  height: 100%;
}

.barcode-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.barcode-lines {
  display: flex;
  align-items: stretch;
  height: 32px;
  gap: 1.5px;
  width: 100%;
  justify-content: center;
}

.bar {
  background: #0f172a;
  border-radius: 0.5px;
}

.b-1 { width: 1.5px; }
.b-2 { width: 3px; }
.b-3 { width: 4.5px; }
.b-4 { width: 6px; }

.barcode-string {
  font-family: 'Courier New', monospace;
  font-size: 9px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 1px;
  margin-top: 3px;
}

/* Card Bottom Microtext Strip */
.id-card-bottom-strip {
  background: #004d40;
  color: rgba(255, 255, 255, 0.85);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
  padding: 6px 0;
  border-top: 2px solid #ffb300;
}

/* ================= BACK OF CARD ================= */
.id-card-back {
  transform: rotateY(180deg);
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.magnetic-stripe {
  width: 100%;
  height: 48px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  margin-top: 28px;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6);
}

.magnetic-stripe::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
}

.id-back-content {
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.back-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: left;
}

.company-info-block {
  border-left: 3px solid #009688;
}

.back-brand-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #004d40;
  margin-bottom: 4px;
}

.company-address-text {
  font-size: 9.5px;
  color: #475569;
  line-height: 1.4;
  margin-bottom: 6px;
}

.back-contact-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 9px;
  color: #0284c7;
  font-weight: 700;
}

/* Residence Section */
.employee-residence-block {
  border-left: 3px solid #0284c7;
}

.back-section-heading {
  font-size: 9px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.residence-address-text {
  font-size: 10px;
  color: #0f172a;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 6px;
}

.residence-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  font-size: 9px;
}

.res-meta-item {
  display: flex;
  flex-direction: column;
}

.res-label {
  color: #94a3b8;
  font-weight: 700;
}

.res-val {
  color: #0f172a;
  font-weight: 700;
}

/* Terms */
.terms-block {
  background: #f8fafc;
}

.terms-list {
  padding-left: 14px;
  font-size: 8px;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
}

.terms-list li {
  margin-bottom: 2px;
}

/* Signatory & Stamp Block */
.back-signatory-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
  padding-top: 6px;
}

.stamp-seal-badge {
  display: flex;
  align-items: center;
}

.seal-circle {
  width: 58px;
  height: 58px;
  border: 2px dashed #009688;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #00796b;
  transform: rotate(-12deg);
}

.seal-circle i {
  font-size: 16px;
}

.seal-circle span {
  font-size: 6px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.signatory-signature {
  text-align: center;
  width: 120px;
}

.signature-asset-img {
  height: 38px;
  object-fit: contain;
  margin-bottom: -4px;
}

.signature-text-fallback {
  font-family: 'Brush Script MT', cursive;
  font-size: 20px;
  color: #004d40;
}

.signature-line {
  width: 100%;
  height: 1px;
  background: #0f172a;
  margin: 3px 0;
}

.signatory-label {
  font-size: 8px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.back-strip {
  background: #1e293b;
  border-top-color: #38bdf8;
}

/* ================= INTERACTION DOCK ================= */
.card-interaction-dock {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
}

.dock-pill-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.dock-pill-btn:hover {
  background: #009688;
  color: #ffffff;
  border-color: #009688;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 150, 136, 0.25);
}

.dock-pill-btn.active {
  background: #004d40;
  color: #ffffff;
  border-color: #004d40;
}

/* ================= RIGHT COLUMN: PROFILE DOSSIER ================= */
.profile-right-premium {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: #ffffff;
  border-radius: 24px;
  padding: 26px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.header-icon-pill {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.header-icon-pill.social-pill {
  background: #fdf2f8;
  color: #db2777;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  display: block;
}

.section-sub {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-item label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-item label i {
  color: #009688;
  font-size: 12px;
}

.info-item p {
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
}

.highlight-val {
  color: #00796b !important;
  font-weight: 700 !important;
}

.code-val {
  font-family: 'Space Grotesk', monospace;
  font-weight: 800;
  color: #0284c7;
}

.blood-pill-inline {
  display: inline-block;
  background: #fee2e2;
  color: #dc2626;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.address-text {
  line-height: 1.5;
}

/* Social Links */
.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 30px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.social-link.instagram {
  background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  color: white;
}

.social-link.portfolio {
  background: #0f172a;
  color: white;
}

.social-link.youtube {
  background: #dc2626;
  color: white;
}

.social-link.linkedin {
  background: #0077b5;
  color: white;
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.empty-social-state {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  font-size: 13px;
}

.empty-social-state i {
  font-size: 20px;
  color: #94a3b8;
}

/* Security Meta Cards */
.security-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.security-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 14px 18px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.security-stat i {
  font-size: 24px;
}

.text-emerald { color: #059669; }
.text-teal { color: #0d9488; }
.text-indigo { color: #6366f1; }

.security-stat h4 {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.security-stat p {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

/* ================= EDIT MODE ================= */
.edit-mode-wrapper {
  width: 100%;
}

.edit-header-alert {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 16px;
  padding: 14px 20px;
  color: #0f766e;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.edit-header-alert i {
  font-size: 18px;
  color: #0d9488;
}

.edit-form-premium {
  width: 100%;
}

.edit-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
}

.form-field label {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-field label i {
  color: #009688;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 12px 16px;
  border: 1.5px solid #cbd5e1;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.25s ease;
  font-family: inherit;
  background: #ffffff;
  color: #0f172a;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #009688;
  box-shadow: 0 0 0 3px rgba(0, 150, 136, 0.15);
}

.readonly-field {
  background: #f1f5f9 !important;
  color: #64748b !important;
  cursor: not-allowed;
  border-color: #e2e8f0 !important;
}

.mobile-input-wrapper {
  display: flex;
  align-items: center;
  border: 1.5px solid #cbd5e1;
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
}

.mobile-input-wrapper .country-code {
  padding: 12px 16px;
  background: #f1f5f9;
  font-weight: 700;
  color: #475569;
  border-right: 1.5px solid #cbd5e1;
}

.mobile-input-wrapper input {
  flex: 1;
  border: none;
  padding: 12px 16px;
  border-radius: 0;
}

.mobile-input-wrapper input:focus {
  box-shadow: none;
}

/* Profile Photo Uploader */
.profile-upload-container {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 20px;
  border: 1.5px dashed #cbd5e1;
}

.profile-preview {
  width: 96px;
  height: 96px;
  border-radius: 18px;
  overflow: hidden;
  background: #e2e8f0;
  border: 3px solid #009688;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-preview-placeholder {
  font-size: 54px;
  color: #94a3b8;
}

.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-btns-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-btn-premium {
  background: linear-gradient(135deg, #009688 0%, #00796b 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(0, 150, 136, 0.25);
}

.upload-btn-premium:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 150, 136, 0.35);
}

.remove-photo-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.remove-photo-btn:hover {
  background: #fca5a5;
  color: #991b1b;
}

.upload-hint {
  font-size: 11px;
  color: #64748b;
}

/* Password Change Box */
.password-section {
  background: #f8fafc;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.password-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.error-text {
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
  font-weight: 600;
}

/* Form Actions */
.form-actions-premium {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel-premium {
  padding: 12px 24px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  color: #475569;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-cancel-premium:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-submit-premium {
  padding: 12px 28px;
  background: linear-gradient(135deg, #009688 0%, #00796b 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(0, 150, 136, 0.35);
  transition: all 0.25s ease;
}

.btn-submit-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 150, 136, 0.45);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #64748b;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #009688;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ================= PRINT MEDIA QUERIES ================= */
@media print {
  body * {
    visibility: hidden;
  }

  .id-card-wrapper,
  .id-card-wrapper * {
    visibility: visible;
  }

  .id-card-stage {
    position: static !important;
  }

  .lanyard-rig,
  .card-interaction-dock,
  .content-header-modern,
  .profile-right-premium {
    display: none !important;
  }

  .id-card-wrapper {
    position: absolute !important;
    left: 20px !important;
    top: 20px !important;
    transform: none !important;
  }

  .id-card-face {
    position: static !important;
    page-break-after: always;
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }
}

/* ================= RESPONSIVE ================= */
@media (max-width: 1100px) {
  .profile-container-premium {
    flex-direction: column;
    align-items: center;
  }

  .id-card-stage {
    flex: auto;
    width: 100%;
    max-width: 380px;
  }

  .profile-right-premium {
    width: 100%;
  }

  .security-meta-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }

  .profile-card-premium {
    padding: 20px;
    border-radius: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: stretch;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .id-card-wrapper {
    width: 100%;
    max-width: 340px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item.full-width {
    grid-column: span 1;
  }

  .edit-form-grid {
    grid-template-columns: 1fr;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .password-grid {
    grid-template-columns: 1fr;
  }

  .profile-upload-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .upload-btns-row {
    justify-content: center;
  }

  .form-actions-premium {
    flex-direction: column;
  }

  .btn-cancel-premium,
  .btn-submit-premium {
    justify-content: center;
  }
}
</style>