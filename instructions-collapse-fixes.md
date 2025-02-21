# Instructions Collapse Component Fixes

## Current Issues
1. Button is missing `collapsed` class for proper initial state styling
2. Instructions div has correct collapse functionality but could use clearer initial state

## Required Changes

### 1. Toggle Button
Current:
```html
<button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#instructions"
aria-expanded="false" aria-controls="instructions">
```

Should be:
```html
<button class="btn btn-primary collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#instructions"
aria-expanded="false" aria-controls="instructions">
```

### 2. Instructions Content Div
Current:
```html
<div class="card-body collapse" id="instructions">
```

This is technically correct as the `collapse` class will hide the content by default, but we should ensure it's consistent with Bootstrap's collapse pattern.

## Implementation Plan
1. Switch to Code mode to implement these changes
2. Add `collapsed` class to the toggle button
3. Test collapse functionality:
   - Verify instructions are hidden by default
   - Button shows proper collapsed/expanded state
   - Instructions div shows/hides correctly on toggle
   - ARIA attributes update correctly

## Bootstrap Collapse Behavior
- When collapsed:
  * Button has `collapsed` class
  * Button has `aria-expanded="false"`
  * Content div has just `collapse` class
- When expanded:
  * Button loses `collapsed` class
  * Button has `aria-expanded="true"`
  * Content div has `collapse show` classes

## Testing Steps
1. Initial state:
   - Instructions section should be hidden
   - Button should show collapsed state
   - ARIA expanded should be false
2. Click button:
   - Instructions section should smoothly expand
   - Button should update styling
   - ARIA expanded should become true
3. Click again:
   - Should return to initial state
