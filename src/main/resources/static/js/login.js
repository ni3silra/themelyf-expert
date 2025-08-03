// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    const passwordLoginBtn = document.getElementById('passwordLoginBtn');
    const otpLoginBtn = document.getElementById('otpLoginBtn');
    const passwordLoginForm = document.getElementById('passwordLoginForm');
    const otpLoginForm = document.getElementById('otpLoginForm');
    const otpStep1 = document.getElementById('otpStep1');
    const otpStep2 = document.getElementById('otpStep2');
    
    // Login method switching
    passwordLoginBtn?.addEventListener('click', function() {
        switchToPasswordLogin();
    });
    
    otpLoginBtn?.addEventListener('click', function() {
        switchToOtpLogin();
    });
    
    // Password visibility toggle
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
    
    // OTP functionality
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const backToStep1 = document.getElementById('backToStep1');
    
    sendOtpBtn?.addEventListener('click', function() {
        sendOtp();
    });
    
    verifyOtpBtn?.addEventListener('click', function() {
        verifyOtp();
    });
    
    resendOtpBtn?.addEventListener('click', function() {
        sendOtp(true);
    });
    
    backToStep1?.addEventListener('click', function() {
        showOtpStep1();
    });
    
    // OTP input formatting
    const otpCodeInput = document.getElementById('otpCode');
    otpCodeInput?.addEventListener('input', function(e) {
        // Only allow numbers
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Auto-submit when 6 digits entered
        if (this.value.length === 6) {
            verifyOtp();
        }
    });
    
    // Auto-focus username on load
    const usernameInput = document.getElementById('username');
    if (usernameInput && !usernameInput.value) {
        usernameInput.focus();
    }
    
    function switchToPasswordLogin() {
        passwordLoginBtn.classList.add('active', 'text-indigo-600', 'bg-indigo-50');
        passwordLoginBtn.classList.remove('text-gray-500', 'bg-white');
        
        otpLoginBtn.classList.remove('active', 'text-indigo-600', 'bg-indigo-50');
        otpLoginBtn.classList.add('text-gray-500', 'bg-white');
        
        passwordLoginForm.style.display = 'block';
        otpLoginForm.style.display = 'none';
        
        document.getElementById('username')?.focus();
    }
    
    function switchToOtpLogin() {
        otpLoginBtn.classList.add('active', 'text-indigo-600', 'bg-indigo-50');
        otpLoginBtn.classList.remove('text-gray-500', 'bg-white');
        
        passwordLoginBtn.classList.remove('active', 'text-indigo-600', 'bg-indigo-50');
        passwordLoginBtn.classList.add('text-gray-500', 'bg-white');
        
        passwordLoginForm.style.display = 'none';
        otpLoginForm.style.display = 'block';
        
        showOtpStep1();
        document.getElementById('otpUsername')?.focus();
    }
    
    function showOtpStep1() {
        otpStep1.style.display = 'block';
        otpStep2.style.display = 'none';
        
        // Clear previous values
        document.getElementById('otpCode').value = '';
    }
    
    function showOtpStep2() {
        otpStep1.style.display = 'none';
        otpStep2.style.display = 'block';
        
        document.getElementById('otpCode')?.focus();
    }
    
    async function sendOtp(isResend = false) {
        const username = document.getElementById('otpUsername').value.trim();
        const method = document.querySelector('input[name="otpMethod"]:checked').value;
        
        if (!username) {
            showNotification('Please enter your username or email', 'error');
            return;
        }
        
        const button = isResend ? resendOtpBtn : sendOtpBtn;
        const originalText = button.querySelector('.btn-text')?.textContent || button.textContent;
        
        setButtonLoading(button, true);
        
        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    username: username,
                    method: method
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showNotification(
                    `OTP sent to your ${method}. Please check and enter the code.`,
                    'success'
                );
                
                document.getElementById('otpSentTo').textContent = method;
                
                if (!isResend) {
                    showOtpStep2();
                }
                
                // Start countdown timer
                startResendTimer();
                
            } else {
                showNotification(
                    data.message || 'Failed to send OTP. Please try again.',
                    'error'
                );
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            setButtonLoading(button, false);
        }
    }
    
    async function verifyOtp() {
        const username = document.getElementById('otpUsername').value.trim();
        const otpCode = document.getElementById('otpCode').value.trim();
        
        if (!otpCode || otpCode.length !== 6) {
            showNotification('Please enter a valid 6-digit OTP code', 'error');
            return;
        }
        
        setButtonLoading(verifyOtpBtn, true);
        
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    username: username,
                    otpCode: otpCode
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showNotification('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard or intended page
                setTimeout(() => {
                    window.location.href = data.redirectUrl || '/dashboard';
                }, 1000);
                
            } else {
                showNotification(
                    data.message || 'Invalid OTP code. Please try again.',
                    'error'
                );
                
                // Clear OTP input for retry
                document.getElementById('otpCode').value = '';
                document.getElementById('otpCode').focus();
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            setButtonLoading(verifyOtpBtn, false);
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
        }
    }
    
    function startResendTimer() {
        let countdown = 60;
        resendOtpBtn.disabled = true;
        resendOtpBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        const timer = setInterval(() => {
            resendOtpBtn.textContent = `Resend (${countdown}s)`;
            countdown--;
            
            if (countdown < 0) {
                clearInterval(timer);
                resendOtpBtn.textContent = 'Resend';
                resendOtpBtn.disabled = false;
                resendOtpBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }, 1000);
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
});