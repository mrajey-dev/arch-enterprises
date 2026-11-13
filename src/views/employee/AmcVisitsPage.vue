<template>
  <div class="amc-visits-page">
    <!-- PAGE HERO HEADER -->
    <div class="pro-page-header header-cyan">
      <div class="pro-header-left">
        <button class="pro-btn-back" @click="goBack" title="Back to CRM">
          <i class="fas fa-arrow-left"></i>
          <span>Back to CRM</span>
        </button>

        <div class="pro-header-icon icon-cyan">
          <i class="fas fa-calendar-check"></i>
        </div>

        <div>
          <div class="pro-header-title-row">
            <h1 class="pro-page-title">AMC Visits Management</h1>
            <span class="pro-status-pill pill-cyan">{{ totalVisitsCount }} Total Visits</span>
          </div>
          <p class="pro-page-subtitle">
            <i class="fas fa-clock"></i> Manage scheduled AMC visits, engineer assignments, and completed service reports
          </p>
        </div>
      </div>

      <div class="pro-header-actions">
        <button class="pro-btn-header-refresh" @click="fetchAllData" title="Refresh Data">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- KPI / STATS BAR -->
    <div class="kpi-grid">
      <!-- Pending & Assigned Visits KPI -->
      <div
        class="kpi-card kpi-pending"
        :class="{ 'kpi-selected': activeViewTab === 'pending' }"
        @click="setActiveTab(activeViewTab === 'pending' ? 'all' : 'pending')"
      >
        <div class="kpi-icon icon-pending">
          <i class="fas fa-calendar-days"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-head-row">
            <span class="kpi-label">Pending & Assigned</span>
            <span class="kpi-badge badge-pending-pill">{{ filteredVisits.length }}</span>
          </div>
          <span class="kpi-value text-cyan">{{ formatCurrency(pendingVisitsPoValue) }}</span>
          <span class="kpi-meta">Scheduled upcoming visits</span>
        </div>
      </div>

      <!-- Completed Visits & Services KPI -->
      <div
        class="kpi-card kpi-completed"
        :class="{ 'kpi-selected': activeViewTab === 'completed' }"
        @click="setActiveTab(activeViewTab === 'completed' ? 'all' : 'completed')"
      >
        <div class="kpi-icon icon-completed">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-head-row">
            <span class="kpi-label">Completed AMC & Services</span>
            <span class="kpi-badge badge-completed-pill">{{ filteredCompletedVisits.length }}</span>
          </div>
          <span class="kpi-value text-emerald">{{ formatCurrency(completedVisitsPoValue) }}</span>
          <span class="kpi-meta">{{ completedAmcCount }} AMC + {{ completedServicesCount }} Services completed</span>
        </div>
      </div>

      <!-- Total AMC Engagement KPI -->
      <div
        class="kpi-card kpi-total"
        :class="{ 'kpi-selected': activeViewTab === 'all' }"
        @click="setActiveTab('all')"
      >
        <div class="kpi-icon icon-total">
          <i class="fas fa-file-contract"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-head-row">
            <span class="kpi-label">Total Contract Value</span>
            <span class="kpi-badge badge-purple-pill">{{ totalVisitsCount }}</span>
          </div>
          <span class="kpi-value text-purple">{{ formatCurrency(totalPoValue) }}</span>
          <span class="kpi-meta">All scheduled & completed</span>
        </div>
      </div>
    </div>

    <!-- FILTER TOOLBAR & TAB SWITCHER -->
    <div class="pro-filter-toolbar">
      <div class="pro-search-box">
        <i class="fas fa-search pro-search-icon"></i>
        <input
          type="text"
          v-model="filters.search"
          placeholder="Search company, PO number, engineer..."
          class="pro-search-input"
        />
        <button v-if="filters.search" class="pro-clear-btn" @click="filters.search = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="pro-filter-box">
        <i class="fas fa-calendar-days pro-select-icon"></i>
        <select v-model="filters.month" class="pro-select">
          <option value="">All Months</option>
          <option
            v-for="(m, index) in months"
            :key="index"
            :value="index + 1"
          >
            {{ m }}
          </option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>

      <div class="pro-filter-box">
        <i class="fas fa-calendar pro-select-icon"></i>
        <select v-model="filters.year" class="pro-select">
          <option value="">All Years</option>
          <option
            v-for="y in availableFilterYears"
            :key="y"
            :value="y"
          >
            {{ y }}
          </option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>

      <!-- Tab View Buttons (Default: Pending) -->
      <div class="tab-pill-group">
        <button
          class="tab-pill"
          :class="{ active: activeViewTab === 'all' }"
          @click="setActiveTab('all')"
        >
          <i class="fas fa-layer-group"></i> All ({{ totalVisitsCount }})
        </button>
        <button
          class="tab-pill tab-pending"
          :class="{ active: activeViewTab === 'pending' }"
          @click="setActiveTab('pending')"
        >
          <i class="fas fa-calendar-days"></i> Pending & Assigned ({{ filteredVisits.length }})
        </button>
        <button
          class="tab-pill tab-completed"
          :class="{ active: activeViewTab === 'completed' }"
          @click="setActiveTab('completed')"
        >
          <i class="fas fa-clipboard-check"></i> Completed ({{ filteredCompletedVisits.length }})
        </button>
      </div>

      <button
        v-if="filters.search || filters.month || filters.year || activeViewTab !== 'pending'"
        class="pro-btn-reset-filters"
        @click="resetFilters"
      >
        <i class="fas fa-rotate-left"></i> Reset
      </button>
    </div>

    <!-- =========================================================
         SECTION 1: AMC PENDING & ASSIGNED VISITS CARD
         ========================================================= -->
    <div
      v-if="activeViewTab === 'all' || activeViewTab === 'pending'"
      class="section-card section-pending"
    >
      <div class="section-card-header header-cyan">
        <div class="section-header-left">
          <div class="section-icon-badge icon-cyan-badge">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div>
            <div class="section-title-row">
              <h2 class="section-title">AMC Pending & Assigned Visits</h2>
              <span class="section-pill pill-cyan-dark">{{ filteredVisits.length }} Visits</span>
              <span class="section-value-badge badge-cyan-val" v-if="pendingVisitsPoValue">
                <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(pendingVisitsPoValue, false) }}
              </span>
            </div>
            <p class="section-subtitle">
              Schedule, reschedule, and assign engineers for upcoming AMC service visits
            </p>
          </div>
        </div>

        <div class="section-header-right">
          <span class="section-summary-tag tag-cyan">
            <i class="fas fa-user-clock"></i> Scheduled Visits
          </span>
        </div>
      </div>

      <div class="table-scroll-wrap">
        <table class="pro-styled-table">
          <thead>
            <tr>
              <th style="min-width: 220px;">Company Name</th>
              <th>PO Number</th>
              <th style="min-width: 140px;">PO Value</th>
              <th style="min-width: 170px;">Scheduled Visit Date</th>
              <th style="min-width: 220px;">Assign Engineer / Employee</th>
              <th>Service / AMC Type</th>
              <th style="text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody v-if="filteredVisits.length">
            <tr
              v-for="(visit, index) in filteredVisits"
              :key="`${visit.company_name}-${visit.visit_date}-${index}`"
              class="pro-table-row"
            >
              <td>
                <div class="pro-company-cell">
                  <span class="pro-company-name">{{ visit.company_name }}</span>
                </div>
              </td>

              <td>
                <span class="pro-po-pill">{{ visit.po_number || '-' }}</span>
              </td>

              <!-- PO Value (NEW COLUMN) -->
              <td>
                <span class="pro-val-pill">
                  <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(visit.value_of_po, false) }}
                </span>
              </td>

              <td>
                <input
                  type="date"
                  v-model="visit.visit_date"
                  class="pro-date-input-sm"
                  title="Click to change scheduled visit date"
                  @change="updateAmcVisitDate(visit)"
                />
              </td>

              <td>
                <select
                  v-model.number="visit.assign_to"
                  @change="assignVisit(visit)"
                  class="pro-select-engineer"
                >
                  <option value="">-- Select Service Engineer --</option>
                  <option v-for="emp in filteredServiceEmployees" :key="emp.id" :value="emp.id">
                    {{ emp.name }}
                  </option>
                </select>
              </td>

              <td>
                <span class="pro-text-sub">{{ visit.service_type || visit.type_of_amc || 'AMC' }}</span>
              </td>

              <td style="text-align:center;">
                <span
                  class="supply-status-badge"
                  :class="getAmcStatusBadgeClass(visit)"
                >
                  <i :class="getAmcStatusIcon(visit)"></i>
                  {{ getAmcStatusLabel(visit) }}
                </span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="pro-no-data-cell">
                <div class="pro-no-data-wrap">
                  <i class="fas fa-calendar-xmark" style="color: #0284c7;"></i>
                  <p>No AMC pending or assigned visits found matching your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- =========================================================
         SECTION 2: COMPLETED AMC VISITS & SERVICES CARD
         ========================================================= -->
    <div
      v-if="activeViewTab === 'all' || activeViewTab === 'completed'"
      class="section-card section-completed"
    >
      <div class="section-card-header header-emerald">
        <div class="section-header-left">
          <div class="section-icon-badge icon-emerald">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div>
            <div class="section-title-row">
              <h2 class="section-title">Completed AMC Visits & Services</h2>
              <span class="section-pill pill-emerald">{{ filteredCompletedVisits.length }} Completed</span>
              <span class="section-value-badge badge-emerald-val" v-if="completedVisitsPoValue">
                <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(completedVisitsPoValue, false) }}
              </span>
            </div>
            <p class="section-subtitle">
              Review completed AMC visits and service orders, customer sign-offs, and engineer reports
            </p>
          </div>
        </div>

        <div class="section-header-right">
          <!-- Sub-Filter Switcher: All / AMC Visits / Services -->
          <div class="completed-segment-pills">
            <button
              type="button"
              class="seg-pill"
              :class="{ active: completedTypeFilter === 'all' }"
              @click="completedTypeFilter = 'all'"
            >
              <i class="fas fa-layer-group"></i> All ({{ allCompletedItems.length }})
            </button>
            <button
              type="button"
              class="seg-pill seg-amc"
              :class="{ active: completedTypeFilter === 'amc' }"
              @click="completedTypeFilter = 'amc'"
            >
              <i class="fas fa-handshake"></i> AMC ({{ completedVisits.length }})
            </button>
            <button
              type="button"
              class="seg-pill seg-service"
              :class="{ active: completedTypeFilter === 'service' }"
              @click="completedTypeFilter = 'service'"
            >
              <i class="fas fa-screwdriver-wrench"></i> Services ({{ completedServices.length }})
            </button>
          </div>
        </div>
      </div>

      <div class="table-scroll-wrap">
        <table class="pro-styled-table">
          <thead>
            <tr>
              <th style="min-width: 220px;">Company Name</th>
              <th>PO Number</th>
              <th style="min-width: 160px;">Category & Type</th>
              <th style="min-width: 140px;">PO Value</th>
              <th>Completed Date</th>
              <th>Assigned Engineer</th>
              <th style="text-align:center;">Status</th>
              <th style="min-width: 180px;">Service Report</th>
            </tr>
          </thead>
          <tbody v-if="filteredCompletedVisits.length">
            <tr
              v-for="row in filteredCompletedVisits"
              :key="(row.category || 'AMC') + '-' + (row.id || row.po_number || Math.random())"
              class="pro-table-row row-completed-visit"
            >
              <td>
                <div class="pro-company-cell">
                  <span class="pro-company-name">{{ row.company_name }}</span>
                </div>
              </td>

              <td><span class="pro-po-pill">{{ row.po_number || '-' }}</span></td>

              <!-- Category & Service Type Badge -->
              <td>
                <span
                  class="cat-pill"
                  :class="row.category === 'Service' ? 'cat-pill-service' : 'cat-pill-amc'"
                >
                  <i :class="row.category === 'Service' ? 'fas fa-screwdriver-wrench' : 'fas fa-handshake'"></i>
                  {{ row.service_type || (row.category === 'Service' ? 'Service Order' : 'AMC Visit') }}
                </span>
              </td>

              <!-- PO Value (COLUMN) -->
              <td>
                <span class="pro-val-pill">
                  <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(row.value_of_po, false) }}
                </span>
              </td>

              <td>
                <span class="pro-date-pill completed-date-pill">
                  <i class="fas fa-calendar-check"></i> {{ row.visit_date || row.service_date || '-' }}
                </span>
              </td>

              <td>
                <span class="pro-text-sub font-semibold">
                  <i class="fas fa-user-tie" style="color: #0284c7; margin-right: 4px;"></i>
                  {{ getUserName(row.assign_to) }}
                </span>
              </td>

              <td style="text-align:center;">
                <span class="supply-status-badge badge-delivered">
                  <i class="fas fa-circle-check"></i> Completed
                </span>
              </td>

              <td>
                <div v-if="row.report_path && row.report_path.trim() !== ''" class="report-btns-wrap">
                  <button
                    v-for="(path, idx) in row.report_path.split(',')"
                    :key="idx"
                    class="view-report-pill-btn"
                    @click="viewReport(path)"
                    title="Click to view uploaded report"
                  >
                    <i class="fas fa-file-pdf"></i> Report {{ idx + 1 }}
                  </button>
                </div>
                <span v-else class="text-no-report">
                  <i class="fas fa-file-circle-xmark"></i> No Report
                </span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="8" class="pro-no-data-cell">
                <div class="pro-no-data-wrap">
                  <i class="fas fa-clipboard-list" style="color: #10b981;"></i>
                  <p>No completed AMC visits or service orders found matching your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { toastError, toastSuccess } from "../../utils/toast";

