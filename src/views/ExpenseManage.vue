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
            <h3>Office Expense Management</h3>
          <button class="add-expense-btn" @click="openExpenseModal">
  <i class="fas fa-plus"></i> Add Expense
</button>

          </div>

          <!-- SUMMARY -->
          <div class="expense-summary">
            <div class="summary-card">
              <i class="fas fa-wallet"></i>
              <p class="amount">₹ 1,25,000</p>
              <span>Total Expenses</span>
            </div>

            <div class="summary-card">
              <i class="fas fa-hourglass-half"></i>
              <p class="amount">₹ 32,000</p>
              <span>Pending Approval</span>
            </div>

            <div class="summary-card approved">
              <i class="fas fa-check-circle"></i>
              <p class="amount">₹ 78,000</p>
              <span>Approved</span>
            </div>

            <div class="summary-card rejected">
              <i class="fas fa-times-circle"></i>
              <p class="amount">₹ 15,000</p>
              <span>Rejected</span>
            </div>
          </div>

          <!-- CATEGORIES -->
          <div class="expense-categories">
            <div class="category-card">
              <i class="fas fa-bolt"></i>
              <p>Electricity</p>
            </div>

            <div class="category-card">
              <i class="fas fa-wifi"></i>
              <p>Internet</p>
            </div>

            <div class="category-card">
              <i class="fas fa-tools"></i>
              <p>Maintenance</p>
            </div>

            <div class="category-card">
              <i class="fas fa-print"></i>
              <p>Office Supplies</p>
            </div>

            <div class="category-card">
              <i class="fas fa-car"></i>
              <p>Travel</p>
            </div>

            <div class="category-card">
              <i class="fas fa-file-invoice"></i>
              <p>Miscellaneous</p>
            </div>
          </div>
        </div>
    
        <!-- ADD EXPENSE MODAL -->
<div class="modal-overlay" v-if="showExpenseModal" @click.self="closeExpenseModal">
  <div class="modal-box">
    <h3>Add Office Expense</h3>

    <div class="modal-form">
      <input type="text" placeholder="Expense Title" />
      <input type="number" placeholder="Amount (₹)" />
      
      <select>
        <option value="">Select Category</option>
        <option>Electricity</option>
        <option>Internet</option>
        <option>Maintenance</option>
        <option>Office Supplies</option>
        <option>Travel</option>
        <option>Miscellaneous</option>
      </select>

      <textarea placeholder="Remarks (optional)"></textarea>
    </div>

    <div class="modal-actions">
      <button class="btn-cancel" @click="closeExpenseModal">Cancel</button>
      <button class="btn-save">Save Expense</button>
    </div>
  </div>
</div>

      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'

export default {
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
          showExpenseModal: false
    }
  },

  methods: {
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
</style>
