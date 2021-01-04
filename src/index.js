const { handler } = require('./handler');
const [ , , method, path ] = process.argv;
const event = {
    httpMethod: method.toUpperCase(),
    path: path,
    headers: {},
    queryStringParameters: {},
    body: {},
};

handler(event, {}).then(result => {
    console.log(result);
});
