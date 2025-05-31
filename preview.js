import QRCode from "https://cdn.skypack.dev/qrcode";

document.addEventListener("DOMContentLoaded", () => {
    const previewCanvas = document.getElementById("previewCanvas");
    const previewContext = previewCanvas.getContext("2d");
    const frameSelect = document.getElementById("frameSelect");
    const downloadBtn = document.getElementById("downloadBtn");
    const gifDownloadBtn = document.getElementById("downloadGifButton");

    previewCanvas.width = 758;
    previewCanvas.height = 2048;

    const storedImages = JSON.parse(localStorage.getItem("photoBoothPreview"));

    if (!storedImages || storedImages.length !== 4) {
        alert("Tidak ada foto yang tersedia. Kembali dan ambil foto lagi.");
        window.location.href = "index.html";
        return;
    }

    let frameImage = new Image();

    function drawImages(callback) {
        previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        let loadedCount = 0;

        storedImages.forEach((imageSrc, index) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = imageSrc;

            img.onload = () => {
                const positions = [
                    { x: 224, y: 106, width: 310, height: 345 },
                    { x: 224, y: 496, width: 310, height: 345 },
                    { x: 224, y: 887, width: 310, height: 345 },
                    { x: 224, y: 1277, width: 310, height: 345 }
                ];

                const target = positions[index];
                const imgRatio = img.width / img.height;
                const targetRatio = target.width / target.height;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (imgRatio > targetRatio) {
                    drawHeight = target.height;
                    drawWidth = img.width * (drawHeight / img.height);
                    offsetX = target.x - (drawWidth - target.width) / 2;
                    offsetY = target.y;
                } else {
                    drawWidth = target.width;
                    drawHeight = img.height * (drawWidth / img.width);
                    offsetX = target.x;
                    offsetY = target.y - (drawHeight - target.height) / 2;
                }

                previewContext.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

                loadedCount++;
                if (loadedCount === storedImages.length) {
                    previewContext.drawImage(frameImage, 0, 0, previewCanvas.width, previewCanvas.height);
                    if (callback) callback();
                }
                window.drawImages = drawImages;
            };
        });

        frameImage.crossOrigin = "anonymous";
        frameImage.src = `asset/${frameSelect.value}`;
    }
    window.drawImages = drawImages;

    frameSelect.addEventListener("change", () => drawImages());

    downloadBtn.addEventListener("click", () => {
        showSpinner();
        drawImages(async () => {
            try {
                const dataURL = previewCanvas.toDataURL("image/png");

                const formData = new FormData();
                formData.append("file", dataURL);
                formData.append("upload_preset", "photobooth_unsigned");
                formData.append("cloud_name", "photoboothtelkomsel");

                const response = await fetch("https://api.cloudinary.com/v1_1/photoboothtelkomsel/image/upload", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();
                const imageUrl = result.secure_url;

                const qrDataUrl = await QRCode.toDataURL(imageUrl, { width: 100, margin: 1 });
                const qrImg = new Image();
                qrImg.crossOrigin = "anonymous";
                qrImg.src = qrDataUrl;

                qrImg.onload = () => {
                    previewContext.drawImage(qrImg, previewCanvas.width - 120, previewCanvas.height - 120, 100, 100);

                    const finalLink = document.createElement("a");
                    finalLink.download = "photobooth_with_qr.png";
                    finalLink.href = previewCanvas.toDataURL("image/png");
                    finalLink.click();

                    hideSpinner();
                };

                qrImg.onerror = () => {
                    alert("Gagal memuat QR ke dalam canvas.");
                    hideSpinner();
                };

            } catch (err) {
                alert("Gagal proses download: " + err.message);
                hideSpinner();
            }
        });
    });

    let isRenderingGif = false;

    gifDownloadBtn.addEventListener("click", () => {
        if (isRenderingGif) {
            alert("GIF sedang diproses. Mohon tunggu...");
            return;
        }

        isRenderingGif = true;
        gifDownloadBtn.disabled = true;
        gifDownloadBtn.innerText = "Processing...";
        showSpinner();

        const frameOverlay = new Image();
        frameOverlay.src = 'asset/framegif.png';
        frameOverlay.crossOrigin = "anonymous";

        const imageFrames = storedImages.map(src => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = src;
            return img;
        });

        Promise.all([
            new Promise(resolve => frameOverlay.onload = resolve),
            ...imageFrames.map(img => new Promise(resolve => img.onload = resolve))
        ]).then(() => {
            const tempGif = new GIF({
                workers: 2,
                quality: 10,
                workerScript: 'gif.worker.js',
            });

            imageFrames.forEach((img) => {
                const canvas = document.createElement('canvas');
                const width = img.width;
                const height = img.height;

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0, width, height);
                ctx.drawImage(frameOverlay, 0, 0, width, height);

                tempGif.addFrame(canvas, { delay: 200 });
            });

            tempGif.on('finished', async function (blob) {
                const data = new FormData();
                data.append("file", blob);
                data.append("upload_preset", "photobooth_unsigned");
                data.append("cloud_name", "photoboothtelkomsel");

                try {
                    const uploadRes = await fetch("https://api.cloudinary.com/v1_1/photoboothtelkomsel/image/upload", {
                        method: "POST",
                        body: data,
                    });

                    const uploadJson = await uploadRes.json();
                    const uploadedGifUrl = uploadJson.secure_url;

                    const qrDataUrl = await QRCode.toDataURL(uploadedGifUrl, { width: 70 });

                    const qrImg = new Image();
                    qrImg.src = qrDataUrl;

                    qrImg.onload = () => {
                        const finalGif = new GIF({
                            workers: 2,
                            quality: 10,
                            workerScript: 'gif.worker.js',
                        });

                        imageFrames.forEach((img) => {
                            const canvas = document.createElement('canvas');
                            canvas.width = frameOverlay.width;
                            canvas.height = frameOverlay.height;
                            const ctx = canvas.getContext('2d');

                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            ctx.drawImage(frameOverlay, 0, 0, canvas.width, canvas.height);

                            ctx.fillStyle = "#ffffff";
                            ctx.fillRect(canvas.width - 65, canvas.height - 65, 60, 60);
                            ctx.drawImage(qrImg, canvas.width - 60, canvas.height - 60, 50, 50);

                            finalGif.addFrame(canvas, { delay: 500 });
                        });

                        finalGif.on('finished', function (qrBlob) {
                            const url = URL.createObjectURL(qrBlob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = "photobooth_with_qr.gif";
                            link.click();

                            isRenderingGif = false;
                            gifDownloadBtn.disabled = false;
                            gifDownloadBtn.innerText = "Download GIF";
                            hideSpinner();
                        });

                        finalGif.render();
                    };

                } catch (err) {
                    console.error("Upload/QR error:", err);
                    alert("Gagal membuat QR Code atau upload gambar.");
                    isRenderingGif = false;
                    gifDownloadBtn.disabled = false;
                    gifDownloadBtn.innerText = "Download GIF";
                    hideSpinner();
                }
            });

            tempGif.render();
        });
    });

    function showSpinner() {
        const spinner = document.getElementById("loadingSpinner");
        if (spinner) spinner.style.display = "flex";
    }

    function hideSpinner() {
        const spinner = document.getElementById("loadingSpinner");
        if (spinner) spinner.style.display = "none";
    }

    drawImages(); // Initial render
});
