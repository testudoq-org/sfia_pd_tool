// test/unit/virtualScroller.test.js
/**
 * Unit tests for VirtualScroller and computeRowData
 * Tests the virtual scrolling engine used for the SFIA skills table.
 */

// ──────────────────────────────────────────────────────────────────────
// Helpers – extract pure functions from the source so we can test them
// without a real DOM scroll container.
// ──────────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/** Read the virtualScroller.mjs source and evaluate it in a sandboxed context. */
function loadVirtualScrollerModule() {
    const filePath = path.resolve(__dirname, '../../src/modules/virtualScroller.mjs');
    let source = fs.readFileSync(filePath, 'utf8');

    // Strip ES module syntax so it runs in a CommonJS / vm context
    source = source
        .replace(/export\s+function\s+(\w+)/g, 'exports.$1 = function $1')
        .replace(/export\s+class\s+(\w+)/g, 'exports.$1 = class $1')
        .replace(/export\s+default\s+\w+;?/g, '')
        .replace(/import\s+[^;]+;?/g, '');

    const exports = {};
    const sandbox = {
        exports,
        document,
        window,
        console,
        requestAnimationFrame: (cb) => setTimeout(cb, 0),
        cancelAnimationFrame: clearTimeout,
        JSON,
        Math,
        Set,
        Object,
        Array,
        parseInt,
        setTimeout,
        clearTimeout,
    };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox);
    return sandbox.exports;
}

// ──────────────────────────────────────────────────────────────────────
// Sample SFIA JSON mimicking the real structure
// ──────────────────────────────────────────────────────────────────────
const sampleSfiaJson = {
    'Strategy and architecture': {
        'Strategy': {
            'Information strategy': {
                code: 'IRMG',
                description: 'Managing information resources',
                url: 'https://sfia-online.org/irmg',
                levels: {
                    5: 'Level 5 description',
                    6: 'Level 6 description',
                    7: 'Level 7 description',
                },
            },
        },
        'Governance': {
            'IT governance': {
                code: 'GOVN',
                description: 'IT governance desc',
                url: '',
                levels: {
                    4: 'L4',
                    5: 'L5',
                    6: 'L6',
                    7: 'L7',
                },
            },
        },
    },
    'Development and implementation': {
        'Systems development': {
            'Programming/software development': {
                code: 'PROG',
                description: 'Programming desc',
                url: 'https://sfia-online.org/prog',
                levels: {
                    2: 'L2',
                    3: 'L3',
                    4: 'L4',
                    5: 'L5',
                },
            },
            'Acceptance testing': {
                code: 'BPTS',
                description: 'Acceptance testing desc',
                url: 'https://sfia-online.org/bpts',
                levels: {
                    2: 'L2',
                    3: 'L3',
                    4: 'L4',
                    5: 'L5',
                },
            },
        },
    },
};

// ──────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────
let mod;

beforeAll(() => {
    mod = loadVirtualScrollerModule();
});

describe('computeRowData', () => {
    let rows;

    beforeEach(() => {
        rows = mod.computeRowData(sampleSfiaJson);
    });

    test('returns a flat array of row descriptors', () => {
        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length).toBe(4); // IRMG, GOVN, PROG, BPTS
    });

    test('each row has required properties', () => {
        const requiredKeys = [
            'rootKey', 'subKey', 'skillKey', 'code',
            'description', 'url', 'showRoot', 'showSub',
            'levels', 'visible',
        ];
        for (const row of rows) {
            for (const key of requiredKeys) {
                expect(row).toHaveProperty(key);
            }
        }
    });

    test('showRoot is true only for the first skill in each root category', () => {
        const rootFlags = rows.map(r => ({ root: r.rootKey, showRoot: r.showRoot }));
        // First root category: 'Strategy and architecture' appears for IRMG (true), GOVN (false)
        expect(rootFlags[0].showRoot).toBe(true);
        expect(rootFlags[1].showRoot).toBe(false);
        // Second root category: 'Development and implementation' appears for PROG (true), BPTS (false)
        expect(rootFlags[2].showRoot).toBe(true);
        expect(rootFlags[3].showRoot).toBe(false);
    });

    test('showSub is true only for the first skill in each sub category', () => {
        const subFlags = rows.map(r => ({ sub: r.subKey, showSub: r.showSub }));
        // 'Strategy' has 1 skill => true
        expect(subFlags[0].showSub).toBe(true);
        // 'Governance' has 1 skill => true
        expect(subFlags[1].showSub).toBe(true);
        // 'Systems development' has 2 skills => first true, second false
        expect(subFlags[2].showSub).toBe(true);
        expect(subFlags[3].showSub).toBe(false);
    });

    test('levels are mapped correctly with available flag', () => {
        const progRow = rows.find(r => r.code === 'PROG');
        expect(progRow).toBeDefined();
        // PROG has levels 2-5 available
        expect(progRow.levels[1].available).toBe(false);
        expect(progRow.levels[2].available).toBe(true);
        expect(progRow.levels[3].available).toBe(true);
        expect(progRow.levels[4].available).toBe(true);
        expect(progRow.levels[5].available).toBe(true);
        expect(progRow.levels[6].available).toBe(false);
        expect(progRow.levels[7].available).toBe(false);
    });

    test('all rows start with visible=true and checked=false', () => {
        for (const row of rows) {
            expect(row.visible).toBe(true);
            for (let lvl = 1; lvl <= 7; lvl++) {
                expect(row.levels[lvl].checked).toBe(false);
            }
        }
    });

    test('handles empty JSON gracefully', () => {
        const emptyRows = mod.computeRowData({});
        expect(emptyRows).toEqual([]);
    });

    test('handles missing optional properties', () => {
        const minimal = {
            Cat: {
                Sub: {
                    Skill: {
                        code: 'TEST',
                        // no description, url, or levels
                    },
                },
            },
        };
        const result = mod.computeRowData(minimal);
        expect(result.length).toBe(1);
        expect(result[0].description).toBe('');
        expect(result[0].url).toBe('');
        // All levels should be unavailable
        for (let lvl = 1; lvl <= 7; lvl++) {
            expect(result[0].levels[lvl].available).toBe(false);
        }
    });
});

