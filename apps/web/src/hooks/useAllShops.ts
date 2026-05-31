import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@shelfr/shared';
import type { Product, Shop } from '@shelfr/shared';
import { useAuth } from '../context/AuthContext';

export interface ShopProduct extends Product {
  collection: {
    id: string;
    name: string;
    slug: string;
    color: string;
    archived: boolean;
  } | null;
}

export interface ShelfGroup {
  collectionId: string;
  name: string;
  slug: string;
  color: string;
  products: ShopProduct[];
}

export interface GlobalShop {
  key: string;
  name: string;
  domain: string;
  url: string | null;
  productCount: number;
  shelfCount: number;
  shelfGroups: ShelfGroup[];
  fromShopsTable: boolean;
}

function keyFor(domain: string, name: string) {
  const d = (domain || '').trim().toLowerCase();
  if (d) return d;
  return `name:${(name || '').trim().toLowerCase()}`;
}

export function useAllShops() {
  const { user } = useAuth();
  const [shops, setShops] = useState<GlobalShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const [productsRes, shopsRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, collection:collections(id, name, slug, color, archived)')
        .eq('archived', false),
      supabase
        .from('shops')
        .select('*, collection:collections(id, name, slug, color, archived)'),
    ]);

    if (productsRes.error) {
      setError(productsRes.error.message);
      setLoading(false);
      return;
    }
    if (shopsRes.error) {
      setError(shopsRes.error.message);
      setLoading(false);
      return;
    }

    const products = ((productsRes.data ?? []) as ShopProduct[]).filter(
      (p) => p.collection && !p.collection.archived
    );

    const shopRows = (
      (shopsRes.data ?? []) as (Shop & {
        collection: ShopProduct['collection'];
      })[]
    ).filter((s) => s.collection && !s.collection.archived);

    const map = new Map<string, GlobalShop>();

    for (const s of shopRows) {
      const k = keyFor(s.domain, s.name);
      const existing = map.get(k);
      if (!existing) {
        map.set(k, {
          key: k,
          name: s.name || s.domain || 'Other',
          domain: s.domain || '',
          url: s.url ?? null,
          productCount: 0,
          shelfCount: 0,
          shelfGroups: [],
          fromShopsTable: true,
        });
      } else {
        existing.fromShopsTable = true;
        if (!existing.url && s.url) existing.url = s.url;
      }
    }

    for (const p of products) {
      const k = keyFor(p.shop_domain, p.shop_name);
      let shop = map.get(k);
      if (!shop) {
        shop = {
          key: k,
          name: p.shop_name || p.shop_domain || 'Other',
          domain: p.shop_domain || '',
          url: null,
          productCount: 0,
          shelfCount: 0,
          shelfGroups: [],
          fromShopsTable: false,
        };
        map.set(k, shop);
      }
      const col = p.collection;
      if (!col) continue;
      let group = shop.shelfGroups.find((g) => g.collectionId === col.id);
      if (!group) {
        group = {
          collectionId: col.id,
          name: col.name,
          slug: col.slug,
          color: col.color,
          products: [],
        };
        shop.shelfGroups.push(group);
      }
      group.products.push(p);
      shop.productCount += 1;
    }

    const result = [...map.values()].map((s) => {
      s.shelfGroups.sort((a, b) => a.name.localeCompare(b.name));
      for (const g of s.shelfGroups) {
        g.products.sort((a, b) => a.title.localeCompare(b.title));
      }
      s.shelfCount = s.shelfGroups.length;
      return s;
    });
    result.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    setShops(result);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { shops, loading, error, refetch: fetch };
}
