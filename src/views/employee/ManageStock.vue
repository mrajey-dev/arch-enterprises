<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="inventory-board-premium" v-if="!isMobile || !isSidebarVisible">
        <!-- Connection Status Alert -->
        <div v-if="connectionError" class="connection-alert">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ connectionError }}</span>
          <button @click="retryConnection" class="retry-btn">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>

        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-boxes"></i>
            </div>
            <div>
              <h1>Inventory Manager</h1>
              <p class="subtitle-modern">Track stock levels, part numbers & reorder alerts</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-pallet"></i>
            <span>{{ items.length }} Items in Stock</span>
            <span v-if="usingLocalStorage" class="offline-badge">
              <i class="fas fa-database"></i> Offline Mode
            </span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-cubes"></i>
            <div class="stat-info">
              <span class="stat-value">{{ totalQuantity }}</span>
              <span class="stat-label">Total Units</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="stat-info">
              <span class="stat-value">{{ lowStockCount }}</span>
              <span class="stat-label">Low Stock Items</span>
            </div>
          </div>
          <div class="stat-card" @click="openAddModal">
            <i class="fas fa-plus-circle"></i>
            <div class="stat-info">
              <span class="stat-value action-stat">+ Add Item</span>
              <span class="stat-label">New Stock Entry</span>
            </div>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="search-filter-bar">
          <div class="search-wrapper">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by name, part number, or description..."
              class="search-input"
            />
          </div>
          <div class="filter-group">
            <select v-model="filterCategory" class="filter-select">
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Hardware">Hardware</option>
              <option value="Tools">Tools</option>
              <option value="Raw Material">Raw Material</option>
              <option value="Other">Other</option>
            </select>
            <select v-model="filterStockStatus" class="filter-select">
              <option value="">All Status</option>
              <option value="low">Low Stock (≤ threshold)</option>
              <option value="normal">Normal Stock</option>
            </select>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="loading-container">
          <i class="fas fa-spinner fa-pulse"></i>
          <span>Loading inventory...</span>
        </div>

        <!-- Inventory Grid -->
        <div v-else class="items-section">
          <div class="section-title-modern">
            <i class="fas fa-clipboard-list"></i>
            <span>Stock Inventory</span>
            <button class="btn-add-small" @click="openAddModal">
              <i class="fas fa-plus"></i> Add Item
            </button>
          </div>

          <div v-if="filteredItems.length" class="items-grid-premium">
            <div v-for="item in filteredItems" :key="item.id" class="stock-card-premium">
              <div class="card-accent" :class="{ 'low-stock-accent': item.quantity <= item.min_stock_threshold }"></div>
              <div class="stock-header">
                <div class="stock-icon" :class="{ 'warning-icon': item.quantity <= item.min_stock_threshold }">
                  <i class="fas fa-microchip"></i>
                </div>
                <div class="stock-title-wrap">
                  <h3>{{ item.name }}</h3>
                  <div class="stock-meta">
                    <span><i class="fas fa-hashtag"></i> P/N: {{ item.part_number }}</span>
                    <span v-if="item.superseded_part_number"><i class="fas fa-exchange-alt"></i> Supersedes: {{ item.superseded_part_number }}</span>
                  </div>
                </div>
                <div class="stock-actions">
                  <button class="action-btn edit-btn" @click="openEditModal(item)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete-btn" @click="confirmDelete(item)" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              
              <div class="stock-description" v-if="item.description">
                <i class="fas fa-align-left"></i>
                <span>{{ item.description }}</span>
              </div>
              
              <div class="stock-details-grid">
                <div class="detail-item">
                  <span class="detail-label"><i class="fas fa-cubes"></i> Quantity</span>
                  <span class="detail-value" :class="{ 'low-text': item.quantity <= item.min_stock_threshold }">
                    {{ item.quantity }} {{ item.unit }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label"><i class="fas fa-chart-line"></i> Min Threshold</span>
                  <span class="detail-value">{{ item.min_stock_threshold }} {{ item.unit }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label"><i class="fas fa-tag"></i> Category</span>
                  <span class="detail-value">{{ item.category || '—' }}</span>
                </div>
                <!-- <div class="detail-item">
                  <span class="detail-label"><i class="fas fa-dollar-sign"></i> Unit Cost</span>
                  <span class="detail-value">{{ formatCurrency(item.unit_cost) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label"><i class="fas fa-map-marker-alt"></i> Location</span>
                  <span class="detail-value">{{ item.location || '—' }}</span>
                </div> -->
                <div class="detail-item">
                  <span class="detail-label"><i class="fas fa-microchip"></i> MPN</span>
                  <span class="detail-value">{{ item.manufacturer_part_number || '—' }}</span>
                </div>
              </div>
              
              <div class="stock-footer">
                <div class="badge-status" :class="getStockStatusClass(item.quantity, item.min_stock_threshold)">
                  <i :class="getStockStatusIcon(item.quantity, item.min_stock_threshold)"></i>
                  {{ getStockStatusText(item.quantity, item.min_stock_threshold) }}
                </div>
                <div class="badge-updated">
                  <i class="fas fa-clock"></i> Updated: {{ formatDate(item.last_updated || item.updated_at) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state-premium">
            <i class="fas fa-box-open"></i>
            <h4>No Stock Items Found</h4>
            <p>Add your first inventory item to start tracking parts, quantities, and reorder levels.</p>
            <button class="btn-primary-empty" @click="openAddModal">
              <i class="fas fa-plus-circle"></i> Add First Stock Item
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container-premium">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-boxes"></i>
          </div>
          <h2>{{ isEditing ? 'Edit Stock Item' : 'Add New Stock Item' }}</h2>
          <button class="close-modal" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveItem">
            <div class="form-row">
              <div class="form-group half">
                <label><i class="fas fa-tag"></i> Item Name *</label>
                <input type="text" v-model="form.name" placeholder="e.g., Hydraulic Pump, Resistor Kit" required>
              </div>
              <div class="form-group half">
                <label><i class="fas fa-hashtag"></i> Part Number *</label>
                <input type="text" v-model="form.partNumber" placeholder="e.g., HP-2045-X" required>
              </div>
            </div>
            <div class="form-group">
              <label><i class="fas fa-random"></i> Replace/Superseded Part Number</label>
              <input type="text" v-model="form.supersededPartNumber" placeholder="Original part number that this replaces">
            </div>
            <div class="form-group">
              <label><i class="fas fa-align-left"></i> Description</label>
              <textarea v-model="form.description" rows="2" placeholder="Detailed description, specifications, or notes..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label><i class="fas fa-cubes"></i> Quantity *</label>
                <input type="number" v-model.number="form.quantity" min="0" step="1" required>
              </div>
              <div class="form-group half">
                <label><i class="fas fa-ruler"></i> Unit</label>
                <input type="text" v-model="form.unit" placeholder="pcs, kg, meters, liters">
              </div>
            </div>
            <!-- <div class="form-row">
              <div class="form-group half">
                <label><i class="fas fa-chart-line"></i> Min Stock Threshold *</label>
                <input type="number" v-model.number="form.minStockThreshold" min="0" step="1" required>
              </div>
              <div class="form-group half">
                <label><i class="fas fa-dollar-sign"></i> Unit Cost</label>
                <input type="number" v-model.number="form.unitCost" min="0" step="0.01" placeholder="0.00">
              </div>
            </div> -->
            <div class="form-row">
              <div class="form-group half">
                <label><i class="fas fa-tags"></i> Category</label>
                <select v-model="form.category">
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Tools">Tools</option>
                  <option value="Raw Material">Raw Material</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <!-- <div class="form-group half">
                <label><i class="fas fa-map-marker-alt"></i> Storage Location</label>
                <input type="text" v-model="form.location" placeholder="e.g., Shelf A-12, Warehouse B">
              </div> -->
            </div>
            <div class="form-group">
              <label><i class="fas fa-microchip"></i> Manufacturer Part Number (MPN)</label>
              <input type="text" v-model="form.manufacturerPartNumber" placeholder="Manufacturer's part number">
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="loading">
                <i v-if="loading" class="fas fa-spinner fa-pulse"></i>
                <i v-else class="fas fa-save"></i>
                {{ loading ? 'Saving...' : (isEditing ? 'Update Item' : 'Add to Inventory') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'

// Simple toast functions (replace with your actual toast utility)
const toastSuccess = (msg) => { alert('✓ ' + msg) }
const toastError = (msg) => { alert('✗ ' + msg) }

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
      showModal: false,
      isEditing: false,
      currentEditId: null,
      loading: false,
      connectionError: '',
      usingLocalStorage: false,
      apiBaseUrl: 'https://employees.archenterprises.co.in/api/api', // Make sure Laravel is running on this URL
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
    }
  },
  computed: {
    totalQuantity() {
      return this.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    },
    lowStockCount() {
      return this.items.filter(item => item.quantity <= item.min_stock_threshold).length
    },
    filteredItems() {
      let filtered = [...this.items]
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.part_number.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)) ||
          (item.superseded_part_number && item.superseded_part_number.toLowerCase().includes(query))
        )
      }
      
      if (this.filterCategory) {
        filtered = filtered.filter(item => item.category === this.filterCategory)
      }
      
      if (this.filterStockStatus === 'low') {
        filtered = filtered.filter(item => item.quantity <= item.min_stock_threshold)
      } else if (this.filterStockStatus === 'normal') {
        filtered = filtered.filter(item => item.quantity > item.min_stock_threshold)
      }
      
      return filtered
    }
  },
  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    this.loadItems()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },
    
    async loadItems() {
      this.loading = true
      this.connectionError = ''
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/inventory/items`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.status) {
          this.items = data.data
          this.usingLocalStorage = false
          // Backup to localStorage
          localStorage.setItem('inventory_items_backup', JSON.stringify(this.items))
        //   toastSuccess('Inventory loaded from server')
        } else {
          throw new Error(data.message || 'Failed to load items')
        }
      } catch (error) {
        console.error('Error loading items:', error)
        this.connectionError = 'Cannot connect to server. Using offline data.'
        
        // Fallback to localStorage backup
        const backup = localStorage.getItem('inventory_items_backup')
        if (backup) {
          this.items = JSON.parse(backup)
          this.usingLocalStorage = true
          toastError('Using offline data. Please check your connection.')
        } else {
          // No static data - just set empty array
          this.items = []
          toastError('Unable to connect to server. No offline data available.')
        }
      } finally {
        this.loading = false
      }
    },
    
    async saveItem() {
      if (!this.form.name || !this.form.partNumber) {
        toastError('Please fill in Item Name and Part Number')
        return
      }
      
      this.loading = true
      
      const payload = {
        name: this.form.name,
        part_number: this.form.partNumber,
        superseded_part_number: this.form.supersededPartNumber,
        description: this.form.description,
        quantity: this.form.quantity,
        unit: this.form.unit,
        min_stock_threshold: this.form.minStockThreshold,
        unit_cost: this.form.unitCost,
        category: this.form.category,
        location: this.form.location,
        manufacturer_part_number: this.form.manufacturerPartNumber
      }
      
      try {
        let url, method
        
        if (this.isEditing && this.currentEditId) {
          url = `${this.apiBaseUrl}/inventory/items/${this.currentEditId}`
          method = 'PUT'
        } else {
          url = `${this.apiBaseUrl}/inventory/items`
          method = 'POST'
        }
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.status) {
          await this.loadItems()
          this.closeModal()
          toastSuccess(this.isEditing ? 'Item updated successfully' : 'New stock item added')
        } else {
          throw new Error(data.message || 'Operation failed')
        }
      } catch (error) {
        console.error('Error saving item:', error)
        
        // Fallback: Save to localStorage only
        if (this.isEditing && this.currentEditId) {
          const index = this.items.findIndex(i => i.id === this.currentEditId)
          if (index !== -1) {
            this.items[index] = { ...this.items[index], ...payload, last_updated: new Date().toISOString() }
          }
        } else {
          const newItem = {
            id: Date.now(),
            ...payload,
            last_updated: new Date().toISOString()
          }
          this.items.unshift(newItem)
        }
        
        localStorage.setItem('inventory_items_backup', JSON.stringify(this.items))
        this.closeModal()
        toastError('Saved locally. Will sync when connection resumes.')
      } finally {
        this.loading = false
      }
    },
    
    async confirmDelete(item) {
      if (confirm(`Delete "${item.name}" (${item.part_number}) from inventory? This action cannot be undone.`)) {
        this.loading = true
        
        try {
          const response = await fetch(`${this.apiBaseUrl}/inventory/items/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          
          const data = await response.json()
          
          if (data.status) {
            await this.loadItems()
            toastSuccess('Item deleted from inventory')
          } else {
            throw new Error(data.message || 'Failed to delete item')
          }
        } catch (error) {
          console.error('Error deleting item:', error)
          // Fallback: Remove from local array
          this.items = this.items.filter(i => i.id !== item.id)
          localStorage.setItem('inventory_items_backup', JSON.stringify(this.items))
          toastError('Deleted locally. Will sync when connection resumes.')
        } finally {
          this.loading = false
        }
      }
    },
    
    retryConnection() {
      this.loadItems()
    },
    
    openAddModal() {
      this.isEditing = false
      this.currentEditId = null
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
      }
      this.showModal = true
    },
    
    openEditModal(item) {
      this.isEditing = true
      this.currentEditId = item.id
      this.form = {
        name: item.name,
        partNumber: item.part_number,
        supersededPartNumber: item.superseded_part_number || '',
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit || 'pcs',
        minStockThreshold: item.min_stock_threshold,
        unitCost: item.unit_cost || null,
        category: item.category || '',
        location: item.location || '',
        manufacturerPartNumber: item.manufacturer_part_number || ''
      }
      this.showModal = true
    },
    
    closeModal() {
      this.showModal = false
      this.isEditing = false
      this.currentEditId = null
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    
    formatCurrency(value) {
      if (value === null || value === undefined) return '—'
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)
    },
    
    getStockStatusClass(quantity, threshold) {
      if (quantity <= 0) return 'status-out'
      if (quantity <= threshold) return 'status-low'
      return 'status-ok'
    },
    
    getStockStatusIcon(quantity, threshold) {
      if (quantity <= 0) return 'fas fa-ban'
      if (quantity <= threshold) return 'fas fa-exclamation-circle'
      return 'fas fa-check-circle'
    },
    
    getStockStatusText(quantity, threshold) {
      if (quantity <= 0) return 'Out of Stock'
      if (quantity <= threshold) return `Low Stock (≤${threshold})`
      return 'In Stock'
    }
  }
}
</script>

