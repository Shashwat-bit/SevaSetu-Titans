import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Resource not found on endpoint: ${req.originalUrl}`, 404));
}
