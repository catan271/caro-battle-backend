import { Request, Response } from 'express';

export const getAppInfo = async (req: Request, res: Response) => {
    return res.send({
        app: 'express-typescript-starter',
        author: 'Catan',
    });
};

export const getView = (req: Request, res: Response) => {
    return res.render('index');
};
