import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// ✅ Base API URL
axios.defaults.baseURL = 'https://employees.archenterprises.co.in/api'

// ✅ Send cookies and session data (important for Sanctum)
axios.defaults.withCredentials = true

// ✅ Attach Bearer token (for Sanctum personal access tokens)
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

createApp(App).use(router).mount('#app')
