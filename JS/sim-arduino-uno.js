const uniqueValues = new Set();

function fetchSerialData() {
  const serialContent = document.querySelector(
    ".code_panel__serial__content__text"
  );

  if (!serialContent) {
    console.error("Élément du Serial Monitor introuvable");
    return;
  }

  const lines = serialContent.innerText.split("\n");
  lines.forEach((line) => {
    uniqueValues.add(line);
  });
}

function saveToFile() {
  const blob = new Blob([Array.from(uniqueValues).join("\n")], {
    type: "text/plain",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "serial_data.txt";
  link.click();
}

const interval = setInterval(fetchSerialData, 1000);

setTimeout(() => {
  clearInterval(interval);
  saveToFile();
}, 60000); // Arrêt après 60 secondes
