// UTIL
window.useAsciiMath = window.useAsciiMath ?? false;

const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

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

const months = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "Jun.",
  "Jul.",
  "Aug.",
  "Sep.",
  "Oct.",
  "Nov.",
  "Dec.",
]

const romans = {
  1000: "M",
  900: "CM",
  500: "D",
  400: "CD",
  100: "C",
  90: "XC",
  50: "L",
  40: "XL",
  10: "X",
  9: "IX",
  5: "V",
  4: "IV",
  1: "I"
}

const names = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
]

const tens = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
]

let rng = new Math.seedrandom(window.seed ?? Date.now());

// Random [0, 1)
function random() {
  return rng();
}

// Inclusive random
function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
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

function toRoman(n) {
  let str = ``;
  for (let i = Object.keys(romans).length - 1; i >= 0; i--) {
    const key = Object.keys(romans)[i];
    while (n >= key) {
      str += romans[key];
      n -= key;
    }
  }
  return str;
}

function joinAdd(arr) {
  if (arr.length === 1)
    return arr[0];
  // Make sure to only include + if this number is positive, otherwise - is already included
  return arr.map((x, i) => `${i > 0 && (typeof(arr[i]) == "string" ? parseFloat(arr[i]) : arr[i]) > 0 ? "+" : ""}${x}`).join(" ");
}

class Fraction {
  constructor(numerator, denominator) {
    this.numerator = numerator;
    this.denominator = denominator;
    this.simplify();
  }

  getWhole() {
    return Math.floor(Math.abs(this.numerator) / this.denominator);
  }

  hasFrac() {
    return this.numerator % this.denominator !== 0;
  }

  isMixed() {
    return this.getWhole() !== 0;
  }

  getMixed() {
    const whole = this.getWhole();
    return {whole: whole, frac: new Fraction(Math.abs(this.numerator) % this.denominator, this.denominator)};
  }

  simplify() {
    const _gcd_ = gcd(Math.abs(this.numerator), this.denominator);
    this.numerator /= _gcd_;
    this.denominator /= _gcd_;
    if (this.denominator < 0) {
      this.numerator *= -1;
      this.denominator *= -1;
    }
  }

  formatted({useImproper, overrideNum, overrideDenom, overrideMixed} = {}) {
    const num = overrideNum ?? this.numerator;
    if (num == 0)
      return "0";
    const sign = (num) < 0 ? "-" : "";
    if (this.isMixed() && !useImproper) {
      const mixed = this.getMixed();
      // if (useLatex)
      //   return `${sign}${overrideMixed ?? mixed.whole} \\frac{${overrideNum ?? mixed.frac.numerator}}{${overrideDenom ?? mixed.frac.denominator}}`;
      if ((overrideNum ?? mixed.frac.numerator) === 0)
        return `${sign}${overrideMixed ?? mixed.whole}`;
      return `${sign}${overrideMixed ?? mixed.whole} ${Math.abs(overrideNum ?? mixed.frac.numerator)}/${overrideDenom ?? mixed.frac.denominator}`;
    }
    if (this.denominator === 1) {
      return `${sign}${Math.abs(num)}`;
    }
    // if (useLatex)
    //   return `${sign}\\frac{${overrideNum ?? this.numerator}}{${overrideDenom ?? this.denominator}}`;
    return `${sign}${Math.abs(num)}/${overrideDenom ?? this.denominator}`;
  }

  // toString() {
  //   const sign = this.numerator < 0 ? "-" : "";
  //   if (this.isMixed()) {
  //     const mixed = this.getMixed();
  //     if (mixed.frac.numerator === 0)
  //       return `${sign}${mixed.whole}`;
  //     return `${sign}${mixed.whole} ${mixed.frac.numerator}/${mixed.frac.denominator}`;
  //   }
  //   return `${sign}${this.numerator}/${this.denominator}`;
  // }

  getValue() {
    return this.numerator / this.denominator;
  }

  getAnswerArr() {
    const arr = [this.formatted({useImproper: true})];
    if (this.isMixed()) {
      arr.push(this.formatted());
    }
    if (this.getValue().toString().length < 8)
      arr.push(this.getValue().toString());
    return arr.filter((x, i) => arr.indexOf(x) === i);
  }
}

