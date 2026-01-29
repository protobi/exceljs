const colCache = require('../utils/col-cache');

/**
 * Form Control Checkbox - Legacy checkbox control compatible with Office 2007+ and WPS/LibreOffice
 *
 * Unlike the modern In-Cell Checkbox (which only works in Microsoft 365),
 * Form Control Checkboxes are floating controls that work in virtually all
 * spreadsheet applications.
 */

// ============================================================================
// Constants
// ============================================================================

/** EMU (English Metric Units) to pixels conversion factor at 96 DPI */
const EMU_PER_PIXEL = 9525;

/** EMU to points conversion factor */
const EMU_PER_POINT = 12700;

/** Default column offset in EMUs (~15 pixels) */
const DEFAULT_COL_OFF = 142875;

/** Default row offset in EMUs (~3 pixels) */
const DEFAULT_ROW_OFF = 28575;

/** Default end column offset in EMUs (~29 pixels) */
const DEFAULT_END_COL_OFF = 276225;

/** Default end row offset in EMUs (~20 pixels) */
const DEFAULT_END_ROW_OFF = 190500;

// ============================================================================
// FormCheckbox Class
// ============================================================================

class FormCheckbox {
  constructor(worksheet, range, options = {}) {
    this.worksheet = worksheet;

    // Parse range to get anchors
    const {tl, br} = this._parseRange(range);

    // Generate shape ID (starting from 1025)
    const existingCount = worksheet.formControls ? worksheet.formControls.length : 0;
    const shapeId = 1025 + existingCount;

    // Parse link cell reference
    let link;
    if (options.link) {
      // Ensure absolute reference format
      link = this._toAbsoluteRef(options.link);
    }

    // Note: ctrlPropId is set later in worksheet-xform.js prepare() for global uniqueness
    this.model = {
      shapeId,
      ctrlPropId: 0, // Placeholder, set during prepare()
      tl,
      br,
      link,
      checked: options.checked ? 'Checked' : 'Unchecked',
      text: options.text || '',
      noThreeD: options.noThreeD !== undefined ? options.noThreeD : true,
      print: options.print || false,
    };
  }

  /**
   * Get the checked state
   */
  get checked() {
    return this.model.checked === 'Checked';
  }

  /**
   * Set the checked state
   */
  set checked(value) {
    this.model.checked = value ? 'Checked' : 'Unchecked';
  }

  /**
   * Get the linked cell address
   */
  get link() {
    return this.model.link;
  }

  /**
   * Set the linked cell address
   */
  set link(value) {
    this.model.link = value ? this._toAbsoluteRef(value) : undefined;
  }

  /**
   * Get the label text
   */
  get text() {
    return this.model.text;
  }

  /**
   * Set the label text
   */
  set text(value) {
    this.model.text = value;
  }

  /**
   * Convert cell reference to absolute format (e.g., "A1" -> "$A$1")
   */
  _toAbsoluteRef(ref) {
    // If already absolute, return as-is
    if (ref.includes('$')) {
      return ref;
    }
    // Parse and convert
    const addr = colCache.decodeAddress(ref);
    return `$${colCache.n2l(addr.col)}$${addr.row}`;
  }

