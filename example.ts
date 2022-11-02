import { Ok, Fail, Combine, Payload, Error } from "./lib";


// --------- OPeration never throws -----------

class CaseA {
    execute(){
        const user = { name: 'Ale', age: 27 };
        return Ok(user);
    }
}

class CaseB {
    execute(){
        const error = { message: 'something went wrong' };
        return Fail(error);
    }
}

const a = new CaseA();
const b = new CaseB();

const resA = a.execute();
const resB = b.execute();

resA.on('OK').execute(console.log)

// --------- OPeration possible throws -----------

class AcessDataBase {
    operationErr(){
        throw new Error('Oops error');
    }

    operationOk(){
        return 'Ok';
    }
}

class CaseC {
    constructor(private readonly dataOp: AcessDataBase){}
    execute(): Payload<string, Error> {
        // out try
        a.execute();
        b.execute();

        try {
            // in try
            const res = this.dataOp.operationErr();
            return Ok('res');
        } catch (error: any) {
            return Fail({ message: error.message });
        }
    }
}

class CaseD {
    constructor(private readonly dataOp: AcessDataBase){}
    execute(){
        // out try
        a.execute();
        b.execute();

        try {
            // in try
            const res = this.dataOp.operationOk();
            return Ok(res);
        } catch (error: any) {
            return Fail({ message: error.message });
        }
    }
}

const db = new AcessDataBase();

const c = new CaseC(db);
const d = new CaseD(db);

const resC = c.execute();
const resD = d.execute();
const comb = Combine([ resA, resB, resC ]);

console.log({ UseCaseA: resA.isOk(), UseCaseB: resB.isOk() });
console.log({ UseCaseC: resC.isOk(), UseCaseD: resD.isOk() });
console.log(comb);
