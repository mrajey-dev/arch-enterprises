# 🎨 Design System - Visual Reference

## Complete Design System for All Popups

---

## 📐 Modal Structure

### **Basic HTML Structure**
```html
<div class="modal-backdrop">           <!-- Overlay -->
  <div class="modal-card [size]">      <!-- Container -->
    <div class="modal-header">         <!-- Header section -->
      <div class="modal-title-wrapper">
        <div class="modal-icon-badge"><i class="fas fa-icon"></i></div>
        <div>
          <h2 class="modal-title">Title</h2>
          <p class="modal-subtitle">Subtitle</p>
        </div>
      </div>
      <button class="quotation-btn-close">×</button>
    </div>

    <div class="modal-body">           <!-- Content area -->
      <!-- Your content -->
    </div>

    <div class="modal-footer">         <!-- Button area -->
      <div class="modal-buttons">
        <button class="btn btn-secondary">Cancel</button>
        <button class="btn btn-primary">Save</button>
      </div>
    </div>
  </div>
</div>
```

---

## 📊 Color-Coded Sections

### **Pattern for Content Sections**

#### **Blue Section (General Information)**
```html
<div style="padding: 16px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
  <h3 style="display: flex; align-items: center; gap: 8px; margin: 0 0 12px 0;">
    <i class="fas fa-info-circle"></i>
    General Information
  </h3>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
    <!-- Field items -->
  </div>
</div>
```

**Colors:**
- Background: `#f7fafc` (Light)
- Border: `#667eea` (Purple)
- Icon: Purple/Blue

---

#### **Green Section (Success/Tax/Approved)**
```html
<div style="padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #48bb78;">
  <h3 style="display: flex; align-items: center; gap: 8px; margin: 0 0 12px 0;">
    <i class="fas fa-check-circle"></i>
    Tax & Compliance
  </h3>
  <!-- Content -->
</div>
```

**Colors:**
- Background: `#f0fdf4` (Light green)
- Border: `#48bb78` (Green)
- Icon: Green

---

#### **Amber Section (Warning/Pending)**
```html
<div style="padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
  <h3 style="display: flex; align-items: center; gap: 8px; margin: 0 0 12px 0;">
    <i class="fas fa-exclamation-circle"></i>
    Pending Items
  </h3>
  <!-- Content -->
</div>
```

**Colors:**
- Background: `#fef3c7` (Light amber)
- Border: `#f59e0b` (Amber)
- Icon: Orange/Amber

---

#### **Red Section (Danger/Inactive)**
```html
<div style="padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #e53e3e;">
  <h3 style="display: flex; align-items: center; gap: 8px; margin: 0 0 12px 0;">
    <i class="fas fa-times-circle"></i>
    Inactive Items
  </h3>
  <!-- Content -->
</div>
```

**Colors:**
- Background: `#fef2f2` (Light red)
- Border: `#e53e3e` (Red)
- Icon: Red

---

## 🎯 Button Styles

### **Primary Button**
```html
<button class="btn btn-primary">Save</button>
```
- **Background:** `#667eea` (Purple)
- **Hover:** `#764ba2` (Darker purple)
- **Text:** White
- **Padding:** 10px 16px
- **Border Radius:** 6px
- **Shadow on Hover:** Yes

### **Secondary Button**
```html
<button class="btn btn-secondary">Cancel</button>
```
- **Background:** `#e2e8f0` (Light gray)
- **Hover:** `#cbd5e0` (Medium gray)
- **Text:** Dark gray
- **Padding:** 10px 16px
- **Border Radius:** 6px

### **Success Button**
```html
<button class="btn btn-success">Approve</button>
```
- **Background:** `#48bb78` (Green)
- **Hover:** `#38a169` (Darker green)
- **Text:** White
- **Padding:** 10px 16px

### **Danger Button**
```html
<button class="btn btn-danger">Delete</button>
```
- **Background:** `#e53e3e` (Red)
- **Hover:** `#c53030` (Darker red)
- **Text:** White
- **Padding:** 10px 16px

### **Small Button**
```html
<button class="btn btn-primary btn-sm">Edit</button>
```
- **Padding:** 6px 12px
- **Font Size:** 0.9rem
- **Border Radius:** 4px

### **Large Button**
```html
<button class="btn btn-primary btn-lg">Submit</button>
```
- **Padding:** 12px 20px
- **Font Size:** 1rem
- **Border Radius:** 8px

---

## 📋 Form Elements

