<template>
  <div class="container-fluid p-4 page-bg">

    <!-- Company Name -->
    <div v-if="po" class="company-header">
      <h4>Purchase Order - {{ po.company_name }} </h4><br>
      <h4>Quotation Against PO - {{ po.quotation_against_po }} </h4>
    </div>

    <div class="card mt-4">
    

      <div class="card-body p-0">
        <div class="table-card mt-4">
          <div class="table-header p-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-white heading">Quotation Items</h5>
             <button class="btn btn-dark btn-sm" @click="openAddVendorStandalone">
  + Add New Vendor
</button>
<button class="btn btn-dark btn-sm" @click="generateReport">
  Generate Report
</button>
            <!-- <input v-model="vendorSearch" class="form-control form-control-sm w-auto" placeholder="Search vendor..." /> -->
          </div>

          <div class="card-body p-0">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>HSN</th>
                  <th>Qty</th>
                  <th>UOM</th>
                  <th>Rate</th>
                  <th>Discount</th>
                  <th>Taxable</th>
                  <th v-if="quotation && quotation.nature_of_sale === 'Intrastate'">CGST</th>
                  <th v-if="quotation && quotation.nature_of_sale === 'Intrastate'">SGST</th>
                  <th v-if="quotation && quotation.nature_of_sale === 'Interstate'">IGST</th>
                  <th>Total</th>
                  <th>In Stock</th>
                  <th>Vendor</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item,index) in quotationItems" :key="index">
                  <td>{{ item.sr || index + 1 }}</td>
                  <td class="desc-col">
  <span v-if="editIndex !== index">{{ item.description }}</span>
  <input v-else v-model="item.description" class="form-control form-control-sm">
</td>
                 <td>
  <span v-if="editIndex !== index">{{ item.hsn }}</span>
  <input v-else v-model="item.hsn" class="form-control form-control-sm">
</td>
                 <td>
  <span v-if="editIndex !== index" class="qty-badge">{{ item.qty }}</span>
  <input v-else type="number" v-model="item.qty" class="form-control form-control-sm">
</td>
                 <td>
  <span v-if="editIndex !== index">{{ item.uom }}</span>
  <input v-else v-model="item.uom" class="form-control form-control-sm">
</td>
               <td class="money">
  <span v-if="editIndex !== index">₹ {{ item.rate }}</span>
  <input v-else type="number" v-model="item.rate" class="form-control form-control-sm">
</td>
                 <td class="discount">
  <span v-if="editIndex !== index">{{ item.discount || 0 }}%</span>
  <input v-else type="number" v-model="item.discount" class="form-control form-control-sm">
</td>
                  <td class="money">₹ {{ taxable(item) }}</td>

                  <!-- Intrastate -->
                  <td v-if="quotation && quotation.nature_of_sale === 'Intrastate'" class="money">
                    ₹ {{ cgstAmount(item) }} ({{ item.cgst_rate || 0 }}%)
                  </td>
                  <td v-if="quotation && quotation.nature_of_sale === 'Intrastate'" class="money">
                    ₹ {{ sgstAmount(item) }} ({{ item.sgst_rate || 0 }}%)
                  </td>

                  <!-- Interstate -->
                  <td v-if="quotation && quotation.nature_of_sale === 'Interstate'" class="money">
                    ₹ {{ igstAmount(item) }} ({{ item.igst_rate || 0 }}%)
                  </td>

                  <td class="total">₹ {{ totalAmount(item) }}</td>
              <td>
<select v-model="item.in_stock" class="stock-dropdown">
    <option :value="true">Yes</option>
    <option :value="false">No</option>
  </select>
</td>

                  <!-- Vendor Cell -->
                  <td>
                    <button
  class="btn-primary"
  @click="openVendorListPopup(item)"
  :disabled="item.in_stock"
>
  {{ item.vendor_name || 'Vendor' }}
</button>
                  </td>
                <td>

<button v-if="editIndex !== index"
        class="btn-edit"
        @click="editItem(index)">
  Edit
</button>

<button v-else
        class="btn-success"
        @click="saveItem(index)">
  Save
</button>

<button class="btn-delete" @click="deleteItem(index)">
  Delete
</button>

