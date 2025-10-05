 const fileInput = document.getElementById("fileInput");
  const fileNameDisplay = document.getElementById("file-name");

  fileInput.addEventListener("change", () => {
    fileNameDisplay.textContent = fileInput.files[0]?.name || "No file chosen";
  });
 