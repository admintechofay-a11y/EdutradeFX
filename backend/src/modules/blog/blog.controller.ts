import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { blogService } from './blog.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class BlogController {
  createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const post = await blogService.createPost(req.user!.userId, req.body, req.file);
    sendSuccess(res, post, 'Article created successfully', StatusCodes.CREATED);
  };

  getPosts = async (req: Request, res: Response): Promise<void> => {
    const result = await blogService.getPosts(req.query, false);
    sendPaginated(res, result.posts, result.total, result.page, result.limit, 'Articles retrieved');
  };

  getAllPostsAdmin = async (req: Request, res: Response): Promise<void> => {
    const result = await blogService.getPosts(req.query, true);
    sendPaginated(res, result.posts, result.total, result.page, result.limit, 'All articles retrieved for admin');
  };

  getPostBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const post = await blogService.getPostBySlug(slug as string);
    sendSuccess(res, post, 'Article retrieved', StatusCodes.OK);
  };

  updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const post = await blogService.updatePost(id as string, req.user!.userId, req.user!.role, req.body, req.file);
    sendSuccess(res, post, 'Article updated successfully', StatusCodes.OK);
  };

  deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await blogService.deletePost(id as string, req.user!.userId, req.user!.role);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    const categories = await blogService.getCategories();
    sendSuccess(res, categories, 'Categories retrieved', StatusCodes.OK);
  };

  getTags = async (req: Request, res: Response): Promise<void> => {
    const tags = await blogService.getTags();
    sendSuccess(res, tags, 'Tags retrieved', StatusCodes.OK);
  };
}

export const blogController = new BlogController();