### **Text Input**
```html
<div class="input-group">
  <label>Field Name</label>
  <input type="text" placeholder="Enter value">
</div>
```
- **Border:** 1px solid `#cbd5e0`
- **Focus Border:** `#667eea`
- **Padding:** 8px 12px
- **Border Radius:** 6px
- **Background:** White
- **Focus Shadow:** 0 0 0 3px rgba(102, 126, 234, 0.1)

### **Select Dropdown**
```html
<div class="input-group">
  <label>Select Option</label>
  <select>
    <option>Option 1</option>
  </select>
</div>
```
- Same styling as text input
- **Dropdown Arrow:** Built-in

### **Textarea**
```html
<div class="input-group full-width">
  <label>Description</label>
  <textarea rows="4" placeholder="Enter description"></textarea>
</div>
```
- Same styling as input
- **Rows:** Customizable

### **Checkbox**
```html
<label>
  <input type="checkbox"> Option Label
</label>
```
- **Size:** 18x18px
- **Margin:** 8px
- **Color:** `#667eea` (when checked)

### **Radio Button**
```html
<label>
  <input type="radio" name="group"> Option Label
</label>
```
- **Size:** 18x18px
- **Color:** `#667eea` (when selected)

---

## 🎫 Modal Sizes

### **Small Modal (400px)**
```html
<div class="modal-card small">
```
**Use for:**
- Simple confirmations
- Quick dialogs
- Alert messages

### **Medium Modal (600px)** ← Most Common
```html
<div class="modal-card medium">
```
**Use for:**
- Form entry
- Simple data views
- Most popups

### **Large Modal (900px)**
```html
<div class="modal-card large">
```
**Use for:**
- Tables with many rows
- Complex forms
- Data-heavy displays

---

## 📱 Responsive Grid

### **Auto-Fit Grid (Recommended)**
```html
<div style="display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 16px;">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

**Behavior:**
- Desktop (1920px): 4+ columns
- Tablet (768px): 2-3 columns
- Mobile (375px): 1 column

### **Fixed 2-Column**
```html
<div class="form-row">
  <div class="input-group">Field 1</div>
  <div class="input-group">Field 2</div>
</div>
```

**Behavior:**
- Desktop: 2 columns
- Mobile: 1 column (stacked)

### **Full Width**
```html
<div class="input-group full-width">
  <label>Field</label>
  <input type="text">
</div>
```

**Behavior:**
- Always spans full width

---

## 🎨 Color Palette Reference

### **Primary Colors**
```
#667eea - Main purple (buttons, links, icons)
#764ba2 - Hover state (darker purple)
#f8f7ff - Very light background
#eff6ff - Light blue background
```

### **Status Colors**
```
#48bb78 - Success/Green
#f59e0b - Warning/Amber
#e53e3e - Danger/Red
#667eea - Info/Blue
```

### **Neutral Colors**
```
#2d3748 - Text (dark gray)
#718096 - Text secondary (medium gray)
#e2e8f0 - Border (light gray)
#f7fafc - Background (very light)
#ffffff - White
```

---

## 🔤 Typography Reference

### **Header (h2 - Modal Title)**
```css
font-size: 1.5rem
font-weight: bold
color: #2d3748
margin: 0
```

### **Subtitle (Modal Subtitle)**
```css
font-size: 0.95rem
color: #718096
margin: 4px 0 0 0
```

### **Section Header (h3)**
```css
font-size: 1.1rem
font-weight: 600
color: #2d3748
margin: 0 0 12px 0
```

### **Label**
```css
font-size: 0.85rem
font-weight: 600
color: #718096
margin: 0 0 6px 0
```

### **Body Text (p)**
```css
font-size: 0.95rem
color: #2d3748
margin: 0
```

### **Muted Text**
```css
font-size: 0.9rem
color: #718096
```

---

## 📊 Table Styling

### **Professional Table**
```html
<table class="styled-table">
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
      <td>
        <button class="btn btn-sm btn-primary">Edit</button>
      </td>
    </tr>
  </tbody>
</table>
```

**Styling:**
- Header Background: `#667eea` (Purple)
- Header Text: White, bold
- Row Hover: `#f7fafc` (Light gray)
- Border: 1px solid `#e2e8f0`
- Padding: 12px
- Responsive: Converts to cards on mobile

---

## 🔗 Icon-Enhanced Header Pattern

### **Email/Communication**
```html
<div class="modal-icon-badge">
  <i class="fas fa-envelope"></i>
</div>
```

### **User/Customer**
```html
<div class="modal-icon-badge">
  <i class="fas fa-user"></i>
</div>
```

