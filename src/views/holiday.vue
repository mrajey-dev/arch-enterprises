<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="content">
        <div class="header-section">
          <h2>
            <i class="fas fa-calendar-alt"></i> Holiday Management
          </h2>
          <button class="btn btn-primary attractive-btn" @click="openAddModal">
            <i class="fas fa-plus-circle"></i> Add New Holiday
          </button>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <div class="filter-group">
            <label>
              <i class="fas fa-calendar"></i> Year
            </label>
            <select v-model="filterYear" @change="fetchHolidays">
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>
              <i class="fas fa-tag"></i> Type
            </label>
            <select v-model="filterType" @change="fetchHolidays">
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <!-- <option value="company">Company</option>
              <option value="optional">Optional</option> -->
            </select>
          </div>
          <div class="filter-group">
            <label>
              <i class="fas fa-search"></i> Search
            </label>
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="filterHolidays"
              placeholder="Search holidays..."
            />
          </div>
        </div>

        <!-- Holiday Table -->
        <div class="table-wrapper">
          <table class="holiday-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Holiday Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Recurring</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="7" class="text-center">
                  <i class="fas fa-spinner fa-spin"></i> Loading holidays...
                </td>
              </tr>
              <tr v-else-if="filteredHolidays.length === 0">
                <td colspan="7" class="text-center">
                  <i class="fas fa-calendar-times"></i> No holidays found
                </td>
              </tr>
              <tr v-for="(holiday, index) in filteredHolidays" :key="holiday.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <strong>{{ holiday.name }}</strong>
                  <span v-if="holiday.description" class="holiday-desc">{{ holiday.description }}</span>
                </td>
                <td>
                  <span v-if="holiday.is_recurring">
                    <i class="fas fa-sync-alt" title="Recurring"></i>
                    {{ holiday.month_day }}
                  </span>
                  <span v-else>
                    {{ formatDate(holiday.date) }}
                  </span>
                </td>
                <td>
                  <span class="type-badge" :class="holiday.type">
                    <i :class="getTypeIcon(holiday.type)"></i>
                    {{ capitalize(holiday.type) }}
                  </span>
                </td>
                <td>
                  <span class="recurring-badge" :class="holiday.is_recurring ? 'yes' : 'no'">
                    {{ holiday.is_recurring ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="holiday.is_active ? 'active' : 'inactive'">
                    {{ holiday.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-info" @click="openEditModal(holiday)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" @click="confirmDelete(holiday)" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" @click="toggleStatus(holiday)" :title="holiday.is_active ? 'Deactivate' : 'Activate'">
                      <i :class="holiday.is_active ? 'fas fa-pause' : 'fas fa-play'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-section" v-if="totalPages > 1">
          <button @click="prevPage" :disabled="currentPage === 1">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Holiday Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card">
        <h3 class="modal-title">
          <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
          {{ isEditing ? 'Edit Holiday' : 'Add New Holiday' }}
        </h3>
        
        <form @submit.prevent="saveHoliday" class="attractive-form">
          <div class="form-row">
            <div class="input-group">
              <label for="holidayName">
                <i class="fas fa-tag"></i> Holiday Name *
              </label>
              <input 
                type="text" 
                id="holidayName" 
                v-model="form.name" 
                required 
                placeholder="Enter holiday name"
              />
            </div>
            <div class="input-group">
              <label for="holidayType">
                <i class="fas fa-calendar-alt"></i> Type *
              </label>
              <select id="holidayType" v-model="form.type" required>
                <option value="public">Public</option>
                <!-- <option value="company">Company</option>
                <option value="optional">Optional</option> -->
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label>
                <i class="fas fa-sync-alt"></i> Recurring Holiday
              </label>
              <div class="toggle-switch">
                <input type="checkbox" id="isRecurring" v-model="form.is_recurring" />
                <label for="isRecurring">
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                  <span class="toggle-label">{{ form.is_recurring ? 'Yes' : 'No' }}</span>
                </label>
              </div>
            </div>
            <div class="input-group">
              <label for="holidayDate">
                <i class="fas fa-calendar-day"></i> 
                {{ form.is_recurring ? 'Month-Day (MM-DD)' : 'Date' }} *
              </label>
              <input 
                v-if="!form.is_recurring"
                type="date" 
                id="holidayDate" 
                v-model="form.date" 
                required 
              />
              <input 
                v-else
                type="text" 
                id="holidayDate" 
                v-model="form.month_day" 
                required 
                placeholder="MM-DD (e.g., 01-26)"
                pattern="\d{2}-\d{2}"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="input-group full-width">
              <label for="holidayDescription">
                <i class="fas fa-align-left"></i> Description
              </label>
              <textarea 
                id="holidayDescription" 
                v-model="form.description" 
                placeholder="Enter holiday description (optional)"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label>
                <i class="fas fa-power-off"></i> Active Status
              </label>
              <div class="toggle-switch">
                <input type="checkbox" id="isActive" v-model="form.is_active" />
                <label for="isActive">
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                  <span class="toggle-label">{{ form.is_active ? 'Active' : 'Inactive' }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-buttons">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <i :class="isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
              {{ isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
      <div class="modal-card delete-modal">
        <div class="delete-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="modal-title">Confirm Delete</h3>
        <p class="delete-message">
          Are you sure you want to delete "<strong>{{ deleteHoliday?.name }}</strong>"?
          <br />
          <span class="text-danger">This action cannot be undone!</span>
        </p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" @click="closeDeleteModal">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="btn btn-danger" @click="deleteHolidayConfirm" :disabled="isDeleting">
            <i :class="isDeleting ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <footer class="footer">
      &copy; 2025 Arch Enterprises. All rights reserved.
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      isEditing: false,
      showModal: false,
      showDeleteModal: false,
      
      // Filters
      filterYear: new Date().getFullYear(),
      filterType: 'all',
      searchQuery: '',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Data
      holidays: [],
      filteredHolidays: [],
      deleteHoliday: null,
      
      // Form
      form: {
        id: null,
        name: '',
        date: '',
        month_day: '',
        is_recurring: false,
        type: 'public',
        description: '',
        is_active: true
      },
      
      // Options
      yearOptions: []
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredHolidays.length / this.itemsPerPage)
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.generateYearOptions();
    this.fetchHolidays();
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    
    generateYearOptions() {
      const currentYear = new Date().getFullYear();
      for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        this.yearOptions.push(year);
      }
    },
    
    async fetchHolidays() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'https://employees.archenterprises.co.in/api/api/holidays/all',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data && response.data.success) {
          this.holidays = response.data.data;
          this.filterHolidays();
          toastInfo(`Loaded ${this.holidays.length} holidays`);
        } else {
          toastError('Failed to fetch holidays');
        }
      } catch (error) {
        console.error('Error fetching holidays:', error);
        toastError('Error loading holidays');
      } finally {
        this.isLoading = false;
      }
    },
    
    filterHolidays() {
      let filtered = [...this.holidays];
      
      // Filter by year
      if (this.filterYear) {
        filtered = filtered.filter(h => {
          if (h.is_recurring) {
            return true; // Recurring holidays show for all years
          }
          if (h.date) {
            return new Date(h.date).getFullYear() === this.filterYear;
          }
          return false;
        });
      }
      
      // Filter by type
      if (this.filterType !== 'all') {
        filtered = filtered.filter(h => h.type === this.filterType);
      }
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(h => 
          h.name.toLowerCase().includes(query) ||
          (h.description && h.description.toLowerCase().includes(query))
        );
      }
      
      // Sort by date (recurring first, then by date)
      filtered.sort((a, b) => {
        if (a.is_recurring && !b.is_recurring) return -1;
        if (!a.is_recurring && b.is_recurring) return 1;
        if (a.is_recurring) {
          return a.month_day.localeCompare(b.month_day);
        }
        return new Date(a.date) - new Date(b.date);
      });
      
      this.filteredHolidays = filtered;
      this.currentPage = 1;
    },
    
    getPaginatedHolidays() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredHolidays.slice(start, end);
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    openAddModal() {
      this.isEditing = false;
      this.form = {
        id: null,
        name: '',
        date: '',
        month_day: '',
        is_recurring: false,
        type: 'public',
        description: '',
        is_active: true
      };
      this.showModal = true;
    },
    
    openEditModal(holiday) {
      this.isEditing = true;
      this.form = {
        id: holiday.id,
        name: holiday.name,
        date: holiday.date || '',
        month_day: holiday.month_day || '',
        is_recurring: holiday.is_recurring || false,
        type: holiday.type || 'public',
        description: holiday.description || '',
        is_active: holiday.is_active !== undefined ? holiday.is_active : true
      };
      this.showModal = true;
    },
    
    closeModal() {
      this.showModal = false;
      this.isSaving = false;
    },
    
    async saveHoliday() {
      // Validation
      if (!this.form.name.trim()) {
        toastWarning('Holiday name is required');
        return;
      }
      
      if (this.form.is_recurring) {
        if (!this.form.month_day || !this.form.month_day.match(/^\d{2}-\d{2}$/)) {
          toastWarning('Please enter date in MM-DD format (e.g., 01-26)');
          return;
        }
      } else {
        if (!this.form.date) {
          toastWarning('Date is required');
          return;
        }
      }
      
      this.isSaving = true;
      try {
        const token = localStorage.getItem('token');
        const url = this.isEditing 
          ? `https://employees.archenterprises.co.in/api/api/holidays/${this.form.id}`
          : 'https://employees.archenterprises.co.in/api/api/holidays';
        
        const method = this.isEditing ? 'put' : 'post';
        
        const payload = {
          name: this.form.name.trim(),
          type: this.form.type,
          description: this.form.description || '',
          is_active: this.form.is_active,
          is_recurring: this.form.is_recurring
        };
        
        if (this.form.is_recurring) {
          payload.month_day = this.form.month_day;
          payload.date = null;
        } else {
          payload.date = this.form.date;
          payload.month_day = null;
        }
        
        const response = await axios[method](url, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.success) {
          toastSuccess(this.isEditing ? 'Holiday updated successfully' : 'Holiday added successfully');
          this.closeModal();
          this.fetchHolidays();
        } else {
          toastError('Failed to save holiday');
        }
      } catch (error) {
        console.error('Error saving holiday:', error);
        if (error.response && error.response.data && error.response.data.message) {
          toastError('Something went wrong');
        } else {
          toastError('Error saving holiday');
        }
      } finally {
        this.isSaving = false;
      }
    },
    
    confirmDelete(holiday) {
      this.deleteHoliday = holiday;
      this.showDeleteModal = true;
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteHoliday = null;
      this.isDeleting = false;
    },
    
    async deleteHolidayConfirm() {
      if (!this.deleteHoliday) return;
      
      this.isDeleting = true;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(
          `https://employees.archenterprises.co.in/api/api/holidays/${this.deleteHoliday.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data && response.data.success) {
          toastSuccess('Holiday deleted successfully');
          this.closeDeleteModal();
          this.fetchHolidays();
        } else {
          toastError('Failed to delete holiday');
        }
      } catch (error) {
        console.error('Error deleting holiday:', error);
        toastError('Error deleting holiday');
      } finally {
        this.isDeleting = false;
      }
    },
    
    async toggleStatus(holiday) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `https://employees.archenterprises.co.in/api/api/holidays/${holiday.id}`,
          {
            ...holiday,
            is_active: !holiday.is_active
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data && response.data.success) {
          toastSuccess(`Holiday ${holiday.is_active ? 'deactivated' : 'activated'} successfully`);
          this.fetchHolidays();
        } else {
          toastError('Failed to update holiday status');
        }
      } catch (error) {
        console.error('Error toggling holiday status:', error);
        toastError('Error updating holiday status');
      }
    },
    
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    
    getTypeIcon(type) {
      const icons = {
        public: 'fas fa-globe',
        company: 'fas fa-building',
        optional: 'fas fa-calendar-check'
      };
      return icons[type] || 'fas fa-calendar';
    },
    
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    logout() {
      const token = localStorage.getItem('token');
      axios
        .post(
          'https://employees.archenterprises.co.in/api/api/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .finally(() => {
          localStorage.removeItem('token');
          this.$router.push('/auth');
        });
    }
  },
  watch: {
    filterYear() {
      this.filterHolidays();
    },
    filterType() {
      this.filterHolidays();
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f4f6f9;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
}

.content {
  flex: 1;
  background-color: white;
  padding: 25px 30px;
  border-radius: 15px;
  box-shadow: 0 5px 30px rgba(0,0,0,0.08);
  overflow-x: auto;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-section h2 {
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
  font-size: 22px;
}

.header-section h2 i {
  color: #007bff;
  margin-right: 10px;
}

/* Filters Section */
.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 10px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 150px;
}

.filter-group label {
  font-weight: 600;
  font-size: 13px;
  color: #495057;
}

.filter-group label i {
  margin-right: 5px;
  color: #007bff;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
}

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
}

