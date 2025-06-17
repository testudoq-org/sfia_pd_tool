# System Architecture and Technical Patterns

## Core Architecture

### Build System
- **Build Tool**: Webpack (replaces Grunt)
- **Source Format**: ES6 modules (`.mjs`)
- **Development Output**: `package/dev/` (unminified, sourcemaps)
- **Production Output**: `package/prd/` (minified, optimized)
- **Legacy Support**: `.js` files still supported, but `.mjs` is preferred

### Operational Mechanics
- **Entry Points**: All `.mjs` modules in `src/modules/` and main HTML in `src/`
- **Bundling**: Webpack bundles all JS/ES6 modules, CSS, and assets
- **Transpilation**: Babel transpiles ES6+ code for browser compatibility
- **Asset Handling**: HTML, CSS, JSON, and static assets are copied and optimized
- **Sourcemaps**: Generated for development builds
- **Minification**: Enabled for production builds
- **Output Structure**:
  - `package/dev/`: Unminified JS, full sourcemaps, all assets
  - `package/prd/`: Minified JS, optimized assets, security headers

### Build Commands
```bash
npm run build:dev   # Development build (unminified, sourcemaps)
npm run build:prd   # Production build (minified, optimized)
```

### Critical Features Preserved from Grunt
- Asset copying (HTML, CSS, JSON, images)
- Minification and sourcemaps
- Environment-specific builds (dev/prod)
- Content Security Policy for production
- All legacy Grunt features are mapped to Webpack plugins/tasks

### Migration Notes
- All new logic should be written as `.mjs` modules
- Legacy `.js` files are still included for backward compatibility
- See `webpack.config.js` for detailed configuration

### Application Structure

1. **Core Components**
```mermaid
graph TD
    A[Entry Point: sfiapdgen.html] --> B[Core JS Bundle]
    B --> C[Data Management]
    B --> D[UI Components]
    B --> E[Event Handling]
```

2. **Source File Organization**:
- **Initialization**: 
  - `init.js`: Application bootstrap
  - `constants.js`: System constants
- **Data Layer**:
  - `dataFetching.js`: Data retrieval
  - `dataHandling.js`: Data processing
  - `jsonHandling.js`: JSON operations
- **UI Components**:
  - `checkboxHandling.js`: SFIA skill selection
  - `tableRendering.js`: Table generation
  - `exportFunctions.js`: Export capabilities
- **Core Utilities**:
  - `utilityFunctions.js`: Helper functions
  - `theme.js`: Theme management
- **Event Management**:
  - `eventListeners.js`: DOM events
  - `windowEvents.js`: Window-level events
  - `browserUpdate.js`: Browser compatibility

### External Dependencies
1. **Core Libraries**:
   - jQuery 3.7.1
   - Bootstrap 5.3.3
   - CryptoJS 4.1.1
   - Ace Editor 1.32.8

2. **Development Tools**:
   - Webpack for module bundling
   - CodeceptJS for testing
   - Grunt for build automation

## Design Patterns

### 1. Data Flow Pattern
```mermaid
graph LR
    A[JSON Source] --> B[Data Store]
    B --> C[UI Components]
    C --> D[User Interaction]
    D --> E[State Update]
    E --> C
```

### 2. Component Architecture
- **Data Components**: Handle SFIA and LoR data management
- **UI Components**: Manage user interface elements
- **Service Components**: Handle exports and data processing

### 3. State Management
- URL hash-based state persistence
- Local storage for theme preferences
- In-memory data store for runtime state

## Technical Decisions

1. **Browser Support**
   - Modern browsers (Chrome, Firefox) fully supported
   - Graceful degradation for older browsers
   - CSP headers in production for security

2. **Build Strategy**
   - Development: Concatenated files with sourcemaps
   - Production: Minified bundle with vendor dependencies
   - Separate CSS for light/dark themes

3. **Testing Approach**
   - UI Tests: CodeceptJS
   - Multiple test configurations (local, dist, production)
   - Automated test pipeline

## Integration Points

1. **External Services**
   - AI Integration (Cohere/Hugging Face)
   - Export functionality (CSV/HTML)

2. **Data Sources**
   - SFIA Framework versions (v7, v8, v9)
   - Levels of Responsibility data

## Known Technical Debt

1. **Build System**
   - Legacy Grunt configuration needs modernization
   - Potential migration to newer build tools

2. **Dependencies**
   - Some CDN dependencies could be localized
   - Version updates needed for security

3. **Code Organization**
   - Some functionality split across multiple files
   - Potential for better modularization

## Future Considerations

1. **Modernization Opportunities**
   - ES6+ module system adoption
   - Component-based architecture
   - Modern build tool migration

2. **Performance Improvements**
   - Bundle size optimization
   - Lazy loading of features
   - Caching strategies

3. **Security Enhancements**
   - CSP implementation review
   - API key management improvements
   - Input validation strengthening
