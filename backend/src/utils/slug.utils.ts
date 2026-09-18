import slugify from 'slugify';
import { prisma } from '../config/database';

export type SlugModel = 'broker' | 'accountManager' | 'signalProvider' | 'tutor' | 'course' | 'blogPost';

export const generateUniqueSlug = async (name: string, model: SlugModel): Promise<string> => {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  }) || 'item';

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    let existing = null;
    switch (model) {
      case 'broker':
        existing = await prisma.broker.findUnique({ where: { slug: uniqueSlug } });
        break;
      case 'accountManager':
        existing = await prisma.accountManager.findUnique({ where: { slug: uniqueSlug } });
        break;
      case 'signalProvider':
        existing = await prisma.signalProvider.findUnique({ where: { slug: uniqueSlug } });
        break;
      case 'tutor':
        existing = await prisma.tutor.findUnique({ where: { slug: uniqueSlug } });
        break;
      case 'course':
        existing = await prisma.course.findUnique({ where: { slug: uniqueSlug } });
        break;
      case 'blogPost':
        existing = await prisma.blogPost.findUnique({ where: { slug: uniqueSlug } });
        break;
    }

    if (!existing) {
      return uniqueSlug;
    }

    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
};
