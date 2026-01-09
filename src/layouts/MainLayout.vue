<template>
  <div class="layout">
    <Header />
    <div class="main-content">
      <Sidebar />
      
    </div>
    <Footer />
  </div>
     <!-- Registration / Edit Modal -->
    <transition name="fade">
      <div class="modal-backdrop" v-if="showRegister" @click.self="closeRegisterForm()">
        <div class="modal-card" @click.stop>
          <h2 class="modal-title">{{ isEditMode ? 'Edit Employee' : 'Register New Employee' }}</h2>
          <form @submit.prevent="handleRegister" class="attractive-form">
            <div class="form-row">
              <div class="input-group" v-if="!isEditMode">
                <label><i class="fas fa-id-badge"></i> Employee ID</label>
                <input v-model="registerForm.empId" placeholder="Enter Employee ID" required />
              </div>
              <div class="input-group">
                <label><i class="fas fa-user"></i> Full Name</label>
                <input v-model="registerForm.username" placeholder="Enter full name" required />
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <input
                  v-model="registerForm.email"
                  type="email"
                  placeholder="Enter email address"
                  :readonly="isEditMode" 
                  required
                />
              </div>
              <div class="input-group" v-if="!isEditMode">
                <label><i class="fas fa-lock"></i> Password</label>
                <input v-model="registerForm.password" type="password" placeholder="Enter secure password" required />
              </div>
              <div class="input-group">
                <label><i class="fas fa-map-marker-alt"></i> Address</label>
                <textarea v-model="registerForm.address" placeholder="Enter full address" rows="2" required></textarea>
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label><i class="fas fa-building"></i> Department</label>
                <select v-model="registerForm.department" required>
                  <option value="" disabled>Select Department</option>
                  <option>HR</option>
                  <option>Engineering</option>
                  <option>Sales</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                </select>
              </div>
              <div class="input-group">
                <label><i class="fas fa-city"></i> City</label>
                <input v-model="registerForm.city" placeholder="Enter City" required />
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label><i class="fas fa-venus-mars"></i> Gender</label>
                <select v-model="registerForm.gender" required>
                  <option value="" disabled>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div class="input-group">
                <label><i class="fas fa-phone"></i> Mobile Number</label>
                <input v-model="registerForm.mobile" type="tel" placeholder="Enter mobile number" required />
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label><i class="fas fa-tasks"></i> Key Responsibility</label>
                <textarea v-model="registerForm.keyResponsibility" placeholder="Enter key responsibilities" rows="2" required></textarea>
              </div>
              <div class="input-group" v-if="!isEditMode">
                <label><i class="fas fa-upload"></i> Upload Documents</label>
                <input type="file" @change="handleFileUpload" multiple />
              </div>
            </div>

            <div class="modal-buttons">
              <button type="submit" class="btn btn-primary">
                {{ isEditMode ? 'Update' : 'Register' }}
              </button>
              <button type="button" class="btn btn-secondary" @click="closeRegisterForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
</template>

<script>
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Footer from '../components/Footer.vue'

export default {
  components: {
    Header,
    Sidebar,
    Footer
  }
}
</script>

