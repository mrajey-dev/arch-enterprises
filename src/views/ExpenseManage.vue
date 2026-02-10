<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
      <div class="head-title">
        <a href="https://employees.archenterprises.co.in/">
          <img
            src="https://archenterprises.co.in/ajay/ajay.png"
            style="height: 65px; border-radius: 9px;"
            alt="Logo"
          />
        </a>
        Arch 360
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <h2>Office Expense Management</h2>

        <!-- OFFICE EXPENSE MANAGEMENT -->
        <div class="expense-box">
          <div class="expense-header">
            <h3></h3>
          <button class="add-expense-btn" @click="openExpenseModal">
  <i class="fas fa-plus"></i> Add Expense
</button>

          </div>

          <!-- SUMMARY -->
          <div class="expense-summary">
            <div class="summary-card">
              <i class="fas fa-wallet"></i>
              <p class="amount">₹ {{ summary.total }}</p>
              <span>Total Expenses</span>
            </div>

            <!-- <div class="summary-card">
              <i class="fas fa-hourglass-half"></i>
             <p class="amount">₹ {{ summary.pending }}</p>
              <span>Pending Approval</span>
            </div>

            <div class="summary-card approved">
              <i class="fas fa-check-circle"></i>
             <p class="amount">₹ {{ summary.approved }}</p>
              <span>Approved</span>
            </div>

            <div class="summary-card rejected">
              <i class="fas fa-times-circle"></i>
              <p class="amount">₹ {{ summary.rejected }}</p>
              <span>Rejected</span>
            </div> -->
          </div>

          <!-- CATEGORIES -->
          <div class="expense-categories">
            <div
  class="category-card"
  :class="{ active: selectedCategory === 'Electricity' }"
  @click="filterByCategory('Electricity')"
>
  <i class="fas fa-bolt"></i>
  <p>Electricity</p>
</div>

<div
  class="category-card"
  :class="{ active: selectedCategory === 'Internet' }"
  @click="filterByCategory('Internet')"
>
  <i class="fas fa-wifi"></i>
  <p>Internet</p>
</div>

<div
  class="category-card"
  :class="{ active: selectedCategory === 'Maintenance' }"
  @click="filterByCategory('Maintenance')"
>
  <i class="fas fa-tools"></i>
  <p>Maintenance</p>
</div>

<div
  class="category-card"
  :class="{ active: selectedCategory === 'Office Supplies' }"
  @click="filterByCategory('Office Supplies')"
>
  <i class="fas fa-print"></i>
  <p>Office Supplies</p>
</div>

<div
  class="category-card"
  :class="{ active: selectedCategory === 'Travel' }"
  @click="filterByCategory('Travel')"
>
  <i class="fas fa-car"></i>
  <p>Travel</p>
</div>

<div
  class="category-card"
  :class="{ active: selectedCategory === 'Miscellaneous' }"
  @click="filterByCategory('Miscellaneous')"
>
  <i class="fas fa-file-invoice"></i>
  <p>Miscellaneous</p>
</div>

          </div>
          <!-- EXPENSE LIST TABLE -->
<div class="expense-table-box">
  <h3>Expense List</h3>

  <div class="table-wrapper">
    <table class="expense-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Description</th>

          <th>Category</th>
          <th>Amount (₹)</th>
          <!-- <th>Status</th> -->
          <th>Date</th>
          <th style="text-align:center;">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="expenses.length === 0">
          <td colspan="7" class="no-data">No expenses found</td>
        </tr>

        <tr v-for="(expense, index) in expenses" :key="expense.id">
          <td>{{ index + 1 }}</td>
          <td>{{ expense.title }}</td>
          <td>{{ expense.remarks }}</td>

          <td>{{ expense.category }}</td>
          <td>₹ {{ expense.amount }}</td>

          <!-- <td>
            <span
              class="status-badge"
              :class="expense.status"
            >
              {{ expense.status }}
            </span>
          </td> -->

          <td>{{ formatDate(expense.expense_date) }}</td>

          <td class="action-btns">
            <button class="btn-edit" @click="editExpense(expense)">
              <i class="fas fa-edit"></i>
            </button>

            <button class="btn-delete" @click="deleteExpense(expense.id)">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

        </div>
    
        <!-- ADD EXPENSE MODAL -->
<div class="modal-overlay" v-if="showExpenseModal" @click.self="closeExpenseModal">
  <div class="modal-box">
    <h3>Add Office Expense</h3>

    <div class="modal-form">
      <input type="text" v-model="expenseForm.title" placeholder="Expense Title" />
<input type="number" v-model="expenseForm.amount" placeholder="Amount (₹)" />

<select v-model="expenseForm.category">
  <option value="">Select Category</option>
  <option>Electricity</option>
  <option>Internet</option>
  <option>Maintenance</option>
  <option>Office Supplies</option>
  <option>Travel</option>
  <option>Miscellaneous</option>
</select>

<textarea v-model="expenseForm.remarks" placeholder="Remarks"></textarea>

    </div>

    <div class="modal-actions">
      <button class="btn-cancel" @click="closeExpenseModal">Cancel</button>
     <button class="btn-save" @click="saveExpense">Save Expense</button>
    </div>
  </div>
</div>

      </section>
    </div>
  </div>
</template>

