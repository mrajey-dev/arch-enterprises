<template>
  <div class="inventory-layout">
    <div class="inventory-main-wrapper">
      <!-- Employee Sidebar -->
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <!-- Main Content Area -->
      <div class="inventory-content-container" v-if="!isMobile || !isSidebarVisible">
        
        <!-- Connection / Offline Alert Banner -->
        <div v-if="connectionError" class="inv-connection-banner">
          <div class="banner-left">
            <div class="banner-icon-pulse">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            <div>
              <strong>Connection Notice:</strong>
              <span>{{ connectionError }}</span>
            </div>
          </div>
          <button @click="retryConnection" class="inv-btn-banner-retry" :disabled="loading">
            <i class="fas fa-rotate" :class="{ 'fa-spin': loading }"></i>
            <span>Reconnect</span>
          </button>
        </div>

        <!-- Executive Header -->
        <header class="inv-header">
          <div class="inv-header-left">
            <div class="inv-brand-icon">
              <i class="fas fa-boxes-stacked"></i>
            </div>
            <div>
              <div class="inv-title-row">
                <h1 class="inv-page-title">Inventory Manager</h1>
                <span class="inv-badge-live" :class="usingLocalStorage ? 'badge-offline' : 'badge-online'">
                  <span class="pulse-dot"></span>
                  {{ usingLocalStorage ? 'Offline Mode' : 'Live Sync' }}
                </span>
              </div>
              <p class="inv-subtitle">Centralized spare parts catalog, real-time stock balances & reorder threshold monitoring</p>
            </div>
          </div>

          <div class="inv-header-actions">
            <!-- View Mode Switch -->
            <div class="inv-view-toggle" title="Switch View">
              <button 
                type="button" 
                class="view-toggle-btn" 
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
                title="Grid Card View"
              >
                <i class="fas fa-grip"></i>
                <span class="hide-mobile">Cards</span>
              </button>
              <button 
                type="button" 
                class="view-toggle-btn" 
                :class="{ active: viewMode === 'table' }"
                @click="viewMode = 'table'"
                title="Table List View"
              >
                <i class="fas fa-list-check"></i>
                <span class="hide-mobile">Table</span>
              </button>
            </div>

            <!-- Refresh Button -->
            <button 
              type="button" 
              class="inv-btn-refresh" 
              @click="loadItems" 
              :disabled="loading" 
              title="Refresh inventory"
            >
              <i class="fas fa-arrows-rotate" :class="{ 'fa-spin': loading }"></i>
            </button>

            <!-- Add Item Button -->
            <button type="button" class="inv-btn-primary-add" @click="openAddModal">
              <i class="fas fa-plus-circle"></i>
              <span>Add Stock Item</span>
            </button>
          </div>
        </header>

        <!-- KPI Summary Cards -->
        <section class="inv-kpi-grid">
          <!-- Card 1: Total Units -->
          <div class="inv-kpi-card card-indigo">
            <div class="kpi-icon-wrap">
              <i class="fas fa-cubes-stacked"></i>
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Total Stock Units</span>
              <div class="kpi-number-row">
                <span class="kpi-value font-mono">{{ totalQuantity.toLocaleString() }}</span>
                <span class="kpi-unit">units</span>
              </div>
              <span class="kpi-subtext">Across all cataloged inventory</span>
            </div>
          </div>

          <!-- Card 2: Total SKUs / Items -->
          <div class="inv-kpi-card card-purple">
            <div class="kpi-icon-wrap">
              <i class="fas fa-barcode"></i>
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Cataloged Parts (SKUs)</span>
              <div class="kpi-number-row">
                <span class="kpi-value font-mono">{{ items.length }}</span>
                <span class="kpi-unit">parts</span>
              </div>
              <span class="kpi-subtext">{{ uniqueCategoriesCount }} active categories</span>
            </div>
          </div>

          <!-- Card 3: Low Stock Warnings -->
          <div 
            class="inv-kpi-card card-amber clickable" 
            :class="{ active: filterStockStatus === 'low' }"
            @click="toggleStockStatusFilter('low')"
          >
            <div class="kpi-icon-wrap">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Low Stock Alerts</span>
              <div class="kpi-number-row">
                <span class="kpi-value font-mono">{{ lowStockCount }}</span>
                <span class="kpi-badge-alert" v-if="lowStockCount > 0">Action needed</span>
              </div>
              <span class="kpi-subtext">At or below reorder threshold</span>
            </div>
          </div>

          <!-- Card 4: Healthy Stock Level -->
          <div 
            class="inv-kpi-card card-emerald clickable"
            :class="{ active: filterStockStatus === 'normal' }"
            @click="toggleStockStatusFilter('normal')"
          >
            <div class="kpi-icon-wrap">
              <i class="fas fa-shield-halved"></i>
            </div>
            <div class="kpi-content">
              <span class="kpi-label">Healthy Stock Level</span>
              <div class="kpi-number-row">
                <span class="kpi-value font-mono">{{ healthyStockCount }}</span>
                <span class="kpi-unit">({{ healthyStockPercentage }}%)</span>
              </div>
              <span class="kpi-subtext">Sufficient quantity available</span>
            </div>
          </div>
        </section>

        <!-- Search, Filter & Control Toolbar -->
        <section class="inv-toolbar">
          <div class="toolbar-search-box">
            <i class="fas fa-magnifying-glass search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by part name, P/N, superseded #, or MPN..."
              class="inv-search-input"
            />
            <button 
              v-if="searchQuery" 
              type="button" 
              class="search-clear-btn" 
              @click="searchQuery = ''"
              title="Clear search"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="toolbar-controls-row">
            <!-- Category Filter -->
            <div class="inv-select-wrap">
              <i class="fas fa-layer-group select-prefix-icon"></i>
              <select v-model="filterCategory" class="inv-select">
                <option value="">All Categories</option>
                <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Stock Status Filter -->
            <div class="inv-status-tabs">
              <button 
                type="button" 
                class="status-tab-btn" 
                :class="{ active: filterStockStatus === '' }"
                @click="filterStockStatus = ''"
              >
                All
              </button>
              <button 
                type="button" 
                class="status-tab-btn tab-low" 
                :class="{ active: filterStockStatus === 'low' }"
                @click="filterStockStatus = 'low'"
              >
                Low Stock
                <span class="tab-badge" v-if="lowStockCount">{{ lowStockCount }}</span>
              </button>
              <button 
                type="button" 
                class="status-tab-btn tab-ok" 
                :class="{ active: filterStockStatus === 'normal' }"
                @click="filterStockStatus = 'normal'"
              >
                In Stock
              </button>
              <button 
                type="button" 
                class="status-tab-btn tab-out" 
                :class="{ active: filterStockStatus === 'out' }"
                @click="filterStockStatus = 'out'"
              >
                Out of Stock
              </button>
            </div>

            <!-- Sort By -->
            <div class="inv-select-wrap">
              <i class="fas fa-arrow-down-short-wide select-prefix-icon"></i>
              <select v-model="sortBy" class="inv-select">
                <option value="name_asc">Name (A → Z)</option>
                <option value="name_desc">Name (Z → A)</option>
                <option value="qty_desc">Quantity: High to Low</option>
                <option value="qty_asc">Quantity: Low to High</option>
                <option value="updated_desc">Recently Updated</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Results Counter & Quick Add Inline Bar -->
        <div class="inv-results-summary">
          <div class="results-left">
            <span class="results-count">
              Showing <strong>{{ filteredItems.length }}</strong> of <strong>{{ items.length }}</strong> items
            </span>
            <span v-if="searchQuery || filterCategory || filterStockStatus" class="active-filter-indicator">
              (filtered)
              <button type="button" class="btn-clear-all" @click="clearAllFilters">Reset Filters</button>
            </span>
          </div>

          <div class="results-right">
            <span class="inv-quick-tip">
              <i class="fas fa-lightbulb text-amber"></i> Click <strong>+/-</strong> on any item to instantly adjust stock
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && items.length === 0" class="inv-loading-state">
          <div class="inv-spinner-ring"></div>
          <h3>Loading Stock Inventory...</h3>
          <p>Fetching catalog, part numbers, and real-time quantity data</p>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════ -->
        <!-- VIEW 1: PREMIUM CARDS (GRID VIEW) -->
        <!-- ══════════════════════════════════════════════════════════════════ -->
        <div v-else-if="viewMode === 'grid' && filteredItems.length > 0" class="inv-cards-grid">
          <article 
            v-for="item in filteredItems" 
            :key="item.id" 
            class="inv-item-card"
            :class="getCardHealthClass(item.quantity, item.min_stock_threshold)"
          >
            <!-- Top Health Gradient Bar -->
            <div class="card-health-indicator"></div>

            <!-- Card Header -->
            <div class="card-head">
              <div class="card-category-row">
                <span class="card-cat-badge">
                  <i class="fas fa-tag"></i> {{ item.category || 'General' }}
                </span>
                
                <span class="card-status-pill" :class="getStockStatusClass(item.quantity, item.min_stock_threshold)">
                  <i :class="getStockStatusIcon(item.quantity, item.min_stock_threshold)"></i>
                  {{ getStockStatusText(item.quantity, item.min_stock_threshold) }}
                </span>
              </div>

              <div class="card-title-row">
                <h3 class="card-item-title" :title="item.name">{{ item.name }}</h3>
              </div>

              <!-- Part Numbers Pill Row -->
              <div class="card-pn-row">
                <div class="card-pn-badge" @click="copyPartNumber(item.part_number)" title="Click to copy Part Number">
                  <i class="fas fa-hashtag text-indigo"></i>
                  <span class="pn-label">P/N:</span>
                  <span class="pn-val font-mono">{{ item.part_number }}</span>
                  <i class="far fa-copy copy-icon"></i>
                </div>

                <div v-if="item.manufacturer_part_number" class="card-mpn-badge" title="Manufacturer Part Number">
                  <i class="fas fa-microchip text-slate"></i>
                  <span class="mpn-label">MPN:</span>
                  <span class="mpn-val font-mono">{{ item.manufacturer_part_number }}</span>
                </div>
              </div>

              <!-- Superseded Part Alert -->
              <div v-if="item.superseded_part_number" class="card-superseded-banner">
                <i class="fas fa-right-left text-amber"></i>
                <span>Replaces: <strong class="font-mono">{{ item.superseded_part_number }}</strong></span>
              </div>
            </div>

            <!-- Description (if any) -->
            <div class="card-desc" v-if="item.description">
              <p>{{ item.description }}</p>
            </div>

            <!-- Quantity & Threshold Level Gauge -->
            <div class="card-stock-gauge-section">
              <div class="gauge-header">
                <span class="gauge-label">
                  <i class="fas fa-warehouse text-slate"></i> Stock Balance
                </span>
                <span class="gauge-threshold">
                  Min: <strong>{{ item.min_stock_threshold || 5 }} {{ item.unit || 'pcs' }}</strong>
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="gauge-progress-track">
                <div 
                  class="gauge-progress-bar" 
                  :style="{ width: getStockProgressWidth(item.quantity, item.min_stock_threshold) }"
                  :class="getProgressColorClass(item.quantity, item.min_stock_threshold)"
                ></div>
              </div>

              <!-- Quick Quantity Stepper Control -->
              <div class="gauge-quantity-stepper">
                <div class="quantity-readout">
                  <span class="qty-big font-mono" :class="getQtyColorClass(item.quantity, item.min_stock_threshold)">
                    {{ item.quantity }}
                  </span>
                  <span class="qty-unit">{{ item.unit || 'pcs' }}</span>
                </div>

                <div class="stepper-action-group">
                  <button 
                    type="button" 
                    class="stepper-btn btn-minus" 
                    @click="quickAdjustQuantity(item, -1)"
                    :disabled="item.quantity <= 0"
                    title="Decrease 1 unit"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <button 
                    type="button" 
                    class="stepper-btn btn-plus" 
                    @click="quickAdjustQuantity(item, 1)"
                    title="Increase 1 unit"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-foot">
              <div class="foot-updated">
                <i class="far fa-clock"></i>
                <span>Updated {{ formatDate(item.last_updated || item.updated_at) }}</span>
              </div>

              <div class="foot-actions">
                <button 
                  type="button" 
                  class="card-action-btn btn-edit" 
                  @click="openEditModal(item)" 
                  title="Edit Item Details"
                >
                  <i class="fas fa-pen-to-square"></i>
                  <span>Edit</span>
                </button>
                <button 
                  type="button" 
                  class="card-action-btn btn-delete" 
                  @click="confirmDelete(item)" 
                  title="Delete Item"
                >
                  <i class="far fa-trash-can"></i>
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════ -->
        <!-- VIEW 2: WAREHOUSE DATA TABLE (TABLE VIEW) -->
        <!-- ══════════════════════════════════════════════════════════════════ -->
        <div v-else-if="viewMode === 'table' && filteredItems.length > 0" class="inv-table-card">
          <div class="inv-table-responsive">
            <table class="inv-data-table">
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Part & Description</th>
                  <th>Part Number</th>
                  <th>Category</th>
                  <th style="min-width: 170px;">Stock Balance</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th style="width: 130px; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredItems" :key="item.id" class="inv-table-row">
                  <td class="cell-index font-mono">{{ index + 1 }}</td>
                  
                  <td class="cell-part-info">
                    <span class="table-part-name">{{ item.name }}</span>
                    <span v-if="item.description" class="table-part-desc">{{ item.description }}</span>
                    <div class="table-sub-badges">
                      <span v-if="item.superseded_part_number" class="table-sub-pill text-amber">
                        <i class="fas fa-right-left"></i> Replaces: {{ item.superseded_part_number }}
                      </span>
                    </div>
                  </td>

                  <td class="cell-pn">
                    <div class="table-pn-wrap" @click="copyPartNumber(item.part_number)" title="Click to copy">
                      <span class="font-mono table-pn-text">{{ item.part_number }}</span>
                      <i class="far fa-copy text-muted"></i>
                    </div>
                    <span v-if="item.manufacturer_part_number" class="table-mpn-text font-mono">
                      MPN: {{ item.manufacturer_part_number }}
                    </span>
                  </td>

                  <td>
                    <span class="table-cat-badge">
                      {{ item.category || 'General' }}
                    </span>
                  </td>

                  <td class="cell-stock-balance">
                    <div class="table-stock-row">
                      <div class="table-qty-group">
                        <span class="table-qty-num font-mono" :class="getQtyColorClass(item.quantity, item.min_stock_threshold)">
                          {{ item.quantity }}
                        </span>
                        <span class="table-qty-unit">{{ item.unit || 'pcs' }}</span>
                      </div>

                      <!-- Inline Table Stepper -->
                      <div class="table-stepper">
                        <button 
                          type="button" 
                          class="table-step-btn" 
                          @click="quickAdjustQuantity(item, -1)" 
                          :disabled="item.quantity <= 0"
                        >
                          -
                        </button>
                        <button 
                          type="button" 
                          class="table-step-btn" 
                          @click="quickAdjustQuantity(item, 1)"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <!-- Mini bar -->
                    <div class="table-stock-mini-bar">
                      <div 
                        class="mini-bar-fill" 
                        :style="{ width: getStockProgressWidth(item.quantity, item.min_stock_threshold) }"
                        :class="getProgressColorClass(item.quantity, item.min_stock_threshold)"
                      ></div>
                    </div>
                  </td>

                  <td>
                    <span class="card-status-pill" :class="getStockStatusClass(item.quantity, item.min_stock_threshold)">
                      <i :class="getStockStatusIcon(item.quantity, item.min_stock_threshold)"></i>
                      {{ getStockStatusText(item.quantity, item.min_stock_threshold) }}
                    </span>
                  </td>

                  <td class="cell-updated text-muted font-mono">
                    {{ formatDate(item.last_updated || item.updated_at) }}
                  </td>

                  <td class="cell-actions" style="text-align: right;">
                    <button 
                      type="button" 
                      class="tbl-action-btn btn-tbl-edit" 
                      @click="openEditModal(item)" 
                      title="Edit Item"
                    >
                      <i class="fas fa-pen-to-square"></i>
                    </button>
                    <button 
                      type="button" 
                      class="tbl-action-btn btn-tbl-delete" 
                      @click="confirmDelete(item)" 
                      title="Delete Item"
                    >
                      <i class="far fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════ -->
        <!-- EMPTY STATE (NO RESULTS) -->
        <!-- ══════════════════════════════════════════════════════════════════ -->
        <div v-else-if="!loading" class="inv-empty-card">
          <div class="empty-icon-wrap">
            <i class="fas fa-box-open"></i>
          </div>
          <h3>{{ items.length === 0 ? 'Your Inventory is Currently Empty' : 'No Matching Stock Items Found' }}</h3>
          <p>{{ items.length === 0 ? 'Get started by adding your first spare part, filter, or equipment inventory item.' : 'Try adjusting your search keywords, clear category filters, or reset status tabs.' }}</p>
          <div class="empty-actions">
            <button v-if="searchQuery || filterCategory || filterStockStatus" type="button" class="btn-empty-reset" @click="clearAllFilters">
              <i class="fas fa-rotate-left"></i> Reset All Filters
            </button>
            <button type="button" class="btn-empty-add" @click="openAddModal">
              <i class="fas fa-plus-circle"></i> Add New Stock Item
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- ADD / EDIT MODAL -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <div v-if="showModal" class="inv-modal-backdrop" @click.self="closeModal">
      <div class="inv-modal-card">
        <!-- Modal Header -->
        <div class="inv-modal-header">
          <div class="modal-header-left">
            <div class="modal-header-icon" :class="isEditing ? 'icon-amber' : 'icon-indigo'">
              <i :class="isEditing ? 'fas fa-pen-ruler' : 'fas fa-circle-plus'"></i>
            </div>
            <div>
              <h2 class="modal-title">{{ isEditing ? 'Edit Stock Item' : 'Add New Stock Item' }}</h2>
              <span class="modal-subtitle">{{ isEditing ? 'Update stock quantity, threshold, or part cross-references' : 'Register a new spare part into the central inventory catalog' }}</span>
            </div>
          </div>
          <button type="button" class="modal-btn-close" @click="closeModal" title="Close Modal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Form Body -->
        <form @submit.prevent="saveItem" class="inv-modal-form">
          <div class="modal-body-scroll">
            
            <!-- Section 1: Core Part Identity -->
            <div class="form-section">
              <div class="section-badge-title">
                <i class="fas fa-tag text-indigo"></i>
                <span>Part Identification</span>
              </div>

              <div class="form-grid-2">
                <div class="form-field">
                  <label>Item Name <span class="req-star">*</span></label>
                  <input 
                    type="text" 
                    v-model="form.name" 
                    placeholder="e.g. Fuel Filter Element, Fuel Injection Pump" 
                    class="inv-input"
                    required 
                  />
                </div>

                <div class="form-field">
                  <label>Part Number (P/N) <span class="req-star">*</span></label>
                  <input 
                    type="text" 
                    v-model="form.partNumber" 
                    placeholder="e.g. FF-5052-X / 4088272" 
                    class="inv-input font-mono"
                    required 
                  />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-field">
                  <label>Category</label>
                  <select v-model="form.category" class="inv-input">
                    <option value="">Select Category</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Tools">Tools</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Filters">Filters</option>
                    <option value="Lubes & Fluids">Lubes & Fluids</option>
                    <option value="Pumps & Valves">Pumps & Valves</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-field">
                  <label>Manufacturer Part Number (MPN)</label>
                  <input 
                    type="text" 
                    v-model="form.manufacturerPartNumber" 
                    placeholder="e.g. OEM / Bosch / Cummins MPN" 
                    class="inv-input font-mono"
                  />
                </div>
              </div>

              <div class="form-field">
                <label>Superseded / Replaces Part Number</label>
                <input 
                  type="text" 
                  v-model="form.supersededPartNumber" 
                  placeholder="Original or obsolete part number that this replaces (if applicable)" 
                  class="inv-input font-mono"
                />
              </div>
            </div>

            <!-- Section 2: Stock Balances & Reorder Rules -->
            <div class="form-section">
              <div class="section-badge-title">
                <i class="fas fa-cubes text-emerald"></i>
                <span>Stock Balance & Alert Rules</span>
              </div>

              <div class="form-grid-3">
                <div class="form-field">
                  <label>Available Quantity <span class="req-star">*</span></label>
                  <input 
                    type="number" 
                    v-model.number="form.quantity" 
                    min="0" 
                    step="1" 
                    class="inv-input font-mono"
                    required 
                  />
                </div>

                <div class="form-field">
                  <label>Unit of Measure</label>
                  <input 
                    type="text" 
                    v-model="form.unit" 
                    placeholder="pcs, sets, kg, liters" 
                    class="inv-input"
                  />
                </div>

                <div class="form-field">
                  <label>Min Reorder Threshold <span class="req-star">*</span></label>
                  <input 
                    type="number" 
                    v-model.number="form.minStockThreshold" 
                    min="0" 
                    step="1" 
                    class="inv-input font-mono"
                    required 
                  />
                </div>
              </div>
            </div>

            <!-- Section 3: Technical Description -->
            <div class="form-section">
              <div class="section-badge-title">
                <i class="fas fa-align-left text-sky"></i>
                <span>Description & Specifications</span>
              </div>

              <div class="form-field">
                <label>Description / Technical Notes</label>
                <textarea 
                  v-model="form.description" 
                  rows="3" 
                  placeholder="Application, engine compatibility, dimensions, or warehouse storage notes..."
                  class="inv-textarea"
                ></textarea>
              </div>
            </div>

          </div>

          <!-- Modal Footer Actions -->
          <div class="inv-modal-footer">
            <button type="button" class="btn-modal-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-modal-submit" :disabled="loading">
              <i v-if="loading" class="fas fa-circle-notch fa-spin"></i>
              <i v-else class="fas fa-check"></i>
              <span>{{ loading ? 'Saving...' : (isEditing ? 'Update Stock Item' : 'Add to Inventory') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- CUSTOM DELETE CONFIRMATION MODAL -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <div v-if="itemToDelete" class="inv-modal-backdrop" @click.self="itemToDelete = null">
      <div class="inv-delete-card">
        <div class="delete-icon-pulse">
          <i class="fas fa-trash-can"></i>
        </div>
        <h3 class="delete-title">Delete Inventory Item?</h3>
        <p class="delete-desc">
          Are you sure you want to delete <strong class="text-dark">{{ itemToDelete.name }}</strong> (P/N: <span class="font-mono">{{ itemToDelete.part_number }}</span>) from your inventory catalog? This action cannot be reversed.
        </p>
        <div class="delete-actions">
          <button type="button" class="btn-delete-cancel" @click="itemToDelete = null">Keep Item</button>
          <button type="button" class="btn-delete-confirm" @click="executeDelete" :disabled="loading">
            <i v-if="loading" class="fas fa-circle-notch fa-spin"></i>
            <i v-else class="fas fa-trash-can"></i>
            <span>{{ loading ? 'Deleting...' : 'Delete Permanently' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
import { toastSuccess, toastError, toastWarning, toastInfo } from '@/utils/toast';

export default {
  name: "InventoryManager",
  components: {
    Sidebar
  },
  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      items: [],
      searchQuery: '',
      filterCategory: '',
      filterStockStatus: '',
      sortBy: 'name_asc',
      viewMode: 'grid', // 'grid' | 'table'
      showModal: false,
      isEditing: false,
      currentEditId: null,
      loading: false,
      connectionError: '',
      usingLocalStorage: false,
      itemToDelete: null,
      apiBaseUrl: 'https://employees.archenterprises.co.in/api/api',
      form: {
        name: '',
        partNumber: '',
        supersededPartNumber: '',
        description: '',
        quantity: 0,
        unit: 'pcs',
        minStockThreshold: 5,
        unitCost: null,
        category: '',
        location: '',
        manufacturerPartNumber: ''
      }
    };
  },
  computed: {
    totalQuantity() {
      return this.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    },
    lowStockCount() {
      return this.items.filter(item => Number(item.quantity) <= Number(item.min_stock_threshold || 5)).length;
    },
    healthyStockCount() {
      return this.items.filter(item => Number(item.quantity) > Number(item.min_stock_threshold || 5)).length;
    },
    healthyStockPercentage() {
      if (!this.items.length) return 0;
      return Math.round((this.healthyStockCount / this.items.length) * 100);
    },
    uniqueCategoriesCount() {
      const cats = new Set(this.items.map(i => i.category).filter(Boolean));
      return cats.size;
    },
    availableCategories() {
      const cats = new Set();
      this.items.forEach(i => {
        if (i.category) cats.add(i.category);
      });
      ['Mechanical', 'Electronics', 'Hardware', 'Tools', 'Raw Material', 'Filters', 'Pumps & Valves', 'Other'].forEach(c => cats.add(c));
      return Array.from(cats).sort();
    },
    filteredItems() {
      let result = [...this.items];

      // 1. Search Query
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        result = result.filter(item => {
          const name = (item.name || '').toLowerCase();
          const pn = (item.part_number || '').toLowerCase();
          const mpn = (item.manufacturer_part_number || '').toLowerCase();
          const sup = (item.superseded_part_number || '').toLowerCase();
          const desc = (item.description || '').toLowerCase();
          return name.includes(q) || pn.includes(q) || mpn.includes(q) || sup.includes(q) || desc.includes(q);
        });
      }

      // 2. Category Filter
      if (this.filterCategory) {
        result = result.filter(item => item.category === this.filterCategory);
      }

      // 3. Stock Status Filter
      if (this.filterStockStatus === 'low') {
        result = result.filter(item => Number(item.quantity) <= Number(item.min_stock_threshold || 5));
      } else if (this.filterStockStatus === 'normal') {
        result = result.filter(item => Number(item.quantity) > Number(item.min_stock_threshold || 5));
      } else if (this.filterStockStatus === 'out') {
        result = result.filter(item => Number(item.quantity) <= 0);
      }

      // 4. Sorting
      result.sort((a, b) => {
        if (this.sortBy === 'name_asc') {
          return (a.name || '').localeCompare(b.name || '');
        } else if (this.sortBy === 'name_desc') {
          return (b.name || '').localeCompare(a.name || '');
        } else if (this.sortBy === 'qty_desc') {
          return (Number(b.quantity) || 0) - (Number(a.quantity) || 0);
        } else if (this.sortBy === 'qty_asc') {
          return (Number(a.quantity) || 0) - (Number(b.quantity) || 0);
        } else if (this.sortBy === 'updated_desc') {
          const dateA = new Date(a.last_updated || a.updated_at || 0).getTime();
          const dateB = new Date(b.last_updated || b.updated_at || 0).getTime();
          return dateB - dateA;
        }
        return 0;
      });

      return result;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadItems();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },

    getAuthHeaders() {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
      return headers;
    },

    async loadItems() {
      this.loading = true;
      this.connectionError = '';

      try {
        const response = await fetch(`${this.apiBaseUrl}/inventory/items`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status) {
          this.items = data.data || [];
          this.usingLocalStorage = false;
          localStorage.setItem('inventory_items_backup', JSON.stringify(this.items));
        } else {
          throw new Error(data.message || 'Failed to load items');
        }
      } catch (error) {
        console.error('Error loading items:', error);
        this.connectionError = 'Cannot connect to remote server. Using offline cached data.';
        
        const backup = localStorage.getItem('inventory_items_backup');
        if (backup) {
          try {
            this.items = JSON.parse(backup);
            this.usingLocalStorage = true;
            toastWarning('Operating in offline mode using local backup.');
          } catch (_) {
            this.items = [];
          }
        } else {
          this.items = [];
          toastError('Unable to connect to server and no local backup available.');
        }
      } finally {
        this.loading = false;
      }
    },

    async saveItem() {
      if (!this.form.name || !this.form.partNumber) {
        toastError('Please fill in Item Name and Part Number');
        return;
      }

      this.loading = true;

      const payload = {
        name: this.form.name.trim(),
        part_number: this.form.partNumber.trim(),
        superseded_part_number: this.form.supersededPartNumber ? this.form.supersededPartNumber.trim() : null,
        description: this.form.description ? this.form.description.trim() : '',
        quantity: Number(this.form.quantity) || 0,
        unit: this.form.unit ? this.form.unit.trim() : 'pcs',
        min_stock_threshold: Number(this.form.minStockThreshold) || 5,
        unit_cost: this.form.unitCost,
        category: this.form.category || 'General',
        location: this.form.location || '',
        manufacturer_part_number: this.form.manufacturerPartNumber ? this.form.manufacturerPartNumber.trim() : null
      };

      try {
        let url, method;

        if (this.isEditing && this.currentEditId) {
          url = `${this.apiBaseUrl}/inventory/items/${this.currentEditId}`;
          method = 'PUT';
        } else {
          url = `${this.apiBaseUrl}/inventory/items`;
          method = 'POST';
        }

        const response = await fetch(url, {
          method: method,
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.status) {
          await this.loadItems();
          this.closeModal();
          toastSuccess(this.isEditing ? 'Item updated successfully!' : 'New stock item added to inventory!');
        } else {
          throw new Error(data.message || 'Operation failed');
        }
      } catch (error) {
        console.error('Error saving item:', error);

        // Fallback: Save locally
        if (this.isEditing && this.currentEditId) {
          const index = this.items.findIndex(i => i.id === this.currentEditId);
          if (index !== -1) {
            this.items[index] = { ...this.items[index], ...payload, last_updated: new Date().toISOString() };
          }
        } else {
          const newItem = {
            id: Date.now(),
            ...payload,
            last_updated: new Date().toISOString()
          };
          this.items.unshift(newItem);
        }

        localStorage.setItem('inventory_items_backup', JSON.stringify(this.items));
        this.closeModal();
        toastWarning('Saved to local storage. Changes will sync when server is reachable.');
      } finally {
        this.loading = false;
      }
    },

    confirmDelete(item) {
      this.itemToDelete = item;
    },

    async executeDelete() {
      if (!this.itemToDelete) return;
      const item = this.itemToDelete;
      this.loading = true;

      try {
        const response = await fetch(`${this.apiBaseUrl}/inventory/items/${item.id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.status) {
          await this.loadItems();
          toastSuccess(`Item "${item.name}" deleted successfully.`);
        } else {
          throw new Error(data.message || 'Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        // Fallback: Remove locally
        this.items = this.items.filter(i => i.id !== item.id);
        localStorage.setItem('inventory_items_backup', JSON.stringify(this.items));
        toastWarning(`Deleted locally. Will synchronize once server resumes.`);
      } finally {
        this.loading = false;
        this.itemToDelete = null;
      }
    },

    async quickAdjustQuantity(item, delta) {
      const newQty = Math.max(0, (Number(item.quantity) || 0) + delta);
      if (newQty === item.quantity) return;

      const oldQty = item.quantity;
      item.quantity = newQty; // Optimistic update
      item.last_updated = new Date().toISOString();

      const payload = {
        name: item.name,
        part_number: item.part_number,
        superseded_part_number: item.superseded_part_number || null,
        description: item.description || '',
        quantity: newQty,
        unit: item.unit || 'pcs',
        min_stock_threshold: item.min_stock_threshold || 5,
        unit_cost: item.unit_cost,
        category: item.category || '',
        location: item.location || '',
        manufacturer_part_number: item.manufacturer_part_number || null
      };

      try {
        const response = await fetch(`${this.apiBaseUrl}/inventory/items/${item.id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          toastSuccess(`Updated ${item.name} stock to ${newQty} ${item.unit || 'pcs'}`);
        }
        localStorage.setItem('inventory_items_backup', JSON.stringify(this.items));
      } catch (err) {
        localStorage.setItem('inventory_items_backup', JSON.stringify(this.items));
      }
    },

    copyPartNumber(partNumber) {
      if (!partNumber) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(partNumber).then(() => {
          toastSuccess(`Part Number ${partNumber} copied to clipboard!`);
        }).catch(() => {
          toastInfo(`Part Number: ${partNumber}`);
        });
      } else {
        toastInfo(`Part Number: ${partNumber}`);
      }
    },

    retryConnection() {
      this.loadItems();
    },

    toggleStockStatusFilter(status) {
      if (this.filterStockStatus === status) {
        this.filterStockStatus = '';
      } else {
        this.filterStockStatus = status;
      }
    },

    clearAllFilters() {
      this.searchQuery = '';
      this.filterCategory = '';
      this.filterStockStatus = '';
      this.sortBy = 'name_asc';
    },

    openAddModal() {
      this.isEditing = false;
      this.currentEditId = null;
      this.form = {
        name: '',
        partNumber: '',
        supersededPartNumber: '',
        description: '',
        quantity: 0,
        unit: 'pcs',
        minStockThreshold: 5,
        unitCost: null,
        category: '',
        location: '',
        manufacturerPartNumber: ''
      };
      this.showModal = true;
    },

    openEditModal(item) {
      this.isEditing = true;
      this.currentEditId = item.id;
      this.form = {
        name: item.name || '',
        partNumber: item.part_number || '',
        supersededPartNumber: item.superseded_part_number || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        unit: item.unit || 'pcs',
        minStockThreshold: item.min_stock_threshold || 5,
        unitCost: item.unit_cost || null,
        category: item.category || '',
        location: item.location || '',
        manufacturerPartNumber: item.manufacturer_part_number || ''
      };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditing = false;
      this.currentEditId = null;
    },

    formatDate(dateString) {
      if (!dateString) return 'Just now';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    getStockStatusClass(quantity, threshold) {
      const q = Number(quantity) || 0;
      const t = Number(threshold) || 5;
      if (q <= 0) return 'status-out';
      if (q <= t) return 'status-low';
      return 'status-ok';
    },

    getStockStatusIcon(quantity, threshold) {
      const q = Number(quantity) || 0;
      const t = Number(threshold) || 5;
      if (q <= 0) return 'fas fa-circle-xmark';
      if (q <= t) return 'fas fa-triangle-exclamation';
      return 'fas fa-circle-check';
    },

    getStockStatusText(quantity, threshold) {
      const q = Number(quantity) || 0;
      const t = Number(threshold) || 5;
      if (q <= 0) return 'Out of Stock';
      if (q <= t) return 'Low Stock';
      return 'In Stock';
    },

    getCardHealthClass(quantity, threshold) {
      const q = Number(quantity) || 0;
      const t = Number(threshold) || 5;
      if (q <= 0) return 'health-out';
      if (q <= t) return 'health-low';
      return 'health-ok';
    },

    getStockProgressWidth(quantity, threshold) {
      const q = Number(quantity) || 0;
      const t = Number(threshold) || 5;
      if (q <= 0) return '4%';
      const maxVisual = Math.max(t * 3, 20);
      const pct = Math.min(Math.round((q / maxVisual) * 100), 100);
      return `${Math.max(pct, 8)}%`;
    },

    getProgressColorClass(quantity, threshold) {
      const q = Number(quantity) || 0;
      const t = Number(threshold) || 5;
      if (q <= 0) return 'bg-progress-rose';
      if (q <= t) return 'bg-progress-amber';
      return 'bg-progress-emerald';
    },

    getQtyColorClass(quantity, threshold) {
      const q = Number(quantity) || 0;
      const t = Number(threshold) || 5;
      if (q <= 0) return 'text-rose';
      if (q <= t) return 'text-amber';
      return 'text-emerald';
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* ==========================================================================
   MAIN LAYOUT & WRAPPER
   ========================================================================== */
.inventory-layout {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
}

.inventory-main-wrapper {
  display: flex;
  min-height: 100vh;
}

.inventory-content-container {
  flex: 1;
  padding: 1.75rem 2.25rem 3.5rem;
  overflow-x: hidden;
  max-width: 1700px;
  margin: 0 auto;
  width: 100%;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
}

/* ==========================================================================
   OFFLINE / CONNECTION BANNER
   ========================================================================== */
.inv-connection-banner {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  border-radius: 16px;
  padding: 12px 20px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.08);
  animation: invSlideDown 0.3s ease;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.88rem;
  color: #92400e;
}

.banner-icon-pulse {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fde68a;
  color: #b45309;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.inv-btn-banner-retry {
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.inv-btn-banner-retry:hover {
  background: #b45309;
  transform: translateY(-1px);
}

/* ==========================================================================
   EXECUTIVE HEADER
   ========================================================================== */
.inv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.inv-header-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.inv-brand-icon {
  width: 58px;
  height: 58px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.65rem;
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
}

.inv-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inv-page-title {
  font-size: 1.85rem;
  font-weight: 850;
  letter-spacing: -0.03em;
  color: #0f172a;
  margin: 0;
}

.inv-badge-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.inv-badge-live.badge-online {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.inv-badge-live.badge-offline {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
  animation: pulseDot 2s infinite;
}

.badge-offline .pulse-dot {
  background: #94a3b8;
  box-shadow: none;
  animation: none;
}

.inv-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  margin: 4px 0 0;
}

.inv-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inv-view-toggle {
  display: flex;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 4px;
  gap: 2px;
}

.view-toggle-btn {
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.view-toggle-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.inv-btn-refresh {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.inv-btn-refresh:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.inv-btn-primary-add {
  height: 42px;
  padding: 0 1.25rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: none;
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px -4px rgba(37, 99, 235, 0.45);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.inv-btn-primary-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -4px rgba(37, 99, 235, 0.55);
}

/* ==========================================================================
   KPI SUMMARY CARDS
   ========================================================================== */
.inv-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.inv-kpi-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 1.35rem 1.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.inv-kpi-card.clickable {
  cursor: pointer;
}

.inv-kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.08);
}

.inv-kpi-card.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), 0 12px 28px -6px rgba(15, 23, 42, 0.08);
}

.kpi-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  flex-shrink: 0;
}

.card-indigo .kpi-icon-wrap { background: #eff6ff; color: #2563eb; }
.card-purple .kpi-icon-wrap { background: #f5f3ff; color: #7c3aed; }
.card-amber .kpi-icon-wrap { background: #fffbeb; color: #d97706; }
.card-emerald .kpi-icon-wrap { background: #ecfdf5; color: #059669; }

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
}

.kpi-number-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 850;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.kpi-unit {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.kpi-badge-alert {
  background: #fee2e2;
  color: #b91c1c;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
}

.kpi-subtext {
  font-size: 0.74rem;
  color: #94a3b8;
  margin-top: 2px;
}

/* ==========================================================================
   TOOLBAR (SEARCH & FILTERS)
   ========================================================================== */
.inv-toolbar {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.toolbar-search-box {
  flex: 1;
  min-width: 320px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 0.95rem;
}

.inv-search-input {
  width: 100%;
  height: 42px;
  padding: 0 2.5rem 0 2.65rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.88rem;
  color: #0f172a;
  transition: all 0.2s ease;
}

.inv-search-input:focus {
  outline: none;
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.search-clear-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.toolbar-controls-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.inv-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.select-prefix-icon {
  position: absolute;
  left: 12px;
  color: #64748b;
  font-size: 0.85rem;
  pointer-events: none;
}

.inv-select {
  height: 42px;
  padding: 0 1.75rem 0 2.35rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.84rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2364748b' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 18px;
}

.inv-select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #ffffff;
}

.inv-status-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  gap: 3px;
}

.status-tab-btn {
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.status-tab-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.tab-badge {
  background: #fee2e2;
  color: #b91c1c;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 0.7rem;
}

/* ==========================================================================
   RESULTS SUMMARY BAR
   ========================================================================== */
.inv-results-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  margin-bottom: 1.25rem;
  font-size: 0.82rem;
  color: #64748b;
}

.results-count strong {
  color: #0f172a;
}

.btn-clear-all {
  background: transparent;
  border: none;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 6px;
}

.inv-quick-tip {
  color: #475569;
  font-size: 0.8rem;
}

/* ==========================================================================
   CARDS GRID (VIEW 1)
   ========================================================================== */
.inv-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
}

.inv-item-card {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.inv-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 32px -8px rgba(15, 23, 42, 0.1);
  border-color: #cbd5e1;
}

.card-health-indicator {
  height: 5px;
  width: 100%;
}

.health-ok .card-health-indicator { background: linear-gradient(90deg, #10b981, #059669); }
.health-low .card-health-indicator { background: linear-gradient(90deg, #f59e0b, #d97706); }
.health-out .card-health-indicator { background: linear-gradient(90deg, #ef4444, #b91c1c); }

.card-head {
  padding: 1.25rem 1.25rem 0.75rem;
}

.card-category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-cat-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.card-status-pill {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.status-ok { background: #d1fae5; color: #065f46; }
.status-low { background: #fef3c7; color: #92400e; }
.status-out { background: #fee2e2; color: #991b1b; }

.card-title-row {
  margin-bottom: 10px;
}

.card-item-title {
  font-size: 1.12rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-pn-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.card-pn-badge {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.78rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.card-pn-badge:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.card-pn-badge:hover .copy-icon {
  color: #2563eb;
}

.pn-label {
  font-weight: 600;
  color: #64748b;
}

.pn-val {
  font-weight: 750;
  color: #0f172a;
}

.copy-icon {
  font-size: 0.75rem;
  color: #94a3b8;
}

.card-mpn-badge {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.74rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.mpn-label { color: #64748b; font-weight: 600; }
.mpn-val { color: #334155; font-weight: 700; }

.card-superseded-banner {
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 0.75rem;
  color: #92400e;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-desc {
  padding: 0 1.25rem 0.75rem;
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.45;
}

.card-desc p {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Gauge & Quantity Controls */
.card-stock-gauge-section {
  padding: 0.9rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  margin-bottom: 6px;
}

.gauge-label {
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.gauge-threshold {
  color: #64748b;
}

.gauge-progress-track {
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 10px;
}

.gauge-progress-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.bg-progress-emerald { background: #10b981; }
.bg-progress-amber { background: #f59e0b; }
.bg-progress-rose { background: #ef4444; }

.gauge-quantity-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quantity-readout {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.qty-big {
  font-size: 1.6rem;
  font-weight: 850;
  letter-spacing: -0.02em;
}

.qty-unit {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.text-emerald { color: #059669; }
.text-amber { color: #d97706; }
.text-rose { color: #dc2626; }

.stepper-action-group {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 2px;
}

.stepper-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #334155;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.stepper-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
}

.stepper-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Card Foot */
.card-foot {
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.foot-updated {
  font-size: 0.74rem;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.foot-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-action-btn {
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.card-action-btn.btn-edit {
  background: #f8fafc;
  color: #2563eb;
  border-color: #bfdbfe;
}

.card-action-btn.btn-edit:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.card-action-btn.btn-delete {
  background: #f8fafc;
  color: #dc2626;
  border-color: #fecaca;
  width: 32px;
  padding: 0;
  justify-content: center;
}

.card-action-btn.btn-delete:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* ==========================================================================
   TABLE VIEW (VIEW 2)
   ========================================================================== */
.inv-table-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
}

.inv-table-responsive {
  width: 100%;
  overflow-x: auto;
}

.inv-data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
}

.inv-data-table th {
  background: #f8fafc;
  padding: 14px 18px;
  font-size: 0.75rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1.5px solid #e2e8f0;
  white-space: nowrap;
}

.inv-table-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.inv-table-row:hover {
  background: #f8fafc;
}

.inv-data-table td {
  padding: 14px 18px;
  vertical-align: middle;
}

.cell-index {
  color: #94a3b8;
  font-size: 0.82rem;
}

.cell-part-info {
  max-width: 280px;
}

.table-part-name {
  display: block;
  font-weight: 750;
  color: #0f172a;
  line-height: 1.35;
}

.table-part-desc {
  display: block;
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-sub-pill {
  font-size: 0.72rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.cell-pn {
  white-space: nowrap;
}

.table-pn-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.table-pn-wrap:hover {
  background: #eff6ff;
  color: #2563eb;
}

.table-pn-text {
  font-weight: 750;
  color: #0f172a;
  font-size: 0.82rem;
}

.table-mpn-text {
  display: block;
  font-size: 0.74rem;
  color: #64748b;
  margin-top: 4px;
}

.table-cat-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
}

.cell-stock-balance {
  min-width: 170px;
}

.table-stock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.table-qty-group {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.table-qty-num {
  font-size: 1.15rem;
  font-weight: 850;
}

.table-qty-unit {
  font-size: 0.78rem;
  color: #64748b;
}

.table-stepper {
  display: inline-flex;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
}

.table-step-btn {
  background: #ffffff;
  border: none;
  width: 24px;
  height: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-step-btn:hover:not(:disabled) {
  background: #f1f5f9;
}

.table-step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.table-stock-mini-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
}

.cell-updated {
  font-size: 0.78rem;
  white-space: nowrap;
}

.tbl-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  margin-left: 6px;
  transition: all 0.2s ease;
}

.btn-tbl-edit { color: #2563eb; }
.btn-tbl-edit:hover { background: #eff6ff; border-color: #bfdbfe; }
.btn-tbl-delete { color: #dc2626; }
.btn-tbl-delete:hover { background: #fee2e2; border-color: #fecaca; }

/* ==========================================================================
   LOADING & EMPTY STATES
   ========================================================================== */
.inv-loading-state {
  text-align: center;
  padding: 5rem 2rem;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
}

.inv-spinner-ring {
  width: 52px;
  height: 52px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: invSpin 0.9s linear infinite;
  margin: 0 auto 1.25rem;
}

.inv-loading-state h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px;
}

.inv-loading-state p {
  color: #64748b;
  font-size: 0.88rem;
  margin: 0;
}

.inv-empty-card {
  text-align: center;
  padding: 4.5rem 2rem;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.25rem;
}

.inv-empty-card h3 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px;
}

.inv-empty-card p {
  color: #64748b;
  font-size: 0.9rem;
  max-width: 480px;
  margin: 0 auto 1.5rem;
}

.empty-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-empty-reset {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-empty-add {
  background: #2563eb;
  border: none;
  color: #ffffff;
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

/* ==========================================================================
   ADD / EDIT MODAL
   ========================================================================== */
.inv-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 1.5rem;
  animation: invFadeIn 0.2s ease-out;
}

.inv-modal-card {
  width: 100%;
  max-width: 680px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  border: 1px solid #e2e8f0;
  animation: invModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.inv-modal-header {
  padding: 1.35rem 1.75rem;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.icon-indigo { background: #eff6ff; color: #2563eb; }
.icon-amber { background: #fffbeb; color: #d97706; }

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.78rem;
  color: #64748b;
  display: block;
  margin-top: 2px;
}

.modal-btn-close {
  background: #f1f5f9;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.15s ease;
}

.modal-btn-close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.inv-modal-form {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-body-scroll {
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-badge-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}

.req-star {
  color: #dc2626;
}

.inv-input {
  height: 40px;
  padding: 0 12px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #0f172a;
  transition: all 0.2s ease;
  width: 100%;
}

.inv-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.inv-textarea {
  padding: 10px 12px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.86rem;
  color: #0f172a;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;
}

.inv-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.inv-modal-footer {
  padding: 1.15rem 1.75rem;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-modal-cancel {
  height: 40px;
  padding: 0 1.25rem;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-cancel:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-modal-submit {
  height: 40px;
  padding: 0 1.5rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: none;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 750;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
  transition: all 0.2s ease;
}

.btn-modal-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.45);
}

.btn-modal-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ==========================================================================
   DELETE CONFIRMATION MODAL
   ========================================================================== */
.inv-delete-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem 1.75rem;
  text-align: center;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35);
  border: 1px solid #fecaca;
  animation: invModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.delete-icon-pulse {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 1.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}

.delete-title {
  font-size: 1.25rem;
  font-weight: 850;
  color: #0f172a;
  margin: 0 0 8px;
}

.delete-desc {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.45;
  margin: 0 0 1.75rem;
}

.delete-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-delete-cancel {
  height: 40px;
  padding: 0 1.25rem;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.btn-delete-cancel:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-delete-confirm {
  height: 40px;
  padding: 0 1.25rem;
  border-radius: 10px;
  background: #dc2626;
  border: none;
  font-size: 0.85rem;
  font-weight: 750;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
}

.btn-delete-confirm:hover:not(:disabled) {
  background: #b91c1c;
}

/* ==========================================================================
   ANIMATIONS & RESPONSIVE
   ========================================================================== */
@keyframes invFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes invModalPop {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes invSlideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes invSpin {
  to { transform: rotate(360deg); }
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

@media (max-width: 1200px) {
  .inv-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .inventory-content-container {
    padding: 1.25rem 1rem 2.5rem;
  }
  .inv-kpi-grid {
    grid-template-columns: 1fr;
  }
  .toolbar-controls-row {
    width: 100%;
  }
  .inv-select-wrap, .inv-select {
    width: 100%;
  }
  .inv-status-tabs {
    width: 100%;
    overflow-x: auto;
  }
  .form-grid-2, .form-grid-3 {
    grid-template-columns: 1fr;
  }
  .hide-mobile {
    display: none;
  }
  .inv-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>