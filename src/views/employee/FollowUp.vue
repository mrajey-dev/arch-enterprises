<template>
  <div class="pro-followup-container" v-if="!isMobile || !isSidebarVisible">
    <!-- Desktop & Tablet Hero Header -->
    <div class="pro-followup-hero">
      <div class="pro-hero-top">
        <div class="pro-hero-left">
          <div class="pro-hero-icon">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div>
            <div class="pro-hero-title-row">
              <h2 class="pro-hero-title">Quotation & Order Sheet</h2>
              <span class="pro-hero-badge">
                {{ totalCount }} Quotes
              </span>
            </div>
            <p class="pro-hero-subtitle">
              Track quotation lifecycle, client follow-up remarks, negotiations, and status conversions
            </p>
          </div>
        </div>

        <!-- Global Search Bar in Hero Header -->
        <div class="pro-hero-search-wrap">
          <i class="fas fa-search pro-search-icon"></i>
          <input 
            type="text" 
            v-model="filters.search" 
            placeholder="Search quotes, client, serial, staff..." 
            class="pro-hero-search-input"
            @input="onSearchInput"
          >
          <i v-if="isSearching" class="fas fa-spinner fa-spin pro-search-spinner"></i>
          <button 
            type="button" 
            v-if="filters.search" 
            class="pro-search-clear-btn" 
            @click="filters.search = ''; onSearchInput()"
            title="Clear search"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="pro-hero-actions">
          <button 
            type="button" 
            class="pro-hero-btn" 
            :class="{ active: showAdvancedFilters }" 
            @click="showAdvancedFilters = !showAdvancedFilters"
            :title="showAdvancedFilters ? 'Click to collapse filters' : 'Click to expand filters'"
          >
            <i class="fas fa-sliders-h"></i>
            <span>{{ showAdvancedFilters ? 'Hide Filters' : 'Filters' }}</span>
            <i class="fas" :class="showAdvancedFilters ? 'fa-chevron-up' : 'fa-chevron-down'" style="font-size: 0.72rem; opacity: 0.85;"></i>
            <span v-if="hasActiveFilters" class="pro-filter-dot"></span>
          </button>
          
          <button 
            type="button" 
            class="pro-hero-btn" 
            :class="{ active: sortOrder }" 
            @click="toggleSort"
            title="Sort by Total Taxable Value"
          >
            <i class="fas fa-sort-amount-down" v-if="sortOrder === 'desc'"></i>
            <i class="fas fa-sort-amount-up" v-else-if="sortOrder === 'asc'"></i>
            <i class="fas fa-arrow-down-wide-short" v-else></i>
            <span>Value {{ sortOrder ? (sortOrder === 'asc' ? 'Low→High' : 'High→Low') : 'Sort' }}</span>
          </button>

          <button 
            type="button" 
            class="pro-hero-btn pro-hero-btn-clear" 
            v-if="hasActiveFilters" 
            @click="clearFilters"
            title="Reset All Filters"
          >
            <i class="fas fa-rotate-left"></i> Reset
          </button>
        </div>
      </div>

      <!-- Quick Status Filter Pills in Hero Banner -->
      <div class="pro-status-chips-strip">
        <button 
          type="button" 
          class="pro-chip-btn" 
          :class="{ active: selectedStatus === '' }" 
          @click="setStatus('')"
        >
          <span class="chip-label">All Quotes</span>
          <span class="chip-count">{{ counts.all }}</span>
        </button>

        <button 
          type="button" 
          class="pro-chip-btn chip-pending" 
          :class="{ active: selectedStatus === 'pending' }" 
          @click="setStatus(selectedStatus === 'pending' ? '' : 'pending')"
        >
          <i class="fas fa-clock"></i>
          <span class="chip-label">Pending</span>
          <span class="chip-count">{{ counts.pending }}</span>
        </button>

        <button 
          type="button" 
          class="pro-chip-btn chip-followup" 
          :class="{ active: selectedStatus === 'followup' }" 
          @click="setStatus(selectedStatus === 'followup' ? '' : 'followup')"
        >
          <i class="fas fa-comments"></i>
          <span class="chip-label">Follow Up</span>
          <span class="chip-count">{{ counts.followup }}</span>
        </button>

        <button 
          type="button" 
          class="pro-chip-btn chip-approved" 
          :class="{ active: selectedStatus === 'approved' }" 
          @click="setStatus(selectedStatus === 'approved' ? '' : 'approved')"
        >
          <i class="fas fa-check-circle"></i>
          <span class="chip-label">Approved</span>
          <span class="chip-count">{{ counts.approved }}</span>
        </button>

        <button 
          type="button" 
          class="pro-chip-btn chip-rejected" 
          :class="{ active: selectedStatus === 'rejected' }" 
          @click="setStatus(selectedStatus === 'rejected' ? '' : 'rejected')"
        >
          <i class="fas fa-times-circle"></i>
          <span class="chip-label">Rejected</span>
          <span class="chip-count">{{ counts.rejected }}</span>
        </button>
      </div>
    </div>

    <!-- Advanced Collapsible Filter Panel -->
    <transition name="pro-slide">
      <div class="pro-filter-panel" v-if="showAdvancedFilters">
        <div class="pro-filter-panel-header">
          <div class="pro-filter-panel-title">
            <i class="fas fa-filter text-indigo"></i> Advanced Remote Search & Filter
          </div>
          <button type="button" class="pro-btn-close-filter" @click="showAdvancedFilters = false" title="Collapse Filters">
            <i class="fas fa-chevron-up"></i> Collapse
          </button>
        </div>
        <div class="pro-filter-grid">
          <div class="pro-filter-box">
            <label><i class="fas fa-user-pen"></i> Created By</label>
            <div class="pro-filter-input-wrap">
              <input type="text" v-model="filters.created_by" placeholder="Search creator..." class="pro-filter-input" @input="onSearchInput">
            </div>
          </div>
          <div class="pro-filter-box">
            <label><i class="fas fa-building"></i> Party / Customer</label>
            <div class="pro-filter-input-wrap">
              <input type="text" v-model="filters.party_name" placeholder="Search company name..." class="pro-filter-input" @input="onSearchInput">
            </div>
          </div>
          <div class="pro-filter-box">
            <label><i class="fas fa-barcode"></i> Engine Serial</label>
            <div class="pro-filter-input-wrap">
              <input type="text" v-model="filters.engine_serial" placeholder="Serial number..." class="pro-filter-input" @input="onSearchInput">
            </div>
          </div>
          <div class="pro-filter-box">
            <label><i class="fas fa-microchip"></i> Engine Model</label>
            <div class="pro-filter-input-wrap">
              <input type="text" v-model="filters.engine_model" placeholder="Model number..." class="pro-filter-input" @input="onSearchInput">
            </div>
          </div>
          <div class="pro-filter-box">
            <label><i class="fas fa-user-check"></i> Recommended By</label>
            <div class="pro-filter-input-wrap">
              <input type="text" v-model="filters.recommended_by" placeholder="Recommender name..." class="pro-filter-input" @input="onSearchInput">
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Content / Table Card -->
    <div class="pro-table-card">
      <!-- Loading State (Initial or Search) -->
      <div v-if="loading && followUpQuotations.length === 0" class="pro-loading-state">
        <div class="pro-spinner-container">
          <div class="pro-pulse-spinner"></div>
          <div class="pro-loading-text">
            <h3>Loading Quotations & Order Sheet...</h3>
            <p v-if="isSearching">Searching matching records from database...</p>
            <p v-else>Fetching quotations in lazy-loaded batches...</p>
          </div>
        </div>
        <!-- Shimmer Skeleton Rows -->
        <div class="pro-skeleton-table">
          <div class="pro-skeleton-row" v-for="n in 6" :key="n">
            <div class="skeleton-cell w-5"></div>
            <div class="skeleton-cell w-25"></div>
            <div class="skeleton-cell w-10"></div>
            <div class="skeleton-cell w-20"></div>
            <div class="skeleton-cell w-15"></div>
            <div class="skeleton-cell w-15"></div>
            <div class="skeleton-cell w-10"></div>
          </div>
        </div>
      </div>

      <!-- Mobile Cards View -->
      <div class="mobile-cards" v-else-if="isMobile">
        <!-- Mobile Table Info Bar -->
        <div class="pro-table-infobar" v-if="followUpQuotations.length > 0">
          <div class="pro-info-text">
            <span>Showing <strong>{{ followUpQuotations.length }}</strong> of <strong>{{ totalQuotations }}</strong> quotes</span>
            <span v-if="hasActiveFilters" class="pro-filtered-badge">Filtered</span>
          </div>
          <div v-if="isSearching" class="pro-search-status-inline">
            <i class="fas fa-spinner fa-spin"></i> Searching...
          </div>
        </div>

        <div v-for="(q, index) in filteredAndSortedQuotations" :key="q.id" 
             class="pro-mobile-card"
             :class="`border-status-${q.status || 'pending'}`">
          <div class="pro-mcard-header">
            <div class="pro-mcard-quote-group">
              <button class="pro-quote-link-btn" @click="openQuotation(q)" :title="'Open ' + getQuoteLinkText(q)">
                <i class="fas fa-file-invoice"></i>
                <span class="quote-text">{{ getQuoteLinkText(q) }}</span>
              </button>
              <button 
                type="button" 
                class="pro-quote-copy-btn" 
                :class="{ 'copied': copiedId === q.id }" 
                @click.stop="copyQuotationLinkText(q)" 
                :title="copiedId === q.id ? 'Copied!' : 'Copy ' + getQuoteLinkText(q)"
              >
                <i :class="copiedId === q.id ? 'fas fa-check' : 'fas fa-copy'"></i>
              </button>
            </div>
            <span :class="['pro-status-badge', `status-${q.status || 'pending'}`]">
              {{ q.status || 'Pending' }}
            </span>
          </div>

          <div class="pro-mcard-body">
            <div class="mcard-row">
              <span class="mcard-label"><i class="fas fa-calendar"></i> Date</span>
              <span class="mcard-value">{{ formatDate(q.created_at) }}</span>
            </div>
            <div class="mcard-row">
              <span class="mcard-label"><i class="fas fa-building"></i> Party</span>
              <span class="mcard-value font-bold">{{ q.company_name || '—' }}</span>
            </div>
            <div class="mcard-row">
              <span class="mcard-label"><i class="fas fa-cog"></i> Engine</span>
              <span class="mcard-value">{{ q.engine_serial || '—' }} / {{ q.model_no || '—' }}</span>
            </div>
            <div class="mcard-row">
              <span class="mcard-label"><i class="fas fa-indian-rupee-sign"></i> Taxable Value</span>
              <span class="mcard-value font-bold text-emerald">{{ calculateTaxableValue(q.items).toLocaleString('en-IN') }}</span>
            </div>
            <div class="mcard-row">
              <span class="mcard-label"><i class="fas fa-percent"></i> Discount</span>
              <span class="mcard-value">{{ getDiscountPercent(q.items) }}%</span>
            </div>
            <div class="mcard-row">
              <span class="mcard-label"><i class="fas fa-user"></i> Created By</span>
              <span class="mcard-value">{{ q.created_by || '—' }}</span>
            </div>
            
            <!-- Items -->
            <div class="mcard-items" v-if="q.items && q.items.length">
              <div class="mcard-label"><i class="fas fa-list"></i> Items ({{ q.items.length }})</div>
              <ul class="pro-items-list" :class="{ 'collapsed': !expandedQuotations[q.id] && q.items.length > 2 }">
                <li v-for="(item, idx) in q.items" :key="item.sr || idx" v-show="idx < 2 || expandedQuotations[q.id]">
                  <span class="bullet-dot">•</span> {{ item.description }}
                </li>
              </ul>
              <button v-if="q.items.length > 2" @click="toggleSeeMore(q.id)" class="pro-btn-see-more">
                {{ expandedQuotations[q.id] ? "See Less" : `+${q.items.length - 2} More Items` }}
              </button>
            </div>

            <!-- Status Dropdown -->
            <div class="mcard-row mcard-status-select-row">
              <span class="mcard-label"><i class="fas fa-tasks"></i> Status</span>
              <select v-model="q.status" class="pro-status-select" :class="`status-theme-${q.status || 'pending'}`" @change="updateQuotationStatus(q)">
                <option value="pending">⏳ Pending</option>
                <option value="followup">💬 Follow Up</option>
                <option value="approved">✔ Approved</option>
                <option value="rejected">✖ Rejected</option>
              </select>
            </div>

            <!-- Remarks -->
            <div class="mcard-remarks">
              <span class="mcard-label"><i class="fas fa-comment-dots"></i> Follow-up Remarks</span>
              <textarea v-model="q.remarks" placeholder="Add follow-up notes..." class="pro-remark-box" rows="2" @input="debounceSave(q)"></textarea>
            </div>
          </div>
        </div>

        <!-- Empty State Mobile -->
        <div v-if="filteredAndSortedQuotations.length === 0 && !loading" class="no-data-mobile">
          <i class="fas fa-inbox"></i>
          <p>No quotations match your search criteria</p>
        </div>

        <!-- Lazy Sentinel & Load More Mobile -->
        <div ref="lazySentinelMobile" class="lazy-sentinel"></div>

        <div v-if="loadingMore" class="pro-lazy-loader">
          <i class="fas fa-circle-notch fa-spin"></i>
          <span>Loading more quotations...</span>
        </div>

        <div v-if="hasMore && !loading && !loadingMore" class="pro-load-more-wrap">
          <button type="button" class="btn-pro-load-more" @click="fetchMoreQuotations">
            <i class="fas fa-arrow-down"></i> Load More Quotes ({{ totalQuotations - followUpQuotations.length }} remaining)
          </button>
        </div>

        <div v-else-if="!hasMore && followUpQuotations.length > 0 && !loading" class="pro-end-of-list">
          <i class="fas fa-check-circle text-emerald"></i> All {{ totalQuotations }} quotations loaded
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="table-scroll-wrapper" v-else>
        <!-- Table Info Bar -->
        <div class="pro-table-infobar" v-if="followUpQuotations.length > 0 || !loading">
          <div class="pro-info-text">
            <span>Showing <strong>{{ followUpQuotations.length }}</strong> of <strong>{{ totalQuotations }}</strong> quotations</span>
            <span v-if="hasActiveFilters" class="pro-filtered-badge">Filtered Search</span>
          </div>
          <div v-if="isSearching" class="pro-search-status-inline">
            <i class="fas fa-spinner fa-spin"></i> Searching database...
          </div>
        </div>

        <table class="pro-styled-table">
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">#</th>
              <th style="width: 280px; min-width: 250px;">QUOTATION NO.</th>
              <th style="width: 110px;">QUOTE DATE</th>
              <th style="width: 180px;">PARTY NAME</th>
              <th style="width: 150px;">ENGINE DETAILS</th>
              <th style="min-width: 220px;">ITEMS & DESCRIPTION</th>
              <th style="width: 130px; text-align: right;">
                <span class="pro-th-sortable" @click="toggleSort">
                  TAXABLE VALUE
                  <i class="fas fa-sort" v-if="!sortOrder"></i>
                  <i class="fas fa-arrow-up text-emerald" v-else-if="sortOrder === 'asc'"></i>
                  <i class="fas fa-arrow-down text-emerald" v-else></i>
                </span>
              </th>
              <th style="width: 85px; text-align: center;">DISC.(%)</th>
              <th style="width: 125px;">STAFF</th>
              <th style="min-width: 180px;">FOLLOW-UP REMARKS</th>
              <th style="width: 130px; text-align: center;">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(q, index) in filteredAndSortedQuotations" 
              :key="q.id"
              class="pro-table-row"
              :class="`row-status-${q.status || 'pending'}`"
            >
              <!-- Index -->
              <td class="cell-index text-center">{{ index + 1 }}</td>

              <!-- Quotation Link & Copy Button -->
              <td>
                <div class="pro-quote-cell">
                  <button 
                    type="button" 
                    class="pro-quote-link-btn" 
                    @click="openQuotation(q)"
                    :title="'Open ' + getQuoteLinkText(q)"
                  >
                    <i class="fas fa-file-invoice"></i>
                    <span class="quote-text">{{ getQuoteLinkText(q) }}</span>
                    <i class="fas fa-arrow-up-right-from-square text-xs opacity-75"></i>
                  </button>
                  <button 
                    type="button" 
                    class="pro-quote-copy-btn" 
                    :class="{ 'copied': copiedId === q.id }" 
                    @click.stop="copyQuotationLinkText(q)" 
                    :title="copiedId === q.id ? 'Copied!' : 'Copy ' + getQuoteLinkText(q)"
                  >
                    <i :class="copiedId === q.id ? 'fas fa-check' : 'fas fa-copy'"></i>
                  </button>
                </div>
              </td>

              <!-- Date -->
              <td>
                <div class="pro-cell-date">
                  <i class="fas fa-calendar-day text-slate"></i>
                  <span>{{ formatDate(q.created_at) }}</span>
                </div>
              </td>

              <!-- Party Name -->
              <td>
                <div class="pro-cell-party">
                  <i class="fas fa-building text-slate"></i>
                  <span class="party-name">{{ q.company_name }}</span>
                </div>
              </td>

              <!-- Engine Info -->
              <td>
                <div class="pro-engine-info-wrap">
                  <span class="pro-engine-pill serial" v-if="q.engine_serial" title="Engine Serial">
                    <i class="fas fa-barcode"></i> {{ q.engine_serial }}
                  </span>
                  <span class="pro-engine-pill model" v-if="q.model_no" title="Engine Model">
                    <i class="fas fa-microchip"></i> {{ q.model_no }}
                  </span>
                  <span v-if="!q.engine_serial && !q.model_no" class="text-muted text-xs">—</span>
                </div>
              </td>

              <!-- Description Items -->
              <td>
                <div class="pro-items-desc-wrap" v-if="q.items && q.items.length">
                  <ul class="pro-items-list" :class="{ 'collapsed': !expandedQuotations[q.id] && q.items.length > 2 }">
                    <li v-for="(item, idx) in q.items" :key="item.sr || idx" v-show="idx < 2 || expandedQuotations[q.id]">
                      <span class="bullet-dot">•</span> {{ item.description }}
                    </li>
                  </ul>
                  <button v-if="q.items.length > 2" @click="toggleSeeMore(q.id)" class="pro-btn-see-more">
                    {{ expandedQuotations[q.id] ? "See Less" : `+${q.items.length - 2} More Items` }}
                  </button>
                </div>
                <span v-else class="text-muted text-xs">—</span>
              </td>

              <!-- Value -->
              <td class="text-right">
                <span class="pro-cell-value">
                  {{ calculateTaxableValue(q.items).toLocaleString('en-IN') }}
                </span>
              </td>

              <!-- Discount -->
              <td class="text-center">
                <span v-if="Number(q.discount) === 0 || getDiscountPercent(q.items) == 0" class="pro-no-disc-tag">
                  0%
                </span>
                <span v-else class="pro-disc-badge">
                  {{ getDiscountPercent(q.items) }}%
                </span>
              </td>

              <!-- Staff Info -->
              <td>
                <div class="pro-staff-wrap">
                  <div class="staff-row" v-if="q.created_by" title="Created By">
                    <i class="fas fa-user-edit text-blue"></i>
                    <span>{{ q.created_by }}</span>
                  </div>
                  <div class="staff-row recommender" v-if="q.recommended_by" title="Recommended By">
                    <i class="fas fa-user-check text-emerald"></i>
                    <span>{{ q.recommended_by }}</span>
                  </div>
                  <span v-if="!q.created_by && !q.recommended_by" class="text-muted text-xs">—</span>
                </div>
              </td>

              <!-- Remarks -->
              <td>
                <textarea 
                  v-model="q.remarks" 
                  placeholder="Add follow-up notes..." 
                  class="pro-remark-box" 
                  rows="2" 
                  @input="debounceSave(q)"
                ></textarea>
              </td>

              <!-- Status -->
              <td class="text-center">
                <div class="pro-status-dropdown-wrap">
                  <select 
                    v-model="q.status" 
                    class="pro-status-select" 
                    :class="`status-theme-${q.status || 'pending'}`" 
                    @change="updateQuotationStatus(q)"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="followup">💬 Follow Up</option>
                    <option value="approved">✔ Approved</option>
                    <option value="rejected">✖ Rejected</option>
                  </select>
                </div>
              </td>
            </tr>

            <!-- Empty Row -->
            <tr v-if="filteredAndSortedQuotations.length === 0 && !loading">
              <td colspan="11" class="pro-table-empty">
                <div class="pro-empty-card">
                  <div class="empty-icon-wrap">
                    <i class="fas fa-folder-open"></i>
                  </div>
                  <h4>No Quotations Found</h4>
                  <p>No quotation records matched your search/filter criteria.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Lazy Loading Sentinel & Load More Indicator -->
        <div ref="lazySentinelDesktop" class="lazy-sentinel"></div>

        <div v-if="loadingMore" class="pro-lazy-loader">
          <i class="fas fa-circle-notch fa-spin"></i>
          <span>Loading more quotations (Page {{ page }})...</span>
        </div>

        <div v-if="hasMore && !loading && !loadingMore" class="pro-load-more-wrap">
          <button type="button" class="btn-pro-load-more" @click="fetchMoreQuotations">
            <i class="fas fa-angles-down"></i> Load More Quotations ({{ totalQuotations - followUpQuotations.length }} remaining)
          </button>
        </div>

        <div v-else-if="!hasMore && followUpQuotations.length > 0 && !loading" class="pro-end-of-list">
          <i class="fas fa-check-circle text-emerald"></i> All {{ totalQuotations }} quotations loaded
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  name: "FollowUp",
  data() {
    return {
      expandedQuotations: {},
      copiedId: null,
      selectedStatus: "",
      debounceTimers: {},
      searchDebounceTimer: null,
      isMobile: false,
      isSidebarVisible: true,
      filterOpen: false,
      showAdvancedFilters: false,
      financialYear: "2025-26",
      followUpQuotations: [],
      sortOrder: null, // 'asc' or 'desc' or null
      filters: {
        search: '',
        created_by: '',
        party_name: '',
        engine_serial: '',
        engine_model: '',
        recommended_by: ''
      },
      // Pagination & Lazy Loading state
      page: 1,
      perPage: 25,
      totalQuotations: 0,
      hasMore: false,
      loading: false,
      loadingMore: false,
      isSearching: false,
      counts: {
        all: 0,
        pending: 0,
        followup: 0,
        approved: 0,
        rejected: 0
      },
      observer: null
    };
  },
  computed: {
    hasActiveFilters() {
      return this.selectedStatus !== '' || 
             this.filters.search !== '' ||
             this.filters.created_by !== '' ||
             this.filters.party_name !== '' ||
             this.filters.engine_serial !== '' ||
             this.filters.engine_model !== '' ||
             this.filters.recommended_by !== '' ||
             this.sortOrder !== null;
    },
    filteredAndSortedQuotations() {
      let list = [...this.followUpQuotations];
      
      // Apply sorting by value if sortOrder selected
      if (this.sortOrder) {
        list.sort((a, b) => {
          const valueA = this.calculateTaxableValue(a.items);
          const valueB = this.calculateTaxableValue(b.items);
          return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        });
      }
      
      return list;
    },
    pendingCount() {
      return this.counts.pending || 0;
    },
    followupCount() {
      return this.counts.followup || 0;
    },
    approvedCount() {
      return this.counts.approved || 0;
    },
    rejectedCount() {
      return this.counts.rejected || 0;
    },
    totalCount() {
      return this.counts.all || this.totalQuotations || this.followUpQuotations.length;
    }
  },
  methods: {
    setStatus(status) {
      if (this.selectedStatus === status) {
        this.selectedStatus = '';
      } else {
        this.selectedStatus = status;
      }
      this.resetAndFetchQuotations();
    },
    setSortOrder(order) {
      if (this.sortOrder === order) {
        this.sortOrder = null;
      } else {
        this.sortOrder = order;
      }
    },
    clearSort() {
      this.sortOrder = null;
      toastInfo("Sorting cleared");
    },
    toggleSort() {
      if (this.sortOrder === null) {
        this.sortOrder = 'asc';
      } else if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      } else {
        this.sortOrder = null;
      }
    },
    onSearchInput() {
      this.isSearching = true;
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = setTimeout(() => {
        this.resetAndFetchQuotations();
      }, 350);
    },
    applyFilters() {
      this.onSearchInput();
    },
    clearFilters() {
      this.selectedStatus = '';
      this.filters.search = '';
      this.filters.created_by = '';
      this.filters.party_name = '';
      this.filters.engine_serial = '';
      this.filters.engine_model = '';
      this.filters.recommended_by = '';
      this.sortOrder = null;
      this.filterOpen = false;
      toastInfo("All filters and sorting cleared");
      this.resetAndFetchQuotations();
    },
    toggleFilter() {
      this.filterOpen = !this.filterOpen;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    getQuoteLinkText(q) {
      if (!q) return '';
      const quoteId = q.id || '';
      const company = this.formatCompanyName(q.company_name);
      return company ? `Quotation-${quoteId}-${company}.pdf` : `Quotation-${quoteId}.pdf`;
    },
    copyQuotationLinkText(q) {
      const textToCopy = this.getQuoteLinkText(q);
      const copyToClipboard = (text) => {
        if (navigator.clipboard && window.isSecureContext) {
          return navigator.clipboard.writeText(text);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          return new Promise((resolve, reject) => {
            const successful = document.execCommand("copy");
            textArea.remove();
            if (successful) resolve();
            else reject(new Error("Copy command failed"));
          });
        }
      };

      copyToClipboard(textToCopy)
        .then(() => {
          this.copiedId = q.id;
          toastSuccess(`Copied: ${textToCopy}`);
          setTimeout(() => {
            if (this.copiedId === q.id) {
              this.copiedId = null;
            }
          }, 2000);
        })
        .catch(err => {
          console.error("Failed to copy:", err);
          toastError("Failed to copy");
        });
    },
    openQuotation(q) {
      localStorage.setItem("selectedQuotationId", q.id);
      window.open("/quotation", "_blank");
    },
    toggleSeeMore(quotationId) {
      this.expandedQuotations = {
        ...this.expandedQuotations,
        [quotationId]: !this.expandedQuotations[quotationId]
      };
    },
    calculateTaxableValue(items) {
      if (!items || !items.length) return 0;
      return items.reduce((sum, item) => {
        const rate = Number(item.rate || 0);
        const qty = Number(item.qty || 0);
        const discount = Number(item.discount || 0);
        const gross = rate * qty;
        const discountAmount = gross * (discount / 100);
        const taxable = gross - discountAmount;
        return sum + taxable;
      }, 0);
    },
    formatCompanyName(name) {
      if (!name) return '';
      return name.replace(/\./g, '').trim();
    },
    saveRemark(q) {
      axios.put(`/api/quotations/${q.id}`, { remarks: q.remarks })
        .then(() => toastSuccess("Remarks saved"))
        .catch(() => toastError("Failed to save remark"));
    },
    debounceSave(q) {
      if (this.debounceTimers[q.id]) {
        clearTimeout(this.debounceTimers[q.id]);
      }
      this.debounceTimers[q.id] = setTimeout(() => {
        this.saveRemark(q);
        delete this.debounceTimers[q.id];
      }, 1000);
    },
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("en-IN");
    },
    getDiscountPercent(items) {
      if (!items || !items.length) return 0;
      let totalAmount = 0;
      let totalDiscountAmount = 0;
      items.forEach(item => {
        const rate = Number(item.rate || 0);
        const qty = Number(item.qty || 0);
        const discount = Number(item.discount || 0);
        const gross = rate * qty;
        const discountAmount = gross * (discount / 100);
        totalAmount += gross;
        totalDiscountAmount += discountAmount;
      });
      if (totalAmount === 0) return 0;
      return ((totalDiscountAmount / totalAmount) * 100).toFixed(2);
    },
    updateQuotationStatus(q) {
      axios.post(`/api/quotations/${q.id}/status`, { 
        quotation_followup_status: q.status,
        remarks: q.remarks 
      })
      .then(res => {
        toastSuccess(res.data.message || "Status updated");
        this.fetchStatusCounts();
      })
      .catch(err => {
        console.error(err);
        toastError("Failed to update status");
      });
    },
    fetchStatusCounts() {
      // Refresh count summary in background
      axios.get("/api/quotations", { params: { page: 1, per_page: 1, lazy: 1 } })
        .then(res => {
          if (res.data && res.data.counts) {
            this.counts = res.data.counts;
          }
        })
        .catch(() => {});
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    resetAndFetchQuotations() {
      this.page = 1;
      this.hasMore = false;
      this.fetchQuotations(true);
    },
    fetchQuotations(isReset = false) {
      if (isReset) {
        this.loading = true;
      }
      
      const params = {
        page: this.page,
        per_page: this.perPage,
        lazy: 1
      };

      if (this.filters.search && this.filters.search.trim()) {
        params.search = this.filters.search.trim();
      }
      if (this.filters.created_by && this.filters.created_by.trim()) {
        params.created_by = this.filters.created_by.trim();
      }
      if (this.filters.party_name && this.filters.party_name.trim()) {
        params.party_name = this.filters.party_name.trim();
      }
      if (this.filters.engine_serial && this.filters.engine_serial.trim()) {
        params.engine_serial = this.filters.engine_serial.trim();
      }
      if (this.filters.engine_model && this.filters.engine_model.trim()) {
        params.engine_model = this.filters.engine_model.trim();
      }
      if (this.filters.recommended_by && this.filters.recommended_by.trim()) {
        params.recommended_by = this.filters.recommended_by.trim();
      }
      if (this.selectedStatus) {
        params.status = this.selectedStatus;
      }

      axios.get("/api/quotations", { params })
        .then(res => {
          let rawData = [];
          if (res.data && res.data.data) {
            rawData = res.data.data;
            this.totalQuotations = res.data.total || 0;
            this.hasMore = Boolean(res.data.has_more);
            if (res.data.counts) {
              this.counts = res.data.counts;
            }
          } else if (Array.isArray(res.data)) {
            rawData = res.data;
            this.totalQuotations = rawData.length;
            this.hasMore = false;
          }

          const mapped = rawData.map(q => ({
            ...q,
            items: (typeof q.items === 'string') ? (JSON.parse(q.items) || []) : (q.items || []),
            status: q.quotation_followup_status
              ? q.quotation_followup_status.toLowerCase()
              : (q.status ? q.status.toLowerCase() : 'pending'),
            remarks: q.remarks || ''
          }));

          if (isReset || this.page === 1) {
            this.followUpQuotations = mapped;
          } else {
            const existingIds = new Set(this.followUpQuotations.map(x => x.id));
            const freshItems = mapped.filter(x => !existingIds.has(x.id));
            this.followUpQuotations = [...this.followUpQuotations, ...freshItems];
          }

          this.$nextTick(() => {
            this.setupIntersectionObserver();
          });
        })
        .catch(err => {
          console.error(err);
          toastError('Failed to fetch quotations');
        })
        .finally(() => {
          this.loading = false;
          this.loadingMore = false;
          this.isSearching = false;
        });
    },
    fetchMoreQuotations() {
      if (this.loading || this.loadingMore || !this.hasMore) return;
      this.loadingMore = true;
      this.page++;
      this.fetchQuotations(false);
    },
    setupIntersectionObserver() {
      if (this.observer) {
        this.observer.disconnect();
      }

      const sentinel = this.$refs.lazySentinelDesktop || this.$refs.lazySentinelMobile;
      if (!sentinel) return;

      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0] && entries[0].isIntersecting && this.hasMore && !this.loading && !this.loadingMore) {
            this.fetchMoreQuotations();
          }
        },
        { root: null, rootMargin: "250px", threshold: 0.1 }
      );

      this.observer.observe(sentinel);
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchQuotations(true);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* =========================================================
   PRO FOLLOW-UP PAGE STYLING
   ========================================================= */
