<template>
  <div class="layout" :class="{ 'focus-overlay-active': showFocusOverlay }">
    <!-- Focus Overlay for highlighting SBU button -->
    <div v-if="showFocusOverlay" class="focus-overlay" @click="dismissFocusOverlay"></div>

  

    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- ================= DIWALI SPECIAL FESTIVE SUITE ================= -->
        <!-- 🪔 Shown only: 2 days before Diwali holiday → 1 day after Diwali holiday -->
        <template v-if="isDiwaliSeason">

        <!-- 🪔 2. Diwali Enhanced Welcome Banner with Sky Lanterns & Animated Diyas -->
        <div class="welcome-banner diwali-banner-theme">
          <!-- Left & Right Hanging Akash Kandil (Traditional Lanterns) -->
          <div class="akash-kandil kandil-left">
            <div class="kandil-thread"></div>
            <div class="kandil-body">
              <div class="kandil-core"></div>
              <div class="kandil-rays"></div>
            </div>
            <div class="kandil-tassels">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>

          <div class="akash-kandil kandil-right">
            <div class="kandil-thread"></div>
            <div class="kandil-body">
              <div class="kandil-core"></div>
              <div class="kandil-rays"></div>
            </div>
            <div class="kandil-tassels">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>

          <div class="banner-content diwali-banner-content">
            <div class="diwali-greeting-ribbon">
              <i class="fas fa-star"></i>
              <span>शुभ दीपावली • SHUBH DEEPAVALI 2026 • HAPPY DIWALI</span>
              <i class="fas fa-star"></i>
            </div>

            <div class="banner-title-diya-row">
              <div class="banner-diya-art left-diya">
                <div class="diya-flame-wrapper">
                  <div class="flame-glow"></div>
                  <div class="flame-core"></div>
                </div>
                <div class="diya-clay-base"></div>
              </div>

              <h1>Welcome back, {{ formatFirstName(currentUser.name) }}!</h1>

              <div class="banner-diya-art right-diya">
                <div class="diya-flame-wrapper">
                  <div class="flame-glow"></div>
                  <div class="flame-core"></div>
                </div>
                <div class="diya-clay-base"></div>
              </div>
            </div>

            <p class="diwali-quote-text">
              ✨ May the divine festival of lights illuminate your life with infinite joy, good health & roaring success! ✨
            </p>
          </div>

          <!-- Banner Controls & Date Badge -->
          <div class="banner-diwali-actions">
            <div class="date-badge">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formattedDate }}</span>
            </div>

            <button 
              type="button" 
              class="diwali-action-chip cracker-btn" 
              @click="burstDiwaliCrackers"
              title="Burst celebratory Diwali fireworks"
            >
              <i class="fas fa-fire"></i>
              <span>Burst Crackers 🎆</span>
            </button>

            <button 
              type="button" 
              class="diwali-action-chip wishes-btn" 
              @click="showDiwaliWishesModal = true"
              title="View Arch Enterprises Diwali Message"
            >
              <i class="fas fa-envelope-open-text"></i>
              <span>Diwali Message 💌</span>
            </button>
          </div>
        </div>

        <!-- 🪔 3. "Arch Diwali Mahotsav 2026" Interactive Showcase & Festive Cards -->
        <div v-if="showDiwaliCelebration" class="diwali-mahotsav-card">
          <div class="mahotsav-header">
            <div class="mahotsav-title-box">
              <div class="diya-icon-emblem">
                <i class="fas fa-sun"></i>
              </div>
              <div>
                <h3>Arch IT Solutions & Enterprises • Diwali Mahotsav 2026</h3>
                <p>Festival of Lights Celebration & Interactive Diya Lighting</p>
              </div>
            </div>

            <div class="mahotsav-tools">
              <span class="diyas-status-pill">
                <i class="fas fa-fire"></i>
                <strong>{{ litDiyasCount }} / 5</strong> Diyas Illuminated
              </span>
              <button class="btn-light-all-diyas" @click="lightAllDiyas">
                <i class="fas fa-magic"></i> Light All Diyas
              </button>
            </div>
          </div>

          <div class="mahotsav-grid">
            <!-- Left: 5 Sacred Diyas Interactive Station -->
            <div class="diya-station-box">
              <div class="station-label">
                <i class="fas fa-star text-amber"></i>
                <span>Light the 5 Sacred Diyas for Blessings & Prosperity</span>
              </div>

              <div class="diyas-rack">
                <div 
                  v-for="(diya, idx) in diwaliBlessings" 
                  :key="'blessing-' + idx"
                  class="diya-rack-item"
                  :class="{ 'is-lit': litDiyas[idx] }"
                  @click="toggleDiya(idx)"
                  :title="litDiyas[idx] ? 'Click to unlight' : 'Click to light this Diya!'"
                >
                  <div class="diya-lamp">
                    <div class="diya-lamp-flame">
                      <div class="flame-aura"></div>
                      <div class="flame-teardrop"></div>
                    </div>
                    <div class="diya-earthen-cup">
                      <div class="cup-lip"></div>
                      <div class="cup-wick"></div>
                    </div>
                  </div>
                  <span class="diya-blessing-name">{{ diya.name }}</span>
                  <span class="diya-blessing-desc">{{ diya.desc }}</span>
                  <span class="diya-tap-hint">{{ litDiyas[idx] ? '● Illuminated' : 'Tap to Light' }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Corporate Holiday Notice & Sweets Distribution -->
            <div class="diwali-notices-box">
              <div class="station-label">
                <i class="fas fa-gift text-rose"></i>
                <span>Diwali Festivities & Holidays Notice</span>
              </div>

              <div class="festive-notices-list">
                <div class="notice-row holiday-row">
                  <div class="notice-icon holiday-icon"><i class="fas fa-calendar-alt"></i></div>
                  <div class="notice-text">
                    <strong>Diwali Holidays 2026</strong>
                    <span>Dhanteras, Naraka Chaturdashi, Lakshmi Pujan & Diwali Padwa</span>
                  </div>
                  <span class="notice-chip green">Confirmed</span>
                </div>

                <div class="notice-row sweet-row">
                  <div class="notice-icon sweet-icon"><i class="fas fa-gift"></i></div>
                  <div class="notice-text">
                    <strong>Festive Gift & Faral Sweet Hamper</strong>
                    <span>Please collect your Diwali Gift Box from the HR Desk today!</span>
                  </div>
                  <span class="notice-chip amber">HR Desk</span>
                </div>

                <div class="notice-row bonus-row">
                  <div class="notice-icon bonus-icon"><i class="fas fa-award"></i></div>
                  <div class="notice-text">
                    <strong>Leadership Message</strong>
                    <span>"Gratitude to all engineers & staff for an extraordinary year of innovation!"</span>
                  </div>
                  <span class="notice-chip purple">Arch Leadership</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 🪔 4. Diwali Special Wishes Modal -->
        <div v-if="showDiwaliWishesModal" class="diwali-modal-backdrop" @click.self="showDiwaliWishesModal = false">
          <div class="diwali-wishes-modal">
            <button class="modal-close-x" @click="showDiwaliWishesModal = false">
              <i class="fas fa-times"></i>
            </button>

            <div class="modal-rangoli-header">
              <div class="modal-diya-glow">
                <i class="fas fa-sun"></i>
              </div>
              <h2>✨ शुभ दीपावली ✨</h2>
              <p class="modal-sub">Warm Diwali Greetings from Arch IT Solutions & Enterprises</p>
            </div>

            <div class="modal-letter-content">
              <p>Dear <strong>{{ currentUser.name || 'Ajay' }}</strong> and Arch Family,</p>
              <p>
                On this auspicious festival of lights, we express our heartfelt appreciation for your dedication, excellence, and passion. May the divine glow of Diwali illuminate your paths with endless wisdom, good health, and professional triumphs.
              </p>
              <p>
                May Goddess Lakshmi and Lord Ganesha bless you and your loved ones with peace, joy, and prosperous new beginnings.
              </p>
              <div class="modal-signoff">
                <div class="signoff-signature">Prasad Kothawade</div>
                <span>Management & HR Team</span>
                <small>Arch IT Solutions & Arch Enterprises</small>
              </div>
            </div>

            <div class="modal-actions-row">
              <button class="modal-cracker-burst-btn" @click="burstDiwaliCrackers">
                <i class="fas fa-sparkles"></i> Burst Fireworks 🎆
              </button>
              <button class="modal-done-btn" @click="showDiwaliWishesModal = false">
                Thank You & Happy Diwali! 🪔
              </button>
            </div>
          </div>
        </div>

        </template><!-- end v-if="isDiwaliSeason" -->

        <!-- Regular Welcome Banner (Non-Diwali Season) -->
        <div v-else class="welcome-banner">
          <div class="banner-content">
            <h1>Welcome back, {{ formatFirstName(currentUser.name) || 'Employee' }}!</h1>
            <p>Here's what's happening with your work today.</p>
          </div>
          <div class="date-badge">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formattedDate }}</span>
          </div>
        </div>


        <!-- Probation Status Banner -->
        <div v-if="isProbation" class="dashboard-probation-banner">
          <div class="dp-header">
            <div class="dp-badge">
              <i class="fas fa-shield-alt"></i> Probation Period Active
            </div>
            <div class="dp-countdown">
              <i class="fas fa-hourglass-half"></i> <strong>{{ probationDaysLeft }}</strong> Days Remaining (Ends: {{ probationEndDateFormatted }})
            </div>
          </div>
          <div class="dp-rules-grid">
            <div class="dp-rule-item warning-rule">
              <div class="dp-rule-icon"><i class="fas fa-calendar-times"></i></div>
              <div class="dp-rule-text">
                <strong>Leave Applications Locked</strong>
                <span>Employees in probation cannot apply for leaves.</span>
              </div>
            </div>
            <div class="dp-rule-item danger-rule">
              <div class="dp-rule-icon"><i class="fas fa-user-clock"></i></div>
              <div class="dp-rule-text">
                <strong>Unmarked Attendance = Unpaid Leave</strong>
                <span>If attendance is missed, it is marked as Unpaid Leave.</span>
              </div>
            </div>
            <div class="dp-rule-item info-rule">
              <div class="dp-rule-icon"><i class="fas fa-adjust"></i></div>
              <div class="dp-rule-text">
                <strong>Half Day = Salary Deduction</strong>
                <span>Taking a half day incurs a half-day salary deduction.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Cards Grid -->
     <!-- KPI Cards Grid - Organized for Mobile -->
