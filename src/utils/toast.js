import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import "./toast.css";

const notyf = new Notyf({
  duration: 3000,
  position: {
    x: "right",
    y: "top",
  },
  dismissible: true,
  ripple: true,
  types: [
    {
      type: "success",
      background: "linear-gradient(135deg, #059669 0%, #10b981 60%, #047857 100%)",
      className: "notyf__toast--success",
      icon: {
        className: "fas fa-circle-check notyf-custom-icon",
        tagName: "i",
        text: "",
      },
    },
    {
      type: "error",
      background: "linear-gradient(135deg, #e11d48 0%, #f43f5e 60%, #be123c 100%)",
      className: "notyf__toast--error",
      icon: {
        className: "fas fa-circle-exclamation notyf-custom-icon",
        tagName: "i",
        text: "",
      },
    },
    {
      type: "warning",
      background: "linear-gradient(135deg, #d97706 0%, #f59e0b 60%, #b45309 100%)",
      className: "notyf__toast--warning",
      icon: {
        className: "fas fa-triangle-exclamation notyf-custom-icon",
        tagName: "i",
        text: "",
      },
    },
    {
      type: "info",
      background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 60%, #1d4ed8 100%)",
      className: "notyf__toast--info",
      icon: {
        className: "fas fa-circle-info notyf-custom-icon",
        tagName: "i",
        text: "",
      },
    },
  ],
});

export const toastSuccess = (msg) => notyf.success(msg);
export const toastError = (msg) => notyf.error(msg);
export const toastWarning = (msg) => notyf.open({ type: "warning", message: msg });
export const toastInfo = (msg) => notyf.open({ type: "info", message: msg });
