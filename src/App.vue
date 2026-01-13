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
      showBell() {
        return !this.$route.meta?.hideBell
    }
  },
  data() {
    
    return {
      message: 'Loading...'
    }
  },
  
}
</script>

<style scoped>
.app-layout {
  padding: 0px;
  font-family: Arial, sans-serif;
}
</style>
