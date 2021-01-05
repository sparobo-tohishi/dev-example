import * as Router from 'koa-router';
import * as Koa from 'koa';
import { invoke, LambdaEvent } from './bridge';

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

export async function handler(event: LambdaEvent, context: any) {
    return await invoke(app, event)
}

export { app }
