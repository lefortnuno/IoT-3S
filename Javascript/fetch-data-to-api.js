let lastSentData = null;

function getLatestValue() {
  const serialContent = document.querySelector(
    ".code_panel__serial__content__text"
  );
  if (serialContent) {
    const lines = serialContent.innerText.trim().split("\n");
    const lastValue = lines[lines.length - 1];
    return lastValue && lastValue.trim() ? lastValue : null;
  }
  return null;
}

function sendDataToServer(value) {
  const values = value.split(",").map((v) => v.trim());
  const c = values[0] ? parseFloat(values[0]) : null;
  const bpm = values[1] ? parseFloat(values[1]) : null;
  const spo2 = values[2] ? parseFloat(values[2]) : null;

  if (c === null && bpm === null && spo2 === null) {
    return;
  }

  const currentData = `${c},${bpm},${spo2}`;
  if (lastSentData === currentData) {
    return;
  }

  lastSentData = currentData;
  const id = Math.floor(Math.random() * 3) + 1;

  const data = {
    u_id: id,
    c: c,
    bpm: bpm,
    spo2: spo2,
  };

  fetch("https://iot-3s.onrender.com/api/simulation/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then(() => {
      console.log("Data Send Succeed! ", JSON.stringify(data));
    })
    .catch((error) => {
      console.error("Erreur:", error);
    });
}

setInterval(() => {
  const value = getLatestValue();
  if (value) {
    sendDataToServer(value);
  }
}, 2000);
