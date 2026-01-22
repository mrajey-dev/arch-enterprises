<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
   <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;  border-radius: 9px;"
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

<!-- Customer Table -->
 <div
    class="content"
    :class="{ 'hide-content': isMobile && isSidebarVisible }"
  >
  <!-- <h2>Customers & PO</h2> -->
<div class="search-bar">
  <!-- Search Input -->
  <div class="search-container" :class="{ active: searchFocused || searchQuery }">
    <i class="fas fa-search search-icon"></i>
    <input
      type="text"
      v-model="searchQuery"
      @focus="searchFocused = true"
      @blur="searchFocused = false"
      placeholder="Search by Customer No or Company Name..."
      class="search-input"
    />
  </div>

  <!-- Assign PO Button -->
 <div class="button-row" style="display: flex; gap: 10px;">
  <button class="assign-btn" @click="openAssignPoForm">
    <!-- View & Assign PO in {{ currentMonth }} 2025 -->
     Manage PO
  </button>
 <button class="assign-btn" @click="showViewAllQuotationPopup=true">
  View All Quotations
</button>

   <button class="assign-btn "@click="goTo('employee/followup')">
    Follow Up
  </button>
   <button class="assign-btn "@click="goTo('employee/amcrecord')">
    AMC Record Data
  </button>
   <!-- <button class="assign-btn "@click="goTo('employee/viewallpo')">
    Purchase Order
  </button> -->

                      <button class="assign-btn tooltip-btn"  data-tooltip="Add new customer" style="font-weight: 800;" @click="openRegisterForm()">✚ NEW</button>


  <!-- <button class="view-all-btn" @click="viewAllPo">
    View All PO
  </button> -->
</div>

  
</div>

<!-- Quotation Modal -->
<div v-if="showQuotation" class="quotation-backdrop">
  <div class="quotation-modal">
<div class="quotation-header">
     <h2 style="color: white;">{{ isEdit ? "✏ Edit Quotation" : "✨ Create New Quotation" }}</h2>
   <div class="quotation-header-actions">
        <button
  class="quotation-btn-secondary"
  @click="openViewQuotationPopup(form.company_name)"
>
  📄 View Quotations
</button>

       <button class="btn btn-dark" @click="showQuotation = false; refreshForm();">
  ⬅ Back
</button>

      </div>
      </div>


<!-- FOLLOW UP POPUP -->
<div v-if="showFollowUpPopup" class="quotation-backdrop">
  <div class="quotation-modal" style="max-width: 95%;">

   <div class="fullscreen-page">

    <!-- HEADER -->
    <div class="quotation-header">
      <h2 style="color:white;">📊 Quotation & Order Sheet</h2>
      <button class="quotation-btn-close" @click="$router.back()">⬅ Back</button>
    </div>

    <!-- TABLE -->
    <div class="quotation-section-card" style="overflow-x:auto;">
      <table class="styled-customer-table">
        <thead>
  <tr>
    <th> Sr. No. </th>
    <th> QUOTATION NO. </th>
    <th> Quote Date </th>
    <th> Party Name </th>
    <th> Engine Serial Number </th>
    <th> Brief Description of Goods </th>
    <th> Initial Value (Non-Taxable) </th>
    <th> Disc.(%) </th>
    <th> Recommended By</th>
    <th> Remarks </th>
    <th> Status of Quotation </th>
  </tr>
</thead>


        <div v-if="quotationList.length > 0" class="cards-container">
</div>

    <tbody>
  <tr
    v-for="(q, index) in followUpQuotations"
    :key="q.id"
    :class="{
      'approved-row': q.status === 'approved',
      'pending-row': q.status === 'pending',
      'rejected-row': q.status === 'rejected',
      'followup-row': q.status === 'followup',
    }"
  >
    <!-- SR NO -->
    <td>{{ index + 1 }}</td>

    <td>AE/QUOTE/{{ financialYear }}/{{ q.id }}</td>
    <td>{{ formatDate(q.quote_date) }}</td>
    <td>{{ q.company_name }}</td>
    <td>{{ q.engine_serial }}</td>
    <td>{{ q.brief_description }}</td>

    <td>
      {{ calculateInitialValue(q.items).toLocaleString('en-IN') }}
    </td>

    <td>
      <span v-if="Number(q.discount) === 0">No Discount</span>
      <span v-else>{{ getDiscountPercent(q.items) }}%</span>
    </td>

    <td>{{ q.recommended_by }}</td>

    <!-- REMARKS -->
    <td>
      <textarea
        v-model="q.remarks"
        placeholder="Enter remarks"
        class="table-input"
        rows="2"
      ></textarea>
    </td>

    <!-- STATUS -->
    <td>
      <select
        v-model="q.status"
        class="table-input"
        @change="updateQuotationStatus(q)"
      >
        <option value="">Select</option>
        <option value="pending">Pending</option>
        <option value="followup">Follow Up</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </td>
  </tr>

  <tr v-if="followUpQuotations.length === 0">
    <td colspan="12" style="text-align:center;">No records found</td>
  </tr>
</tbody>


      </table>
    </div>
</div>
  </div>
</div>


    <!-- BASIC INFO -->
    <div class="quotation-section-card">
      <h3 class="quotation-section-title"></h3>
      <div class="quotation-grid">
         <div class="quotation-form-group">
  <label>Company</label>
  <div class="readonly-field" style="font-weight: 700;
">
    {{ form.company_name }}
  </div>
</div>
<div class="quotation-form-group">
  <label style="display:flex; justify-content:space-between; align-items:center;">
    <span>Shipping Address (Optional)</span>

    
  </label>

  <textarea
    v-model="form.shipping_address"
    rows="3"
    placeholder="Enter shipping address if different from company address"
  ></textarea>
  <button
      type="button"
      class="save-shipp-address"
      style="padding:4px 10px; font-size:12px;"
      @click="updateShippingAddress"
    >
      🔄 Update Address
    </button>
</div>


        <div class="quotation-form-group">
          <label>Nature of Sale *</label>
          <select v-model="form.nature_of_sale">
            <option value="">Select Nature</option>
            <option value="Intrastate">Intrastate</option>
            <option value="Interstate">Interstate</option>
            <option value="Export">Export</option>
          </select>
           <div v-if="!form.nature_of_sale" class="error-message">
    ⚠ Nature of Sale is required
  </div>
        </div>

        <div class="quotation-form-group" v-if="form.nature_of_sale === 'Export'">
          <label>Select Currency</label>
          <select v-model="form.currency">
  <option value="">Select Currency</option>

  <option value="AED">AED – United Arab Emirates Dirham</option>
  <option value="AFN">AFN – Afghan Afghani</option>
  <option value="ALL">ALL – Albanian Lek</option>
  <option value="AMD">AMD – Armenian Dram</option>
  <option value="ANG">ANG – Netherlands Antillean Guilder</option>
  <option value="AOA">AOA – Angolan Kwanza</option>
  <option value="ARS">ARS – Argentine Peso</option>
  <option value="AUD">AUD – Australian Dollar</option>
  <option value="AWG">AWG – Aruban Florin</option>
  <option value="AZN">AZN – Azerbaijani Manat</option>

  <option value="BAM">BAM – Bosnia-Herzegovina Convertible Mark</option>
  <option value="BBD">BBD – Barbadian Dollar</option>
  <option value="BDT">BDT – Bangladeshi Taka</option>
  <option value="BGN">BGN – Bulgarian Lev</option>
  <option value="BHD">BHD – Bahraini Dinar</option>
  <option value="BIF">BIF – Burundian Franc</option>
  <option value="BMD">BMD – Bermudian Dollar</option>
  <option value="BND">BND – Brunei Dollar</option>
  <option value="BOB">BOB – Bolivian Boliviano</option>
  <option value="BRL">BRL – Brazilian Real</option>
  <option value="BSD">BSD – Bahamian Dollar</option>
  <option value="BTN">BTN – Bhutanese Ngultrum</option>
  <option value="BWP">BWP – Botswana Pula</option>
  <option value="BYN">BYN – Belarusian Ruble</option>
  <option value="BZD">BZD – Belize Dollar</option>

  <option value="CAD">CAD – Canadian Dollar</option>
  <option value="CDF">CDF – Congolese Franc</option>
  <option value="CHF">CHF – Swiss Franc</option>
  <option value="CLP">CLP – Chilean Peso</option>
  <option value="CNY">CNY – Chinese Yuan</option>
  <option value="COP">COP – Colombian Peso</option>
  <option value="CRC">CRC – Costa Rican Colón</option>
  <option value="CUP">CUP – Cuban Peso</option>
  <option value="CVE">CVE – Cape Verdean Escudo</option>
  <option value="CZK">CZK – Czech Koruna</option>

  <option value="DJF">DJF – Djiboutian Franc</option>
  <option value="DKK">DKK – Danish Krone</option>
  <option value="DOP">DOP – Dominican Peso</option>
  <option value="DZD">DZD – Algerian Dinar</option>

  <option value="EGP">EGP – Egyptian Pound</option>
  <option value="ERN">ERN – Eritrean Nakfa</option>
  <option value="ETB">ETB – Ethiopian Birr</option>
  <option value="EUR">EUR – Euro</option>

  <option value="FJD">FJD – Fijian Dollar</option>
  <option value="FKP">FKP – Falkland Islands Pound</option>

  <option value="GBP">GBP – British Pound Sterling</option>
  <option value="GEL">GEL – Georgian Lari</option>
  <option value="GHS">GHS – Ghanaian Cedi</option>
  <option value="GIP">GIP – Gibraltar Pound</option>
  <option value="GMD">GMD – Gambian Dalasi</option>
  <option value="GNF">GNF – Guinean Franc</option>
  <option value="GTQ">GTQ – Guatemalan Quetzal</option>
  <option value="GYD">GYD – Guyanese Dollar</option>

  <option value="HKD">HKD – Hong Kong Dollar</option>
  <option value="HNL">HNL – Honduran Lempira</option>
  <option value="HRK">HRK – Croatian Kuna</option>
  <option value="HTG">HTG – Haitian Gourde</option>
  <option value="HUF">HUF – Hungarian Forint</option>

  <option value="IDR">IDR – Indonesian Rupiah</option>
  <option value="ILS">ILS – Israeli New Shekel</option>
  <option value="INR">INR – Indian Rupee</option>
  <option value="IQD">IQD – Iraqi Dinar</option>
  <option value="IRR">IRR – Iranian Rial</option>
  <option value="ISK">ISK – Icelandic Krona</option>

  <option value="JMD">JMD – Jamaican Dollar</option>
  <option value="JPY">JPY – Japanese Yen</option>
  <option value="JOD">JOD – Jordanian Dinar</option>

  <option value="KES">KES – Kenyan Shilling</option>
  <option value="KRW">KRW – South Korean Won</option>
  <option value="KWD">KWD – Kuwaiti Dinar</option>
  <option value="KZT">KZT – Kazakhstani Tenge</option>

  <option value="LAK">LAK – Lao Kip</option>
  <option value="LBP">LBP – Lebanese Pound</option>
  <option value="LKR">LKR – Sri Lankan Rupee</option>
  <option value="LRD">LRD – Liberian Dollar</option>
  <option value="LYD">LYD – Libyan Dinar</option>

  <option value="MAD">MAD – Moroccan Dirham</option>
  <option value="MXN">MXN – Mexican Peso</option>
  <option value="MYR">MYR – Malaysian Ringgit</option>

  <option value="NGN">NGN – Nigerian Naira</option>
  <option value="NOK">NOK – Norwegian Krone</option>
  <option value="NPR">NPR – Nepalese Rupee</option>
  <option value="NZD">NZD – New Zealand Dollar</option>

  <option value="OMR">OMR – Omani Rial</option>

  <option value="PHP">PHP – Philippine Peso</option>
  <option value="PKR">PKR – Pakistani Rupee</option>
  <option value="PLN">PLN – Polish Złoty</option>

  <option value="QAR">QAR – Qatar</option>

  <option value="RON">RON – Romanian Leu</option>
  <option value="RUB">RUB – Russian Ruble</option>
  <option value="RWF">RWF – Rwandan Franc</option>

  <option value="SAR">SAR – Saudi Riyal</option>
  <option value="SEK">SEK – Swedish Krona</option>
  <option value="SGD">SGD – Singapore Dollar</option>
  <option value="THB">THB – Thai Baht</option>
  <option value="TRY">TRY – Turkish Lira</option>
  <option value="TZS">TZS – Tanzanian Shilling</option>

  <option value="UAH">UAH – Ukrainian Hryvnia</option>
  <option value="USD">USD – United States Dollar</option>
  <option value="UYU">UYU – Uruguayan Peso</option>

  <option value="VND">VND – Vietnamese Dong</option>

  <option value="ZAR">ZAR – South African Rand</option>
  <option value="ZMW">ZMW – Zambian Kwacha</option>
