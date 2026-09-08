import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/documentService';

export async function getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const citizenId = (req.query.citizenId as string) || 'cit-001';
    const documents = await documentService.getDocuments(citizenId);
    res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    next(error);
  }
}

export async function syncDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const citizenId = (req.body.citizenId as string) || 'cit-001';
    const documents = await documentService.syncWithDigiLockerMock(citizenId);
    res.status(200).json({
      success: true,
      message: 'DigiLocker credentials synchronized from mock source',
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const verification = await documentService.verifyDocument(req.params.id);
    res.status(200).json({ success: true, data: verification });
  } catch (error) {
    next(error);
  }
}
