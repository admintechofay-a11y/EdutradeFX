import { z } from 'zod';
import {
  TeamFounderRole,
  TeamOwnershipDisclosure,
  TeamProfileVisibility,
  ProviderDocKind,
  ProviderDocGroup,
  DocumentVisibility,
} from '@prisma/client';

export const createTeamMemberSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  jobTitle: z.string().trim().min(2).max(100),
  department: z.string().trim().max(100).optional().nullable(),
  bio: z.string().trim().max(5000).optional().nullable(),
  photoUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  photoPublicId: z.string().trim().optional().nullable(),
  linkedinUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  email: z.string().trim().email().optional().nullable().or(z.literal('')),
  phone: z.string().trim().max(50).optional().nullable(),
  founderRole: z.nativeEnum(TeamFounderRole).optional().nullable(),
  currentDesignation: z.string().trim().max(100).optional().nullable(),
  ownershipDisclosure: z.nativeEnum(TeamOwnershipDisclosure).default(TeamOwnershipDisclosure.NOT_DISCLOSED),
  ownershipPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  evidenceDocId: z.string().uuid().optional().nullable(),
  profileVisibility: z.nativeEnum(TeamProfileVisibility).default(TeamProfileVisibility.COMPANY_PROFILE_ONLY),
  displayOrder: z.number().int().default(0),
  productIds: z.array(z.string().uuid()).optional(),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial();

export const assignTeamProductsSchema = z.object({
  productIds: z.array(z.string().uuid()),
});

export const createProviderDocSchema = z.object({
  kind: z.nativeEnum(ProviderDocKind).default(ProviderDocKind.FILE),
  group: z.nativeEnum(ProviderDocGroup).default(ProviderDocGroup.DOCUMENT),
  docType: z.string().trim().min(1).max(100),
  name: z.string().trim().min(2).max(200),
  issuingAuthority: z.string().trim().max(200).optional().nullable(),
  registrationNumber: z.string().trim().max(100).optional().nullable(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  verificationUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  fileUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  linkUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  publicId: z.string().trim().optional().nullable(),
  visibility: z.nativeEnum(DocumentVisibility).default(DocumentVisibility.PRIVATE),
  requiredForVerification: z.boolean().default(false),
});

export const updateProviderDocSchema = createProviderDocSchema.partial();

