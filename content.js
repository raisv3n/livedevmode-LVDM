(function() {
  'use strict';

  let isDevModeActive = false;
  let currentHoveredElement = null;

  function init() {
    if (window.DevModeOverlay) {
      window.DevModeOverlay.init();
    }

    chrome.runtime.onMessage.addListener(handleMessage);

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
  }

  function handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'TOGGLE_ON':
        enableDevMode();
        break;
      case 'TOGGLE_OFF':
        disableDevMode();
        break;
    }
    sendResponse({ success: true });
    return true;
  }

  function enableDevMode() {
    isDevModeActive = true;
    if (window.DevModeOverlay) {
      window.DevModeOverlay.enable();
    }
  }

  function disableDevMode() {
    isDevModeActive = false;
    currentHoveredElement = null;
    if (window.DevModeOverlay) {
      window.DevModeOverlay.disable();
    }
  }

  function isOverlayElement(el) {
    if (!el) return false;
    return !!(el.closest && (
      el.closest('#dev-mode-inspect-panel') ||
      el.closest('#dev-mode-highlight-box') ||
      el.closest('#dev-mode-redlines') ||
      el.closest('#dev-mode-overlay-container')
    ));
  }

  function isIgnoredElement(el) {
    if (!el) return true;
    if (el === document.documentElement || el === document.body) return true;
    if (el === window) return true;
    var tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'META' || tag === 'HEAD') return true;
    return false;
  }

  function handleMouseMove(event) {
    if (!isDevModeActive) return;

    var target = event.target;

    if (isOverlayElement(target)) return;
    if (isIgnoredElement(target)) {
      if (currentHoveredElement && !window.DevModeOverlay.selectedElement) {
        window.DevModeOverlay.hideHighlight();
        window.DevModeOverlay.hideRedlines();
      }
      return;
    }

    if (target !== currentHoveredElement) {
      currentHoveredElement = target;
      if (window.DevModeOverlay && !window.DevModeOverlay.selectedElement) {
        window.DevModeOverlay.showHighlight(target);
        window.DevModeOverlay.showRedlines(target);
      }
    }
  }

  function handleClick(event) {
    if (!isDevModeActive) return;

    var target = event.target;

    if (isOverlayElement(target)) return;

    if (isIgnoredElement(target) || target === document.documentElement || target === document.body) {
      if (window.DevModeOverlay && window.DevModeOverlay.selectedElement) {
        event.preventDefault();
        event.stopPropagation();
        window.DevModeOverlay.clearSelection();
        currentHoveredElement = null;
      }
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    currentHoveredElement = target;
    if (window.DevModeOverlay) {
      window.DevModeOverlay.selectElement(target);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && isDevModeActive) {
      event.preventDefault();
      event.stopPropagation();
      if (window.DevModeOverlay && window.DevModeOverlay.selectedElement) {
        window.DevModeOverlay.clearSelection();
        currentHoveredElement = null;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();