.pro-followup-container {
  padding: 1.5rem 2rem;
  background: #f1f5f9;
  min-height: calc(100vh - 60px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* =========================================================
   HERO HEADER & STATUS CHIPS STRIP
   ========================================================= */
.pro-followup-hero {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
  border-radius: 20px;
  padding: 1.5rem 2rem;
  color: #ffffff;
  box-shadow: 0 10px 25px -5px rgba(49, 46, 129, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.pro-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.pro-hero-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pro-hero-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #ffffff;
  backdrop-filter: blur(8px);
  flex-shrink: 0;
}

.pro-hero-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pro-hero-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.pro-hero-badge {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #e0e7ff;
}

.pro-hero-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.82rem;
  color: #c7d2fe;
}

.pro-hero-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.pro-hero-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 380px;
  min-width: 220px;
}

.pro-search-icon {
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  pointer-events: none;
}

.pro-hero-search-input {
  width: 100%;
  padding: 8px 34px 8px 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.pro-hero-search-input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

.pro-hero-search-input:focus {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
}

.pro-search-spinner {
  position: absolute;
  right: 12px;
  color: #93c5fd;
  font-size: 0.85rem;
}

.pro-search-clear-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 2px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.pro-search-clear-btn:hover {
  color: #ffffff;
}

.pro-hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  position: relative;
}

.pro-hero-btn:hover, .pro-hero-btn.active {
  background: #ffffff;
  color: #312e81;
  border-color: #ffffff;
  transform: translateY(-1px);
}

.pro-hero-btn-clear {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.4);
}

