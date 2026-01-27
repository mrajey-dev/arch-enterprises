<template>
  <div class="login-wrapper">
    <div class="login-card animate-card">

      <!-- LEFT PANEL -->
      <div class="login-left animate-left">
        <div class="welcome-content">
          <h1>WELCOME</h1>
          <h3>Arch 360 Portal</h3>
          <p>
            Secure employee & admin access for HR and CRM management.
            Please sign in to continue.
          </p>
        </div>

        <!-- decorative circles -->
        <span class="circle c1"></span>
        <span class="circle c2"></span>
        <span class="circle c3"></span>
      </div>

      <!-- RIGHT PANEL -->
      <div class="login-right animate-right">
        <a href="https://employees.archenterprises.co.in/">
          <img
            src="https://archenterprises.co.in/ajay/ajay1.png"
            class="logo"
            alt="Logo"
          />
        </a>

        <h2>{{ isEmployeeLogin ? 'Employee Login' : 'Admin Login' }}</h2>
        <div v-if="!isEmployeeLogin" class="role-badges">
  <span class="badge hr">HR</span>
  <span class="badge crm">CRM</span>
</div>

        <p class="sub-text">
          {{ isEmployeeLogin ? 'Employee / Staff Access' : 'HR / CRM Admin Access' }}
        </p>

        <form @submit.prevent="handleLogin" class="form">
          <div class="input-group">
            <i class="fas fa-user"></i>
            <input
              type="text"
              v-model="loginForm.email"
              required
              placeholder="Username or Email"
            />
          </div>

          <div class="input-group">
            <i class="fas fa-lock"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="loginForm.password"
              required
              placeholder="Password"
            />
            <i
              class="fas toggle-eye"
              :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="togglePasswordVisibility"
            ></i>
          </div>

          <button class="btn-primary" type="submit" :disabled="isLoggingIn">
            <span v-if="isLoggingIn">
              <i class="fas fa-spinner fa-spin"></i> Logging in
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <p class="forgot" @click="openForgotPasswordModal">
          Forgot Password?
        </p>

        <p v-if="error" class="error-message">{{ error }}</p>

        <div class="switch">
          <span>— SWITCH —</span>
          <button class="btn-switch" @click="toggleLoginType">
            {{ isEmployeeLogin ? 'Admin Login' : 'Employee Login' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 🔐 FORGOT PASSWORD MODALS (UNCHANGED LOGIC) -->
    <div v-if="showForgotPasswordModal" class="modal-backdrop">
      <div class="modal">
        <h3>Forgot Password</h3>
        <input type="email" v-model="forgotEmail" placeholder="Enter email" />

        <p v-if="forgotError" class="error-message">{{ forgotError }}</p>
        <p v-if="forgotSuccess" class="success-message">{{ forgotSuccess }}</p>

        <div class="modal-buttons">
          <button class="btn-primary" @click="sendResetLink" :disabled="isSendingOtp">
            <span v-if="isSendingOtp">
              <i class="fas fa-spinner fa-spin"></i> Sending
            </span>
            <span v-else>Send OTP</span>
          </button>
          <button class="btn-danger" @click="closeForgotPasswordModal">
            Back
          </button>
        </div>
      </div>
    </div>

    <div v-if="showOtpModal" class="modal-backdrop">
      <div class="modal">
        <h3>Enter OTP</h3>
        <input type="text" v-model="enteredOtp" placeholder="OTP" />
        <p v-if="otpError" class="error-message">{{ otpError }}</p>

        <div class="modal-buttons">
          <button class="btn-primary" @click="verifyOtp">Verify</button>
          <button class="btn-danger" @click="closeOtpModal">Back</button>
        </div>
      </div>
    </div>

    <div v-if="showResetPasswordModal" class="modal-backdrop">
      <div class="modal">
        <h3>Reset Password</h3>
        <input type="password" v-model="newPassword" placeholder="New Password" />
        <input type="password" v-model="confirmPassword" placeholder="Confirm Password" />

        <p v-if="resetError" class="error-message">{{ resetError }}</p>
        <p v-if="resetSuccess" class="success-message">{{ resetSuccess }}</p>

        <div class="modal-buttons">
          <button class="btn-primary" @click="resetPassword" :disabled="isResettingPassword">
            <span v-if="isResettingPassword">
              <i class="fas fa-spinner fa-spin"></i> Updating
            </span>
            <span v-else>Update</span>
          </button>
          <button class="btn-danger" @click="closeResetPasswordModal">
            Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      isSendingOtp: false,
isResettingPassword: false,
      isLoggingIn: false,
      isEmployeeLogin: true,
      showPassword: false,
      loginForm: { email: '', password: '' },
      error: '',

      // Forgot Password Step 1
      showForgotPasswordModal: false,
      forgotEmail: '',
      forgotError: '',
      forgotSuccess: '',

      // Step 2: OTP
      showOtpModal: false,
      enteredOtp: '',
      otpError: '',

      // Step 3: Reset Password
      showResetPasswordModal: false,
      newPassword: '',
      confirmPassword: '',
      resetError: '',
      resetSuccess: ''
    };
  },

  created() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
      if (user.role === 'admin') this.$router.push('/dashboard');
      else this.$router.push('/employee/dashboard');
    }
  },

  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    async handleLogin() {
      this.isLoggingIn = true;
      this.error = '';
      try {
        await axios.get('https://employees.archenterprises.co.in/api/sanctum/csrf-cookie', { withCredentials: true });
        const url = this.isEmployeeLogin
          ? 'https://employees.archenterprises.co.in/api/api/login'
          : 'https://employees.archenterprises.co.in/api/api/admin-login';

        const response = await axios.post(url, {
          email: this.loginForm.email,
          password: this.loginForm.password
        }, { withCredentials: true });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        if (this.isEmployeeLogin) this.$router.push('/employee/dashboard');
        else this.$router.push('/dashboard');

      } catch (err) {
  const message = err.response?.data?.message;

  if (err.response?.status === 403) {
    // ❌ Account inactive
    this.error = "Your account is inactive. Please contact Admin.";
  } else if (message) {
    this.error = message;
  } else {
    this.error = "Login failed. Please check your credentials.";
  }
} finally {
        this.isLoggingIn = false;
      }
    },

    toggleLoginType() {
      this.isEmployeeLogin = !this.isEmployeeLogin;
    },

    openForgotPasswordModal() {
      this.showForgotPasswordModal = true;
      this.forgotEmail = '';
      this.forgotError = '';
      this.forgotSuccess = '';
    },

    closeForgotPasswordModal() {
      this.showForgotPasswordModal = false;
    },










    
