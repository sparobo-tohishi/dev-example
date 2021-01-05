import * as Koa from 'koa';
import * as QueryString from 'querystring';
import { DoubleIncomingMessage, DoubleOutgoingMessage } from './double';

export interface LambdaEvent {
    httpMethod: string;
    path: string;
    headers: any;
    queryStringParameters: any;
    body: any;
}

export interface HttpResult {
    statusCode: number;
    headers: any;
    body: string;
}

export async function invoke(app: Koa, event: LambdaEvent): Promise<HttpResult> {
    const queryString = QueryString.stringify(event.queryStringParameters);
    const url = `http://localhost${event.path}?${queryString}`;
    const options = {
        method: event.httpMethod,
        url: url,
        headers: event.headers,
        body: event.body,
    };
    const req = new DoubleIncomingMessage(options);
    const res = new DoubleOutgoingMessage(req);
    const callback = app.callback();
    await callback(req as any, res as any); // XXX
    return {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: res.body,
    };
}
