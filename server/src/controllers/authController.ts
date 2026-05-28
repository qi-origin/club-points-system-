import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export async function studentLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, studentNo } = req.body;
    if (!name || !studentNo) {
      res.status(400).json({ error: '请输入姓名和学号' });
      return;
    }
    const result = await authService.studentLogin(name, studentNo);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: '请输入用户名和密码' });
      return;
    }
    const result = await authService.adminLogin(username, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
