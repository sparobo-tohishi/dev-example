import { EventEmitter } from 'events';

export interface DoubleIncomingMessageOptions {
    method: string;
    url: string;
    headers: any;
    body: any;
}

export class DoubleIncomingMessage {
    aborted: boolean = false;
    httpVersion: string = 'HTTP/1.1';
    httpVersionMajor: number = 1;
    httpVersionMinor: number = 1;
    complete: boolean = false;
    /**
     * @type {Socket}
     * @deprecate Use `socket` instead.
     */
    connection: any = null;
    /** @type {Socket} */
    socket: any = null;
    headers: object = {}
    rawHeaders: string[] = [];
    trailers: NodeJS.Dict<string> = {};
    rawTrailers: string[] = [];
    /** * @type {string?} */
    method: string = '';
    /** * @type {string?} */
    url: string = '';
    /** * @type {number?} */
    statusCode: number = 200;
    /** * @type {string?} */
    statusMessage: string = '';

    /** @type {object?} XXX */
    body: object = {};

    constructor(options: DoubleIncomingMessageOptions) {
        this.method = options.method;
        this.url = options.url;
        this.headers = options.headers;
        this.body = options.body;
    }

    setTimeout(msecs: number, callback: () => void): this {
        console.debug('setTimeout', msecs, callback);
        return this;
    }

    destroy(error?: Error) {
        console.debug('destroy', error);
    }
}

export class DoubleOutgoingMessage extends EventEmitter {
    upgrading: boolean = false;
    chunkedEncoding: boolean = false;
    shouldKeepAlive: boolean = false;
    useChunkedEncodingByDefault: boolean = false;
    sendDate: boolean = false;
    /**
     * @deprecated Use `writableEnded` instead.
     */
    finished: boolean = false;
    headersSent: boolean = false;
    /**
     * @type {Socket?}
     * @deprecate Use `socket` instead.
     */
    connection?: any = null;
    /** @type {Socket?} */
    socket?: any = null;

    statusCode: number = 200;
    headers: any = {};
    body: any = {};

    constructor(req: DoubleIncomingMessage) {
        super();
    }

    setTimeout(msecs: number, callback: () => void): this {
        return this;
    }

    setHeader(name: string, value: number | string | ReadonlyArray<string>) {
        this.headers[name] = value;
    }

    getHeader(name: string): number | string | string[] | undefined {
        return this.headers[name];
    }

    /**
     * @returns {object} org: OutgoingHttpHeaders
     */
    getHeaders(): object {
        return Object.assign({}, this.headers);
    }

    getHeaderNames(): string[] {
        return Object.keys(this.headers);
    }

    hasHeader(name: string): boolean {
        return (name in this.headers);
    }

    removeHeader(name: string) {
        delete this.headers[name];
    }

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
