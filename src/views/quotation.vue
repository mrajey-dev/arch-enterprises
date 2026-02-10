<template>
  
  <form id="quotationForm">

    <!-- Quotation Info -->
    <div class="card">

  <div class="two-col">

    <!-- LEFT SIDE : COMPANY INFORMATION -->
  <div class="company-info-box">
  <div class="company-left">
    <img src="https://archenterprises.co.in/ajay/ajay1.png" 
         alt="Company Logo" 
         class="company-logo" />
  </div>

  <div class="company-right">
    <h2 class="company-title">ARCH ENTERPRISES</h2>

    <p class="company-text">
      <strong>Address:</strong> Plot No. 49, Prathamesh, Khutwadnagar, Nashik, 
      Maharashtra, India - 422009
    </p>

    <p class="company-text">
      <strong>Phone:</strong> +918390704453
    </p>

    <p class="company-text">
      <strong>Email:</strong> prasad@archenterprises.co.in / contact@archenterprises.co.in
    </p>
  </div>
</div>


    <!-- RIGHT SIDE : QUOTATION INFORMATION -->
    <div>

      <!-- RIGHT SIDE : QUOTATION INFORMATION -->
<div class="quote-info">
<h2 class="company-title" data-v-cb242267="" style="font-size: 22px; justify-self: anchor-center;">QUOTATION</h2>
  <div class="row-field">
  <label>Quotation No.</label>
  <div class="static-field">
    {{ "AE/QUOTE/" + financialYear + "/" + form.quote_no }}
  </div>
</div>


  <div class="row-field">
    <label>Nature of Sale</label>
    <div class="static-field">{{ form.nature_of_sale }}</div>
  </div>

  <div class="row-field">
  <label>Date</label>
  <div class="static-field">{{ formattedDate }}</div>
</div>


  <div class="row-field">
    <label>Customer Ref.</label>
    <div class="static-field">{{ form.customer_reference }}</div>
  </div>

  <div class="row-field">
    <label>Recommend by </label>
    <div class="static-field">{{ form.recommended_by }}</div>
  </div>
    <div class="row-field">
    <label>Created by </label>
    <div class="static-field">{{ form.created_by }}</div>
  </div>

 <!-- <div class="row-field">
  <label>Created by</label>
  <div class="static-field">
    {{ loggedInUser || 'Administrator' }}
  </div>
</div> -->


</div>

    </div>
  </div>
</div>


    <!-- Billing & Shipping -->

   <div class="two-col">

  <!-- BILL TO -->
<!-- BILL TO -->
<!-- BILL TO -->
<div class="card">
  <div class="card-title">Bill To:</div>

  <div class="row-field">
    <label>Company Name</label>
    <div class="static-field">{{ form.bill_to.company }}</div>
  </div>

  <div class="row-field">
    <label>Address</label>
    <div class="static-field">{{ form.bill_to.address }}</div>
  </div>

  <div class="row-field">
    <label>GST No</label>
    <div class="static-field">{{ form.bill_to.gst }}</div>
  </div>

  <div class="row-field">
    <label>Contact Person</label>
    <div class="static-field">{{ form.bill_to.contact }}</div>
  </div>

  <div class="row-field">
    <label>Phone</label>
    <div class="static-field">{{ form.bill_to.phone }}</div>
  </div><div class="row-field">
    <label>Secondary Phone</label>
    <div class="static-field">{{ form.bill_to.sphone }}</div>
  </div>
</div>


<!-- SHIP TO -->
<div class="card">
  <div class="card-title">Ship To:</div>

  <div class="row-field">
    <label>Company Name</label>
    <div class="static-field">{{ form.ship_to.company }}</div>
  </div>

  <div class="row-field">
    <label>Address</label>
    <div class="static-field">{{ form.ship_to.address }}</div>
  </div>

  <div class="row-field">
    <label>GST No</label>
    <div class="static-field">{{ form.ship_to.gst }}</div>
  </div>

  <div class="row-field">
    <label>Contact Person</label>
    <div class="static-field">{{ form.ship_to.contact }}</div>
  </div>

  <div class="row-field">
    <label>Phone</label>
    <div class="static-field">{{ form.ship_to.phone }}</div>
  </div>
  <div class="row-field">
    <label>Secondary Phone</label>
    <div class="static-field">{{ form.ship_to.sphone }}</div>
  </div>
