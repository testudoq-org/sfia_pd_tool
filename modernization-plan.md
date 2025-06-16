# Grunt Build Modernization Plan

## Current Structure
- Existing build task combines clean, copy, string-replace, and concat
- Test tasks for local, dist, and production environments
- File watching capability for development

## Planned Changes

### 1. New Dependencies
- Add `grunt-contrib-uglify` for JavaScript minification

### 2. Build Task Updates

#### build:dev task
- Concatenates JavaScript files into `package/dev/sfiapdgen_func.js`.
- Includes copying assets, and string replacement for development.
- Preserves source readability for development (includes source maps as per `Gruntfile.js`).
- Task sequence (as per `Gruntfile.js`):
  1. `clean:dev`
  2. `copy:dev`
  3. `concat:dev`
  4. `string-replace:dev`

#### build:prd task
- Creates production-ready distribution in `package/prd/`.
- Minifies JavaScript to `package/prd/sfiapdgen_func.min.js` and updates references.
- Task sequence (as per `Gruntfile.js`):
  1. `clean:prd`
  2. `copy:prd`
  3. `concat:prd`
  4. `uglify:prd`
  5. `string-replace:prd`

### 3. Configuration Changes

#### New Uglify Configuration
```javascript
uglify: {
    prd: { // Align with Gruntfile.js task target
        files: {
            'package/prd/sfiapdgen_func.min.js': ['package/prd/sfiapdgen_func.js']
        }
    }
}
```

#### Updated String Replace
```javascript
'string-replace': {
    prd: { // Align with Gruntfile.js task target
        files: {
            'package/prd/sfiapdgen.html': 'package/prd/sfiapdgen.html'
        },
        options: {
            replacements: [{
                pattern: 'sfiapdgen_func.js',
                replacement: 'sfiapdgen_func.min.js'
                // Note: Gruntfile.js also includes CSP header replacements here for prd
            }]
        }
    }
}
```

### 4. New Task Definitions
```javascript
// Actual tasks from Gruntfile.js are:
// grunt.registerTask('build:dev', ['clean:dev', 'copy:dev', 'concat:dev', 'string-replace:dev']);
// grunt.registerTask('build:prd', ['clean:prd', 'copy:prd', 'concat:prd', 'uglify:prd', 'string-replace:prd']);
// This document describes the modernization plan which led to these tasks.
// The plan's conceptual 'build:src' aligns with 'build:dev' but 'build:dev' is more comprehensive.
// The plan's conceptual 'build:dist' aligns with 'build:prd'.
```

## Benefits
1. Clearer separation between development and production builds
2. Optimized production code through minification
3. Maintained test infrastructure
4. Improved build process organization

## Implementation Steps
1. Install new dependency
2. Update Gruntfile.js with new configurations
3. Test both build processes
4. Verify file references and minification
5. Ensure all tests continue to pass

## Testing Plan
1. Test `build:dev`
   - Verify `package/dev/sfiapdgen_func.js` is properly concatenated.
   - Check source readability and inline sourcemaps.
   - Run local tests (e.g., `grunt testLocal` which uses `package/dev`).

2. Test `build:prd`
   - Verify minification to `package/prd/sfiapdgen_func.min.js`.
   - Check HTML references in `package/prd/sfiapdgen.html`.
   - Ensure all assets are correctly copied to `package/prd`.
   - Run production tests (e.g., `grunt testProduction` which uses `package/prd`).
