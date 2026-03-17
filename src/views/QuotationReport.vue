<template>

<div class="report-wrapper">

  <!-- HEADER -->
  <div class="report-header">

    <div class="company">
      <h2>Quotation Report</h2>
      <p>{{ report?.po?.company_name }}</p>
    </div>

    <div class="quotation-info">
      <div><b>Quotation :</b> {{ report?.po?.quotation_against_po }}</div>
      <div><b>Date :</b> {{ today }}</div>
    </div>

  </div>

  <!-- TABLE -->
  <div class="table-container" v-if="report">

    <table class="report-table">

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
          <th>Total</th>
          <th>Vendor</th>
          <th>Stock</th>
        </tr>
      </thead>

      <tbody>

        <tr v-for="item in report.items" :key="item.sr">

          <td>{{item.sr}}</td>
          <td class="desc">{{item.description}}</td>
          <td>{{item.hsn}}</td>
          <td>{{item.qty}}</td>
          <td>{{item.uom}}</td>

          <td>₹ {{item.rate}}</td>
          <td>{{item.discount}}%</td>

          <td>₹ {{item.taxable}}</td>
          <td class="total">₹ {{item.total}}</td>

          <td>{{item.vendor}}</td>
          <td>
            <span class="stock" :class="item.in_stock=='Yes' ? 'yes':'no'">
              {{item.in_stock}}
            </span>
          </td>

        </tr>

      </tbody>

    </table>

  </div>

  <!-- GRAND TOTAL -->
  <div class="summary" v-if="report">

    <div class="summary-box">
      <div class="row">
        <span style="font-size: 12px;">Total Items</span>
        <span style="font-size: 12px;">{{ report.items.length }}</span>
      </div>

      <div class="row grand">
        <span>Grand Total</span>
        <span>₹ {{ grandTotal }}</span>
      </div>

    </div>

  </div>

  <!-- PRINT BUTTON -->
  <div class="print-section">
    <button class="print-btn" @click="printReport">
      Print / Save PDF
    </button>
  </div>

</div>

</template>

<script>

export default {

data(){
return{
report:null
}
},

computed:{
today(){
return new Date().toLocaleDateString()
},

grandTotal(){

if(!this.report) return 0

return this.report.items.reduce((sum,item)=>{
return sum + Number(item.total)
},0).toFixed(2)

}

},

mounted(){

const data = localStorage.getItem('quotation_report')

if(data){
this.report = JSON.parse(data)
}

},

methods:{
printReport(){
window.print()
}
}

}

</script>

<style scoped>

.report-wrapper{
max-width:1100px;
margin:auto;
padding:25px;
background:#fff;
font-family:"Segoe UI", Arial, Helvetica, sans-serif;
color:#333;
}

/* HEADER */

.report-header{
display:flex;
justify-content:space-between;
align-items:center;
border-bottom:2px solid #ddd;
padding-bottom:12px;
margin-bottom:20px;
}

.company h2{
margin:0;
font-size:15px;
color:#1e3a8a;
}

.company p{
margin:4px 0 0;
font-size:13px;
color:#666;
}

.quotation-info{
text-align:right;
font-size:12px;
line-height:1.6;
color:#444;
}

/* TABLE */

.table-container{
overflow-x:auto;
}

.report-table{
width:100%;
border-collapse:collapse;
font-size:11px;
}

.report-table th{
background:#1e40af;
color:white;
padding:8px;
border:1px solid #ccc;
text-align:center;
}

.report-table td{
padding:8px;
border:1px solid #ddd;
text-align:center;
}

.report-table tr:nth-child(even){
background:#fafafa;
}

.desc{
text-align:left;
max-width:260px;
word-wrap:break-word;
}

.total{
font-weight:600;
color:#059669;
}

/* STOCK */

.stock{
padding:3px 8px;
border-radius:4px;
font-size:10px;
font-weight:600;
}

.stock.yes{
background:#dcfce7;
color:#166534;
}

.stock.no{
background:#fee2e2;
color:#991b1b;
}

/* SUMMARY */

.summary{
display:flex;
justify-content:flex-end;
margin-top:25px;
}

.summary-box{
width:260px;
border:1px solid #ddd;
padding:14px;
border-radius:6px;
background:#fafafa;
}

.row{
display:flex;
justify-content:space-between;
padding:6px 0;
font-size:12px;
}

.grand{
font-weight:bold;
font-size:14px;
border-top:2px solid #ddd;
margin-top:8px;
padding-top:8px;
color:#000;
}

/* PRINT BUTTON */

.print-section{
text-align:center;
margin-top:25px;
}

.print-btn{
background:#2563eb;
border:none;
color:white;
padding:10px 22px;
border-radius:6px;
cursor:pointer;
font-size:14px;
}

.print-btn:hover{
background:#1d4ed8;
}

/* PRINT STYLE */

@media print{

body{
margin:0;
}

.print-section{
display:none;
}

.report-wrapper{
box-shadow:none;
padding:10px;
max-width:100%;
}

.report-table tr{
page-break-inside:avoid;
}

thead{
display:table-header-group;
}

}

</style>