// Update sendResetLink()
async sendResetLink() {
  this.forgotError = '';
  this.forgotSuccess = '';
  if (!this.forgotEmail) {
    this.forgotError = 'Email is required';
    return;
  }

  this.isSendingOtp = true;

  try {
    const url = this.isEmployeeLogin
      ? 'https://employees.archenterprises.co.in/api/api/employee/forgot-password'
      : 'https://employees.archenterprises.co.in/api/api/admin/forgot-password';

    const response = await axios.post(url, { email: this.forgotEmail });

    if (response.data.success) {
      this.forgotSuccess = 'OTP sent successfully!';
      this.showForgotPasswordModal = false;
      this.showOtpModal = true;
    } else {
      this.forgotError = response.data.message || 'Email is invalid';
    }
  } catch (err) {
    this.forgotError = err.response?.data?.message || 'Failed to send OTP';
  } finally {
    this.isSendingOtp = false;
  }
},

// Update resetPassword()
async resetPassword() {
  this.resetError = '';
  this.resetSuccess = '';

  if (!this.newPassword || !this.confirmPassword) {
    this.resetError = 'Both fields are required';
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    this.resetError = 'Passwords do not match';
    return;
  }

  this.isResettingPassword = true;

  try {
    const url = this.isEmployeeLogin
      ? 'https://employees.archenterprises.co.in/api/api/employee/reset-password'
      : 'https://employees.archenterprises.co.in/api/api/admin/reset-password';

    const response = await axios.post(url, {
      email: this.forgotEmail,
      password: this.newPassword,
      password_confirmation: this.confirmPassword
    });

    if (response.data.success) {
      this.resetSuccess = 'Password updated successfully!';
      setTimeout(() => {
        this.showResetPasswordModal = false;
        this.newPassword = '';
        this.confirmPassword = '';
      }, 1500);
    } else {
      this.resetError = response.data.message || 'Failed to update password';
    }
  } catch (err) {
    this.resetError = err.response?.data?.message || 'Failed to update password';
  } finally {
    this.isResettingPassword = false;
  }
},


    closeOtpModal() {
      this.showOtpModal = false;
      this.forgotEmail = '';
    },

    async verifyOtp() {
      this.otpError = '';
      if (!this.enteredOtp) {
        this.otpError = 'OTP is required';
        return;
      }

      try {
       const url = this.isEmployeeLogin
  ? 'https://employees.archenterprises.co.in/api/api/employee/verify-otp'
  : 'https://employees.archenterprises.co.in/api/api/admin/verify-otp';

const response = await axios.post(url, {
  email: this.forgotEmail,
  otp: this.enteredOtp
});


        if (response.data.success) {
          this.showOtpModal = false;
          this.showResetPasswordModal = true; // move to reset password
        } else {
          this.otpError = response.data.message || 'OTP is invalid';
        }
      } catch (err) {
        this.otpError = err.response?.data?.message || 'Failed to verify OTP';
      }
    },

    closeResetPasswordModal() {
      this.showResetPasswordModal = false;
      this.newPassword = '';
      this.confirmPassword = '';
    },

   async resetPassword() {
  this.resetError = '';
  this.resetSuccess = '';

  if (!this.newPassword || !this.confirmPassword) {
    this.resetError = 'Both fields are required';
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    this.resetError = 'Passwords do not match';
    return;
  }

  try {
    const url = this.isEmployeeLogin
      ? 'https://employees.archenterprises.co.in/api/api/employee/reset-password'
      : 'https://employees.archenterprises.co.in/api/api/admin/reset-password';

    const response = await axios.post(url, {
      email: this.forgotEmail,
      password: this.newPassword,
      password_confirmation: this.confirmPassword // needed for validation
    });

    if (response.data.success) {
      this.resetSuccess = 'Password updated successfully!';
      setTimeout(() => {
        this.showResetPasswordModal = false;
      }, 1500);
    } else {
      this.resetError = response.data.message || 'Failed to update password';
    }
  } catch (err) {
    if (err.response?.status === 422) {
      this.resetError = 'Email is invalid';
    } else {
      this.resetError = err.response?.data?.message || 'Failed to update password';
    }
  }
}

  }
};
</script>







