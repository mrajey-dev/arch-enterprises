<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header-card">
      <div>
        <h2>Employee Performance</h2>
        <p class="sub">Track quarterly & yearly performance</p>
      </div>

      <div class="filters">

        <!-- 👤 Employee -->
       <select v-model="form.user_id" @change="fetchData">
  <option disabled value="">Select Employee</option>

  <option v-for="u in filteredUsers" :key="u.id" :value="u.id">
    {{ u.name }}
  </option>
</select>

        <!-- Type -->
      <!-- Type -->
<select v-model="form.type">
  <option value="quarterly">Quarterly</option>
</select>

<!-- Quarter (only if quarterly) -->
<select v-if="form.type === 'quarterly'" v-model="form.quarter">
  <option value="Q1">Q1 (Jan-Mar)</option>
  <option value="Q2">Q2 (Apr-Jun)</option>
  <option value="Q3">Q3 (Jul-Sep)</option>
  <option value="Q4">Q4 (Oct-Dec)</option>
</select>
<input type="number" v-model="form.year" />
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">

      <div class="card-header">
        <h3>Performance Breakdown</h3>
        <div class="score">Total: {{ total }}</div>
      </div>
<div class="current-filter">
  Showing:
  <b>{{ form.type.toUpperCase() }}</b>
  <span v-if="form.type==='quarterly'"> - {{ form.quarter }}</span>
  ({{ form.year }})
</div>
      <table class="table">

        <thead>
          <tr>
            <th>#</th>
            <th>Term</th>
            <th>Weight</th>
            <th>Target</th>
            <th>Achievement</th>
            <th>Points</th>
          </tr>
        </thead>

        <tbody v-if="rows.length">
<template v-for="(group, key) in grouped" :key="key">

  <!-- SECTION HEADER -->
  <tr class="section">
    <td colspan="6">
      {{ keyLabel(key) }}

      <!-- ONLY FOR EXTRA -->
      <span v-if="key === 'extra'" class="add-btn" @click="addExtra">
        +
      </span>
    </td>
  </tr>

  <!-- ROWS -->
  <tr v-for="(item, i) in group" :key="item.temp_id || item.term_id">
    <td>{{ i+1 }}</td>

    <!-- ✅ Editable ONLY for new EXTRA -->
    <td style="display:flex;align-items:center;gap:8px">

<!-- NAME -->
<input v-if="item.category === 'extra' && (item.is_new || item.is_editing)"
       v-model="item.name"
       placeholder="Enter activity" />

<span v-else>{{ item.name }}</span>
  <!-- ACTIONS (ONLY EXTRA) -->
<template v-if="item.category === 'extra'">

  <!-- EDIT -->
  <span class="icon edit" @click="editExtra(item)">✏️</span>

  <!-- DELETE -->
  <span class="icon delete" @click="deleteExtra(item)">🗑️</span>

</template>

</td>

<td>
  <input v-if="item.category === 'extra' && (item.is_new || item.is_editing)"
         type="number"
         v-model.number="item.max_points" />

  <span v-else>{{ item.max_points }}</span>
</td> 

<td>
  <input 
    v-if="item.category !== 'extra'" 
    type="number" 
    v-model.number="item.target" 
    @input="calculate(item)"
    :disabled="Number(item.term_id) === 4 || Number(item.term_id) === 7 || Number(item.term_id) === 15 || Number(item.term_id) === 18"
    :class="{ 'disabled-input': Number(item.term_id) === 4 || Number(item.term_id) === 7 || Number(item.term_id) === 15 || Number(item.term_id) === 18 }"
  />
</td>

<td>
  <input v-if="item.category !== 'extra'"
         type="number"
         v-model.number="item.achievement"
         @input="calculate(item)" />
</td>

  <td class="points">{{ Number(item.points || 0).toFixed(2) }}</td>
  </tr>

</template>

        </tbody>

        <!-- EMPTY STATE -->
        <tbody v-else>
          <tr>
            <td colspan="6" class="empty">
              
            No employee selected or No data available
            </td>
          </tr>
        </tbody>

      </table>

      <!-- ACTION -->
      <div class="actions">
        <button @click="save" :disabled="loading || !form.user_id">
          {{ loading ? 'Saving...' : 'Save Performance' }}
        </button>
      </div>

    </div>
<div class="card history-card">

  <div class="card-header history-header">
    <div>
      <h3>📊 Performance History</h3>
      <p class="sub">All employees summary</p>
    </div>

    <div class="badge">
      {{ history.length }} Records
    </div>
  </div>
