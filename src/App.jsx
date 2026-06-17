import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cuzzllpqkyphjztpbkat.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1enpsbHBxa3lwaGp6dHBia2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzkyNzYsImV4cCI6MjA5NzIxNTI3Nn0.4lI64m_SnNoRj0rXiy1O2fvXLe6h01ogJhkJYnCcCUs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EXTRA_LISTINGS = [
  {
    id: "local-gh-tapseok", agency: "GH", type: "장기전세",
    title: "탑석센트럴자이 장기전세주택", location: "경기도 의정부시 용민로 10",
    area: "49㎡", units: 27, dday: null, urgent: false,
    receipt_start: "2026.04.27", receipt_end: "2026.04.30",
    announce_date: "2026.08.07", move_in: "추후 안내",
    description: "의정부시 탑석센트럴자이 재건축 단지 내 장기전세주택 27세대 공급. 49A·49B·49C 통합 49형 단일 타입. 임대보증금 211,901,000원(임대료 전환 불가). 최장 20년 거주 가능(분양전환 없음). 1순위: 의정부시 거주자. GH주택청약센터 인터넷 신청 전용(모바일 불가).",
    floor_types: ["49A", "49B", "49C"],
    img_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    apply_url: "https://apply.gh.or.kr",
  },
  {
    id: "local-lh-goyang", agency: "LH", type: "행복주택",
    title: "고양창릉 A-4BL 신혼희망타운 행복주택", location: "경기도 고양시 도내동 일원",
    area: "55㎡", units: 297, dday: 13, urgent: true,
    receipt_start: "2026.06.26", receipt_end: "2026.06.30",
    announce_date: "2026.10.29", move_in: "2028년 1월(예정)",
    description: "고양창릉 공공주택지구 A-4블록. 신혼부부·한부모가족 계층 전용 행복주택 297세대. 임대보증금 152,400~153,200천원 / 월임대료 635,000~638,330원. 무자녀 최대 10년, 유자녀 최대 14년 거주.",
    floor_types: ["55A", "55AH", "55B", "55BH", "55C"],
    img_url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
    apply_url: "https://apply.lh.or.kr/lhapply/main.do",
  },
];

const getApplyUrl = (agency) => {
  const a = agency?.toUpperCase();
  if (a === "LH") return "https://apply.lh.or.kr/lhapply/main.do";
  if (a === "SH") return "https://www.i-sh.co.kr/app/index.do";
  return "https://apply.gh.or.kr";
};

const getDefaultImg = (listing) => {
  if (listing.img_url) return listing.img_url;
  const a = listing.agency?.toUpperCase();
  const t = listing.type || "";
  if (t.includes("장기전세")) return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80";
  if (t.includes("행복주택")) return "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80";
  if (a === "LH") return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80";
  if (a === "SH") return "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=600&q=80";
  return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";
};

// ── 디자인 토큰 ──────────────────────────────────────────────────────
const C = {
  primary: "#F46B2B",
  primaryLight: "#FFF3ED",
  primaryDark: "#C8511A",
  bg: "#F7F7F8",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  border: "#F0F0F0",
  borderStrong: "#E4E4E4",
  textPrimary: "#111111",
  textSecondary: "#5A5A5A",
  textMuted: "#ABABAB",
  textInverse: "#FFFFFF",
  error: "#E53935",
  errorLight: "#FFF5F5",
  success: "#00B386",
  successLight: "#F0FBF8",
  lh: { bg: "#EDFAF4", text: "#00875A", dot: "#00B386" },
  gh: { bg: "#EEF2FF", text: "#3D5AF1", dot: "#3D5AF1" },
  sh: { bg: "#FFF7ED", text: "#C25200", dot: "#F46B2B" },
};

// ── 스와이프 훅 ───────────────────────────────────────────────────────
const useSwipe = (onLeft, onRight) => {
  const sx = useRef(null), sy = useRef(null);
  return {
    onTouchStart: (e) => { sx.current = e.touches[0].clientX; sy.current = e.touches[0].clientY; },
    onTouchEnd: (e) => {
      if (!sx.current) return;
      const dx = e.changedTouches[0].clientX - sx.current;
      const dy = e.changedTouches[0].clientY - sy.current;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 52) dx < 0 ? onLeft() : onRight();
      sx.current = null;
    },
  };
};

// ── 기관 뱃지 ─────────────────────────────────────────────────────────
const AgencyBadge = ({ agency }) => {
  const map = { lh: C.lh, gh: C.gh, sh: C.sh };
  const col = map[agency?.toLowerCase()] || { bg: "#F3F3F3", text: "#777", dot: "#999" };
  return (
    <span style={{
      background: col.bg, color: col.text,
      fontSize: 10, fontWeight: 700,
      padding: "3px 8px", borderRadius: 20,
      display: "inline-flex", alignItems: "center", gap: 4,
      letterSpacing: 0.3,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: col.dot, display: "inline-block" }} />
      {agency}
    </span>
  );
};

const TypeBadge = ({ type }) => (
  <span style={{
    background: C.primaryLight, color: C.primary,
    fontSize: 10, fontWeight: 700,
    padding: "3px 8px", borderRadius: 20, letterSpacing: 0.2,
  }}>{type}</span>
);