const questionGens = {
  add: {
    weight: 2,
    tier: 0,
    func: (min = 10, max = 9999) => {
      const a = randomInt(min, max);
      const b = randomInt(min, max);
      return { ans: a + b, str: `\`${a} + ${b} = \`` };
    },
  },
  sub: {
    weight: 2,
    tier: 0,
    func: (min = 10, max = 9999) => {
      const a = randomInt(min, max);
      const b = randomInt(min, max);
      return { ans: a - b, str: `\`${a} - ${b} = \`` };
    },
  },
  mult: {
    weight: 3,
    tier: 1,
    func: (min = 10, maxA = 599, maxB = 79) => {
      const a = randomInt(min, maxA);
      const b = randomInt(min, maxB);
      return { ans: a * b, str: `\`${a} xx ${b} = \`` };
    },
  },
  div: {
    weight: 1,
    tier: 1,
    func: (min = 5, maxAns = 100, maxDiv = 40) => {
      // a isdividend, b isdivisor
      // a's randomInt() isthe answer
      const b = randomInt(min, maxDiv);
      const a = b * randomInt(min, maxAns);
      return { ans: a / b, str: `\`${a} -: ${b} = \`` };
    },
  },
  sqrt: {
    weight: 2,
    tier: 1,
    func: () => {
      const d = randomInt(4, 8);
      const a = Math.round(random() * Math.pow(10, d));
      return { ans: Math.sqrt(a), str: `*\`sqrt(${a}) = \``, guess: true };
    },
  },
  cbrt: {
    weight: 2,
    tier: 2,
    func: () => {
      const d = randomInt(4, 9);
      const a = Math.round(random() * Math.pow(10, d));
      return { ans: Math.cbrt(a), str: `*\`root(3)(${a}) = \``, guess: true };
    },
  },
  rdec: {
    weight: 2,
    tier: 1,
    func: () => {
      const d = randomInt(0, 1);
      const bLen = randomInt(1, 2);
      const dMult = Math.pow(10, d);
      let b = (Math.pow(10, bLen) - 1) * dMult;
      let a = randomInt(1, b - 1);
      const rep = `${a % (b / dMult)}`.padStart(bLen, "0");
      const pre = Math.floor((a / b) * dMult);
      const str = `\`.${d > 0 ? pre : ""}${rep}${rep}${rep}... = \``;
      return {
        ans: new Fraction(a, b).formatted(),
        str: str,
        ansStr: true,
      };
    },
  },
  sq: {
    weight: 1,
    tier: 0,
    func: () => {
      const a = randomInt(2, 60);
      return { ans: a * a, str: `\`${a}^2 = \`` };
    },
  },
  cb: {
    weight: 1,
    tier: 1,
    func: () => {
      const a = randomInt(2, 20);
      return { ans: a * a * a, str: `\`${a}^3 = \`` };
    },
  },
  sqadd: {
    weight: 1,
    tier: 1,
    func: () => {
      // if (random() < 0.5) {
        let a = randomInt(2, 9);
        let b = randomInt(1, 9);
        let d;
        const nums = [b, a, a - 1, 10 - b];
        if (random() < 0.5) {
          d = nums[0];
          nums[0] = nums[3];
          nums[3] = d;
        }
        if (random() < 0.5) {
          d = nums[0];
          nums[0] = nums[2];
          nums[2] = d;
          d = nums[1];
          nums[1] = nums[3];
          nums[3] = d;
        }
        a = nums[0] * 10 + nums[1];
        b = nums[2] * 10 + nums[3];
        return { ans: a * a + b * b, str: `\`${a}^2 + ${b}^2 = \`` };
      // }
      // let a = randomInt(4, 13) * 5;
      // let b = Math.sign(random() - 0.5) + a;
      // if (random() < 0.5) {
      //   d = a;
      //   a = b;
      //   b = d;
      // }
      // return { ans: a * a + b * b, str: `\`${a}^2 + ${b}^2\`` };
    },
  },
  fracadd: {
    weight: 4,
    tier: 2,
    func: () => {
      if (random() < 0.2) {
        // a/b + b/a
        let a = randomInt(5, 15);
        let b = Math.sign(random() - 0.5) * randomInt(1, 3) + a;
        const frac1 = new Fraction(a, b);
        const frac2 = new Fraction(b, a);
        const num = Math.pow(frac1.denominator - frac1.numerator, 2);
        const denom = frac1.denominator * frac2.denominator;
        const ansFrac = new Fraction(2 * denom + num, denom);
        return {
          ans: ansFrac.formatted(),
          str: `\`${frac1.formatted({useImproper: true})} + ${frac2.formatted({useImproper: true})}\` (mixed)`,
          ansStr: true,
        };
      }
      if (random() < 0.25) {
        // reciprocal of arithmetic series
        const a = randomInt(2, 5);
        const diff = randomInt(1, 3);
        const n = randomInt(3, 5);
        const arr = Array(n)
          .fill(0)
          .map((_, i) => (a + i * diff) * (a + (i + 1) * diff));
        const denom = a * (a + n * diff);
        const ansFrac = new Fraction(n, denom);
        return {
          ans: `${ansFrac.formatted()}`,
          str: `\`${arr.map((x) => `1/${x}`).join(" + ")} = \``,
          ansStr: true,
        };
      }
      if (random() < 0.33) {
        // geometric series
        const a = randomInt(2, 5);
        const rDen = randomInt(2, 6);
        const rNum = randomInt(1, rDen - 1) * Math.sign(random() - 0.3);
        let ansNum = a * rDen;
        let ansDen = rDen - rNum;
        const ans = new Fraction(ansNum, ansDen);
        const arr = Array(5)
          .fill(0)
          .map((_, i) =>
            new Fraction(a * Math.pow(rNum, i), Math.pow(rDen, i)).formatted(),
          );
        return {
          ans: ans.formatted({useImproper: true}),
          str: `\`${joinAdd(arr)} + ... = \``,
          ansStr: true
        };
      }
      const b = randomInt(2, 9);
      let a = 0;
      do {
        a = randomInt(1, 4 * b - 1);
      } while (a % b === 0);
      const d = randomInt(2, 7);
      let c = 0;
      do {
        c = randomInt(1, 4 * d - 1);
      } while (c % d === 0);
      const frac1 = new Fraction(a, b);
      const frac2 = new Fraction(c, d);
      const denom = frac1.denominator * frac2.denominator;
      const improper = frac1.numerator * frac2.denominator + frac2.numerator * frac1.denominator;
      const ansFrac = new Fraction(improper, denom);
      return {
        ans: ansFrac.formatted(),
        str: `\`${frac1.formatted()} + ${frac2.formatted()}\` (${ansFrac.isMixed() > 0 ? "mixed" : "proper"})`,
        ansStr: true,
      };
    },
  },
  ngonal: {
    weight: 2,
    tier: 1,
    func: () => {
      let gon = randomInt(3, 9);
      if (gon >= 4) gon++;
      const n = randomInt(2, 15 - gon);
      return {
        ans: (n * ((gon - 2) * n - (gon - 4))) / 2,
        str: `Find the ${getNumberRankStr(n)} ${polygonStrs[gon]} number`,
      };
    },
  },
  modexp: {
    weight: 1,
    tier: 3,
    func: () => {
      const base = randomInt(10, 150);
      const mod = randomInt(3, 25);
      let exp = randomInt(3, 20);
      if (random() < 0.4) {
        exp = mod + randomInt(-1, 2);
      }

      return {
        ans: binaryExp(base, exp, mod),
        str: `Find the remainder of \`${base}^${exp} -: ${mod}\``,
      };
    },
  },
  mod: {
    weight: 3,
    tier: 1,
    func: () => {
      if (random() < 0.5) {
        const a = randomInt(5, 80);
        const b = randomInt(3, 25);
        const c = randomInt(3, 25);
        const d = randomInt(5, 40);
        const mod = randomInt(3, 8);
        return {
          ans: (a + b * c - d) % mod,
          str: `Find the remainder of \`(${a} + ${b} xx ${c} - ${d}) -: ${mod}\``,
        };
      }
      const a = randomInt(1000, 99999);
      const mod = randomInt(3, 12);
      return { ans: a % mod, str: `Find the remainder of \`${a} -: ${mod}\`` };
    },
  },
  pow: {
    weight: 2,
    tier: 2,
    func: () => {
      const base = randomInt(2, 8);
      const aPow = randomInt(1, 3);
      const cPow = randomInt(1, 2);
      let a = 0;
      do {
        a = randomInt(-3, Math.floor(8 / aPow));
      } while (a == 0);
      let b = 0;
      do {
        b = randomInt(-4, 8);
      } while (b == 0);
      let c = 0;
      do {
        c = randomInt(-3, Math.floor(8 / cPow));
      } while (c == 0);
      const ans = aPow * a - b + cPow * c;
      if (ans >= -3 && ans <= 3 && random() < 0.9)
        return {
          ans: ans >= 0 ? Math.pow(base, ans) : `1/${Math.pow(base, -ans)}`,
          str: `\`${Math.pow(base, aPow)}^${a} -: ${base}^${b} xx ${Math.pow(base, cPow)}^${c} = \``,
          ansStr: true,
        };
      return {
        ans: ans,
        str: `Let \`${Math.pow(base, aPow)}^${a} -: ${base}^${b} xx ${Math.pow(base, cPow)}^${c} = ${base}^k\`. Find k`,
      };
    },
  },
  fracmult: {
    weight: 4,
    tier: 2,
    func: () => {
      if (random() < 0.2) {
        // x y/m + n z/a = b, find m and n
        const c = randomInt(10, 32);
        let bDen = randomInt(3, 12);
        let bNum = 0;
        do {
          bNum = randomInt(bDen * 2, Math.round(Math.sqrt(c) * bDen));
        } while (c * bDen % bNum == 0);
        const frac2 = new Fraction(bNum, bDen);
        const frac1 = new Fraction(c * frac2.denominator, frac2.numerator);
        const m = frac1.denominator, n = frac2.getWhole();
        const str = `\`${frac1.formatted({overrideDenom: "m"})} xx ${frac2.formatted({overrideMixed: "n"})} = ${c}\`. `;
        switch (randomInt(0, 3)) {
          case 0:
            return {
              ans: m + n,
              str: str + "\`m + n = \`",
            };
          case 1:
            return {
              ans: m - n,
              str: str + "\`m - n = \`",
            };
          case 2:
            return {
              ans: n - m,
              str: str + "\`n - m = \`",
            };
          default:
            return { ans: m * n, str: str + "\`mn = \`" };
        }
      }
      if (random() < 0.4) {
        // a * b/c where a and b are close to c
        let c = randomInt(13, 25);
        let b = c;
        do {
          b = c + randomInt(1, 4) * Math.sign(random() - 0.6666);
        } while (gcd(b, c) > 1);
        let a = c;
        do {
          a = c + randomInt(1, 7) * Math.sign(random() - 0.6666);
        } while (gcd(a, c) > 1);
        let numer = (c - a) * (c - b);
        let val = a + b - c + Math.floor(numer / c);
        numer = ((numer % c) + c) % c;
        return {
          ans: `${val} ${numer}/${c}`,
          str: `\`${a} xx ${new Fraction(b, c).formatted({useImproper: true})}\` (mixed)`,
          ansStr: true,
        };
      }
      if (random() < .66) {
        // foil where a b/c * d e/f and a % f == 0 and d % c == 0
        let d1 = randomInt(2, 12);
        let d2 = randomInt(2, 12);
        let n1 = Math.max(randomInt(-2, Math.min(5, d1 - 1)), 1);
        let n2 = Math.max(randomInt(-2, Math.min(5, d2 - 1)), 1);
        const frac1 = new Fraction(n1, d1);
        const frac2 = new Fraction(n2, d2);
        const a = Math.max(randomInt(-2, 3), 1) * frac2.denominator;
        const b = Math.max(randomInt(-2, 3), 1) * frac1.denominator;
        const ansFrac = new Fraction(frac1.numerator * frac2.numerator, frac1.denominator * frac2.denominator);
        const mixed1 = new Fraction(a * frac1.denominator + frac1.numerator, frac1.denominator);
        const mixed2 = new Fraction(b * frac2.denominator + frac2.numerator, frac2.denominator);
        const whole = a * b + (a / frac2.denominator) * frac2.numerator + (b / frac1.denominator) * frac1.numerator;
        return {
          ans: `${new Fraction(whole * ansFrac.denominator + ansFrac.numerator, ansFrac.denominator).formatted()}`,
          str: `\`${mixed1.formatted()} xx ${mixed2.formatted()}\` (mixed)`,
          ansStr: true,
        };
      }
      // generic frac mult
      const d1 = randomInt(2, 12);
      const d2 = randomInt(2, 12);
      const n1 = randomInt(1, d1 - 1);
      const n2 = randomInt(1, d2 - 1);
      const ansFrac = new Fraction(n1 * n2, d1 * d2);
      return {
        ans: ansFrac.getAnswerArr(),
        str: `\`${new Fraction(n1, d1).formatted()} xx ${new Fraction(n2, d2).formatted()} = \``,
        ansStr: true,
      };
    },
  },
  complex: {
    weight: 2,
    tier: 2,
    func: () => {
      const a = randomInt(1, 9);
      const b = randomInt(1, 9);
      const c = randomInt(1, 9);
      const d = randomInt(1, 9);
      const neg = random() < 0.5;
      let str = `\`(${a} ${neg ? "-" : "+"} ${b}i)(${c} + ${d}i) = a + bi\`. `;
      if (a + b + c + d < 16 && random() < 0.5) {
        return {
          ans:
            (a * c - b * d * (neg ? -1 : 1)) *
            (a * d + b * c * (neg ? -1 : 1)),
          str: str + "\`ab = \`",
        };
      }
      switch (randomInt(0, 2)) {
        case 0:
          return {
            ans: a * c - a * d - (b * c + b * d) * (neg ? -1 : 1),
            str: str + "\`a - b = \`",
          };
        case 1:
          return {
            ans: a * d - a * c + (b * c + b * d) * (neg ? -1 : 1),
            str: str + "\`b - a = \`",
          };
        default:
          return {
            ans: a * c + a * d + (b * c - b * d) * (neg ? -1 : 1),
            str: str + "\`a + b = \`",
          };
      }
    },
  },
  estmix: {
    weight: 2,
    tier: 1,
    func: () => {
      const a = randomInt(1000, 9999);
      const b = randomInt(1000, 4000);
      const c = randomInt(10, 40);
      return { ans: a + b * c, str: `*\`${a} + ${b} xx ${c} = \``, guess: true };
    },
  },
  estdiv: {
    weight: 1,
    tier: 1,
    func: () => {
      const a = randomInt(3000, 80000);
      const b = randomInt(10, 80);
      return { ans: a / b, str: `*\`${a} -: ${b} = \``, guess: true };
    },
  },
  fibsum: {
    weight: 2,
    tier: 2,
    func: () => {
      let vals = [randomInt(1, 10), randomInt(1, 6)];
      const n = randomInt(7, 12);
      for (let i = 2; i < n; i++) {
        vals.push(vals[i - 1] + vals[i - 2]);
      }
      if (random() < .4) {
        // frac fib
        const frac = Math.pow(2, randomInt(1, 3));
        vals = vals.map((v, _) => new Fraction(v, frac));
        let str = `\``;
        for (let i = 0; i < 5; i++) {
          str += random() < .33 ? random() < .5 ? `${vals[i].formatted({useImproper: true})} + ` : `${vals[i].getValue()} + ` : `${vals[i].formatted()} + `;
        }
        str += `... + ${vals[vals.length - 2].formatted()} + ${vals[vals.length - 1].formatted()} = \``;
        const ansFrac = new Fraction((vals[vals.length - 1].getValue() * 2 + vals[vals.length - 2].getValue() - vals[1].getValue()) * frac, frac);
        return {
          ans: ansFrac.getAnswerArr(),
          str: str,
          ansStr: true,
        }
      }
      return {
        ans: vals[vals.length - 1] * 2 + vals[vals.length - 2] - vals[1],
        str: `\`${vals[0]} + ${vals[1]} + ${vals[2]} + ${vals[3]} + ${vals[4]} + ... + ${vals[vals.length - 2]} + ${vals[vals.length - 1]} = \``,
      };
    },
  },
  trirecip: {
    weight: 1,
    tier: 1,
    func: () => {
      const n = randomInt(3, 10);
      let num = n - 1;
      let den = n + 1;
      const ansFrac = new Fraction(num, den); 
      const arr = Array(n - 1)
        .fill(0)
        .map((_, i) => new Fraction(1, ((i + 2) * (i + 3)) / 2).formatted());
      let str = arr.slice(0, Math.min(arr.length - 1, 4)).join(" + ");
      if (arr.length > 5)
        str += " + ...";
      str += " + " + arr[arr.length - 1];
      str += " = ";
      if (random() < 0.3) {
        return { ans: ansFrac.getAnswerArr(), str: `\`${str}\``, ansStr: true };
      }
      if (random() < .5) {
        return { ans: new Fraction(num + den, den).getAnswerArr(), str: `\`1 + ${str}\``, ansStr: true };
      }
      return { ans: new Fraction(num + den, den).getAnswerArr(), str: `The sum of the reciprocals of the first \`${n}\` triangular numbers is`, ansStr: true };
    },
  },
  binomexp: {
    weight: 2,
    tier: 3,
    func: () => {
      const exp = randomInt(3, 6);
      const a = randomInt(1, 8 - exp);
      const b = randomInt(1, 8 - exp) * Math.sign(random() - 0.5);
      const str = `\`(${a > 1 ? a : ""}x ${b > 0 ? "+" : "-"} ${Math.abs(b) > 1 ? Math.abs(b) : ""}y)^${exp}\``;
      if (random() < 0.2) {
        return {
          ans: Math.pow(a + b, exp),
          str: "The sum of the coefficients of " + str + " is",
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
      switch (randomInt(0, 2)) {
        case 0:
          return {
            ans: coef,
            str: `The coefficient of the ${getNumberRankStr(term)} term of ${str} is`,
          };
        case 1:
          return {
            ans: coef,
            str: `The coefficient of the \`x^${exp - term + 1} y^${term - 1}\` term of ${str} is`,
          };
        default:
          return {
            ans: coef + exp,
            str: `If the ${getNumberRankStr(term)} term in the expansion of ${str} is \`cx^ay^b\`, then \`a + b + c = \``,
          };
      }
    },
  },
  relprime: {
    weight: 1,
    tier: 1,
    func: () => {
      let a = 0;
      do {
        a = randomInt(8, 50);
      } while (primes.includes(a));
      let arr = [];
      let temp = a;
      for (let i = 2; i <= temp; i++) {
        while (temp % i == 0) {
          if (!arr.includes(i)) arr.push(i);
          temp /= i;
        }
      }
      let ans = arr.reduce((acc, val) => acc * (val - 1) / val, a);
      const start = Math.max(randomInt(-2, 5), 1);
      for (let i = 1; i < start; i++) {
        if (gcd(i, a) == 1) ans--;
      }
      return {
        ans: ans,
        str: start == 1 ? `Find the number of integers less than \`${a}\` that are relatively prime to \`${a}\`` : `Find the number of integers between \`${start - 1}\` and \`${a}\` that are relatively prime to \`${a}\``,
      };
    }
  },
  posfact: {
    weight: 1,
    tier: 1,
    func: () => {
      let a = 0;
      do {
        a = randomInt(8, 50);
      } while (primes.includes(a));
      let arr = [];
      let temp = a;
      let ans = 1;
      for (let i = 2; i <= temp; i++) {
        let count = 1;
        while (temp % i == 0) {
          if (!arr.includes(i)) arr.push(i);
          temp /= i;
          count++;
        }
        ans *= count;
      }
      //if (random() < .4) {
      //  return { ans: arr.length, str: `Find the number of positive prime divisors of \`${a}\`` };
      //}
      return { ans: ans, str: `Find the number of positive integral divisors of \`${a}\`` };
    }
  },
  base: {
    weight: 1,
    tier: 3,
    func: () => {
      const base = randomInt(2, 9);
      const a = randomInt(20, 250);
      const conv = parseInt(a.toString(base));
      if (random() < .5) {
        return { ans: conv, str: `Convert \`${a}\` base \`10\` to base \`${base}\`` };
      }
      return { ans: a, str: `Convert \`${conv}_${base}\` to base \`10\`` };
    }
  },
  basearith: {
    weight: 3,
    tier: 3,
    func: () => {
      const mode = randomInt(1, 4);
      if (mode == 1) {
        const a = randomInt(10, 250);
        const b = randomInt(10, 250);
        const base = randomInt(4, 9);
        return { ans: parseInt((a + b).toString(base)), str: `\`${a.toString(base)}_${base}+${b.toString(base)}_${base} = \`` };
      }
      else if (mode == 2) {
        const a = randomInt(10, 250);
        const b = randomInt(10, 250);
        const base = randomInt(4, 9);
        return { ans: parseInt((a - b).toString(base)), str: `\`${a.toString(base)}_${base} - ${b.toString(base)}_${base} = \`` };
      }
      else if (mode == 3) {
        const a = randomInt(10, 80);
        const b = randomInt(4, 25);
        const base = randomInt(4, 9);
        return { ans: parseInt((a * b).toString(base)), str: `\`${a.toString(base)}_${base} xx ${b.toString(base)}_${base} = \`` };
      }
      const b = randomInt(2, 9);
      const a = b * randomInt(5, 25);
      const base = randomInt(4, 9);
      return { ans: parseInt((a / b).toString(base)), str: `\`${a.toString(base)}_${base} -: ${b.toString(base)}_${base} = \`` };
    },
  },
  inverse: {
    weight: 1,
    tier: 3,
    func: () => {
      const a = randomInt(2, 9);
      const b = randomInt(2, 9) * Math.sign(random() - 0.3);
      const c = randomInt(2, 6);
      const d = randomInt(2, 6) * Math.sign(random() - 0.3);
      if (random() < 0.5) {
        const e = randomInt(2, 6) * Math.sign(random() - 0.3);
        return {
          ans: new Fraction((c * (e - d) - b), a).getAnswerArr(),
          str: `If \`f(x) = (${a}x ${b > 0 ? `+` : `-`} ${Math.abs(b)}) / ${c} ${d > 0 ? `+` : `-`} ${Math.abs(d)}\`, what is the value of \`f^-1(${e})\`?`,
          ansStr: true,
        }
      }
      let e = 1;
      do {
        e = randomInt(1, 4) * Math.sign(random() - 0.5);
      } while (e * c == a);
      return {
        ans: new Fraction(b - e * d, e * c - a).getAnswerArr(),
        str: `If \`f(x) = (${a}x ${b > 0 ? `+` : `-`} ${Math.abs(b)}) / (${c}x ${d > 0 ? `+` : `-`} ${Math.abs(d)})\`, what is the value of \`f^-1(${e})\`?`,
        ansStr: true,
      };
    }
  },
  // date: {
  //   weight: 1,
  //   func: () => {
  //     const a = new Date(2024, randomInt(0, 6), randomInt(1, 28));
  //     const b = new Date(2024, a.getMonth() + randomInt(1, 4), randomInt(1, 28));
  //     let diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  //     const aBegin = random() < .5;
  //     const bBegin = random() < .5;
  //     if (aBegin)
  //       diff++;
  //     if (bBegin)
  //       diff--;
  //     return {
  //       ans: diff,
  //       str: `How many days are between ${aBegin ? "the beginning of " : "the end of "}${months[a.getMonth()]} \`${a.getDate()}, ${a.getFullYear()}\` and ${bBegin ? "the beginning of " : "the end of "}${months[b.getMonth()]} \`${b.getDate()}, ${b.getFullYear()}\`?`
  //     };
  //   }
  // },
  set: {
    weight: 1,
    tier: 1,
    func: () => {
      const n = randomInt(5, 9);
      const r = randomInt(2, n - 2);
      const arr = [];
      for (let i = 0; i < n; i++) {
        let letter = 0;
        do {
          letter = randomInt(0, 25);
        } while (arr.includes(letter));
        arr.push(letter);
      }
      let ans = 1;
      for (let i = n; i > n - r; i--) {
        ans *= i;
      }
      for (let i = 2; i <= r; i++) {
        ans /= i;
      }
      return {
        ans: ans,
        str: `The set \`[\`${arr.map(s => String.fromCharCode(97 + s)).join(", ")}\`]\` contains how many \`${r}\` element subsets?`
      };
    }
  },
  lcm: {
    weight: 1,
    tier: 0,
    func: () => {
      const c = randomInt(5, 20);
      const a = randomInt(2, 9) * c;
      let b = 0;
      do {
        b = randomInt(2, 9) * c;
      } while (b == a);
      return { ans: a * b / gcd(a, b), str: `Find the LCM of \`${a}\` and \`${b}\`` };
    }
  },
  gcd: {
    weight: 1,
    tier: 0,
    func: () => {
      const c = randomInt(5, 20);
      const a = randomInt(2, 9) * c;
      let b = 0;
      do {
        b = randomInt(2, 9) * c;
      } while (b == a);
      return { ans: gcd(a, b), str: `Find the GCD of \`${a}\` and \`${b}\`` };
    }
  },
  quadfact: {
    weight: 1,
    tier: 1,
    func: () => {
      const a = randomInt(1, 5);
      const b = randomInt(1, 5) * Math.sign(random() - 0.5);
      const c = randomInt(2, 9);
      return {
        ans: (a * c + b) * (a * c + b),
        str: `If \`f(x)=${a > 1 ? a * a : ""}x^2 ${b > 0 ? "+" : "-"} ${2 * a * Math.abs(b)}x + ${b * b}\`, find the value of \`f(${c})\``,
      };
    }
  },
  roundsqrt: {
    weight: 1,
    tier: 1,
    func: () => {
      const nums = [2, 3, 5, 6, 7, 8, 10];
      const a = nums[randomInt(0, nums.length - 1)];
      const b = nums[randomInt(0, nums.length - 1)];
      return {
        ans: (Math.sqrt(a) + Math.sqrt(b)).toFixed(1),
        str: `Find the value of \`sqrt(${a}) + sqrt(${b})\` rounded to the nearest tenth`,
        ansStr: true,
      };
    }
  },
  sumsqrt: {
    weight: 1,
    tier: 3,
    func: () => {
      const a = randomInt(2, 7);
      const b = randomInt(2, 7);
      let c = 0;
      do {
        c = randomInt(2, 8);
      } while (c == 4);
      return {
        ans: (a + b) * (a + b) * c,
        str: `If \`sqrt(${a * a * c}) + sqrt(${b * b * c}) = sqrt(x)\`, then \`x = \``,
      };
    }
  },
  rootdata: {
    weight: 4,
    tier: 2,
    func: () => {
      if (random() < .3) {
        const a = randomInt(2, 6);
        const b = randomInt(2, 12);
        const c = randomInt(2, 10);
        if (random() < .5) {
          return {
            ans: new Fraction(c, a).getAnswerArr(),
            str: `The product of the roots of \`${a}x^2 + ${b}x + ${c}\` is`,
            ansStr: true,
          };
        }
        return {
          ans: new Fraction(-b, a).getAnswerArr(),
          str: `The sum of the roots of \`${a}x^2 + ${b}x + ${c}\` is`,
          ansStr: true,
        };
      }
      const a = randomInt(2, 6);
      const b = randomInt(2, 12);
      const c = randomInt(2, 20);
      const d = randomInt(2, 15);
      const mode = randomInt(1, 4);
      if (mode == 1) {
        return {
          ans: new Fraction(-b, a).getAnswerArr(),
          str: `The sum of the roots of \`${a}x^3 + ${b}x^2 + ${c}x + ${d} = 0\` is`,
          ansStr: true,
        };
      }
      else if (mode == 2) {
        return {
          ans: new Fraction(-d, a).getAnswerArr(),
          str: `The product of the roots of \`${a}x^3 + ${b}x^2 + ${c}x + ${d} = 0\` is`,
          ansStr: true,
        };
      }
      else if (mode == 3) {
        return {
          ans: new Fraction(c, a).getAnswerArr(),
          str: `The sum of the roots taken two at a time of \`${a}x^3 + ${b}x^2 + ${c}x + ${d} = 0\` is`,
          ansStr: true,
        };
      }
      return {
        ans: new Fraction(-3 * d, c).getAnswerArr(),
        str: `The harmonic mean of the roots of \`${a}x^3 + ${b}x^2 + ${c}x + ${d} = 0\` is`,
        ansStr: true,
      };
    }
  },
  cuberules: {
    weight: 3,
    tier: 2,
    func: () => {
      const mode = randomInt(1, 3);
      if (mode == 1) {
        const a = randomInt(1, 8) * Math.sign(random() - .5);
        const b = randomInt(1, 12) * Math.sign(random() - .5);
        if (random() < .5) {
          return {
            ans: (a * a - 3 * b) * a,
            str: `If \`x + y = ${a}\` and \`xy = ${b}\`, then \`x^3 + y^3 = \``,
          };
        }
        return {
          ans: (a * a + 3 * b) * a,
          str: `If \`x - y = ${a}\` and \`xy = ${b}\`, then \`x^3 - y^3 = \``,
        }
      }
      if (mode == 2) {
        const a = randomInt(1, 11);
        let b = 0;
        do {
          b = randomInt(1, 11) * Math.sign(random() - .5);
        } while (b == -a);
        return {
          ans: a * a - a * b + b * b,
          str: `\`(${a}^3 ${b > 0 ? "+" : "-"} ${Math.abs(b)}^3) -: (${a} ${b > 0 ? "+" : "-"} ${Math.abs(b)}) = \``,
        }
      }
      const a = randomInt(1, 8) * Math.sign(random() - .5);
      const b = randomInt(1, 8) * Math.sign(random() - .5);
      if (random() < .5) {
        return {
          ans: a * a * a + b * b * b,
          str: `If \`x = ${a}\` and \`y = ${b}\`, \`(x + y)(x^2 - xy + y^2) = \``,
        }
      }
      return {
        ans: a * a * a - b * b * b,
        str: `If \`x = ${a}\` and \`y = ${b}\`, \`(x - y)(x^2 + xy + y^2) = \``,
      }
    }
  },
  rootfrac: {
    weight: 2,
    tier: 3,
    func: () => {
      const b = randomInt(2, 4);
      let a = 0;
      do {
        a = randomInt(1, 4 * b - 1);
      } while (a % b == 0);
      const d = randomInt(2, 4);
      let c = 0;
      do {
        c = randomInt(1, 4 * d - 1);
      } while (c % d == 0);
      const frac1 = new Fraction(a, b);
      const frac2 = new Fraction(c, d);
      const denom = frac1.denominator * frac2.denominator;
      const improper = frac1.numerator * frac2.denominator + frac2.numerator * frac1.denominator;
      const ansFrac = new Fraction(improper, denom);
      const str = `If \`(root(${b})(a^${a}))(root(${d})(a^${c})) = root(n)(a^k)\`, then `;
      const mode = randomInt(1, 3);
      if (mode == 1) {
        return {
          ans: ansFrac.numerator,
          str: str + `\`k = \``,
        }
      }
      if (mode == 2) {
        return {
          ans: ansFrac.denominator,
          str: str + `\`n = \``,
        }
      }
      return {
        ans: ansFrac.numerator + ansFrac.denominator,
        str: str + `\`k + n = \``,
      };
    }
  },
  fracrecip: {
    weight: 1,
    tier: 1,
    func: () => {
      const b = randomInt(2, 10);
      const a = randomInt(1, b - 1);
      const d = randomInt(2, 10);
      let c = 0;
      do {
        c = randomInt(1, d - 1);
      } while (a / b == c / d);
      const frac1 = new Fraction(a, b);
      const frac2 = new Fraction(c, d);
      const denom = frac1.denominator * frac2.denominator;
      const improper = frac2.numerator * frac1.denominator - frac1.numerator * frac2.denominator;
      const ansFrac = new Fraction(denom, improper);
      return {
        ans: ansFrac.getAnswerArr(),
        str: `If \`${frac1.formatted()} + 1/x = ${frac2.formatted()}\`, then \`x = \``,
        ansStr: true,
      };
    }
  },
  modequal: {
    weight: 1,
    tier: 3,
    func: () => {
      const a = randomInt(2, 10);
      const b = randomInt(2, 10);
      const ans = randomInt(1, 20);
      let mod = 0;
      do {
        mod = randomInt(6, 20);
      } while (ans * a % mod == 0 || gcd(a, mod) != 1);
      return {
        ans: ans,
        str: `Find \`x, ${Math.floor(ans / mod) * mod} <= x <= ${Math.floor((ans + mod) / mod) * mod - 1},\` if \`${a}x + ${b} ~= ${a * ans % mod + b} (mod ${mod})\``,
      }
      
    }
  },
  diffsquares: {
    weight: 2,
    tier: 0,
    func: () => {
      const a = randomInt(20, 60);
      const b = a + randomInt(1, 10) * Math.sign(random() - 0.5);
      return {
        ans: a * a - b * b,
        str: `\`${a}^2 - ${b}^2 = \``,
      }
    }
  },
  fracsub: {
    weight: 1,
    tier: 0,
    func: () => {
      const b = randomInt(2, 9);
      let a = 0;
      do {
        a = randomInt(1, 4 * b - 1);
      } while (a % b === 0);
      const d = randomInt(2, 7);
      let c = 0;
      do {
        c = randomInt(1, 3 * d - 1);
      } while (c % d === 0);
      const frac1 = new Fraction(a, b);
      const frac2 = new Fraction(c, d);
      const denom = frac1.denominator * frac2.denominator;
      const improper = frac1.numerator * frac2.denominator - frac2.numerator * frac1.denominator;
      const ansFrac = new Fraction(improper, denom);
      return {
        ans: ansFrac.formatted(),
        str: `\`${frac1.formatted()} - ${frac2.formatted()}\` (${ansFrac.isMixed() > 0 ? "mixed" : "proper"})`,
        ansStr: true,
      };
    }
  },
  fracdiv: {
    weight: 1,
    tier: 0,
    func: () => {
      const d1 = randomInt(2, 12);
      const d2 = randomInt(2, 12);
      const n1 = randomInt(1, d1 - 1);
      const n2 = randomInt(1, d2 - 1);
      return {
        ans: new Fraction(n1 * d2, n2 * d1).getAnswerArr(),
        str: `\`${new Fraction(n1, d1).formatted()} -: ${new Fraction(n2, d2).formatted()} = \``,
        ansStr: true,
      };
    }
  },
  multadd: {
    weight: 1,
    tier: 0,
    func: () => {
      const a = Math.pow(10, randomInt(1, 2)) * randomInt(3, 30);
      const b = randomInt(4, 20);
      return {
        ans: a * b,
        str: `\`${a - b} xx ${b} + ${b * b} = \``
      };
    }
  },
  binomnum: {
    weight: 1,
    tier: 3,
    func: () => {
      const pow = randomInt(2, 3);
      const a = randomInt(1, 9);
      const b = randomInt(1, 9);
      const num = a * 100 + b;
      return {
        ans: Math.pow(num, pow),
        str: `\`(${num})^${pow} = \``
      };
    }
  },
  varies: {
    weight: 1,
    tier: 2,
    func: () => {
      const a = randomInt(3, 20);
      const b = randomInt(3, 20);
      let c = 0;
      do {
        c = randomInt(3, 20);
      } while (c == a);
      if (random() < .5) {
        return {
          ans: new Fraction(b * c, a).getAnswerArr(),
          str: `Given \`y\` varies directly with \`x\` and \`y=${b}\` when \`x=${a}\`. Find y when \`x = ${c}\``,
          ansStr: true
        }
      }
      return {
        ans: new Fraction(b * a, c).getAnswerArr(),
        str: `Given \`y\` varies inversely with \`x\` and \`y=${b}\` when \`x=${a}\`. Find y when \`x = ${c}\``,
        ansStr: true
      };
    }
  },
  numdivis: {
    weight: 1,
    tier: 1,
    func: () => {
      const mod = randomInt(3, 12);
      const a = randomInt(3, 20);
      const b = randomInt(a + mod * 7, a + mod * 12);
      return {
        ans: (Math.floor((b - 1) / mod) - Math.ceil((a + 1) / mod) + 1),
        str: `How many integers between \`${a}\` and \`${b}\` are divisible by \`${mod}\`?`
      };
    }
  },
  roman: {
    weight: 1,
    tier: 0,
    func: () => {
      const a = randomInt(1, 2) * 1000 + randomInt(1, 90);
      const b = randomInt(1, 9) * 100 + randomInt(1, 90);
      const aStr = toRoman(a);
      const bStr = toRoman(b);
      if (random() < .5) {
        return {
          ans: a + b,
          str: `${aStr} \`+\` ${bStr} \`=\` (Arabic Numeral)`
        }
      }
      return {
        ans: a - b,
        str: `${aStr} \`-\` ${bStr} \`=\` (Arabic Numeral)`
      }
    }
  },
  setint: {
    weight: 1,
    tier: 1,
    func: () => {
      const arr1 = Array(randomInt(2, 5)).fill(0).map((v, _) => String.fromCharCode(97 + randomInt(0, 25)));
      const arr2 = Array(randomInt(2, 5)).fill(0).map((v, _) => String.fromCharCode(97 + randomInt(0, 25)));
      const arr3 = Array(randomInt(2, 5)).fill(0).map((v, _) => String.fromCharCode(97 + randomInt(0, 25)));
      const arr4 = Array(randomInt(2, 5)).fill(0).map((v, _) => String.fromCharCode(97 + randomInt(0, 25)));
      const seta = new Set(arr1.concat(arr2));
      const setb = new Set(arr3.concat(arr4));
      let ans = 0;
      seta.forEach((v) => {if (setb.has(v)) ans++});
      return {
        ans: ans,
        str: `\`[{\`${arr1.join(", ")}\`}uu{\`${arr2.join(", ")}\`}]nn[{\`${arr3.join(", ")}\`}uu{\`${arr4.join(", ")}\`}]\` contains how many distinct elements?`
      };
    }
  },
  basefrac: {
    weight: 1,
    tier: 3,
    func: () => {
      const base = randomInt(4, 9);
      let num = 0;
      do {
        num = randomInt(base + 1, base * base - 1);
      } while (gcd(num, base) != 1);
      const frac = new Fraction(num, base * base);
      const a = parseInt(num.toString(base));
      if (random() < .5) {
        return {
          ans: [frac.formatted(), frac.formatted({useImproper: true})],
          str: `\`${a / 100}_${base} =\`base 10 (fraction)`,
          ansStr: true
        }
      }
      return {
        ans: a / 100,
        str: `Change \`${frac.formatted()}\` to a base \`${base}\` decimal`
      }
    }
  },
  quadvert: {
    weight: 1,
    tier: 3,
    func: () => {
      const a = Math.max(randomInt(-2, 2), 1) * Math.sign(random() - 0.5);
      const b = randomInt(1, 8) * Math.sign(random() - 0.5);
      const c = randomInt(1, 8) * Math.sign(random() - 0.5);
      const num = -b;
      const denom = 2 * a;
      // const vert = -b / (2 * a);
      if (random() < .4) {
        return {
          ans: new Fraction(num * num * a + num * denom * b + c * denom * denom, denom * denom).getAnswerArr(),
          str: `The ${a > 0 ? "minimum" : "maximum"} value of \`${(a < 0 ? "-" : "") + (Math.abs(a) > 1 ? Math.abs(a) : "")}x^2${(b < 0 ? "-" : "+") + (Math.abs(b) > 1 ? Math.abs(b) : "")}x${(c < 0 ? "-" : "+") + Math.abs(c)}\` is`,
          ansStr: true
        }
      }
      return {
        ans: new Fraction(num * num * a + num * denom * (b + 1) + c * denom * denom, denom * denom).getAnswerArr(),
        str: `Given: \`f(x)=${(a < 0 ? "-" : "") + (Math.abs(a) > 1 ? Math.abs(a) : "")}x^2${(b < 0 ? "-" : "+") + (Math.abs(b) > 1 ? Math.abs(b) : "")}x${(c < 0 ? "-" : "+") + Math.abs(c)}\` has a ${a > 0 ? "minimum" : "maximum"} point at \`(a, b)\`. Find \`a + b\`.`,
        ansStr: true
      }
    }
  },
  quadroot: {
    weight: 1,
    tier: 2,
    func: () => {
      const a = randomInt(1, 5);
      const b = randomInt(1, 5) * Math.sign(random() - 0.5);
      const numer = randomInt(1, 5);
      const denom = random() > .5 ? 1 : randomInt(2, 5);
      const frac = new Fraction(Math.pow(numer, 2), Math.pow(denom, 2));
      if (random() < .5) {
        return {
          ans: new Fraction(numer - b * denom, denom * a).getAnswerArr(),
          str: `The larger root of \`(${a > 1 ? a : ""}x ${b > 0 ? "+" : "-"} ${Math.abs(b)})^2 = ${frac.formatted()}\` is`,
          ansStr: true
        }
      }
      return {
        ans: new Fraction (-numer - b * denom, denom * a).getAnswerArr(),
        str: `The smaller root of \`(${a > 1 ? a : ""}x ${b > 0 ? "+" : "-"} ${Math.abs(b)})^2 = ${frac.formatted()}\` is`,
        ansStr: true
      }
    }
  },
  fracest: {
    weight: 2,
    tier: 3,
    func: () => {
      const a = randomInt(100, 900);
      const b = randomInt(2, 15);
      let c = 0;
      do {
        c = randomInt(2, 15);
      } while (gcd(b, c) != 1);
      const d = randomInt(2, 15);
      let e = 0;
      do {
        e = randomInt(2, 15);
      } while (gcd(d, e) != 1);
      return {
        ans: a * c / b * d / e,
        str: `*\`${a} -: ${(b / c).toFixed(3)} xx ${new Fraction(d, e).formatted()} = \``,
        guess: true
      };
    
    }
  },
  systems: {
    weight: 2,
    tier: 1,
    func: () => {
      const x = randomInt(1, 5) * Math.sign(random() - 0.4);
      const y = randomInt(1, 5) * Math.sign(random() - 0.4);
      if (random() < .25) {
        return {
          ans: x * x + y * y,
          str: `If \`x + y = ${x + y}\` and \`x - y = ${x - y}\`, then \`x^2 + y^2 = \``,
        }
      }
      const a = randomInt(1, 4);
      const b = Math.max(randomInt(-3, 2), 1);
      const c = randomInt(1, 4);
      const d = Math.max(randomInt(-3, 2), 1);
      const str = `If \`${a > 1 ? a : ""}x + ${b > 1 ? b : ""}y = ${a * x + b * y}\` and \`${c > 1 ? c : ""}x - ${d > 1 ? d : ""}y = ${c * x - d * y}\`, then `;
      switch (randomInt(0, 1)) {
        case 0:
          return {
            ans: x,
            str: str + "\`x = \`",
          };
        default:
          return {
            ans: y,
            str: str + "\`y = \`",
          };
      }
    }
  },
  focus: {
    weight: 1,
    tier: 3,
    func: () => {
      const numer = Math.max(randomInt(-1, 4), 1) * Math.sign(random() - 0.5);
      const denom = numer == 1 ? randomInt(1, 4) : 1;
      const a = new Fraction(numer, denom);
      const h = randomInt(-5, 5);
      const k = randomInt(-5, 5);
      const ans = new Fraction(a.denominator + 4 * k * a.numerator, 4 * a.numerator).getAnswerArr();
      let str = "";
      switch (randomInt(0, 1)) {
        case 0:
          str = `Let \`(x, y)\` be the focus of \`y = ${numer == denom ? "" : numer == -denom ? "-" : a.formatted()}${h == 0 ? `x^2` : `(x ${h > 0 ? "-" : "+"} ${Math.abs(h)})^2`} ${k == 0 ? "" : `${k > 0 ? "+" : "-"} ${Math.abs(k)}`}\`. \`y = \``;
        case 1:
          str = `Let \`(x, y)\` be the focus of \`x = ${numer == denom ? "" : numer == -denom ? "-" : a.formatted()}${h == 0 ? `y^2` : `(y ${h > 0 ? "-" : "+"} ${Math.abs(h)})^2`} ${k == 0 ? "" : `${k > 0 ? "+" : "-"} ${Math.abs(k)}`}\`. \`x = \``;
      }
      return {
        ans: ans,
        str: str,
        ansStr: true
      }
    }
  },
  deriv: {
    weight: 1,
    tier: 3,
    func: () => {
      const a = randomInt(1, 5) * Math.sign(random() - 0.5);
      const b = randomInt(1, 5) * Math.sign(random() - 0.5);
      const c = randomInt(1, 5) * Math.sign(random() - 0.5);
      const x = randomInt(1, 5) * Math.sign(random() - 0.5);
      return {
        ans: 2 * a * x + b,
        str: `Let \`f(x) = ${(a < 0 ? "-" : "") + (Math.abs(a) > 1 ? Math.abs(a) : "")}x^2${(b < 0 ? "-" : "+") + (Math.abs(b) > 1 ? Math.abs(b) : "")}x${(c < 0 ? "-" : "+") + Math.abs(c)}\`. \`f^'(${x}) = \``
      }
    }
  },
  words: {
    weight: 1,
    tier: 0,
    func: () => {
      // hundred or ten millions, fifths of millions, thousands, tens and ones
      const a = randomInt(2, 9) * Math.pow(10, randomInt(1, 2));
      const fifths = randomInt(1, 4);
      const b = randomInt(1, 9);
      const ones = randomInt(20, 90);
      return {
        ans: a * 1000000 + fifths * 200000 + b * 1000 + ones,
        str: `Write ${a > 100 ? names[a / 100] + " hundred" : tens[a / 10]} million ${names[fifths]}-fifths million ${names[b]} thousand ${tens[Math.floor(ones / 10)]}${ones % 10 > 0 ? "-" + names[ones % 10] : ""} in digits`
      }
    }
  },
  estadd: {
    weight: 2,
    tier: 0,
    func: () => {
      const nums = Math.max(randomInt(1, 5), 3);
      const arr = [];
      for (let i = 0; i < nums; i++) {
        const n = Math.floor(randomInt(10000, 99999) / Math.pow(10, randomInt(0, 3))) * Math.sign(random() - 0.5);
        arr.push(n);
      }
      arr[0] = Math.abs(arr[0]);
      const ans = arr.reduce((a, b) => a + b, 0);
      let str = `*\`${arr[0]}`;
      for (const n of arr.slice(1)) {
        str += `${n > 0 ? " + " : " - "}${Math.abs(n)}`;
      }
      str += ` =\``;
      return {
        ans: ans,
        str: str,
        guess: true
      }
    }
  },
  estmult: {
    weight: 1,
    tier: 0,
    func: () => {
      const aDigits = randomInt(2, 4);
      const a = Math.floor(randomInt(1000, 9999) / Math.pow(10, 4 - aDigits));
      const b = Math.floor(randomInt(1000, 9999) / Math.pow(10, aDigits - 2));
      return {
        ans: a * b,
        str: `*\`${a} xx ${b} =\``,
        guess: true
      }
    },
  },
};

let keys = Object.keys(questionGens);
let tiers = [[], [], [], []];
for (const key of keys) {
  tiers[questionGens[key].tier].push(key);
}
let customWeight = {};
let mode = "";
let modeData = {};
let modeHandler = function (str) {
  const arr = [];
  const n = parseFloat(str);
  if (mode !== "") {
    const t = Date.now() - modeData.lastT;
    const extra = {time: t, question: modeData.question, response: str};
    if (modeData.question.ansStr) {
      if (typeof(modeData.question.ans) == "object" && modeData.question.ans.includes(str) || str == modeData.question.ans) {
        arr.push({
          type: "reply",
          data: `Correct! The answer is${modeData.question.ans}. You took ${t}ms.`,
          extra: extra
        });
        arr.push({ type: "status", tag: "answer", data: "" });
      }
      else return [{type: "status", tag: "wrong", data: `The answer is${modeData.question.ans}`, extra: extra}];
    }
    else if (!isNaN(n)) {
      if (
        modeData.question.guess &&
        Math.abs((n - modeData.question.ans) / modeData.question.ans) < 0.05
      ) {
        const diff =
          Math.abs((n - modeData.question.ans) / modeData.question.ans);
        const prefix =
          diff < 0.01 ?
            "🟦 Excellent guess!" :
            diff < 0.03 ?
              "🟩 Great guess!" :
              "🟨 Good guess!";
        arr.push({
          type: "reply",
          data: `${prefix} ${(diff * 100).toFixed(1)}% off. The answer is${Math.round(
            modeData.question.ans * 0.95,
          )}-${Math.round(modeData.question.ans * 1.05)}. You took ${t}ms.`,
          extra: extra
        });
        arr.push({ type: "status", tag: "answer", data: `${prefix} ${(diff * 100).toFixed(1)}% off. ${Math.round(
          modeData.question.ans - .05 * modeData.question.ans,
        )}-${Math.round(modeData.question.ans + .05 * modeData.question.ans)}` });
      }
      else if (n === modeData.question.ans) {
        arr.push({
          type: "reply",
          data: `Correct! The answer is${modeData.question.ans}. You took ${t}ms.`,
          extra: extra
        });
        arr.push({ type: "status", tag: "answer", data: "" });
      }
      else return [{type: "status", tag: "wrong", data: `The answer is${modeData.question.ans}`, extra: extra}];
    }
    else return arr;

    arr.push({ type: "status", tag: "answertime", data: t});
    arr.push(...advanceQuestion());
  }
  return arr;
};

function advanceQuestion() {
  const arr = [];
  modeData.total++;
  modeData.lastT = Date.now();
  const category = generateQuestion();
  arr.push({ type: "question", data: getQuestionText() });
  arr.push({ type: "status", tag: "questionCategory", data: category});
  return arr;
}

function generateQuestion(tier = -1) {
  let print = tier != -1;
  if (tier == -1 && !notTestMode()) {
    tier = Math.min(Math.floor(modeData.total / getTestLength() * 4), tiers.length - 1);
    print = false;
  }
  let question, key;
  if (mode === "zetamac") {
    const available = ["add", "sub", "mult", "div"].filter(key => keys.includes(key));
    if (available.length === 0)
      available.push(...["add", "sub", "mult", "div"]);
    let rand = randomInt(1, available.length);
    key = available[rand - 1];
    if (key === "add")
      question = questionGens.add.func(2, 100);
    else if (key === "sub")
      question = questionGens.sub.func(2, 100);
    else if (key === "mult")
      question = questionGens.mult.func(2, 12, 100);
    else
      question = questionGens.div.func(2, 100, 12);
  }
  else if (mode === "estimate") {
    const available = ["sqrt", "cbrt", "estmult", "estdiv", "fracest", "estadd"].filter(key => keys.includes(key));
    if (available.length === 0)
      available.push(...["sqrt", "cbrt", "estmult", "estdiv", "fracest", "estadd"]);
    let rand = randomInt(1, available.length);
    key = available[rand - 1];
    question = questionGens[key].func();
  }
  else if (tier != -1) {
    let totalWeight = 0;
    for (key of tiers[tier]) totalWeight += questionGens[key].weight;
    let rand = 0;
    do {
      rand = random() * totalWeight;
      for (key of tiers[tier]) {
        rand -= questionGens[key].weight;
        if (rand < 0) break;
      }
      const questionGen = questionGens[key];
      question = questionGen.func();
    } while (!print && (question.guess === true) != (Math.floor((modeData.total + 1) % (getTestLength() >= 40 ? 10 : 5)) == 0));
  }
  else {
    let totalWeight = 0;
    for (key of keys) totalWeight += questionGens[key].weight;
    let rand = random() * totalWeight;
    for (key of keys) {
      rand -= questionGens[key].weight;
      if (rand < 0) break;
    }
    const questionGen = questionGens[key];
    question = questionGen.func();
  }
  modeData.question = question;
  if (!useAsciiMath) {
    modeData.question.str = modeData.question.str.replace(/`/g, "");
    // also replace sqrt, cbrt
  }
  // console.log(modeData.question.ans);
  return key;
}

function getQuestionText() {
  return `Q${modeData.total + 1}: ${modeData.question.str}`;
}

let active = false;
function startMode(newMode, text) {
  if (!active) {
    mode = newMode;
    active = true;
    // const keyStr = text.includes(" ")
    //   ? text.substring(text.indexOf(" ") + 1).trim()
    //   : "";
    const keyStr = text.trim();
    if (keyStr.length == 0) {
      keys = Object.keys(questionGens);
    }
    else
      keys = keyStr.split(" ").filter(key => questionGens[key]);
    if (keys.length === 0)
      keys = Object.keys(questionGens);
    modeData = { total: 0, lastT: Date.now() };
    const category = generateQuestion();
    return [{ type: "status", tag: "start", data: "Starting monkey sense..." }, { type: "question", data: getQuestionText() }, { type: "status", tag: "questionCategory", data: category }];
  }
  return [{ type: "status", tag: "alreadyrunning", data: "Monkey Sense isalready running!" }];
}

function stopMode() {
  active = false;
  return [{ type: "status", tag: "stop", data: "Stopping math..." }];
}

let useChatCommands = false;

/**
 * Handle text to determine if the answer iscorrect
 * @returns array of objects with type ("status" | "question" | "reply"), data: string, and (tag?: string) if type="status"
 * type="reply" means that the answer iscorrect
 */
function onMessage(text) {
  if (useChatCommands && text.startsWith("!stop")) {
    return stopMode();
  }
  if (useChatCommands && text.startsWith("!ns")) {
    return startMode(text);
  }
  if (useChatCommands && text.startsWith("!question")) {
    return [{ type: "status", data: getQuestionText() }];
  }
  return modeHandler(text);
};
