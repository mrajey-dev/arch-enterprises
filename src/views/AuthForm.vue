<template>
  <div class="login-wrapper">
    <div class="login-card animate-card">
      <!-- LEFT PANEL - Enhanced with premium gradient & floating orbs -->
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

        <!-- animated decorative orbs with new floating motion -->
        <span class="circle c1"></span>
        <span class="circle c2"></span>
        <span class="circle c3"></span>
        <span class="circle c4"></span>
        <span class="circle c5"></span>
      </div>

      <!-- RIGHT PANEL - Sleek form -->
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 20% 30%, #f0f4ff, #d9e2ef);
}

/* animated background pattern */
.login-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(102,126,234,0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(245,87,108,0.05) 0%, transparent 50%);
  animation: ambientGlow 12s ease-in-out infinite alternate;
  z-index: 0;
}

@keyframes ambientGlow {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.05); }
}

.login-card {
  width: 1200px;
  max-width: 95%;
  height: 680px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 48px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 40px 80px -20px rgba(0, 20, 40, 0.4), inset 0 1px 0 rgba(255,255,255,0.6);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255,255,255,0.3);
  transition: all 0.4s ease;
}

/* LEFT PANEL — premium deep blue with glassmorphism */
.login-left {
  flex: 1.2;
  background: linear-gradient(145deg, #0b1a33 0%, #0a2a4a 40%, #003366 100%);
  color: #fff;
  position: relative;
  padding: 50px 45px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-left::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 40%, rgba(102, 126, 234, 0.15), transparent 70%);
  pointer-events: none;
}

.welcome-content {
  position: relative;
  z-index: 2;
}

.brand-badge {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  font-size: 30px;
  color: #a5b4fc;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.login-left h1 {
  font-size: 52px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #ffffff, #c7d2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.login-left h3 {
  font-weight: 500;
  font-size: 22px;
  opacity: 0.9;
  letter-spacing: 0.5px;
  color: #e0e7ff;
}

.login-left p {
  margin-top: 20px;
  line-height: 1.8;
  opacity: 0.8;
  font-size: 15px;
  color: #d1d9f0;
  max-width: 90%;
}

/* animated orbs */
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255,255,255,0.05);
  animation: floatOrb 10s ease-in-out infinite;
}

.c1 { width: 280px; height: 280px; bottom: -80px; left: -80px; animation-delay: 0s; }
.c2 { width: 200px; height: 200px; top: 80px; right: -60px; animation-delay: 2s; background: rgba(102,126,234,0.08); }
.c3 { width: 140px; height: 140px; bottom: 120px; right: 40px; animation-delay: 4s; background: rgba(165,180,252,0.06); }
.c4 { width: 90px; height: 90px; top: 180px; left: 60px; animation-delay: 1.5s; background: rgba(255,255,255,0.04); }
.c5 { width: 50px; height: 50px; top: 40px; left: 50%; animation-delay: 3s; background: rgba(165,180,252,0.08); }

@keyframes floatOrb {
  0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
  33% { transform: translateY(-18px) scale(1.02) rotate(3deg); }
  66% { transform: translateY(10px) scale(0.98) rotate(-2deg); }
}

/* RIGHT PANEL — clean, glassmorphism */
.login-right {
  flex: 1;
  padding: 50px 45px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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
  height: 68px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.05));
}

.logo:hover {
  transform: scale(1.06) rotate(-1deg);
}

.login-type-indicator {
  margin-bottom: 18px;
}

.type-switch {
  display: flex;
  gap: 6px;
  background: rgba(241, 245, 249, 0.7);
  backdrop-filter: blur(4px);
  padding: 5px;
  border-radius: 60px;
  border: 1px solid rgba(255,255,255,0.5);
}

.type-btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #475569;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.type-btn.active {
  background: linear-gradient(135deg, #0b1a33 0%, #003366 100%);
  color: white;
  box-shadow: 0 8px 20px rgba(0, 51, 102, 0.25);
}

.type-btn:not(.active):hover {
  background: rgba(255,255,255,0.4);
  color: #0b1a33;
}

.role-badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 6px 0 18px;
}

.badge {
  padding: 6px 18px;
  border-radius: 40px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.4);
}

