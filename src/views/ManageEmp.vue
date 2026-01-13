

              <template>
                <div class="layout">
                  <!-- Header -->
                  <header class="header">
     <div class="head-title"><a href="https://employees.archenterprises.co.in/">
        <img
          src="https://archenterprises.co.in/ajay/ajay.png"
          style="height: 65px;"
          alt="Logo"
        />
         </a>
         🅰️RCH360⚙️
     
      </div>
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>

                  <!-- Registration / Edit Modal -->
                  <transition name="fade">
                  <div class="modal-backdrop" v-if="showRegister">
                      <div class="modal-card" @click.stop>
                        <h2 class="modal-title">{{ isEditMode ? 'Edit Employee' : 'Register New Employee' }}</h2>
                      <form @submit.prevent="handleRegister" class="attractive-form" enctype="multipart/form-data">

                          <div class="form-row">
                            <div class="input-group" v-if="!isEditMode">
                              <label><i class="fas fa-id-badge"></i> Employee ID</label>
                             <input  v-model="registerForm.empId" @input="registerForm.empId = registerForm.empId.replace(/[^0-9]/g, '')" required />
                              <small v-if="!registerForm.empId" style="color: red;">
    ID must contain numbers only.
  </small>
                            </div>
                           <div class="input-group">
  <label><i class="fas fa-user"></i> Full Name *</label>
  <input
    v-model="registerForm.username"
    placeholder="Enter full name"
    @input="validateName"
    required
  />
  <small v-if="nameError" style="color: red;">
    Name must contain only letters and spaces.
  </small>
</div>
<div class="input-group">
  <label><i class="fas fa-user-tag"></i> Handle *</label>
  <input
    v-model="registerForm.handle"
    placeholder="Enter handle"
    maxlength="25"
    @input="registerForm.handle = registerForm.handle.replace(/[^A-Za-z0-9_]/g, '').slice(0,25)"
    required
  />
  <small style="color: gray; font-size: 12px;">
    Only letters, numbers, and underscore allowed. Max 25 chars.
  </small>
</div>


                          </div>

                          <div class="form-row">
                            <div class="input-group">
  <label><i class="fas fa-envelope"></i> Email *</label>
<input
  v-model="registerForm.email"
  type="email"
  placeholder="Enter email address"
  @input="registerForm.email = registerForm.email.trim().toLowerCase()"
  @blur="checkEmailExists"
  required
/>
<small v-if="emailExists && !isEditMode" style="color: red;">
  This email is already registered!
</small>


</div>

                          <div class="input-group" v-if="!isEditMode">
                <label><i class="fas fa-lock"></i> Password *</label>
                <div class="password-wrapper">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="registerForm.password"
                    placeholder="Auto-generated password"
                    readonly
                  />
                  <button type="button" class="toggle-btn" @click="togglePasswordVisibility">
                    <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                  </button>
                  <button type="button" class="generate-btn" @click="generatePassword">
                    Generate
                  </button>
                </div>
              </div>

                           <div class="input-group">
  <label><i class="fas fa-map-marker-alt"></i> Address *</label>
  <textarea
    v-model="registerForm.address"
    placeholder="Enter full address"
    rows="2"
    maxlength="250"
    @input="checkAddressLength"
    required
  ></textarea>
  <p v-if="addressWarning" style="color: red; font-size: 12px;">
    Address cannot exceed 250 characters!
  </p>
  <p style="font-size: 12px; color: gray;">
    {{ registerForm.address.length }}/250 characters
  </p>
</div>

                            <div class="input-group">
                              <label><i class="fas fa-inr"></i> Salary</label>
                              <input v-model="registerForm.keyResponsibility" @input="registerForm.keyResponsibility = registerForm.keyResponsibility.replace(/[^0-9]/g, '')" />
                            </div>
                          </div>
              <div class="form-row">
                <div class="input-group">
                  <label><i class="fas fa-calendar-alt"></i> Date of Birth *</label>
                 <input type="date"
       v-model="registerForm.birthDate"
       @change="validateDOB" />

<p v-if="dobError" style="color: red; font-size: 13px; margin-top: 4px;">
  * Invalid Date of Birth! Must be 18+ and not a future date.
</p>

                </div>

                <div class="input-group">
                  <label><i class="fas fa-tint"></i> Blood Group </label>
                  <select v-model="registerForm.bloodGroup">
                    <option value="" disabled>Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              <div class="input-group">
                              <label><i class="fas fa-phone"></i> Contact Number *</label>
                              <input type="tel" v-model="registerForm.mobile" @input="registerForm.mobile = registerForm.mobile.replace(/[^0-9]/g, '') .slice(0,10)" />

                            </div>
                <div class="input-group">
                  <label><i class="fas fa-phone-square-alt"></i> Secondary Contact Number</label>
                  <input type="tel" v-model="registerForm.secondaryContact" @input="registerForm.secondaryContact = registerForm.secondaryContact.replace(/[^0-9]/g, '') .slice(0,10)"/>
                </div>
              </div>

                          <div class="form-row">
                            <div class="input-group">
                <label><i class="fas fa-building"></i> Department *</label>
                <select v-model="registerForm.department" required>
                  <option value="" disabled>Select Department</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.name">
                    {{ dept.name }}
                  </option>
                </select>
              </div>

                           <div class="input-group">
  <label><i class="fas fa-city"></i> City *</label>
  <input
    v-model="registerForm.city"
    placeholder="Enter City"
    maxlength="25"
    @input="registerForm.city = registerForm.city.replace(/[^A-Za-z\s]/g, '').slice(0,25)"
    required
  />
  <small style="font-size: 12px; color: gray;">
    {{ registerForm.city.length }}/25 characters
  </small>
