import { createRouter, createWebHistory } from 'vue-router'
import AuthForm from '../views/AuthForm.vue'
import Dashboard from '../views/Dashboard.vue'
import Employee from '../views/ManageEmp.vue'
import WorkFlow from '../views/WorkFlow.vue'
import ExpenseManage from '../views/ExpenseManage.vue'
import TimeSheet from '../views/TimeSheet.vue'
import ResourceBooking from '../views/ResourceBooking.vue'
import RequestDesk from '../views/RequestDesk.vue'
import RecruitmentSection from '../views/RecruitmentSection.vue'
import ScheduleMeeting from '../views/ScheduleMeeting.vue'






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
import AmcRecord from '../views/employee/AmcRecord.vue'

import ViewAllPo from '../views/employee/ViewAllPo.vue'
import EmpWorkReport from '../views/employee/EmpWorkReport.vue'
import RequestDeskemp from '../views/employee/Request.vue'
import ResourceBookingEmp from '../views/employee/ResourceBooking.vue'



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
  { path: '/', component: AuthForm, meta: { hideBell: true, hideHelp: true } },
  { path: '/auth', component: AuthForm, meta: { hideBell: true, hideHelp: true } },

  {
  path: '/dashboard',
  component: Dashboard,
  meta: {
    requiresAuth: true,
    hideBell: true
  }
},
{
  path: '/meeting/:id',
  name: 'MeetingRoom',
  component: () => import('../views/MeetingRoom.vue'),
  meta: { requiresAuth: true, hideBell: true  }
},


