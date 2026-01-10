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
  { path: '/', component: AuthForm },         // or Home if you want
  { path: '/auth', component: AuthForm },
  { path: '/dashboard', component: Dashboard,   meta: { requiresAuth: true }},
  { path: '/employees', name: 'ManageEmp', component: Employee },
  { path: '/settings', name: 'Settings', component: Settings },
    { path: '/leaveapplications', name: 'LeaveApplications', component: LeaveApplications },
    {path: '/approvedleaves' , name: 'ApprovedLeaves', component: ApprovedLeaves },
    {path: '/rejectedleaves' , name: 'RejectedLeaves', component: RejectedLeaves },
    {path: '/pendingleaves' , name: 'PendingLeaves', component: PendingLeaves },
    {path: '/manageleavetype' , name: 'ManageLeavetype', component: ManageLeavetype },
    {path: '/customerregistration' , name: 'CustomerRegistration', component: CustomerRegistration },
    {path: '/quotation', name: 'Quotation', component: Quotation},

    {path: '/managedepartments' , name: 'ManageDepartments', component: ManageDepartments },
    {path: '/assigntask' , name: 'AssignTask', component: AssignTask },
    {path: '/announcement' , name: 'Announcement', component: Announcement },
    {path: '/workreport' , name: 'WorkReport', component: WorkReport },
    {path: '/empattendanceadmin' , name: 'empattendanceadmin', component: EmpAttendanceAdmin },
 {path: '/empdsi' , name: 'EmpDsi', component: EmpDsi },
 {path: '/rcahelp' , name: 'RCAhelp', component: RCAhelp },
   





    


    // employee section 
    // {path: '/employee/dailyworkreport' , name: 'DailyWorkReport', component: DailyWorkReport },
    {path: '/employee/mytask' , name: 'MyTask', component: MyTask },
    {path: '/employee/myperformance' , name: 'MyPerformance', component: MyPerformance },
    {path: '/employee/applyleave' , name: 'ApplyLeave', component: ApplyLeave },
   
    {path: '/employee/ViewAnnouncement' , name: 'ViewAnnouncement', component: ViewAnnouncement },
    {path: '/employee/approvedleavesemp' , name: 'ApprovedLeavesEmp', component: ApprovedLeavesEmp },
    {path: '/employee/rejectedleavesemp' , name: 'RejectedLeavesEmp', component: RejectedLeavesEmp },
    { path: '/employee/leaveapplicationsemp', name: 'LeaveApplicationsEmp', component: LeaveApplicationsEmp },
    {path: '/employee/pendingleaves' , name: 'PendingLeavesEmp', component: PendingLeavesEmp },
    {path: '/employee/empattendance' , name: 'empattendance', component: EmpAttendance },
     { path: '/employee/viewkra', name: 'ViewKra', component: ViewKra },  // 👈 New route
    {path: '/employee/report' , name: 'Report', component: Report },
    {path: '/employee/customerregistrations' , name: 'CustomerRegistrations', component: CustomerRegistrations },
    {path: '/employee/visitschedule' , name: 'VisitSchedule', component: VisitSchedule },
 {path: '/employee/followup' , name: 'FollowUp', component: FollowUp },
 {path: '/employee/viewallpo' , name: 'ViewAllPo', component: ViewAllPo },

 {path: '/employee/mydsi' , name: 'MyDsi', component: MyDsi },
 {path: '/employee/help' , name: 'Help', component: Help },
    {path: '/employee/empworkreport' , name: 'EmpWorkReport', component: EmpWorkReport },
 


 {path: '/employee/myprofile' , name: 'MyProfile', component: MyProfile },





    



{
  path: '/employee/dashboard',
  name: 'EmployeeDashboard',
  component: EmployeeDashboard
}




]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
