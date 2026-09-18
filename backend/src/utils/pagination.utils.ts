import { APP_CONSTANTS } from '../config/constants';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export const parsePagination = (query: any): PaginationParams => {
  let page = parseInt(query.page as string, 10);
  let limit = parseInt(query.limit as string, 10);

  if (isNaN(page) || page < 1) {
    page = APP_CONSTANTS.DEFAULT_PAGE;
  }

  if (isNaN(limit) || limit < 1) {
    limit = APP_CONSTANTS.DEFAULT_LIMIT;
  } else if (limit > APP_CONSTANTS.MAX_LIMIT) {
    limit = APP_CONSTANTS.MAX_LIMIT;
  }

  const skip = (page - 1) * limit;
  const take = limit;

  return {
    page,
    limit,
    skip,
    take,
  };
};
