<template>
  <div class="layout">
    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Employee Sidebar -->
      <Sidebar ref="sidebarRef" />

      <section class="content">
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-microscope"></i>
            <span>Root Cause Analysis</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-mobile-action" @click="scrollToComposer" title="Post Incident / Issue">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn-mobile-menu" @click="toggleMobileSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Header Banner -->
        <header class="rca-top-banner">
          <div class="banner-left">
            <div class="banner-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>RCA INCIDENT HUB</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas fa-shield-alt"></i> Quality & Reliability
              </span>
              <span class="status-meta-pill" v-if="unreadMentionsCount > 0">
                <i class="fas fa-at"></i> {{ unreadMentionsCount }} Unread Mention{{ unreadMentionsCount > 1 ? 's' : '' }}
              </span>
            </div>
            <h1 class="page-title">Root Cause Analysis</h1>
            <p class="page-subtitle">
              Document incident post-mortems, analyze system failures, discuss technical issues, and resolve root causes collaboratively.
            </p>
          </div>

          <!-- Banner Actions -->
          <div class="banner-controls">
            <button class="btn-secondary" @click="manualRefresh" :disabled="isRefreshing" title="Refresh Feed">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
              <span>Refresh</span>
            </button>
            <button class="btn-primary" @click="scrollToComposer">
              <i class="fas fa-plus-circle"></i>
              <span>Report Issue</span>
            </button>
          </div>
        </header>

        <!-- 📊 KPI Metrics Strip -->
        <div class="metrics-strip">
          <div class="metric-card" :class="{ active: activeFilter === 'all' }" @click="setFilter('all')">
            <div class="metric-icon total">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="metric-info">
              <span class="metric-num">{{ totalIssuesCount }}</span>
              <span class="metric-label">Total Incidents</span>
            </div>
          </div>

          <div class="metric-card" :class="{ active: activeFilter === 'needs_help' }" @click="setFilter('needs_help')">
            <div class="metric-icon pending">
              <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="metric-info">
              <span class="metric-num">{{ needsHelpCount }}</span>
              <span class="metric-label">Needs Discussion</span>
            </div>
          </div>

          <div class="metric-card" :class="{ active: activeFilter === 'discussed' }" @click="setFilter('discussed')">
            <div class="metric-icon resolved">
              <i class="fas fa-comments"></i>
            </div>
            <div class="metric-info">
              <span class="metric-num">{{ discussedCount }}</span>
              <span class="metric-label">In Discussion</span>
            </div>
          </div>

          <div class="metric-card" :class="{ active: activeFilter === 'my_issues' }" @click="setFilter('my_issues')">
            <div class="metric-icon author">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="metric-info">
              <span class="metric-num">{{ myIssuesCount }}</span>
              <span class="metric-label">My Reports</span>
            </div>
          </div>
        </div>

        <!-- 🔍 Search & Filter Toolbar -->
        <div class="rca-toolbar">
          <div class="rca-search-wrapper">
            <i class="fas fa-search rca-search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search incidents, authors, keywords..."
              class="rca-search-input"
            />
            <button v-if="searchQuery" class="rca-clear-search-btn" @click="searchQuery = ''" title="Clear search">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="rca-pills-group">
            <button
              class="rca-pill-btn"
              :class="{ 'is-active': activeFilter === 'all' }"
              @click="setFilter('all')"
            >
              <span>All Incidents</span>
              <span class="rca-pill-badge">{{ totalIssuesCount }}</span>
            </button>

            <button
              class="rca-pill-btn"
              :class="{ 'is-active': activeFilter === 'needs_help' }"
              @click="setFilter('needs_help')"
            >
              <span class="status-dot dot-amber"></span>
              <span>Needs Discussion</span>
              <span class="rca-pill-badge">{{ needsHelpCount }}</span>
            </button>

            <button
              class="rca-pill-btn"
              :class="{ 'is-active': activeFilter === 'discussed' }"
              @click="setFilter('discussed')"
            >
              <span class="status-dot dot-blue"></span>
              <span>Active Discussions</span>
              <span class="rca-pill-badge">{{ discussedCount }}</span>
            </button>

            <button
              class="rca-pill-btn"
              :class="{ 'is-active': activeFilter === 'my_issues' }"
              @click="setFilter('my_issues')"
            >
              <span class="status-dot dot-purple"></span>
              <span>My Reports</span>
              <span class="rca-pill-badge">{{ myIssuesCount }}</span>
            </button>
          </div>
        </div>

        <!-- ✍️ Issue / RCA Composer Box -->
        <div class="composer-card" ref="composerRef">
          <div class="composer-top">
            <div class="user-avatar-wrap">
              <div class="composer-avatar" :style="{ backgroundColor: getAvatarColor(authUser.id) }">
                {{ getUserInitials(authUser.handle) }}
              </div>
            </div>
            <div class="composer-main">
              <div class="composer-heading">
                <h3>Report Incident or Technical Problem</h3>
                <span class="composer-tip">
                  <i class="fas fa-info-circle"></i> Type <kbd>@</kbd> to mention and notify a colleague
                </span>
              </div>

              <textarea
                v-model="newQuestion"
                placeholder="Describe the failure, unexpected behavior, symptoms, or root cause hypothesis..."
                rows="3"
                @input="onMentionInput($event, 'question')"
                @keydown="onMentionKeydown"
                class="composer-textarea"
              ></textarea>

              <!-- Image Attachment Live Preview -->
              <div v-if="questionImagePreview" class="attachment-preview-box">
                <div class="preview-thumb-wrap">
                  <img :src="questionImagePreview" alt="Attachment Preview" class="preview-thumb" />
                  <button class="btn-remove-attachment" @click="removeQuestionImage" title="Remove attachment">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="preview-file-meta">
                  <span class="preview-filename">{{ questionImage?.name || 'Attached Image' }}</span>
                  <span class="preview-filesize" v-if="questionImage?.size">
                    {{ (questionImage.size / 1024).toFixed(1) }} KB
                  </span>
                </div>
              </div>

              <!-- Error Banner -->
              <div v-if="questionError" class="composer-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ questionError }}</span>
              </div>

              <!-- Composer Actions Toolbar -->
              <div class="composer-toolbar">
                <div class="toolbar-left">
                  <label class="btn-toolbar-attach" title="Attach screenshot or error log image">
                    <i class="fas fa-image"></i>
                    <span>Attach Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref="questionImageInput"
                      @change="handleQuestionImage"
                      hidden
                    />
                  </label>
                  <span class="composer-author-pill">
                    Posting as <strong>@{{ authUser.handle || 'User' }}</strong>
                  </span>
                </div>

                <div class="toolbar-right">
                  <button
                    class="btn-submit-issue"
                    @click="addQuestion"
                    :disabled="isSubmitting || (!newQuestion.trim() && !questionImage)"
                  >
                    <i class="fas fa-paper-plane" :class="{ 'fa-spin': isSubmitting }"></i>
                    <span>{{ isSubmitting ? 'Posting...' : 'Post Incident' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 📋 Incident Feed -->
        <div class="incidents-feed">
          <!-- Feed Header with Count -->
          <div class="feed-header-row">
            <div class="feed-title-wrap">
              <h2 class="feed-title">Incident Discussions</h2>
              <span class="feed-badge">{{ filteredQuestions.length }} record{{ filteredQuestions.length !== 1 ? 's' : '' }}</span>
            </div>
            <div class="feed-view-info">
              <span v-if="searchQuery">Filtering by: "<em>{{ searchQuery }}</em>"</span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredQuestions.length === 0" class="rca-empty-state">
            <div class="empty-icon-wrap">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <h3>No Incidents Found</h3>
            <p v-if="searchQuery">
              No reports match your search query "{{ searchQuery }}". Try clearing the filter.
            </p>
            <p v-else-if="activeFilter !== 'all'">
              No incidents found under this filter category.
            </p>
            <p v-else>
              No root cause issues have been logged yet. Be the first to start a technical discussion!
            </p>
            <button class="btn-empty-reset" @click="resetFilters" v-if="searchQuery || activeFilter !== 'all'">
              <i class="fas fa-undo"></i> Reset Filters
            </button>
          </div>

          <!-- Cards List -->
          <div
            v-for="q in filteredQuestions"
            :key="q.id"
            class="incident-card"
            :class="{ 'card-expanded': q.showAnswers }"
          >
            <!-- Card Header -->
            <div class="incident-card-header">
              <div class="author-info-group">
                <div class="author-avatar" :style="{ backgroundColor: getAvatarColor(q.user_id) }">
                  {{ getHandleInitial(q.user?.handle || q.creator_handle || q.user?.name || q.creator_name) }}
                </div>
                <div class="author-meta">
                  <div class="author-name-row">
                    <span class="author-name">{{ formatHandle(q.user?.handle || q.creator_handle || q.user?.name || q.creator_name) }}</span>
                    <span class="role-badge" v-if="q.user?.role || q.user_id === authUser.id">
                      {{ q.user_id === authUser.id ? 'You' : (q.user?.role || 'Staff') }}
                    </span>
                    <span class="incident-id-tag">#RCA-{{ q.id }}</span>
                  </div>
                  <div class="incident-timestamp">
                    <i class="far fa-clock"></i>
                    <span>{{ formatTimeAgo(q.created_at) }}</span>
                    <span class="bullet-sep">•</span>
                    <span>{{ formatDateTime(q.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Top Right Status & Actions -->
              <div class="card-status-actions">
                <span class="status-indicator-tag" :class="q.answers.length > 0 ? 'status-active' : 'status-needs-help'">
                  <i :class="q.answers.length > 0 ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
                  <span>{{ q.answers.length > 0 ? `${q.answers.length} Repl${q.answers.length === 1 ? 'y' : 'ies'}` : 'Needs Reply' }}</span>
                </span>

                <div class="card-action-menu">
                  <button
                    v-if="canModify(q) && q.answers.length === 0"
                    class="action-icon-btn edit"
                    @click="editQuestion(q)"
                    title="Edit Incident"
                  >
                    <i class="fas fa-pen"></i>
                  </button>
                  <button
                    v-if="canModify(q) && q.answers.length === 0"
                    class="action-icon-btn delete"
                    @click="deleteQuestion(q)"
                    title="Delete Incident"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                  <button
                    class="btn-toggle-answers"
                    @click="toggleAnswers(q)"
                    :title="q.showAnswers ? 'Collapse Discussion' : 'Expand Discussion'"
                  >
                    <i :class="q.showAnswers ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    <span>{{ q.showAnswers ? 'Hide Replies' : (q.answers.length > 0 ? `View ${q.answers.length} Repl${q.answers.length === 1 ? 'y' : 'ies'}` : 'Reply') }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card Body / Question Content -->
            <div class="incident-card-body">
              <!-- Regular View -->
              <div v-if="!q.isEditing" class="content-view">
                <div class="incident-text" v-html="highlightMentions(q.question)"></div>
                
                <!-- Attached Screenshot / Image -->
                <div v-if="cleanImageUrl(q.image_url)" class="incident-attachment-wrap" @click="openImage(cleanImageUrl(q.image_url))">
                  <div class="image-box">
                    <img :src="cleanImageUrl(q.image_url)" alt="Incident Attachment" loading="lazy" />
                    <div class="image-overlay-mask">
                      <i class="fas fa-search-plus"></i>
                      <span>View Full Image</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Inline Editing View -->
              <div v-else class="content-edit">
                <textarea v-model="q.editText" class="edit-textarea" rows="3"></textarea>
                <div class="edit-actions-bar">
                  <button class="btn-save-edit" @click="updateQuestion(q)">
                    <i class="fas fa-check"></i> Save Changes
                  </button>
                  <button class="btn-cancel-edit" @click="cancelEditQuestion(q)">
                    <i class="fas fa-times"></i> Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- 💬 Answers / Discussion Section -->
            <transition name="accordion">
              <div v-show="q.showAnswers" class="discussion-section">
                <div class="discussion-divider">
                  <span class="divider-text">
                    <i class="fas fa-comments"></i> Technical Discussion & Solutions
                  </span>
                </div>

                <!-- Replies Timeline -->
                <div class="replies-timeline" v-if="q.answers.length > 0">
                  <div
                    class="reply-item"
                    v-for="a in [...q.answers].reverse()"
                    :key="a.id"
                  >
                    <div class="reply-avatar-col">
                      <div class="reply-avatar" :style="{ backgroundColor: getAvatarColor(a.user_id) }">
                        {{ getHandleInitial(a.user?.handle || a.creator_handle || a.user?.name || a.creator_name) }}
                      </div>
                      <div class="timeline-stem"></div>
                    </div>

                    <div class="reply-card">
                      <div class="reply-card-header">
                        <div class="reply-author-meta">
                          <span class="reply-author-name">
                            {{ formatHandle(a.user?.handle || a.creator_handle || a.user?.name || a.creator_name) }}
                          </span>
                          <span class="author-tag" v-if="a.user_id === q.user_id">Author</span>
                          <span class="reply-timestamp">
                            <i class="far fa-clock"></i> {{ formatTimeAgo(a.created_at) }}
                          </span>
                        </div>

                        <div class="reply-actions" v-if="canModify(a)">
                          <button class="reply-action-btn" @click="editAnswer(a)" title="Edit response">
                            <i class="fas fa-pen"></i>
                          </button>
                          <button class="reply-action-btn delete" @click="deleteAnswer(a, q)" title="Delete response">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>

                      <div class="reply-content" v-if="!a.isEditing">
                        <div class="reply-text" v-html="highlightMentions(a.answer)"></div>
                        <div v-if="cleanImageUrl(a.image_url)" class="reply-attachment" @click="openImage(cleanImageUrl(a.image_url))">
                          <img :src="cleanImageUrl(a.image_url)" alt="Reply attachment" loading="lazy" />
                          <div class="reply-image-overlay">
                            <i class="fas fa-search-plus"></i>
                          </div>
                        </div>
                      </div>

                      <div class="reply-content-edit" v-else>
                        <textarea v-model="a.editText" class="edit-textarea small" rows="2"></textarea>
                        <div class="edit-actions-bar inline">
                          <button class="btn-save-edit small" @click="updateAnswer(a)">
                            <i class="fas fa-check"></i> Save
                          </button>
                          <button class="btn-cancel-edit small" @click="cancelEditAnswer(a)">
                            <i class="fas fa-times"></i> Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty discussion notice if 0 answers -->
                <div v-else class="no-replies-notice">
                  <i class="fas fa-comment-dots"></i>
                  <span>No replies yet. Contribute an analysis, fix, or follow-up question below.</span>
                </div>

                <!-- Inline Reply Composer -->
                <div class="reply-composer-wrap">
                  <div class="reply-avatar-col">
                    <div class="reply-avatar current-user" :style="{ backgroundColor: getAvatarColor(authUser.id) }">
                      {{ getUserInitials(authUser.handle) }}
                    </div>
                  </div>

                  <div class="reply-input-box">
                    <!-- Reply Image Thumbnail Preview -->
                    <div v-if="q.replyImagePreview" class="reply-thumb-preview">
                      <img :src="q.replyImagePreview" alt="Reply preview" />
                      <button class="btn-remove-reply-image" @click="removeAnswerImage(q)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>

                    <div class="reply-input-row">
                      <input
                        type="text"
                        v-model="q.replyText"
                        placeholder="Contribute your analysis, observation, or solution... (type @ to tag)"
                        @input="onMentionInput($event, q)"
                        @keydown="onMentionKeydown"
                        class="reply-text-input"
                      />
                      <label class="btn-reply-attach" title="Attach screenshot or image">
                        <i class="fas fa-paperclip"></i>
                        <input
                          type="file"
                          accept="image/*"
                          @change="handleAnswerImage($event, q)"
                          hidden
                        />
                      </label>
                      <button
                        class="btn-send-reply"
                        @click="addAnswer(q)"
                        :disabled="!q.replyText?.trim() && !q.replyImage"
                        title="Send Reply"
                      >
                        <i class="fas fa-paper-plane"></i>
                        <span>Reply</span>
                      </button>
                    </div>

                    <p v-if="answerError[q.id]" class="reply-error-msg">
                      <i class="fas fa-exclamation-circle"></i> {{ answerError[q.id] }}
                    </p>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- 🏷️ Mention Suggestions Floating Dropdown -->
        <div
          v-if="showMentionBox"
          class="mention-floating-dropdown"
          :style="{ top: mentionPosition.top + 'px', left: mentionPosition.left + 'px' }"
        >
          <div class="mention-dropdown-header">
            <i class="fas fa-at"></i>
            <span>Mention Team Member</span>
          </div>
          <div class="mention-options-list">
            <div
              v-for="(user, index) in mentionUsers"
              :key="user.id"
              class="mention-item-option"
              :class="{ 'is-selected': index === selectedMentionIndex }"
              @mousedown.prevent="selectMention(user)"
              @click.prevent="selectMention(user)"
            >
              <div class="mention-avatar-dot" :style="{ backgroundColor: getAvatarColor(user.id) }">
                {{ getHandleInitial(user.handle || user.name) }}
              </div>
              <div class="mention-info">
                <span class="mention-name">{{ formatHandle(user.handle || user.name) }}</span>
                <span class="mention-role" v-if="user.role">{{ user.role }}</span>
              </div>
            </div>
            <div v-if="mentionUsers.length === 0" class="mention-no-results">
              <i class="fas fa-user-slash"></i>
              <span>No team members found</span>
            </div>
          </div>
        </div>

        <!-- 🖼️ Image Lightbox Modal -->
        <transition name="fade">
          <div v-if="showImageModal" class="image-lightbox-modal" @click="closeImage">
            <div class="lightbox-dialog" @click.stop>
              <button class="lightbox-close-btn" @click="closeImage" title="Close Preview (Esc)">
                <i class="fas fa-times"></i>
              </button>
              <img :src="previewImage" class="lightbox-img" alt="Incident Screenshot Full View" />
              <div class="lightbox-footer">
                <a :src="previewImage" :href="previewImage" target="_blank" download class="btn-download-img">
                  <i class="fas fa-download"></i> Open Original
                </a>
              </div>
            </div>
          </div>
        </transition>
      </section>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from 'axios'

export default {
  name: 'Help',

  components: { Sidebar },

  data() {
    return {
      autoRefreshTimer: null,
      showImageModal: false,
      previewImage: null,
      questionError: '',
      answerError: {},
      authUser: {
        id: null,
        role: null,
        handle: null
      },
      latestMentionMessage: '',
      unreadMentionsCount: 0,
      notifications: [],
      selectedMentionIndex: 0,
      questions: [],
      newQuestion: '',
      questionImage: null,
      questionImagePreview: null,
      isSubmitting: false,
      isRefreshing: false,
      isMobile: false,
      showMentionBox: false,
      mentionUsers: [],
      mentionQuery: '',
      mentionTarget: null,
      currentMentionInput: null,
      currentCursorPos: null,
      mentionPosition: { top: 0, left: 0 },
      searchQuery: '',
      activeFilter: 'all' // 'all', 'needs_help', 'discussed', 'my_issues'
    }
  },

  computed: {
    totalIssuesCount() {
      return (this.questions || []).length
    },
    needsHelpCount() {
      return (this.questions || []).filter(item => (item.answers || []).length === 0).length
    },
    discussedCount() {
      return (this.questions || []).filter(item => (item.answers || []).length > 0).length
    },
    myIssuesCount() {
      return (this.questions || []).filter(item => item.user_id === this.authUser.id).length
    },
    filteredQuestions() {
      let list = this.questions || []

      // Text search
      const q = (this.searchQuery || '').trim().toLowerCase()
      if (q) {
        list = list.filter(item => {
          const questionMatch = (item.question || '').toLowerCase().includes(q)
          const authorMatch = (item.user?.handle || item.creator_handle || '').toLowerCase().includes(q)
          const answerMatch = (item.answers || []).some(a =>
            (a.answer || '').toLowerCase().includes(q) ||
            (a.user?.handle || a.creator_handle || '').toLowerCase().includes(q)
          )
          const idMatch = `#rca-${item.id}`.includes(q) || `${item.id}` === q
          return questionMatch || authorMatch || answerMatch || idMatch
        })
      }

      // Filter category
      if (this.activeFilter === 'needs_help') {
        list = list.filter(item => (item.answers || []).length === 0)
      } else if (this.activeFilter === 'discussed') {
        list = list.filter(item => (item.answers || []).length > 0)
      } else if (this.activeFilter === 'my_issues') {
        list = list.filter(item => item.user_id === this.authUser.id)
      }

      return list
    }
  },

  mounted() {
    this.fetchAuthUser()
    this.fetchQuestions()
    this.fetchUnreadMentions()
    this.fetchNotifications()

    this.autoRefreshTimer = setInterval(() => {
      this.fetchQuestions(true)
    }, 10000)

    document.addEventListener('keydown', this.handleGlobalKeydown)
    document.addEventListener('click', this.closeMentionBox)

    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
  },

  beforeUnmount() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer)
    }
    document.removeEventListener('keydown', this.handleGlobalKeydown)
    document.removeEventListener('click', this.closeMentionBox)
    window.removeEventListener('resize', this.checkIfMobile)

    if (this.questionImagePreview) {
      URL.revokeObjectURL(this.questionImagePreview)
    }
  },

  methods: {
    handleGlobalKeydown(e) {
      if (e.key === 'Escape') {
        if (this.showImageModal) this.closeImage()
        if (this.showMentionBox) this.showMentionBox = false
      }
    },

    scrollToComposer() {
      if (this.$refs.composerRef) {
        this.$refs.composerRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const textarea = this.$refs.composerRef.querySelector('textarea')
        if (textarea) textarea.focus()
      }
    },

    setFilter(filter) {
      this.activeFilter = filter
    },

    resetFilters() {
      this.searchQuery = ''
      this.activeFilter = 'all'
    },

    fetchAuthUser() {
      axios.get('/api/user')
        .then(res => {
          this.authUser.id = res.data.id
          this.authUser.role = res.data.role
          this.authUser.handle = res.data.handle
        })
        .catch(err => console.error('Failed to fetch auth user', err))
    },

    fetchUnreadMentions() {
      axios.get('/api/mentions/unread-count')
        .then(res => {
          this.unreadMentionsCount = res.data.count || 0
        })
        .catch(err => console.error('Failed to fetch unread mentions', err))
    },

    async fetchNotifications() {
      try {
        const res = await axios.get('/api/notifications').catch(() => ({ data: [] }))
        this.notifications = Array.isArray(res?.data) ? res.data : []
        if (this.notifications.length) {
          const first = this.notifications[0]
          let data = {}
          try {
            data = typeof first?.data === 'string' ? JSON.parse(first.data || '{}') : (first?.data || {})
          } catch (e) {
            data = {}
          }
          this.latestMentionMessage = data.message ?? ''
        }
      } catch (err) {
        // Soft fail
      }
    },

    manualRefresh() {
      this.isRefreshing = true
      this.fetchQuestions(false).finally(() => {
        setTimeout(() => {
          this.isRefreshing = false
        }, 500)
      })
      this.fetchUnreadMentions()
    },

    fetchQuestions(silent = false) {
      return axios.get('/api/qa')
        .then(res => {
          const currentQuestions = this.questions || []
          const list = Array.isArray(res.data) ? res.data : []
          this.questions = list.map((q, index) => {
            const oldQ = currentQuestions.find(x => x.id === q.id)
            const qHandle = this.formatHandle(q.creator_handle || q.user?.handle || q.creator_name || q.user?.name)
            return {
              ...q,
              creator_handle: qHandle,
              showAnswers: oldQ?.showAnswers ?? (index === 0),
              isEditing: oldQ?.isEditing ?? false,
              editText: oldQ?.editText ?? q.question,
              replyText: oldQ?.replyText ?? '',
              replyImage: oldQ?.replyImage ?? null,
              replyImagePreview: oldQ?.replyImagePreview ?? null,
              answers: (Array.isArray(q.answers) ? q.answers : []).map(a => {
                const oldA = oldQ?.answers?.find(x => x.id === a.id)
                const aHandle = this.formatHandle(a.creator_handle || a.user?.handle || a.creator_name || a.user?.name)
                return {
                  ...a,
                  creator_handle: aHandle,
                  isEditing: oldA?.isEditing ?? false,
                  editText: oldA?.editText ?? a.answer
                }
              })
            }
          })
        })
        .catch(err => {
          if (!silent) console.error('Error fetching questions', err)
        })
    },

    getAvatarColor(id) {
      const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']
      if (!id) return colors[0]
      return colors[Math.abs(id) % colors.length]
    },

    getUserInitials(handle) {
      if (!handle) return 'U'
      return handle.slice(0, 2).toUpperCase()
    },

    formatTimeAgo(date) {
      if (!date) return ''
      const now = new Date()
      const past = new Date(date)
      const diffMs = now - past
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return past.toLocaleDateString()
    },

    formatDateTime(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    openImage(src) {
      this.previewImage = src
      this.showImageModal = true
      document.body.style.overflow = 'hidden'
    },

    closeImage() {
      this.showImageModal = false
      this.previewImage = null
      document.body.style.overflow = ''
    },

    canModify(item) {
      return item.user_id === this.authUser.id || this.authUser.role === 'admin'
    },

    editQuestion(q) {
      q.isEditing = true
      q.editText = q.question
    },

    cancelEditQuestion(q) {
      q.isEditing = false
    },

    updateQuestion(q) {
      if (!q.editText?.trim()) return
      axios.put(`/api/qa/question/${q.id}`, {
        question: q.editText
      }).then(() => {
        q.question = q.editText
        q.isEditing = false
      }).catch(err => {
        console.error('Failed to update question', err)
      })
    },

    deleteQuestion(q) {
      if (!confirm('Are you sure you want to delete this incident report?')) return
      axios.delete(`/api/qa/question/${q.id}`)
        .then(() => {
          this.questions = this.questions.filter(x => x.id !== q.id)
        })
        .catch(err => {
          console.error('Failed to delete question', err)
        })
    },

    editAnswer(a) {
      a.isEditing = true
      a.editText = a.answer
    },

    cancelEditAnswer(a) {
      a.isEditing = false
    },

    updateAnswer(a) {
      if (!a.editText?.trim()) return
      axios.put(`/api/qa/answer/${a.id}`, {
        answer: a.editText
      }).then(() => {
        a.answer = a.editText
        a.isEditing = false
      }).catch(err => {
        console.error('Failed to update answer', err)
      })
    },

    deleteAnswer(a, q) {
      if (!confirm('Delete this response?')) return
      axios.delete(`/api/qa/answer/${a.id}`)
        .then(() => {
          q.answers = q.answers.filter(x => x.id !== a.id)
        })
        .catch(err => {
          console.error('Failed to delete answer', err)
        })
    },

    capitalizeHandle(handle) {
      if (!handle) return ''
      return handle.charAt(0).toUpperCase() + handle.slice(1)
    },

    cleanHandle(val) {
      if (!val) return 'user'
      const clean = String(val).trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_]/g, '')
      return clean || 'user'
    },

    formatHandle(val) {
      if (!val) return '@user'
      return `@${this.cleanHandle(val)}`
    },

    getHandleInitial(val) {
      const clean = this.cleanHandle(val)
      return (clean[0] || 'U').toUpperCase()
    },

    cleanImageUrl(url) {
      if (!url) return null
      if (url.includes('/backend/public/storage/')) {
        return url
      }
      if (url.includes('/storage/')) {
        return url.replace('/storage/', '/backend/public/storage/')
      }
      return `https://employees.archenterprises.co.in/backend/public/storage/${url.replace(/^\/?/, '')}`
    },

    handleQuestionImage(e) {
      const file = e.target.files?.[0]
      if (file) {
        this.questionImage = file
        this.questionImagePreview = URL.createObjectURL(file)
      }
    },

    removeQuestionImage() {
      this.questionImage = null
      if (this.questionImagePreview) {
        URL.revokeObjectURL(this.questionImagePreview)
        this.questionImagePreview = null
      }
      if (this.$refs.questionImageInput) {
        this.$refs.questionImageInput.value = ''
      }
    },

    addQuestion() {
      this.questionError = ''
      const hasText = !!this.newQuestion?.trim()
      const hasImage = !!this.questionImage

      if (!hasText && !hasImage) {
        this.questionError = 'Please enter an incident description or attach an image'
        return
      }

      this.isSubmitting = true
      const formData = new FormData()
      formData.append('question', this.newQuestion ? this.newQuestion.trim() : '')
      if (hasImage) {
        formData.append('image', this.questionImage)
      }

      axios.post('/api/qa/question', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(() => {
          this.newQuestion = ''
          this.removeQuestionImage()
          this.questionError = ''
          this.fetchQuestions()
        })
        .catch(err => {
          console.error('Question submit failed', err)
          const msg = err.response?.data?.message ||
            (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Failed to submit incident. Please try again.')
          this.questionError = msg
        })
        .finally(() => {
          this.isSubmitting = false
        })
    },

    handleAnswerImage(e, question) {
      const file = e.target.files?.[0]
      if (file) {
        question.replyImage = file
        question.replyImagePreview = URL.createObjectURL(file)
      }
    },

    removeAnswerImage(question) {
      question.replyImage = null
      if (question.replyImagePreview) {
        URL.revokeObjectURL(question.replyImagePreview)
        question.replyImagePreview = null
      }
    },

    addAnswer(question) {
      this.answerError[question.id] = ''
      const hasText = !!question.replyText?.trim()
      const hasImage = !!question.replyImage

      if (!hasText && !hasImage) {
        this.answerError[question.id] = 'Please enter text or attach an image'
        return
      }

      const formData = new FormData()
      formData.append('question_id', question.id)
      formData.append('answer', question.replyText ? question.replyText.trim() : '')
      if (hasImage) {
        formData.append('image', question.replyImage)
      }

      axios.post('/api/qa/answer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(() => {
          question.replyText = ''
          this.removeAnswerImage(question)
          this.answerError[question.id] = ''
          this.fetchQuestions()
        })
        .catch(err => {
          console.error('Answer submit failed', err)
          const msg = err.response?.data?.message ||
            (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Failed to post reply. Please retry.')
          this.answerError[question.id] = msg
        })
    },

    toggleAnswers(question) {
      question.showAnswers = !question.showAnswers
    },

    // Mention system
    onMentionKeydown(e) {
      if (!this.showMentionBox || !this.mentionUsers.length) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.selectedMentionIndex = (this.selectedMentionIndex + 1) % this.mentionUsers.length
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.selectedMentionIndex = (this.selectedMentionIndex - 1 + this.mentionUsers.length) % this.mentionUsers.length
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        this.currentMentionInput = e.target
        this.currentCursorPos = e.target.selectionStart
        if (this.mentionUsers[this.selectedMentionIndex]) {
          this.selectMention(this.mentionUsers[this.selectedMentionIndex])
        }
      }
    },

    onMentionInput(e, target) {
      const input = e.target
      this.currentMentionInput = input
      this.currentCursorPos = input.selectionStart
      const text = input.value || ''
      const cursorPos = input.selectionStart
      const beforeCursor = text.slice(0, cursorPos)
      const match = beforeCursor.match(/@([A-Za-z0-9_]*)$/)

      if (!match) {
        this.showMentionBox = false
        return
      }

      const query = match[1].trim()
      this.mentionQuery = query
      this.mentionTarget = target
      this.selectedMentionIndex = 0
      this.setMentionPosition(input)

      axios.get('/api/qa/mention-users', { params: { q: query || '' } })
        .then(res => {
          this.mentionUsers = res.data || []
          this.showMentionBox = this.mentionUsers.length > 0
        })
        .catch(() => {
          this.showMentionBox = false
        })
    },

    closeMentionBox(e) {
      if (!e.target.closest('.mention-floating-dropdown')) {
        this.showMentionBox = false
      }
    },

    highlightMentions(text) {
      if (!text) return ''
      const cleaned = text.replace(/@@+/g, '@')
      return cleaned.replace(
        /@([A-Za-z0-9_]+)/g,
        '<span class="mention-tag-pill">@$1</span>'
      )
    },

    selectMention(user) {
      if (!user) return
      const isQuestion = this.mentionTarget === 'question'
      const text = (isQuestion ? this.newQuestion : this.mentionTarget?.replyText) || ''
      const inputEl = this.currentMentionInput || document.activeElement
      let cursorPos = (inputEl && typeof inputEl.selectionStart === 'number')
        ? inputEl.selectionStart
        : (typeof this.currentCursorPos === 'number' ? this.currentCursorPos : text.length)

      if (typeof cursorPos !== 'number' || isNaN(cursorPos) || cursorPos > text.length || cursorPos < 0) {
        cursorPos = text.length
      }

      const before = text.slice(0, cursorPos)
      const after = text.slice(cursorPos)
      const clean = this.cleanHandle(user.handle || user.name)
      const insertText = `@${clean} `
      const newBefore = before.replace(/@+([A-Za-z0-9_]*)$/, insertText)
      const finalText = newBefore + after.replace(/^\s/, '')

      if (isQuestion) {
        this.newQuestion = finalText
      } else if (this.mentionTarget) {
        this.mentionTarget.replyText = finalText
      }
      this.showMentionBox = false
      this.selectedMentionIndex = 0

      this.$nextTick(() => {
        if (inputEl && typeof inputEl.focus === 'function') {
          inputEl.focus()
          const newPos = newBefore.length
          if (typeof inputEl.setSelectionRange === 'function') {
            inputEl.setSelectionRange(newPos, newPos)
          }
        }
      })
    },

    setMentionPosition(input) {
      const rect = input.getBoundingClientRect()
      this.mentionPosition = {
        top: rect.bottom + window.scrollY + 6,
        left: Math.max(16, rect.left + window.scrollX)
      }
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 992
    },

    toggleMobileSidebar() {
      if (this.$refs.sidebarRef && typeof this.$refs.sidebarRef.toggleMobileMenu === 'function') {
        this.$refs.sidebarRef.toggleMobileMenu()
      } else {
        window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'))
      }
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Layout & Stationary Sidebar Flow */
.layout {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

.main-content {
  display: flex;
  padding: 20px 28px;
  gap: 28px;
  min-height: calc(100vh - 78px);
  position: relative;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 📱 Mobile Top Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.mobile-title i {
  color: #4f46e5;
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-mobile-action,
.btn-mobile-menu {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-mobile-action {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
}

.btn-mobile-action:active,
.btn-mobile-menu:active {
  transform: scale(0.95);
}

/* 🏢 Modern Enterprise Header Banner */
.rca-top-banner {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.banner-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.portal-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #c7d2fe;
}

.pulse-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.status-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
}

.status-meta-pill i {
  color: #4f46e5;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  max-width: 700px;
}

.banner-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #334155;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #4f46e5;
  border: 1px solid #4338ca;
  border-radius: 10px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2);
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(79, 70, 229, 0.3);
}

/* 📊 KPI Metrics Strip */
.metrics-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.metric-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.metric-card.active {
  border-color: #4f46e5;
  background: #fbfbfe;
  box-shadow: 0 0 0 1px #4f46e5, 0 4px 12px rgba(79, 70, 229, 0.08);
}

.metric-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.metric-icon.total { background: #eef2ff; color: #4f46e5; }
.metric-icon.pending { background: #fffbeb; color: #d97706; }
.metric-icon.resolved { background: #eff6ff; color: #2563eb; }
.metric-icon.author { background: #f5f3ff; color: #7c3aed; }

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-num {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  font-feature-settings: 'tnum';
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-top: 3px;
}

/* 🔍 Search & Filter Toolbar */
.rca-toolbar {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.rca-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 320px;
  max-width: 100%;
  flex-shrink: 0;
}

.rca-search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 13.5px;
  pointer-events: none;
}

.rca-search-input {
  box-sizing: border-box !important;
  width: 100%;
  height: 38px;
  padding: 0 34px 0 38px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13.5px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.rca-search-input:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.rca-clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: color 0.15s;
}

.rca-clear-search-btn:hover {
  color: #0f172a;
}

.rca-pills-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.rca-pill-btn {
  box-sizing: border-box !important;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 13px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  user-select: none;
}

.rca-pill-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.rca-pill-btn.is-active {
  background: #4f46e5;
  border-color: #4338ca;
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);
}

.rca-pill-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
}

.rca-pill-btn.is-active .rca-pill-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.dot-amber { background: #f59e0b; }
.status-dot.dot-blue { background: #3b82f6; }
.status-dot.dot-purple { background: #8b5cf6; }

/* ✍️ Enterprise Issue Composer */
.composer-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: border-color 0.2s ease;
}

.composer-card:focus-within {
  border-color: #cbd5e1;
}

.composer-top {
  display: flex;
  gap: 16px;
}

.user-avatar-wrap {
  flex-shrink: 0;
}

.composer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.composer-main {
  flex: 1;
  min-width: 0;
}

.composer-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.composer-heading h3 {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.composer-tip {
  font-size: 12px;
  color: #64748b;
}

.composer-tip kbd {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: inherit;
  font-weight: 600;
  color: #334155;
}

.composer-textarea {
  width: 100%;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  color: #0f172a;
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: all 0.2s ease;
  line-height: 1.5;
}

.composer-textarea:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

/* Image Attachment Live Preview */
.attachment-preview-box {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  margin-top: 12px;
}

.preview-thumb-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  flex-shrink: 0;
}

.preview-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-attachment {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.75);
  color: #ffffff;
  border: none;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-remove-attachment:hover {
  background: #ef4444;
}

.preview-file-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.preview-filename {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-filesize {
  font-size: 11.5px;
  color: #64748b;
}

.composer-error {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 13px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.btn-toolbar-attach {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toolbar-attach:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-toolbar-attach i {
  color: #4f46e5;
}

.composer-author-pill {
  font-size: 12.5px;
  color: #64748b;
}

.composer-author-pill strong {
  color: #334155;
}

.btn-submit-issue {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  background: #4f46e5;
  border: 1px solid #4338ca;
  border-radius: 10px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2);
}

.btn-submit-issue:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(79, 70, 229, 0.3);
}

.btn-submit-issue:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

/* 📋 Incident Feed */
.incidents-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feed-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 2px;
}

.feed-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feed-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.feed-badge {
  font-size: 11.5px;
  font-weight: 700;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 9999px;
}

.feed-view-info {
  font-size: 13px;
  color: #64748b;
}

/* Empty State */
.rca-empty-state {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.rca-empty-state h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.rca-empty-state p {
  font-size: 14px;
  color: #64748b;
  max-width: 440px;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.btn-empty-reset {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-empty-reset:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* 🏷️ Incident Card */
.incident-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.incident-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.incident-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.author-info-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.author-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.author-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.author-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.role-badge {
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 7px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.incident-id-tag {
  font-size: 11.5px;
  font-family: monospace;
  font-weight: 600;
  color: #94a3b8;
  background: #f8fafc;
  padding: 2px 6px;
  border-radius: 4px;
}

.incident-timestamp {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.bullet-sep {
  color: #cbd5e1;
}

.card-status-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
}

.status-indicator-tag.status-active {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.status-indicator-tag.status-needs-help {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.card-action-menu {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.action-icon-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.btn-toggle-answers {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle-answers:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

/* Question Body */
.incident-card-body {
  margin-top: 16px;
}

.incident-text {
  font-size: 14.5px;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.mention-tag-pill) {
  display: inline-block;
  background: #e0e7ff;
  color: #3730a3;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 13px;
  margin: 0 2px;
}

.incident-attachment-wrap {
  margin-top: 14px;
}

.image-box {
  position: relative;
  max-width: 440px;
  max-height: 280px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #0f172a;
  cursor: pointer;
}

.image-box img {
  width: 100%;
  height: 100%;
  max-height: 280px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.image-box:hover img {
  transform: scale(1.02);
}

.image-overlay-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.image-box:hover .image-overlay-mask {
  opacity: 1;
}

/* Edit View */
.content-edit {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #4f46e5;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  resize: vertical;
}

.edit-textarea.small {
  padding: 8px 10px;
  font-size: 13px;
}

.edit-actions-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-save-edit,
.btn-cancel-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-edit {
  background: #10b981;
  color: #ffffff;
  border: 1px solid #059669;
}

.btn-save-edit:hover { background: #059669; }

.btn-cancel-edit {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-cancel-edit:hover { background: #e2e8f0; color: #0f172a; }

/* 💬 Discussion Thread / Answer Timeline */
.discussion-section {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
}

.discussion-divider {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.divider-text {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.divider-text i {
  color: #4f46e5;
}

.replies-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.reply-item {
  display: flex;
  gap: 12px;
}

.reply-avatar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reply-avatar.current-user {
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #e0e7ff;
}

.timeline-stem {
  width: 2px;
  flex: 1;
  background: #e2e8f0;
  margin-top: 6px;
}

.reply-card {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
}

.reply-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.reply-author-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.reply-author-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
}

.author-tag {
  background: #e0e7ff;
  color: #4338ca;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.reply-timestamp {
  font-size: 11.5px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reply-action-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reply-action-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.reply-action-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.reply-content {
  font-size: 13.5px;
  color: #334155;
  line-height: 1.5;
  word-break: break-word;
}

.reply-attachment {
  margin-top: 10px;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  position: relative;
  cursor: pointer;
}

.reply-attachment img {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  display: block;
}

.reply-image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
  transition: opacity 0.2s;
}

.reply-attachment:hover .reply-image-overlay {
  opacity: 1;
}

.no-replies-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 16px;
}

.no-replies-notice i {
  color: #94a3b8;
}

/* Reply Composer */
.reply-composer-wrap {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.reply-input-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reply-thumb-preview {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
}

.reply-thumb-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-reply-image {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: none;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.reply-input-row {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 4px 6px 4px 12px;
  transition: all 0.2s ease;
}

.reply-input-row:focus-within {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.reply-text-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 13.5px;
  color: #0f172a;
  outline: none;
  font-family: inherit;
}

.btn-reply-attach {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reply-attach:hover {
  background: #f1f5f9;
  color: #4f46e5;
}

.btn-send-reply {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-send-reply:hover:not(:disabled) {
  background: #4338ca;
}

.btn-send-reply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reply-error-msg {
  font-size: 12px;
  color: #dc2626;
  margin: 0;
}

/* 🏷️ Mention Floating Dropdown */
.mention-floating-dropdown {
  position: absolute;
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  max-width: 320px;
  overflow: hidden;
}

.mention-dropdown-header {
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mention-dropdown-header i {
  color: #4f46e5;
}

.mention-options-list {
  max-height: 200px;
  overflow-y: auto;
}

.mention-item-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.mention-item-option:hover,
.mention-item-option.is-selected {
  background: #eef2ff;
}

.mention-avatar-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mention-info {
  display: flex;
  flex-direction: column;
}

.mention-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.mention-role {
  font-size: 11px;
  color: #64748b;
}

.mention-no-results {
  padding: 12px;
  text-align: center;
  font-size: 12.5px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 🖼️ Image Lightbox Modal */
.image-lightbox-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.lightbox-dialog {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-close-btn {
  position: absolute;
  top: -44px;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.lightbox-close-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.lightbox-img {
  max-width: 100%;
  max-height: calc(90vh - 60px);
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.lightbox-footer {
  margin-top: 12px;
}

.btn-download-img {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-download-img:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Animations */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.25s ease-out;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 📱 Responsive Breakpoints */
@media (max-width: 1200px) {
  .metrics-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 16px;
    gap: 0;
  }

  .rca-top-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .banner-controls {
    width: 100%;
    justify-content: flex-end;
  }

  .rca-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .rca-search-wrapper {
    width: 100%;
  }

  .rca-pills-group {
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .rca-pills-group::-webkit-scrollbar {
    display: none;
  }
}

@media (max-width: 768px) {
  .metrics-strip {
    grid-template-columns: 1fr;
  }

  .incident-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-status-actions {
    width: 100%;
    justify-content: space-between;
  }

  .composer-top {
    flex-direction: column;
  }

  .user-avatar-wrap {
    display: none;
  }

  .composer-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .btn-submit-issue {
    width: 100%;
    justify-content: center;
  }
}
</style>