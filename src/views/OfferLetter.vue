<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">

<div class="page-header">
  <h2>Generate Offer Letter</h2>

 <button class="view-btn" @click="openOfferModal">
  View All Offer Letters
</button>
</div>

        <!-- ================= FORM ================= -->
        <div class="form-section">

          <div class="form-group">
            <label>Candidate Name</label>
            <input v-model="form.name" type="text" placeholder="Enter candidate name" />
          </div>

          <div class="form-group">
            <label>Position</label>
            <input v-model="form.position" type="text" placeholder="Enter position" />
          </div>

          <div class="form-group">
             <label>Stipend (During probation period per month)</label>
            <input v-model="form.salary" type="text" placeholder="Enter salary" />
          </div>
<div class="form-group">
  <label>Probation Period</label>
  <select v-model="form.probationPeriod">
    <option disabled value="">Select probation period</option>
    <option value="3 Months">3 Months</option>
    <option value="6 Months">6 Months</option>
    <option value="1 Year">1 Year</option>
  </select>
</div>
          <div class="form-group">
            <label>Joining Date</label>
            <input v-model="form.joiningDate" type="date" />
          </div>

          <div class="form-group">
            <label>Work Type</label>
            <select v-model="form.type">
              <option value="Onsite">Onsite</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <button class="generate-btn" @click="generatePDF">
            Save as PDF
          </button>
        </div>

        <!-- ================= OFFER LETTER PREVIEW ================= -->
 <div ref="offerLetter" class="offer-letter">

  <!-- Top Accent Bar -->
  <div class="top-accent"></div>

  <!-- Header -->
  <div class="letter-header">
    <img :src="logo" class="company-logo" />

    <div class="company-details">
      <h2>Arch Enterprises</h2>
      <p>Plot No. 49, Prathamesh, Khutwadnagar, Nashik, Maharashtra - 422008</p>
      <p>Email: contact@archenterprises.co.in | +91 8390704453</p>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Date -->
  <div class="letter-date">
    <span>Date:</span> {{ todayDate }}
  </div>

  <!-- Body -->
  <div class="letter-body">

    <p><strong>To,</strong><br />
      <strong>{{ form.name }}</strong>
    </p>

    <p class="subject">
      <strong>Subject: Offer of Employment</strong>
    </p>

    <p>Dear <strong>{{ form.name }}</strong>,</p>

    <p>
      We are delighted to formally offer you the position of
      <strong>{{ form.position }}</strong> with
      <strong>Arch Enterprises</strong>.
    </p>

    <p>
      You will be placed on probation for a period of <strong>{{ form.probationPeriod }}</strong>.
During this probation period, you will receive a stipend of <strong>₹{{ form.salary }}</strong> per month.
Upon successful completion of the probation period, management reserves the right to revise your salary based on your performance.

      
    </p>

    <p>
      Your employment will commence on
      <strong>{{ formattedJoiningDate }}</strong>
      under a <strong>{{ form.type }}</strong> working model.
    </p>

    <p>
      You will be reporting to the HR Department and are expected to
      adhere to all company policies and performance standards.
    </p>

    <p>
      This offer is subject to satisfactory background verification and
      submission of required documentation.
    </p>

    <p>
      We look forward to welcoming you to our team and wish you a
      successful and rewarding career with us.
    </p>

  </div>

<!-- Signature -->
<div class="signature-section">

  <div class="sign-block">
    <!-- <p>For Arch Enterprises</p> -->

    <!-- HR Signature Image -->
  


    <div class="sign-line"></div>
    <strong>DIRECTOR</strong>
  </div>

  <div class="sign-block">
    <p></p>
    <div class="sign-line"></div>
    <strong>{{ form.name }}</strong>
  </div>