<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #0b5ed7, #06357a);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 1100px;
  max-width: 95%;
  height: 620px;
  background: #fff;
  border-radius: 22px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.25);
}

/* LEFT */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #0d6efd, #084298);
  color: #fff;
  position: relative;
  padding: 60px;
  overflow: hidden;
}

.welcome-content {
  position: relative;
  z-index: 2;
}

.login-left h1 {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 10px;
}

.login-left h3 {
  font-weight: 500;
  opacity: 0.9;
}

.login-left p {
  margin-top: 20px;
  line-height: 1.6;
  opacity: 0.85;
  max-width: 320px;
}

/* circles */
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  animation: float 6s ease-in-out infinite;
}

.c1 { width: 180px; height: 180px; bottom: -40px; left: 40px; }
.c2 { width: 120px; height: 120px; top: 80px; right: 60px; animation-delay: 2s; }
.c3 { width: 90px; height: 90px; bottom: 120px; right: 120px; animation-delay: 4s; }

@keyframes float {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* RIGHT */
.login-right {
  flex: 1;
  padding: 55px 60px;
  text-align: center;
}

.logo {
  height: 60px;
  margin-bottom: 20px;
}

.login-right h2 {
  font-size: 26px;
  margin-bottom: 5px;
}

.sub-text {
  color: #777;
  font-size: 14px;
  margin-bottom: 30px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-group {
  position: relative;
}

.input-group i {
     position: absolute;
    display: flex;
    top: 50%;
    transform: translateY(-50%);
    left: -30px;
    color: #999;
    justify-content: flex-end;
}

.toggle-eye {
  right: 14px;
  left: auto;
  cursor: pointer;
}

.input-group input {
  width: 100%;
  padding: 14px 42px;
  margin-left: -42px;
  border-radius: 10px;
  border: 1.5px solid #ddd;
  font-size: 15px;
  transition: 0.3s;
}

.input-group input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13,110,253,0.15);
  outline: none;
}

