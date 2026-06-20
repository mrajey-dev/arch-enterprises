<template>
  <div class="amc-wrapper">
    <!-- Mobile Header -->
    <div class="mobile-header" v-if="isMobile">
     
      <div class="mobile-title">
        <i class="fas fa-clipboard-list"></i>
        <span>AMC Records Sheet</span>
      </div>
      <button class="mobile-filter-btn" @click="toggleFilter">
        <i class="fas fa-filter"></i>
        <span v-if="filterMonth || filterStatus" class="filter-badge">●</span>
      </button>
    </div>

    <!-- Desktop Header -->
    <div class="desktop-header desktop-only">
      <h2>📋 AMC Record Data</h2>
    </div>

    <!-- Mobile Stats -->
    <div class="stats-row-mobile" v-if="isMobile">
      <div class="stat-chip" @click="filterStatus = ''">
        <span class="stat-count">{{ amcRecords.length }}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-chip completed" @click="filterStatus = 'completed'">
        <span class="stat-count">{{ completedCount }}</span>
        <span class="stat-label">Completed</span>
      </div>
      <div class="stat-chip pending" @click="filterStatus = 'pending'">
        <span class="stat-count">{{ pendingCount }}</span>
        <span class="stat-label">Pending</span>
      </div>
      <div class="stat-chip overdue" @click="filterStatus = 'overdue'">
        <span class="stat-count">{{ overdueCount }}</span>
        <span class="stat-label">Overdue</span>
      </div>
    </div>

    <!-- Legend Bar - Mobile Optimized -->
    <div class="legend-bar" :class="{ 'legend-mobile': isMobile }">
      <div class="legend-item visit-completed">🔵 Completed</div>
      <div class="legend-item visit-pending">🟢 Assigned</div>
      <div class="legend-item visit-overdue">🔴 Overdue</div>
      <div class="legend-item amc-highlight">⚪️ Pending Period</div>
    </div>

    <!-- Filters Card - Mobile Optimized -->
    <div class="filters-card" :class="{ 'filters-mobile': isMobile }">
      <div class="filter-item">
        <span>📅 Month</span>
        <input type="month" v-model="filterMonth" />
      </div>

      <div class="filter-item">
        <span>⚡ Status</span>
        <select v-model="filterStatus">
          <option value="">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div class="filter-actions">
        <button class="btn-clear" @click="clearFilters">🧹 Clear</button>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div class="mobile-cards" v-if="isMobile">
      <div v-for="(row, index) in filteredRecords" :key="row.id" class="amc-card">
        <div class="card-header">
          <span class="card-sr">#{{ index + 1 }}</span>
          <span class="card-company">{{ row.company_name }}</span>
        </div>

        <div class="card-body">
          <div class="card-row">
            <span class="card-label">PO Number</span>
            <span class="card-value">{{ row.po_number }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">PO Value</span>
            <span class="card-value">₹{{ row.value_of_po }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">AMC Period</span>
            <span class="card-value">{{ formatPeriod(row.start_period, row.end_period) }}</span>
          </div>
        </div>

        <!-- Visits -->
        <div class="card-visits">
          <div class="card-visits-title">📌 Visits</div>
          <div v-for="n in 12" :key="'card-visit-' + n" class="visit-item">
            <div class="visit-header">
              <span class="visit-label">Visit {{ n }}</span>
              <span 
                :class="[
                  'visit-status-badge',
                  isVisitCompleted(row, n) ? 'badge-completed' : '',
                  isVisitPending(row, n) ? 'badge-pending' : '',
                  isVisitOverdue(row, n) ? 'badge-overdue' : '',
                  isWithinAmcPeriod(row, n) ? 'badge-amc' : ''
                ]"
              >
                {{ isVisitCompleted(row, n) ? '✅' : '' }}
                {{ isVisitPending(row, n) ? '🔄' : '' }}
                {{ isVisitOverdue(row, n) ? '🔴' : '' }}
                {{ isWithinAmcPeriod(row, n) && !isVisitCompleted(row, n) && !isVisitPending(row, n) && !isVisitOverdue(row, n) ? '⏳' : '' }}
              </span>
            </div>
            <div class="visit-details">
              <span class="visit-date">{{ row['visit' + n] || '—' }}</span>
              <span v-if="getAssignedUser(row, n)" class="visit-user">
                👤 {{ getAssignedUser(row, n) }}
              </span>
            </div>
            <div class="visit-invoice">
              <input
                type="text"
                :value="row.invoice_status[n]"
                class="invoice-input-mobile"
                placeholder="Invoice status"
                @input="onInvoiceInput(row, n, $event.target.value)"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredRecords.length === 0" class="no-data-mobile">
        <i class="fas fa-inbox"></i>
        <p>AMC records Loading...</p>
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="table-scroll" v-else>
      <table class="amc-table">
        <thead>
          <tr>
            <th>Sr. No</th>
            <th class="col-company">Company Name</th>
            <th class="ponumber">PO Number</th>
            <th class="col-povalue">PO Value</th>
            <th class="col-amcperiod">AMC Period</th>
            <template v-for="n in 12" :key="'head-' + n">
              <th class="col-visit">Visit {{ n }}</th>
              <th>Invoice Status</th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in filteredRecords" :key="row.id">
            <td>{{ index + 1 }}</td>
            <td class="col-company">{{ row.company_name }}</td>
            <td>{{ row.po_number }}</td>
            <td>₹{{ row.value_of_po }}</td>
            <td>{{ formatPeriod(row.start_period, row.end_period) }}</td>
            <template v-for="n in 12" :key="'row-' + n">
              <td
                class="col-visit"
                :class="[
                  isVisitCompleted(row, n) ? 'visit-completed' : '',
                  isVisitPending(row, n) ? 'visit-pending' : '',
                  isVisitOverdue(row, n) ? 'visit-overdue' : '',
                  isWithinAmcPeriod(row, n) ? 'amc-highlight' : ''
                ]"
              >
                <div v-if="row['visit' + n]">
                  {{ row['visit' + n] }}
                  <span v-if="getAssignedUser(row, n)">
                    - {{ getAssignedUser(row, n) }}
                  </span>
                </div>
                <span v-else>-</span>
              </td>
              <td>
                <input
                  type="text"
                  :value="row.invoice_status[n]"
                  class="invoice-input"
                  @input="onInvoiceInput(row, n, $event.target.value)"
                />
              </td>
            </template>
          </tr>
        </tbody>
      </table>
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
  data() {
    return {
      amcRecords: [],
      saveTimers: {},
      filterMonth: "",
      filterStatus: "",
      isMobile: false,
      isSidebarVisible: true,
      filterOpen: false,
    };
  },
  computed: {
    filteredRecords() {
      return this.amcRecords.filter((row) => {
        if (this.filterMonth) {
          const [year, month] = this.filterMonth.split("-");
          const monthStart = new Date(year, month - 1, 1);
          const monthEnd = new Date(year, month, 0);
          let hasVisitInMonth = false;
          for (let i = 1; i <= 12; i++) {
            const visit = row["visit" + i];
            if (visit) {
              const visitDate = new Date(visit);
              if (visitDate >= monthStart && visitDate <= monthEnd) {
                hasVisitInMonth = true;
                break;
              }
            }
          }
          if (!hasVisitInMonth) return false;
        }

        if (this.filterStatus) {
          let hasStatus = false;
          for (let i = 1; i <= 12; i++) {
            if (this.filterStatus === "completed" && this.isVisitCompleted(row, i)) {
              hasStatus = true;
              break;
            }
            if (this.filterStatus === "pending" && this.isVisitPending(row, i)) {
              hasStatus = true;
              break;
            }
            if (this.filterStatus === "overdue" && this.isVisitOverdue(row, i)) {
              hasStatus = true;
              break;
            }
          }
          if (!hasStatus) return false;
        }
        return true;
      });
    },
    completedCount() {
      let count = 0;
      this.amcRecords.forEach(row => {
        for (let i = 1; i <= 12; i++) {
          if (this.isVisitCompleted(row, i)) count++;
        }
      });
      return count;
    },
    pendingCount() {
      let count = 0;
      this.amcRecords.forEach(row => {
        for (let i = 1; i <= 12; i++) {
          if (this.isVisitPending(row, i)) count++;
        }
      });
      return count;
    },
    overdueCount() {
      let count = 0;
      this.amcRecords.forEach(row => {
        for (let i = 1; i <= 12; i++) {
          if (this.isVisitOverdue(row, i)) count++;
        }
      });
      return count;
    }
  },
  methods: {
    toggleFilter() {
      this.filterOpen = !this.filterOpen;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    onInvoiceInput(row, visitNo, value) {
      row.invoice_status[visitNo] = value;
      const key = `${row.add_po_id}-${visitNo}`;
      if (this.saveTimers[key]) {
        clearTimeout(this.saveTimers[key]);
      }
      this.saveTimers[key] = setTimeout(() => {
        this.saveInvoiceStatus(row, visitNo, value);
      }, 500);
    },
    saveInvoiceStatus(row, visitNo, value) {
      axios.post("/api/save-invoice-status", {
        add_po_id: row.add_po_id,
        visit_assign_id: row.visit_assign_id,
        visit_no: visitNo,
        visit_date: row["visit" + visitNo],
        invoice_status: value,
      }).then(() => {
        console.log("Invoice saved ✔");
      }).catch(() => {
        console.error("Invoice save failed ");
      });
    },
    getAssignedUser(row, visitNo) {
      const visitDate = row["visit" + visitNo];
      if (!visitDate || !row.assigned_visit_map) return null;
      const dateStr = visitDate.split(" ")[0];
      const fullName = row.assigned_visit_map[dateStr];
      if (!fullName) return null;
      return fullName.split(" ")[0];
    },
    clearFilters() {
      this.filterMonth = "";
      this.filterStatus = "";
    },
    isVisitOverdue(row, visitNo) {
      const visitDate = row['visit' + visitNo];
      if (!visitDate) return false;
      const visit = new Date(visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const visitStr = visit.toISOString().split("T")[0];
      if (
        row.pending_visit_dates?.includes(visitStr) ||
        row.completed_visit_dates?.includes(visitStr)
      ) {
        return false;
      }
      return visit < today;
    },
    isWithinAmcPeriod(row, visitNo) {
      const visitDate = row['visit' + visitNo];
      if (!visitDate || !row.start_period || !row.end_period) return false;
      const v = new Date(visitDate);
      const start = new Date(row.start_period);
      const end = new Date(row.end_period);
      return v >= start && v <= end;
    },
    isVisitPending(row, visitNo) {
      const visitDate = row['visit' + visitNo];
      if (!visitDate || !row.pending_visit_dates) return false;
      return row.pending_visit_dates.includes(
        new Date(visitDate).toISOString().split("T")[0]
      );
    },
    isVisitCompleted(row, visitNo) {
      const visitDate = row['visit' + visitNo];
      if (!visitDate || !row.completed_visit_dates) return false;
      return row.completed_visit_dates.includes(
        new Date(visitDate).toISOString().split("T")[0]
      );
    },
    formatPeriod(start, end) {
      if (!start || !end) return "-";
      const options = { month: "short", year: "numeric" };
      return `${new Date(start).toLocaleDateString("en-US", options)} - ${new Date(end).toLocaleDateString("en-US", options)}`;
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    
    axios.get("/api/add-po-list").then((res) => {
      this.amcRecords = res.data.map((row) => ({
        ...row,
        add_po_id: row.id,
        visit_assign_id: row.visit_assign_id ?? null,
        invoice_status: {
          1: row.invoice_status1 ?? "",
          2: row.invoice_status2 ?? "",
          3: row.invoice_status3 ?? "",
          4: row.invoice_status4 ?? "",
          5: row.invoice_status5 ?? "",
          6: row.invoice_status6 ?? "",
          7: row.invoice_status7 ?? "",
          8: row.invoice_status8 ?? "",
          9: row.invoice_status9 ?? "",
          10: row.invoice_status10 ?? "",
          11: row.invoice_status11 ?? "",
          12: row.invoice_status12 ?? "",
        },
      }));
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--dark, #1a1a2e);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--dark, #1a1a2e);
}

.mobile-title i {
  color: #667eea;
}

.mobile-filter-btn {
  position: relative;
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-filter-btn:active {
  transform: scale(0.9);
}

.filter-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  color: #667eea;
  font-size: 10px;
}

/* Desktop Header */
.desktop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.desktop-header h2 {
  margin: 0;
  color: var(--text, #1a1a2e);
  font-size: 19px;
}

/* Stats Row - Mobile */
.stats-row-mobile {
  display: none;
  gap: 6px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding: 4px 0;
  -webkit-overflow-scrolling: touch;
}

.stat-chip {
  flex: 0 0 auto;
  padding: 6px 12px;
  border-radius: 10px;
  background: #f3f4f6;
  text-align: center;
  min-width: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-chip:active {
  transform: scale(0.95);
}

.stat-chip.completed { border-color: #28a745; }
.stat-chip.pending { border-color: #ffc107; }
.stat-chip.overdue { border-color: #dc3545; }

.stat-count {
  display: block;
  font-size: 16px;
  font-weight: 700;
}

.stat-label {
  font-size: 9px;
  color: #6b7280;
}

/* Legend */
.legend-bar {
  display: flex;
  gap: 10px;
  margin: 12px 0 18px;
  flex-wrap: wrap;
}

.legend-mobile {
  gap: 6px;
}

.legend-item {
  padding: 4px 10px;
  border-radius: 6px;
  height: 28px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.legend-mobile .legend-item {
  font-size: 9px;
  padding: 3px 8px;
  height: 24px;
}

/* Filters Card */
.filters-card {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #f9f9f9;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  align-items: center;
}

.filters-mobile {
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  font-weight: 600;
}

.filters-mobile .filter-item {
  width: 100%;
}

.filter-item span {
  margin-bottom: 4px;
}

.filter-item input,
.filter-item select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
  width: 100%;
}

.filter-item input:focus,
.filter-item select:focus {
  border-color: #3399ff;
  box-shadow: 0 0 5px rgba(51, 153, 255, 0.3);
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.filters-mobile .filter-actions {
  width: 100%;
}

.btn-clear {
  background-color: #ff6b6b;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.filters-mobile .btn-clear {
  width: 100%;
  padding: 8px;
}

.btn-clear:hover {
  background-color: #fa5252;
  box-shadow: 0 2px 8px rgba(250, 82, 82, 0.4);
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
}

.amc-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.card-sr {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
}

.card-company {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 14px;
  text-align: right;
  word-break: break-word;
  max-width: 60%;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.card-value {
  font-size: 12px;
  color: #1a1a2e;
  font-weight: 500;
  text-align: right;
  word-break: break-word;
  max-width: 55%;
}

.card-visits {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.card-visits-title {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.visit-item {
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.visit-item:last-child {
  border-bottom: none;
}

.visit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.visit-label {
  font-size: 11px;
  font-weight: 600;
  color: #4b5563;
}

.visit-status-badge {
  font-size: 12px;
}

.visit-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #6b7280;
}

.visit-date {
  font-weight: 500;
}

.visit-user {
  font-size: 10px;
  color: #667eea;
}

.visit-invoice {
  margin-top: 4px;
}

.invoice-input-mobile {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  background: #fafafa;
  transition: all 0.2s;
}

.invoice-input-mobile:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.no-data-mobile {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.no-data-mobile i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.no-data-mobile p {
  font-size: 14px;
}

/* Table Styles */
.table-scroll {
  overflow-x: auto;
}

.amc-table {
  width: 100%;
  min-width: 2000px;
  border-collapse: collapse;
}

.amc-table th,
.amc-table td {
  border: 1px solid #18181880;
  padding: 8px;
  font-size: 11px;
}

.amc-table th {
  background: #ffc99499;
  color: var(--text);
  font-size: 12px;
  font-family: system-ui;
  text-transform: uppercase;
  font-weight: 600;
  height: 39px;
}

.col-company {
  min-width: 260px;
  max-width: 320px;
  text-align: left;
}

.col-visit {
  min-width: 145px;
  height: 29px;
  text-align: -webkit-center;
}

.col-amcperiod {
  min-width: 140px;
  text-align: -webkit-center;
}

.col-povalue {
  width: 100px;
  text-align: -webkit-center;
}

.invoice-input {
  width: 120px;
}

/* Visit Status Colors */
.visit-pending {
  background-color: #10ff00;
  font-weight: 600;
}

.visit-completed {
  background-color: #00fdff;
  font-weight: 700;
}

.visit-overdue {
  background-color: #ffe3e3;
  border: 1px solid #fa5252;
  font-weight: 700;
  color: #c92a2a;
}

.amc-highlight {
  background-color: #e8f5e9;
  font-weight: 600;
}

/* Utility */
.desktop-only {
  display: block;
}

/* Responsive */
@media (max-width: 768px) {
  .amc-wrapper {
    padding: 12px;
  }

  .mobile-header {
    display: flex;
  }

  .desktop-header {
    display: none;
  }

  .stats-row-mobile {
    display: flex;
  }

  .mobile-cards {
    display: flex;
  }

  .table-scroll {
    display: none;
  }

  .desktop-only {
    display: none !important;
  }
}

@media (max-width: 480px) {
  .amc-wrapper {
    padding: 8px;
  }

  .mobile-title {
    font-size: 14px;
  }

  .mobile-filter-btn {
    width: 32px;
    height: 32px;
  }

  .stat-chip {
    padding: 4px 10px;
    min-width: 50px;
  }

  .stat-count {
    font-size: 14px;
  }

  .stat-label {
    font-size: 8px;
  }

  .amc-card {
    padding: 10px;
  }

  .card-company {
    font-size: 13px;
    max-width: 50%;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .card-value {
    text-align: left;
    max-width: 100%;
  }

  .visit-header {
    flex-wrap: wrap;
  }

  .visit-details {
    flex-wrap: wrap;
    gap: 4px;
  }

  .legend-item {
    font-size: 8px;
    padding: 2px 6px;
    height: 20px;
  }

  .filters-card {
    padding: 10px 12px;
    gap: 8px;
  }

  .filter-item {
    font-size: 11px;
  }

  .filter-item input,
  .filter-item select {
    font-size: 12px;
    padding: 4px 8px;
  }

  .btn-clear {
    font-size: 11px;
    padding: 5px 12px;
  }
}
</style>