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
    if (files.length > 0 && files[0].type === 'application/pdf') {
        const file = files[0];
        const fileReader = new FileReader();

        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);

            try {
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                pdfContainer.innerHTML = '';   // 기존 PDF 내용 삭제
                dropZone.style.opacity = '0';   // 드래그 앤 드랍 존 숨김

                // 드래그 앤 드랍 존 숨긴 후 PDF 표시
                setTimeout(() => {
                    dropZone.style.display = 'none';
                    pdfContainer.style.top = '0';   // PDF를 기존에 드래그 앤 드랍 존이 있던 상단부터 표시
                }, 500);

                // PDF 페이지 렌더링
                const viewportWidth = pdfContainer.clientWidth;
                const viewportHeight = pdfContainer.clientHeight;
                
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.0 });

                    // PDF의 비율을 유지하면서 크기를 조정 (화면 너비와 높이에 맞춤)
                    const scale = Math.min(
                        viewportWidth / viewport.width,
                        viewportHeight / viewport.height
                    );
                    const scaledViewport = page.getViewport({ scale: scale });

                    const canvas = document.createElement('canvas');
                    const canvasContext = canvas.getContext('2d');
                    canvas.width = scaledViewport.width;
                    canvas.height = scaledViewport.height;

                    pdfContainer.appendChild(canvas);

                    const renderContext = {
                        canvasContext: canvasContext,
                        viewport: scaledViewport
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

window.addEventListener('dragover', function(e) {
    e.preventDefault();
}, false);

window.addEventListener('drop', function(e) {
    e.preventDefault();
}, false);