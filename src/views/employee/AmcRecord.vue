<template>
  <div class="amc-wrapper">
    <h2>📋 AMC Record Data</h2>
<!-- 🔎 COLOR LEGEND -->
<div class="legend-bar">
  <div class="legend-item visit-completed">
    🔵 Completed Visit
  </div>

  <div class="legend-item visit-pending">
    🟢 Assigned Visit
  </div>

  <div class="legend-item visit-overdue">
    🔴 Overdue Visit
  </div>

  <div class="legend-item amc-highlight">
    ⚪️ Pending Period
  </div>
  <div class="filters-card">
  <div class="filter-item">
    <label>
      <span>📅 Month</span>
      <input type="month" v-model="filterMonth" />
    </label>
  </div>

  <div class="filter-item">
    <label>
      <span>⚡ Status</span>
      <select v-model="filterStatus">
        <option value="">All</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="overdue">Overdue</option>
      </select>
    </label>
  </div>

  <div class="filter-actions">
    <button class="btn-clear" @click="clearFilters">🧹 Clear Filters</button>
  </div>
</div>
</div>



    <div class="table-scroll">
   <table class="amc-table">
  <thead>
    <tr>
      <th>Sr. No</th>
      <th class="col-company">Company Name</th>
      <th class = "ponumber">PO Number</th>
      <th class = "col-povalue">PO Value</th>
      <th class = "col-amcperiod">AMC Period</th>

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

export default {
  data() {
    return {
      amcRecords: [], // API response from add_po
      saveTimers: {}, //  debounce map
      filterMonth: "", // e.g., "2026-01"
    filterStatus: "", // "", "completed", "pending", "overdue"
    };
  },
computed: {
  filteredRecords() {
    return this.amcRecords.filter((row) => {
      // 1️⃣ Filter by month
      if (this.filterMonth) {
        const [year, month] = this.filterMonth.split("-");
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0); // last day of month

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

      // 2️⃣ Filter by status
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
},

  methods: {
     onInvoiceInput(row, visitNo, value) {
    // Update local state
    row.invoice_status[visitNo] = value;

    const key = `${row.add_po_id}-${visitNo}`;

    // Clear previous debounce
    if (this.saveTimers[key]) {
      clearTimeout(this.saveTimers[key]);
    }

    // Debounced save (500ms)
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
      console.error("Invoice save failed ❌");
    });
  },
    getAssignedUser(row, visitNo) {
  const visitDate = row["visit" + visitNo];
  if (!visitDate || !row.assigned_visit_map) return null;

  // ✅ SAFE: removes time, avoids timezone bugs
  const dateStr = visitDate.split(" ")[0];

  const fullName = row.assigned_visit_map[dateStr];
  if (!fullName) return null;

  // 👤 First name only
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
  today.setHours(0, 0, 0, 0); // normalize

  const visitStr = visit.toISOString().split("T")[0];

  // ❌ Ignore if pending or completed
  if (
    row.pending_visit_dates?.includes(visitStr) ||
    row.completed_visit_dates?.includes(visitStr)
  ) {
    return false;
  }

  // 🔴 Overdue condition
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

    isVisitAssigned(row, visitNo) {
    const visitDate = row['visit' + visitNo];
    if (!visitDate || !row.assigned_visit_dates) return false;

    return row.assigned_visit_dates.includes(
      new Date(visitDate).toISOString().split('T')[0]
    );
  },
    formatPeriod(start, end) {
      if (!start || !end) return "-";

      const options = { month: "short", year: "numeric" };

      return `${new Date(start).toLocaleDateString("en-US", options)} - 
              ${new Date(end).toLocaleDateString("en-US", options)}`;
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

  },

mounted() {
  axios.get("/api/add-po-list").then((res) => {
    this.amcRecords = res.data.map((row) => ({
      ...row,

      // ✅ REQUIRED FOR FOREIGN KEYS
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

};
</script>



<style scoped>
  .assigned-user {
  font-size: 11px;
  margin-top: 2px;
  color: #2c3e50;
  font-weight: 600;
}

.amc-wrapper {
  padding: 20px;
}


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
    /* background-color: #ffedf694; */
  /* white-space: nowrap; */
}

.amc-table th {
background: #ffc99499;
    color: #000000;
    font-size: 12px;
    font-family: system-ui;
    text-transform: uppercase;
    font-weight: 600;
    height: 39px;

}

.status {
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.status.Paid {
  background: #dcfce7;
  color: #15803d;
}

.status.Pending {
  background: #fef3c7;
  color: #92400e;
}
/* Company name – wider */
.col-company {
  min-width: 260px;
  max-width: 320px;
  text-align: left;
}

/* Visit columns */
.col-visit {
  min-width: 145px;
  height: 29px;
      text-align: -webkit-center;
}
.col-amcperiod{
  min-width: 140px;
      text-align: -webkit-center;
}
.col-povalue{
  width: 100px;
      text-align: -webkit-center;
}
/* Invoice input width */
.invoice-input {
  width: 120px;
}

/* Prevent text wrap */
.amc-table th,
.amc-table td {
  /* white-space: nowrap; */
}

.visit-assigned {
  background-color: #52ff00  !important; /* soft green */
  color: #065f46;
  font-weight: 600;
}
/* AMC period highlight */
.amc-highlight {
  background-color: #e8f5e9; /* light green */
  font-weight: 600;
}

/* Pending visit */
.visit-pending {
  background-color: #10ff00; /* light blue */
  font-weight: 600;
}

/* Completed visit */
.visit-completed {
  background-color: #00fdff; /* yellow */
  font-weight: 700;
}
/* 🔴 Overdue Visit */
.visit-overdue {
  background-color: #ffe3e3; /* light red */
  border: 1px solid #fa5252;
  font-weight: 700;
  color: #c92a2a;
}

/* 🔎 Legend Bar */
.legend-bar {
  display: flex;
  gap: 14px;
  margin: 12px 0 18px;
  flex-wrap: wrap;
  /* align-items: center; */
}

.legend-item {
  padding: 6px 14px;
  border-radius: 6px;
  height: 29px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.filters {
  margin-bottom: 12px;
  display: flex;
  gap: 16px;
  align-items: center;
}
.filters label {
  font-size: 12px;
  font-weight: 600;
}
.filters input,
.filters select {
  margin-left: 6px;
  padding: 4px 8px;
  font-size: 12px;
}

.filters-card {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: #f9f9f9; /* light gray card */
  padding: 6px 31px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  align-items: center;
}

.filter-item {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  font-weight: 600;
}

.filter-item span {
  margin-bottom: 4px;
  display: inline-block;
}

.filter-item input,
.filter-item select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
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

.btn-clear {
  background-color: #ff6b6b;
  color: #fff;
  border: none;
  padding: 7px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background-color: #fa5252;
  box-shadow: 0 2px 8px rgba(250, 82, 82, 0.4);
}

.visit-cell {
  position: relative;
  cursor: pointer;
}

/* Tooltip box */
.visit-tooltip {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background: #2c3e50;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 10;
}

/* Tooltip arrow */
.visit-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: #2c3e50 transparent transparent transparent;
}

/* Show on hover */
.visit-cell:hover .visit-tooltip {
  opacity: 1;
  visibility: visible;
}

</style>

