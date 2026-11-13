<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- 📱 Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <div class="mobile-title-icon">
              <i class="fas fa-file-signature"></i>
            </div>
            <span>Offer Letter</span>
          </div>
          <div class="mobile-header-actions">
            <button class="mobile-view-btn" @click="openOfferModal" title="View All Letters">
              <i class="fas fa-folder-open"></i>
              <span>All Offers</span>
            </button>
            <button class="btn-mobile-menu" @click="isSidebarVisible = !isSidebarVisible" aria-label="Toggle sidebar">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Top Banner -->
        <header class="offer-top-banner" v-else>
          <div class="banner-left">
            <div class="banner-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>EMPLOYMENT & ONBOARDING HUB</span>
              </span>
              <span class="status-meta-pill company-active-pill" :class="currentCompany.shortName.toLowerCase()">
                <i :class="form.company === 'Arch IT Solutions' ? 'fas fa-laptop-code' : 'fas fa-building'"></i>
                {{ currentCompany.name }}
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-file-alt"></i> {{ offerLetters.length }} Issued Letters
              </span>
              <span class="status-meta-pill template-pill">
                <i class="fas fa-stamp"></i> Official {{ currentCompany.shortName }} Template
              </span>
              <span class="status-meta-pill editing-pill" v-if="editingId">
                <i class="fas fa-pen"></i> Editing Mode (#{{ editingId }})
              </span>
            </div>
            <h1 class="page-title">Generate Offer Letter</h1>
            <p class="page-subtitle">
              Draft formal employment offers for <strong>{{ currentCompany.name }}</strong>, configure compensation & probation terms, and instantly generate official PDF documents.
            </p>
          </div>

          <div class="banner-right-actions">
            <button class="btn-view-letters" @click="openOfferModal" type="button">
              <i class="fas fa-folder-open"></i>
              <span>All Offer Letters</span>
              <span class="count-bubble" v-if="offerLetters.length > 0">{{ offerLetters.length }}</span>
            </button>
            <button class="btn-save-record" @click="saveOffer" :disabled="isSaving" type="button" :title="editingId ? 'Update offer letter in database' : 'Save offer letter to database'">
              <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              <span>{{ isSaving ? 'Saving...' : (editingId ? 'Update Record' : 'Save Record') }}</span>
            </button>
            <button class="btn-generate-pdf" @click="downloadPDF" :disabled="isDownloading" type="button" title="Download formatted A4 PDF">
              <i v-if="isDownloading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-file-pdf"></i>
              <span>{{ isDownloading ? 'Downloading...' : 'Download PDF' }}</span>
            </button>
          </div>
        </header>

        <!-- 🏢 Split-Pane Workspace -->
        <div class="workspace-grid">
          <!-- 📝 Left Pane: Form Editor Card -->
          <div class="editor-column">
            <div class="editor-card">
              <div class="card-header-clean">
                <div class="header-left-title">
                  <div class="header-icon-halo">
                    <i class="fas fa-user-edit"></i>
                  </div>
                  <div>
                    <h3 class="card-title">Candidate Details</h3>
                    <p class="card-desc">Enter hiring terms to generate the formal letter</p>
                  </div>
                </div>

                <div class="header-right-tools">
                  <button v-if="editingId" class="btn-reset-tool" @click="cancelEdit" title="Cancel Editing">
                    <i class="fas fa-times"></i> Cancel Edit
                  </button>
                  <button class="btn-clear-tool" @click="resetForm" title="Clear All Fields">
                    <i class="fas fa-redo"></i> Reset
                  </button>
                </div>
              </div>

              <!-- Form Fields -->
              <div class="editor-form-body">
                <!-- 🏢 Company Entity Switcher Selector -->
                <div class="company-selection-box">
                  <label class="field-label">
                    <span>Issuing Company Entity</span>
                    <span class="required-star">*</span>
                  </label>
                  <div class="company-toggle-cards">
                    <button 
                      type="button" 
                      class="company-selector-btn"
                      :class="{ 'selected': form.company === 'Arch Enterprises' }"
                      @click="setCompany('Arch Enterprises')"
                    >
                      <div class="company-badge-icon enterprises">
                        <i class="fas fa-building"></i>
                      </div>
                      <div class="company-info-text">
                        <span class="company-title-text">Arch Enterprises</span>
                        <span class="company-sub-text">IT & Enterprise Solutions</span>
                      </div>
                      <i v-if="form.company === 'Arch Enterprises'" class="fas fa-check-circle checkmark-active"></i>
                    </button>

                    <button 
                      type="button" 
                      class="company-selector-btn"
                      :class="{ 'selected': form.company === 'Arch IT Solutions' }"
                      @click="setCompany('Arch IT Solutions')"
                    >
                      <div class="company-badge-icon itsolutions">
                        <i class="fas fa-laptop-code"></i>
                      </div>
                      <div class="company-info-text">
                        <span class="company-title-text">Arch IT Solutions</span>
                        <span class="company-sub-text">Software & Cloud Tech</span>
                      </div>
                      <i v-if="form.company === 'Arch IT Solutions'" class="fas fa-check-circle checkmark-active"></i>
                    </button>
                  </div>
                </div>

                <div class="form-grid">
                  <!-- Candidate Name -->
                  <div class="form-field-group">
                    <label class="field-label">Candidate Name <span class="required-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-user input-icon"></i>
                      <input 
                        v-model="form.name" 
                        type="text" 
                        placeholder="e.g. Rahul Sharma" 
                        class="modern-input"
                      />
                    </div>
                  </div>

                  <!-- Position -->
                  <div class="form-field-group">
                    <label class="field-label">Position / Designation <span class="required-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-briefcase input-icon"></i>
                      <input 
                        v-model="form.position" 
                        type="text" 
                        placeholder="e.g. Full Stack Developer" 
                        class="modern-input"
                      />
                    </div>
                  </div>

                  <!-- Stipend / Salary -->
                  <div class="form-field-group">
                    <label class="field-label">Monthly Stipend / Salary (₹) <span class="required-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-rupee-sign input-icon"></i>
                      <input 
                        v-model="form.salary" 
                        type="text" 
                        placeholder="e.g. 25000" 
                        class="modern-input"
                      />
                    </div>
                  </div>

                  <!-- Probation Period -->
                  <div class="form-field-group">
                    <label class="field-label">Probation Period <span class="required-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-hourglass-half input-icon"></i>
                      <select v-model="form.probationPeriod" class="modern-select">
                        <option disabled value="">Select probation period</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                    </div>
                  </div>

                  <!-- Joining Date -->
                  <div class="form-field-group">
                    <label class="field-label">Joining Date <span class="required-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-calendar-alt input-icon"></i>
                      <input 
                        v-model="form.joiningDate" 
                        type="date" 
                        class="modern-input"
                      />
                    </div>
                  </div>

                  <!-- Work Type -->
                  <div class="form-field-group">
                    <label class="field-label">Work Model <span class="required-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-laptop-house input-icon"></i>
                      <select v-model="form.type" class="modern-select">
                        <option value="Onsite">🏢 Onsite</option>
                        <option value="Remote">🏠 Remote</option>
                        <option value="Hybrid">🔄 Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Action Button in Editor Card -->
                <div class="editor-actions-footer">
                  <div class="actions-left-summary" v-if="form.name">
                    <span class="preview-status-pill">
                      <i class="fas fa-check-circle text-success"></i> Ready for {{ currentCompany.shortName }}
                    </span>
                  </div>
                  <div class="actions-right-buttons">
                    <button type="button" class="btn-action-save" @click="saveOffer" :disabled="isSaving" :title="editingId ? 'Update details in database' : 'Save details to database'">
                      <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-save"></i>
                      <span>{{ isSaving ? 'Saving...' : (editingId ? 'Update Details' : 'Save Details') }}</span>
                    </button>
                    <button type="button" class="btn-generate-main" @click="downloadPDF" :disabled="isDownloading" title="Download official formatted A4 PDF">
                      <i v-if="isDownloading" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-file-pdf"></i>
                      <span>{{ isDownloading ? 'Downloading...' : 'Download PDF' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 📄 Right Pane: Live Document Canvas -->
          <div class="preview-column">
            <div class="preview-canvas-wrapper">
              <!-- Preview Canvas Toolbar -->
              <div class="preview-toolbar">
                <div class="toolbar-left-info">
                  <span class="canvas-tag">
                    <i class="fas fa-file-alt"></i> {{ currentCompany.shortName }} A4 PREVIEW
                  </span>
                  <span class="canvas-candidate" v-if="form.name">
                    {{ form.name }} • {{ form.position || 'Offer' }}
                  </span>
                </div>
                <div class="toolbar-right-actions">
                  <button class="btn-canvas-action btn-canvas-save" @click="saveOffer" :disabled="isSaving" title="Save Offer Letter Record">
                    <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-save"></i>
                    <span>{{ isSaving ? 'Saving...' : 'Save' }}</span>
                  </button>
                  <button class="btn-canvas-action btn-canvas-primary" @click="downloadPDF" :disabled="isDownloading" title="Download PDF Document">
                    <i v-if="isDownloading" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-download"></i>
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <!-- Real A4 Letterhead Document (Captured by html2pdf) -->
              <div class="document-scroll-container">
                <div ref="offerLetter" class="offer-letter-canvas" :class="{ 'mobile-preview': isMobile }">
                  <div class="letter-top-stripe" :style="{ background: currentCompany.stripeGradient }"></div>

                  <!-- Official Letterhead Header -->
                  <div class="letter-header" :class="{ 'mobile-header': isMobile }">
                    <div class="logo-box">
                      <img :src="currentCompanyLogo" class="company-logo" :class="{ 'mobile-logo': isMobile }" :alt="currentCompany.name" />
                    </div>
                    <div class="company-details">
                      <h2 class="company-name">{{ currentCompany.name }}</h2>
                      <p class="company-tagline">{{ currentCompany.tagline }}</p>
                      <p class="company-address">{{ currentCompany.address }}</p>
                      <p class="company-contact">
                        <span>Email: {{ currentCompany.email }}</span> • <span>Phone: {{ currentCompany.phone }}</span>
                      </p>
                    </div>
                  </div>

                  <div class="letter-divider"></div>

                  <!-- Date & Ref -->
                  <div class="letter-meta-row">
                    <div class="ref-number">
                      <span>Ref:</span> {{ currentCompany.refPrefix }}-{{ new Date().getFullYear() }}/{{ String(editingId || Math.floor(1000 + Math.random() * 9000)).padStart(4, '0') }}
                    </div>
                    <div class="letter-date">
                      <span>Date:</span> {{ todayDate }}
                    </div>
                  </div>

                  <!-- Recipient -->
                  <div class="letter-recipient">
                    <p class="to-label">To,</p>
                    <p class="candidate-recipient-name"><strong>{{ form.name || 'Candidate Full Name' }}</strong></p>
                  </div>

                  <!-- Subject -->
                  <div class="letter-subject">
                    <p class="subject-title"><strong>Subject: Formal Offer of Employment — {{ form.position || 'Position' }}</strong></p>
                  </div>

                  <!-- Letter Body -->
                  <div class="letter-body" :class="{ 'mobile-body': isMobile }">
                    <p class="salutation">Dear <strong>{{ form.name || 'Candidate' }}</strong>,</p>

                    <p>
                      We are delighted to formally offer you the position of <strong>{{ form.position || '________' }}</strong> with <strong>{{ currentCompany.name }}</strong>.
                    </p>

                    <p>
                      You will be placed on probation for a period of <strong>{{ form.probationPeriod || '________' }}</strong>. During this probation period, you will receive a monthly stipend of <strong>₹{{ formatAmount(form.salary) || '________' }}</strong>. Upon successful completion of your probation period, management reserves the right to review and revise your remuneration structure based on your demonstrated performance, contributions, and organizational alignment.
                    </p>

                    <p>
                      Your employment will officially commence on <strong>{{ formattedJoiningDate || '________' }}</strong> under an <strong>{{ form.type || 'Onsite' }}</strong> working model.
                    </p>

                    <p>
                      You will be reporting directly to the designated department head / HR Management and will be expected to adhere to all established company policies, code of conduct, and professional standards throughout your tenure.
                    </p>

                    <p>
                      This offer is contingent upon satisfactory completion of standard background verification and timely submission of all requested academic and professional documentation.
                    </p>

                    <p class="closing-remark">
                      We look forward to welcoming you to the {{ currentCompany.name }} family and wish you a highly successful and fulfilling career with us.
                    </p>
                  </div>

                  <!-- Signatures -->
                  <div class="signature-section" :class="{ 'mobile-signature': isMobile }">
                    <div class="sign-block left">
                      <div class="sign-line"></div>
                      <strong class="sign-title">AUTHORIZED SIGNATORY</strong>
                      <span class="sign-sub">{{ currentCompany.name }}</span>
                    </div>

                    <div class="sign-block right">
                      <div class="sign-line"></div>
                      <strong class="sign-title">{{ form.name || 'CANDIDATE SIGNATURE' }}</strong>
                      <span class="sign-sub">Acceptance of Offer</span>
                    </div>
                  </div>

                  <!-- Formal Letter Footer -->
                  <div class="letter-footer" :class="{ 'mobile-footer': isMobile }">
                    <div class="footer-divider"></div>
                    <div class="footer-meta-grid">
                      <div class="footer-col-left">
                        <strong class="footer-brand">{{ currentCompany.name }}</strong>
                        <p>{{ currentCompany.tagline }}</p>
                      </div>
                      <div class="footer-col-right">
                        <p><i class="fas fa-globe"></i> {{ currentCompany.website }}</p>
                        <p><i class="fas fa-envelope"></i> {{ currentCompany.email }}</p>
                      </div>
                    </div>
                    <div class="footer-confidential-notice">
                      <p>CONFIDENTIAL: This document is intended solely for the named recipient. Any unauthorized duplication or distribution is strictly prohibited.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 🌟 Modern Modal: All Offer Letters List -->
        <transition name="modal-fade">
          <div v-if="showOfferModal" class="modal-backdrop" @click.self="closeOfferModal">
            <div class="premium-modal large-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
              <div class="modal-top-accent"></div>
              
              <div class="modal-header-premium">
                <div class="header-icon-halo">
                  <i class="fas fa-folder-open"></i>
                </div>
                <div class="header-text">
                  <div class="modal-title-row">
                    <h2>All Issued Offer Letters</h2>
                    <span class="modal-header-badge">{{ offerLetters.length }} Total Records</span>
                  </div>
                  <p>Browse, review, edit, or filter offer records across Arch Enterprises & Arch IT Solutions</p>
                </div>
                <button class="modal-close-btn" @click="closeOfferModal" title="Close modal">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- Modal Toolbar with Search & Segmented Company Filter -->
              <div class="modal-toolbar">
                <div class="modal-search-wrapper">
                  <i class="fas fa-search search-icon"></i>
                  <input 
                    type="text" 
                    v-model="modalSearchQuery" 
                    placeholder="Search candidate name, designation..."
                    class="modal-search-input"
                  />
                  <button v-if="modalSearchQuery" class="clear-search-btn" @click="modalSearchQuery = ''" title="Clear search">
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <!-- Modern Segmented Company Filter Pills -->
                <div class="modal-company-pills">
                  <button 
                    type="button" 
                    class="company-filter-pill" 
                    :class="{ 'active': modalCompanyFilter === '' }"
                    @click="modalCompanyFilter = ''"
                  >
                    <span>All Entities</span>
                    <span class="filter-count-badge">{{ offerLetters.length }}</span>
                  </button>
                  <button 
                    type="button" 
                    class="company-filter-pill enterprises" 
                    :class="{ 'active': modalCompanyFilter === 'Arch Enterprises' }"
                    @click="modalCompanyFilter = 'Arch Enterprises'"
                  >
                    <i class="fas fa-building"></i>
                    <span>Arch Enterprises</span>
                  </button>
                  <button 
                    type="button" 
                    class="company-filter-pill itsolutions" 
                    :class="{ 'active': modalCompanyFilter === 'Arch IT Solutions' }"
                    @click="modalCompanyFilter = 'Arch IT Solutions'"
                  >
                    <i class="fas fa-laptop-code"></i>
                    <span>Arch IT Solutions</span>
                  </button>
                </div>

                <div class="modal-count-badge">
                  <span>Showing <strong>{{ filteredOfferLetters.length }}</strong> of {{ offerLetters.length }}</span>
                </div>
              </div>

              <div class="modal-body-premium">
                <!-- Mobile Card View -->
                <div class="mobile-offer-cards" v-if="isMobile">
                  <div v-for="offer in filteredOfferLetters" :key="offer.id" class="offer-card">
                    <div class="offer-card-header">
                      <div class="candidate-flex-row">
                        <div class="candidate-avatar-circle" :class="getAvatarColorClass(offer.name)">
                          {{ getInitials(offer.name) }}
                        </div>
                        <div class="candidate-meta-column">
                          <span class="candidate-full-name">{{ offer.name }}</span>
                          <span class="position-pill">{{ offer.position }}</span>
                        </div>
                      </div>
                      <span class="company-entity-badge mobile-pill" :class="getCompanyBadgeClass(offer.company)">
                        {{ (offer.company || '').includes('IT') ? 'Arch IT' : 'Arch Enterprises' }}
                      </span>
                    </div>
                    <div class="offer-card-body">
                      <div class="offer-row">
                        <span class="offer-label">Stipend</span>
                        <span class="stipend-amount-tag">₹{{ formatAmount(offer.salary) }}</span>
                      </div>
                      <div class="offer-row">
                        <span class="offer-label">Probation</span>
                        <span class="probation-badge">{{ offer.probation_period || '—' }}</span>
                      </div>
                      <div class="offer-row">
                        <span class="offer-label">Joining Date</span>
                        <span class="joining-date-pill">{{ formatDateSimple(offer.joining_date) }}</span>
                      </div>
                      <div class="offer-row">
                        <span class="offer-label">Model</span>
                        <span class="work-type-pill" :class="offer.work_type ? offer.work_type.toLowerCase() : 'onsite'">{{ offer.work_type }}</span>
                      </div>
                    </div>
                    <div class="offer-card-actions">
                      <button class="action-pill-btn view" @click="viewLetter(offer)" title="Load into Preview">
                        <i class="fas fa-eye"></i> View
                      </button>
                      <button class="action-pill-btn edit" @click="editLetter(offer)" title="Edit">
                        <i class="fas fa-edit"></i> Edit
                      </button>
                      <button class="action-pill-btn delete" @click="deleteLetter(offer.id)" title="Delete">
                        <i class="fas fa-trash-alt"></i> Delete
                      </button>
                    </div>
                  </div>

                  <div v-if="filteredOfferLetters.length === 0" class="empty-state-card">
                    <i class="fas fa-inbox"></i>
                    <p>{{ modalSearchQuery || modalCompanyFilter ? 'No matching offer letters' : 'No offer letters found' }}</p>
                  </div>
                </div>

                <!-- Desktop Table View -->
                <div class="table-wrapper-premium" v-else>
                  <table class="offer-table-premium">
                    <thead>
                      <tr>
                        <th>Candidate Profile</th>
                        <th>Issuing Company</th>
                        <th>Position</th>
                        <th>Stipend (Monthly)</th>
                        <th>Probation</th>
                        <th>Joining Date</th>
                        <th>Work Model</th>
                        <th class="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="offer in filteredOfferLetters" :key="offer.id" class="table-row-hover">
                        <td class="candidate-profile-cell">
                          <div class="candidate-flex-row">
                            <div class="candidate-avatar-circle" :class="getAvatarColorClass(offer.name)">
                              {{ getInitials(offer.name) }}
                            </div>
                            <div class="candidate-meta-column">
                              <span class="candidate-full-name">{{ offer.name }}</span>
                              <span class="candidate-issued-date" v-if="offer.created_at">
                                <i class="far fa-calendar-alt"></i> Issued {{ formatDateSimple(offer.created_at) }}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="company-entity-badge" :class="getCompanyBadgeClass(offer.company)">
                            <i :class="(offer.company || '') === 'Arch IT Solutions' ? 'fas fa-laptop-code' : 'fas fa-building'"></i>
                            {{ offer.company || 'Arch Enterprises' }}
                          </span>
                        </td>
                        <td>
                          <span class="position-pill">{{ offer.position }}</span>
                        </td>
                        <td>
                          <span class="stipend-amount-tag">₹{{ formatAmount(offer.salary) }}</span>
                        </td>
                        <td>
                          <span class="probation-badge">{{ offer.probation_period || '—' }}</span>
                        </td>
                        <td class="date-cell">
                          <span class="joining-date-pill">
                            <i class="far fa-clock"></i> {{ formatDateSimple(offer.joining_date) }}
                          </span>
                        </td>
                        <td>
                          <span class="work-type-pill" :class="offer.work_type ? offer.work_type.toLowerCase() : 'onsite'">
                            {{ offer.work_type || 'Onsite' }}
                          </span>
                        </td>
                        <td class="text-right">
                          <div class="action-buttons-wrap">
                            <button class="action-pill-btn view" @click="viewLetter(offer)" title="Load into Live Preview">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-pill-btn edit" @click="editLetter(offer)" title="Edit Offer Terms">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-pill-btn delete" @click="deleteLetter(offer.id)" title="Delete Offer Record">
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="filteredOfferLetters.length === 0" class="empty-row">
                        <td colspan="8">
                          <div class="empty-state-small">
                            <i class="fas fa-inbox"></i>
                            <p>{{ modalSearchQuery || modalCompanyFilter ? 'No offer letters match your filter' : 'No offer letters generated yet' }}</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="modal-footer-premium">
                <div class="footer-left-info">
                  <span class="total-count-pill">
                    Showing <strong>{{ filteredOfferLetters.length }}</strong> of {{ offerLetters.length }} records
                  </span>
                </div>
                <div class="footer-right-actions">
                  <button class="btn-modal-done" @click="closeOfferModal">
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import html2pdf from "html2pdf.js"
import logoArchEnterprises from '@/assets/logo.png'
import logoArchITSolutions from '@/assets/arch-it-solutions-logo.png'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

const COMPANY_PROFILES = {
  'Arch Enterprises': {
    name: 'Arch Enterprises',
    shortName: 'AE',
    tagline: 'Clarke Fire Products Dealer in India',
    address: 'Plot No. 49, Prathamesh, Khutwadnagar, Nashik, Maharashtra - 422008',
    email: 'contact@archenterprises.co.in',
    phone: '+91 8390704453',
    website: 'www.archenterprises.co.in',
    logo: logoArchEnterprises,
    refPrefix: 'AE/HR/OL',
    stripeGradient: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
    accentColor: '#4f46e5',
    badgeClass: 'enterprises'
  },
  'Arch IT Solutions': {
    name: 'Arch IT Solutions',
    shortName: 'AITS',
    tagline: 'Software Development • Web & Mobile Solutions • Cloud Architecture',
    address: 'Plot No. 49, Prathamesh, Khutwadnagar, Nashik, Maharashtra - 422008',
    email: 'prasad@architsolutions.com',
    phone: '+91 8390704453',
    website: 'www.it.archenterprises.co.in',
    logo: logoArchITSolutions,
    refPrefix: 'AITS/HR/OL',
    stripeGradient: 'linear-gradient(90deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)',
    accentColor: '#0284c7',
    badgeClass: 'itsolutions'
  }
};

export default {
  components: { Sidebar },

  data() {
    return {
      editingId: null,
      isMobile: false,
      isSidebarVisible: true,
      showOfferModal: false,
      offerLetters: [],
      modalSearchQuery: '',
      modalCompanyFilter: '',
      isSaving: false,
      isDownloading: false,
      isGenerating: false,
      form: {
        company: 'Arch Enterprises',
        name: '',
        position: '',
        salary: '',
        joiningDate: '',
        type: 'Onsite',
        probationPeriod: ''
      }
    }
  },
  computed: {
    currentCompany() {
      return COMPANY_PROFILES[this.form.company] || COMPANY_PROFILES['Arch Enterprises'];
    },
    currentCompanyLogo() {
      return this.currentCompany.logo;
    },
    todayDate() {
      return this.formatDate(new Date())
    },
    formattedJoiningDate() {
      if (!this.form.joiningDate) return ''
      return this.formatDate(new Date(this.form.joiningDate))
    },
    filteredOfferLetters() {
      let list = this.offerLetters;
      if (this.modalCompanyFilter) {
        list = list.filter(o => (o.company || 'Arch Enterprises') === this.modalCompanyFilter);
      }
      if (this.modalSearchQuery) {
        const q = this.modalSearchQuery.toLowerCase();
        list = list.filter(o => 
          (o.name && o.name.toLowerCase().includes(q)) ||
          (o.position && o.position.toLowerCase().includes(q)) ||
          (o.work_type && o.work_type.toLowerCase().includes(q)) ||
          (o.company && o.company.toLowerCase().includes(q))
        );
      }
      return list;
    }
  },
  methods: {
    setCompany(companyName) {
      this.form.company = companyName;
      toastSuccess(`Switched to ${companyName}`);
    },
    getCompanyBadgeClass(companyName) {
      if (!companyName) return 'enterprises';
      return companyName.includes('IT') ? 'itsolutions' : 'enterprises';
    },
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
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    formatAmount(amount) {
      if (!amount) return '0';
      return parseFloat(amount).toLocaleString('en-IN');
    },
    formatDateSimple(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    resetForm() {
      const prevCompany = this.form.company;
      this.editingId = null;
      this.form = {
        company: prevCompany,
        name: '',
        position: '',
        salary: '',
        joiningDate: '',
        type: 'Onsite',
        probationPeriod: ''
      };
      toastSuccess('Form cleared');
    },
    cancelEdit() {
      this.resetForm();
    },
    editLetter(offer) {
      this.form = {
        company: offer.company || (offer.ref && offer.ref.includes('AITS') ? 'Arch IT Solutions' : 'Arch Enterprises'),
        name: offer.name,
        position: offer.position,
        salary: offer.salary,
        joiningDate: offer.joining_date,
        type: offer.work_type,
        probationPeriod: offer.probation_period,
      };
      this.editingId = offer.id;
      this.showOfferModal = false;
      this.$nextTick(() => {
        if (this.$refs.offerLetter) {
          this.$refs.offerLetter.scrollIntoView({ behavior: 'smooth' });
        }
      });
      toastSuccess(`Editing offer for ${offer.name} (${this.form.company})`);
    },
    async deleteLetter(id) {
      if (!confirm("Are you sure you want to delete this offer letter?")) return
      try {
        await axios.delete(`https://employees.archenterprises.co.in/api/api/offer-letters/${id}`)
        this.offerLetters = this.offerLetters.filter(offer => offer.id !== id)
        toastSuccess("Offer letter deleted successfully")
      } catch (error) {
        console.error(error)
        toastError("Failed to delete offer letter")
      }
    },
    viewLetter(offer) {
      this.form = {
        company: offer.company || (offer.ref && offer.ref.includes('AITS') ? 'Arch IT Solutions' : 'Arch Enterprises'),
        name: offer.name,
        position: offer.position,
        salary: offer.salary,
        joiningDate: offer.joining_date,
        type: offer.work_type,
        probationPeriod: offer.probation_period,
      };
      this.showOfferModal = false;
      this.$nextTick(() => {
        if (this.$refs.offerLetter) {
          this.$refs.offerLetter.scrollIntoView({ behavior: 'smooth' });
        }
      });
      toastSuccess(`Loaded ${offer.name}'s offer letter into preview`);
    },
    async fetchOfferLetters() {
      try {
        const response = await axios.get("https://employees.archenterprises.co.in/api/api/offer-letters")
        this.offerLetters = response.data || []
      } catch (error) {
        console.error("Failed to load offer letters:", error)
      }
    },
    async openOfferModal() {
      await this.fetchOfferLetters()
      this.modalSearchQuery = ''
      this.modalCompanyFilter = ''
      this.showOfferModal = true
    },
    closeOfferModal() {
      this.showOfferModal = false
    },
    formatDate(date) {
      const options = { day: '2-digit', month: 'short', year: 'numeric' }
      return date.toLocaleDateString('en-GB', options)
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },
    async saveOffer() {
      if (!this.form.name || !this.form.position || !this.form.salary || !this.form.probationPeriod) {
        toastWarning("Please fill all required fields before saving the offer letter");
        return;
      }

      this.isSaving = true;
      try {
        if (this.editingId) {
          await axios.put(`https://employees.archenterprises.co.in/api/api/offer-letters/${this.editingId}`, this.form);
          toastSuccess("Offer letter record updated successfully");
        } else {
          const response = await axios.post("https://employees.archenterprises.co.in/api/api/offer-letters", this.form);
          if (response.data && response.data.id) {
            this.editingId = response.data.id;
          }
          toastSuccess("Offer letter saved to database successfully");
        }
        await this.fetchOfferLetters();
      } catch (error) {
        console.error("Save error:", error);
        toastError("Failed to save offer letter to database");
      } finally {
        this.isSaving = false;
      }
    },
    async downloadPDF() {
      if (!this.form.name || !this.form.position) {
        toastWarning("Please enter Candidate Name and Designation to download the offer letter");
        return;
      }

      this.isDownloading = true;
      try {
        const element = this.$refs.offerLetter;
        if (!element) {
          toastError("Offer letter preview element not found");
          return;
        }
        const compPrefix = this.currentCompany.shortName;
        const cleanName = (this.form.name || 'Candidate').trim().replace(/\s+/g, '_');
        const options = {
          margin: 0,
          filename: `${compPrefix}_Offer_Letter_${cleanName}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' }
        };
        await html2pdf().set(options).from(element).save();
        toastSuccess(`Official ${this.currentCompany.name} offer letter downloaded successfully`);
      } catch (error) {
        console.error("PDF generation failed:", error);
        toastError("An error occurred while generating PDF");
      } finally {
        this.isDownloading = false;
      }
    },
    async generatePDF() {
      await this.downloadPDF();
    }
  },
  async mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
    await this.fetchOfferLetters()
    const id = this.$route.params.id
    if (id) {
      try {
        const response = await axios.get(`https://employees.archenterprises.co.in/api/api/offer-letters/${id}`)
        this.form = {
          company: response.data.company || (response.data.ref && response.data.ref.includes('AITS') ? 'Arch IT Solutions' : 'Arch Enterprises'),
          name: response.data.name,
          position: response.data.position,
          salary: response.data.salary,
          joiningDate: response.data.joining_date,
          type: response.data.work_type,
          probationPeriod: response.data.probation_period,
        }
        this.editingId = id
      } catch (error) {
        console.error(error)
        toastError("Failed to load offer letter")
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ==========================================================================
   RESET & ROOT VARIABLES
   ========================================================================== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.layout {
  min-height: 100vh;
  display: flex;
  background-color: #f1f5f9;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0f172a;
}

.main-content {
  display: flex;
  flex: 1;
  min-height: 100vh;
  background-color: #f1f5f9;
  position: relative;
}

.content {
  flex: 1;
  padding: 28px 32px 56px;
  background-color: #f1f5f9;
  overflow-y: auto;
  max-width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded-content {
  padding-left: 20px;
  padding-right: 20px;
}

/* ==========================================================================
   📱 MOBILE HEADER
   ========================================================================== */
.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.mobile-title-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 9px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-mobile-menu {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 15px;
}

/* ==========================================================================
   🏢 ENTERPRISE TOP BANNER
   ========================================================================== */
.offer-top-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e293b 100%);
  border-radius: 20px;
  padding: 28px 32px;
  color: #ffffff;
  box-shadow: 0 12px 30px -8px rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  position: relative;
  overflow: hidden;
  margin-bottom: 28px;
}

.offer-top-banner::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%);
  pointer-events: none;
}

.banner-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 720px;
  z-index: 1;
}

.banner-badge-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  background: rgba(99, 102, 241, 0.22);
  border: 1px solid rgba(129, 140, 248, 0.35);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #c7d2fe;
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
  70% { transform: scale(1.15); box-shadow: 0 0 0 7px rgba(56, 189, 248, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
}

.status-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  color: #cbd5e1;
}

.status-meta-pill.template-pill {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(52, 211, 153, 0.3);
  color: #a7f3d0;
}

.status-meta-pill.company-active-pill {
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
}

.status-meta-pill.company-active-pill.ae {
  background: rgba(79, 70, 229, 0.28);
  border-color: rgba(129, 140, 248, 0.5);
  color: #c7d2fe;
}

.status-meta-pill.company-active-pill.aits {
  background: rgba(2, 132, 199, 0.28);
  border-color: rgba(56, 189, 248, 0.5);
  color: #bae6fd;
}

.status-meta-pill.editing-pill {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(251, 191, 36, 0.4);
  color: #fde68a;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.75; }
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 13.5px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
}

.banner-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
  flex-shrink: 0;
}

.btn-view-letters {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.btn-view-letters:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.count-bubble {
  background: #4f46e5;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
}

.btn-save-record {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
}

.btn-save-record:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}

.btn-save-record:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-generate-pdf {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
}

.btn-generate-pdf:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.55);
}

.btn-generate-pdf:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ==========================================================================
   📐 WORKSPACE GRID (SPLIT PANE)
   ========================================================================== */
.workspace-grid {
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 28px;
  align-items: start;
}

/* ==========================================================================
   📝 LEFT COLUMN: EDITOR CARD
   ========================================================================== */
.editor-column {
  position: sticky;
  top: 24px;
}

.editor-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 24px -4px rgba(15, 23, 42, 0.07);
  overflow: hidden;
}

.card-header-clean {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
}

.header-left-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-halo {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.card-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.header-right-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-reset-tool, .btn-clear-tool {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset-tool {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.btn-reset-tool:hover {
  background: #fee2e2;
}

.btn-clear-tool {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-clear-tool:hover {
  background: #f1f5f9;
  color: #334155;
}

.editor-form-body {
  padding: 24px;
}

/* ==========================================================================
   🏢 COMPANY ENTITY SELECTION CARDS
   ========================================================================== */
.company-selection-box {
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1.5px dashed #e2e8f0;
}

.company-toggle-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.company-selector-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  text-align: left;
}

.company-selector-btn:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.company-selector-btn.selected {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 4px 14px -2px rgba(79, 70, 229, 0.16);
}

.company-selector-btn.selected .company-badge-icon.itsolutions,
.company-selector-btn.selected:has(.itsolutions) {
  border-color: #0284c7;
  box-shadow: 0 4px 14px -2px rgba(2, 132, 199, 0.16);
}

.company-badge-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.company-badge-icon.enterprises {
  background: #e0e7ff;
  color: #4f46e5;
}

.company-badge-icon.itsolutions {
  background: #e0f2fe;
  color: #0284c7;
}

.company-info-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.company-title-text {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-sub-text {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.checkmark-active {
  color: #4f46e5;
  font-size: 15px;
  margin-left: 2px;
}

.company-selector-btn.selected:has(.itsolutions) .checkmark-active {
  color: #0284c7;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 3px;
}

.required-star {
  color: #ef4444;
  font-weight: 700;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
  pointer-events: none;
  transition: color 0.2s ease;
}

.modern-input, .modern-select {
  width: 100%;
  height: 44px;
  padding: 0 14px 0 40px;
  border-radius: 11px;
  border: 1.5px solid #e2e8f0;
  background-color: #f8fafc;
  font-size: 13.5px;
  font-weight: 500;
  color: #0f172a;
  transition: all 0.2s ease;
}

.modern-input:focus, .modern-select:focus {
  outline: none;
  border-color: #6366f1;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.input-wrapper:focus-within .input-icon {
  color: #6366f1;
}

.editor-actions-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.preview-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  background: #ecfdf5;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid #a7f3d0;
}

.actions-right-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border: none;
  border-radius: 11px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-action-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

.btn-action-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-generate-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  border-radius: 11px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
}

.btn-generate-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.45);
}

.btn-generate-main:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ==========================================================================
   📄 RIGHT COLUMN: LIVE A4 PREVIEW CANVAS
   ========================================================================== */
.preview-column {
  min-width: 0;
}

.preview-canvas-wrapper {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 24px -4px rgba(15, 23, 42, 0.07);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  padding: 14px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.canvas-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 6px;
}

.canvas-candidate {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.toolbar-right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-canvas-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-canvas-action:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-canvas-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-canvas-save {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}

.btn-canvas-save:hover:not(:disabled) {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #047857;
}

.btn-canvas-primary {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
}

.btn-canvas-primary:hover:not(:disabled) {
  background: #4338ca;
  border-color: #4338ca;
  color: #ffffff;
}

/* Document Desk Environment */
.document-scroll-container {
  background: #64748b;
  padding: 36px 24px;
  display: flex;
  justify-content: center;
  overflow-x: auto;
  min-height: 840px;
}

/* Real A4 Paper (794 x 1123 px standard 96 DPI A4) */
.offer-letter-canvas {
  width: 794px;
  min-height: 1123px;
  background: #ffffff;
  padding: 56px 56px 44px;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.35);
  border-radius: 2px;
  position: relative;
  font-family: 'Times New Roman', Times, serif;
  color: #1e293b;
  line-height: 1.65;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.letter-top-stripe {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%);
}

/* Official Letterhead Header */
.letter-header {
  display: flex;
  align-items: center;
  gap: 22px;
}

.logo-box {
  flex-shrink: 0;
}

.company-logo {
  max-height: 64px;
  max-width: 130px;
  object-fit: contain;
}

.company-details {
  flex: 1;
}

.company-name {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  letter-spacing: -0.01em;
  margin-bottom: 2px;
}

.company-tagline {
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  margin-bottom: 4px;
}

.company-address, .company-contact {
  font-size: 11px;
  color: #475569;
  font-family: 'Inter', sans-serif;
  line-height: 1.4;
}

.letter-divider {
  height: 2px;
  background: linear-gradient(90deg, #4f46e5 0%, #cbd5e1 75%, transparent 100%);
  margin: 18px 0 22px;
}

/* Date & Reference Row */
.letter-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 22px;
  font-family: 'Inter', sans-serif;
}

.ref-number span, .letter-date span {
  color: #64748b;
  font-weight: 500;
}

/* Recipient Block */
.letter-recipient {
  margin-bottom: 20px;
  font-family: 'Times New Roman', Times, serif;
}

.to-label {
  font-size: 14.5px;
  color: #334155;
  margin-bottom: 3px;
}

.candidate-recipient-name {
  font-size: 16px;
  color: #0f172a;
}

/* Subject Block */
.letter-subject {
  background: #f8fafc;
  border-left: 3.5px solid #4f46e5;
  padding: 9px 16px;
  margin-bottom: 24px;
  font-family: 'Inter', sans-serif;
}

.subject-title {
  font-size: 13.5px;
  color: #0f172a;
  letter-spacing: -0.01em;
}

/* Letter Body Content */
.letter-body {
  font-size: 14px;
  line-height: 1.8;
  color: #1e293b;
  text-align: justify;
}

.letter-body p {
  margin-bottom: 16px;
}

.salutation {
  font-size: 14.5px;
  margin-bottom: 14px !important;
}

.closing-remark {
  margin-top: 20px;
}

/* Signature Block */
.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 44px;
  padding-top: 20px;
}

.sign-block {
  width: 220px;
  text-align: center;
}

.sign-line {
  border-bottom: 1.5px solid #0f172a;
  margin-bottom: 8px;
  width: 100%;
}

.sign-title {
  font-size: 11.5px;
  font-weight: 700;
  color: #0f172a;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.04em;
  display: block;
}

.sign-sub {
  font-size: 11px;
  color: #64748b;
  font-family: 'Inter', sans-serif;
  display: block;
  margin-top: 2px;
}

/* Formal Letter Footer */
.letter-footer {
  margin-top: 36px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
  font-family: 'Inter', sans-serif;
}

.footer-meta-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 10px;
}

