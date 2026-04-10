import { useState } from "react";

const INITIAL_PRODUCTS = {
  sofa: [
    { id: 1, name: "Enzo 3-Seater", shop: "IKEA", price: 1299, orig: 1299, e: "🛋️", status: "winner", pros: ["Great depth", "Easy clean"], cons: ["Limited colours"], notes: "Felt really comfy in store. 6 week delivery.", url: "#" },
    { id: 2, name: "Hugo Corner Sofa", shop: "Freedom", price: 2199, orig: 2399, e: "🛋️", status: "shortlisted", pros: ["Modular"], cons: ["Pricey"], notes: "Price dropped $200!", url: "#" },
    { id: 3, name: "Luxe Velvet 2.5-Seat", shop: "Koala", price: 1850, orig: 1850, e: "🛋️", status: "considering", pros: [], cons: [], notes: "", url: "#" },
    { id: 4, name: "Nova Sofa Bed", shop: "Fantastic Furniture", price: 899, orig: 899, e: "🛋️", status: "considering", pros: [], cons: ["Not as comfy"], notes: "Backup if guests come", url: "#" },
    { id: 5, name: "Arch Boucle Sofa", shop: "Temple & Webster", price: 1699, orig: 1699, e: "🛋️", status: "shortlisted", pros: ["Beautiful fabric"], cons: ["Hard to clean"], notes: "", url: "#" },
    { id: 6, name: "Drift 3-Seater", shop: "Koala", price: 1599, orig: 1799, e: "🛋️", status: "purchased", pros: ["100 night trial"], cons: [], notes: "Bought! Arrives Fri 18th", url: "#" },
  ],
  desk: [
    { id: 7, name: "FlexiSpot E7 Pro", shop: "FlexiSpot", price: 649, orig: 649, e: "🖥️", status: "winner", pros: ["Solid frame", "Quiet motor"], cons: ["Heavy assembly"], notes: "Best price/quality ratio", url: "#" },
    { id: 8, name: "Uplift V2", shop: "Uplift", price: 1200, orig: 1200, e: "🖥️", status: "considering", pros: ["Best warranty"], cons: ["Expensive"], notes: "", url: "#" },
    { id: 9, name: "IKEA Trotten", shop: "IKEA", price: 449, orig: 449, e: "🖥️", status: "considering", pros: ["Cheap"], cons: ["Manual crank only"], notes: "", url: "#" },
    { id: 10, name: "Omnidesk Pro 2", shop: "Omnidesk", price: 799, orig: 899, e: "🖥️", status: "shortlisted", pros: [], cons: [], notes: "", url: "#" },
  ],
  coffee: [
    { id: 11, name: "Breville Barista Express", shop: "Harvey Norman", price: 899, orig: 899, e: "☕", status: "winner", pros: ["Built-in grinder"], cons: ["Counter space"], notes: "", url: "#" },
    { id: 12, name: "DeLonghi Dedica", shop: "The Good Guys", price: 399, orig: 499, e: "☕", status: "considering", pros: ["Slim profile"], cons: ["No grinder"], notes: "", url: "#" },
    { id: 13, name: "Nespresso Vertuo", shop: "JB Hi-Fi", price: 249, orig: 249, e: "☕", status: "considering", pros: ["Easy pods"], cons: ["Ongoing pod cost"], notes: "", url: "#" },
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
  { id: "sofa", name: "Living Room Sofa", color: "#1D9E75" },
  { id: "desk", name: "Standing Desk", color: "#378ADD" },
  { id: "coffee", name: "Coffee Machine", color: "#BA7517" },
];

const STATUS_CONFIG = {
  considering: { label: "Considering", badgeCls: "bg-gray-100 text-gray-500", btnCls: "bg-gray-100 text-gray-600" },
  shortlisted: { label: "Shortlisted", badgeCls: "bg-blue-100 text-blue-700", btnCls: "bg-blue-100 text-blue-700" },
  winner: { label: "Winner 👑", badgeCls: "bg-amber-100 text-amber-700", btnCls: "bg-amber-100 text-amber-700" },
  purchased: { label: "Purchased ✓", badgeCls: "bg-green-100 text-green-700", btnCls: "bg-green-100 text-green-700" },
};

export default function Shelft() {
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

  const colProducts = products[col] || [];
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
    if (compareMode) return;
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
      e: "📦",
      status: "considering",
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
    const domain = shopUrl ? shopUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0] : "—";
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
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-sm">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-52 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-lg font-medium tracking-tight">shel<span className="text-emerald-600">ft</span></span>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          <p className="px-4 pt-2 pb-1 text-xs text-gray-400 uppercase tracking-widest">Collections</p>
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => switchCollection(c.id)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm border-l-2 transition-colors ${col === c.id ? "text-emerald-700 bg-emerald-50 border-emerald-500 font-medium" : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-800"}`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{(products[c.id] || []).length}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button className="w-full py-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors">
            + New collection
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3 flex-shrink-0">
          <button className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <h1 className="flex-1 font-medium text-gray-900 truncate">
            {COLLECTIONS.find((c) => c.id === col)?.name}
          </h1>
          {!compareMode ? (
            <>
              <button onClick={startCompare} className="text-xs px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">Compare</button>
              <button onClick={() => document.getElementById("urlinput")?.focus()} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors">+ Add product</button>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-500">{compareIds.size} selected</span>
              <button onClick={doCompare} disabled={compareIds.size < 2} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium disabled:opacity-40 transition-colors">Compare now</button>
              <button onClick={exitCompare} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            </>
          )}
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 flex px-4 flex-shrink-0">
          {["products", "shops"].map((t) => (
            <button key={t} onClick={() => { setTab(t); if (t === "shops") setSelectedId(null); }} className={`px-4 py-2.5 text-xs capitalize border-b-2 -mb-px transition-colors ${tab === t ? "border-emerald-500 text-emerald-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{t}</button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {/* Products tab */}
            {tab === "products" && !showCompareTable && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {colProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => compareMode ? toggleCompareId(p.id) : openProduct(p.id)}
                    className={`bg-white rounded-xl overflow-hidden cursor-pointer relative transition-all duration-150 hover:-translate-y-px
                      ${selectedId === p.id ? "ring-2 ring-emerald-500" : p.status === "winner" ? "ring-2 ring-amber-300" : "border border-gray-200 hover:border-gray-300"}
                      ${compareMode && compareIds.has(p.id) ? "ring-2 ring-emerald-500" : ""}`}
                  >
                    {/* Compare checkbox */}
                    {compareMode && (
                      <div className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs z-10 border-2 border-white shadow-sm transition-colors ${compareIds.has(p.id) ? "bg-emerald-500 text-white" : "bg-black bg-opacity-25 text-white"}`}>
                        {compareIds.has(p.id) && "✓"}
                      </div>
                    )}
                    {/* Status badge */}
                    <span className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full font-medium z-10 ${STATUS_CONFIG[p.status].badgeCls}`}>
                      {p.status === "winner" ? "👑" : p.status === "purchased" ? "✓" : p.status}
                    </span>
                    {/* Image */}
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-4xl">
                      {p.e}
                    </div>
                    {/* Body */}
                    <div className="p-2.5">
                      <p className="text-xs text-gray-400 mb-0.5">{p.shop}</p>
                      <p className="text-xs font-medium text-gray-900 leading-tight mb-1.5 line-clamp-2">{p.name}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">${p.price.toLocaleString()}</span>
                        {p.price < p.orig && (
                          <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">↓${p.orig - p.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compare table */}
            {tab === "products" && showCompareTable && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setShowCompareTable(false)} className="text-xs text-gray-500 hover:text-gray-800">← Back to grid</button>
                  <h2 className="text-sm font-medium text-gray-900">Comparing {compareProducts.length} products</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-gray-400 font-normal w-8">#</th>
                        <th className="text-left py-2 px-3 text-gray-400 font-normal w-14"></th>
                        <th className="text-left py-2 px-3 text-gray-400 font-normal">Product</th>
                        <th className="text-left py-2 px-3 text-gray-400 font-normal">Price</th>
                        <th className="text-left py-2 px-3 text-gray-400 font-normal">Shop</th>
                        <th className="text-left py-2 px-3 text-gray-400 font-normal">Status</th>
                        <th className="text-left py-2 px-3 text-gray-400 font-normal">Pros</th>
                        <th className="text-left py-2 px-3 text-gray-400 font-normal">Cons</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compareProducts.map((p, i) => (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3">
                            <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-medium ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">{p.e}</div>
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-900 max-w-32">{p.name}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-gray-900">${p.price.toLocaleString()}</span>
                            {p.price < p.orig && <div className="text-emerald-700 text-xs">was ${p.orig.toLocaleString()}</div>}
                          </td>
                          <td className="py-3 px-3 text-gray-500">{p.shop}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[p.status].badgeCls}`}>{STATUS_CONFIG[p.status].label}</span>
                          </td>
                          <td className="py-3 px-3 text-gray-500 max-w-28">{p.pros.join(", ") || "—"}</td>
                          <td className="py-3 px-3 text-gray-500 max-w-28">{p.cons.join(", ") || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Shops tab */}
            {tab === "shops" && (
              <div className="max-w-xl">
                <p className="text-xs text-gray-500 mb-4">Shops discovered for this collection. Persists even when products are removed — an ever-growing reference list.</p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-400 font-normal">Shop</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-normal">Domain</th>
                      <th className="text-left py-2 px-3 text-gray-400 font-normal">Products saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colShops.map((s) => (
                      <tr key={s.id} className="border-b border-gray-100">
                        <td className="py-2.5 px-3 font-medium text-gray-800">🏪 {s.name}</td>
                        <td className="py-2.5 px-3 text-gray-400">{s.domain}</td>
                        <td className="py-2.5 px-3 text-gray-500">{s.count > 0 ? `${s.count} product${s.count !== 1 ? "s" : ""}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex gap-2 mt-3">
                  <input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Shop name" className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg bg-transparent focus:outline-none focus:border-emerald-400" />
                  <input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="URL (optional)" className="flex-[1.5] text-xs px-3 py-2 border border-gray-200 rounded-lg bg-transparent focus:outline-none focus:border-emerald-400" />
                  <button onClick={addShop} className="px-3 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 font-medium">Add</button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer */}
          {selected && !compareMode && tab === "products" && (
            <aside className="w-72 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
              {/* Image */}
              <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center text-6xl flex-shrink-0">
                {selected.e}
                <button onClick={closeDrawer} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black bg-opacity-40 text-white flex items-center justify-center text-xs hover:bg-opacity-60">✕</button>
              </div>
              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{selected.shop}</p>
                  <p className="text-sm font-medium text-gray-900 leading-snug">{selected.name}</p>
                </div>

                {/* Price + refresh */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-semibold text-gray-900">${selected.price.toLocaleString()}</span>
                    <button onClick={refreshPrice} disabled={refreshing} className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full hover:bg-emerald-100 disabled:opacity-50 transition-colors">
                      {refreshing ? "Checking..." : "↻ Refresh price"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    {selected.price < selected.orig ? `Was $${selected.orig.toLocaleString()} · saved $${selected.orig - selected.price}` : "Last checked: today"}
                  </p>
                </div>

                {/* Status pipeline */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Decision status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                      <button key={s} onClick={() => setStatus(s)} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selected.status === s ? cfg.btnCls + " border-transparent font-medium" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Notes</p>
                  <textarea
                    value={selected.notes}
                    onChange={(e) => saveNotes(e.target.value)}
                    placeholder="What do you think about this one?..."
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-transparent resize-none focus:outline-none focus:border-emerald-400 leading-relaxed min-h-16"
                    rows={3}
                  />
                </div>

                {/* Pros & Cons */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Pros & Cons</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-1.5">Pros</p>
                      {selected.pros.map((pro, i) => (
                        <div key={i} className="text-xs text-gray-600 flex gap-1 mb-1"><span className="text-green-600 flex-shrink-0">+</span>{pro}</div>
                      ))}
                      <button onClick={addPro} className="text-xs text-gray-400 border border-dashed border-gray-300 rounded-md px-2 py-1 w-full text-left hover:border-gray-400 hover:text-gray-600 mt-1">+ add pro</button>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-1.5">Cons</p>
                      {selected.cons.map((con, i) => (
                        <div key={i} className="text-xs text-gray-600 flex gap-1 mb-1"><span className="text-red-500 flex-shrink-0">−</span>{con}</div>
                      ))}
                      <button onClick={addCon} className="text-xs text-gray-400 border border-dashed border-gray-300 rounded-md px-2 py-1 w-full text-left hover:border-gray-400 hover:text-gray-600 mt-1">+ add con</button>
                    </div>
                  </div>
                </div>

                {/* Link */}
                <a href={selected.url} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <svg width="11" height="11" fill="none" viewBox="0 0 12 12"><path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 1h3v3M11 1 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  View on shop site
                </a>
              </div>
            </aside>
          )}
        </div>

        {/* Add URL bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-2.5 flex gap-2 flex-shrink-0">
          <input
            id="urlinput"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProduct()}
            placeholder="Paste a product URL to add..."
            className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg bg-transparent focus:outline-none focus:border-emerald-400"
          />
          <button onClick={addProduct} className="px-4 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 font-medium transition-colors">Add</button>
        </div>
      </div>
    </div>
  );
}
