<template>
  <div class="layout">
    <div class="main-content">
      <!-- Sidebar -->
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-mobile-alt"></i>
            <span>App Lifecycle</span>
          </div>
          <div class="mobile-stats-badge">
            <span>{{ phases.length }}</span>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-rocket"></i>
            </div>
            <div>
              <h1>App Lifecycle Manager</h1>
              <p class="subtitle-modern">Complete project lifecycle from ideation to deployment</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-list-check"></i>
            <span>{{ phases.length }} phases</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card" v-for="(count, status) in statusCounts" :key="status"
               :class="status.toLowerCase()" @click="filterByStatus(status)">
            <i :class="statusIconMap[status]"></i>
            <div class="stat-info">
              <span class="stat-value">{{ count }}</span>
              <span class="stat-label">{{ status }}</span>
            </div>
          </div>
        </div>

        <!-- Add / Edit Phase Card -->
        <div class="card-premium">
          <div class="card-header-premium" @click="toggleForm">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-pen-alt"></i>
                <span>{{ editingId ? 'Edit Phase' : 'Add New Phase' }}</span>
              </div>
              <i class="fas fa-chevron-down form-toggle" :class="{ rotated: formVisible }"></i>
            </div>
          </div>

          <div class="form-section" :class="{ 'form-hidden': !formVisible }">
            <div class="form-field">
              <label><i class="fas fa-tag"></i> Phase Title</label>
              <div class="field-wrapper">
                <i class="fas fa-file-alt field-icon"></i>
                <input type="text" v-model="form.title" placeholder="e.g. Problem Identification, Requirement Gathering..." />
              </div>
            </div>

            <div class="form-field">
              <label><i class="fas fa-flag"></i> Status</label>
              <div class="field-wrapper">
                <i class="fas fa-circle field-icon" style="color: #667eea;"></i>
                <select v-model="form.status" class="select-premium">
                  <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>

            <div class="form-field full-width">
              <label><i class="fas fa-align-left"></i> Description / Tasks</label>
              <div class="field-wrapper">
                <i class="fas fa-comment field-icon" style="top: 18px;"></i>
                <textarea v-model="form.description" rows="3" maxlength="300"
                          placeholder="What happens in this phase? Key deliverables, milestones..."></textarea>
              </div>
              <div class="char-counter">{{ form.description.length }}/300</div>
            </div>

            <div class="form-actions">
              <button class="btn-submit-premium" @click="submitPhase" :disabled="isSubmitting">
                <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> Saving...</span>
                <span v-else><i class="fas fa-paper-plane"></i> {{ editingId ? 'Update' : 'Add' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Lifecycle Timeline View -->
        <div class="card-premium">
          <div class="card-header-premium">
            <div class="section-title-modern">
              <i class="fas fa-road"></i>
              <span>Project Lifecycle Timeline</span>
            </div>
          </div>
          <div class="timeline-container">
            <div class="timeline">
              <div v-for="(phase, index) in orderedPhases" :key="phase.id" 
                   class="timeline-item" :class="getPhaseStatusClass(phase.status)">
                <div class="timeline-marker">
                  <i :class="getPhaseIcon(index)"></i>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-step">Step {{ index + 1 }}</span>
                    <span :class="['status-badge-timeline', getStatusClass(phase.status)]">
                      <i :class="statusIconMap[phase.status]"></i> {{ phase.status }}
                    </span>
                  </div>
                  <h4 class="timeline-title">{{ phase.title }}</h4>
                  <p class="timeline-description">{{ phase.description || 'No description provided' }}</p>
                  <div class="timeline-actions">
                    <button class="action-icon edit" @click="editPhase(phase)"><i class="fas fa-edit"></i></button>
                    <button class="action-icon delete" @click="deletePhase(phase.id)"><i class="fas fa-trash-alt"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Donut Chart -->
        <div class="card-premium">
          <div class="card-header-premium">
            <div class="section-title-modern">
              <i class="fas fa-chart-pie"></i>
              <span>Phase Status Distribution</span>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="statusChart"></canvas>
          </div>
        </div>

        <!-- Competitor Comparison -->
        <div class="card-premium competitor-card">
          <div class="card-header-premium">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-people-arrows"></i>
                <span>Competitor Comparison</span>
                <span class="badge-new">vs similar apps</span>
              </div>
            </div>
          </div>
          <div class="competitor-grid">
            <div class="competitor-item" v-for="(comp, idx) in competitors" :key="idx">
              <div class="comp-header">
                <i :class="comp.icon" style="font-size: 22px; color: #667eea;"></i>
                <h4>{{ comp.name }}</h4>
                <span class="comp-tag" :style="{ background: comp.color }">{{ comp.rating }}</span>
              </div>
              <ul class="comp-features">
                <li v-for="(feat, fi) in comp.features" :key="fi">
                  <i class="fas fa-check-circle" style="color: #10b981;"></i> {{ feat }}
                </li>
              </ul>
              <div class="comp-notes">
                <i class="fas fa-lightbulb"></i> {{ comp.note }}
              </div>
            </div>
          </div>
        </div>

        <!-- Phases List (Mobile/Desktop) -->
        <div class="card-premium">
          <div class="card-header-premium">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-list-ul"></i>
                <span>All Phases</span>
                <span class="record-count-mobile" v-if="isMobile">{{ filteredPhases.length }}</span>
              </div>
            </div>
            <div class="table-info desktop-only">
              <i class="fas fa-file-alt"></i>
              <span>{{ phases.length }} phases</span>
            </div>
          </div>

          <!-- Mobile search -->
          <div class="search-bar-mobile" v-if="isMobile && phases.length > 0">
            <div class="search-group-mobile">
              <i class="fas fa-search"></i>
              <input type="text" v-model="searchQuery" placeholder="Search phases..." class="search-input-mobile" />
            </div>
          </div>

          <!-- Mobile Cards -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="p in filteredPhases" :key="p.id" class="request-card">
              <div class="card-header">
                <div class="card-type">
                  <span class="request-type-badge-mobile">
                    <i class="fas fa-tag"></i> {{ p.title }}
                  </span>
                </div>
                <div class="card-actions">
                  <button class="action-btn-mobile edit" @click="editPhase(p)"><i class="fas fa-edit"></i></button>
                  <button class="action-btn-mobile delete" @click="deletePhase(p.id)"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
              <div class="card-body">
                <div class="card-row"><span class="card-label"><i class="fas fa-align-left"></i> Desc</span>
                  <span class="card-value description-text">{{ p.description || '—' }}</span></div>
                <div class="card-row"><span class="card-label"><i class="fas fa-flag"></i> Status</span>
                  <span :class="['status-badge-mobile', getStatusClass(p.status)]">
                    <i :class="statusIconMap[p.status]"></i> {{ p.status }}
                  </span>
                </div>
                <div class="card-row"><span class="card-label"><i class="fas fa-calendar-alt"></i> Added</span>
                  <span class="card-value">{{ formatDate(p.created_at) }}</span></div>
              </div>
            </div>
            <div v-if="filteredPhases.length === 0" class="empty-state-mobile">
              <i class="fas fa-inbox"></i><h4>No phases</h4><p>Add your first phase above</p>
            </div>
          </div>

          <!-- Desktop Table -->
          <div class="table-wrapper-premium" v-else>
            <table class="request-table-premium">
              <thead><tr><th>#</th><th>Phase</th><th>Description</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                <tr v-for="(p, idx) in filteredPhases" :key="p.id" class="request-row">
                  <td class="step-cell">{{ idx + 1 }}</td>
                  <td class="type-cell"><span class="request-type-badge"><i class="fas fa-tag"></i> {{ p.title }}</span></td>
                  <td class="description-cell" :title="p.description">{{ truncateText(p.description, 55) }}</td>
                  <td><span :class="['status-badge-premium', getStatusClass(p.status)]"><i :class="statusIconMap[p.status]"></i> {{ p.status }}</span></td>
                  <td class="date-cell"><i class="fas fa-calendar-alt"></i> {{ formatDate(p.created_at) }}</td>
                  <td class="action-cell">
                    <div class="action-group">
                      <button class="action-icon edit" @click="editPhase(p)"><i class="fas fa-edit"></i></button>
                      <button class="action-icon delete" @click="deletePhase(p.id)"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredPhases.length === 0" class="empty-row">
                  <td colspan="6"><div class="empty-state-premium"><i class="fas fa-inbox"></i><h4>No phases</h4><p>Start building your app lifecycle</p></div></td>
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
import Sidebar from './components/Sidebar.vue';
import axios from 'axios';
import { toastSuccess, toastError, toastWarning } from '@/utils/toast.js';

export default {
  components: { Sidebar },
  data() {
    return {
      isSubmitting: false,
      editingId: null,
      isMobile: false,
      isSidebarVisible: true,
      formVisible: true,
      searchQuery: '',
      statusFilter: '',
      form: { title: '', description: '', status: 'Planning' },
      phases: [],
      chart: null,
      // Predefined lifecycle phases
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
          color: '#10b981',
          features: ['AI-driven roadmap', 'Team collaboration', 'Analytics dashboard', 'Automated testing'],
          note: 'Strong in automation and analytics, but lacks structured lifecycle phases.'
        },
        {
          name: 'LaunchPad',
          icon: 'fas fa-rocket',
          rating: '4.5 ★',
          color: '#3b82f6',
          features: ['Store submission helper', 'Beta testing', 'User feedback', 'Crash reporting'],
          note: 'Great for deployment and testing, but minimal support for early-phase planning.'
        },
        {
          name: 'MyApp (Yours)',
          icon: 'fas fa-star',
          rating: '5.0 ★',
          color: '#f59e0b',
          features: ['Full 9-phase lifecycle', 'Competitor comparison', 'Custom phases', 'Timeline view'],
          note: 'All-in-one solution with comprehensive lifecycle tracking and flexibility.'
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
    filteredPhases() {
      let list = this.phases;
      if (this.statusFilter) list = list.filter(p => p.status === this.statusFilter);
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
      }
      return list;
    },
    orderedPhases() {
      // Return phases in the correct lifecycle order
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
    toggleForm() { if (this.isMobile) this.formVisible = !this.formVisible; },
    filterByStatus(status) { this.statusFilter = this.statusFilter === status ? '' : status; },
    truncateText(text, len) { if (!text) return '—'; return text.length > len ? text.substr(0, len) + '…' : text; },
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
      if (s === 'completed') return 'timeline-completed';
      if (s === 'in progress') return 'timeline-active';
      return 'timeline-pending';
    },
    getPhaseIcon(index) {
      const icons = ['fa-lightbulb', 'fa-list-check', 'fa-calendar-plus', 'fa-pen-ruler', 'fa-code', 'fa-vial', 'fa-rotate', 'fa-eye', 'fa-cloud-upload-alt'];
      return `fas ${icons[index % icons.length]}`;
    },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    async fetchPhases() {
      try {
        const res = await axios.get('/api/lifecycle/phases', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.phases = res.data.length ? res.data : this.defaultPhases;
        this.updateChart();
      } catch {
        if (this.phases.length === 0) {
          this.phases = this.defaultPhases;
          this.updateChart();
        }
      }
    },

    async submitPhase() {
      if (!this.form.title || !this.form.description) {
        toastWarning('Please fill in title and description');
        return;
      }
      this.isSubmitting = true;
      try {
        const url = this.editingId ? `/api/lifecycle/phases/${this.editingId}` : '/api/lifecycle/phases';
        const method = this.editingId ? 'put' : 'post';
        await axios({ method, url, data: this.form, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        toastSuccess(this.editingId ? 'Phase updated' : 'Phase added');
        this.resetForm();
        await this.fetchPhases();
      } catch {
        if (this.editingId) {
          const idx = this.phases.findIndex(p => p.id === this.editingId);
          if (idx > -1) { this.phases[idx] = { ...this.phases[idx], ...this.form }; }
        } else {
          this.phases.push({ id: Date.now(), ...this.form, created_at: new Date().toISOString() });
        }
        this.resetForm();
        this.updateChart();
        toastSuccess('Phase saved successfully');
      } finally { this.isSubmitting = false; }
    },

    editPhase(phase) {
      this.editingId = phase.id;
      this.form.title = phase.title;
      this.form.description = phase.description;
      this.form.status = phase.status;
      if (this.isMobile) { this.formVisible = true; this.searchQuery = ''; }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async deletePhase(id) {
      if (!confirm('Delete this phase?')) return;
      try {
        await axios.delete(`/api/lifecycle/phases/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.phases = this.phases.filter(p => p.id !== id);
        this.updateChart();
        toastSuccess('Deleted');
      } catch {
        this.phases = this.phases.filter(p => p.id !== id);
        this.updateChart();
        toastSuccess('Deleted');
      }
    },

    resetForm() {
      this.form = { title: '', description: '', status: 'Planning' };
      this.editingId = null;
      if (this.isMobile) this.formVisible = false;
    },

    updateChart() {
      const counts = { Planning: 0, 'In Progress': 0, Review: 0, Completed: 0, Blocked: 0 };
      this.phases.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });
      const labels = Object.keys(counts);
      const data = Object.values(counts);
      const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

      if (this.chart) this.chart.destroy();
      this.chart = new Chart(this.$refs.statusChart, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 10 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '60%',
          plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10, padding: 16 } },
            tooltip: { backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#fff' }
          }
        }
      });
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchPhases();
    if (!localStorage.getItem('token')) {
      // Uncomment for auth: this.$router.push('/auth');
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
    if (this.chart) this.chart.destroy();
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
.layout { min-height: 100vh; font-family: 'Inter', sans-serif; background: #f0f4fd; }
.main-content { display: flex; gap: 20px; padding: 20px; min-height: 100vh; }
.content { flex: 1; background: white; border-radius: 28px; padding: 28px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow-x: auto; }

/* Header Styles */
.mobile-header { display: none; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.mobile-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; color: var(--dark); }
.mobile-title i { color: var(--primary-color); }
.mobile-stats-badge { background: var(--primary); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }

.content-header-modern { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.title-icon { width: 52px; height: 52px; background: var(--primary); border-radius: 18px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
.content-header-modern h1 { font-size: 28px; font-weight: 700; background: var(--primary); -webkit-background-clip: text; background-clip: text; color: transparent; margin: 0; }
.subtitle-modern { color: #6b7280; font-size: 14px; margin-top: 4px; }
.stats-badge-header { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #e0e7ff; border-radius: 40px; font-size: 14px; font-weight: 600; color: var(--primary-color); }

/* Stats Bar */
.stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; margin-bottom: 28px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 20px; transition: 0.2s; cursor: pointer; background: #f8fafc; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
.stat-card.planning { background: #fef3c7; } .stat-card.planning i { color: #d97706; }
.stat-card.inprogress { background: #dbeafe; } .stat-card.inprogress i { color: #2563eb; }
.stat-card.review { background: #ede9fe; } .stat-card.review i { color: #7c3aed; }
.stat-card.completed { background: #d1fae5; } .stat-card.completed i { color: #065f46; }
.stat-card.blocked { background: #fee2e2; } .stat-card.blocked i { color: #991b1b; }
.stat-card i { font-size: 28px; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
.stat-label { font-size: 11px; color: #6b7280; text-transform: capitalize; }

/* Card Styles */
.card-premium { background: white; border-radius: 24px; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04); }
.card-header-premium { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; cursor: pointer; }
.section-title-modern { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-weight: 600; color: #1a1a2e; width: 100%; }
.title-left { display: flex; align-items: center; gap: 10px; }
.form-toggle { transition: transform 0.3s; font-size: 14px; color: #9ca3af; }
.form-toggle.rotated { transform: rotate(180deg); }

/* Form */
.form-section { display: flex; flex-direction: column; gap: 20px; transition: 0.3s; }
.form-section.form-hidden { display: none; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field.full-width { grid-column: span 2; }
.form-field label { font-size: 13px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px; }
.field-wrapper { position: relative; }
.field-wrapper .field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 14px; }
.field-wrapper input, .field-wrapper textarea, .field-wrapper .select-premium {
  width: 100%; padding: 12px 14px 12px 42px; border: 2px solid #e5e7eb; border-radius: 14px; font-size: 14px; transition: 0.3s; font-family: inherit; background: white;
}
.field-wrapper .select-premium { appearance: auto; padding-right: 12px; }
.field-wrapper textarea { padding-top: 12px; resize: vertical; }
.field-wrapper input:focus, .field-wrapper textarea:focus, .field-wrapper .select-premium:focus {
  outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}
.char-counter { font-size: 11px; text-align: right; color: #6b7280; }
.form-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
.btn-submit-premium { padding: 10px 24px; background: var(--primary); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: 0.3s; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; }
.btn-submit-premium:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102,126,234,0.4); }
.btn-submit-premium:disabled { opacity: 0.6; cursor: not-allowed; }

/* Timeline */
.timeline-container { padding: 10px 0; }
.timeline { position: relative; padding-left: 30px; }
.timeline::before { content: ''; position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: #e5e7eb; }
.timeline-item { position: relative; margin-bottom: 30px; padding-left: 30px; }
.timeline-marker { position: absolute; left: -22px; top: 0; width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.timeline-item.timeline-completed .timeline-marker { background: #10b981; }
.timeline-item.timeline-active .timeline-marker { background: #3b82f6; animation: pulse 2s infinite; }
.timeline-item.timeline-pending .timeline-marker { background: #9ca3af; }
.timeline-content { background: #f8fafc; padding: 16px 20px; border-radius: 16px; border: 1px solid #e5e7eb; transition: 0.3s; }
.timeline-content:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
.timeline-step { font-size: 12px; font-weight: 600; color: #6b7280; background: #e5e7eb; padding: 2px 10px; border-radius: 12px; }
.status-badge-timeline { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
.status-badge-timeline.completed { background: #d1fae5; color: #065f46; }
.status-badge-timeline.inprogress { background: #dbeafe; color: #1e40af; }
.status-badge-timeline.planning { background: #fef3c7; color: #d97706; }
.status-badge-timeline.review { background: #ede9fe; color: #5b21b6; }
.status-badge-timeline.blocked { background: #fee2e2; color: #991b1b; }
.timeline-title { font-size: 16px; font-weight: 600; color: var(--dark); margin: 4px 0 6px; }
.timeline-description { font-size: 14px; color: #6b7280; margin: 0 0 10px; line-height: 1.5; }
.timeline-actions { display: flex; gap: 8px; }

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Chart */
.chart-container { max-width: 300px; margin: 0 auto; position: relative; }

/* Competitor */
.competitor-card { background: #fafcff; }
.competitor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 8px; }
.competitor-item { background: white; border-radius: 20px; padding: 18px; border: 1px solid #e5e7eb; transition: 0.2s; }
.competitor-item:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
.comp-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.comp-header h4 { font-size: 16px; font-weight: 700; color: var(--dark); margin: 0; }
.comp-tag { padding: 2px 12px; border-radius: 40px; font-size: 12px; font-weight: 600; color: white; }
.comp-features { list-style: none; padding: 0; margin: 10px 0; }
.comp-features li { font-size: 13px; color: #374151; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.comp-notes { background: #f1f5f9; border-radius: 12px; padding: 10px 12px; font-size: 13px; color: #4b5563; margin-top: 8px; display: flex; gap: 8px; align-items: flex-start; }
.badge-new { background: var(--primary); color: white; font-size: 10px; padding: 2px 12px; border-radius: 20px; font-weight: 500; }

/* Table Styles */
.search-bar-mobile { display: none; margin-bottom: 16px; }
.search-group-mobile { position: relative; flex: 1; }
.search-group-mobile i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-input-mobile { width: 100%; padding: 10px 12px 10px 38px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; background: white; }
.search-input-mobile:focus { outline: none; border-color: var(--primary-color); }

.table-wrapper-premium { overflow-x: auto; }
.request-table-premium { width: 100%; border-collapse: collapse; }
.request-table-premium th { text-align: left; padding: 14px; font-weight: 600; font-size: 13px; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
.request-table-premium td { padding: 14px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
.request-row:hover { background: #fafbfc; }
.step-cell { font-weight: 600; color: #9ca3af; width: 40px; }
.type-cell { min-width: 140px; }
.request-type-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #e0e7ff; color: var(--primary-color); border-radius: 20px; font-size: 12px; font-weight: 500; }
.description-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #6b7280; }
.date-cell { font-family: monospace; font-size: 12px; color: #6b7280; white-space: nowrap; }
.status-badge-premium { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.status-badge-premium.completed { background: #d1fae5; color: #065f46; }
.status-badge-premium.inprogress { background: #dbeafe; color: #1e40af; }
.status-badge-premium.planning { background: #fef3c7; color: #d97706; }
.status-badge-premium.review { background: #ede9fe; color: #5b21b6; }
.status-badge-premium.blocked { background: #fee2e2; color: #991b1b; }

.action-group { display: flex; gap: 8px; }
.action-icon { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; transition: 0.3s; display: inline-flex; align-items: center; justify-content: center; }
.action-icon.edit { background: #e0e7ff; color: var(--primary-color); }
.action-icon.edit:hover { background: #c7d2fe; transform: translateY(-2px); }
.action-icon.delete { background: #fee2e2; color: var(--danger); }
.action-icon.delete:hover { background: #fecaca; transform: translateY(-2px); }

/* Mobile Cards */
.mobile-cards { display: none; flex-direction: column; gap: 16px; padding: 4px; }
.request-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.request-type-badge-mobile { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #e0e7ff; color: var(--primary-color); border-radius: 12px; font-size: 12px; font-weight: 500; }
.action-btn-mobile { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; transition: 0.3s; display: inline-flex; align-items: center; justify-content: center; }
.action-btn-mobile.edit { background: #e0e7ff; color: var(--primary-color); }
.action-btn-mobile.delete { background: #fee2e2; color: var(--danger); }
.card-body { display: flex; flex-direction: column; gap: 10px; }
.card-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.card-label { font-size: 12px; color: #6b7280; font-weight: 500; display: flex; align-items: center; gap: 6px; min-width: 50px; }
.card-value { font-size: 13px; color: var(--dark); text-align: right; }
.description-text { max-width: 60%; word-break: break-word; text-align: right; }

.status-badge-mobile { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
.status-badge-mobile.completed { background: #d1fae5; color: #065f46; }
.status-badge-mobile.inprogress { background: #dbeafe; color: #1e40af; }
.status-badge-mobile.planning { background: #fef3c7; color: #d97706; }
.status-badge-mobile.review { background: #ede9fe; color: #5b21b6; }
.status-badge-mobile.blocked { background: #fee2e2; color: #991b1b; }

.empty-state-premium, .empty-state-mobile { text-align: center; padding: 40px 20px; color: #9ca3af; }
.empty-state-premium i, .empty-state-mobile i { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
.empty-state-premium h4, .empty-state-mobile h4 { font-size: 18px; color: #6b7280; }

.record-count-mobile { background: var(--primary); color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; margin-left: 4px; }
.table-info { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6b7280; }

/* Responsive */
@media (max-width: 1024px) { .description-cell { max-width: 120px; } }
@media (max-width: 768px) {
  .main-content { flex-direction: column; padding: 12px; }
  .content { padding: 16px; border-radius: 20px; }
  .mobile-header { display: flex; }
  .content-header-modern { display: none; }
  .stats-bar { grid-template-columns: repeat(2,1fr); gap: 10px; }
  .stat-card { padding: 12px; flex-direction: column; text-align: center; gap: 6px; }
  .stat-card i { font-size: 22px; }
  .stat-value { font-size: 20px; }
  .card-premium { padding: 16px; }
  .form-section.form-hidden { display: none; }
  .search-bar-mobile { display: block; }
  .table-wrapper-premium { display: none; }
  .mobile-cards { display: flex; }
  .table-info { display: none; }
  .competitor-grid { grid-template-columns: 1fr; }
  .timeline { padding-left: 20px; }
  .timeline-marker { width: 28px; height: 28px; font-size: 12px; left: -20px; }
}
@media (max-width: 480px) {
  .main-content { padding: 8px; }
  .content { padding: 12px; }
  .stats-bar { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card { padding: 10px; }
  .stat-card i { font-size: 18px; }
  .stat-value { font-size: 17px; }
  .mobile-title { font-size: 16px; }
  .mobile-stats-badge { width: 28px; height: 28px; font-size: 12px; }
  .card-premium { padding: 12px; }
  .card-row { flex-direction: column; align-items: flex-start; gap: 2px; }
  .card-value { text-align: left; width: 100%; }
  .description-text { max-width: 100%; text-align: left; }
  .timeline-content { padding: 12px 16px; }
  .timeline-title { font-size: 14px; }
}
@media (max-width: 380px) {
  .stats-bar { grid-template-columns: 1fr; }
  .stat-card { flex-direction: row; text-align: left; }
}
@media (max-width: 768px) { .desktop-only { display: none !important; } }
@media (min-width: 769px) { .mobile-only { display: none !important; } }
</style>