/* buttons */
.btn-primary {
  margin-top: 10px;
  padding: 14px;
  background: #0d6efd;
  color: #fff;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: 0.3s;
}

.btn-primary:hover {
  background: #084298;
  transform: translateY(-1px);
}

.forgot {
  margin-top: 14px;
  color: #0d6efd;
  cursor: pointer;
  font-size: 14px;
}

.switch {
  margin-top: 30px;
}

.switch span {
  display: block;
  font-size: 13px;
  color: #999;
  margin-bottom: 10px;
}

.btn-switch {
  background: #06163b;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

/* modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: #fff;
  padding: 30px;
  border-radius: 14px;
  width: 90%;
  max-width: 420px;
}

.modal input {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
  border-radius: 8px;
  padding: 10px 16px;
  border: none;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
}

.success-message {
  color: #28a745;
  margin-top: 10px;
}
/* ===================== */
/* MOBILE RESPONSIVENESS */
/* ===================== */

@media (max-width: 900px) {
  .login-card {
    flex-direction: column;
    height: auto;
    border-radius: 18px;
  }

  .login-left {
    padding: 40px 30px;
    text-align: center;
  }

  .login-left p {
    max-width: 100%;
  }

  .circle {
    display: none; /* cleaner on mobile */
  }

  .login-right {
    padding: 40px 30px;
  }
  .input-group i{

      position: absolute;
    display: flex;
    top: 50%;
    transform: translateY(-50%);
    left: 5px;
    color: #999;
    justify-content: flex-end;
}
.input-group input{
  width: 78%;
        /* padding: 14px 98px; */
        margin-left: -14px;
        border-radius: 10px;
        border: 1.5px solid #ddd;
        font-size: 15px;
        transition: .3s;
}
}

@media (max-width: 480px) {
  .login-left h1 {
    font-size: 30px;
  }

  .login-right h2 {
    font-size: 22px;
  }

  .logo {
    height: 52px;
  }

  .btn-primary {
    padding: 13px;
    font-size: 15px;
  }
}

/* ===================== */
/* PAGE LOAD ANIMATIONS  */
/* ===================== */

.animate-card {
  animation: scaleFade 0.6s ease forwards;
}

.animate-left {
  animation: slideLeft 0.7s ease forwards;
}

.animate-right {
  animation: slideRight 0.7s ease forwards;
}

@keyframes scaleFade {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ===================== */
/* ROLE BADGES           */
/* ===================== */

.role-badges {
  margin: 10px 0 18px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.badge {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.badge.hr {
  background: rgba(13,110,253,0.15);
  color: #0d6efd;
}

.badge.crm {
  background: rgba(25,135,84,0.15);
  color: #198754;
}

</style>
