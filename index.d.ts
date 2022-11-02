export declare type LEVEL = 'info' | 'none' | 'debug';
interface ILogger {
    log: <Data>(data: Data, status: 'Ok' | 'Fail') => void;
}
export interface Error {
    message: string;
}
declare type Option = 'OK' | 'FAIL';
declare type Hook = <Data = void>(opt: Option) => ({
    execute: (fn: Function) => Data | Promise<Data>;
});
export interface Payload<Data, Err = Error> {
    isOk: () => boolean;
    isFail: () => boolean;
    data: () => Data | null;
    error: () => Err | null;
    on: Hook;
}
declare abstract class State<Success, Err = Error> implements Payload<Success, Err> {
    private IsOk;
    private Data;
    private Error;
    constructor(IsOk: boolean, Data: Success, Error: Err | null);
    isOk(): boolean;
    isFail(): boolean;
    data(): Success | null;
    error(): Err | null;
    on(opt: Option): {
        execute: (callback: Function) => any;
    };
}
export declare class Result<Success, Err = Error> extends State<Success, Err> {
    protected static LOGGER: ILogger;
    private constructor();
    static Ok(): Payload<void, void>;
    static Ok<Success, Err = Error>(data: Success): Payload<Success, Err>;
    static Fail(): Payload<void, void>;
    static Fail<Err = Error, Success = any>(err: Err): Payload<Success, Err>;
    static Combine(results: Array<Payload<any>>): Payload<any, any>;
}
export declare const Ok: typeof Result.Ok, Fail: typeof Result.Fail, Combine: typeof Result.Combine;
export default Result;
//# sourceMappingURL=index.d.ts.map