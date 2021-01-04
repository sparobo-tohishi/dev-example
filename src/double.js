const { EventEmitter } = require('events');

// @ts-check

class DoubleIncomingMessage {
    /**
     * @param {Object} options
     */
    constructor(options) {
        /** @type {boolean} */
        this.aborted = false;
        /** @type {string} */
        this.httpVersion = 'HTTP/1.1';
        /** @type {number} */
        this.httpVersionMajor = 1;
        /** @type {number} */
        this.httpVersionMinor = 1;
        /** @type {boolean} */
        this.complete = false;
        /**
         * @type {Socket}
         * @deprecate Use `socket` instead.
         */
        this.connection = null;
        /** @type {Socket} */
        this.socket = null;
        /** @type {Object} */
        this.headers = options.headers;
        /** @type {string[]} */
        this.rawHeaders = [];
        /** 
         * org: NodeJS.Dict<string>
         * @type {Object} 
        */
        this.trailers = {};
        /** @type {string[]} */
        this.rawTrailers = [];
        /** 
         * Only valid for request obtained from http.Server.
         * @type {string?}
         */
        this.method = options.method;
        /**
         * Only valid for request obtained from http.Server.
         * @type {string?}
         */
        this.url = options.url;
        /** 
         * Only valid for response obtained from http.ClientRequest.
         * @type {number?}
         */
        this.statusCode = options.statusCode;
        /** 
         * Only valid for response obtained from http.ClientRequest.
         * @type {string?}
         */
        this.statusMessagex = options.statusMessagex;

        /** @type {Object?} XXX */
        this.body = options.body;
        /** @type {string?} XXX */
        this.rawBody = '';
    }

    /**
     * @param {number} msecs
     * @param {() => void} callback
     * @returns {DoubleIncomingMessage}
     */
    setTimeout(msecs, callback) {
        console.debug('setTimeout', msecs, callback);
        return this;
    }

    /**
     * @param {Error?} error
     */
    destroy(error) {
        console.debug('destroy', error);
    }
}

class DoubleOutgoingMessage extends EventEmitter {
    /**
     * @param {DoubleIncomingMessage} req
     */
    constructor(req) {
        super();

        /** @type {boolean} */
        this.upgrading = false;
        /** @type {boolean} */
        this.chunkedEncoding = false;
        /** @type {boolean} */
        this.shouldKeepAlive = false;
        /** @type {boolean} */
        this.useChunkedEncodingByDefault = false;
        /** @type {boolean} */
        this.sendDate = false;
        /**
         * @type {boolean}
         * @deprecated Use `writableEnded` instead.
         */
        this.finished = false;
        /** @type {boolean} */
        this.headersSent = false;
        /**
         * @type {Socket?}
         * @deprecate Use `socket` instead.
         */
        this.connection = null;
        /** @type {Socket?} */
        this.socket = null;

        /** @type {Object} XXX */
        this.headers = {};
        /** @type {any} XXX */
        this.body = {};
    }

    /**
     * @param {number} msecs
     * @param {undefined | (() => void)} callback
     * @return {DoubleOutgoingMessage}
     */
    setTimeout(msecs, callback) {
        return this;
    }

    /**
     * @param {string} name
     * @param {number | string | ReadonlyArray<string>} value
     */
    setHeader(name, value) {
        this.headers[name] = value;
    }

    /**
     * @param {string} name
     * @returns {number | string | string[] | undefined}
     */
    getHeader(name) {
        return this.headers[name];
    }

    /**
     * @returns {Object} org: OutgoingHttpHeaders
     */
    getHeaders() {
        return Object.assign({}, this.headers);
    }

    /**
     * @returns {string[]}
     */
    getHeaderNames() {
        return Object.keys(this.headers);
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    hasHeader(name) {
        return (name in this.headers);
    }

    /**
     * @param {string} name
     */
    removeHeader(name) {
        delete this.headers[name];
    }

    /**
     * @param {Object | ReadonlyArray<[string, string]>} headers
     */
    addTrailers(headers) {}

    flushHeaders() {}

    /**
     * XXX
     * @param {any} result
     */
    end(result) {
        this.body = result; // FIXME
    }
}

module.exports = {
    DoubleIncomingMessage,
    DoubleOutgoingMessage,
};
