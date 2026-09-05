<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Profile / Header Section -->
      <div class="profile-section">
        <div class="profile-pic-wrapper">
          <img
            :src="profileImage"
            alt="Profile Picture"
            class="profile-pic"
          />
          <span class="online-indicator"></span>
        </div>
        <div class="profile-meta">
          <h2 class="sidebar-title"></h2>
          <span class="role-badge">HR & Administration</span>
        </div>
      </div>

      <div class="menu-scroll">
        <ul class="sidebar-menu">

          <!-- ─── 1. OVERVIEW & CONNECT ─── -->
          <li class="menu-section-header">
            <span>OVERVIEW</span>
          </li>

          <li @click="goTo('dashboard')" :class="{ 'active-item': isActive('dashboard') }">
            <i class="fas fa-chart-pie"></i> <span>Dashboard</span>
          </li>
          
          <li @click="goTo('archcalendar')" :class="{ 'active-item': isActive('archcalendar') }">
            <i class="fas fa-calendar-alt"></i> <span>Company Calendar</span>
          </li>
          
          <li @click="goTo('rcahelp')" :class="{ 'active-item': isActive('rcahelp') }">
            <i class="fas fa-comments" aria-hidden="true"></i> <span>Team Chat</span>
          </li>
          
          <li @click="goTo('ScheduleMeeting')" :class="{ 'active-item': isActive('ScheduleMeeting') }">
            <i class="fas fa-video"></i> <span>Schedule Meeting</span>
          </li>

          <!-- ─── 2. PEOPLE & TALENT ─── -->
          <li class="menu-section-header">
            <span>PEOPLE & TALENT</span>
          </li>

          <li @click="goTo('employees')" :class="{ 'active-item': isActive('employees') }">
            <i class="fas fa-users"></i> <span>Employees Master</span>
          </li>

          <li @click="goTo('managedepartments')" :class="{ 'active-item': isActive('managedepartments') }">
            <i class="fas fa-sitemap"></i> <span>Departments</span>
          </li>

          <li @click="goTo('recruitmentsection')" :class="{ 'active-item': isActive('recruitmentsection') }">
            <i class="fas fa-user-plus"></i> <span>Recruitment</span>
          </li>

          <!-- Letters Hub Dropdown -->
          <li class="dropdown-wrapper" :class="{ 'dropdown-active': lettersDropdownOpen }">
            <div @click="toggleLettersDropdown" class="dropdown-toggle">
              <i class="fas fa-file-signature"></i> <span>Letters & Onboarding</span>
              <i class="fas fa-chevron-down caret-icon" :class="{ 'rotate': lettersDropdownOpen }"></i>
            </div>
      
            <ul v-if="lettersDropdownOpen" class="dropdown-menu">
              <li @click="goTo('offerletter')" :class="{ 'active-sub-item': isActive('offerletter') }">
                <i class="fas fa-envelope-open-text"></i> <span>Create Offer Letter</span>
              </li>
              <li @click="goTo('OfferLetterList')" :class="{ 'active-sub-item': isActive('OfferLetterList') }">
                <i class="fas fa-list-alt"></i> <span>Offer Letters List</span>
              </li>
            </ul>
          </li>

          <li @click="goTo('empattendanceadmin')" :class="{ 'active-item': isActive('empattendanceadmin') }">
            <i class="fas fa-user-clock"></i> <span>Attendance Master</span>
          </li>

          <li @click="goTo('holidays')" :class="{ 'active-item': isActive('holidays') }">
            <i class="fas fa-umbrella-beach"></i> <span>Holidays Calendar</span>
          </li>

          <!-- ─── 3. LEAVE MANAGEMENT ─── -->
          <li class="menu-section-header">
            <span>LEAVE MANAGEMENT</span>
          </li>

          <li class="dropdown-wrapper" :class="{ 'dropdown-active': dropdownOpen }">
            <div @click="toggleDropdown" class="dropdown-toggle">
              <i class="fas fa-calendar-check"></i> <span>Leaves Center</span>
              <span v-if="notifCounts.leaves > 0" class="sidebar-item-badge warning">{{ notifCounts.leaves }}</span>
              <i class="fas fa-chevron-down caret-icon" :class="{ 'rotate': dropdownOpen }"></i>
            </div>
      
            <ul v-if="dropdownOpen" class="dropdown-menu">
              <li @click="goTo('leaveapplications')" :class="{ 'active-sub-item': isActive('leaveapplications') }">
                <i class="fas fa-list-ul"></i> <span>All Leaves</span>
              </li>
              <li @click="goTo('pendingleaves')" :class="{ 'active-sub-item': isActive('pendingleaves') }">
                <i class="fas fa-hourglass-half"></i> <span>Pending Approvals</span>
                <span v-if="notifCounts.leaves > 0" class="sidebar-item-badge warning sub">{{ notifCounts.leaves }}</span>
              </li>
              <li @click="goTo('approvedleaves')" :class="{ 'active-sub-item': isActive('approvedleaves') }">
                <i class="fas fa-check-circle"></i> <span>Approved Leaves</span>
              </li>
              <li @click="goTo('rejectedleaves')" :class="{ 'active-sub-item': isActive('rejectedleaves') }">
                <i class="fas fa-times-circle"></i> <span>Rejected Leaves</span>
              </li>
              <li @click="goTo('manageleavetype')" :class="{ 'active-sub-item': isActive('manageleavetype') }">
                <i class="fas fa-sliders-h"></i> <span>Leave Types Config</span>
              </li>
            </ul>
          </li>

          <!-- ─── 4. PAYROLL & FINANCE ─── -->
          <li class="menu-section-header">
            <span>PAYROLL & FINANCE</span>
          </li>

          <li @click="goTo('salaryslip')" :class="{ 'active-item': isActive('salaryslip') }">
            <i class="fas fa-money-check-alt"></i> <span>Salary Slips</span>
          </li>

          <li @click="goTo('salaryadvances')" :class="{ 'active-item': isActive('salaryadvances') }">
            <i class="fas fa-hand-holding-usd"></i> <span>Salary Advances</span>
          </li>

          <li @click="goTo('ExpenseManage')" :class="{ 'active-item': isActive('ExpenseManage') }">
            <i class="fas fa-file-invoice-dollar"></i> <span>IT & Office Expenses</span>
          </li>

          <!-- ─── 5. WORKFLOW & OPERATIONS ─── -->
          <li class="menu-section-header">
            <span>OPERATIONS</span>
          </li>

          <li @click="goTo('workflow')" :class="{ 'active-item': isActive('workflow') }">
            <i class="fas fa-project-diagram"></i> <span>Work Flow</span>
          </li>

          <li @click="goTo('workreport')" :class="{ 'active-item': isActive('workreport') }">
            <i class="fas fa-file-signature"></i> <span>Daily Work Reports</span>
          </li>

          <li @click="goTo('requestdesk')" :class="{ 'active-item': isActive('requestdesk') }">
            <i class="fas fa-headset"></i> <span>Request Desk</span>
            <span v-if="notifCounts.request_desk > 0" class="sidebar-item-badge success">{{ notifCounts.request_desk }}</span>
          </li>

          <li @click="goTo('resourcebooking')" :class="{ 'active-item': isActive('resourcebooking') }">
            <i class="fas fa-laptop-house"></i> <span>Book a Resource</span>
          </li>

          <li @click="goTo('empdsi')" :class="{ 'active-item': isActive('empdsi') }">
            <i class="fas fa-tasks"></i> <span>View DSI</span>
            <span v-if="notifCounts.dsi > 0" class="sidebar-item-badge info">{{ notifCounts.dsi }}</span>
          </li>
           
          <li @click="goTo('performance')" :class="{ 'active-item': isActive('performance') }">
            <i class="fas fa-chart-line"></i> <span>Quarterly Performance</span>
          </li>

          <li @click="goTo('myapps')" :class="{ 'active-item': isActive('myapps') }">
            <i class="fas fa-th-large"></i> <span>Company Apps</span>
          </li>

          <!-- ─── 6. SESSION ─── -->
          <li @click="logout" class="danger-bg">
            <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
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
    <main class="main-content" :style="{ marginLeft: isCollapsed ? '80px' : '260px' }">
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
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

