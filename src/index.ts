import express from 'express';
import bodyParser from 'body-parser';
import router from './router';
import serverless from 'serverless-http';

const app = express();
app.use(bodyParser.json());

app.use('/', router());

module.exports.handler = serverless(app);