<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <component 
        :is="isEmployeeView ? 'EmployeeSidebar' : 'AdminSidebar'" 
        v-if="!isMobile || isSidebarVisible" 
      />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Mobile Top Navigation Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <div class="mobile-icon-box">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div>
              <span class="m-title-text">IT & Office Expenses</span>
              <span class="m-sub-text">Expense Management</span>
            </div>
          </div>
          <button class="m-action-btn primary" @click="openExpenseModal" title="Add Expense">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Desktop Executive Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon-wrapper">
              <div class="title-icon">
                <i class="fas fa-file-invoice-dollar"></i>
              </div>
              <div class="pulse-ring"></div>
            </div>
            <div>
              <div class="header-tag-row">
                <span class="badge-tag">IT & INFRASTRUCTURE WORKSPACE</span>
                <span class="user-access-pill"><i class="fas fa-shield-alt"></i> User #107 & IT Team Access</span>
              </div>
              <h1 class="page-title">IT & Office Expense Management</h1>
              <p class="subtitle-modern">
                Track, categorize, and record all IT subscriptions, cloud infrastructure, domains, hardware, and office expenditures.
              </p>
            </div>
          </div>

          <div class="header-actions-group">
            <button class="btn-secondary-modern" @click="fetchExpenses(true)" :disabled="loading" title="Refresh list">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              <span>Refresh</span>
            </button>
            <button class="btn-outline-modern" @click="exportToCSV" title="Export to CSV">
              <i class="fas fa-file-csv"></i>
              <span>Export CSV</span>
            </button>
            <button class="btn-primary-modern" @click="openExpenseModal">
              <i class="fas fa-plus-circle"></i>
              <span>Add New Expense</span>
            </button>
          </div>
        </div>

        <!-- Summary & Analytics KPI Cards -->
        <div class="stats-grid">
          <div class="stat-card" :class="{ active: selectedCategory === '' && selectedStatus === 'all' }" @click="clearAllFilters">
            <div class="stat-icon-box bg-indigo">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">₹ {{ formatAmount(summary.total) }}</span>
              <span class="stat-label">Total Expenses (All Time)</span>
            </div>
            <div class="stat-meta">{{ expenses.length }} records</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-box bg-emerald">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number text-emerald">₹ {{ formatAmount(summary.current_month) }}</span>
              <span class="stat-label">This Month ({{ currentMonthName }})</span>
            </div>
            <div class="stat-meta text-emerald">Current Cycle</div>
          </div>

          <div class="stat-card" :class="{ active: selectedStatus === 'pending' }" @click="filterByStatus('pending')">
            <div class="stat-icon-box bg-amber">
              <i class="fas fa-clock"></i>
              <span class="live-dot" v-if="summary.pending > 0"></span>
            </div>
            <div class="stat-content">
              <span class="stat-number text-amber">₹ {{ formatAmount(summary.pending) }}</span>
              <span class="stat-label">Pending / Reimbursable</span>
            </div>
            <div class="stat-meta text-amber">{{ pendingCount }} Pending</div>
          </div>

          <div class="stat-card" :class="{ active: selectedStatus === 'approved' }" @click="filterByStatus('approved')">
            <div class="stat-icon-box bg-purple">
              <i class="fas fa-check-double"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">₹ {{ formatAmount(summary.approved) }}</span>
              <span class="stat-label">Approved & Paid</span>
            </div>
            <div class="stat-meta">Verified</div>
          </div>
        </div>

        <!-- Interactive Categories Grid (Covers All Types of IT & Office Expenses) -->
        <div class="categories-panel">
          <div class="categories-header-row" @click="categoriesVisible = !categoriesVisible">
            <div class="cat-title-wrap">
              <i class="fas fa-th-large text-indigo"></i>
              <h3>Expense Categories</h3>
              <span class="cat-selected-badge" v-if="selectedCategory">Selected: {{ selectedCategory }}</span>
            </div>
            <div class="cat-header-right">
              <button class="btn-clear-cat" v-if="selectedCategory" @click.stop="clearFilter">
                <i class="fas fa-times"></i> Clear Filter
              </button>
              <i class="fas fa-chevron-down toggle-arrow" :class="{ 'rotated': !categoriesVisible }"></i>
            </div>
          </div>

          <transition name="expand-categories">
            <div v-if="categoriesVisible" class="categories-pills-grid">
              <div 
                class="category-pill-card"
                :class="{ active: selectedCategory === '' }"
                @click="clearFilter"
              >
                <div class="cat-pill-icon all-cat">
                  <i class="fas fa-border-all"></i>
                </div>
                <div class="cat-pill-text">
                  <span class="cat-name">All Categories</span>
                  <span class="cat-count">{{ expenses.length }} Total</span>
                </div>
              </div>

              <div 
                v-for="cat in itCategories" 
                :key="cat.name"
                class="category-pill-card"
                :class="{ active: selectedCategory === cat.name }"
                @click="filterByCategory(cat.name)"
              >
                <div class="cat-pill-icon" :style="{ background: cat.bg, color: cat.color }">
                  <i :class="cat.icon"></i>
                </div>
                <div class="cat-pill-text">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-count">₹ {{ formatAmount(getCategoryTotal(cat.name)) }}</span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Main Workspace: Expenses Toolbar & Listing -->
        <div class="workspace-card">
          <!-- Toolbar (Tabs, Search, Date Filters, View Switch) -->
          <div class="workspace-toolbar">
            <!-- Status Tabs -->
            <div class="status-tabs-group">
              <button 
                class="status-tab" 
                :class="{ active: selectedStatus === 'all' }" 
                @click="selectedStatus = 'all'"
              >
                All ({{ expenses.length }})
              </button>
              <button 
                class="status-tab" 
                :class="{ active: selectedStatus === 'approved' }" 
                @click="selectedStatus = 'approved'"
              >
                <i class="fas fa-check-circle"></i>
                Approved ({{ approvedCount }})
              </button>
              <button 
                class="status-tab" 
                :class="{ active: selectedStatus === 'pending' }" 
                @click="selectedStatus = 'pending'"
              >
                <i class="fas fa-hourglass-half"></i>
                Pending ({{ pendingCount }})
              </button>
            </div>

            <!-- Controls (Search, Month/Year Filter, View Mode) -->
            <div class="toolbar-controls">
              <div class="search-box">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search by title, vendor, remarks, or category..." 
                />
                <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="filter-select-wrap">
                <select v-model="selectedMonth" class="custom-select-small">
                  <option value="">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>

              <div class="view-switch-btns desktop-only">
                <button 
                  class="switch-btn" 
                  :class="{ active: viewMode === 'grid' }" 
                  @click="viewMode = 'grid'"
                  title="Card Grid View"
                >
                  <i class="fas fa-th-large"></i>
                </button>
                <button 
                  class="switch-btn" 
                  :class="{ active: viewMode === 'table' }" 
                  @click="viewMode = 'table'"
                  title="Table View"
                >
                  <i class="fas fa-table"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state-box">
            <div class="spinner-custom"></div>
            <p>Loading expense transactions...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredExpenses.length === 0" class="empty-state-modern">
            <div class="empty-icon-wrap">
              <i class="fas fa-receipt"></i>
            </div>
            <h3>No Expenses Recorded</h3>
            <p>{{ searchQuery || selectedCategory || selectedStatus !== 'all' ? 'No records match your selected filter criteria.' : 'Click "Add New Expense" above to record your first IT or office cost.' }}</p>
            <button class="btn-empty-action" @click="openExpenseModal">
              <i class="fas fa-plus"></i> Record an Expense
            </button>
          </div>

          <!-- CARD GRID VIEW -->
          <div v-else-if="viewMode === 'grid' || isMobile" class="expenses-cards-grid">
            <div 
              v-for="expense in filteredExpenses" 
              :key="expense.id" 
              class="expense-item-card"
            >
              <div class="e-card-top">
                <div class="e-header-info">
                  <div class="e-icon-box" :style="getCategoryStyle(expense.category)">
                    <i :class="getCategoryIcon(expense.category)"></i>
                  </div>
                  <div class="e-title-details">
                    <h4>{{ expense.title }}</h4>
                    <div class="e-tags-row">
                      <span class="category-chip" :style="getCategoryChipStyle(expense.category)">
                        {{ expense.category }}
                      </span>
                      <span class="vendor-chip" v-if="expense.vendor">
                        <i class="fas fa-store"></i> {{ expense.vendor }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="e-amount-tag">
                  <span class="currency">₹</span>
                  <span class="val">{{ formatAmount(expense.amount) }}</span>
                </div>
              </div>

              <!-- Card Middle Details -->
              <div class="e-card-meta-grid">
                <div class="meta-item">
                  <span class="m-lbl"><i class="fas fa-calendar-alt"></i> Expense Date</span>
                  <span class="m-val">{{ formatDate(expense.expense_date) }}</span>
                </div>

                <div class="meta-item" v-if="expense.billing_cycle">
                  <span class="m-lbl"><i class="fas fa-redo-alt"></i> Billing Cycle</span>
                  <span class="m-val">{{ expense.billing_cycle }}</span>
                </div>

                <div class="meta-item" v-if="expense.payment_mode">
                  <span class="m-lbl"><i class="fas fa-credit-card"></i> Payment Mode</span>
                  <span class="m-val">{{ expense.payment_mode }}</span>
                </div>

                <div class="meta-item">
                  <span class="m-lbl"><i class="fas fa-info-circle"></i> Status</span>
                  <span class="status-pill-small" :class="expense.status || 'approved'">
                    {{ capitalize(expense.status || 'approved') }}
                  </span>
                </div>
              </div>

              <!-- Remarks / Purpose -->
              <div class="e-remarks-box" v-if="expense.remarks">
                <i class="fas fa-comment-dots text-indigo"></i>
                <p>{{ expense.remarks }}</p>
              </div>

              <!-- Card Footer Actions -->
              <div class="e-card-footer">
                <span class="e-id-label">#EXP-{{ expense.id }}</span>

                <div class="e-actions-group">
                  <button class="btn-e-action edit" @click="editExpense(expense)" title="Edit Expense">
                    <i class="fas fa-pen"></i> Edit
                  </button>
                  <button class="btn-e-action delete" @click="deleteExpense(expense.id)" title="Delete Expense">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TABLE VIEW -->
          <div v-else class="table-responsive-wrapper">
            <table class="modern-expense-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title & Description</th>
                  <th>Category</th>
                  <th>Vendor / Provider</th>
                  <th>Billing & Payment</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="expense in filteredExpenses" :key="expense.id">
                  <td class="id-col">#{{ expense.id }}</td>
                  <td class="title-col">
                    <div class="table-title-cell">
                      <div class="t-cat-icon" :style="getCategoryStyle(expense.category)">
                        <i :class="getCategoryIcon(expense.category)"></i>
                      </div>
                      <div>
                        <span class="t-title-text">{{ expense.title }}</span>
                        <span class="t-remarks-text" v-if="expense.remarks">{{ truncateText(expense.remarks, 45) }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="category-chip" :style="getCategoryChipStyle(expense.category)">
                      {{ expense.category }}
                    </span>
                  </td>
                  <td>
                    <span class="vendor-badge" v-if="expense.vendor">
                      <i class="fas fa-store"></i> {{ expense.vendor }}
                    </span>
                    <span class="text-muted" v-else>—</span>
                  </td>
                  <td>
                    <div class="t-billing-cell">
                      <span class="b-cycle" v-if="expense.billing_cycle">{{ expense.billing_cycle }}</span>
                      <span class="b-mode" v-if="expense.payment_mode">{{ expense.payment_mode }}</span>
                      <span class="text-muted" v-if="!expense.billing_cycle && !expense.payment_mode">—</span>
                    </div>
                  </td>
                  <td class="date-col">
                    {{ formatDate(expense.expense_date) }}
                  </td>
                  <td class="amount-col">
                    <span class="table-amount">₹ {{ formatAmount(expense.amount) }}</span>
                  </td>
                  <td>
                    <span class="status-pill-small" :class="expense.status || 'approved'">
                      {{ capitalize(expense.status || 'approved') }}
                    </span>
                  </td>
                  <td class="actions-col text-right">
                    <div class="t-actions">
                      <button class="t-btn edit" @click="editExpense(expense)" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="t-btn delete" @click="deleteExpense(expense.id)" title="Delete">
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

    <!-- =================== MODAL: ADD / EDIT EXPENSE =================== -->
    <transition name="modal-fade">
      <div v-if="showExpenseModal" class="modal-backdrop" @click.self="closeExpenseModal">
        <div class="modal-card-modern" @click.stop>
          <div class="modal-header-gradient">
            <div class="m-icon-wrap">
              <i class="fas" :class="expenseForm.id ? 'fa-edit' : 'fa-receipt'"></i>
            </div>
            <div class="m-header-text">
              <h3>{{ expenseForm.id ? 'Edit Expense Record' : 'Record New Expense' }}</h3>
              <p>Add IT subscriptions, cloud infrastructure, hardware, or office expenses.</p>
            </div>
            <button class="m-close-btn" @click="closeExpenseModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="saveExpense" class="modal-body-form">
            <!-- Category Quick Selector -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-tag"></i> Expense Category <span class="req">*</span>
              </label>
              <div class="input-wrap">
                <select v-model="expenseForm.category" required class="custom-select">
                  <option disabled value="">Select Category...</option>
                  <option v-for="cat in itCategories" :key="cat.name" :value="cat.name">
                    {{ cat.name }}
                  </option>
                  <option value="Electricity">Electricity</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Travel">Travel & Commute</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
            </div>

            <!-- Title -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-heading"></i> Expense Title / Item Name <span class="req">*</span>
              </label>
              <div class="input-wrap">
                <input 
                  type="text" 
                  v-model="expenseForm.title" 
                  placeholder="e.g., Hostinger VPS Renewal, OpenAI API Credits, Dell 24-inch Monitor" 
                  required 
                  class="custom-input"
                />
              </div>
            </div>

            <!-- Amount & Quick Amount Presets -->
            <div class="form-group">
              <div class="amount-label-row">
                <label class="form-label">
                  <i class="fas fa-rupee-sign"></i> Amount (INR ₹) <span class="req">*</span>
                </label>
                <div class="amount-quick-chips">
                  <button type="button" class="a-chip" @click="addAmountPreset(500)">+₹500</button>
                  <button type="button" class="a-chip" @click="addAmountPreset(1000)">+₹1k</button>
                  <button type="button" class="a-chip" @click="addAmountPreset(5000)">+₹5k</button>
                  <button type="button" class="a-chip" @click="addAmountPreset(10000)">+₹10k</button>
                </div>
              </div>
              <div class="input-wrap amount-wrap">
                <span class="rupee-symbol">₹</span>
                <input 
                  type="number" 
                  step="0.01" 
                  v-model="expenseForm.amount" 
                  placeholder="0.00" 
                  required 
                  class="custom-input amount-input"
                />
              </div>
            </div>

            <!-- Vendor & Billing Cycle -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-store"></i> Vendor / Service Provider
                </label>
                <div class="input-wrap">
                  <input 
                    type="text" 
                    v-model="expenseForm.vendor" 
                    placeholder="e.g., Hostinger, AWS, Google, Amazon" 
                    class="custom-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-redo-alt"></i> Billing Cycle
                </label>
                <div class="input-wrap">
                  <select v-model="expenseForm.billing_cycle" class="custom-select">
                    <option value="One-Time">One-Time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Payment Mode & Expense Date -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-credit-card"></i> Payment Mode
                </label>
                <div class="input-wrap">
                  <select v-model="expenseForm.payment_mode" class="custom-select">
                    <option value="Company Card">Company Card</option>
                    <option value="Corporate UPI / NetBanking">Corporate UPI / NetBanking</option>
                    <option value="Cash">Cash</option>
                    <option value="Personal Card (Reimbursement)">Personal Card (Reimbursement)</option>
                    <option value="Vendor Invoice Credit">Vendor Invoice Credit</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-calendar-day"></i> Expense Date <span class="req">*</span>
                </label>
                <div class="input-wrap">
                  <input 
                    type="date" 
                    v-model="expenseForm.expense_date" 
                    required 
                    class="custom-input"
                  />
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-check-circle"></i> Approval & Payment Status
              </label>
              <div class="input-wrap">
                <select v-model="expenseForm.status" class="custom-select">
                  <option value="approved">Approved & Paid</option>
                  <option value="pending">Pending Approval / Reimbursement</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <!-- Remarks & Notes -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-comment-dots"></i> Remarks / Description / Invoice #
              </label>
              <div class="input-wrap">
                <textarea 
                  v-model="expenseForm.remarks" 
                  rows="2" 
                  placeholder="Invoice number, license key details, or notes..." 
                  class="custom-textarea"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer-modern">
              <button type="button" class="btn-modal-cancel" @click="closeExpenseModal">
                Cancel
              </button>
              <button type="submit" class="btn-modal-submit" :disabled="submitting">
                <i class="fas fa-spinner fa-spin" v-if="submitting"></i>
                <i class="fas fa-save" v-else></i>
                <span>{{ expenseForm.id ? 'Save Changes' : 'Record Expense' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import AdminSidebar from '../components/Sidebar.vue'
import EmployeeSidebar from './employee/components/Sidebar.vue'
import { toastSuccess, toastError, toastWarning } from '@/utils/toast.js'

export default {
  name: 'ExpenseManage',
  components: { 
    AdminSidebar,
    EmployeeSidebar
  },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loading: false,
      submitting: false,
      viewMode: 'grid', // 'grid' or 'table'
      categoriesVisible: true,

      searchQuery: '',
      selectedCategory: '',
      selectedStatus: 'all', // 'all', 'approved', 'pending'
      selectedMonth: '',

      expenses: [],
      summary: {
        total: 0,
        current_month: 0,
        pending: 0,
        approved: 0,
        count: 0,
        categories: []
      },

      showExpenseModal: false,
      expenseForm: {
        id: null,
        title: '',
        amount: '',
        category: 'Cloud Servers & Hosting',
        vendor: '',
        payment_mode: 'Company Card',
        billing_cycle: 'Monthly',
        status: 'approved',
        expense_date: new Date().toISOString().substring(0, 10),
        remarks: ''
      },

      itCategories: [
        { name: 'Domains & DNS', icon: 'fas fa-globe', bg: '#e0e7ff', color: '#4338ca' },
        { name: 'Cloud Servers & Hosting', icon: 'fas fa-cloud', bg: '#e0f2fe', color: '#0369a1' },
        { name: 'Software & SaaS Subscriptions', icon: 'fas fa-laptop-code', bg: '#f5f3ff', color: '#7c3aed' },
        { name: 'AI APIs & LLMs', icon: 'fas fa-robot', bg: '#fce7f3', color: '#be185d' },
        { name: 'Hardware & Devices', icon: 'fas fa-desktop', bg: '#fef3c7', color: '#b45309' },
        { name: 'SSL & Security Tools', icon: 'fas fa-shield-alt', bg: '#dcfce7', color: '#15803d' },
        { name: 'Office Internet & Networking', icon: 'fas fa-wifi', bg: '#ccfbf1', color: '#0f766e' },
        { name: 'Maintenance & Repairs', icon: 'fas fa-tools', bg: '#ffedd5', color: '#c2410c' },
        { name: 'Office Supplies', icon: 'fas fa-print', bg: '#f1f5f9', color: '#475569' },
        { name: 'Travel & Commute', icon: 'fas fa-car', bg: '#fae8ff', color: '#a21caf' },
        { name: 'Electricity', icon: 'fas fa-bolt', bg: '#fef08a', color: '#854d0e' },
        { name: 'Miscellaneous', icon: 'fas fa-file-invoice', bg: '#f3f4f6', color: '#374151' }
      ]
    }
  },

  computed: {
    currentMonthName() {
      return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
    },
    pendingCount() {
      return this.expenses.filter(e => e.status === 'pending').length
    },
    approvedCount() {
      return this.expenses.filter(e => e.status === 'approved' || e.status === 'paid').length
    },
    filteredExpenses() {
      let list = this.expenses

      // Category Filter
      if (this.selectedCategory) {
        list = list.filter(e => (e.category || '').toLowerCase() === this.selectedCategory.toLowerCase())
      }

      // Status Filter
      if (this.selectedStatus === 'approved') {
        list = list.filter(e => e.status === 'approved' || e.status === 'paid')
      } else if (this.selectedStatus === 'pending') {
        list = list.filter(e => e.status === 'pending')
      }

      // Month Filter
      if (this.selectedMonth) {
        list = list.filter(e => {
          if (!e.expense_date) return false
          const m = new Date(e.expense_date).getMonth() + 1
          return m === parseInt(this.selectedMonth)
        })
      }

      // Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase()
        list = list.filter(e => 
          (e.title && e.title.toLowerCase().includes(q)) ||
          (e.category && e.category.toLowerCase().includes(q)) ||
          (e.vendor && e.vendor.toLowerCase().includes(q)) ||
          (e.remarks && e.remarks.toLowerCase().includes(q))
        )
      }

      return list
    },

    isEmployeeView() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const role = String(user.role || '').toLowerCase()
      return this.$route.path.startsWith('/employee') || (role !== 'admin' && role !== 'superadmin')
    }
  },

  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token') || ''
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json'
        }
      }
    },

    async fetchExpenses(showToast = false) {
      this.loading = true
      const endpoints = [
        '/office-expenses',
        '/it-expenses',
        '/api/office-expenses',
        '/api/it-expenses',
        'https://employees.archenterprises.co.in/api/office-expenses',
        'https://employees.archenterprises.co.in/api/api/office-expenses'
      ]

      let success = false
      for (const ep of endpoints) {
        try {
          const res = await axios.get(ep, this.getAuthHeaders())
          if (res && res.data) {
            this.expenses = res.data.expenses || (Array.isArray(res.data) ? res.data : [])
            if (res.data.summary) {
              this.summary = res.data.summary
            } else {
              this.calculateLocalSummary()
            }
            success = true
            break
          }
        } catch (e) {
          // try next
        }
      }

      this.loading = false
      if (showToast) {
        toastSuccess('Expenses refreshed successfully')
      }
    },

    calculateLocalSummary() {
      const total = this.expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0)
      const now = new Date()
      const currentMonthExpenses = this.expenses.filter(e => {
        if (!e.expense_date) return false
        const d = new Date(e.expense_date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      const currentMonthTotal = currentMonthExpenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0)
      const pendingTotal = this.expenses.filter(e => e.status === 'pending').reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0)
      const approvedTotal = this.expenses.filter(e => e.status === 'approved' || e.status === 'paid').reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0)

      this.summary = {
        total,
        current_month: currentMonthTotal,
        pending: pendingTotal,
        approved: approvedTotal,
        count: this.expenses.length,
        categories: []
      }
    },

    openExpenseModal() {
      this.expenseForm = {
        id: null,
        title: '',
        amount: '',
        category: this.selectedCategory || 'Cloud Servers & Hosting',
        vendor: '',
        payment_mode: 'Company Card',
        billing_cycle: 'Monthly',
        status: 'approved',
        expense_date: new Date().toISOString().substring(0, 10),
        remarks: ''
      }
      this.showExpenseModal = true
    },

    editExpense(expense) {
      this.expenseForm = {
        id: expense.id,
        title: expense.title || '',
        amount: expense.amount || '',
        category: expense.category || 'Miscellaneous',
        vendor: expense.vendor || '',
        payment_mode: expense.payment_mode || 'Company Card',
        billing_cycle: expense.billing_cycle || 'One-Time',
        status: expense.status || 'approved',
        expense_date: expense.expense_date ? expense.expense_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        remarks: expense.remarks || ''
      }
      this.showExpenseModal = true
    },

    closeExpenseModal() {
      this.showExpenseModal = false
    },

    addAmountPreset(val) {
      const current = parseFloat(this.expenseForm.amount) || 0
      this.expenseForm.amount = (current + val).toString()
    },

    async saveExpense() {
      if (!this.expenseForm.title || !this.expenseForm.amount || !this.expenseForm.category) {
        toastWarning('Please fill in Title, Amount, and Category.')
        return
      }

      this.submitting = true
      const payload = {
        title: this.expenseForm.title,
        amount: parseFloat(this.expenseForm.amount),
        category: this.expenseForm.category,
        vendor: this.expenseForm.vendor || '',
        payment_mode: this.expenseForm.payment_mode || 'Company Card',
        billing_cycle: this.expenseForm.billing_cycle || 'One-Time',
        status: this.expenseForm.status || 'approved',
        expense_date: this.expenseForm.expense_date,
        remarks: this.expenseForm.remarks || ''
      }

      try {
        let success = false
        if (this.expenseForm.id) {
          const endpoints = [
            `/office-expenses/${this.expenseForm.id}`,
            `/it-expenses/${this.expenseForm.id}`,
            `/api/office-expenses/${this.expenseForm.id}`,
            `https://employees.archenterprises.co.in/api/office-expenses/${this.expenseForm.id}`
          ]
          for (const ep of endpoints) {
            try {
              await axios.put(ep, payload, this.getAuthHeaders())
              success = true
              break
            } catch (err) {}
          }
        } else {
          const endpoints = [
            '/office-expenses',
            '/it-expenses',
            '/api/office-expenses',
            'https://employees.archenterprises.co.in/api/office-expenses'
          ]
          for (const ep of endpoints) {
            try {
              await axios.post(ep, payload, this.getAuthHeaders())
              success = true
              break
            } catch (err) {}
          }
        }

        if (success) {
          toastSuccess(this.expenseForm.id ? 'Expense updated successfully!' : 'Expense recorded successfully!')
          this.closeExpenseModal()
          this.fetchExpenses()
        } else {
          toastError('Failed to save expense. Please try again.')
        }
      } catch (err) {
        toastError('Failed to save expense record')
      } finally {
        this.submitting = false
      }
    },

    async deleteExpense(id) {
      if (!confirm('Are you sure you want to delete this expense record?')) return

      const endpoints = [
        `/office-expenses/${id}`,
        `/it-expenses/${id}`,
        `/api/office-expenses/${id}`,
        `https://employees.archenterprises.co.in/api/office-expenses/${id}`
      ]

      let success = false
      for (const ep of endpoints) {
        try {
          await axios.delete(ep, this.getAuthHeaders())
          success = true
          break
        } catch (e) {}
      }

      if (success) {
        toastSuccess('Expense deleted successfully')
        this.fetchExpenses()
      } else {
        toastError('Could not delete expense')
      }
    },

    filterByCategory(category) {
      this.selectedCategory = this.selectedCategory === category ? '' : category
    },

    clearFilter() {
      this.selectedCategory = ''
    },

    filterByStatus(status) {
      this.selectedStatus = this.selectedStatus === status ? 'all' : status
    },

    clearAllFilters() {
      this.selectedCategory = ''
      this.selectedStatus = 'all'
      this.selectedMonth = ''
      this.searchQuery = ''
    },

    getCategoryTotal(catName) {
      return this.expenses
        .filter(e => (e.category || '').toLowerCase() === catName.toLowerCase())
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    },

    getCategoryIcon(category) {
      const cat = this.itCategories.find(c => c.name.toLowerCase() === (category || '').toLowerCase())
      if (cat) return cat.icon

      const c = (category || '').toLowerCase()
      if (c.includes('cloud') || c.includes('server') || c.includes('hosting')) return 'fas fa-cloud'
      if (c.includes('domain') || c.includes('dns')) return 'fas fa-globe'
      if (c.includes('ai') || c.includes('api') || c.includes('gpt')) return 'fas fa-robot'
      if (c.includes('software') || c.includes('saas') || c.includes('app')) return 'fas fa-laptop-code'
      if (c.includes('hardware') || c.includes('device') || c.includes('laptop')) return 'fas fa-desktop'
      if (c.includes('ssl') || c.includes('security')) return 'fas fa-shield-alt'
      if (c.includes('internet') || c.includes('wifi')) return 'fas fa-wifi'
      if (c.includes('electricity') || c.includes('power')) return 'fas fa-bolt'
      if (c.includes('travel') || c.includes('fuel')) return 'fas fa-car'
      if (c.includes('maintenance') || c.includes('repair')) return 'fas fa-tools'
      return 'fas fa-receipt'
    },

    getCategoryStyle(category) {
      const cat = this.itCategories.find(c => c.name.toLowerCase() === (category || '').toLowerCase())
      if (cat) return { background: cat.bg, color: cat.color }
      return { background: '#f1f5f9', color: '#475569' }
    },

    getCategoryChipStyle(category) {
      const cat = this.itCategories.find(c => c.name.toLowerCase() === (category || '').toLowerCase())
      if (cat) return { background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33` }
      return { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }
    },

    formatAmount(amount) {
      const num = parseFloat(amount) || 0
      return num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    formatDate(dateStr) {
      if (!dateStr) return '—'
      try {
        return new Date(dateStr).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (e) {
        return dateStr
      }
    },

    capitalize(str) {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    },

    truncateText(text, len) {
      if (!text) return ''
      return text.length > len ? text.substring(0, len) + '...' : text
    },

    exportToCSV() {
      if (this.filteredExpenses.length === 0) {
        toastWarning('No expense data to export')
        return
      }

      let csv = 'ID,Title,Category,Vendor,Billing Cycle,Payment Mode,Expense Date,Amount (INR),Status,Remarks\n'
      this.filteredExpenses.forEach(e => {
        const title = `"${(e.title || '').replace(/"/g, '""')}"`
        const cat = `"${(e.category || '').replace(/"/g, '""')}"`
        const vendor = `"${(e.vendor || '').replace(/"/g, '""')}"`
        const cycle = `"${(e.billing_cycle || '').replace(/"/g, '""')}"`
        const mode = `"${(e.payment_mode || '').replace(/"/g, '""')}"`
        const remarks = `"${(e.remarks || '').replace(/"/g, '""')}"`
        csv += `${e.id},${title},${cat},${vendor},${cycle},${mode},${e.expense_date || ''},${e.amount},${e.status || ''},${remarks}\n`
      })

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `IT_Expenses_${new Date().toISOString().substring(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toastSuccess('Exported expenses to CSV')
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
    this.fetchExpenses()

    const token = localStorage.getItem('token') || localStorage.getItem('admin_token')
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.layout {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: 100vh;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header Modern */
.content-header-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 24px 32px;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title-icon-wrapper {
  position: relative;
}

.title-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.header-tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.badge-tag {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #059669;
  background: #ecfdf5;
  padding: 3px 8px;
  border-radius: 6px;
}

.user-access-pill {
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  padding: 3px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
}

.subtitle-modern {
  font-size: 13px;
  color: #64748b;
  margin: 2px 0 0;
  max-width: 650px;
}

.header-actions-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-primary-modern {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  border: none;
  padding: 12px 22px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s;
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
}

.btn-primary-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
}

.btn-secondary-modern {
  background: #f8fafc;
  color: #334155;
  border: 1.5px solid #e2e8f0;
  padding: 11px 18px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary-modern:hover {
  background: #f1f5f9;
}

.btn-outline-modern {
  background: #ffffff;
  color: #059669;
  border: 1.5px solid #a7f3d0;
  padding: 11px 18px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-outline-modern:hover {
  background: #ecfdf5;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.m-title-text {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  display: block;
}

.m-sub-text {
  font-size: 11px;
  color: #64748b;
  display: block;
}

.m-action-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.stat-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  border: 1.5px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.stat-card:hover,
.stat-card.active {
  transform: translateY(-3px);
  border-color: #a7f3d0;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.08);
}

.stat-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  position: relative;
  flex-shrink: 0;
}

.bg-indigo { background: #eef2ff; color: #4f46e5; }
.bg-emerald { background: #ecfdf5; color: #10b981; }
.bg-amber { background: #fffbeb; color: #f59e0b; }
.bg-purple { background: #f5f3ff; color: #8b5cf6; }

.live-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 0 2px #ffffff;
  animation: pulseLive 2s infinite;
}

@keyframes pulseLive {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  display: block;
  line-height: 1.1;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-top: 3px;
  display: block;
}

.stat-meta {
  position: absolute;
  top: 16px;
  right: 18px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.text-emerald { color: #059669; }
.text-amber { color: #d97706; }
.text-indigo { color: #4f46e5; }

/* Categories Panel */
.categories-panel {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.categories-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.cat-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cat-title-wrap h3 {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.cat-selected-badge {
  font-size: 11px;
  font-weight: 700;
  background: #eef2ff;
  color: #4f46e5;
  padding: 3px 10px;
  border-radius: 12px;
}

.cat-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-clear-cat {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.toggle-arrow {
  color: #64748b;
  transition: transform 0.25s ease;
}

.toggle-arrow.rotated {
  transform: rotate(-90deg);
}

.categories-pills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.category-pill-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-pill-card:hover {
  background: #ffffff;
  border-color: #818cf8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.category-pill-card.active {
  border-color: #059669;
  background: #ecfdf5;
}

.cat-pill-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.cat-pill-icon.all-cat {
  background: #e2e8f0;
  color: #334155;
}

.cat-pill-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cat-name {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-count {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

/* Workspace Card */
.workspace-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 24px;
}

.workspace-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 24px;
}

.status-tabs-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.status-tab {
  background: transparent;
  border: none;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.status-tab.active {
  background: #ffffff;
  color: #059669;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  min-width: 260px;
}

.search-box input {
  width: 100%;
  padding: 9px 12px 9px 34px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 12px;
  outline: none;
}

.search-box input:focus {
  border-color: #10b981;
  background: #ffffff;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 12px;
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.custom-select-small {
  padding: 8px 12px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  outline: none;
}

.view-switch-btns {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  gap: 4px;
}

.switch-btn {
  background: transparent;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-btn.active {
  background: #ffffff;
  color: #059669;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Expenses Cards Grid */
.expenses-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.expense-item-card {
  background: #ffffff;
  border: 1.5px solid #f1f5f9;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  transition: all 0.25s;
}

.expense-item-card:hover {
  transform: translateY(-3px);
  border-color: #a7f3d0;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
}

.e-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.e-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.e-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.e-title-details h4 {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.e-tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.category-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.vendor-chip {
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.e-amount-tag {
  text-align: right;
  flex-shrink: 0;
}

.e-amount-tag .currency {
  font-size: 13px;
  font-weight: 700;
  color: #059669;
  margin-right: 2px;
}

.e-amount-tag .val {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.e-card-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.m-lbl {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.m-val {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.status-pill-small {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

.status-pill-small.approved,
.status-pill-small.paid {
  background: #d1fae5;
  color: #065f46;
}

.status-pill-small.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-pill-small.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.e-remarks-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  color: #475569;
}

.e-remarks-box p {
  margin: 0;
  line-height: 1.4;
}

.e-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.e-id-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.e-actions-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-e-action {
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-e-action.edit { background: #f1f5f9; color: #334155; }
.btn-e-action.edit:hover { background: #e2e8f0; }

.btn-e-action.delete { background: #fee2e2; color: #dc2626; width: 28px; height: 28px; padding: 0; justify-content: center; }
.btn-e-action.delete:hover { background: #fca5a5; }

/* Table View */
.table-responsive-wrapper {
  overflow-x: auto;
}

.modern-expense-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.modern-expense-table thead th {
  background: #f8fafc;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
}

.modern-expense-table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.id-col { font-weight: 700; color: #94a3b8; }

.table-title-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.t-cat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.t-title-text {
  font-weight: 700;
  color: #0f172a;
  display: block;
}

.t-remarks-text {
  font-size: 11px;
  color: #64748b;
  display: block;
}

.vendor-badge {
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  color: #334155;
  padding: 3px 8px;
  border-radius: 6px;
}

.t-billing-cell {
  display: flex;
  flex-direction: column;
}

.b-cycle { font-size: 12px; font-weight: 700; color: #0f172a; }
.b-mode { font-size: 11px; color: #64748b; }

.table-amount {
  font-size: 14px;
  font-weight: 800;
  color: #059669;
}

.t-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.t-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}

.t-btn.edit { background: #f1f5f9; color: #334155; }
.t-btn.delete { background: #fee2e2; color: #dc2626; }

/* Empty & Loading */
.loading-state-box {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner-custom {
  width: 44px;
  height: 44px;
  border: 3px solid #e2e8f0;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state-modern {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}

.empty-state-modern h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.empty-state-modern p {
  font-size: 13px;
  color: #64748b;
  margin: 0 auto 20px;
  max-width: 380px;
}

.btn-empty-action {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
}

.modal-card-modern {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: scaleModal 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleModal {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header-gradient {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  color: #ffffff;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.m-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.m-header-text h3 {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.m-header-text p {
  font-size: 12px;
  color: #a7f3d0;
  margin: 2px 0 0;
}

.m-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-body-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-label i { color: #059669; }
.req { color: #ef4444; }

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.amount-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.amount-quick-chips {
  display: flex;
  gap: 4px;
}

.a-chip {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
  cursor: pointer;
}

.amount-wrap {
  position: relative;
}

.rupee-symbol {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  font-weight: 800;
  color: #059669;
}

.amount-input {
  padding-left: 32px !important;
  font-size: 15px !important;
  font-weight: 700;
}

.custom-input,
.custom-select,
.custom-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  color: #1e293b;
  outline: none;
  background: #ffffff;
}

.custom-input:focus,
.custom-select:focus,
.custom-textarea:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.modal-footer-modern {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.btn-modal-cancel {
  background: #f1f5f9;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.btn-modal-submit {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    flex-direction: column;
  }
  .workspace-card,
  .categories-panel {
    padding: 16px;
    border-radius: 20px;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .stat-card {
    padding: 14px;
    gap: 12px;
  }
  .stat-icon-box {
    width: 42px;
    height: 42px;
    font-size: 18px;
  }
  .stat-number {
    font-size: 18px;
  }
  .stat-meta {
    display: none;
  }
  .expenses-cards-grid {
    grid-template-columns: 1fr;
  }
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
  .search-box {
    min-width: 100%;
  }
}
</style>