<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="site-ownership-page" :class="{ 'expanded-content': isMobile && !isSidebarVisible }">
        <!-- Modern Header -->
        <header class="site-page-header">
          <div class="header-left">
            <div class="header-icon-box">
              <i class="fas fa-sitemap"></i>
            </div>
            <div>
              <div class="breadcrumb-trail">
                <span @click="goTo('employee/dashboard')" class="crumb-link">Dashboard</span>
                <i class="fas fa-chevron-right crumb-separator"></i>
                <span class="crumb-current">Site Ownership</span>
              </div>
              <h1 class="page-title">Site Ownership & Allocation</h1>
              <p class="page-subtitle">Manage customer site assignments, region coverage, and engine distribution</p>
            </div>
          </div>

          <div class="header-right">
            <div class="header-stats-group desktop-only">
              <div class="header-stat-pill blue">
                <i class="fas fa-building"></i>
                <span><strong>{{ overallTotalSites }}</strong> Sites</span>
              </div>
              <div class="header-stat-pill green">
                <i class="fas fa-cogs"></i>
                <span><strong>{{ overallTotalEngines }}</strong> Engines</span>
              </div>
              <div class="header-stat-pill pink">
                <i class="fas fa-file-contract"></i>
                <span><strong>{{ overallAmcSites }}</strong> AMC</span>
              </div>
            </div>

            <button class="btn-back-dashboard" @click="goTo('employee/dashboard')">
              <i class="fas fa-arrow-left"></i> <span>Dashboard</span>
            </button>
          </div>
        </header>

        <!-- Filter & Search Toolbar -->
        <div class="site-toolbar-card">
          <div class="site-search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="siteSearchQuery"
              placeholder="Search by customer, engineer, region, or type..."
              class="site-search-input"
            />
            <button v-if="siteSearchQuery" @click="siteSearchQuery = ''" class="search-clear-btn" title="Clear">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="site-filters-wrapper">
            <div class="filter-select-wrapper">
              <i class="fas fa-map-marker-alt"></i>
              <select v-model="siteRegionFilter" class="filter-select">
                <option value="">All Regions</option>
                <option v-for="reg in siteOwnershipRegions" :key="reg" :value="reg">{{ reg }}</option>
              </select>
            </div>

            <div class="filter-select-wrapper">
              <i class="fas fa-tags"></i>
              <select v-model="siteTypeFilter" class="filter-select">
                <option value="">All Types</option>
                <option value="AMC">AMC</option>
                <option value="Service">Service</option>
                <option value="Supply">Supply</option>
              </select>
            </div>

            <button class="btn-action btn-export" @click="exportToExcel" title="Export Excel / CSV">
              <i class="fas fa-file-excel"></i>
              <span>Export</span>
            </button>

            <button class="btn-action btn-add-site" @click="openAddSiteModal(activeSiteTab !== 'Summary' && activeSiteTab !== 'All Sites' ? activeSiteTab : '')">
              <i class="fas fa-plus-circle"></i>
              <span>Add New Site</span>
            </button>
          </div>
        </div>

        <!-- Excel Style Tabs Navigation -->
        <div class="excel-tabs-bar">
          <button
            class="excel-tab-btn"
            :class="{ active: activeSiteTab === 'Summary' }"
            @click="activeSiteTab = 'Summary'"
          >
            <i class="fas fa-chart-pie"></i>
            <span>Summary</span>
          </button>

          <button
            v-for="eng in siteOwnershipEngineers"
            :key="eng"
            class="excel-tab-btn"
            :class="{ active: activeSiteTab === eng }"
            @click="activeSiteTab = eng"
          >
            <i class="fas fa-user-tie"></i>
            <span>{{ eng }}</span>
            <span class="tab-count-badge">{{ getEngineerSiteCount(eng) }}</span>
          </button>

          <button
            class="excel-tab-btn"
            :class="{ active: activeSiteTab === 'All Sites' }"
            @click="activeSiteTab = 'All Sites'"
          >
            <i class="fas fa-globe"></i>
            <span>All Sites</span>
            <span class="tab-count-badge">{{ siteOwnershipList.length }}</span>
          </button>
        </div>

        <!-- Main Content Area -->
        <main class="site-main-content">
          <!-- Loading State -->
          <div v-if="loading" class="site-loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading site ownership records from database...</p>
          </div>

          <!-- SUMMARY TAB VIEW -->
          <div v-else-if="activeSiteTab === 'Summary'" class="summary-tab-view">
            <!-- 4 KPI Cards -->
            <div class="kpi-grid">
              <div class="kpi-card card-blue">
                <div class="kpi-icon-box"><i class="fas fa-building"></i></div>
                <div class="kpi-details">
                  <span class="kpi-number">{{ overallTotalSites }}</span>
                  <span class="kpi-title">Total Assigned Sites</span>
                </div>
              </div>

              <div class="kpi-card card-green">
                <div class="kpi-icon-box"><i class="fas fa-cogs"></i></div>
                <div class="kpi-details">
                  <span class="kpi-number">{{ overallTotalEngines }}</span>
                  <span class="kpi-title">Total Engines Managed</span>
                </div>
              </div>

              <div class="kpi-card card-purple">
                <div class="kpi-icon-box"><i class="fas fa-file-contract"></i></div>
                <div class="kpi-details">
                  <span class="kpi-number">{{ overallAmcSites }}</span>
                  <span class="kpi-title">Active AMC Contracts</span>
                </div>
              </div>

              <div class="kpi-card card-amber">
                <div class="kpi-icon-box"><i class="fas fa-users-gear"></i></div>
                <div class="kpi-details">
                  <span class="kpi-number">{{ siteOwnershipEngineers.length }}</span>
                  <span class="kpi-title">Active Service Engineers</span>
                </div>
              </div>
            </div>

            <!-- Summary Breakdown Matrix Table -->
            <div class="table-container-card">
              <div class="table-card-top">
                <div class="table-title">
                  <i class="fas fa-table-list"></i>
                  <h3>Engineer-Wise Site & Engine Summary Matrix</h3>
                </div>
                <span class="table-chip">{{ siteSummaryData.length }} Engineers</span>
              </div>

              <div class="table-responsive">
                <table class="modern-grid-table">
                  <thead>
                    <tr>
                      <th style="width: 60px;" class="text-center">#</th>
                      <th>Engineer Name</th>
                      <th>Assigned Region(s)</th>
                      <th style="width: 140px;" class="text-center">Total Sites</th>
                      <th style="width: 140px;" class="text-center">Total Engines</th>
                      <th style="width: 140px;" class="text-center">AMC Sites</th>
                      <th style="width: 150px;" class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(summary, idx) in siteSummaryData" :key="summary.engineer">
                      <td class="text-center font-semibold">{{ idx + 1 }}</td>
                      <td>
                        <div class="engineer-profile-badge">
                          <span class="engineer-avatar-circle">{{ summary.engineer.charAt(0) }}</span>
                          <strong>{{ summary.engineer }}</strong>
                        </div>
                      </td>
                      <td>
                        <span
                          v-for="r in summary.regions"
                          :key="r"
                          class="region-pill"
                          :class="'reg-' + r.toLowerCase()"
                        >
                          {{ r }}
                        </span>
                        <span v-if="!summary.regions || summary.regions.length === 0" class="text-muted">-</span>
                      </td>
                      <td class="text-center font-bold">{{ summary.total_sites }}</td>
                      <td class="text-center font-bold text-success">{{ summary.total_engines }}</td>
                      <td class="text-center">
                        <span class="amc-count-pill">{{ summary.amc_sites }}</span>
                      </td>
                      <td class="text-center">
                        <div class="actions-group">
                          <button class="btn-table-action" @click="activeSiteTab = summary.engineer" title="View Sites">
                            <i class="fas fa-eye"></i> View
                          </button>
                          <button class="btn-icon-action edit" @click="openEditEngineerModal(summary)" title="Edit Sites / Reassign">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn-icon-action delete" @click="deleteEngineerSites(summary)" title="Delete All Sites">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="siteSummaryData.length === 0">
                      <td colspan="7" class="empty-state-cell">
                        <div class="empty-wrap">
                          <i class="fas fa-inbox"></i>
                          <p>No site ownership records found in database</p>
                          <button class="btn-action btn-add-site btn-sm" @click="openAddSiteModal()">
                            <i class="fas fa-plus"></i> Add First Site
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="siteSummaryData.length > 0">
                    <tr class="table-total-row">
                      <td colspan="3" class="text-right font-bold">Total</td>
                      <td class="text-center font-bold">{{ overallTotalSites }}</td>
                      <td class="text-center font-bold text-success">{{ overallTotalEngines }}</td>
                      <td class="text-center font-bold">{{ overallAmcSites }}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- ENGINEER SITES / ALL SITES TABLE VIEW -->
          <div v-else class="sites-tab-view">
            <div class="table-container-card">
              <div class="table-card-top">
                <div class="table-title">
                  <i class="fas fa-list-check"></i>
                  <h3>{{ activeSiteTab === 'All Sites' ? 'All Assigned Sites' : activeSiteTab + ' - Assigned Sites' }}</h3>
                  <span class="table-chip">{{ filteredSiteList.length }} Sites</span>
                </div>
                <div class="table-extra-info">
                  <span class="engine-total-badge">
                    <i class="fas fa-cogs"></i> Total Engines: <strong>{{ currentTabEngineTotal }}</strong>
                  </span>
                </div>
              </div>

              <div class="table-responsive">
                <table class="modern-grid-table excel-style-grid">
                  <thead>
                    <tr>
                      <th style="width: 50px;" class="text-center">Sr No</th>
                      <th>Customer / Site Name</th>
                      <th style="width: 120px;" class="text-center">No of Engines</th>
                      <th style="width: 110px;" class="text-center">Region</th>
                      <th v-if="activeSiteTab === 'All Sites' || activeSiteTab === 'Summary'" style="width: 150px;">Assigned Engineer</th>
                      <th style="width: 120px;" class="text-center">Customer Type</th>
                      <th>Remarks / Notes</th>
                      <th style="width: 100px;" class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(site, index) in filteredSiteList" :key="site.id || index">
                      <td class="text-center font-semibold">{{ index + 1 }}</td>
                      <td class="customer-cell">
                        <i class="fas fa-building customer-icon"></i>
                        <span>{{ site.customer }}</span>
                      </td>
                      <td class="text-center">
                        <span class="engine-box-badge">{{ site.no_of_engines }}</span>
                      </td>
                      <td class="text-center">
                        <span class="region-pill" :class="'reg-' + (site.region || 'south').toLowerCase()">
                          {{ site.region || 'South' }}
                        </span>
                      </td>
                      <td v-if="activeSiteTab === 'All Sites' || activeSiteTab === 'Summary'">
                        <div class="engineer-tag-pill">
                          <i class="fas fa-user-circle"></i>
                          <span>{{ site.assigned_engineer }}</span>
                        </div>
                      </td>
                      <td class="text-center">
                        <span v-if="site.customer_type === 'AMC'" class="type-pill amc">AMC</span>
                        <span v-else-if="site.customer_type" class="type-pill other">{{ site.customer_type }}</span>
                        <span v-else class="type-pill blank">-</span>
                      </td>
                      <td class="remarks-cell">
                        <span v-if="site.remarks" class="remarks-text" :title="site.remarks">{{ site.remarks }}</span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td class="text-center">
                        <div class="actions-group">
                          <button class="btn-icon-action edit" @click="openEditSiteModal(site)" title="Edit Site">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn-icon-action delete" @click="deleteSiteOwnership(site.id)" title="Delete Site">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="filteredSiteList.length === 0">
                      <td :colspan="activeSiteTab === 'All Sites' || activeSiteTab === 'Summary' ? 8 : 7" class="empty-state-cell">
                        <div class="empty-wrap">
                          <i class="fas fa-inbox"></i>
                          <p>No site assignments found for the current filters</p>
                          <button class="btn-action btn-add-site btn-sm" @click="openAddSiteModal(activeSiteTab !== 'All Sites' ? activeSiteTab : '')">
                            <i class="fas fa-plus"></i> Add New Site
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="filteredSiteList.length > 0">
                    <tr class="table-total-row">
                      <td :colspan="activeSiteTab === 'All Sites' || activeSiteTab === 'Summary' ? 3 : 2" class="text-right font-bold">Total</td>
                      <td class="text-center font-bold text-success">{{ currentTabEngineTotal }}</td>
                      <td colspan="5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </main>

        <!-- ADD / EDIT SITE MODAL -->
        <div v-if="showAddSiteModal" class="site-modal-backdrop" @click.self="showAddSiteModal = false">
          <div class="site-modal-card" :class="{ 'large-modal': addModalTab === 'excel' && !editingSiteId }">
            <div class="modal-card-header">
              <h3>
                <i :class="editingSiteId ? 'fas fa-edit' : (addModalTab === 'excel' ? 'fas fa-file-excel' : 'fas fa-plus-circle')"></i>
                {{ editingSiteId ? 'Edit Site Ownership' : (addModalTab === 'excel' ? 'Import Sites from Excel' : 'Add New Site Ownership') }}
              </h3>
              <button class="btn-close-modal" @click="showAddSiteModal = false">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Tab Switcher (Only when adding) -->
            <div v-if="!editingSiteId" class="modal-sub-tabs">
              <button
                type="button"
                class="modal-sub-tab-btn"
                :class="{ active: addModalTab === 'manual' }"
                @click="addModalTab = 'manual'"
              >
                <i class="fas fa-pen-to-square"></i> Single Site Entry
              </button>
              <button
                type="button"
                class="modal-sub-tab-btn"
                :class="{ active: addModalTab === 'excel' }"
                @click="addModalTab = 'excel'"
              >
                <i class="fas fa-file-import"></i> Import Excel File (Bulk)
              </button>
            </div>

            <!-- TAB 1: MANUAL SINGLE SITE FORM -->
            <form v-if="editingSiteId || addModalTab === 'manual'" @submit.prevent="saveSiteOwnership" class="modal-card-body">
              <div class="form-group-custom">
                <label>Customer / Site Name <span class="req">*</span></label>
                <input
                  type="text"
                  v-model="siteForm.customer"
                  placeholder="e.g. A. O. Smith India Water Products Pvt. Ltd. Bangalore"
                  required
                  class="form-input-custom"
                />
              </div>

              <div class="form-row-custom">
                <div class="form-group-custom">
                  <label>No of Engines <span class="req">*</span></label>
                  <input
                    type="number"
                    v-model.number="siteForm.no_of_engines"
                    min="1"
                    required
                    class="form-input-custom"
                  />
                </div>

                <div class="form-group-custom">
                  <label>Region <span class="req">*</span></label>
                  <select v-model="siteForm.region" required class="form-input-custom">
                    <option value="South">South</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="Central">Central</option>
                  </select>
                </div>
              </div>

              <div class="form-row-custom">
                <div class="form-group-custom">
                  <label>Assigned Engineer <span class="req">*</span></label>
                  <input
                    type="text"
                    v-model="siteForm.assigned_engineer"
                    list="engineer-name-suggestions"
                    placeholder="e.g. Ahamad"
                    required
                    class="form-input-custom"
                  />
                  <datalist id="engineer-name-suggestions">
                    <option v-for="eng in siteOwnershipEngineers" :key="eng" :value="eng"></option>
                  </datalist>
                </div>

                <div class="form-group-custom">
                  <label>Customer Type</label>
                  <select v-model="siteForm.customer_type" class="form-input-custom">
                    <option value="">Select Customer Type</option>
                    <option value="AMC">AMC</option>
                    <option value="Service">Service</option>
                    <option value="Supply">Supply</option>
                  </select>
                </div>
              </div>

              <div class="form-group-custom">
                <label>Remarks / Notes</label>
                <textarea
                  v-model="siteForm.remarks"
                  rows="2"
                  placeholder="Optional site notes or location details"
                  class="form-input-custom"
                ></textarea>
              </div>

              <div class="modal-card-footer">
                <button type="button" class="btn-cancel" @click="showAddSiteModal = false">Cancel</button>
                <button type="submit" class="btn-submit">
                  <i class="fas fa-save"></i> {{ editingSiteId ? 'Update Site' : 'Save Site' }}
                </button>
              </div>
            </form>

            <!-- TAB 2: EXCEL IMPORT BULK SECTION -->
            <div v-else class="modal-card-body excel-import-body">
              <!-- Template download banner -->
              <div class="template-download-banner">
                <div class="template-info">
                  <i class="fas fa-file-excel template-icon"></i>
                  <div>
                    <strong>Need sample template format?</strong>
                    <p>Download our sample Excel file with all required columns.</p>
                  </div>
                </div>
                <button type="button" class="btn-download-template" @click="downloadSampleTemplate">
                  <i class="fas fa-download"></i> Download Template
                </button>
              </div>

              <!-- Upload Drag & Drop Area -->
              <div
                class="excel-dropzone"
                :class="{ 'has-file': importFileName }"
                @click="$refs.excelFileInput.click()"
              >
                <input
                  type="file"
                  ref="excelFileInput"
                  accept=".xlsx, .xls, .csv"
                  @change="handleExcelFileUpload"
                  style="display: none;"
                />
                <div class="dropzone-inner">
                  <div class="dropzone-icon-circle">
                    <i :class="importFileName ? 'fas fa-file-circle-check' : 'fas fa-cloud-arrow-up'"></i>
                  </div>
                  <div class="dropzone-text">
                    <strong v-if="importFileName">{{ importFileName }}</strong>
                    <strong v-else>Click to browse or drag and drop Excel / CSV file</strong>
                    <p>Supports .xlsx, .xls, and .csv files</p>
                  </div>
                  <button v-if="importFileName" type="button" class="btn-clear-file" @click.stop="resetExcelImport" title="Remove File">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Parsed Table Preview -->
              <div v-if="importParsedRows.length > 0" class="import-preview-section">
                <div class="preview-header">
                  <div class="preview-title">
                    <i class="fas fa-table"></i>
                    <strong>File Preview ({{ validImportRowsCount }} valid sites ready to import)</strong>
                  </div>
                  <div class="preview-badges">
                    <span class="preview-badge valid"><i class="fas fa-check-circle"></i> {{ validImportRowsCount }} Valid</span>
                    <span v-if="invalidImportRowsCount > 0" class="preview-badge invalid"><i class="fas fa-exclamation-triangle"></i> {{ invalidImportRowsCount }} Invalid</span>
                  </div>
                </div>

                <div class="table-responsive preview-table-container">
                  <table class="modern-grid-table">
                    <thead>
                      <tr>
                        <th style="width: 40px;" class="text-center">#</th>
                        <th>Customer</th>
                        <th style="width: 70px;" class="text-center">Engines</th>
                        <th style="width: 80px;" class="text-center">Region</th>
                        <th style="width: 120px;">Engineer</th>
                        <th style="width: 80px;" class="text-center">Type</th>
                        <th>Remarks</th>
                        <th style="width: 60px;" class="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, rIdx) in importParsedRows" :key="rIdx" :class="{ 'row-invalid': !row.isValid }">
                        <td class="text-center font-semibold">{{ rIdx + 1 }}</td>
                        <td><strong>{{ row.customer || '(Missing Customer)' }}</strong></td>
                        <td class="text-center">{{ row.no_of_engines }}</td>
                        <td class="text-center">
                          <span class="region-pill" :class="'reg-' + (row.region || 'south').toLowerCase()">
                            {{ row.region }}
                          </span>
                        </td>
                        <td>{{ row.assigned_engineer || '(Missing Engineer)' }}</td>
                        <td class="text-center">
                          <span v-if="row.customer_type === 'AMC'" class="type-pill amc">AMC</span>
                          <span v-else-if="row.customer_type" class="type-pill other">{{ row.customer_type }}</span>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td><span class="remarks-text">{{ row.remarks || '-' }}</span></td>
                        <td class="text-center">
                          <span v-if="row.isValid" class="badge-status-valid" title="Ready to import"><i class="fas fa-check"></i></span>
                          <span v-else class="badge-status-invalid" :title="row.validationError"><i class="fas fa-times"></i></span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Footer for Import -->
              <div class="modal-card-footer">
                <button type="button" class="btn-cancel" :disabled="importLoading" @click="showAddSiteModal = false">Cancel</button>
                <button
                  type="button"
                  class="btn-submit btn-import-submit"
                  :disabled="validImportRowsCount === 0 || importLoading"
                  @click="submitExcelImport"
                >
                  <i v-if="importLoading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-file-import"></i>
                  {{ importLoading ? 'Importing Sites...' : `Import ${validImportRowsCount} Sites to Database` }}
                </button>
              </div>

              <!-- Full Overlay Loader -->
              <div v-if="importLoading" class="import-loading-overlay">
                <div class="import-loader-box">
                  <div class="import-spinner-ring">
                    <svg viewBox="0 0 50 50" class="import-svg-spinner">
                      <circle cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div class="import-loader-text">
                    <strong>Importing Sites to Database...</strong>
                    <p>Please wait, do not close this window</p>
                    <div class="import-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                  <div class="import-progress-bar-wrap">
                    <div class="import-progress-bar-track">
                      <div class="import-progress-bar-fill"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MANAGE ENGINEER SITES / REASSIGN MODAL -->
        <div v-if="showManageEngineerModal" class="site-modal-backdrop" @click.self="showManageEngineerModal = false">
          <div class="site-modal-card large-modal">
            <div class="modal-card-header">
              <h3>
                <i class="fas fa-user-gear"></i>
                Manage Sites - {{ selectedEngineerSummary?.engineer }}
              </h3>
              <button class="btn-close-modal" @click="showManageEngineerModal = false">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-card-body">
              <!-- Reassign Engineer Section -->
              <div class="reassign-section">
                <label class="reassign-label"><i class="fas fa-exchange-alt"></i> Reassign All Sites to Another Engineer:</label>
                <div class="reassign-input-group">
                  <input
                    type="text"
                    v-model="reassignNewEngineerName"
                    list="reassign-engineer-suggestions"
                    placeholder="Enter new engineer name..."
                    class="form-input-custom"
                  />
                  <datalist id="reassign-engineer-suggestions">
                    <option v-for="eng in siteOwnershipEngineers" :key="eng" :value="eng"></option>
                  </datalist>
                  <button
                    type="button"
                    class="btn-action btn-submit"
                    :disabled="!reassignNewEngineerName || reassignNewEngineerName === selectedEngineerSummary?.engineer"
                    @click="reassignAllEngineerSites"
                  >
                    <i class="fas fa-check"></i> Reassign All
                  </button>
                </div>
              </div>

              <!-- Sites Table List -->
              <div class="engineer-sites-list-wrapper">
                <div class="list-section-header">
                  <h4><i class="fas fa-building"></i> Assigned Sites ({{ selectedEngineerSites.length }})</h4>
                </div>
                <div class="table-responsive">
                  <table class="modern-grid-table">
                    <thead>
                      <tr>
                        <th style="width: 40px;" class="text-center">#</th>
                        <th>Customer / Site</th>
                        <th style="width: 80px;" class="text-center">Engines</th>
                        <th style="width: 90px;" class="text-center">Region</th>
                        <th style="width: 90px;" class="text-center">Type</th>
                        <th>Remarks</th>
                        <th style="width: 90px;" class="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(site, sIdx) in selectedEngineerSites" :key="site.id || sIdx">
                        <td class="text-center font-semibold">{{ sIdx + 1 }}</td>
                        <td><strong>{{ site.customer }}</strong></td>
                        <td class="text-center">
                          <span class="engine-box-badge">{{ site.no_of_engines }}</span>
                        </td>
                        <td class="text-center">
                          <span class="region-pill" :class="'reg-' + (site.region || 'south').toLowerCase()">
                            {{ site.region || 'South' }}
                          </span>
                        </td>
                        <td class="text-center">
                          <span v-if="site.customer_type === 'AMC'" class="type-pill amc">AMC</span>
                          <span v-else-if="site.customer_type" class="type-pill other">{{ site.customer_type }}</span>
                          <span v-else class="type-pill blank">-</span>
                        </td>
                        <td>
                          <span class="remarks-text" :title="site.remarks">{{ site.remarks || '-' }}</span>
                        </td>
                        <td class="text-center">
                          <div class="actions-group">
                            <button class="btn-icon-action edit" @click="openEditSiteModal(site); showManageEngineerModal = false;" title="Edit Site">
                              <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon-action delete" @click="deleteSiteOwnership(site.id)" title="Delete Site">
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="modal-card-footer">
              <button type="button" class="btn-cancel" @click="showManageEngineerModal = false">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as XLSX from 'xlsx';