</div>
<!-- ===== Footer ===== -->
<div class="letter-footer">

  <div class="footer-divider"></div>

  <div class="footer-content">
    <div class="footer-left">
      <p><strong>Arch Enterprises</strong></p>
      <p>IT Solutions | Software Development | Cloud Services</p>
    </div>

    <div class="footer-right">
      <p>www.archenterprises.co.in</p>
      <p>contact@archenterprises.co.in</p>
      <p>+91 8390704453</p>
    </div>
  </div>

  <div class="footer-bottom">
    <p>
      This document is confidential and intended solely for the recipient.
      Unauthorized use, disclosure, or distribution is strictly prohibited.
    </p>
  </div>

</div>

</div>

      <!-- ================= OFFER LIST MODAL ================= -->
<div v-if="showOfferModal" class="modal-overlay">
  <div class="modal-container">

    <div class="modal-header">
      <h3>All Offer Letters</h3>
      <button class="close-btn" @click="closeOfferModal">✖</button>
    </div>

    <div class="modal-body">
      <table class="offer-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Position</th>
      <th>Salary</th>
      <th>Joining Date</th>
      <th>Type</th>
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    <tr v-for="offer in offerLetters" :key="offer.id">
      <td>{{ offer.name }}</td>
      <td>{{ offer.position }}</td>
      <td>₹{{ offer.salary }}</td>
      <td>{{ offer.joining_date }}</td>
      <td>{{ offer.work_type }}</td>
      <td>
        <button class="view-letter-btn" @click="viewLetter(offer)">
          View
        </button>

        <button class="edit-letter-btn" @click="editLetter(offer)">
          Edit
        </button>

        <button class="delete-letter-btn" @click="deleteLetter(offer.id)">
          Delete
        </button>
      </td>
    </tr>
  </tbody>
</table>
    </div>

  </div>
</div>

</section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import html2pdf from "html2pdf.js"
import logoImage from '@/assets/logo.png'
import signatureImage from '@/assets/signature.png'

import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  components: { Sidebar },

 data() {
  return {
    editingId: null,
      probationPeriod: '',
    logo: logoImage,
    signature: signatureImage,
    isMobile: false,
    isSidebarVisible: true,

    showOfferModal: false,
    offerLetters: [],

    form: {
      name: '',
      position: '',
      salary: '',
      joiningDate: '',
      type: 'Onsite'
    }
  }
},
computed: {
  todayDate() {
    return this.formatDate(new Date())
  },
  formattedJoiningDate() {
    if (!this.form.joiningDate) return ''
    return this.formatDate(new Date(this.form.joiningDate))
  }
},

  methods: {
    editLetter(offer) {
  this.form = {
    name: offer.name,
    position: offer.position,
    salary: offer.salary,
    joiningDate: offer.joining_date,
    type: offer.work_type,
    probationPeriod: offer.probation_period,
  }

  this.editingId = offer.id   // track editing record
  this.showOfferModal = false

  this.$nextTick(() => {
    this.$refs.offerLetter.scrollIntoView({ behavior: 'smooth' })
  })
},
async deleteLetter(id) {
  if (!confirm("Are you sure you want to delete this offer letter?")) {
    return
  }

  try {
    await axios.delete(
      `https://employees.archenterprises.co.in/api/api/offer-letters/${id}`
    )

    // Remove deleted record from table instantly
    this.offerLetters = this.offerLetters.filter(
      offer => offer.id !== id
    )

    ("Offer Letter Deleted Successfully")

  } catch (error) {
    console.error(error)
    toastError("Failed to delete offer letter")
  }
},
    viewLetter(offer) {

  this.form = {
    name: offer.name,
    position: offer.position,
    salary: offer.salary,
    joiningDate: offer.joining_date,
    type: offer.work_type
  }

  this.showOfferModal = false

  // Scroll to preview smoothly
  this.$nextTick(() => {
    this.$refs.offerLetter.scrollIntoView({ behavior: 'smooth' })
  })
},
    async openOfferModal() {
  try {
    const response = await axios.get(
      "https://employees.archenterprises.co.in/api/api/offer-letters"
    )

    this.offerLetters = response.data
    this.showOfferModal = true

  } catch (error) {
    console.error(error)
    toastError("Failed to load offer letters")
  }
},

closeOfferModal() {
  this.showOfferModal = false
},
goToOfferList() {
  this.$router.push({ name: 'OfferLetterList' })
},
      formatDate(date) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' }
    return date.toLocaleDateString('en-GB', options)
  },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

