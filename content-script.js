console.error("Content script loaded");

const STYLE_ID = "larger-custom-emojis-style";

async function injectCssFromFile(path) {
  if (document.getElementById(STYLE_ID)) return;
  try {
    const url = browser.runtime.getURL(path);
    console.error(url);
    const css = await fetch(url).then((r) => r.text());
    console.error(url);
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.documentElement.appendChild(style);
  } catch (e) {
    console.error("Failed to inject CSS:", e);
  }
}

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type === "ENLARGE_EMOJIS") {
    await injectCssFromFile("styles/larger-custom-emojis.css");
  }
});
