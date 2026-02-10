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

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="announcement-board" v-if="!isMobile || !isSidebarVisible">
        <h2> All Daily Small Improvement (DSI)</h2>

        <div class="dsi-table-wrapper">
          <table class="dsi-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Problem</th>
                <th>Solution</th>
                <th>Result</th>
                <th>Before</th>
                <th>After</th>
                <th>Date</th>
                <th>Actions</th> <!-- NEW -->
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, i) in dsiList" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ item.user }}</td>
                <td>{{ item.problem }}</td>
                <td>{{ item.solution }}</td>
                <td>{{ item.result }}</td>

                <td>
                  <img
                    v-if="item.beforeImage"
                    :src="item.beforeImage"
                    class="dsi-thumb"
                    @click="openImage(item.beforeImage)"
                  />
                </td>

                <td>
                  <img
                    v-if="item.afterImage"
                    :src="item.afterImage"
                    class="dsi-thumb"
                    @click="openImage(item.afterImage)"
                  />
                </td>

                <td>{{ item.date }}</td>

              <td class="dsi-actions">
  <button
    class="approve-btn"
    @click="updateStatus(item.id, 'Approved')"
    :disabled="item.status === 'approved' || item.status === 'rejected'"
  >
    Approved
  </button>

  <button
    class="reject-btn"
    @click="updateStatus(item.id, 'Rejected')"
    :disabled="item.status === 'rejected' || item.status === 'approved'"
  >
    Rejected
  </button>
</td>



              </tr>

              <tr v-if="!dsiList.length">
                <td colspan="9" class="no-data">No DSI Found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- IMAGE MODAL -->
        <div v-if="previewImage" class="image-backdrop" @click="previewImage = null">
          <div class="image-modal">
            <img :src="previewImage" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import Sidebar from '../components/Sidebar.vue'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";
export default {
  name: "ViewDsi",
  components: {
    Sidebar
  },
  data() {
    return {
      username: '',
      isMobile: false,
      isSidebarVisible: true,
      newDSI: {
        problem: "",
        solution: "",
        result: "",
        beforeImage: null,
        afterImage: null,
        beforeImageFile: null,
        afterImageFile: null,
      },
      dsiList: [],
      previewImage: null,
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchAllDSI();
  },
  methods: {
    async fetchAllDSI() {
      try {
        const res = await axios.get('/api/dsis/all');
        this.dsiList = res.data;
      } catch (e) {
        toastSuccess('Failed to load DSI');
      }
    },

    onImageChange(e, type) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'before') {
          this.newDSI.beforeImage = event.target.result;
          this.newDSI.beforeImageFile = file;
        } else {
          this.newDSI.afterImage = event.target.result;
          this.newDSI.afterImageFile = file;
        }
      };
      reader.readAsDataURL(file);
    },

    openImage(img) {
      this.previewImage = img;
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },

    // UPDATE STATUS METHOD
    async updateStatus(dsiId, status) {
      try {
        await axios.put(`/api/dsis/${dsiId}/status`, { status });
        // Update locally so table updates immediately
        const index = this.dsiList.findIndex(item => item.id === dsiId);
        if (index !== -1) this.dsiList[index].status = status;
      } catch (error) {
        toastSuccess('Failed to update status');
      }
    }
  }
}
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
.image-upload-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.image-upload-card {
  width: 131px;
    height: 47px;
  border: 2px dashed #9ca3af;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.image-upload-card:hover {
  border-color: var(--primary);
  background: #eef6f6;
  transform: translateY(-2px);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  color: #6b7280;
  gap: 4px;
}

.upload-placeholder span {
  font-size: 12px;
  font-weight: 600;
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.dsi-thumb {
  width: 45px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #ccc;
}

.image-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.image-modal img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
  background: #fff;
  padding: 10px;
}

.status-btn {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #facc15;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  cursor: not-allowed;
  white-space: nowrap;
}

