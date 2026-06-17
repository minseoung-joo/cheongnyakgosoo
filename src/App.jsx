import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cuzzllpqkyphjztpbkat.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1enpsbHBxa3lwaGp6dHBia2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzkyNzYsImV4cCI6MjA5NzIxNTI3Nn0.4lI64m_SnNoRj0rXiy1O2fvXLe6h01ogJhkJYnCcCUs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TAB_ORDER = ["home", "search", "calendar", "community", "mypage"];

const useSwipe = (onSwipeLeft, onSwipeRight) => {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return { onTouchStart, onTouchEnd };
};

const C = {
  primary: "#F46B2B", primaryLight: "#FFF0E8", primaryDark: "#C8511A",
  bg: "#F7F7F5", surface: "#FFFFFF", border: "#E8E8E8",
  textPrimary: "#212121", textSecondary: "#757575", textMuted: "#BDBDBD",
  error: "#D32F2F", errorLight: "#FFEBEE",
  lh: { bg: "#E8F5E9", text: "#2E7D32" },
  gh: { bg: "#E3F2FD", text: "#1565C0" },
  sh: { bg: "#FFF3E0", text: "#E65100" },
};

const AgencyTag = ({ agency }) => {
  const colors = C[agency?.toLowerCase()] || { bg: "#F5F5F5", text: "#616161" };
  return (
    <span style={{ background: colors.bg, color: colors.text, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, marginRight: 4 }}>
      {agency}
    </span>
  );
};

const TypeTag = ({ type }) => (
  <span style={{ background: "#F3E5F5", color: "#6A1B9A", fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 6 }}>
    {type}
  </span>
);

const StatusBar = () => null;

