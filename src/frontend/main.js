document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const val = document.getElementById('searchInput').value;
            if(val) {
                document.getElementById('statusText').innerText = `Searching for "${val}"...`;
            } else {
                alert("Please enter a book title or author.");
            }
        });
    }

    // ============ PASSWORD STRENGTH INDICATOR - ============
    const passwordInput = document.getElementById('reg-password');
    const registerBtn = document.getElementById('registerBtn');

    if (passwordInput && registerBtn) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        const reqLength = document.getElementById('req-length');
        const reqUpper = document.getElementById('req-upper');
        const reqLower = document.getElementById('req-lower');
        const reqNumber = document.getElementById('req-number');
        const reqSpecial = document.getElementById('req-special');

        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;

            // Check each requirement
            const checks = {
                length: password.length >= 8,
                upper: /[A-Z]/.test(password),
                lower: /[a-z]/.test(password),
                number: /\d/.test(password),
                special: /[\W_]/.test(password)
            };

            // Update checklist
            updateRequirement(reqLength, checks.length);
            updateRequirement(reqUpper, checks.upper);
            updateRequirement(reqLower, checks.lower);
            updateRequirement(reqNumber, checks.number);
            updateRequirement(reqSpecial, checks.special);

            // Count requirements met
            const metCount = Object.values(checks).filter(Boolean).length;
            const allMet = metCount === 5;

            // Update strength bar width
            const percentage = (metCount / 5) * 100;
            strengthFill.style.width = percentage + '%';

            // Update color and text
            if (metCount === 0) {
                strengthFill.style.backgroundColor = '#2a2a2a'; //Dark Grey
                strengthText.textContent = '';
            } else if (metCount <= 2) {
                strengthFill.style.backgroundColor = '#ef4444'; //red
                strengthText.textContent = 'Weak';
                strengthText.style.color = '#ef4444';
            } else if (metCount <= 4) {
                strengthFill.style.backgroundColor = '#f59e0b'; // Oramge 
                strengthText.textContent = 'Medium';
                strengthText.style.color = '#f59e0b';
            } else {
                strengthFill.style.backgroundColor = '#4ade80'; //Green
                strengthText.textContent = 'Strong';
                strengthText.style.color = '#4ade80';
            }

            // Enable button only when all requirements met
            registerBtn.disabled = !allMet;
        });
    }

    function updateRequirement(element, isMet) {
        if (!element) return;
        const icon = element.querySelector('.req-icon');
        if (isMet) {
            element.classList.add('met');
            icon.textContent = '✓';
        } else {
            element.classList.remove('met');
            icon.textContent = '○';
        }
    }

});
