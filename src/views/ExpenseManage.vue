<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
         
          <div class="mobile-title">
            <i class="fas fa-receipt"></i>
            <span>Expenses</span>
          </div>
          <button class="mobile-add-btn" @click="openExpenseModal">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
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

        <!-- Summary Cards - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-wallet"></i>
            <div class="stat-info">
              <span class="stat-value">₹ {{ formatAmount(summary.total) }}</span>
              <span class="stat-label">Total Expenses</span>
            </div>
          </div>
          <div class="stat-card desktop-only">
            <i class="fas fa-chart-line"></i>
            <div class="stat-info">
              <span class="stat-value">{{ expenses.length }}</span>
              <span class="stat-label">Transactions</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-calendar-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{ currentMonthShort }}</span>
              <span class="stat-label">Current Month</span>
            </div>
          </div>
        </div>

        <!-- Categories Filter - Mobile Optimized -->
        <div class="section-title-modern" @click="toggleCategories">
          <div class="title-left">
            <i class="fas fa-filter"></i>
            <span>Filter by Category</span>
            <span class="active-filter-count" v-if="selectedCategory">({{ selectedCategory }})</span>
          </div>
          <i class="fas fa-chevron-down filter-toggle" :class="{ 'rotated': categoriesVisible }"></i>
        </div>
        
        <div class="categories-grid" :class="{ 'categories-hidden': !categoriesVisible }">
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
            <span>Supplies</span>
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
            <span>Misc</span>
          </div>
          <div
            v-if="selectedCategory"
            class="category-card-modern clear-filter"
            @click="clearFilter"
          >
            <i class="fas fa-times-circle"></i>
            <span>Clear</span>
          </div>
        </div>

        <!-- Expense List - Mobile Optimized -->
        <div class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-list-ul"></i>
                <span>Expense List</span>
                <span class="record-count-mobile" v-if="isMobile">{{ filteredExpenses.length }}</span>
              </div>
            </div>
            <div class="table-info desktop-only">
              <i class="fas fa-clock"></i>
              <span>Showing {{ filteredExpenses.length }} entries</span>
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="(expense, index) in filteredExpenses" :key="expense.id" class="expense-card">
              <div class="card-header">
                <div class="card-title">
                  <i class="fas fa-tag"></i>
                  <span class="expense-title-text">{{ expense.title }}</span>
                </div>
                <span class="category-badge-mobile" :class="getCategoryClass(expense.category)">
                  <i :class="getCategoryIcon(expense.category)"></i>
                  {{ expense.category }}
                </span>
              </div>

              <div class="card-body">
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-rupee-sign"></i> Amount</span>
                  <span class="card-value amount">₹ {{ formatAmount(expense.amount) }}</span>
                </div>
                <div class="card-row" v-if="expense.remarks">
                  <span class="card-label"><i class="fas fa-align-left"></i> Description</span>
                  <span class="card-value description">{{ truncateText(expense.remarks, 50) }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-calendar-alt"></i> Date</span>
                  <span class="card-value">{{ formatDate(expense.expense_date) }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button class="card-action-btn edit" @click="editExpense(expense)">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="card-action-btn delete" @click="deleteExpense(expense.id)">
                  <i class="fas fa-trash-alt"></i> Delete
                </button>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="filteredExpenses.length === 0" class="empty-state-mobile">
              <i class="fas fa-receipt"></i>
              <h4>No Expenses Found</h4>
              <p>{{ selectedCategory ? 'No expenses in this category' : 'Click "Add Expense" to record your first expense' }}</p>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-container" v-else>
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

    <!-- Add/Edit Expense Modal - Mobile Optimized -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showExpenseModal" @click.self="closeExpenseModal">
        <div class="premium-modal" :class="{ 'mobile-modal': isMobile }" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i class="fas fa-plus-circle"></i>
            </div>
            <div class="header-text">
              <h2>{{ expenseForm.id ? 'Edit Expense' : 'Add Expense' }}</h2>
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
                      placeholder="e.g., Office Supplies"
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

              <div class="modal-footer-premium" :class="{ 'mobile-footer': isMobile }">
                <button type="button" class="btn-cancel-premium" @click="closeExpenseModal">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn-submit-premium">
                  <i class="fas fa-save"></i> {{ expenseForm.id ? 'Update' : 'Save' }}
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
      categoriesVisible: true,
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
    },
    currentMonthShort() {
      const date = new Date()
      return date.toLocaleString('default', { month: 'short' })
    }
  },

  methods: {
    toggleCategories() {
      if (this.isMobile) {
        this.categoriesVisible = !this.categoriesVisible
      }
    },
    truncateText(text, length) {
      if (!text) return '—'
      return text.length > length ? text.substring(0, length) + '...' : text
    },
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
      if (this.isMobile) {
        this.categoriesVisible = false
      } else {
        this.categoriesVisible = true
      }
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
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
  color: var(--dark);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark);
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
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
  cursor: pointer;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

