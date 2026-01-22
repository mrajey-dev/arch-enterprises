<template>
  <div class="layout">
    <!-- Header -->
   <header class="header">
    <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;  border-radius: 9px;"
          alt="Logo"
        />
         </a>
         Arch 360
     
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Content -->
      <div class="content" v-show="!isMobile || !isSidebarVisible">
        <h2 class="page-title">Visit Schedule</h2>

    
<!-- 🔍 Filters -->
<div class="filter-bar">
  <input type="month" v-model="filters.month" class="filter-input" />

  <select v-model="filters.status" class="filter-input">
    <option value="">All Status</option>
    <option value="Pending">Pending</option>
    <option value="Completed">Completed</option>
  </select>

  <input
    type="text"
    v-model="filters.company"
    placeholder="Search Company"
    class="filter-input"
  />

  <!-- ✅ RESET -->
  <button class="btn-reset" @click="resetFilters">
    View All
  </button>
</div>


     <div class="table-container">
  <table class="modern-table">
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
      <tr v-for="(item, index) in combinedVisits" :key="index">
        <td  data-label="Company Name: ">{{ item.company_name }}</td>
        <td  data-label="PO Nymber: ">{{ item.po_number }}</td>

        <!-- Visit Date -->
        <td  data-label="Visit Date: ">
          <input
            type="date"
            v-model="item.visit_date"
            class="editable-date"
            @change="
              item.visitType === 'AMC'
                ? updateAmcVisitDate(item)
                : updateServiceVisitDate(item)
            "
          />
        </td>

        <!-- Type -->
        <td data-label="Service Type: ">
          {{ item.visitType === 'AMC' ? 'AMC' : item.type_of_service }}
        </td>

        <!-- Upload -->
        <td data-label="Upload Report: ">
          <label class="upload-btn">
            <i class="fas fa-upload"></i> Upload
            <input
  type="file"
  multiple
  @change="
    handleReportUpload(
      $event,
      item,
      item.visitType === 'AMC' ? 'amc' : 'service'
    )
  "
/>

          </label>
          <span v-if="item.reportName">{{ item.reportName }}</span>
        </td>

        <!-- Status -->
        <td  data-label="Status: ">
         <select :value="item.status" @change="onStatusChange($event, item)">
  <option value="Pending">Pending</option>
  <option value="Completed">Completed</option>
</select>

        </td>

        <!-- View -->
        <td data-label="View Report: ">
  <div v-if="item.report_paths && item.report_paths.length">
    <button
      v-for="(path, rIndex) in item.report_paths"
      :key="rIndex"
      class="view-report-btn"
      @click="viewReport(path)"
    >
      Report {{ rIndex + 1 }}
    </button>
  </div>
  <span v-else>No Report</span>
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
import axios from "axios";
import Sidebar from "./components/Sidebar.vue";