<div class="dashboard-row">
  <!-- Primary Cards (Always Visible for regular staff) -->
  <div v-if="!isHrOrAdmin" class="dashboard-card clickable-card" @click="goTo('employee/mytask')">
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
 <div v-if="onlyHR" class="dashboard-card clickable-card" @click="goToHrDashboard">
      <div class="card-icon hr-icon">
        <i class="fas fa-user-shield"></i>
      </div>
      <div class="card-info">
        <p class="label">HR Dashboard</p>
        <span class="progress-text">Access HR Admin Portal</span>
      </div>
    </div>
    
  <div v-if="canViewCRM || onlyViewMarketing" class="dashboard-card clickable-card" @click="goTo('employee/Customerregistrations')">
    <div class="card-icon crm-icon">
      <i class="fas fa-users"></i>
    </div>
    <div class="card-info">
      <p class="label">CRM</p>
      <span class="progress-text">Manage customers & add PO</span>
    </div>
  </div>

  <div v-if="onlyViewITSales" class="dashboard-card clickable-card" @click="goTo('employee/lead-management')">
    <div class="card-icon leads-icon">
      <i class="fas fa-funnel-dollar"></i>
    </div>
    <div class="card-info">
      <p class="label">Lead Management</p>
      <span class="progress-text">Track & convert IT sales leads</span>
    </div>
  </div>
 
    <div v-if="canViewCRM" class="dashboard-card clickable-card desktop-only" @click="goTo('employee/viewallpo')">
      <div class="card-icon po-icon">
        <i class="fas fa-file-invoice"></i>
      </div>
      <div class="card-info">
        <p class="label">View all PO</p>
        <span class="progress-text">Manage Purchase Orders</span>
      </div>
    </div>  
     <div v-if="canViewCRM" class="dashboard-card clickable-card" @click="goTo('employee/visitschedule')">
      <div class="card-icon visits-icon">
        <i class="fas fa-map-marked-alt"></i>
      </div>
      <div class="card-info">
        <p class="label">Visit Schedule</p>
        <span class="progress-text">View & Manage Visits</span>
      </div>
    </div>
    <div v-if="onlyViewITTeam || onlyViewMarketing" class="dashboard-card clickable-card desktop-only" @click="goTo('employee/archapps')">
      <div class="card-icon google-form-icon">
        <i class="fas fa-mobile-alt"></i>
      </div>
      <div class="card-info">
        <p class="label">My Apps</p>
        <span class="progress-text">View & Manage Tasks</span>
      </div>
    </div>

    <div v-if="onlyViewMarketing || onlyViewITTeam" class="dashboard-card clickable-card desktop-only" @click="goTo('employee/socialmediamanagement')">
      <div class="card-icon social-icon">
        <i class="fas fa-share-alt"></i>
      </div>
      <div class="card-info">
        <p class="label">Social Media</p>
        <span class="progress-text">View & Manage Social Media </span>
      </div>
    </div>

    <div class="dashboard-card clickable-card desktop-only" @click="goTo('employee/ETPSession')">
      <div class="card-icon site-icon">
        <i class="fas fa-chalkboard-teacher"></i>
      </div>
      <div class="card-info">
        <p class="label">ETP Sessions</p>
        <span class="progress-text">View & Manage ETP Sessions</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card desktop-only" @click="goTo('employee/viewkra')">
      <div class="card-icon chat-icon">
        <i class="fas fa-chart-line"></i>
      </div>
      <div class="card-info">
        <p class="label">KPI's</p>
        <span class="progress-text">View & Manage KPI's</span>
      </div>
    </div>

     <div class="dashboard-card clickable-card desktop-only" @click="goTo('employee/mydsi')">
      <div class="card-icon notifications-icon">
        <i class="fas fa-lightbulb"></i>
      </div>
      <div class="card-info">
        <p class="label">DSI </p>
        <span class="progress-text">Daily Small Improvements</span>
      </div>
    </div>

    <div class="dashboard-card clickable-card desktop-only" @click="goTo('employee/vault')">
      <div class="card-icon request-icon">
        <i class="fas fa-shield-alt"></i>
      </div>
      <div class="card-info">
        <p class="label">Secure Vault </p>
        <span class="progress-text">Manage sensitive information</span>
      </div>
    </div>
    <div v-if="onlyViewITLead" class="dashboard-card clickable-card desktop-only" @click="goTo('employee/empworkreport')">
      <div class="card-icon todo-icon">
        <i class="fas fa-folder"></i>
      </div>
      <div class="card-info">
        <p class="label">Work Report </p>
        <span class="progress-text">View & Manage Work Report</span>
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
    
    <div class="dashboard-card clickable-card" @click="goTo('employee/visitschedule')">
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

    <div v-if="onlyViewITSales" class="dashboard-card clickable-card mobile-only" @click="goTo('employee/lead-management')">
      <div class="card-icon leads-icon">
        <i class="fas fa-funnel-dollar"></i>
      </div>
      <div class="card-info">
        <p class="label">Lead Management</p>
        <span class="progress-text">Track & convert IT sales leads</span>
      </div>
    </div>

    <div v-if="onlyViewMarketing || onlyViewITTeam" class="dashboard-card clickable-card mobile-only" @click="goTo('employee/socialmediamanagement')">
      <div class="card-icon google-form-icon">
        <i class="fas fa-share-alt"></i>
      </div>
      <div class="card-info">
        <p class="label">Social Media</p>
        <span class="progress-text">View & Manage Social Media</span>
      </div>
    </div>

    <div v-if="onlyViewITLead" class="dashboard-card clickable-card mobile-only" @click="goTo('employee/empworkreport')">
      <div class="card-icon todo-icon">
        <i class="fas fa-folder"></i>
      </div>
      <div class="card-info">
        <p class="label">Work Report</p>
        <span class="progress-text">View & Manage Work Report</span>
      </div>
    </div>

    <div v-if="onlyViewITTeam || onlyViewMarketing" class="dashboard-card clickable-card mobile-only" @click="goTo('employee/archapps')">
      <div class="card-icon google-form-icon">
        <i class="fas fa-mobile-alt"></i>
      </div>
      <div class="card-info">
        <p class="label">My Apps</p>
        <span class="progress-text">View & Manage Tasks</span>
      </div>
    </div>

    <div v-if="onlyHR" class="dashboard-card clickable-card mobile-only" @click="goToHrDashboard">
      <div class="card-icon hr-icon">
        <i class="fas fa-user-shield"></i>
      </div>
      <div class="card-info">
        <p class="label">HR Dashboard</p>
        <span class="progress-text">Access HR Admin Portal</span>
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

        <!-- 🌟 Colleague Social Profiles Showcase -->
        <ColleagueSocials :currentUserId="effectiveUser.id" />

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
import confetti from 'canvas-confetti';
import Sidebar from './components/Sidebar.vue';
import DataChart from './components/DataChart.vue';
import ColleagueSocials from './components/ColleagueSocials.vue';
import { toastSuccess, toastError, toastInfo } from "@/utils/toast.js";

