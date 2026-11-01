export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'RICH_TEXT'
  | 'NUMBER'
  | 'NUMBER_UNIT'
  | 'PERCENT'
  | 'MONEY'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'YES_NO'
  | 'YES_NO_DETAILS'
  | 'TRI_STATE'
  | 'URL'
  | 'DATE'
  | 'DATE_RANGE'
  | 'COUNTRY_SINGLE'
  | 'COUNTRY_MULTI'
  | 'LOCATION'
  | 'SCHEDULE'
  | 'FILE'
  | 'FILE_MULTI'
  | 'REPEATABLE_GROUP'
  | 'STATUS_OR_VALUE';

export type FieldVisibility = 'PUBLIC' | 'ADMIN_ONLY';
export type ClaimLevel = 'DECLARED' | 'VERIFIABLE';
export type FormScope = 'PROVIDER' | 'PRODUCT';

export interface FormOption {
  value: string;
  label: string;
  description?: string | null;
}

export interface FormFieldDef {
  key: string;
  label: string;
  helpText?: string | null;
  type: FormFieldType;
  required: boolean;
  scope?: FormScope;
  options?: FormOption[];
  optionSource?: string | null;
  allowOther?: boolean;
  unitOptions?: string[];
  statuses?: string[];
  validation?: {
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: string;
  };
  visibleWhen?: {
    field: string;
    op: 'eq' | 'neq' | 'in' | 'contains';
    value: any;
  };
  disjointWith?: string | null;
  repeatableFields?: any[];
  visibility?: FieldVisibility;
  claim?: ClaimLevel;
  sortOrder: number;
  isActive?: boolean;
  sinceSchemaVersion?: number;
}

export interface FormSectionDef {
  key: string;
  title: string;
  description?: string | null;
  scope?: FormScope;
  sortOrder: number;
  fields: FormFieldDef[];
}

export interface CategorySubcategoryDef {
  key: string;
  label: string;
  sortOrder: number;
}

export interface CategoryFormDefinition {
  number: number;
  slug: string;
  name: string;
  shortDescription: string;
  mainServices: string;
  icon?: string | null;
  sortOrder: number;
  hasProductForm: boolean;
  subcategories: CategorySubcategoryDef[];
  sections: FormSectionDef[];
}
