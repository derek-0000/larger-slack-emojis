const css = (unit) => `
  .p-message_pane img.c-emoji__large:not([src*="production-standard-emoji-assets"]) {
    width: ${unit} !important;
    height: ${unit} !important;
  }
`;

const removeEnlargement = () => {
  const existingStyle = document.getElementById("enlargement-override-style");
  if (existingStyle) {
    existingStyle.remove();
  }
};

const enlargeEmojis = async () => {
  removeEnlargement();
  const { customSizeUnit } = await browser.storage.local.get("customSizeUnit");
  const style = document.createElement("style");
  style.id = "enlargement-override-style";
  style.textContent = css(customSizeUnit);
  document.documentElement.appendChild(style);
};

const domObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    addedNode = mutation.addedNodes.values().next().value;

    const isPreferencesSection =
      addedNode?.dataset && addedNode.dataset["qaSection"] === "messages-media";

    if (isPreferencesSection) {
      const emojiSection = document.getElementById("emoji-messages-media");
      // Title
      const customEmojiSizeSectionTitle = document.createElement("p");
      customEmojiSizeSectionTitle.className =
        "emoji_skin_tone_prefs_section__header";
      customEmojiSizeSectionTitle.textContent = "Custom Emoji Size";
      customEmojiSizeSectionTitle.style.marginTop = "2rem";
      customEmojiSizeSectionTitle.style.marginBottom = "0";
      // Subtitle
      const customEmojiSizeSectionSubtitle = document.createElement("p");
      customEmojiSizeSectionSubtitle.className =
        "p-emoji_skin_tone_prefs_section__description";
      customEmojiSizeSectionSubtitle.textContent =
        "Enter a size unit to change the size of your workspace's custom emojis. (e.g. 48px, 3rem, etc.)";

      emojiSection?.appendChild(customEmojiSizeSectionTitle);
      emojiSection?.appendChild(customEmojiSizeSectionSubtitle);
    }
  });
});

domObserver.observe(document.body, { childList: true, subtree: true });

// Respond to storage changes triggered by the popup's checkbox
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (
      (changes.emojisEnlarged && changes.emojisEnlarged.newValue) ||
      changes.customSizeUnit
    ) {
      enlargeEmojis();
    } else {
      removeEnlargement();
    }
  }
});

// Initialize enlargement
browser.storage.local.get("emojisEnlarged").then((res) => {
  res.emojisEnlarged && enlargeEmojis();
});
