<template>
  <div class="layout">
    <!-- Sidebar -->
     <aside
  class="sidebar"
  :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }"
>


<button class="sidebar-toggles" @click="toggleSidebar">
  <span class="toggle-icon" style="color: white; float: right;">{{ isCollapsed ? '⫸' : '⫷' }}</span>
</button>


  <!-- Profile Section -->
  <div class="profile-section">
   <img
  :src="profileImage"
  alt="Profile Picture"
  class="profile-pic"
/>

  </div>
<!-- <h2 class="sidebar-title">{{ adminName }}</h2> -->


  <!-- NEW WRAPPER ADDED HERE -->
 <div class="menu-scroll">

     <!-- <div class="search-bar" v-if="adminName && adminName.toLowerCase() !== 'hr'">
      <input
        type="text"
        placeholder="Search..."
        v-model="searchQuery"
        @input="handleSearch"
      />
      <i class="fas fa-search"></i>
    </div> -->
    <ul class="sidebar-menu">
      <li @click="goTo('dashboard')">
        <i class="fas fa-tachometer-alt"></i>  <span>Dashboard</span>
      </li>
<li @click="goTo('rcahelp')">
            <i class="fas fa-comments" aria-hidden="true"></i> <span>Chat</span>
          </li>
                <li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('ScheduleMeeting')">
  <i class="fas fa-headset"></i> <span>Schedule Meeting</span>
</li>
      <!-- Leaves Dropdown -->
      <li class="dropdown" v-if="adminName && adminName.toLowerCase() !== 'crm'">
        <div class="" @click="toggleDropdown">
          <i class="fas fa-calendar-alt"></i> <span>Leaves</span>
          <i class="fas fa-caret-down" style="margin-left:auto;"></i>
        </div>
  
        <ul v-if="dropdownOpen" class="dropdown-menu">
          <li @click="goTo('leaveapplications')">
            <i class="fas fa-list"></i><span> All Leaves</span>
          </li>
          <li @click="goTo('approvedleaves')">
            <i class="fas fa-check-circle"></i><span> Approved Leaves</span>
          </li>
          <li @click="goTo('rejectedleaves')">
            <i class="fas fa-times-circle"></i><span> Rejected Leaves</span>
          </li>
          <li @click="goTo('pendingleaves')">
            <i class="fas fa-hourglass-half"></i><span> Pending Leaves</span>
          </li>
        </ul>
      </li>

      <li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('workflow')">
  <i class="fas fa-tasks"></i> <span>Work Flow</span>
</li>

<li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('expensemanage')">
  <i class="fas fa-money-bill-wave"></i> <span>Expense</span>
</li>

<li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('resourcebooking')">
  <i class="fa-solid fa-calendar"></i><span>Resource Booking</span>
</li>

<li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('requestdesk')">
  <i class="fas fa-headset"></i> <span>Request Desk</span>
</li>

<li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('recruitmentsection')">
  <i class="fas fa-user-tie"></i><span> Recruitment</span>
</li>

<li v-if="adminName && adminName.toLowerCase() !== 'hr'" @click="goTo('employee/followup')">
  <i class="fas fa-calendar-check"></i><span> follow-up</span>
</li>

<li v-if="adminName && adminName.toLowerCase() !== 'hr'" @click="goTo('employee/amcrecord')">
  <i class="fas fa-file-alt"></i><span> AMC Record Data</span>
</li>



        <!-- <li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('timesheet')">
       <i class="fas fa-users"></i> Time Sheet
     </li> -->

      <li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('manageleavetype')">
        <i class="fas fa-sliders-h"></i><span> Manage Leave Type</span>
      </li>

      <!-- <li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('workreport')">
        <i class="fas fa-clipboard-list"></i> Work Report & Task
      </li> -->
 <li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="goTo('empdsi')">
            <i class="fas fa-tasks"></i> <span>View DSI</span>
          </li>
