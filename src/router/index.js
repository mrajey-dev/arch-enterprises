import { createRouter, createWebHistory } from 'vue-router'
import { checkInactivity } from '../utils/sessionTimeout.js'
import NotFound from '../views/NotFound.vue'
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
import SupplyItems from '../views/SupplyItems.vue'
import SalarySlip from '../views/SalarySlip.vue'
import sop from '../views/employee/sop.vue'
import holiday from '../views/holiday.vue'

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
import ArchCalendar from '../views/ArchCalendar.vue'
import OfferLetter from '../views/OfferLetter.vue'
import OfferLetterList from '../views/OfferLetterList.vue'
import PerformancePage from '../views/PerformancePage.vue'
import EmployeePerformance from '../views/employee/PerformancePage.vue'
import MyLeaveBalance from '../views/employee/MyLeaveBalance.vue'

import ManageDepartments from '../views/ManageDepartments.vue'
import EmployeeDashboard from '../views/employee/Dashboard.vue'
import MyTask from '../views/employee/MyTask.vue'
import ApplyLeave from '../views/employee/ApplyLeave.vue'

import Report from '../views/employee/Report.vue'
import FollowUp from '../views/employee/FollowUp.vue'
import AmcRecord from '../views/employee/AmcRecord.vue'

import EmpWorkReport from '../views/employee/EmpWorkReport.vue'
import RequestDeskemp from '../views/employee/request.vue'
import ResourceBookingEmp from '../views/employee/ResourceBooking.vue'
import ArchCalendarEmp from '../views/employee/ArchCalendarEmp.vue'
import LiteraTure from '../views/employee/LiteraTure.vue'

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
import ViewKra from '../views/employee/ViewKra.vue'
import CustomerRegistrations from '../views/employee/CustomerRegistrations.vue'
import VisitSchedule from '../views/employee/VisitSchedule.vue'
import MyDsi from '../views/employee/MyDsi.vue'
import Help from '../views/employee/Help.vue'
import QuotationReport from '../views/QuotationReport.vue'
import SalaryAdvances from '../views/SalaryAdvances.vue'
import MySalaryAdvances from '../views/employee/MySalaryAdvances.vue'
import MyProfile from '../views/employee/MyProfile.vue'
import WeeklyWorkingSchedule from '../views/employee/WeeklyWorkingSchedule.vue'

// Newly Extracted Standalone Pages
import AmcVisitsPage from '../views/employee/AmcVisitsPage.vue'
import ServiceOrdersPage from '../views/employee/ServiceOrdersPage.vue'
import MaterialSupplyPage from '../views/employee/MaterialSupplyPage.vue'
import ViewAllPo from '../views/employee/ViewAllPo.vue'
import SiteOwnership from '../views/employee/SiteOwnership.vue'