describe('VirtualScroller', () => {
    let container;
    let scroller;
    let rowData;

    /** Create a mock container element with stubbed scroll properties */
    function createMockContainer() {
        const el = document.createElement('div');
        el.style.height = '400px';
        el.style.overflow = 'auto';
        document.body.appendChild(el);
        // Stub clientHeight / scrollTop
        Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
        Object.defineProperty(el, 'scrollTop', { value: 0, writable: true, configurable: true });
        return el;
    }

    beforeEach(() => {
        document.body.innerHTML = '';
        container = createMockContainer();
        rowData = mod.computeRowData(sampleSfiaJson);
    });

    afterEach(() => {
        if (scroller) scroller.destroy();
        document.body.innerHTML = '';
    });

    test('constructor builds DOM scaffolding', () => {
        scroller = new mod.VirtualScroller(container, { rowHeight: 42, buffer: 5 });
        const table = container.querySelector('table.sfia-table');
        expect(table).not.toBeNull();

        const thead = table.querySelector('thead');
        expect(thead).not.toBeNull();
        expect(thead.querySelectorAll('th').length).toBe(10); // 3 + 7 levels

        const tbody = table.querySelector('tbody#sfia-content');
        expect(tbody).not.toBeNull();
    });

    test('setRows renders rows into the tbody', () => {
        scroller = new mod.VirtualScroller(container, { rowHeight: 42, buffer: 20 });
        scroller.setRows(rowData);

        const tbody = container.querySelector('#sfia-content');
        // 4 data rows + 2 spacer rows = 6
        const trs = tbody.querySelectorAll('tr');
        expect(trs.length).toBe(6); // 4 rows + top spacer + bottom spacer
    });

    test('getRows returns underlying data', () => {
        scroller = new mod.VirtualScroller(container, { rowHeight: 42 });
        scroller.setRows(rowData);
        expect(scroller.getRows()).toBe(rowData);
    });

    test('_createRow produces correct DOM structure', () => {
        scroller = new mod.VirtualScroller(container, { rowHeight: 42, buffer: 50 });
        scroller.setRows(rowData);

        const tbody = container.querySelector('#sfia-content');
        // Pick the PROG row (3rd data row)
        const dataRows = Array.from(tbody.querySelectorAll('tr:not(.virtual-spacer)'));
        expect(dataRows.length).toBe(4);

        const progRow = dataRows[2]; // Index 2 = PROG
        expect(progRow).toBeDefined();

        // Skill name column
        const skillTd = progRow.querySelector('.skill_key');
        expect(skillTd).not.toBeNull();
        expect(skillTd.textContent).toContain('Programming/software development');
        expect(skillTd.textContent).toContain('PROG');

        // Link for PROG (has URL)
        const link = skillTd.querySelector('a.sfia-link');
        expect(link).not.toBeNull();
        expect(link.href).toContain('sfia-online.org/prog');
        expect(link.target).toBe('_blank');
    });

    test('checkboxes have correct sfia-data attributes', () => {
        scroller = new mod.VirtualScroller(container, { rowHeight: 42, buffer: 50 });
        scroller.setRows(rowData);

        const cb = container.querySelector('#sfia-checkbox-PROG-3');
        expect(cb).not.toBeNull();
        const data = JSON.parse(cb.getAttribute('sfia-data'));
        expect(data.code).toBe('PROG');
        expect(data.level).toBe(3);
        expect(data.skill).toBe('Programming/software development');
    });

    test('unavailable levels render disabled checkboxes', () => {
        scroller = new mod.VirtualScroller(container, { rowHeight: 42, buffer: 50 });
        scroller.setRows(rowData);

        // PROG level 1 is not available
        const disabledCb = container.querySelector('#sfia-checkbox-PROG-1');
        expect(disabledCb).toBeNull(); // No id for disabled checkboxes

        // Instead, check for a disabled checkbox in the level_1 td of the PROG row
        const dataRows = Array.from(container.querySelectorAll('tr:not(.virtual-spacer)'));
        const progRow = dataRows[2];
        const lvl1Td = progRow.querySelector('.level_1');
        expect(lvl1Td).not.toBeNull();
        const disabledInput = lvl1Td.querySelector('input[disabled]');
        expect(disabledInput).not.toBeNull();
    });

    describe('checkbox state management', () => {
        beforeEach(() => {
            scroller = new mod.VirtualScroller(container, { rowHeight: 42, buffer: 50 });
            scroller.setRows(rowData);
        });

        test('setChecked updates data model', () => {
            scroller.setChecked('PROG', 3, true);
            const progRow = scroller.getRows().find(r => r.code === 'PROG');
            expect(progRow.levels[3].checked).toBe(true);
        });

        test('getCheckedSelections returns all checked items', () => {
            scroller.setChecked('PROG', 3, true);
            scroller.setChecked('BPTS', 2, true);

            const selections = scroller.getCheckedSelections();
            expect(selections.length).toBe(2);
            expect(selections.find(s => s.code === 'PROG' && s.level === 3)).toBeDefined();
            expect(selections.find(s => s.code === 'BPTS' && s.level === 2)).toBeDefined();
        });

        test('clearAll resets all checked states', () => {
            scroller.setChecked('PROG', 3, true);
            scroller.setChecked('GOVN', 5, true);

            scroller.clearAll();

            const selections = scroller.getCheckedSelections();
            expect(selections.length).toBe(0);
        });

        test('setChecked with invalid code is a no-op', () => {
            scroller.setChecked('INVALID', 3, true);
            const selections = scroller.getCheckedSelections();
            expect(selections.length).toBe(0);
        });

        test('checkbox click syncs data model', () => {
            const cb = container.querySelector('#sfia-checkbox-PROG-3');
            expect(cb).not.toBeNull();

            cb.checked = true;
            cb.dispatchEvent(new Event('change'));

            const progRow = scroller.getRows().find(r => r.code === 'PROG');
            expect(progRow.levels[3].checked).toBe(true);
        });

        test('onCheckboxChange callback is called on checkbox change', () => {
            const mockCallback = jest.fn();
            scroller.onCheckboxChange = mockCallback;

            const cb = container.querySelector('#sfia-checkbox-PROG-3');
            cb.checked = true;
            cb.dispatchEvent(new Event('change'));

            expect(mockCallback).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'PROG' }),
                3,
                true
            );
        });
    });

    describe('filter', () => {
        beforeEach(() => {
            scroller = new mod.VirtualScroller(container, { rowHeight: 42, buffer: 50 });
            scroller.setRows(rowData);
        });

        test('filters rows by skill name (case-insensitive)', () => {
            const result = scroller.filter('programming');
            expect(result.visibleCount).toBe(1);
            expect(result.totalCount).toBe(4);
        });

        test('filters by skill code', () => {
            const result = scroller.filter('BPTS');
            expect(result.visibleCount).toBe(1);
        });

        test('empty query shows all rows', () => {
            scroller.filter('programming');
            const result = scroller.filter('');
            expect(result.visibleCount).toBe(4);
        });

        test('non-matching query shows zero rows', () => {
            const result = scroller.filter('xyz_no_match');
            expect(result.visibleCount).toBe(0);
            expect(result.totalCount).toBe(4);
        });

        test('filter updates DOM - only matching rows rendered', () => {
            scroller.filter('acceptance');
            const tbody = container.querySelector('#sfia-content');
            const dataRows = tbody.querySelectorAll('tr:not(.virtual-spacer)');
            expect(dataRows.length).toBe(1); // Only BPTS
            expect(dataRows[0].querySelector('.skill_key').textContent).toContain('Acceptance testing');
        });
    });

    describe('destroy', () => {
        test('removes scroll event listener', () => {
            scroller = new mod.VirtualScroller(container, { rowHeight: 42 });
            const removeListenerSpy = jest.spyOn(container, 'removeEventListener');
            scroller.destroy();
            expect(removeListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
        });
    });

    describe('spacer rows', () => {
        test('spacers have aria-hidden attribute', () => {
            scroller = new mod.VirtualScroller(container, { rowHeight: 42, buffer: 50 });
            scroller.setRows(rowData);

            const spacers = container.querySelectorAll('.virtual-spacer');
            expect(spacers.length).toBe(2);
            spacers.forEach(spacer => {
                expect(spacer.getAttribute('aria-hidden')).toBe('true');
            });
        });
    });
});