import Sidebar from './components/Sidebar.vue';
import { toastSuccess, toastError, toastInfo } from '@/utils/toast.js';

export default {
  name: 'SiteOwnershipPage',
  components: { Sidebar },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      loading: false,

      // Site Ownership State
      siteOwnershipList: [],
      siteOwnershipEngineers: [],
      siteOwnershipRegions: [],
      activeSiteTab: 'Summary',
      siteSearchQuery: '',
      siteRegionFilter: '',
      siteTypeFilter: '',

      // Modal Form State
      showAddSiteModal: false,
      editingSiteId: null,
      addModalTab: 'manual', // 'manual' or 'excel'
      importFileName: '',
      importParsedRows: [],
      importLoading: false,
      showManageEngineerModal: false,
      selectedEngineerSummary: null,
      reassignNewEngineerName: '',
      siteForm: {
        customer: '',
        no_of_engines: 1,
        region: 'South',
        assigned_engineer: '',
        customer_type: '',
        remarks: ''
      }
    };
  },

  computed: {
    filteredSiteList() {
      let list = this.siteOwnershipList || [];

      // Tab filter
      if (this.activeSiteTab && this.activeSiteTab !== 'Summary' && this.activeSiteTab !== 'All Sites') {
        list = list.filter(s => (s.assigned_engineer || '').toLowerCase() === this.activeSiteTab.toLowerCase());
      }

      // Search filter
      if (this.siteSearchQuery && this.siteSearchQuery.trim()) {
        const q = this.siteSearchQuery.toLowerCase().trim();
        list = list.filter(s =>
          (s.customer || '').toLowerCase().includes(q) ||
          (s.assigned_engineer || '').toLowerCase().includes(q) ||
          (s.region || '').toLowerCase().includes(q) ||
          (s.customer_type || '').toLowerCase().includes(q) ||
          (s.remarks || '').toLowerCase().includes(q)
        );
      }

      // Region filter
      if (this.siteRegionFilter) {
        list = list.filter(s => (s.region || '').toLowerCase() === this.siteRegionFilter.toLowerCase());
      }

      // Customer type filter
      if (this.siteTypeFilter) {
        if (this.siteTypeFilter === 'AMC') {
          list = list.filter(s => (s.customer_type || '').toUpperCase() === 'AMC');
        } else {
          list = list.filter(s => (s.customer_type || '').toLowerCase() === this.siteTypeFilter.toLowerCase());
        }
      }

      return list;
    },

    currentTabEngineTotal() {
      return this.filteredSiteList.reduce((sum, s) => sum + (Number(s.no_of_engines) || 0), 0);
    },

    overallTotalSites() {
      return this.siteOwnershipList.length;
    },

    overallTotalEngines() {
      return this.siteOwnershipList.reduce((sum, s) => sum + (Number(s.no_of_engines) || 0), 0);
    },

    overallAmcSites() {
      return this.siteOwnershipList.filter(s => (s.customer_type || '').toUpperCase() === 'AMC').length;
    },

    siteSummaryData() {
      const engineerMap = {};

      // Seed all distinct engineers
      this.siteOwnershipEngineers.forEach(eng => {
        engineerMap[eng] = {
          engineer: eng,
          total_sites: 0,
          total_engines: 0,
          amc_sites: 0,
          regions: new Set()
        };
      });

      this.siteOwnershipList.forEach(s => {
        const eng = s.assigned_engineer || 'Unassigned';
        if (!engineerMap[eng]) {
          engineerMap[eng] = {
            engineer: eng,
            total_sites: 0,
            total_engines: 0,
            amc_sites: 0,
            regions: new Set()
          };
        }
        engineerMap[eng].total_sites += 1;
        engineerMap[eng].total_engines += (Number(s.no_of_engines) || 0);
        if ((s.customer_type || '').toUpperCase() === 'AMC') {
          engineerMap[eng].amc_sites += 1;
        }
        if (s.region) {
          engineerMap[eng].regions.add(s.region);
        }
      });

      return Object.values(engineerMap).map(e => ({
        ...e,
        regions: Array.from(e.regions)
      }));
    },

    selectedEngineerSites() {
      if (!this.selectedEngineerSummary || !this.selectedEngineerSummary.engineer) return [];
      return this.siteOwnershipList.filter(s => (s.assigned_engineer || '').toLowerCase() === this.selectedEngineerSummary.engineer.toLowerCase());
    },

    validImportRowsCount() {
      return this.importParsedRows.filter(r => r.isValid).length;
    },

    invalidImportRowsCount() {
      return this.importParsedRows.filter(r => !r.isValid).length;
    }
  },

  methods: {
    goTo(route) {
      this.$router.push(`/${route}`);
    },

    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    getEngineerSiteCount(engineer) {
      if (!this.siteOwnershipList) return 0;
      return this.siteOwnershipList.filter(s => (s.assigned_engineer || '').toLowerCase() === engineer.toLowerCase()).length;
    },

    async fetchSiteOwnership() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'https://employees.archenterprises.co.in/api/api';

        const response = await axios.get(`${baseUrl}/site-ownership`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.data) {
          this.siteOwnershipList = response.data.sites || [];
          if (response.data.engineers && response.data.engineers.length > 0) {
            this.siteOwnershipEngineers = response.data.engineers;
          }
          if (response.data.regions && response.data.regions.length > 0) {
            this.siteOwnershipRegions = response.data.regions;
          }
        }
      } catch (err) {
        console.error('Failed to fetch site ownership from database:', err);
        toastError('Failed to load site ownership records from database');
      } finally {
        this.loading = false;
      }
    },

    openAddSiteModal(engineer = '') {
      this.editingSiteId = null;
      this.addModalTab = 'manual';
      this.resetExcelImport();
      this.siteForm = {
        customer: '',
        no_of_engines: 1,
        region: 'South',
        assigned_engineer: engineer || (this.siteOwnershipEngineers.length > 0 ? this.siteOwnershipEngineers[0] : ''),
        customer_type: '',
        remarks: ''
      };
      this.showAddSiteModal = true;
    },

    resetExcelImport() {
      this.importFileName = '';
      this.importParsedRows = [];
      this.importLoading = false;
      if (this.$refs.excelFileInput) {
        this.$refs.excelFileInput.value = '';
      }
    },

    handleExcelFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.importFileName = file.name;
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

          this.importParsedRows = rows.map(row => {
            const customer = String(
              row['Customer'] || row['customer'] || row['Customer / Site Name'] ||
              row['customer_name'] || row['Site Name'] || ''
            ).trim();
            const engineer = String(
              row['Assigned Engineer'] || row['assigned_engineer'] ||
              row['Engineer'] || row['engineer'] || ''
            ).trim();
            const engines = parseInt(
              row['No of Engines'] || row['no_of_engines'] || row['Engines'] || 1
            ) || 1;
            const region = String(
              row['Region'] || row['region'] || 'South'
            ).trim() || 'South';
            const customerType = String(
              row['Customer Type'] || row['customer_type'] || row['Type'] || ''
            ).trim();
            const remarks = String(
              row['Remarks / Notes'] || row['Remarks'] || row['remarks'] ||
              row['Notes'] || ''
            ).trim();

            const isValid = !!customer && !!engineer;
            const validationError = !customer && !engineer
              ? 'Missing Customer and Engineer'
              : !customer ? 'Missing Customer name'
              : !engineer ? 'Missing Assigned Engineer'
              : null;

            return {
              customer,
              no_of_engines: engines,
              region,
              assigned_engineer: engineer,
              customer_type: customerType,
              remarks,
              isValid,
              validationError
            };
          });

          if (this.importParsedRows.length === 0) {
            toastError('No data rows found in the file. Please check the format.');
          } else {
            toastInfo(`Parsed ${this.importParsedRows.length} row(s) from "${file.name}"`);
          }
        } catch (err) {
          console.error('Excel parse error:', err);
          toastError('Failed to read file. Please ensure it is a valid .xlsx, .xls, or .csv file.');
          this.resetExcelImport();
        }
      };

      reader.readAsArrayBuffer(file);
    },

    downloadSampleTemplate() {
      const ws = XLSX.utils.aoa_to_sheet([
        ['Customer', 'No of Engines', 'Region', 'Assigned Engineer', 'Customer Type', 'Remarks / Notes'],
        ['A. O. Smith India - Bangalore', 3, 'South', 'Ahamad', 'AMC', 'Annual maintenance site'],
        ['XYZ Industries - Mumbai', 2, 'West', 'Rahul', 'Service', ''],
        ['ABC Corp - Delhi', 1, 'North', 'Suresh', 'Supply', 'New installation'],
      ]);
      ws['!cols'] = [
        { wch: 45 }, { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 30 }
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Site Ownership Template');
      XLSX.writeFile(wb, 'SiteOwnership_Import_Template.xlsx');
      toastSuccess('Template downloaded! Fill in your data and import.');
    },

    async submitExcelImport() {
      const validRows = this.importParsedRows.filter(r => r.isValid);
      if (validRows.length === 0) {
        toastError('No valid rows to import. Please check the file format.');
        return;
      }

      this.importLoading = true;
      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'https://employees.archenterprises.co.in/api/api';

        const response = await axios.post(`${baseUrl}/site-ownership/bulk`, {
          sites: validRows
        }, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        toastSuccess(response.data.message || `Successfully imported ${validRows.length} sites!`);
        this.showAddSiteModal = false;
        this.resetExcelImport();
        await this.fetchSiteOwnership();
      } catch (err) {
        console.error('Excel import error:', err);
        toastError('Failed to import sites. Please try again.');
      } finally {
        this.importLoading = false;
      }
    },

    openEditSiteModal(site) {
      this.editingSiteId = site.id;
      this.siteForm = {
        customer: site.customer,
        no_of_engines: site.no_of_engines || 1,
        region: site.region || 'South',
        assigned_engineer: site.assigned_engineer || '',
        customer_type: site.customer_type || '',
        remarks: site.remarks || ''
      };
      this.showAddSiteModal = true;
    },

    async saveSiteOwnership() {
      if (!this.siteForm.customer || !this.siteForm.assigned_engineer) {
        toastError('Please fill in customer name and assigned engineer');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'https://employees.archenterprises.co.in/api/api';

        if (this.editingSiteId) {
          await axios.put(`${baseUrl}/site-ownership/${this.editingSiteId}`, this.siteForm, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          toastSuccess('Site ownership updated in database!');
        } else {
          await axios.post(`${baseUrl}/site-ownership`, this.siteForm, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          toastSuccess('Site ownership added to database!');
        }

        this.showAddSiteModal = false;
        await this.fetchSiteOwnership();
      } catch (err) {
        console.error('Error saving site ownership to database:', err);
        toastError('Failed to save site ownership to database');
      }
    },

    async deleteSiteOwnership(id) {
      if (!confirm('Are you sure you want to delete this site assignment from the database?')) return;

      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'https://employees.archenterprises.co.in/api/api';

        await axios.delete(`${baseUrl}/site-ownership/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        toastSuccess('Site assignment deleted from database');
        await this.fetchSiteOwnership();
      } catch (err) {
        console.error('Error deleting site from database:', err);
        toastError('Failed to delete site from database');
      }
    },

    openEditEngineerModal(summary) {
      const sites = this.siteOwnershipList.filter(s => (s.assigned_engineer || '').toLowerCase() === summary.engineer.toLowerCase());
      if (sites.length === 1) {
        this.openEditSiteModal(sites[0]);
      } else {
        this.selectedEngineerSummary = summary;
        this.reassignNewEngineerName = summary.engineer;
        this.showManageEngineerModal = true;
      }
    },

    async deleteEngineerSites(summary) {
      const sites = this.siteOwnershipList.filter(s => (s.assigned_engineer || '').toLowerCase() === summary.engineer.toLowerCase());
      if (sites.length === 0) {
        toastInfo('No sites found for this engineer');
        return;
      }

      if (!confirm(`Are you sure you want to delete all ${sites.length} site assignment(s) for "${summary.engineer}" from the database?`)) {
        return;
      }

      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'https://employees.archenterprises.co.in/api/api';

        for (const site of sites) {
          await axios.delete(`${baseUrl}/site-ownership/${site.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
        }

        toastSuccess(`All sites assigned to "${summary.engineer}" deleted from database`);
        await this.fetchSiteOwnership();
      } catch (err) {
        console.error('Failed to delete engineer sites from database:', err);
        toastError('Failed to delete sites from database');
      } finally {
        this.loading = false;
      }
    },

    async reassignAllEngineerSites() {
      if (!this.reassignNewEngineerName || !this.selectedEngineerSummary) return;

      const newEng = this.reassignNewEngineerName.trim();
      const sites = this.selectedEngineerSites;
      if (sites.length === 0) return;

      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        const baseUrl = 'https://employees.archenterprises.co.in/api/api';

        for (const site of sites) {
          await axios.put(`${baseUrl}/site-ownership/${site.id}`, {
            customer: site.customer,
            no_of_engines: site.no_of_engines,
            region: site.region,
            assigned_engineer: newEng,
            customer_type: site.customer_type,
            remarks: site.remarks
          }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
        }

        toastSuccess(`Reassigned ${sites.length} site(s) to "${newEng}"!`);
        this.showManageEngineerModal = false;
        await this.fetchSiteOwnership();
      } catch (err) {
        console.error('Failed to reassign engineer sites:', err);
        toastError('Failed to reassign sites in database');
      } finally {
        this.loading = false;
      }
    },

    exportToExcel() {
      const rows = this.filteredSiteList;
      if (!rows || rows.length === 0) {
        toastInfo('No data available to export');
        return;
      }

      let csv = 'Sr No,Customer,No of Engines,Region,Assigned Engineer,Customer Type,Remarks\n';
      rows.forEach((r, idx) => {
        const cust = `"${(r.customer || '').replace(/"/g, '""')}"`;
        const eng = r.no_of_engines || 1;
        const reg = `"${(r.region || '').replace(/"/g, '""')}"`;
        const engineer = `"${(r.assigned_engineer || '').replace(/"/g, '""')}"`;
        const type = `"${(r.customer_type || '').replace(/"/g, '""')}"`;
        const rem = `"${(r.remarks || '').replace(/"/g, '""')}"`;
        csv += `${idx + 1},${cust},${eng},${reg},${engineer},${type},${rem}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Site_Ownership_${this.activeSiteTab}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastSuccess('Site ownership exported successfully!');
    }
  },

  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.fetchSiteOwnership();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f1f5f9;
}

.main-content {
  display: flex;
  flex: 1;
  width: 100%;
}

.site-ownership-page {
  flex: 1;
  padding: 1.75rem 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-x: hidden;
}

.site-ownership-page.expanded-content {
  padding: 1rem;
}

/* ========================================================= */
/* 🏢 MODERN PAGE HEADER */
/* ========================================================= */
.site-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 1.25rem 1.75rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

.breadcrumb-trail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.2rem;
}

.crumb-link {
  cursor: pointer;
  color: #2563eb;
  font-weight: 500;
}

.crumb-link:hover {
  text-decoration: underline;
}

.crumb-separator {
  font-size: 0.65rem;
  color: #94a3b8;
}

.crumb-current {
  color: #475569;
  font-weight: 600;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0.2rem 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-stats-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.header-stat-pill {
  padding: 0.4rem 0.85rem;
  border-radius: 30px;
  font-size: 0.82rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid transparent;
}

.header-stat-pill.blue { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.header-stat-pill.green { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.header-stat-pill.pink { background: #fdf2f8; color: #be185d; border-color: #fbcfe8; }

.btn-back-dashboard {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back-dashboard:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* ========================================================= */
/* 🛠️ TOOLBAR */
/* ========================================================= */
.site-toolbar-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  gap: 1rem;
  flex-wrap: wrap;
}

.site-search-wrapper {
  position: relative;
  flex: 1;
  min-width: 280px;
  max-width: 440px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
}

.site-search-input {
  width: 100%;
  padding: 0.6rem 2.2rem 0.6rem 2.3rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s;
}

.site-search-input:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.search-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.site-filters-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 0.75rem;
  color: #64748b;
  font-size: 0.85rem;
}

.filter-select {
  border: none;
  background: transparent;
  padding: 0.55rem 0.2rem;
  font-size: 0.88rem;
  color: #1e293b;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-export {
  background: #10b981;
  color: white;
}

.btn-export:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-add-site {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

.btn-add-site:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
}

/* ========================================================= */
/* 📑 EXCEL TABS BAR */
/* ========================================================= */
.excel-tabs-bar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #e2e8f0;
  padding: 0 0.5rem;
  border-radius: 12px 12px 0 0;
  border-bottom: 2px solid #cbd5e1;
  overflow-x: auto;
  scrollbar-width: thin;
}

.excel-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.35rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  position: relative;
  top: 2px;
  white-space: nowrap;
  transition: all 0.2s;
}

.excel-tab-btn:hover {
  background: #ffffff;
  color: #1e293b;
}

.excel-tab-btn.active {
  background: #ffffff;
  color: #2563eb;
  border-color: #cbd5e1 #cbd5e1 #ffffff #cbd5e1;
  box-shadow: 0 -3px 0 0 #2563eb;
}

.tab-count-badge {
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-weight: 700;
}

.excel-tab-btn.active .tab-count-badge {
  background: #dbeafe;
  color: #1d4ed8;
}

/* ========================================================= */
/* 📊 MAIN CONTENT & KPI */
/* ========================================================= */
.site-main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.site-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: 14px;
  color: #64748b;
  gap: 1rem;
  font-size: 1.1rem;
}

.site-loading-state i {
  font-size: 2.5rem;
  color: #3b82f6;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.kpi-card {
  background: white;
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.kpi-icon-box {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-blue .kpi-icon-box { background: #dbeafe; color: #2563eb; }
.card-green .kpi-icon-box { background: #d1fae5; color: #059669; }
.card-purple .kpi-icon-box { background: #ede9fe; color: #7c3aed; }
.card-amber .kpi-icon-box { background: #ffedd5; color: #ea580c; }

.kpi-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.kpi-title {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 0.2rem;
}

/* ========================================================= */
/* 📋 TABLE CONTAINER & STYLING */
/* ========================================================= */
.table-container-card {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.table-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.5rem;
  background: #fdfdfd;
  border-bottom: 1px solid #e2e8f0;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.table-title i {
  color: #3b82f6;
  font-size: 1.1rem;
}

.table-title h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.table-chip {
  background: #e2e8f0;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.engine-total-badge {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.engine-total-badge strong {
  font-weight: 800;
}

.table-responsive {
  overflow-x: auto;
}

.modern-grid-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.modern-grid-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  padding: 0.95rem 1.15rem;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.modern-grid-table td {
  padding: 0.95rem 1.15rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.modern-grid-table tbody tr:hover {
  background: #f8fafc;
}

/* Excel Style Grid */
.excel-style-grid th,
.excel-style-grid td {
  border-right: 1px solid #f1f5f9;
}

.excel-style-grid th:last-child,
.excel-style-grid td:last-child {
  border-right: none;
}

.customer-cell {
  font-weight: 600;
  color: #0f172a !important;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.customer-icon {
  color: #94a3b8;
  font-size: 0.9rem;
}

.engine-box-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #047857;
  font-weight: 800;
  font-size: 0.95rem;
  border: 1px solid #a7f3d0;
}

.region-pill {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0.15rem 0.2rem;
}

.reg-south { background: #e0f2fe; color: #0369a1; }
.reg-west { background: #fef3c7; color: #b45309; }
.reg-north { background: #f3e8ff; color: #7e22ce; }
.reg-east { background: #fee2e2; color: #b91c1c; }
.reg-central { background: #f1f5f9; color: #475569; }

.engineer-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 600;
  color: #1e293b;
}

.engineer-tag-pill i {
  color: #3b82f6;
}

.type-pill {
  display: inline-block;
  padding: 0.25rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.type-pill.amc { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.type-pill.other { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.type-pill.blank { color: #94a3b8; }

.remarks-cell {
  max-width: 260px;
}

.remarks-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.35;
}

.text-muted {
  color: #94a3b8;
}

.engineer-profile-badge {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.engineer-avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.amc-count-pill {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 12px;
  background: #d1fae5;
  color: #065f46;
  font-weight: 700;
}

.btn-table-action {
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #2563eb;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;
}

.btn-table-action:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.actions-group {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-icon-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.82rem;
  color: #64748b;
  transition: all 0.2s;
}

.btn-icon-action.edit:hover { background: #eff6ff; color: #2563eb; border-color: #93c5fd; }
.btn-icon-action.delete:hover { background: #fef2f2; color: #ef4444; border-color: #fca5a5; }

.table-total-row td {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
  padding: 1rem 1.15rem;
  font-size: 1rem;
}

.empty-state-cell {
  text-align: center;
  padding: 4rem 1rem !important;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
}

.empty-wrap i {
  font-size: 2.8rem;
  opacity: 0.4;
}

.empty-wrap p {
  margin: 0;
  font-size: 1rem;
}

/* ========================================================= */
/* ➕ MODAL FORM */
/* ========================================================= */
.site-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.site-modal-card {
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.modal-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: #1e293b;
  color: white;
}

.modal-card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal:hover {
  background: #ef4444;
  color: white;
}

.modal-card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-row-custom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group-custom {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group-custom label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-group-custom .req {
  color: #ef4444;
}

.form-input-custom {
  padding: 0.65rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #1e293b;
  background: white;
  transition: all 0.2s;
}

.form-input-custom:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.modal-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel {
  padding: 0.6rem 1.25rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.large-modal {
  max-width: 840px !important;
}

.reassign-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.reassign-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.reassign-label i {
  color: #3b82f6;
}

.reassign-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reassign-input-group .form-input-custom {
  flex: 1;
}

.engineer-sites-list-wrapper {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-section-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.list-section-header h4 i {
  color: #3b82f6;
}

@keyframes modalPop {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ========================================================= */
/* 📱 RESPONSIVE */
/* ========================================================= */
@media (max-width: 768px) {
  .site-ownership-page {
    padding: 1rem;
  }
  .site-page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  .site-toolbar-card {
    flex-direction: column;
    align-items: stretch;
  }
  .site-search-wrapper {
    max-width: 100%;
  }
  .site-filters-wrapper {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  .filter-select-wrapper {
    width: 100%;
  }
  .filter-select {
    width: 100%;
  }
  .btn-action {
    justify-content: center;
  }
  .form-row-custom {
    grid-template-columns: 1fr;
  }
}

/* ========================================================= */
/* 📥 EXCEL IMPORT STYLES */
/* ========================================================= */
.modal-sub-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-sub-tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.88rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.modal-sub-tab-btn:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.modal-sub-tab-btn.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background: white;
}

.modal-sub-tab-btn.active i {
  color: #22c55e;
}

.excel-import-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.template-download-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 0.875rem 1.25rem;
}

.template-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.template-icon {
  font-size: 2.2rem;
  color: #16a34a;
}

.template-info strong {
  display: block;
  font-size: 0.92rem;
  color: #15803d;
  font-weight: 700;
}

.template-info p {
  margin: 0;
  font-size: 0.8rem;
  color: #4ade80;
  color: #16a34a;
}

.btn-download-template {
  padding: 0.5rem 1rem;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.2s;
}

.btn-download-template:hover {
  background: #15803d;
}

.excel-dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  padding: 1.75rem;
  cursor: pointer;
  transition: all 0.25s;
  background: #f8fafc;
  position: relative;
}

.excel-dropzone:hover,
.excel-dropzone.has-file {
  border-color: #3b82f6;
  background: #eff6ff;
}

.excel-dropzone.has-file {
  border-color: #22c55e;
  background: #f0fdf4;
}

.dropzone-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dropzone-icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.5rem;
  color: #3b82f6;
}

.excel-dropzone.has-file .dropzone-icon-circle {
  color: #22c55e;
}

.dropzone-text {
  flex: 1;
}

.dropzone-text strong {
  display: block;
  font-size: 0.92rem;
  color: #1e293b;
  font-weight: 700;
}

.dropzone-text p {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
  color: #64748b;
}

.btn-clear-file {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-clear-file:hover {
  background: #ef4444;
  color: white;
}

.import-preview-section {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;
  color: #1e293b;
}

.preview-title i {
  color: #3b82f6;
}

.preview-badges {
  display: flex;
  gap: 0.5rem;
}

.preview-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.7rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
}

.preview-badge.valid {
  background: #d1fae5;
  color: #065f46;
}

.preview-badge.invalid {
  background: #fee2e2;
  color: #991b1b;
}

.preview-table-container {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.row-invalid {
  background: #fff1f2 !important;
  opacity: 0.8;
}

.badge-status-valid {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #d1fae5;
  color: #16a34a;
  font-size: 0.75rem;
}

.badge-status-invalid {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.75rem;
}

.btn-import-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========================================================= */
/* ⏳ IMPORT LOADING OVERLAY */
/* ========================================================= */
.import-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  border-radius: 18px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.import-loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  padding: 2rem;
  text-align: center;
  max-width: 300px;
}

.import-spinner-ring {
  width: 72px;
  height: 72px;
}

.import-svg-spinner {
  width: 72px;
  height: 72px;
  animation: svgRotate 1.2s linear infinite;
}

.import-svg-spinner circle {
  stroke: #2563eb;
  stroke-dasharray: 80;
  stroke-dashoffset: 20;
  animation: svgDash 1.5s ease-in-out infinite;
}

@keyframes svgRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes svgDash {
  0%   { stroke-dasharray: 1, 125; stroke-dashoffset: 0; }
  50%  { stroke-dasharray: 90, 125; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 125; stroke-dashoffset: -124; }
}

.import-loader-text strong {
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.import-loader-text p {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
}

.import-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 0.5rem;
}

.import-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  animation: dotBounce 1.2s ease-in-out infinite;
}

.import-dots span:nth-child(2) { animation-delay: 0.2s; }
.import-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40%            { transform: scale(1.2); opacity: 1; }
}

.import-progress-bar-wrap {
  width: 100%;
}

.import-progress-bar-track {
  width: 100%;
  height: 5px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.import-progress-bar-fill {
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  border-radius: 99px;
  animation: progressSlide 1.6s ease-in-out infinite;
}

@keyframes progressSlide {
  0%   { transform: translateX(-100%); width: 40%; }
  50%  { width: 60%; }
  100% { transform: translateX(280%); width: 40%; }
}
</style>
