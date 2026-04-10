<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-file-signature"></i>
            </div>
            <div>
              <h1>Generate Offer Letter</h1>
              <p class="subtitle-modern">Create professional employment offers</p>
            </div>
          </div>
          <button class="register-btn-modern secondary" @click="openOfferModal">
            <i class="fas fa-folder-open"></i>
            <span>View All Offer Letters</span>
          </button>
        </div>

        <!-- Form Section -->
        <div class="form-card-premium">
          <div class="section-title-modern">
            <i class="fas fa-edit"></i>
            <span>Candidate Details</span>
          </div>

          <div class="form-grid-premium">
            <div class="form-field">
              <label>Candidate Name <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-user field-icon"></i>
                <input v-model="form.name" type="text" placeholder="Enter candidate name" />
              </div>
            </div>

            <div class="form-field">
              <label>Position <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-briefcase field-icon"></i>
                <input v-model="form.position" type="text" placeholder="Enter position" />
              </div>
            </div>

            <div class="form-field">
              <label>Stipend (per month) <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-rupee-sign field-icon"></i>
                <input v-model="form.salary" type="text" placeholder="Enter stipend amount" />
              </div>
            </div>

            <div class="form-field">
              <label>Probation Period <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-hourglass-half field-icon"></i>
                <select v-model="form.probationPeriod">
                  <option disabled value="">Select probation period</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label>Joining Date <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-calendar-alt field-icon"></i>
                <input v-model="form.joiningDate" type="date" />
              </div>
            </div>

            <div class="form-field">
              <label>Work Type <span class="required-star">*</span></label>
              <div class="field-wrapper">
                <i class="fas fa-laptop-house field-icon"></i>
                <select v-model="form.type">
                  <option value="Onsite">🏢 Onsite</option>
                  <option value="Remote">🏠 Remote</option>
                  <option value="Hybrid">🔄 Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-submit-premium" @click="generatePDF">
              <i class="fas fa-file-pdf"></i> Save as PDF
            </button>
          </div>
        </div>

        <!-- Offer Letter Preview -->
        <div class="preview-section">
          <div class="section-title-modern">
            <i class="fas fa-eye"></i>
            <span>Offer Letter Preview</span>
          </div>

          <div ref="offerLetter" class="offer-letter-premium">
            <div class="top-accent"></div>

            <div class="letter-header">
              <img :src="logo" class="company-logo" alt="Logo" />
              <div class="company-details">
                <h2>Arch Enterprises</h2>
                <p>Plot No. 49, Prathamesh, Khutwadnagar, Nashik, Maharashtra - 422008</p>
                <p>Email: contact@archenterprises.co.in | +91 8390704453</p>
              </div>
            </div>

            <div class="divider"></div>

            <div class="letter-date">
              <span>Date:</span> {{ todayDate }}
            </div>

            <div class="letter-body">
              <p><strong>To,</strong><br /><strong>{{ form.name || '________' }}</strong></p>
              <p class="subject"><strong>Subject: Offer of Employment</strong></p>
              <p>Dear <strong>{{ form.name || '________' }}</strong>,</p>
              <p>We are delighted to formally offer you the position of <strong>{{ form.position || '________' }}</strong> with <strong>Arch Enterprises</strong>.</p>
              <p>You will be placed on probation for a period of <strong>{{ form.probationPeriod || '________' }}</strong>. During this probation period, you will receive a stipend of <strong>₹{{ form.salary || '________' }}</strong> per month. Upon successful completion of the probation period, management reserves the right to revise your salary based on your performance.</p>
              <p>Your employment will commence on <strong>{{ formattedJoiningDate || '________' }}</strong> under a <strong>{{ form.type || '________' }}</strong> working model.</p>
              <p>You will be reporting to the HR Department and are expected to adhere to all company policies and performance standards.</p>
              <p>This offer is subject to satisfactory background verification and submission of required documentation.</p>
              <p>We look forward to welcoming you to our team and wish you a successful and rewarding career with us.</p>
            </div>

            <div class="signature-section">
              <div class="sign-block">
                <div class="sign-line"></div>
                <strong>DIRECTOR</strong>
              </div>
              <div class="sign-block">
                <div class="sign-line"></div>
                <strong>{{ form.name || 'Candidate' }}</strong>
              </div>
            </div>

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
                <p>This document is confidential and intended solely for the recipient. Unauthorized use, disclosure, or distribution is strictly prohibited.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Offer List Modal -->
        <transition name="modal-fade">
          <div v-if="showOfferModal" class="modal-backdrop" @click.self="closeOfferModal">
            <div class="premium-modal large-modal" @click.stop>
              <div class="modal-decoration"></div>
              
              <div class="modal-header-premium">
                <div class="header-icon-premium">
                  <i class="fas fa-folder-open"></i>
                </div>
                <div class="header-text">
                  <h2>All Offer Letters</h2>
                  <p>Manage and view generated offers</p>
                </div>
                <button class="close-btn-premium" @click="closeOfferModal">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="modal-body-premium">
                <div class="table-wrapper-premium">
                  <table class="offer-table-premium">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Stipend</th>
                        <th>Joining Date</th>
                        <th>Work Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="offer in offerLetters" :key="offer.id">
                        <td class="employee-cell">
                          <div class="employee-info">
                            <div class="employee-avatar-small">
                              {{ getInitials(offer.name) }}
                            </div>
                            <span>{{ offer.name }}</span>
                          </div>
                        </td>
                        <td>{{ offer.position }}</td>
                        <td class="amount-cell">₹{{ formatAmount(offer.salary) }}</td>
                        <td class="date-cell">{{ formatDateSimple(offer.joining_date) }}</td>
                        <td><span class="work-type-badge">{{ offer.work_type }}</span></td>
                        <td>
                          <div class="action-group">
                            <button class="action-icon view" @click="viewLetter(offer)" title="View">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-icon edit" @click="editLetter(offer)" title="Edit">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-icon delete" @click="deleteLetter(offer.id)" title="Delete">
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="offerLetters.length === 0" class="empty-row">
                        <td colspan="6">
                          <div class="empty-state-small">
                            <i class="fas fa-inbox"></i>
                            <p>No offer letters found</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button class="btn-submit-premium" @click="closeOfferModal">
                  <i class="fas fa-check"></i> Close
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
import logoImage from '@/assets/logo.png'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },

  data() {
    return {
      editingId: null,
      logo: logoImage,
      isMobile: false,
      isSidebarVisible: true,
      showOfferModal: false,
      offerLetters: [],
      form: {
        name: '',
        position: '',
        salary: '',
        joiningDate: '',
        type: 'Onsite',
        probationPeriod: ''
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
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    formatAmount(amount) {
      if (!amount) return '0';
      return parseFloat(amount).toLocaleString('en-IN');
    },
    formatDateSimple(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    editLetter(offer) {
      this.form = {
        name: offer.name,
        position: offer.position,
        salary: offer.salary,
        joiningDate: offer.joining_date,
        type: offer.work_type,
        probationPeriod: offer.probation_period,
      }
      this.editingId = offer.id
      this.showOfferModal = false
      this.$nextTick(() => {
        this.$refs.offerLetter.scrollIntoView({ behavior: 'smooth' })
      })
      toastSuccess('Loading offer letter for editing...')
    },
    async deleteLetter(id) {
      if (!confirm("Are you sure you want to delete this offer letter?")) return
      try {
        await axios.delete(`https://employees.archenterprises.co.in/api/api/offer-letters/${id}`)
        this.offerLetters = this.offerLetters.filter(offer => offer.id !== id)
        toastSuccess("Offer letter deleted successfully")
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
        type: offer.work_type,
        probationPeriod: offer.probation_period,
      }
      this.showOfferModal = false
      this.$nextTick(() => {
        this.$refs.offerLetter.scrollIntoView({ behavior: 'smooth' })
      })
      toastSuccess('Loading offer letter preview...')
    },
    async openOfferModal() {
      try {
        const response = await axios.get("https://employees.archenterprises.co.in/api/api/offer-letters")
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
        if (this.editingId) {
          await axios.put(`https://employees.archenterprises.co.in/api/api/offer-letters/${this.editingId}`, this.form)
          toastSuccess("Offer letter updated successfully")
          this.editingId = null
        } else {
          await axios.post("https://employees.archenterprises.co.in/api/api/offer-letters", this.form)
          toastSuccess("Offer letter saved successfully")
        }

        const element = this.$refs.offerLetter
        const options = {
          margin: 0,
          filename: `${this.form.name}_Offer_Letter.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' }
        }
        html2pdf().set(options).from(element).save()
        toastSuccess("PDF generated successfully")
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
    const id = this.$route.params.id
    if (id) {
      try {
        const response = await axios.get(`https://employees.archenterprises.co.in/api/offer-letters/${id}`)
        this.form = {
          name: response.data.name,
          position: response.data.position,
          salary: response.data.salary,
          joiningDate: response.data.joining_date,
          type: response.data.work_type,
          probationPeriod: response.data.probation_period,
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
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
   ;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Content Header */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.subtitle-modern {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.register-btn-modern {
  padding: 12px 24px;
  background: var(--primary);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.register-btn-modern.secondary {
  background: linear-gradient(135deg, #10b981, #059669);
}

.register-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.section-title-modern i {
  color: var(--primary-color);
  font-size: 18px;
}

/* Form Card */
.form-card-premium {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.form-grid-premium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required-star {
  color: var(--danger);
}

.field-wrapper {
  position: relative;
}

.field-wrapper .field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.field-wrapper input,
.field-wrapper select {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.field-wrapper input:focus,
.field-wrapper select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-submit-premium {
  padding: 12px 28px;
  background: var(--primary);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-submit-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

/* Preview Section */
.preview-section {
  margin-top: 8px;
}

/* Offer Letter Premium */
.offer-letter-premium {
  background: white;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 50px 60px;
  border-radius: 20px;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
  position: relative;
  border: 1px solid #e5e7eb;
}

.top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
  border-radius: 20px 20px 0 0;
}

.letter-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.company-logo {
  width: 80px;
  height: auto;
}

.company-details h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.company-details p {
  font-size: 11px;
  color: #6b7280;
  margin: 2px 0;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, #e5e7eb, transparent);
  margin: 20px 0;
}

.letter-date {
  text-align: right;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 25px;
}

.letter-body {
  font-size: 12px;
  line-height: 1.8;
  color: #374151;
}

.letter-body p {
  margin-bottom: 14px;
  text-align: justify;
}

.subject {
  font-size: 13px;
  margin: 16px 0;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
}

.sign-block {
  text-align: center;
  width: 40%;
}

.sign-line {
  border-top: 1px solid #1a1a2e;
  margin-bottom: 8px;
  width: 100%;
}

.letter-footer {
  margin-top: 40px;
  font-size: 10px;
  color: #6b7280;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, #e5e7eb, transparent);
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
  margin-top: 12px;
  font-size: 9px;
  color: #9ca3af;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.premium-modal {
  position: relative;
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 1000px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.premium-modal.large-modal {
  max-width: 1100px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

.modal-header-premium {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-icon-premium {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.header-text p {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.close-btn-premium {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.close-btn-premium:hover {
  /* background: var(--danger); */
  color: rgb(13, 3, 3);
  transform: rotate(90deg);
}

.modal-body-premium {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fafbfc;
}

.modal-body-premium::-webkit-scrollbar {
  width: 6px;
}

.modal-body-premium::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 10px;
}

.modal-body-premium::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

.modal-footer-premium {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* Table Styles */
.table-wrapper-premium {
  overflow-x: auto;
}

.offer-table-premium {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.offer-table-premium thead {
  background: #f8fafc;
}

.offer-table-premium th {
  text-align: left;
  padding: 12px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.offer-table-premium td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.employee-cell {
  min-width: 140px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-avatar-small {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.amount-cell {
  font-weight: 600;
  color: var(--success);
}

.date-cell {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
}

.work-type-badge {
  display: inline-flex;
  padding: 3px 10px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.action-group {
  display: flex;
  gap: 6px;
}

.action-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon.view {
  background: #e0e7ff;
  color: var(--primary-color);
}

.action-icon.view:hover {
  /* background: var(--primary-color); */
  color: rgb(13, 8, 8);
}

.action-icon.edit {
  background: #d1fae5;
  color: var(--success);
}

.action-icon.edit:hover {
  /* background: var(--success); */
  color: rgb(4, 2, 2);
}

.action-icon.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-icon.delete:hover {
  /* background: var(--danger); */
  color: rgb(8, 4, 4);
}

.empty-state-small {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.empty-state-small i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .form-grid-premium {
    grid-template-columns: 1fr;
  }

  .offer-letter-premium {
    padding: 30px 40px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .content {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .register-btn-modern {
    justify-content: center;
  }

  .form-grid-premium {
    grid-template-columns: 1fr;
  }

  .offer-letter-premium {
    padding: 20px;
  }

  .letter-header {
    flex-direction: column;
    text-align: center;
  }

  .signature-section {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .sign-block {
    width: 80%;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .footer-right {
    text-align: center;
  }

  .premium-modal {
    max-width: 95%;
  }

  .modal-header-premium {
    padding: 16px 20px;
  }

  .modal-body-premium {
    padding: 16px;
  }

  .modal-footer-premium {
    padding: 16px 20px;
  }

  .offer-table-premium {
    font-size: 11px;
  }

  .offer-table-premium th,
  .offer-table-premium td {
    padding: 8px;
  }
}
</style>