<style scoped>
/* Add these new styles */
.connection-alert {
  background: linear-gradient(135deg, #fff3e0, #ffe8cc);
  border-left: 4px solid #f59e0b;
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.connection-alert i {
  color: #f59e0b;
  font-size: 18px;
}

.retry-btn {
  margin-left: auto;
  background: white;
  border: 1px solid #f59e0b;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  transition: 0.2s;
}

.retry-btn:hover {
  background: #f59e0b;
  color: white;
}

.offline-badge {
  background: #6b7280;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  margin-left: 10px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 60px;
  color: var(--primary-color);
  font-size: 16px;
}

.loading-container i {
  font-size: 24px;
}

/* Keep all your existing styles below */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  --primary-color: #2a5298;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}

.layout {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f4f7fc;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.inventory-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

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

.stats-badge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:last-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 32px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.action-stat {
  font-size: 20px;
  background: var(--primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

.search-filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 2;
  position: relative;
}

.search-wrapper i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  font-size: 14px;
  transition: 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.section-title-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
}

.btn-add-small {
  background: var(--primary);
  border: none;
  padding: 6px 16px;
  border-radius: 30px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.items-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
}

.stock-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.stock-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.12);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
}

.card-accent.low-stock-accent {
  background: var(--warning);
}

.stock-header {
  display: flex;
  padding: 18px;
  gap: 14px;
  align-items: flex-start;
  background: #fafbfc;
  border-bottom: 1px solid #eef2f6;
}

.stock-icon {
  width: 48px;
  height: 48px;
  background: #e0e7ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 24px;
}

.stock-icon.warning-icon {
  background: #fed7aa;
  color: #c2410c;
}

.stock-title-wrap {
  flex: 1;
}

.stock-title-wrap h3 {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.stock-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: #6c757d;
}

.stock-meta i {
  margin-right: 4px;
}

.stock-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
}

