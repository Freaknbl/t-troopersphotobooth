import qrcode

# Ganti dengan link hasil upload dari Cloudinary
cloudinary_url = "https://res.cloudinary.com/mybrand/image/upload/v1/yourimage.png"

qr = qrcode.make(cloudinary_url)
qr.save("cloudinary_qrcode.png")

print("QR Code berhasil dibuat!")
