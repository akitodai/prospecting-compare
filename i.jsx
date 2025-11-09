import React, { useState, useMemo } from "react";

// Prototype single-file React app for "Compare Item" system
// - TailwindCSS classes used for styling
// - Local state only (no backend)
// - Supports rarities, catalog (atalase), bandana/kalung/ring slots, add-item form

export default function App() {
  const DEFAULT_RING_SLOTS = 6;
  const ALL_STATS = [
    "dig_strength",
    "dig_speed",
    "shake_strength",
    "shake_speed",
    "capacity",
    "luck",
    "size_boost",
    "modifier_boost",
    "sell_boost",
    "inventory_size",
  ];

  const initialItems = [
    {
      id: "b1",
      name: "Bandana of Basics",
      rarity: "common",
      type: "bandana",
      img: "",
      stats: { dig_strength: 1, dig_speed: 0, shake_strength: 0, shake_speed: 0, capacity: 0, luck: 0, size_boost: 0, modifier_boost: 0, sell_boost: 0, inventory_size: 0 },
    },
    {
      id: "k1",
      name: "Kalung Copper",
      rarity: "uncommon",
      type: "kalung",
      img: "",
      stats: { dig_strength: 0, dig_speed: 1, shake_strength: 0, shake_speed: 0, capacity: 1, luck: 0, size_boost: 0, modifier_boost: 0, sell_boost: 0, inventory_size: 0 },
    },
    {
      id: "r1",
      name: "Ring of Luck",
      rarity: "rare",
      type: "cincin",
      img: "",
      stats: { dig_strength: 0, dig_speed: 0, shake_strength: 0, shake_speed: 0, capacity: 0, luck: 3, size_boost: 0, modifier_boost: 0, sell_boost: 0, inventory_size: 0 },
    },
    {
      id: "r2",
      name: "Ring of Capacity",
      rarity: "epic",
      type: "cincin",
      img: "",
      stats: { dig_strength: 0, dig_speed: 0, shake_strength: 0, shake_speed: 0, capacity: 5, luck: 0, size_boost: 0, modifier_boost: 0, sell_boost: 0, inventory_size: 0 },
    },
  ];

  const [items, setItems] = useState(initialItems);
  const [rarityFilter, setRarityFilter] = useState("all");
  const [ringSlotsCount, setRingSlotsCount] = useState(DEFAULT_RING_SLOTS);

  // equipped: { bandana: item|null, kalung: item|null, rings: [item|null,...] }
  const [equipped, setEquipped] = useState({ bandana: null, kalung: null, rings: Array(DEFAULT_RING_SLOTS).fill(null) });

  // Add / remove ring slots (toggle to 8)
  function toggleRingSlots() {
    if (ringSlotsCount === DEFAULT_RING_SLOTS) {
      setRingSlotsCount(8);
      setEquipped((e) => ({ ...e, rings: [...e.rings, ...Array(2).fill(null)] }));
    } else {
      setRingSlotsCount(DEFAULT_RING_SLOTS);
      setEquipped((e) => ({ ...e, rings: e.rings.slice(0, DEFAULT_RING_SLOTS) }));
    }
  }

  function handlePlaceItem(item) {
    if (item.type === "bandana") {
      setEquipped((e) => ({ ...e, bandana: item }));
    } else if (item.type === "kalung") {
      setEquipped((e) => ({ ...e, kalung: item }));
    } else if (item.type === "cincin") {
      // place in the first empty ring slot; if none empty, replace the first slot
      setEquipped((e) => {
        const rings = [...e.rings];
        const firstEmpty = rings.findIndex((r) => r === null);
        if (firstEmpty !== -1) rings[firstEmpty] = item;
        else rings[0] = item;
        return { ...e, rings };
      });
    }
  }

  function handleRemoveRing(index) {
    setEquipped((e) => {
      const rings = [...e.rings];
      rings.splice(index, 1); // remove that slot
      rings.push(null); // keep length stable by adding null at end
      // after removal we want earlier slots to be filled first: shift non-null to front
      const compact = rings.filter(Boolean);
      const filled = [...compact, ...Array(rings.length - compact.length).fill(null)];
      return { ...e, rings: filled };
    });
  }

  // Filtered list
  const filteredItems = useMemo(() => {
    return items.filter((it) => (rarityFilter === "all" ? true : it.rarity === rarityFilter));
  }, [items, rarityFilter]);

  // Stats aggregation
  const totalStats = useMemo(() => {
    const totals = {};
    ALL_STATS.forEach((s) => (totals[s] = 0));
    const gather = (it) => {
      if (!it) return;
      ALL_STATS.forEach((s) => {
        totals[s] += Number(it.stats[s] || 0);
      });
    };
    gather(equipped.bandana);
    gather(equipped.kalung);
    equipped.rings.forEach(gather);
    return totals;
  }, [equipped]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Compare Items — Prototype</h1>
        <p className="text-sm text-gray-600">Atalase • Slots • Admin input (local)</p>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <aside className="col-span-2 bg-white p-3 rounded shadow">
          <h2 className="font-semibold">Rarity</h2>
          <select className="w-full mt-2 p-2 border rounded" value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
            <option value="mythic">Mythic</option>
            <option value="exotic">Exotic</option>
          </select>

          <div className="mt-4">
            <h3 className="font-medium">Ring slots</h3>
            <p className="text-sm text-gray-500">Current: {ringSlotsCount}</p>
            <button className="mt-2 w-full p-2 bg-indigo-600 text-white rounded" onClick={toggleRingSlots}>{ringSlotsCount === DEFAULT_RING_SLOTS ? "Add 2 slots (→8)" : "Reset to 6 slots"}</button>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Admin</h3>
            <AdminInput ALL_STATS={ALL_STATS} onAdd={(newItem) => setItems((s) => [newItem, ...s])} />
          </div>
        </aside>

        {/* Catalog */}
        <main className="col-span-6 bg-white p-3 rounded shadow">
          <h2 className="font-semibold mb-2">Atalase (Catalog)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredItems.map((it) => (
              <div key={it.id} className="border rounded p-2 cursor-pointer hover:shadow" onClick={() => handlePlaceItem(it)}>
                <div className="h-20 bg-gray-50 rounded flex items-center justify-center mb-2">{it.img ? <img src={it.img} alt="" /> : <div className="text-xs text-gray-400">No image</div>}</div>
                <div className="text-sm font-medium">{it.name}</div>
                <div className="text-xs text-gray-500">{it.type} • {it.rarity}</div>
                <div className="mt-2 text-xs">
                  {ALL_STATS.map((s) => (
                    <div key={s} className="flex justify-between">
                      <span className="capitalize">{s.replaceAll("_", " ")}</span>
                      <span>{it.stats[s] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Slots + Stats */}
        <aside className="col-span-4 bg-white p-3 rounded shadow">
          <h2 className="font-semibold">Slots</h2>

          <div className="mt-3">
            <div className="mb-2">Bandana</div>
            <SlotCard item={equipped.bandana} placeholder="Bandana slot" onClickRemove={() => setEquipped((e) => ({ ...e, bandana: null }))} />
          </div>

          <div className="mt-3">
            <div className="mb-2">Kalung</div>
            <SlotCard item={equipped.kalung} placeholder="Kalung slot" onClickRemove={() => setEquipped((e) => ({ ...e, kalung: null }))} />
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center">
              <div className="mb-2">Cincin</div>
              <div className="text-sm text-gray-500">Slots: {ringSlotsCount}</div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {equipped.rings.map((it, idx) => (
                <div key={idx} className="border rounded p-2 bg-gray-50">
                  <div className="text-xs text-gray-600">Slot {idx + 1}</div>
                  <div className="mt-1">
                    {it ? (
                      <>
                        <div className="font-medium text-sm">{it.name}</div>
                        <div className="text-xs text-gray-500">{it.rarity}</div>
                        <button className="mt-2 text-xs text-red-600" onClick={() => handleRemoveRing(idx)}>Remove</button>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400">Empty</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold">Total Stats</h3>
            <div className="mt-2 text-sm">
              {ALL_STATS.map((s) => (
                <div key={s} className="flex justify-between">
                  <span className="capitalize">{s.replaceAll("_", " ")}</span>
                  <span>{totalStats[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SlotCard({ item, placeholder, onClickRemove }) {
  return (
    <div className="border rounded p-3 bg-gray-50">
      {item ? (
        <>
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-gray-500">{item.rarity}</div>
          <button className="mt-2 text-sm text-red-600" onClick={onClickRemove}>Unequip</button>
        </>
      ) : (
        <div className="text-gray-400">{placeholder}</div>
      )}
    </div>
  );
}

function AdminInput({ ALL_STATS, onAdd }) {
  const [form, setForm] = useState({ name: "", rarity: "common", type: "cincin", stats: {} });
  function updateStat(key, value) {
    setForm((f) => ({ ...f, stats: { ...f.stats, [key]: Number(value) } }));
  }
  function submit(e) {
    e.preventDefault();
    const id = (form.type[0] || "x") + Date.now();
    const newItem = { id, name: form.name || "Unnamed", rarity: form.rarity, type: form.type, img: "", stats: {} };
    ALL_STATS.forEach((s) => (newItem.stats[s] = form.stats[s] || 0));
    onAdd(newItem);
    setForm({ name: "", rarity: "common", type: "cincin", stats: {} });
  }
  return (
    <form onSubmit={submit} className="mt-2 space-y-2">
      <input className="w-full p-2 border rounded" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <div className="flex gap-2">
        <select className="flex-1 p-2 border rounded" value={form.rarity} onChange={(e) => setForm((f) => ({ ...f, rarity: e.target.value }))}>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
          <option value="mythic">Mythic</option>
          <option value="exotic">Exotic</option>
        </select>
        <select className="w-36 p-2 border rounded" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
          <option value="bandana">bandana</option>
          <option value="kalung">kalung</option>
          <option value="cincin">cincin</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto p-1 border rounded bg-white">
        {ALL_STATS.map((s) => (
          <div key={s} className="text-xs">
            <label className="block">{s.replaceAll("_", " ")}</label>
            <input type="number" className="w-full p-1 border rounded" value={form.stats[s] || ""} onChange={(e) => updateStat(s, e.target.value)} />
          </div>
        ))}
      </div>

      <button className="w-full p-2 bg-green-600 text-white rounded">Add item</button>
    </form>
  );
}


update kode ini agar lebih bagus komples serta dengan tampilan yang modern color full tapi simple dan interaktif