</select>

        </div>

      


        <div class="quotation-form-group">
          <label>Recommended By</label>
          <select v-model="form.recommended_by">
            <option value="">Select Name</option>
            <option v-for="user in users" :key="user.id" :value="user.name">
              {{ user.name }}
            </option>
          </select>
        </div>
        <div class="quotation-form-group">
  <label>Created By</label>
  <input
    type="text"
    v-model="form.created_by"
    disabled
    class="readonly-field"
  />
</div>


        <div class="quotation-form-group">
          <label>Customer Reference</label>
          <input v-model="form.customer_reference" type="text" placeholder="Enter reference" />
        </div>
      </div>
    </div>

    <!-- ENGINE & TERMS -->
    <div class="quotation-section-card">
      <h3 class="quotation-section-title">⚙️ Engine & Terms</h3>
      <div class="quotation-grid">
        <div class="quotation-form-group">
          <label>Engine Serial No</label>
          <input v-model="form.engine_serial" type="text" />
        </div>
        <div class="quotation-form-group">
          <label>Model No</label>
          <input v-model="form.model_no" type="text" />
        </div>
        <div class="quotation-form-group">
          <label>Delivery</label>
          <input v-model="form.delivery" placeholder="EX Works, Freight Prepaid" />
        </div>
        <div class="quotation-form-group">
          <label>Payment Terms</label>
          <input v-model="form.payment_terms" placeholder="e.g., 50% Advance, 50% on Delivery"/>
        </div>
      </div>
    </div>

    <!-- ITEMS -->
  <!-- ITEMS -->
<!-- ITEMS -->
<div class="quotation-section-card">
  <h3 class="quotation-section-title">📦 Item Details</h3>

  <div v-for="(item, index) in form.items" :key="index" class="quotation-item-box">

    <!-- ITEM HEADER -->
    <div class="quotation-item-header">
      <h4>Item {{ index + 1 }}</h4>
      <button class="quotation-remove-btn" @click="removeItem(index)">✖</button>
    </div>

    <div class="quotation-grid">

      <!-- DESCRIPTION -->
      <div class="quotation-form-group">
        <label>Description of Goods *</label>
        <textarea
          v-model="item.description"
          rows="2"
          :class="{ 'input-error': !item.description }"
        ></textarea>
        <span v-if="!item.description" class="error-message">Required</span>
      </div>

      <!-- HSN -->
      <div class="quotation-form-group">
        <label>HSN / SAC Code *</label>
        <input
          v-model="item.hsn"
          type="number"
          :class="{ 'input-error': !item.hsn }"
        />
        <span v-if="!item.hsn" class="error-message">Required</span>
      </div>

      <!-- QTY -->
      <div class="quotation-form-group">
        <label>QTY *</label>
        <input
          v-model="item.qty"
          type="number"
          :class="{ 'input-error': !item.qty }"
        />
        <span v-if="!item.qty" class="error-message">Required</span>
      </div>

      <!-- UOM -->
      <div class="quotation-form-group">
        <label>UOM *</label>
        <select v-model="item.uom" :class="{ 'input-error': !item.uom }">
          <option value="">Select UOM</option>
          <option value="Lit.">Lit.</option>
          <option value="NOS.">NOS.</option>
          <option value="Box">Box</option>
          <option value="Set">Set</option>
          <option value="K.G.">K.G.</option>
          <option value="Day">Day</option>
        </select>
        <span v-if="!item.uom" class="error-message">Required</span>
      </div>

      <!-- RATE -->
      <div class="quotation-form-group">
        <label>Rate *</label>
        <input
          v-model="item.rate"
          type="number"
          :class="{ 'input-error': !item.rate }"
        />
        <span v-if="!item.rate" class="error-message">Required</span>
      </div>

      <!-- DISCOUNT -->
      <div class="quotation-form-group">
        <label>Disc. (%)</label>
        <input v-model="item.discount" type="number" />
      </div>

      <!-- GST SECTION (ITEM LEVEL) -->
      <template v-if="form.nature_of_sale === 'Intrastate'">
        <div class="quotation-form-group">
          <label>CGST (%)</label>
          <input v-model="item.cgst_rate" type="number" />
        </div>
        <div class="quotation-form-group">
          <label>SGST (%)</label>
          <input v-model="item.sgst_rate" type="number" />
        </div>
      </template>

      <template v-if="form.nature_of_sale === 'Interstate'">
        <div class="quotation-form-group">
          <label>IGST (%)</label>
          <input v-model="item.igst_rate" type="number" />
        </div>
      </template>

      <template v-if="form.nature_of_sale === 'Export'">
        <div class="quotation-export-note">
          🌍 GST Not Applicable for Export
        </div>
      </template>
