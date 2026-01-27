<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
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
 <div class="search-bar desktop-only">
      <input
        type="text"
        placeholder="Search..."
        v-model="searchQuery"
        @input="handleSearch"
      />
      <i class="fas fa-search"></i>
    </div>
        <ul class="sidebar-menu">
          <li @click="goTo('employee/dashboard')">
            <i class="fas fa-tachometer-alt"></i> Dashboard
          </li>
 <li @click="goTo('employee/help')">
            <i class="fas fa-comments" aria-hidden="true"></i> Chat
          </li>
          <!-- Leave Dropdown -->
          <li class="dropdown-wrapper">
            <div @click="toggleLeaveDropdown">
              <i class="fas fa-calendar-alt"></i> Leave
              <i class="fas fa-caret-down"></i>
            </div>
            <ul v-if="leaveDropdownOpen" class="dropdown-menu">
              <li @click="goTo('employee/leaveapplicationsemp')">
                <i class="fas fa-list"></i> All Leaves
              </li>
              <li @click="goTo('employee/approvedleavesemp')">
                <i class="fas fa-check-circle"></i> Approved Leaves
              </li>
              <li @click="goTo('employee/rejectedleavesemp')">
                <i class="fas fa-times-circle"></i> Rejected Leaves
              </li>
              <li @click="goTo('employee/pendingleaves')">
                <i class="fas fa-hourglass-half"></i> Pending Leaves
              </li>
            </ul>
          </li>

          <li @click="goTo('employee/applyleave')">
            <i class="fas fa-plane-departure"></i> Apply for Leave
          </li>
          <li
  v-if="user.department && allowedVisitDepartments.includes(user.department.toLowerCase())"
  @click="goTo('employee/visitschedule')"
>
  <i class="fas fa-chart-bar"></i> Visit Schedule
</li>
 <li 
  class="desktop-only"
  @click="goTo('employee/visitschedule')"
>
  <i class="fas fa-chart-bar"></i> Visit Schedule
</li>

 <li 
  class="mobile-only"
  @click="goTo('employee/Customerregistrations')"
>
  <i class="fas fa-user-friends"></i> Customers & PO
</li>


          <li @click="goTo('employee/viewAnnouncement')">
            <i class="fas fa-bullhorn"></i> Announcement
          </li>
          
          <li @click="goTo('employee/viewkra')">
            <i class="fas fa-tasks"></i> View KRA
          </li>
           <li @click="goTo('employee/mydsi')">
            <i class="fas fa-tasks"></i> DSI
          </li>
          
          <li @click="goTo('employee/myprofile')">
            <i class="fa-solid fa-user"></i> My Profile
          </li>
          <li @click="showChangePassword = true">
            <i class="fas fa-key"></i> Change Password
          </li>
          <li @click="logout" class="danger-bg">
            <i class="fas fa-sign-out-alt"></i> Logout
          </li>
           <li class="theme-switcher">
      <label class="theme-label">🎨 Theme</label>

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
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");

.mobile-menu-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;
}

.mobile-menu-icon:hover {
  color: #ffdd57;
  transform: scale(1.2);
}
.mobile-menu-icon {
  font-size: 22px;
  cursor: pointer;
  color: var(--text);
}
.profile-pic-wrapper {
  position: relative;
  display: inline-block;
}

.profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #c3e0e5;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.profile-pic:hover {
  transform: scale(1.05);
}

/* Camera Icon Overlay */
.camera-icon {
 position: absolute;
    bottom: 10px;
    right: 4px;
    background-color: var(--primary);
    color: #ffffff;
    border-radius: 73%;
    padding: 4px;
    font-size: 12px;
    /* top: 61px; */
    background-position: center;
    width: 16px;
    border: 1px solid white;
    cursor: pointer;
}


.layout {
  display: flex;
  min-height: 100vh;
  flex-direction: row;
  
}

.sidebar {
 position: fixed;
    top: 124px;
    left: 13px;
    width: 318px;
    height: 79vh;
    display: flex;
    flex-direction: column;
    background: var(--sidebar);
    border-radius: 21px;
    color: var(--text);
    font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;
    /* z-index: 2000; */

}


.profile-section {
  text-align: center;
  padding: 12px 10px 15px;
  background-color: var(--primary)a6;
}

.profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffffff;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.profile-pic:hover {
  transform: scale(1.05);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}



.sidebar-menu i {
  min-width: 18px;
  text-align: center;
}

.dropdown-menu {
  position: relative;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 5px 0;
  margin: 5px 0 10px 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.dropdown-menu li {
  padding: 10px 15px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s, transform 0.2s ease;
}

.dropdown-menu li:hover {
  color: var(--text);
  transform: translateX(5px);
}

.danger-bg {
  background-color: var(--text) !important;
  color: white !important;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  padding: 20px;
  min-height: 100vh;
  overflow-y: auto;
}
@media (max-width: 768px) {
  .profile-section{
    /* margin-top: 22%!important; */
    background: linear-gradient(135deg, var(--primary), var(--primary)) !important;
  }
  .profile-pic{
    margin-top: 100%!important;
  }
  .sidebar {
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    border-radius: 0;
    position: fixed;
    /* z-index: 2000; */
  }

  .layout {
    flex-direction: column;
  }

  .main-content {
    margin-left: 0;
    display: none; /* hide content when sidebar is open */
  }
  .modal{
    width: 73%;
  }
}
.menu-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 18px 16px;
}

/* Stylish scrollbar */
.menu-scroll::-webkit-scrollbar {
  width: 6px;
}
.menu-scroll::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 10px;
}
.menu-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-menu li {
  /* display: flex; */
  align-items: center;
  gap: 12px;
  font-size: 14px;
  padding: 10px 18px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  transition: all 0.25s ease;
  cursor: pointer;
}

.sidebar-menu li:hover {
  background: #ffffff;
  transform: translateX(6px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
@media (max-width: 768px) {
  .sidebar {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .layout {
    flex-direction: column;
  }

  .main-content {
    margin-left: 0;
    display: none; /* hide content when sidebar open */
  }

  .sidebar-menu li {
    font-size: 15px;
    padding: 12px 20px;
  }
}
.profile-section {
      border-radius: 20px;
  text-align: center;
  padding: 18px 10px;
  background: var(--primary);
  color: #fff;
}

.sidebar-title {
  font-size: 17px;
  font-weight: 600;
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
/* Show by default (desktop) */
.desktop-only {
  display: list-item;
}

/* Hide on mobile */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}
/* Hide by default (desktop & laptop) */
.mobile-only {
  display: none;
}

/* Show only on mobile */
@media (max-width: 768px) {
  .mobile-only {
    display: list-item;
  }
}


.sidebar .theme-switcher {
  position: inherit;
  /* margin: 16px; */
  background: rgba(255, 255, 255, 0.85);
  border-radius: 14px;
  /* padding: 10px 12px; */
}
</style>
