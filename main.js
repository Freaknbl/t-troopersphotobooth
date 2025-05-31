import "/style.css";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureButton = document.getElementById("capture");
const imagesContainer = document.getElementById("images-container");

const filterSelect = document.createElement("select");
filterSelect.innerHTML = `
  <option value="original">Original</option>
  <option value="bw">Black & White</option>
`;
filterSelect.style.width = "100%";
filterSelect.style.textAlign = "center";
filterSelect.style.padding = "11px";

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            console.log(`Resolusi Video: ${video.videoWidth} x ${video.videoHeight} px`);
        };
    } catch (err) {
        console.error("Error accessing the camera: ", err);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    initCamera();
    const buttonContainer = document.querySelector(".button-container");

    if (buttonContainer) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.gap = "20px";
        wrapper.style.width = "100%";
        wrapper.style.justifyContent = "center";

        filterSelect.style.width = "125px";

        wrapper.appendChild(filterSelect);
        wrapper.appendChild(captureButton);

        buttonContainer.innerHTML = "";
        buttonContainer.appendChild(wrapper);
    }
});

filterSelect.classList.add("filter-select");

filterSelect.addEventListener("change", applyFilter);
function applyFilter() {
    video.style.filter = filterSelect.value === "bw" ? "grayscale(100%)" : "none";
}

captureButton.addEventListener("click", () => {
    localStorage.removeItem("photoBoothPreview"); 
    startCaptureSequence(4);
});

function startCaptureSequence(remainingShots) {
    if (remainingShots === 0) return;

    let count = 3;
    const countdownPopup = document.getElementById("countdownPopup");
    const countdownText = document.getElementById("countdownText");

    countdownPopup.style.display = "block";

    function countdown() {
        if (count > 0) {
            countdownText.textContent = count;
            setTimeout(() => {
                count--;
                countdown();
            }, 1000);
        } else {
            countdownPopup.style.display = "none";
            captureImage();
            setTimeout(() => startCaptureSequence(remainingShots - 1), 1000);
        }
    }

    countdown();
}

async function uploadToCloudinary(imageDataUrl) {
    const cloudName = "photoboothtelkomsel";
    const uploadPreset = "photobooth_unsigned";

    const formData = new FormData();
    formData.append("file", imageDataUrl);
    formData.append("upload_preset", uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("✅ Gambar berhasil diupload ke Cloudinary:", data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error("❌ Gagal upload ke Cloudinary:", error);
        return null;
    }
}

function captureImage() {
    const context = canvas.getContext("2d");
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
        alert("Kamera belum siap.");
        return;
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    context.filter = filterSelect.value === "bw" ? "grayscale(100%)" : "none";
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    const imgData = canvas.toDataURL("image/png");

    const capturedImage = new Image();
    capturedImage.src = imgData;
    capturedImage.style.width = "170px";
    capturedImage.style.height = "auto";

    imagesContainer.appendChild(capturedImage);

    uploadToCloudinary(imgData).then((url) => {
    if (url) {
        const stored = JSON.parse(localStorage.getItem("photoBoothPreview")) || [];
        stored.push(url);
        localStorage.setItem("photoBoothPreview", JSON.stringify(stored));

        console.log("Jumlah foto tersimpan:", stored.length); // 👈 Tambahan debug

        if (stored.length === 4) {
            console.log("✅ 4 foto berhasil disimpan. Arahkan ke preview.html");
            setTimeout(() => {
                window.location.href = "preview.html";
            }, 1000);
        }
    } else {
        console.error("❌ Upload gagal. Tidak redirect.");
    }
});
}

// QR Modal (jika digunakan)
document.addEventListener("DOMContentLoaded", () => {
    const qrModal = document.getElementById("qrModal");
    const qrCodeContainer = document.getElementById("qrcode");
    const closeBtn = document.querySelector(".close");
    const qrCodeButton = document.getElementById("qrCodeBtn");

    function openQRCodeModal() {
        const imageUrl = document.getElementById("previewCanvas").toDataURL("image/png");
        qrCodeContainer.innerHTML = "";
        new QRCode(qrCodeContainer, {
            text: imageUrl,
            width: 150,
            height: 150
        });
        qrModal.style.display = "block";
    }

    function closeQRCodeModal() {
        qrModal.style.display = "none";
    }

    qrCodeButton?.addEventListener("click", openQRCodeModal);
    closeBtn?.addEventListener("click", closeQRCodeModal);
    window.onclick = (event) => {
        if (event.target === qrModal) {
            closeQRCodeModal();
        }
    };
});
