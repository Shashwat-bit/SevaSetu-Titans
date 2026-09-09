import { Response, NextFunction } from 'express';
import { documentService } from '../services/documentService';
import { Application } from '../models/Application';
import { CitizenDocument } from '../models/Document';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

export async function getDocuments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    if (req.user.role === 'citizen') {
      const documents = await documentService.getDocuments(req.user.citizenId);
      res.status(200).json({ success: true, count: documents.length, data: documents });
      return;
    }

    if (req.user.role === 'officer') {
      // Data Minimization: Officer sees ONLY documents explicitly attached to applications in their department
      const deptApps = await Application.find({ departmentId: req.user.departmentId });
      const attachedDocIds = new Set<string>();
      deptApps.forEach((app) => {
        (app.documentsAttached || []).forEach((d) => {
          if (d.docId) attachedDocIds.add(d.docId);
        });
      });
      const documents = await CitizenDocument.find({ documentId: { $in: Array.from(attachedDocIds) } });
      res.status(200).json({ success: true, count: documents.length, data: documents });
      return;
    }

    // Admin sees all documents
    const documents = await CitizenDocument.find();
    res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    next(error);
  }
}

export async function syncDocuments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const documents = await documentService.syncWithDigiLockerMock(req.user.citizenId);
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

export async function verifyDocument(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const verification = await documentService.verifyDocument(req.params.id, req.user);
    res.status(200).json({ success: true, data: verification });
  } catch (error) {
    next(error);
  }
}
