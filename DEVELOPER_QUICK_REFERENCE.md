# Developer Quick Reference - Modern Popups

## TL;DR

All popups in `CustomerRegistrations.vue` now use the modern CSS framework from `src/styles/modern-popups.css`. No JavaScript changes needed—just use the CSS classes.

---

## 🚀 Quick Start

### **To Create a New Popup:**

```vue
<div v-if="showMyModal" class="modal-backdrop">
  <div class="modal-card medium">
    <!-- Header -->
    <div class="modal-header">
      <div class="modal-title-wrapper">
        <div class="modal-icon-badge">
          <i class="fas fa-your-icon"></i>
        </div>
        <div>
          <h2 class="modal-title">Your Modal Title</h2>
          <p class="modal-subtitle">Optional subtitle</p>
        </div>
      </div>
      <button class="quotation-btn-close" @click="showMyModal = false">×</button>
    </div>

    <!-- Body -->
    <div class="modal-body">
      <!-- Your content here -->
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <div class="modal-buttons">
        <button class="btn btn-secondary" @click="showMyModal = false">Cancel</button>
        <button class="btn btn-primary" @click="saveData">Save</button>
      </div>
    </div>
  </div>
</div>
```

---

## 📐 Modal Sizes

```vue
<!-- Small: 400px -->
<div class="modal-card small">

<!-- Medium: 600px (most common) -->
<div class="modal-card medium">

<!-- Large: 900px -->
<div class="modal-card large">
```

---

## 🎨 Common CSS Classes

### **Layout Classes**
```css
/* Modal structure */
.modal-backdrop          /* Overlay + centering */
.modal-card              /* Main card container */
.modal-header            /* Header section */
.modal-body              /* Content section */
.modal-footer            /* Action section */

/* Inside header */
.modal-title-wrapper     /* Title + icon layout */
.modal-icon-badge        /* Icon container */
.modal-title             /* Main heading */
.modal-subtitle          /* Subheading */

/* Inside footer */
.modal-buttons           /* Button container */
.quotation-btn-close     /* Close button (×) */
```

### **Content Classes**
```css
.form-row                /* Form row container */
.input-group             /* Input with label */
.input-group.full-width  /* Full-width input */
.filter-bar              /* Filter controls area */
.styled-table            /* Professional table styling */
```

### **Button Classes**
```css
.btn                     /* Base button */
.btn-primary             /* Main action (purple) */
.btn-secondary           /* Alternative (gray) */
.btn-success             /* Positive (green) */
.btn-danger              /* Destructive (red) */
.btn-sm                  /* Small button */
.btn-lg                  /* Large button */
```

### **Section Classes**
```css
.info-section            /* Blue section (General) */
.success-section         /* Green section (Success) */
.warning-section         /* Amber section (Warning) */
.danger-section          /* Red section (Danger) */
```

---

## 📱 Responsive Classes

```css
/* Responsive grid - auto collapses on mobile */
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

/* Form row - 2 cols on desktop, 1 on mobile */
<div class="form-row">
  <div class="input-group">
  <div class="input-group">
</div>

/* Media queries */
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }
```

---

## 🎯 Common Patterns

### **Form Input**
```vue
<div class="input-group">
  <label>Field Label</label>
  <input type="text" v-model="fieldValue" placeholder="Enter value">
</div>
```

### **Select Dropdown**
```vue
<div class="input-group">
  <label>Choose Option</label>
  <select v-model="selectedOption">
    <option value="">Select...</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
  </select>
</div>
```

### **Textarea**
```vue
<div class="input-group full-width">
  <label>Description</label>
  <textarea v-model="description" rows="4" placeholder="Enter description"></textarea>
</div>
```

### **Checkbox**
```vue
<div class="input-group">
  <label>
    <input type="checkbox" v-model="isChecked">
    Option Label
  </label>
</div>
```

### **Radio Buttons**
```vue
<div class="input-group">
  <label>Choose One</label>
  <div style="display: flex; gap: 16px;">
    <label>
      <input type="radio" v-model="choice" value="option1">
      Option 1
    </label>
    <label>
      <input type="radio" v-model="choice" value="option2">
      Option 2
    </label>
  </div>
</div>
```

### **Color-Coded Section**
```vue
<div style="padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #48bb78;">
  <h3 style="display: flex; align-items: center; gap: 8px; margin: 0 0 12px 0;">
    <i class="fas fa-check-circle"></i>
    Section Title (Success)
  </h3>
  <!-- Section content -->
</div>
```

