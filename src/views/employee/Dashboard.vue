<template>
  <div class="layout" :class="{ 'focus-overlay-active': showFocusOverlay }">
    <!-- Focus Overlay for highlighting SBU button -->
    <div v-if="showFocusOverlay" class="focus-overlay" @click="dismissFocusOverlay"></div>

  

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <div class="banner-content">
            <h1>Welcome back, {{ formatFirstName(currentUser.name) || 'Employee' }}!</h1>
            <!-- <p>Here's what's happening with your work today.</p> -->
          </div>
          <div class="date-badge">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formattedDate }}</span>
          </div>
        </div>

        <!-- KPI Cards Grid -->
     <!-- KPI Cards Grid - Organized for Mobile -->
<div class="dashboard-row">
  <!-- Primary Cards (Always Visible) -->
  <div class="dashboard-card clickable-card" @click="goTo('employee/mytask')">
    <div class="active-tag">Active: {{ activeTasks.length }}</div>
    <div class="card-icon tasks-icon">
      <i class="fas fa-tasks"></i>
    </div>
    <div class="card-info">
      <p class="label">My Tasks</p>
      <span class="progress-text">View & Manage Tasks</span>
    </div>
  </div>

  <div class="dashboard-card clickable-card" @click="goTo('employee/empattendance')">
    <div class="card-icon attendance-icon">
      <i class="fas fa-calendar-check"></i>
    </div>
    <div class="card-info">
      <p class="label">Attendance</p>
      <span class="progress-text">Mark your daily attendance</span>
    </div>
  </div>

  <div class="dashboard-card clickable-card" @click="goTo('employee/Customerregistrations')">
    <div class="card-icon crm-icon">
      <i class="fas fa-users"></i>
    </div>
    <div class="card-info">
      <p class="label">CRM</p>
      <span class="progress-text">Manage customers & add PO</span>
    </div>
  </div>
 
    <div class="dashboard-card clickable-card desktop-only" @click="goTo('employee/viewallpo')">
      <div class="card-icon po-icon">
        <i class="fas fa-file-invoice"></i>
      </div>
      <div class="card-info">
        <p class="label">View all PO</p>
        <span class="progress-text">Manage Purchase Orders</span>
      </div>
    </div>  

    <div v-if="canViewSiteOwnership" class="dashboard-card clickable-card desktop-only" @click="goTo('employee/siteownership')">
      <div class="card-icon site-icon">
        <i class="fas fa-sitemap"></i>
      </div>
      <div class="card-info">
        <p class="label">Site ownership</p>
        <span class="progress-text">Site assignments by engineer</span>
      </div>
    </div>  
   
        <!-- <div class="dashboard-card clickable-card desktop-only" @click="goTo('employee/weeklyworkingschedule')">
      <div class="new-tag">New</div>
      <div class="card-icon todo-icon">
        <i class="fas fa-list-ul"></i>
      </div>
      <div class="card-info">
        <p class="label">Weekly To-Do list</p>
        <span class="progress-text">Set your weekly goal</span>
      </div>
      </div> -->

  <!-- Mobile Only Cards - Grouped by Category -->
  <div class="mobile-section-title">
    <span><i class="fas fa-th-large"></i> All Features</span>
  </div>

  <!-- Category: Work Management -->
  <div class="mobile-card-group mobile-only">
    <div class="group-label">
      <i class="fas fa-briefcase"></i> Work Management
    </div>
    
    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/visitschedule')">
      <div class="card-icon visits-icon">
        <i class="fas fa-map-marked-alt"></i>
      </div>
      <div class="card-info">
        <p class="label">Visit Schedule</p>
        <span class="progress-text">View & Manage Visits</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/viewallpo')">
      <div class="new-tag">New</div>
      <div class="card-icon crm-icon">
        <i class="fas fa-file-invoice"></i>
      </div>
      <div class="card-info">
        <p class="label">View all PO</p>
        <span class="progress-text">Manage Purchase Orders</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/sop')">
      <div class="card-icon crm-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <div class="card-info">
        <p class="label">SOP</p>
        <span class="progress-text">Standard Operating Procedures</span>
      </div>
    </div>

    <div v-if="canViewSiteOwnership" class="dashboard-card clickable-card mobile-only" @click="goTo('employee/siteownership')">
      <div class="card-icon site-icon">
        <i class="fas fa-sitemap"></i>
      </div>
      <div class="card-info">
        <p class="label">Site ownership</p>
        <span class="progress-text">Site assignments by engineer</span>
      </div>
    </div>
  </div>

  <!-- Category: Leave & Attendance -->
  <div class="mobile-card-group mobile-only">
    <div class="group-label">
      <i class="fas fa-calendar-alt"></i> Leave & Attendance
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/applyleave')">
      <div class="card-icon leave-icon">
        <i class="fas fa-umbrella-beach"></i>
      </div>
      <div class="card-info">
        <p class="label">Apply for Leaves</p>
        <span class="progress-text">Apply & View Status</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/myleavebalance')">
      <div class="card-icon balance-icon">
        <i class="fas fa-balance-scale"></i>
      </div>
      <div class="card-info">
        <p class="label">Leave Balance</p>
        <span class="progress-text">View Your Balances</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/leaveapplicationsemp')">
      <div class="card-icon leave-icon">
        <i class="fas fa-umbrella-beach"></i>
      </div>
      <div class="card-info">
        <p class="label">Leave Applications</p>
        <span class="progress-text">View & Apply for Leaves</span>
      </div>
    </div>
  </div>

  <!-- Category: Learning & Development -->
  <div class="mobile-card-group mobile-only">
    <div class="group-label">
      <i class="fas fa-graduation-cap"></i> Learning & Development
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/ETPsession')">
      <div class="card-icon etp-icon">
        <i class="fas fa-chalkboard-teacher"></i>
      </div>
      <div class="card-info">
        <p class="label">ETP Sessions</p>
        <span class="progress-text">View & Join Training</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/viewkra')">
      <div class="card-icon kra-icon">
        <i class="fas fa-chart-bar"></i>
      </div>
      <div class="card-info">
        <p class="label">KRA</p>
        <span class="progress-text">View & Manage KRA</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/mydsi')">
      <div class="card-icon dsi-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <div class="card-info">
        <p class="label">DSI</p>
        <span class="progress-text">View & Manage DSI</span>
      </div>
    </div>
  </div>

  <!-- Category: Resources & Support -->
  <div class="mobile-card-group mobile-only">
    <div class="group-label">
      <i class="fas fa-hand-holding-heart"></i> Resources & Support
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/resourcebooking')">
      <div class="card-icon resource-icon">
        <i class="fas fa-book"></i>
      </div>
      <div class="card-info">
        <p class="label">Resource Booking</p>
        <span class="progress-text">Book Resources & Facilities</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/request')">
      <div class="card-icon request-icon">
        <i class="fas fa-envelope"></i>
      </div>
      <div class="card-info">
        <p class="label">Request Desk</p>
        <span class="progress-text">View & Manage Requests</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/help')">
      <div class="card-icon help-icon">
        <i class="fas fa-question-circle"></i>
      </div>
      <div class="card-info">
        <p class="label">Help & Support</p>
        <span class="progress-text">View Notifications & Mentions</span>
      </div>
    </div>
  </div>

  <!-- Category: Finance -->
  <div class="mobile-card-group mobile-only">
    <div class="group-label">
      <i class="fas fa-coins"></i> Finance
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/mysalaryadvances')">
      <div class="card-icon salary-icon">
        <i class="fas fa-money-bill-wave"></i>
      </div>
      <div class="card-info">
        <p class="label">Salary Advances</p>
        <span class="progress-text">View & Request Advances</span>
      </div>
    </div>
  </div>

  <!-- Category: Calendar -->
  <div class="mobile-card-group mobile-only">
    <div class="group-label">
      <i class="fas fa-calendar-day"></i> Calendar
    </div>

    <div class="dashboard-card clickable-card mobile-only" @click="goTo('employee/archcalendar')">
      <div class="card-icon calendar-icon">
        <i class="fas fa-calendar"></i>
      </div>
      <div class="card-info">
        <p class="label">Calendar</p>
        <span class="progress-text">View events & holidays</span>
      </div>
    </div>
  </div>
