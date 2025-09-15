const css = (unit) => `
  .c-emoji__large {
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