### **Table in Modal**
```vue
<table class="styled-table">
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in items" :key="item.id">
      <td>{{ item.value1 }}</td>
      <td>{{ item.value2 }}</td>
      <td>
        <button class="btn btn-sm btn-primary">Edit</button>
        <button class="btn btn-sm btn-danger">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
```

---

## 🎨 Color Reference

### **CSS Color Values**
```css
/* Primary */
--primary: #667eea;
--primary-dark: #764ba2;

/* Status */
--success: #48bb78;
--warning: #f59e0b;
--danger: #e53e3e;
--info: #667eea;

/* Neutral */
--text-primary: #2d3748;
--text-secondary: #718096;
--border: #e2e8f0;
--bg-light: #f7fafc;
```

### **Background Colors**
```css
/* Blue (General) */
background: rgba(102, 126, 234, 0.1);     /* Very light */
background: #eff6ff;                       /* Light */

/* Green (Success) */
background: #f0fdf4;                       /* Light */

/* Amber (Warning) */
background: #fef3c7;                       /* Light */

/* Red (Danger) */
background: #fef2f2;                       /* Light */
```

---

## 🔤 Typography Classes

```vue
<!-- Headings -->
<h2 class="modal-title">Main Title (1.5rem)</h2>
<p class="modal-subtitle">Subtitle (0.95rem)</p>
<h3 style="font-size: 1.1rem; font-weight: 600;">Section (1.1rem)</h3>

<!-- Labels -->
<label style="font-size: 0.85rem; color: #718096;">Field Label</label>

<!-- Body Text -->
<p style="font-size: 0.95rem; color: #2d3748;">Regular text</p>

<!-- Muted Text -->
<p style="font-size: 0.9rem; color: #718096;">Secondary text</p>
```

---

## 🚨 Icon Library (Font Awesome)

```html
<!-- Common Icons -->
<i class="fas fa-envelope"></i>           <!-- Email -->
<i class="fas fa-user"></i>               <!-- Person -->
<i class="fas fa-building"></i>           <!-- Company -->
<i class="fas fa-info-circle"></i>        <!-- Info -->
<i class="fas fa-check-circle"></i>       <!-- Success -->
<i class="fas fa-exclamation-circle"></i> <!-- Warning -->
<i class="fas fa-times-circle"></i>       <!-- Error -->
<i class="fas fa-calendar"></i>           <!-- Calendar -->
<i class="fas fa-calculator"></i>         <!-- Calculate -->
<i class="fas fa-file-pdf"></i>           <!-- PDF -->
<i class="fas fa-download"></i>           <!-- Download -->
<i class="fas fa-edit"></i>               <!-- Edit -->
<i class="fas fa-trash"></i>              <!-- Delete -->
<i class="fas fa-plus"></i>               <!-- Add -->
<i class="fas fa-search"></i>             <!-- Search -->
<i class="fas fa-filter"></i>             <!-- Filter -->
<i class="fas fa-tools"></i>              <!-- Service/Tools -->
<i class="fas fa-boxes"></i>              <!-- Supply/Boxes -->
<i class="fas fa-calendar-check"></i>     <!-- AMC/Appointments -->
```

---

## 🔄 Animation Classes

```css
/* Animations included in modern-popups.css */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Applied to modals automatically */
.modal-backdrop { animation: fadeIn 0.3s ease-out; }
.modal-card { animation: slideUp 0.3s ease-out; }
```

---

## ✂️ Copy-Paste Templates

### **Simple Modal (No Data)**
```vue
<div v-if="showModal" class="modal-backdrop">
  <div class="modal-card small">
    <div class="modal-header">
      <div class="modal-title-wrapper">
        <div class="modal-icon-badge">
          <i class="fas fa-info-circle"></i>
        </div>
        <div>
          <h2 class="modal-title">Modal Title</h2>
        </div>
      </div>
      <button class="quotation-btn-close" @click="showModal = false">×</button>
    </div>
    <div class="modal-body">
      <p>Modal content goes here</p>
    </div>
    <div class="modal-footer">
      <div class="modal-buttons">
        <button class="btn btn-secondary" @click="showModal = false">Close</button>
      </div>
    </div>
  </div>
</div>
```

