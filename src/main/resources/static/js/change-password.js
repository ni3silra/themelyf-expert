// Change password functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('changePasswordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const passwordMatchDiv = document.getElementById('passwordMatch');
    
    // Password visibility toggles
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('svg');
            if (type === 'text') {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                `;
            } else {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                `;
            }
        });
    });
    
    // Password strength checker
    newPasswordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        checkPasswordMatch();
        updateSubmitButton();
    });
    
    // Password confirmation checker
    confirmPasswordInput.addEventListener('input', function() {
        checkPasswordMatch();
        updateSubmitButton();
    });
    
    // Current password checker
    currentPasswordInput.addEventListener('input', function() {
        updateSubmitButton();
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        changePassword();
    });
    
    function checkPasswordStrength(password) {
        const strengthIndicators = [
            document.getElementById('strength-1'),
            document.getElementById('strength-2'),
            document.getElementById('strength-3'),
            document.getElementById('strength-4')
        ];
        const strengthText = document.getElementById('strengthText');
        
        // Reset all indicators
        strengthIndicators.forEach(indicator => {
            indicator.className = 'w-2 h-2 rounded-full bg-gray-300';
        });
        
        if (!password) {
            strengthText.textContent = 'Password strength';
            strengthText.className = 'text-gray-500';
            return 0;
        }
        
        let score = 0;
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password) && /[A-Z]/.test(password),
            /\d/.test(password),
            /[!@#$%^&*(),.?":{}|<>]/.test(password)
        ];
        
        checks.forEach((check, index) => {
            if (check) {
                score++;
                strengthIndicators[index].className = 'w-2 h-2 rounded-full ' + 
                    (score <= 1 ? 'bg-red-500' : 
                     score <= 2 ? 'bg-yellow-500' : 
                     score <= 3 ? 'bg-blue-500' : 'bg-green-500');
            }
        });
        
        const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColors = ['text-red-600', 'text-yellow-600', 'text-blue-600', 'text-green-600', 'text-green-700'];
        
        strengthText.textContent = strengthLabels[score] || 'Very Weak';
        strengthText.className = strengthColors[score] || 'text-red-600';
        
        return score;
    }
    
    function checkPasswordMatch() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            passwordMatchDiv.classList.remove('hidden');
            confirmPasswordInput.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
            confirmPasswordInput.classList.remove('border-gray-300', 'focus:border-indigo-500', 'focus:ring-indigo-500');
            return false;
        } else {
            passwordMatchDiv.classList.add('hidden');
            confirmPasswordInput.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
            confirmPasswordInput.classList.add('border-gray-300', 'focus:border-indigo-500', 'focus:ring-indigo-500');
            return true;
        }
    }
    
    function validateForm() {
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!currentPassword) {
            showNotification('Please enter your current password', 'error');
            currentPasswordInput.focus();
            return false;
        }
        
        if (!newPassword) {
            showNotification('Please enter a new password', 'error');
            newPasswordInput.focus();
            return false;
        }
        
        if (checkPasswordStrength(newPassword) < 3) {
            showNotification('Please choose a stronger password', 'error');
            newPasswordInput.focus();
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('Password confirmation does not match', 'error');
            confirmPasswordInput.focus();
            return false;
        }
        
        if (currentPassword === newPassword) {
            showNotification('New password must be different from current password', 'error');
            newPasswordInput.focus();
            return false;
        }
        
        return true;
    }
    
    function updateSubmitButton() {
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        const isValid = currentPassword && 
                       newPassword && 
                       confirmPassword && 
                       newPassword === confirmPassword &&
                       checkPasswordStrength(newPassword) >= 3;
        
        changePasswordBtn.disabled = !isValid;
        
        if (isValid) {
            changePasswordBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            changePasswordBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
    
    async function changePassword() {
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value;
        
        setButtonLoading(changePasswordBtn, true);
        
        try {
            const response = await fetch('/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showNotification('Password changed successfully!', 'success');
                
                // Clear form
                form.reset();
                checkPasswordStrength('');
                updateSubmitButton();
                
                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
                
            } else {
                showNotification(
                    data.message || 'Failed to change password. Please try again.',
                    'error'
                );
                
                // Focus on current password if it's wrong
                if (data.message && data.message.includes('Current password')) {
                    currentPasswordInput.focus();
                    currentPasswordInput.select();
                }
            }
        } catch (error) {
            console.error('Change password error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            setButtonLoading(changePasswordBtn, false);
        }
    }
    
    function setButtonLoading(button, isLoading) {
        const spinner = button.querySelector('.loading-spinner');
        const text = button.querySelector('.btn-text');
        
        if (isLoading) {
            spinner?.classList.remove('hidden');
            button.disabled = true;
            button.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            spinner?.classList.add('hidden');
            button.disabled = false;
            button.classList.remove('opacity-75', 'cursor-not-allowed');
            updateSubmitButton(); // Recheck validation state
        }
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification-toast').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification-toast fixed top-4 right-4 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 z-50 transform transition-all duration-300 translate-x-full`;
        
        const bgColor = type === 'success' ? 'bg-green-50 border-green-400 text-green-700' :
                       type === 'error' ? 'bg-red-50 border-red-400 text-red-700' :
                       'bg-blue-50 border-blue-400 text-blue-700';
        
        notification.innerHTML = `
            <div class="flex p-4">
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${message}</p>
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                    <button type="button" class="notification-close bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <span class="sr-only">Close</span>
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            dismissNotification(notification);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            dismissNotification(notification);
        });
    }
    
    function dismissNotification(notification) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    // Initialize
    updateSubmitButton();
});