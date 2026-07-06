import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiShoppingCart2Line,
  RiImageLine,
  RiMenuLine,
  RiCheckLine,
} from '@remixicon/react';
import { supabase } from '@shelfr/shared';
import { EmptyState, TotalRow } from '@shelfr/ui';
import { useAuth } from '../context/AuthContext';
import { useCollections } from '../hooks/useCollections';
import { useCollectionMembers } from '../hooks/useCollectionMembers';
import { useNotifications } from '../hooks/useNotifications';
import { useShoppingList } from '../hooks/useShoppingList';
import { useToast } from '../context/ToastContext';
import { Sidebar } from '../components/Sidebar';
import { NotificationBell } from '../components/NotificationBell';
import { groupByShop } from '../utils/productSort';

export function ShoppingListPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { collections, archive: archiveCollection } = useCollections();
  const { items, loading, markPurchased } = useShoppingList();
  const { toast } = useToast();
  useCollectionMembers(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    dismiss: dismissNotification,
  } = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const shopGroups = useMemo(() => groupByShop(items, 'asc'), [items]);
  const totalCount = items.reduce((s, p) => s + (p.quantity || 1), 0);
  const totalValue = items.reduce(
    (s, p) => s + Number(p.price) * (p.quantity || 1),
    0
  );

  function goToProduct(slug: string, productId: string) {
    navigate(`/shelfs/${slug}/${productId}`);
  }

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
          <RiShoppingCart2Line size={18} className="text-[#1c1e2a]" />
          <h1 className="text-sm font-medium text-[#1c1e2a]">Shopping list</h1>
          {!loading && items.length > 0 && (
            <span className="text-[11px] text-neutral-400">
              {totalCount} items across {shopGroups.length}{' '}
              {shopGroups.length === 1 ? 'shop' : 'shops'}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {loading && (
            <p className="text-xs text-neutral-400">Loading shopping list...</p>
          )}

          {!loading && items.length === 0 && (
            <EmptyState
              icon={RiShoppingCart2Line}
              title="Nothing to buy yet"
              description="Items marked as Winners across all your shelves will appear here."
            />
          )}

          {!loading && items.length > 0 && (
            <div className="flex flex-col gap-5 max-w-4xl">
              {shopGroups.map((g) => {
                const groupCount = g.items.reduce(
                  (s, p) => s + (p.quantity || 1),
                  0
                );
                const groupTotal = g.items.reduce(
                  (s, p) => s + Number(p.price) * (p.quantity || 1),
                  0
                );
                return (
                  <div key={g.domain}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-[#1c1e2a]">
                        {g.name}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {groupCount} {groupCount === 1 ? 'item' : 'items'}
                      </span>
                      <div className="flex-1 h-px bg-neutral-200" />
                      <span className="text-[11px] font-medium text-neutral-500">
                        ${groupTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {g.items.map((p) => (
                        <ShoppingListRow
                          key={p.id}
                          item={p}
                          onOpen={() =>
                            p.collection && goToProduct(p.collection.slug, p.id)
                          }
                          onMarkBought={() => {
                            markPurchased(p.id);
                            toast(`Marked "${p.title}" as bought`, 'success');
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              <TotalRow items={items} label="Shopping list total" />
              <p className="text-[11px] text-neutral-400 text-right">
                {totalCount} items &middot; ${totalValue.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ShoppingListRowProps {
  item: {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    quantity: number;
    shop_name: string;
    collection: {
      name: string;
      slug: string;
      color: string;
    } | null;
  };
  onOpen: () => void;
  onMarkBought: () => void;
}

function ShoppingListRow({ item, onOpen, onMarkBought }: ShoppingListRowProps) {
  const qty = item.quantity || 1;
  return (
    <div
      onClick={onOpen}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="bg-white rounded shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 overflow-hidden"
    >
      <div className="w-16 h-16 bg-neutral-100 flex-shrink-0 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RiImageLine size={20} className="text-neutral-300" />
          </div>
        )}
      </div>
      <div className="flex-1 py-3 min-w-0">
        <p className="text-[13px] font-medium text-[#1c1e2a] truncate font-serif">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.collection && (
            <span className="flex items-center gap-1 text-[10px] text-neutral-500">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: item.collection.color }}
              />
              {item.collection.name}
            </span>
          )}
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
            {item.shop_name}
          </span>
        </div>
      </div>
      <div className="w-12 flex-shrink-0 text-center">
        <span className="text-xs text-neutral-400">&times;{qty}</span>
      </div>
      <div className="w-28 flex-shrink-0 text-right">
        <span className="text-[15px] font-semibold text-[#1c1e2a]">
          ${Number(item.price).toLocaleString()}
        </span>
        {qty > 1 && (
          <p className="text-[10px] text-neutral-400">
            ${(Number(item.price) * qty).toLocaleString()}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMarkBought();
        }}
        title="Mark as bought"
        aria-label="Mark as bought"
        className="mr-3 flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded border border-neutral-200 text-neutral-500 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
      >
        <RiCheckLine size={14} />
        Bought
      </button>
    </div>
  );
}
