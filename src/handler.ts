import * as Router from 'koa-router';
import * as Koa from 'koa';
import * as QueryString from 'querystring';
import { DoubleIncomingMessage, DoubleOutgoingMessage } from './double';

const app = new Koa();
const router = new Router();

router.get('/', async ctx => {
    ctx.body = {sccess: 'get ok'};
});

router.post('/', async ctx => {
    ctx.body = {sccess: 'post ok'};
});

app.use(router.routes());
app.use(router.allowedMethods());

export async function handler(event: any, context: any) {
    const callback = app.callback();
    const queryString = QueryString.stringify(event.queryStringParameters);
    const url = `https://localhost${event.path}?${queryString}`;
    const options = {
        method: event.httpMethod,
        url: url,
        headers: event.headers,
        body: event.headers,
    };
    const req = new DoubleIncomingMessage(options);
    const res = new DoubleOutgoingMessage(req);
    await callback(req as any, res as any); // FIXME
    return {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: res.body,
    }
}

export { app }
