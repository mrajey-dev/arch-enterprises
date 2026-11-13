<template>
  <div class="material-supply-page">
    <!-- PAGE HERO HEADER -->
    <div class="pro-page-header header-purple">
      <div class="pro-header-left">
        <button class="pro-btn-back" @click="goBack" title="Back to CRM">
          <i class="fas fa-arrow-left"></i>
          <span>Back to CRM</span>
        </button>

        <div class="pro-header-icon icon-purple">
          <i class="fas fa-truck-ramp-box"></i>
        </div>

        <div>
          <div class="pro-header-title-row">
            <h1 class="pro-page-title">Material Supply Orders</h1>
            <span class="pro-status-pill pill-purple">{{ grandTotalCount }} Total Orders</span>
          </div>
          <p class="pro-page-subtitle">
            <i class="fas fa-boxes-packing"></i> All-in-one view for Awaiting Dispatch, In-Transit Dispatches, and Delivered Materials
          </p>
        </div>
      </div>

      <div class="pro-header-actions">
        <button class="pro-btn-header-refresh" @click="fetchAllData" title="Refresh Data">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- KPI / STATS BAR -->
    <div class="kpi-grid">
      <!-- Awaiting Dispatch KPI -->
      <div
        class="kpi-card kpi-awaiting"
        :class="{ 'kpi-selected': activeViewTab === 'awaiting' }"
        @click="setActiveTab(activeViewTab === 'awaiting' ? 'all' : 'awaiting')"
      >
        <div class="kpi-icon icon-awaiting">
          <i class="fas fa-clock"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-head-row">
            <span class="kpi-label">Awaiting Dispatch</span>
            <span class="kpi-badge badge-awaiting-pill">{{ filteredAwaitingSupplies.length }}</span>
          </div>
          <span class="kpi-value text-amber">{{ formatCurrency(awaitingPoValue) }}</span>
          <span class="kpi-meta">Pending dispatch & delivery</span>
        </div>
      </div>

      <!-- Dispatched KPI -->
      <div
        class="kpi-card kpi-dispatched"
        :class="{ 'kpi-selected': activeViewTab === 'dispatched' }"
        @click="setActiveTab(activeViewTab === 'dispatched' ? 'all' : 'dispatched')"
      >
        <div class="kpi-icon icon-dispatched">
          <i class="fas fa-truck-fast"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-head-row">
            <span class="kpi-label">Dispatched (In Transit)</span>
            <span class="kpi-badge badge-dispatched-pill">{{ filteredDispatchedSupplies.length }}</span>
          </div>
          <span class="kpi-value text-blue">{{ formatCurrency(dispatchedPoValue) }}</span>
          <span class="kpi-meta">Out for delivery with tracking</span>
        </div>
      </div>

      <!-- Delivered Material KPI -->
      <div
        class="kpi-card kpi-delivered"
        :class="{ 'kpi-selected': activeViewTab === 'delivered' }"
        @click="setActiveTab(activeViewTab === 'delivered' ? 'all' : 'delivered')"
      >
        <div class="kpi-icon icon-delivered">
          <i class="fas fa-boxes-packing"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-head-row">
            <span class="kpi-label">Delivered Material List</span>
            <span class="kpi-badge badge-delivered-pill">{{ filteredDeliveredSupplies.length }}</span>
          </div>
          <span class="kpi-value text-emerald">{{ formatCurrency(deliveredPoValue) }}</span>
          <span class="kpi-meta">Successfully completed orders</span>
        </div>
      </div>

      <!-- Grand Total KPI -->
      <div
        class="kpi-card kpi-total"
        :class="{ 'kpi-selected': activeViewTab === 'all' }"
        @click="setActiveTab('all')"
      >
        <div class="kpi-icon icon-val">
          <i class="fas fa-sack-dollar"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-head-row">
            <span class="kpi-label">Total Material Value</span>
            <span class="kpi-badge badge-purple-pill">{{ grandTotalCount }}</span>
          </div>
          <span class="kpi-value text-purple">{{ formatCurrency(grandTotalPoValue) }}</span>
          <span class="kpi-meta">Across all statuses</span>
        </div>
      </div>
    </div>

    <!-- FILTER TOOLBAR & VIEW SWITCHER -->
    <div class="pro-filter-toolbar">
      <div class="pro-search-box">
        <i class="fas fa-search pro-search-icon"></i>
        <input
          type="text"
          v-model="filters.search"
          placeholder="Search company, PO number, tracking ID, courier..."
          class="pro-search-input"
        />
        <button v-if="filters.search" class="pro-clear-btn" @click="filters.search = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="pro-filter-box">
        <i class="fas fa-calendar-days pro-select-icon"></i>
        <select v-model="filters.month" class="pro-select">
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

      <div class="pro-filter-box">
        <i class="fas fa-calendar pro-select-icon"></i>
        <select v-model="filters.year" class="pro-select">
          <option value="">All Years</option>
          <option
            v-for="y in availableFilterYears"
            :key="y"
            :value="y"
          >
            {{ y }}
          </option>
        </select>
        <i class="fas fa-chevron-down pro-arrow"></i>
      </div>

      <!-- Tab view quick buttons -->
      <div class="tab-pill-group">
        <button
          class="tab-pill"
          :class="{ active: activeViewTab === 'all' }"
          @click="setActiveTab('all')"
        >
          <i class="fas fa-layer-group"></i> All ({{ grandTotalCount }})
        </button>
        <button
          class="tab-pill tab-awaiting"
          :class="{ active: activeViewTab === 'awaiting' }"
          @click="setActiveTab('awaiting')"
        >
          <i class="fas fa-clock"></i> Awaiting ({{ filteredAwaitingSupplies.length }})
        </button>
        <button
          class="tab-pill tab-dispatched"
          :class="{ active: activeViewTab === 'dispatched' }"
          @click="setActiveTab('dispatched')"
        >
          <i class="fas fa-truck-fast"></i> Dispatched ({{ filteredDispatchedSupplies.length }})
        </button>
        <button
          class="tab-pill tab-delivered"
          :class="{ active: activeViewTab === 'delivered' }"
          @click="setActiveTab('delivered')"
        >
          <i class="fas fa-boxes-packing"></i> Delivered ({{ filteredDeliveredSupplies.length }})
        </button>
      </div>

      <button
        v-if="filters.search || filters.month || filters.year || activeViewTab !== 'all'"
        class="pro-btn-reset-filters"
        @click="resetFilters"
      >
        <i class="fas fa-rotate-left"></i> Reset
      </button>
    </div>

    <!-- =========================================================
         SECTION 1: AWAITING DISPATCH CARD
         ========================================================= -->
    <div
      v-if="activeViewTab === 'all' || activeViewTab === 'awaiting'"
      class="section-card section-awaiting"
    >
      <div class="section-card-header header-amber">
        <div class="section-header-left">
          <div class="section-icon-badge icon-amber">
            <i class="fas fa-hourglass-half"></i>
          </div>
          <div>
            <div class="section-title-row">
              <h2 class="section-title">Awaiting Dispatch</h2>
              <span class="section-pill pill-amber">{{ filteredAwaitingSupplies.length }} Orders</span>
              <span class="section-value-badge badge-amber-val">
                <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(awaitingPoValue, false) }}
              </span>
            </div>
            <p class="section-subtitle">
              Pending warehouse processing, packing, and courier dispatch
            </p>
          </div>
        </div>

        <div class="section-header-right">
          <span class="section-summary-tag">
            <i class="fas fa-shield-halved"></i> Action Required
          </span>
        </div>
      </div>

      <div class="table-scroll-wrap">
        <table class="pro-styled-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>PO Number</th>
              <th style="min-width: 140px;">PO Value</th>
              <th>Quotation No</th>
              <th>Payment Terms</th>
              <th>Delivery Terms</th>
              <th>Due Date</th>
              <th style="text-align:center;">Status</th>
              <th style="text-align:center;">Action</th>
            </tr>
          </thead>
          <tbody v-if="filteredAwaitingSupplies.length">
            <tr
              v-for="supply in filteredAwaitingSupplies"
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
              <td>
                <span class="pro-val-pill">
                  <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(supply.value_of_po, false) }}
                </span>
              </td>
              <td><span class="pro-text-sub">{{ supply.quotation_against_po || '-' }}</span></td>
              <td><span class="pro-text-sub">{{ supply.payment_terms || '-' }}</span></td>
              <td><span class="pro-text-sub">{{ supply.delivery_terms || '-' }}</span></td>
              <td>
                <input
                  type="date"
                  v-model="supply.delivery_due_date"
                  @change="updateDeliveryDate(supply)"
                  class="pro-date-input-sm"
                  title="Click to change due date"
                />
              </td>
              <td style="text-align:center;">
                <span
                  class="supply-status-badge"
                  :class="getSupplyStatusBadgeClass(supply)"
                >
                  <i :class="getSupplyStatusIcon(supply)"></i>
                  {{ getSupplyStatusLabel(supply) }}
                </span>
              </td>
              <td style="text-align:center;">
                <select
                  :value="supply.material_status || 'Awaiting Dispatch'"
                  @change="handleStatusChange(supply, $event.target.value)"
                  class="pro-status-select st-awaiting"
                >
                  <option value="Awaiting Dispatch" disabled>Awaiting Dispatch</option>
                  <option value="Dispatched">🚚 Mark Dispatched</option>
                  <option value="Delivered">✅ Mark Delivered</option>
                </select>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="9" class="pro-no-data-cell">
                <div class="pro-no-data-wrap">
                  <i class="fas fa-check-circle" style="color: #10b981;"></i>
                  <p>No orders awaiting dispatch matching your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- =========================================================
         SECTION 2: DISPATCHED (IN TRANSIT) CARD
         ========================================================= -->
    <div
      v-if="activeViewTab === 'all' || activeViewTab === 'dispatched'"
      class="section-card section-dispatched"
    >
      <div class="section-card-header header-blue">
        <div class="section-header-left">
          <div class="section-icon-badge icon-blue">
            <i class="fas fa-truck-fast"></i>
          </div>
          <div>
            <div class="section-title-row">
              <h2 class="section-title">Dispatched Orders (In Transit)</h2>
              <span class="section-pill pill-blue">{{ filteredDispatchedSupplies.length }} In Transit</span>
              <span class="section-value-badge badge-blue-val">
                <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(dispatchedPoValue, false) }}
              </span>
            </div>
            <p class="section-subtitle">
              Dispatched consignments on the move with carrier tracking details
            </p>
          </div>
        </div>

        <div class="section-header-right">
          <span class="section-summary-tag tag-blue">
            <i class="fas fa-road"></i> In Transit
          </span>
        </div>
      </div>

      <div class="table-scroll-wrap">
        <table class="pro-styled-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>PO Number</th>
              <th style="min-width: 140px;">PO Value</th>
              <th>Dispatched Date</th>
              <th>Tracking ID</th>
              <th>Courier</th>
              <th>Due Date</th>
              <th>Delivery Terms</th>
              <th style="text-align:center;">Status</th>
              <th style="text-align:center;">Action</th>
            </tr>
          </thead>
          <tbody v-if="filteredDispatchedSupplies.length">
            <tr
              v-for="supply in filteredDispatchedSupplies"
              :key="supply.id"
              class="pro-table-row row-supply-dispatched"
            >
              <td>
                <div class="pro-company-cell">
                  <span class="pro-company-name">{{ supply.company_name }}</span>
                </div>
              </td>
              <td><span class="pro-po-pill">{{ supply.po_number }}</span></td>
              <td>
                <span class="pro-val-pill">
                  <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(supply.value_of_po, false) }}
                </span>
              </td>
              <td>
                <span class="pro-date-pill">
                  <i class="fas fa-calendar-check"></i> {{ supply.closed_date || '-' }}
                </span>
              </td>
              <td>
                <span class="pro-tracking-badge">
                  <i class="fas fa-barcode"></i> {{ supply.tracking_id || '-' }}
                </span>
              </td>
              <td><span class="pro-text-sub font-semibold">{{ supply.courier_name || '-' }}</span></td>
              <td>
                <input
                  type="date"
                  v-model="supply.delivery_due_date"
                  @change="updateDeliveryDate(supply)"
                  class="pro-date-input-sm"
                />
              </td>
              <td><span class="pro-text-sub">{{ supply.delivery_terms || '-' }}</span></td>
              <td style="text-align:center;">
                <span class="supply-status-badge badge-dispatched">
                  <i class="fas fa-truck"></i> Dispatched
                </span>
              </td>
              <td style="text-align:center;">
                <select
                  :value="supply.material_status || 'Dispatched'"
                  @change="handleStatusChange(supply, $event.target.value)"
                  class="pro-status-select st-dispatched"
                >
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">✅ Mark Delivered</option>
                </select>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="10" class="pro-no-data-cell">
                <div class="pro-no-data-wrap">
                  <i class="fas fa-truck-arrow-right" style="color: #3b82f6;"></i>
                  <p>No dispatched orders in transit matching your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- =========================================================
         SECTION 3: DELIVERED MATERIAL LIST CARD
         ========================================================= -->
    <div
      v-if="activeViewTab === 'all' || activeViewTab === 'delivered'"
      class="section-card section-delivered"
    >
      <div class="section-card-header header-emerald">
        <div class="section-header-left">
          <div class="section-icon-badge icon-emerald">
            <i class="fas fa-boxes-packing"></i>
          </div>
          <div>
            <div class="section-title-row">
              <h2 class="section-title">Delivered Material List</h2>
              <span class="section-pill pill-emerald">{{ filteredDeliveredSupplies.length }} Delivered</span>
              <span class="section-value-badge badge-emerald-val">
                <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(deliveredPoValue, false) }}
              </span>
            </div>
            <p class="section-subtitle">
              Delivered material orders and historical consignment completion logs
            </p>
          </div>
        </div>

        <div class="section-header-right">
          <span class="section-summary-tag tag-emerald">
            <i class="fas fa-circle-check"></i> Completed
          </span>
        </div>
      </div>

      <div class="table-scroll-wrap">
        <table class="pro-styled-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>PO Number</th>
              <th style="min-width: 140px;">PO Value</th>
              <th>Delivered Date</th>
              <th>Dispatched Date</th>
              <th>Tracking ID</th>
              <th>Courier</th>
              <th>Quotation No</th>
              <th style="text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody v-if="filteredDeliveredSupplies.length">
            <tr
              v-for="supply in filteredDeliveredSupplies"
              :key="supply.id"
              class="pro-table-row row-supply-delivered"
            >
              <td>
                <div class="pro-company-cell">
                  <span class="pro-company-name">{{ supply.company_name }}</span>
                </div>
              </td>
              <td><span class="pro-po-pill">{{ supply.po_number }}</span></td>
              <td>
                <span class="pro-val-pill">
                  <i class="fas fa-indian-rupee-sign"></i> {{ formatCurrency(supply.value_of_po, false) }}
                </span>
              </td>
              <td>
                <span class="pro-date-pill delivered-date-pill">
                  <i class="fas fa-calendar-check"></i> {{ supply.material_delivered_date || '-' }}
                </span>
              </td>
              <td><span class="pro-text-sub">{{ supply.closed_date ? supply.closed_date : '-' }}</span></td>
              <td>
                <span class="pro-tracking-badge">
                  <i class="fas fa-barcode"></i> {{ supply.tracking_id || '-' }}
                </span>
              </td>
              <td><span class="pro-text-sub font-semibold">{{ supply.courier_name || '-' }}</span></td>
              <td><span class="pro-text-sub">{{ supply.quotation_against_po || '-' }}</span></td>
              <td style="text-align:center;">
                <span class="supply-status-badge badge-delivered">
                  <i class="fas fa-circle-check"></i> Delivered
                </span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="9" class="pro-no-data-cell">
                <div class="pro-no-data-wrap">
                  <i class="fas fa-box-open" style="color: #10b981;"></i>
                  <p>No delivered materials found matching your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- =========================================================
         ACTION MODALS
         ========================================================= -->
    <!-- DELIVERED DATE POPUP (When changing status to Delivered) -->
    <div v-if="showDeliveredDatePopup" class="pro-modal-backdrop-top" @click.self="closeDeliveredDatePopup">
      <div class="modal-card pro-table-modal" style="max-width: 500px;">
        <div class="pro-modal-header header-emerald">
          <div class="pro-header-left">
            <div class="pro-header-icon icon-emerald">
              <i class="fas fa-calendar-check"></i>
            </div>
            <h3 class="pro-modal-title" style="font-size: 1.15rem;">Material Delivered Date</h3>
          </div>
          <button type="button" class="pro-btn-header-close" @click="closeDeliveredDatePopup" title="Close">
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
            <button class="pro-btn-footer-cancel" @click="closeDeliveredDatePopup">
              Cancel
            </button>
            <button class="pro-btn-footer-submit" @click="confirmDelivered">
              <i class="fa fa-save"></i> Save Date
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- STATUS POPUP (When changing status to Dispatched) -->
    <div v-if="showStatusPopup" class="pro-modal-backdrop-top" @click.self="closeStatusPopup">
      <div class="modal-card pro-table-modal" style="max-width: 520px;">
        <div class="pro-modal-header header-purple">
          <div class="pro-header-left">
            <div class="pro-header-icon icon-purple">
              <i class="fas fa-truck-fast"></i>
            </div>
            <h3 class="pro-modal-title" style="font-size: 1.15rem;">Update Supply Status</h3>
          </div>
          <button type="button" class="pro-btn-header-close" @click="closeStatusPopup" title="Close">
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
            <button class="pro-btn-footer-cancel" @click="closeStatusPopup">
              Cancel
            </button>
            <button class="pro-btn-footer-submit" @click="submitStatus">
              <i class="fa fa-save"></i> Submit Status
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { toastError, toastSuccess } from "../../utils/toast";

