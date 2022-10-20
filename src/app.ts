import express, { json, Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { getView } from './controllers/app.controller';
import { join } from 'path';
import { renderFile } from 'ejs';

config();

export const app: Express = express();
app.use(cors());
app.use(json());
app.use(express.static(join(__dirname, '../public')));
app.set('view engine', 'html');
app.set('views', join(__dirname, '../public'));
app.engine('html', renderFile);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('common'));
}

app.get('*', getView);
