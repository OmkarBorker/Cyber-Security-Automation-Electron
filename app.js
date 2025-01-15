const { ipcRenderer } = require("electron");
console.log("called ")
      // Handle form submission
      document
        .getElementById("submit-btn").addEventListener("click", async () => {
          const docx = document.getElementById("docx");
          const platform = document.getElementById("platform");
          const file = document.getElementById("file-upload").files[0];
          const name = document.getElementById("file-name");
          const versionNumber = document.getElementById("version-number");
          const submitBtn = document.getElementById("submit-btn");
          const loader = document.getElementById("loader");

          // Check if a file is selected
          if (!file) {
            alert("Please select a file.");
            return;
          }

      //      // Check if the selected file is within restricted directories
      // const restrictedPaths = [
      //   'C:\\', 'C:\\Program Files', 'C:\\Windows', 'C:\\Users\\Public', 'C:\\ProgramData'
      // ];
      // const filePath='';
      // let isRestricted = restrictedPaths.some(restrictedPath => filePath.startsWith(restrictedPath));
      
      // if (isRestricted) {
      //   dialog.showErrorBox('Access Denied', 'You cannot access files in this folder.');
      //   return;
      // }

          // Validate file type
          const allowedExtensions = [".zip"];
          const fileExtension = file.name
            .slice(file.name.lastIndexOf("."))
            .toLowerCase();

          if (!allowedExtensions.includes(fileExtension)) {
            alert("Invalid file type. Please upload a zip");
            return;
          }

          // Ensure a name is provided
          if (!name.value.trim()) {
            alert("Please enter a name for the file.");
            return;
          }

          submitBtn.style.display = "none"; // Hide submit button
          loader.style.display = "flex"; // Show loader while processing

          // Disable inputs during processing
          docx.disabled = true;
          name.disabled = true;
          document.getElementById("file-upload").disabled = true;
          document.getElementById("version-number").disabled = true;

          const reader = new FileReader();

          reader.onloadend = () => {
            const data = {
              input_docx: docx.value,
              platform: platform.value,
              uploadedFile: reader.result,
              name: name.value,
              application_version: versionNumber.value,
            };

            // Send data to backend for processing
            ipcRenderer
              .invoke("process-upload", data)
              .then((response) => {
                // Hide loader once response is received
                loader.style.display = "none";

                if (response.success) {
                  const downloadBtn = document.getElementById("download-btn");
                  const resetBtn = document.getElementById("reset-btn");
                  const Container = document.getElementById("mainWindow");

                  // Show the download button
                  downloadBtn.style.display = "block";
                  resetBtn.style.display = "block";
                  submitBtn.style.display = "none";
                  docx.style.display = "none";
                  name.style.display = "none";
                  Container.style.display = "none";
                  document.getElementById("file-upload").style.display = "none";
                  document.getElementById("file-upload").value = null;
                  document.getElementById("file-name").value = "";
                  document.getElementById("docx").value = "";
                  document.getElementById("version-number").value = "";

                  // Create a Blob from the processed file (no base64 encoding)
                  const blob = new Blob([response.file], {
                    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  });

                  // Create a download URL for the file
                  const downloadUrl = URL.createObjectURL(blob);

                  // Set up the download link
                  downloadBtn.addEventListener("click", () => {
                    const a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = response.fileName;
                    a.click();

                    /// After download, revoke the URL to clear cache
                    URL.revokeObjectURL(downloadUrl);
                  });

                  alert("File processed successfully!");
                }
              })
              .catch((error) => {
                // Hide loader if there's an error
                loader.style.display = "none";
                submitBtn.style.display = "block";
                console.error("Error processing file:", error);
                alert("An error occurred while processing the file.");
              })
              .finally(() => {
                // Re-enable inputs after processing
                docx.disabled = false;
                name.disabled = false;
                document.getElementById("file-upload").disabled = false;
                document.getElementById("version-number").disabled = false;
              });
          };

          // Read file as ArrayBuffer (binary data)
          reader.readAsArrayBuffer(file)
        });

      // Reset button functionality
      document.getElementById("reset-btn").addEventListener("click", () => {
        resetAppState();
      });

      function resetAppState() {
        const downloadBtn = document.getElementById("download-btn");
        const submitBtn = document.getElementById("submit-btn");
        const resetBtn = document.getElementById("reset-btn");
        const Container = document.getElementById("mainWindow");

        // Hide elements that are not needed
        downloadBtn.style.display = "none";
        resetBtn.style.display = "none";
        submitBtn.style.display = "block";
        Container.style.display = "block";

        // Reset all form values and UI
        document.getElementById("docx").style.display = "block";
        document.getElementById("docx").value = ""; // Clear the dropdown selection
        document.getElementById("file-name").style.display = "block";
        document.getElementById("file-name").value = ""; // Clear the name input
        document.getElementById("file-upload").style.display = "block";
        document.getElementById("file-upload").value = null; // Clear the file input
        document.getElementById("version-number").value = ""; // Clear the version-number input

        // Enable inputs
        document.getElementById("docx").disabled = false;
        document.getElementById("file-name").disabled = false;
        document.getElementById("file-upload").disabled = false;
        document.getElementById("version-number").disabled = false;

        // Optional: If you have a loader element, hide it
        const loader = document.getElementById("loader");
        loader.style.display = "none";

        // Clear any previously generated download URLs (cache reset)
        const existingDownloadUrl = document.createElement("a");
        existingDownloadUrl.href = "";
        existingDownloadUrl.download = "";
      }

      // Listen for the beforeunload event to reset the app state when closing
      window.addEventListener("beforeunload", () => {
        resetAppState();
      });