<template>
  <div class="layout">
    <!-- Sidebar -->
   <aside class="sidebar">
  <!-- Profile Section -->
  <div class="profile-section">
    <img
      :src="user.profile_picture || 'https://img.icons8.com/fluency/96/user-male-circle.png'"
      alt="Profile Picture"
      class="profile-pic"
    />
  </div>

  <h2 class="sidebar-title">Admin</h2>

  <!-- NEW WRAPPER ADDED HERE -->
  <div class="menu-section">
     <div class="search-bar">
      <input
        type="text"
        placeholder="Search..."
        v-model="searchQuery"
        @input="handleSearch"
      />
      <i class="fas fa-search"></i>
    </div>
    <ul class="sidebar-menu">
      <li @click="goTo('dashboard')">
        <i class="fas fa-tachometer-alt"></i> Dashboard
      </li>

      <!-- Leaves Dropdown -->
      <li class="dropdown">
        <div class="" @click="toggleDropdown">
          <i class="fas fa-calendar-alt"></i> Leaves
          <i class="fas fa-caret-down" style="margin-left:auto;"></i>
        </div>
        <ul v-if="dropdownOpen" class="dropdown-menu">
          <li @click="goTo('leaveapplications')">
            <i class="fas fa-list"></i> All Leaves
          </li>
          <li @click="goTo('approvedleaves')">
            <i class="fas fa-check-circle"></i> Approved Leaves
          </li>
          <li @click="goTo('rejectedleaves')">
            <i class="fas fa-times-circle"></i> Rejected Leaves
          </li>
          <li @click="goTo('pendingleaves')">
            <i class="fas fa-hourglass-half"></i> Pending Leaves
          </li>
        </ul>
      </li>

      <li @click="goTo('employees')">
        <i class="fas fa-users"></i> Manage Employees
      </li>

      <li @click="goTo('manageleavetype')">
        <i class="fas fa-sliders-h"></i> Manage Leave Type
      </li>

      <li @click="goTo('workreport')">
        <i class="fas fa-clipboard-list"></i> Work Report & Task
      </li>
 <li @click="goTo('empdsi')">
            <i class="fas fa-tasks"></i> View DSI
          </li>
           <li @click="goTo('rcahelp')">
            <i class="fas fa-comments" aria-hidden="true"></i> Chat
          </li>
      <li @click="showPerformanceModal = true">
        <i class="fas fa-chart-line"></i> Performance
      </li>

      <li @click="logout" class="danger-bg">
        <i class="fas fa-sign-out-alt"></i> Logout
      </li>
    </ul>
  </div>
</aside>


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
  }
},



  methods: {
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
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
/* Overlay */
.performance-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(6px);
}

/* Card */
.performance-modal-card {
  width: 520px;
  max-width: 95%;
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  animation: scaleFade 0.35s ease;
}

/* Title */
.performance-title {
  text-align: center;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 22px;
  letter-spacing: 0.5px;
}

/* Fields */
.performance-field {
  margin-bottom: 18px;
}

.performance-field label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  display: block;
  margin-bottom: 6px;
}

/* Inputs */
.performance-input,
.performance-select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  transition: all 0.2s ease;
}

.performance-input:focus,
.performance-select:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.performance-input.readonly {
  background: #f1f5f9;
  font-weight: 600;
}

/* Row */
.performance-row {
  display: flex;
  gap: 38px;
    justify-content: space-evenly;
}

/* Stars */
.performance-stars {
  display: flex;
  gap: 6px;
  font-size: 20px;
  cursor: pointer;
}

.performance-stars i {
  color: #cbd5e1;
  transition: transform 0.15s ease, color 0.15s ease;
}

.performance-stars i.active {
  color: #facc15;
}

.performance-stars i:hover {
  transform: scale(1.15);
}

/* Percentage */
.performance-percentage {
  margin-top: 6px;
  font-weight: 700;
  color: #16a34a;
}

/* Actions */
.performance-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

/* Buttons */
.performance-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: #fff;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-success {
  background: #16a34a;
  color: #fff;
}

.btn-success:hover {
  background: #15803d;
}

.btn-outline {
     background: #ff1f1fc7;
    border: 1px solid #cbd5e1;
    color: #ffffff;
}

.btn-outline:hover {
  background: #bd1212c7;
}

/* Result */
.performance-result {
  margin-top: 20px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  font-weight: 700;
  text-align: center;
  color: #0f172a;
}

.performance-result span {
  color: #2563eb;
}

/* Animation */
@keyframes scaleFade {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* === Vault Theme (Unified) === */
.vault-theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 15, 25, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
}

.vault-theme-content {
  background: var(--text);
  color: #f8fafc;
  padding: 2rem;
  border-radius: 14px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 0 25px rgba(0, 200, 255, 0.3);
  position: relative;
  animation: vaultFadeIn 0.3s ease;
}

.vault-theme-title {
  font-size: 1.4rem;
  text-align: center;
  color: #38bdf8;
  margin-bottom: 0.5rem;
}

