import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cuzzllpqkyphjztpbkat.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1enpsbHBxa3lwaGp6dHBia2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzkyNzYsImV4cCI6MjA5NzIxNTI3Nn0.4lI64m_SnNoRj0rXiy1O2fvXLe6h01ogJhkJYnCcCUs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const C = {
  primary: "#F46B2B", primaryLight: "#FFF0E8", primaryDark: "#C8511A",
  bg: "#F5F5F3", surface: "#FFFFFF", border: "#EBEBEB",
  textPrimary: "#1A1A1A", textSecondary: "#6B6B6B", textMuted: "#C0C0C0",
  error: "#D32F2F", errorLight: "#FFF0F0",
  lh: { bg: "#E8F5E9", text: "#2E7D32" },
  gh: { bg: "#E8F0FE", text: "#1A56DB" },
  sh: { bg: "#FFF3E0", text: "#D35400" },
};

// 스와이프 훅
const useSwipe = (onLeft, onRight) => {
  const sx = useRef(null), sy = useRef(null);
  return {
    onTouchStart: (e) => { sx.current = e.touches[0].clientX; sy.current = e.touches[0].clientY; },
    onTouchEnd: (e) => {
      if (!sx.current) return;
      const dx = e.changedTouches[0].clientX - sx.current;
      const dy = e.changedTouches[0].clientY - sy.current;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 52) {
        dx < 0 ? onLeft() : onRight();
      }
      sx.current = null;
    },
  };
};

// 기관 태그
const AgencyTag = ({ agency }) => {
  const map = { lh: C.lh, gh: C.gh, sh: C.sh };
  const col = map[agency?.toLowerCase()] || { bg: "#F0F0F0", text: "#555" };
  return (
    <span style={{ background: col.bg, color: col.text, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, marginRight: 4, letterSpacing: 0.2 }}>
      {agency}
    </span>
  );
};

const TypeTag = ({ type }) => (
  <span style={{ background: "#F0EAFF", color: "#6B21A8", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 6 }}>
    {type}
  </span>
);

// D-day 뱃지
const DdayBadge = ({ dday }) => {
  const urgent = dday <= 5;
  return (
    <span style={{
      background: urgent ? "#FF3B30" : "#FF9500",
      color: "#fff", fontSize: 10, fontWeight: 800,
      padding: "2px 8px", borderRadius: 20, letterSpacing: 0.3
    }}>D-{dday}</span>
  );
};

// 공고 카드
const ListingCard = ({ listing: l, bookmarked, onBookmark, onClick }) => (
  <div onClick={onClick} style={{
    background: C.surface, borderRadius: 16,
    border: `1px solid ${C.border}`,
    marginBottom: 10, overflow: "hidden", cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    transition: "transform 0.15s, box-shadow 0.15s",
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    {l.img_url && (
      <div style={{ position: "relative" }}>
        <img src={l.img_url} alt="" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
          onError={e => { e.target.parentElement.style.display = "none"; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.35) 100%)" }} />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5 }}>
          <AgencyTag agency={l.agency} />
          <TypeTag type={l.type} />
        </div>
        {l.dday != null && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <DdayBadge dday={l.dday} />
          </div>
        )}
        <div style={{ position: "absolute", bottom: 8, left: 12, right: 12 }}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, lineHeight: 1.35, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{l.title}</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 }}>{l.location}</div>
        </div>
      </div>
    )}
    <div style={{ padding: "10px 14px" }}>
      {!l.img_url && (
        <div style={{ marginBottom: 5 }}>
          <AgencyTag agency={l.agency} /><TypeTag type={l.type} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginTop: 4, lineHeight: 1.4 }}>{l.title}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{l.location}</div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: C.textSecondary }}>전용 {l.area} · {l.units}세대</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: l.urgent ? C.error : C.textSecondary, marginTop: 2 }}>
            {l.urgent ? `접수 마감 ${l.receipt_end}` : `접수 ${l.receipt_start} ~`}
          </div>
        </div>
        <button onClick={onBookmark} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: "4px 4px", lineHeight: 1 }}>
          {bookmarked ? "🧡" : "🤍"}
        </button>
      </div>
    </div>
  </div>
);

