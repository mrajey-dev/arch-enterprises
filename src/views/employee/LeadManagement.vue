<template>
  <div class="crm-page-container">

    <!-- 🌐 TOP EXECUTIVE BREADCRUMB / ACTION BAR -->
    <div class="crm-nav-subbar">
      <button class="nav-back-link" @click="goTo('employee/dashboard')" title="Back to Dashboard">
        <i class="fas fa-arrow-left"></i>
        <span>Dashboard</span>
      </button>
      <div class="nav-scope-tags">
        <span class="pipeline-badge">IT SALES PIPELINE</span>
        <span v-if="isOwnership" class="scope-indicator-badge owner" title="Ownership Access">
          <i class="fas fa-crown"></i> Ownership Access
        </span>
        <span v-else-if="isITLead" class="scope-indicator-badge it-lead" title="IT Lead Access">
          <i class="fas fa-user-shield"></i> IT Lead Access
        </span>
        <span v-else class="scope-indicator-badge member" :title="'Showing leads for ' + currentUserName">
          <i class="fas fa-user-lock"></i> {{ currentUserName }}
        </span>
      </div>
      <div class="nav-extra-actions">
        <button class="btn-subbar-report" @click="openDailyReportModal" title="View Today's Real-Time Sales Activity & Conversion Report">
          <i class="fas fa-chart-line"></i>
          <span>Today's Report</span>
          <span class="report-pulse-dot"></span>
        </button>
        <button class="btn-subbar-ghost" @click="loadLeads" :disabled="isLoading" title="Sync leads with database">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          <span>{{ isLoading ? 'Syncing...' : 'Sync' }}</span>
        </button>
        <button class="btn-subbar-ghost" @click="exportToCSV" title="Export pipeline to CSV">
          <i class="fas fa-download"></i>
          <span>Export</span>
        </button>
        <button class="btn-subbar-primary" @click="openAddLeadModal">
          <i class="fas fa-plus"></i>
          <span>New Lead</span>
        </button>
      </div>
    </div>

    <!-- 🌟 TOP FILTER BAR: SUPER ADMIN VIEW FILTER (OWNER & IT LEAD ONLY) -->
    <div v-if="canAccessAllLeads" class="super-admin-filter-bar fadeIn">
      <div class="filter-bar-left">
        <div class="filter-icon-circle">
          <i class="fas fa-filter"></i>
        </div>
        <div class="filter-title-group">
          <span class="filter-subtitle">{{ isOwnership ? 'SUPER ADMIN VIEW FILTER' : 'IT LEAD VIEW FILTER' }}</span>
          <span class="filter-main-title">
            {{ selectedUserFilter ? `Viewing data for ${selectedUserFilter}` : 'Global CRM View (All Sales Persons)' }}
          </span>
        </div>
      </div>

      <div class="filter-bar-right">
        <select v-model="selectedUserFilter" class="sales-person-select" title="Filter by sales person">
          <option value="">All Sales Persons (Entire CRM)</option>
          <option v-for="user in leadCreators" :key="user" :value="user">
            {{ user }}
          </option>
        </select>
        <button v-if="selectedUserFilter" class="filter-reset-btn" @click="selectedUserFilter = ''" title="Reset filter">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- 🛠️ SALES PIPELINE CONTROLS TOOLBAR -->
    <div class="pipeline-controls-toolbar fadeIn">
      <!-- Left: Title & Stage/Deal Counts -->
      <div class="toolbar-left">
        <div class="toolbar-icon-badge">
          <i class="fas fa-sliders-h"></i>
        </div>
        <div class="toolbar-text-group">
          <span class="toolbar-title">
            Sales Pipeline ({{ kanbanColumns.length }} Stages • {{ filteredLeads.length }} Total Deals)
          </span>
          <span class="toolbar-desc">
            {{ canAccessAllLeads ? 'Drag & drop cards across stages or configure custom columns' : 'Drag & drop your deals across pipeline stages' }}
          </span>
        </div>
      </div>

      <!-- Center: Search Pill Input -->
      <div class="toolbar-search-wrap">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search anything: client, phone, email, RFQ, specs, notes, user"
          class="toolbar-search-input"
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''" title="Clear search">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Right: Action Buttons -->
      <div class="toolbar-right">
      
        <button v-if="canAccessAllLeads" class="btn-add-section" @click="openAddSectionModal()" title="Add custom pipeline section">
          <i class="fas fa-plus"></i>
          <span>Add Section</span>
        </button>
      </div>
    </div>

    <!-- ════════ KANBAN PIPELINE BOARD ════════ -->
    <div class="pipeline-board-container">
      <div class="kanban-scroller-outer">
        <!-- Floating Left Arrow -->
        <button
          v-show="canScrollLeft"
          type="button"
          class="floating-pipeline-arrow arrow-left"
          @click="scrollKanban('left')"
          title="Scroll Left"
          aria-label="Scroll pipeline left"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <!-- Kanban Scroller Container -->
        <div class="kanban-scroller" ref="kanbanScroller" @scroll="checkScrollButtons">
          <div class="kanban-board-row">
            <div
              v-for="(col, colIdx) in kanbanColumns"
              :key="col.status"
              class="kanban-column"
              :class="{
                'column-drag-target': dragOverColumn === col.status
              }"
              @dragover.prevent="onDragOver(col.status)"
              @dragleave="onDragLeave(col.status)"
              @drop="onDrop(col.status)"
            >
              <!-- Column Header -->
              <div class="kanban-column-header">
                <!-- Left: Left Arrow + Status Dot + Title + Count Badge -->
                <div class="kanban-col-left">
                  <button
                    type="button"
                    class="column-nav-arrow"
                    :disabled="colIdx === 0"
                    @click.stop="moveColumn(colIdx, -1)"
                    title="Move stage left"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <span class="kanban-dot" :style="{ backgroundColor: col.color || '#3b82f6' }"></span>
                  <span class="kanban-col-title" :title="col.label || col.status">
                    {{ col.label || col.status }}
                  </span>
                  <span class="kanban-count-badge">
                    {{ getLeadsByStatus(col.status, col.label).length }}
                  </span>
                </div>

                <!-- Right: Edit Pencil + Delete Trash + Right Arrow -->
                <div class="kanban-col-right">
                  <button
                    v-if="canAccessAllLeads"
                    type="button"
                    class="column-tool-btn"
                    @click.stop="openEditSectionModal(col, colIdx)"
                    title="Edit stage name & color"
                  >
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button
                    v-if="canAccessAllLeads && kanbanColumns.length > 1"
                    type="button"
                    class="column-tool-btn btn-trash"
                    @click.stop="openDeleteSectionModal(col, colIdx)"
                    title="Delete stage"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                  <button
                    type="button"
                    class="column-nav-arrow"
                    :disabled="colIdx === kanbanColumns.length - 1"
                    @click.stop="moveColumn(colIdx, 1)"
                    title="Move stage right"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <!-- Column Cards Container -->
              <div class="kanban-column-cards">
                <div
                  v-for="lead in getLeadsByStatus(col.status, col.label)"
                  :key="lead.id"
                  class="kanban-card"
                  :class="{ 'is-dragging': draggedLead && draggedLead.id === lead.id }"
                  draggable="true"
                  @dragstart="onDragStart(lead, $event)"
                  @dragend="onDragEnd"
                  @click="openLeadDetails(lead)"
                >
                  <!-- Row 1: Company Name & Three Dots Menu Button -->
                  <div class="card-header-row">
                    <span class="lead-company-name" :title="lead.company_name">
                      {{ lead.company_name }}
                    </span>
                    <div class="card-menu-container" @click.stop>
                      <button
                        type="button"
                        class="card-dots-btn"
                        @click.stop="toggleCardMenu(lead.id, $event)"
                        title="Deal options"
                      >
                        <i class="fas fa-ellipsis-h"></i>
                      </button>

                      <!-- Deal Quick Actions Dropdown -->
                      <div v-if="activeCardMenuLeadId === lead.id" class="card-dropdown-menu fadeIn">
                        <button class="dropdown-opt" @click="activeCardMenuLeadId = null; openLeadDetails(lead)">
                          <i class="far fa-comment-dots"></i>
                          <span>Log Call & Follow-up</span>
                        </button>
                        <button class="dropdown-opt" @click="activeCardMenuLeadId = null; openQuotationModal(lead)">
                          <i class="fas fa-file-invoice-dollar"></i>
                          <span>IT Quotation</span>
                        </button>
                        <button class="dropdown-opt" @click="activeCardMenuLeadId = null; openEditLeadModal(lead)">
                          <i class="fas fa-edit"></i>
                          <span>Edit Details</span>
                        </button>
                        <div class="dropdown-sep"></div>
                        <button class="dropdown-opt opt-delete" @click="activeCardMenuLeadId = null; deleteLead(lead.id)">
                          <i class="far fa-trash-alt"></i>
                          <span>Delete Deal</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Row 2: Source / Service Requirement with Icon -->
                  <div class="card-source-row">
                    <i class="fas fa-cube card-source-icon"></i>
                    <span class="card-source-text" :title="lead.service_required || lead.lead_source || 'Website Inquiry'">
                      {{ lead.service_required || lead.lead_source || 'Website Inquiry' }}
                    </span>
                  </div>

                  <!-- Scheduled Next Follow-up Pill if set -->
                  <div v-if="lead.next_followup_date" class="card-followup-reminder-strip" :class="{ 'overdue': isFollowupDateDue(lead.next_followup_date) }">
                    <i class="fas fa-bell" :class="{ 'fa-shake': isFollowupDateDue(lead.next_followup_date) }"></i>
                    <span>{{ formatFollowupReminderSnippet(lead.next_followup_date) }}</span>
                  </div>

                  <!-- Row 3: Footer with User Avatar + @username and Date -->
                  <div class="card-footer-row">
                    <div class="card-user-info">
                      <img
                        :src="getLeadAvatar(lead)"
                        :alt="lead.created_by_name || 'admin'"
                        class="card-avatar-img"
                        @error="$event.target.style.display='none'"
                      />
                      <span class="card-username-badge">
                        @{{ formatUserHandle(lead.created_by_name || lead.created_by_id) }}
                      </span>
                    </div>

                    <div class="card-date-info">
                      <i class="far fa-calendar-alt"></i>
                      <span>{{ formatShortDate(lead.created_at || lead.date) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Empty Column Drop Placeholder -->
                <div
                  v-if="getLeadsByStatus(col.status, col.label).length === 0"
                  class="kanban-empty-column"
                >
                  <div class="empty-drop-box">
                    <i class="fas fa-inbox empty-box-icon"></i>
                    <span class="empty-box-title">No deals in this stage</span>
                    <span class="empty-box-hint">Drag cards here to advance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Right Arrow -->
        <button
          v-show="canScrollRight"
          type="button"
          class="floating-pipeline-arrow arrow-right"
          @click="scrollKanban('right')"
          title="Scroll Right"
          aria-label="Scroll pipeline right"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
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
        </div>

        <!-- Popup Footer Actions -->
        <div class="system-popup-footer">
          <div class="footer-left-buttons">
            <button class="btn-popup-snooze" @click="snoozeAlert(15)" title="Remind again in 15 minutes">
              <i class="fas fa-bed"></i>
              <span>Snooze (15m)</span>
            </button>
            <button class="btn-popup-open-lead" @click="openLeadFromAlert">
              <i class="fas fa-external-link-alt"></i>
              <span>Open Lead</span>
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

    <!-- ════════ MODAL: TODAY'S REAL-TIME SALES & ACTIVITY REPORT ════════ -->
    <div
      v-if="showDailyReportModal"
      class="crm-modal-backdrop daily-report-backdrop"
      @click.self="showDailyReportModal = false"
    >
      <div class="crm-modal-box daily-report-modal-box">
        <!-- Header -->
        <div class="daily-report-header">
          <div class="report-header-left">
            <div class="report-icon-badge">
              <i class="fas fa-chart-line"></i>
            </div>
            <div>
              <div class="report-title-row">
                <h3>Today's Real-Time Sales & Activity Report</h3>
                <span class="report-live-pulse-pill">
                  <span class="live-dot"></span> REAL-TIME TRACKING
                </span>
              </div>
              <p class="report-meta-desc">
                <span><i class="far fa-calendar-alt"></i> {{ todayFormattedHeader }}</span>
                <span class="report-meta-sep">•</span>
                <span><i class="far fa-clock"></i> Synced at {{ reportLastRefreshed || 'Just now' }}</span>
              </p>
            </div>
          </div>

          <div class="report-header-actions">
            <div class="report-user-filter-box" v-if="canAccessAllLeads">
              <i class="fas fa-filter text-muted"></i>
              <select v-model="reportUserFilter" class="report-select-filter">
                <option value="">All Sales Executives</option>
                <option v-for="user in leadCreators" :key="user" :value="user">{{ user }}</option>
              </select>
            </div>
            <button
              class="btn-report-refresh"
              @click="refreshDailyReportData"
              :disabled="isReportLoading"
              title="Refresh real-time data from database"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isReportLoading }"></i>
              <span>{{ isReportLoading ? 'Refreshing...' : 'Refresh' }}</span>
            </button>
            <button class="modal-x-btn" @click="showDailyReportModal = false" title="Close report">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- 4 Core Performance KPI Cards -->
        <div class="report-kpi-grid">
          <!-- KPI 1: New Leads -->
          <div
            class="report-kpi-card card-leads"
            :class="{ active: reportActiveTab === 'leads' }"
            @click="reportActiveTab = 'leads'"
          >
            <div class="kpi-top">
              <span class="kpi-label">TODAY'S NEW LEADS</span>
              <div class="kpi-icon-wrap leads-bg"><i class="fas fa-bullseye"></i></div>
            </div>
            <div class="kpi-val">{{ todaysNewLeads.length }}</div>
            <div class="kpi-sub">
              <span>₹{{ formatCurrency(todaysNewLeadsValue) }}</span>
              <span class="kpi-tag-pill blue">Pipeline Added</span>
            </div>
          </div>

          <!-- KPI 2: Follow-Up Calls -->
          <div
            class="report-kpi-card card-followups"
            :class="{ active: reportActiveTab === 'followups' }"
            @click="reportActiveTab = 'followups'"
          >
            <div class="kpi-top">
              <span class="kpi-label">FOLLOW-UP CALLS</span>
              <div class="kpi-icon-wrap followups-bg"><i class="fas fa-phone-volume"></i></div>
            </div>
            <div class="kpi-val">{{ todaysFollowups.length }}</div>
            <div class="kpi-sub">
              <span>{{ todaysFollowupCallsCount }} calls / discussions</span>
              <span class="kpi-tag-pill purple">Touchpoints</span>
            </div>
          </div>

          <!-- KPI 3: Quotations Sent -->
          <div
            class="report-kpi-card card-quotes"
            :class="{ active: reportActiveTab === 'quotations' }"
            @click="reportActiveTab = 'quotations'"
          >
            <div class="kpi-top">
              <span class="kpi-label">QUOTATIONS SENT</span>
              <div class="kpi-icon-wrap quotes-bg"><i class="fas fa-file-invoice-dollar"></i></div>
            </div>
            <div class="kpi-val">{{ todaysQuotations.length }}</div>
            <div class="kpi-sub">
              <span>₹{{ formatCurrency(todaysQuotationsValue) }}</span>
              <span class="kpi-tag-pill amber">Quoted Total</span>
            </div>
          </div>

          <!-- KPI 4: PO Confirmed (Same Day) -->
          <div
            class="report-kpi-card card-po"
            :class="{ active: reportActiveTab === 'po' }"
            @click="reportActiveTab = 'po'"
          >
            <div class="kpi-top">
              <span class="kpi-label">PO CONFIRMED</span>
              <div class="kpi-icon-wrap po-bg"><i class="fas fa-trophy"></i></div>
            </div>
            <div class="kpi-val">{{ todaysPoConfirmed.length }}</div>
            <div class="kpi-sub">
              <span>₹{{ formatCurrency(todaysPoConfirmedValue) }}</span>
              <span class="kpi-tag-pill emerald">
                <i class="fas fa-bolt"></i> {{ todaysSameDayPoCount }} Same-Day
              </span>
            </div>
          </div>
        </div>

        <!-- Same-day Conversion Highlight Banner (if any deals closed same day) -->
        <div v-if="todaysSameDayPoCount > 0" class="same-day-celebration-strip">
          <div class="same-day-strip-left">
            <div class="lightning-circle"><i class="fas fa-bolt"></i></div>
            <div>
              <strong>Same-Day Conversion Highlight:</strong>
              <span>
                {{ todaysSameDayPoCount }} deal{{ todaysSameDayPoCount > 1 ? 's' : '' }} created and confirmed as Purchase Order today totaling <strong>₹{{ formatCurrency(todaysSameDayPoValue) }}</strong>!
              </span>
            </div>
          </div>
          <span class="lightning-pill">Lightning Turnaround</span>
        </div>

        <!-- Navigation Tabs for Detailed Activity Drilldown -->
        <div class="report-nav-tabs">
          <button
            type="button"
            class="report-nav-btn"
            :class="{ active: reportActiveTab === 'overview' }"
            @click="reportActiveTab = 'overview'"
          >
            <i class="fas fa-stream"></i>
            <span>All Today's Activity ({{ todaysLiveFeed.length }})</span>
          </button>
          <button
            type="button"
            class="report-nav-btn"
            :class="{ active: reportActiveTab === 'leads' }"
            @click="reportActiveTab = 'leads'"
          >
            <i class="fas fa-bullseye text-blue"></i>
            <span>New Leads ({{ todaysNewLeads.length }})</span>
          </button>
          <button
            type="button"
            class="report-nav-btn"
            :class="{ active: reportActiveTab === 'followups' }"
            @click="reportActiveTab = 'followups'"
          >
            <i class="fas fa-phone-volume text-purple"></i>
            <span>Follow-Ups ({{ todaysFollowups.length }})</span>
          </button>
          <button
            type="button"
            class="report-nav-btn"
            :class="{ active: reportActiveTab === 'quotations' }"
            @click="reportActiveTab = 'quotations'"
          >
            <i class="fas fa-file-invoice-dollar text-amber"></i>
            <span>Quotations ({{ todaysQuotations.length }})</span>
          </button>
          <button
            type="button"
            class="report-nav-btn"
            :class="{ active: reportActiveTab === 'po' }"
            @click="reportActiveTab = 'po'"
          >
            <i class="fas fa-trophy text-emerald"></i>
            <span>PO Confirmed ({{ todaysPoConfirmed.length }})</span>
          </button>
        </div>

        <!-- TAB BODY CONTENT -->
        <div class="report-body-container">
          <!-- 1. OVERVIEW: Live Feed of Today's Activities -->
          <div v-if="reportActiveTab === 'overview'" class="report-feed-tab">
            <div v-if="todaysLiveFeed.length === 0" class="report-empty-state">
              <i class="fas fa-clipboard-list empty-icon"></i>
              <h4>No Activity Recorded Yet Today</h4>
              <p>Create a new lead, log a follow-up discussion, or confirm a quotation to track performance in real time.</p>
            </div>
            <div v-else class="report-timeline-stream">
              <div v-for="item in todaysLiveFeed" :key="item.id" class="feed-event-item">
                <div class="feed-icon-wrap" :style="{ background: item.color + '15', color: item.color, borderColor: item.color + '35' }">
                  <i :class="item.icon"></i>
                </div>
                <div class="feed-content">
                  <div class="feed-top-line">
                    <span class="feed-title">{{ item.title }}</span>
                    <span class="feed-time"><i class="far fa-clock"></i> {{ formatDateTime(item.time) }}</span>
                  </div>
                  <p class="feed-desc">{{ item.desc }}</p>
                  <div class="feed-meta-line">
                    <span class="feed-actor"><i class="fas fa-user-circle"></i> {{ item.actor }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. TAB: New Leads Today -->
          <div v-else-if="reportActiveTab === 'leads'" class="report-subtab-view">
            <div v-if="todaysNewLeads.length === 0" class="report-empty-state">
              <i class="fas fa-bullseye empty-icon"></i>
              <h4>No New Leads Added Today</h4>
              <p>Click "New Lead" button above to register an IT sales opportunity.</p>
            </div>
            <div v-else class="report-table-wrap">
              <table class="report-data-table">
                <thead>
                  <tr>
                    <th>Company / Client</th>
                    <th>Contact Person</th>
                    <th>Service Required</th>
                    <th>Deal Value (₹)</th>
                    <th>Stage</th>
                    <th>Sales Owner</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="lead in todaysNewLeads" :key="lead.id">
                    <td>
                      <div class="table-company-cell">
                        <span class="company-name-bold">{{ lead.company_name }}</span>
                        <span class="company-notes-sub" v-if="lead.phone || lead.email">{{ lead.phone || lead.email }}</span>
                      </div>
                    </td>
                    <td>{{ lead.contact_person || '-' }}</td>
                    <td><span class="service-pill-tag">{{ lead.service_required || 'IT Solution' }}</span></td>
                    <td><strong class="text-emerald">₹{{ formatCurrency(lead.deal_value || 0) }}</strong></td>
                    <td><span class="status-badge-compact">{{ lead.status || 'New' }}</span></td>
                    <td>{{ lead.created_by_name || '-' }}</td>
                    <td class="text-muted">{{ formatDateTime(lead.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. TAB: Follow-Up Calls Today -->
          <div v-else-if="reportActiveTab === 'followups'" class="report-subtab-view">
            <div v-if="todaysFollowups.length === 0" class="report-empty-state">
              <i class="fas fa-phone-volume empty-icon"></i>
              <h4>No Follow-Up Calls Logged Today</h4>
              <p>Open any lead to record client phone discussions, outcomes, and next action items.</p>
            </div>
            <div v-else class="report-table-wrap">
              <table class="report-data-table">
                <thead>
                  <tr>
                    <th>Client / Lead</th>
                    <th>Call Type</th>
                    <th>Discussion Remarks / Action Items</th>
                    <th>Logged Stage</th>
                    <th>Executive</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in todaysFollowups" :key="f.id || f.lead_id + f.date">
                    <td>
                      <div class="table-company-cell">
                        <span class="company-name-bold">{{ f.company_name }}</span>
                        <span class="company-notes-sub">{{ f.contact_person }}</span>
                      </div>
                    </td>
                    <td><span class="call-type-badge">{{ f.call_type || 'Phone Call' }}</span></td>
                    <td>
                      <p class="table-remarks-text">{{ f.note || '-' }}</p>
                    </td>
                    <td><span class="status-badge-compact">{{ f.status || f.lead_status }}</span></td>
                    <td>{{ f.logged_by || '-' }}</td>
                    <td class="text-muted">{{ formatDateTime(f.date || f.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 4. TAB: Quotations Sent Today -->
          <div v-else-if="reportActiveTab === 'quotations'" class="report-subtab-view">
            <div v-if="todaysQuotations.length === 0" class="report-empty-state">
              <i class="fas fa-file-invoice-dollar empty-icon"></i>
              <h4>No Quotations Sent Today</h4>
              <p>Generate quotations from the Quotation workspace to record commercial proposals sent today.</p>
            </div>
            <div v-else class="report-table-wrap">
              <table class="report-data-table">
                <thead>
                  <tr>
                    <th>Quote Ref #</th>
                    <th>Company / Client</th>
                    <th>Contact Person</th>
                    <th>Quoted Value (₹)</th>
                    <th>Status</th>
                    <th>Generated By</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="q in todaysQuotations" :key="q.id">
                    <td><strong>{{ q.quote_no }}</strong></td>
                    <td>{{ q.company_name }}</td>
                    <td>{{ q.contact_person || '-' }}</td>
                    <td><strong class="text-emerald">₹{{ formatCurrency(q.grand_total || 0) }}</strong></td>
                    <td><span class="status-badge-compact quote">{{ q.status }}</span></td>
                    <td>{{ q.created_by }}</td>
                    <td class="text-muted">{{ formatDateTime(q.date || q.time) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 5. TAB: PO Confirmed (Same Day) -->
          <div v-else-if="reportActiveTab === 'po'" class="report-subtab-view">
            <div v-if="todaysPoConfirmed.length === 0" class="report-empty-state">
              <i class="fas fa-trophy empty-icon"></i>
              <h4>No PO Confirmed Deals Today Yet</h4>
              <p>When leads agree to the quotation and issue purchase orders, update status to "PO Confirmed".</p>
            </div>
            <div v-else class="report-table-wrap">
              <table class="report-data-table">
                <thead>
                  <tr>
                    <th>Company / Organization</th>
                    <th>Contact Person</th>
                    <th>Confirmed Value (₹)</th>
                    <th>Same-Day Conversion?</th>
                    <th>Service Required</th>
                    <th>Executive</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in todaysPoConfirmed" :key="p.id">
                    <td>
                      <div class="table-company-cell">
                        <span class="company-name-bold">{{ p.company_name }}</span>
                        <span class="company-notes-sub">{{ p.phone || p.email }}</span>
                      </div>
                    </td>
                    <td>{{ p.contact_person || '-' }}</td>
                    <td><strong class="text-emerald font-lg">₹{{ formatCurrency(p.deal_value || 0) }}</strong></td>
                    <td>
                      <span v-if="p.isSameDayConversion" class="same-day-pill">
                        <i class="fas fa-bolt"></i> Same-Day Turnaround!
                      </span>
                      <span v-else class="standard-turnaround-pill">
                        Standard Cycle
                      </span>
                    </td>
                    <td><span class="service-pill-tag">{{ p.service_required }}</span></td>
                    <td>{{ p.created_by_name || '-' }}</td>
                    <td class="text-muted">{{ formatDateTime(p.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="daily-report-footer">
          <div class="report-footer-summary">
            <span>Summary: <strong>{{ todaysNewLeads.length }}</strong> Leads • <strong>{{ todaysFollowups.length }}</strong> Follow-ups • <strong>{{ todaysQuotations.length }}</strong> Quotes • <strong>{{ todaysPoConfirmed.length }}</strong> POs</span>
          </div>
          <div class="report-footer-actions">
            <button class="btn-subtle" @click="refreshDailyReportData" :disabled="isReportLoading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isReportLoading }"></i>
              <span>Refresh Now</span>
            </button>
            <button class="btn-report-close" @click="showDailyReportModal = false">
              <i class="fas fa-check"></i>
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════ MODAL: CREATE / EDIT LEAD & BULK EXCEL IMPORT ════════ -->
    <div v-if="showLeadModal" class="crm-modal-backdrop lead-form-modal-backdrop" @click.self="showLeadModal = false">
      <div class="crm-modal-box" :class="{ 'modal-wide': modalActiveTab === 'bulk' }">
        <div class="crm-modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-badge">
              <i :class="isEditing ? 'fas fa-pen' : (modalActiveTab === 'bulk' ? 'fas fa-file-excel text-emerald' : 'fas fa-plus')"></i>
            </div>
            <div>
              <h3>{{ isEditing ? 'Edit Lead Details' : (modalActiveTab === 'bulk' ? 'Bulk Import Leads from Excel' : 'Create New IT Sales Lead') }}</h3>
              <p class="modal-desc">{{ isEditing ? 'Update opportunity fields and scope parameters.' : (modalActiveTab === 'bulk' ? 'Upload an Excel or CSV file to import multiple enterprise leads at once.' : 'Fill in client requirements and pipeline deal parameters.') }}</p>
            </div>
          </div>
          <button class="modal-x-btn" @click="showLeadModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Mode Tabs: Single Lead vs Bulk Excel Import -->
        <div class="modal-tab-bar" v-if="!isEditing">
          <button
            type="button"
            class="modal-tab-btn"
            :class="{ active: modalActiveTab === 'single' }"
            @click="modalActiveTab = 'single'"
          >
            <i class="fas fa-user-plus"></i>
            <span>Single Lead Form</span>
          </button>
          <button
            type="button"
            class="modal-tab-btn"
            :class="{ active: modalActiveTab === 'bulk' }"
            @click="modalActiveTab = 'bulk'"
          >
            <i class="fas fa-file-excel text-emerald"></i>
            <span>Bulk Import from Excel</span>
          </button>
        </div>

        <!-- TAB 1: SINGLE LEAD FORM -->
        <form v-if="modalActiveTab === 'single'" @submit.prevent="saveLead" class="crm-modal-form" novalidate>
          <div class="form-grid-2">
            <div class="input-block">
              <label><i class="fas fa-building text-blue-muted"></i> Company / Organization <span class="required">*</span></label>
              <input
                type="text"
                v-model="leadForm.company_name"
                required
                placeholder="e.g. Apex Global Technologies"
                class="crm-input"
              />
            </div>
            <div class="input-block">
              <label><i class="fas fa-user-tie text-blue-muted"></i> Contact Person <span class="required">*</span></label>
              <input
                type="text"
                v-model="leadForm.contact_person"
                required
                placeholder="e.g. Rahul Sharma (CTO)"
                class="crm-input"
              />
            </div>
          </div>

          <div class="form-grid-2">
            <!-- Mobile / Phone input with dynamic Country Code API selector & length enforcement -->
            <div class="input-block">
              <div class="label-with-rule">
                <label><i class="fas fa-phone-alt text-blue-muted"></i> Mobile / Phone Number</label>
                <span class="country-rule-tag" v-if="currentCountry">
                  {{ currentCountry.flag }} {{ currentCountryRuleText }}
                </span>
              </div>
              <div
                class="phone-combo-input"
                :class="{
                  'has-error': phoneTouched && !phoneValidation.isValid,
                  'has-success': phoneTouched && leadFormPhoneRaw && phoneValidation.isValid
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
                  v-model="leadFormPhoneRaw"
                  :placeholder="currentCountry ? currentCountry.example || 'Mobile number' : '98765 43210'"
                  :maxlength="currentCountry ? currentCountry.max + 2 : 15"
                  class="phone-national-input"
                  @input="onPhoneInput"
                  @blur="phoneTouched = true"
                />
                <div v-if="leadFormPhoneRaw" class="validation-status-icon">
                  <i v-if="phoneValidation.isValid" class="fas fa-check-circle text-emerald" title="Valid mobile number"></i>
                  <i v-else class="fas fa-exclamation-circle text-rose" :title="phoneValidation.message"></i>
                </div>
              </div>
              <div class="field-feedback-box">
                <span v-if="phoneTouched && !phoneValidation.isValid" class="field-msg error">
                  <i class="fas fa-exclamation-circle"></i> {{ phoneValidation.message }}
                </span>
                <span v-else-if="leadFormPhoneRaw && phoneValidation.isValid" class="field-msg success">
                  <i class="fas fa-check-circle"></i> {{ phoneValidation.message }}
                </span>
              </div>
            </div>

            <!-- Email Address with real-time format validation -->
            <div class="input-block">
              <label><i class="fas fa-envelope text-blue-muted"></i> Email Address</label>
              <div
                class="input-with-icon-wrap"
                :class="{
                  'has-error': emailTouched && !emailValidation.isValid,
                  'has-success': emailTouched && leadForm.email && emailValidation.isValid
                }"
              >
                <input
                  type="email"
                  v-model="leadForm.email"
                  placeholder="e.g. rahul@apextech.com"
                  class="crm-input email-field-input"
                  @input="onEmailInput"
                  @blur="emailTouched = true"
                />
                <div v-if="leadForm.email" class="validation-status-icon">
                  <i v-if="emailValidation.isValid" class="fas fa-check-circle text-emerald" title="Valid email address"></i>
                  <i v-else class="fas fa-exclamation-circle text-rose" :title="emailValidation.message"></i>
                </div>
              </div>
              <div class="field-feedback-box">
                <span v-if="emailTouched && !emailValidation.isValid" class="field-msg error">
                  <i class="fas fa-exclamation-circle"></i> {{ emailValidation.message }}
                </span>
                <span v-else-if="leadForm.email && emailValidation.isValid" class="field-msg success">
                  <i class="fas fa-check-circle"></i> Valid email address
                </span>
              </div>
            </div>
          </div>

          <div class="input-block">
            <label><i class="fas fa-laptop-code text-blue-muted"></i> Service Required <span class="required">*</span></label>
            <div class="select-wrap-custom">
              <select v-model="leadForm.service_required" required class="crm-select">
                <option value="" disabled>Select IT Service</option>
                <option value="Enterprise ERP / CRM">Enterprise ERP / CRM</option>
                <option value="Custom Web App Development">Custom Web App Development</option>
                <option value="Mobile App (iOS & Android)">Mobile App (iOS & Android)</option>
                <option value="Cloud Migration & DevOps">Cloud Migration & DevOps</option>
                <option value="AI / Automation Solution">AI / Automation Solution</option>
                <option value="Annual IT Support (AMC)">Annual IT Support (AMC)</option>
                <option value="Gym Management System">Gym Management System</option>
                <option value="School Management System">School Management System</option>
                <option value="Lead Management System">Lead Management System</option>
                <option value="Inventory Management System">Inventory Management System</option>
                <option value="Other">Other</option>
              </select>
              <i class="fas fa-chevron-down select-caret"></i>
            </div>
          </div>

          <!-- Custom service input when 'Other' is selected -->
          <div class="input-block" v-if="leadForm.service_required === 'Other'">
            <label><i class="fas fa-cube text-blue-muted"></i> Specify Custom Service <span class="required">*</span></label>
            <input
              type="text"
              v-model="leadForm.other_service"
              required
              placeholder="e.g. Blockchain Development, IoT Solutions, Data Analytics..."
              class="crm-input"
            />
          </div>

          <div class="form-grid-2">
            <div class="input-block">
              <label><i class="fas fa-rupee-sign text-blue-muted"></i> Estimated Deal Value (₹)</label>
              <div class="currency-input-wrap">
                <span class="currency-symbol">₹</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  v-model="leadForm.deal_value"
                  placeholder="350000"
                  class="crm-input currency-input"
                />
              </div>
            </div>
            <div class="input-block">
              <label><i class="fas fa-columns text-blue-muted"></i> Pipeline Stage</label>
              <div class="select-wrap-custom">
                <select v-model="leadForm.status" class="crm-select">
                  <option v-for="st in statusOptions" :key="st" :value="st">{{ st }}</option>
                </select>
                <i class="fas fa-chevron-down select-caret"></i>
              </div>
            </div>
          </div>

          <div class="input-block">
            <label><i class="fas fa-file-alt text-blue-muted"></i> Initial Scope & Notes</label>
            <textarea
              v-model="leadForm.notes"
              rows="3"
              placeholder="Key project scope, timeline, requirements discussed..."
              class="crm-textarea"
            ></textarea>
          </div>

          <div class="crm-modal-footer">
            <button type="button" class="btn-modal-cancel" @click="showLeadModal = false">
              <i class="fas fa-times"></i>
              <span>Cancel</span>
            </button>
            <button type="submit" class="btn-crm-primary" :disabled="isSaving">
              <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : (isEditing ? 'fa-save' : 'fa-check')"></i>
              <span>{{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Lead') }}</span>
            </button>
          </div>
        </form>

        <!-- TAB 2: BULK IMPORT FROM EXCEL -->
        <div v-else-if="modalActiveTab === 'bulk'" class="bulk-excel-container">
          <!-- Step 1: Download Demo Template -->
          <div class="bulk-template-card">
            <div class="template-card-text">
              <div class="template-badge"><i class="fas fa-file-excel"></i> Sample File Available</div>
              <h4>Download Demo Excel File</h4>
              <p>Download our ready-to-use template with pre-filled sample rows and proper column headers.</p>
            </div>
            <button type="button" class="btn-download-demo" @click="downloadDemoExcel">
              <i class="fas fa-download"></i>
              <span>Download Demo Excel (.xlsx)</span>
            </button>
          </div>

          <!-- Step 2: Upload Dropzone -->
          <div
            class="excel-dropzone"
            :class="{ 'dropzone-active': bulkFileName }"
            @click="$refs.excelFileInput.click()"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <input
              type="file"
              ref="excelFileInput"
              accept=".xlsx, .xls, .csv"
              class="hidden-file-input"
              @change="handleExcelUpload"
            />
            <div class="dropzone-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <div class="dropzone-content">
              <h4>{{ bulkFileName ? bulkFileName : 'Click to Browse or Drag & Drop Excel File' }}</h4>
              <p>Accepts <strong>.xlsx, .xls, .csv</strong> files. Columns: Company Name, Contact Person, Phone, Email, Service, Deal Value, Stage, Notes.</p>
            </div>
            <span class="btn-browse-file">Browse File</span>
          </div>

          <!-- Step 3: Preview Table -->
          <div v-if="bulkPreviewLeads.length > 0" class="bulk-preview-section">
            <div class="preview-header">
              <span class="preview-badge">
                <i class="fas fa-check-circle"></i> {{ bulkPreviewLeads.length }} Leads Ready to Import
              </span>
              <button type="button" class="btn-clear-preview" @click="cancelBulkImport">
                <i class="fas fa-times"></i> Clear & Re-upload
              </button>
            </div>

            <div class="preview-table-scroll">
              <table class="bulk-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Service</th>
                    <th>Deal Value</th>
                    <th>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(lead, idx) in bulkPreviewLeads" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td><strong>{{ lead.company_name }}</strong></td>
                    <td>{{ lead.contact_person }}</td>
                    <td>{{ lead.phone || '-' }}</td>
                    <td><span class="pill-service">{{ lead.service_required }}</span></td>
                    <td class="text-emerald"><strong>{{ formatCurrency(lead.deal_value) }}</strong></td>
                    <td><span class="pill-stage">{{ lead.status }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="bulk-modal-footer">
              <button type="button" class="btn-flat" @click="showLeadModal = false">Cancel</button>
              <button type="button" class="btn-confirm-import" @click="confirmBulkImport" :disabled="isImportingBulk">
                <i class="fas" :class="isImportingBulk ? 'fa-spinner fa-spin' : 'fa-upload'"></i>
                <span>{{ isImportingBulk ? 'Importing to Database...' : `Import ${bulkPreviewLeads.length} Leads into Pipeline` }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════ DRAWER / FULLSCREEN MODAL: LEAD 360 WORKSPACE ════════ -->
    <div v-if="activeFollowupLead" class="crm-modal-backdrop lead-fullscreen-backdrop" @click.self="activeFollowupLead = null">
      <div class="crm-modal-box lead-workspace-fullscreen">
        <!-- ─── Modern Executive Top Header ─── -->
        <div class="lead-workspace-header">
          <div class="modal-title-group">
            <div class="company-logo-avatar gradient-avatar">
              {{ (activeFollowupLead.company_name || 'C').charAt(0).toUpperCase() }}
            </div>
            <div class="header-details">
              <div class="header-company-row">
                <h3 class="company-title">{{ activeFollowupLead.company_name }}</h3>
                <span class="status-pill-badge" :class="'status-' + activeFollowupLead.status.toLowerCase().replace(/[\s_-]+/g, '')">
                  {{ activeFollowupLead.status }}
                </span>
                <span class="header-service-badge" title="Service Required">
                  <i class="fas fa-laptop-code"></i>
                  <span>Service Required: <strong>{{ activeFollowupLead.service_required || 'IT Solution' }}</strong></span>
                </span>
              </div>
              <div class="contact-pill-list">
                <span class="contact-chip person" title="Primary Contact">
                  <i class="fas fa-user-tie"></i>
                  <strong>{{ activeFollowupLead.contact_person }}</strong>
                </span>
                <a
                  v-if="activeFollowupLead.phone"
                  :href="'tel:' + activeFollowupLead.phone"
                  class="contact-chip link phone"
                  title="Click to Call"
                >
                  <i class="fas fa-phone-alt"></i>
                  <span>{{ activeFollowupLead.phone }}</span>
                </a>
                <a
                  v-if="activeFollowupLead.email"
                  :href="'mailto:' + activeFollowupLead.email"
                  class="contact-chip link email"
                  title="Click to Email"
                >
                  <i class="fas fa-envelope"></i>
                  <span>{{ activeFollowupLead.email }}</span>
                </a>
              </div>
            </div>
          </div>
          <div class="modal-header-actions">
            <button class="btn-danger-subtle-hdr" @click="deleteLead(activeFollowupLead.id)" title="Delete Lead">
              <i class="fas fa-trash-alt"></i>
              <span>Delete Lead</span>
            </button>
            <button class="btn-modern-action btn-quotation-hdr" @click="openQuotationTab(activeFollowupLead)" title="Open Create & View Quotations in New Tab">
              <i class="fas fa-file-invoice-dollar text-emerald"></i>
              <span>Quotation</span>
              <i class="fas fa-external-link-alt tab-open-icon"></i>
            </button>
            <button class="btn-modern-action" @click="openEditLeadModal(activeFollowupLead)" title="Edit Lead Details">
              <i class="fas fa-pen"></i>
              <span>Edit Lead</span>
            </button>
            <button class="modal-close-icon-btn" @click="activeFollowupLead = null" title="Close Workspace">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- ─── Full-Page Split Body: Left Side (Overview + Composer) | Right Side (Timeline) ─── -->
        <div class="lead-workspace-body">
          <!-- ◀ LEFT SIDE: Deal Overview, Intelligence & Interaction Composer -->
          <div class="lead-workspace-left">
            <!-- 1. Quick Deal Overview (Service Required, Stage & Estimated Deal Value) -->
            <div class="workspace-card deal-quick-card">
              <div class="deal-service-top-strip">
                <span class="deal-service-label">
                  <i class="fas fa-laptop-code"></i>
                  <span>Service Required:</span>
                </span>
                <strong class="deal-service-value">{{ activeFollowupLead.service_required || 'IT Solution' }}</strong>
              </div>
              <div class="metrics-grid-2">
                <!-- Pipeline Stage -->
                <div class="metric-box">
                  <div class="metric-label">Pipeline Stage</div>
                  <div class="stage-select-wrapper">
                    <span class="stage-pulse-dot" :class="'dot-' + activeFollowupLead.status.toLowerCase().replace(/[\s_-]+/g, '')"></span>
                    <select
                      class="modern-stage-select"
                      :value="activeFollowupLead.status"
                      @change="updateLeadStatus(activeFollowupLead.id, $event.target.value)"
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
                    {{ formatCurrency(activeFollowupLead.deal_value) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Log Follow-up Discussion Form -->
            <div class="workspace-card composer-card">
              <div class="workspace-card-header">
                <div class="card-title-wrap">
                  <div class="composer-icon-badge">
                    <i class="fas fa-phone-volume"></i>
                  </div>
                  <div>
                    <h4 class="composer-title">Log Follow-up Discussion</h4>
                    <p class="composer-subtitle">Record calls, client responses, technical feedback, or scheduled dates.</p>
                  </div>
                </div>
                <div class="active-rep-pill">
                  <i class="fas fa-user-circle"></i>
                  <span>Rep: <strong>{{ currentUserName }}</strong></span>
                </div>
              </div>

              <form @submit.prevent="submitFollowupNote" class="composer-form">
                <div class="composer-grid-2">
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
                </div>

                <div class="composer-field">
                  <label class="composer-label">Date & Time</label>
                  <input
                    type="datetime-local"
                    v-model="newFollowup.date"
                    required
                    class="composer-input"
                  />
                </div>

                <div class="composer-field">
                  <label class="composer-label">Discussion Remarks / Action Items <span class="required">*</span></label>
                  <textarea
                    v-model="newFollowup.note"
                    rows="3"
                    required
                    placeholder="e.g. Discussed pricing tiers; client requested customized proposal for 25 licenses with cloud setup. Follow-up demo set for Tuesday..."
                    class="composer-textarea"
                  ></textarea>
                </div>

                <div class="composer-submit-row">
                  <button type="submit" class="btn-save-note" :disabled="isSubmittingFollowup">
                    <i class="fas" :class="isSubmittingFollowup ? 'fa-spinner fa-spin' : 'fa-check-circle'"></i>
                    <span>{{ isSubmittingFollowup ? 'Saving to Database...' : 'Save Discussion Log' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- ▶ RIGHT SIDE: Comprehensive Activity & Discussion Timeline -->
          <div class="lead-workspace-right">
            <!-- Timeline Header & Filter Controls -->
            <div class="right-pane-header">
              <div class="timeline-heading-group">
                <div class="timeline-icon-box">
                  <i class="fas fa-history"></i>
                </div>
                <div>
                  <h4 class="timeline-heading">Activity & Discussion Timeline</h4>
                  <p class="timeline-subheading">Chronological record of calls, stage transitions, and client touchpoints.</p>
                </div>
                <span class="total-activity-pill">{{ (activeFollowupLead.followups || []).length }} Total</span>
              </div>

              <!-- Filter tabs -->
              <div class="timeline-tab-filters" v-if="(activeFollowupLead.followups || []).length > 0">
                <button
                  type="button"
                  class="timeline-filter-btn"
                  :class="{ active: timelineFilter === 'all' }"
                  @click="timelineFilter = 'all'"
                >
                  All ({{ (activeFollowupLead.followups || []).length }})
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

            <!-- Scrollable Timeline Stream -->
            <div class="right-pane-stream-scroll">
              <div v-if="filteredFollowups.length > 0" class="timeline-stream modern-stream">
                <div
                  v-for="(log, idx) in filteredFollowups"
                  :key="log.id || idx"
                  class="timeline-item-row"
                  :class="{ 'is-pipeline-update': log.call_type === 'Pipeline Update' }"
                >
                  <!-- Compact one-line style for automated pipeline moves -->
                  <div v-if="log.call_type === 'Pipeline Update'" class="pipeline-compact-row">
                    <div class="compact-icon-bullet">
                      <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="compact-body">
                      <span class="compact-text">
                        <strong>{{ log.logged_by }}</strong> {{ log.note }}
                      </span>
                      <span class="compact-stage-tag">{{ log.status }}</span>
                      <span class="compact-time">{{ formatDateTime(log.date) }}</span>
                    </div>
                    <button class="btn-compact-delete" @click="deleteFollowupNote(log)" title="Remove record">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <!-- Rich detailed card for actual notes and discussions -->
                  <div v-else class="timeline-entry-rich">
                    <div class="timeline-node" :class="getTimelineBulletClass(log.call_type)">
                      <i :class="getTimelineIcon(log.call_type)"></i>
                    </div>
                    <div class="timeline-card-surface">
                      <div class="entry-card-header">
                        <div class="entry-meta-left">
                          <strong class="entry-author">{{ log.logged_by }}</strong>
                          <span class="entry-channel-badge">
                            <i :class="getTimelineIcon(log.call_type)"></i> {{ log.call_type || 'Note' }}
                          </span>
                          <span class="entry-outcome-badge" :class="getOutcomeBadgeClass(log.status)">
                            {{ log.status || 'Recorded' }}
                          </span>
                        </div>
                        <div class="entry-meta-right">
                          <span class="entry-timestamp">
                            <i class="far fa-clock"></i> {{ formatDateTime(log.date) }}
                          </span>
                          <button class="btn-delete-entry" @click="deleteFollowupNote(log)" title="Delete note">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                      <p class="entry-note-content">{{ log.note }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty state message -->
              <div v-else class="empty-timeline-card">
                <div class="empty-icon-circle">
                  <i class="far fa-comments"></i>
                </div>
                <h5>No Activity Records Found</h5>
                <p>No logged discussions match the selected filter. Log a note on the left panel to record your conversation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🎊 WON CELEBRATION MODAL BANNER -->
    <transition name="celebrate-pop">
      <div v-if="showCelebrationBanner" class="celebration-overlay" @click="showCelebrationBanner = false">
        <div class="celebration-card" @click.stop>
          <div class="celebration-glow"></div>
          <button class="celebration-close-btn" @click="showCelebrationBanner = false" title="Close">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="celebration-trophy-wrap">
            <div class="trophy-pulse-ring ring-1"></div>
            <div class="trophy-pulse-ring ring-2"></div>
            <div class="trophy-icon-box">
              <i class="fas fa-trophy"></i>
            </div>
          </div>

          <div class="celebration-content">
            <span class="celebration-badge">DEAL CLOSED WON!</span>
            <h2 class="celebration-company">{{ celebrationLead?.company_name || 'Opportunity' }}</h2>
            <p class="celebration-subtitle">
              Congratulations! This opportunity has been successfully won and secured in the pipeline.
            </p>

            <div class="celebration-metrics-row">
              <div class="celebration-metric-item" v-if="celebrationLead?.deal_value">
                <span class="metric-lbl">Deal Value</span>
                <span class="metric-val text-emerald">{{ formatCurrency(celebrationLead.deal_value) }}</span>
              </div>
              <div class="celebration-metric-item" v-if="celebrationLead?.service_required">
                <span class="metric-lbl">Service</span>
                <span class="metric-val">{{ celebrationLead.service_required }}</span>
              </div>
              <div class="celebration-metric-item" v-if="celebrationLead?.contact_person">
                <span class="metric-lbl">Client Contact</span>
                <span class="metric-val">{{ celebrationLead.contact_person }}</span>
              </div>
            </div>

            <div class="celebration-footer">
              <button class="btn-celebration-continue" @click="showCelebrationBanner = false">
                <i class="fas fa-check"></i> Keep Crushing It
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ════════ CLIENT QUOTATION WORKSPACE MODAL ════════ -->
    <div v-if="showQuotationModal" class="crm-modal-overlay" @click.self="showQuotationModal = false">
      <div class="modal-card modal-quotation-card">
        
        <!-- Header -->
        <div class="modal-card-header quotation-modal-hdr">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge quote-badge">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div>
              <h3>Client Quotations: {{ quotationLead?.company_name }}</h3>
              <p class="modal-desc">
                Contact: <strong>{{ quotationLead?.contact_person }}</strong> &bull;
                Phone: <strong>{{ quotationLead?.phone || 'N/A' }}</strong> &bull;
                Email: <strong>{{ quotationLead?.email || 'N/A' }}</strong>
              </p>
            </div>
          </div>
          <div class="hdr-actions-group">
            <button class="btn-open-tab-pill" @click="openQuotationTab(quotationLead)" title="Open in dedicated browser tab">
              <i class="fas fa-external-link-alt"></i>
              <span>Open in New Tab</span>
            </button>
            <button class="modal-x-btn" @click="showQuotationModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Mode Tabs: All Quotations vs Make Quotation -->
        <div class="modal-tab-bar">
          <button
            type="button"
            class="modal-tab-btn"
            :class="{ active: quotationActiveTab === 'list' }"
            @click="quotationActiveTab = 'list'"
          >
            <i class="fas fa-list-alt"></i>
            <span>All Quotations ({{ clientQuotations.length }})</span>
          </button>
          <button
            type="button"
            class="modal-tab-btn"
            :class="{ active: quotationActiveTab === 'create' }"
            @click="initNewQuotationForm"
          >
            <i :class="editingQuotationId ? 'fas fa-edit text-amber' : 'fas fa-plus-circle text-emerald'"></i>
            <span>{{ editingQuotationId ? 'Edit Quotation' : 'Make Quotation' }}</span>
          </button>
        </div>

        <!-- TAB 1: ALL QUOTATIONS FOR THIS CLIENT -->
        <div v-if="quotationActiveTab === 'list'" class="quotation-list-panel">
          <!-- Loading State -->
          <div v-if="isQuotationsLoading" class="loading-state-box">
            <div class="spinner-circle"></div>
            <p>Fetching quotations for {{ quotationLead?.company_name }}...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="clientQuotations.length === 0" class="empty-quotations-box">
            <div class="empty-quote-icon">
              <i class="fas fa-file-invoice"></i>
            </div>
            <h4>No Quotations Created Yet</h4>
            <p>Generate a professional commercial estimate or quotation for <strong>{{ quotationLead?.company_name }}</strong> with automatic GST and line item breakdown.</p>
            <button class="btn-create-quote-empty" @click="initNewQuotationForm">
              <i class="fas fa-plus"></i>
              <span>Create First Quotation</span>
            </button>
          </div>

          <!-- List of Quotation Cards -->
          <div v-else class="quotations-cards-container">
            <div class="quote-summary-bar">
              <div class="quote-stat">
                <span class="stat-label">Total Quotations</span>
                <span class="stat-num">{{ clientQuotations.length }}</span>
              </div>
              <div class="quote-stat">
                <span class="stat-label">Total Quoted Value</span>
                <span class="stat-num text-emerald">{{ formatCurrency(totalClientQuotedValue) }}</span>
              </div>
              <button class="btn-new-quote-action" @click="initNewQuotationForm">
                <i class="fas fa-plus"></i>
                <span>New Quotation</span>
              </button>
            </div>

            <div class="client-quote-cards-grid">
              <div v-for="q in clientQuotations" :key="q.id" class="client-quote-card">
                <div class="cqc-header">
                  <div class="cqc-id-group">
                    <span class="cqc-code">{{ q.quote_no || ('QT-' + q.id) }}</span>
                    <span class="cqc-date"><i class="far fa-calendar-alt"></i> {{ formatDate(q.date || q.created_at) }}</span>
                  </div>
                  <div class="cqc-status-badge" :class="getQuotationStatusClass(q)">
                    {{ q.quotation_followup_status || q.status || 'Active' }}
                  </div>
                </div>

                <div class="cqc-body">
                  <div class="cqc-item-row" v-if="getQuoteItemsPreview(q)">
                    <span class="cqc-items-lbl"><i class="fas fa-box-open"></i> Requirement:</span>
                    <span class="cqc-items-txt">{{ getQuoteItemsPreview(q) }}</span>
                  </div>
                  <div class="cqc-financials">
                    <div class="cqc-fin-col">
                      <span class="lbl">Subtotal</span>
                      <span class="val">{{ formatCurrency(q.subtotal || 0) }}</span>
                    </div>
                    <div class="cqc-fin-col">
                      <span class="lbl">Tax</span>
                      <span class="val">{{ formatCurrency(q.tax_total || 0) }}</span>
                    </div>
                    <div class="cqc-fin-col grand">
                      <span class="lbl">Grand Total</span>
                      <span class="val text-emerald">{{ formatCurrency(q.grand_total || 0) }}</span>
                    </div>
                  </div>
                </div>

                <div class="cqc-actions">
                  <button class="btn-quote-view" @click="openOfficialQuotationView(q)" title="View & Print Official Quotation">
                    <i class="fas fa-print"></i>
                    <span>View / Print</span>
                  </button>
                  <button class="btn-quote-edit" @click="editClientQuotation(q)" title="Edit Quotation">
                    <i class="fas fa-edit"></i>
                    <span>Edit</span>
                  </button>
                  <button class="btn-quote-toggle" @click="toggleQuoteDetails(q.id)">
                    <i :class="expandedQuoteId === q.id ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    <span>{{ expandedQuoteId === q.id ? 'Less Details' : 'Line Items' }}</span>
                  </button>
                  <button class="btn-quote-del" @click="deleteQuotationItem(q.id)" title="Delete Quotation">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>

                <!-- Expanded Line Items Table -->
                <div v-if="expandedQuoteId === q.id" class="cqc-expanded-details">
                  <div class="quote-expanded-table-wrap">
                    <table class="quote-items-detail-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Item Description</th>
                          <th>Qty</th>
                          <th>Rate (₹)</th>
                          <th>Taxable (₹)</th>
                          <th>Line Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(it, idx) in parseQuoteItems(q.items)" :key="idx">
                          <td>{{ idx + 1 }}</td>
                          <td>{{ it.item_name || it.description || 'Service item' }}</td>
                          <td>{{ it.qty || 1 }}</td>
                          <td>{{ formatCurrency(it.rate || 0) }}</td>
                          <td>{{ formatCurrency(it.taxable || (it.qty * it.rate) || 0) }}</td>
                          <td><strong>{{ formatCurrency(it.line_total || 0) }}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="quote-expanded-footer" v-if="q.payment_terms || q.terms_conditions">
                    <p v-if="q.payment_terms"><strong>Payment Terms:</strong> {{ q.payment_terms }}</p>
                    <p v-if="q.delivery"><strong>Delivery Terms:</strong> {{ q.delivery }}</p>
                    <p v-if="q.terms_conditions" class="quote-tc"><strong>Terms & Conditions:</strong> {{ q.terms_conditions }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: MAKE / CREATE QUOTATION -->
        <div v-if="quotationActiveTab === 'create'" class="quotation-form-panel">
          <form @submit.prevent="submitQuotationForm" class="crm-modal-form">
            <!-- Client Info Row (Readonly / Auto-Filled) -->
            <div class="form-grid-3">
              <div class="input-block">
                <label>Company / Client</label>
                <input type="text" :value="quotationLead?.company_name" readonly class="crm-input input-readonly" />
              </div>
              <div class="input-block">
                <label>Contact Person</label>
                <input type="text" :value="quotationLead?.contact_person" readonly class="crm-input input-readonly" />
              </div>
              <div class="input-block">
                <label>Quotation Date <span class="required">*</span></label>
                <input type="date" v-model="quotationForm.date" required class="crm-input" />
              </div>
            </div>

            <!-- Quotation Parameters -->
            <div class="form-grid-3">
              <div class="input-block">
                <label>Nature of Sale <span class="required">*</span></label>
                <select v-model="quotationForm.nature_of_sale" required class="crm-select">
                  <option value="Intrastate">Intrastate (CGST 9% + SGST 9%)</option>
                  <option value="Interstate">Interstate (IGST 18%)</option>
                  <option value="Export">Export / SEZ (0% Tax)</option>
                </select>
              </div>
              <div class="input-block">
                <label>Quotation Reference / Subject</label>
                <input type="text" v-model="quotationForm.customer_reference" placeholder="e.g. ERP Solution Proposal" class="crm-input" />
              </div>
              <div class="input-block">
                <label>Currency</label>
                <select v-model="quotationForm.currency" class="crm-select">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <!-- Dynamic Items Builder -->
            <div class="quotation-items-builder">
              <div class="qib-header">
                <h4>Quotation Scope & Line Items</h4>
                <button type="button" class="btn-add-line-item" @click="addQuotationItem">
                  <i class="fas fa-plus"></i>
                  <span>Add Line Item</span>
                </button>
              </div>

              <div class="qib-table-wrap">
                <table class="qib-table">
                  <thead>
                    <tr>
                      <th style="width: 44%;">Item / Service Description *</th>
                      <th style="width: 12%;">Qty</th>
                      <th style="width: 18%;">Unit Rate (₹) *</th>
                      <th style="width: 12%;">GST %</th>
                      <th style="width: 14%;">Total (₹)</th>
                      <th style="width: 5%;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in quotationForm.items" :key="idx">
                      <td>
                        <input
                          type="text"
                          v-model="item.description"
                          required
                          placeholder="e.g. Enterprise ERP License & Setup"
                          class="crm-input item-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          v-model.number="item.qty"
                          min="1"
                          required
                          class="crm-input item-input text-center"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          v-model.number="item.rate"
                          min="0"
                          step="100"
                          required
                          placeholder="0"
                          class="crm-input item-input text-right"
                        />
                      </td>
                      <td>
                        <select v-model.number="item.gst_pct" class="crm-select item-input">
                          <option :value="18">18%</option>
                          <option :value="12">12%</option>
                          <option :value="5">5%</option>
                          <option :value="0">0%</option>
                        </select>
                      </td>
                      <td class="text-right text-emerald font-bold">
                        {{ formatCurrency(getItemLineTotal(item)) }}
                      </td>
                      <td class="text-center">
                        <button
                          type="button"
                          class="btn-remove-row"
                          @click="removeQuotationItem(idx)"
                          :disabled="quotationForm.items.length <= 1"
                          title="Remove Item"
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Terms & Totals Row -->
            <div class="quotation-summary-grid">
              <div class="qsg-left">
                <div class="input-block">
                  <label>Payment Terms</label>
                  <input type="text" v-model="quotationForm.payment_terms" placeholder="e.g. 50% Advance, 50% on Delivery" class="crm-input" />
                </div>
                <div class="input-block">
                  <label>Delivery Terms</label>
                  <input type="text" v-model="quotationForm.delivery" placeholder="e.g. 2 to 4 weeks" class="crm-input" />
                </div>
                <div class="input-block">
                  <label>Terms & Conditions</label>
                  <textarea v-model="quotationForm.terms_conditions" rows="3" class="crm-textarea" placeholder="Quotation validity, warranties, etc."></textarea>
                </div>
              </div>

              <div class="qsg-right">
                <div class="quote-totals-card">
                  <div class="tot-row">
                    <span>Taxable Subtotal:</span>
                    <span class="tot-val">{{ formatCurrency(computedQuotationSubtotal) }}</span>
                  </div>
                  <div class="tot-row" v-if="quotationForm.nature_of_sale === 'Intrastate'">
                    <span>CGST (Half):</span>
                    <span class="tot-val">{{ formatCurrency(computedQuotationTax / 2) }}</span>
                  </div>
                  <div class="tot-row" v-if="quotationForm.nature_of_sale === 'Intrastate'">
                    <span>SGST (Half):</span>
                    <span class="tot-val">{{ formatCurrency(computedQuotationTax / 2) }}</span>
                  </div>
                  <div class="tot-row" v-if="quotationForm.nature_of_sale === 'Interstate'">
                    <span>IGST (18%):</span>
                    <span class="tot-val">{{ formatCurrency(computedQuotationTax) }}</span>
                  </div>
                  <div class="tot-row grand-row">
                    <span>Grand Total:</span>
                    <span class="tot-val text-emerald">{{ formatCurrency(computedQuotationGrandTotal) }}</span>
                  </div>
                  <p class="amount-words" v-if="computedQuotationGrandTotal > 0">
                    <i class="fas fa-receipt"></i> {{ numberToWordsRupees(computedQuotationGrandTotal) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="modal-form-actions quote-form-actions">
              <button type="button" class="btn-cancel" @click="cancelQuotationEdit">
                {{ editingQuotationId ? 'Cancel Edit' : 'Back to Quotations List' }}
              </button>
              <button type="submit" class="btn-submit" :disabled="isSavingQuotation">
                <i :class="isSavingQuotation ? 'fas fa-spinner fa-spin' : (editingQuotationId ? 'fas fa-check-circle' : 'fas fa-save')"></i>
                <span>{{ isSavingQuotation ? 'Saving Quotation...' : (editingQuotationId ? 'Update Quotation' : 'Create & Save Quotation') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ════════ MODAL: ADD PIPELINE SECTION ════════ -->
    <div v-if="showAddSectionModal" class="crm-modal-backdrop fadeIn" @click.self="showAddSectionModal = false">
      <div class="crm-modal-box section-config-modal slideUp">
        <div class="crm-modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-badge blue-badge">
              <i class="fas fa-plus-circle"></i>
            </div>
            <div>
              <h3>Add Pipeline Section</h3>
              <p class="modal-desc">Create a new customized stage for your IT sales deals.</p>
            </div>
          </div>
          <button class="modal-x-btn" @click="showAddSectionModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveNewSection" class="crm-modal-form">
          <div class="input-block">
            <label>Stage / Section Name <span class="required">*</span></label>
            <input
              type="text"
              v-model="sectionForm.title"
              required
              placeholder="e.g. Technical Feasibility, Drawing Review, PO Signed"
              class="crm-input"
              autofocus
            />
          </div>

          <div class="input-block">
            <label>Stage Accent Color</label>
            <div class="color-preset-picker">
              <button
                v-for="color in presetColors"
                :key="color"
                type="button"
                class="color-preset-circle"
                :style="{ backgroundColor: color }"
                :class="{ active: sectionForm.color === color }"
                @click="sectionForm.color = color"
              ></button>
              <input
                type="color"
                v-model="sectionForm.color"
                class="custom-color-input"
                title="Choose custom color"
              />
            </div>
          </div>

          <div class="input-block">
            <label>Placement Position</label>
            <select v-model="sectionForm.position" class="crm-select">
              <option value="end">At End of Pipeline</option>
              <option value="start">At Beginning of Pipeline</option>
              <option v-for="(col, idx) in kanbanColumns" :key="col.status" :value="'after_' + idx">
                After "{{ col.label || col.status }}"
              </option>
            </select>
          </div>

          <div class="modal-actions-footer">
            <button type="button" class="btn-cancel" @click="showAddSectionModal = false">
              Cancel
            </button>
            <button type="submit" class="btn-submit">
              <i class="fas fa-check"></i>
              <span>Create Section</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════ MODAL: EDIT PIPELINE SECTION ════════ -->
    <div v-if="showEditSectionModal" class="crm-modal-backdrop fadeIn" @click.self="showEditSectionModal = false">
      <div class="crm-modal-box section-config-modal slideUp">
        <div class="crm-modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-badge blue-badge">
              <i class="fas fa-edit"></i>
            </div>
            <div>
              <h3>Edit Pipeline Section</h3>
              <p class="modal-desc">Rename or recolor this stage.</p>
            </div>
          </div>
          <button class="modal-x-btn" @click="showEditSectionModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveEditSection" class="crm-modal-form">
          <div class="input-block">
            <label>Stage / Section Name <span class="required">*</span></label>
            <input
              type="text"
              v-model="editSectionForm.title"
              required
              class="crm-input"
              autofocus
            />
          </div>

          <div class="input-block">
            <label>Stage Accent Color</label>
            <div class="color-preset-picker">
              <button
                v-for="color in presetColors"
                :key="color"
                type="button"
                class="color-preset-circle"
                :style="{ backgroundColor: color }"
                :class="{ active: editSectionForm.color === color }"
                @click="editSectionForm.color = color"
              ></button>
              <input
                type="color"
                v-model="editSectionForm.color"
                class="custom-color-input"
                title="Choose custom color"
              />
            </div>
          </div>

          <div class="modal-actions-footer">
            <button type="button" class="btn-cancel" @click="showEditSectionModal = false">
              Cancel
            </button>
            <button type="submit" class="btn-submit">
              <i class="fas fa-save"></i>
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════ MODAL: DELETE PIPELINE SECTION ════════ -->
    <div v-if="showDeleteSectionModal" class="crm-modal-backdrop fadeIn" @click.self="showDeleteSectionModal = false">
      <div class="crm-modal-box section-config-modal slideUp">
        <div class="crm-modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-badge red-badge">
              <i class="fas fa-trash-alt"></i>
            </div>
            <div>
              <h3 style="color: #dc2626;">Delete Pipeline Stage</h3>
              <p class="modal-desc">Are you sure you want to delete stage "{{ deletingSection?.label || deletingSection?.status }}"?</p>
            </div>
          </div>
          <button class="modal-x-btn" @click="showDeleteSectionModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="crm-modal-form">
          <div v-if="deletingSection && getLeadsByStatus(deletingSection.status, deletingSection.label).length > 0" class="delete-warning-banner">
            <i class="fas fa-exclamation-triangle"></i>
            <span>
              This stage has <strong>{{ getLeadsByStatus(deletingSection.status, deletingSection.label).length }}</strong> active deal(s). Choose where to reassign them:
            </span>
          </div>

          <div v-if="deletingSection && getLeadsByStatus(deletingSection.status, deletingSection.label).length > 0" class="input-block">
            <label>Move Existing Deals To</label>
            <select v-model="deleteFallbackStatus" class="crm-select" required>
              <option v-for="col in kanbanColumns.filter((_, i) => i !== deletingSectionIndex)" :key="col.status" :value="col.status">
                {{ col.label || col.status }}
              </option>
            </select>
          </div>

          <p v-else style="color: #64748b; font-size: 0.9rem; margin: 0.5rem 0;">
            There are no deals in this stage. It is safe to remove.
          </p>

          <div class="modal-actions-footer">
            <button type="button" class="btn-cancel" @click="showDeleteSectionModal = false">
              Cancel
            </button>
            <button type="button" class="btn-submit delete-btn" @click="confirmDeleteSection">
              <i class="fas fa-trash-alt"></i>
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import { toastSuccess, toastInfo, toastError, toastWarning } from '@/utils/toast.js';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import {
  DEFAULT_COUNTRIES,
  fetchCountryCodesApi,
  validateEmail,
  validatePhoneNumber,
  parsePhoneString
} from '@/utils/countryCodes.js';

const STORAGE_KEY = 'arch_it_sales_leads';

const DEFAULT_SAMPLE_LEADS = [
  {
    id: 1,
    company_name: 'Arch Enterprises',
    contact_person: 'Ajay Kadam (Managing Director)',
    email: 'contact@archenterprises.co.in',
    phone: '+91 98220 12345',
    service_required: 'GeM / Tender Portal',
    lead_source: 'GeM / Tender Portal',
    deal_value: 350000,
    status: 'Raw Leads',
    notes: 'Inquiry received through GeM government tender portal for annual IT infrastructure rollout.',
    created_at: '2026-10-19',
    created_by_id: 'admin',
    created_by_name: 'admin',
    created_by_email: 'admin@archenterprises.co.in',
    followups: [
      {
        id: 101,
        note: 'Tender requirements verified against technical criteria.',
        call_type: 'Portal Intake',
        status: 'Raw Leads',
        date: '2026-10-19T10:30',
        logged_by: 'admin'
      }
    ]
  },
  {
    id: 2,
    company_name: 'Arch Enterprises',
    contact_person: 'Prasad Salunke (Executive Lead)',
    email: 'prasad@archenterprises.co.in',
    phone: '+91 98221 44556',
    service_required: 'Website Inquiry',
    lead_source: 'Website Inquiry',
    deal_value: 500000,
    status: 'Hot Deals',
    notes: 'Online website inquiry for custom enterprise ERP with attendance and ledger sync.',
    created_at: '2026-10-19',
    created_by_id: 'admin',
    created_by_name: 'admin',
    created_by_email: 'admin@archenterprises.co.in',
    followups: [
      {
        id: 201,
        note: 'Scheduled live demonstration for tomorrow morning.',
        call_type: 'Phone Call',
        status: 'Hot Deals',
        date: '2026-10-19T14:00',
        logged_by: 'admin'
      }
    ]
  },
  {
    id: 3,
    company_name: 'SHRI DATTA INDUSTRIES',
    contact_person: 'Rajesh Patil (Proprietor)',
    email: 'rajesh@shridatta.com',
    phone: '+91 94220 77889',
    service_required: 'Direct RFQ / Email',
    lead_source: 'Direct RFQ / Email',
    deal_value: 750000,
    status: 'Hot Deals',
    notes: 'Direct email request for quotation regarding factory dispatch and ERP billing system.',
    created_at: '2026-10-15',
    created_by_id: 'admin',
    created_by_name: 'admin',
    created_by_email: 'admin@archenterprises.co.in',
    followups: [
      {
        id: 301,
        note: 'Discussed bill of materials and inventory batch tracing.',
        call_type: 'Email',
        status: 'Hot Deals',
        date: '2026-10-15T16:20',
        logged_by: 'admin'
      }
    ]
  },
  {
    id: 4,
    company_name: 'Arch Enterprises',
    contact_person: 'Ajay Kadam',
    email: 'contact@archenterprises.co.in',
    phone: '+91 98220 12345',
    service_required: 'Existing Client Orders & AMC',
    lead_source: 'Existing Client Orders & AMC',
    deal_value: 450000,
    status: 'PO Confirmed',
    notes: 'Annual renewal agreement and purchase order confirmed.',
    created_at: '2026-10-19',
    created_by_id: 'admin',
    created_by_name: 'admin',
    created_by_email: 'admin@archenterprises.co.in',
    followups: [
      {
        id: 401,
        note: 'Signed purchase order received. Project execution underway.',
        call_type: 'Order Confirmation',
        status: 'PO Confirmed',
        date: '2026-10-19T11:00',
        logged_by: 'admin'
      }
    ]
  }
];

export default {
  name: 'LeadManagement',
  data() {
    return {
      searchQuery: '',
      selectedStatusFilter: '',
      selectedUserFilter: '',

      isLoading: false,
      isSaving: false,
      isSubmittingFollowup: false,
      isImportingBulk: false,

      showCelebrationBanner: false,
      celebrationLead: null,
      celebrationTimer: null,
      activeFollowupAlert: null,
      reminderCheckTimer: null,

      // Quotation Modal State
      showQuotationModal: false,
      quotationLead: null,
      quotationActiveTab: 'list', // 'list' | 'create'
      clientQuotations: [],
      isQuotationsLoading: false,
      isSavingQuotation: false,
      expandedQuoteId: null,
      editingQuotationId: null,
      quotationForm: {
        nature_of_sale: 'Intrastate',
        date: '',
        customer_reference: '',
        currency: 'INR',
        payment_terms: '50% Advance with Purchase Order, 50% upon delivery/handover.',
        delivery: 'Within 2 to 4 weeks from order confirmation.',
        terms_conditions: '1. Quotation is valid for 30 days from date of issue.\n2. Taxes as applicable.\n3. Software license & maintenance support as per SLA agreement.',
        items: [
          {
            description: '',
            qty: 1,
            rate: 0,
            gst_pct: 18
          }
        ]
      },

      timelineFilter: 'all', // 'all' | 'notes' | 'pipeline'

      leads: [],
      draggedLead: null,
      dragOverColumn: null,

      canScrollLeft: false,
      canScrollRight: true,

      columnsStorageKey: 'arch_it_sales_pipeline_columns',
      kanbanColumns: [
        { status: 'Raw Leads', label: 'Raw Leads', color: '#3b82f6' },
        { status: 'Hot Deals', label: 'Hot Deals', color: '#ef4444' },
        { status: 'Active Quotations', label: 'Active Quotations', color: '#f59e0b' },
        { status: 'Technical Feasibility', label: 'Technical Feasibility', color: '#0ea5e9' },
        { status: 'Closed / Lost', label: 'Closed / Lost', color: '#475569' },
        { status: 'PO Confirmed', label: 'PO Confirmed', color: '#10b981' }
      ],

      showAddSectionModal: false,
      sectionForm: {
        title: '',
        color: '#3b82f6',
        position: 'end'
      },

      showEditSectionModal: false,
      editingSectionIndex: -1,
      editSectionForm: {
        title: '',
        color: '#3b82f6'
      },

      showDeleteSectionModal: false,
      deletingSection: null,
      deletingSectionIndex: -1,
      deleteFallbackStatus: '',

      activeCardMenuLeadId: null,

      presetColors: [
        '#3b82f6', // Royal Blue
        '#ef4444', // Hot Red
        '#f59e0b', // Amber Yellow
        '#0ea5e9', // Sky Cyan
        '#10b981', // Emerald Green
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#475569'  // Dark Slate
      ],

      // Real-Time Today's Daily Report Modal
      showDailyReportModal: false,
      isReportLoading: false,
      reportActiveTab: 'overview', // 'overview' | 'leads' | 'followups' | 'quotations' | 'po'
      reportUserFilter: '',
      reportLastRefreshed: '',
      allQuotationsList: [],

      // Add/Edit Modal & Bulk Import
      showLeadModal: false,
      isEditing: false,
      modalActiveTab: 'single', // 'single' | 'bulk'
      bulkPreviewLeads: [],
      bulkFileName: '',

      countryList: DEFAULT_COUNTRIES,
      selectedCountryCode: '+91',
      leadFormPhoneRaw: '',
      emailTouched: false,
      phoneTouched: false,

      leadForm: {
        id: null,
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        service_required: 'Enterprise ERP / CRM',
        other_service: '',
        deal_value: '',
        status: 'New',
        notes: ''
      },

      // Follow-up modal
      activeFollowupLead: null,
      newFollowup: {
        note: '',
        call_type: 'Phone Call',
        status: 'Connected & Discussed',
        date: ''
      }
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
          department: (localUser.department || '').toString().trim(),
          role: (localUser.role || '').toString().trim(),
          designation: (localUser.designation || localUser.keyresponsibility || '').toString().trim()
        };
      } catch (e) {
        return {
          id: '',
          name: 'IT Sales Executive',
          email: '',
          department: '',
          role: '',
          designation: ''
        };
      }
    },

    currentUserName() {
      return this.currentUser.name || 'IT Sales Executive';
    },

    currentUserId() {
      return this.currentUser.id || '';
    },

    isITLead() {
      const u = this.currentUser;
      const dept = (u.department || '').toLowerCase().trim();
      const normDept = dept.replace(/[\s_-]+/g, '');
      const role = (u.role || '').toLowerCase().trim();
      const normRole = role.replace(/[\s_-]+/g, '');
      const desig = (u.designation || u.keyresponsibility || '').toLowerCase().trim();
      const normDesig = desig.replace(/[\s_-]+/g, '');

      return Boolean(
        normDept === 'itlead' ||
        normDept === 'ithead' ||
        dept === 'it lead' ||
        dept === 'it_lead' ||
        dept === 'it-lead' ||
        normRole === 'itlead' ||
        normRole === 'ithead' ||
        role === 'it lead' ||
        role === 'it_lead' ||
        role === 'it-lead' ||
        normRole.includes('itlead') ||
        role.includes('it lead') ||
        role.includes('it_lead') ||
        normDesig === 'itlead' ||
        normDesig === 'ithead' ||
        desig === 'it lead' ||
        desig === 'it_lead' ||
        desig === 'it-lead' ||
        desig.includes('it lead') ||
        desig.includes('it_lead') ||
        ((normDept === 'it' || dept.includes('information technology') || normDept === 'itsales') && (normDesig.includes('lead') || normDesig.includes('head') || normRole.includes('lead') || normRole.includes('head')))
      );
    },

    isOwnership() {
      const u = this.currentUser;
      const dept = (u.department || '').toLowerCase().trim();
      const normDept = dept.replace(/[\s_-]+/g, '');
      const role = (u.role || '').toLowerCase().trim();
      const normRole = role.replace(/[\s_-]+/g, '');
      const desig = (u.designation || u.keyresponsibility || '').toLowerCase().trim();
      const normDesig = desig.replace(/[\s_-]+/g, '');
      const name = (u.name || '').toLowerCase().trim();
      const authTab = localStorage.getItem('authTab');
      const adminToken = localStorage.getItem('admin_token');

      return Boolean(
        normDept === 'owner' ||
        normDept === 'ownership' ||
        dept === 'owner' ||
        dept === 'ownership' ||
        normRole === 'owner' ||
        role === 'owner' ||
        normRole === 'admin' ||
        role === 'admin' ||
        normDesig === 'owner' ||
        desig.includes('owner') ||
        name === 'ajay' ||
        name.startsWith('ajay ') ||
        authTab === 'admin' ||
        Boolean(adminToken)
      );
    },

    canAccessAllLeads() {
      return Boolean(this.isOwnership || this.isITLead);
    },

    isOwner() {
      return this.canAccessAllLeads;
    },

    scopedLeads() {
      if (this.isOwner) {
        if (this.selectedUserFilter) {
          return this.leads.filter(l => (l.created_by_name || 'Admin / Ownership') === this.selectedUserFilter);
        }
        return this.leads;
      }

      const myId = String(this.currentUserId || '');
      const myName = (this.currentUserName || '').trim().toLowerCase();
      const myEmail = (this.currentUser.email || '').trim().toLowerCase();

      return this.leads.filter(l => {
        // Direct created_by match
        if (l.created_by_id && String(l.created_by_id) === myId) return true;
        if (l.created_by_name && l.created_by_name.trim().toLowerCase() === myName) return true;
        if (myEmail && l.created_by_email && l.created_by_email.trim().toLowerCase() === myEmail) return true;

        // Assigned to user match
        if (l.assigned_to_id && String(l.assigned_to_id) === myId) return true;
        if (l.assigned_to_name && l.assigned_to_name.trim().toLowerCase() === myName) return true;

        // Interaction log match (if notes were recorded by this user)
        if (Array.isArray(l.followups) && l.followups.some(f => (f.logged_by || '').trim().toLowerCase() === myName)) {
          return true;
        }

        return false;
      });
    },

    leadCreators() {
      const set = new Set();
      this.leads.forEach(l => {
        const creator = l.created_by_name || 'Admin / Ownership';
        set.add(creator);
      });
      return Array.from(set);
    },

    totalPipelineValue() {
      return this.scopedLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
    },

    statusOptions() {
      return this.kanbanColumns.map(c => c.status);
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
      return validateEmail(this.leadForm.email);
    },

    phoneValidation() {
      return validatePhoneNumber(this.leadFormPhoneRaw, this.currentCountry);
    },

    todayDateString() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },

    todayFormattedHeader() {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    reportScopedLeads() {
      let list = [...this.scopedLeads];
      if (this.reportUserFilter) {
        list = list.filter(
          l => (l.created_by_name || l.user_name || '').toLowerCase() === this.reportUserFilter.toLowerCase()
        );
      }
      return list;
    },

    // 1. Total New Leads Today
    todaysNewLeads() {
      const todayStr = this.todayDateString;
      return this.reportScopedLeads.filter(l => {
        if (!l.created_at) return false;
        return String(l.created_at).slice(0, 10) === todayStr;
      });
    },

    todaysNewLeadsValue() {
      return this.todaysNewLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
    },

    // 2. Total Follow-Up Calls & Discussions Today
    todaysFollowups() {
      const todayStr = this.todayDateString;
      const items = [];
      this.reportScopedLeads.forEach(lead => {
        if (Array.isArray(lead.followups)) {
          lead.followups.forEach(f => {
            const dateStr = String(f.date || f.created_at || '').slice(0, 10);
            if (dateStr === todayStr) {
              items.push({
                ...f,
                lead_id: lead.id,
                company_name: lead.company_name,
                contact_person: lead.contact_person,
                deal_value: lead.deal_value,
                service_required: lead.service_required,
                lead_status: lead.status
              });
            }
          });
        }
      });
      items.sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));
      return items;
    },

    todaysFollowupCallsCount() {
      return this.todaysFollowups.filter(f => {
        const type = (f.call_type || '').toLowerCase();
        return type.includes('call') || type.includes('phone');
      }).length;
    },

    // 3. Total Send Quotations Today
    todaysQuotations() {
      const todayStr = this.todayDateString;
      const list = [];
      const seenQuotes = new Set();

      // Check allQuotationsList from API
      if (Array.isArray(this.allQuotationsList)) {
        this.allQuotationsList.forEach(q => {
          const qDate = String(q.date || q.created_at || '').slice(0, 10);
          if (qDate === todayStr) {
            if (!this.reportUserFilter || (q.created_by && q.created_by.toLowerCase() === this.reportUserFilter.toLowerCase())) {
              const quoteKey = (q.quote_no || q.id).toString();
              if (!seenQuotes.has(quoteKey)) {
                seenQuotes.add(quoteKey);
                list.push({
                  id: q.id,
                  quote_no: q.quote_no || `QT-${q.id}`,
                  company_name: q.company_name,
                  contact_person: q.contact_person,
                  grand_total: Number(q.grand_total) || 0,
                  status: q.status || 'Quotation send',
                  created_by: q.created_by || 'IT Sales Executive',
                  time: q.date || q.created_at
                });
              }
            }
          }
        });
      }

      // Check leads in Quotation stages
      this.reportScopedLeads.forEach(lead => {
        const isQuotationStage = ['send quotation', 'active quotations', 'quotation send'].some(
          st => (lead.status || '').toLowerCase() === st.toLowerCase()
        );
        const createdToday = String(lead.created_at || '').slice(0, 10) === todayStr;
        const hasTodayQuoteFollowup =
          Array.isArray(lead.followups) &&
          lead.followups.some(f => {
            const fDate = String(f.date || f.created_at || '').slice(0, 10);
            return (
              fDate === todayStr &&
              ((f.call_type || '').toLowerCase().includes('quotation') ||
                (f.note || '').toLowerCase().includes('quotation'))
            );
          });

        if (isQuotationStage && (createdToday || hasTodayQuoteFollowup)) {
          const compKey = (lead.company_name || '').toLowerCase();
          if (!list.some(item => (item.company_name || '').toLowerCase() === compKey)) {
            list.push({
              id: 'lead-' + lead.id,
              quote_no: `LEAD-${lead.id}`,
              company_name: lead.company_name,
              contact_person: lead.contact_person,
              grand_total: Number(lead.deal_value) || 0,
              status: lead.status,
              created_by: lead.created_by_name || 'IT Sales Executive',
              time: lead.created_at
            });
          }
        }
      });

      return list;
    },

    todaysQuotationsValue() {
      return this.todaysQuotations.reduce((sum, q) => sum + (Number(q.grand_total) || 0), 0);
    },

    // 4. Total PO Confirmed Today (and Same Day conversions)
    todaysPoConfirmed() {
      const todayStr = this.todayDateString;
      const list = [];

      this.reportScopedLeads.forEach(lead => {
        const isPoStatus = ['po confirmed', 'won', 'closed won', 'deal won'].some(
          st => (lead.status || '').toLowerCase() === st.toLowerCase()
        );
        if (isPoStatus) {
          const createdToday = String(lead.created_at || '').slice(0, 10) === todayStr;
          const hasTodayPoFollowup =
            Array.isArray(lead.followups) &&
            lead.followups.some(f => {
              const fDate = String(f.date || f.created_at || '').slice(0, 10);
              return (
                fDate === todayStr &&
                ((f.status || '').toLowerCase().includes('po') ||
                  (f.status || '').toLowerCase().includes('won') ||
                  (f.call_type || '').toLowerCase().includes('order') ||
                  (f.note || '').toLowerCase().includes('po confirmed') ||
                  (f.note || '').toLowerCase().includes('won'))
              );
            });

          if (createdToday || hasTodayPoFollowup) {
            list.push({
              ...lead,
              isSameDayConversion: createdToday
            });
          }
        }
      });

      return list;
    },

    todaysPoConfirmedValue() {
      return this.todaysPoConfirmed.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
    },

    todaysSameDayPoCount() {
      return this.todaysPoConfirmed.filter(l => l.isSameDayConversion).length;
    },

    todaysSameDayPoValue() {
      return this.todaysPoConfirmed
        .filter(l => l.isSameDayConversion)
        .reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
    },

    todaysLiveFeed() {
      const feed = [];

      // New leads
      this.todaysNewLeads.forEach(l => {
        feed.push({
          id: 'lead-' + l.id,
          type: 'lead',
          icon: 'fas fa-user-plus',
          color: '#2563eb',
          title: `New Lead: ${l.company_name}`,
          desc: `${l.contact_person} • Service: ${l.service_required} • ₹${(l.deal_value || 0).toLocaleString('en-IN')}`,
          actor: l.created_by_name || 'Sales Executive',
          time: l.created_at
        });
      });

      // Follow-ups
      this.todaysFollowups.forEach(f => {
        feed.push({
          id: 'followup-' + f.id,
          type: 'followup',
          icon: (f.call_type || '').toLowerCase().includes('call') ? 'fas fa-phone-alt' : 'fas fa-comments',
          color: '#8b5cf6',
          title: `Follow-up: ${f.company_name}`,
          desc: `${f.call_type}: "${f.note}" • Stage: ${f.status || f.lead_status}`,
          actor: f.logged_by || 'Sales Executive',
          time: f.date || f.created_at
        });
      });

      // Quotations
      this.todaysQuotations.forEach(q => {
        feed.push({
          id: 'quote-' + q.id,
          type: 'quotation',
          icon: 'fas fa-file-invoice-dollar',
          color: '#f59e0b',
          title: `Quotation: ${q.company_name}`,
          desc: `Quote #${q.quote_no} • ₹${(q.grand_total || 0).toLocaleString('en-IN')} (${q.status})`,
          actor: q.created_by,
          time: q.time
        });
      });

      // PO Confirmed
      this.todaysPoConfirmed.forEach(p => {
        feed.push({
          id: 'po-' + p.id,
          type: 'po',
          icon: 'fas fa-trophy',
          color: '#10b981',
          title: `🎉 PO Confirmed: ${p.company_name}`,
          desc: `Deal Closed: ₹${(p.deal_value || 0).toLocaleString('en-IN')}${p.isSameDayConversion ? ' • (⚡ SAME-DAY TURNAROUND)' : ''}`,
          actor: p.created_by_name || 'Sales Executive',
          time: p.created_at
        });
      });

      feed.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
      return feed;
    },

    filteredLeads() {
      let result = [...this.scopedLeads];
      if (this.selectedStatusFilter) {
        result = result.filter(l => (l.status || '').toLowerCase() === this.selectedStatusFilter.toLowerCase());
      }
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        result = result.filter(l => {
          if (l.company_name && l.company_name.toLowerCase().includes(q)) return true;
          if (l.contact_person && l.contact_person.toLowerCase().includes(q)) return true;
          if (l.service_required && l.service_required.toLowerCase().includes(q)) return true;
          if (l.lead_source && l.lead_source.toLowerCase().includes(q)) return true;
          if (l.phone && String(l.phone).toLowerCase().includes(q)) return true;
          if (l.email && l.email.toLowerCase().includes(q)) return true;
          if (l.notes && l.notes.toLowerCase().includes(q)) return true;
          if (l.status && l.status.toLowerCase().includes(q)) return true;
          if (l.created_by_name && l.created_by_name.toLowerCase().includes(q)) return true;
          if (l.created_by_id && String(l.created_by_id).toLowerCase().includes(q)) return true;
          if (Array.isArray(l.followups)) {
            const hasMatch = l.followups.some(f =>
              (f.note && f.note.toLowerCase().includes(q)) ||
              (f.logged_by && f.logged_by.toLowerCase().includes(q)) ||
              (f.status && f.status.toLowerCase().includes(q))
            );
            if (hasMatch) return true;
          }
          return false;
        });
      }
      return result;
    },

    filteredFollowups() {
      if (!this.activeFollowupLead || !Array.isArray(this.activeFollowupLead.followups)) return [];
      if (this.timelineFilter === 'notes') {
        return this.activeFollowupLead.followups.filter(f => f.call_type !== 'Pipeline Update');
      }
      if (this.timelineFilter === 'pipeline') {
        return this.activeFollowupLead.followups.filter(f => f.call_type === 'Pipeline Update');
      }
      return this.activeFollowupLead.followups;
    },

    timelineNotesCount() {
      if (!this.activeFollowupLead || !Array.isArray(this.activeFollowupLead.followups)) return 0;
      return this.activeFollowupLead.followups.filter(f => f.call_type !== 'Pipeline Update').length;
    },

    timelinePipelineCount() {
      if (!this.activeFollowupLead || !Array.isArray(this.activeFollowupLead.followups)) return 0;
      return this.activeFollowupLead.followups.filter(f => f.call_type === 'Pipeline Update').length;
    },

    computedQuotationSubtotal() {
      if (!this.quotationForm?.items) return 0;
      return this.quotationForm.items.reduce((sum, it) => {
        return sum + (Number(it.qty || 0) * Number(it.rate || 0));
      }, 0);
    },

    computedQuotationTax() {
      if (!this.quotationForm?.items) return 0;
      if (this.quotationForm.nature_of_sale === 'Export') return 0;
      return this.quotationForm.items.reduce((sum, it) => {
        const taxable = Number(it.qty || 0) * Number(it.rate || 0);
        const taxRate = Number(it.gst_pct || 0);
        return sum + (taxable * (taxRate / 100));
      }, 0);
    },

    computedQuotationGrandTotal() {
      return this.computedQuotationSubtotal + this.computedQuotationTax;
    },

    totalClientQuotedValue() {
      return this.clientQuotations.reduce((sum, q) => sum + (Number(q.grand_total) || 0), 0);
    }
  },

  mounted() {
    this.loadPipelineColumns();
    this.loadLeads();
    this.loadCountryCodes();
    this.startReminderChecker();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    window.addEventListener('resize', this.checkScrollButtons);
    window.addEventListener('focus', this.onWindowFocus);
    document.addEventListener('click', this.handleOutsideClick);
    this.$nextTick(() => {
      this.checkScrollButtons();
    });
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkScrollButtons);
    window.removeEventListener('focus', this.onWindowFocus);
    document.removeEventListener('click', this.handleOutsideClick);
    if (this.celebrationTimer) clearTimeout(this.celebrationTimer);
    if (this.reminderCheckTimer) clearInterval(this.reminderCheckTimer);
  },

  methods: {
    isFollowupDateDue(dt) {
      if (!dt) return false;
      return new Date(dt).getTime() <= new Date().getTime();
    },

    formatFollowupReminderSnippet(dt) {
      if (!dt) return '';
      try {
        const d = new Date(dt);
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (diff <= 0) {
          return `Due Now! (${timeStr})`;
        }
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) {
          return `Today ${timeStr}`;
        }
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        if (d.toDateString() === tom.toDateString()) {
          return `Tomorrow ${timeStr}`;
        }
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${dateStr}, ${timeStr}`;
      } catch (e) {
        return dt;
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

      // Check leads in memory
      if (Array.isArray(this.leads)) {
        for (let i = 0; i < this.leads.length; i++) {
          const l = this.leads[i];
          if (l && l.next_followup_date) {
            const scheduledTime = new Date(l.next_followup_date).getTime();
            const alertKey = `arch_alerted_${l.id}_${l.next_followup_date}`;
            const alreadyAlerted = localStorage.getItem(alertKey);
            if (scheduledTime <= now && !alreadyAlerted) {
              localStorage.setItem(alertKey, 'true');
              this.triggerFollowupPopup({
                leadId: l.id,
                company_name: l.company_name,
                contact_person: l.contact_person,
                phone: l.phone,
                email: l.email,
                service_required: l.service_required,
                deal_value: l.deal_value,
                status: l.status,
                note: l.notes || 'Follow-up discussion scheduled',
                scheduled_time: l.next_followup_date
              });
              return;
            }
          }
        }
      }

      // Check shared reminders in localStorage
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
        console.error('LeadManagement reminder check error:', e);
      }
    },

    triggerFollowupPopup(alertData) {
      this.activeFollowupAlert = alertData;
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

        // Update in backend
        axios.put(`/api/leads/${this.activeFollowupAlert.leadId}`, { next_followup_date: isoStr }).catch(() => {});
        const lead = this.leads.find(l => String(l.id) === String(this.activeFollowupAlert.leadId));
        if (lead) lead.next_followup_date = isoStr;
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

        axios.put(`/api/leads/${this.activeFollowupAlert.leadId}`, { next_followup_date: null }).catch(() => {});
        const lead = this.leads.find(l => String(l.id) === String(this.activeFollowupAlert.leadId));
        if (lead) lead.next_followup_date = null;
      } catch (e) {
        console.error('Acknowledge error:', e);
      }
      this.dismissFollowupAlert();
    },

    openLeadFromAlert() {
      if (!this.activeFollowupAlert) return;
      const leadId = this.activeFollowupAlert.leadId;
      const lead = this.leads.find(l => String(l.id) === String(leadId));
      this.dismissFollowupAlert();
      if (lead) {
        this.openLeadDetails(lead);
      } else {
        const routeData = this.$router.resolve({
          path: '/employee/lead-details',
          query: { id: leadId }
        });
        window.open(routeData.href, '_blank');
      }
    },

    openDailyReportModal() {
      const routeData = this.$router.resolve({ path: '/employee/daily-sales-report' });
      window.open(routeData.href, '_blank');
    },

    openDailyReport() {
      this.openDailyReportModal();
    },

    async refreshDailyReportData() {
      this.isReportLoading = true;
      try {
        const params = {
          user_id: this.currentUserId,
          user_name: this.currentUserName,
          user_email: this.currentUser.email || '',
          user_role: this.currentUser.role || '',
          user_department: this.currentUser.department || '',
          user_designation: this.currentUser.designation || '',
          auth_tab: localStorage.getItem('authTab') || ''
        };

        const [leadsRes, quotesRes] = await Promise.allSettled([
          axios.get('/api/leads', { params }),
          axios.get('/api/it-quotations')
        ]);

        if (leadsRes.status === 'fulfilled' && leadsRes.value.data?.success && Array.isArray(leadsRes.value.data.leads)) {
          this.leads = leadsRes.value.data.leads.map(l => ({
            ...l,
            deal_value: Number(l.deal_value) || 0,
            followups: Array.isArray(l.followups) ? l.followups : []
          }));
          this.saveLeadsLocal();
        }

        if (quotesRes.status === 'fulfilled' && Array.isArray(quotesRes.value.data)) {
          this.allQuotationsList = quotesRes.value.data;
        }

        const now = new Date();
        this.reportLastRefreshed = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (err) {
        console.error('Failed to refresh daily report data:', err);
      } finally {
        this.isReportLoading = false;
      }
    },

    onWindowFocus() {
      this.loadLeads();
    },

    handleOutsideClick(e) {
      if (!e.target.closest('.card-menu-container') && !e.target.closest('.card-dots-btn')) {
        this.activeCardMenuLeadId = null;
      }
    },

    goTo(route) {
      this.$router.push('/' + route.replace(/^\//, ''));
    },

    scrollKanban(direction) {
      const container = this.$refs.kanbanScroller;
      if (!container) return;
      const scrollStep = 320;
      const target = direction === 'left'
        ? container.scrollLeft - scrollStep
        : container.scrollLeft + scrollStep;
      container.scrollTo({
        left: target,
        behavior: 'smooth'
      });
      setTimeout(() => {
        this.checkScrollButtons();
      }, 350);
    },

    checkScrollButtons() {
      const container = this.$refs.kanbanScroller;
      if (!container) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      this.canScrollLeft = container.scrollLeft > 10;
      this.canScrollRight = maxScroll > 0 && container.scrollLeft < maxScroll - 10;
    },

    loadPipelineColumns() {
      try {
        const saved = localStorage.getItem(this.columnsStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.kanbanColumns = parsed;
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load saved pipeline columns:', e);
      }
      this.kanbanColumns = [
        { status: 'Raw Leads', label: 'Raw Leads', color: '#3b82f6' },
        { status: 'Hot Deals', label: 'Hot Deals', color: '#ef4444' },
        { status: 'Active Quotations', label: 'Active Quotations', color: '#f59e0b' },
        { status: 'Technical Feasibility', label: 'Technical Feasibility', color: '#0ea5e9' },
        { status: 'Closed / Lost', label: 'Closed / Lost', color: '#475569' },
        { status: 'PO Confirmed', label: 'PO Confirmed', color: '#10b981' }
      ];
    },

    savePipelineColumns() {
      try {
        localStorage.setItem(this.columnsStorageKey, JSON.stringify(this.kanbanColumns));
      } catch (e) {
        console.error('Failed to save pipeline columns:', e);
      }
    },

    moveColumn(index, direction) {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= this.kanbanColumns.length) return;
      const moved = this.kanbanColumns.splice(index, 1)[0];
      this.kanbanColumns.splice(targetIndex, 0, moved);
      this.savePipelineColumns();
      toastSuccess(`Moved "${moved.label}" stage ${direction < 0 ? 'left' : 'right'}`);
    },

    openAddSectionModal(insertAfterIndex = null) {
      this.sectionForm = {
        title: '',
        color: this.presetColors[this.kanbanColumns.length % this.presetColors.length] || '#3b82f6',
        position: insertAfterIndex !== null ? `after_${insertAfterIndex}` : 'end'
      };
      this.showAddSectionModal = true;
    },

    saveNewSection() {
      const title = (this.sectionForm.title || '').trim();
      if (!title) {
        toastWarning('Please enter a section title.');
        return;
      }
      const exists = this.kanbanColumns.some(c => (c.label || '').toLowerCase() === title.toLowerCase());
      if (exists) {
        toastWarning('A stage with this name already exists.');
        return;
      }
      const newCol = {
        status: title,
        label: title,
        color: this.sectionForm.color || '#3b82f6'
      };

      if (this.sectionForm.position === 'start') {
        this.kanbanColumns.unshift(newCol);
      } else if (this.sectionForm.position.startsWith('after_')) {
        const afterIdx = parseInt(this.sectionForm.position.replace('after_', ''), 10);
        if (!isNaN(afterIdx) && afterIdx >= 0) {
          this.kanbanColumns.splice(afterIdx + 1, 0, newCol);
        } else {
          this.kanbanColumns.push(newCol);
        }
      } else {
        this.kanbanColumns.push(newCol);
      }

      this.savePipelineColumns();
      this.showAddSectionModal = false;
      toastSuccess(`Added section "${title}" to pipeline!`);
      this.$nextTick(() => {
        this.checkScrollButtons();
      });
    },

    openEditSectionModal(col, idx) {
      this.editingSectionIndex = idx;
      this.editSectionForm = {
        title: col.label || col.status,
        color: col.color || '#3b82f6'
      };
      this.showEditSectionModal = true;
    },

    saveEditSection() {
      const title = (this.editSectionForm.title || '').trim();
      if (!title) {
        toastWarning('Stage name cannot be empty.');
        return;
      }
      if (this.editingSectionIndex < 0 || this.editingSectionIndex >= this.kanbanColumns.length) return;

      const col = this.kanbanColumns[this.editingSectionIndex];
      const oldStatus = col.status;
      col.label = title;
      col.status = title;
      col.color = this.editSectionForm.color || col.color;

      // Update any leads that were in the old status
      this.leads.forEach(l => {
        if (l.status === oldStatus) {
          l.status = title;
        }
      });
      this.saveLeadsLocal();
      this.savePipelineColumns();
      this.showEditSectionModal = false;
      toastSuccess(`Updated stage "${title}"!`);
    },

    openDeleteSectionModal(col, idx) {
      if (this.kanbanColumns.length <= 1) {
        toastWarning('You must keep at least one pipeline stage.');
        return;
      }
      this.deletingSection = col;
      this.deletingSectionIndex = idx;
      const otherCols = this.kanbanColumns.filter((_, i) => i !== idx);
      this.deleteFallbackStatus = otherCols[0]?.status || '';
      this.showDeleteSectionModal = true;
    },

    confirmDeleteSection() {
      if (this.deletingSectionIndex < 0 || !this.deletingSection) return;
      const col = this.deletingSection;
      const count = this.getLeadsByStatus(col.status, col.label).length;

      if (count > 0 && this.deleteFallbackStatus) {
        this.leads.forEach(l => {
          if (l.status === col.status || l.status === col.label) {
            l.status = this.deleteFallbackStatus;
          }
        });
        this.saveLeadsLocal();
      }

      this.kanbanColumns.splice(this.deletingSectionIndex, 1);
      this.savePipelineColumns();
      this.showDeleteSectionModal = false;
      this.deletingSection = null;
      this.deletingSectionIndex = -1;
      toastSuccess(`Deleted section "${col.label}".`);
      this.$nextTick(() => {
        this.checkScrollButtons();
      });
    },

    toggleCardMenu(leadId, e) {
      if (e) e.stopPropagation();
      if (this.activeCardMenuLeadId === leadId) {
        this.activeCardMenuLeadId = null;
      } else {
        this.activeCardMenuLeadId = leadId;
      }
    },

    async deleteLead(leadId) {
      if (!confirm('Are you sure you want to delete this deal?')) return;
      try {
        await axios.delete(`/api/leads/${leadId}`);
        this.leads = this.leads.filter(l => l.id !== leadId);
        this.saveLeadsLocal();
        toastSuccess('Lead deleted successfully.');
      } catch (e) {
        this.leads = this.leads.filter(l => l.id !== leadId);
        this.saveLeadsLocal();
        toastSuccess('Lead deleted.');
      }
    },

    formatShortDate(dateStr) {
      if (!dateStr) return 'Oct 19';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr).substring(0, 10);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
        return 'Oct 19';
      }
    },

    formatUserHandle(name) {
      if (!name) return 'admin';
      const clean = String(name).toLowerCase().replace(/[\s\-_]+/g, '').replace(/[^a-z0-9]/g, '');
      if (clean.includes('admin') || clean.includes('owner')) return 'admin';
      return clean.substring(0, 15) || 'admin';
    },

    getLeadAvatar(lead) {
      const id = Number(lead.id) || 1;
      const avatarIndex = ((id - 1) % 70) + 1;
      return `https://i.pravatar.cc/150?u=arch_lead_${avatarIndex}`;
    },

    async loadLeads() {
      this.isLoading = true;
      try {
        const params = {
          user_id: this.currentUserId,
          user_name: this.currentUserName,
          user_email: this.currentUser.email || '',
          user_role: this.currentUser.role || '',
          user_department: this.currentUser.department || '',
          user_designation: this.currentUser.designation || '',
          auth_tab: localStorage.getItem('authTab') || ''
        };
        const response = await axios.get('/api/leads', { params });
        if (response.data && response.data.success && Array.isArray(response.data.leads)) {
          this.leads = response.data.leads.map(l => ({
            ...l,
            deal_value: Number(l.deal_value) || 0,
            followups: Array.isArray(l.followups) ? l.followups : []
          }));
          this.saveLeadsLocal();
        }
      } catch (e) {
        console.error('Failed to load leads from database, falling back to cache:', e);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            this.leads = JSON.parse(stored);
          } catch (pe) {
            this.leads = [...DEFAULT_SAMPLE_LEADS];
          }
        } else {
          this.leads = [...DEFAULT_SAMPLE_LEADS];
        }
      } finally {
        this.isLoading = false;
        this.$nextTick(() => {
          this.checkScrollButtons();
        });
      }
    },

    saveLeadsLocal() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.leads));
      } catch (e) {
        console.error('Failed to save leads to cache:', e);
      }
    },

    saveLeads() {
      this.saveLeadsLocal();
    },

    getLeadsByStatus(status, label = '') {
      const target = (status || '').toLowerCase().trim();
      const targetLabel = (label || status || '').toLowerCase().trim();

      return this.filteredLeads.filter(l => {
        const s = (l.status || '').toLowerCase().trim();
        if (s === target || s === targetLabel) return true;

        // Backward compatibility mappings with old defaults
        if (targetLabel === 'raw leads' || target === 'raw leads' || target === 'raw') {
          return s === 'new' || s === 'raw' || s === 'raw leads';
        }
        if (targetLabel === 'hot deals' || target === 'hot deals' || target === 'hot') {
          return s === 'hot' || s === 'hot deals' || s === 'in discussion' || s === 'contacted';
        }
        if (targetLabel === 'active quotations' || target === 'active quotations' || target === 'warm') {
          return s === 'warm' || s === 'active quotations' || s === 'quotation send' || s === 'proposal sent';
        }
        if (targetLabel === 'technical feasibility' || target === 'technical feasibility' || target === 'cold') {
          return s === 'cold' || s === 'technical feasibility';
        }
        if (targetLabel === 'closed / lost' || target === 'closed / lost' || target === 'dead' || target === 'lost') {
          return s === 'dead' || s === 'lost' || s === 'closed / lost' || s === 'closed lost';
        }
        if (targetLabel === 'po confirmed' || target === 'po confirmed' || target === 'approved' || target === 'won') {
          return s === 'won' || s === 'approved' || s === 'po confirmed' || s === 'po confirmed / client';
        }

        return false;
      });
    },

    getColumnValueSum(status, label = '') {
      return this.getLeadsByStatus(status, label).reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
    },

    getLatestFollowup(lead) {
      if (lead.followups && lead.followups.length > 0) {
        return lead.followups[0];
      }
      return null;
    },

    // ─── DRAG & DROP FUNCTIONALITY ───
    onDragStart(lead, event) {
      this.draggedLead = lead;
      if (event && event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(lead.id));
      }
    },

    onDragEnd() {
      this.draggedLead = null;
      this.dragOverColumn = null;
    },

    onDragOver(columnStatus) {
      this.dragOverColumn = columnStatus;
    },

    onDragLeave(columnStatus) {
      if (this.dragOverColumn === columnStatus) {
        this.dragOverColumn = null;
      }
    },

    onDrop(newStatus) {
      if (!this.draggedLead) return;
      const leadId = this.draggedLead.id;
      const oldStatus = this.draggedLead.status;

      if (oldStatus !== newStatus) {
        this.updateLeadStatus(leadId, newStatus);
      }

      this.draggedLead = null;
      this.dragOverColumn = null;
    },

    // ─── STAGE STEPPING ───
    isFirstStage(status) {
      return this.statusOptions.indexOf(status) === 0;
    },

    isLastStage(status) {
      return this.statusOptions.indexOf(status) === this.statusOptions.length - 1;
    },

    stepStage(lead, direction) {
      const currentIdx = this.statusOptions.indexOf(lead.status);
      const nextIdx = currentIdx + direction;
      if (nextIdx >= 0 && nextIdx < this.statusOptions.length) {
        this.updateLeadStatus(lead.id, this.statusOptions[nextIdx]);
      }
    },

    async updateLeadStatus(leadId, newStatus) {
      const lead = this.leads.find(l => l.id === leadId);
      if (!lead) return;

      const prevStatus = lead.status;
      if (prevStatus === newStatus) return;

      // Optimistic local update for fluid UI response
      lead.status = newStatus;
      if (this.activeFollowupLead && this.activeFollowupLead.id === leadId) {
        this.activeFollowupLead.status = newStatus;
      }

      if (newStatus === 'Won') {
        toastSuccess(`🎉 Lead ${lead.company_name} marked as WON!`);
        this.triggerCelebration(lead);
      } else {
        toastInfo(`Status moved to "${newStatus}"`);
      }

      try {
        const res = await axios.put(`/api/leads/${leadId}`, {
          status: newStatus,
          user_name: this.currentUserName
        });
        if (res.data && res.data.success && res.data.lead) {
          const updated = res.data.lead;
          lead.followups = Array.isArray(updated.followups) ? updated.followups : [];
          lead.deal_value = Number(updated.deal_value) || 0;
          if (this.activeFollowupLead && this.activeFollowupLead.id === leadId) {
            this.activeFollowupLead = {
              ...updated,
              deal_value: Number(updated.deal_value) || 0,
              followups: Array.isArray(updated.followups) ? updated.followups : []
            };
          }
          this.saveLeadsLocal();
        }
      } catch (err) {
        console.error('Failed to sync status change with database:', err);
        toastError('Failed to sync status change with database. Reverting.');
        lead.status = prevStatus;
        if (this.activeFollowupLead && this.activeFollowupLead.id === leadId) {
          this.activeFollowupLead.status = prevStatus;
        }
      }
    },

    // ─── WON CELEBRATION EFFECTS ───
    playCelebrationChime() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 flourish
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const startTime = ctx.currentTime + i * 0.12;
          const duration = 0.55;
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.2, startTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      } catch (e) {
        // Audio policy ignore
      }
    },

    triggerCelebration(lead) {
      this.celebrationLead = lead;
      this.showCelebrationBanner = true;

      if (this.celebrationTimer) {
        clearTimeout(this.celebrationTimer);
      }
      this.celebrationTimer = setTimeout(() => {
        this.showCelebrationBanner = false;
      }, 4500);

      this.playCelebrationChime();

      // Confetti Cannons: Left & Right Bursts
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#6366f1', '#ec4899', '#fbbf24']
      });

      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#6366f1', '#ec4899', '#fbbf24']
      });

      // Sky fireworks / center burst
      setTimeout(() => {
        confetti({
          particleCount: 110,
          spread: 120,
          origin: { y: 0.45 },
          shapes: ['star', 'circle'],
          colors: ['#ffd700', '#10b981', '#3b82f6', '#f43f5e', '#a855f7'],
          scalar: 1.2
        });
      }, 250);

      // Shimmer stream
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 90,
          spread: 85,
          origin: { y: 0.6 },
          ticks: 200,
          gravity: 0.75,
          colors: ['#10b981', '#34d399', '#fbbf24', '#fef08a']
        });
      }, 550);
    },

    // ─── LEAD MODAL & BULK EXCEL IMPORT ───
    // ─── LEAD MODAL & BULK EXCEL IMPORT ───
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
      // Allow only digits and spaces, sanitize in real time
      this.leadFormPhoneRaw = (this.leadFormPhoneRaw || '').replace(/[^\d\s]/g, '');
      this.phoneTouched = true;
    },

    onEmailInput() {
      this.emailTouched = true;
    },

    onCountryChange() {
      this.phoneTouched = true;
    },

    openAddLeadModal() {
      this.isEditing = false;
      this.modalActiveTab = 'single';
      this.bulkPreviewLeads = [];
      this.bulkFileName = '';
      if (this.$refs.excelFileInput) {
        this.$refs.excelFileInput.value = '';
      }
      this.selectedCountryCode = '+91';
      this.leadFormPhoneRaw = '';
      this.emailTouched = false;
      this.phoneTouched = false;
      this.leadForm = {
        id: null,
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        service_required: 'Enterprise ERP / CRM',
        other_service: '',
        deal_value: '',
        status: 'New',
        notes: ''
      };
      this.showLeadModal = true;
    },

    openEditLeadModal(lead) {
      this.isEditing = true;
      this.modalActiveTab = 'single';
      this.emailTouched = false;
      this.phoneTouched = false;

      const parsed = parsePhoneString(lead.phone, this.countryList);
      this.selectedCountryCode = parsed.dialCode;
      this.leadFormPhoneRaw = parsed.rawNumber;

      const standardServices = [
        'Enterprise ERP / CRM',
        'Custom Web App Development',
        'Mobile App (iOS & Android)',
        'Cloud Migration & DevOps',
        'AI / Automation Solution',
        'Annual IT Support (AMC)',
        'Gym Management System',
        'School Management System',
        'Lead Management System',
        'Inventory Management System'
      ];
      const isStandard = standardServices.includes(lead.service_required);
      this.leadForm = {
        ...lead,
        service_required: isStandard ? (lead.service_required || 'Enterprise ERP / CRM') : 'Other',
        other_service: isStandard ? '' : (lead.service_required || '')
      };
      this.showLeadModal = true;
    },

    // ─── DEMO EXCEL TEMPLATE DOWNLOAD ───
    downloadDemoExcel() {
      const sampleData = [
        {
          'Company Name': 'Zenith Cloud Infotech',
          'Contact Person': 'Vikram Rathore (CTO)',
          'Phone': '+91 98765 12345',
          'Email': 'vikram@zenithcloud.com',
          'Service Required': 'Cloud Migration & DevOps',
          'Deal Value': 350000,
          'Stage': 'New',
          'Notes': 'Needs AWS containerization and multi-region database setup.'
        },
        {
          'Company Name': 'Nexus Retail Systems',
          'Contact Person': 'Pooja Hegde (Operations Head)',
          'Phone': '+91 98220 54321',
          'Email': 'pooja@nexusretail.in',
          'Service Required': 'Enterprise ERP / CRM',
          'Deal Value': 480000,
          'Stage': 'Contacted',
          'Notes': 'Interested in omnichannel inventory tracking and billing portal.'
        },
        {
          'Company Name': 'Apex Digital Systems',
          'Contact Person': 'Rohan Sharma (IT Director)',
          'Phone': '+91 98112 44556',
          'Email': 'rohan@apexdigital.io',
          'Service Required': 'Enterprise ERP / CRM',
          'Deal Value': 450000,
          'Stage': 'Quotation send',
          'Notes': 'Commercial quote and pricing proposal shared via email.'
        },
        {
          'Company Name': 'Optima Health Solutions',
          'Contact Person': 'Dr. Sanjay Sen (Medical Director)',
          'Phone': '+91 99112 33445',
          'Email': 'sanjay@optimahealth.org',
          'Service Required': 'Custom Web App Development',
          'Deal Value': 220000,
          'Stage': 'In Discussion',
          'Notes': 'Patient appointment scheduling and doctor teleconsultation system.'
        },
        {
          'Company Name': 'Aura Logistics India',
          'Contact Person': 'Manoj Verma (Supply Chain VP)',
          'Phone': '+91 97654 67890',
          'Email': 'manoj@auralogistics.com',
          'Service Required': 'Mobile App (iOS & Android)',
          'Deal Value': 300000,
          'Stage': 'Proposal Sent',
          'Notes': 'Driver tracking mobile app with real-time dispatch dashboard.'
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      worksheet['!cols'] = [
        { wch: 28 },
        { wch: 30 },
        { wch: 18 },
        { wch: 28 },
        { wch: 32 },
        { wch: 14 },
        { wch: 16 },
        { wch: 50 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'IT Sales Leads Template');
      XLSX.writeFile(workbook, 'IT_Sales_Leads_Demo_Template.xlsx');
      toastSuccess('Demo Excel template downloaded.');
    },

    // ─── EXCEL FILE UPLOAD & PARSING ───
    handleFileDrop(event) {
      const files = event.dataTransfer && event.dataTransfer.files;
      if (files && files.length > 0) {
        this.processExcelFile(files[0]);
      }
    },

    handleExcelUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (file) {
        this.processExcelFile(file);
      }
    },

    processExcelFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (!rawRows || rawRows.length === 0) {
            alert('The uploaded Excel file contains no data rows.');
            return;
          }

          const parsed = rawRows.map((row, idx) => {
            const getVal = (keys) => {
              for (const k of keys) {
                const foundKey = Object.keys(row).find(
                  rk => rk.trim().toLowerCase() === k.toLowerCase()
                );
                if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
                  return String(row[foundKey]).trim();
                }
              }
              return '';
            };

            const company = getVal(['Company Name', 'Company', 'Organization', 'Client Name', 'Client']);
            const contact = getVal(['Contact Person', 'Contact', 'Person', 'Name']);
            const phone = getVal(['Phone', 'Phone Number', 'Mobile', 'Contact No']);
            const email = getVal(['Email', 'Email Address', 'Mail']);
            const service = getVal(['Service Required', 'Service', 'Category', 'Requirement']) || 'Enterprise ERP / CRM';
            const dealValRaw = getVal(['Deal Value', 'Value', 'Estimated Value', 'Amount', 'Budget']);
            const dealValue = Number(String(dealValRaw).replace(/[^0-9.]/g, '')) || 0;
            let stage = getVal(['Stage', 'Status', 'Pipeline Stage']) || 'New';

            const matchedStage = this.statusOptions.find(
              s => s.toLowerCase() === stage.toLowerCase()
            );
            if (matchedStage) stage = matchedStage;
            else stage = 'New';

            const notes = getVal(['Notes', 'Note', 'Scope', 'Remarks', 'Initial Scope']);

            return {
              id: Date.now() + idx,
              company_name: company || `Lead Company ${idx + 1}`,
              contact_person: contact || 'Contact Person',
              phone,
              email,
              service_required: service,
              deal_value: dealValue,
              status: stage,
              notes,
              created_at: new Date().toISOString().split('T')[0]
            };
          });

          this.bulkPreviewLeads = parsed;
          this.bulkFileName = file.name;
          toastSuccess(`Loaded ${parsed.length} rows from ${file.name}`);
        } catch (err) {
          console.error('Error parsing Excel file:', err);
          alert('Could not parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
        }
      };
      reader.readAsArrayBuffer(file);
    },

    async confirmBulkImport() {
      if (!this.bulkPreviewLeads || this.bulkPreviewLeads.length === 0) return;

      this.isImportingBulk = true;
      try {
        const payload = {
          leads: this.bulkPreviewLeads,
          file_name: this.bulkFileName || 'Bulk Upload',
          created_by_id: String(this.currentUserId || ''),
          created_by_name: this.currentUserName,
          created_by_email: this.currentUser.email || ''
        };

        const res = await axios.post('/api/leads/bulk-import', payload);
        if (res.data && res.data.success) {
          toastSuccess(`Successfully imported ${res.data.imported_count || this.bulkPreviewLeads.length} leads into database.`);
          await this.loadLeads();

          this.bulkPreviewLeads = [];
          this.bulkFileName = '';
          if (this.$refs.excelFileInput) {
            this.$refs.excelFileInput.value = '';
          }
          this.showLeadModal = false;
          this.modalActiveTab = 'single';
        }
      } catch (err) {
        console.error('Failed to bulk import leads into database:', err);
        toastError('Bulk import failed: ' + (err.response?.data?.message || err.message));
      } finally {
        this.isImportingBulk = false;
      }
    },

    cancelBulkImport() {
      this.bulkPreviewLeads = [];
      this.bulkFileName = '';
      if (this.$refs.excelFileInput) {
        this.$refs.excelFileInput.value = '';
      }
    },

    async saveLead() {
      this.emailTouched = true;
      this.phoneTouched = true;

      if (!this.leadForm.company_name || !this.leadForm.company_name.trim()) {
        toastError('Please enter the Company / Organization name.');
        return;
      }
      if (!this.leadForm.contact_person || !this.leadForm.contact_person.trim()) {
        toastError('Please enter the Contact Person name.');
        return;
      }

      if (!this.emailValidation.isValid) {
        toastError(this.emailValidation.message || 'Please enter a valid email address.');
        return;
      }

      if (!this.phoneValidation.isValid) {
        toastError(this.phoneValidation.message || 'Please enter a valid mobile number.');
        return;
      }

      const digits = (this.leadFormPhoneRaw || '').replace(/\D/g, '');
      const finalPhone = digits ? `${this.selectedCountryCode} ${digits}` : '';

      const finalService = this.leadForm.service_required === 'Other'
        ? ((this.leadForm.other_service || '').trim() || 'Custom IT Service')
        : this.leadForm.service_required;

      const leadPayload = {
        ...this.leadForm,
        phone: finalPhone,
        service_required: finalService,
        deal_value: Number(this.leadForm.deal_value) || 0,
        created_by_id: String(this.currentUserId || ''),
        created_by_name: this.currentUserName,
        created_by_email: this.currentUser.email || '',
        user_name: this.currentUserName
      };
      delete leadPayload.other_service;

      this.isSaving = true;
      try {
        if (this.isEditing) {
          const res = await axios.put(`/api/leads/${this.leadForm.id}`, leadPayload);
          if (res.data && res.data.success && res.data.lead) {
            const updated = res.data.lead;
            const idx = this.leads.findIndex(l => l.id === this.leadForm.id);
            if (idx !== -1) {
              const prevStatus = this.leads[idx].status;
              this.leads[idx] = {
                ...updated,
                deal_value: Number(updated.deal_value) || 0,
                followups: Array.isArray(updated.followups) ? updated.followups : []
              };
              if (this.activeFollowupLead && this.activeFollowupLead.id === this.leadForm.id) {
                this.activeFollowupLead = { ...this.leads[idx] };
              }
              if (updated.status === 'Won' && prevStatus !== 'Won') {
                this.triggerCelebration(this.leads[idx]);
              }
            }
            toastSuccess('Lead updated successfully in database.');
          }
        } else {
          const res = await axios.post('/api/leads', leadPayload);
          if (res.data && res.data.success && res.data.lead) {
            const created = res.data.lead;
            const formattedLead = {
              ...created,
              deal_value: Number(created.deal_value) || 0,
              followups: Array.isArray(created.followups) ? created.followups : []
            };
            this.leads.unshift(formattedLead);
            toastSuccess('New IT Sales lead saved to database.');
            if (formattedLead.status === 'Won') {
              this.triggerCelebration(formattedLead);
            }
          }
        }

        this.saveLeadsLocal();
        this.showLeadModal = false;
      } catch (err) {
        console.error('Failed to save lead to database:', err);
        toastError('Failed to save lead: ' + (err.response?.data?.message || err.message));
      } finally {
        this.isSaving = false;
      }
    },

    async deleteLead(leadId) {
      if (confirm('Are you sure you want to delete this lead?')) {
        try {
          const res = await axios.delete(`/api/leads/${leadId}`);
          if (res.data && res.data.success) {
            this.leads = this.leads.filter(l => l.id !== leadId);
            this.saveLeadsLocal();
            if (this.activeFollowupLead && this.activeFollowupLead.id === leadId) {
              this.activeFollowupLead = null;
            }
            toastSuccess('Lead removed from database.');
          }
        } catch (err) {
          console.error('Failed to delete lead from database:', err);
          toastError('Failed to delete lead: ' + (err.response?.data?.message || err.message));
        }
      }
    },

    // ─── FOLLOW-UP NOTES & CALLS ───
    openLeadDetails(lead) {
      if (!lead) return;
      try {
        localStorage.setItem('active_lead_details', JSON.stringify(lead));
      } catch (e) {
        console.error('Failed to set active_lead_details in localStorage:', e);
      }
      const routeData = this.$router.resolve({
        path: '/employee/lead-details',
        query: { id: lead.id }
      });
      window.open(routeData.href, '_blank');
    },

    openFollowupModal(lead) {
      this.openLeadDetails(lead);
    },

    async submitFollowupNote() {
      if (!this.newFollowup.note.trim() || !this.activeFollowupLead) return;

      this.isSubmittingFollowup = true;
      try {
        const payload = {
          note: this.newFollowup.note.trim(),
          call_type: this.newFollowup.call_type,
          status: this.newFollowup.status,
          date: this.newFollowup.date || new Date().toISOString().slice(0, 16),
          logged_by: this.currentUserName
        };

        const res = await axios.post(`/api/leads/${this.activeFollowupLead.id}/followups`, payload);
        if (res.data && res.data.success && res.data.lead) {
          const updated = res.data.lead;
          const idx = this.leads.findIndex(l => l.id === this.activeFollowupLead.id);
          if (idx !== -1) {
            this.leads[idx] = {
              ...updated,
              deal_value: Number(updated.deal_value) || 0,
              followups: Array.isArray(updated.followups) ? updated.followups : []
            };
          }
          this.activeFollowupLead = {
            ...updated,
            deal_value: Number(updated.deal_value) || 0,
            followups: Array.isArray(updated.followups) ? updated.followups : []
          };
          this.saveLeadsLocal();

          const now = new Date();
          now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
          this.newFollowup.note = '';
          this.newFollowup.date = now.toISOString().slice(0, 16);

          toastSuccess('Activity note saved to database.');
        }
      } catch (err) {
        console.error('Failed to save follow-up to database:', err);
        toastError('Failed to save follow-up: ' + (err.response?.data?.message || err.message));
      } finally {
        this.isSubmittingFollowup = false;
      }
    },

    async deleteFollowupNote(target) {
      if (!this.activeFollowupLead) return;
      const targetId = typeof target === 'object' && target !== null ? target.id : target;
      if (!targetId) return;

      if (confirm('Delete this activity note from database?')) {
        try {
          const res = await axios.delete(`/api/leads/${this.activeFollowupLead.id}/followups/${targetId}`);
          if (res.data && res.data.success && res.data.lead) {
            const updated = res.data.lead;
            const idx = this.leads.findIndex(l => l.id === this.activeFollowupLead.id);
            if (idx !== -1) {
              this.leads[idx] = {
                ...updated,
                deal_value: Number(updated.deal_value) || 0,
                followups: Array.isArray(updated.followups) ? updated.followups : []
              };
            }
            this.activeFollowupLead = {
              ...updated,
              deal_value: Number(updated.deal_value) || 0,
              followups: Array.isArray(updated.followups) ? updated.followups : []
            };
            this.saveLeadsLocal();
            toastSuccess('Activity record removed.');
          }
        } catch (err) {
          console.error('Failed to delete follow-up note from database:', err);
          toastError('Failed to remove activity: ' + (err.response?.data?.message || err.message));
        }
      }
    },

    getTimelineIcon(callType) {
      switch (callType) {
        case 'Phone Call': return 'fas fa-phone-alt';
        case 'Video Meeting': return 'fas fa-video';
        case 'WhatsApp Discussion': return 'fab fa-whatsapp';
        case 'Client Office Visit': return 'fas fa-building';
        case 'Email Communication': return 'fas fa-envelope';
        case 'Pipeline Update': return 'fas fa-exchange-alt';
        case 'Excel Import': return 'fas fa-file-excel';
        case 'Lead Creation': return 'fas fa-plus-circle';
        default: return 'far fa-comment-dots';
      }
    },

    getTimelineBulletClass(callType) {
      switch (callType) {
        case 'Phone Call': return 'bullet-phone';
        case 'Video Meeting': return 'bullet-video';
        case 'WhatsApp Discussion': return 'bullet-whatsapp';
        case 'Client Office Visit': return 'bullet-visit';
        case 'Email Communication': return 'bullet-email';
        case 'Pipeline Update': return 'bullet-pipeline';
        default: return 'bullet-default';
      }
    },

    getOutcomeBadgeClass(status) {
      if (!status) return 'outcome-default';
      const s = status.toLowerCase();
      if (s.includes('won') || s.includes('confirmed') || s.includes('connected')) return 'outcome-success';
      if (s.includes('proposal') || s.includes('demo')) return 'outcome-primary';
      if (s.includes('scheduled') || s.includes('negotiation') || s.includes('progress')) return 'outcome-warning';
      if (s.includes('busy') || s.includes('later')) return 'outcome-neutral';
      if (s.includes('lost') || s.includes('not')) return 'outcome-danger';
      return 'outcome-default';
    },

    exportToCSV() {
      if (!this.scopedLeads.length) {
        alert('No leads available to export in current view.');
        return;
      }
      const headers = ['ID', 'Company', 'Contact Person', 'Email', 'Phone', 'Service', 'Value', 'Status', 'Owner / Rep', 'Total Followups', 'Last Note'];
      const rows = this.scopedLeads.map(l => {
        const lastNote = l.followups && l.followups.length ? l.followups[0].note : (l.notes || '');
        return [
          l.id,
          `"${(l.company_name || '').replace(/"/g, '""')}"`,
          `"${(l.contact_person || '').replace(/"/g, '""')}"`,
          l.email || '',
          l.phone || '',
          `"${(l.service_required || '').replace(/"/g, '""')}"`,
          l.deal_value || 0,
          l.status || '',
          `"${(l.created_by_name || 'Admin / Ownership').replace(/"/g, '""')}"`,
          (l.followups || []).length,
          `"${lastNote.replace(/"/g, '""')}"`
        ];
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `IT_Sales_Leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastSuccess('Leads exported to CSV.');
    },

    formatCurrency(val) {
      if (!val && val !== 0) return '₹0';
      return '₹' + Number(val).toLocaleString('en-IN');
    },

    formatDateShort(dateStr) {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      } catch (e) {
        return dateStr;
      }
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (e) {
        return dateStr;
      }
    },

    // ─── QUOTATIONS WORKSPACE METHODS ───
    openQuotationTab(lead) {
      if (!lead) return;
      localStorage.setItem('active_quotation_lead', JSON.stringify(lead));
      const routeData = this.$router.resolve({
        path: '/employee/client-quotations',
        query: {
          company: lead.company_name,
          contact: lead.contact_person,
          email: lead.email || '',
          phone: lead.phone || '',
          service: lead.service_required || '',
          deal_value: lead.deal_value || 0,
          lead_id: lead.id
        }
      });
      window.open(routeData.href, '_blank');
    },

    openQuotationModal(lead) {
      if (!lead) return;
      this.quotationLead = lead;
      this.showQuotationModal = true;
      this.quotationActiveTab = 'list';
      this.expandedQuoteId = null;
      this.fetchClientQuotations(lead.company_name);
    },

    async fetchClientQuotations(companyName) {
      if (!companyName) {
        this.clientQuotations = [];
        return;
      }
      this.isQuotationsLoading = true;
      try {
        const res = await axios.get('/api/it-quotations', {
          params: { search: companyName }
        });
        const allQuotes = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const lowerCompany = companyName.toLowerCase().trim();
        this.clientQuotations = allQuotes.filter(q => {
          const qCompany = (q.company_name || '').toLowerCase().trim();
          return qCompany.includes(lowerCompany) || lowerCompany.includes(qCompany);
        });
      } catch (err) {
        console.error('Failed to fetch client quotations:', err);
        this.clientQuotations = [];
      } finally {
        this.isQuotationsLoading = false;
      }
    },

    initNewQuotationForm() {
      this.editingQuotationId = null;
      this.quotationActiveTab = 'create';
      const today = new Date().toISOString().substring(0, 10);
      this.quotationForm = {
        nature_of_sale: 'Intrastate',
        date: today,
        customer_reference: this.quotationLead?.service_required || 'IT Software Development',
        currency: 'INR',
        payment_terms: '50% Advance with Purchase Order, 50% upon project delivery/handover.',
        delivery: 'Within 2 to 4 weeks from order confirmation.',
        terms_conditions: '1. Quotation is valid for 30 days from date of issue.\n2. Taxes applicable as per GST regulations.\n3. Software license & maintenance support as per agreed SLA.',
        items: [
          {
            description: this.quotationLead?.service_required || 'IT Solution Development & Deployment',
            qty: 1,
            rate: Number(this.quotationLead?.deal_value) || 0,
            gst_pct: 18
          }
        ]
      };
    },

    editClientQuotation(q) {
      if (!q) return;
      this.editingQuotationId = q.id;
      this.quotationActiveTab = 'create';

      const items = this.parseQuoteItems(q.items);
      const formattedItems = (items && items.length > 0)
        ? items.map(it => {
            const qty = Number(it.qty) || 1;
            const rate = Number(it.rate) || 0;
            const gst_pct = Number(it.gst_pct || it.igst_pct || (Number(it.cgst_pct || 0) * 2) || 18);
            return {
              description: it.item_name || it.description || '',
              qty: qty,
              rate: rate,
              gst_pct: gst_pct
            };
          })
        : [
            {
              description: q.customer_reference || 'IT Solution / Service',
              qty: 1,
              rate: Number(q.subtotal || q.grand_total) || 0,
              gst_pct: 18
            }
          ];

      this.quotationForm = {
        nature_of_sale: q.nature_of_sale || 'Intrastate',
        date: q.date ? q.date.substring(0, 10) : (q.created_at ? q.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10)),
        customer_reference: q.customer_reference || '',
        currency: q.currency || 'INR',
        payment_terms: q.payment_terms || '50% Advance with Purchase Order, 50% upon delivery/handover.',
        delivery: q.delivery || 'Within 2 to 4 weeks from order confirmation.',
        terms_conditions: q.terms_conditions || '1. Quotation is valid for 30 days from date of issue.\n2. Taxes as applicable.\n3. Software license & maintenance support as per SLA agreement.',
        items: formattedItems
      };
    },

    cancelQuotationEdit() {
      this.editingQuotationId = null;
      this.quotationActiveTab = 'list';
    },

    addQuotationItem() {
      this.quotationForm.items.push({
        description: '',
        qty: 1,
        rate: 0,
        gst_pct: 18
      });
    },

    removeQuotationItem(index) {
      if (this.quotationForm.items.length > 1) {
        this.quotationForm.items.splice(index, 1);
      }
    },

    getItemLineTotal(item) {
      const taxable = Number(item.qty || 0) * Number(item.rate || 0);
      const taxRate = this.quotationForm.nature_of_sale === 'Export' ? 0 : (Number(item.gst_pct || 0) / 100);
      return taxable + (taxable * taxRate);
    },

    parseQuoteItems(items) {
      if (!items) return [];
      if (Array.isArray(items)) return items;
      if (typeof items === 'string') {
        try {
          return JSON.parse(items);
        } catch (e) {
          return [];
        }
      }
      return [];
    },

    getQuoteItemsPreview(q) {
      const items = this.parseQuoteItems(q.items);
      if (!items || items.length === 0) return q.customer_reference || q.notes || 'IT Services';
      return items.map(it => it.item_name || it.description || 'Item').filter(Boolean).join(', ');
    },

    getQuotationStatusClass(q) {
      const s = (q.quotation_followup_status || q.status || '').toLowerCase();
      if (s.includes('approve') || s.includes('won') || s.includes('accepted')) return 'status-won';
      if (s.includes('reject') || s.includes('lost')) return 'status-lost';
      return 'status-pending';
    },

    toggleQuoteDetails(id) {
      this.expandedQuoteId = this.expandedQuoteId === id ? null : id;
    },

    openOfficialQuotationView(q) {
      if (q && q.id) {
        localStorage.setItem('selectedQuotationId', q.id);
        localStorage.setItem('selectedQuotationType', 'it');
        window.open(`/quotation?id=${encodeURIComponent(q.id)}&type=it`, '_blank');
      } else {
        localStorage.setItem('selectedQuotationType', 'it');
        window.open('/quotation?type=it', '_blank');
      }
    },

    async deleteQuotationItem(id) {
      if (!confirm('Are you sure you want to delete this quotation?')) return;
      try {
        await axios.delete(`/api/it-quotations/${id}`);
        this.clientQuotations = this.clientQuotations.filter(q => q.id !== id);
        toastSuccess('Quotation deleted successfully.');
      } catch (err) {
        console.error('Failed to delete quotation:', err);
        toastError('Failed to delete quotation.');
      }
    },

    async submitQuotationForm() {
      this.isSavingQuotation = true;
      try {
        const existingQuote = this.editingQuotationId ? this.clientQuotations.find(q => q.id === this.editingQuotationId) : null;
        const quoteNo = existingQuote?.quote_no || `AE/IT-QT/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
        const payload = {
          lead_id: this.quotationLead?.id || null,
          status: 'Quotation send',
          nature_of_sale: this.quotationForm.nature_of_sale,
          company_name: this.quotationLead.company_name,
          customer_reference: this.quotationForm.customer_reference,
          payment_terms: this.quotationForm.payment_terms,
          delivery: this.quotationForm.delivery,
          recommended_by: this.currentUserName,
          created_by: this.currentUserName,
          terms_conditions: this.quotationForm.terms_conditions,
          currency: this.quotationForm.currency,
          subtotal: this.computedQuotationSubtotal,
          tax_total: this.computedQuotationTax,
          grand_total: this.computedQuotationGrandTotal,
          amount_words: this.numberToWordsRupees(this.computedQuotationGrandTotal),
          quote_no: quoteNo,
          date: this.quotationForm.date,
          bill_to: {
            company: this.quotationLead.company_name,
            contact: this.quotationLead.contact_person,
            email: this.quotationLead.email,
            phone: this.quotationLead.phone
          },
          ship_to: {
            company: this.quotationLead.company_name,
            contact: this.quotationLead.contact_person,
            email: this.quotationLead.email,
            phone: this.quotationLead.phone
          },
          items: this.quotationForm.items.map(it => {
            const taxable = Number(it.qty) * Number(it.rate);
            const taxRate = Number(it.gst_pct) || 0;
            const taxAmt = taxable * (taxRate / 100);
            return {
              item_name: it.description,
              description: it.description,
              qty: it.qty,
              rate: it.rate,
              taxable: taxable.toFixed(2),
              cgst_pct: this.quotationForm.nature_of_sale === 'Intrastate' ? taxRate / 2 : 0,
              cgst_amt: this.quotationForm.nature_of_sale === 'Intrastate' ? (taxAmt / 2).toFixed(2) : 0,
              sgst_pct: this.quotationForm.nature_of_sale === 'Intrastate' ? taxRate / 2 : 0,
              sgst_amt: this.quotationForm.nature_of_sale === 'Intrastate' ? (taxAmt / 2).toFixed(2) : 0,
              igst_pct: this.quotationForm.nature_of_sale === 'Interstate' ? taxRate : 0,
              igst_amt: this.quotationForm.nature_of_sale === 'Interstate' ? taxAmt.toFixed(2) : 0,
              line_total: (taxable + taxAmt).toFixed(2)
            };
          })
        };

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        if (this.editingQuotationId) {
          // UPDATE EXISTING QUOTATION
          const res = await axios.put(`/api/it-quotations/${this.editingQuotationId}`, payload, { headers });
          const updatedQuotation = res.data?.data || res.data || { ...payload, id: this.editingQuotationId };
          const idx = this.clientQuotations.findIndex(q => q.id === this.editingQuotationId);
          if (idx !== -1) {
            this.clientQuotations.splice(idx, 1, updatedQuotation);
          }
          toastSuccess(`Quotation ${quoteNo} updated successfully!`);
          this.editingQuotationId = null;
        } else {
          // CREATE NEW QUOTATION
          const res = await axios.post('/api/it-quotations', payload, { headers });
          const savedQuotation = res.data?.data || res.data || { ...payload, id: Date.now() };

          this.clientQuotations.unshift(savedQuotation);

          // Auto log follow-up activity note in lead
          if (this.activeFollowupLead) {
            try {
              const noteText = `Quotation ${quoteNo} generated for ${this.formatCurrency(this.computedQuotationGrandTotal)} (${this.quotationForm.customer_reference || this.activeFollowupLead.service_required}).`;
              const actPayload = {
                note: noteText,
                call_type: 'Email',
                status: 'Quotation send',
                date: new Date().toISOString().slice(0, 16),
                logged_by: this.currentUserName
              };
              const folRes = await axios.post(`/api/leads/${this.activeFollowupLead.id}/followups`, actPayload);
              if (folRes.data && folRes.data.success && folRes.data.lead) {
                const updated = folRes.data.lead;
                const idx = this.leads.findIndex(l => l.id === this.activeFollowupLead.id);
                if (idx !== -1) {
                  this.leads[idx] = {
                    ...updated,
                    deal_value: Number(updated.deal_value) || 0,
                    followups: Array.isArray(updated.followups) ? updated.followups : []
                  };
                }
                this.activeFollowupLead = {
                  ...updated,
                  deal_value: Number(updated.deal_value) || 0,
                  followups: Array.isArray(updated.followups) ? updated.followups : []
                };
                this.saveLeadsLocal();
              }

              // Update pipeline status to 'Quotation send' if New or Contacted
              if (['New', 'Contacted'].includes(this.activeFollowupLead.status)) {
                await this.updateLeadStatus(this.activeFollowupLead.id, 'Quotation send');
              }
            } catch (logErr) {
              console.error('Failed to auto-log quotation to lead followups:', logErr);
            }
          }

          toastSuccess(`Quotation ${quoteNo} created and saved successfully!`);
        }

        this.quotationActiveTab = 'list';
      } catch (err) {
        console.error('Failed to save quotation:', err);
        toastWarning('Failed to save quotation.');
      } finally {
        this.isSavingQuotation = false;
      }
    },

    numberToWordsRupees(num) {
      const n = Math.round(Number(num) || 0);
      if (n === 0) return 'Zero Rupees Only';
      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      const inWords = (val) => {
        let str = '';
        if (val > 19) {
          str += b[Math.floor(val / 10)] + (val % 10 ? ' ' + a[val % 10] : '');
        } else {
          str += a[val];
        }
        return str;
      };

      let str = '';
      const crore = Math.floor(n / 10000000);
      const lakh = Math.floor((n % 10000000) / 100000);
      const thousand = Math.floor((n % 100000) / 1000);
      const hundred = Math.floor((n % 1000) / 100);
      const rest = Math.floor(n % 100);

      if (crore > 0) str += inWords(crore) + ' Crore ';
      if (lakh > 0) str += inWords(lakh) + ' Lakh ';
      if (thousand > 0) str += inWords(thousand) + ' Thousand ';
      if (hundred > 0) str += inWords(hundred) + ' Hundred ';
      if (rest > 0) str += (str !== '' ? 'and ' : '') + inWords(rest) + ' ';

      return (str.trim() + ' Rupees Only');
    },

    formatDate(dateVal) {
      if (!dateVal) return '-';
      try {
        const d = new Date(dateVal);
        return d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch (e) {
        return dateVal;
      }
    }
  }
};
</script>

<style scoped>
/* ─── RESET & BASE CONTAINER (FRESH NAVY BLUE PALETTE) ─── */
.crm-page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f1f5f9;
  background-image:
    radial-gradient(circle at 12% 0%, rgba(219, 234, 254, 0.7) 0%, transparent 45%),
    radial-gradient(circle at 88% 8%, rgba(199, 210, 254, 0.45) 0%, transparent 50%),
    radial-gradient(circle at 50% 100%, rgba(224, 231, 255, 0.4) 0%, transparent 60%);
  color: #0f172a;
  padding: 1.5rem 2rem;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─── TOP EXECUTIVE BREADCRUMB / ACTION BAR ─── */
.crm-nav-subbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-bottom: 0.85rem;
}

.nav-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #1e3a8a;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  transition: all 0.18s ease;
}

.nav-back-link:hover {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
  transform: translateX(-2px);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
}

.nav-scope-tags {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pipeline-badge {
  background: #0f172a;
  color: #f8fafc;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  border-radius: 6px;
  letter-spacing: 0.04em;
  border: 1px solid #334155;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

.scope-indicator-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.22rem 0.75rem;
  border-radius: 999px;
}

.scope-indicator-badge.owner {
  background: #fefce8;
  color: #854d0e;
  border: 1px solid #fef08a;
}

.scope-indicator-badge.it-lead {
  background: #faf5ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

.scope-indicator-badge.member {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  font-weight: 600;
}

.nav-extra-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.btn-subbar-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  transition: all 0.15s ease;
}

.btn-subbar-ghost:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #1e3a8a;
  color: #1e3a8a;
}

.btn-subbar-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-subbar-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.48rem 1.15rem;
  background: linear-gradient(135deg, #0b192c 0%, #1e3e62 60%, #1e40af 100%);
  border: 1px solid #1e3e62;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(11, 25, 44, 0.3);
  transition: all 0.15s ease;
}

.btn-subbar-primary:hover {
  background: linear-gradient(135deg, #001f3f 0%, #1e3a8a 100%);
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(30, 58, 138, 0.4);
}

/* ════════ 🌟 TOP FILTER BAR: SUPER ADMIN VIEW FILTER (OWNER & IT LEAD ONLY) ════════ */
.super-admin-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.7rem 1.25rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-bar-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.filter-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1e3a8a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(30, 58, 138, 0.25);
}

.filter-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.filter-subtitle {
  font-size: 0.68rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.filter-main-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.filter-bar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sales-person-select {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.42rem 1.75rem 0.42rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: all 0.15s ease;
  appearance: auto;
}

.sales-person-select:hover,
.sales-person-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.filter-reset-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-reset-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* ════════ 🛠️ PIPELINE CONTROLS TOOLBAR (EXECUTIVE NAVY BLUE) ════════ */
.pipeline-controls-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0b192c 0%, #1e3e62 55%, #001f3f 100%);
  border: 1px solid #1e3e62;
  border-radius: 14px;
  padding: 0.85rem 1.25rem;
  margin-top: 0.85rem;
  margin-bottom: 1.35rem;
  box-shadow: 0 6px 20px -3px rgba(11, 25, 44, 0.28), 0 2px 6px -1px rgba(11, 25, 44, 0.15);
  gap: 1.25rem;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-shrink: 0;
}

.toolbar-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  color: #93c5fd;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.toolbar-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.toolbar-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.toolbar-desc {
  font-size: 0.75rem;
  color: #cbd5e1;
  font-weight: 400;
}

