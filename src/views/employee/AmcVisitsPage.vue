<template>
  <div>
    <!-- VISIT ORDERS POPUP -->
    <div v-if="!showCompletedVisits" class="modal-backdrop">
      <div class="modal-card large">
        <!-- MODAL HEADER -->
        <div class="modal-header-custom">
          <button class="btn-back" @click="$emit('close')">
            ⬅ Back
          </button>

          <div class="modal-title-wrapper">
            <div class="modal-icon-badge" style="background: linear-gradient(135deg, #10b981, #047857);">
              <i class="fas fa-calendar-check"></i>
            </div>
            <h2 class="modal-title">AMC Pending & Assigned Visits</h2>
            <p class="modal-subtitle">Manage upcoming and ongoing visits</p>
          </div>

          <button class="amc-ord" @click="showCompletedVisits = true">
            <i class="fa fa-check-square-o"></i> Completed Visits
          </button>
        </div>

        <!-- FILTER BAR -->
        <div class="filter-bar">
          <input
            type="text"
            v-model="filters.search"
            placeholder="Search Company / PO Number"
            class="filter-input"
          />
          <select v-model="filters.month" class="filter-select">
            <option :value="null">All Months</option>
            <option v-for="(m, index) in months" :key="index" :value="index + 1">{{ m }}</option>
          </select>
        </div>

        <!-- Visit Table -->
        <div class="table-scroll-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Visit Date</th>
                <th>Assign To</th>
              </tr>
            </thead>
            <tbody v-if="filteredVisits.length">
              <tr v-for="(visit, index) in filteredVisits" :key="`${visit.company_name}-${visit.visit_date}-${index}`">
                <td>{{ visit.company_name }}</td>
                <td>
                  <input
                    type="date"
                    v-model="visit.visit_date"
                    class="date-input"
                    :placeholder="'Select date'"
                    @change="updateAmcVisitDate(visit)"
                  />
                </td>
                <td>
                  <select v-model.number="visit.assign_to" @change="assignVisit(visit)">
                    <option disabled value="">-- Select Employee --</option>
                    <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                      {{ emp.name }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="3" class="no-data">No visit assignments found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Assigned Visits Popup -->
    <div v-if="showCompletedVisits" class="modal-backdrop">
      <div class="modal-card large">
        <!-- MODAL HEADER -->
        <div class="modal-header-custom">
          <button class="btn-back" @click="showCompletedVisits = false">
            ⬅ Back
          </button>

          <div class="modal-title-wrapper">
            <div class="modal-icon-badge" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <h2 class="modal-title">Completed Visits</h2>
            <p class="modal-subtitle">Review all finished assignments</p>
          </div>
          <div style="width: 80px;"></div>
        </div>

        <!-- FILTER BAR -->
        <div class="filter-bar">
          <input
            type="text"
            v-model="completedFilters.search"
            placeholder="Search Company / PO Number"
            class="filter-input"
          />
          <select v-model="completedFilters.month" class="filter-select">
            <option value="">All Months</option>
            <option v-for="(m, index) in months" :key="index" :value="index + 1">{{ m }}</option>
          </select>
        </div>

        <!-- Table -->
        <div class="table-scroll-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Visit Date</th>
                <th>Assigned To</th>
                <th>View Report</th>
              </tr>
            </thead>
            <tbody v-if="filteredCompletedVisits.length">
              <tr v-for="row in filteredCompletedVisits" :key="row.id">
                <td>{{ row.company_name }}</td>
                <td>{{ row.visit_date }}</td>
                <td>{{ getUserName(row.assign_to) }}</td>
                <td>
                  <div v-if="row.report_path && row.report_path.trim() !== ''">
                    <button
                      v-for="(path, idx) in row.report_path.split(',')"
                      :key="idx"
                      class="view-report-btn"
                      @click="viewReport(path)"
                      style="margin-right: 5px;"
                    >
                      Report {{ idx + 1 }}
                    </button>
                  </div>
                  <span v-else>No Report</span>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="4" class="no-data">No completed visits found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { toastError, toastSuccess } from "../../utils/toast";

export default {
  name: "AmcVisitsModal",
  data() {
    return {
      showCompletedVisits: false,
      visit_assign: [],
      completedVisits: [],
      employees: [],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      filters: { search: "", month: null },
      completedFilters: { search: "", month: "" }
    };
  },
  computed: {
    filteredVisits() {
      return this.visit_assign.filter(v => {
        let matchesSearch = true;
        let matchesMonth = true;
        if (this.filters.search) {
          const s = this.filters.search.toLowerCase();
          matchesSearch = (v.company_name && v.company_name.toLowerCase().includes(s)) ||
                          (v.po_number && v.po_number.toLowerCase().includes(s));
        }
        if (this.filters.month) {
          if (!v.visit_date) {
            matchesMonth = false;
          } else {
            const m = new Date(v.visit_date).getMonth() + 1;
            matchesMonth = m === parseInt(this.filters.month);
          }
        }
        return matchesSearch && matchesMonth;
      });
    },
    filteredCompletedVisits() {
      return this.completedVisits.filter(row => {
        let matchSearch = true;
        let matchMonth = true;
        if (this.completedFilters.search) {
          const s = this.completedFilters.search.toLowerCase();
          matchSearch =
            (row.company_name && row.company_name.toLowerCase().includes(s)) ||
            (row.po_number && row.po_number.toLowerCase().includes(s));
        }
        if (this.completedFilters.month) {
          if (!row.visit_date) {
            matchMonth = false;
          } else {
            const rowMonth = new Date(row.visit_date).getMonth() + 1;
            matchMonth = rowMonth === parseInt(this.completedFilters.month);
          }
        }
        return matchSearch && matchMonth;
      });
    }
  },
  mounted() {
    this.fetchVisitOrders();
    this.fetchCompletedVisitsList();
    this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      try {
        const response = await axios.get("/api/employees");
        this.employees = response.data;
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    },
    async fetchVisitOrders() {
      try {
        const response = await axios.get("https://employees.archenterprises.co.in/api/api/get-visit-orders");
        this.visit_assign = (response.data || []).map(visit => ({
          ...visit,
          assign_to: visit.assign_to ? Number(visit.assign_to) : ''
        }));
      } catch (error) {
        console.error("Failed to load Visit Orders", error);
      }
    },
    async fetchCompletedVisitsList() {
      try {
        const response = await axios.get("https://employees.archenterprises.co.in/api/api/amc-completed-visits");
        this.completedVisits = response.data.data || [];
      } catch (error) {
        console.error("Error fetching completed AMC visits", error);
      }
    },
    getUserName(userId) {
      if (!userId) return '-';
      const user = this.employees.find(emp => emp.id == userId);
      return user ? user.name : 'Unknown';
    },
    async assignVisit(visit) {
      try {
        await axios.post('/api/complete-amc', {
          company_name: visit.company_name,
          date: visit.visit_date,
          user_id: visit.assign_to
        });
        toastSuccess('AMC assigned successfully');
        this.fetchVisitOrders();
      } catch (error) {
        toastError('Failed to complete AMC');
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
        toastError('Failed to update visit date');
      }
    },
    viewReport(path) {
      const baseUrl = "https://employees.archenterprises.co.in";
      window.open(`${baseUrl}${path.trim()}`, "_blank");
    }
  }
};
</script>

<style scoped>
/* Modal Layout Styles inherited from parent or duplicated here if needed */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  position: relative;
  width: 90%;
  max-width: 1000px;
  padding: 30px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 20px;
}
.modal-title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.modal-icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-bottom: 10px;
}
.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}
.modal-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
}
.btn-back {
  background: #f1f5f9;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-back:hover {
  background: #e2e8f0;
}
.amc-ord {
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}
.amc-ord:hover {
  background-color: #d1fae5;
  transform: translateY(-2px);
}
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background: linear-gradient(to right, #f8fafc, #eff6ff);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #4f46e5;
  flex-wrap: wrap;
}
.filter-input, .filter-select {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  min-width: 220px;
  flex: 1;
}
.table-scroll-container {
  max-height: 50vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.styled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 500px;
  background: #ffffff;
}
.styled-table th {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  font-weight: 600;
  padding: 12px;
  text-transform: uppercase;
  font-size: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.styled-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.date-input {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.view-report-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
