<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
        
          <div class="mobile-title">
            <i class="fas fa-calendar-alt"></i>
            <span>Leave Applications</span>
          </div>
          <div class="mobile-pending-badge">
            <i class="fas fa-clock"></i>
            <span>{{ pendingCount }}</span>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div>
              <h1>Leave Applications</h1>
              <p class="subtitle-modern">Manage and review employee leave requests</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-clock"></i>
            <span>Pending: {{ pendingCount }}</span>
          </div>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card" @click="filterByStatus('Pending')">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
          <div class="stat-card success" @click="filterByStatus('Approved')">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ approvedCount }}</span>
              <span class="stat-label">Approved</span>
            </div>
          </div>
          <div class="stat-card danger" @click="filterByStatus('Rejected')">
            <i class="fas fa-times-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ rejectedCount }}</span>
              <span class="stat-label">Rejected</span>
            </div>
          </div>
        </div>

        <!-- Search - Mobile -->
        <div class="search-bar-mobile" v-if="isMobile && leaveRequests.length > 0">
          <div class="search-group-mobile">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Search employees..." class="search-input-mobile" />
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loadingLeaves" class="loading-container">
          <div class="spinner"></div>
          <p>Loading leave requests...</p>
        </div>

        <!-- Leave Table - Mobile Optimized -->
        <div v-else class="table-wrapper-premium">
          <div class="table-header">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-list-ul"></i>
                <span>Leave Requests</span>
                <span class="record-count-mobile" v-if="isMobile">{{ visibleLeaves.length }}</span>
              </div>
            </div>
            <div class="table-info desktop-only">
              <i class="fas fa-file-alt"></i>
              <span>{{ visibleLeaves.length }} of {{ sortedLeaves.length }} requests</span>
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="leave in visibleLeaves" :key="leave.id" class="leave-card">
              <div class="card-header">
                <div class="employee-info-card">
                  <div class="employee-avatar">
                    {{ getInitials(leave.name) }}
                  </div>
                  <div>
                    <div class="employee-name">{{ formatName(leave.name) }}</div>
                    <span class="dept-badge-mobile">{{ leave.department }}</span>
                  </div>
                </div>
                <span :class="['status-badge-mobile', getStatusClass(leave.status)]">
                  <i :class="getStatusIcon(leave.status)"></i>
                  {{ leave.status }}
                </span>
              </div>

              <div class="card-body">
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-tag"></i> Leave Type</span>
                  <span :class="['leave-type-badge-mobile', getLeaveTypeClass(leave.leaveType)]">
                    <i :class="getLeaveTypeIcon(leave.leaveType)"></i>
                    {{ leave.leaveType }}
                  </span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-align-left"></i> Reason</span>
                  <span class="card-value reason-text">{{ truncateText(leave.reason, 40) }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-calendar-alt"></i> From</span>
                  <span class="card-value">{{ formatDate(leave.fromDate) }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-calendar-check"></i> To</span>
                  <span class="card-value">{{ formatDate(leave.toDate) }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button
                  v-if="leave.status === 'Pending' || leave.status === 'Rejected'"
                  class="card-action-btn approve"
                  :title="leave.status === 'Rejected' ? 'Re-approve leave' : 'Approve'"
                  @click="approveLeave(leave)"
                  :disabled="busyLeave.id === leave.id"
                >
                  <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Approved'" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-check-circle"></i>
                  Approve
                </button>
                
                <button
                  v-if="leave.status === 'Pending' || leave.status === 'Approved'"
                  class="card-action-btn reject"
                  :title="leave.status === 'Approved' ? 'Revoke approval and reject' : 'Reject'"
                  @click="rejectLeave(leave)"
                  :disabled="busyLeave.id === leave.id"
                >
                  <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Rejected'" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-times-circle"></i>
                  Reject
                </button>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="visibleLeaves.length === 0" class="empty-state-mobile">
              <i class="fas fa-calendar-times"></i>
              <h4>{{ searchQuery || statusFilter ? 'No Matching Requests' : 'No Leave Requests' }}</h4>
              <p>{{ searchQuery || statusFilter ? 'Try adjusting your filters' : 'No leave applications found at the moment' }}</p>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-container" v-else>
            <table class="leave-table-premium">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Reason</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="leave in visibleLeaves" :key="leave.id">
                  <td class="employee-cell">
                    <div class="employee-info">
                      <div class="employee-avatar">
                        {{ getInitials(leave.name) }}
                      </div>
                      <span class="employee-name">{{ formatName(leave.name) }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="dept-badge">{{ leave.department }}</span>
                  </td>
                  <td>
                    <span :class="['leave-type-badge', getLeaveTypeClass(leave.leaveType)]">
                      <i :class="getLeaveTypeIcon(leave.leaveType)"></i>
                      {{ leave.leaveType }}
                    </span>
                  </td>
                  <td class="reason-cell">{{ leave.reason }}</td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-day"></i> {{ formatDate(leave.fromDate) }}
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-day"></i> {{ formatDate(leave.toDate) }}
                  </td>
                  <td>
                    <span :class="['status-badge-premium', getStatusClass(leave.status)]">
                      <i :class="getStatusIcon(leave.status)"></i>
                      {{ leave.status }}
                    </span>
                  </td>
                  <td>
                    <div class="action-group">
                      <button
                        v-if="leave.status === 'Pending' || leave.status === 'Rejected'"
                        class="action-btn approve"
                        :title="leave.status === 'Rejected' ? 'Re-approve leave' : 'Approve'"
                        @click="approveLeave(leave)"
                        :disabled="busyLeave.id === leave.id"
                      >
                        <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Approved'" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-check-circle"></i>
                      </button>
                      
                      <button
                        v-if="leave.status === 'Pending' || leave.status === 'Approved'"
                        class="action-btn reject"
                        :title="leave.status === 'Approved' ? 'Revoke approval and reject' : 'Reject'"
                        @click="rejectLeave(leave)"
                        :disabled="busyLeave.id === leave.id"
                      >
                        <i v-if="busyLeave.id === leave.id && busyLeave.action === 'Rejected'" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-times-circle"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Desktop Empty State -->
                <tr v-if="visibleLeaves.length === 0" class="empty-row">
                  <td colspan="8">
                    <div class="empty-state-premium">
                      <i class="fas fa-calendar-times"></i>
                      <h4>No Leave Requests</h4>
                      <p>No leave applications found at the moment</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Show More Button -->
          <div v-if="visibleLeaveCount < sortedLeaves.length" class="more-btn-wrapper">
            <button class="more-btn-premium" @click="showMoreLeaves">
              <i class="fas fa-chevron-down"></i>
              <span class="btn-text">Show More ({{ sortedLeaves.length - visibleLeaveCount }} remaining)</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  components: { Sidebar },
  data() {
    return {
      loadingLeaves: false,
      busyLeave: { id: null, action: null },
      visibleLeaveCount: 5,
      leaveRequests: [],
      isMobile: false,
      isSidebarVisible: true,
      loggedInUserName: '',
      searchQuery: '',
      statusFilter: '',
    }
  },

  computed: {
    sortedLeaves() {
      return [...this.leaveRequests].sort((a, b) => {
        const dateA = new Date(a.created_at || a.fromDate || 0)
        const dateB = new Date(b.created_at || b.fromDate || 0)
        return dateB - dateA
      })
    },
    visibleLeaves() {
      let filtered = this.sortedLeaves;
      
      if (this.statusFilter) {
        filtered = filtered.filter(l => l.status === this.statusFilter);
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(l => 
          l.name.toLowerCase().includes(query) ||
          (l.department && l.department.toLowerCase().includes(query)) ||
          (l.leaveType && l.leaveType.toLowerCase().includes(query))
        );
      }
      
      return filtered.slice(0, this.visibleLeaveCount);
    },
    pendingCount() {
      return this.leaveRequests.filter(l => l.status === 'Pending').length
    },
    approvedCount() {
      return this.leaveRequests.filter(l => l.status === 'Approved').length
    },
    rejectedCount() {
      return this.leaveRequests.filter(l => l.status === 'Rejected').length
    }
  },

  methods: {
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status;
    },
    truncateText(text, length) {
      if (!text) return '—';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    getInitials(name) {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },

    formatName(name) {
      if (!name) return ''
      return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    },

    formatDate(date) {
      if (!date) return 'N/A'
      try {
        const d = new Date(date)
        if (isNaN(d.getTime())) return date
        return d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (error) {
        return date
      }
    },

    getStatusClass(status) {
      switch (status) {
        case 'Approved': return 'approved'
        case 'Rejected': return 'rejected'
        default: return 'pending'
      }
    },

    getStatusIcon(status) {
      switch (status) {
        case 'Approved': return 'fas fa-check-circle'
        case 'Rejected': return 'fas fa-times-circle'
        default: return 'fas fa-clock'
      }
    },

    getLeaveTypeClass(leaveType) {
      const type = (leaveType || '').toLowerCase()
      if (type.includes('sick')) return 'sick'
      if (type.includes('casual') || type === 'cl') return 'casual'
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'pl'
      if (type.includes('half')) return 'halfday'
      return 'default'
    },

    getLeaveTypeIcon(leaveType) {
      const type = (leaveType || '').toLowerCase()
      if (type.includes('sick')) return 'fas fa-thermometer-half'
      if (type.includes('casual') || type === 'cl') return 'fas fa-coffee'
      if (type.includes('pl') || type.includes('privilege') || type.includes('paid')) return 'fas fa-star'
      if (type.includes('half')) return 'fas fa-adjust'
      return 'fas fa-calendar-alt'
    },

    showMoreLeaves() {
      this.visibleLeaveCount += 5
    },

    calculateLeaveDays(fromDate, toDate, leaveType) {
      try {
        const from = new Date(fromDate)
        const to = new Date(toDate)
        
        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
          console.error('Invalid dates:', fromDate, toDate)
          return 1
        }
        
        from.setHours(0, 0, 0, 0)
        to.setHours(0, 0, 0, 0)
        
        const diffTime = Math.abs(to - from)
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        
        const leaveTypeLower = (leaveType || '').toLowerCase().trim()
        if (leaveTypeLower === 'half day' || leaveTypeLower === 'half-day' || leaveTypeLower.includes('half')) {
          diffDays = 0.5
        }
        
        return diffDays
      } catch (error) {
        console.error('Error calculating days:', error)
        return 1
      }
    },

    mapLeaveTypeToColumn(leaveType) {
      const typeMap = {
        'casual': { used_column: 'used_cl_leave', total_column: 'casual_leave', remaining_column: 'remaining_cl_leave' },
        'cl': { used_column: 'used_cl_leave', total_column: 'casual_leave', remaining_column: 'remaining_cl_leave' },
        'pl': { used_column: 'used_pl_leave', total_column: 'pl_leave', remaining_column: 'remaining_pl_leave' },
        'privilege': { used_column: 'used_pl_leave', total_column: 'pl_leave', remaining_column: 'remaining_pl_leave' },
        'sick': { used_column: 'used_sick_leave', total_column: 'sick_leave', remaining_column: 'remaining_sick_leave' },
        'sl': { used_column: 'used_sick_leave', total_column: 'sick_leave', remaining_column: 'remaining_sick_leave' },
        'unpaid': { used_column: 'used_unpaid_leave', total_column: 'unpaid_leave', remaining_column: 'remaining_unpaid_leave' }
      }
      
      const key = leaveType.toLowerCase().trim()
      for (const [typeKey, mapping] of Object.entries(typeMap)) {
        if (key.includes(typeKey)) {
          return mapping
        }
      }
      
      return null
    },

    async approveLeave(leave) {
      if (this.busyLeave.id) return
      const previousStatus = leave.status
      this.busyLeave = { id: leave.id, action: 'Approved' }

      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No auth token found!')

        const userName = leave.name || this.loggedInUserName
        if (!userName) throw new Error('No valid user name found!')

        let totalDays = this.calculateLeaveDays(leave.fromDate, leave.toDate, leave.leaveType)
        
        console.log('Approving leave:', {
          id: leave.id,
          name: userName,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          leaveType: leave.leaveType,
          totalDays: totalDays
        })

        await axios.patch(
          `https://employees.archenterprises.co.in/api/api/leave-requests/${leave.id}/status`,
          { status: 'Approved' },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const userResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(userName)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        const userId = userResponse.data.id
        console.log('User ID:', userId)
        
        const currentYear = new Date().getFullYear()
        
        const balanceResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/leave-balances/user/${userId}`,
          { 
            params: { year: currentYear },
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        if (!balanceResponse.data.success) {
          throw new Error('Could not fetch leave balance')
        }
        
        const currentBalance = balanceResponse.data.data
        console.log('Current balance:', currentBalance)
        
        const leaveTypeMapping = this.mapLeaveTypeToColumn(leave.leaveType)
        
        if (!leaveTypeMapping) {
          throw new Error(`Unknown leave type: ${leave.leaveType}`)
        }
        
        const currentUsed = parseFloat(currentBalance[leaveTypeMapping.used_column]) || 0
        const totalAllowed = parseFloat(currentBalance[leaveTypeMapping.total_column]) || 0
        const newUsed = currentUsed + totalDays
        
        console.log('Leave balance update:', {
          currentUsed,
          totalAllowed,
          totalDays,
          newUsed,
          column: leaveTypeMapping.used_column
        })
        
        const updateData = {
          [leaveTypeMapping.used_column]: parseFloat(newUsed.toFixed(2))
        }
        
        console.log('Updating balance with:', updateData)
        
        await axios.put(
          `https://employees.archenterprises.co.in/api/api/leave-balances/${currentBalance.id}`,
          updateData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (newUsed > totalAllowed) {
          toastWarning(`Warning: This will exceed ${leave.leaveType} leave limit! Remaining: ${(totalAllowed - currentUsed).toFixed(1)} days`)
        }
        
        if (previousStatus !== 'Approved') {
          await this.createLeaveRecord(leave, userId, totalDays)
        }
        
        if (previousStatus === 'Rejected' || previousStatus === 'Pending') {
          await this.markAttendanceAsLeave(leave, userId)
        }
        
        if (previousStatus === 'Rejected') {
          await this.deleteAbsentRecords(leave)
        }
        
        toastSuccess(`Leave approved successfully! ${totalDays} day(s) deducted from ${leave.leaveType} leave balance`)

        await this.fetchLeaves()

      } catch (error) {
        console.error('Approve leave failed:', error)
        toastError(error.response?.data?.message || error.message || 'Could not approve leave')
      } finally {
        this.busyLeave = { id: null, action: null }
      }
    },

    async rejectLeave(leave) {
      if (this.busyLeave.id) return
      const previousStatus = leave.status
      this.busyLeave = { id: leave.id, action: 'Rejected' }

      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No auth token found!')

        const userName = leave.name || this.loggedInUserName
        console.log('Rejecting leave:', {
          id: leave.id,
          name: userName,
          previousStatus: previousStatus
        })

        await axios.patch(
          `https://employees.archenterprises.co.in/api/api/leave-requests/${leave.id}/status`,
          { status: 'Rejected' },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (previousStatus === 'Approved') {
          const totalDays = this.calculateLeaveDays(leave.fromDate, leave.toDate, leave.leaveType)
          
          const userResponse = await axios.get(
            `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(userName)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          
          const userId = userResponse.data.id
          const currentYear = new Date().getFullYear()
          
          const balanceResponse = await axios.get(
            `https://employees.archenterprises.co.in/api/api/leave-balances/user/${userId}`,
            { 
              params: { year: currentYear },
              headers: { Authorization: `Bearer ${token}` }
            }
          )
          
          if (balanceResponse.data.success) {
            const currentBalance = balanceResponse.data.data
            const leaveTypeMapping = this.mapLeaveTypeToColumn(leave.leaveType)
            
            if (leaveTypeMapping) {
              const currentUsed = parseFloat(currentBalance[leaveTypeMapping.used_column]) || 0
              const newUsed = Math.max(0, currentUsed - totalDays)
              
              console.log('Reverting leave balance:', {
                currentUsed,
                totalDays,
                newUsed
              })
              
              await axios.put(
                `https://employees.archenterprises.co.in/api/api/leave-balances/${currentBalance.id}`,
                {
                  [leaveTypeMapping.used_column]: parseFloat(newUsed.toFixed(2))
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )
            }
          }
          
          await this.deleteLeaveRecords(leave)
          toastSuccess(`Leave rejected and ${totalDays} day(s) added back to balance`)
        } else {
          toastSuccess('Leave rejected successfully')
        }

        if (previousStatus !== 'Rejected') {
          await this.markAttendanceAsAbsent(leave)
        }

        await this.fetchLeaves()

      } catch (error) {
        console.error('Reject failed:', error)
        toastError(error.response?.data?.message || error.message || 'Could not reject leave')
      } finally {
        this.busyLeave = { id: null, action: null }
      }
    },

    async markAttendanceAsLeave(leave, userId) {
      try {
        const token = localStorage.getItem('token')
        
        console.log('Marking attendance as Leave for:', {
          name: leave.name,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          leaveType: leave.leaveType
        })

        await axios.post(
          'https://employees.archenterprises.co.in/api/api/mark-attendance-leave',
          {
            name: leave.name,
            fromDate: leave.fromDate,
            toDate: leave.toDate,
            leaveType: leave.leaveType,
            is_half_day: leave.is_half_day || false,
            user_id: userId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        console.log('Attendance marked as Leave successfully')
      } catch (error) {
        console.error('Failed to mark attendance as Leave:', error)
        try {
          await this.updateAttendanceToLeave(leave, userId)
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
        }
      }
    },

    async updateAttendanceToLeave(leave, userId) {
      try {
        const token = localStorage.getItem('token')
        
        const attendanceResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/attendance/user/${userId}`,
          { 
            params: { 
              from_date: leave.fromDate,
              to_date: leave.toDate
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        if (attendanceResponse.data && attendanceResponse.data.length > 0) {
          for (const record of attendanceResponse.data) {
            await axios.put(
              `https://employees.archenterprises.co.in/api/api/attendance/${record.id}`,
              { 
                status: 'Leave',
                leave_type: leave.leaveType
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          }
          console.log('Attendance records updated to Leave')
        } else {
          await this.createAttendanceLeaveRecords(leave, userId)
        }
      } catch (error) {
        console.error('Failed to update attendance to Leave:', error)
      }
    },

    async createAttendanceLeaveRecords(leave, userId) {
      try {
        const token = localStorage.getItem('token')
        
        const fromDate = new Date(leave.fromDate)
        const toDate = new Date(leave.toDate)
        const currentDate = new Date(fromDate)
        
        while (currentDate <= toDate) {
          const dateStr = currentDate.toISOString().split('T')[0]
          
          const existingRecord = await axios.get(
            `https://employees.archenterprises.co.in/api/api/attendance/check`,
            {
              params: {
                user_id: userId,
                date: dateStr
              },
              headers: { Authorization: `Bearer ${token}` }
            }
          )
          
          if (!existingRecord.data || !existingRecord.data.exists) {
            await axios.post(
              'https://employees.archenterprises.co.in/api/api/attendance',
              {
                user_id: userId,
                date: dateStr,
                status: 'Leave',
                leave_type: leave.leaveType,
                is_half_day: leave.is_half_day || false
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          }
          
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        console.log('Attendance Leave records created successfully')
      } catch (error) {
        console.error('Failed to create attendance Leave records:', error)
      }
    },

    async createLeaveRecord(leave, userId, totalDays) {
      try {
        const token = localStorage.getItem('token')
        const currentYear = new Date().getFullYear()
        
        const existingLeaves = await axios.get(
          `https://employees.archenterprises.co.in/api/api/leaves`,
          { 
            params: { 
              user_id: userId,
              from_date: leave.fromDate,
              to_date: leave.toDate,
              leave_type: leave.leaveType
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        if (existingLeaves.data && existingLeaves.data.length > 0) {
          console.log('Leave record already exists, skipping creation')
          return
        }
        
        const leaveData = {
          user_id: userId,
          leave_type: leave.leaveType,
          from_date: leave.fromDate,
          to_date: leave.toDate,
          total_days: totalDays,
          year: currentYear,
          status: 'Approved',
          reason: leave.reason || 'Leave approved'
        }
        
        console.log('Creating leave record:', leaveData)
        
        await axios.post(
          'https://employees.archenterprises.co.in/api/api/leaves',
          leaveData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        console.log('Leave record created successfully')
      } catch (error) {
        console.error('Failed to create leave record:', error)
      }
    },

    async deleteLeaveRecords(leave) {
      try {
        const token = localStorage.getItem('token')
        
        const userResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(leave.name)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        const userId = userResponse.data.id
        
        const leavesResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/leaves`,
          { 
            params: { 
              user_id: userId,
              from_date: leave.fromDate,
              to_date: leave.toDate,
              leave_type: leave.leaveType
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        if (leavesResponse.data && leavesResponse.data.length > 0) {
          for (const leaveRecord of leavesResponse.data) {
            console.log('Deleting leave record:', leaveRecord.id)
            await axios.delete(
              `https://employees.archenterprises.co.in/api/api/leaves/${leaveRecord.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          }
          console.log('Leave records deleted successfully')
        }
      } catch (error) {
        console.error('Failed to delete leave records:', error)
      }
    },

    async markAttendanceAsAbsent(leave) {
      try {
        const token = localStorage.getItem('token')
        
        const userResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(leave.name)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        const userId = userResponse.data.id
        
        console.log('Marking attendance as Absent for:', {
          name: leave.name,
          fromDate: leave.fromDate,
          toDate: leave.toDate
        })

        await axios.post(
          'https://employees.archenterprises.co.in/api/api/mark-attendance-absent',
          {
            name: leave.name,
            fromDate: leave.fromDate,
            toDate: leave.toDate,
            leaveType: leave.leaveType,
            is_half_day: leave.is_half_day || false,
            user_id: userId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        console.log('Attendance marked as Absent successfully')
      } catch (error) {
        console.error('Failed to mark attendance as Absent:', error)
        try {
          await this.updateAttendanceToAbsent(leave, userId)
        } catch (fallbackError) {
          console.error('Fallback for Absent failed:', fallbackError)
        }
      }
    },

    async updateAttendanceToAbsent(leave, userId) {
      try {
        const token = localStorage.getItem('token')
        
        const attendanceResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/attendance/user/${userId}`,
          { 
            params: { 
              from_date: leave.fromDate,
              to_date: leave.toDate
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        if (attendanceResponse.data && attendanceResponse.data.length > 0) {
          for (const record of attendanceResponse.data) {
            await axios.put(
              `https://employees.archenterprises.co.in/api/api/attendance/${record.id}`,
              { status: 'Absent' },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          }
          console.log('Attendance records updated to Absent')
        }
      } catch (error) {
        console.error('Failed to update attendance to Absent:', error)
      }
    },

    async deleteAbsentRecords(leave) {
      try {
        const token = localStorage.getItem('token')
        
        const userResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/user-by-name?name=${encodeURIComponent(leave.name)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        const userId = userResponse.data.id
        
        const absentResponse = await axios.get(
          `https://employees.archenterprises.co.in/api/api/attendance`,
          { 
            params: { 
              user_id: userId,
              from_date: leave.fromDate,
              to_date: leave.toDate,
              status: 'Absent'
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        if (absentResponse.data && absentResponse.data.length > 0) {
          for (const absentRecord of absentResponse.data) {
            console.log('Deleting absent record:', absentRecord.id)
            await axios.delete(
              `https://employees.archenterprises.co.in/api/api/attendance/${absentRecord.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          }
          console.log('Absent records deleted successfully')
        }
      } catch (error) {
        console.error('Failed to delete absent records:', error)
      }
    },

    async fetchLeaves() {
      this.loadingLeaves = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          'https://employees.archenterprises.co.in/api/api/leave-requests',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.leaveRequests = response.data
        console.log('Fetched leaves:', this.leaveRequests.length)
      } catch (error) {
        console.error('FULL ERROR:', error)

        if (error.response) {
          console.log('STATUS:', error.response.status)
          console.log('DATA:', error.response.data)
          console.log('HEADERS:', error.response.headers)
        } else if (error.request) {
          console.log('NO RESPONSE RECEIVED:', error.request)
        } else {
          console.log('ERROR MESSAGE:', error.message)
        }

        toastError(
          error.response?.data?.message ||
          error.message ||
          'Error loading leave requests'
        )
      } finally {
        this.loadingLeaves = false
      }
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    logout() {
      const token = localStorage.getItem('token')
      axios.post('https://employees.archenterprises.co.in/api/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).finally(() => {
        localStorage.removeItem('token')
        this.$router.push('/auth')
      })
    }
  },

  mounted() {
    const token = localStorage.getItem('token')
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')

    if (!token) {
      this.$router.push('/auth')
      return
    }

    this.fetchLeaves()
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    if (storedUser && storedUser.name) this.loggedInUserName = storedUser.name

    const role = (storedUser && storedUser.role) ? String(storedUser.role).toLowerCase() : null
    if (role === 'employee' || role === 'staff') {
      this.$router.push('/employee/dashboard')
      return
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main Content */
.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.content {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--dark);
  padding: 8px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark);
}

.mobile-title i {
  color: var(--primary-color);
}

.mobile-pending-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Content Header */
.content-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.subtitle-modern {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #d97706;
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card:active {
  transform: scale(0.97);
}

.stat-card.success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.stat-card.success i {
  color: var(--success);
}

.stat-card.danger {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.stat-card.danger i {
  color: var(--danger);
}

.stat-card i {
  font-size: 36px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Search Bar - Mobile */
.search-bar-mobile {
  display: none;
  margin-bottom: 16px;
}

.search-group-mobile {
  position: relative;
  flex: 1;
}

.search-group-mobile i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input-mobile {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.3s ease;
}

.search-input-mobile:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Table Styles */
.table-wrapper-premium {
  background: white;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #1a1a2e;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title-modern i {
  color: var(--primary-color);
}

.record-count-mobile {
  background: var(--primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 4px;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.table-container {
  overflow-x: auto;
}

.leave-table-premium {
  width: 100%;
  border-collapse: collapse;
}

.leave-table-premium thead {
  background: #f8fafc;
}

.leave-table-premium th {
  text-align: left;
  padding: 16px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.leave-table-premium td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.leave-table-premium tbody tr {
  transition: all 0.3s ease;
}

.leave-table-premium tbody tr:hover {
  background: #fafbfc;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.leave-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.employee-info-card {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.employee-name {
  font-weight: 600;
  color: var(--dark);
  font-size: 14px;
}

.dept-badge-mobile {
  padding: 2px 10px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.status-badge-mobile.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-mobile.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-mobile.pending {
  background: #fef3c7;
  color: #d97706;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-value {
  font-size: 13px;
  color: var(--dark);
  text-align: right;
}

.reason-text {
  max-width: 60%;
  word-break: break-word;
  text-align: right;
}

.leave-type-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.leave-type-badge-mobile.sick {
  background: #fef3c7;
  color: #d97706;
}

.leave-type-badge-mobile.casual {
  background: #d1fae5;
  color: #065f46;
}

.leave-type-badge-mobile.pl {
  background: #e0e7ff;
  color: #4338ca;
}

.leave-type-badge-mobile.halfday {
  background: #fed7aa;
  color: #c2410c;
}

.leave-type-badge-mobile.default {
  background: #f3e8ff;
  color: #7e22ce;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.card-action-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.card-action-btn:active {
  transform: scale(0.97);
}

.card-action-btn.approve {
  background: #d1fae5;
  color: var(--success);
}

.card-action-btn.reject {
  background: #fee2e2;
  color: var(--danger);
}

.card-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State Mobile */
.empty-state-mobile {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state-mobile i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-mobile h4 {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 6px;
}

.empty-state-mobile p {
  font-size: 13px;
}

/* Employee Cell */
.employee-cell {
  min-width: 160px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.employee-name {
  font-weight: 500;
  color: #1a1a2e;
}

/* Department Badge */
.dept-badge {
  display: inline-flex;
  padding: 4px 12px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Leave Type Badge */
.leave-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.leave-type-badge.sick {
  background: #fef3c7;
  color: #d97706;
}

.leave-type-badge.casual {
  background: #d1fae5;
  color: #065f46;
}

.leave-type-badge.pl {
  background: #e0e7ff;
  color: #4338ca;
}

.leave-type-badge.halfday {
  background: #fed7aa;
  color: #c2410c;
}

.leave-type-badge.default {
  background: #f3e8ff;
  color: #7e22ce;
}

/* Reason Cell */
.reason-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #6b7280;
}

/* Date Cell */
.date-cell {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 13px;
  color: #1a1a2e;
  white-space: nowrap;
}

.date-cell i {
  margin-right: 6px;
  font-size: 12px;
  color: #6b7280;
}

/* Status Badge */
.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge-premium.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-premium.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-premium.pending {
  background: #fef3c7;
  color: #d97706;
}

/* Action Group */
.action-group {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn.approve {
  background: #d1fae5;
  color: var(--success);
}

.action-btn.approve:hover:not(:disabled) {
  color: rgb(10, 5, 5);
  transform: translateY(-2px);
}

.action-btn.reject {
  background: #fee2e2;
  color: var(--danger);
}

.action-btn.reject:hover:not(:disabled) {
  color: rgb(6, 3, 3);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* More Button */
.more-btn-wrapper {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.more-btn-premium {
  background: #f3f4f6;
  border: none;
  padding: 10px 24px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.more-btn-premium:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-text {
  display: inline;
}

/* Empty States */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state-premium i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-premium h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-state-premium p {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1024px) {
  .leave-table-premium th,
  .leave-table-premium td {
    padding: 12px;
  }
  
  .reason-cell {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .content {
    padding: 16px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .stats-bar {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 12px;
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }

  .stat-card i {
    font-size: 24px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 10px;
  }

  .search-bar-mobile {
    display: block;
  }

  .mobile-cards {
    display: flex;
  }

  .table-container {
    display: none;
  }

  .table-header {
    padding: 12px 16px;
  }

  .section-title-modern {
    font-size: 14px;
  }

  .table-info {
    display: none;
  }

  .action-group {
    flex-direction: row;
  }

  .action-btn {
    width: 30px;
    height: 30px;
  }

  .more-btn-premium {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .content {
    padding: 12px;
    border-radius: 16px;
  }

  .mobile-title {
    font-size: 16px;
  }

  .mobile-pending-badge {
    font-size: 10px;
    padding: 2px 10px;
  }

  .stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-card {
    padding: 10px;
  }

  .stat-card i {
    font-size: 20px;
  }

  .stat-value {
    font-size: 17px;
  }

  .leave-card {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .card-value {
    text-align: left;
  }

  .reason-text {
    max-width: 100%;
    text-align: left;
  }

  .search-input-mobile {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }
}
</style>