.badge.hr { color: #4f46e5; }
.badge.crm { color: #db2777; }

/* Floating Label Inputs — premium */
.input-group {
  position: relative;
  margin-bottom: 24px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
  z-index: 2;
  transition: all 0.3s ease;
}

.input-group input {
  width: 100%;
  padding: 16px 48px 16px 48px;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  color: #0b1a33;
}

.input-group input:focus {
  border-color: #4f6ef7;
  background: rgba(255, 255, 255, 0.9);
  outline: none;
  box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.08);
}

.input-group.floating-label label {
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
  transition: all 0.25s ease;
  font-size: 15px;
  background: transparent;
  padding: 0 4px;
}

.input-group.floating-label input:focus ~ label,
.input-group.floating-label input.has-value ~ label {
  top: -8px;
  left: 16px;
  font-size: 11px;
  font-weight: 600;
  color: #0b1a33;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  padding: 0 8px;
  border-radius: 6px;
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
  z-index: 2;
}

.toggle-eye:hover {
  color: #4f6ef7;
}

/* Checkbox */
.form-options {
  margin: -6px 0 22px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  font-size: 14px;
  color: #334155;
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
  height: 20px;
  width: 20px;
  background: rgba(255,255,255,0.6);
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.checkbox-container:hover input ~ .checkmark {
  background: rgba(255,255,255,0.9);
}

.checkbox-container input:checked ~ .checkmark {
  background: linear-gradient(135deg, #0b1a33 0%, #003366 100%);
  border-color: #0b1a33;
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
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  margin-left: 6px;
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #0b1a33 0%, #003366 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.3px;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-primary:hover:not(:disabled)::before {
  width: 400px;
  height: 400px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 16px 30px rgba(0, 51, 102, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 28px;
  background: rgba(241, 245, 249, 0.7);
  backdrop-filter: blur(4px);
  color: #334155;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.auth-links {
  text-align: right;
  margin-top: 14px;
}

.forgot {
  color: #0b1a33;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.forgot:hover {
  color: #4f6ef7;
  opacity: 1;
  transform: translateX(4px);
}

/* Error/Success Messages */
.error-message {
  background: rgba(254, 226, 226, 0.3);
  backdrop-filter: blur(4px);
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(220, 38, 38, 0.15);
}

.success-message {
  background: rgba(209, 250, 229, 0.3);
  backdrop-filter: blur(4px);
  color: #065f46;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(5, 150, 105, 0.15);
}

/* OTP Inputs */
.otp-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 24px 0;
}

.otp-digit {
  width: 52px;
  height: 56px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  transition: all 0.25s ease;
  color: #0b1a33;
}

.otp-digit:focus {
  border-color: #4f6ef7;
  outline: none;
  box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.1);
  background: rgba(255, 255, 255, 0.8);
}

/* Password Strength */
.password-strength {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 5px;
  border-radius: 6px;
  transition: all 0.4s ease;
  background: #e2e8f0;
}

.strength-weak { background: linear-gradient(90deg, #ef4444, #f87171); width: 33%; }
.strength-medium { background: linear-gradient(90deg, #f59e0b, #fbbf24); width: 66%; }
.strength-strong { background: linear-gradient(90deg, #10b981, #34d399); width: 100%; }

.strength-text {
  font-size: 11px;
  font-weight: 500;
  color: #475569;
  min-width: 80px;
}

/* Modal Styles */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
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
  background: rgba(11, 26, 51, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.25s ease;
  padding: 20px;
}

.modal {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 28px;
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 30px 60px rgba(0,0,0,0.15);
}

.modal-header {
  padding: 28px 28px 0 28px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
}

.modal-icon {
  font-size: 30px;
  color: #4f6ef7;
}

.modal-header h3 {
  flex: 1;
  font-size: 22px;
  font-weight: 700;
  color: #0b1a33;
  margin: 0;
}

.modal-close {
  background: rgba(0,0,0,0.04);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(0,0,0,0.08);
  color: #0b1a33;
}

.modal-body {
  padding: 24px 28px;
}

.modal-body p {
  color: #475569;
  margin-bottom: 20px;
  line-height: 1.6;
}

.modal-input-group {
  position: relative;
  margin-bottom: 16px;
}

.modal-input-group i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.modal-input-group input {
  width: 100%;
  padding: 14px 14px 14px 44px;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(4px);
}

.modal-input-group input:focus {
  border-color: #4f6ef7;
  outline: none;
  background: rgba(255,255,255,0.8);
}

.modal-buttons {
  padding: 0 28px 28px 28px;
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
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-card {
  animation: scaleFade 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-left {
  animation: slideLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-right {
  animation: slideRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scaleFade {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ===== RESPONSIVE — Mobile first ===== */
@media (max-width: 968px) {
  .login-card {
    flex-direction: column;
    height: auto;
    max-height: 95vh;
    border-radius: 32px;
  }
  
  .login-left {
    padding: 36px 30px 30px;
    text-align: center;
    flex: none;
    border-radius: 32px 32px 0 0;
  }
  
  .brand-badge {
    margin: 0 auto 24px;
  }
  
  .login-left h1 {
    font-size: 38px;
  }
  
  .login-left p {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .login-right {
    padding: 32px 28px;
    border-radius: 0 0 32px 32px;
  }
  
  .circle {
    display: none;
  }
  .circle.c1, .circle.c2 { display: block; opacity: 0.3; }
}

@media (max-width: 600px) {
  .login-wrapper {
    padding: 12px;
  }
  
  .login-card {
    border-radius: 28px;
    max-width: 100%;
  }
  
  .login-left {
    padding: 28px 20px 24px;
  }
  
  .login-left h1 {
    font-size: 30px;
  }
  
  .login-left h3 {
    font-size: 18px;
  }
  
  .login-left p {
    font-size: 14px;
    margin-top: 14px;
  }
  
  .login-right {
    padding: 24px 18px;
  }
  
  .logo {
    height: 50px;
  }
  
  .type-btn {
    font-size: 12px;
    padding: 8px 10px;
  }
  
  .input-group input {
    padding: 14px 40px 14px 40px;
    font-size: 14px;
  }
  
  .input-group.floating-label label {
    left: 40px;
    font-size: 14px;
  }
  
  .otp-digit {
    width: 42px;
    height: 46px;
    font-size: 18px;
  }
  
  .modal {
    max-width: 100%;
    margin: 12px;
    border-radius: 24px;
  }
  
  .modal-header {
    padding: 20px 20px 0 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-buttons {
    padding: 0 20px 20px 20px;
    flex-wrap: wrap;
  }
  
  .modal-buttons .btn-primary,
  .modal-buttons .btn-secondary {
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }
  
  .btn-primary {
    font-size: 14px;
    padding: 14px;
  }
  
  .brand-badge {
    width: 52px;
    height: 52px;
    font-size: 24px;
  }
}

@media (max-width: 400px) {
  .login-left h1 { font-size: 26px; }
  .login-right { padding: 20px 14px; }
  .otp-digit { width: 36px; height: 40px; font-size: 16px; }
  .otp-inputs { gap: 6px; }
  .type-btn { font-size: 11px; padding: 6px 8px; }
  .badge { font-size: 10px; padding: 4px 12px; }
}
</style>