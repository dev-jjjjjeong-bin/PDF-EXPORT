const dropZone = document.getElementById('drop-zone');
const pdfContainer = document.getElementById('pdf-container');

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');

    const files = event.dataTransfer.files;
    // PDF 파일인지 확인
    if (files.length > 0 && files[0].type === 'application/pdf') {
        const file = files[0];
        const fileReader = new FileReader();

        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);

            try {
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                pdfContainer.innerHTML = ''; // 기존 PDF 내용을 지움

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const scale = 1.5;
                    const viewport = page.getViewport({ scale: scale });

                    const canvas = document.createElement('canvas');
                    const canvasContext = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    pdfContainer.appendChild(canvas);

                    const renderContext = {
                        canvasContext: canvasContext,
                        viewport: viewport
                    };
                    await page.render(renderContext).promise;
                }
            } catch (error) {
                console.error('Error rendering PDF:', error);
                alert('Error loading PDF. Check the console for details.');
            }
        };

        fileReader.readAsArrayBuffer(file);
    } else {
        alert('Please drop a valid PDF file.');
    }
});

// 브라우저 기본 PDF 드래그 앤 드롭 동작 방지
window.addEventListener('dragover', function(e) {
    e.preventDefault();
}, false);

window.addEventListener('drop', function(e) {
    e.preventDefault();
}, false);