export default {
  name: "AmcVisitsPage",
  data() {
    return {
      isRefreshing: false,
      activeViewTab: "pending", // Default to Awaiting/Pending Visits on refresh!
      completedTypeFilter: "all", // "all" | "amc" | "service"
      visit_assign: [],
      completedVisits: [],
      completedServices: [],
      serviceEmployees: [],
      employees: [],
      months: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      filters: {
        search: "",
        month: "",
        year: ""
      }
    };
  },
  computed: {
    availableFilterYears() {
      const years = new Set();
      const currentYear = new Date().getFullYear();
      years.add(currentYear);
      years.add(currentYear - 1);
      years.add(currentYear + 1);

      const checkDate = (d) => {
        if (d) {
          const y = new Date(d).getFullYear();
          if (!isNaN(y)) years.add(y);
        }
      };

      this.visit_assign.forEach(v => checkDate(v.visit_date));
      this.completedVisits.forEach(v => checkDate(v.visit_date));
      this.completedServices.forEach(s => checkDate(s.visit_date || s.service_date));

      return Array.from(years).sort((a, b) => b - a);
    },

    filteredVisits() {
      return this.visit_assign.filter(v => {
        // ❌ Strict check: Do NOT show completed visits in AMC Pending & Assigned Visits section
        const status = String(v.status || '').trim().toLowerCase();
        if (status === 'completed') return false;
        if (v.report_path && String(v.report_path).trim() !== '') return false;

        // Check if already in completedVisits list
        if (this.completedVisits && this.completedVisits.length) {
          const isCompleted = this.completedVisits.some(c => {
            if (c.id && v.id && c.id == v.id) return true;
            if (
              c.company_name && v.company_name &&
              c.po_number && v.po_number &&
              c.visit_date && v.visit_date &&
              c.company_name.trim().toLowerCase() === v.company_name.trim().toLowerCase() &&
              c.po_number.trim().toLowerCase() === v.po_number.trim().toLowerCase() &&
              c.visit_date === v.visit_date
            ) {
              return true;
            }
            return false;
          });
          if (isCompleted) return false;
        }

        return this.matchGeneralFilter(v);
      });
    },

    allCompletedItems() {
      const amcList = (this.completedVisits || []).map(v => ({
        ...v,
        category: 'AMC',
        service_type: v.service_type || v.type_of_amc || 'AMC Visit'
      }));

      const serviceList = (this.completedServices || []).map(s => ({
        ...s,
        category: 'Service',
        service_type: s.type_of_service || 'Service Order'
      }));

      return [...amcList, ...serviceList].sort((a, b) => {
        const dateA = new Date(a.visit_date || a.service_date || 0);
        const dateB = new Date(b.visit_date || b.service_date || 0);
        return dateB - dateA;
      });
    },

    filteredCompletedVisits() {
      let list = this.allCompletedItems;

      if (this.completedTypeFilter === 'amc') {
        list = list.filter(item => item.category === 'AMC');
      } else if (this.completedTypeFilter === 'service') {
        list = list.filter(item => item.category === 'Service');
      }

      return list.filter(row => {
        return this.matchGeneralFilter(row);
      });
    },

    completedAmcCount() {
      return this.allCompletedItems.filter(item => item.category === 'AMC' && this.matchGeneralFilter(item)).length;
    },

    completedServicesCount() {
      return this.allCompletedItems.filter(item => item.category === 'Service' && this.matchGeneralFilter(item)).length;
    },

    pendingVisitsPoValue() {
      return this.filteredVisits.reduce((sum, v) => {
        const val = Number(v.value_of_po);
        return sum + (!isNaN(val) ? val : 0);
      }, 0);
    },

    completedVisitsPoValue() {
      return this.filteredCompletedVisits.reduce((sum, v) => {
        const val = Number(v.value_of_po);
        return sum + (!isNaN(val) ? val : 0);
      }, 0);
    },

    totalPoValue() {
      return this.pendingVisitsPoValue + this.completedVisitsPoValue;
    },

    totalVisitsCount() {
      return this.filteredVisits.length + this.filteredCompletedVisits.length;
    },

    filteredServiceEmployees() {
      if (this.serviceEmployees && this.serviceEmployees.length) {
        return this.serviceEmployees;
      }
      return (this.employees || []).filter(e => String(e.department || '').trim().toLowerCase() === 'service');
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.tab) {
      this.activeViewTab = this.$route.query.tab;
    }
    this.fetchAllData();
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push('/employee/customerregistrations');
      }
    },

    setActiveTab(tab) {
      this.activeViewTab = tab;
    },

    resetFilters() {
      this.filters = {
        search: "",
        month: "",
        year: ""
      };
      this.completedTypeFilter = "all";
      this.activeViewTab = "pending";
    },

    matchGeneralFilter(item) {
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const matchesCompany = item.company_name && item.company_name.toLowerCase().includes(q);
        const matchesPo = item.po_number && item.po_number.toLowerCase().includes(q);
        const engineerName = this.getUserName(item.assign_to).toLowerCase();
        const matchesEngineer = engineerName.includes(q);
        const matchesType = (item.service_type || item.type_of_service || '').toLowerCase().includes(q);
        if (!matchesCompany && !matchesPo && !matchesEngineer && !matchesType) {
          return false;
        }
      }

      const rawDate = item.visit_date || item.service_date;

      if (this.filters.month) {
        if (!rawDate) return false;
        const m = new Date(rawDate).getMonth() + 1;
        if (m !== Number(this.filters.month)) return false;
      }

      if (this.filters.year) {
        if (!rawDate) return false;
        const y = new Date(rawDate).getFullYear();
        if (y !== Number(this.filters.year)) return false;
      }

      return true;
    },

    formatCurrency(amount, withSymbol = true) {
      if (amount === null || amount === undefined || amount === '') return '-';
      const num = Number(amount);
      if (isNaN(num)) return amount;
      const formatted = num.toLocaleString('en-IN', {
        maximumFractionDigits: 2
      });
      return withSymbol ? `₹ ${formatted}` : formatted;
    },

    async fetchAllData() {
      this.isRefreshing = true;
      try {
        await Promise.all([
          this.fetchVisitOrders(),
          this.fetchCompletedVisitsList(),
          this.fetchCompletedServicesList(),
          this.fetchEmployees()
        ]);
      } catch (err) {
        console.error("Error loading AMC visit data:", err);
      } finally {
        setTimeout(() => {
          this.isRefreshing = false;
        }, 300);
      }
    },

    async fetchEmployees() {
      try {
        const [serviceRes, allRes] = await Promise.all([
          axios.get("/api/users/service"),
          axios.get("/api/employees")
        ]);
        this.serviceEmployees = serviceRes.data || [];
        this.employees = allRes.data || [];
      } catch (error) {
        console.error("Error fetching employees:", error);
        try {
          const res = await axios.get("/api/users/service");
          this.serviceEmployees = res.data || [];
          this.employees = res.data || [];
        } catch (_) {}
      }
    },

    async fetchVisitOrders() {
      try {
        // Try direct backend or local endpoint
        let res;
        try {
          res = await axios.get("/api/get-visit-orders");
        } catch (_) {
          res = await axios.get("https://employees.archenterprises.co.in/api/api/get-visit-orders");
        }

        this.visit_assign = (res.data || []).map(visit => ({
          ...visit,
          assign_to: visit.assign_to ? Number(visit.assign_to) : ''
        }));
      } catch (error) {
        console.error("Failed to load Visit Orders", error);
        toastError("Failed to load AMC visit orders");
      }
    },

    async fetchCompletedVisitsList() {
      try {
        let res;
        try {
          res = await axios.get("/api/get-assigned-visits");
        } catch (_) {
          try {
            res = await axios.get("https://employees.archenterprises.co.in/api/api/get-assigned-visits");
          } catch (e2) {
            try {
              res = await axios.get("/api/amc-completed-visits");
            } catch (e3) {
              res = await axios.get("https://employees.archenterprises.co.in/api/api/amc-completed-visits");
            }
          }
        }

        const raw = (res.data && res.data.data) ? res.data.data : (res.data || []);
        this.completedVisits = (Array.isArray(raw) ? raw : [])
          .filter(v => !v.status || v.status === 'Completed' || (v.report_path && v.report_path.trim() !== ''))
          .map(v => ({
            ...v,
            category: 'AMC',
            service_type: v.service_type || v.type_of_amc || 'AMC Visit'
          }));
      } catch (error) {
        console.error("Error fetching completed AMC visits", error);
      }
    },

    async fetchCompletedServicesList() {
      try {
        let res;
        try {
          res = await axios.get("/api/get-assigned-services");
        } catch (_) {
          try {
            res = await axios.get("/api/completed-services");
          } catch (e2) {
            try {
              res = await axios.get("https://employees.archenterprises.co.in/api/api/get-assigned-services");
            } catch (e3) {
              res = await axios.get("https://employees.archenterprises.co.in/api/api/completed-services");
            }
          }
        }

        const raw = (res.data && res.data.data) ? res.data.data : (res.data || []);
        this.completedServices = (Array.isArray(raw) ? raw : [])
          .filter(s => !s.status || s.status === 'Completed' || (s.report_path && s.report_path.trim() !== ''))
          .map(s => ({
            ...s,
            category: 'Service',
            service_type: s.type_of_service || 'Service Order'
          }));
      } catch (error) {
        console.error("Error fetching completed services", error);
      }
    },

    getUserName(userId) {
      if (!userId) return '-';
      if (typeof userId === 'string' && isNaN(Number(userId))) {
        return userId;
      }
      const user = (this.employees || []).find(emp => emp.id == userId) ||
                   (this.serviceEmployees || []).find(emp => emp.id == userId);
      return user ? user.name : String(userId);
    },

    getAmcStatusLabel(visit) {
      if (visit.status === 'Completed') return 'Completed';

      const hasEngineer = Boolean(visit.assign_to);
      const rawDate = visit.visit_date;

      if (rawDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const visitDate = new Date(rawDate);
        visitDate.setHours(0, 0, 0, 0);
        if (visitDate < today) return 'Overdue';
      }

      // If engineer is assigned to site, it means Scheduled (not Unscheduled)
      if (hasEngineer) {
        return 'Scheduled';
      }

      if (rawDate) {
        return 'Pending';
      }

      return 'Unscheduled';
    },

    getAmcStatusBadgeClass(visit) {
      const label = this.getAmcStatusLabel(visit);
      if (label === 'Completed') return 'badge-delivered';
      if (label === 'Overdue') return 'badge-overdue';
      if (label === 'Scheduled' || label === 'Assigned') return 'badge-scheduled';
      return 'badge-awaiting';
    },

    getAmcStatusIcon(visit) {
      const label = this.getAmcStatusLabel(visit);
      if (label === 'Completed') return 'fas fa-circle-check';
      if (label === 'Overdue') return 'fas fa-triangle-exclamation';
      if (label === 'Scheduled' || label === 'Assigned') return 'fas fa-calendar-check';
      return 'fas fa-clock';
    },

    async assignVisit(visit) {
      try {
        await axios.post('/api/complete-amc', {
          company_name: visit.company_name,
          po_number: visit.po_number,
          visit_date: visit.visit_date,
          assign_to: visit.assign_to,
          status: visit.status || 'Pending'
        });
        toastSuccess('AMC engineer assigned successfully');
        this.fetchVisitOrders();
      } catch (error) {
        console.error(error);
        toastError('Failed to assign engineer');
      }
    },

    async updateAmcVisitDate(visit) {
      if (!visit.visit_date) return;
      try {
        await axios.post('/api/update-amc-visit', {
          id: visit.id,
          date: visit.visit_date
        });
        toastSuccess('AMC Visit date updated successfully');
      } catch (error) {
        console.error(error);
        toastError('Failed to update visit date');
      }
    },

    viewReport(path) {
      if (!path) return;
      const baseUrl = "https://employees.archenterprises.co.in";
      const cleanPath = path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`;
      window.open(`${baseUrl}${cleanPath}`, "_blank");
    }
  }
};
</script>

<style scoped>
.amc-visits-page {
  padding: 1.5rem 2rem 4rem 2rem;
  background: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;
}

/* =========================================================
   PAGE HERO HEADER
   ========================================================= */
.pro-page-header {
  position: relative;
  background: linear-gradient(135deg, #0284c7 0%, #0f766e 100%);
  color: #ffffff;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 18px;
  box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.35);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.pro-header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.pro-btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #ffffff;
  padding: 0.55rem 1.15rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);
}

.pro-btn-back:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateX(-3px);
}

.pro-header-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pro-header-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.pro-page-title {
  font-size: 1.65rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.pro-status-pill {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pro-page-subtitle {
  margin: 0.35rem 0 0 0;
  font-size: 0.88rem;
  font-weight: 500;
  color: #e0f2fe;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.pro-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pro-btn-header-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  padding: 0.6rem 1.25rem;
  border-radius: 50px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);
}

.pro-btn-header-refresh:hover {
  background: #ffffff;
  color: #0284c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* =========================================================
   KPI / STATS CARDS
   ========================================================= */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 1.4rem;
  display: flex;
  align-items: center;
  gap: 1.15rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
}

.kpi-card.kpi-selected {
  outline: 2px solid #0284c7;
  box-shadow: 0 8px 22px rgba(2, 132, 199, 0.18);
}

.kpi-card.kpi-pending {
  border-left: 4px solid #0284c7;
}

.kpi-card.kpi-completed {
  border-left: 4px solid #10b981;
}

.kpi-card.kpi-total {
  border-left: 4px solid #7c3aed;
}

.kpi-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.icon-pending { background: #e0f2fe; color: #0284c7; }
.icon-completed { background: #dcfce7; color: #15803d; }
.icon-total { background: #ede9fe; color: #7c3aed; }

.kpi-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.kpi-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.kpi-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.55rem;
  border-radius: 50px;
}

.badge-pending-pill { background: #e0f2fe; color: #0284c7; }
.badge-completed-pill { background: #dcfce7; color: #15803d; }
.badge-purple-pill { background: #ede9fe; color: #6d28d9; }

.kpi-value {
  font-size: 1.35rem;
  font-weight: 800;
  margin-top: 0.2rem;
  letter-spacing: -0.01em;
}

.text-cyan { color: #0284c7; }
.text-emerald { color: #059669; }
.text-purple { color: #6d28d9; }

.kpi-meta {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  margin-top: 0.15rem;
}

/* =========================================================
   FILTER TOOLBAR & TABS
   ========================================================= */
.pro-filter-toolbar {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.4rem;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.pro-search-box {
  position: relative;
  flex: 2 1 260px;
}

.pro-search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
  pointer-events: none;
}

.pro-search-input {
  width: 100%;
  height: 40px;
  padding: 0.5rem 2.2rem 0.5rem 2.5rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.86rem;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.pro-search-input:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
}

.pro-clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0;
  border: none;
  color: #64748b;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
}

.pro-filter-box {
  position: relative;
  flex: 1 1 160px;
}

.pro-select-icon {
  position: absolute;
  left: 0.95rem;
  top: 50%;
  transform: translateY(-50%);
  color: #0284c7;
  font-size: 0.85rem;
  pointer-events: none;
}

.pro-arrow {
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.75rem;
  pointer-events: none;
}

.pro-select {
  width: 100%;
  height: 40px;
  padding: 0.5rem 2rem 0.5rem 2.4rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.86rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.pro-select:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
}

.tab-pill-group {
  display: inline-flex;
  align-items: center;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
  flex-wrap: wrap;
}

.tab-pill {
  border: none;
  background: transparent;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.tab-pill:hover {
  color: #0f172a;
}

.tab-pill.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.tab-pill.active.tab-pending {
  color: #0284c7;
}

.tab-pill.active.tab-completed {
  color: #059669;
}

.pro-btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 40px;
  padding: 0 1rem;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-btn-reset-filters:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* =========================================================
   CARD SECTIONS (PENDING & COMPLETED)
   ========================================================= */
.section-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 2.25rem;
  transition: all 0.25s ease;
}

.section-card-header {
  padding: 1.15rem 1.75rem;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-card-header.header-cyan {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
}

.section-card-header.header-emerald {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.25);
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 1.15rem;
}

.section-icon-badge {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.section-pill {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.65rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.section-value-badge {
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  background: #ffffff;
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.badge-cyan-val { color: #0284c7; }
.badge-emerald-val { color: #047857; }

.section-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.section-summary-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 0.4rem 0.9rem;
  border-radius: 50px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* =========================================================
   TABLE STYLING
   ========================================================= */
.table-scroll-wrap {
  overflow-x: auto;
  max-height: 520px;
}

.pro-styled-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.45rem;
  padding: 0.9rem 1.25rem 1.25rem 1.25rem;
}

.pro-styled-table thead th {
  background: #e2e8f0;
  color: #475569;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.8rem 1rem;
  border: none;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 5;
}

.pro-styled-table thead tr th:first-child {
  border-radius: 8px 0 0 8px;
}

.pro-styled-table thead tr th:last-child {
  border-radius: 0 8px 8px 0;
}

.pro-table-row {
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;
}

.pro-table-row:hover {
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.pro-table-row td {
  padding: 0.85rem 1rem;
  vertical-align: middle;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.pro-table-row td:first-child {
  border-left: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 10px 0 0 10px;
}

.pro-table-row td:last-child {
  border-right: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 0 10px 10px 0;
}

.row-completed-visit {
  background: linear-gradient(90deg, #ffffff 0%, #f0fdf4 100%) !important;
  border-left: 4px solid #10b981 !important;
}

/* ── Typography & Pill Elements ── */
.pro-company-cell {
  display: flex;
  align-items: center;
  max-width: 260px;
}

.pro-company-name {
  font-weight: 700;
  font-size: 0.88rem;
  color: #0f172a;
  line-height: 1.35;
}

.pro-po-pill {
  display: inline-block;
  background: #f8fafc;
  color: #1e293b;
  font-weight: 800;
  font-size: 0.82rem;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #cbd5e1;
}

.pro-val-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #ffffff;
  color: #0284c7;
  font-weight: 800;
  font-size: 0.84rem;
  padding: 0.32rem 0.75rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(2, 132, 199, 0.18);
  white-space: nowrap;
}

.pro-text-sub {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e293b;
}

.pro-date-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #ffffff;
  padding: 0.32rem 0.65rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  border: 1px solid rgba(0, 0, 0, 0.08);
  white-space: nowrap;
}

.completed-date-pill {
  color: #047857;
  border-color: rgba(4, 120, 87, 0.2);
}

.pro-date-input-sm {
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.84rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  cursor: pointer;
}

.pro-date-input-sm:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
}

.pro-select-engineer {
  width: 100%;
  max-width: 220px;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.84rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  cursor: pointer;
}

.pro-select-engineer:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15);
}

/* ── Status badges ── */
.supply-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.supply-status-badge.badge-overdue {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}

.supply-status-badge.badge-awaiting {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.supply-status-badge.badge-dispatched,
.supply-status-badge.badge-scheduled {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #7dd3fc;
}

.supply-status-badge.badge-delivered {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

/* ── Service Report Buttons ── */
.report-btns-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.view-report-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-report-pill-btn:hover {
  background: #2563eb;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(37, 99, 235, 0.2);
}

.text-no-report {
  font-size: 0.78rem;
  font-weight: 600;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ── No data ── */
.pro-no-data-cell {
  text-align: center;
  padding: 3rem 1rem !important;
}

.pro-no-data-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.pro-no-data-wrap i {
  font-size: 2.5rem;
  margin-bottom: 0.65rem;
}

.pro-no-data-wrap p {
  font-size: 0.92rem;
  font-weight: 600;
  margin: 0;
}

/* ── Completed Category Segment Pills ── */
.completed-segment-pills {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(8px);
  padding: 3px;
  border-radius: 10px;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  flex-wrap: wrap;
}

.seg-pill {
  border: none;
  background: transparent;
  padding: 0.35rem 0.75rem;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.seg-pill:hover {
  background: rgba(255, 255, 255, 0.2);
}

.seg-pill.active {
  background: #ffffff;
  color: #065f46;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.seg-pill.seg-amc.active {
  color: #0f766e;
}

.seg-pill.seg-service.active {
  color: #4338ca;
}

/* ── Category & Type Pills ── */
.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.cat-pill-amc {
  background: #f0fdfa;
  color: #0f766e;
  border: 1px solid #99f6e4;
}

.cat-pill-service {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}
</style>
