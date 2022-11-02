import pino from 'pino';
export type LEVEL = 'info' | 'none' | 'debug';

const GetCalledFile = (): string => {
    try {
        throw new Error();
    } catch (error: any) {
        const stack = error.stack;
        return stack
    }
}

const infoFormat = {
    level: 'info',
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
}

const debugFormat = {
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    level: 'info',
    name: 'Result',
    prettifier: true,
}

interface ILogger {
    log: <Data>(data: Data, status: 'Ok' | 'Fail') => void;
}

class Logger implements ILogger {
    protected static instance: ILogger;
    protected readonly LOG_LEVEL: LEVEL;
    private readonly debug;
    private readonly logg;
    private constructor() {
        this.LOG_LEVEL = process.env.LOG_LEVEL as LEVEL ?? 'none';
        this.debug = pino(debugFormat);
        this.logg = pino(infoFormat)
    }

    public static init(): ILogger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return this.instance;
    }

    log<Data>(data: Data, status: 'Ok' | 'Fail') {
        if (status === 'Ok') {
            switch (this.LOG_LEVEL) {
                case 'info':
                    return this.logg.info(data, 'info mode');
                case 'debug':
                    const path = JSON.stringify(GetCalledFile()).split(' at ')[4];
                    this.debug.info({ data }, 'Path: ' + path);
                default: return 0;
            }
        }
        switch (this.LOG_LEVEL) {
            case 'info':
                return this.logg.error(data, 'info mode');
            case 'debug':
                const path = JSON.stringify(GetCalledFile()).split(' at ')[4];
                this.debug.error({ data }, 'Path: ' + path);
            default: return 0;
        }

    };
}

export interface Error {
    message: string;
}

type Option = 'OK' | 'FAIL';

type Hook = <Data = void>(opt: Option) => ({
    execute: (fn: Function) => Data | Promise<Data> 
});

export interface Payload<Data, Err = Error> {
    isOk:()=> boolean;
    isFail:()=> boolean;
    data:()=> Data | null;
    error:()=> Err | null;
    on: Hook;
}

abstract class State<Success, Err = Error> implements Payload<Success, Err> {
    constructor(private IsOk: boolean, private Data: Success, private Error: Err | null) {}

    public isOk(): boolean {
        return this.IsOk;
    }

    public isFail(): boolean {
        return !this.IsOk;
    }

    public data(): Success | null {
        return this.Data;
    }

    public error(): Err | null {
        return this.Error ?? null;
    }

    public on(opt: Option) {
        return {
            execute: (callback: Function) => {
                if(opt === 'FAIL' && !this.IsOk) return callback(this.Error);
                if(opt === 'OK' && this.IsOk) return callback(this.Data);
            }
        }
    };
}

export class Result<Success, Err = Error> extends State<Success, Err> {
    protected static LOGGER: ILogger = Logger.init();
    private constructor(isOk: boolean, data: Success, error: Err | null) {
        Result.LOGGER = Logger.init();
        super(isOk, data, error ?? null);
    }

    public static Ok(): Payload<void, void>;
    public static Ok<Success, Err = Error>(data: Success): Payload<Success, Err>;
    public static Ok<Success, Err = Error>(data?: Success): Payload<Success, Err> {
        const res = new Result<Success, Err>(true, data ?? null as Success, null as Err ) as Payload<Success, Err>;
        Result.LOGGER.log('Log: Ok - Data:' + JSON.stringify(res), 'Ok');
        return res;
    }

    public static Fail(): Payload<void, void>;
    public static Fail<Err = Error, Success = any>(err: Err): Payload<Success, Err>;
    public static Fail<Err = Error, Success = any>(err?: Error): Payload<Success, Err> {
        const res = new Result<Success, Err>(false, null as Success, err as Err) as Payload<Success, Err>;
        Result.LOGGER.log('Log: Fail - Error:' + JSON.stringify(res), 'Fail');
        return res;
    }

    public static Combine(results: Array<Payload<any>>): Payload<any, any> {
        if(results.length === 0) return Ok();
        let i = 0;
        while(results[i]) { 
            if(!results[i].isOk()) return results[i];
            i++;
        }
        return results.at(-1) as Payload<any>;
    }
}

export const { Ok, Fail, Combine } = Result;
export default Result;
