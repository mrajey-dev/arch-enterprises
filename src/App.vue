<template>
  <div class="app-layout">
   
    <router-view /> <!-- Render routed components -->
  </div>
</template>

<script>
import axios from 'axios'

export default {
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
