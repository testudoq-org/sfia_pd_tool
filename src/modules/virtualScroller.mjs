/**
 * Virtual Scroller for SFIA Table
 *
 * Renders only the rows visible in the viewport (plus a configurable buffer),
 * eliminating the performance cost of having hundreds of DOM rows while keeping
 * search, checkbox state, and URL-hash integration intact.
 *
 * Usage:
 *   const vs = new VirtualScroller(containerEl, { rowHeight: 42, buffer: 10 });
 *   vs.setRows(rowDataArray);          // pre-computed row data
 *   vs.onCheckboxChange = (row) => {}; // callback for checkbox clicks
 */

/* ── Constants ──────────────────────────────────────────────────────── */
const DEFAULT_ROW_HEIGHT = 42;
const DEFAULT_BUFFER = 10;
const SFIA_LEVELS = [1, 2, 3, 4, 5, 6, 7];

/* ── Helpers ────────────────────────────────────────────────────────── */

/**
 * Pre-compute a flat array of row data objects from the SFIA JSON.
 * Each object contains everything needed to render one `<tr>`.
 *
 * @param {Object} sfiaJson - Nested SFIA JSON data
 * @returns {Array<Object>} Flat array of row descriptors
 */
export function computeRowData(sfiaJson) {
    const rows = [];
    const seenRoots = new Set();
    const seenSubs = new Set();

    for (const rootKey in sfiaJson) {
        for (const subKey in sfiaJson[rootKey]) {
            for (const skillKey in sfiaJson[rootKey][subKey]) {
                const skillObj = sfiaJson[rootKey][subKey][skillKey];
                const code = skillObj.code || '';
                const description = skillObj.description || '';
                const url = skillObj.url || '';
                const levels = skillObj.levels || {};

                const showRoot = !seenRoots.has(rootKey);
                const showSub = !seenSubs.has(subKey);
                if (showRoot) seenRoots.add(rootKey);
                if (showSub) seenSubs.add(subKey);

                // Level availability and checked state
                const levelData = {};
                for (const lvl of SFIA_LEVELS) {
                    levelData[lvl] = {
                        available: Object.prototype.hasOwnProperty.call(levels, lvl),
                        description: levels[lvl] || '',
                        checked: false,
                    };
                }

                rows.push({
                    rootKey,
                    subKey,
                    skillKey,
                    code,
                    description,
                    url,
                    showRoot,
                    showSub,
                    levels: levelData,
                    visible: true, // for search filtering
                });
            }
        }
    }
    return rows;
}

/**
 * Build the sfia-data JSON attribute value for a checkbox.
 */
function sfiaDataAttr(row, level) {
    return JSON.stringify({
        category: row.rootKey,
        subCategory: row.subKey,
        skill: row.skillKey,
        level,
        code: row.code,
    });
}

/* ── VirtualScroller Class ──────────────────────────────────────────── */

export class VirtualScroller {
    /**
     * @param {HTMLElement} container - The scroll container element (e.g. table wrapper)
     * @param {Object} [options]
     * @param {number} [options.rowHeight=42] - Estimated row height in px
     * @param {number} [options.buffer=10]    - Extra rows above/below viewport
     */
    constructor(container, options = {}) {
        this.container = container;
        this.rowHeight = options.rowHeight || DEFAULT_ROW_HEIGHT;
        this.buffer = options.buffer || DEFAULT_BUFFER;

        /** @type {Array<Object>} Full data set */
        this._allRows = [];
        /** @type {Array<Object>} Filtered (visible) rows only */
        this._visibleRows = [];

        /** Currently rendered range */
        this._startIdx = 0;
        this._endIdx = 0;

        /** DOM references */
        this._topSpacer = null;
        this._bottomSpacer = null;
        this._tbody = null;

        /** External callback for checkbox changes */
        this.onCheckboxChange = null;

        /** Bound handler for cleanup */
        this._handleScroll = this._onScroll.bind(this);
        this._rafId = null;

        this._buildDOM();
        this.container.addEventListener('scroll', this._handleScroll, { passive: true });
    }

    /* ── DOM scaffolding ───────────────────────────────────────────── */

