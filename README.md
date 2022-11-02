# op-result

A lib to encapsute operation result and manage logs.
## Logs

process.env.LOG_LEVEL = 'info' | 'debug' | 'none'

Case LOG_LEVEL is defined as info all Result state will print basic information on terminal

Case LOG_LEVEL is defined as debug all Result state will show result state and file name execution

---

## How it works?
First you need to have an operation like example below

```ts

import { Payload, Ok, Fail, Error } from 'op-result';

class MyOperation {

    // operation
    execute(value: number): Payload<string, Error> {

        // success result
        if(value % 2 === 0) return Ok('success');

        // failure result
        return Fail({ message: 'invalid value' });
    }
}

const myOp = new MyOperation();

const result = myOp.execute(10);

// ok state
console.log(result.isOk());

> true

// data state
console.log(result.data());

> "success"

// error state
console.log(result.error());

> null

```
--- 
## Hooks
Lets see an example to signup

```ts

import { Payload, Ok, Fail, Error } from 'op-result';

class SignUp {

    execute(data: Auth): Payload<User, Error> {
        
        // create user instance
        const user = User.create(data);

        // check user instance
        if(user.isFail()) return Fail({ message: 'oops' });

        // success state
        return Ok(user.data());

    }
}

const mailer = new Mailer();

const auth = new SignUp();

const result = auth.execute({ name, email, password });

// This will be executed only case result is Ok
// sendEmail function will receive Auth arg data
result.on('OK').execute(mailer.sendEmail);

// This will be executed only case result is Fail
// console.log function will receive error state
result.on('FAIL').execute(console.log);

```

---

## Combine
You can check many results state with combine

```ts

import { Ok, Fail, Combine } from 'op-result';

const resultsA = [ Ok(), Ok(), Ok() ];

// check many results 
const resA = Combine(resultsA);

const isOkA = resA.isOk();

console.log(isOkA);

> true


const resultsB = [ Ok(), Fail(), Ok() ];

// check many results 
const resB = Combine(resultsB);

const isOkB = resB.isOk();

console.log(isOkB);

> false

```