// 하단 탭바
const BottomTab = ({ active, navigate }) => {
  const tabs = [
    { id: "home", label: "홈", icon: "🏠" },
    { id: "search", label: "탐색", icon: "🔍" },
    { id: "calendar", label: "캘린더", icon: "📅" },
    { id: "community", label: "소통", icon: "💬" },
    { id: "mypage", label: "마이", icon: "👤" },
  ];
  const order = tabs.map(t => t.id);
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: 64, background: "#fff",
      borderTop: `1.5px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around",
      paddingBottom: 6,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        const curIdx = order.indexOf(active);
        const newIdx = order.indexOf(t.id);
        const dir = newIdx > curIdx ? "left" : newIdx < curIdx ? "right" : null;
        return (
          <button key={t.id} onClick={() => navigate(t.id, {}, dir)} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer", padding: "4px 0",
          }}>
            <div style={{
              width: 44, height: 28, borderRadius: 14,
              background: isActive ? C.primaryLight : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}>
              <span style={{ fontSize: 18, filter: isActive ? "none" : "grayscale(50%) opacity(0.45)" }}>{t.icon}</span>
            </div>
            <span style={{ fontSize: 9.5, fontWeight: isActive ? 800 : 500, color: isActive ? C.primary : C.textMuted, letterSpacing: -0.2 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// 로딩 스켈레톤
const SkeletonCard = () => (
  <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 10, overflow: "hidden" }}>
    <div style={{ height: 110, background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
    <div style={{ padding: "10px 14px" }}>
      <div style={{ height: 12, background: "#f0f0f0", borderRadius: 6, marginBottom: 8, width: "70%" }} />
      <div style={{ height: 10, background: "#f0f0f0", borderRadius: 6, width: "40%" }} />
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
    () => navigate("search", {}, "left"),
    () => navigate("mypage", {}, "right")
  );

  useEffect(() => {
    supabase.from("listings").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setListings(data); setLoading(false); });
  }, []);

  const filtered = activeFilter === "전체" ? listings
    : listings.filter(l => l.agency === activeFilter || l.type.includes(activeFilter));
  const urgent = filtered.filter(l => l.urgent);
  const rest = filtered.filter(l => !l.urgent);

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 헤더 */}
      <div style={{ height: 56, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.primary, letterSpacing: -0.8, lineHeight: 1 }}>청약고수</div>
          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: 0.2, marginTop: 1 }}>공공청약 정보 한눈에</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => navigate("mypage")} style={{ background: C.bg, border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>🔔</button>
          <button onClick={() => navigate("mypage")} style={{ background: C.bg, border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>👤</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 80px" }}>
        {/* 필터 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${activeFilter === f ? C.primary : C.border}`,
              background: activeFilter === f ? C.primary : C.surface,
              color: activeFilter === f ? "#fff" : C.textSecondary,
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              transition: "all 0.18s",
            }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            {urgent.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.textPrimary, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ background: "#FF3B30", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>마감임박</span>
                </div>
                {urgent.map(l => (
                  <ListingCard key={l.id} listing={l} bookmarked={bookmarks[l.id]}
                    onBookmark={e => { e.stopPropagation(); setBookmarks(b => ({ ...b, [l.id]: !b[l.id] })); }}
                    onClick={() => navigate("detail", { listing: l })} />
                ))}
              </>
            )}
            {rest.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.textPrimary, margin: "4px 0 10px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span>최신 공고</span>
                  <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>{rest.length}건</span>
                </div>
                {rest.map(l => (
                  <ListingCard key={l.id} listing={l} bookmarked={bookmarks[l.id]}
                    onBookmark={e => { e.stopPropagation(); setBookmarks(b => ({ ...b, [l.id]: !b[l.id] })); }}
                    onClick={() => navigate("detail", { listing: l })} />
                ))}
              </>
            )}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>해당 조건의 공고가 없습니다</div>
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
  const [agency, setAgency] = useState("전체");
  const [region, setRegion] = useState("전체");
  const [bookmarks, setBookmarks] = useState({});
  const swipe = useSwipe(
    () => navigate("calendar", {}, "left"),
    () => navigate("home", {}, "right")
  );

  useEffect(() => {
    supabase.from("listings").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setListings(data); });
  }, []);

  const filtered = listings.filter(l => {
    const matchQ = !query || l.title.includes(query) || l.location.includes(query);
    const matchA = agency === "전체" || l.agency === agency;
    const matchR = region === "전체" || l.location.includes(region);
    return matchQ && matchA && matchR;
  });

  const Chip = ({ label, selected, onSelect }) => (
    <button onClick={() => onSelect(label)} style={{
      padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      border: `1.5px solid ${selected ? C.primary : C.border}`,
      background: selected ? C.primary : C.surface,
      color: selected ? "#fff" : C.textSecondary,
      cursor: "pointer", transition: "all 0.18s",
    }}>{label}</button>
  );

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 56, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.textPrimary }}>탐색</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 80px" }}>
        {/* 검색창 */}
        <div style={{ background: C.bg, borderRadius: 14, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 16, border: `1.5px solid ${C.border}` }}>
          <span style={{ fontSize: 15, color: C.textMuted }}>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="지역, 단지명으로 검색"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: C.textPrimary, background: "none", fontWeight: 500 }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 14 }}>✕</button>}
        </div>

        {/* 필터 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 0.8, marginBottom: 7 }}>공급기관</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["전체","LH","GH","SH"].map(o => <Chip key={o} label={o} selected={agency===o} onSelect={setAgency} />)}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 0.8, marginBottom: 7 }}>지역</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["전체","서울","경기","인천"].map(o => <Chip key={o} label={o} selected={region===o} onSelect={setRegion} />)}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>총 {filtered.length}건</span>
          <span style={{ fontSize: 11, color: C.textSecondary, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 8, background: C.surface }}>최신순 ▾</span>
        </div>

        {filtered.map(l => (
          <ListingCard key={l.id} listing={l} bookmarked={bookmarks[l.id]}
            onBookmark={e => { e.stopPropagation(); setBookmarks(b => ({ ...b, [l.id]: !b[l.id] })); }}
            onClick={() => navigate("detail", { listing: l })} />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>검색 결과가 없습니다</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>필터를 바꿔보세요</div>
          </div>
        )}
      </div>
      <BottomTab active="search" navigate={navigate} />
    </div>
  );
};

// === 공고 상세 화면 ===
const DetailScreen = ({ navigate, goBack, listing: l }) => {
  const [activeTab, setActiveTab] = useState("위치");
  const [selectedType, setSelectedType] = useState(l.floor_types?.[0] || "");
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [username, setUsername] = useState("익명");
  const [prices, setPrices] = useState([]);
  const [likedComments, setLikedComments] = useState({});

  useEffect(() => {
    supabase.from("comments").select("*").eq("listing_id", l.id).order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setComments(data); });
    supabase.from("prices").select("*").eq("listing_id", l.id)
      .then(({ data }) => { if (data) setPrices(data); });
  }, [l.id]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    const { data } = await supabase.from("comments").insert({ listing_id: l.id, username, content: commentText, likes: 0 }).select();
    if (data) setComments(prev => [...prev, ...data]);
    setCommentText("");
  };

  const toggleLike = async (c) => {
    const isLiked = likedComments[c.id];
    const newLikes = c.likes + (isLiked ? -1 : 1);
    await supabase.from("comments").update({ likes: newLikes }).eq("id", c.id);
    setComments(prev => prev.map(x => x.id === c.id ? { ...x, likes: newLikes } : x));
    setLikedComments(prev => ({ ...prev, [c.id]: !isLiked }));
  };

  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1) return "방금";
    if (m < 60) return `${m}분 전`;
    if (m < 1440) return `${Math.floor(m/60)}시간 전`;
    return `${Math.floor(m/1440)}일 전`;
  };

  const tabs = ["위치", "배치도", "평면도", "분양가", "자격요건", "댓글"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 네비바 */}
      <div style={{ height: 50, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 10, flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.textPrimary, padding: "0 4px 0 0", lineHeight: 1, display: "flex", alignItems: "center" }}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</span>
        <button onClick={() => setBookmarked(b => !b)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 0 }}>{bookmarked ? "🧡" : "🤍"}</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 72 }}>
        {/* 히어로 이미지 */}
        <div style={{ position: "relative" }}>
          {l.img_url && <img src={l.img_url} alt="" style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.65))" }} />
          <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              <AgencyTag agency={l.agency} />
              <TypeTag type={l.type} />
              {l.dday != null && <DdayBadge dday={l.dday} />}
            </div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{l.title}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 3 }}>{l.location}</div>
          </div>
        </div>

        {/* 요약 정보 */}
        <div style={{ background: C.surface, padding: "14px 16px", marginBottom: 8 }}>
          {l.urgent && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.errorLight, color: C.error, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, marginBottom: 12 }}>
              ⏰ 접수 {l.receipt_start} ~ {l.receipt_end}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            {[
              ["공급기관", l.agency === "GH" ? "경기주택도시공사" : l.agency === "LH" ? "한국토지주택공사" : "서울주택도시공사"],
              ["공급유형", l.type],
              ["총 세대수", `${l.units}세대`],
              ["전용면적", l.area],
              ["당첨자 발표", l.announce_date],
              ["입주 예정", l.move_in],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: "7px 0", borderBottom: `1px solid #F8F8F8` }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, color: C.textPrimary, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div style={{ background: C.surface, display: "flex", borderBottom: `2px solid ${C.border}`, overflowX: "auto", position: "sticky", top: 0, zIndex: 10 }}>
          {tabs.map(t => {
            const label = t === "댓글" ? `댓글 ${comments.length}` : t;
            const isActive = activeTab === t;
            return (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: "10px 14px", fontSize: 12, fontWeight: isActive ? 800 : 500,
                border: "none", background: "none", cursor: "pointer", whiteSpace: "nowrap",
                color: isActive ? C.primary : C.textMuted,
                borderBottom: `2px solid ${isActive ? C.primary : "transparent"}`,
                marginBottom: -2, transition: "color 0.15s",
              }}>{label}</button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "위치" && (
          <div style={{ padding: 16 }}>
            <div style={{ height: 160, background: "#EEF2F5", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 12, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🗺</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary }}>{l.location}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>지도 연동 예정</div>
            </div>
            <div style={{ background: C.surface, borderRadius: 14, padding: 14, fontSize: 13, color: C.textSecondary, lineHeight: 1.75, border: `1px solid ${C.border}` }}>{l.description}</div>
          </div>
        )}

        {activeTab === "배치도" && (
          <div style={{ padding: 16 }}>
            <div style={{ height: 260, background: "#EEF2F5", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏢</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textSecondary }}>단지 배치도</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>이미지 업로드 예정</div>
            </div>
          </div>
        )}

        {activeTab === "평면도" && (
          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto" }}>
              {(l.floor_types || []).map(t => (
                <button key={t} onClick={() => setSelectedType(t)} style={{
                  padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  border: `2px solid ${selectedType === t ? C.primary : C.border}`,
                  background: selectedType === t ? C.primary : C.surface,
                  color: selectedType === t ? "#fff" : C.textSecondary,
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.18s",
                }}>{t}</button>
              ))}
            </div>
            <div style={{ height: 210, background: "#EEF2F5", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.textSecondary, marginBottom: 4 }}>{selectedType} 평면도</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>핀치줌으로 확대 가능</div>
            </div>
            <div style={{ background: C.primaryLight, borderRadius: 10, padding: "8px 12px", fontSize: 12, color: C.primary, fontWeight: 600 }}>
              {selectedType?.startsWith("51") ? "전용 51㎡ · 2Bay · 침실2 욕실2" : "전용 59㎡ · 3Bay · 침실3 욕실2"}
            </div>
          </div>
        )}

        {activeTab === "분양가" && (
          <div style={{ padding: 16 }}>
            <div style={{ background: C.surface, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr 1fr", background: C.bg, padding: "8px 14px", gap: 4 }}>
                {["타입","구간","보증금","월임대료"].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, letterSpacing: 0.3 }}>{h}</div>
                ))}
              </div>
              {prices.length > 0 ? prices.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr 1fr", padding: "9px 14px", gap: 4, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.primary }}>{p.floor_type}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{p.interval_name}</div>
                  <div style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600 }}>{p.deposit}</div>
                  <div style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600 }}>{p.monthly}</div>
                </div>
              )) : (
                <div style={{ padding: 24, textAlign: "center", color: C.textMuted, fontSize: 12 }}>분양가 정보 준비 중</div>
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: C.textMuted, lineHeight: 1.7, padding: "0 2px" }}>
              * 소득구간에 따라 시세 35~90% 수준 적용. 정확한 조건은 공고문 참조.
            </div>
          </div>
        )}

        {activeTab === "자격요건" && (
          <div style={{ padding: 16 }}>
            {[
              { title: "무주택 요건", desc: "입주자모집공고일 현재 무주택세대구성원", icon: "🏠" },
              { title: "소득 기준", desc: "기준 중위소득 150% 이하 (일반공급, 세대원수별 차등)", icon: "💰" },
              { title: "자산 기준", desc: "총자산 3억 4,500만원 이하 / 자동차 4,542만원 이하", icon: "📊" },
              { title: "신청 대상", desc: "청년(18~39세) · 신혼부부(7년 이내) · 고령자(65세↑) · 일반", icon: "👥" },
            ].map((item, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 14, padding: "12px 14px", marginBottom: 8, borderLeft: `4px solid ${C.primary}`, border: `1px solid ${C.border}`, borderLeftWidth: 4, borderLeftColor: C.primary }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{item.title}</div>
                </div>
                <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.65, paddingLeft: 22 }}>{item.desc}</div>
              </div>
            ))}
            <a href="https://apply.gh.or.kr" target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 46, background: C.primaryLight, color: C.primary, border: `1.5px solid ${C.primary}`, borderRadius: 14, fontSize: 13, fontWeight: 700, textDecoration: "none", marginTop: 4 }}>
              📄 GH 청약센터 공고문 전체 보기
            </a>
          </div>
        )}

        {activeTab === "댓글" && (
          <div style={{ padding: 16 }}>
            <div style={{ background: C.surface, borderRadius: 14, padding: "12px 14px", marginBottom: 14, border: `1px solid ${C.border}` }}>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="닉네임 (선택)"
                style={{ width: "100%", border: "none", borderBottom: `1px solid ${C.border}`, outline: "none", fontSize: 12, color: C.textMuted, background: "none", marginBottom: 10, paddingBottom: 7, boxSizing: "border-box" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="이 단지에 대해 이야기해요..."
                  onKeyDown={e => e.key === "Enter" && addComment()}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 13, background: "none", color: C.textPrimary }} />
                <button onClick={addComment} style={{ background: commentText.trim() ? C.primary : C.textMuted, color: "#fff", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>등록</button>
              </div>
            </div>

            {comments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>첫 댓글을 남겨보세요!</div>
              </div>
            ) : comments.map(c => (
              <div key={c.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ width: 30, height: 30, background: C.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                    {c.username?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{c.username}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>{timeAgo(c.created_at)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65, paddingLeft: 38, marginBottom: 6 }}>{c.content}</div>
                <div style={{ display: "flex", gap: 14, paddingLeft: 38 }}>
                  <button onClick={() => toggleLike(c)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: likedComments[c.id] ? C.primary : C.textMuted, fontWeight: likedComments[c.id] ? 700 : 400, display: "flex", alignItems: "center", gap: 3 }}>
                    {likedComments[c.id] ? "🧡" : "👍"} {c.likes}
                  </button>
                  <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.textMuted }}>신고</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 CTA */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, padding: "10px 14px 14px", display: "flex", gap: 10 }}>
        <button onClick={() => setBookmarked(b => !b)} style={{
          flex: 1, height: 46, background: bookmarked ? C.primaryLight : C.bg,
          color: bookmarked ? C.primary : C.textSecondary,
          border: `1.5px solid ${bookmarked ? C.primary : C.border}`,
          borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
        }}>
          {bookmarked ? "🧡 저장됨" : "🤍 관심 단지"}
        </button>
        <a href="https://apply.gh.or.kr" target="_blank" rel="noreferrer" style={{
          flex: 2, height: 46, background: C.primary, color: "#fff",
          borderRadius: 14, fontSize: 13, fontWeight: 800, display: "flex",
          alignItems: "center", justifyContent: "center", textDecoration: "none",
          boxShadow: "0 4px 12px rgba(244,107,43,0.35)"
        }}>
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
    () => navigate("community", {}, "left"),
    () => navigate("search", {}, "right")
  );

  useEffect(() => {
    supabase.from("listings").select("*").then(({ data }) => { if (data) setListings(data); });
  }, []);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const eventDays = { 16: C.primary, 17: C.primary, 18: C.primary, 19: C.error, 30: C.gh.text };

  const events = [
    { date: "06.16", title: "다산지금A3 · 신청 접수 시작", agency: "GH", listingId: 1, dot: C.primary },
    { date: "06.19", title: "다산지금A3 · 접수 마감", agency: "GH", listingId: 1, dot: C.error },
    { date: "06.30", title: "위례A2-1 · 신청 접수 시작", agency: "LH", listingId: 2, dot: C.gh.text },
  ];

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 56, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.textPrimary }}>캘린더</span>
        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>2026년 6월</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button style={{ fontSize: 22, color: C.textSecondary, background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}>‹</button>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary }}>2026년 6월</span>
          <button style={{ fontSize: 22, color: C.textSecondary, background: "none", border: "none", cursor: "pointer", padding: "0 8px" }}>›</button>
        </div>
        <div style={{ background: C.surface, borderRadius: 16, padding: "12px 8px", marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 8 }}>
            {["일","월","화","수","목","금","토"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.textMuted, padding: "2px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px 0" }}>
            {days.map(d => {
              const isToday = d === 16;
              const dot = eventDays[d];
              return (
                <div key={d} style={{ height: 38, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 10, background: isToday ? C.primary : "transparent", position: "relative" }}>
                  <span style={{ fontSize: 12, color: isToday ? "#fff" : C.textPrimary, fontWeight: isToday ? 800 : 400 }}>{d}</span>
                  {dot && !isToday && <div style={{ width: 5, height: 5, background: dot, borderRadius: "50%", position: "absolute", bottom: 4 }} />}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary, marginBottom: 10 }}>6월 주요 일정</div>
        <div style={{ background: C.surface, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
          {events.map((ev, i) => (
            <div key={i} onClick={() => { const found = listings.find(x => x.id === ev.listingId); if (found) navigate("detail", { listing: found }); }}
              style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderBottom: i < events.length-1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.dot, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, display: "flex", alignItems: "center", gap: 5 }}>
                  <AgencyTag agency={ev.agency} />{ev.title}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{ev.date}</div>
              </div>
              <span style={{ fontSize: 14, color: C.textMuted }}>›</span>
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
  const swipe = useSwipe(() => {}, () => navigate("community", {}, "right"));
  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 56, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.textPrimary }}>마이</span>
        <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>⚙</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 80px" }}>
        {/* 프로필 */}
        <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`, borderRadius: 18, padding: "20px 16px", marginBottom: 12, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 54, height: 54, background: "rgba(255,255,255,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "2px solid rgba(255,255,255,0.4)" }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>이지은</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>신혼부부 · 경기 수원시</div>
          </div>
          <button style={{ fontSize: 11, border: "1.5px solid rgba(255,255,255,0.5)", padding: "4px 12px", borderRadius: 20, background: "transparent", color: "#fff", cursor: "pointer", fontWeight: 600 }}>편집</button>
        </div>

        {/* 통계 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["3","관심 단지","🏠"],["12","작성 댓글","💬"],["68","청약 가점","⭐"]].map(([n, label, icon]) => (
            <div key={label} style={{ flex: 1, background: C.surface, borderRadius: 14, padding: "14px 10px", textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: label === "청약 가점" ? C.primary : C.textPrimary }}>{n}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 메뉴 */}
        <div style={{ background: C.surface, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}` }}>
          {[
            ["🧮","청약 가점 계산기","내 점수 확인"],
            ["🔔","알림 설정","마감 알림 관리"],
            ["📋","내 댓글 모아보기","내가 쓴 글"],
            ["❓","청약 용어 사전","어려운 용어 해설"],
          ].map(([icon, label, sub], i, arr) => (
            <div key={label} style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, background: C.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{label}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{sub}</div>
              </div>
              <span style={{ fontSize: 14, color: C.textMuted }}>›</span>
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
  const [history, setHistory] = useState(["home"]);
  const [slideDir, setSlideDir] = useState(null);
  const [animating, setAnimating] = useState(false);

  const navigate = useCallback((screenName, p = {}, dir = null) => {
    if (animating) return;
    if (dir) {
      setSlideDir(dir);
      setAnimating(true);
      setTimeout(() => {
        setScreen(screenName);
        setParams(p || {});
        setHistory(prev => [...prev, screenName]);
        setSlideDir(null);
        setAnimating(false);
      }, 260);
    } else {
      setScreen(screenName);
      setParams(p || {});
      setHistory(prev => [...prev, screenName]);
    }
  }, [animating]);

  const goBack = useCallback(() => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const prev = newHistory[newHistory.length - 1];
    setSlideDir("right");
    setAnimating(true);
    setTimeout(() => {
      setScreen(prev);
      setParams({});
      setHistory(newHistory);
      setSlideDir(null);
      setAnimating(false);
    }, 260);
  }, [history]);

  const slideStyle = slideDir === "left"
    ? { animation: "slideInLeft 0.26s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
    : slideDir === "right"
    ? { animation: "slideInRight 0.26s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
    : {};

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, 'Pretendard', sans-serif" }}>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(-60px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.surface, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", ...slideStyle }}>
          {screen === "home"      && <HomeScreen     navigate={navigate} goBack={goBack} />}
          {screen === "search"    && <SearchScreen   navigate={navigate} goBack={goBack} />}
          {screen === "detail"    && <DetailScreen   navigate={navigate} goBack={goBack} {...params} />}
          {screen === "calendar"  && <CalendarScreen navigate={navigate} goBack={goBack} />}
          {screen === "community" && <HomeScreen     navigate={navigate} goBack={goBack} />}
          {screen === "mypage"    && <MypageScreen   navigate={navigate} goBack={goBack} />}
        </div>
      </div>
    </div>
  );
}
