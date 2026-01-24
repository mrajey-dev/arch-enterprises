<template>
  <div class="app-layout">
   <!-- 🔔 Global Notification Bell -->
    <NotificationBell v-if="showBell"/>
    <router-view /> <!-- Render routed components -->
  </div>
</template>

<script>
  import NotificationBell from '@views/employee/components/NotificationBell.vue'
import axios from 'axios'

export default {
   components: {
    NotificationBell
  },
  computed:{
     isQuotationPage() {
    return this.$route.path === '/quotation'
  },
      showBell() {
        return !this.$route.meta?.hideBell
    }
  },
  data() {
    
    return {
      message: 'Loading...'
    }
  },
 mounted() {
  const theme = localStorage.getItem("theme") || "default";

  // Apply theme
  document.documentElement.setAttribute("data-theme", theme);

  // Optional: sync select dropdown value
  const select = document.querySelector(".theme-select");
  if (select) {
    select.value = theme;
  }

  },
  methods: {
  changeTheme(e) {
    const theme = e.target.value;

    document.documentElement.classList.add("theme-transition");

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 400);
  }
}

}
</script>

<style>
/* ===== DEFAULT THEME (Blue) ===== */
:root {
  --primary: #518587;
  --sidebar: #add7d9;
  --card: #ffffff;
  --text: #0d5a5d;
  --text-white: #ffffff;

}

[data-theme="Default"] {
--primary: #518587; --sidebar: #add7d9; --card: #ffffff; --text: #0d5a5d;
  --text-white: #ffffff;
}

[data-theme="green"] {
  --primary: #3fc470;
  --sidebar: #b6f7ca;
  --card: #3fc470bd;
  --text: #065f46;
  --text-white: #ffffff;
}


[data-theme="blue"] {
  --primary: #034081;
  --sidebar: #b4ccf9;
  --card: #034081;
  --text: #042345;
  --text-white: #ffffff;
}

[data-theme="dark"] {
  --primary: #000000;
   --sidebar: #ffffffad;
    --card: #000000;
     --text: #000a0a;
  --text-white: #ffffff;
}

[data-theme="orange"] {
  --primary: #ae4c08;
  --sidebar: #fed7aa;
  --card: #ae4c08;
  --text: #691f06;
  --text-white: #ffffff;
}

[data-theme="red"] {
  --primary: #a80606;
  --sidebar: #fecaca;
  --card: #a80606;
  --text: #540101;
  --text-white: #ffffff;
}


[data-theme="amber"] {
  --primary: #afb805;
  --sidebar: #afb80569;
  --card: #afb805;
  --text: #727802;
  --text-white: #ffffff;
}

[data-theme="teal"] {
  --primary: #08a594;
  --sidebar: #a5d5cf;
  --card: #08a594;
  --text: #134e4a;
  --text-white: #ffffff;
}

[data-theme="pink"] {
  --primary: #ec4899;
  --sidebar: #fbcfe8;
  --card: #ec4899;
  --text: #831843;
  --text-white: #ffffff;
}
[data-theme="purple"] {
  --primary: #8d004e;
  --sidebar: #edd2e1 ;
  --card: #8d004e;
  --text: #580433;
  --text-white: #ffffff;
}

* {
  transition: background-color 0.3s ease, color 0.3s ease;
}


/* ===== APPLY TO APP ===== */
.app-layout {
  padding: 0px;
  font-family: Arial, sans-serif;
  /* background: var(--background); */
  color: black;
}

.theme-switcher {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 9999;
  background: white;
  padding: 10px 14px;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.theme-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.theme-select {
  appearance: none;
  padding: 6px 28px 6px 12px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: white;
  color: var(--text);
  cursor: pointer;
  outline: none;
  transition: all 0.25s ease;
}

/* Arrow */
.theme-select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg fill='gray' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

.theme-select:hover {
  border-color: var(--primary);
}

.theme-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(81, 133, 135, 0.25);
}

/* Slide-in on load */
.slide-in {
  animation: slideIn 0.6s ease-out forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(40px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Theme switcher container */
.theme-switcher {
  position: fixed;
  top: 28px;
    right: 54px;
  z-index: 9999;
  background: #ffffff8c;
  padding: 10px 14px;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Label */
.theme-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

/* Select */
.theme-select {
  appearance: none;
  padding: 7px 32px 7px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: white;
  color: var(--text);
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

/* Dropdown arrow */
.theme-select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg fill='gray' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

/* Hover & focus */
.theme-select:hover {
  border-color: var(--primary);
}

.theme-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(81, 133, 135, 0.25);
}
html {
  transition: background-color 0.4s ease, color 0.4s ease;
}

body,
.card,
.sidebar,
.header {
  transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease;
}
 @media (max-width: 768px) {
  .theme-switcher{
       top: 38px;
        right: 74px;
        padding: 2px 1px;

  }
  .theme-label{
        font-size: 8px;
  }
  .theme-select{
        font-size: 9px;
  }
  .fa-bell:before {
    margin-right: 16px!important;
  }
}

</style>


<!-- <style>
.app-layout {
  padding: 0px;
  font-family: Arial, sans-serif;
}
</style> -->
