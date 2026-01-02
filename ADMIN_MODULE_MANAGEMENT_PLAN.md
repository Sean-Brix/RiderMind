# Admin Module Management System - Implementation Plan

## System Overview

**Purpose**: Complete admin interface for managing lesson modules, category assignments, and quizzes for Motorcycle and Car student categories.

**Key Principles**:
- Modules exist independently and can be assigned to multiple categories
- Each category (Motorcycle/Car) has its own ordered list of modules
- Clean, minimal UI with no unnecessary headers/descriptions
- Fast, optimized, user-friendly

---

## Phase 1: Module Management Core (Days 1-3)

### 1.1 Modules List Page
**Route**: `/admin/modules`

**Features**:
- Grid/list view of all modules
- Quick search (title/description)
- Filter: Active/Inactive status
- Sort: Created date, Title, Position
- Inline quick actions: Edit, Duplicate, Delete, Preview
- Bulk selection + bulk delete
- "Create New Module" button (top right)

**Components**:
- `ModulesListView.jsx` - Main page
- `ModuleCard.jsx` - Individual module card
- `ModuleFilters.jsx` - Search + filter bar

---

### 1.2 Module Editor
**Routes**: 
- `/admin/modules/new` (create)
- `/admin/modules/:id/edit` (edit)

**Layout**: Split view
- **Left Panel (60%)**: Editor
  - Basic Info: Title, Description, Duration (minutes)
  - Active/Inactive toggle
  - Objectives list (add/edit/delete/reorder)
  - Slides manager (see 1.3)
- **Right Panel (40%)**: Live Preview
  - Shows module as students see it
  - Updates in real-time as admin edits
  - "Preview in Modal" button (full student view)

**Components**:
- `ModuleEditor.jsx` - Main editor page
- `ModuleForm.jsx` - Basic info form
- `ObjectivesManager.jsx` - Objectives CRUD + drag-drop
- `SlidesManager.jsx` - Slides CRUD + drag-drop
- `ModulePreview.jsx` - Live preview panel

---

### 1.3 Slide Editor
**Slide Types**:
1. **Video Slide**: Video upload/URL, title, optional description
2. **Image Slide**: Image upload, title, caption
3. **Lesson Slide**: Title, rich text content, optional image
4. **Tip Slide**: Title, tip text, icon selection

**Features**:
- Modal editor for each slide
- Drag handles to reorder slides
- Inline edit button for each slide
- Duplicate slide button
- Media uploads with progress bar
- Preview each slide before saving

**Components**:
- `SlideEditorModal.jsx` - Main slide editor
- `VideoSlideForm.jsx` - Video slide fields
- `ImageSlideForm.jsx` - Image slide fields
- `LessonSlideForm.jsx` - Lesson slide fields
- `TipSlideForm.jsx` - Tip slide fields
- `MediaUploader.jsx` - Unified media upload component

---

### 1.4 Module Preview Modal
**Trigger**: "Preview" button from list or editor

**Features**:
- Full-screen modal showing module exactly as students see it
- Navigation: Progress bar, Next/Previous buttons
- Shows: Objectives, all slides, completion status
- Close button (top right)

**Components**:
- `ModulePreviewModal.jsx` - Full preview modal
- Reuses client-side lesson modal components

---

## Phase 2: Category Management (Days 4-5)

### 2.1 Categories Overview
**Route**: `/admin/categories`

**Display**:
- Two large cards: Motorcycle, Car
- Each card shows:
  - Category icon (Bike/Car icon)
  - Number of assigned modules
  - "Manage Modules" button
  - Active/Inactive status badge

**Components**:
- `CategoriesOverview.jsx` - Main page
- `CategoryCard.jsx` - Individual category card

---

### 2.2 Category Module Manager
**Route**: `/admin/categories/:type/modules` (type = motorcycle|car)

**Layout**:
- Page indicator: Small badge/icon showing which category (top left)
- Assigned modules list (drag-drop enabled)
- "Add Modules" button (top right)

**Features**:
- Drag-drop to reorder modules (saves automatically on drop)
- Each module shows: Position #, Title, Description preview
- Quick remove button (X icon)
- Visual feedback: Position numbers update on drag
- Empty state: "No modules assigned yet" with "Add Modules" CTA

**Module Assignment Modal**:
- Opens when clicking "Add Modules"
- Shows all available modules (grid view)
- Search and filter
- Multi-select checkboxes
- Shows if module is already in the OTHER category (badge)
- "Add Selected" button
- Newly added modules appear at the bottom of the list

