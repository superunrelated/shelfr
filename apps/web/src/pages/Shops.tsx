import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiStore2Line, RiMenuLine } from '@remixicon/react';
import { supabase } from '@shelfr/shared';
import { EmptyState } from '@shelfr/ui';
import { useAuth } from '../context/AuthContext';
import { useCollections } from '../hooks/useCollections';
import { useCollectionMembers } from '../hooks/useCollectionMembers';
import { useNotifications } from '../hooks/useNotifications';
import { useAllShops } from '../hooks/useAllShops';
import { Sidebar } from '../components/Sidebar';
import { NotificationBell } from '../components/NotificationBell';
import {
  ShopAccordion,
  type ShopAccordionItem,
  type ShopAccordionProduct,
  type ShopAccordionShelfGroup,
} from '../components/ShopAccordion';
import type { GlobalShop, ShelfGroup, ShopProduct } from '../hooks/useAllShops';

function toAccordionProduct(p: ShopProduct): ShopAccordionProduct {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    image_url: p.image_url,
  };
}

function toAccordionShelfGroup(g: ShelfGroup): ShopAccordionShelfGroup {
  return {
    collectionId: g.collectionId,
    name: g.name,
    slug: g.slug,
    color: g.color,
    products: g.products.map(toAccordionProduct),
  };
}

function toAccordionItem(s: GlobalShop): ShopAccordionItem {
  return {
    key: s.key,
    name: s.name,
    domain: s.domain,
    url: s.url,
    productCount: s.productCount,
    shelfCount: s.shelfCount,
    showShelfHeaders: true,
    shelfGroups: s.shelfGroups.map(toAccordionShelfGroup),
    badge:
      s.fromShopsTable && s.productCount === 0 ? (
        <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
          shelf shop
        </span>
      ) : null,
  };
}

export function ShopsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { collections, archive: archiveCollection } = useCollections();
  const { shops, loading } = useAllShops();
  useCollectionMembers(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    dismiss: dismissNotification,
  } = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const items: ShopAccordionItem[] = useMemo(
    () => shops.map(toAccordionItem),
    [shops]
  );

  const totalProducts = useMemo(
    () => shops.reduce((s, x) => s + x.productCount, 0),
    [shops]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 antialiased text-sm">
      <Sidebar
        collections={collections.filter((c) => !c.archived)}
        currentUserId={user?.id ?? ''}
        activeColId={null}
        userEmail={user?.email ?? ''}
        open={sidebarOpen}
        onNavigateHome={() => {
          navigate('/shelfs');
          setSidebarOpen(false);
        }}
        onSwitchCollection={(id) => {
          const col = collections.find((c) => c.id === id);
          if (col) navigate(`/shelfs/${col.slug}`);
          setSidebarOpen(false);
        }}
        onCreateCollection={() => {
          /* not used from this page */
        }}
        onArchiveCollection={(id) => archiveCollection(id, true)}
        onSignOut={signOut}
        onDeleteAccount={async () => {
          await supabase.rpc('delete_own_account');
          await supabase.auth.signOut();
          navigate('/');
        }}
        onClose={() => setSidebarOpen(false)}
        notificationSlot={
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllRead={markAllRead}
            onDismiss={dismissNotification}
          />
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="bg-white border-b border-neutral-200/80 px-4 md:px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            className="md:hidden text-neutral-500 hover:text-neutral-700"
            onClick={() => setSidebarOpen(true)}
          >
            <RiMenuLine size={18} />
          </button>
          <RiStore2Line size={18} className="text-[#1c1e2a]" />
          <h1 className="text-sm font-medium text-[#1c1e2a]">Shops</h1>
          {!loading && shops.length > 0 && (
            <span className="text-[11px] text-neutral-400">
              {shops.length} {shops.length === 1 ? 'shop' : 'shops'} &middot;{' '}
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {loading && (
            <p className="text-xs text-neutral-400">Loading shops...</p>
          )}

          {!loading && (
            <div className="max-w-4xl">
              <ShopAccordion
                items={items}
                expandedKey={expandedKey}
                onToggle={(k) =>
                  setExpandedKey((prev) => (prev === k ? null : k))
                }
                onSelectProduct={(slug, productId) =>
                  navigate(`/shelfs/${slug}/${productId}`)
                }
                emptyState={
                  <EmptyState
                    icon={RiStore2Line}
                    title="No shops yet"
                    description="Shops you add to shelves or discover via products will appear here."
                  />
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