export default {
  name: 'Dashboard',
  components: { Sidebar, DataChart, ColleagueSocials },
  data() {
    return {
      // 🪔 Diwali Special Festivities State
      isDiwaliSeason: false,       // set dynamically by checkDiwaliSeason() — do NOT hardcode true
      showDiwaliCelebration: false, // kept for template v-if on mahotsav card, driven by isDiwaliSeason
      showDiwaliWishesModal: false,
      litDiyas: [true, true, true, true, true],
      diwaliBlessings: [
        { name: 'Wisdom (ज्ञान)', desc: 'Clear intellect & visionary foresight', icon: 'fas fa-brain' },
        { name: 'Health (आरोग्य)', desc: 'Energy, vitality and wellness', icon: 'fas fa-heartbeat' },
        { name: 'Prosperity (समृद्धि)', desc: 'Abundance, wealth & progress', icon: 'fas fa-coins' },
        { name: 'Success (यश)', desc: 'Breakthrough victories in every endeavor', icon: 'fas fa-trophy' },
        { name: 'Peace (शांति)', desc: 'Serenity, harmony & family bliss', icon: 'fas fa-dove' }
      ],

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
    effectiveUser() {
      let localUser = {};
      try {
        localUser = JSON.parse(localStorage.getItem('user') || '{}');
      } catch (e) {
        localUser = {};
      }
      const current = this.currentUser || {};
      return {
        ...localUser,
        ...current,
        id: current.id || localUser.id || '',
        emp_id: current.emp_id || current.employee_id || localUser.emp_id || localUser.employee_id || '',
        department: (current.department || localUser.department || '').toString().trim(),
        designation: (current.designation || localUser.designation || current.keyresponsibility || localUser.keyresponsibility || '').toString().trim(),
        role: (current.role || localUser.role || '').toString().trim()
      };
    },
    isProbation() {
      const u = this.effectiveUser;
      if (!u) return false;
      if (typeof u.is_probation !== 'undefined') {
        return Boolean(u.is_probation);
      }
      if (u.created_at) {
        const created = new Date(u.created_at);
        const diffDays = (new Date() - created) / (1000 * 60 * 60 * 24);
        return diffDays < 90;
      }
      return false;
    },
    probationDaysLeft() {
      const u = this.effectiveUser;
      if (!u) return 0;
      if (typeof u.probation_days_left !== 'undefined' && u.probation_days_left !== null) {
        return u.probation_days_left;
      }
      if (u.created_at) {
        const created = new Date(u.created_at);
        const diffDays = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
        return Math.max(0, 90 - diffDays);
      }
      return 0;
    },
    probationEndDateFormatted() {
      const u = this.effectiveUser;
      if (!u) return '';
      if (u.probation_end_date) {
        try {
          return new Date(u.probation_end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
          return u.probation_end_date;
        }
      }
      if (u.created_at) {
        const created = new Date(u.created_at);
        const endDate = new Date(created.getTime() + 90 * 24 * 60 * 60 * 1000);
        return endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return '';
    },
    onlyViewITLead() {
      const u = this.effectiveUser;
      const dept = (u.department || '').toLowerCase();
      const desig = (u.designation || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      const normDept = dept.replace(/[\s_-]+/g, '');
      const normDesig = desig.replace(/[\s_-]+/g, '');
      const normRole = role.replace(/[\s_-]+/g, '');

      const isLeadDept = (
        normDept === 'itlead' ||
        normDept === 'ithead' ||
        dept === 'it_lead' ||
        dept === 'it lead' ||
        dept === 'it-lead' ||
        dept === 'it_head' ||
        dept === 'it head' ||
        dept === 'it-head' ||
        dept.includes('it_lead') ||
        dept.includes('it lead') ||
        dept.includes('it-lead') ||
        dept.includes('it head') ||
        dept.includes('it_head')
      );

      const isLeadDesigOrRole = (
        normDesig === 'itlead' ||
        normDesig === 'ithead' ||
        desig.includes('it lead') ||
        desig.includes('it_lead') ||
        normRole === 'itlead' ||
        role.includes('it_lead') ||
        role.includes('it lead') ||
        ((normDept === 'it' || dept.includes('information technology')) && (normDesig.includes('lead') || normDesig.includes('head') || normRole.includes('lead') || normRole.includes('head')))
      );

      const isOwner = (
        normDept === 'owner' ||
        normDept === 'ownership' ||
        dept === 'owner' ||
        dept === 'ownership' ||
        normRole === 'owner' ||
        role === 'owner'
      );

      return Boolean(isLeadDept || isLeadDesigOrRole || isOwner);
    },
    onlyViewITTeam() {
      if (this.onlyViewITLead) return true;
      const u = this.effectiveUser;
      const dept = (u.department || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      const normDept = dept.replace(/[\s_-]+/g, '');
      const normRole = role.replace(/[\s_-]+/g, '');

      return Boolean(
        normDept === 'it' ||
        normDept === 'itteam' ||
        dept === 'it' ||
        dept === 'it team' ||
        dept === 'it_team' ||
        dept === 'it-team' ||
        dept.includes('information technology') ||
        normDept === 'owner' ||
        normDept === 'ownership' ||
        dept === 'owner' ||
        dept === 'ownership' ||
        normRole === 'owner' ||
        role === 'owner'
      );
    },
    canViewITProduct() {
      if (this.onlyViewITLead || this.onlyViewITTeam) return true;
      const u = this.effectiveUser;
      const uid = String(u.id || localStorage.getItem('user_id') || '');
      const empId = String(u.emp_id || '');
      const dept = (u.department || '').toLowerCase();
      const normDept = dept.replace(/[\s_-]+/g, '');

      return Boolean(
        uid === '107' ||
        empId === '107' ||
        normDept === 'it' ||
        normDept === 'hr' ||
        normDept === 'marketing' ||
        normDept === 'owner' ||
        normDept === 'ownership' ||
        normDept === 'management' ||
        dept === 'it' ||
        dept === 'hr' ||
        dept === 'marketing' ||
        dept === 'owner' ||
        dept === 'ownership' ||
        dept === 'management'
      );
    },
    canViewCRM() {
      const u = this.effectiveUser;
      const dept = (u.department || '').toLowerCase();
      const normDept = dept.replace(/[\s_-]+/g, '');
      return Boolean(
        normDept === 'ownership' ||
        normDept === 'owner' ||
        normDept === 'service' ||
        normDept === 'management' ||
        dept === 'account' ||
        dept === 'owner' ||
        dept === 'service' ||
        dept === 'management'
      );
    },
    onlyHR() {
      const u = this.effectiveUser;
      const dept = (u.department || '').toLowerCase();
      const normDept = dept.replace(/[\s_-]+/g, '');
      return Boolean(
        normDept === 'hr' ||
        normDept === 'humanresources' ||
        normDept === 'owner' ||
        normDept === 'ownership' ||
        dept === 'hr' ||
        dept === 'human resources' ||
        dept === 'owner' ||
        dept === 'ownership'
      );
    },
    isHrOrAdmin() {
      const u = this.effectiveUser;
      const role = (u.role || '').toLowerCase().trim();
      const dept = (u.department || '').toLowerCase().trim();
      const normDept = dept.replace(/[\s_-]+/g, '');
      return Boolean(
        role === 'admin' ||
        role === 'super_admin' ||
        role === 'hr' ||
        role === 'owner' ||
        normDept === 'admin' ||
        normDept === 'hr' ||
        normDept === 'humanresources' ||
        normDept === 'ownership' ||
        normDept === 'owner' ||
        dept === 'admin' ||
        dept === 'hr' ||
        dept === 'human resources'
      );
    },
    onlyViewMarketing() {
      const u = this.effectiveUser;
      const dept = (u.department || '').toLowerCase();
      const normDept = dept.replace(/[\s_-]+/g, '');
      return Boolean(
        normDept === 'marketing' ||
        normDept === 'owner' ||
        normDept === 'ownership' ||
        dept === 'marketing' ||
        dept === 'owner' ||
        dept === 'ownership'
      );
    },
    onlyViewEdior() {
      const u = this.effectiveUser;
      const dept = (u.department || '').toLowerCase();
      const normDept = dept.replace(/[\s_-]+/g, '');
      return Boolean(
        normDept === 'videoeditor' ||
        normDept === 'editor' ||
        normDept === 'owner' ||
        dept === 'video_editor' ||
        dept === 'video editor' ||
        dept === 'owner'
      );
    },
    canViewSiteOwnership() {
      const u = this.effectiveUser;
      const dept = (u.department || '').toLowerCase();
      const normDept = dept.replace(/[\s_-]+/g, '');
      return Boolean(
        normDept === 'service' ||
        normDept === 'owner' ||
        normDept === 'ownership' ||
        normDept === 'management' ||
        dept === 'service' ||
        dept === 'owner' ||
        dept === 'ownership' ||
        dept === 'management'
      );
    },
    onlyViewITSales() {
      const u = this.effectiveUser;
      const dept = (u.department || '').toLowerCase().trim();
      const role = (u.role || '').toLowerCase().trim();
      const desig = (u.designation || '').toLowerCase().trim();
      const normDept = dept.replace(/[\s_-]+/g, '');
      const normRole = role.replace(/[\s_-]+/g, '');
      const normDesig = desig.replace(/[\s_-]+/g, '');

      const isSales = (
        normDept === 'itsales' ||
        dept === 'it sales' ||
        dept === 'it lead' ||
        dept === 'it-sales' ||
        dept === 'hr' ||
        (normDept.includes('it') && (normDept.includes('sale') || normDept.includes('sales'))) ||
        (normDesig.includes('it') && (normDesig.includes('sale') || normDesig.includes('sales')))
      );

      const isOwnerOrAdmin = (
        normDept === 'hr' ||
        normDept === 'ownership' ||
        dept === 'owner' ||
        dept === 'ownership' ||
        normRole === 'owner' ||
        normRole === 'admin' ||
        u.role === 'admin'
      );

      return Boolean(isSales || isOwnerOrAdmin);
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
    litDiyasCount() {
      return (this.litDiyas || []).filter(Boolean).length;
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
    // 🪔 Diwali Season Check — reads from Holiday Management API
    // Shows Diwali theme ONLY during: (diwali_date - 2 days) to (diwali_date + 1 day)
    parseDateLocal(dateStr) {
      if (!dateStr) return null;
      const datePart = String(dateStr).slice(0, 10); // "YYYY-MM-DD" – strips time/TZ
      const [y, m, d] = datePart.split('-').map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d); // LOCAL midnight – no UTC shift
    },

    async checkDiwaliSeason() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(
          'https://employees.archenterprises.co.in/api/api/holidays/all',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.data?.success) return;

        const holidays = res.data.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisYear = today.getFullYear();

        // All active holidays whose name contains "diwali"
        const diwaliEntries = holidays.filter(h =>
          h.is_active !== false &&
          h.name && h.name.toLowerCase().includes('diwali')
        );

        for (const diwali of diwaliEntries) {
          let diwaliDate = null;

          if (diwali.is_recurring && diwali.month_day) {
            const parts = String(diwali.month_day).split('-');
            if (parts.length === 2) {
              const mm = parseInt(parts[0], 10);
              const dd = parseInt(parts[1], 10);
              diwaliDate = new Date(thisYear, mm - 1, dd);

              // If today is already past the window for this year → next year
              const weThis = new Date(diwaliDate);
              weThis.setDate(weThis.getDate() + 1); // +1 day boundary
              if (today > weThis) {
                diwaliDate = new Date(thisYear + 1, mm - 1, dd);
              }
            }
          } else if (diwali.date) {
            diwaliDate = this.parseDateLocal(diwali.date); // safe local parse
          }

          if (!diwaliDate || isNaN(diwaliDate.getTime())) continue;

          // Window: diwaliDate - 2 days (inclusive) to diwaliDate + 1 day (inclusive)
          const windowStart = new Date(diwaliDate);
          windowStart.setDate(windowStart.getDate() - 2);

          const windowEnd = new Date(diwaliDate);
          windowEnd.setDate(windowEnd.getDate() + 1);

          if (today >= windowStart && today <= windowEnd) {
            this.isDiwaliSeason = true;
            this.showDiwaliCelebration = true;
            return; // found — no need to check further
          }
        }

        // No matching window found → keep decoration off
        this.isDiwaliSeason = false;
        this.showDiwaliCelebration = false;
      } catch (err) {
        console.debug('[Dashboard] Diwali check failed:', err?.message);
        this.isDiwaliSeason = false;
      }
    },

    // 🪔 Diwali Special Celebration Methods
    burstDiwaliCrackers() {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 32, spread: 360, ticks: 70, zIndex: 99999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 45 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.35), y: Math.random() - 0.2 },
          colors: ['#f59e0b', '#fbbf24', '#dc2626', '#9333ea', '#10b981', '#ffffff', '#ec4899']
        }));
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.65, 0.9), y: Math.random() - 0.2 },
          colors: ['#f59e0b', '#fbbf24', '#f97316', '#dc2626', '#a855f7', '#38bdf8', '#fbbf24']
        }));
      }, 250);
    },

    toggleDiya(idx) {
      const updated = [...this.litDiyas];
      updated[idx] = !updated[idx];
      this.litDiyas = updated;

      if (this.litDiyas[idx]) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#f59e0b', '#fbbf24', '#f97316', '#dc2626']
        });

        if (this.litDiyas.every(Boolean)) {
          this.burstDiwaliCrackers();
        }
      }
    },

    lightAllDiyas() {
      this.litDiyas = [true, true, true, true, true];
      this.burstDiwaliCrackers();
    },

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

    goToHrDashboard() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = (user?.role || '').toLowerCase();
      const adminToken = localStorage.getItem('admin_token');

      if (role === 'admin' && adminToken) {
        this.$router.push('/dashboard');
      } else {
        localStorage.setItem('authTab', 'admin');
        this.$router.push('/auth?switch=admin');
      }
    },

    goToTask(taskId) {
      if (this.isHrOrAdmin) return;
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
    await this.checkDiwaliSeason(); // 🪔 Diwali window check — sets isDiwaliSeason
    
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
  background: transparent;
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
  height: 56px;
  width: auto;
  max-width: 280px;
  object-fit: contain;
}