</div>

                          </div>

                          <div class="form-row">
                            <div class="input-group">
                              <label><i class="fas fa-venus-mars"></i> Gender *</label>
                              <select v-model="registerForm.gender" required>
                                <option value="" disabled>Select Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                              </select>
                            </div>

                          <div class="input-group" v-if="!isEditMode">
  <label><i class="fas fa-upload"></i> Upload Documents *</label>
  <div class="upload-group">
    <select v-model="selectedDocumentType">
      <option disabled value="">Document Type</option>
      <option value="permanent_address_proof">Permanent Address Proof</option>
      <option value="aadhaar_card">Aadhaar Card</option>
      <option value="education_certificate">Education Certificate</option>
      <option value="relevance_letter">Company Relevance Letter (Optional)</option>
      <option value="photo">Photo</option>
    </select>

    <input type="file" @change="handleFileUpload" />
  </div>

  <!-- ✅ Show uploaded documents below the button -->
  <ul class="uploaded-docs" v-if="Object.keys(typedDocuments).length > 0">
    <li v-for="(file, type) in typedDocuments" :key="type">
      📎 <strong>{{ type.replace(/_/g, ' ') }}:</strong> {{ file.name }}
    </li>
  </ul>
</div>


                          <div class="form-row">
                            
                            
              </div>

                          </div>

                          <div class="modal-buttons">
                           <button type="submit" class="btn btn-primary" :disabled="loading">
  <span v-if="loading">
    <i class="fas fa-spinner fa-spin"></i> {{ isEditMode ? 'Updating...' : 'Registering...' }}
  </span>
  <span v-else>
    {{ isEditMode ? 'Update' : 'Register' }}
  </span>
</button>

                            <button type="button" class="btn btn-secondary" @click="closeRegisterForm()">Cancel</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </transition>

                  <!-- Main Content -->
                  <div class="main-content">
                <Sidebar v-if="!isMobile || isSidebarVisible" />

                <!-- Hide main content on mobile if sidebar is open -->
                <section
                  class="content"
                  v-if="!isMobile || !isSidebarVisible"
                  :class="{ 'expanded-content': isMobile && !isSidebarVisible }"
                >

<div>
    <h2>Manage Employees</h2>
    <button class="menu-btn" @click="openRegisterForm()">Register Employee</button>

    <!-- Search Input -->
    <div class="search-container" style="margin-bottom: 15px;">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search by Name, Department or Email"
        class="search-input"
      />
    </div>

    <!-- Employee Table -->
    <table class="styled-user-table user-table">
      <thead>
        <tr>
          <th>SR No.</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Mobile No</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(user, index) in filteredUsers" :key="user.id">
          <td>{{ index + 1 }}</td>
          <td @click="openKRASelection(user)" class="user-name">
            {{ formatName(user.name) }}
          </td>
          <td>{{ user.email }}</td>
          <td>{{ user.department }}</td>
          <td>{{ user.mobile }}</td>
          <td>
            <div class="action-btns">
              <button class="btn-edit" @click="editUser(user)" title="Edit Employee">
                <i class="fas fa-edit"></i>
              </button>

              <button
                class="btn-status"
                :class="user.status === 'active' ? 'inactive' : 'active'"
                @click="toggleStatus(user)"
              >
                {{ user.status === 'active' ? 'Inactive' : 'Active' }}
              </button>
            </div>
          </td>
        </tr>

        <!-- No results found -->
        <tr v-if="filteredUsers.length === 0">
          <td colspan="6" style="text-align:center;">No employees found.</td>
        </tr>
      </tbody>
    </table>
  </div>



              <!-- ----------------------------------------------------------------------------------------- -->
                <!-- KRA Selection Modal -->
              <transition name="fade">
                <div class="modal-backdrop" v-if="showKRAPopup" @click.self="showKRAPopup = false">
                  <div class="modal-card" @click.stop>
                    <h2 class="modal-title">Assign KRA to {{ selectedUser.name }}</h2>

                    <label class="kra-label">Select KRAs:</label>
                    <div class="kra-checkbox-list">
                      <div v-for="kra in filteredKRAOptions" :key="kra.id" class="kra-checkbox-item">
                        <label>
                          <input type="checkbox" :value="kra.id" v-model="selectedKRAs" />
                          {{ kra.name }}
                        </label>
                      </div>
                    </div>

                    <br />

                    <div class="modal-buttons">
                      <button class="btn btn-primary" @click="assignKRA">Assign</button>
                        <button class="btn btn-performance" @click="showPerformance = true">View Assigned KRAs</button>
                      <button class="btn btn-secondary" @click="cancelKRA">Cancel</button>
                

                    </div>
                  </div>
                </div>
              </transition>


