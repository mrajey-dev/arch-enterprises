<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">

      <h2>Generate Joining Letter</h2>

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
            <label>Stipend (During probation period)/Month</label>
            <input v-model="form.salary" type="text" placeholder="Enter annual salary" />
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

<!-- ================= JOINING LETTER PREVIEW ================= -->
<div ref="offerLetter" class="offer-letter">

  <!-- Top Accent Bar -->
  <div class="top-accent"></div>

  <!-- Header -->
  <div class="letter-header">
    <img :src="logo" class="company-logo" />

    <div class="company-details">
      <h2>Arch Enterprises</h2>
      <p>Plot No. 49, Prathamesh, Kamathwade, Nashik, Maharashtra - 422008</p>
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
      <strong>Subject: Confirmation of Employment</strong>
    </p>

    <p>Dear <strong>{{ form.name }}</strong>,</p>

    <p>
      This is to formally confirm that you have joined
      <strong>Arch Enterprises</strong> as
      <strong>{{ form.position }}</strong> effective from
      <strong>{{ formattedJoiningDate }}</strong>.
    </p>

    <p>
      You will be employed under a
      <strong>{{ form.type }}</strong> working model with an
      annual Cost to Company (CTC) of
      <strong>₹{{ form.salary }}</strong>.
    </p>

    <p>
      During your employment, you are expected to maintain
      professionalism, adhere to company policies,
      and perform your duties diligently.
    </p>

    <p>
      Your employment shall be governed by the terms and
      conditions discussed at the time of offer and
      outlined in company policies.
    </p>

    <p>
      We are pleased to welcome you to the team and look
      forward to your valuable contributions to the
      growth and success of the organization.
    </p>

  </div>

  <!-- Signature -->
  <div class="signature-section">

    <div class="sign-block">
      <p>For Arch Enterprises</p>
      <div class="sign-line"></div>
      <strong>HR Manager</strong>
    </div>

    <div class="sign-block">
      <p>Employee Signature</p>
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

      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import html2pdf from "html2pdf.js"
import logoImage from '@/assets/logo.png'

export default {
  components: { Sidebar },

  data() {
    return {
        logo: logoImage,
      isMobile: false,
      isSidebarVisible: true,

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
      formatDate(date) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' }
    return date.toLocaleDateString('en-GB', options)
  },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

 generatePDF() {
  if (!this.form.name || !this.form.position || !this.form.salary) {
    alert("Please fill all required fields")
    return
  }

  const element = this.$refs.offerLetter

  const options = {
    margin: 0,
    filename: `${this.form.name}_Offer_Letter.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: {
      unit: 'px',
      format: [794, 1123],   // exact A4 size
      orientation: 'portrait'
    }
  }

  html2pdf().set(options).from(element).save()
}
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
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
  font-size: 15px;
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
  margin-top: 60px;
  font-size: 14px;
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
</style>