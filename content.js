const ToasterBoxId = Math.random().toString(16);

function FilterHTML(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  function removeTags(tags) {
    tags.forEach((tag) => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach((element) => {
        if (tag === "head" && element.querySelector("title")) {
          const title = element.querySelector("title");
          element.innerHTML = "";
          element.appendChild(title);
        } else {
          element.remove();
        }
      });
    });
  }

  const tagsToRemove = ["style", "script", "head"];
  removeTags(tagsToRemove);

  const imgTags = doc.querySelectorAll("img");
  imgTags.forEach((img) => {
    Array.from(img.attributes).forEach((attr) => {
      if (!["title", "alt", "aria-label"].includes(attr.name)) {
        img.removeAttribute(attr.name);
      }
    });
  });

  const filteredContent = doc.documentElement.innerHTML
    .replace(/\s+/g, " ")
    .trim();

  return filteredContent;
}

function Toaster(content, error = false) {
  const box = document.createElement("div");
  box.id = ToasterBoxId;
  box.innerText = content;
  box.style.color = "white";
  box.style.fontWeight = "bold";
  box.style.padding = "15px";
  box.style.position = "fixed";
  box.style.top = "10px";
  box.style.right = "10px";
  box.style.zIndex = "9999";
  box.style.borderRadius = "5px";
  box.style.fontSize = "20px";
  box.style.backgroundColor = error ? "red" : "green";

  document.body.appendChild(box);

  setTimeout(() => {
    box.remove();
  }, 3000);
}

async function Poster(payload) {
  try {
    const response = await fetch("http://localhost:3000/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

function Speaker(text) {
  function speakText(voice) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    utterance.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  function getVoice() {
    const voices = speechSynthesis.getVoices();
    const chineseVoice = voices.find((voice) => voice.lang === "zh-TW");

    if (chineseVoice) {
      speakText(chineseVoice);
    }
  }

  if (
    typeof speechSynthesis !== "undefined" &&
    speechSynthesis.onvoiceschanged !== undefined
  ) {
    speechSynthesis.onvoiceschanged = () => {
      getVoice();
    };
  }
  getVoice();
}

function Entry() {
  const htmlContent = document.documentElement.innerHTML;
  const filteredHtml = FilterHTML(htmlContent);
  var module = "ollama";
  chrome.storage.local.get(["module"], (result) => {
    if (result.module) {
      module = result.module;
    }
  });
  const payload = {
    module: module,
    content: filteredHtml,
  };

  Poster(payload)
    .then((response) => {
      Toaster("Content summarised successfully");
      Speaker(response.response);
    })
    .catch((error) => {
      Toaster(`Something went wrong - ${error.message}`, true);
    });
}

document.addEventListener("keydown", (event) => {
  if (event.altKey) {
    Entry();
  }
});