</div>


<!-- NEW ROW BELOW BOTH SECTIONS -->
<div class="two-column-row">
  <div class="row-field half">
    <label>Engine Serial No.</label>
    <div class="static-field">{{ form.engine_serial }}</div>
  </div>

  <div class="row-field half">
    <label>Model No.</label>
    <div class="static-field">{{ form.model_no }}</div>
  </div>
</div>



</div>


    <!-- Items -->


   <table id="itemsTable">
  <thead>
    <tr>
      <th rowspan="2" style="width:1%;">SR</th>
      <th rowspan="2" style="width:20%;">DESCRIPTION</th>
      <th rowspan="2" style="width:8%;">HSN/SAC</th>
      <th rowspan="2" style="width:1%;">QTY</th>
      <th rowspan="2" style="width:1%;">UOM</th>
      <th rowspan="2" style="width:8%;">RATE</th>
      <th rowspan="2" style="width:8%;">TOTAL</th>
      <th rowspan="2" style="width:1%;">DISC (%)</th>
      <th rowspan="2" style="width:8%;">TAXABLE</th>

      <th colspan="2" v-if="form.nature_of_sale === 'Intrastate'" style="width:4%;">CGST</th>
      <th colspan="2" v-if="form.nature_of_sale === 'Intrastate'" style="width:4%;">SGST</th>

      <th colspan="2" v-if="form.nature_of_sale === 'Interstate'" style="width:4%;">IGST</th>

      <th rowspan="2" style="width:10%;">LINE TOTAL<br>(Taxable + GST)</th>
    </tr>

    <tr>
      <th v-if="form.nature_of_sale === 'Intrastate'" style="width:1%;">Rate(%)</th>
      <th v-if="form.nature_of_sale === 'Intrastate'" style="width:3%;">Amt</th>

      <th v-if="form.nature_of_sale === 'Intrastate'" style="width:1%;">Rate(%)</th>
      <th v-if="form.nature_of_sale === 'Intrastate'" style="width:3%;">Amt</th>

      <th v-if="form.nature_of_sale === 'Interstate'" style="width:1%;">Rate(%)</th>
      <th v-if="form.nature_of_sale === 'Interstate'" style="width:3%;">Amt</th>
    </tr>
  </thead>

  <tbody>
    <tr v-for="(row, index) in items" :key="index">
      <td style="width:1%;"><div class="static-field">{{ row.sr }}</div></td>
      <td style="width:20%;"><div class="static-field" style="min-height:40px;">{{ row.desc }}</div></td>
      <td style="width:8%;"><div class="static-field" style="text-align: center">{{ row.hsn }}</div></td>
      <td style="width:1%;"><div class="static-field" style="text-align: center">{{ row.qty }}</div></td>
      <td style="width:1%;"><div class="static-field" style="text-align: center">{{ row.uom }}</div></td>
      <td style="width:8%;"><div class="static-field" style="text-align: right">{{ formatNumber(row.rate) }}</div></td>
      <td style="width:8%;"><div class="static-field" style="text-align: right">{{ formatNumber(row.total) }}</div></td>
      <td style="width:1%;"><div class="static-field" style="text-align: center">{{ row.discount }}</div></td>

      <td style="width:8%;"><div class="static-field" style="text-align: right">{{ formatNumber(row.taxable) }}</div></td>

      <td v-if="form.nature_of_sale === 'Intrastate'" style="width:1%;"><div class="static-field" style="text-align: right">{{ row.cgst_rate }}</div></td>
      <td v-if="form.nature_of_sale === 'Intrastate'" style="width:3%;"><div class="static-field" style="text-align: right">{{ formatNumber(row.cgst_amt) }}</div></td>

      <td v-if="form.nature_of_sale === 'Intrastate'" style="width:1%;"><div class="static-field" style="text-align: right">{{ row.sgst_rate }}</div></td>
      <td v-if="form.nature_of_sale === 'Intrastate'" style="width:3%;"><div class="static-field" style="text-align: right">{{ formatNumber(row.sgst_amt) }}</div></td>

      <td v-if="form.nature_of_sale === 'Interstate'" style="width:1%;"><div class="static-field" style="text-align: right">{{ row.igst_rate }}</div></td>
      <td v-if="form.nature_of_sale === 'Interstate'" style="width:3%;"><div class="static-field" style="text-align: right">{{ formatNumber(row.igst_amt) }}</div></td>

      <td style="width:10%;"><div class="static-field" style="text-align: right">{{ formatNumber(row.line_total) }}</div></td>
    </tr>

    <!-- ✅ FINAL TOTAL ROW (ONLY ONCE) -->
  <tr class="final-total-row">
    <td colspan="6" style="text-align:right;">TOTAL</td>

    <td style="text-align:right;">
      {{ formatNumber(columnTotals.total) }}
    </td>

    <td></td>

    <td style="text-align:right;">
      {{ formatNumber(columnTotals.taxable) }}
    </td>

    <template v-if="form.nature_of_sale === 'Intrastate'">
      <td></td>
      <td style="text-align:right;">—</td>
      <td></td>
      <td style="text-align:right;">
        {{ formatNumber(columnTotals.gst) }}
      </td>
    </template>

    <template v-if="form.nature_of_sale === 'Interstate'">
      <td></td>
      <td style="text-align:right;">
        {{ formatNumber(columnTotals.gst) }}
      </td>
    </template>

    <td></td>
  </tr>
  </tbody>
 

