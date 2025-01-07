const ToasterBoxId = Math.random().toString(16);
let loading = true;

function FilterHTML(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const tagsToRemove = ["style", "script", "head"];
  tagsToRemove.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((element) => {
      if (tag === "head" && element.querySelector("title")) {
        const title = element.querySelector("title");
        element.innerHTML = "";
        element.appendChild(title);
      } else {
        element.remove();
      }
    });
  });

  doc.querySelectorAll("img").forEach((img) => {
    Array.from(img.attributes).forEach((attr) => {
      if (!["title", "alt", "aria-label"].includes(attr.name)) {
        img.removeAttribute(attr.name);
      }
    });
  });

  return doc.documentElement.innerHTML.replace(/\s+/g, " ").trim();
}

function Toaster(content, error = false, load = false) {
  const box = document.createElement("div");
  box.id = ToasterBoxId;
  box.innerText = content;
  box.style = `
    color: white;
    font-weight: bold;
    padding: 15px;
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    border-radius: 5px;
    font-size: 20px;
    background-color: ${error ? "red" : "green"};
  `;

  document.body.appendChild(box);
  if (!load) {
    setTimeout(() => box.remove(), 3000);
  }
}

async function Poster(payload, endpoint) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

function Speaker(text) {
  const speakText = (voice) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    utterance.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const getVoice = () => {
    const voices = speechSynthesis.getVoices();
    const chineseVoice = voices.find((voice) => voice.lang === "zh-TW");
    if (chineseVoice) {
      speakText(chineseVoice);
    }
  };

  if (
    typeof speechSynthesis !== "undefined" &&
    speechSynthesis.onvoiceschanged !== undefined
  ) {
    speechSynthesis.onvoiceschanged = getVoice;
  }
  getVoice();
}

async function Entry() {
  const htmlContent = document.documentElement.innerHTML;
  const filteredHtml = FilterHTML(htmlContent);

  let module = "llama2";
  let endpoint = "";

  chrome.storage.local.get(["module", "endpoint"], (result) => {
    if (result.module) {
      module = result.module;
    }
    if (result.endpoint) {
      endpoint = result.endpoint;
    }

    const payload = { module: module, content: filteredHtml };
    Toaster("Summarising content...", false, true);
    Poster(payload, endpoint)
      .then((response) => {
        removeToaster();
        Toaster("Content summarised successfully");
        console.log(response);
        Speaker(response.response);
      })
      .catch((error) => {
        removeToaster();
        Toaster(`Something went wrong - ${error.message}`, true);
      });
  });
}

function removeToaster() {
  document.getElementById(ToasterBoxId).remove();
}

document.addEventListener("keydown", (event) => {
  if (event.altKey) {
    Entry();
  }
});
