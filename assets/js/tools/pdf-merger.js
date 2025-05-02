// Updated pdf-merger.js with actual PDF merging (requires PDF-lib)
document.addEventListener('DOMContentLoaded', async function() {
    // Previous UI code remains the same...
    
    // Updated merge functionality
    mergeBtn.addEventListener('click', async () => {
        if (files.length < 2) {
            alert('Please add at least 2 PDF files to merge.');
            return;
        }

        mergeBtn.disabled = true;
        mergeBtn.textContent = 'Merging...';
        
        try {
            // Load PDF-lib dynamically
            const { PDFDocument } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@^1.16.0/dist/pdf-lib.min.js');
            
            const mergedPdf = await PDFDocument.create();
            
            for (const file of files) {
                const fileBytes = await readFileAsArrayBuffer(file);
                const pdfDoc = await PDFDocument.load(fileBytes);
                const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            }
            
            const mergedPdfBytes = await mergedPdf.save();
            downloadPdf(mergedPdfBytes, 'merged-document.pdf');
            
        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Error merging PDFs. Please try again.');
        } finally {
            mergeBtn.disabled = false;
            mergeBtn.textContent = 'Merge PDFs';
        }
    });
    
    // Helper functions
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    function downloadPdf(bytes, filename) {
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
