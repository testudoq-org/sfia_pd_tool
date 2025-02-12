# Grunt Build Modernization Plan

## Current Structure
- Existing build task combines clean, copy, string-replace, and concat
- Test tasks for local, dist, and production environments
- File watching capability for development

## Planned Changes

### 1. New Dependencies
- Add `grunt-contrib-uglify` for JavaScript minification

### 2. Build Task Updates

#### src build task
- Will only concatenate JavaScript files into sfiapdgen_func.js
- Preserves source readability for development
- Task sequence:
  1. concat (existing configuration)

#### dist build task
- Creates production-ready distribution
- Minifies JavaScript and updates references
- Task sequence:
  1. clean (existing)
  2. copy (existing)
  3. uglify (new)
  4. string-replace (modified)

### 3. Configuration Changes

#### New Uglify Configuration
```javascript
uglify: {
    dist: {
        files: {
            'dist/sfiapdgen_func.min.js': ['dist/sfiapdgen_func.js']
        }
    }
}
```

#### Updated String Replace
```javascript
'string-replace': {
    dist: {
        files: {
            'dist/sfiapdgen.html': 'dist/sfiapdgen.html'
        },
        options: {
            replacements: [{
                pattern: 'sfiapdgen_func.js',
                replacement: 'sfiapdgen_func.min.js'
            }]
        }
    }
}
```

### 4. New Task Definitions
```javascript
grunt.registerTask('build:src', ['concat']);
grunt.registerTask('build:dist', ['clean', 'copy', 'uglify', 'string-replace']);
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
1. Test src build
   - Verify sfiapdgen_func.js is properly concatenated
   - Check source readability
   - Run local tests

2. Test dist build
   - Verify minification
   - Check HTML references
   - Ensure all files are copied correctly
   - Run dist tests