</td>
                </tr>

                <tr v-if="quotationItems.length === 0">
                  <td colspan="15" class="text-center text-muted py-4">
                    No Items Found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add New Vendor Modal -->
    <div v-if="showVendorPopup" class="modal-overlay" @click.self="closeAddVendorPopup">
      <div class="modal-box btn-dark add-vendor-section">
        <h5>Add New Vendor</h5>
        <input v-model="newVendorName" type="text" placeholder="Vendor Name" />
        <div class="text-end mt-3">
          <button class="btn btn-secondary me-2" @click="closeAddVendorPopup">Cancel</button>
          <button class="btn btn-success" @click="addVendor">Add Vendor</button>
        </div>
      </div>
    </div>

<!-- Vendor List Modal -->
<div v-if="showVendorList" class="modal-overlay" @click.self="closeVendorListPopup">
  <div class="modal-box vendor-list-box">

    <!-- Header -->
    <div class="vendor-header">
      <h5>Vendors </h5>
      <input
        v-model="vendorSearch"
        type="text"
        placeholder="Search vendor..."
        class="vendor-search"
      />
    </div>

    <!-- Vendor Grid -->
    <div class="vendor-grid">
      <div
        v-for="vendor in filteredVendors"
        :key="vendor.id"
        class="vendor-card"
        @click="selectVendor(vendor)"
      >
        <div class="vendor-avatar">
          {{ vendor.name.charAt(0).toUpperCase() }}
        </div>

        <div class="vendor-info">
          <div class="vendor-name">{{ vendor.name }}</div>
          <div class="vendor-meta">
            {{ vendor.email || 'No Email' }}
          </div>
          <div class="vendor-meta">
            {{ vendor.phone || 'No Phone' }}
          </div>
        </div>
      </div>
    </div>

    <div class="vendor-footer">
      <button class="btn btn-secondary" @click="closeVendorListPopup">
        Close
      </button>
    </div>

  </div>
</div>

  </div>
<!-- Standalone Add Vendor Modal -->
<div v-if="showAddVendorStandalone" class="modal-overlay" @click.self="closeAddVendorStandalone">
  <div class="modal-box">
    <h5>Add New Vendor</h5>
    <input v-model="newStandaloneVendor.name" type="text" placeholder="Vendor Name" />
    <input v-model="newStandaloneVendor.email" type="email" placeholder="Email" class="mt-2" />
    <input v-model="newStandaloneVendor.phone" type="text" placeholder="Phone" class="mt-2" />
    <input v-model="newStandaloneVendor.address" type="text" placeholder="Address" class="mt-2" />
    <div class="text-end mt-3">
      <button class="btn btn-secondary me-2" @click="closeAddVendorStandalone">Cancel</button>
      <button class="btn btn-success" @click="saveAddVendorStandalone">Add Vendor</button>
    </div>
  </div>
</div>
</template>

<script>
import axios from "axios";