export default {
  name: "MaterialSupplyPage",
  data() {
    return {
      isRefreshing: false,
      activeViewTab: "awaiting", // default to Awaiting Dispatch on refresh
      supplies: [],
      deliveredSupplies: [],
      months: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      filters: {
        search: "",
        month: "",
        year: ""
      },
      showDeliveredDatePopup: false,
      showStatusPopup: false,
      selectedSupply: null,
      selectedStatus: "",
      deliveredDate: "",
      statusForm: {
        tracking_id: "",
        courier_name: "",
        date: new Date().toISOString().split("T")[0]
      }
    };
  },
  computed: {
    availableFilterYears() {
      const years = new Set();
      const currentYear = new Date().getFullYear();
      years.add(currentYear);
      years.add(currentYear - 1);
      years.add(currentYear + 1);

      const checkItem = (item) => {
        const rawDate = item.delivery_due_date || item.material_delivered_date || item.closed_date || item.date;
        if (rawDate) {
          const y = new Date(rawDate).getFullYear();
          if (!isNaN(y)) years.add(y);
        }
      };

      this.supplies.forEach(checkItem);
      this.deliveredSupplies.forEach(checkItem);

      return Array.from(years).sort((a, b) => b - a);
    },

    // Awaiting Dispatch list
    filteredAwaitingSupplies() {
      return this.supplies.filter(supply => {
        const isAwaiting = !supply.material_status || supply.material_status === 'Awaiting Dispatch';
        if (!isAwaiting) return false;
        return this.matchGeneralFilter(supply);
      });
    },

    // Dispatched list
    filteredDispatchedSupplies() {
      return this.supplies.filter(supply => {
        const isDispatched = supply.material_status === 'Dispatched';
        if (!isDispatched) return false;
        return this.matchGeneralFilter(supply);
      });
    },

    // Delivered list
    filteredDeliveredSupplies() {
      return this.deliveredSupplies.filter(supply => {
        return this.matchGeneralFilter(supply);
      });
    },

    // Financial totals
    awaitingPoValue() {
      return this.filteredAwaitingSupplies.reduce((sum, s) => {
        const v = Number(s.value_of_po);
        return sum + (!isNaN(v) ? v : 0);
      }, 0);
    },

    dispatchedPoValue() {
      return this.filteredDispatchedSupplies.reduce((sum, s) => {
        const v = Number(s.value_of_po);
        return sum + (!isNaN(v) ? v : 0);
      }, 0);
    },

    deliveredPoValue() {
      return this.filteredDeliveredSupplies.reduce((sum, s) => {
        const v = Number(s.value_of_po);
        return sum + (!isNaN(v) ? v : 0);
      }, 0);
    },

    grandTotalPoValue() {
      return this.awaitingPoValue + this.dispatchedPoValue + this.deliveredPoValue;
    },

    grandTotalCount() {
      return (
        this.filteredAwaitingSupplies.length +
        this.filteredDispatchedSupplies.length +
        this.filteredDeliveredSupplies.length
      );
    }
  },
  mounted() {
    this.fetchAllData();
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push('/employee/customerregistrations');
      }
    },

    setActiveTab(tab) {
      this.activeViewTab = tab;
    },

    resetFilters() {
      this.filters = {
        search: "",
        month: "",
        year: ""
      };
      this.activeViewTab = "awaiting";
    },

    matchGeneralFilter(item) {
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const matchesCompany = item.company_name && item.company_name.toLowerCase().includes(q);
        const matchesPo = item.po_number && item.po_number.toLowerCase().includes(q);
        const matchesTracking = item.tracking_id && item.tracking_id.toLowerCase().includes(q);
        const matchesCourier = item.courier_name && item.courier_name.toLowerCase().includes(q);
        if (!matchesCompany && !matchesPo && !matchesTracking && !matchesCourier) {
          return false;
        }
      }

      const rawDate = item.delivery_due_date || item.material_delivered_date || item.closed_date || item.date;
      if (this.filters.month) {
        if (!rawDate) return false;
        const m = new Date(rawDate).getMonth() + 1;
        if (m !== Number(this.filters.month)) return false;
      }

      if (this.filters.year) {
        if (!rawDate) return false;
        const y = new Date(rawDate).getFullYear();
        if (y !== Number(this.filters.year)) return false;
      }

      return true;
    },

    formatCurrency(amount, withSymbol = true) {
      if (amount === null || amount === undefined || amount === '') return '-';
      const num = Number(amount);
      if (isNaN(num)) return amount;
      const formatted = num.toLocaleString('en-IN', {
        maximumFractionDigits: 2
      });
      return withSymbol ? `₹ ${formatted}` : formatted;
    },

    async fetchAllData() {
      this.isRefreshing = true;
      try {
        const [suppliesRes, deliveredRes] = await Promise.all([
          axios.get('/api/get-supplies'),
          axios.get('/api/get-delivered-supplies')
        ]);

        this.supplies = suppliesRes.data || [];

        this.deliveredSupplies = (deliveredRes.data || []).sort((a, b) => {
          const dateA = new Date(a.material_delivered_date || a.updated_at || 0);
          const dateB = new Date(b.material_delivered_date || b.updated_at || 0);
          return dateB - dateA;
        });
      } catch (err) {
        console.error("Error loading supplies data:", err);
        toastError("Failed to fetch material supply data");
      } finally {
        setTimeout(() => {
          this.isRefreshing = false;
        }, 300);
      }
    },

    getRowClass(supply) {
      const isAwaiting = !supply.material_status || supply.material_status === 'Awaiting Dispatch';

      if (supply.material_status === 'Delivered') {
        return 'row-supply-delivered';
      }

      if (supply.material_status === 'Dispatched') {
        return 'row-supply-dispatched';
      }

      if (isAwaiting && supply.delivery_due_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(supply.delivery_due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          return 'row-supply-overdue';
        }

        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);
        if (dueDate >= today && dueDate <= threeDaysLater) {
          return 'row-supply-due-soon';
        }
      }

      if (isAwaiting) {
        return 'row-supply-awaiting';
      }

      return '';
    },

    getSupplyStatusLabel(supply) {
      const isAwaiting = !supply.material_status || supply.material_status === 'Awaiting Dispatch';
      if (supply.material_status === 'Delivered') return 'Delivered';
      if (supply.material_status === 'Dispatched') return 'Dispatched';
      if (isAwaiting && supply.delivery_due_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(supply.delivery_due_date);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) return 'Overdue';
      }
      return 'Awaiting';
    },

    getSupplyStatusBadgeClass(supply) {
      const label = this.getSupplyStatusLabel(supply);
      if (label === 'Delivered') return 'badge-delivered';
      if (label === 'Dispatched') return 'badge-dispatched';
      if (label === 'Overdue') return 'badge-overdue';
      return 'badge-awaiting';
    },

    getSupplyStatusIcon(supply) {
      const label = this.getSupplyStatusLabel(supply);
      if (label === 'Delivered') return 'fas fa-circle-check';
      if (label === 'Dispatched') return 'fas fa-truck';
      if (label === 'Overdue') return 'fas fa-triangle-exclamation';
      return 'fas fa-clock';
    },

    async updateDeliveryDate(supply) {
      if (!supply.delivery_due_date) return;
      try {
        await axios.post('/api/update-delivery-date', {
          id: supply.id,
          delivery_due_date: supply.delivery_due_date
        });
        toastSuccess("Delivery date updated successfully");
      } catch (err) {
        console.error("Error updating delivery date:", err);
        toastError("Failed to update delivery date");
      }
    },

    handleStatusChange(supply, status) {
      if (status === 'Dispatched') {
        this.selectedSupply = supply;
        this.selectedStatus = status;
        this.statusForm = {
          tracking_id: supply.tracking_id || "",
          courier_name: supply.courier_name || "",
          date: supply.closed_date || new Date().toISOString().split("T")[0]
        };
        this.showStatusPopup = true;
      } else if (status === 'Delivered') {
        this.selectedSupply = supply;
        this.deliveredDate = new Date().toISOString().split("T")[0];
        this.showDeliveredDatePopup = true;
      }
    },

    closeStatusPopup() {
      this.showStatusPopup = false;
      this.selectedSupply = null;
    },

    async submitStatus() {
      if (!this.selectedSupply) return;
      try {
        await axios.post('/api/close-supply-po', {
          po_id: this.selectedSupply.id,
          status: this.selectedStatus,
          ...this.statusForm
        });

        // Update locally so it shifts immediately into the Dispatched card
        this.selectedSupply.material_status = 'Dispatched';
        this.selectedSupply.tracking_id = this.statusForm.tracking_id;
        this.selectedSupply.courier_name = this.statusForm.courier_name;
        this.selectedSupply.closed_date = this.statusForm.date;

        toastSuccess("Status updated to Dispatched successfully");
        this.closeStatusPopup();
        this.fetchAllData();
      } catch (err) {
        console.error("Error submitting status:", err);
        toastError("Failed to update status");
      }
    },

    closeDeliveredDatePopup() {
      this.showDeliveredDatePopup = false;
      this.selectedSupply = null;
    },

    async confirmDelivered() {
      if (!this.deliveredDate) {
        toastError("Please select material delivered date");
        return;
      }
      if (!this.selectedSupply) return;

      try {
        await axios.post('/api/material_delivered', {
          id: this.selectedSupply.id,
          material_delivered_date: this.deliveredDate
        });

        toastSuccess("Material marked as Delivered successfully");

        // Remove from active supplies
        const deliveredItem = {
          ...this.selectedSupply,
          material_status: 'Delivered',
          material_delivered_date: this.deliveredDate
        };
        this.supplies = this.supplies.filter(s => s.id !== this.selectedSupply.id);
        this.deliveredSupplies.unshift(deliveredItem);

        this.closeDeliveredDatePopup();
      } catch (err) {
        console.error("Error confirming delivered:", err);
        toastError("Failed to mark material as delivered");
      }
    }
  }
};
</script>