export default {
  components: { Sidebar },
  data() {
    return {
      filters: {
      month: "",
      status: "",
      company: "",
    },
      filteredAmcVisits: [],
      isMobile: false,
      isSidebarVisible: true,
      // activeTable: "amc",
      amcVisits: [],
      services: [],
      currentUser: null,
    };
  },
  beforeUnmount() {
  clearInterval(this.autoRefresh);
},
  mounted() {
     this.filters.month = new Date().toISOString().slice(0, 7);
    this.setCurrentMonth(); 
    this.fetchCompletedAmc();
    this.checkIfMobile();
    window.addEventListener("resize", this.checkIfMobile);
    this.currentUser = localStorage.getItem("name");
    this.fetchAmcVisits();
    this.fetchServices();
    this.fetchCurrentUser();
    this.autoRefresh = setInterval(() => {
    this.fetchAmcVisits();
    this.fetchServices();
  }, 30000); // every 30 sec
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
      const matchesUser = record.assign_to === this.currentUser;

      const matchesStatus =
        !this.filters.status || record.status === this.filters.status;

      const matchesCompany =
        !this.filters.company ||
        record.company_name
          ?.toLowerCase()
          .includes(this.filters.company.toLowerCase());

      const matchesMonth =
        !this.filters.month ||
        record.visit_date?.startsWith(this.filters.month);

      return matchesUser && matchesStatus && matchesCompany && matchesMonth;
    });
  },
    filteredAmcVisits() {
    return this.amcVisits.filter((visit) => {
      const matchesUser = visit.assign_to === this.currentUser;

      const matchesStatus =
        !this.filters.status || visit.status === this.filters.status;

      const matchesCompany =
        !this.filters.company ||
        visit.company_name
          .toLowerCase()
          .includes(this.filters.company.toLowerCase());

      const matchesMonth =
        !this.filters.month ||
        visit.visit_date?.startsWith(this.filters.month);

      return (
        matchesUser &&
        matchesStatus &&
        matchesCompany &&
        matchesMonth
      );
    });
  },
      filteredServices() {
    return this.services.filter((service) => {
      const matchesUser = service.assign_to === this.currentUser;

      const matchesStatus =
        !this.filters.status || service.status === this.filters.status;

      const matchesCompany =
        !this.filters.company ||
        service.company_name
          .toLowerCase()
          .includes(this.filters.company.toLowerCase());

      const matchesMonth =
        !this.filters.month ||
        service.visit_date?.startsWith(this.filters.month);

      return (
        matchesUser &&
        matchesStatus &&
        matchesCompany &&
        matchesMonth
      );
    });
  },
  },
  methods: {
async onStatusChange(event, item) {
  const oldStatus = item.status;
  const newStatus = event.target.value;

  if (
    newStatus === "Completed" &&
    (!item.report_paths || item.report_paths.length === 0)
  ) {
    const ok = window.confirm(
      "You want to complete service without uploading report?"
    );
    if (!ok) {
      event.target.value = oldStatus;
      return;
    }
  }

  // 🔥 Update UI immediately
  item.status = newStatus;

  try {
    if (item.visitType === "AMC") {
      await this.updateAmcStatus(item);
    } else {
      await this.updateServiceStatus(item);
    }
  } catch (e) {
    // rollback if API fails
    item.status = oldStatus;
  }
},


    resetFilters() {
  this.filters.month = "";
  this.filters.status = "";
  this.filters.company = "";
},

    setCurrentMonth() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  // Format: YYYY-MM (required by <input type="month">)
  this.filters.month = `${year}-${month}`;
},
    viewReport(filePath) {
    const baseUrl = "https://employees.archenterprises.co.in"; // your base URL
    window.open(`${baseUrl}${filePath}`, "_blank");
  },
    fetchCompletedAmc() {
    axios
      .get("https://employees.archenterprises.co.in/api/api/completed-amc")
      .then((res) => {
        this.filteredAmcVisits = res.data;
      })
      .catch((err) => {
        console.error(err);
      });
  },
    // ✅ File Upload
// ✅ File Upload Handler
handleReportUpload(event, record, type = "amc") {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  record.reportFiles = files;
  record.reportNames = files.map(f => f.name);

  this.uploadReport(files, record, type);
},