### **Company/Organization**
```html
<div class="modal-icon-badge">
  <i class="fas fa-building"></i>
</div>
```

### **Document/File**
```html
<div class="modal-icon-badge">
  <i class="fas fa-file-alt"></i>
</div>
```

### **Information**
```html
<div class="modal-icon-badge">
  <i class="fas fa-info-circle"></i>
</div>
```

### **Settings**
```html
<div class="modal-icon-badge">
  <i class="fas fa-cog"></i>
</div>
```

### **Calendar/Schedule**
```html
<div class="modal-icon-badge">
  <i class="fas fa-calendar"></i>
</div>
```

### **Checkmark/Success**
```html
<div class="modal-icon-badge">
  <i class="fas fa-check-circle"></i>
</div>
```

---

## 🎬 Animation Specifications

### **Modal Entrance Animation**
```css
Duration: 0.3s
Timing: ease-out
Effect: Fade in + Slide up (20px)
```

### **Backdrop Fade**
```css
Duration: 0.3s
Timing: ease-out
From: opacity 0
To: opacity 1
```

### **Button Hover**
```css
Duration: 0.3s
Timing: ease
Background: Subtle color shift
Shadow: Add drop shadow
Transform: Slight lift
```

### **Input Focus**
```css
Duration: 0.2s
Border: Change to primary color
Shadow: Add focus ring (3px, 10% opacity)
Background: Slight color shift
```

---

## 📐 Spacing System

### **Padding & Margins**
```
Desktop:
- Modal padding: 24px
- Section gap: 16px
- Element gap: 12px

Tablet:
- Modal padding: 16px
- Section gap: 12px
- Element gap: 10px

Mobile:
- Modal padding: 12px
- Section gap: 12px
- Element gap: 8px
```

### **Heights**
```
Input height: 40px
Small button: 32px
Standard button: 40px
Large button: 48px
Header height: Auto
Footer height: Auto
```

---

## 🎯 Quick Copy-Paste Sections

### **Complete Form Section**
```html
<div style="padding: 16px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 16px;">
  <h3 style="display: flex; align-items: center; gap: 8px; margin: 0 0 12px 0; font-size: 1.1rem; font-weight: 600; color: #2d3748;">
    <i class="fas fa-info-circle" style="color: #667eea;"></i>
    Section Title
  </h3>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
    <div class="input-group">
      <label>Field 1</label>
      <input type="text" placeholder="Enter value">
    </div>
    <div class="input-group">
      <label>Field 2</label>
      <input type="text" placeholder="Enter value">
    </div>
  </div>
</div>
```

### **Complete Modal Footer**
```html
<div class="modal-footer">
  <div class="modal-buttons">
    <button class="btn btn-secondary" @click="closeModal">Cancel</button>
    <button class="btn btn-primary" @click="saveData">Save</button>
  </div>
</div>
```

### **Stats Display**
```html
<div class="po-quick-stats" style="display: flex; gap: 16px; padding: 16px; background: #f7fafc; border-radius: 8px; margin: 16px 0;">
  <div class="stat-item" style="flex: 1; text-align: center;">
    <span style="font-size: 1.8rem; font-weight: bold; color: #667eea;">42</span>
    <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #718096;">Active Records</p>
  </div>
  <div style="width: 1px; background: #cbd5e0;"></div>
  <div class="stat-item" style="flex: 1; text-align: center;">
    <span style="font-size: 1.8rem; font-weight: bold; color: #48bb78;">15</span>
    <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #718096;">Pending Items</p>
  </div>
</div>
```

---

## ✅ Verification Checklist for New Modals

When creating a new modal, verify:

- [ ] Has proper HTML structure (backdrop → card → header/body/footer)
- [ ] Header includes icon badge with appropriate Font Awesome icon
- [ ] Title and subtitle provided
- [ ] Close button (×) in top right
- [ ] Body content using appropriate sections
- [ ] Sections color-coded (blue/green/amber/red)
- [ ] Form using proper input-group styling
- [ ] Buttons at footer with proper classes
- [ ] Mobile responsive (test at 375px, 768px, 1920px)
- [ ] No console errors
- [ ] Animations smooth (60 FPS)
- [ ] Accessibility: tab navigation, focus indicators, labels

---

## 🎨 Summary

All popups use this unified design system with:
- ✅ Consistent color palette
- ✅ Professional typography
- ✅ Responsive layouts
- ✅ Smooth animations
- ✅ Accessible components
- ✅ Beautiful, modern appearance

**Your design system is complete and ready to use! 🎉**
