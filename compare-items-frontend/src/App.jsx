import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import goldring from "./assets/ring_gold.png";

const ALL_STATS = [
  "dig_strength", "dig_speed", "shake_strength", "shake_speed",
  "capacity", "luck", "size_boost", "modifier_boost",
  "sell_boost", "inventory_size",
];

// 💡 Stats yang pakai persen
const PERCENT_STATS = ["dig_speed", "shake_speed", "size_boost", "modifier_boost", "sell_boost"];

const RARITY_COLORS = {
  common: "#9ca3af", uncommon: "#10b981", rare: "#3b82f6",
  epic: "#8b5cf6", legendary: "#f59e0b", mythic: "#ef4444", exotic: "#f97316",
};

const DEFAULT_RING_SLOTS = 6;

// 🎒 Semua item tetap sama, tapi data di-load fresh (tanpa localStorage)
const DEFAULT_INITIAL_ITEMS = [
  // 🌱 Common
  { id: "001", name: "Gold Ring", rarity: "common", type: "cincin", img: "/src/assets/ring_gold.png", percent: 100, stats: { luck: { min: 0.3, max: 0.8 } } },
  { id: "002", name: "Amethyst Pendant", rarity: "common", type: "kalung", img: "/assets/pendant_amethyst.png", percent: 100, stats: { luck: { min: 1, max: 2.5 }, sell_boost: { min: 0, max: 15 } } },
  { id: "003", name: "Garden Glove", rarity: "common", type: "bandana", img: "/assets/bandana_garden.png", percent: 100, stats: { dig_strength: { min: 0.2, max: 1 }, capacity: { min: 0, max: 5 }, inventory_size: { min: 10, max: 50 } } },
  { id: "004", name: "Titanium Ring", rarity: "common", type: "cincin", img: "/assets/ring_titanium.png", percent: 100, stats: { capacity: { min: 1, max: 13 } } },

  // 💎 Uncommon
  { id: "006", name: "Smoke Ring", rarity: "uncommon", type: "cincin", img: "/assets/ring_smoke.png", percent: 100, stats: { inventory_size: { min: 10, max: 40 }, modifier_boost: { min: 5, max: 15 } } },
  { id: "007", name: "Pearl Necklace", rarity: "uncommon", type: "kalung", img: "/assets/necklace_pearl.png", percent: 100, stats: { luck: { min: 2, max: 5 }, dig_strength: { min: 0, max: 4 } } },
  { id: "008", name: "Jade Armband", rarity: "uncommon", type: "bandana", img: "/assets/bandana_jade.png", percent: 100, stats: { luck: { min: 2, max: 9 }, capacity: { min: 1, max: 10 }, inventory_size: { min: 10, max: 70 } } },
  { id: "009", name: "Topaz Necklace", rarity: "uncommon", type: "kalung", img: "/assets/necklace_topaz.png", percent: 100, stats: { luck: { min: 1, max: 5 }, dig_strength: { min: 1, max: 4 }, shake_strength: { min: 0.2, max: 1 } } },
  
  // 💠 Rare
  { id: "010", name: "Opal Amulet", rarity: "rare", type: "kalung", img: "/assets/necklace_opal.png", percent: 100, stats: { luck: { min: 5, max: 16 }, inventory_size: { min: 10, max: 80 }, modifier_boost: { min: 0, max: 90 } } },
  { id: "011", name: "Moon Ring", rarity: "rare", type: "cincin", img: "/assets/ring_moon.png", percent: 100, stats: { luck: { min: 1, max: 7 }, dig_speed: { min: 10, max: 40 }, shake_speed: { min: 10, max: 40 } } },
  { id: "012", name: "Gravity Coil", rarity: "rare", type: "bandana", img: "/assets/bandana_gravity.png", percent: 100, stats: { capacity: { min: 10, max: 140 }, inventory_size: { min: 10, max: 250 } } },
  { id: "013", name: "Heart of the Ocean", rarity: "rare", type: "cincin", img: "/assets/ring_ocean.png", percent: 100, stats: { luck: { min: 3, max: 10 }, shake_speed: { min: 0, max: 20 }, sell_boost: { min: 10, max: 20 } } },
  
  // 💠 Epic
  { id: "014", name: "Ruby Ring", rarity: "epic", type: "cincin", img: "/assets/ring_ruby.png", percent: 100, stats: { luck: { min: 2, max: 6 }, size_boost: { min: 0, max: 18 } } },
  { id: "015", name: "Lapis Armband", rarity: "epic", type: "bandana", img: "/assets/bandana_lapis.png", percent: 100, stats: { luck: { min: 3, max: 10 }, dig_speed: { min: 0, max: 40 }, shake_speed: { min: 0, max: 40 }, inventory_size: { min: 10, max: 70 } } },
  { id: "016", name: "Speed Coil", rarity: "epic", type: "bandana", img: "/assets/bandana_speed.png", percent: 100, stats: { dig_speed: { min: 0, max: 70 }, shake_speed: { min: 0, max: 70 } } },
  { id: "017", name: "Meteor Ring", rarity: "epic", type: "cincin", img: "/assets/ring_meteor.png", percent: 100, stats: { dig_strength: { min: 0.5, max: 3 }, shake_strength: { min: 0, max: 1 }, inventory_size: { min: 10, max: 50 } } },
  
  // 💠 Legendary
  
  { id: "018", name: "Guiding Light", rarity: "legendary", type: "bandana", img: "/assets/bandana_guiding_light.png", percent: 100, stats: { luck: { min: 5, max: 20 }, capacity: { min: 10, max: 40 }, inventory_size: { min: 50, max: 200 }, modifier_boost: { min: 0, max: 45 } } },
  { id: "019", name: "Lightkeeper's Ring", rarity: "legendary", type: "cincin", img: "/assets/ring_lightkeeper.png", percent: 100, stats: { dig_speed: { min: 5, max: 25 }, inventory_size: { min: 30, max: 100 }, sell_boost: { min: 5, max: 25 }, modifier_boost: { min: 5, max: 25 } } },
  { id: "020", name: "Mass Accumulator", rarity: "legendary", type: "kalung", img: "/assets/necklace_mass_accumulator.png", percent: 100, stats: { capacity: { min: 20, max: 60 }, inventory_size: { min: 150, max: 400 }, size_boost: { min: 10, max: 80 } } },
  { id: "021", name: "Crown", rarity: "legendary", type: "bandana", img: "/assets/bandana_crown.png", percent: 100, stats: { luck: { min: 5, max: 30 }, size_boost: { min: 0, max: 45 }, sell_boost: { min: 0, max: 90 } } },
  { id: "022", name: "Ring of Harvest", rarity: "legendary", type: "cincin", img: "/assets/ring_harvest.png", percent: 100, stats: { luck: { min: 5, max: 18 }, capacity: { min: 10, max: 30 }, inventory_size: { min: 10, max: 40 }, walk_speed: { min: 0.5, max: 1 } } },
  { id: "023", name: "Dragon Claw", rarity: "legendary", type: "bandana", img: "/assets/bandana_dragon_claw.png", percent: 100, stats: { dig_strength: { min: 10, max: 30 }, shake_strength: { min: 1, max: 8 }, inventory_size: { min: 100, max: 400 } } },
  
  // 💠 Mythic
  { id: "024", name: "Royal Federation Crown", rarity: "mythic", type: "bandana", img: "/assets/bandana_royal_federation.png", percent: 100, stats: { luck: { min: 10, max: 90 }, size_boost: { min: 0, max: 90 }, sell_boost: { min: 0, max: 180 } } },
  { id: "025", name: "Phoenix Heart", rarity: "mythic", type: "kalung", img: "/assets/necklace_phoenix_heart.png", percent: 100, stats: { luck: { min: 100, max: 300 }, inventory_size: { min: 100, max: 400 }, size_boost: { min: -70, max: -40 } } },
  { id: "026", name: "Celestial Rings", rarity: "mythic", type: "kalung", img: "/assets/necklace_celestial_rings.png", percent: 100, stats: { luck: { min: 30, max: 90 }, capacity: { min: 50, max: 250 }, size_boost: { min: 0, max: 45 }, modifier_boost: { min: 20, max: 140 } } },
  { id: "027", name: "Apocalypse Bringer", rarity: "mythic", type: "cincin", img: "/assets/ring_apocalypse.png", percent: 100, stats: { dig_strength: { min: 5, max: 20 }, luck: { min: 10, max: 40 }, shake_strength: { min: 2, max: 5 }, sell_boost: { min: 10, max: 40 } } },
  { id: "028", name: "Amulet of Spirits", rarity: "mythic", type: "kalung", img: "/assets/necklace_spirits.png", percent: 100, stats: { luck: { min: 50, max: 140 }, dig_speed: { min: 20, max: 40 }, shake_speed: { min: 20, max: 40 }, size_boost: { min: 10, max: 30 } } },
  { id: "029", name: "Mythril Ring", rarity: "mythic", type: "cincin", img: "/assets/ring_mythril.png", percent: 100, stats: { luck: { min: 20, max: 80 }, dig_speed: { min: 20, max: 40 }, shake_speed: { min: 20, max: 40 }, sell_boost: { min: 5, max: 24 } } },
  { id: "030", name: "Phoenix Wings", rarity: "mythic", type: "bandana", img: "/assets/bandana_phoenix_wings.png", percent: 100, stats: { luck: { min: 100, max: 300 }, capacity: { min: -80, max: -40 }, inventory_size: { min: 100, max: 400 } } },
  { id: "031", name: "Prismatic Star", rarity: "mythic", type: "cincin", img: "/assets/ring_prismatic_star.png", percent: 100, stats: { luck: { min: 5, max: 20 }, dig_strength: { min: 2, max: 10 }, capacity: { min: 10, max: 40 }, dig_speed: { min: 5, max: 20 }, shake_strength: { min: 1, max: 3 }, inventory_size: { min: 15, max: 50 }, shake_speed: { min: 5, max: 20 }, sell_boost: { min: 10, max: 20 }, size_boost: { min: 5, max: 20 }, modifier_boost: { min: 5, max: 20 } } },
  { id: "032", name: "Cryogenic Preserver", rarity: "mythic", type: "bandana", img: "/assets/bandana_cryogenic_preserver.png", percent: 100, stats: { luck: { min: 100, max: 250 }, shake_strength: { min: 10, max: 40 }, shake_speed: { min: -40, max: -20 }, sell_boost: { min: 0, max: 50 } } },
  { id: "033", name: "Ring of Thorns", rarity: "mythic", type: "cincin", img: "/assets/ring_thorns.png", percent: 100, stats: { luck: { min: 20, max: 100 }, dig_strength: { min: 5, max: 40 }, inventory_size: { min: 40, max: 150 }, size_boost: { min: 20, max: 50 }, modifier_boost: { min: 20, max: 60 } } },
  { id: "034", name: "Solar Ring", rarity: "mythic", type: "cincin", img: "/assets/ring_solar.png", percent: 100, stats: { luck: { min: 20, max: 100 }, dig_strength: { min: 2, max: 8 }, dig_speed: { min: -30, max: -10 }, shake_strength: { min: 0, max: 2 }, shake_speed: { min: -30, max: -10 }, modifier_boost: { min: 5, max: 20 } } },
  { id: "035", name: "Amulet of Life", rarity: "mythic", type: "kalung", img: "/assets/necklace_amulet_life.png", percent: 100, stats: { luck: { min: 200, max: 400 }, modifier_boost: { min: 50, max: 150 } } },
  { id: "036", name: "Candy Sack", rarity: "mythic", type: "bandana", img: "/assets/bandana_candy_sack.png", percent: 100, stats: { luck: { min: 30, max: 100 }, capacity: { min: 100, max: 300 }, inventory_size: { min: 300, max: 1000 }, size_boost: { min: 30, max: 70 } } },
  { id: "037", name: "Solar Crown", rarity: "mythic", type: "bandana", img: "/assets/bandana_solar_crown.png", percent: 100, stats: { luck: { min: 20, max: 100 }, capacity: { min: 10, max: 80 }, modifier_boost: { min: 10, max: 40 }, sell_boost: { min: 5, max: 25 } } },
  
  // 💠 Exotic
  { id: "038", name: "Witch Hat", rarity: "exotic", type: "bandana", img: "/assets/bandana_witch_hat.png", percent: 100, stats: { luck: { min: 400, max: 1000 }, inventory_size: { min: 100, max: 400 }, modifier_boost: { min: 40, max: 100 }, walk_speed: { min: 1, max: 5 } } },
  { id: "039", name: "Fossilized Crown", rarity: "exotic", type: "bandana", img: "/assets/bandana_fossilized_crown.png", percent: 100, stats: { luck: { min: 100, max: 250 }, capacity: { min: 50, max: 200 }, shake_speed: { min: 10, max: 30 }, size_boost: { min: 0, max: 100 }, sell_boost: { min: 0, max: 100 } } },
  { id: "040", name: "Frostthorn Pendant", rarity: "exotic", type: "kalung", img: "/assets/necklace_frostthorn.png", percent: 100, stats: { luck: { min: 100, max: 400 }, dig_strength: { min: 100, max: 200 }, capacity: { min: 50, max: 200 }, dig_speed: { min: -50, max: -30 }, size_boost: { min: 30, max: 100 } } },
  { id: "041", name: "Pumpkin Lord", rarity: "exotic", type: "bandana", img: "/assets/bandana_pumpkin_lord.png", percent: 100, stats: { dig_strength: { min: 80, max: 200 }, shake_strength: { min: 20, max: 50 }, inventory_size: { min: 200, max: 500 }, size_boost: { min: 30, max: 180 }, walk_speed: { min: 1, max: 4 } } },
  { id: "042", name: "Antlers of Life", rarity: "exotic", type: "bandana", img: "/assets/bandana_antlers_life.png", percent: 100, stats: { dig_speed: { min: 10, max: 40 }, luck: { min: 100, max: 580 }, size_boost: { min: 20, max: 60 }, modifier_boost: { min: 50, max: 200 } } },
  { id: "043", name: "Vortex Ring", rarity: "exotic", type: "cincin", img: "/assets/ring_vortex.png", percent: 100, stats: { dig_strength: { min: 20, max: 80 }, luck: { min: 50, max: 140 }, capacity: { min: 100, max: 300 }, shake_strength: { min: 3, max: 10 } } },
  { id: "044", name: "Umbrite Ring", rarity: "exotic", type: "cincin", img: "/assets/ring_umbrite.png", percent: 100, stats: { luck: { min: 50, max: 220 }, dig_strength: { min: 5, max: 40 }, capacity: { min: 10, max: 100 }, shake_strength: { min: 2, max: 10 }, size_boost: { min: 5, max: 15 } } }

];

