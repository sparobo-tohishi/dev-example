const Router = require('koa-router');
const Koa = require('koa');
const QueryString = require('querystring');
const { DoubleIncomingMessage, DoubleOutgoingMessage } = require('./double');

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

exports.handler = async (event, context) => {
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
    const ret = await callback(req, res);
    return {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: res.body,
    }
}

exports.app = app;
