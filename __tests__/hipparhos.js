/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-bitwise */
/* eslint-disable no-new */
/* eslint-disable no-return-assign */
/* eslint-disable no-undef */
/**
 * @jest-environment node
 */

// import { hipparhos } from '../index.js'; // import all to check imports
// import { testEnumBits } from '../lib/scripts/bitFields.js/index.js';
import { libBit32, libBitBI } from '../lib/hipparhos.js';

// const { libBit32, libBitBI } = hipparhos;
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * a Logger that supports common logger functions but does nothing
 * useful to switch between real logging in debug mode and no logging without match overhead
 * @usage DummyLogger.log(1); (don't instantiate it)
 */
const DummyLogger = {
  log: () => true,
  debug: () => true,
  info: () => true,
  warn: () => true,
  error: () => true,
  time: () => true,
  timeEnd: () => true,
  timeLog: () => true,
};

const logger = (__INSPECT__ === true) ? console : DummyLogger;
console.info('*** set __INSPECT__ var in package.json to true || false to view/hide test details ***');

const timeOps = (value, bitN, loops = 100) => {
  /** BigInt: ~ 10X slower than native 32bits while emulating 32 bits then increases linearly with value and bitsN */
  const [utilsBit, opsName] = (typeof value === 'bigint') ? [libBitBI, 'utilsBI'] : [libBit32, 'utils32'];
  logger.time(opsName);
  for (let cnt = 0; cnt <= loops; cnt += 1) {
    utilsBit.countBits1(value);
    utilsBit.checkBit(value, bitN);
    utilsBit.setBit0(value, bitN);
    utilsBit.setBit1(value, bitN);
    utilsBit.toggleBit(value, bitN);
  }
  logger.timeEnd(opsName);
};

const timeFun = (fn, loops = 100, opsName = 'timeFun') => {
  logger.time(opsName);
  for (let cnt = 0; cnt <= loops; cnt += 1) {
    fn();
  }
  logger.timeEnd(opsName);
};

const toString2lsb = (unsignedInt) => [...unsignedInt.toString(2)].reverse().join('');

describe('check Acropolis-nd bitwise operations', () => {
  beforeAll(async () => {

  });

  afterAll(async () => {

  });

  it('Hipparhos utilsBit benchmark', async () => {
    if (!__INSPECT__) { return; }
    let value = (2n ** 30n) - 1n;
    timeFun(() => libBitBI.countBits1(value), 1000, 'libBitBI.countBits1');
    value = (2 ** 30) - 1;
    timeFun(() => libBit32.countBits1(value, 0n, 1n), 1000, 'libBitBI.countBits1');
  });

  it('Hipparhos utilsBit randomized tests', async () => {
    const loops = __RND_LOOPS__;
    const tst = (value) => {
      // counts and reducers -----------------
      const [utilsBit, opsName] = (typeof value === 'bigint') ? [libBitBI, 'libBitBI'] : [libBit32, 'libBit32'];
      const orgValue = value;
      // logger.log('randomized test', { opsName, value });
      const str2 = value.toString(2);
      const str2BitCount = str2.length;
      const str2NumbersArr = str2.split('').map((x) => x | 0);
      const fn = utilsBit.cbToArr;
      const res = {
        str2,
        str2BitCount,
        countBits1: utilsBit.countBits1(value, fn, []),
        reducePwr2: utilsBit.reducePwr2(value, fn, []),
        reduceBits: utilsBit.reduceBits(value, fn, []),
      };
      // logger.log('randomized test', { opsName, value, res });
      expect(orgValue).toEqual(value); // check for side effects affecting value passed
      expect(utilsBit.bitArrToDec(res.reduceBits)).toEqual(value);
      expect(utilsBit.arrOR(res.reducePwr2)).toEqual(value);

      expect([...res.reduceBits].reverse().join('')).toEqual(str2);
      expect(res.reduceBits.join('')).toEqual(toString2lsb(value));
      expect(res.reducePwr2.length).toEqual(str2NumbersArr.filter((x) => x === 1).length);
      expect(res.reducePwr2.reduce((sum, x) => sum + x, utilsBit.v0)).toEqual(value);
      expect(BigInt(res.reducePwr2.length)).toEqual(BigInt(res.countBits1)); // cast both to bigInt anyway
    };

    [0, 0n, 1, 1n, (2 ** 31) - 1, (2n ** 31n) - 1n].forEach((num) => tst(num)); // check edge cases;
    //  random values test;
    for (let index = 1; index <= loops; index += 1) {
      // tst(randomBetween(0, (2 ** 31) - 1));
      const radix = BigInt(randomBetween(1, 1000)); //  2n ** 10000 is a reasonable limit
      const minus = BigInt(randomBetween(0, 100));
      const bi = libBitBI.max(0n, BigInt((2n ** radix) - minus)); // combinations of radix/minus can possibly result in negative numbers
      // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', { bi, radix, minus});
      // await sleepMs(10);
      tst(bi);
    }
  });

  it('Hipparhos libBit32', () => {
    let value;
    expect(libBit32.max(1, 100)).toEqual(100);
    expect(libBit32.min(1, 2 ** 31)).toEqual(1);
    expect(libBit32.EQ(1, 100)).toEqual(0);
    expect(libBit32.EQ(1, 1)).toEqual(1);
    expect(libBit32.LT(1, 100)).toEqual(1);
    expect(libBit32.LE(100, 100)).toEqual(1);
    expect(libBit32.GT(0, 1)).toEqual(0);
    expect(libBit32.GE(1, 1)).toEqual(1);
    expect(libBit32.GE(0, 1)).toEqual(0);
    expect(libBit32.isPwrOf2((2 ** 30))).toEqual(1);
    expect(libBit32.isPwrOf2Bool((2 ** 30))).toBe(true);
    expect(libBit32.isPwrOf2((2 ** 30) + 1)).toEqual(0);
    expect(libBit32.lsb1Value(2 ** 30)).toEqual(2 ** 30);
    expect(libBit32.lsb1Value(5)).toEqual(1);
    expect(libBit32.msb0(1)).toEqual(2);

    value = libBit32.setBit1(1, 1);
    expect(value).toEqual(3);
    expect(libBit32.checkBit(value, 0)).toEqual(1);
    expect(libBit32.checkBitBool(value, 1)).toBe(true);
    value = libBit32.setBit0(value, 1);
    expect(libBit32.checkBit(value, 1)).toEqual(0);
    expect(libBit32.checkBitBool(value, 1)).toBe(false);
    expect(libBit32.countBits1(2 ** 10)).toEqual(1); // because it is power of 2
    expect(libBit32.countBits1((2 ** 32) - 1)).toEqual(32); // max integer all bits must be set
    value = (2 ** 32) - 1;
    for (let index = 0; index <= 31; index += 1) {
      expect(libBit32.checkBit(value, index)).toEqual(1);
    }
  });

  it('Hipparhos libBitBI (bigInt)', async () => {
    let value;
    expect(libBitBI.max(1n, 2n ** 200n)).toEqual(2n ** 200n);
    expect(libBitBI.min(1n, 2n ** 32n)).toEqual(1n);
    expect(libBitBI.EQ(1n, 100n)).toEqual(0n);
    expect(libBitBI.EQ(1n, 1n)).toEqual(1n);
    expect(libBitBI.LT(1n, 100n)).toEqual(1n);
    expect(libBitBI.LE(1n, 100n)).toEqual(1n);
    expect(libBitBI.GT(0n, 1n)).toEqual(0n);
    expect(libBitBI.GE(0n, 1n)).toEqual(0n);
    expect(libBitBI.GE(1n, 1n)).toEqual(1n);
    expect(libBitBI.isPwrOf2((2n ** 30n))).toEqual(1n);
    expect(libBitBI.isPwrOf2((2n ** 30n) + 1n)).toEqual(0n);
    expect(libBitBI.isPwrOf2Bool((2n ** 30n) + 1n)).toBe(false);
    expect(libBitBI.lsb1Value(2n ** 30n)).toEqual(2n ** 30n);
    expect(libBitBI.lsb1Value(5n)).toEqual(1n);
    expect(libBitBI.msb0(1n)).toEqual(2n);

    value = libBitBI.setBit1(1n, 1n);
    expect(value).toEqual(3n);
    expect(libBitBI.checkBit(value, 1n)).toEqual(1n);
    expect(libBitBI.checkBitBool(value, 1n)).toBe(true);
    value = libBitBI.setBit0(value, 1n);
    expect(libBitBI.checkBit(value, 1n)).toEqual(0n);
    expect(libBitBI.checkBitBool(value, 1n)).toBe(false);
    expect(libBitBI.countBits1(2n ** 10n)).toEqual(1n); // because it is power of 2
    expect(libBitBI.countBits1((2n ** 32n) - 1n)).toEqual(32n); // max integer all bits must be set
    value = (2n ** 32n) - 1n;
    for (let index = 0n; index <= 31n; index += 1n) {
      expect(libBitBI.checkBit(value, index)).toEqual(1n);
    }
    for (let cnt = 1; cnt <= 100; cnt += 1) {
      value = BigInt(randomBetween(0, 10000));
      const valueStrArr = value.toString(2).split('').reverse().map((x) => x | 0); // reverse to bring lsb left, map | 0 to parse int
      const valueStrArrBitCountAll = valueStrArr.length;
      const checkBitN = BigInt(randomBetween(0, valueStrArrBitCountAll - 1)); // random bit to check
      const valueStr2Bits1 = BigInt(valueStrArr.filter((x) => x === 1).length);
      expect(libBitBI.countBits1(value)).toEqual(valueStr2Bits1);
      const bitVal = BigInt(valueStrArr[checkBitN]);
      expect(libBitBI.checkBit(value, checkBitN)).toEqual(bitVal);
    }
    // edge cases
    [0n, 1n, (2n ** 64n) - 1n, (2n ** 32n) - 1n, (2n ** 32n)].forEach((n) => {
      expect(libBitBI.unpack32(libBitBI.pack32(n))).toEqual(n);
    });
  });
});