<div class="controls">

  <input v-model="search" placeholder="🔍 Search employee..." />

  <select v-model="filterType">
    <option value="">All Type</option>
    <option value="quarterly">Quarterly</option>
    <option value="yearly">Yearly</option>
  </select>

  <input type="number" v-model="filterYear" placeholder="Year" />

  <select v-model="sortKey">
    <option value="year">Sort by Year</option>
    <option value="points">Sort by Points</option>
  </select>

  <select v-model="sortOrder">
    <option value="desc">Desc</option>
    <option value="asc">Asc</option>
  </select>

</div>
<div v-if="topPerformer" class="top-card">
  🏆 Top Performer: 
  <b>{{ topPerformer.employee_name }}</b> 
  ({{ topPerformer.total_points }} pts)
</div>
<div class="chart-box">
  <canvas id="performanceChart"></canvas>
</div>
  <div class="table-wrapper">
    <table class="table modern-table">
      <thead>
        <tr>
          <th>👤 Employee</th>
          <th>Type</th>
          <th>Quarter</th>
          <th>Year</th>
          <th class="text-right">Total Points</th>
        </tr>
      </thead>

      <tbody>
       <tr v-for="h in processedHistory" :key="h.employee_name + h.year + h.quarter"
    :class="{ top: topPerformer && h.employee_name === topPerformer.employee_name }">

          <td class="emp">
            <div class="avatar">
              {{ h.employee_name.charAt(0) }}
            </div>
            {{ h.employee_name }}
          </td>

          <td>
            <span class="tag" :class="h.type">
              {{ h.type }}
            </span>
          </td>

          <td>
            <span v-if="h.type === 'quarterly'" class="quarter">
              {{ h.quarter }}
            </span>
            <span v-else>-</span>
          </td>

          <td>{{ h.year }}</td>

          <td class="points text-right">
            {{ h.total_points }}
          </td>

        </tr>
      </tbody>
    </table>
  </div>

</div>  
  </div>
</template>
<script>
import axios from "axios";
import Chart from "chart.js/auto";


export default {
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
  type: "quarterly", // ✅ correct
  quarter: "Q1",
  year: new Date().getFullYear(),
},

      rows: []
    };
  },

  computed: {
    processedHistory() {
    let data = [...this.history];

    // 🔍 SEARCH
    if (this.search) {
      data = data.filter(h =>
        h.employee_name.toLowerCase().includes(this.search.toLowerCase())
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
        res = a.total_points - b.total_points;
      } else {
        res = a[this.sortKey] - b[this.sortKey];
      }

      return this.sortOrder === "asc" ? res : -res;
    });

    return data;
  },

  // 🏆 TOP PERFORMER
  topPerformer() {
    if (!this.history.length) return null;

    return this.history.reduce((max, h) =>
      h.total_points > (max?.total_points || 0) ? h : max
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
        label: "Total Performance",
        data,

        // 🎨 COLORS
        backgroundColor: "#42a5f5",
        borderRadius: 8,
        barThickness: 30
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: { display: false },

        tooltip: {
          backgroundColor: "#333",
          titleColor: "#fff",
          bodyColor: "#fff"
        }
      },

      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#666"
          }
        },

        y: {
          beginAtZero: true,
          grid: {
            color: "#eee"
          },
          ticks: {
            color: "#666"
          }
        }
      }
    }
  });
},  
    async fetchHistory() {
  const res = await axios.get("/api/performance/history");
  this.history = res.data;
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

  // optional: recalculate
  this.calculate(item);
},
editExtra(item) {
  item.is_editing = true; // ✅ separate flag
},

