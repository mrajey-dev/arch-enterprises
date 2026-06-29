<template>
  <div class="layout">

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Content -->
      <div class="content" v-show="!isMobile || !isSidebarVisible">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
         
          <div class="mobile-title">
            <i class="fas fa-calendar-check"></i>
            <span>Visit Schedule</span>
          </div>
          <div class="mobile-stats-badge">
            <span>{{ combinedVisits.length }}</span>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div>
              <h1>Visit Schedule</h1>
              <p class="subtitle-modern">Manage and track all service visits</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-chart-line"></i>
            <span>{{ combinedVisits.length }} Total Visits</span>
          </div>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card" @click="filterByStatus('Pending')">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card completed" @click="filterByStatus('Completed')">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ completedCount }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          <div class="stat-card amc" @click="filterByType('AMC')">
            <i class="fas fa-calendar-week"></i>
            <div class="stat-info">
              <span class="stat-value">{{ amcCount }}</span>
              <span class="stat-label">AMC Visits</span>
            </div>
          </div>
          <div class="stat-card service" @click="filterByType('SERVICE')">
            <i class="fas fa-wrench"></i>
            <div class="stat-info">
              <span class="stat-value">{{ serviceCount }}</span>
              <span class="stat-label">Service Visits</span>
            </div>
          </div>
        </div>

        <!-- Filter Bar - Mobile Optimized -->
        <div class="filter-section-premium">
          <div class="section-title-modern" @click="toggleFilters">
            <i class="fas fa-filter"></i>
            <span>Filter Visits</span>
            <i class="fas fa-chevron-down filter-toggle" :class="{ rotated: filtersVisible }"></i>
          </div>
          <div class="filter-grid-premium" :class="{ 'filters-hidden': !filtersVisible }">
            <div class="filter-group">
              <i class="fas fa-calendar-alt"></i>
              <input type="month" v-model="filters.month" class="filter-input-premium" />
            </div>
            <div class="filter-group">
              <i class="fas fa-tag"></i>
              <select v-model="filters.status" class="filter-input-premium">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div class="filter-group">
              <i class="fas fa-building"></i>
              <input type="text" v-model="filters.company" placeholder="Search Company" class="filter-input-premium" />
            </div>
            <button class="reset-filter-btn" @click="resetFilters">
              <i class="fas fa-sync-alt"></i> <span class="btn-text">View All</span>
            </button>
          </div>
        </div>

        <!-- Visits Table - Mobile Optimized -->
        <div class="table-card-premium">
          <div class="table-header-premium">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Visit Records</span>
            </div>
            <div class="table-info">
              <i class="fas fa-file-alt"></i>
              <span>{{ combinedVisits.length }} records</span>
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="(item, index) in combinedVisits" :key="index" class="visit-card">
              <div class="card-header">
                <div class="company-info">
                  <div class="company-avatar">
                    {{ getInitials(item.company_name) }}
                  </div>
                  <div>
                    <div class="company-name">{{ item.company_name }}</div>
                    <div class="po-number">PO: {{ item.po_number }}</div>
                  </div>
                </div>
                <span :class="['status-badge-mobile', item.status?.toLowerCase()]">
                  {{ item.status }}
                </span>
              </div>
              
              <div class="card-body">
                <div class="card-row">
                  <span class="card-label">Visit Date</span>
                  <input type="date" v-model="item.visit_date" class="date-input-mobile" @change="item.visitType === 'AMC' ? updateAmcVisitDate(item) : updateServiceVisitDate(item)" />
                </div>
                <div class="card-row">
                  <span class="card-label">Service Type</span>
                  <span :class="['service-type-badge-mobile', item.visitType === 'AMC' ? 'amc' : 'service']">
                    <i :class="item.visitType === 'AMC' ? 'fas fa-calendar-alt' : 'fas fa-wrench'"></i>
                    {{ item.visitType === 'AMC' ? 'AMC' : item.type_of_service }}
                  </span>
                </div>
                <div class="card-row">
                  <span class="card-label">Status</span>
                  <select :value="item.status" @change="onStatusChange($event, item)" :class="['status-select-mobile', item.status?.toLowerCase()]">
                    <option value="Pending">⏳ Pending</option>
                    <option value="Completed">✅ Completed</option>
                  </select>
                </div>
                <div class="card-row">
                  <span class="card-label">Upload Report</span>
                  <div class="upload-section-mobile">
                    <label class="upload-btn-mobile">
                      <i class="fas fa-upload"></i> Upload
                      <input type="file" multiple @change="handleReportUpload($event, item, item.visitType === 'AMC' ? 'amc' : 'service')" hidden />
                    </label>
                    <span v-if="item.reportNames?.length" class="file-count-mobile">{{ item.reportNames.length }} file(s)</span>
                  </div>
                </div>
                <div class="card-row" v-if="item.report_paths && item.report_paths.length">
                  <span class="card-label">Reports</span>
                  <div class="report-buttons-mobile">
                    <div v-for="(path, rIndex) in item.report_paths" :key="rIndex" class="report-item-mobile">
                      <button class="view-report-btn-mobile" @click="viewReport(path)">
                        <i class="fas fa-file-pdf"></i> Report {{ rIndex + 1 }}
                      </button>
                      <button class="delete-report-btn-mobile" @click="deleteReport(item, path, rIndex)">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="combinedVisits.length === 0" class="empty-state-mobile">
              <i class="fas fa-calendar-times"></i>
              <h4>No Visits Found</h4>
              <p>No visit assignments match your filters</p>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-wrapper-premium" v-else>
            <table class="visit-table-premium">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>PO Number</th>
                  <th>Visit Date</th>
                  <th>Service Type</th>
                  <th>Upload Report</th>
                  <th>Status</th>
                  <th>View Report</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in combinedVisits" :key="index" class="visit-row">
                  <td class="company-cell">
                    <div class="company-info">
                      <div class="company-avatar">
                        {{ getInitials(item.company_name) }}
                      </div>
                      <span>{{ item.company_name }}</span>
                    </div>
                  </td>
                  <td class="po-cell">
                    <span class="po-badge">{{ item.po_number }}</span>
                  </td>
                  <td class="date-cell">
                    <input type="date" v-model="item.visit_date" class="date-input-premium" @change="item.visitType === 'AMC' ? updateAmcVisitDate(item) : updateServiceVisitDate(item)" />
                  </td>
                  <td class="type-cell">
                    <span :class="['service-type-badge', item.visitType === 'AMC' ? 'amc' : 'service']">
                      <i :class="item.visitType === 'AMC' ? 'fas fa-calendar-alt' : 'fas fa-wrench'"></i>
                      {{ item.visitType === 'AMC' ? 'AMC' : item.type_of_service }}
                    </span>
                  </td>
                  <td class="upload-cell">
                    <label class="upload-btn-premium">
                      <i class="fas fa-upload"></i> Upload
                      <input type="file" multiple @change="handleReportUpload($event, item, item.visitType === 'AMC' ? 'amc' : 'service')" hidden />
                    </label>
                    <span v-if="item.reportNames?.length" class="file-count">{{ item.reportNames.length }} file(s)</span>
                  </td>
                  <td class="status-cell">
                    <select :value="item.status" @change="onStatusChange($event, item)" :class="['status-select', item.status?.toLowerCase()]">
                      <option value="Pending">⏳ Pending</option>
                      <option value="Completed">✅ Completed</option>
                    </select>
                  </td>
                  <td class="report-cell">
                    <div v-if="item.report_paths && item.report_paths.length" class="report-buttons">
                      <div v-for="(path, rIndex) in item.report_paths" :key="rIndex" class="report-item">
                        <button class="view-report-btn" @click="viewReport(path)">
                          <i class="fas fa-file-pdf"></i> Report {{ rIndex + 1 }}
                        </button>
                        <button class="delete-report-btn" @click="deleteReport(item, path, rIndex)">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                    <span v-else class="no-report">—</span>
                  </td>
                </tr>

                <!-- Empty State Desktop -->
                <tr v-if="combinedVisits.length === 0" class="empty-row">
                  <td colspan="7">
                    <div class="empty-state-premium">
                      <i class="fas fa-calendar-times"></i>
                      <h4>No Visits Found</h4>
                      <p>No visit assignments match your filters</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Sidebar from "./components/Sidebar.vue";
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },
  data() {
    return {
      filters: {
        month: "",
        status: "",
        company: "",
      },
      isMobile: false,
      isSidebarVisible: true,
      filtersVisible: false,
      amcVisits: [],
      services: [],
      currentUser: null,
    };
  },
  computed: {
    combinedVisits() {
      const amc = this.amcVisits.map(v => ({
        ...v,
        visitType: "AMC",
        type_of_service: "AMC"
      }));
      const service = this.services.map(s => ({
        ...s,
        visitType: "SERVICE"
      }));
      return [...amc, ...service].filter(record => {
        const matchesUser = record.assign_to == this.currentUser;
        const matchesStatus = !this.filters.status || record.status === this.filters.status;
        const matchesCompany = !this.filters.company || record.company_name?.toLowerCase().includes(this.filters.company.toLowerCase());
        const matchesMonth = !this.filters.month || record.visit_date?.startsWith(this.filters.month);
        return matchesUser && matchesStatus && matchesCompany && matchesMonth;
      });
    },
    pendingCount() {
      return this.combinedVisits.filter(v => v.status === 'Pending').length;
    },
    completedCount() {
      return this.combinedVisits.filter(v => v.status === 'Completed').length;
    },
    amcCount() {
      return this.combinedVisits.filter(v => v.visitType === 'AMC').length;
    },
    serviceCount() {
      return this.combinedVisits.filter(v => v.visitType === 'SERVICE').length;
    }
  },
  mounted() {
    this.filters.month = new Date().toISOString().slice(0, 7);
    this.fetchCurrentUser();
    this.checkIfMobile();
    window.addEventListener("resize", this.checkIfMobile);
    this.autoRefresh = setInterval(() => {
      this.fetchAmcVisits();
      this.fetchServices();
    }, 30000);
  },
  beforeUnmount() {
    clearInterval(this.autoRefresh);
    window.removeEventListener("resize", this.checkIfMobile);
  },
  methods: {
    toggleFilters() {
      this.filtersVisible = !this.filtersVisible;
    },
    filterByStatus(status) {
      this.filters.status = this.filters.status === status ? "" : status;
    },
    filterByType(type) {
      // This is a simple filter - you can implement as needed
      this.filters.company = type;
    },
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    resetFilters() {
      this.filters.month = "";
      this.filters.status = "";
      this.filters.company = "";
    },
    viewReport(filePath) {
      const baseUrl = "https://employees.archenterprises.co.in";
      window.open(`${baseUrl}${filePath}`, "_blank");
    },
    async deleteReport(item, reportPath, index) {
      if (!confirm("Delete this report permanently?")) return;
      try {
        await axios.post("/api/delete-report", {
          id: item.id,
          report_path: reportPath,
          type: item.visitType === "AMC" ? "amc" : "service"
        });
        item.report_paths.splice(index, 1);
        toastSuccess("Report deleted successfully");
      } catch (error) {
        console.error("Delete report failed", error);
        toastError("Failed to delete report");
      }
    },
    async onStatusChange(event, item) {
      const oldStatus = item.status;
      const newStatus = event.target.value;
      if (newStatus === "Completed" && (!item.report_paths || item.report_paths.length === 0)) {
        const ok = confirm("Complete service without uploading report?");
        if (!ok) {
          event.target.value = oldStatus;
          return;
        }
      }
      item.status = newStatus;
      try {
        if (item.visitType === "AMC") {
          await this.updateAmcStatus(item);
        } else {
          await this.updateServiceStatus(item);
        }
      } catch (e) {
        item.status = oldStatus;
        toastError("Failed to update status");
      }
    },
    handleReportUpload(event, record, type) {
      const files = Array.from(event.target.files);
      if (!files.length) return;
      record.reportFiles = files;
      record.reportNames = files.map(f => f.name);
      this.uploadReport(files, record, type);
    },
    async uploadReport(files, record, type) {
      const formData = new FormData();
      if (type === "service") {
        files.forEach(file => formData.append("report", file));
      } else {
        files.forEach(file => formData.append("reports[]", file));
      }
      formData.append("company_name", record.company_name);
      formData.append("po_number", record.po_number);
      if (record.id) formData.append("id", record.id);
      const endpoint = type === "service" ? "/api/upload-service-report" : "/api/upload-amc-report";
      try {
        const response = await axios.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        record.report_paths = response.data.report_paths || [];
        record.reportNames = response.data.report_names || [];
        toastSuccess("Reports uploaded successfully");
      } catch (error) {
        console.error("Error uploading reports", error);
        toastError("Failed to upload reports");
      }
    },
    async fetchCurrentUser() {
      try {
        const res = await axios.get("/api/current-user");
        this.currentUser = res.data.id;
        this.fetchAmcVisits();
        this.fetchServices();
      } catch (e) {
        console.error("Failed to fetch current user", e);
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    async fetchAmcVisits() {
      try {
        const response = await axios.get("/api/visit_assign");
        this.amcVisits = response.data.map(item => ({
          ...item,
          report_paths: item.report_path ? item.report_path.split(",") : []
        }));
      } catch (error) {
        console.error("Error fetching AMC visits:", error);
      }
    },
    async fetchServices() {
      try {
        const response = await axios.get("/api/service_assign");
        this.services = response.data.map(item => ({
          ...item,
          report_paths: item.report_path && item.report_path.trim() !== "" ? item.report_path.split(",") : []
        }));
      } catch (error) {
        console.error("Error fetching service visits:", error);
      }
    },
    async updateAmcStatus(visit) {
      try {
        await axios.put(`/api/visit_assign/${visit.id}`, { status: visit.status });
        await axios.post("/api/completed-order", {
          company_name: visit.company_name,
          po_number: visit.po_number,
          visit_date: visit.visit_date,
          assign_to: visit.assign_to || null,
          status: visit.status,
          service_type: "AMC",
        });
        toastSuccess("Status updated successfully");
      } catch (error) {
        console.error("Error updating AMC status:", error);
        throw error;
      }
    },
    async updateServiceStatus(service) {
      try {
        await axios.put(`/api/service_assign/${service.id}`, { status: service.status });
        await axios.post("/api/completed-order", {
          company_name: service.company_name,
          po_number: service.po_number,
          visit_date: service.visit_date,
          assign_to: service.assign_to || null,
          status: service.status,
          service_type: service.type_of_service || "Service",
        });
        toastSuccess("Status updated successfully");
      } catch (error) {
        console.error("Error updating service status:", error);
        throw error;
      }
    },
    async updateAmcVisitDate(visit) {
      try {
        await axios.put(`/api/visit_assign/${visit.id}`, { visit_date: visit.visit_date });
        toastSuccess("Visit date updated");
      } catch (error) {
        console.error("Error updating AMC visit date:", error);
        toastError("Failed to update visit date");
      }
    },
    async updateServiceVisitDate(service) {
      try {
        await axios.put(`/api/service_assign/${service.id}`, { visit_date: service.visit_date });
        toastSuccess("Visit date updated");
      } catch (error) {
        console.error("Error updating service visit date:", error);
        toastError("Failed to update visit date");
      }
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
  margin-top: 18px;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--dark);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark);
}

.mobile-title i {
  color: var(--primary-color);
}

.mobile-stats-badge {
  background: var(--primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

/* Content Header */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.subtitle-modern {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card.completed {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}
.stat-card.completed i { color: #065f46; }

.stat-card.amc {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}
.stat-card.amc i { color: #4338ca; }

.stat-card.service {
  background: linear-gradient(135deg, #fed7aa, #fdba74);
}
.stat-card.service i { color: #c2410c; }

.stat-card i {
  font-size: 28px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
  cursor: pointer;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

.filter-toggle {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.filter-toggle.rotated {
  transform: rotate(180deg);
}

/* Filter Section */
.filter-section-premium {
  margin-bottom: 24px;
}

.filter-grid-premium {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.filter-grid-premium.filters-hidden {
  max-height: 0;
  overflow: hidden;
  margin: 0;
}

.filter-group {
  position: relative;
  flex: 1;
  min-width: 160px;
}

.filter-group i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.filter-input-premium {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  background: white;
  transition: all 0.3s ease;
}

.filter-input-premium:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.reset-filter-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.reset-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
}

/* Table Card */
.table-card-premium {
  background: white;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.table-wrapper-premium {
  overflow-x: auto;
}

.visit-table-premium {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.visit-table-premium thead {
  background: #f8fafc;
}

.visit-table-premium th {
  text-align: left;
  padding: 14px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.visit-table-premium td {
  padding: 14px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  vertical-align: middle;
}

.visit-row {
  transition: all 0.3s ease;
}

.visit-row:hover {
  background: #fafbfc;
}

/* Company Cell */
.company-cell {
  min-width: 180px;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.company-avatar {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}

.po-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Date Input */
.date-input-premium {
  padding: 6px 10px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  background: white;
  transition: all 0.3s ease;
}

.date-input-premium:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Service Type Badge */
.service-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.service-type-badge.amc {
  background: #e0e7ff;
  color: #4338ca;
}

.service-type-badge.service {
  background: #fed7aa;
  color: #c2410c;
}

/* Upload Button */
.upload-btn-premium {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: 500;
}

.upload-btn-premium:hover {
  background: #e5e7eb;
}

.file-count {
  font-size: 11px;
  color: #9ca3af;
  margin-left: 6px;
}

/* Status Select */
.status-select {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.status-select.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-select.completed {
  background: #d1fae5;
  color: #065f46;
}

/* Report Buttons */
.report-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-report-btn {
  padding: 4px 10px;
  background: #e0e7ff;
  color: var(--primary-color);
  border: none;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.view-report-btn:hover {
  background: var(--primary-color);
  color: white;
}

.delete-report-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #fee2e2;
  color: #991b1b;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.delete-report-btn:hover {
  background: #991b1b;
  color: white;
}

.no-report {
  color: #9ca3af;
  font-size: 12px;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.visit-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.company-name {
  font-weight: 600;
  color: var(--dark);
  font-size: 14px;
}

.po-number {
  font-size: 12px;
  color: #6b7280;
}

.status-badge-mobile {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge-mobile.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-mobile.completed {
  background: #d1fae5;
  color: #065f46;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  min-width: 90px;
}

.date-input-mobile {
  padding: 6px 10px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  background: white;
  flex: 1;
}

.service-type-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.service-type-badge-mobile.amc {
  background: #e0e7ff;
  color: #4338ca;
}

.service-type-badge-mobile.service {
  background: #fed7aa;
  color: #c2410c;
}

.status-select-mobile {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.status-select-mobile.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-select-mobile.completed {
  background: #d1fae5;
  color: #065f46;
}

.upload-section-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
}

.upload-btn-mobile {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 11px;
  font-weight: 500;
}

.file-count-mobile {
  font-size: 10px;
  color: #9ca3af;
}

.report-buttons-mobile {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  justify-content: flex-end;
}

.report-item-mobile {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-report-btn-mobile {
  padding: 4px 8px;
  background: #e0e7ff;
  color: var(--primary-color);
  border: none;
  border-radius: 6px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.delete-report-btn-mobile {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #fee2e2;
  color: #991b1b;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.empty-state-mobile {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state-mobile i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-mobile h4 {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 6px;
}

.empty-state-mobile p {
  font-size: 13px;
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-state-premium p {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-grid-premium {
    flex-direction: column;
  }
  .filter-group {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
    margin-top: 0;
  }
  
  .content {
    padding: 16px;
    border-radius: 20px;
  }
  
  .mobile-header {
    display: flex;
  }
  
  .content-header-modern {
    display: none;
  }
  
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .stat-card {
    padding: 12px;
    gap: 10px;
  }
  
  .stat-card i {
    font-size: 22px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .stat-label {
    font-size: 10px;
  }
  
  .filter-grid-premium {
    flex-direction: column;
    gap: 8px;
    max-height: 500px;
    overflow: visible;
  }
  
  .filter-grid-premium.filters-hidden {
    max-height: 0;
    overflow: hidden;
    padding: 0;
    margin: 0;
  }
  
  .filter-group {
    min-width: auto;
    width: 100%;
  }
  
  .filter-input-premium {
    font-size: 14px;
    padding: 10px 12px 10px 36px;
  }
  
  .reset-filter-btn {
    width: 100%;
    justify-content: center;
  }
  
  .btn-text {
    display: inline;
  }
  
  .table-wrapper-premium {
    display: none;
  }
  
  .mobile-cards {
    display: flex;
  }
  
  .table-header-premium {
    padding: 12px 16px;
  }
  
  .table-header-premium .section-title-modern {
    font-size: 14px;
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .section-title-modern {
    font-size: 14px;
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
  
  .table-info {
    font-size: 11px;
  }
  
  .card-row {
    flex-wrap: wrap;
  }
  
  .card-label {
    min-width: 80px;
  }
  
  .upload-section-mobile {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .report-buttons-mobile {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }
  
  .content {
    padding: 12px;
    border-radius: 16px;
  }
  
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .stat-card {
    padding: 10px;
  }
  
  .stat-card i {
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .visit-card {
    padding: 12px;
  }
  
  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .card-label {
    min-width: auto;
  }
  
  .date-input-mobile {
    width: 100%;
  }
  
  .upload-section-mobile {
    width: 100%;
    justify-content: flex-start;
  }
  
  .report-buttons-mobile {
    width: 100%;
    justify-content: flex-start;
  }
  
  .mobile-title {
    font-size: 16px;
  }
  
  .company-name {
    font-size: 13px;
  }
}

/* Utility Classes */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
}
</style>