</table>


    <!-- Totals -->
<!-- Totals -->
<div class="totals-card" 
     style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-top:15px;">

       <!-- COMPANY REGISTRATION & BANK DETAILS -->
  <div style="flex:1; min-width:250px; padding:12px; border-radius:8px; 
              border:1px solid black; display:flex; gap:10px; flex-wrap:wrap;">

    <!-- Registration Details -->
    <div style="flex:1; min-width:130px; font-size:9px; line-height:1.4;">
      <strong style="font-size:9px; color:black; text-decoration:underline;">Company Registration Details</strong><br>
      <div>GST No.: 27ASHPK7144E1ZQ</div>
      <div>PAN No.: ASHPK7144E</div>
      <div>IEC Code: 3113021731</div>
      <div>UDYAM No.: UDYAM-MH-23-0024716</div>

    </div>

    <!-- Bank Details -->
    <div style="flex:1; min-width:130px; font-size:9px; line-height:1.4;">

  <!-- EXPORT ACCOUNT DETAILS -->
  <div v-if="form.nature_of_sale === 'Export'">
    <strong style="font-size:9px; color:black; text-decoration:underline;">
      Bank Details for Payment Transfer
    </strong><br>
    <div>Beneficiary Name: Arch Enterprises</div>
    <div>Bank Name: EEFC ICICI BANK</div>
    <div>Bank Address: Ambad Branch, Nashik</div>
    <div>Account Number: 108806000024</div>
    <div>IFSC Code: ICIC0001088</div>
    <div>Swift Code: ICICINBBCTS</div>

  </div>

  <!-- DOMESTIC ACCOUNT DETAILS -->
  <div v-else>
    <strong style="font-size:9px; color:black; text-decoration:underline;">
      Account Details for Payment
    </strong><br>
    <div>Beneficiary: Arch Enterprises</div>
    <div>Bank: Union Bank of India</div>
    <div>Branch: Ambad, Nashik</div>
    <div>A/C No.: 696901010050076</div>
    <div>IFSC: UBIN0569691</div>
  </div>

