<template>
  <div class="layout" @contextmenu.prevent="handleGlobalContextMenu">
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <section class="content">
        <!-- Mobile Header -->
        <div class="mobile-header" v-if="isMobile">
          <button class="menu-toggle" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
          <div class="mobile-title">
            <i class="fas fa-folder-open"></i>
            <span>File Manager</span>
          </div>
          <div class="mobile-stats-badge">
            <span>{{ totalItems }}</span>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="content-header-modern" v-else>
          <div class="header-left desktop-only">
            <div class="title-icon">
              <i class="fas fa-folder-open"></i>
            </div>
            <div>
              <h1>File Manager</h1>
              <p class="subtitle-modern">Manage your files and folders</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-folder"></i>
            <span>{{ folders.length }} Folders</span>
            <span style="margin: 0 8px;">•</span>
            <i class="fas fa-file"></i>
            <span>{{ files.length }} Files</span>
          </div>
        </div>

        <!-- Breadcrumb Navigation -->
        <div class="breadcrumb-bar">
          <div class="breadcrumb">
            <span @click="navigateToRoot" class="breadcrumb-item">
              <i class="fas fa-home"></i> Root
            </span>
            <span v-for="(folder, index) in breadcrumbPath" :key="index" class="breadcrumb-separator">/</span>
            <span v-for="(folder, index) in breadcrumbPath" :key="'path-'+index" 
                  @click="navigateToBreadcrumb(index)" 
                  class="breadcrumb-item">
              {{ folder.name }}
            </span>
          </div>
          <div class="breadcrumb-actions">
            <button @click="refreshFiles" class="btn-icon" title="Refresh">
              <i class="fas fa-sync"></i>
            </button>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="action-bar">
          <div class="action-group-left">
            <button @click="showCreateFolder = true" class="btn-action primary">
              <i class="fas fa-folder-plus"></i>
              <span>New Folder</span>
            </button>
            <button @click="showCreateFile = true" class="btn-action primary">
              <i class="fas fa-file-plus"></i>
              <span>New File</span>
            </button>
            <button @click="triggerFileUpload" class="btn-action secondary">
              <i class="fas fa-upload"></i>
              <span>Upload</span>
            </button>
            <input type="file" ref="fileInput" @change="handleFileUpload" multiple style="display: none">
            
            <!-- Clipboard Status -->
            <span v-if="clipboardItems.length > 0" class="clipboard-status">
              <i class="fas fa-clipboard"></i>
              {{ clipboardItems.length }} item(s) {{ clipboardAction === 'copy' ? 'copied' : 'cut' }}
              <button @click="clearClipboard" class="btn-clear-clipboard">×</button>
            </span>
          </div>
          <div class="action-group-right">
            <div class="search-wrapper">
              <i class="fas fa-search"></i>
              <input type="text" v-model="searchQuery" placeholder="Search files..." class="search-input">
            </div>
            <button @click="toggleView" class="btn-icon" :title="viewMode === 'grid' ? 'List View' : 'Grid View'">
              <i :class="viewMode === 'grid' ? 'fas fa-list' : 'fas fa-th'"></i>
            </button>
          </div>
        </div>

        <!-- File/Folder Grid/List -->
        <div class="file-manager-content">
          <!-- Grid View -->
          <div v-if="viewMode === 'list'" class="grid-view">
            <div v-for="item in filteredItems" :key="item.id" 
                 class="grid-item" 
                 :class="{ 
                   selected: selectedItems.includes(item.id),
                   'clipboard-item': isInClipboard(item.id)
                 }"
                 @click="handleItemClick(item, $event)"
                 @dblclick="openItem(item)"
                 @contextmenu="handleRightClick($event, item)">
              <div class="grid-item-checkbox" @click.stop>
                <input type="checkbox" :value="item.id" v-model="selectedItems">
              </div>
              <div class="grid-item-icon">
                <i :class="getItemIcon(item)"></i>
              </div>
              <div class="grid-item-name" :title="item.name">{{ item.name }}</div>
              <div class="grid-item-meta">
                <span class="grid-item-size">{{ formatSize(item.size) }}</span>
                <span class="grid-item-date">{{ formatDate(item.updated_at) }}</span>
              </div>
              <div class="grid-item-actions" @click.stop>
                <button @click="editItem(item)" class="btn-action-icon" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteItem(item)" class="btn-action-icon danger" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
                <button @click="moveItem(item)" class="btn-action-icon" title="Move">
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="list-view">
            <table class="file-table">
              <thead>
                <tr>
                  <th style="width: 40px;">
                    <input type="checkbox" @change="selectAll" v-model="selectAllChecked">
                  </th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Modified</th>
                  <th style="width: 220px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredItems" :key="item.id" 
                    :class="{ 
                      selected: selectedItems.includes(item.id),
                      'clipboard-item': isInClipboard(item.id)
                    }"
                    @click="handleItemClick(item, $event)"
                    @dblclick="openItem(item)"
                    @contextmenu="handleRightClick($event, item)">
                  <td @click.stop>
                    <input type="checkbox" :value="item.id" v-model="selectedItems">
                  </td>
                  <td>
                    <div class="file-name-cell">
                      <i :class="getItemIcon(item)"></i>
                      <span :title="item.name">{{ item.name }}</span>
                    </div>
                  </td>
                  <td><span class="type-badge">{{ item.type }}</span></td>
                  <td>{{ formatSize(item.size) }}</td>
                  <td>{{ formatDate(item.updated_at) }}</td>
                  <td @click.stop>
                    <div class="action-buttons">
                      <button @click="editItem(item)" class="btn-action-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteItem(item)" class="btn-action-icon danger" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                      <button @click="moveItem(item)" class="btn-action-icon" title="Move">
                        <i class="fas fa-arrow-right"></i>
                      </button>
                      <button @click="copyItem(item)" class="btn-action-icon" title="Copy">
                        <i class="fas fa-copy"></i>
                      </button>
                      <button @click="downloadItem(item)" class="btn-action-icon" title="Download">
                        <i class="fas fa-download"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredItems.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <h4>No Items Found</h4>
            <p>{{ searchQuery ? 'Try adjusting your search' : 'Create a new folder or upload files to get started' }}</p>
          </div>

          <!-- Bulk Actions -->
          <div v-if="selectedItems.length > 0" class="bulk-actions">
            <span>{{ selectedItems.length }} items selected</span>
            <div class="bulk-actions-group">
              <button @click="bulkDelete" class="btn-action danger">Delete Selected</button>
              <button @click="bulkMove" class="btn-action secondary">Move Selected</button>
              <button @click="bulkMoveOut" class="btn-action secondary" v-if="currentFolder">
                <i class="fas fa-level-up-alt"></i> Move Out
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Context Menu -->
    <div v-if="contextMenu.visible" class="context-menu" 
         :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
         @click.stop>
      
      <!-- If right-clicked on a folder, show "Paste Here" option -->
      <div v-if="contextMenu.isFolder && clipboardItems.length > 0" 
           class="context-menu-item highlight" 
           @click="handleContextMenuAction('paste_here')">
        <i class="fas fa-paste"></i> Paste Here
        <span class="shortcut">(into this folder)</span>
      </div>
      
      <!-- Regular paste option -->
      <div class="context-menu-item" @click="handleContextMenuAction('paste')" 
           :class="{ disabled: clipboardItems.length === 0 }">
        <i class="fas fa-paste"></i> Paste
        <span class="shortcut">Ctrl+V</span>
      </div>
      
      <div class="context-menu-divider"></div>
      
      <div class="context-menu-item" @click="handleContextMenuAction('copy')" 
           :class="{ disabled: !contextMenu.item && selectedItems.length === 0 }">
        <i class="fas fa-copy"></i> Copy
        <span class="shortcut">Ctrl+C</span>
      </div>
      
      <div class="context-menu-item" @click="handleContextMenuAction('cut')"
           :class="{ disabled: !contextMenu.item && selectedItems.length === 0 }">
        <i class="fas fa-cut"></i> Cut
        <span class="shortcut">Ctrl+X</span>
      </div>
      
      <div class="context-menu-divider"></div>
      
      <div class="context-menu-item" @click="handleContextMenuAction('rename')"
           :class="{ disabled: !contextMenu.item }">
        <i class="fas fa-pen"></i> Rename
      </div>
      
      <div class="context-menu-item" @click="handleContextMenuAction('delete')"
           :class="{ disabled: !contextMenu.item && selectedItems.length === 0 }">
        <i class="fas fa-trash"></i> Delete
      </div>
      
      <div class="context-menu-divider"></div>
      
      <div class="context-menu-item" @click="handleContextMenuAction('download')" 
           v-if="contextMenu.item?.type === 'file'">
        <i class="fas fa-download"></i> Download
      </div>
      
      <div class="context-menu-item" @click="handleContextMenuAction('open')"
           :class="{ disabled: !contextMenu.item }">
        <i class="fas fa-folder-open"></i> Open
      </div>
      
      <div class="context-menu-item" @click="handleContextMenuAction('open_in_new_tab')"
           v-if="contextMenu.item?.type === 'file'">
        <i class="fas fa-external-link-alt"></i> Open in New Tab
      </div>
    </div>

    <!-- Create Folder Modal -->
    <div v-if="showCreateFolder" class="modal-overlay" @click.self="showCreateFolder = false">
      <div class="modal">
        <div class="modal-header">
          <h3><i class="fas fa-folder-plus"></i> Create New Folder</h3>
          <button @click="showCreateFolder = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Folder Name</label>
            <input type="text" v-model="newFolderName" placeholder="Enter folder name..." @keyup.enter="createFolder">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCreateFolder = false" class="btn-secondary">Cancel</button>
          <button @click="createFolder" class="btn-primary">Create</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit File Modal -->
    <div v-if="showCreateFile" class="modal-overlay" @click.self="showCreateFile = false">
      <div class="modal large">
        <div class="modal-header">
          <h3><i class="fas fa-file-plus"></i> {{ editingFile ? 'Edit File' : 'Create New File' }}</h3>
          <button @click="closeFileModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>File Name</label>
            <input type="text" v-model="newFileName" placeholder="Enter file name..." @keyup.enter="saveFile">
          </div>
          <div class="form-group">
            <label>File Content</label>
            <textarea v-model="fileContent" rows="12" placeholder="Write or paste your content here..." 
                      class="code-editor"></textarea>
          </div>
          <div class="form-group" v-if="!editingFile">
            <label>Or Upload File</label>
            <div class="drop-zone" @dragover.prevent @drop.prevent="handleDrop">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Drag & drop files here or click to browse</p>
              <input type="file" @change="handleFileSelect" class="drop-zone-input">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeFileModal" class="btn-secondary">Cancel</button>
          <button @click="saveFile" class="btn-primary">
            <i class="fas fa-save"></i> {{ editingFile ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Move Item Modal -->
    <div v-if="showMoveModal" class="modal-overlay" @click.self="showMoveModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3><i class="fas fa-arrow-right"></i> Move Item</h3>
          <button @click="showMoveModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Move "{{ moveItemData?.name }}" to:</p>
          <div class="folder-tree">
            <!-- Move to Root -->
            <div class="folder-tree-item" 
                 @click="selectMoveDestination(null)"
                 :class="{ selected: moveDestination === null }">
              <i class="fas fa-home"></i>
              <span>Root (Top Level)</span>
            </div>
            
            <!-- Move to Parent -->
            <div v-if="currentFolder && currentFolder.parent_id !== undefined" 
                 class="folder-tree-item" 
                 @click="selectMoveDestination(currentFolder.parent_id)"
                 :class="{ selected: moveDestination === currentFolder.parent_id }">
              <i class="fas fa-level-up-alt"></i>
              <span>Parent Folder</span>
            </div>
            
            <div class="folder-divider">Folders</div>
            
            <div v-for="folder in allFoldersForMove" :key="folder.id" 
                 class="folder-tree-item" 
                 @click="selectMoveDestination(folder.id)"
                 :class="{ selected: moveDestination === folder.id }">
              <i class="fas fa-folder"></i>
              <span>{{ folder.name }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showMoveModal = false" class="btn-secondary">Cancel</button>
          <button @click="confirmMove" class="btn-primary">Move</button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
        <i :class="toast.icon"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import axios from "axios";

export default {
  components: { Sidebar },

  data() {
    return {
      isMobile: false,
      isSidebarVisible: true,
      viewMode: 'grid',
      searchQuery: '',
      typeFilter: 'all',
      currentFolder: null,
      selectedItems: [],
      selectAllChecked: false,
      
      // Items
      folders: [],
      files: [],
      allItems: [],
      
      // Modals
      showCreateFolder: false,
      showCreateFile: false,
      showMoveModal: false,
      
      // Form data
      newFolderName: '',
      newFileName: '',
      fileContent: '',
      editingFile: null,
      
      // Move data
      moveItemData: null,
      moveDestination: null,
      
      // Toast notifications
      toasts: [],
      toastId: 0,
      
      breadcrumbPath: [],
      
      // Context Menu
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        item: null,
        isFolder: false,
        pasteTarget: null
      },
      
      // Clipboard
      clipboardItems: [],
      clipboardAction: 'copy',
      clipboardSource: null
    }
  },

  computed: {
    totalItems() {
      return this.folders.length + this.files.length
    },
    allFoldersForMove() {
      return this.folders.filter(folder => {
        if (this.moveItemData) {
          if (folder.id === this.moveItemData.id) return false
          if (this.moveItemData.type === 'folder' && folder.parent_id === this.moveItemData.id) return false
        }
        return true
      })
    },
    filteredItems() {
      let items = [...this.folders, ...this.files]
      
      if (this.typeFilter === 'folder') {
        items = items.filter(item => item.type === 'folder')
      } else if (this.typeFilter === 'file') {
        items = items.filter(item => item.type === 'file')
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        items = items.filter(item => 
          item.name.toLowerCase().includes(query)
        )
      }
      
      return items.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1
        if (a.type !== 'folder' && b.type === 'folder') return 1
        return a.name.localeCompare(b.name)
      })
    }
  },

  methods: {
    handleKeyboardShortcuts(event) {
      // Ctrl+C - Copy
      if (event.ctrlKey && event.key === 'c') {
        event.preventDefault()
        if (this.selectedItems.length > 0) {
          const items = this.filteredItems.filter(i => this.selectedItems.includes(i.id))
          this.copyToClipboard(items)
        }
      }
      
      // Ctrl+X - Cut
      if (event.ctrlKey && event.key === 'x') {
        event.preventDefault()
        if (this.selectedItems.length > 0) {
          const items = this.filteredItems.filter(i => this.selectedItems.includes(i.id))
          this.cutToClipboard(items)
        }
      }
      
      // Ctrl+V - Paste
      if (event.ctrlKey && event.key === 'v') {
        event.preventDefault()
        this.pasteFromClipboard(this.currentFolder?.id || null)
      }
      
      // Escape - Close context menu
      if (event.key === 'Escape') {
        this.closeContextMenu()
      }
    },
    
    // Navigation
    navigateToRoot() {
      this.currentFolder = null
      this.breadcrumbPath = []
      this.fetchItems()
    },
    
    navigateToBreadcrumb(index) {
      this.breadcrumbPath = this.breadcrumbPath.slice(0, index + 1)
      this.currentFolder = this.breadcrumbPath[this.breadcrumbPath.length - 1]
      this.fetchItems()
    },

    // Fetch items
    async fetchItems() {
      try {
        const response = await axios.get('/api/files', {
          params: { parent_id: this.currentFolder?.id || null },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.folders = response.data.folders || []
        this.files = response.data.files || []
        this.allItems = [...this.folders, ...this.files]
        this.selectedItems = []
      } catch (error) {
        console.error('Error fetching items:', error)
        this.showToast('error', 'Failed to load files')
      }
    },

    refreshFiles() {
      this.fetchItems()
      this.showToast('success', 'Refreshed successfully')
    },

    // File/Folder operations
    async createFolder() {
      if (!this.newFolderName.trim()) {
        this.showToast('warning', 'Please enter a folder name')
        return
      }

      try {
        await axios.post('/api/files/folder', {
          name: this.newFolderName,
          parent_id: this.currentFolder?.id || null
        }, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
        this.showToast('success', 'Folder created successfully')
        this.showCreateFolder = false
        this.newFolderName = ''
        this.fetchItems()
      } catch (error) {
        console.error('Error creating folder:', error)
        if (error.response) {
          this.showToast('error', error.response.data.message || 'Failed to create folder')
        } else {
          this.showToast('error', 'Failed to create folder')
        }
      }
    },

    async saveFile() {
      if (!this.newFileName.trim()) {
        this.showToast('warning', 'Please enter a file name')
        return
      }

      try {
        const data = {
          name: this.newFileName,
          type: 'file',
          content: this.fileContent,
          parent_id: this.currentFolder?.id || null
        }

        if (this.editingFile) {
          await axios.put(`/api/files/${this.editingFile.id}`, {
            name: this.newFileName,
            content: this.fileContent
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          this.showToast('success', 'File updated successfully')
        } else {
          await axios.post('/api/files', data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          this.showToast('success', 'File created successfully')
        }
        
        this.closeFileModal()
        this.fetchItems()
      } catch (error) {
        console.error('Error saving file:', error)
        this.showToast('error', 'Failed to save file')
      }
    },

    async deleteItem(item) {
      if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return

      try {
        await axios.delete(`/api/files/${item.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.showToast('success', `"${item.name}" deleted successfully`)
        this.fetchItems()
      } catch (error) {
        console.error('Error deleting item:', error)
        this.showToast('error', 'Failed to delete item')
      }
    },

    async bulkDelete() {
      if (!confirm(`Delete ${this.selectedItems.length} selected items?`)) return

      try {
        await axios.post('/api/files/bulk-delete', {
          ids: this.selectedItems
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.showToast('success', `${this.selectedItems.length} items deleted`)
        this.selectedItems = []
        this.fetchItems()
      } catch (error) {
        console.error('Error bulk deleting:', error)
        this.showToast('error', 'Failed to delete items')
      }
    },

    // Bulk Move Out
    async bulkMoveOut() {
      if (!this.selectedItems.length) {
        this.showToast('warning', 'No items selected')
        return
      }

      if (!this.currentFolder) {
        this.showToast('warning', 'Already at root level')
        return
      }

      if (!confirm(`Move ${this.selectedItems.length} items to parent folder?`)) return

      try {
        const parentId = this.currentFolder.parent_id || null
        
        for (const itemId of this.selectedItems) {
          await axios.put(`/api/files/${itemId}/move`, {
            destination_id: parentId
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        }
        
        this.showToast('success', `${this.selectedItems.length} items moved to parent folder`)
        this.selectedItems = []
        this.fetchItems()
      } catch (error) {
        console.error('Error bulk moving out:', error)
        this.showToast('error', 'Failed to move items')
      }
    },

    // Bulk Move
    async bulkMove() {
      if (!this.selectedItems.length) {
        this.showToast('warning', 'No items selected')
        return
      }

      this.moveItemData = { name: `${this.selectedItems.length} items`, type: 'bulk' }
      this.moveDestination = null
      this.showMoveModal = true
    },

    async moveItem(item) {
      this.moveItemData = item
      this.moveDestination = null
      this.showMoveModal = true
    },

    async confirmMove() {
      const destinationId = this.moveDestination

      try {
        if (this.moveItemData.type === 'bulk') {
          for (const itemId of this.selectedItems) {
            await axios.put(`/api/files/${itemId}/move`, {
              destination_id: destinationId
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
          }
          this.showToast('success', `${this.selectedItems.length} items moved successfully`)
          this.selectedItems = []
        } else {
          await axios.put(`/api/files/${this.moveItemData.id}/move`, {
            destination_id: destinationId
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          this.showToast('success', `"${this.moveItemData.name}" moved successfully`)
        }
        
        this.showMoveModal = false
        this.moveItemData = null
        this.moveDestination = null
        this.fetchItems()
      } catch (error) {
        console.error('Error moving item:', error)
        this.showToast('error', 'Failed to move item')
      }
    },

    selectMoveDestination(folderId) {
      this.moveDestination = folderId
    },

    async copyItem(item) {
      try {
        await axios.post(`/api/files/${item.id}/copy`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.showToast('success', `"${item.name}" copied successfully`)
        this.fetchItems()
      } catch (error) {
        console.error('Error copying item:', error)
        this.showToast('error', 'Failed to copy item')
      }
    },

    // ==================== FILE OPENING IN NEW TAB ====================
    
    // Open file in new tab
   // Open file in new tab - Using direct server URL
openFileInNewTab(item) {
  if (item.type === 'folder') {
    this.currentFolder = item
    this.breadcrumbPath.push(item)
    this.fetchItems()
    return
  }
  
  // The direct URL to your file on the server
  // Using the path you provided: https://employees.archenterprises.co.in/backend/storage/app/public/files/
  const filePath = item.path || `files/${item.id}`
  const directUrl = `https://employees.archenterprises.co.in/backend/storage/app/public/${filePath}`
  
  // For PDF files, open directly in new tab
  if (item.name.toLowerCase().endsWith('.pdf')) {
    window.open(directUrl, '_blank')
    return
  }
  
  // For images, open directly
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico']
  if (imageExts.some(ext => item.name.toLowerCase().endsWith(ext))) {
    window.open(directUrl, '_blank')
    return
  }
  
  // For other files, open in new tab
  window.open(directUrl, '_blank')
},
    
    // Helper to get content type from file extension
    getContentType(filename) {
      const ext = filename.split('.').pop().toLowerCase()
      const types = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'xml': 'application/xml',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      }
      return types[ext] || 'application/octet-stream'
    },

    // Open item - double click handler
    openItem(item) {
      if (item.type === 'folder') {
        this.currentFolder = item
        this.breadcrumbPath.push(item)
        this.fetchItems()
      } else {
        // Open file in new tab
        this.openFileInNewTab(item)
      }
    },

    editItem(item) {
      if (item.type === 'folder') {
        const newName = prompt('Enter new folder name:', item.name)
        if (newName && newName.trim() !== item.name) {
          this.renameItem(item, newName.trim())
        }
      } else {
        // For files, open in new tab
        this.openFileInNewTab(item)
      }
    },

    async renameItem(item, newName) {
      try {
        await axios.put(`/api/files/${item.id}`, {
          name: newName
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.showToast('success', `Renamed to "${newName}"`)
        this.fetchItems()
      } catch (error) {
        console.error('Error renaming item:', error)
        this.showToast('error', 'Failed to rename item')
      }
    },

    // File upload
    triggerFileUpload() {
      this.$refs.fileInput.click()
    },

    async handleFileUpload(event) {
      const files = event.target.files
      await this.uploadFiles(files)
      event.target.value = ''
    },

    async handleDrop(event) {
      const files = event.dataTransfer.files
      await this.uploadFiles(files)
    },

    async handleFileSelect(event) {
      const files = event.target.files
      if (files.length > 0) {
        const file = files[0]
        this.newFileName = file.name
        const reader = new FileReader()
        reader.onload = (e) => {
          this.fileContent = e.target.result
        }
        reader.readAsText(file)
      }
    },

    async uploadFiles(files) {
      const formData = new FormData()
      for (let file of files) {
        formData.append('files[]', file)
      }
      formData.append('folder_id', this.currentFolder?.id || '')

      try {
        await axios.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        this.showToast('success', `${files.length} file(s) uploaded successfully`)
        this.fetchItems()
      } catch (error) {
        console.error('Error uploading files:', error)
        this.showToast('error', 'Failed to upload files')
      }
    },

    // Download file (as fallback)
    async downloadItem(item) {
      try {
        const response = await axios.get(`/api/files/${item.id}/download`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', item.name)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading file:', error)
        this.showToast('error', 'Failed to download file')
      }
    },

    // ==================== CLIPBOARD ====================
    
    isInClipboard(itemId) {
      return this.clipboardItems.includes(itemId)
    },

    async copyToClipboard(items) {
      const itemIds = items.map(item => item.id)
      this.clipboardItems = itemIds
      this.clipboardAction = 'copy'
      this.clipboardSource = this.currentFolder?.id || null
      this.showToast('success', `${items.length} item(s) copied to clipboard`)
      this.closeContextMenu()
    },

    async cutToClipboard(items) {
      const itemIds = items.map(item => item.id)
      this.clipboardItems = itemIds
      this.clipboardAction = 'cut'
      this.clipboardSource = this.currentFolder?.id || null
      this.showToast('success', `${items.length} item(s) cut to clipboard`)
      this.closeContextMenu()
    },

    async pasteFromClipboard(destinationId) {
      if (this.clipboardItems.length === 0) {
        this.showToast('warning', 'Clipboard is empty')
        return
      }

      let targetId = destinationId
      if (targetId === undefined || targetId === null) {
        targetId = this.currentFolder?.id || null
      }

      try {
        if (this.clipboardAction === 'copy') {
          for (const itemId of this.clipboardItems) {
            const copyResponse = await axios.post(`/api/files/${itemId}/copy`, {}, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            
            if (targetId !== null) {
              await axios.put(`/api/files/${copyResponse.data.copy.id}/move`, {
                destination_id: targetId
              }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              })
            }
          }
          
          const destinationName = targetId ? 
            this.folders.find(f => f.id === targetId)?.name || 'folder' : 
            'Root'
          this.showToast('success', `${this.clipboardItems.length} item(s) pasted to "${destinationName}"`)
          
        } else if (this.clipboardAction === 'cut') {
          for (const itemId of this.clipboardItems) {
            await axios.put(`/api/files/${itemId}/move`, {
              destination_id: targetId
            }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
          }
          
          const destinationName = targetId ? 
            this.folders.find(f => f.id === targetId)?.name || 'folder' : 
            'Root'
          this.showToast('success', `${this.clipboardItems.length} item(s) moved to "${destinationName}"`)
          
          this.clearClipboard()
        }
        
        this.closeContextMenu()
        this.fetchItems()
      } catch (error) {
        console.error('Error pasting items:', error)
        this.showToast('error', 'Failed to paste items')
      }
    },

    clearClipboard() {
      this.clipboardItems = []
      this.clipboardAction = 'copy'
      this.clipboardSource = null
    },

    // ==================== CONTEXT MENU ====================

    handleRightClick(event, item) {
      event.preventDefault()
      event.stopPropagation()
      
      if (!this.selectedItems.includes(item.id)) {
        this.selectedItems = [item.id]
      }
      
      const isFolder = item.type === 'folder'
      
      this.contextMenu.visible = true
      this.contextMenu.x = event.clientX
      this.contextMenu.y = event.clientY
      this.contextMenu.item = item
      this.contextMenu.isFolder = isFolder
      this.contextMenu.pasteTarget = isFolder ? item.id : (this.currentFolder?.id || null)
    },

    handleGlobalContextMenu(event) {
      const target = event.target
      if (!target.closest('.grid-item') && !target.closest('.file-table tr') && 
          !target.closest('.breadcrumb') && !target.closest('.action-bar')) {
        
        this.closeContextMenu()
        
        this.contextMenu.visible = true
        this.contextMenu.x = event.clientX
        this.contextMenu.y = event.clientY
        this.contextMenu.item = null
        this.contextMenu.isFolder = false
        this.contextMenu.pasteTarget = this.currentFolder?.id || null
        this.selectedItems = []
      }
    },

    async handleContextMenuAction(action) {
      const item = this.contextMenu.item
      const selectedItems = this.selectedItems.length > 0 ? 
        this.filteredItems.filter(i => this.selectedItems.includes(i.id)) : 
        (item ? [item] : [])

      switch(action) {
        case 'copy':
          if (selectedItems.length > 0) {
            this.copyToClipboard(selectedItems)
          }
          break
        case 'cut':
          if (selectedItems.length > 0) {
            this.cutToClipboard(selectedItems)
          }
          break
        case 'paste':
          await this.pasteFromClipboard(this.contextMenu.pasteTarget)
          break
        case 'rename':
          if (item) {
            this.editItem(item)
            this.closeContextMenu()
          }
          break
        case 'delete':
          if (selectedItems.length > 0) {
            if (selectedItems.length === 1) {
              this.deleteItem(selectedItems[0])
            } else {
              this.bulkDelete()
            }
            this.closeContextMenu()
          }
          break
        case 'download':
          if (item && item.type === 'file') {
            this.downloadItem(item)
            this.closeContextMenu()
          }
          break
        case 'open':
          if (item) {
            this.openItem(item)
            this.closeContextMenu()
          }
          break
        case 'open_in_new_tab':
          if (item && item.type === 'file') {
            this.openFileInNewTab(item)
            this.closeContextMenu()
          }
          break
        case 'paste_here':
          if (item && item.type === 'folder') {
            await this.pasteFromClipboard(item.id)
          }
          break
      }
    },

    closeContextMenu() {
      this.contextMenu.visible = false
      this.contextMenu.item = null
    },

    // ==================== UI HELPERS ====================
    
    getItemIcon(item) {
      if (item.type === 'folder') return 'fas fa-folder'
      
      const ext = item.name.split('.').pop().toLowerCase()
      const icons = {
        'js': 'fab fa-js',
        'ts': 'fab fa-js',
        'html': 'fab fa-html5',
        'css': 'fab fa-css3-alt',
        'json': 'fas fa-code',
        'xml': 'fas fa-code',
        'txt': 'fas fa-file-alt',
        'md': 'fas fa-file-alt',
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'svg': 'fas fa-file-image',
        'mp3': 'fas fa-file-audio',
        'wav': 'fas fa-file-audio',
        'mp4': 'fas fa-file-video',
        'avi': 'fas fa-file-video',
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive',
        '7z': 'fas fa-file-archive',
        'exe': 'fas fa-file-code',
        'msi': 'fas fa-file-code'
      }
      return icons[ext] || 'fas fa-file'
    },

    formatSize(bytes) {
      if (!bytes) return '—'
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
    },

    formatDate(date) {
      if (!date) return '—'
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    filterByType(type) {
      this.typeFilter = this.typeFilter === type ? 'all' : type
    },

    toggleView() {
      this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid'
    },

    handleItemClick(item, event) {
      if (event.ctrlKey || event.metaKey) {
        const index = this.selectedItems.indexOf(item.id)
        if (index > -1) {
          this.selectedItems.splice(index, 1)
        } else {
          this.selectedItems.push(item.id)
        }
      } else if (!event.target.closest('.grid-item-actions') && !event.target.closest('.action-buttons')) {
        if (!event.target.closest('input[type="checkbox"]')) {
          this.selectedItems = [item.id]
        }
      }
    },

    selectAll() {
      if (this.selectAllChecked) {
        this.selectedItems = this.filteredItems.map(item => item.id)
      } else {
        this.selectedItems = []
      }
    },

    closeFileModal() {
      this.showCreateFile = false
      this.editingFile = null
      this.newFileName = ''
      this.fileContent = ''
    },

    // Toast notifications
    showToast(type, message) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle'
      }
      this.toasts.push({
        id: this.toastId++,
        type,
        icon: icons[type] || 'fas fa-info-circle',
        message
      })
      setTimeout(() => {
        this.toasts.shift()
      }, 3000)
    },

    // Responsive
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768
      this.isSidebarVisible = !this.isMobile
    },

    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible
    }
  },

  mounted() {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
    
    document.addEventListener('click', this.closeContextMenu)
    document.addEventListener('keydown', this.handleKeyboardShortcuts)
    
    this.fetchItems()
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/auth')
    }
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
    document.removeEventListener('click', this.closeContextMenu)
    document.removeEventListener('keydown', this.handleKeyboardShortcuts)
  }
}
</script>

<style scoped>
/* ... All existing styles remain the same ... */
/* (Include all the CSS from previous version) */

/* Additional styles for the new tab viewer */
.file-preview-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.file-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.file-preview-header h2 {
  margin: 0;
  color: #1a1a2e;
}

.file-preview-header .file-type-badge {
  padding: 4px 12px;
  background: #e0e7ff;
  border-radius: 20px;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 600;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Remove the old preview modal styles since we're using new tabs */
.preview-modal {
  display: none;
}

@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --dark: #1a1a2e;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  --bg: #f8fafc;
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

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.content {
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

.mobile-stats-badge {
  background: var(--primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
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
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.content-header-modern h1 {
  font-size: 20px;
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

/* Breadcrumb */
.breadcrumb-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg);
  border-radius: 12px;
  margin-bottom: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.breadcrumb-item {
  cursor: pointer;
  color: var(--primary-color);
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.breadcrumb-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.breadcrumb-separator {
  color: #9ca3af;
}

.breadcrumb-actions {
  display: flex;
  gap: 8px;
}

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.action-group-left {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-group-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-action {
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-action.primary {
  color: rgb(0, 0, 0);
}

.btn-action.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-action.secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-action.secondary:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}

.btn-action.danger {
  background: var(--danger);
  color: white;
}

.btn-action.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-icon {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-wrapper i {
  position: absolute;
  left: 12px;
  color: #9ca3af;
}

.search-input {
  padding: 8px 12px 8px 36px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  width: 200px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  width: 280px;
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card i {
  font-size: 24px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--dark);
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
}

/* Grid View */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.grid-item {
  position: relative;
  padding: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.grid-item.selected {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.05);
}

.grid-item-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
}

.grid-item-icon {
  text-align: center;
  font-size: 48px;
  color: var(--primary-color);
  padding: 8px 0;
}

.grid-item-name {
  text-align: center;
  font-weight: 500;
  font-size: 13px;
  margin: 4px 0;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.grid-item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.grid-item-actions {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.grid-item:hover .grid-item-actions {
  opacity: 1;
}

/* List View */
.list-view {
  overflow-x: auto;
  margin-bottom: 20px;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
}

.file-table thead {
  background: var(--bg);
}

.file-table th {
  text-align: left;
  padding: 12px;
  font-weight: 600;
  font-size: 12px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.file-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.file-table tr {
  cursor: pointer;
  transition: background 0.2s ease;
}

.file-table tr:hover {
  background: #fafbfc;
}

.file-table tr.selected {
  background: rgba(102, 126, 234, 0.05);
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name-cell i {
  font-size: 18px;
  color: var(--primary-color);
  width: 24px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-action-icon {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-action-icon:hover {
  background: #f3f4f6;
  color: var(--dark);
}

.btn-action-icon.danger:hover {
  background: #fee2e2;
  color: var(--danger);
}

.type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: #e5e7eb;
  color: #6b7280;
}

/* Bulk Actions */
.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-top: 16px;
}

.bulk-actions-group {
  display: flex;
  gap: 8px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

.modal.large {
  max-width: 700px;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--dark);
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-header h3 i {
  color: var(--primary-color);
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 24px;
  overflow-wrap: break-word;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

/* Form Groups */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.code-editor {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  background: #1a1a2e;
  color: #e5e7eb;
  padding: 16px;
  border-radius: 10px;
  min-height: 200px;
}

/* Drop Zone */
.drop-zone {
  position: relative;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.drop-zone:hover {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.05);
}

.drop-zone i {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.drop-zone p {
  color: #6b7280;
  font-size: 14px;
}

.drop-zone-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Folder Tree */
.folder-tree {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 12px;
}

.folder-tree-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.folder-tree-item:hover {
  background: #f3f4f6;
}

.folder-tree-item.selected {
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
}

.folder-tree-item i {
  color: var(--primary-color);
}

/* Buttons */
.btn-primary {
  padding: 10px 24px;
  background: var(--primary);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  padding: 10px 24px;
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Toast */
.toast-container {
  position: fixed;
  top: 73px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2000;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 12px;
  color: rgb(0, 0, 0);
  font-weight: 500;
  animation: slideInRight 0.3s ease;
  min-width: 280px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background: rgb(169, 230, 169);
}

.toast.error {
  background: var(--danger);
}

.toast.warning {
  background: var(--warning);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ==================== CONTEXT MENU ==================== */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 220px;
  padding: 8px 0;
  z-index: 9999;
  animation: contextMenuFadeIn 0.15s ease;
  border: 1px solid #e5e7eb;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  color: #1a1a2e;
  font-size: 14px;
  transition: all 0.15s ease;
  position: relative;
}

.context-menu-item:hover:not(.disabled) {
  background: #f3f4f6;
}

.context-menu-item i {
  width: 20px;
  color: #6b7280;
}

.context-menu-item .shortcut {
  margin-left: auto;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 400;
}

.context-menu-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.context-menu-item.disabled:hover {
  background: transparent;
}

.context-menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}

.context-menu-item.highlight {
  background: #e0e7ff;
  color: #4f46e5;
  font-weight: 600;
}

.context-menu-item.highlight i {
  color: #4f46e5;
}

.context-menu-item.highlight:hover {
  background: #c7d2fe;
}

/* ==================== CLIPBOARD ==================== */
.clipboard-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: #e0e7ff;
  border-radius: 20px;
  font-size: 12px;
  color: #4f46e5;
  font-weight: 500;
}

.btn-clear-clipboard {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
  padding: 0 4px;
  transition: color 0.2s ease;
}

.btn-clear-clipboard:hover {
  color: #ef4444;
}

.clipboard-item {
  opacity: 0.6;
  border-color: #818cf8 !important;
  background: rgba(99, 102, 241, 0.05) !important;
}

.clipboard-item::after {
  content: '📋';
  position: absolute;
  top: 4px;
  right: 30px;
  font-size: 14px;
}

.fa-folder, .fa-folder-plus, .fa-folder-open {
  color: orange !important;
}

.fa-file {
  color: #5c5c5c !important;
}

.fa-folder-plus {
  font-size: 15px !important;
}

/* Folder Divider */
.folder-divider {
  padding: 10px 14px;
  font-weight: 600;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 12px;
  font-size: 13px;
}

/* ==================== FILE PREVIEW MODAL ==================== */
.preview-modal .modal {
  max-width: 90vw;
  max-height: 90vh;
}

.preview-modal .modal-body {
  padding: 0;
  background: #f8fafc;
  min-height: 400px;
  max-height: 70vh;
  overflow: hidden;
}

.preview-body {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.file-size-badge {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  margin-left: 8px;
  background: #f3f4f6;
  padding: 2px 10px;
  border-radius: 12px;
}

/* PDF Preview */
.pdf-preview {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.pdf-iframe {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  border: none;
  border-radius: 8px;
}

/* Image Preview */
.image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 65vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Video Preview */
.video-preview {
  width: 100%;
  padding: 20px;
}

.preview-video {
  width: 100%;
  max-height: 65vh;
  border-radius: 8px;
  background: #1a1a2e;
}

/* Audio Preview */
.audio-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 200px;
  padding: 40px;
}

.preview-audio {
  width: 100%;
  max-width: 600px;
}

/* Text Preview */
.text-preview {
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 20px;
  overflow: auto;
}

.text-content {
  background: #1a1a2e;
  color: #e5e7eb;
  padding: 20px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 65vh;
  overflow: auto;
}

.text-content pre {
  margin: 0;
  padding: 0;
}

/* Office Preview */
.office-preview {
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.office-iframe {
  width: 100%;
  height: 60vh;
  min-height: 400px;
  border: none;
  border-radius: 8px;
}

.office-download-note {
  padding: 12px 20px;
  background: #fef3c7;
  color: #92400e;
  font-size: 13px;
  text-align: center;
  border-top: 1px solid #fcd34d;
}

.office-download-note a {
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;
}

.office-download-note a:hover {
  text-decoration: underline;
}

/* Unsupported Preview */
.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
  text-align: center;
}

.unsupported-preview i {
  color: #9ca3af;
  margin-bottom: 16px;
}

.unsupported-preview h4 {
  font-size: 18px;
  color: #374151;
  margin-bottom: 8px;
}

.unsupported-preview p {
  margin-bottom: 20px;
}

/* Preview Actions */
.preview-actions {
  display: flex;
  gap: 8px;
}

/* Responsive preview */
@media (max-width: 768px) {
  .preview-modal .modal {
    max-width: 100vw;
    max-height: 100vh;
    margin: 0;
    border-radius: 0;
  }
  
  .preview-modal .modal-body {
    min-height: 300px;
    max-height: 60vh;
  }
  
  .pdf-iframe {
    height: 60vh;
    min-height: 300px;
  }
  
  .office-iframe {
    height: 50vh;
    min-height: 300px;
  }
  
  .preview-image {
    max-height: 50vh;
  }
  
  .text-content {
    max-height: 50vh;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .preview-modal .modal-body {
    min-height: 200px;
    max-height: 50vh;
  }
  
  .pdf-iframe {
    height: 50vh;
    min-height: 200px;
  }
  
  .office-iframe {
    height: 40vh;
    min-height: 200px;
  }
  
  .preview-image {
    max-height: 40vh;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }

  .content {
    padding: 16px;
    border-radius: 20px;
  }

  .mobile-header {
    display: flex;
  }

  .content-header-modern {
    display: none;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-group-left {
    flex-wrap: wrap;
  }

  .action-group-left .btn-action {
    flex: 1;
    justify-content: center;
    font-size: 12px;
  }

  .action-group-right {
    flex-wrap: wrap;
  }

  .search-wrapper {
    flex: 1;
  }

  .search-input {
    width: 100%;
  }

  .search-input:focus {
    width: 100%;
  }

  .stats-bar {
    grid-template-columns: repeat(3, 1fr);
  }

  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .grid-item-icon {
    font-size: 36px;
  }

  .grid-item-name {
    font-size: 12px;
  }

  .grid-item-actions {
    opacity: 1;
  }

  .modal {
    margin: 12px;
  }

  .modal.large {
    max-width: 100%;
  }

  .bulk-actions {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .bulk-actions-group {
    justify-content: stretch;
  }

  .bulk-actions-group .btn-action {
    flex: 1;
    justify-content: center;
  }

  .breadcrumb-bar {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .breadcrumb-actions {
    align-self: flex-end;
  }

  .action-buttons .btn-action-icon {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
  }

  .content {
    padding: 12px;
    border-radius: 16px;
  }

  .stats-bar {
    grid-template-columns: 1fr 1fr;
  }

  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .grid-item {
    padding: 12px;
  }

  .grid-item-icon {
    font-size: 28px;
  }

  .grid-item-name {
    font-size: 11px;
  }

  .grid-item-meta {
    font-size: 9px;
  }

  .file-table th,
  .file-table td {
    padding: 8px;
    font-size: 11px;
  }

  .file-name-cell i {
    font-size: 14px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 12px 16px;
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
    justify-content: center;
  }

  .action-group-left .btn-action {
    font-size: 11px;
    padding: 6px 12px;
  }

  .btn-action span {
    display: none;
  }

  .drop-zone {
    padding: 24px;
  }

  .drop-zone i {
    font-size: 32px;
  }

  .toast {
    min-width: 200px;
    font-size: 13px;
    padding: 10px 16px;
  }
}
</style>