<!--            
      <li v-if="adminName && adminName.toLowerCase() !== 'crm'" @click="showPerformanceModal = true">
        <i class="fas fa-chart-line"></i><span> Performance</span>
      </li> -->

      <li @click="logout" class="danger-bg">
        <i class="fas fa-sign-out-alt"></i><span> Logout</span>
      </li>
       <li class="theme-switcher">
      <label class="theme-label"><span>🎨 Theme</span></label>

      <select
        class="theme-select"
        @change="changeTheme"
        :value="currentTheme"
      >
        <option value="default">⚪ Default</option>
        <option value="blue">🟦 Blue</option>
        <option value="green">🟩 Green</option>
        <option value="orange">🟧 Orange</option>
        <option value="red">🟥 Red</option>
        <option value="teal">🟦 Teal</option>
        <option value="purple">🟥 Purple</option>
      </select>
    </li>
    </ul>
  </div>
</aside>
<div
  v-if="isMobileOpen"
  class="mobile-overlay"
  @click="isMobileOpen = false"
></div>



    <!-- Main Content -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- Performance Modal -->
   <div v-if="showPerformanceModal" class="performance-modal-overlay">
  <div class="performance-modal-card">

    <h2 class="performance-title">
      QUARTERLY PERFORMANCE EVALUATION 🏅
    </h2>

    <!-- Employee -->
    <div class="performance-field">
      <label>Employee</label>
      <select v-model="selectedEmployee" class="performance-select">
        <option disabled value="">Select an Employee</option>
        <option v-for="user in users" :key="user.id" :value="user">
          {{ user.name }}
        </option>
      </select>
    </div>

    <!-- Attendance -->
    <div class="performance-field">
      <label>Attendance Score</label>
      <input
        type="number"
        v-model="attendance"
        readonly
        class="performance-input readonly"
      />
    </div>

    <!-- Targets -->
    <div class="performance-row" v-if="!isSpecialEmployee">
      <div class="performance-field">
        <label>Target Achieved</label>
        <input
          type="number"
          v-model="targetAchieved"
          placeholder="e.g. 12"
          class="performance-input"
        />
      </div>

      <div class="performance-field">
        <label>Total Target</label>
        <input
          type="number"
          v-model="targetTotal"
          placeholder="e.g. 20"
          class="performance-input"
        />
      </div>
    </div>

    <!-- Manager Review -->
    <div class="performance-field">
      <label>Manager Review</label>
      <div class="performance-stars">
        <i
          v-for="star in 10"
          :key="star"
          class="fa"
          :class="star <= reviewStars ? 'fa-star active' : 'fa-star-o'"
          @click="reviewStars = star"
        ></i>
      </div>
      <div v-if="reviewStars > 0" class="performance-percentage">
        {{ reviewStars * 10 }}%
      </div>
    </div>

    <!-- Actions -->
    <div class="performance-actions">
      <button class="btn-primary" @click="calculatePerformance" :disabled="loading">
        <span v-if="loading">
          <i class="fas fa-spinner fa-spin"></i> Calculating...
        </span>
        <span v-else>Calculate</span>
      </button>

      <button
        v-if="performanceScore !== null"
        class="btn-success"
        @click="savePerformance"
      >
        Save
      </button>

      <button class="btn-outline" @click="showPerformanceModal = false">
        Close
      </button>
    </div>

    <!-- Result -->
    <div v-if="performanceScore !== null" class="performance-result">
      Performance Score: <span>{{ performanceScoreDisplay }}</span>
    </div>

  </div>
