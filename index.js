"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Combine = exports.Fail = exports.Ok = exports.Result = void 0;
const pino_1 = require("pino");
const GetCalledFile = () => {
    try {
        throw new Error();
    }
    catch (error) {
        const stack = error.stack;
        return stack;
    }
};
const infoFormat = {
    level: 'info',
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
};
const debugFormat = {
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    level: 'info',
    name: 'Result',
    prettifier: true,
};
class Logger {
    constructor() {
        this.LOG_LEVEL = process.env.LOG_LEVEL ?? 'none';
        this.debug = (0, pino_1.default)(debugFormat);
        this.logg = (0, pino_1.default)(infoFormat);
    }
    static init() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return this.instance;
    }
    log(data, status) {
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
    }
    ;
}
class State {
    constructor(IsOk, Data, Error) {
        this.IsOk = IsOk;
        this.Data = Data;
        this.Error = Error;
    }
    isOk() {
        return this.IsOk;
    }
    isFail() {
        return !this.IsOk;
    }
    data() {
        return this.Data;
    }
    error() {
        return this.Error ?? null;
    }
    on(opt) {
        return {
            execute: (callback) => {
                if (opt === 'FAIL' && !this.IsOk)
                    return callback(this.Error);
                if (opt === 'OK' && this.IsOk)
                    return callback(this.Data);
            }
        };
    }
    ;
}
class Result extends State {
    constructor(isOk, data, error) {
        Result.LOGGER = Logger.init();
        super(isOk, data, error);
    }
    static Ok(data) {
        const res = new Result(true, data, null);
        Result.LOGGER.log('Log: Ok - Data:' + JSON.stringify(res), 'Ok');
        return res;
    }
    static Fail(err) {
        const res = new Result(false, null, err);
        Result.LOGGER.log('Log: Fail - Error:' + JSON.stringify(res), 'Fail');
        return res;
    }
    static Combine(results) {
        if (results.length === 0)
            return (0, exports.Ok)();
        let i = 0;
        while (results[i]) {
            if (!results[i].isOk())
                return results[i];
            i++;
        }
        return results.at(-1);
    }
}
exports.Result = Result;
Result.LOGGER = Logger.init();
exports.Ok = Result.Ok, exports.Fail = Result.Fail, exports.Combine = Result.Combine;
exports.default = Result;
//# sourceMappingURL=index.js.map