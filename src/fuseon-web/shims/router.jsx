/**
 * Compatibility layer: exposes the small react-router-dom API surface used by
 * the original Fuseon web screens, implemented on top of TanStack Router.
 * When moving to Expo, swap this file for an expo-router adapter.
 */
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import {
  useRouter,
  useRouterState,
  useParams as useTanParams,
  Outlet as TanOutlet,
} from '@tanstack/react-router';

const toHref = (to) => {
  if (typeof to === 'string') return to;
  if (to && typeof to === 'object') return `${to.pathname || ''}${to.search || ''}${to.hash || ''}`;
  return '/';
};

// Resolve relative targets ("?section=x", "manage", "../") like react-router does.
const resolveHref = (href) => {
  if (href.startsWith('/')) return href;
  const url = new URL(href, window.location.href);
  return `${url.pathname}${url.search}${url.hash}`;
};

export function useNavigate() {
  const router = useRouter();
  return React.useCallback(
    (to, opts = {}) => {
      if (typeof to === 'number') {
        if (to < 0) router.history.go(to);
        else router.history.forward();
        return;
      }
      const href = resolveHref(toHref(to));
      const state = opts.state ? { ...opts.state } : {};
      if (opts.replace) router.history.replace(href, state);
      else router.history.push(href, state);
    },
    [router],
  );
}

export function useLocation() {
  const loc = useRouterState({ select: (s) => s.location });
  return useMemo(
    () => ({
      pathname: loc.pathname,
      search: loc.searchStr || '',
      hash: loc.hash ? `#${loc.hash}` : '',
      state: loc.state || null,
      key: loc.state?.__TSR_key || loc.href,
    }),
    [loc],
  );
}

export function useParams() {
  return useTanParams({ strict: false });
}

export function useSearchParams() {
  const router = useRouter();
  const { pathname, search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const setParams = React.useCallback(
    (next, opts = {}) => {
      const value = typeof next === 'function' ? next(new URLSearchParams(search)) : next;
      const qs = new URLSearchParams(value).toString();
      const href = `${pathname}${qs ? `?${qs}` : ''}`;
      if (opts.replace) router.history.replace(href);
      else router.history.push(href);
    },
    [router, pathname, search],
  );
  return [params, setParams];
}

function isModified(e) {
  return e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0;
}

export const Link = React.forwardRef(function Link(
  { to, replace, state, onClick, target, children, ...rest },
  ref,
) {
  const navigate = useNavigate();
  const href = toHref(to);
  return (
    <a
      ref={ref}
      href={href}
      target={target}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || target === '_blank' || isModified(e)) return;
        e.preventDefault();
        navigate(href, { replace, state });
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export const NavLink = React.forwardRef(function NavLink(
  { to, end, className, style, children, ...rest },
  ref,
) {
  const { pathname } = useLocation();
  const target = toHref(to).split('?')[0];
  const isActive =
    target === '/' || end
      ? pathname === target
      : pathname === target || pathname.startsWith(`${target}/`);
  const cls = typeof className === 'function' ? className({ isActive }) : className;
  const sty = typeof style === 'function' ? style({ isActive }) : style;
  const content = typeof children === 'function' ? children({ isActive }) : children;
  return (
    <Link ref={ref} to={to} className={cls} style={sty} aria-current={isActive ? 'page' : undefined} {...rest}>
      {content}
    </Link>
  );
});

export function Navigate({ to, replace, state }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace, state });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

const OutletContext = createContext(undefined);

export function Outlet({ context }) {
  return (
    <OutletContext.Provider value={context}>
      <TanOutlet />
    </OutletContext.Provider>
  );
}

export function useOutletContext() {
  return useContext(OutletContext);
}
