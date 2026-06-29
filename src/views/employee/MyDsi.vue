<template>
  <div class="layout">

    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="dsi-board-premium" v-if="!isMobile || !isSidebarVisible">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
       
          <div class="mobile-title">
            <i class="fas fa-chart-line"></i>
            <span>DSI</span>
          </div>
          <button class="mobile-view-all-btn" @click="openAllDsiPopup">
            <i class="fas fa-eye"></i>
          </button>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div>
              <h1>Daily Small Improvement</h1>
              <p class="subtitle-modern">Track and share your improvement ideas</p>
            </div>
          </div>
          <button class="view-all-btn-premium" @click="openAllDsiPopup">
            <i class="fas fa-eye"></i> View All DSI
          </button>
        </div>

        <!-- Stats Bar - Mobile Optimized -->
        <div class="stats-bar">
          <div class="stat-card" @click="filterByStatus('all')">
            <i class="fas fa-lightbulb"></i>
            <div class="stat-info">
              <span class="stat-value">{{ dsiList.length }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
          <div class="stat-card approved" @click="filterByStatus('Approved')">
            <i class="fas fa-check-circle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ approvedCount }}</span>
              <span class="stat-label">Approved</span>
            </div>
          </div>
          <div class="stat-card pending" @click="filterByStatus('Waiting')">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
        </div>

        <!-- Add DSI Form - Mobile Optimized -->
        <div class="form-card-premium">
          <div class="section-title-modern" @click="toggleForm">
            <div class="title-left">
              <i class="fas fa-plus-circle"></i>
              <span>Add New Improvement</span>
            </div>
            <i class="fas fa-chevron-down form-toggle" :class="{ rotated: formVisible }"></i>
          </div>

          <div class="dsi-form-grid" :class="{ 'form-hidden': !formVisible }">
            <div class="form-field">
              <label><i class="fas fa-exclamation-triangle"></i> Problem Statement</label>
              <textarea v-model="newDSI.problem" rows="2" placeholder="Describe the problem..." class="dsi-textarea-premium"></textarea>
            </div>

            <div class="form-field">
              <label><i class="fas fa-lightbulb"></i> Solution</label>
              <textarea v-model="newDSI.solution" rows="2" placeholder="Describe your solution..." class="dsi-textarea-premium"></textarea>
            </div>

            <div class="form-field">
              <label><i class="fas fa-chart-line"></i> Result / Outcome</label>
              <textarea v-model="newDSI.result" rows="2" placeholder="Describe the expected outcome..." class="dsi-textarea-premium"></textarea>
            </div>

            <div class="form-field image-upload-section">
              <label><i class="fas fa-camera"></i> Before & After Images</label>
              <div class="image-upload-row-premium">
                <label class="image-upload-card-premium" :class="{ 'has-image': newDSI.beforeImage }">
                  <input type="file" accept="image/*" @change="onImageChange($event, 'before')" hidden />
                  <div v-if="!newDSI.beforeImage" class="upload-placeholder-premium">
                    <i class="fas fa-image"></i>
                    <span>Before</span>
                  </div>
                  <img v-else :src="newDSI.beforeImage" class="upload-preview-premium" />
                </label>

                <label class="image-upload-card-premium" :class="{ 'has-image': newDSI.afterImage }">
                  <input type="file" accept="image/*" @change="onImageChange($event, 'after')" hidden />
                  <div v-if="!newDSI.afterImage" class="upload-placeholder-premium">
                    <i class="fas fa-check-circle"></i>
                    <span>After</span>
                  </div>
                  <img v-else :src="newDSI.afterImage" class="upload-preview-premium" />
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions" :class="{ 'form-hidden': !formVisible }">
            <button class="btn-submit-premium" @click="addDSI" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin"></i> Submitting...
              </span>
              <span v-else>
                <i class="fas fa-plus-circle"></i> Add Improvement
              </span>
            </button>
          </div>
        </div>

        <!-- Search/Filter - Mobile -->
        <div class="search-bar-mobile" v-if="isMobile && dsiList.length > 0">
          <div class="search-group-mobile">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Search improvements..." class="search-input-mobile" />
          </div>
        </div>

        <!-- DSI List -->
        <div class="table-card-premium">
          <div class="table-header-premium">
            <div class="section-title-modern">
              <div class="title-left">
                <i class="fas fa-list-ul"></i>
                <span>My Improvements</span>
                <span class="record-count-mobile" v-if="isMobile">{{ filteredDsiList.length }}</span>
              </div>
            </div>
            <div class="table-info desktop-only">
              <i class="fas fa-file-alt"></i>
              <span>{{ dsiList.length }} records</span>
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="(item, index) in filteredDsiList" :key="item.id" class="dsi-card">
              <div class="card-header">
                <div class="card-status">
                  <span :class="['status-badge-mobile', getStatusClass(item.status)]">
                    <i :class="getStatusIcon(item.status)"></i>
                    {{ capitalizeFirstLetter(item.status) }}
                  </span>
                  <span class="card-date"><i class="fas fa-calendar-alt"></i> {{ formatDate(item.date) }}</span>
                </div>
                <div class="card-actions">
                  <button class="action-btn-mobile delete" @click="deleteDSI(item.id, index)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div class="card-item">
                  <div class="card-label"><i class="fas fa-exclamation-triangle"></i> Problem</div>
                  <div class="card-text">
                    <span :class="{ 'truncated': !isExpanded(item.id, 'problem') && isTextLong(item.problem, 80) }">
                      {{ isExpanded(item.id, 'problem') ? (item.problem || '—') : truncateText(item.problem, 80) }}
                    </span>
                    <button 
                      v-if="isTextLong(item.problem, 80)" 
                      @click.stop="toggleReadMore(item.id, 'problem')"
                      class="readmore-btn"
                    >
                      {{ isExpanded(item.id, 'problem') ? 'Read Less' : 'Read More' }}
                    </button>
                  </div>
                </div>

                <div class="card-item">
                  <div class="card-label"><i class="fas fa-lightbulb"></i> Solution</div>
                  <div class="card-text">
                    <span :class="{ 'truncated': !isExpanded(item.id, 'solution') && isTextLong(item.solution, 80) }">
                      {{ isExpanded(item.id, 'solution') ? (item.solution || '—') : truncateText(item.solution, 80) }}
                    </span>
                    <button 
                      v-if="isTextLong(item.solution, 80)" 
                      @click.stop="toggleReadMore(item.id, 'solution')"
                      class="readmore-btn"
                    >
                      {{ isExpanded(item.id, 'solution') ? 'Read Less' : 'Read More' }}
                    </button>
                  </div>
                </div>

                <div class="card-item">
                  <div class="card-label"><i class="fas fa-chart-line"></i> Result</div>
                  <div class="card-text">
                    <span :class="{ 'truncated': !isExpanded(item.id, 'result') && isTextLong(item.result, 80) }">
                      {{ isExpanded(item.id, 'result') ? (item.result || '—') : truncateText(item.result, 80) }}
                    </span>
                    <button 
                      v-if="isTextLong(item.result, 80)" 
                      @click.stop="toggleReadMore(item.id, 'result')"
                      class="readmore-btn"
                    >
                      {{ isExpanded(item.id, 'result') ? 'Read Less' : 'Read More' }}
                    </button>
                  </div>
                </div>

                <div class="card-images" v-if="item.beforeImage || item.afterImage">
                  <div class="card-label"><i class="fas fa-camera"></i> Images</div>
                  <div class="card-image-row">
                    <div v-if="item.beforeImage" class="card-image-item" @click="openImage(item.beforeImage)">
                      <img :src="item.beforeImage" alt="Before" />
                      <span class="image-label">Before</span>
                    </div>
                    <div v-if="item.afterImage" class="card-image-item" @click="openImage(item.afterImage)">
                      <img :src="item.afterImage" alt="After" />
                      <span class="image-label">After</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile Empty State -->
            <div v-if="filteredDsiList.length === 0" class="empty-state-mobile">
              <i class="fas fa-lightbulb"></i>
              <h4>No Improvements</h4>
              <p>{{ searchQuery ? 'No matches found for your search' : 'Submit your first DSI using the form above' }}</p>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-wrapper-premium" v-else>
            <table class="dsi-table-premium">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Problem</th>
                  <th>Solution</th>
                  <th>Result</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredDsiList" :key="item.id" class="dsi-row-premium">
                  <td class="serial">{{ index + 1 }}</td>
                  <td class="problem-cell">
                    <div class="text-with-readmore">
                      <span :class="{ 'truncated': !isExpanded(item.id, 'problem') && isTextLong(item.problem, 50) }">
                        {{ isExpanded(item.id, 'problem') ? (item.problem || '—') : truncateText(item.problem, 50) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.problem, 50)" 
                        @click.stop="toggleReadMore(item.id, 'problem')"
                        class="readmore-btn"
                      >
                        {{ isExpanded(item.id, 'problem') ? 'Read Less' : 'Read More' }}
                      </button>
                    </div>
                  </td>
                  <td class="solution-cell">
                    <div class="text-with-readmore">
                      <span :class="{ 'truncated': !isExpanded(item.id, 'solution') && isTextLong(item.solution, 50) }">
                        {{ isExpanded(item.id, 'solution') ? (item.solution || '—') : truncateText(item.solution, 50) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.solution, 50)" 
                        @click.stop="toggleReadMore(item.id, 'solution')"
                        class="readmore-btn"
                      >
                        {{ isExpanded(item.id, 'solution') ? 'Read Less' : 'Read More' }}
                      </button>
                    </div>
                  </td>
                  <td class="result-cell">
                    <div class="text-with-readmore">
                      <span :class="{ 'truncated': !isExpanded(item.id, 'result') && isTextLong(item.result, 50) }">
                        {{ isExpanded(item.id, 'result') ? (item.result || '—') : truncateText(item.result, 50) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.result, 50)" 
                        @click.stop="toggleReadMore(item.id, 'result')"
                        class="readmore-btn"
                      >
                        {{ isExpanded(item.id, 'result') ? 'Read Less' : 'Read More' }}
                      </button>
                    </div>
                  </td>
                  <td class="image-cell">
                    <img v-if="item.beforeImage" :src="item.beforeImage" class="dsi-thumb-premium" @click="openImage(item.beforeImage)" />
                    <span v-else class="no-image">—</span>
                  </td>
                  <td class="image-cell">
                    <img v-if="item.afterImage" :src="item.afterImage" class="dsi-thumb-premium" @click="openImage(item.afterImage)" />
                    <span v-else class="no-image">—</span>
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i> {{ formatDate(item.date) }}
                  </td>
                  <td class="status-cell">
                    <span :class="['status-badge-premium', getStatusClass(item.status)]">
                      <i :class="getStatusIcon(item.status)"></i>
                      {{ capitalizeFirstLetter(item.status) }}
                    </span>
                  </td>
                  <td class="action-cell">
                    <button class="action-icon delete" @click="deleteDSI(item.id, index)" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>

                <!-- Desktop Empty State -->
                <tr v-if="filteredDsiList.length === 0" class="empty-row">
                  <td colspan="9">
                    <div class="empty-state-premium">
                      <i class="fas fa-lightbulb"></i>
                      <h4>No Improvements Yet</h4>
                      <p>Submit your first DSI using the form above</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- All DSI Popup Modal - Mobile Optimized -->
    <div v-if="showAllDsiPopup" class="modal-premium" @click.self="closeAllDsiPopup">
      <div class="modal-premium-container xlarge" :class="{ 'mobile-modal': isMobile }">
        <div class="modal-premium-header">
          <div class="modal-icon">
            <i class="fas fa-list-alt"></i>
          </div>
          <h2>All DSI</h2>
          <button class="modal-close" @click="closeAllDsiPopup">×</button>
        </div>
        <div class="modal-premium-body">
          <!-- Mobile Modal View -->
          <div class="modal-mobile-cards" v-if="isMobile">
            <div v-for="(item, i) in dsiList" :key="i" class="dsi-modal-card">
              <div class="modal-card-header">
                <span class="modal-user">{{ item.user || 'Me' }}</span>
                <span :class="['status-badge-mobile', getStatusClass(item.status)]">
                  <i :class="getStatusIcon(item.status)"></i>
                  {{ capitalizeFirstLetter(item.status) }}
                </span>
              </div>
              <div class="modal-card-body">
                <div class="modal-card-item">
                  <span class="modal-card-label">Problem</span>
                  <span class="modal-card-text">{{ item.problem || '—' }}</span>
                </div>
                <div class="modal-card-item">
                  <span class="modal-card-label">Solution</span>
                  <span class="modal-card-text">{{ item.solution || '—' }}</span>
                </div>
                <div class="modal-card-item">
                  <span class="modal-card-label">Result</span>
                  <span class="modal-card-text">{{ item.result || '—' }}</span>
                </div>
                <div class="modal-card-images" v-if="item.beforeImage || item.afterImage">
                  <div class="modal-card-label">Images</div>
                  <div class="modal-card-image-row">
                    <div v-if="item.beforeImage" class="modal-card-image" @click="openImage(item.beforeImage)">
                      <img :src="item.beforeImage" alt="Before" />
                      <span>Before</span>
                    </div>
                    <div v-if="item.afterImage" class="modal-card-image" @click="openImage(item.afterImage)">
                      <img :src="item.afterImage" alt="After" />
                      <span>After</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Modal Table -->
          <div class="table-wrapper-premium" v-else>
            <table class="dsi-table-premium">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Problem</th>
                  <th>Solution</th>
                  <th>Result</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in dsiList" :key="i" class="dsi-row-premium">
                  <td class="serial">{{ i + 1 }}</td>
                  <td class="user-cell">{{ item.user || 'Me' }}</td>
                  <td class="problem-cell">
                    <div class="text-with-readmore">
                      <span :class="{ 'truncated': !isPopupExpanded(item.id, 'problem') && isTextLong(item.problem, 40) }">
                        {{ isPopupExpanded(item.id, 'problem') ? (item.problem || '—') : truncateText(item.problem, 40) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.problem, 40)" 
                        @click.stop="togglePopupReadMore(item.id, 'problem')"
                        class="readmore-btn"
                      >
                        {{ isPopupExpanded(item.id, 'problem') ? 'Read Less' : 'Read More' }}
                      </button>
                    </div>
                  </td>
                  <td class="solution-cell">
                    <div class="text-with-readmore">
                      <span :class="{ 'truncated': !isPopupExpanded(item.id, 'solution') && isTextLong(item.solution, 40) }">
                        {{ isPopupExpanded(item.id, 'solution') ? (item.solution || '—') : truncateText(item.solution, 40) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.solution, 40)" 
                        @click.stop="togglePopupReadMore(item.id, 'solution')"
                        class="readmore-btn"
                      >
                        {{ isPopupExpanded(item.id, 'solution') ? 'Read Less' : 'Read More' }}
                      </button>
                    </div>
                  </td>
                  <td class="result-cell">
                    <div class="text-with-readmore">
                      <span :class="{ 'truncated': !isPopupExpanded(item.id, 'result') && isTextLong(item.result, 40) }">
                        {{ isPopupExpanded(item.id, 'result') ? (item.result || '—') : truncateText(item.result, 40) }}
                      </span>
                      <button 
                        v-if="isTextLong(item.result, 40)" 
                        @click.stop="togglePopupReadMore(item.id, 'result')"
                        class="readmore-btn"
                      >
                        {{ isPopupExpanded(item.id, 'result') ? 'Read Less' : 'Read More' }}
                      </button>
                    </div>
                  </td>
                  <td class="image-cell">
                    <img v-if="item.beforeImage" :src="item.beforeImage" class="dsi-thumb-premium" @click="openImage(item.beforeImage)" />
                    <span v-else class="no-image">—</span>
                  </td>
                  <td class="image-cell">
                    <img v-if="item.afterImage" :src="item.afterImage" class="dsi-thumb-premium" @click="openImage(item.afterImage)" />
                    <span v-else class="no-image">—</span>
                  </td>
                  <td class="date-cell">
                    <i class="fas fa-calendar-alt"></i> {{ formatDate(item.date) }}
                  </td>
                  <td class="status-cell">
                    <span :class="['status-badge-premium', getStatusClass(item.status)]">
                      <i :class="getStatusIcon(item.status)"></i>
                      {{ capitalizeFirstLetter(item.status) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="dsiList.length === 0" class="empty-row">
                  <td colspan="9">
                    <div class="empty-state-premium">
                      <i class="fas fa-inbox"></i>
                      <p>No DSI records found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-premium-footer" :class="{ 'mobile-footer': isMobile }">
          <button class="btn-primary-modern" @click="closeAllDsiPopup">
            <i class="fas fa-check"></i> Close
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="previewImage" class="modal-premium image-modal" @click.self="previewImage = null">
      <div class="image-modal-content" @click.stop>
        <button class="image-close-btn" @click="previewImage = null">
          <i class="fas fa-times"></i>
        </button>
        <img :src="previewImage" alt="Preview" />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "ViewDsi",
  components: {
    Sidebar
  },
  data() {
    return {
      isSubmitting: false,
      showAllDsiPopup: false,
      username: '',
      isMobile: false,
      isSidebarVisible: true,
      formVisible: true,
      searchQuery: '',
      statusFilter: '',
      expandedTexts: new Map(),
      popupExpandedTexts: new Map(),
      newDSI: {
        problem: "",
        solution: "",
        result: "",
        beforeImage: null,
        afterImage: null,
        beforeImageFile: null,
        afterImageFile: null,
      },
      dsiList: [],
      previewImage: null,
    }
  },
  computed: {
    approvedCount() {
      return this.dsiList.filter(item => item.status === 'Approved').length;
    },
    pendingCount() {
      return this.dsiList.filter(item => item.status === 'Waiting' || item.status === 'Pending').length;
    },
    filteredDsiList() {
      let filtered = this.dsiList;
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
          (item.problem && item.problem.toLowerCase().includes(query)) ||
          (item.solution && item.solution.toLowerCase().includes(query)) ||
          (item.result && item.result.toLowerCase().includes(query))
        );
      }
      
      // Status filter
      if (this.statusFilter && this.statusFilter !== 'all') {
        filtered = filtered.filter(item => item.status === this.statusFilter);
      }
      
      return filtered;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadDSIs();
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/auth');
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    toggleForm() {
      if (this.isMobile) {
        this.formVisible = !this.formVisible;
      }
    },
    filterByStatus(status) {
      this.statusFilter = this.statusFilter === status ? '' : status;
    },
    getExpandKey(id, field) {
      return `${id}_${field}`;
    },
    isExpanded(id, field) {
      const key = this.getExpandKey(id, field);
      return this.expandedTexts.get(key) === true;
    },
    isPopupExpanded(id, field) {
      const key = this.getExpandKey(id, field);
      return this.popupExpandedTexts.get(key) === true;
    },
    isTextLong(text, length) {
      if (!text || typeof text !== 'string') return false;
      return text.length > length;
    },
    truncateText(text, length) {
      if (!text || typeof text !== 'string') return '—';
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    },
    toggleReadMore(id, field) {
      const key = this.getExpandKey(id, field);
      const currentState = this.expandedTexts.get(key) || false;
      this.expandedTexts.set(key, !currentState);
      this.expandedTexts = new Map(this.expandedTexts);
    },
    togglePopupReadMore(id, field) {
      const key = this.getExpandKey(id, field);
      const currentState = this.popupExpandedTexts.get(key) || false;
      this.popupExpandedTexts.set(key, !currentState);
      this.popupExpandedTexts = new Map(this.popupExpandedTexts);
    },
    getStatusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'approved';
      if (s === 'rejected') return 'rejected';
      return 'pending';
    },
    getStatusIcon(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'fas fa-check-circle';
      if (s === 'rejected') return 'fas fa-times-circle';
      return 'fas fa-clock';
    },
    formatDate(date) {
      if (!date) return '—';
      try {
        return new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch (e) {
        return '—';
      }
    },
    capitalizeFirstLetter(text) {
      if (!text || typeof text !== 'string') return '—';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    async deleteDSI(id, index) {
      if (!confirm('Are you sure you want to delete this DSI?')) return;
      try {
        await axios.delete(`/api/dsis/${id}`);
        this.dsiList.splice(index, 1);
        toastSuccess('DSI deleted successfully');
      } catch (error) {
        console.error(error);
        toastError('Failed to delete DSI');
      }
    },
    async openAllDsiPopup() {
      this.showAllDsiPopup = true;
      await this.fetchAllDSI();
    },
    async fetchAllDSI() {
      try {
        const res = await axios.get('/api/dsis/all');
        this.dsiList = res.data;
      } catch (e) {
        toastError('Failed to load DSI');
      }
    },
    closeAllDsiPopup() {
      this.showAllDsiPopup = false;
      this.popupExpandedTexts.clear();
      this.popupExpandedTexts = new Map();
    },
    async loadDSIs() {
      try {
        const res = await axios.get('/api/dsis');
        const fixUrl = (url) => url ? url.replace('/api/backend', '/backend') : null;
        this.dsiList = res.data.map(dsi => ({
          id: dsi.id,
          problem: dsi.problem || '',
          solution: dsi.solution || '',
          result: dsi.result || '',
          beforeImage: fixUrl(dsi.before_image),
          afterImage: fixUrl(dsi.after_image),
          date: dsi.created_at,
          status: dsi.status || 'Waiting',
          user: dsi.user_name || dsi.user
        }));
      } catch (error) {
        console.error('Failed to load DSIs:', error);
        toastError('Failed to load improvements');
      }
    },
    async addDSI() {
      if (this.isSubmitting) return;
      if (!this.newDSI.problem || !this.newDSI.solution || !this.newDSI.result) {
        toastWarning('Please fill all fields');
        return;
      }

      this.isSubmitting = true;
      try {
        const formData = new FormData();
        formData.append('problem', this.newDSI.problem);
        formData.append('solution', this.newDSI.solution);
        formData.append('result', this.newDSI.result);
        if (this.newDSI.beforeImageFile) formData.append('before_image', this.newDSI.beforeImageFile);
        if (this.newDSI.afterImageFile) formData.append('after_image', this.newDSI.afterImageFile);

        const res = await axios.post('/api/dsis', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const fixUrl = (url) => url ? url.replace('/api/backend', '/backend') : null;
        const newDsi = {
          id: res.data.dsi.id,
          problem: res.data.dsi.problem || '',
          solution: res.data.dsi.solution || '',
          result: res.data.dsi.result || '',
          beforeImage: fixUrl(res.data.dsi.before_image),
          afterImage: fixUrl(res.data.dsi.after_image),
          date: res.data.dsi.created_at,
          status: res.data.dsi.status || 'Waiting'
        };
        this.dsiList.unshift(newDsi);
        this.newDSI = {
          problem: '', solution: '', result: '',
          beforeImage: null, afterImage: null,
          beforeImageFile: null, afterImageFile: null
        };
        toastSuccess('Improvement added successfully!');
      } catch (error) {
        console.error(error);
        toastError('Failed to add improvement. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    },
    onImageChange(e, type) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'before') {
          this.newDSI.beforeImage = event.target.result;
          this.newDSI.beforeImageFile = file;
        } else {
          this.newDSI.afterImage = event.target.result;
          this.newDSI.afterImageFile = file;
        }
      };
      reader.readAsDataURL(file);
    },
    openImage(img) {
      this.previewImage = img;
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    logout() {
      const token = localStorage.getItem('token');
      axios.post('https://employees.archenterprises.co.in/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).finally(() => {
        localStorage.removeItem('token');
        this.$router.push('/auth');
      });
    }
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

.dsi-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
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

.mobile-view-all-btn {
  background: var(--primary);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-view-all-btn:hover {
  transform: scale(1.05);
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

.view-all-btn-premium {
  padding: 10px 22px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.view-all-btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
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

.stat-card.approved {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}
.stat-card.approved i { color: #065f46; }

.stat-card.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}
.stat-card.pending i { color: #d97706; }

.stat-card i {
  font-size: 28px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
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

.form-toggle {
  transition: transform 0.3s ease;
}

.form-toggle.rotated {
  transform: rotate(180deg);
}

/* Form Card */
.form-card-premium {
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.dsi-form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.dsi-form-grid.form-hidden {
  display: none;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-field label i {
  color: var(--primary-color);
}

.dsi-textarea-premium {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 13px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
}

.dsi-textarea-premium:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Image Upload */
.image-upload-section {
  grid-column: span 3;
}

.image-upload-row-premium {
  display: flex;
  gap: 16px;
}

.image-upload-card-premium {
  flex: 1;
  min-height: 100px;
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  transition: all 0.3s ease;
  overflow: hidden;
}

.image-upload-card-premium.has-image {
  border: 2px solid var(--primary-color);
}

.image-upload-card-premium:hover {
  background: #f3f4f6;
}

.upload-placeholder-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 24px;
  color: #9ca3af;
}

.upload-placeholder-premium span {
  font-size: 12px;
  font-weight: 500;
}

.upload-preview-premium {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  transition: all 0.3s ease;
}

.form-actions.form-hidden {
  display: none;
}

.btn-submit-premium {
  padding: 10px 24px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-submit-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Table Card */
.table-card-premium {
  background: white;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #e5e7eb;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.record-count-mobile {
  background: var(--primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 4px;
}

.table-wrapper-premium {
  overflow-x: auto;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.dsi-card {
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

.card-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
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

.card-date {
  font-size: 11px;
  color: #6b7280;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn-mobile {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn-mobile.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-btn-mobile.delete:active {
  transform: scale(0.9);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-text {
  font-size: 13px;
  color: var(--dark);
  line-height: 1.5;
}

.card-text .truncated {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.card-images {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.card-image-row {
  display: flex;
  gap: 10px;
}

.card-image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.card-image-item:hover {
  transform: scale(1.05);
}

.card-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-item .image-label {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
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

/* Desktop Table */
.dsi-table-premium {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.dsi-table-premium thead {
  background: #f8fafc;
}

.dsi-table-premium th {
  text-align: left;
  padding: 14px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.dsi-table-premium td {
  padding: 14px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  vertical-align: middle;
}

.dsi-row-premium {
  transition: all 0.3s ease;
}

.dsi-row-premium:hover {
  background: #fafbfc;
}

.serial {
  font-weight: 600;
  color: #9ca3af;
  width: 50px;
}

/* Read More Styles */
.text-with-readmore {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 200px;
}

.text-with-readmore .truncated {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.readmore-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  padding: 0;
  width: fit-content;
  transition: all 0.2s ease;
}

.readmore-btn:hover {
  color: #764ba2;
  text-decoration: underline;
}

.problem-cell, .solution-cell, .result-cell {
  max-width: 200px;
  color: #4b5563;
}

.image-cell {
  text-align: center;
  width: 60px;
}

.dsi-thumb-premium {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.dsi-thumb-premium:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.no-image {
  color: #9ca3af;
  font-size: 12px;
}

.date-cell {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.date-cell i {
  margin-right: 6px;
  font-size: 11px;
}

.status-badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
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

.action-cell {
  width: 60px;
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon.delete {
  background: #fee2e2;
  color: var(--danger);
}

.action-icon.delete:hover {
  background: #fecaca;
  transform: translateY(-2px);
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

/* Modal Styles */
.modal-premium {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: modalBackdropIn 0.3s ease;
}

@keyframes modalBackdropIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(10px); }
}

.modal-premium-container {
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 1200px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.modal-premium-container.xlarge { max-width: 1200px; }

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-premium-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 20px;
}

.modal-premium-header h2 {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.modal-close:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.modal-premium-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fafbfc;
}

.modal-premium-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-primary-modern {
  padding: 10px 20px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Modal Mobile Cards */
.modal-mobile-cards {
  display: none;
  flex-direction: column;
  gap: 16px;
}

.dsi-modal-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
}

.modal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-user {
  font-weight: 600;
  color: var(--dark);
  font-size: 14px;
}

.modal-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-card-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
}

.modal-card-label {
  color: #6b7280;
  font-weight: 500;
  min-width: 70px;
}

.modal-card-text {
  color: var(--dark);
  text-align: right;
  word-break: break-word;
}

.modal-card-images {
  margin-top: 8px;
}

.modal-card-image-row {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.modal-card-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  position: relative;
}

.modal-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-card-image span {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 8px;
  padding: 1px 6px;
  border-radius: 3px;
}

/* Image Modal */
.image-modal {
  background: rgba(0, 0, 0, 0.9);
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.image-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.image-close-btn:hover {
  background: #f3f4f6;
  transform: rotate(90deg);
}

/* Responsive */
@media (max-width: 1024px) {
  .dsi-form-grid {
    grid-template-columns: 1fr;
  }
  .image-upload-section {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }
  
  .dsi-board-premium {
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
    font-size: 22px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .stat-label {
    font-size: 10px;
  }
  
  .form-card-premium {
    padding: 16px;
  }
  
  .dsi-form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .image-upload-section {
    grid-column: span 1;
  }
  
  .image-upload-row-premium {
    flex-direction: column;
  }
  
  .image-upload-card-premium {
    min-height: 80px;
  }
  
  .form-actions {
    justify-content: stretch;
  }
  
  .btn-submit-premium {
    width: 100%;
    justify-content: center;
  }
  
  .search-bar-mobile {
    display: block;
  }
  
  .table-container {
    display: none;
  }
  
  .mobile-cards {
    display: flex;
  }
  
  .table-header-premium {
    padding: 12px 16px;
  }
  
  .section-title-modern {
    font-size: 14px;
    cursor: pointer;
  }
  
  .table-info {
    display: none;
  }
  
  .modal-premium-container {
    max-width: 95%;
    border-radius: 24px;
  }
  
  .modal-premium-container.mobile-modal {
    max-height: 90vh;
  }
  
  .modal-premium-header {
    padding: 16px 20px;
  }
  
  .modal-premium-header h2 {
    font-size: 17px;
  }
  
  .modal-premium-body {
    padding: 16px;
  }
  
  .modal-premium-footer {
    padding: 16px 20px;
  }
  
  .modal-premium-footer.mobile-footer .btn-primary-modern {
    width: 100%;
    justify-content: center;
  }
  
  .modal-mobile-cards {
    display: flex;
  }
  
  .table-wrapper-premium {
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }
  
  .dsi-board-premium {
    padding: 12px;
    border-radius: 16px;
  }
  
  .stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .stat-card {
    padding: 10px;
  }
  
  .stat-card i {
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 17px;
  }
  
  .mobile-title {
    font-size: 16px;
  }
  
  .mobile-view-all-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .dsi-card {
    padding: 12px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .card-actions {
    align-self: flex-end;
  }
  
  .card-image-row {
    flex-wrap: wrap;
  }
  
  .card-image-item {
    width: 70px;
    height: 70px;
  }
  
  .modal-card-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .modal-card-text {
    text-align: left;
  }
  
  .dsi-modal-card {
    padding: 12px;
  }
  
  .dsi-textarea-premium {
    font-size: 15px;
  }
  
  .search-input-mobile {
    font-size: 15px;
    padding: 8px 10px 8px 34px;
  }
}

/* Utility Classes */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
}
</style>