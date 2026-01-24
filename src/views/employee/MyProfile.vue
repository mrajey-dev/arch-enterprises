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

      <div v-if="!isMobile || !isSidebarVisible" class="content profile-card">

   <button class="edit-btn" @click="editMode = true" :disabled="editMode">
  <i class="fas fa-user-edit"></i>
  Edit Profile
</button>
    <!-- PROFILE -->
        <div v-if="user" class="profile-container">

          <!-- ================= VIEW MODE ================= -->
          <template v-if="!editMode">
            <div class="profile-left">
              <div class="profile-photo-wrapper">
                <img
                  v-if="user.profile_photo"
                  :src="profileImage"
                  alt="Profile Photo"
                >
              </div>
              <h2 class="profile-name">{{ user.name }}</h2>
              <p class="profile-role">
                {{ user.department || 'Department Not Assigned' }}
              </p>
            </div>

            <div class="profile-right">
              <div class="profile-row"><span class="label">Handle:</span><span class="value">{{ user.handle }}</span></div>

              <div class="profile-row"><span class="label">Email:</span><span class="value">{{ user.email }}</span></div>
              <div class="profile-row"><span class="label">Gender:</span><span class="value">{{ user.gender }}</span></div>
              <div class="profile-row"><span class="label">Mobile:</span><span class="value">{{ user.mobile }}</span></div>
              <div class="profile-row"><span class="label">Address:</span><span class="value">{{ user.address }}</span></div>
              <div class="profile-row"><span class="label">City:</span><span class="value">{{ user.city }}</span></div>
              <div class="profile-row"><span class="label">Blood Group:</span><span class="value">{{ user.bloodgroup }}</span></div>
              <div class="profile-row"><span class="label">Date of Birth:</span><span class="value">{{ user.dateofbirth }}</span></div>
            </div>
          </template>

          <!-- ================= EDIT MODE ================= -->
          <template v-else>
            <form class="edit-profile-form" @submit.prevent="updateProfile">

            

              <!-- Right -->
              <div class="profile-right">
           <div class="profile-row">
  <label>Name </label>
  <input
    v-model="form.name"
    @input="validateName"
    maxlength="20"
    placeholder="Enter name"
    required
  />
 
</div>
 <small v-if="nameError" class="error-text">
    Name is required
  </small>

                 <div class="profile-row">
                  <label>Handle</label>
                  <input v-model="form.handle" disabled>
                </div>

                <div class="profile-row">
                  <label>Email</label>
                  <input v-model="form.email" disabled >
                </div>

<div class="profile-row">
  <label>Mobile </label>
  <input
    ref="mobileInput"
    :value="formattedMobile"
    @keydown="allowOnlyNumbers"
    @input="handleMobile"
    placeholder="+911234567890"
  />

</div>
  <small v-if="mobileError" class="error-text">
    Mobile number is required
  </small>




<div class="profile-row">
  <label>Gender </label>
  <select v-model="form.gender">
    <option value="" disabled>Select gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
    <option value="Non-binary">Non-binary</option>
    <option value="Transgender">Transgender</option>
    <option value="Prefer not to say">Prefer not to say</option>
  </select>
</div>
<div class="profile-row">
  <label>Address </label>
  <input
    v-model="form.address"
    maxlength="250"
    placeholder="Enter address"
    @input="validateAddress"
    required
  />

</div>
  <small v-if="addressError" class="error-text">
    Address is required
  </small>

<div class="profile-row">
  <label>City </label>
  <input
    v-model="form.city"
    @input="validateCity"
    maxlength="20"
    placeholder="Enter city"
    required
  />

</div>
  <small v-if="cityError" class="error-text">
    City is required
  </small>


               <div class="profile-row">
  <label>Blood Group </label>
  <select v-model="form.bloodgroup">
    <option value="" disabled>Select blood group</option>
    <option value="A+">A+</option>
    <option value="A-">A-</option>
    <option value="B+">B+</option>
    <option value="B-">B-</option>
    <option value="AB+">AB+</option>
    <option value="AB-">AB-</option>
    <option value="O+">O+</option>
    <option value="O-">O-</option>
  </select>
