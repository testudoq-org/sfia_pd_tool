# Plan: Improve URL Hash Processing and Error Handling

**Objective:** Systematically improve URL hash processing to handle edge cases gracefully and provide clear user feedback, enhancing the application's robustness and user experience.

**Phase 1: Analysis and Design (Architect Mode)**

1.  **Identify URL Hash Edge Cases & Gaps:**
    *   **Review Existing Tests:** Acknowledge current coverage in `test/ui/check_combined_hash.local.test.js` for valid formats.
    *   **Brainstorm Malformed/Edge Cases:**
        *   Empty hash (`#`)
        *   Hash with only `&&` (`#&&`)
        *   SFIA part malformed:
            *   Invalid skill codes (e.g., `#INVALID-1&&AUTO-1`)
            *   Invalid skill levels (e.g., `#PROG-99&&AUTO-1`)
            *   Missing level (e.g., `#PROG-&&AUTO-1`)
            *   Missing code (e.g., `#-1&&AUTO-1`)
            *   Incorrect separators (e.g., `#PROG_1&&AUTO-1`)
        *   LoR part malformed:
            *   Invalid LoR codes (e.g., `#PROG-1&&INVA-1`)
            *   Invalid LoR levels (e.g., `#PROG-1&&AUTO-99`)
            *   Missing level (e.g., `#PROG-1&&AUTO-`)
            *   Missing code (e.g., `#PROG-1&&-1`)
            *   Incorrect separators (e.g., `#PROG-1&&AUTO_1`)
        *   Malformed structure:
            *   Missing `&&` but both parts present conceptually (e.g., `#PROG-1AUTO-1`).
            *   Extra `&&` (e.g., `#PROG-1&&AUTO-1&&COMP-2`)
            *   Unexpected characters (e.g., `#PROG-1*!@#&&AUTO-1`)
        *   Case sensitivity: Confirm if `prog-1` should be treated differently from `PROG-1`.
        *   Extremely long valid/invalid hashes.

2.  **Define Expected Behavior & User Feedback:**
    *   For each identified edge case, determine:
        *   **Parsing Strategy:** (e.g., lenient partial parsing vs. strict rejection).
        *   **Application State:** (e.g., revert to default, load valid portions).
        *   **User Message:** Specific, user-friendly error messages.
        *   **Display Location:** Non-intrusive notification area.
    *   **Console Logging:** Detailed technical error information.

3.  **Plan Code Modifications:**
    *   Target functions in `src/urlHandling.js`, `src/checkboxHandling.js` (specifically `parseSfiaCodesFromHash`).
    *   Introduce robust validation.
    *   Design error catching and communication.
    *   Consider a dedicated error/notification module.

**Phase 2: Implementation and Documentation (To be done in 💻 Code Mode)**

4.  **Implement Robust Parsing and Validation:**
    *   Modify targeted `.js` files.
    *   Use try-catch blocks and clear error signaling.

5.  **Implement User Feedback Mechanism:**
    *   Develop/enhance UI elements for error messages.
    *   Connect UI to error handling logic.

6.  **Document Error Scenarios:**
    *   Update `memory-bank/techContext.md` and/or `DEBUGGING.md`.
    *   Add JSDoc comments.

**Phase 3: Testing (To be done in 💻 Code / 🪲 Debug Mode)**

7.  **Test Edge Cases:**
    *   Manual URL construction and verification.
    *   Expand E2E tests in `test/ui/check_combined_hash.local.test.js` or new files for critical malformed hashes.
    *   Verify partial loading.

**Visual Plan (Mermaid Diagram):**

```mermaid
graph TD
    A[Start: Improve URL Hash & Error Handling] --> B{Phase 1: Analysis & Design};
    B --> B1[Identify Malformed/Edge URL Cases (Beyond current E2E tests)];
    B --> B2[Define Expected Behavior, Parsing Strategy & User Feedback];
    B --> B3[Plan Code Modifications (src/urlHandling.js, src/checkboxHandling.js)];
    B1 & B2 & B3 --> C{Phase 2: Implementation & Docs};
    C --> C1[Implement Robust Parsing & Validation Logic];
    C --> C2[Implement User Feedback UI & Logic];
    C --> C3[Document Error Scenarios & Code];
    C1 & C2 & C3 --> D{Phase 3: Testing};
    D --> D1[Manually Test All Edge Cases];
    D --> D2[Expand E2E Tests for Critical Malformed Hashes];
    D1 & D2 --> E[End: Robust URL Handling Complete];