.pro-hero-btn-clear:hover {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.pro-filter-dot {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 9px;
  height: 9px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

/* Status Chips Strip */
.pro-status-chips-strip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 1rem;
}

.pro-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #e0e7ff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 6px 14px;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.pro-chip-btn .chip-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 7px;
  border-radius: 12px;
  font-size: 0.72rem;
}

.pro-chip-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  transform: translateY(-1px);
}

.pro-chip-btn.active {
  background: #ffffff;
  color: #1e1b4b;
  border-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pro-chip-btn.active .chip-count {
  background: #1e1b4b;
  color: #ffffff;
}

/* Specific Active Pill Styles */
.pro-chip-btn.chip-pending.active {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}
.pro-chip-btn.chip-pending.active .chip-count {
  background: #92400e;
  color: #ffffff;
}

.pro-chip-btn.chip-followup.active {
  background: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}
.pro-chip-btn.chip-followup.active .chip-count {
  background: #3730a3;
  color: #ffffff;
}

.pro-chip-btn.chip-approved.active {
  background: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}
.pro-chip-btn.chip-approved.active .chip-count {
  background: #065f46;
  color: #ffffff;
}

.pro-chip-btn.chip-rejected.active {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}
.pro-chip-btn.chip-rejected.active .chip-count {
  background: #991b1b;
  color: #ffffff;
}

/* =========================================================
   COLLAPSIBLE ADVANCED FILTERS PANEL
   ========================================================= */
.pro-filter-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.pro-slide-enter-active,
.pro-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.pro-slide-enter-from,
.pro-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.pro-filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.pro-filter-panel-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pro-btn-close-filter {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
}

.pro-btn-close-filter:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.pro-filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.pro-filter-box {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.pro-filter-box label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 5px;
}

.pro-filter-input {
  width: 100%;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 0.82rem;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.2s;
  box-sizing: border-box;
}

.pro-filter-input:focus {
  outline: none;
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

/* =========================================================
   TABLE CARD & STYLED DATA TABLE
   ========================================================= */
.pro-table-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.table-scroll-wrapper {
  max-height: calc(100vh - 280px);
  overflow-x: auto;
  overflow-y: auto;
}

.pro-styled-table {
  width: 100%;
  min-width: 1200px;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.pro-styled-table thead {
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 2px solid #e2e8f0;
}

.pro-styled-table th {
  padding: 0.9rem 1rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1.5px solid #e2e8f0;
  background: #f8fafc;
}

.pro-th-sortable {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: color 0.15s;
}

.pro-th-sortable:hover {
  color: #4f46e5;
}

.pro-styled-table td {
  padding: 0.9rem 1rem;
  font-size: 0.85rem;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.pro-table-row {
  transition: all 0.2s ease;
  background: #ffffff;
}

/* Status-Specific Row Backgrounds & Accents (Deeper / More Vibrant Colors) */
.pro-table-row.row-status-pending {
  background: #fef08a !important;
  border-left: 5.5px solid #d97706 !important;
}
.pro-table-row.row-status-pending:hover {
  background: #fde047 !important;
}

.pro-table-row.row-status-followup {
  background: #bae6fd !important;
  border-left: 5.5px solid #0284c7 !important;
}
.pro-table-row.row-status-followup:hover {
  background: #93c5fd !important;
}

.pro-table-row.row-status-approved {
  background: #bbf7d0 !important;
  border-left: 5.5px solid #16a34a !important;
}
.pro-table-row.row-status-approved:hover {
  background: #86efac !important;
}

.pro-table-row.row-status-rejected {
  background: #fecaca !important;
  border-left: 5.5px solid #dc2626 !important;
}
.pro-table-row.row-status-rejected:hover {
  background: #fca5a5 !important;
}

.cell-index {
  font-weight: 800;
  color: #334155;
  font-size: 0.8rem;
}

/* Quotation Link Button & Copy Button */
.pro-quote-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pro-quote-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eff6ff;
  color: #0284c7;
  border: 1px solid #bae6fd;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  max-width: 100%;
}

.pro-quote-link-btn .quote-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.pro-quote-link-btn:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(2, 132, 199, 0.2);
}

.pro-quote-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  background: #ffffff;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.18s ease;
}

.pro-quote-copy-btn:hover {
  background: #f1f5f9;
  color: #0284c7;
  border-color: #93c5fd;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(2, 132, 199, 0.15);
}

.pro-quote-copy-btn.copied {
  background: #dcfce7 !important;
  color: #15803d !important;
  border-color: #86efac !important;
}

.pro-mcard-quote-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

/* Cell Elements */
.pro-cell-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #475569;
  font-weight: 600;
}

