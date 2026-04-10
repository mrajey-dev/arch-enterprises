<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-receipt"></i>
            </div>
            <div>
              <h1>Office Expense Management</h1>
              <p class="subtitle-modern">Track and manage all office expenses</p>
            </div>
          </div>
          <button class="register-btn-modern" @click="openExpenseModal">
            <i class="fas fa-plus-circle"></i>
            <span>Add Expense</span>
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-wallet"></i>
            <div class="stat-info">
              <span class="stat-value">₹ {{ formatAmount(summary.total) }}</span>
              <span class="stat-label">Total Expenses</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-chart-line"></i>
            <div class="stat-info">
              <span class="stat-value">{{ expenses.length }}</span>
              <span class="stat-label">Total Transactions</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-calendar-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{ currentMonth }}</span>
              <span class="stat-label">Current Month</span>
            </div>
          </div>
        </div>

        <!-- Categories Filter -->
        <div class="section-title-modern">
          <i class="fas fa-filter"></i>
          <span>Filter by Category</span>
        </div>
        
        <div class="categories-grid">
          <div
            class="category-card-modern"
            :class="{ active: selectedCategory === 'Electricity' }"
            @click="filterByCategory('Electricity')"
          >
            <i class="fas fa-bolt"></i>
            <span>Electricity</span>
          </div>
          <div
            class="category-card-modern"
            :class="{ active: selectedCategory === 'Internet' }"
            @click="filterByCategory('Internet')"
          >
            <i class="fas fa-wifi"></i>
            <span>Internet</span>
          </div>
          <div
            class="category-card-modern"
            :class="{ active: selectedCategory === 'Maintenance' }"
            @click="filterByCategory('Maintenance')"
          >
            <i class="fas fa-tools"></i>
            <span>Maintenance</span>
          </div>
          <div
            class="category-card-modern"
            :class="{ active: selectedCategory === 'Office Supplies' }"
            @click="filterByCategory('Office Supplies')"
          >
            <i class="fas fa-print"></i>
            <span>Office Supplies</span>
          </div>
          <div
            class="category-card-modern"
            :class="{ active: selectedCategory === 'Travel' }"
            @click="filterByCategory('Travel')"
          >
            <i class="fas fa-car"></i>
            <span>Travel</span>
          </div>
          <div
            class="category-card-modern"
            :class="{ active: selectedCategory === 'Miscellaneous' }"
            @click="filterByCategory('Miscellaneous')"
          >
            <i class="fas fa-file-invoice"></i>
            <span>Miscellaneous</span>
          </div>
          <div
            v-if="selectedCategory"
            class="category-card-modern clear-filter"
            @click="clearFilter"
          >
            <i class="fas fa-times-circle"></i>
            <span>Clear Filter</span>
          </div>
        </div>

        <!-- Expense List -->
        <div class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <i class="fas fa-list-ul"></i>
              <span>Expense List</span>
            </div>
            <div class="table-info">
              <i class="fas fa-clock"></i>
              <span>Showing {{ filteredExpenses.length }} entries</span>
            </div>
          </div>

          <div class="table-container">
            <table class="expense-table-premium">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount (₹)</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredExpenses.length === 0">
                  <td colspan="7" class="empty-state-cell">
                    <div class="empty-state-premium">
                      <i class="fas fa-receipt"></i>
                      <h4>No Expenses Found</h4>
                      <p>Click "Add Expense" to record your first expense</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="(expense, index) in filteredExpenses" :key="expense.id">
                  <td class="serial-number">{{ index + 1 }}</td>
                  <td class="expense-title">
                    <div class="title-badge">
                      <i class="fas fa-tag"></i>
                      <span>{{ expense.title }}</span>
                    </div>
                  </td>
                  <td class="description-cell">{{ expense.remarks || '—' }}</td>
                  <td>
                    <span class="category-badge" :class="getCategoryClass(expense.category)">
                      <i :class="getCategoryIcon(expense.category)"></i>
                      {{ expense.category }}
                    </span>
                  </td>
                  <td class="amount-cell">₹ {{ formatAmount(expense.amount) }}</td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i>
                    {{ formatDate(expense.expense_date) }}
                  </td>
                  <td>
                    <div class="action-group">
                      <button class="action-btn edit" @click="editExpense(expense)" title="Edit Expense">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="action-btn delete" @click="deleteExpense(expense.id)" title="Delete Expense">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- Add/Edit Expense Modal - Premium Design -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showExpenseModal" @click.self="closeExpenseModal">
        <div class="premium-modal" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-plus-circle"></i>
            </div>
            <div class="header-text">
              <h2>{{ expenseForm.id ? 'Edit Expense' : 'Add New Expense' }}</h2>
              <p>{{ expenseForm.id ? 'Update expense information' : 'Record a new office expense' }}</p>
            </div>
            <button class="close-btn-premium" @click="closeExpenseModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <form @submit.prevent="saveExpense">
              <div class="form-section">
                <div class="form-field">
                  <label>Expense Title <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-heading field-icon"></i>
                    <input 
                      v-model="expenseForm.title" 
                      type="text" 
                      placeholder="e.g., Office Supplies Purchase"
                      required 
                    />
                  </div>
                </div>

                <div class="form-field">
                  <label>Amount <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-rupee-sign field-icon"></i>
                    <input 
                      v-model="expenseForm.amount" 
                      type="number" 
                      step="0.01"
                      placeholder="Enter amount"
                      required 
                    />
                  </div>
                </div>

                <div class="form-field">
                  <label>Category <span class="required-star">*</span></label>
                  <div class="field-wrapper">
                    <i class="fas fa-tags field-icon"></i>
                    <select v-model="expenseForm.category" required>
                      <option value="" disabled>Select category</option>
                      <option value="Electricity">⚡ Electricity</option>
                      <option value="Internet">🌐 Internet</option>
                      <option value="Maintenance">🔧 Maintenance</option>
                      <option value="Office Supplies">📄 Office Supplies</option>
                      <option value="Travel">🚗 Travel</option>
                      <option value="Miscellaneous">📁 Miscellaneous</option>
                    </select>
                  </div>
                </div>

                <div class="form-field full-width">
                  <label>Description / Remarks</label>
                  <div class="field-wrapper">
                    <i class="fas fa-align-left field-icon" style="top: 18px;"></i>
                    <textarea 
                      v-model="expenseForm.remarks" 
                      placeholder="Enter additional details about this expense"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button type="button" class="btn-cancel-premium" @click="closeExpenseModal">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn-submit-premium">
                  <i class="fas fa-save"></i> {{ expenseForm.id ? 'Update' : 'Save' }} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      showExpenseModal: false,
      allExpenses: [],
      expenses: [],
      selectedCategory: '',
      summary: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      },
      expenseForm: {
        id: null,
        title: '',
        amount: '',
        category: '',
        remarks: ''
      }
    }
  },

  computed: {
    filteredExpenses() {
      if (!this.selectedCategory) return this.expenses
      return this.expenses.filter(expense => expense.category === this.selectedCategory)
    },
    currentMonth() {
      const date = new Date()
      return date.toLocaleString('default', { month: 'long', year: 'numeric' })
    }
  },

  methods: {
    formatAmount(amount) {
      if (!amount) return '0'
      return parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    getCategoryClass(category) {
      const classes = {
        'Electricity': 'electricity',
        'Internet': 'internet',
        'Maintenance': 'maintenance',
        'Office Supplies': 'supplies',
        'Travel': 'travel',
        'Miscellaneous': 'misc'
      }
      return classes[category] || 'misc'
    },

    getCategoryIcon(category) {
      const icons = {
        'Electricity': 'fas fa-bolt',
        'Internet': 'fas fa-wifi',
        'Maintenance': 'fas fa-tools',
        'Office Supplies': 'fas fa-print',
        'Travel': 'fas fa-car',
        'Miscellaneous': 'fas fa-file-invoice'
      }
      return icons[category] || 'fas fa-tag'
    },

    filterByCategory(category) {
      if (this.selectedCategory === category) {
        this.selectedCategory = ''
      } else {
        this.selectedCategory = category
      }
    },

    clearFilter() {
      this.selectedCategory = ''
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },

    editExpense(expense) {
      this.expenseForm = { 
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        remarks: expense.remarks || ''
      }
      this.showExpenseModal = true
    },

    async deleteExpense(id) {
      if (!confirm('Are you sure you want to delete this expense?')) return

      const token = localStorage.getItem('token')
      try {
        await fetch(`https://employees.archenterprises.co.in/api/api/office-expenses/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        toastSuccess('Expense deleted successfully!')
        this.fetchExpenses()
      } catch (error) {
        toastError('Failed to delete expense')
      }
    },

    async saveExpense() {
      if (!this.expenseForm.title) {
        toastWarning('Please enter expense title')
        return
      }
      if (!this.expenseForm.amount || this.expenseForm.amount <= 0) {
        toastWarning('Please enter a valid amount')
        return
      }
      if (!this.expenseForm.category) {
        toastWarning('Please select a category')
        return
      }

      const token = localStorage.getItem('token')
      const url = this.expenseForm.id
        ? `https://employees.archenterprises.co.in/api/api/office-expenses/${this.expenseForm.id}`
        : `https://employees.archenterprises.co.in/api/api/office-expenses`
      const method = this.expenseForm.id ? 'PUT' : 'POST'

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.expenseForm)
        })

        if (response.ok) {
          toastSuccess(this.expenseForm.id ? 'Expense updated!' : 'Expense saved!')
          this.closeExpenseModal()
          this.fetchExpenses()
        } else {
          toastError('Failed to save expense')
        }
      } catch (error) {
        toastError('Server error. Please try again.')
      }
    },

    async fetchExpenses() {
      const token = localStorage.getItem('token')
      try {
        const res = await fetch('https://employees.archenterprises.co.in/api/api/office-expenses', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        this.allExpenses = data.expenses || []
        this.expenses = data.expenses || []
        this.summary = data.summary || { total: 0 }
      } catch (error) {
        console.error('Error fetching expenses:', error)
        toastError('Failed to load expenses')
      }
    },

    openExpenseModal() {
      this.expenseForm = { id: null, title: '', amount: '', category: '', remarks: '' }
      this.showExpenseModal = true
    },

    closeExpenseModal() {
      this.showExpenseModal = false
      this.expenseForm = { id: null, title: '', amount: '', category: '', remarks: '' }
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    } else {
      this.fetchExpenses()
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
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
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
   ;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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
  font-size: 20px;
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

.register-btn-modern {
  padding: 12px 24px;
  background: var(--primary);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.register-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 36px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.category-card-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.category-card-modern i {
  font-size: 24px;
  color: var(--primary-color);
}

.category-card-modern span {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.category-card-modern:hover {
  transform: translateY(-3px);
  background: #f1f5f9;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.category-card-modern.active {
  background: var(--primary);
  border-color: var(--primary-color);
}

.category-card-modern.active i,
.category-card-modern.active span {
  color: white;
}

.category-card-modern.clear-filter {
  background: #fee2e2;
}

.category-card-modern.clear-filter i,
.category-card-modern.clear-filter span {
  color: var(--danger);
}

.category-card-modern.clear-filter:hover {
  background: #fecaca;
}

/* Table Styles */
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
  padding: 20px 24px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.table-container {
  overflow-x: auto;
}

.expense-table-premium {
  width: 100%;
  border-collapse: collapse;
}

.expense-table-premium thead {
  background: #f8fafc;
}

.expense-table-premium th {
  text-align: left;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.expense-table-premium td {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.expense-table-premium tbody tr {
  transition: all 0.3s ease;
}

.expense-table-premium tbody tr:hover {
  background: #fafbfc;
}

.serial-number {
  font-weight: 600;
  color: #9ca3af;
  width: 60px;
}

.expense-title .title-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expense-title .title-badge i {
  color: var(--primary-color);
  font-size: 14px;
}

.description-cell {
  color: #6b7280;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.category-badge.electricity {
  background: #fef3c7;
  color: #d97706;
}

.category-badge.internet {
  background: #e0e7ff;
  color: #4338ca;
}

.category-badge.maintenance {
  background: #fed7aa;
  color: #c2410c;
}

.category-badge.supplies {
  background: #d1fae5;
  color: #065f46;
}

.category-badge.travel {
  background: #dbeafe;
  color: #1e40af;
}

.category-badge.misc {
  background: #f3e8ff;
  color: #7e22ce;
}

.amount-cell {
  font-weight: 600;
  color: #1a1a2e;
}

.date-cell {
  color: #6b7280;
  font-size: 13px;
}

.date-cell i {
  margin-right: 6px;
  font-size: 12px;
}

/* Action Group */
.action-group {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-btn.edit:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.action-btn.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-btn.delete:hover {
  background: var(--danger);
  color: white;
  transform: translateY(-2px);
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.premium-modal {
  position: relative;
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 550px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

/* Modal Header */
.modal-header-premium {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-icon-premium {
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

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.header-text p {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.close-btn-premium {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.close-btn-premium:hover {
  background: var(--danger);
  color: white;
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body-premium {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: #fafbfc;
}

.modal-body-premium::-webkit-scrollbar {
  width: 6px;
}

.modal-body-premium::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 10px;
}

.modal-body-premium::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required-star {
  color: var(--danger);
}

.field-wrapper {
  position: relative;
}

.field-wrapper .field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.field-wrapper textarea + .field-icon {
  top: 18px;
  transform: none;
}

.field-wrapper input,
.field-wrapper select,
.field-wrapper textarea {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.field-wrapper textarea {
  padding-top: 12px;
  resize: vertical;
  min-height: 100px;
}

.field-wrapper input:focus,
.field-wrapper select:focus,
.field-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Modal Footer */
.modal-footer-premium {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-cancel-premium,
.btn-submit-premium {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  border: none;
}

.btn-cancel-premium {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel-premium:hover {
  background: #e5e7eb;
}

.btn-submit-premium {
  background: var(--primary);
  color: white;
}

.btn-submit-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* Empty State */
.empty-state-cell {
  text-align: center;
  padding: 60px 20px;
}

.empty-state-premium {
  text-align: center;
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

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
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

  .register-btn-modern {
    justify-content: center;
  }

  .stats-bar {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .premium-modal {
    max-width: 95%;
  }

  .modal-header-premium {
    padding: 16px 20px;
  }

  .modal-body-premium {
    padding: 16px;
  }

  .modal-footer-premium {
    padding: 16px 20px;
    flex-direction: column;
  }

  .action-group {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .expense-table-premium th,
  .expense-table-premium td {
    padding: 12px;
  }

  .description-cell {
    max-width: 120px;
  }
}
</style>