{path:'/ScheduleMeeting',name:'ScheduleMeeting',component:ScheduleMeeting,meta:{requiresAuth: true, adminOnly: true, hideBell:true}},
  { path: '/employees', name: 'ManageEmp', component: Employee, meta: { requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/workflow', name: 'WorkFlow', component: WorkFlow, meta: { requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/ExpenseManage', name: 'ExpenseManage', component: ExpenseManage, meta: {requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/TimeSheet', name: 'TimeSheet', component: TimeSheet, meta: { requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/ResourceBooking', name: 'ResourceBooking', component: ResourceBooking, meta: {requiresAuth: true, adminOnly:true,  hideBell: true } },
  { path: '/RequestDesk', name: 'RequestDesk', component: RequestDesk, meta: { requiresAuth: true, adminOnly:true, hideBell: true } },
  { path: '/RecruitmentSection', name: 'RecruitmentSection', component: RecruitmentSection, meta: { requiresAuth: true, adminOnly:true, hideBell: true } },






  { path: '/settings', name: 'Settings', component: Settings, meta: { hideBell: true, adminOnly: true } },

  { path: '/leaveapplications', name: 'LeaveApplications', component: LeaveApplications, meta:{ requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/approvedleaves', name: 'ApprovedLeaves', component: ApprovedLeaves, meta: { requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/rejectedleaves', name: 'RejectedLeaves', component: RejectedLeaves, meta: { requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/pendingleaves', name: 'PendingLeaves', component: PendingLeaves, meta: { requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/manageleavetype', name: 'ManageLeavetype', component: ManageLeavetype, meta: { requiresAuth: true, adminOnly:true, hideBell: true } },

  { path: '/customerregistration', name: 'CustomerRegistration', component: CustomerRegistration, meta: {requiresAuth: true, adminOnly: true, hideBell: true } },

{
  path: '/quotation',
  name: 'Quotation',
  component: Quotation,
  meta: {
    public: true,
    requiresAuth: false,
    adminOnly: false,
    hideBell: true,
    hideHelp: true
  }
},



  {
  path: '/employee/quotations',
  component: () => import('@/views/ViewAllQuotations.vue')
},


  { path: '/managedepartments', name: 'ManageDepartments', component: ManageDepartments, meta: {requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/assigntask', name: 'AssignTask', component: AssignTask, meta: { requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/announcement', name: 'Announcement', component: Announcement, meta: { requiresAuth: true, adminOnly: true, hideBell: true } },
  { path: '/workreport', name: 'WorkReport', component: WorkReport, meta: { requiresAuth: true, adminOnly:true, hideBell: true } },
  { path: '/empattendanceadmin', name: 'empattendanceadmin', component: EmpAttendanceAdmin, meta: { requiresAuth: true, adminOnly:true, hideBell: true } },
  { path: '/empdsi', name: 'EmpDsi', component: EmpDsi, meta: { requiresAuth: true, adminOnly:true, hideBell:true } },
  { path: '/rcahelp', name: 'RCAhelp', component: RCAhelp, meta: { hideBell: true, adminOnly: true } },

  // ───── EMPLOYEE SECTION ─────
  { path: '/employee/dashboard', name: 'EmployeeDashboard', component: EmployeeDashboard, meta: { requiresAuth: true } },
  { path: '/employee/mytask', name: 'MyTask', component: MyTask, meta: { requiresAuth: true } },
  { path: '/employee/myperformance', name: 'MyPerformance', component: MyPerformance, meta: { requiresAuth: true } },
  { path: '/employee/applyleave', name: 'ApplyLeave', component: ApplyLeave, meta: { requiresAuth: true } },
  { path: '/employee/viewannouncement', name: 'ViewAnnouncement', component: ViewAnnouncement, meta: { requiresAuth: true } },

  { path: '/employee/approvedleavesemp', name: 'ApprovedLeavesEmp', component: ApprovedLeavesEmp, meta: { requiresAuth: true } },
  { path: '/employee/rejectedleavesemp', name: 'RejectedLeavesEmp', component: RejectedLeavesEmp, meta: { requiresAuth: true } },
  { path: '/employee/leaveapplicationsemp', name: 'LeaveApplicationsEmp', component: LeaveApplicationsEmp, meta: { requiresAuth: true } },
  { path: '/employee/pendingleaves', name: 'PendingLeavesEmp', component: PendingLeavesEmp, meta: { requiresAuth: true } },
  { path: '/employee/empattendance', name: 'empattendance', component: EmpAttendance, meta: { requiresAuth: true } },

  { path: '/employee/viewkra', name: 'ViewKra', component: ViewKra, meta: { requiresAuth: true } },  // Add this line
  { path: '/employee/report', name: 'Report', component: Report, meta: { requiresAuth: true } },
  { path: '/employee/customerregistrations', name: 'CustomerRegistrations', component: CustomerRegistrations, meta: { requiresAuth: true } },
  { path: '/employee/visitschedule', name: 'VisitSchedule', component: VisitSchedule, meta: { requiresAuth: true } },
{ path: '/employee/Request', name: 'RequestDeskemp', component: RequestDeskemp, meta: { requiresAuth: true } },
{ path: '/employee/Resourcebooking', name: 'ResourceBookingEmp', component: ResourceBookingEmp, meta: { requiresAuth: true } },
  // 🔔 Bell hidden here also
  { 
    path: '/employee/followup',
    name: 'FollowUp',
    component: FollowUp,
    meta: {requiresAuth: true, hideBell: true }
  },
  { 
    path: '/employee/AmcRecord',
    name: 'AmcRecord',
    component: AmcRecord,
    meta: { requiresAuth: true, hideBell: true }
  },
  { path: '/employee/viewallpo', name: 'ViewAllPo', component: ViewAllPo, meta: { requiresAuth: true } },
  { path: '/employee/mydsi', name: 'MyDsi', component: MyDsi, meta: { requiresAuth: true } },
  { path: '/employee/help', name: 'Help', component: Help, meta: { requiresAuth: true } },
  { path: '/employee/empworkreport', name: 'EmpWorkReport', component: EmpWorkReport, meta: { requiresAuth: true } },
  { path: '/employee/myprofile', name: 'MyProfile', component: MyProfile },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})
router.beforeEach((to, from, next) => {
  // ✅ 1. Always allow public routes FIRST
  if (to.meta.public === true) {
    return next();
  }

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = user?.role?.toLowerCase();

  // 🔐 2. Auth-required routes
  if (to.meta.requiresAuth && !token) {
    return next('/auth');
  }

  // 🛑 3. Admin-only routes
  if (to.meta.adminOnly === true && role !== 'admin') {
    return next('/auth');
  }

  next();
});



export default router