.toolbar-search-wrap {
  position: relative;
  flex: 1;
  max-width: 480px;
  min-width: 240px;
}

.toolbar-search-wrap .search-icon {
  position: absolute;
  left: 1.05rem;
  top: 50%;
  transform: translateY(-50%);
  color: #93c5fd;
  font-size: 0.85rem;
  pointer-events: none;
}

.toolbar-search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.12);
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  border-radius: 9999px;
  padding: 0.48rem 2.2rem 0.48rem 2.55rem;
  font-size: 0.84rem;
  color: #ffffff;
  outline: none;
  box-sizing: border-box;
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.18s ease;
}

.toolbar-search-input:focus {
  background: rgba(255, 255, 255, 0.2);
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.25), inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar-search-input::placeholder {
  color: #cbd5e1;
  font-size: 0.82rem;
}

.clear-search-btn {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search-btn:hover {
  color: #ffffff;
}

.toolbar-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.btn-add-section {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.48rem 1.15rem;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border: 1px solid #38bdf8;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
  transition: all 0.15s ease;
}

.btn-add-section:hover {
  background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(37, 99, 235, 0.45);
}

/* ════════ 📦 KANBAN PIPELINE BOARD ════════ */
.pipeline-board-container {
  position: relative;
  width: 100%;
}

.kanban-scroller-outer {
  position: relative;
  width: 100%;
}

.floating-pipeline-arrow {
  position: absolute;
  top: 14px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 25;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.12);
  transition: all 0.18s ease;
}

