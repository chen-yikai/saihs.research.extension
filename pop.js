document.addEventListener("DOMContentLoaded", () => {
  const moduleSelect = document.getElementById("module-select");
  const endpoint = document.getElementById("endpoint");

  chrome.storage.local.get(["module", "endpoint"], (result) => {
    if (result.module) {
      moduleSelect.value = result.module;
    }
    if (result.endpoint) {
      endpoint.value = result.endpoint;
    }
  });
  endpoint.addEventListener("change", () => {
    chrome.storage.local.set({
      endpoint: endpoint.value,
    });
  });
  moduleSelect.addEventListener("change", () => {
    chrome.storage.local.set({
      module: moduleSelect.value,
    });
  });
});
