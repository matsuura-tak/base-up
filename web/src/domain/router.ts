import type { ResolvedRoute } from './types';

function parseStageParam(
  search: string,
  maxStage: number,
  basePath: '/combinator' | '/fermi',
): ResolvedRoute {
  const params = new URLSearchParams(search);
  const raw = params.get('stage');

  if (raw === null) {
    return {
      route: basePath === '/combinator' ? 'combinator' : 'fermi',
      stageId: 1,
      stageFallbackNotice: false,
      canonicalPath: `${basePath}?stage=1`,
    };
  }

  if (/^[0-9]+$/.test(raw)) {
    const parsed = Number.parseInt(raw, 10);
    if (parsed >= 1 && parsed <= maxStage) {
      return {
        route: basePath === '/combinator' ? 'combinator' : 'fermi',
        stageId: parsed,
        stageFallbackNotice: false,
        canonicalPath: `${basePath}?stage=${String(parsed)}`,
      };
    }
  }

  return {
    route: basePath === '/combinator' ? 'combinator' : 'fermi',
    stageId: 1,
    stageFallbackNotice: true,
    canonicalPath: `${basePath}?stage=1`,
  };
}

export function resolveRouteFromLocation(pathname: string, search: string): ResolvedRoute {
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (normalizedPath === '' || normalizedPath === '/') {
    return {
      route: 'lobby',
      stageId: null,
      stageFallbackNotice: false,
      canonicalPath: '/',
    };
  }

  if (normalizedPath === '/combinator') {
    return parseStageParam(search, 10, '/combinator');
  }

  if (normalizedPath === '/fermi') {
    return parseStageParam(search, 9, '/fermi');
  }

  if (normalizedPath === '/diagnostic') {
    return {
      route: 'diagnostic',
      stageId: null,
      stageFallbackNotice: false,
      canonicalPath: '/diagnostic',
    };
  }

  return {
    route: 'notFound',
    stageId: null,
    stageFallbackNotice: false,
    canonicalPath: normalizedPath,
  };
}