.floating-pipeline-arrow:hover {
  background: #1e293b;
  border-color: #1e293b;
  color: #ffffff;
  transform: scale(1.06);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
}

.floating-pipeline-arrow.arrow-left {
  left: -10px;
}

.floating-pipeline-arrow.arrow-right {
  right: -10px;
}

.kanban-scroller {
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f5f9;
}

.kanban-scroller::-webkit-scrollbar {
  height: 8px;
}

.kanban-scroller::-webkit-scrollbar-track {
  background: #e2e8f0;
  border-radius: 6px;
}

.kanban-scroller::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 6px;
}

.kanban-scroller::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.kanban-board-row {
  display: flex;
  gap: 1.15rem;
  align-items: stretch;
  min-width: min-content;
}

/* ════════ 🏛️ KANBAN COLUMN (CRISP NAVY-TINTED CONTAINER) ════════ */
.kanban-column {
  flex: 0 0 276px;
  width: 276px;
  min-width: 276px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 250px);
  min-height: 580px;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
  transition: background 0.18s ease, border-color 0.18s ease;
}

.kanban-column.column-drag-target {
  background: #dbeafe;
  border: 2px dashed #2563eb;
}

/* Column Header */
.kanban-column-header {
  background: #ffffff;
  border-radius: 12px 12px 0 0;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 46px;
  box-sizing: border-box;
}

