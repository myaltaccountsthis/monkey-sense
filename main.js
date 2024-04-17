const blueEnd = 3000, green = 5000, yellow = 7500, redEnd = 12500;
/**
 * Returns a CSS color string based on how good the answer time is
 */
function getTimeColor(ms) {
  const r = Math.max(0, Math.min(1, (ms - green) / (yellow - green))) * 0xff;
  const g = Math.max(0, Math.min(1, 1 - (ms - yellow) / (redEnd - yellow))) * 0xff;
  const b = Math.max(0, Math.min(1, 1 - (ms - blueEnd) / (green - blueEnd))) * 0xff;
  return `rgb(${r}, ${g}, ${b})`;
}

let questionCount = 0;
let startT = 0;
let interval = null;

function updateData() {
  const time = (Date.now() - startT);
  document.getElementById("questioncount").innerText = questionCount;
  if (questionCount > 0) {
    document.getElementById("averagetime").innerText = `${(time / questionCount).toFixed(1)}ms`;
    document.getElementById("averagetime").style.color = getTimeColor(time / questionCount);
  }
  else
    document.getElementById("averagetime").innerText = "";
}

function handleMessages(arr) {
  for (const message of arr) {
    if (message.type === "question") {
      document.getElementById("question").innerText = message.data;
    }
    else if (message.type === "reply") {
      document.getElementById("inputbox").value = "";
    }
    else if (message.type === "status") {
      if (message.tag === "start") {
        document.getElementById("inputbox").innerText = "";
        document.getElementById("inputbox").focus();
        questionCount = 0;
        startT = Date.now();
        document.getElementById("answertime").innerText = "";
        document.getElementById("lastanswer").innerText = "";
        updateData();
        interval = setInterval(() => {
          document.getElementById("totaltime").innerText = `${((Date.now() - startT) / 1000).toFixed(1)}s`;
        }, 100);
      }
      else if (message.tag === "stop") {
        clearInterval(interval);
        document.getElementById("question").innerText = "Click start";
      }
      else if (message.tag === "answertime") {
        document.getElementById("answertime").innerText = `${message.data}ms`;
        document.getElementById("answertime").style.color = getTimeColor(message.data);
        questionCount++;
        updateData();
      }
      else if (message.tag === "answer") {
        document.getElementById("lastanswer").innerText = message.data;
      }
    }
  }
}

function doStart() {
  handleMessages(startMode(""));
}

function doStop() {
  handleMessages(stopMode());
}

function onInputChange(input) {
  handleMessages(onMessage(input.value));
}