</div>

        <!-- Split Section: Chart & Birthday Celebrations -->
        <div class="dashboard-split desktop-only">
          <div class="chart-card">
            <div class="card-header">
              <h3>Work Analytics</h3>
              <i class="fas fa-chart-line"></i>
            </div>
            <DataChart />
          </div>

          <!-- 🎂 Birthday Celebrations Widget -->
         <div class="upcoming-card">
            <div class="card-header">
              <h3>Active Tasks (Not Completed)</h3>
              <i class="fas fa-tasks"></i>
            </div>
            <div class="upcoming-list">
              <div v-for="(task, index) in activeTasks" :key="task.id" class="upcoming-item" @click="goToTask(task.id)">
                <div class="task-priority" :class="getPriorityClass(task.priority)"></div>
                <div class="task-details">
                  <strong>{{ truncateText(task.title, 40) }}</strong>
                  <span class="deadline"><i class="far fa-clock"></i> Due: {{ formatDate(task.due_date) }}</span>
                  <span class="task-status" :class="getStatusClass(task.status)">{{ task.status || 'Pending' }}</span>
                </div>
                <div class="task-arrow">
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>
              <div v-if="activeTasks.length === 0" class="no-tasks">
                <i class="far fa-smile-wink"></i>
                <p>All tasks completed! 🎉</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Tasks & Recent Leaves Row -->
        <div class="dashboard-split desktop-only">
           <div class="birthday-widget ">
            <div class="card-header">
              <h3>
                <i class="fas fa-birthday-cake"></i> Birthday Celebrations
              </h3>
              <div class="current-month-badge">
                <i class="fas fa-calendar-alt"></i> {{ currentMonthName }}
              </div>
            </div>

            <div v-if="birthdayList.length > 0" class="birthday-list">
              <div
                v-for="(employee, idx) in birthdayList"
                :key="employee.id"
                class="birthday-item"
                :style="{ animationDelay: (idx * 0.1) + 's' }"
              >
                <div class="birthday-avatar">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="profile"
                    class="avatar-img"
                  />
                  <div class="cake-icon">
                    <i class="fas fa-birthday-cake"></i>
                  </div>
                </div>
                <div class="birthday-info">
                  <strong>{{ employee.name }}</strong>
                  <span class="birthday-date">
                    <i class="fas fa-gift"></i> {{ formatBirthdayDate(employee.dateofbirth) }}
                  </span>
                  <span class="birthday-dept">{{ employee.department || 'N/A' }}</span>
                </div>
                <button class="wish-button" @click="wishBirthday(employee)">
                  <i class="fas fa-heart"></i> Wish
                </button>
              </div>
            </div>

            <div v-else class="no-birthday-state">
              <div class="no-birthday-icon">
                <i class="fas fa-calendar-times"></i>
              </div>
              <p>No birthdays this month 🎈</p>
              <span>Check back next month!</span>
            </div>
          </div>
          

          <div class="recent-leaves-card">
            <div class="card-header">
              <h3><i class="fas fa-umbrella-beach"></i> Recent Leave Applications</h3>
              <button class="view-all-btn" @click="goTo('employee/leaveapplicationsemp')">View All</button>
            </div>
            <div class="leaves-list">
              <div v-for="leave in recentLeaves" :key="leave.id" class="leave-item">
                <div class="leave-icon-small" :class="getLeaveIconClass(leave.leaveType)">
                  <i :class="getLeaveIcon(leave.leaveType)"></i>
                </div>
                <div class="leave-details">
                  <div class="leave-title">{{ leave.leaveType }}</div>
                  <div class="leave-dates">{{ formatDate(leave.fromDate) }} - {{ formatDate(leave.toDate) }}</div>
                </div>
                <div class="leave-status" :class="getLeaveStatusClass(leave.status)">
                  {{ leave.status }}
                </div>
              </div>
              <div v-if="recentLeaves.length === 0" class="no-leaves">
                <i class="far fa-calendar-check"></i>
                <p>No recent leave applications</p>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>

    <!-- Daily Report Modal -->
    <div class="modal-overlay" v-if="showModal">
      <div class="modal modern-modal">
        <div class="modal-header">
          <h2><i class="fas fa-clipboard-list"></i> Daily Work Report</h2>
          <span class="close-btn" @click="showModal = false">&times;</span>
        </div>
        <form @submit.prevent="submitReport">
          <div class="form-group">
            <label><i class="fas fa-calendar"></i> Date</label>
            <input type="date" v-model="report.date" required />
          </div>
          <div class="form-group">
            <label><i class="fas fa-user"></i> Name</label>
            <input type="text" v-model="report.name" required />
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label><i class="fas fa-chart-simple"></i> Status</label>
              <select v-model="report.status" required>
                <option disabled value="">Select Status</option>
                <option>Completed</option>
                <option>Progress</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label><i class="fas fa-pen-alt"></i> Work Summary</label>
            <textarea v-model="report.summary" placeholder="Describe your work today..." required></textarea>
          </div>
          <button type="submit" class="submit-btn"><i class="fas fa-paper-plane"></i> Submit Report</button>
        </form>
      </div>
    </div>

    <!-- Google Form Popup Modal -->
    <div class="modal-overlay" v-if="showGoogleFormModal">
      <div class="modal google-form-modal">
        <div class="modal-header google-form-header">
          <h2><i class="fab fa-google"></i> Strategic Business Unit Discussion – SBU</h2>
          <span class="close-btn" @click="closeGoogleForm">&times;</span>
        </div>
        <div class="google-form-body">
          <div class="form-info-banner">
            <i class="fas fa-info-circle"></i>
            <span>Topic: Strategic Business Proposal Discussion – SBU | Presented by: Prasad Sir</span>
          </div>
          <iframe 
            :src="googleFormUrl" 
            frameborder="0" 
            class="google-form-iframe"
            title="SBU Discussion Form"
          ></iframe>
        </div>
        <div class="google-form-footer">
          <button @click="closeGoogleForm" class="remind-later-btn">
            <i class="fas fa-clock"></i> Remind Later
          </button>
          <button @click="openFormInNewTab" class="open-new-tab-btn">
            <i class="fas fa-external-link-alt"></i> Open in New Tab
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 🏢 SITE OWNERSHIP MODAL POPUP -->
    <!-- ========================================================= -->
    <div v-if="showSiteOwnershipModal" class="site-modal-overlay" @click.self="closeSiteOwnershipModal">
      <div class="site-modal-window">
        <!-- Header -->
        <div class="site-modal-header">
          <div class="site-modal-header-left">
            <div class="site-modal-icon-badge">
              <i class="fas fa-sitemap"></i>
            </div>
            <div>
              <h2>Site Ownership</h2>
              <p>Engineer site assignments & engine distribution</p>
            </div>
          </div>

          <div class="site-modal-header-right">
            <div class="site-quick-stats">
              <span class="stat-pill total"><i class="fas fa-building"></i> {{ overallTotalSites }} Sites</span>
              <span class="stat-pill engines"><i class="fas fa-cogs"></i> {{ overallTotalEngines }} Engines</span>
              <span class="stat-pill amc"><i class="fas fa-file-contract"></i> {{ overallAmcSites }} AMC</span>
            </div>
            <button class="site-modal-close" @click="closeSiteOwnershipModal" title="Close Popup">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="site-modal-toolbar">
          <div class="site-search-box">
            <i class="fas fa-search"></i>
            <input
              type="text"
              v-model="siteSearchQuery"
              placeholder="Search customer, engineer, region..."
              class="site-search-field"
            />
            <button v-if="siteSearchQuery" @click="siteSearchQuery = ''" class="site-clear-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="site-toolbar-actions">
            <div class="site-filter-item">
              <i class="fas fa-map-marker-alt"></i>
              <select v-model="siteRegionFilter" class="site-select">
                <option value="">All Regions</option>
                <option v-for="r in siteOwnershipRegions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>

            <div class="site-filter-item">
              <i class="fas fa-tag"></i>
              <select v-model="siteTypeFilter" class="site-select">
                <option value="">All Types</option>
                <option value="AMC">AMC</option>
                <option value="Non-AMC">Non-AMC</option>
              </select>
            </div>

            <button class="site-btn-export" @click="exportSiteOwnershipToExcel" title="Export Excel / CSV">
              <i class="fas fa-file-excel"></i> <span>Export</span>
            </button>

            <button class="site-btn-add" @click="openAddSiteModal(activeSiteTab !== 'Summary' && activeSiteTab !== 'All Sites' ? activeSiteTab : '')">
              <i class="fas fa-plus"></i> <span>Add Site</span>
            </button>
          </div>
        </div>

        <!-- Sheet Style Tabs (Matching Reference Image) -->
        <div class="site-sheet-tabs-bar">
          <button
            class="sheet-tab-btn"
            :class="{ active: activeSiteTab === 'Summary' }"
            @click="activeSiteTab = 'Summary'"
          >
            <i class="fas fa-chart-pie"></i> Summary
          </button>

          <button
            v-for="eng in siteOwnershipEngineers"
            :key="eng"
            class="sheet-tab-btn"
            :class="{ active: activeSiteTab === eng }"
            @click="activeSiteTab = eng"
          >
            <i class="fas fa-user-tie"></i> {{ eng }}
            <span class="sheet-tab-count">{{ getEngineerSiteCount(eng) }}</span>
          </button>

          <button
            class="sheet-tab-btn"
            :class="{ active: activeSiteTab === 'All Sites' }"
            @click="activeSiteTab = 'All Sites'"
          >
            <i class="fas fa-globe"></i> All Sites
            <span class="sheet-tab-count">{{ siteOwnershipList.length }}</span>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="site-modal-body">
          <!-- Summary Tab View -->
          <div v-if="activeSiteTab === 'Summary'" class="site-summary-container">
            <!-- 4 KPI Summary Cards -->
            <div class="site-kpi-grid">
              <div class="site-kpi-card kpi-blue">
                <div class="kpi-icon-wrap"><i class="fas fa-building"></i></div>
                <div class="kpi-info">
                  <span class="kpi-number">{{ overallTotalSites }}</span>
                  <span class="kpi-title">Total Sites Assigned</span>
                </div>
              </div>
              <div class="site-kpi-card kpi-emerald">
                <div class="kpi-icon-wrap"><i class="fas fa-cogs"></i></div>
                <div class="kpi-info">
                  <span class="kpi-number">{{ overallTotalEngines }}</span>
                  <span class="kpi-title">Total Engines Maintained</span>
                </div>
              </div>
              <div class="site-kpi-card kpi-purple">
                <div class="kpi-icon-wrap"><i class="fas fa-file-contract"></i></div>
                <div class="kpi-info">
                  <span class="kpi-number">{{ overallAmcSites }}</span>
                  <span class="kpi-title">Active AMC Contracts</span>
                </div>
              </div>
              <div class="site-kpi-card kpi-amber">
                <div class="kpi-icon-wrap"><i class="fas fa-users-gear"></i></div>
                <div class="kpi-info">
                  <span class="kpi-number">{{ siteOwnershipEngineers.length }}</span>
                  <span class="kpi-title">Service Engineers</span>
                </div>
              </div>
            </div>

            <!-- Summary Table -->
            <div class="site-table-wrapper">
              <div class="site-table-title-row">
                <h3><i class="fas fa-table-list"></i> Engineer-Wise Summary Matrix</h3>
              </div>
              <table class="site-data-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">#</th>
                    <th>Engineer Name</th>
                    <th>Covered Region(s)</th>
                    <th class="text-center">Total Sites</th>
                    <th class="text-center">Total Engines</th>
                    <th class="text-center">AMC Sites</th>
                    <th class="text-center" style="width: 140px;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(s, idx) in siteSummaryData" :key="s.engineer">
                    <td class="text-center">{{ idx + 1 }}</td>
                    <td>
                      <div class="engineer-profile-cell">
                        <span class="engineer-circle-avatar">{{ s.engineer.charAt(0) }}</span>
                        <strong>{{ s.engineer }}</strong>
                      </div>
                    </td>
                    <td>
                      <span v-for="r in s.regions" :key="r" class="region-badge" :class="'reg-' + r.toLowerCase()">{{ r }}</span>
                    </td>
                    <td class="text-center font-bold">{{ s.total_sites }}</td>
                    <td class="text-center font-bold text-success">{{ s.total_engines }}</td>
                    <td class="text-center">
                      <span class="amc-pill-count">{{ s.amc_sites }}</span>
                    </td>
                    <td class="text-center">
                      <button class="btn-view-eng-sites" @click="activeSiteTab = s.engineer">
                        <i class="fas fa-eye"></i> View Sites
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="table-footer-row">
                    <td colspan="3" class="text-right font-bold">Total</td>
                    <td class="text-center font-bold">{{ overallTotalSites }}</td>
                    <td class="text-center font-bold text-success">{{ overallTotalEngines }}</td>
                    <td class="text-center font-bold">{{ overallAmcSites }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Engineer Sites List (Matching Reference Excel Table) -->
          <div v-else class="site-tab-content-wrap">
            <div class="site-table-wrapper">
              <div class="site-table-title-row">
                <div class="site-table-heading-left">
                  <h3>
                    <i class="fas fa-list-check"></i>
                    {{ activeSiteTab === 'All Sites' ? 'All Assigned Sites' : activeSiteTab + ' - Site Allocation' }}
                  </h3>
                  <span class="site-count-badge">{{ filteredSiteList.length }} Sites</span>
                </div>
                <div class="site-table-heading-right">
                  <span class="engine-sum-tag">
                    <i class="fas fa-cogs"></i> Total Engines: <strong>{{ currentTabEngineTotal }}</strong>
                  </span>
                </div>
              </div>

              <div class="table-scroll-container">
                <table class="site-data-table excel-grid-table">
                  <thead>
                    <tr>
                      <th style="width: 55px;" class="text-center">Sr No</th>
                      <th>Customer</th>
                      <th style="width: 140px;" class="text-center">No of Engines</th>
                      <th style="width: 120px;" class="text-center">Region</th>
                      <th style="width: 160px;">Assigned Engineer</th>
                      <th style="width: 130px;" class="text-center">Customer Type</th>
                      <th style="width: 100px;" class="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(site, index) in filteredSiteList" :key="site.id || index">
                      <td class="text-center font-semibold">{{ index + 1 }}</td>
                      <td class="customer-title-cell">
                        <i class="fas fa-building customer-row-icon"></i>
                        <span>{{ site.customer }}</span>
                      </td>
                      <td class="text-center">
                        <span class="engine-badge-number">{{ site.no_of_engines }}</span>
                      </td>
                      <td class="text-center">
                        <span class="region-badge" :class="'reg-' + (site.region || 'south').toLowerCase()">
                          {{ site.region || 'South' }}
                        </span>
                      </td>
                      <td>
                        <div class="assigned-eng-pill">
                          <i class="fas fa-user-circle"></i>
                          <span>{{ site.assigned_engineer }}</span>
                        </div>
                      </td>
                      <td class="text-center">
                        <span v-if="site.customer_type === 'AMC'" class="cust-type-pill amc">AMC</span>
                        <span v-else-if="site.customer_type" class="cust-type-pill other">{{ site.customer_type }}</span>
                        <span v-else class="cust-type-pill blank">-</span>
                      </td>
                      <td class="text-center">
                        <div class="site-actions-group">
                          <button class="site-action-btn edit" @click="openEditSiteModal(site)" title="Edit Site">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="site-action-btn delete" @click="deleteSiteOwnership(site.id)" title="Delete Site">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="filteredSiteList.length === 0">
                      <td colspan="7" class="site-empty-cell">
                        <div class="empty-state-box">
                          <i class="fas fa-inbox"></i>
                          <p>No site ownership records found</p>
                          <button class="site-btn-add btn-sm" @click="openAddSiteModal(activeSiteTab !== 'All Sites' ? activeSiteTab : '')">
                            <i class="fas fa-plus"></i> Add First Site
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="filteredSiteList.length > 0">
                    <tr class="table-footer-row">
                      <td colspan="2" class="text-right font-bold">Total</td>
                      <td class="text-center font-bold text-success">{{ currentTabEngineTotal }}</td>
                      <td colspan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- ➕ ADD / EDIT SITE SUB-MODAL -->
    <!-- ========================================================= -->
    <div v-if="showAddSiteModal" class="site-form-modal-overlay" @click.self="showAddSiteModal = false">
      <div class="site-form-modal-box">
        <div class="site-form-header">
          <h3>
            <i :class="editingSiteId ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            {{ editingSiteId ? 'Edit Site Ownership' : 'Add New Site Ownership' }}
          </h3>
          <button class="site-modal-close" @click="showAddSiteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveSiteOwnership" class="site-form-content">
          <div class="form-group-site">
            <label>Customer / Site Name <span class="required">*</span></label>
            <input
              type="text"
              v-model="siteForm.customer"
              placeholder="e.g. A. O. Smith India Water Products Pvt. Ltd. Banglore"
              required
              class="form-control-site"
            />
          </div>

          <div class="form-row-site">
            <div class="form-group-site">
              <label>No of Engines <span class="required">*</span></label>
              <input
                type="number"
                v-model.number="siteForm.no_of_engines"
                min="1"
                required
                class="form-control-site"
              />
            </div>
            <div class="form-group-site">
              <label>Region <span class="required">*</span></label>
              <select v-model="siteForm.region" required class="form-control-site">
                <option value="South">South</option>
                <option value="West">West</option>
                <option value="North">North</option>
                <option value="East">East</option>
                <option value="Central">Central</option>
              </select>
            </div>
          </div>

          <div class="form-row-site">
            <div class="form-group-site">
              <label>Assigned Engineer <span class="required">*</span></label>
              <input
                type="text"
                v-model="siteForm.assigned_engineer"
                list="eng-suggestions"
                placeholder="e.g. Ahamad"
                required
                class="form-control-site"
              />
              <datalist id="eng-suggestions">
                <option v-for="eng in siteOwnershipEngineers" :key="eng" :value="eng"></option>
              </datalist>
            </div>

            <div class="form-group-site">
              <label>Customer Type</label>
              <select v-model="siteForm.customer_type" class="form-control-site">
                <option value="">None / Non-AMC</option>
                <option value="AMC">AMC</option>
                <option value="Service">Service</option>
                <option value="Supply">Supply</option>
              </select>
            </div>
          </div>

          <div class="form-group-site">
            <label>Remarks / Notes</label>
            <textarea
              v-model="siteForm.remarks"
              rows="2"
              placeholder="Optional notes or details"
              class="form-control-site"
            ></textarea>
          </div>

          <div class="site-form-actions">
            <button type="button" class="site-btn-cancel" @click="showAddSiteModal = false">Cancel</button>
            <button type="submit" class="site-btn-submit">
              <i class="fas fa-save"></i> {{ editingSiteId ? 'Update Site' : 'Save Site' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from './components/Sidebar.vue';
import DataChart from './components/DataChart.vue';
import { toastSuccess, toastError, toastInfo } from "@/utils/toast.js";

export default {
  name: 'Dashboard',
  components: { Sidebar, DataChart },
  data() {
    return {
      showDownloadMenu: false,
      isMobile: false,
      upcomingTasks: [],
      currentUser: {},
      allTasks: [],
      leaveRequests: [],
      notifications: [],
      unreadMentionsCount: 0,
      showNotificationPanel: false,
      userEmail: '',
      birthdaysThisMonth: [],
      birthdayList: [],
      currentMonthName: '',
      isSidebarVisible: true,
      report: {
        date: '',
        name: '',
        status: '',
        department: '',
        summary: '',
      },
      departments: [],
      showModal: false,
      users: [],
      showGoogleFormModal: false,
      googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfwz35YgfHbSIm3-zapvywqD8pw56fXc-U5EwpCmcG3v3zwrg/viewform?embedded=true',
      showFocusOverlay: false,
      highlightStyle: {},
      focusTimer: null,
      refreshTimer: null,

      // Site Ownership State (100% Database Driven)
      showSiteOwnershipModal: false,
      siteOwnershipLoading: false,
      siteOwnershipList: [],
      siteOwnershipEngineers: [],
      siteOwnershipRegions: [],
      activeSiteTab: 'Summary',
      siteSearchQuery: '',
      siteRegionFilter: '',
      siteTypeFilter: '',
      showAddSiteModal: false,
      editingSiteId: null,
      siteForm: {
        customer: '',
        no_of_engines: 1,
        region: 'South',
        assigned_engineer: '',
        customer_type: '',
        remarks: ''
      }
    }
  },

  computed: {
    canViewSiteOwnership() {
      const dept = (this.currentUser?.department || JSON.parse(localStorage.getItem('user') || '{}')?.department || '').trim().toLowerCase();
      return dept === 'service' || dept === 'hr' || dept === 'management';
    },
    activeTasks() {
      if (!this.allTasks.length) return [];
      return this.allTasks.filter(task => {
        const status = (task.status || '').toLowerCase();
        return status !== 'completed';
      });
    },
    pendingLeavesCount() {
      return this.leaveRequests.filter(leave => leave.status === 'Pending').length;
    },
    recentLeaves() {
      return [...this.leaveRequests]
        .sort((a, b) => new Date(b.created_at || b.fromDate) - new Date(a.created_at || a.fromDate))
        .slice(0, 4);
    },
    recentNotifications() {
      return this.notifications.slice(0, 4);
    },
    formattedDate() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date().toLocaleDateString(undefined, options);
    },

    // Site Ownership Computed Properties
    filteredSiteList() {
      let list = this.siteOwnershipList || [];

      // Tab filter
      if (this.activeSiteTab && this.activeSiteTab !== 'Summary' && this.activeSiteTab !== 'All Sites') {
        list = list.filter(s => (s.assigned_engineer || '').toLowerCase() === this.activeSiteTab.toLowerCase());
      }

      // Search query
      if (this.siteSearchQuery && this.siteSearchQuery.trim()) {
        const q = this.siteSearchQuery.toLowerCase().trim();
        list = list.filter(s =>
          (s.customer || '').toLowerCase().includes(q) ||
          (s.assigned_engineer || '').toLowerCase().includes(q) ||
          (s.region || '').toLowerCase().includes(q) ||
          (s.customer_type || '').toLowerCase().includes(q) ||
          (s.remarks || '').toLowerCase().includes(q)
        );
      }

      // Region filter
      if (this.siteRegionFilter) {
        list = list.filter(s => (s.region || '').toLowerCase() === this.siteRegionFilter.toLowerCase());
      }

      // Type filter
      if (this.siteTypeFilter) {
        if (this.siteTypeFilter === 'AMC') {
          list = list.filter(s => (s.customer_type || '').toUpperCase() === 'AMC');
        } else if (this.siteTypeFilter === 'Non-AMC') {
          list = list.filter(s => (s.customer_type || '').toUpperCase() !== 'AMC');
        }
      }

      return list;
    },

    currentTabEngineTotal() {
      return this.filteredSiteList.reduce((sum, s) => sum + (Number(s.no_of_engines) || 0), 0);
    },

    overallTotalSites() {
      return this.siteOwnershipList.length;
    },

    overallTotalEngines() {
      return this.siteOwnershipList.reduce((sum, s) => sum + (Number(s.no_of_engines) || 0), 0);
    },

    overallAmcSites() {
      return this.siteOwnershipList.filter(s => (s.customer_type || '').toUpperCase() === 'AMC').length;
    },

    siteSummaryData() {
      const engineerMap = {};

      // Ensure all known engineers appear
      this.siteOwnershipEngineers.forEach(eng => {
        engineerMap[eng] = {
          engineer: eng,
          total_sites: 0,
          total_engines: 0,
          amc_sites: 0,
          regions: new Set()
        };
      });

      this.siteOwnershipList.forEach(s => {
        const eng = s.assigned_engineer || 'Unassigned';
        if (!engineerMap[eng]) {
          engineerMap[eng] = {
            engineer: eng,
            total_sites: 0,
            total_engines: 0,
            amc_sites: 0,
            regions: new Set()
          };
        }
        engineerMap[eng].total_sites += 1;
        engineerMap[eng].total_engines += (Number(s.no_of_engines) || 0);
        if ((s.customer_type || '').toUpperCase() === 'AMC') {
          engineerMap[eng].amc_sites += 1;
        }
        if (s.region) {
          engineerMap[eng].regions.add(s.region);
        }
      });

      return Object.values(engineerMap).map(e => ({
        ...e,
        regions: Array.from(e.regions)
      }));
    }
  },

  methods: {
    getAuthHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` };
    },

    async fetchCurrentUser() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/user', {
          headers: this.getAuthHeaders()
        });
        this.currentUser = response.data;
        this.userEmail = response.data.email || '';
        if (this.currentUser.name) this.report.name = this.currentUser.name;
      } catch (err) {
        console.error('fetchCurrentUser error:', err);
      }
    },

    async fetchAllTasks() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/tasks', {
          headers: this.getAuthHeaders()
        });
        this.allTasks = response.data;
      } catch (err) {
        console.error('fetchAllTasks error:', err);
      }
    },

    async fetchLeaveRequests() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('https://employees.archenterprises.co.in/api/api/leave-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (this.currentUser && this.currentUser.name) {
          this.leaveRequests = data.filter(leave => leave.name === this.currentUser.name);
        } else {
          this.leaveRequests = [];
        }
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
      }
    },

    async fetchNotifications() {
      try {
        const token = localStorage.getItem('token');
        const [mentionsRes, unreadRes] = await Promise.all([
          axios.get('https://employees.archenterprises.co.in/api/api/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://employees.archenterprises.co.in/api/api/mentions/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        this.notifications = mentionsRes.data || [];
        this.unreadMentionsCount = unreadRes.data?.count || 0;
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    },

    async fetchBirthdays() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const allUsers = response.data;

        const currentMonth = new Date().getMonth();
        this.currentMonthName = new Date().toLocaleString('default', { month: 'long' });

        this.birthdayList = allUsers.filter(user => {
          if (!user.dateofbirth) return false;
          const dob = new Date(user.dateofbirth);
          return dob.getMonth() === currentMonth;
        }).sort((a, b) => {
          const dayA = new Date(a.dateofbirth).getDate();
          const dayB = new Date(b.dateofbirth).getDate();
          return dayA - dayB;
        });
      } catch (error) {
        console.error('Error fetching birthdays:', error);
      }
    },

    async fetchDepartments() {
      try {
        const res = await axios.get('https://employees.archenterprises.co.in/api/api/departments', {
          headers: this.getAuthHeaders()
        });
        if (Array.isArray(res.data) && res.data.length) this.departments = res.data;
      } catch (err) {
        console.error('fetchDepartments error:', err);
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    formatBirthdayDate(dateString) {
      if (!dateString) return '';
      const options = { day: 'numeric', month: 'long' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    },

    formatTimeAgo(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    getInitials(name) {
      if (!name) return 'U';
      return name.charAt(0).toUpperCase();
    },

    getLeaveIcon(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'fas fa-thermometer-half';
      if (type.includes('casual')) return 'fas fa-sun';
      if (type.includes('annual')) return 'fas fa-calendar-alt';
      if (type.includes('emergency')) return 'fas fa-ambulance';
      return 'fas fa-umbrella-beach';
    },

    getLeaveIconClass(leaveType) {
      const type = (leaveType || '').toLowerCase();
      if (type.includes('sick')) return 'leave-sick';
      if (type.includes('casual')) return 'leave-casual';
      if (type.includes('annual')) return 'leave-annual';
      return 'leave-default';
    },

    getLeaveStatusClass(status) {
      if (status === 'Approved') return 'status-approved';
      if (status === 'Rejected') return 'status-rejected';
      return 'status-pending';
    },

    wishBirthday(employee) {
      toastSuccess(`🎉 Happy Birthday ${employee.name}! 🎂\nWishing you a wonderful day!`);
    },

    highlightMentions(text) {
      if (!text) return '';
      return text.replace(
        /@([A-Za-z0-9_]+)/g,
        '<span class="mention-highlight">@$1</span>'
      );
    },

    goTo(route) {
      this.$router.push(`/${route}`);
    },

    goToTask(taskId) {
      this.$router.push(`/employee/mytask`);
    },

    async submitReport() {
      try {
        const formData = new FormData();
        formData.append('date', this.report.date);
        formData.append('name', this.report.name);
        formData.append('status', this.report.status);
        formData.append('department', this.report.department);
        formData.append('summary', this.report.summary);

        await axios.post('https://employees.archenterprises.co.in/api/api/daily-reports', formData, {
          headers: { ...this.getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });

        toastSuccess('Report submitted successfully!');
        this.showModal = false;
        this.report.summary = '';
      } catch (error) {
        console.error('Failed to submit report:', error);
        toastError('Page is under maintenance. Please try again later.');
      }
    },

    showFocusOnSBUButton() {
      const hasSeenFocus = localStorage.getItem('hasSeenSBUFocus');
      if (hasSeenFocus) return;

      setTimeout(() => {
        const btn = this.$refs.googleFormBtn;
        const card = this.$refs.googleFormCard;
        
        if (btn || card) {
          this.showFocusOverlay = true;
          this.focusTimer = setTimeout(() => {
            this.dismissFocusOverlay();
          }, 10000);
        }
      }, 1500);
    },

    dismissFocusOverlay() {
      this.showFocusOverlay = false;
      if (this.focusTimer) {
        clearTimeout(this.focusTimer);
      }
      localStorage.setItem('hasSeenSBUFocus', 'true');
    },

    openGoogleForm() {
      this.showGoogleFormModal = true;
      document.body.style.overflow = 'hidden';
      if (this.showFocusOverlay) {
        this.dismissFocusOverlay();
      }
    },

    closeGoogleForm() {
      this.showGoogleFormModal = false;
      document.body.style.overflow = '';
    },

    openFormInNewTab() {
      window.open('https://docs.google.com/forms/d/e/1FAIpQLSfwz35YgfHbSIm3-zapvywqD8pw56fXc-U5EwpCmcG3v3zwrg/viewform', '_blank');
    },

    toggleNotificationPanel() {
      this.showNotificationPanel = !this.showNotificationPanel;
      if (this.showNotificationPanel) {
        setTimeout(() => {
          document.addEventListener('click', this.closeNotificationPanel);
        }, 100);
      } else {
        document.removeEventListener('click', this.closeNotificationPanel);
      }
    },

    closeNotificationPanel(e) {
      if (!this.$el.querySelector('.notification-bell-wrapper')?.contains(e.target)) {
        this.showNotificationPanel = false;
        document.removeEventListener('click', this.closeNotificationPanel);
      }
    },

    logout() {
      axios.post('https://employees.archenterprises.co.in/api/api/logout', {}, {
        headers: this.getAuthHeaders()
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },

    formatFirstName(fullName) {
      if (!fullName) return '';
      return fullName.split(' ')[0];
    },

    downloadApk() {
      toastInfo('APK download starting...');
    },
    downloadIos() {
      toastInfo('iOS app coming soon!');
    },
    toggleDownloadMenu() {
      this.showDownloadMenu = !this.showDownloadMenu;
    },

    getPriorityClass(priority) {
      if (!priority) return 'medium';
      const p = priority.toLowerCase();
      if (p === 'high') return 'high';
      if (p === 'low') return 'low';
      return 'medium';
    },

    getStatusClass(status) {
      if (!status) return '';
      const s = status.toLowerCase();
      if (s === 'pending') return 'status-pending';
      if (s === 'in progress') return 'status-progress';
      if (s === 'completed') return 'status-completed';
      return '';
    },

    // =========================================================
    // 🏢 SITE OWNERSHIP METHODS
    // =========================================================
    openSiteOwnershipModal() {
      this.showSiteOwnershipModal = true;
      this.fetchSiteOwnership();
    },

    closeSiteOwnershipModal() {
      this.showSiteOwnershipModal = false;
    },

    getEngineerSiteCount(engineer) {
      if (!this.siteOwnershipList) return 0;
      return this.siteOwnershipList.filter(s => (s.assigned_engineer || '').toLowerCase() === engineer.toLowerCase()).length;
    },

    async fetchSiteOwnership() {
      this.siteOwnershipLoading = true;
      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'https://employees.archenterprises.co.in/api/api';

        const response = await axios.get(`${baseUrl}/site-ownership`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.data) {
          this.siteOwnershipList = response.data.sites || [];
          if (response.data.engineers && response.data.engineers.length > 0) {
            this.siteOwnershipEngineers = response.data.engineers;
          }
          if (response.data.regions && response.data.regions.length > 0) {
            this.siteOwnershipRegions = response.data.regions;
          }
        }
      } catch (err) {
        console.error('Failed to fetch site ownership from database:', err);
        toastError('Failed to load site ownership records from database');
      } finally {
        this.siteOwnershipLoading = false;
      }
    },

    openAddSiteModal(engineer = '') {
      this.editingSiteId = null;
      this.siteForm = {
        customer: '',
        no_of_engines: 1,
        region: 'South',
        assigned_engineer: engineer || (this.siteOwnershipEngineers.length > 0 ? this.siteOwnershipEngineers[0] : ''),
        customer_type: '',
        remarks: ''
      };
      this.showAddSiteModal = true;
    },

    openEditSiteModal(site) {
      this.editingSiteId = site.id;
      this.siteForm = {
        customer: site.customer,
        no_of_engines: site.no_of_engines || 1,
        region: site.region || 'South',
        assigned_engineer: site.assigned_engineer || '',
        customer_type: site.customer_type || '',
        remarks: site.remarks || ''
      };
      this.showAddSiteModal = true;
    },

    async saveSiteOwnership() {
      if (!this.siteForm.customer || !this.siteForm.assigned_engineer) {
        toastError('Please fill in customer name and assigned engineer');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'https://employees.archenterprises.co.in/api/api';

        if (this.editingSiteId) {
          await axios.put(`${baseUrl}/site-ownership/${this.editingSiteId}`, this.siteForm, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          toastSuccess('Site ownership updated in database!');
        } else {
          await axios.post(`${baseUrl}/site-ownership`, this.siteForm, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          toastSuccess('Site ownership added to database!');
        }

        this.showAddSiteModal = false;
        await this.fetchSiteOwnership();
      } catch (err) {
        console.error('Error saving site ownership to database:', err);
        toastError('Failed to save site ownership to database');
      }
    },

    async deleteSiteOwnership(id) {
      if (!confirm('Are you sure you want to delete this site assignment from the database?')) return;

      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'https://employees.archenterprises.co.in/api/api';

        await axios.delete(`${baseUrl}/site-ownership/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        toastSuccess('Site assignment deleted from database');
        await this.fetchSiteOwnership();
      } catch (err) {
        console.error('Error deleting site from database:', err);
        toastError('Failed to delete site from database');
      }
    },

    exportSiteOwnershipToExcel() {
      const rows = this.filteredSiteList;
      if (!rows || rows.length === 0) {
        toastInfo('No data available to export');
        return;
      }

      let csv = 'Sr No,Customer,No of Engines,Region,Assigned Engineer,Customer Type,Remarks\n';
      rows.forEach((r, idx) => {
        const cust = `"${(r.customer || '').replace(/"/g, '""')}"`;
        const eng = r.no_of_engines || 1;
        const reg = `"${(r.region || '').replace(/"/g, '""')}"`;
        const engineer = `"${(r.assigned_engineer || '').replace(/"/g, '""')}"`;
        const type = `"${(r.customer_type || '').replace(/"/g, '""')}"`;
        const rem = `"${(r.remarks || '').replace(/"/g, '""')}"`;
        csv += `${idx + 1},${cust},${eng},${reg},${engineer},${type},${rem}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Site_Ownership_${this.activeSiteTab}_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastSuccess('Site ownership exported successfully!');
    },

    async refreshAllData() {
      await Promise.all([
        this.fetchAllTasks(),
        this.fetchLeaveRequests(),
        this.fetchNotifications(),
        this.fetchBirthdays()
      ]);
    }
  },

  async mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    document.addEventListener('click', (e) => {
      if (!this.$el.querySelector('.download-app')?.contains(e.target)) {
        this.showDownloadMenu = false;
      }
    });

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.report.name = user.name || '';
      } catch (e) {}
    }

    await this.fetchCurrentUser();
    await this.refreshAllData();
    await this.fetchDepartments();
    
    this.showFocusOnSBUButton();

    // Auto-refresh every 30 seconds
    this.refreshTimer = setInterval(() => {
      this.refreshAllData();
    }, 30000);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkIfMobile);
    document.body.style.overflow = '';
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    document.removeEventListener('click', this.closeNotificationPanel);
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary: #4361ee;
  --primary-dark: #3a56d4;
  --secondary: #06ffa5;
  --dark: #1e293b;
  --gray: #64748b;
  --light: #f8fafc;
  --border: #e2e8f0;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
}

/* Focus Overlay Styles */
.layout.focus-overlay-active {
  overflow: hidden;
}

.focus-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modern Header */
.modern-header {
  background: white;
  backdrop-filter: blur(10px);
  padding: 0 2rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-menu-icon {
  display: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--dark);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-img {
  height: 36px;
  width: auto;
}

.logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  background: linear-gradient(135deg, var(--primary), #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dark);
  font-weight: 500;
}

.user-greeting i {
  font-size: 1.2rem;
  color: var(--primary);
}

/* Notification Bell */
.notification-bell-wrapper {
  position: relative;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--gray);
  transition: color 0.2s;
}

.notification-bell-wrapper:hover {
  color: var(--primary);
}

.notification-bell-wrapper .badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background: var(--danger);
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 20px;
  font-weight: 600;
}

.notification-dropdown {
  position: absolute;
  top: 45px;
  right: 0;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  z-index: 200;
  max-height: 350px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}

.notification-item i {
  color: var(--primary);
}

.notification-item small {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--gray);
}

.no-notif {
  padding: 20px;
  text-align: center;
  color: var(--gray);
}

.download-app {
  position: relative;
}

.download-btn {
  background: var(--light);
  border: 1px solid var(--border);
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.download-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.download-menu {
  position: absolute;
  top: 45px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 10;
  min-width: 140px;
}

.download-menu a {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--dark);
  transition: background 0.2s;
}

.download-menu a:hover {
  background: var(--light);
}

.google-form-btn {
  background: linear-gradient(135deg, #ea4335, #c5221f);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  transition: all 0.2s;
  position: relative;
}

.google-form-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(234, 67, 53, 0.3);
}

.btn-glowing {
  animation: btnGlow 1s ease-in-out infinite;
}

@keyframes btnGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(234, 67, 53, 0.3);
    transform: scale(1.02);
  }
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 20px;
  animation: badgePulse 1s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.logout-btn-modern {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--gray);
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 40px;
  transition: all 0.2s;
}

.logout-btn-modern:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Main Layout */
.main-content {
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
}

.content {
  flex: 1;
  background: transparent;
  border-radius: 24px;
  transition: all 0.3s ease;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%);
  border-radius: 24px;
  padding: 2rem 2.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 15px 35px -10px rgba(124, 58, 237, 0.5);
  position: relative;
  overflow: hidden;
}
.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotateGlow 15s linear infinite;
  pointer-events: none;
}
@keyframes rotateGlow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.banner-content h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.banner-content p {
  opacity: 0.9;
  font-size: 0.9rem;
}

.date-badge {
  background: rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  backdrop-filter: blur(4px);
}

/* Dashboard Cards Row */
.dashboard-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.dashboard-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.8);
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.tasks-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.attendance-icon { background: linear-gradient(135deg, #10b981, #059669); }
.etp-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
.help-icon { background: linear-gradient(135deg, #ec4899, #db2777); }
.request-icon { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.kra-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.dsi-icon { background: linear-gradient(135deg, #f97316, #ea580c); }
.salary-icon { background: linear-gradient(135deg, #f97316, #ea580c); }
.resource-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.leaves-icon { background: linear-gradient(135deg, #ef4444, #b91c1c); }
.notifications-icon { background: linear-gradient(135deg, #facc15, #d97706); }
.mentions-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.visits-icon { background: linear-gradient(135deg, #f97316, #ea580c); }
.crm-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
.po-icon { background: linear-gradient(135deg, #c023d1, #a51ab4); }
.todo-icon { background: linear-gradient(135deg, #2b2b2a, #686866); }

.calendar-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.balance-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.visit-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.leave-icon { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.chat-icon { background: linear-gradient(135deg, #ec4899, #db2777); }
.google-form-icon { background: linear-gradient(135deg, #ea4335, #c5221f); }

.card-info {
  flex: 1;
}

.label {
  font-size: 1.1rem;
  color: var(--dark);
  font-weight: 700;
  margin-bottom: 0.25rem;
  letter-spacing: -0.01em;
}

.value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--gray);
  font-weight: 500;
}

.arrow-icon {
  color: var(--gray);
  font-size: 0.9rem;
}

/* Split Dashboard */
.dashboard-split {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card, .upcoming-card, .recent-leaves-card, .birthday-widget {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header h3 i {
  color: var(--primary);
}

.card-header i {
  color: var(--primary);
}

.current-month-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  padding: 0.25rem 0.75rem;
  border-radius: 40px;
  font-size: 0.7rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: var(--light);
}

/* Birthday Widget Styles */
.birthday-list {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.birthday-list::-webkit-scrollbar {
  width: 4px;
}

.birthday-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.birthday-list::-webkit-scrollbar-thumb {
  /* background: #f59e0b; */
  border-radius: 4px;
}

.birthday-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #fff9f0, #fff5e6);
  padding: 0.75rem 1rem;
  border-radius: 16px;
  transition: all 0.3s ease;
  animation: slideIn 0.4s ease backwards;
  border: 1px solid #fef3c7;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.birthday-item:hover {
  transform: translateX(4px);
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.birthday-avatar {
  position: relative;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f59e0b;
  padding: 6px;
  background: white;
}

.cake-icon {
  position: absolute;
  bottom: -4px;
  right: -6px;
  background: #f59e0b;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: white;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.birthday-info {
  flex: 1;
}

.birthday-info strong {
  font-size: 0.9rem;
  color: #1e293b;
  display: block;
  margin-bottom: 4px;
}

.birthday-date {
  font-size: 0.7rem;
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.birthday-dept {
  font-size: 0.65rem;
  color: #94a3b8;
}

.wish-button {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 500;
  color: #d97706;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.wish-button:hover {
  /* background: linear-gradient(135deg, #f59e0b, #d97706); */
  color: white;
  transform: scale(1.05);
}

.no-birthday-state {
  text-align: center;
  padding: 2rem;
}

.no-birthday-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.no-birthday-state p {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.no-birthday-state span {
  font-size: 0.7rem;
  color: #94a3b8;
}

/* Upcoming Tasks & Leaves */
.upcoming-list {
  max-height: 350px;
  overflow-y: auto;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 0.5rem;
  background: var(--light);
}

.upcoming-item:hover {
  background: #f1f5f9;
}

.task-priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gray);
}

.task-priority.high { background: #ef4444; }
.task-priority.medium { background: #f59e0b; }
.task-priority.low { background: #10b981; }

.task-details {
  flex: 1;
}

.task-details strong {
  display: block;
  font-size: 0.85rem;
  color: var(--dark);
}

.deadline {
  font-size: 0.7rem;
  color: var(--gray);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.task-status {
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  display: inline-block;
  margin-top: 0.25rem;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-progress {
  background: #dbeafe;
  color: #2563eb;
}

.status-completed {
  background: #d1fae5;
  color: #059669;
}

.task-arrow {
  color: var(--gray);
  font-size: 0.8rem;
}

/* Recent Leaves Card */
.leaves-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.leave-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--light);
  border-radius: 12px;
  transition: all 0.2s;
}

.leave-item:hover {
  background: #f1f5f9;
}

.leave-icon-small {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
}

.leave-sick { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.leave-casual { background: linear-gradient(135deg, #10b981, #059669); }
.leave-annual { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.leave-default { background: linear-gradient(135deg, #14b8a6, #0d9488); }

.leave-details {
  flex: 1;
}

.leave-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--dark);
}

.leave-dates {
  font-size: 0.7rem;
  color: var(--gray);
}

.leave-status {
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
}

.status-approved {
  background: #d1fae5;
  color: #059669;
}

.status-rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.no-leaves, .no-tasks {
  text-align: center;
  padding: 2rem;
  color: var(--gray);
}

.no-leaves i, .no-tasks i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modern-modal {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 500px;
  padding: 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.google-form-modal {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 900px;
  height: 85vh;
  max-height: 700px;
  padding: 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.google-form-header {
  background: var(--primary);
}

.google-form-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.form-info-banner {
  background: #e8f0fe;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: #1967d2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.google-form-iframe {
  width: 100%;
  height: calc(100% - 45px);
  border: none;
}

.google-form-footer {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  background: var(--light);
}

.remind-later-btn, .open-new-tab-btn {
  padding: 0.5rem 1rem;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remind-later-btn {
  border: 1px solid var(--border);
  background: white;
}

.remind-later-btn:hover {
  background: var(--light);
}

.open-new-tab-btn {
  border: none;
  background: var(--primary);
  color: white;
}

.open-new-tab-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: white;
}

.close-btn {
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
  color: white;
}

.modern-modal form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half {
  flex: 1;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  background: var(--primary);
  color: white;
  border: none;
  width: 100%;
  padding: 0.85rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover {
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-split {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .modern-header {
    padding: 0 1rem;
  }
  
  .mobile-menu-icon {
    display: block;
  }
  
  .logo-text {
    display: none;
  }
  
  .user-greeting span {
    display: none;
  }
  
  .user-greeting i {
    font-size: 1.25rem;
  }
  
  .logout-btn-modern span {
    display: none;
  }
  
  .logout-btn-modern i {
    font-size: 1.2rem;
  }
  
  .google-form-btn span {
    display: none;
  }
  
  .google-form-btn i {
    font-size: 1.2rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .welcome-banner {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
    padding: 1.25rem;
  }
  
  .banner-content h1 {
    font-size: 1.2rem;
  }
  
  .dashboard-row {
    grid-template-columns: 1fr;
  }
  
  .dashboard-card {
    padding: 1rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .google-form-modal {
    width: 95%;
    height: 90vh;
  }
  
  .google-form-header h2 {
    font-size: 1rem;
  }
  
  .notification-dropdown {
    width: 280px;
    right: -50px;
  }
  
  .birthday-item {
    padding: 0.6rem;
  }
  
  .avatar-img {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 0;
  }
  
  .dashboard-split {
    gap: 1rem;
  }
}




.disabled {
  opacity: 0.6;
  cursor: not-allowed !important;
}

.card-glowing {
  position: relative;
  animation: cardGlow 1s ease-in-out infinite;
  border: 2px solid #ea4335 !important;
}

@keyframes cardGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.5);
    border-color: #ea4335;
  }
  50% {
    box-shadow: 0 0 0 15px rgba(234, 67, 53, 0.2);
    border-color: #ff6b5e;
  }
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  pointer-events: none;
  animation: ringPulse 1s ease-out infinite;
}

@keyframes ringPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.7);
    opacity: 1;
  }
  100% {
    box-shadow: 0 0 0 30px rgba(234, 67, 53, 0);
    opacity: 0;
  }
}
.dashboard-card {
  position: relative;  /* Ensure the card has relative positioning */
  overflow: hidden;    /* Optional: keeps corners clean if tag extends */
}

.new-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4d4f;  /* Red color for "New" */
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.active-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #52c41a;  /* Green color for "Active" */
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}


/* Responsive visibility classes - FIXED */
@media (max-width: 768px) {
  .mobile-only { 
    display: flex !important; 
  }
  .desktop-only { 
    display: none !important; 
  }
}

@media (min-width: 769px) {
  .mobile-only { 
    display: none !important; 
  }
  .desktop-only { 
    display: flex !important; 
  }
}
/* Mobile Card Organization Styles */
.mobile-section-title {
  grid-column: 1 / -1;
  padding: 1rem 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark);
  border-bottom: 2px solid var(--primary);
  margin-bottom: 0.5rem;
  display: none;
}

.mobile-card-group {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(241, 245, 249, 0.5);
  padding: 0.75rem;
  border-radius: 16px;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border);
}

.group-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px dashed var(--border);
  margin-bottom: 0.25rem;
}

.group-label i {
  color: var(--primary);
  font-size: 0.9rem;
}

/* Enhanced Mobile Card Styles */
@media (max-width: 768px) {
  .mobile-section-title {
    display: block;
  }

  .mobile-card-group {
    padding: 0.75rem;
    border-radius: 16px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .mobile-card-group .dashboard-card {
    margin-bottom: 0.25rem;
    padding: 0.75rem;
    border-radius: 12px;
    background: var(--light);
    border: 1px solid transparent;
    transition: all 0.2s ease;
  }

  .mobile-card-group .dashboard-card:last-child {
    margin-bottom: 0;
  }

  .mobile-card-group .dashboard-card:active {
    transform: scale(0.98);
    background: #e8ecf1;
  }

  .group-label {
    font-size: 0.7rem;
    padding: 0.2rem 0 0.4rem 0;
  }

  .mobile-card-group .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
    border-radius: 12px;
  }

  .mobile-card-group .label {
    font-size: 0.9rem;
  }

  .mobile-card-group .progress-text {
    font-size: 0.65rem;
  }

  .mobile-card-group .new-tag {
    font-size: 8px;
    padding: 1px 6px;
    top: 6px;
    right: 6px;
  }

  /* Smooth scroll for dashboard */
  .dashboard-row {
    padding-bottom: 80px;
    gap: 0.75rem;
  }
}

/* Compact view for smaller screens */
@media (max-width: 480px) {
  .mobile-card-group {
    padding: 0.5rem;
    border-radius: 12px;
  }

  .mobile-card-group .dashboard-card {
    padding: 0.6rem;
    border-radius: 10px;
  }

  .mobile-card-group .card-icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
    border-radius: 10px;
  }

  .mobile-card-group .label {
    font-size: 0.8rem;
  }

  .group-label {
    font-size: 0.65rem;
  }

  .mobile-section-title {
    font-size: 1rem;
    padding: 0.75rem 0 0.5rem 0;
  }
}

/* Card hover animation for desktop */
@media (min-width: 769px) {
  .mobile-card-group .dashboard-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: var(--border);
  }
}

/* Status indicators for cards */
.mobile-card-group .dashboard-card .card-info .label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Badge for card count */
.mobile-card-group .group-label .badge-count {
  background: var(--primary);
  color: white;
  font-size: 0.6rem;
  padding: 1px 8px;
  border-radius: 20px;
  margin-left: auto;
}

/* Category icon animations */
.mobile-card-group .group-label i {
  transition: transform 0.3s ease;
}

.mobile-card-group:hover .group-label i {
  transform: rotate(-5deg);
}

/* Quick action indicator */
.mobile-card-group .dashboard-card .card-info .quick-action {
  font-size: 0.6rem;
  color: var(--primary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.mobile-card-group .dashboard-card:active .card-info .quick-action {
  opacity: 1;
}

/* ========================================================= */
/* 🏢 SITE OWNERSHIP CARD & MODAL STYLING */
/* ========================================================= */

.card-icon.site-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

/* Modal Overlay & Window */
.site-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: siteFadeIn 0.25s ease-out;
}

.site-modal-window {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 1180px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(226, 232, 240, 0.8);
  overflow: hidden;
  animation: siteSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Modal Header */
.site-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.site-modal-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.site-modal-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.site-modal-header-left h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.site-modal-header-left p {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0.2rem 0 0 0;
}

.site-modal-header-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.site-quick-stats {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.stat-pill {
  padding: 0.35rem 0.8rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
}

.stat-pill.total { color: #60a5fa; border-color: rgba(96, 165, 250, 0.3); }
.stat-pill.engines { color: #34d399; border-color: rgba(52, 211, 153, 0.3); }
.stat-pill.amc { color: #f472b6; border-color: rgba(244, 114, 182, 0.3); }

.site-modal-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.site-modal-close:hover {
  background: #ef4444;
  color: white;
  transform: rotate(90deg);
}

/* Modal Toolbar */
.site-modal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  gap: 1rem;
  flex-wrap: wrap;
}

.site-search-box {
  position: relative;
  flex: 1;
  min-width: 260px;
  max-width: 400px;
}

.site-search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
}

.site-search-field {
  width: 100%;
  padding: 0.55rem 2rem 0.55rem 2.2rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.88rem;
  background: white;
  color: #1e293b;
  transition: all 0.2s;
}

.site-search-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.site-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.8rem;
}

.site-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.site-filter-item {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 0.6rem;
  gap: 0.4rem;
  color: #64748b;
  font-size: 0.85rem;
}

.site-select {
  border: none;
  background: transparent;
  padding: 0.55rem 0.2rem;
  font-size: 0.85rem;
  color: #1e293b;
  cursor: pointer;
}

.site-select:focus {
  outline: none;
}

.site-btn-export {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.site-btn-export:hover {
  background: #059669;
  transform: translateY(-1px);
}

.site-btn-add {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

.site-btn-add:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
}

/* Excel Style Tabs Bar */
.site-sheet-tabs-bar {
  display: flex;
  align-items: center;
  padding: 0 1.75rem;
  background: #e2e8f0;
  border-bottom: 1px solid #cbd5e1;
  gap: 0.35rem;
  overflow-x: auto;
  scrollbar-width: thin;
}

.sheet-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  top: 1px;
  white-space: nowrap;
}

.sheet-tab-btn:hover {
  background: #ffffff;
  color: #1e293b;
}

.sheet-tab-btn.active {
  background: #ffffff;
  color: #2563eb;
  border-color: #cbd5e1 #cbd5e1 #ffffff #cbd5e1;
  box-shadow: 0 -3px 0 0 #2563eb;
}

.sheet-tab-count {
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
  font-size: 0.75rem;
  padding: 0.15rem 0.45rem;
  border-radius: 20px;
  font-weight: 700;
}

.sheet-tab-btn.active .sheet-tab-count {
  background: #dbeafe;
  color: #1d4ed8;
}

/* Modal Body */
.site-modal-body {
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  flex: 1;
  background: #f8fafc;
}

/* KPI Summary Cards Grid */
.site-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.site-kpi-card {
  background: white;
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s;
}

.site-kpi-card:hover {
  transform: translateY(-2px);
}

.kpi-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
}

.kpi-blue .kpi-icon-wrap { background: #dbeafe; color: #2563eb; }
.kpi-emerald .kpi-icon-wrap { background: #d1fae5; color: #059669; }
.kpi-purple .kpi-icon-wrap { background: #ede9fe; color: #7c3aed; }
.kpi-amber .kpi-icon-wrap { background: #ffedd5; color: #ea580c; }

.kpi-number {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.1;
}

.kpi-title {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 0.2rem;
}

/* Table Wrapper & Title */
.site-table-wrapper {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.site-table-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #fdfdfd;
  border-bottom: 1px solid #e2e8f0;
}

.site-table-title-row h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.site-count-badge {
  background: #e2e8f0;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  margin-left: 0.5rem;
}

.engine-sum-tag {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.engine-sum-tag strong {
  font-weight: 800;
}

/* Modern Data Table */
.table-scroll-container {
  overflow-x: auto;
  max-height: 520px;
}

.site-data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
}

.site-data-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  padding: 0.85rem 1rem;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  position: sticky;
  top: 0;
  z-index: 1;
}

.site-data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.site-data-table tbody tr:hover {
  background: #f8fafc;
}

/* Excel Style Table Grid */
.excel-grid-table td,
.excel-grid-table th {
  border-right: 1px solid #f1f5f9;
}

.excel-grid-table td:last-child,
.excel-grid-table th:last-child {
  border-right: none;
}

.customer-title-cell {
  font-weight: 600;
  color: #0f172a !important;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.customer-row-icon {
  color: #94a3b8;
  font-size: 0.85rem;
}

.engine-badge-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #047857;
  font-weight: 700;
  font-size: 0.9rem;
  border: 1px solid #a7f3d0;
}

.region-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.reg-south { background: #e0f2fe; color: #0369a1; }
.reg-west { background: #fef3c7; color: #b45309; }
.reg-north { background: #f3e8ff; color: #7e22ce; }
.reg-east { background: #fee2e2; color: #b91c1c; }
.reg-central { background: #f1f5f9; color: #475569; }

.assigned-eng-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: #1e293b;
}

.assigned-eng-pill i {
  color: #3b82f6;
}

.cust-type-pill {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.cust-type-pill.amc {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.cust-type-pill.other {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.cust-type-pill.blank {
  color: #94a3b8;
}

.engineer-profile-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.engineer-circle-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.amc-pill-count {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  background: #d1fae5;
  color: #065f46;
  font-weight: 700;
  font-size: 0.85rem;
}

.btn-view-eng-sites {
  padding: 0.35rem 0.8rem;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;
}

.btn-view-eng-sites:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* Actions */
.site-actions-group {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.site-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  color: #64748b;
  transition: all 0.2s;
}

.site-action-btn.edit:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #93c5fd;
}

.site-action-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fca5a5;
}

.table-footer-row td {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
  padding: 0.9rem 1rem;
  font-size: 0.95rem;
}

.site-empty-cell {
  text-align: center;
  padding: 3rem 1rem !important;
}

.empty-state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
}

.empty-state-box i {
  font-size: 2.5rem;
  opacity: 0.5;
}

.empty-state-box p {
  margin: 0;
  font-size: 0.95rem;
}

/* Sub-modal Form */
.site-form-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.site-form-modal-box {
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: siteSlideUp 0.25s ease-out;
}

.site-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  background: #1e293b;
  color: white;
}

.site-form-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.site-form-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row-site {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group-site {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group-site label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-group-site .required {
  color: #ef4444;
}

.form-control-site {
  padding: 0.65rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #1e293b;
  background: white;
  transition: all 0.2s;
}

.form-control-site:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.site-form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.site-btn-cancel {
  padding: 0.6rem 1.25rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.site-btn-submit {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

@keyframes siteFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes siteSlideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Mobile Responsive Adjustments */
@media (max-width: 768px) {
  .site-modal-window {
    max-height: 95vh;
    border-radius: 16px;
  }
  .site-modal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 1rem;
  }
  .site-modal-header-right {
    width: 100%;
    justify-content: space-between;
  }
  .site-modal-toolbar {
    padding: 0.8rem 1rem;
  }
  .site-search-box {
    max-width: 100%;
  }
  .site-toolbar-actions {
    width: 100%;
  }
  .site-sheet-tabs-bar {
    padding: 0 1rem;
  }
  .site-modal-body {
    padding: 1rem;
  }
  .form-row-site {
    grid-template-columns: 1fr;
  }
}
</style>