    _buildDOM() {
        // Clear container
        this.container.innerHTML = '';
        this.container.classList.add('virtual-scroll-container');

        // Create a wrapper table inside the container
        const table = document.createElement('table');
        table.className = 'sfia-table table-hover w-100';

        // Caption
        const caption = document.createElement('caption');
        caption.textContent = 'SFIA Information Table';
        table.appendChild(caption);

        // <thead>
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Category', 'Sub Category', 'Skill Set', '1', '2', '3', '4', '5', '6', '7'].forEach(text => {
            const th = document.createElement('th');
            th.scope = 'col';
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Top spacer (emulates rows above the viewport)
        this._topSpacer = document.createElement('tr');
        this._topSpacer.className = 'virtual-spacer';
        this._topSpacer.setAttribute('aria-hidden', 'true');

        // <tbody id="sfia-content"> — matches existing selector used elsewhere
        this._tbody = document.createElement('tbody');
        this._tbody.id = 'sfia-content';
        this._tbody.className = 'align-middle';
        this._tbody.appendChild(this._topSpacer);

        // Bottom spacer
        this._bottomSpacer = document.createElement('tr');
        this._bottomSpacer.className = 'virtual-spacer';
        this._bottomSpacer.setAttribute('aria-hidden', 'true');
        this._tbody.appendChild(this._bottomSpacer);

        table.appendChild(this._tbody);
        this.container.appendChild(table);
    }

    /* ── Public API ────────────────────────────────────────────────── */

    /**
     * Set (or replace) the full row data set and render.
     * @param {Array<Object>} rows - Output of computeRowData()
     */
    setRows(rows) {
        this._allRows = rows;
        this._refreshVisibleRows();
        this._render();
    }

    /**
     * Return the underlying row data (useful for external access).
     */
    getRows() {
        return this._allRows;
    }

    /**
     * Apply a search filter. Rows whose skillKey does not match are hidden.
     * @param {string} query - Search string (case-insensitive)
     * @returns {{ visibleCount: number, totalCount: number }}
     */
    filter(query) {
        const upper = (query || '').toUpperCase();
        for (const row of this._allRows) {
            if (!upper) {
                row.visible = true;
            } else {
                const text = `${row.skillKey} ${row.code}`.toUpperCase();
                row.visible = text.includes(upper);
            }
        }
        this._refreshVisibleRows();
        this._render();
        return {
            visibleCount: this._visibleRows.length,
            totalCount: this._allRows.length,
        };
    }

    /**
     * Update checkbox checked state from an external source (e.g. URL hash).
     * @param {string} code  - Skill code
     * @param {number} level - Level number (1-7)
     * @param {boolean} checked
     */
    setChecked(code, level, checked) {
        const row = this._allRows.find(r => r.code === code);
        if (row && row.levels[level]) {
            row.levels[level].checked = checked;
        }
    }

    /**
     * Return all checked selections as an array of { code, level, row } objects.
     */
    getCheckedSelections() {
        const selections = [];
        for (const row of this._allRows) {
            for (const lvl of SFIA_LEVELS) {
                if (row.levels[lvl] && row.levels[lvl].checked) {
                    selections.push({ code: row.code, level: lvl, row });
                }
            }
        }
        return selections;
    }

    /**
     * Clear all checkbox selections.
     */
    clearAll() {
        for (const row of this._allRows) {
            for (const lvl of SFIA_LEVELS) {
                if (row.levels[lvl]) {
                    row.levels[lvl].checked = false;
                }
            }
        }
        this._render();
    }

    /**
     * Clean up event listeners.
     */
    destroy() {
        this.container.removeEventListener('scroll', this._handleScroll);
        if (this._rafId) cancelAnimationFrame(this._rafId);
    }

    /* ── Internal methods ──────────────────────────────────────────── */

    _refreshVisibleRows() {
        this._visibleRows = this._allRows.filter(r => r.visible);
    }

    _onScroll() {
        if (this._rafId) return;
        this._rafId = requestAnimationFrame(() => {
            this._rafId = null;
            this._render();
        });
    }

