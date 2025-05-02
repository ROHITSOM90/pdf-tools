// PDF Split Tool
class PDFSplitter {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.splitBtn = document.getElementById('splitBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.pagePreview = document.getElementById('pagePreview');
        this.pageThumbnails = document.getElementById('pageThumbnails');
        this.splitMethods = document.querySelectorAll('input[name="splitMethod"]');
        this.rangeOptions = document.getElementById('rangeOptions');
        this.everyOptions = document.getElementById('everyOptions');
        this.pageRange = document.getElementById('pageRange');
        this.splitEvery = document.getElementById('splitEvery');
        
        this.pdfDoc = null;
        this.pageCount = 0;
        this.selectedPages = new Set();
        
        this.initEvents();
    }
    
    initEvents() {
        // File input change
        this.fileInput.addEventListener('change', () => this.handleFileSelect());
        
        // Split method change
        this.splitMethods.forEach(method => {
            method.addEventListener('change', () => this.updateSplitMethodUI());
        });
        
        // Split button click
        this.splitBtn.addEventListener('click', () => this.splitPDF());
        
        // Clear button click
        this.clearBtn.addEventListener('click', () => this.resetTool());
    }
    
    async handleFileSelect() {
        const file = this.fileInput.files[0];
        if (!file) return;
        
        try {
            this.splitBtn.disabled = true;
            this.splitBtn.textContent = 'Loading PDF...';
            
            // Load PDF.js
            const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js');
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
            
            const fileReader = new FileReader();
            fileReader.onload = async () => {
                const typedArray = new Uint8Array(fileReader.result);
                this.pdfDoc = await pdfjsLib.getDocument(typedArray).promise;
                this.pageCount = this.pdfDoc.numPages;
                
                this.showPagePreview();
                this.splitBtn.disabled = false;
                this.splitBtn.textContent = 'Split PDF';
                this.clearBtn.disabled = false;
            };
            fileReader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error loading PDF. Please try again.');
            this.splitBtn.disabled = false;
            this.splitBtn.textContent = 'Split PDF';
        }
    }
    
    async showPagePreview() {
        this.pagePreview.style.display = 'block';
        this.pageThumbnails.innerHTML = '';
        this.selectedPages.clear();
        
        // Generate thumbnails for first few pages
        const pagesToShow = Math.min(this.pageCount, 10);
        for (let i = 1; i <= pagesToShow; i++) {
            const page = await this.pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            const thumbnail = document.createElement('div');
            thumbnail.className = 'page-thumbnail';
            thumbnail.dataset.pageNumber = i;
            
            thumbnail.innerHTML = `
                <img src="${canvas.toDataURL()}" alt="Page ${i}" style="max-width: 100%;">
                <div class="page-number">Page ${i}</div>
            `;
            
            thumbnail.addEventListener('click', () => this.togglePageSelection(i, thumbnail));
            this.pageThumbnails.appendChild(thumbnail);
        }
        
        if (this.pageCount > 10) {
            const moreText = document.createElement('div');
            moreText.textContent = `+ ${this.pageCount - 10} more pages...`;
            moreText.style.textAlign = 'center';
            moreText.style.padding = '10px';
            this.pageThumbnails.appendChild(moreText);
        }
    }
    
    togglePageSelection(pageNumber, element) {
        if (this.selectedPages.has(pageNumber)) {
            this.selectedPages.delete(pageNumber);
            element.classList.remove('selected');
        } else {
            this.selectedPages.add(pageNumber);
            element.classList.add('selected');
        }
    }
    
    updateSplitMethodUI() {
        const selectedMethod = document.querySelector('input[name="splitMethod"]:checked').value;
        
        this.rangeOptions.style.display = selectedMethod === 'range' ? 'block' : 'none';
        this.everyOptions.style.display = selectedMethod === 'every' ? 'block' : 'none';
        
        if (selectedMethod === 'selected') {
            this.pagePreview.style.display = 'block';
        } else {
            this.pagePreview.style.display = 'none';
        }
    }
    
    async splitPDF() {
        if (!this.pdfDoc) return;
        
        const method = document.querySelector('input[name="splitMethod"]:checked').value;
        
        try {
            this.splitBtn.disabled = true;
            this.splitBtn.textContent = 'Processing...';
            
            // Load PDF-lib for creating new PDFs
            const { PDFDocument } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@^1.16.0/dist/pdf-lib.min.js');
            
            let pageRanges = [];
            
            if (method === 'range') {
                pageRanges = this.parsePageRange(this.pageRange.value);
            } else if (method === 'every') {
                const every = parseInt(this.splitEvery.value) || 1;
                for (let i = 1; i <= this.pageCount; i += every) {
                    const end = Math.min(i + every - 1, this.pageCount);
                    pageRanges.push({ start: i, end: end });
                }
            } else if (method === 'selected') {
                if (this.selectedPages.size === 0) {
                    alert('Please select at least one page');
                    return;
                }
                Array.from(this.selectedPages).forEach(page => {
                    pageRanges.push({ start: page, end: page });
                });
            }
            
            // Create separate PDFs for each range
            for (const range of pageRanges) {
                const newPdf = await PDFDocument.create();
                for (let i = range.start; i <= range.end; i++) {
                    const [page] = await newPdf.copyPages(this.pdfDoc, [i - 1]);
                    newPdf.addPage(page);
                }
                
                const pdfBytes = await newPdf.save();
                this.downloadFile(
                    pdfBytes, 
                    `split-pages-${range.start}-${range.end}.pdf`
                );
            }
            
            alert(`Successfully split PDF into ${pageRanges.length} files`);
            
        } catch (error) {
            console.error('Error splitting PDF:', error);
            alert('Error splitting PDF. Please try again.');
        } finally {
            this.splitBtn.disabled = false;
            this.splitBtn.textContent = 'Split PDF';
        }
    }
    
    parsePageRange(rangeStr) {
        // Simple range parser - in a real app you'd want more robust parsing
        const ranges = rangeStr.split(',');
        const result = [];
        
        for (const range of ranges) {
            const parts = range.split('-');
            if (parts.length === 1) {
                const page = parseInt(parts[0]);
                if (!isNaN(page) && page >= 1 && page <= this.pageCount) {
                    result.push({ start: page, end: page });
                }
            } else if (parts.length === 2) {
                const start = parseInt(parts[0]);
                const end = parseInt(parts[1]);
                if (!isNaN(start) && !isNaN(end) && 
                    start >= 1 && end <= this.pageCount && start <= end) {
                    result.push({ start: start, end: end });
                }
            }
        }
        
        return result.length > 0 ? result : [{ start: 1, end: this.pageCount }];
    }
    
    downloadFile(data, filename) {
        const blob = new Blob([data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    resetTool() {
        this.fileInput.value = '';
        this.pdfDoc = null;
        this.pageCount = 0;
        this.selectedPages.clear();
        this.pagePreview.style.display = 'none';
        this.pageThumbnails.innerHTML = '';
        this.splitBtn.disabled = true;
        this.clearBtn.disabled = true;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('splitBtn')) {
        new PDFSplitter();
    }
});
