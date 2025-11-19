# DevTools System

A modular, scalable developer tools system for RiderMind.

## 📁 Directory Structure

```
DevTools/
├── DevTools.jsx              # Main container page
├── FirebaseTest.jsx          # Firebase test component (used by tools)
├── ModuleFirebaseTest.jsx    # Module Firebase test component (used by tools)
└── tools/                    # All tool components
    ├── index.js              # Central export point
    ├── StudentModulesTool.jsx
    ├── ModuleManagementTool.jsx
    └── FirebaseStorageTool.jsx
```

## 🔧 Adding a New Tool

### Step 1: Create the Tool Component

Create a new file in `DevTools/tools/YourToolName.jsx`:

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

function YourToolName() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAction = async () => {
    // Your tool logic here
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Your Tool Title
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Description of what your tool does
          </p>
        </div>
        <div className="text-4xl">🔧</div>
      </div>

      {/* Messages */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6"
        >
          <p className="text-green-800 dark:text-green-200">{message}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
        >
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </motion.div>
      )}

      {/* Your tool UI here */}
      <button
        onClick={handleAction}
        disabled={loading}
        className="w-full py-4 px-6 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
      >
        {loading ? 'Processing...' : 'Execute Action'}
      </button>
    </div>
  );
}

export default YourToolName;
```

### Step 2: Export from Index

Add to `DevTools/tools/index.js`:

```jsx
export { default as YourToolName } from './YourToolName';
```

### Step 3: Register in DevTools.jsx

Import and add to the tools array in `DevTools.jsx`:

```jsx
import {
  StudentModulesTool,
  ModuleManagementTool,
  FirebaseStorageTool,
  YourToolName  // Add import
} from './DevTools/tools';

function DevTools() {
  const tools = [
    // ... existing tools
    {
      id: 'your-tool-id',
      component: YourToolName,
      delay: 0.4,
      category: 'Your Category'
    }
  ];
  // ...
}
```

That's it! Your tool will now appear on the DevTools page.

## 📦 Available Tools

### 1. StudentModulesTool
- **Category**: Data Management
- **Purpose**: Clear all student module progress
- **Danger Level**: ⚠️ High (irreversible)

### 2. ModuleManagementTool
- **Category**: Data Management
- **Purpose**: Generate sample modules or clear all modules
- **Features**:
  - Generate 10 sample modules with Firebase media
  - Clear all modules and related data
- **Danger Level**: ⚠️ High (irreversible)

### 3. FirebaseStorageTool
- **Category**: Testing & Debugging
- **Purpose**: Test Firebase Storage upload/retrieval
- **Features**:
  - Upload test files to Firebase
  - Upload images/videos to module slides
  - URL caching testing

## 🎨 UI Guidelines

### Colors
- **Success**: Green (50, 200, 800 shades)
- **Error**: Red (50, 200, 800 shades)
- **Info**: Blue (600, 700)
- **Warning**: Yellow/Orange
- **Neutral**: Gray scale

### Animation
Use framer-motion for consistent animations:
- Initial state: `{ opacity: 0, y: 20 }` or `{ opacity: 0, y: -10 }`
- Animate to: `{ opacity: 1, y: 0 }`
- Transition delays: Increment by 0.1 for staggered effects

### Layout
- Container: `bg-white dark:bg-neutral-800 rounded-xl shadow-lg border p-8`
- Header: Icon on right, title and description on left
- Messages: Green for success, Red for errors
- Buttons: Full width, bold text, scale on active

## 🔒 Security

- All tools should check for authentication via `localStorage.getItem('token')`
- Use confirmation dialogs for destructive operations
- Display clear warnings for irreversible actions
- Show detailed information about what will be affected

## 🚀 Best Practices

1. **Self-contained**: Each tool manages its own state
2. **Consistent UI**: Follow the established design patterns
3. **Clear messaging**: Show success/error states
4. **Loading states**: Disable actions during processing
5. **Confirmations**: Always confirm destructive operations
6. **Documentation**: Document what your tool does
7. **Error handling**: Always wrap API calls in try/catch

## 📝 Example API Call Pattern

```jsx
const handleAction = async () => {
  if (!confirm('Are you sure?')) return;

  setLoading(true);
  setMessage('');
  setError('');

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/dev/your-endpoint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ /* your data */ })
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('✅ Success message');
      setError('');
    } else {
      setError(data.error || 'Operation failed');
      setMessage('');
    }
  } catch (err) {
    setError('Network error: ' + err.message);
    setMessage('');
  } finally {
    setLoading(false);
  }
};
```

## 🏗️ Future Enhancements

Potential additions:
- Category filtering
- Search functionality
- Tool favorites/pinning
- Usage analytics
- Tool permissions based on user role
- Batch operations
- Tool scheduling
- Export/import configurations
