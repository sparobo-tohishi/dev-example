import { EventEmitter } from 'events';

export class DoubleIncomingMessage {
    /** @type {boolean} */
    aborted: boolean = false;
    /** @type {string} */
    httpVersion: string = 'HTTP/1.1';
    /** @type {number} */
    httpVersionMajor: number = 1;
    /** @type {number} */
    httpVersionMinor: number = 1;
    /** @type {boolean} */
    complete: boolean = false;
    /**
     * @type {Socket}
     * @deprecate Use `socket` instead.
     */
    connection: any = null;
    /** @type {Socket} */
    socket: any = null;
    /** @type {Object} */
    headers: any = {}
    /** @type {string[]} */
    rawHeaders: string[] = [];
    /** 
     * org: NodeJS.Dict<string>
     * @type {Object} 
    */
    trailers: NodeJS.Dict<string> = {};
    /** @type {string[]} */
    rawTrailers: string[] = [];
    /** 
     * Only valid for request obtained from http.Server.
     * @type {string?}
     */
    method: string = '';
    /**
     * Only valid for request obtained from http.Server.
     * @type {string?}
     */
    url: string = '';
    /** 
     * Only valid for response obtained from http.ClientRequest.
     * @type {number?}
     */
    statusCode: number = 200;
    /** 
     * Only valid for response obtained from http.ClientRequest.
     * @type {string?}
     */
    statusMessage: string = '';

    /** @type {Object?} XXX */
    body: any = {};

    /**
     * @param {Object} options
     */
    constructor(options: any) {
        this.headers = options.headers;
        this.method = options.method;
        this.url = options.url;
        this.statusCode = options.statusCode;
        this.body = options.body;
    }

    /**
     * @param {number} msecs
     * @param {() => void} callback
     * @returns {DoubleIncomingMessage}
     */
    setTimeout(msecs: number, callback: () => void): this {
        console.debug('setTimeout', msecs, callback);
        return this;
    }

    /**
     * @param {Error?} error
     */
    destroy(error?: Error) {
        console.debug('destroy', error);
    }
}

export class DoubleOutgoingMessage extends EventEmitter {
    /** @type {boolean} */
    upgrading: boolean = false;
    /** @type {boolean} */
    chunkedEncoding: boolean = false;
    /** @type {boolean} */
    shouldKeepAlive: boolean = false;
    /** @type {boolean} */
    useChunkedEncodingByDefault: boolean = false;
    /** @type {boolean} */
    sendDate: boolean = false;
    /**
     * @type {boolean}
     * @deprecated Use `writableEnded` instead.
     */
    finished: boolean = false;
    /** @type {boolean} */
    headersSent: boolean = false;
    /**
     * @type {Socket?}
     * @deprecate Use `socket` instead.
     */
    connection?: any = null;
    /** @type {Socket?} */
    socket?: any = null;

    /** @type {number} XXX */
    statusCode: number = 200;
    /** @type {Object} XXX */
    headers: any = {};
    /** @type {any} XXX */
    body: any = {};

    /**
     * @param {DoubleIncomingMessage} req
     */
    constructor(req: DoubleIncomingMessage) {
        super();
    }

    /**
     * @param {number} msecs
     * @param {undefined | (() => void)} callback
     * @return {DoubleOutgoingMessage}
     */
    setTimeout(msecs: number, callback: () => void): this {
        return this;
    }

    /**
     * @param {string} name
     * @param {number | string | ReadonlyArray<string>} value
     */
    setHeader(name: string, value: number | string | ReadonlyArray<string>) {
        this.headers[name] = value;
    }

    /**
     * @param {string} name
     * @returns {number | string | string[] | undefined}
     */
    getHeader(name: string): number | string | string[] | undefined {
        return this.headers[name];
    }

    /**
     * @returns {Object} org: OutgoingHttpHeaders
     */
    getHeaders(): any {
        return Object.assign({}, this.headers);
    }

    /**
     * @returns {string[]}
     */
    getHeaderNames(): string[] {
        return Object.keys(this.headers);
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    hasHeader(name: string): boolean {
        return (name in this.headers);
    }

    /**
     * @param {string} name
     */
    removeHeader(name: string) {
        delete this.headers[name];
    }

    /**
     * @param {Object | ReadonlyArray<[string, string]>} headers
     */
    addTrailers(headers: Object | ReadonlyArray<[string, string]>) {}

    flushHeaders() {}

    /**
     * XXX
     * @param {any} result
     */
    end(result: any) {
        this.body = result; // FIXME
    }
}
