const DevModeOverlay = {
  highlightBox: null,
  inspectPanel: null,
  redlinesContainer: null,
  selectedElement: null,
  hoveredElement: null,
  isDevModeOn: false,

  init() {
    this.createHighlightBox();
    this.createRedlinesContainer();
    this.createInspectPanel();
    this._scrollHandler = this.onScroll.bind(this);
    window.addEventListener('scroll', this._scrollHandler, true);
    window.addEventListener('resize', this._scrollHandler, true);
  },

  onScroll() {
    if (this.selectedElement) {
      this.positionHighlight(this.selectedElement);
      this.showRedlines(this.selectedElement);
    } else if (this.hoveredElement && this.isDevModeOn) {
      this.positionHighlight(this.hoveredElement);
    }
  },

  createHighlightBox() {
    this.highlightBox = document.createElement('div');
    this.highlightBox.id = 'dev-mode-highlight-box';
    this.highlightBox.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #22c55e;background:rgba(34,197,94,0.1);display:none;';
    document.documentElement.appendChild(this.highlightBox);
  },

  createRedlinesContainer() {
    this.redlinesContainer = document.createElement('div');
    this.redlinesContainer.id = 'dev-mode-redlines';
    this.redlinesContainer.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483645;top:0;left:0;width:100%;height:100%;display:none;overflow:hidden;';
    document.documentElement.appendChild(this.redlinesContainer);
  },

  createInspectPanel() {
    this.inspectPanel = document.createElement('div');
    this.inspectPanel.id = 'dev-mode-inspect-panel';
    this.inspectPanel.innerHTML = this.getPanelHTML();
    document.documentElement.appendChild(this.inspectPanel);

    var self = this;
    setTimeout(function() {
      var closeBtn = document.getElementById('dev-mode-panel-close');
      var copyBtn = document.getElementById('dev-mode-copy-css');
      if (closeBtn) closeBtn.addEventListener('click', function() { self.clearSelection(); });
      if (copyBtn) copyBtn.addEventListener('click', function() { self.copyCSS(); });
    }, 50);
  },

  getPanelHTML() {
    return '<div class="panel-header"><h2>LVDM Inspector</h2><button class="panel-close" id="dev-mode-panel-close">\u00d7</button></div><div class="panel-content" id="dev-mode-panel-content"><p class="panel-placeholder">Click an element to inspect it</p></div><div class="panel-actions"><button class="copy-css-btn" id="dev-mode-copy-css">Copy CSS</button></div>';
  },

  positionHighlight(element) {
    var rect = element.getBoundingClientRect();
    this.highlightBox.style.left = (rect.left - 2) + 'px';
    this.highlightBox.style.top = (rect.top - 2) + 'px';
    this.highlightBox.style.width = rect.width + 'px';
    this.highlightBox.style.height = rect.height + 'px';
    this.highlightBox.style.display = 'block';
  },

  showHighlight(element) {
    if (!element || !this.isDevModeOn) return;
    this.hoveredElement = element;
    this.highlightBox.style.border = '2px solid #22c55e';
    this.highlightBox.style.background = 'rgba(34, 197, 94, 0.1)';
    this.positionHighlight(element);
  },

  hideHighlight() {
    if (this.highlightBox) {
      this.highlightBox.style.display = 'none';
    }
    this.hoveredElement = null;
  },

  showRedlines(element) {
    if (!element || !this.isDevModeOn) return;
    this.redlinesContainer.innerHTML = '';

    var data = window.DevModeUtils ? window.DevModeUtils.getSiblingDistances(element) : null;
    if (!data || !data.gaps) {
      this.redlinesContainer.style.display = 'block';
      return;
    }

    for (var i = 0; i < data.gaps.length; i++) {
      var gap = data.gaps[i];
      this.drawGapRedline(gap);
    }

    if (data.parentGap && data.parentGap !== 'normal' && data.parentGap !== '0px') {
      this.drawParentGapIndicator(element, data);
    }

    this.redlinesContainer.style.display = 'block';
  },

  drawGapRedline(gap) {
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;pointer-events:none;';

    if (gap.type === 'horizontal') {
      var midY = gap.y + gap.length / 2;

      var line = document.createElement('div');
      line.style.cssText = 'position:absolute;left:' + gap.x + 'px;top:' + midY + 'px;width:' + gap.value + 'px;height:1px;background:#ef4444;pointer-events:none;';
      wrapper.appendChild(line);

      var tickLeft = document.createElement('div');
      tickLeft.style.cssText = 'position:absolute;left:' + gap.x + 'px;top:' + (midY - 6) + 'px;width:1px;height:13px;background:#ef4444;pointer-events:none;';
      wrapper.appendChild(tickLeft);

      var tickRight = document.createElement('div');
      tickRight.style.cssText = 'position:absolute;left:' + (gap.x + gap.value) + 'px;top:' + (midY - 6) + 'px;width:1px;height:13px;background:#ef4444;pointer-events:none;';
      wrapper.appendChild(tickRight);

      var label = document.createElement('div');
      label.style.cssText = 'position:absolute;left:' + (gap.x + gap.value / 2 - 16) + 'px;top:' + (midY - 20) + 'px;color:#fff;font-size:11px;font-weight:600;white-space:nowrap;background:#ef4444;padding:2px 6px;border-radius:3px;font-family:monospace;pointer-events:none;transform:translateX(-50%);left:' + (gap.x + gap.value / 2) + 'px;';
      label.textContent = gap.value + 'px';
      wrapper.appendChild(label);

    } else {
      var midX = gap.x + gap.length / 2;

      var line = document.createElement('div');
      line.style.cssText = 'position:absolute;left:' + midX + 'px;top:' + gap.y + 'px;width:1px;height:' + gap.value + 'px;background:#ef4444;pointer-events:none;';
      wrapper.appendChild(line);

      var tickTop = document.createElement('div');
      tickTop.style.cssText = 'position:absolute;left:' + (midX - 6) + 'px;top:' + gap.y + 'px;width:13px;height:1px;background:#ef4444;pointer-events:none;';
      wrapper.appendChild(tickTop);

      var tickBottom = document.createElement('div');
      tickBottom.style.cssText = 'position:absolute;left:' + (midX - 6) + 'px;top:' + (gap.y + gap.value) + 'px;width:13px;height:1px;background:#ef4444;pointer-events:none;';
      wrapper.appendChild(tickBottom);

      var label = document.createElement('div');
      label.style.cssText = 'position:absolute;left:' + (midX + 8) + 'px;top:' + (gap.y + gap.value / 2 - 10) + 'px;color:#fff;font-size:11px;font-weight:600;white-space:nowrap;background:#ef4444;padding:2px 6px;border-radius:3px;font-family:monospace;pointer-events:none;';
      label.textContent = gap.value + 'px';
      wrapper.appendChild(label);
    }

    var sibRect = gap.toRect || gap.fromRect;
    var sibBox = document.createElement('div');
    sibBox.style.cssText = 'position:absolute;left:' + sibRect.left + 'px;top:' + sibRect.top + 'px;width:' + sibRect.width + 'px;height:' + sibRect.height + 'px;border:1px dashed rgba(239,68,68,0.5);pointer-events:none;';
    wrapper.appendChild(sibBox);

    this.redlinesContainer.appendChild(wrapper);
  },

  drawParentGapIndicator(element, data) {
    var rect = element.getBoundingClientRect();
    var parent = element.parentElement;
    if (!parent) return;
    var parentRect = parent.getBoundingClientRect();
    var parentStyle = window.getComputedStyle(parent);

    var indicator = document.createElement('div');
    indicator.style.cssText = 'position:absolute;pointer-events:none;';

    var label = document.createElement('div');
    var parentInfo = '';
    if (data.parentDisplay === 'flex' || data.parentDisplay === 'inline-flex') {
      parentInfo = 'flex';
    } else if (data.parentDisplay === 'grid' || data.parentDisplay === 'inline-grid') {
      parentInfo = 'grid';
    }
    label.style.cssText = 'position:absolute;left:' + parentRect.left + 'px;top:' + (parentRect.top - 22) + 'px;color:#fff;font-size:11px;font-weight:600;white-space:nowrap;background:rgba(139,92,246,0.9);padding:3px 8px;border-radius:3px;font-family:monospace;pointer-events:none;';
    label.textContent = (parentInfo ? parentInfo + ' ' : '') + 'gap: ' + data.parentGap;
    indicator.appendChild(label);

    var parentOutline = document.createElement('div');
    parentOutline.style.cssText = 'position:absolute;left:' + parentRect.left + 'px;top:' + parentRect.top + 'px;width:' + parentRect.width + 'px;height:' + parentRect.height + 'px;border:1px dashed rgba(139,92,246,0.4);pointer-events:none;';
    indicator.appendChild(parentOutline);

    this.redlinesContainer.appendChild(indicator);
  },

  hideRedlines() {
    this.redlinesContainer.style.display = 'none';
    this.redlinesContainer.innerHTML = '';
  },

  selectElement(element) {
    if (!element) return;

    this.selectedElement = element;
    this.hoveredElement = element;

    this.highlightBox.style.border = '2px solid #3b82f6';
    this.highlightBox.style.background = 'rgba(59, 130, 246, 0.12)';
    this.positionHighlight(element);

    var info = window.DevModeUtils ? window.DevModeUtils.getComputedStyles(element) : null;
    var gapData = window.DevModeUtils ? window.DevModeUtils.getSiblingDistances(element) : null;
    this.showPanel(info, gapData);
  },

  clearSelection() {
    this.selectedElement = null;
    this.hideHighlight();
    this.hideRedlines();
    this.closePanel();
  },

  showPanel(info, gapData) {
    if (!info) {
      this.closePanel();
      return;
    }

    var content = document.getElementById('dev-mode-panel-content');
    if (!content) return;

    var margin = info.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    var padding = info.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    var typo = info.typography || {};
    var colors = info.colors || {};
    var layout = info.layout || {};

    var layoutBadge = '';
    if (layout.flex) {
      layoutBadge = '<span class="layout-badge flex">Flexbox</span>';
    } else if (layout.grid) {
      layoutBadge = '<span class="layout-badge grid">Grid</span>';
    }

    var textColorHex = window.DevModeUtils ? window.DevModeUtils.rgbToHex(colors.text || 'transparent') : 'transparent';
    var bgColorHex = window.DevModeUtils ? window.DevModeUtils.rgbToHex(colors.background || 'transparent') : 'transparent';

    var tailwindClasses = window.DevModeUtils ? window.DevModeUtils.suggestTailwind(info) : [];

    var html = '';
    html += '<div class="panel-section">';
    html += '<h3>Element</h3>';
    html += '<div class="info-row"><span class="info-label">Tag</span><span class="info-value">&lt;' + info.tagName + '&gt;</span></div>';
    html += '<div class="info-row"><span class="info-label">Class</span><span class="info-value">' + (info.className || '(none)') + '</span></div>';
    if (layoutBadge) {
      html += '<div class="info-row"><span class="info-label">Layout</span>' + layoutBadge + '</div>';
    }
    html += '</div>';

    html += '<div class="panel-section">';
    html += '<h3>Dimensions</h3>';
    html += '<div class="info-row"><span class="info-label">Width</span><span class="info-value">' + (info.width || 0) + 'px</span></div>';
    html += '<div class="info-row"><span class="info-label">Height</span><span class="info-value">' + (info.height || 0) + 'px</span></div>';
    html += '</div>';

    html += '<div class="panel-section">';
    html += '<h3>Margin</h3>';
    html += '<div class="info-row"><span class="info-label">Top</span><span class="info-value">' + Math.round(margin.top) + 'px</span></div>';
    html += '<div class="info-row"><span class="info-label">Right</span><span class="info-value">' + Math.round(margin.right) + 'px</span></div>';
    html += '<div class="info-row"><span class="info-label">Bottom</span><span class="info-value">' + Math.round(margin.bottom) + 'px</span></div>';
    html += '<div class="info-row"><span class="info-label">Left</span><span class="info-value">' + Math.round(margin.left) + 'px</span></div>';
    html += '</div>';

    // Parent gap info
    var parentEl = this.selectedElement ? this.selectedElement.parentElement : null;
    if (parentEl) {
      var parentStyle = window.getComputedStyle(parentEl);
      var parentGap = parentStyle.gap;
      var parentDisplay = parentStyle.display;
      var isFlexOrGrid = (parentDisplay === 'flex' || parentDisplay === 'inline-flex' || parentDisplay === 'grid' || parentDisplay === 'inline-grid');
      if (isFlexOrGrid && parentGap && parentGap !== 'normal' && parentGap !== '0px') {
        html += '<div class="panel-section">';
        html += '<h3>Parent Gap</h3>';
        html += '<div class="info-row"><span class="info-label">Layout</span><span class="info-value">' + parentDisplay + '</span></div>';
        html += '<div class="info-row"><span class="info-label">Gap</span><span class="info-value gap-value">' + parentGap + '</span></div>';
        if (parentStyle.columnGap && parentStyle.columnGap !== '0px' && parentStyle.columnGap !== 'normal') {
          html += '<div class="info-row"><span class="info-label">Column Gap</span><span class="info-value gap-value">' + parentStyle.columnGap + '</span></div>';
        }
        if (parentStyle.rowGap && parentStyle.rowGap !== '0px' && parentStyle.rowGap !== 'normal') {
          html += '<div class="info-row"><span class="info-label">Row Gap</span><span class="info-value gap-value">' + parentStyle.rowGap + '</span></div>';
        }
        html += '</div>';
      }
    }

    html += '<div class="panel-section">';
    html += '<h3>Padding</h3>';
    html += '<div class="info-row"><span class="info-label">Top</span><span class="info-value">' + Math.round(padding.top) + 'px</span></div>';
    html += '<div class="info-row"><span class="info-label">Right</span><span class="info-value">' + Math.round(padding.right) + 'px</span></div>';
    html += '<div class="info-row"><span class="info-label">Bottom</span><span class="info-value">' + Math.round(padding.bottom) + 'px</span></div>';
    html += '<div class="info-row"><span class="info-label">Left</span><span class="info-value">' + Math.round(padding.left) + 'px</span></div>';
    html += '</div>';

    html += '<div class="panel-section">';
    html += '<h3>Typography</h3>';
    html += '<div class="info-row"><span class="info-label">Font</span><span class="info-value font-family">' + (typo.fontFamily || 'inherit') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">Size</span><span class="info-value">' + (typo.fontSize || 0) + 'px</span></div>';
    html += '<div class="info-row"><span class="info-label">Weight</span><span class="info-value">' + (typo.fontWeight || 'normal') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">Line H</span><span class="info-value">' + (typo.lineHeight || 0) + '</span></div>';
    html += '</div>';

    html += '<div class="panel-section">';
    html += '<h3>Colors</h3>';
    html += '<div class="info-row"><span class="info-label">Text</span><span class="info-value color-swatch"><span class="color-box" style="background:' + textColorHex + '"></span>' + textColorHex + '</span></div>';
    html += '<div class="info-row"><span class="info-label">Bg</span><span class="info-value color-swatch"><span class="color-box" style="background:' + bgColorHex + '"></span>' + bgColorHex + '</span></div>';
    html += '</div>';

    if (tailwindClasses.length > 0) {
      html += '<div class="panel-section">';
      html += '<h3>Tailwind</h3>';
      html += '<div class="tailwind-classes">';
      for (var i = 0; i < tailwindClasses.length && i < 10; i++) {
        html += '<span class="tailwind-class">' + tailwindClasses[i] + '</span>';
      }
      html += '</div></div>';
    }

    if (gapData && gapData.gaps && gapData.gaps.length > 0) {
      html += '<div class="panel-section">';
      html += '<h3>Gap / Spacing</h3>';
      for (var g = 0; g < gapData.gaps.length; g++) {
        var gap = gapData.gaps[g];
        var dirLabel = gap.direction === 'right' ? 'Gap \u2192' : gap.direction === 'left' ? 'Gap \u2190' : gap.direction === 'below' ? 'Gap \u2193' : 'Gap \u2191';
        html += '<div class="info-row"><span class="info-label">' + dirLabel + '</span><span class="info-value gap-value">' + gap.value + 'px</span></div>';
      }
      if (gapData.parentGap && gapData.parentGap !== 'normal' && gapData.parentGap !== '0px') {
        html += '<div class="info-row"><span class="info-label">CSS Gap</span><span class="info-value">' + gapData.parentGap + '</span></div>';
      }
      html += '</div>';
    }

    content.innerHTML = html;
    this.inspectPanel.style.right = '0';
  },

  closePanel() {
    this.inspectPanel.style.right = '-400px';
    var content = document.getElementById('dev-mode-panel-content');
    if (content) {
      content.innerHTML = '<p class="panel-placeholder">Click an element to inspect it</p>';
    }
  },

  copyCSS() {
    if (!this.selectedElement) return;
    var info = window.DevModeUtils ? window.DevModeUtils.getComputedStyles(this.selectedElement) : null;
    var css = window.DevModeUtils ? window.DevModeUtils.generateCSS(info) : '';
    navigator.clipboard.writeText(css).then(function() {
      var btn = document.getElementById('dev-mode-copy-css');
      if (btn) {
        var orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = orig; }, 1500);
      }
    });
  },

  enable() {
    this.isDevModeOn = true;
    this.selectedElement = null;
    document.body.style.cursor = 'crosshair';
  },

  disable() {
    this.isDevModeOn = false;
    this.selectedElement = null;
    this.hoveredElement = null;
    this.hideHighlight();
    this.hideRedlines();
    this.closePanel();
    document.body.style.cursor = 'auto';
  },

  destroy() {
    window.removeEventListener('scroll', this._scrollHandler, true);
    window.removeEventListener('resize', this._scrollHandler, true);
    if (this.highlightBox) this.highlightBox.remove();
    if (this.redlinesContainer) this.redlinesContainer.remove();
    if (this.inspectPanel) this.inspectPanel.remove();
  }
};

window.DevModeOverlay = DevModeOverlay;