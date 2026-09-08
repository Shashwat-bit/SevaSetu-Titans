import { Request, Response, NextFunction } from 'express';
import { departmentService } from '../services/departmentService';

export async function getAllDepartments(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const departments = await departmentService.getAllDepartments();
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    next(error);
  }
}

export async function getDepartmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
}