async deleteExtra(item) {

  // not saved yet
  if (!item.term_id) {
    this.rows = this.rows.filter(r => r !== item);
    return;
  }

  if (!confirm("Delete this extra activity?")) return;

  await axios.delete(`/api/performance/extra/${item.term_id}`, {
    data: {
      user_id: this.form.user_id
    }
  });

  this.rows = this.rows.filter(r => r !== item);
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
    keyLabel(key){
      if(key === 'common' || key === 'management' || key === 'account') return "COMMON POINTS";
      if(key === 'kpi') return "KPI ACTIVITY BASED POINTS";
      if(key === 'extra') return "EXTRA EARN POINTS";
    },

calculate(item) {
  // ❌ if no achievement → keep 0
  if (!item.achievement || item.achievement === 0) {
    item.points = 0;
    return;
  }

  // ❌ if no target → also 0
  if (!item.target || item.target === 0) {
    item.points = 0;
    return;
  }

  let ratio = item.achievement / item.target;

  // ✅ SPECIAL CASE → term_id 1 & 2 (NO LIMIT)
  if (Number(item.term_id) === 1 || Number(item.term_id) === 2) {
    item.points = ratio * item.max_points;
  } 
  // ✅ NORMAL CASE → capped
  else {
    item.points = Math.min(ratio * item.max_points, item.max_points);
  }
},

    async fetchUsers(){
      const res = await axios.get("/api/users");
      this.users = res.data;
    },

async fetchData() {
  if (!this.form.user_id) {
    this.rows = [];
    return;
  }

  const res = await axios.post("/api/performance/get", this.form);

  this.rows = res.data.map(r => ({
    ...r,
    is_new: false
  }));

 this.rows.forEach(r => {
  // only calculate if achievement exists
  if (r.achievement && r.target) {
    this.calculate(r);
  } else {
    r.points = Number(r.points || 0); // keep DB value or 0
  }
});
},

  async save() {

for (let r of this.rows) {
  if (r.category === 'extra' && !r.name) {
    alert("Extra activity name required");
    return;
  }
}

  this.loading = true;

  await axios.post("/api/performance/save", {
    ...this.form,
    data: this.rows
  });

  this.loading = false;
  alert("Saved successfully");
}
  },

 mounted() {
  this.fetchUsers();
  this.fetchHistory();
}
};
</script>
<style scoped>
.page {
  margin-top: 76px;
  padding: 20px;
  background: #f5f7fb;
}

/* HEADER */
.header-card {
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub {
  color: #888;
  font-size: 13px;
}

/* FILTERS */
.filters {
  display: flex;
  gap: 10px;
}

select, input {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* CARD */
.card {
  margin-top: 20px;
  background: #fff;
  border-radius: 14px;
  padding: 15px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.05);
}

/* CARD HEADER */
.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.score {
  font-weight: bold;
  color: #4CAF50;
}

/* TABLE */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: #f3f6fb;
}

.table th, .table td {
  padding: 10px;
  border: 1px solid #eee;
}

.section {
  background: #eef4ff;
  font-weight: bold;
  color: #3a5bcc;
}

.points {
  font-weight: bold;
  color: #4CAF50;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #888;
}

/* BUTTON */
.actions {
  margin-top: 15px;
  text-align: right;
}

button {
  background: linear-gradient(135deg,#4CAF50,#2e7d32);
  color: #fff;
  padding: 10px 22px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}
.add-btn {
cursor: pointer;
    font-size: 20px;
    background: var(--card);
   padding: 4px 10px;
    border-radius: 56px;
    color: #ffffff;
    font-weight: bold;
    margin-left: 10px;
    align-items: center;
}
.add-btn:hover {
  color: #ffff00;
}
.icon {
  cursor: pointer;
  font-size: 14px;
  padding: 3px 6px;
  border-radius: 6px;
}

.icon.edit:hover {
  background: #e3f2fd;
}

.icon.delete:hover {
  background: #ffebee;
}
.btn-primary {
  background: #2196F3;
  color: #fff;
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.current-filter {
  margin-bottom: 10px;
  font-size: 14px;
  color: #555;
}
.history-card {
  padding: 20px;
}

/* HEADER */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

/* TABLE WRAPPER */
.table-wrapper {
  overflow-x: auto;
}

/* MODERN TABLE */
.modern-table {
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #555;
}

.modern-table td {
  background: #fff;
}

/* ROW HOVER */
.modern-table tbody tr:hover {
  background: #f1f7ff;
  transition: 0.2s;
}

/* EMPLOYEE CELL */
.emp {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg,#42a5f5,#1e88e5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* TAG */
.tag {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  text-transform: capitalize;
}

.tag.quarterly {
  background: #e8f5e9;
  color: #2e7d32;
}

.tag.yearly {
  background: #fff3e0;
  color: #ef6c00;
}

/* QUARTER */
.quarter {
  background: #ede7f6;
  color: #5e35b1;
  padding: 3px 8px;
  border-radius: 8px;
}

/* POINTS */
.points {
  font-weight: bold;
  color: #2e7d32;
}

.text-right {
  text-align: right;
}
.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.top-card {
  background: linear-gradient(135deg,#ffd54f,#ffb300);
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-weight: bold;
}

.top {
  background: #fffde7 !important;
}

canvas {
  margin-top: 20px;
  background: #fff;
  border-radius: 10px;
  padding: 10px;
}
.chart-box {
  height: 280px;   /* ✅ control height */
  margin-top: 20px;
}
.disabled-input {
  background: #f5f5f5;
  cursor: not-allowed;
}
</style>