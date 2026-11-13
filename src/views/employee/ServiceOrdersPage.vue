<template>
  <div class="service-orders-page">
    <!-- =========================================================
         PAGE HERO HEADER
         ========================================================= -->
    <div class="pro-page-header">
      <div class="pro-header-left">
        <button class="pro-btn-back" @click="goBack" title="Return to Dashboard">
          <i class="fas fa-arrow-left"></i>
          <span>Back</span>
        </button>
        <div class="pro-header-titles">
          <div class="pro-badge-top">
            <span class="pro-badge-dot"></span>
            <span>Operations & Field Services</span>
          </div>
          <h1 class="pro-title">Service Orders Management</h1>
          <p class="pro-subtitle">
            Track customer service orders, schedule visits, assign certified engineers, and inspect completed service reports
          </p>
        </div>
      </div>

      <div class="pro-header-actions">
        <button
          class="pro-btn-refresh"
          @click="fetchAllData"
          :class="{ 'is-refreshing': isRefreshing }"
          title="Refresh All Data"
        >
          <i class="fas fa-rotate"></i>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- =========================================================
         KPI SUMMARY CARDS
         ========================================================= -->
    <div class="kpi-grid">
      <!-- Pending & Assigned Services KPI -->
      <div
        class="kpi-card kpi-pending"
        :class="{ 'kpi-selected': activeViewTab === 'pending' }"
        @click="setActiveTab(activeViewTab === 'pending' ? 'all' : 'pending')"
      >
        <div class="kpi-icon icon-pending">
          <i class="fas fa-screwdriver-wrench"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-head-row">
            <span class="kpi-label">Pending & Assigned</span>
            <span class="kpi-badge badge-pending-pill">{{ filteredServicePoList.length }}</span>
          </div>
          <span class="kpi-value text-indigo">{{ formatCurrency(pendingServicePoValue) }}</span>
          <span class="kpi-meta">Active service orders scheduled</span>
        </div>
      </div>

      <!-- Completed Services KPI -->
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
            <span class="kpi-label">Completed Services</span>
            <span class="kpi-badge badge-completed-pill">{{ filteredAssignedServiceList.length }}</span>
          </div>
          <span class="kpi-value text-emerald">{{ formatCurrency(completedServicePoValue) }}</span>
          <span class="kpi-meta">Finished with service reports</span>
        </div>
      </div>

      <!-- Total Service Engagement KPI -->
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
            <span class="kpi-badge badge-purple-pill">{{ totalOrdersCount }}</span>
          </div>
          <span class="kpi-value text-purple">{{ formatCurrency(totalServicePoValue) }}</span>
          <span class="kpi-meta">All scheduled & finished services</span>
        </div>
      </div>
    </div>

    <!-- =========================================================
         FILTER TOOLBAR & TAB SWITCHER
         ========================================================= -->
    <div class="pro-filter-toolbar">
      <div class="pro-search-box">
        <i class="fas fa-search pro-search-icon"></i>
        <input
          type="text"
          v-model="filters.search"
          placeholder="Search company, PO number, service type, engineer..."
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

      <!-- Tab View Buttons (Default: Pending & Assigned) -->
      <div class="tab-pill-group">
        <button
          class="tab-pill"
          :class="{ active: activeViewTab === 'all' }"
          @click="setActiveTab('all')"
        >
          <i class="fas fa-layer-group"></i> All ({{ totalOrdersCount }})
        </button>
        <button
          class="tab-pill tab-pending"
          :class="{ active: activeViewTab === 'pending' }"
          @click="setActiveTab('pending')"
        >
          <i class="fas fa-screwdriver-wrench"></i> Pending & Assigned ({{ filteredServicePoList.length }})
        </button>
        <button
          class="tab-pill tab-completed"
          :class="{ active: activeViewTab === 'completed' }"
          @click="setActiveTab('completed')"
        >
          <i class="fas fa-clipboard-check"></i> Completed ({{ filteredAssignedServiceList.length }})
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
         SECTION 1: PENDING & ASSIGN SERVICE ORDERS CARD
         ========================================================= -->
    <div
      v-if="activeViewTab === 'all' || activeViewTab === 'pending'"
      class="section-card section-pending"
    >
      <div class="section-card-header header-indigo">
        <div class="section-header-left">
          <div class="section-icon-badge icon-indigo-badge">
            <i class="fas fa-screwdriver-wrench"></i>
          </div>
          <div>
            <div class="section-title-row">
              <h2 class="section-title">Pending & Assign Service Orders</h2>
              <span class="section-pill pill-indigo-dark">{{ filteredServicePoList.length }} Services</span>
              <span class="section-value-badge badge-indigo-val" v-if="pendingServicePoValue">
                <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(pendingServicePoValue, false) }}
              </span>
            </div>
            <p class="section-subtitle">
              Schedule service dates and assign certified Service Department personnel to active customer orders
            </p>
          </div>
        </div>

        <div class="section-header-right">
          <span class="section-summary-tag tag-indigo">
            <i class="fas fa-user-gear"></i> Active Service Queue
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
              <th style="min-width: 170px;">Scheduled Service Date</th>
              <th>Service Type</th>
              <th style="min-width: 220px;">Assign Service Engineer</th>
              <th style="text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody v-if="filteredServicePoList.length">
            <tr
              v-for="(order, index) in filteredServicePoList"
              :key="order.id || `${order.company_name}-${order.po_number}-${index}`"
              class="pro-table-row"
            >
              <td>
                <div class="pro-company-cell">
                  <span class="pro-company-name">{{ order.company_name }}</span>
                </div>
              </td>

              <td>
                <span class="pro-po-pill">{{ order.po_number || '-' }}</span>
              </td>

              <!-- PO Value Column -->
              <td>
                <span class="pro-val-pill">
                  <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(order.value_of_po, false) }}
                </span>
              </td>

              <td>
                <input
                  type="date"
                  v-model="order.service_date"
                  class="pro-date-input-sm"
                  title="Click to update scheduled service date"
                  @change="updateServiceDate(order)"
                />
              </td>

              <td>
                <span class="cat-pill cat-pill-service">
                  <i class="fas fa-wrench"></i> {{ order.type_of_service || 'Service' }}
                </span>
              </td>

              <td>
                <select
                  v-model="order.assign_to"
                  @change="onAssignChange(order)"
                  class="pro-select-engineer"
                >
                  <option value="">-- Assign Service Engineer --</option>
                  <option
                    v-for="emp in filteredServiceEmployees"
                    :key="emp.id"
                    :value="emp.id"
                  >
                    {{ emp.name }}
                  </option>
                </select>
              </td>

              <td style="text-align:center;">
                <span
                  class="supply-status-badge"
                  :class="getServiceStatusBadgeClass(order)"
                >
                  <i :class="getServiceStatusIcon(order)"></i>
                  {{ getServiceStatusLabel(order) }}
                </span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="pro-no-data-cell">
                <div class="pro-no-data-wrap">
                  <i class="fas fa-wrench" style="color: #4f46e5;"></i>
                  <p>No pending service orders found matching your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- =========================================================
         SECTION 2: COMPLETED SERVICE ORDERS CARD
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
              <h2 class="section-title">Completed Service Orders</h2>
              <span class="section-pill pill-emerald">{{ filteredAssignedServiceList.length }} Completed</span>
              <span class="section-value-badge badge-emerald-val" v-if="completedServicePoValue">
                <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(completedServicePoValue, false) }}
              </span>
            </div>
            <p class="section-subtitle">
              Review completed customer service orders, engineer sign-offs, and uploaded field reports
            </p>
          </div>
        </div>

        <div class="section-header-right">
          <span class="section-summary-tag tag-emerald">
            <i class="fas fa-circle-check"></i> Finished
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
              <th>Completed Date</th>
              <th>Service Type</th>
              <th>Assigned Engineer</th>
              <th style="text-align:center;">Status</th>
              <th style="min-width: 180px;">Service Report</th>
            </tr>
          </thead>
          <tbody v-if="filteredAssignedServiceList.length">
            <tr
              v-for="item in filteredAssignedServiceList"
              :key="item.id || item.po_number"
              class="pro-table-row row-completed-service"
            >
              <td>
                <div class="pro-company-cell">
                  <span class="pro-company-name">{{ item.company_name }}</span>
                </div>
              </td>

              <td><span class="pro-po-pill">{{ item.po_number || '-' }}</span></td>

              <!-- PO Value -->
              <td>
                <span class="pro-val-pill">
                  <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(item.value_of_po, false) }}
                </span>
              </td>

              <td>
                <span class="pro-date-pill completed-date-pill">
                  <i class="fas fa-calendar-check"></i> {{ item.visit_date || item.service_date || '-' }}
                </span>
              </td>

              <td>
                <span class="cat-pill cat-pill-service">
                  <i class="fas fa-wrench"></i> {{ item.type_of_service || 'Service' }}
                </span>
              </td>

              <td>
                <span class="pro-text-sub font-semibold">
                  <i class="fas fa-user-tie" style="color: #0284c7; margin-right: 4px;"></i>
                  {{ getUserName(item.assign_to) }}
                </span>
              </td>

              <td style="text-align:center;">
                <span class="supply-status-badge badge-delivered">
                  <i class="fas fa-circle-check"></i> Completed
                </span>
              </td>

              <td>
                <div v-if="item.report_path && item.report_path.trim() !== ''" class="report-btns-wrap">
                  <button
                    v-for="(path, idx) in item.report_path.split(',')"
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
                  <p>No completed service orders found matching your filters</p>
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
  name: "ServiceOrdersPage",
  data() {
    return {
      isRefreshing: false,
      activeViewTab: "pending", // Default to Pending & Assigned Services on refresh!
      servicePoList: [],
      service_assign: [], // completed services
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

      this.servicePoList.forEach(s => checkDate(s.service_date || s.date));
      this.service_assign.forEach(s => checkDate(s.visit_date || s.service_date));

      return Array.from(years).sort((a, b) => b - a);
    },

    filteredServicePoList() {
      return this.servicePoList.filter(order => {
        // ❌ Strict check: Do NOT show completed services in Pending & Assigned section
        const status = String(order.status || order.service_status || '').trim().toLowerCase();
        if (status === 'completed') return false;
        if (order.report_path && String(order.report_path).trim() !== '') return false;

        // Check if already present in completed services list
        if (this.service_assign && this.service_assign.length) {
          const isCompleted = this.service_assign.some(c => {
            if (c.id && order.id && c.id == order.id) return true;
            if (
              c.company_name && order.company_name &&
              c.po_number && order.po_number &&
              c.company_name.trim().toLowerCase() === order.company_name.trim().toLowerCase() &&
              c.po_number.trim().toLowerCase() === order.po_number.trim().toLowerCase()
            ) {
              return true;
            }
            return false;
          });
          if (isCompleted) return false;
        }

        return this.matchGeneralFilter(order);
      });
    },

    filteredAssignedServiceList() {
      return this.service_assign.filter(item => {
        return this.matchGeneralFilter(item);
      });
    },

    pendingServicePoValue() {
      return this.filteredServicePoList.reduce((sum, s) => {
        const val = Number(s.value_of_po);
        return sum + (!isNaN(val) ? val : 0);
      }, 0);
    },

    completedServicePoValue() {
      return this.filteredAssignedServiceList.reduce((sum, s) => {
        const val = Number(s.value_of_po);
        return sum + (!isNaN(val) ? val : 0);
      }, 0);
    },

    totalServicePoValue() {
      return this.pendingServicePoValue + this.completedServicePoValue;
    },

    totalOrdersCount() {
      return this.filteredServicePoList.length + this.filteredAssignedServiceList.length;
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
      this.activeViewTab = "pending";
    },

    matchGeneralFilter(item) {
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const matchesCompany = item.company_name && item.company_name.toLowerCase().includes(q);
        const matchesPo = item.po_number && item.po_number.toLowerCase().includes(q);
        const matchesType = (item.type_of_service || item.service_type || '').toLowerCase().includes(q);
        const engineerName = this.getUserName(item.assign_to || item.assigned_employee).toLowerCase();
        const matchesEngineer = engineerName.includes(q);
        if (!matchesCompany && !matchesPo && !matchesType && !matchesEngineer) {
          return false;
        }
      }

      const rawDate = item.visit_date || item.service_date || item.date;

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
          this.fetchServicePoList(),
          this.fetchCompletedServices(),
          this.fetchEmployees()
        ]);
      } catch (err) {
        console.error("Error loading service data:", err);
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

    async fetchServicePoList() {
      try {
        let res;
        try {
          res = await axios.get('/api/service-po-list');
        } catch (_) {
          res = await axios.get("https://employees.archenterprises.co.in/api/api/service-po-list");
        }

        const data = (res.data && res.data.data) ? res.data.data : (res.data || []);
        this.servicePoList = (Array.isArray(data) ? data : []).map(order => ({
          ...order,
          service_date: order.service_date || order.assigned_visit_date || order.date || '',
          assign_to: order.assign_to ? Number(order.assign_to) : (order.assigned_employee ? Number(order.assigned_employee) : '')
        }));
      } catch (error) {
        console.error("Error fetching service POs", error);
        toastError("Failed to load service orders");
      }
    },

    async fetchCompletedServices() {
      try {
        let res;
        try {
          res = await axios.get('/api/get-assigned-services');
        } catch (_) {
          try {
            res = await axios.get('/api/completed-services');
          } catch (e2) {
            try {
              res = await axios.get("https://employees.archenterprises.co.in/api/api/get-assigned-services");
            } catch (e3) {
              res = await axios.get("https://employees.archenterprises.co.in/api/api/completed-services");
            }
          }
        }

        const data = (res.data && res.data.data) ? res.data.data : (res.data || []);
        this.service_assign = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching completed services:", error);
      }
    },

    getUserName(userId) {
      if (!userId) return '-';
      if (typeof userId === 'string' && isNaN(Number(userId))) {
        return userId;
      }
      const user = (this.employees || []).find(u => u.id == userId) ||
                   (this.serviceEmployees || []).find(u => u.id == userId);
      return user ? user.name : String(userId);
    },

    getServiceStatusLabel(order) {
      const status = String(order.status || order.service_status || '').trim();
      if (status.toLowerCase() === 'completed') return 'Completed';

      const hasEngineer = Boolean(order.assign_to || order.assigned_employee);
      const rawDate = order.service_date || order.assigned_visit_date || order.date;

      if (rawDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const svcDate = new Date(rawDate);
        svcDate.setHours(0, 0, 0, 0);
        if (svcDate < today) return 'Overdue';
      }

      // If service engineer is assigned to site, it means Scheduled (not Unscheduled)
      if (hasEngineer) {
        return 'Scheduled';
      }

      // If no engineer is assigned yet
      if (rawDate) {
        return 'Pending';
      }

      return 'Unscheduled';
    },

    getServiceStatusBadgeClass(order) {
      const label = this.getServiceStatusLabel(order);
      if (label === 'Completed') return 'badge-delivered';
      if (label === 'Overdue') return 'badge-overdue';
      if (label === 'Scheduled' || label === 'Assigned') return 'badge-scheduled';
      return 'badge-awaiting';
    },

    getServiceStatusIcon(order) {
      const label = this.getServiceStatusLabel(order);
      if (label === 'Completed') return 'fas fa-circle-check';
      if (label === 'Overdue') return 'fas fa-triangle-exclamation';
      if (label === 'Scheduled' || label === 'Assigned') return 'fas fa-calendar-check';
      return 'fas fa-clock';
    },

    onAssignChange(order) {
      if (!order.assign_to) return;
      this.assignServiceEmployee(order);
    },

    async assignServiceEmployee(order) {
      try {
        await axios.post('/api/service_assign', {
          company_name: order.company_name,
          po_number: order.po_number,
          visit_date: order.service_date || order.date || new Date().toISOString().split('T')[0],
          assign_to: Number(order.assign_to),
          type_of_service: order.type_of_service || 'Service'
        });
        toastSuccess("Service engineer assigned successfully!");
        this.fetchServicePoList();
      } catch (_) {
        try {
          await axios.post(`/api/update-assigned-employee/${order.id}`, {
            po_id: order.id,
            assign_to: Number(order.assign_to),
            type_of_service: order.type_of_service
          });
          toastSuccess("Service engineer assigned successfully!");
          this.fetchServicePoList();
        } catch (error) {
          console.error(error);
          toastError("Failed to assign service engineer");
        }
      }
    },

    async updateServiceDate(order) {
      if (!order.service_date) return;
      try {
        await axios.put(`/api/update-service-date/${order.id}`, {
          service_date: order.service_date
        });
        toastSuccess("Service date updated successfully!");
      } catch (_) {
        try {
          await axios.post('/api/update-visit-date', {
            company_name: order.company_name,
            visit_date: order.service_date,
            service_date: order.service_date
          });
          toastSuccess("Service date updated successfully!");
        } catch (error) {
          console.error("Error updating service date:", error);
          toastError("Failed to update service date");
        }
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
.service-orders-page {
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
  background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
  color: #ffffff;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 18px;
  box-shadow: 0 10px 25px -5px rgba(67, 56, 202, 0.25), 0 8px 10px -6px rgba(67, 56, 202, 0.2);
  margin-bottom: 2rem;
  overflow: hidden;
}

.pro-page-header::after {
  content: "";
  position: absolute;
  top: -50%;
  right: -5%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.pro-header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 1;
}

.pro-btn-back {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 0.6rem 1.1rem;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  font-size: 0.88rem;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.pro-btn-back:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(-3px);
}

.pro-header-titles {
  display: flex;
  flex-direction: column;
}

.pro-badge-top {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
  color: #c7d2fe;
  margin-bottom: 0.25rem;
}

.pro-badge-dot {
  width: 7px;
  height: 7px;
  background: #a5b4fc;
  border-radius: 50%;
  box-shadow: 0 0 8px #a5b4fc;
}

.pro-title {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.pro-subtitle {
  margin: 0.35rem 0 0 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 500;
  max-width: 780px;
}

.pro-header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  z-index: 1;
}

.pro-btn-refresh {
  background: #ffffff;
  color: #4338ca;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

.pro-btn-refresh:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
}

.pro-btn-refresh.is-refreshing i {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* =========================================================
   KPI SUMMARY CARDS
   ========================================================= */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
}

.kpi-card.kpi-selected {
  border-color: #4338ca;
  box-shadow: 0 0 0 2px #4338ca, 0 10px 25px rgba(67, 56, 202, 0.15);
}

.kpi-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.icon-pending { background: #e0e7ff; color: #4338ca; }
.icon-completed { background: #d1fae5; color: #059669; }
.icon-total { background: #ede9fe; color: #7c3aed; }

.kpi-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.kpi-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.2rem;
}

.kpi-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.kpi-badge {
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.15rem 0.55rem;
  border-radius: 50px;
}

.badge-pending-pill { background: #e0e7ff; color: #4338ca; }
.badge-completed-pill { background: #d1fae5; color: #059669; }
.badge-purple-pill { background: #ede9fe; color: #7c3aed; }

.kpi-value {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 0.2rem;
}

.text-indigo { color: #4338ca; }
.text-emerald { color: #059669; }
.text-purple { color: #7c3aed; }

.kpi-meta {
  font-size: 0.74rem;
  color: #94a3b8;
  font-weight: 500;
}

/* =========================================================
   FILTER TOOLBAR
   ========================================================= */
.pro-filter-toolbar {
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  margin-bottom: 2rem;
}

.pro-search-box {
  position: relative;
  flex: 1 1 240px;
  min-width: 200px;
}

.pro-search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
}

.pro-search-input {
  width: 100%;
  height: 40px;
  padding: 0.5rem 2.2rem 0.5rem 2.6rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.88rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.pro-search-input:focus {
  background: #ffffff;
  border-color: #4338ca;
  box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.12);
}

.pro-clear-btn {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.pro-clear-btn:hover {
  color: #475569;
}

.pro-filter-box {
  position: relative;
  width: 150px;
}

.pro-select-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
  pointer-events: none;
}

.pro-arrow {
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.72rem;
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
  border-color: #4338ca;
  box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.12);
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
  color: #4338ca;
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
  padding: 1.25rem 1.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  color: #ffffff;
}

.header-indigo {
  background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
}

.header-emerald {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 1.15rem;
}

.section-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.section-pill {
  padding: 0.22rem 0.65rem;
  border-radius: 50px;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.section-value-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.7rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 800;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.badge-indigo-val { color: #4338ca; }
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

.row-completed-service {
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
  color: #4338ca;
  font-weight: 800;
  font-size: 0.84rem;
  padding: 0.32rem 0.75rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(67, 56, 202, 0.2);
  white-space: nowrap;
}

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

.cat-pill-service {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
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
  border-color: #4338ca;
  box-shadow: 0 0 0 2px rgba(67, 56, 202, 0.15);
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
  transition: all 0.15s ease;
}

.pro-select-engineer:focus {
  background: #ffffff;
  border-color: #4338ca;
  box-shadow: 0 0 0 2px rgba(67, 56, 202, 0.15);
}

/* ── Badges ── */
.supply-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.32rem 0.75rem;
  border-radius: 50px;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.badge-awaiting {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.badge-dispatched,
.badge-scheduled {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.badge-delivered {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.badge-overdue {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* ── Reports ── */
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
</style>
