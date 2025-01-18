const { ipcRenderer } = require("electron");

document
.getElementById("submit-btn-key")
.addEventListener("click", () => {
  const key = document.getElementById("license-key").value;
  console.log({ key });
  if (!key) {
    document.getElementById("error-message").style.display = "block";
    return;
  }
  ipcRenderer.send("license-key-submitted", key);
  document.getElementById("license-key").value = "";
  document.getElementById("error-message").style.display = "none";
});