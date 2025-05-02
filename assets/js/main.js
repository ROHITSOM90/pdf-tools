// Main application script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', showTooltip);
        tooltip.addEventListener('mouseleave', hideTooltip);
    });
    
    // Initialize file upload components
    const fileUploads = document.querySelectorAll('.file-upload-wrapper');
    fileUploads.forEach(initFileUpload);
});

function showTooltip(e) {
    const tooltipText = this.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    
    const rect = this.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function initFileUpload(wrapper) {
    const label = wrapper.querySelector('.file-upload-label');
    const input = wrapper.querySelector('.file-upload-input');
    
    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        label.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        label.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        label.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        label.classList.add('drag-over');
    }
    
    function unhighlight() {
        label.classList.remove('drag-over');
    }
    
    // Handle file drop
    label.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        input.files = files;
        dispatchEvent(input, 'change');
    }
    
    function dispatchEvent(element, event) {
        const evt = new Event(event, {
            bubbles: true,
            cancelable: true,
        });
        element.dispatchEvent(evt);
    }
}
