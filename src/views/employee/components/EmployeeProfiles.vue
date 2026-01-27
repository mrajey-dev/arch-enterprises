<template>
  <div
    class="employee-profiles-tab"
    :class="{ hidden: !isVisible }"
  >
    <!-- Toggle Arrow -->
    <div class="toggle-btn" @click="toggleTab">
      <i
        class="fas"
        :class="isVisible ? 'fa-chevron-right' : 'fa-chevron-left'"
      ></i>
    </div>

    <div
      class="profile-card"
      @mouseenter="pauseAutoScroll"
      @mouseleave="resumeAutoScroll"
    >
      <img
        :src="profileImage(currentUser.finalPhoto)"
        class="profile-img"
        @error="onImgError"
      />
      <h4>{{ firstName(currentUser.name) }}</h4>
      <p class="dept">{{ currentUser.department }}</p>

      <div class="social-icons">
        <a
          :href="isValidLink(currentUser.instagram) ? currentUser.instagram : null"
          :class="['icon', 'instagram', { disabled: !isValidLink(currentUser.instagram) }]"
          target="_blank"
        >
          <i class="fab fa-instagram"></i>
        </a>

        <a
          :href="isValidLink(currentUser.linkedin) ? currentUser.linkedin : null"
          :class="['icon', 'linkedin', { disabled: !isValidLink(currentUser.linkedin) }]"
          target="_blank"
        >
          <i class="fab fa-linkedin"></i>
        </a>

        <a
          :href="isValidLink(currentUser.youtube) ? currentUser.youtube : null"
          :class="['icon', 'youtube', { disabled: !isValidLink(currentUser.youtube) }]"
          target="_blank"
        >
          <i class="fab fa-youtube"></i>
        </a>

        <a
          :href="isValidLink(currentUser.portfolio) ? currentUser.portfolio : null"
          :class="['icon', 'portfolio', { disabled: !isValidLink(currentUser.portfolio) }]"
          target="_blank"
        >
          <i class="fas fa-globe"></i>
        </a>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "EmployeeProfilesTab",
  data() {
    return {
          isVisible: false, // 👈 NEW
      users: [],
      currentIndex: 0,
      intervalId: null,
      isPaused: false,
    };
  },
  computed: {
    currentUser() {
      return this.users[this.currentIndex] || {};
    }
  },
  methods: {
     toggleTab() {
    this.isVisible = !this.isVisible;
  },
    firstName(name) {
      return name ? name.split(" ")[0] : "";
    },
    isValidLink(value) {
      return value && typeof value === "string" && value.trim() !== "" && value.trim().toLowerCase() !== "null";
    },
    profileImage(photo) {
      return photo ? photo : "https://cdn-icons-png.flaticon.com/512/219/219983.png";
    },
    onImgError(e) {
      e.target.src = "https://cdn-icons-png.flaticon.com/512/219/219983.png";
    },
    async fetchUsers() {
      const res = await axios.get(
        "https://employees.archenterprises.co.in/api/api/users",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      this.users = res.data
        .map(user => {
          const storedPhoto = localStorage.getItem(`profilePhoto_${user.id}`);
          return {
            ...user,
            finalPhoto: storedPhoto
              ? storedPhoto
              : user.profile_photo
              ? `https://employees.archenterprises.co.in/${user.profile_photo}?v=${Date.now()}`
              : null
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      this.startAutoScroll();
    },
    startAutoScroll() {
      this.intervalId = setInterval(() => {
        if (!this.isPaused && this.users.length > 0) {
          this.currentIndex = (this.currentIndex + 1) % this.users.length;
        }
      }, 2000); // 2 seconds
    },
    pauseAutoScroll() {
      this.isPaused = true;
    },
    resumeAutoScroll() {
      this.isPaused = false;
    }
  },
  mounted() {
    this.fetchUsers();
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  }
};
</script>

<style scoped>
.employee-profiles-tab {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 220px;
  z-index: 1000;
}

.section-title {
  display: none; /* optional, hide title since it's on side */
}

.tab-wrapper {
  display: flex;
  flex-direction: column;
}

.profile-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  margin-bottom: 12px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.profile-card:hover {
  transform: translateX(-5px);
}

/* Image */
.profile-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  border: 3px solid var(--primary);
}

/* Text */
.profile-card h4 {
  font-size: 16px;
  margin: 4px 0;
}

.dept {
  font-size: 13px;
  color: #777;
  margin-bottom: 10px;
}

/* Social Icons */
.social-icons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-icons .icon {
  font-size: 18px;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.social-icons .icon:hover {
  transform: scale(1.15);
}

.social-icons .disabled {
  pointer-events: none;
  opacity: 0.35;
}

.instagram { color: #e1306c; }
.linkedin { color: #0a66c2; }
.youtube { color: #ff0000; }
.portfolio { color: #4caf50; }
.employee-profiles-tab {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 220px;
  z-index: 1000;
  transition: transform 0.4s ease;
}

/* Hidden state */
.employee-profiles-tab.hidden {
  transform: translate(200px, -50%);
}

/* Toggle Button */
.toggle-btn {
  position: absolute;
  left: -32px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary);
  color: #fff;
  width: 32px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.toggle-btn i {
  font-size: 16px;
}

</style>