</div>


  </div>
  
  <!-- INVOICE TOTAL & AMOUNT IN WORDS -->
  <div style="flex:1; min-width:200px;  padding:10px 12px; 
              border-radius:8px; border:1px solid black;">

    <div class="row-field" style="margin-bottom:8px;">
      <label style="font-size:9px; font-weight:bold; color:black;">
  TOTAL ({{ form.currency }}):
</label>

      <div class="static-field" 
           style="font-size:11px; font-weight:700; color:black; margin-top:3px;">
        {{ formatNumber(form.subtotal) }}

      </div>
    </div>

    <div class="row-field" style="margin-top:10px;">
      <label style="font-size:9px; font-weight:bold; color:black;">Amount in Words:</label>
      <div class="static-field" 
           style="font-size:9px; font-weight:700; color:black; margin-top:3px;">
        {{ form.amount_words }}
      </div>
    </div>
  </div>



</div>




<!-- WRAPPER BOX WITH BORDER -->
<div style="border:1px solid black; padding:10px; margin-top:15px;">

  <!-- ROW 1: TERMS (75%) + SIGNATORY (25%) -->
  <div style="display:flex; justify-content:space-between; gap:10px;">

    <!-- LEFT: TERMS & CONDITIONS -->
    <div style="flex: 0 0 75%;">
      <div class="section-title">Terms & Conditions</div>
      <div class="static-field">
        {{ form.terms_conditions }}
      </div>
    </div>

    <!-- RIGHT: AUTHORIZED SIGNATORY -->
    <div style="flex: 0 0 25%; text-align:right;     margin-top: 35px;
    margin-left: -12px;">
     
      <h6 style="margin-top:5px;">For Arch Enterprises</h6><br>
       <label style="font-size: 9px">Authorized Signatory</label>
    </div>

  </div>

  <!-- ROW 2: DECLARATION -->
  <div style="margin-top:15px; font-size: 9px; line-height:1.4;">
    <div class="section-title">Declaration</div>
    <div class="static-field">
      I/we certify that our registration certificate under the GST Act, 2017 is in force on the date on which the supply 
      of goods specified in this tax invoice is made by me/by us & the transaction of supply covered by this tax invoice 
      has been effected by me/us & it shall be counted for in the turnover of supplies while filing of return and the due 
      tax if any payable has been paid or shall be paid. Further certify that particulars given above are true and 
      correct & amount indicated represents the prices actually charged and there is no flow additional consideration 
      directly or indirectly from the buyer.
    </div>
  </div>

 

</div>
 <!-- ROW 3: SUBJECT LINE -->
  <div style="margin-top:10px; font-size:9px; margin-bottom: 23px;    margin-top: -1px; border: 1px solid rgb(0, 0, 0);;
">
    <strong>Subject to Nashik Jurisdiction.</strong>
  </div>


    <div class="button-row">
      <button type="button" class="btn btn-print" @click="printQuotation">🖨️ Print Quotation</button>
    </div>

  </form>
</template>


