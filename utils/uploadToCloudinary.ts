export const uploadToCloudinary = async (file: File, resourceType: "image" | "video" | "raw" | "auto" = "auto") => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary env variables missing:", { cloudName: !!cloudName, uploadPreset: !!uploadPreset });
    throw new Error("Cloudinary env variables are not set");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload failed:", response.status, errorText);
      throw new Error(`Failed to upload to Cloudinary: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type,
      size: data.bytes,
      altText: data.display_name
    };
  } catch (error) {
    console.error("Error in uploadToCloudinary:", error);
    throw error;
  }
};