</div>


                <div class="profile-actions">
                  <button type="submit" class="save-btn">💾 Save</button>
                  <button type="button" class="cancel-btn" @click="cancelEdit">❌ Cancel</button>
                </div>
              </div>

            </form>
          </template>

        </div>

        <div v-else class="loading-text">
          Loading profile...
        </div>

      </div>
    </div>
  </div>
</template>
<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'

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

      // edit profile states
      editMode: false,
      form: { mobile: ''},
      previewImage: null
    }
  },

  computed: {
     formattedMobile() {
      return this.form.mobile ? `+91${this.form.mobile}` : '+91';
  },
    profileImage() {
      return this.user?.profile_photo
        ? `https://employees.archenterprises.co.in/backend/storage/app/public/${this.user.profile_photo}`
        : ''
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.fetchUserProfile()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  },

  methods: {
     validateAddress() {
    // Prevent only-spaces input
    this.form.address = this.form.address.replace(/\s+/g, ' ').trimStart();

    // Required check
    this.addressError = this.form.address.trim() === '';
  },
allowOnlyNumbers(e) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  },


 handleMobile(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('91')) value = value.slice(2);
    this.form.mobile = value.slice(0, 10);

    // Live validation
    this.mobileError = this.form.mobile.length !== 10;
  },

submitForm() {
  // Mobile
  if (!this.form.mobile || this.form.mobile.length !== 10) {
    this.mobileError = true
    this.$refs.mobileInput.focus()
    return
  } else {
    this.mobileError = false
  }

  // Name
  if (!this.form.name || this.form.name.trim() === '') {
    this.nameError = true
    this.$refs.nameInput.focus()
    return
  } else {
    this.nameError = false
  }

  // City
  if (!this.form.city || this.form.city.trim() === '') {
    this.cityError = true
    this.$refs.cityInput.focus()
    return
  } else {
    this.cityError = false
  }

  // Address
  if (!this.form.address || this.form.address.trim() === '') {
    this.addressError = true
    this.$refs.addressInput.focus()
    return
  } else {
    this.addressError = false
  }

  // All good → call API
  this.updateProfile()
},

validateCity() {
    // Allow only letters and spaces
    this.form.city = this.form.city
      .replace(/[^a-zA-Z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trimStart();

    // Required check
    this.cityError = this.form.city.trim() === '';
  },

  validateName() {
    this.form.name = this.form.name
      .replace(/[^a-zA-Z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trimStart();

    // Empty check
    this.nameError = this.form.name.trim() === '';
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
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        this.user = res.data.data

        // preload form for edit mode
        this.form = { ...this.user }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    },

    handleImageUpload(e) {
      const file = e.target.files[0]
      if (!file) return

      this.form.profile_photo = file
      this.previewImage = URL.createObjectURL(file)
    },

    cancelEdit() {
      this.editMode = false
      this.form = { ...this.user }
      this.previewImage = null
    },

    async updateProfile() {
      try {
        const formData = new FormData()

        Object.keys(this.form).forEach(key => {
          if (this.form[key] !== null && this.form[key] !== undefined) {
            formData.append(key, this.form[key])
          }
        })

        await axios.post('/api/update-profile', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        })

        this.editMode = false
        this.previewImage = null
        this.fetchUserProfile()
      } catch (err) {
        console.error('Profile update failed:', err)
      }
    }
  }
}
</script>


<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
.error-text {
  color: red;
  font-size: 12px;
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
/* Layout */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f8fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
}

/* Header */
.header {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, .1);
  background-color: var(--primary);
  color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.mobile-menu-icon {
  font-size: 22px;
  cursor: pointer;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 34px;
}

/* Profile Card */
.profile-card {
  flex: 1;
  background-color: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

/* Profile Container */
.profile-container {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

/* Photo */
.profile-photo-container {
  flex: 0 0 150px;
}
.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary);
}

/* Details */
.profile-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.profile-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.label {
  font-weight: 600;
  color: var(--primary);
  min-width: 120px;
}

.value {
  color: var(--text);
}

/* Loading */
.loading-text {
  text-align: center;
  font-size: 16px;
  color: #888;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-photo-container {
    margin-bottom: 20px;
  }

  .profile-row {
    justify-content: center;
  }

  .label {
    min-width: auto;
  }
}
/* Add these styles */
.profile-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.profile-logo img {
  width: 80px;         /* smaller logo size */
  height: 80px;
  object-fit: cover;
  border-radius: 10px; /* slight rounded corners for logo look */
  border: 2px solid var(--primary);
}