export default function App() {
  const [items] = useState(DEFAULT_INITIAL_ITEMS);
  const [equipped, setEquipped] = useState({
    bandana: null,
    kalung: null,
    rings: Array(DEFAULT_RING_SLOTS).fill(null),
  });

  // 🌙 Dark mode system-aware
  const getSystemPref = () =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return getSystemPref();
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e) => {
      if (!localStorage.getItem("theme")) setDarkMode(e.matches);
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const [rarityFilter, setRarityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [ringSlotsCount, setRingSlotsCount] = useState(DEFAULT_RING_SLOTS);

  const getCatalogItemById = (id) => items.find((it) => it.id === id) || null;

  function createInstanceFromCatalogItem(base) {
    const instanceId = base.id + "_inst_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
    return {
      instanceId, baseId: base.id, name: base.name, rarity: base.rarity, type: base.type,
      img: base.img, percent: base.percent ?? 100, stats: JSON.parse(JSON.stringify(base.stats)),
    };
  }

  function equipByCatalogId(catalogId) {
    const base = getCatalogItemById(catalogId);
    if (!base) return;
    const instance = createInstanceFromCatalogItem(base);
    setEquipped((prev) => {
      if (instance.type === "bandana") return { ...prev, bandana: instance };
      if (instance.type === "kalung") return { ...prev, kalung: instance };
      if (instance.type === "cincin") {
        const rings = [...prev.rings];
        const empty = rings.findIndex((r) => r === null);
        const idx = empty !== -1 ? empty : 0;
        rings[idx] = instance;
        return { ...prev, rings };
      }
      return prev;
    });
  }

  function unequipSlot(slotType, index = null) {
    setEquipped((prev) => {
      if (slotType === "bandana") return { ...prev, bandana: null };
      if (slotType === "kalung") return { ...prev, kalung: null };
      if (slotType === "rings") {
        const rings = [...prev.rings];
        rings[index] = null;
        const compact = [...rings.filter(Boolean), ...Array(rings.length - rings.filter(Boolean).length).fill(null)];
        return { ...prev, rings: compact };
      }
      return prev;
    });
  }

  function updateEquippedPercent(instanceId, newPercent) {
    setEquipped((prev) => {
      const p = Math.max(0, Math.min(100, Number(newPercent)));
      const update = (i) => (i && i.instanceId === instanceId ? { ...i, percent: p } : i);
      return {
        bandana: update(prev.bandana),
        kalung: update(prev.kalung),
        rings: prev.rings.map(update),
      };
    });
  }

  function toggleRingSlots() {
    if (ringSlotsCount === DEFAULT_RING_SLOTS) {
      setRingSlotsCount(8);
      setEquipped((e) => ({ ...e, rings: [...e.rings, ...Array(2).fill(null)] }));
    } else {
      setRingSlotsCount(DEFAULT_RING_SLOTS);
      setEquipped((e) => ({ ...e, rings: e.rings.slice(0, DEFAULT_RING_SLOTS) }));
    }
  }

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return items.filter(
      (it) =>
        (rarityFilter === "all" || it.rarity === rarityFilter) &&
        it.name.toLowerCase().includes(term)
    );
  }, [items, rarityFilter, searchTerm]);

  function scaled(min = 0, max = 0, percent = 100) {
    const p = Math.min(Math.max(percent, 0), 100) / 100;
    return Math.round(min + (max - min) * p);
  }

  function statColorClass(v) {
    if (v > 0) return "positive";
    if (v < 0) return "negative";
    return "neutral";
  }

  const totalStats = useMemo(() => {
    const totals = {};
    ALL_STATS.forEach((s) => (totals[s] = 0));
    const add = (i) => {
      if (!i) return;
      Object.entries(i.stats).forEach(([k, r]) => {
        totals[k] = (totals[k] || 0) + scaled(r.min, r.max, i.percent || 100);
      });
    };
    add(equipped.bandana);
    add(equipped.kalung);
    equipped.rings.forEach(add);
    return totals;
  }, [equipped]);

  const rarityList = ["all", ...Object.keys(RARITY_COLORS)];

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>🎒 Compare Items System</h1>
        <p className="subtitle">Catalog • Equip Instances • Auto Dark Mode</p>
        <button className="dark-toggle" onClick={() => setDarkMode((v) => !v)}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="layout">
        {/* Catalog */}
        <main className="catalog">
          <h2>📜 Catalog</h2>
          <div className="search-filter-box">
            <input
              className="search-input"
              placeholder="Search item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="filter-buttons">
              {rarityList.map((r) => (
                <button
                  key={r}
                  className={`filter-btn ${rarityFilter === r ? "active" : ""}`}
                  onClick={() => setRarityFilter(r)}
                >
                  {r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-grid">
            {filteredItems.map((it) => (
              <div
                key={it.id}
                className={`item-card ${it.rarity}`}
                style={{ borderColor: RARITY_COLORS[it.rarity] }}
                onClick={() => equipByCatalogId(it.id)}
              >
                <div className="item-header">
                  <div className="item-name">{it.name}</div>
                  <div className="item-rarity">{it.rarity}</div>
                </div>
                <div className="item-content">
                  <div className="item-stats">
                    {Object.entries(it.stats).map(([k, range]) => {
                      const val = scaled(range.min, range.max, it.percent || 100);
                      const cls = statColorClass(val);
                      const hasPercent = PERCENT_STATS.includes(k);
                      return (
                        <div key={k} className={`stat-line ${cls}`}>
                          {k.replaceAll("_", " ")} {val > 0 ? "+" : ""}{val}{hasPercent ? "%" : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="item-image-box">
                    <img src={it.img || "/assets/default_icon.png"} alt={it.name} className="item-image" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Slots */}
        <aside className="slots">
          <div className="slots-header">
            <h2>⚙️ Equipped Slots</h2>
            <div className="slots-controls">
              <div className="slot-info">Rings: {ringSlotsCount}</div>
              <button className="btn small" onClick={toggleRingSlots}>
                {ringSlotsCount === DEFAULT_RING_SLOTS ? "Add 2 Slots" : "Reset to 6"}
              </button>
            </div>
          </div>

          <SlotCardInstance label="Bandana" instance={equipped.bandana} onUnequip={() => unequipSlot("bandana")} onPercentChange={(p) => equipped.bandana && updateEquippedPercent(equipped.bandana.instanceId, p)} />
          <SlotCardInstance label="Kalung" instance={equipped.kalung} onUnequip={() => unequipSlot("kalung")} onPercentChange={(p) => equipped.kalung && updateEquippedPercent(equipped.kalung.instanceId, p)} />

          <div className="slot-block">
            <h3 className="sub-title">Cincin</h3>
            <div className="rings-grid">
              {equipped.rings.map((inst, idx) => (
                <div key={idx} className="ring-slot-card">
                  {inst ? (
                    <>
                      <img src={inst.img || "/assets/default_icon.png"} alt={inst.name} className="ring-image" />
                      <div className="ring-name">{inst.name}</div>
                      <div className="ring-rarity">{inst.rarity}</div>
                      <div className="slot-slider">
                        <input type="range" min="0" max="100" value={inst.percent ?? 100} onChange={(e) => updateEquippedPercent(inst.instanceId, e.target.value)} className="percent-range" />
                        <div className="percent-label">{inst.percent ?? 100}%</div>
                      </div>
                      <div className="slot-stats-preview">
                        {Object.entries(inst.stats).map(([k, r]) => {
                          const v = scaled(r.min, r.max, inst.percent);
                          const cls = statColorClass(v);
                          const hasPercent = PERCENT_STATS.includes(k);
                          return (
                            <div key={k} className={`stat-line ${cls}`}>
                              {k.replaceAll("_", " ")} {v > 0 ? "+" : ""}{v}{hasPercent ? "%" : ""}
                            </div>
                          );
                        })}
                      </div>
                      <button className="btn unequip" onClick={() => unequipSlot("rings", idx)}>Unequip</button>
                    </>
                  ) : (
                    <div className="ring-empty">Empty</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="total-stats">
            <h3>📊 Total Stats</h3>
            {ALL_STATS.map((s) => {
              const v = totalStats[s] || 0;
              const hasPercent = PERCENT_STATS.includes(s);
              return (
                <div key={s} className={`stat-line ${statColorClass(v)}`}>
                  {s.replaceAll("_", " ")} {v > 0 ? "+" : ""}{v}{hasPercent ? "%" : ""}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- SlotCardInstance ---------------- */
function SlotCardInstance({ label, instance, onUnequip, onPercentChange }) {
  if (!instance)
    return (
      <div className="slot-card empty-slot">
        <div className="slot-header">{label}</div>
        <div className="slot-body">Empty slot</div>
      </div>
    );

  const PERCENT_STATS = ["dig_speed", "shake_speed", "size_boost", "modifier_boost", "sell_boost"];
  const scaled = (min, max, p) => Math.round(min + (max - min) * ((p ?? 100) / 100));
  const statColorClass = (v) => (v > 0 ? "positive" : v < 0 ? "negative" : "neutral");

  return (
    <div className="slot-card">
      <div className="slot-header">{label}</div>
      <div className="slot-body">
        <img src={instance.img || "/assets/default_icon.png"} alt={instance.name} className="slot-image-large" />
        <div className="slot-title">{instance.name}</div>
        <div className="slot-rarity">{instance.rarity}</div>
        <div className="slot-slider">
          <input type="range" min="0" max="100" value={instance.percent ?? 100} onChange={(e) => onPercentChange(Number(e.target.value))} className="percent-range" />
          <div className="percent-label">{instance.percent ?? 100}%</div>
        </div>
        <div className="slot-stats-preview">
          {Object.entries(instance.stats).map(([k, r]) => {
            const v = scaled(r.min, r.max, instance.percent);
            const cls = statColorClass(v);
            const hasPercent = PERCENT_STATS.includes(k);
            return (
              <div key={k} className={`stat-line ${cls}`}>
                {k.replaceAll("_", " ")} {v > 0 ? "+" : ""}{v}{hasPercent ? "%" : ""}
              </div>
            );
          })}
        </div>
        <button className="btn unequip" onClick={onUnequip}>Unequip</button>
      </div>
    </div>
  );
}
