browser.runtime.onMessage.addListener((message, sender) => {
  console.error("Background processing message:", message, "from", sender);
  if (message?.type === "ENLARGE_EMOJIS" && sender.tab?.id) {
    return browser.scripting.insertCSS({
      target: { tabId: sender.tab.id, allFrames: true },
      files: ["styles/larger-custom-emojis.css"],
      origin: "USER",
    });
  }
});
