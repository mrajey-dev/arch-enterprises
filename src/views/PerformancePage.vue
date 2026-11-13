<template>
  <div class="layout">
    <div class="main-content">
      <!-- Admin Sidebar (Rendered if not on employee route) -->
      <Sidebar v-if="!isEmployeeRoute" />

      <section class="content" :class="{ 'no-sidebar-padding': isEmployeeRoute }">
        
        <!-- HEADER CARD -->
        <header class="performance-hero-banner">
          <div class="banner-left">
            <div class="banner-icon-badge">
              <i class="fas fa-chart-line"></i>
            </div>
            <div>
              <div class="banner-tag">
                <i class="fas fa-award"></i>
                <span>PERFORMANCE MANAGEMENT & EVALUATION</span>
              </div>
              <h1 class="banner-title">Employee Performance</h1>
              <p class="banner-subtitle">
                Track, evaluate, and record quarterly & yearly KPI performance metrics and milestones.
              </p>
            </div>
          </div>

          <!-- Evaluation Period & Employee Filters -->
          <div class="banner-filters-card">
            <!-- 👤 Employee Selector -->
            <div class="filter-field">
              <label class="field-label"><i class="fas fa-user"></i> Employee</label>
              <select v-model="form.user_id" @change="fetchData" class="custom-select select-user">
                <option disabled value="">Select Employee</option>
                <option v-for="u in filteredUsers" :key="u.id" :value="u.id">
                  {{ u.name }}
                </option>
              </select>
            </div>

            <!-- Type Selector -->
            <div class="filter-field">
              <label class="field-label"><i class="fas fa-sliders"></i> Period Type</label>
              <select v-model="form.type" class="custom-select">
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <!-- Quarter Selector -->
            <div v-if="form.type === 'quarterly'" class="filter-field">
              <label class="field-label"><i class="fas fa-calendar-week"></i> Quarter</label>
              <select v-model="form.quarter" class="custom-select">
                <option value="Q1">Q1 (Jan-Mar)</option>
                <option value="Q2">Q2 (Apr-Jun)</option>
                <option value="Q3">Q3 (Jul-Sep)</option>
                <option value="Q4">Q4 (Oct-Dec)</option>
              </select>
            </div>

            <!-- Year Input -->
            <div class="filter-field year-field">
              <label class="field-label"><i class="fas fa-calendar-alt"></i> Year</label>
              <input type="number" v-model="form.year" class="custom-input input-year" />
            </div>
          </div>
        </header>

        <!-- EVALUATION BREAKDOWN CARD -->
        <div class="performance-card breakdown-card">
          <div class="card-top-bar">
            <div class="card-title-group">
              <div class="card-title-icon"><i class="fas fa-list-check"></i></div>
              <div>
                <h3 class="card-heading">Performance Breakdown</h3>
                <div class="current-filter-badge">
                  <span>Evaluating:</span>
                  <strong>{{ form.type.toUpperCase() }}</strong>
                  <span v-if="form.type === 'quarterly'"> • {{ form.quarter }}</span>
                  <span> • {{ form.year }}</span>
                </div>
              </div>
            </div>

            <div class="score-pill-badge" :class="{ 'score-high': Number(total) >= 80, 'score-mid': Number(total) >= 50 && Number(total) < 80 }">
              <span class="score-label">Total Score</span>
              <span class="score-value">{{ total }} <small>pts</small></span>
            </div>
          </div>

          <div class="table-responsive-wrapper">
            <table class="performance-table">
              <thead>
                <tr>
                  <th class="th-seq">#</th>
                  <th class="th-term">Evaluation Term / Activity</th>
                  <th class="th-weight">Weight (Max Pts)</th>
                  <th class="th-target">Target</th>
                  <th class="th-achieve">Achievement</th>
                  <th class="th-points">Points Awarded</th>
                </tr>
              </thead>

              <tbody v-if="rows.length">
                <template v-for="(group, key) in grouped" :key="key">
                  <!-- Section Group Header Row -->
                  <tr class="section-header-row">
                    <td colspan="6">
                      <div class="section-title-wrap">
                        <span class="section-indicator"></span>
                        <span class="section-name">{{ keyLabel(key) }}</span>
                        <!-- Add extra activity button -->
                        <button 
                          v-if="key === 'extra'" 
                          type="button" 
                          class="btn-add-extra" 
                          @click="addExtra"
                          title="Add Extra Activity"
                        >
                          <i class="fas fa-plus"></i> Add Extra Activity
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Data Rows -->
                  <tr 
                    v-for="(item, i) in group" 
                    :key="item.temp_id || item.term_id"
                    class="data-row"
                    :class="{ 'extra-row': item.category === 'extra' }"
                  >
                    <!-- Index -->
                    <td class="td-seq">
                      <span class="row-num">{{ i + 1 }}</span>
                    </td>

                    <!-- Term Name -->
                    <td class="td-term">
                      <div class="term-content-cell">
                        <input 
                          v-if="item.category === 'extra' && (item.is_new || item.is_editing)"
                          v-model="item.name"
                          placeholder="Enter activity description..."
                          class="cell-input edit-name-input"
                          @keyup.enter="saveEdit(item)"
                        />
                        <span v-else class="term-label">{{ item.name }}</span>

                        <!-- Extra Actions (Edit / Delete / Save) -->
                        <div v-if="item.category === 'extra'" class="extra-action-buttons">
                          <button 
                            v-if="item.is_editing || item.is_new" 
                            type="button" 
                            class="action-icon-btn save-btn" 
                            @click="saveEdit(item)"
                            title="Save Activity Name"
                          >
                            <i class="fas fa-check"></i>
                          </button>
                          <button 
                            v-else 
                            type="button" 
                            class="action-icon-btn edit-btn" 
                            @click="editExtra(item)"
                            title="Edit Activity"
                          >
                            <i class="fas fa-pencil-alt"></i>
                          </button>
                          <button 
                            type="button" 
                            class="action-icon-btn delete-btn" 
                            @click="deleteExtra(item)"
                            title="Delete Activity"
                          >
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    </td>

                    <!-- Weight / Max Points -->
                    <td class="td-weight">
                      <input 
                        v-if="item.category === 'extra' && (item.is_new || item.is_editing)"
                        type="number"
                        v-model.number="item.max_points"
                        class="cell-input num-input"
                        placeholder="Max"
                      />
                      <span v-else class="weight-badge">{{ item.max_points }}</span>
                    </td>

                    <!-- Target -->
                    <td class="td-target">
                      <input 
                        v-if="item.category !== 'extra'" 
                        type="number" 
                        v-model.number="item.target" 
                        @input="calculate(item)"
                        :disabled="Number(item.term_id) === 4 || Number(item.term_id) === 7 || Number(item.term_id) === 15 || Number(item.term_id) === 18"
                        :class="{ 'disabled-input': Number(item.term_id) === 4 || Number(item.term_id) === 7 || Number(item.term_id) === 15 || Number(item.term_id) === 18 }"
                        class="cell-input num-input"
                      />
                      <span v-else class="dash-muted">—</span>
                    </td>

                    <!-- Achievement -->
                    <td class="td-achieve">
                      <input 
                        v-if="item.category !== 'extra'"
                        type="number"
                        v-model.number="item.achievement"
                        @input="calculate(item)"
                        class="cell-input num-input achieve-input"
                      />
                      <span v-else class="dash-muted">—</span>
                    </td>

                    <!-- Points Awarded -->
                    <td class="td-points">
                      <span class="points-tag-pill">
                        {{ Number(item.points || 0).toFixed(2) }}
                      </span>
                    </td>
                  </tr>
                </template>
              </tbody>

              <!-- Empty State -->
              <tbody v-else>
                <tr>
                  <td colspan="6" class="empty-state-cell">
                    <div class="empty-wrap">
                      <i class="fas fa-user-clock"></i>
                      <h4>No Employee Selected</h4>
                      <p>Select an employee from the dropdown above to load or record their KPI evaluation.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Action Bar -->
          <div class="card-bottom-bar">
            <div class="bottom-left-summary" v-if="rows.length">
              <span>Total calculated score: <strong>{{ total }} points</strong></span>
            </div>
            <div class="bottom-right-actions">
              <button 
                type="button" 
                class="btn-save-performance" 
                @click="save" 
                :disabled="loading || !form.user_id"
              >
                <i class="fas" :class="loading ? 'fa-circle-notch fa-spin' : 'fa-check-circle'"></i>
                <span>{{ loading ? 'Saving...' : 'Save Performance Record' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- PERFORMANCE HISTORY & TRENDS CARD -->
        <div class="performance-card history-card">
          <div class="card-top-bar">
            <div class="card-title-group">
              <div class="card-title-icon history-icon"><i class="fas fa-history"></i></div>
              <div>
                <h3 class="card-heading">Performance History & Analytics</h3>
                <p class="card-sub-desc">Comprehensive summary of past evaluations across all employees</p>
              </div>
            </div>

            <div class="history-count-badge">
              <i class="fas fa-database"></i>
              <span>{{ history.length }} Records Logged</span>
            </div>
          </div>

          <!-- Filter & Search Controls -->
          <div class="history-controls-row">
            <div class="search-input-wrapper">
              <i class="fas fa-search search-lens"></i>
              <input 
                type="text" 
                v-model="search" 
                placeholder="Search employee name..." 
                class="history-search-input"
              />
              <button v-if="search" @click="search = ''" class="clear-search-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="filters-group-row">
              <select v-model="filterType" class="history-select">
                <option value="">All Types</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>

              <input 
                type="number" 
                v-model="filterYear" 
                placeholder="Filter Year" 
                class="history-input-year"
              />

              <select v-model="sortKey" class="history-select">
                <option value="year">Sort by Year</option>
                <option value="points">Sort by Points</option>
              </select>

              <select v-model="sortOrder" class="history-select">
                <option value="desc">Descending (High to Low)</option>
                <option value="asc">Ascending (Low to High)</option>
              </select>
            </div>
          </div>

          <!-- 🏆 Top Performer Spotlight -->
          <div v-if="topPerformer" class="top-performer-banner">
            <div class="trophy-badge">
              <i class="fas fa-trophy"></i>
            </div>
            <div class="top-performer-details">
              <span class="spotlight-tag">TOP PERFORMER OF THE PERIOD</span>
              <div class="spotlight-name">{{ topPerformer.employee_name }}</div>
            </div>
            <div class="top-score-badge">
              <span>{{ topPerformer.total_points }}</span>
              <small>pts</small>
            </div>
          </div>

          <!-- Chart Visual Container -->
          <div class="chart-wrapper-card">
            <div class="chart-header">
              <span class="chart-title"><i class="fas fa-chart-column"></i> Performance Score Distribution</span>
            </div>
            <div class="chart-box">
              <canvas id="performanceChart"></canvas>
            </div>
          </div>

          <!-- Modern Leaderboard Table -->
          <div class="table-responsive-wrapper table-history-wrapper">
            <table class="performance-table modern-table">
              <thead>
                <tr>
                  <th class="th-emp">Employee</th>
                  <th class="th-ptype">Evaluation Type</th>
                  <th class="th-pquarter">Quarter</th>
                  <th class="th-pyear">Year</th>
                  <th class="th-ppoints text-right">Total Points</th>
                  <th class="th-paction text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr 
                  v-for="h in processedHistory" 
                  :key="h.employee_name + h.year + h.quarter"
                  :class="{ 'row-top-performer': topPerformer && h.employee_name === topPerformer.employee_name }"
                  class="history-data-row"
                >
                  <td class="td-emp">
                    <div class="employee-cell-profile">
                      <div class="emp-avatar">
                        {{ (h.employee_name || '?').charAt(0).toUpperCase() }}
                      </div>
                      <div class="emp-name-wrap">
                        <span class="emp-name">{{ h.employee_name }}</span>
                        <span v-if="topPerformer && h.employee_name === topPerformer.employee_name" class="leader-badge">
                          <i class="fas fa-crown"></i> Leader
                        </span>
                      </div>
                    </div>
                  </td>

                  <td class="td-ptype">
                    <span class="period-type-chip" :class="h.type">
                      {{ h.type }}
                    </span>
                  </td>

                  <td class="td-pquarter">
                    <span v-if="h.type === 'quarterly'" class="quarter-tag-chip">
                      {{ h.quarter }}
                    </span>
                    <span v-else class="dash-muted">—</span>
                  </td>

                  <td class="td-pyear">
                    <span class="year-cell-text">{{ h.year }}</span>
                  </td>

                  <td class="td-ppoints text-right">
                    <span class="total-points-badge">
                      {{ Number(h.total_points || 0).toFixed(2) }}
                    </span>
                  </td>

                  <td class="td-paction text-center">
                    <div class="history-actions-row">
                      <button 
                        type="button" 
                        class="history-btn edit-history-btn"
                        @click="editHistory(h)"
                        title="Edit and recalculate this evaluation"
                      >
                        <i class="fas fa-pencil-alt"></i>
                        <span>Edit</span>
                      </button>
                      <button 
                        type="button" 
                        class="history-btn delete-history-btn"
                        @click="deleteHistory(h)"
                        title="Delete this evaluation record"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="processedHistory.length === 0">
                  <td colspan="6" class="empty-state-cell">
                    <div class="empty-wrap">
                      <i class="fas fa-search"></i>
                      <h4>No Records Match Filters</h4>
                      <p>Try adjusting your search query, period type, or year filter.</p>
                    </div>
                  </td>
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
import Sidebar from "../components/Sidebar.vue";
import axios from "axios";
import Chart from "chart.js/auto";

export default {
  name: "PerformancePage",
  components: {
    Sidebar
  },
  data() {
    return {
      search: "",
      sortKey: "year",
      sortOrder: "desc",
      filterType: "",
      filterYear: "",
      history: [],
      loading: false,
      users: [],
      form: {
        user_id: "",
        type: "quarterly",
        quarter: "Q1",
        year: new Date().getFullYear(),
      },
      rows: []
    };
  },

  computed: {
    isEmployeeRoute() {
      return this.$route.path.startsWith('/employee');
    },

    processedHistory() {
      let data = [...this.history];

      // 🔍 SEARCH
      if (this.search) {
        data = data.filter(h =>
          (h.employee_name || "").toLowerCase().includes(this.search.toLowerCase())
        );
      }

      // 🎯 FILTER
      if (this.filterType) {
        data = data.filter(h => h.type === this.filterType);
      }

      if (this.filterYear) {
        data = data.filter(h => h.year == this.filterYear);
      }

      // ⬆⬇ SORT
      data.sort((a, b) => {
        let res = 0;

        if (this.sortKey === "points") {
          res = Number(a.total_points) - Number(b.total_points);
        } else {
          res = Number(a[this.sortKey]) - Number(b[this.sortKey]);
        }

        return this.sortOrder === "asc" ? res : -res;
      });

      return data;
    },

    // 🏆 TOP PERFORMER
    topPerformer() {
      if (!this.history.length) return null;

      return this.history.reduce((max, h) =>
        Number(h.total_points) > (Number(max?.total_points) || 0) ? h : max
      , null);
    },

    filteredUsers() {
      return this.users.filter(
        u => u.department !== 'Ownership' && u.department !== 'IT'
      );
    },

    grouped() {
      return {
        common: this.rows.filter(r => r.category === "common" || r.category === "management" || r.category === "account"),
        kpi: this.rows.filter(r => r.category === "kpi"),
        extra: this.rows.filter(r => r.category === "extra"),
      };
    },

    total() {
      return this.rows.reduce((sum, r) => sum + Number(r.points || 0), 0).toFixed(2);
    }
  },

  watch: {
    history: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.renderChart();
        });
      }
    }
  },

  methods: {
    renderChart() {
      const ctx = document.getElementById("performanceChart");
      if (!ctx) return;

      // ❌ destroy old chart (important)
      if (this.chart) {
        this.chart.destroy();
      }

      // ✅ group by employee (clean data)
      const grouped = {};

      this.history.forEach(h => {
        if (!grouped[h.employee_name]) {
          grouped[h.employee_name] = 0;
        }
        grouped[h.employee_name] += Number(h.total_points);
      });

      const labels = Object.keys(grouped);
      const data = Object.values(grouped);

      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Total Performance Points",
            data,
            backgroundColor: "#4f46e5",
            hoverBackgroundColor: "#4338ca",
            borderRadius: 8,
            barThickness: 28
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0f172a",
              titleColor: "#ffffff",
              bodyColor: "#e2e8f0",
              padding: 10,
              cornerRadius: 8
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: "#64748b",
                font: { size: 12, family: "'Inter', sans-serif" }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: "#f1f5f9"
              },
              ticks: {
                color: "#64748b",
                font: { size: 12, family: "'Inter', sans-serif" }
              }
            }
          }
        }
      });
    },

    async fetchHistory() {
      try {
        const res = await axios.get("/api/performance/history");
        this.history = res.data || [];
      } catch (e) {
        console.error("Failed to fetch performance history:", e);
      }
    },

    saveEdit(item) {
      if (!item.name) {
        alert("Name required");
        return;
      }

      if (!item.max_points) {
        alert("Max points required");
        return;
      }

      item.is_editing = false;
      this.calculate(item);
    },

    editExtra(item) {
      item.is_editing = true;
    },

    async deleteExtra(item) {
      if (!item.term_id) {
        this.rows = this.rows.filter(r => r !== item);
        return;
      }

      if (!confirm("Delete this extra activity?")) return;

      try {
        await axios.delete(`/api/performance/extra/${item.term_id}`, {
          data: {
            user_id: this.form.user_id
          }
        });
        this.rows = this.rows.filter(r => r !== item);
      } catch (e) {
        console.error("Failed to delete extra activity:", e);
      }
    },

    addExtra() {
      this.rows.push({
        temp_id: Date.now(),
        term_id: null,
        name: "",
        category: "extra",
        max_points: 5,
        target: 1,
        achievement: 0,
        points: 0,
        is_new: true
      });
    },

    keyLabel(key) {
      if (key === 'common' || key === 'management' || key === 'account') return "COMMON POINTS";
      if (key === 'kpi') return "KPI ACTIVITY BASED POINTS";
      if (key === 'extra') return "EXTRA EARN POINTS";
      return (key || "").toUpperCase();
    },

    calculate(item) {
      if (!item.achievement || item.achievement === 0) {
        item.points = 0;
        return;
      }

      if (!item.target || item.target === 0) {
        item.points = 0;
        return;
      }

      let ratio = item.achievement / item.target;

      if (Number(item.term_id) === 1 || Number(item.term_id) === 2) {
        item.points = ratio * item.max_points;
      } else {
        item.points = Math.min(ratio * item.max_points, item.max_points);
      }
    },

    async fetchUsers() {
      try {
        const res = await axios.get("/api/users");
        this.users = res.data || [];
      } catch (e) {
        console.error("Failed to fetch users:", e);
      }
    },

    async fetchData() {
      if (!this.form.user_id) {
        this.rows = [];
        return;
      }

      try {
        const res = await axios.post("/api/performance/get", this.form);
        this.rows = (res.data || []).map(r => ({
          ...r,
          is_new: false
        }));

        this.rows.forEach(r => {
          if (r.achievement && r.target) {
            this.calculate(r);
          } else {
            r.points = Number(r.points || 0);
          }
        });
      } catch (e) {
        console.error("Failed to fetch performance data:", e);
      }
    },

    async save() {
      for (let r of this.rows) {
        if (r.category === 'extra' && !r.name) {
          alert("Extra activity name required");
          return;
        }
      }

      this.loading = true;
      try {
        await axios.post("/api/performance/save", {
          ...this.form,
          data: this.rows
        });
        alert("Saved successfully");
        this.fetchHistory();
      } catch (e) {
        console.error("Save error:", e);
        alert("Failed to save performance record");
      } finally {
        this.loading = false;
      }
    },

    editHistory(h) {
      let userId = h.user_id;
      if (!userId) {
        const u = this.users.find(u => u.name === h.employee_name);
        userId = u ? u.id : '';
      }

      this.form.user_id = userId;
      this.form.type = h.type;
      if (h.type === 'quarterly' && h.quarter) {
        this.form.quarter = h.quarter;
      }
      this.form.year = Number(h.year);

      // Fetch the performance breakdown data to edit
      this.fetchData();

      // Scroll smoothly to the breakdown editor card
      const breakdownEl = document.querySelector('.breakdown-card');
      if (breakdownEl) {
        breakdownEl.scrollIntoView({ behavior: 'smooth' });
      }
    },

    async deleteHistory(h) {
      let userId = h.user_id;
      if (!userId) {
        const u = this.users.find(u => u.name === h.employee_name);
        userId = u ? u.id : null;
      }

      const periodLabel = h.type === 'quarterly' ? `${h.quarter} ${h.year}` : `${h.year}`;
      if (!confirm(`Are you sure you want to delete the performance record for ${h.employee_name} (${periodLabel})? This will remove all evaluation records for this period.`)) {
        return;
      }

      try {
        await axios.post('/api/performance/delete', {
          user_id: userId,
          type: h.type,
          quarter: h.quarter,
          year: h.year
        });

        // If currently displaying the deleted record in the form, reset it
        if (this.form.user_id == userId && this.form.year == h.year && (h.type !== 'quarterly' || this.form.quarter === h.quarter)) {
          this.rows = [];
          this.form.user_id = '';
        }

        await this.fetchHistory();
        alert('Performance record deleted successfully.');
      } catch (e) {
        console.error('Failed to delete performance record:', e);
        alert('Failed to delete performance record.');
      }
    }
  },

  mounted() {
    this.fetchUsers();
    this.fetchHistory();
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* ======================================================== */
/* MAIN LAYOUT & TYPOGRAPHY                                 */
/* ======================================================== */
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

.no-sidebar-padding {
  padding: 0;
}

/* ======================================================== */
/* HERO BANNER                                              */
/* ======================================================== */
.performance-hero-banner {
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
  max-width: 580px;
  line-height: 1.4;
}

/* Filters Card in Banner */
.banner-filters-card {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.custom-select, .custom-input {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.custom-select:focus, .custom-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.select-user {
  min-width: 170px;
}

.input-year {
  width: 90px;
}

/* ======================================================== */
/* SHARED CARD STYLES                                       */
/* ======================================================== */
.performance-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #ede9fe;
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.history-icon {
  background: #e0f2fe;
  color: #0284c7;
}

.card-heading {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
  margin: 0;
}

.card-sub-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.current-filter-badge {
  font-size: 12px;
  color: #64748b;
  margin-top: 3px;
}

.current-filter-badge strong {
  color: #4f46e5;
}

.score-pill-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 14px;
}

.score-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}

.score-value {
  font-size: 22px;
  font-weight: 800;
  color: #4f46e5;
  line-height: 1.1;
}

.score-value small {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.score-pill-badge.score-high .score-value {
  color: #10b981;
}

.score-pill-badge.score-mid .score-value {
  color: #0284c7;
}

/* ======================================================== */
/* PERFORMANCE TABLE STYLES                                 */
/* ======================================================== */
.table-responsive-wrapper {
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.performance-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  min-width: 800px;
}

.performance-table thead {
  background: #f8fafc;
}

.performance-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.performance-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  background: white;
}

.data-row:hover td {
  background: #f8fafc;
}

.th-seq, .td-seq { width: 44px; text-align: center; }
.th-term { width: 320px; }
.th-weight { width: 120px; text-align: center; }
.th-target { width: 120px; text-align: center; }
.th-achieve { width: 130px; text-align: center; }
.th-points { width: 130px; text-align: right; }

.row-num {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

/* Section Header Rows */
.section-header-row td {
  background: #f1f5f9;
  padding: 10px 16px;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-indicator {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: #4f46e5;
}

.section-name {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #334155;
  text-transform: uppercase;
}

.btn-add-extra {
  margin-left: auto;
  background: #4f46e5;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-add-extra:hover {
  background: #4338ca;
  transform: translateY(-1px);
}

/* Cell Inputs */
.term-content-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.term-label {
  font-weight: 600;
  color: #1e293b;
}

.cell-input {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.cell-input:focus {
  background: white;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
}

.num-input {
  width: 80px;
  text-align: center;
}

.edit-name-input {
  flex: 1;
}

.disabled-input {
  background: #f1f5f9 !important;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

.weight-badge {
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.dash-muted {
  color: #cbd5e1;
}

.points-tag-pill {
  font-size: 13px;
  font-weight: 800;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  padding: 4px 10px;
  border-radius: 8px;
  display: inline-block;
}

.extra-action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.edit-btn {
  background: #eff6ff;
  color: #2563eb;
  border-color: #dbeafe;
}

.edit-btn:hover {
  background: #2563eb;
  color: white;
}

.save-btn {
  background: #ecfdf5;
  color: #059669;
  border-color: #d1fae5;
}

.save-btn:hover {
  background: #059669;
  color: white;
}

.delete-btn {
  background: #fff1f2;
  color: #e11d48;
  border-color: #ffe4e6;
}

.delete-btn:hover {
  background: #e11d48;
  color: white;
}

/* Empty State Cell */
.empty-state-cell {
  padding: 48px 20px;
  text-align: center;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.empty-wrap i {
  font-size: 36px;
  color: #cbd5e1;
}

.empty-wrap h4 {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.empty-wrap p {
  font-size: 13px;
  max-width: 400px;
  margin: 0;
}

/* Card Bottom Bar */
.card-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.bottom-left-summary {
  font-size: 13px;
  color: #64748b;
}

.bottom-left-summary strong {
  color: #0f172a;
}

.btn-save-performance {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
  transition: all 0.2s ease;
}

.btn-save-performance:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}

.btn-save-performance:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ======================================================== */
/* PERFORMANCE HISTORY SECTION                              */
/* ======================================================== */
.history-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #0284c7;
  background: #e0f2fe;
  padding: 6px 12px;
  border-radius: 20px;
}

.history-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 220px;
  max-width: 320px;
}

.search-lens {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
}

.history-search-input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
}

.history-search-input:focus {
  background: white;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.filters-group-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.history-select, .history-input-year {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  outline: none;
}

.history-input-year {
  width: 90px;
}

/* 🏆 Top Performer Banner */
.top-performer-banner {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.08);
}

.trophy-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(245, 158, 11, 0.3);
  flex-shrink: 0;
}

.top-performer-details {
  display: flex;
  flex-direction: column;
}

.spotlight-tag {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #b45309;
}

.spotlight-name {
  font-size: 18px;
  font-weight: 800;
  color: #78350f;
  letter-spacing: -0.01em;
}

.top-score-badge {
  margin-left: auto;
  font-size: 24px;
  font-weight: 800;
  color: #b45309;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.top-score-badge small {
  font-size: 12px;
  font-weight: 600;
}

/* Chart Card */
.chart-wrapper-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
}

.chart-header {
  margin-bottom: 12px;
}

.chart-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-box {
  height: 280px;
  position: relative;
}

/* History Leaderboard Table */
.employee-cell-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.emp-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.emp-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.emp-name {
  font-weight: 700;
  color: #0f172a;
}

.leader-badge {
  font-size: 10px;
  font-weight: 800;
  color: #b45309;
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 6px;
}

.period-type-chip {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.period-type-chip.quarterly {
  background: #eef2ff;
  color: #4f46e5;
}

.period-type-chip.yearly {
  background: #fef3c7;
  color: #b45309;
}

.quarter-tag-chip {
  background: #ede9fe;
  color: #6366f1;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.year-cell-text {
  font-weight: 600;
  color: #475569;
}

.total-points-badge {
  font-weight: 800;
  color: #059669;
  font-size: 14px;
}

.row-top-performer td {
  background: #fefce8 !important;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.th-paction {
  width: 140px;
}

.history-actions-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.history-btn {
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.edit-history-btn {
  background: #eff6ff;
  color: #2563eb;
  border-color: #dbeafe;
}

.edit-history-btn:hover {
  background: #2563eb;
  color: white;
  transform: translateY(-1px);
}

.delete-history-btn {
  background: #fff1f2;
  color: #e11d48;
  border-color: #ffe4e6;
  padding: 5px 8px;
}

.delete-history-btn:hover {
  background: #e11d48;
  color: white;
  transform: translateY(-1px);
}

/* ======================================================== */
/* RESPONSIVE MEDIA QUERIES                                 */
/* ======================================================== */
@media (max-width: 900px) {
  .performance-hero-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .banner-filters-card {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }

  .history-controls-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input-wrapper {
    max-width: 100%;
  }

  .filters-group-row {
    width: 100%;
  }
}
</style>