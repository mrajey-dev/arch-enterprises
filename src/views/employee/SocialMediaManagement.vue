<template>
  <div class="layout">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="social-board-premium" :class="{ 'mobile-view': isMobile, 'expanded-content': isMobile && !isSidebarVisible }">
        
        <!-- 🌟 Header Section -->
        <header class="hub-header-card">
          <div class="header-left">
            <div class="hub-icon-box">
              <i class="fas fa-share-alt"></i>
            </div>
            <div class="hub-title-info">
              <div class="breadcrumb-trail">
                <span @click="goTo('employee/dashboard')" class="crumb-link">Dashboard</span>
                <i class="fas fa-chevron-right crumb-sep"></i>
                <span class="crumb-current">Social Media Hub</span>
              </div>
              <div class="hub-title-row">
                <h2>Social Media Management</h2>
                <span class="hub-status-pill"><span class="dot-pulse"></span> Active Vault</span>
              </div>
              <p class="hub-subtitle">
                Centralized vault for all brand accounts, credentials, handles, channel performance &amp; 2FA credentials
              </p>
            </div>
          </div>

          <div class="header-right">
            <button class="btn-export" @click="fetchAccounts" :disabled="loading" title="Refresh & Sync with Server">
              <i class="fas fa-rotate" :class="{ 'fa-spin': loading }"></i>
              <span class="btn-text">{{ loading ? 'Syncing...' : 'Sync DB' }}</span>
            </button>
            <button class="btn-export" @click="exportToCSV" title="Export as CSV">
              <i class="fas fa-file-csv"></i>
              <span class="btn-text">Export</span>
            </button>
            <button class="btn-add-primary" @click="openAddModal">
              <i class="fas fa-plus"></i>
              <span>Add Account</span>
            </button>
            <button class="btn-back-dashboard" @click="goTo('employee/dashboard')">
              <i class="fas fa-arrow-left"></i>
              <span class="btn-text">Dashboard</span>
            </button>
          </div>
        </header>

        <!-- 📊 KPI Metrics Row -->
        <div class="kpi-metrics-row">
          <div class="kpi-card" @click="activePlatformFilter = 'all'">
            <div class="kpi-icon-wrap indigo">
              <i class="fas fa-hashtag"></i>
            </div>
            <div class="kpi-data">
              <span class="kpi-count">{{ accounts.length }}</span>
              <span class="kpi-name">Total Accounts</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrap rose">
              <i class="fas fa-users"></i>
            </div>
            <div class="kpi-data">
              <span class="kpi-count">{{ totalAudienceFormatted }}</span>
              <span class="kpi-name">Total Audience</span>
            </div>
          </div>

          <div class="kpi-card" @click="activeStatusFilter = 'Active'">
            <div class="kpi-icon-wrap emerald">
              <i class="fas fa-circle-check"></i>
            </div>
            <div class="kpi-data">
              <span class="kpi-count">{{ activeAccountsCount }}</span>
              <span class="kpi-name">Active Channels</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrap amber">
              <i class="fas fa-shield-halved"></i>
            </div>
            <div class="kpi-data">
              <span class="kpi-count">{{ twoFaCount }} / {{ accounts.length }}</span>
              <span class="kpi-name">2FA Protected</span>
            </div>
          </div>
        </div>

        <!-- 🏷️ Platform Quick Filter Tabs -->
        <div class="platform-tabs-scroll">
          <div class="platform-tabs-bar">
            <button 
              class="platform-tab-btn" 
              :class="{ active: activePlatformFilter === 'all' }"
              @click="activePlatformFilter = 'all'"
            >
              <i class="fas fa-globe"></i>
              <span>All Platforms</span>
              <span class="tab-badge">{{ accounts.length }}</span>
            </button>

            <button 
              v-for="p in platformList" 
              :key="p.id"
              class="platform-tab-btn"
              :class="[p.cssClass, { active: activePlatformFilter === p.id }]"
              @click="activePlatformFilter = p.id"
            >
              <i :class="p.icon"></i>
              <span>{{ p.name }}</span>
              <span class="tab-badge" v-if="getPlatformCount(p.id) > 0">{{ getPlatformCount(p.id) }}</span>
            </button>
          </div>
        </div>

        <!-- 🔍 Controls & Search Toolbar -->
        <div class="toolbar-card">
          <div class="toolbar-left">
            <div class="search-input-wrap">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search by account name, handle, email, platform, or manager..."
                class="search-input"
              />
              <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Status Filter Dropdown -->
            <div class="filter-select-wrap">
              <label class="filter-lbl"><i class="fas fa-filter"></i></label>
              <select v-model="activeStatusFilter" class="filter-select">
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <!-- Category Filter Dropdown -->
            <div class="filter-select-wrap">
              <label class="filter-lbl"><i class="fas fa-tag"></i></label>
              <select v-model="activeCategoryFilter" class="filter-select">
                <option value="all">All Categories</option>
                <option value="Primary Brand">Primary Brand</option>
                <option value="Product & Demos">Product &amp; Demos</option>
                <option value="Corporate & Careers">Corporate &amp; Careers</option>
                <option value="Campaign & Culture">Campaign &amp; Culture</option>
                <option value="Announcements">Announcements</option>
                <option value="Regional">Regional / Branch</option>
              </select>
            </div>
          </div>

          <div class="toolbar-right">
            <!-- View Mode Switcher -->
            <div class="view-mode-toggle">
              <button 
                class="mode-btn" 
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'" 
                title="Grid Cards View"
              >
                <i class="fas fa-th-large"></i>
              </button>
              <button 
                class="mode-btn" 
                :class="{ active: viewMode === 'table' }"
                @click="viewMode = 'table'" 
                title="Table Spreadsheet View"
              >
                <i class="fas fa-table-list"></i>
              </button>
            </div>

            <!-- Show / Hide All Passwords Toggle -->
            <button 
              class="btn-toggle-passwords" 
              @click="toggleGlobalPasswordVisibility"
              :title="showAllPasswords ? 'Mask all passwords' : 'Show all passwords'"
            >
              <i :class="showAllPasswords ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              <span>{{ showAllPasswords ? 'Mask Passwords' : 'Show Passwords' }}</span>
            </button>
          </div>
        </div>

        <!-- ⚠️ Empty State -->
        <div v-if="filteredAccounts.length === 0" class="empty-state-card">
          <div class="empty-icon-wrap">
            <i class="fas fa-share-nodes"></i>
          </div>
          <h3>No Social Media Accounts Found</h3>
          <p v-if="searchQuery || activePlatformFilter !== 'all' || activeStatusFilter !== 'all' || activeCategoryFilter !== 'all'">
            No records matched your current filters. Try resetting your search or filters.
          </p>
          <p v-else>You haven't added any social media accounts yet.</p>
          <div class="empty-actions">
            <button v-if="searchQuery || activePlatformFilter !== 'all' || activeStatusFilter !== 'all' || activeCategoryFilter !== 'all'" class="btn-secondary" @click="resetFilters">
              <i class="fas fa-rotate-left"></i> Reset Filters
            </button>
            <button class="btn-add-primary" @click="openAddModal">
              <i class="fas fa-plus"></i> Add First Account
            </button>
          </div>
        </div>

        <!-- 📱 VIEW 1: GRID CARDS -->
        <div v-else-if="viewMode === 'grid'" class="accounts-grid">
          <div 
            v-for="acc in filteredAccounts" 
            :key="acc.id" 
            class="account-card"
            :class="[getPlatformCardClass(acc.platform), { 'has-alert': acc.status === 'Needs Review' }]"
          >
            <!-- Card Header -->
            <div class="card-top-banner">
              <div class="platform-badge-group">
                <div class="platform-icon-circle">
                  <i :class="getPlatformIcon(acc.platform)"></i>
                </div>
                <div class="platform-meta">
                  <span class="platform-label">{{ acc.platform }}</span>
                  <span class="category-pill">{{ acc.category || 'General' }}</span>
                </div>
              </div>

              <div class="card-status-pill" :class="getStatusBadgeClass(acc.status)">
                <span class="status-dot"></span>
                <span>{{ acc.status }}</span>
              </div>
            </div>

            <!-- Account Main Info -->
            <div class="account-profile-block">
              <div class="account-title-wrap">
                <h3 class="account-name" :title="acc.name">{{ acc.name }}</h3>
                <div class="account-handle-row">
                  <span class="account-handle">{{ formatHandle(acc.handle) }}</span>
                  <a 
                    v-if="acc.profile_url" 
                    :href="acc.profile_url" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="visit-link" 
                    title="Open live channel / profile"
                  >
                    <i class="fas fa-arrow-up-right-from-square"></i>
                  </a>
                </div>
              </div>

              <div class="audience-pill" v-if="acc.followers">
                <i class="fas fa-chart-simple"></i>
                <span><strong>{{ acc.followers }}</strong> Followers / Subs</span>
              </div>
            </div>

            <!-- Credentials Box -->
            <div class="credentials-vault-box">
              <div class="vault-box-header">
                <span class="vault-lbl"><i class="fas fa-key"></i> Login Credentials</span>
                <span class="two-fa-tag" :class="acc.two_factor ? 'tag-enabled' : 'tag-disabled'">
                  <i :class="acc.two_factor ? 'fas fa-shield-check' : 'fas fa-shield-exclamation'"></i>
                  {{ acc.two_factor ? '2FA Active' : '2FA Off' }}
                </span>
              </div>

              <!-- Username / Email -->
              <div class="cred-row">
                <span class="cred-label">Login ID:</span>
                <div class="cred-value-wrap">
                  <span class="cred-text" :title="acc.username">{{ acc.username }}</span>
                  <button 
                    class="btn-copy-mini" 
                    @click="copyText(acc.username, 'Login ID')" 
                    title="Copy Login ID"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>

              <!-- Password Row -->
              <div class="cred-row">
                <span class="cred-label">Password:</span>
                <div class="cred-value-wrap">
                  <span class="cred-text password-font">
                    {{ isPasswordVisible(acc.id) ? acc.password : '••••••••••••' }}
                  </span>
                  <div class="cred-actions-group">
                    <button 
                      class="btn-eye-mini" 
                      @click="togglePasswordVisibility(acc.id)"
                      :title="isPasswordVisible(acc.id) ? 'Hide password' : 'Show password'"
                    >
                      <i :class="isPasswordVisible(acc.id) ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                    <button 
                      class="btn-copy-mini" 
                      @click="copyText(acc.password, 'Password')" 
                      title="Copy Password"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Footer & Meta Info -->
            <div class="card-meta-footer">
              <div class="manager-info" v-if="acc.manager">
                <i class="fas fa-user-gear"></i>
                <span>Managed by: <strong>{{ acc.manager }}</strong></span>
              </div>
              <div class="notes-preview" v-if="acc.notes" :title="acc.notes">
                <i class="fas fa-info-circle"></i>
                <span>{{ acc.notes }}</span>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="card-footer-actions">
              <button class="btn-card-action view" @click="openIntelModal(acc)">
                <i class="fas fa-circle-info"></i> Intel
              </button>
              <button class="btn-card-action edit" @click="openEditModal(acc)">
                <i class="fas fa-pen-to-square"></i> Edit
              </button>
              <button class="btn-card-action delete" @click="confirmDelete(acc)">
                <i class="fas fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 📊 VIEW 2: TABLE SPREADSHEET -->
        <div v-else class="accounts-table-card">
          <div class="table-responsive">
            <table class="social-table">
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Platform</th>
                  <th>Account Name &amp; Handle</th>
                  <th>Login Username / Email</th>
                  <th>Password</th>
                  <th>Followers</th>
                  <th>2FA Status</th>
                  <th>Managed By</th>
                  <th>Status</th>
                  <th style="width: 140px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(acc, index) in filteredAccounts" :key="acc.id">
                  <td class="text-muted">{{ index + 1 }}</td>
                  <td>
                    <div class="table-platform-cell">
                      <div class="platform-icon-mini" :class="getPlatformIconClass(acc.platform)">
                        <i :class="getPlatformIcon(acc.platform)"></i>
                      </div>
                      <span class="platform-name-txt">{{ acc.platform }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="table-account-cell">
                      <strong>{{ acc.name }}</strong>
                      <div class="table-handle-link">
                        <span>{{ formatHandle(acc.handle) }}</span>
                        <a v-if="acc.profile_url" :href="acc.profile_url" target="_blank" rel="noopener noreferrer">
                          <i class="fas fa-external-link-alt"></i>
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="table-copyable-cell">
                      <span>{{ acc.username }}</span>
                      <button class="btn-copy-tiny" @click="copyText(acc.username, 'Login ID')" title="Copy Login ID">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div class="table-copyable-cell">
                      <span class="password-font">{{ isPasswordVisible(acc.id) ? acc.password : '••••••••••••' }}</span>
                      <button class="btn-copy-tiny" @click="togglePasswordVisibility(acc.id)" title="Toggle view">
                        <i :class="isPasswordVisible(acc.id) ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                      <button class="btn-copy-tiny" @click="copyText(acc.password, 'Password')" title="Copy Password">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                  </td>
                  <td>
                    <span class="followers-pill">{{ acc.followers || '-' }}</span>
                  </td>
                  <td>
                    <span class="two-fa-badge" :class="acc.two_factor ? 'is-active' : 'is-inactive'">
                      <i :class="acc.two_factor ? 'fas fa-shield-check' : 'fas fa-triangle-exclamation'"></i>
                      {{ acc.two_factor ? 'Enabled' : 'Disabled' }}
                    </span>
                  </td>
                  <td>
                    <span class="manager-tag">{{ acc.manager || 'Unassigned' }}</span>
                  </td>
                  <td>
                    <span class="card-status-pill table-status" :class="getStatusBadgeClass(acc.status)">
                      {{ acc.status }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions-cell">
                      <button class="btn-table-action info" @click="openIntelModal(acc)" title="View Details">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-table-action edit" @click="openEditModal(acc)" title="Edit Account">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-table-action delete" @click="confirmDelete(acc)" title="Delete Account">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- 📝 MODAL: ADD / EDIT SOCIAL MEDIA ACCOUNT                  -->
        <!-- ========================================================= -->
        <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
          <div class="modal-card animate-scale-up">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge" :class="getPlatformIconClass(form.platform)">
                  <i :class="getPlatformIcon(form.platform)"></i>
                </div>
                <div>
                  <h3>{{ isEditing ? 'Edit Social Media Account' : 'Add Social Media Account' }}</h3>
                  <p class="modal-sub">Secure credentials &amp; channel registry</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="closeFormModal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <form @submit.prevent="saveAccount" class="modal-form-body">
              <div class="form-grid">
                <!-- Platform Selection -->
                <div class="form-group col-span-2">
                  <label class="input-label">Social Media Platform *</label>
                  <div class="platform-radio-grid">
                    <label 
                      v-for="p in platformOptions" 
                      :key="p.id" 
                      class="platform-radio-card"
                      :class="{ selected: form.platform === p.name }"
                    >
                      <input 
                        type="radio" 
                        v-model="form.platform" 
                        :value="p.name" 
                        required 
                        class="hidden-radio"
                      />
                      <i :class="p.icon"></i>
                      <span>{{ p.name }}</span>
                    </label>
                  </div>
                </div>

                <!-- Account Display Name -->
                <div class="form-group">
                  <label class="input-label">Account Display Name *</label>
                  <input 
                    type="text" 
                    v-model="form.name" 
                    placeholder="e.g. Arch Enterprises Official" 
                    required 
                    class="form-control"
                  />
                </div>

                <!-- Handle / Channel ID -->
                <div class="form-group">
                  <label class="input-label">Account Handle / URL Slug *</label>
                  <div class="input-prefix-wrap">
                    <span class="prefix-symbol">@</span>
                    <input 
                      type="text" 
                      v-model="form.handle" 
                      placeholder="archenterprises" 
                      required 
                      class="form-control with-prefix"
                    />
                  </div>
                </div>

                <!-- Login Username / Email -->
                <div class="form-group">
                  <label class="input-label">Login Username or Email *</label>
                  <input 
                    type="text" 
                    v-model="form.username" 
                    placeholder="e.g. social@archenterprises.co.in" 
                    required 
                    class="form-control"
                  />
                </div>

                <!-- Password with Generator -->
                <div class="form-group">
                  <div class="label-with-action">
                    <label class="input-label">Account Password *</label>
                    <button type="button" class="btn-link-action" @click="generateStrongPassword">
                      <i class="fas fa-dice"></i> Generate Strong
                    </button>
                  </div>
                  <div class="input-with-tools">
                    <input 
                      :type="showModalPassword ? 'text' : 'password'" 
                      v-model="form.password" 
                      placeholder="Enter secure password" 
                      required 
                      class="form-control password-font"
                    />
                    <button 
                      type="button" 
                      class="tool-btn" 
                      @click="showModalPassword = !showModalPassword"
                      :title="showModalPassword ? 'Hide password' : 'Show password'"
                    >
                      <i :class="showModalPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- Channel / Profile Link -->
                <div class="form-group col-span-2">
                  <label class="input-label">Live Profile / Channel URL</label>
                  <input 
                    type="url" 
                    v-model="form.profile_url" 
                    placeholder="https://www.instagram.com/archenterprises" 
                    class="form-control"
                  />
                </div>

                <!-- Category -->
                <div class="form-group">
                  <label class="input-label">Account Category</label>
                  <select v-model="form.category" class="form-control">
                    <option value="Primary Brand">Primary Brand</option>
                    <option value="Product & Demos">Product &amp; Demos</option>
                    <option value="Corporate & Careers">Corporate &amp; Careers</option>
                    <option value="Campaign & Culture">Campaign &amp; Culture</option>
                    <option value="Announcements">Announcements</option>
                    <option value="Regional">Regional / Branch</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <!-- Audience / Followers -->
                <div class="form-group">
                  <label class="input-label">Followers / Subscriber Count</label>
                  <input 
                    type="text" 
                    v-model="form.followers" 
                    placeholder="e.g. 24.5K, 120K" 
                    class="form-control"
                  />
                </div>

                <!-- Managed By -->
                <div class="form-group">
                  <label class="input-label">Managed By / Department</label>
                  <input 
                    type="text" 
                    v-model="form.manager" 
                    placeholder="e.g. Marketing Lead, Video Editor" 
                    class="form-control"
                  />
                </div>

                <!-- Status -->
                <div class="form-group">
                  <label class="input-label">Channel Status</label>
                  <select v-model="form.status" class="form-control">
                    <option value="Active">Active</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <!-- 2FA Protection Toggle -->
                <div class="form-group col-span-2 checkbox-group-card">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="form.two_factor" class="custom-checkbox" />
                    <div class="checkbox-text">
                      <strong>Two-Factor Authentication (2FA) Active</strong>
                      <span>Account is protected with SMS, Authenticator app or backup security codes</span>
                    </div>
                  </label>
                </div>

                <!-- Recovery Details / 2FA Note -->
                <div class="form-group col-span-2" v-if="form.two_factor">
                  <label class="input-label">Recovery Phone / Authenticator Method</label>
                  <input 
                    type="text" 
                    v-model="form.recovery_info" 
                    placeholder="e.g. OTP sent to +91 98765-XXXXX / Google Authenticator on Office Phone" 
                    class="form-control"
                  />
                </div>

                <!-- Internal Notes / Guidelines -->
                <div class="form-group col-span-2">
                  <label class="input-label">Account Notes &amp; Guidelines</label>
                  <textarea 
                    v-model="form.notes" 
                    rows="3" 
                    placeholder="e.g. Content requires approval from Marketing Lead before publishing. Password changed every quarter."
                    class="form-control textarea-field"
                  ></textarea>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="modal-footer">
                <button type="button" class="btn-cancel" @click="closeFormModal" :disabled="saving">Cancel</button>
                <button type="submit" class="btn-submit" :disabled="saving">
                  <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                  <span>{{ saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Register Account') }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- 🔍 MODAL: ACCOUNT INTEL DETAILS                          -->
        <!-- ========================================================= -->
        <div v-if="showIntelModal && selectedIntelAccount" class="modal-overlay" @click.self="showIntelModal = false">
          <div class="modal-card intel-modal animate-scale-up">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge" :class="getPlatformIconClass(selectedIntelAccount.platform)">
                  <i :class="getPlatformIcon(selectedIntelAccount.platform)"></i>
                </div>
                <div>
                  <h3>{{ selectedIntelAccount.name }}</h3>
                  <p class="modal-sub">{{ selectedIntelAccount.platform }} &bull; {{ formatHandle(selectedIntelAccount.handle) }}</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="showIntelModal = false">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="intel-body">
              <div class="intel-grid">
                <div class="intel-tile">
                  <span class="intel-lbl">Platform</span>
                  <span class="intel-val"><strong>{{ selectedIntelAccount.platform }}</strong></span>
                </div>
                <div class="intel-tile">
                  <span class="intel-lbl">Status</span>
                  <span class="intel-val" :class="getStatusBadgeClass(selectedIntelAccount.status)">
                    {{ selectedIntelAccount.status }}
                  </span>
                </div>
                <div class="intel-tile">
                  <span class="intel-lbl">Audience / Followers</span>
                  <span class="intel-val">{{ selectedIntelAccount.followers || 'N/A' }}</span>
                </div>
                <div class="intel-tile">
                  <span class="intel-lbl">Category</span>
                  <span class="intel-val">{{ selectedIntelAccount.category || 'General' }}</span>
                </div>
                <div class="intel-tile col-span-2">
                  <span class="intel-lbl">Login Username / Email</span>
                  <div class="intel-copy-row">
                    <span class="intel-val"><code>{{ selectedIntelAccount.username }}</code></span>
                    <button class="btn-copy-mini" @click="copyText(selectedIntelAccount.username, 'Login ID')">
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
                <div class="intel-tile col-span-2">
                  <span class="intel-lbl">Password</span>
                  <div class="intel-copy-row">
                    <span class="intel-val password-font">
                      <code>{{ isPasswordVisible(selectedIntelAccount.id) ? selectedIntelAccount.password : '••••••••••••' }}</code>
                    </span>
                    <div class="cred-actions-group">
                      <button class="btn-eye-mini" @click="togglePasswordVisibility(selectedIntelAccount.id)">
                        <i :class="isPasswordVisible(selectedIntelAccount.id) ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                      <button class="btn-copy-mini" @click="copyText(selectedIntelAccount.password, 'Password')">
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="intel-tile col-span-2" v-if="selectedIntelAccount.profile_url">
                  <span class="intel-lbl">Live Channel / Profile URL</span>
                  <a :href="selectedIntelAccount.profile_url" target="_blank" rel="noopener noreferrer" class="intel-url-link">
                    {{ selectedIntelAccount.profile_url }} <i class="fas fa-external-link-alt"></i>
                  </a>
                </div>
                <div class="intel-tile col-span-2">
                  <span class="intel-lbl">Two-Factor Security (2FA)</span>
                  <span class="intel-val">
                    <i :class="selectedIntelAccount.two_factor ? 'fas fa-shield-check text-success' : 'fas fa-shield-xmark text-danger'"></i>
                    {{ selectedIntelAccount.two_factor ? '2FA Active & Protected' : 'Not configured (High Risk)' }}
                  </span>
                  <small v-if="selectedIntelAccount.recovery_info" class="intel-hint">
                    Recovery: {{ selectedIntelAccount.recovery_info }}
                  </small>
                </div>
                <div class="intel-tile col-span-2" v-if="selectedIntelAccount.notes">
                  <span class="intel-lbl">Internal Notes</span>
                  <p class="intel-notes-box">{{ selectedIntelAccount.notes }}</p>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="openEditModal(selectedIntelAccount); showIntelModal = false">
                <i class="fas fa-edit"></i> Edit Credentials
              </button>
              <button class="btn-cancel" @click="showIntelModal = false">Close</button>
            </div>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- 🗑️ MODAL: DELETE CONFIRMATION                              -->
        <!-- ========================================================= -->
        <div v-if="showDeleteModal && accountToDelete" class="modal-overlay" @click.self="showDeleteModal = false">
          <div class="modal-card delete-modal animate-scale-up">
            <div class="delete-icon-box">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            <h3>Delete Account Record?</h3>
            <p class="delete-warning">
              Are you sure you want to remove <strong>{{ accountToDelete.name }}</strong> ({{ accountToDelete.platform }})? This action cannot be undone.
            </p>
            <div class="modal-footer justify-center">
              <button class="btn-cancel" @click="showDeleteModal = false" :disabled="deleting">Cancel</button>
              <button class="btn-danger" @click="executeDelete" :disabled="deleting">
                <i class="fas" :class="deleting ? 'fa-spinner fa-spin' : 'fa-trash-alt'"></i>
                <span>{{ deleting ? 'Deleting...' : 'Confirm Delete' }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Sidebar from "./components/Sidebar.vue";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast.js";

const STORAGE_KEY = "arch_social_media_accounts";

const INITIAL_SAMPLE_ACCOUNTS = [
  {
    id: 1,
    platform: "Instagram",
    name: "Arch Enterprises Official",
    handle: "@archenterprises_official",
    username: "social@archenterprises.co.in",
    password: "Arch@Instagram#2026",
    profile_url: "https://www.instagram.com/archenterprises_official",
    category: "Primary Brand",
    followers: "24.5K",
    manager: "Marketing Lead",
    status: "Active",
    two_factor: true,
    recovery_info: "Authenticator App + +91 98765-43210",
    notes: "Main brand Instagram for product launches, stories, and engineering reels.",
    created_at: "2025-01-10"
  },
  {
    id: 2,
    platform: "YouTube",
    name: "Arch Enterprises 360",
    handle: "@ArchEnterprises360",
    username: "youtube.media@archenterprises.co.in",
    password: "Arch@YT2026!Secure",
    profile_url: "https://www.youtube.com/@ArchEnterprises360",
    category: "Product & Demos",
    followers: "12.8K",
    manager: "Video Editor",
    status: "Active",
    two_factor: true,
    recovery_info: "Google Workspace 2FA with Titan Security Key",
    notes: "Upload engine demo videos, fire pump walkthroughs, and safety tutorials.",
    created_at: "2025-01-12"
  },
  {
    id: 3,
    platform: "Facebook",
    name: "Arch Enterprises India",
    handle: "ArchEnterprisesIndia",
    username: "fb.admin@archenterprises.co.in",
    password: "Fb#ArchIndia2026",
    profile_url: "https://www.facebook.com/ArchEnterprisesIndia",
    category: "Corporate & Careers",
    followers: "45.2K",
    manager: "Marketing Team",
    status: "Active",
    two_factor: true,
    recovery_info: "SMS to Marketing Lead + Backup Codes in Secure Vault",
    notes: "Business page linked to Meta Business Suite for regional targeted ad campaigns.",
    created_at: "2025-02-01"
  },
  {
    id: 4,
    platform: "LinkedIn",
    name: "Arch Enterprises Pvt Ltd",
    handle: "arch-enterprises-pvt-ltd",
    username: "corp.linkedin@archenterprises.co.in",
    password: "LIn#Corporate2026$",
    profile_url: "https://www.linkedin.com/company/arch-enterprises-pvt-ltd",
    category: "Corporate & Careers",
    followers: "18.6K",
    manager: "HR & Marketing",
    status: "Active",
    two_factor: true,
    recovery_info: "Authenticator App on Admin Phone",
    notes: "Corporate announcements, employee highlights, hiring drives, and executive thought leadership.",
    created_at: "2025-02-15"
  },
  {
    id: 5,
    platform: "Snapchat",
    name: "Arch Daily & BTS",
    handle: "arch_daily",
    username: "snap.media@archenterprises.co.in",
    password: "Snap#ArchCulture26",
    profile_url: "https://www.snapchat.com/add/arch_daily",
    category: "Campaign & Culture",
    followers: "8.2K",
    manager: "Social Media Executive",
    status: "Active",
    two_factor: false,
    recovery_info: "Phone OTP verification pending",
    notes: "Behind the scenes content, factory tour snaps, and workplace culture spotlights.",
    created_at: "2025-03-01"
  },
  {
    id: 6,
    platform: "Twitter / X",
    name: "Arch Enterprises Press",
    handle: "@Arch_Enterprises",
    username: "press.x@archenterprises.co.in",
    password: "X_ArchCorp2026!",
    profile_url: "https://x.com/Arch_Enterprises",
    category: "Announcements",
    followers: "9.4K",
    manager: "PR Lead",
    status: "Active",
    two_factor: true,
    recovery_info: "Security Key + Backup Authenticator",
    notes: "Official press releases, customer service responses, and technical news.",
    created_at: "2025-03-05"
  },
  {
    id: 7,
    platform: "Pinterest",
    name: "Arch Design & Industrial Architecture",
    handle: "archenterprises",
    username: "design.pin@archenterprises.co.in",
    password: "Pin#ArchDesign26",
    profile_url: "https://www.pinterest.com/archenterprises",
    category: "Product & Demos",
    followers: "3.4K",
    manager: "Design Team",
    status: "Needs Review",
    two_factor: false,
    recovery_info: "Needs email re-verification",
    notes: "Industrial installation inspiration, equipment architecture boards, blueprints.",
    created_at: "2025-03-10"
  },
  {
    id: 8,
    platform: "Threads",
    name: "Arch Threads",
    handle: "@archenterprises_official",
    username: "social@archenterprises.co.in",
    password: "Arch@Instagram#2026",
    profile_url: "https://www.threads.net/@archenterprises_official",
    category: "Campaign & Culture",
    followers: "5.1K",
    manager: "Marketing Lead",
    status: "Active",
    two_factor: true,
    recovery_info: "Synced with Instagram Meta 2FA",
    notes: "Fast community engagement, engineering polls, and industry discussion threads.",
    created_at: "2025-03-12"
  }
];

export default {
  name: "SocialMediaManagement",
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      accounts: [],
      loading: false,
      saving: false,
      deleting: false,
      searchQuery: "",
      activePlatformFilter: "all",
      activeStatusFilter: "all",
      activeCategoryFilter: "all",
      viewMode: "grid", // 'grid' | 'table'
      showAllPasswords: false,
      visiblePasswordsMap: {},

      // Modals
      showFormModal: false,
      isEditing: false,
      showModalPassword: false,
      showIntelModal: false,
      selectedIntelAccount: null,
      showDeleteModal: false,
      accountToDelete: null,

      // Form State
      form: {
        id: null,
        platform: "Instagram",
        name: "",
        handle: "",
        username: "",
        password: "",
        profile_url: "",
        category: "Primary Brand",
        followers: "",
        manager: "",
        status: "Active",
        two_factor: true,
        recovery_info: "",
        notes: ""
      },

      platformOptions: [
        { id: "instagram", name: "Instagram", icon: "fab fa-instagram" },
        { id: "youtube", name: "YouTube", icon: "fab fa-youtube" },
        { id: "facebook", name: "Facebook", icon: "fab fa-facebook-f" },
        { id: "linkedin", name: "LinkedIn", icon: "fab fa-linkedin-in" },
        { id: "snapchat", name: "Snapchat", icon: "fab fa-snapchat" },
        { id: "x", name: "Twitter / X", icon: "fab fa-x-twitter" },
        { id: "threads", name: "Threads", icon: "fab fa-threads" },
        { id: "pinterest", name: "Pinterest", icon: "fab fa-pinterest-p" },
        { id: "tiktok", name: "TikTok", icon: "fab fa-tiktok" },
        { id: "other", name: "Other", icon: "fas fa-share-nodes" }
      ],

      platformList: [
        { id: "Instagram", name: "Instagram", icon: "fab fa-instagram", cssClass: "tab-instagram" },
        { id: "YouTube", name: "YouTube", icon: "fab fa-youtube", cssClass: "tab-youtube" },
        { id: "Facebook", name: "Facebook", icon: "fab fa-facebook-f", cssClass: "tab-facebook" },
        { id: "LinkedIn", name: "LinkedIn", icon: "fab fa-linkedin-in", cssClass: "tab-linkedin" },
        { id: "Snapchat", name: "Snapchat", icon: "fab fa-snapchat", cssClass: "tab-snapchat" },
        { id: "Twitter / X", name: "X (Twitter)", icon: "fab fa-x-twitter", cssClass: "tab-x" },
        { id: "Threads", name: "Threads", icon: "fab fa-threads", cssClass: "tab-threads" },
        { id: "Pinterest", name: "Pinterest", icon: "fab fa-pinterest-p", cssClass: "tab-pinterest" }
      ]
    };
  },

  computed: {
    totalAudienceFormatted() {
      let total = 0;
      this.accounts.forEach(acc => {
        if (!acc.followers) return;
        const str = acc.followers.toString().trim().toUpperCase();
        let num = parseFloat(str) || 0;
        if (str.includes("K")) num = num * 1000;
        else if (str.includes("M")) num = num * 1000000;
        total += num;
      });

      if (total >= 1000000) return (total / 1000000).toFixed(1) + "M";
      if (total >= 1000) return (total / 1000).toFixed(1) + "K";
      return total.toString();
    },

    activeAccountsCount() {
      return this.accounts.filter(a => a.status === "Active").length;
    },

    twoFaCount() {
      return this.accounts.filter(a => a.two_factor).length;
    },

    filteredAccounts() {
      let list = [...this.accounts];

      // Platform filter
      if (this.activePlatformFilter !== "all") {
        list = list.filter(a => a.platform === this.activePlatformFilter);
      }

      // Status filter
      if (this.activeStatusFilter !== "all") {
        list = list.filter(a => a.status === this.activeStatusFilter);
      }

      // Category filter
      if (this.activeCategoryFilter !== "all") {
        list = list.filter(a => a.category === this.activeCategoryFilter);
      }

      // Search query
      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(a =>
          (a.name && a.name.toLowerCase().includes(q)) ||
          (a.handle && a.handle.toLowerCase().includes(q)) ||
          (a.username && a.username.toLowerCase().includes(q)) ||
          (a.platform && a.platform.toLowerCase().includes(q)) ||
          (a.manager && a.manager.toLowerCase().includes(q)) ||
          (a.category && a.category.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q))
        );
      }

      return list;
    }
  },

  mounted() {
    this.checkIfMobile();
    window.addEventListener("resize", this.checkIfMobile);
    this.fetchAccounts();
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.checkIfMobile);
  },

  methods: {
    goTo(route) {
      this.$router.push("/" + route);
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 992;
      this.isSidebarVisible = !this.isMobile;
    },

    getApiBase() {
      if (typeof window !== "undefined" && window.location.origin.includes("employees.archenterprises.co.in")) {
        return `${window.location.origin}/api/api`;
      }
      return "https://employees.archenterprises.co.in/api/api";
    },

    getAuthHeaders() {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    async fetchAccounts() {
      this.loading = true;
      try {
        const res = await axios.get(`${this.getApiBase()}/social-media-accounts`, {
          headers: this.getAuthHeaders()
        });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          this.accounts = res.data.data;
          this.saveAccountsToStorage();
        } else if (Array.isArray(res.data)) {
          this.accounts = res.data;
          this.saveAccountsToStorage();
        } else {
          this.loadAccountsFromStorage();
        }
      } catch (err) {
        console.warn("Backend API unavailable or offline, loading cached accounts:", err);
        this.loadAccountsFromStorage();
      } finally {
        this.loading = false;
      }
    },

    loadAccountsFromStorage() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.accounts = parsed;
            return;
          }
        }
      } catch (e) {
        console.error("Failed to parse accounts from localStorage", e);
      }

      // Fallback pre-seed
      this.accounts = [...INITIAL_SAMPLE_ACCOUNTS];
      this.saveAccountsToStorage();
    },

    saveAccountsToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.accounts));
      } catch (e) {
        console.error("Failed to save accounts to localStorage", e);
      }
    },

    getPlatformCount(platformName) {
      return this.accounts.filter(a => a.platform === platformName).length;
    },

    formatHandle(handle) {
      if (!handle) return "";
      return handle.startsWith("@") ? handle : `@${handle}`;
    },

    getPlatformIcon(platform) {
      const p = (platform || "").toLowerCase();
      if (p.includes("insta")) return "fab fa-instagram";
      if (p.includes("you") || p.includes("yt")) return "fab fa-youtube";
      if (p.includes("face") || p.includes("fb")) return "fab fa-facebook-f";
      if (p.includes("link")) return "fab fa-linkedin-in";
      if (p.includes("snap")) return "fab fa-snapchat";
      if (p.includes("twit") || p.includes(" x")) return "fab fa-x-twitter";
      if (p.includes("thread")) return "fab fa-threads";
      if (p.includes("pin")) return "fab fa-pinterest-p";
      if (p.includes("tik")) return "fab fa-tiktok";
      return "fas fa-share-nodes";
    },

    getPlatformCardClass(platform) {
      const p = (platform || "").toLowerCase();
      if (p.includes("insta")) return "card-platform-instagram";
      if (p.includes("you")) return "card-platform-youtube";
      if (p.includes("face")) return "card-platform-facebook";
      if (p.includes("link")) return "card-platform-linkedin";
      if (p.includes("snap")) return "card-platform-snapchat";
      if (p.includes("twit") || p.includes(" x")) return "card-platform-x";
      if (p.includes("thread")) return "card-platform-threads";
      if (p.includes("pin")) return "card-platform-pinterest";
      return "card-platform-default";
    },

    getPlatformIconClass(platform) {
      const p = (platform || "").toLowerCase();
      if (p.includes("insta")) return "ico-instagram";
      if (p.includes("you")) return "ico-youtube";
      if (p.includes("face")) return "ico-facebook";
      if (p.includes("link")) return "ico-linkedin";
      if (p.includes("snap")) return "ico-snapchat";
      if (p.includes("twit") || p.includes(" x")) return "ico-x";
      if (p.includes("thread")) return "ico-threads";
      if (p.includes("pin")) return "ico-pinterest";
      return "ico-default";
    },

    getStatusBadgeClass(status) {
      if (status === "Active") return "badge-active";
      if (status === "Needs Review") return "badge-warning";
      return "badge-inactive";
    },

    isPasswordVisible(accId) {
      if (this.showAllPasswords) return true;
      return !!this.visiblePasswordsMap[accId];
    },

    togglePasswordVisibility(accId) {
      this.visiblePasswordsMap = {
        ...this.visiblePasswordsMap,
        [accId]: !this.visiblePasswordsMap[accId]
      };
    },

    toggleGlobalPasswordVisibility() {
      this.showAllPasswords = !this.showAllPasswords;
      if (this.showAllPasswords) {
        toastInfo("All passwords are now visible");
      } else {
        this.visiblePasswordsMap = {};
        toastInfo("Passwords masked");
      }
    },

    async copyText(text, label = "Item") {
      if (!text) {
        toastError("Nothing to copy");
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        toastSuccess(`${label} copied to clipboard!`);
      } catch (err) {
        // Fallback for older browser compatibility
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toastSuccess(`${label} copied!`);
      }
    },

    resetFilters() {
      this.searchQuery = "";
      this.activePlatformFilter = "all";
      this.activeStatusFilter = "all";
      this.activeCategoryFilter = "all";
    },

    openAddModal() {
      this.isEditing = false;
      this.showModalPassword = false;
      this.form = {
        id: null,
        platform: "Instagram",
        name: "",
        handle: "",
        username: "",
        password: "",
        profile_url: "",
        category: "Primary Brand",
        followers: "",
        manager: "",
        status: "Active",
        two_factor: true,
        recovery_info: "",
        notes: ""
      };
      this.showFormModal = true;
    },

    openEditModal(acc) {
      this.isEditing = true;
      this.showModalPassword = false;
      this.form = { ...acc };
      this.showFormModal = true;
    },

    closeFormModal() {
      this.showFormModal = false;
    },

    generateStrongPassword() {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
      let pass = "";
      for (let i = 0; i < 16; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.form.password = pass;
      this.showModalPassword = true;
      toastSuccess("Generated secure password!");
    },

    async saveAccount() {
      if (!this.form.name || !this.form.handle || !this.form.username || !this.form.password) {
        toastError("Please complete all required fields");
        return;
      }

      this.saving = true;
      try {
        if (this.isEditing && this.form.id) {
          const res = await axios.put(
            `${this.getApiBase()}/social-media-accounts/${this.form.id}`,
            this.form,
            { headers: this.getAuthHeaders() }
          );
          if (res.data && res.data.data) {
            const index = this.accounts.findIndex(a => a.id === this.form.id);
            if (index !== -1) {
              this.accounts.splice(index, 1, res.data.data);
            }
          } else {
            const index = this.accounts.findIndex(a => a.id === this.form.id);
            if (index !== -1) {
              this.accounts.splice(index, 1, { ...this.form });
            }
          }
          toastSuccess(`Updated ${this.form.name}`);
        } else {
          const res = await axios.post(
            `${this.getApiBase()}/social-media-accounts`,
            this.form,
            { headers: this.getAuthHeaders() }
          );
          if (res.data && res.data.data) {
            this.accounts.unshift(res.data.data);
          } else {
            const newAcc = {
              ...this.form,
              id: Date.now(),
              created_at: new Date().toISOString().split("T")[0]
            };
            this.accounts.unshift(newAcc);
          }
          toastSuccess(`Registered ${this.form.name}`);
        }

        this.saveAccountsToStorage();
        this.closeFormModal();
      } catch (err) {
        console.error("Error saving account to backend, saving locally:", err);
        if (this.isEditing && this.form.id) {
          const index = this.accounts.findIndex(a => a.id === this.form.id);
          if (index !== -1) {
            this.accounts.splice(index, 1, { ...this.form });
          }
          toastSuccess(`Updated ${this.form.name}`);
        } else {
          const newAcc = {
            ...this.form,
            id: Date.now(),
            created_at: new Date().toISOString().split("T")[0]
          };
          this.accounts.unshift(newAcc);
          toastSuccess(`Registered ${this.form.name}`);
        }
        this.saveAccountsToStorage();
        this.closeFormModal();
      } finally {
        this.saving = false;
      }
    },

    openIntelModal(acc) {
      this.selectedIntelAccount = acc;
      this.showIntelModal = true;
    },

    confirmDelete(acc) {
      this.accountToDelete = acc;
      this.showDeleteModal = true;
    },

    async executeDelete() {
      if (!this.accountToDelete) return;
      const id = this.accountToDelete.id;
      const name = this.accountToDelete.name;
      this.deleting = true;
      try {
        await axios.delete(`${this.getApiBase()}/social-media-accounts/${id}`, {
          headers: this.getAuthHeaders()
        });
        this.accounts = this.accounts.filter(a => a.id !== id);
        this.saveAccountsToStorage();
        toastSuccess(`Deleted ${name}`);
      } catch (err) {
        console.warn("Backend delete error, removing from local storage:", err);
        this.accounts = this.accounts.filter(a => a.id !== id);
        this.saveAccountsToStorage();
        toastSuccess(`Deleted ${name}`);
      } finally {
        this.deleting = false;
        this.showDeleteModal = false;
        this.accountToDelete = null;
      }
    },

    exportToCSV() {
      if (this.accounts.length === 0) {
        toastError("No accounts to export");
        return;
      }

      const headers = ["ID", "Platform", "Name", "Handle", "Username_Email", "Password", "Profile_URL", "Category", "Followers", "Manager", "Status", "Two_Factor", "Recovery_Info", "Notes"];
      const rows = this.accounts.map(a => [
        a.id,
        `"${a.platform || ""}"`,
        `"${(a.name || "").replace(/"/g, '""')}"`,
        `"${(a.handle || "").replace(/"/g, '""')}"`,
        `"${(a.username || "").replace(/"/g, '""')}"`,
        `"${(a.password || "").replace(/"/g, '""')}"`,
        `"${(a.profile_url || "").replace(/"/g, '""')}"`,
        `"${(a.category || "").replace(/"/g, '""')}"`,
        `"${(a.followers || "").replace(/"/g, '""')}"`,
        `"${(a.manager || "").replace(/"/g, '""')}"`,
        `"${(a.status || "").replace(/"/g, '""')}"`,
        a.two_factor ? "Enabled" : "Disabled",
        `"${(a.recovery_info || "").replace(/"/g, '""')}"`,
        `"${(a.notes || "").replace(/"/g, '""')}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `arch_social_media_accounts_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastSuccess("Exported social accounts CSV!");
    }
  }
};
</script>

<style scoped>
/* ──────── Layout & Container ──────── */
.layout {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1e293b;
}

.main-content {
  flex: 1;
  display: flex;
  min-width: 0;
  min-height: 100vh;
}

.social-board-premium {
  flex: 1;
  padding: 1.5rem 2rem 3rem;
  overflow-y: auto;
  min-width: 0;
  transition: all 0.3s ease;
}

.social-board-premium.expanded-content {
  padding: 1rem;
}

/* ──────── Header Card ──────── */
.hub-header-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 18px;
  padding: 1.75rem 2rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.hub-header-card::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -10%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(236, 72, 153, 0.08) 50%, transparent 80%);
  border-radius: 50%;
  pointer-events: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.hub-icon-box {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #ffffff;
  box-shadow: 0 6px 16px rgba(236, 72, 153, 0.35);
  flex-shrink: 0;
}

