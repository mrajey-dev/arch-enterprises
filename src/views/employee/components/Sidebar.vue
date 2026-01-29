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
        <!-- Profile Picture with Camera Icon -->
       <div class="profile-pic-wrapper">
  <label for="profileUpload" class="profile-upload-label">
 <img
  :key="profilePhoto"
  :src="profilePhoto"
  @error="profilePhoto = defaultPhoto"
  class="profile-pic"
/>



    <input
      type="file"
      id="profileUpload"
      accept="image/*"
      @change="onProfilePicChange"
      style="display: none"
    />
    <!-- Camera Icon -->
    <!-- <div class="camera-icon">
      <i class="fas fa-camera"></i>
    </div> -->
  </label>

</div>


        <h2 class="sidebar-title" v-if="username">{{ greetingMessage }}</h2>
      </div>

      <!-- Scrollable Menu Section -->
      <div class="menu-scroll">
        <!-- Universal Search -->
 <!-- <div class="search-bar desktop-only">
     <span> <input
        type="text"
        placeholder="Search..."
        v-model="searchQuery"
        @input="handleSearch"
      /></span>
      <i class="fas fa-search"></i>
    </div> -->
        <ul class="sidebar-menu">
          <li @click="goTo('employee/dashboard')">
            <i class="fas fa-tachometer-alt"></i> <span>Dashboard</span>
          </li>
 <li @click="goTo('employee/help')">
            <i class="fas fa-comments" aria-hidden="true"></i> <span>Chat</span>
          </li>
          <!-- Leave Dropdown -->
          <li class="dropdown-wrapper">
            <div @click="toggleLeaveDropdown">
              <i class="fas fa-calendar-alt"></i><span> Leave</span>
              <i class="fas fa-caret-down"></i>
            </div>
            <ul v-if="leaveDropdownOpen" class="dropdown-menu">
              <li @click="goTo('employee/leaveapplicationsemp')">
                <i class="fas fa-list"></i> <span>All Leaves</span>
              </li>
              <li @click="goTo('employee/approvedleavesemp')">
                <i class="fas fa-check-circle"></i> <span>Approved Leaves</span>
              </li>
              <li @click="goTo('employee/rejectedleavesemp')">
                <i class="fas fa-times-circle"></i> <span>Rejected Leaves</span>
              </li>
              <li @click="goTo('employee/pendingleaves')">
                <i class="fas fa-hourglass-half"></i><span> Pending Leaves</span>
              </li>
            </ul>
          </li>

          <li @click="goTo('employee/applyleave')">
            <i class="fas fa-plane-departure"></i><span> Apply for Leave </span>
          </li>
          <li
  v-if="user.department && allowedVisitDepartments.includes(user.department.toLowerCase())"
  @click="goTo('employee/visitschedule')"
>
  <i class="fas fa-chart-bar"></i> <span>Visit Schedule</span>
</li>
 <li 
  class="desktop-only"
  @click="goTo('employee/visitschedule')"
>
  <i class="fas fa-chart-bar"></i> <span>Visit Schedule</span>
</li>

 <li 
  class="mobile-only"
  @click="goTo('employee/Customerregistrations')"
>
  <i class="fas fa-user-friends"></i><span> Customers & PO</span>
</li>


          <li @click="goTo('employee/viewAnnouncement')">
            <i class="fas fa-bullhorn"></i><span> Announcement</span>
          </li>
          <li @click="goTo('employee/request')">
            <i class="fa fa-check-square-o"></i><span> Request Desk</span>
          </li>
           <li @click="goTo('employee/resourcebooking')">
            <i class="fa fa-check-square-o"></i><span> Resource Booking</span>
          </li>
          
          <li @click="goTo('employee/viewkra')">
            <i class="fas fa-tasks"></i> <span>View KRA</span>
          </li>
           <li @click="goTo('employee/mydsi')">
            <i class="fas fa-tasks"></i><span> DSI</span>
          </li>
          
          <li @click="goTo('employee/myprofile')">
            <i class="fa-solid fa-user"></i><span> My Profile</span>
          </li>
          <li @click="showChangePassword = true">
            <i class="fas fa-key"></i> <span>Change Password</span>
          </li>
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
<!-- MOBILE OVERLAY -->
<div
  v-if="isMobileOpen"
  class="mobile-overlay"
  @click="isMobileOpen = false"
