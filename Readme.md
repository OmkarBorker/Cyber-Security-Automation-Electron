# Report Generator Desktop App

## Description
A cross-platform desktop application for generating reports, built with Electron. Available for both Windows (win32-x64) and macOS (darwin-arm64) platforms.

## System Requirements
- **Windows**: 64-bit Windows system
- **macOS**: macOS 11.0 or later (Apple Silicon/ARM64 support)
- Minimum system requirements as per Electron runtime

## Features
- Cross-platform compatibility (Windows and macOS)
- Native system integration
- High-resolution display support
- Secure transport layer (NSAppTransportSecurity configured)

## Installation
### Windows
1. Navigate to the `report-generator-win32-x64` directory
2. Run the application executable

### macOS
1. Navigate to the `report-generator-darwin-arm64` directory
2. Open `report-generator.app`

## Security & Permissions
The application may request access to:
- Network connections

## Development Setup
### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

### Running Locally
1. Clone the repository
```bash
git clone <repository-url>
cd report-generator
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run start
```

### Building the Application
1. Install development dependencies
```bash
npm install --save-dev
```

2. Build for Windows
```bash
npm run build:windows
```

3. Build for macOS
```bash
npm run build:mac
```

The built packages will be available in:
- Windows: `./dist/report-generator-win32-x64/`
- macOS: `./dist/report-generator-darwin-arm64/`

### Scripts Available
- `npm run start` - Start the app in development mode
- `npm run test` - Run the test suite
- `npm run build` - Build for current platform
- `npm run build:windows` - Build Windows package
- `npm run build:mac` - Build macOS package
- `npm run package` - Package the app for distribution

## Legal
This software includes various third-party components under different licenses:
- Chromium components (see LICENSES.chromium.html)
- OpenSSL components
- Other open-source libraries

## License
See the included license files for detailed licensing information.