.footer-brand {
  color: #0f172a;
  font-size: 11.5px;
  font-weight: 700;
}

.footer-col-right {
  display: flex;
  gap: 16px;
}

.footer-col-right p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
}

.footer-confidential-notice {
  font-size: 9.5px;
  color: #94a3b8;
  text-align: center;
  border-top: 1px dashed #e2e8f0;
  padding-top: 6px;
}

/* ==========================================================================
   🌟 MODAL: ALL ISSUED OFFER LETTERS
   ========================================================================== */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.68);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.premium-modal {
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 30px 80px -15px rgba(15, 23, 42, 0.45);
  width: 95vw;
  max-width: 1280px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.modal-top-accent {
  height: 4px;
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%);
}

.modal-header-premium {
  padding: 18px 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  position: relative;
}

.modal-header-premium .header-text {
  flex: 1;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header-badge {
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.modal-header-premium h2 {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

.modal-header-premium p {
  font-size: 12.5px;
  color: #64748b;
  margin-top: 3px;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
}

.modal-close-btn:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #ef4444;
}

/* Modal Search & Filter Toolbar */
.modal-toolbar {
  padding: 12px 28px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.modal-search-wrapper {
  position: relative;
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
}

.modal-search-wrapper .search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 13px;
}

.modal-search-input {
  width: 100%;
  height: 38px;
  padding: 0 34px 0 38px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  font-size: 13px;
  color: #0f172a;
  transition: all 0.2s ease;
}

.modal-search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 13px;
  border-radius: 4px;
}

.clear-search-btn:hover {
  color: #0f172a;
}

/* Segmented Company Filter Pills */
.modal-company-pills {
  display: flex;
  align-items: center;
  background: #edf2f7;
  padding: 3px;
  border-radius: 12px;
  gap: 3px;
}

.company-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.company-filter-pill:hover {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.5);
}

