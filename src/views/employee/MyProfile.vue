<template>
  <div class="layout">

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div v-if="!isMobile || !isSidebarVisible" class="profile-card-premium">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <div>
              <h1>My Profile</h1>
              <p class="subtitle-modern">Manage your personal information</p>
            </div>
          </div>
          <button class="edit-btn-premium" @click="editMode = true" :disabled="editMode">
            <i class="fas fa-edit"></i> Edit Profile
          </button>
        </div>

        <div v-if="user" class="profile-container-premium">
          <!-- ================= VIEW MODE ================= -->
          <template v-if="!editMode">
            <div class="profile-left-premium">
              <div class="profile-avatar-wrapper" @click="editMode = true">
                <div class="profile-avatar">
                  <img 
                    v-if="profileImageUrl" 
                    :src="profileImageUrl" 
                    alt="Profile Photo"
                    class="profile-photo"
                  />
                  <i v-else class="fas fa-user-circle"></i>
                </div>
                <div class="avatar-edit-hint">
                  <i class="fas fa-camera"></i> Click to change
                </div>
              </div>
              <h2 class="profile-name">{{ user.name }}</h2>
              <p class="profile-role">{{ user.department || 'Department Not Assigned' }}</p>
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ user.handle || '—' }}</span>
                  <span class="stat-label">Handle</span>
                </div>
              </div>
            </div>

            <div class="profile-right-premium">
              <div class="info-section">
                <div class="section-header">
                  <i class="fas fa-address-card"></i>
                  <span>Personal Information</span>
                </div>
                <div class="info-grid">
                  <div class="info-item">
                    <label><i class="fas fa-envelope"></i> Email</label>
                    <p>{{ user.email }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-phone-alt"></i> Mobile</label>
                    <p>{{ user.mobile || '—' }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-venus-mars"></i> Gender</label>
                    <p>{{ user.gender || '—' }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-tint"></i> Blood Group</label>
                    <p>{{ user.bloodgroup || '—' }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-calendar-alt"></i> Date of Birth</label>
                    <p>{{ formatDate(user.dateofbirth) }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-map-marker-alt"></i> City</label>
                    <p>{{ user.city || '—' }}</p>
                  </div>
                  <div class="info-item full-width">
                    <label><i class="fas fa-location-dot"></i> Address</label>
                    <p>{{ user.address || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Social Links Section -->
              <div v-if="user.instagram || user.portfolio || user.youtube || user.linkedin" class="info-section">
                <div class="section-header">
                  <i class="fas fa-share-alt"></i>
                  <span>Social Links</span>
                </div>
                <div class="social-links">
                  <a v-if="user.instagram" :href="user.instagram" target="_blank" class="social-link instagram">
                    <i class="fab fa-instagram"></i> Instagram
                  </a>
                  <a v-if="user.portfolio" :href="user.portfolio" target="_blank" class="social-link portfolio">
                    <i class="fas fa-briefcase"></i> Portfolio
                  </a>
                  <a v-if="user.youtube" :href="user.youtube" target="_blank" class="social-link youtube">
                    <i class="fab fa-youtube"></i> YouTube
                  </a>
                  <a v-if="user.linkedin" :href="user.linkedin" target="_blank" class="social-link linkedin">
                    <i class="fab fa-linkedin"></i> LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </template>

          <!-- ================= EDIT MODE ================= -->
          <template v-else>
            <form @submit.prevent="updateProfile" class="edit-form-premium" enctype="multipart/form-data">
              <div class="edit-form-grid">
                <!-- Profile Photo Upload -->
                <div class="form-field full-width">
                  <label><i class="fas fa-camera"></i> Profile Photo</label>
                  <div class="profile-upload-container">
                    <div class="profile-preview">
                      <img 
                        v-if="profilePreview || profileImageUrl" 
                        :src="profilePreview || profileImageUrl" 
                        alt="Profile Preview"
                        class="profile-preview-img"
                      />
                      <div v-else class="profile-preview-placeholder">
                        <i class="fas fa-user-circle"></i>
                      </div>
                    </div>
                    <div class="upload-controls">
                      <label class="upload-btn-premium">
                        <i class="fas fa-upload"></i> Choose Photo
                        <input 
                          type="file" 
                          @change="handleImageUpload" 
                          accept="image/*"
                          hidden
                        />
                      </label>
                      <button type="button" class="remove-photo-btn" @click="removePhoto" v-if="profileImageUrl || profilePreview">
                        <i class="fas fa-trash-alt"></i> Remove
                      </button>
                    </div>
                    <small class="upload-hint">Recommended: Square image, max 2MB</small>
                  </div>
                </div>

                <div class="form-field">
                  <label><i class="fas fa-user"></i> Full Name</label>
                  <input v-model="form.name" @input="validateName" placeholder="Enter your name" />
                </div>

                <div class="form-field">
                  <label><i class="fas fa-envelope"></i> Email</label>
                  <input v-model="form.email" disabled class="readonly-field" />
                </div>

                <div class="form-field">
                  <label><i class="fas fa-phone-alt"></i> Mobile Number</label>
                  <div class="mobile-input-wrapper">
                    <span class="country-code">+91</span>
                    <input :value="form.mobile" @input="handleMobile" @keydown="allowOnlyNumbers" placeholder="9876543210" />
                  </div>
                  <small v-if="mobileError" class="error-text">Mobile number must be 10 digits</small>
                </div>

                <div class="form-field">
                  <label><i class="fas fa-venus-mars"></i> Gender</label>
                  <select v-model="form.gender">
                    <option disabled value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div class="form-field">
                  <label><i class="fas fa-tint"></i> Blood Group</label>
                  <select v-model="form.bloodgroup">
                    <option disabled value="">Select Blood Group</option>
                    <option>A+</option><option>A-</option>
                    <option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option>
                    <option>O+</option><option>O-</option>
                  </select>
                </div>

                <div class="form-field">
                  <label><i class="fas fa-calendar-alt"></i> Date of Birth</label>
                  <input type="date" v-model="form.dateofbirth" />
                </div>

                <div class="form-field">
                  <label><i class="fas fa-city"></i> City</label>
                  <input v-model="form.city" @input="validateCity" placeholder="Enter your city" />
                  <small v-if="cityError" class="error-text">City name is required</small>
                </div>

                <div class="form-field full-width">
                  <label><i class="fas fa-location-dot"></i> Address</label>
                  <textarea v-model="form.address" @input="validateAddress" rows="3" placeholder="Enter your address"></textarea>
                  <small v-if="addressError" class="error-text">Address is required</small>
                </div>

                <!-- Social Links Section -->
                <div class="form-field full-width social-section">
                  <label><i class="fab fa-instagram"></i> Instagram</label>
                  <input v-model="form.instagram" placeholder="https://instagram.com/username" />
                </div>

                <div class="form-field">
                  <label><i class="fas fa-briefcase"></i> Portfolio</label>
                  <input v-model="form.portfolio" placeholder="https://yourwebsite.com" />
                </div>

                <div class="form-field">
                  <label><i class="fab fa-youtube"></i> YouTube</label>
                  <input v-model="form.youtube" placeholder="https://youtube.com/@channel" />
                </div>

                <div class="form-field">
                  <label><i class="fab fa-linkedin"></i> LinkedIn</label>
                  <input v-model="form.linkedin" placeholder="https://linkedin.com/in/username" />
                </div>

                <!-- Password Change Section -->
                <div class="form-field full-width password-section">
                  <div class="section-header">
                    <i class="fas fa-lock"></i>
                    <span>Change Password</span>
                  </div>
                  <div class="password-grid">
                    <div class="form-field">
                      <label>Current Password</label>
                      <input type="password" v-model="form.current_password" placeholder="Enter current password" />
                    </div>
                    <div class="form-field">
                      <label>New Password</label>
                      <input type="password" v-model="form.new_password" placeholder="Enter new password" />
                    </div>
                    <div class="form-field">
                      <label>Confirm Password</label>
                      <input type="password" v-model="form.new_password_confirmation" placeholder="Confirm new password" />
                    </div>
                  </div>
                  <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
                </div>
              </div>

              <div class="form-actions-premium">
                <button type="button" class="btn-cancel-premium" @click="cancelEdit">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn-submit-premium">
                  <i class="fas fa-save"></i> Save Changes
                </button>
              </div>
            </form>
          </template>
        </div>

        <div v-else class="loading-container">
          <div class="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "UpdateProfile",
  components: { Sidebar },

  data() {
    return {
      cityError: false,
      addressError: false,
      mobileError: false,
      nameError: false,
      isMobile: false,
      isSidebarVisible: true,
      user: null,
      editMode: false,
      profileImageFile: null,
      profilePreview: null,
      form: {
        mobile: '',
        instagram: '',
        portfolio: '',
        youtube: '',
        linkedin: '',
        dateofbirth: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      },
      passwordError: ''
    }
  },

  computed: {
    profileImageUrl() {
      if (this.user?.profile_photo) {
        return `https://employees.archenterprises.co.in/backend/storage/app/public/${this.user.profile_photo}`
      }
      return null
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchUserProfile()
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  },

  methods: {
    formatDate(date) {
      if (!date) return '—'
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },

    validateAddress() {
      this.form.address = this.form.address.replace(/\s+/g, ' ').trimStart()
      this.addressError = this.form.address.trim() === ''
    },

    validateCity() {
      this.form.city = this.form.city.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trimStart()
      this.cityError = this.form.city.trim() === ''
    },

    validateName() {
      this.form.name = this.form.name.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trimStart()
      this.nameError = this.form.name.trim() === ''
    },

    allowOnlyNumbers(e) {
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
      if (allowedKeys.includes(e.key)) return
      if (!/^\d$/.test(e.key)) e.preventDefault()
    },

    handleMobile(e) {
      let value = e.target.value.replace(/\D/g, '')
      if (value.startsWith('91')) value = value.slice(2)
      this.form.mobile = value.slice(0, 10)
      this.mobileError = this.form.mobile.length !== 10
    },

    normalizeUrl(url) {
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return `https://${url}`
    },

    handleImageUpload(e) {
      const file = e.target.files[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toastWarning('Please upload an image file')
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toastWarning('Image size should be less than 2MB')
        return
      }

      this.profileImageFile = file
      const reader = new FileReader()
      reader.onload = (event) => {
        this.profilePreview = event.target.result
      }
      reader.readAsDataURL(file)
    },

    removePhoto() {
      this.profileImageFile = null
      this.profilePreview = null
      this.form.profile_photo = null
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    async fetchUserProfile() {
      try {
        const res = await axios.get('/api/user-profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.user = res.data.data
        this.form = {
          ...this.user,
          instagram: this.user.instagram || '',
          portfolio: this.user.portfolio || '',
          youtube: this.user.youtube || '',
          linkedin: this.user.linkedin || '',
          dateofbirth: this.user.dateofbirth || '',
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        toastError('Failed to load profile')
      }
    },

    cancelEdit() {
      this.editMode = false
      this.form = {
        ...this.user,
        instagram: this.user.instagram || '',
        portfolio: this.user.portfolio || '',
        youtube: this.user.youtube || '',
        linkedin: this.user.linkedin || '',
        dateofbirth: this.user.dateofbirth || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      }
      this.profileImageFile = null
      this.profilePreview = null
      this.passwordError = ''
    },

    async updateProfile() {
      try {
        this.passwordError = ''

        if (this.form.new_password || this.form.new_password_confirmation || this.form.current_password) {
          if (!this.form.current_password || !this.form.new_password || !this.form.new_password_confirmation) {
            this.passwordError = 'All password fields are required to change password.'
            return
          }
          if (this.form.new_password !== this.form.new_password_confirmation) {
            this.passwordError = 'New passwords do not match.'
            return
          }
        }

        this.form.instagram = this.normalizeUrl(this.form.instagram)
        this.form.portfolio = this.normalizeUrl(this.form.portfolio)
        this.form.youtube = this.normalizeUrl(this.form.youtube)
        this.form.linkedin = this.normalizeUrl(this.form.linkedin)

        const formData = new FormData()
        
        // Add all form fields
        Object.keys(this.form).forEach(key => {
          if (!['current_password', 'new_password', 'new_password_confirmation'].includes(key) &&
              this.form[key] !== null && this.form[key] !== undefined) {
            formData.append(key, this.form[key])
          }
        })

        // Add profile photo if changed
        if (this.profileImageFile) {
          formData.append('profile_photo', this.profileImageFile)
        }

        await axios.post('/api/update-profile', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        })

        if (this.form.current_password && this.form.new_password) {
          await this.changePassword()
        }

        this.editMode = false
        this.profileImageFile = null
        this.profilePreview = null
        this.fetchUserProfile()
        toastSuccess('Profile updated successfully!')
      } catch (err) {
        console.error('Profile update failed:', err)
        toastError('Failed to update profile')
      }
    },

    async changePassword() {
      try {
        const passwordData = {
          current_password: this.form.current_password,
          new_password: this.form.new_password,
          new_password_confirmation: this.form.new_password_confirmation
        }
        await axios.post('/api/change-password', passwordData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        toastSuccess('Password changed successfully!')
      } catch (err) {
        console.error('Password change failed:', err)
        this.passwordError = err.response?.data?.message || 'Failed to change password.'
        throw err
      }
    }
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

.profile-card-premium {
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

.edit-btn-premium {
  padding: 10px 22px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.edit-btn-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.edit-btn-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Profile Container */
.profile-container-premium {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

/* Left Side */
.profile-left-premium {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-radius: 24px;
  padding: 28px 20px;
  border: 1px solid #e5e7eb;
}

.profile-avatar-wrapper {
  margin-bottom: 20px;
  cursor: pointer;
  position: relative;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-hint {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.profile-avatar-wrapper:hover .avatar-edit-hint {
  opacity: 1;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.profile-role {
  font-size: 13px;
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 20px;
}

.profile-stats {
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
}

/* Profile Upload Container */
.profile-upload-container {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.profile-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-preview-placeholder {
  font-size: 64px;
  color: var(--primary-color);
}

.upload-controls {
  display: flex;
  gap: 12px;
  flex-direction: column;
}

.upload-btn-premium {
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.upload-btn-premium:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.remove-photo-btn {
  background: #fee2e2;
  color: var(--danger);
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.remove-photo-btn:hover {
  background: var(--danger);
  color: white;
}

.upload-hint {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 8px;
}

/* Right Side */
.profile-right-premium {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: #f8fafc;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #1a1a2e;
}

.section-header i {
  color: var(--primary-color);
  font-size: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-item label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-item label i {
  font-size: 12px;
}

.info-item p {
  font-size: 14px;
  color: #1a1a2e;
  font-weight: 500;
}

/* Social Links */
.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 30px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.social-link.instagram {
  background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  color: white;
}

.social-link.portfolio {
  background: #1a1a2e;
  color: white;
}

.social-link.youtube {
  background: #ff0000;
  color: white;
}

.social-link.linkedin {
  background: #0077b5;
  color: white;
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Edit Form */
.edit-form-premium {
  width: 100%;
}

.edit-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-field label i {
  color: var(--primary-color);
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.readonly-field {
  background: #f3f4f6;
  cursor: not-allowed;
}

.mobile-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.mobile-input-wrapper .country-code {
  padding: 12px 14px;
  background: #f3f4f6;
  font-weight: 600;
  color: #374151;
}

.mobile-input-wrapper input {
  flex: 1;
  border: none;
  padding: 12px 14px;
}

.mobile-input-wrapper input:focus {
  outline: none;
  box-shadow: none;
}

/* Password Section */
.password-section {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
}

.password-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.error-text {
  font-size: 11px;
  color: var(--danger);
  margin-top: 4px;
}

/* Form Actions */
.form-actions-premium {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel-premium {
  padding: 10px 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel-premium:hover {
  background: #e5e7eb;
}

.btn-submit-premium {
  padding: 10px 24px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-submit-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .info-item.full-width {
    grid-column: span 1;
  }
  .password-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 16px;
  }

  .profile-card-premium {
    padding: 20px;
  }

  .content-header-modern {
    flex-direction: column;
    align-items: stretch;
  }

  .edit-btn-premium {
    justify-content: center;
  }

  .profile-container-premium {
    flex-direction: column;
  }

  .profile-left-premium {
    flex: auto;
  }

  .edit-form-grid {
    grid-template-columns: 1fr;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .password-grid {
    grid-template-columns: 1fr;
  }

  .form-actions-premium {
    flex-direction: column;
  }

  .btn-cancel-premium,
  .btn-submit-premium {
    justify-content: center;
  }

  .social-links {
    justify-content: center;
  }

  .profile-upload-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>