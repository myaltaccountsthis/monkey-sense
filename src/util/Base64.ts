const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const DIGITS = 8;

const Base64 = {
  encode: (value: number) => {
    if (typeof(value) !== 'number') {
      throw 'Value is not number!';
    }
    var result = '', mod;
    for (let i = 0; i < DIGITS; i++) {
      mod = value % 64;
      result = ALPHA.charAt(mod) + result;
      value = Math.floor(value / 64);
    }
    return result;
  },
  decode: (value: string) => {
    var result = 0;
    for (var i = 0, len = value.length; i < len; i++) {
      result *= 64;
      result += ALPHA.indexOf(value[i]);
    }
    return result;
  }
};

export default Base64;
export const randomSeed = () => Base64.encode(Math.floor(Math.random() * 2 ** (DIGITS * 6)));