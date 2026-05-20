"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckSquare,
  Download,
  FileText,
  LayoutTemplate,
  Move,
  Palette,
  Printer,
  RotateCcw,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type BlockId =
  | "goal"
  | "todo"
  | "schedule"
  | "memo"
  | "habit"
  | "mood"
  | "meal"
  | "expense"
  | "gratitude"
  | "weeklyGoal"
  | "weeklyTodo"
  | "subjectPlan"
  | "studyTime"
  | "wrongAnswer"
  | "meetingMemo"
  | "deadline"
  | "nextWeek"
  | "weeklyReview"
  | "mealPlan"
  | "exercise"
  | "moodTracker";

type BlockLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WeeklyCategory = "study" | "work" | "life";
type ThemeKey = "minimal" | "beige" | "blue" | "pink" | "green";
type MarginKey = "narrow" | "normal" | "wide";

type WeeklyTemplate = {
  id: string;
  label: string;
  description: string;
  blocks: BlockId[];
};

const blockOptions: { id: BlockId; label: string }[] = [
  { id: "goal", label: "목표" },
  { id: "todo", label: "할 일" },
  { id: "schedule", label: "시간표" },
  { id: "memo", label: "메모" },
  { id: "habit", label: "습관 체크" },
  { id: "mood", label: "기분 기록" },
  { id: "meal", label: "식단 기록" },
  { id: "expense", label: "소비 기록" },
  { id: "gratitude", label: "감사 일기" },
  { id: "weeklyGoal", label: "주간 목표" },
  { id: "weeklyTodo", label: "주간 할 일" },
  { id: "subjectPlan", label: "과목별 계획" },
  { id: "studyTime", label: "공부 시간 기록" },
  { id: "wrongAnswer", label: "오답 체크" },
  { id: "meetingMemo", label: "회의 메모" },
  { id: "deadline", label: "마감 일정" },
  { id: "nextWeek", label: "다음 주 준비" },
  { id: "weeklyReview", label: "주간 회고" },
  { id: "mealPlan", label: "식단 계획" },
  { id: "exercise", label: "운동 기록" },
  { id: "moodTracker", label: "감정 기록" },
];

const blockLabelMap = Object.fromEntries(
  blockOptions.map((block) => [block.id, block.label])
) as Record<BlockId, string>;

const typeOptions = ["데일리", "위클리", "먼슬리"];
const sizeOptions = ["A4", "A5", "B6", "아이패드용"];
const styleOptions = ["미니멀", "감성", "업무용", "귀여운"];

const themes: Record<ThemeKey, { label: string; page: string; block: string; accent: string; soft: string; line: string }> = {
  minimal: {
    label: "미니멀",
    page: "#ffffff",
    block: "#ffffff",
    accent: "#111827",
    soft: "#f5f5f5",
    line: "#e5e7eb",
  },
  beige: {
    label: "베이지",
    page: "#fffaf0",
    block: "#fffdf7",
    accent: "#8a5a2b",
    soft: "#f7ead8",
    line: "#ead7bd",
  },
  blue: {
    label: "블루",
    page: "#f5f9ff",
    block: "#ffffff",
    accent: "#2563eb",
    soft: "#dbeafe",
    line: "#bfdbfe",
  },
  pink: {
    label: "핑크",
    page: "#fff7fb",
    block: "#ffffff",
    accent: "#db2777",
    soft: "#fce7f3",
    line: "#fbcfe8",
  },
  green: {
    label: "그린",
    page: "#f6fff8",
    block: "#ffffff",
    accent: "#16a34a",
    soft: "#dcfce7",
    line: "#bbf7d0",
  },
};

const marginOptions: Record<MarginKey, { label: string; padding: number; description: string }> = {
  narrow: { label: "좁게", padding: 20, description: "여백 약 7mm" },
  normal: { label: "보통", padding: 32, description: "여백 약 10mm" },
  wide: { label: "넓게", padding: 48, description: "여백 약 15mm" },
};

