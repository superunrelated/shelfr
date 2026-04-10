import { useState } from "react";
import {
  RiSofaLine, RiComputerLine, RiCupLine, RiStore2Line,
  RiAddLine, RiCloseLine, RiMenuLine, RiExternalLinkLine,
  RiRefreshLine, RiCheckLine, RiArrowLeftLine, RiShoppingBag3Line,
  RiTrophyLine, RiStarLine, RiSearchEyeLine, RiScalesLine,
  RiThumbUpLine, RiThumbDownLine, RiLink, RiArrowDownSLine,
  RiCheckboxCircleLine, RiBookmarkLine, RiStarFill, RiStarSLine,
  RiGridFill, RiGridLine, RiListCheck,
} from "@remixicon/react";

const CATEGORY_ICONS = {
  sofa: RiSofaLine,
  desk: RiComputerLine,
  coffee: RiCupLine,
};

// Demo images via picsum.photos with fixed seeds for consistency
const IMG = (seed, w = 400, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const INITIAL_PRODUCTS = {
  sofa: [
    { id: 1, name: "Enzo 3-Seater", shop: "IKEA", price: 1299, orig: 1299, icon: "sofa", img: IMG("sofa1"), status: "winner", rating: 5, pros: ["Great depth", "Easy clean"], cons: ["Limited colours"], notes: "Felt really comfy in store. 6 week delivery.", url: "#" },
    { id: 2, name: "Hugo Corner Sofa", shop: "Freedom", price: 2199, orig: 2399, icon: "sofa", img: IMG("sofa2"), status: "shortlisted", rating: 4, pros: ["Modular"], cons: ["Pricey"], notes: "Price dropped $200!", url: "#" },
    { id: 3, name: "Luxe Velvet 2.5-Seat", shop: "Koala", price: 1850, orig: 1850, icon: "sofa", img: IMG("sofa3"), status: "considering", rating: 0, pros: [], cons: [], notes: "", url: "#" },
    { id: 4, name: "Nova Sofa Bed", shop: "Fantastic Furniture", price: 899, orig: 899, icon: "sofa", img: IMG("sofa4"), status: "considering", rating: 2, pros: [], cons: ["Not as comfy"], notes: "Backup if guests come", url: "#" },
    { id: 5, name: "Arch Boucle Sofa", shop: "Temple & Webster", price: 1699, orig: 1699, icon: "sofa", img: IMG("sofa5"), status: "shortlisted", rating: 3, pros: ["Beautiful fabric"], cons: ["Hard to clean"], notes: "", url: "#" },
    { id: 6, name: "Drift 3-Seater", shop: "Koala", price: 1599, orig: 1799, icon: "sofa", img: IMG("sofa6"), status: "purchased", rating: 4, pros: ["100 night trial"], cons: [], notes: "Bought! Arrives Fri 18th", url: "#" },
  ],
  desk: [
    { id: 7, name: "FlexiSpot E7 Pro", shop: "FlexiSpot", price: 649, orig: 649, icon: "desk", img: IMG("desk1"), status: "winner", rating: 5, pros: ["Solid frame", "Quiet motor"], cons: ["Heavy assembly"], notes: "Best price/quality ratio", url: "#" },
    { id: 8, name: "Uplift V2", shop: "Uplift", price: 1200, orig: 1200, icon: "desk", img: IMG("desk2"), status: "considering", rating: 3, pros: ["Best warranty"], cons: ["Expensive"], notes: "", url: "#" },
    { id: 9, name: "IKEA Trotten", shop: "IKEA", price: 449, orig: 449, icon: "desk", img: IMG("desk3"), status: "considering", rating: 0, pros: ["Cheap"], cons: ["Manual crank only"], notes: "", url: "#" },
    { id: 10, name: "Omnidesk Pro 2", shop: "Omnidesk", price: 799, orig: 899, icon: "desk", img: IMG("desk4"), status: "shortlisted", rating: 4, pros: [], cons: [], notes: "", url: "#" },
  ],
  coffee: [
    { id: 11, name: "Breville Barista Express", shop: "Harvey Norman", price: 899, orig: 899, icon: "coffee", img: IMG("coffee1"), status: "winner", rating: 5, pros: ["Built-in grinder"], cons: ["Counter space"], notes: "", url: "#" },
    { id: 12, name: "DeLonghi Dedica", shop: "The Good Guys", price: 399, orig: 499, icon: "coffee", img: IMG("coffee2"), status: "considering", rating: 0, pros: ["Slim profile"], cons: ["No grinder"], notes: "", url: "#" },
    { id: 13, name: "Nespresso Vertuo", shop: "JB Hi-Fi", price: 249, orig: 249, icon: "coffee", img: IMG("coffee3"), status: "considering", rating: 2, pros: ["Easy pods"], cons: ["Ongoing pod cost"], notes: "", url: "#" },
  ],
};

const INITIAL_SHOPS = {
  sofa: [
    { id: 1, name: "IKEA", domain: "ikea.com/au", count: 1 },
    { id: 2, name: "Freedom", domain: "freedom.com.au", count: 1 },
    { id: 3, name: "Koala", domain: "koala.com", count: 2 },
    { id: 4, name: "Fantastic Furniture", domain: "fantasticfurniture.com.au", count: 1 },
    { id: 5, name: "Temple & Webster", domain: "templeandwebster.com.au", count: 1 },
    { id: 6, name: "Retrospec", domain: "retrospec.com.au", count: 0 },
  ],
  desk: [
    { id: 1, name: "FlexiSpot", domain: "flexispot.com.au", count: 1 },
    { id: 2, name: "Uplift", domain: "upliftdesk.com", count: 1 },
    { id: 3, name: "IKEA", domain: "ikea.com/au", count: 1 },
    { id: 4, name: "Omnidesk", domain: "omnidesk.com.au", count: 1 },
  ],
  coffee: [
    { id: 1, name: "Harvey Norman", domain: "harveynorman.com.au", count: 1 },
    { id: 2, name: "The Good Guys", domain: "thegoodguys.com.au", count: 1 },
    { id: 3, name: "JB Hi-Fi", domain: "jbhifi.com.au", count: 1 },
    { id: 4, name: "Myer", domain: "myer.com.au", count: 0 },
  ],
};

const COLLECTIONS = [
  { id: "sofa", name: "Living Room Sofa" },
  { id: "desk", name: "Standing Desk" },
  { id: "coffee", name: "Coffee Machine" },
];

const STATUS_CONFIG = {
  considering: {
    label: "Considering",
    Icon: RiSearchEyeLine,
    cardCls: "bg-neutral-100 text-neutral-400",
    btnActive: "bg-neutral-100 text-neutral-600",
  },
  shortlisted: {
    label: "Shortlisted",
    Icon: RiStarLine,
    cardCls: "bg-sky-50 text-sky-500",
    btnActive: "bg-sky-50 text-sky-600",
  },
  winner: {
    label: "Winner",
    Icon: RiTrophyLine,
    cardCls: "bg-amber-50 text-amber-600",
    btnActive: "bg-amber-50 text-amber-700",
  },
  purchased: {
    label: "Purchased",
    Icon: RiCheckboxCircleLine,
    cardCls: "bg-emerald-50 text-emerald-500",
    btnActive: "bg-emerald-50 text-emerald-600",
  },
};

function ProductIcon({ type, size = 32, className = "" }) {
  const Icon = CATEGORY_ICONS[type] || RiShoppingBag3Line;
  return <Icon size={size} className={className} />;
}

const STATUS_ORDER = { purchased: 0, winner: 1, shortlisted: 2, considering: 3 };

const SORT_OPTIONS = [
  { key: "rating", label: "Stars" },
  { key: "price", label: "Price" },
  { key: "status", label: "Status" },
];

function StarRating({ rating = 0, onRate, size = 14, interactive = true }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-px" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return (
          <button
            key={star}
            type="button"
            onClick={(e) => { e.stopPropagation(); if (interactive && onRate) onRate(star === rating ? 0 : star); }}
            onMouseEnter={() => interactive && setHover(star)}
            className={`transition-colors duration-100 ${interactive ? "cursor-pointer" : "cursor-default"}`}
          >
            {filled
              ? <RiStarFill size={size} className="text-amber-400" />
              : <RiStarSLine size={size} className={interactive && hover ? "text-amber-300" : "text-neutral-300"} />
            }
          </button>
        );
      })}
    </div>
  );
}