/* Profile Card */
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 40px 30px;
  /* background: linear-gradient(135deg,  var(--sidebar), var(--sidebar)); */
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 35px rgba(0, 0, 0, 0.12);
}

/* Container */
.profile-container {
  display: flex;
  gap: 50px;
  flex-wrap: wrap;
}

/* Left Side - Photo & Name */
.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 0 0 220px;
}

.profile-photo-wrapper {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px dotted  var(--primary);
  margin-bottom: 20px;
}

.profile-photo-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 5px;
}

.profile-role {
  font-size: 16px;
  color: var(--primary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Right Side - Details */
.profile-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.profile-row {
 display: flex;
    justify-content: flex-start;
    padding: 12px 20px;
    background-color: #fdfdfd;
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--text)0d;
    transition: all .2s ease;
    flex-wrap: nowrap;
}

.profile-row:hover {
  background-color: #f5fbff;
}

.label {
  font-weight: 600;
  color: var(--primary);
}

.value {
  font-weight: 500;
  color: var(--text);
}

/* Loading */
.loading-text {
  text-align: center;
  font-size: 18px;
  color: #888;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-right {
    width: 100%;
  }

  .profile-row {
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 162px;
  background: linear-gradient(135deg, var(--text), var(--text));
  color: #fff;
  border: none;
  padding: 12px 22px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(95, 158, 160, 0.35);
  transition: all 0.3s ease;
}

.edit-btn i {
  font-size: 16px;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(95, 158, 160, 0.5);
}
.edit-profile-form {
  display: flex;
  gap: 50px;
  width: 100%;
}

.edit-profile-form input,
.edit-profile-form select {
  width: 100%;
  padding: 12px 15px;
  color: var(--text);
  border-radius: 12px;
  border: 1px solid var(--primary);
  font-size: 14px;
  transition: all 0.2s ease;
  background: #fff;
}

.edit-profile-form input:focus,
.edit-profile-form select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(95, 158, 160, 0.15);
  outline: none;
}

.edit-profile-form label {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 6px;
  display: block;
}
.save-btn {
  background: linear-gradient(135deg, var(--text), var(--text));
  color: white;
  padding: 12px 28px;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(95, 158, 160, 0.35);
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(95, 158, 160, 0.5);
}

.cancel-btn {
  background: #f2f4f7;
  color: var(--text);
  padding: 12px 26px;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #e4e7eb;
}
.profile-photo-wrapper {
  position: relative;
  cursor: not-allowed;
}

.profile-photo-wrapper::after {
  content: 'Change';
  position: absolute;
  inset: 0;
  background: rgba(95, 158, 160, 0.7);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.edit-profile-form .profile-photo-wrapper:hover::after {
  opacity: 1;
}
@media (max-width: 768px) {
  .edit-profile-form {
    flex-direction: column;
    gap: 30px;
  }

  .profile-actions {
    justify-content: center;
  }
}
.content {
  transition: opacity 0.3s ease;
}
[v-cloak] .content { opacity: 0; }


</style>
