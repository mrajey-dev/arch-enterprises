<template>
  <div>
    <!-- MATERIAL SUPPLY POPUP -->
    <div v-if="!showDeliveredDatePopup && !showStatusPopup" class="modal-backdrop">
      <div class="modal-card large">
        <!-- MODAL HEADER -->
        <div class="modal-header-custom">
          <button class="btn-back" @click="$emit('close')">
            ⬅ Back
          </button>
          <div class="modal-title-wrapper">
            <div class="modal-icon-badge" style="background: linear-gradient(135deg, #a855f7, #7e22ce);">
              <i class="fas fa-box-open"></i>
            </div>
            <h2 class="modal-title">Material Supply</h2>
            <p class="modal-subtitle">Track dispatches and deliveries</p>
          </div>
          <button class="material-del" @click="showDeliveredDatePopup = true">
            <i class="fa fa-check-square-o"></i> Material Delivered
          </button>
        </div>

        <!-- FILTER BAR -->
        <div class="filter-bar">
          <input
            type="text"
            v-model="supplyFilters.search"
            placeholder="Search Company / PO Number"
            class="filter-input"
          />
          <select v-model="supplyFilters.month" class="filter-select">
            <option value="">All Months</option>
            <option v-for="(m, index) in months" :key="index" :value="index + 1">{{ m }}</option>
          </select>
          <select v-model="supplyFilters.status" class="filter-select">
            <option value="">All Status</option>
            <option value="Awaiting Dispatch">Awaiting Dispatch</option>
            <option value="Dispatched">Dispatched</option>
          </select>
        </div>

        <div class="table-scroll-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>PO Number</th>
                <th>Quotation No.</th>
                <th>Payment Terms</th>
                <th>Delivery Terms</th>
                <th>Delivery Due Date</th>
                <th>Dispatched Date</th>
                <th>Tracking ID</th>
                <th>Courier Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody v-if="filteredSupplies.length">
              <tr v-for="supply in filteredSupplies" :key="supply.id">
                <td>{{ supply.company_name }}</td>
                <td>{{ supply.po_number }}</td>
                <td>{{ supply.quotation_against_po || '-' }}</td>
                <td>{{ supply.payment_terms || '-' }}</td>
                <td>{{ supply.delivery_terms || '-' }}</td>
                <td>
                  <input
                    type="date"
                    v-model="supply.delivery_due_date"
                    @change="updateDeliveryDate(supply)"
                    class="date-input"
                  />
                </td>
                <td>{{ supply.closed_date ? supply.closed_date : '-' }}</td>
                <td>{{ supply.tracking_id ? supply.tracking_id : '-' }}</td>
                <td>{{ supply.courier_name ? supply.courier_name : '-' }}</td>
                <td>
                  <select
                    :value="supply.material_status || 'Awaiting Dispatch'"
                    @change="handleStatusChange(supply, $event.target.value)"
                  >
                    <option value="Awaiting Dispatch" disabled>Awaiting Dispatch</option>
                    <option value="Dispatched">Dispatched</option>
                    <option v-if="supply.material_status === 'Dispatched'" value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="10" class="no-data">No supply orders found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- DELIVERED DATE POPUP -->
    <div v-if="showDeliveredDatePopup" class="modal-backdrop">
      <div class="modal-card small">
        <h3>Material Delivered</h3>
        <div class="form-group" style="margin-top: 20px;">
          <label>Select material delivered date <span style="color:red">*</span></label>
          <input type="date" v-model="deliveredDate" required class="filter-input" style="width: 100%; margin-top: 10px;" />
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px">
          <button class="btn btn-secondary" @click="confirmDelivered">
            <i class="fa fa-save" style="font-size:13px"></i> Save
          </button>
          <button class="btn btn-back" @click="showDeliveredDatePopup = false">
            <i class="fa fa-close" style="font-size:13px"></i> Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- STATUS UPDATE POPUP (Dispatched) -->
    <div v-if="showStatusPopup" class="modal-backdrop">
      <div class="modal-card small">
        <div class="modal-header-custom" style="padding-bottom: 10px;">
          <h3 class="modal-title" style="font-size: 18px;"><i class="fa fa-save" style="font-size:16px"></i> Update Supply Status</h3>
          <button class="btn-back" @click="closeStatusPopup">&times;</button>
        </div>
        <div style="margin-top: 15px;">
          <label>Tracking ID</label>
          <input type="text" v-model="statusData.tracking_id" class="filter-input" style="width: 100%; margin-bottom: 10px;" />
          <label>Courier Name</label>
          <input type="text" v-model="statusData.courier_name" class="filter-input" style="width: 100%; margin-bottom: 10px;" />
          <label>Dispatched Date</label>
          <input type="date" v-model="statusData.closed_date" class="filter-input" style="width: 100%; margin-bottom: 20px;" />
          
          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-secondary" @click="confirmStatusUpdate">Update</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { toastError, toastSuccess } from "../../utils/toast";

