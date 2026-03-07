import { useState, useEffect, useCallback } from "react";
import { Search, Star, TrendingUp, TrendingDown, RefreshCw, Zap, Globe, BarChart3, ChevronUp, ChevronDown, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

// ── API Service ─────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000/api";

const api = {
  getCryptos: async (ids = null) => {
    const url = ids ? `${API_BASE}/cryptos?ids=${ids}` : `${API_BASE}/cryptos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha ao buscar criptomoedas");
    return res.json();
  },
  getMarket: async () => {
    const res = await fetch(`${API_BASE}/market`);
    if (!res.ok) throw new Error("Falha ao buscar mercado");
    return res.json();
  },
  getChart: async (id, days = 7) => {
    const res = await fetch(`${API_BASE}/crypto/${id}/chart?days=${days}`);
    if (!res.ok) throw new Error("Falha ao buscar gráfico");
    return res.json();
  },
  search: async (q) => {
    const res = await fetch(`${API_BASE}/search?q=${q}`);
    if (!res.ok) throw new Error("Falha na busca");
    return res.json();
  },
};

// ── Formatters ───────────────────────────────────────────────────────────────
const fmt = {
  price: (n) => n >= 1000
    ? `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : `$${n?.toFixed(4) ?? "—"}`,
  pct: (n) => `${n >= 0 ? "+" : ""}${n?.toFixed(2) ?? "0.00"}%`,
  cap: (n) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n?.toLocaleString() ?? "—"}`;
  },
};

// ── Skeleton Loader ──────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 20, radius = 6 }) {
  return (
    <div
      className="skeleton-pulse"
      style={{ width: w, height: h, borderRadius: radius, background: "var(--skeleton)" }}
    />
  );
}

// ── Custom Tooltip for Charts ─────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const date = new Date(label);
  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "8px 14px",
      fontFamily: "var(--font-mono)",
    }}>
      <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
        {date.toLocaleDateString("pt-BR")} {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: 15 }}>
        {fmt.price(payload[0].value)}
      </div>
    </div>
  );
}

// ── Sparkline mini-chart ──────────────────────────────────────────────────
function Sparkline({ data = [], positive }) {
  if (!data.length) return null;
  const points = data.slice(-20).map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width={80} height={32}>
      <LineChart data={points}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={positive ? "var(--green)" : "var(--red)"}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Price Chart Modal ────────────────────────────────────────────────────────
function ChartModal({ coin, onClose }) {
  const [chartData, setChartData] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getChart(coin.id, days)
      .then((res) => {
        setChartData(res.prices.map((p) => ({ time: p.timestamp, price: p.price })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [coin.id, days]);

  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={coin.image} alt={coin.name} width={36} height={36} style={{ borderRadius: "50%" }} />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--gold)" }}>
                {coin.name}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                {coin.symbol.toUpperCase()} · Rank #{coin.market_cap_rank}
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", gap: 20, margin: "16px 0", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>PREÇO ATUAL</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text)" }}>
              {fmt.price(coin.current_price)}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>VARIAÇÃO 24H</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: isPositive ? "var(--green)" : "var(--red)" }}>
              {fmt.pct(coin.price_change_percentage_24h)}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 2 }}>MARKET CAP</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
              {fmt.cap(coin.market_cap)}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[1, 7, 30, 90].map((d) => (
            <button
              key={d}
              className={`period-btn ${days === d ? "active" : ""}`}
              onClick={() => setDays(d)}
            >
              {d === 1 ? "24H" : d === 7 ? "7D" : d === 30 ? "30D" : "90D"}
            </button>
          ))}
        </div>

        <div style={{ height: 220 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
              Carregando gráfico...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "var(--green)" : "var(--red)"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? "var(--green)" : "var(--red)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "var(--green)" : "var(--red)"}
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Market Stats Bar ─────────────────────────────────────────────────────────
function MarketBar({ market, loading }) {
  if (loading) {
    return (
      <div className="market-bar">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} w={120} h={16} />)}
      </div>
    );
  }
  if (!market) return null;
  const d = market.data;
  const change = d.market_cap_change_24h;
  return (
    <div className="market-bar">
      <div className="market-stat">
        <Globe size={13} />
        <span>Market Cap</span>
        <strong>{fmt.cap(d.total_market_cap_usd)}</strong>
        <span style={{ color: change >= 0 ? "var(--green)" : "var(--red)" }}>
          {fmt.pct(change)}
        </span>
      </div>
      <div className="market-divider" />
      <div className="market-stat">
        <BarChart3 size={13} />
        <span>Volume 24h</span>
        <strong>{fmt.cap(d.total_volume_usd)}</strong>
      </div>
      <div className="market-divider" />
      <div className="market-stat">
        <Zap size={13} />
        <span>BTC Dom.</span>
        <strong>{d.bitcoin_dominance?.toFixed(1)}%</strong>
      </div>
      <div className="market-divider" />
      <div className="market-stat">
        <span>Moedas Ativas</span>
        <strong>{d.active_cryptocurrencies?.toLocaleString()}</strong>
      </div>
    </div>
  );
}

// ── Coin Row ─────────────────────────────────────────────────────────────────
function CoinRow({ coin, rank, isFavorite, onToggleFav, onClick, loading }) {
  if (loading) {
    return (
      <tr className="coin-row loading">
        {[40, 100, 80, 80, 80, 80, 80].map((w, i) => (
          <td key={i} style={{ padding: "14px 12px" }}><Skeleton w={w} h={16} /></td>
        ))}
      </tr>
    );
  }
  const change24h = coin.price_change_percentage_24h ?? 0;
  const change7d = coin.price_change_percentage_7d_in_currency ?? 0;
  const isPos24 = change24h >= 0;
  const isPos7d = change7d >= 0;

  return (
    <tr className="coin-row" onClick={() => onClick(coin)}>
      <td style={{ paddingLeft: 16, width: 32 }}>
        <button
          className={`fav-btn ${isFavorite ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleFav(coin.id); }}
        >
          <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </td>
      <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13, width: 36 }}>
        {coin.market_cap_rank}
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={coin.image} alt={coin.name} width={28} height={28} style={{ borderRadius: "50%" }} />
          <div>
            <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{coin.name}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
              {coin.symbol.toUpperCase()}
            </div>
          </div>
        </div>
      </td>
      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text)", textAlign: "right" }}>
        {fmt.price(coin.current_price)}
      </td>
      <td style={{ textAlign: "right" }}>
        <span className={`badge ${isPos24 ? "green" : "red"}`}>
          {isPos24 ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {Math.abs(change24h).toFixed(2)}%
        </span>
      </td>
      <td style={{ textAlign: "right" }}>
        <span className={`badge ${isPos7d ? "green" : "red"}`}>
          {isPos7d ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {Math.abs(change7d).toFixed(2)}%
        </span>
      </td>
      <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "right" }}>
        {fmt.cap(coin.market_cap)}
      </td>
      <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "right" }}>
        {fmt.cap(coin.total_volume)}
      </td>
      <td style={{ textAlign: "right", paddingRight: 16 }}>
        <Sparkline data={coin.sparkline_in_7d?.price ?? []} positive={isPos7d} />
      </td>
    </tr>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [coins, setCoins] = useState([]);
  const [market, setMarket] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cryptonova_favs") || "[]"); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterMode, setFilterMode] = useState("all"); // all | favorites
  const [sortBy, setSortBy] = useState("rank");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Salva favoritos no localStorage
  useEffect(() => {
    localStorage.setItem("cryptonova_favs", JSON.stringify(favorites));
  }, [favorites]);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [coinsRes, marketRes] = await Promise.all([
        api.getCryptos(),
        api.getMarket(),
      ]);
      setCoins(coinsRes.data || []);
      setMarket(marketRes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
      setMarketLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carrega ao montar e atualiza a cada 60 segundos
  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Busca com debounce
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.search(searchQuery);
        setSearchResults(res.results || []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFav = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Filtra e ordena
  const displayedCoins = coins
    .filter((c) => filterMode === "favorites" ? favorites.includes(c.id) : true)
    .sort((a, b) => {
      if (sortBy === "rank") return a.market_cap_rank - b.market_cap_rank;
      if (sortBy === "price") return b.current_price - a.current_price;
      if (sortBy === "change24h") return (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0);
      if (sortBy === "cap") return (b.market_cap ?? 0) - (a.market_cap ?? 0);
      return 0;
    });

  // Skeletons enquanto carrega
  const skeletonCoins = Array(8).fill(null);

  return (
    <>
      <style>{CSS}</style>

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">
              <Zap size={16} />
            </div>
            <span>CRYPTO<strong>NOVA</strong></span>
          </div>

          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input
              className="search-input"
              placeholder="Buscar criptomoeda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => { setSearchQuery(""); setSearchResults([]); }}>
                <X size={12} />
              </button>
            )}
            {searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchLoading ? (
                  <div className="search-item">Buscando...</div>
                ) : (
                  searchResults.map((r) => (
                    <div
                      key={r.id}
                      className="search-item"
                      onClick={async () => {
                        // Carrega detalhes e abre modal
                        const found = coins.find((c) => c.id === r.id);
                        if (found) { setSelectedCoin(found); }
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <img src={r.thumb} alt={r.name} width={18} height={18} style={{ borderRadius: "50%" }} />
                      <span>{r.name}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{r.symbol}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {lastUpdated && (
              <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                {lastUpdated.toLocaleTimeString("pt-BR")}
              </span>
            )}
            <button
              className={`refresh-btn ${refreshing ? "spinning" : ""}`}
              onClick={() => loadData(true)}
              title="Atualizar dados"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Market Bar */}
      <MarketBar market={market} loading={marketLoading} />

      {/* Main Content */}
      <main className="main">

        {/* Controls */}
        <div className="controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterMode === "all" ? "active" : ""}`}
              onClick={() => setFilterMode("all")}
            >
              <TrendingUp size={14} /> Todas
            </button>
            <button
              className={`filter-tab ${filterMode === "favorites" ? "active" : ""}`}
              onClick={() => setFilterMode("favorites")}
            >
              <Star size={14} fill={filterMode === "favorites" ? "currentColor" : "none"} />
              Favoritos {favorites.length > 0 && <span className="fav-badge">{favorites.length}</span>}
            </button>
          </div>
          <div className="sort-group">
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Ordenar:</span>
            {["rank", "price", "change24h", "cap"].map((s) => (
              <button
                key={s}
                className={`sort-btn ${sortBy === s ? "active" : ""}`}
                onClick={() => setSortBy(s)}
              >
                {s === "rank" ? "Rank" : s === "price" ? "Preço" : s === "change24h" ? "24h" : "Market Cap"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          <table className="crypto-table">
            <thead>
              <tr>
                <th style={{ width: 32 }} />
                <th style={{ width: 40 }}>#</th>
                <th>Moeda</th>
                <th style={{ textAlign: "right" }}>Preço</th>
                <th style={{ textAlign: "right" }}>24h</th>
                <th style={{ textAlign: "right" }}>7d</th>
                <th style={{ textAlign: "right" }}>Market Cap</th>
                <th style={{ textAlign: "right" }}>Volume 24h</th>
                <th style={{ textAlign: "right", paddingRight: 16 }}>7d Gráfico</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? skeletonCoins.map((_, i) => (
                  <CoinRow key={i} loading={true} coin={null} />
                ))
                : displayedCoins.length === 0
                ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
                      {filterMode === "favorites"
                        ? "Nenhum favorito adicionado. Clique na estrela ★ para adicionar."
                        : "Nenhuma criptomoeda encontrada."}
                    </td>
                  </tr>
                )
                : displayedCoins.map((coin) => (
                  <CoinRow
                    key={coin.id}
                    coin={coin}
                    isFavorite={favorites.includes(coin.id)}
                    onToggleFav={toggleFav}
                    onClick={setSelectedCoin}
                    loading={false}
                  />
                ))
              }
            </tbody>
          </table>
        </div>

        <footer className="footer">
          <div>
            Dados fornecidos por <a href="https://www.coingecko.com" target="_blank" rel="noreferrer">CoinGecko API</a>
            &nbsp;· Atualização automática a cada 60s
          </div>
          <div>
            CryptoNova Dashboard · Projeto de Portfólio
          </div>
        </footer>
      </main>

      {/* Chart Modal */}
      {selectedCoin && (
        <ChartModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
      )}
    </>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  /* Discovery palette:
     #FF6B00 - laranja néon (Random Access Memories vibes)
     #FFD700 - dourado (Harder Better Faster Stronger)
     #00CFFF - azul elétrico ciano
     #FF2D6B - rosa magenta
     #1A1A2E - fundo deep space
     #0D0D1A - fundo mais escuro
  */

  :root {
    --bg:        #0A0A16;
    --bg2:       #0F0F1E;
    --card-bg:   #13132A;
    --border:    rgba(255,107,0,0.15);
    --border2:   rgba(255,215,0,0.08);
    --text:      #F0EDE8;
    --text-muted:#7A7A99;
    --gold:      #FFD700;
    --orange:    #FF6B00;
    --cyan:      #00CFFF;
    --pink:      #FF2D6B;
    --green:     #00E87A;
    --red:       #FF3D5A;
    --skeleton:  #1E1E3A;
    --font-display: 'Chakra Petch', monospace;
    --font-mono:    'Space Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-display);
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,107,0,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 90% 90%, rgba(0,207,255,0.05) 0%, transparent 50%);
  }

  /* ── Header ── */
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10,10,22,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  /* ── Logo ── */
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-display);
    font-size: 17px;
    letter-spacing: 2px;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .logo strong {
    color: var(--gold);
  }
  .logo-icon {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, var(--orange), var(--gold));
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    color: #000;
    box-shadow: 0 0 12px rgba(255,107,0,0.5);
  }

  /* ── Search ── */
  .search-wrapper {
    position: relative;
    flex: 1;
    max-width: 340px;
  }
  .search-icon {
    position: absolute;
    left: 11px; top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 32px 8px 32px;
    color: var(--text);
    font-family: var(--font-display);
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
  }
  .search-input::placeholder { color: var(--text-muted); }
  .search-input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
  .search-clear {
    position: absolute;
    right: 10px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: var(--text-muted); cursor: pointer; padding: 2px;
  }
  .search-clear:hover { color: var(--text); }
  .search-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0; right: 0;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    z-index: 200;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  .search-item {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s;
  }
  .search-item:hover { background: rgba(255,107,0,0.08); }

  /* ── Refresh ── */
  .refresh-btn {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-muted);
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .refresh-btn:hover { border-color: var(--orange); color: var(--orange); }
  .refresh-btn.spinning svg {
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Market Bar ── */
  .market-bar {
    background: var(--bg2);
    border-bottom: 1px solid var(--border2);
    display: flex;
    align-items: center;
    gap: 0;
    padding: 0 24px;
    height: 36px;
    overflow-x: auto;
    scrollbar-width: none;
    max-width: 100%;
  }
  .market-bar::-webkit-scrollbar { display: none; }
  .market-stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    padding: 0 16px;
    font-family: var(--font-mono);
  }
  .market-stat strong { color: var(--text); }
  .market-divider {
    width: 1px; height: 16px;
    background: var(--border);
    flex-shrink: 0;
  }

  /* ── Main ── */
  .main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 24px 48px;
  }

  /* ── Controls ── */
  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .filter-tabs {
    display: flex;
    gap: 6px;
  }
  .filter-tab {
    display: flex; align-items: center; gap: 6px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-muted);
    font-family: var(--font-display);
    font-size: 13px;
    padding: 7px 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .filter-tab:hover { border-color: var(--orange); color: var(--text); }
  .filter-tab.active {
    background: linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,215,0,0.08));
    border-color: var(--orange);
    color: var(--gold);
  }
  .fav-badge {
    background: var(--orange);
    color: #000;
    border-radius: 10px;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 700;
  }
  .sort-group {
    display: flex; align-items: center; gap: 6px;
  }
  .sort-btn {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    font-family: var(--font-display);
    font-size: 12px;
    padding: 5px 12px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .sort-btn:hover { border-color: var(--cyan); color: var(--cyan); }
  .sort-btn.active {
    background: rgba(0,207,255,0.1);
    border-color: var(--cyan);
    color: var(--cyan);
  }

  /* ── Table Card ── */
  .table-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,215,0,0.05);
  }

  .crypto-table {
    width: 100%;
    border-collapse: collapse;
  }
  .crypto-table thead tr {
    background: rgba(255,215,0,0.03);
    border-bottom: 1px solid var(--border);
  }
  .crypto-table th {
    padding: 12px 12px;
    text-align: left;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .coin-row {
    border-bottom: 1px solid rgba(255,107,0,0.06);
    cursor: pointer;
    transition: background 0.15s;
  }
  .coin-row:last-child { border-bottom: none; }
  .coin-row:hover { background: rgba(255,107,0,0.04); }
  .coin-row td {
    padding: 14px 12px;
    font-size: 14px;
  }

  /* ── Badges ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
  }
  .badge.green {
    background: rgba(0,232,122,0.12);
    color: var(--green);
  }
  .badge.red {
    background: rgba(255,61,90,0.12);
    color: var(--red);
  }

  /* ── Fav Button ── */
  .fav-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.15s;
    display: flex;
  }
  .fav-btn:hover { color: var(--gold); }
  .fav-btn.active { color: var(--gold); }

  /* ── Icon Button ── */
  .icon-btn {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    cursor: pointer;
    padding: 6px;
    display: flex;
    transition: all 0.15s;
  }
  .icon-btn:hover { border-color: var(--orange); color: var(--text); }

  /* ── Skeleton ── */
  .skeleton-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 24px;
    width: 100%;
    max-width: 600px;
    box-shadow: 0 20px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.08);
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  /* ── Period buttons ── */
  .period-btn {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    padding: 5px 12px;
    cursor: pointer;
    letter-spacing: 1px;
    transition: all 0.15s;
  }
  .period-btn:hover { border-color: var(--cyan); color: var(--cyan); }
  .period-btn.active {
    background: rgba(0,207,255,0.12);
    border-color: var(--cyan);
    color: var(--cyan);
  }

  /* ── Footer ── */
  .footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid var(--border2);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }
  .footer a { color: var(--orange); text-decoration: none; }
  .footer a:hover { color: var(--gold); }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .crypto-table th:nth-child(7),
    .crypto-table td:nth-child(7),
    .crypto-table th:nth-child(8),
    .crypto-table td:nth-child(8),
    .crypto-table th:nth-child(9),
    .crypto-table td:nth-child(9) { display: none; }
  }
  @media (max-width: 600px) {
    .header-inner { padding: 0 16px; gap: 12px; }
    .main { padding: 16px; }
    .controls { flex-direction: column; align-items: flex-start; }
    .crypto-table th:nth-child(5),
    .crypto-table td:nth-child(5),
    .crypto-table th:nth-child(6),
    .crypto-table td:nth-child(6) { display: none; }
    .sort-group { display: none; }
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--orange); }
`;