export default {
 data() {
  return {
    showAddVendorStandalone: false,
    newStandaloneVendor: { name: '', email: '', phone: '', address: '' },
    newVendor: { name: '', email: '', phone: '', address: '' },
    quotationItems: [],
    po: null,
    quotation: null,
    vendors: [],
    vendorSearch: '',
    newVendorName: '',
    showVendorPopup: false,
    showVendorList: false,
    currentItem: null,
    editIndex: null   // ⭐ ADD THIS
  };
},
  computed: {
    filteredVendors() {
      if (!this.vendorSearch) return this.vendors;
      return this.vendors.filter(v => v.name.toLowerCase().includes(this.vendorSearch.toLowerCase()));
    }
  },
mounted() {

  const poId = this.$route.query.po_id;

  axios.get(`/api/add-po/${poId}`).then(res => {

    this.po = res.data;

    const quotationString = this.po.quotation_against_po;

    if (quotationString) {

      const quotationNumber = quotationString.split('/').pop();

      axios.get(`/api/quotation-by-number/${quotationNumber}`).then(qres => {

        let quotation = qres.data.data ? qres.data.data : qres.data;

        this.quotation = quotation;

        if (quotation && quotation.items) {

         this.quotationItems = typeof quotation.items === "string"
  ? JSON.parse(quotation.items)
  : quotation.items;

// ⭐ Set default stock = Yes
this.quotationItems = this.quotationItems.map(item => {
  return {
    ...item,
    in_stock: item.in_stock !== undefined ? item.in_stock : true
  }
});
        }

      });

    }

  });

  axios.get('/api/vendors').then(res => this.vendors = res.data);

},
  methods: {
generateReport(){

  const reportData = this.quotationItems.map((item,index)=>{

    return {
      sr: item.sr || index + 1,
      description: item.description,
      hsn: item.hsn,
      qty: item.qty,
      uom: item.uom,
      rate: item.rate,
      discount: item.discount,
      taxable: this.taxable(item),
      cgst: this.cgstAmount(item),
      sgst: this.sgstAmount(item),
      igst: this.igstAmount(item),
      total: this.totalAmount(item),
      vendor: item.vendor_name || '',
      in_stock: item.in_stock ? 'Yes' : 'No'
    }

  })

  const report = {
    po:this.po,
    quotation:this.quotation,
    items:reportData
  }

  console.log(report) // DEBUG

  localStorage.setItem('quotation_report', JSON.stringify(report))

  window.open('/quotation-report','_blank')

},
loadSavedVendors(){

  axios.get(`/api/po-item-vendors/${this.po.id}`)
  .then(res => {

    const saved = res.data;

    this.quotationItems.forEach((item,index) => {

      const sr = item.sr || index + 1;

      const found = saved.find(v => v.item_sr == sr);

      if(found){
        item.vendor_id = found.vendor_id;
        item.vendor_name = found.vendor_name;
        item.in_stock = found.in_stock;
        item.description = found.description ?? item.description;
        item.qty = found.qty ?? item.qty;
        item.rate = found.rate ?? item.rate;
      }

    });

  });

},
editItem(index){
  this.editIndex = index;
},
saveItem(index){

  const item = this.quotationItems[index];

  axios.post('/api/po-item-vendor',{
    po_id: this.po.id,
    item_sr: item.sr || index + 1,

    description: item.description,
    hsn: item.hsn,
    qty: item.qty,
    uom: item.uom,
    rate: item.rate,
    discount: item.discount,

    taxable: this.taxable(item),

    cgst: this.cgstAmount(item),
    sgst: this.sgstAmount(item),

    total: this.totalAmount(item),

    in_stock: item.in_stock,

    vendor_id: item.vendor_id,
    vendor_name: item.vendor_name

  }).then(()=>{

    this.editIndex = null;

  });

},
deleteItem(index) {
  if (confirm("Are you sure you want to delete this item?")) {
    this.quotationItems.splice(index, 1);
  }
},
    openAddVendorStandalone() {
    this.showAddVendorStandalone = true;
    this.newStandaloneVendor = { name: '', email: '', phone: '', address: '' };
  },
  closeAddVendorStandalone() {
    this.showAddVendorStandalone = false;
  },
  saveAddVendorStandalone() {
    const { name, email, phone, address } = this.newStandaloneVendor;
    if (!name.trim()) return alert("Vendor name is required");

    axios.post('/api/vendors', { name, email, phone, address })
      .then(res => {
        this.vendors.push(res.data);
        this.showAddVendorStandalone = false;
      })
      .catch(err => alert("Error adding vendor"));
  },
addVendorInPopup() {
    const { name, email, phone, address } = this.newVendor;
    if (!name.trim()) return alert("Vendor name is required");

    axios.post('/api/vendors', { name, email, phone, address })
      .then(res => {
        const addedVendor = res.data;
        this.vendors.push(addedVendor);

        // Optional: auto-select new vendor
        if (this.currentItem) {
          this.currentItem.vendor_id = addedVendor.id;
          this.currentItem.vendor_name = addedVendor.name;
        }

        // Reset form
        this.newVendor = { name: '', email: '', phone: '', address: '' };
      });
  },

    taxable(item){
      const rate = Number(item.rate || 0);
      const qty = Number(item.qty || 0);
      const discount = Number(item.discount || 0);
      const total = rate * qty;
      return ((total - (total * discount / 100))).toFixed(2);
    },
    cgstAmount(item){ return ((this.taxable(item) * (Number(item.cgst_rate || 0)/100))).toFixed(2); },
    sgstAmount(item){ return ((this.taxable(item) * (Number(item.sgst_rate || 0)/100))).toFixed(2); },
    igstAmount(item){ return ((this.taxable(item) * (Number(item.igst_rate || 0)/100))).toFixed(2); },
    totalAmount(item){
      let total = Number(this.taxable(item));
      if(this.quotation?.nature_of_sale === 'Intrastate'){
        total += Number(this.cgstAmount(item)) + Number(this.sgstAmount(item));
      } else if(this.quotation?.nature_of_sale === 'Interstate'){
        total += Number(this.igstAmount(item));
      }
      return total.toFixed(2);
    },

    openAddVendorPopup(){
      this.newVendorName = '';
      this.showVendorPopup = true;
    },
    closeAddVendorPopup(){
      this.showVendorPopup = false;
    },
    addVendor(){
      if(!this.newVendorName.trim()) return;
      axios.post('/api/vendors', { name: this.newVendorName.trim() })
        .then(res => {
          this.vendors.push(res.data);
          this.showVendorPopup = false;
        });
    },

    openVendorListPopup(item){
      this.currentItem = item;
      this.showVendorList = true;
    },
    closeVendorListPopup(){
      this.showVendorList = false;
    },
    selectVendor(vendor){
  if(this.currentItem){
    this.currentItem.vendor_id = vendor.id;
    this.currentItem.vendor_name = vendor.name;

    axios.post('/api/po-item-vendor',{
      po_id: this.po.id,
      item_sr: this.currentItem.sr,
      description: this.currentItem.description,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      in_stock: this.currentItem.in_stock,
      qty: this.currentItem.qty,
      rate: this.currentItem.rate
    });
  }
  this.showVendorList = false;
}
  }
}
</script>


