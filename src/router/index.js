import { createRouter, createWebHistory } from 'vue-router'
import AuthForm from '../views/AuthForm.vue'
import Dashboard from '../views/Dashboard.vue'
import Employee from '../views/ManageEmp.vue'
import Settings from '../views/Settings.vue'
import LeaveApplications from '../views/LeaveApplications.vue'
import ApprovedLeaves from '../views/ApprovedLeaves.vue'
import RejectedLeaves from '../views/RejectedLeaves.vue'
import PendingLeaves from '../views/PendingLeaves.vue'
import ManageLeavetype from '../views/ManageLeavetype.vue'
import CustomerRegistration from '../views/CustomerRegistration.vue'
import Quotation from '../views/quotation.vue'
import EmpDsi from '../views/EmpDsi.vue'
import RCAhelp from '../views/RCAhelp.vue'




import ManageDepartments from '../views/ManageDepartments.vue'
import EmployeeDashboard from '../views/employee/Dashboard.vue' 
// import DailyWorkReport from '../views/employee/DailyWorkReport.vue'
import MyTask from '../views/employee/MyTask.vue'
import MyPerformance from '../views/employee/MyPerformance.vue'
import ApplyLeave from '../views/employee/ApplyLeave.vue'

import Report from '../views/employee/Report.vue'
import FollowUp from '../views/employee/FollowUp.vue'
import ViewAllPo from '../views/employee/ViewAllPo.vue'
import EmpWorkReport from '../views/employee/EmpWorkReport.vue'


import AssignTask from '../views/AssignTask.vue'
import Announcement from '../views/Announcement.vue'
import ViewAnnouncement from '../views/employee/ViewAnnouncement.vue'
import WorkReport from '../views/WorkReport.vue'
import EmpAttendance from '../views/employee/EmpAttendance.vue'
import ApprovedLeavesEmp from '../views/employee/ApprovedLeavesEmp.vue'
import RejectedLeavesEmp from '../views/employee/RejectedLeavesEmp.vue'
import LeaveApplicationsEmp from '../views/employee/LeaveApplicationsEmp.vue'
import PendingLeavesEmp from '../views/employee/PendingLeavesEmp.vue'
import EmpAttendanceAdmin from '../views/EmpAttendanceAdmin.vue'
import ViewKra from '../views/employee/ViewKra.vue'  // Add this line
import CustomerRegistrations from '../views/employee/CustomerRegistrations.vue'
import VisitSchedule from '../views/employee/VisitSchedule.vue'
import MyDsi from '../views/employee/MyDsi.vue'
import Help from '../views/employee/Help.vue'



import MyProfile from '../views/employee/MyProfile.vue'










const routes = [
  { path: '/', component: AuthForm, meta: { hideBell: true } },
  { path: '/auth', component: AuthForm, meta: { hideBell: true } },

  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true }, meta: { hideBell: true }
   },
  { path: '/employees', name: 'ManageEmp', component: Employee, meta: { hideBell: true } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { hideBell: true } },

  { path: '/leaveapplications', name: 'LeaveApplications', component: LeaveApplications, meta: { hideBell: true } },
  { path: '/approvedleaves', name: 'ApprovedLeaves', component: ApprovedLeaves, meta: { hideBell: true } },
  { path: '/rejectedleaves', name: 'RejectedLeaves', component: RejectedLeaves, meta: { hideBell: true } },
  { path: '/pendingleaves', name: 'PendingLeaves', component: PendingLeaves, meta: { hideBell: true } },
  { path: '/manageleavetype', name: 'ManageLeavetype', component: ManageLeavetype, meta: { hideBell: true } },

  { path: '/customerregistration', name: 'CustomerRegistration', component: CustomerRegistration, meta: { hideBell: true } },

  // 🔔 Bell hidden here
  { 
    path: '/quotation',
    name: 'Quotation',
    component: Quotation,
    meta: { hideBell: true }
  },

  { path: '/managedepartments', name: 'ManageDepartments', component: ManageDepartments, meta: { hideBell: true } },
  { path: '/assigntask', name: 'AssignTask', component: AssignTask, meta: { hideBell: true } },
  { path: '/announcement', name: 'Announcement', component: Announcement, meta: { hideBell: true } },
  { path: '/workreport', name: 'WorkReport', component: WorkReport, meta: { hideBell: true } },
  { path: '/empattendanceadmin', name: 'empattendanceadmin', component: EmpAttendanceAdmin, meta: { hideBell: true } },
  { path: '/empdsi', name: 'EmpDsi', component: EmpDsi, meta: { hideBell: true } },
  { path: '/rcahelp', name: 'RCAhelp', component: RCAhelp, meta: { hideBell: true } },

  // ───── EMPLOYEE SECTION ─────
  { path: '/employee/dashboard', name: 'EmployeeDashboard', component: EmployeeDashboard },
  { path: '/employee/mytask', name: 'MyTask', component: MyTask },
  { path: '/employee/myperformance', name: 'MyPerformance', component: MyPerformance },
  { path: '/employee/applyleave', name: 'ApplyLeave', component: ApplyLeave },
  { path: '/employee/viewannouncement', name: 'ViewAnnouncement', component: ViewAnnouncement },

  { path: '/employee/approvedleavesemp', name: 'ApprovedLeavesEmp', component: ApprovedLeavesEmp },
  { path: '/employee/rejectedleavesemp', name: 'RejectedLeavesEmp', component: RejectedLeavesEmp },
  { path: '/employee/leaveapplicationsemp', name: 'LeaveApplicationsEmp', component: LeaveApplicationsEmp },
  { path: '/employee/pendingleaves', name: 'PendingLeavesEmp', component: PendingLeavesEmp },
  { path: '/employee/empattendance', name: 'empattendance', component: EmpAttendance },

  { path: '/employee/viewkra', name: 'ViewKra', component: ViewKra },
  { path: '/employee/report', name: 'Report', component: Report },
  { path: '/employee/customerregistrations', name: 'CustomerRegistrations', component: CustomerRegistrations },
  { path: '/employee/visitschedule', name: 'VisitSchedule', component: VisitSchedule },

  // 🔔 Bell hidden here also
  { 
    path: '/employee/followup',
    name: 'FollowUp',
    component: FollowUp,
    meta: { hideBell: true }
  },

  { path: '/employee/viewallpo', name: 'ViewAllPo', component: ViewAllPo },
  { path: '/employee/mydsi', name: 'MyDsi', component: MyDsi },
  { path: '/employee/help', name: 'Help', component: Help },
  { path: '/employee/empworkreport', name: 'EmpWorkReport', component: EmpWorkReport },
  { path: '/employee/myprofile', name: 'MyProfile', component: MyProfile },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
