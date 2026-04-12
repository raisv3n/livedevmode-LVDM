const DevModeUtils = {
  getComputedStyles(element) {
    if (!element) return null;
    
    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    const parseSafe = (val) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      tagName: element.tagName.toLowerCase(),
      className: element.className,
      id: element.id,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      margin: {
        top: parseSafe(styles.marginTop),
        right: parseSafe(styles.marginRight),
        bottom: parseSafe(styles.marginBottom),
        left: parseSafe(styles.marginLeft)
      },
      padding: {
        top: parseSafe(styles.paddingTop),
        right: parseSafe(styles.paddingRight),
        bottom: parseSafe(styles.paddingBottom),
        left: parseSafe(styles.paddingLeft)
      },
      typography: {
        fontFamily: styles.fontFamily,
        fontSize: parseFloat(styles.fontSize) || 0,
        fontWeight: styles.fontWeight,
        lineHeight: parseFloat(styles.lineHeight) || 0,
        color: styles.color,
        textAlign: styles.textAlign
      },
      colors: {
        text: styles.color,
        background: styles.backgroundColor,
        backgroundImage: styles.backgroundImage
      },
      layout: {
        display: styles.display,
        position: styles.position,
        flex: styles.display === 'flex' || styles.display === 'inline-flex',
        grid: styles.display === 'grid' || styles.display === 'inline-grid',
        flexDirection: styles.flexDirection,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
        gap: styles.gap,
        gridTemplateColumns: styles.gridTemplateColumns,
        gridTemplateRows: styles.gridTemplateRows
      },
      boxSizing: styles.boxSizing,
      borderRadius: styles.borderRadius,
      opacity: styles.opacity,
      visited: styles.visited
    };
  },

  formatSpacing(margin, padding) {
    const formatSide = (val) => {
      if (val === 0) return '0';
      return `${Math.round(val)}px`;
    };

    const m = {
      top: formatSide(margin.top),
      right: formatSide(margin.right),
      bottom: formatSide(margin.bottom),
      left: formatSide(margin.left)
    };

    const p = {
      top: formatSide(padding.top),
      right: formatSide(padding.right),
      bottom: formatSide(padding.bottom),
      left: formatSide(padding.left)
    };

    const isAllSame = (sides) => {
      return sides.top === sides.right && sides.right === sides.bottom && sides.bottom === sides.left;
    };

    const isVerticalSame = (sides) => sides.top === sides.bottom;
    const isHorizontalSame = (sides) => sides.left === sides.right;

    let marginStr, paddingStr;

    if (isAllSame(m)) {
      marginStr = m.top;
    } else if (isVerticalSame(m) && isHorizontalSame(m)) {
      marginStr = `${m.top} ${m.right}`;
    } else {
      marginStr = `${m.top} ${m.right} ${m.bottom} ${m.left}`;
    }

    if (isAllSame(p)) {
      paddingStr = p.top;
    } else if (isVerticalSame(p) && isHorizontalSame(p)) {
      paddingStr = `${p.top} ${p.right}`;
    } else {
      paddingStr = `${p.top} ${p.right} ${p.bottom} ${p.left}`;
    }

    return { margin: marginStr, padding: paddingStr };
  },

  rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent';
    
    const rgba = rgb.match(/[\d.]+/g);
    if (!rgba) return rgb;

    const r = parseInt(rgba[0]);
    const g = parseInt(rgba[1]);
    const b = parseInt(rgba[2]);
    const a = rgba[3] !== undefined ? parseFloat(rgba[3]) : 1;

    const toHex = (n) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    let hex = '#' + toHex(r) + toHex(g) + toHex(b);
    
    if (a < 1) {
      hex += Math.round(a * 255).toString(16).padStart(2, '0');
    }

    return hex.toUpperCase();
  },

  generateCSS(info) {
    if (!info) return '';
    
    const lines = [];
    const sel = info.tagName + (info.className ? '.' + info.className.split(' ').join('.') : '');
    
    lines.push(`${sel} {`);
    
    if (info.width) lines.push(`  width: ${info.width}px;`);
    if (info.height) lines.push(`  height: ${info.height}px;`);
    
    if (info.margin) {
      const { margin } = this.formatSpacing(info.margin, { top: 0, right: 0, bottom: 0, left: 0 });
      lines.push(`  margin: ${margin};`);
    }
    
    if (info.padding) {
      const { padding } = this.formatSpacing({ top: 0, right: 0, bottom: 0, left: 0 }, info.padding);
      lines.push(`  padding: ${padding};`);
    }
    
    if (info.typography) {
      if (info.typography.fontSize) lines.push(`  font-size: ${info.typography.fontSize}px;`);
      if (info.typography.fontWeight) lines.push(`  font-weight: ${info.typography.fontWeight};`);
      if (info.typography.lineHeight) lines.push(`  line-height: ${info.typography.lineHeight}px;`);
      if (info.typography.color) lines.push(`  color: ${this.rgbToHex(info.typography.color)};`);
    }
    
    if (info.colors && info.colors.background !== 'rgba(0, 0, 0, 0)') {
      lines.push(`  background: ${this.rgbToHex(info.colors.background)};`);
    }
    
    lines.push('}');
    
    return lines.join('\n');
  },

  suggestTailwind(info) {
    if (!info) return [];
    
    const classes = [];
    
    if (info.layout) {
      if (info.layout.display === 'flex') classes.push('flex');
      else if (info.layout.display === 'grid') classes.push('grid');
      else if (info.layout.display === 'block') classes.push('block');
      else if (info.layout.display === 'inline-block') classes.push('inline-block');
      else if (info.layout.display === 'inline') classes.push('inline');
      
      if (info.layout.flexDirection === 'row') classes.push('flex-row');
      else if (info.layout.flexDirection === 'column') classes.push('flex-col');
      
      if (info.layout.justifyContent) {
        if (info.layout.justifyContent.includes('center')) classes.push('justify-center');
        if (info.layout.justifyContent.includes('space-between')) classes.push('justify-between');
        if (info.layout.justifyContent.includes('space-around')) classes.push('justify-around');
      }
      
      if (info.layout.alignItems) {
        if (info.layout.alignItems.includes('center')) classes.push('items-center');
        if (info.layout.alignItems.includes('flex-start')) classes.push('items-start');
        if (info.layout.alignItems.includes('flex-end')) classes.push('items-end');
      }
      
      if (info.layout.gap) {
        const gap = parseFloat(info.layout.gap);
        if (gap > 0) {
          if (gap <= 4) classes.push('gap-1');
          else if (gap <= 8) classes.push('gap-2');
          else if (gap <= 12) classes.push('gap-3');
          else if (gap <= 16) classes.push('gap-4');
          else classes.push(`gap-[${gap}px]`);
        }
      }
    }
    
    if (info.typography) {
      if (info.typography.fontSize) {
        const fs = info.typography.fontSize;
        if (fs <= 12) classes.push('text-xs');
        else if (fs <= 14) classes.push('text-sm');
        else if (fs <= 16) classes.push('text-base');
        else if (fs <= 18) classes.push('text-lg');
        else if (fs <= 20) classes.push('text-xl');
        else if (fs <= 24) classes.push('text-2xl');
        else classes.push(`text-[${fs}px]`);
      }
      
      if (info.typography.fontWeight) {
        const fw = parseInt(info.typography.fontWeight);
        if (fw <= 400) classes.push('font-normal');
        else if (fw <= 500) classes.push('font-medium');
        else if (fw <= 600) classes.push('font-semibold');
        else if (fw <= 700) classes.push('font-bold');
        else classes.push(`font-[${fw}]`);
      }
    }
    
    if (info.margin) {
      const sides = ['top', 'right', 'bottom', 'left'];
      sides.forEach(side => {
        const val = info.margin[side];
        if (val > 0) {
          const prefix = { top: 'mt-', right: 'mr-', bottom: 'mb-', left: 'ml-' }[side];
          if (val <= 4) classes.push(prefix + '1');
          else if (val <= 8) classes.push(prefix + '2');
          else if (val <= 12) classes.push(prefix + '3');
          else if (val <= 16) classes.push(prefix + '4');
          else classes.push(prefix + `[${val}px]`);
        }
      });
    }
    
    if (info.padding) {
      const sides = ['top', 'right', 'bottom', 'left'];
      sides.forEach(side => {
        const val = info.padding[side];
        if (val > 0) {
          const prefix = { top: 'pt-', right: 'pr-', bottom: 'pb-', left: 'pl-' }[side];
          if (val <= 4) classes.push(prefix + '1');
          else if (val <= 8) classes.push(prefix + '2');
          else if (val <= 12) classes.push(prefix + '3');
          else if (val <= 16) classes.push(prefix + '4');
          else classes.push(prefix + `[${val}px]`);
        }
      });
    }
    
    if (info.colors && info.colors.background !== 'rgba(0, 0, 0, 0)' && info.colors.background !== 'transparent') {
      classes.push(`bg-[${this.rgbToHex(info.colors.background)}]`);
    }
    
    if (info.typography && info.typography.color) {
      classes.push(`text-[${this.rgbToHex(info.typography.color)}]`);
    }
    
    return classes;
  },

  detectLayout(element) {
    if (!element) return null;
    
    const styles = window.getComputedStyle(element);
    const parent = element.parentElement;
    
    if (!parent) return null;
    
    const parentStyles = window.getComputedStyle(parent);
    const parentRect = parent.getBoundingClientRect();
    
    return {
      isFlex: styles.display === 'flex' || styles.display === 'inline-flex',
      isGrid: styles.display === 'grid' || styles.display === 'inline-grid',
      isBlock: styles.display === 'block',
      isInline: styles.display === 'inline' || styles.display === 'inline-block',
      parentDisplay: parentStyles.display,
      parentLayout: parentStyles.display === 'flex' ? 'flexbox' : 
                   parentStyles.display === 'grid' ? 'grid' : 'block'
    };
  },

  getSiblingDistances(element) {
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    const parent = element.parentElement;
    
    if (!parent) return null;
    
    const siblings = Array.from(parent.children);
    const elementIndex = siblings.indexOf(element);
    
    const isVisible = (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    
    const gaps = [];

    const prevSibling = (() => {
      for (let i = elementIndex - 1; i >= 0; i--) {
        if (isVisible(siblings[i])) return siblings[i];
      }
      return null;
    })();

    const nextSibling = (() => {
      for (let i = elementIndex + 1; i < siblings.length; i++) {
        if (isVisible(siblings[i])) return siblings[i];
      }
      return null;
    })();

    if (prevSibling) {
      const sibRect = prevSibling.getBoundingClientRect();
      
      if (sibRect.top >= rect.bottom) {
        const gap = Math.round(sibRect.top - rect.bottom);
        if (gap >= 0) {
          gaps.push({
            type: 'vertical',
            direction: 'below',
            value: gap,
            fromRect: rect,
            toRect: sibRect,
            x: Math.max(rect.left, sibRect.left),
            y: rect.bottom,
            length: Math.min(rect.width, sibRect.width),
            sibling: prevSibling
          });
        }
      } else if (sibRect.bottom <= rect.top) {
        const gap = Math.round(rect.top - sibRect.bottom);
        if (gap >= 0) {
          gaps.push({
            type: 'vertical',
            direction: 'above',
            value: gap,
            fromRect: sibRect,
            toRect: rect,
            x: Math.max(rect.left, sibRect.left),
            y: sibRect.bottom,
            length: Math.min(rect.width, sibRect.width),
            sibling: prevSibling
          });
        }
      } else if (sibRect.right <= rect.left) {
        const gap = Math.round(rect.left - sibRect.right);
        if (gap >= 0) {
          gaps.push({
            type: 'horizontal',
            direction: 'left',
            value: gap,
            fromRect: sibRect,
            toRect: rect,
            x: sibRect.right,
            y: Math.max(rect.top, sibRect.top),
            length: Math.min(rect.height, sibRect.height),
            sibling: prevSibling
          });
        }
      } else if (sibRect.left >= rect.right) {
        const gap = Math.round(sibRect.left - rect.right);
        if (gap >= 0) {
          gaps.push({
            type: 'horizontal',
            direction: 'right',
            value: gap,
            fromRect: rect,
            toRect: sibRect,
            x: rect.right,
            y: Math.max(rect.top, sibRect.top),
            length: Math.min(rect.height, sibRect.height),
            sibling: prevSibling
          });
        }
      }
    }

    if (nextSibling) {
      const sibRect = nextSibling.getBoundingClientRect();
      
      if (sibRect.top >= rect.bottom) {
        const gap = Math.round(sibRect.top - rect.bottom);
        if (gap >= 0) {
          gaps.push({
            type: 'vertical',
            direction: 'below',
            value: gap,
            fromRect: rect,
            toRect: sibRect,
            x: Math.max(rect.left, sibRect.left),
            y: rect.bottom,
            length: Math.min(rect.width, sibRect.width),
            sibling: nextSibling
          });
        }
      } else if (sibRect.left >= rect.right) {
        const gap = Math.round(sibRect.left - rect.right);
        if (gap >= 0) {
          gaps.push({
            type: 'horizontal',
            direction: 'right',
            value: gap,
            fromRect: rect,
            toRect: sibRect,
            x: rect.right,
            y: Math.max(rect.top, sibRect.top),
            length: Math.min(rect.height, sibRect.height),
            sibling: nextSibling
          });
        }
      } else if (sibRect.bottom <= rect.top) {
        const gap = Math.round(rect.top - sibRect.bottom);
        if (gap >= 0) {
          gaps.push({
            type: 'vertical',
            direction: 'above',
            value: gap,
            fromRect: sibRect,
            toRect: rect,
            x: Math.max(rect.left, sibRect.left),
            y: sibRect.bottom,
            length: Math.min(rect.width, sibRect.width),
            sibling: nextSibling
          });
        }
      } else if (sibRect.right <= rect.left) {
        const gap = Math.round(rect.left - sibRect.right);
        if (gap >= 0) {
          gaps.push({
            type: 'horizontal',
            direction: 'left',
            value: gap,
            fromRect: sibRect,
            toRect: rect,
            x: sibRect.right,
            y: Math.max(rect.top, sibRect.top),
            length: Math.min(rect.height, sibRect.height),
            sibling: nextSibling
          });
        }
      }
    }
    
    const parentStyles = parent ? window.getComputedStyle(parent) : null;
    const parentGap = parentStyles ? parentStyles.gap : null;
    
    return {
      gaps: gaps,
      parentGap: parentGap,
      parentDisplay: parentStyles ? parentStyles.display : null
    };
  }
};

window.DevModeUtils = DevModeUtils;