class UIComponents {
    constructor() {
        this.activeTooltips = new Map();
        this.activePopovers = new Map();
        this.activeDropdowns = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createTooltipContainer();
    }

    createTooltipContainer() {
        if (!document.getElementById('tooltip-container')) {
            const container = document.createElement('div');
            container.id = 'tooltip-container';
            container.className = 'absolute z-50 pointer-events-none';
            document.body.appendChild(container);
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('[data-dropdown]') && !e.target.closest('.dropdown-menu')) {
                this.closeAllDropdowns();
            }
            if (!e.target.closest('[data-popover]') && !e.target.closest('.popover')) {
                this.closeAllPopovers();
            }
        });

        document.addEventListener('scroll', () => {
            this.updateTooltipPositions();
            this.updatePopoverPositions();
        });

        window.addEventListener('resize', () => {
            this.updateTooltipPositions();
            this.updatePopoverPositions();
        });
    }

    // Tooltip functionality
    showTooltip(element, content, options = {}) {
        const {
            position = 'top',
            delay = 500,
            className = '',
            html = false
        } = options;

        const tooltipId = 'tooltip-' + Date.now();
        
        setTimeout(() => {
            if (!element.matches(':hover')) return;

            const tooltip = document.createElement('div');
            tooltip.id = tooltipId;
            tooltip.className = `tooltip bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg ${className}`;
            
            if (html) {
                tooltip.innerHTML = content;
            } else {
                tooltip.textContent = content;
            }

            document.getElementById('tooltip-container').appendChild(tooltip);
            this.activeTooltips.set(element, { tooltip, id: tooltipId });

            this.positionTooltip(tooltip, element, position);
        }, delay);
    }

    hideTooltip(element) {
        const tooltipData = this.activeTooltips.get(element);
        if (tooltipData) {
            tooltipData.tooltip.remove();
            this.activeTooltips.delete(element);
        }
    }

    positionTooltip(tooltip, element, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let left, top;

        switch (position) {
            case 'top':
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                top = rect.top - tooltipRect.height - 5;
                break;
            case 'bottom':
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                top = rect.bottom + 5;
                break;
            case 'left':
                left = rect.left - tooltipRect.width - 5;
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                break;
            case 'right':
                left = rect.right + 5;
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                break;
        }

        tooltip.style.left = Math.max(5, left) + 'px';
        tooltip.style.top = Math.max(5, top) + 'px';
    }

    updateTooltipPositions() {
        this.activeTooltips.forEach((tooltipData, element) => {
            const position = element.getAttribute('data-tooltip-position') || 'top';
            this.positionTooltip(tooltipData.tooltip, element, position);
        });
    }

    // Popover functionality
    showPopover(element, content, options = {}) {
        const {
            title = '',
            position = 'bottom',
            trigger = 'click',
            dismissible = true,
            className = '',
            width = '250px'
        } = options;

        this.closePopover(element);

        const popoverId = 'popover-' + Date.now();
        const popover = document.createElement('div');
        popover.id = popoverId;
        popover.className = `popover absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 ${className}`;
        popover.style.width = width;

        popover.innerHTML = `
            ${title ? `
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-gray-900">${title}</h4>
                    ${dismissible ? `
                        <button onclick="uiComponents.closePopover(this.closest('[data-popover]') || document.querySelector('[data-popover-target=\\'${popoverId}\\']'))" 
                                class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            ` : ''}
            <div class="popover-content text-sm text-gray-600">
                ${content}
            </div>
        `;

        document.body.appendChild(popover);
        this.activePopovers.set(element, { popover, id: popoverId });

        this.positionPopover(popover, element, position);
        element.setAttribute('data-popover-target', popoverId);

        setTimeout(() => {
            popover.classList.add('slide-down');
        }, 10);
    }

    closePopover(element) {
        const popoverData = this.activePopovers.get(element);
        if (popoverData) {
            popoverData.popover.remove();
            this.activePopovers.delete(element);
            element.removeAttribute('data-popover-target');
        }
    }

    closeAllPopovers() {
        this.activePopovers.forEach((popoverData, element) => {
            this.closePopover(element);
        });
    }

    positionPopover(popover, element, position) {
        const rect = element.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();

        let left, top;

        switch (position) {
            case 'top':
                left = rect.left + (rect.width - popoverRect.width) / 2;
                top = rect.top - popoverRect.height - 10;
                break;
            case 'bottom':
                left = rect.left + (rect.width - popoverRect.width) / 2;
                top = rect.bottom + 10;
                break;
            case 'left':
                left = rect.left - popoverRect.width - 10;
                top = rect.top + (rect.height - popoverRect.height) / 2;
                break;
            case 'right':
                left = rect.right + 10;
                top = rect.top + (rect.height - popoverRect.height) / 2;
                break;
        }

        // Adjust for viewport boundaries
        left = Math.max(10, Math.min(left, window.innerWidth - popoverRect.width - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - popoverRect.height - 10));

        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
    }

    updatePopoverPositions() {
        this.activePopovers.forEach((popoverData, element) => {
            const position = element.getAttribute('data-popover-position') || 'bottom';
            this.positionPopover(popoverData.popover, element, position);
        });
    }

    // Dropdown functionality
    toggleDropdown(element) {
        const targetSelector = element.getAttribute('data-dropdown');
        const dropdown = document.querySelector(targetSelector);

        if (!dropdown) {
            console.error(`Dropdown target "${targetSelector}" not found`);
            return;
        }

        if (this.activeDropdowns.has(element)) {
            this.closeDropdown(element);
        } else {
            this.closeAllDropdowns();
            this.openDropdown(element, dropdown);
        }
    }

    openDropdown(trigger, dropdown) {
        dropdown.classList.remove('hidden');
        dropdown.classList.add('slide-down');
        this.activeDropdowns.set(trigger, dropdown);

        this.positionDropdown(dropdown, trigger);
    }

    closeDropdown(trigger) {
        const dropdown = this.activeDropdowns.get(trigger);
        if (dropdown) {
            dropdown.classList.add('hidden');
            dropdown.classList.remove('slide-down');
            this.activeDropdowns.delete(trigger);
        }
    }

    closeAllDropdowns() {
        this.activeDropdowns.forEach((dropdown, trigger) => {
            this.closeDropdown(trigger);
        });
    }

    positionDropdown(dropdown, trigger) {
        const rect = trigger.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.left = rect.left + 'px';
        dropdown.style.top = (rect.bottom + 5) + 'px';
        dropdown.style.minWidth = rect.width + 'px';
        dropdown.style.zIndex = '50';
    }

    // Progress functionality
    createProgressBar(container, options = {}) {
        const {
            value = 0,
            max = 100,
            className = '',
            showPercentage = true,
            animated = false,
            striped = false
        } = options;

        const progressHtml = `
            <div class="progress-container w-full">
                ${showPercentage ? `
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium text-gray-700">Progress</span>
                        <span class="text-sm text-gray-500 progress-percentage">${Math.round((value / max) * 100)}%</span>
                    </div>
                ` : ''}
                <div class="progress-bg bg-gray-200 rounded-full h-2 ${className}">
                    <div class="progress-bar bg-blue-600 h-2 rounded-full transition-all duration-300 ${animated ? 'animate-pulse' : ''} ${striped ? 'bg-gradient-to-r from-blue-500 to-blue-700' : ''}" 
                         style="width: ${(value / max) * 100}%"></div>
                </div>
            </div>
        `;

        container.innerHTML = progressHtml;
        return container.querySelector('.progress-bar');
    }

    updateProgress(progressBar, value, max = 100) {
        const percentage = Math.round((value / max) * 100);
        progressBar.style.width = percentage + '%';
        
        const percentageElement = progressBar.closest('.progress-container').querySelector('.progress-percentage');
        if (percentageElement) {
            percentageElement.textContent = percentage + '%';
        }
    }

    // Loading spinner
    showLoadingSpinner(container, options = {}) {
        const {
            size = 'medium',
            color = 'blue',
            text = 'Loading...'
        } = options;

        const sizeClasses = {
            small: 'h-4 w-4',
            medium: 'h-8 w-8',
            large: 'h-12 w-12'
        };

        const colorClasses = {
            blue: 'border-blue-600',
            green: 'border-green-600',
            red: 'border-red-600',
            yellow: 'border-yellow-600'
        };

        const spinnerHtml = `
            <div class="loading-spinner flex flex-col items-center justify-center p-4">
                <div class="animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${colorClasses[color]}"></div>
                ${text ? `<p class="mt-2 text-sm text-gray-600">${text}</p>` : ''}
            </div>
        `;

        container.innerHTML = spinnerHtml;
    }

    hideLoadingSpinner(container) {
        const spinner = container.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    // Skeleton loader
    createSkeletonLoader(container, options = {}) {
        const {
            lines = 3,
            avatar = false,
            className = ''
        } = options;

        let skeletonHtml = '<div class="skeleton-loader animate-pulse ' + className + '">';
        
        if (avatar) {
            skeletonHtml += '<div class="flex items-center space-x-4 mb-4">';
            skeletonHtml += '<div class="rounded-full bg-gray-300 h-10 w-10"></div>';
            skeletonHtml += '<div class="flex-1 space-y-2">';
            skeletonHtml += '<div class="h-4 bg-gray-300 rounded w-3/4"></div>';
            skeletonHtml += '<div class="h-3 bg-gray-300 rounded w-1/2"></div>';
            skeletonHtml += '</div></div>';
        }

        for (let i = 0; i < lines; i++) {
            const width = i === lines - 1 ? 'w-2/3' : 'w-full';
            skeletonHtml += `<div class="h-4 bg-gray-300 rounded ${width} mb-2"></div>`;
        }

        skeletonHtml += '</div>';
        container.innerHTML = skeletonHtml;
    }
}

window.uiComponents = new UIComponents();