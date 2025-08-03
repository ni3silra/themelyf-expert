# 🚀 Themelyf Dashboard Demo

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+

### Running the Application

1. **Start the application:**
   ```bash
   mvn spring-boot:run
   ```

2. **Access the application:**
   - **Main Dashboard**: http://localhost:8080
   - **UI Components**: http://localhost:8080/components  
   - **Form Examples**: http://localhost:8080/forms
   - **H2 Database Console**: http://localhost:8080/h2-console

### 🎯 What You'll See

#### **Dashboard Features**
- ✅ **Modular JavaScript** - All JS extracted to separate files
- ✅ **External Libraries** - Notyf, Flatpickr, Choices.js, Quill, Chart.js, Sortable.js
- ✅ **Advanced Validation** - Real-time form validation with visual feedback
- ✅ **Interactive Components** - Modals, tooltips, popovers, notifications
- ✅ **Performance Optimized** - Server & browser caching, service worker
- ✅ **Mobile Responsive** - Works perfectly on all devices

#### **JavaScript Architecture**

**6 Modular Files:**
```
/js/modal.js          - Modal management system
/js/notification.js   - Toast notifications  
/js/form-validation.js - Comprehensive validation
/js/ui-components.js  - Tooltips, popovers, dropdowns
/js/form-inputs.js    - Advanced form components
/js/dashboard.js      - Dashboard-specific logic
```

#### **Form Input Types Available**

**Basic Inputs:**
- Text, Email, Password, Number, Tel, URL, Search, Hidden, Range

**Date/Time Inputs:**
- Date, Time, DateTime-local, Month, Week, Date Range

**Selection Inputs:**
- Checkbox groups, Radio groups, Single/Multi select

**Advanced Inputs:**
- File upload (drag-drop, preview), Color picker, Rich text editor
- Tags input, JSON editor, Auto-resizing textarea

**Enhanced Features:**
- Real-time validation with custom rules
- Multi-select with search functionality
- Date pickers with localization
- File upload with progress and preview
- Color picker with palette support

#### **UI Components Showcase**

**Modals:**
- Basic modal, Form modal, Gallery modal, Data table modal

**Notifications:**
- Success, Error, Warning, Info with action buttons
- Persistent notifications, Auto-dismiss, Custom styling

**Interactive Elements:**
- Tooltips with rich content, Popovers with positioning
- Context menus, Dropdown menus, Progress bars
- Loading spinners, Skeleton loaders

#### **Developer Features**

**Keyboard Shortcuts:**
- `Ctrl+K` - Focus global search
- `Ctrl+N` - Open new item modal
- `Ctrl+Shift+T` - Toggle theme
- `Escape` - Close modals/dropdowns

**Caching Strategy:**
- Server-side Spring Cache
- Browser localStorage with timeout
- Service worker for offline support
- Visual cache indicators

**Performance:**
- Debounced search (300ms delay)
- Lazy component initialization
- Optimized asset loading
- Progressive enhancement

### 🛠 Technical Stack

**Backend:**
- Spring Boot 3.2 (Java 17)
- Spring Data JPA
- H2 Database (in-memory)
- Thymeleaf templating
- Spring Cache

**Frontend:**
- TailwindCSS (CDN)
- Font Awesome 6.5.1
- Notyf (notifications)
- Flatpickr (date picker)
- Choices.js (enhanced selects)
- Quill (rich text editor)
- Sortable.js (drag & drop)
- Chart.js (data visualization)

### 🎨 Sample Data

The application includes 15 pre-loaded sample items with various:
- **Categories**: Welcome, Project, Task, Security, Documentation, etc.
- **Statuses**: Active, Pending, Completed, Draft, Inactive
- **Rich descriptions** and realistic data

### 🔧 Customization

**Adding New Form Components:**
1. Create validation rules in `form-validation.js`
2. Add component logic in `form-inputs.js`
3. Style with TailwindCSS classes
4. Initialize with `data-` attributes

**Creating Custom Modals:**
```javascript
modalManager.createModal({
    id: 'my-modal',
    title: 'Custom Modal',
    content: '<p>Your content here</p>',
    size: 'large',
    actions: [...]
});
```

**Adding Notifications:**
```javascript
notificationManager.success('Title', 'Message', {
    duration: 5000,
    actions: [{label: 'Action', onclick: 'function()'}]
});
```

### 🚀 Production Ready Features

- **Error handling** with graceful degradation
- **Accessibility** with ARIA labels and keyboard navigation
- **SEO optimized** with proper meta tags
- **Mobile responsive** with touch-friendly interactions
- **Theme switching** with persistence
- **Offline support** via service worker
- **Security best practices** with CSRF protection

### 🎯 Demo Scenarios

1. **Create New Item**: Click "Add New Item" → Fill form → See validation
2. **Search & Filter**: Use search bar → Apply category/status filters
3. **Interactive Components**: Visit `/components` → Try all examples
4. **Form Validation**: Visit `/forms` → Test all input types
5. **Mobile Experience**: Resize browser → See responsive design
6. **Keyboard Navigation**: Use Ctrl+K, Ctrl+N shortcuts
7. **Theme Switching**: Click moon/sun icon → See dark/light mode
8. **Offline Mode**: Disconnect internet → See service worker in action

This demo showcases a modern, production-ready web application with clean separation of concerns, comprehensive form handling, and advanced UI components - all built with Java and enhanced with the best JavaScript libraries available.