    _render() {
        const rows = this._visibleRows;
        const scrollTop = this.container.scrollTop;
        const viewHeight = this.container.clientHeight;

        // Compute visible range
        let start = Math.floor(scrollTop / this.rowHeight) - this.buffer;
        let end = Math.ceil((scrollTop + viewHeight) / this.rowHeight) + this.buffer;
        start = Math.max(0, start);
        end = Math.min(rows.length, end);

        // Skip re-render if range hasn't changed
        if (start === this._startIdx && end === this._endIdx) return;
        this._startIdx = start;
        this._endIdx = end;

        // Remove old rendered rows (everything between spacers)
        const tbody = this._tbody;
        while (tbody.children.length > 2) {
            // Keep first (top spacer) and last (bottom spacer)
            tbody.removeChild(tbody.children[1]);
        }

        // Set spacer heights
        const topSpacerCell = this._topSpacer.cells[0] || this._topSpacer.insertCell(0);
        topSpacerCell.colSpan = 10;
        topSpacerCell.style.height = `${start * this.rowHeight}px`;
        topSpacerCell.style.padding = '0';
        topSpacerCell.style.border = 'none';

        const bottomSpacerCell = this._bottomSpacer.cells[0] || this._bottomSpacer.insertCell(0);
        bottomSpacerCell.colSpan = 10;
        bottomSpacerCell.style.height = `${Math.max(0, (rows.length - end) * this.rowHeight)}px`;
        bottomSpacerCell.style.padding = '0';
        bottomSpacerCell.style.border = 'none';

        // Render visible rows
        const fragment = document.createDocumentFragment();
        for (let i = start; i < end; i++) {
            fragment.appendChild(this._createRow(rows[i]));
        }
        tbody.insertBefore(fragment, this._bottomSpacer);
    }

    /**
     * Create a `<tr>` element for a single row descriptor.
     */
    _createRow(row) {
        const tr = document.createElement('tr');
        tr.className = row.rootKey.trim().replace(/ /g, '_').toLowerCase();

        // Category
        const col1 = document.createElement('td');
        col1.className = 'root_key';
        if (row.showRoot) col1.textContent = row.rootKey;
        tr.appendChild(col1);

        // Subcategory
        const col2 = document.createElement('td');
        col2.className = 'sub_key';
        if (row.showSub) col2.textContent = row.subKey;
        tr.appendChild(col2);

        // Skill name
        const col3 = document.createElement('td');
        col3.className = 'skill_key';
        const skillSpan = document.createElement('span');
        skillSpan.title = row.description;
        skillSpan.appendChild(document.createTextNode(`${row.skillKey} - `));
        if (row.url) {
            const a = document.createElement('a');
            a.href = row.url;
            a.textContent = row.code;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'sfia-link text-primary';
            skillSpan.appendChild(a);
        } else {
            skillSpan.appendChild(document.createTextNode(row.code));
        }
        col3.appendChild(skillSpan);
        tr.appendChild(col3);

        // Level checkboxes (1-7)
        for (const lvl of SFIA_LEVELS) {
            const td = document.createElement('td');
            td.className = `level_${lvl}`;
            const ld = row.levels[lvl];
            if (ld && ld.available) {
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.id = `sfia-checkbox-${row.code}-${lvl}`;
                cb.value = `${row.code}-${lvl}`;
                cb.title = ld.description;
                cb.checked = ld.checked;
                cb.setAttribute('sfia-data', sfiaDataAttr(row, lvl));

                // Sync state on change
                cb.addEventListener('change', () => {
                    ld.checked = cb.checked;
                    if (typeof this.onCheckboxChange === 'function') {
                        this.onCheckboxChange(row, lvl, cb.checked);
                    }
                });

                td.appendChild(cb);
                td.classList.add('select_col');
            } else {
                const disabledCb = document.createElement('input');
                disabledCb.type = 'checkbox';
                disabledCb.disabled = true;
                td.appendChild(disabledCb);
                td.classList.add('no_select_col');
            }
            td.classList.add('col-checkbox');
            tr.appendChild(td);
        }

        return tr;
    }
}

/* ── Exports ────────────────────────────────────────────────────────── */
export default VirtualScroller;
