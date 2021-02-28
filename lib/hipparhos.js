/* eslint-disable no-nested-ternary */
/* eslint-disable no-cond-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */

/**
 * @module hipparhos
 * @fileoverview
 * @exports {libBit32, libBitBI}
 */

/**
 * An unsigned 32bit integer (maximum value = (2 ** 32) -1) for 31 bits actual resolution
 * @typedef {Number} Int32
 */

/**
 * An unsigned 32bit integer (maximum value = (2 ** 32) -1) or A BigInt
 * @typedef {Number} Int32OrBigInt
 */

/**
 *
 * @typedef {Object} libBit32
 * @property {0 | 0n} v0    - value or 0 corresponding to library
 * @property {1 | 1n} v1    - value or 1 corresponding to library (mostly used internally)
 * @property {function} EQ  - checks (x,y) and returns 0 if equal or 0 otherwise
 * @function NE -
 */

// new BigInt64Array(4);

const utilsBit = (bigInt = true) => {
  const [v0, v1, v2, EQ, NE, LT, LE, GT, GE] = (bigInt === true) /** ugly but efficient */
    ? [
      0n,
      1n,
      2n,
      (x, y) => BigInt(x === y),    /** EQ equal @param {BigInt} x value @param {BigInt} y value  @return {0n | 1n} */
      (x, y) => BigInt(x !== y),    /** NE not equal, @return {0n | 1n} */
      (x, y) => BigInt(x < y),      /** LT less than, @return {0n | 1n} */
      (x, y) => BigInt(x <= y),     /** LE less or equal, @return {0n | 1n} */
      (x, y) => BigInt(x > y),      /** GT greater than, @return {0n | 1n} */
      (x, y) => BigInt(x >= y),     /** GE greater or equal, @return {0n | 1n} */
    ]
    : [
      0,
      1,
      2,
      (x, y) => (x === y) & 1,      /** EQ equal, @param {Number} x value @param {Number} y value @return {0 | 1} */
      (x, y) => (x !== y) & 1,      /** NE not equal, @return {0 | 1} */
      (x, y) => (x < y) & 1,        /** LT less than, @return {0 | 1} */
      (x, y) => (x <= y) & 1,       /** LE less or Equal, @return {0 | 1} */
      (x, y) => (x > y) & 1,        /** GT greater than, @return {0 | 1} */
      (x, y) => (x >= y) & 1,       /** GT greater or equal, @return {0 | 1} */
    ];

  /**
   * an auxillaru function to cast int32 and BigInt or Arrays to String as `${1n}` ignores charachter 'n'
   * @param { Int32 | BigInt | Array } v to cast 
   * @return {String } value cast to string
   */
  const resToStr = (v) => ((typeof v === 'bigint') ? `${v}n` : (Array.isArray(v)) ? v.map((x) => resToStr(x)) : `${v}`);

  /**
   * @param {Array.<Int32 |BigInt>} intArr array of integers to be OR-ed together
   * @return {Int32|BigInt} OR result
   * @example arrOR([2,4]) > 6
   */
  const arrOR = (intArr) => intArr.reduce((accumulator, currentValue) => accumulator | currentValue, v0);

  /**
   * @param {Array.<Int32 | BigInt>}  intArr array of integers to be AND-ed together
   * @return {Int32|BigInt} OR result
   * @example arrOR([6,2]) >> 2
   */
  const arrAND = (intArr) => intArr.reduce((accumulator, currentValue) => accumulator & currentValue, intArr[0] | v0);

  /**
   * checks if value is a power of 2
   * Brian Kernighan algorithm as it works with BigInt too, complexity is O(logNumberOfSetBits)
   * @param {Int | BigInt} v value to check
   * @return {Int|BigInt} v1 if value is power of 2 v0 otherwise
   */
  const isPwrOf2Bool = (v) => v && !(v & (v - v1));

  /**
   * counts bits set to 1 (Kernighan algorithm complexity is O(logNumberOfSetBits))
   * @param {Int32 | BigInt} v value
   * @return {Int32 | BigInt} number of bits set to One
   */
  const countBits1 = (v) => {
    let count = 0;
    for (count; v; count += 1) { v &= v - v1; }
    return count;
  };

  /**
   * a callback to accumulate values to an array (Non mutative)
   * @param {any} accumulator variable
   * @param {any} currentValue variable
   * @return {any} callback's result
   */
  const cbToArr = (accumulator, currentValue) => { accumulator.push(currentValue); return accumulator; };

  /**
   * a callback to accumulate values to an array (mutative)
   * @param {any} accumulator variable
   * @param {any} currentValue variable
   * @return {any} callback's result
   */
  const cbToArrSpread = (accumulator, currentValue) => [...accumulator, currentValue]; // to Array callback Non mutative

  /**
   * a callback that uses current mask
   * for example used as callback on reduceBits will give equivalent results as reducePwr2
   * @param {any} accumulator variable
   * @param {any} bit current bit
   * @param {any} mask current mask
   * @return {any} callback's result
   */
  const cbValues = (accumulator, bit, mask) => { if (bit) { accumulator.push(bit * mask); } return accumulator; };

  /**
   * reduce bits
   * (LSB first little endian )
   * mask < val is always true for bigInt and int32 <= (2 ** 31). Will short-circuit on first && not impacting performance.
   * mask > 0 special case for last bit of int32 as 1 << 31 = -2147483648;
   * that's how we exit loop
   * @param {number|BigInt} v number
   * @param {function} [callback=(v) => v] a callback
   * @param {any} initVal an initial val
   * @return {any} reduced function results;
   * @mote on while loop exit strategy:
   */
  const reduceBits = (v, callback = cbToArr, initVal = []) => {
    let mask = v1;
    do {
      initVal = callback(initVal, NE(mask & v, v0), mask);
      mask <<= v1;
    } while ((mask <= v) && (mask >= v0));
    return initVal;
  };

  /**
   * breaks down an integer to its power of 2 components
   * it is using my adaptation of Kernighan algorithm complexity is O(logNumberOfSetBits)
   * (to the best my knowledge it is first time this algorithm is applied for functionality other than counting of set bits )
   * @param {Int32|BigInt} v to break down
   * @param {Function} [callback=cbToArr] a callback
   * @param {any} [initVal=[]] initial value of the call back
   * @return {any} results of iterating threw the callback
   */
  const reducePwr2 = (v, callback = cbToArr, initVal = []) => { //  expanding on Kernighan algorithm
    while (v) {
      const vNext = v & (v - v1);
      initVal = callback(initVal, v - vNext);
      v = vNext;
    }
    return initVal;
  };

  const utils = {
    resToStr,
    v0,
    v1,
    v2,
    EQ,
    NE,
    LT,
    LE,
    GT,
    GE,
    arrAND,
    arrOR,
    toNum: (v) => v | 0, // casts value to number or BigInt accordingly
    max: (x, y) => (x ^ ((x ^ y) & -LT(x, y))),
    min: (x, y) => (y ^ ((x ^ y) & -LT(x, y))),
    isPwrOf2Bool,
    isPwrOf2: (v) => isPwrOf2Bool(v) & v1,
    lsb1Value: (v) => v & -v,
    msb0: (v) => ~v & (v + v1),
    log2Int: (v) => ~~Math.log2(v),
    setBit1: (v, n) => v | (v1 << n),
    setBit0: (v, n) => v & ~(v1 << n),
    toggleBit: (v, n) => v ^ (v1 << n),

    bitArrToDec: (bitArr) => bitArr.map((v, i) => v * (2 ** i)).reduce((a, b) => a + b, 0),
    checkBit: (v, n) => NE((v & (v1 << n)), v0) & v1,
    checkBitBool: (v, n) => ((v & (v1 << n))) !== v0,
    cbToArr,
    cbToArrSpread,
    cbValues,
    countBits1,
    reduceBits,
    reducePwr2,
  };
  if (bigInt === false) { return utils; }
  const pack64 = (int64n) => [int64n & 0xFFFFFFFFn, (int64n & (0xFFFFFFFFn << 32n)) >> 32n]; // max value =  (2n ** 64n) - 1n
  const unpack64 = (packedArrN) => packedArrN[0] | (packedArrN[1] << 32n);
  const pack32 = (int64n) => pack64(int64n).map((i) => parseInt(i, 10)); // max value =  (2n ** 64n) - 1n
  const unpack32 = (packedArr) => unpack64(packedArr.map((i) => BigInt(i)));
  const log2Int = (v) => {
    let r = v0;
    while (v >>= v1) { r += v1; }
    return r;
  };
  return {
    ...utils,
    ...{
      isPwrOf2: (v) => BigInt(isPwrOf2Bool(v)) & v1,
      countBits1: (v) => BigInt(countBits1(v)), // overriding countBits1 to return BigInt that is using int32 for count for efficiency
      bitArrToDec: (bitArr) => bitArr.map((v, i) => v * (2n ** BigInt(i))).reduce((a, b) => a + b, 0n),
      toNum: (v) => BigInt(v), // casts value to number or BigInt accordingly
      log2Int,
      pack64,
      unpack64,
      pack32,
      unpack32,
    },
  };
};

const libBit32 = utilsBit(false);
const libBitBI = utilsBit(true);

export {
  libBit32,
  libBitBI,
};
