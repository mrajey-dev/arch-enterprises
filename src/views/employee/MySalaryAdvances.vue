<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-hand-holding-usd"></i>
            </div>
            <div>
              <h1>Salary Advance Management</h1>
              <p class="subtitle-modern">Manage employee salary advance requests (HR View)</p>
            </div>
          </div>
          <!-- <button class="new-request-btn" @click="openRequestModal">
            <i class="fas fa-plus-circle"></i>
            <span>New Salary Advance</span>
          </button> -->
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
           <!-- <div class="stat-card completed">
            <i class="fas fa-check-double"></i>
            <div class="stat-info">
              <span class="stat-value">{{ completedCount }}</span>
              <span class="stat-label">Disbursed</span>
            </div>
          </div> -->
          <div class="stat-card pending">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          
         
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
         
          <div class="filter-group">
            <i class="fas fa-filter"></i>
            <select v-model="statusFilter" class="filter-select">
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Disbursed</option>
            </select>
          </div>
          <div class="filter-group">
            <i class="fas fa-calendar"></i>
            <input type="month" v-model="monthFilter" class="filter-input" />
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loadingRequests" class="loading-container">
          <div class="spinner"></div>
          <p>Loading salary advances...</p>
        </div>

        <!-- Requests Table -->
        <div v-else class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>All Salary Advance Requests</span>
            </div>
            <div class="table-info">
              <i class="fas fa-file-alt"></i>
              <span>{{ filteredAdvances.length }} records</span>
            </div>
          </div>

          <div class="table-container">
            <table class="request-table-premium">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Date Submitted</th>
                  <th>Repayment</th>
                  <!-- <th>Status</th> -->
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(advance, index) in filteredAdvances" :key="advance.id">
                  <td class="serial-number">{{ index + 1 }}</td>
                  <td class="employee-cell">
                    <div class="employee-info">
                      <div class="employee-avatar" :style="{ background: getAvatarColor(advance.user_name) }">
                        {{ getInitials(advance.user_name) }}
                      </div>
                      <div class="employee-details">
                        <span class="employee-name">{{ advance.user_name || 'Unknown' }}</span>
                        <span class="employee-email">{{ advance.user_email || '' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="dept-cell">
                    <span class="dept-badge">{{ advance.department || '—' }}</span>
                  </td>
                  <td class="amount-cell">
                    <span class="amount-value">{{ formatCurrency(advance.amount) }}</span>
                  </td>
                  <td class="reason-cell" :title="advance.reason">
                    {{ truncateText(advance.reason, 50) }}
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i> {{ formatDate(advance.created_at) }}
                  </td>
                  <td class="repayment-cell">
                    <span class="repayment-badge">
                      {{ advance.repayment_months || 1 }} month(s)
                    </span>
                    <span class="emi-amount" v-if="advance.amount">
                      ({{ formatCurrency(advance.amount / (advance.repayment_months || 1)) }}/m)
                    </span>
                  </td>
                  <td>
                    <select 
                      v-model="advance.status"
                      @change="changeStatus(advance)"
                      :class="['status-dropdown-premium', getStatusClass(advance.status)]" disabled
                    >
                      <option value="Pending">🕐 Pending</option>
                      <option value="Completed">💰 Disbursed</option>
                     
                    </select>
                  </td>
                  <td class="actions-cell">
                    <button class="action-btn view" @click="viewDetails(advance)" title="View Details">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn note" @click="addNote(advance)" title="Add Note">
                      <i class="fas fa-sticky-note"></i>
                    </button>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="filteredAdvances.length === 0" class="empty-row">
                  <td colspan="9">
                    <div class="empty-state-premium">
                      <i class="fas fa-hand-holding-usd"></i>
                      <h4>No Salary Advances Found</h4>
                      <p>Click "New Salary Advance" to create a request for an employee</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- Request Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title">
            <i class="fas fa-hand-holding-usd"></i>
            <h3>Create Salary Advance Request</h3>
          </div>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitRequest" class="salary-form">
            <!-- Employee Selection Dropdown -->
            <div class="form-group">
              <label><i class="fas fa-user"></i> Select Employee *</label>
              <div class="employee-select-wrapper">
                <select v-model="form.user_id" class="form-select" required>
                  <option value="">-- Select Employee --</option>
                  <option 
                    v-for="employee in employees" 
                    :key="employee.id" 
                    :value="employee.id"
                  >
                    {{ employee.name }} ({{ employee.email }}) - {{ employee.department || 'N/A' }}
                  </option>
                </select>
              </div>
              <p class="form-hint">Select the employee who is requesting the salary advance</p>
            </div>

            <!-- Selected Employee Preview -->
            <div v-if="selectedEmployee" class="employee-preview">
              <div class="preview-avatar">
                {{ getInitials(selectedEmployee.name) }}
              </div>
              <div class="preview-info">
                <div class="preview-name">{{ selectedEmployee.name }}</div>
                <div class="preview-details">
                  <span><i class="fas fa-envelope"></i> {{ selectedEmployee.email }}</span>
                  <span v-if="selectedEmployee.department"><i class="fas fa-building"></i> {{ selectedEmployee.department }}</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label><i class="fas fa-rupee-sign"></i> Amount Required *</label>
                <div class="amount-input-wrapper">
                  <span class="currency-symbol">₹</span>
                  <input 
                    type="number" 
                    v-model="form.amount" 
                    class="form-input"
                    placeholder="Enter amount"
                    min="1000"
                    max="500000"
                    required
                  />
                </div>
                <p class="form-hint">Min: ₹1,000 | Max: ₹5,00,000</p>
              </div>

              <div class="form-group half">
                <label><i class="fas fa-calendar-week"></i> Repayment Tenure *</label>
                <select v-model="form.repayment_months" class="form-select" required>
                  <option value="1">1 month</option>
                  <option value="2">2 months</option>
                  <option value="3">3 months</option>
                  <option value="4">4 months</option>
                  <option value="5">5 months</option>
                  <option value="6">6 months</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label><i class="fas fa-file-alt"></i> Reason / Purpose *</label>
              <textarea 
                v-model="form.reason" 
                class="form-textarea"
                placeholder="Please provide a detailed reason for the salary advance request..."
                rows="4"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label><i class="fas fa-info-circle"></i> EMI Calculation</label>
              <div class="emi-preview" v-if="form.amount && form.repayment_months">
                <div class="emi-item">
                  <span>Monthly Deduction:</span>
                  <strong>{{ formatCurrency(form.amount / form.repayment_months) }}</strong>
                </div>
                <div class="emi-item">
                  <span>Total Repayment:</span>
                  <strong>{{ formatCurrency(form.amount) }}</strong>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-submit" :disabled="submitting">
                <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                <span v-else>Submit Request</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Details Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-container view-modal">
        <div class="modal-header">
          <div class="modal-title">
            <i class="fas fa-receipt"></i>
            <h3>Salary Advance Details</h3>
          </div>
          <button class="modal-close" @click="closeViewModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" v-if="selectedAdvance">
          <div class="detail-card">
            <div class="detail-header">
              <div class="detail-employee">
                <div class="detail-avatar">{{ getInitials(selectedAdvance.user_name) }}</div>
                <div>
                  <h4>{{ selectedAdvance.user_name }}</h4>
                  <p>{{ selectedAdvance.user_email }}</p>
                </div>
              </div>
              <span :class="['detail-status', getStatusClass(selectedAdvance.status)]">
                {{ selectedAdvance.status }}
              </span>
            </div>
            
            <div class="detail-grid">
              <div class="detail-item">
                <label>Amount Requested</label>
                <div class="detail-value amount">{{ formatCurrency(selectedAdvance.amount) }}</div>
              </div>
              <div class="detail-item">
                <label>Repayment Tenure</label>
                <div class="detail-value">{{ selectedAdvance.repayment_months || 1 }} months</div>
              </div>
              <div class="detail-item">
                <label>Monthly EMI</label>
                <div class="detail-value">{{ formatCurrency((selectedAdvance.amount || 0) / (selectedAdvance.repayment_months || 1)) }}</div>
              </div>
              <div class="detail-item">
                <label>Date Submitted</label>
                <div class="detail-value">{{ formatDate(selectedAdvance.created_at) }}</div>
              </div>
              <div class="detail-item full-width">
                <label>Reason / Purpose</label>
                <div class="detail-value reason-text">{{ selectedAdvance.reason || '—' }}</div>
              </div>
              <div class="detail-item full-width" v-if="selectedAdvance.admin_notes">
                <label>HR / Admin Notes</label>
                <div class="detail-value notes-text">{{ selectedAdvance.admin_notes }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Note Modal -->
    <div v-if="showNoteModal" class="modal-overlay" @click.self="closeNoteModal">
      <div class="modal-container note-modal">
        <div class="modal-header">
          <div class="modal-title">
            <i class="fas fa-sticky-note"></i>
            <h3>Add Note</h3>
          </div>
          <button class="modal-close" @click="closeNoteModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="note-employee-info" v-if="selectedAdvance">
            <div class="note-avatar">{{ getInitials(selectedAdvance.user_name) }}</div>
            <div>
              <strong>{{ selectedAdvance.user_name }}</strong>
              <small>{{ formatCurrency(selectedAdvance.amount) }} • {{ selectedAdvance.status }}</small>
            </div>
          </div>
          <textarea 
            v-model="noteText" 
            class="note-textarea"
            placeholder="Add internal notes about this request (reason for approval/rejection, repayment schedule, etc.)..."
            rows="5"
          ></textarea>
          <div class="form-actions">
            <button class="btn-cancel" @click="closeNoteModal">Cancel</button>
            <button class="btn-submit" @click="saveNote" :disabled="savingNote">
              <i v-if="savingNote" class="fas fa-spinner fa-spin"></i>
              <span v-else>Save Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loadingRequests: true,
      salaryAdvances: [],
      employees: [],
      searchQuery: '',
      statusFilter: 'all',
      monthFilter: '',
      showModal: false,
      showViewModal: false,
      showNoteModal: false,
      submitting: false,
      savingNote: false,
      selectedAdvance: null,
      noteText: '',
      form: {
        user_id: '',
        amount: '',
        repayment_months: 3,
        reason: ''
      }
    }
  },
  computed: {
    pendingCount() {
      return this.salaryAdvances.filter(r => r.status === 'Pending').length
    },
    approvedCount() {
      return this.salaryAdvances.filter(r => r.status === 'Approved').length
    },
    rejectedCount() {
      return this.salaryAdvances.filter(r => r.status === 'Rejected').length
    },
    completedCount() {
      return this.salaryAdvances.filter(r => r.status === 'Completed').length
    },
    selectedEmployee() {
      if (!this.form.user_id) return null
      return this.employees.find(e => e.id == this.form.user_id)
    },
    filteredAdvances() {
      let filtered = [...this.salaryAdvances]
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(a => 
          (a.user_name && a.user_name.toLowerCase().includes(query)) ||
          (a.reason && a.reason.toLowerCase().includes(query)) ||
          (a.user_email && a.user_email.toLowerCase().includes(query))
        )
      }
      
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter(a => a.status === this.statusFilter)
      }
      
      if (this.monthFilter) {
        filtered = filtered.filter(a => {
          const date = new Date(a.created_at)
          const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          return yearMonth === this.monthFilter
        })
      }
      
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      return filtered
    }
  },
  methods: {
    getInitials(name) {
      if (!name) return '👤'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
    getAvatarColor(name) {
      const colors = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f59e0b, #ef4444)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        'linear-gradient(135deg, #8b5cf6, #6d28d9)'
      ]
      let hash = 0
      if (name) {
        for (let i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash) + name.charCodeAt(i)
          hash |= 0
        }
      }
      return colors[Math.abs(hash) % colors.length]
    },
    truncateText(text, length) {
      if (!text) return '—'
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    formatCurrency(amount) {
      if (!amount) return '₹0'
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase()
      if (s === 'approved') return 'approved'
      if (s === 'rejected') return 'rejected'
      if (s === 'completed') return 'completed'
      return 'pending'
    },
    formatDate(dateStr) {
      if (!dateStr) return '—'
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    async changeStatus(advance) {
      const token = localStorage.getItem('token')
      const previousStatus = advance.status
      
      try {
        await axios.patch(`/api/salary-advances/${advance.id}/status`, {
          status: advance.status
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toastSuccess(`Salary advance status updated to ${advance.status}`)
      } catch (err) {
        console.error('Failed to update status:', err)
        toastError('Failed to update status')
        advance.status = previousStatus
      }
    },
    openRequestModal() {
      this.form = {
        user_id: '',
        amount: '',
        repayment_months: 3,
        reason: ''
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.submitting = false
    },
    viewDetails(advance) {
      this.selectedAdvance = { ...advance }
      this.showViewModal = true
    },
    closeViewModal() {
      this.showViewModal = false
      this.selectedAdvance = null
    },
    addNote(advance) {
      this.selectedAdvance = { ...advance }
      this.noteText = advance.admin_notes || ''
      this.showNoteModal = true
    },
    closeNoteModal() {
      this.showNoteModal = false
      this.selectedAdvance = null
      this.noteText = ''
    },
    async saveNote() {
      if (!this.selectedAdvance) return
      
      this.savingNote = true
      const token = localStorage.getItem('token')
      
      try {
        await axios.patch(`/api/salary-advances/${this.selectedAdvance.id}/notes`, {
          admin_notes: this.noteText
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        const index = this.salaryAdvances.findIndex(a => a.id === this.selectedAdvance.id)
        if (index !== -1) {
          this.salaryAdvances[index].admin_notes = this.noteText
        }
        
        toastSuccess('Note saved successfully')
        this.closeNoteModal()
      } catch (err) {
        console.error('Failed to save note:', err)
        toastError('Failed to save note')
      } finally {
        this.savingNote = false
      }
    },
    async submitRequest() {
      if (!this.form.user_id) {
        toastError('Please select an employee')
        return
      }
      if (!this.form.amount || this.form.amount < 1000) {
        toastError('Amount must be at least ₹1,000')
        return
      }
      if (this.form.amount > 500000) {
        toastError('Amount cannot exceed ₹5,00,000')
        return
      }
      if (!this.form.reason.trim()) {
        toastError('Please provide a reason for the request')
        return
      }

      this.submitting = true
      const token = localStorage.getItem('token')
      
      try {
        const res = await axios.post('/api/salary-advances', {
          user_id: this.form.user_id,
          amount: this.form.amount,
          repayment_months: this.form.repayment_months,
          reason: this.form.reason
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        const employee = this.employees.find(e => e.id == this.form.user_id)
        const newAdvance = {
          ...res.data,
          user_name: employee?.name,
          user_email: employee?.email,
          department: employee?.department
        }
        
        this.salaryAdvances.unshift(newAdvance)
        toastSuccess(`Salary advance request submitted for ${employee?.name}`)
        this.closeModal()
      } catch (err) {
        console.error('Submission error:', err)
        toastError(err.response?.data?.message || 'Failed to submit request')
      } finally {
        this.submitting = false
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
   async fetchSalaryAdvances() {
  this.loadingRequests = true
  const token = localStorage.getItem('token')

  try {
    const res = await axios.get('/api/salary-advances/my', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    this.salaryAdvances = res.data

  } catch (err) {
    console.error(err)
    toastError('Failed to load salary advances')
  } finally {
    this.loadingRequests = false
  }
},
    async fetchEmployees() {
      const token = localStorage.getItem('token')
      try {
        const res = await axios.get('/api/employees', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.employees = res.data
      } catch (err) {
        console.error('Employees fetch error:', err)
        toastError('Failed to load employees list')
      }
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchSalaryAdvances()
    this.fetchEmployees()
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

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

.new-request-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: var(--primary);
  border: none;
  border-radius: 40px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.new-request-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}
.stat-card.pending i { color: #d97706; }

.stat-card.approved {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}
.stat-card.approved i { color: #065f46; }

.stat-card.rejected {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}
.stat-card.rejected i { color: #991b1b; }

.stat-card.completed {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}
.stat-card.completed i { color: #4338ca; }

.stat-card i {
  font-size: 28px;
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

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  padding: 8px 16px;
  border-radius: 40px;
  border: 1px solid #e5e7eb;
}

.filter-group i {
  color: #9ca3af;
}

.filter-input, .filter-select {
  border: none;
  background: transparent;
  padding: 6px 0;
  font-size: 14px;
  outline: none;
  min-width: 160px;
}

.filter-select {
  cursor: pointer;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-wrapper-premium {
  background: white;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #1a1a2e;
}

.section-title-modern i {
  color: var(--primary-color);
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.table-container {
  overflow-x: auto;
}

.request-table-premium {
  width: 100%;
  border-collapse: collapse;
}

.request-table-premium thead {
  background: #f8fafc;
}

.request-table-premium th {
  text-align: left;
  padding: 16px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.request-table-premium td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.request-table-premium tbody tr {
  transition: all 0.3s ease;
}

.request-table-premium tbody tr:hover {
  background: #fafbfc;
}

.serial-number {
  font-weight: 600;
  color: #9ca3af;
  width: 50px;
}

.employee-cell {
  min-width: 200px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.employee-details {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
  color: #1a1a2e;
}

.employee-email {
  font-size: 11px;
  color: #9ca3af;
}

.dept-badge {
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: #6b7280;
}

.amount-cell .amount-value {
  font-weight: 700;
  color: #1a1a2e;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-block;
}

.reason-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #6b7280;
}

.date-cell {
  font-family: monospace;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
}

.date-cell i {
  margin-right: 6px;
  font-size: 12px;
}

.repayment-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.repayment-badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  width: fit-content;
}

.emi-amount {
  font-size: 11px;
  color: #6b7280;
}

.status-dropdown-premium {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.3s ease;
}

.status-dropdown-premium:hover {
  transform: translateY(-1px);
}

.status-dropdown-premium.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-dropdown-premium.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-dropdown-premium.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-dropdown-premium.completed {
  background: #e0e7ff;
  color: #4338ca;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.view {
  background: #e0e7ff;
  color: #4338ca;
}

.action-btn.view:hover {
  background: #c7d2fe;
  transform: translateY(-2px);
}

.action-btn.note {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.note:hover {
  background: #fde68a;
  transform: translateY(-2px);
}

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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc, #fff);
  border-radius: 28px 28px 0 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title i {
  font-size: 24px;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.modal-title h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.modal-close {
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
}

.modal-close:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.salary-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.form-group label i {
  margin-right: 8px;
  color: var(--primary-color);
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.half {
  flex: 1;
}

.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #6b7280;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input {
  padding-left: 36px;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
}

.employee-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: 20px;
  margin-top: 4px;
}

.preview-avatar {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.preview-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.preview-details i {
  margin-right: 4px;
}

.emi-preview {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  padding: 12px 16px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.emi-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.emi-item span {
  font-size: 12px;
  color: #6b7280;
}

.emi-item strong {
  font-size: 16px;
  color: #065f46;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 40px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  padding: 10px 24px;
  background: var(--primary);
  border: none;
  border-radius: 40px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Detail View Modal */
.detail-card {
  background: #fafbfc;
  border-radius: 20px;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.detail-employee {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-avatar {
  width: 56px;
  height: 56px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 20px;
}

.detail-employee h4 {
  font-size: 18px;
  margin-bottom: 4px;
}

.detail-employee p {
  font-size: 13px;
  color: #6b7280;
}

.detail-status {
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
}

.detail-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.detail-status.approved {
  background: #d1fae5;
  color: #065f46;
}

.detail-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.detail-status.completed {
  background: #e0e7ff;
  color: #4338ca;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a2e;
}

.detail-value.amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.detail-value.reason-text, .detail-value.notes-text {
  background: white;
  padding: 12px;
  border-radius: 12px;
  line-height: 1.5;
}

/* Note Modal */
.note-employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 20px;
}

.note-avatar {
  width: 44px;
  height: 44px;
  background: var(--primary);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.note-employee-info strong {
  display: block;
  font-size: 15px;
}

.note-employee-info small {
  font-size: 12px;
  color: #6b7280;
}

.note-textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
}

.note-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Responsive */
@media (max-width: 1024px) {
  .request-table-premium th,
  .request-table-premium td {
    padding: 12px;
  }
  
  .reason-cell {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .content {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .new-request-btn {
    align-self: flex-start;
  }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-card i {
    font-size: 22px;
  }

  .stat-value {
    font-size: 20px;
  }

  .table-container {
    overflow-x: auto;
  }

  .request-table-premium {
    min-width: 900px;
  }

  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .modal-container {
    width: 95%;
    margin: 16px;
  }

  .emi-preview {
    flex-direction: column;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-item.full-width {
    grid-column: span 1;
  }
}

@media (max-width: 480px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-input, .filter-select {
    flex: 1;
  }
}
</style>