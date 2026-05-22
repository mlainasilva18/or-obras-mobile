import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  tablet: 769,
  desktop: 1025,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

/**
 * Returns the current breakpoint based on screen width.
 * - mobile:  <= 768px
 * - tablet:  769px – 1024px
 * - desktop: >= 1025px
 *
 * On native (iOS/Android) always returns 'mobile'.
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (Platform.OS !== 'web') return 'mobile';
    const w = typeof window !== 'undefined' ? window.innerWidth : 375;
    return getBreakpoint(w);
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const update = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    window.addEventListener('resize', update);
    update();
    return () => window.removeEventListener('resize', update);
  }, []);

  return breakpoint;
}

/**
 * Convenience helpers derived from useBreakpoint.
 */
export function useResponsive() {
  const bp = useBreakpoint();
  return {
    bp,
    isMobile: bp === 'mobile',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
    isTabletOrDesktop: bp === 'tablet' || bp === 'desktop',
    /** Number of grid columns: 1 mobile, 2 tablet, 3 desktop */
    cols: bp === 'desktop' ? 3 : bp === 'tablet' ? 2 : 1,
    /** Modal width: '100%' mobile, '70%' tablet, '50%' desktop */
    modalWidth: bp === 'desktop' ? '50%' : bp === 'tablet' ? '70%' : '100%',
    /** Sidebar width: 240px desktop, 64px tablet (icon-only), 0 mobile */
    sidebarWidth: bp === 'desktop' ? 240 : bp === 'tablet' ? 64 : 0,
    /** Font scale factor */
    fontScale: bp === 'desktop' ? 1.05 : bp === 'tablet' ? 1.0 : 0.95,
  };
}
