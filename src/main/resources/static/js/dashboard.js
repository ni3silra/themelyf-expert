class DashboardCache {
    constructor() {
        this.cachePrefix = 'themelyf_dashboard_';
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    set(key, data) {
        const cacheItem = {
            data: data,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(this.cachePrefix + key, JSON.stringify(cacheItem));
    }

    get(key) {
        const cached = localStorage.getItem(this.cachePrefix + key);
        if (!cached) return null;

        const cacheItem = JSON.parse(cached);
        const now = new Date().getTime();

        if (now - cacheItem.timestamp > this.cacheTimeout) {
            this.remove(key);
            return null;
        }

        return cacheItem.data;
    }

    remove(key) {
        localStorage.removeItem(this.cachePrefix + key);
    }

    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.cachePrefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    showCacheIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'fixed top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        indicator.innerHTML = '<i class="fas fa-check mr-1"></i> Loaded from cache';
        document.body.appendChild(indicator);

        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }, 2000);
    }
}

class DashboardManager {
    constructor() {
        this.cache = new DashboardCache();
        this.debounceTimeout = null;
        this.init();
    }

    init() {
        this.setupSearchHandlers();
        this.setupFormValidation();
        this.setupKeyboardShortcuts();
        this.preloadData();
    }

    setupSearchHandlers() {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.debounceTimeout);
                this.debounceTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }

        const categorySelect = document.getElementById('category');
        const statusSelect = document.getElementById('status');

        if (categorySelect) {
            categorySelect.addEventListener('change', () => this.updateFilters());
        }
        if (statusSelect) {
            statusSelect.addEventListener('change', () => this.updateFilters());
        }
    }

    performSearch(query) {
        if (query.length < 2 && query.length > 0) return;

        const cacheKey = `search_${query}_${this.getCurrentFilters()}`;
        const cached = this.cache.get(cacheKey);

        if (cached) {
            this.displayResults(cached);
            this.cache.showCacheIndicator();
            return;
        }

        if (query.length >= 2 || query.length === 0) {
            const form = document.querySelector('form[action="/"]');
            if (form) {
                form.submit();
            }
        }
    }

    getCurrentFilters() {
        const category = document.getElementById('category')?.value || '';
        const status = document.getElementById('status')?.value || '';
        return `${category}_${status}`;
    }

    updateFilters() {
        const form = document.querySelector('form[action="/"]');
        if (form) {
            form.submit();
        }
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });

        const titleInputs = document.querySelectorAll('input[name="title"]');
        titleInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateTitle(input);
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const requiredInputs = form.querySelectorAll('[required]');

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        return isValid;
    }

    validateTitle(input) {
        const value = input.value.trim();
        if (value.length > 100) {
            this.showFieldError(input, 'Title must be less than 100 characters');
            return false;
        } else if (value.length < 3 && value.length > 0) {
            this.showFieldError(input, 'Title must be at least 3 characters');
            return false;
        } else {
            this.clearFieldError(input);
            return true;
        }
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-xs mt-1 field-error';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        input.classList.add('border-red-500');
    }

    clearFieldError(input) {
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('border-red-500');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        const searchInput = document.getElementById('search');
                        if (searchInput) {
                            searchInput.focus();
                            searchInput.select();
                        }
                        break;
                    case 'n':
                        e.preventDefault();
                        const addButton = document.querySelector('[onclick*="openAddModal"]');
                        if (addButton) {
                            addButton.click();
                        }
                        break;
                }
            }

            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    closeAllModals() {
        const modals = document.querySelectorAll('[id*="Modal"]');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    preloadData() {
        const currentPath = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const cacheKey = `page_${currentPath}_${searchParams.toString()}`;

        const pageData = {
            timestamp: new Date().getTime(),
            path: currentPath,
            search: searchParams.get('search') || '',
            category: searchParams.get('category') || '',
            status: searchParams.get('status') || ''
        };

        this.cache.set(cacheKey, pageData);

        window.addEventListener('beforeunload', () => {
            this.cache.set('last_visit', {
                timestamp: new Date().getTime(),
                path: currentPath
            });
        });
    }

    displayResults(results) {
        console.log('Displaying cached results:', results);
    }
}

class NotificationManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
        return container;
    }

    show(type, title, message, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification transform translate-x-full transition-transform duration-300 ease-in-out bg-white rounded-lg shadow-lg border-l-4 p-4 max-w-sm`;

        const colors = {
            success: 'border-green-500',
            error: 'border-red-500',
            warning: 'border-yellow-500',
            info: 'border-blue-500'
        };

        const icons = {
            success: 'fa-check-circle text-green-500',
            error: 'fa-times-circle text-red-500',
            warning: 'fa-exclamation-triangle text-yellow-500',
            info: 'fa-info-circle text-blue-500'
        };

        notification.classList.add(colors[type]);
        notification.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas ${icons[type]}"></i>
                </div>
                <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">${title}</div>
                    <div class="text-sm text-gray-500">${message}</div>
                </div>
                <div class="ml-auto pl-3">
                    <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        this.container.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    remove(notification) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    clear() {
        this.container.innerHTML = '';
    }
}

window.dashboardManager = new DashboardManager();
window.notificationManager = new NotificationManager();

document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }, 5000);
    });

    const lastVisit = window.dashboardManager.cache.get('last_visit');
    if (lastVisit) {
        const timeDiff = new Date().getTime() - lastVisit.timestamp;
        if (timeDiff < 30000) { // 30 seconds
            window.dashboardManager.cache.showCacheIndicator();
        }
    }

    const helpText = document.createElement('div');
    helpText.className = 'fixed bottom-4 left-4 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-75';
    helpText.innerHTML = 'Shortcuts: <kbd class="bg-gray-700 px-1 rounded">Ctrl+K</kbd> Search, <kbd class="bg-gray-700 px-1 rounded">Ctrl+N</kbd> New Item';
    document.body.appendChild(helpText);

    setTimeout(() => {
        helpText.style.opacity = '0';
        setTimeout(() => {
            if (helpText.parentNode) {
                helpText.parentNode.removeChild(helpText);
            }
        }, 300);
    }, 10000);
});