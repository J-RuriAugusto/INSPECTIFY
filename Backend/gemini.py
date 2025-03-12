import cloudinary
import cloudinary.uploader
import cloudinary.api

# Configure Cloudinary
cloudinary.config(
  cloud_name = 'dyk1pt3m0',
  api_key = '659992535979588',
  api_secret = 'iSFSClD2sHogG5bLgkChECo0ZyM'
)

# Upload the image to Cloudinary
upload_result = cloudinary.uploader.upload("Pumpkins.jpg")

# Print the URL of the uploaded image
print("Cloudinary URL:", upload_result['url'])