.company-filter-pill.active {
  background: #ffffff;
  color: #0f172a;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.company-filter-pill.active.enterprises {
  color: #4338ca;
}

.company-filter-pill.active.itsolutions {
  color: #0369a1;
}

.filter-count-badge {
  background: #e2e8f0;
  color: #475569;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 8px;
}

.modal-count-badge {
  font-size: 12.5px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
}

/* Modal Body & Table Container */
.modal-body-premium {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  background: #ffffff;
}

.table-wrapper-premium {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
  max-height: calc(90vh - 215px);
}

/* Custom Slim Scrollbars */
.table-wrapper-premium::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
.table-wrapper-premium::-webkit-scrollbar-track {
  background: #f8fafc;
}
.table-wrapper-premium::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.table-wrapper-premium::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.offer-table-premium {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.offer-table-premium thead th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  padding: 14px 18px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1.5px solid #e2e8f0;
  z-index: 10;
  white-space: nowrap;
}

.offer-table-premium tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.offer-table-premium tbody tr:hover {
  background-color: #f8fafc;
}

.offer-table-premium td {
  padding: 14px 18px;
  font-size: 13px;
  color: #334155;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

/* ==========================================================================
   👤 CANDIDATE PROFILE COLUMN (AVATAR & METADATA)
   ========================================================================== */
.candidate-profile-cell {
  min-width: 220px;
}

.candidate-flex-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.candidate-avatar-circle {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13.5px;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.14);
  letter-spacing: 0.02em;
  flex-shrink: 0;
  text-transform: uppercase;
}

