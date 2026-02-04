// Stitch Counter App
(function() {
    'use strict';

    // State
    let leftDigit = 0;
    let rightDigit = 0;
    
    // Double-tap detection
    let lastTap = { digit: null, time: 0 };
    const DOUBLE_TAP_DELAY = 300;

    // DOM Elements
    const leftDigitEl = document.getElementById('left-digit');
    const rightDigitEl = document.getElementById('right-digit');
    const resetAllBtn = document.getElementById('reset-all');

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

    // Flash an element
    function flash(el) {
        // Remove class and force reflow to restart the flash
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
        setTimeout(() => {
            el.classList.remove('flash');
        }, 100);
    }

    // Handle clicks
    function handleClick(e) {
        // Check if clicking on a digit
        const digitEl = e.target.closest('.digit');
        if (digitEl) {
            flash(digitEl);
            increment(digitEl.dataset.digit);
            return;
        }

        // Check if clicking on a button
        const btn = e.target.closest('.btn');
        if (!btn) return;

        const digit = btn.dataset.digit;
        const action = btn.dataset.action;

        if (action === 'down') {
            flash(btn);
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

        // Event listeners
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeydown);
        resetAllBtn.addEventListener('click', resetAll);
    }

    // Start the app
    init();
})();