// Module-level cache to keep memory state across component remounts during route changes
let cachedAdmin = {
  name: localStorage.getItem("admin_name") || "",
  email: localStorage.getItem("admin_email") || "",
  photo: localStorage.getItem("admin_photo") || ""
};

export default {
  data() {
    return {
      isMobileOpen: false,
      isCollapsed: false,
      currentTheme: localStorage.getItem("theme") || "default",
      adminEmail: cachedAdmin.email || localStorage.getItem("admin_email") || "",
      adminName: cachedAdmin.name || localStorage.getItem("admin_name") || "",
      adminPhoto: cachedAdmin.photo || localStorage.getItem("admin_photo") || "",
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
      dropdownOpen: false,
      lettersDropdownOpen: false,
      themeOptions: [
        { value: "default", label: "Emerald Mint (Default)", color: "#2cb67d" },
        { value: "blue", label: "Ocean Blue", color: "#3b82f6" },
        { value: "teal", label: "Aqua Teal", color: "#14b8a6" },
        { value: "orange", label: "Sunset Orange", color: "#f97316" },
        { value: "red", label: "Coral Red", color: "#ef4444" },
        { value: "purple", label: "Lavender Purple", color: "#8b5cf6" }
      ],
      showPerformanceModal: false,
      users: [],
      selectedEmployee: '',
      attendance: '',
      targetAchieved: '',
      targetTotal: '',
      reviewStars: 0,
      performanceScore: null,
      performanceScoreDisplay: '',
      loading: false,
      notifCounts: {
        leaves: 0,
        request_desk: 0,
        dsi: 0,
        chat: 0,
        resource_bookings: 0
      }
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
      if (this.adminPhoto) {
        return this.adminPhoto;
      }
      const name = (this.adminName || "").trim().toLowerCase();

      if (name === "hr" || name === "admin" || !name) {
        return "https://i.pinimg.com/736x/03/82/e8/0382e829a8b19c46cabfe9abf8c80d8b.jpg";
      }

      return "https://i.pinimg.com/736x/03/82/e8/0382e829a8b19c46cabfe9abf8c80d8b.jpg";
    }
  },

  methods: {
    goTo(route) {
      if (!route) return;
      const targetPath = route.startsWith('/') ? route : `/${route}`;
      this.$router.push(targetPath).catch(() => {});
      if (window.innerWidth <= 768) {
        this.isMobileOpen = false;
      }
    },
    isActive(route) {
      if (!route) return false;
      const currentPath = (this.$route.path || '').toLowerCase();
      const cleanRoute = route.toLowerCase().replace(/^\//, '');
      const currentClean = currentPath.replace(/^\//, '');
      return currentClean === cleanRoute || currentClean.startsWith(cleanRoute + '/');
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    toggleLettersDropdown() {
      this.lettersDropdownOpen = !this.lettersDropdownOpen;
    },
    logout() {
      const token = localStorage.getItem("token");
      axios
        .post(
          "https://employees.archenterprises.co.in/api/api/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .finally(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("admin_name");
          localStorage.removeItem("admin_email");
          localStorage.removeItem("admin_photo");
          cachedAdmin = { name: "", email: "", photo: "" };
          this.$router.push("/auth");
        });
    },
    handleMouseEnter() {
      if (window.innerWidth > 768) {
        this.isCollapsed = false;
      }
    },
    handleMouseLeave() {
      if (window.innerWidth > 768) {
        this.isCollapsed = false;
      }
    },

    toggleSidebar() {
      if (window.innerWidth <= 768) {
        this.isMobileOpen = !this.isMobileOpen;
      }
    },
    
    changeTheme(themeOrEvent) {
      const theme = typeof themeOrEvent === 'string' ? themeOrEvent : themeOrEvent?.target?.value || 'default';
      this.currentTheme = theme;

      document.documentElement.classList.add("theme-transition");
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);

      setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
      }, 400);
    },

    async fetchAdmin() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(
          "https://employees.archenterprises.co.in/api/api/admin-info",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data) {
          if (res.data.name && res.data.name !== this.adminName) {
            this.adminName = res.data.name;
            localStorage.setItem("admin_name", res.data.name);
            cachedAdmin.name = res.data.name;
          }
          if (res.data.email && res.data.email !== this.adminEmail) {
            this.adminEmail = res.data.email;
            localStorage.setItem("admin_email", res.data.email);
            cachedAdmin.email = res.data.email;
          }
          if (res.data.profile_photo) {
            const photoUrl = res.data.profile_photo.startsWith('http')
              ? res.data.profile_photo
              : `https://employees.archenterprises.co.in/backend/public/storage/${res.data.profile_photo}`;
            if (this.adminPhoto !== photoUrl) {
              this.adminPhoto = photoUrl;
              localStorage.setItem("admin_photo", photoUrl);
              cachedAdmin.photo = photoUrl;
            }
          }
        }

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

    async submitAccessChange() {
      if (!this.selectedUserForAccess || !this.selectedAccessType) {
        toastWarning("please select both user and access type!");
        return;
      }

      this.accessLoading = true;

      try {
        const selectedUser = this.users.find(
          (u) => u.id === this.selectedUserForAccess
        );
        const fileId = this.selectedFileForAccess?.id;

        await axios.post("/api/vault/grant-access", {
          file_id: fileId,
          user_id: this.selectedUserForAccess,
          access_type: this.selectedAccessType,
        });

        await axios.put(`/api/vault/update-uploaded-by/${fileId}`, {
          uploaded_by: selectedUser?.name || "Unknown User",
        });

        toastSuccess(
          `✅ Access granted to ${selectedUser.name} for file "${this.selectedFileForAccess.filename}"`
        );

        this.closeAccessModal();
      } catch (error) {
        console.error("Error saving access:", error);
        toastSuccess("❌ Failed to update access or uploaded_by field.");
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
          toastSuccess("File deleted successfully!");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        toastError("Failed to delete file. Please try again.");
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
          toastSuccess(`Access for ${file.filename} updated to ${file.access}`);
        } else {
          toastSuccess(response.data.message);
        }
      } catch (error) {
        console.error("Access update failed:", error);
        toastError("Failed to update file access.");
      }
    },

    async verifyVaultOtp() {
      if (!this.vaultOtp) {
        toastWarning("please enter the OTP.");
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

          toastSuccess("✅ OTP verified successfully!");
          this.showVaultOtp = false;
          this.showVaultModal = true;
        } else {
          toastSuccess(response.data.message || "Invalid OTP. Please try again.");
        }
      } catch (error) {
        console.error("OTP verification error:", error);
        toastSuccess(error.response?.data?.message || "OTP verification failed.");
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
        toastWarning("please enter both email and password.");
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
          toastSuccess("✅ OTP sent to your email. Please verify.");
          this.showVaultLogin = false;
          this.showVaultOtp = true;
        } else {
          toastSuccess(response.data.message || "Login failed.");
        }
      } catch (error) {
        console.error("Login error:", error);
        toastSuccess(error.response?.data?.message || "Login failed. Please try again.");
      } finally {
        this.loadingVaultLogin = false;
      }
    },

    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },

    async uploadFile() {
      if (!this.selectedFile) {
        toastWarning("please select a file first!");
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
          const uploadedFile = response.data.file;
          uploadedFile.access = "read";
          this.vaultFiles.push(uploadedFile);
          toastSuccess("File uploaded successfully!");
          this.selectedFile = null;
        }
      } catch (error) {
        console.error("Upload failed:", error);
        toastSuccess("File upload failed. Please try again.");
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

        toastSuccess('Performance review saved and attendance updated!');
        this.showPerformanceModal = false;
        this.resetFields();
      } catch (error) {
        if (error.response && error.response.status === 422) {
          console.error('Validation failed:', error.response.data);
          toastSuccess('Validation failed: ' + JSON.stringify(error.response.data.errors, null, 2));
        } else {
          toastSuccess('Performance review saved and attendance updated!');
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
      this.dropdownOpen = !this.dropdownOpen;
    },

    toggleLettersDropdown() {
      this.lettersDropdownOpen = !this.lettersDropdownOpen;
    },

    isActive(route) {
      const current = (this.$route.path || '').toLowerCase();
      const target = ('/' + route).toLowerCase();
      return current === target || current === target + '/' || (target !== '/' && current.startsWith(target + '/'));
    },
    
    goTo(route) {
      if (this.isMobileOpen) {
        this.isMobileOpen = false;
      }
      this.$router.push(`/${route}`);
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
        console.log("User response:", res.data);
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
          const attendancePercent = attendanceValue;
          const reviewPercent = (reviewValue / 10) * 100;

          const finalScore = ((attendancePercent * 2) + (reviewPercent * 0.5)).toFixed(2);
          this.performanceScore = parseFloat(finalScore);
          this.performanceScoreDisplay = finalScore + '%';
          this.loading = false;
          return;
        }

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
    },

    async fetchNotifCounts() {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const endpoints = [
        '/admin/notifications/summary',
        '/api/admin/notifications/summary',
        'https://employees.archenterprises.co.in/api/admin/notifications/summary'
      ];
      for (const ep of endpoints) {
        try {
          const res = await axios.get(ep, { headers });
          if (res && res.data && res.data.counts) {
            this.notifCounts = res.data.counts;
            break;
          }
        } catch (e) {
          // try next
        }
      }
    }
  },
  
  mounted() {
    document.documentElement.setAttribute(
      "data-theme",
      this.currentTheme
    );
    this.fetchAdmin();
    this.fetchNotifCounts();
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
  background: var(--bg-app, #edf7f2);
  border-radius: 16px;
}

/* Sidebar Container */
.sidebar { 
  width: 270px;
  color: #113329;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  position: fixed;
  top: 92px;
  height: calc(100vh - 110px);
  background: #ffffff;
  border: 1px solid #dff0e7;
  box-shadow: 0 10px 35px -5px rgba(44, 182, 125, 0.08), 0 0 1px 1px rgba(44, 182, 125, 0.04);
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
  z-index: 100;
  overflow: hidden;
}

/* Collapsed Sidebar */
.sidebar.collapsed {
  width: 84px;
}

/* Profile / Header Section */
.profile-section {
  padding: 18px 16px 14px;
  text-align: center;
  background: linear-gradient(180deg, #edf8f3 0%, #ffffff 100%);
  border-bottom: 1px solid #e5f2eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.profile-pic-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  margin-bottom: 8px;
}

.profile-pic {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2.5px solid #2cb67d;
  box-shadow: 0 4px 14px rgba(44, 182, 125, 0.25);
  cursor: pointer;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.profile-pic:hover {
  transform: scale(1.05);
  border-color: #209961;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #10b981;
  border: 2.5px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.4);
}

.profile-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
}

.sidebar-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #0f2e22;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
}

