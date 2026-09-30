const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const dropzonePrompt = document.getElementById("dropzonePrompt");
const fileNameLabel = document.getElementById("fileNameLabel");
const resetBtn = document.getElementById("resetBtn");

const operationFrames = document.getElementById("operationFrames");
const controlStrip = document.getElementById("controlStrip");
const controlOpName = document.getElementById("controlOpName");
const controlForm = document.getElementById("controlForm");
const developBtn = document.getElementById("developBtn");

const shapeSelect = document.getElementById("shapeSelect");
const shapeFieldGroups = document.querySelectorAll(".shape-fields");

const resultSection = document.getElementById("resultSection");
const resultImg = document.getElementById("resultImg");
const downloadBtn = document.getElementById("downloadBtn");
const statusMsg = document.getElementById("statusMsg");

let currentFile = null;
let currentOperation = null;

function setStatus(message) {
  statusMsg.textContent = message || "";
}

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    setStatus("Please choose an image file.");
    return;
  }
  currentFile = file;
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  previewImg.hidden = false;
  dropzonePrompt.hidden = true;
  fileNameLabel.textContent = file.name;
  resetBtn.hidden = false;
  resultSection.hidden = true;
  setStatus("");
}

dropzone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => loadFile(e.target.files[0]));

["dragenter", "dragover"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  })
);
["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
  })
);
dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  loadFile(file);
});

resetBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  currentFile = null;
  fileInput.value = "";
  previewImg.hidden = true;
  dropzonePrompt.hidden = false;
  fileNameLabel.textContent = "no frame loaded";
  resetBtn.hidden = true;
  resultSection.hidden = true;
});

operationFrames.addEventListener("click", (e) => {
  const frame = e.target.closest(".frame");
  if (!frame) return;

  document.querySelectorAll(".frame").forEach((f) => f.classList.remove("is-selected"));
  frame.classList.add("is-selected");

  currentOperation = frame.dataset.op;
  controlOpName.textContent = frame.querySelector(".frame__name").textContent + " · " + frame.dataset.fstop;

  document.querySelectorAll(".field-group").forEach((group) => {
    group.classList.toggle("is-active", group.dataset.fields === currentOperation);
  });

  controlStrip.hidden = false;
  resultSection.hidden = true;
});

shapeSelect?.addEventListener("change", () => {
  shapeFieldGroups.forEach((group) => {
    group.hidden = group.dataset.shape !== shapeSelect.value;
  });
});

controlForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("");

  if (!currentFile) {
    setStatus("Load an image before developing it.");
    return;
  }
  if (!currentOperation) {
    setStatus("Choose an exposure from the strip above.");
    return;
  }

  const formData = new FormData(controlForm);
  formData.append("image", currentFile);
  formData.append("operation", currentOperation);

  developBtn.disabled = true;
  developBtn.textContent = "Developing…";

  try {
    const response = await fetch("/process", { method: "POST", body: formData });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Something went wrong." }));
      setStatus(err.error || "Something went wrong.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    resultImg.src = url;
    downloadBtn.href = url;
    downloadBtn.download = `${currentOperation}_result.jpg`;
    resultSection.hidden = false;
  } catch (err) {
    setStatus("Could not reach the server. Is it running?");
  } finally {
    developBtn.disabled = false;
    developBtn.textContent = "Develop";
  }
});