function sortProducts(products, sortKey) {
  return [...products].sort((a, b) => {
    if (sortKey === "rating") {
      const ra = a.rating || 0;
      const rb = b.rating || 0;
      if (ra === 0 && rb === 0) return 0;
      if (ra === 0) return 1;
      if (rb === 0) return -1;
      return rb - ra;
    }
    if (sortKey === "price") return a.price - b.price;
    if (sortKey === "status") return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    return 0;
  });
}

export default function Shelfr() {
  const [col, setCol] = useState("sofa");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("products");
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState(new Set());
  const [showCompareTable, setShowCompareTable] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopUrl, setShopUrl] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState("big"); // "big" | "medium" | "list"

  const colProducts = sortProducts(products[col] || [], sortBy);
  const colShops = shops[col] || [];
  const selected = colProducts.find((p) => p.id === selectedId) || null;

  function updateProduct(id, changes) {
    setProducts((prev) => ({
      ...prev,
      [col]: prev[col].map((p) => (p.id === id ? { ...p, ...changes } : p)),
    }));
  }

  function openProduct(id) {
    setSelectedId(id);
  }

  function closeDrawer() {
    setSelectedId(null);
  }

  function setStatus(status) {
    if (!selectedId) return;
    updateProduct(selectedId, { status });
  }

  function saveNotes(val) {
    if (!selectedId) return;
    updateProduct(selectedId, { notes: val });
  }

  function addPro() {
    if (!selected) return;
    const v = prompt("Add a pro:");
    if (!v) return;
    updateProduct(selected.id, { pros: [...selected.pros, v] });
  }

  function addCon() {
    if (!selected) return;
    const v = prompt("Add a con:");
    if (!v) return;
    updateProduct(selected.id, { cons: [...selected.cons, v] });
  }

  function refreshPrice() {
    if (!selected || refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      const drop = Math.random() > 0.5 && selected.price === selected.orig;
      if (drop) {
        const saving = [20, 30, 50, 100][Math.floor(Math.random() * 4)];
        updateProduct(selected.id, { price: selected.orig - saving });
      }
      setRefreshing(false);
    }, 1200);
  }

  function toggleCompareId(id) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }

  function startCompare() {
    setCompareMode(true);
    setSelectedId(null);
    setCompareIds(new Set());
    setShowCompareTable(false);
  }

  function exitCompare() {
    setCompareMode(false);
    setCompareIds(new Set());
    setShowCompareTable(false);
  }

  function doCompare() {
    if (compareIds.size < 2) { alert("Select at least 2 products"); return; }
    setShowCompareTable(true);
  }

  function addProduct() {
    if (!urlInput.trim()) return;
    const domain = urlInput.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
    const newP = {
      id: Date.now(),
      name: "New product",
      shop: domain || "Unknown",
      price: Math.floor(Math.random() * 800) + 200,
      orig: 0,
      icon: col,
      img: null,
      status: "considering",
      rating: 0,
      pros: [], cons: [], notes: "",
      url: urlInput,
    };
    newP.orig = newP.price;
    setProducts((prev) => ({ ...prev, [col]: [...prev[col], newP] }));
    setUrlInput("");
    setSelectedId(newP.id);
  }

  function addShop() {
    if (!shopName.trim()) return;
    const domain = shopUrl ? shopUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0] : "";
    setShops((prev) => ({
      ...prev,
      [col]: [...prev[col], { id: Date.now(), name: shopName, domain, count: 0 }],
    }));
    setShopName(""); setShopUrl("");
  }

  function switchCollection(id) {
    setCol(id);
    setSelectedId(null);
    setCompareMode(false);
    setCompareIds(new Set());
    setShowCompareTable(false);
    setTab("products");
    setSidebarOpen(false);
  }

  const compareProducts = [...colProducts]
    .filter((p) => compareIds.has(p.id))
    .sort((a, b) => a.price - b.price);

  return (
    <div className="flex h-screen overflow-hidden font-sans text-sm antialiased bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — dark navy */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-60 bg-[#1c1e2a] flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="px-6 py-6">
          <span className="text-xl tracking-tight text-white" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            shelf<span className="text-amber-400">r</span>
          </span>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          <p className="px-6 pb-3 text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">Collections</p>
          {COLLECTIONS.map((c) => {
            const Icon = CATEGORY_ICONS[c.id];
            const active = col === c.id;
            return (
              <button
                key={c.id}
                onClick={() => switchCollection(c.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-left text-[13px] transition-all duration-150 ${active ? "text-white bg-white/8" : "text-neutral-500 hover:text-neutral-300 hover:bg-white/4"}`}
              >
                <Icon size={18} className={active ? "text-amber-400" : "text-neutral-600"} />
                <span className="flex-1 truncate">{c.name}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${active ? "bg-white/10 text-neutral-300" : "bg-white/5 text-neutral-600"}`}>
                  {(products[c.id] || []).length}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="p-5">
          <button className="w-full py-2.5 text-xs text-neutral-500 border border-neutral-700 rounded hover:border-neutral-500 hover:text-neutral-300 transition-all duration-150 flex items-center justify-center gap-1.5">
            <RiAddLine size={14} />
            New collection
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-neutral-200/80 px-6 h-16 flex items-center gap-4 flex-shrink-0">
          <button className="md:hidden p-1.5 rounded text-neutral-400 hover:bg-neutral-100 transition-colors" onClick={() => setSidebarOpen(true)}>
            <RiMenuLine size={20} />
          </button>
          <h1 className="flex-1 text-[18px] font-semibold text-[#1c1e2a] tracking-tight truncate" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            {COLLECTIONS.find((c) => c.id === col)?.name}
          </h1>
          {!compareMode ? (
            <>
              <button onClick={startCompare} className="text-xs px-4 py-2 rounded border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 transition-all duration-150 flex items-center gap-1.5">
                <RiScalesLine size={14} />
                Compare
              </button>
              <button onClick={() => document.getElementById("urlinput")?.focus()} className="text-xs px-4 py-2 rounded bg-[#1c1e2a] text-white hover:bg-[#2a2d3d] font-medium transition-all duration-150 flex items-center gap-1.5">
                <RiAddLine size={14} />
                Add product
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-full">{compareIds.size} selected</span>
              <button onClick={doCompare} disabled={compareIds.size < 2} className="text-xs px-4 py-2 rounded bg-[#1c1e2a] text-white font-medium disabled:opacity-30 transition-all duration-150">Compare now</button>
              <button onClick={exitCompare} className="text-xs px-4 py-2 rounded border border-neutral-200 text-neutral-500 hover:border-neutral-300 transition-all duration-150">Cancel</button>
            </>
          )}
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-neutral-200/80 flex px-6 gap-1 flex-shrink-0">
          {[
            { key: "products", label: "Products", Icon: RiShoppingBag3Line },
            { key: "shops", label: "Shops", Icon: RiStore2Line },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); if (t.key === "shops") setSelectedId(null); }}
              className={`px-4 py-3.5 text-xs border-b-2 -mb-px transition-all duration-150 flex items-center gap-1.5 ${tab === t.key ? "border-[#1c1e2a] text-[#1c1e2a] font-medium" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
            >
              <t.Icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort bar */}
        {tab === "products" && !showCompareTable && (
          <div className="bg-neutral-50 border-b border-neutral-200/80 px-6 py-2 flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mr-1">Sort by</span>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`text-[11px] px-2.5 py-1 rounded transition-all duration-150 ${sortBy === s.key ? "bg-[#1c1e2a] text-white font-medium" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"}`}
              >
                {s.label}
              </button>
            ))}
            <div className="flex-1" />
            <div className="flex items-center border border-neutral-200 rounded overflow-hidden">
              {[
                { key: "big", Icon: RiGridFill, title: "Large grid" },
                { key: "medium", Icon: RiGridLine, title: "Medium grid" },
                { key: "list", Icon: RiListCheck, title: "List view" },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setViewMode(v.key)}
                  title={v.title}
                  className={`p-1.5 transition-all duration-150 ${viewMode === v.key ? "bg-[#1c1e2a] text-white" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"}`}
                >
                  <v.Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Products tab */}
            {tab === "products" && !showCompareTable && viewMode !== "list" && (
              <div className={viewMode === "big"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              }>
                {colProducts.map((p) => {
                  const statusCfg = STATUS_CONFIG[p.status];
                  const isWinner = p.status === "winner";
                  return (
                    <div
                      key={p.id}
                      onClick={() => compareMode ? toggleCompareId(p.id) : openProduct(p.id)}
                      className={`bg-white rounded overflow-hidden cursor-pointer relative transition-all duration-200 hover:-translate-y-0.5 group
                        ${selectedId === p.id ? "ring-2 ring-[#1c1e2a] shadow-lg" : isWinner ? "ring-1 ring-amber-300/60 shadow-sm" : "shadow-sm hover:shadow-md"}
                        ${compareMode && compareIds.has(p.id) ? "ring-2 ring-[#1c1e2a] shadow-lg" : ""}`}
                    >
                      {/* Compare checkbox */}
                      {compareMode && (
                        <div className={`absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-all duration-150 ${compareIds.has(p.id) ? "bg-[#1c1e2a] text-white" : "bg-white/90 border border-neutral-300 text-transparent"}`}>
                          <RiCheckLine size={12} />
                        </div>
                      )}
                      {/* Status badge */}
                      <span className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-medium z-10 flex items-center gap-0.5 ${statusCfg.cardCls}`}>
                        <statusCfg.Icon size={11} />
                        {(p.status === "winner" || p.status === "purchased") && statusCfg.label}
                      </span>
                      {/* Image */}
                      <div className={`w-full bg-neutral-100 relative overflow-hidden ${viewMode === "big" ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
                        {p.img ? (
                          <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ProductIcon type={p.icon} size={viewMode === "big" ? 56 : 44} className="text-neutral-300 group-hover:text-neutral-400 transition-colors duration-300" />
                          </div>
                        )}
                        {/* Stars overlay top-left */}
                        {!compareMode && (
                          <div className="absolute top-2.5 left-2.5 z-10 bg-white/80 backdrop-blur-sm rounded px-1 py-0.5">
                            <StarRating rating={p.rating} size={viewMode === "big" ? 14 : 12} onRate={(r) => updateProduct(p.id, { rating: r })} />
                          </div>
                        )}
                      </div>
                      {/* Body */}
                      <div className={viewMode === "big" ? "p-5" : "p-4"}>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">{p.shop}</p>
                        <p className={`font-medium text-[#1c1e2a] leading-snug mb-2.5 line-clamp-2 ${viewMode === "big" ? "text-[15px]" : "text-[13px]"}`} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{p.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-[#1c1e2a] ${viewMode === "big" ? "text-[17px]" : "text-[15px]"}`}>${p.price.toLocaleString()}</span>
                          {p.price < p.orig && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                              <RiArrowDownSLine size={11} />${p.orig - p.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List view */}
            {tab === "products" && !showCompareTable && viewMode === "list" && (
              <div className="flex flex-col gap-2">
                {colProducts.map((p) => {
                  const statusCfg = STATUS_CONFIG[p.status];
                  const isWinner = p.status === "winner";
                  return (
                    <div
                      key={p.id}
                      onClick={() => compareMode ? toggleCompareId(p.id) : openProduct(p.id)}
                      className={`bg-white rounded overflow-hidden cursor-pointer flex items-center gap-4 transition-all duration-150 hover:shadow-md group
                        ${selectedId === p.id ? "ring-2 ring-[#1c1e2a] shadow-lg" : isWinner ? "ring-1 ring-amber-300/60 shadow-sm" : "shadow-sm"}
                        ${compareMode && compareIds.has(p.id) ? "ring-2 ring-[#1c1e2a] shadow-lg" : ""}`}
                    >
                      {/* Compare checkbox */}
                      {compareMode && (
                        <div className={`ml-4 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 ${compareIds.has(p.id) ? "bg-[#1c1e2a] text-white" : "border border-neutral-300 text-transparent"}`}>
                          <RiCheckLine size={12} />
                        </div>
                      )}
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-neutral-100 flex-shrink-0 overflow-hidden">
                        {p.img ? (
                          <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ProductIcon type={p.icon} size={24} className="text-neutral-300" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 py-3 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[13px] font-medium text-[#1c1e2a] truncate" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{p.name}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5 flex-shrink-0 ${statusCfg.cardCls}`}>
                            <statusCfg.Icon size={10} />
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{p.shop}</p>
                      </div>
                      {/* Stars */}
                      <div className="flex-shrink-0">
                        <StarRating rating={p.rating} size={12} onRate={(r) => { updateProduct(p.id, { rating: r }); }} />
                      </div>
                      {/* Price */}
                      <div className="flex items-center gap-2 pr-5 flex-shrink-0">
                        <span className="text-[15px] font-semibold text-[#1c1e2a]">${p.price.toLocaleString()}</span>
                        {p.price < p.orig && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                            <RiArrowDownSLine size={11} />${p.orig - p.price}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Compare table */}
            {tab === "products" && showCompareTable && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setShowCompareTable(false)} className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors">
                    <RiArrowLeftLine size={14} />
                    Back
                  </button>
                  <h2 className="text-[15px] font-semibold text-[#1c1e2a]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                    Comparing {compareProducts.length} products
                  </h2>
                </div>
                <div className="overflow-x-auto bg-white rounded shadow-sm">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider w-8">#</th>
                        <th className="text-left py-3.5 px-4 w-12"></th>
                        <th className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Product</th>
                        <th className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Price</th>
                        <th className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Shop</th>
                        <th className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Status</th>
                        <th className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Rating</th>
                        <th className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Pros</th>
                        <th className="text-left py-3.5 px-4 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Cons</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compareProducts.map((p, i) => (
                        <tr key={p.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-semibold ${i === 0 ? "bg-amber-50 text-amber-700" : "bg-neutral-100 text-neutral-400"}`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden">
                              {p.img ? (
                                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ProductIcon type={p.icon} size={18} className="text-neutral-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-[#1c1e2a] max-w-32" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{p.name}</td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-[#1c1e2a]">${p.price.toLocaleString()}</span>
                            {p.price < p.orig && <div className="text-emerald-600 text-[11px] mt-0.5">was ${p.orig.toLocaleString()}</div>}
                          </td>
                          <td className="py-4 px-4 text-neutral-500">{p.shop}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center gap-1 ${STATUS_CONFIG[p.status].cardCls}`}>
                              {(() => { const Ic = STATUS_CONFIG[p.status].Icon; return <Ic size={11} />; })()}
                              {STATUS_CONFIG[p.status].label}
                            </span>
                          </td>
                          <td className="py-4 px-4"><StarRating rating={p.rating} size={12} interactive={false} /></td>
                          <td className="py-4 px-4 text-neutral-500 max-w-28">{p.pros.join(", ") || <span className="text-neutral-300">--</span>}</td>
                          <td className="py-4 px-4 text-neutral-500 max-w-28">{p.cons.join(", ") || <span className="text-neutral-300">--</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Shops tab */}
            {tab === "shops" && (
              <div>
                <p className="text-xs text-neutral-400 mb-5">Shops discovered for this collection. This list keeps growing even when products are removed.</p>
                <div className="bg-white rounded shadow-sm overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="text-left py-3.5 px-5 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Shop</th>
                        <th className="text-left py-3.5 px-5 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Domain</th>
                        <th className="text-left py-3.5 px-5 text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Products saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colShops.map((s) => (
                        <tr key={s.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3.5 px-5 font-medium text-[#1c1e2a] flex items-center gap-2.5">
                            <RiStore2Line size={15} className="text-neutral-400" />
                            {s.name}
                          </td>
                          <td className="py-3.5 px-5">
                            {s.domain ? (
                              <a href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#1c1e2a] transition-colors flex items-center gap-1.5 group">
                                {s.domain}
                                <RiExternalLinkLine size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            ) : <span className="text-neutral-300">--</span>}
                          </td>
                          <td className="py-3.5 px-5 text-neutral-500">{s.count > 0 ? `${s.count} product${s.count !== 1 ? "s" : ""}` : <span className="text-neutral-300">--</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2.5 mt-5">
                  <input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Shop name" className="flex-1 text-xs px-4 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400 transition-colors" />
                  <input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="URL (optional)" className="flex-[1.5] text-xs px-4 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400 transition-colors" />
                  <button onClick={addShop} className="px-5 py-2.5 bg-[#1c1e2a] text-white text-xs rounded hover:bg-[#2a2d3d] font-medium transition-colors">Add</button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer */}
          {selected && !compareMode && tab === "products" && (
            <aside className="w-80 flex-shrink-0 bg-white border-l border-neutral-200/80 flex flex-col overflow-hidden">
              {/* Image */}
              <div className="relative w-full aspect-[4/3] bg-neutral-100 flex-shrink-0 overflow-hidden">
                {selected.img ? (
                  <img src={selected.img} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ProductIcon type={selected.icon} size={64} className="text-neutral-300" />
                  </div>
                )}
                <button onClick={closeDrawer} className="absolute top-3 right-3 w-8 h-8 rounded bg-white/90 text-neutral-400 flex items-center justify-center hover:text-neutral-600 transition-colors shadow-sm">
                  <RiCloseLine size={18} />
                </button>
              </div>
              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                <div>
                  <p className="text-[10px] text-neutral-400 mb-1 font-medium uppercase tracking-wider">{selected.shop}</p>
                  <p className="text-[17px] font-semibold text-[#1c1e2a] leading-snug" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{selected.name}</p>
                </div>

                {/* Price + refresh */}
                <div className="bg-neutral-50 rounded p-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl font-bold text-[#1c1e2a]">${selected.price.toLocaleString()}</span>
                    <button onClick={refreshPrice} disabled={refreshing} className="text-[11px] text-neutral-500 bg-white border border-neutral-200 px-2.5 py-1 rounded hover:border-neutral-300 disabled:opacity-40 transition-all flex items-center gap-1 font-medium">
                      <RiRefreshLine size={12} className={refreshing ? "animate-spin" : ""} />
                      {refreshing ? "Checking" : "Refresh"}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {selected.price < selected.orig ? `Was $${selected.orig.toLocaleString()} \u00b7 saved $${selected.orig - selected.price}` : "Last checked: today"}
                  </p>
                </div>

                {/* Rating */}
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-3 font-medium">Your rating</p>
                  <StarRating rating={selected.rating} size={18} onRate={(r) => updateProduct(selected.id, { rating: r })} />
                  {!selected.rating && <p className="text-[11px] text-neutral-300 mt-1">Not rated yet</p>}
                </div>

                {/* Status pipeline */}
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-3 font-medium">Decision status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                      <button key={s} onClick={() => setStatus(s)} className={`text-[11px] px-3 py-1.5 rounded border transition-all duration-150 flex items-center gap-1.5 ${selected.status === s ? cfg.btnActive + " border-transparent font-medium" : "border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"}`}>
                        <cfg.Icon size={13} />
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-3 font-medium">Notes</p>
                  <textarea
                    value={selected.notes}
                    onChange={(e) => saveNotes(e.target.value)}
                    placeholder="What do you think about this one?..."
                    className="w-full text-xs border border-neutral-200 rounded p-3 bg-white resize-none focus:outline-none focus:border-neutral-400 leading-relaxed min-h-20 transition-colors"
                    rows={3}
                  />
                </div>

                {/* Pros & Cons */}
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-3 font-medium">Pros & Cons</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50/60 rounded p-3">
                      <p className="text-[11px] font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                        <RiThumbUpLine size={12} />
                        Pros
                      </p>
                      {selected.pros.map((pro, i) => (
                        <div key={i} className="text-xs text-neutral-600 flex gap-1.5 mb-1.5 items-start"><span className="text-emerald-500 flex-shrink-0">+</span>{pro}</div>
                      ))}
                      <button onClick={addPro} className="text-[11px] text-neutral-400 border border-dashed border-neutral-300 rounded px-2.5 py-1.5 w-full text-left hover:border-emerald-300 hover:text-emerald-600 mt-1 transition-all flex items-center gap-1">
                        <RiAddLine size={12} /> add
                      </button>
                    </div>
                    <div className="bg-red-50/60 rounded p-3">
                      <p className="text-[11px] font-semibold text-red-500 mb-2 flex items-center gap-1">
                        <RiThumbDownLine size={12} />
                        Cons
                      </p>
                      {selected.cons.map((con, i) => (
                        <div key={i} className="text-xs text-neutral-600 flex gap-1.5 mb-1.5 items-start"><span className="text-red-400 flex-shrink-0">&minus;</span>{con}</div>
                      ))}
                      <button onClick={addCon} className="text-[11px] text-neutral-400 border border-dashed border-neutral-300 rounded px-2.5 py-1.5 w-full text-left hover:border-red-300 hover:text-red-500 mt-1 transition-all flex items-center gap-1">
                        <RiAddLine size={12} /> add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Link */}
                <a href={selected.url} className="text-xs text-neutral-500 hover:text-[#1c1e2a] flex items-center gap-1.5 font-medium transition-colors">
                  <RiExternalLinkLine size={14} />
                  View on shop site
                </a>
              </div>
            </aside>
          )}
        </div>

        {/* Add URL bar */}
        <div className="bg-white border-t border-neutral-200/80 px-6 py-3.5 flex gap-2.5 flex-shrink-0">
          <div className="flex-1 flex items-center gap-2.5 border border-neutral-200 rounded bg-neutral-50 px-4 focus-within:border-neutral-400 focus-within:bg-white transition-all">
            <RiLink size={15} className="text-neutral-300 flex-shrink-0" />
            <input
              id="urlinput"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addProduct()}
              placeholder="Paste a product URL to add..."
              className="flex-1 text-xs py-2.5 bg-transparent focus:outline-none text-neutral-700 placeholder:text-neutral-400"
            />
          </div>
          <button onClick={addProduct} className="px-5 py-2.5 bg-[#1c1e2a] text-white text-xs rounded hover:bg-[#2a2d3d] font-medium transition-colors flex items-center gap-1.5">
            <RiAddLine size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
