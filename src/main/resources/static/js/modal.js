class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createModalContainer();
    }

    createModalContainer() {
        if (!document.getElementById('modal-container')) {
            const container = document.createElement('div');
            container.id = 'modal-container';
            document.body.appendChild(container);
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target.getAttribute('data-modal-id'));
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }

        modal.classList.remove('hidden');
        this.activeModals.add(modalId);
        document.body.style.overflow = 'hidden';

        modal.addEventListener('animationend', () => {
            const focusableElement = modal.querySelector('input, button, textarea, select');
            if (focusableElement) {
                focusableElement.focus();
            }
        }, { once: true });

        this.triggerEvent('modalOpened', { modalId });
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('hidden');
        this.activeModals.delete(modalId);

        if (this.activeModals.size === 0) {
            document.body.style.overflow = '';
        }

        this.triggerEvent('modalClosed', { modalId });
    }

    closeTopModal() {
        if (this.activeModals.size > 0) {
            const topModal = Array.from(this.activeModals).pop();
            this.closeModal(topModal);
        }
    }

    createModal(options) {
        const {
            id,
            title,
            content,
            size = 'medium',
            closable = true,
            actions = []
        } = options;

        const sizeClasses = {
            small: 'w-11/12 md:w-1/3',
            medium: 'w-11/12 md:w-1/2',
            large: 'w-11/12 md:w-2/3',
            fullscreen: 'w-full h-full'
        };

        const modalHtml = `
            <div id="${id}" class="modal-overlay fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50" data-modal-id="${id}">
                <div class="relative top-20 mx-auto p-5 border ${sizeClasses[size]} shadow-lg rounded-md bg-white fade-in">
                    <div class="mt-3">
                        ${title ? `
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-medium text-gray-900">${title}</h3>
                                ${closable ? `
                                    <button onclick="modalManager.closeModal('${id}')" class="text-gray-400 hover:text-gray-600">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}
                        <div class="modal-content">
                            ${content}
                        </div>
                        ${actions.length > 0 ? `
                            <div class="modal-actions flex justify-end space-x-3 mt-6">
                                ${actions.map(action => `
                                    <button 
                                        onclick="${action.onclick}" 
                                        class="${action.class || 'bg-gray-300 hover:bg-gray-400 text-gray-800'} font-bold py-2 px-4 rounded">
                                        ${action.label}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('modal-container');
        container.insertAdjacentHTML('beforeend', modalHtml);

        return id;
    }

    showConfirmModal(options) {
        const {
            title = 'Confirm Action',
            message,
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            onConfirm,
            onCancel,
            type = 'warning'
        } = options;

        const iconClasses = {
            warning: 'fa-exclamation-triangle text-yellow-600',
            danger: 'fa-exclamation-triangle text-red-600',
            success: 'fa-check-circle text-green-600',
            info: 'fa-info-circle text-blue-600'
        };

        const buttonClasses = {
            warning: 'bg-yellow-600 hover:bg-yellow-700',
            danger: 'bg-red-600 hover:bg-red-700',
            success: 'bg-green-600 hover:bg-green-700',
            info: 'bg-blue-600 hover:bg-blue-700'
        };

        const modalId = 'confirm-modal-' + Date.now();
        const content = `
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-${type === 'danger' ? 'red' : type === 'warning' ? 'yellow' : type === 'success' ? 'green' : 'blue'}-100 mb-4">
                    <i class="fas ${iconClasses[type]} text-xl"></i>
                </div>
                <p class="text-sm text-gray-500">${message}</p>
            </div>
        `;

        const actions = [
            {
                label: cancelText,
                onclick: `modalManager.closeModal('${modalId}'); ${onCancel ? onCancel + '()' : ''}`,
                class: 'bg-gray-300 hover:bg-gray-400 text-gray-800'
            },
            {
                label: confirmText,
                onclick: `modalManager.closeModal('${modalId}'); ${onConfirm ? onConfirm + '()' : ''}`,
                class: `${buttonClasses[type]} text-white`
            }
        ];

        this.createModal({
            id: modalId,
            title,
            content,
            size: 'small',
            actions
        });

        this.openModal(modalId);
        return modalId;
    }

    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
}

window.modalManager = new ModalManager();