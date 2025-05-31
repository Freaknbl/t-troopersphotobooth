import "./style.css";

const video = document.getElementById("video");
const captureButton = document.getElementById("capture");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imagesContainer = document.getElementById("images-container");

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing webcam:", err);
    });

function captureImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    imagesContainer.appendChild(img);

    // Jika sudah ada 3 gambar, langsung ke preview.html
    if (imagesContainer.children.length === 3) {
        setTimeout(redirectToPreview, 1000);
    }
}

function redirectToPreview() {
    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = 440;
    frameCanvas.height = 150;
    const frameContext = frameCanvas.getContext("2d");

    const images = Array.from(imagesContainer.children).slice(-3);
    images.forEach((img, index) => {
        frameContext.drawImage(img, index * 150, 0, 140, 105);
    });

    const frameData = frameCanvas.toDataURL("image/png");
    localStorage.setItem("photoFrame", frameData);
    window.location.href = "preview.html";
}

function startCaptureSequence(remainingShots) {
    if (remainingShots === 0) {
        setTimeout(redirectToPreview, 1000);
        return;
    }
    let count = 3;
    function countdown() {
        if (count > 0) {
            captureButton.textContent = `Snap in ${count}...`;
            setTimeout(() => {
                count--;
                countdown();
            }, 1000);
        } else {
            captureButton.textContent = "Snap!";
            captureImage();
            setTimeout(() => startCaptureSequence(remainingShots - 1), 1000);
        }
    }
    countdown();
}

captureButton.addEventListener("click", () => startCaptureSequence(3));
