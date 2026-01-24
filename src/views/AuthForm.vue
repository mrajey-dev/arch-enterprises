<template>
  <div class="auth-container">
    <div class="card">
    <a href="https://employees.archenterprises.co.in/">
  <img src="https://archenterprises.co.in/ajay/ajay1.png" style="height: 65px;  border-radius: 9px;" alt="Logo">
</a>


      <h2>{{ isEmployeeLogin ? 'Employee Login' : 'Admin Login' }}</h2>

      <form @submit.prevent="handleLogin" class="form">
        <input type="text" v-model="loginForm.email" required placeholder="Username or Email" />
        <div class="password-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="loginForm.password"
            required
            placeholder="Password"
          />
          <i
            class="toggle-password fas"
            :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
            @click="togglePasswordVisibility"
          ></i>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="isLoggingIn">
          <span v-if="isLoggingIn">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>

      <p class="forgot-password" @click="openForgotPasswordModal">Forgot Password?</p>

      <p v-if="error" class="error-message">{{ error }}</p>

      <p class="or-text">— SWITCH —</p>

      <button class="btn btn-success" @click="toggleLoginType">
        {{ isEmployeeLogin ? 'Admin Login' : 'Employee Login' }}
      </button>
    </div>

    <!-- Step 1: Enter Email Modal -->
    <div v-if="showForgotPasswordModal" class="modal-backdrop">
      <div class="modal">
        <h3>Forgot Password</h3>
        <p>Enter your email and we'll send you an OTP to reset your password.</p>
        <input type="email" v-model="forgotEmail" placeholder=" Enter your email" />

        <p v-if="forgotError" class="error-message">{{ forgotError }}</p>
        <p v-if="forgotSuccess" class="success-message">{{ forgotSuccess }}</p>

        <div class="modal-buttons">
         <button class="btn btn-primary" @click="sendResetLink" :disabled="isSendingOtp">
  <span v-if="isSendingOtp">
    <i class="fas fa-spinner fa-spin"></i> Sending...
  </span>
  <span v-else>Send OTP</span>
</button>
          <button class="btn btn-danger" @click="closeForgotPasswordModal">Back to Login</button>
        </div>
      </div>
    </div>

    <!-- Step 2: Enter OTP Modal -->
    <div v-if="showOtpModal" class="modal-backdrop">
      <div class="modal">
        <h3>Enter OTP</h3>
        <p>Please enter the OTP sent to your email.</p>
        <input type="text" v-model="enteredOtp" placeholder=" OTP" />

        <p v-if="otpError" class="error-message">{{ otpError }}</p>

        <div class="modal-buttons">
          <button class="btn btn-primary" @click="verifyOtp">Verify OTP</button>
          <button class="btn btn-danger" @click="closeOtpModal">Back</button>
        </div>
      </div>
    </div>

    <!-- Step 3: Reset Password Modal -->
    <div v-if="showResetPasswordModal" class="modal-backdrop">
      <div class="modal">
        <h3>Reset Password</h3>
        <input type="password" v-model="newPassword" placeholder=" New Password" />
        <input type="password" v-model="confirmPassword" placeholder=" Confirm Password" />

        <p v-if="resetError" class="error-message">{{ resetError }}</p>
        <p v-if="resetSuccess" class="success-message">{{ resetSuccess }}</p>

        <div class="modal-buttons">
          <button class="btn btn-primary" @click="resetPassword" :disabled="isResettingPassword">
  <span v-if="isResettingPassword">
    <i class="fas fa-spinner fa-spin"></i> Updating...
  </span>
  <span v-else>Update Password</span>
</button>
          <button class="btn btn-danger" @click="closeResetPasswordModal">Back</button>
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

.modal input {
  padding: 14px 0px;
  margin: 8px 0;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 16px;
  width: 100%;
  transition: 0.3s;
  background-color: #fefefe;
}

.modal input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.success-message {
  color: #28a745;
  font-weight: 600;
  margin-top: 12px;
  animation: fadeIn 0.5s ease;
}

.error-message {
  color: #dc3545;
  font-weight: 600;
  margin-top: 12px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-buttons .btn {
  min-width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.forgot-password {
  margin-top: 10px;
  color: var(--text);
  cursor: pointer;
  text-decoration: none;
}

.success-message {
  margin-top: 10px;
  color: #28a745;
  font-weight: 500;
}
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  flex: 1;
}

.toggle-password {
  position: absolute;
  right: 12px;
  cursor: pointer;
  color: #888;
  font-size: 16px;
}

.login-logo {
  width: 120px;
  margin-bottom: -12px;
  animation: pulseLogo 2s infinite;
}

.error-message {
  margin-top: 10px;
  color: #dc3545;
  font-weight: 500;
}

.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary);
  min-height: 100vh;
  width: 100%;
  padding: 0;
}



.logo {
  width: 140px;
  margin-bottom: 30px;
  animation: pulseLogo 2s infinite;
}

@keyframes pulseLogo {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.card {
  background: #ffffffa8;
  padding: 35px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 80%;
  max-width: 420px;
  text-align: center;
  transition: 0.3s ease;
}

.card:hover {
  transform: scale(1.01);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

h2 {
  margin-bottom: 25px;
  color: var(--text);
  font-weight: 700;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input {
  padding: 12px 15px;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: 0.3s;
  background-color: #f9f9f9;
}

input:hover {
  background-color: #fff;
  border-color: var(--primary);
}

input:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.or-text {
  margin: 20px 0 10px;
  color: #888;
  font-size: 14px;
}

.btn {
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--text);
}

.btn-success {
  background-color: var(--text);
  color: white;
}

.btn-success:hover {
  background-color: #06163b;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #b52a37;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(5px);
}

.modal {
  background: #fff;
  padding: 30px 25px;
  border-radius: 14px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
</style>
