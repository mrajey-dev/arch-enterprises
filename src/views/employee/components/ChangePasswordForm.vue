<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <h3>Change Password</h3>
      <form @submit.prevent="submitForm">
        <input
          type="password"
          v-model="form.current_password"
          placeholder="Current Password"
          required
        />
        <input
          type="password"
          v-model="form.new_password"
          placeholder="New Password"
          required
        />
        <input
          type="password"
          v-model="form.new_password_confirmation"
          placeholder="Confirm New Password"
          required
        />

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>

        <div class="button-group">
          <button type="submit" class="btn primary">Update Password</button>
          <button type="button" class="btn cancel" @click="close">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  props: ["show"],
  emits: ["close"],
  data() {
    return {
      form: {
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      },
      error: "",
      success: "",
    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    async submitForm() {
      this.error = "";
      this.success = "";

      if (this.form.new_password !== this.form.new_password_confirmation) {
        this.error = "New passwords do not match.";
        return;
      }

      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "https://employees.archenterprises.co.in/api/api/change-password",
          this.form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.success = "Password updated successfully.";
        this.form = {
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        };
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to update password.";
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: #fff;
  padding: 30px;
  border-radius: 15px;
  width: 350px;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  animation: pop-in 0.3s ease;
}

@keyframes pop-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

h3 {
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  font-size: 20px;
  text-align: center;
}

input {
  display: block;
  margin-bottom: 14px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  outline: none;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn.primary {
  background-color: var(--primary);
  color: white;
}

.btn.primary:hover {
  background-color: var(--text);
  transform: translateY(-1px);
}

.btn.cancel {
  background-color: #e0e0e0;
  color: var(--text);
}

.btn.cancel:hover {
  background-color: #cfcfcf;
  transform: translateY(-1px);
}

.error {
  color: #e53935;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
}

.success {
  color: #43a047;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
}
</style>
    