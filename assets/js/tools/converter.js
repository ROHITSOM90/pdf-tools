// Shared converter functionality
class PDFConverter {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.convertBtn = document.getElementById('convertBtn');
        this.fileList = document.getElementById('fileList');
        this.files = [];
        
        this.initEvents();
    }
    
    initEvents() {
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('active');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('active');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('active');
            
            const droppedFiles = Array.from(e.dataTransfer.files);
            this.handleFiles(droppedFiles);
        });
        
        // File input change
        this.fileInput.addEventListener('change', () => {
            const selectedFiles = Array.from(this.fileInput.files);
            this.handleFiles(selectedFiles);
            this.fileInput.value = '';
        });
        
        // Convert button click
        this.convertBtn.addEventListener('click', () => this.convertFiles());
    }
    
    handleFiles(newFiles) {
        // Filter by allowed file types (implemented in child classes)
        const allowedFiles = newFiles.filter(file => this.isFileTypeAllowed(file));
        
        if (allowedFiles.length > 0) {
            this.files = [...this.files, ...allowedFiles];
            this.updateFileList();
        } else {
            alert('Please only upload supported file types.');
        }
    }
    
    updateFileList() {
        this.fileList.innerHTML = '';
        
        if (this.files.length === 0) {
            this.convertBtn.disabled =
