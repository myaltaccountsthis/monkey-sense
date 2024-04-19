const blueEnd = 3000, green = 5000, yellow = 7500, redEnd = 15000;
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
const answeredQuestions = [];
let currentCategory = "";
let currentIncorrect = false;

// MathJax config
let useAsciiMath = true;
MathJax = {
  loader: {load: ['input/asciimath', 'output/chtml', 'ui/menu']},
}

function updateData() {
  const time = (Date.now() - startT);
  document.getElementById("questioncount").innerText = questionCount;
  if (questionCount > 0) {
    document.getElementById("averagetime").innerText = `${Math.round(time / questionCount)}ms`;
    document.getElementById("averagetime").style.color = getTimeColor(time / questionCount);
  }
  else
    document.getElementById("averagetime").innerText = "";
}

function handleMessages(arr) {
  for (const message of arr) {
    if (message.type === "question") {
      document.getElementById("question").innerText = `${message.data}`;
      currentIncorrect = false;
      MathJax.typeset();
    }
    else if (message.type === "reply") {
      // On correct answer
      document.getElementById("inputbox").value = "";
      answeredQuestions.push({category: currentCategory, incorrect: currentIncorrect, time: message.extra.time});
      currentIncorrect = false;
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
      else if (message.tag === "wrong") {
        currentIncorrect = true;
        if (document.getElementById("hardcore").checked) {
          doStop();
        }
      }
      else if (message.tag === "questionCategory") {
        currentCategory = message.data;
      }
    }
  }
}

function doStart() {
  handleMessages(startMode(document.getElementById("inputbox").value.toLowerCase()));
  document.getElementById("inputbox").value = "";
  answeredQuestions.splice(0, answeredQuestions.length);
}

function doStop() {
  document.getElementById("inputbox").value = "";
  handleMessages(stopMode());
  // Display answered questions
  const byCategory = {};
  for (const question of answeredQuestions) {
    if (!byCategory[question.category])
      byCategory[question.category] = {correct: 0, total: 0, totalTime: 0};
    if (!question.incorrect)
      byCategory[question.category].correct++;
    byCategory[question.category].total++;
    byCategory[question.category].totalTime += question.time;
  }
  for (const category in byCategory) {
    const data = byCategory[category];
    const avgTime = data.totalTime / data.total;
    console.log(`${category}: ${data.correct}/${data.total} correct, average time: ${avgTime}ms`);
    if (data.averageTime > 7500)
      console.log("Average time is too high!");
    if (data.correct / data.total < 0.85)
      console.log("Accuracy is too low!");
  }
}

function onInputChange(input) {
  if (document.getElementById("requireenter").checked || document.getElementById("hardcore").checked)
    return;
  handleMessages(onMessage(input.value));
}

function onEnterPressed(e, input) {
  if (e.key === "Enter") {
    handleMessages(onMessage(input.value));
  }
}