<!-- Assigned KRAs Modal -->
<transition name="fade">
  <div class="fullscreen-modal" v-if="showPerformance" @click.self="showPerformance = false">
    <div class="chart-container" @click.stop>
      <button class="close-btn" @click="showPerformance = false">×</button>
      <h2>Assigned KRAs for {{ selectedUser.name }}</h2>
      
      <ul v-if="selectedUser.kra_name && selectedUser.kra_name.length > 0">
        <li v-for="kra in parsedKRAs" :key="kra"> {{ kra }}</li>
      </ul>
      <p v-else>No KRAs assigned to this user.</p>
    </div>
  </div>
</transition>



              </section>

                  </div>

                  <!-- <footer class="footer">
                    &copy; 2025 Arch Enterprises. All rights reserved.
                  </footer> -->
                </div>
              </template>

            <script>
      import axios from 'axios'
      import Sidebar from '../components/Sidebar.vue'
      import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';

      Chart.register(PieController, ArcElement, Tooltip, Legend);

      export default {
        components: {
          Sidebar
        },
        data() {
          return {
             searchQuery: '',
            dobError: false,
            userAssignedKRAs: [],
             loading: false, // <-- Add this
            documents: [],
            isMobile: false,
            isSidebarVisible: true,
            selectedKRAs: [],
            showPerformance: false,
            performanceChartInstance: null,
            selectedKRA: '',
            selectedUser: null,
            kraOptions: [],
            departments: [],
            users: [],
            allKRAs: [],
            showKRAPopup: false,
            selectedDocumentType: '',
            typedDocuments: {},
            showPassword: true,
            showRegister: false,
            isEditMode: false,
            editingId: null,
            registerForm: {
              id: '',
              empId: '',
              username: '',
               handle: '',
              email: '',
              gender: '',
              department: '',
              city: '',
              address: '',
              mobile: '',
              secondaryContact: '',
              keyResponsibility: '',
              birthDate: '',
              bloodGroup: '',
              password: ''
            },
             addressWarning: false,
            emailExists: false,
             nameError: false,
          }
        },
        watch: {
          showRegister(newVal) {
    document.body.classList.toggle('modal-open', newVal);
  },
          showPerformance(newVal) {
            if (newVal) {
              this.$nextTick(() => {
                this.renderChart();
              });
            }
          }
        },
        computed: {
          filteredUsers() {
      if (!this.searchQuery) return this.users;

      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query)
      );
    },
          filteredKRAOptions() {
            const userDept = this.selectedUser?.department;
            const departmentObj = this.departments.find(dept => dept.name === userDept);
            if (!departmentObj) return [];

            return this.kraOptions.filter(kra => kra.department_id === departmentObj.id);
          },
          parsedKRAs() {
    if (!this.selectedUser || !this.selectedUser.kra_name) return [];
    
    // Handles both comma-separated string and array
    if (Array.isArray(this.selectedUser.kra_name)) {
      return this.selectedUser.kra_name;
    }
    
    return this.selectedUser.kra_name.split(',').map(kra => kra.trim());
  }
        },
        mounted() {
          this.checkIfMobile();
          window.addEventListener('resize', this.checkIfMobile);
          this.fetchUsers();
          this.fetchDepartments();
        },
        methods: {

          formatName(name) {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },
          cancelKRA() {
        // Close the popup
        this.showKRAPopup = false;

        // Clear the selected KRA data
        this.selectedKRAs = [];  // assuming this is where your popup data is stored

        // If you have other fields in the popup, reset them too
        this.someOtherField = ''; 
        this.anotherField = null;
    },
          validateDOB() {
  const dobInput = this.registerForm.birthDate;

  if (!dobInput) {
    this.dobError = false;
    return;
  }

  const dob = new Date(dobInput);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  // Adjust age if birthday hasn't come yet this year
  const actualAge = monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())
    ? age - 1
    : age;

  // Validation: future date or <18 years
  if (dob > today || actualAge < 18) {
    this.dobError = true;
    this.registerForm.birthDate = ''; // Reset field
  } else {
    this.dobError = false;
  }
},

          checkAddressLength() {
    this.addressWarning = this.registerForm.address.length > 250;
  },
        async toggleStatus(user) {
    const newStatus = user.status === "active" ? "inactive" : "active";

    try {
      await axios.put(`https://employees.archenterprises.co.in/api/api/users-active/${user.id}`, {
        status: newStatus
      });

      user.status = newStatus; // update instantly in frontend
      alert(`User is now ${newStatus}!`);

    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  },

  async setActive(user) {
    const newStatus = user.active === "active" ? "inactive" : "active";

    try {
      await axios.put(`https://employees.archenterprises.co.in/api/api/users-active/${user.id}`, {
        active: newStatus
      });

      user.active = newStatus; // instantly update UI
      alert(`User is now ${newStatus}!`);
    } catch (error) {
      console.error(error);
      alert("Failed to update user status");
    }
  },
          validateName() {
    const regex = /^[A-Za-z\s]+$/; // Only alphabets + space allowed
    this.nameError = !regex.test(this.registerForm.username);

    // If invalid characters typed, remove them
    this.registerForm.username = this.registerForm.username.replace(/[^A-Za-z\s]/g, "");
  },
  async checkEmailExists() {
  if (this.isEditMode) return; // Skip check when editing

  this.registerForm.email = this.registerForm.email.trim().toLowerCase();

  if (!this.registerForm.email) {
    this.emailExists = false;
    return;
  }

  try {
    const response = await axios.post(
      "https://employees.archenterprises.co.in/api/api/check-email",
      { email: this.registerForm.email }
    );

    // API should return true/false
    this.emailExists = response.data.exists;
  } catch (error) {
    console.error("Email check failed:", error);
  }
},

          async fetchAssignedKRAs(userId) {
  try {
    const response = await axios.get(`https://employees.archenterprises.co.in/api/api/user-kras/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    this.userAssignedKRAs = response.data.data || []; // Adjust according to actual API response format
  } catch (error) {
    console.error('Error fetching assigned KRAs:', error);
    this.userAssignedKRAs = [];
  }
},
          sendWelcomeEmail(user) {
  if (!user.email) {
    alert("User email not found.");
    return;
  }

  axios.post('https://employees.archenterprises.co.in/api/api/send-registration-email', {
    email: user.email,
    name: user.name
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(() => {
    alert(`Welcome email sent to ${user.email}`);
  })
  .catch(err => {
    console.error('Error sending email:', err);
    alert('Failed to send welcome email.');
  });
},

       handleFileUpload(event) {
  const file = event.target.files[0];

  if (!this.selectedDocumentType || !file) {
    alert('Please select both a document type and a file.');
    return;
  }

  const formData = new FormData();
  formData.append('document', file); // Laravel expects 'document'
  formData.append('empName', this.registerForm.username);
  formData.append('type', this.selectedDocumentType);

  axios.post('https://employees.archenterprises.co.in/api/api/upload-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(res => {
    console.log('Upload success:', res.data);
    // Save the uploaded file metadata
    this.typedDocuments = {
  ...this.typedDocuments,
  [this.selectedDocumentType]: {
    name: file.name,
    type: this.selectedDocumentType
  }
};

    this.selectedDocumentType = '';
    event.target.value = '';
  })
  .catch(err => {
    console.error('Upload error:', err.response?.data || err);
    alert('Upload failed: ' + (err.response?.data?.message || 'Unexpected error'));
  });
},


          checkIfMobile() {
            this.isMobile = window.innerWidth <= 768;
            this.isSidebarVisible = !this.isMobile;
          },
          toggleSidebar() {
            this.isSidebarVisible = !this.isSidebarVisible;
          },
          renderChart() {
            const ctx = this.$refs.performanceChart;
            if (!ctx) return;

            if (this.performanceChartInstance) {
              this.performanceChartInstance.destroy();
            }

            this.performanceChartInstance = new Chart(ctx, {
              type: 'pie',
              data: {
                labels: ['Completed', 'Pending', 'In Process'],
                datasets: [{
                  label: 'KRA Performance',
                  data: [40, 30, 30],
                  backgroundColor: ['#4CAF50', '#FFC107', '#2196F3'],
                  hoverOffset: 15
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.label}: ${context.parsed}%`;
                      }
                    }
                  }
                }
              }
            });
          },
          async fetchUsers() {
            try {
              const response = await axios.get('https://employees.archenterprises.co.in/api/api/users');
              this.users = response.data;
            } catch (error) {
              console.error('Error fetching users:', error);
            }
          },
          async fetchDepartments() {
            try {
              const response = await axios.get('https://employees.archenterprises.co.in/api/api/departments');
              this.departments = response.data.data;
            } catch (error) {
              console.error('Failed to fetch departments:', error);
            }
          },
          async fetchAllKRAs() {
            try {
              const response = await axios.get('https://employees.archenterprises.co.in/api/api/kras');
              this.kraOptions = response.data.data;
            } catch (error) {
              console.error('Error fetching KRAs:', error);
            }
          },
          async openKRASelection(user) {
  this.selectedUser = user;
  this.selectedKRA = '';
  this.showKRAPopup = true;

  try {
    await this.fetchAllKRAs();
    await this.fetchAssignedKRAs(user.id);
  } catch (error) {
    console.error('Failed to fetch KRAs:', error);
  }
},

          assignKRA() {
            if (this.selectedKRAs.length === 0) {
              alert('Please select at least one KRA.');
              return;
            }

            axios.post('https://employees.archenterprises.co.in/api/api/assign-kra', {
              user_id: this.selectedUser.id,
              kra_ids: this.selectedKRAs,
            })
              .then(() => {
    alert('KRA(s) assigned successfully!');
    this.showKRAPopup = false;
    this.selectedKRAs = [];

    // Auto-refresh the page after 1 second (1000 ms)
    setTimeout(() => {
        window.location.reload();
    }, 10);
})

              .catch(error => {
                console.error('Error assigning KRAs:', error);
              });
          },
          editUser(user) {
            this.isEditMode = true;
            this.editingId = user.id;
            this.showRegister = true;

            this.registerForm = {
              id: user.id,
              empId: user.empId || '',
              username: user.name || '',
               handle: user.handle || '', 
              email: user.email || '',
              gender: user.gender || '',
              department: user.department || '',
              city: user.city || '',
              address: user.address || '',
              mobile: user.mobile || '',
              secondaryContact: user.mobile2 || '',
              keyResponsibility: user.keyresponsibility || '',
              birthDate: user.dateofbirth || '',
              bloodGroup: user.bloodgroup || '',
              password: ''
            };
          },
