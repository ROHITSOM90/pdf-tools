// PDF Merger Tool Functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const mergeBtn = document.getElementById('mergeBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    let files = [];
    
    // Handle drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
            file.type === 'application/pdf'
        );
        
        if (droppedFiles.length > 0) {
            files = [...files, ...droppedFiles];
            updateFileList();
        } else {
            alert('Please only upload PDF files.');
        }
    });
    
    // Handle file input
    fileInput.addEventListener('change', () => {
        const selectedFiles = Array.from(fileInput.files);
        files = [...files, ...selectedFiles];
        updateFileList();
        fileInput.value = '';
    });
    
    // Update file list UI
    function updateFileList() {
        fileList.innerHTML = '';
        
        if (files.length === 0) {
            mergeBtn.disabled = true;
            clearBtn.disabled = true;
            return;
        }
        
        mergeBtn.disabled = false;
        clearBtn.disabled = false;
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <div class="file-actions">
                    <button class="action-btn move-up" data-index="${index}">↑</button>
                    <button class="action-btn move-down" data-index="${index}">↓</button>
                    <button class="action-btn remove-file" data-index="${index}">×</button>
                </div>
            `;
            
            fileList.appendChild(fileItem);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.move-up').forEach(btn => {
            btn.addEventListener('click', moveFileUp);
        });
        
        document.querySelectorAll('.move-down').forEach(btn => {
            btn.addEventListener('click', moveFileDown);
        });
        
        document.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', removeFile);
        });
    }
    
    // File actions
    function moveFileUp(e) {
        const index = parseInt(e.target.dataset.index);
        if (index > 0) {
            [files[index], files[index - 1]] = [files[index - 1], files[index]];
            updateFileList();
        }
    }
    
    function moveFileDown(e) {
        const index = parseInt(e.target.dataset.index);
        if (index < files.length - 1) {
            [files[index], files[index + 1]] = [files[index + 1], files[index]];
            updateFileList();
        }
    }
    
    function removeFile(e) {
        const index = parseInt(e.target.dataset.index);
        files.splice(index, 1);
        updateFileList();
    }
    
    // Clear all files
    clearBtn.addEventListener('click', () => {
        files = [];
        updateFileList();
    });
    
    // Merge PDFs (this would be replaced with actual PDF merging logic)
    mergeBtn.addEventListener('click', () => {
        if (files.length < 2) {
            alert('Please add at least 2 PDF files to merge.');
            return;
        }
        
        // In a real implementation, you would use a PDF library here
        alert('In a real implementation, this would merge the PDFs. Added files: ' + 
              files.map(f => f.name).join(', '));
        
        // For a real implementation, you might use:
        // 1. pdf-lib (https://pdf-lib.js.org/)
        // 2. pdf.js (https://mozilla.github.io/pdf.js/)
        // 3. Or a server-side solution if files are too large
    });
});