### **Form Modal**
```vue
<div v-if="showForm" class="modal-backdrop">
  <div class="modal-card medium">
    <div class="modal-header">
      <div class="modal-title-wrapper">
        <div class="modal-icon-badge">
          <i class="fas fa-edit"></i>
        </div>
        <div>
          <h2 class="modal-title">Edit Details</h2>
          <p class="modal-subtitle">Update your information</p>
        </div>
      </div>
      <button class="quotation-btn-close" @click="showForm = false">×</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="input-group">
          <label>Field 1</label>
          <input type="text" v-model="formData.field1">
        </div>
        <div class="input-group">
          <label>Field 2</label>
          <input type="text" v-model="formData.field2">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <div class="modal-buttons">
        <button class="btn btn-secondary" @click="showForm = false">Cancel</button>
        <button class="btn btn-primary" @click="saveForm">Save</button>
      </div>
    </div>
  </div>
</div>
```

### **Data Display Modal**
```vue
<div v-if="showDetails" class="modal-backdrop">
  <div class="modal-card large">
    <div class="modal-header">
      <div class="modal-title-wrapper">
        <div class="modal-icon-badge">
          <i class="fas fa-file-alt"></i>
        </div>
        <div>
          <h2 class="modal-title">Details</h2>
        </div>
      </div>
      <button class="quotation-btn-close" @click="showDetails = false">×</button>
    </div>
    <div class="modal-body">
      <div style="padding: 16px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
        <h3>Section 1</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
          <div>
            <span style="font-size: 0.85rem; color: #718096;">Label</span>
            <p style="font-weight: 600;">Value</p>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" @click="showDetails = false">Close</button>
    </div>
  </div>
</div>
```

---

## 🐛 Debugging Tips

### **Check if CSS loaded**
```javascript
// In browser console:
console.log(document.styleSheets);
// Look for 'modern-popups.css' in the list
```

### **Check computed styles**
```javascript
// In DevTools, select element and check Styles tab
// Should show rules from modern-popups.css
```

### **Check animation timing**
```javascript
// Measure modal animation performance
const start = performance.now();
// Open modal
const end = performance.now();
console.log(`Animation took ${end - start}ms`);
```

### **Console errors**
```javascript
// If you see CSS errors, check:
1. File path in import statement
2. CSS file exists at that location
3. No typos in CSS class names
4. No invalid CSS syntax
```

---

## 📚 File Structure

```
src/
├── styles/
│   └── modern-popups.css          ← All modal styling
└── views/
    └── employee/
        └── CustomerRegistrations.vue  ← Popups using modern-popups.css
```

---

## 🔗 CSS File Features

The `modern-popups.css` file includes:

- ✅ Modal base styles
- ✅ Form styling (inputs, selects, textareas)
- ✅ Button variants
- ✅ Table styling
- ✅ Color-coded sections
- ✅ Responsive breakpoints
- ✅ Animations
- ✅ Icons styling
- ✅ Badge styling
- ✅ Grid layouts

**No modification needed** — just use the classes!

---

## 💡 Best Practices

### ✅ DO
- Use semantic HTML (`<label>`, `<input>`, `<table>`)
- Use provided CSS classes
- Keep modals under 900px width
- Use icons for headers
- Test on mobile devices

### ❌ DON'T
- Add inline styles (use CSS classes instead)
- Create custom modal wrappers
- Override CSS in component style tag
- Use vendor-prefixed properties (CSS handles it)
- Hardcode colors (use CSS variables)

---

## 🚀 Performance Tips

1. **Lazy Load Modals**: Only render when `v-if="show..."`
2. **Use CSS Classes**: Faster than inline styles
3. **Minimize DOM**: Remove unused elements
4. **Cache Computations**: Use `computed` for complex data
5. **Debounce Handlers**: For input/scroll events

---

## 📖 Reference Links

- Font Awesome Icons: https://fontawesome.com/search
- CSS Grid Documentation: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
- Vue.js Component Guide: https://vuejs.org/guide/components/
- Responsive Design: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design

---

## 🆘 Need Help?

If you need to:

1. **Add a new popup**: Copy the "Simple Modal" template above
2. **Add more sections**: Copy a color-coded section template
3. **Change colors**: Update color values in CSS or use inline style
4. **Fix mobile issues**: Check responsive breakpoints in CSS
5. **Debug styling**: Use DevTools Inspector to check computed styles

---

**Happy coding! 🎉**
