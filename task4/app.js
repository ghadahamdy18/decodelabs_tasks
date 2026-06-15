// State
let mobilenetModel = null;
let tesseractWorker = null;

// DOM Elements - General
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');
const sampleImgs = document.querySelectorAll('.sample-img');

// DOM Elements - Image Classification
const imgUploadArea = document.getElementById('img-upload-area');
const imgInput = document.getElementById('img-input');
const imgWorkspace = document.getElementById('img-workspace');
const imgDisplay = document.getElementById('img-display');
const imgStatus = document.getElementById('img-status');
const imgResultsList = document.getElementById('img-results-list');
const imgReset = document.getElementById('img-reset');

// DOM Elements - OCR
const ocrUploadArea = document.getElementById('ocr-upload-area');
const ocrInput = document.getElementById('ocr-input');
const ocrWorkspace = document.getElementById('ocr-workspace');
const ocrDisplay = document.getElementById('ocr-display');
const ocrStatus = document.getElementById('ocr-status');
const ocrResultText = document.getElementById('ocr-result-text');
const ocrReset = document.getElementById('ocr-reset');
const ocrProgress = document.getElementById('ocr-progress');
const ocrProgressLabel = document.getElementById('ocr-progress-label');
const ocrProgressPct = document.getElementById('ocr-progress-pct');
const ocrProgressFill = document.getElementById('ocr-progress-fill');

// Initialization
async function init() {
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Sample images
    sampleImgs.forEach(img => {
        img.addEventListener('click', () => {
            const type = img.dataset.type;
            const src = img.src;
            
            if (type === 'img') {
                processImage(src, false);
            } else {
                processImage(src, true);
            }
        });
    });

    // Setup drag and drop
    setupDragAndDrop(imgUploadArea, imgInput, false);
    setupDragAndDrop(ocrUploadArea, ocrInput, true);

    // Reset buttons
    imgReset.addEventListener('click', () => resetWorkspace(false));
    ocrReset.addEventListener('click', () => resetWorkspace(true));

    // Load Models
    loadMobilenet();
    initTesseract();
}

function setupDragAndDrop(area, input, isOCR) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        area.addEventListener(eventName, () => area.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, () => area.classList.remove('dragover'), false);
    });

    area.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files, isOCR);
    });

    input.addEventListener('change', function() {
        handleFiles(this.files, isOCR);
    });
}

function handleFiles(files, isOCR) {
    if (files.length > 0) {
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            processImage(e.target.result, isOCR);
        };
        reader.readAsDataURL(file);
    }
}

function resetWorkspace(isOCR) {
    if (isOCR) {
        ocrWorkspace.classList.remove('active');
        ocrUploadArea.style.display = 'block';
        document.querySelector('#ocr-panel .samples-container').style.display = 'block';
        ocrResultText.textContent = '';
        ocrReset.classList.add('hidden');
        ocrInput.value = '';
    } else {
        imgWorkspace.classList.remove('active');
        imgUploadArea.style.display = 'block';
        document.querySelector('#image-panel .samples-container').style.display = 'block';
        imgResultsList.innerHTML = '';
        imgReset.classList.add('hidden');
        imgInput.value = '';
    }
}

// MobileNet Implementation
async function loadMobilenet() {
    try {
        mobilenetModel = await mobilenet.load();
        imgStatus.textContent = 'Ready';
        imgStatus.className = 'status success';
    } catch (error) {
        console.error('Error loading MobileNet:', error);
        imgStatus.textContent = 'Error Loading Model';
        imgStatus.className = 'status';
        imgStatus.style.background = 'rgba(239, 68, 68, 0.1)';
        imgStatus.style.color = '#ef4444';
    }
}

// Tesseract Implementation
async function initTesseract() {
    try {
        // Tesseract v5 creates worker implicitly during recognize
        ocrStatus.textContent = 'Ready';
        ocrStatus.className = 'status success';
    } catch (error) {
        console.error('Error initializing Tesseract:', error);
        ocrStatus.textContent = 'Error Initializing';
        ocrStatus.className = 'status';
        ocrStatus.style.background = 'rgba(239, 68, 68, 0.1)';
        ocrStatus.style.color = '#ef4444';
    }
}

async function processImage(imageSrc, isOCR) {
    if (isOCR) {
        ocrUploadArea.style.display = 'none';
        document.querySelector('#ocr-panel .samples-container').style.display = 'none';
        ocrWorkspace.classList.add('active');
        ocrDisplay.src = imageSrc;
        
        ocrStatus.textContent = 'Processing...';
        ocrStatus.className = 'status loading';
        ocrResultText.textContent = '';
        ocrReset.classList.add('hidden');
        ocrProgress.classList.remove('hidden');
        
        try {
            const result = await Tesseract.recognize(
                imageSrc,
                'eng',
                { logger: m => {
                    if (m.status === 'recognizing text') {
                        const pct = Math.round(m.progress * 100);
                        ocrProgressLabel.textContent = m.status;
                        ocrProgressPct.textContent = `${pct}%`;
                        ocrProgressFill.style.width = `${pct}%`;
                    }
                }}
            );
            
            ocrProgress.classList.add('hidden');
            ocrResultText.textContent = result.data.text || 'No text found.';
            ocrStatus.textContent = 'Complete';
            ocrStatus.className = 'status success';
        } catch (error) {
            console.error(error);
            ocrProgress.classList.add('hidden');
            ocrResultText.textContent = 'Error processing image.';
            ocrStatus.textContent = 'Error';
            ocrStatus.className = 'status';
        } finally {
            ocrReset.classList.remove('hidden');
        }

    } else {
        if (!mobilenetModel) {
            alert('Model is still loading. Please wait.');
            return;
        }

        imgUploadArea.style.display = 'none';
        document.querySelector('#image-panel .samples-container').style.display = 'none';
        imgWorkspace.classList.add('active');
        
        imgStatus.textContent = 'Analyzing...';
        imgStatus.className = 'status loading';
        imgResultsList.innerHTML = '';
        imgReset.classList.add('hidden');

        // We need to wait for the image to load in the DOM to analyze it
        imgDisplay.onload = async () => {
            try {
                const predictions = await mobilenetModel.classify(imgDisplay);
                renderPredictions(predictions);
                imgStatus.textContent = 'Complete';
                imgStatus.className = 'status success';
            } catch (error) {
                console.error(error);
                imgStatus.textContent = 'Analysis Failed';
                imgStatus.className = 'status';
            } finally {
                imgReset.classList.remove('hidden');
            }
        };
        imgDisplay.src = imageSrc;
    }
}

function renderPredictions(predictions) {
    imgResultsList.innerHTML = '';
    
    predictions.forEach((p, index) => {
        const percentage = Math.round(p.probability * 100);
        
        const item = document.createElement('div');
        item.className = 'prediction-item';
        
        // Split label and capitalize
        const label = p.className.split(',')[0];
        
        item.innerHTML = `
            <div class="prediction-info">
                <span class="prediction-label">${label}</span>
                <span class="prediction-score">${percentage}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
        
        imgResultsList.appendChild(item);
        
        // Animate progress bar
        setTimeout(() => {
            const fill = item.querySelector('.progress-fill');
            fill.style.width = `${percentage}%`;
        }, 100 * (index + 1));
    });
}

// Start app
window.onload = init;
