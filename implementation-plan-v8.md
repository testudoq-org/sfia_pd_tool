# Updated SFIA v8 Implementation Plan

## Overview
This plan outlines the steps to make SFIA version 8 the default framework version without causing regressions to existing functionality. The changes address:  
1. Ensuring jQuery/Bootstrap collapse functionality works correctly.  
2. Handling protocol-specific UI elements (version selector and local JSON button).  
3. Improving version handling/fallback in data fetching.  
4. Maintaining backwards compatibility with previous SFIA versions.

--------------------------------------------------------------------------------

## Objectives

• Default to SFIA v8 on first load (no cookie).  
• Only show the version selector over HTTP/HTTPS, hiding it for file:// protocol.  
• Provide a Local JSON load button only for file:// protocol.  
• Validate and fallback to v8 if an invalid version is selected.  
• Continue supporting older versions if necessary (e.g., v7).  
• Resolve any jQuery or Bootstrap errors related to .collapse().

--------------------------------------------------------------------------------

## Planned Changes

1. Fix jQuery/Bootstrap .collapse() Error  
   - Check for jQuery availability before calling .collapse()  
   - Wrap the collapse call in a small delay (setTimeout) to ensure the DOM and Bootstrap’s JS are ready  
   - Provide a fallback to show instructions if collapse fails

2. UI Behavior and Protocol Handling (init.js)
   - Show the SFIA version selector for HTTP/HTTPS only  
   - Hide the SFIA version selector for file:// protocol  
   - Hide the local JSON load button for HTTP/HTTPS protocol, show for file:// protocol  
   - Initialize content accordingly so file:// always defaults to v8

3. Data Fetching and Version Handling (dataFetching.js)
   - Always fallback to SFIA v8 if no cookie or invalid version is specified  
   - If a version fails to load, attempt v8 as a fallback  
   - Remove or consolidate redundant version-handling functions  
   - Ensure clean error reporting and logging

4. Maintain Compatibility
   - Existing references to older SFIA JSON files (e.g., v7) should continue to work  
   - If the user has a previously set cookie for an older version, load it, or fallback to v8 if errors occur

--------------------------------------------------------------------------------

## File-by-File Implementation

1. src/init.js
   - document.addEventListener('DOMContentLoaded'): 
     • Validate jQuery presence  
     • Attempt to show instructions with .collapse(), fallback if errors  
     • Call initializeVersionSelection()  
     • Call initializeContent()  

   - function initializeVersionSelection():  
     • Detect protocol → if file:// then hide version selector, show local JSON button  
     • Else → show version selector, hide local JSON button, read cookie preference, default to v8 if none found  
     • Listen for selection changes and set cookie accordingly  
     • Reload the relevant JSON data

2. src/dataFetching.js
   - function fetchSelectedVersionData(dropdownValue):  
     • Default to v8 if no version or if file:// protocol is used  
     • Validate version format (json_source_v7, json_source_v8, json_source_v9, etc.)  
     • Attempt to fetch JSON → if it fails, fallback to v8 if not already on v8  
     • Throw error if fallback also fails  

   - Remove or consolidate redundant version-handling code (e.g., setDropdownValue, setStoredVersionToCookie) to avoid conflicts with init.js

3. src/sfiapdgen.html (or sfiapdgen.html in dist if relevant)
   - Minimal or no changes required if the markup is already set for protocol-based logic. Possibly ensure the #instructions and #jsonVersionSelect elements are present.

4. src/loadLocalJson.js (if used for additional local JSON functionality)
   - Ensure it is only invoked for file:// protocol  
   - Provide explicit error messages and confirm success/failure to user  

--------------------------------------------------------------------------------

## Testing Strategy

1. Fresh Load (No Cookie)
   - Confirm default is SFIA v8  
   - Protocol file:// → hide version selector, show local JSON button  
   - Protocol HTTP/HTTPS → show version selector, hide local JSON button  

2. Switching Versions (HTTP/HTTPS)
   - Confirm user can switch to older versions (e.g., v7) or v9 if available  
   - Cookie should store user preference  
   - If an invalid version is chosen, fallback to v8  

3. Local JSON (file://)
   - Confirm local JSON file selection loads custom data  
   - Verify no other version selector is displayed  

4. jQuery/Bootstrap .collapse  
   - Confirm instructions are displayed on page load, with no errors in the console  
   - Confirm fallback trigger if collapse fails  

5. Error Handling  
   - Force network or JSON parse errors to confirm fallback to v8  
   - Check logs and notifications for user-friendly messages

--------------------------------------------------------------------------------

## Rollback Plan
In the event these changes cause regressions:  
• Revert to the previous stable commit in Git  
• Perform a more granular set of tests and debugging  
• Re-apply the changes incrementally

--------------------------------------------------------------------------------

## Conclusion
By following this plan, SFIA v8 becomes the reliable default framework version. We ensure local JSON loading is possible for file://, preserve older version functionality, and fix jQuery/Bootstrap collapse issues without introducing regressions.
