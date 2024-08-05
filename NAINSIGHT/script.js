// pdf.js 라이브러리 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs/pdf.worker.js';

// 드래그 앤 드롭 영역 설정
const dropZone = document.getElementById('drop-zone');
const pdfContainer = document.getElementById('pdf-container');

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            renderPDF(typedarray);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Please drop a valid PDF file.');
    }
});

// PDF 파일 렌더링 함수
function renderPDF(typedarray) {
    pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
        pdfContainer.innerHTML = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then((page) => {
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
                    pdfContainer.appendChild(canvas);
                });
            });
        }
    });   
}