<script>
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";
export default {
  data() {
    return {
      loggedInUser: "",
      form: {
        engine_serial: "",
model_no: "",
        currency: "INR",
        quote_no: "",
        nature_of_sale: "",
        date: "",
        customer_reference: "",
    recommended_by: "",
    terms_conditions: "",
       
        created_by: "",
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
        subtotal: "",
        total_tax: "",
        grand_total: "",
        amount_words: "INR ______ ONLY",
       
        declaration: "",
      },

      items: [
        {
          sr: 1,
          desc: "",
          hsn: "",
          qty: 1,
          uom: "",
          rate: "",
          total: "",
          disc: "",
          taxable: "",
          cgst_rate: "",
          cgst_amt: "",
          sgst_rate: "",
          sgst_amt: "",
          igst_rate: "",
          igst_amt: "",
          line_total: "",
        },
      ]
    };
  },
  watch: {
  "form.quote_no"(newVal) {
    if (!newVal) return;
    this.fetchQuotation(newVal);
  }
},

mounted() {
  this.getLoggedInUser();
  this.fetchQuotation();
  this.initUserSession();

  const savedId = localStorage.getItem("selectedQuotationId");
  if (savedId) {
    this.form.quote_no = savedId;
  }
},
computed: {
columnTotals() {
    let total = 0;
    let taxable = 0;
    let gst = 0;

    this.items.forEach(row => {
      total += Number(row.total) || 0;
      taxable += Number(row.taxable) || 0;

      if (this.form.nature_of_sale === "Intrastate") {
        gst += (Number(row.cgst_amt) || 0) + (Number(row.sgst_amt) || 0);
      }

      if (this.form.nature_of_sale === "Interstate") {
        gst += Number(row.igst_amt) || 0;
      }
    });

    return {
      total: total.toFixed(2),
      taxable: taxable.toFixed(2),
      gst: gst.toFixed(2)
    };
  },
  formattedDate() {
    if (!this.form.date) return "";

    const d = new Date(this.form.date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);

    return `${day}-${month}-${year}`; // DDMMYY format
  },
  financialYear() {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `${currentYear}-${nextYear.toString().slice(-2)}`; 
  }
},

  methods: {
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

  // STEP 2: GET LOGGED-IN USER
  async getLoggedInUser() {
    try {
      const res = await fetch(
        "https://employees.archenterprises.co.in/api/api/user",
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (res.status === 401) {
        console.warn("User not logged in");
        this.loggedInUser = null;
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const user = await res.json();
      this.loggedInUser = user.name; // ✅ STORE USER NAME
      console.log("Logged in as:", user.name);

    } catch (err) {
      console.error("Error fetching user:", err);
    }
  },
 formatNumber(value) {
  if (!value && value !== 0) return "";
  const number = Number(value);
  const hasDecimal = number % 1 !== 0;

  if (hasDecimal) {
    // Keep original decimal value, but format with Indian commas
    return number.toLocaleString("en-IN");
  } else {
    // Add .00 for whole numbers and format with Indian commas
    return number.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
},

    getCurrencyText(rupees, paise = 0) {
  let currencyFull = "";
  let paiseLabel = "";

  if (this.form.currency === "INR") {
    currencyFull = "Indian Rupees";
    paiseLabel = "Paise";
  } else if (this.form.currency === "USD") {
    currencyFull = "US Dollars";
    paiseLabel = "Cents";
  } else if (this.form.currency === "EUR") {
    currencyFull = "Euros";
    paiseLabel = "Cents";
  } else {
    currencyFull = this.form.currency;
    paiseLabel = "Cents";
  }

  const mainWords = rupees ? this.convertNumberToWords(rupees) : "Zero";
  const paiseWords = paise ? this.convertNumberToWords(paise) : "";

  let result = `${mainWords} ${currencyFull}`;

  if (paise > 0) {
    result += ` and ${paiseWords} ${paiseLabel}`;
  }

  return result + " Only";
},
convertNumberToWords(n) {
  // re-use your numberToWords logic
  return (function numberToWords(n) {
    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
      "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty",
      "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000)
      return a[Math.floor(n / 100)] + " Hundred " + numberToWords(n % 100);
    if (n < 100000)
      return numberToWords(Math.floor(n / 1000)) + " Thousand " + numberToWords(n % 1000);
    if (n < 10000000)
      return numberToWords(Math.floor(n / 100000)) + " Lakh " + numberToWords(n % 100000);
    return numberToWords(Math.floor(n / 10000000)) + " Crore " + numberToWords(n % 10000000);
  })(n);
},

  async initUserSession() {
    await fetch("/sanctum/csrf-cookie", {
      credentials: "include"
    });

    this.getLoggedInUser();
  },


calculateRow(row) {
  const qty = parseFloat(row.qty) || 0;
  const rate = parseFloat(row.rate) || 0;
  const disc = parseFloat(row.discount || row.disc) || 0;

  // Base total
  const baseTotal = qty * rate;
  row.total = baseTotal.toFixed(2);

  // Discount amount
  const discountAmt = (baseTotal * disc) / 100;

  // Taxable value after discount
  const taxable = baseTotal - discountAmt;
  row.taxable = taxable.toFixed(2);

  // Taxes
  if (this.form.nature_of_sale === "Intrastate") {
    row.cgst_amt = ((taxable * (row.cgst_rate || 0)) / 100).toFixed(2);
    row.sgst_amt = ((taxable * (row.sgst_rate || 0)) / 100).toFixed(2);
  }

  if (this.form.nature_of_sale === "Interstate") {
    row.igst_amt = ((taxable * (row.igst_rate || 0)) / 100).toFixed(2);
  }

  if (this.form.nature_of_sale === "Export") {
    row.cgst_amt = 0;
    row.sgst_amt = 0;
    row.igst_amt = 0;
  }

  // Final line total
  this.calculateLineTotal(row);

  // Update invoice total
  this.calculateInvoiceTotal();
},

    calculateInvoiceTotal() {
    let total = 0;

    this.items.forEach(row => {
      total += parseFloat(row.line_total) || 0;
    });

    this.form.subtotal = total.toFixed(2);

    this.form.amount_words = this.convertToWords(total);
  },

  // Convert number to words
convertToWords(num) {
  if (num === 0) return this.getCurrencyText(0);

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const numberToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000)
      return a[Math.floor(n / 100)] + " Hundred " + numberToWords(n % 100);
    if (n < 100000)
      return numberToWords(Math.floor(n / 1000)) + " Thousand " + numberToWords(n % 1000);
    if (n < 10000000)
      return numberToWords(Math.floor(n / 100000)) + " Lakh " + numberToWords(n % 100000);
    return numberToWords(Math.floor(n / 10000000)) + " Crore " + numberToWords(n % 10000000);
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  return this.getCurrencyText(rupees, paise);
},

    calculateLineTotal(row) {
    const taxable = parseFloat(row.taxable) || 0;

    const cgst = parseFloat(row.cgst_amt) || 0;
    const sgst = parseFloat(row.sgst_amt) || 0;
    const igst = parseFloat(row.igst_amt) || 0;

    // Intrastate = CGST + SGST
    if (this.form.nature_of_sale === "Intrastate") {
      row.line_total = (taxable + cgst + sgst).toFixed(2);
    }

    // Interstate = IGST only
    else if (this.form.nature_of_sale === "Interstate") {
      row.line_total = (taxable + igst).toFixed(2);
    }

    // Export = NO TAX → Only taxable value
    else if (this.form.nature_of_sale === "Export") {
      row.line_total = taxable.toFixed(2);
    }
  },
async fetchQuotation(id) {
  try {
    const res = await fetch(`/api/api/quotation/${id}`);
    if (!res.ok) {
      console.log("Quotation not found");
      return;
    }

    const data = await res.json();

    // ---------------- FILL MAIN FORM ----------------
    this.form.nature_of_sale = data.nature_of_sale ?? "";
    this.form.currency = data.currency ?? "INR";
    this.form.bill_to.company = data.company_name ?? "";
    this.form.ship_to.company = data.company_name ?? "";
this.form.customer_reference = data.customer_reference ?? "";
this.form.recommended_by = data.recommended_by ?? "";
this.form.terms_conditions = data.terms_conditions ?? "";
this.form.engine_serial = data.engine_serial ?? "";
this.form.model_no = data.model_no ?? "";
// SET DATE FROM created_at COLUMN
this.form.date = data.created_at ? data.created_at.substring(0, 10) : "";
this.form.created_by = this.form.created_by || data.created_by || "";
    // ---------------------------------------------------
    // 🔥 FETCH CUSTOMER DETAILS WHERE company matches
    // ---------------------------------------------------
    if (data.company_name) {
      const custRes = await fetch(`/api/api/customer/by-name/${encodeURIComponent(data.company_name)}`);

      if (custRes.ok) {
        const cust = await custRes.json();

        // ---------------- BILLING INFO ----------------
        this.form.bill_to.address = cust.billing_address ?? "";
        this.form.bill_to.gst = cust.gst_number ?? "";
        this.form.bill_to.contact = cust.contact_person ?? "";
        this.form.bill_to.phone = cust.contact_number ?? "";
        this.form.bill_to.sphone = cust.secondary_contact_number ?? "";

        // ---------------- SHIPPING INFO ----------------
        this.form.ship_to.address = cust.shipping_address ?? "";
        this.form.ship_to.gst = cust.gst_number ?? "";   // Usually same GST
        this.form.ship_to.contact = cust.contact_person ?? "";
        this.form.ship_to.phone = cust.contact_number ?? "";
        this.form.ship_to.sphone = cust.secondary_contact_number ?? "";

      }
    }

    // ---------------- FILL ITEMS TABLE ----------------
// ---------------- FILL ITEMS TABLE ----------------
if (Array.isArray(data.items)) {
  this.items = data.items.map((item, index) => ({
    sr: item.sr ?? index + 1,
    desc: item.description ?? item.desc ?? "",
    hsn: item.hsn ?? "",
    qty: item.qty ?? 0,
    uom: item.uom ?? "",
    rate: item.rate ?? 0,
    discount: item.discount ?? 0,

    total: item.total ?? 0,
    taxable: item.taxable ?? 0,

    cgst_rate: item.cgst_rate ?? 0,
    cgst_amt: item.cgst_amt ?? 0,
    sgst_rate: item.sgst_rate ?? 0,
    sgst_amt: item.sgst_amt ?? 0,
    igst_rate: item.igst_rate ?? 0,
    igst_amt: item.igst_amt ?? 0,

    line_total: item.line_total ?? 0
  }));
}


    // Recalculate totals
    this.$nextTick(() => {
      this.items.forEach(row => this.calculateRow(row));
      this.calculateInvoiceTotal();
    });

  } catch (err) {
    console.error("Error fetching quotation:", err);
  }
},



    addRow() {
      this.items.push({
        sr: this.items.length + 1,
        desc: "",
        hsn: "",
        qty: "",
        uom: "",
        rate: "",
        total: "",
        disc: "",
        taxable: "",
        cgst_rate: "",
        cgst_amt: "",
        sgst_rate: "",
        sgst_amt: "",
        igst_rate: "",
        igst_amt: "",
        line_total: ""
      });
    },

    removeRow(index) {
      if (this.items.length > 1) {
        this.items.splice(index, 1);
      }
    },

    saveQuotation() {
      toastSuccess("Quotation Saved Successfully!");
    },

printQuotation() {
  const quoteId = this.form.quote_no;

  const company = (this.form.bill_to.company || "Customer")
    .replace(/\./g, ""); // ❌ remove dot only

  const originalTitle = document.title;
  document.title = `Quotation-${quoteId}-${company}`;

  this.$nextTick(() => {
    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  });
}


  }
};
</script>

<style scoped>
  tfoot {
  display: table-footer-group;
}

.company-info-box {
  display: flex;
  align-items: center;
  gap: 20px; /* space between logo and text */
}


.company-right {
  /* display: flex; */
  flex-direction: column;
}

.company-title {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
}

.company-text {
  margin: 3px 0;
  font-size: 14px;
}

.two-column-row {
  display: flex;
  gap: 20px;
      margin-top: -18px;
    margin-bottom: -12px;
}

.two-column-row .half {
  width: 50%;
}

@media print {
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* FIX: Prevent text from duplicating */
  .company-text {
    position: static !important;
    transform: none !important;
    zoom: 1 !important;
  }
}

@media print {
  .button-row {
    display: none !important;
  }
}

.row-field {
  display: flex;
  align-items: center;
}

.row-field label {
  width: 72px;        /* fixed width for labels */
  font-weight: bold;
}

.static-field {
  flex: 1;
  /* background: #f5f5f5; */
  padding: 6px 10px;
  border-radius: 4px;
  /* border: 1px solid #ddd; */
}

.company-info-box {
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #070303;
}

.company-logo {
 width: 39px;;
  margin-bottom: 68px;
}

.company-title {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 4px;
}

.company-text {
  margin: 10px 0;
  position: relative;
  font-size: 9px;
  line-height: 1.1;

}

.static-field {
  /* border: 1px solid #ccc; */
  padding: 4px 1px;
  border-radius: 6px;
  min-height: 0px;
  display: flex;
 text-align: left;
  font-size: 9px;
  white-space: pre-wrap;
  justify-content: space-around;
    flex-direction: column-reverse;
}
.invoice-total{
        font-size: 10px!important;
}
:root {
        --primary: #1d4ed8;
        --primary-light: #3b82f6;
        --primary-bg: #eff6ff;
        --bg: #f7f9fc;
        --border: #d1d5db;
        --text: #222;
        --muted: black;
        --card-bg: #ffffff;
    }

    body {
        font-family: "Poppins", "Segoe UI", Arial, sans-serif;
        background: var(--bg);
        margin: 0;
        padding: 30px;
        color: black;
    }

    form {
    max-width: 1000px;
    background: var(--card-bg);
    margin: auto;
}

    h1 {
        text-align: center;
        font-size: 1.8em;
        color: black;
        letter-spacing: 0.5px;
        margin-bottom: 25px;
    }

    .section-title {
    font-weight: 700;
    /* background: black; */
    color: black;
    padding: 5px 10px; /* reduced from 8px 12px */
    border-radius: 4px;
    font-size: 9px;
}

    label {
        display: block;
        font-weight: 600;
        /* margin-top: 10px; */
        color: var(--muted);
        font-size: 8px;
    }

   input,
textarea {
  border: none;
  border-bottom: 1px solid #ccc;
  outline: none;
  background: transparent;
}

input:focus,
textarea:focus {
  border-bottom: 1px solid black; /* optional focus effect */
  outline: none;
  box-shadow: none;
}


    input:focus, textarea:focus {
        border-color: var(--primary-light);
        box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
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
    border: 1px solid black;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.04);
    padding: 12px; /* reduced from 20px */
    margin-bottom: 10px; /* adds a tighter gap between cards */
}

    .card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

    .card-title {
        font-size: 1.05em;
        font-weight: 600;
        font-size: 8px;
        color: black;
        border-bottom: 2px solid var(--primary-light);
        padding-bottom: 0px;
            text-align: center;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Items Table */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        font-size: 9px;
    }

    table th, table td {
        border: 1px solid #420e0e;
        /* padding: 6px 8px; */
        text-align: center;
        vertical-align: middle;
    }

    table th {
        background: #f0f4ff;
        color: black;
        font-weight: 600;
    }

    table input, table textarea {
        border: none !important;
        background: transparent;
        outline: none;
        width: 100%;
        padding: 4px;
        font-size: 0.9em;
        text-align: center;
    }

    table textarea { resize: none; }

    table input:focus, table textarea:focus {
        box-shadow: none !important;
        border: none !important;
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
        background: black;
        color: #fff;
        margin-top: 8px;
            margin-bottom: 5px;
    }

    .add-row:hover { background: var(--primary-light); }

    .remove-row {
        background: black;
        color: white;
    }

    .remove-row:hover { background: #dc2626; }

    /* BEAUTIFUL TOTALS SECTION */
    .totals-card {
    border-radius: 8px;
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
        border-top: 2px solid black;
        font-size: 1.05em;
        color: black;
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
        color: black;
    }

    .submit-btn {
        display: block;
        width: 100%;
        background: black;
        color: white;
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
@media print {
  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }

  /* 🔥 Prevent total row from breaking */
  .final-total-row {
    font-weight: bold;
    background: #f5f5f5;
    page-break-inside: avoid;
  }
}

</style>