.holiday-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
}

.holiday-table th {
  background-color: #f8f9fa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
  color: #2c3e50;
  border-bottom: 2px solid #dee2e6;
  font-size: 14px;
}

.holiday-table td {
  padding: 12px 16px;
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.holiday-table tbody tr {
  transition: all 0.2s ease;
}

.holiday-table tbody tr:hover {
  background-color: #f8f9fa;
  transform: translateX(3px);
}

.holiday-desc {
  display: block;
  font-size: 12px;
  color: #6c757d;
  font-weight: normal;
  margin-top: 3px;
}

/* Badges */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.type-badge.public {
  background-color: #d4edda;
  color: #155724;
}

.type-badge.company {
  background-color: #cce5ff;
  color: #004085;
}

.type-badge.optional {
  background-color: #fff3cd;
  color: #856404;
}

.type-badge i {
  font-size: 11px;
}

.recurring-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.recurring-badge.yes {
  background-color: #d4edda;
  color: #155724;
}

.recurring-badge.no {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 13px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.4);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220,53,69,0.4);
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
  transform: translateY(-2px);
}

.attractive-btn {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.attractive-btn:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.25);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.pagination-section button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-section button:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-section button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-section span {
  font-weight: 600;
  color: #2c3e50;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 15px;
}

.modal-card {
  background-color: white;
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  padding: 35px 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  max-height: 90vh;
  overflow-y: auto;
  animation: slideDown 0.3s ease forwards;
}

