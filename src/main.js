import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Base API URL
axios.defaults.baseURL = 'https://employees.archenterprises.co.in/api'
axios.defaults.withCredentials = true

// ✅ ALWAYS attach token before every request
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      router.push('/auth')
    }
    return Promise.reject(error)
  }
)

createApp(App).use(router).mount('#app')
