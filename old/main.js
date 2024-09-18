function getTimeColorBounds() {
  if (mode === "zetamac")
    return  {blueEnd: 800, green: 1200, yellow: 2000, redEnd: 3000};
  return {blueEnd: 3000, green: 5000, yellow: 7500, redEnd: 15000};
}
/**
 * Returns a CSS color string based on how good the answer time is
 */
function getTimeColor(ms) {
  const {blueEnd, green, yellow, redEnd} = getTimeColorBounds();
  const r = Math.max(0, Math.min(1, (ms - green) / (yellow - green))) * 0xff;
  const g = Math.max(0, Math.min(1, 1 - (ms - yellow) / (redEnd - yellow))) * 0xff;
  const b = Math.max(0, Math.min(1, 1 - (ms - blueEnd) / (green - blueEnd))) * 0xff;
  return `rgb(${r}, ${g}, ${b})`;
}

function shouldRequireEnter() {
  return (document.getElementById("requireenter").checked || document.getElementById("hardcore").checked || document.getElementById("testmode").checked);
}

function notTestMode() {
  return !document.getElementById("testmode").checked;
}

const timePerQuestion = 7500;

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
  if (questionCount > 0 && notTestMode()) {
    document.getElementById("averagetime").innerText = `${Math.round(time / questionCount)}ms`;
    document.getElementById("averagetime").style.color = getTimeColor(time / questionCount);
  }
  else
    document.getElementById("averagetime").innerText = "";
}

function getTestLength() {
  return parseInt(document.getElementById("testlength").value);
}

function checkForTestEnd() {
  if (!notTestMode() && mode != "zetamac" && questionCount >= getTestLength()) {
    doStop();
    return true;
  }
  return false;
}

function handleMessages(arr) {
  for (const message of arr) {
    if (message.type === "question") {
      document.getElementById("question").innerText = `${message.data}`;
      document.getElementById("inputbox").value = "";
      currentIncorrect = false;
      MathJax.typeset();
    }
    else if (message.type === "reply") {
      // On correct answer
      answeredQuestions.push({category: currentCategory, incorrect: currentIncorrect, time: message.extra.time, question: message.extra.question, response: message.extra.response});
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
        document.getElementById("score").innerText = "";
        updateData();
        interval = setInterval(() => {
          const t = Date.now() - startT;
          document.getElementById("totaltime").innerText = `${(t / 1000).toFixed(1)}s`;
          if (!notTestMode() && t > (mode === "zetamac" ? getTestLength() * 1000 : timePerQuestion * getTestLength())) {
            doStop();
          }
        }, 100);
      }
      else if (message.tag === "stop") {
        clearInterval(interval);
        document.getElementById("question").innerText = "Click start";
      }
      else if (message.tag === "questionCategory") {
        currentCategory = message.data;
      }
      else if (message.tag === "answertime") {
        if (notTestMode()) {
          document.getElementById("answertime").innerText = `${message.data}ms`;
          document.getElementById("answertime").style.color = getTimeColor(message.data);
        }
        questionCount++;
        updateData();
        if (checkForTestEnd()) {
          break;
        }
      }
      else if (notTestMode()) {
        if (message.tag === "answer") {
          document.getElementById("lastanswer").innerText = message.data;
        }
        else if (message.tag === "wrong") {
          if (shouldRequireEnter())
            currentIncorrect = true;
          if (document.getElementById("hardcore").checked) {
            answeredQuestions.push({category: currentCategory, incorrect: true, time: message.extra.time, question: message.extra.question, response: message.extra.response});
            doStop();
          }
        }
      }
      else if (message.tag === "wrong") {
        // Only called in test mode
        // only time .time is used in "wrong" message
        answeredQuestions.push({category: currentCategory, incorrect: true, time: message.extra.time, question: message.extra.question, response: message.extra.response});
        handleMessages(advanceQuestion());
        questionCount++;
        updateData();
        checkForTestEnd();
      }
    }
  }
}

function doStart() {
  handleMessages(startMode(document.getElementById("mode").value, document.getElementById("inputbox").value.toLowerCase()));
  answeredQuestions.splice(0, answeredQuestions.length);
}

function doStop() {
  document.getElementById("inputbox").value = "";
  handleMessages(stopMode());
  // Display answered questions
  console.log("-----Results-----");
  const byCategory = {};
  for (const question of answeredQuestions) {
    if (!byCategory[question.category])
      byCategory[question.category] = {correct: 0, total: 0, totalTime: 0};
    if (!question.incorrect)
      byCategory[question.category].correct++;
    else if (shouldRequireEnter())
      console.log("[%s] %s (you put %s, ans = %s)", question.category, question.question.str, question.response, question.question.ans);
    byCategory[question.category].total++;
    byCategory[question.category].totalTime += question.time;
  }
  let correct = 0, total = 0, totalTime = 0;
  for (const category in byCategory) {
    const data = byCategory[category];
    correct += data.correct;
    total += data.total;
    totalTime += data.totalTime;
    const avgTime = data.totalTime / data.total;
    console.log(`${category}: ${data.correct}/${data.total} correct, average time: ${Math.round(avgTime)}ms`);
    if (data.averageTime > 7500)
      console.log("Average time is too high!");
    if (data.correct / data.total < 0.8)
      console.log("Accuracy is too low!");
  }
  const score = total * 5 - (total - correct) * 9;
  if (total > 0 && !notTestMode()) {
    document.getElementById("averagetime").innerText = `${Math.round(totalTime / total)}ms`;
    document.getElementById("averagetime").style.color = getTimeColor(totalTime / total);
    if (mode === "zetamac")
      document.getElementById("score").innerText = `${correct} (${correct * 120 / getTestLength()} adj.)`;
    else
      document.getElementById("score").innerText = `${score} (${score * 80 / getTestLength()} adj.)`;
  }
  console.log(`Total: ${correct}/${total} correct, Accuracy: ${Math.round(correct / total * 100)}%`);
  console.log(`Total time: ${Math.round(totalTime)}ms, Average time: ${Math.round(totalTime / total)}ms`);
  console.log(`Score: ${score} (${score * 80 / total} adj.)`);
  console.log("-----End-----");
}

function onInputChange(input) {
  if (!shouldRequireEnter())
    handleMessages(onMessage(input.value));
}

function onEnterPressed(e, input) {
  if (e.key === "Enter") {
    handleMessages(onMessage(input.value));
  }
}

// Show all categories at the start
console.log("Categories:")
for (const category in questionGens) {
  console.log(category);
}