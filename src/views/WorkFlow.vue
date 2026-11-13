<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        
        <!-- EXECUTIVE HEADER BANNER -->
        <header class="workflow-hero-banner">
          <div class="banner-left">
            <div class="banner-icon-badge">
              <i class="fas fa-diagram-project"></i>
            </div>
            <div>
              <div class="banner-tag">
                <i class="fas fa-sitemap"></i>
                <span>STANDARD OPERATING PROCEDURE (SOP)</span>
              </div>
              <h1 class="banner-title">Employee & Office Work Lifecycle</h1>
              <p class="banner-subtitle">
                Comprehensive operational blueprint mapping every employee milestone from morning check-in to quarterly appraisals.
              </p>
            </div>
          </div>

          <div class="banner-actions">
            <!-- View Mode Switcher -->
            <div class="view-mode-toggle">
              <button 
                type="button" 
                class="toggle-btn" 
                :class="{ active: activeView === 'cycle' }"
                @click="activeView = 'cycle'"
                title="Circular Lifecycle Diagram"
              >
                <i class="fas fa-circle-nodes"></i>
                <span>Cycle Flow</span>
              </button>
              <button 
                type="button" 
                class="toggle-btn" 
                :class="{ active: activeView === 'roadmap' }"
                @click="activeView = 'roadmap'"
                title="Stage-by-Stage Detailed Roadmap"
              >
                <i class="fas fa-timeline"></i>
                <span>SOP Roadmap</span>
              </button>
              <button 
                type="button" 
                class="toggle-btn" 
                :class="{ active: activeView === 'raci' }"
                @click="activeView = 'raci'"
                title="RACI Governance Matrix"
              >
                <i class="fas fa-table-cells"></i>
                <span>RACI Matrix</span>
              </button>
            </div>
          </div>
        </header>

        <!-- KPI STATS SUMMARY BAR -->
        <div class="stats-grid-row">
          <div class="workflow-stat-card">
            <div class="stat-icon-wrap stages-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="stat-details">
              <span class="stat-num">8</span>
              <span class="stat-label">Core Stages</span>
            </div>
            <span class="stat-meta-pill">Complete SOP</span>
          </div>

          <div class="workflow-stat-card">
            <div class="stat-icon-wrap coverage-icon">
              <i class="fas fa-sync-alt"></i>
            </div>
            <div class="stat-details">
              <span class="stat-num">100%</span>
              <span class="stat-label">Process Traceability</span>
            </div>
            <span class="stat-meta-pill">End-to-End</span>
          </div>

          <div class="workflow-stat-card">
            <div class="stat-icon-wrap cadence-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-details">
              <span class="stat-num">9:30 - 5:30</span>
              <span class="stat-label">Daily Office Rhythm</span>
            </div>
            <span class="stat-meta-pill">Mon - Sat</span>
          </div>

          <div class="workflow-stat-card">
            <div class="stat-icon-wrap integration-icon">
              <i class="fas fa-shield-halved"></i>
            </div>
            <div class="stat-details">
              <span class="stat-num">Audit-Ready</span>
              <span class="stat-label">SOP Governance</span>
            </div>
            <span class="stat-meta-pill">Compliance</span>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- VIEW 1: INTERACTIVE CIRCULAR LIFECYCLE DIAGRAM           -->
        <!-- ======================================================== -->
        <div v-if="activeView === 'cycle'" class="cycle-section-container">
          
          <div class="cycle-section-head">
            <div class="section-title-wrap">
              <i class="fas fa-network-wired"></i>
              <div>
                <h3>Interactive Lifecycle Visualizer</h3>
                <p>Click any stage around the orbit to inspect its objectives, checklists, SLAs, and connected ARCH360 tools.</p>
              </div>
            </div>

            <!-- Tour Player Control -->
            <div class="cycle-controls">
              <button 
                type="button" 
                class="btn-tour-play" 
                @click="toggleAutoTour"
                :title="isTourRunning ? 'Pause Guided Tour' : 'Start Guided Workflow Tour'"
              >
                <i class="fas" :class="isTourRunning ? 'fa-pause' : 'fa-play'"></i>
                <span>{{ isTourRunning ? 'Pause Tour' : 'Guided Tour' }}</span>
              </button>

              <button type="button" class="btn-step-nav" @click="prevStage" title="Previous Stage">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="step-indicator-text">Stage {{ selectedStageIndex + 1 }} / {{ stages.length }}</span>
              <button type="button" class="btn-step-nav" @click="nextStage" title="Next Stage">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Circular Orbit Visual -->
          <div class="orbit-visual-wrapper">
            <div class="orbit-center-hub">
              <div class="hub-inner-glow"></div>
              <div class="hub-icon-wrap">
                <i class="fas fa-building-user"></i>
              </div>
              <h4 class="hub-title">ARCH ENTERPRISES</h4>
              <span class="hub-sub">Workflow Hub</span>
              <span class="hub-stage-indicator">Active: Stage {{ selectedStage.step }}</span>
            </div>

            <!-- 8 Orbit Nodes -->
            <div 
              v-for="(stage, idx) in stages" 
              :key="stage.id"
              class="orbit-node"
              :class="[
                'node-pos-' + (idx + 1),
                { 'is-selected': selectedStageIndex === idx },
                stage.phaseClass
              ]"
              @click="selectStage(idx)"
            >
              <div class="node-icon-bubble">
                <span class="node-step-badge">{{ stage.step }}</span>
                <i :class="stage.icon"></i>
              </div>
              <div class="node-tooltip">
                <span class="tooltip-title">{{ stage.title }}</span>
                <span class="tooltip-desc">{{ stage.shortDesc }}</span>
              </div>
            </div>
          </div>

          <!-- Deep-Dive Stage Inspector Card -->
          <div class="stage-inspector-panel">
            <div class="inspector-header">
              <div class="inspector-badge-row">
                <span class="stage-num-badge">STAGE {{ selectedStage.step }} OF 8</span>
                <span class="stage-category-pill" :class="selectedStage.phaseClass">
                  {{ selectedStage.phaseName }}
                </span>
                <span class="stage-sla-pill">
                  <i class="far fa-clock"></i> SLA: {{ selectedStage.sla }}
                </span>
              </div>

              <div class="inspector-title-row">
                <div class="inspector-icon-circle" :class="selectedStage.phaseClass">
                  <i :class="selectedStage.icon"></i>
                </div>
                <div>
                  <h3 class="inspector-stage-title">{{ selectedStage.title }}</h3>
                  <p class="inspector-stage-summary">{{ selectedStage.summary }}</p>
                </div>
              </div>
            </div>

            <div class="inspector-body-grid">
              <!-- Column 1: Objectives & Steps -->
              <div class="inspector-card-col">
                <h4 class="col-heading"><i class="fas fa-list-check"></i> Key Process Checkpoints</h4>
                <ul class="checklist-items">
                  <li v-for="(item, i) in selectedStage.checklist" :key="i">
                    <i class="fas fa-circle-check item-bullet"></i>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <!-- Column 2: Stakeholders & Roles -->
              <div class="inspector-card-col">
                <h4 class="col-heading"><i class="fas fa-users-gear"></i> Stakeholders & Roles</h4>
                <div class="stakeholders-list">
                  <div class="stakeholder-tag" v-for="(role, i) in selectedStage.stakeholders" :key="i">
                    <i class="fas fa-user-tag"></i>
                    <span>{{ role }}</span>
                  </div>
                </div>

                <h4 class="col-heading mt-16"><i class="fas fa-file-export"></i> Primary Deliverable</h4>
                <div class="deliverable-box">
                  <i class="fas fa-box-archive"></i>
                  <span>{{ selectedStage.deliverable }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ======================================================== -->
        <!-- VIEW 2: DETAILED STEP-BY-STEP SOP ROADMAP                -->
        <!-- ======================================================== -->
        <div v-else-if="activeView === 'roadmap'" class="roadmap-section-container">
          <div class="roadmap-head">
            <div class="section-title-wrap">
              <i class="fas fa-timeline"></i>
              <div>
                <h3>Chronological SOP Roadmap</h3>
                <p>Detailed breakdown of daily, weekly, and monthly workflows across employee career stages.</p>
              </div>
            </div>
          </div>

          <div class="roadmap-timeline">
            <div 
              v-for="(stage, idx) in stages" 
              :key="stage.id"
              class="roadmap-step-card"
              :class="stage.phaseClass"
            >
              <!-- Timeline Marker -->
              <div class="timeline-marker">
                <span class="marker-number">{{ stage.step }}</span>
                <div class="marker-line" v-if="idx < stages.length - 1"></div>
              </div>

              <!-- Content Body -->
              <div class="roadmap-card-content">
                <div class="roadmap-top-row">
                  <div class="roadmap-title-group">
                    <span class="phase-tag-badge" :class="stage.phaseClass">{{ stage.phaseName }}</span>
                    <h4 class="roadmap-step-heading">{{ stage.title }}</h4>
                  </div>
                  <div class="roadmap-meta-chips">
                    <span class="chip-sla"><i class="far fa-clock"></i> {{ stage.sla }}</span>
                    <button 
                      class="btn-inspect-step"
                      @click="inspectStageFromRoadmap(idx)"
                      title="Inspect full details"
                    >
                      <span>Explore Stage</span>
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>

                <p class="roadmap-step-summary">{{ stage.summary }}</p>

                <!-- Checkpoints Grid -->
                <div class="roadmap-checkpoints-grid">
                  <div class="checkpoint-box" v-for="(check, i) in stage.checklist" :key="i">
                    <i class="fas fa-check-circle"></i>
                    <span>{{ check }}</span>
                  </div>
                </div>

                <!-- Footer Deliverable -->
                <div class="roadmap-footer">
                  <div class="footer-deliverable">
                    <span class="lbl">Primary Output:</span>
                    <span class="val">{{ stage.deliverable }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- VIEW 3: RACI GOVERNANCE MATRIX                           -->
        <!-- ======================================================== -->
        <div v-else class="raci-section-container">
          <div class="raci-head">
            <div class="section-title-wrap">
              <i class="fas fa-table-cells"></i>
              <div>
                <h3>RACI Governance Matrix</h3>
                <p>Clear role clarity across all 8 lifecycle phases: Responsible, Accountable, Consulted, and Informed.</p>
              </div>
            </div>

            <div class="raci-legend-bar">
              <span class="raci-pill raci-r"><strong>R</strong> Responsible</span>
              <span class="raci-pill raci-a"><strong>A</strong> Accountable</span>
              <span class="raci-pill raci-c"><strong>C</strong> Consulted</span>
              <span class="raci-pill raci-i"><strong>I</strong> Informed</span>
            </div>
          </div>

          <div class="raci-table-wrapper">
            <table class="raci-matrix-table">
              <thead>
                <tr>
                  <th class="th-stage">Lifecycle Stage</th>
                  <th class="th-action">Primary Activity</th>
                  <th class="th-role">Employee</th>
                  <th class="th-role">Team Lead</th>
                  <th class="th-role">HR / Operations</th>
                  <th class="th-role">Management</th>
                  <th class="th-audit">Audit SLA</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in raciMatrix" :key="r.stage">
                  <td class="td-stage">
                    <div class="stage-tag-cell">
                      <span class="stage-badge-small">{{ r.step }}</span>
                      <strong>{{ r.stage }}</strong>
                    </div>
                  </td>
                  <td class="td-action">{{ r.activity }}</td>
                  <td class="td-role text-center"><span :class="['raci-cell-pill', 'raci-' + r.employee.toLowerCase()]">{{ r.employee }}</span></td>
                  <td class="td-role text-center"><span :class="['raci-cell-pill', 'raci-' + r.lead.toLowerCase()]">{{ r.lead }}</span></td>
                  <td class="td-role text-center"><span :class="['raci-cell-pill', 'raci-' + r.hr.toLowerCase()]">{{ r.hr }}</span></td>
                  <td class="td-role text-center"><span :class="['raci-cell-pill', 'raci-' + r.management.toLowerCase()]">{{ r.management }}</span></td>
                  <td class="td-audit"><span class="audit-chip">{{ r.sla }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'

export default {
  name: "WorkFlow",
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      activeView: 'cycle', // 'cycle', 'roadmap', 'raci'
      selectedStageIndex: 0,
      isTourRunning: false,
      tourTimer: null,

      // Comprehensive 8 Lifecycle Stages with practical company operational details
      stages: [
        {
          id: 1,
          step: "01",
          title: "Attendance & Morning Login",
          shortDesc: "Daily punch-in & readiness",
          phaseName: "Start & Onboarding",
          phaseClass: "phase-start",
          icon: "fas fa-user-check",
          sla: "Before 09:45 AM daily",
          summary: "Official start of work. Employees mark physical or biometric/mobile presence, check company announcements, and verify daily work availability.",
          checklist: [
            "Punch-in via ARCH360 Attendance Portal before cutoff time (09:45 AM).",
            "Review global company announcements and holiday notices on the dashboard.",
            "Confirm operational readiness and mark calendar commitments for the day.",
            "Verify leave or outdoor duty regularization requests if working offsite."
          ],
          stakeholders: ["All Employees", "HR Administrator", "Team Supervisors"],
          deliverable: "Verified Daily Attendance Stamp & Active Status",
          connectedApps: [
            { name: "Attendance Calendar", desc: "View punch records & holidays", icon: "fas fa-calendar-check", route: "/archcalendar" },
            { name: "Announcements Hub", desc: "Company news & alerts", icon: "fas fa-bullhorn", route: "/announcement" }
          ]
        },
        {
          id: 2,
          step: "02",
          title: "Task & Project Allocation",
          shortDesc: "Assign responsibilities & goals",
          phaseName: "Process Planning",
          phaseClass: "phase-process",
          icon: "fas fa-tasks",
          sla: "10:00 AM - 10:30 AM",
          summary: "Daily alignment and work scheduling. Team leads allocate client tickets, technical tasks, visit quotas, and operational milestones for the workday.",
          checklist: [
            "Conduct brief morning scrum or review assigned ticket queues.",
            "Prioritize urgent client deliverables, support requests, and quotation tasks.",
            "Confirm clear delivery deadlines and resource access (meeting rooms, vehicles).",
            "Identify bottlenecks early and rebalance work across team members."
          ],
          stakeholders: ["Team Leads", "Project Managers", "Assigned Associates"],
          deliverable: "Daily Task Worklist & Priority Backlog",
          connectedApps: [
            { name: "Meeting Rooms", desc: "Book client & team rooms", icon: "fas fa-laptop-house", route: "/employee/meeting-room" },
            { name: "Resource Management", desc: "Office assets & vehicle pass", icon: "fas fa-car", route: "/employee/vehicle" }
          ]
        },
        {
          id: 3,
          step: "03",
          title: "Work Execution & Operations",
          shortDesc: "Focused task implementation",
          phaseName: "Active Operations",
          phaseClass: "phase-process",
          icon: "fas fa-laptop-code",
          sla: "Core Office Hours (10:30 AM - 05:30 PM)",
          summary: "Core productive hours. Development, client servicing, field visits, quotation generation, and project execution following ARCH quality standards.",
          checklist: [
            "Execute software tasks, client deliverables, or field site visits.",
            "Generate and dispatch client quotations with accurate pricing formulas.",
            "Log client interactions, follow-up minutes, and visit remarks in real-time.",
            "Submit Kaizen Small Improvement (DSI) ideas for observed bottlenecks."
          ],
          stakeholders: ["Sales Executives", "Engineers & Developers", "Operations Team"],
          deliverable: "Completed Work Deliverables & Client Quotations",
          connectedApps: [
            { name: "Quotations Hub", desc: "Create & dispatch client quotes", icon: "fas fa-file-invoice-dollar", route: "/employee/clientquotation" },
            { name: "DSI Kaizen Hub", desc: "Daily Small Improvement ideas", icon: "fas fa-lightbulb", route: "/employee/mydsi" }
          ]
        },
        {
          id: 4,
          step: "04",
          title: "Daily Reporting & DSR Logging",
          shortDesc: "End-of-day summary submission",
          phaseName: "Process Closure",
          phaseClass: "phase-process",
          icon: "fas fa-file-upload",
          sla: "By 06:45 PM daily",
          summary: "Transparency and accountability checkpoint. Employees log their Daily Sales Report (DSR) or operational summary detailing achievements and challenges.",
          checklist: [
            "Submit structured Daily Sales Report (DSR) with client visits & calls made.",
            "Document newly booked revenues, quotation conversions, and pipeline leads.",
            "Record pending blockers requiring manager assistance or escalation.",
            "Clock-out punch verifying completion of standard working shift."
          ],
          stakeholders: ["All Operational Staff", "Sales Reps", "Reporting Leads"],
          deliverable: "Logged DSR Report & Daily Performance Metric",
          connectedApps: [
            { name: "Daily Sales Report", desc: "Submit & review end-of-day reports", icon: "fas fa-clipboard-list", route: "/employee/dailysalesreport" }
          ]
        },
        {
          id: 5,
          step: "05",
          title: "Managerial Review & Auditing",
          shortDesc: "Supervisor audit & evaluation",
          phaseName: "Supervision & Review",
          phaseClass: "phase-review",
          icon: "fas fa-user-shield",
          sla: "Within 24 Hours of Submission",
          summary: "Quality assurance and oversight. Department managers review logged reports, verify client feedback, inspect DSI submissions, and audit work quality.",
          checklist: [
            "Review submitted DSR logs and client quotation conversion ratios.",
            "Inspect employee Daily Small Improvement (DSI) proposals and photo proofs.",
            "Audit expense reimbursement requests against company policy guidelines.",
            "Provide constructive feedback and adjust work plans where necessary."
          ],
          stakeholders: ["Department Managers", "Quality Auditors", "Finance Team"],
          deliverable: "Manager Evaluation Score & Audit Remarks",
          connectedApps: [
            { name: "Review DSI Hub", desc: "Admin evaluate Kaizen submissions", icon: "fas fa-tasks", route: "/empdsi" },
            { name: "Expense Management", desc: "Review employee reimbursement claims", icon: "fas fa-receipt", route: "/expense" }
          ]
        },
        {
          id: 6,
          step: "06",
          title: "Formal Approvals & Verification",
          shortDesc: "Executive validation & sign-off",
          phaseName: "Supervision & Review",
          phaseClass: "phase-review",
          icon: "fas fa-check-double",
          sla: "Processed within 48 Hours",
          summary: "Administrative validation. Formal executive sign-off for leave applications, asset requests, expense reimbursements, and client contract terms.",
          checklist: [
            "Review and approve/reject employee leave applications based on balance.",
            "Verify vendor invoices, client discounts, and operational expense vouchers.",
            "Approve resolved employee assistance desk tickets and IT support claims.",
            "Finalize official status updates with automated system notifications."
          ],
          stakeholders: ["Authorized HODs", "Finance Controller", "Executive Director"],
          deliverable: "Signed Authorizations & Approved Vouchers",
          connectedApps: [
            { name: "Leave Approvals", desc: "Approve/Reject employee leave requests", icon: "fas fa-calendar-check", route: "/leaves" },
            { name: "Request Desk", desc: "Resolve administrative assistance tickets", icon: "fas fa-ticket-alt", route: "/requestdesk" }
          ]
        },
        {
          id: 7,
          step: "07",
          title: "Payroll, Salary & Compensation",
          shortDesc: "Monthly payout & salary slips",
          phaseName: "Reward & Completion",
          phaseClass: "phase-end",
          icon: "fas fa-wallet",
          sla: "1st to 7th of Every Month",
          summary: "Financial compensation cycle. Attendance records, approved leaves, and overtime hours are reconciled to generate official monthly salary slips.",
          checklist: [
            "Run monthly attendance and biometric punch reconciliation.",
            "Factor in approved paid leaves, unpaid leaves, and travel allowances.",
            "Compute statutory deductions (PF, PT, TDS) and net payable compensation.",
            "Generate downloadable, digital salary slips with verification barcodes."
          ],
          stakeholders: ["HR Payroll Specialist", "Accounts Dept", "Employee"],
          deliverable: "Official Generated Salary Slip & Bank Payout",
          connectedApps: [
            { name: "Salary Slip Generator", desc: "Generate & view monthly pay slips", icon: "fas fa-file-invoice", route: "/salaryslip" }
          ]
        },
        {
          id: 8,
          step: "08",
          title: "Performance & Career Growth",
          shortDesc: "KPI evaluation & appraisals",
          phaseName: "Reward & Completion",
          phaseClass: "phase-end",
          icon: "fas fa-chart-line",
          sla: "Quarterly & Annual Review Cycles",
          summary: "Growth, retention, and career progression. Evaluation of quarterly KPIs, target achievements, DSI innovation bonuses, and annual promotion reviews.",
          checklist: [
            "Assess quarterly target vs achievement points across KPI terms.",
            "Calculate DSI innovation bonus points and operational leadership credit.",
            "Conduct structured one-on-one performance appraisal reviews.",
            "Update employee promotion track, salary revisions, and training plans."
          ],
          stakeholders: ["Ownership / Management", "Team Leads", "Employee"],
          deliverable: "Quarterly Performance Scorecard & Growth Plan",
          connectedApps: [
            { name: "Quarterly Performance", desc: "Track points, targets & top performers", icon: "fas fa-trophy", route: "/performance" }
          ]
        }
      ],

      // RACI Matrix definition across company roles
      raciMatrix: [
        { step: "01", stage: "Attendance & Login", activity: "Daily punch-in & readiness check", employee: "R", lead: "A", hr: "A", management: "I", sla: "Daily 09:45 AM" },
        { step: "02", stage: "Task Allocation", activity: "Sprint planning & ticket assignment", employee: "C", lead: "R", hr: "I", management: "A", sla: "Daily 10:30 AM" },
        { step: "03", stage: "Work Execution", activity: "Task fulfillment, quotes & DSI creation", employee: "R", lead: "A", hr: "I", management: "I", sla: "Daily Core Hours" },
        { step: "04", stage: "Daily Reporting", activity: "DSR submission & clock-out", employee: "R", lead: "A", hr: "I", management: "I", sla: "Daily 06:45 PM" },
        { step: "05", stage: "Managerial Review", activity: "DSR inspection & quality verification", employee: "I", lead: "R", hr: "C", management: "A", sla: "24h Post Submission" },
        { step: "06", stage: "Formal Approvals", activity: "Leaves, expenses & ticket sign-off", employee: "I", lead: "R", hr: "R", management: "A", sla: "Within 48 Hours" },
        { step: "07", stage: "Payroll & Salary", activity: "Attendance reconciliation & pay slip", employee: "I", lead: "C", hr: "R", management: "A", sla: "Monthly 1st-7th" },
        { step: "08", stage: "Performance & Growth", activity: "Quarterly KPI review & promotions", employee: "C", lead: "R", hr: "C", management: "A", sla: "Quarterly Cycle" }
      ]
    }
  },

  computed: {
    selectedStage() {
      return this.stages[this.selectedStageIndex] || this.stages[0]
    }
  },

  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    },

    selectStage(idx) {
      this.selectedStageIndex = idx
    },

    nextStage() {
      this.selectedStageIndex = (this.selectedStageIndex + 1) % this.stages.length
    },

    prevStage() {
      this.selectedStageIndex = (this.selectedStageIndex - 1 + this.stages.length) % this.stages.length
    },

    toggleAutoTour() {
      if (this.isTourRunning) {
        clearInterval(this.tourTimer)
        this.isTourRunning = false
      } else {
        this.isTourRunning = true
        this.tourTimer = setInterval(() => {
          this.nextStage()
        }, 3500)
      }
    },

    inspectStageFromRoadmap(idx) {
      this.selectedStageIndex = idx
      this.activeView = 'cycle'
      window.scrollTo({ top: 300, behavior: 'smooth' })
    },

    navigateTo(route) {
      if (route) {
        this.$router.push(route)
      }
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)

    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
    if (this.tourTimer) {
      clearInterval(this.tourTimer)
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* ======================================================== */
/* DESIGN TOKENS & RESET                                    */
/* ======================================================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  gap: 24px;
  padding: 24px;
  min-height: 100vh;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ======================================================== */
/* HERO BANNER                                              */
/* ======================================================== */
.workflow-hero-banner {
  background: white;
  border-radius: 20px;
  padding: 24px 28px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.banner-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.25);
  flex-shrink: 0;
}

.banner-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #4f46e5;
  background: #eef2ff;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 6px;
}