.breadcrumb-trail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.crumb-link {
  cursor: pointer;
  transition: color 0.2s;
}

.crumb-link:hover {
  color: #38bdf8;
}

.crumb-sep {
  font-size: 0.65rem;
}

.crumb-current {
  color: #cbd5e1;
  font-weight: 500;
}

.hub-title-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.hub-title-row h2 {
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}

.hub-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
}

.dot-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(0.95); opacity: 1; }
}

.hub-subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
  margin: 0.35rem 0 0;
  max-width: 650px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn-export, .btn-back-dashboard {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-export:hover, .btn-back-dashboard:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.btn-add-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border: none;
  color: #ffffff;
  padding: 0.7rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4);
  transition: all 0.2s ease;
}

.btn-add-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5);
}

/* ──────── KPI Row ──────── */
.kpi-metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.25s ease;
  cursor: pointer;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.kpi-icon-wrap {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.kpi-icon-wrap.indigo { background: #e0e7ff; color: #4f46e5; }
.kpi-icon-wrap.rose { background: #ffe4e6; color: #e11d48; }
.kpi-icon-wrap.emerald { background: #d1fae5; color: #059669; }
.kpi-icon-wrap.amber { background: #fef3c7; color: #d97706; }

.kpi-data {
  display: flex;
  flex-direction: column;
}

.kpi-count {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

.kpi-name {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.2rem;
}

/* ──────── Platform Tabs ──────── */
.platform-tabs-scroll {
  overflow-x: auto;
  margin-bottom: 1.25rem;
  padding-bottom: 4px;
}

.platform-tabs-scroll::-webkit-scrollbar {
  height: 5px;
}
.platform-tabs-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.platform-tabs-bar {
  display: inline-flex;
  gap: 0.5rem;
  background: #ffffff;
  padding: 0.4rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.platform-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  padding: 0.55rem 0.95rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.platform-tab-btn:hover {
  background: #f8fafc;
  color: #0f172a;
}

.platform-tab-btn.active {
  background: #0f172a;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
}

.tab-badge {
  background: rgba(100, 116, 139, 0.15);
  color: inherit;
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  font-weight: 700;
}

.platform-tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Specific platform tab hover highlights */
.tab-instagram.active { background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); }
.tab-youtube.active { background: #ff0000; }
.tab-facebook.active { background: #1877f2; }
.tab-linkedin.active { background: #0a66c2; }
.tab-snapchat.active { background: #ffd600; color: #000000; }
.tab-snapchat.active .tab-badge { background: rgba(0,0,0,0.15); color: #000; }
.tab-x.active { background: #000000; }
.tab-threads.active { background: #101010; }
.tab-pinterest.active { background: #bd081c; }

/* ──────── Controls & Toolbar ──────── */
.toolbar-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
  min-width: 320px;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 0.65rem 2.25rem 0.65rem 2.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.88rem;
  background: #f8fafc;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.filter-select-wrap {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 0.6rem;
  height: 38px;
}

.filter-lbl {
  color: #64748b;
  font-size: 0.8rem;
  margin-right: 0.35rem;
}

.filter-select {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.84rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.view-mode-toggle {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
  border: 1px solid #e2e8f0;
}

.mode-btn {
  background: transparent;
  border: none;
  padding: 0.45rem 0.7rem;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.88rem;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.btn-toggle-passwords {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.55rem 0.9rem;
  border-radius: 9px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-passwords:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* ──────── Empty State ──────── */
.empty-state-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px dashed #cbd5e1;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.empty-icon-wrap {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.25rem;
}

.empty-state-card h3 {
  font-size: 1.3rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.empty-state-card p {
  color: #64748b;
  font-size: 0.9rem;
  max-width: 450px;
  margin: 0 auto 1.5rem;
}

.empty-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.65rem 1.1rem;
  border-radius: 9px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

/* ──────── Accounts Grid (Cards) ──────── */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.account-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

/* Platform top accent strips */
.account-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #64748b;
}

.card-platform-instagram::before { background: linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045); }
.card-platform-youtube::before { background: #ff0000; }
.card-platform-facebook::before { background: #1877f2; }
.card-platform-linkedin::before { background: #0a66c2; }
.card-platform-snapchat::before { background: #ffd600; }
.card-platform-x::before { background: #000000; }
.card-platform-threads::before { background: #1e293b; }
.card-platform-pinterest::before { background: #bd081c; }

.card-top-banner {
  padding: 1.25rem 1.25rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.platform-badge-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.platform-icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #ffffff;
  background: #0f172a;
}

.card-platform-instagram .platform-icon-circle { background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); }
.card-platform-youtube .platform-icon-circle { background: #ff0000; }
.card-platform-facebook .platform-icon-circle { background: #1877f2; }
.card-platform-linkedin .platform-icon-circle { background: #0a66c2; }
.card-platform-snapchat .platform-icon-circle { background: #ffd600; color: #000; }
.card-platform-x .platform-icon-circle { background: #000000; }
.card-platform-threads .platform-icon-circle { background: #0f172a; }
.card-platform-pinterest .platform-icon-circle { background: #bd081c; }

.platform-meta {
  display: flex;
  flex-direction: column;
}

.platform-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.category-pill {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
  margin-top: 2px;
}

.card-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.badge-active { background: #dcfce7; color: #15803d; }
.badge-warning { background: #fef3c7; color: #b45309; }
.badge-inactive { background: #f1f5f9; color: #64748b; }

/* Profile Block */
.account-profile-block {
  padding: 0 1.25rem 1rem;
}

.account-title-wrap {
  margin-bottom: 0.5rem;
}

.account-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.2rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-handle-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.account-handle {
  font-size: 0.85rem;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.visit-link {
  color: #3b82f6;
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.visit-link:hover {
  transform: translate(2px, -2px);
}

.audience-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.78rem;
  color: #475569;
}

/* Credentials Box */
.credentials-vault-box {
  background: #f8fafc;
  margin: 0 1.25rem 1rem;
  border-radius: 12px;
  padding: 0.85rem;
  border: 1px solid #e2e8f0;
}

.vault-box-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.vault-lbl {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.two-fa-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-enabled { background: #d1fae5; color: #047857; }
.tag-disabled { background: #fee2e2; color: #b91c1c; }

.cred-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  padding: 0.35rem 0;
  border-bottom: 1px dashed #e2e8f0;
}

.cred-row:last-child {
  border-bottom: none;
}

.cred-label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 65px;
}

.cred-value-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 70%;
}

.cred-text {
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.password-font {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.05em;
}

.cred-actions-group {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.btn-copy-mini, .btn-eye-mini {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.72rem;
  transition: all 0.15s;
}

.btn-copy-mini:hover, .btn-eye-mini:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
}

/* Card Meta Footer */
.card-meta-footer {
  padding: 0 1.25rem 0.85rem;
  font-size: 0.76rem;
  color: #64748b;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.manager-info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.notes-preview {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #94a3b8;
}

/* Card Footer Actions */
.card-footer-actions {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-card-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-card-action.view:hover {
  background: #e0f2fe;
  border-color: #38bdf8;
  color: #0369a1;
}

.btn-card-action.edit:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-card-action.delete {
  flex: 0 0 34px;
  padding: 0;
  height: 32px;
  color: #ef4444;
}

.btn-card-action.delete:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
}

/* ──────── Table View ──────── */
.accounts-table-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.social-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
  text-align: left;
}

.social-table th {
  background: #f8fafc;
  padding: 0.9rem 1rem;
  color: #475569;
  font-weight: 700;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.social-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.social-table tr:hover {
  background: #f8fafc;
}

.table-platform-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.platform-icon-mini {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.9rem;
}

.ico-instagram { background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); }
.ico-youtube { background: #ff0000; }
.ico-facebook { background: #1877f2; }
.ico-linkedin { background: #0a66c2; }
.ico-snapchat { background: #ffd600; color: #000; }
.ico-x { background: #000000; }
.ico-threads { background: #1e293b; }
.ico-pinterest { background: #bd081c; }
.ico-default { background: #475569; }

.table-account-cell {
  display: flex;
  flex-direction: column;
}

.table-handle-link {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.table-handle-link a {
  color: #3b82f6;
  font-size: 0.72rem;
}

.table-copyable-cell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-copy-tiny {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 4px;
  padding: 2px 5px;
  font-size: 0.7rem;
  cursor: pointer;
}

.btn-copy-tiny:hover {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.followers-pill {
  font-weight: 700;
  color: #0f172a;
}

.two-fa-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.two-fa-badge.is-active { background: #dcfce7; color: #166534; }
.two-fa-badge.is-inactive { background: #fee2e2; color: #991b1b; }

.manager-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
}

.table-status {
  padding: 0.2rem 0.5rem;
}

.table-actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-table-action {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-table-action.info:hover { background: #e0f2fe; color: #0284c7; border-color: #38bdf8; }
.btn-table-action.edit:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }
.btn-table-action.delete:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

/* ──────── Modals ──────── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-card.intel-modal { max-width: 580px; }
.modal-card.delete-modal { max-width: 440px; padding: 2rem; text-align: center; }

.animate-scale-up {
  animation: modal-scale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-scale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modal-icon-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #ffffff;
}

.modal-title-wrap h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.modal-sub {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.15rem 0 0;
}

.modal-close-btn {
  background: #f1f5f9;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-form-body {
  padding: 1.5rem 1.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.15rem;
}

.col-span-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.input-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

.label-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-link-action {
  background: transparent;
  border: none;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-link-action:hover {
  text-decoration: underline;
}

.platform-radio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.5rem;
}

.platform-radio-card {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
  background: #f8fafc;
}

.platform-radio-card:hover {
  border-color: #94a3b8;
  background: #ffffff;
}

.platform-radio-card.selected {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
}

.hidden-radio {
  display: none;
}

.form-control {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 0.86rem;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  background: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.input-prefix-wrap {
  display: flex;
  align-items: center;
  position: relative;
}

.prefix-symbol {
  position: absolute;
  left: 10px;
  font-weight: 700;
  color: #64748b;
  font-size: 0.88rem;
}

.with-prefix {
  padding-left: 1.75rem;
}

.input-with-tools {
  position: relative;
  display: flex;
  align-items: center;
}

.tool-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
}

.checkbox-group-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  cursor: pointer;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: #3b82f6;
  cursor: pointer;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  font-size: 0.84rem;
  color: #1e293b;
}

.checkbox-text span {
  font-size: 0.74rem;
  color: #64748b;
  margin-top: 0.15rem;
}

.textarea-field {
  resize: vertical;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 1rem;
}

.modal-footer.justify-center {
  justify-content: center;
}

.btn-cancel {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.65rem 1.15rem;
  border-radius: 9px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  color: #ffffff;
  padding: 0.65rem 1.35rem;
  border-radius: 9px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.btn-danger {
  background: #dc2626;
  color: #ffffff;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 9px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

/* ──────── Intel Modal Details ──────── */
.intel-body {
  padding: 1.5rem 1.75rem;
}

.intel-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.intel-tile {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
}

.intel-lbl {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.intel-val {
  font-size: 0.95rem;
  color: #0f172a;
}

.intel-copy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.2rem;
}

.intel-copy-row code {
  background: #ffffff;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.intel-url-link {
  color: #2563eb;
  font-size: 0.86rem;
  word-break: break-all;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
}

.intel-url-link:hover {
  text-decoration: underline;
}

.intel-notes-box {
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.4;
  white-space: pre-wrap;
}

.intel-hint {
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.3rem;
}

/* ──────── Delete Modal ──────── */
.delete-icon-box {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}

.delete-warning {
  color: #475569;
  font-size: 0.9rem;
  margin: 0.5rem 0 1.5rem;
  line-height: 1.5;
}

/* ──────── Responsive Media Queries ──────── */
@media (max-width: 1024px) {
  .kpi-metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .social-board-premium {
    padding: 1rem;
  }

  .hub-header-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .kpi-metrics-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .toolbar-card {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
    min-width: 100%;
  }

  .filter-select-wrap {
    width: 100%;
    justify-content: space-between;
  }

  .toolbar-right {
    justify-content: space-between;
  }

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .col-span-2 {
    grid-column: span 1;
  }

  .intel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
