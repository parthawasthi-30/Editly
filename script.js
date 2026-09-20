const defaultFilters = {
  Brightness: { label: "Brightness", value: 100, min: 0, max: 200, unit: "%" },
  Contrast: { label: "Contrast", value: 100, min: 0, max: 200, unit: "%" },
  Saturation: { label: "Saturation", value: 100, min: 0, max: 200, unit: "%" },
  HueRotation: { label: "Hue Rotate", value: 0, min: 0, max: 360, unit: "deg" },
  Blur: { label: "Blur", value: 0, min: 0, max: 20, unit: "px" },
  Grayscale: { label: "Grayscale", value: 0, min: 0, max: 100, unit: "%" },
  Sepia: { label: "Sepia", value: 0, min: 0, max: 100, unit: "%" },
  Invert: { label: "Invert", value: 0, min: 0, max: 100, unit: "%" },
  Opacity: { label: "Fade / Opacity", value: 0, min: 0, max: 100, unit: "%" },
};


let activeFilters = JSON.parse(JSON.stringify(defaultFilters));

const presets = {
  Original: { Brightness: 100, Contrast: 100, Saturation: 100, HueRotation: 0, Blur: 0, Grayscale: 0, Sepia: 0, Invert: 0, Opacity: 0 },
  Vintage: { Brightness: 110, Contrast: 90, Saturation: 75, HueRotation: 10, Blur: 0, Grayscale: 10, Sepia: 40, Invert: 0, Opacity: 0 },
  Drama: { Brightness: 90, Contrast: 145, Saturation: 120, HueRotation: 0, Blur: 0, Grayscale: 0, Sepia: 0, Invert: 0, Opacity: 0 },
  OldSchool: { Brightness: 105, Contrast: 110, Saturation: 0, HueRotation: 0, Blur: 0, Grayscale: 100, Sepia: 25, Invert: 0, Opacity: 0 },
  Noir: { Brightness: 85, Contrast: 145, Saturation: 0, HueRotation: 0, Blur: 0, Grayscale: 100, Sepia: 0, Invert: 0, Opacity: 0 },
  Warm: { Brightness: 105, Contrast: 105, Saturation: 130, HueRotation: 15, Blur: 0, Grayscale: 0, Sepia: 20, Invert: 0, Opacity: 0 },
  Cool: { Brightness: 100, Contrast: 110, Saturation: 90, HueRotation: 200, Blur: 0, Grayscale: 0, Sepia: 0, Invert: 0, Opacity: 0 },
  Vivid: { Brightness: 105, Contrast: 120, Saturation: 150, HueRotation: 0, Blur: 0, Grayscale: 0, Sepia: 0, Invert: 0, Opacity: 0 },
  Cinematic: { Brightness: 95, Contrast: 130, Saturation: 85, HueRotation: 190, Blur: 0, Grayscale: 0, Sepia: 15, Invert: 0, Opacity: 0 }
};

const imageCanvas = document.querySelector("#image-canvas");
const canvasCtx = imageCanvas.getContext("2d");
const imgInput = document.querySelector("#image-input");
const resetBtn = document.querySelector("#reset-btn");
const downloadBtn = document.querySelector("#download-btn");
const imagePlaceholder = document.querySelector("#placeholder");
const dropZone = document.querySelector("#drop-zone");
const presetsContainer = document.querySelector("#presets-container");
const filtersContainer = document.querySelector("#filters-container");

let loadedImage = null;


function initializeFilters() {
  filtersContainer.innerHTML = "";
  Object.keys(activeFilters).forEach((key) => {
    const item = activeFilters[key];

    const wrapper = document.createElement("div");
    wrapper.classList.add("filter-control");

    const header = document.createElement("div");
    header.classList.add("filter-header");

    const nameSpan = document.createElement("span");
    nameSpan.innerText = item.label;

    const valueSpan = document.createElement("span");
    valueSpan.classList.add("filter-value");
    valueSpan.id = `val-${key}`;
    valueSpan.innerText = `${item.value}${item.unit}`;

    header.appendChild(nameSpan);
    header.appendChild(valueSpan);

    const input = document.createElement("input");
    input.type = "range";
    input.min = item.min;
    input.max = item.max;
    input.value = item.value;
    input.id = `input-${key}`;

    input.addEventListener("input", (e) => {
      activeFilters[key].value = e.target.value;
      valueSpan.innerText = `${e.target.value}${item.unit}`;
      clearActivePreset();
      applyFilters();
    });

    wrapper.appendChild(header);
    wrapper.appendChild(input);
    filtersContainer.appendChild(wrapper);
  });
}


function initializePresets() {
  presetsContainer.innerHTML = "";
  Object.keys(presets).forEach((presetName) => {
    const btn = document.createElement("button");
    btn.classList.add("preset-btn");
    btn.innerText = presetName;

    btn.addEventListener("click", () => {
      applyPreset(presetName);
      document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });

    presetsContainer.appendChild(btn);
  });
}

function clearActivePreset() {
  document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
}

function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) return;

  Object.keys(preset).forEach((key) => {
    if (!activeFilters[key]) return;
    activeFilters[key].value = preset[key];

    const input = document.getElementById(`input-${key}`);
    const valText = document.getElementById(`val-${key}`);

    if (input) input.value = preset[key];
    if (valText) valText.innerText = `${preset[key]}${activeFilters[key].unit}`;
  });

  applyFilters();
}

function applyFilters() {
  if (!loadedImage) return;

  const f = activeFilters;
  
  canvasCtx.filter = `
    brightness(${f.Brightness.value}%)
    contrast(${f.Contrast.value}%)
    saturate(${f.Saturation.value}%)
    hue-rotate(${f.HueRotation.value}deg)
    blur(${f.Blur.value}px)
    grayscale(${f.Grayscale.value}%)
    sepia(${f.Sepia.value}%)
    invert(${f.Invert.value}%)
    opacity(${100 - f.Opacity.value}%)
  `.trim();

  canvasCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  canvasCtx.drawImage(loadedImage, 0, 0);
}

function handleImageFile(file) {
  if (!file || !file.type.startsWith("image/")) return;

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    loadedImage = img;
    URL.revokeObjectURL(objectUrl);

   
    imageCanvas.width = img.naturalWidth;
    imageCanvas.height = img.naturalHeight;

    imagePlaceholder.style.display = "none";
    imageCanvas.style.display = "block";

    
    resetBtn.disabled = false;
    downloadBtn.disabled = false;

    applyFilters();
  };

  img.src = objectUrl;
}


imgInput.addEventListener("change", (e) => {
  handleImageFile(e.target.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
  });
});

dropZone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  handleImageFile(file);
});


resetBtn.addEventListener("click", () => {
  applyPreset("Original");
  clearActivePreset();
});


downloadBtn.addEventListener("click", () => {
  if (!loadedImage) return;
  const link = document.createElement("a");
  link.download = `edited-photo-${Date.now()}.png`;
  link.href = imageCanvas.toDataURL("image/png");
  link.click();
});


initializeFilters();
initializePresets();