</div>


    <!-- 🔐 Vault Login Modal -->
    <div v-if="showVaultLogin" class="vault-theme-overlay vault-login-overlay">
      <div class="vault-theme-content vault-login-content">
        <h3 class="vault-theme-title">🔐 Vault Access Required</h3>
        <p class="vault-theme-subtext">Please enter your admin vault credentials.</p>

        <input
          type="email"
          v-model="vaultLogin.email"
          placeholder="Enter your admin email"
          class="vault-theme-input"
        />
        <input
          type="password"
          v-model="vaultLogin.password"
          placeholder="Enter password"
          class="vault-theme-input"
        />

        <button @click="submitVaultLogin" :disabled="loadingVaultLogin" class="vault-theme-btn">
          <span v-if="loadingVaultLogin"><i class="fas fa-spinner fa-spin"></i> Verifying...</span>
          <span v-else>Login</span>
        </button>

        <button class="vault-theme-close-btn" @click="showVaultLogin = false">Cancel</button>
      </div>
    </div>

    <!-- 📩 Vault OTP Modal -->
    <div v-if="showVaultOtp" class="vault-theme-overlay vault-otp-overlay">
      <div class="vault-theme-content vault-otp-content">
        <h3 class="vault-theme-title">📩 Verify OTP</h3>
        <p class="vault-theme-subtext">Enter the 6-digit code sent to your email.</p>

        <input
          type="text"
          v-model="vaultOtp"
          placeholder="Enter OTP"
          maxlength="6"
          class="vault-theme-input"
        />

        <button @click="verifyVaultOtp" :disabled="verifyingOtp" class="vault-theme-btn">
          <span v-if="verifyingOtp"><i class="fas fa-spinner fa-spin"></i> Verifying...</span>
          <span v-else>Verify</span>
        </button>

        <button class="vault-theme-close-btn" @click="cancelVaultOtp">Cancel</button>
      </div>
    </div>

    <!-- 🗄️ Admin Security Vault Modal -->
    <div v-if="showVaultModal" class="vault-theme-overlay vault-main-overlay">
      <div class="vault-theme-content vault-main-content">
        <div class="vault-theme-header">
          <h3 class="vault-theme-title">🔐 Admin Security Vault</h3>
          <button class="vault-theme-close-btn" @click="showVaultModal = false">&times;</button>
        </div>

        <p class="vault-theme-subtext">
          Upload important files securely and manage access.
        </p>

        <div class="vault-upload-section">
          <input type="file" @change="handleFileUpload" class="vault-theme-file-input" />
          <button
            class="vault-theme-btn"
            @click="uploadFile"
            :disabled="uploading || !selectedFile"
          >
            <span v-if="uploading"><i class="fas fa-spinner fa-spin"></i> Uploading...</span>
            <span v-else>Upload File</span>
          </button>
        </div>

        <div v-if="vaultFiles.length" class="vault-files-section">
          <h4 class="vault-theme-subheading">Uploaded Files</h4>
          <table class="vault-files-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Filename</th>
                <th>Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(file, index) in vaultFiles" :key="file.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <a :href="file.path" target="_blank" class="vault-file-link">
                    {{ file.filename }}
                  </a>
                </td>
                <td>
                  <button class="vault-theme-btn small" @click="openAccessModal(file)">
                    <i class="fas fa-share"></i> Give Access
                  </button>
                </td>
                <td>
                  <button class="vault-theme-delete-btn" @click="deleteFile(file.id)">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 👥 Grant File Access Modal (Topmost Layer) -->
   <div
  v-if="showAccessModal"
  class="vault-theme-overlay vault-access-overlay"
  style="z-index: 9999"
>
  <div class="vault-theme-content vault-access-content">
    <h3 class="vault-theme-title">👥 Grant File Access</h3>
    <p class="vault-theme-subtext">
      Assign access for <strong>{{ selectedFileForAccess?.filename }}</strong>
    </p>

    <div class="vault-access-user">
      <label>Select User</label>
      <select v-model="selectedUserForAccess" class="vault-theme-input">
        <option disabled value="">-- Choose User --</option>
        <option v-for="u in users" :key="u.id" :value="u.id">
          {{ u.name }}
        </option>
      </select>
    </div>

    <div class="vault-access-type">
      <label>Access Type</label>
      <select v-model="selectedAccessType" class="vault-theme-input">
        <option disabled value="">-- Choose Access Type --</option>
        <option value="read">Read Only</option>
        <option value="write">Read & Write</option>
      </select>
    </div>

    <!-- Show Selected User Info -->
    <div v-if="selectedUserForAccess" class="vault-selected-user">
      <p class="vault-selected-text">
        🔒 You are granting access to:
        <strong>
          {{
            users.find(u => u.id === selectedUserForAccess)?.name ||
            "Unknown User"
          }}
        </strong>
        for file:
        <strong>{{ selectedFileForAccess?.filename }}</strong>
      </p>
    </div>

    <div class="vault-theme-actions">
      <button
        @click="submitAccessChange"
        :disabled="accessLoading"
        class="vault-theme-btn"
      >
        <span v-if="accessLoading">
          <i class="fas fa-spinner fa-spin"></i> Saving...
        </span>
        <span v-else>Save Access</span>
      </button>
      <button class="vault-theme-close-btn" @click="closeAccessModal">
        Cancel
      </button>
    </div>
  </div>
