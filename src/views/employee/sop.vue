<template>
  <div class="layout">
    <!-- Main Content -->
    <div class="main-content">
      <Sidebar v-if="!isMobile || isSidebarVisible" />

      <div class="sop-board-premium" v-if="!isMobile || !isSidebarVisible">
        <div class="content-header-modern">
          <div class="header-left">
            <div class="title-icon">
              <i class="fas fa-book-open"></i>
            </div>
            <div>
              <h1>Company SOPs</h1>
              <p class="subtitle-modern">Standard Operating Procedures & Policy Documents</p>
            </div>
          </div>
          <div class="stats-badge-header">
            <i class="fas fa-file-pdf"></i>
            <span>{{ sops.length }} SOPs Available</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-card">
            <i class="fas fa-file-pdf"></i>
            <div class="stat-info">
              <span class="stat-value">{{ sops.length }}</span>
              <span class="stat-label">Total SOPs</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{ recentUploads }}</span>
              <span class="stat-label">Recent Uploads</span>
            </div>
          </div>
          <div class="stat-card" @click="showUploadModal = true">
            <i class="fas fa-plus-circle"></i>
            <div class="stat-info">
              <span class="stat-value action-stat">+ Add New</span>
              <span class="stat-label">Upload SOP (PDF)</span>
            </div>
          </div>
        </div>

        <!-- SOPs Grid / List -->
        <div class="sops-section">
          <div class="section-title-modern">
            <i class="fas fa-folder-open"></i>
            <span>All Standard Operating Procedures</span>
            <button class="btn-add-small" @click="showUploadModal = true">
              <i class="fas fa-plus"></i> Add SOP
            </button>
          </div>

          <div v-if="sops.length" class="sops-grid-premium">
            <div v-for="(sop, index) in sops" :key="sop.id || index" class="sop-card-premium">
              <div class="card-accent"></div>
              <div class="sop-header">
                <div class="sop-icon">
                  <i class="fas fa-file-pdf"></i>
                </div>
                <div class="sop-title-wrap">
                  <h3>{{ sop.title }}</h3>
                  <div class="sop-meta">
                    <span><i class="fas fa-calendar-alt"></i> {{ formatDate(sop.uploadDate) }}</span>
                    <span><i class="fas fa-database"></i> {{ formatFileSize(sop.fileSize) }}</span>
                  </div>
                </div>
                <div class="sop-actions">
                  <button class="action-btn view-btn" @click="viewSop(sop)" title="View PDF">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn download-btn" @click="downloadSop(sop)" title="Download">
                    <i class="fas fa-download"></i>
                  </button>
                  <button class="action-btn delete-btn" @click="confirmDelete(sop)" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="sop-description" v-if="sop.description">
                <i class="fas fa-align-left"></i>
                <span>{{ sop.description }}</span>
              </div>
              <div class="sop-footer">
                <div class="badge-department" v-if="sop.department">
                  <i class="fas fa-building"></i> {{ sop.department }}
                </div>
                <div class="badge-version" v-if="sop.version">
                  <i class="fas fa-code-branch"></i> v{{ sop.version }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state-premium">
            <i class="fas fa-file-pdf"></i>
            <h4>No SOPs Uploaded Yet</h4>
            <p>Click the "Add SOP" button to upload company policies and procedures (PDF format)</p>
            <button class="btn-primary-empty" @click="showUploadModal = true">
              <i class="fas fa-cloud-upload-alt" style="height: 12px;"></i> Upload First SOP
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container-premium">
        <div class="modal-header">
          <div class="modal-icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <h2>Upload SOP Document</h2>
          <button class="close-modal" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSopUpload">
            <div class="form-group">
              <label><i class="fas fa-heading"></i> SOP Title *</label>
              <input type="text" v-model="newSop.title" placeholder="e.g., Employee Onboarding Procedure" required>
            </div>
            <div class="form-group">
              <label><i class="fas fa-align-left"></i> Description (optional)</label>
              <textarea v-model="newSop.description" rows="3" placeholder="Brief summary of this SOP..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label><i class="fas fa-building"></i> Department</label>
                <input type="text" v-model="newSop.department" placeholder="e.g., HR, IT, Operations">
              </div>
              <!-- <div class="form-group half">
                <label><i class="fas fa-code-branch"></i> Version</label>
                <input type="text" v-model="newSop.version" placeholder="e.g., 1.0, 2.1">
              </div> -->
            </div>
            <div class="form-group">
              <label><i class="fas fa-file-pdf"></i> PDF File * (max 15MB)</label>
              <div class="file-dropzone" :class="{ 'drag-over': dragActive }" @dragover.prevent="dragActive = true" @dragleave.prevent="dragActive = false" @drop.prevent="handleFileDrop">
                <input type="file" ref="fileInput" @change="handleFileSelect" accept=".pdf" style="display: none">
                <i class="fas fa-cloud-upload-alt fa-2x"></i>
                <p v-if="!selectedFile">Drag & drop PDF here or <span class="browse-link" @click="triggerFileInput">browse</span></p>
                <p v-else class="file-selected"><i class="fas fa-check-circle"></i> {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</p>
              </div>
              <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="uploading">
                <i v-if="uploading" class="fas fa-spinner fa-pulse"></i>
                <i v-else class="fas fa-upload"></i>
                {{ uploading ? 'Uploading...' : 'Upload SOP' }}
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
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "@/utils/toast.js";

export default {
  name: "CompanySOP",
  components: {
    Sidebar
  },
  data() {
    return {
        sopsFileBaseUrl: 'https://employees.archenterprises.co.in/backend/storage/app/public/sops/',
      isMobile: false,
      isSidebarVisible: true,
      sops: [],
      showUploadModal: false,
      newSop: {
        title: '',
        description: '',
        department: '',
        version: ''
      },
      selectedFile: null,
      dragActive: false,
      uploading: false,
      uploadError: '',
      apiBaseUrl: 'https://employees.archenterprises.co.in' // Your API base URL
    }
  },
  computed: {
    recentUploads() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return this.sops.filter(sop => new Date(sop.uploadDate) >= sevenDaysAgo).length;
    }
  },
  mounted() {
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile);
    this.loadSops()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile);
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth <= 768;
      this.isSidebarVisible = !this.isMobile;
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    
    async loadSops() {
      try {
        const res = await fetch(`${this.apiBaseUrl}/api/api/sops`)
        const data = await res.json()
        
        // Debug: Log the API response to see the structure
        console.log("API Response:", data)
        console.log("SOPs data:", data.data)
        
        this.sops = data.data || []
        
        // Debug: Log each SOP to check for file path properties
        this.sops.forEach((sop, index) => {
          console.log(`SOP ${index + 1}:`, {
            id: sop.id,
            title: sop.title,
            // Log all possible file path fields
            filePath: sop.filePath,
            file_path: sop.file_path,
            fileUrl: sop.fileUrl,
            file_url: sop.file_url,
            pdfPath: sop.pdfPath,
            pdf_path: sop.pdf_path,
            documentPath: sop.documentPath,
            document_path: sop.document_path,
            path: sop.path,
            url: sop.url,
            // Log the entire object to see all properties
            fullObject: sop
          })
        })
      } catch(error){
        console.error("Error loading SOPs:", error)
        toastError("Failed to load SOPs")
      }
    },
    
    // Helper method to get the file URL from SOP object
  getFileUrl(sop) {
  // Try to get the filename from different possible property names
  let fileName = sop.file_name || 
                 sop.filename || 
                 sop.filePath || 
                 sop.file_path || 
                 sop.file;
  
  if (!fileName) {
    // If there's a full path, extract just the filename
    let fullPath = sop.fileUrl || sop.url || sop.path;
    if (fullPath) {
      fileName = fullPath.split('/').pop();
    }
  }
  
  if (!fileName) {
    console.error("No file name found in SOP:", sop);
    return null;
  }
  
  // Construct the full URL using your base path
  return `${this.sopsFileBaseUrl}${fileName}`;
},

    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    
    formatFileSize(bytes) {
      if (!bytes) return '0 KB';
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / 1048576).toFixed(1) + ' MB';
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0];
      this.processFile(file);
    },
    
    handleFileDrop(event) {
      this.dragActive = false;
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    },
    
    processFile(file) {
      this.uploadError = '';
      if (!file) return;
      if (file.type !== 'application/pdf') {
        this.uploadError = 'Only PDF files are allowed.';
        this.selectedFile = null;
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        this.uploadError = 'File size must be less than 15MB.';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    },
    
    async handleSopUpload() {
      if (!this.selectedFile) {
        toastError("Please select a PDF file")
        return
      }
      
      const formData = new FormData()
      formData.append("title", this.newSop.title)
      formData.append("description", this.newSop.description)
      formData.append("department", this.newSop.department)
      formData.append("version", this.newSop.version)
      formData.append("file", this.selectedFile)

      try {
        const res = await fetch(`${this.apiBaseUrl}/api/api/sops`, {
          method: "POST",
          body: formData
        })
        const data = await res.json()
        
        console.log("Upload response:", data)
        
        if(data.status){
          await this.loadSops() // Reload to get updated list with file paths
          this.closeModal()
          toastSuccess("SOP Uploaded Successfully")
        } else {
          toastError(data.message || "Upload failed")
        }
      } catch(error){
        console.error("Upload error:", error)
        toastError("Upload failed")
      }
    },
    
  viewSop(sop) {
  console.log("Viewing SOP:", sop);
  
  const fileUrl = this.getFileUrl(sop);
  
  if (fileUrl) {
    console.log("Opening PDF URL:", fileUrl);
    window.open(fileUrl, '_blank');
    toastSuccess(`Opening: ${sop.title}`);
  } else {
    console.error("Could not construct file URL from SOP:", sop);
    toastError('PDF file URL not available. File name not found in the SOP data.');
  }
},

  downloadSop(sop) {
  const fileUrl = this.getFileUrl(sop);
  
  if (fileUrl) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = sop.file_name || sop.filename || `${sop.title.replace(/\s/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess(`Downloading: ${sop.title}`);
  } else {
    toastError('File not available for download');
  }
},

    
async confirmDelete(sop) {
  if (confirm(`Are you sure you want to delete "${sop.title}"? This action cannot be undone.`)) {
    try {
      // Call your backend API to delete the SOP
      const response = await fetch(`${this.apiBaseUrl}/api/api/sops/${sop.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${yourToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.status) {
        // Remove from local array only after successful backend deletion
        this.sops = this.sops.filter(s => s.id !== sop.id);
        toastSuccess('SOP deleted successfully');
      } else {
        toastError(data.message || 'Failed to delete SOP');
      }
    } catch(error) {
      console.error("Delete error:", error);
      toastError('Failed to delete SOP. Please try again.');
    }
  }
},
    
    closeModal() {
      this.showUploadModal = false;
      this.uploadError = '';
      this.selectedFile = null;
      this.newSop = { title: '', description: '', department: '', version: '' };
      this.dragActive = false;
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
    }
  }
}
</script>

