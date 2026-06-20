<template>
  <div class="announcement-board" v-if="!isMobile || !isSidebarVisible">
    <!-- Mobile Header -->
    <div class="mobile-header" v-if="isMobile">
      <div class="mobile-title">
        <i class="fas fa-file-invoice"></i>
        <span>Quotations</span>
      </div>
      <div class="mobile-filter-btn" @click="toggleFilter">
        <i class="fas fa-filter"></i>
        <span v-if="selectedStatus || hasActiveFilters" class="filter-badge">•</span>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="header-section desktop-only">
      <h2>📊 Quotation & Order Sheet</h2>
      <div class="desktop-filter-group">
        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="followup">Follow Up</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button class="filter-toggle-btn" @click="showAdvancedFilters = !showAdvancedFilters">
          <i class="fas fa-sliders-h"></i> Filters
          <span v-if="hasActiveFilters" class="filter-dot"></span>
        </button>
      </div>
    </div>

    <!-- Advanced Filters - Desktop -->
    <div class="advanced-filters" v-if="showAdvancedFilters && !isMobile">
      <div class="filter-grid">
        <div class="filter-group">
          <label><i class="fas fa-user"></i> Created By</label>
          <input type="text" v-model="filters.created_by" placeholder="Filter by creator..." class="filter-input" @input="applyFilters">
        </div>
        <div class="filter-group">
          <label><i class="fas fa-building"></i> Party Name</label>
          <input type="text" v-model="filters.party_name" placeholder="Filter by party..." class="filter-input" @input="applyFilters">
        </div>
        <div class="filter-group">
          <label><i class="fas fa-cog"></i> Engine Serial</label>
          <input type="text" v-model="filters.engine_serial" placeholder="Filter by serial..." class="filter-input" @input="applyFilters">
        </div>
        <div class="filter-group">
          <label><i class="fas fa-microchip"></i> Engine Model</label>
          <input type="text" v-model="filters.engine_model" placeholder="Filter by model..." class="filter-input" @input="applyFilters">
        </div>
        <div class="filter-group">
          <label><i class="fas fa-user-check"></i> Recommended By</label>
          <input type="text" v-model="filters.recommended_by" placeholder="Filter by recommender..." class="filter-input" @input="applyFilters">
        </div>
        <div class="filter-group filter-actions">
          <button class="clear-filters-btn" @click="clearFilters">
            <i class="fas fa-undo"></i> Clear All
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Filter Bar -->
    <div class="mobile-filter-bar" v-if="isMobile" :class="{ 'filter-open': filterOpen }">
      <div class="filter-options">
        <button 
          v-for="status in ['', 'pending', 'followup', 'approved', 'rejected']" 
          :key="status"
          class="filter-chip"
          :class="{ active: selectedStatus === status }"
          @click="selectedStatus = status; filterOpen = false"
        >
          {{ status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All' }}
        </button>
      </div>
      
      <!-- Mobile Advanced Filters -->
      <div class="mobile-advanced-filters">
        <div class="filter-group">
          <label><i class="fas fa-user"></i> Created By</label>
          <input type="text" v-model="filters.created_by" placeholder="Creator..." class="filter-input" @input="applyFilters">
        </div>
        <div class="filter-group">
          <label><i class="fas fa-building"></i> Party</label>
          <input type="text" v-model="filters.party_name" placeholder="Party name..." class="filter-input" @input="applyFilters">
        </div>
        <div class="filter-group">
          <label><i class="fas fa-cog"></i> Engine Serial</label>
          <input type="text" v-model="filters.engine_serial" placeholder="Serial..." class="filter-input" @input="applyFilters">
        </div>
        <div class="filter-group">
          <label><i class="fas fa-microchip"></i> Model</label>
          <input type="text" v-model="filters.engine_model" placeholder="Model..." class="filter-input" @input="applyFilters">
        </div>
        <div class="filter-group">
          <label><i class="fas fa-user-check"></i> Recommended</label>
          <input type="text" v-model="filters.recommended_by" placeholder="Recommender..." class="filter-input" @input="applyFilters">
        </div>
        <button class="clear-filters-btn mobile-clear" @click="clearFilters">
          <i class="fas fa-undo"></i> Clear All
        </button>
      </div>
    </div>

    <!-- Stats - Mobile -->
    <div class="stats-row-mobile" v-if="isMobile">
      <div class="stat-chip" :class="{ active: selectedStatus === '' }" @click="selectedStatus = ''">
        <span class="stat-count">{{ filteredAndSortedQuotations.length }}</span>
        <span class="stat-label">Filtered</span>
      </div>
      <div class="stat-chip pending" :class="{ active: selectedStatus === 'pending' }" @click="selectedStatus = 'pending'">
        <span class="stat-count">{{ pendingCount }}</span>
        <span class="stat-label">Pending</span>
      </div>
      <div class="stat-chip followup" :class="{ active: selectedStatus === 'followup' }" @click="selectedStatus = 'followup'">
        <span class="stat-count">{{ followupCount }}</span>
        <span class="stat-label">Follow Up</span>
      </div>
      <div class="stat-chip approved" :class="{ active: selectedStatus === 'approved' }" @click="selectedStatus = 'approved'">
        <span class="stat-count">{{ approvedCount }}</span>
        <span class="stat-label">Approved</span>
      </div>
      <div class="stat-chip rejected" :class="{ active: selectedStatus === 'rejected' }" @click="selectedStatus = 'rejected'">
        <span class="stat-count">{{ rejectedCount }}</span>
        <span class="stat-label">Rejected</span>
      </div>
    </div>

    <div class="content">
      <div class="table-scroll-wrapper">
        <!-- Mobile Card View -->
        <div class="mobile-cards" v-if="isMobile">
          <div v-for="(q, index) in filteredAndSortedQuotations" :key="q.id" 
               class="quotation-card"
               :class="{
                 'approved-card': q.status === 'approved',
                 'pending-card': q.status === 'pending',
                 'rejected-card': q.status === 'rejected',
                 'followup-card': q.status === 'followup',
               }">
            <div class="card-header">
              <div class="card-title">
                <span class="quotation-number" @click="openQuotation(q)">
                  Quotation-{{ q.id }}-{{ formatCompanyName(q.company_name) }}
                </span>
                <span :class="['status-badge-mobile', `status-${q.status}`]">
                  {{ q.status || 'Pending' }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <div class="card-row">
                <span class="card-label"><i class="fas fa-calendar"></i> Date</span>
                <span class="card-value">{{ formatDate(q.created_at) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label"><i class="fas fa-building"></i> Party</span>
                <span class="card-value">{{ q.company_name }}</span>
              </div>
              <div class="card-row">
                <span class="card-label"><i class="fas fa-cog"></i> Engine</span>
                <span class="card-value">{{ q.engine_serial }} / {{ q.model_no }}</span>
              </div>
              <div class="card-row">
                <span class="card-label"><i class="fas fa-tag"></i> Value</span>
                <span class="card-value">₹{{ calculateTaxableValue(q.items).toLocaleString('en-IN') }}</span>
              </div>
              <div class="card-row">
                <span class="card-label"><i class="fas fa-percent"></i> Discount</span>
                <span class="card-value">{{ getDiscountPercent(q.items) }}%</span>
              </div>
              <div class="card-row">
                <span class="card-label"><i class="fas fa-user"></i> Created</span>
                <span class="card-value">{{ q.created_by || '—' }}</span>
              </div>
              <div class="card-row" v-if="q.recommended_by">
                <span class="card-label"><i class="fas fa-user-check"></i> Recommended</span>
                <span class="card-value">{{ q.recommended_by }}</span>
              </div>
              
              <!-- Items -->
              <div class="card-items">
                <div class="card-label"><i class="fas fa-list"></i> Items</div>
                <ul :class="{ 'collapsed': !expandedQuotations[q.id] && q.items.length > 3 }">
                  <li v-for="(item, idx) in q.items" :key="item.sr" 
                      v-show="idx < 3 || expandedQuotations[q.id]">
                    {{ item.description }}
                  </li>
                </ul>
                <button v-if="q.items.length > 3" @click="toggleSeeMore(q.id)" class="see-more-btn">
                  {{ expandedQuotations[q.id] ? "See Less" : "See More" }}
                </button>
              </div>

              <!-- Status Dropdown -->
              <div class="card-status-row">
                <span class="card-label"><i class="fas fa-tasks"></i> Status</span>
                <select v-model="q.status" class="status-select-mobile" :class="`status-${q.status || 'default'}`" @change="updateQuotationStatus(q)">
                  <option value="pending">Pending</option>
                  <option value="followup">Follow Up</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <!-- Remarks -->
              <div class="card-remarks">
                <span class="card-label"><i class="fas fa-comment"></i> Remarks</span>
                <textarea v-model="q.remarks" placeholder="Add follow-up notes..." class="remark-textarea-mobile" rows="3" @input="debounceSave(q)"></textarea>
              </div>
            </div>
          </div>

          <div v-if="filteredAndSortedQuotations.length === 0" class="no-data-mobile">
            <i class="fas fa-inbox"></i>
            <p>No quotations match your filters</p>
          </div>
        </div>

        <!-- Desktop Table View -->
        <table class="styled-customer-table" v-else>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>QUOTATION NO.</th>
              <th>Quote Date</th>
              <th>Party Name</th>
              <th>Engine Serial</th>
              <th>Engine Model</th>
              <th class="description-col">Brief Description</th>
              <th>Initial Value</th>
              <th>Disc.(%)</th>
              <th>Created By</th>
              <th>Recommended By</th>
              <th class="remarks-col">Remarks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(q, index) in filteredAndSortedQuotations" :key="q.id"
                :class="{
                  'approved-row': q.status === 'approved',
                  'pending-row': q.status === 'pending',
                  'rejected-row': q.status === 'rejected',
                  'followup-row': q.status === 'followup',
                }">
              <td>{{ index + 1 }}</td>
              <td>
                <span class="quotation-link" @click="openQuotation(q)">
                  Quotation-{{ q.id }}-{{ formatCompanyName(q.company_name) }}
                </span>
              </td>
              <td>{{ formatDate(q.created_at) }}</td>
              <td>{{ q.company_name }}</td>
              <td>{{ q.engine_serial }}</td>
              <td>{{ q.model_no }}</td>
              <td class="description-col" style="font-size: 10px;">
                <ul :class="{ 'collapsed': !expandedQuotations[q.id] && q.items.length > 3 }">
                  <li v-for="(item, idx) in q.items" :key="item.sr" 
                      v-show="idx < 3 || expandedQuotations[q.id]">
                    {{ item.description }}
                  </li>
                </ul>
                <button v-if="q.items.length > 3" @click="toggleSeeMore(q.id)" class="see-more-btn">
                  {{ expandedQuotations[q.id] ? "See Less" : "See More" }}
                </button>
              </td>
              <td>{{ calculateTaxableValue(q.items).toLocaleString('en-IN') }}</td>
              <td>
                <span v-if="Number(q.discount) === 0">No Discount</span>
                <span v-else>{{ getDiscountPercent(q.items) }}%</span>
              </td>
              <td>{{ q.created_by || '—' }}</td>
              <td>{{ q.recommended_by || '—' }}</td>
              <td class="remarks-col">
                <textarea v-model="q.remarks" placeholder="Add follow-up notes..." class="remark-textarea" rows="5" @input="debounceSave(q)"></textarea>
              </td>
              <td>
                <div class="status-wrapper">
                  <select v-model="q.status" class="status-select" :class="`status-${q.status || 'default'}`" @change="updateQuotationStatus(q)">
                    <option value="pending">Pending</option>
                    <option value="followup">Follow Up</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAndSortedQuotations.length === 0">
              <td colspan="13" class="no-data">No quotations match your filters</td>
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
      expandedQuotations: {},
      selectedStatus: "",
      debounceTimers: {},
      isMobile: false,
      isSidebarVisible: true,
      filterOpen: false,
      showAdvancedFilters: true,
      financialYear: "2025-26",
      followUpQuotations: [],
      filters: {
        created_by: '',
        party_name: '',
        engine_serial: '',
        engine_model: '',
        recommended_by: ''
      }
    };
  },
  computed: {
    hasActiveFilters() {
      return this.selectedStatus !== '' || 
             this.filters.created_by !== '' ||
             this.filters.party_name !== '' ||
             this.filters.engine_serial !== '' ||
             this.filters.engine_model !== '' ||
             this.filters.recommended_by !== '';
    },
    sortedQuotations() {
      return [...this.followUpQuotations].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    },
    filteredAndSortedQuotations() {
      let list = this.followUpQuotations;
      
      // Status filter
      if (this.selectedStatus) {
        list = list.filter(q => q.status === this.selectedStatus);
      }
      
      // Advanced filters
      if (this.filters.created_by) {
        const search = this.filters.created_by.toLowerCase().trim();
        list = list.filter(q => q.created_by && q.created_by.toLowerCase().includes(search));
      }
      
      if (this.filters.party_name) {
        const search = this.filters.party_name.toLowerCase().trim();
        list = list.filter(q => q.company_name && q.company_name.toLowerCase().includes(search));
      }
      
      if (this.filters.engine_serial) {
        const search = this.filters.engine_serial.toLowerCase().trim();
        list = list.filter(q => q.engine_serial && q.engine_serial.toLowerCase().includes(search));
      }
      
      if (this.filters.engine_model) {
        const search = this.filters.engine_model.toLowerCase().trim();
        list = list.filter(q => q.model_no && q.model_no.toLowerCase().includes(search));
      }
      
      if (this.filters.recommended_by) {
        const search = this.filters.recommended_by.toLowerCase().trim();
        list = list.filter(q => q.recommended_by && q.recommended_by.toLowerCase().includes(search));
      }
      
      return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    pendingCount() {
      return this.followUpQuotations.filter(q => q.status === 'pending').length;
    },
    followupCount() {
      return this.followUpQuotations.filter(q => q.status === 'followup').length;
    },
    approvedCount() {
      return this.followUpQuotations.filter(q => q.status === 'approved').length;
    },
    rejectedCount() {
      return this.followUpQuotations.filter(q => q.status === 'rejected').length;
    }
  },
  methods: {
    applyFilters() {
      // Filters are applied reactively through computed property
      // This method exists for the @input event binding
    },
    clearFilters() {
      this.selectedStatus = '';
      this.filters.created_by = '';
      this.filters.party_name = '';
      this.filters.engine_serial = '';
      this.filters.engine_model = '';
      this.filters.recommended_by = '';
      this.filterOpen = false;
      toastInfo("All filters cleared");
    },
    toggleFilter() {
      this.filterOpen = !this.filterOpen;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    openQuotation(q) {
      localStorage.setItem("selectedQuotationId", q.id);
      window.open("/quotation", "_blank");
    },
    toggleSeeMore(quotationId) {
      this.expandedQuotations = {
        ...this.expandedQuotations,
        [quotationId]: !this.expandedQuotations[quotationId]
      };
    },
    calculateTaxableValue(items) {
      if (!items || !items.length) return 0;
      return items.reduce((sum, item) => {
        const rate = Number(item.rate || 0);
        const qty = Number(item.qty || 0);
        const discount = Number(item.discount || 0);
        const gross = rate * qty;
        const discountAmount = gross * (discount / 100);
        const taxable = gross - discountAmount;
        return sum + taxable;
      }, 0);
    },
    formatCompanyName(name) {
      if (!name) return '';
      return name.replace(/[^A-Za-z0-9_-]/g, '_');
    },
    saveRemark(q) {
      axios.put(`/api/quotations/${q.id}`, { remarks: q.remarks })
        .then(() => toastSuccess("Remarks saved"))
        .catch(() => toastError("Failed to save remark"));
    },
    debounceSave(q) {
      if (this.debounceTimers[q.id]) {
        clearTimeout(this.debounceTimers[q.id]);
      }
      this.debounceTimers[q.id] = setTimeout(() => {
        this.saveRemark(q);
        delete this.debounceTimers[q.id];
      }, 1000);
    },
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("en-IN");
    },
    getDiscountPercent(items) {
      if (!items || !items.length) return 0;
      let totalAmount = 0;
      let totalDiscountAmount = 0;
      items.forEach(item => {
        const rate = Number(item.rate || 0);
        const qty = Number(item.qty || 0);
        const discount = Number(item.discount || 0);
        const gross = rate * qty;
        const discountAmount = gross * (discount / 100);
        totalAmount += gross;
        totalDiscountAmount += discountAmount;
      });
      if (totalAmount === 0) return 0;
      return ((totalDiscountAmount / totalAmount) * 100).toFixed(2);
    },
    updateQuotationStatus(q) {
      axios.post(`/api/quotations/${q.id}/status`, { 
        quotation_followup_status: q.status,
        remarks: q.remarks 
      })
      .then(res => {
        console.log(res.data.message);
        toastSuccess(res.data.message);
      })
      .catch(err => {
        console.error(err);
        toastError("Failed to update status");
      });
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    fetchQuotations() {
      axios.get("/api/quotations")
        .then(res => {
          this.followUpQuotations = res.data.map(q => ({
            ...q,
            items: q.items || [],
            status: q.quotation_followup_status
              ? q.quotation_followup_status.toLowerCase()
              : 'pending',
            remarks: q.remarks || ''
          }));
        })
        .catch(() => {
          toastError('Failed to fetch quotations');
        });
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchQuotations();
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
  top: -4px;
  right: -4px;
  background: #667eea;
  color: white;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  font-weight: bold;
}

/* Desktop Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-section h2 {
  margin: 0;
  color: #fff;
  font-size: 19px;
}

.desktop-filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-weight: 500;
  background: white;
  cursor: pointer;
  min-width: 140px;
}

.filter-toggle-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #667eea;
  background: white;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.filter-toggle-btn:hover {
  background: #667eea;
  color: white;
}

.filter-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  background: #dc3545;
  border-radius: 50%;
  border: 2px solid white;
}

/* Advanced Filters */
.advanced-filters {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.3s ease;
  background: #fafafa;
  width: 100%;
}

.filter-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.filter-actions {
  justify-content: flex-end;
}

.clear-filters-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  width: 100%;
  justify-content: center;
}

.clear-filters-btn:hover {
  background: #dc3545;
  color: white;
}

/* Mobile Filter Bar */
.mobile-filter-bar {
  display: none;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  margin-bottom: 12px;
  background: white;
  border-radius: 16px;
  padding: 0 16px;
}

.mobile-filter-bar.filter-open {
  max-height: 600px;
  padding: 16px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-chip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-chip:active {
  transform: scale(0.95);
}

.filter-chip.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Mobile Advanced Filters */
.mobile-advanced-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-advanced-filters .filter-group {
  width: 100%;
}

.mobile-advanced-filters .filter-input {
  font-size: 14px;
  padding: 10px 12px;
}

.mobile-clear {
  margin-top: 4px;
  width: 100%;
  padding: 10px;
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
  padding: 8px 14px;
  border-radius: 12px;
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

.stat-chip.active {
  border-color: #667eea;
  background: #e0e7ff;
}

.stat-chip.pending.active { border-color: #856404; background: #fff3cd; }
.stat-chip.followup.active { border-color: #004085; background: #cce5ff; }
.stat-chip.approved.active { border-color: #155724; background: #d4edda; }
.stat-chip.rejected.active { border-color: #721c24; background: #f8d7da; }

.stat-count {
  display: block;
  font-size: 18px;
  font-weight: 700;
}

.stat-label {
  font-size: 10px;
  color: #6b7280;
}

.announcement-board {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #04085b;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.content {
  margin-top: 12px;
}

.table-scroll-wrapper {
  max-height: calc(100vh - 120px);
  overflow-x: auto;
  overflow-y: auto;
  border-radius: 10px;
  background: white;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
}

.quotation-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #ccc;
}

.quotation-card.approved-card { border-left-color: #28a745; }
.quotation-card.pending-card { border-left-color: #ffc107; }
.quotation-card.rejected-card { border-left-color: #dc3545; }
.quotation-card.followup-card { border-left-color: #007bff; }

.card-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.quotation-number {
  cursor: pointer;
  color: #034081;
  font-weight: 600;
  font-size: 13px;
  text-decoration: underline;
  word-break: break-word;
}

.quotation-number:active {
  color: #0b5ed7;
}

.status-badge-mobile {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge-mobile.status-pending {
  background: #fff3cd;
  color: #856404;
}
.status-badge-mobile.status-followup {
  background: #cce5ff;
  color: #004085;
}
.status-badge-mobile.status-approved {
  background: #d4edda;
  color: #155724;
}
.status-badge-mobile.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-value {
  font-size: 13px;
  color: #1a1a2e;
  text-align: right;
  word-break: break-word;
  max-width: 55%;
}

.card-items {
  margin-top: 4px;
}

.card-items ul {
  padding-left: 20px;
  margin: 4px 0;
  list-style-type: disc;
  font-size: 12px;
  color: #4b5563;
}

.card-items ul.collapsed {
  max-height: 3.2em;
  overflow: hidden;
}

.see-more-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 0;
  font-size: 11px;
  margin-top: 2px;
}

.see-more-btn:active {
  opacity: 0.7;
}

.card-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.status-select-mobile {
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  border: none;
  cursor: pointer;
  outline: none;
  background: #f3f4f6;
  color: #383d41;
  min-width: 120px;
}

.status-select-mobile.status-pending {
  background: #fff3cd;
  color: #856404;
}
.status-select-mobile.status-followup {
  background: #cce5ff;
  color: #004085;
}
.status-select-mobile.status-approved {
  background: #d4edda;
  color: #155724;
}
.status-select-mobile.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.card-remarks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.remark-textarea-mobile {
  width: 100%;
  resize: vertical;
  padding: 8px 10px;
  font-family: inherit;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  transition: 0.2s ease;
  background: #fafafa;
  min-height: 60px;
}

.remark-textarea-mobile:focus {
  outline: none;
  border-color: #3498db;
  background: #fff;
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

/* Desktop Table */
.styled-customer-table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
}

.styled-customer-table thead {
  background-color: #1a1a2e;
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
  font-size: 11px;
}

.styled-customer-table .no-data {
  text-align: center;
  padding: 30px 0;
  color: #888;
  font-style: italic;
}

/* Row Colors */
.approved-row { background-color: #92e8a6 !important; }
.pending-row { background-color: #00bcd466 !important; }
.rejected-row { background-color: #ff0a208f !important; }
.followup-row { background-color: #fff30bd1 !important; }

/* Remarks Column */
.remarks-col {
  min-width: 240px;
  width: 240px;
}

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

/* Status Select */
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

.status-select:hover {
  filter: brightness(0.95);
}

.quotation-link {
  cursor: pointer;
  color: #034081;
  font-weight: 600;
  text-decoration: underline;
}

.quotation-link:hover {
  color: #0b5ed7;
}

.description-col ul {
  padding-left: 16px;
  margin: 0;
  list-style-type: disc;
}

.description-col ul.collapsed {
  max-height: 3.2em;
  overflow: hidden;
}

/* Scrollbar */
.table-scroll-wrapper::-webkit-scrollbar {
  height: 8px;
  width: 6px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Responsive */
@media (max-width: 768px) {
  .announcement-board {
    padding: 12px;
  }

  .mobile-header {
    display: flex;
  }

  .header-section {
    display: none;
  }

  .mobile-filter-bar {
    display: block;
  }

  .stats-row-mobile {
    display: flex;
  }

  .mobile-cards {
    display: flex;
  }

  .styled-customer-table {
    display: none;
  }

  .table-scroll-wrapper {
    max-height: none;
    overflow: visible;
    background: transparent;
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .announcement-board {
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
    padding: 6px 12px;
    min-width: 50px;
  }

  .stat-count {
    font-size: 15px;
  }

  .stat-label {
    font-size: 8px;
  }

  .quotation-card {
    padding: 12px;
  }

  .card-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
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

  .card-status-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-select-mobile {
    width: 100%;
  }

  .filter-chip {
    font-size: 11px;
    padding: 4px 12px;
  }
}
</style>