<style scoped>
/* PAGE BACKGROUND */
.page-bg {
  background: #f4f6f9;
  min-height: 100vh;
  padding: 24px;
}

/* COMPANY HEADER */
.company-header {
  background: #fff;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.06);
}
.company-header h4 {
  margin: 0;
  font-weight: 600;
  color: #34495e;
}

/* CARD */
.card {
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* CARD HEADER */
.card-header {
  padding: 0px 20px;
  font-weight: 600;
  font-size: 15px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* TABLE CARD */
.table-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-top: 20px;
}

/* TABLE HEADER */
.table-header {
  background: linear-gradient(135deg,#0d6efd,#4f8ef7);
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* SEARCH INPUT */
.table-header input {
  border-radius: 8px;
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
  width: 200px;
}

/* MODERN TABLE */
.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.modern-table thead {
  background: #f8f9fa;
}

.modern-table th, .modern-table td {
  padding: 12px 14px;
  /* text-align: center; */
  border-bottom: 1px solid #e9ecef;
}

.modern-table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.4px;
}

.modern-table tbody tr:nth-child(even) {
  background: #fafbfc;
}

.modern-table tbody tr:hover {
  background: #eef5ff;
  transform: scale(1.002);
}

.desc-col {
  text-align: left;
  /* font-weight: 600; */
  color: #2c3e50;
}

.qty-badge {
  background: #e7f1ff;
  color: #0d6efd;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.money {
  font-weight: 500;
}

.discount {
  color: #dc3545;
  font-weight: 600;
}

.total {
  font-weight: 700;
  color: #198754;
}

/* V-SELECT */
.v-select {
  font-size: 14px;
}

.vs__dropdown-toggle {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  min-height: 36px;
}

.vs__search {
  font-size: 14px;
  padding: 4px;
}

.vs__dropdown-menu {
  position: absolute !important;
  z-index: 1050 !important; /* above table but below modal (9999) */
  width: max-content; /* prevents shrinkage */
  min-width: 150px; /* optional */
}

/* POPUP MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.modal-box {
  background: #ffffff;
  width: 460px;
  max-width: 92%;
  border-radius: 14px;
  padding: 26px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.25);
  animation: modalFade .25s ease;
}

.modal-box h5 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 18px;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.modal-box input {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 10px;
  margin: 3px;
  font-size: 14px;
  transition: all .2s ease;
}

.modal-box input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13,110,253,0.12);
  outline: none;
}

.modal-box .btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 16px;
}

.modal-box .btn-success {
  background: #28a745;
  border: none;
  color: #fff;
}

.modal-box .btn-success:hover {
  background: #218838;
}

.modal-box .btn-secondary {
  background: #6c757d;
  border: none;
  color: #fff;
}

.modal-box .text-end {
  margin-top: 10px;
      gap: 6px;
    display: flex;
}

@keyframes modalFade {
  from {
    transform: translateY(-20px) scale(.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
.table-card .card-body {
  overflow-x: auto; /* horizontal scroll only */
  overflow-y: visible; /* allow dropdown to show */
}
.vs__dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
}
.modal-box .vs__dropdown-menu {
  z-index: 10000 !important;
}
.table-card {
  overflow: visible !important; /* allow dropdowns to escape */
}

