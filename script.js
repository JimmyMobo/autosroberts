let qrCode1 = null;
let qrCode2 = null;
let html5QrCode1, html5QrCode2;

async function startScan(scannerNumber) {
    try {
        const qrReaderId = `qr-reader${scannerNumber}`;
        const scanBtnId = `scan-btn${scannerNumber}`;
        
        // Solicitar permisos de cámara primero
        await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        const config = {
            fps: 10,
            qrbox: { width: 200, height: 200 },
            aspectRatio: 4/3,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true
        };
        
        if (scannerNumber === 1) {
            // Limpiar la instancia anterior si existe
            if (html5QrCode1) {
                await html5QrCode1.stop();
                html5QrCode1.clear();
            }
            html5QrCode1 = new Html5Qrcode(qrReaderId);
            
            await html5QrCode1.start(
                { facingMode: "environment" },
                config,
                (decodedText) => onScanSuccess(1, decodedText),
                onScanError
            );
        } else {
            // Limpiar la instancia anterior si existe
            if (html5QrCode2) {
                await html5QrCode2.stop();
                html5QrCode2.clear();
            }
            html5QrCode2 = new Html5Qrcode(qrReaderId);
            
            await html5QrCode2.start(
                { facingMode: "environment" },
                config,
                (decodedText) => onScanSuccess(2, decodedText),
                onScanError
            );
        }

        // Mostrar el contenedor del escáner y actualizar el botón
        const readerElement = document.getElementById(qrReaderId);
        readerElement.style.display = 'block';
        readerElement.style.backgroundColor = '#000'; // Fondo negro para mejor visibilidad
        document.getElementById(scanBtnId).disabled = true;
        
        // Asegurarse de que el video sea visible
        setTimeout(() => {
            const video = readerElement.querySelector('video');
            if (video) {
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
            }
        }, 1000);

    } catch (error) {
        console.error("Error al iniciar el escáner:", error);
        alert("Error al acceder a la cámara. Por favor, asegúrate de dar permisos de cámara al navegador y estar usando HTTPS.");
    }
}

function onScanSuccess(scannerNumber, decodedText) {
    if (scannerNumber === 1) {
        qrCode1 = decodedText;
        if (html5QrCode1) {
            html5QrCode1.stop();
        }
    } else {
        qrCode2 = decodedText;
        if (html5QrCode2) {
            html5QrCode2.stop();
        }
    }

    document.getElementById(`scan-btn${scannerNumber}`).textContent = 'Código escaneado ✓';
    
    if (qrCode1 && qrCode2) {
        validateCodes();
    }
}

function onScanError(errorMessage) {
    // Solo registrar errores críticos
    if (errorMessage.includes("NotAllowedError")) {
        console.error("Error: Permiso de cámara denegado");
        alert("Por favor, permite el acceso a la cámara para escanear códigos QR");
    }
}

function validateCodes() {
    const resultDiv = document.getElementById('result');
    if (qrCode1 === qrCode2) {
        resultDiv.innerHTML = `
            <div class="circle green">✓</div>
            <p>La información es correcta</p>
            <button onclick="window.location.href='https://forms.google.com'">Ir a Formulario</button>
            <button onclick="resetScan()">Regresar</button>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="circle red">✗</div>
            <p>El número del remolque y la carta porte no coinciden</p>
            <button onclick="resetScan()">Regresar</button>
        `;
    }
}

async function resetScan() {
    qrCode1 = null;
    qrCode2 = null;
    
    try {
        if (html5QrCode1) {
            await html5QrCode1.stop();
            html5QrCode1.clear();
        }
        if (html5QrCode2) {
            await html5QrCode2.stop();
            html5QrCode2.clear();
        }
    } catch (error) {
        console.error("Error al detener los escáneres:", error);
    }

    document.getElementById('qr-reader1').style.display = 'none';
    document.getElementById('qr-reader2').style.display = 'none';
    document.getElementById('scan-btn1').disabled = false;
    document.getElementById('scan-btn2').disabled = false;
    document.getElementById('scan-btn1').textContent = 'Escanear Primer QR';
    document.getElementById('scan-btn2').textContent = 'Escanear Segundo QR';
    document.getElementById('result').innerHTML = '';
}

// Limpiar los escáneres cuando se cierra la página
window.addEventListener('beforeunload', () => {
    if (html5QrCode1) html5QrCode1.stop();
    if (html5QrCode2) html5QrCode2.stop();
});