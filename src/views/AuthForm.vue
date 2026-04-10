<template>
  <div class="login-wrapper">
    <div class="login-card animate-card">
      <!-- LEFT PANEL - Enhanced with gradient animation -->
      <div class="login-left animate-left">
        <div class="welcome-content">
          <div class="brand-badge">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h1>WELCOME</h1>
          <h3>Arch 360 Portal</h3>
          <p>
            Secure employee & admin access for HR and CRM management.
            Please sign in to continue.
          </p>
          
        </div>

        <!-- animated decorative circles -->
        <span class="circle c1"></span>
        <span class="circle c2"></span>
        <span class="circle c3"></span>
        <span class="circle c4"></span>
      </div>

      <!-- RIGHT PANEL - Professional Form -->
      <div class="login-right animate-right">
        <div class="logo-container">
          <a href="https://employees.archenterprises.co.in/">
            <img
              src="https://archenterprises.co.in/ajay/ajay1.png"
              class="logo"
              alt="Logo"
            />
          </a>
        </div>

        <div class="login-type-indicator">
          <div class="type-switch">
            <button 
              :class="['type-btn', { active: isEmployeeLogin }]"
              @click="setLoginType(true)"
            >
              <i class="fas fa-user"></i> Employee
            </button>
            <button 
              :class="['type-btn', { active: !isEmployeeLogin }]"
              @click="setLoginType(false)"
            >
              <i class="fas fa-user-shield"></i> Admin
            </button>
          </div>
        </div>

        <div class="role-badges" v-if="!isEmployeeLogin">
          <span class="badge hr">
            <i class="fas fa-chart-line"></i> HR
          </span>
          <span class="badge crm">
            <i class="fas fa-users"></i> CRM
          </span>
        </div>

        <form @submit.prevent="handleLogin" class="form">
          <div class="input-group floating-label">
            <i class="fas fa-envelope input-icon"></i>
            <input
              type="text"
              v-model="loginForm.email"
              required
              :class="{ 'has-value': loginForm.email }"
            />
            <label>Email or Username</label>
          </div>

          <div class="input-group floating-label">
            <i class="fas fa-lock input-icon"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="loginForm.password"
              required
              :class="{ 'has-value': loginForm.password }"
            />
            <label>Password</label>
            <i
              class="fas toggle-eye"
              :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="togglePasswordVisibility"
            ></i>
          </div>

          <div class="form-options">
            <label class="checkbox-container">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              <span class="checkbox-text">Remember me</span>
            </label>
          </div>

          <button class="btn-primary" type="submit" :disabled="isLoggingIn">
            <span v-if="isLoggingIn">
              <i class="fas fa-spinner fa-spin"></i> Authenticating...
            </span>
            <span v-else>
              <i class="fas fa-arrow-right-to-bracket"></i> Sign In
            </span>
          </button>
        </form>

        <div class="auth-links">
          <p class="forgot" @click="openForgotPasswordModal">
            <i class="fas fa-key"></i> Forgot Password?
          </p>
        </div>

        <transition name="slide-down">
          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>
        </transition>
      </div>
    </div>

    <!-- FORGOT PASSWORD MODALS - Enhanced -->
    <transition name="modal-fade">
      <div v-if="showForgotPasswordModal" class="modal-backdrop">
        <div class="modal">
          <div class="modal-header">
            <i class="fas fa-key modal-icon"></i>
            <h3>Reset Password</h3>
            <button class="modal-close" @click="closeForgotPasswordModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Enter your email address and we'll send you a verification code.</p>
            <div class="input-group modal-input-group">
              <i class="fas fa-envelope"></i>
              <input type="email" v-model="forgotEmail" placeholder="Email address" />
            </div>
            <p v-if="forgotError" class="error-message">{{ forgotError }}</p>
            <p v-if="forgotSuccess" class="success-message">
              <i class="fas fa-check-circle"></i> {{ forgotSuccess }}
            </p>
          </div>
          <div class="modal-buttons">
            <button class="btn-secondary" @click="closeForgotPasswordModal">
              Cancel
            </button>
            <button class="btn-primary" @click="sendResetLink" :disabled="isSendingOtp">
              <span v-if="isSendingOtp">
                <i class="fas fa-spinner fa-spin"></i> Sending...
              </span>
              <span v-else>Send OTP</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showOtpModal" class="modal-backdrop">
        <div class="modal">
          <div class="modal-header">
            <i class="fas fa-shield-alt modal-icon"></i>
            <h3>Verify OTP</h3>
            <button class="modal-close" @click="closeOtpModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Please enter the 6-digit verification code sent to your email.</p>
            <div class="otp-inputs">
              <input 
                type="text" 
                v-model="otpDigits[0]" 
                maxlength="1" 
                class="otp-digit"
                @input="moveToNext(0, $event)"
                @keyup="handleOtpKeyup(0, $event)"
              />
              <input 
                type="text" 
                v-model="otpDigits[1]" 
                maxlength="1" 
                class="otp-digit"
                @input="moveToNext(1, $event)"
                @keyup="handleOtpKeyup(1, $event)"
              />
              <input 
                type="text" 
                v-model="otpDigits[2]" 
                maxlength="1" 
                class="otp-digit"
                @input="moveToNext(2, $event)"
                @keyup="handleOtpKeyup(2, $event)"
              />
              <input 
                type="text" 
                v-model="otpDigits[3]" 
                maxlength="1" 
                class="otp-digit"
                @input="moveToNext(3, $event)"
                @keyup="handleOtpKeyup(3, $event)"
              />
              <input 
                type="text" 
                v-model="otpDigits[4]" 
                maxlength="1" 
                class="otp-digit"
                @input="moveToNext(4, $event)"
                @keyup="handleOtpKeyup(4, $event)"
              />
              <input 
                type="text" 
                v-model="otpDigits[5]" 
                maxlength="1" 
                class="otp-digit"
                @keyup="handleOtpKeyup(5, $event)"
              />
            </div>
            <p v-if="otpError" class="error-message">{{ otpError }}</p>
          </div>
          <div class="modal-buttons">
            <button class="btn-secondary" @click="closeOtpModal">Back</button>
            <button class="btn-primary" @click="verifyOtp">Verify</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showResetPasswordModal" class="modal-backdrop">
        <div class="modal">
          <div class="modal-header">
            <i class="fas fa-lock modal-icon"></i>
            <h3>Reset Password</h3>
            <button class="modal-close" @click="closeResetPasswordModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="input-group modal-input-group">
              <i class="fas fa-key"></i>
              <input type="password" v-model="newPassword" placeholder="New Password" />
            </div>
            <div class="input-group modal-input-group">
              <i class="fas fa-check-circle"></i>
              <input type="password" v-model="confirmPassword" placeholder="Confirm Password" />
            </div>
            <div v-if="newPassword" class="password-strength">
              <div class="strength-bar" :class="passwordStrengthClass"></div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
            <p v-if="resetError" class="error-message">{{ resetError }}</p>
            <p v-if="resetSuccess" class="success-message">
              <i class="fas fa-check-circle"></i> {{ resetSuccess }}
            </p>
          </div>
          <div class="modal-buttons">
            <button class="btn-secondary" @click="closeResetPasswordModal">Cancel</button>
            <button class="btn-primary" @click="resetPassword" :disabled="isResettingPassword">
              <span v-if="isResettingPassword">
                <i class="fas fa-spinner fa-spin"></i> Updating...
              </span>
              <span v-else>Update Password</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
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
      rememberMe: false,
      loginForm: { email: '', password: '' },
      error: '',

      // Forgot Password
      showForgotPasswordModal: false,
      forgotEmail: '',
      forgotError: '',
      forgotSuccess: '',

      // OTP
      showOtpModal: false,
      otpDigits: ['', '', '', '', '', ''],
      otpError: '',

      // Reset Password
      showResetPasswordModal: false,
      newPassword: '',
      confirmPassword: '',
      resetError: '',
      resetSuccess: ''
    };
  },
  computed: {
    enteredOtp() {
      return this.otpDigits.join('');
    },
    passwordStrengthClass() {
      const strength = this.getPasswordStrength(this.newPassword);
      if (strength === 'weak') return 'strength-weak';
      if (strength === 'medium') return 'strength-medium';
      if (strength === 'strong') return 'strength-strong';
      return '';
    },
    passwordStrengthText() {
      const strength = this.getPasswordStrength(this.newPassword);
      if (strength === 'weak') return 'Weak password';
      if (strength === 'medium') return 'Medium password';
      if (strength === 'strong') return 'Strong password';
      return '';
    }
  },
  created() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const savedTab = localStorage.getItem('authTab');
    const savedEmail = localStorage.getItem('rememberedEmail');

    if (savedEmail) {
      this.loginForm.email = savedEmail;
      this.rememberMe = true;
    }

    if (token && user) {
      if (user.role === 'admin') {
        this.$router.push('/dashboard');
      } else {
        this.$router.push('/employee/dashboard');
      }
      return;
    }

    if (savedTab) {
      this.isEmployeeLogin = savedTab === 'employee';
    } else if (user) {
      this.isEmployeeLogin = user.role !== 'admin';
    }
  },
  methods: {
    getPasswordStrength(password) {
      if (!password) return '';
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
      if (password.match(/\d/)) strength++;
      if (password.match(/[^a-zA-Z\d]/)) strength++;
      
      if (strength <= 2) return 'weak';
      if (strength === 3) return 'medium';
      return 'strong';
    },
    
    setLoginType(isEmployee) {
      this.isEmployeeLogin = isEmployee;
      localStorage.setItem('authTab', isEmployee ? 'employee' : 'admin');
      this.error = '';
      this.loginForm = { email: '', password: '' };
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    moveToNext(index, event) {
      if (event.target.value && index < 5) {
        const nextInput = document.querySelectorAll('.otp-digit')[index + 1];
        if (nextInput) nextInput.focus();
      }
    },

    handleOtpKeyup(index, event) {
      if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
        const prevInput = document.querySelectorAll('.otp-digit')[index - 1];
        if (prevInput) prevInput.focus();
      }
    },

    async handleLogin() {
      if (!this.loginForm.email || !this.loginForm.password) {
        this.error = 'Please fill in all fields';
        return;
      }

      this.isLoggingIn = true;
      this.error = '';
      
      try {
        const url = this.isEmployeeLogin
          ? 'https://employees.archenterprises.co.in/api/api/login'
          : 'https://employees.archenterprises.co.in/api/api/admin-login';

        const response = await axios.post(url, {
          email: this.loginForm.email,
          password: this.loginForm.password
        });

        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.loginForm.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('loginTime', Date.now());
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('authTab', this.isEmployeeLogin ? 'employee' : 'admin');
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        setTimeout(() => {
          if (this.isEmployeeLogin) {
            this.$router.push('/employee/dashboard');
          } else {
            this.$router.push('/dashboard');
          }
        }, 500);

      } catch (err) {
        const message = err.response?.data?.message;
        if (err.response?.status === 403) {
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

    openForgotPasswordModal() {
      this.showForgotPasswordModal = true;
      this.forgotEmail = '';
      this.forgotError = '';
      this.forgotSuccess = '';
    },

    closeForgotPasswordModal() {
      this.showForgotPasswordModal = false;
    },

    async sendResetLink() {
      this.forgotError = '';
      this.forgotSuccess = '';
      
      if (!this.forgotEmail) {
        this.forgotError = 'Email is required';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.forgotEmail)) {
        this.forgotError = 'Please enter a valid email address';
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
          setTimeout(() => {
            this.showForgotPasswordModal = false;
            this.showOtpModal = true;
          }, 1500);
        } else {
          this.forgotError = response.data.message || 'Email is invalid';
        }
      } catch (err) {
        this.forgotError = err.response?.data?.message || 'Failed to send OTP';
      } finally {
        this.isSendingOtp = false;
      }
    },

    async verifyOtp() {
      this.otpError = '';
      
      if (this.enteredOtp.length !== 6) {
        this.otpError = 'Please enter the 6-digit OTP';
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
          this.showResetPasswordModal = true;
        } else {
          this.otpError = response.data.message || 'OTP is invalid';
        }
      } catch (err) {
        this.otpError = err.response?.data?.message || 'Failed to verify OTP';
      }
    },

    async resetPassword() {
      this.resetError = '';
      this.resetSuccess = '';

      if (!this.newPassword || !this.confirmPassword) {
        this.resetError = 'Both fields are required';
        return;
      }

      if (this.newPassword.length < 8) {
        this.resetError = 'Password must be at least 8 characters';
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
            this.otpDigits = ['', '', '', '', '', ''];
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
      this.otpDigits = ['', '', '', '', '', ''];
      this.otpError = '';
    },

    closeResetPasswordModal() {
      this.showResetPasswordModal = false;
      this.newPassword = '';
      this.confirmPassword = '';
      this.resetError = '';
      this.resetSuccess = '';
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-wrapper {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #2196f300 0%, #2196F3 100%); */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -77px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-wrapper::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: backgroundShift 20s linear infinite;
}

@keyframes backgroundShift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.login-card {
  width: 1200px;
  max-width: 95%;
  height: 680px;
  background: #ffffff00;
  border-radius: 32px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
}

/* LEFT PANEL */
.login-left {
  flex: 1.2;
  background: linear-gradient(135deg, #0066b7 0%, #000000 100%);
  color: #fff;
  position: relative;
  padding: 50px;
  overflow: hidden;
}

.welcome-content {
  position: relative;
  z-index: 2;
}

.brand-badge {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  font-size: 28px;
  backdrop-filter: blur(10px);
}

.login-left h1 {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 15px;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-left h3 {
  font-weight: 600;
  font-size: 24px;
  opacity: 0.95;
}

.login-left p {
  margin-top: 20px;
  line-height: 1.7;
  opacity: 0.9;
  font-size: 15px;
}

.security-features {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  opacity: 0.85;
}

.security-item i {
  font-size: 14px;
}

/* Animated Circles */
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite;
}

.c1 { width: 250px; height: 250px; bottom: -80px; left: -80px; }
.c2 { width: 180px; height: 180px; top: 100px; right: -50px; animation-delay: 2s; }
.c3 { width: 120px; height: 120px; bottom: 150px; right: 80px; animation-delay: 4s; }
.c4 { width: 80px; height: 80px; top: 200px; left: 100px; animation-delay: 1s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* RIGHT PANEL */
.login-right {
  flex: 1;
  padding: 50px 45px;
  background: #b2c7d8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  height: 65px;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.login-type-indicator {
  margin-bottom: 20px;
}

.type-switch {
  display: flex;
  gap: 10px;
  background: #f1f5f9;
  padding: 5px;
  border-radius: 50px;
}

.type-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #64748b;
}

.type-btn.active {
  background: linear-gradient(135deg, #0066b7 0%, #000000 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.role-badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 10px 0 20px;
}

.badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge.hr {
  background: white;
  color: #667eea;
}

.badge.crm {
  background: white;
  color: #f5576c;
}

/* Floating Label Inputs */
.input-group {
  position: relative;
  margin-bottom: 25px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
  z-index: 1;
  transition: all 0.3s ease;
}

.input-group input {
  width: 100%;
  padding: 14px 45px 14px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.input-group input:focus {
  border-color: #667eea;
  background: #ffffff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group.floating-label label {
  position: absolute;
  left: 45px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
  transition: all 0.3s ease;
  font-size: 15px;
}

.input-group.floating-label input:focus ~ label,
.input-group.floating-label input.has-value ~ label {
  top: -10px;
  left: 12px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0);
  padding: 0 8px;
  color: #020308;
}

.toggle-eye {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #94a3b8;
  font-size: 16px;
  transition: color 0.3s ease;
  z-index: 1;
}

.toggle-eye:hover {
  color: #667eea;
}

/* Checkbox */
.form-options {
  margin: -10px 0 20px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 28px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: #f8fafc;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #f1f5f9;
}

.checkbox-container input:checked ~ .checkmark {
  background: linear-gradient(135deg, #0066b7 0%, #000000 100%);
  border-color: #667eea;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  margin-left: 8px;
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #0066b7 0%, #000000 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-primary:hover::before {
  width: 300px;
  height: 300px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.auth-links {
  text-align: right;
  margin-top: 15px;
}

.forgot {
  color: #040508;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  transition: all 0.3s ease;
}

.forgot:hover {
  color: #000482;
  transform: translateX(5px);
}

/* Error/Success Messages */
.error-message {
  background: #fee2e200;
  color: #dc2626;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 13px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-message {
  background: #d1fae500;
  color: #059669;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 13px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* OTP Inputs */
.otp-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.otp-digit {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.otp-digit:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Password Strength */
.password-strength {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-weak { background: #ef4444; width: 33%; }
.strength-medium { background: #f59e0b; width: 66%; }
.strength-strong { background: #10b981; width: 100%; }

.strength-text {
  font-size: 11px;
  color: #64748b;
}

/* Modal Styles */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: rgba(255, 255, 255, 0);
  border-radius: 24px;
  width: 90%;
  max-width: 450px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.modal-icon {
  font-size: 28px;
  color: #667eea;
}

.modal-header h3 {
  flex: 1;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.modal-close:hover {
  color: #475569;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  color: #64748b;
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-input-group {
  position: relative;
  margin-bottom: 15px;
}

.modal-input-group i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.modal-input-group input {
  width: 100%;
  padding: 12px 12px 12px 42px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.modal-input-group input:focus {
  border-color: #667eea;
  outline: none;
}

.modal-buttons {
  padding: 0 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 968px) {
  .login-card {
    flex-direction: column;
    height: auto;
  }
  
  .login-left {
    padding: 40px;
    text-align: center;
  }
  
  .brand-badge {
    margin: 0 auto 30px;
  }
  
  .security-features {
    align-items: center;
  }
  
  .login-right {
    padding: 40px;
  }
}

@media (max-width: 480px) {
  .login-left h1 {
    font-size: 32px;
  }
  
  .login-left h3 {
    font-size: 20px;
  }
  
  .login-right {
    padding: 30px 25px;
  }
  
  .otp-digit {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>