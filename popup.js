// popup.js
// Handles popup UI logic

const enlargeEmojis = async () => {
  let [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  browser.tabs.sendMessage(tab.id, { type: "ENLARGE_EMOJIS" });
};

const toggle = document.getElementById("toggle");
toggle.checked = true;
enlargeEmojis();

toggle.addEventListener("change", async (e) => {
  if (e.target.checked) {
    enlargeEmojis();
  }
});
