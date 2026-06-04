"use client";

import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useEffect, useMemo, useRef, useState } from "react";

const Home: NextPage = () => {
  const linusImages = [
    "/linus/site5-42faac9c-6f2e-4a14-9200-bb397d81271a.webp",
    "/linus/site5-5c0cd3cf-3b3a-4d2e-b277-6240dabf25d9.webp",
    "/linus/site5-67bf14dc-bbd0-4a7e-86f6-abed6fae68e7.webp",
    "/linus/site5-7ac4a4a3-959a-4fbc-ac84-f305cb92b232.webp",
    "/linus/site5-806b04b3-8d4d-4823-8f3c-baeeb8e4c5bc.webp",
    "/linus/site5-9b1f0c38-4b39-44fd-99c6-dfbc73770fed.webp",
    "/linus/site5-9f7b1d53-83d0-441f-9289-ee4eed35b953.webp",
    "/linus/site5-a9224e6e-8384-4739-940c-1914bc32951d.webp",
    "/linus/site5-c7e03a7b-0ee0-4743-891e-cecf150b9882.jpg",
    "/linus/site5-ecfd4851-c951-44b3-bd04-60f9e809cf22.webp",
  ];
  // 参考布局：使用水平滚动容器 + 左右箭头，无分页与自动播放
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const scrollCarousel = (dir: "prev" | "next") => {
    const el = carouselRef.current;
    if (!el) return;
    const delta = dir === "prev" ? -el.clientWidth : el.clientWidth; // 每次滚动一个“视口宽度”
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // 自适应图片组件：按图片真实宽高设置容器 aspect-ratio，支持清晰度与尺寸控制
  const AdaptiveImage = ({
    src,
    alt = "",
    sizes = "260px",
    className = "",
    fixedAspect,
    fit = "contain",
    quality = 85,
    priority = false,
    maxHeight,
  }: {
    src: string;
    alt?: string;
    sizes?: string;
    className?: string;
    fixedAspect?: string;
    fit?: "contain" | "cover";
    quality?: number;
    priority?: boolean;
    maxHeight?: string;
  }) => {
    const [ratio, setRatio] = useState<{ w: number; h: number } | null>(null);
    const aspect = fixedAspect || (ratio ? `${ratio.w} / ${ratio.h}` : "4 / 3");
    return (
      <div className="relative w-full" style={{ aspectRatio: aspect, maxHeight: maxHeight }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
          onLoadingComplete={img => setRatio({ w: img.naturalWidth, h: img.naturalHeight })}
        />
      </div>
    );
  };

  // 动态主色提取：从图片中取平均色，作为点缀增强高级感
  const useImagePalette = (src: string) => {
    const [color, setColor] = useState<string | null>(null);
    useEffect(() => {
      if (!src) return;
      const img = new window.Image();
      img.src = src;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, 32, 32);
          const data = ctx.getImageData(0, 0, 32, 32).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            n++;
          }
          r = Math.round(r / n);
          g = Math.round(g / n);
          b = Math.round(b / n);
          const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          setColor(hex);
        } catch (e) {
          // palette 提取失败时忽略
        }
      };
    }, [src]);
    return color;
  };

  // 分类横条数据与滚动逻辑
  const categories = useMemo(
    () => [
      "英雄",
      "位置",
      "上单",
      "打野",
      "中单",
      "下路",
      "辅助",
      "阵营",
      "德玛西亚",
      "诺克萨斯",
      "艾欧尼亚",
      "皮尔特沃夫",
      "祖安",
      "弗雷尔卓德",
      "班德尔城",
      "暗影岛",
      "恕瑞玛",
      "地图",
      "召唤师峡谷",
      "极地大乱斗",
      "云顶之弈",
      "赛事",
      "战队",
      "皮肤",
      "原画",
    ],
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const catScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollCategories = (dir: "prev" | "next") => {
    const el = catScrollRef.current;
    if (!el) return;
    const delta = dir === "prev" ? -300 : 300;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // 作品标签与网格
  const workTags = useMemo(
    () => [
      "全部",
      "上单",
      "打野",
      "中单",
      "下路",
      "辅助",
      "德玛西亚",
      "诺克萨斯",
      "艾欧尼亚",
      "祖安",
      "弗雷尔卓德",
      "恕瑞玛",
    ],
    [],
  );
  const [selectedWorkTag, setSelectedWorkTag] = useState<string>(workTags[0]);
  const [seed, setSeed] = useState(0); // 用于刷新“推荐”顺序
  const shuffle = <T,>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = (i * 9301 + seed * 49297 + 233280) % (i + 1);
      const jj = Math.floor(j);
      [a[i], a[jj]] = [a[jj], a[i]];
    }
    return a;
  };

  type WorkItem = { id: string; img: string; title: string; author: string; like: number; view: number; tag: string };
  const baseWorks: WorkItem[] = useMemo(() => {
    const tagsCycle = [
      "上单",
      "打野",
      "中单",
      "下路",
      "辅助",
      "德玛西亚",
      "诺克萨斯",
      "艾欧尼亚",
      "祖安",
      "弗雷尔卓德",
      "恕瑞玛",
    ];
    return Array.from({ length: 18 }).map((_, i) => ({
      id: `w-${i}`,
      img: linusImages[i % linusImages.length],
      title: `作品 ${i + 1}`,
      author: `作者 ${i + 1}`,
      like: 100 + i * 7,
      view: 800 + i * 13,
      tag: tagsCycle[i % tagsCycle.length],
    }));
  }, [linusImages]);

  const recommendWorks = useMemo(() => shuffle(baseWorks), [baseWorks, seed]);
  const filteredRecommendWorks = useMemo(
    () => (selectedWorkTag === "全部" ? recommendWorks : recommendWorks.filter(w => w.tag === selectedWorkTag)),
    [recommendWorks, selectedWorkTag],
  );
  const refreshRecommendWorks = () => setSeed(s => s + 1);

  const tabs = [
    { key: "recommend", label: "推荐" },
    { key: "follow", label: "关注" },
    { key: "standings", label: "积分" },
    { key: "latest", label: "最新" },
  ] as const;
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]["key"]>("recommend");
  const [standingsLeague, setStandingsLeague] = useState("LCK");
  const [standings, setStandings] = useState<{ league: { key: string; label: string }; rankings: { name: string; slug?: string; code?: string; image?: string; wins?: number; losses?: number }[] } | null>(null);
  useEffect(() => {
    if (selectedTab !== "standings") return;
    const load = async () => {
      try {
        const res = await fetch(`/api/esports/standings?league=${encodeURIComponent(standingsLeague)}`);
        if (!res.ok) throw new Error("standings fetch failed");
        const json = await res.json();
        setStandings(json?.data || null);
      } catch (e) {
        console.warn("standings load failed", e);
      }
    };
    load();
  }, [selectedTab, standingsLeague]);
  // 英雄联盟赛区与战队数据（当前覆盖 LCK / LPL / LEC）
  // 队徽文件匹配：约定 public/teams/<logoSlug>.svg|png
  const slugifyTeam = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  type TeamInfo = {
    name: string;
    logoSlug?: string; // 若未提供则使用基于 name 的 slug
    url?: string; // 官方或 LoLEsports
    wiki?: string; // Liquipedia 链接
    roster?: { role: "上" | "野" | "中" | "下" | "辅"; player: string }[]; // 可选阵容
  };

  type LeagueInfo = { key: string; label: string; teams: TeamInfo[] };

  const defaultLeagues = useMemo(
    () => [
      {
        key: "LCK",
        label: "LCK",
        teams: [
          { name: "T1", logoSlug: "t1", url: "https://lolesports.com/team/t1", wiki: "https://liquipedia.net/leagueoflegends/T1", roster: [
            { role: "上", player: "Zeus" },
            { role: "野", player: "Oner" },
            { role: "中", player: "Faker" },
            { role: "下", player: "Gumayusi" },
            { role: "辅", player: "Keria" },
          ] },
          { name: "Gen.G", logoSlug: "gen-g", wiki: "https://liquipedia.net/leagueoflegends/Gen.G" },
          { name: "KT Rolster", logoSlug: "kt-rolster", wiki: "https://liquipedia.net/leagueoflegends/KT_Rolster" },
          { name: "Hanwha Life Esports", logoSlug: "hanwha-life-esports", wiki: "https://liquipedia.net/leagueoflegends/Hanwha_Life_Esports" },
          { name: "Dplus KIA", logoSlug: "dplus-kia", wiki: "https://liquipedia.net/leagueoflegends/Dplus_KIA" },
          { name: "DRX", wiki: "https://liquipedia.net/leagueoflegends/DRX" },
          { name: "Nongshim RedForce", logoSlug: "nongshim-redforce", wiki: "https://liquipedia.net/leagueoflegends/Nongshim_RedForce" },
          { name: "Kwangdong Freecs", logoSlug: "kwangdong-freecs", wiki: "https://liquipedia.net/leagueoflegends/Kwangdong_Freecs" },
          { name: "BRION", wiki: "https://liquipedia.net/leagueoflegends/BRION" },
          { name: "FearX", wiki: "https://liquipedia.net/leagueoflegends/FearX" },
    ] as TeamInfo[],
      },
      {
        key: "LPL",
        label: "LPL",
        teams: [
          { name: "JDG", wiki: "https://liquipedia.net/leagueoflegends/JDG_Intel_Esports_Club" },
          { name: "TES", wiki: "https://liquipedia.net/leagueoflegends/Top_Esports" },
          { name: "BLG", wiki: "https://liquipedia.net/leagueoflegends/Bilibili_Gaming" },
          { name: "LNG", wiki: "https://liquipedia.net/leagueoflegends/LNG_Esports" },
          { name: "EDG", wiki: "https://liquipedia.net/leagueoflegends/EDward_Gaming" },
          { name: "RNG", wiki: "https://liquipedia.net/leagueoflegends/Royal_Never_Give_Up" },
          { name: "IG", wiki: "https://liquipedia.net/leagueoflegends/Invictus_Gaming" },
          { name: "WE", wiki: "https://liquipedia.net/leagueoflegends/Team_WE" },
          { name: "OMG", wiki: "https://liquipedia.net/leagueoflegends/Oh_My_God" },
          { name: "FPX", wiki: "https://liquipedia.net/leagueoflegends/FunPlus_Phoenix" },
          { name: "WBG", wiki: "https://liquipedia.net/leagueoflegends/Weibo_Gaming" },
          { name: "NIP", wiki: "https://liquipedia.net/leagueoflegends/Ninjas_in_Pyjamas" },
          { name: "LGD", wiki: "https://liquipedia.net/leagueoflegends/LGD_Gaming" },
          { name: "RA", wiki: "https://liquipedia.net/leagueoflegends/Rare_Atom" },
          { name: "TT", wiki: "https://liquipedia.net/leagueoflegends/TT_Esports" },
          { name: "AL", wiki: "https://liquipedia.net/leagueoflegends/Anyone's_Legend" },
          { name: "UP", wiki: "https://liquipedia.net/leagueoflegends/Ultra_Prime" },
    ] as TeamInfo[],
      },
      {
        key: "LEC",
        label: "LEC",
        teams: [
          { name: "G2 Esports", wiki: "https://liquipedia.net/leagueoflegends/G2_Esports" },
          { name: "Fnatic", wiki: "https://liquipedia.net/leagueoflegends/Fnatic" },
          { name: "Team Vitality", wiki: "https://liquipedia.net/leagueoflegends/Team_Vitality" },
          { name: "MAD Lions", wiki: "https://liquipedia.net/leagueoflegends/MAD_Lions" },
          { name: "SK Gaming", wiki: "https://liquipedia.net/leagueoflegends/SK_Gaming" },
          { name: "Team BDS", wiki: "https://liquipedia.net/leagueoflegends/Team_BDS" },
          { name: "KOI", wiki: "https://liquipedia.net/leagueoflegends/KOI" },
          { name: "Team Heretics", wiki: "https://liquipedia.net/leagueoflegends/Team_Heretics" },
          { name: "Karmine Corp", wiki: "https://liquipedia.net/leagueoflegends/Karmine_Corp" },
          { name: "GIANTX", wiki: "https://liquipedia.net/leagueoflegends/GIANTX" },
    ] as TeamInfo[],
      },
      {
        key: "LCS",
        label: "LCS",
        teams: [
          { name: "Cloud9", wiki: "https://liquipedia.net/leagueoflegends/Cloud9" },
          { name: "Team Liquid", wiki: "https://liquipedia.net/leagueoflegends/Team_Liquid" },
          { name: "100 Thieves", wiki: "https://liquipedia.net/leagueoflegends/100_Thieves" },
          { name: "NRG", wiki: "https://liquipedia.net/leagueoflegends/NRG" },
          { name: "FlyQuest", wiki: "https://liquipedia.net/leagueoflegends/FlyQuest" },
          { name: "Dignitas", wiki: "https://liquipedia.net/leagueoflegends/Dignitas" },
          { name: "Golden Guardians", wiki: "https://liquipedia.net/leagueoflegends/Golden_Guardians" },
          { name: "Immortals", wiki: "https://liquipedia.net/leagueoflegends/Immortals" },
          { name: "TSM", wiki: "https://liquipedia.net/leagueoflegends/TSM" },
          { name: "Shopify Rebellion", wiki: "https://liquipedia.net/leagueoflegends/Shopify_Rebellion" },
        ] as TeamInfo[],
      },
      { key: "PCS", label: "PCS", teams: [
        { name: "PSG Talon", wiki: "https://liquipedia.net/leagueoflegends/PSG_Talon" },
        { name: "CFO Flying Oyster", wiki: "https://liquipedia.net/leagueoflegends/CTBC_Flying_Oyster" },
        { name: "Beyond Gaming", wiki: "https://liquipedia.net/leagueoflegends/Beyond_Gaming" },
        { name: "Impunity", wiki: "https://liquipedia.net/leagueoflegends/Impunity" },
        { name: "Deep Cross Gaming", wiki: "https://liquipedia.net/leagueoflegends/Deep_Cross_Gaming" },
        { name: "Hell Pigs", wiki: "https://liquipedia.net/leagueoflegends/Hell_Pigs" },
      ] as TeamInfo[] },
      { key: "VCS", label: "VCS", teams: [
        { name: "GAM Esports", wiki: "https://liquipedia.net/leagueoflegends/GAM_Esports" },
        { name: "Saigon Buffalo", wiki: "https://liquipedia.net/leagueoflegends/Saigon_Buffalo" },
        { name: "Team Secret", wiki: "https://liquipedia.net/leagueoflegends/Team_Secret" },
        { name: "CERBERUS Esports", wiki: "https://liquipedia.net/leagueoflegends/CERBERUS_Esports" },
        { name: "SBTC Esports", wiki: "https://liquipedia.net/leagueoflegends/SBTC_Esports" },
        { name: "Team Flash", wiki: "https://liquipedia.net/leagueoflegends/Team_Flash" },
      ] as TeamInfo[] },
      { key: "LJL", label: "LJL", teams: [
        { name: "DetonatioN FocusMe", wiki: "https://liquipedia.net/leagueoflegends/DetonatioN_FocusMe" },
        { name: "Sengoku Gaming", wiki: "https://liquipedia.net/leagueoflegends/Sengoku_Gaming" },
        { name: "FENNEL", wiki: "https://liquipedia.net/leagueoflegends/FENNEL" },
        { name: "Burning Core", wiki: "https://liquipedia.net/leagueoflegends/Burning_Core" },
        { name: "SoftBank HAWKS", wiki: "https://liquipedia.net/leagueoflegends/SoftBank_HAWKS_Gaming" },
        { name: "Crest Gaming Act", wiki: "https://liquipedia.net/leagueoflegends/Crest_Gaming_Act" },
      ] as TeamInfo[] },
      { key: "CBLOL", label: "CBLOL", teams: [
        { name: "LOUD", wiki: "https://liquipedia.net/leagueoflegends/LOUD" },
        { name: "paiN Gaming", wiki: "https://liquipedia.net/leagueoflegends/PaiN_Gaming" },
        { name: "RED Canids", wiki: "https://liquipedia.net/leagueoflegends/RED_Canids_Kalunga" },
        { name: "FURIA", wiki: "https://liquipedia.net/leagueoflegends/FURIA" },
        { name: "INTZ", wiki: "https://liquipedia.net/leagueoflegends/INTZ" },
        { name: "Fluxo", wiki: "https://liquipedia.net/leagueoflegends/Fluxo" },
        { name: "KaBuM!", wiki: "https://liquipedia.net/leagueoflegends/KaBuM!_Esports" },
        { name: "Liberty", wiki: "https://liquipedia.net/leagueoflegends/Liberty" },
      ] as TeamInfo[] },
      { key: "LLA", label: "LLA", teams: [
        { name: "Estral Esports", wiki: "https://liquipedia.net/leagueoflegends/Estral_Esports" },
        { name: "Rainbow7", wiki: "https://liquipedia.net/leagueoflegends/Rainbow7" },
        { name: "Isurus", wiki: "https://liquipedia.net/leagueoflegends/Isurus" },
        { name: "Infinity", wiki: "https://liquipedia.net/leagueoflegends/Infinity_Esports" },
        { name: "All Knights", wiki: "https://liquipedia.net/leagueoflegends/All_Knights" },
        { name: "Team Aze", wiki: "https://liquipedia.net/leagueoflegends/Team_Aze" },
      ] as TeamInfo[] },
    ],
    [],
  );

  const [remoteLeagues, setRemoteLeagues] = useState<LeagueInfo[] | null>(null);
  useEffect(() => {
    // 拉取服务端聚合的赛区与战队列表
    const load = async () => {
      try {
        const res = await fetch("/api/esports/leagues");
        if (!res.ok) throw new Error("fetch leagues failed");
        const json = await res.json();
        const data = (json?.data || []) as LeagueInfo[];
        if (Array.isArray(data) && data.length > 0) setRemoteLeagues(data);
      } catch (err) {
        // 保持静态回退，不打扰用户
        console.warn("esports leagues load failed", err);
      }
    };
    load();
  }, []);

  // 关注页：为卡片补充战队胜负与下一场信息
  const [standingsByLeague, setStandingsByLeague] = useState<Record<string, Record<string, { wins?: number; losses?: number }>>>({});
  const [nextMatchByLeague, setNextMatchByLeague] = useState<Record<string, Record<string, { opponent: string; startTime: string }>>>({});
  const [rostersByLeague, setRostersByLeague] = useState<Record<string, Record<string, { role: "上" | "野" | "中" | "下" | "辅"; player: string }[]>>>({});
  const [rosterSubsByLeague, setRosterSubsByLeague] = useState<Record<string, Record<string, string[]>>>({});
  useEffect(() => {
    if (selectedTab !== "follow") return;
    const leaguesToLoad = (remoteLeagues ?? defaultLeagues).map(l => l.key);
    const unique = Array.from(new Set(leaguesToLoad));
    // 并发加载各赛区的积分、赛程与阵容
    Promise.all(
      unique.map(async (leagueKey) => {
        try {
          const [sRes, mRes, rRes] = await Promise.all([
            fetch(`/api/esports/standings?league=${encodeURIComponent(leagueKey)}`),
            fetch(`/api/esports/schedule?league=${encodeURIComponent(leagueKey)}`),
            fetch(`/api/esports/rosters?league=${encodeURIComponent(leagueKey)}`),
          ]);
          if (sRes.ok) {
            const sJson = await sRes.json();
            const rankings = (sJson?.data?.rankings || []) as { name: string; slug?: string; wins?: number; losses?: number }[];
            setStandingsByLeague(prev => ({
              ...prev,
              [leagueKey]: rankings.reduce((acc, t) => {
                const key = t.slug || slugifyTeam(t.name);
                acc[key] = { wins: t.wins, losses: t.losses };
                return acc;
              }, {} as Record<string, { wins?: number; losses?: number }>),
            }));
          }
          if (mRes.ok) {
            const mJson = await mRes.json();
            const nextByTeam = (mJson?.data?.nextByTeam || {}) as Record<string, { opponent: string; startTime: string }>;
            // 将 team 名称转为 slug key
            const mapped: Record<string, { opponent: string; startTime: string }> = {};
            Object.entries(nextByTeam).forEach(([teamName, info]) => {
              mapped[slugifyTeam(teamName)] = info;
            });
            setNextMatchByLeague(prev => ({ ...prev, [leagueKey]: mapped }));
          }
          if (rRes.ok) {
            const rJson = await rRes.json();
            const rostersByTeam = (rJson?.data?.rostersByTeam || {}) as Record<string, { role: "上" | "野" | "中" | "下" | "辅"; player: string }[]>;
            const subsByTeam = (rJson?.data?.subsByTeam || {}) as Record<string, string[]>;
            if (rostersByTeam && Object.keys(rostersByTeam).length > 0) {
              setRostersByLeague(prev => ({ ...prev, [leagueKey]: rostersByTeam }));
            }
            if (subsByTeam && Object.keys(subsByTeam).length > 0) {
              setRosterSubsByLeague(prev => ({ ...prev, [leagueKey]: subsByTeam }));
            }
          }
        } catch (e) {
          // 静默失败，保留现有显示
          console.warn("follow extra load failed", leagueKey, e);
        }
      })
    ).catch(() => void 0);
  }, [selectedTab, remoteLeagues, defaultLeagues]);
  // 下方图片查看弹窗
  const [viewer, setViewer] = useState<WorkItem | null>(null);
  const [closing, setClosing] = useState(false);
  const accent = useImagePalette(viewer?.img || "");
  useEffect(() => { setClosing(false); }, [viewer]);
  const handleCloseViewer = () => {
    setClosing(true);
    setTimeout(() => setViewer(null), 500);
  };

  // 作品流转与评论示例数据（根据当前 viewer 动态生成）
  const provenance = useMemo(() => {
    if (!viewer) return [] as Array<any>;
    return [
      { at: "2024-03-01 10:24", action: "铸造", by: viewer.author, tx: "0x9e...a7" },
      { at: "2024-03-06 14:02", action: "转移", by: "0xA1b...19", to: "0xF5c...02", tx: "0x71...4b" },
      { at: "2024-04-10 09:10", action: "上架", by: "0xF5c...02", price: "0.28 ETH", tx: "0x88...11" },
      { at: "2024-04-12 18:33", action: "成交", by: "0xF5c...02", to: "0x3D4...9c", price: "0.28 ETH", tx: "0x98...de" },
    ];
  }, [viewer]);

  const comments = useMemo(() => {
    if (!viewer) return [] as Array<any>;
    return [
      { user: "Alice", when: "2天前", text: "光影很高级，细节处理很到位。", up: 12 },
      { user: "Bob", when: "1天前", text: "主题和构图很耐看，收藏了。", up: 8 },
      { user: "陈一", when: "5小时前", text: "色彩层次很舒服，想看作者更多作品！", up: 5 },
    ];
  }, [viewer]);

  return (
    <section className="w-full bg-base-200">
      <div className="relative w-full mx-auto max-w-none px-2 md:px-4 py-6">
        {/* 参考样式：卡片式横滑区域 + 左右箭头 */}
        <div className="relative overflow-hidden rounded-2xl bg-base-300/40">
          {/* 左箭头 */}
          <button
            aria-label="上一页"
            onClick={() => scrollCarousel("prev")}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 btn btn-circle btn-ghost bg-black/40 hover:bg-black/60"
          >
            {/* 简洁的左箭头 */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* 右箭头 */}
          <button
            aria-label="下一页"
            onClick={() => scrollCarousel("next")}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 btn btn-circle btn-ghost bg-black/40 hover:bg-black/60"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* 轨道：横向滚动，卡片在不同断点显示 2/3/4 列 */}
          <div ref={carouselRef} className="overflow-x-auto no-scrollbar px-2 py-4" style={{ scrollBehavior: "smooth" }}>
            <div className="flex gap-3 sm:gap-4">
              {linusImages.map((src, idx) => (
                <div
                  key={`hero-${idx}`}
                  className="group relative flex-0 basis-1/2 sm:basis-1/3 lg:basis-1/4 bg-base-100 rounded-2xl overflow-hidden shadow-lg"
                >
                  {/* 卡片图片：完整显示 */}
                  <AdaptiveImage src={src} alt="promo" sizes="(max-width:768px) 50vw, 230px" />
                  {/* 底部覆盖信息：标题与浏览次数 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-base-100/80 via-base-100/40 to-transparent">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-base-content/90">
                      <div className="font-medium">精选作品</div>
                      <div className="opacity-80">{Math.floor(800 + idx * 23)} 次浏览</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 分页指示器移除，采用滚动容器 */}

        {/* 分类横条 */}
        <section className="mt-8">
          <div className="relative">
            <div className="flex items-center">
              {/* 左右滚动箭头 */}
              <button className="btn btn-ghost" onClick={() => scrollCategories("prev")} aria-label="分类左滚">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div ref={catScrollRef} className="flex gap-2 overflow-x-auto no-scrollbar px-2" style={{ scrollBehavior: "smooth" }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border ${
                      selectedCategory === cat ? "bg-primary text-primary-content border-primary" : "bg-base-100 border-base-300"
                    }`}
                  >
                    <span className="text-sm">{cat}</span>
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost" onClick={() => scrollCategories("next")} aria-label="分类右滚">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* NFT 快捷入口：将常用 NFT 功能集中呈现 */}
        <section className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-semibold">NFT 快捷入口</h2>
            <div className="flex gap-2">
              <Link href="/marketplace" className="btn btn-sm">前往市场</Link>
              <Link href="/myNFTs" className="btn btn-sm btn-secondary">我的NFT</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <Link href="/marketplace" className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7h18M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 11h6v6H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Marketplace</div>
                  <div className="text-xs opacity-70">浏览、购买与管理挂单</div>
                </div>
              </div>
            </Link>

            <Link href="/myNFTs" className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">我的NFT</div>
                  <div className="text-xs opacity-70">查看与管理持有的 NFT</div>
                </div>
              </div>
            </Link>

            <Link href="/transfers" className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M17 14l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M13 4H7v16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">转移事件</div>
                  <div className="text-xs opacity-70">实时查看 Transfer 事件</div>
                </div>
              </div>
            </Link>

            <Link href="/blockexplorer" className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">区块浏览器</div>
                  <div className="text-xs opacity-70">本地区块与交易细节</div>
                </div>
              </div>
            </Link>

            <Link href="/ipfsUpload" className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 9l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">上传到 IPFS</div>
                  <div className="text-xs opacity-70">元数据与图片上传</div>
                </div>
              </div>
            </Link>

            <Link href="/ipfsDownload" className="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 19V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 15l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4 5h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">从 IPFS 下载</div>
                  <div className="text-xs opacity-70">查看与验证元数据</div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* 作品列表区域 */}
        <section className="mt-6">
          {/* 自定义标签页 */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-4 py-2 rounded-full ${selectedTab === tab.key ? "bg-primary text-primary-content" : "bg-base-100"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 推荐 tab */}
          {selectedTab === "recommend" && (
            <div className="mt-4">
              {/* 作品标签快速选择 */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {workTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedWorkTag(tag)}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        selectedWorkTag === tag ? "bg-secondary text-secondary-content border-secondary" : "bg-base-100 border-base-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <button className="btn btn-sm" onClick={refreshRecommendWorks} aria-label="换一批">
                  换一批
                </button>
              </div>

              {/* 作品网格：与顶部轮播一致的精致卡片风格（同比例缩小） + 点击弹窗（弹窗内翻转动画） */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-8 xl:grid-cols-8 gap-1 mt-4">
                {filteredRecommendWorks.map(work => (
                  <div
                    key={work.id}
                    className="group relative bg-base-100 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                    onClick={() => setViewer(work)}
                    aria-label={`查看 ${work.title}`}
                  >
                    <AdaptiveImage src={work.img} alt={work.title} sizes="180px" fixedAspect="16 / 9" fit="cover" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-base-100/80 via-base-100/40 to-transparent">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-base-content/90">
                        <div className="font-medium">{work.title}</div>
                        <div className="opacity-80">{work.view} 次浏览</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 关注：展示赛区与战队列表 */}
          {selectedTab === "follow" && (
            <div className="mt-6">
              {(remoteLeagues ?? defaultLeagues).map(league => (
                <div key={league.key} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-base font-semibold">{league.label} 战队</div>
                    <div className="text-xs opacity-60">共 {league.teams.length} 支</div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {league.teams.map(team => {
                      const slug = team.logoSlug || slugifyTeam(team.name);
                      const logoSrc = `/teams/${slug}.svg`;
                      const abbr = team.name
                        .replace(/[^A-Za-z0-9\u4e00-\u9fa5 ]/g, "")
                        .split(" ")
                        .map(w => w[0])
                        .join("")
                        .slice(0, 3)
                        .toUpperCase();
                      const rec = standingsByLeague[league.key]?.[slug];
                      const nm = nextMatchByLeague[league.key]?.[slug];
                      const rosterList = team.roster && team.roster.length > 0 ? team.roster : rostersByLeague[league.key]?.[slug];
                      const subsList = rosterSubsByLeague[league.key]?.[slug];
                      const wins = rec?.wins ?? undefined;
                      const losses = rec?.losses ?? undefined;
                      const total = (wins ?? 0) + (losses ?? 0);
                      const winrate = total > 0 ? Math.round(((wins ?? 0) / total) * 100) : undefined;
                      return (
                        <div key={`${league.key}-${team.name}`} className="rounded-xl border border-base-300 bg-base-100 p-3 shadow hover:shadow-md transition">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* 队徽：尝试加载 public/teams/<slug>.svg，失败则显示缩写圆形 */}
                              <img
                                src={logoSrc}
                                alt={`${team.name} logo`}
                                className="w-9 h-9 rounded-full object-contain bg-base-200"
                                onError={(e) => {
                                  const el = e.currentTarget as HTMLImageElement;
                                  el.style.display = "none";
                                  const sibling = el.nextElementSibling as HTMLElement | null;
                                  if (sibling) sibling.style.display = "flex";
                                }}
                              />
                              <div className="w-9 h-9 rounded-full bg-primary/20 items-center justify-center text-xs font-bold text-primary hidden">
                                {abbr}
                              </div>
                              <div className="font-medium text-sm">{team.name}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {team.url && (
                                <a href={team.url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-ghost" aria-label="官方">
                                  官方
                                </a>
                              )}
                              {team.wiki && (
                                <a href={team.wiki} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-ghost" aria-label="Wiki">
                                  Wiki
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="mt-1 text-xs opacity-80">
                            {wins !== undefined && losses !== undefined ? (
                              <span>战绩：{wins}-{losses}（{winrate}%）</span>
                            ) : (
                              <span>战绩：待同步</span>
                            )}
                          </div>
                          <div className="mt-2 text-xs opacity-70">
                            阵容：
                            {rosterList && rosterList.length > 0 ? (
                              <span className="ml-1">
                                {rosterList.map(r => (
                                  <span key={`${team.name}-${r.role}-${r.player}`} className="inline-block px-2 py-0.5 mr-1 rounded-full bg-base-200">
                                    {r.role} · {r.player}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="ml-1 opacity-60">待补充 · 可参考 Wiki</span>
                            )}
                          </div>
                          {subsList && subsList.length > 0 && (
                            <div className="mt-1 text-xs opacity-70">
                              替补：
                              <span className="ml-1">
                                {subsList.map(s => (
                                  <span key={`${team.name}-sub-${s}`} className="inline-block px-2 py-0.5 mr-1 rounded-full bg-base-200">
                                    {s}
                                  </span>
                                ))}
                              </span>
                            </div>
                          )}
                          <div className="mt-2 text-xs opacity-70">
                            下一场：
                            {nm ? (
                              <span className="ml-1">
                                VS {nm.opponent} · {new Date(nm.startTime).toLocaleString()}
                              </span>
                            ) : (
                              <span className="ml-1 opacity-60">待公布</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* 积分：展示赛区排名 */}
          {selectedTab === "standings" && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-base font-semibold">赛区积分</div>
                <select
                  className="select select-sm select-bordered"
                  value={standingsLeague}
                  onChange={e => setStandingsLeague(e.target.value)}
                  aria-label="选择赛区"
                >
                  {[
                    "LCK","LPL","LEC","LCS","PCS","VCS","LJL","CBLOL","LLA"
                  ].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              {!standings ? (
                <div className="flex justify-center items-center mt-10">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              ) : standings.rankings.length === 0 ? (
                <div className="text-sm opacity-70">暂无积分数据，稍后再试～</div>
              ) : (
                <div className="overflow-x-auto shadow">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>战队</th>
                        <th>胜</th>
                        <th>负</th>
                        <th>胜率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.rankings.map((t, idx) => {
                        const wins = t.wins ?? 0;
                        const losses = t.losses ?? 0;
                        const total = wins + losses;
                        const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;
                        const slug = t.slug || slugifyTeam(t.name);
                        const logoSrc = `/teams/${slug}.svg`;
                        return (
                          <tr key={`${slug}-${idx}`}>
                            <td>{idx + 1}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <img src={logoSrc} alt={`${t.name} logo`} className="w-6 h-6 rounded-full object-contain bg-base-200" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
                                <span className="font-medium">{t.name}</span>
                              </div>
                            </td>
                            <td>{wins}</td>
                            <td>{losses}</td>
                            <td>{winrate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {selectedTab === "latest" && (
            <div className="mt-6 text-sm text-base-content/70">暂未接入最新数据，先展示推荐吧～</div>
          )}
        </section>
      </div>
      {/* 图片查看弹窗（打开时执行翻转卡牌动画 + 清晰化呈现 + 描述信息） */}
      {viewer && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={handleCloseViewer}
        >
          <div className="flip-modal relative w-[92vw] md:w-[70vw]" onClick={e => e.stopPropagation()}>
            {/* 弹窗打开时“炸裂”进入，完整显示图片（限制最大高度，提升质量） */}
            <div
              className={`flip-modal-inner ${closing ? "animate-explode-out" : "animate-explode-in"} rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl`}
              style={{ boxShadow: accent ? `0 0 0 1px ${accent}33, 0 12px 40px -8px #000` : undefined }}
            >
              {/* 背景填充：使用同图模糊与轻微暗化，消除白色留白的突兀感 */}
              <Image
                src={viewer.img}
                alt=""
                fill
                sizes="(max-width:768px) 92vw, 70vw"
                className="object-cover blur-lg opacity-40 scale-110"
                aria-hidden
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" aria-hidden></div>
              {/* 高光反射叠层：营造高端质感 */}
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute -top-10 -left-10 w-2/3 h-1/2 rotate-12 bg-gradient-to-br from-white/18 via-white/6 to-transparent"></div>
              </div>
              {/* 炸裂视觉：中心冲击波与光扫叠层 */}
              <div
                className={`${closing ? "shockwave-out" : "shockwave-in"} shockwave pointer-events-none absolute inset-0`}
                aria-hidden
                style={{
                  background: accent
                    ? `radial-gradient(circle at center, ${accent}33 0%, transparent 60%)`
                    : `radial-gradient(circle at center, rgba(255,255,255,.22) 0%, transparent 60%)`,
                }}
              ></div>
              <div
                className={`light-sweep ${closing ? "sweep-out" : "sweep-in"} pointer-events-none absolute inset-0`}
                aria-hidden
                style={{
                  background: accent
                    ? `linear-gradient(110deg, transparent 35%, ${accent}33 50%, transparent 65%)`
                    : `linear-gradient(110deg, transparent 35%, rgba(255,255,255,.35) 50%, transparent 65%)`,
                }}
              ></div>
              {/* 左右侧主色光带：在翻转动画期间出现，提升侧边存在感与高级感 */}
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div
                  className={`accent-rail-left ${closing ? "animate-rail-left-out" : "animate-rail-left-in"}`}
                  style={{
                    background: accent
                      ? `linear-gradient(90deg, ${accent}55 0%, ${accent}22 40%, transparent 100%)`
                      : `linear-gradient(90deg, rgba(255,255,255,.25) 0%, rgba(255,255,255,.12) 40%, transparent 100%)`,
                  }}
                ></div>
              <div
                  className={`accent-rail-right ${closing ? "animate-rail-right-out" : "animate-rail-right-in"}`}
                  style={{
                    background: accent
                      ? `linear-gradient(270deg, ${accent}55 0%, ${accent}22 40%, transparent 100%)`
                      : `linear-gradient(270deg, rgba(255,255,255,.25) 0%, rgba(255,255,255,.12) 40%, transparent 100%)`,
                  }}
                ></div>
              </div>
              {/* 关闭按钮：干净的 “×”，随翻转动画一起运动 */}
              <button
                className="btn btn-ghost btn-md absolute top-3 right-3 z-30 text-lg leading-none hover:opacity-90"
                style={{ color: accent ?? undefined }}
                onClick={handleCloseViewer}
                aria-label="关闭"
                title="关闭"
              >
                ×
              </button>
              {/* 左侧栏：作品流转信息（大屏显示，可滚动） */}
              <aside
                className="absolute inset-y-0 left-0 w-[280px] hidden lg:flex flex-col z-20 bg-black/35 backdrop-blur-sm"
                style={{ borderRight: `1px solid ${accent ?? "rgba(255,255,255,.12)"}` }}
                aria-label="作品流转信息"
              >
                <div className="px-3 pt-3 pb-2 text-xs uppercase tracking-wide opacity-80">作品流转</div>
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
                  {provenance.map((ev, i) => (
                    <div key={i} className="relative pl-4">
                      <span
                        className="absolute left-0 top-1 w-2 h-2 rounded-full"
                        style={{ background: accent ?? "rgba(255,255,255,.5)" }}
                        aria-hidden
                      ></span>
                      <div className="text-xs opacity-70">{ev.at}</div>
                      <div className="text-sm">
                        {ev.action} {ev.price ? `· ${ev.price}` : ""} {ev.to ? `→ ${ev.to}` : ""}
                      </div>
                      <div className="text-xs opacity-60">by {ev.by} · tx {ev.tx}</div>
                    </div>
                  ))}
                  {provenance.length === 0 && (
                    <div className="text-xs opacity-70">暂无流转记录</div>
                  )}
                </div>
              </aside>

              {/* 右侧栏：评论（大屏显示，可滚动） */}
              <aside
                className="absolute inset-y-0 right-0 w-[280px] hidden lg:flex flex-col z-20 bg-black/35 backdrop-blur-sm"
                style={{ borderLeft: `1px solid ${accent ?? "rgba(255,255,255,.12)"}` }}
                aria-label="评论列表"
              >
                <div className="px-3 pt-3 pb-2 text-xs uppercase tracking-wide opacity-80">评论</div>
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
                  {comments.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                        {String(c.user).slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          {c.user} <span className="text-xs opacity-60">· {c.when}</span>
                        </div>
                        <div className="text-sm opacity-85">{c.text}</div>
                        <div className="mt-1 text-xs opacity-60">👍 {c.up}</div>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && <div className="text-xs opacity-70">暂无评论</div>}
                </div>
              </aside>
              {/* 前景：完整比例的清晰图片 */}
              <AdaptiveImage src={viewer.img} alt={viewer.title} sizes="(max-width:768px) 92vw, 70vw" fit="contain" quality={95} priority maxHeight="80vh" />
            </div>
            {/* 描述信息区域（半透明毛玻璃） */}
            <div
              className="mt-3 rounded-xl p-3 bg-black/40 backdrop-blur-sm text-base-100"
              style={{ border: `1px solid ${accent ?? "rgba(255,255,255,0.1)"}` }}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold" style={{ color: accent ?? undefined }}>{viewer.title}</div>
                <div className="text-sm opacity-80">{viewer.view} 次浏览</div>
              </div>
              <div className="mt-1 text-sm opacity-85">作者：{viewer.author} · 标签：{viewer.tag}</div>
              <p className="mt-2 text-sm leading-6 opacity-85">
                这是一幅以「{viewer.tag}」为主题的作品，采用细腻的光影与层次表现手法，
                在保持原始比例的前提下呈现完整画面。通过适度的色彩对比与景深控制，
                画面细节更加清晰，整体观感更为沉浸。
              </p>
            </div>
            
          </div>
        </div>
      )}
      {/* 弹窗“炸裂”进入/退出动画样式 */}
      <style jsx>{`
        .flip-modal { perspective: 1600px; }
        .flip-modal-inner { transform-style: preserve-3d; backface-visibility: hidden; will-change: transform, filter, opacity; }
        /* 炸裂进出场动画（延长时长、增强可见度）*/
        .animate-explode-in { animation: explodeIn 1400ms cubic-bezier(.2,.8,.2,1); }
        .animate-explode-out { animation: explodeOut 800ms cubic-bezier(.22,.7,.2,.96); }
        @keyframes explodeIn {
          0% { transform: translateY(34px) rotateY(38deg) scale(.84); filter: blur(1.8px) saturate(1.08) contrast(1.02); opacity: 0; }
          30% { transform: translateY(-8px) rotateY(-12deg) scale(1.12); filter: blur(.5px) saturate(1.14) contrast(1.05); opacity: 1; }
          60% { transform: translateY(0) rotateY(3deg) scale(1.0); filter: blur(.2px) saturate(1.06) contrast(1.03); }
          100% { transform: translateY(0) rotateY(0deg) scale(1); filter: none; }
        }
        @keyframes explodeOut {
          0% { transform: rotateY(0deg) scale(1); opacity: 1; }
          40% { transform: rotateY(-10deg) scale(.9) translateY(10px); filter: blur(.8px); opacity: .6; }
          100% { transform: rotateY(-60deg) scale(.72) translateY(24px); filter: blur(1.8px); opacity: 0; }
        }

        /* 冲击波与光扫 */
        .shockwave { transform-origin: center; opacity: 0; }
        /* 入场冲击波延迟 120ms，拉长到 1200ms */
        .shockwave-in { animation: shockwaveIn 1200ms ease-out 120ms forwards; }
        .shockwave-out { animation: shockwaveOut 520ms ease-in 0ms forwards; }
        @keyframes shockwaveIn {
          0% { transform: scale(.6); opacity: 0; }
          35% { opacity: .9; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        @keyframes shockwaveOut {
          0% { transform: scale(1); opacity: .4; }
          100% { transform: scale(.6); opacity: 0; }
        }
        .light-sweep { mix-blend-mode: screen; opacity: 0; }
        /* 入场光扫延迟 220ms，拉长到 1600ms */
        .sweep-in { animation: sweepIn 1600ms ease-out 220ms forwards; }
        .sweep-out { animation: sweepOut 500ms ease-in 0ms forwards; }
        @keyframes sweepIn {
          0% { transform: translateX(-60%); opacity: 0; }
          30% { opacity: .7; }
          100% { transform: translateX(60%); opacity: 0; }
        }
        @keyframes sweepOut {
          0% { transform: translateX(0%); opacity: .4; }
          100% { transform: translateX(-40%); opacity: 0; }
        }

        /* 侧边主色光带基础样式 */
        .accent-rail-left,
        .accent-rail-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 64px;
          filter: blur(10px);
          opacity: 0.0;
        }
        .accent-rail-left { left: -8px; }
        .accent-rail-right { right: -8px; }

        /* 侧边光带进出动画 */
        .animate-rail-left-in { animation: railLeftIn 700ms cubic-bezier(.2,.8,.2,1) forwards; }
        .animate-rail-right-in { animation: railRightIn 700ms cubic-bezier(.2,.8,.2,1) forwards; }
        .animate-rail-left-out { animation: railLeftOut 400ms cubic-bezier(.2,.8,.2,1) forwards; }
        .animate-rail-right-out { animation: railRightOut 400ms cubic-bezier(.2,.8,.2,1) forwards; }
        @keyframes railLeftIn {
          0% { transform: translateX(-40px); opacity: 0; }
          60% { transform: translateX(0); opacity: .7; }
          100% { transform: translateX(0); opacity: .35; }
        }
        @keyframes railRightIn {
          0% { transform: translateX(40px); opacity: 0; }
          60% { transform: translateX(0); opacity: .7; }
          100% { transform: translateX(0); opacity: .35; }
        }
        @keyframes railLeftOut {
          0% { transform: translateX(0); opacity: .35; }
          100% { transform: translateX(-40px); opacity: 0; }
        }
        @keyframes railRightOut {
          0% { transform: translateX(0); opacity: .35; }
          100% { transform: translateX(40px); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default Home;