.role-badge {
  font-size: 11px;
  font-weight: 600;
  color: #1b9961;
  background: #eaf7f1;
  border: 1px solid #cbe9dc;
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.2px;
  display: inline-block;
}

.sidebar.collapsed .profile-meta {
  display: none;
}

/* Scrollable Menu */
.menu-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px 24px;
  scrollbar-width: thin;
  scrollbar-color: rgba(44, 182, 125, 0.25) transparent;
}

.menu-scroll::-webkit-scrollbar {
  width: 5px;
}

.menu-scroll::-webkit-scrollbar-thumb {
  background: rgba(44, 182, 125, 0.25);
  border-radius: 10px;
}

.menu-scroll::-webkit-scrollbar-thumb:hover {
  background: #2cb67d;
}

/* Sidebar Menu */
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* Category Section Header */
.menu-section-header {
  padding: 14px 14px 6px;
  display: flex;
  align-items: center;
  font-size: 10.5px;
  font-weight: 800;
  color: #7d9e92;
  letter-spacing: 0.9px;
  user-select: none;
  text-transform: uppercase;
}

.sidebar.collapsed .menu-section-header {
  display: none;
}

/* Regular Menu Items */
.sidebar-menu li:not(.menu-section-header) {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  font-weight: 500;
  color: #3b574e;
  cursor: pointer;
  border-radius: 12px;
  margin: 1px 4px;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.sidebar-menu li i {
  min-width: 20px;
  text-align: center;
  font-size: 15px;
  color: #2cb67d;
  transition: color 0.2s ease, transform 0.2s ease;
}

/* Hover State */
.sidebar-menu li:not(.menu-section-header):hover {
  background: #eef8f3;
  color: #113329;
}

.sidebar-menu li:not(.menu-section-header):hover i {
  color: #209961;
  transform: scale(1.1);
}

/* Active Navigation Item */
.sidebar-menu li.active-item {
  background: linear-gradient(135deg, #34b782 0%, #22a96f 100%) !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 5px 16px rgba(44, 182, 125, 0.35);
}

.sidebar-menu li.active-item i {
  color: #ffffff !important;
}

.sidebar-menu li.active-item::before {
  display: none;
}

/* Dropdown Menu Item */
.dropdown-wrapper {
  flex-direction: column !important;
  align-items: stretch !important;
  padding: 0 !important;
  background: transparent !important;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.dropdown-wrapper:hover .dropdown-toggle {
  background: #eef8f3;
}

.dropdown-active > .dropdown-toggle {
  background: #f2faf6;
  color: #0f2e22;
  font-weight: 600;
}

.caret-icon {
  margin-left: auto;
  font-size: 11px !important;
  color: #7d9e92 !important;
  transition: transform 0.25s ease !important;
}

.caret-icon.rotate {
  transform: rotate(180deg);
  color: #209961 !important;
}

/* Sub-items list */
.dropdown-menu {
  list-style: none;
  padding: 4px 0 6px 14px;
  margin: 2px 0 4px 10px;
  border-left: 2px solid #cbe8db;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-menu li {
  font-size: 12.8px !important;
  padding: 8px 12px !important;
  border-radius: 8px !important;
  color: #55756a !important;
  margin: 0 !important;
}

.dropdown-menu li:hover {
  background: #eef8f3 !important;
  color: #0f2e22 !important;
}

.dropdown-menu li.active-sub-item {
  background: #e2f6ec !important;
  color: #16935b !important;
  font-weight: 600;
}

.dropdown-menu li i {
  font-size: 13px !important;
  color: #2cb67d;
}

.dropdown-menu li.active-sub-item i {
  color: #16935b !important;
}

/* Danger / Logout Button */
.danger-bg {
  margin-top: 8px !important;
  color: #ef4444 !important;
  background: #fef2f2 !important;
  border: 1px solid #fee2e2;
}

.danger-bg i {
  color: #ef4444 !important;
}

.danger-bg:hover {
  background: #fee2e2 !important;
  color: #dc2626 !important;
}

/* Theme Selector Swatches */
.theme-selector-item {
  flex-direction: column !important;
  align-items: flex-start !important;
  padding: 10px 14px !important;
  background: #f4faf6 !important;
  border: 1px solid #e1f0e8;
  border-radius: 12px !important;
  margin: 4px 4px !important;
  cursor: default !important;
}

.theme-selector-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6b8f81;
  margin-bottom: 8px;
}

.theme-options {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
}

.theme-option {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.theme-option:hover {
  transform: scale(1.18);
}

.theme-option.active {
  box-shadow: 0 0 0 2px #2cb67d, 0 2px 6px rgba(44, 182, 125, 0.35);
  transform: scale(1.1);
}

.theme-check {
  color: #ffffff;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Badges */
.sidebar-item-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1.5px 7px;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
  line-height: 1.4;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);
}

.sidebar-item-badge.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.35);
}

.sidebar-item-badge.success {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.35);
}

.sidebar-item-badge.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.35);
}

.sidebar-item-badge.sub {
  font-size: 0.62rem;
  padding: 0 5px;
}

/* Collapsed mode adjustments */
.sidebar.collapsed .sidebar-menu li span,
.sidebar.collapsed .caret-icon,
.sidebar.collapsed .theme-selector-item,
.sidebar.collapsed .dropdown-menu {
  display: none !important;
}

.sidebar.collapsed .sidebar-menu li {
  justify-content: center;
  padding: 12px 0;
}

.sidebar.collapsed .dropdown-toggle {
  justify-content: center;
  padding: 12px 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    height: 100vh;
    width: 280px;
    z-index: 1001;
    border-radius: 0 20px 20px 0;
    transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .sidebar.collapsed {
    width: 280px;
  }

  .sidebar-menu li span,
  .caret-icon,
  .menu-section-header,
  .profile-meta {
    display: inline !important;
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(4px);
    z-index: 1000;
  }

  .layout {
    flex-direction: column;
  }

  .main-content {
    margin-left: 0 !important;
  }
}
</style>