export default {
  name: "MaterialSupplyModal",
  data() {
    return {
      showDeliveredDatePopup: false,
      showStatusPopup: false,
      supplies: [],
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      supplyFilters: { search: "", month: "", status: "" },
      deliveredDate: "",
      statusData: {
        po_id: null,
        status: "",
        tracking_id: "",
        courier_name: "",
        closed_date: new Date().toISOString().split("T")[0]
      }
    };
  },
  computed: {
    filteredSupplies() {
      return this.supplies.filter(supply => {
        let matchSearch = true;
        let matchMonth = true;
        let matchStatus = true;
        if (this.supplyFilters.search) {
          const s = this.supplyFilters.search.toLowerCase();
          matchSearch = (supply.company_name && supply.company_name.toLowerCase().includes(s)) ||
                        (supply.po_number && supply.po_number.toLowerCase().includes(s));
        }
        if (this.supplyFilters.month) {
          if (!supply.delivery_due_date) {
            matchMonth = false;
          } else {
            const m = new Date(supply.delivery_due_date).getMonth() + 1;
            matchMonth = m === parseInt(this.supplyFilters.month);
          }
        }
        if (this.supplyFilters.status) {
          const st = supply.material_status || 'Awaiting Dispatch';
          matchStatus = st === this.supplyFilters.status;
        }
        return matchSearch && matchMonth && matchStatus;
      });
    }
  },
  mounted() {
    this.fetchSupplies();
  },
  methods: {
    async fetchSupplies() {
      try {
        const response = await axios.get('/api/get-supplies');
        this.supplies = response.data;
      } catch (error) {
        console.error("Error fetching supplies", error);
      }
    },
    updateDeliveryDate(supply) {
      if (!supply.delivery_due_date) return;
      axios.post(`/api/update-supply-delivery-date/${supply.id}`, {
        delivery_due_date: supply.delivery_due_date
      })
      .then(() => toastSuccess('Delivery due date updated successfully'))
      .catch(() => toastError('Failed to update delivery due date'));
    },
    handleStatusChange(supply, newStatus) {
      if (newStatus === "Dispatched") {
        this.statusData = {
          po_id: supply.id,
          status: newStatus,
          tracking_id: supply.tracking_id || "",
          courier_name: supply.courier_name || "",
          closed_date: supply.closed_date || new Date().toISOString().split("T")[0]
        };
        this.showStatusPopup = true;
      } else if (newStatus === "Delivered") {
        this.statusData.po_id = supply.id;
        this.statusData.status = "Delivered";
        this.deliveredDate = new Date().toISOString().split("T")[0];
        this.showDeliveredDatePopup = true;
      }
    },
    closeStatusPopup() {
      this.showStatusPopup = false;
      this.fetchSupplies();
    },
    async confirmStatusUpdate() {
      try {
        await axios.post('/api/update-supply-status', this.statusData);
        toastSuccess('Status updated to Dispatched');
        this.showStatusPopup = false;
        this.fetchSupplies();
      } catch (error) {
        toastError('Failed to update status');
      }
    },
    async confirmDelivered() {
      if (!this.deliveredDate) {
        toastError('Please select material delivered date');
        return;
      }
      try {
        await axios.post('/api/update-supply-status', {
          po_id: this.statusData.po_id,
          status: 'Delivered',
          delivered_date: this.deliveredDate
        });
        toastSuccess('Material marked as Delivered');
        this.showDeliveredDatePopup = false;
        this.fetchSupplies();
      } catch (error) {
        toastError('Failed to update status');
      }
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
.modal-card.small {
  max-width: 500px;
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
.material-del {
  background-color: #f3e8ff; color: #9333ea; border: 1px solid #d8b4fe;
  padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px; font-size: 13px; transition: all 0.2s ease;
}
.material-del:hover {
  background-color: #e9d5ff; transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.15);
}
.btn-secondary {
  background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;
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
</style>