// ✅ Upload Reports to API
async uploadReport(files, record, type) {
  const formData = new FormData();

  if (type === "service") {
    // Send each file with repeated 'report' key (Option 1)
    files.forEach(file => formData.append("report", file));
  } else {
    // AMC API expects 'reports[]'
    files.forEach(file => formData.append("reports[]", file));
  }

  formData.append("company_name", record.company_name);
  formData.append("po_number", record.po_number);
  if (record.id) formData.append("id", record.id);

  const endpoint =
    type === "service"
      ? "/api/upload-service-report"
      : "/api/upload-amc-report";

  try {
    const response = await axios.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Update record with paths and names returned from backend
    record.report_paths = response.data.report_paths || [];
    record.reportNames = response.data.report_names || [];

    console.log("✅ Reports uploaded:", record.report_paths);
  } catch (error) {
    console.error("❌ Error uploading reports", error.response?.data || error);
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

    // ✅ Fetch AMC Visits
  async fetchAmcVisits() {
  try {
    const response = await axios.get("/api/visit_assign");

    this.amcVisits = response.data.map(item => {
      return {
        ...item,
        // ✅ convert JSON string → array
       report_paths: item.report_path
  ? item.report_path.split(",")
  : []

      };
    });

  } catch (error) {
    console.error("Error fetching AMC visits:", error);
  }
},


    // ✅ Fetch Service Visits
async fetchServices() {
  try {
    const response = await axios.get("/api/service_assign");

    this.services = response.data.map(item => ({
      ...item,
      report_paths:
        item.report_path && item.report_path.trim() !== ""
          ? item.report_path.split(",")
          : []
    }));

  } catch (error) {
    console.error("Error fetching service visits:", error);
  }
}
,




// ✅ Update AMC Status with confirmation
async updateAmcStatus(visit) {
  try {

    await axios.put(`/api/visit_assign/${visit.id}`, {
      status: visit.status,
    });

    // const poStatus = visit.status === "Completed" ? "Closed" : null;
    // await axios.put(`/api/add-po-status/${visit.po_number}`, {
    //   status: poStatus,
    // });

    await axios.post("/api/completed-order", {
      company_name: visit.company_name,
      po_number: visit.po_number,
      visit_date: visit.visit_date,
      assign_to: visit.assign_to || null,
      status: visit.status,
      service_type: "AMC",
    });

  } catch (error) {
    console.error("Error updating AMC status:", error);
  }
},

// ✅ Update Service Status with confirmation
async updateServiceStatus(service) {
  try {
    await axios.put(`/api/service_assign/${service.id}`, {
      status: service.status,
    });

    const poStatus = service.status === "Completed" ? "Closed" : null;
    await axios.put(`/api/add-po-status/${service.po_number}`, {
      status: poStatus,
    });

    await axios.post("/api/completed-order", {
      company_name: service.company_name,
      po_number: service.po_number,
      visit_date: service.visit_date,
      assign_to: service.assign_to || null,
      status: service.status,
      service_type: service.type_of_service || "Service",
    });
  } catch (error) {
    console.error("Error updating service status:", error);
  }
},



    // ✅ New: Update AMC Visit Date
    async updateAmcVisitDate(visit) {
      try {
        await axios.put(`/api/visit_assign/${visit.id}`, {
          visit_date: visit.visit_date,
        });
        console.log(`AMC visit date updated for ${visit.company_name}`);
      } catch (error) {
        console.error("Error updating AMC visit date:", error);
      }
    },

    // ✅ New: Update Service Visit Date
    // ✅ New: Update Service Visit Date
async updateServiceVisitDate(service) {
  try {
    console.log("Updating service visit date for:", service);

    const payload = { visit_date: service.visit_date };

    const response = await axios.put(`/api/service_assign/${service.id}`, payload);

    console.log("✅ Service visit date updated:", response.data);

    // Optional feedback
    this.$nextTick(() => {
      alert(`Visit date updated for ${service.company_name}`);
    });
  } catch (error) {
    console.error("❌ Error updating service visit date:", error.response?.data || error);
    alert("Failed to update service visit date. Check API endpoint or field name.");
  }
}

  },
};
</script>





