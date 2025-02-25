# Build Pipeline Analysis

## Development vs Production Build Comparison

### Common Tasks
Both development and production builds share these base tasks:
1. Clean (`clean` task)
   - Clears respective output directories (dev/prd)
2. Copy (`copy` task)
   - Copies HTML, CSS, JSON, and ICO files
   - Copies JavaScript files (excluding .min files)
3. Concatenation (`concat` task)
   - Combines multiple JS source files in this order:
     - init.js
     - theme.js
     - constants.js
     - browserUpdate.js
     - dataFetching.js
     - exportFunctions.js
     - checkboxHandling.js
     - initializeContent.js
     - tableRendering.js
     - dataHandling.js
     - utilityFunctions.js
     - jsonHandling.js
     - urlHandling.js
     - eventListeners.js
     - windowEvents.js
4. String Replace (`string-replace` task)
   - Updates file references in HTML

### Key Differences

#### Development Build (`build:dev`)
- Includes source maps (inline style)
- No minification
- No security headers
- Keeps original JS filename (sfiapdgen_func.js)
- Supports watch task for auto-rebuilding

#### Production Build (`build:prd`)
- Adds minification via uglify
- Removes console logs and debugger statements
- Adds security headers (CSP, X-Frame-Options, etc.)
- Uses minified JS filename (sfiapdgen_func.min.js)
- No source maps

## Current Production Issues

### Content Security Policy (CSP) Concerns
1. Bootstrap CSS loading blocked
2. Inline styles blocked
3. Inline scripts blocked
4. jQuery not loading
5. X-Frame-Options meta tag implementation

### Proposed Solutions

#### 1. CSP Header Modifications
Current CSP is too restrictive. Recommend updating the CSP meta tag to:
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    img-src 'self' data:">
```

#### 2. X-Frame-Options
Remove from meta tag and implement via server headers instead:
```
X-Frame-Options: DENY
```

#### 3. Build Optimization Recommendations
1. Modify uglify configuration:
```javascript
uglify: {
    options: {
        compress: {
            drop_console: true,
            drop_debugger: true,
            passes: 1,  // Reduce passes for faster builds
            unsafe: false  // Avoid aggressive optimizations
        },
        mangle: {
            keep_fnames: true  // Preserve function names for better debugging
        },
        output: {
            comments: false
        }
    }
}
```

2. Bundle Dependencies:
   - Consider bundling Bootstrap and jQuery locally instead of CDN
   - Reduces CSP complexity
   - Improves load reliability

3. Inline Style Management:
   - Move inline styles to external CSS files
   - Alternatively, use CSP nonces for critical inline styles

## Task Dependencies and Order

### Development Build Order
1. clean:dev
2. copy:dev
3. concat:dev
4. string-replace:dev

### Production Build Order
1. clean:prd
2. copy:prd
3. concat:prd
4. uglify:prd
5. string-replace:prd

## Testing Integration
- Local testing: `grunt testLocal`
- Distribution testing: `grunt testDist`
- Production testing: `grunt testProduction`
- Specific file testing: `grunt testSpecificFile`

## Implementation Instructions

### 1. Update Gruntfile.js
Replace the string-replace:prd configuration with:
```javascript
prd: {
    files: {
        'package/prd/sfiapdgen.html': 'package/prd/sfiapdgen.html'
    },
    options: {
        replacements: [
            {
                pattern: 'sfiapdgen_func.js',
                replacement: 'sfiapdgen_func.min.js'
            },
            {
                pattern: '<head>',
                replacement: '<head>\n' +
                    '    <meta http-equiv="Content-Security-Policy" content="default-src \'self\'; ' +
                    'style-src \'self\' \'unsafe-inline\' https://cdn.jsdelivr.net; ' +
                    'script-src \'self\' \'unsafe-inline\' https://cdn.jsdelivr.net; ' +
                    'img-src \'self\' data:">\n'
            }
        ]
    }
}
```

### 2. External Dependencies Management
1. Create vendor directory:
   ```bash
   mkdir -p src/vendor
   ```

2. Download required dependencies locally:
   ```bash
   curl -o src/vendor/bootstrap.min.css https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css
   curl -o src/vendor/jquery.min.js https://code.jquery.com/jquery-3.7.1.min.js
   ```

3. Update copy task to include vendor files:
   ```javascript
   copy: {
       prd: {
           files: [
               // ... existing files ...
               {
                   expand: true,
                   cwd: 'src/vendor',
                   src: ['*.css', '*.js'],
                   dest: 'package/prd/vendor/',
                   filter: 'isFile'
               }
           ]
       }
   }
   ```

### 3. Update HTML References
Replace CDN references with local files in sfiapdgen.html:
```html
<!-- Replace Bootstrap CDN -->
<link rel="stylesheet" href="vendor/bootstrap.min.css">
<!-- Add jQuery before your scripts -->
<script src="vendor/jquery.min.js"></script>
```

### 4. Testing Steps
1. Build development version:
   ```bash
   grunt build:dev
   ```

2. Build production version:
   ```bash
   grunt build:prd
   ```

3. Run test suite:
   ```bash
   grunt testLocal
   grunt testProduction
   ```

4. Verify in browser:
   - Check all styles are applied
   - Confirm jQuery functionality
   - Validate CSP in browser console

## Next Steps

1. Implement suggested CSP modifications
2. Move external dependencies to local bundles
3. Refactor inline styles into external CSS
4. Update build process to include new optimizations
5. Verify changes with full test suite

## Additional Notes
- Watch task available for development (debounceDelay: 3000ms)
- Debug task provides enhanced logging
- Legacy 'build' task defaults to development build
- Delayed build task available with 1-second timeout
