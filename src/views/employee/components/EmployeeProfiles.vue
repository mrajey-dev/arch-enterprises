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
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";
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
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://employees.archenterprises.co.in/api/api/users",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );

        let myId = null;
        try {
          const stored = localStorage.getItem('user');
          if (stored) myId = JSON.parse(stored)?.id;
        } catch (e) {}

        const list = (res.data || [])
          .filter(u => !myId || Number(u.id) !== Number(myId))
          .map(user => {
            const storedPhoto = localStorage.getItem(`profilePhoto_${user.id}`);
            let finalPhoto = storedPhoto || user.profile_photo || null;
            if (finalPhoto && !finalPhoto.startsWith('http') && !finalPhoto.startsWith('data:')) {
              if (finalPhoto.includes('/')) {
                finalPhoto = `https://employees.archenterprises.co.in/backend/public/storage/${finalPhoto}`;
              } else {
                finalPhoto = `https://employees.archenterprises.co.in/${finalPhoto}`;
              }
            }
            return {
              ...user,
              finalPhoto,
              instagram: this.formatUrl(user.instagram),
              linkedin: this.formatUrl(user.linkedin),
              youtube: this.formatUrl(user.youtube),
              portfolio: this.formatUrl(user.portfolio)
            };
          })
          .sort((a, b) => {
            const aHas = a.instagram || a.linkedin || a.youtube || a.portfolio ? 1 : 0;
            const bHas = b.instagram || b.linkedin || b.youtube || b.portfolio ? 1 : 0;
            if (aHas !== bHas) return bHas - aHas;
            return (a.name || '').localeCompare(b.name || '');
          });

        this.users = list;
        this.startAutoScroll();
      } catch (e) {
        console.error('Error in EmployeeProfiles fetchUsers:', e);
      }
    },
    formatUrl(url) {
      if (!url || typeof url !== 'string') return '';
      url = url.trim();
      if (url === 'null' || url === 'undefined' || url === '') return '';
      if (!/^https?:\/\//i.test(url)) return 'https://' + url;
      return url;
    },
    startAutoScroll() {
      this.intervalId = setInterval(() => {
        if (!this.isPaused && this.users.length > 0) {
          this.currentIndex = (this.currentIndex + 1) % this.users.length;
        }
      }, 3500);
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

