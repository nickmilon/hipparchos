# Utilities for js numbers and big integers (BingInt) manipulation
## Description :
Library is named after [Hipparhos](https://en.wikipedia.org/wiki/Hipparchus) (or Hipparhus) an ancient Greek astronomer, geographer, and mathematician who is believed to be the inventor of firs analog computer [Antikythera mechanism ](https://en.wikipedia.org/wiki/Antikythera_mechanism) among other things.

- ### Why:
    bitwise operations are useful for many things as:
    - Flags/properties as Bit fields that can be mapped to enumeration types to conserve space in storage (databases etc)
    - Calculating stop bits parity bits 
    - Finite State Machines
    - Manipulating graphics etc. etc.

    Although js is not an efficient language for those type of things still there are use cases where it is handy to be able to have some bitwise functionality to js.  
    Support for BigInt in Node and browsers removed the 32 bit limit for bitwise operations of js, thus the need for a symmetrical utilities library that provides a common API for both native js numbers for efficiency and BigIntegers when a bigger than 31 bits resolution is needed.  
    Supported Functionality is limited to what js can do relatively efficiently for more complicated things better use a dedicated library written in C or any other compiled language.  
    
- ### Conventions:
    Library only supports ESM modules (imports) commonjs (require) is not supported, If you need commonjs support feel free to fork the library or transpile it somehow to commonjs.  
    Library provides an interface to two distinct utilities ``libBit32`` and ``libBitBI``.
    Both come with same (well almost) functionality and expose same methods and work on **UNSIGNED** integers  **ONLY** therefore **NEVER EVER** pass a negative number or BigInt as argument to any of the functions provided negative values can have side effects including infinite loops and memory leaks  
    For ``libBit32`` all arguments passed **should be** in the range of 0 up to ((2 ** 31) -1) (0x7FFFFFFF hex 2147483647 decimal)
    Same applies to all return values you can expect those to be in above range.
    For ``libBitBI`` arguments and returned results theoretically can be unsigned BigInt numbers of an size but practically (2 ** 1000) is a limit after which efficiency is questionable although operations here have been tested with (2 ** 1000000) big integers.  
    From what I have experienced in node/V8 BigInt bitwise operations are ~10x slower when compared to native 32 bit operations with comparable bit sizes (< 2n ^ 32n) and there after efficiency decays linearly in relation to number of bits.  
    ``v0 v1 v2`` refereed herewith are respectively the values ```0 1 2``` for ``libBit32`` and ```0n 1n 2n``` for ```libBitBI```
- ### Error/Type checking  
    For efficiency no type checks are performed and no errors are thrown for those. Don’t call any function with arguments outside of the ranges described above and you will be safe.  
    As the two libraries are mostly symmetrical/interchangeable you can do your own type checking and then call one or the other library as:
    ```js
        const utilsBit = (typeof value === 'bigint') ? libBitBI : libBit32 ;
        utilsBit.countBits1(value)
        ... ...
    ```
- ### Dependencies:
    No dependency whatsoever except for [jest](https://jestjs.io/) in case you want to run the tests in dev.
- ### Installation:  
    ```sh
    npm install hipparchos --save
    ```  
----------
## detailed [functionality list](etc/documentation.md) see also [code remarks](lib/hipparhos.js)
## summary of properties / methods exposed 
- ### constants
     - ``v0`` {0 or 0n} 0 value (mainly for private/internal use)
     - ``v0`` {1 or 1n} 1 value (mainly for private/internal use)
     - ``v2`` {2 or 2n} 2 value (mainly for private/internal use)
- ### Functions
    - #### Comparators
        those are provided so we have a unified approach with same functionality on both plain js numbers and Big Integers. Since we don't want to overload existing js operators those are functions. Also instead of returning ``false`` or ``true`` those return ``v0`` or ``v1`` so comparison results can be used in other bitwise operators
        - ``EQ(x,y)`` equal
        - ``NE(x,y)`` not equal
        - ``LT(x,y)`` less than
        - ``LE(x,y)`` less or equal
        - ``GT(x,y)`` greater than
        - ``GE(x,y)`` greater or equal
    - #### Reducer Functions and handy callbacks
        most reducers call the ``callback`` function with current value, callback should process the value and return the accumulated result. Also a proper initial value ``initVal``should be provided. Default callback / initVal provided just accumulate current value into an array which is returned at end of function 
        - ``reduceBits(val, callback = cbToArr, initVal = [])`` scans all bits (lsb first ) and calls back the ``callback`` with the value (0/1 0n/1n) of current bit)  
        - ``reducePwr2 = (val, callback = cbToArr, initVal = [])`` breaks down an integer to its power of 2 components. It is using my adaptation of Kernighan algorithm so complexity is O(logNumberOfSetBits)   
        *(to the best of my knowledge this is first time above algorithm is applied for functionality other than counting of set bits)*
        - ``cbToArr`` default call back that accumulates values to an array
        - ``cbToArrSpread`` call back that accumulates values to an array using spread operator (mutates the array)
        - ``cbToArrSpread`` call back that accumulates values to an array using spread 
        - ``cbValues`` accumulates power of 2 values to an array (``cbValues`` on ``reduceBits`` will give equivalent results as ``reducePwr2``)
        - ``arrAND(array 0f numbers)`` reduces an array by ``&`` its elements (no reducer needed)
        - ``arrOR`` reduces an array by ``|`` its elements (no reducer needed)
    - #### n-nth Bit manipulation
        - ``setBit1(v, n)`` sets bit ``n`` of ``value`` to 1
        - ``setBit0(v, n)`` sets bit ``n`` of ``value`` to 0
        - ``setBit0(v, n)`` sets bit ``n`` of ``value`` to 0
        - ``toggleBit(v, n)`` toggles(flips) bit ``n`` of ``value`` 
        - ``checkBit(v, n)`` checks bit ``n`` of ``value`` and returns ``v0`` or ``v1``
        - ``checkBitBool(v, n)`` checks bit ``n`` of ``value`` and returns ``false`` or ``true``
    - #### Other Functions
        - ``max(x,y)`` max value
        - ``min(x,y)`` min value
        - ``toNum(v)`` casts value to number or BigInt accordingly
        - ``isPwrOf2Bool(v)`` true if value is a power of 2 false otherwise
        - ``isPwrOf2(v)`` v1 if value is a power of 2 v0 otherwise
        - ``countBits1(v)`` counts bits set to 1 of ``value`` using Kernighan algorithm  complexity is O(logNumberOfSetBits)
        - ``lsb1Value(v)`` value (power of 2) of least significant bit 1
        - ``msb0(v)`` most significant bit 0
        - ``log2Int(v)`` log 2 (equals to msb set)
        - ``resToStr(v)`` auxiliary function casting to string any integer value or array of integer values (need this because `${bigInt}` drops 'n' )
        
    - #### Functions only applicable to BigInt (```libBitBI```)  
        useful for packing/unpacking a 64 bit unsigned Big Integer (max (2 ** 64)-1 ) to an Array of [Less Significant Byte, Most Significant Byte] so we can store a 64 bit (long as it is usually called) to two 32bit js numbers.
        - ```pack64(int64n)``` packs a 64bit BigInt in an array of two BigIntegers
        - ```unpack64(packedArrN)``` unpacks two 64bit BigInt to a single BigInt
        - ```pack64(int64n)``` packs a 64bit BigInt in an array of two BigIntegers
        - ```pack32(packedArr)``` packs two 32Bit number to an array of two 32Bit js Numbers
        - ```unpack32(packedArr)``` unpacks two 32Bit js number to to a single BigInt  
    - #### Usage/Examples
        ```js
        import { libBit32, libBitBI } from 'hipparchos';
        libBitBI.countBits1((2n ** 600n) -1n)
        or: 
        { countBits1 } = libBitBI 
            countBits1((2n ** 600n) -1n)
        ```

        |function                                                          |results                   |
        |------------------------------------------------------------------|--------------------------|
        |libBitBI.EQ( 1n, 3n)                                              |0n                        |
        |libBitBI.NE( 1n, 3n)                                              |1n                        |
        |libBitBI.LT( 1n, 1n)                                              |0n                        |
        |libBitBI.LE( 1n, 1n)                                              |1n                        |
        |libBitBI.GT( 1n, 1n)                                              |0n                        |
        |libBit32.GE( 1, 1)                                                |1                         |
        |libBitBI.arrAND([1n, 3n])                                         |1n                        |
        |libBitBI.arrOR([1n, 3n])                                          |3n                        |
        |libBitBI.toNum(true)                                              |1n                        |
        |libBit32.toNum(`123`)                                             |123                       |
        |libBitBI.max((2n** 60n), 1n)                                      |1152921504606846976n      |
        |libBitBI.min((2n** 60n), 1n)                                      |1n                        |
        |libBitBI.isPwrOf2Bool((2n ** 60n))                                |true                      |
        |libBitBI.isPwrOf2((2n ** 100000n))                                |1n                        |
        |libBitBI.isPwrOf2((2n ** 60n) -1n)                                |0n                        |
        |libBit32.isPwrOf2(8)                                              |1                         |
        |libBitBI.lsb1Value((2n ** 60n) -1n)                               |1n                        |
        |libBitBI.lsb1Value(BigInt(0b1001))                                |1n                        |
        |libBitBI.msb0(BigInt(0b10))                                       |1n                        |
        |libBitBI.log2Int(2n ** 30n)                                       |30n                       |
        |libBit32.log2Int(2 ** 30)                                         |30                        |
        |libBitBI.setBit1(2n, 0n)                                          |3n                        |
        |libBitBI.setBit0(3n,0n)                                           |2n                        |
        |libBitBI.toggleBit(3n, 0n)                                        |2n                        |
        |libBitBI.bitArrToDec([1n, 0n, 1n])                                |5n                        |
        |libBitBI.countBits1((2n ** 600n) -1n)                             |600n                      |
        |libBitBI.reduceBits(BigInt(0b1001))                               |[1n,0n,0n,1n]             |
        |libBitBI.reduceBits(BigInt(0b10010001), (ac, cv) => ac + cv, ``)  |10001001                  |
        |libBitBI.reducePwr2(BigInt(0b1001))                               |[1n,8n]                   |
        |libBit32.reducePwr2(0b111111110)                                  |[2,4,8,16,32,64,128,256]  |
        |libBit32.reduceBits(0b11111111110)                                |[0,1,1,1,1,1,1,1,1,1,1]   |
        |libBitBI.pack32(18446744073709551615n)                            |[4294967295,4294967295]   |
        |libBitBI.unpack32([4294967295,4294967295])                        |18446744073709551615n     |

        
## Testing
Almost full coverage tests are provided in __tests__ directory. To run the tests you will need to install [jest](https://jestjs.io/)

## Disclosure
Library has been used in production without issues for quite some time, still I suggest do your own testing before using it in production.  
Suggestions/pull requests are welcomed.  
## Resources and further reading :
- For a detailed description of algorithms used here see: [Bit Twiddling Hacks](https://graphics.stanford.edu/~seander/bithacks.html)
- For a description of BigInt implementation and features see 
    - [operations and browser compatibility](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
    - [BigInt in V8 ](https://v8.dev/features/bigint)
    - For a pure js Big Integer implementation see [jsbi library](https://github.com/GoogleChromeLabs/jsbi)
----------
 