async handleRegister() {
  if (this.nameError) {
    alert("Invalid name format!");
    return;
  }

  // Check if at least one document is uploaded (only for new registration)
  if (!this.isEditMode && Object.keys(this.typedDocuments).length === 0) {
    alert("Please upload at least one document.");
    return;
  }

  // Validate form before submitting
  if (!this.validateForm()) return;

  // Convert keyResponsibility to string (Fix for Laravel validation)
  if (this.registerForm.keyResponsibility !== undefined) {
    this.registerForm.keyResponsibility = String(this.registerForm.keyResponsibility);
  }

  // Check email only while registering new user
  if (!this.isEditMode) {
    const exists = await this.checkEmailExists();
    if (exists) {
      alert("❌ Email is already registered! Please use another email.");
      return; // Stop registration
    }
  }

  // Generate random password if new registration
  if (!this.isEditMode && !this.registerForm.password) {
    this.generatePassword();
  }

  this.loading = true;
  try {
    if (this.isEditMode) {
      // Edit existing user
      await axios.put(
        `https://employees.archenterprises.co.in/api/api/users/${this.editingId}`,
        {
          username: this.registerForm.username,
          handle: this.registerForm.handle,
          email: this.registerForm.email.toLowerCase(),
          gender: this.registerForm.gender,
          department: this.registerForm.department,
          city: this.registerForm.city,
          address: this.registerForm.address,
          mobile: this.registerForm.mobile,
          secondaryContact: this.registerForm.secondaryContact,
          birthDate: this.registerForm.birthDate,
          bloodGroup: this.registerForm.bloodGroup,
          keyResponsibility: this.registerForm.keyResponsibility
        }
      );
      alert("User updated successfully!");
    } else {
      // New registration
      await axios.post(
        "https://employees.archenterprises.co.in/api/api/register",
        {
          ...this.registerForm,
          email: this.registerForm.email.toLowerCase(),
          handle: this.registerForm.handle
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      // Send welcome email via backend
      try {
        await axios.post(
          "https://employees.archenterprises.co.in/api/api/send-registration-email",
          {
            name: this.registerForm.username,
            handle: this.registerForm.handle,
            email: this.registerForm.email,
            password: this.registerForm.password
          }
        );
        console.log("Welcome email sent successfully!");
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError.response?.data || emailError.message);
        alert("User registered but email could not be sent.");
      }

      alert("Registration successful!");
    }

    this.showRegister = false;
    this.resetForm();
    this.fetchUsers();
  } catch (error) {
    console.error("Register/Update error:", error.response?.data || error.message);
    alert("Registration failed.");
  } finally {
    this.loading = false;
  }
},



validateForm() {
  const form = this.registerForm;

  // Employee ID required & numeric (only in register mode)
  if (!this.isEditMode && (!/^[0-9]+$/.test(form.empId))) {
    alert("Employee ID must contain numbers only!");
    return false;
  }

  // Full Name – alphabets only
  if (!/^[A-Za-z ]+$/.test(form.username.trim())) {
    alert("Full Name should contain alphabets only!");
    return false;
  }

  // Handle validation
if (!/^[A-Za-z0-9_]+$/.test(form.handle.trim())) {
  alert("Handle can only contain letters, numbers, and underscores!");
  return false;
}

  // Convert email to lowercase
  form.email = form.email.toLowerCase();

  // Salary check
  if (form.keyResponsibility && isNaN(form.keyResponsibility)) {
    alert("Salary must be numeric!");
    return false;
  }

  // DOB already validated via live validation UI → just prevent submission if still invalid
  if (this.dobError || !form.birthDate) {
    return false;
  }

  // Mobile number validation
  if (!/^[0-9]{10}$/.test(form.mobile)) {
    alert("Contact Number must be exactly 10 digits!");
    return false;
  }

  // Secondary Contact optional but validate if entered
  if (form.secondaryContact && !/^[0-9]{10}$/.test(form.secondaryContact)) {
    alert("Secondary Contact Number must be exactly 10 digits!");
    return false;
  }

  return true;
},

async checkEmailUnique(email) {
    try {
      const res = await fetch("https://employees.archenterprises.co.in/api/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (data.exists) {
        alert("This email is already registered!");
        return false;
      }

      return true;
    } catch (error) {
      alert("Unable to verify email right now!");
      return false;
    }
  },



          deleteUser(userId) {
            if (confirm('Are you sure you want to Inactive this user?')) {
              axios
                .delete(`https://employees.archenterprises.co.in/api/api/users/${userId}`)
                .then(() => {
                  this.fetchUsers();
                })
                .catch(err => {
                  console.error('Error deleting user:', err);
                });
            }
          },
          togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
          },
          generatePassword() {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
            let password = '';
            for (let i = 0; i < 12; i++) {
              password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            this.registerForm.password = password;
          },
          goTo(route) {
            this.$router.push(`/${route}`);
          },
          openRegisterForm() {
            this.resetForm();
            this.showRegister = true;
          },
          closeRegisterForm() {
            this.showRegister = false;
            this.resetForm();
          },
          resetForm() {
            this.registerForm = {
              id: '',
              empId: '',
              username: '',
              email: '',
              gender: '',
              department: '',
              city: '',
              address: '',
              mobile: '',
              secondaryContact: '',
              keyResponsibility: '',
              birthDate: '',
              bloodGroup: '',
              password: ''
            };
            this.isEditMode = false;
            this.editingId = null;
          },
          logout() {
            const token = localStorage.getItem('token');
            axios
              .post('https://employees.archenterprises.co.in/api/api/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
              })
              .finally(() => {
                localStorage.removeItem('token');
                this.$router.push('/auth');
              });
          }
        }
      }
      </script>






    <style scoped>

    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
    .head-title{
      color: white;
    display: flex;
    font-size: 17px;
    gap: 7px;
    text-decoration: none;
    align-items: center;
}
.search-container {
  display: flex;
  gap: 8px;
}
.search-input {
      flex: 1;
    padding: 15px 10px;
    border: 1px solid #ccc;
    border-radius: 23px;
}
    /* Table Wrapper */