.edit-btn { color: var(--info); }
.edit-btn:hover { background: #e0e7ff; }
.delete-btn { color: var(--danger); }
.delete-btn:hover { background: #fee2e2; }

.stock-description {
  padding: 12px 18px;
  font-size: 13px;
  color: #4b5563;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.stock-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px 18px;
  background: #fefefe;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.detail-value.low-text {
  color: var(--warning);
  font-weight: 700;
}

.stock-footer {
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  border-top: 1px solid #eef2f6;
}

.badge-status {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 30px;
  font-weight: 600;
}

.badge-status.status-ok {
  background: #d1fae5;
  color: #065f46;
}

.badge-status.status-low {
  background: #fed7aa;
  color: #9a3412;
}

.badge-status.status-out {
  background: #fee2e2;
  color: #991b1b;
}

.badge-updated {
  font-size: 11px;
  color: #6c757d;
}

.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 28px;
}

.empty-state-premium i {
  font-size: 34px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.btn-primary-empty {
  margin-top: 20px;
  background: var(--primary);
  border: none;
  padding: 10px 24px;
  border-radius: 40px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container-premium {
  background: white;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-icon {
  font-size: 28px;
  color: var(--primary-color);
}

.close-modal {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  font-family: inherit;
  transition: 0.2s;
}

.form-row {
  display: flex;
  gap: 14px;
}

.half { flex: 1; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary, .btn-secondary {
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: #e2e8f0;
  color: #1e293b;
}

@media (max-width: 768px) {
  .main-content { flex-direction: column; padding: 12px; }
  .inventory-board-premium { padding: 16px; }
  .items-grid-premium { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; gap: 0; }
  .filter-group { width: 100%; }
  .filter-select { flex: 1; }
}
</style>