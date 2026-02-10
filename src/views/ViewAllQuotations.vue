<template>
  <div>
    <!-- Trigger Popup -->
    <button class="assign-btn" @click="showViewQuotationPopup = true">
      View All Quotations
    </button>

    <!-- Quotation Popup -->
    <div v-if="showViewQuotationPopup" class="modal-backdrop">
      <div class="modal-card">

        <!-- Close Button -->
        <button class="btn btn-dark" style="float: right;" @click="showViewQuotationPopup = false">⬅ Back</button>

        <h2>All Quotations</h2>

        <!-- Filters -->
        <div class="filters-row" style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 150px;">
            <label style="font-size: 1.1em;">Filter by Company</label>
            <select v-model="filterCompany" class="input" style="width: 100%;" @change="applyFilters">
              <option value="">All Companies</option>
              <option v-for="cust in customers" :key="cust.id" :value="cust.company_name">
                {{ cust.company_name }}
              </option>
            </select>
          </div>

          <div style="flex: 1; min-width: 150px;">
            <label style="font-size: 1.1em;">Engine Serial Number</label>
            <input type="text" v-model="engineSearch" @input="applyFilters" placeholder="Enter Engine Serial Number" class="input" style="width: 100%;">
          </div>
        </div>

        <!-- Loader -->
        <div v-if="quotationLoading" class="quotation-loader">
          <span class="spinner"></span>
          <p>Loading quotations...</p>
        </div>

        <!-- Quotation Cards -->
        <div v-else-if="filteredQuotations.length > 0" class="cards-container">
          <div 
            v-for="q in filteredQuotations" 
            :key="q.id" 
            class="quote-card"
            @click="openQuotationInNewTab(q)"
          >
            <p><strong>{{ quotePrefix }}{{ q.id }}</strong></p>
            <p>{{ q.company_name }}</p>
            <p>Status: <span class="status-badge" :class="q.status">{{ q.status }}</span></p>

            <!-- Optional Edit/Delete -->
            <div class="card-actions">
              <button class="quotation-edit-btn" @click.stop="editQuotation(q)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="quotation-delete-btn" @click.stop="deleteQuotation(q.id)">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>

        <!-- No Data -->
        <div v-else-if="!quotationLoading">
          <p>No quotations found.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";
export default {
  data() {
    return {
      showViewQuotationPopup: false,
      quotationList: [],
      quotationLoading: true,
      filterCompany: '',
      engineSearch: '',
      customers: [],
      quotePrefix: 'Q-', // optional prefix
    };
  },
  computed: {
    filteredQuotations() {
      return this.quotationList.filter(q => {
        const matchesCompany = this.filterCompany ? q.company_name === this.filterCompany : true;
        const matchesEngine = this.engineSearch
          ? q.engine_serial_number?.toLowerCase().includes(this.engineSearch.toLowerCase())
          : true;
        return matchesCompany && matchesEngine;
      });
    }
  },
  watch: {
    showViewQuotationPopup(val) {
      if (val) {
        this.fetchQuotations();
        this.fetchCustomers();
      }
    }
  },
  methods: {
    fetchQuotations() {
      this.quotationLoading = true;
      axios.get('/api/quotations')
        .then(res => {
          this.quotationList = res.data;
        })
        .finally(() => {
          this.quotationLoading = false;
        });
    },
    fetchCustomers() {
      axios.get('/api/customers')
        .then(res => {
          this.customers = res.data;
        });
    },
    applyFilters() {
      // Computed property filteredQuotations automatically updates
    },
    openQuotationInNewTab(q) {
      // Replace this URL with actual PDF or quotation file URL
      const url = `/quotations/files/${q.file_name}`;
      window.open(url, '_blank');
    },
    editQuotation(q) {
      // Your existing edit logic
      console.log('Edit quotation', q);
    },
    deleteQuotation(id) {
      // Your existing delete logic
      console.log('Delete quotation', id);
    }
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top:0; left:0;
  width:100vw; height:100vh;
  background: rgba(0,0,0,0.5);
  display:flex;
  justify-content:center;
  align-items:flex-start;
  padding-top:40px;
  z-index: 9999;
}

.modal-card {
  background:#fff;
  padding:20px;
  border-radius:8px;
  width:90%;
  max-width:900px;
  max-height:90vh;
  overflow-y:auto;
  position: relative;
}

.cards-container {
  display:flex;
  flex-wrap:wrap;
  gap:15px;
}

.quote-card {
  flex: 1 1 200px;
  border:1px solid #ddd;
  border-radius:6px;
  padding:15px;
  cursor:pointer;
  position: relative;
  transition: box-shadow 0.2s;
}
.quote-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.status-badge {
  padding:3px 8px;
  border-radius:4px;
  color:#fff;
  font-weight:600;
  text-transform:capitalize;
}
.status-badge.Pending { background: orange; }
.status-badge.Converted { background: green; }
.status-badge.Lost { background: red; }

.card-actions {
  display:flex;
  gap:5px;
  margin-top:10px;
}

.quotation-edit-btn, .quotation-delete-btn {
  padding:5px 10px;
  border:none;
  border-radius:4px;
  color:#fff;
  cursor:pointer;
  font-size:0.85em;
}

.quotation-edit-btn { background:#3498db; }
.quotation-edit-btn:hover { background:#2980b9; }

.quotation-delete-btn { background:#e74c3c; }
.quotation-delete-btn:hover { background:#c0392b; }

.quotation-loader {
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  gap:10px;
  padding:20px;
}
.spinner {
  width:40px; height:40px;
  border:4px solid #f3f3f3;
  border-top:4px solid #3498db;
  border-radius:50%;
  animation:spin 1s linear infinite;
}
@keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
</style>