.modal-card::-webkit-scrollbar {
  width: 6px;
}

.modal-card::-webkit-scrollbar-thumb {
  background: #007bff;
  border-radius: 10px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.modal-title i {
  color: #007bff;
  margin-right: 10px;
}

/* Delete Modal */
.delete-modal {
  max-width: 450px;
  text-align: center;
}

.delete-icon {
  font-size: 60px;
  color: #dc3545;
  margin-bottom: 20px;
}

.delete-message {
  font-size: 16px;
  margin-bottom: 25px;
  color: #495057;
}

.text-danger {
  color: #dc3545;
}

/* Form */
.attractive-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.form-row .input-group {
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
}

.input-group.full-width {
  flex: 1 1 100%;
}

.input-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group label i {
  color: #007bff;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
}

.input-group textarea {
  resize: vertical;
  font-family: inherit;
}

/* Toggle Switch */
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 5px;
}

.toggle-switch input[type="checkbox"] {
  display: none;
}

.toggle-switch label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.toggle-track {
  display: inline-block;
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 30px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-switch input:checked + label .toggle-track {
  background: #007bff;
}

.toggle-switch input:checked + label .toggle-thumb {
  left: 27px;
}

.toggle-label {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
}

/* Modal Buttons */
.modal-buttons {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.modal-buttons .btn {
  flex: 1;
  justify-content: center;
  padding: 12px;
  font-size: 15px;
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
}

/* Text Center */
.text-center {
  text-align: center;
  color: #6c757d;
  padding: 30px 0;
}

.text-center i {
  font-size: 20px;
  margin-right: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 10px;
  }
  
  .content {
    padding: 15px;
  }
  
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .form-row .input-group {
    flex: 1 1 100%;
  }
  
  .modal-card {
    padding: 25px 20px;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .holiday-table {
    font-size: 13px;
  }
  
  .holiday-table th,
  .holiday-table td {
    padding: 8px 10px;
  }
}

@media (max-width: 480px) {
  .modal-card {
    padding: 20px 15px;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .btn {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>