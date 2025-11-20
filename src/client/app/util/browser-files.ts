export function downloadBinaryFile(data: BinaryData, fileName: string) {
  // Create a Blob object from the binary data
  const blob = new Blob([data], { type: "application/octet-stream" });

  // Create a download link
  const link = document.createElement("a");

  // Set the download attribute with the file name
  link.download = fileName;

  // Create a URL for the Blob and set it as the href attribute
  link.href = URL.createObjectURL(blob);

  // Append the link to the document
  document.body.appendChild(link);

  // Trigger a click event on the link to start the download
  link.click();

  // Remove the link from the document
  document.body.removeChild(link);
}

export function replaceFileExtension(fileName: string, newExtension: string) {
  // Find the last occurrence of '.' in the file name
  const lastDotIndex = fileName.lastIndexOf(".");

  // Check if a dot is found and it is not the first character in the file name
  if (lastDotIndex !== -1 && lastDotIndex > 0) {
    // Extract the file name without the extension
    const baseFileName = fileName.slice(0, lastDotIndex);

    // Concatenate the new extension
    const newFileName = baseFileName + "." + newExtension;

    return newFileName;
  } else {
    // If no dot is found or it is the first character, simply append the new extension
    return fileName + "." + newExtension;
  }
}