.active-filter-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--primary-color);
  background: #e0e7ff;
  padding: 2px 10px;
  border-radius: 12px;
}

.filter-toggle {
  transition: transform 0.3s ease;
}

.filter-toggle.rotated {
  transform: rotate(180deg);
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
  transition: all 0.3s ease;
}

.categories-grid.categories-hidden {
  display: none;
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

.category-card-modern:active {
  transform: scale(0.95);
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

.record-count-mobile {
  background: var(--primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 4px;
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

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.expense-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.card-title i {
  color: var(--primary-color);
}

.expense-title-text {
  font-weight: 600;
  color: var(--dark);
  font-size: 14px;
}

.category-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.category-badge-mobile.electricity {
  background: #fef3c7;
  color: #d97706;
}

.category-badge-mobile.internet {
  background: #e0e7ff;
  color: #4338ca;
}

.category-badge-mobile.maintenance {
  background: #fed7aa;
  color: #c2410c;
}

.category-badge-mobile.supplies {
  background: #d1fae5;
  color: #065f46;
}

.category-badge-mobile.travel {
  background: #dbeafe;
  color: #1e40af;
}

.category-badge-mobile.misc {
  background: #f3e8ff;
  color: #7e22ce;
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
  color: var(--dark);
  text-align: right;
}

.card-value.amount {
  font-weight: 700;
  color: var(--primary-color);
}

.card-value.description {
  max-width: 60%;
  word-break: break-word;
  text-align: right;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.card-action-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.card-action-btn.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.card-action-btn.edit:active {
  transform: scale(0.97);
}

.card-action-btn.delete {
  background: #fee2e2;
  color: var(--danger);
}

.card-action-btn.delete:active {
  transform: scale(0.97);
}

/* Empty States */
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

.empty-state-mobile {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state-mobile i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-mobile h4 {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 6px;
}

.empty-state-mobile p {
  font-size: 13px;
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

.premium-modal.mobile-modal {
  max-width: 95%;
  border-radius: 24px;
  max-height: 90vh;
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

.mobile-modal .modal-header-premium {
  padding: 16px 20px;
  gap: 12px;
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

.mobile-modal .header-icon-premium {
  width: 40px;
  height: 40px;
  font-size: 18px;
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

.mobile-modal .header-text h2 {
  font-size: 18px;
}

.header-text p {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.mobile-modal .header-text p {
  font-size: 12px;
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

.mobile-modal .modal-body-premium {
  padding: 16px;
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

.mobile-modal .form-field.full-width {
  grid-column: span 1;
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

.mobile-modal .field-wrapper input,
.mobile-modal .field-wrapper select,
.mobile-modal .field-wrapper textarea {
  font-size: 16px;
  padding: 10px 12px 10px 36px;
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

.modal-footer-premium.mobile-footer {
  flex-direction: column;
  padding: 16px 20px;
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

.mobile-footer .btn-cancel-premium,
.mobile-footer .btn-submit-premium {
  padding: 14px;
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
    padding: 12px;
  }

  .content {
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
    font-size: 18px;
  }

  .stat-label {
    font-size: 10px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .categories-grid.categories-hidden {
    display: none;
  }

  .section-title-modern {
    font-size: 14px;
  }

  .mobile-cards {
    display: flex;
  }

  .table-container {
    display: none;
  }

  .table-header {
    padding: 12px 16px;
  }

  .table-info {
    display: none;
  }

  .premium-modal {
    max-width: 95%;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .content {
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
    font-size: 16px;
  }

  .categories-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .category-card-modern {
    padding: 12px;
  }

  .category-card-modern i {
    font-size: 20px;
  }

  .category-card-modern span {
    font-size: 12px;
  }

  .expense-card {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .card-value {
    text-align: left;
  }

  .card-value.description {
    max-width: 100%;
    text-align: left;
  }

  .modal-footer-premium.mobile-footer {
    flex-direction: column;
  }

  .modal-footer-premium.mobile-footer button {
    width: 100%;
  }
}
</style>