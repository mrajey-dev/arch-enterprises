<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div>
              <h1>Generate Salary Slip</h1>
              <p class="subtitle-modern">Create professional salary slips for employees</p>
            </div>
          </div>
          <button class="register-btn-modern secondary" @click="openSalarySlipModal">
            <i class="fas fa-list-alt"></i>
            <span>View All Salary Slips</span>
          </button>
        </div>

        <!-- Business Selection Card -->
        <div class="business-selector">
          <div 
            class="business-card" 
            :class="{ active: selectedBusiness === 'arch-enterprises' }"
            @click="selectedBusiness = 'arch-enterprises'"
          >
            <div class="business-icon">
              <i class="fas fa-building"></i>
            </div>
            <h3>Arch Enterprises</h3>
            <p>IT Solutions | Software Development</p>
          </div>
          <div 
            class="business-card" 
            :class="{ active: selectedBusiness === 'arch-it-solutions' }"
            @click="selectedBusiness = 'arch-it-solutions'"
          >
            <div class="business-icon">
              <i class="fas fa-laptop-code"></i>
            </div>
            <h3>Arch IT Solutions</h3>
            <p>IT Consulting | Digital Services</p>
          </div>
        </div>

        <!-- Form Section -->
        <div class="form-card-premium">
          <div class="section-title-modern">
            <i class="fas fa-edit"></i>
            <span>Employee Details</span>
          </div>

          <div class="form-grid-premium">
            <!-- Employee Selection Dropdown -->
            <div class="form-field">
              <label>Select Employee <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-user-tie field-icon"></i>
                <select v-model="selectedEmployeeId" @change="fetchEmployeeDetails">
                  <option disabled value="">Select an employee</option>
                  <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                    {{ employee.name }} (ID: {{ employee.id }})
                  </option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label>Employee Name <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-user field-icon"></i>
                <input v-model="form.employeeName" type="text" placeholder="Enter employee name" />
              </div>
            </div>

            <div class="form-field">
              <label>Employee ID <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-id-card field-icon"></i>
                <input v-model="form.employeeId" type="text" placeholder="Enter employee ID" />
              </div>
            </div>

            <div class="form-field">
              <label>Designation <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-briefcase field-icon"></i>
                <input v-model="form.designation" type="text" placeholder="Enter designation" />
              </div>
            </div>

            <div class="form-field">
              <label>Department <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-users field-icon"></i>
                <select v-model="form.department">
                  <option disabled value="">Select department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Development">Development</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label>Salary Month <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-calendar-alt field-icon"></i>
                <select v-model="form.salaryMonth">
                  <option disabled value="">Select month</option>
                  <option v-for="month in months" :key="month.value" :value="month.value">
                    {{ month.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label>Salary Year <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-calendar-year field-icon"></i>
                <select v-model="form.salaryYear">
                  <option disabled value="">Select year</option>
                  <option v-for="year in years" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Bulk Generate Section -->
          <div class="section-title-modern" style="margin-top: 20px;">
            <i class="fas fa-layer-group"></i>
            <span>Bulk Generate Previous Months</span>
          </div>

          <div class="bulk-generate-section">
            <div class="bulk-generate-info">
              <i class="fas fa-info-circle"></i>
              <span>Generate salary slips for multiple previous months at once</span>
            </div>
            <div class="bulk-controls">
              <div class="bulk-input-group">
                <label>Number of months back:</label>
                <select v-model.number="bulkMonthsCount" class="bulk-select">
                  <option value="1">1 Month</option>
                  <option value="2">2 Months</option>
                  <option value="3">3 Months</option>
                  <option value="4">4 Months</option>
                  <option value="5">5 Months</option>
                  <option value="6">6 Months</option>
                </select>
              </div>
              <button class="btn-bulk-generate" @click="generateBulkSalarySlips" :disabled="!canGenerateBulk">
                <i class="fas fa-copy"></i> Generate Last {{ bulkMonthsCount }} Month{{ bulkMonthsCount > 1 ? 's' : '' }}
              </button>
            </div>
            
            <!-- Preview of months to generate -->
            <div v-if="bulkMonthsCount > 0 && selectedEmployeeId" class="bulk-preview">
              <div class="preview-title">Will generate salary slips for:</div>
              <div class="months-preview">
                <span v-for="(month, index) in getPreviousMonths()" :key="index" class="month-tag">
                  {{ month.month }} {{ month.year }}
                </span>
              </div>
            </div>
          </div>

          <div class="section-title-modern" style="margin-top: 20px;">
            <i class="fas fa-chart-line"></i>
            <span>Earnings & Deductions</span>
          </div>

          <div class="salary-breakdown">
            <div class="earnings-section">
              <h4>Earnings</h4>
              <div class="breakdown-field">
                <label>Basic Salary</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input v-model.number="form.basicSalary" type="number" placeholder="Basic Salary" @input="calculateTotal" />
                </div>
              </div>
              <div class="breakdown-field">
                <label>HRA</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input v-model.number="form.hra" type="number" placeholder="HRA" @input="calculateTotal" />
                </div>
              </div>
              <div class="breakdown-field">
                <label>DA</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input v-model.number="form.da" type="number" placeholder="Dearness Allowance" @input="calculateTotal" />
                </div>
              </div>
              <div class="breakdown-field">
                <label>Conveyance Allowance</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input v-model.number="form.conveyance" type="number" placeholder="Conveyance" @input="calculateTotal" />
                </div>
              </div>
              <div class="breakdown-field">
                <label>Special Allowance</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input v-model.number="form.specialAllowance" type="number" placeholder="Special Allowance" @input="calculateTotal" />
                </div>
              </div>
              <div class="breakdown-field total-field">
                <label>Total Earnings</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input :value="totalEarnings" type="text" disabled class="total-input" />
                </div>
              </div>
            </div>

            <div class="deductions-section">
              <h4>Deductions</h4>
              <div class="breakdown-field">
                <label>PF</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input v-model.number="form.pf" type="number" placeholder="PF" @input="calculateTotal" />
                </div>
              </div>
              <div class="breakdown-field">
                <label>Professional Tax</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input v-model.number="form.professionalTax" type="number" placeholder="Professional Tax" @input="calculateTotal" />
                </div>
              </div>
              <div class="breakdown-field">
                <label>TDS</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input v-model.number="form.tds" type="number" placeholder="TDS" @input="calculateTotal" />
                </div>
              </div>
              <div class="breakdown-field">
                <label>Loan/Advance</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input v-model.number="form.loan" type="number" placeholder="Loan/Advance" @input="calculateTotal" />
                </div>
              </div>
              <div class="breakdown-field total-field">
                <label>Total Deductions</label>
                <div class="field-wrapper">
                  <i class="fas fa-rupee-sign field-icon"></i>
                  <input :value="totalDeductions" type="text" disabled class="total-input negative" />
                </div>
              </div>
            </div>
          </div>

          <div class="net-salary-card">
            <div class="net-salary-label">Net Salary</div>
            <div class="net-salary-amount">₹{{ formatAmount(netSalary) }}</div>
          </div>

          <div class="form-actions">
            <button class="btn-submit-premium" @click="generatePDF">
              <i class="fas fa-file-pdf"></i> Generate Current Salary Slip
            </button>
            <button class="btn-submit-premium secondary" @click="resetForm">
              <i class="fas fa-undo-alt"></i> Reset
            </button>
          </div>
        </div>

        <!-- Salary Slip Preview -->
        <div class="preview-section">
          <div class="section-title-modern">
            <i class="fas fa-eye"></i>
            <span>Salary Slip Preview</span>
          </div>

          <div ref="salarySlip" class="salary-slip-premium" :class="businessClass">
            <div class="top-accent" :class="businessAccentClass"></div>

            <div class="slip-header">
              <img :src="businessLogo" class="company-logo" alt="Logo" />
              <div class="company-details">
                <h2>{{ businessName }}</h2>
                <p>{{ businessAddress }}</p>
                <p>{{ businessContact }}</p>
              </div>
              <div class="slip-label">
                <h3>SALARY SLIP</h3>
                <p>{{ form.salaryMonth }} {{ form.salaryYear }}</p>
              </div>
            </div>

            <div class="divider"></div>

            <div class="employee-info-section">
              <div class="info-row">
                <div class="info-item">
                  <label>Employee Name:</label>
                  <span>{{ form.employeeName || '________' }}</span>
                </div>
                <div class="info-item">
                  <label>Employee ID:</label>
                  <span>{{ form.employeeId || '________' }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item">
                  <label>Designation:</label>
                  <span>{{ form.designation || '________' }}</span>
                </div>
                <div class="info-item">
                  <label>Department:</label>
                  <span>{{ form.department || '________' }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item">
                  <label>Salary Month:</label>
                  <span>{{ form.salaryMonth }} {{ form.salaryYear }}</span>
                </div>
                <div class="info-item">
                  <label>Payment Date:</label>
                  <span>{{ todayDate }}</span>
                </div>
              </div>
            </div>

            <div class="salary-table-wrapper">
              <table class="salary-table">
                <thead>
                  <tr>
                    <th>Earnings</th>
                    <th>Amount (₹)</th>
                    <th>Deductions</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Salary</td>
                    <td>{{ formatAmount(form.basicSalary) }}</td>
                    <td>PF</td>
                    <td>{{ formatAmount(form.pf) }}</td>
                  </tr>
                  <tr>
                    <td>HRA</td>
                    <td>{{ formatAmount(form.hra) }}</td>
                    <td>Professional Tax</td>
                    <td>{{ formatAmount(form.professionalTax) }}</td>
                  </tr>
                  <tr>
                    <td>DA</td>
                    <td>{{ formatAmount(form.da) }}</td>
                    <td>TDS</td>
                    <td>{{ formatAmount(form.tds) }}</td>
                  </tr>
                  <tr>
                    <td>Conveyance</td>
                    <td>{{ formatAmount(form.conveyance) }}</td>
                    <td>Loan/Advance</td>
                    <td>{{ formatAmount(form.loan) }}</td>
                  </tr>
                  <tr>
                    <td>Special Allowance</td>
                    <td>{{ formatAmount(form.specialAllowance) }}</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Total Earnings</strong></td>
                    <td><strong>{{ formatAmount(totalEarnings) }}</strong></td>
                    <td><strong>Total Deductions</strong></td>
                    <td><strong>{{ formatAmount(totalDeductions) }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="net-salary-section">
              <div class="net-salary-box">
                <label>NET SALARY</label>
                <div class="net-amount">₹ {{ formatAmount(netSalary) }}</div>
                <div class="amount-words">({{ amountInWords }} Only)</div>
              </div>
            </div>

            <div class="signature-section">
              <div class="sign-block">
                <div class="sign-line"></div>
                <strong>Authorized Signatory</strong>
              </div>
              <div class="sign-block">
                <div class="sign-line"></div>
                <strong>Employee Signature</strong>
              </div>
            </div>

            <div class="slip-footer">
              <div class="footer-divider"></div>
              <div class="footer-content">
                <div class="footer-left">
                  <p><strong>{{ businessName }}</strong></p>
                  <p>{{ businessTagline }}</p>
                </div>
                <div class="footer-right">
                  <p>{{ businessWebsite }}</p>
                  <p>{{ businessEmail }}</p>
                  <p>{{ businessPhone }}</p>
                </div>
              </div>
              <div class="footer-bottom">
                <p>This is a computer generated salary slip and does not require a physical signature.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Salary Slip List Modal -->
        <transition name="modal-fade">
          <div v-if="showSalarySlipModal" class="modal-backdrop" @click.self="closeSalarySlipModal">
            <div class="premium-modal large-modal" @click.stop>
              <div class="modal-decoration"></div>
              
              <div class="modal-header-premium">
                <div class="header-icon-premium">
                  <i class="fas fa-file-invoice"></i>
                </div>
                <div class="header-text">
                  <h2>All Salary Slips</h2>
                  <p>Manage and view generated salary slips</p>
                </div>
                <button class="close-btn-premium" @click="closeSalarySlipModal">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="modal-body-premium">
                <div class="filter-section">
                  <select v-model="filterBusiness" class="filter-select">
                    <option value="all">All Businesses</option>
                    <option value="arch-enterprises">Arch Enterprises</option>
                    <option value="arch-it-solutions">Arch IT Solutions</option>
                  </select>
                  <input type="text" v-model="searchQuery" placeholder="Search by name or ID..." class="search-input" />
                </div>

                <div class="table-wrapper-premium">
                  <table class="offer-table-premium">
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Employee ID</th>
                        <th>Business</th>
                        <th>Month/Year</th>
                        <th>Net Salary</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="slip in filteredSalarySlips" :key="slip.id">
                        <td class="employee-cell">
                          <div class="employee-info">
                            <div class="employee-avatar-small">
                              {{ getInitials(slip.employee_name) }}
                            </div>
                            <span>{{ slip.employee_name }}</span>
                          </div>
                        </td>
                        <td>{{ slip.employee_id }}</td>
                        <td>
                          <span class="business-badge" :class="getBusinessClass(slip.business)">
                            {{ slip.business === 'arch-enterprises' ? 'Arch Enterprises' : 'Arch IT Solutions' }}
                          </span>
                        </td>
                        <td class="date-cell">{{ slip.salary_month }} {{ slip.salary_year }}</td>
                        <td class="amount-cell">₹{{ formatAmount(slip.net_salary) }}</td>
                        <td>
                          <div class="action-group">
                            <button class="action-icon view" @click="viewSalarySlip(slip)" title="View">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-icon edit" @click="editSalarySlip(slip)" title="Edit">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-icon delete" @click="deleteSalarySlip(slip.id)" title="Delete">
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="filteredSalarySlips.length === 0" class="empty-row">
                        <td colspan="6">
                          <div class="empty-state-small">
                            <i class="fas fa-inbox"></i>
                            <p>No salary slips found</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button class="btn-submit-premium" @click="closeSalarySlipModal">
                  <i class="fas fa-check"></i> Close
                </button>
              </div>
            </div>
          </div>
        </transition>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import html2pdf from "html2pdf.js"
import archLogo from '@/assets/logo.png'
import archItLogo from '@/assets/logo-it.png'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },

  data() {
    return {
      editingId: null,
      isMobile: false,
      isSidebarVisible: true,
      showSalarySlipModal: false,
      filterBusiness: 'all',
      searchQuery: '',
      salarySlips: [],
      employees: [],
      selectedEmployeeId: '',
      selectedBusiness: 'arch-enterprises',
      bulkMonthsCount: 1,
      months: [
        { value: 'January', label: 'January' },
        { value: 'February', label: 'February' },
        { value: 'March', label: 'March' },
        { value: 'April', label: 'April' },
        { value: 'May', label: 'May' },
        { value: 'June', label: 'June' },
        { value: 'July', label: 'July' },
        { value: 'August', label: 'August' },
        { value: 'September', label: 'September' },
        { value: 'October', label: 'October' },
        { value: 'November', label: 'November' },
        { value: 'December', label: 'December' }
      ],
      years: [],
      form: {
        employeeName: '',
        employeeId: '',
        designation: '',
        department: '',
        salaryMonth: '',
        salaryYear: new Date().getFullYear(),
        basicSalary: 0,
        hra: 0,
        da: 0,
        conveyance: 0,
        specialAllowance: 0,
        pf: 0,
        professionalTax: 0,
        tds: 0,
        loan: 0
      }
    }
  },
  computed: {
    businessName() {
      return this.selectedBusiness === 'arch-enterprises' 
        ? 'Arch Enterprises' 
        : 'Arch IT Solutions';
    },
    businessAddress() {
      return this.selectedBusiness === 'arch-enterprises'
        ? 'Plot No. 49, Prathamesh, Khutwadnagar, Nashik, Maharashtra - 422008'
        : 'Plot No. 49, Prathamesh, Khutwadnagar, Nashik, Maharashtra - 422008';
    },
    businessContact() {
      return this.selectedBusiness === 'arch-enterprises'
        ? 'Email: contact@archenterprises.co.in | +91 8390704453'
        : 'Email: contact@archenterprises.co.in | +91 8390704453';
    },
    businessLogo() {
      return this.selectedBusiness === 'arch-enterprises' ? archLogo : archItLogo;
    },
    businessTagline() {
      return this.selectedBusiness === 'arch-enterprises'
        ? 'IT Solutions | Software Development | Cloud Services'
        : 'IT Consulting | Digital Transformation | Web Solutions';
    },
    businessWebsite() {
      return this.selectedBusiness === 'arch-enterprises'
        ? 'www.archenterprises.co.in'
        : 'www.it.archenterprises.co.in';
    },
    businessEmail() {
      return this.selectedBusiness === 'arch-enterprises'
        ? 'contact@archenterprises.co.in'
        : 'contact@archenterprises.co.in';
    },
    businessPhone() {
      return this.selectedBusiness === 'arch-enterprises' ? '+91 8390704453' : '+91 8390704453';
    },
    businessClass() {
      return this.selectedBusiness === 'arch-enterprises' ? 'arch-enterprises-theme' : 'arch-it-solutions-theme';
    },
    businessAccentClass() {
      return this.selectedBusiness === 'arch-enterprises' ? 'accent-enterprises' : 'accent-it-solutions';
    },
    todayDate() {
      return this.formatDate(new Date())
    },
    totalEarnings() {
      return (this.form.basicSalary || 0) + 
             (this.form.hra || 0) + 
             (this.form.da || 0) + 
             (this.form.conveyance || 0) + 
             (this.form.specialAllowance || 0);
    },
    totalDeductions() {
      return (this.form.pf || 0) + 
             (this.form.professionalTax || 0) + 
             (this.form.tds || 0) + 
             (this.form.loan || 0);
    },
    netSalary() {
      return this.totalEarnings - this.totalDeductions;
    },
    filteredSalarySlips() {
      let filtered = this.salarySlips;
      
      if (this.filterBusiness !== 'all') {
        filtered = filtered.filter(slip => slip.business === this.filterBusiness);
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(slip => 
          slip.employee_name.toLowerCase().includes(query) ||
          slip.employee_id.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    },
    amountInWords() {
      return this.numberToWords(this.netSalary);
    },
    canGenerateBulk() {
      return this.selectedEmployeeId && this.form.employeeName && this.form.basicSalary > 0;
    }
  },
  methods: {
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    formatAmount(amount) {
      if (!amount) return '0';
      return parseFloat(amount).toLocaleString('en-IN');
    },
    formatDate(date) {
      const options = { day: '2-digit', month: 'short', year: 'numeric' }
      return date.toLocaleDateString('en-GB', options)
    },
    calculateTotal() {
      // This method triggers reactivity for computed properties
    },
    
    // Get previous months based on count
    getPreviousMonths() {
      const months = [];
      const currentDate = new Date();
      const currentMonthIndex = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      for (let i = 1; i <= this.bulkMonthsCount; i++) {
        let monthIndex = currentMonthIndex - i;
        let year = currentYear;
        
        if (monthIndex < 0) {
          monthIndex = 12 + monthIndex;
          year = currentYear - 1;
        }
        
        months.push({
          month: this.months[monthIndex].label,
          year: year,
          monthValue: this.months[monthIndex].value
        });
      }
      
      return months;
    },
    
    // Generate multiple salary slips for previous months
    async generateBulkSalarySlips() {
      if (!this.canGenerateBulk) {
        toastWarning("Please select an employee and fill basic salary details first");
        return;
      }
      
      const previousMonths = this.getPreviousMonths();
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      
      // Show loading indicator
      toastWarning("Generating salary slips... This may take a moment.");
      
      for (const monthData of previousMonths) {
        try {
          // Check if salary slip already exists for this month
          const existingSlip = this.salarySlips.find(slip => 
            slip.employee_id === this.form.employeeId && 
            slip.salary_month === monthData.monthValue && 
            slip.salary_year === monthData.year &&
            slip.business === this.selectedBusiness
          );
          
          if (existingSlip) {
            console.log(`Salary slip for ${monthData.month} ${monthData.year} already exists, skipping...`);
            skippedCount++;
            continue;
          }
          
          // Format all data properly for API
          const saveData = {
            employeeName: String(this.form.employeeName || ''),
            employeeId: String(this.form.employeeId || ''),
            designation: String(this.form.designation || ''),
            department: String(this.form.department || ''),
            salaryMonth: String(monthData.monthValue),
            salaryYear: String(monthData.year),
            basicSalary: Number(this.form.basicSalary) || 0,
            hra: Number(this.form.hra) || 0,
            da: Number(this.form.da) || 0,
            conveyance: Number(this.form.conveyance) || 0,
            specialAllowance: Number(this.form.specialAllowance) || 0,
            pf: Number(this.form.pf) || 0,
            professionalTax: Number(this.form.professionalTax) || 0,
            tds: Number(this.form.tds) || 0,
            loan: Number(this.form.loan) || 0,
            business: String(this.selectedBusiness),
            net_salary: Number(this.netSalary),
            total_earnings: Number(this.totalEarnings),
            total_deductions: Number(this.totalDeductions)
          };
          
          await axios.post("https://employees.archenterprises.co.in/api/api/salary-slips", saveData);
          successCount++;
          
        } catch (error) {
          console.error(`Error generating salary slip for ${monthData.month} ${monthData.year}:`, error);
          console.error('Error details:', error.response?.data);
          errorCount++;
        }
      }
      
      // Refresh the salary slips list
      await this.refreshSalarySlips();
      
      if (successCount > 0) {
        toastSuccess(`Successfully generated ${successCount} salary slip(s) for previous months!`);
      }
      
      if (skippedCount > 0) {
        toastWarning(`Skipped ${skippedCount} month(s) that already had salary slips.`);
      }
      
      if (errorCount > 0) {
        toastError(`Failed to generate ${errorCount} salary slip(s). Please check and try again.`);
      }
      
      if (successCount === 0 && errorCount === 0 && skippedCount === 0) {
        toastWarning("No salary slips were generated. Please check your input.");
      }
    },
    
    async refreshSalarySlips() {
      try {
        const response = await axios.get("https://employees.archenterprises.co.in/api/api/salary-slips");
        this.salarySlips = response.data;
      } catch (error) {
        console.error("Error refreshing salary slips:", error);
      }
    },
    
    numberToWords(num) {
      if (num === 0 || !num) return 'Zero';
      
      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      const numToWords = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
        if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
        if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
        return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
      };
      
      const rupees = Math.floor(num);
      const paise = Math.round((num - rupees) * 100);
      
      let words = numToWords(rupees) + ' Rupees';
      if (paise > 0) {
        words += ' and ' + numToWords(paise) + ' Paise';
      }
      
      return words;
    },
    
    // Fetch all employees from users table
    async fetchEmployees() {
      try {
        const response = await axios.get("https://employees.archenterprises.co.in/api/api/users")
        this.employees = response.data
        console.log("Employees loaded:", this.employees)
        toastSuccess("Employees loaded successfully")
      } catch (error) {
        console.error("Error fetching employees:", error)
        try {
          const response = await axios.get("https://employees.archenterprises.co.in/api/api/employees")
          this.employees = response.data
          toastSuccess("Employees loaded successfully")
        } catch (err) {
          console.error("Alternative endpoint also failed:", err)
          toastError("Failed to load employees. Please check the API endpoint.")
          this.employees = [
            { id: 1, name: "John Doe", employee_id: "EMP001", department: "IT", keyresponsibility: 50000 },
            { id: 2, name: "Jane Smith", employee_id: "EMP002", department: "HR", keyresponsibility: 45000 },
            { id: 3, name: "Mike Johnson", employee_id: "EMP003", department: "Finance", keyresponsibility: 55000 }
          ]
        }
      }
    },
    
    // Fetch employee details when selected
    async fetchEmployeeDetails() {
      if (!this.selectedEmployeeId) return
      
      const selectedEmployee = this.employees.find(emp => emp.id == this.selectedEmployeeId || emp.employee_id == this.selectedEmployeeId)
      
      if (selectedEmployee) {
        this.form.employeeName = String(selectedEmployee.name || selectedEmployee.employee_name || '')
        this.form.employeeId = String(selectedEmployee.employee_id || selectedEmployee.id || '')
        this.form.department = String(selectedEmployee.department || '')
        
        let basicSalary = 0
        if (selectedEmployee.keyresponsibility) {
          basicSalary = parseFloat(selectedEmployee.keyresponsibility)
        } else if (selectedEmployee.basic_salary) {
          basicSalary = parseFloat(selectedEmployee.basic_salary)
        } else if (selectedEmployee.salary) {
          basicSalary = parseFloat(selectedEmployee.salary)
        }
        
        this.form.basicSalary = basicSalary
        
        toastSuccess(`Employee ${this.form.employeeName} details loaded successfully`)
      } else {
        toastError("Employee not found")
      }
    },
    
    resetForm() {
      this.form = {
        employeeName: '',
        employeeId: '',
        designation: '',
        department: '',
        salaryMonth: '',
        salaryYear: new Date().getFullYear(),
        basicSalary: 0,
        hra: 0,
        da: 0,
        conveyance: 0,
        specialAllowance: 0,
        pf: 0,
        professionalTax: 0,
        tds: 0,
        loan: 0
      };
      this.selectedEmployeeId = '';
      this.editingId = null;
      this.bulkMonthsCount = 1;
      toastSuccess('Form reset successfully');
    },
    getBusinessClass(business) {
      return business === 'arch-enterprises' ? 'business-enterprises' : 'business-it-solutions';
    },
    async openSalarySlipModal() {
      try {
        const response = await axios.get("https://employees.archenterprises.co.in/api/api/salary-slips")
        this.salarySlips = response.data
        this.showSalarySlipModal = true
      } catch (error) {
        console.error(error)
        toastError("Failed to load salary slips")
      }
    },
    closeSalarySlipModal() {
      this.showSalarySlipModal = false
      this.filterBusiness = 'all';
      this.searchQuery = '';
    },
    async viewSalarySlip(slip) {
      this.form = {
        employeeName: String(slip.employee_name || ''),
        employeeId: String(slip.employee_id || ''),
        designation: String(slip.designation || ''),
        department: String(slip.department || ''),
        salaryMonth: String(slip.salary_month || ''),
        salaryYear: String(slip.salary_year || new Date().getFullYear()),
        basicSalary: Number(slip.basic_salary) || 0,
        hra: Number(slip.hra) || 0,
        da: Number(slip.da) || 0,
        conveyance: Number(slip.conveyance) || 0,
        specialAllowance: Number(slip.special_allowance) || 0,
        pf: Number(slip.pf) || 0,
        professionalTax: Number(slip.professional_tax) || 0,
        tds: Number(slip.tds) || 0,
        loan: Number(slip.loan) || 0
      };
      this.selectedBusiness = slip.business || 'arch-enterprises';
      this.showSalarySlipModal = false;
      this.$nextTick(() => {
        this.$refs.salarySlip.scrollIntoView({ behavior: 'smooth' })
      });
      toastSuccess('Loading salary slip preview...');
    },
    async editSalarySlip(slip) {
      await this.viewSalarySlip(slip);
      this.editingId = slip.id;
      toastSuccess('Salary slip loaded for editing...');
    },
    async deleteSalarySlip(id) {
      if (!confirm("Are you sure you want to delete this salary slip?")) return
      try {
        await axios.delete(`https://employees.archenterprises.co.in/api/api/salary-slips/${id}`)
        this.salarySlips = this.salarySlips.filter(slip => slip.id !== id)
        toastSuccess("Salary slip deleted successfully")
      } catch (error) {
        console.error(error)
        toastError("Failed to delete salary slip")
      }
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    async generatePDF() {
      if (!this.form.employeeName || !this.form.employeeId || !this.form.designation || !this.form.salaryMonth) {
        toastWarning("Please fill all required fields")
        return
      }

      if (this.netSalary < 0) {
        toastWarning("Deductions cannot exceed earnings")
        return
      }

      try {
        // Format all data properly for API
        const saveData = {
          employeeName: String(this.form.employeeName || ''),
          employeeId: String(this.form.employeeId || ''),
          designation: String(this.form.designation || ''),
          department: String(this.form.department || ''),
          salaryMonth: String(this.form.salaryMonth),
          salaryYear: String(this.form.salaryYear),
          basicSalary: Number(this.form.basicSalary) || 0,
          hra: Number(this.form.hra) || 0,
          da: Number(this.form.da) || 0,
          conveyance: Number(this.form.conveyance) || 0,
          specialAllowance: Number(this.form.specialAllowance) || 0,
          pf: Number(this.form.pf) || 0,
          professionalTax: Number(this.form.professionalTax) || 0,
          tds: Number(this.form.tds) || 0,
          loan: Number(this.form.loan) || 0,
          business: String(this.selectedBusiness),
          net_salary: Number(this.netSalary),
          total_earnings: Number(this.totalEarnings),
          total_deductions: Number(this.totalDeductions)
        };

        if (this.editingId) {
          await axios.put(`https://employees.archenterprises.co.in/api/api/salary-slips/${this.editingId}`, saveData)
          toastSuccess("Salary slip updated successfully")
          this.editingId = null
        } else {
          await axios.post("https://employees.archenterprises.co.in/api/api/salary-slips", saveData)
          toastSuccess("Salary slip saved successfully")
        }

        await this.refreshSalarySlips();

        const element = this.$refs.salarySlip
        const options = {
          margin: 0,
          filename: `${this.form.employeeName}_Salary_Slip_${this.form.salaryMonth}_${this.form.salaryYear}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' }
        }
        html2pdf().set(options).from(element).save()
        toastSuccess("PDF generated successfully")
      } catch (error) {
        console.error(error)
        const errorMessage = error.response?.data?.message || error.response?.data?.errors || error.message;
        toastError("Something went wrong: " + JSON.stringify(errorMessage))
      }
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      this.years.push(i);
    }
    
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
    
    this.fetchEmployees()
    this.refreshSalarySlips()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
/* Add these new styles for bulk generate feature */

.bulk-generate-section {
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  border: 1px solid #fde68a;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
}

.bulk-generate-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 10px;
  background: #fef3c7;
  border-radius: 12px;
  color: #92400e;
  font-size: 13px;
}

.bulk-generate-info i {
  font-size: 18px;
}

.bulk-controls {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.bulk-input-group {
  flex: 1;
  min-width: 200px;
}

.bulk-input-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.bulk-select {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  background: white;
  cursor: pointer;
}

.btn-bulk-generate {
  padding: 10px 24px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.btn-bulk-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 158, 11, 0.3);
}

.btn-bulk-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bulk-preview {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #fde68a;
}

.preview-title {
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
}

.months-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.month-tag {
  padding: 4px 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  color: #92400e;
}

@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables and Base Styles (same as before) */
:root {
  --primary: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
  --primary-color: #667eea;
  --secondary-color: #10b981;
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

.register-btn-modern.secondary {
  background: linear-gradient(135deg, #10b981, #059669);
}

.register-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* Business Selector */
.business-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.business-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.business-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.business-card.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.2);
}

.business-icon {
  width: 60px;
  height: 60px;
  background: var(--primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
  font-size: 28px;
}

.business-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1a1a2e;
}

.business-card p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

/* Form Card */
.form-card-premium {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.form-grid-premium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.field-wrapper input,
.field-wrapper select {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.field-wrapper input:focus,
.field-wrapper select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

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

/* Salary Breakdown */
.salary-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.earnings-section h4,
.deductions-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.breakdown-field {
  margin-bottom: 16px;
}

.breakdown-field label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 6px;
}

.total-field {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #e5e7eb;
}

.total-input {
  background: #f3f4f6;
  font-weight: 600;
  color: var(--success);
}

.total-input.negative {
  color: var(--danger);
}

.net-salary-card {
  background: var(--primary);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  margin-bottom: 24px;
}

.net-salary-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.net-salary-amount {
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.btn-submit-premium {
  padding: 12px 28px;
  background: var(--primary);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-submit-premium.secondary {
  background: #6b7280;
}

.btn-submit-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* Preview Section */
.preview-section {
  margin-top: 8px;
}

/* Salary Slip Premium */
.salary-slip-premium {
  background: white;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 50px;
  border-radius: 20px;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
  position: relative;
  border: 1px solid #e5e7eb;
}

.salary-slip-premium.arch-enterprises-theme .top-accent {
  background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
}

.salary-slip-premium.arch-it-solutions-theme .top-accent {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 20px 20px 0 0;
}

.slip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.company-logo {
  width: 70px;
  height: auto;
}

.company-details h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.company-details p {
  font-size: 10px;
  color: #6b7280;
  margin: 2px 0;
}

.slip-label {
  text-align: right;
}

.slip-label h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.slip-label p {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, #e5e7eb, transparent);
  margin: 16px 0;
}

/* Employee Info */
.employee-info-section {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  gap: 40px;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 1;
  display: flex;
  gap: 8px;
}

.info-item label {
  font-weight: 600;
  font-size: 12px;
  color: #6b7280;
  min-width: 100px;
}

.info-item span {
  font-size: 12px;
  color: #1a1a2e;
  font-weight: 500;
}

/* Salary Table */
.salary-table-wrapper {
  margin-bottom: 24px;
  overflow-x: auto;
}

.salary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.salary-table th {
  background: #f8fafc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.salary-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.total-row {
  background: #f8fafc;
  font-weight: 600;
}

.total-row td {
  border-top: 1px solid #e5e7eb;
  padding: 10px;
}

.net-salary-section {
  margin-bottom: 24px;
}

.net-salary-box {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border: 2px solid var(--primary-color);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}

.net-salary-box label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 1px;
}

.net-amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--success);
  margin: 8px 0;
}

.amount-words {
  font-size: 10px;
  color: #6b7280;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin: 30px 0 20px;
}

.sign-block {
  text-align: center;
  width: 40%;
}

.sign-line {
  border-top: 1px solid #1a1a2e;
  margin-bottom: 8px;
  width: 100%;
}

.slip-footer {
  margin-top: 20px;
  font-size: 9px;
  color: #6b7280;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, #e5e7eb, transparent);
  margin: 12px 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
}

.footer-left p,
.footer-right p {
  margin: 2px 0;
}

.footer-right {
  text-align: right;
}

.footer-bottom {
  text-align: center;
  margin-top: 10px;
  font-size: 8px;
  color: #9ca3af;
}

/* Filter Section */
.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.filter-select,
.search-input {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
}

.filter-select {
  min-width: 180px;
}

.search-input {
  flex: 1;
}

/* Business Badges */
.business-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.business-badge.business-enterprises {
  background: #e0e7ff;
  color: #667eea;
}

.business-badge.business-it-solutions {
  background: #fce7f3;
  color: #f5576c;
}

/* Modal Styles (same as before) */
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
  max-width: 1000px;
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
  color: rgb(13, 3, 3);
  transform: rotate(90deg);
}

.modal-body-premium {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fafbfc;
}

.modal-footer-premium {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  justify-content: flex-end;
}

/* Table Styles */
.table-wrapper-premium {
  overflow-x: auto;
}

.offer-table-premium {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.offer-table-premium thead {
  background: #f8fafc;
}

.offer-table-premium th {
  text-align: left;
  padding: 12px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.offer-table-premium td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.employee-cell {
  min-width: 140px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-avatar-small {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.amount-cell {
  font-weight: 600;
  color: var(--success);
}

.date-cell {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
}

.action-group {
  display: flex;
  gap: 6px;
}

.action-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon.view {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-icon.edit {
  background: #d1fae5;
  color: var(--success);
}

.action-icon.delete {
  background: #fee2e2;
  color: var(--danger);
}

.empty-state-small {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.empty-state-small i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .form-grid-premium {
    grid-template-columns: 1fr;
  }
  
  .salary-breakdown {
    grid-template-columns: 1fr;
  }
  
  .salary-slip-premium {
    padding: 30px 40px;
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
  
  .business-selector {
    grid-template-columns: 1fr;
  }
  
  .form-grid-premium {
    grid-template-columns: 1fr;
  }
  
  .salary-breakdown {
    grid-template-columns: 1fr;
  }
  
  .salary-slip-premium {
    padding: 20px;
  }
  
  .slip-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .signature-section {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }
  
  .sign-block {
    width: 80%;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .footer-right {
    text-align: center;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .premium-modal {
    max-width: 95%;
  }
}
</style>