></div>
    <!-- Main Content -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <ChangePasswordForm
      v-if="showChangePassword"
      @close="showChangePassword = false"
    />
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
import axios from "axios";
import ChangePasswordForm from "./ChangePasswordForm.vue";

export default {
  components: { ChangePasswordForm },
  data() {
    return {
       isMobileOpen: false,
       isCollapsed: false,
       currentTheme: localStorage.getItem("theme") || "default",
      searchQuery: "",
      results: [],
      showPopup: false,
        allowedVisitDepartments: ['Management', 'Service'],
      username: "",
      user: {},
      leaveDropdownOpen: false,
      showChangePassword: false,
      defaultPhoto: "https://cdn-icons-png.flaticon.com/512/219/219983.png",
    profilePhoto: "https://cdn-icons-png.flaticon.com/512/219/219983.png",
    };
  },
  computed: {
    greetingMessage() {
      if (!this.username) return "";
      const hour = new Date().getHours();
      let greeting = "";
      if (hour >= 5 && hour < 12) greeting = "Good Morning";
      else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
      else if (hour >= 17 && hour < 21) greeting = "Good Evening";
      else greeting = "Good Night";

      const firstName = this.username.split(" ")[0];
      const formattedName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

      return `${greeting}, ${formattedName}`;
    },
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
    toggleLeaveDropdown() {
      this.leaveDropdownOpen = !this.leaveDropdownOpen;
    },
  goTo(route) {
  this.$router.push(`/${route}`);

  if (window.innerWidth <= 768) {
    this.isMobileOpen = false;
  }
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
          // ✅ Keep stored profile photo
          this.$router.push("/auth");
        });
    },

    async onProfilePicChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Please choose an image smaller than ${maxSizeMB} MB.`);
        return;
      }

      // preview before upload
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhoto = e.target.result;
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("photo", file);

      const token = localStorage.getItem("token");

      try {
        const response = await axios.post(
          "https://employees.archenterprises.co.in/api/api/upload-profile-photo",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

if (response.data && response.data.photo_url) {
  const freshUrl =
    response.data.photo_url + "?v=" + Date.now();

  this.$nextTick(() => {
    this.profilePhoto = freshUrl;
  });

  if (this.user?.id) {
    localStorage.setItem(`profilePhoto_${this.user.id}`, freshUrl);
  }
}


      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload image. Please try again.");
      }
    },
  },

async mounted() {
  
  const token = localStorage.getItem("token");
  if (!token) {
    this.$router.push("/auth");
    return;
  }

  // Load user from localStorage
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      this.user = JSON.parse(storedUser);
      this.username = this.user.name || "Unknown";
    } catch {
      this.username = "Unknown";
    }
       document.documentElement.setAttribute(
      "data-theme",
      this.currentTheme
    )
  }

  try {
    const response = await axios.get(
      "https://employees.archenterprises.co.in/api/api/user-profile",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("USER PROFILE RESPONSE:", response.data);

    if (response.data?.data) {
  const user = response.data.data;

      this.user = user;
      this.username = user.name || this.username;

      if (typeof user.profile_photo === "string" && user.profile_photo.includes("/")) {
  const imageUrl =
    `https://employees.archenterprises.co.in/backend/public/storage/${user.profile_photo}`;

  this.profilePhoto = imageUrl + "?v=" + Date.now();

  // store against ACTUAL user id
  localStorage.setItem(
    `profilePhoto_${user.id}`,
    this.profilePhoto
  );
} else {
  this.profilePhoto = this.defaultPhoto;
}

    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
  }
}


};
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
  flex-direction: column;

  /* 👇 STICKY SIDEBAR */
  position: sticky;
  top: 0;
  height: 81vh;

  transition: width 0.35s ease;
  box-shadow: 4px 0 12px rgba(0,0,0,0.15);
  z-index: 100;
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
</style>