.logo-text {
  font-weight: 700;
  font-size: 1.35rem;
  background: linear-gradient(135deg, var(--primary), #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  position: relative;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  color: #166534;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.4rem 0.85rem;
  border-radius: 30px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.user-greeting i {
  font-size: 1.05rem;
  color: #16a34a;
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
  top: -4px;
  right: -4px;
  background: var(--danger);
  color: white;
  font-size: 0.68rem;
  padding: 0 4px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 2px solid #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.35);
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
  background: #ffffff;
  border: 1px solid #e2e8f0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.download-btn:hover {
  background: #f8fafc;
  color: #0284c7;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(2, 132, 199, 0.12);
}

.download-btn i {
  font-size: 1.05rem;
  color: #0284c7;
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
  background: #fff1f2;
  border: 1px solid #ffe4e6;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.logout-btn-modern:hover {
  background: #fee2e2;
  border-color: #fecdd3;
  color: #be123c;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(225, 29, 72, 0.12);
}

.logout-btn-modern i {
  font-size: 1.05rem;
  color: #e11d48;
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
  min-width: 0;
  background: transparent;
  border-radius: 24px;
  transition: all 0.3s ease;
}

/* ================= DIWALI FESTIVE CELEBRATION SUITE ================= */
/* 🪔 1. Authentic Lush Marigold & Mango Leaves Garland (Toran) */
.diwali-garlands-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 22px;
  padding-bottom: 6px;
  z-index: 10;
  pointer-events: none;
  padding: 0 4px;
}

.garland-rope-line {
  position: relative;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #15803d 0%, #166534 50%, #15803d 100%);
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.garland-fairy-lights {
  display: flex;
  justify-content: space-between;
  margin-top: -5px;
  padding: 0 15px;
}

.garland-fairy-bulb {
  width: 9px;
  height: 13px;
  border-radius: 50% 50% 45% 45%;
  animation: bulbTwinkle 1.8s infinite alternate ease-in-out;
}

.fbulb-0 { background: #fbbf24; color: #fbbf24; animation-delay: 0s; }
.fbulb-1 { background: #f97316; color: #f97316; animation-delay: 0.35s; }
.fbulb-2 { background: #ef4444; color: #ef4444; animation-delay: 0.7s; }
.fbulb-3 { background: #10b981; color: #10b981; animation-delay: 1.05s; }
.fbulb-4 { background: #c084fc; color: #c084fc; animation-delay: 1.4s; }

@keyframes bulbTwinkle {
  0% { opacity: 0.45; transform: scale(0.85); box-shadow: 0 0 2px currentColor; }
  100% { opacity: 1; transform: scale(1.18); box-shadow: 0 0 10px currentColor; }
}

.garland-swags-row {
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: -6px;
  overflow: visible;
}

.garland-swag-section {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

/* Node Junctions */
.swag-junction-node {
  position: absolute;
  left: -7px;
  top: -2px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.swag-junction-node.end-node {
  left: auto;
  right: -7px;
}

.mango-leaves-bunch {
  position: relative;
  width: 16px;
  height: 12px;
  margin-bottom: -8px;
  z-index: 1;
}

.m-leaf {
  position: absolute;
  width: 5px;
  height: 12px;
  background: linear-gradient(180deg, #22c55e 0%, #15803d 60%, #14532d 100%);
  border-radius: 50% 50% 15% 15%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.leaf-1 { left: 1px; transform: rotate(-35deg); }
.leaf-2 { left: 5.5px; top: -1px; transform: rotate(0deg); }
.leaf-3 { right: 1px; transform: rotate(35deg); }

/* Small Dainty Marigold Flowers */
.marigold-flower {
  position: relative;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.orange-flower {
  background: radial-gradient(circle, #fed7aa 15%, #fb923c 40%, #ea580c 75%, #9a3412 100%);
}

.yellow-flower {
  background: radial-gradient(circle, #fef9c3 15%, #fef08a 40%, #facc15 75%, #a16207 100%);
}

.flower-lg {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(254, 215, 170, 0.5);
}

.flower-md {
  width: 11px;
  height: 11px;
  margin-top: -2px;
}

.flower-sm {
  width: 9px;
  height: 9px;
  margin-top: -2px;
}

.marigold-center {
  width: 4px;
  height: 4px;
  background: #fef08a;
  border-radius: 50%;
  box-shadow: 0 0 2px #ea580c;
}

/* Hanging Pendant Drop (Ladi) */
.swag-pendant-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -1px;
  animation: pendantGentleSway 3.5s ease-in-out infinite alternate;
  transform-origin: top center;
}

@keyframes pendantGentleSway {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}

.pendant-cord {
  width: 1.5px;
  height: 3px;
  background: #15803d;
}

.pendant-bell {
  color: #fbbf24;
  font-size: 9px;
  margin-top: 1px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  animation: bellShine 2s infinite alternate ease-in-out;
}

@keyframes bellShine {
  0% { transform: scale(1); color: #f59e0b; }
  100% { transform: scale(1.1); color: #fef08a; }
}

/* Curving Swag Festoon */
.swag-curved-arc {
  flex: 1;
  width: 100%;
  height: 28px;
  overflow: visible;
}

.garland-arc-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

/* 🪔 2. Diwali Enhanced Welcome Banner */
.welcome-banner.diwali-banner-theme {
  background: linear-gradient(135deg, #3b0764 0%, #6b21a8 35%, #9d174d 70%, #b45309 100%);
  border-radius: 26px;
  padding: 2.2rem 2.8rem;
  margin-bottom: 1.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 
    0 16px 40px -10px rgba(107, 33, 168, 0.5),
    0 0 0 1px rgba(251, 191, 36, 0.35);
  position: relative;
  overflow: hidden;
}

/* Hanging Akash Kandil (Traditional Lanterns) */
.akash-kandil {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  pointer-events: none;
  animation: kandilSway 4s ease-in-out infinite alternate;
}

.kandil-left { left: 24px; animation-delay: 0s; }
.kandil-right { right: 24px; animation-delay: 2s; }

@keyframes kandilSway {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

.kandil-thread {
  width: 1.5px;
  height: 18px;
  background: rgba(255, 255, 255, 0.6);
}

.kandil-body {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%);
  transform: rotate(45deg);
  border-radius: 4px;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.kandil-core {
  width: 14px;
  height: 14px;
  background: #fef08a;
  border-radius: 2px;
  box-shadow: 0 0 10px #fef08a;
}

.kandil-tassels {
  display: flex;
  gap: 3px;
  margin-top: 8px;
}

.kandil-tassels span {
  width: 2px;
  height: 20px;
  background: linear-gradient(180deg, #f59e0b, #ec4899);
  border-radius: 1px;
}

.diwali-banner-content {
  position: relative;
  z-index: 3;
}

.diwali-greeting-ribbon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(251, 191, 36, 0.5);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  color: #fde047;
  letter-spacing: 1px;
  margin-bottom: 8px;
  backdrop-filter: blur(4px);
}

.banner-title-diya-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.banner-title-diya-row h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Animated 3D Earthen Diya */
.banner-diya-art {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.diya-flame-wrapper {
  position: relative;
  width: 14px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flame-glow {
  position: absolute;
  width: 24px;
  height: 24px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%);
  border-radius: 50%;
  animation: flamePulse 1.2s infinite alternate ease-in-out;
}

.flame-core {
  width: 12px;
  height: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fef08a 25%, #f97316 80%, #b91c1c 100%);
  border-radius: 50% 50% 20% 20% / 60% 60% 30% 30%;
  box-shadow: 0 0 10px #f59e0b, 0 0 20px #f97316;
  animation: flameFlicker 0.15s infinite alternate ease-in-out;
}

@keyframes flameFlicker {
  0% { transform: scale(1) rotate(-2deg); }
  100% { transform: scale(1.08, 0.95) rotate(2deg); }
}

@keyframes flamePulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(1.2); opacity: 1; }
}

.diya-clay-base {
  width: 26px;
  height: 10px;
  background: linear-gradient(180deg, #c2410c 0%, #7c2d12 100%);
  border-radius: 2px 2px 14px 14px;
  border-top: 1.5px solid #fdba74;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35);
  margin-top: -2px;
}

.diwali-quote-text {
  font-size: 0.95rem;
  color: #fef08a;
  font-weight: 500;
  margin-top: 6px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.banner-diwali-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  z-index: 3;
}

.diwali-action-chip {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cracker-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #000;
  border: 1px solid #fde047;
}

.cracker-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.5);
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.wishes-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
}

.wishes-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* 🪔 3. "Arch Diwali Mahotsav 2026" Special Card */
.diwali-mahotsav-card {
  background: linear-gradient(180deg, #ffffff 0%, #fffbeb 100%);
  border: 1.5px solid #fde68a;
  border-radius: 24px;
  padding: 24px 28px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.08);
  position: relative;
  overflow: hidden;
}

.diwali-mahotsav-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.mahotsav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px dashed #fde68a;
  margin-bottom: 20px;
}

.mahotsav-title-box {
  display: flex;
  align-items: center;
  gap: 14px;
}

.diya-icon-emblem {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.mahotsav-title-box h3 {
  font-size: 18px;
  font-weight: 800;
  color: #78350f;
  margin: 0;
}

.mahotsav-title-box p {
  font-size: 13px;
  color: #92400e;
  margin-top: 2px;
  font-weight: 500;
}

.mahotsav-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.diyas-status-pill {
  padding: 6px 14px;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.diyas-status-pill i {
  color: #f59e0b;
}

.btn-light-all-diyas {
  padding: 8px 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
}

.btn-light-all-diyas:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

/* Mahotsav Grid: Left Diyas & Right Notices */
.mahotsav-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
}

.station-label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: #92400e;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.text-amber { color: #d97706; }
.text-rose { color: #e11d48; }

.diyas-rack {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.diya-rack-item {
  background: #ffffff;
  border: 1.5px solid #fde68a;
  border-radius: 16px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.diya-rack-item:hover {
  transform: translateY(-3px);
  border-color: #f59e0b;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.15);
}

.diya-rack-item.is-lit {
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
  border-color: #f59e0b;
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.2);
}

.diya-lamp {
  position: relative;
  width: 36px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.diya-lamp-flame {
  position: relative;
  width: 16px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.diya-rack-item.is-lit .diya-lamp-flame {
  opacity: 1;
  transform: scale(1);
}

.flame-aura {
  position: absolute;
  width: 28px;
  height: 28px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.7) 0%, transparent 70%);
  border-radius: 50%;
  animation: flamePulse 1.2s infinite alternate;
}

.flame-teardrop {
  width: 14px;
  height: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #fef08a 25%, #f97316 75%, #dc2626 100%);
  border-radius: 50% 50% 20% 20% / 60% 60% 30% 30%;
  box-shadow: 0 0 12px #f59e0b;
  animation: flameFlicker 0.2s infinite alternate;
}

.diya-earthen-cup {
  width: 36px;
  height: 16px;
  background: linear-gradient(180deg, #c2410c 0%, #7c2d12 100%);
  border-radius: 2px 2px 18px 18px;
  border-top: 2px solid #fed7aa;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  margin-top: -3px;
}

.cup-wick {
  width: 3px;
  height: 5px;
  background: #1e293b;
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 1px;
}

.diya-blessing-name {
  font-size: 11px;
  font-weight: 800;
  color: #78350f;
  margin-bottom: 2px;
}

.diya-blessing-desc {
  font-size: 9px;
  color: #92400e;
  line-height: 1.2;
  margin-bottom: 8px;
  min-height: 22px;
}

.diya-tap-hint {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
}

.diya-rack-item.is-lit .diya-tap-hint {
  background: #fef3c7;
  color: #b45309;
}

/* Right: Notices List */
.festive-notices-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #fde68a;
  border-radius: 14px;
  padding: 10px 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
}

.notice-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fffbeb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #d97706;
}

.notice-icon.holiday-icon {
  background: #ecfdf5;
  color: #059669;
}

.notice-icon.sweet-icon {
  background: #fffbeb;
  color: #d97706;
}

.notice-icon.bonus-icon {
  background: #fdf4ff;
  color: #9333ea;
}

.notice-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.notice-text strong {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.notice-text span {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}

.notice-chip {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.notice-chip.green { background: #dcfce7; color: #15803d; }
.notice-chip.amber { background: #fef3c7; color: #b45309; }
.notice-chip.purple { background: #f3e8ff; color: #7e22ce; }

/* 🪔 4. Diwali Special Wishes Modal */
.diwali-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: modalFadeIn 0.25s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.diwali-wishes-modal {
  background: #ffffff;
  border: 2px solid #fbbf24;
  border-radius: 28px;
  max-width: 540px;
  width: 100%;
  padding: 32px;
  position: relative;
  box-shadow: 0 25px 60px -15px rgba(245, 158, 11, 0.4);
  text-align: center;
  animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideUp {
  from { transform: translateY(30px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-close-x {
  position: absolute;
  top: 18px;
  right: 18px;
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-x:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-rangoli-header {
  margin-bottom: 20px;
}

.modal-diya-glow {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
  font-size: 30px;
  box-shadow: 0 0 24px rgba(245, 158, 11, 0.6);
}

.modal-rangoli-header h2 {
  font-size: 26px;
  font-weight: 800;
  color: #78350f;
  margin-bottom: 4px;
}

.modal-sub {
  font-size: 13px;
  color: #92400e;
  font-weight: 600;
}

.modal-letter-content {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 18px;
  padding: 20px 24px;
  margin-bottom: 22px;
  text-align: left;
  line-height: 1.6;
  font-size: 13.5px;
  color: #334155;
}

.modal-letter-content p {
  margin-bottom: 12px;
}

.modal-signoff {
  border-top: 1px dashed #fde68a;
  padding-top: 12px;
  margin-top: 14px;
  text-align: right;
  display: flex;
  flex-direction: column;
}

.signoff-signature {
  font-family: 'Brush Script MT', cursive;
  font-size: 22px;
  color: #b45309;
}

.modal-signoff span {
  font-size: 11px;
  font-weight: 700;
  color: #0f172a;
}

.modal-signoff small {
  font-size: 10px;
  color: #64748b;
}

.modal-actions-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-cracker-burst-btn {
  padding: 12px 22px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
}

.modal-done-btn {
  padding: 12px 22px;
  background: #009688;
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-done-btn:hover {
  background: #00796b;
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
.leads-icon { background: linear-gradient(135deg, #0ea5e9, #10b981); }
.po-icon { background: linear-gradient(135deg, #c023d1, #a51ab4); }
.todo-icon { background: linear-gradient(135deg, #2b2b2a, #686866); }
.social-icon {background: linear-gradient(135deg, #00e1ff, #000000); }
.hr-icon { background: linear-gradient(135deg, #6366f1, #4338ca); }
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

  /* Diwali Suite Mobile Adaptations */
  .welcome-banner.diwali-banner-theme {
    flex-direction: column;
    align-items: stretch;
    padding: 1.4rem;
    text-align: center;
  }

  .akash-kandil {
    display: none;
  }

  .banner-title-diya-row {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .banner-diwali-actions {
    margin-top: 16px;
    flex-direction: column;
    width: 100%;
  }

  .diwali-action-chip {
    width: 100%;
    justify-content: center;
  }

  .mahotsav-grid {
    grid-template-columns: 1fr;
  }

  .diyas-rack {
    grid-template-columns: repeat(2, 1fr);
  }

  .fairy-lights-string {
    padding: 0 5px;
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
    flex-direction: column;
    gap: 1rem;
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

/* Dashboard Probation Banner */
.dashboard-probation-banner {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.08));
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-left: 5px solid #f59e0b;
  border-radius: 12px;
  padding: 1.1rem 1.4rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.08);
}

.dp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed rgba(245, 158, 11, 0.25);
}

.dp-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  color: #92400e;
  font-weight: 700;
  font-size: 0.88rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid #fde68a;
}

.dp-countdown {
  font-size: 0.88rem;
  color: #78350f;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dp-rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.9rem;
}

.dp-rule-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.dp-rule-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.warning-rule .dp-rule-icon {
  background: #fee2e2;
  color: #dc2626;
}

.danger-rule .dp-rule-icon {
  background: #fef3c7;
  color: #d97706;
}

.info-rule .dp-rule-icon {
  background: #e0f2fe;
  color: #0284c7;
}

.dp-rule-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dp-rule-text strong {
  font-size: 0.84rem;
  color: #1f2937;
}

.dp-rule-text span {
  font-size: 0.78rem;
  color: #4b5563;
  line-height: 1.35;
}

@media (max-width: 768px) {
  .dp-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .dp-rules-grid {
    grid-template-columns: 1fr;
  }
}
</style>