import { Request, Response, NextFunction } from 'express';
import { serviceCatalogService } from '../services/serviceCatalogService';

export async function getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = req.query.category as string | undefined;
    const services = await serviceCatalogService.getAllServices(category);
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
}

export async function getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await serviceCatalogService.getServiceById(req.params.id);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

export async function getServiceRequirements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { interoperabilityService } = await import('../services/interoperabilityService.js');
    const requirements = await interoperabilityService.getServiceRequirements(req.params.id);
    res.status(200).json({
      success: true,
      data: requirements,
    });
  } catch (error) {
    next(error);
  }
}