.styled-user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  font-family: 'Poppins', sans-serif;
}

/* Table Header */
.styled-user-table thead tr {
  /* background: #0E3E43; */
  color: #fff;
  text-align: center;
  border-radius: 6px;
}

.styled-user-table th {
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
}

/* Body Styles */
.styled-user-table tbody tr {
  background: #fff;
  font-size: 14px;
  text-align: center;
  transition: 0.3s ease;
  border-radius: 10px;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.08);
}

.styled-user-table tbody tr:hover {
  transform: scale(1.02);
  box-shadow: 0px 10px 20px rgba(0,0,0,0.15);
}

/* Cells */
.styled-user-table td {
  padding: 12px;
  color: #2f2f2f;
}

/* Clickable Name */
.user-name {
  font-weight: 500;
  color: #00786E;
  cursor: pointer;
}

.user-name:hover {
  color: #005d55;
  text-decoration: underline;
}

/* Action Buttons Wrapper */
.action-btns {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* Edit Button Style */
.btn-edit {
  background: #0275d8;
  border: none;
  padding: 8px 10px;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: 0.3s;
}

.btn-edit:hover {
  background: #025fae;
  transform: translateY(-2px);
}

/* Status Buttons */
.btn-status {
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  transition: 0.3s;
}

/* Active → Inactive */
.btn-status.inactive {
  background-color: #d9534f;
}

.btn-status.inactive:hover {
  background-color: #b12f2a;
  transform: translateY(-2px);
}

/* Inactive → Active */
.btn-status.active {
  background-color: #28a745;
}

.btn-status.active:hover {
  background-color: #1e7e34;
  transform: translateY(-2px);
}

/* Responsive */
@media(max-width: 768px) {
  .styled-user-table th, .styled-user-table td {
    font-size: 12px;
    padding: 8px;
  }
}

    .modal-card {
  max-height: 80vh; /* max height relative to viewport */
  overflow-y: auto; /* enable vertical scrolling inside the popup */
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  width: 600px; /* adjust width as needed */
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  position: relative;
}
body.modal-open {
  overflow: hidden;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
    .uploaded-docs {
  margin-top: 10px;
  padding-left: 20px;
  color: #427172;
  font-size: 15px;
}

.uploaded-docs li {
  margin-bottom: 6px;
  list-style-type: disc;
}

.fa-spinner {
  margin-right: 6px;
}

    .btn-info.attractive-btn {
  background-color: #17a2b8;
  border: none;
  color: white;
}

.btn-info.attractive-btn:hover {
  background-color: #138496;
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.6);
}

    .mobile-menu-icon {
      font-size: 22px;
      margin-left: 10px;
      cursor: pointer;
      display: none;
    }

    @media (max-width: 768px) {
      .mobile-menu-icon {
        display: inline-block;
      }
    .modal-card {
        padding: 1.5rem;
        max-width: 95%;
      }

      .form-row {
        flex-direction: column;
      }

      .input-group {
        flex: 1 1 100%;
      }

      .modal-buttons {
        flex-direction: column;
        gap: 0.75rem;
      }

      .toggle-btn,
      .generate-btn {
        font-size: 0.85rem;
        padding: 0.3rem 0.6rem;
      }

      .password-wrapper {
        flex-direction: row;
        align-items: flex-start;
      }

      .password-wrapper input {
        width: 100%;
      }

      .modal-title {
        font-size: 1.2rem;
      }
      .sidebar {
        position: absolute;
        z-index: 1000;
        width: 240px;
        height: 100vh;
        background-color: #2c3e50;
      }

      .expanded-content {
        margin-left: 0 !important;
        transition: margin 0.3s ease-in-out;
      }
    }

    /* New Responsive Enhancements */
    @media (max-width: 768px) {
      .main-content {
        flex-direction: column;
        padding: 15px;
      }
    .layout{
        align-self: anchor-center;

      }
      .sidebar {
        width: 100%;
        margin-bottom: 20px;
        border-radius: 12px;
      }

      .content {
        padding: 20px;
        border-radius: 12px;
      }

      .user-table th,
      .user-table td {
        font-size: 14px;
        padding: 10px;
      }

      .modal-card {
        width: 95%;
        padding: 20px;
      }

      .form-row {
        flex-direction: column;
      }

      .header {
        flex-direction: row;
        gap: 12px;
        padding: 15px;
      }

      .menu-btn,
      .logout-btn {
        width: 100%;
        margin-bottom: 8px;
      }

      .footer {
        font-size: 13px;
        padding: 10px 5px;
      }

      .chart-container {
        width: 90%;
        padding: 15px;
      }
    }
    .kra-checkbox-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 8px;
      border-radius: 4px;
    }

    .kra-checkbox-item {
      margin-bottom: 5px;
    }

    .fullscreen-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(10, 10, 10, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .chart-container {
      background: white;
      padding: 2rem;
      border-radius: 20px;
          width: 80%;
    height: 80%;
      max-width: 800px;
      position: relative;
    }

    .close-btn {
      position: absolute;
      top: 10px;
      right: 20px;
      background: crimson;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 1.5rem;
      width: 32px;
      height: 32px;
      cursor: pointer;
    }

    .kra-label {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: block;
    }

    .kra-dropdown {
      width: 100%;
      font-size: 1rem;
      padding: 10px 14px;
      border: 1px solid #3b82f6;
      border-radius: 12px;
      background-color: #fff;
  color: #427172;
      transition: all 0.3s ease;
    }

    .kra-dropdown:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
    }

    .clickable {
      cursor: pointer;
      color: #518587!important;
      text-decoration: none;
    }
    .password-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .password-wrapper input {
      flex: 1;
    }

    .toggle-btn,
    .generate-btn {
      padding: 6px 10px;
      background-color: #5f9ea0;
      border: none;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
    }

    .toggle-btn i {
      pointer-events: none;
    }

    .toggle-btn:hover,
    .generate-btn:hover {
      background-color: #426b6c;
    }

    .user-table td .btn-group {
      display: flex;
      gap: 0.5rem;
    }
    /* Layout */
    .layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #ffffff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #427778;
    }