</div>

  </div>
  <!-- Popup for search results -->
<div v-if="showPopup" class="popup-backdrop" @click.self="closePopup">
  <div class="popup">
    <h3>Search Results</h3>
    <div class="table-container">
      <table v-if="results.length" class="results-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>PO Type</th>
            <th>PO Number</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in results" :key="item.id">
            <td>{{ item.company_name }}</td>
            <td>{{ item.po_type }}</td>
            <td>{{ item.po_number }}</td>
            <td>{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-results">No results found.</p>
    </div>
    <button class="close-btn" @click="closePopup">Close</button>
  </div>
</div>
</template>


<script>
import axios from 'axios'

export default {
  data() {
    return {
      isMobileOpen: false,
       isCollapsed: false,
      currentTheme: localStorage.getItem("theme") || "default",
       adminEmail: '',
         adminName: '',
        searchQuery: "",
      results: [],
      showPopup: false,
            showAccessModal: false,
      selectedFileForAccess: null,
      selectedUserForAccess: "",
      selectedAccessType: "",
      accessLoading: false,
      showVaultOtp: false,
vaultOtp: "",
verifyingOtp: false,
vaultToken: null,

      showVaultLogin: false,
vaultLogin: {
  email: "",
  password: "",
},
loadingVaultLogin: false,
    showVaultModal: false,
selectedFile: null,
uploading: false,
vaultFiles: [],
       user: {
      profile_picture: "https://cdn-icons-png.freepik.com/256/6024/6024190.png"
    },
      dropdownOpen: false,
      showPerformanceModal: false,
      users: [],
      selectedEmployee: '',
      attendance: '',
      targetAchieved: '',
      targetTotal: '',
      reviewStars: 0,
      performanceScore: null,
       performanceScoreDisplay: '',
      loading: false
    }
  },
watch: {
  showVaultModal(newVal) {
    if (newVal) this.fetchVaultFiles();
  },
  selectedEmployee(newVal) {
    if (newVal && newVal.quarter_score !== undefined) {
      this.attendance = newVal.quarter_score;
    } else {
      this.attendance = null;
    }
  }
},
computed: {
 isSpecialEmployee() {
    const specialEmployees = ["DIPESH SANJAY BAVISKAR", "AJAY ANANDRAO WATPADE"];
    return this.selectedEmployee && specialEmployees.includes(this.selectedEmployee.name);
  },
  profileImage() {
    if (!this.adminName) {
      return "https://img.icons8.com/fluency/96/user-male-circle.png";
    }

    const name = this.adminName.toLowerCase();

    if (name === "hr") {
      return "https://i.pinimg.com/736x/03/82/e8/0382e829a8b19c46cabfe9abf8c80d8b.jpg";
    }

    if (name === "crm") {
      return "https://thumbs.dreamstime.com/b/crm-customer-relationship-management-icon-isolated-white-background-crm-customer-relationship-management-icon-isolated-white-406601841.jpg";
    }

    // fallback to user's uploaded profile picture or default
    return (
      this.user.profile_picture ||
      "https://img.icons8.com/fluency/96/user-male-circle.png"
    );
  }
},



  methods: {
     toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  },
     changeTheme(e) {
      const theme = e.target.value
      this.currentTheme = theme

      document.documentElement.classList.add("theme-transition")
      document.documentElement.setAttribute("data-theme", theme)
      localStorage.setItem("theme", theme)

      setTimeout(() => {
        document.documentElement.classList.remove("theme-transition")
      }, 400)
    },

async fetchAdmin() {
  try {
    const res = await axios.get(
      "https://employees.archenterprises.co.in/api/api/admin-info",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    this.adminName = res.data.name;
    this.adminEmail = res.data.email;

  } catch (error) {
    console.error("Admin info error:", error);
  }
},


     handleSearch() {
      if (this.searchQuery.length < 1) {
        this.results = [];
        this.showPopup = false;
        return;
      }

      axios
        .get("/api/search-po", { params: { query: this.searchQuery } })
        .then((res) => {
          this.results = res.data;
          this.showPopup = true;
        })
        .catch((err) => console.error(err));
    },
    closePopup() {
      this.showPopup = false;
    },
     // 🔹 Open the Give Access modal
    openAccessModal(file) {
      this.selectedFileForAccess = file;
      this.showAccessModal = true;
      this.selectedUserForAccess = "";
      this.selectedAccessType = "";
    },

    closeAccessModal() {
      this.showAccessModal = false;
      this.selectedFileForAccess = null;
    },

    // 🔹 Submit the selected access to backend
 async submitAccessChange() {
    if (!this.selectedUserForAccess || !this.selectedAccessType) {
      alert("Please select both user and access type!");
      return;
    }

    this.accessLoading = true;

    try {
      const selectedUser = this.users.find(
        (u) => u.id === this.selectedUserForAccess
      );
      const fileId = this.selectedFileForAccess?.id;

      // 1️⃣ Update file access permission
      await axios.post("/api/vault/grant-access", {
        file_id: fileId,
        user_id: this.selectedUserForAccess,
        access_type: this.selectedAccessType,
      });

      // 2️⃣ Update `uploaded_by` in vault_files
      await axios.put(`/api/vault/update-uploaded-by/${fileId}`, {
        uploaded_by: selectedUser?.name || "Unknown User",
      });

      alert(
        `✅ Access granted to ${selectedUser.name} for file "${this.selectedFileForAccess.filename}"`
      );

      this.closeAccessModal();
    } catch (error) {
      console.error("Error saving access:", error);
      alert("❌ Failed to update access or uploaded_by field.");
    } finally {
      this.accessLoading = false;
    }
  },

    async deleteFile(fileId) {
  if (!confirm("Are you sure you want to delete this file?")) return;

  const token = localStorage.getItem("vault_token");
  try {
    const response = await axios.delete(
      `https://employees.archenterprises.co.in/api/api/admin/delete-vault-file/${fileId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      this.vaultFiles = this.vaultFiles.filter(f => f.id !== fileId);
      alert("File deleted successfully!");
    }
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete file. Please try again.");
  }
},
async updateAccess(file) {
  const token = localStorage.getItem("vault_token");
  console.log("Updating access for file:", file);

  try {
    const response = await axios.post(
      "https://employees.archenterprises.co.in/api/api/admin/update-vault-access",
      {
        file_id: file.id,
        access: file.access
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      alert(`Access for ${file.filename} updated to ${file.access}`);
    } else {
      alert(response.data.message);
    }
  } catch (error) {
    console.error("Access update failed:", error);
    alert("Failed to update file access.");
  }
},



    async verifyVaultOtp() {
  if (!this.vaultOtp) {
    alert("Please enter the OTP.");
    return;
  }

  this.verifyingOtp = true;
  try {
    const response = await axios.post(
      "https://employees.archenterprises.co.in/api/api/admin/verify-vault-otp",
      {
        forgot_email: this.vaultLogin.email,
        otp: this.vaultOtp,
      }
    );

    if (response.data.success) {
      this.vaultToken = response.data.token;
      localStorage.setItem("vault_token", this.vaultToken);

      alert("✅ OTP verified successfully!");
      this.showVaultOtp = false;
      this.showVaultModal = true;
    } else {
      alert(response.data.message || "Invalid OTP. Please try again.");
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    alert(error.response?.data?.message || "OTP verification failed.");
  } finally {
    this.verifyingOtp = false;
  }
},

cancelVaultOtp() {
  this.showVaultOtp = false;
  this.vaultOtp = "";
},

    openVaultLogin() {
  this.showVaultLogin = true;
},

async submitVaultLogin() {
  if (!this.vaultLogin.email || !this.vaultLogin.password) {
    alert("Please enter both email and password.");
    return;
  }

  this.loadingVaultLogin = true;

  try {
    const response = await axios.post(
      "https://employees.archenterprises.co.in/api/api/admin/vault-login",
      {
        forgot_email: this.vaultLogin.email,
        password: this.vaultLogin.password,
      }
    );

    if (response.data.success) {
      alert("✅ OTP sent to your email. Please verify.");
      this.showVaultLogin = false;
      this.showVaultOtp = true;
    } else {
      alert(response.data.message || "Login failed.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert(error.response?.data?.message || "Login failed. Please try again.");
  } finally {
    this.loadingVaultLogin = false;
  }
},

    handleFileUpload(event) {
  this.selectedFile = event.target.files[0];
},

async uploadFile() {
  if (!this.selectedFile) {
    alert("Please select a file first!");
    return;
  }

  const token = localStorage.getItem("vault_token");

  const formData = new FormData();
  formData.append("file", this.selectedFile);

  this.uploading = true;

  try {
    const response = await axios.post(
      "https://employees.archenterprises.co.in/api/api/admin/upload-vault-file",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success) {
      const uploadedFile = response.data.file; // make sure backend returns uploaded file info
      // Add default access property
      uploadedFile.access = "read";

      // Push to vaultFiles array so table updates immediately
      this.vaultFiles.push(uploadedFile);

      alert("File uploaded successfully!");
      this.selectedFile = null;
    }
  } catch (error) {
    console.error("Upload failed:", error);
    alert("File upload failed. Please try again.");
  } finally {
    this.uploading = false;
  }
},

async fetchVaultFiles() {
  const token = localStorage.getItem("vault_token");
  try {
    const response = await axios.get(
      "https://employees.archenterprises.co.in/api/api/admin/vault-files",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    this.vaultFiles = response.data.files || [];
  } catch (error) {
    console.error("Failed to fetch vault files:", error);
  }
},

 async fetchAttendanceForEmployee(name) {
  const token = localStorage.getItem('token');
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  try {
    const response = await axios.get(`https://employees.archenterprises.co.in/api/api/attendance`, {
      params: {
        name: name,
        month: currentMonth,
        year: currentYear
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      const matchedRecord = response.data.find(att => att.name === name);
      if (matchedRecord) {
        this.attendance = matchedRecord.present_quarter || '';
      } else {
        this.attendance = '';
      }
    } else {
      this.attendance = '';
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    this.attendance = '';
  }
},



    async savePerformance() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found. User might not be logged in.');
    this.error = 'Authentication required. Please log in again.';
    return;
  }

  try {
    // 1. Save performance review
    await axios.post(
      'https://employees.archenterprises.co.in/api/api/performance-reviews',
      {
        user_id: this.selectedEmployee.id,

        attendance: this.attendance,
        target_achieved: this.targetAchieved,
        target_total: this.targetTotal,
        review_stars: this.reviewStars,
        performance_score: parseFloat(this.performanceScore)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // 2. Save to attendance table
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    await axios.post(
  'https://employees.archenterprises.co.in/api/api/update-performance-percentage',
  {
    user_id: this.selectedEmployee?.id || 0,
    name: this.selectedEmployee?.name || "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    performance_percentage: isNaN(Number(this.performanceScore)) ? 0 : Number(this.performanceScore),
    present_quarter: isNaN(Number(this.attendance)) ? 0 : Number(this.attendance)
  },
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);



    alert('Performance review saved and attendance updated!');
    this.showPerformanceModal = false;
    this.resetFields();
  } catch (error) {
  if (error.response && error.response.status === 422) {
    console.error('Validation failed:', error.response.data);
    alert('Validation failed: ' + JSON.stringify(error.response.data.errors, null, 2));
  } else {
    // console.error('Error saving performance review:', error);
    alert('Performance review saved and attendance updated!');
  }
}

},

 resetFields() {
    this.selectedEmployee = '';
    this.attendance = '';
    this.targetAchieved = '';
    this.targetTotal = '';
    this.reviewStars = 0;
    this.performanceScore = null;
  },

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
    },
    goTo(route) {
      this.$router.push(`/${route}`)
    },
    logout() {
      const token = localStorage.getItem('token')
      axios.post('https://employees.archenterprises.co.in/api/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).finally(() => {
        localStorage.removeItem('token')
        this.$router.push('/auth')
      })
    },
   async fetchUsers() {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("User response:", res.data); // <-- check structure here
    this.users = res.data.users || res.data || [];
  } catch (error) {
    console.error('Failed to load users:', error);
  }
},

calculatePerformance() {
  if (!this.attendance || !this.reviewStars) return;

  this.loading = true;

  setTimeout(() => {
    const attendanceValue = parseFloat(this.attendance);
    const reviewValue = parseFloat(this.reviewStars);

    const specialEmployees = ["DIPESH SANJAY BAVISKAR", "AJAY ANANDRAO WATPADE"];
    
    if (specialEmployees.includes(this.selectedEmployee.name)) {
      // ✅ Special employees: Attendance counts for 50% directly (not 25%)
      const attendancePercent = attendanceValue; // keep original %
      const reviewPercent = (reviewValue / 10) * 100;

      const finalScore = ((attendancePercent * 2) + (reviewPercent * 0.5)).toFixed(2);
      this.performanceScore = parseFloat(finalScore);
      this.performanceScoreDisplay = finalScore + '%';
      this.loading = false;
      return;
    }

    // ✅ Normal employees: Attendance 25%, Target 50%, Review 25%
    if (!this.targetAchieved || !this.targetTotal || this.targetTotal == 0) {
      this.performanceScore = 'Invalid target input';
      this.loading = false;
      return;
    }

    const targetAchievedValue = parseFloat(this.targetAchieved);
    const targetTotalValue = parseFloat(this.targetTotal);

    const attendanceScore = attendanceValue * 0.25;
    const targetScore = ((targetAchievedValue / targetTotalValue) * 100) * 0.5;
    const reviewScore = ((reviewValue / 10) * 100) * 0.25;

    const finalScore = (attendanceScore + targetScore + reviewScore).toFixed(2);
    this.performanceScore = parseFloat(finalScore);
    this.performanceScoreDisplay = finalScore + '%';
    this.loading = false;

  }, 1000);
}









  },
  mounted() {
    document.documentElement.setAttribute(
      "data-theme",
      this.currentTheme
    ),
      this.fetchAdmin();
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    } else {
      this.fetchUsers();
    }
  }
}
</script>