const routes = [
  {
    path: '/',
    component: AuthForm,
    meta: {
      hideHeader: true,
      hideBell: true,
      hideHelp: true,
      hideMenu: true
    }
  },
  {
    path: '/auth',
    component: AuthForm,
    meta: {
      hideHeader: true,
      hideBell: true,
      hideHelp: true,
      hideMenu: true
    }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      hideBell: true,
      hideMenu: true
    }
  },
  {
    path: '/meet/:id',
    alias: ['/meeting/:id', '/room/:id', '/join/:id'],
    name: 'MeetingRoom',
    component: () => import('../views/MeetingRoom.vue'),
    meta: {
      public: true,
      requiresAuth: false,
      hideBell: true,
      hideMenu: true,
      hideHeader: true
    }
  },

  { path: '/ScheduleMeeting', name: 'ScheduleMeeting', component: ScheduleMeeting, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/holidays', name: 'Holiday', component: holiday, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/employees', name: 'ManageEmp', component: Employee, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/workflow', name: 'WorkFlow', component: WorkFlow, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/ExpenseManage', alias: ['/expensemanage', '/it-expenses', '/itexpenses'], name: 'ExpenseManage', component: ExpenseManage, meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/TimeSheet', name: 'TimeSheet', component: TimeSheet, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/ResourceBooking', alias: ['/resourcebooking', '/resource-booking'], name: 'ResourceBooking', component: ResourceBooking, meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/RequestDesk', name: 'RequestDesk', component: RequestDesk, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/RecruitmentSection', name: 'RecruitmentSection', component: RecruitmentSection, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/ArchCalendar', name: 'ArchCalendar', component: ArchCalendar, meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/salaryadvances', name: 'SalaryAdvances', component: SalaryAdvances, meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/employee/mysalaryadvances', name: 'MySalaryAdvances', component: MySalaryAdvances, meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/OfferLetter', name: 'OfferLetter', component: OfferLetter, meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/SupplyItems', name: 'SupplyItems', component: SupplyItems, meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  {
    path: '/OfferLetterList',
    name: 'OfferLetterList',
    component: OfferLetterList,
    meta: { requiresAuth: true, hideBell: true, hideMenu: true }
  },
  {
    path: '/performance',
    name: 'Performance',
    component: PerformancePage,
    meta: { requiresAuth: true, hideBell: true, hideMenu: true }
  },
  {
    path: '/revenue-analytics',
    alias: ['/revenue', '/financial-analytics'],
    name: 'RevenueAnalytics',
    component: () => import('../views/RevenueAnalytics.vue'),
    meta: { requiresAuth: true, hideBell: true, hideMenu: true }
  },
  { path: '/employee/performance', name: 'EmployeePerformance', component: PerformancePage, meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/employee/ETPSession', name: 'ETPSession', component: () => import('../views/employee/ETPSession.vue'), meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  {
    path: '/OfferLetter/:id?',
    name: 'OfferLetterDetail',
    component: OfferLetter,
    meta: { requiresAuth: true, hideBell: true, hideMenu: true }
  },

  { path: '/settings', name: 'Settings', component: Settings, meta: { hideBell: true, adminOnly: true, hideMenu: true } },
  { path: '/leaveapplications', name: 'LeaveApplications', component: LeaveApplications, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/approvedleaves', name: 'ApprovedLeaves', component: ApprovedLeaves, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/rejectedleaves', name: 'RejectedLeaves', component: RejectedLeaves, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/pendingleaves', name: 'PendingLeaves', component: PendingLeaves, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/manageleavetype', name: 'ManageLeavetype', component: ManageLeavetype, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/MyApps', alias: ['/myapps', '/employee/myapps', '/apps'], name: 'MyApps', component: () => import('../views/MyApps.vue'), meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/ArchApps', alias: ['/archapps', '/employee/archapps'], name: 'ArchApps', component: () => import('../views/employee/ArchApps.vue'), meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/employee/vault', alias: ['/vault', '/employee/security-vault', '/hr/vault', '/admin/vault', '/security-vault', '/hr/security-vault'], name: 'SecurityVault', component: () => import('../views/employee/Vault.vue'), meta: { requiresAuth: true, hideBell: true, hideMenu: true } },

  { path: '/employee/ManageStock', name: 'ManageStock', component: () => import('../views/employee/ManageStock.vue'), meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/customerregistration', name: 'CustomerRegistration', component: CustomerRegistration, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/salaryslip', name: 'SalarySlip', component: SalarySlip, meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  {
    path: '/quotation',
    name: 'Quotation',
    component: Quotation,
    meta: {
      public: true,
      requiresAuth: false,
      adminOnly: false,
      hideBell: true,
      hideHelp: true,
      hideMenu: true,
      hideHeader: true
    }
  },

  {
    path: '/employee/quotations',
    alias: ['/quotations', '/all-quotations', '/employee/all-quotations', '/quotations-list'],
    name: 'ViewAllQuotations',
    component: () => import('@/views/ViewAllQuotations.vue'),
    meta: { requiresAuth: true }
  },

  { path: '/managedepartments', name: 'ManageDepartments', component: ManageDepartments, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/assigntask', name: 'AssignTask', component: AssignTask, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/announcement', name: 'Announcement', component: Announcement, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/workreport', name: 'WorkReport', component: WorkReport, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/empattendanceadmin', name: 'empattendanceadmin', component: EmpAttendanceAdmin, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/empdsi', name: 'EmpDsi', component: EmpDsi, meta: { requiresAuth: true, adminOnly: true, hideBell: true, hideMenu: true } },
  { path: '/rcahelp', name: 'RCAhelp', component: RCAhelp, meta: { hideBell: true, adminOnly: true, hideMenu: true } },

  // ───── EMPLOYEE SECTION ─────
  { path: '/employee/dashboard', name: 'EmployeeDashboard', component: EmployeeDashboard, meta: { requiresAuth: true } },
  { path: '/employee/mytask', name: 'MyTask', component: MyTask, meta: { requiresAuth: true } },
  { path: '/employee/weeklyworkingschedule', name: 'WeeklyWorkingSchedule', component: WeeklyWorkingSchedule, meta: { requiresAuth: true } },
  { path: '/employee/applyleave', name: 'ApplyLeave', component: ApplyLeave, meta: { requiresAuth: true } },
  { path: '/employee/viewannouncement', name: 'ViewAnnouncement', component: ViewAnnouncement, meta: { requiresAuth: true } },

  { path: '/employee/approvedleavesemp', name: 'ApprovedLeavesEmp', component: ApprovedLeavesEmp, meta: { requiresAuth: true } },
  { path: '/employee/rejectedleavesemp', name: 'RejectedLeavesEmp', component: RejectedLeavesEmp, meta: { requiresAuth: true } },
  { path: '/employee/leaveapplicationsemp', name: 'LeaveApplicationsEmp', component: LeaveApplicationsEmp, meta: { requiresAuth: true } },
  { path: '/employee/pendingleaves', name: 'PendingLeavesEmp', component: PendingLeavesEmp, meta: { requiresAuth: true } },
  { path: '/employee/empattendance', name: 'empattendance', component: EmpAttendance, meta: { requiresAuth: true } },
  { path: '/employee/archcalendar', name: 'ArchCalendarEmp', component: ArchCalendarEmp, meta: { requiresAuth: true } },
  { path: '/employee/viewkra', name: 'ViewKra', component: ViewKra, meta: { requiresAuth: true } },
  { path: '/employee/amc-visits', alias: ['/employee/amc-visits-page', '/amc-visits', '/amc'], name: 'AmcVisitsPage', component: AmcVisitsPage, meta: { requiresAuth: true } },
  { path: '/employee/service-orders', alias: ['/employee/service-orders-page', '/service-orders', '/service-orders-page'], name: 'ServiceOrdersPage', component: ServiceOrdersPage, meta: { requiresAuth: true } },
  { path: '/employee/material-supply', alias: ['/employee/material-supply-orders', '/material-supply', '/material-supply-orders'], name: 'MaterialSupplyPage', component: MaterialSupplyPage, meta: { requiresAuth: true } },
  { path: '/employee/siteownership', name: 'SiteOwnership', component: SiteOwnership, meta: { requiresAuth: true } },
  { path: '/employee/site-ownership', name: 'SiteOwnershipHyphen', component: SiteOwnership, meta: { requiresAuth: true } },
  { path: '/employee/report', name: 'Report', component: Report, meta: { requiresAuth: true } },
  { path: '/employee/customerregistrations', name: 'CustomerRegistrations', component: CustomerRegistrations, meta: { requiresAuth: true } },
  { path: '/employee/literature', name: 'LiteraTure', component: LiteraTure, meta: { requiresAuth: true } },
  { path: '/employee/visitschedule', name: 'VisitSchedule', component: VisitSchedule, meta: { requiresAuth: true } },
  { path: '/employee/MobileAppLifeCycle', name: 'MobileAppLifeCycle', component: () => import('../views/employee/MobileAppLifeCycle.vue'), meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/employee/socialmediamanagement', alias: ['/employee/SocialMediaManagement'], name: 'SocialMediaManagement', component: () => import('../views/employee/SocialMediaManagement.vue'), meta: { requiresAuth: true } },
  { path: '/employee/SpinTheWheel', name: 'SpinTheWheel', component: () => import('../views/employee/SpinTheWheel.vue'), meta: { requiresAuth: true, hideBell: true, hideMenu: true } },
  { path: '/employee/request', alias: '/employee/Request', name: 'RequestDeskemp', component: RequestDeskemp, meta: { requiresAuth: true } },
  { path: '/employee/Resourcebooking', alias: ['/employee/resourcebooking', '/employee/ResourceBooking', '/employee/resource-booking'], name: 'ResourceBookingEmp', component: ResourceBookingEmp, meta: { requiresAuth: true } },
  { path: '/employee/it-expenses', alias: ['/employee/itexpenses', '/employee/ExpenseManage', '/employee/expensemanage', '/employee/expenses'], name: 'EmployeeITExpenses', component: ExpenseManage, meta: { requiresAuth: true } },
  {
    path: '/employee/followup',
    name: 'FollowUp',
    component: FollowUp,
    meta: { requiresAuth: true, hideBell: true, hideHeader: true, hideSidebar: true, hideMenu: true }
  },
  { path: '/employee/myleavebalance', name: 'MyLeaveBalance', component: MyLeaveBalance, meta: { requiresAuth: true } },
  {
    path: '/employee/sop',
    name: 'sop',
    component: sop,
    meta: { requiresAuth: true }
  },
  {
    path: '/employee/AmcRecord',
    name: 'AmcRecord',
    component: AmcRecord,
    meta: { requiresAuth: true, hideBell: true, hideHeader: true }
  },
  { path: '/employee/viewallpo', name: 'ViewAllPo', component: ViewAllPo, meta: { requiresAuth: true } },
  { path: '/employee/mydsi', name: 'MyDsi', component: MyDsi, meta: { requiresAuth: true } },
  { path: '/employee/help', name: 'Help', component: Help, meta: { requiresAuth: true } },
  { path: '/employee/empworkreport', name: 'EmpWorkReport', component: EmpWorkReport, meta: { requiresAuth: true } },
  { path: '/employee/lead-management', alias: ['/lead-management', '/employee/leads', '/leads'], name: 'LeadManagement', component: () => import('../views/employee/LeadManagement.vue'), meta: { requiresAuth: true, hideMenu: true, hideSidebar: true } },
  { path: '/employee/lead-details', alias: ['/lead-details', '/employee/lead-360'], name: 'LeadDetails', component: () => import('../views/employee/LeadDetails.vue'), meta: { requiresAuth: true, hideMenu: true, hideSidebar: true } },
  { path: '/employee/daily-sales-report', alias: ['/daily-sales-report', '/employee/sales-report', '/today-sales-report', '/daily-report'], name: 'DailySalesReport', component: () => import('../views/employee/DailySalesReport.vue'), meta: { requiresAuth: true, hideMenu: true, hideSidebar: true } },
  { path: '/employee/client-quotations', alias: ['/client-quotations'], name: 'ClientQuotations', component: () => import('../views/employee/ClientQuotations.vue'), meta: { requiresAuth: true, hideMenu: true } },
  { path: '/employee/myprofile', alias: ['/myprofile', '/profile', '/employee/profile', '/employee/MyProfile'], name: 'MyProfile', component: MyProfile, meta: { requiresAuth: true } },
  {
    path: '/quotation-report',
    name: 'QuotationReport',
    component: QuotationReport,
    meta: { requiresAuth: true, hideBell: true, hideMenu: true, hideHeader: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: {
      public: true,
      requiresAuth: false,
      hideBell: true,
      hideMenu: true,
      hideHeader: true,
      hideSidebar: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // If navigating directly to 404, allow immediately
  if (to.path === '/404') {
    return next();
  }

  // Check 8-hour inactivity timeout if navigating
  if (to.path !== '/auth' && to.path !== '/') {
    if (checkInactivity()) {
      return next('/auth');
    }
  }

  // ✅ 1. Always allow public routes FIRST
  if (to.meta.public === true) {
    return next();
  }

  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = (user?.role || '').toLowerCase().trim();
  const dept = (user?.department || '').toLowerCase().trim();
  const normDept = dept.replace(/[\s_-]+/g, '');

  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'owner' || normDept === 'admin';
  const isHr = role === 'hr' || normDept === 'hr' || normDept === 'humanresources';
  const isHrOrAdmin = isAdmin || isHr;

  // 🔐 2. Auth-required routes
  if (to.meta.requiresAuth && !token) {
    return next('/auth');
  }

  // 🛑 3. Admin-only routes (redirect non-admins to /404)
  if (to.meta.adminOnly === true && !isAdmin) {
    return next('/404');
  }

  // 🛑 4. HR / Admin restricted routes:
  // When logged in as HR or Admin, employee-only personal task / operational pages automatically redirect to 404
  if (isHrOrAdmin) {
    const cleanPath = (to.path || '').toLowerCase().replace(/^\/+|\/+$/g, '');
    const hrForbiddenRoutes = [
      'employee/mytask',
      'employee/weeklyworkingschedule',
      'employee/empattendance',
      'employee/viewkra',
      'employee/amc-visits',
      'employee/service-orders',
      'employee/material-supply',
      'employee/siteownership',
      'employee/site-ownership',
      'employee/report',
      'employee/customerregistrations',
      'employee/literature',
      'employee/visitschedule',
      'employee/mobileapplifecycle',
      'employee/empworkreport',
      'employee/daily-sales-report',
      'employee/client-quotations',
      'employee/mydsi',
      'employee/viewallpo'
    ];

    if (hrForbiddenRoutes.some(r => cleanPath === r || cleanPath.startsWith(r + '/'))) {
      return next('/404');
    }
  }

  next();
});

export default router