.kanban-col-left {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow: hidden;
}

.kanban-col-right {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
}

.kanban-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  margin: 0 3px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
}

.kanban-col-title {
  font-size: 0.84rem;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.kanban-count-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  padding: 0.08rem 0.48rem;
  min-width: 18px;
  text-align: center;
}

.column-nav-arrow {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.72rem;
  cursor: pointer;
  padding: 2px 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.column-nav-arrow:hover:not(:disabled) {
  color: #0f172a;
}

.column-nav-arrow:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.column-tool-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 2px 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.column-tool-btn:hover {
  color: #2563eb;
}

.column-tool-btn.btn-trash:hover {
  color: #dc2626;
}

/* Column Cards List */
.kanban-column-cards {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.kanban-column-cards::-webkit-scrollbar {
  width: 5px;
}

.kanban-column-cards::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

/* ════════ 🗂️ DEAL CARD (CRISP WHITE ON FRESH NAVY ACCENTS) ════════ */
.kanban-card {
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 11px;
  padding: 0.9rem 1rem;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03);
  cursor: grab;
  user-select: none;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.kanban-card:hover {
  transform: translateY(-2px);
  border-color: #3b82f6;
  box-shadow: 0 8px 20px -3px rgba(30, 58, 138, 0.12), 0 3px 6px -2px rgba(30, 58, 138, 0.06);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card.is-dragging {
  opacity: 0.45;
  border-style: dashed;
  border-color: #2563eb;
}

/* Card Header: Company Name & Three Dots */
.card-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.lead-company-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 195px;
  letter-spacing: -0.01em;
}

.card-menu-container {
  position: relative;
  flex-shrink: 0;
}

.card-dots-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.card-dots-btn:hover {
  background: #0f2744;
  color: #ffffff;
  border-color: #0f2744;
}

.card-dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(11, 25, 44, 0.18), 0 4px 8px -2px rgba(11, 25, 44, 0.08);
  min-width: 180px;
  z-index: 100;
  padding: 0.35rem 0;
  overflow: hidden;
}

.dropdown-opt {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
}

.dropdown-opt:hover {
  background: #f0f7ff;
  color: #0284c7;
}

.dropdown-opt.opt-delete {
  color: #dc2626;
}

.dropdown-opt.opt-delete:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.dropdown-sep {
  height: 1px;
  background: #e2e8f0;
  margin: 0.25rem 0;
}

/* Card Row 2: Source / Service Requirement with Cube Icon */
.card-source-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.45rem;
  margin-bottom: 0.85rem;
  font-size: 0.76rem;
  color: #475569;
}