<style scoped>
/* Keep all your existing styles exactly as they were */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

/* Variables */
:root {
  --primary: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  --primary-color: #2a5298;
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
  background: #f4f7fc;
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.sop-board-premium {
  flex: 1;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

/* Header */
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

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
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
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
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

/* Section Title */
.section-title-modern {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
  justify-content: space-between;
}

.btn-add-small {
  background: var(--primary);
  border: none;
  padding: 6px 14px;
  border-radius: 30px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add-small:hover {
  opacity: 0.9;
  transform: scale(0.97);
}

/* SOPs Grid */
.sops-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.sop-card-premium {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.sop-card-premium:hover {
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

.sop-header {
  display: flex;
  padding: 18px;
  gap: 14px;
  align-items: flex-start;
  background: #fafbfc;
  border-bottom: 1px solid #eef2f6;
}

.sop-icon {
  width: 48px;
  height: 48px;
  background: #fee2e2;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  font-size: 24px;
}

.sop-title-wrap {
  flex: 1;
}

.sop-title-wrap h3 {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.sop-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #6c757d;
}

.sop-meta i {
  margin-right: 4px;
}

.sop-actions {
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

.view-btn { color: #3b82f6; }
.view-btn:hover { background: #e0e7ff; }
.download-btn { color: #10b981; }
.download-btn:hover { background: #d1fae5; }
.delete-btn { color: #ef4444; }
.delete-btn:hover { background: #fee2e2; }

.sop-description {
  padding: 14px 18px;
  font-size: 13px;
  color: #4b5563;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.sop-footer {
  padding: 12px 18px;
  display: flex;
  gap: 12px;
  background: #f9fafb;
}

.badge-department, .badge-version {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 30px;
  background: #eef2ff;
  color: #1e40af;
}

.badge-version {
  background: #f3e8ff;
  color: #6b21a5;
}

/* Empty State */
.empty-state-premium {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 28px;
}

.empty-state-premium i {
  font-size: 64px;
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

/* Modals */
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
  max-width: 600px;
  border-radius: 32px;
  overflow: hidden;
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

.form-group input, .form-group textarea {
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

.file-dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  background: #fafcff;
  transition: 0.2s;
  cursor: pointer;
}

.drag-over {
  border-color: var(--primary-color);
  background: #eff6ff;
}

.browse-link {
  color: blue;
  font-weight: 600;
  cursor: pointer;
}

.file-selected {
  color: #10b981;
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  margin-top: 8px;
}

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
  .sop-board-premium { padding: 16px; }
  .sops-grid-premium { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; gap: 0; }
}
</style>