<script>
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
    showExpenseModal: false,

    allExpenses: [],   // 🔹 master list
    expenses: [],      // 🔹 filtered list

    selectedCategory: '',

    summary: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },

    expenseForm: {
      title: '',
      amount: '',
      category: '',
      remarks: ''
    }
  }
},


  methods: {
    filterByCategory(category) {
  // Toggle behavior
  if (this.selectedCategory === category) {
    this.selectedCategory = ''
    this.expenses = this.allExpenses
    return
  }

  this.selectedCategory = category

  this.expenses = this.allExpenses.filter(
    expense => expense.category === category
  )
},
    formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN')
},

editExpense(expense) {
  this.expenseForm = { ...expense }
  this.showExpenseModal = true
},

async deleteExpense(id) {
  if (!confirm('Delete this expense?')) return

  const token = localStorage.getItem('token')

  await fetch(
    `https://employees.archenterprises.co.in/api/api/office-expenses/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  this.fetchExpenses()
},

async saveExpense() {
  const token = localStorage.getItem('token')
  const url = this.expenseForm.id
    ? `https://employees.archenterprises.co.in/api/api/office-expenses/${this.expenseForm.id}`
    : `https://employees.archenterprises.co.in/api/api/office-expenses`

  const method = this.expenseForm.id ? 'PUT' : 'POST'

  await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(this.expenseForm)
  })

  this.closeExpenseModal()
  this.expenseForm = { title:'', amount:'', category:'', remarks:'' }
  this.fetchExpenses()
},


 async fetchExpenses() {
  const token = localStorage.getItem('token')

  const res = await fetch(
    'https://employees.archenterprises.co.in/api/api/office-expenses',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const data = await res.json()

  this.allExpenses = data.expenses
  this.expenses = data.expenses   // initially show all
  this.summary = data.summary
},

     openExpenseModal() {
    this.showExpenseModal = true
  },

  closeExpenseModal() {
    this.showExpenseModal = false
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
.category-card.active {
  background: var(--primary);
  color: #fff;
  transform: translateY(-5px);
}

h2 {
  margin-bottom: 30px;
  color: var(--text);
  font-weight: 800;
  font-size: 21px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
  text-transform: uppercase;
}
/* ===== EXISTING STYLES ===== */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  background-color: var(--primary);
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

.content {
  flex: 1;
  background-color: var(--sidebar);
  padding: 30px 40px;
  border-radius: 15px;
}

/* ===== EXPENSE SECTION ===== */
.expense-box {
  background: #fff;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 12px 35px rgba(0,0,0,0.08);
}

.expense-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.expense-header h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.add-expense-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.add-expense-btn i {
  margin-right: 6px;
}

/* Summary */
.expense-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
  margin-bottom: 30px;
}

.summary-card {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  padding: 22px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 22px rgba(0,0,0,0.07);
  transition: 0.3s;
}

.summary-card:hover {
  transform: translateY(-6px);
}

.summary-card i {
  font-size: 26px;
  color: var(--primary);
  margin-bottom: 8px;
}

.summary-card .amount {
  font-size: 18px;
  font-weight: 800;
}

.summary-card span {
  font-size: 13px;
  opacity: 0.85;
}

.approved i { color: #16a34a; }
.rejected i { color: #dc2626; }

/* Categories */
.expense-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 16px;
}

.category-card {
  background: #f8fafc;
  padding: 18px;
  border-radius: 14px;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
  transition: 0.3s;
  cursor: pointer;
}

.category-card:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-5px);
}

.category-card i {
  font-size: 22px;
  margin-bottom: 6px;
}
/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-box {
  background: #fff;
  width: 420px;
  max-width: 95%;
  border-radius: 18px;
  padding: 25px;
  box-shadow: 0 20px 45px rgba(0,0,0,0.2);
  animation: popup 0.3s ease;
}

@keyframes popup {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-box h3 {
  margin-bottom: 18px;
  color: var(--primary);
  font-weight: 800;
}

.modal-form input,
.modal-form select,
.modal-form textarea {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.modal-form textarea {
  resize: none;
  height: 80px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #e5e7eb;
  border: none;
  padding: 9px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save {
  background: var(--primary);
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.header {
  background-color: var(--primary);
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  /* Sticky Header */
  position: sticky;
  top: 0;
  z-index: 1000; /* Ensure it stays above other content */
}
.head-title{
    color: #fff;
    display: flex;
    gap: 7px;
    text-decoration: none;
    font-family: cursive;
    align-items: center;
    width: 100%;
        font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;

}
.expense-table-box {
  margin-top: 25px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,.08);
}

.expense-table-box h3 {
  margin-bottom: 15px;
  color: #034081;
}

.table-wrapper {
  overflow-x: auto;
}

.expense-table {
  width: 100%;
  border-collapse: collapse;
}

.expense-table th,
.expense-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  text-align-last: center;
}

.expense-table th {
  background: #f5f8ff;
  color: #034081;
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #777;
}

/* STATUS BADGES */
.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  text-transform: capitalize;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

/* ACTION BUTTONS */
.action-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-edit,
.btn-delete {
  border: none;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-edit {
  background: #e3f2fd;
  color: #0d6efd;
}

.btn-delete {
  background: #fdecea;
  color: #dc3545;
}

</style>