const DdayBadge = ({ dday }) => (
  <span style={{
    background: dday <= 7 ? C.error : "#FF8C42",
    color: "#fff", fontSize: 10, fontWeight: 800,
    padding: "3px 9px", borderRadius: 20, letterSpacing: 0.3,
  }}>D-{dday}</span>
);

// ── 공고 카드 (토스 스타일) ───────────────────────────────────────────
const ListingCard = ({ listing: l, bookmarked, onBookmark, onClick, index = 0 }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: C.surface,
        borderRadius: 20,
        marginBottom: 12,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: pressed
          ? "0 1px 4px rgba(0,0,0,0.08)"
          : "0 2px 12px rgba(0,0,0,0.07)",
        transform: pressed ? "scale(0.985)" : "scale(1)",
        transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
        animationFillMode: "both",
        animation: `fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms both`,
      }}
    >
      {/* 이미지 영역 */}
      <div style={{ position: "relative", height: 130 }}>
        <img
          src={getDefaultImg(l)} alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.style.display = "none"; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)" }} />
        {/* 상단 배지 */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 5 }}>
          <AgencyBadge agency={l.agency} />
          <TypeBadge type={l.type} />
        </div>
        {l.dday != null && (
          <div style={{ position: "absolute", top: 12, right: 12 }}>
            <DdayBadge dday={l.dday} />
          </div>
        )}
        {/* 하단 제목 */}
        <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: 1.35, letterSpacing: -0.3 }}>{l.title}</div>
          <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 11, marginTop: 3, letterSpacing: 0.1 }}>{l.location}</div>
        </div>
      </div>

      {/* 정보 영역 */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500, marginBottom: 2, letterSpacing: 0.3 }}>전용면적</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{l.area}</div>
            </div>
            <div style={{ width: 1, background: C.border }} />
            <div>
              <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500, marginBottom: 2, letterSpacing: 0.3 }}>세대수</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{l.units}세대</div>
            </div>
            <div style={{ width: 1, background: C.border }} />
            <div>
              <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500, marginBottom: 2, letterSpacing: 0.3 }}>접수일</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: l.urgent ? C.error : C.textPrimary }}>
                {l.urgent ? l.receipt_end + " 마감" : l.receipt_start + " ~"}
              </div>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onBookmark(e); }}
            style={{
              background: bookmarked ? C.primaryLight : C.bg,
              border: "none", borderRadius: 12,
              width: 36, height: 36, cursor: "pointer",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              transform: bookmarked ? "scale(1.1)" : "scale(1)",
            }}>
            {bookmarked ? "🧡" : "🤍"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── 하단 탭바 ────────────────────────────────────────────────────────
const BottomTab = ({ active, navigate }) => {
  const tabs = [
    { id: "home", label: "홈", icon: "⊞" },
    { id: "search", label: "탐색", icon: "○" },
    { id: "calendar", label: "캘린더", icon: "▦" },
    { id: "community", label: "소통", icon: "◎" },
    { id: "mypage", label: "마이", icon: "◉" },
  ];
  const icons = {
    home: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>),
    search: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>),
    calendar: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M3 9H21" stroke="currentColor" strokeWidth="1.8"/><path d="M8 2V5M16 2V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/></svg>),
    community: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 16.1 20.1 17 19 17H7L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>),
    mypage: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" fill="none"/><path d="M4 20C4 17.2 7.6 15 12 15C16.4 15 20 17.2 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  };
  const order = tabs.map(t => t.id);
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: 68, background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)",
      borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around",
      paddingBottom: 4,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        const curIdx = order.indexOf(active);
        const newIdx = order.indexOf(t.id);
        const dir = newIdx > curIdx ? "left" : newIdx < curIdx ? "right" : null;
        return (
          <button key={t.id} onClick={() => navigate(t.id, {}, dir)} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer", padding: "6px 0",
            color: isActive ? C.primary : C.textMuted,
            transition: "color 0.2s",
          }}>
            <div style={{
              transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              transform: isActive ? "scale(1.15)" : "scale(1)",
            }}>
              {icons[t.id]}
            </div>
            <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 400, letterSpacing: -0.1, transition: "all 0.2s" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ── 공통 헤더 ────────────────────────────────────────────────────────
const AppHeader = ({ navigate, rightContent }) => (
  <div style={{
    height: 58, background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(20px)",
    borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center",
    padding: "0 18px", justifyContent: "space-between", flexShrink: 0,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: C.primary,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(244,107,43,0.35)",
      }}>
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: 1.5, lineHeight: 1 }}>EGO</span>
      </div>
      <span style={{ fontSize: 19, fontWeight: 800, color: C.textPrimary, letterSpacing: -0.8 }}>이반고수</span>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      {rightContent || (
        <>
          <button onClick={() => navigate("mypage")} style={{ background: C.bg, border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={C.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => navigate("mypage")} style={{ background: C.bg, border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={C.textSecondary} strokeWidth="1.8" fill="none"/><path d="M4 20c0-2.8 3.6-5 8-5s8 2.2 8 5" stroke={C.textSecondary} strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </>
      )}
    </div>
  </div>
);

// ── 스켈레톤 ─────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: C.surface, borderRadius: 20, marginBottom: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
    <div style={{ height: 130, background: "linear-gradient(90deg, #f2f2f2 25%, #e8e8e8 50%, #f2f2f2 75%)", backgroundSize: "400% 100%", animation: "shimmer 1.6s ease-in-out infinite" }} />
    <div style={{ padding: "14px 16px" }}>
      <div style={{ height: 10, background: "#f0f0f0", borderRadius: 8, marginBottom: 8, width: "55%" }} />
      <div style={{ height: 10, background: "#f0f0f0", borderRadius: 8, width: "35%" }} />
    </div>
  </div>
);

// ── 섹션 타이틀 ──────────────────────────────────────────────────────
const SectionTitle = ({ label, count, accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, marginTop: 4 }}>
    {accent && <span style={{ width: 3, height: 16, background: C.primary, borderRadius: 2, display: "inline-block" }} />}
    <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.3 }}>{label}</span>
    {count != null && <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{count}건</span>}
  </div>
);

