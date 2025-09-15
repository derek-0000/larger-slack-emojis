// popup.js
// Handles popup UI logic

const toggle = document.getElementById("toggle");
const input = document.getElementById("custom-size-unit");

browser.storage.local.get("emojisEnlarged").then((res) => {
  toggle.checked = res.emojisEnlarged ?? false;
});

browser.storage.local.get("customSizeUnit").then((res) => {
  input.value = res.customSizeUnit ?? "";
});

input.addEventListener("change", async (e) => {
  await browser.storage.local.set({
    customSizeUnit: e.target.value,
  });
});

toggle.addEventListener("change", async (e) => {
  await browser.storage.local.set({
    emojisEnlarged: e.target.checked,
  });
});
