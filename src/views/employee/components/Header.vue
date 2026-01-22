<template>
    <header class="header">
      <img src="https://archenterprises.co.in/ajay/ajay.png" style="height: 65px;  border-radius: 9px;">
      ARCH ENTERPRISES
      <i class="fas fa-bars mobile-menu-icon" @click="toggleSidebar" v-if="isMobile"></i>
    </header>
</template>

<script>
import axios from 'axios'

export default {
  name: "Header",
  components: {
    Sidebar
  },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
  
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
   
  }
}
</script>

<style>
    .mobile-menu-icon {
  font-size: 22px;
  margin-left: 10px;
  cursor: pointer;
  display: none;
   color: white;
}

</style>