.pro-cell-party {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pro-cell-party .party-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.85rem;
}

/* Engine Info Badges */
.pro-engine-info-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pro-engine-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
}

.pro-engine-pill.serial {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.pro-engine-pill.model {
  background: #ede9fe;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}

/* Description Items */
.pro-items-desc-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pro-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.78rem;
  color: #334155;
}

.pro-items-list li {
  white-space: normal;
  line-height: 1.35;
}

.pro-items-list .bullet-dot {
  color: #6366f1;
  font-weight: bold;
}

.pro-btn-see-more {
  align-self: flex-start;
  background: none;
  border: none;
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.72rem;
  cursor: pointer;
  padding: 2px 0;
  transition: color 0.15s;
}

.pro-btn-see-more:hover {
  color: #312e81;
  text-decoration: underline;
}

/* Cell Value & Discount */
.pro-cell-value {
  font-size: 0.92rem;
  font-weight: 800;
  color: #059669;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.pro-disc-badge {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.74rem;
  font-weight: 700;
}

.pro-no-disc-tag {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Staff Column */
.pro-staff-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.staff-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #334155;
}

.staff-row.recommender {
  color: #059669;
}

/* Remarks Textarea */
.pro-remark-box {
  width: 100%;
  resize: vertical;
  padding: 6px 9px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.78rem;
  color: #1e293b;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.2s;
  min-height: 48px;
}

.pro-remark-box:focus {
  outline: none;
  background: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
}

/* Status Dropdown */
.pro-status-dropdown-wrap {
  display: flex;
  justify-content: center;
}

.pro-status-select {
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  border: 1.5px solid transparent;
  transition: all 0.2s;
  text-align: center;
}

.pro-status-select.status-theme-pending {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.pro-status-select.status-theme-followup {
  background: #e0f2fe;
  color: #0369a1;
  border-color: #bae6fd;
}

.pro-status-select.status-theme-approved {
  background: #dcfce7;
  color: #15803d;
  border-color: #bbf7d0;
}

.pro-status-select.status-theme-rejected {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

/* Table Empty State */
.pro-table-empty {
  padding: 4rem 1rem !important;
  text-align: center;
}

.pro-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #94a3b8;
}

.pro-empty-card h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.pro-empty-card p {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
}

/* =========================================================
   MOBILE CARDS & RESPONSIVENESS
   ========================================================= */
.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.pro-mobile-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: all 0.2s ease;
}

.pro-mobile-card.border-status-pending { background: #fef08a; border-left: 5.5px solid #d97706; }
.pro-mobile-card.border-status-followup { background: #bae6fd; border-left: 5.5px solid #0284c7; }
.pro-mobile-card.border-status-approved { background: #bbf7d0; border-left: 5.5px solid #16a34a; }
.pro-mobile-card.border-status-rejected { background: #fecaca; border-left: 5.5px solid #dc2626; }

.pro-mcard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.pro-status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
}
.pro-status-badge.status-pending { background: #fef3c7; color: #92400e; }
.pro-status-badge.status-followup { background: #ede9fe; color: #5b21b6; }
.pro-status-badge.status-approved { background: #dcfce7; color: #15803d; }
.pro-status-badge.status-rejected { background: #fee2e2; color: #991b1b; }

.pro-mcard-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.mcard-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
}

.mcard-label {
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.mcard-value {
  color: #0f172a;
  font-weight: 600;
}

.mcard-items {
  margin-top: 4px;
}

.mcard-remarks {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

/* =========================================================
   LOADING STATE, SKELETON SHIMMER & LAZY LOAD STYLES
   ========================================================= */
.pro-loading-state {
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.pro-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.pro-pulse-spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid #e0e7ff;
  border-top-color: #4f46e5;
  border-right-color: #6366f1;
  animation: pro-spin 0.85s linear infinite;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
}

@keyframes pro-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pro-loading-text h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e1b4b;
}

.pro-loading-text p {
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: #64748b;
}

/* Skeleton Shimmer Table */
.pro-skeleton-table {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pro-skeleton-row {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #edf2f7;
}

.skeleton-cell {
  height: 20px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: pro-shimmer 1.5s infinite;
}

@keyframes pro-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.w-5 { width: 5%; }
.w-10 { width: 10%; }
.w-15 { width: 15%; }
.w-20 { width: 20%; }
.w-25 { width: 25%; }

/* Table Info Bar */
.pro-table-infobar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.82rem;
  color: #475569;
}

.pro-info-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pro-filtered-badge {
  background: #ede9fe;
  color: #6d28d9;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.pro-search-status-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4f46e5;
  font-weight: 600;
  font-size: 0.8rem;
}

/* Lazy Loading & Load More Elements */
.lazy-sentinel {
  height: 20px;
  width: 100%;
  pointer-events: none;
}

.pro-lazy-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 1.25rem 1rem;
  color: #4f46e5;
  font-size: 0.88rem;
  font-weight: 600;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.pro-load-more-wrap {
  display: flex;
  justify-content: center;
  padding: 1.25rem 1rem;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
}

.btn-pro-load-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(67, 56, 202, 0.08);
}

.btn-pro-load-more:hover {
  background: #4338ca;
  color: #ffffff;
  border-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 56, 202, 0.2);
}

.pro-end-of-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 1.25rem 1rem;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

@media (max-width: 768px) {
  .pro-followup-container {
    padding: 1rem;
  }

  .pro-followup-hero {
    padding: 1.25rem;
  }

  .pro-hero-search-wrap {
    max-width: 100%;
    width: 100%;
    order: 3;
  }
}
</style>