.card-source-icon {
  color: #2563eb;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.card-source-text {
  font-weight: 500;
  color: #1e3a8a;
  background: #f0f7ff;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #dbeafe;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Card Row 3: Footer with User Avatar + @username and Date */
.card-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.65rem;
}

.card-user-info {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.card-avatar-img {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #bfdbfe;
  flex-shrink: 0;
}

.card-username-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: #1d4ed8;
}

.card-date-info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 400;
}

.card-date-info i {
  font-size: 0.72rem;
}

/* ════════ 📭 EMPTY COLUMN DROP BOX (FRESH NAVY BORDER & ACCENTS) ════════ */
.kanban-empty-column {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
}

.empty-drop-box {
  width: 100%;
  box-sizing: border-box;
  padding: 1.35rem 0.75rem;
  text-align: center;
  border: 1.5px dashed #cbd5e1;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.18s ease;
}

.empty-drop-box:hover {
  background: #ffffff;
  border-color: #94a3b8;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
}

.empty-box-icon {
  font-size: 1.25rem;
  color: #94a3b8;
  margin-bottom: 0.15rem;
}

.empty-box-title {
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
}

.empty-box-hint {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 400;
}

/* ════════ ⚙️ SECTION MANAGEMENT MODALS ════════ */
.section-config-modal {
  max-width: 460px;
}