  /**
   * Parse range input into anchor positions
   */
  _parseRange(range) {
    let tl;
    let br;

    if (typeof range === 'string') {
      // Parse cell reference like "B2" or range like "B2:D3"
      const isRange = range.includes(':');

      if (isRange) {
        const decoded = colCache.decode(range);

        if ('top' in decoded) {
          // Treat 1-cell ranges (e.g., "J4:J4") as a single cell with default checkbox size.
          if (decoded.left === decoded.right && decoded.top === decoded.bottom) {
            const col = decoded.left - 1;
            const row = decoded.top - 1;
            tl = {
              col,
              colOff: DEFAULT_COL_OFF,
              row,
              rowOff: DEFAULT_ROW_OFF,
            };
            br = {
              col: col + 2,
              colOff: DEFAULT_END_COL_OFF,
              row: row + 1,
              rowOff: DEFAULT_END_ROW_OFF,
            };
          } else {
            // Regular range
            tl = {
              col: decoded.left - 1, // Convert to 0-based
              colOff: DEFAULT_COL_OFF,
              row: decoded.top - 1,
              rowOff: DEFAULT_ROW_OFF,
            };
            br = {
              col: decoded.right - 1,
              colOff: DEFAULT_END_COL_OFF,
              row: decoded.bottom - 1,
              rowOff: DEFAULT_END_ROW_OFF,
            };
          }
        } else {
          // Defensive fallback: if the cache returns an address, treat it like a single-cell ref.
          tl = {
            col: decoded.col - 1,
            colOff: DEFAULT_COL_OFF,
            row: decoded.row - 1,
            rowOff: DEFAULT_ROW_OFF,
          };
          br = {
            col: decoded.col + 1,
            colOff: DEFAULT_END_COL_OFF,
            row: decoded.row,
            rowOff: DEFAULT_END_ROW_OFF,
          };
        }
      } else {
        // Single cell reference - create default size checkbox
        const decoded = colCache.decodeAddress(range);
        tl = {
          col: decoded.col - 1,
          colOff: DEFAULT_COL_OFF,
          row: decoded.row - 1,
          rowOff: DEFAULT_ROW_OFF,
        };
        // Default size: about 2 columns wide, 1 row tall
        br = {
          col: decoded.col + 1,
          colOff: DEFAULT_END_COL_OFF,
          row: decoded.row,
          rowOff: DEFAULT_END_ROW_OFF,
        };
      }
    } else if ('startCol' in range) {
      // startCol/startRow/endCol/endRow format (0-based)
      tl = {
        col: range.startCol,
        colOff: range.startColOff !== undefined ? range.startColOff : DEFAULT_COL_OFF,
        row: range.startRow,
        rowOff: range.startRowOff !== undefined ? range.startRowOff : DEFAULT_ROW_OFF,
      };
      br = {
        col: range.endCol,
        colOff: range.endColOff !== undefined ? range.endColOff : DEFAULT_END_COL_OFF,
        row: range.endRow,
        rowOff: range.endRowOff !== undefined ? range.endRowOff : DEFAULT_END_ROW_OFF,
      };
    } else {
      // Object format with tl/br
      if (typeof range.tl === 'string') {
        const decoded = colCache.decodeAddress(range.tl);
        tl = {
          col: decoded.col - 1,
          colOff: DEFAULT_COL_OFF,
          row: decoded.row - 1,
          rowOff: DEFAULT_ROW_OFF,
        };
      } else {
        tl = {
          col: range.tl.col,
          colOff: range.tl.colOff !== undefined ? range.tl.colOff : DEFAULT_COL_OFF,
          row: range.tl.row,
          rowOff: range.tl.rowOff !== undefined ? range.tl.rowOff : DEFAULT_ROW_OFF,
        };
      }

      if (range.br) {
        if (typeof range.br === 'string') {
          const decoded = colCache.decodeAddress(range.br);
          br = {
            col: decoded.col - 1,
            colOff: DEFAULT_END_COL_OFF,
            row: decoded.row - 1,
            rowOff: DEFAULT_END_ROW_OFF,
          };
        } else {
          br = {
            col: range.br.col,
            colOff: range.br.colOff !== undefined ? range.br.colOff : DEFAULT_END_COL_OFF,
            row: range.br.row,
            rowOff: range.br.rowOff !== undefined ? range.br.rowOff : DEFAULT_END_ROW_OFF,
          };
        }
      } else {
        // Default size
        br = {
          col: tl.col + 2,
          colOff: DEFAULT_END_COL_OFF,
          row: tl.row + 1,
          rowOff: DEFAULT_END_ROW_OFF,
        };
      }
    }

    return {tl, br};
  }

  // =========================================================================
  // Instance methods - delegate to static methods
  // =========================================================================

  /**
   * Convert anchor to VML anchor string format
   * Format: "fromCol, fromColOff, fromRow, fromRowOff, toCol, toColOff, toRow, toRowOff"
   * VML uses pixels for offsets
   */
  getVmlAnchor() {
    return FormCheckbox.getVmlAnchor(this.model);
  }

  /**
   * Get VML style string for positioning
   */
  getVmlStyle() {
    return FormCheckbox.getVmlStyle(this.model);
  }

  /**
   * Get the numeric checked value for VML (0, 1, or 2)
   */
  getVmlCheckedValue() {
    return FormCheckbox.getVmlCheckedValue(this.model);
  }

  // =========================================================================
  // Static utility methods - can be used with FormCheckboxModel directly
  // =========================================================================

  /**
   * Convert anchor to VML anchor string format from model
   */
  static getVmlAnchor(model) {
    const {tl, br} = model;
    const tlColOff = Math.round(tl.colOff / EMU_PER_PIXEL);
    const tlRowOff = Math.round(tl.rowOff / EMU_PER_PIXEL);
    const brColOff = Math.round(br.colOff / EMU_PER_PIXEL);
    const brRowOff = Math.round(br.rowOff / EMU_PER_PIXEL);
    return `${tl.col}, ${tlColOff}, ${tl.row}, ${tlRowOff}, ${br.col}, ${brColOff}, ${br.row}, ${brRowOff}`;
  }

  /**
   * Get VML style string for positioning from model
   */
  static getVmlStyle(model) {
    const marginLeft = Math.round(model.tl.colOff / EMU_PER_POINT);
    const marginTop = Math.round(model.tl.rowOff / EMU_PER_POINT);
    return (
      `position:absolute;margin-left:${marginLeft}pt;margin-top:${marginTop}pt;` +
      'width:96pt;height:18pt;z-index:1;visibility:visible'
    );
  }

  /**
   * Get the numeric checked value for VML from model (0, 1, or 2)
   */
  static getVmlCheckedValue(model) {
    switch (model.checked) {
      case 'Checked':
        return 1;
      case 'Mixed':
        return 2;
      default:
        return 0;
    }
  }
}

module.exports = FormCheckbox;
