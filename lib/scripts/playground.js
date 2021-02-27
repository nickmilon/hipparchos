#!/usr/local/bin/node

/* eslint-disable no-param-reassign */
/* eslint-disable no-return-await */
/* eslint-disable no-console */
import { inspectIt } from './nodeOnly.js';
import { isFileNameTrimmedEqual } from '../Pythagoras.js.js.js';
import { utilsBit32, utilsBitBI } from '../hipparhos.js/index.js.js.js.js.js';

 
const getParms = (func) => {
  // const stripCommentsRx = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg; // doesn'r handle args with options
  const stripCommentsRx = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg;
  const argumentNamesRx = /([^\s,]+)/g;
  const fnStr = func.toString().replace(stripCommentsRx, '');
  const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(argumentNamesRx);
  return result || [];
};

const funcsRetrospect = (fnNamesArr, ns) => fnNamesArr.map((fn) => ((typeof ns[fn] === 'function') ? [fn, getParms(ns[fn])] : false)).filter((x) => x);
//
const funcsValid = () => {
  const commands = Object.keys(utilsBit32);
  let fns = funcsRetrospect(commands, utilsBit32);
  // fns = fns.filter((x) => x.length > 0);
  fns = fns.map(([fn, arg]) => [fn, arg.filter((a) => (!['callback', 'accumulator', 'currentValue'].includes(a)))]).filter((x) => x[1].length > 0);
  // fns = fns.map(([fn, arg]) => [fn, arg.filter((a) => (!['callback', 'accumulator', 'currentValue'].includes(a)))]);
  // fns = fns.map((fn) => { fn[1] = fn.filter((f) => (f[1] !== 'callback' && f[1] !== 'accumulator')); });
  // return fns.filter([f, a]) => { a.length > 0 } );
  return fns
};

const play = (fun, arg1, arg2) => {
  return true;
}

/** if running as script {@link https://stackoverflow.com/questions/45136831/node-js-require-main-module} */
if (isFileNameTrimmedEqual(process.argv[1], import.meta.url)) {
  const arg0Arr = ['enum31'];
  if (process.argv.length < 3) { console.info(`need  one of ${parm1} as parameter`); process.exit(0); }
  const args = process.argv.slice(2);
  inspectIt({ args: getParms(utilsBit32.reduceBits), funcsValid: funcsValid() }, console)
   
}

export {

};