<style scoped>
/* Layout */
.layout {
  display: flex;
   min-height: 100vh; 
   position: sticky;
  background: #f4f6fb;
}

/* Sidebar */
.sidebar { 
  width: 260px;
  background: linear-gradient(180deg, var(--primary), #020617);
  color: #e5e7eb;
  display: flex;
  height: 100%;
  flex-direction: column;
  transition: width 0.35s ease;
  box-shadow: 4px 0 12px rgba(0,0,0,0.15);
  position: relative;
}

/* Collapsed sidebar */
.sidebar.collapsed {
  width: 80px;
}

/* Profile Section */
.profile-section {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.profile-pic-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.profile-pic {
  width: 70px;
  margin-left: -16px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #38bdf8;
  cursor: pointer;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hide title when collapsed */
.sidebar.collapsed .sidebar-title {
  display: none;
}

.menu-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
    max-height: calc(100vh - 180px);
}

/* Scrollbar */
.menu-scroll::-webkit-scrollbar {
  width: 5px;
}
.menu-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
}

/* Menu */
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.25s ease, padding 0.3s ease;
  border-radius: 8px;
  margin: 4px 10px;
      flex-wrap: wrap;
}

.sidebar-menu li i {
  min-width: 20px;
  text-align: center;
  font-size: 16px;
}