**Components**:
- `CategoryModulesManager.jsx` - Main page
- `AssignedModuleItem.jsx` - Draggable module item
- `ModuleAssignmentModal.jsx` - Module picker modal
- `ModulePickerCard.jsx` - Selectable module card

---

## Phase 3: Quiz Management (Days 6-8)

### 3.1 Module Quizzes List
**Route**: `/admin/modules/:id/quizzes`

**Access**: From module editor, "Quizzes" tab

**Features**:
- List of all quizzes for this module
- Quick add quiz button
- Each quiz shows: Title, # of questions, Active status
- Edit/Delete actions
- Drag-drop to reorder quizzes

**Components**:
- `ModuleQuizzesList.jsx` - Quizzes list view
- `QuizListItem.jsx` - Individual quiz item

---

### 3.2 Quiz Editor
**Route**: `/admin/modules/:moduleId/quizzes/:quizId/edit`

**Layout**: Single page with sections
- Quiz info: Title, Description, Passing score (%)
- Questions list (drag-drop enabled)
- Add question button

**Question Types**:
1. **Multiple Choice**: Text/Image question, 2-4 options, 1 correct
2. **True/False**: Text/Image question, T/F options
3. **Multiple Select**: Text/Image question, 2+ options, multiple correct

**Question Editor** (inline or modal):
- Question text (rich text)
- Optional question image/video
- Answer options (add/remove)
- Mark correct answer(s)
- Explanation text (shown after answer)
- Points value

**Components**:
- `QuizEditor.jsx` - Main quiz editor
- `QuizForm.jsx` - Quiz basic info
- `QuestionsManager.jsx` - Questions list with drag-drop
- `QuestionEditor.jsx` - Individual question editor
- `AnswerOption.jsx` - Answer option component

---

## Phase 4: Quality of Life Features (Days 9-10)

### 4.1 Quick Actions
- **Duplicate Module**: Clone module with all slides/objectives
- **Archive Module**: Soft delete (set inactive)
- **Bulk Operations**: Select multiple modules, bulk delete/archive
- **Auto-save**: Saves editor changes every 30 seconds
- **Unsaved Changes Warning**: Warn before leaving editor

### 4.2 Search & Filters
- **Global Module Search**: Search across all modules from anywhere
- **Recent Modules**: Quick access to recently edited modules
- **Filter Presets**: "Active only", "Inactive only", "No quizzes"

### 4.3 Visual Feedback
- **Drag Indicators**: Clear visual feedback when dragging
- **Loading States**: Spinners for all async operations
- **Success Toasts**: Confirmation for all CRUD operations
- **Error Handling**: Clear error messages with retry options
- **Optimistic Updates**: UI updates before API confirms (with rollback)

### 4.4 Media Management
- **Image Compression**: Auto-compress uploaded images
- **Video Thumbnails**: Generate thumbnails for videos
- **Progress Indicators**: Upload progress bars
- **File Size Limits**: Enforce limits with clear messaging
- **Media Preview**: Preview images/videos before upload

### 4.5 Statistics & Insights
- **Module Usage**: Show which modules are in which categories
- **Completion Stats**: Student completion rates (if available)
- **Last Modified**: Show when each module was last edited
- **Created By**: Track who created/edited modules

---

## Technical Architecture

### File Structure
```
client/src/features/admin/
├── modules/
│   ├── pages/
│   │   ├── ModulesListView.jsx
│   │   ├── ModuleEditor.jsx
│   │   └── ModuleQuizzesList.jsx
│   ├── components/
│   │   ├── ModuleCard.jsx
│   │   ├── ModuleForm.jsx
│   │   ├── ObjectivesManager.jsx
│   │   ├── SlidesManager.jsx
│   │   ├── SlideEditorModal.jsx
│   │   ├── ModulePreview.jsx
│   │   └── ModuleFilters.jsx
│   └── hooks/
│       ├── useModuleEditor.js
│       └── useAutoSave.js
├── categories/
│   ├── pages/
│   │   ├── CategoriesOverview.jsx
│   │   └── CategoryModulesManager.jsx
│   └── components/
│       ├── CategoryCard.jsx
│       ├── AssignedModuleItem.jsx
│       └── ModuleAssignmentModal.jsx
├── quizzes/
│   ├── pages/
│   │   └── QuizEditor.jsx
│   └── components/
│       ├── QuizForm.jsx
│       ├── QuestionsManager.jsx
│       ├── QuestionEditor.jsx
│       └── AnswerOption.jsx
└── shared/
    ├── contexts/
    │   ├── ModulesContext.jsx (existing)
    │   ├── CategoriesContext.jsx (existing)
    │   └── QuizzesContext.jsx (existing)
    └── components/
        ├── MediaUploader.jsx
        ├── RichTextEditor.jsx
        └── DragDropList.jsx
```