<style scoped>
.material-supply-page {
  padding: 1.5rem 2rem 4rem 2rem;
  background: #f8fafc;
  min-height: 100vh;
  box-sizing: border-box;
}

/* =========================================================
   PAGE HERO HEADER
   ========================================================= */
.pro-page-header {
  position: relative;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  color: #ffffff;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 18px;
  box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.35);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.pro-header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.pro-btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #ffffff;
  padding: 0.55rem 1.15rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);
}

.pro-btn-back:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateX(-3px);
}

.pro-header-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pro-header-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.pro-page-title {
  font-size: 1.65rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.pro-status-pill {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pro-page-subtitle {
  margin: 0.35rem 0 0 0;
  font-size: 0.88rem;
  font-weight: 500;
  color: #e0e7ff;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.pro-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pro-btn-header-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  padding: 0.6rem 1.25rem;
  border-radius: 50px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(6px);
}

.pro-btn-header-refresh:hover {
  background: #ffffff;
  color: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* =========================================================
   KPI / STATS CARDS
   ========================================================= */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 1.4rem;
  display: flex;
  align-items: center;
  gap: 1.15rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
}

.kpi-card.kpi-selected {
  outline: 2px solid #7c3aed;
  box-shadow: 0 8px 22px rgba(124, 58, 237, 0.18);
}

.kpi-card.kpi-awaiting {
  border-left: 4px solid #f59e0b;
}

.kpi-card.kpi-dispatched {
  border-left: 4px solid #3b82f6;
}

.kpi-card.kpi-delivered {
  border-left: 4px solid #10b981;
}

.kpi-card.kpi-total {
  border-left: 4px solid #7c3aed;
}

.kpi-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.icon-awaiting { background: #fef3c7; color: #b45309; }
.icon-dispatched { background: #dbeafe; color: #1d4ed8; }
.icon-delivered { background: #dcfce7; color: #15803d; }
.icon-val { background: #ede9fe; color: #7c3aed; }

.kpi-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.kpi-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.kpi-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.55rem;
  border-radius: 50px;
}

.badge-awaiting-pill { background: #fef3c7; color: #b45309; }
.badge-dispatched-pill { background: #dbeafe; color: #1d4ed8; }
.badge-delivered-pill { background: #dcfce7; color: #15803d; }
.badge-purple-pill { background: #ede9fe; color: #6d28d9; }

.kpi-value {
  font-size: 1.35rem;
  font-weight: 800;
  margin-top: 0.2rem;
  letter-spacing: -0.01em;
}

.text-amber { color: #d97706; }
.text-blue { color: #2563eb; }
.text-emerald { color: #059669; }
.text-purple { color: #6d28d9; }

.kpi-meta {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  margin-top: 0.15rem;
}

/* =========================================================
   FILTER TOOLBAR & TABS
   ========================================================= */
.pro-filter-toolbar {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.4rem;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.pro-search-box {
  position: relative;
  flex: 2 1 260px;
}

.pro-search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
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
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
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

.pro-filter-box {
  position: relative;
  flex: 1 1 160px;
}

.pro-select-icon {
  position: absolute;
  left: 0.95rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7c3aed;
  font-size: 0.85rem;
  pointer-events: none;
}

.pro-arrow {
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.75rem;
  pointer-events: none;
}

.pro-select {
  width: 100%;
  height: 40px;
  padding: 0.5rem 2rem 0.5rem 2.4rem;
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

.pro-select:focus {
  background: #ffffff;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.tab-pill-group {
  display: inline-flex;
  align-items: center;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
  flex-wrap: wrap;
}

.tab-pill {
  border: none;
  background: transparent;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.tab-pill:hover {
  color: #0f172a;
}

.tab-pill.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.tab-pill.active.tab-awaiting {
  color: #b45309;
}

.tab-pill.active.tab-dispatched {
  color: #1d4ed8;
}

.tab-pill.active.tab-delivered {
  color: #15803d;
}

.pro-btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 40px;
  padding: 0 1rem;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-btn-reset-filters:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* =========================================================
   CARD SECTIONS (AWAITING, DISPATCHED, DELIVERED)
   ========================================================= */
.section-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 2.25rem;
  transition: all 0.25s ease;
}

.section-card-header {
  padding: 1.15rem 1.75rem;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-card-header.header-amber {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 4px 15px rgba(217, 119, 6, 0.25);
}

.section-card-header.header-blue {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.25);
}

.section-card-header.header-emerald {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.25);
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 1.15rem;
}

.section-icon-badge {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.section-pill {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.65rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.section-value-badge {
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  background: #ffffff;
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.badge-amber-val { color: #b45309; }
.badge-blue-val { color: #1d4ed8; }
.badge-emerald-val { color: #047857; }

.section-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.section-summary-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 0.4rem 0.9rem;
  border-radius: 50px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* =========================================================
   TABLE STYLING
   ========================================================= */
.table-scroll-wrap {
  overflow-x: auto;
  max-height: 480px;
}

.pro-styled-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.45rem;
  padding: 0.9rem 1.25rem 1.25rem 1.25rem;
}

.pro-styled-table thead th {
  background: #e2e8f0;
  color: #475569;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.8rem 1rem;
  border: none;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 5;
}

.pro-styled-table thead tr th:first-child {
  border-radius: 8px 0 0 8px;
}

.pro-styled-table thead tr th:last-child {
  border-radius: 0 8px 8px 0;
}

.pro-table-row {
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;
}

.pro-table-row:hover {
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.pro-table-row td {
  padding: 0.85rem 1rem;
  vertical-align: middle;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.pro-table-row td:first-child {
  border-left: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 10px 0 0 10px;
}

.pro-table-row td:last-child {
  border-right: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 0 10px 10px 0;
}

/* ── EXACT Row colour coding from User's Screenshot ── */
.row-supply-overdue {
  background: #fd9595 !important;
  border-left: 4px solid #ef4444 !important;
}
.row-supply-overdue:hover {
  background: #f87171 !important;
}

.row-supply-due-soon {
  background: #fd9595 !important;
  border-left: 4px solid #ef4444 !important;
}
.row-supply-due-soon:hover {
  background: #f87171 !important;
}

.row-supply-awaiting {
  background: #f59e0b !important;
  border-left: 4px solid #d97706 !important;
}
.row-supply-awaiting:hover {
  background: #fbbf24 !important;
}

.row-supply-dispatched {
  background: #619dff !important;
  border-left: 4px solid #2563eb !important;
}
.row-supply-dispatched:hover {
  background: #93c5fd !important;
}

.row-supply-delivered {
  background: linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%) !important;
  border-left: 4px solid #22c55e !important;
}
.row-supply-delivered:hover {
  background: #86efac !important;
}

/* ── Cell components ── */
.pro-company-cell {
  display: flex;
  align-items: center;
  max-width: 250px;
}

.pro-company-name {
  font-weight: 700;
  font-size: 0.88rem;
  color: #0f172a;
  line-height: 1.35;
}

.pro-po-pill {
  display: inline-block;
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  font-weight: 800;
  font-size: 0.82rem;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.pro-val-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #ffffff;
  color: #4338ca;
  font-weight: 800;
  font-size: 0.84rem;
  padding: 0.32rem 0.75rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(67, 56, 202, 0.15);
  white-space: nowrap;
}

.pro-text-sub {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e293b;
}

.pro-date-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #ffffff;
  padding: 0.32rem 0.65rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  border: 1px solid rgba(0, 0, 0, 0.08);
  white-space: nowrap;
}

.delivered-date-pill {
  color: #047857;
  border-color: rgba(4, 120, 87, 0.2);
  background: #ffffff;
}

.pro-date-input-sm {
  padding: 0.38rem 0.55rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  cursor: pointer;
}

.pro-date-input-sm:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
}

.pro-tracking-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #ffffff;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  border: 1px solid rgba(29, 78, 216, 0.2);
  letter-spacing: 0.02em;
}

/* ── Supply status badge ── */
.supply-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.supply-status-badge.badge-overdue {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}

.supply-status-badge.badge-awaiting {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.supply-status-badge.badge-dispatched {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.supply-status-badge.badge-delivered {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.pro-status-select {
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #ffffff;
  cursor: pointer;
  outline: none;
}

.pro-status-select.st-awaiting {
  background: #ffffff;
  color: #b45309;
  border-color: #fcd34d;
}

.pro-status-select.st-dispatched {
  background: #ffffff;
  color: #1d4ed8;
  border-color: #93c5fd;
}

/* ── No data ── */
.pro-no-data-cell {
  text-align: center;
  padding: 3rem 1rem !important;
}

.pro-no-data-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.pro-no-data-wrap i {
  font-size: 2.5rem;
  margin-bottom: 0.65rem;
}

.pro-no-data-wrap p {
  font-size: 0.92rem;
  font-weight: 600;
  margin: 0;
}

/* =========================================================
   ACTION MODALS
   ========================================================= */
.pro-modal-backdrop-top {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 1.5rem;
}

.modal-card.pro-table-modal {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.pro-modal-header {
  position: sticky;
  top: 0;
  z-index: 100;
  color: #ffffff;
  padding: 1.15rem 1.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.pro-modal-header.header-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #4338ca 100%);
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.25);
}

.pro-modal-header.header-emerald {
  background: linear-gradient(135deg, #059669 0%, #065f46 100%);
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.25);
}

.pro-modal-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
}

.icon-emerald {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.icon-purple {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
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

.pro-field-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.pro-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.req-star {
  color: #ef4444;
}

.pro-input {
  width: 100%;
  height: 42px;
  padding: 0.5rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
}

.pro-input:focus {
  background: #ffffff;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.pro-date-cell-wrap {
  position: relative;
}

.pro-date-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7c3aed;
  pointer-events: none;
}

.pro-date-input {
  width: 100%;
  height: 42px;
  padding: 0.5rem 0.9rem 0.5rem 2.4rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
}

.pro-date-input:focus {
  background: #ffffff;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.pro-btn-footer-cancel {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pro-btn-footer-cancel:hover {
  background: #e2e8f0;
}

.pro-btn-footer-submit {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border: none;
  color: #ffffff;
  padding: 0.6rem 1.35rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}

.pro-btn-footer-submit:hover {
  background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
  transform: translateY(-1px);
}
</style>
