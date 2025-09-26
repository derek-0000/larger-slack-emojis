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
  const { customSizeUnit } = await chrome.storage.local.get("customSizeUnit");
  const style = document.createElement("style");
  style.id = "enlargement-override-style";
  style.textContent = css(customSizeUnit);
  document.documentElement.appendChild(style);
};

// Respond to storage changes triggered by the popup's checkbox
chrome.storage.onChanged.addListener((changes, area) => {
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
chrome.storage.local.get("emojisEnlarged").then((res) => {
  res.emojisEnlarged && enlargeEmojis();
});

const el = (tag, { className, text, attributes, style, on, children } = {}) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  if (attributes) {
    for (const [k, v] of Object.entries(attributes)) {
      if (k in n) n[k] = v;
      else n.setAttribute(k, v);
    }
  }
  if (style) Object.assign(n.style, style);
  if (on) {
    for (const [evt, handler] of Object.entries(on)) {
      n.addEventListener(evt, handler);
    }
  }
  if (children) {
    n.append(...children);
  }
  return n;
};

const domObserver = new MutationObserver((mutations) => {
  mutations.forEach(async (mutation) => {
    addedNode = mutation.addedNodes.values().next().value;

    const isPreferencesSection =
      addedNode?.dataset && addedNode.dataset["qaSection"] === "messages-media";

    if (isPreferencesSection) {
      const emojiSection = document.getElementById("emoji-messages-media");
      if (!emojiSection) return;

      // Custom Emoji Size Section
      const frag = document.createDocumentFragment();

      // Titles
      const title = el("p", {
        className: "emoji_skin_tone_prefs_section__header",
        text: "Custom Emoji Size",
        style: { marginTop: "2rem", marginBottom: "0" },
      });

      const subtitle = el("p", {
        className: "p-emoji_skin_tone_prefs_section__description",
        text: "Enter a size unit to change the size of your workspace's custom emojis.",
        style: { marginBottom: ".5rem" },
      });

      // Checkbox
      const sizeCheckbox = el("input", {
        attributes: { type: "checkbox", id: "custom-emoji-size-checkbox" },
        style: { marginRight: "12px" },
      });

      const sizeCheckboxLabel = el("label", {
        attributes: { htmlFor: "custom-emoji-size-checkbox" },
        text: "Enable Custom Emoji Size",
      });

      const checkboxContainer = el("div", {
        style: {
          display: "flex",
          alignItems: "center",
          margin: "0.5rem 0",
        },
        children: [sizeCheckbox, sizeCheckboxLabel],
      });

      // Input
      const sizeInput = el("input", {
        attributes: {
          type: "text",
          id: "custom-size-unit",
          placeholder: "e.g. 48px, 3rem, etc.",
        },
        style: {
          backgroundColor: "transparent",
          border: "none",
          padding: ".5rem",
          borderRadius: "4px",
          boxShadow: "0 0 0 1px var(--saf-0)",
          color: "var(--dt_color-content-pry)",
        },
      });

      const inputContainer = el("div", {
        style: { display: "flex", flexDirection: "column" },
        children: [sizeInput, checkboxContainer],
      });

      // Extension state
      const { customSizeUnit, emojisEnlarged } = await chrome.storage.local.get(
        {
          customSizeUnit: "",
          emojisEnlarged: true,
        }
      );

      sizeInput.value = customSizeUnit;
      sizeCheckbox.checked = !!emojisEnlarged;

      let localCustomSizeUnit = customSizeUnit;
      let localEmojisEnlarged = emojisEnlarged;

      sizeInput.addEventListener("change", async (e) => {
        await chrome.storage.local.set({
          customSizeUnit: e.target.value.trim(),
        });
        enlargeEmojis();
      });

      sizeCheckbox.addEventListener("change", async (e) => {
        await chrome.storage.local.set({
          emojisEnlarged: e.target.checked,
        });
        if (e.target.checked) {
          enlargeEmojis();
        } else {
          removeEnlargement();
        }
      });

      frag.append(title, subtitle, inputContainer);
      emojiSection.appendChild(frag);

      // Preview
      const previewMessage = document
        .getElementsByClassName("p-prefs_dialog__message_example_pillow")[0]
        .cloneNode(true);

      const exampleSubtitle = el("p", {
        className: "p-emoji_skin_tone_prefs_section__description",
        text: "Here’s an example:",
        style: { marginBottom: ".5rem" },
      });

      emojiSection.appendChild(exampleSubtitle);
      emojiSection.appendChild(previewMessage);

      const previewTextContainer = Array.from(
        document.getElementsByClassName(
          "p-prefs_modal__message_example__message_body"
        )
      ).at(-1);

      const previewTextChildContainer = Array.from(
        document.getElementsByClassName("p-prefs_modal__message_example")
      ).at(-1);
      previewTextChildContainer.style.alignItems = "start";

      const previewEmoji = el("div", {
        style: {
          ...css(localCustomSizeUnit || "1.5rem"),
          border: "solid 1px var(--saf-0)",
          borderRadius: ".5rem",
          borderStyle: "dashed",
          marginTop: ".5rem",
        },
      });

      previewTextContainer.appendChild(previewEmoji);
    }
  });
});

domObserver.observe(document.body, { childList: true, subtree: true });
