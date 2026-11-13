<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- 📱 Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <div class="mobile-title-icon">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <span>Salary Slip</span>
          </div>
          <div class="mobile-header-actions">
            <button class="mobile-view-btn" @click="openSalarySlipModal" title="View All Slips">
              <i class="fas fa-folder-open"></i>
              <span>All Slips</span>
            </button>
            <button class="btn-mobile-menu" @click="isSidebarVisible = !isSidebarVisible" aria-label="Toggle sidebar">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Top Banner -->
        <header class="salary-top-banner" v-else>
          <div class="banner-left">
            <div class="banner-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>ENTERPRISE PAYROLL & SLIP ENGINE</span>
              </span>
              <span class="status-meta-pill company-active-pill" :class="selectedBusiness">
                <i :class="selectedBusiness === 'arch-it-solutions' ? 'fas fa-laptop-code' : 'fas fa-building'"></i>
                {{ currentBusiness.name }}
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-file-invoice-dollar"></i> {{ salarySlips.length }} Generated Slips
              </span>
              <span class="status-meta-pill editing-pill" v-if="editingId">
                <i class="fas fa-pen"></i> Editing Slip (#{{ editingId }})
              </span>
            </div>
            <h1 class="page-title">Generate Salary Slip</h1>
            <p class="page-subtitle">
              Configure employee payroll for <strong>{{ currentBusiness.name }}</strong>, adjust earnings & deductions, bulk-generate historical cycles, and export official A4 payslips.
            </p>
          </div>

          <div class="banner-right-actions">
            <button type="button" class="btn-view-slips" @click="openSalarySlipModal">
              <i class="fas fa-folder-open"></i>
              <span>All Salary Slips</span>
              <span class="count-bubble" v-if="salarySlips.length > 0">{{ salarySlips.length }}</span>
            </button>
            <button type="button" class="btn-save-record" @click="saveSalarySlip" :disabled="isSaving" :title="editingId ? 'Update record in database' : 'Save record to database'">
              <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              <span>{{ isSaving ? 'Saving...' : (editingId ? 'Update Record' : 'Save Record') }}</span>
            </button>
            <button type="button" class="btn-generate-pdf" @click="downloadPDF" :disabled="isDownloading" title="Download formatted A4 PDF">
              <i v-if="isDownloading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-file-pdf"></i>
              <span>{{ isDownloading ? 'Downloading...' : 'Download PDF' }}</span>
            </button>
          </div>
        </header>

        <!-- 🏢 Split-Pane Workspace -->
        <div class="workspace-grid">
          <!-- 📝 Left Pane: Form Editor Card -->
          <div class="editor-column">
            <!-- Business Entity Selector -->
            <div class="entity-switcher-card">
              <div class="switcher-label">
                <i class="fas fa-sitemap"></i>
                <span>SELECT ISSUING COMPANY ENTITY</span>
              </div>
              <div class="entity-grid">
                <button
                  type="button"
                  class="entity-option-card ae-card"
                  :class="{ active: selectedBusiness === 'arch-enterprises' }"
                  @click="selectedBusiness = 'arch-enterprises'"
                >
                  <div class="entity-logo-wrap">
                    <img :src="logoArchEnterprises" alt="Arch Enterprises" class="entity-thumb-logo" />
                  </div>
                  <div class="entity-meta">
                    <div class="entity-name-row">
                      <span class="entity-title">Arch Enterprises</span>
                      <span class="entity-badge ae">AE</span>
                    </div>
                    <span class="entity-desc">Engineering & Cloud Services</span>
                  </div>
                  <div class="active-check" v-if="selectedBusiness === 'arch-enterprises'">
                    <i class="fas fa-check-circle"></i>
                  </div>
                </button>

                <button
                  type="button"
                  class="entity-option-card aits-card"
                  :class="{ active: selectedBusiness === 'arch-it-solutions' }"
                  @click="selectedBusiness = 'arch-it-solutions'"
                >
                  <div class="entity-logo-wrap it-wrap">
                    <img :src="logoArchITSolutions" alt="Arch IT Solutions" class="entity-thumb-logo" />
                  </div>
                  <div class="entity-meta">
                    <div class="entity-name-row">
                      <span class="entity-title">Arch IT Solutions</span>
                      <span class="entity-badge aits">AITS</span>
                    </div>
                    <span class="entity-desc">Digital & Web Solutions</span>
                  </div>
                  <div class="active-check" v-if="selectedBusiness === 'arch-it-solutions'">
                    <i class="fas fa-check-circle"></i>
                  </div>
                </button>
              </div>
            </div>

            <!-- Configuration Form Card -->
            <div class="editor-card">
              <div class="card-header-clean">
                <div class="header-left-title">
                  <div class="header-icon-halo">
                    <i class="fas fa-user-edit"></i>
                  </div>
                  <div>
                    <h3 class="card-title">Employee & Period Details</h3>
                    <p class="card-desc">Select an employee or configure custom payroll parameters</p>
                  </div>
                </div>

                <div class="header-right-tools">
                  <button v-if="editingId" type="button" class="btn-cancel-edit" @click="cancelEdit" title="Cancel Editing">
                    <i class="fas fa-times"></i> Cancel Edit
                  </button>
                  <button type="button" class="btn-reset-tool" @click="resetForm" title="Clear All Fields">
                    <i class="fas fa-undo-alt"></i> Reset
                  </button>
                </div>
              </div>

              <div class="card-body-clean">
                <!-- Employee Quick Select Dropdown -->
                <div class="form-group-block highlight-group">
                  <label class="field-label">
                    <span>Quick Select Employee</span>
                    <span class="sub-label">Auto-populates employee details & basic salary</span>
                  </label>
                  <div class="input-wrapper">
                    <i class="fas fa-user-tie input-icon"></i>
                    <select v-model="selectedEmployeeId" @change="fetchEmployeeDetails" class="modern-select">
                      <option disabled value="">Choose registered employee...</option>
                      <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                        {{ employee.name }} (ID: {{ employee.employee_id || employee.id }}) • {{ employee.department || 'Staff' }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Basic Employee Details -->
                <div class="form-row-grid">
                  <div class="form-group-block">
                    <label class="field-label">Employee Name <span class="req-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-user input-icon"></i>
                      <input v-model="form.employeeName" type="text" placeholder="e.g. John Doe" class="modern-input" />
                    </div>
                  </div>

                  <div class="form-group-block">
                    <label class="field-label">Employee ID <span class="req-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-id-badge input-icon"></i>
                      <input v-model="form.employeeId" type="text" placeholder="e.g. AE-102" class="modern-input" />
                    </div>
                  </div>
                </div>

                <div class="form-row-grid">
                  <div class="form-group-block">
                    <label class="field-label">Designation <span class="req-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-briefcase input-icon"></i>
                      <input v-model="form.designation" type="text" placeholder="e.g. Senior Software Engineer" class="modern-input" />
                    </div>
                  </div>

                  <div class="form-group-block">
                    <label class="field-label">Department <span class="req-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-network-wired input-icon"></i>
                      <select v-model="form.department" class="modern-select">
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
                </div>

                <!-- Salary Month & Year -->
                <div class="form-row-grid">
                  <div class="form-group-block">
                    <label class="field-label">Salary Month <span class="req-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-calendar-alt input-icon"></i>
                      <select v-model="form.salaryMonth" class="modern-select">
                        <option disabled value="">Select month</option>
                        <option v-for="month in months" :key="month.value" :value="month.value">
                          {{ month.label }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group-block">
                    <label class="field-label">Salary Year <span class="req-star">*</span></label>
                    <div class="input-wrapper">
                      <i class="fas fa-calendar-check input-icon"></i>
                      <select v-model="form.salaryYear" class="modern-select">
                        <option disabled value="">Select year</option>
                        <option v-for="year in years" :key="year" :value="year">
                          {{ year }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Bulk Generate Section (Modern Collapsible Panel) -->
                <div class="bulk-tool-panel">
                  <div class="bulk-panel-header" @click="showBulkPanel = !showBulkPanel">
                    <div class="bulk-header-left">
                      <div class="bulk-icon-chip">
                        <i class="fas fa-layer-group"></i>
                      </div>
                      <div>
                        <span class="bulk-panel-title">Bulk Generate Previous Months</span>
                        <span class="bulk-panel-desc">Generate salary slips for multiple past months simultaneously</span>
                      </div>
                    </div>
                    <button type="button" class="btn-toggle-bulk" :class="{ rotated: showBulkPanel }">
                      <i class="fas fa-chevron-down"></i>
                    </button>
                  </div>

                  <div v-if="showBulkPanel" class="bulk-panel-content">
                    <div class="bulk-controls-row">
                      <div class="bulk-select-wrap">
                        <label>Generate for previous:</label>
                        <div class="input-wrapper">
                          <i class="fas fa-history input-icon"></i>
                          <select v-model.number="bulkMonthsCount" class="modern-select bulk-select">
                            <option value="1">1 Month Back</option>
                            <option value="2">2 Months Back</option>
                            <option value="3">3 Months Back</option>
                            <option value="4">4 Months Back</option>
                            <option value="5">5 Months Back</option>
                            <option value="6">6 Months Back</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="btn-bulk-execute"
                        @click="generateBulkSalarySlips"
                        :disabled="!canGenerateBulk || isBulkGenerating"
                      >
                        <i v-if="isBulkGenerating" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-bolt"></i>
                        <span>{{ isBulkGenerating ? 'Generating...' : `Generate ${bulkMonthsCount} Month${bulkMonthsCount > 1 ? 's' : ''}` }}</span>
                      </button>
                    </div>

                    <!-- Preview Tags -->
                    <div v-if="bulkMonthsCount > 0 && selectedEmployeeId" class="bulk-months-tags">
                      <span class="tags-label">Cycles to create:</span>
                      <div class="tags-container">
                        <span v-for="(month, index) in getPreviousMonths()" :key="index" class="month-chip">
                          <i class="fas fa-calendar-day"></i> {{ month.month }} {{ month.year }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Earnings & Deductions Sections -->
                <div class="financial-sections-grid">
                  <!-- Earnings Box -->
                  <div class="finance-card earnings-card">
                    <div class="finance-card-header">
                      <div class="finance-header-title">
                        <i class="fas fa-hand-holding-usd text-success"></i>
                        <h4>Earnings</h4>
                      </div>
                      <span class="pill-badge earnings-pill">
                        ₹{{ formatAmount(totalEarnings) }}
                      </span>
                    </div>

                    <div class="finance-field-list">
                      <div class="finance-input-row">
                        <label>Basic Salary <span class="req-star">*</span></label>
                        <div class="input-wrapper">
                          <span class="currency-prefix">₹</span>
                          <input v-model.number="form.basicSalary" type="number" placeholder="0" class="modern-input currency-input" />
                        </div>
                      </div>

                      <div class="finance-input-row">
                        <label>House Rent Allowance (HRA)</label>
                        <div class="input-wrapper">
                          <span class="currency-prefix">₹</span>
                          <input v-model.number="form.hra" type="number" placeholder="0" class="modern-input currency-input" />
                        </div>
                      </div>

                      <div class="finance-input-row">
                        <label>Dearness Allowance (DA)</label>
                        <div class="input-wrapper">
                          <span class="currency-prefix">₹</span>
                          <input v-model.number="form.da" type="number" placeholder="0" class="modern-input currency-input" />
                        </div>
                      </div>

                      <div class="finance-input-row">
                        <label>Conveyance Allowance</label>
                        <div class="input-wrapper">
                          <span class="currency-prefix">₹</span>
                          <input v-model.number="form.conveyance" type="number" placeholder="0" class="modern-input currency-input" />
                        </div>
                      </div>

                      <div class="finance-input-row">
                        <label>Special Allowance</label>
                        <div class="input-wrapper">
                          <span class="currency-prefix">₹</span>
                          <input v-model.number="form.specialAllowance" type="number" placeholder="0" class="modern-input currency-input" />
                        </div>
                      </div>
                    </div>

                    <div class="finance-subtotal-bar">
                      <span>Total Gross Earnings:</span>
                      <strong>₹{{ formatAmount(totalEarnings) }}</strong>
                    </div>
                  </div>

                  <!-- Deductions Box -->
                  <div class="finance-card deductions-card">
                    <div class="finance-card-header">
                      <div class="finance-header-title">
                        <i class="fas fa-file-invoice-dollar text-danger"></i>
                        <h4>Deductions</h4>
                      </div>
                      <span class="pill-badge deductions-pill">
                        ₹{{ formatAmount(totalDeductions) }}
                      </span>
                    </div>

                    <div class="finance-field-list">
                      <div class="finance-input-row">
                        <label>Provident Fund (PF)</label>
                        <div class="input-wrapper">
                          <span class="currency-prefix">₹</span>
                          <input v-model.number="form.pf" type="number" placeholder="0" class="modern-input currency-input" />
                        </div>
                      </div>

                      <div class="finance-input-row">
                        <label>Professional Tax (PT)</label>
                        <div class="input-wrapper">
                          <span class="currency-prefix">₹</span>
                          <input v-model.number="form.professionalTax" type="number" placeholder="0" class="modern-input currency-input" />
                        </div>
                      </div>

                      <div class="finance-input-row">
                        <label>Tax Deducted at Source (TDS)</label>
                        <div class="input-wrapper">
                          <span class="currency-prefix">₹</span>
                          <input v-model.number="form.tds" type="number" placeholder="0" class="modern-input currency-input" />
                        </div>
                      </div>

                      <div class="finance-input-row">
                        <label>Loan / Advance Recovery</label>
                        <div class="input-wrapper">
                          <span class="currency-prefix">₹</span>
                          <input v-model.number="form.loan" type="number" placeholder="0" class="modern-input currency-input" />
                        </div>
                      </div>
                    </div>

                    <div class="finance-subtotal-bar deductions-subtotal">
                      <span>Total Deductions:</span>
                      <strong>- ₹{{ formatAmount(totalDeductions) }}</strong>
                    </div>
                  </div>
                </div>

                <!-- Executive Net Salary Card -->
                <div class="net-salary-executive-card">
                  <div class="net-left-info">
                    <span class="net-title-label">NET TAKE-HOME SALARY</span>
                    <div class="net-amount-headline">
                      ₹{{ formatAmount(netSalary) }}
                    </div>
                    <div class="net-words-desc">
                      <i class="fas fa-quote-left"></i> {{ amountInWords }} Only <i class="fas fa-quote-right"></i>
                    </div>
                  </div>
                  <div class="net-right-breakdown">
                    <div class="net-mini-kpi">
                      <span class="mini-kpi-label">Gross Earnings</span>
                      <span class="mini-kpi-val text-success">+ ₹{{ formatAmount(totalEarnings) }}</span>
                    </div>
                    <div class="net-mini-kpi">
                      <span class="mini-kpi-label">Total Deductions</span>
                      <span class="mini-kpi-val text-danger">- ₹{{ formatAmount(totalDeductions) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Action Button in Editor Card -->
                <div class="editor-actions-footer">
                  <div class="actions-left-summary" v-if="form.employeeName">
                    <span class="preview-status-pill">
                      <i class="fas fa-check-circle text-success"></i> Ready for {{ currentBusiness.shortName }}
                    </span>
                  </div>
                  <div class="actions-right-buttons">
                    <button type="button" class="btn-action-save" @click="saveSalarySlip" :disabled="isSaving" :title="editingId ? 'Update details in database' : 'Save details to database'">
                      <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-save"></i>
                      <span>{{ isSaving ? 'Saving...' : (editingId ? 'Update Record' : 'Save Record') }}</span>
                    </button>
                    <button type="button" class="btn-generate-main" @click="downloadPDF" :disabled="isDownloading" title="Download official formatted A4 PDF">
                      <i v-if="isDownloading" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-file-pdf"></i>
                      <span>{{ isDownloading ? 'Downloading...' : 'Download PDF' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 📄 Right Pane: Live Document Canvas -->
          <div class="preview-column">
            <div class="preview-canvas-wrapper">
              <!-- Preview Canvas Toolbar -->
              <div class="preview-toolbar">
                <div class="toolbar-left-info">
                  <span class="canvas-tag">
                    <i class="fas fa-file-invoice-dollar"></i> {{ currentBusiness.shortName }} A4 SALARY SLIP
                  </span>
                  <span class="canvas-candidate" v-if="form.employeeName">
                    {{ form.employeeName }} • {{ form.salaryMonth }} {{ form.salaryYear }}
                  </span>
                </div>
                <div class="toolbar-right-actions">
                  <button type="button" class="btn-canvas-action btn-canvas-save" @click="saveSalarySlip" :disabled="isSaving" title="Save details to database">
                    <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-save"></i>
                    <span>{{ isSaving ? 'Saving...' : 'Save' }}</span>
                  </button>
                  <button type="button" class="btn-canvas-action btn-canvas-primary" @click="downloadPDF" :disabled="isDownloading" title="Download PDF Document">
                    <i v-if="isDownloading" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-download"></i>
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <!-- Real A4 Letterhead Document (Captured by html2pdf) -->
              <div class="document-scroll-container">
                <div ref="salarySlip" class="salary-slip-canvas" :class="[businessClass, { 'mobile-preview': isMobile }]">
                  <div class="slip-top-stripe" :style="{ background: currentBusiness.stripeGradient }"></div>

                  <!-- Slip Header -->
                  <div class="slip-header-brand">
                    <div class="brand-left">
                      <div class="logo-box">
                        <img :src="businessLogo" class="company-logo" :alt="currentBusiness.name" />
                      </div>
                      <div class="company-details">
                        <h2 class="company-name">{{ currentBusiness.name }}</h2>
                        <p class="company-tagline">{{ currentBusiness.tagline }}</p>
                        <p class="company-address">{{ currentBusiness.address }}</p>
                        <p class="company-contact">{{ businessContact }}</p>
                      </div>
                    </div>
                    <div class="brand-right">
                      <div class="payslip-badge-block">
                        <div class="payslip-title">PAYSLIP</div>
                        <div class="payslip-period">{{ form.salaryMonth || 'Month' }} {{ form.salaryYear }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="slip-divider"></div>

                  <!-- Employee Meta Table Grid -->
                  <div class="employee-meta-card">
                    <div class="meta-row">
                      <div class="meta-item">
                        <span class="meta-label">Employee Name:</span>
                        <span class="meta-value highlight">{{ form.employeeName || '—' }}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Employee ID:</span>
                        <span class="meta-value">{{ form.employeeId || '—' }}</span>
                      </div>
                    </div>

                    <div class="meta-row">
                      <div class="meta-item">
                        <span class="meta-label">Designation:</span>
                        <span class="meta-value">{{ form.designation || '—' }}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Department:</span>
                        <span class="meta-value">{{ form.department || '—' }}</span>
                      </div>
                    </div>

                    <div class="meta-row">
                      <div class="meta-item">
                        <span class="meta-label">Pay Period:</span>
                        <span class="meta-value">{{ form.salaryMonth }} {{ form.salaryYear }}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Payment Date:</span>
                        <span class="meta-value">{{ todayDate }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Financial Breakdown Dual-Column Table -->
                  <div class="salary-table-wrapper">
                    <table class="payslip-table">
                      <thead>
                        <tr>
                          <th class="col-earning-title">Earnings</th>
                          <th class="col-earning-val">Amount (₹)</th>
                          <th class="col-deduct-title">Deductions</th>
                          <th class="col-deduct-val">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Basic Salary</td>
                          <td class="text-right">{{ formatAmount(form.basicSalary) }}</td>
                          <td>Provident Fund (PF)</td>
                          <td class="text-right">{{ formatAmount(form.pf) }}</td>
                        </tr>
                        <tr>
                          <td>House Rent Allowance (HRA)</td>
                          <td class="text-right">{{ formatAmount(form.hra) }}</td>
                          <td>Professional Tax (PT)</td>
                          <td class="text-right">{{ formatAmount(form.professionalTax) }}</td>
                        </tr>
                        <tr>
                          <td>Dearness Allowance (DA)</td>
                          <td class="text-right">{{ formatAmount(form.da) }}</td>
                          <td>Tax Deducted at Source (TDS)</td>
                          <td class="text-right">{{ formatAmount(form.tds) }}</td>
                        </tr>
                        <tr>
                          <td>Conveyance Allowance</td>
                          <td class="text-right">{{ formatAmount(form.conveyance) }}</td>
                          <td>Loan / Advance Recovery</td>
                          <td class="text-right">{{ formatAmount(form.loan) }}</td>
                        </tr>
                        <tr>
                          <td>Special Allowance</td>
                          <td class="text-right">{{ formatAmount(form.specialAllowance) }}</td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr class="total-summary-row">
                          <td><strong>Total Gross Earnings</strong></td>
                          <td class="text-right"><strong>₹{{ formatAmount(totalEarnings) }}</strong></td>
                          <td><strong>Total Deductions</strong></td>
                          <td class="text-right"><strong>₹{{ formatAmount(totalDeductions) }}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Official Net Pay Box -->
                  <div class="net-pay-official-box">
                    <div class="net-pay-inner">
                      <div class="net-pay-top">
                        <span class="net-pay-label">NET TAKE-HOME PAY:</span>
                        <span class="net-pay-digits">₹ {{ formatAmount(netSalary) }}</span>
                      </div>
                      <div class="net-pay-words">
                        <span>Amount in Words:</span>
                        <strong>{{ amountInWords }} Only</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Signatures -->
                  <div class="slip-signatures-row">
                    <div class="sig-block">
                      <div class="sig-line"></div>
                      <span class="sig-label">Authorized Signatory</span>
                      <span class="sig-sub">{{ currentBusiness.name }}</span>
                    </div>
                    <div class="sig-block">
                      <div class="sig-line"></div>
                      <span class="sig-label">Employee Signature</span>
                      <span class="sig-sub">{{ form.employeeName || 'Staff Signature' }}</span>
                    </div>
                  </div>

                  <!-- Official Footer -->
                  <div class="slip-official-footer">
                    <div class="slip-footer-divider"></div>
                    <div class="slip-footer-cols">
                      <div class="footer-col-left">
                        <strong>{{ currentBusiness.name }}</strong>
                        <p>{{ currentBusiness.tagline }}</p>
                      </div>
                      <div class="footer-col-right">
                        <p>{{ currentBusiness.website }}</p>
                        <p>{{ currentBusiness.email }}</p>
                        <p>{{ currentBusiness.phone }}</p>
                      </div>
                    </div>
                    <div class="slip-disclaimer">
                      This is a computer-generated salary slip and does not require a physical signature.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 📑 All Salary Slips Modern Modal -->
        <transition name="modal-fade">
          <div v-if="showSalarySlipModal" class="modal-backdrop" @click.self="closeSalarySlipModal">
            <div class="premium-modal modal-widescreen" @click.stop>
              <div class="modal-decoration"></div>

              <div class="modal-header-premium">
                <div class="header-icon-premium">
                  <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="header-text">
                  <div class="header-title-badge-row">
                    <h2>All Generated Salary Slips</h2>
                    <span class="modal-count-pill">{{ filteredSalarySlips.length }} records</span>
                  </div>
                  <p>View, load into editor, or manage historical payroll records</p>
                </div>
                <button type="button" class="close-btn-premium" @click="closeSalarySlipModal" aria-label="Close modal">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="modal-body-premium">
                <!-- Filter bar with entity tabs & search -->
                <div class="modal-filter-bar">
                  <div class="filter-tabs">
                    <button
                      type="button"
                      class="filter-tab-btn"
                      :class="{ active: filterBusiness === 'all' }"
                      @click="filterBusiness = 'all'"
                    >
                      All Entities
                    </button>
                    <button
                      type="button"
                      class="filter-tab-btn"
                      :class="{ active: filterBusiness === 'arch-enterprises' }"
                      @click="filterBusiness = 'arch-enterprises'"
                    >
                      Arch Enterprises
                    </button>
                    <button
                      type="button"
                      class="filter-tab-btn"
                      :class="{ active: filterBusiness === 'arch-it-solutions' }"
                      @click="filterBusiness = 'arch-it-solutions'"
                    >
                      Arch IT Solutions
                    </button>
                  </div>

                  <div class="search-input-wrap">
                    <i class="fas fa-search search-icon"></i>
                    <input
                      type="text"
                      v-model="searchQuery"
                      placeholder="Search by employee name, ID, or month..."
                      class="modal-search-field"
                    />
                    <button v-if="searchQuery" type="button" class="clear-search-btn" @click="searchQuery = ''">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <!-- Slips Table -->
                <div class="table-wrapper-premium">
                  <table class="slips-table-modern">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Employee ID</th>
                        <th>Issuing Entity</th>
                        <th>Period</th>
                        <th>Gross Pay</th>
                        <th>Deductions</th>
                        <th>Net Salary</th>
                        <th class="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="slip in filteredSalarySlips" :key="slip.id">
                        <td class="employee-cell">
                          <div class="employee-info-row">
                            <div class="candidate-avatar-circle" :class="getAvatarColorClass(slip.employee_name)">
                              {{ getInitials(slip.employee_name) }}
                            </div>
                            <div class="employee-name-meta">
                              <span class="emp-name">{{ slip.employee_name }}</span>
                              <span class="emp-dept">{{ slip.department || 'Staff' }}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="id-badge-pill">{{ slip.employee_id }}</span>
                        </td>
                        <td>
                          <span class="entity-pill" :class="slip.business === 'arch-it-solutions' ? 'aits' : 'ae'">
                            {{ slip.business === 'arch-it-solutions' ? 'Arch IT Solutions' : 'Arch Enterprises' }}
                          </span>
                        </td>
                        <td class="date-cell">
                          <i class="far fa-calendar-alt text-muted"></i>
                          <span>{{ slip.salary_month }} {{ slip.salary_year }}</span>
                        </td>
                        <td class="amount-cell text-muted">₹{{ formatAmount(slip.total_earnings || slip.basic_salary) }}</td>
                        <td class="amount-cell text-danger">- ₹{{ formatAmount(slip.total_deductions || 0) }}</td>
                        <td class="amount-cell net-highlight">₹{{ formatAmount(slip.net_salary) }}</td>
                        <td class="text-center">
                          <div class="action-buttons-group">
                            <button type="button" class="action-btn view-btn" @click="viewSalarySlip(slip)" title="Preview in Live Desk">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button type="button" class="action-btn edit-btn" @click="editSalarySlip(slip)" title="Edit Parameters">
                              <i class="fas fa-pen"></i>
                            </button>
                            <button type="button" class="action-btn delete-btn" @click="deleteSalarySlip(slip.id)" title="Delete Record">
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="filteredSalarySlips.length === 0" class="empty-row">
                        <td colspan="8">
                          <div class="empty-state-modern">
                            <div class="empty-icon-wrap">
                              <i class="fas fa-inbox"></i>
                            </div>
                            <p class="empty-title">No Salary Slips Found</p>
                            <p class="empty-desc">No salary slips match your filter or search criteria.</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button type="button" class="btn-modal-close" @click="closeSalarySlipModal">
                  Close Window
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
import logoArchEnterprises from '@/assets/logo.png'
import logoArchITSolutions from '@/assets/arch-it-solutions-logo.png'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

const BUSINESS_PROFILES = {
  'arch-enterprises': {
    key: 'arch-enterprises',
    name: 'Arch Enterprises',
    shortName: 'AE',
    tagline: 'Clarke Fire Products Dealer in India',
    address: 'Plot No. 49, Prathamesh, Khutwadnagar, Nashik, Maharashtra - 422008',
    email: 'contact@archenterprises.co.in',
    phone: '+91 8390704453',
    website: 'www.archenterprises.co.in',
    logo: logoArchEnterprises,
    themeClass: 'arch-enterprises-theme',
    accentClass: 'accent-enterprises',
    stripeGradient: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
    primaryColor: '#4f46e5'
  },
  'arch-it-solutions': {
    key: 'arch-it-solutions',
    name: 'Arch IT Solutions',
    shortName: 'AITS',
    tagline: 'IT Consulting | Digital Transformation | Web Solutions',
    address: 'Plot No. 49, Prathamesh, Khutwadnagar, Nashik, Maharashtra - 422008',
    email: 'prasad@architsolutions.com',
    phone: '+91 8390704453',
    website: 'www.it.archenterprises.co.in',
    logo: logoArchITSolutions,
    themeClass: 'arch-it-solutions-theme',
    accentClass: 'accent-it-solutions',
    stripeGradient: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #0d9488 100%)',
    primaryColor: '#0284c7'
  }
};

export default {
  components: { Sidebar },

  data() {
    return {
      editingId: null,
      isMobile: false,
      isSidebarVisible: true,
      showSalarySlipModal: false,
      showBulkPanel: false,
      filterBusiness: 'all',
      searchQuery: '',
      salarySlips: [],
      employees: [],
      selectedEmployeeId: '',
      selectedBusiness: 'arch-enterprises',
      bulkMonthsCount: 1,
      isSaving: false,
      isDownloading: false,
      isBulkGenerating: false,
      logoArchEnterprises,
      logoArchITSolutions,
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
    currentBusiness() {
      return BUSINESS_PROFILES[this.selectedBusiness] || BUSINESS_PROFILES['arch-enterprises'];
    },
    businessName() {
      return this.currentBusiness.name;
    },
    businessAddress() {
      return this.currentBusiness.address;
    },
    businessContact() {
      return `Email: ${this.currentBusiness.email} | Phone: ${this.currentBusiness.phone}`;
    },
    businessLogo() {
      return this.currentBusiness.logo;
    },
    businessTagline() {
      return this.currentBusiness.tagline;
    },
    businessWebsite() {
      return this.currentBusiness.website;
    },
    businessEmail() {
      return this.currentBusiness.email;
    },
    businessPhone() {
      return this.currentBusiness.phone;
    },
    businessClass() {
      return this.currentBusiness.themeClass;
    },
    businessAccentClass() {
      return this.currentBusiness.accentClass;
    },
    todayDate() {
      return this.formatDate(new Date())
    },
    totalEarnings() {
      return (Number(this.form.basicSalary) || 0) + 
             (Number(this.form.hra) || 0) + 
             (Number(this.form.da) || 0) + 
             (Number(this.form.conveyance) || 0) + 
             (Number(this.form.specialAllowance) || 0);
    },
    totalDeductions() {
      return (Number(this.form.pf) || 0) + 
             (Number(this.form.professionalTax) || 0) + 
             (Number(this.form.tds) || 0) + 
             (Number(this.form.loan) || 0);
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
          (slip.employee_name && slip.employee_name.toLowerCase().includes(query)) ||
          (slip.employee_id && slip.employee_id.toLowerCase().includes(query)) ||
          (slip.salary_month && slip.salary_month.toLowerCase().includes(query)) ||
          (slip.department && slip.department.toLowerCase().includes(query))
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
    getAvatarColorClass(name) {
      if (!name) return 'avatar-indigo';
      const charCode = name.charCodeAt(0) % 5;
      const classes = ['avatar-indigo', 'avatar-cyan', 'avatar-emerald', 'avatar-violet', 'avatar-amber'];
      return classes[charCode];
    },
    formatAmount(amount) {
      if (!amount) return '0';
      return parseFloat(amount).toLocaleString('en-IN');
    },
    formatDate(date) {
      const options = { day: '2-digit', month: 'short', year: 'numeric' }
      return date.toLocaleDateString('en-GB', options)
    },
    getPreviousMonths() {
      const list = [];
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
        
        list.push({
          month: this.months[monthIndex].label,
          year: year,
          monthValue: this.months[monthIndex].value
        });
      }
      
      return list;
    },
    async generateBulkSalarySlips() {
      if (!this.canGenerateBulk) {
        toastWarning("Please select an employee and ensure basic salary is specified");
        return;
      }
      
      const previousMonths = this.getPreviousMonths();
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      
      this.isBulkGenerating = true;
      try {
        for (const monthData of previousMonths) {
          try {
            const existingSlip = this.salarySlips.find(slip => 
              slip.employee_id === this.form.employeeId && 
              slip.salary_month === monthData.monthValue && 
              slip.salary_year === monthData.year &&
              slip.business === this.selectedBusiness
            );
            
            if (existingSlip) {
              skippedCount++;
              continue;
            }
            
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
            console.error(`Error generating slip for ${monthData.month} ${monthData.year}:`, error);
            errorCount++;
          }
        }
        
        await this.refreshSalarySlips();
        
        if (successCount > 0) {
          toastSuccess(`Generated ${successCount} salary slip(s) for previous months!`);
        }
        if (skippedCount > 0) {
          toastWarning(`Skipped ${skippedCount} month(s) that already exist.`);
        }
        if (errorCount > 0) {
          toastError(`Failed to generate ${errorCount} month(s).`);
        }
      } finally {
        this.isBulkGenerating = false;
      }
    },
    async refreshSalarySlips() {
      try {
        const response = await axios.get("https://employees.archenterprises.co.in/api/api/salary-slips");
        this.salarySlips = response.data || [];
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
    async fetchEmployees() {
      try {
        const response = await axios.get("https://employees.archenterprises.co.in/api/api/users")
        this.employees = response.data || []
      } catch (error) {
        console.error("Error fetching employees:", error)
        try {
          const response = await axios.get("https://employees.archenterprises.co.in/api/api/employees")
          this.employees = response.data || []
        } catch (err) {
          console.error("Alternative endpoint also failed:", err)
        }
      }
    },
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
        toastSuccess(`Loaded details for ${this.form.employeeName}`)
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
      toastSuccess('Form cleared');
    },
    cancelEdit() {
      this.resetForm();
    },
    async openSalarySlipModal() {
      await this.refreshSalarySlips();
      this.searchQuery = '';
      this.filterBusiness = 'all';
      this.showSalarySlipModal = true;
    },
    closeSalarySlipModal() {
      this.showSalarySlipModal = false;
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
        if (this.$refs.salarySlip) {
          this.$refs.salarySlip.scrollIntoView({ behavior: 'smooth' })
        }
      });
      toastSuccess(`Loaded ${slip.employee_name}'s salary slip preview`);
    },
    async editSalarySlip(slip) {
      await this.viewSalarySlip(slip);
      this.editingId = slip.id;
      toastSuccess(`Editing salary slip #${slip.id} for ${slip.employee_name}`);
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
    async saveSalarySlip() {
      if (!this.form.employeeName || !this.form.employeeId || !this.form.designation || !this.form.salaryMonth) {
        toastWarning("Please fill Employee Name, ID, Designation, and Salary Month before saving");
        return;
      }

      if (this.netSalary < 0) {
        toastWarning("Total deductions cannot exceed gross earnings");
        return;
      }

      this.isSaving = true;
      try {
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
          await axios.put(`https://employees.archenterprises.co.in/api/api/salary-slips/${this.editingId}`, saveData);
          toastSuccess("Salary slip record updated successfully");
        } else {
          const response = await axios.post("https://employees.archenterprises.co.in/api/api/salary-slips", saveData);
          if (response.data && response.data.id) {
            this.editingId = response.data.id;
          }
          toastSuccess("Salary slip saved to database successfully");
        }

        await this.refreshSalarySlips();
      } catch (error) {
        console.error("Save error:", error);
        toastError("Failed to save salary slip to database");
      } finally {
        this.isSaving = false;
      }
    },
    async downloadPDF() {
      if (!this.form.employeeName || !this.form.salaryMonth) {
        toastWarning("Please ensure Employee Name and Salary Month are specified to download payslip");
        return;
      }

      this.isDownloading = true;
      try {
        const element = this.$refs.salarySlip;
        if (!element) {
          toastError("Salary slip preview element not found");
          return;
        }

        const compPrefix = this.currentBusiness.shortName;
        const cleanName = (this.form.employeeName || 'Employee').trim().replace(/\s+/g, '_');
        const options = {
          margin: 0,
          filename: `${compPrefix}_Salary_Slip_${cleanName}_${this.form.salaryMonth}_${this.form.salaryYear}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' }
        };
        await html2pdf().set(options).from(element).save();
        toastSuccess(`Official ${this.currentBusiness.name} salary slip downloaded successfully`);
      } catch (error) {
        console.error("PDF generation failed:", error);
        toastError("An error occurred while generating PDF");
      } finally {
        this.isDownloading = false;
      }
    },
    async generatePDF() {
      await this.downloadPDF();
    }
  },
  async mounted() {
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
    
    await this.fetchEmployees()
    await this.refreshSalarySlips()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ==========================================================================
   RESET & ROOT VARIABLES
   ========================================================================== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.layout {
  min-height: 100vh;
  display: flex;
  background-color: #f1f5f9;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0f172a;
}

.main-content {
  display: flex;
  flex: 1;
  min-height: 100vh;
  background-color: #f1f5f9;
  position: relative;
}

.content {
  flex: 1;
  padding: 28px 32px 56px;
  background-color: #f1f5f9;
  overflow-y: auto;
  max-width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded-content {
  padding-left: 20px;
  padding-right: 20px;
}

/* ==========================================================================
   📱 MOBILE HEADER
   ========================================================================== */
.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.mobile-title-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 15px;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 9px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-mobile-menu {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 15px;
}

/* ==========================================================================
   🏢 ENTERPRISE TOP BANNER (LIGHT THEME)
   ========================================================================== */
.salary-top-banner {
  background: #ffffff;
  border-radius: 20px;
  padding: 26px 32px;
  color: #0f172a;
  box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.07), 0 1px 3px rgba(15, 23, 42, 0.04);
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  position: relative;
  overflow: hidden;
  margin-bottom: 28px;
}

.salary-top-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 50%, #10b981 100%);
}

.banner-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 720px;
  z-index: 1;
}

.banner-badge-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #1d4ed8;
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #2563eb;
  box-shadow: 0 0 8px #2563eb;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.6); }
  70% { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
}

.status-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
}

.status-meta-pill.company-active-pill.arch-enterprises {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4338ca;
  font-weight: 700;
}

.status-meta-pill.company-active-pill.arch-it-solutions {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
  font-weight: 700;
}

.status-meta-pill.editing-pill {
  background: #fffbeb;
  border-color: #fde68a;
  color: #b45309;
  font-weight: 700;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.75; }
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.page-subtitle strong {
  color: #0f172a;
  font-weight: 700;
}

.banner-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
  flex-shrink: 0;
}

.btn-view-slips {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  color: #334155;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.btn-view-slips:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
  transform: translateY(-1px);
}

.count-bubble {
  background: #4f46e5;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
}

.btn-save-record {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
}

.btn-save-record:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}

.btn-save-record:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-generate-pdf {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
}

.btn-generate-pdf:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.55);
}

.btn-generate-pdf:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ==========================================================================
   📐 WORKSPACE GRID (SPLIT PANE)
   ========================================================================== */
.workspace-grid {
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 28px;
  align-items: start;
}

/* ==========================================================================
   🏢 ENTITY SWITCHER CARD
   ========================================================================== */
.entity-switcher-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);
  margin-bottom: 20px;
}

.switcher-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 12px;
}

.entity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.entity-option-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
  min-width: 0;
  overflow: hidden;
}

.entity-option-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.06);
}

.entity-option-card.active.ae-card {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12), 0 6px 16px -2px rgba(79, 70, 229, 0.2);
}

.entity-option-card.active.aits-card {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12), 0 6px 16px -2px rgba(2, 132, 199, 0.2);
}

.entity-logo-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  flex-shrink: 0;
}

.entity-thumb-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.entity-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  padding-right: 22px;
}

.entity-name-row {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.entity-title {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entity-badge {
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 5px;
  flex-shrink: 0;
}

.entity-badge.ae {
  background: #e0e7ff;
  color: #3730a3;
}

.entity-badge.aits {
  background: #e0f2fe;
  color: #0369a1;
}

.entity-desc {
  font-size: 10.5px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-check {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #4f46e5;
  font-size: 15px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aits-card .active-check {
  color: #0284c7;
}

/* ==========================================================================
   📝 LEFT COLUMN: EDITOR CARD
   ========================================================================== */
.editor-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.card-header-clean {
  padding: 22px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-halo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  font-size: 18px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
}

.card-desc {
  font-size: 12.5px;
  color: #64748b;
}

.header-right-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel-edit:hover {
  background: #fef3c7;
}

.btn-reset-tool {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset-tool:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.card-body-clean {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group-block {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group-block.highlight-group {
  background: #f8fafc;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
}

.field-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #334155;
}

.field-label .sub-label {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
}

.req-star {
  color: #ef4444;
}

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
  pointer-events: none;
  transition: color 0.2s ease;
}

.currency-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-weight: 700;
  font-size: 14px;
  pointer-events: none;
}

.modern-input, .modern-select {
  width: 100%;
  height: 44px;
  padding: 0 14px 0 40px;
  border-radius: 11px;
  border: 1.5px solid #e2e8f0;
  background-color: #f8fafc;
  font-size: 13.5px;
  font-weight: 500;
  color: #0f172a;
  transition: all 0.2s ease;
}

.modern-input.currency-input {
  padding-left: 32px;
}

.modern-input:focus, .modern-select:focus {
  outline: none;
  border-color: #6366f1;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.input-wrapper:focus-within .input-icon {
  color: #6366f1;
}

/* ==========================================================================
   ⚡ BULK GENERATION POWER TOOL
   ========================================================================== */
.bulk-tool-panel {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.bulk-panel-header {
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.bulk-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bulk-icon-chip {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fef08a;
  border: 1px solid #fde047;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #854d0e;
  font-size: 15px;
}

.bulk-panel-title {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #78350f;
}

.bulk-panel-desc {
  display: block;
  font-size: 11px;
  color: #92400e;
}

.btn-toggle-bulk {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(146, 64, 14, 0.2);
  color: #78350f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.25s ease;
}

.btn-toggle-bulk.rotated {
  transform: rotate(180deg);
}

.bulk-panel-content {
  padding: 16px 18px;
  border-top: 1px solid #fde68a;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bulk-controls-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: flex-end;
}

.bulk-select-wrap label {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: #78350f;
  margin-bottom: 6px;
}

.bulk-select {
  background: #ffffff;
}

.btn-bulk-execute {
  height: 44px;
  padding: 0 18px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  border-radius: 11px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);
  transition: all 0.2s ease;
}

.btn-bulk-execute:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(217, 119, 6, 0.45);
}

.btn-bulk-execute:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bulk-months-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tags-label {
  font-size: 11px;
  font-weight: 700;
  color: #92400e;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.month-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #ffffff;
  border: 1px solid #fed7aa;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  color: #9a3412;
}

/* ==========================================================================
   💰 FINANCIAL BREAKDOWN SECTIONS
   ========================================================================== */
.financial-sections-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.finance-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.finance-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.finance-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.finance-header-title h4 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.pill-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 14px;
}

.earnings-pill {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.deductions-pill {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.finance-field-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.finance-input-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.finance-input-row label {
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
}

.finance-subtotal-bar {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px dashed #cbd5e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  font-weight: 600;
  color: #059669;
}

.finance-subtotal-bar.deductions-subtotal {
  color: #dc2626;
}

/* ==========================================================================
   💳 EXECUTIVE NET SALARY CARD
   ========================================================================== */
.net-salary-executive-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #111827 100%);
  border-radius: 18px;
  padding: 20px 24px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.net-salary-executive-card::after {
  content: '';
  position: absolute;
  right: -40px;
  bottom: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%);
  pointer-events: none;
}

.net-left-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.net-title-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.net-amount-headline {
  font-size: 32px;
  font-weight: 800;
  color: #34d399;
  letter-spacing: -0.02em;
}

.net-words-desc {
  font-size: 11.5px;
  color: #cbd5e1;
  font-style: italic;
  max-width: 320px;
  line-height: 1.4;
}

.net-right-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: right;
  z-index: 1;
}

.net-mini-kpi {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-kpi-label {
  font-size: 10.5px;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 600;
}

.mini-kpi-val {
  font-size: 13.5px;
  font-weight: 700;
}

/* ==========================================================================
   ACTIONS FOOTER
   ========================================================================== */
.editor-actions-footer {
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.preview-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  background: #ecfdf5;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid #a7f3d0;
}

.actions-right-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border: none;
  border-radius: 11px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-action-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

.btn-action-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-generate-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  border-radius: 11px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
}

.btn-generate-main:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.45);
}

.btn-generate-main:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ==========================================================================
   📄 RIGHT COLUMN: LIVE A4 PREVIEW CANVAS
   ========================================================================== */
.preview-column {
  min-width: 0;
}

.preview-canvas-wrapper {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 24px -4px rgba(15, 23, 42, 0.07);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  padding: 14px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.canvas-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 6px;
}

.canvas-candidate {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.toolbar-right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-canvas-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-canvas-action:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-canvas-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-canvas-save {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}

.btn-canvas-save:hover:not(:disabled) {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #047857;
}

.btn-canvas-primary {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
}

.btn-canvas-primary:hover:not(:disabled) {
  background: #4338ca;
  border-color: #4338ca;
  color: #ffffff;
}

/* Document Desk Environment */
.document-scroll-container {
  background: #475569;
  padding: 36px 24px;
  display: flex;
  justify-content: center;
  overflow-x: auto;
  min-height: 840px;
}

/* ==========================================================================
   📑 AUTHENTIC PRINTABLE A4 SALARY SLIP CANVAS
   ========================================================================== */
.salary-slip-canvas {
  width: 794px;
  min-height: 1123px;
  background: #ffffff;
  padding: 44px 50px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

.slip-top-stripe {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
}

.slip-header-brand {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-top: 8px;
}

.brand-left {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
}

.logo-box {
  width: 75px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.company-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.company-details .company-name {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 2px;
}

.company-details .company-tagline {
  font-size: 11px;
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 3px;
}

.company-details .company-address {
  font-size: 10.5px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 2px;
}

.company-details .company-contact {
  font-size: 10px;
  color: #64748b;
}

.brand-right {
  text-align: right;
  flex-shrink: 0;
}

.payslip-badge-block {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 18px;
  text-align: center;
}

.payslip-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #0f172a;
}

.payslip-period {
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
  margin-top: 2px;
}

.slip-divider {
  height: 2px;
  background: #e2e8f0;
  margin: 22px 0 20px;
}

/* Employee Meta Card */
.employee-meta-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
}

.meta-label {
  font-weight: 600;
  color: #64748b;
  min-width: 110px;
}

.meta-value {
  font-weight: 700;
  color: #0f172a;
}

.meta-value.highlight {
  color: #4f46e5;
}

/* Payslip Financial Table */
.salary-table-wrapper {
  margin-bottom: 24px;
}

.payslip-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  border: 1px solid #cbd5e1;
}

.payslip-table th {
  padding: 10px 14px;
  background: #0f172a;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  border: 1px solid #1e293b;
}

.payslip-table th.col-earning-val,
.payslip-table th.col-deduct-val {
  text-align: right;
  width: 120px;
}

.payslip-table td {
  padding: 9px 14px;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 12px;
}

.payslip-table tr:nth-child(even) td {
  background: #f8fafc;
}

.payslip-table .total-summary-row td {
  background: #f1f5f9;
  border-top: 2px solid #cbd5e1;
  padding: 11px 14px;
  font-size: 12.5px;
  color: #0f172a;
}

.text-right {
  text-align: right;
}

/* Official Net Pay Box */
.net-pay-official-box {
  background: #f8fafc;
  border: 2px solid #4f46e5;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 30px;
}

.net-pay-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.net-pay-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.net-pay-label {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.05em;
}

.net-pay-digits {
  font-size: 24px;
  font-weight: 800;
  color: #059669;
}

.net-pay-words {
  font-size: 12px;
  color: #475569;
  display: flex;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px dashed #cbd5e1;
}

.net-pay-words strong {
  color: #0f172a;
}

/* Signatures */
.slip-signatures-row {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  margin-bottom: 30px;
  padding: 0 20px;
}

.sig-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
}

.sig-line {
  width: 100%;
  height: 1px;
  background: #475569;
  margin-bottom: 8px;
}

.sig-label {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.sig-sub {
  font-size: 10px;
  color: #64748b;
}

/* Slip Official Footer */
.slip-official-footer {
  margin-top: auto;
  padding-top: 20px;
}

.slip-footer-divider {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 12px;
}

.slip-footer-cols {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #64748b;
  line-height: 1.5;
}

.footer-col-right {
  text-align: right;
}

.slip-disclaimer {
  text-align: center;
  font-size: 9px;
  color: #94a3b8;
  margin-top: 12px;
  font-style: italic;
}

/* Theme Accents for Slip */
.salary-slip-canvas.arch-it-solutions-theme .company-details .company-tagline,
.salary-slip-canvas.arch-it-solutions-theme .payslip-period,
.salary-slip-canvas.arch-it-solutions-theme .meta-value.highlight {
  color: #0284c7;
}

.salary-slip-canvas.arch-it-solutions-theme .net-pay-official-box {
  border-color: #0284c7;
}

/* ==========================================================================
   📑 ALL SALARY SLIPS MODAL
   ========================================================================== */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.premium-modal {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  position: relative;
  overflow: hidden;
}

.modal-widescreen {
  width: 1280px;
  max-width: 95vw;
}

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%);
}

.modal-header-premium {
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-premium {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  font-size: 20px;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.header-title-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-text h2 {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.modal-count-pill {
  font-size: 11.5px;
  font-weight: 700;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 2px 9px;
  border-radius: 12px;
}

.header-text p {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.close-btn-premium {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn-premium:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
  transform: rotate(90deg);
}

.modal-body-premium {
  padding: 24px 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.filter-tab-btn {
  padding: 7px 16px;
  border-radius: 8px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab-btn:hover {
  color: #0f172a;
}

.filter-tab-btn.active {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 320px;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
}

.modal-search-field {
  width: 100%;
  height: 40px;
  padding: 0 34px 0 38px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  transition: all 0.2s ease;
}

.modal-search-field:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
}

.clear-search-btn:hover {
  color: #0f172a;
}

/* Modal Table */
.table-wrapper-premium {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}

.slips-table-modern {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.slips-table-modern thead {
  background: #f8fafc;
}

.slips-table-modern th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
  color: #475569;
  font-size: 12px;
  border-bottom: 1.5px solid #e2e8f0;
}

.slips-table-modern td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.slips-table-modern tr:hover td {
  background: #f8fafc;
}

.employee-info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.candidate-avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.avatar-indigo { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
.avatar-cyan { background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%); }
.avatar-emerald { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
.avatar-violet { background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%); }
.avatar-amber { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }

.employee-name-meta {
  display: flex;
  flex-direction: column;
}

.emp-name {
  font-weight: 700;
  color: #0f172a;
}

.emp-dept {
  font-size: 11px;
  color: #64748b;
}

.id-badge-pill {
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
  color: #475569;
}

.entity-pill {
  display: inline-flex;
  padding: 3px 9px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
}

.entity-pill.ae {
  background: #e0e7ff;
  color: #3730a3;
}

.entity-pill.aits {
  background: #e0f2fe;
  color: #0369a1;
}

.amount-cell {
  font-weight: 600;
}

.amount-cell.net-highlight {
  font-size: 13.5px;
  font-weight: 800;
  color: #059669;
}

.text-muted {
  color: #64748b;
}

.text-danger {
  color: #dc2626;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.view-btn {
  background: #e0e7ff;
  color: #4338ca;
}

.action-btn.view-btn:hover {
  background: #c7d2fe;
}

.action-btn.edit-btn {
  background: #fef3c7;
  color: #92400e;
}

.action-btn.edit-btn:hover {
  background: #fde68a;
}

.action-btn.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.delete-btn:hover {
  background: #fca5a5;
}

.empty-state-modern {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 24px;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 13px;
  color: #64748b;
}

.modal-footer-premium {
  padding: 16px 28px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-modal-close {
  padding: 9px 20px;
  border-radius: 10px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ==========================================================================
   📱 RESPONSIVE ADJUSTMENTS
   ========================================================================== */
@media (max-width: 1200px) {
  .workspace-grid {
    grid-template-columns: 460px 1fr;
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
  
  .document-scroll-container {
    padding: 20px 12px;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .entity-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row-grid,
  .financial-sections-grid {
    grid-template-columns: 1fr;
  }
  
  .salary-slip-canvas {
    width: 100%;
    padding: 24px 18px;
  }
  
  .net-salary-executive-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .net-right-breakdown {
    text-align: left;
  }
}
</style>