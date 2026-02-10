import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf({
  duration: 10000,
  position: {
    x: "right",
    y: "top",
  },
  dismissible: true,
  ripple: true,
  types: [
    {
      type: "success",
      background: "#16a34a", // professional green
      icon: {
        className: "notyf__icon--success",
        tagName: "i",
      },
    },
    {
      type: "error",
      background: "#dc2626", // professional red
      icon: {
        className: "notyf__icon--error",
        tagName: "i",
      },
    },
    {
      type: "warning",
      background: "#f59e0b",
    },
    {
      type: "info",
      background: "#2563eb",
    },
  ],
});

export const toastSuccess = (msg) => notyf.success(msg);
export const toastError = (msg) => notyf.error(msg);
export const toastWarning = (msg) => notyf.open({ type: "warning", message: msg });
export const toastInfo = (msg) => notyf.open({ type: "info", message: msg });
