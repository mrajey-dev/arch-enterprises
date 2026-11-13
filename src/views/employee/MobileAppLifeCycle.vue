<template>
  <div class="layout">
    <div class="main-content">
      <!-- Sidebar -->
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-rocket text-teal"></i>
            <span>App Lifecycle</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-mobile-add" @click="toggleForm">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn-mobile-menu" @click="toggleSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Header Banner -->
        <header class="executive-header">
          <div class="header-main">
            <div class="header-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>MOBILE & SOFTWARE ENGINEERING</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-code-branch text-teal"></i> 9-Phase Delivery Framework
              </span>
            </div>
            <div class="title-with-icon">
              <div class="header-icon-box">
                <i class="fas fa-rocket"></i>
              </div>
              <div>
                <h1 class="header-title">App Lifecycle Manager</h1>
                <p class="header-subtitle">Comprehensive development pipeline tracking project stages from discovery to production deployment</p>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <button class="btn-secondary-action" @click="resetToDefaults" title="Restore standard 9-phase lifecycle">
              <i class="fas fa-sync-alt"></i>
              <span>Standard Phases</span>
            </button>
            <button class="btn-primary-action" @click="formVisible = true; editingId ? resetForm() : null">
              <i class="fas fa-plus"></i>
              <span>{{ editingId ? 'New Phase' : (formVisible ? 'Phase Form' : 'Add Phase') }}</span>
            </button>
          </div>
        </header>

        <!-- 📊 KPI Metrics Grid -->
        <section class="metrics-grid">
          <!-- Total Phases -->
          <div class="metric-card" :class="{ 'card-active': !statusFilter }" @click="statusFilter = ''">
            <div class="metric-header">
              <span class="metric-title">Total Phases</span>
              <div class="metric-icon-wrap icon-all">
                <i class="fas fa-layer-group"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ phases.length }}</span>
              <span class="metric-tag tag-all">All stages</span>
            </div>
          </div>

          <!-- Completed -->
          <div class="metric-card card-completed" :class="{ 'card-active': statusFilter === 'Completed' }" @click="filterByStatus('Completed')">
            <div class="metric-header">
              <span class="metric-title">Completed</span>
              <div class="metric-icon-wrap icon-completed">
                <i class="fas fa-check-double"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ statusCounts['Completed'] || 0 }}</span>
              <span class="metric-tag tag-completed">{{ completionPercentage }}% done</span>
            </div>
          </div>

          <!-- In Progress -->
          <div class="metric-card card-inprogress" :class="{ 'card-active': statusFilter === 'In Progress' }" @click="filterByStatus('In Progress')">
            <div class="metric-header">
              <span class="metric-title">In Progress</span>
              <div class="metric-icon-wrap icon-inprogress">
                <i class="fas fa-spinner fa-spin-pulse"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ statusCounts['In Progress'] || 0 }}</span>
              <span class="metric-tag tag-inprogress">Active sprint</span>
            </div>
          </div>

          <!-- Planning -->
          <div class="metric-card card-planning" :class="{ 'card-active': statusFilter === 'Planning' }" @click="filterByStatus('Planning')">
            <div class="metric-header">
              <span class="metric-title">Planning</span>
              <div class="metric-icon-wrap icon-planning">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ statusCounts['Planning'] || 0 }}</span>
              <span class="metric-tag tag-planning">Queue</span>
            </div>
          </div>

          <!-- Review & QA -->
          <div class="metric-card card-review" :class="{ 'card-active': statusFilter === 'Review' }" @click="filterByStatus('Review')">
            <div class="metric-header">
              <span class="metric-title">Review / QA</span>
              <div class="metric-icon-wrap icon-review">
                <i class="fas fa-eye"></i>
              </div>
            </div>
            <div class="metric-body">
              <span class="metric-number">{{ statusCounts['Review'] || 0 }}</span>
              <span class="metric-tag tag-review">Verification</span>
            </div>
          </div>
        </section>

        <!-- 📝 Add / Edit Phase Collapsible Panel -->
        <div class="card-executive" :class="{ 'card-highlight': editingId }">
          <div class="card-header-actionable" @click="toggleForm">
            <div class="cha-left">
              <div class="cha-icon" :class="editingId ? 'icon-amber' : 'icon-teal'">
                <i :class="editingId ? 'fas fa-pen' : 'fas fa-plus-circle'"></i>
              </div>
              <div>
                <h3 class="cha-title">{{ editingId ? 'Edit Lifecycle Phase' : 'Create or Customize Phase' }}</h3>
                <span class="cha-sub">{{ editingId ? 'Update phase name, description or status' : 'Add custom milestones or adjust team delivery goals' }}</span>
              </div>
            </div>
            <div class="cha-right">
              <button class="btn-toggle-round" :class="{ rotated: formVisible }" aria-label="Toggle phase form">
                <i class="fas fa-chevron-down"></i>
              </button>
            </div>
          </div>

          <transition name="expand">
            <div class="form-body-wrap" v-if="formVisible">
              <div class="form-fields-grid">
                <!-- Title -->
                <div class="form-field-item">
                  <label class="field-label">
                    <span>Phase Title</span>
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <i class="fas fa-tag field-icon"></i>
                    <input
                      type="text"
                      v-model="form.title"
                      placeholder="e.g. Requirement Gathering, Testing, Beta Release..."
                      class="custom-input"
                    />
                  </div>
                </div>

                <!-- Status -->
                <div class="form-field-item">
                  <label class="field-label">
                    <span>Current Status</span>
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-icon">
                    <i class="fas fa-flag field-icon"></i>
                    <select v-model="form.status" class="custom-select">
                      <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </div>
                </div>

                <!-- Description / Tasks -->
                <div class="form-field-item full-width">
                  <div class="field-label-row">
                    <label class="field-label">
                      <span>Description / Key Deliverables</span>
                      <span class="required">*</span>
                    </label>
                    <span class="char-counter" :class="{ 'limit-warn': form.description.length > 270 }">
                      {{ form.description.length }} / 300
                    </span>
                  </div>
                  <textarea
                    v-model="form.description"
                    rows="3"
                    maxlength="300"
                    placeholder="Describe the objectives, deliverables, testing scope, or dependencies for this phase..."
                    class="custom-textarea"
                  ></textarea>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions-row">
                <button v-if="editingId" type="button" class="btn-action-cancel" @click="resetForm">
                  <i class="fas fa-times"></i> Cancel Edit
                </button>
                <button
                  type="button"
                  class="btn-action-submit"
                  @click="submitPhase"
                  :disabled="isSubmitting"
                >
                  <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                  <i v-else :class="editingId ? 'fas fa-check' : 'fas fa-plus'"></i>
                  <span>{{ isSubmitting ? 'Saving...' : (editingId ? 'Update Phase' : 'Add to Pipeline') }}</span>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- 🛣️ Interactive Lifecycle Timeline Visualizer -->
        <div class="card-executive">
          <div class="card-header-clean">
            <div class="chc-left">
              <div class="chc-icon icon-teal">
                <i class="fas fa-road"></i>
              </div>
              <div>
                <h3 class="chc-title">Project Lifecycle Stepper</h3>
                <span class="chc-sub">Sequential progress through all 9 application stages</span>
              </div>
            </div>
            <div class="chc-right">
              <span class="stepper-progress-pill">
                <i class="fas fa-tasks"></i> {{ completedCount }} of {{ orderedPhases.length }} Stages Completed
              </span>
            </div>
          </div>

          <div class="stepper-pipeline-container">
            <div class="stepper-pipeline">
              <div
                v-for="(phase, index) in orderedPhases"
                :key="phase.id"
                class="stepper-node"
                :class="getPhaseStatusClass(phase.status)"
              >
                <!-- Connector Line -->
                <div class="node-connector" v-if="index < orderedPhases.length - 1"></div>

                <!-- Milestone Marker Icon -->
                <div class="node-marker" :title="'Step ' + (index + 1) + ': ' + phase.title">
                  <i :class="getPhaseIcon(index)"></i>
                </div>

                <!-- Phase Card Content -->
                <div class="node-content">
                  <div class="node-header">
                    <span class="node-step-tag">Step {{ index + 1 }}</span>
                    <span :class="['status-badge-pipeline', getStatusClass(phase.status)]">
                      <i :class="statusIconMap[phase.status]"></i> {{ phase.status }}
                    </span>
                  </div>

                  <h4 class="node-title">{{ phase.title }}</h4>
                  <p class="node-desc">{{ phase.description || 'No description provided' }}</p>

                  <div class="node-footer">
                    <span class="node-date">
                      <i class="fas fa-calendar-alt"></i> {{ formatDate(phase.created_at) }}
                    </span>
                    <div class="node-actions">
                      <button class="node-btn edit" @click="editPhase(phase)" title="Edit phase">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="node-btn delete" @click="deletePhase(phase.id)" title="Remove phase">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 📊 2-Column Analytics Strip: Status Distribution & Competitor Benchmark -->
        <div class="analytics-double-grid">
          <!-- Donut Chart Box -->
          <div class="card-executive chart-card">
            <div class="card-header-clean">
              <div class="chc-left">
                <div class="chc-icon icon-purple">
                  <i class="fas fa-chart-pie"></i>
                </div>
                <div>
                  <h3 class="chc-title">Status Distribution</h3>
                  <span class="chc-sub">Phase completion breakdown</span>
                </div>
              </div>
            </div>

            <div class="chart-content-wrap">
              <div class="chart-canvas-container">
                <canvas ref="statusChart"></canvas>
              </div>
              <div class="chart-legend-grid">
                <div class="legend-pill" v-for="(count, status) in statusCounts" :key="status" :class="status.toLowerCase().replace(' ', '')">
                  <span class="legend-dot"></span>
                  <span class="legend-name">{{ status }}</span>
                  <span class="legend-count">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Competitor Benchmarking -->
          <div class="card-executive competitor-card">
            <div class="card-header-clean">
              <div class="chc-left">
                <div class="chc-icon icon-indigo">
                  <i class="fas fa-people-arrows"></i>
                </div>
                <div>
                  <h3 class="chc-title">Platform Competitor Comparison</h3>
                  <span class="chc-sub">Benchmarked against industry solutions</span>
                </div>
              </div>
              <div class="chc-right">
                <span class="badge-benchmark">Standard vs Market</span>
              </div>
            </div>

            <div class="competitor-cards-grid">
              <div class="comp-item" v-for="(comp, idx) in competitors" :key="idx" :class="{ 'comp-highlight': comp.highlight }">
                <div class="comp-head">
                  <div class="comp-title-wrap">
                    <div class="comp-icon" :style="{ background: comp.bg, color: comp.color }">
                      <i :class="comp.icon"></i>
                    </div>
                    <div>
                      <h5 class="comp-name">{{ comp.name }}</h5>
                      <span class="comp-rating">{{ comp.rating }}</span>
                    </div>
                  </div>
                </div>

                <ul class="comp-features-list">
                  <li v-for="(feat, fi) in comp.features" :key="fi">
                    <i class="fas fa-check-circle text-emerald"></i>
                    <span>{{ feat }}</span>
                  </li>
                </ul>

                <div class="comp-note-footer">
                  <i class="fas fa-info-circle"></i>
                  <span>{{ comp.note }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 📋 All Phases Master Table -->
        <div class="card-executive">
          <div class="card-header-clean table-toolbar">
            <div class="chc-left">
              <div class="chc-icon icon-teal">
                <i class="fas fa-list-ul"></i>
              </div>
              <div>
                <h3 class="chc-title">Phase Inventory & Records</h3>
                <span class="chc-sub">Showing {{ filteredPhases.length }} of {{ phases.length }} lifecycle phases</span>
              </div>
            </div>

            <!-- Table Filters & Search -->
            <div class="table-search-strip">
              <div class="search-input-box">
                <i class="fas fa-search"></i>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search phases by name or description..."
                  class="search-field"
                />
                <button v-if="searchQuery" class="btn-clear-search" @click="searchQuery = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="status-filters-pills">
                <button
                  class="filter-pill"
                  :class="{ active: !statusFilter }"
                  @click="statusFilter = ''"
                >
                  All
                </button>
                <button
                  v-for="s in statusOptions"
                  :key="s"
                  class="filter-pill"
                  :class="{ active: statusFilter === s }"
                  @click="filterByStatus(s)"
                >
                  {{ s }}
                </button>
              </div>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="table-responsive-container" v-if="!isMobile">
            <table class="phase-table">
              <thead>
                <tr>
                  <th class="col-step">#</th>
                  <th class="col-phase">PHASE</th>
                  <th class="col-desc">DELIVERABLES / TASKS</th>
                  <th class="col-status">STATUS</th>
                  <th class="col-date">CREATED</th>
                  <th class="col-actions">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, idx) in filteredPhases" :key="p.id" class="phase-row">
                  <td class="col-step">
                    <span class="step-badge">{{ idx + 1 }}</span>
                  </td>
                  <td class="col-phase">
                    <div class="phase-name-badge">
                      <i class="fas fa-layer-group text-teal"></i>
                      <span>{{ p.title }}</span>
                    </div>
                  </td>
                  <td class="col-desc" :title="p.description">
                    <div class="desc-content">
                      {{ truncateText(p.description, 70) }}
                    </div>
                  </td>
                  <td class="col-status">
                    <span :class="['status-badge-pipeline', getStatusClass(p.status)]">
                      <span class="pulse-dot"></span>
                      <i :class="statusIconMap[p.status]"></i>
                      <span>{{ p.status }}</span>
                    </span>
                  </td>
                  <td class="col-date">
                    <div class="date-chip">
                      <i class="fas fa-calendar-day"></i>
                      <span>{{ formatDate(p.created_at) }}</span>
                    </div>
                  </td>
                  <td class="col-actions">
                    <div class="action-buttons-group">
                      <button class="btn-table-action edit" @click="editPhase(p)" title="Edit Phase">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-table-action delete" @click="deletePhase(p.id)" title="Delete Phase">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-if="filteredPhases.length === 0" class="empty-row">
                  <td colspan="6">
                    <div class="empty-state-card">
                      <div class="empty-icon-box">
                        <i class="fas fa-inbox"></i>
                      </div>
                      <h4>No Phases Found</h4>
                      <p>{{ searchQuery ? 'No phases match your search filter.' : 'Your lifecycle is currently empty. Add your first phase above.' }}</p>
                      <button v-if="!searchQuery" class="btn-empty-action" @click="resetToDefaults">
                        <i class="fas fa-undo"></i> Load Default 9 Phases
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-phase-cards" v-else>
            <div v-for="(p, idx) in filteredPhases" :key="p.id" class="m-phase-card">
              <div class="mp-head">
                <div class="mp-title-wrap">
                  <span class="mp-step">Step {{ idx + 1 }}</span>
                  <h4 class="mp-title">{{ p.title }}</h4>
                </div>
                <div class="mp-actions">
                  <button class="btn-table-action edit" @click="editPhase(p)"><i class="fas fa-edit"></i></button>
                  <button class="btn-table-action delete" @click="deletePhase(p.id)"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>

              <p class="mp-desc">{{ p.description || 'No description provided' }}</p>

              <div class="mp-foot">
                <span :class="['status-badge-pipeline', getStatusClass(p.status)]">
                  <i :class="statusIconMap[p.status]"></i> {{ p.status }}
                </span>
                <span class="mp-date">
                  <i class="fas fa-calendar-day"></i> {{ formatDate(p.created_at) }}
                </span>
              </div>
            </div>

            <div v-if="filteredPhases.length === 0" class="empty-state-card">
              <div class="empty-icon-box">
                <i class="fas fa-inbox"></i>
              </div>
              <h4>No Phases Found</h4>
              <p>Add a phase above or restore defaults.</p>
              <button class="btn-empty-action" @click="resetToDefaults">
                <i class="fas fa-undo"></i> Restore Default Phases
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
import axios from 'axios';
import { toastSuccess, toastError, toastWarning } from '@/utils/toast.js';