.company-name {
font-size: 21px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
}/* Header */
.header {
  font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
 background-color: cadetblue; 
  color: white;
  padding: 8px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15); */
  position: sticky;
  top: 0;
  z-index: 10;
}

    .logo {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .menu-btn, .logout-btn {
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .menu-btn {
   background-color: #407173;
    color: #ffffff;
    margin-bottom: 22px;

    }

    .menu-btn:hover {
    background-color: #1f3b3c;
  color: #ffffff;
    margin-bottom: 22px;
    }

    .logout-btn {
      background-color: white;
      color: #003977;
      border: 2px solid #007bff;
    }

    .logout-btn:hover {
      background-color: #e7f1ff;
    }

    /* Main Content */
    .main-content {
      display: flex;
      flex: 1;
      padding: 30px;
      gap: 20px;
    }

    /* Sidebar */
    .sidebar {
      background-color: #ffffff;
      width: 220px;
      padding: 25px 20px;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.05);
      font-weight: 600;
      color: #495057;
    }

    .sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar li {
      padding: 14px 10px;
      margin-bottom: 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .sidebar li:hover {
      background-color: #5f9ea0;
      color: white;
      font-weight: 700;
    }

    /* Content Section */
    .content {
      flex: 1;
      background-color: #f0f2f8;
      padding: 30px 40px;
      border-radius: 15px;
      /* box-shadow: 0 5px 30px rgba(0,0,0,0.08); */
      overflow-x: auto;
    }

    h2 {
      margin-bottom: 30px;
      color: #417475;
      font-weight: 800;
      font-size: 21px;
          text-transform: uppercase;
      border-bottom: 2px solid #5f9ea0;
      padding-bottom: 8px;
    }

    /* User Table */
    .user-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 6px 9px;
    }

    .user-table th,
    .user-table td {
     
      text-align: left;
      font-size: 16px;
     
    }

    .user-table th {
      padding: 11px 20px;
      background-color: #5f9ea0;
      font-weight: 700;
      border-bottom: none;
      border-radius: 12px 12px 0 0;
    }

    .user-table tbody tr {
      background-color: #fefefe;
      box-shadow: 0 1px 5px rgba(0,0,0,0.07);
      border-radius: 10px;
      transition: transform 0.2s ease;
    }

    .user-table tbody tr:hover {
      background-color: #e9f5ff;
      transform: translateX(5px);
    }

    .user-table tbody td {
      border: none;
      vertical-align: middle;
    }

    /* Footer */
    .footer {
      background-color: #343a40;
      color: white;
      text-align: center;
      padding: 15px 0;
      font-size: 14px;
      font-weight: 500;
      margin-top: auto;
      letter-spacing: 0.6px;
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      background-color: #000000b8;

      top: 0;
      left: 0;
      width: 97vw;
      height: 100vh;
       /* background-color: #154477 */ ;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      padding: 0 15px;
    }

    /* Modal Card */
    .modal-card {
      background-color: white;
      width: 70%;
      border-radius: 20px;
      padding: 40px 50px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.2);
      max-height: 86vh;
      overflow-y: auto;
      animation: slideDown 0.4s ease forwards;
      position: relative;

      /* Hide scrollbar but allow scroll */
      /* scrollbar-width: none; 
      -ms-overflow-style: none;  */
    }
