# TalentFlow - Talent Management System

A modern, full-featured talent management system built with React, Vite, and Tailwind CSS. This application provides comprehensive tools for job management, candidate tracking, and assessment building.

## Features

### 🎯 Jobs Management
- Create, edit, and manage job postings
- Drag-and-drop reordering of jobs
- Archive/unarchive functionality
- Search and filter capabilities
- Tag-based organization

### 👥 Candidates Dashboard
- Kanban-style candidate pipeline
- Drag-and-drop stage management
- Search by name or email
- Real-time candidate tracking
- Visual stage indicators

### 📋 Assessment Builder
- Dynamic form builder with multiple question types
- Live preview functionality
- Support for various question formats:
  - Short text
  - Long text
  - Single choice
  - Multiple choice
  - Numeric input
  - File upload
- Required field validation

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useCallback, useMemo)
- **Data Storage**: LocalStorage (with mock API)
- **Icons**: Custom SVG components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mani2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mani2/
├── src/
│   ├── components/
│   │   ├── icons.jsx           # SVG icon components
│   │   ├── JobEditorModal.jsx  # Job creation/editing modal
│   │   ├── JobsDashboard.jsx    # Jobs management interface
│   │   ├── CandidatesDashboard.jsx # Candidates kanban board
│   │   └── AssessmentBuilder.jsx   # Assessment form builder
│   ├── lib/
│   │   └── mockApi.js          # Mock API with localStorage
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles and Tailwind imports
├── index.html                  # HTML entry point
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── package.json
└── README.md
```

## Usage

### Jobs Management
1. Navigate to the "Jobs" tab
2. Click "Create Job" to add new positions
3. Use drag-and-drop to reorder jobs
4. Click the archive button to archive/unarchive jobs
5. Use the search and filter options to find specific jobs

### Candidates Pipeline
1. Go to the "Candidates" tab
2. View candidates organized by stage (Applied, Screen, Tech, Offer, Hired, Rejected)
3. Drag candidates between stages to update their status
4. Use the search bar to find specific candidates

### Assessment Builder
1. Navigate to the "Assessments" tab
2. Add questions using the question type buttons
3. Configure question settings (required, options, etc.)
4. Preview the form in real-time
5. Save your assessment

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Features Implementation

- **Optimistic Updates**: UI updates immediately with rollback on API failure
- **Drag & Drop**: Native HTML5 drag and drop with visual feedback
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Mock API**: Realistic API simulation with latency and error handling
- **Local Storage**: Persistent data storage across sessions

## Customization

### Adding New Question Types
1. Add the new type to the `questionTypes` array in `AssessmentBuilder.jsx`
2. Implement the preview rendering in the Live Preview section
3. Add any specific configuration options

### Styling
The application uses Tailwind CSS with custom utility classes defined in `src/index.css`. You can customize the design by modifying the Tailwind configuration or adding custom CSS.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.