### API Endpoints (Backend)

**Modules**:
- GET `/api/modules` - List all modules
- GET `/api/modules/:id` - Get module details
- POST `/api/modules` - Create module
- PUT `/api/modules/:id` - Update module
- DELETE `/api/modules/:id` - Delete module
- POST `/api/modules/:id/duplicate` - Duplicate module

**Module Components**:
- POST `/api/modules/:id/objectives` - Add objective
- PUT `/api/modules/:id/objectives/:objId` - Update objective
- DELETE `/api/modules/:id/objectives/:objId` - Delete objective
- PATCH `/api/modules/:id/objectives/reorder` - Reorder objectives
- POST `/api/modules/:id/slides` - Add slide
- PUT `/api/modules/:id/slides/:slideId` - Update slide
- DELETE `/api/modules/:id/slides/:slideId` - Delete slide
- PATCH `/api/modules/:id/slides/reorder` - Reorder slides

**Categories** (existing, already implemented):
- GET `/api/categories` - List categories
- GET `/api/categories/:id` - Get category with modules
- POST `/api/categories/:id/modules` - Add module to category
- DELETE `/api/categories/:id/modules/:moduleId` - Remove module
- PATCH `/api/categories/:id/modules/reorder` - Reorder modules

**Quizzes**:
- GET `/api/modules/:moduleId/quizzes` - List module quizzes
- POST `/api/modules/:moduleId/quizzes` - Create quiz
- GET `/api/quizzes/:id` - Get quiz details
- PUT `/api/quizzes/:id` - Update quiz
- DELETE `/api/quizzes/:id` - Delete quiz

**Quiz Questions**:
- POST `/api/quizzes/:id/questions` - Add question
- PUT `/api/quizzes/:id/questions/:questionId` - Update question
- DELETE `/api/quizzes/:id/questions/:questionId` - Delete question
- PATCH `/api/quizzes/:id/questions/reorder` - Reorder questions

**Media**:
- POST `/api/media/upload` - Upload image/video
- DELETE `/api/media/:id` - Delete media file

---

## Implementation Order

### Week 1: Module Management
**Day 1**: Modules list + basic CRUD
**Day 2**: Module editor (basic info + objectives)
**Day 3**: Slides manager + preview modal

### Week 2: Categories & Quizzes
**Day 4**: Categories overview + fix existing issues
**Day 5**: Category module manager (drag-drop assignment)
**Day 6**: Quiz list + quiz editor
**Day 7**: Question editor + question types
**Day 8**: Quiz preview + testing

### Week 3: Polish & QoL
**Day 9**: Auto-save, bulk actions, media optimization
**Day 10**: Testing, bug fixes, performance optimization

---

## Success Criteria

### Functionality
- ✅ Admin can create/edit modules with slides, objectives
- ✅ Admin can preview modules as students see them
- ✅ Admin can assign modules to Motorcycle/Car categories
- ✅ Admin can reorder modules within categories (drag-drop)
- ✅ Same module can exist in both categories
- ✅ Admin can create quizzes with multiple question types
- ✅ All CRUD operations work correctly

### User Experience
- ✅ No unnecessary headers/labels
- ✅ Clear visual feedback for all actions
- ✅ Fast page loads (<1s)
- ✅ Responsive design (works on laptop/desktop)
- ✅ Intuitive navigation
- ✅ Auto-save prevents data loss
- ✅ Error messages are helpful and actionable

### Performance
- ✅ Image uploads compressed automatically
- ✅ Optimistic UI updates
- ✅ Lazy loading for large lists
- ✅ Debounced search/filters
- ✅ Efficient drag-drop (no lag)

---

## Notes

- Reuse existing components from Phase 1 where possible
- Maintain dark mode support throughout
- Keep API responses consistent (all return `{ success, data }`)
- Use `@dnd-kit` for all drag-drop functionality
- Use existing MediaUploader component for all uploads
- Preserve existing database schema (ModuleCategory, ModuleCategoryModule)
- Clean up any redundant code/files from previous attempts