/* 
    .modal-card::-webkit-scrollbar {
      display: none; 
    } */
.modal-card::-webkit-scrollbar {
  width: 8px;
}

.modal-card::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 4px;
}

.modal-card::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Firefox */
.modal-card {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}


    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Modal Title */
    .modal-title {
      text-transform: uppercase;
      font-size: 28px;
        /* font-weight: 800; */
        text-align: center;
        margin-bottom: 35px;
        color: #041f3d;
        letter-spacing: 1.3px;
    }

    /* Form Layout */
    .attractive-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Form Rows */
    .form-row {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .form-row .input-group {
      flex: 1 1 48%;
      display: flex;
      flex-direction: column;
    }

    /* Full width input group */
    .input-group.full-width {
      flex: 1 1 100%;
    }

    /* Input Group */
    .input-group label {
      font-weight: 700;
      margin-bottom: 10px;
      color: #427778;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
    }

    .input-group input,
    .input-group select,
    .input-group textarea {
      padding: 11px 18px;
      border: 1px solid #ced4da;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 500;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
    }

    .input-group input:focus,
    .input-group select:focus,
    .input-group textarea:focus {
      border-color: #5f9ea0;
      outline: none;
      box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
      background-color: #f9fbff;
    }

    /* Textarea resize */
    .input-group textarea {
      resize: vertical;
      min-height: 56px;
      font-family: inherit;
    }

    /* Modal Buttons */
    .modal-buttons {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }

    .btn {
      flex: 1;
      padding: 14px 0;
      font-weight: 700;
      font-size: 0.9rem;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
      user-select: none;
      background-color: #f44c4c;
    color: white;
    }

    .btn-primary {
      background-color: #5f9ea0;
      color: white;
      box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
    }

    .btn-primary:hover {
      background-color: #426b6c;
      box-shadow: 0 8px 18px rgba(0, 86, 179, 0.6);
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
      box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
    }

    .btn-secondary:hover {
      background-color: #5a6268;
      box-shadow: 0 8px 18px rgba(90, 98, 104, 0.6);
    }

    /* Fade Transition */
    .fade-enter-active, .fade-leave-active {
      transition: opacity 0.35s ease;
    }
    .fade-enter-from, .fade-leave-to {
      opacity: 0;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .form-row .input-group {
        flex: 1 1 100%;
      }

      .modal-card {
        /* padding: 30px 25px; */
        left: -9px
      }
    }

    @media (max-width: 480px) {
      .header {
        flex-direction: row;
        gap: 10px;
      }
      .menu-btn, .logout-btn {
        width: 100%;
      }
    }
    .attractive-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      font-weight: 600;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
      user-select: none;
    }

    .btn-primary.attractive-btn {
      
      background-color: #5f9ea0;
      border: none;
      color: white;
    }

    .btn-primary.attractive-btn:hover {
      background-color: #426b6c;
      box-shadow: 0 4px 12px rgba(13,110,253,0.6);
    }

    .btn-danger.attractive-btn {
      background-color: #ff6f00;
      border: none;
      color: white;
    }

    .btn-danger.attractive-btn:hover {
      background-color: #ec6b08;
      box-shadow: 0 4px 12px rgba(220,53,69,0.6);
    }

    .attractive-btn i {
      font-size: 14px;
    }
    

    </style>