const weeklyTemplates: Record<WeeklyCategory, { label: string; templates: WeeklyTemplate[] }> = {
  study: {
    label: "공부용",
    templates: [
      {
        id: "exam",
        label: "시험 대비형",
        description: "시험 일정, 과목별 계획, 오답 체크까지 한 번에 관리해요.",
        blocks: ["weeklyGoal", "subjectPlan", "studyTime", "wrongAnswer", "weeklyReview"],
      },
      {
        id: "study-routine",
        label: "루틴 관리형",
        description: "매일 공부 루틴과 습관을 꾸준히 체크하는 구성입니다.",
        blocks: ["weeklyGoal", "habit", "studyTime", "todo", "weeklyReview"],
      },
      {
        id: "time-study",
        label: "시간관리형",
        description: "요일별 공부 시간과 해야 할 일을 한눈에 볼 수 있어요.",
        blocks: ["weeklyGoal", "schedule", "studyTime", "weeklyTodo", "memo"],
      },
    ],
  },
  work: {
    label: "업무용",
    templates: [
      {
        id: "project",
        label: "프로젝트 관리형",
        description: "마감 일정과 이번 주 업무 우선순위를 정리하는 구성입니다.",
        blocks: ["weeklyGoal", "weeklyTodo", "meetingMemo", "deadline", "nextWeek"],
      },
      {
        id: "meeting",
        label: "회의 중심형",
        description: "회의 메모, 연락할 일, 후속 업무 정리에 좋아요.",
        blocks: ["weeklyGoal", "meetingMemo", "weeklyTodo", "memo", "nextWeek"],
      },
      {
        id: "focus-work",
        label: "목표 달성형",
        description: "주간 목표와 핵심 업무를 끝까지 밀고 가는 구성입니다.",
        blocks: ["weeklyGoal", "weeklyTodo", "deadline", "habit", "weeklyReview"],
      },
    ],
  },
  life: {
    label: "생활관리용",
    templates: [
      {
        id: "health",
        label: "건강관리형",
        description: "식단, 운동, 습관을 같이 기록하기 좋은 구성입니다.",
        blocks: ["weeklyGoal", "exercise", "mealPlan", "habit", "weeklyReview"],
      },
      {
        id: "mood-life",
        label: "감정기록형",
        description: "기분 변화와 한 주 회고를 중심으로 기록해요.",
        blocks: ["weeklyGoal", "moodTracker", "gratitude", "memo", "weeklyReview"],
      },
      {
        id: "home-routine",
        label: "습관관리형",
        description: "청소, 정리, 운동, 독서 같은 생활 루틴에 적합합니다.",
        blocks: ["weeklyGoal", "habit", "weeklyTodo", "expense", "weeklyReview"],
      },
    ],
  },
};

const defaultLayouts: Record<BlockId, BlockLayout> = {
  goal: { x: 0, y: 0, width: 300, height: 150 },
  todo: { x: 330, y: 0, width: 300, height: 190 },
  schedule: { x: 0, y: 180, width: 300, height: 300 },
  memo: { x: 330, y: 220, width: 300, height: 220 },
  habit: { x: 0, y: 450, width: 300, height: 180 },
  mood: { x: 330, y: 470, width: 300, height: 170 },
  meal: { x: 0, y: 660, width: 300, height: 170 },
  expense: { x: 330, y: 670, width: 300, height: 170 },
  gratitude: { x: 165, y: 860, width: 300, height: 170 },
  weeklyGoal: { x: 0, y: 0, width: 300, height: 150 },
  weeklyTodo: { x: 330, y: 0, width: 300, height: 190 },
  subjectPlan: { x: 0, y: 180, width: 300, height: 220 },
  studyTime: { x: 330, y: 220, width: 300, height: 300 },
  wrongAnswer: { x: 0, y: 430, width: 300, height: 180 },
  meetingMemo: { x: 0, y: 180, width: 300, height: 220 },
  deadline: { x: 330, y: 220, width: 300, height: 180 },
  nextWeek: { x: 330, y: 430, width: 300, height: 180 },
  weeklyReview: { x: 165, y: 650, width: 300, height: 190 },
  mealPlan: { x: 330, y: 220, width: 300, height: 180 },
  exercise: { x: 0, y: 180, width: 300, height: 180 },
  moodTracker: { x: 0, y: 180, width: 300, height: 180 },
};