.color-preset-picker {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.color-preset-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #cbd5e1;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.color-preset-circle:hover {
  transform: scale(1.15);
}

.color-preset-circle.active {
  transform: scale(1.15);
  box-shadow: 0 0 0 2px #0f172a;
}

.custom-color-input {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

.delete-warning-banner {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 0.75rem 0.95rem;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  color: #92400e;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}

.delete-warning-banner i {
  color: #f59e0b;
  margin-top: 0.15rem;
}

.modal-actions-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel:hover {
  background: #f8fafc;
  color: #0f172a;
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1.15rem;
  background: #0284c7;
  border: 1px solid #0284c7;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.25);
  transition: all 0.15s ease;
}

.btn-submit:hover {
  background: #0369a1;
  border-color: #0369a1;
}

.btn-submit.btn-danger {
  background: #dc2626;
  border-color: #dc2626;
  box-shadow: 0 1px 3px rgba(220, 38, 38, 0.25);
}

.btn-submit.btn-danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.modal-icon-badge.red-badge {
  background: #fee2e2;
  color: #dc2626;
}

.modal-icon-badge.blue-badge {
  background: #e0f2fe;
  color: #0284c7;
}

/* Animations */
.fadeIn {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.slideUp {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.crm-deal-card:hover {
  transform: translateY(-2px);
  border-color: #93c5fd;
  box-shadow: 0 8px 18px -2px rgba(15, 23, 42, 0.08), 0 3px 6px -2px rgba(15, 23, 42, 0.04);
}

.crm-deal-card:hover .deal-company {
  color: #0284c7;
}

.crm-deal-card:active {
  cursor: grabbing;
}

.crm-deal-card.card-being-dragged {
  opacity: 0.4;
  border: 1.5px dashed #0284c7;
}

.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.card-pills-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.deal-amount {
  font-size: 0.82rem;
  font-weight: 600;
  color: #047857;
  background: #ecfdf5;
  padding: 0.18rem 0.55rem;
  border-radius: 6px;
  border: 1px solid #a7f3d0;
  letter-spacing: -0.01em;
}

.deal-service-pill {
  display: inline-block;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.18rem 0.5rem;
  border-radius: 6px;
}

.deal-owner-pill {
  font-size: 0.68rem;
  font-weight: 500;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.deal-company {
  font-size: 0.94rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0.4rem 0 0.25rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
  transition: color 0.15s;
}

.deal-contact-line {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.65rem;
}

.deal-contact-line i {
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Recent Interaction Snippet */
.recent-interaction-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #0284c7;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  margin-bottom: 0.7rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
}

.interaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  margin-bottom: 0.2rem;
}

.interaction-user {
  font-weight: 600;
  color: #1e293b;
}

.interaction-date {
  color: #94a3b8;
  font-size: 0.68rem;
}

.interaction-preview {
  font-size: 0.74rem;
  color: #475569;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card Action Footer */
.card-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.65rem;
}

.btn-interaction-count {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  transition: all 0.15s;
}

.btn-interaction-count:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

.stage-stepper-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stepper-arrow-btn {
  width: 24px;
  height: 24px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #64748b;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.stepper-arrow-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.stepper-arrow-btn:not(:disabled):hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

.stage-quick-select {
  font-size: 0.72rem;
  font-weight: 600;
  color: #334155;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.2rem 0.45rem;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.stage-quick-select:focus {
  border-color: #0284c7;
}

/* Drop Placeholder */
.column-drop-placeholder {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

.drop-dashed-box {
  width: 100%;
  padding: 2rem 1rem;
  text-align: center;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.drop-dashed-box:hover {
  border-color: #0284c7;
  background: #f0f9ff;
}

.drop-icon-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.95rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}

.drop-text-primary {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}

.drop-text-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
}

/* ════════ MODAL COMMON ════════ */
.crm-modal-backdrop {
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

/* Ensure Edit / Create Lead modal is always in front of the details / interaction modal */
.crm-modal-backdrop.lead-form-modal-backdrop {
  z-index: 10050;
}

.crm-modal-box {
  background: #ffffff;
  border-radius: 14px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.modal-wide {
  max-width: 760px;
}

.crm-modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modal-icon-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.company-logo-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #0f172a;
  color: #ffffff;
  font-weight: 800;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title-group h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.modal-desc {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0.15rem 0 0;
}

.phone-link {
  color: #0284c7;
  text-decoration: none;
}

.phone-link:hover {
  text-decoration: underline;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.btn-subtle {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-subtle:hover {
  background: #e2e8f0;
}

.modal-x-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
}

.modal-x-btn:hover {
  color: #0f172a;
}

.crm-modal-form {
  padding: 1.25rem 1.5rem;
}

.modal-content-split {
  padding: 1.25rem 1.5rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.input-block {
  margin-bottom: 0.85rem;
}

.input-block label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.3rem;
}

.required {
  color: #dc2626;
}

.crm-input,
.crm-select,
.crm-textarea {
  width: 100%;
  padding: 0.55rem 0.8rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.86rem;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.15s;
}

.crm-input:focus,
.crm-select:focus,
.crm-textarea:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
}

.crm-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

.btn-flat {
  padding: 0.55rem 1rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-flat:hover {
  background: #f1f5f9;
}

.btn-danger-subtle {
  margin-right: auto;
  padding: 0.55rem 0.85rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger-subtle:hover {
  background: #fee2e2;
}

/* ════════ REAL-TIME TODAY'S REPORT BUTTONS & MODAL ════════ */
.btn-subbar-report,
.btn-toolbar-report {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.95rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border: 1px solid #1d4ed8;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
  position: relative;
}

.btn-subbar-report:hover,
.btn-toolbar-report:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.report-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulseGreen 1.8s infinite;
}

@keyframes pulseGreen {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Modal Backdrop & Window */
.daily-report-backdrop {
  background: rgba(15, 23, 42, 0.7) !important;
  backdrop-filter: blur(8px) !important;
  z-index: 10060 !important;
  padding: 1.5rem !important;
}

.daily-report-modal-box {
  width: 100%;
  max-width: 980px !important;
  max-height: 92vh;
  background: #ffffff;
  border-radius: 20px !important;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 65px -15px rgba(15, 23, 42, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: reportModalPop 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes reportModalPop {
  0% { opacity: 0; transform: scale(0.95) translateY(12px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

/* Header */
.daily-report-header {
  padding: 1.25rem 1.75rem;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.report-header-left {
  display: flex;
  align-items: center;
  gap: 0.95rem;
}

.report-icon-badge {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  flex-shrink: 0;
}

.report-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.report-title-row h3 {
  font-size: 1.22rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.015em;
}

.report-live-pulse-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  letter-spacing: 0.04em;
}

.report-live-pulse-pill .live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulseGreen 1.8s infinite;
}

.report-meta-desc {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0.2rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.report-meta-sep {
  color: #cbd5e1;
}

.report-header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.report-user-filter-box {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.4rem 0.65rem;
}

.report-select-filter {
  border: none;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  outline: none;
  cursor: pointer;
}

.btn-report-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.95rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-report-refresh:hover:not(:disabled) {
  background: #dcfce7;
  border-color: #86efac;
}

/* 4 Core Performance KPI Cards */
.report-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1.25rem 1.75rem 0.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.report-kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.report-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  border-color: #cbd5e1;
}

.report-kpi-card.active {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15), 0 6px 14px rgba(37, 99, 235, 0.1);
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.kpi-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.04em;
}

.kpi-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.leads-bg { background: #dbeafe; color: #1e40af; }
.followups-bg { background: #ede9fe; color: #6d28d9; }
.quotes-bg { background: #fef3c7; color: #b45309; }
.po-bg { background: #dcfce7; color: #15803d; }

.kpi-val {
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.kpi-sub {
  margin-top: 0.45rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.74rem;
  color: #64748b;
}

.kpi-tag-pill {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
}

.kpi-tag-pill.blue { background: #eff6ff; color: #1e40af; }
.kpi-tag-pill.purple { background: #f5f3ff; color: #6d28d9; }
.kpi-tag-pill.amber { background: #fffbeb; color: #b45309; }
.kpi-tag-pill.emerald { background: #ecfdf5; color: #047857; font-weight: 700; }

/* Same-day celebration strip */
.same-day-celebration-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.75rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-bottom: 1px solid #bbf7d0;
  gap: 1rem;
}

.same-day-strip-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.82rem;
  color: #14532d;
}

.lightning-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #16a34a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3);
}

.lightning-pill {
  font-size: 0.72rem;
  font-weight: 700;
  background: #ffffff;
  color: #15803d;
  border: 1px solid #86efac;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  white-space: nowrap;
}

/* Drilldown Tabs */
.report-nav-tabs {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1.75rem;
  gap: 0.5rem;
  overflow-x: auto;
}

.report-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.85rem 0.95rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.report-nav-btn:hover {
  color: #0f172a;
}

.report-nav-btn.active {
  color: #1e40af;
  border-bottom-color: #2563eb;
}

.text-blue { color: #2563eb; }
.text-purple { color: #8b5cf6; }
.text-amber { color: #d97706; }

/* Report Body */
.report-body-container {
  flex: 1;
  overflow-y: auto;
  max-height: 48vh;
  padding: 1.25rem 1.75rem;
  background: #ffffff;
}

.report-empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #64748b;
}

.report-empty-state .empty-icon {
  font-size: 2.5rem;
  color: #cbd5e1;
  margin-bottom: 0.75rem;
}

.report-empty-state h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 0.25rem;
}

.report-empty-state p {
  font-size: 0.82rem;
  color: #94a3b8;
  max-width: 420px;
  margin: 0 auto;
}

/* Live Feed Stream */
.report-timeline-stream {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.feed-event-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.15s ease;
}

.feed-event-item:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
}

.feed-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.feed-content {
  flex: 1;
}

.feed-top-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.feed-title {
  font-size: 0.86rem;
  font-weight: 700;
  color: #0f172a;
}

.feed-time {
  font-size: 0.74rem;
  color: #64748b;
}

.feed-desc {
  font-size: 0.8rem;
  color: #334155;
  margin: 0 0 0.35rem;
  line-height: 1.4;
}

.feed-meta-line {
  font-size: 0.74rem;
  color: #64748b;
}

/* Report Data Tables */
.report-table-wrap {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.report-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  text-align: left;
}

.report-data-table thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.report-data-table th {
  padding: 0.75rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.report-data-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.report-data-table tbody tr:hover {
  background: #f8fafc;
}

.table-company-cell {
  display: flex;
  flex-direction: column;
}

.company-name-bold {
  font-weight: 700;
  color: #0f172a;
}

.company-notes-sub {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.table-remarks-text {
  margin: 0;
  font-size: 0.8rem;
  color: #334155;
  max-width: 320px;
  line-height: 1.35;
}

.service-pill-tag {
  display: inline-block;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.74rem;
  color: #334155;
}

.call-type-badge {
  display: inline-block;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  color: #6d28d9;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
}

.status-badge-compact {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
}

.status-badge-compact.quote {
  background: #fef3c7;
  color: #b45309;
  border-color: #fde68a;
}

.same-day-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.standard-turnaround-pill {
  display: inline-block;
  background: #f1f5f9;
  color: #64748b;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
}

.font-lg {
  font-size: 0.95rem;
}

/* Footer */
.daily-report-footer {
  padding: 1rem 1.75rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.report-footer-summary {
  font-size: 0.8rem;
  color: #475569;
}

.report-footer-summary strong {
  color: #0f172a;
}

.report-footer-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.btn-report-close {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.35rem;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-report-close:hover {
  background: #1e293b;
}

@media (max-width: 900px) {
  .report-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ════════ MODERN HIGH-END LEAD FORM MODAL ════════ */
.lead-form-modal-backdrop {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(8px) !important;
  z-index: 10050 !important;
}

.lead-form-modal-backdrop .crm-modal-box {
  max-width: 660px;
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  background: #ffffff;
  overflow: hidden;
  animation: leadModalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes leadModalPop {
  0% { opacity: 0; transform: scale(0.96) translateY(8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.lead-form-modal-backdrop .crm-modal-header {
  padding: 1.25rem 1.65rem;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.lead-form-modal-backdrop .modal-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #2563eb;
  font-size: 1.15rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15);
  border: 1px solid #bfdbfe;
}

.lead-form-modal-backdrop .modal-title-group h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.015em;
  margin: 0;
}

.lead-form-modal-backdrop .modal-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.lead-form-modal-backdrop .modal-x-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lead-form-modal-backdrop .modal-x-btn:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #ef4444;
}

.lead-form-modal-backdrop .modal-tab-bar {
  display: flex;
  background: #f1f5f9;
  padding: 0.45rem 1.65rem;
  border-bottom: 1px solid #e2e8f0;
  gap: 0.65rem;
}

.lead-form-modal-backdrop .modal-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lead-form-modal-backdrop .modal-tab-btn:hover {
  color: #0f172a;
}

.lead-form-modal-backdrop .modal-tab-btn.active {
  background: #ffffff;
  color: #1e40af;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
}

.lead-form-modal-backdrop .crm-modal-form {
  padding: 1.45rem 1.65rem;
  max-height: calc(88vh - 160px);
  overflow-y: auto;
}

.text-blue-muted {
  color: #3b82f6;
  margin-right: 0.25rem;
  font-size: 0.78rem;
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
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.phone-combo-input:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
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
  padding: 0.65rem 1.85rem 0.65rem 0.85rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  outline: none;
  max-width: 155px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.country-caret {
  position: absolute;
  right: 0.65rem;
  font-size: 0.68rem;
  color: #64748b;
  pointer-events: none;
}

.phone-national-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.65rem 0.85rem;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  font-family: inherit;
}

.phone-national-input::placeholder {
  color: #94a3b8;
}

/* Email Input with Icon Wrap */
.input-with-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon-wrap .email-field-input {
  padding-right: 2.3rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.input-with-icon-wrap.has-error .crm-input {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
}

.input-with-icon-wrap.has-success .crm-input {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
}

.validation-status-icon {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
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
  margin-top: 0.35rem;
  min-height: 18px;
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

/* Select Caret Wrap */
.select-wrap-custom {
  position: relative;
  display: flex;
  align-items: center;
}

.select-wrap-custom .crm-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2.2rem;
  cursor: pointer;
}

.select-caret {
  position: absolute;
  right: 0.85rem;
  font-size: 0.72rem;
  color: #64748b;
  pointer-events: none;
}

/* Currency Input Wrap */
.currency-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 0.9rem;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  pointer-events: none;
}

.currency-input {
  padding-left: 2rem !important;
}

/* Enhanced Modal Footer & Buttons */
.lead-form-modal-backdrop .crm-modal-footer {
  padding: 1.15rem 1.65rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-modal-cancel {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.25rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #475569;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.btn-modal-cancel:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-crm-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.55rem;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  border: 1px solid #1d4ed8;
  border-radius: 10px;
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-crm-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
}

.btn-crm-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ─── FULL-PAGE LEAD 360 WORKSPACE (SPLIT LAYOUT - EXECUTIVE NAVY BLUE) ─── */
.lead-fullscreen-backdrop {
  padding: 1.25rem !important;
  z-index: 9999;
}

.lead-workspace-fullscreen {
  width: calc(100vw - 2.5rem) !important;
  max-width: 1560px !important;
  height: calc(100vh - 2.5rem) !important;
  max-height: calc(100vh - 2.5rem) !important;
  display: flex !important;
  flex-direction: column !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  background: #ffffff !important;
  box-shadow: 0 25px 60px -15px rgba(11, 25, 44, 0.45), 0 0 0 1px rgba(30, 58, 138, 0.15) !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  font-size: 14px;
  color: #1e293b;
  line-height: 1.5;
}

/* ─── Modern Executive Top Header (Midnight Navy Gradient) ─── */
.lead-workspace-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.15rem 1.75rem;
  background: linear-gradient(135deg, #0b192c 0%, #1e3e62 55%, #001f3f 100%);
  border-bottom: 1px solid #1e3e62;
  box-shadow: 0 4px 18px rgba(11, 25, 44, 0.25);
  gap: 1rem;
  flex-wrap: wrap;
}

.gradient-avatar {
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
  color: #ffffff !important;
  font-size: 1.35rem !important;
  font-weight: 800 !important;
  box-shadow: 0 4px 14px rgba(30, 58, 138, 0.45);
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.header-company-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.company-title {
  font-size: 1.4rem !important;
  font-weight: 800 !important;
  color: #ffffff !important;
  letter-spacing: -0.01em;
  margin: 0;
}

.status-pill-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.status-new { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
.status-contacted { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }
.status-quotationsend { background: #fce7f3; color: #be185d; border: 1px solid #fbcfe8; }
.status-indiscussion { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
.status-proposalsent { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
.status-won { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.status-lost { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

.header-service-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: #bfdbfe;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.header-service-badge i {
  color: #60a5fa;
  font-size: 0.85rem;
}

.header-service-badge strong {
  color: #ffffff;
  font-weight: 700;
}

.contact-pill-list {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.contact-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.84rem;
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.28rem 0.72rem;
  border-radius: 7px;
  text-decoration: none;
  backdrop-filter: blur(6px);
  transition: all 0.15s ease;
}

.contact-chip strong {
  color: #ffffff;
}

.contact-chip i {
  font-size: 0.8rem;
  color: #93c5fd;
}

.contact-chip.link:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: #60a5fa;
  color: #ffffff;
  transform: translateY(-1px);
}

.contact-chip.link:hover i {
  color: #ffffff;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.btn-danger-subtle-hdr {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.95rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.35);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-danger-subtle-hdr:hover {
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-quotation-hdr {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
  border: 1px solid #34d399 !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35) !important;
}

.btn-quotation-hdr:hover {
  background: linear-gradient(135deg, #047857 0%, #059669 100%) !important;
  transform: translateY(-1px);
}

.btn-modern-action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 0.5rem 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: all 0.15s ease;
}

.btn-modern-action:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: #ffffff;
  color: #ffffff;
  transform: translateY(-1px);
}

.modal-close-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 1rem;
}

.modal-close-icon-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.35);
}

/* ─── WORKSPACE BODY SPLIT ─── */
.lead-workspace-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 460px 1fr;
  overflow: hidden;
  background: #f1f5f9;
}

@media (max-width: 1100px) {
  .lead-workspace-body {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
}

/* ◀ LEFT PANEL */
.lead-workspace-left {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #f1f5f9;
  border-right: 1.5px solid #cbd5e1;
}

.workspace-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.deal-quick-card {
  padding: 1.15rem 1.35rem;
  border-top: 3.5px solid #2563eb;
}

.deal-service-top-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0.85rem;
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  margin-bottom: 0.85rem;
  font-size: 0.88rem;
  flex-wrap: wrap;
}

.deal-service-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #1e3a8a;
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.deal-service-label i {
  color: #2563eb;
  font-size: 0.9rem;
}

.deal-service-value {
  color: #0f172a;
  font-weight: 800;
  font-size: 0.92rem;
}

/* 2-Column Deal Metrics Grid */
.metrics-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.metric-box {
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  justify-content: space-between;
}

.metric-label {
  font-size: 0.76rem;
  font-weight: 800;
  color: #1e3a8a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-val {
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #059669;
}

/* Stage Selector Inside Metric Box */
.stage-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.stage-pulse-dot {
  position: absolute;
  left: 0.7rem;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  z-index: 2;
  pointer-events: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
}

.dot-new { background: #0ea5e9; }
.dot-contacted { background: #8b5cf6; }
.dot-quotationsend { background: #ec4899; }
.dot-indiscussion { background: #f59e0b; }
.dot-proposalsent { background: #6366f1; }
.dot-won { background: #10b981; }
.dot-lost { background: #64748b; }

.modern-stage-select {
  width: 100%;
  appearance: none;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.45rem 1.75rem 0.45rem 1.65rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;
  font-family: inherit;
}

.modern-stage-select:hover,
.modern-stage-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.select-chevron {
  position: absolute;
  right: 0.7rem;
  font-size: 0.7rem;
  color: #64748b;
  pointer-events: none;
}

/* ✍️ Composer Card */
.composer-card {
  border-color: #cbd5e1;
}

.workspace-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.composer-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #0b192c;
  color: #60a5fa;
  border: 1px solid #1e3e62;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  box-shadow: 0 2px 6px rgba(11, 25, 44, 0.2);
}

.composer-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.composer-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.15rem 0 0;
}

.active-rep-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #1e3a8a;
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  white-space: nowrap;
  font-weight: 700;
}

.composer-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.composer-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.composer-field {
  display: flex;
  flex-direction: column;
}

.composer-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 0.35rem;
}

.composer-select,
.composer-input,
.composer-textarea {
  width: 100%;
  padding: 0.6rem 0.9rem;
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.92rem;
  color: #0f172a;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.15s ease;
  line-height: 1.5;
}

.composer-select:focus,
.composer-input:focus,
.composer-textarea:focus {
  background: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.composer-textarea {
  resize: vertical;
  min-height: 75px;
  line-height: 1.5;
}

.composer-submit-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.35rem;
}

.btn-save-note {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.6rem;
  background: linear-gradient(135deg, #0b192c 0%, #1e3e62 60%, #1e40af 100%);
  border: 1px solid #1e3e62;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(11, 25, 44, 0.3);
  transition: all 0.15s ease;
}

.btn-save-note:hover {
  background: linear-gradient(135deg, #001f3f 0%, #1e3a8a 100%);
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(30, 58, 138, 0.4);
}

/* ▶ RIGHT PANEL: TIMELINE WORKSPACE */
.lead-workspace-right {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}

.right-pane-header {
  flex-shrink: 0;
  padding: 1.25rem 1.75rem;
  border-bottom: 1.5px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: #ffffff;
}

.timeline-heading-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.timeline-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #0b192c;
  color: #60a5fa;
  border: 1px solid #1e3e62;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(11, 25, 44, 0.2);
}

.timeline-heading {
  font-size: 1.15rem !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  margin: 0 !important;
}

.timeline-subheading {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.15rem 0 0;
}

.total-activity-pill {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e3a8a;
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
}

.timeline-tab-filters {
  display: flex;
  gap: 0.35rem;
  background: #e2e8f0;
  padding: 0.25rem;
  border-radius: 8px;
}

.timeline-filter-btn {
  background: transparent;
  border: none;
  color: #475569;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.timeline-filter-btn.active {
  background: #0b192c;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(11, 25, 44, 0.25);
}

.right-pane-stream-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem 1.75rem;
  background: #fafcff;
}

.modern-stream {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* Compact Automated Pipeline Move Row */
.pipeline-compact-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 3.5px solid #2563eb;
  border-radius: 8px;
  padding: 0.55rem 0.95rem;
  font-size: 0.82rem;
  color: #64748b;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
  transition: all 0.15s ease;
}

.pipeline-compact-row:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  border-left-color: #1d4ed8;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
}

.compact-icon-bullet {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1e40af;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.compact-body {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  flex-wrap: wrap;
  font-size: 0.88rem;
  color: #334155;
}

.compact-text {
  font-size: 0.88rem;
  color: #334155;
}

.compact-text strong {
  color: #0f172a;
  font-weight: 700;
}

.compact-stage-tag {
  font-size: 0.8rem;
  font-weight: 700;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 0.15rem 0.55rem;
  border-radius: 5px;
  color: #1d4ed8;
}

.compact-time {
  font-size: 0.82rem;
  color: #64748b;
  margin-left: auto;
  font-weight: 600;
}

.btn-compact-delete {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem;
  transition: color 0.15s;
}

.btn-compact-delete:hover {
  color: #dc2626;
}

/* Detailed Rich Discussion Card */
.timeline-entry-rich {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.timeline-node {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.bullet-phone { background: #dbeafe; color: #1d4ed8; }
.bullet-video { background: #ede9fe; color: #6d28d9; }
.bullet-whatsapp { background: #dcfce7; color: #15803d; }
.bullet-visit { background: #fef3c7; color: #b45309; }
.bullet-email { background: #fce7f3; color: #be185d; }
.bullet-pipeline { background: #f1f5f9; color: #475569; }
.bullet-default { background: #e0f2fe; color: #0284c7; }

.timeline-card-surface {
  flex: 1;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
  transition: all 0.15s ease;
}

.timeline-card-surface:hover {
  border-color: #94a3b8;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.entry-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.entry-meta-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.entry-author {
  font-size: 0.94rem;
  font-weight: 800;
  color: #0f172a;
}

.entry-channel-badge {
  font-size: 0.8rem;
  font-weight: 700;
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  padding: 0.18rem 0.55rem;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.entry-outcome-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.18rem 0.6rem;
  border-radius: 5px;
}

.outcome-success { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.outcome-primary { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.outcome-warning { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.outcome-danger { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.outcome-neutral { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
.outcome-default { background: #f1f5f9; color: #334155; }

.entry-meta-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.entry-timestamp {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-delete-entry {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.2rem;
  font-size: 0.85rem;
  transition: color 0.15s;
}

.btn-delete-entry:hover {
  color: #dc2626;
}

.entry-note-content {
  font-size: 0.92rem;
  color: #1e293b;
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-timeline-card {
  padding: 2.25rem 1rem;
  text-align: center;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
}

.empty-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin: 0 auto 0.75rem;
}

.empty-timeline-card h5 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.empty-timeline-card p {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
}

.modern-modal-footer {
  padding: 1.15rem 1.75rem !important;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
}

/* ─── MODAL TAB SWITCHER ─── */
.modal-tab-bar {
  display: flex;
  background: #f1f5f9;
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  gap: 0.5rem;
}

.modal-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-tab-btn:hover {
  color: #0f172a;
}

.modal-tab-btn.active {
  background: #ffffff;
  color: #0284c7;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ─── BULK EXCEL IMPORT ─── */
.bulk-excel-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.bulk-template-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.template-card-text {
  flex: 1;
  min-width: 240px;
}

.template-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #166534;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.2rem;
}

.template-card-text h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #14532d;
  margin: 0 0 0.25rem;
}

.template-card-text p {
  font-size: 0.8rem;
  color: #166534;
  margin: 0;
}

.btn-download-demo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.15rem;
  background: #16a34a;
  border: 1px solid #15803d;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);
}

.btn-download-demo:hover {
  background: #15803d;
  transform: translateY(-1px);
}

.excel-dropzone {
  border: 2px dashed #cbd5e1;
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  transition: all 0.2s ease;
}

.excel-dropzone:hover,
.excel-dropzone.dropzone-active {
  border-color: #0284c7;
  background: #f0f9ff;
}

.dropzone-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.dropzone-content h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.35rem;
}

.dropzone-content p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.btn-browse-file {
  display: inline-block;
  padding: 0.45rem 1rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  margin-top: 0.35rem;
}

.hidden-file-input {
  display: none;
}

/* Preview Section */
.bulk-preview-section {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  padding: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.preview-badge {
  font-size: 0.85rem;
  font-weight: 700;
  color: #059669;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-clear-preview {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.btn-clear-preview:hover {
  color: #dc2626;
}

.preview-table-scroll {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.bulk-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  text-align: left;
}

.bulk-table th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.bulk-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.pill-service {
  background: #f1f5f9;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-size: 0.74rem;
  color: #334155;
}

.pill-stage {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-size: 0.74rem;
  font-weight: 600;
}

.bulk-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  align-items: center;
}

.btn-confirm-import {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  background: #10b981;
  border: 1px solid #059669;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  transition: all 0.15s ease;
}

.btn-confirm-import:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* ════════ CELEBRATION EFFECTS ════════ */
.celebration-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  z-index: 10100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.celebration-card {
  position: relative;
  background: linear-gradient(135deg, #064e3b 0%, #065f46 45%, #047857 100%);
  color: #ffffff;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  padding: 2.25rem 2rem 1.75rem;
  box-shadow: 0 25px 50px -12px rgba(4, 120, 87, 0.45), 0 0 0 1px rgba(110, 231, 183, 0.35);
  text-align: center;
  overflow: hidden;
  box-sizing: border-box;
}

.celebration-glow {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.45) 0%, rgba(52, 211, 153, 0) 70%);
  pointer-events: none;
}

.celebration-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  z-index: 2;
}

.celebration-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.08);
}

.celebration-trophy-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trophy-icon-box {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  color: #78350f;
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.6);
  z-index: 1;
  animation: trophy-bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.trophy-pulse-ring {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 2px solid rgba(251, 191, 36, 0.6);
  animation: pulse-ring 2s infinite ease-out;
}

.trophy-pulse-ring.ring-2 {
  inset: -20px;
  animation-delay: 0.6s;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

@keyframes trophy-bounce {
  0% { transform: scale(0.2) rotate(-15deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.celebration-badge {
  display: inline-block;
  background: rgba(254, 240, 138, 0.2);
  border: 1px solid rgba(253, 224, 71, 0.5);
  color: #fef08a;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.celebration-company {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  letter-spacing: -0.01em;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.celebration-subtitle {
  font-size: 0.88rem;
  color: #d1fae5;
  margin: 0 0 1.25rem;
  line-height: 1.45;
}

.celebration-metrics-row {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.35rem;
  flex-wrap: wrap;
}

.celebration-metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0.65rem;
}

.celebration-metric-item .metric-lbl {
  font-size: 0.68rem;
  color: #a7f3d0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.celebration-metric-item .metric-val {
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  margin-top: 0.15rem;
}

.celebration-metric-item .metric-val.text-emerald {
  color: #6ee7b7;
}

.celebration-footer {
  margin-top: 0.5rem;
}

.btn-celebration-continue {
  background: #ffffff;
  color: #065f46;
  border: none;
  font-weight: 700;
  font-size: 0.88rem;
  padding: 0.65rem 1.6rem;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-celebration-continue:hover {
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Modal Transition */
.celebrate-pop-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.celebrate-pop-leave-active {
  transition: all 0.25s ease-in;
}
.celebrate-pop-enter-from {
  opacity: 0;
  transform: scale(0.85);
}
.celebrate-pop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* ════════ QUOTATION HEADER BUTTON & WORKSPACE MODAL ════════ */
.btn-quotation-hdr {
  background: #f0fdf4;
  border-color: #86efac;
  color: #15803d;
}

.btn-quotation-hdr:hover {
  background: #dcfce7;
  border-color: #4ade80;
  color: #166534;
}

.tab-open-icon {
  font-size: 0.72rem;
  color: #16a34a;
  margin-left: 0.2rem;
  opacity: 0.8;
}

.hdr-actions-group {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.btn-open-tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #15803d;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-open-tab-pill:hover {
  background: #dcfce7;
}

.modal-quotation-card {
  max-width: 960px;
  width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-quotation-card .modal-card-header {
  flex-shrink: 0;
}

.modal-quotation-card .modal-tab-bar {
  flex-shrink: 0;
  border-bottom: 1px solid #e2e8f0;
}

.quotation-list-panel,
.quotation-form-panel {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f8fafc;
}

.quote-badge {
  background: #dcfce7 !important;
  color: #15803d !important;
}

/* Empty State */
.empty-quotations-box {
  background: #ffffff;
  border: 1.5px dashed #cbd5e1;
  border-radius: 14px;
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-quote-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f0fdf4;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.empty-quotations-box h4 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.4rem;
}

.empty-quotations-box p {
  font-size: 0.9rem;
  color: #64748b;
  max-width: 460px;
  line-height: 1.5;
  margin: 0 0 1.25rem;
}

.btn-create-quote-empty {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  background: #16a34a;
  color: #ffffff;
  border: none;
  border-radius: 9px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
  transition: all 0.2s ease;
}

.btn-create-quote-empty:hover {
  background: #15803d;
  transform: translateY(-1px);
}

/* Quotations List Bar & Grid */
.quote-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.quote-stat {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.quote-stat .stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.quote-stat .stat-num {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.btn-new-quote-action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem;
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-new-quote-action:hover {
  background: #059669;
}

.client-quote-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.client-quote-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.15rem 1.35rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.client-quote-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.cqc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.85rem;
}

.cqc-id-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.cqc-code {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.cqc-date {
  font-size: 0.8rem;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.cqc-status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  letter-spacing: 0.03em;
}

.cqc-status-badge.status-won {
  background: #dcfce7;
  color: #15803d;
}

.cqc-status-badge.status-lost {
  background: #fee2e2;
  color: #b91c1c;
}

.cqc-status-badge.status-pending {
  background: #e0f2fe;
  color: #0369a1;
}

.cqc-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cqc-item-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.86rem;
  color: #334155;
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.cqc-items-lbl {
  font-weight: 700;
  color: #64748b;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.cqc-financials {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.cqc-fin-col {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.cqc-fin-col .lbl {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
}

.cqc-fin-col .val {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.cqc-fin-col.grand .val {
  font-size: 1.15rem;
}

.cqc-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.btn-quote-view {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-quote-view:hover {
  background: #0369a1;
}

.btn-quote-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  background: #f59e0b;
  color: #ffffff;
  border: none;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-quote-edit:hover {
  background: #d97706;
}

.btn-quote-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-quote-toggle:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-quote-del {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-quote-del:hover {
  background: #ffe4e6;
  border-color: #fda4af;
}

/* Expanded Table */
.cqc-expanded-details {
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px dashed #cbd5e1;
}

.quote-expanded-table-wrap {
  overflow-x: auto;
}

.quote-items-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.quote-items-detail-table th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #cbd5e1;
}

.quote-items-detail-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.quote-expanded-footer {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.45;
}

.quote-expanded-footer p {
  margin: 0.25rem 0;
}

/* Dynamic Line Items Builder */
.quotation-items-builder {
  margin-top: 1.25rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
}

.qib-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.qib-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.btn-add-line-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #86efac;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-add-line-item:hover {
  background: #dcfce7;
}

.qib-table-wrap {
  overflow-x: auto;
}

.qib-table {
  width: 100%;
  border-collapse: collapse;
}

.qib-table th {
  background: #f8fafc;
  color: #475569;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  padding: 0.55rem 0.65rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.qib-table td {
  padding: 0.45rem 0.5rem;
  vertical-align: middle;
}

.item-input {
  width: 100%;
  padding: 0.45rem 0.65rem;
  font-size: 0.85rem;
}

.btn-remove-row {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-remove-row:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.btn-remove-row:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Quotation Summary Grid */
.quotation-summary-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  margin-top: 1.25rem;
}

@media (max-width: 900px) {
  .quotation-summary-grid {
    grid-template-columns: 1fr;
  }
}

.quote-totals-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.tot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.86rem;
  color: #475569;
}

.tot-val {
  font-weight: 700;
  color: #0f172a;
}

.tot-row.grand-row {
  padding-top: 0.65rem;
  border-top: 1.5px solid #e2e8f0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.amount-words {
  font-size: 0.78rem;
  color: #059669;
  font-weight: 600;
  background: #f0fdf4;
  padding: 0.5rem 0.65rem;
  border-radius: 6px;
  margin: 0.25rem 0 0;
  line-height: 1.4;
}

.quote-form-actions {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
}

.input-readonly {
  background: #f1f5f9 !important;
  color: #475569 !important;
  cursor: not-allowed;
}

/* 📱 Responsive */
@media (max-width: 768px) {
  .crm-page-container { padding: 1rem; }
  .crm-header { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; }
  .crm-search-wrap { width: 100%; }
  .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
  .lead-summary-strip { grid-template-columns: 1fr 1fr; }
}

/* ════════ KANBAN CARD: SCHEDULED FOLLOW-UP PILL ════════ */
.card-followup-reminder-strip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 4px;
}

.card-followup-reminder-strip.overdue {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
  font-weight: 700;
}

/* ════════ SYSTEM REMINDER POPUP MODAL (CRM BOARD) ════════ */
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

.btn-popup-snooze, .btn-popup-open-lead {
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

.btn-popup-snooze:hover, .btn-popup-open-lead:hover {
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
</style>
