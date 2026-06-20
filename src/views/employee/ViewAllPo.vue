<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="sop-board-premium" v-if="!isMobile || !isSidebarVisible">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
         
          <div class="mobile-title">
            <i class="fas fa-file-invoice"></i>
            <span>Purchase Orders</span>
          </div>
          <button class="mobile-add-btn" @click="openCreateModal">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-file-invoice"></i>
            </div>
            <div>
              <h1>Purchase Orders</h1>
              <p class="subtitle-modern">Manage & Track All Purchase Orders</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-chart-line"></i>
            <span>{{ filteredPOs.length }} / {{ totalRecords }} POs</span>
          </div>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card" @click="filterByStatus('all')">
            <i class="fas fa-file-invoice-dollar"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalPOValue }}</span>
              <span class="stat-label">Total Value</span>
            </div>
          </div>
          <div class="stat-card" @click="filterByStatus('Open')">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Open }}</span>
              <span class="stat-label">Open</span>
            </div>
          </div>
          <div class="stat-card" @click="filterByStatus('Closed')">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ statusCounts.Closed }}</span>
              <span class="stat-label">Closed</span>
            </div>
          </div>
        </div>

        <!-- Time Filter Toggle - Mobile Optimized -->
        <div class="time-filter-section">
          <button 
            :class="['time-filter-btn', { active: timeFilter === 'default' }]" 
            @click="setTimeFilter('default')"
          >
            <i class="fas fa-calendar-alt"></i> <span class="btn-text">From April {{ currentYear }}</span>
          </button>
          <button 
            :class="['time-filter-btn', { active: timeFilter === 'all' }]" 
            @click="setTimeFilter('all')"
          >
            <i class="fas fa-history"></i> <span class="btn-text">All Time</span>
          </button>
        </div>

        <!-- Search and Filters - Mobile Optimized -->
        <div class="filters-section">
          <button class="filter-toggle-btn" @click="toggleFilters">
            <i class="fas fa-sliders-h"></i>
            <span>{{ isMobile ? 'Filters' : 'Filter' }}</span>
            <i class="fas fa-chevron-down" :class="{ 'rotated': filtersVisible }"></i>
          </button>
          
          <div class="filter-group-container" :class="{ 'filters-hidden': !filtersVisible }">
            <div class="search-wrapper">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search by PO number, company..."
                class="search-input"
              />
            </div>
            <div class="filter-group">
              <select v-model="statusFilter" class="filter-select">
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
              <select v-model="typeFilter" class="filter-select">
                <option value="">All Types</option>
                <option value="Supply">Supply</option>
                <option value="Service">Service</option>
                <option value="AMC">AMC</option>
              </select>
              <input type="month" v-model="dateFilter" class="filter-date" placeholder="Filter by month" />
              <button class="clear-filters-btn" @click="clearFilters" v-if="isFilterActive">
                <i class="fas fa-times"></i> Clear
              </button>
            </div>
          </div>
        </div>

        <!-- View Toggle - Mobile Optimized -->
        <div class="section-title-modern">
          <div class="title-left">
            <i class="fas fa-list"></i>
            <span>Purchase Orders</span>
            <span class="record-count-mobile" v-if="isMobile">{{ filteredPOs.length }}</span>
          </div>
          <div class="view-toggle">
            <button 
              :class="['view-btn', { active: viewMode === 'table' }]" 
              @click="viewMode = 'table'"
            >
              <i class="fas fa-table"></i>
            </button>
            <button 
              :class="['view-btn', { active: viewMode === 'grid' }]" 
              @click="viewMode = 'grid'"
            >
              <i class="fas fa-th"></i>
            </button>
          </div>
        </div>

        <!-- MAIN TABLE VIEW -->
        <div v-if="viewMode === 'table'" class="table-wrapper">
          <div class="table-container">
            <table class="po-data-table">
              <thead>
                <tr>
                  <th @click="sortBy('po_number')">PO # <i class="fas fa-sort"></i></th>
                  <th @click="sortBy('po_type')">Type <i class="fas fa-sort"></i></th>
                  <th @click="sortBy('company_name')">Company <i class="fas fa-sort"></i></th>
                  <th @click="sortBy('value_of_po')">Value <i class="fas fa-sort"></i></th>
                  <th @click="sortBy('date')">Date <i class="fas fa-sort"></i></th>
                  <th @click="sortBy('recommended_by')">Recommended <i class="fas fa-sort"></i></th>
                  <th>PDF</th>
                  <th @click="sortBy('status')">Status <i class="fas fa-sort"></i></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody v-if="paginatedPOs.length">
                <tr v-for="po in paginatedPOs" :key="po.id">
                  <td class="po-number">{{ po.po_number || '-' }}</td>
                  <td>
                    <span class="type-badge" :class="getTypeBadgeClass(po.po_type)">
                      <i :class="getTypeIcon(po.po_type)"></i> {{ formatType(po.po_type) }}
                    </span>
                  </td>
                  <td class="company-name">{{ po.company_name || '-' }}</td>
                  <td class="amount">{{ formatCurrency(po.value_of_po) }}</td>
                  <td>{{ formatDate(po.date) }}</td>
                  <td>{{ po.recommended_by || '-' }}</td>
                  <td>
                    <button 
                      v-if="po.po_file_path" 
                      class="file-link-btn" 
                      @click="downloadPOFile(po)"
                      title="Download PDF"
                    >
                      <i class="fas fa-file-pdf"></i>
                    </button>
                    <span v-else class="no-file">-</span>
                  </td>
                  <td>
                    <span :class="['status-badge', po.status === 'Open' ? 'badge-open' : 'badge-closed']">
                      <i :class="po.status === 'Open' ? 'fas fa-circle' : 'fas fa-check-circle'"></i>
                      {{ po.status || 'Open' }}
                    </span>
                  </td>
                  <td class="table-actions">
                    <button class="action-icon view-icon" @click="viewPODetails(po)" title="View">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-icon edit-icon" @click="editPO(po)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon delete-icon" @click="deletePO(po)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td colspan="9" class="empty-table-row">
                    <div class="empty-table-content">
                      <i class="fas fa-file-invoice"></i>
                      <p>No purchase orders found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Grid View - Mobile Optimized -->
        <div v-else-if="viewMode === 'grid' && filteredPOs.length" class="pos-grid-premium">
          <div v-for="po in paginatedGridPOs" :key="po.id" class="po-card-premium" :class="{ 'mobile-card': isMobile }">
            <div class="card-accent" :class="po.status === 'Open' ? 'status-open' : 'status-closed'"></div>
            <div class="po-header" :class="{ 'mobile-header': isMobile }">
              <div class="po-icon" :class="getTypeIconClass(po.po_type)">
                <i :class="getTypeIcon(po.po_type)"></i>
              </div>
              <div class="po-title-wrap">
                <h3>{{ po.po_number || '-' }}</h3>
                <div class="po-meta">
                  <span><i class="fas fa-building"></i> {{ truncateText(po.company_name, isMobile ? 15 : 25) }}</span>
                </div>
              </div>
              <div class="po-actions" :class="{ 'mobile-actions': isMobile }">
                <button class="action-btn view-btn" @click="viewPODetails(po)" title="View">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn download-btn" @click="downloadPOFile(po)" title="Download" v-if="po.po_file_path">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
            <div class="po-details" :class="{ 'mobile-details': isMobile }">
              <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value">{{ formatType(po.po_type) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Value:</span>
                <span class="detail-value highlight">{{ formatCurrency(po.value_of_po) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ formatDate(po.date) }}</span>
              </div>
              <div class="detail-row" v-if="po.recommended_by">
                <span class="detail-label">Recommended:</span>
                <span class="detail-value">{{ po.recommended_by }}</span>
              </div>
            </div>
            <div class="po-footer" :class="{ 'mobile-footer': isMobile }">
              <div class="badge-status" :class="po.status === 'Open' ? 'badge-open' : 'badge-closed'">
                <i :class="po.status === 'Open' ? 'fas fa-circle' : 'fas fa-check-circle'"></i> {{ po.status || 'Open' }}
              </div>
              <div class="badge-type" v-if="po.po_type">
                <i :class="getTypeIcon(po.po_type)"></i> {{ formatType(po.po_type) }}
              </div>
              <div class="card-actions">
                <button class="action-btn edit-btn" @click="editPO(po)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" @click="deletePO(po)" title="Delete">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="pagination" v-if="gridTotalPages > 1">
            <button @click="gridCurrentPage--" :disabled="gridCurrentPage === 1" class="page-btn">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-info">Page {{ gridCurrentPage }} of {{ gridTotalPages }}</span>
            <button @click="gridCurrentPage++" :disabled="gridCurrentPage === gridTotalPages" class="page-btn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="viewMode === 'grid' && !filteredPOs.length" class="empty-state-premium" :class="{ 'empty-mobile': isMobile }">
          <i class="fas fa-file-invoice"></i>
          <h4>No Purchase Orders Found</h4>
          <p>No purchase orders match your criteria</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit PO Modal - Mobile Optimized -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container-premium modal-large" :class="{ 'mobile-modal': isMobile }">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <h2>{{ editingPO ? 'Edit PO' : 'New PO' }}</h2>
          <button class="close-modal" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handlePOSubmit">
            <div class="form-row" :class="{ 'mobile-row': isMobile }">
              <div class="form-group half">
                <label><i class="fas fa-hashtag"></i> PO Number *</label>
                <input type="text" v-model="formPO.po_number" placeholder="e.g., GC000082" required>
              </div>
              <div class="form-group half">
                <label><i class="fas fa-building"></i> Company *</label>
                <input type="text" v-model="formPO.company_name" placeholder="Company name" required>
              </div>
            </div>
            <div class="form-row" :class="{ 'mobile-row': isMobile }">
              <div class="form-group half">
                <label><i class="fas fa-tag"></i> PO Type *</label>
                <select v-model="formPO.po_type" required>
                  <option value="">Select Type</option>
                  <option value="Supply">Supply</option>
                  <option value="Service">Service</option>
                  <option value="AMC">AMC</option>
                </select>
              </div>
              <div class="form-group half">
                <label><i class="fas fa-dollar-sign"></i> Value *</label>
                <input type="number" step="0.01" v-model="formPO.value_of_po" placeholder="0.00" required>
              </div>
            </div>
            <div class="form-row" :class="{ 'mobile-row': isMobile }">
              <div class="form-group half">
                <label><i class="fas fa-calendar"></i> Date *</label>
                <input type="date" v-model="formPO.date" required>
              </div>
              <div class="form-group half">
                <label><i class="fas fa-user-check"></i> Recommended *</label>
                <input type="text" v-model="formPO.recommended_by" placeholder="Person name" required>
              </div>
            </div>
            <div class="form-row" :class="{ 'mobile-row': isMobile }" v-if="!isMobile">
              <div class="form-group half">
                <label><i class="fas fa-flag-checkered"></i> Status</label>
                <select v-model="formPO.status">
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div class="form-group half">
                <label><i class="fas fa-calendar-times"></i> Closed Date</label>
                <input type="date" v-model="formPO.closed_date">
              </div>
            </div>
            <div class="form-group">
              <label><i class="fas fa-file-pdf"></i> PDF File (optional, max 15MB)</label>
              <div class="file-dropzone" :class="{ 'drag-over': dragActive, 'mobile-dropzone': isMobile }" @dragover.prevent="dragActive = true" @dragleave.prevent="dragActive = false" @drop.prevent="handleFileDrop">
                <input type="file" ref="fileInput" @change="handleFileSelect" accept=".pdf" style="display: none">
                <i class="fas fa-cloud-upload-alt fa-2x"></i>
                <p v-if="!selectedFile && !formPO.po_file_path">Drop PDF here or <span class="browse-link" @click="triggerFileInput">browse</span></p>
                <p v-else-if="selectedFile" class="file-selected"><i class="fas fa-check-circle"></i> {{ selectedFile.name }}</p>
                <p v-else class="file-selected"><i class="fas fa-file-pdf"></i> Current file</p>
              </div>
              <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
            </div>
            <div class="modal-actions" :class="{ 'mobile-actions': isMobile }">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                <i v-if="submitting" class="fas fa-spinner fa-pulse"></i>
                <i v-else class="fas fa-save"></i>
                {{ submitting ? 'Saving...' : (editingPO ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Details Modal - Mobile Optimized -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
      <div class="modal-container-premium modal-detail" :class="{ 'mobile-modal': isMobile }">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-file-invoice"></i>
          </div>
          <h2>{{ isMobile ? 'PO Details' : 'PO Details: ' + (selectedPO?.po_number || '') }}</h2>
          <button class="close-modal" @click="showViewModal = false">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedPO">
          <div class="detail-grid" :class="{ 'mobile-grid': isMobile }">
            <div class="detail-item">
              <label>PO Number</label>
              <p>{{ selectedPO.po_number || '-' }}</p>
            </div>
            <div class="detail-item">
              <label>PO Type</label>
              <p>{{ formatType(selectedPO.po_type) }}</p>
            </div>
            <div class="detail-item">
              <label>Company</label>
              <p>{{ selectedPO.company_name || '-' }}</p>
            </div>
            <div class="detail-item">
              <label>Value</label>
              <p class="highlight">{{ formatCurrency(selectedPO.value_of_po) }}</p>
            </div>
            <div class="detail-item">
              <label>Date</label>
              <p>{{ formatDate(selectedPO.date) }}</p>
            </div>
            <div class="detail-item">
              <label>Recommended</label>
              <p>{{ selectedPO.recommended_by || '-' }}</p>
            </div>
            <div class="detail-item">
              <label>Status</label>
              <p><span :class="['status-badge-detail', selectedPO.status === 'Open' ? 'badge-open' : 'badge-closed']">{{ selectedPO.status || 'Open' }}</span></p>
            </div>
            <div class="detail-item" v-if="!isMobile">
              <label>Closed Date</label>
              <p>{{ formatDate(selectedPO.closed_date) || '-' }}</p>
            </div>
          </div>
          <div class="detail-actions" v-if="selectedPO.po_file_path">
            <button class="btn-primary" @click="downloadPOFile(selectedPO)">
              <i class="fas fa-download"></i> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading {{ totalRecords > 0 ? totalRecords : '' }} records...</p>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
} from "@/utils/toast.js";

export default {
  name: "PurchaseOrders",
  components: {
    Sidebar
  },
  data() {
    return {
      storageBaseUrl: 'https://employees.archenterprises.co.in/backend/storage/app/public/uploads/',
      isMobile: false,
      isSidebarVisible: true,
      filtersVisible: true,
      pos: [],
      filteredPOs: [],
      totalRecords: 0,
      loading: false,
      showUploadModal: false,
      showViewModal: false,
      selectedPO: null,
      editingPO: null,
      formPO: {
        po_number: '',
        company_name: '',
        po_type: '',
        value_of_po: '',
        date: '',
        recommended_by: '',
        po_file_path: '',
        status: 'Open',
        closed_date: ''
      },
      selectedFile: null,
      dragActive: false,
      submitting: false,
      uploadError: '',
      searchQuery: '',
      statusFilter: '',
      typeFilter: '',
      dateFilter: '',
      timeFilter: 'default',
      viewMode: 'table',
      sortField: 'date',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 20,
      gridCurrentPage: 1,
      gridItemsPerPage: 12,
      apiBaseUrl: 'https://employees.archenterprises.co.in'
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
    totalPOValue() {
      const total = this.filteredPOs.reduce((sum, po) => sum + (parseFloat(po.value_of_po) || 0), 0);
      return this.formatCurrency(total);
    },
    statusCounts() {
      return {
        Open: this.filteredPOs.filter(po => po.status !== 'Closed').length,
        Closed: this.filteredPOs.filter(po => po.status === 'Closed').length
      };
    },
    isFilterActive() {
      return this.searchQuery || this.statusFilter || this.typeFilter || this.dateFilter;
    },
    paginatedPOs() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredPOs.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredPOs.length / this.itemsPerPage);
    },
    paginatedGridPOs() {
      const start = (this.gridCurrentPage - 1) * this.gridItemsPerPage;
      const end = start + this.gridItemsPerPage;
      return this.filteredPOs.slice(start, end);
    },
    gridTotalPages() {
      return Math.ceil(this.filteredPOs.length / this.gridItemsPerPage);
    }
  },
  watch: {
    searchQuery() {
      this.applyFilters();
      this.resetPagination();
    },
    statusFilter() {
      this.applyFilters();
      this.resetPagination();
    },
    typeFilter() {
      this.applyFilters();
      this.resetPagination();
    },
    dateFilter() {
      this.applyFilters();
      this.resetPagination();
    },
    timeFilter() {
      this.applyFilters();
      this.resetPagination();
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadAllPOs();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    toggleFilters() {
      if (this.isMobile) {
        this.filtersVisible = !this.filtersVisible;
      }
    },
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status;
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    openCreateModal() {
      this.resetForm();
      this.showUploadModal = true;
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
      if (this.isMobile) {
        this.filtersVisible = false;
        this.viewMode = 'grid';
      } else {
        this.filtersVisible = true;
      }
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    resetPagination() {
      this.currentPage = 1;
      this.gridCurrentPage = 1;
    },
    setTimeFilter(filter) {
      this.timeFilter = filter;
    },
    
    async loadAllPOs() {
      this.loading = true;
      try {
        const response = await fetch(`${this.apiBaseUrl}/api/api/view-pos`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log("API Response from /api/view-pos:", data);
        
        let allPOs = [];
        if (data.status && data.data) {
          allPOs = data.data;
          this.totalRecords = data.total_records || data.data.length;
        } else if (Array.isArray(data)) {
          allPOs = data;
          this.totalRecords = data.length;
        } else if (data.data && Array.isArray(data.data)) {
          allPOs = data.data;
          this.totalRecords = data.data.length;
        } else {
          allPOs = [];
          this.totalRecords = 0;
        }
        
        this.pos = allPOs;
        
        console.log(`✅ Successfully loaded ${this.totalRecords} PO records from add_po table`);
        
        if (this.totalRecords === 0) {
          toastError("No PO records found in add_po table");
        } else {
          toastSuccess(`Loaded ${this.totalRecords} PO records`);
        }
        
        this.applyFilters();
      } catch(error) {
        console.error("❌ Error loading POs:", error);
        toastError(`Failed to load purchase orders: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },
    
    getFileUrl(po) {
      if (!po.po_file_path) return null;
      
      if (po.po_file_path.startsWith('http')) {
        return po.po_file_path;
      }
      
      let cleanPath = po.po_file_path.replace(/\/?(storage\/uploads\/)/, '');
      cleanPath = cleanPath.replace(/^\/+/, '');
      
      const finalUrl = `${this.storageBaseUrl}${cleanPath}`;
      
      return finalUrl;
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    
    formatCurrency(value) {
      if (!value && value !== 0) return '₹0';
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);
    },
    
    formatFileSize(bytes) {
      if (!bytes) return '0 KB';
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / 1048576).toFixed(1) + ' MB';
    },
    
    formatType(type) {
      const typeMap = {
        'Supply': 'Supply',
        'Service': 'Service',
        'AMC': 'AMC'
      };
      return typeMap[type] || type || '-';
    },
    
    getTypeIcon(type) {
      const icons = {
        'Supply': 'fas fa-box',
        'Service': 'fas fa-handshake',
        'AMC': 'fas fa-shield-alt'
      };
      return icons[type] || 'fas fa-file-invoice';
    },
    
    getTypeBadgeClass(type) {
      const classes = {
        'Supply': 'type-supply',
        'Service': 'type-service',
        'AMC': 'type-amc'
      };
      return classes[type] || '';
    },
    
    getTypeIconClass(type) {
      const classes = {
        'Supply': 'icon-supply',
        'Service': 'icon-service',
        'AMC': 'icon-amc'
      };
      return classes[type] || '';
    },
    
    applyFilters() {
      let filtered = [...this.pos];
      
      if (this.timeFilter === 'default' && !this.dateFilter) {
        const aprilDate = new Date(this.currentYear, 3, 1);
        filtered = filtered.filter(po => {
          if (!po.date) return false;
          const poDate = new Date(po.date);
          return poDate >= aprilDate;
        });
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(po => 
          (po.po_number && po.po_number.toLowerCase().includes(query)) ||
          (po.company_name && po.company_name.toLowerCase().includes(query)) ||
          (po.recommended_by && po.recommended_by.toLowerCase().includes(query))
        );
      }
      
      if (this.statusFilter) {
        filtered = filtered.filter(po => po.status === this.statusFilter);
      }
      
      if (this.typeFilter) {
        filtered = filtered.filter(po => po.po_type === this.typeFilter);
      }
      
      if (this.dateFilter) {
        const [year, month] = this.dateFilter.split('-');
        filtered = filtered.filter(po => {
          if (!po.date) return false;
          const poDate = new Date(po.date);
          return poDate.getFullYear() === parseInt(year) && 
                 (poDate.getMonth() + 1) === parseInt(month);
        });
      }
      
      filtered.sort((a, b) => {
        let valA = a[this.sortField];
        let valB = b[this.sortField];
        
        if (this.sortField === 'value_of_po') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        } else if (this.sortField === 'date' || this.sortField === 'closed_date') {
          valA = new Date(valA) || 0;
          valB = new Date(valB) || 0;
        } else {
          valA = (valA || '').toLowerCase();
          valB = (valB || '').toLowerCase();
        }
        
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      this.filteredPOs = filtered;
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.applyFilters();
    },
    
    clearFilters() {
      this.searchQuery = '';
      this.statusFilter = '';
      this.typeFilter = '';
      this.dateFilter = '';
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0];
      this.processFile(file);
    },
    
    handleFileDrop(event) {
      this.dragActive = false;
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    },
    
    processFile(file) {
      this.uploadError = '';
      if (!file) return;
      if (file.type !== 'application/pdf') {
        this.uploadError = 'Only PDF files are allowed.';
        this.selectedFile = null;
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        this.uploadError = 'File size must be less than 15MB.';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    },
    
    resetForm() {
      this.formPO = {
        po_number: '',
        company_name: '',
        po_type: '',
        value_of_po: '',
        date: '',
        recommended_by: '',
        po_file_path: '',
        status: 'Open',
        closed_date: ''
      };
      this.selectedFile = null;
      this.editingPO = null;
      this.uploadError = '';
    },
    
    editPO(po) {
      this.editingPO = po;
      this.formPO = {
        po_number: po.po_number || '',
        company_name: po.company_name || '',
        po_type: po.po_type || '',
        value_of_po: po.value_of_po || '',
        date: po.date ? po.date.split('T')[0] : '',
        recommended_by: po.recommended_by || '',
        po_file_path: po.po_file_path || '',
        status: po.status || 'Open',
        closed_date: po.closed_date ? po.closed_date.split('T')[0] : ''
      };
      this.showUploadModal = true;
    },
    
    async handlePOSubmit() {
      if (!this.formPO.po_number || !this.formPO.company_name || !this.formPO.po_type || 
          !this.formPO.value_of_po || !this.formPO.date || !this.formPO.recommended_by) {
        toastError("Please fill in all required fields");
        return;
      }
      
      this.submitting = true;
      
      const formData = new FormData();
      formData.append("po_number", this.formPO.po_number);
      formData.append("company_name", this.formPO.company_name);
      formData.append("po_type", this.formPO.po_type);
      formData.append("value_of_po", this.formPO.value_of_po);
      formData.append("date", this.formPO.date);
      formData.append("recommended_by", this.formPO.recommended_by);
      formData.append("status", this.formPO.status);
      if (this.formPO.closed_date) {
        formData.append("closed_date", this.formPO.closed_date);
      }
      
      if (this.selectedFile) {
        formData.append("file", this.selectedFile);
      }
      
      try {
        let url = `${this.apiBaseUrl}/api/view-pos`;
        let method = "POST";
        
        if (this.editingPO) {
          url = `${this.apiBaseUrl}/api/view-pos/${this.editingPO.id}`;
          method = "POST";
          formData.append("_method", "PUT");
        }
        
        const res = await fetch(url, { method, body: formData });
        const data = await res.json();
        
        if (data.status === true || data.status === 200) {
          await this.loadAllPOs();
          this.closeModal();
          toastSuccess(this.editingPO ? "PO Updated Successfully" : "PO Created Successfully");
        } else {
          toastError(data.message || "Operation failed");
        }
      } catch(error) {
        console.error("Submit error:", error);
        toastError("Operation failed");
      } finally {
        this.submitting = false;
      }
    },
    
    async deletePO(po) {
      if (confirm(`Are you sure you want to delete PO "${po.po_number}"? This action cannot be undone.`)) {
        try {
          const response = await fetch(`${this.apiBaseUrl}/api/view-pos/${po.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const data = await response.json();
          
          if (data.status === true || data.status === 200) {
            await this.loadAllPOs();
            toastSuccess('PO deleted successfully');
          } else {
            toastError(data.message || 'Failed to delete PO');
          }
        } catch(error) {
          console.error("Delete error:", error);
          toastError('Failed to delete PO. Please try again.');
        }
      }
    },
    
    viewPODetails(po) {
      this.selectedPO = po;
      this.showViewModal = true;
    },
    
    downloadPOFile(po) {
      const fileUrl = this.getFileUrl(po);
      console.log("Downloading from URL:", fileUrl);
      
      if (fileUrl) {
        window.open(fileUrl, '_blank');
        toastSuccess(`Opening: ${po.po_number}`);
      } else {
        toastError('File not available for this PO');
      }
    },
    
    closeModal() {
      this.showUploadModal = false;
      this.showViewModal = false;
      this.resetForm();
      this.uploadError = '';
      this.selectedFile = null;
      this.dragActive = false;
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  --primary-color: #2a5298;
  --success: #10b981;
  --open-color: #10b981;
  --closed-color: #6b7280;
  --supply-color: #3b82f6;
  --service-color: #8b5cf6;
  --amc-color: #f59e0b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f4f7fc;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.sop-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
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
  color: var(--dark, #1a1a2e);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark, #1a1a2e);
}

.mobile-title i {
  color: var(--primary-color);
}

.mobile-add-btn {
  background: var(--primary);
  color: white;
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

.mobile-add-btn:active {
  transform: scale(0.9);
}

/* Header styles */
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:active {
  transform: scale(0.97);
}

.stat-card i {
  font-size: 32px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Time Filter Section */
.time-filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  justify-content: flex-end;
}

.time-filter-btn {
  padding: 10px 20px;
  background: #f1f5f9;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-filter-btn:active {
  transform: scale(0.97);
}

.time-filter-btn i {
  font-size: 14px;
}

.time-filter-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(42, 82, 152, 0.2);
}

.btn-text {
  display: inline;
}

/* Filters Section */
.filters-section {
  background: #f8fafc;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 28px;
  border: 1px solid #e2e8f0;
}

.filter-toggle-btn {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: var(--dark, #1a1a2e);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  width: 100%;
  justify-content: center;
}

.filter-toggle-btn:active {
  transform: scale(0.97);
}

.filter-toggle-btn .fa-chevron-down {
  transition: transform 0.3s ease;
}

.filter-toggle-btn .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.filter-group-container {
  transition: all 0.3s ease;
}

.filter-group-container.filters-hidden {
  display: none;
}

.search-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.search-wrapper i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select, .filter-date {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  min-width: 130px;
}

.clear-filters-btn {
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 30px;
  font-size: 12px;
  cursor: pointer;
  color: #64748b;
  transition: 0.2s;
}

.clear-filters-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
  justify-content: space-between;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-count-mobile {
  background: var(--primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 4px;
}

.view-toggle {
  display: flex;
  gap: 6px;
}

.view-btn {
  background: #f1f5f9;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  color: #64748b;
  transition: 0.2s;
  font-size: 13px;
}

.view-btn:active {
  transform: scale(0.95);
}

.view-btn.active {
  background: var(--primary);
  color: #ffffff;
}

/* Table View */
.table-wrapper {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: white;
}

.table-container {
  min-width: 1000px;
  overflow-x: auto;
}

.po-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.po-data-table th {
  text-align: left;
  padding: 14px 12px;
  background: #f8fafc;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
}

.po-data-table th:hover {
  background: #f1f5f9;
}

.po-data-table th i {
  margin-left: 6px;
  font-size: 11px;
  color: #94a3b8;
}

.po-data-table td {
  padding: 12px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.po-number {
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
}

.company-name {
  font-weight: 500;
  color: #1f2937;
}

.amount {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
}

/* Type Badges */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 500;
}

.type-supply {
  background: #dbeafe;
  color: #1e40af;
}

.type-service {
  background: #ede9fe;
  color: #6d28d9;
}

.type-amc {
  background: #fef3c7;
  color: #b45309;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 500;
}

.badge-open {
  background: #d1fae5;
  color: #065f46;
}

.badge-open i {
  font-size: 8px;
  color: #10b981;
}

.badge-closed {
  background: #f1f5f9;
  color: #475569;
}

.badge-closed i {
  font-size: 10px;
}

/* File Link Button */
.file-link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: 0.2s;
}

.file-link-btn:hover {
  background: #eff6ff;
  color: #2563eb;
}

.no-file {
  color: #9ca3af;
  font-size: 12px;
}

/* Table Actions */
.table-actions {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.action-icon {
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 13px;
}

.action-icon:active {
  transform: scale(0.9);
}

.view-icon {
  color: #3b82f6;
}
.view-icon:hover {
  background: #eff6ff;
}

.edit-icon {
  color: #f59e0b;
}
.edit-icon:hover {
  background: #fef3c7;
}

.delete-icon {
  color: #ef4444;
}
.delete-icon:hover {
  background: #fee2e2;
}

/* Empty State */
.empty-table-row td {
  text-align: center;
  padding: 60px 20px;
}

.empty-table-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-table-content i {
  font-size: 48px;
  color: #cbd5e1;
}

.empty-table-content p {
  color: #64748b;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
}

.page-btn {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  color: #475569;
}

.page-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #475569;
}

/* Grid View */
.pos-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.po-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.po-card-premium.mobile-card {
  border-radius: 16px;
}

.po-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.12);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.card-accent.status-open { background: var(--open-color); }
.card-accent.status-closed { background: var(--closed-color); }

.po-header {
  display: flex;
  padding: 18px;
  gap: 14px;
  align-items: flex-start;
  background: #fafbfc;
  border-bottom: 1px solid #eef2f6;
}

.po-header.mobile-header {
  padding: 14px;
  flex-wrap: wrap;
}

.po-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.po-icon.icon-supply { background: #dbeafe; color: #2563eb; }
.po-icon.icon-service { background: #ede9fe; color: #6d28d9; }
.po-icon.icon-amc { background: #fef3c7; color: #d97706; }

.po-title-wrap {
  flex: 1;
}

.po-title-wrap h3 {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.po-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #6c757d;
}

.po-meta i {
  margin-right: 4px;
}

.po-actions {
  display: flex;
  gap: 8px;
}

.po-actions.mobile-actions {
  gap: 4px;
}

.action-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
}

.action-btn:active {
  transform: scale(0.9);
}

.view-btn { color: #3b82f6; }
.view-btn:hover { background: #e0e7ff; }
.download-btn { color: #10b981; }
.download-btn:hover { background: #d1fae5; }
.edit-btn { color: #f59e0b; }
.edit-btn:hover { background: #fed7aa; }
.delete-btn { color: #ef4444; }
.delete-btn:hover { background: #fee2e2; }

.po-details {
  padding: 14px 18px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

.po-details.mobile-details {
  padding: 12px 14px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-label {
  color: #6b7280;
}

.detail-value {
  font-weight: 500;
  color: #1f2937;
}

.detail-value.highlight {
  color: var(--primary-color);
  font-weight: 700;
}

.po-footer {
  padding: 12px 18px;
  display: flex;
  gap: 12px;
  background: #f9fafb;
  flex-wrap: wrap;
  align-items: center;
}

.po-footer.mobile-footer {
  padding: 10px 14px;
  gap: 8px;
}

.badge-status, .badge-type {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.badge-type {
  background: #eef2ff;
  color: #1e40af;
}

.card-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

/* Empty State Premium */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 28px;
}

.empty-state-premium.empty-mobile {
  padding: 40px 16px;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-mobile .empty-state-premium i {
  font-size: 48px;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container-premium {
  background: white;
  width: 90%;
  max-width: 600px;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.modal-container-premium.mobile-modal {
  max-width: 95%;
  border-radius: 24px;
}

.modal-container-premium.modal-large {
  max-width: 700px;
}

.modal-container-premium.modal-detail {
  max-width: 550px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.mobile-modal .modal-header {
  padding: 16px 20px;
}

.modal-header h2 {
  font-size: 20px;
}

.mobile-modal .modal-header h2 {
  font-size: 17px;
}

.modal-icon {
  font-size: 28px;
  color: var(--primary-color);
}

.close-modal {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

.mobile-modal .modal-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.mobile-modal .form-group label {
  font-size: 13px;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  font-family: inherit;
  transition: 0.2s;
}

.mobile-modal .form-group input,
.mobile-modal .form-group select {
  font-size: 16px;
  padding: 10px 12px;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
}

.form-row {
  display: flex;
  gap: 14px;
}

.form-row.mobile-row {
  flex-direction: column;
  gap: 0;
}

.half { flex: 1; }

.file-dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  background: #fafcff;
  transition: 0.2s;
  cursor: pointer;
}

.file-dropzone.mobile-dropzone {
  padding: 20px;
}

.drag-over {
  border-color: var(--primary-color);
  background: #eff6ff;
}

.browse-link {
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
}

.file-selected {
  color: #10b981;
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions.mobile-actions {
  flex-direction: column;
}

.modal-actions.mobile-actions button {
  width: 100%;
  justify-content: center;
  padding: 14px;
}

.btn-primary, .btn-secondary {
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #1e293b;
}

/* Detail View */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-grid.mobile-grid {
  grid-template-columns: 1fr;
  gap: 14px;
}

.detail-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.detail-item label {
  font-size: 12px;
  color: #6b7280;
  display: block;
  margin-bottom: 6px;
}

.detail-item p {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.detail-item p.highlight {
  color: var(--primary-color);
  font-size: 18px;
}

.status-badge-detail {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 30px;
  font-size: 12px;
}

.detail-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.loading-overlay p {
  color: white;
  margin-top: 20px;
  font-size: 14px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .main-content { 
    flex-direction: column; 
    padding: 12px; 
  }
  .sop-board-premium { 
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
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .stat-card {
    padding: 14px;
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }
  
  .stat-card i {
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 16px;
  }
  
  .stat-label {
    font-size: 10px;
  }
  
  .time-filter-section {
    flex-direction: column;
  }
  
  .time-filter-btn {
    width: 100%;
    justify-content: center;
  }
  
  .btn-text {
    display: inline;
  }
  
  .filter-toggle-btn {
    display: flex;
  }
  
  .filter-group-container.filters-hidden {
    display: none;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select, .filter-date {
    width: 100%;
    min-width: auto;
  }
  
  .pos-grid-premium {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .view-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .table-wrapper {
    display: none;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .page-info {
    font-size: 12px;
  }
  
  .modal-container-premium.mobile-modal {
    max-width: 95%;
    border-radius: 20px;
  }
  
  .form-row.mobile-row {
    flex-direction: column;
  }
  
  .detail-grid.mobile-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions.mobile-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }
  
  .sop-board-premium {
    padding: 12px;
    border-radius: 16px;
  }
  
  .mobile-title {
    font-size: 16px;
  }
  
  .mobile-add-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .stat-card {
    padding: 10px;
  }
  
  .stat-card i {
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 14px;
  }
  
  .time-filter-btn {
    font-size: 12px;
    padding: 8px 14px;
  }
  
  .po-card-premium.mobile-card {
    border-radius: 14px;
  }
  
  .po-header.mobile-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .po-actions.mobile-actions {
    justify-content: flex-end;
  }
  
  .po-details.mobile-details {
    padding: 10px 12px;
  }
  
  .detail-row {
    font-size: 12px;
    flex-wrap: wrap;
  }
  
  .po-footer.mobile-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .card-actions {
    margin-left: 0;
    justify-content: center;
  }
  
  .empty-state-premium i {
    font-size: 40px;
  }
  
  .empty-state-premium h4 {
    font-size: 15px;
  }
  
  .search-input {
    font-size: 15px;
    padding: 10px 12px 10px 36px;
  }
  
  .file-dropzone.mobile-dropzone {
    padding: 16px;
    font-size: 13px;
  }
}
</style>