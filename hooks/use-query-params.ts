'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getParam = (key: string) => searchParams.get(key) || '';

  const setParam = (key: string, val: any) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (val) params.set(key, val);
    else params.delete(key);
    
    router.replace(`${pathname}?${params.toString()}`);
  };

  return { getParam, setParam };
}