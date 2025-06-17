# Debug Configuration Plan

## Current Issues

1. Launch Configuration Issues:
- Both DEV and PRD configurations use identical settings
- No distinction between dev/prod build processes
- Same Live Server configuration for both environments
- Source maps not properly configured

2. Tasks Configuration Issues:
- Missing environment-specific build tasks
- No proper task dependencies
- Generic build task lacks environment awareness

3. Build Process Gaps:
- Grunt tasks not properly integrated with VSCode tasks
- Incorrect task ordering for debug sessions
- Environment variables not properly set

## Required Changes

### 1. launch.json Updates

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "DEV Build and Launch Edge",
      "type": "msedge",
      "request": "launch",
      "url": "http://127.0.0.1:5501/package/dev/sfiapdgen.html",
      "webRoot": "${workspaceFolder}",
      "outFiles": ["${workspaceFolder}/package/dev/*.js"],
      "preLaunchTask": "prepare-dev",
      "postDebugTask": "Stop Live Server",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/src/*"
      }
    },
    {
      "name": "DEV Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://127.0.0.1:5501/package/dev/sfiapdgen.html",
      "webRoot": "${workspaceFolder}",
      "outFiles": ["${workspaceFolder}/package/dev/*.js"],
      "preLaunchTask": "prepare-dev",
      "postDebugTask": "Stop Live Server",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/src/*"
      }
    },
    {
      "name": "PRD Launch Edge",
      "type": "msedge",
      "request": "launch",
      "url": "http://127.0.0.1:5501/package/prd/sfiapdgen.html",
      "webRoot": "${workspaceFolder}",
      "outFiles": ["${workspaceFolder}/package/prd/*.js"],
      "preLaunchTask": "prepare-prod",
      "postDebugTask": "Stop Live Server",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/src/*"
      }
    },
    {
      "name": "PRD Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://127.0.0.1:5501/package/prd/sfiapdgen.html",
      "webRoot": "${workspaceFolder}",
      "outFiles": ["${workspaceFolder}/package/prd/*.js"],
      "preLaunchTask": "prepare-prod",
      "postDebugTask": "Stop Live Server",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/src/*"
      }
    }
  ]
}
```

### 2. tasks.json Updates

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "prepare-dev",
      "dependsOn": [
        "grunt build:dev",
        "Start Live Server"
      ],
      "dependsOrder": "sequence"
    },
    {
      "label": "prepare-prod",
      "dependsOn": [
        "grunt build:prd",
        "Start Live Server"
      ],
      "dependsOrder": "sequence"
    },
    {
      "label": "grunt build:dev",
      "type": "shell",
      "command": "grunt build:dev",
      "group": "build"
    },
    {
      "label": "grunt build:prd",
      "type": "shell",
      "command": "grunt build:prd",
      "group": "build"
    },
    {
      "label": "Start Live Server",
      "type": "shell",
      "command": "npm run start-server",
      "group": "none",
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": "^$"
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "Live Server started",
          "endsPattern": "Live Server started"
        }
      }
    },
    {
      "label": "Stop Live Server",
      "type": "shell",
      "command": "npm run stop-server",
      "group": "none"
    }
  ]
}
```

## Implementation Notes

1. File Path Updates:
   - Changed debug URLs to point to correct package directories (dev/prd)
   - Updated outFiles paths to match build output locations

2. Task Dependencies:
   - Added composite tasks (prepare-dev, prepare-prod) to handle build sequence
   - Ensured proper task ordering with dependsOrder: "sequence"
   - Added isBackground for Live Server to prevent blocking

3. Source Maps:
   - Added sourceMapPathOverrides for proper source mapping
   - Configured to work with both dev and prod builds

4. Environment Awareness:
   - Distinct configurations for dev and prod environments
   - Proper integration with Grunt build tasks

## Validation Steps

1. Development Build:
   ```bash
   # Should build dev version and launch browser
   F5 with "DEV Build and Launch Edge" selected
   ```

2. Production Build:
   ```bash
   # Should build production version and launch browser
   F5 with "PRD Launch Edge" selected
   ```

3. Expected Results:
   - Dev build should show source maps in debugger
   - Prod build should use minified files
   - Both should auto-launch Live Server
   - Both should properly clean up on debug end

## Next Steps

1. Implement the changes in Code mode
2. Test both development and production configurations
3. Verify source map functionality
4. Validate Live Server integration
