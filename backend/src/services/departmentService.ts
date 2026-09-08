import { Department, IDepartment } from '../models/Department';
import { AppError } from '../middleware/errorHandler';

export class DepartmentService {
  async getAllDepartments(): Promise<IDepartment[]> {
    return Department.find({ active: true });
  }

  async getDepartmentById(id: string): Promise<IDepartment> {
    const dept = await Department.findOne({ departmentId: id });
    if (!dept) {
      throw new AppError(`Department with ID ${id} not found`, 404);
    }
    return dept;
  }
}

export const departmentService = new DepartmentService();
