<template>
  <div class="layout">
    <div class="main-content">
      <!-- Universal Sidebar Component -->
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Main Content Area -->
      <div 
        class="content all-quotations-page" 
        :class="{ 'hide-content': isMobile && isSidebarVisible }"
      >
        <!-- ════════ TOP HERO HEADER ════════ -->
        <section class="quote-hero-header">
          <div class="quote-hero-top">
            <div class="quote-hero-title-area">
              <div class="quote-eyebrow-pill">
                <span class="quote-pulse-dot"></span>
                <i class="fas fa-file-invoice-dollar"></i> COMMERCIAL DIRECTORY
              </div>
              <h1 class="quote-main-heading">All Customer Quotations</h1>
              <p class="quote-sub-heading">
                Browse, search, filter, and track all commercial proposals and quotations across enterprise clients.
              </p>
            </div>

            <!-- Header Action Controls -->
            <div class="quote-header-actions">
              <button 
                type="button" 
                class="btn-hero-action btn-back-crm"
                @click="goBackToCrm"
                title="Return to Customers & POs"
              >
                <i class="fas fa-arrow-left"></i>
                <span>Back to CRM</span>
              </button>

              <button 
                type="button" 
                class="btn-hero-action btn-refresh"
                @click="fetchQuotations"
                :disabled="quotationLoading"
                title="Refresh Quotations"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': quotationLoading }"></i>
                <span>Refresh</span>
              </button>

              <button 
                type="button" 
                class="btn-hero-action btn-new-quote"
                @click="createNewQuotation"
                title="Generate new commercial proposal"
              >
                <i class="fas fa-plus-circle"></i>
                <span>New Quotation</span>
              </button>
            </div>
          </div>

          <!-- ════════ KPI METRICS & FINANCIAL STRIP ════════ -->
          <div class="quote-stats-grid">
            <!-- Total Count Card -->
            <div class="quote-stat-card card-blue" @click="filterStatus = ''" :class="{ active: filterStatus === '' }">
              <div class="stat-icon-wrap"><i class="fas fa-layer-group"></i></div>
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-count">{{ quotations.length }}</span>
                  <span class="stat-badge badge-blue">Total</span>
                </div>
                <span class="stat-label">All Quotations</span>
              </div>
            </div>

            <!-- Grand Total INR Card -->
            <div class="quote-stat-card card-emerald financial-card">
              <div class="stat-icon-wrap"><i class="fas fa-wallet"></i></div>
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-count font-mono">₹ {{ formattedTotalInr }}</span>
                  <button 
                    type="button" 
                    class="stat-gst-toggle" 
                    :class="showGstInclusive ? 'gst-on' : 'gst-off'"
                    @click.stop="showGstInclusive = !showGstInclusive"
                    :title="showGstInclusive ? 'Click to show without tax' : 'Click to show with GST'"
                  >
                    {{ showGstInclusive ? 'GST Incl.' : 'GST Excl.' }}
                  </button>
                </div>
                <span class="stat-label">Grand Total (INR)</span>
              </div>
            </div>

            <!-- Pending Status -->
            <div class="quote-stat-card card-amber" @click="filterStatus = 'pending'" :class="{ active: filterStatus === 'pending' }">
              <div class="stat-icon-wrap"><i class="fas fa-hourglass-half"></i></div>
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-count">{{ countByStatus('pending') }}</span>
                  <span class="stat-badge badge-amber">Awaiting</span>
                </div>
                <span class="stat-label">Pending</span>
              </div>
            </div>

            <!-- Follow-up Status -->
            <div class="quote-stat-card card-purple" @click="filterStatus = 'followup'" :class="{ active: filterStatus === 'followup' }">
              <div class="stat-icon-wrap"><i class="fas fa-phone-volume"></i></div>
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-count">{{ countByStatus('followup') }}</span>
                  <span class="stat-badge badge-purple">Pipeline</span>
                </div>
                <span class="stat-label">Follow-up</span>
              </div>
            </div>

            <!-- Approved Status -->
            <div class="quote-stat-card card-green" @click="filterStatus = 'approved'" :class="{ active: filterStatus === 'approved' }">
              <div class="stat-icon-wrap"><i class="fas fa-check-circle"></i></div>
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-count">{{ countByStatus('approved') }}</span>
                  <span class="stat-badge badge-green">Won</span>
                </div>
                <span class="stat-label">Approved</span>
              </div>
            </div>

            <!-- USD Card (Conditional) -->
            <div class="quote-stat-card card-indigo" v-if="currencyTotals?.USD && currencyTotals.USD > 0">
              <div class="stat-icon-wrap"><i class="fas fa-dollar-sign"></i></div>
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-count font-mono">$ {{ (currencyTotals.USD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                  <span class="stat-badge badge-indigo">USD</span>
                </div>
                <span class="stat-label">Export Commercials</span>
              </div>
            </div>
          </div>

          <!-- ════════ COMPREHENSIVE FILTER TOOLBAR ════════ -->
          <div class="quote-filter-toolbar">
            <!-- Search Input -->
            <div class="filter-field search-box">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search company, engine serial, or quote ID..." 
                class="filter-input"
              />
              <button 
                v-if="searchQuery" 
                class="clear-input-btn" 
                @click="searchQuery = ''"
                title="Clear Search"
              >
                <i class="fas fa-times-circle"></i>
              </button>
            </div>

            <!-- Company Select -->
            <div class="filter-field">
              <label><i class="fas fa-building text-blue"></i> Company</label>
              <select v-model="filterCompany" class="filter-select">
                <option value="">All Companies ({{ uniqueCompanies.length }})</option>
                <option v-for="c in uniqueCompanies" :key="c" :value="c">
                  {{ c }}
                </option>
              </select>
            </div>

            <!-- Status Select -->
            <div class="filter-field">
              <label><i class="fas fa-tag text-amber"></i> Status</label>
              <select v-model="filterStatus" class="filter-select">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="followup">Follow-up</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <!-- Financial Quarter -->
            <div class="filter-field">
              <label><i class="fas fa-chart-pie text-purple"></i> Quarter</label>
              <select v-model="filterQuarter" class="filter-select">
                <option value="">All Quarters</option>
                <option value="Q1">Q1 (Apr – Jun)</option>
                <option value="Q2">Q2 (Jul – Sep)</option>
                <option value="Q3">Q3 (Oct – Dec)</option>
                <option value="Q4">Q4 (Jan – Mar)</option>
              </select>
            </div>

            <!-- Month Select -->
            <div class="filter-field">
              <label><i class="fas fa-calendar-alt text-emerald"></i> Month</label>
              <select v-model="filterMonth" class="filter-select">
                <option value="">All Months</option>
                <option v-for="(m, idx) in months" :key="idx" :value="idx + 1">
                  {{ m }}
                </option>
              </select>
            </div>

            <!-- Year Select -->
            <div class="filter-field">
              <label><i class="fas fa-calendar text-indigo"></i> Year</label>
              <select v-model="filterYear" class="filter-select">
                <option value="">All Years</option>
                <option v-for="y in availableYears" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>
            </div>

            <!-- Reset Filters Button -->
            <div class="filter-field reset-btn-field" v-if="hasActiveFilters">
              <label>&nbsp;</label>
              <button 
                type="button" 
                class="btn-reset-filters" 
                @click="resetFilters"
                title="Reset all filters"
              >
                <i class="fas fa-undo"></i>
                <span>Reset</span>
              </button>
            </div>
          </div>

          <!-- ════════ TOOLBAR SUMMARY & VIEW MODE SWITCH ════════ -->
          <div class="quote-sub-toolbar">
            <div class="result-count-badge">
              <i class="fas fa-check-double text-blue"></i>
              <span>Showing <strong>{{ filteredQuotations.length }}</strong> of {{ quotations.length }} Quotations</span>
            </div>

            <!-- View Switcher (Cards vs Table) -->
            <div class="view-mode-toggle">
              <button 
                type="button" 
                class="toggle-btn" 
                :class="{ active: viewMode === 'cards' }"
                @click="viewMode = 'cards'"
                title="Cards Grid View"
              >
                <i class="fas fa-th-large"></i>
                <span>Cards</span>
              </button>
              <button 
                type="button" 
                class="toggle-btn" 
                :class="{ active: viewMode === 'table' }"
                @click="viewMode = 'table'"
                title="Detailed Table View"
              >
                <i class="fas fa-table-list"></i>
                <span>Table</span>
              </button>
            </div>
          </div>
        </section>

        <!-- ════════ BODY CONTENT ════════ -->

        <!-- Loader -->
        <div v-if="quotationLoading" class="quote-loading-state">
          <div class="quote-spinner"></div>
          <h3>Loading Quotations</h3>
          <p>Fetching all enterprise proposals from the database...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredQuotations.length === 0" class="quote-empty-card">
          <div class="empty-icon-box">
            <i class="fas fa-folder-open"></i>
          </div>
          <h2>No Quotations Found</h2>
          <p v-if="hasActiveFilters">
            No quotations matched your selected criteria. Try adjusting or clearing your filters.
          </p>
          <p v-else>
            There are currently no quotation records registered in the system.
          </p>
          <div class="empty-actions">
            <button v-if="hasActiveFilters" class="btn-empty-reset" @click="resetFilters">
              <i class="fas fa-undo"></i> Reset Filters
            </button>
            <button class="btn-empty-create" @click="createNewQuotation">
              <i class="fas fa-plus-circle"></i> Create Quotation
            </button>
          </div>
        </div>

        <!-- ════════ 1. CARDS GRID VIEW ════════ -->
        <div v-else-if="viewMode === 'cards'" class="quote-cards-grid">
          <div 
            v-for="q in filteredQuotations" 
            :key="q.id" 
            class="quote-card-item"
            @click="openQuotation(q)"
            title="Click to view and print official quotation"
          >
            <!-- Card Top Header -->
            <div class="qcard-header">
              <div class="qcard-quote-id">
                <i class="fas fa-file-invoice"></i>
                <span>{{ formatQuoteNumber(q) }}</span>
              </div>
              <div 
                class="qcard-status-pill"
                :class="getStatusClass(q.quotation_followup_status)"
              >
                <i :class="getStatusIcon(q.quotation_followup_status)"></i>
                <span>{{ q.quotation_followup_status || 'Pending' }}</span>
              </div>
            </div>

            <!-- Company & Monogram -->
            <div class="qcard-company-row">
              <div 
                class="qcard-avatar"
                :style="{
                  background: getAvatarTheme(q.company_name).bg,
                  color: getAvatarTheme(q.company_name).color,
                  borderColor: getAvatarTheme(q.company_name).border
                }"
              >
                {{ getCompanyInitials(q.company_name) }}
              </div>
              <div class="qcard-company-info">
                <h3 class="qcard-company-title" :title="q.company_name">
                  {{ formatCompanyName(q.company_name) }}
                </h3>
                <span class="qcard-date" v-if="q.created_at">
                  <i class="far fa-calendar-alt"></i> {{ formatDate(q.created_at) }}
                </span>
              </div>
            </div>

            <!-- Value & Commercials -->
            <div class="qcard-value-box">
              <div class="qcard-value-label">Quotation Value ({{ showGstInclusive ? 'GST Incl.' : 'Base' }}):</div>
              <div class="qcard-value-amount">
                {{ formatQuotationAmount(q) || '—' }}
              </div>
            </div>

            <!-- Meta details row -->
            <div class="qcard-meta-details">
              <div class="qcard-meta-pill" v-if="q.engine_serial_number">
                <i class="fas fa-cog"></i>
                <span>Engine: <strong>{{ q.engine_serial_number }}</strong></span>
              </div>
              <div class="qcard-meta-pill" v-if="q.nature_of_sale">
                <i class="fas fa-scale-balanced"></i>
                <span class="capitalize">{{ q.nature_of_sale }}</span>
              </div>
            </div>

            <!-- Card Footer Hover Hint -->
            <div class="qcard-footer">
              <div class="qcard-open-hint">
                <span>Open Quotation</span>
                <i class="fas fa-arrow-up-right-from-square"></i>
              </div>
              <button 
                type="button" 
                class="qcard-copy-btn"
                @click.stop="copyQuoteId(q)"
                title="Copy Quotation ID"
              >
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ════════ 2. DETAILED TABLE VIEW ════════ -->
        <div v-else class="quote-table-wrapper">
          <table class="quote-table">
            <thead>
              <tr>
                <th style="width: 6%; text-align: center;">Sr. No.</th>
                <th style="width: 16%;">Quote No.</th>
                <th style="width: 32%;">Customer Company</th>
                <th style="width: 14%;">Engine Serial</th>
                <th style="width: 10%;">Date</th>
                <th style="width: 12%; text-align: right;">Value</th>
                <th style="width: 10%; text-align: center;">Status</th>
                <th style="width: 10%; text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(q, index) in filteredQuotations" 
                :key="q.id" 
                class="quote-table-row"
                @click="openQuotation(q)"
              >
                <td style="text-align: center;">
                  <span class="sr-pill">#{{ index + 1 }}</span>
                </td>
                <td>
                  <div class="quote-id-tag font-mono">
                    <i class="fas fa-hashtag"></i>
                    <span>{{ formatQuoteNumber(q) }}</span>
                  </div>
                </td>
                <td>
                  <div class="table-company-cell">
                    <div 
                      class="table-avatar"
                      :style="{
                        background: getAvatarTheme(q.company_name).bg,
                        color: getAvatarTheme(q.company_name).color,
                        borderColor: getAvatarTheme(q.company_name).border
                      }"
                    >
                      {{ getCompanyInitials(q.company_name) }}
                    </div>
                    <span class="table-company-name">{{ formatCompanyName(q.company_name) }}</span>
                  </div>
                </td>
                <td>
                  <span class="font-mono text-slate font-bold" v-if="q.engine_serial_number">
                    {{ q.engine_serial_number }}
                  </span>
                  <span class="text-muted" v-else>—</span>
                </td>
                <td>
                  <span class="table-date">{{ formatDate(q.created_at) }}</span>
                </td>
                <td style="text-align: right;">
                  <span class="table-amount font-mono">
                    {{ formatQuotationAmount(q) || '—' }}
                  </span>
                </td>
                <td style="text-align: center;">
                  <span class="qcard-status-pill" :class="getStatusClass(q.quotation_followup_status)">
                    <i :class="getStatusIcon(q.quotation_followup_status)"></i>
                    <span>{{ q.quotation_followup_status || 'Pending' }}</span>
                  </span>
                </td>
                <td style="text-align: center;" @click.stop>
                  <button 
                    type="button" 
                    class="btn-table-action"
                    @click="openQuotation(q)"
                    title="Open Quotation Document"
                  >
                    <i class="fas fa-external-link-alt"></i>
                    <span>Open</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/views/employee/components/Sidebar.vue'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js"