const autoLayoutPositions: BlockLayout[] = [
  { x: 0, y: 0, width: 300, height: 160 },
  { x: 330, y: 0, width: 300, height: 190 },
  { x: 0, y: 230, width: 300, height: 230 },
  { x: 330, y: 230, width: 300, height: 230 },
  { x: 0, y: 500, width: 300, height: 190 },
  { x: 330, y: 500, width: 300, height: 190 },
  { x: 0, y: 730, width: 300, height: 190 },
  { x: 330, y: 730, width: 300, height: 190 },
  { x: 165, y: 960, width: 300, height: 190 },
];

function TemplateThumbnail({ blocks, theme }: { blocks: BlockId[]; theme: typeof themes[ThemeKey] }) {
  return (
    <div className="mb-3 h-28 rounded-2xl border p-2" style={{ backgroundColor: theme.page, borderColor: theme.line }}>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 rounded" style={{ backgroundColor: theme.soft }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {blocks.slice(0, 4).map((block) => (
          <div key={block} className="rounded p-1 text-[10px] leading-tight shadow-sm" style={{ backgroundColor: theme.block, color: theme.accent }}>
            {blockLabelMap[block]}
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockHeader({
  id,
  label,
  theme,
  onSizeChange,
}: {
  id: BlockId;
  label: string;
  theme: typeof themes[ThemeKey];
  onSizeChange: (id: BlockId, key: "width" | "height", amount: number) => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 font-bold" style={{ color: theme.accent }}>
        <Move className="no-print h-4 w-4" />
        {label}
      </div>
      <div className="no-print flex gap-1 text-xs">
        <button type="button" onClick={(e) => { e.stopPropagation(); onSizeChange(id, "width", -30); }} className="rounded-md border px-2 py-1">폭-</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onSizeChange(id, "width", 30); }} className="rounded-md border px-2 py-1">폭+</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onSizeChange(id, "height", -30); }} className="rounded-md border px-2 py-1">높이-</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onSizeChange(id, "height", 30); }} className="rounded-md border px-2 py-1">높이+</button>
      </div>
    </div>
  );
}

function HalfHourScheduleRows() {
  const rows = useMemo(() => {
    const result: string[] = [];
    for (let hour = 8; hour <= 22; hour++) {
      result.push(`${String(hour).padStart(2, "0")}:00`);
      if (hour !== 22) result.push(`${String(hour).padStart(2, "0")}:30`);
    }
    return result;
  }, []);

  return (
    <div className="max-h-[calc(100%-44px)] overflow-hidden">
      {rows.map((time) => (
        <div key={time} className="grid grid-cols-[56px_1fr] border-t py-1.5 text-xs" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          <span className="text-neutral-400">{time}</span>
          <span className="text-neutral-300">작성</span>
        </div>
      ))}
    </div>
  );
}

