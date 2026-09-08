import { Service, IService } from '../models/Service';
import { AppError } from '../middleware/errorHandler';

export class ServiceCatalogService {
  async getAllServices(category?: string): Promise<IService[]> {
    const filter: Record<string, any> = { active: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    return Service.find(filter);
  }

  async getServiceById(id: string): Promise<IService> {
    const service = await Service.findOne({ serviceId: id });
    if (!service) {
      throw new AppError(`Service with ID ${id} not found`, 404);
    }
    return service;
  }
}

export const serviceCatalogService = new ServiceCatalogService();
