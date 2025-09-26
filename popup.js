// popup.js
// Handles popup UI logic

const toggle = document.getElementById("toggle");
const input = document.getElementById("custom-size-unit");

chrome.storage.local.get("emojisEnlarged").then((res) => {
  toggle.checked = res.emojisEnlarged ?? false;
});

chrome.storage.local.get("customSizeUnit").then((res) => {
  input.value = res.customSizeUnit ?? "";
});

input.addEventListener("change", async (e) => {
  await chrome.storage.local.set({
    customSizeUnit: e.target.value,
  });
});

toggle.addEventListener("change", async (e) => {
  await chrome.storage.local.set({
    emojisEnlarged: e.target.checked,
  });
});
