<template>
  <div class="announcement-board" v-if="!isMobile || !isSidebarVisible">
    <h2>📊 Quotation & Order Sheet</h2>
    <div class="filter-bar">
  <label>Status:</label>
  <select v-model="selectedStatus" class="filter-select">
    <option value="">All</option>
    <option value="pending">Pending</option>
    <option value="followup">Follow Up</option>
    <option value="approved">Approved</option>
    <option value="rejected">Rejected</option>
  </select>
</div>

    <div class="content">
      <div class="table-scroll-wrapper">
        <table class="styled-customer-table">
          <thead>
            <tr>
              <th> Sr. No. </th>
              <th> QUOTATION NO. </th>
              <th> Quote Date </th>
              <th> Party Name </th>
              <th> Engine Serial Number </th>
              <th> Brief Description of Goods </th>
              <th> Initial Value (Non-Taxable) </th>
              <th> Disc.(%) </th>
              <th> Recommended By</th>
             <th class="remarks-col">Remarks</th>

              <th> Status of Quotation </th>
            </tr>
          </thead>
          <tbody>
           <tr
  v-for="(q, index) in filteredQuotations"
  :key="q.id"
              :class="{
                'approved-row': q.status === 'approved',
                'pending-row': q.status === 'pending',
                'rejected-row': q.status === 'rejected',
                'followup-row': q.status === 'followup',
              }"
            >
              <td>{{ index + 1 }}</td>
              <td>AE/QUOTE/{{ financialYear }}/{{ q.id }}</td>
              <td>{{ formatDate(q.created_at) }}</td>
              <td>{{ q.company_name }}</td>
              <td>{{ q.engine_serial }}</td>
              <td>
  <ul>
    <li v-for="item in q.items" :key="item.sr">
      {{ item.description }}
    </li>
  </ul>
</td>

              <td>{{ calculateInitialValue(q.items).toLocaleString('en-IN') }}</td>
              <td>
                <span v-if="Number(q.discount) === 0">No Discount</span>
                <span v-else>{{ getDiscountPercent(q.items) }}%</span>
              </td>
              <td>{{ q.recommended_by }}</td>
              <td class="remarks-col">
    <textarea
      v-model="q.remarks"
      placeholder="Add follow-up notes..."
      class="remark-textarea"
      rows="5"
      @input="debounceSave(q)"
    ></textarea>
  </td>

           <td>
  <div class="status-wrapper">
    <select
      v-model="q.status"
      class="status-select"
      :class="`status-${q.status || 'default'}`"
      @change="updateQuotationStatus(q)"
    >
      <option value="">Select</option>
      <option value="pending">Pending</option>
      <option value="followup">Follow Up</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </select>
  </div>
</td>

            </tr>

            <tr v-if="followUpQuotations.length === 0">
              <td colspan="11" class="no-data">No quotations available</td>
            </tr>
          </tbody>
        </table>
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
       selectedStatus: "",
      debounceTimers: {} ,
      isMobile: false,
      isSidebarVisible: true,
      financialYear: "2025-26",
      followUpQuotations: [],
    };
  },
  computed: {
  filteredQuotations() {
    if (!this.selectedStatus) {
      return this.followUpQuotations;
    }
    return this.followUpQuotations.filter(
      q => q.status === this.selectedStatus
    );
  }
},

  methods: {
saveRemark(q) {
  axios.put(`/api/quotations/${q.id}`, { remarks: q.remarks })
    .then(() => this.$toast.success("Remarks saved"))
    .catch(() => {
  this.$toast.error("Failed to save remark");
});
},



    debounceSave(q) {
      // clear previous timer if exists
      if (this.debounceTimers[q.id]) {
        clearTimeout(this.debounceTimers[q.id]);
      }

      // set new timer
      this.debounceTimers[q.id] = setTimeout(() => {
        this.saveRemark(q);
        delete this.debounceTimers[q.id]; // clean up
      }, 1000); // 1 second delay after typing stops
  
  },
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("en-IN");
    },
    calculateInitialValue(items) {
      if (!items) return 0;
      return items.reduce((sum, item) => sum + (item.rate || 0) * (item.qty || 0), 0);
    },
    getDiscountPercent(items) {
      if (!items) return 0;
      return items.reduce((sum, item) => sum + (item.discount || 0), 0);
    },