.vendor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(140px,1fr));
  gap: 12px;
  max-height: 350px;
  overflow-y: auto;
  margin-top: 15px;
}
.vendor-card {
  background: #f4f6f9;
  padding: 10px;
  text-align: center;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}
.vendor-card:hover {
  background: #0d6efd;
  color: white;
  transform: scale(1.05);
}
.add-vendor-section input {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
}

.add-vendor-section button {
  border-radius: 8px;
  font-weight: 600;
}
.add-vendor-section input {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  margin-bottom: 5px;
}

.add-vendor-section button {
  border-radius: 8px;
  font-weight: 600;
}
/* Vendor Popup */
.vendor-list-box {
  width: 85%;
  max-width: 95%;
  padding: 24px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.vendor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.vendor-header h5 {
  margin: 0;
  font-weight: 600;
}

/* Search */
.vendor-search {
  width: 220px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 14px;
}

/* Vendor Grid */
.vendor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px,1fr));
  gap: 14px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Vendor Card */
.vendor-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fb;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

/* Hover */
.vendor-card:hover {
  background: #eef4ff;
  border-color: #0d6efd;
  transform: translateY(-2px);
}

/* Avatar */
.vendor-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg,#0d6efd,#4f8ef7);
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Info */
.vendor-info {
  text-align: left;
}

.vendor-name {
  font-weight: 600;
  color: #2c3e50;
}

.vendor-meta {
  font-size: 12px;
  color: #6c757d;
}

/* Footer */
.vendor-footer {
  margin-top: 18px;
  text-align: right;
}
.vendor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px,1fr));
  gap: 14px;
  overflow-y: auto;
  max-height: 55vh;
  padding-right: 4px;
}
.vendor-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fb;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.vendor-card:hover {
  background: #eef4ff;
  border-color: #0d6efd;
  transform: translateY(-2px);
}
.vendor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 10px;
}

.vendor-search {
  width: 220px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 14px;
}
@media (max-width: 768px) {

  .modal-box {
    width: 95%;
    padding: 18px;
  }

  .vendor-header {
    flex-direction: column;
    align-items: stretch;
  }

  .vendor-search {
    width: 100%;
  }

  .vendor-grid {
    grid-template-columns: 1fr;
  }

  .vendor-card {
    padding: 14px;
  }

}
.btn-primary{
  background: #0d6efd;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
}
.btn-primary:hover{
  background: #0b5ed7;
  cursor: pointer;
}
.btn-dark{
background: #ffffff;
    border: none;
    color: #000000;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 500;
}
.btn-dark:hover{
 cursor: pointer;
  
}
.btn-light{
  background: #f8f9fa;
  border: none;
  color: #212529;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
}
.btn-light:hover{
  background: #e2e6ea;
}
.stock-dropdown {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
}

.stock-dropdown:focus {
  outline: none;
  border-color: #0d6efd;
}
.btn-edit {
  background: #ffc107;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  margin-right: 5px;
  cursor: pointer;
}

.btn-edit:hover {
  background: #e0a800;
}

.btn-delete {
  background: #dc3545;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: white;
  cursor: pointer;
}

.btn-delete:hover {
  background: #c82333;
}
.btn-success {
  background: #28a745;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: white;
  cursor: pointer;
}
.btn-success:hover {
  background: #218838;
}
.heading {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}
.btn-primary:disabled{
  background:#ccc;
  cursor:not-allowed;
}
</style>