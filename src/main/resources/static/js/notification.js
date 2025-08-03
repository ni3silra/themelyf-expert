class NotificationManager {
    constructor() {
        this.container = this.createContainer();
        this.notifications = new Map();
        this.defaultDuration = 5000;
    }

    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
            document.body.appendChild(container);
        }
        return container;
    }

    show(type, title, message, options = {}) {
        const {
            duration = this.defaultDuration,
            closable = true,
            actions = [],
            persistent = false
        } = options;

        const id = 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const notification = this.createNotification({
            id,
            type,
            title,
            message,
            closable,
            actions
        });

        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        requestAnimationFrame(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
            notification.classList.add('translate-x-0', 'opacity-100');
        });

        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        this.triggerEvent('notificationShown', { id, type, title, message });
        return id;
    }

    createNotification({ id, type, title, message, closable, actions }) {
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `notification transform translate-x-full opacity-0 transition-all duration-300 ease-in-out bg-white rounded-lg shadow-lg border-l-4 p-4 ${this.getTypeClasses(type)}`;

        const iconClass = this.getIconClass(type);
        const iconColor = this.getIconColor(type);

        notification.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas ${iconClass} ${iconColor}"></i>
                </div>
                <div class="ml-3 flex-1">
                    <div class="text-sm font-medium text-gray-900">${title}</div>
                    <div class="text-sm text-gray-500 mt-1">${message}</div>
                    ${actions.length > 0 ? `
                        <div class="mt-3 flex space-x-2">
                            ${actions.map(action => `
                                <button onclick="${action.onclick}" class="${action.class || 'text-blue-600 hover:text-blue-800'} text-sm font-medium">
                                    ${action.label}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                ${closable ? `
                    <div class="ml-auto pl-3">
                        <button onclick="notificationManager.remove('${id}')" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        return notification;
    }

    getTypeClasses(type) {
        const classes = {
            success: 'border-green-500',
            error: 'border-red-500',
            warning: 'border-yellow-500',
            info: 'border-blue-500'
        };
        return classes[type] || classes.info;
    }

    getIconClass(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getIconColor(type) {
        const colors = {
            success: 'text-green-500',
            error: 'text-red-500',
            warning: 'text-yellow-500',
            info: 'text-blue-500'
        };
        return colors[type] || colors.info;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        notification.classList.remove('translate-x-0', 'opacity-100');
        notification.classList.add('translate-x-full', 'opacity-0');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);

        this.triggerEvent('notificationRemoved', { id });
    }

    clear() {
        this.notifications.forEach((notification, id) => {
            this.remove(id);
        });
    }

    success(title, message, options = {}) {
        return this.show('success', title, message, options);
    }

    error(title, message, options = {}) {
        return this.show('error', title, message, options);
    }

    warning(title, message, options = {}) {
        return this.show('warning', title, message, options);
    }

    info(title, message, options = {}) {
        return this.show('info', title, message, options);
    }

    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
}

window.notificationManager = new NotificationManager();