// ═══════════════════════════════════════════════════════════
// 홈 화면
// ═══════════════════════════════════════════════════════════
const HomeScreen = ({ navigate }) => {
  const [dbListings, setDbListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("전체");
  const [bookmarks, setBookmarks] = useState({});
  const filters = ["전체", "LH", "GH", "SH", "공공분양", "공공임대"];
  const swipe = useSwipe(() => navigate("search", {}, "left"), () => navigate("mypage", {}, "right"));

  useEffect(() => {
    supabase.from("listings").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setDbListings(data.filter(l => !l.title?.includes("위례") && !l.title?.includes("마포")));
        setLoading(false);
      });
  }, []);

  const all = [...dbListings, ...EXTRA_LISTINGS];
  const filtered = activeFilter === "전체" ? all : all.filter(l => l.agency === activeFilter || l.type?.includes(activeFilter));
  const urgent = filtered.filter(l => l.urgent);
  const rest = filtered.filter(l => !l.urgent);

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <AppHeader navigate={navigate} />

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 80px" }}>
        {/* 필터 칩 */}
        <div style={{ display: "flex", gap: 7, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
          {filters.map(f => {
            const isActive = activeFilter === f;
            return (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: isActive ? 700 : 500,
                border: `1.5px solid ${isActive ? C.primary : C.borderStrong}`,
                background: isActive ? C.primary : C.surface,
                color: isActive ? "#fff" : C.textSecondary,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: isActive ? "0 2px 8px rgba(244,107,43,0.25)" : "none",
              }}>{f}</button>
            );
          })}
        </div>

        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            {urgent.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                  <span style={{ background: C.error, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, letterSpacing: 0.5 }}>마감임박</span>
                </div>
                {urgent.map((l, i) => (
                  <ListingCard key={l.id} listing={l} index={i} bookmarked={bookmarks[l.id]}
                    onBookmark={e => { e.stopPropagation(); setBookmarks(b => ({ ...b, [l.id]: !b[l.id] })); }}
                    onClick={() => navigate("detail", { listing: l })} />
                ))}
              </div>
            )}
            {rest.length > 0 && (
              <>
                <SectionTitle label="최신 공고" count={rest.length} accent />
                {rest.map((l, i) => (
                  <ListingCard key={l.id} listing={l} index={i} bookmarked={bookmarks[l.id]}
                    onBookmark={e => { e.stopPropagation(); setBookmarks(b => ({ ...b, [l.id]: !b[l.id] })); }}
                    onClick={() => navigate("detail", { listing: l })} />
                ))}
              </>
            )}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>🏠</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.textSecondary }}>해당 조건의 공고가 없어요</div>
                <div style={{ fontSize: 13, marginTop: 6, color: C.textMuted }}>다른 필터를 선택해보세요</div>
              </div>
            )}
          </>
        )}
      </div>
      <BottomTab active="home" navigate={navigate} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 탐색 화면
