<template>
  <div class="client-quote-page">
    <!-- ════════ TOP HERO HEADER ════════ -->
    <header class="client-quote-header">
      <div class="header-left">
        <div class="client-avatar">
          {{ (clientInfo.company || 'C').charAt(0).toUpperCase() }}
        </div>
        <div class="client-details">
          <div class="title-row">
            <h1 class="client-name">{{ clientInfo.company || 'Client Quotations' }}</h1>
            <span class="service-chip" v-if="clientInfo.service">
              <i class="fas fa-laptop-code"></i> {{ clientInfo.service }}
            </span>
          </div>
          <div class="meta-row">
            <span v-if="clientInfo.contact" class="meta-chip">
              <i class="fas fa-user-tie"></i> {{ clientInfo.contact }}
            </span>
            <a v-if="clientInfo.phone" :href="'tel:' + clientInfo.phone" class="meta-chip link">
              <i class="fas fa-phone-alt"></i> {{ clientInfo.phone }}
            </a>
            <a v-if="clientInfo.email" :href="'mailto:' + clientInfo.email" class="meta-chip link">
              <i class="fas fa-envelope"></i> {{ clientInfo.email }}
            </a>
          </div>
        </div>
      </div>

      <div class="header-right">
        <button class="btn-secondary-action" @click="returnToLeads" title="Back to CRM Board">
          <i class="fas fa-arrow-left"></i>
          <span>Back to Leads</span>
        </button>
        <button class="btn-close-tab" @click="closeCurrentTab" title="Close this Tab">
          <i class="fas fa-times"></i>
          <span>Close Tab</span>
        </button>
      </div>
    </header>

    <!-- ════════ MAIN CONTENT WRAPPER ════════ -->
    <main class="client-quote-main">
      <!-- Workspace Navigation Tabs -->
      <div class="quote-nav-tabs">
        <button
          type="button"
          class="nav-tab-btn"
          :class="{ active: activeTab === 'create' }"
          @click="activeTab = 'create'"
        >
          <i :class="editingQuotationId ? 'fas fa-edit text-amber' : 'fas fa-plus-circle text-emerald'"></i>
          <span>{{ editingQuotationId ? 'Edit Quotation' : 'Make Quotation' }}</span>
        </button>
        <button
          type="button"
          class="nav-tab-btn"
          :class="{ active: activeTab === 'list' }"
          @click="switchToListView"
        >
          <i class="fas fa-file-invoice-dollar"></i>
          <span>All Quotations ({{ clientQuotations.length }})</span>
        </button>
      </div>

      <!-- ════════ TAB 1: MAKE / CREATE QUOTATION FORM ════════ -->
      <section v-if="activeTab === 'create'" class="quote-section-card">
        <div class="section-card-header">
          <div>
            <h2>{{ editingQuotationId ? 'Edit Quotation (' + (form.quote_no || '') + ')' : 'Create New Quotation' }}</h2>
            <p>{{ editingQuotationId ? 'Modify line items, quantities, pricing or terms for this quotation.' : 'Generate an official commercial proposal with automatic GST and line-item breakdown.' }}</p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button v-if="editingQuotationId" type="button" class="btn-cancel-edit" @click="cancelEdit">
              <i class="fas fa-times"></i> Cancel Edit
            </button>
            <span class="date-badge">
              <i class="far fa-calendar-alt"></i> {{ formattedToday }}
            </span>
          </div>
        </div>

        <form @submit.prevent="submitQuotationForm" class="quote-form-body">
          <!-- Row 1: Client Overview -->
          <div class="form-grid-3">
            <div class="form-group">
              <label>Company / Client Name</label>
              <input type="text" :value="clientInfo.company" readonly class="form-control readonly" />
            </div>
            <div class="form-group">
              <label>Contact Person</label>
              <input type="text" :value="clientInfo.contact" readonly class="form-control readonly" />
            </div>
            <div class="form-group">
              <label>Quotation Date <span class="required">*</span></label>
              <input type="date" v-model="form.date" required class="form-control" />
            </div>
          </div>

          <!-- Row 2: Parameters -->
          <div class="form-grid-3">
            <div class="form-group">
              <label>Nature of Sale <span class="required">*</span></label>
              <select v-model="form.nature_of_sale" required class="form-control">
                <option value="Intrastate">Intrastate (CGST 9% + SGST 9%)</option>
                <option value="Interstate">Interstate (IGST 18%)</option>
                <option value="Export">Export / SEZ (0% Tax)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Subject / Reference</label>
              <input
                type="text"
                v-model="form.customer_reference"
                placeholder="e.g. ERP Implementation & Cloud Setup"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Currency</label>
              <select v-model="form.currency" class="form-control">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <!-- Dynamic Line Items Builder -->
          <div class="items-builder-container">
            <div class="items-builder-header">
              <div class="ib-title">
                <i class="fas fa-boxes"></i>
                <h3>Scope & Line Items</h3>
              </div>
              <button type="button" class="btn-add-item" @click="addLineItem">
                <i class="fas fa-plus"></i> Add Item
              </button>
            </div>

            <div class="items-table-wrap">
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="width: 44%;">Item / Service Description *</th>
                    <th style="width: 12%; text-align: center;">Qty</th>
                    <th style="width: 18%; text-align: right;">Unit Rate (₹) *</th>
                    <th style="width: 12%; text-align: center;">GST %</th>
                    <th style="width: 14%; text-align: right;">Total (₹)</th>
                    <th style="width: 5%;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in form.items" :key="idx">
                    <td>
                      <input
                        type="text"
                        v-model="item.description"
                        required
                        placeholder="e.g. Enterprise ERP Setup & Implementation"
                        class="form-control"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        v-model.number="item.qty"
                        min="1"
                        required
                        class="form-control text-center"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        v-model.number="item.rate"
                        min="0"
                        step="100"
                        required
                        placeholder="0"
                        class="form-control text-right"
                      />
                    </td>
                    <td>
                      <select v-model.number="item.gst_pct" class="form-control text-center">
                        <option :value="18">18%</option>
                        <option :value="12">12%</option>
                        <option :value="5">5%</option>
                        <option :value="0">0%</option>
                      </select>
                    </td>
                    <td class="text-right font-bold text-emerald">
                      {{ formatCurrency(getItemLineTotal(item)) }}
                    </td>
                    <td class="text-center">
                      <button
                        type="button"
                        class="btn-trash-row"
                        @click="removeLineItem(idx)"
                        :disabled="form.items.length <= 1"
                        title="Remove row"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bottom: Terms & Totals Split -->
          <div class="quote-bottom-split">
            <div class="terms-column">
              <div class="form-group">
                <label>Payment Terms</label>
                <input
                  type="text"
                  v-model="form.payment_terms"
                  placeholder="e.g. 50% Advance with PO, 50% upon delivery/sign-off"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label>Delivery Terms</label>
                <input
                  type="text"
                  v-model="form.delivery"
                  placeholder="e.g. Within 2 to 4 weeks"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label>Terms & Conditions</label>
                <textarea
                  v-model="form.terms_conditions"
                  rows="3"
                  class="form-control"
                  placeholder="Standard terms, validity, warranties..."
                ></textarea>
              </div>
            </div>

            <div class="totals-column">
              <div class="totals-card">
                <div class="tot-row">
                  <span>Taxable Subtotal:</span>
                  <strong class="tot-val">{{ formatCurrency(computedSubtotal) }}</strong>
                </div>
                <div class="tot-row" v-if="form.nature_of_sale === 'Intrastate'">
                  <span>CGST (Half):</span>
                  <span class="tot-val">{{ formatCurrency(computedTax / 2) }}</span>
                </div>
                <div class="tot-row" v-if="form.nature_of_sale === 'Intrastate'">
                  <span>SGST (Half):</span>
                  <span class="tot-val">{{ formatCurrency(computedTax / 2) }}</span>
                </div>
                <div class="tot-row" v-if="form.nature_of_sale === 'Interstate'">
                  <span>IGST (18%):</span>
                  <span class="tot-val">{{ formatCurrency(computedTax) }}</span>
                </div>
                <div class="tot-row grand-total-row">
                  <span>Grand Total:</span>
                  <strong class="grand-val text-emerald">{{ formatCurrency(computedGrandTotal) }}</strong>
                </div>
                <p class="words-pill" v-if="computedGrandTotal > 0">
                  <i class="fas fa-check-circle"></i> {{ numberToWords(computedGrandTotal) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Form Actions Footer -->
          <div class="form-actions-footer">
            <button type="button" class="btn-secondary" @click="cancelEdit">
              {{ editingQuotationId ? 'Cancel Edit' : 'Cancel / View Existing' }}
            </button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              <i :class="isSaving ? 'fas fa-spinner fa-spin' : (editingQuotationId ? 'fas fa-check-circle' : 'fas fa-save')"></i>
              <span>{{ isSaving ? 'Saving Quotation...' : (editingQuotationId ? 'Update Quotation' : 'Create & Save Quotation') }}</span>
            </button>
          </div>
        </form>
      </section>

      <!-- ════════ TAB 2: VIEW ALL QUOTATIONS FOR THIS CLIENT ════════ -->
      <section v-if="activeTab === 'list'" class="quote-section-card">
        <div class="section-card-header">
          <div>
            <h2>Quotations for {{ clientInfo.company }}</h2>
            <p>History of all commercial quotes and estimates sent to this client.</p>
          </div>
          <button class="btn-add-item" @click="activeTab = 'create'">
            <i class="fas fa-plus"></i> Make New Quotation
          </button>
        </div>

        <!-- Loader -->
        <div v-if="isLoading" class="loader-box">
          <div class="spinner"></div>
          <p>Loading client quotations...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="clientQuotations.length === 0" class="empty-state-box">
          <div class="empty-icon">
            <i class="fas fa-file-invoice"></i>
          </div>
          <h3>No Quotations Yet</h3>
          <p>No quotation has been generated for <strong>{{ clientInfo.company }}</strong> yet.</p>
          <button class="btn-primary mt-3" @click="activeTab = 'create'">
            <i class="fas fa-plus"></i> Create First Quotation
          </button>
        </div>

        <!-- Quotations Cards -->
        <div v-else class="quotations-view-container">
          <!-- Summary Stat Bar -->
          <div class="stats-bar">
            <div class="stat-item">
              <span class="stat-label">Total Quotes</span>
              <span class="stat-val">{{ clientQuotations.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Quoted Value</span>
              <span class="stat-val text-emerald">{{ formatCurrency(totalQuotedValue) }}</span>
            </div>
          </div>

          <div class="quotes-grid">
            <article v-for="q in clientQuotations" :key="q.id" class="quote-item-card">
              <div class="qcard-top">
                <div class="qcard-id">
                  <strong>{{ q.quote_no || ('QT-' + q.id) }}</strong>
                  <span class="qcard-date"><i class="far fa-calendar-alt"></i> {{ formatDate(q.date || q.created_at) }}</span>
                </div>
                <span class="status-badge" :class="getStatusBadgeClass(q)">
                  {{ q.quotation_followup_status || q.status || 'Active' }}
                </span>
              </div>

              <div class="qcard-body">
                <div class="qcard-items-preview">
                  <span class="label"><i class="fas fa-layer-group"></i> Items / Scope:</span>
                  <span class="desc">{{ getItemsPreview(q) }}</span>
                </div>
                <div class="qcard-numbers">
                  <div>
                    <span class="n-lbl">Subtotal</span>
                    <span class="n-val">{{ formatCurrency(q.subtotal || 0) }}</span>
                  </div>
                  <div>
                    <span class="n-lbl">Tax</span>
                    <span class="n-val">{{ formatCurrency(q.tax_total || 0) }}</span>
                  </div>
                  <div class="grand-col">
                    <span class="n-lbl">Grand Total</span>
                    <span class="n-val text-emerald">{{ formatCurrency(q.grand_total || 0) }}</span>
                  </div>
                </div>
              </div>

              <div class="qcard-footer">
                <button class="btn-print-quote" @click="openOfficialQuotationView(q)" title="View in official template">
                  <i class="fas fa-print"></i> View / Print
                </button>
                <button class="btn-edit-quote" @click="editQuotation(q)" title="Edit this quotation">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-details-quote" @click="toggleQuoteDetails(q.id)">
                  <i :class="expandedQuoteId === q.id ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                  <span>{{ expandedQuoteId === q.id ? 'Hide Line Items' : 'View Line Items' }}</span>
                </button>
                <button class="btn-del-quote" @click="deleteQuotation(q.id)" title="Delete quote">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>

              <!-- Accordion line items -->
              <div v-if="expandedQuoteId === q.id" class="qcard-expanded-table">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Rate</th>
                      <th>Taxable</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(it, i) in parseItems(q.items)" :key="i">
                      <td>{{ i + 1 }}</td>
                      <td>{{ it.item_name || it.description || 'Service item' }}</td>
                      <td>{{ it.qty || 1 }}</td>
                      <td>{{ formatCurrency(it.rate || 0) }}</td>
                      <td>{{ formatCurrency(it.taxable || (it.qty * it.rate) || 0) }}</td>
                      <td><strong>{{ formatCurrency(it.line_total || 0) }}</strong></td>
                    </tr>
                  </tbody>
                </table>
                <div class="expanded-terms" v-if="q.payment_terms || q.terms_conditions">
                  <p v-if="q.payment_terms"><strong>Payment:</strong> {{ q.payment_terms }}</p>
                  <p v-if="q.terms_conditions"><strong>Terms:</strong> {{ q.terms_conditions }}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import { toastSuccess, toastWarning, toastError } from '@/utils/toast.js';

export default {
  name: 'ClientQuotations',
  data() {
    return {
      activeTab: 'create', // 'create' | 'list'
      isLoading: false,
      isSaving: false,
      expandedQuoteId: null,
      editingQuotationId: null,
      clientQuotations: [],

      // Client parameters
      clientInfo: {
        company: '',
        contact: '',
        phone: '',
        email: '',
        service: '',
        deal_value: 0,
        lead_id: null
      },

      // Form Model
      form: {
        nature_of_sale: 'Intrastate',
        date: new Date().toISOString().substring(0, 10),
        customer_reference: '',
        currency: 'INR',
        payment_terms: '50% Advance with Purchase Order, 50% upon delivery/sign-off.',
        delivery: 'Within 2 to 4 weeks from order confirmation.',
        terms_conditions: '1. Quotation is valid for 30 days from date of issue.\n2. Taxes applicable as per GST regulations.\n3. Software license & maintenance support as per agreed SLA.',
        items: [
          {
            description: '',
            qty: 1,
            rate: 0,
            gst_pct: 18
          }
        ]
      }
    };
  },

  computed: {
    formattedToday() {
      return new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },

    computedSubtotal() {
      if (!this.form.items) return 0;
      return this.form.items.reduce((sum, it) => sum + (Number(it.qty || 0) * Number(it.rate || 0)), 0);
    },

    computedTax() {
      if (!this.form.items || this.form.nature_of_sale === 'Export') return 0;
      return this.form.items.reduce((sum, it) => {
        const taxable = Number(it.qty || 0) * Number(it.rate || 0);
        return sum + (taxable * (Number(it.gst_pct || 0) / 100));
      }, 0);
    },

    computedGrandTotal() {
      return this.computedSubtotal + this.computedTax;
    },

    totalQuotedValue() {
      return this.clientQuotations.reduce((sum, q) => sum + (Number(q.grand_total) || 0), 0);
    }
  },

  mounted() {
    this.initClientDetails();
    if (this.clientInfo.company) {
      this.fetchQuotations();
    }
  },

  methods: {
    initClientDetails() {
      const q = this.$route.query || {};
      let storedLead = {};
      try {
        storedLead = JSON.parse(localStorage.getItem('active_quotation_lead') || '{}');
      } catch (e) {}

      this.clientInfo = {
        company: q.company || storedLead.company_name || 'Client',
        contact: q.contact || storedLead.contact_person || '',
        phone: q.phone || storedLead.phone || '',
        email: q.email || storedLead.email || '',
        service: q.service || storedLead.service_required || 'IT Solution Development',
        deal_value: Number(q.deal_value || storedLead.deal_value || 0),
        lead_id: q.lead_id || storedLead.id || null
      };

      // Set initial item
      this.form.customer_reference = this.clientInfo.service || 'IT Services';
      this.form.items = [
        {
          description: this.clientInfo.service || 'IT Solution Setup & Deployment',
          qty: 1,
          rate: this.clientInfo.deal_value || 0,
          gst_pct: 18
        }
      ];

      // If query has tab=list, switch to list
      if (q.tab === 'list') {
        this.activeTab = 'list';
      }
    },

    switchToListView() {
      this.activeTab = 'list';
      this.fetchQuotations();
    },

    async fetchQuotations() {
      if (!this.clientInfo.company) return;
      this.isLoading = true;
      try {
        const res = await axios.get('/api/it-quotations', {
          params: { search: this.clientInfo.company }
        });
        const allQuotes = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const lowerComp = this.clientInfo.company.toLowerCase().trim();
        this.clientQuotations = allQuotes.filter(q => {
          const comp = (q.company_name || '').toLowerCase().trim();
          return comp.includes(lowerComp) || lowerComp.includes(comp);
        });
      } catch (err) {
        console.error('Failed to fetch client quotations:', err);
      } finally {
        this.isLoading = false;
      }
    },

    addLineItem() {
      this.form.items.push({
        description: '',
        qty: 1,
        rate: 0,
        gst_pct: 18
      });
    },

    removeLineItem(idx) {
      if (this.form.items.length > 1) {
        this.form.items.splice(idx, 1);
      }
    },

    getItemLineTotal(item) {
      const taxable = Number(item.qty || 0) * Number(item.rate || 0);
      const taxRate = this.form.nature_of_sale === 'Export' ? 0 : (Number(item.gst_pct || 0) / 100);
      return taxable + (taxable * taxRate);
    },

    parseItems(items) {
      if (!items) return [];
      if (Array.isArray(items)) return items;
      if (typeof items === 'string') {
        try {
          return JSON.parse(items);
        } catch (e) {
          return [];
        }
      }
      return [];
    },

    getItemsPreview(q) {
      const items = this.parseItems(q.items);
      if (!items || items.length === 0) return q.customer_reference || q.notes || 'IT Services';
      return items.map(it => it.item_name || it.description || 'Item').filter(Boolean).join(', ');
    },

    getStatusBadgeClass(q) {
      const s = (q.quotation_followup_status || q.status || '').toLowerCase();
      if (s.includes('won') || s.includes('approve') || s.includes('accepted')) return 'badge-won';
      if (s.includes('lost') || s.includes('reject')) return 'badge-lost';
      return 'badge-pending';
    },

    toggleQuoteDetails(id) {
      this.expandedQuoteId = this.expandedQuoteId === id ? null : id;
    },

    openOfficialQuotationView(q) {
      if (q && q.id) {
        localStorage.setItem('selectedQuotationId', q.id);
        localStorage.setItem('selectedQuotationType', 'it');
        window.open(`/quotation?id=${encodeURIComponent(q.id)}&type=it`, '_blank');
      } else {
        localStorage.setItem('selectedQuotationType', 'it');
        window.open('/quotation?type=it', '_blank');
      }
    },

    async deleteQuotation(id) {
      if (!confirm('Are you sure you want to delete this quotation?')) return;
      try {
        await axios.delete(`/api/it-quotations/${id}`);
        this.clientQuotations = this.clientQuotations.filter(q => q.id !== id);
        toastSuccess('Quotation deleted successfully.');
      } catch (err) {
        console.error('Delete quotation failed:', err);
        toastError('Failed to delete quotation.');
      }
    },

    editQuotation(q) {
      this.editingQuotationId = q.id;
      this.activeTab = 'create';

      const rawItems = this.parseItems(q.items);
      const mappedItems = (rawItems && rawItems.length > 0)
        ? rawItems.map(it => ({
            description: it.item_name || it.description || '',
            qty: Number(it.qty) || 1,
            rate: Number(it.rate) || 0,
            gst_pct: Number(it.gst_pct || (it.cgst_pct ? it.cgst_pct * 2 : (it.igst_pct || 18)))
          }))
        : [
            {
              description: q.customer_reference || this.clientInfo.service || 'IT Services',
              qty: 1,
              rate: Number(q.grand_total) || 0,
              gst_pct: 18
            }
          ];

      this.form = {
        quote_no: q.quote_no,
        nature_of_sale: q.nature_of_sale || 'Intrastate',
        date: q.date ? q.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        customer_reference: q.customer_reference || this.clientInfo.service || '',
        currency: q.currency || 'INR',
        payment_terms: q.payment_terms || '50% Advance with Purchase Order, 50% upon delivery/sign-off.',
        delivery: q.delivery || 'Within 2 to 4 weeks from order confirmation.',
        terms_conditions: q.terms_conditions || '1. Quotation is valid for 30 days from date of issue.\n2. Taxes applicable as per GST regulations.\n3. Software license & maintenance support as per agreed SLA.',
        items: mappedItems
      };

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    cancelEdit() {
      this.editingQuotationId = null;
      this.resetForm();
      this.activeTab = 'list';
    },

    resetForm() {
      this.editingQuotationId = null;
      this.form = {
        quote_no: '',
        nature_of_sale: 'Intrastate',
        date: new Date().toISOString().substring(0, 10),
        customer_reference: this.clientInfo.service || '',
        currency: 'INR',
        payment_terms: '50% Advance with Purchase Order, 50% upon delivery/sign-off.',
        delivery: 'Within 2 to 4 weeks from order confirmation.',
        terms_conditions: '1. Quotation is valid for 30 days from date of issue.\n2. Taxes applicable as per GST regulations.\n3. Software license & maintenance support as per agreed SLA.',
        items: [
          {
            description: this.clientInfo.service || '',
            qty: 1,
            rate: Number(this.clientInfo.deal_value) || 0,
            gst_pct: 18
          }
        ]
      };
    },

    async submitQuotationForm() {
      this.isSaving = true;
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userName = user.name || 'Sales Executive';
        const quoteNo = this.editingQuotationId
          ? (this.form.quote_no || `AE/IT-QT/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`)
          : `AE/IT-QT/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;

        const payload = {
          nature_of_sale: this.form.nature_of_sale,
          company_name: this.clientInfo.company,
          lead_id: this.clientInfo.lead_id || null,
          customer_reference: this.form.customer_reference,
          payment_terms: this.form.payment_terms,
          delivery: this.form.delivery,
          recommended_by: userName,
          created_by: userName,
          terms_conditions: this.form.terms_conditions,
          currency: this.form.currency,
          subtotal: this.computedSubtotal,
          tax_total: this.computedTax,
          grand_total: this.computedGrandTotal,
          amount_words: this.numberToWords(this.computedGrandTotal),
          quote_no: quoteNo,
          date: this.form.date,
          status: 'Quotation send',
          quotation_followup_status: 'Quotation send',
          bill_to: {
            company: this.clientInfo.company,
            contact: this.clientInfo.contact,
            email: this.clientInfo.email,
            phone: this.clientInfo.phone
          },
          ship_to: {
            company: this.clientInfo.company,
            contact: this.clientInfo.contact,
            email: this.clientInfo.email,
            phone: this.clientInfo.phone
          },
          items: this.form.items.map(it => {
            const taxable = Number(it.qty) * Number(it.rate);
            const taxRate = Number(it.gst_pct) || 0;
            const taxAmt = taxable * (taxRate / 100);
            return {
              item_name: it.description,
              description: it.description,
              qty: it.qty,
              rate: it.rate,
              taxable: taxable.toFixed(2),
              cgst_pct: this.form.nature_of_sale === 'Intrastate' ? taxRate / 2 : 0,
              cgst_amt: this.form.nature_of_sale === 'Intrastate' ? (taxAmt / 2).toFixed(2) : 0,
              sgst_pct: this.form.nature_of_sale === 'Intrastate' ? taxRate / 2 : 0,
              sgst_amt: this.form.nature_of_sale === 'Intrastate' ? (taxAmt / 2).toFixed(2) : 0,
              igst_pct: this.form.nature_of_sale === 'Interstate' ? taxRate : 0,
              igst_amt: this.form.nature_of_sale === 'Interstate' ? taxAmt.toFixed(2) : 0,
              line_total: (taxable + taxAmt).toFixed(2)
            };
          })
        };

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        if (this.editingQuotationId) {
          // UPDATE EXISTING
          const res = await axios.put(`/api/it-quotations/${this.editingQuotationId}`, payload, { headers });
          const updatedQuotation = res.data?.data || res.data || { ...payload, id: this.editingQuotationId };
          const idx = this.clientQuotations.findIndex(q => q.id === this.editingQuotationId);
          if (idx !== -1) {
            this.clientQuotations.splice(idx, 1, updatedQuotation);
          }
          toastSuccess(`Quotation ${quoteNo} updated successfully!`);
          this.editingQuotationId = null;
        } else {
          // CREATE NEW
          const res = await axios.post('/api/it-quotations', payload, { headers });
          const savedQuotation = res.data?.data || res.data || { ...payload, id: Date.now() };
          this.clientQuotations.unshift(savedQuotation);

          // Auto log follow-up note to lead if lead_id exists
          if (this.clientInfo.lead_id) {
            try {
              const noteText = `Quotation ${quoteNo} generated for ${this.formatCurrency(this.computedGrandTotal)} (${this.form.customer_reference || this.clientInfo.service}).`;
              await axios.post(`/api/leads/${this.clientInfo.lead_id}/followups`, {
                note: noteText,
                call_type: 'Email',
                status: 'Quotation send',
                date: new Date().toISOString().slice(0, 16),
                logged_by: userName
              });
              await axios.put(`/api/leads/${this.clientInfo.lead_id}/status`, {
                status: 'Quotation send'
              });
            } catch (e) {
              console.warn('Could not auto-log to lead:', e);
            }
          }

          toastSuccess(`Quotation ${quoteNo} generated successfully!`);
        }

        this.resetForm();
        this.activeTab = 'list';
      } catch (err) {
        console.error('Failed to save quotation:', err);
        toastError('Failed to save quotation.');
      } finally {
        this.isSaving = false;
      }
    },

    formatCurrency(val) {
      if (!val && val !== 0) return '₹0';
      return '₹' + Number(val).toLocaleString('en-IN');
    },

    formatDate(dateVal) {
      if (!dateVal) return '-';
      try {
        const d = new Date(dateVal);
        return d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch (e) {
        return dateVal;
      }
    },

    numberToWords(num) {
      const n = Math.round(Number(num) || 0);
      if (n === 0) return 'Zero Rupees Only';
      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      const inWords = (val) => {
        let str = '';
        if (val > 19) {
          str += b[Math.floor(val / 10)] + (val % 10 ? ' ' + a[val % 10] : '');
        } else {
          str += a[val];
        }
        return str;
      };

      let str = '';
      const crore = Math.floor(n / 10000000);
      const lakh = Math.floor((n % 10000000) / 100000);
      const thousand = Math.floor((n % 100000) / 1000);
      const hundred = Math.floor((n % 1000) / 100);
      const rest = Math.floor(n % 100);

      if (crore > 0) str += inWords(crore) + ' Crore ';
      if (lakh > 0) str += inWords(lakh) + ' Lakh ';
      if (thousand > 0) str += inWords(thousand) + ' Thousand ';
      if (hundred > 0) str += inWords(hundred) + ' Hundred ';
      if (rest > 0) str += (str !== '' ? 'and ' : '') + inWords(rest) + ' ';

      return (str.trim() + ' Rupees Only');
    },

    returnToLeads() {
      this.$router.push('/employee/lead-management');
    },

    closeCurrentTab() {
      window.close();
    }
  }
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   CLIENT QUOTATIONS DEDICATED WORKSPACE
   ═══════════════════════════════════════════════ */
.client-quote-page {
  min-height: 100vh;
  background: #f1f5f9;
  font-family: inherit;
  color: #1e293b;
  display: flex;
  flex-direction: column;
}

/* Header */
.client-quote-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.client-avatar {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
  color: #ffffff;
  font-size: 1.6rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
}

.client-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.client-name {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.service-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  color: #64748b;
  text-decoration: none;
}

.meta-chip.link {
  color: #0284c7;
}

.meta-chip.link:hover {
  text-decoration: underline;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary-action:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-close-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-close-tab:hover {
  background: #ffe4e6;
}

/* Main */
.client-quote-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Navigation Tabs */
.quote-nav-tabs {
  display: flex;
  gap: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.nav-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-tab-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.nav-tab-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Section Card */
.quote-section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.section-card-header {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-card-header h2 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.section-card-header p {
  margin: 0;
  font-size: 0.88rem;
  color: #64748b;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}

/* Form */
.quote-form-body {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

@media (max-width: 800px) {
  .form-grid-3 {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #475569;
  letter-spacing: 0.03em;
}

.required {
  color: #dc2626;
}

.form-control {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.form-control.readonly {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

/* Items Builder */
.items-builder-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.items-builder-header {
  background: #f8fafc;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
}

.ib-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0f172a;
}

.ib-title h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.btn-add-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #16a34a;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-add-item:hover {
  background: #dcfce7;
}

.items-table-wrap {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  background: #ffffff;
  font-size: 0.76rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid #e2e8f0;
}

.items-table td {
  padding: 0.5rem 0.65rem;
  vertical-align: middle;
}

.text-center { text-align: center; }
.text-right { text-align: right; }
.text-emerald { color: #059669; }
.font-bold { font-weight: 700; }

.btn-trash-row {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-trash-row:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.btn-trash-row:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Bottom Split */
.quote-bottom-split {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .quote-bottom-split {
    grid-template-columns: 1fr;
  }
}

.terms-column {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.totals-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #475569;
}

.grand-total-row {
  padding-top: 0.75rem;
  border-top: 1.5px solid #cbd5e1;
  font-size: 1.15rem;
  color: #0f172a;
}

.words-pill {
  font-size: 0.82rem;
  color: #059669;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  margin: 0.4rem 0 0;
  line-height: 1.45;
  font-weight: 600;
}

.form-actions-footer {
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 9px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);
}

.btn-secondary {
  padding: 0.75rem 1.25rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 9px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* List View */
.loader-box,
.empty-state-box {
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #64748b;
}

.empty-icon {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: #f0fdf4;
  color: #10b981;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.stats-bar {
  display: flex;
  gap: 2rem;
  background: #f8fafc;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.stat-val {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
}

.quotes-grid {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.quote-item-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.quote-item-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.qcard-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.qcard-id strong {
  font-size: 1.05rem;
  color: #0f172a;
  margin-right: 0.75rem;
}

.qcard-date {
  font-size: 0.82rem;
  color: #64748b;
}

.status-badge {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}

.badge-won { background: #dcfce7; color: #15803d; }
.badge-lost { background: #fee2e2; color: #b91c1c; }
.badge-pending { background: #e0f2fe; color: #0284c7; }

.qcard-body {
  padding: 0.85rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.qcard-items-preview {
  font-size: 0.88rem;
  color: #334155;
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-radius: 7px;
}

.qcard-items-preview .label {
  font-weight: 700;
  color: #64748b;
  margin-right: 0.4rem;
}

.qcard-numbers {
  display: flex;
  gap: 1.5rem;
}

.n-lbl {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
}

.n-val {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.grand-col .n-val {
  font-size: 1.15rem;
}

.qcard-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.btn-print-quote {
  padding: 0.45rem 0.85rem;
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s ease;
}

.btn-print-quote:hover {
  background: #0369a1;
}

.btn-edit-quote {
  padding: 0.45rem 0.85rem;
  background: #f59e0b;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s ease;
}

.btn-edit-quote:hover {
  background: #d97706;
}

.text-amber {
  color: #f59e0b !important;
}

.btn-details-quote {
  padding: 0.45rem 0.85rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-del-quote {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.qcard-expanded-table {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px dashed #cbd5e1;
}

.qcard-expanded-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.qcard-expanded-table th {
  background: #f1f5f9;
  padding: 0.45rem 0.65rem;
  text-align: left;
}

.qcard-expanded-table td {
  padding: 0.45rem 0.65rem;
  border-bottom: 1px solid #f1f5f9;
}

.expanded-terms {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.85rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
