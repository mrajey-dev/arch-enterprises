<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
     <Sidebar v-if="!isMobile || isSidebarVisible" />

<!-- Customer Table -->
 <div
    class="content"
    :class="{ 'hide-content': isMobile && isSidebarVisible }"
  >
    <section class="crm-hero-header">
    <div class="crm-hero-top">
      <div class="crm-hero-title-area">
        <div class="crm-eyebrow-pill">
          <i class="fas fa-chart-line"></i> CRM DASHBOARD
        </div>
        <h1 class="crm-main-heading">Customers & Purchase Orders</h1>
        <p class="crm-sub-heading">Manage registered customers, quotations, and order tracking workflows from a unified workspace.</p>
      </div>

      <!-- Grouped Modern Action Pills -->
      <div class="crm-header-action-group">
        <button class="crm-btn-pill crm-btn-secondary" @click="openAssignPoForm">
          <i class="fas fa-tasks"></i>
          <span>Manage PO</span>
        </button>
        <button class="crm-btn-pill crm-btn-outline" @click="showViewAllQuotationPopup = true">
          <i class="fas fa-file-invoice-dollar"></i>
          <span>Quotations</span>
        </button>
        <button class="crm-btn-pill crm-btn-outline" @click="goTo('employee/followup')">
          <i class="fas fa-phone-volume"></i>
          <span>Follow Up</span>
        </button>
        <button class="crm-btn-pill crm-btn-outline" @click="showEmailModal = true">
          <i class="fas fa-envelope"></i>
          <span>Emails</span>
        </button>
        <button class="crm-btn-pill crm-btn-primary" @click="openRegisterForm()">
          <i class="fas fa-plus-circle"></i>
          <span>New Customer</span>
        </button>
      </div>
    </div>

    <!-- 4 Stats Cards -->
    <div class="crm-stats-grid">
      <div class="crm-stat-card card-blue">
        <div class="crm-stat-icon-wrap"><i class="fas fa-building"></i></div>
        <div class="crm-stat-content">
          <span class="crm-stat-count">{{ customers.length }}</span>
          <span class="crm-stat-label">Total Customers</span>
        </div>
      </div>
      <div class="crm-stat-card card-amber">
        <div class="crm-stat-icon-wrap"><i class="fas fa-file-signature"></i></div>
        <div class="crm-stat-content">
          <span class="crm-stat-count">{{ quotations.length }}</span>
          <span class="crm-stat-label">Open Quotations</span>
        </div>
      </div>
      <div class="crm-stat-card card-purple">
        <div class="crm-stat-icon-wrap"><i class="fas fa-truck-ramp-box"></i></div>
        <div class="crm-stat-content">
          <span class="crm-stat-count">{{ supplies.length }}</span>
          <span class="crm-stat-label">Supply Orders</span>
        </div>
      </div>
      <div class="crm-stat-card card-emerald">
        <div class="crm-stat-icon-wrap"><i class="fas fa-calendar-check"></i></div>
        <div class="crm-stat-content">
          <span class="crm-stat-count">{{ visit_assign.length }}</span>
          <span class="crm-stat-label">AMC Visits</span>
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="crm-search-bar-wrap">
      <div class="crm-search-input-box">
        <i class="fas fa-search crm-search-icon"></i>
        <input
          type="text"
          v-model="searchQuery"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          placeholder="Search customers by company name, contact, or customer number..."
          class="crm-search-input"
        />
        <button v-if="searchQuery" class="crm-search-clear" @click="searchQuery = ''; searchFocused = false">
          <i class="fas fa-times-circle"></i>
        </button>
      </div>
      <div class="crm-search-summary-pill" v-if="filteredCustomers">
        <span>Showing <strong>{{ filteredCustomers.length }}</strong> of {{ customers.length }} Customers</span>
      </div>
    </div>
  </section>

<!-- Duplicate Quotation - Company Selection Modal -->
<div v-if="showDuplicateCompanySelection" class="modal-backdrop pro-modal-backdrop-top">
  <div class="modal-card medium">
    <div class="modal-header-icon">
      <i class="fas fa-copy"></i>
    </div>
    <h2 class="modal-title">Duplicate Quotation</h2>
    <p class="modal-subtitle">Select a company to duplicate this quotation to</p>

    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-building"></i>
          Select Company *
        </label>
        <select v-model="duplicateCompanySelection" class="po-type-select">
          <option value="">Select a company</option>
          <option 
            v-for="cust in customers" 
            :key="cust.id" 
            :value="cust.company_name"
          >
            {{ cust.company_name }} ({{ formatNumber(cust.id) }})
          </option>
        </select>
      </div>
    </div>

    <div class="modal-buttons">
      <button class="btn btn-success" @click="confirmDuplicateWithCompany">
        <i class="fa fa-copy"></i>
        Duplicate to Selected Company
      </button>
      <button class="btn btn-secondary" @click="closeDuplicateCompanySelection">
        <i class="fa fa-times"></i>
        Cancel
      </button>
    </div>
  </div>
</div>
<!-- Calculation Sheet Popup -->
<div v-if="showCalculationModal" class="calculation-modal">
  <div class="calculation-card">
    <div class="calculation-header">
      <h3>📊 Calculation Sheet</h3>
      <button class="calc-close-btn" @click="showCalculationModal = false">✕</button>
    </div>
    
    <div class="calc-actions">
      <button @click="addNewRow" class="btn-add">+ Add Row</button>
      <button @click="exportExcel" class="btn-export">Export Excel</button>
      <button @click="saveCalculation" class="btn-save">Save & Apply Rate</button>
    </div>
    
    <table class="calc-table">
      <thead>
        <tr>
          <th>Local/Import</th>
          <th>Qty</th>
          <th v-if="!isLocalMode">Per Unit Rate</th>
          <th v-if="isLocalMode">INR Rate</th>
          <th v-if="!isLocalMode">Currency</th>
          
          <th v-if="!isLocalMode">INR Conversion</th>
          <th v-if="!isLocalMode">Freight %</th>
          <th v-if="!isLocalMode">Duty %</th>
          <th>{{ isLocalMode ? 'Local Transport' : 'Clearance' }}</th>
          <th>DDP</th>
          <th>Margin %</th>
          <th>Markup %</th>
          <th>Bank %</th>
          <th>Selling Rate</th>
     
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in calculations" :key="index">
          <td>
            <select v-model="row.type">
              <option value="Local">Local</option>
              <option value="Import">Import</option>
            </select>
          </td>
        <td>
  <input type="number" :value="1" readonly>
</td>
          <td v-if="row.type=='Import'">
            <input type="number" v-model.number="row.usd_rate">
          </td>
          <td v-if="row.type=='Local'">
            <input type="number" v-model.number="row.inr_rate">
          </td>
           <td v-if="row.type=='Import'">
  <select v-model="row.currency">
    <option value="">Select Currency</option>
    <option 
      v-for="currency in currencies" 
      :key="currency" 
      :value="currency"
    >
      {{ currency }}
    </option>
  </select>
</td>
          <td v-if="row.type=='Import'">
            <input type="number" v-model.number="row.usd_to_inr">
          </td>
          <td v-if="row.type=='Import'">
            <select v-model.number="row.freight">
              <option v-for="i in percentOptions" :value="i">{{ i }}%</option>
            </select>
          </td>
          <td v-if="row.type=='Import'">
            <select v-model.number="row.duty">
              <option v-for="i in percentOptions" :value="i">{{ i }}%</option>
            </select>
          </td>
          <td>
            <input type="number" v-model.number="row.clearance">
          </td>
          <td>
            {{ calculateDDP(row).toFixed(2) }}
          </td>
          <td>10%</td>
          <td>
            <select v-model.number="row.markup">
              <option v-for="i in percentOptions" :value="i">{{ i }}%</option>
            </select>
          </td>
          <td>
            <select v-model.number="row.bank">
              <option v-for="i in percentOptions" :value="i">{{ i }}%</option>
            </select>
          </td>
          <td>
            <b>{{ calculateSelling(row).toFixed(2) }}</b>
          </td>
         
          <td>
            <button @click="removeNewRow(index)">❌</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- AWESOME QUOTATION MODAL (CREATE / EDIT) -->
<div v-if="showQuotation" class="quotation-backdrop pro-modal-backdrop-top" @click.self="showQuotation = false; refreshForm();">
  <div class="quotation-modal pro-quotation-modal">
    
    <!-- TOP STICKY HEADER -->
    <div class="pro-modal-header">
      <div class="pro-header-left">
        <div class="pro-header-icon" :class="isEdit ? 'icon-amber' : 'icon-cyan'">
          <i :class="isEdit ? 'fas fa-file-pen' : 'fas fa-file-circle-plus'"></i>
        </div>
        <div>
          <div class="pro-header-title-row">
            <h2 class="pro-modal-title">{{ isEdit ? "Edit Quotation" : "Create New Quotation" }}</h2>
            <span class="pro-status-pill" :class="isEdit ? 'pill-amber' : 'pill-cyan'">
              {{ isEdit ? 'Revision' : 'New Quote' }}
            </span>
          </div>
          <div class="pro-company-subchip" v-if="form.company_name">
            <i class="fas fa-building"></i> {{ form.company_name }}
          </div>
        </div>
      </div>

      <div class="pro-header-actions">
        <button
          type="button"
          class="pro-btn-header-action"
          @click="openViewQuotationPopup(form.company_name)"
        >
          <i class='fas fa-file-invoice'></i>
          <span>View Quotations</span>
        </button>

        <button type="button" class="pro-btn-header-close" @click="showQuotation = false; refreshForm();" title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- SCROLLABLE FORM BODY -->
    <div class="pro-modal-body">

      <!-- SECTION 1: CUSTOMER & SALE INFO -->
      <div class="pro-card-section">
        <div class="pro-card-header">
          <div class="pro-card-header-icon bg-blue"><i class="fas fa-building-user"></i></div>
          <div class="pro-card-header-title">
            <h3>General & Sale Information</h3>
            <span>Customer company, nature of taxation and currency settings</span>
          </div>
        </div>

        <!-- Row 1: Company & Reference -->
        <div class="pro-grid-2col">
          <div class="pro-field-wrap">
            <label class="pro-label"><i class="fas fa-building"></i> Customer Company</label>
            <div class="pro-readonly-badge">
              <i class="fas fa-check-circle text-emerald"></i>
              <span class="pro-company-name-text">{{ form.company_name || 'No Company Selected' }}</span>
            </div>
          </div>

          <div class="pro-field-wrap">
            <label class="pro-label"><i class="fas fa-receipt"></i> Customer Reference / RFQ #</label>
            <input 
              v-model="form.customer_reference" 
              type="text" 
              placeholder="e.g. PO-REF-2026 / RFQ-089" 
              class="pro-input" 
            />
          </div>
        </div>

        <!-- Row 2: Nature of Sale, Currency, Recommended By, Created By -->
        <div class="pro-grid-3col mt-3">
          <div class="pro-field-wrap">
            <label class="pro-label"><i class="fas fa-tag"></i> Nature of Sale <span class="req-star">*</span></label>
            <div class="pro-select-wrap">
              <select v-model="form.nature_of_sale" class="pro-select">
                <option value="">-- Select Nature of Sale --</option>
                <option value="Intrastate">Intrastate (Within State - CGST + SGST)</option>
                <option value="Interstate">Interstate (Outside State - IGST)</option>
                <option value="Export">Export (International - Zero Tax)</option>
              </select>
              <i class="fas fa-chevron-down pro-arrow"></i>
            </div>
          </div>

          <div class="pro-field-wrap" v-if="form.nature_of_sale === 'Export'">
            <label class="pro-label"><i class="fas fa-globe"></i> Billing Currency</label>
            <div class="pro-select-wrap">
              <select v-model="form.currency" class="pro-select">
                <option value="">-- Select Currency --</option>
                <option value="USD">USD – United States Dollar ($)</option>
                <option value="EUR">EUR – Euro (€)</option>
                <option value="GBP">GBP – British Pound Sterling (£)</option>
                <option value="AED">AED – United Arab Emirates Dirham (AED)</option>
                <option value="AUD">AUD – Australian Dollar (A$)</option>
                <option value="CAD">CAD – Canadian Dollar (C$)</option>
                <option value="SGD">SGD – Singapore Dollar (S$)</option>
                <option value="INR">INR – Indian Rupee (₹)</option>
                <option value="JPY">JPY – Japanese Yen (¥)</option>
                <option value="SAR">SAR – Saudi Riyal (SAR)</option>
                <option value="QAR">QAR – Qatar Rial (QAR)</option>
                <option value="OMR">OMR – Omani Rial (OMR)</option>
                <option value="KWD">KWD – Kuwaiti Dinar (KWD)</option>
                <option value="BHD">BHD – Bahraini Dinar (BHD)</option>
                <option value="CHF">CHF – Swiss Franc (CHF)</option>
                <option value="CNY">CNY – Chinese Yuan (¥)</option>
                <option value="ZAR">ZAR – South African Rand (R)</option>
                <option value="MYR">MYR – Malaysian Ringgit (RM)</option>
                <option value="THB">THB – Thai Baht (฿)</option>
                <option value="NZD">NZD – New Zealand Dollar (NZ$)</option>
              </select>
              <i class="fas fa-chevron-down pro-arrow"></i>
            </div>
          </div>

          <div class="pro-field-wrap">
            <label class="pro-label"><i class="fas fa-user-check"></i> Recommended By</label>
            <div class="pro-select-wrap">
              <select v-model="form.recommended_by" class="pro-select">
                <option value="">-- Select Employee --</option>
                <option v-for="user in users" :key="user.id" :value="user.emp_id">
                  {{ user.emp_id }}
                </option>
              </select>
              <i class="fas fa-chevron-down pro-arrow"></i>
            </div>
          </div>

          <div class="pro-field-wrap">
            <label class="pro-label"><i class="fas fa-user-pen"></i> Created By</label>
            <input
              type="text"
              v-model="form.created_by"
              disabled
              class="pro-input pro-readonly"
            />
          </div>
        </div>

        <!-- Row 3: Shipping Address -->
        <div class="pro-field-wrap mt-3">
          <label class="pro-label"><i class="fas fa-location-dot"></i> Shipping Address (Optional)</label>
          <div class="pro-shipping-container">
            <textarea
              v-model="form.shipping_address"
              rows="2"
              placeholder="Enter shipping address if different from default customer billing address..."
              class="pro-input pro-textarea"
            ></textarea>
            <div class="pro-shipping-actions">
              <button
                type="button"
                class="save-shipp-address pro-btn-update-addr"
                :disabled="loading"
                @click="handleClick"
              >
                <span v-if="loading"><i class="fa fa-refresh fa-spin"></i> Updating...</span>
                <span v-else><i class="fas fa-arrows-rotate"></i> Update Address</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: EQUIPMENTS & SPECIFICATIONS -->
      <div class="pro-card-section">
        <div class="pro-card-header">
          <div class="pro-card-header-icon bg-purple"><i class="fas fa-gears"></i></div>
          <div class="pro-card-header-title">
            <h3>Equipment Specifications</h3>
            <span>Link registered equipment or enter machine details manually</span>
          </div>
        </div>

        <!-- Mode Toggle -->
        <div class="pro-segmented-switch">
          <label class="pro-segment-btn" :class="{ active: equipmentInputMode === 'select' }">
            <input 
              type="radio" 
              value="select" 
              v-model="equipmentInputMode"
              @change="onInputModeChange"
              style="display:none;"
            />
            <i class="fas fa-database"></i> Select from Database
          </label>
          <label class="pro-segment-btn" :class="{ active: equipmentInputMode === 'manual' }">
            <input 
              type="radio" 
              value="manual" 
              v-model="equipmentInputMode"
              @change="onInputModeChange"
              style="display:none;"
            />
            <i class="fas fa-keyboard"></i> Manual Key-in
          </label>
        </div>

        <!-- DB Selection View -->
        <div v-if="equipmentInputMode === 'select'" class="pro-db-equip-area">
          <div class="pro-equip-checkbox-bar">
            <div 
              v-for="equipType in equipmentTypes" 
              :key="equipType.key" 
              class="pro-equip-check-item"
            >
              <input 
                type="checkbox" 
                :id="'equip_check_' + equipType.key"
                :value="equipType.key"
                v-model="selectedEquipmentTypes"
                @change="fetchEquipmentByType(equipType.key)"
                style="display:none;"
              />
              <label 
                :for="'equip_check_' + equipType.key" 
                class="pro-equip-tag-pill"
                :class="{ selected: selectedEquipmentTypes.includes(equipType.key) }"
              >
                <i :class="selectedEquipmentTypes.includes(equipType.key) ? 'fas fa-check-circle' : 'far fa-circle'"></i>
                <span>{{ equipType.label }}</span>
              </label>
            </div>
          </div>

          <!-- Multi-select Dropdowns -->
          <div v-for="equipType in selectedEquipmentTypes" :key="'select_' + equipType" class="pro-equip-dropdown-row">
            <label :for="'equip_select_' + equipType" class="pro-label">
              <i class="fas fa-microchip"></i> Select {{ getEquipmentLabel(equipType) }}(s):
            </label>
            <select 
              :id="'equip_select_' + equipType"
              v-model="selectedEquipment[equipType]"
              @change="onEquipmentSelect(equipType)"
              multiple
              size="3"
              class="pro-select-multiple"
            >
              <option 
                v-for="equip in equipmentList[equipType]" 
                :key="equip.id" 
                :value="equip"
              >
                {{ equip.model }} - {{ equip.controller }} ({{ equip.make || 'N/A' }})
              </option>
            </select>

            <!-- Selected Chips -->
            <div v-if="selectedEquipment[equipType] && selectedEquipment[equipType].length" class="pro-chips-wrap">
              <div 
                v-for="(equip, idx) in selectedEquipment[equipType]" 
                :key="idx"
                class="pro-equip-chip"
              >
                <i class="fas fa-cube text-blue"></i>
                <span>{{ equip.model }} - {{ equip.controller }}</span>
                <button 
                  type="button"
                  @click="removeSelectedEquipment(equipType, idx)"
                  class="pro-chip-del-btn"
                  title="Remove"
                >×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Manual Entry View -->
        <div v-if="equipmentInputMode === 'manual'" class="pro-manual-equip-area">
          <div class="pro-grid-2col">
            <div class="pro-field-wrap">
              <label class="pro-label">Equipment Serial Numbers</label>
              <textarea 
                v-model="manualSerialNumbers"
                rows="2"
                placeholder="Enter serial numbers separated by commas (e.g. SN1234, SN5678)"
                class="pro-input pro-textarea"
                @input="updateManualFields"
              ></textarea>
            </div>
            <div class="pro-field-wrap">
              <label class="pro-label">Equipment Model Numbers</label>
              <textarea 
                v-model="manualModelNumbers"
                rows="2"
                placeholder="Enter model numbers separated by commas (e.g. MOD-100, MOD-200)"
                class="pro-input pro-textarea"
                @input="updateManualFields"
              ></textarea>
            </div>
          </div>

          <div class="pro-manual-action-bar">
            <button type="button" @click="addManualRow" class="pro-btn-green">
              <i class="fas fa-plus"></i> Add Equipment Row
            </button>
            <button type="button" @click="clearManualFields" class="pro-btn-gray">
              <i class="fas fa-eraser"></i> Clear Fields
            </button>
          </div>

          <!-- Added Manual List -->
          <div v-if="manualEquipmentList.length > 0" class="pro-manual-list-card">
            <span class="pro-label">Added Machine Entries:</span>
            <div class="pro-chips-wrap">
              <div v-for="(item, idx) in manualEquipmentList" :key="idx" class="pro-manual-chip">
                <span><strong>SN:</strong> {{ item.serial }}</span>
                <span><strong>Model:</strong> {{ item.model }}</span>
                <button type="button" @click="removeManualRow(idx)" class="pro-chip-del-btn">×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Equipment Summaries -->
        <div class="pro-grid-2col mt-3">
          <div class="pro-field-wrap">
            <label class="pro-label"><i class="fas fa-hashtag"></i> Equipment Serial No (Summary)</label>
            <textarea 
              v-model="form.engine_serial" 
              rows="2"
              :placeholder="equipmentInputMode === 'select' ? 'Auto-filled from selected equipment' : 'Enter serial numbers'"
              :readonly="equipmentInputMode === 'select'"
              :class="{'pro-readonly': equipmentInputMode === 'select'}"
              class="pro-input pro-textarea"
            ></textarea>
          </div>

          <div class="pro-field-wrap">
            <label class="pro-label"><i class="fas fa-box"></i> Model No (Summary)</label>
            <textarea 
              v-model="form.model_no" 
              rows="2"
              :placeholder="equipmentInputMode === 'select' ? 'Auto-filled from selected equipment' : 'Enter model numbers'"
              :readonly="equipmentInputMode === 'select'"
              :class="{'pro-readonly': equipmentInputMode === 'select'}"
              class="pro-input pro-textarea"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- SECTION 3: LINE ITEMS & PRICING -->
      <div class="pro-card-section">
        <div class="pro-items-section-header">
          <div class="pro-card-header-left">
            <div class="pro-card-header-icon bg-emerald"><i class="fas fa-boxes-stacked"></i></div>
            <div class="pro-card-header-title">
              <h3>Line Items & Pricing</h3>
              <span>Detailed item breakdown, unit rates, quantities and tax calculation</span>
            </div>
          </div>

          <div class="pro-items-header-controls">
            <span class="pro-items-count-pill">
              <i class="fas fa-cube"></i> {{ form.items.length }} {{ form.items.length === 1 ? 'Item' : 'Items' }}
            </span>
            <button type="button" class="pro-btn-add-item-top" @click="addItem">
              <i class="fas fa-plus"></i> <span>Add Item</span>
            </button>
          </div>
        </div>

        <!-- ITEM CARDS LIST -->
        <div class="pro-item-cards-container">
          <div v-for="(item, index) in form.items" :key="index" class="pro-item-card">
            
            <!-- Item Card Top Header -->
            <div class="pro-item-header-row">
              <div class="pro-item-badge-wrap">
                <span class="pro-item-number-badge">#{{ index + 1 }}</span>
                <span class="pro-item-title-text">Item #{{ index + 1 }} Details</span>
              </div>

              <div class="pro-item-actions-wrap">
                <!-- Move Up / Down / Pos -->
                <div class="pro-reorder-group">
                  <button 
                    type="button" 
                    class="pro-reorder-btn" 
                    @click="moveItemUp(index)" 
                    :disabled="index === 0" 
                    title="Move Item Up"
                  >
                    <i class="fas fa-arrow-up"></i>
                  </button>
                  <button 
                    type="button" 
                    class="pro-reorder-btn" 
                    @click="moveItemDown(index)" 
                    :disabled="index === form.items.length - 1" 
                    title="Move Item Down"
                  >
                    <i class="fas fa-arrow-down"></i>
                  </button>
                  <div class="pro-pos-selector">
                    <span class="pro-pos-label">Pos:</span>
                    <select :value="index" @change="moveItem(index, Number($event.target.value))" class="pro-pos-select">
                      <option v-for="pos in form.items.length" :key="pos" :value="pos - 1">{{ pos }}</option>
                    </select>
                  </div>
                </div>

                <!-- Delete Item -->
                <button type="button" class="pro-item-delete-btn" @click="removeItem(index)" title="Remove Item">
                  <i class="fas fa-trash-can"></i> <span>Remove</span>
                </button>
              </div>
            </div>

            <!-- ROW 1: Full-width Description -->
            <div class="pro-item-desc-full">
              <label class="pro-label">Description of Goods / Services <span class="req-star">*</span></label>
              <textarea
                v-model="item.description"
                rows="2"
                placeholder="Enter detailed description of products or services offered..."
                class="pro-input pro-textarea"
              ></textarea>
            </div>

            <!-- ROW 2: Balanced Commercials Strip -->
            <div class="pro-commercials-strip">
              <!-- HSN Code -->
              <div class="pro-strip-col col-hsn">
                <label class="pro-label">HSN / SAC Code <span class="req-star">*</span></label>
                <div class="pro-select-wrap">
                  <select v-model="item.hsn" class="pro-select">
                    <option disabled value="">Select HSN</option>
                    <option v-for="hsn in hsnList" :key="hsn.id" :value="hsn.hsn">
                      {{ hsn.item_name }} ({{ hsn.hsn }})
                    </option>
                    <option value="manual">➕ Enter Manually</option>
                  </select>
                  <i class="fas fa-chevron-down pro-arrow"></i>
                </div>
                <input
                  v-if="item.hsn === 'manual'"
                  v-model="item.manual_hsn"
                  type="number"
                  placeholder="Enter HSN"
                  class="pro-input mt-2"
                />
              </div>

              <!-- Quantity -->
              <div class="pro-strip-col col-qty">
                <label class="pro-label">Quantity <span class="req-star">*</span></label>
                <input
                  v-model="item.qty"
                  type="number"
                  min="0"
                  placeholder="0"
                  @keydown="preventMinus"
                  @input="validateQty(item)"
                  class="pro-input"
                />
              </div>

              <!-- UOM -->
              <div class="pro-strip-col col-uom">
                <label class="pro-label">UOM <span class="req-star">*</span></label>
                <div class="pro-select-wrap">
                  <select v-model="item.uom" class="pro-select">
                    <option value="">Select UOM</option>
                    <option value="Lit.">Lit.</option>
                    <option value="NOS.">NOS.</option>
                    <option value="Box">Box</option>
                    <option value="Set">Set</option>
                    <option value="K.G.">K.G.</option>
                    <option value="Day">Day</option>
                  </select>
                  <i class="fas fa-chevron-down pro-arrow"></i>
                </div>
              </div>

              <!-- Rate -->
              <div class="pro-strip-col col-rate">
                <label class="pro-label">Unit Rate (₹) <span class="req-star">*</span></label>
                <input
                  v-model="item.rate"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  @keydown="preventMinus"
                  @input="validateQty(item)"
                  class="pro-input"
                />
              </div>

              <!-- Discount -->
              <div class="pro-strip-col col-disc">
                <label class="pro-label">Discount (%)</label>
                <input
                  v-model.number="item.discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  @keydown="preventInvalidKeys"
                  @input="validateDiscount(item)"
                  class="pro-input"
                />
              </div>

              <!-- GST Taxes if Intrastate -->
              <div v-if="form.nature_of_sale === 'Intrastate'" class="pro-strip-col col-tax">
                <label class="pro-label">CGST (%)</label>
                <input v-model="item.cgst_rate" type="number" min="0" placeholder="0" @keydown="preventMinus" @input="validateQty(item)" class="pro-input"/>
              </div>

              <div v-if="form.nature_of_sale === 'Intrastate'" class="pro-strip-col col-tax">
                <label class="pro-label">SGST (%)</label>
                <input v-model="item.sgst_rate" type="number" min="0" placeholder="0" @keydown="preventMinus" @input="validateQty(item)" class="pro-input"/>
              </div>

              <!-- GST Taxes if Interstate -->
              <div v-if="form.nature_of_sale === 'Interstate'" class="pro-strip-col col-tax">
                <label class="pro-label">IGST (%)</label>
                <input v-model="item.igst_rate" type="number" min="0" placeholder="0" @keydown="preventMinus" @input="validateQty(item)" class="pro-input"/>
              </div>
            </div>

            <!-- ROW 3: Calculation Ribbon & Item Total -->
            <div class="pro-item-calc-ribbon">
              <div class="pro-item-ribbon-left">
                <div v-if="form.nature_of_sale === 'Export'" class="pro-export-callout">
                  <i class="fas fa-plane-departure"></i> <span>Export Supply (Zero GST)</span>
                </div>
                <div v-else class="pro-formula-hint">
                  <i class="fas fa-calculator text-blue"></i>
                  <span>Calculation: (Qty × Rate - Discount) + Taxes</span>
                </div>
              </div>

              <div class="pro-item-ribbon-right">
                <button 
                  type="button"
                  class="calculation-item-btn pro-btn-calc-sheet"
                  @click="openCalculationSheetForItem(item, index)"
                  title="Open Calculation Sheet"
                >
                  <i class='fas fa-calculator'></i> <span>Calc Sheet</span>
                </button>

                <div class="pro-item-total-badge">
                  <span class="pro-total-lbl">Item Net Total:</span>
                  <span class="pro-total-amount">₹ {{ calculateItemTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Add Item Bottom Action -->
        <button type="button" class="pro-btn-add-item-bottom" @click="addItem">
          <i class="fas fa-plus-circle"></i> <span>Add Another Item</span>
        </button>
      </div>

      <!-- SECTION 4: TERMS & CONDITIONS -->
      <div class="pro-card-section">
        <div class="pro-card-header">
          <div class="pro-card-header-icon bg-amber"><i class="fas fa-file-contract"></i></div>
          <div class="pro-card-header-title">
            <h3>Terms & Conditions</h3>
            <span>Commercial and payment terms template</span>
          </div>
        </div>

        <!-- Terms Template Buttons -->
        <div class="pro-terms-pill-row">
          <button
            type="button"
            class="pro-terms-pill"
            :class="{ active: selectedTerms === 'regular' }"
            @click="setRegularTerms"
          >
            <i class="fas fa-file-lines"></i> <span>Regular Terms</span>
          </button>

          <button
            type="button"
            class="pro-terms-pill"
            :class="{ active: selectedTerms === 'amc' }"
            @click="setAmcTerms"
          >
            <i class="fas fa-shield-halved"></i> <span>AMC Terms</span>
          </button>

          <button
            type="button"
            class="pro-terms-pill"
            :class="{ active: selectedTerms === 'newengine' }"
            @click="setNewEngineTerms"
          >
            <i class="fas fa-car-battery"></i> <span>New Engine Sales</span>
          </button>
        </div>

        <!-- Terms Textarea -->
        <div class="pro-terms-textarea-wrap">
          <textarea
            v-model="form.terms_conditions"
            rows="8"
            maxlength="5000"
            placeholder="Commercial terms and conditions will appear here..."
            class="pro-input pro-terms-textarea"
          ></textarea>

          <div class="pro-char-counter">
            <i class="far fa-keyboard"></i>
            <span>{{ form.terms_conditions ? form.terms_conditions.length : 0 }} / 5000 characters</span>
          </div>
        </div>
      </div>

    </div>

    <!-- STICKY ACTION FOOTER -->
    <div class="pro-modal-footer">
      <div class="pro-footer-left">
        <div class="pro-footer-stat">
          <span class="pro-stat-tag">Total Items:</span>
          <span class="pro-stat-number">{{ form.items.length }}</span>
        </div>
      </div>

      <div class="pro-footer-actions">
        <button type="button" class="pro-btn-footer-cancel" @click="showQuotation = false; refreshForm();">
          Cancel
        </button>

        <button type="button" class="quotation-submit-btn pro-btn-footer-submit" @click="submitQuotation">
          <i class="fa fa-save"></i>
          <span>{{ isEdit ? "Update Quotation" : "Save Quotation" }}</span>
        </button>
      </div>
    </div>

  </div>
</div>

<!-- PROFESSIONAL EMAIL MODAL -->
<div v-if="showEmailModal" class="email-overlay">
  <div class="email-modal">

    <!-- HEADER -->
    <div class="modal-header">
      <h3>Customer Email List</h3>

    </div>

    <!-- BODY -->
    <div class="modal-body">

      <div class="customer-row">
        <input type="checkbox" @change="toggleAll($event)" />
      <span> All</span>
      </div>

      <div
        v-for="customer in customers"
        :key="customer.id"
        class="customer-row"
      >
        <input
          type="checkbox"
          :value="customer.email"
          v-model="selectedEmails"
        />
        <span>{{ customer.email }}</span>
      </div>

    </div>

    <!-- FIXED FOOTER -->
    <div class="modal-footer">

      <span class="selected-count">
        {{ selectedEmails.length }} Selected
      </span>

      <div class="action-buttons">
        <button
          class="copy-btn"
          :disabled="selectedEmails.length === 0"
          @click="copyEmails"
        >
          <i class="fa fa-copy"></i> Copy Emails
        </button>

        <button
          class="close-btn"
          @click="showEmailModal = false"
        >
          Close
        </button>
      </div>

    </div>

  </div>
</div>

<!-- Popup Modal -->
<div v-if="showAssignPoModal" class="modal-backdrop">
  
<!-- Manage Purchase Order Modal -->
<div v-if="showAssignPoModal" class="modal-backdrop" @click.self="showAssignPoModal = false">
  <div class="modal-card large po-management-modal">
    
    <!-- Header with Back Button -->
    <div class="modal-header-custom">
      <button class="btn-back" @click="showAssignPoModal = false">
        <i class="fas fa-arrow-left"></i>
        <span>Back</span>
      </button>
      <div class="modal-title-wrapper">
        <div class="modal-icon-badge">
          <i class="fas fa-tasks"></i>
        </div>
        <h2 class="modal-title">Manage Purchase Orders</h2>
        <p class="modal-subtitle">Create and manage different types of purchase orders</p>
      </div>
    </div>

    <!-- Action Cards Grid -->
    <div class="po-action-grid">
      <div class="po-action-card" @click="openVisitPopup">
        <div class="card-icon-wrapper amc">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="card-content">
          <h3>AMC</h3>
          <p>Annual Maintenance Contract</p>
          <span class="card-tag">Manage Visits</span>
        </div>
       
      </div>

      <div class="po-action-card" @click="openServicePopup">
        <div class="card-icon-wrapper service">
          <i class="fas fa-tools"></i>
        </div>
        <div class="card-content">
          <h3>Service Orders</h3>
          <p>Service & maintenance requests</p>
          <span class="card-tag">Assign Service</span>
        </div>
       
      </div>

      <div class="po-action-card" @click="openSupplyPopup">
        <div class="card-icon-wrapper supply">
          <i class="fas fa-boxes"></i>
        </div>
        <div class="card-content">
          <h3>Material Supply</h3>
          <p>Supply chain & delivery management</p>
          <span class="card-tag">Track Supply</span>
        </div>
       
      </div>
    </div>

    <!-- Quick Stats / Info Section -->
    <div class="po-quick-stats">
      <div class="stat-item">
        <span class="stat-number">{{ visit_assign.length || 0 }}</span>
        <span class="stat-label">Active AMC</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-number">{{ servicePoList.length || 0 }}</span>
        <span class="stat-label">Service Orders</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-number">{{ supplies.length || 0 }}</span>
        <span class="stat-label">Supply Orders</span>
      </div>
    </div>

    <!-- Footer Note -->
    
  </div>
</div>
</div>
<div v-if="isLoadingCustomers" class="table-state">
  <div class="loader-panel">
    <span class="spinner"></span>
    <p>Loading customers...</p>
  </div>
</div>

<!-- Table Section - Replace your existing table with this -->
<div v-if="!isLoadingCustomers && filteredCustomers.length === 0" class="table-empty-state">
  <div class="empty-card">
    <h3>No customers found</h3>
    <p>Try adjusting your search or filters to locate the customer record.</p>
  </div>
</div>

<div v-if="!isLoadingCustomers && filteredCustomers.length > 0" class="crm-table-card">
  <!-- Desktop Table View -->
  <div class="crm-table-responsive" v-if="!isMobile">
    <table class="crm-customer-table">
      <thead>
        <tr>
          <th style="width: 8%; text-align: center;">Sr. No.</th>
          <th style="width: 48%;">Customer Company</th>
          <th style="width: 16%; text-align: center;">Customer ID</th>
          <th style="width: 28%; text-align: center;">Quick Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cust, index) in filteredCustomers" :key="cust.id" class="crm-table-row">
          <td style="text-align: center;">
            <span class="crm-sr-badge">#{{ index + 1 }}</span>
          </td>
          <td>
            <div class="crm-company-cell">
              <div class="crm-company-avatar">
                <i class="fas fa-building"></i>
              </div>
              <a
                href="#"
                class="crm-company-link tooltip-link"
                data-tooltip="View customer & add PO"
                @click.prevent="viewCustomerDetails(cust)"
              >
                {{ formatCompanyName(cust.company_name) }}
              </a>
            </div>
          </td>
          <td style="text-align: center;">
            <span class="crm-cust-no-badge">{{ formatNumber(cust.id) }}</span>
          </td>
          <td style="text-align: center;">
            <div class="crm-action-buttons-wrap">
              <button 
                class="crm-action-btn btn-view-po tooltip-btn"
                data-tooltip="View Purchase Order"
                @click="openviewPoModal(cust.company_name)"
              >
                <i class="fa fa-eye"></i>
                <span>View PO</span>
              </button>
              <button
                class="crm-action-btn btn-quotation tooltip-btn"
                data-tooltip="Create Quotation"
                @click="openQuotationlist(cust)"
              >
                <i class="fa fa-file-text-o"></i>
                <span>Quote</span>
              </button>
              <button
                class="crm-action-btn btn-report tooltip-btn"
                data-tooltip="View Report"
                @click="openWelcomeModal(cust.company_name)"
              >
                <i class='fas fa-file-invoice'></i>
                <span>Reports</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Mobile Card View -->
  <div v-if="isMobile" class="mobile-cards">
    <div v-for="(cust, index) in filteredCustomers" :key="cust.id" class="customer-card">
      <div class="card-header">
        <div class="card-company">
          <span class="card-sr">#{{ index + 1 }}</span>
          <a
            href="#"
            class="company-link"
            @click.prevent="viewCustomerDetails(cust)"
          >
            {{ formatCompanyName(cust.company_name) }}
          </a>
        </div>
        <span class="cust-number">{{ formatNumber(cust.id) }}</span>
      </div>
      <div class="card-actions">
        <button class="action-btn-small view-po desktop-only" @click="openviewPoModal(cust.company_name)">
          <i class="fa fa-eye desktop-only"></i> View PO
        </button>
        <button class="action-btn-small quotation" @click="openQuotationlist(cust)">
          <i class="fa fa-file-text-o desktop-only"></i> Quotation
        </button>
        <button class="action-btn-small reports" @click="openWelcomeModal(cust.company_name)">
          <i class='fas fa-file-invoice desktop-only'></i> Reports
        </button>
      </div>
    </div>
  </div>
</div>

<div v-if="showWelcomeModal" class="modal-backdrop" @click.self="closeWelcomeModal">
    <div class="modal-card">
      <!-- Header -->
      <div class="modal-header">
        <button class="btn-back" @click="closeWelcomeModal">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <h3 class="modal-title">
          <strong>{{ selectedCompany }}</strong> reports
        </h3>

        <div class="table-wrapper" v-if="allReports.length">
          <table class="report-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Uploaded date</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in allReports" :key="index">
                <td>
                  <!-- Service -->
                  <span
                    v-if="item.type === 'Service'"
                    class="badge-service"
                  >
                    {{ item.type_of_service }}
                  </span>

                  <!-- Visit -->
                  <span
                    v-else
                    class="badge-visit"
                  >
                    {{ item.type }}
                  </span>
                </td>

                <td>{{ formatDate(item.updated_at) }}</td>

                <td>
                  <div v-if="item.report_path" class="report-actions">
                    <button
                      v-for="(path, idx) in item.report_path.split(',')"
                      :key="idx"
                      class="view-btn"
                      @click="openReport(path)"
                    >
                      <i class="fas fa-file-invoice"></i> Report {{ idx + 1 }}
                    </button>
                  </div>
                  <span v-else class="not-available">
                    Not Available
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="empty-state">No reports found.</p>
      </div>
    </div>
  </div>




<!--Show material POPUP -->
<div v-if="showSupplyMaterialModal" class="completed-services-modal-overlay">
   <div class="completed-services-modal">
    <div class="modal-header">
    <h3>Delivered Supplies</h3>
 <button class="close-btn" @click="showCompletedOrders = false">❌</button>
  </div>

    <div class="modal-body">
      <table class="completed-services-table">
        <thead>
   
        <tr>
          <th>Company Name</th>
          <th>PO Number</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="supply in supplies" :key="supply.id">
          <td>{{ supply.company_name }}</td>
          <td>{{ supply.po_number }}</td>
          <td>{{ supply.date }}</td>
          <td>{{ supply.status }}</td>
        </tr>
      </tbody>
    </table>


  </div>
</div>
  </div>
 
<!-- VISIT ORDERS POPUP (AMC PENDING & ASSIGNED VISITS) -->
<div v-if="showVisitPopup" class="pro-modal-backdrop-top" @click.self="showVisitPopup = false">
  <div class="modal-card pro-table-modal">

    <!-- MODAL HEADER -->
    <div class="pro-modal-header">
      <div class="pro-header-left">
        <div class="pro-header-icon icon-cyan">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div>
          <div class="pro-header-title-row">
            <h2 class="pro-modal-title">AMC Pending & Assigned Visits</h2>
            <span class="pro-status-pill pill-cyan">{{ filteredVisits.length }} Visits</span>
          </div>
          <span class="pro-company-subchip">
            <i class="fas fa-clock"></i> Schedule and assign upcoming AMC customer visits
          </span>
        </div>
      </div>

      <div class="pro-header-actions">
        <button class="pro-btn-header-action" @click="openAssignedVisits">
          <i class="fa fa-check-square-o"></i> <span>Completed Visits</span>
        </button>

        <button type="button" class="pro-btn-header-close" @click="showVisitPopup = false" title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pro-filter-toolbar">
      <div class="pro-search-box">
        <i class="fas fa-search pro-search-icon"></i>
        <input
          type="text"
          v-model="filters.search"
          placeholder="Search company or PO number..."
          class="pro-search-input"
        />
        <button v-if="filters.search" class="pro-clear-btn" @click="filters.search = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="pro-filter-month-box">
        <i class="fas fa-calendar-days pro-month-icon"></i>
        <select v-model="filters.month" class="pro-month-select">
          <option :value="null">All Months</option>
          <option
            v-for="(m, index) in months"
            :key="index"
            :value="index + 1"
          >
            {{ m }}
          </option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>
    </div>

    <!-- TABLE AREA -->
    <div class="pro-table-scroll">
      <table class="pro-styled-table">
        <thead>
          <tr>
            <th style="width: 40%;">Company Name</th>
            <th style="width: 30%;">Scheduled Visit Date</th>
            <th style="width: 30%;">Assign Engineer / Employee</th>
          </tr>
        </thead>

        <tbody v-if="filteredVisits.length">
          <tr
            v-for="(visit, index) in filteredVisits"
            :key="`${visit.company_name}-${visit.visit_date}-${index}`"
            class="pro-table-row"
          >
            <td>
              <div class="pro-company-cell">
                <div class="pro-cell-icon bg-blue"><i class="fas fa-building"></i></div>
                <span class="pro-company-name">{{ visit.company_name }}</span>
              </div>
            </td>

            <td>
              <div class="pro-date-cell-wrap">
                <i class="fas fa-calendar-day pro-date-icon"></i>
                <input
                  type="date"
                  v-model="visit.visit_date"
                  class="pro-date-input"
                  placeholder="Select date"
                  @change="updateAmcVisitDate(visit)"
                />
              </div>
            </td>

            <td>
              <div class="pro-select-cell-wrap">
                <i class="fas fa-user-gear pro-user-icon"></i>
                <select 
                  v-model.number="visit.assign_to" 
                  @change="assignVisit(visit)"
                  class="pro-assign-select"
                >
                  <option disabled value="">-- Assign Employee --</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.name }}
                  </option>
                </select>
                <i class="fas fa-chevron-down pro-arrow"></i>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- NO DATA -->
        <tbody v-else>
          <tr>
            <td colspan="3" class="pro-no-data-cell">
              <div class="pro-no-data-wrap">
                <i class="fas fa-calendar-xmark"></i>
                <p>No AMC visit assignments found matching your search</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

<!-- ASSIGNED VISITS POPUP (COMPLETED VISITS) -->
<div v-if="showVisitsPopup" class="pro-modal-backdrop-top" @click.self="showVisitsPopup = false">
  <div class="modal-card pro-table-modal">

    <!-- MODAL HEADER -->
    <div class="pro-modal-header header-emerald">
      <div class="pro-header-left">
        <div class="pro-header-icon icon-emerald">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <div>
          <div class="pro-header-title-row">
            <h2 class="pro-modal-title">Completed AMC Visits</h2>
            <span class="pro-status-pill pill-emerald">{{ filteredCompletedVisits.length }} Completed</span>
          </div>
          <span class="pro-company-subchip">
            <i class="fas fa-circle-check"></i> Finished AMC visit records and service reports
          </span>
        </div>
      </div>

      <div class="pro-header-actions">
        <button type="button" class="pro-btn-header-close" @click="showVisitsPopup = false" title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pro-filter-toolbar">
      <div class="pro-search-box">
        <i class="fas fa-search pro-search-icon"></i>
        <input
          type="text"
          v-model="completedFilters.search"
          placeholder="Search company or PO number..."
          class="pro-search-input"
        />
        <button v-if="completedFilters.search" class="pro-clear-btn" @click="completedFilters.search = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="pro-filter-month-box">
        <i class="fas fa-calendar-days pro-month-icon"></i>
        <select v-model="completedFilters.month" class="pro-month-select">
          <option value="">All Months</option>
          <option
            v-for="(m, index) in months"
            :key="index"
            :value="index + 1"
          >
            {{ m }}
          </option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>
    </div>

    <!-- TABLE AREA -->
    <div class="pro-table-scroll">
      <table class="pro-styled-table">
        <thead>
          <tr>
            <th style="width: 35%;">Company Name</th>
            <th style="width: 25%;">Completed Date</th>
            <th style="width: 20%;">Assigned Engineer</th>
            <th style="width: 20%; text-align: center;">Service Report</th>
          </tr>
        </thead>

        <tbody v-if="filteredCompletedVisits.length">
          <tr v-for="row in filteredCompletedVisits" :key="row.id" class="pro-table-row">
            <td>
              <div class="pro-company-cell">
                <div class="pro-cell-icon bg-emerald"><i class="fas fa-building"></i></div>
                <span class="pro-company-name">{{ row.company_name }}</span>
              </div>
            </td>

            <td>
              <div class="pro-date-display">
                <i class="fas fa-calendar-check text-emerald"></i>
                <span>{{ row.visit_date }}</span>
              </div>
            </td>

            <td>
              <div class="pro-user-display">
                <i class="fas fa-user-check text-blue"></i>
                <span>{{ getUserName(row.assign_to) }}</span>
              </div>
            </td>

            <td style="text-align: center;">
              <div v-if="row.report_path && row.report_path.trim() !== ''" class="pro-reports-wrap">
                <button
                  v-for="(path, idx) in row.report_path.split(',')"
                  :key="idx"
                  class="pro-report-btn"
                  @click="viewReport(path)"
                >
                  <i class="fas fa-file-pdf"></i> Report {{ idx + 1 }}
                </button>
              </div>
              <span v-else class="pro-no-report-badge">No Report</span>
            </td>
          </tr>
        </tbody>

        <!-- NO DATA -->
        <tbody v-else>
          <tr>
            <td colspan="4" class="pro-no-data-cell">
              <div class="pro-no-data-wrap">
                <i class="fas fa-clipboard-question"></i>
                <p>No completed visits found matching your search</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

<!-- SERVICE ORDERS POPUP -->
<div v-if="showServicePopup" class="pro-modal-backdrop-top" @click.self="showServicePopup = false">
  <div class="modal-card pro-table-modal">

    <!-- MODAL HEADER -->
    <div class="pro-modal-header header-indigo">
      <div class="pro-header-left">
        <div class="pro-header-icon icon-indigo">
          <i class="fas fa-screwdriver-wrench"></i>
        </div>
        <div>
          <div class="pro-header-title-row">
            <h2 class="pro-modal-title">Pending & Assign Service Orders</h2>
            <span class="pro-status-pill pill-indigo">{{ filteredServicePoList.length }} Services</span>
          </div>
          <span class="pro-company-subchip">
            <i class="fas fa-tools"></i> Assign service personnel to active customer service orders
          </span>
        </div>
      </div>

      <div class="pro-header-actions">
        <button class="pro-btn-header-action" @click="openAssignedServicePopup">
          <i class="fa fa-check-square-o"></i> <span>Completed Services</span>
        </button>

        <button type="button" class="pro-btn-header-close" @click="showServicePopup = false" title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pro-filter-toolbar">
      <div class="pro-search-box">
        <i class="fas fa-search pro-search-icon"></i>
        <input
          type="text"
          v-model="serviceFilters.search"
          placeholder="Search company or PO number..."
          class="pro-search-input"
        />
        <button v-if="serviceFilters.search" class="pro-clear-btn" @click="serviceFilters.search = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="pro-filter-month-box">
        <i class="fas fa-calendar-days pro-month-icon"></i>
        <select v-model="serviceFilters.month" class="pro-month-select">
          <option value="">All Months</option>
          <option
            v-for="(m, index) in months"
            :key="index"
            :value="index + 1"
          >
            {{ m }}
          </option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>
    </div>

    <!-- TABLE AREA -->
    <div class="pro-table-scroll">
      <table class="pro-styled-table">
        <thead>
          <tr>
            <th style="width: 28%;">Company Name</th>
            <th style="width: 18%;">PO Number</th>
            <th style="width: 18%;">Scheduled Date</th>
            <th style="width: 16%;">Service Type</th>
            <th style="width: 20%;">Assign Engineer</th>
          </tr>
        </thead>

        <tbody v-if="filteredServicePoList.length">
          <tr v-for="order in filteredServicePoList" :key="order.id" class="pro-table-row">
            <td>
              <div class="pro-company-cell">
                <div class="pro-cell-icon bg-blue"><i class="fas fa-building"></i></div>
                <span class="pro-company-name">{{ order.company_name }}</span>
              </div>
            </td>

            <td>
              <span class="pro-po-pill">{{ order.po_number }}</span>
            </td>

            <td>
              <div class="pro-date-cell-wrap">
                <i class="fas fa-calendar-day pro-date-icon"></i>
                <input
                  type="date"
                  class="pro-date-input"
                  v-model="order.service_date"
                  @change="updateServiceDate(order)"
                />
              </div>
            </td>

            <td>
              <span class="pro-tag-pill">{{ order.type_of_service }}</span>
            </td>

            <td>
              <div class="pro-select-cell-wrap">
                <i class="fas fa-user-gear pro-user-icon"></i>
                <select
                  v-model="order.assign_to"
                  @change="onAssignChange(order)"
                  class="pro-assign-select"
                >
                  <option disabled value="">-- Assign Employee --</option>
                  <option
                    v-for="emp in employees"
                    :key="emp.id"
                    :value="emp.id"
                  >
                    {{ emp.name }}
                  </option>
                </select>
                <i class="fas fa-chevron-down pro-arrow"></i>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- NO DATA -->
        <tbody v-else>
          <tr>
            <td colspan="5" class="pro-no-data-cell">
              <div class="pro-no-data-wrap">
                <i class="fas fa-wrench"></i>
                <p>No service PO records found matching your search</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

<!-- ASSIGNED SERVICES POPUP -->
<div v-if="showAssignedServicePopup" class="pro-modal-backdrop-top" @click.self="showAssignedServicePopup = false">
  <div class="modal-card pro-table-modal">

    <!-- MODAL HEADER -->
    <div class="pro-modal-header header-emerald">
      <div class="pro-header-left">
        <div class="pro-header-icon icon-emerald">
          <i class="fas fa-clipboard-check"></i>
        </div>
        <div>
          <div class="pro-header-title-row">
            <h2 class="pro-modal-title">Completed Service Orders</h2>
            <span class="pro-status-pill pill-emerald">{{ filteredAssignedServiceList.length }} Completed</span>
          </div>
          <span class="pro-company-subchip">
            <i class="fas fa-circle-check"></i> Finished service logs and reports
          </span>
        </div>
      </div>

      <div class="pro-header-actions">
        <button type="button" class="pro-btn-header-close" @click="showAssignedServicePopup = false" title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pro-filter-toolbar">
      <div class="pro-search-box">
        <i class="fas fa-search pro-search-icon"></i>
        <input
          type="text"
          v-model="assignedServiceFilters.search"
          placeholder="Search company or PO number..."
          class="pro-search-input"
        />
        <button v-if="assignedServiceFilters.search" class="pro-clear-btn" @click="assignedServiceFilters.search = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="pro-filter-month-box">
        <i class="fas fa-calendar-days pro-month-icon"></i>
        <select v-model="assignedServiceFilters.month" class="pro-month-select">
          <option value="">All Months</option>
          <option
            v-for="(m, index) in months"
            :key="index"
            :value="index + 1"
          >
            {{ m }}
          </option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>
    </div>

    <!-- TABLE AREA -->
    <div class="pro-table-scroll">
      <table class="pro-styled-table">
        <thead>
          <tr>
            <th style="width: 25%;">Company Name</th>
            <th style="width: 15%;">PO Number</th>
            <th style="width: 15%;">Completed Date</th>
            <th style="width: 15%;">Service Type</th>
            <th style="width: 15%;">Assigned To</th>
            <th style="width: 15%; text-align: center;">Report</th>
          </tr>
        </thead>

        <tbody v-if="assignedServiceList.length">
          <tr v-for="item in filteredAssignedServiceList" :key="item.id" class="pro-table-row">
            <td>
              <div class="pro-company-cell">
                <div class="pro-cell-icon bg-emerald"><i class="fas fa-building"></i></div>
                <span class="pro-company-name">{{ item.company_name }}</span>
              </div>
            </td>

            <td><span class="pro-po-pill">{{ item.po_number }}</span></td>
            <td>
              <div class="pro-date-display">
                <i class="fas fa-calendar-check text-emerald"></i>
                <span>{{ item.visit_date }}</span>
              </div>
            </td>
            <td><span class="pro-tag-pill">{{ item.type_of_service }}</span></td>
            <td>
              <div class="pro-user-display">
                <i class="fas fa-user-check text-blue"></i>
                <span>{{ item.assign_to }}</span>
              </div>
            </td>
            <td style="text-align: center;">
              <div v-if="item.report_path && item.report_path.trim() !== ''" class="pro-reports-wrap">
                <button
                  v-for="(path, idx) in item.report_path.split(',')"
                  :key="idx"
                  class="pro-report-btn"
                  @click="viewReport(path)"
                >
                  <i class="fas fa-file-pdf"></i> Report {{ idx + 1 }}
                </button>
              </div>
              <span v-else class="pro-no-report-badge">No Report</span>
            </td>
          </tr>
        </tbody>

        <!-- NO DATA -->
        <tbody v-else>
          <tr>
            <td colspan="6" class="pro-no-data-cell">
              <div class="pro-no-data-wrap">
                <i class="fas fa-clipboard-question"></i>
                <p>No assigned service records found</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

<!-- MATERIAL SUPPLY POPUP -->
<div v-if="showSupplyPopup" class="pro-modal-backdrop-top" @click.self="showSupplyPopup = false">
  <div class="modal-card pro-table-modal pro-modal-wide">

    <!-- MODAL HEADER -->
    <div class="pro-modal-header header-purple">
      <div class="pro-header-left">
        <div class="pro-header-icon icon-purple">
          <i class="fas fa-truck-ramp-box"></i>
        </div>
        <div>
          <div class="pro-header-title-row">
            <h2 class="pro-modal-title">Material Supply Orders</h2>
            <span class="pro-status-pill pill-purple">{{ filteredSupplies.length }} Orders</span>
          </div>
          <span class="pro-company-subchip">
            <i class="fas fa-boxes-packing"></i> Track dispatches, tracking IDs, and delivery terms
          </span>
        </div>
      </div>

      <div class="pro-header-actions">
        <button class="pro-btn-header-action" @click="openDeliveredPopup">
          <i class="fa fa-check-square-o"></i> <span>Material Delivered</span>
        </button>

        <button type="button" class="pro-btn-header-close" @click="showSupplyPopup = false" title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pro-filter-toolbar">
      <div class="pro-search-box">
        <i class="fas fa-search pro-search-icon"></i>
        <input
          type="text"
          v-model="supplyFilters.search"
          placeholder="Search company or PO number..."
          class="pro-search-input"
        />
        <button v-if="supplyFilters.search" class="pro-clear-btn" @click="supplyFilters.search = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="pro-filter-month-box">
        <i class="fas fa-calendar-days pro-month-icon"></i>
        <select v-model="supplyFilters.month" class="pro-month-select">
          <option value="">All Months</option>
          <option
            v-for="(m, index) in months"
            :key="index"
            :value="index + 1"
          >
            {{ m }}
          </option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>

      <div class="pro-filter-month-box">
        <i class="fas fa-truck pro-month-icon"></i>
        <select v-model="supplyFilters.status" class="pro-month-select">
          <option value="">All Status</option>
          <option value="Awaiting Dispatch">Awaiting Dispatch</option>
          <option value="Dispatched">Dispatched</option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>
    </div>

    <!-- TABLE AREA -->
    <div class="pro-table-scroll">
      <table class="pro-styled-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>PO Number</th>
            <th>Quotation No</th>
            <th>Payment Terms</th>
            <th>Delivery Terms</th>
            <th>Due Date</th>
            <th>Dispatched Date</th>
            <th>Tracking ID</th>
            <th>Courier</th>
            <th style="text-align:center;">Status Action</th>
          </tr>
        </thead>

        <tbody v-if="supplies.length">
          <tr 
            v-for="supply in filteredSupplies" 
            :key="supply.id"
            :class="getRowClass(supply)"
            class="pro-table-row"
          >
            <td>
              <div class="pro-company-cell">
                <span class="pro-company-name">{{ supply.company_name }}</span>
              </div>
            </td>
            <td><span class="pro-po-pill">{{ supply.po_number }}</span></td>
            <td><span class="pro-text-sub">{{ supply.quotation_against_po || '-' }}</span></td>
            <td><span class="pro-text-sub">{{ supply.payment_terms || '-' }}</span></td>
            <td><span class="pro-text-sub">{{ supply.delivery_terms || '-' }}</span></td>
            <td>
              <input 
                type="date"
                v-model="supply.delivery_due_date"
                @change="updateDeliveryDate(supply)"
                class="pro-date-input-sm"
              />
            </td>
            <td><span class="pro-text-sub">{{ supply.closed_date ? supply.closed_date: '-'}}</span></td>
            <td><span class="pro-tracking-badge">{{ supply.tracking_id ? supply.tracking_id : '-' }}</span></td>
            <td><span class="pro-text-sub">{{ supply.courier_name ? supply.courier_name : '-' }}</span></td>
            <td style="text-align:center;">
              <select
                :value="supply.material_status || 'Awaiting Dispatch'"
                @change="handleStatusChange(supply, $event.target.value)"
                class="pro-status-select"
                :class="{
                  'st-awaiting': !supply.material_status || supply.material_status === 'Awaiting Dispatch',
                  'st-dispatched': supply.material_status === 'Dispatched',
                  'st-delivered': supply.material_status === 'Delivered'
                }"
              >
                <option value="Awaiting Dispatch" disabled>Awaiting Dispatch</option>
                <option value="Dispatched">Dispatched</option>
                <option v-if="supply.material_status === 'Dispatched'" value="Delivered">Delivered</option>
              </select>
            </td>
          </tr>
        </tbody>

        <!-- NO DATA -->
        <tbody v-else>
          <tr>
            <td colspan="10" class="pro-no-data-cell">
              <div class="pro-no-data-wrap">
                <i class="fas fa-truck-fast"></i>
                <p>No supply orders found matching your search</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

<!-- DELIVERED DATE POPUP -->
<div v-if="showDeliveredDatePopup" class="pro-modal-backdrop-top" @click.self="closeDeliveredPopup">
  <div class="modal-card pro-table-modal" style="max-width: 500px;">
    <div class="pro-modal-header header-emerald">
      <div class="pro-header-left">
        <div class="pro-header-icon icon-emerald">
          <i class="fas fa-calendar-check"></i>
        </div>
        <h3 class="pro-modal-title" style="font-size: 1.15rem;">Material Delivered Date</h3>
      </div>
      <button type="button" class="pro-btn-header-close" @click="closeDeliveredPopup" title="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div style="padding: 1.5rem; background: #ffffff;">
      <div class="pro-field-wrap">
        <label class="pro-label">Select Material Delivered Date <span class="req-star">*</span></label>
        <div class="pro-date-cell-wrap" style="max-width: 100%;">
          <i class="fas fa-calendar-day pro-date-icon"></i>
          <input
            type="date"
            v-model="deliveredDate"
            required
            class="pro-date-input"
          />
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:1.5rem;">
        <button class="pro-btn-footer-cancel" @click="closeDeliveredPopup">
          Cancel
        </button>
        <button class="pro-btn-footer-submit" @click="confirmDelivered">
          <i class="fa fa-save"></i> Save Date
        </button>
      </div>
    </div>
  </div>
</div>

<!-- STATUS POPUP -->
<div v-if="showStatusPopup" class="pro-modal-backdrop-top" @click.self="closePopup">
  <div class="modal-card pro-table-modal" style="max-width: 520px;">
    <div class="pro-modal-header header-purple">
      <div class="pro-header-left">
        <div class="pro-header-icon icon-purple">
          <i class="fas fa-truck-fast"></i>
        </div>
        <h3 class="pro-modal-title" style="font-size: 1.15rem;">Update Supply Status</h3>
      </div>
      <button type="button" class="pro-btn-header-close" @click="closePopup" title="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div style="padding: 1.5rem; background: #ffffff; display: flex; flex-direction: column; gap: 1rem;">
      <div class="pro-field-wrap">
        <label class="pro-label"><i class="fas fa-hashtag"></i> Tracking ID</label>
        <input
          type="text"
          v-model="statusForm.tracking_id"
          class="pro-input"
          placeholder="Enter tracking / consignment ID"
        />
      </div>

      <div class="pro-field-wrap">
        <label class="pro-label"><i class="fas fa-truck"></i> Courier / Transporter Name</label>
        <input
          type="text"
          v-model="statusForm.courier_name"
          class="pro-input"
          placeholder="Enter courier name (e.g. DTDC, Blue Dart, V-Trans)"
        />
      </div>

      <div class="pro-field-wrap">
        <label class="pro-label"><i class="fas fa-calendar-day"></i> Dispatch Date</label>
        <div class="pro-date-cell-wrap" style="max-width: 100%;">
          <i class="fas fa-calendar-day pro-date-icon"></i>
          <input
            type="date"
            v-model="statusForm.date"
            class="pro-date-input"
          />
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:0.75rem;">
        <button class="pro-btn-footer-cancel" @click="closePopup">
          Cancel
        </button>
        <button class="pro-btn-footer-submit" @click="submitStatus">
          <i class="fa fa-save"></i> Submit Status
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Completed Services Modal -->
<div v-if="showCompletedOrders" class="completed-services-modal-overlay">
  <div class="completed-services-modal">
    <div class="modal-header">
      <h3>Assigned Services</h3>
      <button class="close-btn" @click="showCompletedOrders = false">❌</button>
    </div>

    <div class="modal-body">
      <table class="completed-services-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>PO Number</th>
            <th>Assign To</th>
            <th>Type of Service</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in service_assign" :key="order.id">
            <td>{{ order.company_name }}</td>
            <td>{{ order.po_number }}</td>
            <td>{{ order.assign_to }}</td>
            <td>{{ order.type_of_service }}</td>
            <td>{{ order.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ALL QUOTATIONS POPUP (AWESOME & USER-FRIENDLY) -->
<div v-if="showViewAllQuotationPopup" class="modal-backdrop pro-modal-backdrop-top" @click.self="showViewAllQuotationPopup = false">
  <div class="modal-card awesome-quotation-modal">

    <!-- Modal Header -->
    <div class="aq-modal-header">
      <div class="aq-header-left">
        <div class="aq-icon-badge">
          <i class="fas fa-file-invoice-dollar"></i>
        </div>
        <div>
          <div class="aq-title-row">
            <h2 class="aq-modal-title">All Quotations</h2>
            <span class="aq-count-badge" v-if="filteredAllQuotations">
              <i class="fas fa-layer-group"></i> {{ filteredAllQuotations.length }} {{ filteredAllQuotations.length === 1 ? 'Quotation' : 'Quotations' }}
            </span>
          </div>
          <p class="aq-modal-subtitle">Browse, filter, and review all customer quotation records</p>
        </div>
      </div>

      <div class="aq-header-actions">
        <button class="aq-btn-close" @click="showViewAllQuotationPopup = false" title="Close">
          <i class="fas fa-arrow-left"></i> <span>Back</span>
        </button>
      </div>
    </div>

    <!-- Summary & Grand Total Bar -->
    <div class="aq-summary-banner">
      <div class="aq-summary-card inr-card">
        <div class="aq-summary-icon">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="aq-summary-info">
          <span class="aq-summary-label">Grand Total (INR)</span>
          <span class="aq-summary-value">
            ₹ {{ (totalQuotationAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
        </div>
      </div>

      <div class="aq-summary-card usd-card" v-if="currencyTotals?.USD && currencyTotals.USD > 0">
        <div class="aq-summary-icon">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="aq-summary-info">
          <span class="aq-summary-label">Grand Total (USD)</span>
          <span class="aq-summary-value">
            {{ formatCurrency(currencyTotals.USD ?? 0, 'USD') }}
          </span>
        </div>
      </div>

      <div class="aq-gst-toggle-card">
        <span class="aq-gst-label">Tax Calculation:</span>
        <button
          class="aq-gst-btn"
          :class="showGstInclusive ? 'gst-active' : 'gst-inactive'"
          @click="showGstInclusive = !showGstInclusive"
          type="button"
        >
          <i :class="showGstInclusive ? 'fas fa-check-circle' : 'fas fa-minus-circle'"></i>
          {{ showGstInclusive ? 'GST Included' : 'GST Excluded' }}
        </button>
      </div>
    </div>

    <!-- Smart Filters Section -->
    <div class="aq-filters-bar">
      <!-- Search Company -->
      <div class="aq-filter-field search-field">
        <label><i class="fas fa-search"></i> Search Company</label>
        <div class="aq-input-wrap">
          <input
            type="text"
            v-model="searchCompany"
            placeholder="Type company name..."
            class="aq-input"
          />
          <button v-if="searchCompany" class="aq-clear-input" @click="searchCompany = ''" title="Clear">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Filter Status -->
      <div class="aq-filter-field">
        <label><i class="fas fa-tag"></i> Filter Status</label>
        <select v-model="filterStatus" class="aq-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="followup">Follow-up</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <!-- Month & Year -->
      <div class="aq-filter-field date-group-field">
        <label><i class="fas fa-calendar-alt"></i> Period</label>
        <div class="aq-date-inputs">
          <select v-model="filterMonth" class="aq-select month-select">
            <option value="">All Months</option>
            <option v-for="(m, index) in months" :key="index" :value="index + 1">
              {{ m }}
            </option>
          </select>

          <select v-model="filterYear" class="aq-select year-select">
            <option value="">All Years</option>
            <option v-for="y in years" :key="y" :value="y">
              {{ y }}
            </option>
          </select>
        </div>
      </div>

      <!-- Clear Filters Button -->
      <div class="aq-filter-field clear-btn-field" v-if="hasQuotationFilters">
        <label>&nbsp;</label>
        <button class="aq-btn-reset" @click="clearQuotationFilters" title="Clear all active filters">
          <i class="fas fa-undo"></i> Reset
        </button>
      </div>
    </div>

    <!-- Modal Body / Content -->
    <div class="aq-content-body">
      <!-- Loading state -->
      <div v-if="quotationLoading" class="aq-loading-state">
        <div class="aq-spinner"></div>
        <p class="aq-loading-text">Loading quotations...</p>
      </div>

      <!-- Cards Grid -->
      <div v-else-if="filteredAllQuotations && filteredAllQuotations.length > 0" class="aq-grid">
        <div
          v-for="q in filteredAllQuotations"
          :key="q.id"
          class="aq-card"
          @click="openQuotationInNewTab(q)"
        >
          <!-- Card Header -->
          <div class="aq-card-top">
            <div class="aq-quote-id">
              <i class="fas fa-file-invoice"></i>
              <span>{{ quotePrefix }}{{ q.id }}</span>
            </div>

            <!-- Status Badge -->
            <div
              class="aq-status-pill"
              :class="{
                'status-pending': !q.quotation_followup_status || q.quotation_followup_status.toLowerCase() === 'pending',
                'status-followup': q.quotation_followup_status?.toLowerCase() === 'followup',
                'status-approved': q.quotation_followup_status?.toLowerCase() === 'approved',
                'status-rejected': q.quotation_followup_status?.toLowerCase() === 'rejected'
              }"
            >
              <i v-if="q.quotation_followup_status?.toLowerCase() === 'approved'" class="fas fa-check-circle"></i>
              <i v-else-if="q.quotation_followup_status?.toLowerCase() === 'rejected'" class="fas fa-times-circle"></i>
              <i v-else-if="q.quotation_followup_status?.toLowerCase() === 'followup'" class="fas fa-clock"></i>
              <i v-else class="fas fa-hourglass-half"></i>
              <span>{{ q.quotation_followup_status || 'Pending' }}</span>
            </div>
          </div>

          <!-- Card Body -->
          <div class="aq-card-main">
            <h3 class="aq-company-title" :title="q.company_name">
              <i class="fas fa-building"></i>
              <span>{{ q.company_name || 'Unnamed Company' }}</span>
            </h3>

            <!-- Quotation Amount if available -->
            <div class="aq-card-amount-row" v-if="formatQuotationAmount(q)">
              <span class="aq-amount-label">Quotation Value:</span>
              <span class="aq-amount-val">{{ formatQuotationAmount(q) }}</span>
            </div>

            <!-- Meta details -->
            <div class="aq-card-meta">
              <div class="aq-meta-item" v-if="q.engine_serial_number">
                <i class="fas fa-cog"></i>
                <span>Engine: <strong>{{ q.engine_serial_number }}</strong></span>
              </div>
              <div class="aq-meta-item" v-if="q.created_at">
                <i class="far fa-calendar-alt"></i>
                <span>{{ formatDate(q.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="aq-card-foot">
            <span class="aq-view-hint">
              <span>Open Quotation</span>
              <i class="fas fa-external-link-alt"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="aq-empty-state">
        <div class="aq-empty-icon">
          <i class="fas fa-folder-open"></i>
        </div>
        <h3>No Quotations Found</h3>
        <p v-if="hasQuotationFilters">No records matched your search criteria. Try adjusting or resetting your filters.</p>
        <p v-else>There are currently no quotations available.</p>
        <button v-if="hasQuotationFilters" class="aq-btn-empty-reset" @click="clearQuotationFilters">
          <i class="fas fa-undo"></i> Reset Filters
        </button>
      </div>
    </div>

  </div>
</div>

<!-- VIEW SINGLE CUSTOMER QUOTATIONS POPUP -->
<div v-if="showViewQuotationPopup" class="modal-backdrop pro-modal-backdrop-top" @click.self="showViewQuotationPopup = false">
  <div class="modal-card awesome-quotation-modal">

    <!-- Modal Header -->
    <div class="aq-modal-header">
      <div class="aq-header-left">
        <div class="aq-icon-badge">
          <i class="fas fa-file-invoice-dollar"></i>
        </div>
        <div>
          <div class="aq-title-row">
            <h2 class="aq-modal-title">Quotations List</h2>
            <span class="aq-count-badge" v-if="quotationList">
              <i class="fas fa-layer-group"></i> {{ quotationList.length }} {{ quotationList.length === 1 ? 'Quotation' : 'Quotations' }}
            </span>
          </div>
          <p class="aq-modal-subtitle">Filter quotations by company or engine serial number</p>
        </div>
      </div>

      <div class="aq-header-actions">
        <button class="aq-btn-close" @click="showViewQuotationPopup = false" title="Close">
          <i class="fas fa-arrow-left"></i> <span>Back</span>
        </button>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="aq-filters-bar">
      <div class="aq-filter-field search-field">
        <label><i class="fas fa-building"></i> Select Company</label>
        <select v-model="filterCompany" class="aq-select">
          <option value="">All Companies</option>
          <option 
            v-for="cust in customers" 
            :key="cust.id" 
            :value="cust.company_name"
          >
            {{ cust.company_name }}
          </option>
        </select>
      </div>

      <div class="aq-filter-field search-field">
        <label><i class="fas fa-cog"></i> Engine Serial Number</label>
        <div class="aq-input-wrap">
          <input 
            type="text" 
            v-model="engineSearch" 
            @input="searchByEngine"
            placeholder="Enter Engine Serial Number" 
            class="aq-input"
          />
          <button v-if="engineSearch" class="aq-clear-input" @click="engineSearch = ''; searchByEngine();" title="Clear">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="aq-filter-field clear-btn-field" v-if="filterCompany || engineSearch">
        <label>&nbsp;</label>
        <button class="aq-btn-reset" @click="filterCompany = ''; engineSearch = ''; searchByEngine();">
          <i class="fas fa-undo"></i> Reset
        </button>
      </div>
    </div>

    <!-- Modal Body -->
    <div class="aq-content-body">
      <!-- Loading State -->
      <div v-if="quotationLoading" class="aq-loading-state">
        <div class="aq-spinner"></div>
        <p class="aq-loading-text">Loading quotations...</p>
      </div>

      <!-- Quotation Cards -->
      <div v-else-if="quotationList && quotationList.length > 0" class="aq-grid">
        <div 
          v-for="q in quotationList" 
          :key="q.id" 
          class="aq-card"
          @click="openQuotationInNewTab(q)"
        >
          <div class="aq-card-top">
            <div class="aq-quote-id">
              <i class="fas fa-file-invoice"></i>
              <span>{{ quotePrefix }}{{ q.id }}</span>
            </div>
          </div>

          <div class="aq-card-main">
            <h3 class="aq-company-title" v-if="q.company_name">
              <i class="fas fa-building"></i>
              <span>{{ q.company_name }}</span>
            </h3>

            <div class="aq-card-amount-row" v-if="formatQuotationAmount(q)">
              <span class="aq-amount-label">Quotation Value:</span>
              <span class="aq-amount-val">{{ formatQuotationAmount(q) }}</span>
            </div>

            <div class="aq-card-meta">
              <div class="aq-meta-item" v-if="q.engine_serial_number">
                <i class="fas fa-cog"></i>
                <span>Engine: <strong>{{ q.engine_serial_number }}</strong></span>
              </div>
              <div class="aq-meta-item" v-if="q.created_at">
                <i class="far fa-calendar-alt"></i>
                <span>{{ formatDate(q.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Card Actions in Footer -->
          <div class="aq-card-actions-foot">
            <button class="aq-act-btn edit-btn" @click.stop="editQuotation(q)" title="Edit Quotation">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="aq-act-btn dup-btn" @click.stop="duplicateQuotation(q)" title="Duplicate Quotation">
              <i class="fas fa-copy"></i> Duplicate
            </button>
            <button class="aq-act-btn del-btn" @click.stop="deleteQuotation(q.id)" title="Delete Quotation">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="aq-empty-state">
        <div class="aq-empty-icon">
          <i class="fas fa-folder-open"></i>
        </div>
        <h3>No Quotations Found</h3>
        <p v-if="filterCompany || engineSearch">No quotations matched your selected filter.</p>
        <p v-else>No quotations registered for this customer.</p>
      </div>
    </div>

  </div>
</div>


<!-- Open PO Modal -->
<div v-if="showviewPoModal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header"><br>
      <h2 class="modal-title">Open PO</h2>
      <div class="header-buttons">
        <button class="closed-po-btn" @click="showClosedPoModal = true"> View Closed PO</button>
        <button class="btn btn-dark" @click="showviewPoModal = false">⬅ Back</button>
      </div>
    </div>

    <!-- If there are POs -->
    <ul v-if="filteredPoList.length > 0" class="po-list">
      <li v-for="po in filteredPoList" :key="po.id" class="po-item">
        <div class="po-info" @click="openPoDetails(po)">
          {{ po.po_number }} - {{ po.po_type  }}
        </div>
        <div class="po-actions">
          <button class="btn btn-closedpo btn-sm" @click.stop="handleClosePo(po)"><i class="fa fa-check-square-o" style="font-size:13px;"></i> Close PO</button>
          <button class="btn btn-danger" @click.stop="deletePo(po.id)"><i class="fa fa-trash-o" style="font-size:13px"></i> Delete PO</button>
        </div>
      </li>
    </ul>

    <!-- If empty list -->
    <p v-else>No open POs available.</p>
  </div>
</div>


<!-- Supply Close Popup -->
<div v-if="showSupplyCloseModal" class="modal-overlay-supply">
  <div class="modal-content-supply">
    <div class="modal-header-supply">
      <h3 class="modal-title-supply">Close Supply PO</h3>
      <button class="close-btn-supply" @click="showSupplyCloseModal = false">&times;</button>
    </div>

    <div class="modal-body-supply">
      <div class="form-group-supply">
        <label class="label-supply">Tracking ID</label>
        <input type="text" v-model="supplyCloseData.tracking_id" class="input-supply" placeholder="Enter tracking ID" />
      </div>

      <div class="form-group-supply">
        <label class="label-supply">Courier Name</label>
        <input type="text" v-model="supplyCloseData.courier_name" class="input-supply" placeholder="Enter courier name" />
      </div>

      <div class="form-group-supply">
        <label class="label-supply">Date</label>
        <input type="date" v-model="supplyCloseData.date" class="input-supply" />
      </div>
    </div>

    <div class="modal-footer-supply">
      <button class="btn-submit-supply" @click="confirmSupplyClose">Submit</button>
    </div>
  </div>
</div>




<!-- Closed PO Modal -->
<div v-if="showClosedPoModal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header"><br>
      <h2 class="modal-title">Closed PO</h2>
      <div class="header-buttons">
        <button class="btn btn-dark" @click="showClosedPoModal = false">⬅ Back</button>
      </div>
    </div>

    <!-- Closed PO Content -->
    <div class="closed-po-body">
      <ul v-if="filteredClosedPoList.length > 0" class="po-list">


  <li
  v-for="po in filteredClosedPoList"
  :key="po.id"
  class="po-item"
  @click="openPoDetails(po)"
>
  <div class="po-info">
    <strong>{{ po.po_number }}</strong>
    <p style="color:#007bff;margin-left:6px;">
      - {{ po.company_name }}
    </p>
  </div>

  <!-- Re-open button -->
  <button
    class="btn btn-success reopen-btn"
    @click.stop="reopenPo(po.id)"
  >
    🔓 Re-Open PO
  </button>
</li>

</ul>
<p v-else>No closed POs available.</p>
    </div>
  </div>
</div>







<!-- PO Details Modal -->
<div v-if="showPoDetailsModal" class="modal-overlay">
  <div class="modal-contentDetails">
    <h2 class="modal-title">PO Details</h2>

            <table class="po-table" v-if="selectedPo">
      <tbody>
        <tr>
          <th>PO Type</th>
          <td>{{ selectedPo.po_type }}</td>
        </tr>
        <tr>
          <th>Company Name</th>
          <td>{{ selectedPo.company_name }}</td>
        </tr>
        <tr>
          <th>PO Number</th>
          <td>{{ selectedPo.po_number }}</td>
        </tr>
      </tbody>

      <!-- AMC Specific -->
      <tbody v-if="selectedPo.po_type === 'AMC'">
        <tr>
          <th>Type of AMC</th>
          <td>{{ selectedPo.type_of_amc }}</td>
        </tr>
        <tr>
          <th>No of Visits</th>
          <td>{{ selectedPo.no_of_visits }}</td>
        </tr>
        <tr>
          <th>Start Period</th>
          <td>{{ formatDate(selectedPo.start_period) }}</td>
        </tr>
        <tr>
          <th>End Period</th>
          <td>{{ formatDate(selectedPo.end_period) }}</td>
        </tr>
        <tr>
          <th>Value Of PO</th>
          <td>{{ selectedPo.value_of_po }}</td>
        </tr>
        <!-- Visits (only show if not null/empty) -->
        <tr v-for="visit in filledVisits" :key="visit.number">
          <th>Visit {{ visit.number }}</th>
          <td>
            {{ formatDate(visit.date) }}
            <span v-if="getVisitStatus(visit.date) === 'Completed'" style="color:green; margin-left:6px;">✔</span>
            <span v-else-if="getVisitStatus(visit.date) === 'Pending'" style="color:orange; margin-left:6px;">⏳</span>
          </td>
        </tr>
      </tbody>

      <!-- Service+Supply Specific -->
      <tbody v-else-if="selectedPo.po_type === 'Service+Supply'">
        <tr>
          <th>PO Date</th>
          <td>{{ formatDate(selectedPo.date) }}</td>
        </tr>
        <tr>
          <th>Type Of Service</th>
          <td>{{ selectedPo.type_of_service }}</td>
        </tr>
        <tr>
          <th>Value Of PO</th>
          <td>{{ selectedPo.value_of_po }}</td>
        </tr>
        <tr>
          <th>Quotation Against PO</th>
          <td>{{ selectedPo.quotation_against_po }}</td>
        </tr>
        <tr>
          <th>Payment Terms</th>
          <td>{{ selectedPo.payment_terms }}</td>
        </tr>
        <tr>
          <th>Delivery Terms</th>
          <td>{{ selectedPo.delivery_terms }}</td>
        </tr>
        <tr>
          <th>Delivery due date</th>
          <td>{{ formatDate(selectedPo.delivery_due_date) }}</td>
        </tr>
        <tr>
          <th>Recommended By</th>
          <td>{{ selectedPo.recommended_by }}</td>
        </tr>
      </tbody>

      <!-- Service Specific -->
      <tbody v-else-if="selectedPo.po_type === 'Service'">
        <tr>
          <th>Assign To</th>
          <td>{{ selectedPo.assignedUser?.name || '-' }}</td>
        </tr>
        <tr>
          <th>Type of Service</th>
          <td>{{ selectedPo.type_of_service }}</td>
        </tr>
        <tr>
          <th>Value of PO</th>
          <td>{{ selectedPo.value_of_po }}</td>
        </tr>
        <tr>
          <th>Date</th>
          <td>{{ formatDate(selectedPo.date) }}</td>
        </tr>
        <tr>
          <th>Service Date</th>
          <td>
            <input 
              type="date" 
              v-model="selectedPo.service_date"
              @change="updateServiceDate(selectedPo)"
              class="form-control"
            />
          </td>
        </tr>
        <tr v-if="selectedPo.files && selectedPo.files.length">
          <th>PO Files</th>
          <td>
            <button class="btn btn-secondary" @click="viewCustomerPo(cust)">View PO</button>
          </td>
        </tr>
      </tbody>

      <!-- Supply Specific -->
      <tbody v-else-if="selectedPo.po_type === 'Supply'">
        <tr>
          <th>Value of PO</th>
          <td>{{ selectedPo.value_of_po }}</td>
        </tr>
        <tr>
          <th>PO Received Date</th>
          <td>{{ formatDate(selectedPo.date) }}</td>
        </tr>
        <tr>
          <th>Quotation Against PO</th>
          <td>{{ selectedPo.quotation_against_po }}</td>
        </tr>
        <tr>
          <th>Payment Terms</th>
          <td>{{ selectedPo.payment_terms }}</td>
        </tr>
        <tr>
          <th>Delivery Terms</th>
          <td>{{ selectedPo.delivery_terms }}</td>
        </tr>
        <tr>
          <th>Delivery due date</th>
          <td>{{ formatDate(selectedPo.delivery_due_date) }}</td>
        </tr>
        <tr>
          <th>Tracking Id</th>
          <td>{{ selectedPo.tracking_id }}</td>
        </tr>
        <tr>
          <th>Courier Name</th>
          <td>{{ selectedPo.courier_name }}</td>
        </tr>
        <tr>
          <th>Material Deliverd Date</th>
          <td>{{ selectedPo.closed_date }}</td>
        </tr>
      </tbody>
    </table>

   <!-- Buttons -->
<div class="modal-buttons" style="display: flex; flex-direction: row; gap: 10px; margin-top: 20px;">
  <button class="btn btn-secondary" @click="viewCustomerPo(customer)">View PO</button>
<button 
  class="btn btn-primary" 
  v-if="selectedPo && selectedPo.po_type === 'Supply' || selectedPo.po_type === 'Service+Supply'" 
  @click="goToSupplyItems(selectedPo)"
>
  Manage Items
</button>
  <!-- Conditionally show "Add Visit" button if po_type is AMC -->
  <button 
    class="btn btn-primary" 
    v-if="selectedPo && selectedPo.po_type === 'AMC'" 
    @click="addVisit(selectedPo)"
  >
    Add/Update Visit
  </button>

  <button class="btn btn-danger" @click="showPoDetailsModal = false">⬅ Back</button>
</div>



  </div>
</div>
<!-- Extra Visits -->
<tr 
  v-for="extra in selectedPo?.extra_visits || []" 
  :key="'extra-' + extra.id"
>

  <th>Extra Visit</th>
  <td>
    {{ formatDate(extra.visit_date) }}
    <span style="color:red; margin-left:6px;">
      Extra Visit
    </span>
  </td>
</tr>

<!-- Add Visit Modal -->
<div v-if="showAddVisitModal" class="visit-modal-overlay">
  <div class="visit-modal-box">
    <h3 class="visit-modal-title">Add/Update Visit</h3>

    <div class="visit-modal-group">
      <label class="visit-modal-label">Select Visit</label>
      <select v-model="selectedVisit" class="visit-modal-select">
        <option disabled value="">-- Select Visit --</option>
        <option v-for="n in 12" :key="n" :value="'visit' + n">Visit {{ n }}</option>
      </select>
    </div>

    <div class="visit-modal-group" v-if="selectedVisit">
      <label class="visit-modal-label">Select Date</label>
      <input type="date" v-model="visitDate" class="visit-modal-input" />
    </div>

    <div class="visit-modal-actions">
      <button class="visit-btn-success" @click="saveVisit" :disabled="!selectedVisit || !visitDate">
      <i class="fa fa-save" style="font-size:13px"></i>  Save
      </button>
      <button class="visit-btn-close" @click="showAddVisitModal = false">
       <i class="fa fa-close" style="font-size:13px"></i> Close
      </button>
    </div>
  </div>
</div>



<!-- Customer Detail View Modal -->
<div class="modal-backdrop" v-if="showDetailsModal">
  <div class="modal-card">
   <div class="modal-header-custom">
  <h2 class="modal-title">
    Customer Details 

     <i
      class="fas fa-pencil-alt edit-icon"style="color:blue"
      title="Edit Customer"
      @click="editCustomer(selectedCustomer)"
    ></i>
     <i class="fa fa-trash-o edit-icon" style="color:red" title="Delete Customer" 
    @click="deleteCustomer(selectedCustomer.id)"
  >
 </i>

  </h2>
  <br>
</div>


    <table class="details-table">
      <tbody>
        <tr>
          <th>Company Name</th>
          <td>{{ selectedCustomer.company_name }}</td>
        </tr>
        <tr>
          <th>Contact Number</th>
          <td>{{ selectedCustomer.contact_number }}</td>
        </tr>
        <tr>
          <th>Secondary Contact</th>
          <td>{{ selectedCustomer.secondary_contact_number }}</td>
        </tr>
        <tr>
          <th>Contact Person</th>
          <td>{{ selectedCustomer.contact_person }}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>{{ selectedCustomer.email }}</td>
        </tr>
        <tr>
          <th>Vendor Number</th>
          <td>{{ selectedCustomer.vendor_number }}</td>
        </tr>
        <tr>
          <th>Office Policy</th>
          <td>{{ selectedCustomer.office_policy }}</td>
        </tr>
        <tr>
          <th>GST Number</th>
          <td>{{ selectedCustomer.gst_number }}</td>
        </tr>
        <tr>
          <th>PAN Number</th>
          <td>{{ selectedCustomer.pan_number }}</td>
        </tr>
        <tr>
          <th>Billing Address</th>
          <td>{{ selectedCustomer.billing_address }}</td>
        </tr>

        <tr>
          <th>Shipping Address</th>
          <td>{{ selectedCustomer.shipping_address }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="selectedCustomer.equipment_details && Object.keys(selectedCustomer.equipment_details).length" class="equipment-section">
      <h3>Equipment Details</h3>
      <div v-for="(list, type) in selectedCustomer.equipment_details" :key="type" class="equipment-type">
        <h4>{{ type }}</h4>
        <table class="equipment-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Make</th>
              <th>Model No</th>
              <th>Serial No</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(eq, index) in list" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ eq.make || '-' }}</td>
              <td>{{ eq.model_no || '-' }}</td>
              <td>{{ eq.serial_no || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal-buttons">.
  <button
    class="btn btn-primary"
    @click="openPoModal"
  >
  <i class="fa fa-plus" style="font-size:15px"></i>  Add PO
  </button>

 

 

  <button
    class="btn btn-secondary"
    @click="closeDetailsModal"
  >
   <i class="fa fa-close" style="font-size:15px"></i> Close
  </button>
</div>

  </div>
</div>


<!-- Add PO Modal -->
<div class="modal-backdrop" v-if="showPoModal">
  <div class="modal-card small po-modal">
    <div class="modal-header-icon">
      <i class="fas fa-plus-circle"></i>
    </div>
    <h2 class="modal-title">Add Purchase Order</h2>
    <p class="modal-subtitle">Choose the type of purchase order you want to create</p>

    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-list"></i>
          PO Type
        </label>
        <select v-model="poType" @change="handlePoTypeChange" class="po-type-select">
          <option value="">Select Type</option>
          <option value="AMC">AMC (Annual Maintenance Contract)
          </option>
          <option value="Service">Service
          </option>
          <option value="Supply">Supply
          </option>
          <option value="Service+Supply">Service + Supply
          </option>
        </select>
      </div>
    </div>

    <div class="modal-buttons">
      <button class="btn btn-secondary" @click="closePoModal">
        <i class="fa fa-times"></i>
        Close
      </button>
    </div>
  </div>
</div>

<!-- Service + Supply Modal -->
<div class="modal-backdrop" v-if="showServiceSupplyModal">
  <div class="modal-card medium service-supply-modal">
    <div class="modal-header-icon">
      <i class="fas fa-tools"></i>
    </div>
    <h2 class="modal-title">Service + Supply Purchase Order</h2>
    <p class="modal-subtitle">Create a comprehensive purchase order combining service and supply requirements</p>

    <!-- Company Name -->
    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-building"></i>
          Company Name
        </label>
        <div class="readonly-field">{{ selectedCustomer.company_name }}</div>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>
          <i class="fas fa-hashtag"></i>
          PO Number *
        </label>
        <input type="text" v-model="serviceSupply.poNumber" placeholder="Enter PO number" />
      </div>
      <div class="input-group">
        <label>
          <i class="fas fa-calendar"></i>
          PO Receive Date *
        </label>
        <input type="date" v-model="serviceSupply.date" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>
          <i class="fas fa-rupee-sign"></i>
          Value Of PO *
        </label>
        <input type="number" v-model="serviceSupply.totalValue" placeholder="Enter PO value" />
      </div>
      <div class="input-group">
        <label>
          <i class="fas fa-user"></i>
          Recommended By
        </label>
        <select v-model="serviceSupply.recommendedBy">
          <option value="">Select Name</option>
          <option v-for="user in users" :key="user.id" :value="user.name">
            {{ user.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-file-invoice"></i>
          Quotation Against PO
        </label>
        <select v-model="supplyDetails.quotationAgainstPo">
          <option value="">Select Quotation</option>
          <option v-for="q in quotationsByCompany" :key="q.id" :value="`AE/QUOTE/${getFinancialYear()}/${q.id}`">
            AE/QUOTE/{{ getFinancialYear() }}/{{ q.id }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>
          <i class="fas fa-credit-card"></i>
          Payment Terms
        </label>
        <input type="text" v-model="supplyDetails.paymentTerms" placeholder="e.g., 30 days from invoice" />
      </div>
      <div class="input-group">
        <label>
          <i class="fas fa-truck"></i>
          Delivery Terms
        </label>
        <input type="text" v-model="supplyDetails.deliveryTerms" placeholder="e.g., FOB, CIF, EXW" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>
          <i class="fas fa-calendar-check"></i>
          Delivery Due Date
        </label>
        <input type="date" v-model="supplyDetails.deliveryDueDate" />
      </div>
      <div class="input-group">
        <label>
          <i class="fas fa-wrench"></i>
          Type of Service *
        </label>
        <select v-model="serviceSupply.serviceType">
          <option value="">Select Service</option>
          <option value="Breakdown">Breakdown</option>
          <option value="Inspection">Inspection</option>
          <option value="B-Check / Maintenance">B-Check / Maintenance</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-file-upload"></i>
          PO File
        </label>
        <input type="file" @change="handleServiceSupplyFile" />
      </div>
    </div>

    <!-- BUTTONS -->
    <div class="modal-buttons">
      <button
        class="btn btn-success"
        :disabled="isSavingServiceSupply"
        @click="saveServiceSupply"
      >
        <span v-if="isSavingServiceSupply" class="loader"></span>
        <i class="fa fa-save"></i>
        Save
      </button>

      <button class="btn btn-secondary" @click="closeServiceSupplyModal">
        <i class="fa fa-times"></i>
        Cancel
      </button>
    </div>
  </div>
</div>


<!-- Supply Modal -->
<div class="modal-backdrop" v-if="showSupplyModal">
  <div class="modal-card medium supply-modal">
    <div class="modal-header-icon">
      <i class="fas fa-boxes"></i>
    </div>
    <h2 class="modal-title">Supply Purchase Order</h2>
    <p class="modal-subtitle">Create a purchase order for material supply requirements</p>

    <!-- Auto-filled Company Name -->
    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-building"></i>
          Company Name
        </label>
        <div class="readonly-field">{{ selectedCustomer.company_name }}</div>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>
          <i class="fas fa-hashtag"></i>
          PO Number *
        </label>
        <input type="text" v-model="supplyDetails.poNumber" placeholder="Enter PO number" />
      </div>
      <div class="input-group">
        <label>
          <i class="fas fa-calendar"></i>
          PO Date *
        </label>
        <input type="date" v-model="supplyDetails.date" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>
          <i class="fas fa-rupee-sign"></i>
          Value of PO *
        </label>
        <input type="number" v-model="supplyDetails.value" min="0" @keydown="blockNegative" placeholder="Enter PO value" />
      </div>
      <div class="input-group">
        <label>
          <i class="fas fa-user"></i>
          Recommended By
        </label>
        <select v-model="supplyDetails.recommendedBy">
          <option value="">Select Name</option>
          <option v-for="user in users" :key="user.id" :value="user.name">
            {{ user.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-file-invoice"></i>
          Quotation Against PO
        </label>
        <select v-model="supplyDetails.quotationAgainstPo">
          <option value="">Select Quotation</option>
          <option v-for="q in quotationsByCompany" :key="q.id" :value="`AE/QUOTE/${getFinancialYear()}/${q.id}`">
            AE/QUOTE/{{ getFinancialYear() }}/{{ q.id }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>
          <i class="fas fa-credit-card"></i>
          Payment Terms
        </label>
        <input type="text" v-model="supplyDetails.paymentTerms" placeholder="e.g., 30 days from invoice" />
      </div>
      <div class="input-group">
        <label>
          <i class="fas fa-truck"></i>
          Delivery Terms
        </label>
        <input type="text" v-model="supplyDetails.deliveryTerms" placeholder="e.g., FOB, CIF, EXW" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-calendar-check"></i>
          Delivery Due Date
        </label>
        <input type="date" v-model="supplyDetails.deliveryDueDate" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-file-upload"></i>
          PO File
        </label>
        <input type="file" @change="handleSupplyFileUpload" />
      </div>
    </div>

    <div class="modal-buttons">
      <button
        class="btn btn-success"
        :disabled="isSavingSupply"
        @click="saveSupplyDetails"
      >
        <span v-if="isSavingSupply" class="loader"></span>
        <i class="fa fa-save"></i>
        Save
      </button>

      <button class="btn btn-secondary" @click="closeSupplyModal">
        <i class="fa fa-times"></i>
        Cancel
      </button>
    </div>
  </div>
</div>


<!-- Service Details Modal -->
<div class="modal-backdrop" v-if="showServiceModal">
  <div class="modal-card medium service-modal">
    <div class="modal-header-icon">
      <i class="fas fa-wrench"></i>
    </div>
    <h2 class="modal-title">Service Purchase Order</h2>
    <p class="modal-subtitle">Create a purchase order for service requirements</p>

    <!-- Auto-filled Company Name -->
    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-building"></i>
          Company Name
        </label>
        <div class="readonly-field">{{ selectedCustomer.company_name }}</div>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>
          <i class="fas fa-hashtag"></i>
          PO Number *
        </label>
        <input type="text" v-model="serviceDetails.poNumber" placeholder="Enter PO number" />
      </div>
      <div class="input-group">
        <label>
          <i class="fas fa-calendar"></i>
          PO Date *
        </label>
        <input type="date" v-model="serviceDetails.date" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>
          <i class="fas fa-tools"></i>
          Type of Service *
        </label>
        <select v-model="serviceDetails.serviceType">
          <option value="">Select Service</option>
          <option value="Breakdown">Breakdown</option>
          <option value="Inspection">Inspection</option>
          <option value="B-Check / Maintenance">B-Check / Maintenance</option>
        </select>
      </div>
      <div class="input-group">
        <label>
          <i class="fas fa-rupee-sign"></i>
          Value of PO *
        </label>
        <input type="number" v-model="serviceDetails.poValue" min="0" @keydown="blockNegative" placeholder="Enter PO value" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-file-upload"></i>
          PO File
        </label>
        <input
          type="file"
          @change="handlePoFile"
          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
        />
        <small style="color:#666; text-align: left;">
          Allowed: PNG, JPG, JPEG, PDF, DOC, DOCX
        </small>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>
          <i class="fas fa-user"></i>
          Assign to Employee
        </label>
        <select v-model="serviceDetails.assignTo">
          <option value="" disabled>Select User</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="modal-buttons">
      <button
        class="btn btn-success"
        :disabled="isSavingService"
        @click="saveServiceDetails"
      >
        <span v-if="isSavingService" class="loader"></span>
        <i class="fa fa-save"></i>
       Save
      </button>

      <button class="btn btn-secondary" @click="closeServiceModal">
        <i class="fa fa-times"></i>
        Cancel
      </button>
    </div>
  </div>
</div>



<!-- AMC Details Modal -->
<div class="modal-backdrop" v-if="showAmcModal">
  <div class="modal-card medium">
    <h2 class="modal-title">AMC Details</h2>

    <!-- Auto-filled Company Name -->
    <div class="form-row">
      <div class="input-group full-width">
        <label>Company Name</label>
        <p style="text-align-last: left;">{{ selectedCustomer.company_name }}</p>
      </div>
    </div>

    <div class="form-row">
      <!-- PO Number -->
       <div class="input-group">
  <label>PO Number *</label>
  <input 
    type="text" 
    v-model="amcDetails.PONumber" 
    maxlength="250" 
    placeholder="Enter PO Number"
  />
</div>

      <!-- Type of AMC -->
      <div class="input-group">
        <label>Type of AMC *</label>
        <select v-model="amcDetails.type">
          <option value="">Select Type</option>
          <option value="Comprehensive">Comprehensive</option>
          <option value="Non-comprehensive">Non-comprehensive</option>
        </select>
      </div>
    </div>

    <!-- NEW: PO Date & Value of PO -->
    <div class="form-row">
      <div class="input-group">
        <label>PO Date *</label>
        <input type="date" v-model="amcDetails.PODate" />
      </div>

      <div class="input-group">
        <label>Value of PO *</label>
        <input type="number" v-model="amcDetails.value_of_po"  min="0"
    @keydown="blockNegative" placeholder="Enter Amount" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>Start Period *</label>
        <input type="date" v-model="amcDetails.start_period" />
      </div>

      <div class="input-group">
        <label>End Period *</label>
        <input type="date" v-model="amcDetails.end_period" />
      </div>
    </div>

    <!-- No. of Visits -->
    <div class="input-group">
      <label>No. of Visits *</label>
      <input 
        type="number" 
        v-model.number="amcDetails.visits"
    @keydown="blockNegative"
        min="1" 
        @input="generateVisitDates" 
      />
    </div>

    <!-- Dynamic Visit Dates -->
    <div class="form-row" v-if="visitDates.length > 0">
      <div 
        class="input-group full-width" 
        v-for="(visit, index) in visitDates" 
        :key="index"
      >
        <label>Visit {{ index + 1 }}</label>
        <input type="date" v-model="visitDates[index]" />
      </div>
    </div>

    <!-- PO File -->
    <div class="form-row">
      <div class="input-group full-width">
        <label>PO File</label>
        <input type="file" @change="handlePoFileUpload" />
      </div>
    </div>

    <div class="modal-buttons">
      <button 
  class="btn btn-success" style="background-color: #d0d0d0;"
  :disabled="isSavingAmc"
  @click="saveAmcDetails"
>
  <span v-if="isSavingAmc" class="loader"></span>
  <span v-else><i class="fa fa-save" style="font-size:13px"></i> Save</span>
</button>

      <button class="btn btn-secondary" @click="closeAmcModal"><i class="fa fa-close" style="font-size:13px"></i> Cancel</button>
    </div>
  </div>
</div>




<!-- DELIVERED MATERIAL LIST POPUP -->
<div v-if="showDeliveredPopup" class="pro-modal-backdrop-top" @click.self="showDeliveredPopup = false">
  <div class="modal-card pro-table-modal pro-modal-wide">

    <!-- MODAL HEADER -->
    <div class="pro-modal-header header-emerald">
      <div class="pro-header-left">
        <div class="pro-header-icon icon-emerald">
          <i class="fas fa-boxes-packing"></i>
        </div>
        <div>
          <div class="pro-header-title-row">
            <h2 class="pro-modal-title">Delivered Material List</h2>
            <span class="pro-status-pill pill-emerald">{{ filteredDeliveredSupplies.length }} Delivered</span>
          </div>
          <span class="pro-company-subchip">
            <i class="fas fa-circle-check"></i> Historical delivery records and dispatch information
          </span>
        </div>
      </div>

      <div class="pro-header-actions">
        <button type="button" class="pro-btn-header-close" @click="showDeliveredPopup = false" title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pro-filter-toolbar">
      <div class="pro-search-box">
        <i class="fas fa-search pro-search-icon"></i>
        <input
          type="text"
          v-model="deliveredFilters.search"
          placeholder="Search company or PO number..."
          class="pro-search-input"
        />
        <button v-if="deliveredFilters.search" class="pro-clear-btn" @click="deliveredFilters.search = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="pro-filter-month-box">
        <i class="fas fa-calendar-days pro-month-icon"></i>
        <select v-model="deliveredFilters.month" class="pro-month-select">
          <option value="">All Months</option>
          <option
            v-for="(m, index) in months"
            :key="index"
            :value="index + 1"
          >
            {{ m }}
          </option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>
    </div>

    <!-- TABLE AREA -->
    <div class="pro-table-scroll">
      <table class="pro-styled-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>PO Date</th>
            <th>Dispatched Date</th>
            <th>Tracking ID</th>
            <th>Courier Name</th>
            <th>Material Delivered Date</th>
          </tr>
        </thead>

        <tbody v-if="deliveredSupplies.length">
          <tr v-for="supply in filteredDeliveredSupplies" :key="supply.id" class="pro-table-row">
            <td>
              <div class="pro-company-cell">
                <div class="pro-cell-icon bg-emerald"><i class="fas fa-building"></i></div>
                <span class="pro-company-name">{{ supply.company_name }}</span>
              </div>
            </td>
            <td><span class="pro-text-sub">{{ supply.date }}</span></td>
            <td><span class="pro-text-sub">{{ supply.closed_date || '-' }}</span></td>
            <td><span class="pro-tracking-badge">{{ supply.tracking_id || '-' }}</span></td>
            <td><span class="pro-text-sub">{{ supply.courier_name || '-' }}</span></td>
            <td>
              <span class="pro-delivered-badge">
                <i class="fas fa-circle-check"></i>
                {{ supply.material_delivered_date ? supply.material_delivered_date.split('T')[0] : '-' }}
              </span>
            </td>
          </tr>
        </tbody>

        <!-- NO DATA -->
        <tbody v-else>
          <tr>
            <td colspan="6" class="pro-no-data-cell">
              <div class="pro-no-data-wrap">
                <i class="fas fa-boxes-stacked"></i>
                <p>No delivered supplies found</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

</div>
<!-- Customer Registration Modal -->
<div class="crm-modal-overlay" v-if="showCustomerModal">
  <div class="crm-modal-container">


    <div class="crm-modal-header">
          <button
  type="button"
  class="crm-modal-close"
  @click="closeCustomerModal"
  aria-label="Close modal"
>
  ✕
</button>
      <h2>Customer Registration</h2>
    </div>

    <form class="crm-form" @submit.prevent="submitCustomerForm">

      <div class="crm-form-row">
        <div class="crm-input-group">
        <label>
  Company Name <span class="required">*</span>
</label>
          <input 
            type="text" 
            v-model="customer.company_name" 
            @input="customer.company_name = customer.company_name.replace(/[^a-zA-Z0-9\s:.,&]/g, '')"
            required
          >
        </div>

    <div class="crm-input-group">
  <label>Contact Number <span class="required">*</span></label>
  <input 
    type="tel"
    v-model="customer.contact_number"
    @input="customer.contact_number = formatPlusNumber(customer.contact_number)"
    required
    placeholder="+91 1234567890"
    pattern="^\+\d{4,14}$"
    title="Only numbers allowed, with + at the beginning (e.g. +91 1234567890)"
  >
</div>


      </div>

      <div class="crm-form-row">
        <div class="crm-input-group">
          <label>Contact Person Name <span class="required">*</span></label>
          <input 
            type="text" 
            v-model="customer.contact_person" 
            @input="customer.contact_person = customer.contact_person.replace(/[^a-zA-Z\s]/g, '')"
            required
          >
        </div>

      <div class="crm-input-group">
  <label>Secondary Contact Number</label>
  <input 
    type="tel"
    v-model="customer.secondary_contact_number"
    @input="customer.secondary_contact_number = formatPlusNumber(customer.secondary_contact_number)"
    placeholder="+91 1234567890"
    pattern="^\+\d{4,14}$"
    title="Only numbers allowed, with + at the beginning (e.g. +91 1234567890)"
  >
</div>


      </div>

      <div class="crm-form-row">
  <div class="crm-input-group crm-full-width">
    <label>Billing Address <span class="required">*</span></label>
    <textarea
      v-model="customer.billing_address"
      maxlength="500"
      @input="customer.billing_address = customer.billing_address.slice(0, 500)"
      required
      placeholder="Maximum 500 characters"
    ></textarea>
  </div>
</div>

<div class="crm-form-row">
  <div class="crm-input-group crm-full-width">
    <label>Shipping Address <span class="required">*</span></label>
    <textarea
      v-model="customer.shipping_address"
      maxlength="500"
      @input="customer.shipping_address = customer.shipping_address.slice(0, 500)"
      required
      placeholder="Maximum 500 characters"
    ></textarea>
  </div>
</div>


      <div class="crm-form-row">
        <div class="crm-input-group">
          <label>Customer Unique Number</label>
          <input type="text" v-model="customer.customer_number" disabled>
        </div>

<div class="crm-input-group">
  <label>Email ID <span class="required">*</span></label>

  <input
    type="text"
    v-model="customer.email"
    placeholder="example@domain.com"
    @input="validateEmail"
    required
  />

  <span v-if="emailError" class="error-text">
    {{ emailError }}
  </span>
</div>





      </div>

      <div class="crm-form-row">

  <!-- TAX / GST NUMBER -->
  <div class="crm-input-group">
  <label>GST Number</label>
  <input
    type="text"
    v-model="customer.gst_number"
    minlength="8"
    maxlength="15"
    placeholder="Enter Tax Number"
    @input="customer.gst_number = customer.gst_number
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 20)"
    pattern="^[A-Z0-9]{5,20}$"
    title="Tax number must be 5–20 characters (letters and numbers only)"
  >
</div>

<!-- PAN / TAX ID -->
<div class="crm-input-group">
  <label>PAN Number</label>
  <input
    type="text"
    v-model="customer.pan_number"
    minlength="10"
    maxlength="10"
    placeholder="Enter Tax ID"
    @input="customer.pan_number = customer.pan_number
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10)"
    pattern="^[A-Z0-9]{10}$"
    title="Tax ID must be exactly 10 characters (letters and numbers only)"
  >
</div>



</div>


      <div class="crm-form-row">
        <div class="crm-input-group">
          <label>Vendor Number</label>
          <input type="text" v-model="customer.vendor_number">
        </div>
      <div class="crm-input-group">
  <label>Office Policy</label>
  <select v-model="customer.office_policy">
    <option value="">Select Office Policy</option>
    <option value="Green Office Policy">Green Office Policy</option>
    <option value="Paper based office policy">Paper based office policy</option>
  </select>
</div>  
      </div>

      <h2>Equipment Details</h2>

      <div
        v-for="(equipmentList, type) in customer.equipment_details"
        :key="type"
        class="crm-equipment-group"
      >
        <h3>
          {{ type }} Details
          <button type="button" class="crm-add-btn" @click="addEquipment(type)">+</button>
        </h3>

        <div
          v-for="(equipment, index) in equipmentList"
          :key="index"
          class="crm-form-row crm-equipment-entry"
        >
          <div class="crm-input-group">
  <label>Make</label>
  <input
    type="text"
    v-model="equipment.make"
    maxlength="50"
    @input="equipment.make = equipment.make.slice(0, 50)"
    placeholder="Maximum 50 characters"
  >
</div>


         <div class="crm-input-group">
  <label>Model No.</label>
  <input
    type="text"
    v-model="equipment.model_no"
    maxlength="25"
    @input="equipment.model_no = equipment.model_no.slice(0, 25)"
    placeholder="Maximum 25 characters"
  >
</div>


         <div class="crm-input-group">
  <label>Serial No.</label>
  <input
    type="text"
    v-model="equipment.serial_no"
    maxlength="20"
    @input="equipment.serial_no = equipment.serial_no.slice(0, 20)"
    placeholder="Maximum 20 characters"
  >
</div>


          <button
            type="button"
            class="crm-remove-btn"
            @click="removeEquipment(type, index)"
            v-if="equipmentList.length > 1"
          >
            ❌
          </button>
        </div>
      </div>

      <div class="crm-modal-actions">
        <button type="submit" class="btn btn-primary">Click To Submit</button>
        <!-- <button type="button" class="btn btn-secondary" @click="closeCustomerModal">Cancel</button> -->
      </div>

    </form>
  </div>
</div>






    </div>
  </div>
</template>

  <script>
  import axios from 'axios'
  import Sidebar from './components/Sidebar.vue'
  import _ from 'lodash';
  import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
  import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";


  export default {
      components: {
      Sidebar
    },
    data() {
      return {
          hsnList: [],
       // New equipment-related properties
        equipmentInputMode: 'select',
    equipmentTypes: [
      { key: 'engines', label: 'Engine' },
      { key: 'pumps', label: 'Pump' },
      { key: 'controllers', label: 'Controller' },
      { key: 'motors', label: 'Motor' },
      { key: 'jockey_pumps', label: 'Jockey Pump' }
    ],
     manualSerialNumbers: '',
    manualModelNumbers: '',
    manualEquipmentList: [],

    selectedEquipmentTypes: [],
    equipmentList: {
      engines: [],
      pumps: [],
      controllers: [],
      motors: [],
      jockey_pumps: []
    },
     selectedEquipment: {
      engines: [],
      pumps: [],
      controllers: [],
      motors: [],
      jockey_pumps: []
    },
         isDuplicateMode: false,
        duplicateCompanySelection: null,
showDuplicateCompanySelection: false,
duplicateQuotationData: null,
        currentCalculationItem: null,
    currentCalculationItemIndex: null,
        calculations:[
this.newRow()
],
        showCalculationModal:false,
         hsnList: [],
         calc:{
type:"Import",
qty:1,
usd_rate:0,
usd_to_inr:83,
freight:0,
duty:0,
clearance:0,
markup:0,
bank:0
},

percentOptions: Array.from({length:21},(_,i)=> i*5),
        showEmailModal: false,
      selectedEmails: [],
        showDeliveredDatePopup: false,
    deliveredDate: '',
         selectedTerms: 'regular',
        loading: false,
         filterMonth: '',
        filterYear: '',
          searchCompany: '',
          filterStatus: '',
           showGstInclusive: false,
        filledVisits: [],
        visitStatusList: [],
        completedVisitDates: [],
        visit_assign: [],
        showServiceSupplyModal: false,
        serviceSupply: {
  poNumber: "",
  date: "",
  totalValue: "",
  file: null,

  // Supply only
  recommendedBy: "",

  // Service only
  serviceType: "",
},
isSavingServiceSupply: false,
        isSavingAmc: false, // 👈 loader state
         isSavingSupply: false,
         isSavingService:false,
        deliveredFilters: {
      search: '',
      month: ''
    },
    months: [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ],
        supplyFilters: {
      search: '',
      month: '',
        status: ''
    },
    months: [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ],
        assignedServiceFilters: {
      search: '',
      month: '',
      status: ''
    },
    months: [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ],
        serviceFilters: {
      search: '',
      month: ''
    },
    months: [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ],
        completedFilters: {
      search: '',
      month: ''
    },
    months: [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ],filters: {
  search: '',
  month: new Date().getMonth() + 1 
},

    months: [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ],
  
        emailError: '',
         quotationLoading: false ,
         serviceReports: [],
          visitReports: [],
        showWelcomeModal: false,
         showFollowUpPopup: false, 
         reports: [],
         followUpQuotations: [],
      engineSearch: '',
        isLoadingCustomers: true,
         isLoadingReports: false,
        currentCompany: '',
         statusForm: {
      tracking_id: '',
      courier_name: '',
      date: new Date().toISOString().substr(0, 10)
    },
            showStatusPopup: false,
    selectedSupply: null,
    selectedStatus: '',
        selectedVisit: '',
        showAddVisitModal: false,
        visitDate: '',
        quotationList: [],  
         showViewQuotationPopup: false,
         showViewAllQuotationPopup:false,
    filterCompany: "",
    allQuotations: [],      
    quotations: [],
         showQuotation: false,
        showQuoteModal: false,
        showVisitsPopup: false,
    assignedVisits: [],
         showDeliveredPopup: false,
    deliveredSupplies: [],
         showAssignedServicePopup: false,
    assignedServiceList: [],
       showVisitPopup: false,
showServicePopup: false,
showSupplyPopup: false,
     showSupplyMaterialModal: false,
         supplies: [],
        showCompletedOrders: false,
  servicePoList: [],
      selectedPoId: null,
      showviewPoModal: false,
      showSupplyCloseModal: false,
    showClosedPoModal: false,
     closedPoList: [],
    poList: [],
          service_assign: [],
        currentMonth: new Date().toLocaleString('default', { month: 'long' }),
       
        showAssignPoModal: false,
        companies: [],
        employees: [],
      
        poData: {
          po_type: '',
          company_name: '',
          po_number: '',
          files: []
        },
          showPoDetailsModal: false,
        supplyCloseData: {
        tracking_id: '',
        courier_name: '',
        date: new Date().toISOString().split('T')[0] // current date by default
      },
          selectedPo: null, // Store the clicked PO
        showSupplyModal: false,
    selectedCompany: '',
      selectedPoNumber: '',
      supplyDetails: {
        poNumber: '',
        date: '',
        value: '',
        recommendedBy: '',
        quotationAgainstPo: '',
        paymentTerms: '',
        deliveryTerms: '',
        deliveryDueDate: ''
      },
        showServiceModal: false,
        
        
        serviceDetails: {
          poNumber: '',
          serviceType: '',
          poValue: '',
          poCopy: null,
          assignTo: ''
        },
        showAmcModal: false,
      poType: "",
    amcDetails: {
      assigned_employee: '',
    PONumber: '',
    type: '',
    visits: '',
    start_period: '',
    end_period: '',
PODate: "",        
  value_of_po: "",   
    company_name: '',
    po_file: null
  },
  visitDates: [], // NEW for dynamically created visit schedule
      users: [], // This will store all employees from backend

        
          showPoModal: false,
        searchFocused: false,
        searchQuery: '',
          showDetailsModal: false,
  selectedCustomer: {},
          customers: [],
  editingCustomerId: null, // to differentiate edit vs new

        customer: {
        company_name: '',
         billing_address: '',
  shipping_address: '',
        contact_person: '',
        contact_number: '',
        secondary_contact_number: '',
        customer_number: '',
        email: '',
        gst_number: '',
        pan_number: '',
        vendor_number: '',
        office_policy: '',
      equipment_details: {
          Engine: [{ make: '', model_no: '', serial_no: '' }],
          Pump: [{ make: '', model_no: '', serial_no: '' }],
          Controller: [{ make: '', model_no: '', serial_no: '' }],
          Motor: [{ make: '', model_no: '', serial_no: '' }],
          JockeyPump: [{ make: '', model_no: '', serial_no: '' }]
        }
      
    },
    showCustomerModal: false,
      
      

        isMobile: false,
  isSidebarVisible: true,

      form: {
        nature_of_sale: "",
        company_name: "",
          shipping_address: '',
        engine_serial: "",
        model_no: "",
        payment_terms: "100% Advance",
        delivery: 'EX Works, Freight Prepaid',
        description: "",
        hsn_code: "",
        qty: "",
        uom: "",
        rate: "",
        discount: "",
        cgst: "9",
        sgst: "9",
        igst: "18",
        quote_no: "",
        quote_code: "",
        date: "",
         currency: "",
        customer_ref: "",
        recommended_by: "",
        created_by:JSON.parse(localStorage.getItem("user"))?.name || '', // This should ideally come from logged-in user data
        terms_conditions: `1 Parts are ordered as per your specific order. Once delivered the same can not be returned.
2 Quantities mentioned are as per your requirement.
3 All warranties as per manufacturer's warranty terms and conditions.
4 Offer validity : 30 Days from date of quotation.
5 Payment Terms: 100% Advance.
6 DELIVERY: EXW, Freight Extra.
7 Lead Time: Ready Stock.`,
         customer_reference: "",
         recommended_by: "",
        

        bill_to: {
          company: "",
          address: "",
          state: "",
          state_code: "",
          gst: "",
          contact: "",
          phone: "",
        },

        ship_to: {
          company: "",
          address: "",
          state: "",
          state_code: "",
          gst: "",
          contact: "",
          phone: "",
        },

        items: [
          {
            sr: 1,
            description: "",
            hsn: "",
             manual_hsn: '',
            qty: '',
            uom: "",
            rate: '',
            total: 0,
            discount: '',
            taxable: 0,
            cgst_rate: '9',
            cgst_amt: '',
            sgst_rate: '9',
            sgst_amt: '',
            igst_rate: 18,
            igst_amt: '',
            line_total: 0,
          }
        ],

        subtotal: 0,
        tax_total: 0,
        grand_total: 0,
        amount_words:
          "",

        terms: `1. Parts are ordered as per your specific order. Once delivered the same can not be returned.
2. Quantities mentioned are as per your requirement.
3. All warranties as per manufacturer's warranty terms and conditions.
4. Offer validity : 30 Days from date of quotation.
5. Payment Terms: 100% Advance.
6. Delivery: EXW, Freight Extra.
7. Lead Time: Ready Stock.`,
        declaration:
          `I/we certify that our registration certificate under the GST Act is correct.`,
      }
      }
    },
    mounted() {
      let saved = localStorage.getItem("quotation_calculation")

if(saved){
this.calculations = JSON.parse(saved)
}
        this.setRegularTerms();
       console.table(this.filteredVisits.map(v => ({
    id: v.id,
    company: v.company_name,
    date: v.visit_date
  })))
    this.getCurrencies() ;
    this.fetchHsnCodes();
   this.fetchVisitStatuses();
   this.fetchCompletedVisits();
       this.getLoggedInUser();
      const date = new Date();
      this.currentMonth = date.toLocaleString('default', { month: 'long' });
       this.fetchCurrentMonthVisits();
      this.fetchSupplies();
      this.fetchServiceOrders()
    this.fetchEmployees()
     this.fetchVisitOrders();
        this.fetchCompanies();
        this.fetchServicePoList();
      this.fetchUsers();
      this.fetchQuotations();
    this.fetchCustomers(); // fetch on load
      this.checkIfMobile();
  window.addEventListener('resize', this.checkIfMobile);
  const quotationId = localStorage.getItem("selectedQuotationId");
  if (quotationId) {
    this.fetchQuotations(quotationId);
  }

    },
  computed: {
isLocalMode(){
return this.calculations.some(r=>r.type=="Local")
},
baseINR(){
return this.calc.qty * this.calc.usd_to_inr
},

freightValue(){
return this.baseINR * this.calc.freight / 100
},

dutyValue(){
return this.baseINR * this.calc.duty / 100
},

marginValue(){
return this.ddp/90 * 100
},

markupValue(){
return this.marginValue / 90 * 100
},

bankValue(){
return this.markupValue  / 90 * 100
},

ddp(){
return (
this.baseINR +
this.freightValue +
this.dutyValue +
Number(this.calc.clearance)
)
},

sellingRate(){
return (
this.ddp +
this.marginValue +
this.markupValue +
this.bankValue
)
},

     hasSelection() {
      return this.selectedEmails.length > 0;
    },
     years() {
    const years = new Set()

    this.quotations.forEach(q => {
      if (q.created_at) {
        years.add(new Date(q.created_at).getFullYear())
      }
    })

    return Array.from(years).sort((a, b) => b - a)
  },
    currencyTotals() {
  return this.filteredAllQuotations.reduce((totals, q) => {

    // Normalize currency
    const currency = q.currency ? q.currency.toUpperCase() : 'INR';

    // Initialize currency bucket if not exists
    if (!totals[currency]) {
      totals[currency] = 0;
    }

    let items = q.items;

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }

    const quotationTotal = items.reduce((sum, item) => {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const baseAmount = qty * rate;

      if (!this.showGstInclusive) {
        return sum + baseAmount;
      }

      const cgst = baseAmount * (Number(item.cgst_rate) || 0) / 100;
      const sgst = baseAmount * (Number(item.sgst_rate) || 0) / 100;
      const igst = baseAmount * (Number(item.igst_rate) || 0) / 100;

      return sum + baseAmount + cgst + sgst + igst;
    }, 0);

    totals[currency] += quotationTotal;
    return totals;
  }, {});
},

totalQuotationAmount() {
  return this.filteredAllQuotations.reduce((grandTotal, q) => {

    // ✅ Allow only INR or empty/null currency
    if (q.currency && q.currency !== 'INR') {
      return grandTotal;
    }

    let items = q.items;

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }

    const quotationTotal = items.reduce((sum, item) => {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const baseAmount = qty * rate;

      if (!this.showGstInclusive) {
        return sum + baseAmount;
      }

      // GST calculation
      const cgst = baseAmount * (Number(item.cgst_rate) || 0) / 100;
      const sgst = baseAmount * (Number(item.sgst_rate) || 0) / 100;
      const igst = baseAmount * (Number(item.igst_rate) || 0) / 100;

      return sum + baseAmount + cgst + sgst + igst;
    }, 0);

    return grandTotal + quotationTotal;
  }, 0);
},
filteredAllQuotations() {
  let list = this.quotations || [] // always use this.quotations as source

  // 🔍 Company name search
  if (this.searchCompany) {
    const search = this.searchCompany.toLowerCase()
    list = list.filter(q =>
      q.company_name?.toLowerCase().includes(search)
    )
  }

  // ⚙ Engine serial search
  if (this.engineSearch) {
    const engine = this.engineSearch.toLowerCase()
    list = list.filter(q =>
      q.engine_serial_number?.toLowerCase().includes(engine)
    )
  }

  // 📌 Status filter
  if (this.filterStatus) {
    list = list.filter(q => {
      const status = (q.quotation_followup_status || 'pending').toLowerCase()
      return status === this.filterStatus
    })
  }

  // 📅 Month filter (from created_at)
  if (this.filterMonth) {
    list = list.filter(q => {
      if (!q.created_at) return false
      return (
        new Date(q.created_at).getMonth() + 1 === Number(this.filterMonth)
      )
    })
  }

  // 📆 Year filter (from created_at)
  if (this.filterYear) {
    list = list.filter(q => {
      if (!q.created_at) return false
      return (
        new Date(q.created_at).getFullYear() === Number(this.filterYear)
      )
    })
  }

  return list
},



 filteredDeliveredSupplies() {
    let data = [...this.deliveredSupplies];

    // 🔍 Search
    if (this.deliveredFilters.search) {
      const search = this.deliveredFilters.search.toLowerCase();
      data = data.filter(item =>
        (item.company_name || '').toLowerCase().includes(search) ||
        (item.po_number || '').toLowerCase().includes(search)
      );
    }

    // 📅 Month filter
    if (this.deliveredFilters.month) {
      data = data.filter(item => {
        if (!item.date) return false;
        const d = new Date(item.date);
        return (d.getMonth() + 1) === Number(this.deliveredFilters.month);
      });
    }

    // 🔽 FORCE SORT (latest first)
    return data.slice().sort((a, b) => {
      const getTime = (val) => {
        if (!val) return 0;

        // ✅ handle "YYYY-MM-DD" safely
        return new Date(val.replace(' ', 'T')).getTime() || 0;
      };

      const dateA = getTime(a.material_delivered_date || a.closed_date || a.date);
      const dateB = getTime(b.material_delivered_date || b.closed_date || b.date);

      return dateB - dateA;
    });
  }
,
  filteredSupplies() {
  return this.supplies.filter(supply => {

    const matchesSearch =
      !this.supplyFilters.search ||
      supply.company_name?.toLowerCase().includes(this.supplyFilters.search.toLowerCase()) ||
      supply.po_number?.toLowerCase().includes(this.supplyFilters.search.toLowerCase())

    const matchesMonth =
      !this.supplyFilters.month ||
      new Date(supply.delivery_due_date).getMonth() + 1 == this.supplyFilters.month

    const matchesStatus =
      !this.supplyFilters.status ||
      (supply.material_status || 'Awaiting Dispatch') === this.supplyFilters.status

    return matchesSearch && matchesMonth && matchesStatus
  })
},
    filteredAssignedServiceList() {
    return this.assignedServiceList.filter(item => {

      // 🔍 Search (company / PO)
      const search = this.assignedServiceFilters.search.toLowerCase()
      if (search) {
        const company = item.company_name?.toLowerCase() || ''
        const po = item.po_number?.toLowerCase() || ''
        if (!company.includes(search) && !po.includes(search)) {
          return false
        }
      }

      // 📅 Month filter (Visit Date)
      if (this.assignedServiceFilters.month && item.visit_date) {
        const visitMonth =
          new Date(item.visit_date).getMonth() + 1
        if (visitMonth !== this.assignedServiceFilters.month) return false
      }

      // 📌 Status filter
      if (
        this.assignedServiceFilters.status &&
        item.status !== this.assignedServiceFilters.status
      ) {
        return false
      }

      return true
    })
  }
,
    filteredCompletedVisits() {
    return this.completedVisits.filter(row => {

      // 🔍 Search (company / PO)
      const search = this.completedFilters.search.toLowerCase()
      if (search) {
        const company = row.company_name?.toLowerCase() || ''
        const po = row.po_number?.toLowerCase() || ''
        if (!company.includes(search) && !po.includes(search)) {
          return false
        }
      }

      // 📅 Month filter
      if (this.completedFilters.month && row.visit_date) {
        const visitMonth = new Date(row.visit_date).getMonth() + 1
        if (visitMonth !== this.completedFilters.month) return false
      }

      return true
    })
  },
    allReports() {
    return [
      ...this.serviceReports.map(r => ({
        ...r,
        type: "Service"
      })),
      ...this.visitReports.map(r => ({
        ...r,
        type: "Visit"
      }))
    ].sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at) 
    );
  },
financialYear() {
  const y = new Date().getFullYear();
  return `${y}-${String(y + 1).slice(-2)}`;
},
     completedVisits() {
    return this.assignedVisits.filter(v => v.status === 'Completed');
  },
    quotePrefix() {
  const year = new Date().getFullYear();  
  const nextYearShort = (year + 1).toString().slice(-2); 
  return `AE/QUOTE/${year}-${nextYearShort}/`;
},
     filteredClosedPoList() {
    // Filter closed POs for the current company
    return this.closedPoList.filter(
      po => po.company_name === this.selectedCompany
    );
  },
  filteredVisits() {
    return this.visit_assign.filter(visit => {

      // ❌ Hide completed
      if (visit.status === 'Completed') return false

      // 🔍 Search filter
      const search = this.filters.search.toLowerCase()
      if (search) {
        const company = visit.company_name?.toLowerCase() || ''
        const po = visit.po_number?.toLowerCase() || ''
        if (!company.includes(search) && !po.includes(search)) {
          return false
        }
      }

      // 📅 Month filter
    if (this.filters.month !== null && visit.visit_date) {
        const visitMonth = new Date(visit.visit_date).getMonth() + 1
        if (visitMonth !== this.filters.month) return false
      }

      return true
    })
  },
   filteredServicePoList() {
    return this.servicePoList.filter(order => {

      // 🔍 Search filter (company / PO)
      const search = this.serviceFilters.search.toLowerCase()
      if (search) {
        const company = order.company_name?.toLowerCase() || ''
        const po = order.po_number?.toLowerCase() || ''
        if (!company.includes(search) && !po.includes(search)) {
          return false
        }
      }

      // 📅 Month filter (Service Date)
      if (this.serviceFilters.month && order.service_date) {
        const serviceMonth =
          new Date(order.service_date).getMonth() + 1
        if (serviceMonth !== this.serviceFilters.month) return false
      }

      return true
    })
  },
   filteredPoList() {
    // Show only POs that are not closed
    return this.poList.filter(po => !po.status || po.status.toLowerCase() !== 'closed');
  },
    filledVisits() {
      if (!this.selectedPo) return [];

      const isValidDate = (val) => {
        if (!val) return false;
        const s = String(val).trim();
        if (!s || s === "0000-00-00") return false;  // skip empty & placeholder
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return true; // YYYY-MM-DD pattern
        return !isNaN(Date.parse(s)); // fallback parse
      };

      const visits = [];
      for (let i = 1; i <= 12; i++) {
        const key = `visit${i}`;
        if (isValidDate(this.selectedPo[key])) {
          visits.push({
            number: i,
            date: this.selectedPo[key]
          });
        }
      }
      return visits;
    },

   filteredCustomers() {
  let result;

  if (!this.searchQuery) {
    result = this.customers;
  } else {
    const query = this.searchQuery.toLowerCase();
    result = this.customers.filter(cust =>
      (cust.customer_number && cust.customer_number.toLowerCase().includes(query)) ||
      (cust.company_name && cust.company_name.toLowerCase().includes(query))
    );
  }

  // Sort alphabetically by company_name
  return result.sort((a, b) => a.company_name.localeCompare(b.company_name));
},

quotationsByCompany() {
  if (!this.selectedCustomer || !this.selectedCustomer.company_name) {
    return [];
  }
  return this.quotations.filter(q => 
    q.company_name === this.selectedCustomer.company_name
  );
}

  },
watch: {
   calculations: {
    deep: true,
    handler(rows) {
      rows.forEach(row => {
        if (row.type === 'Import' && row.currency && row.currency !== 'USD') {
          row.usd_to_inr = this.getExchangeRate(row.currency)
        }
      })
    }
  },
   showDuplicateCompanySelection(newVal) {
    // If the duplicate modal is closed without selection, clean up
    if (!newVal && this.duplicateQuotationData && !this.showQuotation) {
      // Clean up and reset duplicate mode
      this.isDuplicateMode = false;
      this.duplicateQuotationData = null;
      this.duplicateCompanySelection = null;
    }
  },
  
  showQuotation(newVal) {
    // When quotation form opens, ensure we have all data
    if (newVal && this.isEdit === false && this.duplicateQuotationData) {
      // This ensures the form is properly populated
      this.$nextTick(() => {
        // Force recalculation of item totals if needed
        if (this.form.items && this.form.items.length > 0) {
          this.form.items.forEach(item => {
            this.validateQty(item);
            this.validateDiscount(item);
          });
        }
      });
    }
    
    // Reset duplicate mode when quotation modal is closed
    if (!newVal && this.isDuplicateMode) {
      this.isDuplicateMode = false;
    }
  },

   showEmailModal(val) {
      if (val) {
        this.fetchCustomers();
      }
    },
   showViewAllQuotationPopup(newVal) {
    if (newVal) {
      this.quotationLoading = true;

      fetch("https://employees.archenterprises.co.in/api/api/quotations")
        .then(res => res.json())
        .then(data => this.quotations = data)
        .catch(err => {
          console.error(err);
          this.quotations = [];
        })
        .finally(() => {
          this.quotationLoading = false;
        });
    }
  },
  showVisitPopup(val) {
    if (val) this.loadVisitAssign(); // fetch data when modal opens
  },

  showWelcomeModal(val) {
    if (val) {
      this.fetchServiceReports();
       this.fetchVisitReports();
    }
  },

filterCompany(newCompany) {
  if (!this.showViewQuotationPopup) return;
  if (!this.showViewAllQuotationPopup) return;


  if (newCompany) {
    this.fetchQuotationsById(newCompany);
  }
},
  showCompletedOrders(newVal) {
      if (newVal) {
        this.fetchCompletedServices();
      }
    },
    // Whenever modal is opened, fetch data
    showClosedPoModal(newVal) {
      if (newVal) {
        this.fetchClosedPOs();
      }
    },
  },
  // Watch for currency changes in calculation rows

 methods: {

    formatQuotationAmount(q) {
      if (!q) return '';
      // Try net_total, total, amount, grand_total, or calculate from items
      let val = q.grand_total ?? q.net_total ?? q.total_amount ?? q.total ?? q.amount ?? null;
      
      if (val === null && Array.isArray(q.items) && q.items.length > 0) {
        val = q.items.reduce((sum, item) => {
          const qty = Number(item.qty) || 0;
          const rate = Number(item.rate) || 0;
          const discount = Number(item.discount) || 0;
          const base = (qty * rate) - ((qty * rate * discount) / 100);
          const cgst = (base * (Number(item.cgst_rate) || 0)) / 100;
          const sgst = (base * (Number(item.sgst_rate) || 0)) / 100;
          const igst = (base * (Number(item.igst_rate) || 0)) / 100;
          return sum + base + cgst + sgst + igst;
        }, 0);
      }

      if (val === null || val === undefined || isNaN(Number(val))) {
        return '';
      }

      const currency = q.currency ? q.currency.toUpperCase() : 'INR';
      const num = Number(val);

      if (currency === 'USD') {
        return '$ ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else if (currency === 'EUR') {
        return '€ ' + num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else if (currency === 'GBP') {
        return '£ ' + num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else if (currency === 'AED') {
        return 'AED ' + num.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
async saveManualHsn(item) {
    try {
        if (!item.manual_hsn) {
            if (this.$toast) {
                this.$toast.error('Please enter HSN code first');
            }
            return;
        }

        // Validate HSN format (4-8 digits)
        const hsnStr = String(item.manual_hsn).trim();
        if (!/^[0-9]{4,8}$/.test(hsnStr)) {
            if (this.$toast) {
                this.$toast.error('HSN code must be 4 to 8 digits');
            }
            return;
        }
        
        console.log('Saving HSN:', hsnStr); // Debug log
        
        // Check if HSN already exists
        const checkResponse = await axios.get(`/api/hsn-check/${hsnStr}`);
        console.log('Check response:', checkResponse.data); // Debug log
        
        if (checkResponse.data.exists) {
            if (this.$toast) {
                this.$toast.info('HSN code already exists in database');
            }
            item.hsn = hsnStr;
            const existingHsn = this.hsnList.find(h => h.hsn === hsnStr);
            if (existingHsn) {
                item.manual_hsn_name = existingHsn.item_name;
            }
            item.manual_hsn = '';
            return;
        }
        
        // Save new HSN
        const saveData = {
            hsn: hsnStr,
            item_name: item.manual_hsn_name || `HSN ${hsnStr}`,
            sac: ''
        };
        console.log('Saving data:', saveData); // Debug log
        
        const saveResponse = await axios.post('/api/hsn-save', saveData);
        console.log('Save response:', saveResponse.data); // Debug log
        
        if (saveResponse.data.success) {
            if (this.$toast) {
                this.$toast.success('HSN code saved successfully');
            }
            
            await this.fetchHsnList();
            item.hsn = hsnStr;
            item.manual_hsn = '';
            item.manual_hsn_name = '';
        }
    } catch (error) {
        console.error('Error saving HSN - Full error:', error);
        console.error('Error response:', error.response?.data);
        if (this.$toast) {
            const errorMsg = error.response?.data?.message || 'Failed to save HSN code';
            this.$toast.error(errorMsg);
        }
    }
},
async fetchHsnList() {
        try {
            const response = await axios.get('/api/hsn-list');
            this.hsnList = response.data;
        } catch (error) {
            console.error('Error fetching HSN list:', error);
            // Optional: Show error toast
            if (this.$toast) {
                this.$toast.error('Failed to load HSN codes');
            }
        }
    },
     clearManualHsn(item) {
        item.manual_hsn = '';
        item.manual_hsn_name = '';
    },
  updateManualFields() {
    // Update the form fields when manual inputs change
    this.form.engine_serial = this.manualSerialNumbers;
    this.form.model_no = this.manualModelNumbers;
    
    // Parse and store in manualEquipmentList for display
    const serials = this.manualSerialNumbers.split(',').map(s => s.trim()).filter(s => s);
    const models = this.manualModelNumbers.split(',').map(m => m.trim()).filter(m => m);
    
    this.manualEquipmentList = serials.map((serial, index) => ({
      serial: serial,
      model: models[index] || ''
    }));
  },
addManualRow() {
    // Add empty entries for new equipment
    const currentSerials = this.manualSerialNumbers ? this.manualSerialNumbers.split(',').map(s => s.trim()) : [];
    const currentModels = this.manualModelNumbers ? this.manualModelNumbers.split(',').map(m => m.trim()) : [];
    
    currentSerials.push('');
    currentModels.push('');
    
    this.manualSerialNumbers = currentSerials.join(', ');
    this.manualModelNumbers = currentModels.join(', ');
    this.updateManualFields();
  },
  
  removeManualRow(index) {
    const serials = this.manualSerialNumbers.split(',').map(s => s.trim()).filter(s => s);
    const models = this.manualModelNumbers.split(',').map(m => m.trim()).filter(m => m);
    
    serials.splice(index, 1);
    models.splice(index, 1);
    
    this.manualSerialNumbers = serials.join(', ');
    this.manualModelNumbers = models.join(', ');
    this.updateManualFields();
  },
  
  clearManualFields() {
    this.manualSerialNumbers = '';
    this.manualModelNumbers = '';
    this.manualEquipmentList = [];
    this.form.engine_serial = '';
    this.form.model_no = '';
  },
  
  getEquipmentLabel(type) {
    const labels = {
      engines: 'Engine',
      pumps: 'Pump',
      controllers: 'Controller',
      motors: 'Motor',
      jockey_pumps: 'Jockey Pump'
    };
    return labels[type] || type;
  },
  
  async fetchEquipmentByType(equipmentType) {
    if (!this.form.company_name) {
      toastWarning("Please select a company first");
      const index = this.selectedEquipmentTypes.indexOf(equipmentType);
      if (index > -1) {
        this.selectedEquipmentTypes.splice(index, 1);
      }
      return;
    }
    
    const customer = this.customers.find(c => c.company_name === this.form.company_name);
    if (!customer) {
      toastWarning("Customer not found");
      return;
    }
    
    try {
      const response = await axios.get(`/api/customers/${customer.id}/equipment/${equipmentType}`);
      this.equipmentList[equipmentType] = response.data;
      
      if (!this.selectedEquipmentTypes.includes(equipmentType)) {
        this.selectedEquipment[equipmentType] = [];
      }
    } catch (error) {
      console.error(`Error fetching ${equipmentType}:`, error);
      this.equipmentList[equipmentType] = [];
      toastError(`Failed to load data`);
    }
  },
  
  onEquipmentSelect(equipmentType) {
    this.updateEquipmentSerialAndModel();
  },
  
  removeSelectedEquipment(equipmentType, index) {
    this.selectedEquipment[equipmentType].splice(index, 1);
    this.updateEquipmentSerialAndModel();
  },
  
  updateEquipmentSerialAndModel() {
    if (this.equipmentInputMode !== 'select') return;
    
    const serialNumbers = [];
    const modelNumbers = [];
    
    for (const equipType of this.selectedEquipmentTypes) {
      const selected = this.selectedEquipment[equipType] || [];
      for (const equip of selected) {
        if (equip.controller || equip.serial_no) {
          serialNumbers.push(equip.controller || equip.serial_no);
        }
        if (equip.model || equip.model_no) {
          modelNumbers.push(equip.model || equip.model_no);
        }
      }
    }
    
    this.form.engine_serial = serialNumbers.join(', ');
    this.form.model_no = modelNumbers.join(', ');
    
    if (serialNumbers.length > 0) {
      toastSuccess(`${serialNumbers.length} equipment(s) selected`);
    }
  },

  onInputModeChange() {
    if (this.equipmentInputMode === 'select') {
      // Switching to select mode - populate from existing data if any
      if (this.form.engine_serial && this.form.company_name) {
        this.loadExistingEquipmentSelections(this.form.engine_serial);
      }
    } else {
      // Switching to manual mode - populate textareas with current values
      this.manualSerialNumbers = this.form.engine_serial || '';
      this.manualModelNumbers = this.form.model_no || '';
    }
  },

 getEquipmentLabel(type) {
    const labels = {
      engines: 'Engine',
      pumps: 'Pump',
      controllers: 'Controller',
      motors: 'Motor',
      jockey_pumps: 'Jockey Pump'
    };
    return labels[type] || type;
  },

  
 async fetchEquipmentByType(equipmentType) {
    if (!this.form.company_name) {
      toastWarning("Please select a company first");
      const index = this.selectedEquipmentTypes.indexOf(equipmentType);
      if (index > -1) {
        this.selectedEquipmentTypes.splice(index, 1);
      }
      return;
    }
     const customer = this.customers.find(c => c.company_name === this.form.company_name);
    if (!customer) {
      toastWarning("Customer not found");
      return;
    }
    
    try {
      const response = await axios.get(`/api/customers/${customer.id}/equipment/${equipmentType}`);
      this.equipmentList[equipmentType] = response.data;
      
      if (!this.selectedEquipmentTypes.includes(equipmentType)) {
        this.selectedEquipment[equipmentType] = [];
      }
    } catch (error) {
      console.error(`Error fetching ${equipmentType}:`, error);
      this.equipmentList[equipmentType] = [];
      toastError(`Failed to load data`);
    }
  },
  
 onEquipmentSelect(equipmentType) {
    this.updateEquipmentSerialAndModel();
  },
   // Better API with actual rates
async getCurrencies() {
  try {
    // Using exchangerate-api.com (free tier)
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    )
    
    this.currencies = Object.keys(response.data.rates)
    this.exchangeRates = response.data.rates
    
    // Update all calculation rows with current rate
    this.calculations.forEach(row => {
      if (row.currency && row.currency !== 'USD') {
        row.usd_to_inr = this.exchangeRates.INR / this.exchangeRates[row.currency]
      }
    })
    
  } catch (error) {
    console.error("Currency API Error:", error)
    // Fallback
    this.currencies = ['USD', 'EUR', 'GBP', 'INR', 'AED']
    this.exchangeRates = { USD: 1, INR: 83, EUR: 0.92, GBP: 0.79, AED: 3.67 }
  }
},

 removeSelectedEquipment(equipmentType, index) {
    this.selectedEquipment[equipmentType].splice(index, 1);
    this.updateEquipmentSerialAndModel();
  },
  
  updateEquipmentSerialAndModel() {
    const serialNumbers = [];
    const modelNumbers = [];
    
    for (const equipType of this.selectedEquipmentTypes) {
      const selected = this.selectedEquipment[equipType] || [];
      for (const equip of selected) {
        if (equip.controller || equip.serial_no) {
          serialNumbers.push(equip.controller || equip.serial_no);
        }
        if (equip.model || equip.model_no) {
          modelNumbers.push(equip.model || equip.model_no);
        }
      }
    }
    
    this.form.engine_serial = serialNumbers.join(', ');
    this.form.model_no = modelNumbers.join(', ');
    
    if (serialNumbers.length > 0) {
      toastSuccess(`${serialNumbers.length} equipment selected`);
    }
  },


  // Add this method temporarily to debug
async testApiQuotation(id) {
  try {
    const response = await axios.get(`/api/quotations/${id}`);
    console.log("API Response for quotation", id, ":", response.data);
    console.log("Items in API response:", response.data.items);
    if (typeof response.data.items === "string") {
      console.log("Parsed items:", JSON.parse(response.data.items));
    }
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
  }
},
prepareItemsForSubmit() {
  // Ensure all items have the correct structure before submitting
  return this.form.items.map(item => ({
    sr: item.sr,
    description: item.description,
    hsn: item.hsn,
    qty: parseFloat(item.qty) || 0,
    uom: item.uom,
    rate: parseFloat(item.rate) || 0,
    total: parseFloat(item.total) || 0,
    discount: parseFloat(item.discount) || 0,
    taxable: parseFloat(item.taxable) || 0,
    cgst_rate: parseFloat(item.cgst_rate) || 0,
    cgst_amt: parseFloat(item.cgst_amt) || 0,
    sgst_rate: parseFloat(item.sgst_rate) || 0,
    sgst_amt: parseFloat(item.sgst_amt) || 0,
    igst_rate: parseFloat(item.igst_rate) || 0,
    igst_amt: parseFloat(item.igst_amt) || 0,
    line_total: parseFloat(item.line_total) || 0
  }));
},


async duplicateQuotation(quotation) {
  try {
    // Show loading indicator
    this.quotationLoading = true;
    
    // Fetch the COMPLETE quotation data from API
    const response = await axios.get(`/api/quotations/${quotation.id}`);
    const fullQuotation = response.data;
    
    console.log("Full quotation data fetched:", fullQuotation);
    console.log("Items from API:", fullQuotation.items);
    
    // Store the complete quotation data
    this.duplicateQuotationData = JSON.parse(JSON.stringify(fullQuotation));
    
    // Store the company name from the original quotation
    this.duplicateCompanySelection = fullQuotation.company_name;
    
    // Close the View Quotations popup first
    this.showViewQuotationPopup = false;
    this.showViewAllQuotationPopup = false;
    
    // IMPORTANT: Make sure the Quotation modal is closed
    this.showQuotation = false;
    
    // Show the company selection modal
    this.showDuplicateCompanySelection = true;
    
    // Set duplicate mode flag
    this.isDuplicateMode = true;
    
  } catch (error) {
    console.error("Error fetching full quotation:", error);
    toastError("Failed to load quotation data for duplication");
  } finally {
    this.quotationLoading = false;
  }
},
// New method to confirm duplicate with selected company
async confirmDuplicateWithCompany() {
  if (!this.duplicateCompanySelection) {
    toastWarning("⚠ Please select a company");
    return;
  }
  
  console.log("Starting duplicate process...");
  console.log("Original data:", this.duplicateQuotationData);
  
  // Set duplicate mode flag before anything else
  this.isDuplicateMode = true;
  
  // Close the selection modal first
  this.showDuplicateCompanySelection = false;
  
  // Create a deep copy of the original quotation
  const newQuotation = JSON.parse(JSON.stringify(this.duplicateQuotationData));
  
  console.log("New quotation after copy:", newQuotation);
  console.log("Items in newQuotation:", newQuotation.items);
  
  // Remove ID and timestamps
  delete newQuotation.id;
  delete newQuotation.created_at;
  delete newQuotation.updated_at;
  delete newQuotation.quote_no;
  delete newQuotation.quote_code;
  
  // Set the selected company
  newQuotation.company_name = this.duplicateCompanySelection;
  
  // Set date to current date
  newQuotation.date = new Date().toISOString().split('T')[0];
  newQuotation.created_at = null;
  newQuotation.updated_at = null;
  
  // Clear any status/remarks
  newQuotation.quotation_followup_status = 'pending';
  newQuotation.remarks = '';
  
  // Set created_by to current user
  newQuotation.created_by = JSON.parse(localStorage.getItem("user"))?.name || '';
  
  // IMPORTANT: Parse items - they might be a string or already parsed
  let parsedItems = [];
  
  // Check if items exist
  if (newQuotation.items) {
    console.log("Items type:", typeof newQuotation.items);
    console.log("Items value:", newQuotation.items);
    
    if (typeof newQuotation.items === "string") {
      try {
        parsedItems = JSON.parse(newQuotation.items);
        console.log("Parsed items from string:", parsedItems);
      } catch(e) {
        console.error("Error parsing items string:", e);
        parsedItems = [];
      }
    } else if (Array.isArray(newQuotation.items)) {
      // Already an array, just copy it
      parsedItems = JSON.parse(JSON.stringify(newQuotation.items));
      console.log("Copied items array:", parsedItems);
    } else {
      console.warn("Items is neither string nor array:", newQuotation.items);
      parsedItems = [];
    }
  } else {
    console.warn("No items found in quotation data");
  }
  
  // If still no items, try to get from the stored data
  if (parsedItems.length === 0 && this.duplicateQuotationData.items) {
    console.log("Trying to get items from duplicateQuotationData");
    if (typeof this.duplicateQuotationData.items === "string") {
      try {
        parsedItems = JSON.parse(this.duplicateQuotationData.items);
        console.log("Parsed items from duplicateQuotationData:", parsedItems);
      } catch(e) {
        console.error("Error parsing items from duplicateQuotationData:", e);
      }
    } else if (Array.isArray(this.duplicateQuotationData.items)) {
      parsedItems = JSON.parse(JSON.stringify(this.duplicateQuotationData.items));
    }
  }
  
  // Ensure each item has all required fields
 // Ensure each item has all required fields
const processedItems = parsedItems.map((item, index) => ({
  sr: index + 1,
  description: item.description || "",
  hsn: item.hsn || "",
  manual_hsn: item.manual_hsn || '',
  qty: item.qty || '',
  uom: item.uom || "",
  rate: item.rate || '',
  total: item.total || 0,
  discount: item.discount || '',
  taxable: item.taxable || 0,
  cgst_rate: item.cgst_rate || '9',
  cgst_amt: item.cgst_amt || '',
  sgst_rate: item.sgst_rate || '9',
  sgst_amt: item.sgst_amt || '',
  igst_rate: item.igst_rate || 18,
  igst_amt: item.igst_amt || '',
  line_total: item.line_total || 0,
  calculation_data: item.calculation_data || null
}));

// Load the form with ALL duplicated data - items should be an array, not string
this.form = {
  id: null,
  nature_of_sale: newQuotation.nature_of_sale || "",
  currency: newQuotation.currency || "",
  company_name: newQuotation.company_name,
  recommended_by: newQuotation.recommended_by || "",
  customer_reference: newQuotation.customer_reference || "",
  engine_serial: newQuotation.engine_serial || "",
  model_no: newQuotation.model_no || "",
  delivery: newQuotation.delivery || "",
  payment_terms: newQuotation.payment_terms || "",
  terms_conditions: newQuotation.terms_conditions || "",
  created_by: newQuotation.created_by,
  shipping_address: newQuotation.shipping_address || newQuotation.material_shipping_address || "",
  items: processedItems, // ✅ This should be an array, not a string
  
  // Reset totals
  subtotal: 0,
  tax_total: 0,
  grand_total: 0,
  amount_words: "",
  
  bill_to: newQuotation.bill_to ? 
    (typeof newQuotation.bill_to === "string" ? JSON.parse(newQuotation.bill_to) : newQuotation.bill_to) : 
    { company: "", address: "", state: "", state_code: "", gst: "", contact: "", phone: "" },
  
  ship_to: newQuotation.ship_to ? 
    (typeof newQuotation.ship_to === "string" ? JSON.parse(newQuotation.ship_to) : newQuotation.ship_to) : 
    { company: "", address: "", state: "", state_code: "", gst: "", contact: "", phone: "" }
};
  console.log("Final form data:", this.form);
  console.log("Form items count:", this.form.items.length);
  
  // ✅ Fetch complete company details
  await this.fetchCompanyDetailsForDuplicate(this.duplicateCompanySelection);
  
  // Set the selected terms based on the copied terms_conditions
  this.setSelectedTermsFromContent(newQuotation.terms_conditions);
  
  // Force recalculation of item totals
  this.$nextTick(() => {
    if (this.form.items && this.form.items.length > 0) {
      this.form.items.forEach(item => {
        this.validateQty(item);
        this.validateDiscount(item);
      });
    }
  });
  
  // Open the quotation form in create mode
  this.showQuotation = true;
  this.isEdit = false;
  
  console.log("Quotation modal opened, form items count:", this.form.items.length);
  
  // Clear the stored data
  this.duplicateQuotationData = null;
  this.duplicateCompanySelection = null;
  
  // Reset duplicate mode flag after form is shown
  setTimeout(() => {
    this.isDuplicateMode = false;
    console.log("Duplicate mode reset, final form items:", this.form.items);
  }, 500);
  
  toastSuccess("Quotation duplicated. You can now edit and save it as a new quotation.");
},

// New method to fetch complete company details
async fetchCompanyDetailsForDuplicate(companyName) {
  try {
    const customer = this.customers.find(c => c.company_name === companyName);
    if (customer) {
      const res = await axios.get(`/api/customers/${customer.id}`);
      
      // ✅ Only update shipping address if it's empty AND we're not in edit mode
      if (!this.form.shipping_address && !this.isEdit) {
        this.form.shipping_address = res.data.shipping_address ?? res.data.address ?? "";
      }
      
      // Store customer data for reference
      this.selectedCustomer = res.data;
      
      console.log("Company details fetched, shipping address:", this.form.shipping_address);
    }
  } catch (error) {
    console.error("Failed to load company details", error);
    if (!this.form.shipping_address) {
      this.form.shipping_address = "";
    }
  }
},

// New method to set selected terms based on terms_conditions content
setSelectedTermsFromContent(termsConditions) {
  if (!termsConditions) {
    this.selectedTerms = 'regular';
    return;
  }
  
  // Check for AMC specific content
  if (termsConditions.includes("AMC Period") || 
      termsConditions.includes("Maintenance Visits") ||
      termsConditions.includes("Breakdown Visits")) {
    this.selectedTerms = 'amc';
  } 
  // Check for New Engine Sales content
  else if (termsConditions.includes("New Engine Sales") || 
           termsConditions.includes("OEM warranty") ||
           termsConditions.includes("commissioning report")) {
    this.selectedTerms = 'newengine';
  } 
  // Default to Regular
  else {
    this.selectedTerms = 'regular';
  }
},
// Method to fetch shipping address for selected company
async fetchSelectedCompanyShippingAddress(companyName) {
  try {
    const customer = this.customers.find(c => c.company_name === companyName);
    if (customer) {
      const res = await axios.get(`/api/customers/${customer.id}`);
      this.form.shipping_address = res.data.shipping_address ?? res.data.address ?? "";
    }
  } catch (error) {
    console.error("Failed to load shipping address", error);
    this.form.shipping_address = "";
  }
},

// Close the duplicate company selection modal
closeDuplicateCompanySelection() {
  this.showDuplicateCompanySelection = false;
  this.duplicateQuotationData = null;
  this.duplicateCompanySelection = null;
},

  applySellingRateToItem(row, rowIndex) {
    const sellingRate = this.calculateSelling(row);
    
    if (this.currentCalculationItem) {
      this.currentCalculationItem.rate = sellingRate.toFixed(2);
      toastSuccess(`Rate updated to ₹${sellingRate.toFixed(2)}`);
      
      // Optional: Close modal after applying
      // this.showCalculationModal = false;
    } else {
      toastWarning("No item selected");
    }
  },
 openCalculationSheetForItem(item, itemIndex) {
  // Store the current item and its index
  this.currentCalculationItem = item;
  this.currentCalculationItemIndex = itemIndex;
  
  // Populate calculations array from stored data or create new
  if (item.calculation_data) {
    try {
      this.calculations = JSON.parse(item.calculation_data);
    } catch(e) {
      this.calculations = [this.newRow()];
    }
  } else {
    const defaultCalc = this.newRow();
    defaultCalc.qty = item.qty || 1;
    // If you want to pre-fill rate or other values
    if (item.rate) {
      // You might want to reverse-calculate or just leave as is
      defaultCalc.usd_rate = item.rate;
    }
    this.calculations = [defaultCalc];
  }
  
  this.showCalculationModal = true;
},

getRowClass(supply) {

  const today = new Date()
  const dueDate = new Date(supply.delivery_due_date)

  const diffTime = dueDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))


  // Delivered → Blue
  if (supply.material_status === 'Delivered') {
    return 'row-blue'
  }

  // Dispatched → Green
  if (supply.material_status === 'Dispatched') {
    return 'row-green'
  }

  // Due within 3 days → Yellow
  if (
    supply.delivery_due_date &&
    diffDays <= 3 &&
    diffDays >= 0 &&
    supply.material_status !== 'Delivered'
  ) {
    return 'row-yellow'
  }

  // Awaiting Dispatch → Red
  if (!supply.material_status || supply.material_status === 'Awaiting Dispatch') {
    return 'row-red'
  }

  return ''
},
  async updateDeliveryDate(supply) {
  try {

    await axios.post('/api/update-delivery-date', {
      id: supply.id,
      delivery_due_date: supply.delivery_due_date
    });

    this.$toast.success("Delivery date updated successfully");

  } catch (error) {
    console.error(error);
    this.$toast.error("Failed to update delivery date");
  }
},
  exportExcel(){

let data = this.calculations.map(r=>({

Type:r.type,
Qty:r.qty,
USD_Rate:r.usd_rate,
USD_INR:r.usd_to_inr,
Freight:r.freight,
Duty:r.duty,
Clearance:r.clearance,
DDP:this.calculateDDP(r),
Selling:this.calculateSelling(r)

}))

const ws = XLSX.utils.json_to_sheet(data)

const wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb, ws, "Calculation")

const excelBuffer = XLSX.write(wb,{
bookType:'xlsx',
type:'array'
})

const blob = new Blob([excelBuffer],{
type:'application/octet-stream'
})

saveAs(blob,"CalculationSheet.xlsx")

},
async saveCalculation() {
  try {
    const payload = this.calculations.map(row => ({
      ...row,
      ddp: this.calculateDDP(row),
      selling_rate: this.calculateSelling(row)
    }));

    // Calculate total selling rate for all rows
    const totalSellingRate = payload.reduce((sum, row) => {
      return sum + (row.selling_rate * row.qty);
    }, 0);

    await fetch("https://employees.archenterprises.co.in/api/api/save-calculation", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quotation_id: this.quotation_id,
        item_index: this.currentCalculationItemIndex,
        calculations: payload
      })
    });

    // ✅ AUTO-FILL THE RATE FIELD
    if (this.currentCalculationItem && this.currentCalculationItemIndex !== null) {
      // Option 1: Use average selling rate
      const averageSellingRate = totalSellingRate / payload.length;
      this.currentCalculationItem.rate = averageSellingRate.toFixed(2);
      
      // OR Option 2: Use first row's selling rate
      // this.currentCalculationItem.rate = payload[0].selling_rate.toFixed(2);
      
      // Store calculation data in the current item
      this.currentCalculationItem.calculation_data = JSON.stringify(payload);
    }

    toastSuccess("Calculation saved and rate updated successfully ✅");
    this.showCalculationModal = false;
    
  } catch (error) {
    console.error(error);
    toastError("Error Saving Calculation");
  }
},
calculateDDP(row){

if(row.type=="Local"){

return (
Number(row.qty) * Number(row.inr_rate) +
Number(row.clearance)
)

}

let base = Number(row.qty) * Number(row.usd_rate) * Number(row.usd_to_inr)

let freight = base * Number(row.freight) /100

let duty = base * Number(row.duty) /100

return base + freight + duty + Number(row.clearance)

},

calculateSelling(row){

let ddp = this.calculateDDP(row)

let margin = ddp * 0.1

let afterMargin = ddp + margin

let markup = afterMargin * (row.markup / 100)

let afterMarkup = afterMargin + markup

let bank = afterMarkup * (row.bank / 100)

return afterMarkup + bank

},
  newRow(){
return{
type:"Import",
qty:1,
usd_rate:0,
inr_rate:0,
usd_to_inr:83,
  currency: 'USD', 
freight:0,
duty:0,
clearance:0,
markup:0,
bank:0
}
},

addNewRow(){
this.calculations.push(this.newRow())
},

removeNewRow(index){
this.calculations.splice(index,1)
},

openCalculationSheet(){
this.showCalculationModal=true
},

  openCalculationSheet(company){
this.showCalculationModal = true
},
  generateQuotationNumber(q) {
  const year = new Date().getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  const financialYear = `${year}-${nextYear}`;

  return `AE/QUOTE/${financialYear}/${q.id}`;
},
  async fetchHsnCodes() {
    try {
      const res = await axios.get('/api/hsn-codes');
      this.hsnList = res.data;
    } catch (error) {
      console.error(error);
    }
  },
  goToSupplyItems(po) {
  this.$router.push({ 
    name: 'SupplyItems', 
    query: { 
      po_id: po.id,
      quotation_id: po.quotation_against_po
    } 
  });
},
  getFinancialYear() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Jan = 1

    // Financial year starts in April
    return month >= 4
      ? `${year}-${(year + 1).toString().slice(-2)}`
      : `${year - 1}-${year.toString().slice(-2)}`;
  },

  toggleAll(event) {
    if (event.target.checked) {
      this.selectedEmails = this.customers.map(c => c.email);
    } else {
      this.selectedEmails = [];
    }
  },
   copyEmails() {
      const emails = this.selectedEmails.join(", ");
      navigator.clipboard.writeText(emails);
      toastSuccess("Emails copied successfully!");
    },
  calculateItemTotal(item) {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;

    // 1️⃣ Basic Amount
    let amount = qty * rate;

    // 2️⃣ Apply Discount
    if (discount > 0) {
      amount -= (amount * discount) / 100;
    }

    // 3️⃣ Apply GST Based on Nature of Sale
    if (this.form.nature_of_sale === 'Intrastate') {
      const cgst = Number(item.cgst_rate) || 0;
      const sgst = Number(item.sgst_rate) || 0;
      const totalGst = cgst + sgst;
      amount += (amount * totalGst) / 100;
    }

    if (this.form.nature_of_sale === 'Interstate') {
      const igst = Number(item.igst_rate) || 0;
      amount += (amount * igst) / 100;
    }

    // 4️⃣ Export → No GST
    return amount;
  },
  preventInvalidKeys(e) {
    // Prevent minus and scientific notation
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  },

  validateDiscount(item) {
    if (item.discount < 0) {
      item.discount = 0;
    }
    if (item.discount > 100) {
      item.discount = 100;
    }
  },
   preventMinus(e) {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  },

  validateQty(item) {
    if (item.qty < 0) {
      item.qty = 0;
    }
  },
  formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
},

   blockNegative(event) {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  },
  handlePoFile(event) {
  const file = event.target.files[0]
  if (!file) return

  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (!allowedTypes.includes(file.type)) {
    toastSuccess('Invalid file type. Please upload PNG, JPG, JPEG, PDF, DOC, or DOCX.')
    event.target.value = ''
    return
  }

  this.serviceDetails.poFile = file
},

setNewEngineTerms() {
      this.selectedTerms = 'newengine';
      this.form.terms_conditions = `1) Parts are ordered as per your specific order. Once delivered, the same cannot be returned.
2) Quantities mentioned are as per your requirement.
3) All warranties are as per the manufacturer's warranty terms and conditions.
4) Offer validity: 30 days from the date of quotation.
5) Payment Terms: 100% advance.
6) Delivery: EXW, freight extra.
7) Lead Time: 8–10 weeks from the date of advance payment receipt.
8) Loading, unloading, plumbing, and fabrication at site will be in the customer's scope.
9) The customer has to provide a chain pulley/lifting arrangement and two laborers to assist our team.
10) We will carry all the basic tools and tackles with us, but in case of urgency, if any extra tools are required, the customer has to provide support.
11) Any civil, plumbing, fabrication, or electrical activities, if required, will be under the customer's scope.
12) After work completion, we will conduct trial testing of the machine as per OEM guidelines and prepare the final commissioning report.
13) The new engine will have an OEM warranty of 12 months from the date of installation or 18 months from the date of supply, whichever comes earlier.
14) The cost of ancillaries, apart from the above-mentioned scope, if required, will have to be procured separately.

`;
    },

  setRegularTerms() {
      this.selectedTerms = 'regular';
      this.form.terms_conditions = `1) Parts are ordered as per your specific order. Once delivered, the same cannot be returned.
2) Quantities mentioned are as per your requirement.
3) All warranties are as per the manufacturer's warranty terms and conditions.
4) Offer validity: 30 days from the date of quotation.
5) Payment Terms: 100% advance.
6) Delivery: EXW, freight extra.
7) Lead Time: Ready stock.
`;
    },

    setAmcTerms() {
      this.selectedTerms = 'amc';
      this.form.terms_conditions = `1) Payment Terms: Immediate against invoice submission.
2) Inclusions: Service Engineer’s travelling, accommodation, local conveyance, etc., are included in the above offer.
3) AMC Period: The AMC offer is valid for 1 year from April 2026 to March 2027.
4) Scope of Work: Our scope of work will be limited to the Clarke Fire Engine and associated controller.
5) Maintenance Visits: We offer 4 service visits per engine per year. Each visit will be scheduled quarterly, starting from April 2026 to March 2027.
   i) Pre B-Check Service Visit: Out of the 4 service visits, one visit will be a Pre B-Check service. During this service, we will assess the engine health and recommend if any parts need to be replaced.
   ii) One B-Check Service per Engine: One of the service visits will be a B-Check service. B-Check spares will have to be procured separately from us.
   iii) Preventive Maintenance Visit per Engine: The remaining visits will be routine maintenance services as per NFPA 25 guidelines.
6) Breakdown Visits: Two breakdown visits per engine during the contract period, limited to 1 man-day per visit.
7) Extra Service Calls: Rs. 22,000/- per visit for Pune sites.
8) Parts Replacement: Spare parts cost extra.
9) Record Keeping: Maintenance and failure records shall be maintained.
10) Tools: Special tools will be provided by us; general tools to be provided by the customer.
11) Periodic Operation: Equipment must be operated periodically as per O&M guidelines.
12) Trained Operator: The operator must be trained as per OEM guidelines.
13) Site Reporting: 24 hours response time for Pune.
14) Raw Labour: To be provided by the customer.
15) Failure Investigation: Failed parts must be provided for investigation.
16) Submission of Reports: Within 7 days of the service visit.
17) Termination of Contract: 1 month prior written notice by either party.
18) Confidentiality: All technical and commercial information shall be treated as confidential.
19) Offer Validity: 30 days from the date of issue.
20) Payment Terms: (To be specified)
`;
    },
  handleClick() {
      this.loading = true;

      // Simulate 1-second delay for loader
      setTimeout(() => {
        this.updateShippingAddress();
        this.loading = false;
      }, 1000);
    },
  formatCurrency(amount, currency) {
    const currencyMap = {
      INR: { locale: 'en-IN', symbol: '₹' },
      USD: { locale: 'en-US', symbol: '$' },
      EUR: { locale: 'de-DE', symbol: '€' }
    };

    const config = currencyMap[currency] || { locale: 'en-US', symbol: '' };

    return `${config.symbol} ${Number(amount).toLocaleString(config.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },
  updateShippingAddress() {
    if (!this.form.company_name || !this.form.shipping_address) {
      toastWarning("⚠ Please select company and enter shipping address");
      return;
    }

    axios.post("/api/update-shipping-address", {
      company_name: this.form.company_name,
      shipping_address: this.form.shipping_address
    })
    .then(() => {
      this.$toast?.success("Shipping address updated successfully");
    })
    .catch(() => {
      toastError("Failed to update shipping address");
    });
  },
  fetchVisitStatuses() {
    axios.get('/api/visit-status-dates')
      .then(res => {
        this.visitStatusList = res.data;
      });
  },
getVisitStatus(date) {
    const record = this.visitStatusList.find(
      v => v.visit_date === date
    );
    return record ? record.status : null;
  },

  async fetchCompletedVisits() {
    const res = await axios.get('/api/completed-visit-dates');
    this.completedVisitDates = res.data;
  },

  isVisitCompleted(date) {
    return this.completedVisitDates.includes(date);
  },
   formatCompanyName(name) {
    if (!name) return ''

    const exceptions = ['PVT', 'LTD','A2Z','LLC','BNB','LMW','LN','SPC','FZE','YMCC','PVT.','LTD.']  // Words to always keep uppercase

    return name
      .toLowerCase()
      .split(' ')
      .map(word => {
        const upperWord = word.toUpperCase()
        if (exceptions.includes(upperWord)) return upperWord
        return word.length === 1
          ? upperWord
          : word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(' ')
  },
  loadVisitAssign() {
    axios.get('/api/visit-assign-for-vue')
      .then(res => {
        this.visit_assign = res.data; // use visit_assign table data
      })
      .catch(err => console.error(err));
  },

updateAmcVisitDate(visit) {
    axios.post('/api/update-amc-visit-date', {
      company_name: visit.company_name,
      visit_date: visit.visit_date
    }).then(res => {
      console.log(res.data.message);
    });
  },
   updateVisitDate(date, order) {
    order.service_date = date

    axios.post('/api/service-assign/update-visit-date', {
      company_name: order.company_name,
      visit_date: date
    })
    .then(() => {
      this.$toast?.success('Visit date updated')
    })
    .catch(() => {
      this.$toast?.error('Failed to update visit date')
    })
  },
     handleServiceSupplyFile(e) {
      this.serviceSupply.file = e.target.files[0];
    },
  onAssignChange(order) {
    // ⛔ Ignore empty / initial changes
    if (!order.assign_to) return;

    // 🔁 Call actual assign method
    this.assignServiceEmployee(order);
  },
  getUserName(userId) {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  },
  clearDeliveredFilters() {
    this.deliveredFilters = {
      search: '',
      month: ''
    }
  },
  clearSupplyFilters() {
    this.supplyFilters = {
      search: '',
      month: ''
    }
  },
   clearAssignedServiceFilters() {
    this.assignedServiceFilters = {
      search: '',
      month: '',
      status: ''
    }
  },
  clearServiceFilters() {
    this.serviceFilters.search = ''
    this.serviceFilters.month = ''
  }
,
  clearCompletedFilters() {
    this.completedFilters.search = ''
    this.completedFilters.month = ''
  },
  learFilters() {
    this.filters.search = ''
    this.filters.month = ''
  },
async handleStatusChange(supply, status) {
  // 🔔 Open popup for Dispatched (keep as-is)
  if (status === 'Dispatched') {
    this.openStatusPopup(supply, status)
    return
  }

  // 📦 Delivered → open delivered date popup (NO direct DB update)
  if (status === 'Delivered') {
    this.selectedSupply = supply
    this.deliveredDate = ''
    this.showDeliveredDatePopup = true
    return
  }
},
async confirmDelivered() {
  if (!this.deliveredDate) {
    toastError('Please select material delivered date')
    return
  }

  try {
    await axios.post('https://employees.archenterprises.co.in/api/api/material_delivered', {
      id: this.selectedSupply.id,
      material_delivered_date: this.deliveredDate
    })

    toastSuccess('Material marked as Delivered successfully.')

    // Remove from supplies array
    this.supplies = this.supplies.filter(supply => supply.id !== this.selectedSupply.id)

    // Add to deliveredSupplies array with the delivered date
    const deliveredItem = { ...this.selectedSupply, material_delivered_date: this.deliveredDate }
    this.deliveredSupplies.push(deliveredItem)
    
    // Sort by material_delivered_date descending (latest first)
    this.deliveredSupplies.sort((a, b) => {
      const dateA = new Date(a.material_delivered_date || a.updated_at || 0)
      const dateB = new Date(b.material_delivered_date || b.updated_at || 0)
      return dateB - dateA
    })

    this.showDeliveredDatePopup = false
    this.selectedSupply = null

  } catch (error) {
    toastError('Failed to update material status.')
  }
},
 closeDeliveredPopup() {
    this.showDeliveredDatePopup = false
    this.selectedSupply = null
  },


// UPDATE MATERIAL STATUS
  // -----------------------------
  async updateMaterialStatus(supply, status) {
    try {
      await axios.post("/api/update-material-status", {
        id: supply.id,
        material_status: status,
      });

      // Update UI instantly
      supply.material_status = status;

      toastSuccess("Material status updated successfully.");
    } catch (err) {
      console.error(err);
      toastError("Failed to update status");
      throw err;
    }
  },

// REOPEN PO
  // -----------------------------
async reopenPo(poId) {
  if (!confirm("Are you sure you want to re-open this PO?")) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`/api/api/po/reopen/${poId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to reopen PO");

    toastSuccess(data.message);

    // ✅ STEP 1: Get full PO object BEFORE removing
    const reopenedPo = this.closedPoList.find(po => po.id === poId);
    if (!reopenedPo) return;

    // ✅ STEP 2: Remove from closed list
    this.closedPoList = this.closedPoList.filter(po => po.id !== poId);

    // ✅ STEP 3: Add to open PO list with full data
    this.poList.unshift({
      ...reopenedPo,
      status: null,
      material_status: null,
      closed_date: null
    });

    // ✅ STEP 4: Update selected PO if open
    if (this.selectedPo && this.selectedPo.id === poId) {
      this.selectedPo = {
        ...this.selectedPo,
        status: null,
        material_status: null,
        closed_date: null
      };
    }

  } catch (error) {
    console.error(error);
    toastSuccess(error.message || "Failed to reopen PO");
  }
},






validateEmail() {
  const emailPattern =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!this.customer.email) {
    this.emailError = '';
  } else if (!emailPattern.test(this.customer.email)) {
    this.emailError = 'Invalid Email';
  } else {
    this.emailError = '';
  }
},
  formatPlusNumber(value) {
    if (!value) return '';
    // Allow + only at first position, remove all other non-digits
    value = value.replace(/[^+\d]/g, ''); 
    if (value.indexOf('+') > 0) {
      value = value.replace(/\+/g, ''); // remove + if not first
      value = '+' + value;              // prepend + at start
    }
    return value;
  },
  openQuotationInNewTab(quotation) {
  // Store the quotation ID in localStorage so the new tab can fetch it
  localStorage.setItem("selectedQuotationId", quotation.id);

  // Open new tab
  window.open("/quotation", "_blank");  // assuming /quotation route renders the Quotation.vue page
},

  filteredQuotations() {
  if (!this.filterCompany) return this.quotations;
  return this.quotations.filter(q => q.company_name === this.filterCompany);
},

 async fetchQuotations() {
    this.quotationLoading = true;   // Start loader
    try {
      const res = await fetch("https://employees.archenterprises.co.in/api/api/quotations");
      const data = await res.json();
      this.quotations = data;
    } catch (error) {
      console.error(error);
      this.quotations = [];
    } finally {
      this.quotationLoading = false;  // Stop loader
    }
  },

  fetchVisitReports() {
    axios.get('/api/visit-assign-reports', {
      params: { company: this.selectedCompany }
    }).then(res => {
      this.visitReports = res.data;
    });
  },
  fetchServiceReports() {
    axios.get('/api/service-assign-reports', {
      params: { company: this.selectedCompany }
    })
    .then(res => {
      this.serviceReports = res.data;
    });
  },
  openReport(path) {
    const baseUrl = "https://employees.archenterprises.co.in";
    window.open(`${baseUrl}${path}`, "_blank");
  },
openDemoReport(fileName) {
  const companyFolder = this.selectedCompany?.trim().replace(/\s+/g, '_') || 'UnknownCompany';
  const poFolder = this.poData.po_number || 'UnknownPO'; // Use poData.po_number
  const url = `/backend/public/service_reports/${companyFolder}/${fileName}`;
  console.log('Opening URL:', url);
  window.open(url, "_blank");
},




 openWelcomeModal(company, poNumber) {
    this.selectedCompany = company;
    this.poNumber = poNumber;
    this.showWelcomeModal = true;
    this.fetchReports();
  },

  closeWelcomeModal() {
    this.showWelcomeModal = false;
    this.reports = [];
  },
fetchReports() {
    this.isLoadingReports = true;
    axios.get('/api/reports', {
      params: { 
        company: this.selectedCompany,
        po_number: this.poNumber
      }
    })
    .then(res => {
      this.reports = res.data;
    })
    .finally(() => {
      this.isLoadingReports = false;
    });
  },
  getDiscountPercent(items) {
    if (!items) return 0;

    let parsedItems = items;

    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch {
        return 0;
      }
    }

    // Take discount from first item (as-is)
    return parsedItems[0]?.discount ?? 0;
  },
  calculateInitialValue(items) {
    if (!items) return 0;

    let parsedItems = items;

    // If stored as JSON string
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch {
        return 0;
      }
    }

    return parsedItems.reduce((total, item) => {
      return total + (Number(item.qty || 0) * Number(item.rate || 0));
    }, 0);
  },

  updateQuotationStatus(q) {
    axios.post(`https://employees.archenterprises.co.in/api/api/quotations/${q.id}/status`, {
      quotation_followup_status: q.status
    })
    .then(() => {
      console.log("Status updated");
    })
    .catch(err => {
      console.error("Status update failed", err);
    });
  },
  openFollowUpPopup() {
    this.showFollowUpPopup = true;
    this.fetchFollowUpQuotations();
  },

  fetchFollowUpQuotations() {
  const token = localStorage.getItem('token');

  axios.get('https://employees.archenterprises.co.in/api/api/quotations', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    this.followUpQuotations = res.data.map(q => ({
      id: q.id,
      quotation_no: q.quotation_no,
      quote_date: q.created_at,
      company_name: q.company_name,
      engine_serial: q.engine_serial,

      // 🔑 KEEP FULL ITEMS ARRAY
      items: q.items,

      brief_description: q.items?.[0]?.description || '',
      discount: q.items?.[0]?.discount || 0,

      discounted_rate: q.discounted_rate || 0,
      recommended_by: q.recommended_by,
      status: q.status || 'pending',
      remarks: q.remarks || ''
    }));
  });
},

 ServiceformatDate(date) {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  },

 searchByEngine: _.debounce(function() { // use lodash debounce for efficiency
    if (!this.engineSearch) {
      this.fetchQuotations(); // reset if input empty
      return;
    }

    const token = localStorage.getItem('token');
    axios.get(`https://employees.archenterprises.co.in/api/api/quotations/search`, {
      params: { engine_serial: this.engineSearch },
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      this.quotationList = res.data;
    })
    .catch(err => {
      console.error('Search error:', err);
    });
  }, 300),

  async login() {
    try {
      // 🔹 Get CSRF cookie (MANDATORY)
      await fetch("https://employees.archenterprises.co.in/sanctum/csrf-cookie", {
        credentials: "include",
      });

      // 🔹 Login request
      const res = await fetch("https://employees.archenterprises.co.in/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      // 🔹 After successful login, load user
      await this.getLoggedInUser();

    } catch (err) {
      console.error("Login error:", err);
      toastWarning("invalid login credentials");
    }
  },
  async getLoggedInUser() {
    try {
      const res = await fetch("https://employees.archenterprises.co.in/api/api/user", {
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        const user = await res.json();
        this.loggedInUser = user.name;
        this.form.created_by = user.name; // ✅ auto-set
      }
    } catch (e) {
      console.warn("User not logged in, using Admin");
    }
  },
async openQuotationlist(cust) {
    if (this.isDuplicateMode) {
      return;
    }
    
    this.showQuotation = true;
    this.isEdit = false;
    
    this.form.company_name = cust.company_name;
    this.form.customer_id = cust.id;
    
    // Reset to select mode by default
    this.equipmentInputMode = 'select';
    this.resetEquipmentSelections();
    this.clearManualFields();
    
    try {
      const res = await axios.get(`/api/customers/${cust.id}`);
      this.form.shipping_address = res.data.shipping_address ?? res.data.address ?? "";
    } catch (error) {
      console.error("Failed to load shipping address", error);
      this.form.shipping_address = "";
    }
  },


  // -----------------------------
  // SUBMIT STATUS FROM POPUP
  // -----------------------------
  async submitStatus() {
    try {
      await axios.post("/api/close-supply-po", {
        po_id: this.selectedSupply.id,
        status: this.selectedStatus,
        ...this.statusForm,
      });

      // Update UI instantly
      this.selectedSupply.material_status = this.selectedStatus;

      this.closePopup();
      toastSuccess("Status updated successfully");
    } catch (err) {
      console.error(err);
      toastError("Failed to update status");
    }
  },

  closePopup() {
    this.showStatusPopup = false
    this.resetForm()
    this.refreshForm()
  },

  openStatusPopup(supply, status) {
    this.selectedSupply = supply
    this.selectedStatus = status
    this.showStatusPopup = true
  },
  openAddCustomerPopup() {
    this.showAddCustomerPopup = true;

    const startFrom = 66; // starting number
    const next = startFrom + this.customers.length; 

    this.customer.customer_number = 
      "AEC" + next.toString().padStart(3, "0");
  },
  formatNumber(num) {
    return "AEC" + num.toString().padStart(3, "0");
  },
refreshForm() {
  // If we're in duplicate mode, don't reset
  if (this.isDuplicateMode) {
    console.log("In duplicate mode, skipping form reset");
    return;
  }
  
  // Only reset if we're not coming from duplicate and form has items
  const company = this.form.company_name;
  const createdBy = this.form.created_by;

  this.isEdit = false;
  this.selectedTerms = 'regular';

  this.form = {
    id: null,
    company_name: company,
    created_by: createdBy,
    shipping_address: '',
    nature_of_sale: '',
    currency: '',
    recommended_by: '',
    customer_reference: '',
    engine_serial: '',
    model_no: '',
    delivery: '',
    payment_terms: '',
    terms_conditions: '',
    items: [
      {
        sr: 1,
        description: '',
        hsn: '',
        manual_hsn: '',
        qty: '',
        uom: '',
        rate: '',
        total: 0,
        discount: '',
        taxable: 0,
        cgst_rate: '9',
        cgst_amt: '',
        sgst_rate: '9',
        sgst_amt: '',
        igst_rate: 18,
        igst_amt: '',
        line_total: 0,
      }
    ]
  };
},

  resetForm() {
  this.isEdit = false;

  this.form = {
    id: null,
    nature_of_sale: "",
    currency: "",
    company_name: "",
    recommended_by: "",
    customer_reference: "",
    engine_serial: "",
    model_no: "",
    delivery: "",
    payment_terms: "",
    terms_conditions: '',
  };
  this.statusForm = {
      tracking_id: '',
      courier_name: '',
      date: new Date().toISOString().substr(0, 10)
    };
},

async editQuotation(quotation) {
    console.log("Editing quotation:", quotation);
    
    this.isEdit = true;
    this.showQuotation = true;
    this.showViewQuotationPopup = false;
    this.showViewAllQuotationPopup = false;
    
    // Reset to select mode by default
    this.equipmentInputMode = 'select';
    this.resetEquipmentSelections();
    this.clearManualFields();
    
    try {
      const quotationId = quotation.id;
      if (!quotationId) {
        toastError("Invalid quotation ID");
        return;
      }
      
      const res = await axios.get(`/api/quotations/${quotationId}`);
      const fullQuotation = res.data;
      
      console.log("Full quotation data for edit:", fullQuotation);
      
      let items = [];
      if (fullQuotation.items) {
        if (typeof fullQuotation.items === "string") {
          items = JSON.parse(fullQuotation.items);
        } else {
          items = JSON.parse(JSON.stringify(fullQuotation.items));
        }
      }
      
      this.form = {
        id: fullQuotation.id,
        nature_of_sale: fullQuotation.nature_of_sale || "",
        currency: fullQuotation.currency || "",
        company_name: fullQuotation.company_name,
        recommended_by: fullQuotation.recommended_by || "",
        customer_reference: fullQuotation.customer_reference || "",
        engine_serial: fullQuotation.engine_serial || "",
        model_no: fullQuotation.model_no || "",
        delivery: fullQuotation.delivery || "",
        payment_terms: fullQuotation.payment_terms || "",
        terms_conditions: fullQuotation.terms_conditions || "",
        created_by: fullQuotation.created_by || "",
        shipping_address: fullQuotation.shipping_address || fullQuotation.material_shipping_address || "",
        items: items,
        bill_to: fullQuotation.bill_to ? 
          (typeof fullQuotation.bill_to === "string" ? JSON.parse(fullQuotation.bill_to) : fullQuotation.bill_to) : 
          { company: "", address: "", state: "", state_code: "", gst: "", contact: "", phone: "" },
        ship_to: fullQuotation.ship_to ? 
          (typeof fullQuotation.ship_to === "string" ? JSON.parse(fullQuotation.ship_to) : fullQuotation.ship_to) : 
          { company: "", address: "", state: "", state_code: "", gst: "", contact: "", phone: "" }
      };
      
      // Check if the serial numbers match any existing equipment
      if (fullQuotation.engine_serial && this.form.company_name) {
        const serialNumbers = fullQuotation.engine_serial.split(',').map(s => s.trim());
        let hasMatches = false;
        
        // Try to load matching equipment
        for (const equipType of this.equipmentTypes) {
          const customer = this.customers.find(c => c.company_name === this.form.company_name);
          if (customer) {
            try {
              const response = await axios.get(`/api/customers/${customer.id}/equipment/${equipType.key}`);
              const equipmentList = response.data;
              
              const matchedEquipment = equipmentList.filter(equip => 
                serialNumbers.includes(equip.controller || equip.serial_no)
              );
              
              if (matchedEquipment.length > 0) {
                hasMatches = true;
                this.selectedEquipmentTypes.push(equipType.key);
                this.equipmentList[equipType.key] = equipmentList;
                this.selectedEquipment[equipType.key] = matchedEquipment;
              }
            } catch (error) {
              console.error(`Error loading ${equipType.key}:`, error);
            }
          }
        }
        
        // If no matches found, switch to manual mode
        if (!hasMatches && fullQuotation.engine_serial) {
          this.equipmentInputMode = 'manual';
          this.manualSerialNumbers = fullQuotation.engine_serial;
          this.manualModelNumbers = fullQuotation.model_no || '';
          this.updateManualFields();
        }
      }
      
      console.log("Form loaded for edit:", this.form);
      
    } catch (error) {
      console.error("Failed to load quotation data:", error);
      toastError("Failed to load quotation data");
    }
  },
 async loadExistingEquipmentSelections(serialNumbersStr) {
    const serialNumbers = serialNumbersStr.split(',').map(s => s.trim());
    
    const customer = this.customers.find(c => c.company_name === this.form.company_name);
    if (!customer) return;
    
    // For each equipment type, fetch and match serial numbers
    for (const equipType of this.equipmentTypes) {
      try {
        const response = await axios.get(`/api/customers/${customer.id}/equipment/${equipType.key}`);
        const equipmentList = response.data;
        
        const matchedEquipment = equipmentList.filter(equip => 
          serialNumbers.includes(equip.controller || equip.serial_no)
        );
        
        if (matchedEquipment.length > 0) {
          this.selectedEquipmentTypes.push(equipType.key);
          this.equipmentList[equipType.key] = equipmentList;
          this.selectedEquipment[equipType.key] = matchedEquipment;
        }
      } catch (error) {
        console.error(`Error loading ${equipType.key}:`, error);
      }
    }
  },
resetEquipmentSelections() {
    this.selectedEquipmentTypes = [];
    this.selectedEquipment = {
      engines: [],
      pumps: [],
      controllers: [],
      motors: [],
      jockey_pumps: []
    };
    this.equipmentList = {
      engines: [],
      pumps: [],
      controllers: [],
      motors: [],
      jockey_pumps: []
    };
  },


   viewReport(path) {
    if (!path) return;

    // If your path already includes public/storage, just use your base URL
    const baseUrl = "https://employees.archenterprises.co.in";
    
    // Ensure no double slashes
    const url = path.startsWith("/") ? baseUrl + path : `${baseUrl}/${path}`;
    window.open(url, "_blank");
  },
    deleteQuotation(id) {
    if (!confirm("Are you sure you want to delete this quotation?")) {
      return;
    }

    axios.delete(`/api/quotations/${id}`)
      .then(() => {
        toastSuccess("Quotation deleted successfully!");

        // Remove from UI immediately
        this.quotationList = this.quotationList.filter(q => q.id !== id);
      })
      .catch(err => {
        console.error(err);
        toastError("error deleting quotation");
      });
  },
  updateServiceDate(po) {
    axios.put(`/api/update-service-date/${po.id}`, {
      service_date: po.service_date
    })
    .then(() => {
      toastSuccess("Service Date Updated Successfully!");
    })
    .catch(error => {
      console.error("Error updating service date:", error);
    });
  },
    async saveVisit() {
  if (!this.selectedVisit || !this.visitDate) return;

  try {
    // Make an API call to update the visit column in add_po table
    await axios.post('https://employees.archenterprises.co.in/api/api/add-visit', {
      company_name: this.selectedPo.company_name,
      po_id: this.selectedPo.id,
      visit_column: this.selectedVisit, // visit1, visit2, etc.
      visit_date: this.visitDate
    });

    toastSuccess('Visit added successfully!');
    this.showAddVisitModal = false;

    // Optional: update local selectedPo to show immediately
    this.selectedPo[this.selectedVisit] = this.visitDate;

  } catch (error) {
    console.error(error);
    toastSuccess('Failed to add visit.');
  }
},
    addVisit(po) {
    this.selectedPo = po;
    this.selectedVisit = '';
    this.visitDate = '';
    this.showAddVisitModal = true;
  },
addItem() {
  // 1️⃣ Validate Nature of Sale
  if (!this.form.nature_of_sale) {
    toastWarning("⚠ Please select Nature of Sale before adding items.");
    return;
  }

  // 2️⃣ Validate the last item (if exists)
  if (this.form.items.length > 0) {
    const lastItem = this.form.items[this.form.items.length - 1];
    if (
      !lastItem.description ||
      !lastItem.hsn ||
      !lastItem.qty ||
      !lastItem.uom ||
      !lastItem.rate
    ) {
      toastSuccess(
        "⚠ Please fill all required fields (*) in the current item before adding a new one."
      );
      return;
    }
  }

  // 3️⃣ Add new item
  this.form.items.push({
    sr: this.form.items.length + 1,
    description: "",
    hsn: "",
    qty: '',
    uom: "",
    rate: '',
    total: '',
    discount: '',
    taxable: '',
    cgst_rate: '9',
    cgst_amt: '',
    sgst_rate: '9',
    sgst_amt: '',
    igst_rate: 18,
    igst_amt: 0,
    line_total: 0,
  });
},


removeItem(index) {
  this.form.items.splice(index, 1);

  // reassign serial numbers
  this.form.items.forEach((it, i) => it.sr = i + 1);
},

moveItem(index, targetIndex) {
  if (!this.form.items || this.form.items.length < 2) return;
  if (targetIndex < 0 || targetIndex >= this.form.items.length || targetIndex === index) return;

  const items = [...this.form.items];
  const [movedItem] = items.splice(index, 1);
  items.splice(targetIndex, 0, movedItem);
  this.form.items = items;

  this.form.items.forEach((item, idx) => {
    item.sr = idx + 1;
  });
},

moveItemUp(index) {
  if (index > 0) {
    this.moveItem(index, index - 1);
  }
},

moveItemDown(index) {
  if (index < this.form.items.length - 1) {
    this.moveItem(index, index + 1);
  }
},

    openQuotation(id) {
    localStorage.setItem("selectedQuotationId", id); // remember ID
    this.showViewQuotationPopup = false;
    this.showViewAllQuotationPopup = false;


    this.$router.push("/quotation"); // navigate to quotation.vue
  },
fetchQuotationsById(company) {
  this.quotationLoading = true;
  
  if (!company) {
    this.quotationList = this.quotations || [];
    this.quotationLoading = false;
    return;
  }

  // First check if we already have it in this.quotations as immediate data
  const localMatches = (this.quotations || []).filter(q => q.company_name === company);
  if (localMatches.length > 0) {
    this.quotationList = localMatches;
  }

  const companyName = encodeURIComponent(company);
  
  axios.get(`/api/quotations/by-company/${companyName}`)
    .then(res => {
      console.log("Quotations fetched:", res.data);
      if (Array.isArray(res.data) && res.data.length > 0) {
        this.quotationList = res.data;
      } else if (localMatches.length > 0) {
        this.quotationList = localMatches;
      } else {
        this.quotationList = [];
      }
    })
    .catch(err => {
      console.error("Quotation fetch error:", err);
      if (localMatches.length > 0) {
        this.quotationList = localMatches;
      } else {
        this.quotationList = [];
      }
    })
    .finally(() => {
      this.quotationLoading = false;
    });
},

openViewQuotationPopup(companyName) {
  if (!companyName) {
    toastWarning("No company selected");
    return;
  }
  
  console.log("Opening view quotation popup for company:", companyName);
  
  this.currentCompany = companyName;
  this.filterCompany = companyName;
  this.showViewQuotationPopup = true;
  
  // Clear old data and show loader
  this.quotationList = [];
  this.quotationLoading = true;
  
  // Fetch quotations for this company
  this.fetchQuotationsById(companyName);
},


submitQuotation() {
  // 1️⃣ Check Nature of Sale
  if (!this.form.nature_of_sale) {
    toastWarning("⚠ Please select Nature of Sale before saving the quotation.");
    return;
  }

  // 2️⃣ Check if at least one item is added
  if (!this.form.items || this.form.items.length === 0) {
    toastWarning("⚠ Please add at least one item before saving the quotation.");
    return;
  }

  // Process HSN codes
  this.form.items.forEach(item => {
    if (item.hsn === 'manual') {
      if (!item.manual_hsn) {
        toastWarning("⚠ Please enter HSN number");
        throw new Error('HSN missing');
      }
      item.hsn = item.manual_hsn;
    }
  });

  // Validate required fields for each item
  for (let i = 0; i < this.form.items.length; i++) {
    const item = this.form.items[i];
    if (!item.description || !item.hsn || !item.qty || !item.uom || !item.rate) {
      toastWarning("⚠ Please fill all required fields (*)");
      return;
    }
  }

  // ✅ IMPORTANT: Prepare the data correctly
  const submissionData = {
    ...this.form,
    // Don't stringify items if the backend expects an array
    // If your backend expects JSON string, make sure to stringify it correctly
    items: this.form.items, // Send as array, not string
    bill_to: this.form.bill_to,
    ship_to: this.form.ship_to,
    material_shipping_address: this.form.shipping_address
  };

  const selectedCompany = this.form.company_name;
  const url = this.isEdit ? `/api/quotations/${this.form.id}` : `/api/quotations`;
  const method = this.isEdit ? 'put' : 'post';

  axios[method](url, submissionData)
    .then(async (response) => {
      toastSuccess(this.isEdit ? "Quotation Updated Successfully!" : "Quotation Saved Successfully!");

      const savedQuotation = response?.data || null;
      if (savedQuotation) {
        if (this.isEdit) {
          this.quotations = this.quotations.map(q => q.id === savedQuotation.id ? { ...q, ...savedQuotation } : q);
          this.quotationList = this.quotationList.map(q => q.id === savedQuotation.id ? { ...q, ...savedQuotation } : q);
        } else {
          this.quotations = [savedQuotation, ...this.quotations];
          if (this.filterCompany && savedQuotation.company_name === this.filterCompany) {
            this.quotationList = [savedQuotation, ...this.quotationList];
          }
        }
      }

      this.showQuotation = false;
      await this.fetchQuotations();

      if (this.showViewAllQuotationPopup) {
        this.showViewQuotationPopup = false;
      } else {
        this.filterCompany = selectedCompany;
        this.showViewQuotationPopup = true;
        if (selectedCompany) {
          await this.fetchQuotationsById(selectedCompany);
        }
      }

      this.resetForm();
    })
    .catch(err => {
      console.error(err);
      toastError("error saving quotation");
    });
},





   openQuoteModal(cust) {
  this.showQuoteModal = true;
  this.form.bill_to.company = cust.company_name;
  this.form.bill_to.billing_address = cust.billing_address;
  this.form.bill_to.state = cust.state;
  this.form.bill_to.state_code = cust.state_code;
  this.form.bill_to.gst_number = cust.gst_number;
  this.form.bill_to.contact_person = cust.contact_person;
  this.form.bill_to.contact_number = cust.contact_number;

  this.form.ship_to.company = cust.company_name;
  this.form.ship_to.shipping_address = cust.shipping_address;
  this.form.ship_to.state = cust.state;
  this.form.ship_to.state_code = cust.state_code;
  this.form.ship_to.gst_number = cust.gst_number;
  this.form.ship_to.contact_person = cust.contact_person;
  this.form.ship_to.contact_number = cust.contact_number;
    },
    addRow() {
      this.form.items.push({
        sr: this.form.items.length + 1,
        description: "",
        hsn: "",
        qty: 1,
        uom: "",
        rate: 0,
        total: 0,
        discount: 0,
        taxable: 0,
        cgst_rate: 0,
        cgst_amt: 0,
        sgst_rate: 0,
        sgst_amt: 0,
        igst_rate: 0,
        igst_amt: 0,
        line_total: 0,
      });
    },

    removeRow(index) {
      if (this.form.items.length > 1) {
        this.form.items.splice(index, 1);
      }
    },

    saveQuotation() {
      toastSuccess("Quotation saved successfully!");
      // You can add axios POST here
    },
    openAssignedVisits() {
    this.showVisitsPopup = true;

    axios
      .get("https://employees.archenterprises.co.in/api/api/get-assigned-visits")
      .then((res) => {
        this.assignedVisits = res.data;
      })
      .catch((err) => {
        console.error("Error loading assigned visits:", err);
      });
  },
fetchCurrentMonthVisits() {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  axios
    .get('https://employees.archenterprises.co.in/api/api/get-amc-visits', {
      params: { current_month: currentMonth },
    })
    .then((response) => {
      this.visit_assign = response.data;
    })
    .catch((err) => {
      console.error("Error loading AMC visits:", err);
    });
},

    openDeliveredPopup() {
    axios.get('/api/get-delivered-supplies')
      .then(res => {
        // Sort by material_delivered_date descending (latest first)
        this.deliveredSupplies = res.data.sort((a, b) => {
          const dateA = new Date(a.material_delivered_date || a.updated_at || 0)
          const dateB = new Date(b.material_delivered_date || b.updated_at || 0)
          return dateB - dateA
        })
        this.showDeliveredPopup = true;     // show popup
      })
      .catch(err => {
        console.error(err);
      });
  },
    openAssignedServicePopup() {
    this.showAssignedServicePopup = true;
    this.fetchAssignedServices();
  },

  async fetchAssignedServices() {
    try {
      const res = await axios.get('/api/get-assigned-services');
      this.assignedServiceList = res.data;
    } catch (error) {
      console.error("Error fetching assigned services:", error);
    }
  },
openVisitPopup() {
  this.showVisitPopup = true;
  this.fetchVisitOrders();
},

openServicePopup() {
  this.showServicePopup = true;
},

openSupplyPopup() {
  this.showSupplyPopup = true;
},

// CLOSE PO
  // -----------------------------
  async handleClosePo(po) {
    if (po.po_type === "Supply") {
      // Open the Supply PO close modal
      this.selectedPo = po;
      this.showSupplyCloseModal = true;
      this.supplyCloseData = {
        tracking_id: "",
        courier_name: "",
        date: new Date().toISOString().split("T")[0],
      };
      return;
    }

    // Non-Supply PO: confirm & close instantly
    const confirmed = confirm(`Are you sure you want to close this ${po.po_type} PO?`);
    if (!confirmed) return;

    try {
      await axios.post(`/api/close-po/${po.id}`);

      // Update poList reactively
      this.poList = this.poList.map(item =>
        item.id === po.id ? { ...item, status: "Closed" } : item
      );

      if (this.selectedPo && this.selectedPo.id === po.id) {
        this.selectedPo = { ...this.selectedPo, status: "Closed" };
      }

      toastSuccess("PO closed successfully.");
    } catch (error) {
      console.error("Error closing PO:", error);
      toastError("Failed to close PO. Please try again.");
    }
  },


async confirmSupplyClose() {
  const confirmed = confirm("Are you sure you want to CLOSE this Supply PO?");
  if (!confirmed) return;

  const poId = this.selectedPo.id;

  try {
    const res = await axios.post("/api/close-supply-po", {
      po_id: poId,
      tracking_id: this.supplyCloseData.tracking_id,
      courier_name: this.supplyCloseData.courier_name,
      date: this.supplyCloseData.date,
    });

    if (!res.data?.status) {
      toastSuccess(res.data?.message || "Failed to close Supply PO");
      return;
    }

    /* ✅ 1. CLOSE MODAL INSTANTLY */
    this.showSupplyCloseModal = false;

    /* ✅ 2. REMOVE FROM OPEN PO MODAL LIST */
    this.poList = this.poList.filter(po => po.id !== poId);

    /* ✅ 3. REMOVE FROM SERVICE PO LIST (if present) */
    this.servicePoList = this.servicePoList.filter(po => po.id !== poId);

    /* ✅ 4. RESET SELECTED PO */
    if (this.selectedPo && this.selectedPo.id === poId) {
      this.selectedPo = null;
    }

    /* ✅ 5. ADD TO CLOSED PO LIST (optional but recommended) */
    if (this.closedPoList) {
      const closedPo = {
        ...res.data.po,     // if backend returns po
        status: "Closed"
      };
      this.closedPoList.unshift(closedPo);
    }

    toastSuccess("Supply PO closed successfully");

  } catch (error) {
    console.error(error.response || error);
    toastSuccess(error.response?.data?.message || "Failed to close Supply PO");
  }
},






    closePo(poId) {
      // Normal close logic
      axios.post('/api/close-po', { po_id: poId })
        .then(res => this.fetchPoList())
        .catch(err => console.error(err));
    },
    fetchCompletedServices() {
      axios.get('/api/completed-services')
        .then(response => {
          this.service_assign = response.data;
        })
        .catch(error => {
          console.error(error);
        });
    },
   async fetchClosedPOs() {
      try {
        const response = await axios.get('/api/getClosedPOs');
        this.closedPoList = response.data;
        console.log('Closed POs:', this.closedPoList);
      } catch (error) {
        console.error('Error fetching closed POs:', error);
        this.closedPoList = [];
      }
    },
  
     editPo(po) {
    this.selectedPo = { ...po }; // copy data for editing
    this.showviewPoModal = false; // close the list
    this.showServiceModal = true; // open the existing PO details modal
  },
 // DELETE PO
  // -----------------------------
  async deletePo(poId) {
    if (!confirm("Are you sure you want to delete this PO?")) return;

    try {
      await axios.delete(`/api/delete-po/${poId}`);
      
      // Remove from all relevant lists instantly
      this.poList = this.poList.filter(po => po.id !== poId);
      this.servicePoList = this.servicePoList.filter(po => po.id !== poId);
      if (this.selectedPo && this.selectedPo.id === poId) this.selectedPo = null;

      toastSuccess("PO deleted successfully.");
    } catch (error) {
      console.error("Error deleting PO:", error);
      toastError("Failed to delete PO. Please try again.");
    }
  },
updateStatus(id, materialStatus) {
  const supply = this.supplies.find((item) => item.id === id);
  if (!supply) return;

  const payload = {
    company_name: supply.company_name,
    po_number: supply.po_number,
    po_date: supply.po_date || supply.date, 
    material_status: supply.material_status || 'waiting'
  };

  axios
    .post("https://employees.archenterprises.co.in/api/api/supply-records", payload)
    .then((response) => {
      console.log("Inserted/Updated successfully:", response.data);
    })
    .catch((error) => {
      if (error.response) {
        console.error("Error inserting/updating supply record:", error.response.data);
        toastSuccess(`Server error: ${JSON.stringify(error.response.data)}`);
      } else {
        console.error("Request failed:", error);
      }
    });
}
,


async fetchVisitOrders() {
  try {
    const response = await axios.get("https://employees.archenterprises.co.in/api/api/get-visit-orders");
    // Convert assign_to to number
    this.visit_assign = (response.data || []).map(visit => ({
      ...visit,
      assign_to: visit.assign_to ? Number(visit.assign_to) : ''
    }));
    console.log(this.visit_assign);
  } catch (error) {
    console.error("Failed to load Visit Orders", error);
  }
},

assignVisit(visit) {
  // if (!visit.visit_date) {
  //   toastSuccess('Please select visit date first');
  //   return;
  // }

  axios.post('/api/complete-amc', {
    company_name: visit.company_name,
    po_number: visit.po_number,
    visit_date: visit.visit_date,
    assign_to: visit.assign_to,
    status: visit.status ?? 'Pending'
  }).then(res => {
    console.log(res.data.message);
    visit.id = res.data.id; // 🔥 now ID exists
  });
},

    // Fetch data
    async fetchServiceOrders() {
      try {
        const res = await axios.get('/api/service_assign')
        this.service_assign = res.data
      } catch (err) {
        console.error('Error fetching service orders:', err)
      }
    },
    getEmployeeName(empId) {
    const emp = this.employees.find(e => e.id === empId);
    return emp ? emp.name : 'Not Assigned';
  },
  // Fetch employees
    async fetchEmployees() {
      try {
        const res = await axios.get('/api/employees')
        this.employees = res.data
      } catch (err) {
        console.error('Error fetching employees:', err)
      }
    },

    // Assign employee to service
    async assignService(service) {
      try {
        await axios.post('/api/assign-service', {
          id: service.id,
          assign_to: service.assign_to
        })
        toastSuccess('Service assigned successfully!')
      } catch (err) {
        console.error('Error assigning service:', err)
      }
    },
   async fetchCompanies() {
  try {
    const response = await fetch("/api/api/visit_assign");
    const data = await response.json();
    console.log("Fetched companies:", data); // 🔍 check exact structure
    this.companies = data;
  } catch (error) {
    console.error("Error fetching AMC visits:", error);
  }
},

 async assignServiceEmployee(order) {
  try {
    // ⛔ Guard: do not call API if empty
    if (!order.assign_to) return;

    const payload = {
      company_name: order.company_name,
      po_number: order.po_number,
      visit_date: new Date(order.service_date || order.date)
                    .toISOString()
                    .slice(0, 10),
      assign_to: order.assign_to,          // ✅ FIXED
      type_of_service: order.type_of_service,
    };

    console.log("Sending payload:", payload);

    await axios.post("/api/service_assign", payload);

    // Optional UX lock
    order._assigned = true;

  } catch (error) {
    console.error(
      "Error assigning employee:",
      error.response?.data || error
    );
  }
},




  async markServiceCompleted(order) {
    try {
      await axios.post(`/api/api/service_ssign/${order.id}/complete`);
      order.status = 'Completed';
    } catch (error) {
      console.error('Error marking completed:', error.response?.data || error);
    }
  },



    fetchServicePoList() {
      axios.get('/api/service-po-list').then(res => {
        this.servicePoList = res.data;
      });
      axios.get('/api/employees').then(res => {
        this.employees = res.data;
      });
    },
    assignEmployee(order) {
      axios.post(`/api/update-assigned-employee/${order.id}`, {
        assigned_employee: order.assigned_employee
      });
    },
    markCompleted(order) {
      axios.post(`/api/mark-completed/${order.id}`).then(res => {
        order.status = 'Completed';  // update locally
      });
    },
     openSuppliesModal() {
    this.showSupplyMaterialModal = true;
    this.fetchSupplies();
  },
    fetchSupplies() {
      axios.get('/api/get-supplies') // endpoint to fetch supplies
        .then(res => {
          this.supplies = res.data;
        })
        .catch(err => console.log(err));
    },
    markPending(id) {
      // logic to mark supply as pending
      console.log("Mark pending for ID:", id);
    },
  async openAssignPoForm() {
      this.showAssignPoModal = true;

      try {
        const res = await axios.get("/api/add_po/visits/current-month");
        this.companies = res.data;

        const empRes = await axios.get("/api/users/service"); // 👈 fetch service employees
        this.employees = empRes.data;
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    },
    formatVisitDate(value) {
      const s = String(value).trim();
      // If plain YYYY-MM-DD, format to DD-MM-YYYY without timezone issues
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split('-');
        return `${d}-${m}-${y}`;
      }
      // Fallback for other date strings
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const pad = n => (n < 10 ? '0' : '') + n;
        return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
      }
      return s; // show raw if unparseable
    },
    generateVisitDates() {
    // Rebuild the array whenever "No. of Visits" changes
    this.visitDates = Array.from({ length: this.amcDetails.visits || 0 }, () => '');
  },
 async viewCustomerPo() {
  if (!this.selectedPo) {
    toastWarning("no PO selected");
    return;
  }

  const po_number = this.selectedPo.po_number;

  const basePath = `https://employees.archenterprises.co.in/backend/storage/app/public/uploads/`;
  const extensions = ['pdf', 'PDF', 'png', 'jpg'];

  for (let ext of extensions) {
    const url = `${basePath}${po_number}.${ext}`;

    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        window.open(url, '_blank');
        return;
      }
    } catch (err) {
      // ignore and continue
    }
  }

  toastSuccess("PO file not found");
},




    handleViewPo(companyName, poType) {
      // Fetch PO from backend filtered by company_name and po_type
      axios.get(`/api/get-pos?company_name=${encodeURIComponent(companyName)}&po_type=${encodeURIComponent(poType)}`)
        .then(res => {
          const pos = res.data; // assuming array of POs
          if (pos.length > 0) {
            this.openPoDetails(pos[0]); // open first matching PO
          } else {
            toastWarning("no PO found for this company and type.");
          }
        })
        .catch(err => {
          console.error(err);
          toastError("Failed to fetch PO details.");
        });
    },

    handleSupplyFileUpload(event) {
    this.supplyDetails.poFile = event.target.files[0];
  },
    handlePoFileUpload(event) {
    this.amcDetails.po_file = event.target.files[0];
  },
async saveAmcDetails() {
  if (!this.amcDetails.PONumber || !this.amcDetails.PODate) {
    toastWarning("please fill required fields");
    return;
  }

  this.isSavingAmc = true; // 🔄 start loader

  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.append('po_number', this.amcDetails.PONumber);
    formData.append('po_type', 'AMC');
    formData.append('type_of_amc', this.amcDetails.type);
    formData.append('no_of_visits', this.amcDetails.visits);
    formData.append('start_period', this.amcDetails.start_period);
    formData.append('end_period', this.amcDetails.end_period);
    formData.append('assign_to', this.amcDetails.assigned_employee);
    formData.append('company_name', this.selectedCustomer.company_name);

    // Required fields
    formData.append('date', this.amcDetails.PODate);
    formData.append('value_of_po', this.amcDetails.value_of_po);

    // Visit dates
    this.visitDates.forEach((date, index) => {
      formData.append(`visit${index + 1}`, date || '');
    });

    // File upload
    if (this.amcDetails.po_file) {
      formData.append('po_file', this.amcDetails.po_file);
    }

    await axios.post('/api/add_po', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

toastSuccess('AMC PO saved successfully');

setTimeout(() => {
  window.location.reload();
}, 2000); // 2000 ms = 2 seconds


  } catch (error) {

  if (error.response && error.response.status === 422) {

    const errors = error.response.data.errors;

    // 🔥 Duplicate PO number
    if (errors && errors.po_number) {
      toastWarning(errors.po_number[0]);
    } else {
      toastWarning("Validation error");
    }

  } else {
    toastError('Error saving AMC PO');
  }

} finally {
  this.isSavingAmc = false;
}

}

,


    openPoDetails(po) {
    axios.get(`/api/pos/${po.id}`)   // single PO details
      .then(res => {
        this.selectedPo = res.data;
        this.showPoDetailsModal = true;
      })
      .catch(err => {
        console.error(err);
        toastSuccess('Failed to fetch PO details');
      });
  },

// ✅ Individual Close Button (for each PO)


    // ✅ Header Button (Close Selected PO)
    async closeSelectedPo() {
      if (!this.selectedPoId) {
        toastSuccess('Please select a PO first.')
        return
      }
      try {
        await axios.post(`/api/update-po-status`, { id: this.selectedPoId, status: 'closed' })
        toastSuccess('Selected PO closed!')
        this.showClosedPoModal = true
        this.showviewPoModal = false
      } catch (error) {
        console.error(error)
        toastSuccess('Failed to close selected PO.')
      }
    },
  
    openviewPoModal(companyName) {
      this.selectedCompany = companyName;

      // Fetch PO numbers from backend
      axios.get(`api/get-pos?company_name=${encodeURIComponent(companyName)}`)
        .then(res => {
          this.poList = res.data; // assuming response is an array of PO objects
          this.showviewPoModal = true;
        })
        .catch(err => {
          console.error(err);
          toastError("Failed to fetch PO numbers");
        });
    },
    
    viewReportModal(companyName) {
      this.selectedCompany = companyName;

      // Fetch PO numbers from backend
      axios.get(`api/get-pos?company_name=${encodeURIComponent(companyName)}`)
        .then(res => {
          this.poList = res.data; // assuming response is an array of PO objects
          this.showviewPoModal = true;
        })
        .catch(err => {
          console.error(err);
          toastError("Failed to fetch PO numbers");
        });
    },
    openPoModal(companyName) {
    this.selectedCompany = companyName;

    // Use the correct route
    axios.get(`/api/add_po?company_name=${encodeURIComponent(companyName)}`)
      .then(res => {
        this.poList = res.data;  // assuming backend returns list of POs
        this.showPoModal = true;
      })
      .catch(err => {
        console.error(err);
        toastError("Failed to fetch PO numbers");
      });
  },
    // Handle PO type selection
   handlePoTypeChange() {
  if (this.poType === "Service") {
    this.showPoModal = false;
    this.showServiceModal = true;

  } else if (this.poType === "AMC") {
    this.showPoModal = false;
    this.showAmcModal = true;

  } else if (this.poType === "Supply") {
    this.showPoModal = false;
    this.showSupplyModal = true;
    this.fetchUsers(); // load dropdown data

  } else if (this.poType === "Service+Supply") {
    this.showPoModal = false;
    this.showServiceSupplyModal = true;
    this.fetchUsers(); // needed for recommendedBy + assignTo
  }
},
closeServiceSupplyModal(){
  this.showServiceSupplyModal = false;
},

    closeSupplyModal() {
      this.showSupplyModal = false;
    },
    // Service PO file upload
    handlePoFile(event) {
      this.serviceDetails.poCopy = event.target.files[0];
    },



    closeServiceModal() {
      this.showServiceModal = false;
      this.showPoModal = true;
    },



    closeAmcModal() {
      this.showAmcModal = false;
      this.showPoModal = true;
    },

  
    closePoModal() {
      this.showPoModal = false;
      
    },

    // Save PO type selection
    savePo() {
      if (!this.poType) {
        toastWarning("please select PO type");
        return;
      }
      console.log("Saving PO:", {
        customer_id: this.selectedCustomer?.id,
        po_type: this.poType
      });
      this.closePoModal();
    },

    saveServiceSupply() {
   
  // Basic validation (common required fields)
  if (!this.serviceSupply.poNumber || !this.serviceSupply.date) {
    toastWarning("please fill required fields");
    return;
  }

  this.isSavingServiceSupply = true; // 🔄 start loader

  const token = localStorage.getItem("token");
  const formData = new FormData();

  // COMMON FIELDS
  formData.append("company_name", this.selectedCustomer.company_name);
  formData.append("po_type", "Service+Supply");
  formData.append("po_number", this.serviceSupply.poNumber);
  formData.append("date", this.serviceSupply.date);
  formData.append("value_of_po", this.serviceSupply.totalValue || 0);
// ✅ ADD HERE
formData.append("quotation_against_po", this.supplyDetails.quotationAgainstPo || "");
formData.append("payment_terms", this.supplyDetails.paymentTerms || "");
formData.append("delivery_terms", this.supplyDetails.deliveryTerms || "");
formData.append("delivery_due_date", this.supplyDetails.deliveryDueDate || "");
  // SUPPLY-SPECIFIC
  formData.append(
    "recommended_by",
    this.serviceSupply.recommendedBy || ""
  );

  // SERVICE-SPECIFIC
  formData.append(
    "type_of_service",
    this.serviceSupply.serviceType || ""
  );
  formData.append(
    "assign_to",
    this.serviceSupply.assignTo || ""
  );

  // FILE (single common PO file)
  if (this.serviceSupply.file) {
    formData.append("po_file", this.serviceSupply.file);
  }

 axios
  .post("/api/add_po", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  })
  .then(() => {
    toastSuccess("Service + Supply PO saved successfully");

    setTimeout(() => {
     this.serviceSupply = {};
    }, 2000);
  })
  .catch((err) => {

    if (err.response && err.response.status === 422) {

      const errors = err.response.data.errors;

      // 🔥 If PO already exists
      if (errors && errors.po_number) {
        toastWarning(errors.po_number[0]); 
      } else {
       console.log(err.response.data.errors);
toastWarning(Object.values(err.response.data.errors)[0][0]);
      }

    } else {
      toastError("Failed to save Service + Supply PO");
    }

  })
  .finally(() => {
    this.isSavingServiceSupply = false;
  });
   console.log([...formData.entries()]);

},


  saveSupplyDetails() {
  if (!this.supplyDetails.poNumber || !this.supplyDetails.date) {
    toastWarning("please fill required fields");
    return;
  }

  this.isSavingSupply = true; // 🔄 start loader

  const token = localStorage.getItem('token');
  const formData = new FormData();

  formData.append('company_name', this.selectedCustomer.company_name);
  formData.append('po_type', 'Supply');
  formData.append('po_number', this.supplyDetails.poNumber);
  formData.append('date', this.supplyDetails.date);
  formData.append('value_of_po', this.supplyDetails.value || 0);
  formData.append('recommended_by', this.supplyDetails.recommendedBy || '');
  formData.append('quotation_against_po', this.supplyDetails.quotationAgainstPo || '');
  formData.append('payment_terms', this.supplyDetails.paymentTerms || '');
  formData.append('delivery_terms', this.supplyDetails.deliveryTerms || '');
  formData.append('delivery_due_date', this.supplyDetails.deliveryDueDate || '');

  if (this.supplyDetails.poFile) {
    formData.append('po_file', this.supplyDetails.poFile);
  }

  axios.post('/api/add_po', formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(() => {
    toastSuccess('Supply PO saved successfully');
setTimeout(() => {
  window.location.reload();
}, 2000); // 2000 ms = 2 seconds

  })
.catch(err => {

  if (err.response && err.response.status === 422) {

    // Laravel validation error format
    const errors = err.response.data.errors;

    if (errors && errors.po_number) {
      toastWarning(errors.po_number[0]);   // 👈 shows "This PO Number already exists."
    } else {
      toastWarning(err.response.data.message || 'Validation error');
    }

  } else {
    toastError('Failed to save Supply PO');
  }

})

  .finally(() => {
    this.isSavingSupply = false; // ✅ stop loader ALWAYS
  });
},



 saveServiceDetails() {
  if (!this.serviceDetails.poNumber || !this.serviceDetails.date) {
    toastWarning("please fill required fields");
    return;
  }

  this.isSavingService = true; // 🔄 start loader

  const token = localStorage.getItem('token');
  const formData = new FormData();

  formData.append('company_name', this.selectedCustomer.company_name);
  formData.append('po_type', 'Service');
  formData.append('po_number', this.serviceDetails.poNumber);
  formData.append('date', this.serviceDetails.date);
  formData.append('type_of_service', this.serviceDetails.serviceType);
  formData.append('value_of_po', this.serviceDetails.poValue);
  formData.append('assign_to', this.serviceDetails.assignTo);

  if (this.serviceDetails.poCopy) {
    formData.append('po_file', this.serviceDetails.poCopy);
  }

  axios.post('/api/add_po', formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(() => {
    toastSuccess('Service PO saved successfully');
   setTimeout(() => {
  window.location.reload();
}, 2000); // 2000 ms = 2 seconds

  })
 .catch(err => {

  if (err.response && err.response.status === 422) {

    const errors = err.response.data.errors;

    // 🔥 Duplicate PO number
    if (errors && errors.po_number) {
      toastWarning(errors.po_number[0]);
    } else {
      toastWarning("Validation error");
    }

  } else {
    toastError('Failed to save Service PO');
  }

})

  .finally(() => {
    this.isSavingService = false; // ✅ stop loader ALWAYS
  });
},




    // Fetch AMC/Service related data
    async fetchUsers() {
      try {
        const response = await fetch("/api/api/users");
        this.users = await response.json();
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    // View customer details
    viewCustomerDetails(customer) {
      this.selectedCustomer = customer;
      this.showDetailsModal = true;
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedCustomer = {};
    },

    // Fetch all customers
   fetchCustomers() {
  const token = localStorage.getItem('token');
  this.isLoadingCustomers = true; // 🔄 start loader

  axios
    .get('https://employees.archenterprises.co.in/api/api/customers', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      this.customers = res.data;
    })
    .catch(err => {
      console.error('Fetch error:', err);
      toastError('Failed to load customers.');
    })
    .finally(() => {
      this.isLoadingCustomers = false; // ✅ stop loader
    });
},


    // Edit customer
  editCustomer(customer) {
    const token = localStorage.getItem('token');
    axios.get(`https://employees.archenterprises.co.in/api/api/customers/full/${customer.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      let customerData = res.data;

      // Map related tables to equipment object
      let equipment = {
    Engine: Array.isArray(customerData.engine) && customerData.engine.length > 0
      ? customerData.engine.map(e => ({ make: e.make, model_no: e.model, serial_no: e.controller }))
      : [{ make: '', model_no: '', serial_no: '' }],

    Pump: Array.isArray(customerData.pump) && customerData.pump.length > 0
      ? customerData.pump.map(e => ({ make: e.make, model_no: e.model, serial_no: e.controller }))
      : [{ make: '', model_no: '', serial_no: '' }],

    Controller: Array.isArray(customerData.controller) && customerData.controller.length > 0
      ? customerData.controller.map(e => ({ make: e.make, model_no: e.model, serial_no: e.controller }))
      : [{ make: '', model_no: '', serial_no: '' }],

    Motor: Array.isArray(customerData.motor) && customerData.motor.length > 0
      ? customerData.motor.map(e => ({ make: e.make, model_no: e.model, serial_no: e.controller }))
      : [{ make: '', model_no: '', serial_no: '' }],

    JockeyPump: Array.isArray(customerData.jockey_pump) && customerData.jockey_pump.length > 0
    ? customerData.jockey_pump.map(e => ({ make: e.make, model_no: e.model, serial_no: e.controller }))
    : [{ make: '', model_no: '', serial_no: '' }]

  };


      this.customer = {
    company_name: customerData.company_name || '',
    // address: customerData.address || '',
    billing_address: customerData.billing_address || '',
    shipping_address: customerData.shipping_address || '',
    contact_person: customerData.contact_person || '',
    contact_number: customerData.contact_number || '',
    secondary_contact_number: customerData.secondary_contact_number || '',
    customer_number: customerData.customer_number || '',
    email: customerData.email || '',
    gst_number: customerData.gst_number || '',
    pan_number: customerData.pan_number || '',
    vendor_number: customerData.vendor_number || '',
    office_policy: customerData.office_policy || '',
    equipment_details: JSON.parse(JSON.stringify(equipment))
  };

      this.editingCustomerId = customer.id;
      this.showCustomerModal = true;
    })
    .catch(err => {
      console.error('Failed to fetch customer details:', err);
      toastError('Failed to load customer details.');
    });
  },


    // Delete customer
    deleteCustomer(id) {
      if (!confirm('Are you sure you want to delete this customer?')) return;
      const token = localStorage.getItem('token');
      axios.delete(`https://employees.archenterprises.co.in/api/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        toastSuccess('Customer deleted!');
       setTimeout(() => {
          window.location.reload();
        }, 2000); // 2000 ms = 2 seconds
      })
      .catch(err => {
        console.error(err);
        toastError('Failed to delete customer.');
      });
    },

    // Customer form modal
    openRegisterForm() {
      this.showCustomerModal = true;
    },

    closeCustomerModal() {
      this.showCustomerModal = false;
        // window.location.reload();
    },

    // Equipment handling
    removeEquipment(type, index) {
      this.customer.equipment_details[type].splice(index, 1);
    },

    addEquipment(type) {
      this.customer.equipment_details[type].push({ make: '', model_no: '', serial_no: '' });
    },

    // Submit customer form
 submitCustomerForm() {
    // block submit if invalid
    if (this.emailError) {
      return;
    }

    const token = localStorage.getItem('token');
    const method = this.editingCustomerId ? 'put' : 'post';
    const url = this.editingCustomerId
      ? `https://employees.archenterprises.co.in/api/api/customers/${this.editingCustomerId}`
      : 'https://employees.archenterprises.co.in/api/api/customers';

    const payload = {
      ...this.customer,
      equipment_details: this.customer.equipment_details
    };

    axios[method](url, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      toastSuccess(this.editingCustomerId ? 'Customer updated!' : 'Customer registered!');
      setTimeout(() => {
        window.location.reload();
      }, 2000); // 2000 ms = 2 seconds
    })
    .catch(() => {
      toastError('Failed to save customer.');
    });
  },



    // Reset customer form
    resetCustomerForm() {
      this.customer = {
        company_name: '',
        // address: '',
        billing_address: '',
        shipping_address:'',
        contact_person: '',
        contact_number: '',
        secondary_contact_number: '',
        customer_number: '',
        email: '',
        gst_number: '',
        pan_number: '',
        vendor_number: '',
        office_policy: '',
        equipment_details: {
          Engine: [{ make: '', model_no: '', serial_no: '' }],
          Pump: [{ make: '', model_no: '', serial_no: '' }],
          Controller: [{ make: '', model_no: '', serial_no: '' }],
          Motor: [{ make: '', model_no: '', serial_no: '' }],
          JockeyPump: [{ make: '', model_no: '', serial_no: '' }]
        }
      };
      this.editingCustomerId = null;
      this.showCustomerModal = false;
    },

    // UI helpers
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },

    goTo(route) {
      this.$router.push(`/${route}`);
    },

    logout() {
      const token = localStorage.getItem('token');
      axios.post('https://employees.archenterprises.co.in/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    },
   async loadShippingAddress() {
    if (!this.form.company_id) return;

    try {
      const res = await axios.get(
        `/api/customers/${this.form.company_id}`
      );

      // ✅ Only autofill when creating new quotation
      if (!this.isEdit) {
        this.form.shipping_address =
          res.data.shipping_address || res.data.address || "";
      }

    } catch (err) {
      console.error("Shipping address load failed", err);
    }
  },
 }

  }
  </script>




<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.save-shipp-address{
      background-color: #d9e3e3;
    cursor: pointer;
    width: 149px;
    color: rgb(42, 41, 41);
    border-radius: 6px;
}
.head-title{
      color: white;
    display: flex;
    gap: 7px;
    text-decoration: none;
font-family: cursive;
    align-items: center; width: 100%;
}
@media (max-width: 768px) {
.head-title{
      color: white;
    display: flex;
    gap: 7px;
    display: none;
    text-decoration: none;
    align-items: center; width: 100%;
}
}
.loader {
  width: 18px;
  height: 18px;
  border: 3px solid #ffffff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background: linear-gradient(to right, #f8fafc, #eff6ff);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #4f46e5;
  flex-wrap: wrap;
}

.filter-input,
.filter-select {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  min-width: 220px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  transition: all 0.2s ease;
  flex: 1;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.reopen-btn{
      background-color: white;
    margin-left: 22px;
}
.po-info{
      display: flex;
    align-items: center;
}
.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

/* ===============================
   CRM MODAL OVERLAY
================================ */
.crm-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* ===============================
   MODAL CONTAINER
================================ */
.crm-modal-container {
  background: #ffffff;
  width: 78%;
  max-width: 1200px;
  max-height: 86vh;            /* Enables scrolling */
  padding: 35px 45px;
  border-radius: 18px;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  animation: crmModalIn 0.4s ease;
  scrollbar-width: thin;
  scrollbar-color: #4e73df #f1f1f1;
}

/* ===============================
   MODAL ANIMATION
================================ */
@keyframes crmModalIn {
  from {
    transform: translateY(-25px) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* ===============================
   SCROLLBAR (WEBKIT)
================================ */
.crm-modal-container::-webkit-scrollbar {
  width: 8px;
}

.crm-modal-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.crm-modal-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4e73df, #224abe);
  border-radius: 10px;
}

.crm-modal-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #224abe, #1a3fb4);
}

/* ===============================
   MODAL HEADER
================================ */


/* ===============================
   FORM STRUCTURE
================================ */
.crm-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.crm-form-row {
  display: flex;
  gap: 20px;
}

.crm-full-width {
  flex: 100%;
}

/* ===============================
   INPUT GROUPS
================================ */
.crm-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.crm-input-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}

/* Inputs */
.crm-input-group input,
.crm-input-group textarea {
  padding: 11px 14px;
  font-size: 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.crm-input-group textarea {
  min-height: 90px;
  resize: vertical;
}

.crm-input-group input:focus,
.crm-input-group textarea:focus {
  outline: none;
  border-color: #4e73df;
  box-shadow: 0 0 0 2px rgba(78, 115, 223, 0.15);
}

/* Disabled field */
.crm-input-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

/* ===============================
   EQUIPMENT SECTION
================================ */
.crm-equipment-group {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  margin-top: 10px;
}

.crm-equipment-group h3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 15px;
}

.crm-equipment-entry {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* ===============================
   BUTTONS
================================ */
.crm-add-btn {
 background: linear-gradient(135deg, #ffffff, #ffffff);
    color: #0f0f0f;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 24px;
    transition: all .2s ease;
}

.crm-add-btn:hover {
  transform: scale(1.05);
}

.crm-remove-btn {
  background: var(--sidebar);
  color: #ffffff;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 22px;
  transition: all 0.2s ease;
}

.crm-remove-btn:hover {
  background: #dc2626;
}

/* ===============================
   FOOTER ACTIONS
================================ */
.crm-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  flex-direction: column-reverse;
}

/* ===============================
   RESPONSIVE
================================ */
@media (max-width: 992px) {
  .crm-modal-container {
    width: 90%;
    padding: 30px;
  }
}

@media (max-width: 768px) {
  .crm-modal-container {
    width: 95%;
    padding: 25px;
  }

  .crm-form-row,
  .crm-equipment-entry {
    flex-direction: column;
  }
}

.btn-followup{
  background-color:   #f3f3f3;
  color: rgb(0, 0, 0)!important;
}

.btn-followup:hover{
  background-color: #d3cece;
  color: rgb(0, 0, 0)!important;
}

.approved-row {
  background-color: #d4edda; /* light green */
}

.approved-row td {
  background-color: #75c075;
  font-weight: 500;
}

.pending-row {
  background-color: #fff3cd;
}
.pending-row td{
  background-color: #e5be75;
  font-weight: 500;
}

.rejected-row {
  background-color: #f8d7da;
}
.rejected-row td{
  background-color: #ae3f3f;
  color: #ffffff!important;
  font-weight: 500;
}
.followup-row {
  background-color: #f8d7da;
}
.followup-row td{
  background-color: #758ec0;
  color: #ffffff!important;
  font-weight: 500;
}

.table-input {
width: 100%;
    padding: 1px 4px;
    border-radius: 6px;
    border: 1px solid #ffffff;
    background-color: #ffffff;
  font-size: 14px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: bold;
}

.status-badge.Pending {
  background: #ffeaa7;
  color: #2d3436;
}

.status-badge.Approved {
  background: #55efc4;
  color: #065f46;
}

.status-badge.Rejected {
  background: #fab1a0;
  color: #7f1d1d;
}



.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-icon {
  font-size: 16px;
  color: #dc3545; /* same as btn-danger */
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.edit-icon:hover {
  color: #a71d2a;
  transform: scale(1.1);
}

/* Enhanced Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.modal-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.4s ease-out;
  position: relative;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--sidebar));
}

.modal-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--sidebar));
  color: white;
  font-size: 20px;
  margin: 0 auto 15px auto;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  margin-bottom: 8px;
}

.modal-subtitle {
  font-size: 14px;
  color: #6c757d;
  text-align: center;
  margin-bottom: 25px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group label {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group label i {
  color: var(--primary);
  font-size: 14px;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #ffffff;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.1);
  transform: translateY(-1px);
}

.input-group.full-width {
  flex: 100%;
}

.readonly-field {
  padding: 12px 15px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-weight: 600;
  color: var(--text);
  cursor: not-allowed;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-outline {
  background: transparent;
  color: var(--dark);
  border: 1px solid rgba(58, 66, 86, 0.18);
  box-shadow: inset 0 0 0 1px rgba(58, 66, 86, 0.06);
}

.btn-outline:hover {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.35);
}

/* Page Header Buttons (Glassmorphism on Dark Gradient) */
.page-header .btn-outline {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.page-header .btn-outline:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.page-header .btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.page-header .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.page-header .btn-primary {
  background: white;
  color: #7c3aed;
  border: none;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.page-header .btn-primary:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.page-header {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%);
  border-radius: 24px;
  padding: 30px 32px;
  margin-bottom: 24px;
  box-shadow: 0 15px 35px -10px rgba(124, 58, 237, 0.5);
  position: relative;
  overflow: hidden;
}
.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotateGlow 15s linear infinite;
  pointer-events: none;
}

.page-header .header-top {
  display: flex;
  justify-content: space-between;
  gap: 22px;
  align-items: flex-start;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.page-header .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.page-header h1 {
  font-size: 2.2rem;
  margin-bottom: 8px;
  color: #ffffff;
  line-height: 1.1;
  font-weight: 800;
}

.page-header .page-description {
  max-width: 620px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0;
  font-size: 1rem;
}

.page-header .header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.page-header .header-actions .btn {
  min-width: 140px;
}

.page-header .stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 16px;
  margin: 28px 0 20px;
  position: relative;
  z-index: 1;
}

.page-header .stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.page-header .stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.page-header .stat-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.page-header .stat-value {
  display: block;
  font-size: 1.85rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 4px;
}

.page-header .stat-note {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.page-header .search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.page-header .search-field {
  flex: 1;
  min-width: 260px;
  max-width: 540px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 12px 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.page-header .search-field:focus-within {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.page-header .search-field i {
  color: #4b5563;
  font-size: 16px;
}

.page-header .search-field input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  color: #111827;
  background: transparent;
  font-weight: 500;
}

.page-header .search-field input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.page-header .quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.page-header .quick-actions .btn {
  min-width: 140px;
}

.table-state {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  min-height: 160px;
}

.loader-panel {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: white;
  padding: 18px 22px;
  border-radius: 18px;
  border: 1px solid #d1d5db;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.table-container {
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.table-container .styled-customer-table {
  width: 100%;
  border-collapse: collapse;
}

@media (max-width: 900px) {
  .page-header .stats-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: 20px;
  }

  .page-header .header-actions,
  .page-header .search-section {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header .search-field,
  .page-header .quick-actions .btn {
    width: 100%;
  }
}

/* Specific Modal Types */
.service-modal .modal-card::before {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.supply-modal .modal-card::before {
  background: linear-gradient(90deg, #007bff, #0056b3);
}

.service-supply-modal .modal-card::before {
  background: linear-gradient(90deg, #fd7e14, #e8590c);
}

.po-modal .modal-card::before {
  background: linear-gradient(90deg, #6f42c1, #5a32a3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-card {
    width: 95%;
    margin: 20px;
    padding: 20px;
  }

  .modal-title {
    font-size: 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

.form-group {
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-save {
  background: #28a745;
  color: #fff;
  padding: 8px 14px;
  border-radius: 6px;
}

.btn-cancel {
  background: #ccc;
  padding: 8px 14px;
  border-radius: 6px;
}

.no-data {
  text-align: center;
  padding: 20px;
  font-weight: 600;
  color: #888;
}

.tooltip-link {
  position: relative;
  cursor: pointer;
}

.tooltip-link::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 140%;
  left: 50%;
  transform: translateX(-50%);
  background: #2c2c2c;
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.tooltip-link::before {
  content: "";
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #2c2c2c;
  opacity: 0;
  transition: 0.2s ease;
}

.tooltip-link:hover::after,
.tooltip-link:hover::before {
  opacity: 1;
}

.tooltip-btn {
  position: relative;
}

.tooltip-btn::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.tooltip-btn::before {
  content: "";
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--text);
  opacity: 0;
  transition: 0.2s ease;
}

.tooltip-btn:hover::after,
.tooltip-btn:hover::before {
  opacity: 1;
}

.service-ord {
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}
.service-ord:hover {
  background-color: #dbeafe;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}
.amc-ord {
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}
.amc-ord:hover {
  background-color: #d1fae5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
}
.material-del {
  background-color: #f3e8ff;
  color: #9333ea;
  border: 1px solid #d8b4fe;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}
.material-del:hover {
  background-color: #e9d5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.15);
}
.quotation-edit-btn,
.quotation-delete-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: 0.25s ease;
}

/* ✏ Edit Button (Blue) */
.quotation-edit-btn {
  background: #e8f1ff;
  color: #1461c9;
  border: 1px solid #bcd6ff;
}

.quotation-edit-btn:hover {
  background: #cfe3ff;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(20, 97, 201, 0.25);
}

/* 🗑 Delete Button (Red) */
.quotation-delete-btn {
  background: #ffeaea;
  color: #d62828;
  border: 1px solid #ffc8c8;
}

.quotation-delete-btn:hover {
  background: #ffd1d1;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(214, 40, 40, 0.25);
}

.view-report-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.view-report-btn:hover {
  background-color: var(--text);
}
.delete-btn {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn:hover {
  background: #e60000;
}

/* Table Container */
.styled-customer-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Poppins', sans-serif;
}

/* Header */
.styled-customer-table thead tr {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.styled-customer-table th {
  padding: 16px 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #475569;
  text-align: left;
}

/* Rows */
.styled-customer-table tbody tr {
  background: #ffffff;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.styled-customer-table tbody tr:hover {
  background-color: #f8fafc;
}

/* Cells */
.styled-customer-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #334155;
  text-align: left;
  white-space: nowrap;
  vertical-align: middle;
}

/* Company Name */
.company-link {
  font-weight: 600;
  color: #4f46e5;
  text-decoration: none;
  transition: color 0.2s;
}

.company-link:hover {
  color: #3730a3;
  text-decoration: underline;
}

/* Tooltip */
.tooltip-cell {
  position: relative;
}

.tooltip-text {
  visibility: hidden;
  background-color: #02524b;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 6px;
  position: absolute;
  bottom: -35px;
  /* left: 50%; */
  transform: translateX(-50%);
  opacity: 0;
  font-size: 12px;
  transition: 0.3s ease;
  white-space: nowrap;
}

.tooltip-cell:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Buttons Styling */
.action-btns {
  display: flex;
  justify-content: flex-start;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-view-po, .btn-edit, .btn-delete, .btn-followup {
  border: none;
  padding: 6px 12px;
  border-radius: 8px !important;
  font-size: 12px;
  min-width: 44px !important;
  width: max-content !important;
  cursor: pointer;
  letter-spacing: 0.02em;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-view-po {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-view-po:hover {
  background-color: #e2e8f0;
  color: #334155;
  transform: translateY(-1px);
}

.btn-edit {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.btn-edit:hover {
  background-color: #bbf7d0;
  transform: translateY(-1px);
}

.btn-delete {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.btn-delete:hover {
  background-color: #fecaca;
  transform: translateY(-1px);
}

/* Responsive */
@media(max-width: 768px) {
  .styled-customer-table th, .styled-customer-table td {
    font-size: 12px;
    padding: 8px;
  }
}

.visit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
}

.visit-modal-box {
  width: 370px;
  background: #ffffff;
  padding: 25px 30px;
  border-radius: 14px;
  animation: fadeIn 0.3s ease-out;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
}

.visit-modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #1a73e8;
  border-left: 4px solid #1a73e8;
  padding-left: 10px;
  margin-bottom: 20px;
}

.visit-modal-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
}

.visit-modal-label {
  font-weight: 600;
  margin-bottom: 6px;
}

.visit-modal-select,
.visit-modal-input {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.25s;
}

.visit-modal-select:focus,
.visit-modal-input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
}

.visit-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.visit-btn-success {
  background: #28a745;
  border: none;
  padding: 10px 18px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease-in-out;
}

.visit-btn-success:disabled {
  background: #9dc9a7;
  cursor: not-allowed;
}

.visit-btn-success:hover:not(:disabled) {
  background: #1f8b39;
}

.visit-btn-close {
  background: var(--primary);
  border: none;
  padding: 10px 18px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease-in-out;
}

.visit-btn-close:hover {
  background: #d32f2f;
}

@keyframes fadeIn {
  from {
    transform: translateY(-15px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* View All PO button */
.view-all-btn {
background-color: var(--primary);
    color: #fff;
    border-radius: 11px;
    border-block: #2196f3;
    border-block-color: #2196f3;
    cursor: pointer;
}

.view-all-btn:hover {
   transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
}
/* BACKDROP */
.quotation-backdrop {
  position: fixed;
  position-area: center;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  z-index: 9999;
}

/* MODAL CARD */
.quotation-modal {
  background: #fff;
width: 81%;
    height: 85%;
  max-width: 1100px;
  border-radius: 12px;
  overflow-y: auto;
  /* max-height: 95vh; */
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* HEADER */
.quotation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.quotation-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.quotation-header-actions button {
  padding: 9px 25px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-left: 14px;
}

.quotation-btn-close {
  background: #f44336;
  color: #fff;
}

.quotation-btn-secondary {
  background: #2196f3;
  color: #fff;
}

/* SECTIONS */
.quotation-section-card {
  background: white;
  padding: 15px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.quotation-section-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: var(--text);
  font-weight: 600;
}

/* FORM GRID */
.quotation-grid {
  display: grid;
  gap: 23px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.quotation-form-group {
  display: flex;
  flex-direction: column;
}

.quotation-form-group label {
  font-weight: 500;
  margin-bottom: 5px;
  font-size: 0.95rem;
}

.quotation-form-group input,
.quotation-form-group select,
.quotation-form-group textarea {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
}

/* ITEMS */
.quotation-item-box {
  background: #fff;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.quotation-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.quotation-remove-btn {
  background: #000000;
  color: #fff;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.quotation-add-btn {
  background: #4caf50;
  color: #fff;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  align-self: flex-start;
}

/* EXPORT NOTE */
.quotation-export-note {
  background: #e0f7fa;
  color: #00796b;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.95rem;
}

/* SUBMIT */
.quotation-submit-btn {
  background: #ff9800;
  color: #fff;
  padding: 12px 20px;
  border: none;
  font-size: 1rem;
  border-radius: 10px;
  cursor: pointer;
  align-self: center;
  width: 100%;
  max-width: 250px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .quotation-modal {
    padding: 15px;
  }

  .quotation-grid {
    grid-template-columns: 1fr;
  }

  .quotation-header-actions {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .quotation-submit-btn {
    max-width: 100%;
  }
}

/* BACKDROP */
.upgrade-backdrop {
  backdrop-filter: blur(4px);
  background: rgba(0, 0, 0, 0.55);
}

/* MAIN MODAL */
.upgrade-modal {
  width: 95%;
  max-width: 1100px;
  max-height: 95vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 14px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: fadeIn 0.3s ease;
}

/* HEADER */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.header-bar h2 {
  font-size: 22px;
  font-weight: bold;
  color: var(--text);
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* SECTION CARDS */
.section-card {
  background: #f8f9fc;
  padding: 18px;
  border-radius: 12px;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.05);
  margin-bottom: 18px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text);
}

/* ROWS & COLS */
.row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.col {
  flex: 1;
  min-width: 230px;
}

/* LABELS & INPUTS */
label {
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
}

input, select, textarea {
  width: 100%;
  padding: 8px 10px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  transition: 0.2s;
  background: white;
}

input:focus, select:focus, textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 6px rgba(0,123,255,0.3);
}

/* ITEM BOX */
.item-box {
  background: #fff;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-bottom: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.add-btn {
  background: #28a745;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #0069d9;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
}

/* SECONDARY BUTTON */
.secondary-btn {
  background: var(--text);
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

/* CLOSE BUTTON */
.close-btn {
  /* background: #ff4d4d; */
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  z-index: 999;
}

.modal-card {
  width: 90%;
  max-width: 1100px;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.15);
  max-height: 90vh;
}

.form-title {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: bold;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}

.row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
}

input, select, textarea {
  padding: 7px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.item-row {
  background: #f7f9ff;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e0e5ff;
  margin-bottom: 10px;
  position: relative;
}

.add-btn {
  padding: 10px 18px;
  background: #4caf50;
  color: white;
  border-radius: 6px;
  margin-bottom: 20px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}

.remove-btn {
  background: red;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  height: 30px;
  cursor: pointer;
  align-self: center;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #5d89ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
}

.view-btn {
  background-color: #5d89ff;
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 15px;
}

.export-note {
  color: var(--text);
  font-weight: bold;
  margin: 10px 0;
}

.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 18px;
}

.col label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

.col input,
.col select,
.col textarea {
  width: 100%;
  padding: 7px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.cards-container {
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.quote-card {
  cursor: pointer;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #5d89ff;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-card {
  background: white!important;
  padding: 20px;
  width: 450px;
  max-height: 90vh;
  border-radius: 10px;
  position: relative;
}

.close-btn {

  right: 10px;
  top: 10px;
  /* background: red; */
  color: white;
  padding: 4px 8px;
  border-radius: 5px;
  cursor: pointer;
}

label {
  font-weight: bold;
  margin-top: 10px;
  display: block;
}

input, select, textarea {
  width: 100%;
  padding: 7px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
}

.submit-btn {
  background: #007bff;
  color: white;
  width: 100%;
  padding: 10px;
  border: none;
  cursor: pointer;
  font-size: 16px;
}



/* //-------------------------------------------------- */

:root {
        --primary: #1d4ed8;
        --primary-light: #3b82f6;
        --primary-bg: #eff6ff;
        --bg: #f7f9fc;
        --border: #d1d5db;
        --text: var(--text);
        --muted: var(--text);
        --card-bg: #ffffff;
    }

    body {
        font-family: "Poppins", "Segoe UI", Arial, sans-serif;
        background: var(--bg);
        margin: 0;
        padding: 30px;
        color: var(--text);
    }

    form {
    max-width: 1000px;
    background: var(--card-bg);
    margin: auto;
    padding: 20px 25px; /* reduced from 30px 40px */
    border-radius: 10px;
    /* box-shadow: 0 4px 20px rgba(0,0,0,0.08); */
}

    h1 {
        text-align: center;
        font-size: 1.8em;
        color: var(--primary);
        letter-spacing: 0.5px;
        margin-bottom: 25px;
    }

    .section-title {
    font-weight: 600;
    background: var(--primary);
    /* color: var(--text); */
    padding: 5px 10px; /* reduced from 8px 12px */
    border-radius: 4px;
    font-size: 0.6em;
    margin-bottom: 8px; /* reduced from 15px */
    letter-spacing: 0.4px;
}

    label {
        display: block;
        font-weight: 600;
        margin-top: 10px;
        color: var(--muted);
        font-size: 0.6em;
    }

   input,
textarea {
  border: none;
  border-bottom: 1px solid #ccc;
  outline: none;
  width: 80%;
  background: #ffffff;
}

input:focus,
textarea:focus {

  outline: none;
  box-shadow: none;
}


    input:focus, textarea:focus {
        border-color: var(--primary-light);
        outline: none;
    }

    textarea { resize: vertical; width: 100%;}

   .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px; /* reduced from 20px */
}

   .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.04);
    padding: 12px; /* reduced from 20px */
    margin-bottom: 10px; /* adds a tighter gap between cards */
}

    .card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

    .card-title {
        font-size: 1.05em;
        font-weight: 600;
        font-size: 0.6em;
        color: var(--primary);
        border-bottom: 2px solid var(--primary-light);
        padding-bottom: 6px;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }


/* QUOTE TABLE - FULLY ISOLATED */
.quote-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    font-size: 0.6em;
    background: #fff;
}

.quote-table .quote-th,
.quote-table .quote-td {
    border: 1px solid #ddd;
    padding: 6px 8px;
    text-align: center;
    vertical-align: middle;
}

.quote-table .quote-th {
    background: #f0f4ff;
    color: var(--primary);
    font-weight: 600;
}

/* Inputs + Textareas inside quote table */
.quote-table input,
.quote-table textarea {
    border: none !important;
    background: transparent;
    outline: none;
    width: 100%;
    padding: 4px;
    font-size: 0.9em;
    text-align: center;
}

.quote-table textarea { resize: none; }

.quote-table input:focus,
.quote-table textarea:focus {
    box-shadow: none !important;
    border: none !important;
}

/* Buttons */
.quote-table .add-row,
.quote-table .remove-row {
    border: none;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    
    transition: 0.2s;
}

.quote-table .add-row {
    background: var(--primary);
    color: #180453;
        font-size: 9px;
    margin-top: 8px;
    margin-bottom: 5px;
}

.quote-table .add-row:hover { background: var(--primary-light); }

.quote-table .remove-row {
    background: var(--sidebar);
    color: white;
}

.quote-table .remove-row:hover {
    background: #dc2626;
}

    

    .add-row, .remove-row {
        border: none;
        /* padding: 6px 10px; */
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;
    }

    .add-row {
        background: var(--primary);
        color: #05053d;
        margin-top: 8px;
            margin-bottom: 5px;
    }

    .add-row:hover { background: var(--primary-light); }

    .remove-row {
        background: var(--sidebar);
        color: white;
    }

    .remove-row:hover { background: #dc2626; }

    /* BEAUTIFUL TOTALS SECTION */
    .totals-card {
    background: var(--primary-bg);
    border: 1px solid #c7d2fe;
    border-radius: 8px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
    padding: 10px 12px; /* reduced from 0px (added light padding for spacing) */
    margin-top: 5px; /* reduced from 10px */
}

    .totals-box {
        border-collapse: collapse;
        width: 100%;
        font-size: 0.6em;
        font-size: 0.95em;
    }

   .totals-box td {
    padding: 4px 10px; /* reduced from 0px 18px */
}   
    .totals-box .label {
        font-weight: 600;
        text-align: left;
        font-size: 0.6em;
        color: var(--muted);
    }

    .totals-box .value {
        text-align: right;
        font-weight: 700;
        color: #111;
    }

    .totals-box tr:last-child td {
        border-top: 2px solid var(--primary);
        font-size: 1.05em;
        color: var(--primary);
        font-size: 0.6em;
    }

    .amount-words {
        margin-top: 12px;
        font-style: italic;
        background: #fff;
        padding: 10px 12px;
        font-size: 10px;
        border-radius: 6px;
        border: 1px solid #dbeafe;
        color: var(--text);
    }

    .submit-btn {
        display: block;
        width: 100%;
        background: var(--primary);
        color: rgb(20, 21, 77);
        font-size: 1.1em;
        padding: 12px;
        border: none;
        border-radius: 8px;
        margin-top: 30px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s;
    }

    .submit-btn:hover { background: var(--primary-light); }

    .note {
        margin-top: 10px;
        font-size: 0.85em;
        color: #666;
        font-style: italic;
    }

/* Overlay */
.modal-overlay-supply {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--text)c4;
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 99999; /* 🔥 ALWAYS ON TOP */
  animation: fadeIn 0.3s ease;
}


/* Modal box */
.modal-content-supply {
  background: #ffffff;
  width: 400px;
  max-width: 90%;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  overflow: hidden;
  animation: slideUp 0.3s ease;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header */
.modal-header-supply {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  padding: 15px 20px;
  color: #fff;
}

.modal-title-supply {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-btn-supply {
  background: transparent;

  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s;
}

.close-btn-supply:hover {
  transform: rotate(90deg);
}

/* Body */
.modal-body-supply {
  padding: 20px;
}

.form-group-supply {
  margin-bottom: 15px;
}

.label-supply {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: var(--text);
}

.input-supply {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  transition: border 0.3s, box-shadow 0.3s;
}

.input-supply:focus {
  border-color: #4facfe;
  outline: none;
}

/* Footer */
.modal-footer-supply {
  padding: 15px 20px;
  text-align: right;
  background: #f7f9fc;
}

.btn-submit-supply {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit-supply:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* Animations */
@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 1;}
}

@keyframes slideUp {
  from {transform: translateY(50px); opacity: 0;}
  to {transform: translateY(0); opacity: 1;}
}

/* Overlay background */
.completed-services-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--text)e0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* very high value to ensure it's on top */
}

/* Modal box */
.completed-services-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
 width: 73%;
    height: 85%;
 
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 10000; /* make modal itself higher than overlay just in case */
}
.modal-header h3 {
  margin: 0;
  color: var(--text);
  font-weight: bold;
  text-decoration: none;
}

.close-btn {
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #e74c3c;
  font-weight: bold;
}

/* Table styling */
.completed-services-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
}

.completed-services-table th,
.completed-services-table td {
  padding: 10px;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid #ddd;
}

.completed-services-table th {
  background-color: #3498db;
  color: white;
     font-size: .9em;
}

.completed-services-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.completed-services-table tr:hover {
  background-color: #f1f1f1;
  transition: 0.3s;
}

/* Modal animation */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.modal-header {

  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 10px !important;
      border-bottom: none!important;
      flex-direction: column;
}

.header-buttons {
  display: flex !important;
  gap: 8px !important;
}

.closed-po-btn,
.close-btn {
        border: 2px solid #e50505;
       
  color: white !important;
  padding: 6px 12px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  transition: background-color 0.2s ease !important;
}

.closed-po-btn:hover {
  background-color: #2980b9 !important;
  border: 2px solid #007bff;
}

.modal-title {
  font-size: 21px !important;
  font-weight: 800 !important;
  margin-bottom: 18px!important;
  text-transform: uppercase!important;
 
}

.closed-po-body {
  margin-top: 10px !important;
}

.modal-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 10px !important;
}

.header-buttons {
      margin-top: -3%!important;
    display: flex !important;
    gap: 8px !important;
    margin-left: 72%!important;
}

.closed-po-btn,
.close-btn {

  color: white !important;
  padding: 6px 12px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  transition: background-color 0.2s ease !important;
}


.closed-po-btn:hover {
  background-color: #2980b9 !important;
}


.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.close-btn,
.closed-po-btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}


.closed-po-btn {
  background-color: #007bff;
  border: 2px solid #0877ef;
  color: white;
}

.po-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  margin: 5px 0;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  transition: background 0.2s;
}

.po-item:hover {
  background: #eef3f8;
}

.po-actions button {
  margin-left: 8px;
 font-size: 11px;
    padding: 7px 13px;
  background: #df0909;
    color: white;
}

.btn-sm{
margin-left: 8px;
  font-size: 13px;
  padding: 4px 8px;
  background: #098271 !important;
    color: white;
}

.tooltip-cell {
  position: relative;
  /* display: inline-block; */
}

.tooltip-text {
  visibility: hidden;
  background-color: #3006bb;
  color: #fff;
  text-align: center;
  font-size: 12px;
  padding: 5px 8px;
  border-radius: 4px;
  position: absolute;
  z-index: 1;
  bottom: 75%; /* above the link */
  /* left: 50%; */
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip-cell:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.status-dropdown {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 14px;
}

.status-dropdown:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 3px rgba(52, 152, 219, 0.5);
}

.logo-img {
  height: 70px;
}
.status-pending {
  color: #f39c12;
  font-weight: bold;
}
.status-completed {
  color: #27ae60;
  font-weight: bold;
}
.status-inprogress {
  color: #2980b9;
  font-weight: bold;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-card {
  background: #fff;
  border-radius: 10px;
  padding: 25px;
  width: 80%;
  /* max-width: 700px; */
  max-height: 90vh;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  animation: fadeIn 0.3s ease-out;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  color: var(--text);
  text-decoration: none;
}

.details-table, .equipment-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.details-table th, .details-table td, .equipment-table th, .equipment-table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #ddd;
}

.details-table th {
  width: 35%;
  /* background: #f7f7f7; */
  color: var(--text);
}

.equipment-section h3 {
  margin-top: 15px;
  margin-bottom: 10px;
  color: var(--text);
  font-weight: 600;
}

.equipment-type h4 {
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: 500;
  color: #1abc9c;
}

.equipment-table th {
  background: #ecf0f1;
  font-weight: 500;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  padding: 8px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background-color: #bdc3c7;
  color: var(--text);
}

.btn-secondary:hover {
  background-color: #95a5a6;
}

@keyframes fadeIn {
  from {opacity: 0; transform: scale(0.95);}
  to {opacity: 1; transform: scale(1);}
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Search box */
.search-container {
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 8px 12px;
  transition: border 0.3s, box-shadow 0.3s;
}

.search-container.active {
  width: 94%;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.search-icon {
  color: #9ca3af;
  margin-right: 8px;
}

.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
}

/* Button */
.assign-btn {
  background-color: var(--text);
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.assign-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
}

.completed-btn{
    background-color: #037b1700;
  color: #037b17;
  padding: 6px 12px;
  border: none; 
  border-radius: 6px;
  /* font-weight: bold; */
  cursor: pointer;
  transition: background-color 0.2s;
}
/* .completed-btn:hover {
  background-color: #025c11;
} */
.delevered {
  background-color: #e0e7ff;
  color: #1e40af;
  padding: 4px 12px;
  border: 1px solid #c7d2fe;
  border-radius: 20px;
  font-weight: 600;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
}
.delevered:hover {
  background-color: #c7d2fe;
  transform: translateY(-1px);
}

.pending-btn {
  background-color: #fef3c7;
  color: #b45309;
  padding: 4px 12px;
  border: 1px solid #fde68a;
  border-radius: 20px;
  font-weight: 600;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
}
.pending-btn:hover {
  background-color: #fde68a;
  transform: translateY(-1px);
}
.table-scroll-container {
  max-height: 50vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.table-scroll-container::-webkit-scrollbar {
  width: 6px;
}
.table-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}
.table-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0; /* Remove margin since wrapper has it */
  font-size: 13px;
  min-width: 500px;
  background: #ffffff;
}

.styled-table th, 
.styled-table td {
  text-align: left;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.styled-table td {
  font-weight: 500;
}

.styled-table th {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 12px;
  border-bottom: none;
  position: sticky;
  top: 0;
  z-index: 10;
}

.styled-table tbody tr {
  transition: all 0.2s ease;
}

.styled-table tbody tr:hover {
  background-color: #f8fafc;
  transform: translateY(-1px);
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--text)c4!important;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 25px 30px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  animation: fadeIn 0.3s ease-in-out;
}

.modal-title {
  margin-bottom: 20px;
  font-size: 1.4em;
  text-align: center;
  color: var(--text);
}

.po-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.po-table th,
.po-table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #e0e0e0;
}

.po-table th {
  background: #f7f7f7;
  width: 40%;
  font-weight: 600;
  color: var(--text);
}

.po-table td {
  color: var(--text);
}

.close-btn {
  display: block;
  margin: 0;
    padding: 10px 25px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}


@keyframes fadeIn {
  from {opacity: 0; transform: scale(0.9);}
  to {opacity: 1; transform: scale(1);}
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--text)c4;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 30px 25px;
  width: 90%;
  /* max-width: 450px; */
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  text-align: center;
  transform: scale(0.8);
  animation: scaleIn 0.3s forwards;
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--text);
}

.po-list {
      display: flex;
flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin-bottom: 25px;
}

.po-list li {
  background: #f0f4f8;
  width: auto;
  margin: 9px 8px;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  transition: transform 0.2s, background 0.2s;
}

.po-list li:hover {
  transform: scale(1.01);
  background: #d0e6ff;
}

.close-btn {
  padding: 10px 25px;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s, transform 0.2s;
}

.close-btn:hover {
  /* background: #b50202; */
  transform: scale(1.05);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.8); }
  to { transform: scale(1); }
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: var(--text)c4;
  display: flex; justify-content: center; align-items: center;
}
.modal-contentDetails {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 73%;
      max-height: 91%;
    height: max-content;
  overflow: scroll;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  height: auto;
}
.view-btn {
  margin-left: 10px;
  padding: 2px 8px;
  cursor: pointer;
}


.modal-card.medium {
  width: 500px;
}
.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}
.input-group label {
  font-weight: bold;
  margin-bottom: 5px;
}
.form-row {
  display: flex;
  gap: 15px;
}
.full-width {
  flex: 1 1 100%;
}

/* MODAL BACKDROP - ENHANCED */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalFadeIn 0.3s ease-out;
}

/* MODAL CARD - PROFESSIONAL DESIGN */
.modal-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 650px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.modal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #007bff, #28a745, #ffc107);
  border-radius: 16px 16px 0 0;
}

.modal-card.small {
  max-width: 450px;
  padding: 28px;
}

.modal-card.medium {
  max-width: 550px;
}

.modal-card.large {
  /* max-width: 800px; */
}

/* MODAL TITLE - ELEGANT */
.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
  position: relative;
  padding-bottom: 12px;
}

.modal-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  border-radius: 2px;
}

/* FORM ELEMENTS - MODERN DESIGN */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.input-group {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
}

.input-group.full-width {
  flex: 1 1 100%;
  min-width: unset;
}

.input-group label {
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-size: 12px;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 14px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 15px;
  color: #495057;
  background: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow:
    0 0 0 3px rgba(0, 123, 255, 0.1),
    inset 0 1px 3px rgba(0, 0, 0, 0.1);
  background: #ffffff;
  transform: translateY(-1px);
}

.input-group input:hover,
.input-group select:hover,
.input-group textarea:hover {
  border-color: #ced4da;
}

.input-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* MODAL BUTTONS - PROFESSIONAL */
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #545b62);
  color: white;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #545b62, #3d4142);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  color: white;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-success:hover {
  background: linear-gradient(135deg, #1e7e34, #155724);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545, #bd2130);
  color: white;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #bd2130, #921925);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

/* ANIMATIONS */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .modal-card {
    width: 95%;
    padding: 24px;
    margin: 20px;
  }

  .modal-title {
    font-size: 20px;
  }

  .form-row {
    gap: 15px;
  }

  .input-group {
    min-width: 100%;
  }

  .modal-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    width: 100%;
    padding: 14px;
  }
}

/* LOADING STATES */
.loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* FOCUS STATES FOR ACCESSIBILITY */
.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* PLACEHOLDER STYLING */
.input-group input::placeholder,
.input-group select::placeholder,
.input-group textarea::placeholder {
  color: #adb5bd;
  opacity: 0.7;
}

/* PURCHASE ORDER MODAL ENHANCEMENTS */
.po-modal {
  text-align: center;
}

.modal-header-icon {
  font-size: 48px;
  color: #007bff;
  margin-bottom: 16px;
  opacity: 0.8;
}

.modal-subtitle {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 24px;
  font-weight: 400;
}

.po-type-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.input-group label i {
  margin-right: 8px;
  color: #007bff;
  font-size: 14px;
}

/* ENHANCED BUTTON ICONS */
.btn i {
  margin-right: 6px;
}

/* MODAL CARD VARIATIONS */
.modal-card.po-modal::before {
  background: linear-gradient(90deg, #007bff, #28a745, #17a2b8);
}

/* RESPONSIVE ENHANCEMENTS */
@media (max-width: 480px) {
  .modal-card {
    width: 98%;
    padding: 20px;
    margin: 10px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-header-icon {
    font-size: 36px;
  }
}

.search-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 15px;
  flex-direction: column-reverse;
}

.search-container {

  position: relative;
  display: flex;
  align-items: center;
  width: 220px;
      width: 85%;

  transition: all 0.4s ease;
  background: #fff;
  border-radius: 25px;
  padding: 5px 12px;
  
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.search-container.active {
  box-shadow: 0 4px 12px rgba(74,144,226,0.3);
}

.search-icon {
  color: #999;
  font-size: 16px;
  margin-right: 8px;
  transition: color 0.3s ease;
}


.search-input {
  border: none;
  color: white;
  outline: none;
  font-size: 14px;
  width: 100%;
  background: transparent;
}

.search-input::placeholder {
  color: #bbb;
  transition: color 0.3s ease;
}


.search-bar {
  margin-bottom: 10px;
}
.search-input {
  padding: 6px 10px;
  width: 100%;
  /* max-width: 300px; */
  border-radius: 4px;
  /* border: 1px solid #ccc; */
}

.form-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.input-group {
  flex: 1 1 26%;
  display: flex;
  flex-direction: column;
}

.user-table td a {
  font-family: system-ui;
  color: var(--text);
  text-decoration: none;
  cursor: pointer;
}

.user-table td a:hover {
  color: var(--text);
}

.user-table .btn-group button {
  margin-right: 8px;
  padding: 8px 22px;
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
}

.add-button {
  margin-left: 10px;
  font-size: 18px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--text);
}
.equipment-entry.aligned-row {
        margin-bottom: 24px;
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.input-group {
  flex: 1;
  min-width: 150px;
}
.remove-button-group {
  display: flex;
  align-items: flex-end;
}

.remove-button {
  font-size: 20px;
  background: transparent;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding-bottom: 8px;
}

.equipment-group {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ffffff;
  border-radius: 24px;
  background-color: #fbfbfb;
}

.equipment-group h3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
}


input[type="text"],
input[type="email"],
input[type="tel"],
textarea {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.input{
    border: 2px solid #ced4da;
}
/* Labels for required fields */
.input-group label::after {
  /* content: ' *';
  var(--text); */
  font-weight: 700;
}

/* Optional: Highlight focused field */
.input-group input:focus,
.input-group textarea:focus {
  background-color: #f0f8ff;
}

/* Modal Buttons */
.modal-buttons {
  margin-top: 20px;
}

.modal-buttons .btn {
  font-size: 12px;
  width: 100%;
}

.mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-icon {
    display: inline-block;
  }

  .sidebar {
    position: absolute;
    z-index: 1000;
    width: 240px;
    height: 100vh;
    background-color: var(--text);
  }

  .expanded-content {
    margin-left: 0 !important;
    transition: margin 0.3s ease-in-out;
  }
}

.password-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-wrapper input {
  flex: 1;
}

.toggle-btn,
.generate-btn {
  padding: 6px 10px;
  background-color: var(--primary);
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.toggle-btn i {
  pointer-events: none;
}

.toggle-btn:hover,
.generate-btn:hover {
  background-color: var(--text);
}

.user-table td .btn-group {
     display: flex;
    gap: .5rem;
    margin-right: 8px;
    color: #3c696a;
    background-color: var(--text)2e;
    padding: 8px 22px;
    font-size: 13px;
    border-radius: 8px;
    cursor: pointer;
}
/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* background: #ffffff; */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}
.company-name {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
}
/* Header */
.header {
  font-size: 17px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: var(--primary); 
  color: white;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
}

.menu-btn, .logout-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.menu-btn {
  background-color: #28a745;
  color: white;
  margin-right: 15px;
}

.menu-btn:hover {
  background-color: #218838;
}

.logout-btn {
  background-color: white;
  color: #003977;
}

.logout-btn:hover {
  background-color: #e7f1ff;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar */
.sidebar {
  background-color: #ffffff;
  width: 220px;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  font-weight: 600;
  color: var(--text);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 14px 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar li:hover {
  background-color: var(--primary);
  color: white;
  font-weight: 700;
}

/* Content Section */
.content {
  flex: 1;
     
  background-color: #a5d5cf33;
  padding: 30px 40px;
  border-radius: 15px;
  /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
  overflow-x: auto;
}

h2 {
  margin-bottom: 30px;
  color: var(--text);
 border-bottom: 2px solid var(--primary);
    padding-bottom: 8px;
    font-weight: 800;
  text-transform: uppercase;
  font-size: 21px;
  /* border-bottom: 2px solid var(--primary);
  padding-bottom: 8px; */
}

/* User Table */
.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 6px 9px;
  /* justify-self: center; */
}

.user-table th,
.user-table td {
      height: 29px;
  text-align: left;
  font-size: 16px;
  color: #ffffff;
}

.user-table th {
  padding: 6px 20px;
  font-weight: 700;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.user-table tbody tr {
  background-color: #fefefe;
  box-shadow: 0 1px 5px rgba(0,0,0,0.07);
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.user-table tbody tr:hover {
  background-color: #e9f5ff;
  transform: translateX(5px);
}

.user-table tbody td {
  border: none;
  vertical-align: middle;
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
  letter-spacing: 0.6px;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 97vw;
  height: 100vh;
    background: rgba(0,0,0,0.6);
   /* background-color: #154477 */;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 15px;
}

/* Modal Card */
.modal-card {
  background-color: white;
  width: 73%;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);

  max-height: 86vh;

  animation: slideDown 0.4s ease forwards;
  position: relative;
}


.modal-card::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}


@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Title */
.modal-title {
  font-size: 25px;
    font-weight: 800;
    text-align: center; 
    margin-bottom: 35px;
    color: var(--text) ;
    letter-spacing: 1.3px;
}

/* Form Layout */
.attractive-form {
  display: flex;
  flex-direction: column;
  /* gap: 30px; */
}

/* Form Rows */
.form-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.form-row .input-group {
  flex: 1 1 26%;
  display: flex;
  flex-direction: column;
}

/* Full width input group */
.input-group.full-width {
  flex: 1 1 100%;
}

/* Input Group */
.input-group label {
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.input-group input,
.input-group select,
.input-group textarea {
  /* padding: 5px 18px; */
  border: 2px solid #ced4da;
  /* border-radius: 12px; */
  width: 100%;
  font-size: 1rem;
  font-weight: 500;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  background-color: #f9fbff;
}

/* Textarea resize */
.input-group textarea {
  resize: vertical;
  min-height: 56px;
  font-family: inherit;
}

/* Modal Buttons */
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  /* flex: 1; */
  padding: 14px 15px;
  font-size: 0.8rem;
  width: max-content;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
}

.btn-primary {
  background-color: var(--text);
  color: white;
  box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}
.btn-warning {
    background-color: #c25151 !important;
    color: #fff;
    box-shadow: 0 6px 15px #d19898 !important;
}

.btn-warning:hover {
    background-color: #842323 !important;
    color: #fff;
    box-shadow: 0 6px 15px #c49797 !important;
}

.btn-primary:hover {
  background-color: var(--text);
  box-shadow: 0 8px 18px rgba(0, 86, 179, 0.6);
}

.btn-secondary {
  background-color: var(--text);
  color: white;
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}

.btn-secondary:hover {
  background-color: var(--primary);
  box-shadow: 0 8px 18px rgba(90, 98, 104, 0.6);
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 900px) {
  .form-row .input-group {
    flex: 1 1 100%;
  }

  .modal-card {
    padding: 30px 25px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: row;
    gap: 10px;
  }
  .menu-btn, .logout-btn {
    width: 100%;
  }
}
.attractive-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.btn-primary.attractive-btn {
  background-color: var(--primary);
  border: none;
  color: white;
}

.btn-primary.attractive-btn:hover {
  background-color: var(--text);
  box-shadow: 0 4px 12px rgba(13,110,253,0.6);
}

.btn-danger.attractive-btn {
  background-color: #dc3545;
  border: none;
  color: white;
}

.btn-danger.attractive-btn:hover {
  background-color: #bb2d3b;
  box-shadow: 0 4px 12px rgba(220,53,69,0.6);
}

.attractive-btn i {
  font-size: 14px;
}
/* ===============================
   QUOTATION POPUP BACKDROP
================================ */
.quotation-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 20, 40, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

/* ===============================
   MODAL CONTAINER
================================ */
.quotation-modal {
  background: linear-gradient(180deg, #ffffff, #f9fbff);
  /* width: 100%; */
  max-width: 1200px;
  max-height: 84vh;
  margin-top: -34px;
    margin-left: -41px;
  overflow-y: auto;
  border-radius: 18px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.35);
  animation: quotationFadeIn 0.35s ease;
}

/* ===============================
   HEADER
================================ */
.quotation-header {
  position: sticky;
  top: 0;
  z-index: 999;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  padding: 16px 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 18px 18px 0 0;
}

.quotation-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.3px;
      border-bottom: 2px solid #ffffff;
}

.quotation-header-actions {
  display: flex;
  gap: 10px;
}

/* ===============================
   BUTTONS
================================ */
.quotation-btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.quotation-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
}

.quotation-btn-close {
  background: #ffffff;
  color: #160d0d;
  margin-top: 18px;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.quotation-btn-close:hover {
  background: #ffffff;
  transform: scale(1.05);
}

/* ===============================
   SECTION CARDS
================================ */
.quotation-section-card {
  background: white;
  margin: 0px;
  padding: 17px;
  border-radius: 16px;
 
}

.quotation-section-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #1e3a8a;
  border-left: 4px solid #3b82f6;
  padding-left: 10px;
}

/* ===============================
   GRID & FORM ELEMENTS
================================ */
.quotation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 40px;
  margin-top: -34px;
}

.quotation-form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
  display: block;
}

.quotation-form-group input,
.quotation-form-group select,
.quotation-form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5f5;
  background: #f8fafc;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.quotation-form-group input:focus,
.quotation-form-group select:focus,
.quotation-form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* ===============================
   READONLY COMPANY FIELD
================================ */
.readonly-field {
  background: linear-gradient(135deg, #e0f2fe, #eff6ff);
  padding: 12px;
  border-radius: 10px;
  color: #1e40af;
  border: 1px dashed #3b82f6;
}

/* ===============================
   ITEM BOX
================================ */
.quotation-item-box {
  margin-bottom: 20px;
  padding: 18px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.quotation-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.quotation-item-header h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.quotation-remove-btn {
  background: #fee2e2;
  color: #b91c1c;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
   z-index: 99!important;
}

.quotation-remove-btn:hover {
  background: #fecaca;
}

/* ===============================
   EXPORT NOTE
================================ */
.quotation-export-note {
  grid-column: 1 / -1;
  background: #ecfeff;
  border: 1px dashed #22d3ee;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  color: #0369a1;
  text-align: center;
}

/* ===============================
   ADD ITEM BUTTON
================================ */
.quotation-add-btn {
  margin-top: 10px;
  background: #22c55e;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quotation-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

/* ===============================
   SUBMIT BUTTON
================================ */
.quotation-submit-btn {
  width: calc(100% - 44px);
  margin: 0 22px 22px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quotation-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.45);
}

/* ===============================
   ANIMATION
================================ */
@keyframes quotationFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Modal Card */
.modal-card {
  background: linear-gradient(135deg, #ffffff, #f5f7fa);
  width: auto;
  /* max-width: 900px; */
  max-height: 90vh;
  border-radius: 18px;
  padding: 25px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: popupScale 0.3s ease;
}

/* Animation */
@keyframes popupScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Header */
.modal-card h2 {
justify-self: anchor-center;
  margin-bottom: 20px;

}

/* Close Button */
.close-btn {
  /* position: absolute; */
  top: 15px;
  right: 20px;
  /* background: #ff4d4f; */
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.3s;
}


/* Filter */
.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin: 8px 0 20px;
  font-size: 15px;
}

/* Cards Container */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

/* Quote Card */
.quote-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: 0.3s;
  cursor: pointer;
  position: relative;
}

.quote-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

/* Quote ID */
.quote-card p {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #5b5b60;
}

/* Action Buttons */
.quotation-edit-btn,
.quotation-delete-btn {
  width: auto;
  margin-left: 7px;
  border: none;
  padding: 8px 12px;
  margin-top: 8px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
}




/* Empty State */
.modal-card {
  text-align: center;
  color: var(--text);
  font-size: 16px;
}
@media (max-width: 768px) {
 
  .main-content{
    display: flex;
    flex: 1;
    padding: 0px!important;
    gap: 20px;
  }
  h2 {
    margin-bottom: 13px;
    color: var(--text);
    font-weight: 800;
    text-transform: uppercase;
    font-size: 17px;
    border-bottom: 2px solid var(--primary);
    padding-bottom: 8px;
  }

  .content{
    justify-items: anchor-center;
    padding: 25px 0px;
    display: ruby;
  }
  .user-table td a{
    font-size: 12px;
}

/* Hide Sr.No column */
  .user-table th:nth-child(1),
  .user-table td:nth-child(1) {
    display: none;
  }

  /* Hide Cust No column */
  .user-table th:nth-child(3),
  .user-table td:nth-child(3) {
    display: none;
  }
  .search-bar{
        justify-content: center;
  }
  .search-input{
        padding: 1px 10px;

  }
  .assign-btn{
    font-size: 10px;
  }
  .search-container{
    padding: 0px 9px;
    border-radius: 13px;

  }
  .modal-header{
    flex-direction: column-reverse;
  }
  .closed-po-btn{
    font-size: 9px !important;
  }
  .header-buttons{
    margin-left: 56% !important;
  }
  .po-list{
        flex-direction: column;
  }
  .po-list li{
    margin: 6px -15px;
  }
 
  .closed-po-btn .close-btn{
        font-size: 9px !important;
}

.quotation-backdrop{
      position-area: center;
}
.quotation-header h2{
      font-size: 1rem;
}
.quotation-header{
justify-content: center;
}
.modal-card h2{
  font-size: 16px;
}
.quotation-edit-btn{
  width: auto;
  font-size: 10px;
}
.quotation-delete-btn{
   width: auto;
  font-size: 10px;
}
.modal-card p{
  font-size: 12px;
}
.hide-content {
  display: none;
}

}
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 35px;
}
@media (max-width: 768px) {
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 35px;
  margin-bottom: 6px;
      height: 52px;
}
}

.logo-img {
 height: 65px; background-color: white; border-radius: 9px;;
}

.header-title {
  flex: 1;
  text-align: center;
  color: white;
  margin: 0;
  font-size: 1.3rem;
}

.mobile-menu-icon {
  font-size: 22px;
  color: white;
  cursor: pointer;
}
.loader-cell {
  text-align: center;
justify-self: center;
}

.table-loader {
  width: 36px;
  justify-self: center;
  /* height: 36px; */
  /* border: 4px solid #e0e0e0; */
  /* border-top: 4px solid #4f46e5; */
  /* border-radius: 50%; */
  /* animation: spin 0.8s linear infinite; */
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.fullscreen-page {
  position: fixed;
  inset: 0;
  background: #f5f7fa;
  z-index: 9999;
  overflow: auto;
}

.quotation-section-card {
  padding: 15px;
}
.welcome-text {
  margin-bottom: 12px;
  font-weight: 600;
}

.report-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.report-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  background: #f7f7f7;
  margin-bottom: 8px;
  transition: 0.2s;
}

.report-item:hover {
  background: #eaeaea;
}

.no-data {
  text-align: center;
  color: var(--text);
  padding: 10px;
}

.report-btn {
  margin: 5px;
  padding: 8px 12px;
  background-color: #3490dc;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.report-btn:hover {
  background-color: #2779bd;
}
.demo-reports {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.report-table th,
.report-table td {
  border: 1px solid #ddd;
  padding: 8px;
  font-size: 14px;
}

.report-table th {
  background: #f4f6f8;
  text-align: left;
}

.view-btn {
  padding: 6px 12px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.view-btn:hover {
  background: #1e40af;
}
.quotation-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #ddd;
  border-top: 4px solid #0a58ca;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-card {
  background: #fff;
  width: 90%;
  max-width: 1285px;

  /* 🔽 Scroll settings */
  max-height: 90vh;

  border-radius: 12px;
  padding: 20px;
}
.modal-card::-webkit-scrollbar {
  width: 8px;
}

.modal-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-card::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.modal-card::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}

/* ===============================
   MODAL CLOSE BUTTON
================================ */
.crm-modal-close {
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: var(--text);
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  
}

.crm-modal-close:hover {
  background: var(--sidebar);
  color: #ffffff;
  transform: rotate(90deg);
}

.crm-modal-close:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}

.input-error {
  border: 1px solid red;
}

.error-message {
  color: #ee0000;
  font-size: 0.8rem;
  margin-top: 2px;
}

.followup-status {
  margin: 6px 0 10px;
  font-size: 0.95em;
}

.status-pending {
       color: #453802;
    background-color: #ebe395;
    border-radius: 7px;
    padding: 2px 5px;
    font-weight: 700 !important;
    text-transform: uppercase;
    font-size: 12px;
}

.status-follow-up {
   color: #090542;
    background-color: #bebbd4;
    border-radius: 7px;
    padding: 2px 5px;
    font-weight: 700 !important;
    text-transform: uppercase;
    font-size: 12px;
}

.status-closed {
     color: #064f06;
    background-color: #7dd47d;
    border-radius: 7px;
    padding: 2px 5px;
    font-weight: 700 !important;
    text-transform: uppercase;
    font-size: 12px;
}
.status-approved {
      color: #064f06;
    background-color: #7dd47d;
    border-radius: 7px;
    padding: 2px 5px;
    font-weight: 700 !important;
    text-transform: uppercase;
    font-size: 12px;
}

.status-rejected {
    color: #7c0101;
    background-color: #f19c9c;
    border-radius: 7px;
    padding: 2px 5px;
    font-weight: 700 !important;
    text-transform: uppercase;
    font-size: 12px;
}

.total-amount-box {
  padding: 10px;
  background: #f4f6fa;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2em;
  color: var(--text);
}

.grand-total-card {
    min-width: 244px;
    background: linear-gradient(135deg, #ffffff, #0095ffa8);
    border-radius: 14px;
    padding: 6px 20px;
    box-shadow: 1px 5px 20px 0px var(--text)c7;
    border: 7px solid #e6e6e6;
}

.grand-total-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
}

.grand-total-header .title {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--text);
}

.gst-toggle {
     font-size: .85em;
    padding: 5px 12px;
    background-color: var(--text);
    cursor: pointer;
    color: white;
    border-radius: 7px;
}

.grand-total-amount {
  font-size: 16px;
  font-weight: 700;
  color: #085f36;
  TEXT-ALIGN: -WEBKIT-LEFT;
  line-height: 1.7;
  margin: 8px 0;
}

.grand-total-sub {
  font-size: 0.9em;
  color: var(--text);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: #00000059!important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px); /* Safari support */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.terms-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.terms-buttons .btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: #f5f5f5;
}

.terms-buttons .btn.active {
  background: #222;
  color: #fff;
  border-color: #222;
}

/* Overlay */
.email-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal */
.email-modal {
  width: 500px;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.25s ease-in-out;
}

/* Header */
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
      font-size: 20px;
    font-weight: 700;
    text-transform: uppercase;
}

.close-icon {
  cursor: pointer;
  font-size: 16px;
  color: #666;
}

/* Body */
.modal-body {
  padding: 15px 20px;
  overflow-y: auto;
  justify-items: left;
  flex: 1;
}

.customer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f3f3;
  font-size: 14px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 500;
}

/* Footer */
.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  position: sticky;
  bottom: 0;
}

.selected-count {
  font-size: 13px;
  color: #555;
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
}

.copy-btn {
  background: #1f7ae0;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.copy-btn:disabled {
  background: #b5c7e6;
  cursor: not-allowed;
}

.close-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

/* Animation */
@keyframes fadeIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.calculation-modal{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgb(0 0 0 / 84%);
display:flex;
align-items:center;
justify-content:center;
z-index:10050;
}

.calculation-card{
background:white;
width:95%;
max-width:1400px;
padding:20px;
border-radius:10px;
overflow:auto;
max-height:90vh;
position:relative;
z-index:10051;
}

.calc-table{
width:100%;
border-collapse:collapse;
font-size:13px;
}

.calc-table th{
background:#f5f7fa;
padding:10px;
border:1px solid #ddd;
}

.calc-table td{
padding:8px;
border:1px solid #ddd;
}

.calc-table input,
.calc-table select{
width:100%;
padding:5px;
}
.calc-actions{
display:flex;
gap:10px;
margin-bottom:10px;
}

.btn-add{
background:#4caf50;
color:white;
padding:6px 12px;
border:none;
border-radius:5px;
}

.btn-export{
background:#2196f3;
color:white;
padding:6px 12px;
border:none;
border-radius:5px;
}

.btn-save{
background:#ff9800;
color:white;
padding:6px 12px;
border:none;
border-radius:5px;
}
.calculation-header{
display:flex;
justify-content:space-between;
align-items:center;
border-bottom:1px solid #eee;
padding-bottom:10px;
margin-bottom:15px;
}.calc-close-btn{
background:#ff4d4f;
color:white;
border:none;
width:30px;
height:30px;
border-radius:50%;
cursor:pointer;
font-size:14px;
display:flex;
align-items:center;
justify-content:center;
transition:0.3s;
}

.calc-close-btn:hover{
background:#d9363e;
transform:scale(1.05);
}
.row-red {
  background-color: #ffe5e5;
}

.row-green {
  background-color: #e6ffe6;
}

.row-blue {
  background-color: #e6f0ff;
}

/* Optional Hover Effect */
.styled-table tbody tr:hover {
  transform: scale(1.002);
  transition: 0.2s;
}
.row-red {
  background: #ffe5e5;
}

.row-green {
  background: #e6ffe6;
}

.row-blue {
  background: #e6f0ff;
}

.row-yellow {
  background: #fffe62;
}
.calculation-item-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.calculation-item-btn:hover {
  background-color: #138496;
  transform: translateY(-1px);
}

.calculation-item-btn:active {
  transform: translateY(0);
}
.quotation-duplicate-btn {
 background-color: #c01f90;
    color: #fff;
    border: none;
    margin-left: 7px;
    margin-top: 8px;
    font-size: 12px;
    padding: 4px;
    border-radius: 10px;
    cursor: pointer;
    transition: all .3s ease;
    white-space: nowrap;
}
/* Add these styles if needed */
.modal-card.medium {
  max-width: 500px;
  width: 90%;
}

.modal-header-icon {
  text-align: center;
  font-size: 48px;
  color: #007bff;
  margin-bottom: 10px;
}

.modal-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.po-type-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.input-group.full-width {
  width: 100%;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
/* Ensure proper z-index stacking */
.modal-backdrop {
  z-index: 1050 !important;
}

.quotation-backdrop {
  z-index: 1040 !important;
}

/* Make sure duplicate modal has higher z-index when active */
.modal-backdrop:has(.modal-card.medium) {
  z-index: 1060 !important;
}

/* Ensure duplicate modal appears above others */
.showDuplicateCompanySelection .modal-backdrop {
  z-index: 1060 !important;
}
.modal-backdrop {
  z-index: 1050;
}

.quotation-backdrop {
  z-index: 1040;
}

/* Specific style for duplicate modal */
.modal-backdrop .modal-card.medium {
  z-index: 1060;
  position: relative;
}

/* Ensure duplicate modal is on top */
.showDuplicateCompanySelection ~ .quotation-backdrop,
.showDuplicateCompanySelection + .quotation-backdrop {
  z-index: 1030;
}
.equipment-selection-section select[multiple] {
  background: white;
}

.equipment-selection-section select[multiple] option {
  padding: 6px;
  border-bottom: 1px solid #eee;
}

.equipment-selection-section select[multiple] option:checked {
  background: #007bff linear-gradient(0deg, #007bff 0%, #007bff 100%);
  color: white;
}

/* Make readonly textareas look better */
.quotation-form-group textarea[readonly] {
  background-color: #f8f9fa;
  cursor: default;
}
/* ===============================
   MOBILE RESPONSIVE TABLE STYLES
================================ */

/* Hide mobile cards on desktop */
.mobile-cards {
  display: none;
}

/* Mobile Cards - Show on mobile */
@media (max-width: 768px) {
  .mobile-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px;
  }

  .styled-customer-table {
    display: none;
  }

  .customer-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
  }

  .customer-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
  }

  .card-company {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .card-sr {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 600;
    flex-shrink: 0;
  }

  .company-link {
    font-weight: 500;
    color: #147b6b;
    text-decoration: none;
    font-size: 14px;
    word-break: break-word;
  }

  .company-link:hover {
    color: #0e5c52;
  }

  .cust-number {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
    flex-shrink: 0;
  }

  .card-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .action-btn-small {
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 10px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    justify-content: center;
  }

  .action-btn-small:active {
    transform: scale(0.95);
  }

  .action-btn-small.view-po {
    background-color: #1a1a2e;
  }

  .action-btn-small.view-po:hover {
    background-color: #2d2d4a;
  }

  .action-btn-small.quotation {
    background-color: #667eea;
  }

  .action-btn-small.quotation:hover {
    background-color: #5a6fd6;
  }

  .action-btn-small.reports {
    background-color: #10b981;
  }

  .action-btn-small.reports:hover {
    background-color: #059669;
  }

  .action-btn-small i {
    font-size: 12px;
  }

  /* Hide desktop action buttons on mobile */
  .action-btns {
    display: none;
  }

  /* Ensure table container handles overflow */
  .table-container {
    overflow-x: auto;
  }
}

/* Mobile Cards Scrollbar */
.mobile-cards::-webkit-scrollbar {
  width: 4px;
}

.mobile-cards::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.mobile-cards::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 10px;
}

/* Medium screens (tablets) */
@media (max-width: 1024px) and (min-width: 769px) {
  .action-btns {
    flex-wrap: wrap;
    gap: 4px;
  }

  .btn-view-po,
  .btn-followup {
    padding: 4px 6px;
    font-size: 9px;
  }

  .btn-view-po i,
  .btn-followup i {
    font-size: 10px;
  }
}

/* Small mobile screens */
@media (max-width: 480px) {
  .customer-card {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .card-company {
    width: 100%;
  }

  .company-link {
    font-size: 13px;
  }

  .cust-number {
    align-self: flex-end;
  }

  .card-actions {
    /* flex-direction: column; */
    gap: 4px;
  }

  .action-btn-small {
    padding: 8px 10px;
    font-size: 11px;
    width: 100%;
  }

  .action-btn-small i {
    font-size: 13px;
  }
}
/* ===============================
   ENHANCED SEARCH BAR & BUTTONS
================================ */

:root {
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
  --dark: #1a1a2e;
  --gray: #6b7280;
  --light-gray: #f3f4f6;
  --border: #e5e7eb;
}

/* Search Bar Container */
.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  background: white;
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border);
}

/* Search Input */
.search-container {
  flex: 1;
  display: flex;
  align-items: center;
  background: #021f36;
  width: 94%;
  padding: 8px 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 200px;
  position: relative;
}

.search-container:hover {
  background: #021f36;
}

.search-container.active {
  background: #021f36;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12);
}

.search-icon {
  color: #9ca3af;
  margin-right: 10px;
  font-size: 15px;
  transition: color 0.3s;
}

.search-container.active .search-icon {
  color: var(--primary-color);
}

.search-input {
  border: none;
  outline: none;
  color: white;
  flex: 1;
  font-size: 14px;
  background: transparent;
  font-weight: 400;
  min-height: 36px;
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 300;
}

.clear-search {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.08);
}


/* Button Row */
.button-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
          align-items: start;
}

/* Base Button Style */
.assign-btn {
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

/* Button Ripple Effect */
.assign-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.2);
  opacity: 0;
  transition: opacity 0.3s;
}

.assign-btn:hover::after {
  opacity: 1;
}

.assign-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.assign-btn:active {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.assign-btn i {
  font-size: 14px;
  line-height: 1;
}

.btn-text {
  display: inline;
}

/* Button Variants */
.assign-btn.primary {
  background: #bfc4c3;
  color: #333;
}

.assign-btn.info {
  background: #bfc4c3;
  color: #333;
}

.assign-btn.warning {
  background: #bfc4c3;
  color: #333;
}

.assign-btn.secondary {
  background: #bfc4c3;
  color: #333;
}

.assign-btn.dark {
  background: #bfc4c3;
  color: #333;
}

.assign-btn.add-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}



/* Button Badge (optional - for notifications) */
.assign-btn .badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--danger);
  color: white;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .button-row {
    gap: 6px;
  }
  
  .assign-btn {
    padding: 8px 14px;
    font-size: 12px;
  }
  
  .assign-btn i {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .search-bar {
    width: 94%;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
  }

  .search-container {
    min-width: auto;
  }

  .search-input {
    font-size: 15px;
    min-height: 40px;
  }


  .button-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    width: 100%;
  }

  .assign-btn {
    justify-content: center;
    padding: 10px 8px;
    font-size: 11px;
    gap: 6px;
    min-height: 44px;
    border-radius: 8px;
  }

  .assign-btn i {
    font-size: 13px;
  }

  .btn-text {
    display: inline;
  }

  .assign-btn .badge {
    top: -4px;
    right: -4px;
    font-size: 8px;
    padding: 1px 5px;
    min-width: 14px;
  }
}

@media (max-width: 480px) {
  .search-bar {
    padding: 10px;
    gap: 10px;
  }

  .search-container {
    padding: 6px 10px;
  }

  .search-input {
    font-size: 16px;
    min-height: 36px;
  }

  .search-icon {
    font-size: 13px;
    margin-right: 8px;
  }

  .button-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .assign-btn {
    padding: 10px 6px;
    font-size: 10px;
    gap: 4px;
    min-height: 44px;
    border-radius: 8px;
  }

  .assign-btn i {
    font-size: 12px;
  }
}

@media (max-width: 380px) {
  .button-row {
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }

  .assign-btn {
    font-size: 9px;
    padding: 8px 4px;
    min-height: 40px;
    gap: 3px;
  }

  .assign-btn i {
    font-size: 11px;
  }

  .btn-text {
    display: inline;
  }
}

/* Animation for buttons on load */
.assign-btn {
  animation: fadeInUp 0.4s ease backwards;
}

.assign-btn:nth-child(1) { animation-delay: 0.05s; }
.assign-btn:nth-child(2) { animation-delay: 0.1s; }
.assign-btn:nth-child(3) { animation-delay: 0.15s; }
.assign-btn:nth-child(4) { animation-delay: 0.2s; }
.assign-btn:nth-child(5) { animation-delay: 0.25s; }
.assign-btn:nth-child(6) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus visible for accessibility */
.assign-btn:focus-visible,
.search-input:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {


  .search-input {
    color: #fff!important;
  }

  .search-input::placeholder {
    color: #94a3b8;
  }


  .clear-search:hover {
    background: rgba(239, 68, 68, 0.15);
  }
}

/* ===============================
   ENHANCED PO MANAGEMENT MODAL
================================ */

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 0px;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

/* Modal Card */
.modal-card.large.po-management-modal {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid #f1f5f9;
}

.modal-card.large.po-management-modal::-webkit-scrollbar {
  width: 6px;
}

.modal-card.large.po-management-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-card.large.po-management-modal::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 10px;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header-custom {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f1f5f9;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  color: #475569;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-back:hover {
  background: #e2e8f0;
  transform: translateX(-2px);
}

.btn-back:active {
  transform: scale(0.95);
}

.modal-title-wrapper {
  flex: 1;
  text-align: center;
}

.modal-icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 14px;
  color: white;
  font-size: 22px;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Action Cards Grid */
.po-action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.po-action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.po-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
  background: #f8fafc;
}

.po-action-card:active {
  transform: scale(0.98);
}

/* Card Variants */
.po-action-card .card-icon-wrapper.amc {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #2563eb;
}

.po-action-card .card-icon-wrapper.service {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}

.po-action-card .card-icon-wrapper.supply {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
}

.po-action-card .card-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  transition: all 0.3s;
}

.po-action-card:hover .card-icon-wrapper {
  transform: scale(1.05) rotate(-5deg);
}

.po-action-card .card-content {
  flex: 1;
}

.po-action-card .card-content h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 2px 0;
}

.po-action-card .card-content p {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 6px 0;
}

.po-action-card .card-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #475569;
  transition: all 0.3s;
}

.po-action-card:hover .card-tag {
  background: #333;
}

.po-action-card .card-arrow {
  color: #9ca3af;
  font-size: 18px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.po-action-card:hover .card-arrow {
  color: #667eea;
  transform: translateX(4px);
}

/* Card Hover Colors */
.po-action-card:hover .card-arrow {
  color: #3b82f6;
  transform: translateX(4px);
}

/* Quick Stats */
.po-quick-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 14px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #e2e8f0;
}

/* Footer Note */
.modal-footer-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #eff6ff;
  border-radius: 10px;
  color: #3b82f6;
  font-size: 12px;
}

.modal-footer-note i {
  font-size: 16px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .modal-card.large.po-management-modal {
    padding: 24px;
    max-width: 95%;
  }

  .po-action-grid {
    gap: 12px;
  }

  .po-action-card {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .modal-card.large.po-management-modal {
    padding: 20px;
    border-radius: 20px;
  }

  .modal-header-custom {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .btn-back {
    padding: 8px 14px;
    font-size: 12px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-subtitle {
    font-size: 13px;
  }

  .po-action-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .po-action-card {
    padding: 16px 18px;
  }

  .po-action-card .card-icon-wrapper {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .po-action-card .card-content h3 {
    font-size: 15px;
  }

  .po-quick-stats {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
  }

  .stat-divider {
    display: none;
  }

  .stat-item {
    flex: 1;
    justify-content: center;
    padding: 4px 8px;
    background: white;
    border-radius: 8px;
  }

  .modal-footer-note {
    font-size: 11px;
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .modal-card.large.po-management-modal {
    padding: 16px;
    border-radius: 16px;
    max-height: 95vh;
  }

  .modal-title-wrapper {
    text-align: left;
    width: 100%;
  }

  .modal-icon-badge {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-subtitle {
    font-size: 12px;
  }

  .btn-back {
    font-size: 11px;
    padding: 6px 12px;
  }

  .po-action-card {
    padding: 14px;
    gap: 12px;
  }

  .po-action-card .card-icon-wrapper {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .po-action-card .card-content h3 {
    font-size: 14px;
  }

  .po-action-card .card-content p {
    font-size: 11px;
  }

  .po-action-card .card-tag {
    font-size: 9px;
    padding: 1px 8px;
  }

  .po-action-card .card-arrow {
    font-size: 14px;
  }

  .stat-number {
    font-size: 17px;
  }

  .stat-label {
    font-size: 10px;
  }

  .modal-footer-note {
    font-size: 10px;
    padding: 8px 12px;
    flex-wrap: wrap;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modal-card.large.po-management-modal {
    background: #1e293b;
  }

  .modal-title {
    color: #333;
  }

  .modal-subtitle {
    color: #94a3b8;
  }

  .po-action-card {
    background: #fff;
    border-color: #475569;
  }

  .po-action-card .card-content h3 {
    color: #333;
  }

  .po-action-card .card-content p {
    color: #94a3b8;
  }

  .po-action-card .card-tag {
    background: #475569;
    color: #cbd5e1;
  }

  .po-quick-stats {
    background: #022557;
  }

  .stat-number {
    color: #f1f5f9;
  }

  .stat-label {
    color: #94a3b8;
  }

  .modal-footer-note {
    background: #1e3a5f;
    color: #60a5fa;
  }

  .btn-back {
    background: #334155;
    color: #cbd5e1;
  }

  .btn-back:hover {
    background: #475569;
  }

  .modal-header-custom {
    border-bottom-color: #334155;
  }
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ── Card ── */
.modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 85%;
  max-height: 85%;
  border-radius: 28px;
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  padding: 1.5rem 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  overflow: scroll!important;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── Header ── */
.modal-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f4f9;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 60px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.btn-back i {
  font-size: 0.9rem;
}

.btn-back:hover {
  background: #e2e8f0;
  transform: translateX(-2px);
}

.btn-back:active {
  transform: scale(0.96);
}

/* ── Body ── */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.25rem;
  margin-top: 0.25rem;
}

/* custom scroll */
.modal-body::-webkit-scrollbar {
  width: 5px;
}
.modal-body::-webkit-scrollbar-track {
  background: transparent;
}
.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 12px;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 400;
  color: #0f172a;
  margin: 0 0 1.25rem 0;
  letter-spacing: -0.01em;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 0.75rem;
}

.modal-title strong {
  color: #0f172a;
  font-weight: 700;
}

/* ── Table wrapper (scroll on small screens) ── */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  background: #fafcff;
}

/* ── Table ── */
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  min-width: 480px;
}

.report-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e9edf3;
}

.report-table th {
  text-align: left;
  padding: 0.9rem 1rem;
  font-weight: 600;
  color: #334155;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.report-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #1e293b;
}

.report-table tbody tr:last-child td {
  border-bottom: none;
}

.report-table tbody tr:hover {
  background: #f8fafc;
}

/* ── Badges ── */
.badge-service,
.badge-visit {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-service {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge-visit {
  background: #fce7f3;
  color: #be185d;
}

/* ── Report buttons ── */
.report-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.35rem 0.75rem;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.view-btn i {
  font-size: 0.8rem;
  color: #475569;
}

.view-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.view-btn:active {
  transform: scale(0.95);
}

.not-available {
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 400;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 2.5rem 0;
  font-size: 1rem;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .modal-card {
    padding: 1rem 1rem 1.5rem;
    border-radius: 24px;
    max-height: 95vh;
  }

  .modal-header {
    margin-bottom: 0.25rem;
  }

  .btn-back {
    padding: 0.45rem 1rem;
    font-size: 0.8rem;
    gap: 0.35rem;
  }

  .modal-title {
    font-size: 1.1rem;
    margin-bottom: 0.9rem;
    padding-bottom: 0.6rem;
  }

  .report-table {
    font-size: 0.8rem;
    min-width: 400px;
  }

  .report-table th,
  .report-table td {
    padding: 0.65rem 0.7rem;
  }

  .badge-service,
  .badge-visit {
    font-size: 0.65rem;
    padding: 0.2rem 0.6rem;
    max-width: 100px;
  }

  .view-btn {
    font-size: 0.65rem;
    padding: 0.25rem 0.6rem;
    gap: 0.25rem;
  }

  .view-btn i {
    font-size: 0.7rem;
  }

  .table-wrapper {
    border-radius: 12px;
  }

  .modal-backdrop {
    padding: 0.5rem;
  }
}

@media (max-width: 400px) {
  .modal-card {
    padding: 0.75rem 0.75rem 1.25rem;
    border-radius: 20px;
  }

  .report-table {
    min-width: 320px;
    font-size: 0.7rem;
  }

  .report-table th,
  .report-table td {
    padding: 0.5rem 0.5rem;
  }

  .badge-service,
  .badge-visit {
    font-size: 0.6rem;
    padding: 0.15rem 0.5rem;
    max-width: 80px;
  }

  .view-btn {
    font-size: 0.6rem;
    padding: 0.2rem 0.5rem;
  }

  .modal-title {
    font-size: 1rem;
  }

  .btn-back {
    font-size: 0.7rem;
    padding: 0.35rem 0.8rem;
  }
}

/* ── landscape phones ── */
@media (max-height: 500px) and (orientation: landscape) {
  .modal-card {
    max-height: 92vh;
    padding: 0.75rem 1rem 1rem;
  }

  .modal-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.4rem;
  }

  .report-table th,
  .report-table td {
    padding: 0.4rem 0.6rem;
  }
}
.required {
  color: red;
  font-size: medium;
}






/* =========================================================
   PRO QUOTATION MODAL - CLEAN, ORGANIZED ENTERPRISE UI/UX
   ========================================================= */

/* Backdrop */
.quotation-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1.25rem;
  animation: proModalFadeIn 0.2s ease-out;
}

@keyframes proModalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modal Window */
.quotation-modal.pro-quotation-modal {
  background: #f1f5f9;
  width: 96%;
  max-width: 1240px;
  max-height: 94vh;
  margin: 0 auto;
  border-radius: 20px;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  animation: proModalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes proModalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Sticky Header */
.pro-modal-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
  color: #ffffff;
  padding: 1.1rem 1.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 4px 15px rgba(2, 132, 199, 0.2);
  flex-shrink: 0;
}

.pro-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pro-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #ffffff;
  flex-shrink: 0;
}

.pro-header-icon.icon-cyan {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pro-header-icon.icon-amber {
  background: rgba(245, 158, 11, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pro-header-title-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.pro-modal-title {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.pro-status-pill {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.18rem 0.6rem;
  border-radius: 20px;
}

.pro-status-pill.pill-cyan {
  background: rgba(255, 255, 255, 0.25);
  color: #e0f2fe;
}

.pro-status-pill.pill-amber {
  background: #f59e0b;
  color: #ffffff;
}

.pro-company-subchip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #bae6fd;
  margin-top: 0.15rem;
}

.pro-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pro-btn-header-action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 0.5rem 1.05rem;
  border-radius: 50px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  backdrop-filter: blur(4px);
}

.pro-btn-header-action:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.pro-btn-header-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-btn-header-close:hover {
  background: #ffffff;
  color: #0f172a;
  transform: rotate(90deg);
}

/* Modal Body */
.pro-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1.85rem;
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.pro-modal-body::-webkit-scrollbar {
  width: 6px;
}

.pro-modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* Section Card */
.pro-card-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 1.35rem 1.6rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.pro-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.85rem;
  margin-bottom: 1.15rem;
  border-bottom: 1px solid #f1f5f9;
}

.pro-card-header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.pro-card-header-icon.bg-blue { background: #e0f2fe; color: #0284c7; }
.pro-card-header-icon.bg-purple { background: #f3e8ff; color: #7c3aed; }
.pro-card-header-icon.bg-emerald { background: #dcfce7; color: #059669; }
.pro-card-header-icon.bg-amber { background: #fef3c7; color: #d97706; }

.pro-card-header-title h3 {
  font-size: 1.08rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.pro-card-header-title span {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
}

/* Form Layout Grids */
.pro-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.15rem;
}

.pro-grid-3col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.15rem;
}

.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.85rem; }

.pro-field-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.pro-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.req-star {
  color: #ef4444;
  font-weight: 800;
}

.text-emerald { color: #16a34a; }
.text-blue { color: #0284c7; }

/* Inputs - Clean, High Quality, Never Red on default */
.pro-input,
.pro-select {
  width: 100%;
  height: 40px;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.86rem;
  font-weight: 500;
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

textarea.pro-input {
  height: auto;
  min-height: 64px;
  resize: vertical;
  line-height: 1.5;
}

.pro-input:focus,
.pro-select:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

.pro-readonly {
  background: #f8fafc !important;
  color: #64748b !important;
  border-color: #e2e8f0 !important;
  cursor: not-allowed;
}

.pro-select-wrap {
  position: relative;
  width: 100%;
}

.pro-select-wrap .pro-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2rem;
  cursor: pointer;
}

.pro-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.75rem;
  pointer-events: none;
}

.pro-readonly-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  height: 40px;
}

.pro-company-name-text {
  font-weight: 700;
  color: #15803d;
  font-size: 0.9rem;
}

/* Shipping Area */
.pro-shipping-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  border-radius: 10px;
}

.pro-shipping-actions {
  display: flex;
  justify-content: flex-end;
}

.pro-btn-update-addr {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.95rem;
  background: #0284c7;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.pro-btn-update-addr:hover:not(:disabled) {
  background: #0369a1;
}

/* Equipment Segmented Switch */
.pro-segmented-switch {
  display: inline-flex;
  background: #e2e8f0;
  border-radius: 10px;
  padding: 3px;
  gap: 4px;
  margin-bottom: 1.15rem;
}

.pro-segment-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  color: #64748b;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-segment-btn.active {
  background: #ffffff;
  color: #0284c7;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.pro-equip-checkbox-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-bottom: 1rem;
}

.pro-equip-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.95rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-equip-tag-pill:hover {
  background: #ffffff;
  border-color: #94a3b8;
}

.pro-equip-tag-pill.selected {
  background: #eff6ff;
  border-color: #38bdf8;
  color: #0284c7;
}

.pro-equip-dropdown-row {
  margin-bottom: 0.85rem;
}

.pro-select-multiple {
  width: 100%;
  max-width: 580px;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.84rem;
  outline: none;
}

.pro-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.pro-equip-chip,
.pro-manual-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #1e293b;
}

.pro-chip-del-btn {
  background: #fee2e2;
  border: none;
  color: #ef4444;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: pointer;
}

.pro-chip-del-btn:hover {
  background: #ef4444;
  color: #ffffff;
}

.pro-manual-action-bar {
  display: flex;
  gap: 0.65rem;
  margin-top: 0.75rem;
}

.pro-btn-green {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  background: #10b981;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.pro-btn-green:hover { background: #059669; }

.pro-btn-gray {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.15s;
}

.pro-btn-gray:hover { background: #e2e8f0; color: #0f172a; }

.pro-manual-list-card {
  margin-top: 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.75rem;
  border-radius: 10px;
}

/* =========================================================
   SORTED & CLEAN ITEM DETAILS SECTION
   ========================================================= */
.pro-items-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.85rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pro-card-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pro-items-header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pro-items-count-pill {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  border: 1px solid #bae6fd;
}

.pro-btn-add-item-top {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1.15rem;
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
}

.pro-btn-add-item-top:hover {
  background: #059669;
  transform: translateY(-1px);
}

.pro-item-cards-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Individual Item Card */
.pro-item-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-left: 5px solid #0284c7;
  border-radius: 14px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pro-item-card:hover {
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.07);
}

/* Item Card Header */
.pro-item-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pro-item-badge-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pro-item-number-badge {
  background: #0284c7;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
}

.pro-item-title-text {
  font-size: 0.98rem;
  font-weight: 800;
  color: #0f172a;
}

.pro-item-actions-wrap {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.pro-reorder-group {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.pro-reorder-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  cursor: pointer;
}

.pro-reorder-btn:hover:not(:disabled) {
  background: #ffffff;
  color: #0284c7;
}

.pro-reorder-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pro-pos-selector {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  border-left: 1px solid #e2e8f0;
}

.pro-pos-select {
  border: none;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  cursor: pointer;
}

.pro-item-delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.pro-item-delete-btn:hover {
  background: #ef4444;
  color: #ffffff;
}

/* Row 1: Full Description */
.pro-item-desc-full {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
}

/* Row 2: Structured Commercials Strip */
.pro-commercials-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  border-radius: 10px;
  align-items: flex-start;
}

.pro-strip-col {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.pro-strip-col.col-hsn {
  flex: 2 1 200px;
  min-width: 180px;
}

.pro-strip-col.col-qty {
  flex: 1 1 90px;
  min-width: 80px;
}

.pro-strip-col.col-uom {
  flex: 1.1 1 110px;
  min-width: 95px;
}

.pro-strip-col.col-rate {
  flex: 1.4 1 120px;
  min-width: 110px;
}

.pro-strip-col.col-disc {
  flex: 1 1 95px;
  min-width: 85px;
}

.pro-strip-col.col-tax {
  flex: 1 1 95px;
  min-width: 85px;
}

/* Row 3: Calculation Ribbon */
.pro-item-calc-ribbon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.65rem;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pro-item-ribbon-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pro-export-callout {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0284c7;
  background: #e0f2fe;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
}

.pro-formula-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
}

.pro-item-ribbon-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.pro-btn-calc-sheet {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.95rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.pro-btn-calc-sheet:hover {
  background: #f1f5f9;
  border-color: #0284c7;
  color: #0284c7;
}

.pro-item-total-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  padding: 0.45rem 1rem;
  border-radius: 8px;
}

.pro-total-lbl {
  font-size: 0.78rem;
  font-weight: 700;
  color: #166534;
}

.pro-total-amount {
  font-size: 1.05rem;
  font-weight: 800;
  color: #15803d;
}

/* Add Item Bottom Wide Button */
.pro-btn-add-item-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  background: #f0fdf4;
  border: 2px dashed #86efac;
  color: #16a34a;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-top: 0.5rem;
}

.pro-btn-add-item-bottom:hover {
  background: #dcfce7;
  border-color: #4ade80;
  color: #15803d;
}

/* Terms & Conditions Section */
.pro-terms-pill-row {
  display: flex;
  gap: 0.65rem;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
}

.pro-terms-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1.15rem;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-terms-pill:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.pro-terms-pill.active {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);
}

.pro-terms-textarea-wrap {
  position: relative;
}

.pro-terms-textarea {
  min-height: 110px;
  font-family: inherit;
  font-size: 0.86rem;
  line-height: 1.5;
}

.pro-char-counter {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  color: #94a3b8;
  margin-top: 0.35rem;
  justify-content: flex-end;
}

/* Sticky Action Footer */
.pro-modal-footer {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 0 20px 20px;
  flex-shrink: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}

.pro-footer-left {
  display: flex;
  align-items: center;
}

.pro-footer-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.82rem;
}

.pro-stat-tag {
  color: #64748b;
  font-weight: 600;
}

.pro-stat-number {
  color: #0f172a;
  font-weight: 800;
}

.pro-footer-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pro-btn-footer-cancel {
  padding: 0.65rem 1.35rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-btn-footer-cancel:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.pro-btn-footer-submit {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.85rem;
  background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 800;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.3);
}

.pro-btn-footer-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(2, 132, 199, 0.4);
}

/* Responsive Rules */
@media (max-width: 768px) {
  .quotation-modal.pro-quotation-modal {
    width: 98%;
    max-height: 96vh;
    border-radius: 14px;
  }

  .pro-modal-header {
    padding: 0.85rem 1rem;
    border-radius: 14px 14px 0 0;
  }

  .pro-modal-title {
    font-size: 1.15rem;
  }

  .pro-modal-body {
    padding: 0.85rem;
    gap: 0.85rem;
  }

  .pro-card-section {
    padding: 1rem;
  }

  .pro-grid-2col,
  .pro-grid-3col {
    grid-template-columns: 1fr;
  }

  .pro-commercials-strip {
    flex-direction: column;
  }

  .pro-strip-col {
    width: 100%;
  }

  .pro-modal-footer {
    padding: 0.85rem 1rem;
    flex-direction: column;
    gap: 0.65rem;
  }

  .pro-footer-actions {
    width: 100%;
    justify-content: space-between;
  }

  .pro-btn-footer-submit,
  .pro-btn-footer-cancel {
    flex: 1;
    text-align: center;
    justify-content: center;
  }
}


.required {
  color: red;
  font-size: medium;
}

/* =========================================================
   AWESOME QUOTATIONS MODAL STYLING
   ========================================================= */
.modal-card.awesome-quotation-modal {
  max-width: 1200px;
  width: 95%;
  max-height: 90vh;
  background: #f8fafc;
  border-radius: 24px;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow: hidden !important;
  animation: aqModalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes aqModalSlide {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.aq-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.aq-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.aq-icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #38bdf8, #0284c7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.35rem;
  box-shadow: 0 8px 20px -4px rgba(2, 132, 199, 0.4);
  flex-shrink: 0;
}

.aq-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.aq-modal-title {
  font-size: 1.45rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.aq-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  border: 1px solid #bae6fd;
}

.aq-modal-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0.2rem 0 0 0;
}

.aq-btn-close {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.55rem 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.aq-btn-close:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
  transform: translateX(-2px);
}

/* Summary Banner */
.aq-summary-banner {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.aq-summary-card {
  flex: 1;
  min-width: 220px;
  border-radius: 16px;
  padding: 0.9rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.15);
}

.aq-summary-card.inr-card {
  background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
}

.aq-summary-card.usd-card {
  background: linear-gradient(135deg, #059669 0%, #065f46 100%);
}

.aq-summary-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.aq-summary-info {
  display: flex;
  flex-direction: column;
}

.aq-summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.85;
  font-weight: 600;
}

.aq-summary-value {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-top: 2px;
}

.aq-gst-toggle-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 0.75rem 1.1rem;
  gap: 0.4rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.aq-gst-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.aq-gst-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.9rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.aq-gst-btn.gst-active {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.aq-gst-btn.gst-inactive {
  background: #f8fafc;
  color: #64748b;
  border-color: #cbd5e1;
}

.aq-gst-btn:hover {
  transform: translateY(-1px);
}

/* Filters Bar */
.aq-filters-bar {
  display: flex;
  gap: 0.85rem;
  align-items: flex-end;
  flex-wrap: wrap;
  background: #ffffff;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.aq-filter-field {
  flex: 1;
  min-width: 170px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.aq-filter-field.search-field {
  min-width: 220px;
  flex: 1.5;
}

.aq-filter-field.date-group-field {
  min-width: 220px;
  flex: 1.2;
}

.aq-filter-field.clear-btn-field {
  flex: 0 0 auto;
  min-width: auto;
}

.aq-filter-field label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.aq-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.aq-input,
.aq-select {
  width: 100%;
  height: 38px;
  padding: 0 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.85rem;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;
}

.aq-input:focus,
.aq-select:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

.aq-clear-input {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.65rem;
  cursor: pointer;
  transition: all 0.15s;
}

.aq-clear-input:hover {
  background: #cbd5e1;
  color: #0f172a;
}

.aq-date-inputs {
  display: flex;
  gap: 0.5rem;
}

.aq-btn-reset {
  height: 38px;
  padding: 0 1rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.aq-btn-reset:hover {
  background: #fecaca;
  color: #991b1b;
  transform: translateY(-1px);
}

/* Content Body & Grid */
.aq-content-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.4rem;
  margin-top: 0.25rem;
  min-height: 240px;
}

.aq-content-body::-webkit-scrollbar {
  width: 6px;
}

.aq-content-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.aq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding-bottom: 0.5rem;
}

/* Card Design */
.aq-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  position: relative;
}

.aq-card:hover {
  transform: translateY(-4px);
  border-color: #38bdf8;
  box-shadow: 0 14px 28px -6px rgba(2, 132, 199, 0.15), 0 0 0 1px rgba(56, 189, 248, 0.2);
}

.aq-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.aq-quote-id {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: #0284c7;
  background: #f0f9ff;
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #e0f2fe;
}

.aq-quote-id i {
  font-size: 0.8rem;
}

/* Status Badges */
.aq-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
}

.aq-status-pill.status-approved {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.aq-status-pill.status-followup {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.aq-status-pill.status-pending {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.aq-status-pill.status-rejected {
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #fecdd3;
}

/* Card Main */
.aq-card-main {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
}

.aq-company-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  line-height: 1.35;
}

.aq-company-title i {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.aq-company-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.aq-card-amount-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  background: #f8fafc;
  padding: 0.45rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.aq-amount-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.aq-amount-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.aq-card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #64748b;
}

.aq-meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.aq-meta-item i {
  font-size: 0.75rem;
  color: #94a3b8;
  width: 14px;
}

/* Card Footer */
.aq-card-foot {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 0.6rem;
  border-top: 1px solid #f1f5f9;
}

.aq-view-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #0284c7;
  transition: gap 0.2s;
}

.aq-card:hover .aq-view-hint {
  gap: 0.55rem;
}

/* Card Action Buttons (Single customer popup) */
.aq-card-actions-foot {
  display: flex;
  gap: 0.4rem;
  padding-top: 0.6rem;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.aq-act-btn {
  flex: 1;
  min-width: 70px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.aq-act-btn.edit-btn {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}
.aq-act-btn.edit-btn:hover {
  background: #dbeafe;
}

.aq-act-btn.dup-btn {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}
.aq-act-btn.dup-btn:hover {
  background: #dcfce7;
}

.aq-act-btn.del-btn {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}
.aq-act-btn.del-btn:hover {
  background: #fee2e2;
}

/* Loading & Empty States */
.aq-loading-state,
.aq-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1rem;
  text-align: center;
  gap: 0.75rem;
}

.aq-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #e2e8f0;
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: aqSpin 0.7s linear infinite;
}

@keyframes aqSpin {
  to { transform: rotate(360deg); }
}

.aq-loading-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

.aq-empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: #94a3b8;
}

.aq-empty-state h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.aq-empty-state p {
  font-size: 0.85rem;
  color: #64748b;
  max-width: 380px;
  margin: 0;
}

.aq-btn-empty-reset {
  margin-top: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: #0284c7;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}

.aq-btn-empty-reset:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-card.awesome-quotation-modal {
    padding: 1.25rem 1rem;
    border-radius: 20px;
    width: 98%;
    max-height: 94vh;
  }

  .aq-modal-title {
    font-size: 1.2rem;
  }

  .aq-summary-banner {
    flex-direction: column;
  }

  .aq-summary-card {
    min-width: 100%;
  }

  .aq-filters-bar {
    padding: 0.85rem;
    gap: 0.65rem;
  }

  .aq-filter-field {
    min-width: 100%;
  }

  .aq-grid {
    grid-template-columns: 1fr;
  }
}



/* =========================================================
   PRO HIGH Z-INDEX MODAL BACKDROP (ALWAYS IN FRONT OF PO MODAL)
   ========================================================= */

.pro-modal-backdrop-top {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10500 !important;
  padding: 1.25rem;
  animation: proModalFadeIn 0.2s ease-out;
}

@keyframes proModalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card.pro-table-modal {
  background: #f8fafc;
  width: 95%;
  max-width: 1180px;
  max-height: 92vh;
  margin: 0 auto;
  border-radius: 20px;
  box-shadow: 0 30px 70px -15px rgba(15, 23, 42, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.9) inset;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  padding: 0;
  animation: proModalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10501 !important;
}

.modal-card.pro-table-modal.pro-modal-wide {
  max-width: 1320px;
}

@keyframes proModalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* =========================================================
   PRO MODAL HEADER STYLES (MATERIAL, VISITS, SERVICES)
   ========================================================= */

.pro-modal-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
  color: #ffffff;
  padding: 1.1rem 1.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 4px 15px rgba(2, 132, 199, 0.25);
  flex-shrink: 0;
}

/* Header Color Variants */
.pro-modal-header.header-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #4338ca 100%) !important;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.25) !important;
}

.pro-modal-header.header-emerald {
  background: linear-gradient(135deg, #059669 0%, #065f46 100%) !important;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.25) !important;
}

.pro-modal-header.header-indigo {
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%) !important;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25) !important;
}

.pro-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pro-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #ffffff;
  flex-shrink: 0;
}

.pro-header-icon.icon-cyan {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pro-header-icon.icon-purple {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pro-header-icon.icon-emerald {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pro-header-icon.icon-indigo {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pro-header-title-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.pro-modal-title {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.pro-status-pill {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
}

.pro-status-pill.pill-cyan {
  background: rgba(255, 255, 255, 0.25);
  color: #e0f2fe;
}

.pro-status-pill.pill-purple {
  background: rgba(255, 255, 255, 0.25);
  color: #ede9fe;
}

.pro-status-pill.pill-emerald {
  background: rgba(255, 255, 255, 0.25);
  color: #d1fae5;
}

.pro-status-pill.pill-indigo {
  background: rgba(255, 255, 255, 0.25);
  color: #e0e7ff;
}

.pro-company-subchip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #e0e7ff;
  margin-top: 0.15rem;
}

.pro-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pro-btn-header-action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 0.5rem 1.05rem;
  border-radius: 50px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  backdrop-filter: blur(4px);
}

.pro-btn-header-action:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.pro-btn-header-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-btn-header-close:hover {
  background: #ffffff;
  color: #0f172a;
  transform: rotate(90deg);
}

/* =========================================================
   FILTER TOOLBAR & CONTROLS
   ========================================================= */

.pro-filter-toolbar {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.95rem 1.75rem;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.pro-search-box {
  position: relative;
  flex: 2 1 280px;
}

.pro-search-icon {
  position: absolute;
  left: 0.95rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
  pointer-events: none;
}

.pro-search-input {
  width: 100%;
  height: 40px;
  padding: 0.5rem 2.2rem 0.5rem 2.5rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.86rem;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.pro-search-input:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
}

.pro-clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0;
  border: none;
  color: #64748b;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
}

.pro-clear-btn:hover {
  background: #cbd5e1;
  color: #0f172a;
}

.pro-filter-month-box {
  position: relative;
  flex: 1 1 190px;
}

.pro-month-icon {
  position: absolute;
  left: 0.95rem;
  top: 50%;
  transform: translateY(-50%);
  color: #0284c7;
  font-size: 0.85rem;
  pointer-events: none;
}

.pro-month-select {
  width: 100%;
  height: 40px;
  padding: 0.5rem 2rem 0.5rem 2.5rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.86rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.pro-month-select:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
}

/* =========================================================
   TABLE SCROLL & CELLS
   ========================================================= */

.pro-table-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.75rem 1.75rem 1.75rem;
}

.pro-styled-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.5rem;
}

.pro-styled-table thead th {
  background: #e2e8f0;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  border: none;
  white-space: nowrap;
}

.pro-styled-table thead tr th:first-child {
  border-radius: 8px 0 0 8px;
}

.pro-styled-table thead tr th:last-child {
  border-radius: 0 8px 8px 0;
}

.pro-table-row {
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.15s ease;
}

.pro-table-row:hover {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.pro-table-row td {
  padding: 0.85rem 1rem;
  vertical-align: middle;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.pro-table-row td:first-child {
  border-left: 1px solid #f1f5f9;
  border-radius: 10px 0 0 10px;
}

.pro-table-row td:last-child {
  border-right: 1px solid #f1f5f9;
  border-radius: 0 10px 10px 0;
}

/* Cell Badges & Components */
.pro-company-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.pro-cell-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.pro-cell-icon.bg-blue { background: #e0f2fe; color: #0284c7; }
.pro-cell-icon.bg-emerald { background: #dcfce7; color: #059669; }

.pro-company-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.pro-po-pill {
  display: inline-block;
  background: #f1f5f9;
  color: #1e293b;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
}

.pro-tag-pill {
  display: inline-block;
  background: #ede9fe;
  color: #6d28d9;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
}

.pro-text-sub {
  font-size: 0.84rem;
  color: #475569;
  font-weight: 500;
}

.pro-tracking-badge {
  display: inline-block;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}

.pro-delivered-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #f0fdf4;
  color: #15803d;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #86efac;
}

.pro-date-cell-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  max-width: 210px;
}

.pro-date-icon {
  position: absolute;
  left: 0.75rem;
  color: #0284c7;
  font-size: 0.8rem;
  pointer-events: none;
}

.pro-date-input {
  width: 100%;
  height: 36px;
  padding: 0.35rem 0.65rem 0.35rem 2.1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.pro-date-input:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
}

.pro-date-input-sm {
  width: 135px;
  height: 34px;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
  outline: none;
}

.pro-date-display,
.pro-user-display {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.pro-select-cell-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  max-width: 240px;
}

.pro-user-icon {
  position: absolute;
  left: 0.75rem;
  color: #64748b;
  font-size: 0.8rem;
  pointer-events: none;
}

.pro-assign-select {
  width: 100%;
  height: 36px;
  padding: 0.35rem 1.8rem 0.35rem 2.1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.pro-assign-select:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
}

.pro-status-select {
  height: 34px;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  outline: none;
  cursor: pointer;
}

.pro-status-select.st-awaiting {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.pro-status-select.st-dispatched {
  background: #e0f2fe;
  color: #0369a1;
  border-color: #bae6fd;
}

.pro-status-select.st-delivered {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

/* Report Buttons */
.pro-reports-wrap {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.pro-report-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #059669;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-report-btn:hover {
  background: #059669;
  color: #ffffff;
}

.pro-no-report-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
}

/* Empty State */
.pro-no-data-cell {
  padding: 3rem 1rem !important;
  text-align: center;
  background: #ffffff;
  border-radius: 12px !important;
  border: 1px dashed #cbd5e1 !important;
}

.pro-no-data-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
}

.pro-no-data-wrap i {
  font-size: 2.2rem;
  color: #cbd5e1;
}

.pro-no-data-wrap p {
  font-size: 0.92rem;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}



/* =========================================================
   CRM MAIN SCREEN & CUSTOMER TABLE (PROFESSIONAL ALIGNMENT)
   ========================================================= */

/* Hero Header */
.crm-hero-header {
  background: #ffffff;
  border-radius: 20px;
  padding: 1.75rem 2rem;
  margin-bottom: 1.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.crm-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.crm-hero-title-area {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.crm-eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #0284c7;
  background: #e0f2fe;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  width: fit-content;
}

.crm-main-heading {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.crm-sub-heading {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* Header Action Buttons */
.crm-header-action-group {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.crm-btn-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  text-decoration: none;
  white-space: nowrap;
}

.crm-btn-primary {
  background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}

.crm-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
}

.crm-btn-secondary {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.crm-btn-secondary:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.crm-btn-outline {
  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.crm-btn-outline:hover {
  background: #f8fafc;
  border-color: #0284c7;
  color: #0284c7;
}

/* 4-Column Stats Grid */
.crm-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.crm-stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.15s ease;
}

.crm-stat-card:hover {
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
  transform: translateY(-1px);
}

.crm-stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.crm-stat-card.card-blue .crm-stat-icon-wrap { background: #e0f2fe; color: #0284c7; }
.crm-stat-card.card-amber .crm-stat-icon-wrap { background: #fef3c7; color: #d97706; }
.crm-stat-card.card-purple .crm-stat-icon-wrap { background: #ede9fe; color: #7c3aed; }
.crm-stat-card.card-emerald .crm-stat-icon-wrap { background: #dcfce7; color: #059669; }

.crm-stat-content {
  display: flex;
  flex-direction: column;
}

.crm-stat-count {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.crm-stat-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 0.2rem;
}

/* Search Bar Wrap */
.crm-search-bar-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.crm-search-input-box {
  position: relative;
  flex: 1;
  max-width: 620px;
}

.crm-search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
  pointer-events: none;
}

.crm-search-input {
  width: 100%;
  height: 44px;
  padding: 0.5rem 2.5rem 0.5rem 2.75rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.crm-search-input:focus {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

.crm-search-clear {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1rem;
  cursor: pointer;
}

.crm-search-clear:hover {
  color: #0f172a;
}

.crm-search-summary-pill {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
}

/* =========================================================
   MAIN CUSTOMER TABLE CARD
   ========================================================= */

.crm-table-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
}

.crm-table-responsive {
  width: 100%;
  overflow-x: auto;
}

.crm-customer-table {
  width: 100%;
  border-collapse: collapse;
}

.crm-customer-table thead th {
  background: #f8fafc;
  color: #475569;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 1rem 1.35rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.crm-table-row {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.12s ease;
}

.crm-table-row:hover {
  background: #f8fafc;
}

.crm-table-row td {
  padding: 1rem 1.35rem;
  vertical-align: middle;
}

.crm-sr-badge {
  display: inline-block;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

.crm-company-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.crm-company-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.crm-company-link {
  font-size: 0.94rem;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
  transition: color 0.15s ease;
}

.crm-company-link:hover {
  color: #0284c7;
  text-decoration: underline;
}

.crm-cust-no-badge {
  display: inline-block;
  background: #eff6ff;
  color: #1d4ed8;
  font-family: monospace;
  font-size: 0.84rem;
  font-weight: 800;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #dbeafe;
}

/* Quick Action Buttons Group */
.crm-action-buttons-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.crm-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.crm-action-btn.btn-view-po {
  background: #eff6ff;
  color: #0284c7;
  border: 1px solid #bae6fd;
}

.crm-action-btn.btn-view-po:hover {
  background: #0284c7;
  color: #ffffff;
}

.crm-action-btn.btn-quotation {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.crm-action-btn.btn-quotation:hover {
  background: #d97706;
  color: #ffffff;
}

.crm-action-btn.btn-report {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.crm-action-btn.btn-report:hover {
  background: #059669;
  color: #ffffff;
}

/* Responsive */
@media (max-width: 900px) {
  .crm-hero-top {
    flex-direction: column;
  }

  .crm-header-action-group {
    width: 100%;
  }

  .crm-btn-pill {
    flex: 1;
    justify-content: center;
  }
}

/* =========================================================
   AWESOME QUOTATION MODALS (TOP Z-INDEX FOR CREATE/EDIT FRONT)
   ========================================================= */
.modal-card.awesome-quotation-modal {
  max-width: 1200px;
  width: 95%;
  max-height: 90vh;
  background: #f8fafc;
  border-radius: 24px;
  box-shadow: 0 30px 70px -15px rgba(15, 23, 42, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.9) inset;
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow: hidden !important;
  animation: aqModalSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10501 !important;
}

.modal-card.medium {
  z-index: 10601 !important;
}
</style>