// ═══════════════════════════════════════════════════════════
const SearchScreen = ({ navigate }) => {
  const [dbListings, setDbListings] = useState([]);
  const [query, setQuery] = useState("");
  const [agency, setAgency] = useState("전체");
  const [region, setRegion] = useState("전체");
  const [bookmarks, setBookmarks] = useState({});
  const [focused, setFocused] = useState(false);
  const swipe = useSwipe(() => navigate("calendar", {}, "left"), () => navigate("home", {}, "right"));

  useEffect(() => {
    supabase.from("listings").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setDbListings(data.filter(l => !l.title?.includes("위례") && !l.title?.includes("마포")));
      });
  }, []);

  const all = [...dbListings, ...EXTRA_LISTINGS];
  const filtered = all.filter(l => {
    const matchQ = !query || l.title?.includes(query) || l.location?.includes(query);
    const matchA = agency === "전체" || l.agency === agency;
    const matchR = region === "전체" || l.location?.includes(region);
    return matchQ && matchA && matchR;
  });

  const Chip = ({ label, value, selected, onSelect }) => (
    <button onClick={() => onSelect(label)} style={{
      padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: selected ? 700 : 500,
      border: `1.5px solid ${selected ? C.primary : C.borderStrong}`,
      background: selected ? C.primary : C.surface,
      color: selected ? "#fff" : C.textSecondary,
      cursor: "pointer", transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      boxShadow: selected ? "0 2px 8px rgba(244,107,43,0.25)" : "none",
    }}>{label}</button>
  );

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <AppHeader navigate={navigate} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 80px" }}>
        {/* 검색창 */}
        <div style={{
          background: C.surface, borderRadius: 16,
          padding: "0 14px", display: "flex", alignItems: "center", gap: 10,
          marginBottom: 20,
          border: `1.5px solid ${focused ? C.primary : C.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(244,107,43,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
          transition: "all 0.2s",
          height: 48,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke={focused ? C.primary : C.textMuted} strokeWidth="1.8"/>
            <path d="M16.5 16.5L21 21" stroke={focused ? C.primary : C.textMuted} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input value={query} onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="지역, 단지명으로 검색"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: C.textPrimary, background: "none", fontWeight: 500 }} />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: C.bg, border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>

        {/* 필터 */}
        <div style={{ background: C.surface, borderRadius: 16, padding: "14px 14px", marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.8, marginBottom: 9, textTransform: "uppercase" }}>공급기관</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["전체","LH","GH","SH"].map(o => <Chip key={o} label={o} selected={agency===o} onSelect={setAgency} />)}
          </div>
          <div style={{ height: 1, background: C.border, margin: "12px 0" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.8, marginBottom: 9, textTransform: "uppercase" }}>지역</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["전체","서울","경기","인천"].map(o => <Chip key={o} label={o} selected={region===o} onSelect={setRegion} />)}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "0 2px" }}>
          <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>검색결과 <strong style={{ color: C.textPrimary }}>{filtered.length}건</strong></span>
        </div>

        {filtered.map((l, i) => (
          <ListingCard key={l.id} listing={l} index={i} bookmarked={bookmarks[l.id]}
            onBookmark={e => { e.stopPropagation(); setBookmarks(b => ({ ...b, [l.id]: !b[l.id] })); }}
            onClick={() => navigate("detail", { listing: l })} />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textSecondary }}>검색 결과가 없어요</div>
          </div>
        )}
      </div>
      <BottomTab active="search" navigate={navigate} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 공고 상세 화면
// ═══════════════════════════════════════════════════════════
const DetailScreen = ({ navigate, goBack, listing: l, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || "위치");
  const [selectedType, setSelectedType] = useState(l.floor_types?.[0] || "");
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [username, setUsername] = useState("익명");
  const [prices, setPrices] = useState([]);
  const [likedComments, setLikedComments] = useState({});

  const isLocal = String(l.id).startsWith("local-");
  const isTapseok = l.id === "local-gh-tapseok";
  const isGoyang = l.id === "local-lh-goyang";
  const applyUrl = l.apply_url || getApplyUrl(l.agency);
  const applyCenterName = () => {
    const a = l.agency?.toUpperCase();
    if (a === "LH") return "LH청약플러스";
    if (a === "SH") return "SH청약";
    return "GH 청약센터";
  };

  useEffect(() => {
    if (isLocal) return;
    supabase.from("comments").select("*").eq("listing_id", l.id).order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setComments(data); });
    supabase.from("prices").select("*").eq("listing_id", l.id)
      .then(({ data }) => { if (data) setPrices(data); });
  }, [l.id, isLocal]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    if (isLocal) {
      setComments(prev => [...prev, { id: Date.now(), listing_id: l.id, username, content: commentText, likes: 0, created_at: new Date().toISOString() }]);
    } else {
      const { data } = await supabase.from("comments").insert({ listing_id: l.id, username, content: commentText, likes: 0 }).select();
      if (data) setComments(prev => [...prev, ...data]);
    }
    setCommentText("");
  };

  const toggleLike = async (c) => {
    const isLiked = likedComments[c.id];
    const newLikes = c.likes + (isLiked ? -1 : 1);
    if (!isLocal) await supabase.from("comments").update({ likes: newLikes }).eq("id", c.id);
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

  const agencyFullName = (a) => {
    if (!a) return "";
    const u = a.toUpperCase();
    if (u === "GH") return "경기주택도시공사";
    if (u === "LH") return "한국토지주택공사";
    if (u === "SH") return "서울주택도시공사";
    return a;
  };

  const tabs = ["위치", "평면도", "분양가", "자격요건", "댓글"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      {/* 네비 */}
      <div style={{
        height: 54, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", padding: "0 14px", gap: 10, flexShrink: 0,
      }}>
        <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.textPrimary, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: -0.3 }}>{l.title}</span>
        <button onClick={() => setBookmarked(b => !b)} style={{
          background: bookmarked ? C.primaryLight : C.bg,
          border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          transform: bookmarked ? "scale(1.1)" : "scale(1)",
        }}>
          {bookmarked ? "🧡" : "🤍"}
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 80 }}>
        {/* 히어로 */}
        <div style={{ position: "relative", height: 220 }}>
          <img src={getDefaultImg(l)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.72) 100%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
            <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
              <AgencyBadge agency={l.agency} />
              <TypeBadge type={l.type} />
              {l.dday != null && <DdayBadge dday={l.dday} />}
            </div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1.3, letterSpacing: -0.5 }}>{l.title}</div>
            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, marginTop: 4 }}>{l.location}</div>
          </div>
        </div>

        {/* 요약 카드 */}
        <div style={{ margin: "12px 16px 0", background: C.surface, borderRadius: 18, padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          {l.urgent && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.errorLight, color: C.error, fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 20, marginBottom: 14 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              접수 {l.receipt_start} ~ {l.receipt_end}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
            {[
              ["공급기관", agencyFullName(l.agency)],
              ["공급유형", l.type],
              ["총세대수", `${l.units}세대`],
              ["전용면적", l.area],
              ["당첨발표", l.announce_date],
              ["입주예정", l.move_in],
            ].map(([k, v], i) => (
              <div key={k} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}`, borderRight: (i % 3 !== 2) ? `1px solid ${C.border}` : "none", paddingLeft: (i % 3 !== 0) ? 12 : 0 }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 3, letterSpacing: 0.3 }}>{k}</div>
                <div style={{ fontSize: 12, color: C.textPrimary, fontWeight: 700, lineHeight: 1.3 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 탭 */}
        <div style={{ background: C.surface, display: "flex", marginTop: 12, borderBottom: `1px solid ${C.border}`, overflowX: "auto", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)" }}>
          {tabs.map(t => {
            const label = t === "댓글" ? `댓글 ${comments.length}` : t;
            const isActive = activeTab === t;
            return (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: "13px 16px", fontSize: 13, fontWeight: isActive ? 700 : 500,
                border: "none", background: "none", cursor: "pointer", whiteSpace: "nowrap",
                color: isActive ? C.primary : C.textMuted,
                borderBottom: `2.5px solid ${isActive ? C.primary : "transparent"}`,
                marginBottom: -1, transition: "all 0.2s",
                letterSpacing: -0.2,
              }}>{label}</button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 */}
        <div style={{ padding: "16px 16px 0", animation: "fadeUp 0.25s cubic-bezier(0.22,1,0.36,1) both" }}>
          {activeTab === "위치" && (
            <>
              <div style={{ height: 140, background: `linear-gradient(135deg, ${C.primaryLight} 0%, #FFF8F5 100%)`, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 12, border: `1px solid ${C.border}` }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 8 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={C.primary} strokeWidth="1.8" fill={C.primaryLight}/><circle cx="12" cy="9" r="2.5" stroke={C.primary} strokeWidth="1.8" fill="none"/></svg>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary }}>{l.location}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>지도 연동 예정</div>
              </div>
              <div style={{ background: C.surface, borderRadius: 16, padding: "14px 16px", fontSize: 13, color: C.textSecondary, lineHeight: 1.8, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>{l.description}</div>
            </>
          )}

          {activeTab === "평면도" && (
            <>
              <div style={{ display: "flex", gap: 7, marginBottom: 14, overflowX: "auto" }}>
                {(l.floor_types || []).map(t => (
                  <button key={t} onClick={() => setSelectedType(t)} style={{
                    padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${selectedType === t ? C.primary : C.borderStrong}`,
                    background: selectedType === t ? C.primary : C.surface,
                    color: selectedType === t ? "#fff" : C.textSecondary,
                    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                    boxShadow: selectedType === t ? "0 2px 8px rgba(244,107,43,0.25)" : "none",
                  }}>{t}</button>
                ))}
              </div>
              <div style={{ height: 200, background: `linear-gradient(135deg, ${C.bg} 0%, #EEEEF2 100%)`, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 12, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.textSecondary, marginBottom: 4 }}>{selectedType} 평면도</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>이미지 업로드 예정</div>
              </div>
              <div style={{ background: C.primaryLight, borderRadius: 12, padding: "10px 14px", fontSize: 12, color: C.primary, fontWeight: 600, border: `1px solid rgba(244,107,43,0.15)` }}>
                {isTapseok ? "49형 (A·B·C 통합) · 전용 49.9㎡ · 개별난방(도시가스)" : isGoyang ? `${selectedType} · 전용 55㎡ · 지역난방` : selectedType?.startsWith("51") ? "전용 51㎡ · 2Bay · 침실2 욕실2" : "전용 59㎡ · 3Bay · 침실3 욕실2"}
              </div>
            </>
          )}

          {activeTab === "분양가" && (
            <>
              {isTapseok && (
                <div style={{ background: C.surface, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", marginBottom: 10 }}>
                  <div style={{ background: C.bg, padding: "10px 16px", fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>임대조건 (장기전세)</div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.textPrimary, letterSpacing: -0.5 }}>211,901,000<span style={{ fontSize: 14, fontWeight: 500, color: C.textMuted, marginLeft: 4 }}>원</span></div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>임대보증금 전액 · 월임대료 없음</div>
                    <div style={{ height: 1, background: C.border, margin: "12px 0" }} />
                    <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7 }}>
                      계약금 10% (21,190,000원) / 잔금 90% (190,711,000원)<br/>임대료 전환 불가 · 최장 20년 거주 · 분양전환 없음
                    </div>
                  </div>
                </div>
              )}
              {isGoyang && (
                <div style={{ background: C.surface, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", marginBottom: 10 }}>
                  <div style={{ background: C.bg, padding: "10px 16px", fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>임대조건 (행복주택)</div>
                  {[["55A·55AH", "152,800~153,200천원", "636,000~638,000원"], ["55B·55BH", "152,400천원", "635,000원"], ["55C", "152,400천원", "635,000원"]].map(([type, deposit, monthly], i) => (
                    <div key={i} style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{type}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>보증금 {deposit}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{monthly}</div>
                        <div style={{ fontSize: 10, color: C.textMuted }}>월임대료</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: "10px 16px", background: C.bg, fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
                    계약금 10% · 보증금↔월세 전환 가능 · 무자녀 10년 / 유자녀 14년
                  </div>
                </div>
              )}
              {!isTapseok && !isGoyang && (
                <div style={{ background: C.surface, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ background: C.bg, padding: "10px 16px", display: "grid", gridTemplateColumns: "56px 1fr 1fr 1fr" }}>
                    {["타입","구간","보증금","월임대료"].map(h => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 0.3 }}>{h}</div>
                    ))}
                  </div>
                  {prices.length > 0 ? prices.map((p, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr 1fr 1fr", padding: "10px 16px", borderTop: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.primary }}>{p.floor_type}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{p.interval_name}</div>
                      <div style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600 }}>{p.deposit}</div>
                      <div style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600 }}>{p.monthly}</div>
                    </div>
                  )) : (
                    <div style={{ padding: 24, textAlign: "center", color: C.textMuted, fontSize: 12 }}>분양가 정보 준비 중</div>
                  )}
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 11, color: C.textMuted, lineHeight: 1.7 }}>* 정확한 조건은 공고문 전문을 참조하세요.</div>
            </>
          )}

          {activeTab === "자격요건" && (
            <>
              {(isTapseok ? [
                { icon: "🏠", title: "무주택 요건", desc: "공고일(2026.04.17) 현재 무주택세대구성원. 단독 세대주(1인 가구)도 신청 가능." },
                { icon: "💰", title: "소득 기준", desc: "도시근로자 월평균소득 50% 이하 (1인 70%, 2인 60%). 출산자녀 수에 따라 10~20% 가산." },
                { icon: "📊", title: "자산 기준", desc: "총자산 41,700만원 이하 / 자동차 4,542만원 이하. 출산자녀 수에 따라 최대 5억까지 가산." },
                { icon: "📋", title: "신청 순위", desc: "1순위: 의정부시 / 2순위: 양주·남양주·구리·강북·도봉·노원 / 3순위: 기타" },
                { icon: "💳", title: "청약통장", desc: "주택청약종합저축 납입 횟수에 따라 배점 부여." },
              ] : isGoyang ? [
                { icon: "👫", title: "신청 대상", desc: "신혼부부(혼인 7년 이내 또는 6세 이하 자녀), 예비신혼부부, 한부모가족(6세 이하 자녀)" },
                { icon: "🏠", title: "무주택 요건", desc: "공고일(2026.06.16) 현재 무주택세대구성원 전원." },
                { icon: "💰", title: "소득 기준", desc: "일반: 2인 110%, 3인↑ 100% / 맞벌이: 2인 130%, 3인↑ 120% 이하. 출산자녀 가산 최대 140%." },
                { icon: "📊", title: "자산 기준", desc: "총자산 34,500만원 이하 / 자동차 4,542만원 이하. 최대 41,300만원까지 가산." },
                { icon: "📋", title: "신청 순위", desc: "1순위: 고양시·연접지역(서울·파주·김포·양주) / 2순위: 경기도·인천 / 3순위: 기타" },
              ] : [
                { icon: "🏠", title: "무주택 요건", desc: "입주자모집공고일 현재 무주택세대구성원" },
                { icon: "💰", title: "소득 기준", desc: "기준 중위소득 150% 이하 (세대원수별 차등)" },
                { icon: "📊", title: "자산 기준", desc: "총자산 3억 4,500만원 이하 / 자동차 4,542만원 이하" },
                { icon: "👥", title: "신청 대상", desc: "청년(18~39세) · 신혼부부(7년 이내) · 고령자(65세↑) · 일반" },
              ]).map((item, i) => (
                <div key={i} style={{
                  background: C.surface, borderRadius: 14, padding: "14px 16px",
                  marginBottom: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  display: "flex", gap: 12, alignItems: "flex-start",
                  animation: `fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 50}ms both`,
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4, letterSpacing: -0.2 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
              <a href={applyUrl} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                height: 48, background: C.primaryLight, color: C.primary,
                border: `1.5px solid rgba(244,107,43,0.25)`, borderRadius: 14,
                fontSize: 13, fontWeight: 700, textDecoration: "none", marginTop: 4,
              }}>
                📄 {applyCenterName()} 공고문 전체 보기
              </a>
            </>
          )}

          {activeTab === "댓글" && (
            <>
              {/* 입력창 */}
              <div style={{ background: C.surface, borderRadius: 16, padding: "14px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="닉네임"
                  style={{ width: "100%", border: "none", borderBottom: `1px solid ${C.border}`, outline: "none", fontSize: 12, color: C.textMuted, background: "none", marginBottom: 10, paddingBottom: 8, boxSizing: "border-box", fontWeight: 500 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="이 단지에 대해 이야기해요..."
                    onKeyDown={e => e.key === "Enter" && addComment()}
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 13, background: "none", color: C.textPrimary }} />
                  <button onClick={addComment} style={{
                    background: commentText.trim() ? C.primary : C.bg,
                    color: commentText.trim() ? "#fff" : C.textMuted,
                    border: "none", borderRadius: 10, padding: "7px 14px",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                  }}>등록</button>
                </div>
              </div>

              {comments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 0", color: C.textMuted }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textSecondary }}>첫 댓글을 남겨보세요</div>
                </div>
              ) : comments.map((c, i) => (
                <div key={c.id} style={{
                  background: C.surface, borderRadius: 14, padding: "14px",
                  marginBottom: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  animation: `fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 40}ms both`,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, background: `hsl(${c.username?.charCodeAt(0) * 15 % 360}, 60%, 55%)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                      {c.username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{c.username}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{timeAgo(c.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7, paddingLeft: 42, marginBottom: 8 }}>{c.content}</div>
                  <div style={{ display: "flex", gap: 12, paddingLeft: 42 }}>
                    <button onClick={() => toggleLike(c)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: likedComments[c.id] ? C.primary : C.textMuted, fontWeight: likedComments[c.id] ? 700 : 400, display: "flex", alignItems: "center", gap: 3, transition: "all 0.2s" }}>
                      {likedComments[c.id] ? "🧡" : "👍"} {c.likes}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 하단 CTA */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`, padding: "12px 16px 16px", display: "flex", gap: 10 }}>
        <button onClick={() => setBookmarked(b => !b)} style={{
          flex: 1, height: 50, background: bookmarked ? C.primaryLight : C.bg,
          color: bookmarked ? C.primary : C.textSecondary,
          border: `1.5px solid ${bookmarked ? C.primary : C.borderStrong}`,
          borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer",
          transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          {bookmarked ? "🧡 저장됨" : "🤍 관심 단지"}
        </button>
        <a href={applyUrl} target="_blank" rel="noreferrer" style={{
          flex: 2, height: 50, background: C.primary, color: "#fff",
          borderRadius: 14, fontSize: 13, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none", letterSpacing: -0.2,
          boxShadow: "0 4px 16px rgba(244,107,43,0.4)",
          transition: "all 0.2s",
        }}>
          {applyCenterName()}에서 신청 →
        </a>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 캘린더 화면
// ═══════════════════════════════════════════════════════════
const CalendarScreen = ({ navigate }) => {
  const [dbListings, setDbListings] = useState([]);
  const swipe = useSwipe(() => navigate("community", {}, "left"), () => navigate("search", {}, "right"));

  useEffect(() => {
    supabase.from("listings").select("*").then(({ data }) => { if (data) setDbListings(data); });
  }, []);

  const allListings = [...dbListings, ...EXTRA_LISTINGS];
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const eventDays = { 16: C.primary, 26: C.lh.dot, 30: C.error };

  const events = [
    { date: "06.26", title: "고양창릉 A-4BL · 신청 시작", agency: "LH", listingId: "local-lh-goyang", color: C.lh.dot },
    { date: "06.30", title: "고양창릉 A-4BL · 접수 마감", agency: "LH", listingId: "local-lh-goyang", color: C.error },
    { date: "06.16", title: "이반고수 오픈!", agency: null, listingId: null, color: C.primary },
  ];

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <AppHeader navigate={navigate} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 80px" }}>
        {/* 달력 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button style={{ fontSize: 22, color: C.textSecondary, background: "none", border: "none", cursor: "pointer", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.5 }}>2026년 6월</span>
          <button style={{ fontSize: 22, color: C.textSecondary, background: "none", border: "none", cursor: "pointer", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>

        {/* 달력 */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "14px 10px 16px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 10 }}>
            {["일","월","화","수","목","금","토"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: C.textMuted, padding: "2px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px 0" }}>
            {days.map(d => {
              const isToday = d === 16;
              const dot = eventDays[d];
              return (
                <div key={d} style={{ height: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 12, background: isToday ? C.primary : "transparent", position: "relative", cursor: dot ? "pointer" : "default", transition: "background 0.15s" }}>
                  <span style={{ fontSize: 13, color: isToday ? "#fff" : C.textPrimary, fontWeight: isToday ? 800 : 400 }}>{d}</span>
                  {dot && !isToday && <div style={{ width: 5, height: 5, background: dot, borderRadius: "50%", position: "absolute", bottom: 5, transition: "all 0.2s" }} />}
                </div>
              );
            })}
          </div>
        </div>

        <SectionTitle label="6월 청약 일정" accent />
        <div style={{ background: C.surface, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {events.map((ev, i) => (
            <div key={i}
              onClick={() => { if (!ev.listingId) return; const found = allListings.find(x => x.id === ev.listingId || String(x.id) === String(ev.listingId)); if (found) navigate("detail", { listing: found }); }}
              style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px", borderBottom: i < events.length-1 ? `1px solid ${C.border}` : "none", cursor: ev.listingId ? "pointer" : "default", transition: "background 0.15s" }}
              onMouseEnter={e => { if (ev.listingId) e.currentTarget.style.background = C.bg; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, display: "flex", alignItems: "center", gap: 5, letterSpacing: -0.2 }}>
                  {ev.agency && <AgencyBadge agency={ev.agency} />}{ev.title}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{ev.date}</div>
              </div>
              {ev.listingId && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round"/></svg>
              )}
            </div>
          ))}
        </div>
      </div>
      <BottomTab active="calendar" navigate={navigate} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 소통 화면
// ═══════════════════════════════════════════════════════════
const CommunityScreen = ({ navigate }) => {
  const [allComments, setAllComments] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const swipe = useSwipe(() => navigate("mypage", {}, "left"), () => navigate("calendar", {}, "right"));

  useEffect(() => {
    Promise.all([
      supabase.from("comments").select("*").order("created_at", { ascending: false }),
      supabase.from("listings").select("*"),
    ]).then(([{ data: comments }, { data: listingsData }]) => {
      if (comments) setAllComments(comments);
      if (listingsData) setListings(listingsData);
      setLoading(false);
    });
  }, []);

  const getListing = (listingId) => {
    const extra = EXTRA_LISTINGS.find(l => l.id === listingId);
    if (extra) return extra;
    return listings.find(l => String(l.id) === String(listingId)) || null;
  };

  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1) return "방금";
    if (m < 60) return `${m}분 전`;
    if (m < 1440) return `${Math.floor(m/60)}시간 전`;
    return `${Math.floor(m/1440)}일 전`;
  };

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <AppHeader navigate={navigate} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 80px" }}>
        <SectionTitle label="전체 댓글" count={allComments.length} accent />

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>
            <div style={{ fontSize: 13 }}>불러오는 중...</div>
          </div>
        ) : allComments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>💬</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.textSecondary }}>아직 댓글이 없어요</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>공고 상세에서 첫 댓글을 남겨보세요!</div>
          </div>
        ) : (
          allComments.map((c, i) => {
            const listing = getListing(c.listing_id);
            return (
              <div key={c.id}
                onClick={() => { if (listing) navigate("detail", { listing, initialTab: "댓글" }); }}
                style={{
                  background: C.surface, borderRadius: 16, padding: "14px",
                  marginBottom: 10, cursor: listing ? "pointer" : "default",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
                  animation: `fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 40}ms both`,
                }}
                onMouseEnter={e => { if (listing) e.currentTarget.style.transform = "translateY(-1px)"; if (listing) e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)"; }}
              >
                {/* 공고명 */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                  {listing?.agency && <AgencyBadge agency={listing.agency} />}
                  <span style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {listing?.title || "알 수 없는 공고"}
                  </span>
                  {listing && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round"/></svg>
                  )}
                </div>
                {/* 댓글 */}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, background: `hsl(${c.username?.charCodeAt(0) * 15 % 360}, 60%, 55%)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                    {c.username?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{c.username}</span>
                      <span style={{ fontSize: 10, color: C.textMuted }}>{timeAgo(c.created_at)}</span>
                      {c.likes > 0 && <span style={{ fontSize: 10, color: C.textMuted, marginLeft: "auto" }}>🧡 {c.likes}</span>}
                    </div>
                    <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>{c.content}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <BottomTab active="community" navigate={navigate} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 마이페이지
// ═══════════════════════════════════════════════════════════
const MypageScreen = ({ navigate }) => {
  const swipe = useSwipe(() => {}, () => navigate("community", {}, "right"));
  const stats = [["3", "관심 단지", "🏠"], ["12", "작성 댓글", "💬"], ["68", "청약 가점", "⭐"]];
  const menus = [
    ["🧮", "청약 가점 계산기", "내 점수 확인해보기"],
    ["🔔", "알림 설정", "마감 전 알림 받기"],
    ["📋", "내 댓글 모아보기", "내가 남긴 댓글"],
    ["❓", "청약 용어 사전", "어려운 용어 해설"],
  ];

  return (
    <div {...swipe} style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <AppHeader navigate={navigate} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 80px" }}>
        {/* 프로필 카드 */}
        <div style={{ background: C.primary, borderRadius: 20, padding: "22px 18px", marginBottom: 12, display: "flex", gap: 14, alignItems: "center", boxShadow: "0 6px 24px rgba(244,107,43,0.35)" }}>
          <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.22)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "2px solid rgba(255,255,255,0.35)", flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>이지은</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>신혼부부 · 경기 수원시</div>
          </div>
          <button style={{ fontSize: 11, border: "1.5px solid rgba(255,255,255,0.45)", padding: "5px 13px", borderRadius: 20, background: "transparent", color: "#fff", cursor: "pointer", fontWeight: 600 }}>편집</button>
        </div>

        {/* 통계 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {stats.map(([n, label, icon]) => (
            <div key={label} style={{ flex: 1, background: C.surface, borderRadius: 16, padding: "16px 10px", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 11, marginBottom: 5 }}>{icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: label === "청약 가점" ? C.primary : C.textPrimary, letterSpacing: -1 }}>{n}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 메뉴 */}
        <div style={{ background: C.surface, borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {menus.map(([icon, label, sub], i, arr) => (
            <div key={label} style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.bg; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 38, height: 38, background: C.primaryLight, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, letterSpacing: -0.2 }}>{label}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
          ))}
        </div>
      </div>
      <BottomTab active="mypage" navigate={navigate} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 메인 앱
// ═══════════════════════════════════════════════════════════
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
      }, 280);
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
    }, 280);
  }, [history]);

  const slideStyle = slideDir === "left"
    ? { animation: "slideInLeft 0.28s cubic-bezier(0.22,1,0.36,1)" }
    : slideDir === "right"
    ? { animation: "slideInRight 0.28s cubic-bezier(0.22,1,0.36,1)" }
    : {};

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, 'Pretendard', BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(48px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(-48px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -400% 0; }
          100% { background-position: 400% 0; }
        }
        @keyframes fadeUp {
          from { transform: translateY(14px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        input, button { font-family: inherit; }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", ...slideStyle }}>
          {screen === "home"      && <HomeScreen      navigate={navigate} goBack={goBack} />}
          {screen === "search"    && <SearchScreen    navigate={navigate} goBack={goBack} />}
          {screen === "detail"    && <DetailScreen    navigate={navigate} goBack={goBack} {...params} />}
          {screen === "calendar"  && <CalendarScreen  navigate={navigate} goBack={goBack} />}
          {screen === "community" && <CommunityScreen navigate={navigate} goBack={goBack} />}
          {screen === "mypage"    && <MypageScreen    navigate={navigate} goBack={goBack} />}
        </div>
      </div>
    </div>
  );
}
