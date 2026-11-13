<template>
  <div class="layout">

    <!-- Registration / Edit Modal - Ultra Premium Design -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="showRegister" @click.self="closeRegisterForm()">
        <div class="premium-modal" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="modal-header-premium">
            <div class="header-icon-premium">
              <i :class="isEditMode ? 'fas fa-user-edit' : 'fas fa-user-plus'"></i>
            </div>
            <div class="header-text">
              <h2>{{ isEditMode ? 'Edit Employee' : 'Create New Employee' }}</h2>
              <p>{{ isEditMode ? 'Update employee information' : 'Add a new team member' }}</p>
            </div>
            <button class="close-btn-premium" @click="closeRegisterForm()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body-premium">
            <form @submit.prevent="handleRegister" class="premium-form">
              <div class="form-sections">
                <!-- Personal Information Section -->
                <div class="form-section">
                  <div class="section-title">
                    <i class="fas fa-user-circle"></i>
                    <span>Personal Information</span>
                  </div>
                  <div class="form-row-premium">
                    <div class="form-field">
                      <label>Full Name <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-user field-icon"></i>
                        <input
                          v-model="registerForm.username"
                          placeholder="Enter full name"
                          @input="validateName"
                          :class="{ 'error': nameError }"
                        />
                      </div>
                      <span v-if="nameError" class="field-error">
                        <i class="fas fa-exclamation-circle"></i> Only letters and spaces allowed
                      </span>
                    </div>

                    <div class="form-field">
                      <label>Handle <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-at field-icon"></i>
                        <input
                          v-model="registerForm.handle"
                          placeholder="username_123"
                          maxlength="25"
                          @input="registerForm.handle = registerForm.handle.replace(/[^A-Za-z0-9_]/g, '').slice(0,25)"
                        />
                      </div>
                      <span class="field-hint">Only letters, numbers & underscore</span>
                    </div>

                    <div class="form-field">
                      <label>Email Address <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-envelope field-icon"></i>
                        <input
                          v-model="registerForm.email"
                          type="email"
                          placeholder="employee@company.com"
                          @input="registerForm.email = registerForm.email.trim().toLowerCase()"
                          @blur="checkEmailExists"
                          :class="{ 'error': emailExists && !isEditMode }"
                        />
                      </div>
                      <span v-if="emailExists && !isEditMode" class="field-error">
                        <i class="fas fa-exclamation-circle"></i> Email already registered
                      </span>
                    </div>

                    <div class="form-field" v-if="!isEditMode">
                      <label>Password</label>
                      <div class="password-field-premium">
                        <div class="field-wrapper" style="flex: 1;">
                          <i class="fas fa-lock field-icon"></i>
                          <input
                            :type="showPassword ? 'text' : 'password'"
                            v-model="registerForm.password"
                            readonly
                            placeholder="Auto-generated"
                          />
                        </div>
                        <button type="button" class="icon-btn-premium" @click="togglePasswordVisibility">
                          <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                        </button>
                        <button type="button" class="generate-btn-premium" @click="generatePassword">
                          <i class="fas fa-sync-alt"></i> Generate
                        </button>
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Date of Birth <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-calendar-alt field-icon"></i>
                        <input type="date" v-model="registerForm.birthDate" @change="validateDOB" :class="{ 'error': dobError }" />
                      </div>
                      <span v-if="dobError" class="field-error">
                        <i class="fas fa-exclamation-circle"></i> Age must be 18+ and valid date
                      </span>
                    </div>

                    <div class="form-field">
                      <label>Gender <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-venus-mars field-icon"></i>
                        <select v-model="registerForm.gender">
                          <option value="" disabled>Select gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Blood Group</label>
                      <div class="field-wrapper">
                        <i class="fas fa-tint field-icon"></i>
                        <select v-model="registerForm.bloodGroup">
                          <option value="" disabled>Select blood group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contact Information Section -->
                <div class="form-section">
                  <div class="section-title">
                    <i class="fas fa-address-card"></i>
                    <span>Contact Information</span>
                  </div>
                  <div class="form-row-premium">
                    <div class="form-field full-width">
                      <label>Address <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-map-marker-alt field-icon" style="top: 18px;"></i>
                        <textarea
                          v-model="registerForm.address"
                          placeholder="Enter complete address"
                          rows="3"
                          maxlength="250"
                          @input="checkAddressLength"
                        ></textarea>
                      </div>
                      <div class="char-count" :class="{ 'warning': addressWarning }">
                        {{ registerForm.address.length }}/250 characters
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Primary Contact <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-phone-alt field-icon"></i>
                        <input type="tel" v-model="registerForm.mobile" @input="registerForm.mobile = registerForm.mobile.replace(/[^0-9]/g, '').slice(0,10)" placeholder="10-digit number" />
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Secondary Contact</label>
                      <div class="field-wrapper">
                        <i class="fas fa-phone field-icon"></i>
                        <input type="tel" v-model="registerForm.secondaryContact" @input="registerForm.secondaryContact = registerForm.secondaryContact.replace(/[^0-9]/g, '').slice(0,10)" placeholder="Optional" />
                      </div>
                    </div>

                    <div class="form-field">
                      <label>City <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-city field-icon"></i>
                        <input v-model="registerForm.city" placeholder="City name" maxlength="25" @input="registerForm.city = registerForm.city.replace(/[^A-Za-z\s]/g, '').slice(0,25)" />
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Department <span class="required-star">*</span></label>
                      <div class="field-wrapper">
                        <i class="fas fa-building field-icon"></i>
                        <select v-model="registerForm.department">
                          <option value="" disabled>Select department</option>
                          <option v-for="dept in departments" :key="dept.id" :value="dept.name">
                            {{ dept.name }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Salary</label>
                      <div class="field-wrapper">
                        <i class="fas fa-rupee-sign field-icon"></i>
                        <input 
                          v-model="registerForm.keyResponsibility" 
                          @input="registerForm.keyResponsibility = registerForm.keyResponsibility.replace(/[^0-9]/g, '')" 
                          placeholder="Amount" 
                          type="text"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Documents Section -->
                <div class="form-section" v-if="!isEditMode">
                  <div class="section-title">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Upload Documents</span>
                  </div>
                  <div class="documents-area">
                    <div class="upload-row">
                      <select v-model="selectedDocumentType" class="doc-select">
                        <option disabled value="">Select document type</option>
                        <option value="permanent_address_proof">📄 Permanent Address Proof</option>
                        <option value="aadhaar_card">🆔 Aadhaar Card</option>
                        <option value="education_certificate">🎓 Education Certificate</option>
                        <option value="relevance_letter">📝 Company Relevance Letter</option>
                        <option value="photo">📸 Photograph</option>
                      </select>
                      <label class="upload-btn">
                        <i class="fas fa-folder-open"></i> Choose File
                        <input type="file" @change="handleFileUpload" hidden />
                      </label>
                    </div>
                    
                    <div class="documents-list" v-if="Object.keys(typedDocuments).length > 0">
                      <div v-for="(file, type) in typedDocuments" :key="type" class="doc-item">
                        <i class="fas fa-file-alt"></i>
                        <span>{{ type.replace(/_/g, ' ') }}: {{ file.name }}</span>
                        <button type="button" @click="removeDocument(type)" class="remove-doc-btn">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button type="button" class="btn-cancel-premium" @click="closeRegisterForm()">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="submit" class="btn-submit-premium" :disabled="loading">
                  <span v-if="loading">
                    <i class="fas fa-spinner fa-spin"></i> {{ isEditMode ? 'Updating...' : 'Registering...' }}
                  </span>
                  <span v-else>
                    <i :class="isEditMode ? 'fas fa-save' : 'fas fa-user-plus'"></i>
                    {{ isEditMode ? 'Update Employee' : 'Register Employee' }}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Stationary Fixed Admin Sidebar -->
      <Sidebar ref="sidebarRef" />

      <section class="content">
        <!-- 📱 Mobile Top Header -->
        <div class="mobile-header" v-if="isMobile">
          <div class="mobile-title">
            <i class="fas fa-users-cog"></i>
            <span>Employees</span>
          </div>
          <div class="mobile-header-actions">
            <button class="btn-register-header-sm" @click="openRegisterForm()" title="Register Employee">
              <i class="fas fa-plus"></i>
              <span>Add</span>
            </button>
            <button class="btn-mobile-menu" @click="toggleMobileSidebar" aria-label="Toggle menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <!-- 🏢 Modern Enterprise Top Banner -->
        <header class="emp-top-banner">
          <div class="banner-left">
            <div class="banner-badge-row">
              <span class="portal-badge-pill">
                <span class="pulse-indicator"></span>
                <span>STAFF DIRECTORY</span>
              </span>
              <span class="status-meta-pill">
                <i class="fas" :class="loadingData ? 'fa-circle-notch fa-spin text-primary' : 'fa-users'"></i>
                {{ loadingData ? 'Loading staff...' : users.length + ' Total Staff' }}
              </span>
              <span class="status-meta-pill success" v-if="!loadingData">
                <i class="fas fa-user-check"></i> {{ activeCount }} Active
              </span>
              <span class="status-meta-pill" v-if="!loadingData && departmentStats.length > 0">
                <i class="fas fa-sitemap"></i> {{ departmentStats.length }} Departments
              </span>
            </div>
            <h1 class="page-title">Employee Management</h1>
            <p class="page-subtitle">
              Comprehensive workforce directory, departmental assignments, contacts, and Key Responsibility Areas (KRAs).
            </p>
          </div>

          <div class="banner-right-actions">
            <button class="btn-register-emp" @click="openRegisterForm()">
              <i class="fas fa-user-plus"></i>
              <span>Register Employee</span>
            </button>
          </div>
        </header>

        <!-- 🔍 Unified Toolbar & Filter Bar -->
        <div class="emp-toolbar-card">
          <div class="toolbar-search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              class="toolbar-search-input"
              placeholder="Search by name, role, department, handle, contact..." 
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''" title="Clear search">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- View Mode Switcher Segmented Control -->
          <div class="view-mode-tabs">
            <button 
              type="button" 
              class="view-tab-btn" 
              :class="{ active: viewMode === 'table' }"
              @click="setViewMode('table')"
              title="Standard Data Table"
            >
              <i class="fas fa-table"></i>
              <span>Table</span>
            </button>
            <button 
              type="button" 
              class="view-tab-btn" 
              :class="{ active: viewMode === 'tree' }"
              @click="setViewMode('tree')"
              title="Interactive Org Tree Structure"
            >
              <i class="fas fa-sitemap"></i>
              <span>Tree Structure</span>
            </button>
            <button 
              type="button" 
              class="view-tab-btn" 
              :class="{ active: viewMode === 'icons' }"
              @click="setViewMode('icons')"
              title="Visual Cards & Icons"
            >
              <i class="fas fa-th-large"></i>
              <span>Visual Cards</span>
            </button>
          </div>

          <div class="toolbar-stats-pill">
            <i class="fas" :class="loadingData ? 'fa-circle-notch fa-spin text-primary' : 'fa-filter'"></i>
            <span>{{ loadingData ? 'Loading directory...' : filteredUsers.length + ' of ' + users.length + ' Staff' }}</span>
          </div>
        </div>

        <!-- ⏳ High-end Modern Loading State -->
        <div v-if="loadingData" class="emp-loading-card">
          <div class="emp-loading-pulse-halo">
            <div class="emp-spinner-ring"></div>
            <i class="fas fa-users-cog emp-spinner-icon"></i>
          </div>
          <h3 class="emp-loading-title">Loading Workforce Directory</h3>
          <p class="emp-loading-sub">Fetching employee records, department assignments, and contact details...</p>
          <div class="emp-loading-progress-bar">
            <div class="emp-loading-progress-indeterminate"></div>
          </div>
        </div>

        <template v-else>
          <!-- Quick Department Filter Strip -->
          <div class="dept-quick-strip" v-if="users.length > 0">
            <button 
              type="button" 
            class="dept-chip" 
            :class="{ active: selectedDeptFilter === 'all' }"
            @click="selectedDeptFilter = 'all'"
          >
            <i class="fas fa-layer-group"></i>
            <span>All Staff</span>
            <span class="chip-count">{{ users.length }}</span>
          </button>
          <button 
            type="button" 
            v-for="dept in departmentStats" 
            :key="dept.name" 
            class="dept-chip"
            :class="{ active: selectedDeptFilter.toLowerCase() === dept.name.toLowerCase() }"
            @click="selectedDeptFilter = selectedDeptFilter.toLowerCase() === dept.name.toLowerCase() ? 'all' : dept.name"
          >
            <i :class="getDeptIcon(dept.name)" :style="{ color: getDeptColor(dept.name) }"></i>
            <span>{{ dept.name }}</span>
            <span class="chip-count">
              {{ dept.total }}
            </span>
          </button>
        </div>

        <!-- ========================================================= -->
        <!-- 🌳 1. TREE STRUCTURE VIEW (VISUALIZATION WITH ICONS)     -->
        <!-- ========================================================= -->
        <div v-if="viewMode === 'tree'" class="tree-view-wrapper">
          <!-- Tree Controls Bar -->
          <div class="tree-controls-bar">
            <div class="tree-stats-row">
              <span class="tree-stat-pill">
                <i class="fas fa-sitemap text-primary"></i> <strong>{{ departmentStats.length }}</strong> Departments
              </span>
              <span class="tree-stat-pill emerald">
                <i class="fas fa-user-check"></i> <strong>{{ activeCount }}</strong> Active
              </span>
              <span class="tree-stat-pill slate" v-if="inactiveCount > 0">
                <i class="fas fa-user-slash"></i> <strong>{{ inactiveCount }}</strong> Inactive
              </span>
            </div>
            <div class="tree-btn-group">
              <button type="button" class="btn-tree-tool" @click="expandAllDepts" title="Expand All Branches">
                <i class="fas fa-plus-square"></i> Expand All
              </button>
              <button type="button" class="btn-tree-tool" @click="collapseAllDepts" title="Collapse All Branches">
                <i class="fas fa-minus-square"></i> Collapse All
              </button>
            </div>
          </div>

          <!-- Tree Visual Hierarchy -->
          <div class="org-tree-chart">
            <!-- Root Company Node (Arch Enterprises) -->
            <div class="tree-root-section">
              <div class="org-company-node">
                <div class="company-badge-halo">
                  <i class="fas fa-shield-alt"></i>
                </div>
                <div class="company-info-block">
                  <h3 class="company-name">Arch Enterprises</h3>
                  <span class="company-sub">Enterprise Organizational Structure</span>
                </div>
                <div class="company-meta-badge">
                  <i class="fas fa-users"></i>
                  <span>{{ filteredUsers.length }} Total Staff</span>
                </div>
              </div>
              <div class="tree-trunk-line"></div>
            </div>

            <!-- Department Branches -->
            <div class="tree-departments-flow">
              <div 
                v-for="dept in departmentStats" 
                :key="dept.name" 
                class="dept-branch-block"
                :class="{ 'collapsed': isDeptCollapsed(dept.name) }"
              >
                <!-- Department Header Node -->
                <div class="dept-header-box" @click="toggleDeptCollapse(dept.name)">
                  <div class="dept-header-main">
                    <div class="dept-icon-circle" :style="{ backgroundColor: getDeptColor(dept.name) + '18', color: getDeptColor(dept.name) }">
                      <i :class="getDeptIcon(dept.name)"></i>
                    </div>
                    <div class="dept-title-meta">
                      <h4 class="dept-name-heading">{{ dept.name }}</h4>
                      <span class="dept-subtitle">
                        {{ dept.total }} Member{{ dept.total !== 1 ? 's' : '' }} • {{ dept.active }} Active
                      </span>
                    </div>
                  </div>
                  <div class="dept-header-actions">
                    <span class="dept-count-badge" :style="{ backgroundColor: getDeptColor(dept.name) }">
                      {{ dept.total }}
                    </span>
                    <button type="button" class="btn-dept-expand">
                      <i :class="isDeptCollapsed(dept.name) ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
                    </button>
                  </div>
                </div>

                <!-- Connector Line to Employee Leaf Cards -->
                <div v-show="!isDeptCollapsed(dept.name)" class="dept-stem-line"></div>

                <!-- Employee Cards within Department -->
                <transition name="fade">
                  <div v-show="!isDeptCollapsed(dept.name)" class="dept-employee-cards-row">
                    <div 
                      v-for="user in dept.users" 
                      :key="user.id" 
                      class="tree-employee-leaf"
                      :class="{ 'inactive': user.status !== 'active' }"
                    >
                      <div class="leaf-avatar-section" @click="openEmployeeDetails(user)" title="Click to view full employee profile & documents">
                        <div class="leaf-avatar" :style="{ backgroundColor: getAvatarColor(user.name) }">
                          {{ getInitials(user.name) }}
                        </div>
                        <span class="leaf-status-dot" :class="user.status === 'active' ? 'active' : 'inactive'" :title="user.status === 'active' ? 'Active' : 'Inactive'"></span>
                      </div>

                      <div class="leaf-details-section" @click="openEmployeeDetails(user)" title="Click to view full employee profile & documents">
                        <div class="leaf-name-row">
                          <strong class="leaf-name">{{ formatName(user.name) }}</strong>
                          <i class="fas fa-id-card-alt emp-leaf-hint" title="View Full Details & Documents"></i>
                        </div>
                        <span class="leaf-role" :title="user.keyresponsibility || user.department">
                          <i class="fas fa-briefcase"></i> {{ user.keyresponsibility || 'Team Member' }}
                        </span>
                        <div class="leaf-contacts">
                          <a v-if="user.email" :href="'mailto:' + user.email" class="leaf-contact-chip" :title="user.email" @click.stop>
                            <i class="fas fa-envelope"></i>
                            <span class="truncate-txt">{{ user.email }}</span>
                          </a>
                          <a v-if="user.mobile" :href="'tel:' + user.mobile" class="leaf-contact-chip phone" :title="user.mobile" @click.stop>
                            <i class="fas fa-phone-alt"></i>
                            <span>{{ user.mobile }}</span>
                          </a>
                        </div>
                      </div>

                      <div class="leaf-actions-bar">
                        <button type="button" class="leaf-btn edit" @click.stop="editUser(user)" title="Edit Employee">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="leaf-btn kra" @click.stop="openKRASelection(user)" title="KRA Performance">
                          <i class="fas fa-chart-line"></i>
                        </button>
                        <button 
                          type="button" 
                          class="leaf-btn toggle" 
                          :class="user.status === 'active' ? 'deactivate' : 'activate'" 
                          @click.stop="toggleStatus(user)"
                          :title="user.status === 'active' ? 'Deactivate Employee' : 'Activate Employee'"
                        >
                          <i :class="user.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </transition>

              </div>
            </div>

            <!-- Empty state for tree -->
            <div v-if="departmentStats.length === 0" class="tree-empty-card">
              <i class="fas fa-user-friends"></i>
              <h4>No employees match your search</h4>
              <p>Try adjusting your search keywords or department filter</p>
              <button type="button" class="btn-clear-search" @click="searchQuery = ''; selectedDeptFilter = 'all'">
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- 🎨 2. VISUAL ICONS & CARDS GRID VIEW                     -->
        <!-- ========================================================= -->
        <div v-else-if="viewMode === 'icons'" class="visual-cards-wrapper">
          <div class="visual-cards-grid">
            <div 
              v-for="user in filteredUsers" 
              :key="user.id" 
              class="visual-emp-card"
              :class="{ 'inactive': user.status !== 'active' }"
            >
              <!-- Top color stripe -->
              <div class="card-color-stripe" :style="{ backgroundColor: getDeptColor(user.department) }"></div>

              <div class="card-top-meta">
                <span class="dept-tag-pill" :style="{ backgroundColor: getDeptColor(user.department) + '18', color: getDeptColor(user.department) }">
                  <i :class="getDeptIcon(user.department)"></i> {{ user.department || 'General' }}
                </span>
                <span class="status-pill-badge" :class="user.status === 'active' ? 'active' : 'inactive'">
                  <i class="fas fa-circle"></i> {{ user.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <!-- Avatar & Name Profile -->
              <div class="card-hero-profile" @click="openEmployeeDetails(user)" title="Click to view full employee profile & documents">
                <div class="avatar-hero-ring">
                  <div class="avatar-hero" :style="{ backgroundColor: getAvatarColor(user.name) }">
                    {{ getInitials(user.name) }}
                  </div>
                  <i class="fas fa-id-card-alt emp-hero-hint" title="View Full Details & Documents"></i>
                </div>
                <h3 class="hero-name">{{ formatName(user.name) }}</h3>
                <span class="hero-handle">@{{ user.handle || (user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : 'user') }}</span>
                <div class="hero-role-pill" :title="user.keyresponsibility || 'Team Member'">
                  <i class="fas fa-id-badge"></i> {{ user.keyresponsibility || 'Team Member' }}
                </div>
              </div>

              <!-- Contact & Details Strip -->
              <div class="card-contacts-strip">
                <a v-if="user.email" :href="'mailto:' + user.email" class="contact-pill-link" :title="user.email">
                  <i class="fas fa-envelope"></i>
                  <span>{{ user.email }}</span>
                </a>
                <a v-if="user.mobile" :href="'tel:' + user.mobile" class="contact-pill-link phone" :title="user.mobile">
                  <i class="fas fa-phone-alt"></i>
                  <span>{{ user.mobile }}</span>
                </a>
              </div>

              <!-- Card Action Buttons -->
              <div class="card-bottom-actions">
                <button type="button" class="btn-card-tool kra" @click="openKRASelection(user)" title="KRA Performance">
                  <i class="fas fa-chart-line"></i> <span>KRA</span>
                </button>
                <button type="button" class="btn-card-tool edit" @click="editUser(user)" title="Edit Employee">
                  <i class="fas fa-edit"></i> <span>Edit</span>
                </button>
                <button 
                  type="button" 
                  class="btn-card-tool toggle" 
                  :class="user.status === 'active' ? 'deactivate' : 'activate'"
                  @click="toggleStatus(user)"
                  :title="user.status === 'active' ? 'Deactivate Employee' : 'Activate Employee'"
                >
                  <i :class="user.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                </button>
              </div>
            </div>
          </div>

          <div v-if="filteredUsers.length === 0" class="cards-empty-state">
            <i class="fas fa-user-friends"></i>
            <h4>No employees found</h4>
            <p>Try adjusting your search criteria or department filter</p>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- 📋 3. TABLE VIEW (DESKTOP) / MOBILE CARDS                -->
        <!-- ========================================================= -->
        <template v-else-if="viewMode === 'table'">
          <!-- Mobile Card View -->
          <div class="mobile-cards" v-if="isMobile">
            <div v-for="(user, index) in filteredUsers" :key="user.id" class="employee-card">
              <div class="card-header">
                <div class="card-avatar" @click="openEmployeeDetails(user)" title="Click to view full employee profile & documents">
                  <div class="avatar">{{ getInitials(user.name) }}</div>
                  <span class="card-name">{{ formatName(user.name) }}</span>
                  <i class="fas fa-id-card-alt emp-hint-mobile" title="View Full Details & Documents"></i>
                </div>
                <span :class="['status-badge-mobile', user.status === 'active' ? 'active' : 'inactive']">
                  <i class="fas fa-circle"></i>
                  {{ user.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <div class="card-body">
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-envelope"></i> Email</span>
                  <span class="card-value">{{ user.email }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-building"></i> Department</span>
                  <span class="card-value dept-badge-mobile">{{ user.department }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label"><i class="fas fa-phone"></i> Contact</span>
                  <span class="card-value">{{ user.mobile }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button class="card-action-btn kra" @click="openKRASelection(user)" title="Assign / View KRAs">
                  <i class="fas fa-chart-line"></i> KRA
                </button>
                <button class="card-action-btn edit" @click="editUser(user)" title="Edit Employee">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="card-action-btn toggle" :class="user.status === 'active' ? 'deactivate' : 'activate'" @click="toggleStatus(user)">
                  <i :class="user.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                  {{ user.status === 'active' ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            </div>

            <div v-if="filteredUsers.length === 0" class="empty-state-mobile">
              <i class="fas fa-user-friends"></i>
              <p>No employees found</p>
              <span>Try adjusting your search</span>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="table-card-wrapper" v-else>
            <div class="table-responsive-box">
              <table class="employee-table">
                <thead>
                  <tr>
                    <th class="th-num">#</th>
                    <th class="th-emp">Employee</th>
                    <th class="th-email">Email Address</th>
                    <th class="th-dept">Department</th>
                    <th class="th-contact">Contact Phone</th>
                    <th class="th-status">Status</th>
                    <th class="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(user, index) in filteredUsers" :key="user.id" class="emp-row">
                    <td class="td-num">{{ index + 1 }}</td>
                    <td class="employee-name-cell td-emp">
                      <div class="avatar" @click="openEmployeeDetails(user)" :style="{ backgroundColor: getAvatarColor(user.name) }" title="Click to view full employee profile & documents">
                        {{ getInitials(user.name) }}
                      </div>
                      <div class="employee-meta-col">
                        <span class="emp-full-name" @click="openEmployeeDetails(user)" title="Click to view full employee profile & documents">
                          {{ formatName(user.name) }}
                          <i class="fas fa-id-card-alt emp-row-hint" title="View Full Details & Documents"></i>
                        </span>
                        <span class="emp-handle">@{{ user.handle || (user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : 'user') }}</span>
                      </div>
                    </td>
                    <td class="td-email">
                      <a v-if="user.email" :href="'mailto:' + user.email" class="email-link" :title="user.email">
                        <i class="fas fa-envelope"></i>
                        <span class="truncate-txt">{{ user.email }}</span>
                      </a>
                      <span v-else class="empty-field">—</span>
                    </td>
                    <td class="td-dept">
                      <span 
                        class="dept-badge" 
                        :style="{ 
                          backgroundColor: getDeptColor(user.department) + '14', 
                          color: getDeptColor(user.department), 
                          borderColor: getDeptColor(user.department) + '30' 
                        }"
                      >
                        <i :class="getDeptIcon(user.department)"></i>
                        <span>{{ user.department || 'General' }}</span>
                      </span>
                    </td>
                    <td class="td-contact">
                      <a v-if="user.mobile" :href="'tel:' + user.mobile" class="phone-link" :title="user.mobile">
                        <i class="fas fa-phone-alt"></i>
                        <span>{{ user.mobile }}</span>
                      </a>
                      <span v-else class="empty-field">—</span>
                    </td>
                    <td class="td-status">
                      <span :class="['status-badge', user.status === 'active' ? 'active' : 'inactive']">
                        <span class="status-dot"></span>
                        <span>{{ user.status === 'active' ? 'Active' : 'Inactive' }}</span>
                      </span>
                    </td>
                    <td class="td-actions">
                      <div class="actions">
                        <button class="action-btn kra" @click="openKRASelection(user)" title="Assign / View KRAs">
                          <i class="fas fa-chart-line"></i>
                          <span class="action-lbl">KRA</span>
                        </button>
                        <button class="action-btn edit" @click="editUser(user)" title="Edit Employee">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          class="action-btn toggle" 
                          :class="user.status === 'active' ? 'deactivate' : 'activate'" 
                          @click="toggleStatus(user)" 
                          :title="user.status === 'active' ? 'Deactivate Employee' : 'Activate Employee'"
                        >
                          <i :class="user.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredUsers.length === 0">
                    <td colspan="7" class="empty-state">
                      <div class="empty-content">
                        <i class="fas fa-user-friends"></i>
                        <h4>No employees found</h4>
                        <p>No records match your search or department filter</p>
                        <button type="button" class="btn-clear-table-search" @click="searchQuery = ''; selectedDeptFilter = 'all'">
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
        </template>

        <!-- KRA Modal - Premium -->
        <transition name="modal-fade">
          <div class="modal-backdrop" v-if="showKRAPopup" @click.self="cancelKRA">
            <div class="premium-modal kra-modal" @click.stop>
              <div class="modal-decoration"></div>
              
              <div class="modal-header-premium">
                <div class="header-icon-premium">
                  <i class="fas fa-tasks"></i>
                </div>
                <div class="header-text">
                  <h2>Assign Key Responsibilities</h2>
                  <p>Select KRAs for {{ selectedUser?.name }}</p>
                </div>
                <button class="close-btn-premium" @click="cancelKRA">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="modal-body-premium kra-body">
                <div class="kra-container">
                  <div class="kra-header">
                    <i class="fas fa-list-check"></i>
                    <span>Available KRAs</span>
                  </div>
                  <div class="kra-list">
                    <div v-for="kra in filteredKRAOptions" :key="kra.id" class="kra-item" :class="{ 'selected': selectedKRAs.includes(kra.id) }" @click="toggleKRA(kra.id)">
                      <div class="kra-checkbox">
                        <i :class="selectedKRAs.includes(kra.id) ? 'fas fa-check-square' : 'far fa-square'"></i>
                      </div>
                      <div class="kra-info">
                        <span class="kra-name">{{ kra.name }}</span>
                      </div>
                    </div>
                    <div v-if="filteredKRAOptions.length === 0" class="no-items">
                      <i class="fas fa-info-circle"></i>
                      <p>No KRAs available for this department</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button type="button" class="btn-cancel-premium" @click="cancelKRA">
                  <i class="fas fa-times"></i> Cancel
                </button>
                <button type="button" class="btn-secondary-premium" @click="showPerformance = true">
                  <i class="fas fa-eye"></i> View Assigned
                </button>
                <button type="button" class="btn-submit-premium" @click="assignKRA">
                  <i class="fas fa-check"></i> Assign KRAs
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Assigned KRAs Modal - Premium -->
        <transition name="modal-fade">
          <div class="modal-backdrop" v-if="showPerformance" @click.self="showPerformance = false">
            <div class="premium-modal assigned-modal" @click.stop>
              <div class="modal-decoration"></div>
              
              <div class="modal-header-premium">
                <div class="header-icon-premium">
                  <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="header-text">
                  <h2>Assigned KRAs</h2>
                  <p>{{ selectedUser?.name }}</p>
                </div>
                <button class="close-btn-premium" @click="showPerformance = false">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="modal-body-premium assigned-body">
                <div class="assigned-container">
                  <div class="assigned-header">
                    <i class="fas fa-check-circle"></i>
                    <span>Currently Assigned Responsibilities</span>
                  </div>
                  <div class="assigned-list">
                    <div v-for="kra in parsedKRAs" :key="kra" class="assigned-item">
                      <i class="fas fa-check-circle"></i>
                      <span>{{ kra }}</span>
                    </div>
                    <div v-if="parsedKRAs.length === 0" class="no-items">
                      <i class="fas fa-inbox"></i>
                      <p>No KRAs assigned yet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer-premium">
                <button type="button" class="btn-submit-premium" @click="showPerformance = false">
                  <i class="fas fa-check"></i> Done
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- ========================================================= -->
        <!-- 🌟 EMPLOYEE FULL DETAILS & DOCUMENTS MODAL               -->
        <!-- ========================================================= -->
        <transition name="modal-fade">
          <div class="modal-backdrop emp-details-backdrop" v-if="showEmployeeDetailsModal" @click.self="closeEmployeeDetails">
            <div class="premium-modal emp-details-modal" @click.stop>
              <div class="modal-decoration"></div>

              <!-- Modal Top Bar -->
              <div class="emp-details-header">
                <div class="emp-hero-profile">
                  <div class="emp-details-avatar" :style="{ backgroundColor: getAvatarColor(selectedEmployee?.name) }">
                    <img v-if="getEmployeePhoto(selectedEmployee)" :src="getEmployeePhoto(selectedEmployee)" class="avatar-img" :alt="selectedEmployee?.name" />
                    <span v-else>{{ getInitials(selectedEmployee?.name) }}</span>
                  </div>
                  <div class="emp-hero-meta">
                    <div class="emp-name-badge-row">
                      <h2 class="emp-details-name">{{ formatName(selectedEmployee?.name) }}</h2>
                      <span class="status-pill-badge" :class="selectedEmployee?.status === 'active' ? 'active' : 'inactive'">
                        <i class="fas fa-circle"></i> {{ selectedEmployee?.status === 'active' ? 'Active Staff' : 'Inactive' }}
                      </span>
                    </div>
                    <div class="emp-hero-tags">
                      <span class="emp-hero-handle">@{{ selectedEmployee?.handle || (selectedEmployee?.name ? selectedEmployee.name.toLowerCase().replace(/\s+/g, '_') : 'user') }}</span>
                      <span class="emp-tag-divider">•</span>
                      <span class="dept-badge" :style="{ backgroundColor: getDeptColor(selectedEmployee?.department) + '18', color: getDeptColor(selectedEmployee?.department), borderColor: getDeptColor(selectedEmployee?.department) + '35' }">
                        <i :class="getDeptIcon(selectedEmployee?.department)"></i> {{ selectedEmployee?.department || 'General' }}
                      </span>
                      <span class="emp-tag-divider" v-if="selectedEmployee?.emp_id">•</span>
                      <span class="emp-code-chip" v-if="selectedEmployee?.emp_id">
                        <i class="fas fa-id-badge"></i> {{ selectedEmployee?.emp_id }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="emp-details-header-actions">
                  <button type="button" class="btn-head-action kra-btn" @click="switchFromDetailsToKRA" title="Assign / View KRAs">
                    <i class="fas fa-chart-line"></i> <span>Manage KRAs</span>
                  </button>
                  <button type="button" class="btn-head-action edit-btn" @click="switchFromDetailsToEdit" title="Edit Profile">
                    <i class="fas fa-user-edit"></i> <span>Edit</span>
                  </button>
                  <button type="button" class="close-btn-premium" @click="closeEmployeeDetails" title="Close Profile">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Quick Highlights Bar -->
              <div class="emp-metrics-strip">
                <div class="metric-chip">
                  <span class="metric-label">Monthly Salary</span>
                  <strong class="metric-val">
                    {{ selectedEmployee?.keyresponsibility && !isNaN(selectedEmployee.keyresponsibility) ? '₹' + Number(selectedEmployee.keyresponsibility).toLocaleString('en-IN') : (selectedEmployee?.keyresponsibility || '—') }}
                  </strong>
                </div>
                <div class="metric-chip">
                  <span class="metric-label">Date of Joining</span>
                  <strong class="metric-val">{{ formatJoinedDate(selectedEmployee?.created_at) }}</strong>
                </div>
                <div class="metric-chip">
                  <span class="metric-label">Assigned KRAs</span>
                  <strong class="metric-val highlight">{{ getEmployeeKRAsCount(selectedEmployee) }} Areas</strong>
                </div>
                <div class="metric-chip">
                  <span class="metric-label">Attached Documents</span>
                  <strong class="metric-val docs-count">{{ employeeDocumentsList.length }} Verified</strong>
                </div>
                <div class="metric-chip" v-if="selectedEmployee?.is_probation !== undefined">
                  <span class="metric-label">Employment Status</span>
                  <strong class="metric-val" :class="selectedEmployee.is_probation ? 'probation-tag' : 'confirmed-tag'">
                    {{ selectedEmployee.is_probation ? (selectedEmployee.probation_days_left + 'd Probation') : 'Permanent' }}
                  </strong>
                </div>
              </div>

              <!-- Modal Navigation Tabs -->
              <div class="emp-tabs-nav">
                <button 
                  type="button" 
                  class="emp-tab-btn" 
                  :class="{ 'active': activeDetailTab === 'overview' }"
                  @click="activeDetailTab = 'overview'"
                >
                  <i class="fas fa-user-circle"></i>
                  <span>Personal & Contact Details</span>
                </button>
                <button 
                  type="button" 
                  class="emp-tab-btn" 
                  :class="{ 'active': activeDetailTab === 'documents' }"
                  @click="activeDetailTab = 'documents'"
                >
                  <i class="fas fa-folder-open"></i>
                  <span>Attached Documents</span>
                  <span class="tab-badge-pill">{{ employeeDocumentsList.length }}</span>
                </button>
                <button 
                  type="button" 
                  class="emp-tab-btn" 
                  :class="{ 'active': activeDetailTab === 'kras' }"
                  @click="activeDetailTab = 'kras'"
                >
                  <i class="fas fa-tasks"></i>
                  <span>Key Responsibilities (KRAs)</span>
                  <span class="tab-badge-pill">{{ getEmployeeKRAsCount(selectedEmployee) }}</span>
                </button>
              </div>

              <!-- Modal Body Content -->
              <div class="emp-details-body">
                <!-- 🌟 TAB 1: OVERVIEW & PERSONAL DETAILS -->
                <div v-show="activeDetailTab === 'overview'" class="tab-pane-fade">
                  <div class="details-cards-grid">
                    <!-- Personal Info Card -->
                    <div class="detail-card">
                      <div class="detail-card-head">
                        <i class="fas fa-id-card"></i>
                        <span>Personal Information</span>
                      </div>
                      <div class="detail-fields-list">
                        <div class="detail-field-row">
                          <span class="field-label">Full Name</span>
                          <span class="field-value">{{ formatName(selectedEmployee?.name) || '—' }}</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Date of Birth</span>
                          <span class="field-value">{{ formatBirthDate(selectedEmployee?.dateofbirth) }}</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Calculated Age</span>
                          <span class="field-value">{{ calculateEmployeeAge(selectedEmployee?.dateofbirth) }}</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Gender</span>
                          <span class="field-value">{{ selectedEmployee?.gender || '—' }}</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Blood Group</span>
                          <span class="field-value blood-badge" v-if="selectedEmployee?.bloodgroup">
                            <i class="fas fa-tint"></i> {{ selectedEmployee.bloodgroup }}
                          </span>
                          <span class="field-value" v-else>—</span>
                        </div>
                      </div>
                    </div>

                    <!-- Contact & Communication Card -->
                    <div class="detail-card">
                      <div class="detail-card-head">
                        <i class="fas fa-phone-volume"></i>
                        <span>Contact & Communication</span>
                      </div>
                      <div class="detail-fields-list">
                        <div class="detail-field-row">
                          <span class="field-label">Official / Work Email</span>
                          <a v-if="selectedEmployee?.email" :href="'mailto:' + selectedEmployee.email" class="field-link email">
                            <i class="fas fa-envelope"></i> {{ selectedEmployee.email }}
                          </a>
                          <span v-else class="field-value">—</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Primary Mobile</span>
                          <a v-if="selectedEmployee?.mobile" :href="'tel:' + selectedEmployee.mobile" class="field-link phone">
                            <i class="fas fa-phone-alt"></i> {{ selectedEmployee.mobile }}
                          </a>
                          <span v-else class="field-value">—</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Secondary Mobile</span>
                          <a v-if="selectedEmployee?.mobile2" :href="'tel:' + selectedEmployee.mobile2" class="field-link phone">
                            <i class="fas fa-phone"></i> {{ selectedEmployee.mobile2 }}
                          </a>
                          <span v-else class="field-value empty">—</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Base City</span>
                          <span class="field-value">{{ selectedEmployee?.city || '—' }}</span>
                        </div>
                        <div class="detail-field-row full-row">
                          <span class="field-label">Residential Address</span>
                          <span class="field-value address-txt">{{ selectedEmployee?.address || '—' }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Organization & Work Card -->
                    <div class="detail-card">
                      <div class="detail-card-head">
                        <i class="fas fa-briefcase"></i>
                        <span>Department & Placement</span>
                      </div>
                      <div class="detail-fields-list">
                        <div class="detail-field-row">
                          <span class="field-label">Department</span>
                          <span class="field-value">{{ selectedEmployee?.department || 'General' }}</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Designation / Role</span>
                          <span class="field-value">{{ selectedEmployee?.keyresponsibility && isNaN(selectedEmployee.keyresponsibility) ? selectedEmployee.keyresponsibility : 'Staff Member' }}</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Employee ID</span>
                          <span class="field-value code-pill">{{ selectedEmployee?.emp_id || ('#EMP-' + selectedEmployee?.id) }}</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">Portal Handle</span>
                          <span class="field-value">@{{ selectedEmployee?.handle || '—' }}</span>
                        </div>
                        <div class="detail-field-row">
                          <span class="field-label">System Role</span>
                          <span class="field-value text-capitalize">{{ selectedEmployee?.role || 'Staff User' }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Social / Professional Profiles Card (if any) -->
                    <div class="detail-card" v-if="selectedEmployee?.linkedin || selectedEmployee?.youtube || selectedEmployee?.instagram || selectedEmployee?.portfolio">
                      <div class="detail-card-head">
                        <i class="fas fa-share-alt"></i>
                        <span>Social & Professional Profiles</span>
                      </div>
                      <div class="social-links-grid">
                        <a v-if="selectedEmployee?.linkedin" :href="selectedEmployee.linkedin" target="_blank" rel="noopener" class="social-chip linkedin">
                          <i class="fab fa-linkedin"></i> LinkedIn
                        </a>
                        <a v-if="selectedEmployee?.portfolio" :href="selectedEmployee.portfolio" target="_blank" rel="noopener" class="social-chip portfolio">
                          <i class="fas fa-globe"></i> Portfolio
                        </a>
                        <a v-if="selectedEmployee?.youtube" :href="selectedEmployee.youtube" target="_blank" rel="noopener" class="social-chip youtube">
                          <i class="fab fa-youtube"></i> YouTube
                        </a>
                        <a v-if="selectedEmployee?.instagram" :href="selectedEmployee.instagram" target="_blank" rel="noopener" class="social-chip instagram">
                          <i class="fab fa-instagram"></i> Instagram
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 🌟 TAB 2: ATTACHED DOCUMENTS & PROOFS -->
                <div v-show="activeDetailTab === 'documents'" class="tab-pane-fade">
                  <div class="docs-tab-header">
                    <div class="docs-tab-title-group">
                      <h3>Attached Verification Documents</h3>
                      <p>Employee government records, ID proofs, certifications, and uploaded files.</p>
                    </div>
                    <div class="docs-tab-actions">
                      <button type="button" class="btn-attach-doc-toggle" @click="showDocUploadInline = !showDocUploadInline">
                        <i :class="showDocUploadInline ? 'fas fa-times' : 'fas fa-plus-circle'"></i>
                        <span>{{ showDocUploadInline ? 'Cancel' : 'Attach Document' }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Inline Document Uploader -->
                  <div v-if="showDocUploadInline" class="inline-doc-uploader-panel">
                    <div class="uploader-header">
                      <i class="fas fa-file-upload"></i>
                      <span>Upload & Attach Document for {{ formatName(selectedEmployee?.name) }}</span>
                    </div>
                    <div class="uploader-row">
                      <select v-model="inlineDocType" class="inline-select">
                        <option disabled value="">Select Document Type</option>
                        <option value="aadhaar_card">🆔 Aadhaar Card / National ID</option>
                        <option value="permanent_address_proof">📄 Permanent Address Proof</option>
                        <option value="education_certificate">🎓 Educational Certificate / Degree</option>
                        <option value="relevance_letter">📝 Company Relevance / Offer Letter</option>
                        <option value="photo">📸 Photograph / ID Card Photo</option>
                        <option value="other">📑 Other Official Document</option>
                      </select>
                      <label class="btn-browse-file" :class="{ 'disabled': !inlineDocType || uploadingInlineDoc }">
                        <i class="fas fa-spinner fa-spin" v-if="uploadingInlineDoc"></i>
                        <i class="fas fa-cloud-upload-alt" v-else></i>
                        <span>{{ uploadingInlineDoc ? 'Uploading...' : 'Choose File & Upload' }}</span>
                        <input type="file" @change="handleInlineDocUpload" :disabled="!inlineDocType || uploadingInlineDoc" hidden />
                      </label>
                    </div>
                  </div>

                  <!-- Loading state -->
                  <div v-if="loadingEmployeeDocs" class="docs-loading-spinner">
                    <i class="fas fa-circle-notch fa-spin"></i>
                    <span>Loading employee documents...</span>
                  </div>

                  <!-- Documents Cards Grid -->
                  <div v-else class="documents-cards-grid">
                    <div 
                      v-for="(doc, idx) in employeeDocumentsList" 
                      :key="doc.id || idx" 
                      class="employee-doc-card"
                      :class="{ 'has-file': doc.url, 'no-file': !doc.url }"
                    >
                      <div class="doc-card-badge-row">
                        <span class="doc-category-pill">{{ doc.category || 'Official Document' }}</span>
                        <span class="doc-status-tag" :class="doc.url ? 'status-attached' : 'status-pending'">
                          <i :class="doc.url ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
                          {{ doc.url ? 'Attached' : 'Pending Upload' }}
                        </span>
                      </div>

                      <div class="doc-card-content">
                        <div class="doc-file-icon" :class="getDocIconClass(doc)">
                          <i :class="getDocIcon(doc)"></i>
                        </div>
                        <div class="doc-file-info">
                          <h4 class="doc-title">{{ doc.title }}</h4>
                          <span class="doc-meta-sub" v-if="doc.filename">
                            {{ doc.filename }}
                          </span>
                          <span class="doc-meta-sub pending-text" v-else>
                            No document file uploaded yet
                          </span>
                          <span class="doc-date" v-if="doc.uploaded_at">
                            <i class="far fa-calendar-alt"></i> {{ doc.uploaded_at }}
                          </span>
                        </div>
                      </div>

                      <!-- Document Card Bottom Actions -->
                      <div class="doc-card-actions">
                        <template v-if="doc.url">
                          <button type="button" class="btn-doc-action preview" @click="previewDoc(doc)" title="Preview Document">
                            <i class="fas fa-eye"></i> <span>Preview</span>
                          </button>
                          <a :href="doc.url" target="_blank" rel="noopener noreferrer" download class="btn-doc-action download" title="Download Document">
                            <i class="fas fa-download"></i> <span>Download</span>
                          </a>
                        </template>
                        <template v-else>
                          <label class="btn-doc-action upload-now" title="Upload Document">
                            <i class="fas fa-upload"></i> <span>Upload</span>
                            <input type="file" @change="uploadSpecificDocType(doc.type, $event)" hidden />
                          </label>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 🌟 TAB 3: ASSIGNED KRAs -->
                <div v-show="activeDetailTab === 'kras'" class="tab-pane-fade">
                  <div class="kras-tab-header">
                    <div>
                      <h3>Assigned Key Responsibility Areas</h3>
                      <p>Active core deliverables and departmental KRAs assigned to {{ formatName(selectedEmployee?.name) }}.</p>
                    </div>
                    <button type="button" class="btn-head-action kra-btn" @click="switchFromDetailsToKRA">
                      <i class="fas fa-edit"></i> <span>Modify Assigned KRAs</span>
                    </button>
                  </div>

                  <div class="kras-cards-grid" v-if="getEmployeeKRAsList(selectedEmployee).length > 0">
                    <div 
                      v-for="(kra, kIdx) in getEmployeeKRAsList(selectedEmployee)" 
                      :key="kIdx" 
                      class="kra-detail-card"
                    >
                      <div class="kra-card-index">{{ kIdx + 1 }}</div>
                      <div class="kra-card-body">
                        <div class="kra-card-icon">
                          <i class="fas fa-check-double"></i>
                        </div>
                        <div class="kra-card-text">
                          <h4>{{ kra }}</h4>
                          <span class="kra-dept-label">
                            <i class="fas fa-building"></i> {{ selectedEmployee?.department || 'Department KRA' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-kras-box">
                    <i class="fas fa-tasks"></i>
                    <h4>No KRAs Assigned</h4>
                    <p>This employee does not have any Key Responsibility Areas assigned yet.</p>
                    <button type="button" class="btn-submit-premium" @click="switchFromDetailsToKRA">
                      <i class="fas fa-plus"></i> Assign KRAs Now
                    </button>
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="modal-footer-premium">
                <button type="button" class="btn-cancel-premium" @click="closeEmployeeDetails">
                  <i class="fas fa-times"></i> Close
                </button>
                <button type="button" class="btn-secondary-premium" @click="switchFromDetailsToKRA">
                  <i class="fas fa-chart-line"></i> Manage KRAs
                </button>
                <button type="button" class="btn-submit-premium" @click="switchFromDetailsToEdit">
                  <i class="fas fa-user-edit"></i> Edit Employee Profile
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- 🌟 IN-MODAL DOCUMENT LIGHTBOX / PREVIEW MODAL -->
        <transition name="modal-fade">
          <div class="modal-backdrop doc-preview-backdrop" v-if="previewDocument" @click.self="previewDocument = null">
            <div class="premium-modal doc-preview-modal" @click.stop>
              <div class="modal-header-premium">
                <div class="header-icon-premium">
                  <i :class="getDocIcon(previewDocument)"></i>
                </div>
                <div class="header-text">
                  <h2>{{ previewDocument?.title }}</h2>
                  <p>{{ previewDocument?.filename || 'Document Preview' }}</p>
                </div>
                <div class="preview-header-actions">
                  <a :href="previewDocument?.url" target="_blank" rel="noopener noreferrer" class="btn-open-ext" title="Open in new window">
                    <i class="fas fa-external-link-alt"></i>
                  </a>
                  <button class="close-btn-premium" @click="previewDocument = null">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div class="doc-preview-viewer">
                <img 
                  v-if="isImageDoc(previewDocument)" 
                  :src="previewDocument.url" 
                  class="preview-img-viewer" 
                  :alt="previewDocument.title" 
                />
                <iframe 
                  v-else 
                  :src="previewDocument.url" 
                  class="preview-iframe-viewer" 
                  frameborder="0"
                ></iframe>
              </div>
            </div>
          </div>
        </transition>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from "@/utils/toast.js";

export default {
  components: {
    Sidebar
  },
  data() {
    return {
      viewMode: sessionStorage.getItem('arch_emp_view_mode') || 'table',
      selectedDeptFilter: 'all',
      collapsedDepts: {},
      searchQuery: '',
      dobError: false,
      userAssignedKRAs: [],
      loading: false,
      loadingData: true,
      documents: [],
      isMobile: false,
      isSidebarVisible: true,
      selectedKRAs: [],
      showPerformance: false,
      selectedUser: null,
      kraOptions: [],
      departments: [],
      users: [],
      allKRAs: [],
      showKRAPopup: false,
      selectedDocumentType: '',
      typedDocuments: {},
      showPassword: true,
      showRegister: false,
      isEditMode: false,
      editingId: null,
      registerForm: {
        id: '',
        empId: '',
        username: '',
        handle: '',
        email: '',
        gender: '',
        department: '',
        city: '',
        address: '',
        mobile: '',
        secondaryContact: '',
        keyResponsibility: '',
        birthDate: '',
        bloodGroup: '',
        password: ''
      },
      addressWarning: false,
      emailExists: false,
      nameError: false,

      // 🌟 Employee Full Details & Documents Modal State
      showEmployeeDetailsModal: false,
      selectedEmployee: null,
      activeDetailTab: 'overview',
      loadingEmployeeDocs: false,
      employeeDocumentsList: [],
      previewDocument: null,
      showDocUploadInline: false,
      inlineDocType: '',
      uploadingInlineDoc: false,
    }
  },
  watch: {
    showRegister(val) {
      document.body.style.overflow = val ? 'hidden' : '';
    },
    showKRAPopup(val) {
      document.body.style.overflow = val ? 'hidden' : '';
    },
    showPerformance(val) {
      document.body.style.overflow = val ? 'hidden' : '';
    },
    showEmployeeDetailsModal(val) {
      document.body.style.overflow = val ? 'hidden' : '';
    },
    previewDocument(val) {
      document.body.style.overflow = (val || this.showEmployeeDetailsModal || this.showRegister || this.showKRAPopup) ? 'hidden' : '';
    }
  },
  computed: {
    filteredUsers() {
      let list = this.users;
      if (this.selectedDeptFilter && this.selectedDeptFilter !== 'all') {
        list = list.filter(u => String(u.department || 'General').trim().toLowerCase() === this.selectedDeptFilter.trim().toLowerCase());
      }
      if (!this.searchQuery) return list;
      const query = this.searchQuery.toLowerCase();
      return list.filter(user =>
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.department && user.department.toLowerCase().includes(query)) ||
        (user.handle && user.handle.toLowerCase().includes(query)) ||
        (user.mobile && user.mobile.toLowerCase().includes(query)) ||
        (user.keyresponsibility && user.keyresponsibility.toLowerCase().includes(query))
      );
    },
    activeCount() {
      return this.filteredUsers.filter(u => u.status === 'active').length;
    },
    inactiveCount() {
      return this.filteredUsers.filter(u => u.status !== 'active').length;
    },
    departmentStats() {
      const map = {};
      this.filteredUsers.forEach(u => {
        const d = (u.department || 'General').trim();
        if (!map[d]) {
          map[d] = {
            name: d,
            total: 0,
            active: 0,
            inactive: 0,
            users: []
          };
        }
        map[d].total++;
        if (u.status === 'active') map[d].active++;
        else map[d].inactive++;
        map[d].users.push(u);
      });
      return Object.values(map).sort((a, b) => b.total - a.total);
    },
    allDepartmentNames() {
      const depts = new Set();
      this.users.forEach(u => {
        if (u.department) depts.add(u.department.trim());
      });
      return Array.from(depts).sort();
    },
    filteredKRAOptions() {
      const userDept = this.selectedUser?.department;
      const departmentObj = this.departments.find(dept => dept.name === userDept);
      if (!departmentObj) return [];
      return this.kraOptions.filter(kra => kra.department_id === departmentObj.id);
    },
    parsedKRAs() {
      if (!this.selectedUser || !this.selectedUser.kra_name) return [];
      if (Array.isArray(this.selectedUser.kra_name)) {
        return this.selectedUser.kra_name;
      }
      return this.selectedUser.kra_name.split(',').map(kra => kra.trim());
    }
  },
  async mounted() {
    localStorage.removeItem('arch_emp_view_mode');
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadingData = true;
    try {
      await Promise.all([
        this.fetchUsers(),
        this.fetchDepartments(),
        this.fetchAllKRAs()
      ]);
    } catch (error) {
      console.error('Error fetching employee directory:', error);
    } finally {
      this.loadingData = false;
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    setViewMode(mode) {
      this.viewMode = mode;
      sessionStorage.setItem('arch_emp_view_mode', mode);
    },
    toggleDeptCollapse(deptName) {
      this.collapsedDepts = {
        ...this.collapsedDepts,
        [deptName]: !this.collapsedDepts[deptName]
      };
    },
    isDeptCollapsed(deptName) {
      if (this.searchQuery && this.searchQuery.trim().length > 0) {
        return false;
      }
      return !!this.collapsedDepts[deptName];
    },
    expandAllDepts() {
      this.collapsedDepts = {};
    },
    collapseAllDepts() {
      const map = {};
      this.departmentStats.forEach(d => {
        map[d.name] = true;
      });
      this.collapsedDepts = map;
    },
    getDeptIcon(dept) {
      if (!dept) return 'fas fa-briefcase';
      const d = String(dept).toLowerCase();
      if (d.includes('tech') || d.includes('it') || d.includes('software') || d.includes('developer') || d.includes('eng')) return 'fas fa-laptop-code';
      if (d.includes('hr') || d.includes('human') || d.includes('talent') || d.includes('recruit')) return 'fas fa-users-cog';
      if (d.includes('sale') || d.includes('market') || d.includes('biz') || d.includes('business')) return 'fas fa-chart-line';
      if (d.includes('financ') || d.includes('account') || d.includes('tax') || d.includes('audit')) return 'fas fa-file-invoice-dollar';
      if (d.includes('operat') || d.includes('admin') || d.includes('logistic')) return 'fas fa-cogs';
      if (d.includes('manage') || d.includes('director') || d.includes('exec') || d.includes('board') || d.includes('lead')) return 'fas fa-user-tie';
      if (d.includes('design') || d.includes('ui') || d.includes('ux') || d.includes('creat')) return 'fas fa-paint-brush';
      if (d.includes('legal') || d.includes('complian') || d.includes('law')) return 'fas fa-balance-scale';
      if (d.includes('support') || d.includes('customer') || d.includes('client') || d.includes('serv')) return 'fas fa-headset';
      return 'fas fa-building';
    },
    getDeptColor(dept) {
      if (!dept) return '#64748b';
      const d = String(dept).toLowerCase();
      if (d.includes('tech') || d.includes('it') || d.includes('software')) return '#3b82f6';
      if (d.includes('hr') || d.includes('human')) return '#ec4899';
      if (d.includes('sale') || d.includes('market')) return '#f59e0b';
      if (d.includes('financ') || d.includes('account')) return '#10b981';
      if (d.includes('operat')) return '#06b6d4';
      if (d.includes('manage') || d.includes('director')) return '#8b5cf6';
      if (d.includes('design')) return '#f43f5e';
      if (d.includes('legal')) return '#d97706';
      if (d.includes('support')) return '#14b8a6';
      return '#6366f1';
    },
    getAvatarColor(name) {
      if (!name) return '#475569';
      const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5', '#db2777'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
    },
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    formatName(name) {
      if (!name) return '';
      return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    },
    toggleKRA(kraId) {
      const index = this.selectedKRAs.indexOf(kraId);
      if (index > -1) {
        this.selectedKRAs.splice(index, 1);
      } else {
        this.selectedKRAs.push(kraId);
      }
    },
    removeDocument(type) {
      delete this.typedDocuments[type];
      toastInfo('Document removed');
    },
    cancelKRA() {
      this.showKRAPopup = false;
      this.selectedKRAs = [];
      setTimeout(() => {
        this.selectedUser = null;
      }, 300);
    },
    validateDOB() {
      const dobInput = this.registerForm.birthDate;
      if (!dobInput) {
        this.dobError = false;
        return;
      }
      const dob = new Date(dobInput);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
      if (dob > today || actualAge < 18) {
        this.dobError = true;
        this.registerForm.birthDate = '';
      } else {
        this.dobError = false;
      }
    },
    checkAddressLength() {
      this.addressWarning = this.registerForm.address.length > 250;
    },
    async toggleStatus(user) {
      const newStatus = user.status === "active" ? "inactive" : "active";
      try {
        await axios.put(`https://employees.archenterprises.co.in/api/api/users-active/${user.id}`, { status: newStatus });
        user.status = newStatus;
        toastSuccess(`User is now ${newStatus}!`);
      } catch (error) {
        toastError("Failed to update status");
      }
    },
    validateName() {
      const regex = /^[A-Za-z\s]+$/;
      this.nameError = !regex.test(this.registerForm.username);
      this.registerForm.username = this.registerForm.username.replace(/[^A-Za-z\s]/g, "");
    },
    async checkEmailExists() {
      if (this.isEditMode) return;
      this.registerForm.email = this.registerForm.email.trim().toLowerCase();
      if (!this.registerForm.email) {
        this.emailExists = false;
        return;
      }
      try {
        const response = await axios.post("https://employees.archenterprises.co.in/api/api/check-email", { email: this.registerForm.email });
        this.emailExists = response.data.exists;
      } catch (error) {
        console.error("Email check failed:", error);
      }
    },
    async fetchAssignedKRAs(userId) {
      try {
        const response = await axios.get(`https://employees.archenterprises.co.in/api/api/user-kras/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.userAssignedKRAs = response.data.data || [];
      } catch (error) {
        console.error('Error fetching assigned KRAs:', error);
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!this.selectedDocumentType || !file) {
        toastWarning('Please select document type and file');
        return;
      }
      const formData = new FormData();
      formData.append('document', file);
      formData.append('empName', this.registerForm.username);
      formData.append('type', this.selectedDocumentType);
      axios.post('https://employees.archenterprises.co.in/api/api/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(() => {
        this.typedDocuments = {
          ...this.typedDocuments,
          [this.selectedDocumentType]: { name: file.name, type: this.selectedDocumentType }
        };
        this.selectedDocumentType = '';
        event.target.value = '';
        toastSuccess('Document uploaded');
      })
      .catch(() => toastError('Upload failed'));
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    toggleMobileSidebar() {
      if (this.$refs.sidebarRef) {
        this.$refs.sidebarRef.toggleCollapse();
      }
    },
    async fetchUsers(showLoading = false) {
      if (showLoading) this.loadingData = true;
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/users');
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        if (showLoading) this.loadingData = false;
      }
    },
    async fetchDepartments() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/departments');
        this.departments = response.data.data;
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    },
    async fetchAllKRAs() {
      try {
        const response = await axios.get('https://employees.archenterprises.co.in/api/api/kras');
        this.kraOptions = response.data.data;
      } catch (error) {
        console.error('Error fetching KRAs:', error);
      }
    },
    async openEmployeeDetails(user) {
      if (!user) return;
      this.selectedEmployee = { ...user };
      this.showEmployeeDetailsModal = true;
      this.activeDetailTab = 'overview';
      this.showDocUploadInline = false;
      this.inlineDocType = '';
      await this.fetchEmployeeFullDetails(user);
    },
    closeEmployeeDetails() {
      this.showEmployeeDetailsModal = false;
      this.previewDocument = null;
      this.showDocUploadInline = false;
      setTimeout(() => {
        if (!this.showEmployeeDetailsModal) {
          this.selectedEmployee = null;
        }
      }, 300);
    },
    switchFromDetailsToKRA() {
      const u = this.selectedEmployee;
      this.closeEmployeeDetails();
      if (u) {
        this.openKRASelection(u);
      }
    },
    switchFromDetailsToEdit() {
      const u = this.selectedEmployee;
      this.closeEmployeeDetails();
      if (u) {
        this.editUser(u);
      }
    },
    getEmployeePhoto(user) {
      if (!user) return null;
      if (user.profile_photo && typeof user.profile_photo === 'string' && user.profile_photo.trim()) {
        const photo = user.profile_photo.trim();
        return photo.startsWith('http') ? photo : `https://employees.archenterprises.co.in/backend/public/storage/${photo.replace(/^\/+/, '')}`;
      }
      if (user.profile_picture && typeof user.profile_picture === 'string' && user.profile_picture.trim()) {
        const pic = user.profile_picture.trim();
        return pic.startsWith('http') ? pic : `https://employees.archenterprises.co.in/backend/public/storage/${pic.replace(/^\/+/, '')}`;
      }
      return null;
    },
    formatBirthDate(dob) {
      if (!dob) return '—';
      try {
        const date = new Date(dob);
        if (isNaN(date.getTime())) return dob;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return dob;
      }
    },
    calculateEmployeeAge(dob) {
      if (!dob) return '—';
      try {
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return '—';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age > 0 ? `${age} Years` : '—';
      } catch (e) {
        return '—';
      }
    },
    formatJoinedDate(dateStr) {
      if (!dateStr) return '—';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    },
    getEmployeeKRAsList(user) {
      if (!user) return [];
      if (user.kra_name) {
        if (Array.isArray(user.kra_name)) return user.kra_name;
        return String(user.kra_name).split(',').map(k => k.trim()).filter(Boolean);
      }
      if (this.userAssignedKRAs && this.userAssignedKRAs.length > 0) {
        return this.userAssignedKRAs.map(k => (typeof k === 'object' ? k.name : k)).filter(Boolean);
      }
      return [];
    },
    getEmployeeKRAsCount(user) {
      return this.getEmployeeKRAsList(user).length;
    },
    getDocIcon(doc) {
      if (!doc) return 'fas fa-file';
      const ext = (doc.extension || '').toLowerCase();
      const type = (doc.type || '').toLowerCase();
      if (type === 'photo' || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
        return 'fas fa-id-badge';
      }
      if (ext === 'pdf') return 'fas fa-file-pdf';
      if (['doc', 'docx'].includes(ext)) return 'fas fa-file-word';
      if (type.includes('aadhaar')) return 'fas fa-id-card';
      if (type.includes('address')) return 'fas fa-home';
      if (type.includes('education') || type.includes('degree') || type.includes('certificate')) return 'fas fa-graduation-cap';
      if (type.includes('letter') || type.includes('offer')) return 'fas fa-file-signature';
      return 'fas fa-file-alt';
    },
    getDocIconClass(doc) {
      if (!doc) return 'default';
      const ext = (doc.extension || '').toLowerCase();
      const type = (doc.type || '').toLowerCase();
      if (type === 'photo' || ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'photo';
      if (ext === 'pdf') return 'pdf';
      if (['doc', 'docx'].includes(ext)) return 'word';
      return 'doc';
    },
    isImageDoc(doc) {
      if (!doc) return false;
      const ext = (doc.extension || '').toLowerCase();
      const type = (doc.type || '').toLowerCase();
      return type === 'photo' || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
    },
    previewDoc(doc) {
      if (!doc || !doc.url) return;
      this.previewDocument = doc;
    },
    async fetchEmployeeFullDetails(user) {
      this.loadingEmployeeDocs = true;
      this.employeeDocumentsList = [];

      // 1. Fetch KRAs in background
      try {
        await this.fetchAssignedKRAs(user.id);
      } catch (e) {
        console.warn('Failed to load KRAs for user', e);
      }

      // 2. Fetch server documents
      let serverDocs = [];
      try {
        const docRes = await axios.get(`https://employees.archenterprises.co.in/api/api/user-documents/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (docRes.data && Array.isArray(docRes.data.documents)) {
          serverDocs = docRes.data.documents;
        }
      } catch (e) {
        // Fallback to local or check user profile
        try {
          const localRes = await axios.get(`/api/api/user-documents/${user.id}`);
          if (localRes.data && Array.isArray(localRes.data.documents)) {
            serverDocs = localRes.data.documents;
          }
        } catch (err) {}
      }

      // 3. Assemble complete list with standard mandatory verification documents
      const docs = [];

      // A) Official Photo
      const photoUrl = this.getEmployeePhoto(user);
      docs.push({
        id: 'doc_photo',
        title: 'Official ID Photograph',
        type: 'photo',
        category: 'Identification',
        filename: user.profile_photo ? user.profile_photo.split('/').pop() : (photoUrl ? 'profile_picture.png' : null),
        url: photoUrl,
        extension: photoUrl ? (photoUrl.split('.').pop() || 'png') : 'png',
        uploaded_at: this.formatJoinedDate(user.updated_at || user.created_at)
      });

      // B) Standard Document Checklist
      const standardTypes = [
        { type: 'aadhaar_card', title: 'Aadhaar Card / National ID', category: 'Government ID' },
        { type: 'permanent_address_proof', title: 'Permanent Address Proof', category: 'Address Verification' },
        { type: 'education_certificate', title: 'Educational Qualification / Degree', category: 'Academic Credential' },
        { type: 'relevance_letter', title: 'Company Appointment / Relevance Letter', category: 'Employment Record' },
      ];

      standardTypes.forEach(std => {
        const found = serverDocs.find(d => d.type === std.type || String(d.title).toLowerCase().includes(std.type.replace(/_/g, ' ')));
        if (found) {
          docs.push({
            ...std,
            ...found,
            category: std.category
          });
        } else {
          let matchedUrl = null;
          let matchedName = null;
          if (user.vault_filename && user.vault_filename.toLowerCase().includes(std.type.split('_')[0])) {
            matchedUrl = `https://employees.archenterprises.co.in/backend/public/storage/${user.vault_filename}`;
            matchedName = user.vault_filename.split('/').pop();
          }
          docs.push({
            id: 'doc_' + std.type,
            title: std.title,
            type: std.type,
            category: std.category,
            filename: matchedName,
            url: matchedUrl,
            extension: matchedName ? matchedName.split('.').pop() : 'pdf',
            uploaded_at: matchedUrl ? this.formatJoinedDate(user.created_at) : null
          });
        }
      });

      // C) Any other extra server docs not yet matched
      serverDocs.forEach(sDoc => {
        if (!docs.some(d => d.id === sDoc.id || (sDoc.filename && d.filename === sDoc.filename))) {
          docs.push({
            ...sDoc,
            category: sDoc.category || 'Uploaded File'
          });
        }
      });

      this.employeeDocumentsList = docs;
      this.loadingEmployeeDocs = false;
    },
    async handleInlineDocUpload(event) {
      const file = event.target.files[0];
      if (!file || !this.inlineDocType) {
        toastWarning('Please select a file and document type');
        return;
      }
      await this.uploadEmployeeDocumentFile(this.inlineDocType, file);
      event.target.value = '';
    },
    async uploadSpecificDocType(type, event) {
      const file = event.target.files[0];
      if (!file) return;
      await this.uploadEmployeeDocumentFile(type, file);
      event.target.value = '';
    },
    async uploadEmployeeDocumentFile(type, file) {
      this.uploadingInlineDoc = true;
      try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('empName', this.selectedEmployee?.name || 'Employee');
        formData.append('type', type);
        if (this.selectedEmployee?.id) {
          formData.append('user_id', this.selectedEmployee.id);
        }

        const res = await axios.post('https://employees.archenterprises.co.in/api/api/upload-document', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        toastSuccess(`${type.replace(/_/g, ' ')} uploaded successfully!`);
        this.showDocUploadInline = false;
        this.inlineDocType = '';

        const cleanFilename = res.data?.filename || file.name;
        const cleanPath = res.data?.path || `uploads/${cleanFilename}`;
        const fileUrl = `https://employees.archenterprises.co.in/backend/public/storage/${cleanPath.replace(/^\/+/, '')}`;

        const existingIdx = this.employeeDocumentsList.findIndex(d => d.type === type);
        if (existingIdx > -1) {
          this.employeeDocumentsList[existingIdx].url = fileUrl;
          this.employeeDocumentsList[existingIdx].filename = file.name;
          this.employeeDocumentsList[existingIdx].extension = file.name.split('.').pop() || 'pdf';
          this.employeeDocumentsList[existingIdx].uploaded_at = 'Just now';
        } else {
          this.employeeDocumentsList.push({
            id: 'doc_' + Date.now(),
            title: type.replace(/_/g, ' ').toUpperCase(),
            type: type,
            category: 'Uploaded Document',
            filename: file.name,
            url: fileUrl,
            extension: file.name.split('.').pop() || 'pdf',
            uploaded_at: 'Just now'
          });
        }
      } catch (err) {
        toastError('Failed to upload document');
        console.error(err);
      } finally {
        this.uploadingInlineDoc = false;
      }
    },
    async openKRASelection(user) {
      this.selectedUser = user;
      this.selectedKRAs = [];
      this.showKRAPopup = true;
      await this.fetchAssignedKRAs(user.id);
    },
    assignKRA() {
      if (this.selectedKRAs.length === 0) {
        toastWarning('Please select at least one KRA');
        return;
      }
      axios.post('https://employees.archenterprises.co.in/api/api/assign-kra', {
        user_id: this.selectedUser.id,
        kra_ids: this.selectedKRAs,
      })
      .then(() => {
        toastSuccess('KRA(s) assigned successfully!');
        this.showKRAPopup = false;
        this.selectedKRAs = [];
        this.fetchUsers();
      })
      .catch(() => toastError('Failed to assign KRAs'));
    },
    editUser(user) {
      this.isEditMode = true;
      this.editingId = user.id;
      this.showRegister = true;
      this.registerForm = {
        id: user.id,
        empId: user.empId || '',
        username: user.name || '',
        handle: user.handle || '',
        email: user.email || '',
        gender: user.gender || '',
        department: user.department || '',
        city: user.city || '',
        address: user.address || '',
        mobile: user.mobile || '',
        secondaryContact: user.mobile2 || '',
        keyResponsibility: user.keyresponsibility || '',
        birthDate: user.dateofbirth || '',
        bloodGroup: user.bloodgroup || '',
        password: ''
      };
    },
  async handleRegister() {
  if (this.nameError) {
    toastWarning("Invalid name format");
    return;
  }
  if (!this.isEditMode && Object.keys(this.typedDocuments).length === 0) {
    toastWarning("Please upload at least one document");
    return;
  }
  if (!this.validateForm()) return;
  
  this.loading = true;
  try {
    if (this.isEditMode) {
      await axios.put(`https://employees.archenterprises.co.in/api/api/users/${this.editingId}`, {
        username: this.registerForm.username,
        handle: this.registerForm.handle,
        email: this.registerForm.email.toLowerCase(),
        gender: this.registerForm.gender,
        department: this.registerForm.department,
        city: this.registerForm.city,
        address: this.registerForm.address,
        mobile: this.registerForm.mobile,
        secondaryContact: this.registerForm.secondaryContact,
        birthDate: this.registerForm.birthDate,
        bloodGroup: this.registerForm.bloodGroup,
        keyResponsibility: this.registerForm.keyResponsibility ? String(this.registerForm.keyResponsibility) : ''
      });
      toastSuccess("User updated successfully!");
    } else {
      if (!this.registerForm.password) this.generatePassword();
      await axios.post("https://employees.archenterprises.co.in/api/api/register", {
        ...this.registerForm,
        email: this.registerForm.email.toLowerCase(),
        keyResponsibility: this.registerForm.keyResponsibility ? String(this.registerForm.keyResponsibility) : ''
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toastSuccess("Registration successful!");
    }
    this.showRegister = false;
    this.resetForm();
    this.fetchUsers();
  } catch (error) {
    toastError("Operation failed");
  } finally {
    this.loading = false;
  }
},
    validateForm() {
      const form = this.registerForm;
      if (!/^[A-Za-z ]+$/.test(form.username.trim())) {
        toastWarning("Name must contain only letters");
        return false;
      }
      if (!/^[A-Za-z0-9_]+$/.test(form.handle.trim())) {
        toastWarning("Handle can only contain letters, numbers, underscores");
        return false;
      }
      if (this.dobError || !form.birthDate) {
        toastWarning("Please enter valid date of birth (18+)");
        return false;
      }
      if (!/^[0-9]{10}$/.test(form.mobile)) {
        toastError("Contact number must be 10 digits");
        return false;
      }
      if (form.secondaryContact && !/^[0-9]{10}$/.test(form.secondaryContact)) {
        toastError("Secondary contact must be 10 digits");
        return false;
      }
      return true;
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    generatePassword() {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.registerForm.password = password;
    },
    openRegisterForm() {
      this.resetForm();
      this.showRegister = true;
    },
    closeRegisterForm() {
      this.showRegister = false;
      this.resetForm();
    },
    resetForm() {
      this.registerForm = {
        id: '', empId: '', username: '', handle: '', email: '', gender: '',
        department: '', city: '', address: '', mobile: '', secondaryContact: '',
        keyResponsibility: '', birthDate: '', bloodGroup: '', password: ''
      };
      this.typedDocuments = {};
      this.selectedDocumentType = '';
      this.isEditMode = false;
      this.editingId = null;
      this.nameError = false;
      this.emailExists = false;
      this.dobError = false;
      this.addressWarning = false;
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* Variables */
:root {
  --primary: #4f46e5;
  --primary-color: #4f46e5;
  --dark: #0f172a;
  --gray: #f8fafc;
  --border: #e2e8f0;
  --success: #10b981;
  --danger: #ef4444;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.layout {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

/* ================= ⏳ MODERN EMPLOYEE DIRECTORY LOADER ================= */
.emp-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  text-align: center;
  min-height: 380px;
  margin: 12px 0 20px 0;
}

.emp-loading-pulse-halo {
  position: relative;
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.emp-spinner-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-right-color: #818cf8;
  animation: empSpin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
}

.emp-spinner-icon {
  font-size: 28px;
  color: #4f46e5;
  animation: empIconPulse 1.8s ease-in-out infinite;
}

@keyframes empSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes empIconPulse {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.12); opacity: 1; }
}

.emp-loading-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
}

.emp-loading-sub {
  font-size: 13.5px;
  color: #64748b;
  margin: 0 0 24px 0;
  max-width: 440px;
  line-height: 1.5;
}

.emp-loading-progress-bar {
  width: 220px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.emp-loading-progress-indeterminate {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 45%;
  background: linear-gradient(90deg, #4f46e5, #818cf8);
  border-radius: 999px;
  animation: empIndeterminate 1.4s ease-in-out infinite;
}

@keyframes empIndeterminate {
  0% { left: -45%; width: 45%; }
  50% { left: 35%; width: 55%; }
  100% { left: 100%; width: 45%; }
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

/* Premium Modal */
.premium-modal {
  position: relative;
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.premium-modal.kra-modal,
.premium-modal.assigned-modal {
  max-width: 550px;
}

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

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

/* Modal Header */
.modal-header-premium {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-icon-premium {
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

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
}

.header-text p {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.close-btn-premium {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  font-size: 18px;
}

.close-btn-premium:hover {
  color: rgb(0, 0, 0);
  transform: rotate(90deg);
}

/* Modal Body with Scrolling */
.modal-body-premium {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: #fafbfc;
}

.modal-body-premium::-webkit-scrollbar {
  width: 6px;
}

.modal-body-premium::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 10px;
}

.modal-body-premium::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

/* Form Sections */
.form-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.section-title i {
  color: var(--primary-color);
  font-size: 18px;
}

.form-row-premium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required-star {
  color: var(--danger);
}

.field-wrapper {
  position: relative;
}

.field-wrapper .field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.field-wrapper textarea + .field-icon {
  top: 18px;
  transform: none;
}

.field-wrapper input,
.field-wrapper select,
.field-wrapper textarea {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
  background: white;
}

.field-wrapper textarea {
  padding-top: 12px;
  resize: vertical;
  min-height: 80px;
}

.field-wrapper input:focus,
.field-wrapper select:focus,
.field-wrapper textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.field-wrapper input.error {
  border-color: var(--danger);
}

.field-error {
  font-size: 11px;
  color: var(--danger);
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-hint {
  font-size: 11px;
  color: #6b7280;
}

.char-count {
  font-size: 11px;
  text-align: right;
  color: #6b7280;
  margin-top: 4px;
}

.char-count.warning {
  color: #f59e0b;
}

/* Password Field */
.password-field-premium {
  display: flex;
  gap: 10px;
  align-items: center;
}

.icon-btn-premium {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-btn-premium:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.generate-btn-premium {
  padding: 0 16px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: var(--primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.generate-btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Documents Area */
.documents-area {
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.documents-area:hover {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.02);
}

.upload-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.doc-select {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
}

.upload-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn:hover {
  background: #e5e7eb;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 12px;
  font-size: 13px;
  animation: slideIn 0.3s ease;
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

.doc-item i:first-child {
  color: var(--success);
}

.remove-doc-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.remove-doc-btn:hover {
  color: var(--danger);
}

/* Modal Footer */
.modal-footer-premium {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-cancel-premium,
.btn-secondary-premium,
.btn-submit-premium {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.btn-cancel-premium {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
}

.btn-cancel-premium:hover {
  background: #e5e7eb;
}

.btn-secondary-premium {
  background: #e0e7ff;
  border: none;
  color: var(--primary-color);
}

.btn-secondary-premium:hover {
  background: #c7d2fe;
}

.btn-submit-premium {
  background: var(--primary);
  border: none;
  color: white;
}

.btn-submit-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* KRA Styles */
.kra-body {
  padding: 0;
}

.kra-container {
  padding: 20px;
}

.kra-header,
.assigned-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  font-weight: 600;
  color: #1a1a2e;
}

.kra-list {
  max-height: 350px;
  overflow-y: auto;
  padding: 8px;
}

.kra-list::-webkit-scrollbar {
  width: 4px;
}

.kra-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  margin-bottom: 8px;
  background: #f9fafb;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.kra-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.kra-item.selected {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}

.kra-checkbox i {
  font-size: 20px;
  color: var(--primary-color);
}

.kra-info {
  flex: 1;
}

.kra-name {
  font-size: 14px;
  font-weight: 500;
}

/* Assigned Items */
.assigned-body {
  padding: 0;
}

.assigned-container {
  padding: 20px;
}

.assigned-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 350px;
  overflow-y: auto;
  padding: 8px;
}

.assigned-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: 14px;
  animation: slideIn 0.3s ease;
}

.assigned-item i {
  color: var(--success);
  font-size: 18px;
}

.no-items {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.no-items i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

/* Main Content Styles & Stationary Sidebar Flow */
.main-content {
  display: flex;
  padding: 20px 24px;
  gap: 20px;
  min-height: calc(100vh - 78px);
  position: relative;
  box-sizing: border-box;
  width: 100%;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-x: hidden;
}

/* 📱 Mobile Top Header */
.mobile-header {
  display: none;
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

.btn-register-header-sm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

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
}

/* 🏢 Modern Enterprise Top Banner */
.emp-top-banner {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px 28px;
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
  margin-bottom: 8px;
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

.status-meta-pill.success {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}

.status-meta-pill.success i {
  color: #059669;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
  line-height: 1.45;
}

.banner-right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-register-emp {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #4f46e5;
  border: 1px solid #4338ca;
  border-radius: 10px;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);
  white-space: nowrap;
}

.btn-register-emp:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

/* 🔍 Unified Toolbar & Filter Bar */
.emp-toolbar-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.toolbar-search-wrapper {
  position: relative;
  flex: 1;
  min-width: 280px;
  max-width: 440px;
}

.toolbar-search-wrapper .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13.5px;
  pointer-events: none;
}

.toolbar-search-input {
  box-sizing: border-box !important;
  width: 100%;
  height: 40px;
  padding: 8px 36px 8px 38px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.toolbar-search-input:focus {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.toolbar-search-input::placeholder {
  color: #94a3b8;
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
  padding: 4px 6px;
  border-radius: 50%;
  font-size: 12px;
  transition: all 0.15s;
}

.clear-search-btn:hover {
  color: #ef4444;
}

/* View Mode Switcher Segmented Control */
.view-mode-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 11px;
  gap: 3px;
  border: 1px solid #e2e8f0;
}

.view-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.view-tab-btn:hover {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.6);
}

.view-tab-btn.active {
  background: #ffffff;
  color: #4f46e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.view-tab-btn.active i {
  color: #4f46e5;
}

.toolbar-stats-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.toolbar-stats-pill i {
  color: #4f46e5;
}

/* Quick Department Filter Strip */
.dept-quick-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
  -webkit-overflow-scrolling: touch;
}

.dept-quick-strip::-webkit-scrollbar {
  height: 4px;
}

.dept-quick-strip::-webkit-scrollbar-track {
  background: transparent;
}

.dept-quick-strip::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.dept-quick-strip::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dept-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.dept-chip:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
}

.dept-chip.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
}

.dept-chip.active i {
  color: #38bdf8 !important;
}

.dept-chip .chip-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #f1f5f9;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
}

.dept-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

/* ========================================================= */
/* 🌳 TREE STRUCTURE VISUALIZATION STYLES                    */
/* ========================================================= */
.tree-view-wrapper {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  margin-bottom: 24px;
}

.tree-controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}

.tree-stats-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tree-stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 12px;
  color: #475569;
}

.tree-stat-pill.emerald {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}

.tree-stat-pill.slate {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

.tree-btn-group {
  display: flex;
  gap: 8px;
}

.btn-tree-tool {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tree-tool:hover {
  background: #ffffff;
  color: #2563eb;
  border-color: #93c5fd;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.1);
}

/* Org Tree Chart Layout */
.org-tree-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Root Node */
.tree-root-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
}

.org-company-node {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
  transition: transform 0.2s ease;
}

.org-company-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.4);
}

.company-badge-halo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.company-info-block {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.company-name {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.3px;
  margin: 0;
  color: #ffffff;
}

.company-sub {
  font-size: 12px;
  color: #94a3b8;
}

.company-meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #38bdf8;
  margin-left: 12px;
}

.tree-trunk-line {
  width: 3px;
  height: 32px;
  background: #cbd5e1;
  border-radius: 2px;
}

/* Departments Flow */
.tree-departments-flow {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.dept-branch-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 20px;
  transition: all 0.3s ease;
  position: relative;
}

.dept-branch-block:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.dept-branch-block.collapsed {
  background: #ffffff;
}

/* Department Header Card */
.dept-header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.dept-header-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dept-icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: transform 0.2s ease;
}

.dept-header-box:hover .dept-icon-circle {
  transform: scale(1.06);
}

.dept-title-meta {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.dept-name-heading {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.dept-subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.dept-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dept-count-badge {
  color: #ffffff;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.btn-dept-expand {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s ease, color 0.2s ease;
}

.dept-header-box:hover .btn-dept-expand {
  color: #2563eb;
}

/* Connector Line from Department to Employees */
.dept-stem-line {
  width: 2px;
  height: 16px;
  background: #cbd5e1;
  margin: 8px 0 12px 20px;
}

/* Employee Nodes in Tree */
.dept-employee-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  margin-top: 4px;
}

.tree-employee-leaf {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.tree-employee-leaf:hover {
  transform: translateY(-2px);
  border-color: #93c5fd;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
}

.tree-employee-leaf.inactive {
  opacity: 0.7;
  background: #f8fafc;
}

.leaf-avatar-section {
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.leaf-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.leaf-status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.leaf-status-dot.active {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.leaf-status-dot.inactive {
  background: #94a3b8;
}

.leaf-details-section {
  flex: 1;
  min-width: 0;
  cursor: pointer;
  text-align: left;
}

.leaf-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.leaf-name {
  font-size: 14px;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kra-leaf-hint {
  font-size: 11px;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.tree-employee-leaf:hover .kra-leaf-hint {
  opacity: 1;
  color: #2563eb;
}

.leaf-role {
  font-size: 11.5px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leaf-contacts {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 6px;
}

.leaf-contact-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #64748b;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.leaf-contact-chip:hover {
  color: #2563eb;
}

.leaf-contact-chip.phone {
  color: #059669;
}

.truncate-txt {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Actions in Leaf */
.leaf-actions-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.leaf-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.leaf-btn.edit:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.leaf-btn.kra:hover {
  background: #faf5ff;
  color: #7c3aed;
  border-color: #ddd6fe;
}

.leaf-btn.toggle.activate {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}

.leaf-btn.toggle.deactivate {
  background: #f8fafc;
  color: #64748b;
}

.leaf-btn.toggle.deactivate:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.tree-empty-card,
.cards-empty-state {
  padding: 48px 24px;
  text-align: center;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  width: 100%;
}

.tree-empty-card i,
.cards-empty-state i {
  font-size: 40px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.tree-empty-card h4,
.cards-empty-state h4 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.tree-empty-card p,
.cards-empty-state p {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}

.btn-clear-search {
  padding: 8px 16px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

/* ========================================================= */
/* 🎨 VISUAL ICONS & CARDS GRID STYLES                       */
/* ========================================================= */
.visual-cards-wrapper {
  width: 100%;
  margin-bottom: 24px;
}

.visual-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.visual-emp-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.visual-emp-card:hover {
  transform: translateY(-4px);
  border-color: #bfdbfe;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.1);
}

.visual-emp-card.inactive {
  opacity: 0.75;
  background: #f8fafc;
}

.card-color-stripe {
  height: 4px;
  width: 100%;
}

.card-top-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px 4px 14px;
}

.dept-tag-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-pill-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-pill-badge.active {
  background: #ecfdf5;
  color: #059669;
}

.status-pill-badge.inactive {
  background: #f1f5f9;
  color: #64748b;
}

.card-hero-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px 8px 16px;
  cursor: pointer;
  text-align: center;
}

.avatar-hero-ring {
  position: relative;
  margin-bottom: 10px;
}

.avatar-hero {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  color: #ffffff;
  font-weight: 800;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease;
}

.card-hero-profile:hover .avatar-hero {
  transform: scale(1.05);
}

.kra-hero-hint {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #ffffff;
  color: #2563eb;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.hero-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.hero-handle {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
  font-family: monospace;
}

.hero-role-pill {
  margin-top: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-contacts-strip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 16px 12px 16px;
  margin-top: auto;
}

.contact-pill-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #64748b;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-pill-link:hover {
  color: #2563eb;
}

.contact-pill-link.phone {
  color: #059669;
}

.card-bottom-actions {
  display: flex;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}

.btn-card-tool {
  flex: 1;
  padding: 9px 8px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-card-tool:not(:last-child) {
  border-right: 1px solid #f1f5f9;
}

.btn-card-tool.kra:hover {
  background: #faf5ff;
  color: #7c3aed;
}

.btn-card-tool.edit:hover {
  background: #eff6ff;
  color: #2563eb;
}

.btn-card-tool.toggle.deactivate:hover {
  background: #fef2f2;
  color: #dc2626;
}

.btn-card-tool.toggle.activate {
  color: #059669;
}

.btn-card-tool.toggle.activate:hover {
  background: #ecfdf5;
}

/* Mobile Cards */
.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.employee-card {
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

.card-avatar {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
}

.card-avatar .avatar {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.card-name {
  font-weight: 600;
  color: var(--dark);
  font-size: 14px;
}

.kra-hint-mobile {
  color: var(--primary-color);
  font-size: 14px;
  opacity: 0.5;
}

.status-badge-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge-mobile.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge-mobile.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge-mobile i {
  font-size: 5px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-value {
  font-size: 13px;
  color: var(--dark);
  text-align: right;
  word-break: break-word;
  max-width: 60%;
}

.dept-badge-mobile {
  padding: 2px 10px;
  background: #e0e7ff;
  color: var(--primary-color);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.card-action-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.card-action-btn.kra {
  background: #eef2ff;
  color: #4338ca;
}

.card-action-btn.kra:active {
  transform: scale(0.97);
}

.card-action-btn.edit {
  background: #e0e7ff;
  color: var(--primary-color);
}

.card-action-btn.edit:active {
  transform: scale(0.97);
}

.card-action-btn.toggle.deactivate {
  background: #fee2e2;
  color: #991b1b;
}

.card-action-btn.toggle.deactivate:active {
  transform: scale(0.97);
}

.card-action-btn.toggle.activate {
  background: #d1fae5;
  color: #065f46;
}

.card-action-btn.toggle.activate:active {
  transform: scale(0.97);
}

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

.empty-state-mobile p {
  font-size: 16px;
  margin-bottom: 4px;
  color: #6b7280;
}

/* ========================================================= */
/* 📋 3. MODERN ENTERPRISE DATA TABLE STYLES                 */
/* ========================================================= */
.table-card-wrapper {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 24px;
  width: 100%;
}

.table-responsive-box {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.table-responsive-box::-webkit-scrollbar {
  height: 6px;
}

.table-responsive-box::-webkit-scrollbar-track {
  background: #f8fafc;
}

.table-responsive-box::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-responsive-box::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.employee-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  text-align: left;
}

.employee-table thead th {
  padding: 12px 14px;
  background: #f8fafc;
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.employee-table thead th.th-num {
  width: 44px;
  min-width: 44px;
  max-width: 44px;
  text-align: center;
  padding: 12px 6px;
}

.employee-table thead th.th-emp {
  min-width: 180px;
}

.employee-table thead th.th-email {
  min-width: 170px;
}

.employee-table thead th.th-dept {
  min-width: 115px;
}

.employee-table thead th.th-contact {
  min-width: 120px;
}

.employee-table thead th.th-status {
  min-width: 95px;
}

.employee-table thead th.th-actions {
  min-width: 145px;
  text-align: right;
  padding-right: 18px;
  position: sticky;
  right: 0;
  background: #f8fafc;
  z-index: 3;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.04);
}

.emp-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.emp-row:hover {
  background-color: #f8fafc;
}

.emp-row td {
  padding: 10px 14px;
  font-size: 13px;
  color: #334155;
  vertical-align: middle;
}

.emp-row td.td-num {
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  padding: 10px 6px;
}

.employee-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.employee-meta-col {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.emp-full-name {
  font-weight: 700;
  font-size: 13.5px;
  color: #0f172a;
  cursor: pointer;
  transition: color 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.emp-full-name:hover {
  color: #4f46e5;
}

.kra-row-hint {
  font-size: 11px;
  color: #818cf8;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.emp-full-name:hover .kra-row-hint {
  opacity: 1;
}

.emp-handle {
  font-size: 11.5px;
  color: #94a3b8;
  font-family: monospace;
}

.td-email .email-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s ease;
  max-width: 220px;
}

.td-email .email-link:hover {
  color: #4f46e5;
}

.td-email .email-link i {
  color: #94a3b8;
  font-size: 12px;
}

.truncate-txt {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-contact .phone-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s ease;
}

.td-contact .phone-link:hover {
  color: #4f46e5;
}

.td-contact .phone-link i {
  color: #94a3b8;
  font-size: 11px;
}

.empty-field {
  color: #cbd5e1;
  font-weight: 600;
}

.dept-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  white-space: nowrap;
}

.dept-badge i {
  font-size: 11px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.active {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-badge.inactive {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.active .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}

.status-badge.inactive .status-dot {
  background: #94a3b8;
}

.emp-row td.td-actions {
  text-align: right;
  padding-right: 18px;
  position: sticky;
  right: 0;
  background: #ffffff;
  z-index: 2;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.04);
}

.emp-row:hover td.td-actions {
  background: #f8fafc;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.kra {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4338ca;
}

.action-btn.kra:hover {
  background: #4338ca;
  color: #ffffff;
  border-color: #4338ca;
  box-shadow: 0 2px 6px rgba(67, 56, 202, 0.25);
}

.action-btn.edit:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.action-btn.toggle.deactivate:hover {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}

.action-btn.toggle.activate:hover {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}

.empty-state {
  padding: 48px 20px;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-content i {
  font-size: 38px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.empty-content h4 {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.empty-content p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 10px 0;
}

.btn-clear-table-search {
  padding: 6px 14px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

/* Modal Fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive Media Queries */
@media (max-width: 1200px) {
  .main-content {
    padding: 16px 20px;
    gap: 20px;
  }

  .emp-top-banner {
    padding: 18px 22px;
    gap: 16px;
  }

  .emp-toolbar-card {
    padding: 10px 14px;
    gap: 12px;
  }

  .toolbar-search-wrapper {
    min-width: 220px;
  }
}

@media (max-width: 992px) {
  .main-content {
    padding: 14px 16px;
    gap: 16px;
  }

  .content {
    gap: 16px;
  }

  .emp-top-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 18px;
  }

  .banner-badge-row {
    gap: 8px;
  }

  .banner-right-actions {
    width: 100%;
  }

  .btn-register-emp {
    width: 100%;
    justify-content: center;
  }

  .emp-toolbar-card {
    padding: 12px 14px;
    gap: 12px;
  }

  .toolbar-search-wrapper {
    min-width: 100%;
    max-width: 100%;
    flex: 1 1 100%;
    order: 1;
  }

  .view-mode-tabs {
    order: 2;
    flex: 1 1 auto;
    overflow-x: auto;
  }

  .toolbar-stats-pill {
    order: 3;
  }

  /* Tree Structure on Tablets */
  .tree-controls-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tree-btn-group {
    width: 100%;
    justify-content: flex-start;
  }

  .dept-employee-cards-row {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  /* Visual Cards Grid on Tablets */
  .visual-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
    gap: 14px;
  }

  .content {
    padding: 0;
    border-radius: 0;
    gap: 14px;
  }

  .mobile-header {
    display: flex;
  }

  .emp-top-banner {
    padding: 14px 16px;
    border-radius: 14px;
  }

  .emp-top-banner .banner-right-actions {
    display: none;
  }

  .page-title {
    font-size: 18px;
  }

  .page-subtitle {
    font-size: 12.5px;
  }

  .emp-toolbar-card {
    padding: 10px 12px;
    border-radius: 12px;
    gap: 10px;
  }

  .view-mode-tabs {
    width: 100%;
    justify-content: space-between;
    overflow-x: auto;
  }

  .view-tab-btn {
    flex: 1;
    justify-content: center;
    padding: 7px 6px;
    font-size: 11.5px;
  }

  .toolbar-stats-pill {
    width: 100%;
    justify-content: center;
  }

  .dept-quick-strip {
    gap: 6px;
    padding-bottom: 6px;
  }

  .dept-chip {
    padding: 5px 10px;
    font-size: 11.5px;
  }

  .dept-chip .chip-count {
    min-width: 16px;
    height: 16px;
    font-size: 10px;
  }

  .mobile-cards {
    display: flex;
    gap: 12px;
  }

  .employee-card {
    padding: 14px;
    border-radius: 14px;
  }

  .visual-cards-grid {
    grid-template-columns: 1fr;
  }

  .dept-employee-cards-row {
    grid-template-columns: 1fr;
  }

  /* Modals on Mobile */
  .premium-modal {
    max-width: 95%;
    max-height: 85vh;
    border-radius: 20px;
    margin: 10px;
  }

  .form-row-premium {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .modal-header-premium {
    padding: 16px 18px;
  }

  .modal-header-premium h2 {
    font-size: 18px;
  }

  .modal-body-premium {
    padding: 16px;
  }

  .modal-footer-premium {
    padding: 14px 18px;
    flex-direction: column;
    gap: 8px;
  }

  .btn-cancel-premium,
  .btn-secondary-premium,
  .btn-submit-premium {
    width: 100%;
    justify-content: center;
  }

  .premium-modal.kra-modal,
  .premium-modal.assigned-modal {
    max-width: 95%;
  }

  .upload-row {
    flex-direction: column;
  }

  .password-field-premium {
    flex-direction: column;
    gap: 8px;
  }

  .icon-btn-premium {
    width: 100%;
  }

  .generate-btn-premium {
    width: 100%;
    justify-content: center;
  }

  .doc-item {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px 6px;
  }

  .emp-top-banner {
    padding: 12px 14px;
  }

  .banner-badge-row {
    gap: 6px;
  }

  .portal-badge-pill,
  .status-meta-pill {
    font-size: 10.5px;
    padding: 3px 8px;
  }

  .page-title {
    font-size: 16.5px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .view-tab-btn {
    padding: 6px 4px;
    font-size: 11px;
    gap: 4px;
  }

  .employee-card {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .card-actions {
    flex-direction: column;
    gap: 8px;
  }

  .card-action-btn {
    width: 100%;
  }

  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .card-value {
    text-align: left;
    max-width: 100%;
  }

  .dept-badge-mobile {
    align-self: flex-start;
  }

  .modal-header-premium {
    padding: 12px 14px;
  }

  .modal-header-premium h2 {
    font-size: 16px;
  }

  .header-icon-premium {
    width: 38px;
    height: 38px;
    font-size: 17px;
  }

  .modal-body-premium {
    padding: 12px;
  }

  .modal-footer-premium {
    padding: 12px 14px;
  }

  .form-section {
    padding: 14px;
  }

  .section-title {
    font-size: 14px;
  }
}

/* ========================================================= */
/* 🌟 EMPLOYEE FULL DETAILS & DOCUMENTS MODAL STYLES         */
/* ========================================================= */
.emp-details-backdrop {
  z-index: 10050;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
}

.emp-details-modal {
  max-width: 980px;
  width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(226, 232, 240, 0.9);
  animation: modalSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.emp-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px 18px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  gap: 16px;
  flex-wrap: wrap;
}

.emp-hero-profile {
  display: flex;
  align-items: center;
  gap: 18px;
}

.emp-details-avatar {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 22px;
  box-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.35);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid #ffffff;
}

.emp-details-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.emp-hero-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.emp-name-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.emp-details-name {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0;
}

.emp-hero-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.emp-hero-handle {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.emp-tag-divider {
  color: #cbd5e1;
  font-size: 12px;
}

.emp-code-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  font-family: monospace;
}

.emp-details-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-head-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-head-action.kra-btn {
  background: #eef2ff;
  color: #4f46e5;
  border-color: #c7d2fe;
}

.btn-head-action.kra-btn:hover {
  background: #e0e7ff;
  transform: translateY(-1px);
}

.btn-head-action.edit-btn {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

.btn-head-action.edit-btn:hover {
  background: #dcfce7;
  transform: translateY(-1px);
}

/* Quick Metrics Strip */
.emp-metrics-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  padding: 14px 28px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.metric-chip {
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.metric-chip:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.metric-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 4px;
}

.metric-val {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.metric-val.highlight {
  color: #4f46e5;
}

.metric-val.docs-count {
  color: #0284c7;
}

.metric-val.probation-tag {
  color: #d97706;
}

.metric-val.confirmed-tag {
  color: #16a34a;
}

/* Tabs Navigation */
.emp-tabs-nav {
  display: flex;
  gap: 4px;
  padding: 0 28px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.emp-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 18px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.emp-tab-btn:hover {
  color: #0284c7;
}

.emp-tab-btn.active {
  color: #0284c7;
  font-weight: 700;
}

.emp-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2.5px;
  background: #0284c7;
  border-radius: 3px 3px 0 0;
}

.tab-badge-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: #e0f2fe;
  color: #0369a1;
}

.emp-tab-btn.active .tab-badge-pill {
  background: #0284c7;
  color: #ffffff;
}

/* Modal Body */
.emp-details-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 24px 28px;
  background: #f8fafc;
}

.tab-pane-fade {
  animation: tabFadeIn 0.22s ease-out;
}

@keyframes tabFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Details Cards Grid */
.details-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 18px;
}

.detail-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.04);
}

.detail-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-card-head i {
  color: #0284c7;
  font-size: 15px;
}

.detail-fields-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  gap: 12px;
}

.detail-field-row.full-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.field-label {
  color: #64748b;
  font-weight: 500;
  flex-shrink: 0;
}

.field-value {
  color: #0f172a;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.field-value.address-txt {
  text-align: left;
  line-height: 1.5;
  color: #334155;
  font-weight: 500;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  width: 100%;
  box-sizing: border-box;
}

.field-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #0284c7;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.field-link:hover {
  color: #0369a1;
  text-decoration: underline;
}

.field-value.blood-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #e11d48;
  background: #ffe4e6;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.field-value.code-pill {
  font-family: monospace;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
}

/* Social links */
.social-links-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.social-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-chip.linkedin { background: #0077b518; color: #0077b5; }
.social-chip.portfolio { background: #6366f118; color: #4f46e5; }
.social-chip.youtube { background: #ff000018; color: #dc2626; }
.social-chip.instagram { background: #e1306c18; color: #db2777; }
.social-chip:hover { transform: translateY(-1px); }

/* ========================================================= */
/* 📂 ATTACHED DOCUMENTS TAB STYLES                          */
/* ========================================================= */
.docs-tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 16px;
  flex-wrap: wrap;
}

.docs-tab-title-group h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.docs-tab-title-group p {
  font-size: 12.5px;
  color: #64748b;
  margin: 0;
}

.btn-attach-doc-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  background: #0284c7;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px -2px rgba(2, 132, 199, 0.3);
}

.btn-attach-doc-toggle:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

/* Inline Uploader */
.inline-doc-uploader-panel {
  background: #ffffff;
  border: 1px dashed #0284c7;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.uploader-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 700;
  color: #0369a1;
  margin-bottom: 12px;
}

.uploader-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.inline-select {
  flex: 1 1 240px;
  padding: 9px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  font-size: 13px;
  color: #1e293b;
  outline: none;
}

.btn-browse-file {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 8px;
  background: #0284c7;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-browse-file.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-browse-file:hover {
  background: #0369a1;
}

/* Documents Grid */
.documents-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.employee-doc-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
  position: relative;
}

.employee-doc-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.08);
  border-color: #cbd5e1;
}

.employee-doc-card.has-file {
  border-left: 4px solid #10b981;
}

.employee-doc-card.no-file {
  border-left: 4px solid #cbd5e1;
  background: #fafafa;
}

.doc-card-badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.doc-category-pill {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.doc-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.doc-status-tag.status-attached {
  background: #dcfce7;
  color: #15803d;
}

.doc-status-tag.status-pending {
  background: #f1f5f9;
  color: #94a3b8;
}

.doc-card-content {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.doc-file-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.doc-file-icon.pdf { background: #fee2e2; color: #dc2626; }
.doc-file-icon.photo { background: #e0f2fe; color: #0284c7; }
.doc-file-icon.word { background: #ede9fe; color: #7c3aed; }
.doc-file-icon.doc { background: #fef3c7; color: #d97706; }
.doc-file-icon.default { background: #f1f5f9; color: #64748b; }

.doc-file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.doc-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.doc-meta-sub {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}

.doc-meta-sub.pending-text {
  font-style: italic;
  color: #94a3b8;
}

.doc-date {
  font-size: 11px;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.doc-card-actions {
  display: flex;
  gap: 8px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.btn-doc-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  border: 1px solid transparent;
}

.btn-doc-action.preview {
  background: #f0f9ff;
  color: #0284c7;
  border-color: #bae6fd;
}

.btn-doc-action.preview:hover {
  background: #e0f2fe;
}

.btn-doc-action.download {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.btn-doc-action.download:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-doc-action.upload-now {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.btn-doc-action.upload-now:hover {
  background: #dbeafe;
}

.docs-loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

/* ========================================================= */
/* 📋 ASSIGNED KRAs TAB STYLES                              */
/* ========================================================= */
.kras-tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.kras-tab-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.kras-tab-header p {
  font-size: 12.5px;
  color: #64748b;
  margin: 0;
}

.kras-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 14px;
}

.kra-detail-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.kra-detail-card:hover {
  border-color: #c7d2fe;
  background: #fafbff;
  box-shadow: 0 4px 14px -2px rgba(79, 70, 229, 0.08);
}

.kra-card-index {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kra-card-body {
  display: flex;
  gap: 10px;
  flex: 1;
}

.kra-card-icon {
  color: #10b981;
  font-size: 14px;
  margin-top: 2px;
  flex-shrink: 0;
}

.kra-card-text h4 {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
  line-height: 1.4;
}

.kra-dept-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: #64748b;
}

.empty-kras-box {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
}

.empty-kras-box i {
  font-size: 36px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.empty-kras-box h4 {
  font-size: 15px;
  font-weight: 700;
  color: #334155;
  margin: 0 0 6px;
}

.empty-kras-box p {
  font-size: 13px;
  margin: 0 0 16px;
}

/* ========================================================= */
/* 🔍 IN-MODAL LIGHTBOX PREVIEWER                            */
/* ========================================================= */
.doc-preview-backdrop {
  z-index: 10080;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(10px);
}

.doc-preview-modal {
  max-width: 900px;
  width: 94%;
  height: 85vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
}

.preview-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-open-ext {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: #f1f5f9;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-open-ext:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.doc-preview-viewer {
  flex: 1;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 16px;
}

.preview-img-viewer {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.preview-iframe-viewer {
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
  border-radius: 8px;
}

/* Hints for clicking employee name */
.emp-row-hint,
.emp-hero-hint,
.emp-leaf-hint,
.emp-hint-mobile {
  font-size: 11px;
  color: #0284c7;
  opacity: 0.7;
  margin-left: 6px;
  transition: all 0.2s ease;
}

.emp-row:hover .emp-row-hint,
.card-hero-profile:hover .emp-hero-hint,
.leaf-details-section:hover .emp-leaf-hint,
.card-avatar:hover .emp-hint-mobile {
  opacity: 1;
  transform: scale(1.15);
}

.emp-full-name {
  cursor: pointer;
  transition: color 0.15s ease;
}

.emp-full-name:hover {
  color: #0284c7 !important;
  text-decoration: underline;
}

.employee-name-cell .avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.employee-name-cell .avatar:hover {
  transform: scale(1.08);
}
</style>