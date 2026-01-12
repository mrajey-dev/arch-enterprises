<template>
  <div class="app-layout">
   <!-- 🔔 Global Notification Bell -->
    <NotificationBell />
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