<!-- LINE TOTAL -->
<div class="quotation-form-group">
  <label>Item Total</label>
  <div class="readonly-field" style="font-weight: 700;">
    {{ (item.qty * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
  </div>
</div>
    </div>
  </div>

  <button class="quotation-add-btn" @click="addItem">+ Add Item</button>
</div>



    <!-- TERMS & CONDITIONS -->
    <div class="quotation-section-card">
      <h3 class="quotation-section-title">📜 Terms & Conditions</h3>
      <textarea v-model="form.terms_conditions" rows="6"></textarea>
    </div>

    <!-- SUBMIT -->
   <button class="quotation-submit-btn" @click="submitQuotation">
  {{ isEdit ? "💾 Update Quotation" : "💾 Save Quotation" }}
</button>

  </div>
</div>




<!-- Popup Modal -->
<div v-if="showAssignPoModal" class="modal-backdrop">
  
  <div class="modal-card large">
      <div style="text-align:center;margin-bottom: -4%;display: flex;">
      <button class="btn btn-dark" @click="showAssignPoModal = false">
        ⬅ Back
      </button>
    </div>
    <!-- Close button --><h2> Manage PO & Visits</h2>
  
    <!-- Center Buttons Row -->
<div
  style="display: flex; justify-content: center; gap: 20px; margin: 15px 0 25px 0;"
>
  <button class="amc-ord"
   
    @click="openVisitPopup"
  >
    AMC
  </button>

  <button class="service-ord"
   
    @click="openServicePopup"
  >
    Service Orders
  </button>

  <button class="material-del"
    @click="openSupplyPopup"
  >
    Material Supply
  </button>
</div>


  </div>
</div>
<tbody v-if="isLoadingCustomers">
  <tr>
    <td colspan="4" class="loader-cell">
      <div class="table-loader"></div>
      <span>Loading customers...</span>
    </td>
  </tr>
</tbody>


<table v-else class="styled-customer-table user-table">
  <thead>
    <tr>
      <th>Sr.No.</th>
      <th>Company</th>
      <th>Cust No</th>
      <th>Action</th>
    </tr>
  </thead>


  <tbody >
  <tr v-for="(cust, index) in filteredCustomers" :key="cust.id">
      <td  style="color: var(--text)">{{ index + 1 }}</td>

<td>
  <a
    href="#"
    class="company-link tooltip-link"
    data-tooltip="View customer & add PO"
    @click.prevent="viewCustomerDetails(cust)"
  >
    {{ formatCompanyName(cust.company_name) }}
  </a>
</td>



      <td style="color: var(--text);">{{ formatNumber(cust.id) }}</td>

     <td class="action-btns">
  <button class="tooltip-btn btn-view-po"
    data-tooltip="View Purchase Order"
    @click="openviewPoModal(cust.company_name)">
    View PO
  </button>

<button
  class="tooltip-btn btn-followup"
  data-tooltip="Create Quotation"
  @click="openQuotationlist(cust)"
>
  Quotation
</button>

<button
  class="tooltip-btn btn-followup"
  data-tooltip="View Report"
  @click="openWelcomeModal(cust.company_name)"
>
  Reports
</button>


</td>

    </tr>
  </tbody>
</table>



</div>

<div v-if="showWelcomeModal" class="modal-backdrop">
  <div class="modal-card">

    <!-- Header -->
    <div class="modal-header" style="float: right;">
      
      <button class="btn btn-dark" @click="closeWelcomeModal"> ⬅ Back</button>
      
    </div>

    <!-- Body -->
 <div class="modal-body">
  <h3>
     <strong>{{ selectedCompany }}</strong> reports
  </h3>

  <table class="report-table" v-if="allReports.length">
    <thead>
      <tr>
        <th>Type</th>
        <th>Report uploaded date</th>
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


        <td>{{ new Date(item.updated_at).toLocaleString() }}</td>

        <td>
  <div v-if="item.report_path">
    <button
      v-for="(path, idx) in item.report_path.split(',')"
      :key="idx"
      class="view-btn"
      @click="openReport(path)"
      style="margin-right:5px;"
    >
      Report {{ idx + 1 }}
    </button>
  </div>

  <span v-else style="color:#999;font-size:13px;">
    Not Available
  </span>
</td>


      </tr>
    </tbody>
  </table>

  <p v-else>No reports found.</p>
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
 
<!-- VISIT ORDERS POPUP -->
<div v-if="showVisitPopup" class="modal-backdrop">
  <div class="modal-card large">

    <!-- TOP BUTTON ROW -->
    <div style="display:flex; justify-content: flex-start; gap: 7px; justify-content: space-between; align-items:center; margin-bottom:-4%;">
      
      <button 
        class="btn btn-dark" 
        @click="showVisitPopup = false"
      >
        ⬅ Back
      </button>

     <button class="amc-ord"
  @click="openAssignedVisits"
>
  Completed Visits
</button>

    </div>

    <h2>AMC Pending & Assigned Visits</h2>
<!-- FILTER BAR -->
<div class="filter-bar">
  <!-- Search -->
  <input
    type="text"
    v-model="filters.search"
    placeholder="Search Company / PO Number"
    class="filter-input"
  />

<!-- Month Filter -->
<select v-model="filters.month" class="filter-select">
  <option :value="null">All Months</option>
  <option
    v-for="(m, index) in months"
    :key="index"
    :value="index + 1"
  >
    {{ m }}
  </option>
</select>


</div>


    <!-- Visit Table -->
   <table class="styled-table">
  <thead>
    <tr>
      <th>Company Name</th>
      <!-- <th>PO Number</th> -->
      <th>Visit Date</th>
      <th>Assign To</th>
      <!-- <th>Status</th> -->
    </tr>
  </thead>

  <!-- DATA ROWS -->
  <tbody v-if="visit_assign.length">
  <tr
  v-for="(visit, index) in filteredVisits"
  :key="`${visit.company_name}-${visit.visit_date}-${index}`"
>

    <td>{{ visit.company_name }}</td>
    <!-- <td>{{ visit.po_number }}</td> -->
  <td>
    <input
      type="date"
      v-model="visit.visit_date"
      class="date-input"
      :placeholder="'Select date'"
      @change="updateAmcVisitDate(visit)"
    />
  </td>



    <td>
    <select v-model.number="visit.assign_to" @change="assignVisit(visit)">
      <option disabled value="">-- Select Employee --</option>
      <option v-for="emp in employees" :key="emp.id" :value="emp.id">
        {{ emp.name }}
      </option>
    </select>
  </td>


    <!-- <td>{{ visit.status }}</td> -->
  </tr>
</tbody>


  <!-- NO DATA MESSAGE -->
  <tbody v-else>
    <tr>
      <td colspan="5" class="no-data">
        No visit assignments found
      </td>
    </tr>
  </tbody>
</table>

  </div>
</div>


<!-- Assigned Visits Popup -->
<div v-if="showVisitsPopup" class="modal-backdrop">
  <div class="modal-card large">

    <!-- Close Button (same as Services popup) -->
    <div
      style="display:flex; justify-content:space-between; align-items:center; margin-bottom:-4%;"
    >
      <button 
        class="btn btn-dark" 
        @click="showVisitsPopup = false"
      >
        ⬅ Back
      </button>
    </div>

    <h2>Completed Visits</h2>
<!-- FILTER BAR -->
<div class="filter-bar">
  <!-- Search -->
  <input
    type="text"
    v-model="completedFilters.search"
    placeholder="Search Company / PO Number"
    class="filter-input"
  />

  <!-- Month Filter -->
  <select v-model="completedFilters.month" class="filter-select">
    <option value="">All Months</option>
    <option
      v-for="(m, index) in months"
      :key="index"
      :value="index + 1"
    >
      {{ m }}
    </option>
  </select>

  <!-- Clear -->
 
</div>

    <!-- Table (same style as styled-table) -->
   <table class="styled-table">
  <thead>
    <tr>
      <th>Company Name</th>
      <!-- <th>PO Number</th> -->
      <th>Visit Date</th>
      <th>Assigned To</th>
      <!-- <th>Status</th> -->
      <th>View Report</th>
    </tr>
  </thead>

  <!-- DATA -->
  <tbody v-if="completedVisits.length">
    <tr v-for="row in filteredCompletedVisits" :key="row.id">

      <td>{{ row.company_name }}</td>
      <!-- <td>{{ row.po_number }}</td> -->
      <td>{{ row.visit_date }}</td>
      <td>{{ getUserName(row.assign_to) }}</td>


      <!-- <td>
        <span class="completed-btn">Completed</span>
      </td> -->

     <td>
  <div v-if="row.report_path && row.report_path.trim() !== ''">
    <button
      v-for="(path, idx) in row.report_path.split(',')"
      :key="idx"
      class="view-report-btn"
      @click="viewReport(path)"
      style="margin-right: 5px;"
    >
      Report {{ idx + 1 }}
    </button>
  </div>
  <span v-else>No Report</span>
</td>

    </tr>
  </tbody>

  <!-- NO DATA -->
  <tbody v-else>
    <tr>
      <td colspan="6" class="no-data">
        No completed visits found
      </td>
    </tr>
  </tbody>
</table>



  </div>
</div>


<!-- SERVICE ORDERS POPUP -->
<div v-if="showServicePopup" class="modal-backdrop">
  <div class="modal-card large">
    <div style="display:flex; justify-content: flex-start; gap: 7px; justify-content: space-between; align-items:center; margin-bottom:-4%;">
      
      <button 
        class="btn btn-dark" 
        @click="showServicePopup = false"
      >
        ⬅ Back
      </button>

      <button class="service-ord"
  @click="openAssignedServicePopup"
>
  Completed Services
</button>

      </div>
    <h2>Pending & Assign Service Orders</h2>
<!-- FILTER BAR -->
<div class="filter-bar">
  <!-- Search -->
  <input
    type="text"
    v-model="serviceFilters.search"
    placeholder="Search Company / PO Number"
    class="filter-input"
  />

  <!-- Month Filter -->
  <select v-model="serviceFilters.month" class="filter-select">
    <option value="">All Months</option>
    <option
      v-for="(m, index) in months"
      :key="index"
      :value="index + 1"
    >
      {{ m }}
    </option>
  </select>

  <!-- Clear -->

</div>

  <table class="styled-table">
  <thead>
    <tr>
      <th>Company Name</th>
      <!-- <th>PO Number</th> -->
      <!-- <th>PO Date</th> -->
      <th>Visit Date</th>
      <th>Type</th>
      <th>Assign To</th>
      <!-- <th>Status</th> -->
    </tr>
  </thead>

  <!-- DATA ROWS -->
  <tbody v-if="filteredServicePoList.length">
    <tr v-for="order in filteredServicePoList" :key="order.id">
      <td>{{ order.company_name }}</td>
      <!-- <td>{{ order.po_number }}</td> -->
      <!-- <td>{{ order.date }}</td> -->
<td>
  <input
    type="date"
    class="date-input"
    v-model="order.service_date"
    @change="updateServiceDate(order)"
  />
</td>





      <td>{{ order.type_of_service }}</td>

  

       <td>
  <select
  v-model="order.assign_to"
  @change="onAssignChange(order)"
>
  <option disabled value="">-- Select Employee --</option>
  <option
    v-for="emp in employees"
    :key="emp.id"
    :value="emp.id"
  >
    {{ emp.name }}
  </option>
</select>

    </td>

      <!-- <td>
        <span class="pending-btn">Pending</span>
      </td> -->
    </tr>
  </tbody>

  <!-- NO DATA MESSAGE -->
  <tbody v-else>
    <tr>
      <td colspan="7" class="no-data">
        No service PO records found
      </td>
    </tr>
  </tbody>
</table>

    <!-- <pre>{{ filteredServicePoList }}</pre> -->
  </div>
</div>
<!-- ASSIGNED SERVICES POPUP -->
<div v-if="showAssignedServicePopup" class="modal-backdrop">
  <div class="modal-card large">

    <div style="display:flex; align-items:center; margin-bottom:-4%;">
      
      <button 
        class="btn btn-dark" 
        @click="showAssignedServicePopup = false"
      >
        ⬅ Back
      </button>

    </div>

    <h2>Completed Service Orders</h2>
<!-- FILTER BAR -->
<div class="filter-bar">
  <!-- Search -->
  <input
    type="text"
    v-model="assignedServiceFilters.search"
    placeholder="Search Company / PO Number"
    class="filter-input"
  />

  <!-- Month Filter -->
  <select v-model="assignedServiceFilters.month" class="filter-select">
    <option value="">All Months</option>
    <option
      v-for="(m, index) in months"
      :key="index"
      :value="index + 1"
    >
      {{ m }}
    </option>
  </select>



  <!-- Clear -->

</div>

   <table class="styled-table">
  <thead>
    <tr>
      <th>Company Name</th>
      <!-- <th>PO Number</th> -->
      <th>Visit Date</th>
      <th>Type</th>
      <th>Assigned To</th>
      <!-- <th>Status</th> -->
      <th>View Report</th>
    </tr>
  </thead>

  <!-- DATA ROWS -->
  <tbody v-if="assignedServiceList.length">
    <tr v-for="item in filteredAssignedServiceList" :key="item.id">

      <td>{{ item.company_name }}</td>
      <!-- <td>{{ item.po_number }}</td> -->
      <td>{{ item.visit_date }}</td>
      <td>{{ item.type_of_service }}</td>
      <td>{{ item.assign_to }}</td>

      <!-- <td>
        <span v-if="item.status === 'Completed'" class="completed-btn">
          Completed
        </span>
        <span v-else class="pending-btn">
          Pending
        </span>
      </td> -->

      <td>
  <div v-if="item.report_path && item.report_path.trim() !== ''">
    <button
      v-for="(path, idx) in item.report_path.split(',')"
      :key="idx"
      class="view-report-btn"
      @click="viewReport(path)"
      style="margin-right:5px;"
    >
      Report {{ idx + 1 }}
    </button>
  </div>
  <span v-else>No Report</span>
</td>

    </tr>
  </tbody>

  <!-- NO DATA MESSAGE -->
  <tbody v-else>
    <tr>
      <td colspan="7" class="no-data">
        No assigned service records found
      </td>
    </tr>
  </tbody>
</table>


  </div>
</div>


<!-- MATERIAL SUPPLY POPUP -->
<div v-if="showSupplyPopup" class="modal-backdrop">
  <div class="modal-card large">
   <div style="display:flex; justify-content: flex-start; gap: 7px;justify-content: space-between; align-items:center; margin-bottom:-4%;">
      
      <button  
        class="btn btn-dark" 
        @click="showSupplyPopup = false"
      >
        ⬅ Back
      </button>

      <button class="material-del"
  @click="openDeliveredPopup"
>
  Material Delivered
</button>

      </div>
    <h2>Material Supply</h2>
    <!-- FILTER BAR -->
<div class="filter-bar">
  <!-- Search -->
  <input
    type="text"
    v-model="supplyFilters.search"
    placeholder="Search Company / PO Number"
    class="filter-input"
  />

  <!-- Month Filter -->
  <select v-model="supplyFilters.month" class="filter-select">
    <option value="">All Months</option>
    <option
      v-for="(m, index) in months"
      :key="index"
      :value="index + 1"
    >
      {{ m }}
    </option>
  </select>


</div>

<table class="styled-table">
  <thead>
    <tr>
      <th>Company</th>
      <th>PO Number</th>
      <!-- <th>Dipatched Date</th> -->
      <!-- <th>Current Status</th> -->
      <th>Action</th>
    </tr>
  </thead>

  <!-- DATA ROWS -->
  <tbody v-if="supplies.length">
   <tr v-for="supply in filteredSupplies" :key="supply.id">


      <td>{{ supply.company_name }}</td>
      <td>{{ supply.po_number }}</td>
      <!-- <td>{{ supply.date }}</td> -->

      <!-- <td>
        {{ supply.material_status || 'Awaiting Dispatch' }}
      </td> -->
<td>


  <!-- Status Change Dropdown -->
  <select
  :value="supply.material_status || 'Awaiting Dispatch'"
  @change="handleStatusChange(supply, $event.target.value)"
>
  <!-- Default when no status -->
  <option value="Awaiting Dispatch" disabled>
    Awaiting Dispatch
  </option>

  <!-- Dispatched -->
  <option value="Dispatched">
    Dispatched
  </option>

  <!-- Delivered only after dispatched -->
  <option
    v-if="supply.material_status === 'Dispatched'"
    value="Delivered"
  >
    Delivered
  </option>
</select>

</td>

    </tr>
  </tbody>

  <!-- NO DATA MESSAGE -->
  <tbody v-else>
    <tr>
      <td colspan="5" class="no-data">
        No supply orders found
      </td>
    </tr>
  </tbody>
</table>



  </div>
</div>



<!-- STATUS POPUP -->
<div v-if="showStatusPopup" class="modal-overlay-supply">
  <div class="modal-content-supply">

    <!-- HEADER -->
    <div class="modal-header-supply">
      <h3 class="modal-title-supply">Update Supply Status</h3>
      <button class="close-btn-supply" @click="closePopup">&times;</button>
    </div>

    <!-- BODY -->
    <div class="modal-body-supply">

      <div class="form-group-supply">
        <label class="label-supply">Tracking ID</label>
        <input
          type="text"
          v-model="statusForm.tracking_id"
          class="input-supply"
          placeholder="Enter tracking ID"
        />
      </div>

      <div class="form-group-supply">
        <label class="label-supply">Courier Name</label>
        <input
          type="text"
          v-model="statusForm.courier_name"
          class="input-supply"
          placeholder="Enter courier name"
        />
      </div>

      <div class="form-group-supply">
        <label class="label-supply">Date</label>
        <input
          type="date"
          v-model="statusForm.date"
          class="input-supply"
        />
      </div>

    </div>

    <!-- FOOTER -->
    <div class="modal-footer-supply">
      <button class="btn-submit-supply" @click="submitStatus">
        Submit
      </button>
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

<div v-if="showViewAllQuotationPopup" class="modal-backdrop">
  <div class="modal-card">

    <!-- Close Button -->
    <button class="btn btn-dark" style="float: right;" @click="showViewAllQuotationPopup = false">⬅ Back</button>

    <h2>All Quotations</h2>

    <!-- Company Filter -->
  <!-- Filters -->
<div class="filters-row" style="display:flex; gap:42px; margin-bottom:15px; flex-wrap:wrap; align-items:end;">

  <!-- Company Search -->
  <div style="flex:1; min-width:220px;">
    <label style="font-size:1.05em;">Search Company</label>
    <input
      type="text"
      v-model="searchCompany"
      placeholder="Type company name..."
      class="input"
      style="width:100%;"
    />
  </div>

  <!-- Status Filter -->
  <div style="flex:1; min-width:180px;">
    <label style="font-size:1.05em;">Filter by Status</label>
    <select v-model="filterStatus" class="input" style="width:100%;">
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="followup">Follow-up</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </select>
  </div>
<!-- Month, Year Combined Filter -->
<div style="flex:1; min-width:260px;">
  <label style="font-size:1.05em;">Filter by Month, Year</label>

  <div style="display:flex; gap:6px; align-items:center;">
    <!-- Month -->
    <select v-model="filterMonth" class="input" style="flex:1;">
      <option value="">Month</option>
      <option v-for="(m, index) in months" :key="index" :value="index + 1">
        {{ m }}
      </option>
    </select>

    <span style="font-weight:bold;">,</span>

    <!-- Year -->
    <select v-model="filterYear" class="input" style="width:110px;">
      <option value="">Year</option>
      <option v-for="y in years" :key="y" :value="y">
        {{ y }}
      </option>
    </select>
  </div>
</div>

  <!-- Grand Total Card -->
  <div class="grand-total-card">
    <div class="grand-total-header">
      <span class="title">Grand Total</span>
      <button
        class="btn gst-toggle"
        :class="showGstInclusive ? 'btn-success' : 'btn-outline-secondary'"
        @click="showGstInclusive = !showGstInclusive"
      >
        {{ showGstInclusive ? 'GST Included' : 'GST Excluded' }}
      </button>
    </div>

    <div class="grand-total-amount">
     ₹ {{ (totalQuotationAmount ?? 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}) }}

     
<br>
 
    {{ formatCurrency(currencyTotals.USD ?? 0, 'USD') }}

         </div>
  </div>
</div>

    <!-- Loader -->
    <div v-if="quotationLoading" class="quotation-loader">
      <span class="spinner"></span>
      <p>Loading quotations...</p>
    </div>


    <div v-else-if="filteredAllQuotations.length > 0" class="cards-container">
  <div 
    v-for="q in filteredAllQuotations" 
    :key="q.id" 
    class="quote-card"
    @click="openQuotationInNewTab(q)"
  >
    <p><strong>{{ quotePrefix }}{{ q.id }}</strong></p>

     <p>{{ q.company_name }}</p>

     <!-- ✅ Follow-up Status -->
  <p class="followup-status">
    Status : 
    <span :class="'status-' + q.quotation_followup_status?.toLowerCase()">
<span
  :class="{
    'status-pending': !q.quotation_followup_status,
    'status-follow-up': q.quotation_followup_status?.toLowerCase() === 'followup',
    'status-approved': q.quotation_followup_status?.toLowerCase() === 'approved',
    'status-rejected': q.quotation_followup_status?.toLowerCase() === 'rejected'
  }"
>
  {{ q.quotation_followup_status || 'Pending' }}
</span>


    </span>
  </p>

  

    <!-- <button class="quotation-edit-btn" @click.stop="editQuotation(q)">
      <i class="fas fa-edit"></i> Edit
    </button>

    <button class="quotation-delete-btn" @click.stop="deleteQuotation(q.id)">
      <i class="fas fa-trash"></i> Delete
    </button> -->
  </div>
</div>


    <!-- Quotation Cards -->
<div v-else-if="filteredQuotations.length > 0" class="cards-container">
  <div 
    v-for="q in filteredQuotations" 
    :key="q.id" 
    class="quote-card"
    @click="openQuotationInNewTab(q)"
  >
    <p><strong>{{ quotePrefix }}{{ q.id }}</strong></p>

    <button class="quotation-edit-btn" @click.stop="editQuotation(q)">
      <i class="fas fa-edit"></i> Edit
    </button>

    <button class="quotation-delete-btn" @click.stop="deleteQuotation(q.id)">
      <i class="fas fa-trash"></i> Delete
    </button>
  </div>
</div>



    <!-- No Data Message -->
    <div v-else-if="filterCompany && !quotationLoading">
      <p>No quotations found.</p>
    </div>

  </div>
</div>

<!-- VIEW QUOTATIONS POPUP -->
<div v-if="showViewQuotationPopup" class="modal-backdrop">
  <div class="modal-card">

    <!-- Close Button -->
    <button class="btn btn-dark" style="float: right;" @click="showViewQuotationPopup = false">⬅ Back</button>

    <h2>All Quotations</h2>

    <!-- Company Filter -->
    <div class="filters-row" style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
      
      <div style="flex: 1; min-width: 150px;">
        <label style="font-size: 1.1em;">Filter by Company</label>
        <select v-model="filterCompany" class="input" style="width: 100%;">
          <option value="">Select Company</option>
          <option 
            v-for="cust in customers" 
            :key="cust.id" 
            :value="cust.company_name"
          >
            {{ cust.company_name }}
          </option>
        </select>
      </div>

      <div style="flex: 1; min-width: 150px;">
        <label style="font-size: 1.1em;">Engine Serial Number</label>
        <input 
          type="text" 
          v-model="engineSearch" 
          @input="searchByEngine"
          placeholder="Enter Engine Serial Number" 
          class="input" 
          style="width: 100%;"
        />
      </div>
    </div>

    <!-- Loader -->
    <div v-if="quotationLoading" class="quotation-loader">
      <span class="spinner"></span>
      <p>Loading quotations...</p>
    </div>

    <!-- Quotation Cards -->
    <div v-else-if="quotationList.length > 0" class="cards-container">
     <div 
  v-for="q in quotationList" 
  :key="q.id" 
  class="quote-card"
  @click="openQuotationInNewTab(q)"
>
  <p><strong>{{ quotePrefix }}{{ q.id }}</strong></p>

  <button class="quotation-edit-btn" @click.stop="editQuotation(q)">
    <i class="fas fa-edit"></i> Edit
  </button>

  <button class="quotation-delete-btn" @click.stop="deleteQuotation(q.id)">
    <i class="fas fa-trash"></i> Delete
  </button>
</div>

    </div>

    <!-- No Data Message -->
    <div v-else-if="filterCompany && !quotationLoading">
      <p>No quotations found.</p>
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
          <button class="btn btn-closedpo btn-sm" @click.stop="handleClosePo(po)">Close PO</button>
          <button class="btn btn-danger" @click.stop="deletePo(po.id)">Delete PO</button>
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

    <table class="po-table">
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
 <tr>
          <th>PO Value</th>
          <td>{{ selectedPo.value_of_po }}</td>
        </tr>

        <!-- AMC Specific -->
<template v-if="selectedPo.po_type === 'AMC'">
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
    <td>{{ selectedPo.start_period }}</td>
  </tr>
  <tr>
    <th>End Period</th>
    <td>{{ selectedPo.end_period }}</td>
  </tr>
 

 <!-- Visits (only show if not null/empty) -->
<tr v-for="visit in filledVisits" :key="visit.number">
  <th>Visit {{ visit.number }}</th>
  <td>
    {{ visit.date }}

    <!-- Completed -->
    <span v-if="getVisitStatus(visit.date) === 'Completed'"
          style="color:green; margin-left:6px;">
      ✔
    </span>

    <!-- Pending -->
    <span v-else-if="getVisitStatus(visit.date) === 'Pending'"
          style="color:orange; margin-left:6px;">
      ⏳
    </span>
  </td>
</tr>




</template>
<template v-if="selectedPo.po_type === 'Service+Supply'">
   <tr>
          <th>PO Date</th>
          <td>{{ selectedPo.date }}</td>
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
          <th>Recommended By</th>
          <td>{{ selectedPo.recommended_by }}</td>
        </tr>

</template>
        <!-- Service Specific -->
        <template v-else-if="selectedPo.po_type === 'Service'">
         
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
            <td>{{ selectedPo.date }}</td>
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
        </template>

        <!-- Supply Specific -->
        <template v-else-if="selectedPo.po_type === 'Supply'">
          <tr>
            <th>Value of PO</th>
            <td>{{ selectedPo.value_of_po }}</td>
          </tr>
          <tr>
            <th>Date</th>
            <td>{{ selectedPo.date }}</td>
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
            <td>{{ selectedPo.closed_date	 }}</td>
          </tr>
        </template>
      </tbody>
    </table>

   <!-- Buttons -->
<div class="modal-buttons" style="display: flex; flex-direction: row; gap: 10px; margin-top: 20px;">
  <button class="btn btn-secondary" @click="viewCustomerPo(customer)">View PO</button>

  <!-- Conditionally show "Add Visit" button if po_type is AMC -->
  <button 
    class="btn btn-primary" 
    v-if="selectedPo && selectedPo.po_type === 'AMC'" 
    @click="addVisit(selectedPo)"
  >
    Add Visit
  </button>

  <button class="btn btn-danger" @click="showPoDetailsModal = false">⬅ Back</button>
</div>



  </div>
</div>

<!-- Add Visit Modal -->
<div v-if="showAddVisitModal" class="visit-modal-overlay">
  <div class="visit-modal-box">
    <h3 class="visit-modal-title">Add Visit</h3>

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
        Save
      </button>
      <button class="visit-btn-close" @click="showAddVisitModal = false">
        Close
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

    <div class="modal-buttons">
  <button
    class="btn btn-primary"
    @click="openPoModal"
  >
    Add PO
  </button>

 

 

  <button
    class="btn btn-secondary"
    @click="closeDetailsModal"
  >
    Close
  </button>
</div>

  </div>
</div>


<!-- Add PO Modal -->
<div class="modal-backdrop" v-if="showPoModal">
  <div class="modal-card small">
    <h2 class="modal-title">Add Purchase Order</h2>

    <div class="form-row">
      <div class="input-group full-width">
        <label>PO Type</label>
        <select v-model="poType" @change="handlePoTypeChange">
          <option value="">Select Type</option>
          <option value="AMC">AMC</option>
          <option value="Service">Service</option>
          <option value="Supply">Supply</option>
           <option value="Service+Supply">Service + Supply</option>
        </select>
      </div>
    </div>

    <div class="modal-buttons">
      
      <button class="btn btn-secondary" @click="closePoModal">Close</button>
    </div>
  </div>
</div>

<!-- Service + Supply Modal -->
<div class="modal-backdrop" v-if="showServiceSupplyModal">
  <div class="modal-card medium">
    <h2 class="modal-title" style="font-size: 17px!important;">Service + Supply Purchase Order</h2>

    <!-- Company Name -->
    <div class="form-row">
      <div class="input-group full-width">
        <label>Company Name</label>
        <p style="text-align-last: left;">{{ selectedCustomer.company_name }}</p>
      </div>
    </div>


    <div class="form-row">
      <div class="input-group full-width">
        <label>PO Number</label>
        <input type="text" v-model="serviceSupply.poNumber" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>PO Recive Date</label>
        <input type="date" v-model="serviceSupply.date" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>Total PO Value</label>
        <input type="number" v-model="serviceSupply.totalValue" />
      </div>
    </div>

   

    <div class="form-row">
      <div class="input-group full-width">
        <label>Recommended By</label>
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
        <label>Type of Service</label>
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
        <label>PO Attachment</label>
        <input type="file" @change="handleServiceSupplyFile" />
      </div>
    </div>

    <!-- BUTTONS -->
    <div class="modal-buttons"> 
      <button
        class="btn btn-success"
        style="background-color: var(--text);"
        :disabled="isSavingServiceSupply"
        @click="saveServiceSupply"
      >
        <span v-if="isSavingServiceSupply" class="loader"></span>
        <span v-else>Save</span>
      </button>

      <button class="btn btn-secondary" @click="closeServiceSupplyModal">
        Cancel
      </button>
    </div>
  </div>
</div>


<!-- Supply Modal -->
<div class="modal-backdrop" v-if="showSupplyModal">
  <div class="modal-card small">
    <h2 class="modal-title">Supply PO Details</h2>

    <!-- Auto-filled Company Name -->
    <div class="form-row">
      <div class="input-group full-width">
        <label>Company Name</label>
        <p style="text-align-last: left;">{{ selectedCustomer.company_name }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>PO Number</label>
        <input type="text" v-model="supplyDetails.poNumber" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label> PO Date</label>
        <input type="date" v-model="supplyDetails.date" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>Value of PO</label>
        <input type="number" v-model="supplyDetails.value" />
      </div>
    </div>
 <div class="form-row">
      <div class="input-group full-width">
        <label>PO File Attachment</label>
       <input type="file" @change="handleSupplyFileUpload" />
      </div>
    </div>
    <div class="form-row">
      <div class="input-group full-width">
        <label>Recommended By</label>
        <select v-model="supplyDetails.recommendedBy">
          <option value="">Select Name</option>
          <option v-for="user in users" :key="user.id" :value="user.name">
            {{ user.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="modal-buttons">
      <!-- <button class="btn btn-success" @click="saveSupplyDetails">Save</button> -->
           <button 
  class="btn btn-success" style="background-color: var(--text);"
  :disabled="isSavingSupply"
  @click="saveSupplyDetails"
>
  <span v-if="isSavingSupply" class="loader"></span>
  <span v-else>Save Supply</span>
</button>
      <button class="btn btn-secondary" @click="closeSupplyModal">Cancel</button>
    </div>
  </div>
</div>


<!-- Service Details Modal -->
<div class="modal-backdrop" v-if="showServiceModal">
  <div class="modal-card medium">
    <h2 class="modal-title">Service Purchase Order Details</h2>

    <!-- Auto-filled Company Name -->
    <div class="form-row">
      <div class="input-group full-width">
        <label>Company Name</label>
        <p style="text-align-last: left;">{{ selectedCustomer.company_name }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>PO Number</label>
        <input type="text" v-model="serviceDetails.poNumber" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>PO Date</label>
        <input type="date" v-model="serviceDetails.date" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>Type of Service</label>
        <select v-model="serviceDetails.serviceType">
          <option value="">Select Service</option>
          <option value="Breakdown">Breakdown</option>
          <option value="Inspection">Inspection</option>
          <option value="B-Check / Maintenance">B-Check / Maintenance</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>Value of PO</label>
        <input type="number" v-model="serviceDetails.poValue" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>PO Copy</label>
        <input type="file" @change="handlePoFile" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group full-width">
        <label>Assign to Employee</label>
       <select v-model="serviceDetails.assignTo">
  <option value="" disabled>Select User</option>
  <option v-for="user in users" :key="user.id" :value="user.id">
    {{ user.name }} <!-- This is what the user sees -->
  </option>
</select>
      </div>
    </div>

    <div class="modal-buttons">
      <!-- <button class="btn btn-success" @click="saveServiceDetails">Save</button> -->
         <button 
  class="btn btn-success" style="background-color: var(--text);"
  :disabled="isSavingService"
  @click="saveServiceDetails"
>
  <span v-if="isSavingService" class="loader"></span>
  <span v-else>Save Service</span>
</button>
      <button class="btn btn-secondary" @click="closeServiceModal">Cancel</button>
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
        <label>PO Number</label>
        <input type="text" v-model="amcDetails.PONumber" />
      </div>

      <!-- Type of AMC -->
      <div class="input-group">
        <label>Type of AMC</label>
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
        <label>PO Date</label>
        <input type="date" v-model="amcDetails.PODate" />
      </div>

      <div class="input-group">
        <label>Value of PO</label>
        <input type="number" v-model="amcDetails.value_of_po" placeholder="Enter Amount" />
      </div>
    </div>

    <div class="form-row">
      <div class="input-group">
        <label>Start Period</label>
        <input type="date" v-model="amcDetails.start_period" />
      </div>

      <div class="input-group">
        <label>End Period</label>
        <input type="date" v-model="amcDetails.end_period" />
      </div>
    </div>

    <!-- No. of Visits -->
    <div class="input-group">
      <label>No. of Visits</label>
      <input 
        type="number" 
        v-model.number="amcDetails.visits" 
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
        <label>PO File Attachment</label>
        <input type="file" @change="handlePoFileUpload" />
      </div>
    </div>

    <div class="modal-buttons">
      <button 
  class="btn btn-success" style="background-color: var(--text);"
  :disabled="isSavingAmc"
  @click="saveAmcDetails"
>
  <span v-if="isSavingAmc" class="loader"></span>
  <span v-else>Save</span>
</button>

      <button class="btn btn-secondary" @click="closeAmcModal">Cancel</button>
    </div>
  </div>
</div>




<div v-if="showDeliveredPopup" class="modal-backdrop">
  <div class="modal-card large">

    <div style="text-align:right; margin-bottom:-4%;    display: flex;">
      <button class="btn btn-dark" @click="showDeliveredPopup = false">⬅ Back</button>
    </div>

    <h2>Delivered Material List</h2>
<!-- FILTER BAR -->
<div class="filter-bar">
  <!-- Search -->
  <input
    type="text"
    v-model="deliveredFilters.search"
    placeholder="Search Company / PO Number"
    class="filter-input"
  />

  <!-- Month Filter -->
  <select v-model="deliveredFilters.month" class="filter-select">
    <option value="">All Months</option>
    <option
      v-for="(m, index) in months"
      :key="index"
      :value="index + 1"
    >
      {{ m }}
    </option>
  </select>


</div>

   <table class="styled-table">
  <thead>
    <tr>
      <th>Company</th>
      <!-- <th>PO Number</th> -->
      <th>PO Date</th>
      <!-- <th>Status</th> -->
      <th>Tracking ID</th>
      <th>Courier Name</th>
      <th>Closed Date</th>
    </tr>
  </thead>

  <!-- DATA ROWS -->
  <tbody v-if="deliveredSupplies.length">
   <tr v-for="supply in filteredDeliveredSupplies" :key="supply.id">

      <td>{{ supply.company_name }}</td>
      <!-- <td>{{ supply.po_number }}</td> -->
      <td>{{ supply.date }}</td>
      <!-- <td>{{ supply.material_status }}</td> -->
      <td>{{ supply.tracking_id || '-' }}</td>
      <td>{{ supply.courier_name || '-' }}</td>
      <td>{{ supply.closed_date || '-' }}</td>
    </tr>
  </tbody>

  <!-- NO DATA MESSAGE -->
  <tbody v-else>
    <tr>
      <td colspan="7" class="no-data">
        No delivered supplies found
      </td>
    </tr>
  </tbody>
</table>


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
          <label>Company Name *</label>
          <input 
            type="text" 
            v-model="customer.company_name" 
            @input="customer.company_name = customer.company_name.replace(/[^a-zA-Z0-9\s:.,&]/g, '')"
            required
          >
        </div>

    <div class="crm-input-group">
  <label>Contact Number *</label>
  <input 
    type="tel"
    v-model="customer.contact_number"
    @input="customer.contact_number = formatPlusNumber(customer.contact_number)"
    required
    placeholder="+11234567890"
    pattern="^\+\d{4,14}$"
    title="Only numbers allowed, with + at the beginning (e.g. +11234567890)"
  >
</div>


      </div>

      <div class="crm-form-row">
        <div class="crm-input-group">
          <label>Contact Person Name *</label>
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
    placeholder="+11234567890"
    pattern="^\+\d{4,14}$"
    title="Only numbers allowed, with + at the beginning (e.g. +11234567890)"
  >
</div>


      </div>

      <div class="crm-form-row">
  <div class="crm-input-group crm-full-width">
    <label>Billing Address *</label>
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
    <label>Shipping Address *</label>
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
  <label>Email ID</label>

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
      </div>

      <h2>Equipment Details</h2>

      <div
        v-for="(equipmentList, type) in customer.equipment_details"
        :key="type"
        class="crm-equipment-group"
      >
        <h3>
          {{ type }} Details
          <button type="button" class="crm-add-btn" @click="addEquipment(type)">➕</button>
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
        <button type="submit" class="btn btn-primary">Submit</button>
        <!-- <button type="button" class="btn btn-secondary" @click="closeCustomerModal">Cancel</button> -->
      </div>

    </form>
  </div>
</div>






    </div>




</template>

  <script>
  import axios from 'axios'
  import Sidebar from '../components/Sidebar.vue'
  import _ from 'lodash';


  export default {
      components: {
      Sidebar
    },
    data() {
      return {
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
      month: ''
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
    deliveredSupplies: [],
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
        recommendedBy: ''
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
        cgst: "",
        sgst: "",
        igst: "",
        quote_no: "",
        quote_code: "",
        date: "",
         currency: "",
        customer_ref: "",
        recommended_by: "",
        created_by: 'Admin',
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
            qty: 0,
            uom: "",
            rate: 0,
            total: 0,
            discount: 0,
            taxable: 0,
            cgst_rate: 0,
            cgst_amt: 0,
            sgst_rate: 0,
            sgst_amt: 0,
            igst_rate: 18,
            igst_amt: 0,
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
6. DELIVERY: EXW, Freight Extra.
7. Lead Time: Ready Stock.`,
        declaration:
          `I/we certify that our registration certificate under the GST Act is correct.`,
      }
      }
    },
    mounted() {
       console.table(this.filteredVisits.map(v => ({
    id: v.id,
    company: v.company_name,
    date: v.visit_date
  })))
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
    this.fetchCustomers(); // fetch on load
      this.checkIfMobile();
  window.addEventListener('resize', this.checkIfMobile);
  const quotationId = localStorage.getItem("selectedQuotationId");
  if (quotationId) {
    this.fetchQuotation(quotationId);
  }

    },
  computed: {
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
    return this.deliveredSupplies.filter(supply => {

      // 🔍 Search filter (Company / PO)
      const search = this.deliveredFilters.search.toLowerCase()
      if (search) {
        const company = supply.company_name?.toLowerCase() || ''
        const po = supply.po_number?.toLowerCase() || ''
        if (!company.includes(search) && !po.includes(search)) {
          return false
        }
      }

      // 📅 Month filter (Closed Date)
      if (this.deliveredFilters.month && supply.closed_date) {
        const month = new Date(supply.closed_date).getMonth() + 1
        if (month !== this.deliveredFilters.month) return false
      }

      return true
    })
  }
,
    filteredSupplies() {
    return this.supplies.filter(supply => {

      // 🔍 Search filter (Company / PO)
      const search = this.supplyFilters.search.toLowerCase()
      if (search) {
        const company = supply.company_name?.toLowerCase() || ''
        const po = supply.po_number?.toLowerCase() || ''
        if (!company.includes(search) && !po.includes(search)) {
          return false
        }
      }

      // 📅 Month filter (Dispatch Date)
      if (this.supplyFilters.month && supply.date) {
        const month = new Date(supply.date).getMonth() + 1
        if (month !== this.supplyFilters.month) return false
      }

      return true
    })
  }
,
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
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Jan = 1

    // Financial year starts in April
    return month >= 4
      ? `${year}-${(year + 1).toString().slice(-2)}`
      : `${year - 1}-${year.toString().slice(-2)}`;
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
}

  },
watch: {
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
  


 methods: {
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
      alert("⚠ Please select company and enter shipping address");
      return;
    }

    axios.post("/api/update-shipping-address", {
      company_name: this.form.company_name,
      shipping_address: this.form.shipping_address
    })
    .then(() => {
      this.$toast?.success("✅ Shipping address updated successfully");
    })
    .catch(() => {
      alert("❌ Failed to update shipping address");
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
 handleStatusChange(supply, status) {

  if (status === 'Dispatched') {
    // 🔔 Open popup only for Dispatched
    this.openStatusPopup(supply, status)
  }

  if (status === 'Delivered') {
    // ✅ Direct DB update
    this.updateMaterialStatus(supply, 'Delivered')
      .then(() => {

        // ✅ Success alert
        alert('Material status updated to Delivered successfully.')

        // 🔄 Refresh page
        window.location.reload()
      })
      .catch(() => {
        alert('Failed to update material status.')
      })
  }
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

      alert("Material status updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
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

    alert(data.message);

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
    alert(error.message || "Failed to reopen PO");
  }
},






validateEmail() {
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|co\.in|in|edu|gov|io)$/;

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
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN');
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
      alert("Invalid login credentials");
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
  this.showQuotation = true;
  this.isEdit = false;

  this.form.company_name = cust.company_name;
  this.form.customer_id = cust.id;

  try {
    const res = await axios.get(`/api/customers/${cust.id}`);

    // ✅ Correct fallback logic
    this.form.shipping_address =
      res.data.shipping_address ?? res.data.address ?? "";

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
      alert("Status updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  },

  closePopup() {
    this.showStatusPopup = false;
    this.resetForm();
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
  window.location.reload();
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
    terms_conditions: `1 Parts are ordered as per your specific order. Once delivered the same can not be returned.
2 Quantities mentioned are as per your requirement.
3 All warranties as per manufacturer's warranty terms and conditions.
4 Offer validity : 30 Days from date of quotation.
5 Payment Terms: 100% Advance.
6 DELIVERY: EXW, Freight Extra.
7 Lead Time: Ready Stock.`,
  };
  this.statusForm = {
      tracking_id: '',
      courier_name: '',
      date: new Date().toISOString().substr(0, 10)
    };
},

async editQuotation(quotation) {
  this.isEdit = true;
  this.showQuotation = true;
  this.showViewQuotationPopup = false;
  this.showViewAllQuotationPopup = false;


  try {
    const res = await axios.get(`/api/quotations/${quotation.id}`);
    const fullQuotation = res.data;

    this.form = {
      id: fullQuotation.id,
      nature_of_sale: fullQuotation.nature_of_sale,
      currency: fullQuotation.currency,
      company_name: fullQuotation.company_name,
      recommended_by: fullQuotation.recommended_by,
      customer_reference: fullQuotation.customer_reference,
      engine_serial: fullQuotation.engine_serial,
      model_no: fullQuotation.model_no,
      delivery: fullQuotation.delivery,
      payment_terms: fullQuotation.payment_terms,
      terms_conditions: fullQuotation.terms_conditions,

      items:
        fullQuotation.items
          ? (typeof fullQuotation.items === "string"
              ? JSON.parse(fullQuotation.items)
              : JSON.parse(JSON.stringify(fullQuotation.items)))
          : []
    };

  } catch (error) {
    console.error(error);
    alert("Failed to load quotation data");
  }
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
        alert("Quotation deleted successfully!");

        // Remove from UI immediately
        this.quotationList = this.quotationList.filter(q => q.id !== id);
      })
      .catch(err => {
        console.error(err);
        alert("Error deleting quotation");
      });
  },
  updateServiceDate(po) {
    axios.put(`/api/update-service-date/${po.id}`, {
      service_date: po.service_date
    })
    .then(() => {
      alert("Service Date Updated Successfully!");
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

    alert('Visit added successfully!');
    this.showAddVisitModal = false;

    // Optional: update local selectedPo to show immediately
    this.selectedPo[this.selectedVisit] = this.visitDate;

  } catch (error) {
    console.error(error);
    alert('Failed to add visit.');
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
    alert("⚠ Please select Nature of Sale before adding items.");
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
      alert(
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
    qty: 0,
    uom: "",
    rate: 0,
    total: 0,
    discount: 0,
    taxable: 0,
    cgst_rate: 0,
    cgst_amt: 0,
    sgst_rate: 0,
    sgst_amt: 0,
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

    openQuotation(id) {
    localStorage.setItem("selectedQuotationId", id); // remember ID
    this.showViewQuotationPopup = false;
    this.showViewAllQuotationPopup = false;


    this.$router.push("/quotation"); // navigate to quotation.vue
  },
fetchQuotationsById(company) {
  this.quotationLoading = true;

  fetch(`/api/api/quotations/by-company/${company}`)
    .then(res => res.json())
    .then(data => {
      this.quotationList = data;
    })
    .catch(err => {
      console.error("Quotation fetch error:", err);
      this.quotationList = [];
    })
    .finally(() => {
      this.quotationLoading = false;   // ✅ stop loader
    });
},

openViewQuotationPopup(companyName) {
  this.currentCompany = companyName;
  this.filterCompany = companyName;
  this.showViewQuotationPopup = true;
  // this.showViewAllQuotationPopup = true;


  this.quotationList = [];          // clear old data
  this.quotationLoading = true;     // 🔄 start loader

  this.fetchQuotationsById(companyName);
},


submitQuotation() {
  // 1️⃣ Check Nature of Sale
  if (!this.form.nature_of_sale) {
    alert("⚠ Please select Nature of Sale before saving the quotation.");
    return;
  }

  // 2️⃣ Check if at least one item is added
  if (!this.form.items || this.form.items.length === 0) {
    alert("⚠ Please add at least one item before saving the quotation.");
    return;
  }

  // 3️⃣ Validate required fields for each item
  for (let i = 0; i < this.form.items.length; i++) {
    const item = this.form.items[i];
    if (!item.description || !item.hsn || !item.qty || !item.uom || !item.rate) {
      alert(`⚠ Please fill all required fields (*)`);
      return;
    }
  }

  // ✅ Proceed with API call
  const url = this.isEdit 
    ? `/api/quotations/${this.form.id}`   // UPDATE URL
    : `/api/quotations`;                  // CREATE URL

  const method = this.isEdit ? 'put' : 'post';

  axios[method](url, this.form)
    .then(async res => {
      alert(this.isEdit ? "Quotation Updated Successfully!" : "Quotation Saved Successfully!");

      this.showQuotation = false;
      this.resetForm();

      // Refresh the list
      await this.fetchQuotations();

      // If it was a NEW quotation, open All Quotations popup for the selected company
      if (!this.isEdit) {
        this.filterCompany = this.form.company_name; // set company filter
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error saving quotation");
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
      alert("Quotation saved successfully!");
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
        this.deliveredSupplies = res.data;  // populate table
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

      alert("PO closed successfully.");
    } catch (error) {
      console.error("Error closing PO:", error);
      alert("Failed to close PO. Please try again.");
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
      alert(res.data?.message || "Failed to close Supply PO");
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

    alert("Supply PO closed successfully");

  } catch (error) {
    console.error(error.response || error);
    alert(error.response?.data?.message || "Failed to close Supply PO");
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

      alert("PO deleted successfully.");
    } catch (error) {
      console.error("Error deleting PO:", error);
      alert("Failed to delete PO. Please try again.");
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
        alert(`Server error: ${JSON.stringify(error.response.data)}`);
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
  //   alert('Please select visit date first');
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
        alert('Service assigned successfully!')
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
    alert("No PO selected");
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

  alert("PO file not found in PDF or Image format");
},




    handleViewPo(companyName, poType) {
      // Fetch PO from backend filtered by company_name and po_type
      axios.get(`/api/get-pos?company_name=${encodeURIComponent(companyName)}&po_type=${encodeURIComponent(poType)}`)
        .then(res => {
          const pos = res.data; // assuming array of POs
          if (pos.length > 0) {
            this.openPoDetails(pos[0]); // open first matching PO
          } else {
            alert("No PO found for this company and type.");
          }
        })
        .catch(err => {
          console.error(err);
          alert("Failed to fetch PO details.");
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
    alert("Please fill required fields");
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

    alert('AMC PO saved successfully');
    window.location.reload();

  } catch (error) {
    console.error(error);
    alert('Error saving AMC PO ❌');
  } finally {
    this.isSavingAmc = false; // ✅ stop loader ALWAYS
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
        alert('Failed to fetch PO details');
      });
  },

// ✅ Individual Close Button (for each PO)


    // ✅ Header Button (Close Selected PO)
    async closeSelectedPo() {
      if (!this.selectedPoId) {
        alert('Please select a PO first.')
        return
      }
      try {
        await axios.post(`/api/update-po-status`, { id: this.selectedPoId, status: 'closed' })
        alert('Selected PO closed!')
        this.showClosedPoModal = true
        this.showviewPoModal = false
      } catch (error) {
        console.error(error)
        alert('Failed to close selected PO.')
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
          alert("Failed to fetch PO numbers");
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
          alert("Failed to fetch PO numbers");
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
        alert("Failed to fetch PO numbers");
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
        alert("Please select PO type");
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
    alert("Please fill required fields");
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
      alert("Service + Supply PO saved successfully");
      window.location.reload();
    })
    .catch((err) => {
      console.error("Save error:", err.response?.data || err);
      alert("Failed to save Service + Supply PO");
    })
    .finally(() => {
      this.isSavingServiceSupply = false; // ✅ stop loader ALWAYS
    });
},


  saveSupplyDetails() {
  if (!this.supplyDetails.poNumber || !this.supplyDetails.date) {
    alert("Please fill required fields");
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
    alert('Supply PO saved successfully');
    window.location.reload();
  })
  .catch(err => {
    console.error('Save error:', err.response?.data || err);
    alert('Failed to save Supply PO');
  })
  .finally(() => {
    this.isSavingSupply = false; // ✅ stop loader ALWAYS
  });
},



 saveServiceDetails() {
  if (!this.serviceDetails.poNumber || !this.serviceDetails.date) {
    alert("Please fill required fields");
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
    alert('Service PO saved successfully');
    window.location.reload();
  })
  .catch(err => {
    console.error('Save error:', err.response?.data || err);
    alert('Failed to save Service PO');
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
      alert('Failed to load customers.');
    })
    .finally(() => {
      this.isLoadingCustomers = false; // ✅ stop loader
    });
},


    // Edit customer
  editCustomer(customer) {
    const token = localStorage.getItem('token');
    axios.get(`https://employees.archenterprises.co.in/api/api/customers/${customer.id}`, {
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
    equipment_details: JSON.parse(JSON.stringify(equipment))
  };

      this.editingCustomerId = customer.id;
      this.showCustomerModal = true;
    })
    .catch(err => {
      console.error('Failed to fetch customer details:', err);
      alert('Failed to load customer details.');
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
        alert('Customer deleted!');
        window.location.reload();
      })
      .catch(err => {
        console.error(err);
        alert('Failed to delete customer.');
      });
    },

    // Customer form modal
    openRegisterForm() {
      this.showCustomerModal = true;
    },

    closeCustomerModal() {
      this.showCustomerModal = false;
        window.location.reload();
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
      alert(this.editingCustomerId ? 'Customer updated!' : 'Customer registered!');
      window.location.reload();
    })
    .catch(() => {
      alert('Failed to save customer.');
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
      background-color: var(--text);
    cursor: pointer;
    width: 149px;
    color: white;
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
  gap: 10px;
  margin-bottom: 12px;
}

.filter-input,
.filter-select {
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  min-width: 200px;
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
    color: #ffffff;
    border: revert-layer;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
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
  background-color: #07160f;
}

.btn-followup:hover{
  background-color: #353837;
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

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #fff;
  width: 400px;
  padding: 20px;
  border-radius: 10px;
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
   background-color: #3498db; color: white; padding: 8px 15px; border-radius: 6px; font-weight: bold; border: #ffffff;   cursor: pointer;
}
.service-ord:hover {
   background-color: #2679b1; color: white; padding: 8px 15px; border-radius: 6px; font-weight: bold; border: #ffffff;   cursor: pointer;
}
.amc-ord{
   background-color: #2ecc71; color: white; padding: 8px 15px; border-radius: 6px; font-weight: bold; border: #ffffff;   cursor: pointer;
}
.amc-ord:hover{
   background-color: #209751; color: white; padding: 8px 15px; border-radius: 6px; font-weight: bold; border: #ffffff;   cursor: pointer;
}
.material-del{
background-color: #7e2e7e;
 color: white; padding: 8px 15px; border-radius: 6px; font-weight: bold;  border: #ffffff;  cursor: pointer;
}
.material-del:hover{
background-color: #6f256f;
 color: white; padding: 8px 15px; border-radius: 6px; font-weight: bold;  border: #ffffff;  cursor: pointer;
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
  border-collapse: separate;
  border-spacing: 0 10px;
  font-family: 'Poppins', sans-serif;
}

/* Header */
.styled-customer-table thead tr {
      height: 44px;
  background: var(--primary);
  color: #ffffff;
}

.styled-customer-table {
  padding: 14px;
  text-align: center;
  /* border-left: ridge; */
  white-space: nowrap;
  width: max-content!important;
  font-size: 16px;
  border-radius: 6px;
}

/* Rows */
.styled-customer-table tbody tr {
  background: #ffffff;
  text-align: center;
  transition: 0.3s ease;
  box-shadow: 0px 6px 12px rgba(0,0,0,0.08);
  border-radius: 10px;
}

.styled-customer-table tbody tr:hover {
  background-color: #cbcbcb;
}

/* Cells */
.styled-customer-table td {
  padding: 12px;
  font-size: 14px;
  color: var(--text);
  text-align: left;
  border-left: ridge;
  white-space: nowrap;
}

/* Company Name */
.company-link {
  font-weight: 500;
  color: #147b6b;
  text-decoration: none;
}

.company-link:hover {
  color: #0e5c52;
  text-decoration: none;
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
  justify-content: center;
  gap: 8px;
}

.btn-view-po, .btn-edit, .btn-delete, .btn-followup {
  border: none;
  padding: 7px 0px;
  border-radius: 6px;
  font-size: 13px;
  width: 76px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
  color: #fff;
}

/* Individual Buttons Design */
.btn-view-po {
  background-color: #0275d8;
}

.btn-view-po:hover {
  background-color: #025fae;
}

.btn-edit {
  background-color: #03884a;
}

.btn-edit:hover {
  background-color: #0d9e5a;
}

.btn-delete {
  background-color: #d9534f;
}

.btn-delete:hover {
  background-color: #b92f2c;
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
  background: var(--sidebar);
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
  background: var(--sidebar);
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
  background: #f44336;
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
  margin-top: 10px;
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
  overflow-y: auto;
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
   color:var(--text);
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
  background: var(--sidebar)!important;
  padding: 20px;
  width: 450px;
  max-height: 90vh;
  overflow-y: auto;
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
  font-size: 26px !important;
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
  font-size: 13px;
  padding: 4px 8px;
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
  overflow-y: auto;
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

.btn-primary {
  background-color: #3498db;
  color: #fff;
}


.btn-primary:hover {
  background-color: #2980b9;
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
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 8px 12px;
  transition: border 0.3s, box-shadow 0.3s;
}

.search-container.active {
  border-color: #4f46e5; /* Indigo focus color */
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
  color: var(--text);
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
.delevered{
   background-color: #030e8800;
  color: #030e88;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  /* font-weight: bold; */
  cursor: pointer;
  transition: background-color 0.2s;
}
/* .delevered:hover {
  background-color: #020b6f;
} */
.pending-btn {
  background-color: #f39d1200;
  color: #f39c12;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  /* font-weight: bold; */
  cursor: pointer;
  transition: background-color 0.2s;
}
/* .pending-btn:hover {
  background-color: #d68910;
} */
.styled-table {
  border-collapse: collapse;
  margin: 0 auto;
  width: 100%;
  font-size: 15px;
  min-width: 500px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.styled-table th, 
.styled-table td {
 text-align: left;
    font-weight: 600 !important;
    border: 1px solid #ddd;
    color: var(--text);
    background-color: var(--primary);
    padding: 6px 20px;
}

.styled-table thead {
  background-color: var(--text);
  color: #ffffff;
  /* font-weight: bold; */
}

.styled-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.styled-table tbody tr:hover {
  background-color: #f1f1f1;
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
  width: 73%
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

.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  width: 600px;
  animation: fadeInUp 0.3s ease;
}

.modal-card.small {
  width: 400px;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@keyframes fadeInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.search-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 15px;
}

.search-container {

  position: relative;
  display: flex;
  align-items: center;
  width: 220px;
  transition: all 0.4s ease;
  background: #fff;
  border-radius: 25px;
  padding: 5px 12px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.search-container.active {
  width: 320px;
  border-color: #4a90e2;
  box-shadow: 0 4px 12px rgba(74,144,226,0.3);
}

.search-icon {
  color: #999;
  font-size: 16px;
  margin-right: 8px;
  transition: color 0.3s ease;
}

.search-container.active .search-icon {
  color: #4a90e2;
}

.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 100%;
  background: transparent;
}

.search-input::placeholder {
  color: #bbb;
  transition: color 0.3s ease;
}

.search-container.active .search-input::placeholder {
  color: #4a90e2;
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
  color:var(--text);
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
  font-size: 16px;
  width: 156px;
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
  background: #ffffff;
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
  background-color: var(--sidebar);
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
  overflow-y: auto;

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
  padding: 5px 18px;
  border: 2px solid #ced4da;
  border-radius: 12px;
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
  font-weight: 700;
  font-size: 0.8rem;
  border-radius: 4px;
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
  z-index: 10;
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
  background: var(--sidebar);
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
  font-weight: 800;
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
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
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
  text-align: center;
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
  width: 34%;
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
  color: var(--text-white);
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
.btn-view-po{
  font-size: 10px;
  width: 58px;
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
    width: 88px;
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
.search-container.active{
  width: 76px;
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
  width: 23%;
  font-size: 10px;
}
.quotation-delete-btn{
   width: 25%;
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
  color: var(--text-white);
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
  max-width: 1100px;

  /* 🔽 Scroll settings */
  max-height: 90vh;
  overflow-y: auto;

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
  position: fixed;
  top: 7%;
    right: 13%;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: var(--text);
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  align-items: center;
  justify-content: center;
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
  color: var(--text);
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



</style>