async generatePDF() {
  if (!this.form.name || !this.form.position || !this.form.salary || !this.form.probationPeriod) {
    toastWarning("Please fill all required fields")
    return
  }

  try {

    // 1️⃣ Save in database first
  if (this.editingId) {
  await axios.put(
    `https://employees.archenterprises.co.in/api/api/offer-letters/${this.editingId}`,
    this.form
  )
  toastSuccess("Offer Letter Updated Successfully")
  this.editingId = null
} else {
  await axios.post(
    "https://employees.archenterprises.co.in/api/api/offer-letters",
    this.form
  )
  toastSuccess("Offer Letter Download Successfully")
}

    // 2️⃣ Generate PDF
    const element = this.$refs.offerLetter

    const options = {
      margin: 0,
      filename: `${this.form.name}_Offer_Letter.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: {
        unit: 'px',
        format: [794, 1123],
        orientation: 'portrait'
      }
    }

    html2pdf().set(options).from(element).save()

    toastSuccess("Offer Letter Saved Successfully")

  } catch (error) {
    console.error(error)
    toastError("Something went wrong")
  }
}
  },

async mounted() {
  this.checkIfMobile()
  window.addEventListener('resize', this.checkIfMobile)

  const token = localStorage.getItem('token')
  if (!token) {
    this.$router.push('/auth')
  }

  // 🔥 LOAD DATA IF ID EXISTS
  const id = this.$route.params.id

  if (id) {
    try {
      const response = await axios.get(
        `https://employees.archenterprises.co.in/api/offer-letters/${id}`
      )

      // Map API fields to your form structure
      this.form = {
        name: response.data.name,
        position: response.data.position,
        salary: response.data.salary,
        joiningDate: response.data.joining_date,
        type: response.data.work_type
      }

    } catch (error) {
      console.error(error)
      toastError("Failed to load offer letter")
    }
  }
},

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>

