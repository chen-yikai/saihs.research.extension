document.addEventListener("DOMContentLoaded", () => {
  const voiceSelect = document.getElementById("voice-select");
  const moduleSelect = document.getElementById("module-select");

  function populateVoiceList() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = "";

    voices.forEach((voice, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });

    chrome.storage.local.get(["voice"], (result) => {
      if (result.voice) {
        voiceSelect.value = result.voice.id;
      }
    });
  }

  if (
    typeof speechSynthesis !== "undefined" &&
    speechSynthesis.onvoiceschanged !== undefined
  ) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  voiceSelect.addEventListener("change", () => {
    const selectedVoiceIndex = voiceSelect.value;
    const selectedVoice = speechSynthesis.getVoices()[selectedVoiceIndex];

    chrome.storage.local.set({
      voice: {
        id: selectedVoiceIndex,
        name: selectedVoice.name,
      },
    });
  });

  populateVoiceList();
  moduleSelect.addEventListener("change", () => {
    chrome.storage.local.set({
      module: moduleSelect.value,
    });
  });
});
