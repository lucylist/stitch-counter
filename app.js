// Stitch Counter App
(function() {
    'use strict';

    // State
    let leftDigit = 0;
    let rightDigit = 0;
    
    // Touch/tap detection
    let lastTap = { digit: null, time: 0 };
    const DOUBLE_TAP_DELAY = 300;
    const SWIPE_THRESHOLD = 30;
    
    // Touch tracking
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchedDigit = null;

    // DOM Elements
    const leftDigitEl = document.getElementById('left-digit');
    const rightDigitEl = document.getElementById('right-digit');
    const resetAllBtn = document.getElementById('reset-all');

    // Detect if touch device
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Load saved state from localStorage
    function loadState() {
        const saved = localStorage.getItem('stitchCounter');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                leftDigit = state.left || 0;
                rightDigit = state.right || 0;
            } catch (e) {
                // Ignore parse errors
            }
        }
        updateDisplay();
    }

    // Save state to localStorage
    function saveState() {
        localStorage.setItem('stitchCounter', JSON.stringify({
            left: leftDigit,
            right: rightDigit
        }));
    }

    // Update the display
    function updateDisplay() {
        leftDigitEl.textContent = leftDigit;
        rightDigitEl.textContent = rightDigit;
    }

    // Increment a digit (wraps from 9 to 0, with carry-over for right digit)
    function increment(digit) {
        if (digit === 'left') {
            leftDigit = (leftDigit + 1) % 10;
        } else {
            rightDigit++;
            if (rightDigit > 9) {
                rightDigit = 0;
                leftDigit = (leftDigit + 1) % 10;
            }
        }
        updateDisplay();
        saveState();
    }

    // Decrement a digit (minimum 0)
    function decrement(digit) {
        if (digit === 'left' && leftDigit > 0) {
            leftDigit--;
        } else if (digit === 'right' && rightDigit > 0) {
            rightDigit--;
        }
        updateDisplay();
        saveState();
    }

    // Reset a single digit
    function resetDigit(digit) {
        if (digit === 'left') {
            leftDigit = 0;
        } else {
            rightDigit = 0;
        }
        updateDisplay();
        saveState();
    }

    // Reset all
    function resetAll() {
        leftDigit = 0;
        rightDigit = 0;
        updateDisplay();
        saveState();
    }

    // Flash an element with a color class
    function flash(el, type) {
        const className = type === 'down' ? 'flash-red' : 'flash';
        el.classList.remove('flash', 'flash-red');
        void el.offsetWidth;
        el.classList.add(className);
        setTimeout(() => {
            el.classList.remove(className);
        }, 100);
    }

    // Handle touch start on digits
    function handleTouchStart(e) {
        const digitEl = e.target.closest('.digit');
        if (!digitEl) return;
        
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        touchedDigit = digitEl;
    }

    // Prevent scrolling while swiping on digits
    function handleTouchMove(e) {
        if (touchedDigit) {
            e.preventDefault();
        }
    }

    // Handle touch end on digits
    function handleTouchEnd(e) {
        if (!touchedDigit) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        const deltaY = touchStartY - touchEndY;
        const deltaTime = touchEndTime - touchStartTime;
        
        const digit = touchedDigit.dataset.digit;
        
        // Check for swipe (must be quick and have enough distance)
        if (Math.abs(deltaY) > SWIPE_THRESHOLD && deltaTime < 300) {
            if (deltaY > 0) {
                // Swipe up - increment
                flash(touchedDigit, 'up');
                increment(digit);
            } else {
                // Swipe down - decrement
                flash(touchedDigit, 'down');
                decrement(digit);
            }
        } else if (Math.abs(deltaY) < 10) {
            // It's a tap (not a swipe)
            const now = Date.now();
            
            // Check for double tap
            if (lastTap.digit === digit && (now - lastTap.time) < DOUBLE_TAP_DELAY) {
                // Double tap - reset
                flash(touchedDigit, 'down');
                resetDigit(digit);
                lastTap = { digit: null, time: 0 };
            } else {
                // Single tap - increment
                flash(touchedDigit, 'up');
                increment(digit);
                lastTap = { digit: digit, time: now };
            }
        }
        
        touchedDigit = null;
    }

    // Handle clicks (for desktop)
    function handleClick(e) {
        // Skip if touch device (handled by touch events)
        if (isTouchDevice) return;
        
        // Check if clicking on a digit
        const digitEl = e.target.closest('.digit');
        if (digitEl) {
            flash(digitEl, 'up');
            increment(digitEl.dataset.digit);
            return;
        }

        // Check if clicking on a button
        const btn = e.target.closest('.btn');
        if (!btn) return;

        const digit = btn.dataset.digit;
        const action = btn.dataset.action;

        if (action === 'down') {
            flash(btn, 'down');
            const now = Date.now();
            // Check for double tap
            if (lastTap.digit === digit && (now - lastTap.time) < DOUBLE_TAP_DELAY) {
                resetDigit(digit);
                lastTap = { digit: null, time: 0 };
            } else {
                decrement(digit);
                lastTap = { digit: digit, time: now };
            }
        }
    }

    // Handle keyboard input (for desktop testing)
    function handleKeydown(e) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                increment('left');
                break;
            case 'ArrowDown':
                e.preventDefault();
                decrement('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                increment('right');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                decrement('right');
                break;
            case 'r':
            case 'R':
                resetAll();
                break;
        }
    }

    // Initialize
    function init() {
        // Load saved state
        loadState();

        // Add touch class to body if touch device
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
        }

        // Event listeners
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        resetAllBtn.addEventListener('click', resetAll);
    }

    // Start the app
    init();
})();
