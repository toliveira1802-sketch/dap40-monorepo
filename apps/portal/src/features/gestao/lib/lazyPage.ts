import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type PreloadableComponent<T extends ComponentType<any>> =
  LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> };

export function lazyPage<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>
) {
  const component = lazy(loader) as PreloadableComponent<T>;
  component.preload = loader;
  return component;
}
