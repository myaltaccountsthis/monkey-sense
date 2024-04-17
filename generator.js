// UTIL

// Inclusive random
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  if (!b) {
    return a;
  }
  return gcd(b, a % b);
}

function binaryExp(base, exp, mod) {
  if (exp === 0) {
    return 1;
  }
  if (exp % 2 === 1) {
    return (base * binaryExp(base, exp - 1, mod)) % mod;
  }
  const half = binaryExp(base, exp / 2, mod);
  return (half * half) % mod;
}

function getNumberRankStr(n) {
  switch (n) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function formatFraction(numerator, denominator) {
  const arr = simplifyFraction(numerator, denominator);
  const whole = Math.floor(Math.abs(arr[0]) / arr[1]);
  const hasFrac = arr[0] % arr[1] !== 0;
  return `${Math.sign(numerator * denominator) < 0 ? "-" : ""}${whole > 0 ? whole + (hasFrac ? " " : "") : ""}${hasFrac ? `${Math.abs(arr[0]) % Math.abs(arr[1])}/${arr[1]}` : ""}`;
}

function simplifyFraction(numerator, denominator) {
  const _gcd_ = gcd(numerator, denominator);
  numerator /= _gcd_;
  denominator /= _gcd_;
  return [numerator, denominator];
}

const polygonStrs = [
  "",
  "",
  "",
  "triangular",
  "square",
  "pentagonal",
  "hexagonal",
  "heptagonal",
  "octagonal",
  "nonagonal",
  "decagonal",
  "hendecagonal",
  "dodecagonal",
];

const questionGens = {
  add: {
    weight: 2,
    func: () => {
      const a = randomInt(10, 9999);
      const b = randomInt(10, 9999);
      return { ans: a + b, str: `${a} + ${b}` };
    },
  },
  sub: {
    weight: 2,
    func: () => {
      const a = randomInt(10, 9999);
      const b = randomInt(10, 9999);
      return { ans: a - b, str: `${a} - ${b}` };
    },
  },
  mult: {
    weight: 3,
    func: () => {
      const a = randomInt(10, 999);
      const b = randomInt(10, 99);
      return { ans: a * b, str: `${a} x ${b}` };
    },
  },
  div: {
    weight: 1,
    func: () => {
      const b = randomInt(5, 40);
      const a = b * randomInt(5, 100);
      return { ans: a / b, str: `${a} ÷ ${b}` };
    },
  },
  sqrt: {
    weight: 1,
    func: () => {
      const d = randomInt(4, 8);
      const a = Math.round(Math.random() * Math.pow(10, d));
      return { ans: Math.sqrt(a), str: `*√${a}`, guess: true };
    },
  },
  cbrt: {
    weight: 1,
    func: () => {
      const d = randomInt(4, 9);
      const a = Math.round(Math.random() * Math.pow(10, d));
      return { ans: Math.cbrt(a), str: `*∛${a}`, guess: true };
    },
  },
  rDec: {
    weight: 1,
    func: () => {
      const d = randomInt(0, 1);
      const bLen = randomInt(1, 2);
      const dMult = Math.pow(10, d);
      let b = (Math.pow(10, bLen) - 1) * dMult;
      let a = randomInt(1, b - 1);
      const rep = `${a % (b / dMult)}`.padStart(bLen, "0");
      const pre = Math.floor((a / b) * dMult);
      const str = `.${d > 0 ? pre : ""}${rep}${rep}${rep}...`;
      const gcd_ = gcd(a, b);
      a /= gcd_;
      b /= gcd_;
      return {
        ans: `${a}/${b}`,
        str: str,
        ansStr: true,
      };
    },
  },
  sq: {
    weight: 1,
    func: () => {
      const a = randomInt(2, 60);
      return { ans: a * a, str: `${a}²` };
    },
  },
  cb: {
    weight: 1,
    func: () => {
      const a = randomInt(2, 20);
      return { ans: a * a * a, str: `${a}³` };
    },
  },
  sqadd: {
    weight: 2,
    func: () => {
      if (Math.random() < 0.5) {
        let a = randomInt(2, 9);
        let b = randomInt(1, 9);
        let d;
        const nums = [b, a, a - 1, 10 - b];
        if (Math.random() < 0.5) {
          d = nums[0];
          nums[0] = nums[3];
          nums[3] = d;
        }
        if (Math.random() < 0.5) {
          d = nums[0];
          nums[0] = nums[2];
          nums[2] = d;
          d = nums[1];
          nums[1] = nums[3];
          nums[3] = d;
        }
        a = nums[0] * 10 + nums[1];
        b = nums[2] * 10 + nums[3];
        return { ans: a * a + b * b, str: `${a}² + ${b}²` };
      }
      let a = randomInt(4, 19) * 5;
      let b = Math.sign(Math.random() - 0.5) + a;
      if (Math.random() < 0.5) {
        d = a;
        a = b;
        b = d;
      }
      return { ans: a * a + b * b, str: `${a}² + ${b}²` };
    },
  },
  fracadd: {
    weight: 4,
    func: () => {
      if (Math.random() < 0.2) {
        let a = randomInt(5, 15);
        let b = Math.sign(Math.random() - 0.5) * randomInt(1, 3) + a;
        let _gcd_ = gcd(a, b);
        a /= _gcd_;
        b /= _gcd_;
        const num = Math.pow(b - a, 2);
        _gcd_ = gcd(num, a * b);
        return {
          ans: `2 ${num / _gcd_}/${(a * b) / _gcd_}`,
          str: `${a}/${b} + ${b}/${a} (mixed)`,
          ansStr: true,
        };
      }
      if (Math.random() < 0.25) {
        const a = randomInt(2, 5);
        const diff = randomInt(1, 3);
        const n = randomInt(3, 5);
        const arr = Array(n)
          .fill(0)
          .map((_, i) => (a + i * diff) * (a + (i + 1) * diff));
        const denom = a * (a + n * diff);
        const _gcd_ = gcd(n, denom);
        return {
          ans: `${n / _gcd_}/${denom / _gcd_}`,
          str: `${arr.map((x) => `1/${x}`).join(" + ")} = `,
          ansStr: true,
        };
      }
      if (Math.random() < 0.33) {
        const a = randomInt(2, 5);
        const rDen = randomInt(2, 6);
        const rNum = randomInt(1, rDen - 1) * Math.sign(Math.random() - 0.3);
        let ansNum = a * rDen;
        let ansDen = rDen - rNum;
        const ans = simplifyFraction(ansNum, ansDen);
        const arr = Array(5)
          .fill(0)
          .map((_, i) =>
            formatFraction(a * Math.pow(rNum, i), Math.pow(rDen, i)),
          );
        return {
          ans: formatFraction(ans[0], ans[1]),
          str: `${arr
            .join(" + ")} + ... = `,
          ansStr: true
        };
      }
      let b = randomInt(2, 9);
      let a = randomInt(1, b - 1);
      let d = randomInt(2, 9);
      let c = randomInt(1, d - 1);
      const _gcd1 = gcd(a, b);
      const _gcd2 = gcd(c, d);
      a /= _gcd1;
      b /= _gcd1;
      c /= _gcd2;
      d /= _gcd2;
      const denom = b * d;
      const improper = a * d + c * b;
      const _gcd3 = gcd(improper, denom);
      const whole = Math.floor(improper / denom);
      return {
        ans: formatFraction(improper, denom),
        str: `${a}/${b} + ${c}/${d} (${whole > 0 ? "mixed" : "proper"})`,
        ansStr: true,
      };
    },
  },
  ngonal: {
    weight: 2,
    func: () => {
      let gon = randomInt(3, 9);
      if (gon >= 4) gon++;
      const n = randomInt(2, 8);
      return {
        ans: (n * ((gon - 2) * n - (gon - 4))) / 2,
        str: `Find the ${getNumberRankStr(n)} ${polygonStrs[gon]} number`,
      };
    },
  },
  modexp: {
    weight: 1,
    func: () => {
      const base = randomInt(10, 150);
      const mod = randomInt(3, 25);
      let exp = randomInt(3, 20);
      if (Math.random() < 0.4) {
        exp = mod + Math.floor(Math.random() * 4 - 1);
      }

      return {
        ans: binaryExp(base, exp, mod),
        str: `Find the remainder of ${base}^${exp} ÷ ${mod}`,
      };
    },
  },
  mod: {
    weight: 2,
    func: () => {
      if (Math.random() < 0.5) {
        const a = randomInt(5, 80);
        const b = randomInt(3, 25);
        const c = randomInt(3, 25);
        const d = randomInt(5, 40);
        const mod = randomInt(3, 8);
        return {
          ans: (a + b * c - d) % mod,
          str: `Find the remainder of (${a} + ${b} x ${c} - ${d}) ÷ ${mod}`,
        };
      }
      const a = randomInt(1000, 99999);
      const mod = randomInt(3, 12);
      return { ans: a % mod, str: `Find the remainder of ${a} ÷ ${mod}` };
    },
  },
  pow: {
    weight: 1,
    func: () => {
      const base = randomInt(2, 8);
      const a = randomInt(-4, 8);
      const b = randomInt(-4, 8);
      const c = randomInt(-4, 8);
      const aPow = randomInt(1, 3);
      const cPow = randomInt(1, 2);
      const ans = aPow * a - b + cPow * c;
      if (ans >= -3 && ans <= 3 && Math.random() < 0.8)
        return {
          ans: ans > 0 ? Math.pow(base, ans) : `1/${Math.pow(base, -ans)}`,
          str: `${Math.pow(base, aPow)}^${a} ÷ ${base}^${b} x ${Math.pow(base, cPow)}^${c} = `,
          ansStr: true,
        };
      return {
        ans: ans,
        str: `Let ${Math.pow(base, aPow)}^${a} ÷ ${base}^${b} x ${Math.pow(base, cPow)}^${c} = ${base}^k. Find k`,
      };
    },
  },
  fracmult: {
    weight: 3,
    func: () => {
      if (Math.random() < 0.2) {
        const c = randomInt(10, 32);
        let bDen = randomInt(3, 12);
        let bNum = randomInt(bDen * 2, Math.round(Math.sqrt(c) * bDen));
        let _gcd_ = gcd(bNum, bDen);
        bDen /= _gcd_;
        bNum /= _gcd_;
        _gcd_ = gcd(bNum, c);
        let aNum = (c * bDen) / _gcd_;
        let aDen = bNum / _gcd_;
        _gcd_ = gcd(aNum, aDen);
        aNum /= _gcd_;
        aDen /= _gcd_;
        const str = `${Math.floor(aNum / aDen)} ${aNum % aDen}/m x n ${bNum % bDen}/${bDen} = ${c}. `;
        switch (Math.floor(Math.random() * 4)) {
          case 0:
            return {
              ans: aDen + Math.floor(bNum / bDen),
              str: str + "m + n = ",
            };
          case 1:
            return {
              ans: aDen - Math.floor(bNum / bDen),
              str: str + "m - n = ",
            };
          case 2:
            return {
              ans: Math.floor(bNum / bDen) - aDen,
              str: str + "n - m = ",
            };
          default:
            return { ans: aDen * Math.floor(bNum / bDen), str: str + "mn = " };
        }
      }
      if (Math.random() < 0.5) {
        let c = randomInt(13, 25);
        let b = c;
        do {
          b = c + randomInt(1, 4) * Math.sign(Math.random() - 0.6666);
        } while (gcd(b, c) > 1);
        let a = c;
        do {
          a = c + randomInt(1, 7) * Math.sign(Math.random() - 0.6666);
        } while (gcd(a, c) > 1);
        let numer = (c - a) * (c - b);
        let val = a + b - c + Math.floor(numer / c);
        numer = ((numer % c) + c) % c;
        return {
          ans: `${val} ${numer}/${c}`,
          str: `${a} x ${b}/${c} = `,
          ansStr: true,
        };
      }
      let d1 = randomInt(2, 12);
      let d2 = randomInt(2, 12);
      const a = Math.max(randomInt(-2, 3), 1) * d2;
      const b = Math.max(randomInt(-2, 3), 1) * d1;
      let n1 = Math.max(randomInt(-2, Math.min(5, d1 - 1)), 1);
      let n2 = Math.max(randomInt(-2, Math.min(5, d2 - 1)), 1);
      let _gcd_ = gcd(d1, n1);
      d1 /= _gcd_;
      n1 /= _gcd_;
      _gcd_ = gcd(d2, n2);
      d2 /= _gcd_;
      n2 /= _gcd_;
      let numer = n1 * n2;
      let denom = d1 * d2;
      _gcd_ = gcd(numer, denom);
      numer /= _gcd_;
      denom /= _gcd_;
      const whole = a * b + (a / d2) * n2 + (b / d1) * n1;
      return {
        ans: `${whole} ${numer}/${denom}`,
        str: `${a} ${n1}/${d1} * ${b} ${n2}/${d2}`,
        ansStr: true,
      };
    },
  },
  complex: {
    weight: 1,
    func: () => {
      const a = randomInt(1, 9);
      const b = randomInt(1, 9);
      const c = randomInt(1, 9);
      const d = randomInt(1, 9);
      const neg = Math.random() < 0.5;
      let str = `(${a} ${neg ? "-" : "+"} ${b}i)(${c} + ${d}i) = a + bi. `;
      switch (Math.floor(Math.random() * 4)) {
        case 0:
          return {
            ans: a * c + a * d + (b * c - b * d) * (neg ? -1 : 1),
            str: str + "a + b = ",
          };
        case 1:
          return {
            ans: a * c - a * d - (b * c + b * d) * (neg ? -1 : 1),
            str: str + "a - b = ",
          };
        case 2:
          return {
            ans: a * d - a * c + (b * c + b * d) * (neg ? -1 : 1),
            str: str + "b - a = ",
          };
        default:
          return {
            ans:
              (a * c - b * d * (neg ? -1 : 1)) *
              (a * d + b * c * (neg ? -1 : 1)),
            str: str + "ab = ",
          };
      }
    },
  },
  estMult: {
    weight: 1,
    func: () => {
      const a = randomInt(1000, 9999);
      const b = randomInt(1000, 4000);
      const c = randomInt(10, 40);
      return { ans: a + b * c, str: `*${a} + ${b} x ${c}`, guess: true };
    },
  },
  estDiv: {
    weight: 1,
    func: () => {
      const a = randomInt(3000, 80000);
      const b = randomInt(10, 80);
      return { ans: a / b, str: `*${a} ÷ ${b}`, guess: true };
    },
  },
  fibSum: {
    weight: 1,
    func: () => {
      let vals = [randomInt(1, 10), randomInt(1, 6)];
      const n = randomInt(7, 12);
      for (let i = 2; i < n; i++) {
        vals.push(vals[i - 1] + vals[i - 2]);
      }
      return {
        ans: vals[vals.length - 1] * 2 + vals[vals.length - 2] - vals[1],
        str: `${vals[0]} + ${vals[1]} + ${vals[2]} + ${vals[3]} + ${vals[4]} + ... + ${vals[vals.length - 2]} + ${vals[vals.length - 1]} = `,
      };
    },
  },
  triRecip: {
    weight: 1,
    func: () => {
      const n = randomInt(3, 10);
      let num = n - 1;
      let den = n + 1;
      const _gcd_ = gcd(num, den);
      num /= _gcd_;
      den /= _gcd_;
      const ans = `${num}/${den}`;
      let str = Array(n - 1)
        .fill(0)
        .map((_, i) => `1/${((i + 2) * (i + 3)) / 2}`)
        .join(" + ");
      str += " = ";
      if (Math.random() < 0.5) {
        return { ans: ans, str: str, ansStr: true };
      }
      return { ans: "1 " + ans, str: `1 + ${str}`, ansStr: true };
    },
  },
  binomExp: {
    weight: 2,
    func: () => {
      const exp = randomInt(3, 6);
      const a = randomInt(1, 8 - exp);
      const b = randomInt(1, 8 - exp) * Math.sign(Math.random() - 0.5);
      const str = `(${a > 1 ? a : ""}x ${b > 0 ? "+" : "-"} ${Math.abs(b) > 1 ? Math.abs(b) : ""}y)^${exp}`;
      if (Math.random() < 0.2) {
        return {
          ans: Math.pow(a + b, exp),
          str: "The sum of the coefficients of " + str + " is ",
        };
      }
      const term = randomInt(2, exp);
      let coef = Math.pow(a, exp - term + 1) * Math.pow(b, term - 1);
      for (let i = exp; i > 1; i--) {
        coef *= i;
      }
      for (let i = 2; i < term; i++) {
        coef /= i;
      }
      for (let i = 2; i <= exp - term + 1; i++) {
        coef /= i;
      }
      switch (Math.floor(Math.random() * 3)) {
        case 0:
          return {
            ans: coef,
            str: `The coefficient of the ${getNumberRankStr(term)} term of ${str} is `,
          };
        case 1:
          return {
            ans: coef,
            str: `The coefficient of the x^${exp - term + 1} y^${term - 1} term of ${str} is `,
          };
        default:
          return {
            ans: coef + exp,
            str: `If the ${getNumberRankStr(term)} term in the expansion of ${str} is c x^a y^b, then a + b + c = `,
          };
      }
    },
  },
};

let keys;
let customWeight = {};
let mode = "";
let modeData = {};
let modeHandler = function (str) {
  const arr = [];
  const n = parseFloat(str);
  if (mode !== "") {
    const t = Date.now() - modeData.lastT;
    if (modeData.question.ansStr) {
      if (str == modeData.question.ans) {
        arr.push({
          type: "reply",
          data: `Correct! The answer is ${modeData.question.ans}. You took ${t}ms.`,
        });
        arr.push({ type: "status", tag: "answer", data: "" });
      }
      else return arr;
    }
    else if (!isNaN(n)) {
      if (
        modeData.question.guess &&
        n >= Math.round(0.95 * modeData.question.ans) &&
        n <= Math.round(1.05 * modeData.question.ans)
      ) {
        const diff =
          Math.abs(n - modeData.question.ans) / modeData.question.ans;
        const prefix =
          diff < 0.01 ?
            "🟦 Excellent guess!" :
            diff < 0.03 ?
              "🟩 Great guess!" :
              "🟨 Good guess!";
        arr.push({
          type: "reply",
          data: `${prefix} ${(diff * 100).toFixed(1)}% off. The answer is ${Math.round(
            modeData.question.ans * 0.95,
          )}-${Math.round(modeData.question.ans * 1.05)}. You took ${t}ms.`,
        });
        arr.push({ type: "status", tag: "answer", data: `${prefix} ${Math.round(diff * 100)}% off. ${Math.round(
          modeData.question.ans * 0.95,
        )}-${Math.round(modeData.question.ans * 1.05)}` });
      }
      else if (n === modeData.question.ans) {
        arr.push({
          type: "reply",
          data: `Correct! The answer is ${modeData.question.ans}. You took ${t}ms.`,
        });
        arr.push({ type: "status", tag: "answer", data: "" });
      }
      else return arr;
    }
    else return arr;

    modeData.total++;
    modeData.lastT = Date.now();
    generateQuestion();
    arr.push({ type: "status", tag: "answertime", data: t});
    arr.push({ type: "question", data: getQuestionText() });
  }
  return arr;
};

function generateQuestion() {
  let totalWeight = 0;
  let key;
  for (key of keys) totalWeight += questionGens[key].weight;
  let rand = Math.random() * totalWeight;
  for (key of keys) {
    rand -= questionGens[key].weight;
    if (rand < 0) break;
  }
  const questionGen = questionGens[key];
  modeData.question = questionGen.func();
  // console.log(modeData.question.ans);
}

function getQuestionText() {
  return `Q${modeData.total + 1}: ${modeData.question.str}`;
}

function startMode(text) {
  if (mode === "") {
    mode = "math";
    const keyStr = text.includes(" ")
      ? text.substring(text.indexOf(" ") + 1).trim()
      : "";
    if (keyStr.length == 0) {
      keys = Object.keys(questionGens);
    }
    else keys = keyStr.split(" ");
    modeData = { total: 0, lastT: Date.now() };
    generateQuestion();
    return [{ type: "status", tag: "start", data: "Starting math..." }, { type: "question", data: getQuestionText() }];
  }
  return [{ type: "status", tag: "alreadyrunning", data: "Math is already running!" }];
}

function stopMode() {
  mode = "";
  return [{ type: "status", tag: "stop", data: "Stopping math..." }];
}

let useChatCommands = false;

/**
 * Handle text to determine if the answer is correct
 * @returns array of objects with type ("status" | "question" | "reply"), data: string, and (tag?: string) if type="status"
 * type="reply" means that the answer is correct
 */
function onMessage(text) {
  if (useChatCommands && text.startsWith("!stop")) {
    return stopMode();
  }
  if (useChatCommands && text.startsWith("!math")) {
    return startMode(text);
  }
  if (useChatCommands && text.startsWith("!question")) {
    return [{ type: "status", data: getQuestionText() }];
  }
  return modeHandler(text);
};
