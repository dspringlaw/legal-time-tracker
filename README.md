# Legal Time Tracker

A time tracking application designed specifically for legal professionals. Track time by client and project, generate reports, and manage your billable hours efficiently.

## Features

- **Time Tracking**: Start and stop a timer to track your work in real-time, or manually add time entries
- **Client Management**: Organize your work by client and project type
- **Reporting**: Generate detailed reports of your time entries, filtered by client, project, and date range
- **Data Export**: Export your time entries as CSV files for use in other applications
- **Desktop Integration**: Create a desktop shortcut for quick access

## Technologies Used

- **Electron**: Cross-platform desktop application framework
- **React**: UI library for building the user interface
- **Material UI**: Component library for a professional and consistent design
- **Electron Store**: Data persistence for storing client and time entry data

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Development

1. Clone the repository:
   ```
   git clone https://github.com/dspringlaw/legal-time-tracker.git
   cd legal-time-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run electron:dev
   ```

### Building for Production

1. Build the application:
   ```
   npm run electron:build
   ```

2. The built application will be in the `dist` directory.

## Usage

### Timer

1. Select a client and project type
2. Click "Start Timer" to begin tracking time
3. Click "Stop Timer" when you're done
4. The time entry will be automatically saved

### Manual Time Entry

1. Click "Add Time" on the Timer page
2. Fill in the client, project, date, start time, end time, and description
3. Click "Save" to add the time entry

### Reports

1. Go to the Reports page
2. Use the filters to select the client, project, and date range
3. View the summary and detailed time entries
4. Click "Export CSV" to download the report

## License

MIT
