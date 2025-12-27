import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  parentId?: string;
  children: CategoryNode[];
}

export function flattenCategories(
  categories: CategoryNode[],
  depth = 0
): { id: string; name: string; slug: string; depth: number }[] {
  let result: { id: string; name: string; slug: string; depth: number }[] = [];
  categories.forEach((cat) => {
    result.push({ id: cat.id, name: cat.name, slug: cat.slug, depth });
    if (cat.children && cat.children.length > 0) {
      result = result.concat(flattenCategories(cat.children, depth + 1));
    }
  });
  return result;
}

export function buildCategoryTree(categories: any[]): CategoryNode[] {
  const map: { [key: string]: CategoryNode } = {};
  const tree: CategoryNode[] = [];

  categories.forEach((cat) => {
    map[cat.id] = { ...cat, children: [] };
  });

  categories.forEach((cat) => {
    if (cat.parentId && map[cat.parentId]) {
      map[cat.parentId].children.push(map[cat.id]);
    } else {
      tree.push(map[cat.id]);
    }
  });

  return tree;
}