<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.head-title{
      color: white;
    display: flex;
    gap: 7px;
    text-decoration: none;
font-family: cursive;
    align-items: center; width: 100%;
}
@media (max-width: 768px) {
.head-title{
      color: white;
    display: flex;
    gap: 7px;
    display: none;
    text-decoration: none;
    align-items: center; width: 100%;
}
}
.btn-reset {
  padding: 9px 18px;
  background: linear-gradient(135deg, var(--text), var(--text));
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.btn-reset:hover {
  background: linear-gradient(135deg, var(--text), #343a40);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.btn-reset:active {
  transform: translateY(0);
  box-shadow: none;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.filter-input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  min-width: 180px;
}

.view-report-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.view-report-btn:hover {
  background-color: var(--text);
}

.editable-date {
  border: 1px solid #ccc;
  padding: 4px;
  border-radius: 6px;
  font-size: 14px;
}
/* General Layout */
.layout {
  background: linear-gradient(to bottom right, #f3f6ff, #e9f0fa);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Title */
.page-title {
  font-size: 23px;
    color: var(--text);
    text-transform: uppercase;
    font-weight: 800;
  font-weight: 800;
  margin-bottom: 25px;
  padding-left: 12px;
}

/* Button Switch */
.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.btn-switch {
  padding: 10px 18px;
  font-weight: 600;
  background: white;
  color: var(--primary);
  border: 2px solid var(--primary);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.btn-switch.active {
  background-color: var(--primary);
  color: white;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}
.btn-switch:hover {
  transform: translateY(-2px);
}

/* Table Container */
.table-container {
  background: white;
  padding: 6px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

/* Modern Table */
.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  border-radius: 12px;
  overflow: hidden;
}
.modern-table thead tr {
  background-color: var(--primary);
  color: white;
  text-align: left;
}
.modern-table th,
.modern-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #e0e0e0;
}
.modern-table tbody tr {
  transition: all 0.3s ease;
}
.modern-table tbody tr:hover {
  background-color: #f2f8ff;
  box-shadow: 0 3px 8px rgba(0, 123, 255, 0.2);
  transform: scale(1.01);
}

/* Upload Button */
.upload-btn {
  position: relative;
  overflow: hidden;
  width: 64px;
  background-color: var(--text);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  gap: 6px;
}
.upload-btn input[type="file"] {
  /* position: absolute; */
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.file-name {
  display: block;
  margin-top: 6px;
  color: var(--text);
  font-size: 13px;
}

/* Status Badges */
.status-badge {
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-right: 10px;
  text-transform: capitalize;
}
.status-pending {
  background: #fff4e6;
  color: #ff7b00;
}
.status-completed {
  background: #e6ffed;
  color: #1aa34a;
}

/* Dropdown */
.modern-table select {
  border: 1.5px solid #ccc;
  border-radius: 8px;
  padding: 5px 8px;
  font-weight: 500;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
}
.modern-table select:hover {
  border-color: var(--primary);
}

/* Mobile view */
/* 📱 Improved Mobile View: Field Left, Value Right */
@media (max-width: 768px) {
  .modern-table thead {
    display: none; /* hide table headers */
  }

  .modern-table,
  .modern-table tbody,
  .modern-table tr,
  .modern-table td {
    display: block;
    width: 100%;
  }

  .modern-table tr {
 margin-bottom: 16px;
        background: #fff;
        border-radius: 0px;
        box-shadow: inset -15px -5px 0px 0px var(--primary);
        padding: 10px 14px;
  }

  .modern-table td {
   align-items: center;
        display: flex;
        padding: 10px 0;
        border: none;
        border-bottom: 1px solid #eee;
        font-size: 14px;
        flex-direction: row;
  }

  .modern-table td:last-child {
    border-bottom: none;
  }

  /* Show field name on left side */
  .modern-table td::before {
    content: attr(data-label);
    flex-basis: 45%;
    text-align: left;
    font-weight: 600;
    color: var(--primary);
  }

  /* Value styling (right side) */
  .modern-table td span,
  .modern-table td select,
  .modern-table td input,
  .modern-table td label {
    flex-basis: 32%;
    /* text-align: right; */
/* color: var(--text); */
    font-weight: 500;
  }

  .modern-table td label.upload-btn {
    justify-content: flex-end;
  }

  .file-name {
    text-align: right;
    font-size: 12px;
  }
}



/* 📱 Mobile-friendly vertical table */
@media (max-width: 768px) {
  .user-table th, .user-table td{
    text-align: right!important;
    color: #00145b!important;
    font-size: 11px!important;
    
  }
  .user-table thead {
    display: none; /* hide header */
  }
  .user-table td{
    padding: 14px 0px!important;
  }
.user-table tbody tr{
    background-color: #1081771f!important;
    justify-self: center!important;
}
  .user-table, 
  .user-table tbody, 
  .user-table tr, 
  .user-table td {
    display: block;
    width: 100%;
  }

  .user-table tr {
    margin-bottom: 18px;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
    padding: 12px;
  }

  .user-table td {
    text-align: left;
    padding: 10px 14px;
    border: none !important;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e5e5e5;
  }

  .user-table td:last-child {
    border-bottom: none;
  }

  /* Show label using data-label attr */
  .user-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #042140!important ;
    flex-basis: 50%;
    text-align: left;
  }
}


/* Table Base */
.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Table Header */
.user-table th {
  background-color: var(--primary);
  color: white;
  font-weight: 700;
  padding: 14px 20px;
  text-align: left;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  font-size: 16px;
}

/* Table Rows */
.user-table tbody tr {
  background-color: #fefefe;
  box-shadow: 0 3px 8px rgba(0,0,0,0.08);
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-table tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  background-color: #e9f5ff;
}

/* Table Cells */
.user-table td {
  padding: 14px 20px;
  vertical-align: middle;
  border: none;
  font-size: 15px;
  color: var(--text);
}

/* Dropdown Styling */
.user-table select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1.5px solid #ced4da;
  font-size: 14px;
  font-weight: 500;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-table select:hover {
  border-color: var(--primary);
  box-shadow: 0 0 8px rgba(0,123,255,0.3);
}

.user-table select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 10px rgba(0,123,255,0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .user-table th, .user-table td {
    padding: 12px 10px;
    font-size: 14px;
  }
}

.attractive-btn.active {
  background-color: var(--text);
  color: white;
}
.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .sidebar {
    position: absolute;
    z-index: 1000;
    width: 240px;
    height: 100vh;
    background-color: var(--text);
  }

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
  .main-content{
  padding: 1px!important;
}
.content{
  padding: 23px 8px!important;
}
}

.password-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-wrapper input {
  flex: 1;
}

.toggle-btn,
.generate-btn {
  padding: 6px 10px;
  background-color: var(--primary);
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.toggle-btn i {
  pointer-events: none;
}

.toggle-btn:hover,
.generate-btn:hover {
  background-color: var(--text);
}

.user-table td .btn-group {
  display: flex;
  gap: 0.5rem;
}
/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

/* Header */
.header {
  font-size: 17px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: var(--primary); 
  color: white;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
}

.menu-btn, .logout-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-btn {
  background-color: #28a745;
  color: white;
  margin-right: 15px;
}

.menu-btn:hover {
  background-color: #218838;
}

.logout-btn {
  background-color: white;
  color: #003977;
  border: 2px solid var(--primary);
}

.logout-btn:hover {
  background-color: #e7f1ff;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  background-color: #ffffff;
  width: 220px;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  font-weight: 600;
  color: var(--text);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 14px 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar li:hover {
  background-color: var(--primary);
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
  background-color: var(--sidebar);
  padding: 30px 40px;
  border-radius: 15px;
  /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: var(--text);
  font-weight: 700;
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}

/* User Table */
.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
}

.user-table th,
.user-table td {
  padding: 14px 20px;
  text-align: left;
  font-size: 16px;
  color: var(--text);
}

.user-table th {
  background-color: #d1d8df;
  border: 1px solid #3b3737;
  font-weight: 700;
  /* border-bottom: none; */
 border-radius: 0px 0px 0 0;
}

.user-table tbody tr {
  background-color: #fefefe;
  box-shadow: 0 1px 5px rgba(0,0,0,0.07);
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.user-table tbody tr:hover {
  background-color: #e9f5ff;
  transform: translateX(5px);
}

.user-table tbody td {
    border: 1px solid #a09e9e;
  /* border: none; */
  vertical-align: middle;
}

/* Footer */
.footer {
  background-color: #343a40;
  color: white;
  text-align: center;
  padding: 15px 0;
  font-size: 14px;
  font-weight: 500;
  margin-top: auto;
  letter-spacing: 0.6px;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 97vw;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 15px;
}

/* Modal Card */
.modal-card {
  background-color: white;
  width: 100%;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  max-height: 86vh;
  overflow-y: auto;
  animation: slideDown 0.4s ease forwards;
  position: relative;

  /* Hide scrollbar but allow scroll */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.modal-card::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}


@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Title */
.modal-title {
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 35px;
  color: var(--text);
  letter-spacing: 1.3px;
}

/* Form Layout */
.attractive-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Form Rows */
.form-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.form-row .input-group {
  flex: 1 1 48%;
  display: flex;
  flex-direction: column;
}

/* Full width input group */
.input-group.full-width {
  flex: 1 1 100%;
}

/* Input Group */
.input-group label {
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 14px 18px;
  border: 2px solid #ced4da;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  background-color: #f9fbff;
}

/* Textarea resize */
.input-group textarea {
  resize: vertical;
  min-height: 56px;
  font-family: inherit;
}

/* Modal Buttons */
.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.btn {
  flex: 1;
  padding: 14px 0;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.btn-primary:hover {
  background-color: var(--text);
  box-shadow: 0 8px 18px rgba(0, 86, 179, 0.6);
}

.btn-secondary {
  background-color: var(--text);
  color: white;
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover {
  background-color: var(--primary);
  box-shadow: 0 8px 18px rgba(90, 98, 104, 0.6);
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .form-row .input-group {
    flex: 1 1 100%;
  }

  .modal-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: row;
    gap: 10px;
    font-size: 17px;
  }
  .menu-btn, .logout-btn {
    width: 100%;
  }
}
.attractive-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.btn-primary.attractive-btn {
  background-color: var(--primary);
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: var(--text);
  box-shadow: 0 4px 12px rgba(13,110,253,0.6);
}

.btn-danger.attractive-btn {
  background-color: #dc3545;
  border: none;
  color: white;
}

.btn-danger.attractive-btn:hover {
  background-color: #bb2d3b;
  box-shadow: 0 4px 12px rgba(220,53,69,0.6);
}

.attractive-btn i {
  font-size: 14px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 35px;
}
@media (max-width: 768px) {
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 35px;
  margin-bottom: 6px;
      height: 52px;
}
}

.logo-img {
  height: 45px;
}

.header-title {
  flex: 1;
  text-align: center;
  color: white;
  margin: 0;
  font-size: 1.3rem;
}

.mobile-menu-icon {
  font-size: 22px;
  color: white;
  cursor: pointer;
}

</style>