.avatar-indigo {
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
}

.avatar-emerald {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.avatar-violet {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
}

.avatar-amber {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.avatar-sky {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
}

.avatar-rose {
  background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
}

.candidate-meta-column {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.candidate-full-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
}

.candidate-issued-date {
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

/* ==========================================================================
   🏷️ TABLE BADGES & VALUES
   ========================================================================== */
.company-entity-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.company-entity-badge.enterprises {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}

.company-entity-badge.itsolutions {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.company-entity-badge.mobile-pill {
  font-size: 11px;
  padding: 3px 8px;
}

.position-pill {
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 5px 11px;
  border-radius: 8px;
  display: inline-block;
  max-width: 220px;
  line-height: 1.35;
}

.stipend-amount-tag {
  font-size: 13px;
  font-weight: 800;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 4px 10px;
  border-radius: 8px;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.probation-badge {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 4px 9px;
  border-radius: 6px;
  white-space: nowrap;
}

.joining-date-pill {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.joining-date-pill i {
  color: #64748b;
}

/* ==========================================================================
   ⚡ ACTION BUTTONS IN TABLE
   ========================================================================== */
.action-buttons-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.action-pill-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-pill-btn.view {
  background: #e0e7ff;
  color: #4f46e5;
}

.action-pill-btn.view:hover {
  background: #4f46e5;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

.action-pill-btn.edit {
  background: #fef3c7;
  color: #d97706;
}

.action-pill-btn.edit:hover {
  background: #d97706;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);
}

.action-pill-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-pill-btn.delete:hover {
  background: #dc2626;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
}

/* ==========================================================================
   📱 MOBILE CARDS IN MODAL
   ========================================================================== */
.mobile-offer-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.offer-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.offer-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.offer-card-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 10px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 12px;
}

.offer-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.offer-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.offer-card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* ==========================================================================
   🏁 MODAL FOOTER
   ========================================================================== */
.modal-footer-premium {
  padding: 16px 28px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-count-pill {
  font-size: 12.5px;
  color: #64748b;
  font-weight: 500;
}

.total-count-pill strong {
  color: #0f172a;
  font-weight: 700;
}

.btn-modal-done {
  padding: 9px 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.btn-modal-done:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25);
}

/* Empty State */
.empty-table-state, .empty-state-small, .empty-state-card {
  padding: 48px 24px;
  text-align: center;
}

.empty-state-small i, .empty-state-card i {
  font-size: 36px;
  color: #cbd5e1;
  margin-bottom: 10px;
  display: block;
}

.empty-state-small p, .empty-state-card p {
  font-size: 13px;
  color: #64748b;
}

.empty-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 12px;
}

.empty-table-state h4 {
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 4px;
}

.empty-table-state p {
  font-size: 12.5px;
  color: #64748b;
}

/* ==========================================================================
   📱 RESPONSIVE BREAKPOINTS
   ========================================================================== */
@media (max-width: 1200px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
  
  .editor-column {
    position: static;
  }

  .document-scroll-container {
    padding: 24px 16px;
  }
}

@media (max-width: 992px) {
  .offer-top-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }

  .banner-right-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }

  .document-scroll-container {
    justify-content: flex-start;
  }

  .offer-letter-canvas {
    width: 680px;
    padding: 36px 32px;
  }

  .modal-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .offer-letter-canvas {
    width: 600px;
    padding: 28px 20px;
  }
}
</style>