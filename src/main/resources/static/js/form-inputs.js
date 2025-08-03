class AdvancedFormInputs {
    constructor() {
        this.components = new Map();
        this.init();
    }

    init() {
        this.setupAutoInit();
    }

    setupAutoInit() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeAllComponents();
        });

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.initializeComponentsInElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initializeAllComponents() {
        this.initializeComponentsInElement(document);
    }

    initializeComponentsInElement(element) {
        // Initialize date pickers
        element.querySelectorAll('[data-datepicker]').forEach(el => {
            if (!this.components.has(el)) {
                this.createDatePicker(el);
            }
        });

        // Initialize multi-select
        element.querySelectorAll('[data-multiselect]').forEach(el => {
            if (!this.components.has(el)) {
                this.createMultiSelect(el);
            }
        });

        // Initialize file uploads
        element.querySelectorAll('[data-file-upload]').forEach(el => {
            if (!this.components.has(el)) {
                this.createFileUpload(el);
            }
        });

        // Initialize color pickers
        element.querySelectorAll('[data-colorpicker]').forEach(el => {
            if (!this.components.has(el)) {
                this.createColorPicker(el);
            }
        });

        // Initialize range sliders
        element.querySelectorAll('[data-range-slider]').forEach(el => {
            if (!this.components.has(el)) {
                this.createRangeSlider(el);
            }
        });

        // Initialize rich text editors
        element.querySelectorAll('[data-rich-editor]').forEach(el => {
            if (!this.components.has(el)) {
                this.createRichEditor(el);
            }
        });

        // Initialize search inputs
        element.querySelectorAll('[data-search-input]').forEach(el => {
            if (!this.components.has(el)) {
                this.createSearchInput(el);
            }
        });
    }

    createDatePicker(element) {
        const options = this.getElementOptions(element, 'datepicker');
        const {
            format = 'YYYY-MM-DD',
            minDate = null,
            maxDate = null,
            showTime = false,
            inline = false
        } = options;

        const wrapper = document.createElement('div');
        wrapper.className = 'datepicker-wrapper relative';
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);

        element.type = showTime ? 'datetime-local' : 'date';
        element.className += ' datepicker-input';

        if (minDate) element.min = minDate;
        if (maxDate) element.max = maxDate;

        // Add calendar icon
        const icon = document.createElement('div');
        icon.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none';
        icon.innerHTML = '<i class="fas fa-calendar-alt"></i>';
        wrapper.appendChild(icon);

        this.components.set(element, { type: 'datepicker', wrapper, options });
    }

    createMultiSelect(element) {
        const options = this.getElementOptions(element, 'multiselect');
        const {
            placeholder = 'Select options...',
            searchable = true,
            maxSelections = null,
            allowCustom = false
        } = options;

        const wrapper = document.createElement('div');
        wrapper.className = 'multiselect-wrapper relative';
        element.parentNode.insertBefore(wrapper, element);
        element.style.display = 'none';

        const originalOptions = Array.from(element.options).map(opt => ({
            value: opt.value,
            text: opt.textContent,
            selected: opt.selected
        }));

        const multiSelectHtml = `
            <div class="multiselect-display border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer min-h-[38px] flex flex-wrap items-center gap-1">
                <div class="selected-items flex flex-wrap gap-1"></div>
                <input type="text" class="multiselect-search flex-1 border-none outline-none min-w-[100px]" placeholder="${placeholder}" ${!searchable ? 'readonly' : ''}>
                <i class="fas fa-chevron-down text-gray-400 ml-2"></i>
            </div>
            <div class="multiselect-dropdown hidden absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div class="multiselect-options"></div>
            </div>
        `;

        wrapper.innerHTML = multiSelectHtml;
        wrapper.appendChild(element);

        const display = wrapper.querySelector('.multiselect-display');
        const dropdown = wrapper.querySelector('.multiselect-dropdown');
        const selectedContainer = wrapper.querySelector('.selected-items');
        const searchInput = wrapper.querySelector('.multiselect-search');
        const optionsContainer = wrapper.querySelector('.multiselect-options');

        this.populateMultiSelectOptions(optionsContainer, originalOptions, element);
        this.updateMultiSelectDisplay(selectedContainer, element);

        display.addEventListener('click', () => {
            dropdown.classList.toggle('hidden');
            if (!dropdown.classList.contains('hidden')) {
                searchInput.focus();
            }
        });

        this.components.set(element, { 
            type: 'multiselect', 
            wrapper, 
            options,
            originalOptions,
            dropdown,
            selectedContainer,
            searchInput,
            optionsContainer
        });
    }

    populateMultiSelectOptions(container, options, selectElement) {
        container.innerHTML = '';
        
        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'multiselect-option px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center';
            optionDiv.innerHTML = `
                <input type="checkbox" class="mr-2" ${option.selected ? 'checked' : ''} value="${option.value}">
                <span>${option.text}</span>
            `;

            optionDiv.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = optionDiv.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                this.updateMultiSelectValue(selectElement);
            });

            container.appendChild(optionDiv);
        });
    }

    updateMultiSelectValue(selectElement) {
        const component = this.components.get(selectElement);
        const checkboxes = component.optionsContainer.querySelectorAll('input[type="checkbox"]');
        
        Array.from(selectElement.options).forEach(option => {
            option.selected = false;
        });

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const option = Array.from(selectElement.options).find(opt => opt.value === checkbox.value);
                if (option) option.selected = true;
            }
        });

        this.updateMultiSelectDisplay(component.selectedContainer, selectElement);
        selectElement.dispatchEvent(new Event('change'));
    }

    updateMultiSelectDisplay(container, selectElement) {
        const selectedOptions = Array.from(selectElement.selectedOptions);
        container.innerHTML = '';

        selectedOptions.forEach(option => {
            const tag = document.createElement('span');
            tag.className = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
            tag.innerHTML = `
                ${option.textContent}
                <button type="button" class="ml-1 text-blue-600 hover:text-blue-800" onclick="this.parentElement.remove(); advancedFormInputs.updateMultiSelectValue(document.querySelector('select[data-multiselect]'))">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(tag);
        });
    }

    createFileUpload(element) {
        const options = this.getElementOptions(element, 'file-upload');
        const {
            multiple = false,
            accept = '*/*',
            maxSize = 10 * 1024 * 1024, // 10MB
            dragDrop = true,
            preview = true
        } = options;

        element.style.display = 'none';
        element.multiple = multiple;
        element.accept = accept;

        const wrapper = document.createElement('div');
        wrapper.className = 'file-upload-wrapper';
        element.parentNode.insertBefore(wrapper, element);

        const uploadAreaHtml = `
            <div class="file-upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${dragDrop ? 'drag-drop-enabled' : ''}">
                <div class="upload-icon mb-4">
                    <i class="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                </div>
                <div class="upload-text">
                    <p class="text-lg font-medium text-gray-700 mb-2">
                        ${dragDrop ? 'Drag and drop files here, or' : ''} 
                        <button type="button" class="text-blue-600 hover:text-blue-800 underline">browse</button>
                    </p>
                    <p class="text-sm text-gray-500">
                        ${multiple ? 'Multiple files allowed' : 'Single file only'} • 
                        Max size: ${this.formatFileSize(maxSize)}
                    </p>
                </div>
            </div>
            ${preview ? '<div class="file-preview mt-4"></div>' : ''}
        `;

        wrapper.innerHTML = uploadAreaHtml;
        wrapper.appendChild(element);

        const uploadArea = wrapper.querySelector('.file-upload-area');
        const browseButton = wrapper.querySelector('button');
        const previewContainer = wrapper.querySelector('.file-preview');

        browseButton.addEventListener('click', () => element.click());

        if (dragDrop) {
            this.setupDragDrop(uploadArea, element);
        }

        element.addEventListener('change', () => {
            if (preview) {
                this.updateFilePreview(previewContainer, element.files);
            }
        });

        this.components.set(element, { 
            type: 'file-upload', 
            wrapper, 
            options,
            uploadArea,
            previewContainer
        });
    }

    setupDragDrop(area, input) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            area.addEventListener(eventName, () => {
                area.classList.add('border-blue-500', 'bg-blue-50');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, () => {
                area.classList.remove('border-blue-500', 'bg-blue-50');
            });
        });

        area.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            input.files = files;
            input.dispatchEvent(new Event('change'));
        });
    }

    updateFilePreview(container, files) {
        container.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2';
            
            const isImage = file.type.startsWith('image/');
            
            fileItem.innerHTML = `
                <div class="file-info flex items-center">
                    <div class="file-icon mr-3">
                        ${isImage ? 
                            `<img src="${URL.createObjectURL(file)}" alt="${file.name}" class="w-10 h-10 object-cover rounded">` :
                            `<i class="fas fa-file text-2xl text-gray-400"></i>`
                        }
                    </div>
                    <div>
                        <div class="file-name font-medium text-gray-900">${file.name}</div>
                        <div class="file-size text-sm text-gray-500">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button type="button" class="remove-file text-red-600 hover:text-red-800" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            container.appendChild(fileItem);
        });

        // Add remove functionality
        container.addEventListener('click', (e) => {
            if (e.target.closest('.remove-file')) {
                const index = parseInt(e.target.closest('.remove-file').dataset.index);
                this.removeFileFromInput(container.closest('.file-upload-wrapper').querySelector('input[type="file"]'), index);
            }
        });
    }

    removeFileFromInput(input, indexToRemove) {
        const dt = new DataTransfer();
        const files = Array.from(input.files);
        
        files.forEach((file, index) => {
            if (index !== indexToRemove) {
                dt.items.add(file);
            }
        });
        
        input.files = dt.files;
        input.dispatchEvent(new Event('change'));
    }

    createColorPicker(element) {
        const options = this.getElementOptions(element, 'colorpicker');
        const {
            format = 'hex',
            presets = [],
            alpha = false
        } = options;

        const wrapper = document.createElement('div');
        wrapper.className = 'colorpicker-wrapper relative';
        element.parentNode.insertBefore(wrapper, element);

        element.type = 'color';
        element.className += ' colorpicker-input';

        const display = document.createElement('div');
        display.className = 'colorpicker-display flex items-center border border-gray-300 rounded-md p-2 cursor-pointer bg-white';
        display.innerHTML = `
            <div class="color-swatch w-6 h-6 rounded border border-gray-300 mr-2" style="background-color: ${element.value}"></div>
            <span class="color-value text-sm font-mono">${element.value}</span>
        `;

        wrapper.insertBefore(display, element);
        element.style.display = 'none';

        display.addEventListener('click', () => element.click());

        element.addEventListener('change', () => {
            const swatch = display.querySelector('.color-swatch');
            const valueSpan = display.querySelector('.color-value');
            swatch.style.backgroundColor = element.value;
            valueSpan.textContent = element.value;
        });

        this.components.set(element, { type: 'colorpicker', wrapper, options, display });
    }

    createRangeSlider(element) {
        const options = this.getElementOptions(element, 'range-slider');
        const {
            showValue = true,
            showLabels = true,
            step = 1,
            dual = false
        } = options;

        const wrapper = document.createElement('div');
        wrapper.className = 'range-slider-wrapper';
        element.parentNode.insertBefore(wrapper, element);

        element.className += ' range-slider-input w-full';

        const sliderHtml = `
            ${showLabels ? `
                <div class="range-labels flex justify-between text-sm text-gray-500 mb-2">
                    <span>${element.min || 0}</span>
                    <span>${element.max || 100}</span>
                </div>
            ` : ''}
            <div class="range-track relative">
                <div class="range-progress absolute bg-blue-600 h-2 rounded" style="left: 0%; width: ${((element.value - (element.min || 0)) / ((element.max || 100) - (element.min || 0))) * 100}%;"></div>
            </div>
            ${showValue ? `
                <div class="range-value text-center mt-2">
                    <span class="current-value font-medium">${element.value}</span>
                </div>
            ` : ''}
        `;

        wrapper.innerHTML = sliderHtml;
        wrapper.appendChild(element);

        const progressBar = wrapper.querySelector('.range-progress');
        const valueDisplay = wrapper.querySelector('.current-value');

        element.addEventListener('input', () => {
            const percentage = ((element.value - (element.min || 0)) / ((element.max || 100) - (element.min || 0))) * 100;
            progressBar.style.width = percentage + '%';
            if (valueDisplay) valueDisplay.textContent = element.value;
        });

        this.components.set(element, { type: 'range-slider', wrapper, options, progressBar });
    }

    createRichEditor(element) {
        const options = this.getElementOptions(element, 'rich-editor');
        const {
            toolbar = ['bold', 'italic', 'underline', 'link', 'list'],
            height = '200px'
        } = options;

        const wrapper = document.createElement('div');
        wrapper.className = 'rich-editor-wrapper border border-gray-300 rounded-md';
        element.parentNode.insertBefore(wrapper, element);

        element.style.display = 'none';

        const toolbarHtml = this.createToolbarHtml(toolbar);
        const editorHtml = `
            <div class="rich-editor-toolbar border-b border-gray-300 p-2 bg-gray-50">
                ${toolbarHtml}
            </div>
            <div class="rich-editor-content" contenteditable="true" style="min-height: ${height}; padding: 12px; outline: none;">
                ${element.value}
            </div>
        `;

        wrapper.innerHTML = editorHtml;
        wrapper.appendChild(element);

        const editorContent = wrapper.querySelector('.rich-editor-content');
        const toolbarButtons = wrapper.querySelectorAll('.toolbar-button');

        editorContent.addEventListener('input', () => {
            element.value = editorContent.innerHTML;
        });

        toolbarButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const command = button.dataset.command;
                const value = button.dataset.value || null;
                document.execCommand(command, false, value);
                editorContent.focus();
            });
        });

        this.components.set(element, { type: 'rich-editor', wrapper, options, editorContent });
    }

    createToolbarHtml(tools) {
        const toolbarItems = {
            bold: '<button type="button" class="toolbar-button p-2 hover:bg-gray-200 rounded" data-command="bold"><i class="fas fa-bold"></i></button>',
            italic: '<button type="button" class="toolbar-button p-2 hover:bg-gray-200 rounded" data-command="italic"><i class="fas fa-italic"></i></button>',
            underline: '<button type="button" class="toolbar-button p-2 hover:bg-gray-200 rounded" data-command="underline"><i class="fas fa-underline"></i></button>',
            link: '<button type="button" class="toolbar-button p-2 hover:bg-gray-200 rounded" data-command="createLink" onclick="this.setAttribute(\'data-value\', prompt(\'Enter URL:\'))"><i class="fas fa-link"></i></button>',
            list: '<button type="button" class="toolbar-button p-2 hover:bg-gray-200 rounded" data-command="insertUnorderedList"><i class="fas fa-list-ul"></i></button>'
        };

        return tools.map(tool => toolbarItems[tool] || '').join('');
    }

    createSearchInput(element) {
        const options = this.getElementOptions(element, 'search-input');
        const {
            minLength = 2,
            delay = 300,
            url = null,
            placeholder = 'Search...'
        } = options;

        const wrapper = document.createElement('div');
        wrapper.className = 'search-input-wrapper relative';
        element.parentNode.insertBefore(wrapper, element);

        element.placeholder = placeholder;
        element.className += ' search-input pr-10';

        const iconHtml = `
            <div class="search-icon absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <i class="fas fa-search"></i>
            </div>
            <div class="search-results absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg hidden max-h-60 overflow-y-auto">
            </div>
        `;

        wrapper.appendChild(element);
        wrapper.insertAdjacentHTML('beforeend', iconHtml);

        const resultsContainer = wrapper.querySelector('.search-results');
        let searchTimeout;

        element.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = element.value.trim();

            if (query.length >= minLength) {
                searchTimeout = setTimeout(() => {
                    this.performSearch(element, query, resultsContainer, options);
                }, delay);
            } else {
                resultsContainer.classList.add('hidden');
            }
        });

        this.components.set(element, { type: 'search-input', wrapper, options, resultsContainer });
    }

    performSearch(element, query, resultsContainer, options) {
        if (options.url) {
            fetch(`${options.url}?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    this.displaySearchResults(resultsContainer, data, element);
                })
                .catch(error => {
                    console.error('Search error:', error);
                });
        } else {
            // Custom search logic can be implemented here
            this.triggerEvent('searchPerformed', { element, query });
        }
    }

    displaySearchResults(container, results, inputElement) {
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div class="p-3 text-gray-500 text-sm">No results found</div>';
        } else {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0';
                resultItem.innerHTML = `
                    <div class="font-medium">${result.title || result.name || result.label}</div>
                    ${result.description ? `<div class="text-sm text-gray-500">${result.description}</div>` : ''}
                `;
                
                resultItem.addEventListener('click', () => {
                    inputElement.value = result.title || result.name || result.label;
                    container.classList.add('hidden');
                    this.triggerEvent('searchResultSelected', { result, element: inputElement });
                });
                
                container.appendChild(resultItem);
            });
        }
        
        container.classList.remove('hidden');
    }

    getElementOptions(element, componentType) {
        const dataAttr = element.getAttribute(`data-${componentType}`);
        try {
            return dataAttr ? JSON.parse(dataAttr) : {};
        } catch {
            return {};
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    destroy(element) {
        const component = this.components.get(element);
        if (component && component.wrapper) {
            component.wrapper.parentNode.insertBefore(element, component.wrapper);
            component.wrapper.remove();
            this.components.delete(element);
        }
    }
}

window.advancedFormInputs = new AdvancedFormInputs();