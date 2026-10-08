import { Request, Response } from 'express';
import { optionsService } from './options.service';
import { BrokerOptionGroup } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

export class OptionsController {
  /**
   * Public: GET /api/options?group=REGULATOR,LANGUAGE,...
   */
  async getOptions(req: Request, res: Response) {
    let groups: BrokerOptionGroup[] | undefined;
    if (req.query.group) {
      const rawGroups = String(req.query.group).split(',').map((g) => g.trim().toUpperCase());
      const validEnumValues = Object.values(BrokerOptionGroup) as string[];
      groups = rawGroups.filter((g) => validEnumValues.includes(g)) as BrokerOptionGroup[];
    }

    const data = await optionsService.getOptions(groups);
    const etag = optionsService.generateETag(data);

    if (req.headers['if-none-match'] === etag) {
      return res.status(StatusCodes.NOT_MODIFIED).end();
    }

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  }

  /**
   * Admin: GET /api/admin/broker-options
   */
  async getAdminOptions(req: Request, res: Response) {
    const group = req.query.group as BrokerOptionGroup | undefined;
    const search = req.query.search as string | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    const data = await optionsService.getAdminOptions({ group, search, isActive });
    return res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  }

  /**
   * Admin: POST /api/admin/broker-options
   */
  async createOption(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const created = await optionsService.createOption(adminUserId, req.body);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Broker option created successfully',
      data: created,
    });
  }

  /**
   * Admin: PATCH /api/admin/broker-options/:id
   */
  async updateOption(req: Request, res: Response) {
    const adminUserId = (req as any).user.userId;
    const updated = await optionsService.updateOption(adminUserId, req.params.id as string, req.body);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Broker option updated successfully',
      data: updated,
    });
  }
}

export const optionsController = new OptionsController();