export default {
  name: 'MobileAppLifeCycle',
  components: { Sidebar },
  data() {
    return {
      isSubmitting: false,
      editingId: null,
      isMobile: false,
      isSidebarVisible: true,
      formVisible: false,
      searchQuery: '',
      statusFilter: '',
      form: { title: '', description: '', status: 'Planning' },
      phases: [],
      chart: null,
      defaultPhases: [
        { id: 1, title: 'Problem Identification', description: 'Identify the core problem that the app will solve. Market research, user pain points, and opportunity analysis.', status: 'Completed', created_at: new Date().toISOString() },
        { id: 2, title: 'Requirement Gathering', description: 'Collect and document functional and non-functional requirements. Stakeholder interviews, user stories, and use cases.', status: 'Completed', created_at: new Date().toISOString() },
        { id: 3, title: 'Planning', description: 'Create project roadmap, timeline, resource allocation, and budget. Define milestones and deliverables.', status: 'In Progress', created_at: new Date().toISOString() },
        { id: 4, title: 'Designing', description: 'UI/UX design, wireframes, prototypes, and design system. User flow and interaction design.', status: 'Planning', created_at: new Date().toISOString() },
        { id: 5, title: 'Development', description: 'Frontend and backend development. API integration, database setup, and core feature implementation.', status: 'Planning', created_at: new Date().toISOString() },
        { id: 6, title: 'Testing', description: 'Unit testing, integration testing, user acceptance testing, and bug fixing. Performance and security testing.', status: 'Planning', created_at: new Date().toISOString() },
        { id: 7, title: 'Re-development', description: 'Address feedback, fix issues, and improve features based on testing results and user feedback.', status: 'Planning', created_at: new Date().toISOString() },
        { id: 8, title: 'Review', description: 'Final review, stakeholder sign-off, and quality assurance. Ensure all requirements are met.', status: 'Planning', created_at: new Date().toISOString() },
        { id: 9, title: 'Deployment', description: 'Deploy to Play Store/App Store. Release management, monitoring, and post-launch support.', status: 'Planning', created_at: new Date().toISOString() }
      ],
      statusOptions: ['Planning', 'In Progress', 'Review', 'Completed', 'Blocked'],
      statusIconMap: {
        'Planning': 'fas fa-clock',
        'In Progress': 'fas fa-spinner',
        'Review': 'fas fa-eye',
        'Completed': 'fas fa-check-double',
        'Blocked': 'fas fa-ban'
      },
      competitors: [
        {
          name: 'AppX Pro',
          icon: 'fas fa-cube',
          rating: '4.8 ★',
          bg: '#ecfdf5',
          color: '#059669',
          features: ['AI-driven roadmap', 'Team collaboration', 'Analytics dashboard', 'Automated testing'],
          note: 'Strong in analytics, but lacks structured stage-gate tracking.'
        },
        {
          name: 'LaunchPad',
          icon: 'fas fa-rocket',
          rating: '4.5 ★',
          bg: '#eff6ff',
          color: '#2563eb',
          features: ['Store submission helper', 'Beta testing', 'User feedback', 'Crash reporting'],
          note: 'Great for store launch, with minimal support for early architecture.'
        },
        {
          name: 'ARCH 360 (Yours)',
          icon: 'fas fa-star',
          rating: '5.0 ★ Enterprise',
          bg: '#f0fdfa',
          color: '#0d9488',
          highlight: true,
          features: ['Full 9-phase lifecycle', 'Real-time timeline stepper', 'Custom phase creation', 'Competitor benchmarking'],
          note: 'All-in-one ecosystem with comprehensive lifecycle traceability.'
        }
      ]
    };
  },
  computed: {
    statusCounts() {
      const map = { Planning: 0, 'In Progress': 0, Review: 0, Completed: 0, Blocked: 0 };
      this.phases.forEach(p => { if (map[p.status] !== undefined) map[p.status]++; });
      return map;
    },
    completedCount() {
      return this.statusCounts['Completed'] || 0;
    },
    completionPercentage() {
      if (!this.phases.length) return 0;
      return Math.round((this.completedCount / this.phases.length) * 100);
    },
    filteredPhases() {
      let list = this.phases;
      if (this.statusFilter) list = list.filter(p => p.status === this.statusFilter);
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(p => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
      }
      return list;
    },
    orderedPhases() {
      const order = [
        'Problem Identification',
        'Requirement Gathering',
        'Planning',
        'Designing',
        'Development',
        'Testing',
        'Re-development',
        'Review',
        'Deployment'
      ];
      return [...this.phases].sort((a, b) => {
        const indexA = order.indexOf(a.title);
        const indexB = order.indexOf(b.title);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
  },
  methods: {
    toggleForm() {
      this.formVisible = !this.formVisible;
    },
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status;
    },
    truncateText(text, len) {
      if (!text) return '—';
      return text.length > len ? text.substring(0, len) + '...' : text;
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'completed') return 'completed';
      if (s === 'in progress') return 'inprogress';
      if (s === 'review') return 'review';
      if (s === 'blocked') return 'blocked';
      return 'planning';
    },
    getPhaseStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'completed') return 'node-completed';
      if (s === 'in progress') return 'node-active';
      if (s === 'blocked') return 'node-blocked';
      return 'node-pending';
    },
    getPhaseIcon(index) {
      const icons = [
        'fa-lightbulb',
        'fa-list-check',
        'fa-calendar-plus',
        'fa-pen-ruler',
        'fa-code',
        'fa-vial',
        'fa-rotate',
        'fa-eye',
        'fa-cloud-upload-alt'
      ];
      return `fas ${icons[index % icons.length]}`;
    },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 992;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },

    async fetchPhases() {
      try {
        const res = await axios.get('/api/lifecycle/phases', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.phases = res.data && res.data.length ? res.data : this.defaultPhases;
        this.updateChart();
      } catch {
        if (!this.phases.length) {
          this.phases = [...this.defaultPhases];
          this.updateChart();
        }
      }
    },

    resetToDefaults() {
      this.phases = JSON.parse(JSON.stringify(this.defaultPhases));
      this.statusFilter = '';
      this.searchQuery = '';
      this.resetForm();
      this.updateChart();
      toastSuccess('Standard 9-phase lifecycle restored');
    },

    async submitPhase() {
      if (!this.form.title.trim() || !this.form.description.trim()) {
        toastWarning('Please fill in both Phase Title and Description');
        return;
      }
      this.isSubmitting = true;
      try {
        const url = this.editingId ? `/api/lifecycle/phases/${this.editingId}` : '/api/lifecycle/phases';
        const method = this.editingId ? 'put' : 'post';
        await axios({
          method,
          url,
          data: this.form,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toastSuccess(this.editingId ? 'Phase updated successfully' : 'Phase created successfully');
        this.resetForm();
        await this.fetchPhases();
      } catch {
        if (this.editingId) {
          const idx = this.phases.findIndex(p => p.id === this.editingId);
          if (idx > -1) {
            this.phases[idx] = { ...this.phases[idx], ...this.form };
          }
        } else {
          this.phases.push({
            id: Date.now(),
            ...this.form,
            created_at: new Date().toISOString()
          });
        }
        this.resetForm();
        this.updateChart();
        toastSuccess(this.editingId ? 'Phase updated locally' : 'Phase added to pipeline');
      } finally {
        this.isSubmitting = false;
      }
    },

    editPhase(phase) {
      this.editingId = phase.id;
      this.form.title = phase.title;
      this.form.description = phase.description;
      this.form.status = phase.status;
      this.formVisible = true;
      window.scrollTo({ top: 120, behavior: 'smooth' });
    },

    async deletePhase(id) {
      if (!confirm('Are you sure you want to remove this phase from the lifecycle?')) return;
      try {
        await axios.delete(`/api/lifecycle/phases/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.phases = this.phases.filter(p => p.id !== id);
        this.updateChart();
        toastSuccess('Phase deleted');
      } catch {
        this.phases = this.phases.filter(p => p.id !== id);
        this.updateChart();
        toastSuccess('Phase deleted locally');
      }
    },

    resetForm() {
      this.form = { title: '', description: '', status: 'Planning' };
      this.editingId = null;
    },

    updateChart() {
      this.$nextTick(() => {
        if (!this.$refs.statusChart) return;
        const counts = { Planning: 0, 'In Progress': 0, Review: 0, Completed: 0, Blocked: 0 };
        this.phases.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });
        const labels = Object.keys(counts);
        const data = Object.values(counts);
        const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

        if (this.chart) {
          this.chart.destroy();
        }

        if (typeof Chart !== 'undefined') {
          this.chart = new Chart(this.$refs.statusChart, {
            type: 'doughnut',
            data: {
              labels,
              datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              cutout: '70%',
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#0f172a',
                  titleFont: { family: 'Plus Jakarta Sans', size: 12 },
                  bodyFont: { family: 'Inter', size: 12 },
                  padding: 10,
                  cornerRadius: 8
                }
              }
            }
          });
        }
      });
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchPhases();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
    if (this.chart) this.chart.destroy();
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ════════ Master Page Layout ════════ */
.layout {
  display: flex;
  flex-direction: column;
  background: var(--bg-app, #f8fafc);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text, #0f172a);
}

.main-content {
  display: flex;
  flex: 1;
  padding: 20px 28px;
  gap: 24px;
}

.content {
  flex: 1;
  min-width: 0;
  background: transparent;
  overflow-x: hidden;
}

.text-teal { color: #0d9488 !important; }
.text-emerald { color: #059669 !important; }

/* ════════ Mobile Top Header ════════ */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px solid var(--border, #e2e8f0);
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-add {
  background: #0d9488;
  color: #ffffff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.btn-mobile-menu {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

/* ════════ Executive Header Banner ════════ */
.executive-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: #0d9488;
  letter-spacing: 0.6px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.status-meta-pill {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}

.header-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary-action:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border: none;
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
  transition: all 0.15s ease;
}

.btn-primary-action:hover {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  transform: translateY(-1px);
}

/* ════════ KPI Metrics Grid ════════ */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
}

.metric-card.card-active {
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
}

.metric-card.card-completed { border-left: 3px solid #10b981; }
.metric-card.card-inprogress { border-left: 3px solid #3b82f6; }
.metric-card.card-planning { border-left: 3px solid #f59e0b; }
.metric-card.card-review { border-left: 3px solid #8b5cf6; }

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.metric-title {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.metric-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.icon-all { background: #f1f5f9; color: #475569; }
.icon-completed { background: #ecfdf5; color: #059669; }
.icon-inprogress { background: #eff6ff; color: #2563eb; }
.icon-planning { background: #fffbeb; color: #d97706; }
.icon-review { background: #f5f3ff; color: #7c3aed; }

.metric-body {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metric-number {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.metric-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
}

.tag-all { background: #f1f5f9; color: #475569; }
.tag-completed { background: #ecfdf5; color: #047857; }
.tag-inprogress { background: #eff6ff; color: #1d4ed8; }
.tag-planning { background: #fffbeb; color: #b45309; }
.tag-review { background: #f5f3ff; color: #6d28d9; }

/* ════════ Executive Card Containers ════════ */
.card-executive {
  background: #ffffff;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.card-highlight {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
}

.card-header-actionable {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.card-header-clean {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 12px;
}

.cha-left, .chc-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cha-icon, .chc-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.icon-teal { background: #f0fdfa; border: 1px solid #ccfbf1; color: #0d9488; }
.icon-amber { background: #fffbeb; border: 1px solid #fde68a; color: #d97706; }
.icon-purple { background: #f5f3ff; border: 1px solid #ede9fe; color: #7c3aed; }
.icon-indigo { background: #eef2ff; border: 1px solid #e0e7ff; color: #4f46e5; }

.cha-title, .chc-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.cha-sub, .chc-sub {
  font-size: 12px;
  color: #64748b;
}

.btn-toggle-round {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-toggle-round.rotated {
  transform: rotate(180deg);
}

/* ════════ Form Body ════════ */
.form-body-wrap {
  padding-top: 18px;
  margin-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.form-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field-item.full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.char-counter {
  font-size: 11px;
  color: #94a3b8;
}

.char-counter.limit-warn {
  color: #d97706;
  font-weight: 700;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
}

.custom-input, .custom-select {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: #ffffff;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  transition: all 0.15s ease;
}

.custom-input:focus, .custom-select:focus, .custom-textarea:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.custom-textarea {
  width: 100%;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;
  transition: all 0.15s ease;
}

.form-actions-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.btn-action-cancel {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action-cancel:hover {
  background: #f8fafc;
  color: #0f172a;
}

.btn-action-submit {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border: none;
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
  transition: all 0.15s ease;
}

.btn-action-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  transform: translateY(-1px);
}

/* ════════ Stepper Timeline Visualizer ════════ */
.stepper-progress-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.stepper-pipeline-container {
  overflow-x: auto;
  padding: 10px 4px 16px;
}

.stepper-pipeline {
  display: flex;
  gap: 16px;
  min-width: 1100px;
}

.stepper-node {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 220px;
}

.node-connector {
  position: absolute;
  top: 18px;
  left: calc(50% + 20px);
  right: calc(-50% + 20px);
  height: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.stepper-node.node-completed .node-connector {
  background: #10b981;
}

.node-marker {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 2px solid #cbd5e1;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin: 0 auto 14px;
  position: relative;
  z-index: 2;
  transition: all 0.2s ease;
}

.stepper-node.node-completed .node-marker {
  background: #10b981;
  border-color: #10b981;
  color: #ffffff;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.stepper-node.node-active .node-marker {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
  animation: pulse-ring 2s infinite;
}

.stepper-node.node-blocked .node-marker {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1); }
  100% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); }
}

.node-content {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  transition: all 0.2s ease;
}

.node-content:hover {
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 8px;
}

.node-step-tag {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.node-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
  line-height: 1.35;
}

.node-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.45;
  margin: 0 0 12px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.node-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.node-date {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.node-actions {
  display: flex;
  gap: 5px;
}

.node-btn {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.node-btn.edit:hover { background: #f0fdfa; color: #0d9488; border-color: #99f6e4; }
.node-btn.delete:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

/* ════════ Analytics Double Grid ════════ */
.analytics-double-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-content-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}

.chart-canvas-container {
  max-width: 200px;
  max-height: 200px;
  margin: 0 auto;
}

.chart-legend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
}

.legend-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 11.5px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.legend-pill.planning .legend-dot { background: #f59e0b; }
.legend-pill.inprogress .legend-dot { background: #3b82f6; }
.legend-pill.review .legend-dot { background: #8b5cf6; }
.legend-pill.completed .legend-dot { background: #10b981; }
.legend-pill.blocked .legend-dot { background: #ef4444; }

.legend-name { color: #475569; font-weight: 500; }
.legend-count { font-weight: 700; color: #0f172a; }

/* Competitor Benchmark */
.badge-benchmark {
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: #0d9488;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}

.competitor-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.comp-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.comp-item:hover {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.comp-item.comp-highlight {
  border-color: #99f6e4;
  background: #f0fdfa;
}

.comp-head {
  margin-bottom: 10px;
}

.comp-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comp-icon {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}

.comp-name {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.comp-rating {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.comp-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.comp-features-list li {
  font-size: 11.5px;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.comp-note-footer {
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

/* ════════ Master Table Strip ════════ */
.table-toolbar {
  flex-wrap: wrap;
  gap: 16px;
}

.table-search-strip {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input-box {
  position: relative;
  width: 260px;
}

.search-input-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 12px;
}

.search-field {
  width: 100%;
  padding: 8px 30px 8px 34px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  font-size: 12.5px;
  color: #0f172a;
  font-family: inherit;
}

.search-field:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.12);
}

.btn-clear-search {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  font-size: 11px;
}

.status-filters-pills {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
}

.filter-pill {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-pill.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Table Design */
.table-responsive-container {
  overflow-x: auto;
  width: 100%;
}

.phase-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
  font-size: 13px;
}

.phase-table thead th {
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.phase-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.phase-table tbody tr:hover {
  background-color: #f8fafc;
}

.phase-table td {
  padding: 14px 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.col-step { width: 50px; text-align: center; }
.col-phase { width: 220px; }
.col-desc { min-width: 260px; max-width: 400px; }
.col-status { width: 140px; white-space: nowrap; }
.col-date { width: 130px; white-space: nowrap; }
.col-actions { width: 100px; text-align: right; }

.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  font-size: 12px;
}

.phase-name-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
}

.desc-content {
  color: #475569;
  line-height: 1.45;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.date-chip i {
  color: #94a3b8;
  font-size: 11px;
}

/* Status Badges */
.status-badge-pipeline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.status-badge-pipeline.completed {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.status-badge-pipeline.inprogress {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.status-badge-pipeline.planning {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.status-badge-pipeline.review {
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}

.status-badge-pipeline.blocked {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Action Buttons */
.action-buttons-group {
  display: inline-flex;
  gap: 6px;
}

.btn-table-action {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-table-action.edit:hover {
  background: #f0fdfa;
  color: #0d9488;
  border-color: #99f6e4;
}

.btn-table-action.delete:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

/* Empty State */
.empty-row td {
  padding: 40px 16px;
}

.empty-state-card {
  text-align: center;
  max-width: 360px;
  margin: 0 auto;
}

.empty-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin: 0 auto 12px;
}

.empty-state-card h4 {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.empty-state-card p {
  font-size: 12.5px;
  color: #64748b;
  margin: 0 0 14px;
}

.btn-empty-action {
  background: #0d9488;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* Mobile Phase Cards */
.mobile-phase-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.m-phase-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
}

.mp-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mp-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mp-step {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 5px;
}

.mp-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.mp-actions {
  display: flex;
  gap: 6px;
}

.mp-desc {
  font-size: 12.5px;
  color: #475569;
  margin: 0 0 10px;
  line-height: 1.45;
}

.mp-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mp-date {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ════════ Responsive ════════ */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .analytics-double-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 14px;
  }

  .executive-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-secondary-action, .btn-primary-action {
    flex: 1;
    justify-content: center;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-fields-grid {
    grid-template-columns: 1fr;
  }

  .competitor-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>