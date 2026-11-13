<template>
  <div class="daily-sales-report-page">
    <!-- ════════ TOP HERO / WORKSPACE HEADER ════════ -->
    <header class="report-top-header">
      <div class="header-left">
        <button class="btn-header-back" @click="goToPipeline" title="Back to CRM Pipeline">
          <i class="fas fa-arrow-left"></i>
          <span>Pipeline</span>
        </button>
        <div class="header-divider"></div>
        <div class="report-badge-icon" :class="{ 'is-archive': !isViewingToday }">
          <i :class="isViewingToday ? 'fas fa-chart-line' : 'fas fa-calendar-alt'"></i>
        </div>
        <div class="report-header-titles">
          <div class="title-with-pill">
            <h1 class="report-page-title">{{ dynamicReportTitle }}</h1>
            <span v-if="isViewingToday" class="live-pulse-badge">
              <span class="live-pulse-dot"></span>
              <span>LIVE TRACKING</span>
            </span>
            <span v-else class="archive-report-badge">
              <i class="fas fa-history"></i>
              <span>ARCHIVED REPORT</span>
            </span>
          </div>
          <div class="report-subtitle-row">
            <span class="calendar-pill"><i class="far fa-calendar-alt"></i> {{ formattedActiveDate }}</span>
            <span class="meta-dot">•</span>
            <span class="sync-time-pill"><i class="far fa-clock"></i> Synced: {{ lastRefreshedTime || 'Just now' }}</span>
            <span class="meta-dot" v-if="isViewingToday && autoRefreshInterval > 0">•</span>
            <span class="auto-refresh-pill" v-if="isViewingToday && autoRefreshInterval > 0">
              <i class="fas fa-sync-alt fa-spin"></i> Auto-refresh: {{ autoRefreshInterval }}s
            </span>
          </div>
        </div>
      </div>

      <div class="header-right">
        <!-- Sales Executive Filter -->
        <div class="exec-filter-wrap" v-if="canAccessAllLeads && leadCreators.length > 0">
          <i class="fas fa-user-tie filter-icon"></i>
          <select v-model="selectedUserFilter" class="exec-filter-select">
            <option value="">All Sales Executives ({{ leadCreators.length }})</option>
            <option v-for="user in leadCreators" :key="user" :value="user">{{ user }}</option>
          </select>
        </div>

        <!-- Auto-Refresh Selector (Active for Today) -->
        <div class="auto-refresh-select-wrap" v-if="isViewingToday">
          <i class="fas fa-history refresh-timer-icon"></i>
          <select v-model.number="autoRefreshInterval" @change="setupAutoRefresh" class="auto-refresh-select" title="Auto-refresh interval">
            <option :value="0">Auto: Off</option>
            <option :value="15">Auto: 15s</option>
            <option :value="30">Auto: 30s</option>
            <option :value="60">Auto: 60s</option>
          </select>
        </div>

        <!-- Manual Refresh Button -->
        <button
          class="btn-action-refresh"
          @click="fetchReportData"
          :disabled="isLoading"
          title="Fetch latest updates from database"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          <span>{{ isLoading ? 'Refreshing...' : 'Refresh' }}</span>
        </button>

        <!-- Print / Export Button -->
        <button class="btn-action-print" @click="printReport" title="Print or Save as PDF">
          <i class="fas fa-print"></i>
          <span>Print</span>
        </button>

        <!-- Close Tab Button -->
        <button class="btn-action-close" @click="closeCurrentTab" title="Close this Tab">
          <i class="fas fa-times"></i>
          <span>Close</span>
        </button>
      </div>
    </header>

    <!-- ════════ DATE & TIMEFRAME NAVIGATION TOOLBAR ════════ -->
    <nav class="report-date-toolbar">
      <!-- Left: Quick Presets Group -->
      <div class="date-presets-group">
        <button
          type="button"
          class="preset-chip"
          :class="{ active: datePreset === 'today' }"
          @click="setPreset('today')"
          title="View Today's Real-Time Report"
        >
          <i class="fas fa-sun"></i>
          <span>Today</span>
        </button>
        <button
          type="button"
          class="preset-chip"
          :class="{ active: datePreset === 'yesterday' }"
          @click="setPreset('yesterday')"
          title="View Yesterday's Report"
        >
          <i class="fas fa-history"></i>
          <span>Yesterday</span>
        </button>
        <button
          type="button"
          class="preset-chip"
          :class="{ active: datePreset === 'last7' }"
          @click="setPreset('last7')"
          title="View Last 7 Days Activity"
        >
          <i class="fas fa-calendar-week"></i>
          <span>Last 7 Days</span>
        </button>
        <button
          type="button"
          class="preset-chip"
          :class="{ active: datePreset === 'thisMonth' }"
          @click="setPreset('thisMonth')"
          title="View This Month's Activity"
        >
          <i class="fas fa-calendar-alt"></i>
          <span>This Month</span>
        </button>
        <button
          type="button"
          class="preset-chip"
          :class="{ active: datePreset === 'custom' }"
          @click="setPreset('custom')"
          title="Pick a Specific Previous Date"
        >
          <i class="fas fa-calendar-day"></i>
          <span>Pick Date</span>
        </button>
        <button
          type="button"
          class="preset-chip"
          :class="{ active: datePreset === 'range' }"
          @click="setPreset('range')"
          title="Select Custom Date Range"
        >
          <i class="fas fa-calendar-check"></i>
          <span>Date Range</span>
        </button>
      </div>

      <!-- Center: Date Stepper & Picker -->
      <div class="date-navigator-box">
        <!-- Single Date Mode (with Prev / Next buttons) -->
        <template v-if="dateMode === 'single'">
          <button
            type="button"
            class="btn-step-day"
            @click="goToPrevDay"
            title="Go to Previous Day"
          >
            <i class="fas fa-chevron-left"></i>
            <span>Prev Day</span>
          </button>

          <div class="date-input-wrapper">
            <i class="far fa-calendar-alt date-picker-icon"></i>
            <input
              type="date"
              v-model="selectedDate"
              :max="todayDateString"
              @change="onDateInputChange"
              class="report-date-input"
              title="Pick any previous date"
            />
          </div>

          <button
            type="button"
            class="btn-step-day"
            :disabled="isViewingToday"
            @click="goToNextDay"
            title="Go to Next Day"
          >
            <span>Next Day</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        </template>

        <!-- Date Range Mode -->
        <template v-else>
          <div class="date-range-inputs">
            <div class="range-date-wrapper">
              <span class="range-label">From:</span>
              <input
                type="date"
                v-model="startDate"
                :max="endDate || todayDateString"
                @change="onRangeInputChange"
                class="report-date-input range"
              />
            </div>
            <span class="range-arrow"><i class="fas fa-arrow-right"></i></span>
            <div class="range-date-wrapper">
              <span class="range-label">To:</span>
              <input
                type="date"
                v-model="endDate"
                :min="startDate"
                :max="todayDateString"
                @change="onRangeInputChange"
                class="report-date-input range"
              />
            </div>
          </div>
        </template>
      </div>

      <!-- Right: Active Period Summary Tag -->
      <div class="date-active-display">
        <span class="active-date-label">Selected Period:</span>
        <strong class="active-date-val">{{ formattedActiveDate }}</strong>
        <span v-if="isViewingToday" class="today-tag-pill">
          <i class="fas fa-bolt"></i> Today
        </span>
        <span v-else-if="isViewingYesterday" class="yesterday-tag-pill">
          <i class="fas fa-history"></i> Yesterday
        </span>
        <span v-else class="past-tag-pill">
          <i class="fas fa-calendar-check"></i> Historical
        </span>
      </div>
    </nav>

    <!-- ════════ MAIN CONTENT WRAPPER ════════ -->
    <main class="report-main-container">
      <!-- 4 Core Performance KPI Cards -->
      <section class="kpi-cards-grid">
        <!-- KPI 1: New Leads -->
        <div
          class="kpi-card card-blue"
          :class="{ active: activeTab === 'leads' }"
          @click="activeTab = 'leads'"
        >
          <div class="kpi-header">
            <span class="kpi-title">{{ isViewingToday ? "TODAY'S NEW LEADS" : 'NEW LEADS' }}</span>
            <div class="kpi-icon-pill icon-blue">
              <i class="fas fa-bullseye"></i>
            </div>
          </div>
          <div class="kpi-metric-row">
            <span class="kpi-number">{{ todaysNewLeads.length }}</span>
            <span class="kpi-trend-pill trend-blue">Opportunities</span>
          </div>
          <div class="kpi-footer">
            <span class="kpi-sub-label">Deal Value Added:</span>
            <strong class="kpi-sub-value text-blue">₹{{ formatCurrency(todaysNewLeadsValue) }}</strong>
          </div>
        </div>

        <!-- KPI 2: Follow-up Calls -->
        <div
          class="kpi-card card-purple"
          :class="{ active: activeTab === 'followups' }"
          @click="activeTab = 'followups'"
        >
          <div class="kpi-header">
            <span class="kpi-title">{{ isViewingToday ? 'FOLLOW-UP CALLS' : 'FOLLOW-UP CALLS' }}</span>
            <div class="kpi-icon-pill icon-purple">
              <i class="fas fa-phone-volume"></i>
            </div>
          </div>
          <div class="kpi-metric-row">
            <span class="kpi-number">{{ todaysFollowups.length }}</span>
            <span class="kpi-trend-pill trend-purple">Discussions</span>
          </div>
          <div class="kpi-footer">
            <span class="kpi-sub-label">Calls / Touchpoints:</span>
            <strong class="kpi-sub-value text-purple">{{ todaysFollowupCallsCount }} calls</strong>
          </div>
        </div>

        <!-- KPI 3: Send Quotations -->
        <div
          class="kpi-card card-amber"
          :class="{ active: activeTab === 'quotations' }"
          @click="activeTab = 'quotations'"
        >
          <div class="kpi-header">
            <span class="kpi-title">{{ isViewingToday ? 'QUOTATIONS SENT' : 'QUOTATIONS SENT' }}</span>
            <div class="kpi-icon-pill icon-amber">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
          </div>
          <div class="kpi-metric-row">
            <span class="kpi-number">{{ todaysQuotations.length }}</span>
            <span class="kpi-trend-pill trend-amber">Proposals</span>
          </div>
          <div class="kpi-footer">
            <span class="kpi-sub-label">Quoted Total:</span>
            <strong class="kpi-sub-value text-amber">₹{{ formatCurrency(todaysQuotationsValue) }}</strong>
          </div>
        </div>

        <!-- KPI 4: PO Confirmed -->
        <div
          class="kpi-card card-emerald"
          :class="{ active: activeTab === 'po' }"
          @click="activeTab = 'po'"
        >
          <div class="kpi-header">
            <span class="kpi-title">{{ isViewingToday ? 'PO CONFIRMED' : 'PO CONFIRMED' }}</span>
            <div class="kpi-icon-pill icon-emerald">
              <i class="fas fa-trophy"></i>
            </div>
          </div>
          <div class="kpi-metric-row">
            <span class="kpi-number">{{ todaysPoConfirmed.length }}</span>
            <span class="kpi-trend-pill trend-emerald">
              <i class="fas fa-bolt"></i> {{ todaysSameDayPoCount }} Same-Day
            </span>
          </div>
          <div class="kpi-footer">
            <span class="kpi-sub-label">Revenue Closed:</span>
            <strong class="kpi-sub-value text-emerald">₹{{ formatCurrency(todaysPoConfirmedValue) }}</strong>
          </div>
        </div>
      </section>

      <!-- Lightning Same-Day Conversion Highlight Strip -->
      <section v-if="todaysSameDayPoCount > 0" class="same-day-banner">
        <div class="banner-left">
          <div class="lightning-circle">
            <i class="fas fa-bolt"></i>
          </div>
          <div class="banner-text">
            <h4 class="banner-title">Same-Day Conversion Highlight!</h4>
            <p class="banner-desc">
              <strong>{{ todaysSameDayPoCount }} deal{{ todaysSameDayPoCount > 1 ? 's' : '' }}</strong> created and confirmed as Purchase Order {{ isViewingToday ? 'today' : 'on ' + formattedActiveDate }} with total revenue of <strong>₹{{ formatCurrency(todaysSameDayPoValue) }}</strong>. Excellent sales execution!
            </p>
          </div>
        </div>
        <div class="banner-badge">
          <i class="fas fa-star"></i> Lightning Turnaround
        </div>
      </section>

      <!-- Workspace Tabs & Search Controls -->
      <section class="report-content-panel">
        <div class="panel-header-toolbar">
          <div class="nav-tabs-list">
            <button
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === 'overview' }"
              @click="activeTab = 'overview'"
            >
              <i class="fas fa-stream"></i>
              <span>All Activity Stream</span>
              <span class="tab-count-bubble">{{ todaysLiveFeed.length }}</span>
            </button>

            <button
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === 'leads' }"
              @click="activeTab = 'leads'"
            >
              <i class="fas fa-bullseye text-blue"></i>
              <span>New Leads</span>
              <span class="tab-count-bubble blue">{{ todaysNewLeads.length }}</span>
            </button>

            <button
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === 'followups' }"
              @click="activeTab = 'followups'"
            >
              <i class="fas fa-phone-volume text-purple"></i>
              <span>Follow-Ups</span>
              <span class="tab-count-bubble purple">{{ todaysFollowups.length }}</span>
            </button>

            <button
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === 'quotations' }"
              @click="activeTab = 'quotations'"
            >
              <i class="fas fa-file-invoice-dollar text-amber"></i>
              <span>Quotations Sent</span>
              <span class="tab-count-bubble amber">{{ todaysQuotations.length }}</span>
            </button>

            <button
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === 'po' }"
              @click="activeTab = 'po'"
            >
              <i class="fas fa-trophy text-emerald"></i>
              <span>PO Confirmed</span>
              <span class="tab-count-bubble emerald">{{ todaysPoConfirmed.length }}</span>
            </button>
          </div>

          <!-- In-Tab Search Box -->
          <div class="tab-search-box">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search companies, contacts, notes..."
              class="search-input"
            />
            <button
              v-if="searchQuery"
              class="search-clear-btn"
              @click="searchQuery = ''"
              title="Clear search"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- ════════ TAB BODIES ════════ -->
        <div class="panel-body">
          <!-- 1. OVERVIEW: Activity Feed Timeline -->
          <div v-if="activeTab === 'overview'" class="tab-body-pane">
            <div v-if="filteredLiveFeed.length === 0" class="empty-state-box">
              <div class="empty-icon-circle"><i class="fas fa-clipboard-list"></i></div>
              <h3>No Activity Recorded for {{ formattedActiveDate }}</h3>
              <p>No new leads, follow-up calls, quotations, or PO confirmed deals were recorded during this period matching your filters.</p>
              <button class="btn-empty-action" @click="setPreset('today')">
                <i class="fas fa-calendar-day"></i> Switch to Today's Report
              </button>
            </div>
            <div v-else class="activity-timeline-feed">
              <div
                v-for="item in filteredLiveFeed"
                :key="item.id"
                class="feed-card"
                :style="{ borderLeftColor: item.color }"
              >
                <div
                  class="feed-icon-box"
                  :style="{ backgroundColor: item.color + '15', color: item.color, borderColor: item.color + '30' }"
                >
                  <i :class="item.icon"></i>
                </div>
                <div class="feed-details">
                  <div class="feed-header-line">
                    <span class="feed-item-title">{{ item.title }}</span>
                    <span class="feed-time-pill">
                      <i class="far fa-clock"></i> {{ formatDateTime(item.time) }}
                    </span>
                  </div>
                  <p class="feed-body-desc">{{ item.desc }}</p>
                  <div class="feed-footer-line">
                    <span class="feed-actor-tag"><i class="fas fa-user-circle"></i> {{ item.actor }}</span>
                    <button
                      v-if="item.leadId"
                      class="btn-feed-open-lead"
                      @click="openLeadDetailsById(item.leadId)"
                      title="Open Lead in New Tab"
                    >
                      <span>View Lead</span>
                      <i class="fas fa-external-link-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. TAB: New Leads -->
          <div v-else-if="activeTab === 'leads'" class="tab-body-pane">
            <div v-if="filteredNewLeads.length === 0" class="empty-state-box">
              <div class="empty-icon-circle"><i class="fas fa-bullseye"></i></div>
              <h3>No New Leads for {{ formattedActiveDate }}</h3>
              <p>No new opportunities have been created during this period matching your filters.</p>
            </div>
            <div v-else class="table-container">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Company / Organization</th>
                    <th>Contact Person</th>
                    <th>Service Required</th>
                    <th>Deal Value (₹)</th>
                    <th>Current Stage</th>
                    <th>Sales Owner</th>
                    <th>Date & Time</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="lead in filteredNewLeads" :key="lead.id">
                    <td>
                      <div class="table-entity">
                        <span class="entity-name">{{ lead.company_name }}</span>
                        <span class="entity-sub" v-if="lead.phone || lead.email">
                          <i class="fas fa-phone-alt" v-if="lead.phone"></i> {{ lead.phone }}
                          <span v-if="lead.phone && lead.email">•</span>
                          <i class="fas fa-envelope" v-if="lead.email"></i> {{ lead.email }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span class="contact-person-text">{{ lead.contact_person || '-' }}</span>
                    </td>
                    <td>
                      <span class="service-pill">{{ lead.service_required || 'IT Solution' }}</span>
                    </td>
                    <td>
                      <strong class="deal-value-text">₹{{ formatCurrency(lead.deal_value || 0) }}</strong>
                    </td>
                    <td>
                      <span class="stage-pill">{{ lead.status || 'Raw Leads' }}</span>
                    </td>
                    <td>
                      <span class="owner-pill"><i class="fas fa-user-circle"></i> {{ lead.created_by_name || '-' }}</span>
                    </td>
                    <td class="text-muted">{{ formatDateTime(lead.created_at) }}</td>
                    <td class="text-right">
                      <button
                        class="btn-row-action"
                        @click="openLeadDetails(lead)"
                        title="Open Lead 360 in New Tab"
                      >
                        <i class="fas fa-external-link-alt"></i>
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. TAB: Follow-Up Calls -->
          <div v-else-if="activeTab === 'followups'" class="tab-body-pane">
            <div v-if="filteredFollowups.length === 0" class="empty-state-box">
              <div class="empty-icon-circle"><i class="fas fa-phone-volume"></i></div>
              <h3>No Follow-Up Calls Logged for {{ formattedActiveDate }}</h3>
              <p>No phone calls or customer discussions were recorded during this period matching your filters.</p>
            </div>
            <div v-else class="table-container">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Client / Lead</th>
                    <th>Call Type</th>
                    <th>Discussion Remarks / Action Items</th>
                    <th>Stage Logged</th>
                    <th>Executive</th>
                    <th>Date & Time</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in filteredFollowups" :key="f.id || f.lead_id + f.date">
                    <td>
                      <div class="table-entity">
                        <span class="entity-name">{{ f.company_name }}</span>
                        <span class="entity-sub" v-if="f.contact_person">
                          <i class="fas fa-user-tie"></i> {{ f.contact_person }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span class="call-type-badge">
                        <i :class="(f.call_type || '').toLowerCase().includes('call') ? 'fas fa-phone-alt' : 'fas fa-comments'"></i>
                        {{ f.call_type || 'Phone Call' }}
                      </span>
                    </td>
                    <td>
                      <div class="discussion-remarks-box">
                        <p class="remarks-paragraph">{{ f.note || '-' }}</p>
                      </div>
                    </td>
                    <td>
                      <span class="stage-pill">{{ f.status || f.lead_status || 'In Progress' }}</span>
                    </td>
                    <td>
                      <span class="owner-pill"><i class="fas fa-user-circle"></i> {{ f.logged_by || '-' }}</span>
                    </td>
                    <td class="text-muted">{{ formatDateTime(f.date || f.created_at) }}</td>
                    <td class="text-right">
                      <button
                        class="btn-row-action"
                        @click="openLeadDetailsById(f.lead_id)"
                        title="Open Lead 360 in New Tab"
                      >
                        <i class="fas fa-external-link-alt"></i>
                        <span>Lead</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 4. TAB: Quotations Sent -->
          <div v-else-if="activeTab === 'quotations'" class="tab-body-pane">
            <div v-if="filteredQuotations.length === 0" class="empty-state-box">
              <div class="empty-icon-circle"><i class="fas fa-file-invoice-dollar"></i></div>
              <h3>No Quotations Sent for {{ formattedActiveDate }}</h3>
              <p>No commercial proposals or quotations were recorded during this period matching your filters.</p>
            </div>
            <div v-else class="table-container">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Quote Ref #</th>
                    <th>Company / Client</th>
                    <th>Contact Person</th>
                    <th>Quoted Value (₹)</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="q in filteredQuotations" :key="q.id">
                    <td><strong class="quote-ref-code">{{ q.quote_no }}</strong></td>
                    <td>
                      <span class="entity-name">{{ q.company_name }}</span>
                    </td>
                    <td>{{ q.contact_person || '-' }}</td>
                    <td>
                      <strong class="deal-value-text">₹{{ formatCurrency(q.grand_total || 0) }}</strong>
                    </td>
                    <td>
                      <span class="stage-pill quote-pill">{{ q.status }}</span>
                    </td>
                    <td>
                      <span class="owner-pill"><i class="fas fa-user-circle"></i> {{ q.created_by }}</span>
                    </td>
                    <td class="text-muted">{{ formatDateTime(q.time) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 5. TAB: PO Confirmed Deals -->
          <div v-else-if="activeTab === 'po'" class="tab-body-pane">
            <div v-if="filteredPoConfirmed.length === 0" class="empty-state-box">
              <div class="empty-icon-circle"><i class="fas fa-trophy"></i></div>
              <h3>No PO Confirmed Deals for {{ formattedActiveDate }}</h3>
              <p>Deals moved to "PO Confirmed" or "Won" status during this period will appear here with revenue highlights.</p>
            </div>
            <div v-else class="table-container">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Company / Organization</th>
                    <th>Contact Person</th>
                    <th>Confirmed Value (₹)</th>
                    <th>Turnaround Speed</th>
                    <th>Service Required</th>
                    <th>Sales Owner</th>
                    <th>Date & Time</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in filteredPoConfirmed" :key="p.id">
                    <td>
                      <div class="table-entity">
                        <span class="entity-name">{{ p.company_name }}</span>
                        <span class="entity-sub" v-if="p.phone || p.email">{{ p.phone || p.email }}</span>
                      </div>
                    </td>
                    <td>{{ p.contact_person || '-' }}</td>
                    <td>
                      <strong class="deal-value-text po-text">₹{{ formatCurrency(p.deal_value || 0) }}</strong>
                    </td>
                    <td>
                      <span v-if="p.isSameDayConversion" class="same-day-speed-pill">
                        <i class="fas fa-bolt"></i> Same-Day Turnaround!
                      </span>
                      <span v-else class="standard-cycle-pill">
                        Standard Cycle
                      </span>
                    </td>
                    <td><span class="service-pill">{{ p.service_required || 'IT Solution' }}</span></td>
                    <td>
                      <span class="owner-pill"><i class="fas fa-user-circle"></i> {{ p.created_by_name || '-' }}</span>
                    </td>
                    <td class="text-muted">{{ formatDateTime(p.created_at) }}</td>
                    <td class="text-right">
                      <button
                        class="btn-row-action"
                        @click="openLeadDetails(p)"
                        title="Open Lead in New Tab"
                      >
                        <i class="fas fa-external-link-alt"></i>
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Panel Footer Summary -->
        <footer class="panel-footer-summary">
          <div class="footer-summary-counts">
            <span>Period Summary ({{ formattedActiveDate }}):</span>
            <strong>{{ todaysNewLeads.length }}</strong> New Leads
            <span class="footer-sep">•</span>
            <strong>{{ todaysFollowups.length }}</strong> Follow-Ups ({{ todaysFollowupCallsCount }} calls)
            <span class="footer-sep">•</span>
            <strong>{{ todaysQuotations.length }}</strong> Quotations (₹{{ formatCurrency(todaysQuotationsValue) }})
            <span class="footer-sep">•</span>
            <strong>{{ todaysPoConfirmed.length }}</strong> POs Confirmed (₹{{ formatCurrency(todaysPoConfirmedValue) }})
          </div>
          <div class="footer-right-actions">
            <button class="btn-footer-refresh" @click="fetchReportData" :disabled="isLoading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
              <span>Refresh Now</span>
            </button>
          </div>
        </footer>
      </section>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DailySalesReport',

  data() {
    const today = this.getTodayDateString();
    return {
      isLoading: false,
      leads: [],
      allQuotationsList: [],
      activeTab: 'overview',
      selectedUserFilter: '',
      searchQuery: '',
      lastRefreshedTime: '',
      autoRefreshInterval: 0,
      autoRefreshTimer: null,

      // Date Filtering Controls
      dateMode: 'single', // 'single' | 'range'
      datePreset: 'today', // 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'custom' | 'range'
      selectedDate: today,
      startDate: today,
      endDate: today
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

    canAccessAllLeads() {
      const role = (this.currentUser.role || '').toLowerCase();
      const dept = (this.currentUser.department || '').toLowerCase();
      return (
        role.includes('admin') ||
        role.includes('director') ||
        role.includes('manager') ||
        role.includes('lead') ||
        dept.includes('management') ||
        dept.includes('director') ||
        localStorage.getItem('authTab') === 'management'
      );
    },

    leadCreators() {
      const names = new Set();
      this.leads.forEach(l => {
        if (l.created_by_name) names.add(l.created_by_name);
      });
      return Array.from(names).sort();
    },

    todayDateString() {
      return this.getTodayDateString();
    },

    yesterdayDateString() {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return this.formatDateIso(d);
    },

    isViewingToday() {
      return this.dateMode === 'single' && this.selectedDate === this.todayDateString;
    },

    isViewingYesterday() {
      return this.dateMode === 'single' && this.selectedDate === this.yesterdayDateString;
    },

    formattedActiveDate() {
      if (this.dateMode === 'single') {
        if (this.isViewingToday) {
          return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        if (this.isViewingYesterday) {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          return y.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        try {
          const parts = this.selectedDate.split('-');
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch (e) {
          return this.selectedDate;
        }
      } else {
        return `${this.formatDisplayDate(this.startDate)} – ${this.formatDisplayDate(this.endDate)}`;
      }
    },

    dynamicReportTitle() {
      if (this.isViewingToday) {
        return "Today's  Sales Activity Report";
      }
      if (this.isViewingYesterday) {
        return "Yesterday's Sales Activity Report";
      }
      if (this.dateMode === 'single') {
        return `Sales Activity Report - ${this.formatDisplayDate(this.selectedDate)}`;
      }
      return `Sales Activity Report (${this.formattedActiveDate})`;
    },

    reportScopedLeads() {
      let list = this.leads;
      if (this.selectedUserFilter) {
        list = list.filter(
          l =>
            (l.created_by_name && l.created_by_name.toLowerCase() === this.selectedUserFilter.toLowerCase()) ||
            (l.assigned_to_name && l.assigned_to_name.toLowerCase() === this.selectedUserFilter.toLowerCase())
        );
      }
      return list;
    },

    // 1. Total New Leads in Selected Period
    todaysNewLeads() {
      return this.reportScopedLeads.filter(l => {
        if (!l.created_at) return false;
        return this.isDateInRange(l.created_at);
      });
    },

    todaysNewLeadsValue() {
      return this.todaysNewLeads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
    },

    filteredNewLeads() {
      if (!this.searchQuery.trim()) return this.todaysNewLeads;
      const q = this.searchQuery.toLowerCase();
      return this.todaysNewLeads.filter(l =>
        (l.company_name || '').toLowerCase().includes(q) ||
        (l.contact_person || '').toLowerCase().includes(q) ||
        (l.service_required || '').toLowerCase().includes(q) ||
        (l.created_by_name || '').toLowerCase().includes(q)
      );
    },

    // 2. Total Follow-Up Calls in Selected Period
    todaysFollowups() {
      const items = [];
      this.reportScopedLeads.forEach(lead => {
        if (Array.isArray(lead.followups)) {
          lead.followups.forEach(f => {
            const itemDate = f.date || f.created_at;
            if (this.isDateInRange(itemDate)) {
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

    filteredFollowups() {
      if (!this.searchQuery.trim()) return this.todaysFollowups;
      const q = this.searchQuery.toLowerCase();
      return this.todaysFollowups.filter(f =>
        (f.company_name || '').toLowerCase().includes(q) ||
        (f.contact_person || '').toLowerCase().includes(q) ||
        (f.note || '').toLowerCase().includes(q) ||
        (f.logged_by || '').toLowerCase().includes(q) ||
        (f.call_type || '').toLowerCase().includes(q)
      );
    },

    // 3. Total Send Quotations in Selected Period
    todaysQuotations() {
      const list = [];
      const seenQuotes = new Set();

      if (Array.isArray(this.allQuotationsList)) {
        this.allQuotationsList.forEach(q => {
          const itemDate = q.date || q.created_at;
          if (this.isDateInRange(itemDate)) {
            if (!this.selectedUserFilter || (q.created_by && q.created_by.toLowerCase() === this.selectedUserFilter.toLowerCase())) {
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

      this.reportScopedLeads.forEach(lead => {
        const isQuotationStage = ['send quotation', 'active quotations', 'quotation send'].some(
          st => (lead.status || '').toLowerCase() === st.toLowerCase()
        );
        const createdInPeriod = this.isDateInRange(lead.created_at);
        const hasQuoteFollowupInPeriod =
          Array.isArray(lead.followups) &&
          lead.followups.some(f => {
            const itemDate = f.date || f.created_at;
            return (
              this.isDateInRange(itemDate) &&
              ((f.call_type || '').toLowerCase().includes('quotation') ||
                (f.note || '').toLowerCase().includes('quotation'))
            );
          });

        if (isQuotationStage && (createdInPeriod || hasQuoteFollowupInPeriod)) {
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

    filteredQuotations() {
      if (!this.searchQuery.trim()) return this.todaysQuotations;
      const q = this.searchQuery.toLowerCase();
      return this.todaysQuotations.filter(qt =>
        (qt.quote_no || '').toLowerCase().includes(q) ||
        (qt.company_name || '').toLowerCase().includes(q) ||
        (qt.contact_person || '').toLowerCase().includes(q) ||
        (qt.created_by || '').toLowerCase().includes(q)
      );
    },

    // 4. Total PO Confirmed in Selected Period
    todaysPoConfirmed() {
      const list = [];

      this.reportScopedLeads.forEach(lead => {
        const isPoStatus = ['po confirmed', 'won', 'closed won', 'deal won'].some(
          st => (lead.status || '').toLowerCase() === st.toLowerCase()
        );
        if (isPoStatus) {
          const createdInPeriod = this.isDateInRange(lead.created_at);
          const hasPoFollowupInPeriod =
            Array.isArray(lead.followups) &&
            lead.followups.some(f => {
              const itemDate = f.date || f.created_at;
              return (
                this.isDateInRange(itemDate) &&
                ((f.status || '').toLowerCase().includes('po') ||
                  (f.status || '').toLowerCase().includes('won') ||
                  (f.call_type || '').toLowerCase().includes('order') ||
                  (f.note || '').toLowerCase().includes('po confirmed') ||
                  (f.note || '').toLowerCase().includes('won'))
              );
            });

          if (createdInPeriod || hasPoFollowupInPeriod) {
            // Check if created on same day as PO confirmation
            const leadCreatedDate = String(lead.created_at || '').slice(0, 10);
            let isSameDay = false;

            if (this.dateMode === 'single') {
              isSameDay = leadCreatedDate === this.selectedDate;
            } else {
              isSameDay = Boolean(lead.created_at && this.isDateInRange(lead.created_at));
            }

            list.push({
              ...lead,
              isSameDayConversion: isSameDay
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

    filteredPoConfirmed() {
      if (!this.searchQuery.trim()) return this.todaysPoConfirmed;
      const q = this.searchQuery.toLowerCase();
      return this.todaysPoConfirmed.filter(p =>
        (p.company_name || '').toLowerCase().includes(q) ||
        (p.contact_person || '').toLowerCase().includes(q) ||
        (p.service_required || '').toLowerCase().includes(q) ||
        (p.created_by_name || '').toLowerCase().includes(q)
      );
    },

    todaysLiveFeed() {
      const feed = [];

      // New leads
      this.todaysNewLeads.forEach(l => {
        feed.push({
          id: 'lead-' + l.id,
          leadId: l.id,
          type: 'lead',
          icon: 'fas fa-user-plus',
          color: '#2563eb',
          title: `New Lead: ${l.company_name}`,
          desc: `${l.contact_person || 'Client'} • Service: ${l.service_required || 'IT Solution'} • ₹${(l.deal_value || 0).toLocaleString('en-IN')}`,
          actor: l.created_by_name || 'Sales Executive',
          time: l.created_at
        });
      });

      // Follow-ups
      this.todaysFollowups.forEach(f => {
        feed.push({
          id: 'followup-' + (f.id || f.lead_id + f.date),
          leadId: f.lead_id,
          type: 'followup',
          icon: (f.call_type || '').toLowerCase().includes('call') ? 'fas fa-phone-alt' : 'fas fa-comments',
          color: '#8b5cf6',
          title: `Follow-up: ${f.company_name}`,
          desc: `${f.call_type || 'Discussion'}: "${f.note}" • Stage: ${f.status || f.lead_status || 'In Progress'}`,
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
          leadId: p.id,
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

    filteredLiveFeed() {
      if (!this.searchQuery.trim()) return this.todaysLiveFeed;
      const q = this.searchQuery.toLowerCase();
      return this.todaysLiveFeed.filter(item =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.desc || '').toLowerCase().includes(q) ||
        (item.actor || '').toLowerCase().includes(q)
      );
    }
  },

  mounted() {
    this.fetchReportData();
  },

  beforeUnmount() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  },

  methods: {
    getTodayDateString() {
      const now = new Date();
      return this.formatDateIso(now);
    },

    formatDateIso(d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    formatDisplayDate(isoDateStr) {
      if (!isoDateStr) return '';
      try {
        const parts = String(isoDateStr).slice(0, 10).split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return isoDateStr;
      } catch (e) {
        return isoDateStr;
      }
    },

    isDateInRange(dateValue) {
      if (!dateValue) return false;
      const d = String(dateValue).slice(0, 10);
      if (this.dateMode === 'single') {
        return d === this.selectedDate;
      } else {
        const start = this.startDate || this.todayDateString;
        const end = this.endDate || this.todayDateString;
        return d >= start && d <= end;
      }
    },

    // ════════ DATE PRESET / STEPPER ACTIONS ════════
    setPreset(preset) {
      this.datePreset = preset;
      const today = this.todayDateString;

      if (preset === 'today') {
        this.dateMode = 'single';
        this.selectedDate = today;
      } else if (preset === 'yesterday') {
        this.dateMode = 'single';
        this.selectedDate = this.yesterdayDateString;
      } else if (preset === 'last7') {
        this.dateMode = 'range';
        const d = new Date();
        d.setDate(d.getDate() - 6);
        this.startDate = this.formatDateIso(d);
        this.endDate = today;
      } else if (preset === 'thisMonth') {
        this.dateMode = 'range';
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.startDate = this.formatDateIso(startOfMonth);
        this.endDate = today;
      } else if (preset === 'custom') {
        this.dateMode = 'single';
      } else if (preset === 'range') {
        this.dateMode = 'range';
      }
    },

    goToPrevDay() {
      this.dateMode = 'single';
      const parts = this.selectedDate.split('-');
      const curr = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      curr.setDate(curr.getDate() - 1);
      this.selectedDate = this.formatDateIso(curr);

      if (this.selectedDate === this.yesterdayDateString) {
        this.datePreset = 'yesterday';
      } else {
        this.datePreset = 'custom';
      }
    },

    goToNextDay() {
      if (this.isViewingToday) return;
      this.dateMode = 'single';
      const parts = this.selectedDate.split('-');
      const curr = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      curr.setDate(curr.getDate() + 1);
      const nextStr = this.formatDateIso(curr);

      if (nextStr > this.todayDateString) return;
      this.selectedDate = nextStr;

      if (this.selectedDate === this.todayDateString) {
        this.datePreset = 'today';
      } else if (this.selectedDate === this.yesterdayDateString) {
        this.datePreset = 'yesterday';
      } else {
        this.datePreset = 'custom';
      }
    },

    onDateInputChange() {
      if (this.selectedDate === this.todayDateString) {
        this.datePreset = 'today';
      } else if (this.selectedDate === this.yesterdayDateString) {
        this.datePreset = 'yesterday';
      } else {
        this.datePreset = 'custom';
      }
    },

    onRangeInputChange() {
      this.datePreset = 'range';
      if (this.startDate > this.endDate) {
        this.endDate = this.startDate;
      }
    },

    // ════════ DATA FETCHING ════════
    async fetchReportData() {
      this.isLoading = true;
      try {
        const params = {
          user_id: this.currentUser.id,
          user_name: this.currentUser.name,
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
        } else {
          // Fallback to local storage if API is momentarily unreachable
          try {
            const saved = localStorage.getItem('crm_leads_data');
            if (saved) {
              this.leads = JSON.parse(saved);
            }
          } catch (e) {
            console.error('Local cache fallback error:', e);
          }
        }

        if (quotesRes.status === 'fulfilled' && Array.isArray(quotesRes.value.data)) {
          this.allQuotationsList = quotesRes.value.data;
        }

        const now = new Date();
        this.lastRefreshedTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (err) {
        console.error('Failed to fetch daily sales report data:', err);
      } finally {
        this.isLoading = false;
      }
    },

    setupAutoRefresh() {
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = null;
      }
      if (this.autoRefreshInterval > 0 && this.isViewingToday) {
        this.autoRefreshTimer = setInterval(() => {
          this.fetchReportData();
        }, this.autoRefreshInterval * 1000);
      }
    },

    formatCurrency(val) {
      return Number(val || 0).toLocaleString('en-IN');
    },

    formatDateTime(dt) {
      if (!dt) return '-';
      try {
        const d = new Date(dt);
        if (isNaN(d.getTime())) return String(dt);
        const timeStr = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        if (this.dateMode === 'range' || !this.isViewingToday) {
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `${dateStr}, ${timeStr}`;
        }
        return timeStr;
      } catch (e) {
        return String(dt);
      }
    },

    goToPipeline() {
      this.$router.push('/employee/lead-management');
    },

    closeCurrentTab() {
      window.close();
    },

    printReport() {
      window.print();
    },

    openLeadDetails(lead) {
      if (!lead || !lead.id) return;
      try {
        localStorage.setItem('active_lead_details', JSON.stringify(lead));
      } catch (e) {
        console.error('LocalStorage set error:', e);
      }
      const routeData = this.$router.resolve({
        path: '/employee/lead-details',
        query: { id: lead.id }
      });
      window.open(routeData.href, '_blank');
    },

    openLeadDetailsById(leadId) {
      const lead = this.leads.find(l => String(l.id) === String(leadId));
      if (lead) {
        this.openLeadDetails(lead);
      } else {
        const routeData = this.$router.resolve({
          path: '/employee/lead-details',
          query: { id: leadId }
        });
        window.open(routeData.href, '_blank');
      }
    }
  }
};
</script>

<style scoped>
/* ════════ BOX SIZING RESET & WRAPPER ════════ */
.daily-sales-report-page,
.daily-sales-report-page *,
.daily-sales-report-page *::before,
.daily-sales-report-page *::after {
  box-sizing: border-box;
}

.daily-sales-report-page {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  background: #f8fafc;
  color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

/* ════════ TOP HERO / WORKSPACE HEADER ════════ */
.report-top-header {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.btn-header-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-weight: 600;
  font-size: 0.84rem;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-header-back:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.header-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

.report-badge-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
  transition: all 0.2s ease;
}

.report-badge-icon.is-archive {
  background: linear-gradient(135deg, #475569, #334155);
  box-shadow: 0 4px 10px rgba(71, 85, 105, 0.25);
}

.report-header-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-with-pill {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.live-pulse-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 20px;
}

.archive-report-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 20px;
}

.live-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: livePulse 1.8s infinite;
}

@keyframes livePulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.report-subtitle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #64748b;
}

.meta-dot {
  color: #cbd5e1;
}

.calendar-pill, .sync-time-pill, .auto-refresh-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.auto-refresh-pill {
  color: #2563eb;
  font-weight: 600;
}

/* Header Right Actions */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.exec-filter-wrap, .auto-refresh-select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.filter-icon, .refresh-timer-icon {
  position: absolute;
  left: 10px;
  font-size: 0.76rem;
  color: #94a3b8;
  pointer-events: none;
}

.exec-filter-select, .auto-refresh-select {
  padding: 8px 12px 8px 30px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.exec-filter-select:hover, .auto-refresh-select:hover {
  border-color: #94a3b8;
}

.exec-filter-select:focus, .auto-refresh-select:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.btn-action-refresh, .btn-action-print, .btn-action-close {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn-action-refresh {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.btn-action-refresh:hover:not(:disabled) {
  background: #dbeafe;
  color: #1e40af;
}

.btn-action-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-action-print {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.btn-action-print:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-action-close {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.btn-action-close:hover {
  background: #ffe4e6;
  color: #9f1239;
}

/* ════════ DATE & TIMEFRAME NAVIGATION TOOLBAR ════════ */
.report-date-toolbar {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.date-presets-group {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.preset-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
}

.preset-chip:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.preset-chip.active {
  background: #2563eb;
  border-color: #1d4ed8;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.28);
}

.preset-chip.active i {
  color: #ffffff;
}

/* Center Stepper */
.date-navigator-box {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  padding: 2px 5px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.btn-step-day {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-step-day:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.btn-step-day:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: #f1f5f9;
}

.date-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.date-picker-icon {
  position: absolute;
  left: 8px;
  font-size: 0.74rem;
  color: #64748b;
  pointer-events: none;
}

.report-date-input {
  padding: 3px 6px 3px 26px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  cursor: pointer;
  height: 28px;
  transition: all 0.18s ease;
}

.report-date-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.range-date-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.range-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
}

.report-date-input.range {
  padding: 3px 6px;
  height: 28px;
}

.range-arrow {
  color: #94a3b8;
  font-size: 0.72rem;
}

/* Right Date Summary */
.date-active-display {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  flex-shrink: 0;
}

.active-date-label {
  color: #64748b;
  font-size: 0.72rem;
}

.active-date-val {
  color: #0f172a;
  font-weight: 700;
}

.today-tag-pill, .yesterday-tag-pill, .past-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 12px;
}

.today-tag-pill {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.yesterday-tag-pill {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.past-tag-pill {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

/* ════════ MAIN CONTENT CONTAINER ════════ */
.report-main-container {
  width: 100%;
  max-width: 1540px;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 14px 16px 36px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-x: hidden;
}

/* ════════ 4 CORE KPI CARDS (COMPACT & MODERN) ════════ */
.kpi-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.kpi-card {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  padding: 8px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: all 0.2s ease;
}

.kpi-card.card-blue::before { background: #2563eb; }
.kpi-card.card-purple::before { background: #8b5cf6; }
.kpi-card.card-amber::before { background: #f59e0b; }
.kpi-card.card-emerald::before { background: #10b981; }

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 6px 14px -2px rgba(0, 0, 0, 0.07);
}

.kpi-card.active {
  border-color: #2563eb;
  background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
}

.kpi-card.card-purple.active {
  border-color: #8b5cf6;
  background: linear-gradient(180deg, #f8f6ff 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.12);
}

.kpi-card.card-amber.active {
  border-color: #f59e0b;
  background: linear-gradient(180deg, #fffcf0 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.12);
}

.kpi-card.card-emerald.active {
  border-color: #10b981;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.12);
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.kpi-title {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #64748b;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.kpi-icon-pill {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.kpi-card:hover .kpi-icon-pill {
  transform: scale(1.08);
}

.icon-blue { background: #eff6ff; color: #2563eb; }
.icon-purple { background: #f5f3ff; color: #8b5cf6; }
.icon-amber { background: #fffbeb; color: #f59e0b; }
.icon-emerald { background: #ecfdf5; color: #10b981; }

.kpi-metric-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  margin: 1px 0;
}

.kpi-number {
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.1;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.kpi-trend-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.64rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.trend-blue { background: #eff6ff; color: #1d4ed8; }
.trend-purple { background: #f5f3ff; color: #7c3aed; }
.trend-amber { background: #fffbeb; color: #b45309; }
.trend-emerald { background: #ecfdf5; color: #047857; }

.kpi-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding-top: 4px;
  margin-top: 1px;
  border-top: 1px solid #f1f5f9;
  font-size: 0.7rem;
}

.kpi-sub-label {
  color: #64748b;
  font-weight: 500;
  font-size: 0.68rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.kpi-sub-value {
  font-weight: 700;
  font-size: 0.78rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.text-blue { color: #2563eb; }
.text-purple { color: #8b5cf6; }
.text-amber { color: #d97706; }
.text-emerald { color: #059669; }

/* ════════ SAME-DAY HIGHLIGHT BANNER (SLEEK & COMPACT) ════════ */
.same-day-banner {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%);
  color: #ffffff;
  border-radius: 10px;
  padding: 7px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(6, 95, 70, 0.16);
  border: 1px solid rgba(16, 185, 129, 0.35);
  width: 100%;
  box-sizing: border-box;
  gap: 10px;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.lightning-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fbbf24;
  color: #78350f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
  flex-shrink: 0;
}

.banner-text {
  min-width: 0;
  flex: 1;
}

.banner-title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-desc {
  margin: 1px 0 0;
  font-size: 0.74rem;
  color: #d1fae5;
  line-height: 1.35;
}

.banner-desc strong {
  color: #ffffff;
}

.banner-badge {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 3px 8px;
  border-radius: 14px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ════════ REPORT PANEL CONTENT ════════ */
.report-content-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.panel-header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}

.nav-tabs-list {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.16s ease;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.tab-btn.active {
  background: #1e293b;
  border-color: #1e293b;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(30, 41, 59, 0.22);
}

.tab-btn.active i {
  color: #ffffff !important;
}

.tab-count-bubble {
  background: #e2e8f0;
  color: #334155;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
}

.tab-btn.active .tab-count-bubble {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.tab-search-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 11px;
  font-size: 0.78rem;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 5px 28px 5px 30px;
  height: 32px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 18px;
  font-size: 0.78rem;
  color: #0f172a;
  outline: none;
  transition: all 0.18s ease;
}

.search-input:focus {
  background: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
}

.search-clear-btn {
  position: absolute;
  right: 9px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.76rem;
  cursor: pointer;
}

.search-clear-btn:hover {
  color: #475569;
}

/* ════════ PANEL BODY PANE ════════ */
.panel-body {
  padding: 20px;
  min-height: 420px;
}

/* Empty State */
.empty-state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin-bottom: 16px;
}

.empty-state-box h3 {
  margin: 0 0 8px;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
}

.empty-state-box p {
  margin: 0 0 20px;
  font-size: 0.85rem;
  color: #64748b;
  max-width: 480px;
  line-height: 1.5;
}

.btn-empty-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-empty-action:hover {
  background: #1d4ed8;
}

/* ════════ TIMELINE STREAM FEED ════════ */
.activity-timeline-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left-width: 3px;
  border-radius: 9px;
  padding: 11px 15px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.18s ease;
}

.feed-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateX(2px);
  border-color: #cbd5e1;
}

.feed-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.feed-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feed-header-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.feed-item-title {
  font-size: 0.86rem;
  font-weight: 700;
  color: #0f172a;
}

.feed-time-pill {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.feed-body-desc {
  margin: 0;
  font-size: 0.8rem;
  color: #334155;
  line-height: 1.45;
}

.feed-footer-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3px;
}

.feed-actor-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
}

.btn-feed-open-lead {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #2563eb;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
}

.btn-feed-open-lead:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

/* ════════ DATA TABLES ════════ */
.table-container {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  text-align: left;
}

.report-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.report-table th {
  padding: 9px 14px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.report-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.report-table tbody tr:hover {
  background: #f8fafc;
}

.table-entity {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entity-name {
  font-weight: 700;
  color: #0f172a;
}

.entity-sub {
  font-size: 0.74rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.contact-person-text {
  font-weight: 600;
  color: #334155;
}

.service-pill {
  display: inline-block;
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
}

.deal-value-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: #059669;
}

.deal-value-text.po-text {
  font-size: 0.95rem;
  color: #047857;
}

.stage-pill {
  display: inline-block;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
}

.stage-pill.quote-pill {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.owner-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: #475569;
}

.quote-ref-code {
  font-size: 0.82rem;
  color: #2563eb;
  font-family: monospace;
}

.same-day-speed-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 12px;
}

.standard-cycle-pill {
  display: inline-block;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
}

.call-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  color: #6d28d9;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.discussion-remarks-box {
  max-width: 450px;
}

.remarks-paragraph {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.45;
  color: #334155;
}

.btn-row-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #2563eb;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-row-action:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #64748b;
  font-size: 0.76rem;
}

/* ════════ PANEL FOOTER SUMMARY ════════ */
.panel-footer-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-summary-counts {
  font-size: 0.8rem;
  color: #475569;
}

.footer-summary-counts strong {
  color: #0f172a;
}

.footer-sep {
  margin: 0 6px;
  color: #cbd5e1;
}

.btn-footer-refresh {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #2563eb;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-footer-refresh:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #93c5fd;
}

/* ════════ RESPONSIVE DESIGN (DESKTOP, TABLET & MOBILE) ════════ */
@media (max-width: 1180px) {
  .kpi-cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .report-top-header {
    padding: 10px 16px;
  }
  .report-date-toolbar {
    padding: 8px 16px;
    gap: 10px;
  }
  .report-main-container {
    padding: 12px 16px 36px;
  }
}

@media (max-width: 1024px) {
  .report-top-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 16px;
  }
  .header-left {
    flex-wrap: wrap;
    gap: 10px;
  }
  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 8px;
  }
  .report-date-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px 16px;
  }
  .date-navigator-box {
    justify-content: center;
  }
  .date-active-display {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .report-page-title {
    font-size: 1.1rem;
  }
  .report-badge-icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
    border-radius: 9px;
  }
  .header-divider {
    display: none;
  }
  .title-with-pill {
    flex-wrap: wrap;
    gap: 6px;
  }
  .report-subtitle-row {
    flex-wrap: wrap;
    font-size: 0.72rem;
    gap: 6px;
  }
  .exec-filter-wrap, .auto-refresh-select-wrap {
    flex: 1 1 calc(50% - 6px);
    min-width: 130px;
  }
  .exec-filter-select, .auto-refresh-select {
    width: 100%;
  }
  .btn-action-refresh, .btn-action-print, .btn-action-close {
    flex: 1 1 calc(33.333% - 6px);
    justify-content: center;
    padding: 7px 8px;
    font-size: 0.76rem;
  }
  .date-presets-group {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 6px;
  }
  .date-presets-group::-webkit-scrollbar {
    display: none;
  }
  .preset-chip {
    flex-shrink: 0;
    white-space: nowrap;
  }
  .date-navigator-box {
    flex-wrap: wrap;
    justify-content: center;
  }
  .date-range-inputs {
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }
  .same-day-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
  }
  .banner-badge {
    align-self: flex-start;
  }
  .panel-header-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px 12px;
  }
  .nav-tabs-list {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 6px;
  }
  .nav-tabs-list::-webkit-scrollbar {
    display: none;
  }
  .tab-btn {
    flex-shrink: 0;
    white-space: nowrap;
  }
  .tab-search-box {
    width: 100%;
    min-width: 100%;
  }
  .panel-body {
    padding: 12px 10px;
  }
  .feed-card {
    padding: 10px 12px;
    gap: 10px;
  }
  .feed-footer-line {
    flex-wrap: wrap;
    gap: 6px;
  }
  .panel-footer-summary {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 8px;
  }
  .btn-footer-refresh {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .kpi-cards-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .report-main-container {
    padding: 10px 10px 24px;
    gap: 10px;
  }
  .btn-header-back {
    padding: 6px 10px;
    font-size: 0.78rem;
  }
  .date-active-display {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
  }
  .active-date-val {
    font-size: 0.8rem;
  }
  .table-container {
    -webkit-overflow-scrolling: touch;
  }
}

/* ════════ PRINT STYLES ════════ */
@media print {
  .report-top-header, .report-date-toolbar, .panel-header-toolbar, .panel-footer-summary, .btn-row-action, .btn-feed-open-lead {
    display: none !important;
  }
  .daily-sales-report-page {
    background: #ffffff !important;
  }
  .report-content-panel, .kpi-card {
    box-shadow: none !important;
    border: 1px solid #cbd5e1 !important;
  }
}
</style>