/* Form */
.form-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.form-group input,
.form-group select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.generate-btn {
  margin-top: 10px;
  padding: 10px;
  border: none;
  background: var(--primary);
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

/* Offer Letter */
.offer-letter {
  background: white;
  padding: 40px;
  border-radius: 12px;
  line-height: 1.7;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.offer-letter h1 {
  text-align: center;
  margin-bottom: 20px;
  font-weight: 800;
}
.offer-letter {
  background: white;
  padding: 50px;
  border-radius: 10px;
  line-height: 1.8;
  font-size: 12px;
  color: #333;
  width: 800px;
  margin: auto;
}

/* Header */
.letter-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.company-logo {
  width: 100px;
  height: auto;
}

.company-details h2 {
  margin: 0;
  font-size: 32px;
}

.company-details p {
  margin: 2px 0;
  font-size: 13px;
}

.letter-date {
  text-align: right;
  margin-top: 20px;
  margin-bottom: 20px;
}

.letter-body p {
  margin-bottom: 15px;
  text-align: justify;
}

.signature-section {
    display: flex;
    justify-content: space-between;
    margin-top: 37px;
    align-items: center;
}
.main-content {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 20px;
}

/* Sidebar width */
::v-deep(.sidebar) {
  width: 220px;
  flex-shrink: 0;
}

/* Content area */
.content {
  flex: 1;
}
/* ===== OFFER LETTER PROFESSIONAL DESIGN ===== */

.offer-letter {
  background: #fff;
  width: 794px;              /* A4 width */
  min-height: 1123px;        /* A4 height */
  margin: auto;
  padding: 60px 70px;
  box-sizing: border-box;
  color: #2c2c2c;
  position: relative;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  border-radius: 6px;
}

/* Top Accent Bar */
.top-accent {
  position: absolute;
  top: 0;
  left: 0;
  height: 8px;
  width: 100%;
  background: linear-gradient(90deg, #0d6efd, #00c6ff);
  border-radius: 6px 6px 0 0;
}

/* Header */
.letter-header {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 20px;
}

.company-logo {
  width: 90px;
}

.company-details h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
}

.company-details p {
  margin: 2px 0;
  font-size: 13px;
  color: #555;
}

/* Divider */
.divider {
  height: 1px;
  background: #e5e5e5;
  margin: 25px 0;
}

/* Date */
.letter-date {
  text-align: right;
  font-size: 14px;
  margin-bottom: 30px;
}

/* Body */
.letter-body p {
  font-size: 13px;
  line-height: 1.9;
  margin-bottom: 18px;
  text-align: justify;
}

/* Subject */
.subject {
  font-size: 16px;
  margin: 20px 0;
}

/* Signature Section */
.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 80px;
}

.sign-block {
  width: 40%;
  text-align: center;
}

.sign-line {
  margin: 40px 0 10px;
  border-bottom: 1px solid #000;
}
/* ===== PERFECT A4 PAGE LAYOUT ===== */

.offer-letter {
  width: 794px;              /* A4 width in px */
  height: 1123px;            /* A4 height in px */
  background: #fff;
  margin: auto;
  padding: 60px 70px;
  box-sizing: border-box;
  color: #2c2c2c;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  border-radius: 6px;

  display: flex;
  flex-direction: column;
}

/* Top Accent */
.top-accent {
  position: absolute;
  top: 0;
  left: 0;
  height: 8px;
  width: 100%;
  background: linear-gradient(90deg, #0d6efd, #00c6ff);
  border-radius: 6px 6px 0 0;
}

/* Header */
.letter-header {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 20px;
}

.company-logo {
  width: 90px;
}

.company-details h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
}

.company-details p {
  margin: 2px 0;
  font-size: 13px;
  color: #555;
}

.divider {
  height: 1px;
  background: #e5e5e5;
  margin: 25px 0;
}

/* Date */
.letter-date {
  text-align: right;
  font-size: 14px;
  margin-bottom: 25px;
}

/* Body takes available space */
.letter-body {
  flex: 1;
}

.letter-body p {
  font-size: 13px;
  line-height: 1.8;
  margin-bottom: 15px;
  text-align: justify;
}

.subject {
  font-size: 15px;
  margin: 20px 0;
}

/* Signature */
.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
}

.sign-block {
  width: 40%;
  text-align: center;
}

.sign-line {
  margin: 40px 0 10px;
  border-bottom: 1px solid #000;
}

/* ===== FOOTER (NOW FLEX BASED — NOT ABSOLUTE) ===== */

.letter-footer {
  margin-top: auto;  /* pushes footer to bottom */
  font-size: 11px;
  color: #666;
}

.footer-divider {
  height: 2px;
  background: linear-gradient(90deg, #0d6efd, #00c6ff);
  margin: 15px 0;
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
  font-size: 10px;
  margin-top: 8px;
  color: #888;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-btn {
  padding: 8px 14px;
  border: none;
  background: #0d6efd;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.3s;
}

.view-btn:hover {
  background: #084298;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background: #fff;
  width: 90%;
  max-width: 1000px;
  border-radius: 12px;
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.close-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.offer-table {
  width: 100%;
  border-collapse: collapse;
}

.offer-table th,
.offer-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.offer-table th {
  background: #1e3c72;
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.view-letter-btn {
  background: #1e3c72;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.view-letter-btn:hover {
  background: #16325c;
}
.edit-letter-btn {
  background: #f4b400;
  color: #000;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  margin-left: 5px;
  cursor: pointer;
}

.delete-letter-btn {
  background: #e53935;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  margin-left: 5px;
  cursor: pointer;
}

.edit-letter-btn:hover {
  background: #d89c00;
}

.delete-letter-btn:hover {
  background: #c62828;
}
.hr-signature {
    height: 50px;
    margin-bottom: -25px;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 60px;
}

.sign-block {
  text-align: center;
  width: 200px;
}

.sign-line {
  border-top: 1px solid #000;
  margin-top: 10px;
}
</style>