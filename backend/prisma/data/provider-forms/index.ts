import { CategoryFormDefinition } from './types';
import { COMMON_OPTION_LISTS } from './common-lists';
import { CATEGORY_01_DEFINITION } from './category-01';
import { CATEGORY_02_DEFINITION } from './category-02';
import { CATEGORY_03_DEFINITION } from './category-03';
import { CATEGORY_04_DEFINITION } from './category-04';
import { CATEGORY_05_DEFINITION } from './category-05';
import { CATEGORY_06_DEFINITION } from './category-06';
import { CATEGORY_07_DEFINITION } from './category-07';
import { CATEGORY_08_DEFINITION } from './category-08';
import { CATEGORY_09_DEFINITION } from './category-09';
import { CATEGORY_10_DEFINITION } from './category-10';

export * from './types';
export * from './common-lists';
export { CATEGORY_01_DEFINITION } from './category-01';
export { CATEGORY_02_DEFINITION } from './category-02';
export { CATEGORY_03_DEFINITION } from './category-03';
export { CATEGORY_04_DEFINITION } from './category-04';
export { CATEGORY_05_DEFINITION } from './category-05';
export { CATEGORY_06_DEFINITION } from './category-06';
export { CATEGORY_07_DEFINITION } from './category-07';
export { CATEGORY_08_DEFINITION } from './category-08';
export { CATEGORY_09_DEFINITION } from './category-09';
export { CATEGORY_10_DEFINITION } from './category-10';

export const ALL_CATEGORY_DEFINITIONS: CategoryFormDefinition[] = [
  CATEGORY_01_DEFINITION,
  CATEGORY_02_DEFINITION,
  CATEGORY_03_DEFINITION,
  CATEGORY_04_DEFINITION,
  CATEGORY_05_DEFINITION,
  CATEGORY_06_DEFINITION,
  CATEGORY_07_DEFINITION,
  CATEGORY_08_DEFINITION,
  CATEGORY_09_DEFINITION,
  CATEGORY_10_DEFINITION,
];

export const CATEGORIES_BY_NUMBER: Record<number, CategoryFormDefinition> = ALL_CATEGORY_DEFINITIONS.reduce(
  (acc, cat) => {
    acc[cat.number] = cat;
    return acc;
  },
  {} as Record<number, CategoryFormDefinition>
);

export const CATEGORIES_BY_SLUG: Record<string, CategoryFormDefinition> = ALL_CATEGORY_DEFINITIONS.reduce(
  (acc, cat) => {
    acc[cat.slug] = cat;
    return acc;
  },
  {} as Record<string, CategoryFormDefinition>
);