/* Hover */
.sidebar-menu li:hover {
  background: rgba(56, 189, 248, 0.15);
}

/* Active / Danger */
.danger-bg {
  color: #fca5a5;
}
.danger-bg:hover {
  background: rgba(248, 113, 113, 0.15);
}
.dropdown-wrapper > div {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.dropdown-menu {
  margin-top: 6px;
  padding-left: 10px;
}

.dropdown-menu li {
  font-size: 13px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.04);
}
.search-bar {
  padding: 10px 16px;
  position: relative;
}

.search-bar input {
  width: 100%;
  padding: 8px 34px 8px 12px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: #020617;
  color: #fff;
  font-size: 13px;
}

.search-bar i {
  position: absolute;
  right: 26px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}
.sidebar-toggle {
  position: absolute;
  top: -9px;
  right: -15px;
  background: #38bdf8;
  border: none;
  color: #020617;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
}
.sidebar.collapsed .sidebar-menu li span{
  display: none;
}

.sidebar.collapsed .sidebar-menu li {
  justify-content: center;
  padding: 14px;
}
/* COLLAPSED SIDEBAR */
.sidebar.collapsed .sidebar-menu li {
  justify-content: center;
  padding: 14px;
}

/* Hide text only */
.sidebar.collapsed .sidebar-menu li span {
  display: none;
}

