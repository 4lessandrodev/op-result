import assert from "node:assert";
import { Combine, Fail, Ok } from "../lib";

const resultA = Ok();
assert.ok(resultA.isOk(), 'Result Ok must be trully');
assert.ok(!resultA.isFail(), 'Result Fail must be falsy');
assert.equal(resultA.error(), null, 'Error must be null');
assert.equal(resultA.data(), null, 'Data must be null');

const resultB = Fail({ message: 'error message' });
assert.ok(resultB.isOk() === false, 'Result Ok must be falsy');
assert.ok(resultB.isFail(), 'Result Fail must be trully');
assert.deepEqual(resultB.error(), { message: 'error message' }, 'Error must has message');
assert.equal(resultB.data(), null, 'Data must be null');

const resultC = Ok({ hello: 'world' });
assert.equal(resultC.error(), null, 'Error must be null');
assert.deepEqual(resultC.data(), { hello: 'world' }, 'Data must object');

let times = 0;
const changeValue = () => times = times + 1;

const hookA = Ok();
hookA.on('OK').execute(changeValue);
assert.equal(times, 1, 'Hook must execute function');

const hookB = Ok();
hookB.on('FAIL').execute(changeValue);
assert.equal(times, 1, 'Hook must not execute function');

const resultsA = [ Ok(), Ok(), Ok() ];
const rsA = Combine(resultsA);
assert.ok(rsA.isOk(), 'Result Ok must be true');

const rsC = Combine([]);
assert.ok(rsC.isOk(), 'Result Ok must be true');

const resultsB = [ Ok(), Fail(), Ok() ];
const rsB = Combine(resultsB);
assert.ok(rsB.isFail(), 'Result Fail must be true');