.banner-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0;
}

.banner-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  max-width: 620px;
  line-height: 1.4;
}

/* View Mode Switcher Toggle */
.view-mode-toggle {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* ======================================================== */
/* KPI STATS ROW                                            */
/* ======================================================== */
.stats-grid-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.workflow-stat-card {
  background: white;
  border-radius: 18px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.02);
  transition: transform 0.2s ease;
}

.workflow-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.stat-icon-wrap {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stages-icon { background: #ede9fe; color: #6366f1; }
.coverage-icon { background: #dcfce7; color: #16a34a; }
.cadence-icon { background: #e0f2fe; color: #0284c7; }
.integration-icon { background: #fef3c7; color: #d97706; }

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-top: 2px;
}

.stat-meta-pill {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
}

/* ======================================================== */
/* VIEW 1: CIRCULAR FLOW CONTAINER                          */
/* ======================================================== */
.cycle-section-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cycle-section-head {
  background: white;
  border-radius: 18px;
  padding: 18px 24px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title-wrap i {
  font-size: 24px;
  color: #4f46e5;
}

.section-title-wrap h3 {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.section-title-wrap p {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.cycle-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-tour-play {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-tour-play:hover {
  background: #4338ca;
}

.btn-step-nav {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.btn-step-nav:hover {
  background: #f8fafc;
  color: #0f172a;
}

.step-indicator-text {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  min-width: 90px;
  text-align: center;
}

/* Orbit Visual Component */
.orbit-visual-wrapper {
  position: relative;
  width: 520px;
  height: 520px;
  margin: 20px auto;
  border-radius: 50%;
  background: radial-gradient(circle at center, #ffffff 45%, #f8fafc 80%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
}

.orbit-center-hub {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.3);
  z-index: 10;
  padding: 12px;
}

.hub-inner-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(99, 102, 241, 0.4);
  animation: pulseHub 2.5s infinite ease-in-out;
}

@keyframes pulseHub {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 0.3; }
}

.hub-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #38bdf8;
  margin-bottom: 6px;
}

.hub-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin: 0;
}

.hub-sub {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hub-stage-indicator {
  margin-top: 6px;
  font-size: 9.5px;
  font-weight: 800;
  background: rgba(99, 102, 241, 0.4);
  color: #e0e7ff;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 8 Orbit Nodes Positioned Geometrically */
.orbit-node {
  position: absolute;
  width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 5;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.node-icon-bubble {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: white;
  border: 2px solid #e2e8f0;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #4f46e5;
  transition: all 0.25s ease;
}

.node-step-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0f172a;
  color: white;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-tooltip {
  margin-top: 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}

.tooltip-title {
  font-size: 11.5px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
}

.tooltip-desc {
  font-size: 9.5px;
  color: #64748b;
  white-space: nowrap;
}

/* Active Orbit Node Highlight */
.orbit-node.is-selected .node-icon-bubble {
  transform: scale(1.2);
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35);
}

.orbit-node.is-selected .node-step-badge {
  background: #f59e0b;
}

.orbit-node.is-selected .tooltip-title {
  color: #4f46e5;
  font-weight: 800;
}

/* 8 Clockwise Positions on 520px Circle */
/* Top (12 o'clock) */
.node-pos-1 { top: -20px; left: 50%; transform: translateX(-50%); }
/* Top-Right (1:30) */
.node-pos-2 { top: 50px; right: -25px; }
/* Right (3 o'clock) */
.node-pos-3 { top: 50%; right: -55px; transform: translateY(-50%); }
/* Bottom-Right (4:30) */
.node-pos-4 { bottom: 50px; right: -25px; }
/* Bottom (6 o'clock) */
.node-pos-5 { bottom: -20px; left: 50%; transform: translateX(-50%); }
/* Bottom-Left (7:30) */
.node-pos-6 { bottom: 50px; left: -25px; }
/* Left (9 o'clock) */
.node-pos-7 { top: 50%; left: -55px; transform: translateY(-50%); }
/* Top-Left (10:30) */
.node-pos-8 { top: 50px; left: -25px; }

/* Stage Inspector Panel */
.stage-inspector-panel {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 25px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.inspector-header {
  padding: 24px 28px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inspector-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.stage-num-badge {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: #0f172a;
  color: white;
  padding: 3px 10px;
  border-radius: 6px;
}

.stage-category-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}

.stage-category-pill.phase-start { background: #e0f2fe; color: #0369a1; }
.stage-category-pill.phase-process { background: #ede9fe; color: #6d28d9; }
.stage-category-pill.phase-review { background: #fef3c7; color: #b45309; }
.stage-category-pill.phase-end { background: #dcfce7; color: #15803d; }

.stage-sla-pill {
  margin-left: auto;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  background: white;
  border: 1px solid #cbd5e1;
  padding: 3px 10px;
  border-radius: 20px;
}

.inspector-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.inspector-icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.inspector-icon-circle.phase-start { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
.inspector-icon-circle.phase-process { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.inspector-icon-circle.phase-review { background: linear-gradient(135deg, #f59e0b, #d97706); }
.inspector-icon-circle.phase-end { background: linear-gradient(135deg, #10b981, #059669); }

.inspector-stage-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.inspector-stage-summary {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
  line-height: 1.4;
}

.inspector-body-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 32px;
  padding: 24px 28px;
}

.inspector-card-col {
  display: flex;
  flex-direction: column;
}

.col-heading {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mt-16 { margin-top: 16px; }

.checklist-items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checklist-items li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12.5px;
  line-height: 1.45;
  color: #334155;
}

.item-bullet {
  color: #10b981;
  font-size: 14px;
  margin-top: 2px;
  flex-shrink: 0;
}

.stakeholders-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stakeholder-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 8px;
}

.deliverable-box {
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  padding: 10px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #047857;
}

.connected-apps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-link-card:hover {
  background: #eef2ff;
  border-color: #c7d2fe;
  transform: translateY(-1px);
}

.app-link-card i:first-child {
  font-size: 18px;
  color: #4f46e5;
}

.app-link-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.app-name {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.app-sub {
  font-size: 10.5px;
  color: #64748b;
}

.link-arrow {
  font-size: 11px;
  color: #94a3b8;
}

/* ======================================================== */
/* VIEW 2: ROADMAP TIMELINE STYLES                          */
/* ======================================================== */
.roadmap-section-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.roadmap-head {
  background: white;
  border-radius: 18px;
  padding: 18px 24px;
  border: 1px solid #e2e8f0;
}

.roadmap-timeline {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.roadmap-step-card {
  background: white;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  display: flex;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.roadmap-step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.timeline-marker {
  width: 70px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  position: relative;
  flex-shrink: 0;
}

.marker-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0f172a;
  color: white;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.marker-line {
  position: absolute;
  top: 56px;
  bottom: 0;
  width: 2px;
  background: #cbd5e1;
}

.roadmap-card-content {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.roadmap-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.roadmap-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.phase-tag-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.phase-tag-badge.phase-start { background: #e0f2fe; color: #0369a1; }
.phase-tag-badge.phase-process { background: #ede9fe; color: #6d28d9; }
.phase-tag-badge.phase-review { background: #fef3c7; color: #b45309; }
.phase-tag-badge.phase-end { background: #dcfce7; color: #15803d; }

.roadmap-step-heading {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.roadmap-meta-chips {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chip-sla {
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 8px;
}

.btn-inspect-step {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-inspect-step:hover {
  background: #eef2ff;
  color: #4f46e5;
  border-color: #c7d2fe;
}

.roadmap-step-summary {
  font-size: 13px;
  color: #475569;
  line-height: 1.45;
}

.roadmap-checkpoints-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.checkpoint-box {
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkpoint-box i {
  color: #10b981;
}

.roadmap-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.footer-deliverable {
  font-size: 12px;
}

.footer-deliverable .lbl {
  color: #64748b;
  margin-right: 6px;
  font-weight: 600;
}

.footer-deliverable .val {
  color: #0f172a;
  font-weight: 700;
}

.footer-apps {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-app-badge {
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mini-app-badge:hover {
  background: #4f46e5;
  color: white;
}

/* ======================================================== */
/* VIEW 3: RACI GOVERNANCE MATRIX                           */
/* ======================================================== */
.raci-section-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.raci-head {
  background: white;
  border-radius: 18px;
  padding: 18px 24px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}

.raci-legend-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.raci-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
}

.raci-pill.raci-r { background: #fee2e2; color: #b91c1c; }
.raci-pill.raci-a { background: #fef3c7; color: #b45309; }
.raci-pill.raci-c { background: #e0f2fe; color: #0369a1; }
.raci-pill.raci-i { background: #f1f5f9; color: #475569; }

.raci-table-wrapper {
  background: white;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
}

.raci-matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  min-width: 850px;
}

.raci-matrix-table thead {
  background: #f8fafc;
}

.raci-matrix-table th {
  padding: 14px 18px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.raci-matrix-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.raci-matrix-table tbody tr:hover td {
  background: #f8fafc;
}

.stage-tag-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stage-badge-small {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #0f172a;
  color: white;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.raci-cell-pill {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}

.raci-cell-pill.raci-r { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.raci-cell-pill.raci-a { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
.raci-cell-pill.raci-c { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; }
.raci-cell-pill.raci-i { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.audit-chip {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
}

.text-center { text-align: center; }

/* ======================================================== */
/* RESPONSIVE STYLES                                        */
/* ======================================================== */
@media (max-width: 1100px) {
  .stats-grid-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .inspector-body-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }

  .orbit-visual-wrapper {
    transform: scale(0.68);
    margin: -70px auto -60px auto;
  }

  .roadmap-checkpoints-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid-row {
    grid-template-columns: 1fr;
  }
}
</style>