/* Hide caret arrow only */
.sidebar.collapsed .fa-caret-down {
  display: none;
}

/* Make dropdown container behave like normal item */
.sidebar.collapsed .dropdown-wrapper > div {
  justify-content: center;
}

/* Ensure icons stay visible */
.sidebar.collapsed .sidebar-menu li i {
  display: inline-block;
}

/* ================= MOBILE RESPONSIVE ================= */
@media (max-width: 768px) {

  .sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    height: 100vh;
    width: 260px;
    z-index: 1001;
    transition: left 0.35s ease;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  /* Disable collapse mode on mobile */
  .sidebar.collapsed {
    width: 260px;
  }

  /* Always show text on mobile */
  .sidebar-menu li span {
    display: inline !important;
  }

  .fa-caret-down {
    display: inline !important;
  }

  /* Overlay */
  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1000;
  }

  /* Toggle button reposition */
  .sidebar-toggle {
    top: 15px;
    right: 15px;
    z-index: 1100;
  }

  /* Main content full width */
  .layout {
    flex-direction: column;
  }

  .main-content {
    margin-left: 0 !important;
  }
}

.sidebar-toggle {
  position: absolute;
  top: -9px;
  right: -15px;
  width: 30px;
  height: 30px;
  background: #38bdf8;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  z-index: 1100;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
}

.sidebar-toggle span {
  display: block;
  width: 16px;
  height: 2px;
  margin: 3px 0;
  background: #020617;
  border-radius: 1px;
  transition: all 0.4s ease;
}

/* Animate hamburger to X */
.sidebar-toggle .bar1.active {
  transform: rotate(45deg) translate(4px, 4px);
}
.sidebar-toggle .bar2.active {
  opacity: 0;
}
.sidebar-toggle .bar3.active {
  transform: rotate(-45deg) translate(4px, -4px);
}

.sidebar-toggles{
  background-color: black;
}
.sidebar { 
  width: 260px;
  background: linear-gradient(180deg, var(--primary), #020617);
  color: #e5e7eb;
  display: flex;
  flex-direction: column;

  /* ✅ STICKY SIDEBAR */
  position: sticky;
  top: 0;
  height: 81vh;

  transition: width 0.35s ease;
  box-shadow: 4px 0 12px rgba(0,0,0,0.15);
  z-index: 100;
}

</style>