updateQuotationStatus(q) {
  axios.post(`/api/quotations/${q.id}/status`, { 
      quotation_followup_status: q.status, // <-- use column name
      remarks: q.remarks 
  })
  .then(res => {
      console.log(res.data.message);
      this.$toast.success(res.data.message);
  })
  .catch(err => {
      console.error(err);
      this.$toast.error("Failed to update status");
  });
},






fetchQuotations() {
  axios.get("/api/quotations")
    .then(res => {
      this.followUpQuotations = res.data.map(q => ({
        ...q,
        items: q.items || [],
        status: q.quotation_followup_status?.toLowerCase() || '',
        remarks: q.remarks || ''
      }));
    })
    .catch(() => {
      if (this.$toast && typeof this.$toast.error === 'function') {
        this.$toast.error('Failed to fetch quotations');
      } else {
        console.error('Failed to fetch quotations');
      }
    });
},


  },
  mounted() {
    this.fetchQuotations();
  },
};
</script>


<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
/* ===== REMARKS COLUMN WIDTH ===== */
.remarks-col {
  min-width: 240px;
  width: 240px;
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-select {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-weight: 500;
}

/* Optional: make textarea fill column */
.remarks-col .remark-textarea {
  width: 100%;
}

/* Example row colors based on status */
.approved-row {
  background-color: #92e8a6!important;
}
.pending-row {
  background-color: #fff3cd!important;
}
.rejected-row {
  background-color: #f8d7da!important;
}
.followup-row {
  background-color: #b4d8fd!important;
}
.table-input {
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
}
.no-data {
  text-align: center;
  font-style: italic;
  color: #888;
}
.announcement-board {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.announcement-board h2 {
  margin-bottom: 15px;
  color: var(--text);
  font-size: 24px;
}

.table-scroll-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  background: white;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
}

.styled-customer-table {
  width: 100%;
  /* border-collapse: collapse; */
  min-width: 1000px; /* ensures horizontal scroll on small screens */
}

.styled-customer-table thead {
  background-color: var(--text);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}

.styled-customer-table th,
.styled-customer-table td {
  padding: 12px 15px;
  text-align: left;
      border-bottom: 3px solid #ffffff;
  font-size: 14px;
}


.styled-customer-table .no-data {
  text-align: center;
  padding: 30px 0;
  color: #888;
  font-style: italic;
}

@media (max-width: 768px) {
  .styled-customer-table th,
  .styled-customer-table td {
    padding: 8px 10px;
    font-size: 12px;
  }

  .announcement-board h2 {
    font-size: 20px;
  }
}
/* ===== STATUS BUTTON STYLE ===== */
.status-wrapper {
  display: flex;
  justify-content: center;
}

.status-select {
  padding: 6px 14px;
  border-radius: 7px;
  font-weight: 600;
  font-size: 13px;
  border: none;
  cursor: pointer;
  outline: none;
  appearance: none;
  text-align: center;
  min-width: 110px;
}

/* Status Colors */
.status-pending {
  background: #ffffff;
  color: #856404;
}

.status-followup {
  background: #ffffff;
  color: #004085;
}

.status-approved {
  background: #ffffff;
  color: #155724;
}

.status-rejected {
  background: #ffffff;
  color: #721c24;
}

.status-default {
  background: #ffffff;
  color: #383d41;
}

/* Hover */
.status-select:hover {
  filter: brightness(0.95);
}

/* ===== REMARK TEXTAREA ===== */
.remark-textarea {
  width: 100%;
  resize: vertical;
  padding: 8px 0px;
  font-family: math;
  border-radius: 8px;
  border: 1px solid #605e6a;
  font-size: 13px;
  transition: 0.2s ease;
  background: #fafafa;
}

.remark-textarea:focus {
  outline: none;
  border-color: #3498db;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.15);
}

</style>
