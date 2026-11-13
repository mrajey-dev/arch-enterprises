<template>
  <div class="lead-details-page">
    <!-- ════════ TOP HERO / WORKSPACE HEADER ════════ -->
    <header class="lead-details-header">
      <div class="header-left">
        <button class="btn-back-pipeline" @click="goToPipeline" title="Back to Sales Pipeline">
          <i class="fas fa-arrow-left"></i>
          <span>Pipeline</span>
        </button>

        <div class="header-divider"></div>

        <div class="company-avatar gradient-avatar">
          {{ (lead.company_name || 'C').charAt(0).toUpperCase() }}
        </div>

        <div class="header-details">
          <div class="header-company-row">
            <h1 class="company-title">{{ lead.company_name || 'Lead Details' }}</h1>
            <span
              v-if="lead.status"
              class="status-pill-badge"
              :class="'status-' + (lead.status || '').toLowerCase().replace(/[\s_-]+/g, '')"
            >
              {{ lead.status }}
            </span>
            <span class="header-service-badge" title="Service Required">
              <i class="fas fa-laptop-code"></i>
              <span>{{ lead.service_required || 'IT Solution' }}</span>
            </span>
          </div>

          <div class="contact-pill-list">
            <span v-if="lead.contact_person" class="contact-chip person" title="Primary Contact">
              <i class="fas fa-user-tie"></i>
              <strong>{{ lead.contact_person }}</strong>
            </span>
            <a
              v-if="lead.phone"
              :href="'tel:' + lead.phone"
              class="contact-chip link phone"
              title="Click to Call"
            >
              <i class="fas fa-phone-alt"></i>
              <span>{{ lead.phone }}</span>
            </a>
            <a
              v-if="lead.email"
              :href="'mailto:' + lead.email"
              class="contact-chip link email"
              title="Click to Email"
            >
              <i class="fas fa-envelope"></i>
              <span>{{ lead.email }}</span>
            </a>
            <span v-if="lead.created_at" class="contact-chip date-chip" title="Created Date">
              <i class="far fa-calendar-alt"></i>
              <span>Created {{ formatShortDate(lead.created_at) }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="header-right">
        <button class="btn-action-ghost" @click="openEditModal" title="Edit Lead Information">
          <i class="fas fa-pen"></i>
          <span>Edit Lead</span>
        </button>
        <button class="btn-action-primary" @click="openQuotationTab" title="Open Quotations in New Tab">
          <i class="fas fa-file-invoice-dollar"></i>
          <span>Quotation</span>
          <i class="fas fa-external-link-alt tab-icon"></i>
        </button>
        <button class="btn-action-danger" @click="confirmDeleteLead" title="Delete this Lead">
          <i class="fas fa-trash-alt"></i>
          <span>Delete</span>
        </button>
        <div class="header-divider"></div>
        <button class="btn-action-close" @click="closeCurrentTab" title="Close this Tab">
          <i class="fas fa-times"></i>
          <span>Close</span>
        </button>
      </div>
    </header>

    <!-- ════════ LOADING & ERROR STATES ════════ -->
    <div v-if="isLoading" class="state-container">
      <div class="loading-spinner-box">
        <i class="fas fa-circle-notch fa-spin"></i>
        <p>Loading deal details from database...</p>
      </div>
    </div>

    <!-- ════════ WORKSPACE BODY (SPLIT VIEW) ════════ -->
    <main v-else class="lead-details-body">
      <!-- ◀ LEFT SIDE: Quick Overview & Client Intelligence -->
      <section class="details-left-pane">
        <!-- Deal Overview Card -->
        <div class="workspace-card deal-overview-card">
          <div class="deal-service-strip">
            <span class="service-label">
              <i class="fas fa-laptop-code"></i>
              <span>Service Required:</span>
            </span>
            <strong class="service-value">{{ lead.service_required || 'IT Solution' }}</strong>
          </div>

          <div class="metrics-grid">
            <!-- Pipeline Stage Select -->
            <div class="metric-box">
              <div class="metric-label">Pipeline Stage</div>
              <div class="stage-select-wrapper">
                <span
                  class="stage-pulse-dot"
                  :class="'dot-' + (lead.status || '').toLowerCase().replace(/[\s_-]+/g, '')"
                ></span>
                <select
                  class="modern-stage-select"
                  :value="lead.status"
                  :disabled="isUpdatingStatus"
                  @change="updateStatus($event.target.value)"
                >
                  <option v-for="st in statusOptions" :key="st" :value="st">{{ st }}</option>
                </select>
                <i class="fas fa-chevron-down select-chevron"></i>
              </div>
            </div>

            <!-- Estimated Deal Value -->
            <div class="metric-box">
              <div class="metric-label">Estimated Deal Value</div>
              <div class="metric-val text-emerald">
                {{ formatCurrency(lead.deal_value) }}
              </div>
            </div>
          </div>

          <!-- Scheduled Next Follow-up Reminder Card -->
          <div v-if="lead.next_followup_date" class="scheduled-followup-card" :class="followupReminderUrgency">
            <div class="scheduled-card-header">
              <span class="scheduled-badge">
                <i class="fas fa-bell" :class="{ 'fa-shake': isFollowupDue }"></i>
                <span>{{ followupUrgencyLabel }}</span>
              </span>
              <button
                type="button"
                class="btn-reschedule-link"
                @click="openRescheduleModal"
                title="Reschedule Follow-up"
              >
                <i class="fas fa-edit"></i> Reschedule
              </button>
            </div>
            <div class="scheduled-datetime-row">
              <i class="far fa-calendar-check"></i>
              <strong>{{ formatDateTime(lead.next_followup_date) }}</strong>
            </div>
            <div class="scheduled-countdown-row">
              <i class="far fa-clock"></i>
              <span>{{ followupCountdownText }}</span>
            </div>
          </div>

          <!-- Notes Snippet if any -->
          <div v-if="lead.notes" class="deal-notes-box">
            <span class="notes-label"><i class="fas fa-info-circle"></i> Initial Requirement Note:</span>
            <p class="notes-content">{{ lead.notes }}</p>
          </div>

          <!-- Client & Deal Metadata Snippet -->
          <div class="deal-client-info-list">
            <div class="info-row">
              <span class="info-label"><i class="fas fa-user-tie"></i> Contact:</span>
              <strong class="info-value">{{ lead.contact_person || 'Not specified' }}</strong>
            </div>
            <div class="info-row" v-if="lead.phone">
              <span class="info-label"><i class="fas fa-phone-alt"></i> Phone:</span>
              <a :href="'tel:' + lead.phone" class="info-link">{{ lead.phone }}</a>
            </div>
            <div class="info-row" v-if="lead.email">
              <span class="info-label"><i class="fas fa-envelope"></i> Email:</span>
              <a :href="'mailto:' + lead.email" class="info-link">{{ lead.email }}</a>
            </div>
            <div class="info-row" v-if="lead.created_at">
              <span class="info-label"><i class="far fa-calendar-alt"></i> Added On:</span>
              <span class="info-value">{{ formatShortDate(lead.created_at) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ▶ RIGHT SIDE: Log Follow-up Discussion + Activity Timeline -->
      <section class="details-right-pane">
        <!-- 1. Log Follow-up Discussion Composer Card -->
        <div class="workspace-card composer-card">
          <div class="composer-header">
            <div class="composer-title-wrap">
              <div class="composer-icon-badge">
                <i class="fas fa-phone-volume"></i>
              </div>
              <div>
                <h3 class="composer-title">Log Follow-up Discussion</h3>
                <p class="composer-desc">Record calls, client responses, technical feedback, or scheduled dates.</p>
              </div>
            </div>
            <div class="active-rep-pill">
              <i class="fas fa-user-circle"></i>
              <span>Rep: <strong>{{ currentUserName }}</strong></span>
            </div>
          </div>

          <form @submit.prevent="submitFollowup" class="composer-form">
            <div class="composer-split-row">
              <!-- Left Column of Composer: Channel, Outcome, Date & Time -->
              <div class="composer-col-left">
                <div class="composer-field">
                  <label class="composer-label">Interaction Channel</label>
                  <select v-model="newFollowup.call_type" class="composer-select">
                    <option value="Phone Call">📞 Phone Call</option>
                    <option value="Video Meeting">💻 Google Meet / Zoom</option>
                    <option value="WhatsApp Discussion">💬 WhatsApp</option>
                    <option value="Client Office Visit">🏢 Client Office Visit</option>
                    <option value="Email Communication">✉️ Email Correspondence</option>
                  </select>
                </div>

                <div class="composer-field">
                  <label class="composer-label">Discussion Outcome</label>
                  <select v-model="newFollowup.status" class="composer-select">
                    <option value="Connected & Discussed">Connected & Discussed</option>
                    <option value="Proposal Requested">Proposal Requested</option>
                    <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                    <option value="Demo Scheduled">Demo Scheduled</option>
                    <option value="Negotiation in Progress">Negotiation in Progress</option>
                    <option value="Deal Won / Confirmed">Deal Won / Confirmed</option>
                    <option value="Busy / Call Later">Busy / Call Later</option>
                    <option value="Not Reachable">Not Reachable</option>
                    <option value="Not Interested (Lost)">Not Interested (Lost)</option>
                  </select>
                </div>

                <div class="composer-field">
                  <label class="composer-label">Discussion Date & Time</label>
                  <input
                    type="datetime-local"
                    v-model="newFollowup.date"
                    required
                    class="composer-input"
                  />
                </div>

                <!-- Next Follow-up Reminder Date & Time -->
                <div class="composer-field next-followup-field">
                  <div class="field-label-row">
                    <label class="composer-label">
                      <i class="fas fa-bell text-amber"></i> Next Follow-up Date & Time
                    </label>
                    <button
                      v-if="newFollowup.next_followup_date"
                      type="button"
                      class="btn-clear-reminder"
                      @click="newFollowup.next_followup_date = ''"
                      title="Clear reminder"
                    >
                      <i class="fas fa-times"></i> Clear
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    v-model="newFollowup.next_followup_date"
                    :min="minFollowupDateTime"
                    class="composer-input next-date-input"
                    placeholder="Set upcoming reminder date & time"
                  />
                  <!-- Quick Preset Chips -->
                  <div class="quick-preset-chips">
                    <button type="button" class="quick-chip" @click="setNextFollowupQuick('1h')">+1 Hour</button>
                    <button type="button" class="quick-chip" @click="setNextFollowupQuick('tomorrow10')">Tomorrow 10 AM</button>
                    <button type="button" class="quick-chip" @click="setNextFollowupQuick('tomorrow3')">Tomorrow 3 PM</button>
                    <button type="button" class="quick-chip" @click="setNextFollowupQuick('2days')">In 2 Days</button>
                  </div>
                </div>
              </div>

              <!-- Right Column of Composer: Discussion Remarks / Action Items * + Save Button -->
              <div class="composer-col-right">
                <div class="composer-field composer-field-fill">
                  <label class="composer-label">Discussion Remarks / Action Items <span class="required">*</span></label>
                  <textarea
                    v-model="newFollowup.note"
                    required
                    placeholder="e.g. Discussed pricing tiers; client requested customized proposal for 25 licenses with cloud setup. Follow-up demo set for Tuesday..."
                    class="composer-textarea remarks-textarea"
                  ></textarea>
                </div>

                <div class="composer-submit-row">
                  <button type="submit" class="btn-save-note" :disabled="isSubmittingFollowup">
                    <i class="fas" :class="isSubmittingFollowup ? 'fa-spinner fa-spin' : 'fa-check-circle'"></i>
                    <span>{{ isSubmittingFollowup ? 'Saving to Database...' : 'Save Discussion Log' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- 2. Activity & Discussion Timeline -->
        <div class="workspace-card timeline-card">
          <!-- Timeline Header -->
          <div class="timeline-header">
            <div class="timeline-heading-group">
              <div class="timeline-icon-box">
                <i class="fas fa-history"></i>
              </div>
              <div>
                <h3 class="timeline-heading">Activity & Discussion Timeline</h3>
                <p class="timeline-subheading">Chronological record of calls, stage transitions, and client touchpoints.</p>
              </div>
              <span class="total-activity-pill">{{ (lead.followups || []).length }} Total</span>
            </div>

            <!-- Tab Filters -->
            <div class="timeline-tab-filters" v-if="(lead.followups || []).length > 0">
              <button
                type="button"
                class="timeline-filter-btn"
                :class="{ active: timelineFilter === 'all' }"
                @click="timelineFilter = 'all'"
              >
                All ({{ (lead.followups || []).length }})
              </button>
              <button
                type="button"
                class="timeline-filter-btn"
                :class="{ active: timelineFilter === 'notes' }"
                @click="timelineFilter = 'notes'"
              >
                <i class="far fa-comment-dots"></i> Notes ({{ timelineNotesCount }})
              </button>
              <button
                type="button"
                class="timeline-filter-btn"
                :class="{ active: timelineFilter === 'pipeline' }"
                @click="timelineFilter = 'pipeline'"
              >
                <i class="fas fa-exchange-alt"></i> Stage Shifts ({{ timelinePipelineCount }})
              </button>
            </div>
          </div>

          <!-- Timeline Items -->
          <div class="timeline-body">
            <div v-if="filteredTimeline.length === 0" class="empty-timeline-state">
              <i class="fas fa-comments-dollar empty-timeline-icon"></i>
              <h4 class="empty-title">No touchpoints recorded yet</h4>
              <p class="empty-desc">Use the form on the left to record your first client phone call, demo meeting, or commercial update.</p>
            </div>

            <div v-else class="timeline-stream">
              <div
                v-for="item in filteredTimeline"
                :key="item.id"
                class="timeline-entry"
                :class="{ 'entry-pipeline': item.call_type === 'Pipeline Update' }"
              >
                <!-- Left node indicator -->
                <div class="timeline-node">
                  <div class="node-icon-circle" :class="getNodeIconClass(item.call_type)">
                    <i :class="getNodeIcon(item.call_type)"></i>
                  </div>
                  <div class="node-stem"></div>
                </div>

                <!-- Right entry card -->
                <div class="timeline-content-card">
                  <div class="entry-meta-header">
                    <div class="entry-author-info">
                      <span class="author-name">{{ item.logged_by || 'Sales Executive' }}</span>
                      <span class="entry-type-chip">{{ item.call_type }}</span>
                      <span
                        v-if="item.status && item.status !== item.call_type"
                        class="entry-outcome-chip"
                        :class="'outcome-' + (item.status || '').toLowerCase().replace(/[\s_-]+/g, '')"
                      >
                        {{ item.status }}
                      </span>
                    </div>

                    <div class="entry-right-actions">
                      <span class="entry-date-text">
                        <i class="far fa-clock"></i> {{ formatTimelineDate(item.date) }}
                      </span>
                      <button
                        v-if="item.call_type !== 'Lead Creation'"
                        type="button"
                        class="btn-delete-entry"
                        @click="deleteFollowup(item.id)"
                        title="Delete note"
                      >
                        <i class="far fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Entry Note text -->
                  <div class="entry-note-text">
                    {{ item.note }}
                  </div>

                  <!-- Next Follow-up chip if scheduled on this entry -->
                  <div v-if="item.next_followup_date" class="entry-scheduled-chip">
                    <i class="fas fa-bell text-amber"></i>
                    <span>Next Follow-up Reminder: <strong>{{ formatDateTime(item.next_followup_date) }}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- ════════ MODAL: EDIT LEAD DETAILS ════════ -->
    <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
      <div class="modal-card fadeIn">
        <div class="modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-badge">
              <i class="fas fa-edit"></i>
            </div>
            <div>
              <h3>Edit Lead Details</h3>
              <p>Update company name, primary contact, requirements or deal value.</p>
            </div>
          </div>
          <button class="btn-modal-close" @click="showEditModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitEditLead" class="modal-form">
          <div class="form-grid-2">
            <div class="form-group">
              <label>Company / Organization Name <span class="required">*</span></label>
              <input type="text" v-model="editForm.company_name" required class="form-control" />
            </div>
            <div class="form-group">
              <label>Contact Person <span class="required">*</span></label>
              <input type="text" v-model="editForm.contact_person" required class="form-control" />
            </div>
          </div>

          <div class="form-grid-2">
            <!-- Mobile / Phone input with dynamic Country Code selector & length enforcement -->
            <div class="form-group">
              <div class="label-with-rule">
                <label><i class="fas fa-phone-alt text-blue-muted"></i> Phone Number</label>
                <span class="country-rule-tag" v-if="currentCountry">
                  {{ currentCountry.flag }} {{ currentCountryRuleText }}
                </span>
              </div>
              <div
                class="phone-combo-input"
                :class="{
                  'has-error': phoneTouched && !phoneValidation.isValid,
                  'has-success': phoneTouched && editFormPhoneRaw && phoneValidation.isValid
                }"
              >
                <div class="country-picker-wrap">
                  <select v-model="selectedCountryCode" class="country-select" @change="onCountryChange">
                    <option v-for="c in countryList" :key="c.code + c.dial_code" :value="c.dial_code">
                      {{ c.flag }} {{ c.dial_code }} ({{ c.name }})
                    </option>
                  </select>
                  <i class="fas fa-chevron-down country-caret"></i>
                </div>
                <input
                  type="tel"
                  v-model="editFormPhoneRaw"
                  :placeholder="currentCountry ? currentCountry.example || 'Mobile number' : '98765 43210'"
                  :maxlength="currentCountry ? currentCountry.max + 2 : 15"
                  class="phone-national-input"
                  @input="onPhoneInput"
                  @blur="phoneTouched = true"
                />
                <div v-if="editFormPhoneRaw" class="validation-status-icon">
                  <i v-if="phoneValidation.isValid" class="fas fa-check-circle text-emerald" title="Valid mobile number"></i>
                  <i v-else class="fas fa-exclamation-circle text-rose" :title="phoneValidation.message"></i>
                </div>
              </div>
              <div class="field-feedback-box">
                <span v-if="phoneTouched && !phoneValidation.isValid" class="field-msg error">
                  <i class="fas fa-exclamation-circle"></i> {{ phoneValidation.message }}
                </span>
                <span v-else-if="editFormPhoneRaw && phoneValidation.isValid" class="field-msg success">
                  <i class="fas fa-check-circle"></i> {{ phoneValidation.message }}
                </span>
              </div>
            </div>

            <!-- Email Address with real-time format validation -->
            <div class="form-group">
              <label><i class="fas fa-envelope text-blue-muted"></i> Email Address</label>
              <div
                class="input-with-icon-wrap"
                :class="{
                  'has-error': emailTouched && !emailValidation.isValid,
                  'has-success': emailTouched && editForm.email && emailValidation.isValid
                }"
              >
                <input
                  type="email"
                  v-model="editForm.email"
                  placeholder="contact@company.com"
                  class="form-control email-field-input"
                  @input="onEmailInput"
                  @blur="emailTouched = true"
                />
                <div v-if="editForm.email" class="validation-status-icon">
                  <i v-if="emailValidation.isValid" class="fas fa-check-circle text-emerald" title="Valid email address"></i>
                  <i v-else class="fas fa-exclamation-circle text-rose" :title="emailValidation.message"></i>
                </div>
              </div>
              <div class="field-feedback-box">
                <span v-if="emailTouched && !emailValidation.isValid" class="field-msg error">
                  <i class="fas fa-exclamation-circle"></i> {{ emailValidation.message }}
                </span>
                <span v-else-if="editForm.email && emailValidation.isValid" class="field-msg success">
                  <i class="fas fa-check-circle"></i> Valid email address
                </span>
              </div>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label>Service Requirement</label>
              <input
                type="text"
                v-model="editForm.service_required"
                list="servicePresetsList"
                placeholder="Enterprise ERP / CRM"
                class="form-control"
              />
              <datalist id="servicePresetsList">
                <option value="Enterprise ERP / CRM"></option>
                <option value="Mobile App (iOS & Android)"></option>
                <option value="Custom Web Portal Development"></option>
                <option value="Cloud Migration & AWS Hosting"></option>
                <option value="Digital Marketing & SEO Growth"></option>
                <option value="AI / Automation Solution"></option>
              </datalist>
            </div>
            <div class="form-group">
              <label>Estimated Deal Value (₹)</label>
              <input type="number" step="0.01" v-model.number="editForm.deal_value" class="form-control" />
            </div>
          </div>

          <div class="form-group">
            <label>Pipeline Stage</label>
            <select v-model="editForm.status" class="form-control">
              <option v-for="st in statusOptions" :key="st" :value="st">{{ st }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Notes / Requirements Summary</label>
            <textarea v-model="editForm.notes" rows="2" class="form-control"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="showEditModal = false">Cancel</button>
            <button type="submit" class="btn-save" :disabled="isSavingEdit">
              <i class="fas" :class="isSavingEdit ? 'fa-spinner fa-spin' : 'fa-check'"></i>
              <span>{{ isSavingEdit ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════ MODAL: RESCHEDULE NEXT FOLLOW-UP ════════ -->
    <div v-if="showRescheduleModal" class="modal-backdrop" @click.self="showRescheduleModal = false">
      <div class="modal-card modal-card-sm fadeIn">
        <div class="modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-badge amber-badge">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div>
              <h3>Reschedule Next Follow-up</h3>
              <p>Set a new reminder date and time for {{ lead.company_name }}</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="showRescheduleModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveReschedule" class="modal-body-form">
          <div class="form-group">
            <label class="form-label">Next Follow-up Date & Time <span class="required">*</span></label>
            <input
              type="datetime-local"
              v-model="rescheduleFormDate"
              :min="minFollowupDateTime"
              required
              class="form-control"
            />
          </div>

          <div class="quick-preset-chips modal-chips">
            <button type="button" class="quick-chip" @click="setRescheduleQuick('1h')">+1 Hour</button>
            <button type="button" class="quick-chip" @click="setRescheduleQuick('tomorrow10')">Tomorrow 10 AM</button>
            <button type="button" class="quick-chip" @click="setRescheduleQuick('tomorrow3')">Tomorrow 3 PM</button>
            <button type="button" class="quick-chip" @click="setRescheduleQuick('2days')">In 2 Days</button>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="showRescheduleModal = false">Cancel</button>
            <button type="submit" class="btn-save" :disabled="isSavingReschedule">
              <i class="fas" :class="isSavingReschedule ? 'fa-spinner fa-spin' : 'fa-check'"></i>
              <span>{{ isSavingReschedule ? 'Saving...' : 'Save Reminder' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════ SYSTEM POPUP: SCHEDULED FOLLOW-UP DUE ALERT ════════ -->
    <div
      v-if="activeFollowupAlert"
      class="system-popup-backdrop"
      @click.self="dismissFollowupAlert"
    >
      <div class="system-popup-modal animate-popup-in">
        <div class="system-popup-banner">
          <div class="ringing-bell-circle">
            <i class="fas fa-bell fa-shake"></i>
          </div>
          <div class="banner-texts">
            <span class="system-alert-tag">SYSTEM REMINDER ALERT</span>
            <h3 class="system-alert-title">Follow-up Call Due Now!</h3>
            <span class="system-alert-time">
              <i class="far fa-clock"></i> Scheduled: {{ formatDateTime(activeFollowupAlert.scheduled_time) }}
            </span>
          </div>
          <button class="btn-popup-close-x" @click="dismissFollowupAlert" title="Dismiss Alert">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="system-popup-body">
          <!-- Company & Contact Card -->
          <div class="popup-lead-card">
            <div class="popup-company-avatar">
              {{ (activeFollowupAlert.company_name || 'C').charAt(0).toUpperCase() }}
            </div>
            <div class="popup-lead-details">
              <h4 class="popup-company-name">{{ activeFollowupAlert.company_name }}</h4>
              <div class="popup-meta-chips">
                <span class="popup-chip person" v-if="activeFollowupAlert.contact_person">
                  <i class="fas fa-user-tie"></i> {{ activeFollowupAlert.contact_person }}
                </span>
                <span class="popup-chip service" v-if="activeFollowupAlert.service_required">
                  <i class="fas fa-laptop-code"></i> {{ activeFollowupAlert.service_required }}
                </span>
                <span class="popup-chip deal" v-if="activeFollowupAlert.deal_value">
                  <i class="fas fa-tag"></i> ₹{{ formatCurrency(activeFollowupAlert.deal_value) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Direct Phone Call Strip -->
          <div class="popup-phone-call-strip" v-if="activeFollowupAlert.phone">
            <div class="phone-display">
              <span class="phone-label">Client Phone:</span>
              <strong class="phone-number">{{ activeFollowupAlert.phone }}</strong>
            </div>
            <a :href="'tel:' + activeFollowupAlert.phone" class="btn-popup-call-now" title="Call Client Now">
              <i class="fas fa-phone-alt"></i>
              <span>Call Client Now</span>
            </a>
          </div>

          <!-- Action Items / Remarks -->
          <div class="popup-remarks-container" v-if="activeFollowupAlert.note">
            <span class="remarks-box-label">
              <i class="fas fa-comment-alt"></i> Action Items / Remarks:
            </span>
            <p class="popup-remarks-content">{{ activeFollowupAlert.note }}</p>
          </div>

          <!-- Quick In-Popup Reschedule Picker -->
          <div v-if="showPopupRescheduleInput" class="popup-reschedule-picker">
            <label class="reschedule-input-label">Select New Reminder Date & Time:</label>
            <div class="reschedule-input-row">
              <input
                type="datetime-local"
                v-model="rescheduleNewDateTime"
                :min="minFollowupDateTime"
                class="reschedule-datetime-input"
              />
              <button class="btn-reschedule-confirm" @click="confirmRescheduleInPopup">
                <i class="fas fa-check"></i> Save
              </button>
            </div>
          </div>
        </div>

        <!-- Popup Footer Actions -->
        <div class="system-popup-footer">
          <div class="footer-left-buttons">
            <button class="btn-popup-snooze" @click="snoozeAlert(15)" title="Remind again in 15 minutes">
              <i class="fas fa-bed"></i>
              <span>Snooze (15m)</span>
            </button>
            <button class="btn-popup-reschedule-toggle" @click="toggleRescheduleInPopup">
              <i class="fas fa-calendar-plus"></i>
              <span>Reschedule</span>
            </button>
          </div>
          <div class="footer-right-buttons">
            <button class="btn-popup-acknowledge" @click="acknowledgeAlert">
              <i class="fas fa-check-circle"></i>
              <span>Mark as Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {
  DEFAULT_COUNTRIES,
  fetchCountryCodesApi,
  validateEmail,
  validatePhoneNumber,
  parsePhoneString
} from '@/utils/countryCodes.js';

const DEFAULT_STAGES = [
  'Raw Leads',
  'Hot Deals',
  'Client Demo',
  'Send Quotation',
  'Technical Feasibility',
  'Closed / Lost',
  'PO Confirmed'
];

export default {
  name: 'LeadDetails',

  data() {
    return {
      leadId: null,
      lead: {
        id: null,
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        service_required: 'Enterprise ERP / CRM',
        deal_value: 0,
        status: 'Raw Leads',
        notes: '',
        followups: []
      },
      isLoading: true,
      isUpdatingStatus: false,
      isSubmittingFollowup: false,
      timelineFilter: 'all',

      newFollowup: {
        call_type: 'Phone Call',
        status: 'Connected & Discussed',
        date: '',
        next_followup_date: '',
        note: ''
      },

      // Follow-up reminder & system alert state
      showRescheduleModal: false,
      isSavingReschedule: false,
      rescheduleFormDate: '',
      reminderCheckTimer: null,
      activeFollowupAlert: null,
      showPopupRescheduleInput: false,
      rescheduleNewDateTime: '',

      showEditModal: false,
      isSavingEdit: false,
      countryList: DEFAULT_COUNTRIES,
      selectedCountryCode: '+91',
      editFormPhoneRaw: '',
      emailTouched: false,
      phoneTouched: false,
      editForm: {
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        service_required: '',
        deal_value: 0,
        status: 'Raw Leads',
        notes: ''
      },

      statusOptions: [...DEFAULT_STAGES]
    };
  },

  computed: {
    currentUser() {
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        return {
          ...localUser,
          id: localUser.id || localUser.emp_id || '',
          name: localUser.name || localStorage.getItem('user_name') || 'IT Sales Executive',
          email: localUser.email || '',
          role: localUser.role || '',
          department: localUser.department || ''
        };
      } catch (e) {
        return {
          id: '',
          name: 'IT Sales Executive',
          email: '',
          role: '',
          department: ''
        };
      }
    },

    currentUserName() {
      return this.currentUser.name || 'IT Sales Executive';
    },

    filteredTimeline() {
      const all = Array.isArray(this.lead.followups) ? [...this.lead.followups] : [];
      // Sort newest first
      all.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      if (this.timelineFilter === 'notes') {
        return all.filter(f => f.call_type !== 'Pipeline Update');
      }
      if (this.timelineFilter === 'pipeline') {
        return all.filter(f => f.call_type === 'Pipeline Update');
      }
      return all;
    },

    timelineNotesCount() {
      const all = Array.isArray(this.lead.followups) ? this.lead.followups : [];
      return all.filter(f => f.call_type !== 'Pipeline Update').length;
    },

    timelinePipelineCount() {
      const all = Array.isArray(this.lead.followups) ? this.lead.followups : [];
      return all.filter(f => f.call_type === 'Pipeline Update').length;
    },

    currentCountry() {
      return (
        this.countryList.find(c => c.dial_code === this.selectedCountryCode) ||
        this.countryList[0] ||
        null
      );
    },

    currentCountryRuleText() {
      if (!this.currentCountry) return '7-15 digits';
      if (this.currentCountry.min === this.currentCountry.max) {
        return `${this.currentCountry.min} digits (${this.currentCountry.name})`;
      }
      return `${this.currentCountry.min}-${this.currentCountry.max} digits (${this.currentCountry.name})`;
    },

    emailValidation() {
      return validateEmail(this.editForm.email);
    },

    phoneValidation() {
      return validatePhoneNumber(this.editFormPhoneRaw, this.currentCountry);
    },

    minFollowupDateTime() {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    },

    isFollowupDue() {
      if (!this.lead.next_followup_date) return false;
      return new Date(this.lead.next_followup_date).getTime() <= new Date().getTime();
    },

    followupReminderUrgency() {
      if (!this.lead.next_followup_date) return '';
      const diff = new Date(this.lead.next_followup_date).getTime() - new Date().getTime();
      if (diff <= 0) return 'urgency-overdue';
      if (diff < 3600 * 1000) return 'urgency-imminent';
      return 'urgency-upcoming';
    },

    followupUrgencyLabel() {
      if (!this.lead.next_followup_date) return '';
      const diff = new Date(this.lead.next_followup_date).getTime() - new Date().getTime();
      if (diff <= 0) return 'Follow-up Due Now!';
      if (diff < 3600 * 1000) return 'Due in < 1 hr';
      return 'Scheduled Follow-up';
    },

    followupCountdownText() {
      if (!this.lead.next_followup_date) return '';
      const now = new Date().getTime();
      const target = new Date(this.lead.next_followup_date).getTime();
      const diff = target - now;

      if (diff <= 0) {
        const minsAgo = Math.floor(Math.abs(diff) / (60 * 1000));
        if (minsAgo < 60) return `Due now (${minsAgo}m ago)`;
        const hoursAgo = Math.floor(minsAgo / 60);
        return `Overdue by ${hoursAgo}h ${minsAgo % 60}m`;
      }

      const mins = Math.floor(diff / (60 * 1000));
      if (mins < 60) return `Due in ${mins} minute${mins === 1 ? '' : 's'}`;
      const hours = Math.floor(mins / 60);
      const remMins = mins % 60;
      if (hours < 24) return `Due in ${hours}h ${remMins}m`;
      const days = Math.floor(hours / 24);
      return `Due in ${days} day${days === 1 ? '' : 's'}`;
    }
  },

  created() {
    this.initDateTime();
    this.loadStagesFromColumns();
  },

  mounted() {
    this.initLeadFromRouteOrStorage();
    this.loadCountryCodes();
    this.startReminderChecker();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  },

  beforeUnmount() {
    if (this.reminderCheckTimer) {
      clearInterval(this.reminderCheckTimer);
      this.reminderCheckTimer = null;
    }
  },

  methods: {
    initDateTime() {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      this.newFollowup.date = now.toISOString().slice(0, 16);
    },

    loadStagesFromColumns() {
      try {
        const stored = localStorage.getItem('arch360_it_kanban_columns');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.statusOptions = parsed.map(c => c.label || c.status);
          }
        }
      } catch (e) {
        // use default
      }
    },

    initLeadFromRouteOrStorage() {
      const queryId = this.$route.query.id || this.$route.query.lead_id;
      this.leadId = queryId ? Number(queryId) : null;

      // 1. Try local cache for instant zero-flicker display
      try {
        const cached = localStorage.getItem('active_lead_details');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!this.leadId || parsed.id == this.leadId) {
            this.lead = {
              ...parsed,
              deal_value: Number(parsed.deal_value) || 0,
              followups: Array.isArray(parsed.followups) ? parsed.followups : []
            };
            this.leadId = this.lead.id;
            this.isLoading = false;
          }
        }
      } catch (e) {
        console.error('Error reading active_lead_details from localStorage:', e);
      }

      // 2. Fetch fresh from backend database
      if (this.leadId) {
        this.fetchLeadDetails(this.leadId);
      } else {
        this.isLoading = false;
      }
    },

    async fetchLeadDetails(id) {
      try {
        const res = await axios.get(`/api/leads/${id}`);
        if (res.data && res.data.success && res.data.lead) {
          const fresh = res.data.lead;
          this.lead = {
            ...fresh,
            deal_value: Number(fresh.deal_value) || 0,
            followups: Array.isArray(fresh.followups) ? fresh.followups : []
          };
          localStorage.setItem('active_lead_details', JSON.stringify(this.lead));
        }
      } catch (err) {
        console.error('Failed to load lead details from API:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async updateStatus(newStatus) {
      if (!this.lead.id || !newStatus || this.lead.status === newStatus) return;
      const prevStatus = this.lead.status;
      this.lead.status = newStatus;
      this.isUpdatingStatus = true;

      try {
        const res = await axios.put(`/api/leads/${this.lead.id}`, {
          status: newStatus,
          updated_by: this.currentUserName
        });

        if (res.data && res.data.success && res.data.lead) {
          const updated = res.data.lead;
          this.lead = {
            ...updated,
            deal_value: Number(updated.deal_value) || 0,
            followups: Array.isArray(updated.followups) ? updated.followups : []
          };
          localStorage.setItem('active_lead_details', JSON.stringify(this.lead));
          this.syncPipelineLeadsCache();
        }
      } catch (err) {
        console.error('Failed to update stage:', err);
        this.lead.status = prevStatus;
        alert('Failed to update pipeline stage: ' + (err.response?.data?.message || err.message));
      } finally {
        this.isUpdatingStatus = false;
      }
    },

    setNextFollowupQuick(type) {
      const d = new Date();
      if (type === '1h') {
        d.setHours(d.getHours() + 1);
      } else if (type === 'tomorrow10') {
        d.setDate(d.getDate() + 1);
        d.setHours(10, 0, 0, 0);
      } else if (type === 'tomorrow3') {
        d.setDate(d.getDate() + 1);
        d.setHours(15, 0, 0, 0);
      } else if (type === '2days') {
        d.setDate(d.getDate() + 2);
        d.setHours(11, 0, 0, 0);
      }
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      this.newFollowup.next_followup_date = d.toISOString().slice(0, 16);
    },

    openRescheduleModal() {
      this.rescheduleFormDate = this.lead.next_followup_date || this.minFollowupDateTime;
      this.showRescheduleModal = true;
    },

    setRescheduleQuick(type) {
      const d = new Date();
      if (type === '1h') {
        d.setHours(d.getHours() + 1);
      } else if (type === 'tomorrow10') {
        d.setDate(d.getDate() + 1);
        d.setHours(10, 0, 0, 0);
      } else if (type === 'tomorrow3') {
        d.setDate(d.getDate() + 1);
        d.setHours(15, 0, 0, 0);
      } else if (type === '2days') {
        d.setDate(d.getDate() + 2);
        d.setHours(11, 0, 0, 0);
      }
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      this.rescheduleFormDate = d.toISOString().slice(0, 16);
    },

    async saveReschedule() {
      if (!this.rescheduleFormDate || !this.lead.id) return;
      this.isSavingReschedule = true;
      try {
        const res = await axios.put(`/api/leads/${this.lead.id}`, {
          next_followup_date: this.rescheduleFormDate,
          updated_by: this.currentUserName
        });

        if (res.data && res.data.success && res.data.lead) {
          const updated = res.data.lead;
          this.lead = {
            ...updated,
            deal_value: Number(updated.deal_value) || 0,
            followups: Array.isArray(updated.followups) ? updated.followups : []
          };
          localStorage.setItem('active_lead_details', JSON.stringify(this.lead));
          this.syncPipelineLeadsCache();

          // Register in shared reminders
          this.registerScheduledReminder({
            leadId: this.lead.id,
            company_name: this.lead.company_name,
            contact_person: this.lead.contact_person,
            phone: this.lead.phone,
            email: this.lead.email,
            service_required: this.lead.service_required,
            deal_value: this.lead.deal_value,
            status: this.lead.status,
            note: 'Scheduled next client follow-up call',
            scheduled_time: this.rescheduleFormDate,
            created_at: new Date().toISOString()
          });

          this.showRescheduleModal = false;
        }
      } catch (err) {
        console.error('Failed to reschedule follow-up:', err);
        alert('Failed to reschedule: ' + (err.response?.data?.message || err.message));
      } finally {
        this.isSavingReschedule = false;
      }
    },

    registerScheduledReminder(reminder) {
      try {
        let list = JSON.parse(localStorage.getItem('arch360_scheduled_reminders') || '[]');
        // Remove older reminders for the same lead
        list = list.filter(r => String(r.leadId) !== String(reminder.leadId));
        list.push({
          ...reminder,
          id: 'rem_' + Date.now(),
          alerted: false,
          dismissed: false
        });
        localStorage.setItem('arch360_scheduled_reminders', JSON.stringify(list));
      } catch (e) {
        console.error('Failed to register scheduled reminder in localStorage:', e);
      }
    },

    startReminderChecker() {
      this.checkPendingReminders();
      if (this.reminderCheckTimer) clearInterval(this.reminderCheckTimer);
      this.reminderCheckTimer = setInterval(() => {
        this.checkPendingReminders();
      }, 5000);
    },

    checkPendingReminders() {
      if (this.activeFollowupAlert) return;
      const now = new Date().getTime();

      // 1. Check current lead
      if (this.lead && this.lead.id && this.lead.next_followup_date) {
        const scheduledTime = new Date(this.lead.next_followup_date).getTime();
        const alertKey = `arch_alerted_${this.lead.id}_${this.lead.next_followup_date}`;
        const alreadyAlerted = localStorage.getItem(alertKey);
        if (scheduledTime <= now && !alreadyAlerted) {
          localStorage.setItem(alertKey, 'true');
          this.triggerFollowupPopup({
            leadId: this.lead.id,
            company_name: this.lead.company_name,
            contact_person: this.lead.contact_person,
            phone: this.lead.phone,
            email: this.lead.email,
            service_required: this.lead.service_required,
            deal_value: this.lead.deal_value,
            status: this.lead.status,
            note: this.lead.notes || 'Follow-up discussion scheduled',
            scheduled_time: this.lead.next_followup_date
          });
          return;
        }
      }

      // 2. Check all scheduled reminders
      try {
        const list = JSON.parse(localStorage.getItem('arch360_scheduled_reminders') || '[]');
        for (let i = 0; i < list.length; i++) {
          const r = list[i];
          if (r && !r.dismissed && !r.alerted) {
            const t = new Date(r.scheduled_time).getTime();
            if (t <= now) {
              r.alerted = true;
              localStorage.setItem('arch360_scheduled_reminders', JSON.stringify(list));
              this.triggerFollowupPopup(r);
              break;
            }
          }
        }
      } catch (e) {
        console.error('Reminder check loop error:', e);
      }
    },

    triggerFollowupPopup(alertData) {
      this.activeFollowupAlert = alertData;
      this.showPopupRescheduleInput = false;
      this.playChime();
      this.showDesktopNotification(alertData);
    },

    playChime() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain1.gain.setValueAtTime(0.15, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.35);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.2);
        osc2.stop(ctx.currentTime + 0.7);
      } catch (e) {
        console.warn('Audio chime error:', e);
      }
    },

    showDesktopNotification(alertData) {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        try {
          new Notification(`⏰ Follow-up Due: ${alertData.company_name}`, {
            body: `${alertData.contact_person || 'Client'}: ${alertData.note || 'Scheduled call due now!'}`,
            icon: '/favicon.ico'
          });
        } catch (e) {}
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    },

    dismissFollowupAlert() {
      this.activeFollowupAlert = null;
      this.showPopupRescheduleInput = false;
    },

    snoozeAlert(minutes = 15) {
      if (!this.activeFollowupAlert) return;
      const targetTime = new Date(Date.now() + minutes * 60 * 1000);
      const isoStr = targetTime.toISOString().slice(0, 16);

      try {
        let list = JSON.parse(localStorage.getItem('arch360_scheduled_reminders') || '[]');
        const idx = list.findIndex(r => String(r.leadId) === String(this.activeFollowupAlert.leadId));
        if (idx !== -1) {
          list[idx].scheduled_time = isoStr;
          list[idx].alerted = false;
        } else {
          list.push({
            ...this.activeFollowupAlert,
            scheduled_time: isoStr,
            alerted: false
          });
        }
        localStorage.setItem('arch360_scheduled_reminders', JSON.stringify(list));

        if (String(this.lead.id) === String(this.activeFollowupAlert.leadId)) {
          this.lead.next_followup_date = isoStr;
          localStorage.setItem('active_lead_details', JSON.stringify(this.lead));
          axios.put(`/api/leads/${this.lead.id}`, { next_followup_date: isoStr }).catch(() => {});
        }
      } catch (e) {
        console.error('Snooze error:', e);
      }

      this.dismissFollowupAlert();
    },

    acknowledgeAlert() {
      if (!this.activeFollowupAlert) return;
      try {
        let list = JSON.parse(localStorage.getItem('arch360_scheduled_reminders') || '[]');
        list = list.filter(r => String(r.leadId) !== String(this.activeFollowupAlert.leadId));
        localStorage.setItem('arch360_scheduled_reminders', JSON.stringify(list));

        if (String(this.lead.id) === String(this.activeFollowupAlert.leadId)) {
          this.lead.next_followup_date = null;
          localStorage.setItem('active_lead_details', JSON.stringify(this.lead));
          axios.put(`/api/leads/${this.lead.id}`, { next_followup_date: null }).catch(() => {});
        }
      } catch (e) {
        console.error('Acknowledge error:', e);
      }
      this.dismissFollowupAlert();
    },

    toggleRescheduleInPopup() {
      this.showPopupRescheduleInput = !this.showPopupRescheduleInput;
      if (this.showPopupRescheduleInput) {
        this.rescheduleNewDateTime = this.minFollowupDateTime;
      }
    },

    async confirmRescheduleInPopup() {
      if (!this.rescheduleNewDateTime || !this.activeFollowupAlert) return;
      const targetId = this.activeFollowupAlert.leadId;
      const newTime = this.rescheduleNewDateTime;

      try {
        let list = JSON.parse(localStorage.getItem('arch360_scheduled_reminders') || '[]');
        const idx = list.findIndex(r => String(r.leadId) === String(targetId));
        if (idx !== -1) {
          list[idx].scheduled_time = newTime;
          list[idx].alerted = false;
        } else {
          list.push({
            ...this.activeFollowupAlert,
            scheduled_time: newTime,
            alerted: false
          });
        }
        localStorage.setItem('arch360_scheduled_reminders', JSON.stringify(list));

        await axios.put(`/api/leads/${targetId}`, { next_followup_date: newTime });

        if (String(this.lead.id) === String(targetId)) {
          this.lead.next_followup_date = newTime;
          localStorage.setItem('active_lead_details', JSON.stringify(this.lead));
          this.syncPipelineLeadsCache();
        }
      } catch (e) {
        console.error('Popup reschedule error:', e);
      }

      this.dismissFollowupAlert();
    },

    formatDateTime(dt) {
      if (!dt) return '-';
      try {
        const d = new Date(dt);
        if (isNaN(d.getTime())) return String(dt);
        return d.toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (e) {
        return String(dt);
      }
    },

    async submitFollowup() {
      if (!this.newFollowup.note.trim() || !this.lead.id) return;
      this.isSubmittingFollowup = true;

      try {
        const payload = {
          note: this.newFollowup.note.trim(),
          call_type: this.newFollowup.call_type,
          status: this.newFollowup.status,
          date: this.newFollowup.date || new Date().toISOString().slice(0, 16),
          next_followup_date: this.newFollowup.next_followup_date || null,
          logged_by: this.currentUserName
        };

        const res = await axios.post(`/api/leads/${this.lead.id}/followups`, payload);
        if (res.data && res.data.success && res.data.lead) {
          const updated = res.data.lead;
          this.lead = {
            ...updated,
            deal_value: Number(updated.deal_value) || 0,
            followups: Array.isArray(updated.followups) ? updated.followups : []
          };
          localStorage.setItem('active_lead_details', JSON.stringify(this.lead));
          this.syncPipelineLeadsCache();

          // Register in shared reminders
          if (this.newFollowup.next_followup_date) {
            this.registerScheduledReminder({
              leadId: this.lead.id,
              company_name: this.lead.company_name,
              contact_person: this.lead.contact_person,
              phone: this.lead.phone,
              email: this.lead.email,
              service_required: this.lead.service_required,
              deal_value: this.lead.deal_value,
              status: this.lead.status,
              note: this.newFollowup.note.trim(),
              scheduled_time: this.newFollowup.next_followup_date,
              created_at: new Date().toISOString()
            });
          }

          // Reset fields
          this.newFollowup.note = '';
          this.newFollowup.next_followup_date = '';
          this.initDateTime();
        }
      } catch (err) {
        console.error('Failed to save follow-up:', err);
        alert('Failed to save activity note: ' + (err.response?.data?.message || err.message));
      } finally {
        this.isSubmittingFollowup = false;
      }
    },

    async deleteFollowup(targetId) {
      if (!this.lead.id || !targetId) return;
      if (!confirm('Are you sure you want to delete this activity entry?')) return;

      try {
        const res = await axios.delete(`/api/leads/${this.lead.id}/followups/${targetId}`);
        if (res.data && res.data.success && res.data.lead) {
          const updated = res.data.lead;
          this.lead = {
            ...updated,
            deal_value: Number(updated.deal_value) || 0,
            followups: Array.isArray(updated.followups) ? updated.followups : []
          };
          localStorage.setItem('active_lead_details', JSON.stringify(this.lead));
          this.syncPipelineLeadsCache();
        }
      } catch (err) {
        console.error('Failed to delete activity note:', err);
        alert('Failed to delete activity entry: ' + (err.response?.data?.message || err.message));
      }
    },

    async loadCountryCodes() {
      try {
        const list = await fetchCountryCodesApi();
        if (Array.isArray(list) && list.length > 0) {
          this.countryList = list;
        }
      } catch (e) {
        console.warn('Failed to load country codes API, using default list:', e);
      }
    },

    onPhoneInput() {
      this.editFormPhoneRaw = (this.editFormPhoneRaw || '').replace(/[^\d\s]/g, '');
      this.phoneTouched = true;
    },

    onEmailInput() {
      this.emailTouched = true;
    },

    onCountryChange() {
      this.phoneTouched = true;
    },

    openEditModal() {
      this.emailTouched = false;
      this.phoneTouched = false;

      const parsed = parsePhoneString(this.lead.phone, this.countryList);
      this.selectedCountryCode = parsed.dialCode;
      this.editFormPhoneRaw = parsed.rawNumber;

      this.editForm = {
        company_name: this.lead.company_name || '',
        contact_person: this.lead.contact_person || '',
        email: this.lead.email || '',
        phone: this.lead.phone || '',
        service_required: this.lead.service_required || 'Enterprise ERP / CRM',
        deal_value: Number(this.lead.deal_value) || 0,
        status: this.lead.status || 'Raw Leads',
        notes: this.lead.notes || ''
      };
      this.showEditModal = true;
    },

    async submitEditLead() {
      if (!this.lead.id) return;

      this.emailTouched = true;
      this.phoneTouched = true;

      if (!this.editForm.company_name || !this.editForm.company_name.trim()) {
        alert('Please enter Company / Organization name.');
        return;
      }
      if (!this.editForm.contact_person || !this.editForm.contact_person.trim()) {
        alert('Please enter Contact Person name.');
        return;
      }
      if (!this.emailValidation.isValid) {
        alert(this.emailValidation.message || 'Please enter a valid email address.');
        return;
      }
      if (!this.phoneValidation.isValid) {
        alert(this.phoneValidation.message || 'Please enter a valid mobile number.');
        return;
      }

      const digits = (this.editFormPhoneRaw || '').replace(/\D/g, '');
      const finalPhone = digits ? `${this.selectedCountryCode} ${digits}` : '';

      this.isSavingEdit = true;
      try {
        const payload = {
          company_name: this.editForm.company_name,
          contact_person: this.editForm.contact_person,
          email: this.editForm.email,
          phone: finalPhone,
          service_required: this.editForm.service_required,
          deal_value: this.editForm.deal_value,
          status: this.editForm.status,
          notes: this.editForm.notes
        };

        const res = await axios.put(`/api/leads/${this.lead.id}`, payload);
        if (res.data && res.data.success && res.data.lead) {
          const updated = res.data.lead;
          this.lead = {
            ...updated,
            deal_value: Number(updated.deal_value) || 0,
            followups: Array.isArray(updated.followups) ? updated.followups : []
          };
          localStorage.setItem('active_lead_details', JSON.stringify(this.lead));
          this.syncPipelineLeadsCache();
          this.showEditModal = false;
        }
      } catch (err) {
        console.error('Failed to update lead:', err);
        alert('Failed to save changes: ' + (err.response?.data?.message || err.message));
      } finally {
        this.isSavingEdit = false;
      }
    },

    async confirmDeleteLead() {
      if (!this.lead.id) return;
      if (!confirm(`Are you sure you want to delete "${this.lead.company_name}"? This action cannot be undone.`)) {
        return;
      }

      try {
        await axios.delete(`/api/leads/${this.lead.id}`);
        // Remove from local pipeline cache
        try {
          const cached = JSON.parse(localStorage.getItem('arch360_it_leads_data') || '[]');
          const filtered = cached.filter(l => l.id !== this.lead.id);
          localStorage.setItem('arch360_it_leads_data', JSON.stringify(filtered));
        } catch (e) {}

        this.goToPipeline();
      } catch (err) {
        console.error('Failed to delete lead:', err);
        alert('Failed to delete lead: ' + (err.response?.data?.message || err.message));
      }
    },

    openQuotationTab() {
      if (!this.lead) return;
      localStorage.setItem('active_quotation_lead', JSON.stringify(this.lead));
      const routeData = this.$router.resolve({
        path: '/employee/client-quotations',
        query: {
          company: this.lead.company_name,
          contact: this.lead.contact_person,
          email: this.lead.email || '',
          phone: this.lead.phone || '',
          service: this.lead.service_required || '',
          deal_value: this.lead.deal_value || 0,
          lead_id: this.lead.id
        }
      });
      window.open(routeData.href, '_blank');
    },

    syncPipelineLeadsCache() {
      try {
        const cached = JSON.parse(localStorage.getItem('arch360_it_leads_data') || '[]');
        const idx = cached.findIndex(l => l.id === this.lead.id);
        if (idx !== -1) {
          cached[idx] = { ...this.lead };
        } else {
          cached.unshift({ ...this.lead });
        }
        localStorage.setItem('arch360_it_leads_data', JSON.stringify(cached));
      } catch (e) {}
    },

    goToPipeline() {
      this.$router.push('/employee/lead-management');
    },

    closeCurrentTab() {
      window.close();
    },

    formatCurrency(val) {
      const num = Number(val) || 0;
      return '₹' + num.toLocaleString('en-IN');
    },

    formatShortDate(dateStr) {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr).substring(0, 10);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (e) {
        return '';
      }
    },

    formatTimelineDate(dateStr) {
      if (!dateStr) return 'Just now';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return dateStr;
      }
    },

    getNodeIcon(callType) {
      switch (callType) {
        case 'Phone Call': return 'fas fa-phone-alt';
        case 'Video Meeting': return 'fas fa-video';
        case 'WhatsApp Discussion': return 'fab fa-whatsapp';
        case 'Client Office Visit': return 'fas fa-building';
        case 'Email Communication': return 'fas fa-envelope';
        case 'Lead Creation': return 'fas fa-sparkles';
        case 'Pipeline Update': return 'fas fa-exchange-alt';
        default: return 'fas fa-comment-dots';
      }
    },

    getNodeIconClass(callType) {
      switch (callType) {
        case 'Phone Call': return 'type-phone';
        case 'Video Meeting': return 'type-video';
        case 'WhatsApp Discussion': return 'type-whatsapp';
        case 'Client Office Visit': return 'type-visit';
        case 'Email Communication': return 'type-email';
        case 'Lead Creation': return 'type-creation';
        case 'Pipeline Update': return 'type-pipeline';
        default: return 'type-note';
      }
    }
  }
};
</script>

<style scoped>
/* ─── BASE LAYOUT ─── */
.lead-details-page {
  min-height: 100vh;
  background-color: #f1f5f9;
  background-image:
    radial-gradient(circle at 12% 0%, rgba(219, 234, 254, 0.7) 0%, transparent 45%),
    radial-gradient(circle at 88% 8%, rgba(199, 210, 254, 0.45) 0%, transparent 50%),
    radial-gradient(circle at 50% 100%, rgba(224, 231, 255, 0.4) 0%, transparent 60%);
  color: #0f172a;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  box-sizing: border-box;
}

/* ─── TOP HERO HEADER (CLEAN MODERN EXECUTIVE WHITE) ─── */
.lead-details-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  gap: 1.25rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.15rem;
  flex: 1;
  min-width: 320px;
}

.btn-back-pipeline {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #1e3a8a;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-back-pipeline:hover {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
  transform: translateX(-2px);
}

.header-divider {
  width: 1px;
  height: 28px;
  background: #e2e8f0;
}

.gradient-avatar {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.header-company-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.company-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.015em;
  margin: 0;
}

.status-pill-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.status-new, .status-rawleads, .status-raw { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
.status-hotdeals, .status-hot, .status-contacted { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.status-clientdemo, .status-demo { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }
.status-sendquotation, .status-activequotations, .status-quotationsend { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
.status-technicalfeasibility { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
.status-won, .status-poconfirmed { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.status-lost, .status-closedlost { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

.header-service-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.76rem;
  font-weight: 500;
  color: #334155;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.18rem 0.65rem;
  border-radius: 999px;
}

.header-service-badge i {
  color: #2563eb;
  font-size: 0.8rem;
}

.contact-pill-list {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.contact-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #475569;
  text-decoration: none;
  transition: all 0.15s ease;
}

.contact-chip strong {
  color: #0f172a;
  font-weight: 600;
}

.contact-chip i {
  font-size: 0.74rem;
  color: #64748b;
}

.contact-chip.link {
  color: #0284c7;
}

.contact-chip.link:hover {
  text-decoration: underline;
  color: #0369a1;
}

.contact-chip.date-chip {
  color: #64748b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.btn-action-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.48rem 0.95rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.btn-action-ghost:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-action-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.48rem 1.05rem;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border: 1px solid #059669;
  color: #ffffff;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);
}

.btn-action-primary:hover {
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.35);
}

.tab-icon {
  font-size: 0.72rem;
  opacity: 0.85;
}

.btn-action-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.48rem 0.9rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action-danger:hover {
  background: #fee2e2;
  border-color: #f87171;
  color: #b91c1c;
}

.btn-action-close {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.48rem 0.85rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action-close:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

/* ─── LOADING STATE ─── */
.state-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner-box {
  text-align: center;
  color: #475569;
}

.loading-spinner-box i {
  font-size: 2.2rem;
  color: #2563eb;
  margin-bottom: 0.75rem;
}

/* ─── MAIN BODY (SPLIT VIEW) ─── */
.lead-details-body {
  flex: 1;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  box-sizing: border-box;
  align-items: start;
}

@media (max-width: 1080px) {
  .lead-details-body {
    grid-template-columns: 1fr;
  }
}

.details-left-pane {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.details-right-pane {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ─── WORKSPACE CARDS ─── */
.workspace-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  padding: 1.25rem 1.4rem;
  box-sizing: border-box;
}

/* ─── DEAL OVERVIEW CARD ─── */
.deal-service-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.65rem 0.95rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.service-label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
}

.service-value {
  font-size: 0.85rem;
  color: #1e3a8a;
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.metric-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.metric-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stage-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.stage-pulse-dot {
  position: absolute;
  left: 0.75rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
}

.dot-rawleads, .dot-new, .dot-raw { background: #3b82f6; }
.dot-hotdeals, .dot-hot, .dot-contacted { background: #ef4444; }
.dot-clientdemo, .dot-demo { background: #a855f7; }
.dot-sendquotation, .dot-activequotations, .dot-quotationsend { background: #f59e0b; }
.dot-technicalfeasibility { background: #6366f1; }
.dot-won, .dot-poconfirmed { background: #10b981; }
.dot-lost, .dot-closedlost { background: #64748b; }

.modern-stage-select {
  width: 100%;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.42rem 1.8rem 0.42rem 1.75rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  appearance: none;
  transition: all 0.15s ease;
}

.modern-stage-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.select-chevron {
  position: absolute;
  right: 0.75rem;
  color: #94a3b8;
  font-size: 0.72rem;
  pointer-events: none;
}

.metric-val {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.text-emerald {
  color: #059669;
}

.deal-notes-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #3b82f6;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  margin-top: 1rem;
}

.notes-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.2rem;
}

.notes-content {
  margin: 0;
  font-size: 0.78rem;
  color: #334155;
  line-height: 1.45;
}

.deal-client-info-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
}

.info-label {
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.info-label i {
  color: #94a3b8;
  font-size: 0.75rem;
}

.info-value {
  color: #1e293b;
  font-weight: 500;
}

.info-link {
  color: #0284c7;
  text-decoration: none;
  font-weight: 500;
}

.info-link:hover {
  text-decoration: underline;
}

/* ─── LOG FOLLOW-UP COMPOSER ─── */
.composer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}

.composer-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.composer-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.composer-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.composer-desc {
  font-size: 0.74rem;
  color: #64748b;
  margin: 0.15rem 0 0;
}

.active-rep-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.22rem 0.65rem;
  border-radius: 6px;
  font-size: 0.72rem;
  color: #475569;
  flex-shrink: 0;
}

.active-rep-pill strong {
  color: #1e293b;
  font-weight: 600;
}

.composer-form {
  display: flex;
  flex-direction: column;
}

.composer-split-row {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  align-items: stretch;
}

@media (max-width: 900px) {
  .composer-split-row {
    grid-template-columns: 1fr;
  }
}

.composer-col-left {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.composer-col-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.65rem;
}

.composer-field-fill {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.remarks-textarea {
  flex: 1;
  min-height: 110px;
  resize: vertical;
}

.composer-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.composer-label {
  font-size: 0.76rem;
  font-weight: 500;
  color: #334155;
}

.composer-select,
.composer-input,
.composer-textarea {
  width: 100%;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.48rem 0.75rem;
  font-size: 0.82rem;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.15s ease;
}

.composer-select:focus,
.composer-input:focus,
.composer-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.composer-submit-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.35rem;
}

.btn-save-note {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.52rem 1.25rem;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border: 1px solid #38bdf8;
  color: #ffffff;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
  transition: all 0.15s ease;
}

.btn-save-note:hover:not(:disabled) {
  background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.btn-save-note:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-save-note:hover:not(:disabled) {
  background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.btn-save-note:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ─── TIMELINE CARD & BODY ─── */
.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.timeline-heading-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.timeline-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #1e3a8a;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.timeline-heading {
  font-size: 0.98rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.timeline-subheading {
  font-size: 0.74rem;
  color: #64748b;
  margin: 0.15rem 0 0;
}

.total-activity-pill {
  font-size: 0.72rem;
  font-weight: 600;
  color: #1e3a8a;
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
}

.timeline-tab-filters {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.2rem;
}

.timeline-filter-btn {
  padding: 0.3rem 0.7rem;
  font-size: 0.74rem;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.timeline-filter-btn.active {
  background: #ffffff;
  color: #0f172a;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.empty-timeline-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  color: #64748b;
}

.empty-timeline-icon {
  font-size: 2.2rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.empty-desc {
  font-size: 0.78rem;
  color: #64748b;
  max-width: 400px;
  margin: 0 auto;
}

.timeline-stream {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.timeline-entry {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.node-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  z-index: 2;
}

.type-phone { background: linear-gradient(135deg, #0284c7, #2563eb); }
.type-video { background: linear-gradient(135deg, #7c3aed, #9333ea); }
.type-whatsapp { background: linear-gradient(135deg, #059669, #10b981); }
.type-visit { background: linear-gradient(135deg, #d97706, #f59e0b); }
.type-email { background: linear-gradient(135deg, #0284c7, #06b6d4); }
.type-creation { background: linear-gradient(135deg, #2563eb, #3b82f6); }
.type-pipeline { background: linear-gradient(135deg, #475569, #64748b); }
.type-note { background: linear-gradient(135deg, #3b82f6, #60a5fa); }

.node-stem {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: #e2e8f0;
  margin-top: 0.25rem;
}

.timeline-content-card {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.85rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  transition: all 0.15s ease;
}

.timeline-content-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.entry-meta-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.entry-author-info {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.author-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f172a;
}

.entry-type-chip {
  font-size: 0.7rem;
  font-weight: 500;
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
}

.entry-outcome-chip {
  font-size: 0.7rem;
  font-weight: 500;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
}

.outcome-dealwonconfirmed { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.outcome-proposalrequested { background: #fef3c7; color: #b45309; border-color: #fde68a; }
.outcome-demoscheduled { background: #ede9fe; color: #6d28d9; border-color: #ddd6fe; }
.outcome-notinterestedlost { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }

.entry-right-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.entry-date-text {
  font-size: 0.72rem;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-delete-entry {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.76rem;
  cursor: pointer;
  padding: 0.2rem;
  transition: color 0.15s ease;
}

.btn-delete-entry:hover {
  color: #dc2626;
}

.entry-note-text {
  font-size: 0.8rem;
  color: #334155;
  line-height: 1.5;
  white-space: pre-line;
}

/* ─── MODAL STYLES ─── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 14px;
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.modal-header {
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
}

.modal-title-group h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.modal-title-group p {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0.1rem 0 0;
}

.btn-modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
}

.btn-modal-close:hover {
  color: #0f172a;
}

.modal-form {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-size: 0.76rem;
  font-weight: 500;
  color: #334155;
}

.required {
  color: #dc2626;
}

.form-control {
  width: 100%;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.48rem 0.75rem;
  font-size: 0.82rem;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.15s ease;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 0.5rem;
}

.btn-cancel {
  padding: 0.48rem 1rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.48rem 1.15rem;
  background: #0284c7;
  border: 1px solid #0284c7;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.text-blue-muted {
  color: #3b82f6;
  margin-right: 0.25rem;
}

.label-with-rule {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.label-with-rule label {
  margin-bottom: 0 !important;
}

.country-rule-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: #1e40af;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  letter-spacing: 0.01em;
}

/* International Phone Combo Input */
.phone-combo-input {
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.phone-combo-input:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.phone-combo-input.has-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
}

.phone-combo-input.has-success {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
}

.country-picker-wrap {
  position: relative;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.country-select {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  padding: 0.5rem 1.75rem 0.5rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  outline: none;
  max-width: 145px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.country-caret {
  position: absolute;
  right: 0.55rem;
  font-size: 0.65rem;
  color: #64748b;
  pointer-events: none;
}

.phone-national-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: #0f172a;
  outline: none;
  font-family: inherit;
}

/* Email Input with Icon Wrap */
.input-with-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon-wrap .email-field-input {
  padding-right: 2.2rem;
}

.input-with-icon-wrap.has-error .form-control {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
}

.input-with-icon-wrap.has-success .form-control {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
}

.validation-status-icon {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.92rem;
  pointer-events: none;
}

.text-emerald {
  color: #10b981 !important;
}

.text-rose {
  color: #ef4444 !important;
}

/* Inline Feedback */
.field-feedback-box {
  margin-top: 0.3rem;
  min-height: 16px;
}

.field-msg {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  font-weight: 500;
  line-height: 1.3;
}

.field-msg.error {
  color: #dc2626;
}

.field-msg.success {
  color: #059669;
}

.fadeIn {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ════════ SCHEDULED NEXT FOLLOW-UP SIDEBAR CARD ════════ */
.scheduled-followup-card {
  margin-top: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.scheduled-followup-card.urgency-upcoming {
  border-left: 4px solid #10b981;
  background: #f0fdf4;
}

.scheduled-followup-card.urgency-imminent {
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
}

.scheduled-followup-card.urgency-overdue {
  border-left: 4px solid #ef4444;
  background: #fef2f2;
}

.scheduled-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scheduled-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #065f46;
}

.urgency-imminent .scheduled-badge {
  color: #b45309;
}

.urgency-overdue .scheduled-badge {
  color: #dc2626;
}

.btn-reschedule-link {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-reschedule-link:hover {
  text-decoration: underline;
}

.scheduled-datetime-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #0f172a;
}

.scheduled-countdown-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
}

/* ════════ COMPOSER: NEXT FOLLOW-UP FIELD & QUICK CHIPS ════════ */
.next-followup-field {
  background: #faf8ff;
  border: 1px dashed #d8b4fe;
  border-radius: 8px;
  padding: 8px 10px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.btn-clear-reminder {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.btn-clear-reminder:hover {
  text-decoration: underline;
}

.next-date-input {
  background: #ffffff !important;
  border-color: #c084fc !important;
  font-weight: 600;
  color: #581c87 !important;
}

.next-date-input:focus {
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
}

.quick-preset-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.quick-chip {
  background: #ffffff;
  border: 1px solid #d8b4fe;
  color: #6b21a8;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-chip:hover {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: #ffffff;
}

.modal-chips {
  margin-bottom: 16px;
}

.entry-scheduled-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 9px;
  border-radius: 6px;
  margin-top: 6px;
}

/* ════════ SYSTEM REMINDER POPUP MODAL ════════ */
.system-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.system-popup-modal {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  animation: popupSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid #e2e8f0;
}

@keyframes popupSlideDown {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.system-popup-banner {
  background: linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%);
  color: #ffffff;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
}

.ringing-bell-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 0 14px rgba(255, 255, 255, 0.5);
}

.fa-shake {
  animation: bellShake 1.4s infinite ease-in-out;
}

@keyframes bellShake {
  0% { transform: rotate(0); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-14deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-10deg); }
  50% { transform: rotate(6deg); }
  60% { transform: rotate(-6deg); }
  70% { transform: rotate(0); }
  100% { transform: rotate(0); }
}

.banner-texts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.system-alert-tag {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fef3c7;
  text-transform: uppercase;
}

.system-alert-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
}

.system-alert-time {
  font-size: 0.74rem;
  color: #fffbeb;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-popup-close-x {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-popup-close-x:hover {
  background: rgba(255, 255, 255, 0.35);
}

.system-popup-body {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.popup-lead-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px 14px;
  border-radius: 10px;
}

.popup-company-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.popup-lead-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.popup-company-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.popup-meta-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.popup-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  padding: 2px 7px;
  border-radius: 6px;
  font-weight: 600;
}

.popup-chip.person { background: #eff6ff; color: #1e40af; }
.popup-chip.service { background: #f5f3ff; color: #6d28d9; }
.popup-chip.deal { background: #ecfdf5; color: #065f46; font-weight: 700; }

.popup-phone-call-strip {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.phone-display {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.phone-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #065f46;
  text-transform: uppercase;
}

.phone-number {
  font-size: 1.05rem;
  font-weight: 800;
  color: #064e3b;
  letter-spacing: 0.02em;
}

.btn-popup-call-now {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #059669;
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35);
  transition: all 0.2s;
}

.btn-popup-call-now:hover {
  background: #047857;
  transform: translateY(-1px);
}

.popup-remarks-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
}

.remarks-box-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
}

.popup-remarks-content {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #1e293b;
}

.popup-reschedule-picker {
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  border-radius: 8px;
  padding: 10px 12px;
  animation: fadeIn 0.2s ease;
}

.reschedule-input-label {
  display: block;
  font-size: 0.74rem;
  font-weight: 700;
  color: #6b21a8;
  margin-bottom: 6px;
}

.reschedule-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reschedule-datetime-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #c084fc;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  outline: none;
}

.btn-reschedule-confirm {
  background: #7c3aed;
  color: #ffffff;
  border: none;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-reschedule-confirm:hover {
  background: #6d28d9;
}

.system-popup-footer {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-left-buttons, .footer-right-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-popup-snooze, .btn-popup-reschedule-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-popup-snooze:hover, .btn-popup-reschedule-toggle:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-popup-acknowledge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-popup-acknowledge:hover {
  background: #1e293b;
}

.amber-badge {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
  color: #ffffff !important;
}

.modal-card-sm {
  max-width: 440px !important;
}
</style>