.dsi-section {
  margin-top: 25px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.dsi-input {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.dsi-input input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.dsi-input button {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

.dsi-list {
  list-style: none;
  padding: 0;
}

.dsi-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
}

.dsi-list small {
  color: #6b7280;
  margin-left: 10px;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
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
.main-content {
  align-self: center;
  width: 100%;
        background-color: #f6f7fb;

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
}


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header h3 {
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

.card-header .date {
  font-size: 13px;
  color: #888;
}

.card-message {
  font-size: 15px;
  color: var(--text);
  margin-top: 5px;
  line-height: 1.5;
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
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: var(--primary); 
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15); */
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
  border: 2px solid #007bff;
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
  background-color: white;
  padding: 30px 40px;
  border-radius: 15px;
  box-shadow: 0 5px 30px rgba(0,0,0,0.08);
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: var(--text);
  font-weight: 700;
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
  text-transform: uppercase;
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

.dsi-input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.dsi-input-grid textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  resize: none;
}

.add-btn {
  background: var(--text);
  color: white;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.dsi-item p {
  margin: 4px 0;
}


.dsi-btn-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.status-btn {
  background: #e5e7eb;
  color: var(--text);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px dashed #9ca3af;
  cursor: not-allowed;
  font-weight: 500;
}



.add-btn:hover {
  background: #6b969a;
}
@media (max-width: 480px) {
  .dsi-btn-row {
    flex-direction: column;
    align-items: stretch;
  }
}
.dsi-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.dsi-textarea {
  flex: 1;
  min-width: 200px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  resize: none;
}

.dsi-btn-row {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.status-btn {
  background: #e5e7eb;
  color: var(--text);
  border: 1px dashed #9ca3af;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .dsi-row {
    flex-direction: column;
    align-items: stretch;
  }

  .dsi-btn-row {
    justify-content: flex-end;
  }
}


.dsi-table-wrapper {
  margin-top: 20px;
  overflow-x: auto;
}

.dsi-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.dsi-table th,
.dsi-table td {
  padding: 10px 12px;
  /* border-left: 1px ridge #6cc4c7; */
  /* border-bottom: 1px solid #6cc4c7; */
  text-align: left;
  vertical-align: top;
}

.dsi-table th {
  background: #f3f4f6;
  font-weight: 600;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 15px;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}
.dsi-table-wrapper {
  margin-top: 25px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  overflow-x: auto;
}

.dsi-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 900px;
}

/* Header */
.dsi-table thead th {
  background: linear-gradient(135deg, var(--primary), var(--primary));
  color: white;
  font-weight: 700;
  border-left: 1px ridge #6cc4c700;
  padding: 14px;
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 1;
}

/* Body rows */
.dsi-table tbody tr {
  transition: all 0.25s ease;
}

.dsi-table tbody tr:nth-child(even) {
  background: #f8fafc;
}

.dsi-table tbody tr:hover {
  background: #eef6f6;
  transform: scale(1.005);
}

/* Cells */
.dsi-table td {
  padding: 12px 14px;
  font-size: 14px;
  color: var(--text);
  /* border-bottom: 1px solid #e5e7eb; */
  vertical-align: middle;
}

/* Serial */
.sr {
  font-weight: 700;
  color: #2563eb;
}

/* Image cell */
.img-cell {
  text-align: center;
}

/* Thumbnail */
.dsi-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dsi-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 15px rgba(0,0,0,0.25);
}

/* Date */
.date-cell {
  white-space: nowrap;
  font-size: 13px;
  color: #6b7280;
}

/* Status pill */
.status-pill {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-pill.waiting {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

/* Delete */
.delete-btn {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.2);
}
@media (max-width: 768px) {
  .dsi-table {
    min-width: 1000px;
  }
}

.dsi-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.view-all-btn {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
  transition: all 0.35s ease;
}

.view-all-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 28px rgba(79, 70, 229, 0.55);
  background: linear-gradient(135deg, #4338ca, #4f46e5);
}

.view-all-btn:active {
  transform: scale(0.96);
}

.dsi-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dsi-popup {
  width: 95%;
  height: 90%;
  background: #fff;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.dsi-popup-header {
  padding: 16px 22px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 18px;
  padding: 6px 10px;
  border-radius: 50%;
  cursor: pointer;
}

.dsi-popup-body {
  padding: 16px;
  overflow-y: auto;
}
.dsi-actions {
  display: flex;
  align-items: center;

  gap: 8px;
}

.approve-btn,
.reject-btn {
  padding: 6px 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s all;
  color: #fff;
}

.approve-btn {
  background-color: #28a745; /* Green */
}

.approve-btn:hover:not(:disabled) {
  background-color: #218838;
}

.reject-btn {
  background-color: #dc3545; /* Red */
}

.reject-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.approve-btn:disabled,
.reject-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Status Text */
.status-text {
  font-weight: bold;
  text-transform: capitalize;
}

.status-text.approved {
  color: #28a745;
}

.status-text.rejected {
  color: #dc3545;
}

.status-text.waiting {
  color: #ffc107; /* yellow */
}

</style>
