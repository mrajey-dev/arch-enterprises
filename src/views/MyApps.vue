<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="apps-board-premium" :class="{ 'mobile-view': isMobile }">
        
        <!-- 🌟 Header Section -->
        <div class="hub-header-card">
          <div class="header-left">
            <div class="hub-icon-box">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="hub-title-info">
              <div class="hub-title-row">
                <h2>Applications Portfolio</h2>
                <span class="hub-status-pill"><span class="dot-pulse"></span> Ecosystem Active</span>
              </div>
              <p class="hub-subtitle">Manage app releases, technical architecture, team ownership, development costs & paid integrations</p>
            </div>
          </div>
          <div class="header-right">
            <button class="btn-add-primary" @click="openAddModal">
              <i class="fas fa-plus"></i>
              <span>Add New App</span>
            </button>
          </div>
        </div>

        <!-- 📊 KPI Metrics Row -->
        <div class="kpi-metrics-row">
          <div class="kpi-card">
            <div class="kpi-icon-wrap blue">
              <i class="fab fa-google-play"></i>
            </div>
            <div class="kpi-data">
              <span class="kpi-count">{{ stats.total_apps || apps.length || 0 }}</span>
              <span class="kpi-name">Total Apps</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrap purple">
              <i class="fas fa-users-gear"></i>
            </div>
            <div class="kpi-data">
              <span class="kpi-count">{{ totalTeamMembersCount }}</span>
              <span class="kpi-name">Active Team</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrap emerald">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="kpi-data">
              <span class="kpi-count">{{ formatCurrency(totalInvestmentCost) }}</span>
              <span class="kpi-name">Dev & Mktg Cost</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrap amber">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="kpi-data">
              <span class="kpi-count">{{ appsWithPaidApisCount }}</span>
              <span class="kpi-name">Paid APIs</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrap rose">
              <i class="fas fa-cloud-arrow-down"></i>
            </div>
            <div class="kpi-data">
              <span class="kpi-count">{{ formatNumber(stats.total_downloads || totalDownloadsComputed) }}</span>
              <span class="kpi-name">Total Downloads</span>
            </div>
          </div>
        </div>

        <!-- 🔍 Search & Filter Bar -->
        <div class="filter-toolbar">
          <div class="search-wrap">
            <i class="fas fa-search search-ico"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by app name, package, owner, tech stack, or API..."
              class="search-input"
            >
            <button v-if="searchQuery" @click="searchQuery = ''" class="btn-clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="filter-pills-wrap">
            <button 
              v-for="tab in filterTabs" 
              :key="tab.id"
              class="filter-pill" 
              :class="{ active: activeFilterTab === tab.id }"
              @click="activeFilterTab = tab.id"
            >
              <i :class="tab.icon"></i>
              <span>{{ tab.label }}</span>
              <span class="pill-badge">{{ getTabCount(tab.id) }}</span>
            </button>
          </div>
        </div>

        <!-- 🚀 Single-Column Applications List -->
        <div class="apps-single-column-list">
          <div v-if="loading" class="loading-state">
            <div class="spinner-ring"></div>
            <p>Loading application portfolio...</p>
          </div>

          <div v-else-if="filteredApps.length" class="apps-list-wrap">
            <div 
              v-for="app in filteredApps" 
              :key="app.id" 
              class="app-row-card"
            >
              <!-- Left Accent Color Indicator -->
              <div class="app-row-accent" :style="{ background: app.accent_color || '#2563eb' }"></div>

              <div class="app-row-content">
                
                <!-- 1. Left Section: Icon, Name, Version, Status & Social Links -->
                <div class="row-brand-col">
                  <div class="app-avatar-frame" :style="{ background: app.accent_color ? app.accent_color + '15' : '#eff6ff', borderColor: (app.accent_color || '#2563eb') + '35' }">
                    <img v-if="app.logo_url" :src="app.logo_url" class="app-img" :alt="app.name" @error="handleLogoError(app)">
                    <span v-else class="app-avatar-fallback" :style="{ color: app.accent_color || '#2563eb' }">
                      {{ getInitials(app.name) }}
                    </span>
                  </div>

                  <div class="brand-text-block">
                    <div class="brand-title-line">
                      <h3 class="app-title-main" :title="app.name">{{ app.name }}</h3>
                      <span class="status-badge" :class="getStatusClass(app.app_status)">
                        <span class="status-dot"></span> {{ app.app_status || 'Live' }}
                      </span>
                    </div>

                    <div class="brand-meta-line">
                      <span class="version-badge"><i class="fas fa-code-branch"></i> v{{ app.version || '1.0.0' }}</span>
                      <span class="pkg-badge" :title="app.package_name"><i class="fas fa-cube"></i> {{ app.package_name }}</span>
                      <span v-if="app.category" class="cat-badge"><i class="fas fa-tag"></i> {{ app.category }}</span>
                    </div>

                    <!-- External Quick Links -->
                    <div class="quick-links-strip">
                      <a v-if="app.play_store_link" :href="app.play_store_link" target="_blank" class="store-chip ps" title="Google Play Store">
                        <i class="fab fa-google-play"></i> Play Store
                      </a>
                      <a v-if="app.github_link" :href="app.github_link" target="_blank" class="store-chip gh" title="GitHub Repository">
                        <i class="fab fa-github"></i> GitHub
                      </a>
                      <a v-if="app.youtube_url" :href="app.youtube_url" target="_blank" class="store-chip yt" title="YouTube Demo">
                        <i class="fab fa-youtube"></i> YouTube
                      </a>
                      <a v-if="app.instagram_url" :href="app.instagram_url" target="_blank" class="store-chip ig" title="Instagram">
                        <i class="fab fa-instagram"></i> Instagram
                      </a>
                      <a v-if="app.website_url" :href="app.website_url" target="_blank" class="store-chip web" title="Live Website / Web App">
                        <i class="fas fa-globe"></i> Website
                      </a>
                      <span v-if="!hasAnyLinks(app)" class="no-links-sub">No external links</span>
                    </div>
                  </div>
                </div>

                <!-- 2. Middle Section: Specifications & Tech Stack -->
                <div class="row-center-col">
                  <p class="app-desc-paragraph">{{ app.short_description || 'No description provided.' }}</p>

                  <div class="specs-horizontal-grid">
                    <div class="spec-entry">
                      <span class="spec-lbl"><i class="fas fa-lightbulb text-amber"></i> Idea Owner</span>
                      <span class="spec-val highlight-owner">{{ app.idea_owner || 'Arch Enterprises' }}</span>
                    </div>
                    <div class="spec-entry">
                      <span class="spec-lbl"><i class="fas fa-clock text-blue"></i> Dev Duration</span>
                      <span class="spec-val">{{ app.development_time || 'Ongoing' }}</span>
                    </div>
                    <div class="spec-entry">
                      <span class="spec-lbl"><i class="fas fa-users text-purple"></i> Team Size</span>
                      <span class="spec-val">{{ app.team_size ? (app.team_size.toLowerCase().includes('member') || app.team_size.toLowerCase().includes('core') ? app.team_size : app.team_size + ' Members') : 'Core Team' }}</span>
                    </div>
                    <div class="spec-entry">
                      <span class="spec-lbl"><i class="fas fa-calendar-check text-emerald"></i> Last Update</span>
                      <span class="spec-val">{{ formatDate(app.last_update || app.updated_at || app.release_date) }}</span>
                    </div>
                  </div>

                  <!-- Tech stack badges -->
                  <div class="tech-badges-row" v-if="app.technologies">
                    <span 
                      v-for="tech in app.technologies.split(',').slice(0, 5)" 
                      :key="tech" 
                      class="tech-tag"
                    >
                      {{ tech.trim() }}
                    </span>
                    <span v-if="app.technologies.split(',').length > 5" class="tech-tag more">
                      +{{ app.technologies.split(',').length - 5 }}
                    </span>
                  </div>
                </div>

                <!-- 3. Right Section: Financials, Paid APIs & Actions -->
                <div class="row-right-col">
                  <div class="financial-card-box">
                    <div class="fin-stat-pair">
                      <div class="fin-stat-unit">
                        <span class="fin-lbl">Dev Cost</span>
                        <span class="fin-val dev">{{ app.development_cost || '₹0' }}</span>
                      </div>
                      <div class="fin-divider"></div>
                      <div class="fin-stat-unit">
                        <span class="fin-lbl">Mktg Cost</span>
                        <span class="fin-val mktg">{{ app.marketing_cost || '₹0' }}</span>
                      </div>
                    </div>

                    <div class="api-notice-pill" :class="{ 'has-api': app.paid_apis }">
                      <i class="fas fa-plug-circle-bolt"></i>
                      <span class="api-notice-text">{{ app.paid_apis ? app.paid_apis : 'No Paid APIs' }}</span>
                    </div>
                  </div>

                  <!-- Action Controls -->
                  <div class="row-actions-group">
                    <button class="btn-open-intel" @click="openAppIntelModal(app)">
                      <i class="fas fa-info-circle"></i>
                      <span>Full Details</span>
                    </button>
                    <button class="btn-tool-circle edit" @click="editApp(app)" title="Edit App">
                      <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn-tool-circle del" @click="confirmDelete(app)" title="Delete App">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon-box">
              <i class="fas fa-folder-open"></i>
            </div>
            <h3>No Applications Found</h3>
            <p>{{ searchQuery ? 'No applications match your search query.' : 'There are no applications added to your portfolio yet.' }}</p>
            <button class="btn-add-primary" @click="openAddModal">
              <i class="fas fa-plus"></i> Add First Application
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- 🌟 Full Intelligence & Documentation Modal -->
    <div v-if="selectedAppModal" class="modal-overlay-backdrop" @click.self="selectedAppModal = null">
      <div class="intel-modal-window">
        <!-- Hero Header -->
        <div class="intel-modal-header" :style="{ background: `linear-gradient(135deg, ${selectedAppModal.accent_color || '#1e40af'} 0%, #0f172a 100%)` }">
          <div class="modal-head-brand">
            <div class="modal-app-icon" :style="{ background: selectedAppModal.accent_color || '#2563eb' }">
              <img v-if="selectedAppModal.logo_url" :src="selectedAppModal.logo_url" :alt="selectedAppModal.name">
              <span v-else>{{ getInitials(selectedAppModal.name) }}</span>
            </div>
            <div>
              <div class="modal-title-row">
                <h2>{{ selectedAppModal.name }}</h2>
                <span class="modal-ver-badge">v{{ selectedAppModal.version || '1.0.0' }}</span>
                <span class="status-pill" :class="getStatusClass(selectedAppModal.app_status)">{{ selectedAppModal.app_status || 'Live' }}</span>
              </div>
              <p class="modal-pkg-sub"><i class="fas fa-cube"></i> {{ selectedAppModal.package_name }}</p>
            </div>
          </div>
          <button class="btn-close-modal" @click="selectedAppModal = null"><i class="fas fa-times"></i></button>
        </div>

        <!-- Modal Body -->
        <div class="intel-modal-body">
          <!-- Quick Links Row -->
          <div class="modal-links-bar" v-if="hasAnyLinks(selectedAppModal)">
            <a v-if="selectedAppModal.play_store_link" :href="selectedAppModal.play_store_link" target="_blank" class="modal-link-chip ps">
              <i class="fab fa-google-play"></i> Google Play
            </a>
            <a v-if="selectedAppModal.github_link" :href="selectedAppModal.github_link" target="_blank" class="modal-link-chip gh">
              <i class="fab fa-github"></i> GitHub Repo
            </a>
            <a v-if="selectedAppModal.youtube_url" :href="selectedAppModal.youtube_url" target="_blank" class="modal-link-chip yt">
              <i class="fab fa-youtube"></i> YouTube Demo
            </a>
            <a v-if="selectedAppModal.instagram_url" :href="selectedAppModal.instagram_url" target="_blank" class="modal-link-chip ig">
              <i class="fab fa-instagram"></i> Instagram
            </a>
            <a v-if="selectedAppModal.website_url" :href="selectedAppModal.website_url" target="_blank" class="modal-link-chip web">
              <i class="fas fa-globe"></i> Website
            </a>
          </div>

          <!-- Section 1: Specifications Grid -->
          <div class="modal-section-card">
            <div class="sec-title"><i class="fas fa-sliders-h"></i> Product & Team Overview</div>
            <div class="modal-specs-grid">
              <div class="modal-spec-item">
                <span class="lbl"><i class="fas fa-lightbulb"></i> Idea Owner</span>
                <span class="val bold">{{ selectedAppModal.idea_owner || 'Arch Enterprises' }}</span>
              </div>
              <div class="modal-spec-item">
                <span class="lbl"><i class="fas fa-stopwatch"></i> Dev Duration</span>
                <span class="val">{{ selectedAppModal.development_time || 'Ongoing' }}</span>
              </div>
              <div class="modal-spec-item">
                <span class="lbl"><i class="fas fa-users"></i> Team Size</span>
                <span class="val">{{ selectedAppModal.team_size || 'Core Team' }}</span>
              </div>
              <div class="modal-spec-item">
                <span class="lbl"><i class="fas fa-calendar-alt"></i> Initial Release</span>
                <span class="val">{{ formatDate(selectedAppModal.release_date) }}</span>
              </div>
              <div class="modal-spec-item">
                <span class="lbl"><i class="fas fa-calendar-check"></i> Last Updated</span>
                <span class="val bold">{{ formatDate(selectedAppModal.last_update || selectedAppModal.updated_at) }}</span>
              </div>
              <div class="modal-spec-item">
                <span class="lbl"><i class="fas fa-mobile-screen"></i> Target Platforms</span>
                <span class="val">{{ selectedAppModal.platforms || 'Android, iOS, Web' }}</span>
              </div>
              <div class="modal-spec-item">
                <span class="lbl"><i class="fas fa-tag"></i> Category</span>
                <span class="val">{{ selectedAppModal.category || 'Productivity / Enterprise' }}</span>
              </div>
              <div class="modal-spec-item">
                <span class="lbl"><i class="fas fa-user-check"></i> Active Users</span>
                <span class="val">{{ selectedAppModal.active_users || 'Growing Userbase' }}</span>
              </div>
            </div>

            <!-- Team Members Breakdown -->
            <div v-if="selectedAppModal.team_members" class="team-roster-box">
              <span class="roster-lbl"><i class="fas fa-id-badge"></i> Assigned Team Roster:</span>
              <p class="roster-val">{{ selectedAppModal.team_members }}</p>
            </div>
          </div>

          <!-- Section 2: Financial Investment & Paid APIs -->
          <div class="modal-section-card">
            <div class="sec-title"><i class="fas fa-receipt"></i> Financials & Paid API Integration</div>
            <div class="modal-fin-grid">
              <div class="fin-box dev">
                <span class="fin-lbl">Development Cost</span>
                <span class="fin-val">{{ selectedAppModal.development_cost || '₹0' }}</span>
              </div>
              <div class="fin-box mktg">
                <span class="fin-lbl">Marketing Cost</span>
                <span class="fin-val">{{ selectedAppModal.marketing_cost || '₹0' }}</span>
              </div>
              <div class="fin-box rev">
                <span class="fin-lbl">Revenue Model</span>
                <span class="fin-val">{{ selectedAppModal.revenue_model || 'Enterprise / Free' }}</span>
              </div>
            </div>

            <!-- Paid APIs detailed breakdown -->
            <div v-if="selectedAppModal.paid_apis" class="paid-api-detailed-box">
              <div class="paid-api-head">
                <i class="fas fa-plug-circle-bolt"></i>
                <strong>Configured Paid APIs & Prices:</strong>
              </div>
              <p class="paid-api-content">{{ selectedAppModal.paid_apis }}</p>
            </div>
          </div>

          <!-- Section 3: Tech Stack & Architecture -->
          <div class="modal-section-card" v-if="selectedAppModal.technologies">
            <div class="sec-title"><i class="fas fa-code"></i> Technical Stack & Features</div>
            <div class="tech-chips-wrap">
              <span v-for="tech in (selectedAppModal.technologies || '').split(',')" :key="tech" class="tech-chip-lg">
                {{ tech.trim() }}
              </span>
            </div>
            <p class="modal-desc-body">{{ selectedAppModal.long_description || selectedAppModal.short_description }}</p>
          </div>

          <!-- Section 4: Documentation -->
          <div v-if="hasDocumentationContent(selectedAppModal)" class="modal-section-card">
            <div class="sec-title"><i class="fas fa-book-open"></i> Technical Documentation</div>
            
            <div v-if="selectedAppModal.documentation_url" class="doc-link-banner">
              <i class="fas fa-external-link-alt"></i>
              <a :href="selectedAppModal.documentation_url" target="_blank" rel="noopener noreferrer">
                {{ selectedAppModal.documentation_url_label || 'View Official Hosted Documentation' }}
              </a>
            </div>

            <div v-if="selectedAppModal.documentation" class="doc-html-viewer" v-html="renderDocumentation(selectedAppModal.documentation)"></div>
          </div>
        </div>

        <div class="modal-footer-actions">
          <button class="btn-secondary-modal" @click="selectedAppModal = null">Close</button>
          <button class="btn-primary-modal" @click="editApp(selectedAppModal); selectedAppModal = null">
            <i class="fas fa-pen"></i> Edit Information
          </button>
        </div>
      </div>
    </div>

    <!-- 📝 Add / Edit Application Drawer Modal -->
    <div v-if="showAddModal" class="modal-overlay-backdrop" @click.self="showAddModal = false">
      <div class="app-form-modal-window">
        <div class="app-form-modal-header" :style="{ background: `linear-gradient(135deg, ${formData.accent_color || '#2563eb'} 0%, #0f172a 100%)` }">
          <div class="form-modal-brand">
            <div class="form-modal-icon">
              <i class="fas fa-sliders-h"></i>
            </div>
            <div>
              <h2>{{ editingApp ? `Edit "${editingApp.name}" Information` : 'Register New Application' }}</h2>
              <p>Configure complete technical, financial, team ownership and release information</p>
            </div>
          </div>
          <button class="btn-close-modal" @click="showAddModal = false"><i class="fas fa-times"></i></button>
        </div>

        <!-- Tab Selector for Form -->
        <div class="form-tab-nav">
          <button class="form-tab-item" :class="{ active: formTab === 'general' }" @click="formTab = 'general'">
            <i class="fas fa-info-circle"></i> 1. Core Info
          </button>
          <button class="form-tab-item" :class="{ active: formTab === 'team' }" @click="formTab = 'team'">
            <i class="fas fa-users"></i> 2. Team & Timeline
          </button>
          <button class="form-tab-item" :class="{ active: formTab === 'finance' }" @click="formTab = 'finance'">
            <i class="fas fa-wallet"></i> 3. Costs & Paid APIs
          </button>
          <button class="form-tab-item" :class="{ active: formTab === 'links' }" @click="formTab = 'links'">
            <i class="fas fa-share-nodes"></i> 4. Social & Links
          </button>
        </div>

        <form @submit.prevent="handleAppSubmit" class="app-modal-form-body">
          <!-- 🔹 Tab 1: Core General Info -->
          <div v-show="formTab === 'general'" class="form-tab-pane">
            <div class="form-grid-3">
              <div class="form-field">
                <label>App Name <span class="required">*</span></label>
                <input type="text" v-model="formData.name" placeholder="e.g. Arch360 Mobile" required>
              </div>

              <div class="form-field">
                <label>Package Name / Bundle ID <span class="required">*</span></label>
                <input type="text" v-model="formData.package_name" placeholder="e.g. com.archenterprises.arch360" required>
              </div>

              <div class="form-field">
                <label>App Version</label>
                <input type="text" v-model="formData.version" placeholder="e.g. 2.4.1">
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-field">
                <label>Application Status</label>
                <select v-model="formData.app_status">
                  <option value="Live">🟢 Live / Production</option>
                  <option value="Beta Testing">🟡 Beta Testing</option>
                  <option value="In Development">🔵 In Development</option>
                  <option value="Maintenance">🟠 Maintenance</option>
                  <option value="Archived">⚪ Archived</option>
                </select>
              </div>

              <div class="form-field">
                <label>App Category</label>
                <input type="text" v-model="formData.category" placeholder="e.g. Enterprise, CRM, Productivity">
              </div>

              <div class="form-field">
                <label>Target Platforms</label>
                <input type="text" v-model="formData.platforms" placeholder="e.g. Android, iOS, Web">
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-field">
                <label>App Logo / Icon URL</label>
                <input type="url" v-model="formData.logo_url" placeholder="https://domain.com/icon.png">
              </div>

              <div class="form-field">
                <label>Brand Accent Color</label>
                <div class="color-picker-row">
                  <input type="color" v-model="formData.accent_color" class="color-input">
                  <span class="color-code">{{ formData.accent_color }}</span>
                </div>
              </div>
            </div>

            <div class="form-field">
              <label>Technologies / Tech Stack (Comma separated)</label>
              <input type="text" v-model="formData.technologies" placeholder="e.g. Vue 3, Laravel 11, Capacitor, MySQL, Redis">
            </div>

            <div class="form-field">
              <label>Short Description <span class="required">*</span></label>
              <textarea v-model="formData.short_description" rows="2" placeholder="Brief summary of what this application does..." required></textarea>
            </div>
          </div>

          <!-- 🔹 Tab 2: Team, Ownership & Timeline -->
          <div v-show="formTab === 'team'" class="form-tab-pane">
            <div class="form-grid-3">
              <div class="form-field">
                <label>Idea Owner / Product Lead</label>
                <input type="text" v-model="formData.idea_owner" placeholder="e.g. Ajay Rathore / Arch Enterprises">
              </div>

              <div class="form-field">
                <label>Development Time Taken</label>
                <input type="text" v-model="formData.development_time" placeholder="e.g. 3 Months / 90 Days">
              </div>

              <div class="form-field">
                <label>Team Size (Working Employees)</label>
                <input type="text" v-model="formData.team_size" placeholder="e.g. 4 Developers, 1 QA">
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-field">
                <label>Initial Release Date</label>
                <input type="date" v-model="formData.release_date">
              </div>

              <div class="form-field">
                <label>Last Update Date</label>
                <input type="date" v-model="formData.last_update">
              </div>

              <div class="form-field">
                <label>Active Users (DAU / MAU)</label>
                <input type="text" v-model="formData.active_users" placeholder="e.g. 1,500 Daily Active Users">
              </div>
            </div>

            <div class="form-field">
              <label>Assigned Team Members & Roles (Roster)</label>
              <textarea 
                v-model="formData.team_members" 
                rows="3" 
                placeholder="e.g. Rahul (Lead Dev), Priya (UI/UX), Amit (Backend API), Sneha (QA Tester)"
              ></textarea>
            </div>
          </div>

          <!-- 🔹 Tab 3: Costs & Paid APIs -->
          <div v-show="formTab === 'finance'" class="form-tab-pane">
            <div class="form-grid-3">
              <div class="form-field">
                <label>Total Development Cost</label>
                <input type="text" v-model="formData.development_cost" placeholder="e.g. ₹2,50,000 or $3,000">
              </div>

              <div class="form-field">
                <label>Total Marketing Cost</label>
                <input type="text" v-model="formData.marketing_cost" placeholder="e.g. ₹50,000 or $600">
              </div>

              <div class="form-field">
                <label>Revenue / Monetization Model</label>
                <input type="text" v-model="formData.revenue_model" placeholder="e.g. Subscription, Freemium, Free">
              </div>
            </div>

            <div class="form-field">
              <label>Paid APIs & Service Prices (Detailed Breakdown)</label>
              <textarea 
                v-model="formData.paid_apis" 
                rows="3" 
                placeholder="e.g. OpenAI GPT-4 ($20/mo), Google Maps API (₹2,500/mo), Twilio SMS (₹0.20/msg)"
              ></textarea>
            </div>

            <div class="form-grid-2">
              <div class="form-field">
                <label>Total Downloads Count</label>
                <input type="number" v-model="formData.download_count" placeholder="e.g. 5000">
              </div>

              <div class="form-field">
                <label>Rating (e.g. 4.8)</label>
                <input type="number" step="0.1" max="5" min="0" v-model="formData.rating" placeholder="4.8">
              </div>
            </div>
          </div>

          <!-- 🔹 Tab 4: Social & Links -->
          <div v-show="formTab === 'links'" class="form-tab-pane">
            <div class="form-grid-2">
              <div class="form-field">
                <label><i class="fab fa-youtube color-yt"></i> YouTube Video / Channel URL</label>
                <input type="url" v-model="formData.youtube_url" placeholder="https://youtube.com/watch?v=...">
              </div>

              <div class="form-field">
                <label><i class="fab fa-instagram color-ig"></i> Instagram Account / Post URL</label>
                <input type="url" v-model="formData.instagram_url" placeholder="https://instagram.com/your_handle">
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-field">
                <label><i class="fab fa-google-play color-ps"></i> Google Play Store URL</label>
                <input type="url" v-model="formData.play_store_link" placeholder="https://play.google.com/store/apps/details?id=...">
              </div>

              <div class="form-field">
                <label><i class="fab fa-github color-gh"></i> GitHub Repository URL</label>
                <input type="url" v-model="formData.github_link" placeholder="https://github.com/organization/repo">
              </div>

              <div class="form-field">
                <label><i class="fas fa-globe color-web"></i> Website / Live Web App URL</label>
                <input type="url" v-model="formData.website_url" placeholder="https://app.yourdomain.com">
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-field">
                <label>Documentation Hosted URL</label>
                <input type="url" v-model="formData.documentation_url" placeholder="https://docs.yourdomain.com">
              </div>

              <div class="form-field">
                <label>Documentation Link Label</label>
                <input type="text" v-model="formData.documentation_url_label" placeholder="e.g. View Architecture & API Docs">
              </div>
            </div>

            <div class="form-field">
              <label>Detailed Technical Documentation / Release Notes</label>
              <textarea v-model="formData.documentation" rows="3" placeholder="Paste markdown/html notes, build instructions or changelog..."></textarea>
            </div>
          </div>

          <div class="modal-footer-sticky">
            <button type="button" class="btn-secondary-modal" @click="showAddModal = false">Cancel</button>
            <button type="submit" class="btn-primary-modal" :disabled="submitting">
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              <span v-else>{{ editingApp ? 'Update Application' : 'Publish Application' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 🗑️ Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay-backdrop" @click.self="showDeleteModal = false">
      <div class="modal-delete-box">
        <div class="del-icon-circle">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Delete Application?</h3>
        <p>Are you sure you want to remove <strong>{{ appToDelete?.name }}</strong>? All associated intelligence and tracking data will be permanently removed.</p>
        <div class="delete-actions">
          <button class="btn-secondary-modal" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-danger-modal" @click="deleteApp" :disabled="deleting">
            <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
            <span v-else>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 🔔 Toast Notifications -->
    <div class="toast-stack">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast-bubble', toast.type]">
        <i :class="toast.icon"></i>
        <span>{{ toast.message }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">&times;</button>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'

const API_BASE = 'https://employees.archenterprises.co.in/api/api';

export default {
  name: "MyApps",
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      apps: [],
      stats: {
        total_apps: 0,
        total_downloads: 0,
        avg_rating: 0
      },
      loading: false,
      submitting: false,
      deleting: false,
      searchQuery: '',
      activeFilterTab: 'all',
      filterTabs: [
        { id: 'all', label: 'All Applications', icon: 'fas fa-th-large' },
        { id: 'live', label: 'Live Products', icon: 'fas fa-check-circle' },
        { id: 'indev', label: 'In Development', icon: 'fas fa-tools' },
        { id: 'paid_api', label: 'Paid APIs', icon: 'fas fa-bolt' },
        { id: 'opensource', label: 'Open Source', icon: 'fab fa-github' }
      ],
      showAddModal: false,
      showDeleteModal: false,
      formTab: 'general',
      appToDelete: null,
      editingApp: null,
      selectedAppModal: null,
      toasts: [],
      formData: {
        id: null,
        name: '',
        package_name: '',
        logo_url: '',
        technologies: '',
        play_store_link: '',
        github_link: '',
        youtube_url: '',
        instagram_url: '',
        website_url: '',
        short_description: '',
        long_description: '',
        revenue_model: '',
        version: '1.0.0',
        download_count: null,
        rating: null,
        accent_color: '#3b82f6',
        release_date: new Date().toISOString().split('T')[0],
        last_update: new Date().toISOString().split('T')[0],
        development_time: '',
        team_size: '',
        team_members: '',
        idea_owner: 'Arch Enterprises',
        paid_apis: '',
        marketing_cost: '',
        development_cost: '',
        app_status: 'Live',
        category: 'Enterprise',
        platforms: 'Android, iOS, Web',
        active_users: '',
        documentation: '',
        documentation_url: '',
        documentation_url_label: ''
      }
    }
  },
  computed: {
    openSourceApps() {
      return this.apps.filter(app => app.github_link && app.github_link.trim() !== '').length;
    },
    totalDownloadsComputed() {
      return this.apps.reduce((sum, app) => sum + (Number(app.download_count) || 0), 0);
    },
    appsWithPaidApisCount() {
      return this.apps.filter(app => app.paid_apis && app.paid_apis.trim() !== '').length;
    },
    totalTeamMembersCount() {
      const uniqueNames = new Set();
      this.apps.forEach(app => {
        if (app.team_members) {
          app.team_members.split(',').forEach(m => {
            const clean = m.trim();
            if (clean) uniqueNames.add(clean);
          });
        }
      });
      return uniqueNames.size || (this.apps.length > 0 ? this.apps.length * 2 : 0);
    },
    totalInvestmentCost() {
      let total = 0;
      this.apps.forEach(app => {
        const dev = this.parseCostNumber(app.development_cost);
        const mktg = this.parseCostNumber(app.marketing_cost);
        total += dev + mktg;
      });
      return total;
    },
    filteredApps() {
      let list = this.apps;

      if (this.activeFilterTab === 'live') {
        list = list.filter(a => (a.app_status || 'Live').toLowerCase() === 'live');
      } else if (this.activeFilterTab === 'indev') {
        list = list.filter(a => (a.app_status || '').toLowerCase().includes('dev') || (a.app_status || '').toLowerCase().includes('beta'));
      } else if (this.activeFilterTab === 'paid_api') {
        list = list.filter(a => a.paid_apis && a.paid_apis.trim() !== '');
      } else if (this.activeFilterTab === 'opensource') {
        list = list.filter(a => a.github_link && a.github_link.trim() !== '');
      }

      if (this.searchQuery && this.searchQuery.trim() !== '') {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(a => 
          (a.name && a.name.toLowerCase().includes(q)) ||
          (a.package_name && a.package_name.toLowerCase().includes(q)) ||
          (a.idea_owner && a.idea_owner.toLowerCase().includes(q)) ||
          (a.technologies && a.technologies.toLowerCase().includes(q)) ||
          (a.paid_apis && a.paid_apis.toLowerCase().includes(q)) ||
          (a.team_members && a.team_members.toLowerCase().includes(q)) ||
          (a.short_description && a.short_description.toLowerCase().includes(q))
        );
      }

      return list;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadApps();
    this.loadStats();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 992;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    getInitials(name) {
      if (!name) return 'AP';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    },
    handleLogoError(app) {
      app.logo_url = '';
    },
    hasAnyLinks(app) {
      return app.play_store_link || app.github_link || app.youtube_url || app.instagram_url || app.website_url;
    },
    getStatusClass(status) {
      const s = (status || 'Live').toLowerCase();
      if (s.includes('live')) return 'status-live';
      if (s.includes('beta')) return 'status-beta';
      if (s.includes('dev')) return 'status-dev';
      if (s.includes('maint')) return 'status-maint';
      return 'status-other';
    },
    getTabCount(tabId) {
      if (tabId === 'all') return this.apps.length;
      if (tabId === 'live') return this.apps.filter(a => (a.app_status || 'Live').toLowerCase() === 'live').length;
      if (tabId === 'indev') return this.apps.filter(a => (a.app_status || '').toLowerCase().includes('dev') || (a.app_status || '').toLowerCase().includes('beta')).length;
      if (tabId === 'paid_api') return this.apps.filter(a => a.paid_apis && a.paid_apis.trim() !== '').length;
      if (tabId === 'opensource') return this.apps.filter(a => a.github_link && a.github_link.trim() !== '').length;
      return 0;
    },
    parseCostNumber(costStr) {
      if (!costStr) return 0;
      const numOnly = costStr.toString().replace(/[^0-9.]/g, '');
      const val = parseFloat(numOnly) || 0;
      if (costStr.toLowerCase().includes('l') || costStr.toLowerCase().includes('lakh')) {
        return val * 100000;
      }
      if (costStr.toLowerCase().includes('k')) {
        return val * 1000;
      }
      return val;
    },
    formatCurrency(amount) {
      if (!amount) return '₹0';
      if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
      if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
      if (amount >= 1000) return '₹' + (amount / 1000).toFixed(0) + 'K';
      return '₹' + amount.toLocaleString('en-IN');
    },
    formatDate(dateString) {
      if (!dateString) return 'Recent';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      } catch (e) {
        return dateString;
      }
    },
    formatNumber(num) {
      if (!num) return '0';
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    },
    hasDocumentationContent(app) {
      if (!app) return false;
      return (app.documentation && app.documentation.trim()) || 
             (app.documentation_url && app.documentation_url.trim());
    },
    renderDocumentation(content) {
      if (!content) return '';
      let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      if (/<[^>]+>/g.test(sanitized)) return sanitized;
      return sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/\s\s/g, ' &nbsp;');
    },
    openAppIntelModal(app) {
      this.selectedAppModal = app;
    },
    openAddModal() {
      this.resetForm();
      this.formTab = 'general';
      this.showAddModal = true;
    },
    async loadApps() {
      this.loading = true;
      try {
        const res = await fetch(`${API_BASE}/apps`);
        const data = await res.json();
        if (data.success) {
          this.apps = data.data || [];
        } else {
          this.showToast('Failed to load apps', 'error');
        }
      } catch (error) {
        console.error('Error loading apps:', error);
        this.showToast('Network error while loading apps', 'error');
      } finally {
        this.loading = false;
      }
    },
    async loadStats() {
      try {
        const response = await fetch(`${API_BASE}/apps/stats`);
        const data = await response.json();
        if (data.success) {
          this.stats = data.data;
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    },
    resetForm() {
      this.editingApp = null;
      this.formData = {
        id: null,
        name: '',
        package_name: '',
        logo_url: '',
        technologies: '',
        play_store_link: '',
        github_link: '',
        youtube_url: '',
        instagram_url: '',
        website_url: '',
        short_description: '',
        long_description: '',
        revenue_model: '',
        version: '1.0.0',
        download_count: null,
        rating: null,
        accent_color: '#3b82f6',
        release_date: new Date().toISOString().split('T')[0],
        last_update: new Date().toISOString().split('T')[0],
        development_time: '',
        team_size: '',
        team_members: '',
        idea_owner: 'Arch Enterprises',
        paid_apis: '',
        marketing_cost: '',
        development_cost: '',
        app_status: 'Live',
        category: 'Enterprise',
        platforms: 'Android, iOS, Web',
        active_users: '',
        documentation: '',
        documentation_url: '',
        documentation_url_label: ''
      };
    },
    editApp(app) {
      this.editingApp = app;
      this.formData = {
        id: app.id || null,
        name: app.name || '',
        package_name: app.package_name || '',
        logo_url: app.logo_url || '',
        technologies: app.technologies || '',
        play_store_link: app.play_store_link || '',
        github_link: app.github_link || '',
        youtube_url: app.youtube_url || '',
        instagram_url: app.instagram_url || '',
        website_url: app.website_url || '',
        short_description: app.short_description || '',
        long_description: app.long_description || '',
        revenue_model: app.revenue_model || '',
        version: app.version || '1.0.0',
        download_count: app.download_count || null,
        rating: app.rating || null,
        accent_color: app.accent_color || '#3b82f6',
        release_date: app.release_date || new Date().toISOString().split('T')[0],
        last_update: app.last_update || new Date().toISOString().split('T')[0],
        development_time: app.development_time || '',
        team_size: app.team_size || '',
        team_members: app.team_members || '',
        idea_owner: app.idea_owner || 'Arch Enterprises',
        paid_apis: app.paid_apis || '',
        marketing_cost: app.marketing_cost || '',
        development_cost: app.development_cost || '',
        app_status: app.app_status || 'Live',
        category: app.category || 'Enterprise',
        platforms: app.platforms || 'Android, iOS, Web',
        active_users: app.active_users || '',
        documentation: app.documentation || '',
        documentation_url: app.documentation_url || '',
        documentation_url_label: app.documentation_url_label || ''
      };

      this.formTab = 'general';
      this.showAddModal = true;
      this.showToast(`Editing "${app.name}"`, 'info');
    },
    async handleAppSubmit() {
      if (!this.formData.name || !this.formData.package_name || !this.formData.short_description) {
        this.showToast('Please fill all required fields (*)', 'error');
        return;
      }

      this.submitting = true;
      try {
        const url = this.editingApp 
          ? `${API_BASE}/apps/${this.editingApp.id}`
          : `${API_BASE}/apps`;
        
        const method = this.editingApp ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(this.formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.showToast(this.editingApp ? 'Application updated successfully!' : 'Application published successfully!', 'success');
          this.showAddModal = false;
          this.resetForm();
          await this.loadApps();
          await this.loadStats();
        } else {
          this.showToast(data.message || 'Failed to save application', 'error');
        }
      } catch (error) {
        console.error('Error saving app:', error);
        this.showToast('Network error: ' + error.message, 'error');
      } finally {
        this.submitting = false;
      }
    },
    confirmDelete(app) {
      this.appToDelete = app;
      this.showDeleteModal = true;
    },
    async deleteApp() {
      if (!this.appToDelete) return;
      this.deleting = true;
      try {
        const response = await fetch(`${API_BASE}/apps/${this.appToDelete.id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          this.showToast(`"${this.appToDelete.name}" removed successfully`, 'success');
          await this.loadApps();
          await this.loadStats();
          this.showDeleteModal = false;
          this.appToDelete = null;
        } else {
          this.showToast(data.message || 'Delete operation failed', 'error');
        }
      } catch (error) {
        console.error('Error deleting app:', error);
        this.showToast('Network error during deletion', 'error');
      } finally {
        this.deleting = false;
      }
    },
    showToast(message, type = 'info') {
      const id = Date.now();
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
      };
      this.toasts.push({ id, message, type, icon: icons[type] || icons.info });
      setTimeout(() => this.removeToast(id), 3500);
    },
    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.layout {
  min-height: 100vh;
  background: #f4f6fa;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

/* 🌟 Master Workspace Container - Clean flex-1 right next to sidebar */
.apps-board-premium {
  flex: 1;
  min-width: 0;
  margin-left: 0;
  max-width: 100%;
  box-sizing: border-box;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #1e293b;
}

.apps-board-premium.mobile-view {
  margin-left: 0;
  max-width: 100%;
  padding: 0;
}

/* 🌟 Header Section */
.hub-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 18px;
  border: 1px solid #e5eaf2;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hub-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  flex-shrink: 0;
}

.hub-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hub-title-row h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

.hub-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ecfdf5;
  color: #059669;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid #a7f3d0;
}

.dot-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

.hub-subtitle {
  font-size: 0.82rem;
  color: #64748b;
  margin: 3px 0 0 0;
}

.btn-add-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.btn-add-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

/* 📊 KPI Metrics Row */
.kpi-metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.kpi-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e5eaf2;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.04);
  border-color: #cbd5e1;
}

.kpi-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.kpi-icon-wrap.blue { background: #eff6ff; color: #2563eb; }
.kpi-icon-wrap.purple { background: #f5f3ff; color: #7c3aed; }
.kpi-icon-wrap.emerald { background: #ecfdf5; color: #059669; }
.kpi-icon-wrap.amber { background: #fffbeb; color: #d97706; }
.kpi-icon-wrap.rose { background: #fff1f2; color: #e11d48; }

.kpi-data {
  display: flex;
  flex-direction: column;
}

.kpi-count {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.kpi-name {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 2px;
}

/* 🔍 Filters & Search Toolbar */
.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 380px;
}

.search-ico {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.88rem;
}

.search-input {
  width: 100%;
  padding: 9px 34px 9px 36px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.86rem;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.btn-clear-search {
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

.filter-pills-wrap {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

.filter-pill.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.pill-badge {
  background: rgba(0, 0, 0, 0.07);
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 0.68rem;
}

.filter-pill.active .pill-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* 🚀 Single-Column Applications List Layout */
.apps-single-column-list {
  display: flex;
  flex-direction: column;
}

.apps-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-row-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5eaf2;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.02);
  display: flex;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-row-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.app-row-accent {
  width: 5px;
  flex-shrink: 0;
}

.app-row-content {
  display: grid;
  grid-template-columns: 290px 1fr 240px;
  gap: 16px;
  padding: 18px 20px;
  flex: 1;
  align-items: center;
}

/* 1. Left Brand Column */
.row-brand-col {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  min-width: 0;
}

.app-avatar-frame {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1.5px solid transparent;
  flex-shrink: 0;
}

.app-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-avatar-fallback {
  font-size: 1.2rem;
  font-weight: 800;
}

.brand-text-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.brand-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.app-title-main {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  flex-shrink: 0;
}

.status-live { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.status-beta { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; }
.status-dev { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.status-maint { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
.status-other { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.brand-meta-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.version-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 5px;
}

.pkg-badge {
  font-size: 0.72rem;
  color: #94a3b8;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.cat-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 5px;
}

.quick-links-strip {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 4px;
}

.store-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  text-decoration: none;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.store-chip.ps { color: #0284c7; }
.store-chip.ps:hover { background: #0284c7; color: #ffffff; border-color: #0284c7; }
.store-chip.gh { color: #0f172a; }
.store-chip.gh:hover { background: #0f172a; color: #ffffff; border-color: #0f172a; }
.store-chip.yt { color: #dc2626; }
.store-chip.yt:hover { background: #dc2626; color: #ffffff; border-color: #dc2626; }
.store-chip.ig { color: #e11d48; }
.store-chip.ig:hover { background: #e11d48; color: #ffffff; border-color: #e11d48; }
.store-chip.web { color: #2563eb; }
.store-chip.web:hover { background: #2563eb; color: #ffffff; border-color: #2563eb; }

.no-links-sub {
  font-size: 0.7rem;
  color: #94a3b8;
  font-style: italic;
}

/* 2. Middle Center Column */
.row-center-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 0 10px;
  border-left: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
}

.app-desc-paragraph {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.specs-horizontal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #edf2f7;
}

.spec-entry {
  display: flex;
  flex-direction: column;
}

.spec-lbl {
  font-size: 0.66rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.spec-val {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.highlight-owner { color: #2563eb; }
.text-amber { color: #d97706; }
.text-blue { color: #2563eb; }
.text-purple { color: #7c3aed; }
.text-emerald { color: #059669; }

.tech-badges-row {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.tech-tag {
  font-size: 0.68rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 7px;
  border-radius: 5px;
}

.tech-tag.more {
  background: #e2e8f0;
  color: #1e293b;
}

/* 3. Right Action Column */
.row-right-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.financial-card-box {
  background: #f8fafc;
  border: 1px solid #edf2f7;
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fin-stat-pair {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fin-stat-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.fin-lbl {
  font-size: 0.64rem;
  font-weight: 600;
  color: #94a3b8;
}

.fin-val {
  font-size: 0.82rem;
  font-weight: 800;
  color: #0f172a;
}

.fin-val.dev { color: #2563eb; }
.fin-val.mktg { color: #d97706; }

.fin-divider {
  width: 1px;
  height: 20px;
  background: #cbd5e1;
}

.api-notice-pill {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.api-notice-pill.has-api {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.api-notice-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-actions-group {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-open-intel {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-open-intel:hover {
  background: #2563eb;
}

.btn-tool-circle {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tool-circle.edit:hover { background: #2563eb; color: #ffffff; border-color: #2563eb; }
.btn-tool-circle.del:hover { background: #ef4444; color: #ffffff; border-color: #ef4444; }

/* 🌟 Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e5eaf2;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon-box {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 16px;
}

/* 🌟 Intelligence Modal Styles */
.modal-overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.intel-modal-window,
.app-form-modal-window {
  background: #ffffff;
  border-radius: 22px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.intel-modal-header,
.app-form-modal-header {
  padding: 24px 28px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-head-brand,
.form-modal-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-app-icon,
.form-modal-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 800;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.modal-app-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-title-row h2,
.form-modal-brand h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
}

.form-modal-brand p {
  margin: 4px 0 0 0;
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.8);
}

.modal-ver-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.modal-pkg-sub {
  margin: 4px 0 0 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: monospace;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #ffffff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
}

.intel-modal-body {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-links-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-link-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 7px 14px;
  border-radius: 10px;
  text-decoration: none;
  border: 1px solid #e2e8f0;
}

.modal-link-chip.ps { background: #f0f9ff; color: #0284c7; border-color: #bae6fd; }
.modal-link-chip.gh { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
.modal-link-chip.yt { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.modal-link-chip.ig { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
.modal-link-chip.web { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }

.modal-section-card {
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 18px 20px;
}

.sec-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
}

.modal-spec-item {
  display: flex;
  flex-direction: column;
}

.modal-spec-item .lbl {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.modal-spec-item .val {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 3px;
}

.team-roster-box {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.roster-lbl {
  font-size: 0.78rem;
  font-weight: 700;
  color: #2563eb;
  display: block;
  margin-bottom: 4px;
}

.roster-val {
  font-size: 0.84rem;
  color: #334155;
  line-height: 1.4;
  margin: 0;
}

.modal-fin-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}

.fin-box {
  background: #ffffff;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.fin-lbl {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
}

.fin-box.dev .fin-val { color: #2563eb; font-size: 1.1rem; font-weight: 800; }
.fin-box.mktg .fin-val { color: #d97706; font-size: 1.1rem; font-weight: 800; }
.fin-box.rev .fin-val { color: #10b981; font-size: 0.95rem; font-weight: 700; }

.paid-api-detailed-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 12px 16px;
}

.paid-api-head {
  color: #b45309;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.paid-api-content {
  margin: 0;
  font-size: 0.84rem;
  color: #78350f;
  line-height: 1.4;
}

.tech-chips-wrap {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.tech-chip-lg {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #1e293b;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
}

.modal-desc-body {
  font-size: 0.86rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.doc-link-banner {
  background: #ffffff;
  border: 1px solid #bfdbfe;
  padding: 10px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.doc-link-banner a {
  color: #2563eb;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
}

.modal-footer-actions,
.modal-footer-sticky {
  padding: 18px 28px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary-modal {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary-modal {
  background: #2563eb;
  border: none;
  color: #ffffff;
  padding: 9px 20px;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-danger-modal {
  background: #ef4444;
  border: none;
  color: #ffffff;
  padding: 9px 20px;
  border-radius: 10px;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
}

/* 📝 Tabbed Form Modal Styles */
.form-tab-nav {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 20px;
  overflow-x: auto;
}

.form-tab-item {
  background: none;
  border: none;
  padding: 14px 18px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.form-tab-item.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background: #ffffff;
}

.app-modal-form-body {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-tab-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-field .required {
  color: #ef4444;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.86rem;
  color: #1e293b;
  background: #ffffff;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 44px;
  height: 38px;
  padding: 2px !important;
  border-radius: 8px;
  cursor: pointer;
}

.color-code {
  font-family: monospace;
  font-size: 0.84rem;
  font-weight: 700;
  color: #475569;
}

.color-yt { color: #dc2626; }
.color-ig { color: #e11d48; }
.color-ps { color: #0284c7; }
.color-gh { color: #1e293b; }
.color-web { color: #2563eb; }

/* 🗑️ Delete Dialog Box */
.modal-delete-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  max-width: 420px;
  width: 100%;
  text-align: center;
}

.del-icon-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #fee2e2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin: 0 auto 16px;
}

.modal-delete-box h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.modal-delete-box p {
  font-size: 0.86rem;
  color: #64748b;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 🔔 Toasts */
.toast-stack {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-bubble {
  background: #0f172a;
  color: #ffffff;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 0.86rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.toast-bubble.success { background: #065f46; }
.toast-bubble.error { background: #991b1b; }
.toast-bubble.info { background: #1e3a8a; }

.toast-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 8px;
}

/* 📱 Responsive Adjustments */
@media (max-width: 1200px) {
  .app-row-content {
    grid-template-columns: 1fr 1fr;
  }
  .row-right-col {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
  }
}

@media (max-width: 992px) {
  .apps-board-premium {
    margin-left: 0;
    max-width: 100%;
    padding: 16px;
  }
  
  .hub-header-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .app-row-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .row-center-col {
    border-left: none;
    border-right: none;
    padding: 12px 0;
    border-top: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
  }

  .specs-horizontal-grid {
    grid-template-columns: 1fr 1fr;
  }

  .form-grid-3,
  .form-grid-2,
  .modal-fin-grid {
    grid-template-columns: 1fr;
  }
}
</style>