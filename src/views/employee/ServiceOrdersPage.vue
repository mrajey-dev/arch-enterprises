<template>
  <div>
    <!-- SERVICE ORDERS POPUP -->
    <div v-if="!showAssignedServicePopup" class="modal-backdrop">
      <div class="modal-card large">
        <!-- MODAL HEADER -->
        <div class="modal-header-custom">
          <button class="btn-back" @click="$emit('close')">
            ⬅ Back
          </button>
          <div class="modal-title-wrapper">
            <div class="modal-icon-badge" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">
              <i class="fas fa-tools"></i>
            </div>
            <h2 class="modal-title">Pending & Assign Service Orders</h2>
            <p class="modal-subtitle">Manage upcoming and ongoing service visits</p>
          </div>
          <button class="service-ord" @click="showAssignedServicePopup = true">
            <i class="fa fa-check-square-o"></i> Completed Services
          </button>
        </div>

        <!-- FILTER BAR -->
        <div class="filter-bar">
          <input
            type="text"
            v-model="serviceFilters.search"
            placeholder="Search Company / PO Number"
            class="filter-input"
          />
          <select v-model="serviceFilters.month" class="filter-select">
            <option value="">All Months</option>
            <option v-for="(m, index) in months" :key="index" :value="index + 1">{{ m }}</option>
          </select>
        </div>

        <div class="table-scroll-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>PO Number</th>
                <th>Visit Date</th>
                <th>Type</th>
                <th>Assign To</th>
              </tr>
            </thead>
            <tbody v-if="filteredServicePoList.length">
              <tr v-for="order in filteredServicePoList" :key="order.id">
                <td>{{ order.company_name }}</td>
                <td>{{ order.po_number }}</td>
                <td>
                  <input
                    type="date"
                    class="date-input"
                    v-model="order.service_date"
                    @change="updateServiceDate(order)"
                  />
                </td>
                <td>{{ order.type_of_service }}</td>
                <td>
                  <select v-model="order.assign_to" @change="onAssignChange(order)">
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
                <td colspan="8" class="no-data">No service PO records found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ASSIGNED SERVICES POPUP -->
    <div v-if="showAssignedServicePopup" class="modal-backdrop">
      <div class="modal-card large">
        <!-- MODAL HEADER -->
        <div class="modal-header-custom">
          <button class="btn-back" @click="showAssignedServicePopup = false">
            ⬅ Back
          </button>
          <div class="modal-title-wrapper">
            <div class="modal-icon-badge" style="background: linear-gradient(135deg, #06b6d4, #0891b2);">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <h2 class="modal-title">Completed Service Orders</h2>
            <p class="modal-subtitle">Review all finished service assignments</p>
          </div>
          <div style="width: 80px;"></div>
        </div>

        <!-- FILTER BAR -->
        <div class="filter-bar">
          <input
            type="text"
            v-model="assignedServiceFilters.search"
            placeholder="Search Company / PO Number"
            class="filter-input"
          />
          <select v-model="assignedServiceFilters.month" class="filter-select">
            <option value="">All Months</option>
            <option v-for="(m, index) in months" :key="index" :value="index + 1">{{ m }}</option>
          </select>
        </div>

        <div class="table-scroll-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>PO Number</th>
                <th>Visit Date</th>
                <th>Type</th>
                <th>Assigned To</th>
                <th>View Report</th>
              </tr>
            </thead>
            <tbody v-if="filteredAssignedServiceList.length">
              <tr v-for="item in filteredAssignedServiceList" :key="item.id">
                <td>{{ item.company_name }}</td>
                <td>{{ item.po_number }}</td>
                <td>{{ item.visit_date }}</td>
                <td>{{ item.type_of_service }}</td>
                <td>{{ getUserName(item.assign_to) }}</td>
                <td>
                  <div v-if="item.report_path && item.report_path.trim() !== ''">
                    <button
                      v-for="(path, idx) in item.report_path.split(',')"
                      :key="idx"
                      class="view-report-btn"
                      @click="viewReport(path)"
                      style="margin-right:5px;"
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
                <td colspan="9" class="no-data">No assigned service records found</td>
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
  name: "ServiceOrdersModal",
  data() {
    return {
      showAssignedServicePopup: false,
      servicePoList: [],
      service_assign: [], // completed services
      employees: [],
      users: [],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      serviceFilters: { search: "", month: "" },
      assignedServiceFilters: { search: "", month: "" }
    };
  },
  computed: {
    filteredServicePoList() {
      return this.servicePoList.filter(item => {
        let matchSearch = true;
        let matchMonth = true;
        if (this.serviceFilters.search) {
          const s = this.serviceFilters.search.toLowerCase();
          matchSearch = (item.company_name && item.company_name.toLowerCase().includes(s)) ||
                        (item.po_number && item.po_number.toLowerCase().includes(s));
        }
        if (this.serviceFilters.month) {
          if (!item.service_date) {
            matchMonth = false;
          } else {
            const m = new Date(item.service_date).getMonth() + 1;
            matchMonth = m === parseInt(this.serviceFilters.month);
          }
        }
        return matchSearch && matchMonth;
      });
    },
    filteredAssignedServiceList() {
      return this.service_assign.filter(item => {
        let matchSearch = true;
        let matchMonth = true;
        if (this.assignedServiceFilters.search) {
          const s = this.assignedServiceFilters.search.toLowerCase();
          matchSearch = (item.company_name && item.company_name.toLowerCase().includes(s)) ||
                        (item.po_number && item.po_number.toLowerCase().includes(s));
        }
        if (this.assignedServiceFilters.month) {
          if (!item.visit_date) {
            matchMonth = false;
          } else {
            const m = new Date(item.visit_date).getMonth() + 1;
            matchMonth = m === parseInt(this.assignedServiceFilters.month);
          }
        }
        return matchSearch && matchMonth;
      });
    }
  },
  mounted() {
    this.fetchServicePoList();
    this.fetchCompletedServices();
    this.fetchUsers();
  },
  methods: {
    async fetchServicePoList() {
      try {
        const res = await axios.get('/api/service-po-list');
        this.servicePoList = res.data;
        const empRes = await axios.get('/api/employees');
        this.employees = empRes.data;
      } catch (error) {
        console.error("Error fetching service POs", error);
      }
    },
    async fetchCompletedServices() {
      try {
        const response = await axios.get('/api/completed-services');
        this.service_assign = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async fetchUsers() {
      try {
        const response = await axios.get('/api/employees');
        this.users = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    getUserName(userId) {
      const user = this.users.find(u => u.id == userId);
      return user ? user.name : userId;
    },
    onAssignChange(order) {
      if (!order.assign_to) return;
      this.assignServiceEmployee(order);
    },
    async assignServiceEmployee(order) {
      try {
        await axios.post(`/api/assign-service-employee/${order.id}`, {
          assign_to: order.assign_to,
          date: order.service_date
        });
        toastSuccess("Service assigned successfully!");
        this.fetchServicePoList();
      } catch (error) {
        toastError("Error assigning service");
      }
    },
    updateServiceDate(po) {
      axios.put(`/api/update-service-date/${po.id}`, {
        service_date: po.service_date
      })
      .then(() => toastSuccess("Service Date Updated Successfully!"))
      .catch(error => console.error("Error updating service date:", error));
    },
    viewReport(path) {
      const baseUrl = "https://employees.archenterprises.co.in";
      window.open(`${baseUrl}${path.trim()}`, "_blank");
    }
  }
};
</script>

<style scoped>
/* Common Modal Styles */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px); display: flex; align-items: center;
  justify-content: center; z-index: 9999;
}
.modal-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  position: relative; width: 90%; max-width: 1000px;
  padding: 30px; max-height: 90vh; overflow-y: auto;
}
.modal-header-custom {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; margin-bottom: 20px;
}
.modal-title-wrapper {
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.modal-icon-badge {
  width: 48px; height: 48px; border-radius: 12px; display: flex;
  align-items: center; justify-content: center; color: white;
  font-size: 20px; margin-bottom: 10px;
}
.modal-title { margin: 0; font-size: 20px; font-weight: 700; color: #1e293b; }
.modal-subtitle { margin: 4px 0 0; font-size: 13px; color: #64748b; }
.btn-back {
  background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 8px;
  font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: #e2e8f0; }
.service-ord {
  background-color: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;
  padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px; font-size: 13px; transition: all 0.2s ease;
}
.service-ord:hover {
  background-color: #dbeafe; transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}
.filter-bar {
  display: flex; gap: 12px; margin-bottom: 20px; background: linear-gradient(to right, #f8fafc, #eff6ff);
  padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; flex-wrap: wrap;
}
.filter-input, .filter-select {
  padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; min-width: 220px; flex: 1;
}
.table-scroll-container {
  max-height: 50vh; overflow-y: auto; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.styled-table {
  width: 100%; border-collapse: collapse; font-size: 13px; min-width: 500px; background: #ffffff;
}
.styled-table th {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; font-weight: 600;
  padding: 12px; text-transform: uppercase; font-size: 12px; position: sticky; top: 0; z-index: 10;
}
.styled-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
.date-input { padding: 6px; border-radius: 4px; border: 1px solid #ccc; }
.view-report-btn { background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
.view-report-btn:hover {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}
</style>