function PreviewBlock({
  id,
  label,
  theme,
  onSizeChange,
}: {
  id: BlockId;
  label: string;
  layout: BlockLayout;
  theme: typeof themes[ThemeKey];
  onSizeChange: (id: BlockId, key: "width" | "height", amount: number) => void;
}) {
  const baseStyle = {
    backgroundColor: theme.block,
    borderColor: theme.line,
  };
  const baseClass = "h-full overflow-hidden rounded-2xl border p-4 shadow-sm";

  if (id === "todo" || id === "weeklyTodo") {
    return (
      <div className={baseClass} style={baseStyle}>
        <BlockHeader id={id} label={label} theme={theme} onSizeChange={onSizeChange} />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
            <span className="h-4 w-4 rounded-md border" style={{ borderColor: theme.line }} /> 할 일 {n}
          </div>
        ))}
      </div>
    );
  }

  if (id === "schedule" || id === "studyTime") {
    return (
      <div className={baseClass} style={baseStyle}>
        <BlockHeader id={id} label={label} theme={theme} onSizeChange={onSizeChange} />
        <HalfHourScheduleRows />
      </div>
    );
  }

  if (id === "habit") {
    return (
      <div className={baseClass} style={baseStyle}>
        <BlockHeader id={id} label={label} theme={theme} onSizeChange={onSizeChange} />
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500">
          {["월", "화", "수", "목", "금", "토", "일"].map((d) => <span key={d}>{d}</span>)}
          {Array.from({ length: 21 }).map((_, i) => <span key={i} className="h-6 rounded-md border" style={{ borderColor: theme.line }} />)}
        </div>
      </div>
    );
  }

  if (id === "expense" || id === "deadline" || id === "subjectPlan") {
    const rows = id === "subjectPlan" ? ["국어", "수학", "영어", "탐구"] : ["항목", "일정", "메모"];
    return (
      <div className={baseClass} style={baseStyle}>
        <BlockHeader id={id} label={label} theme={theme} onSizeChange={onSizeChange} />
        {rows.map((item) => (
          <div key={item} className="grid grid-cols-[70px_1fr] border-t py-2 text-sm" style={{ borderColor: theme.line }}>
            <span className="text-neutral-400">{item}</span>
            <span className="text-neutral-300">작성</span>
          </div>
        ))}
      </div>
    );
  }

  if (id === "mealPlan" || id === "exercise" || id === "moodTracker") {
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    return (
      <div className={baseClass} style={baseStyle}>
        <BlockHeader id={id} label={label} theme={theme} onSizeChange={onSizeChange} />
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500">
          {days.map((day) => <span key={day}>{day}</span>)}
          {days.map((day) => <span key={`${day}-box`} className="h-12 rounded-md border" style={{ borderColor: theme.line }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={baseClass} style={baseStyle}>
      <BlockHeader id={id} label={label} theme={theme} onSizeChange={onSizeChange} />
      <div className="h-[calc(100%-42px)] rounded-xl" style={{ backgroundColor: theme.soft }} />
    </div>
  );
}

export default function DiaryMakerSite() {
  const [plannerType, setPlannerType] = useState("데일리");
  const [pageSize, setPageSize] = useState("A5");
  const [style, setStyle] = useState("미니멀");
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("minimal");
  const [printMargin, setPrintMargin] = useState<MarginKey>("normal");
  const [selectedCategory, setSelectedCategory] = useState<WeeklyCategory>("study");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedBlocks, setSelectedBlocks] = useState<BlockId[]>(["goal", "todo", "schedule", "memo"]);
  const [blockLayouts, setBlockLayouts] = useState<Record<BlockId, BlockLayout>>(defaultLayouts);

  const theme = themes[selectedTheme];

  useEffect(() => {
    const saved = window.localStorage.getItem("diary-lab-save");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed.plannerType) setPlannerType(parsed.plannerType);
      if (parsed.pageSize) setPageSize(parsed.pageSize);
      if (parsed.style) setStyle(parsed.style);
      if (parsed.selectedTheme) setSelectedTheme(parsed.selectedTheme);
      if (parsed.printMargin) setPrintMargin(parsed.printMargin);
      if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
      if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate);
      if (parsed.selectedBlocks) setSelectedBlocks(parsed.selectedBlocks);
      if (parsed.blockLayouts) setBlockLayouts({ ...defaultLayouts, ...parsed.blockLayouts });
    } catch {
      console.log("저장된 플래너를 불러오지 못했습니다.");
    }
  }, []);

  const blocks = useMemo(
    () => selectedBlocks.map((id) => blockOptions.find((block) => block.id === id)).filter((block): block is { id: BlockId; label: string } => Boolean(block)),
    [selectedBlocks]
  );

  const autoArrange = (targetBlocks = selectedBlocks) => {
    setBlockLayouts((prev) => {
      const next = { ...prev };
      targetBlocks.forEach((id, index) => {
        const position = autoLayoutPositions[index] ?? autoLayoutPositions[autoLayoutPositions.length - 1];
        next[id] = { ...position };
      });
      return next;
    });
  };

  const toggleBlock = (id: BlockId) => {
    setSelectedBlocks((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      setTimeout(() => autoArrange(next), 0);
      return next;
    });
  };

  const applyTemplate = (template: WeeklyTemplate) => {
    setPlannerType("위클리");
    setSelectedTemplate(template.id);
    setSelectedBlocks(template.blocks);
    autoArrange(template.blocks);
  };

  const updateBlockPosition = (id: BlockId, x: number, y: number) => {
    setBlockLayouts((prev) => ({ ...prev, [id]: { ...prev[id], x, y } }));
  };

  const changeBlockSize = (id: BlockId, key: "width" | "height", amount: number) => {
    setBlockLayouts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: key === "width" ? Math.max(180, prev[id][key] + amount) : Math.max(100, prev[id][key] + amount),
      },
    }));
  };

  const resetLayout = () => {
    setBlockLayouts(defaultLayouts);
    setTimeout(() => autoArrange(selectedBlocks), 0);
  };

  const savePlanner = () => {
    window.localStorage.setItem(
      "diary-lab-save",
      JSON.stringify({ plannerType, pageSize, style, selectedTheme, printMargin, selectedCategory, selectedTemplate, selectedBlocks, blockLayouts })
    );
    setSaveMessage("저장 완료! 다음에 열어도 이 배치를 불러옵니다.");
    setTimeout(() => setSaveMessage(""), 2500);
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-neutral-900">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <header className="no-print sticky top-0 z-20 border-b border-black/5 bg-[#f7f4ef]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-black">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-900 text-white"><FileText className="h-5 w-5" /></span>
            Diary Lab
          </div>
          <a href="#maker"><Button className="rounded-2xl">바로 만들기</Button></a>
        </div>
      </header>

      <main>
        <section className="no-print mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-[1fr_480px] md:py-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-sm">
              <Sparkles className="h-4 w-4" /> 나만의 다이어리 속지 제작 사이트
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
              추천받고,<br />색을 바꾸고,<br />인쇄까지 완성하세요.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
              추천 위클리 템플릿, 자동 정렬, 색상 커스터마이징, 인쇄 여백 설정까지 한 번에 사용할 수 있습니다.
            </p>
            <div className="mt-8"><a href="#maker"><Button className="rounded-2xl px-6 py-6 text-base">무료로 양식 만들기 <ArrowRight className="ml-2 h-5 w-5" /></Button></a></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2rem] bg-white p-5 shadow-xl">
            <div className="rounded-[1.5rem] border p-5" style={{ backgroundColor: theme.page, borderColor: theme.line }}>
              <div className="mb-5 flex items-center justify-between">
                <div><p className="text-xs text-neutral-400">WEEKLY</p><h3 className="text-2xl font-black" style={{ color: theme.accent }}>Smart Planner</h3></div>
                <div className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: theme.soft }}>A5</div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl p-4 font-bold" style={{ backgroundColor: theme.soft }}>색상 커스터마이징</div>
                <div className="rounded-2xl p-4 font-bold" style={{ backgroundColor: theme.soft }}>30분 단위 시간표</div>
                <div className="grid grid-cols-2 gap-3"><div className="h-28 rounded-2xl" style={{ backgroundColor: theme.soft }} /><div className="h-28 rounded-2xl" style={{ backgroundColor: theme.soft }} /></div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="no-print mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="rounded-3xl border-0 bg-white shadow-sm"><CardContent className="p-6"><Wand2 className="mb-4 h-8 w-8" /><h3 className="text-xl font-black">자동 정렬</h3><p className="mt-2 leading-7 text-neutral-600">항목 체크 시 상단부터 자동 배치됩니다.</p></CardContent></Card>
            <Card className="rounded-3xl border-0 bg-white shadow-sm"><CardContent className="p-6"><Palette className="mb-4 h-8 w-8" /><h3 className="text-xl font-black">색상 변경</h3><p className="mt-2 leading-7 text-neutral-600">미니멀, 베이지, 블루 등 테마를 선택합니다.</p></CardContent></Card>
            <Card className="rounded-3xl border-0 bg-white shadow-sm"><CardContent className="p-6"><CalendarDays className="mb-4 h-8 w-8" /><h3 className="text-xl font-black">30분 시간표</h3><p className="mt-2 leading-7 text-neutral-600">08:00부터 22:00까지 30분 단위로 기록합니다.</p></CardContent></Card>
            <Card className="rounded-3xl border-0 bg-white shadow-sm"><CardContent className="p-6"><Printer className="mb-4 h-8 w-8" /><h3 className="text-xl font-black">인쇄 여백</h3><p className="mt-2 leading-7 text-neutral-600">좁게, 보통, 넓게 중 선택할 수 있습니다.</p></CardContent></Card>
          </div>
        </section>

        <section id="maker" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold text-neutral-500">DIARY MAKER</p>
            <h2 className="mt-2 text-3xl font-black md:text-5xl">나만의 양식 만들기</h2>
          </div>

          <section className="no-print mb-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h3 className="text-2xl font-black">추천 위클리 템플릿</h3>
                <p className="mt-2 text-neutral-600">목적을 고르면 알맞은 하위 항목이 자동으로 생성됩니다.</p>
              </div>
              <div className="flex gap-2">
                {Object.entries(weeklyTemplates).map(([key, category]) => (
                  <button key={key} onClick={() => setSelectedCategory(key as WeeklyCategory)} className={`rounded-2xl border px-4 py-2 text-sm ${selectedCategory === key ? "bg-black text-white" : "bg-white"}`}>{category.label}</button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {weeklyTemplates[selectedCategory].templates.map((template) => (
                <div key={template.id} className={`rounded-3xl border p-4 ${selectedTemplate === template.id ? "border-black bg-neutral-50" : "bg-white"}`}>
                  <TemplateThumbnail blocks={template.blocks} theme={theme} />
                  <h4 className="text-lg font-black">{template.label}</h4>
                  <p className="mt-1 min-h-[48px] text-sm leading-6 text-neutral-600">{template.description}</p>
                  <div className="my-4 flex flex-wrap gap-2">
                    {template.blocks.map((block) => <span key={block} className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: theme.soft, color: theme.accent }}>{blockLabelMap[block]}</span>)}
                  </div>
                  <Button onClick={() => applyTemplate(template)} className="w-full rounded-2xl">이 템플릿 사용하기</Button>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card className="no-print rounded-3xl border-0 bg-white shadow-sm">
              <CardContent className="space-y-6 p-6">
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-black"><CalendarDays className="h-5 w-5" /> 종류</h3>
                  <div className="grid grid-cols-3 gap-2">{typeOptions.map((type) => <button key={type} onClick={() => setPlannerType(type)} className={`rounded-2xl border px-3 py-3 text-sm ${plannerType === type ? "border-neutral-900 bg-neutral-900 text-white" : "bg-white"}`}>{type}</button>)}</div>
                </section>

                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-black"><LayoutTemplate className="h-5 w-5" /> 사이즈</h3>
                  <div className="grid grid-cols-2 gap-2">{sizeOptions.map((size) => <button key={size} onClick={() => setPageSize(size)} className={`rounded-2xl border px-3 py-3 text-sm ${pageSize === size ? "border-neutral-900 bg-neutral-900 text-white" : "bg-white"}`}>{size}</button>)}</div>
                </section>

                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-black"><Palette className="h-5 w-5" /> 색상 테마</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(themes) as ThemeKey[]).map((key) => (
                      <button key={key} onClick={() => setSelectedTheme(key)} className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm ${selectedTheme === key ? "border-neutral-900" : "bg-white"}`}>
                        <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: themes[key].accent }} />
                        {themes[key].label}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-black"><Printer className="h-5 w-5" /> 인쇄 여백</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(marginOptions) as MarginKey[]).map((key) => (
                      <button key={key} onClick={() => setPrintMargin(key)} className={`rounded-2xl border px-2 py-3 text-sm ${printMargin === key ? "border-neutral-900 bg-neutral-900 text-white" : "bg-white"}`}>
                        <div>{marginOptions[key].label}</div>
                        <div className="text-[10px] opacity-70">{marginOptions[key].description}</div>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-black"><CheckSquare className="h-5 w-5" /> 넣을 항목</h3>
                  <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1">
                    {blockOptions.map((block) => (
                      <label key={block.id} className="flex cursor-pointer items-center justify-between rounded-2xl border bg-white px-4 py-3">
                        <span>{block.label}</span>
                        <input type="checkbox" checked={selectedBlocks.includes(block.id)} onChange={() => toggleBlock(block.id)} className="h-5 w-5 accent-neutral-900" />
                      </label>
                    ))}
                  </div>
                </section>

                <div className="rounded-2xl bg-neutral-100 p-4 text-sm leading-6 text-neutral-600">
                  항목을 체크하면 자동으로 상단부터 정렬됩니다. 시간표는 30분 단위이며, 색상과 인쇄 여백도 조정할 수 있습니다.
                </div>

                {saveMessage && <div className="rounded-2xl bg-green-50 p-3 text-sm text-green-700">{saveMessage}</div>}

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => autoArrange()} variant="outline" className="rounded-2xl py-6 text-base"><Wand2 className="mr-2 h-4 w-4" /> 자동 정렬</Button>
                  <Button onClick={resetLayout} variant="outline" className="rounded-2xl py-6 text-base"><RotateCcw className="mr-2 h-4 w-4" /> 초기화</Button>
                  <Button onClick={savePlanner} variant="outline" className="rounded-2xl py-6 text-base"><Save className="mr-2 h-4 w-4" /> 저장</Button>
                  <Button onClick={handlePrint} className="rounded-2xl py-6 text-base"><Printer className="mr-2 h-4 w-4" /> PDF</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 bg-white shadow-sm">
              <CardContent className="p-4 md:p-8">
                <div id="print-area" className="mx-auto min-h-[1180px] max-w-[760px] rounded-3xl shadow-inner print:shadow-none" style={{ backgroundColor: theme.page, padding: marginOptions[printMargin].padding }}>
<div className="mb-3 flex items-start justify-between border-b pb-2" style={{ borderColor: theme.line }}>
  <div className="no-print">
    <h2 className="mt-1 text-3xl font-black" style={{ color: theme.accent }}>
      {plannerType} 플래너
    </h2>
    <p className="mt-1 text-sm text-neutral-400">
      {pageSize} · {style} · {themes[selectedTheme].label}
    </p>
  </div>

  <div
    className="rounded-xl border px-3 py-2 text-center"
    style={{ borderColor: theme.line, backgroundColor: theme.block }}
  >
    <div className="text-[10px] text-neutral-400">DATE</div>
    <div className="mt-1 text-[11px]">____ . ____ . ____</div>
  </div>
</div>
                  {plannerType === "먼슬리" ? (
                    <div className="mb-5 grid grid-cols-7 gap-1 text-center text-xs">
                      {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <div key={day} className="py-2 font-bold" style={{ color: theme.accent }}>{day}</div>)}
                      {Array.from({ length: 35 }).map((_, i) => <div key={i} className="h-20 rounded-lg border p-1 text-left text-neutral-300" style={{ borderColor: theme.line, backgroundColor: theme.block }}>{i + 1}</div>)}
                    </div>
                  ) : (
                    <div
  className="relative min-h-[980px] rounded-2xl border border-dashed"
  style={{
    borderColor: theme.line,
    backgroundColor: theme.page,
    backgroundImage:
      "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
    backgroundSize: "30px 30px",
  }}
>
                      {blocks.map((block) => {
                        const layout = blockLayouts[block.id];
                        return (
                          <motion.div
                            key={block.id}
                            drag
                            dragMomentum={false}
                            dragElastic={0}
                            initial={false}
                            animate={{ x: layout.x, y: layout.y }}
onDragEnd={(_, info) => {
  const gridSize = 30;

  let nextX =
    Math.round((layout.x + info.offset.x) / gridSize) *
    gridSize;

  let nextY =
    Math.round((layout.y + info.offset.y) / gridSize) *
    gridSize;

  const SNAP_DISTANCE = 40;

  selectedBlocks.forEach((otherId) => {
    if (otherId === block.id) return;

    const other = blockLayouts[otherId];

    if (!other) return;

    // X축 스냅
    if (Math.abs(nextX - other.x) < SNAP_DISTANCE) {
      nextX = other.x;
    }

    // Y축 스냅
    if (Math.abs(nextY - other.y) < SNAP_DISTANCE) {
      nextY = other.y;
    }

    // 오른쪽 정렬
    if (
      Math.abs(nextX - (other.x + other.width + 30)) <
      SNAP_DISTANCE
    ) {
      nextX = other.x + other.width + 30;
    }

    // 아래 정렬
    if (
      Math.abs(nextY - (other.y + other.height + 30)) <
      SNAP_DISTANCE
    ) {
      nextY = other.y + other.height + 30;
    }
  });

  updateBlockPosition(block.id, nextX, nextY);
}}
                            className="absolute cursor-grab active:cursor-grabbing"
                            style={{ width: layout.width, height: layout.height }}
                          >
                            <PreviewBlock id={block.id} label={block.label} layout={layout} theme={theme} onSizeChange={changeBlockSize} />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  <div id="print" className="no-print mt-8 rounded-2xl border border-dashed p-4 text-center text-sm text-neutral-400" style={{ borderColor: theme.line, backgroundColor: theme.block }}>
                    인쇄 버튼을 누른 뒤 프린터 대상에서 “PDF로 저장”을 선택하세요.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="no-print border-t border-black/5 px-6 py-10 text-center text-sm text-neutral-500">
        Diary Lab · Custom Planner Template Builder
      </footer>
    </div>
  );
}