export default {
  name: "ViewAllQuotations",
  components: {
    Sidebar
  },

  data() {
    return {
      quotations: [],
      customers: [],
      quotationLoading: true,
      isMobile: false,
      isSidebarVisible: true,
      viewMode: 'cards', // 'cards' | 'table'

      // Filters
      searchQuery: '',
      filterCompany: '',
      filterStatus: '',
      filterMonth: '',
      filterYear: '',
      filterQuarter: '',
      showGstInclusive: true,

      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    }
  },

  computed: {
    uniqueCompanies() {
      const set = new Set();
      this.quotations.forEach(q => {
        if (q.company_name && q.company_name.trim()) {
          set.add(q.company_name.trim());
        }
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    },

    availableYears() {
      const years = new Set();
      this.quotations.forEach(q => {
        if (q.created_at) {
          const yr = new Date(q.created_at).getFullYear();
          if (!isNaN(yr)) years.add(yr);
        }
      });
      if (years.size === 0) years.add(new Date().getFullYear());
      return Array.from(years).sort((a, b) => b - a);
    },

    hasActiveFilters() {
      return Boolean(
        this.searchQuery.trim() ||
        this.filterCompany ||
        this.filterStatus ||
        this.filterMonth ||
        this.filterYear ||
        this.filterQuarter
      );
    },

    filteredQuotations() {
      let list = this.quotations || [];

      // 1. Unified search
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        list = list.filter(item => {
          const company = (item.company_name || '').toLowerCase();
          const engine = (item.engine_serial_number || '').toLowerCase();
          const quoteId = String(item.id || '').toLowerCase();
          const quoteNo = (item.quote_no || '').toLowerCase();
          return company.includes(q) || engine.includes(q) || quoteId.includes(q) || quoteNo.includes(q);
        });
      }

      // 2. Company Filter
      if (this.filterCompany) {
        list = list.filter(item => (item.company_name || '').trim() === this.filterCompany);
      }

      // 3. Status Filter
      if (this.filterStatus) {
        list = list.filter(item => {
          const s = (item.quotation_followup_status || 'pending').toLowerCase();
          return s === this.filterStatus.toLowerCase();
        });
      }

      // 4. Month Filter
      if (this.filterMonth) {
        list = list.filter(item => {
          if (!item.created_at) return false;
          return (new Date(item.created_at).getMonth() + 1) === Number(this.filterMonth);
        });
      }

      // 5. Year Filter
      if (this.filterYear) {
        list = list.filter(item => {
          if (!item.created_at) return false;
          return new Date(item.created_at).getFullYear() === Number(this.filterYear);
        });
      }

      // 6. Quarter Filter (Indian Financial Year: Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar)
      if (this.filterQuarter) {
        const qMap = {
          Q1: [4, 5, 6],
          Q2: [7, 8, 9],
          Q3: [10, 11, 12],
          Q4: [1, 2, 3]
        };
        const allowedMonths = qMap[this.filterQuarter] || [];
        list = list.filter(item => {
          if (!item.created_at) return false;
          const m = new Date(item.created_at).getMonth() + 1;
          return allowedMonths.includes(m);
        });
      }

      return list;
    },

    totalQuotationAmount() {
      return this.filteredQuotations.reduce((grandTotal, q) => {
        if (q.currency && q.currency.toUpperCase() !== 'INR') {
          return grandTotal;
        }

        let items = q.items;
        if (typeof items === "string") {
          try { items = JSON.parse(items); } catch { items = []; }
        }

        if (Array.isArray(items) && items.length > 0) {
          const quotationTotal = items.reduce((sum, item) => {
            const qty = Number(item.qty) || 0;
            const rate = Number(item.rate) || 0;
            const disc = Number(item.discount) || 0;
            const baseAmount = (qty * rate) - ((qty * rate * disc) / 100);

            if (!this.showGstInclusive) {
              return sum + baseAmount;
            }

            const cgst = baseAmount * (Number(item.cgst_rate) || 0) / 100;
            const sgst = baseAmount * (Number(item.sgst_rate) || 0) / 100;
            const igst = baseAmount * (Number(item.igst_rate) || 0) / 100;

            return sum + baseAmount + cgst + sgst + igst;
          }, 0);
          return grandTotal + quotationTotal;
        } else {
          const fallback = q.grand_total ?? q.net_total ?? q.total_amount ?? q.total ?? 0;
          return grandTotal + (Number(fallback) || 0);
        }
      }, 0);
    },

    formattedTotalInr() {
      return (this.totalQuotationAmount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    currencyTotals() {
      return this.filteredQuotations.reduce((totals, q) => {
        const currency = q.currency ? q.currency.toUpperCase() : 'INR';
        if (!totals[currency]) totals[currency] = 0;

        let items = q.items;
        if (typeof items === "string") {
          try { items = JSON.parse(items); } catch { items = []; }
        }

        if (Array.isArray(items) && items.length > 0) {
          const qTotal = items.reduce((sum, item) => {
            const qty = Number(item.qty) || 0;
            const rate = Number(item.rate) || 0;
            const disc = Number(item.discount) || 0;
            const base = (qty * rate) - ((qty * rate * disc) / 100);

            if (!this.showGstInclusive) return sum + base;

            const cgst = base * (Number(item.cgst_rate) || 0) / 100;
            const sgst = base * (Number(item.sgst_rate) || 0) / 100;
            const igst = base * (Number(item.igst_rate) || 0) / 100;
            return sum + base + cgst + sgst + igst;
          }, 0);
          totals[currency] += qTotal;
        } else {
          const fallback = q.grand_total ?? q.net_total ?? q.total_amount ?? q.total ?? 0;
          totals[currency] += (Number(fallback) || 0);
        }
        return totals;
      }, {});
    }
  },

  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchQuotations();
    this.fetchCustomers();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },

  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    async fetchQuotations() {
      this.quotationLoading = true;
      try {
        const res = await axios.get('/api/quotations');
        this.quotations = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      } catch (err) {
        console.warn('API /api/quotations failed, trying direct endpoint:', err);
        try {
          const fallback = await fetch('https://employees.archenterprises.co.in/api/api/quotations');
          const data = await fallback.json();
          this.quotations = Array.isArray(data) ? data : (data?.data || []);
        } catch (err2) {
          console.error('All quotation endpoints failed:', err2);
          toastError('Failed to load quotations');
          this.quotations = [];
        }
      } finally {
        this.quotationLoading = false;
      }
    },

    async fetchCustomers() {
      try {
        const res = await axios.get('/api/customers');
        this.customers = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      } catch (e) {
        console.warn('Failed to load customers:', e);
      }
    },

    formatQuoteNumber(q) {
      if (!q) return 'AE/QUOTE';
      if (q.quote_no) return q.quote_no;
      const yr = q.created_at ? new Date(q.created_at).getFullYear() : new Date().getFullYear();
      return `AE/QUOTE/${yr}/${String(q.id).padStart(4, '0')}`;
    },

    formatCompanyName(name) {
      if (!name) return 'Unnamed Company';
      const exceptions = ['PVT', 'LTD', 'A2Z', 'LLC', 'BNB', 'LMW', 'LN', 'SPC', 'FZE', 'YMCC', 'PVT.', 'LTD.'];
      return name
        .toLowerCase()
        .split(' ')
        .map(word => {
          const upperWord = word.toUpperCase();
          if (exceptions.includes(upperWord)) return upperWord;
          return word.length === 1 ? upperWord : word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
    },

    getCompanyInitials(name) {
      if (!name) return 'AE';
      const clean = String(name).replace(/^(M\/s|M\/S|Shree|Sri)\.?\s+/i, '').trim();
      const parts = clean.split(/\s+/).filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    },

    getAvatarTheme(name) {
      const themes = [
        { bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#1d4ed8', border: '#bfdbfe' },
        { bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', color: '#15803d', border: '#bbf7d0' },
        { bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', color: '#7e22ce', border: '#e9d5ff' },
        { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', color: '#c2410c', border: '#fed7aa' },
        { bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', color: '#0f766e', border: '#99f6e4' },
        { bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', color: '#be185d', border: '#fbcfe8' }
      ];
      let hash = 0;
      const str = String(name || '');
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return themes[Math.abs(hash) % themes.length];
    },

    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },

    formatQuotationAmount(q) {
      if (!q) return '';
      let items = q.items;
      if (typeof items === "string") {
        try { items = JSON.parse(items); } catch { items = []; }
      }

      let val = 0;
      if (Array.isArray(items) && items.length > 0) {
        val = items.reduce((sum, item) => {
          const qty = Number(item.qty) || 0;
          const rate = Number(item.rate) || 0;
          const disc = Number(item.discount) || 0;
          const base = (qty * rate) - ((qty * rate * disc) / 100);

          if (!this.showGstInclusive) return sum + base;

          const cgst = base * (Number(item.cgst_rate) || 0) / 100;
          const sgst = base * (Number(item.sgst_rate) || 0) / 100;
          const igst = base * (Number(item.igst_rate) || 0) / 100;
          return sum + base + cgst + sgst + igst;
        }, 0);
      } else {
        val = Number(q.grand_total ?? q.net_total ?? q.total_amount ?? q.total ?? 0);
      }

      const curr = (q.currency || 'INR').toUpperCase();
      if (curr === 'USD') {
        return '$ ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else if (curr === 'EUR') {
        return '€ ' + val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      return '₹ ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    countByStatus(statusName) {
      const s = statusName.toLowerCase();
      return this.quotations.filter(q => {
        const itemStatus = (q.quotation_followup_status || 'pending').toLowerCase();
        return itemStatus === s;
      }).length;
    },

    getStatusClass(status) {
      const s = (status || 'pending').toLowerCase();
      if (s === 'approved') return 'status-approved';
      if (s === 'rejected') return 'status-rejected';
      if (s === 'followup') return 'status-followup';
      return 'status-pending';
    },

    getStatusIcon(status) {
      const s = (status || 'pending').toLowerCase();
      if (s === 'approved') return 'fas fa-check-circle';
      if (s === 'rejected') return 'fas fa-times-circle';
      if (s === 'followup') return 'fas fa-phone-volume';
      return 'fas fa-hourglass-half';
    },

    openQuotation(q) {
      if (!q || !q.id) return;
      localStorage.setItem("selectedQuotationId", q.id);
      window.open(`/quotation?id=${q.id}`, '_blank');
    },

    copyQuoteId(q) {
      const text = this.formatQuoteNumber(q);
      navigator.clipboard?.writeText(text).then(() => {
        toastSuccess(`Copied: ${text}`);
      }).catch(() => {
        toastInfo(`Quote: ${text}`);
      });
    },

    createNewQuotation() {
      window.open('/quotation', '_blank');
    },

    goBackToCrm() {
      this.$router.push('/employee/customerregistrations');
    },

    resetFilters() {
      this.searchQuery = '';
      this.filterCompany = '';
      this.filterStatus = '';
      this.filterMonth = '';
      this.filterYear = '';
      this.filterQuarter = '';
      toastInfo('Filters have been reset.');
    }
  }
}
</script>

<style scoped>
/* ════════ LAYOUT & PAGE ARCHITECTURE ════════ */
.all-quotations-page {
  padding: 1.5rem 2rem 3rem;
  background: #f1f5f9;
  min-height: 100vh;
}

/* ════════ HERO HEADER ════════ */
.quote-hero-header {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 22px;
  padding: 1.85rem 2.25rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.9) inset;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.quote-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.quote-hero-title-area {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.quote-eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #0284c7;
  background: #eff6ff;
  padding: 0.3rem 0.85rem;
  border-radius: 30px;
  width: fit-content;
  border: 1px solid #bfdbfe;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.08);
}

.quote-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.25);
  animation: pulseDot 2s infinite ease-in-out;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.quote-main-heading {
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.quote-sub-heading {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* Header Buttons */
.quote-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-hero-action {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  text-decoration: none;
  white-space: nowrap;
}

.btn-back-crm {
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
}

.btn-back-crm:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.btn-refresh {
  background: #ffffff;
  color: #0284c7;
  border: 1px solid #bae6fd;
}

.btn-refresh:hover {
  background: #eff6ff;
  border-color: #0284c7;
  transform: translateY(-1px);
}

.btn-new-quote {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  box-shadow: 0 6px 16px -2px rgba(2, 132, 199, 0.35);
}

.btn-new-quote:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px -2px rgba(2, 132, 199, 0.45);
}

/* ════════ KPI STATS GRID ════════ */
.quote-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1.15rem;
}

.quote-stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.15rem 1.35rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.quote-stat-card:hover, .quote-stat-card.active {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -4px rgba(15, 23, 42, 0.08);
  border-color: #cbd5e1;
}

.quote-stat-card.active {
  border-color: #0284c7;
  background: #f8fafc;
}

.quote-stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.quote-stat-card.card-blue::after { background: linear-gradient(90deg, #0284c7, #38bdf8); }
.quote-stat-card.card-emerald::after { background: linear-gradient(90deg, #059669, #34d399); }
.quote-stat-card.card-amber::after { background: linear-gradient(90deg, #d97706, #fbbf24); }
.quote-stat-card.card-purple::after { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
.quote-stat-card.card-green::after { background: linear-gradient(90deg, #16a34a, #4ade80); }
.quote-stat-card.card-indigo::after { background: linear-gradient(90deg, #4f46e5, #818cf8); }

.quote-stat-card:hover::after, .quote-stat-card.active::after {
  opacity: 1;
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.card-blue .stat-icon-wrap { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); color: #0284c7; }
.card-emerald .stat-icon-wrap { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); color: #059669; }
.card-amber .stat-icon-wrap { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); color: #d97706; }
.card-purple .stat-icon-wrap { background: linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%); color: #7c3aed; }
.card-green .stat-icon-wrap { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); color: #16a34a; }
.card-indigo .stat-icon-wrap { background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); color: #4f46e5; }

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.stat-count {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  font-family: 'Outfit', 'Inter', sans-serif;
  letter-spacing: -0.02em;
}

.stat-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge-blue { background: #eff6ff; color: #0284c7; }
.badge-amber { background: #fffbeb; color: #d97706; }
.badge-purple { background: #faf5ff; color: #7c3aed; }
.badge-green { background: #f0fdf4; color: #16a34a; }
.badge-indigo { background: #eef2ff; color: #4f46e5; }

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 0.25rem;
}

.stat-gst-toggle {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.2rem 0.55rem;
  border-radius: 8px;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.stat-gst-toggle.gst-on {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.stat-gst-toggle.gst-off {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

/* ════════ FILTER TOOLBAR ════════ */
.quote-filter-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 140px;
}

.filter-field label {
  font-size: 0.74rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.filter-field.search-box {
  flex: 2;
  min-width: 260px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1.15rem;
  top: calc(50% + 10px);
  transform: translateY(-50%);
  color: #0284c7;
  font-size: 0.95rem;
  pointer-events: none;
}

.filter-input {
  width: 100%;
  height: 44px;
  padding: 0.5rem 2.6rem 0.5rem 2.9rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.9rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.filter-input:focus, .filter-select:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
}

.clear-input-btn {
  position: absolute;
  right: 0.85rem;
  top: calc(50% + 10px);
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.1rem;
  cursor: pointer;
}

.filter-select {
  height: 44px;
  padding: 0.5rem 0.85rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.86rem;
  color: #0f172a;
  outline: none;
  cursor: pointer;
}

.btn-reset-filters {
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-reset-filters:hover {
  background: #ffe4e6;
  border-color: #fda4af;
  color: #be123c;
}

/* ════════ SUB TOOLBAR ════════ */
.quote-sub-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.result-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 0.45rem 0.95rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.view-mode-toggle {
  display: inline-flex;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  gap: 0.25rem;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  border-radius: 9px;
  font-size: 0.8rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-btn.active {
  background: #ffffff;
  color: #0284c7;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}

/* ════════ LOADING & EMPTY STATES ════════ */
.quote-loading-state, .quote-empty-card {
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #e2e8f0;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
}

.quote-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e0f2fe;
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon-box {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #eff6ff;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.empty-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-empty-reset, .btn-empty-create {
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;
}

.btn-empty-reset {
  background: #f1f5f9;
  color: #475569;
}

.btn-empty-create {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
}

/* ════════ 1. CARDS GRID ════════ */
.quote-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.4rem;
}

.quote-card-item {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 1.35rem 1.45rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 6px 18px -4px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  position: relative;
}

.quote-card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px -8px rgba(15, 23, 42, 0.1);
  border-color: #cbd5e1;
}

.qcard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.qcard-quote-id {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.82rem;
  font-weight: 800;
  color: #1e40af;
  background: #eff6ff;
  padding: 0.3rem 0.75rem;
  border-radius: 9px;
  border: 1px solid #bfdbfe;
}

.qcard-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-approved { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.status-rejected { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.status-followup { background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff; }
.status-pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }

.qcard-company-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.qcard-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
  border: 1px solid transparent;
}

.qcard-company-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.qcard-company-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qcard-date {
  font-size: 0.76rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.qcard-value-box {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.qcard-value-label {
  font-size: 0.74rem;
  font-weight: 600;
  color: #64748b;
}

.qcard-value-amount {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  font-family: 'Outfit', 'Inter', monospace;
}

.qcard-meta-details {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.qcard-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: #475569;
  background: #f8fafc;
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.qcard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.qcard-open-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0284c7;
  transition: gap 0.15s ease;
}

.quote-card-item:hover .qcard-open-hint {
  gap: 0.6rem;
  text-decoration: underline;
}

.qcard-copy-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.qcard-copy-btn:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

/* ════════ 2. TABLE VIEW ════════ */
.quote-table-wrapper {
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 14px 36px -10px rgba(15, 23, 42, 0.06);
  overflow-x: auto;
}

.quote-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.quote-table thead th {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  color: #334155;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 1.15rem 1.4rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.quote-table-row {
  cursor: pointer;
  transition: all 0.15s ease;
}

.quote-table-row:hover {
  background: #f8fafc;
}

.quote-table-row td {
  padding: 1.15rem 1.4rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.sr-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 28px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0 0.55rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.quote-id-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: #1e40af;
  background: #eff6ff;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}

.table-company-cell {
  display: flex;
  align-items: center;
  gap: 0.95rem;
}

.table-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.84rem;
  font-weight: 800;
  flex-shrink: 0;
  border: 1px solid transparent;
}

.table-company-name {
  font-size: 0.94rem;
  font-weight: 700;
  color: #0f172a;
}

.table-amount {
  font-size: 0.98rem;
  font-weight: 800;
  color: #0f172a;
}

.btn-table-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.95rem;
  border-radius: 9px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #eff6ff;
  color: #0284c7;
  border: 1px solid #bae6fd;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-table-action:hover {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

/* ════════ RESPONSIVE ════════ */
@media (max-width: 900px) {
  .all-quotations-page {
    padding: 1rem;
  }
  .quote-hero-header {
    padding: 1.35rem;
  }
  .quote-stats-grid {
    grid-template-columns: 1fr;
  }
  .quote-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