const BottomTab = ({ active, navigate }) => {
  const tabs = [
    { id: "home", label: "홈", icon: "🏠" },
    { id: "search", label: "탐색", icon: "🔍" },
    { id: "calendar", label: "캘린더", icon: "📅" },
    { id: "community", label: "소통", icon: "💬" },
    { id: "mypage", label: "마이", icon: "👤" },
  ];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 68, background: "#fff", borderTop: "2px solid #F46B2B", display: "flex", alignItems: "center", justifyContent: "space-around", paddingBottom: 8 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => navigate(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={{ width: 40, height: 34, borderRadius: 10, background: active === t.id ? C.primaryLight : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
            <span style={{ fontSize: 22, filter: active === t.id ? "none" : "grayscale(30%) opacity(0.5)" }}>{t.icon}</span>
          </div>
          <span style={{ fontSize: 9, fontWeight: active === t.id ? 800 : 500, color: active === t.id ? C.primary : "#BDBDBD" }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

const ListingCard = ({ listing: l, bookmarked, onBookmark, onClick }) => (
  <div onClick={onClick} style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden", cursor: "pointer" }}>
    {l.urgent && (
      <div style={{ position: "relative" }}>
        <img src={l.img_url} alt="" style={{ width: "100%", height: 100, objectFit: "cover" }} onError={e => { e.target.style.display = 'none' }} />
        <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>{l.agency}</div>
        <div style={{ position: "absolute", top: 8, right: 8, background: C.errorLight, color: C.error, fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 800 }}>D-{l.dday}</div>
      </div>
    )}
    <div style={{ padding: "10px 12px" }}>
      <div style={{ marginBottom: 4 }}><AgencyTag agency={l.agency} /><TypeTag type={l.type} /></div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 2, lineHeight: 1.4 }}>{l.title}</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{l.location} · 전용 {l.area} · {l.units}세대</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {l.urgent
          ? <span style={{ fontSize: 11, fontWeight: 700, color: C.error }}>접수 D-{l.dday} · {l.receipt_end} 마감</span>
          : <span style={{ fontSize: 11, color: C.textSecondary }}>접수 {l.receipt_start} ~</span>}
        <button onClick={onBookmark} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 0 }}>{bookmarked ? "🧡" : "🤍"}</button>
      </div>
    </div>
  </div>
);

// === 홈 화면 ===
const HomeScreen = ({ navigate }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("전체");
  const [bookmarks, setBookmarks] = useState({});
  const filters = ["전체", "LH", "GH", "SH", "공공분양", "공공임대"];
  const swipe = useSwipe(
    () => navigate("search"),
    () => navigate("mypage")
  );

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (data) setListings(data);
      setLoading(false);
    };
    fetchListings();
  }, []);

  const filtered = activeFilter === "전체" ? listings
    : listings.filter(l => l.agency === activeFilter || l.type.includes(activeFilter));

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarks(b => ({ ...b, [id]: !b[id] }));
  };

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <StatusBar />
      <div style={{ height: 52, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.primary, letterSpacing: -0.5 }}>청약고수</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => navigate("mypage")} style={{ background: "#F5F5F5", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 14 }}>🔔</button>
          <button onClick={() => navigate("mypage")} style={{ background: "#F5F5F5", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 14 }}>👤</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 90px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${activeFilter === f ? C.primary : C.border}`, background: activeFilter === f ? C.primary : C.surface, color: activeFilter === f ? "#fff" : C.textSecondary, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 13 }}>공고를 불러오는 중...</div>
          </div>
        ) : (
          <>
            {filtered.filter(l => l.urgent).length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>🔥 마감 임박</div>
                {filtered.filter(l => l.urgent).map(l => (
                  <ListingCard key={l.id} listing={l} bookmarked={bookmarks[l.id]} onBookmark={e => toggleBookmark(l.id, e)} onClick={() => navigate("detail", { listing: l })} />
                ))}
              </>
            )}
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, margin: "6px 0 8px" }}>📋 최신 공고</div>
            {filtered.filter(l => !l.urgent).map(l => (
              <ListingCard key={l.id} listing={l} bookmarked={bookmarks[l.id]} onBookmark={e => toggleBookmark(l.id, e)} onClick={() => navigate("detail", { listing: l })} />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
                <div style={{ fontSize: 13 }}>해당 조건의 공고가 없습니다</div>
              </div>
            )}
          </>
        )}
      </div>
      <BottomTab active="home" navigate={navigate} />
    </div>
  );
};

// === 탐색 화면 ===
const SearchScreen = ({ navigate }) => {
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("전체");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [bookmarks, setBookmarks] = useState({});
  const swipe = useSwipe(
    () => navigate("calendar"),
    () => navigate("home")
  );

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (data) setListings(data);
    };
    fetch();
  }, []);

  const filtered = listings.filter(l => {
    const matchQ = !query || l.title.includes(query) || l.location.includes(query);
    const matchA = selectedAgency === "전체" || l.agency === selectedAgency;
    const matchR = selectedRegion === "전체"
      || (selectedRegion === "경기" && l.location.includes("경기"))
      || (selectedRegion === "서울" && l.location.includes("서울"))
      || (selectedRegion === "인천" && l.location.includes("인천"));
    return matchQ && matchA && matchR;
  });

  const FilterGroup = ({ label, options, selected, onSelect }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map(o => (
          <button key={o} onClick={() => onSelect(o)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, border: `1.5px solid ${selected === o ? C.primary : C.border}`, background: selected === o ? C.primary : C.surface, color: selected === o ? "#fff" : C.textSecondary, cursor: "pointer", fontWeight: 600 }}>{o}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <StatusBar />
      <div style={{ height: 52, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>탐색</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 90px" }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="지역, 단지명, 기관으로 검색" style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: C.textPrimary, background: "none" }} />
        </div>
        <FilterGroup label="공급기관" options={["전체", "LH", "GH", "SH"]} selected={selectedAgency} onSelect={setSelectedAgency} />
        <FilterGroup label="지역" options={["전체", "서울", "경기", "인천"]} selected={selectedRegion} onSelect={setSelectedRegion} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0 8px" }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>총 {filtered.length}건</span>
          <span style={{ fontSize: 11, color: C.textSecondary, border: `1px solid ${C.border}`, padding: "3px 8px", borderRadius: 8 }}>최신순 ▾</span>
        </div>
        {filtered.map(l => (
          <ListingCard key={l.id} listing={l} bookmarked={bookmarks[l.id]}
            onBookmark={e => { e.stopPropagation(); setBookmarks(b => ({ ...b, [l.id]: !b[l.id] })); }}
            onClick={() => navigate("detail", { listing: l })} />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
            <div style={{ fontSize: 13 }}>조건에 맞는 공고가 없습니다</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>필터를 변경해 보세요</div>
          </div>
        )}
      </div>
      <BottomTab active="search" navigate={navigate} />
    </div>
  );
};

// === 공고 상세 화면 ===
const DetailScreen = ({ navigate, listing: l }) => {
  const [activeTab, setActiveTab] = useState("위치");
  const [selectedType, setSelectedType] = useState(l.floor_types?.[0] || "");
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [username, setUsername] = useState("익명");
  const [prices, setPrices] = useState([]);
  const [likedComments, setLikedComments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: c } = await supabase.from("comments").select("*").eq("listing_id", l.id).order("created_at", { ascending: true });
      if (c) setComments(c);
      const { data: p } = await supabase.from("prices").select("*").eq("listing_id", l.id);
      if (p) setPrices(p);
    };
    fetchData();
  }, [l.id]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    const { data } = await supabase.from("comments").insert({ listing_id: l.id, username, content: commentText, likes: 0 }).select();
    if (data) setComments(prev => [...prev, ...data]);
    setCommentText("");
  };

  const toggleLike = async (comment) => {
    const isLiked = likedComments[comment.id];
    const newLikes = comment.likes + (isLiked ? -1 : 1);
    await supabase.from("comments").update({ likes: newLikes }).eq("id", comment.id);
    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, likes: newLikes } : c));
    setLikedComments(prev => ({ ...prev, [comment.id]: !isLiked }));
  };

  const tabs = ["위치", "배치도", "평면도", "분양가", "자격요건", `댓글 ${comments.length}`];

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <StatusBar />
      <div style={{ height: 48, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 8, flexShrink: 0 }}>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.textPrimary, padding: 0, lineHeight: 1 }}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, flex: 1 }}>공고 상세</span>
        <button onClick={() => setBookmarked(b => !b)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>{bookmarked ? "🧡" : "🤍"}</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 76 }}>
        <div style={{ position: "relative" }}>
          {l.img_url && <img src={l.img_url} alt="" style={{ width: "100%", height: 180, objectFit: "cover" }} />}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,.6))", padding: "10px 14px" }}>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{l.title}</div>
            <div style={{ color: "rgba(255,255,255,.8)", fontSize: 11, marginTop: 2 }}>{l.location}</div>
          </div>
        </div>

        <div style={{ background: C.surface, padding: "14px 16px", marginBottom: 8 }}>
          {l.urgent && (
            <div style={{ display: "inline-block", background: C.errorLight, color: C.error, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginBottom: 10 }}>
              접수 D-{l.dday} · {l.receipt_start} ~ {l.receipt_end}
            </div>
          )}
          {[
            ["공급기관", l.agency === "GH" ? "경기주택도시공사 (GH)" : l.agency === "LH" ? "한국토지주택공사 (LH)" : "서울주택도시공사 (SH)"],
            ["공급유형", l.type],
            ["총 세대수", `${l.units}세대`],
            ["전용면적", l.area],
            ["당첨자 발표", l.announce_date],
            ["입주 예정", l.move_in],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid #F5F5F5` }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>{k}</span>
              <span style={{ fontSize: 12, color: C.textPrimary, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, display: "flex", borderBottom: `2px solid ${C.border}`, overflowX: "auto" }}>
          {tabs.map(t => {
            const tabKey = t.startsWith("댓글") ? "댓글" : t;
            const isActive = activeTab === tabKey;
            return (
              <button key={t} onClick={() => setActiveTab(tabKey)} style={{ padding: "11px 14px", fontSize: 12, fontWeight: 600, border: "none", background: "none", cursor: "pointer", whiteSpace: "nowrap", color: isActive ? C.primary : C.textMuted, borderBottom: `2px solid ${isActive ? C.primary : "transparent"}`, marginBottom: -2 }}>{t}</button>
            );
          })}
        </div>

        {activeTab === "위치" && (
          <div style={{ padding: 16 }}>
            <div style={{ height: 160, background: "#E8EEF0", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, border: `1px solid ${C.border}` }}>
              <div style={{ textAlign: "center", color: C.textMuted }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🗺</div>
                <div style={{ fontSize: 12 }}>{l.location}</div>
                <div style={{ fontSize: 10, marginTop: 4 }}>지도 연동 예정</div>
              </div>
            </div>
            <div style={{ background: C.surface, borderRadius: 12, padding: 14, fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}>{l.description}</div>
          </div>
        )}

        {activeTab === "배치도" && (
          <div style={{ padding: 16 }}>
            <div style={{ height: 240, background: "#E8EEF0", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
              <div style={{ textAlign: "center", color: C.textMuted }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🏢</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>단지 배치도</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>핀치줌으로 확대 가능</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "평면도" && (
          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto" }}>
              {(l.floor_types || []).map(t => (
                <button key={t} onClick={() => setSelectedType(t)} style={{ padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: `2px solid ${selectedType === t ? C.primary : C.border}`, background: selectedType === t ? C.primaryLight : C.surface, color: selectedType === t ? C.primary : C.textSecondary, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t}</button>
              ))}
            </div>
            <div style={{ height: 200, background: "#E8E8E8", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, border: `1px solid ${C.border}` }}>
              <div style={{ textAlign: "center", color: C.textMuted }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{selectedType} 평면도</div>
                <div style={{ fontSize: 11 }}>핀치줌으로 확대 가능</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "분양가" && (
          <div style={{ padding: 16 }}>
            <div style={{ background: C.surface, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr", background: "#F5F5F5", padding: "8px 14px", gap: 4 }}>
                {["타입", "구간", "보증금", "월임대료"].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary }}>{h}</div>
                ))}
              </div>
              {prices.length > 0 ? prices.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr", padding: "8px 14px", gap: 4, borderTop: `1px solid #F5F5F5` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textPrimary }}>{p.floor_type}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{p.interval_name}</div>
                  <div style={{ fontSize: 11, color: C.textPrimary }}>{p.deposit}</div>
                  <div style={{ fontSize: 11, color: C.textPrimary }}>{p.monthly}</div>
                </div>
              )) : (
                <div style={{ padding: 16, textAlign: "center", color: C.textMuted, fontSize: 12 }}>분양가 정보가 없습니다</div>
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
              * 임대조건은 소득구간에 따라 시세의 35~90% 수준 적용. 정확한 조건은 공고문 참조.
            </div>
          </div>
        )}

        {activeTab === "자격요건" && (
          <div style={{ padding: 16 }}>
            {[
              { title: "무주택 요건", desc: "입주자모집공고일 현재 무주택세대구성원" },
              { title: "소득 기준", desc: "기준 중위소득 150% 이하 (일반공급, 세대원수별 차등)" },
              { title: "자산 기준", desc: "총자산 3억 4,500만원 이하, 자동차 4,542만원 이하" },
              { title: "신청 대상", desc: "청년(18~39세), 신혼부부(7년 이내), 고령자(65세 이상), 일반" },
            ].map((item, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderLeft: `4px solid ${C.primary}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
            <a href="https://apply.gh.or.kr" target="_blank" rel="noreferrer" style={{ display: "block", width: "100%", height: 44, background: C.primaryLight, color: C.primary, border: `1px solid ${C.primary}`, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center", lineHeight: "44px", textDecoration: "none" }}>
              📄 GH 청약센터에서 공고문 보기
            </a>
          </div>
        )}

        {activeTab === "댓글" && (
          <div style={{ padding: 16 }}>
            <div style={{ background: C.surface, borderRadius: 12, padding: "10px 12px", marginBottom: 12, border: `1px solid ${C.border}` }}>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="닉네임"
                style={{ width: "100%", border: "none", borderBottom: `1px solid ${C.border}`, outline: "none", fontSize: 12, color: C.textMuted, background: "none", marginBottom: 8, paddingBottom: 6 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="이 단지에 대해 이야기해요..."
                  onKeyDown={e => e.key === "Enter" && addComment()}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 13, background: "none", color: C.textPrimary }} />
                <button onClick={addComment} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>등록</button>
              </div>
            </div>

            {comments.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.textMuted }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 13 }}>첫 댓글을 남겨보세요!</div>
              </div>
            )}

            {comments.map(c => (
              <div key={c.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, background: C.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                    {c.username?.charAt(0) || "?"}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{c.username}</span>
                  <span style={{ fontSize: 10, color: C.textMuted }}>{timeAgo(c.created_at)}</span>
                </div>
                <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6, paddingLeft: 36, marginBottom: 6 }}>{c.content}</div>
                <div style={{ display: "flex", gap: 14, paddingLeft: 36 }}>
                  <button onClick={() => toggleLike(c)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: likedComments[c.id] ? C.primary : C.textMuted, fontWeight: likedComments[c.id] ? 700 : 400 }}>
                    {likedComments[c.id] ? "🧡" : "👍"} {c.likes}
                  </button>
                  <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.textMuted }}>신고</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 76, background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px 12px", gap: 10 }}>
        <button onClick={() => setBookmarked(b => !b)} style={{ flex: 1, height: 44, background: bookmarked ? C.primaryLight : "#F0F0F0", color: bookmarked ? C.primary : C.textPrimary, border: bookmarked ? `1px solid ${C.primary}` : "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {bookmarked ? "🧡 저장됨" : "🤍 관심 단지"}
        </button>
        <a href="https://apply.gh.or.kr" target="_blank" rel="noreferrer" style={{ flex: 2, height: 44, background: C.primary, color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          청약센터에서 신청 →
        </a>
      </div>
    </div>
  );
};

// === 캘린더 화면 ===
const CalendarScreen = ({ navigate }) => {
  const [listings, setListings] = useState([]);
  const swipe = useSwipe(
    () => navigate("community"),
    () => navigate("search")
  );

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("listings").select("*");
      if (data) setListings(data);
    };
    fetch();
  }, []);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const eventDays = [16, 17, 18, 19, 30];

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <StatusBar />
      <div style={{ height: 52, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>캘린더</span>
        <span style={{ fontSize: 13, color: C.textMuted }}>2026.06</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 90px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button style={{ fontSize: 20, color: C.textSecondary, background: "none", border: "none", cursor: "pointer" }}>‹</button>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>2026년 6월</span>
          <button style={{ fontSize: 20, color: C.textSecondary, background: "none", border: "none", cursor: "pointer" }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
          {["일","월","화","수","목","금","토"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.textMuted, padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 16 }}>
          {days.map(d => {
            const hasEvent = eventDays.includes(d);
            const isToday = d === 16;
            return (
              <div key={d} style={{ height: 36, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 8, background: isToday ? C.primary : "transparent", position: "relative" }}>
                <span style={{ fontSize: 12, color: isToday ? "#fff" : C.textPrimary, fontWeight: isToday ? 800 : 400 }}>{d}</span>
                {hasEvent && !isToday && <div style={{ width: 4, height: 4, background: C.error, borderRadius: "50%", position: "absolute", bottom: 3 }} />}
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 8 }}>6월 주요 일정</div>
        <div style={{ background: C.surface, borderRadius: 12, overflow: "hidden" }}>
          {[
            { date: "06.16", title: "다산지금A3 · 신청 접수 시작", agency: "GH", id: 1 },
            { date: "06.19", title: "다산지금A3 · 접수 마감", agency: "GH", id: 1 },
            { date: "06.30", title: "위례A2-1 · 신청 접수 시작", agency: "LH", id: 2 },
          ].map((ev, i) => (
            <div key={i} onClick={() => { const l = listings.find(x => x.id === ev.id); if (l) navigate("detail", { listing: l }); }}
              style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", borderBottom: `1px solid #F5F5F5`, cursor: "pointer" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: C.primary }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, lineHeight: 1.4 }}>
                  <AgencyTag agency={ev.agency} />{ev.title}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{ev.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomTab active="calendar" navigate={navigate} />
    </div>
  );
};

// === 마이페이지 ===
const MypageScreen = ({ navigate }) => {
  const swipe = useSwipe(
    () => {},
    () => navigate("community")
  );
  return (
  <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <StatusBar />
    <div style={{ height: 52, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", flexShrink: 0 }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>마이</span>
      <span style={{ fontSize: 20 }}>⚙</span>
    </div>
    <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 90px" }}>
      <div style={{ background: C.surface, borderRadius: 16, padding: 16, marginBottom: 10, display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 56, height: 56, background: C.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>이지은</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>신혼부부 · 경기 수원시</div>
        </div>
        <button style={{ fontSize: 12, border: `1px solid ${C.border}`, padding: "4px 10px", borderRadius: 8, background: C.surface, color: C.textSecondary, cursor: "pointer" }}>편집</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["3","관심 단지"],["12","작성 댓글"],["68","청약 가점"]].map(([n, l]) => (
          <div key={l} style={{ flex: 1, background: C.surface, borderRadius: 12, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: l === "청약 가점" ? C.primary : C.textPrimary }}>{n}</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.surface, borderRadius: 14, overflow: "hidden" }}>
        {[["🧮","청약 가점 계산기"],["🔔","알림 설정"],["📋","내 댓글 모아보기"],["❓","청약 용어 사전"]].map(([icon, label]) => (
          <div key={label} style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid #F5F5F5`, cursor: "pointer" }}>
            <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</span>
            <span style={{ fontSize: 13, color: C.textPrimary, flex: 1 }}>{label}</span>
            <span style={{ fontSize: 16, color: C.textMuted }}>›</span>
          </div>
        ))}
      </div>
    </div>
    <BottomTab active="mypage" navigate={navigate} />
  </div>
  );
};

// === 메인 앱 ===
export default function App() {
  const [screen, setScreen] = useState("home");
  const [params, setParams] = useState({});

  const navigate = (screenName, p = {}) => {
    setScreen(screenName);
    setParams(p);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.surface, position: "relative", display: "flex", flexDirection: "column" }}>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {screen === "home" && <HomeScreen navigate={navigate} />}
          {screen === "search" && <SearchScreen navigate={navigate} />}
          {screen === "detail" && <DetailScreen navigate={navigate} {...params} />}
          {screen === "calendar" && <CalendarScreen navigate={navigate} />}
          {screen === "community" && <HomeScreen navigate={navigate} />}
          {screen === "mypage" && <MypageScreen navigate={navigate} />}
        </div>
      </div>
    </div>
  );
}
