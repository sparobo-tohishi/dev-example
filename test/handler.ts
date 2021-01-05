import { handler } from '../src/handler';

test('#handler', async () => {
    const event = {
        httpMethod: 'GET',
        path: '/',
        headers: {},
        queryStringParameters: {},
        body: {},
    };
    const expected = {
        statusCode: 200,
        headers: {
            'Content-Length': '19',
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({result: 'get ok'}),
    };
    expect(await handler(event, {})).toEqual(expected);
});