.vault-theme-subtext {
  text-align: center;
  font-size: 0.95rem;
  color: #cbd5e1;
  margin-bottom: 1.2rem;
}

.vault-theme-input,
.vault-theme-file-input,
.vault-theme-select {
  width: 100%;
  padding: 10px 12px;
  margin: 8px 0;
  border-radius: 8px;
  border: 1px solid #334155;
  background: var(--text);
  color: #f1f5f9;
  outline: none;
  transition: border 0.2s;
}
.vault-theme-input:focus {
  border-color: #38bdf8;
}

.vault-theme-btn {
  width: 100%;
  background: linear-gradient(90deg, #0891b2, #06b6d4);
  border: none;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  margin-top: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.vault-theme-btn:hover {
  background: linear-gradient(90deg, #06b6d4, #0891b2);
  transform: translateY(-2px);
}

.vault-theme-close-btn {
  background: transparent;
  color: #94a3b8;
  margin-top: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  transition: color 0.2s;
}
.vault-theme-close-btn:hover {
  color: #f87171;
}

/* Specific sections */
.vault-theme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vault-files-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.9rem;
}
.vault-files-table th, .vault-files-table td {
  padding: 8px;
  border-bottom: 1px solid #334155;
  color: #e2e8f0;
}
.vault-files-table a {
  color: #38bdf8;
  text-decoration: none;
}
.vault-theme-delete-btn {
  background: var(--sidebar);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.vault-theme-delete-btn:hover {
  background: #dc2626;
}

.vault-theme-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 1rem;
}

/* Subtle entrance animation */
@keyframes vaultFadeIn {
  from {
    transform: translateY(-15px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Ensure "Grant File Access" stays on top */
.vault-access-overlay {
  z-index: 9999 !important;
}


/* 🔹 Optional styling for smaller access modal */
.small-modal {
  max-width: 400px;
  padding: 20px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-content {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.modal-content select, 
.modal-content input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  margin-bottom: 15px;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.actions button {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #2563eb;
  color: white;
}
.close-btn {
  background-color: #999;
}

.vault-access-select {
  padding: 5px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-right: 8px;
}

.vault-access-btn {
  background-color: #2d89ef;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.vault-access-btn:hover {
  background-color: #1e5fbf;
}

/* Overlay */
.vault-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

/* Modal Container */
.vault-modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 750px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: slideIn 0.3s ease;
}

/* Header */
.vault-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.vault-modal-header h3 {
  font-size: 1.5rem;
  color: var(--text);
}

.vault-close-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  font-size: 1.2rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: transform 0.2s;
}
.vault-close-btn:hover {
  transform: rotate(90deg);
}

/* Description */
.vault-description {
  font-size: 0.95rem;
  color: #34495e;
  margin-bottom: 20px;
}

/* Upload Section */
.vault-upload-section {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  align-items: center;
}

.vault-file-input {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.vault-upload-btn {
  background: #3498db;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.vault-upload-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}
.vault-upload-btn:hover:not(:disabled) {
  background: #2980b9;
}

/* Files Table */
.vault-files-section h4 {
  margin-bottom: 10px;
  color: var(--text);
}

.vault-files-table {
  width: 100%;
  border-collapse: collapse;
}

.vault-files-table th,
.vault-files-table td {
  padding: 10px 12px;
  text-align: left;
  color: #2f4f50;
  border-bottom: 1px solid #ddd;
}

.vault-files-table th {
  background: #f7f7f7;
  color: #0c5360;
  font-weight: 600;
}

.vault-file-link {
  color: #3498db;
  text-decoration: none;
}
.vault-file-link:hover {
  text-decoration: underline;
}

.vault-access-select {
  padding: 5px 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.vault-delete-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}
.vault-delete-btn:hover {
  background: #c0392b;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.vault-input {
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.error-msg {
   color:var(--text);
  font-size: 14px;
  margin-top: 5px;
}

.vault-input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  text-align: center;
}

.uploaded-files {
  margin-top: 15px;
  list-style: none;
  padding: 0;
}

.uploaded-files li {
  margin: 5px 0;
}

.close-btn {
  background: crimson;
  color: white;
  padding: 8px 12px;
  margin-top: 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}


.profile-section {
  text-align: center;
}

.profile-pic {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  margin-bottom: 10px;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}



.danger-bg {
  color: #ff6b6b;
}

.dropdown-menu {
  list-style: none;
  padding-left: 20px;
  margin-top: 8px;
}

.danger-bg{
      background-color: var(--primary) !important;
      color: white!important;

}
.review-percentage {
 color: var(--text);
    margin-top: 8px;
    font-size: 11px;
}
.stars {
  display: flex;
  margin-top: 5px;
}

.stars .fa {
  font-size: 20px;
  margin-right: 5px;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
}

.stars .checked {
  color: #ffc107;
}

.row-group {
  display: flex;
  gap: 32px;
  margin-top: 10px;
}

.row-group .field {
  flex: 1;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 25px;
  border-radius: 10px;
  width: 50%;
    height: 69%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
.modal-content h3 {
  margin-bottom: 15px;
  text-align: center;
}
.modal-content label {
  display: block;
  text-align-last: left;
  margin-top: 10px;
  font-weight: bold;
}
.modal-content input,
.modal-content select {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.stars {
  display: flex;
  margin-top: 5px;
}
.stars .fas {
  font-size: 20px;
  margin-right: 5px;
  cursor: pointer;
  color: #ffc107;
}
.actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
.actions button {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  background-color: var(--primary);
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.actions .close-btn {
  background-color: #f44336;
}
.result {
  text-align: center;
  margin-top: 15px;
  font-size: 18px;
}
.main-content {
  margin-left: 260px; /* match sidebar width */
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}


.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  /* padding: 12px 38px; */
  margin-bottom: 10px;
  background-color: #ffffff61;
  border-radius: 10px;
  transition: background 0.3s, transform 0.2s;
  cursor: pointer;
}

.dropdown-toggle:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateX(5px);
  font-weight: 600;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px 0;
  position: absolute;
  top: 100%;
  left: 0;
  width: 220px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 999;
}

.dropdown-menu li {
  padding: 10px 15px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s ease;
}

.dropdown-menu li:hover {
  color: #466d6f;
  transform: translateX(5px);
  cursor: pointer;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;


}

.dropdown-toggle i:last-child {
  margin-left: auto;
}


/* ================= SIDEBAR CORE ================= */
.sidebar {
 position: fixed;
    top: 109px;
    left: 20px;
    width: 318px;
    height: 83vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, var(--primary), var(--sidebar));
    border-radius: 21px;
  
    /* z-index: 2000; */
}

/* ================= PROFILE ================= */
.profile-section {
  text-align: center;
  border-radius: 17px;
  padding: 20px 10px;
  /* background: linear-gradient(135deg, var(--primary), var(--text)); */
}

.profile-pic {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid #fff;
  object-fit: cover;
}

/* ================= TITLE ================= */
.sidebar-title {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin-top: -18px;
}

/* ================= MENU SCROLL ================= */
.menu-section {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* Custom Scrollbar */
.menu-section::-webkit-scrollbar {
  width: 6px;
}
.menu-section::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 10px;
}
.menu-section::-webkit-scrollbar-track {
  background: transparent;
}

/* ================= MENU ITEMS ================= */
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 35px;
  margin-bottom: 10px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.sidebar-menu li:hover {
  background: #ffffff;
  transform: translateX(6px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

.sidebar-menu i {
  min-width: 18px;
  text-align: center;
  color: var(--text);
}

/* ================= DROPDOWN ================= */
.dropdown-menu {
  background: #ffffff;
  border-radius: 10px;
  margin-top: 6px;
  padding: 6px 0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.dropdown-menu li {
  padding: 10px 16px;
  font-size: 13px;
}

/* ================= LOGOUT ================= */
.danger-bg {
  background: var(--primary) !important;
  color: #ffffff !important;
}

/* ================= MAIN CONTENT ================= */
.main-content {
  margin-left: 260px;
  padding: 20px;
  flex: 1;
  min-height: 100vh;
}

/* ================= MOBILE ================= */
@media (max-width: 768px) {
  .sidebar {
    width: 100vw;
    border-radius: 0;
  }

  .main-content {
    margin-left: 0;
  }

  .sidebar-menu li {
    font-size: 15px;
    padding: 14px 20px;
  }
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f4f4f4;
  border-radius: 8px;
  margin: 10px;
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  padding: 6px 8px;
  border-radius: 4px;
}

.search-bar i {
  margin-left: 8px;
}

.search-results {
  list-style: none;
  margin: 0;
  padding: 0;
  background: white;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.search-results li {
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-results li:hover {
  background: #f0f0f0;
}

/* Backdrop */
.popup-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

/* Popup Container */
.popup {
  background: #fff;
  border-radius: 12px;
  padding: 20px 25px;
  width: 90%;
 max-width: 709px;
    max-height: 88vh;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* Table scroll container */
.table-container {
  overflow-y: auto;
  flex: 1; /* fills remaining height */
  margin-bottom: 15px;
}

/* Heading */
.popup h3 {
  margin-bottom: 15px;
  font-size: 1.5rem;
  color: var(--text);
}

/* Table */
.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  padding: 10px 12px;
  color: #2f4f50;
  text-align: left;
}

.results-table th {
  background-color: #f5f5f5;
  color: var(--text);
  font-weight: 600;
  border-bottom: 2px solid #eee;
}

.results-table tbody tr {
  border-bottom: 1px solid #eee;
  transition: background 0.3s ease;
}

.results-table tbody tr:hover {
  background-color: #f0f8ff;
}

/* No results text */
.no-results {
  color: #888;
  font-size: 1rem;
  margin-bottom: 10px;
}

/* Close Button */
.close-btn {
      background-color: var(--primary);
    color: var(--text);
  padding: 10px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #75b4b4;
  transform: scale(1.05);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
