import express, { json, Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { getAppInfo } from './controllers/app.controller';

config();

export const app: Express = express();
app.use(cors());
app.use(json());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('common'));
}

app.get('/', getAppInfo);
