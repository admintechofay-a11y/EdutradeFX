import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { generateUniqueSlug } from '../../utils/slug.utils';
import { parsePagination } from '../../utils/pagination.utils';
import { BlogStatus, Prisma } from '@prisma/client';

export class BlogService {
  async createPost(authorId: string, data: any, file?: Express.Multer.File) {
    const slug = await generateUniqueSlug(data.title, 'blogPost');
    const imageUrl = file ? (file as any).path || (file as any).secure_url : undefined;
    const isPublished = data.status === BlogStatus.PUBLISHED;

    return await prisma.blogPost.create({
      data: {
        authorId,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        tags: data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]) : [],
        featuredImage: imageUrl,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: data.status || BlogStatus.DRAFT,
        publishedAt: isPublished ? new Date() : null,
      },
    });
  }

  async getPosts(query: any, isAdmin: boolean = false) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.BlogPostWhereInput = {};
    if (!isAdmin) {
      where.status = BlogStatus.PUBLISHED;
    } else if (query.status) {
      where.status = query.status as BlogStatus;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search as string, mode: 'insensitive' } },
        { excerpt: { contains: query.search as string, mode: 'insensitive' } },
        { content: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = { equals: query.category as string, mode: 'insensitive' };
    }

    if (query.tag) {
      where.tags = { has: query.tag as string };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { posts, total, page, limit, totalPages };
  }

  async getPostBySlug(slug: string) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!post) {
      throw new AppError('Blog article not found.', StatusCodes.NOT_FOUND);
    }

    // Increment view count asynchronously
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async updatePost(postId: string, userId: string, role: string, data: any, file?: Express.Multer.File) {
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Article not found.', StatusCodes.NOT_FOUND);
    }

    if (role !== 'ADMIN' && post.authorId !== userId) {
      throw new AppError('Unauthorized to modify this article.', StatusCodes.FORBIDDEN);
    }

    const imageUrl = file ? (file as any).path || (file as any).secure_url : post.featuredImage;

    let slug = post.slug;
    if (data.title && data.title !== post.title) {
      slug = await generateUniqueSlug(data.title, 'blogPost');
    }

    const willPublish = data.status === BlogStatus.PUBLISHED && post.status !== BlogStatus.PUBLISHED;

    return await prisma.blogPost.update({
      where: { id: postId },
      data: {
        ...(imageUrl && { featuredImage: imageUrl }),
        ...(data.title && { title: data.title, slug }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.tags && { tags: Array.isArray(data.tags) ? data.tags : [data.tags] }),
        ...(data.status && { status: data.status }),
        ...(willPublish && { publishedAt: new Date() }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      },
    });
  }

  async deletePost(postId: string, userId: string, role: string) {
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Article not found.', StatusCodes.NOT_FOUND);
    }

    if (role !== 'ADMIN' && post.authorId !== userId) {
      throw new AppError('Unauthorized to delete this article.', StatusCodes.FORBIDDEN);
    }

    await prisma.blogPost.delete({ where: { id: postId } });
    return { message: 'Article deleted successfully.' };
  }

  async getCategories() {
    const posts = await prisma.blogPost.groupBy({
      by: ['category'],
      where: { status: BlogStatus.PUBLISHED },
      _count: { category: true },
    });

    return posts.map((p) => ({
      category: p.category,
      count: p._count.category,
    }));
  }

  async getTags() {
    const posts = await prisma.blogPost.findMany({
      where: { status: BlogStatus.PUBLISHED },
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    posts.forEach((p) => {
      p.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
  }
}

export const blogService = new BlogService();
