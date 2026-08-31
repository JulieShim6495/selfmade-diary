"use client";

import html2canvas from "html2canvas-pro";
import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  AlignmentType,
} from "docx";
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
  RotateCcw,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FreeBlock from "@/components/FreeBlock";
import FreeBlockSettings from "@/components/FreeBlockSettings";

type BlockId = "schedule"

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
  { id: "schedule", label: "시간표" },
];
const blockLabelMap = Object.fromEntries(
  blockOptions.map((block) => [block.id, block.label])
) as Record<BlockId, string>;
const typeOptions = ["데일리", "위클리", "먼슬리"];
const sizeOptions = ["A4", "A5", "B6", "아이패드용"];
const styleOptions = ["미니멀", "감성", "업무용", "귀여운"];
const pageSizeMap = {
  A4: { width: 760, height: 1075, label: "A4" }
};

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

const defaultLayouts: Record<BlockId, BlockLayout> = {
  schedule: { x: 0, y: 180, width: 300, height: 300 },};

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

function HalfHourScheduleRows({
  startTime,
  layout,
  timeInterval,
}: {
  startTime: string;
  layout: BlockLayout;
  timeInterval: 15 | 30 | 60;
}) {
  const rows: string[] = [];

  const [hourText, minuteText] = startTime.split(":");

  let hour = Number(hourText);
  let minute = Number(minuteText);

  const visibleRowCount = Math.max(
    4,
    Math.floor((layout.height - 55) / 24)
  );

  for (let i = 0; i < 96; i++) {
    rows.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    );

    minute += timeInterval;

    while (minute >= 60) {
      minute -= 60;
      hour += 1;
    }

    if (hour >= 24) {
      hour = 0;
    }
  }

  return (
    <div className="max-h-[calc(100%-44px)] overflow-hidden">
      {rows.slice(0, visibleRowCount).map((time, index) => (
        <div
          key={`${time}-${index}`}
          className="grid grid-cols-[56px_1fr] border-t py-1.5 text-xs"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <span className="text-neutral-400">{time}</span>
        </div>
      ))}
    </div>
  );
}
function ResizeHandle({
  id,
  layout,
  theme,
  onResize,
}: {
  id: BlockId;
  layout: BlockLayout;
  theme: typeof themes[ThemeKey];
  onResize: (id: BlockId, width: number, height: number) => void;
}) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = layout.width;
    const startHeight = layout.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = startWidth + (moveEvent.clientX - startX);
      const nextHeight = startHeight + (moveEvent.clientY - startY);

      onResize(id, nextWidth, nextHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };
return (
  <div
    onMouseDown={handleMouseDown}
    className="no-print absolute bottom-2 right-2 z-50 h-4 w-4 cursor-se-resize rounded-full border border-neutral-400 bg-white"
  />
);
}

function FreeBlockResizeHandle({
  freeBlock,
  theme,
  onResize,
}: {
  freeBlock: FreeBlockItem;
  theme: typeof themes[ThemeKey];
  onResize: (id: string, width: number, height: number) => void;
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = freeBlock.width;
    const startHeight = freeBlock.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth =
        startWidth + (moveEvent.clientX - startX);

      const nextHeight =
        startHeight + (moveEvent.clientY - startY);

      onResize(
        freeBlock.id,
        Math.max(180, nextWidth),
        Math.max(100, nextHeight)
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

return (
  <div
    onPointerDownCapture={(e) => {
      e.stopPropagation();
    }}
    onMouseDownCapture={(e) => {
      e.stopPropagation();
      handleMouseDown(e);
    }}
    className="no-print absolute bottom-2 right-2 z-50 h-4 w-4 cursor-se-resize rounded-full"
    style={{ backgroundColor: theme.accent }}
  />
);
}
function PreviewBlock({
  id,
  label,
  layout,
  theme,

  onSizeChange,
  onResize,
}: {
  id: BlockId;
  label: string;
  layout: BlockLayout;
  theme: typeof themes[ThemeKey];
  onSizeChange: (id: BlockId, key: "width" | "height", amount: number) => void;
  onResize: (id: BlockId, width: number, height: number) => void;
}): import("react/jsx-runtime").JSX.Element {
  const baseStyle = {
    backgroundColor: theme.block,
    borderColor: theme.line,
  };
  const baseClass =
  "h-full overflow-hidden rounded-2xl p-4";

const noteLineCount = Math.max(
  3,
  Math.floor((layout.height - 58) / 24)
);

return (
  <div className={`${baseClass} relative`} style={baseStyle}>
    <BlockHeader
      id={id}
      label={label}
      theme={theme}
      onSizeChange={onSizeChange}
    />

    <div className="space-y-3">
      {Array.from({ length: noteLineCount }).map((_, index) => (
        <div
          key={index}
          style={{
            borderBottom: `1px solid ${theme.line}`,
            height: "14px",
          }}
        />
      ))}
    </div>

    <ResizeHandle
      id={id}
      layout={layout}
      theme={theme}
      onResize={onResize}
    />
  </div>
);
}
type FreeBlockItem = {
  id: string;

  type: "free" | "schedule";

  title: string;
  rowCount: number;
  showCheckbox: boolean;
  titleAlign: "left" | "center" | "right";
  titleSize: number;

  x: number;
  y: number;
  width: number;
  height: number;

  scheduleStart?: string;
scheduleInterval?: 15 | 30 | 60;
};
export default function DiaryMakerSite() {
  const pageSize = "A4";
  const [plannerType, setPlannerType] = useState("데일리");
  const [style, setStyle] = useState("미니멀");
  const [wordPageSize, setWordPageSize] = useState<
  "A4" | "A5" | "B5"
>("A4");
  const [gridBackground, setGridBackground] = useState<
  "none" | "dot" | "line"
>("none");
  const [selectedSchedule, setSelectedSchedule] = useState(false);
  const [canvasBorderStyle, setCanvasBorderStyle] = useState<
  "dashed" | "solid" | "none"
>("none");
const [freeBlocks, setFreeBlocks] = useState<FreeBlockItem[]>([
  {
    id: "free-1",
    type: "free",
    title: "자유 블록",
    rowCount: 5,
    showCheckbox: true,
    titleAlign: "left",
    titleSize: 16,
    x: 20,
    y: 20,
    width: 240,
    height: 180,
  },
]);
const saveAsWord = async () => {
  const element = document.getElementById("print-area");

  if (!element) {
    alert("저장할 플래너 영역을 찾을 수 없습니다.");
    return;
  }

  try {
const canvas = await html2canvas(element, {
  scale: 3,
  backgroundColor: "#ffffff",
  useCORS: true,
  height: element.scrollHeight + 4,
  windowHeight: element.scrollHeight + 4,
  ignoreElements: (el) =>
    el.classList.contains("no-print"),
  onclone: (clonedDocument) => {
    const clonedArea =
      clonedDocument.getElementById("print-area");

    if (clonedArea) {
      clonedArea.style.backgroundColor = "#ffffff";
      clonedArea.style.boxShadow = "none";
    }
    clonedDocument
  .querySelectorAll(".no-print, [contenteditable='true'], textarea")
  .forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });

clonedDocument
  .querySelectorAll(".planner-page, .planner-canvas")
  .forEach((el) => {
    const node = el as HTMLElement;
    node.style.backgroundColor = "#ffffff";
  });
  },
});
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("이미지 변환에 실패했습니다."));
        }
      }, "image/png");
    });

    const imageData = await blob.arrayBuffer();

const wordSizeMap = {
  A4: {
    pageWidth: 11906,
    pageHeight: 16838,
    imageWidth: 760,
  },
  A5: {
    pageWidth: 8391,
    pageHeight: 11906,
    imageWidth: 537,
  },
  B5: {
    pageWidth: 9979,
    pageHeight: 14173,
    imageWidth: 637,
  },
} as const;

const selectedWordSize = wordSizeMap[wordPageSize];

const maxWidth = selectedWordSize.imageWidth;

const imageHeight =
  (canvas.height / canvas.width) * maxWidth;
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: {
            width: selectedWordSize.pageWidth,
            height: selectedWordSize.pageHeight,
          },
          margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
        },
      },

      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 0,
            after: 0,
          },
          children: [
            new ImageRun({
              type: "png",
              data: imageData,
              transformation: {
                width: maxWidth,
                height: imageHeight,
              },
            }),
          ],
        }),
      ],
    },
  ],
});
    const docxBlob = await Packer.toBlob(doc);

    const url = URL.createObjectURL(docxBlob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `diary-planner-${wordPageSize}.docx`;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Word 파일 저장 중 오류가 발생했습니다.");
  }
};

const [selectedFreeBlockId, setSelectedFreeBlockId] = useState("free-1");
const addFreeBlock = () => {
  const newId = `free-${Date.now()}`;
  const index = freeBlocks.length;

  setFreeBlocks((previous) => [
    ...previous,
    {
      id: newId,
      type: "free",
      title: "새 자유 블록",
      rowCount: 5,
      showCheckbox: true,
      titleAlign: "left",
      titleSize: 16,
      x: 20 + (index % 2) * 260,
      y: 20 + Math.floor(index / 2) * 200,
      width: 240,
      height: 180,
    },
  ]);

  setSelectedFreeBlockId(newId);
};
const addScheduleBlock = () => {
  const newId = `schedule-${Date.now()}`;
  const index = freeBlocks.length;

  setFreeBlocks((previous) => [
    ...previous,
    {
      id: newId,
      type: "schedule",
      scheduleStart: "08:00",
      scheduleInterval: 30,
      title: "시간표",
      rowCount: 0,
      showCheckbox: false,
      titleAlign: "left",
      titleSize: 16,
      x: 20 + (index % 2) * 260,
      y: 20 + Math.floor(index / 2) * 260,
      width: 240,
      height: 320,
    },
  ]);

  setSelectedFreeBlockId(newId);
};
  const selectedTheme = "minimal" as const;
  const [selectedCategory, setSelectedCategory] = useState<WeeklyCategory>("study");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedBlocks, setSelectedBlocks] = useState<BlockId[]>([
  "schedule",
]);
  const [savedTemplates, setSavedTemplates] =
  useState<any[]>([]);
  const [templateName, setTemplateName] =
  useState("");
  const [blockLayouts, setBlockLayouts] = useState<Record<BlockId, BlockLayout>>(defaultLayouts);
  const theme = themes[selectedTheme];
  const pageSizeMap = {
  A4: { width: 760, height: 1040 },
  A5: { width: 540, height: 760 },
  B6: { width: 410, height: 580 },
  아이패드용: { width: 760, height: 1040 },
};

const currentPageSize = pageSizeMap.A4;
const selectedFreeBlock =
  freeBlocks.find((block) => block.id === selectedFreeBlockId) ??
  freeBlocks[0];

useEffect(() => {
  const saved = window.localStorage.getItem("diary-lab-save");

  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    setSelectedBlocks(data.selectedBlocks ?? []);
    setBlockLayouts(data.blockLayouts ?? {});

    setFreeBlocks(data.freeBlocks ?? freeBlocks);
setSelectedFreeBlockId(
  data.freeBlocks?.[0]?.id ?? "free-1"
);
  } catch (error) {
    console.error(error);
  }
}, []);

useEffect(() => {
  const templates = JSON.parse(
    localStorage.getItem("diary-lab-templates") || "[]"
  );

  setSavedTemplates(templates);
}, []);
  const blocks = useMemo(
    () => selectedBlocks.map((id) => blockOptions.find((block) => block.id === id)).filter((block): block is { id: BlockId; label: string } => Boolean(block)),
    [selectedBlocks]
  );

const autoArrange = (targetBlocks = selectedBlocks) => {
  setBlockLayouts((prev) => {
    const next = { ...prev };

    const gap = 16;
    const padding = marginOptions.normal.padding;

    const canvasWidth = Math.max(
      180,
      currentPageSize.width - padding * 2
    );

    const canvasHeight = Math.max(
      100,
      currentPageSize.height - padding * 2 - 80
    );

    const columns = canvasWidth >= 420 ? 2 : 1;
    const rows = Math.ceil(targetBlocks.length / columns);

    const blockWidth =
      (canvasWidth - gap * (columns - 1)) / columns;

    const blockHeight =
      (canvasHeight - gap * Math.max(0, rows - 1)) /
      Math.max(1, rows);

    targetBlocks.forEach((id, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);

      next[id] = {
        ...prev[id],
        x: column * (blockWidth + gap),
        y: row * (blockHeight + gap),
        width: blockWidth,
        height: blockHeight,
      };
    });

    return next;
  });
};

  const toggleBlock = (id: BlockId) => {
    setSelectedBlocks((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev];
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
const deleteSelectedFreeBlock = () => {
  const remainingBlocks = freeBlocks.filter(
    (block) => block.id !== selectedFreeBlockId
  );

  setFreeBlocks(remainingBlocks);

  if (remainingBlocks.length > 0) {
    setSelectedFreeBlockId(remainingBlocks[0].id);
  } else {
    setSelectedFreeBlockId("");
  }
};
const duplicateSelectedFreeBlock = () => {
  const source = freeBlocks.find(
    (block) => block.id === selectedFreeBlockId
  );

  if (!source) return;

  const newId = `free-${Date.now()}`;

  const duplicatedBlock: FreeBlockItem = {
    ...source,
    id: newId,
    title: `${source.title} 복사본`,
    x: source.x + 30,
    y: source.y + 30,
  };

  setFreeBlocks((previous) => [
    ...previous,
    duplicatedBlock,
  ]);

  setSelectedFreeBlockId(newId);
};
const preventFreeBlockOverlap = (
  id: string,
  x: number,
  y: number
) => {
  const current = freeBlocks.find(
    (block) => block.id === id
  );

  if (!current) {
    return { x, y };
  }

  const currentElement = document.querySelector(
    `[data-free-block-id="${id}"]`
  );

  if (!currentElement) {
    return { x, y };
  }

  const currentRect =
    currentElement.getBoundingClientRect();

  const offsetX = x - current.x;
  const offsetY = y - current.y;

  const nextRect = {
    left: currentRect.left + offsetX,
    right: currentRect.right + offsetX,
    top: currentRect.top + offsetY,
    bottom: currentRect.bottom + offsetY,
  };

  const overlapsOtherFreeBlock = freeBlocks.some(
    (other) => {
      if (other.id === id) return false;

      const otherElement = document.querySelector(
        `[data-free-block-id="${other.id}"]`
      );

      if (!otherElement) return false;

      const otherRect =
        otherElement.getBoundingClientRect();

      return (
        nextRect.left < otherRect.right &&
        nextRect.right > otherRect.left &&
        nextRect.top < otherRect.bottom &&
        nextRect.bottom > otherRect.top
      );
    }
  );

  const scheduleElement = document.querySelector(
    `[data-planner-block-id="schedule"]`
  );

  let overlapsSchedule = false;

  if (scheduleElement) {
    const scheduleRect =
      scheduleElement.getBoundingClientRect();

    overlapsSchedule =
      nextRect.left < scheduleRect.right &&
      nextRect.right > scheduleRect.left &&
      nextRect.top < scheduleRect.bottom &&
      nextRect.bottom > scheduleRect.top;
  }

  if (
    overlapsOtherFreeBlock ||
    overlapsSchedule
  ) {
    return {
      x: current.x,
      y: current.y,
    };
  }

  return { x, y };
};
const preventScheduleOverlap = (
  x: number,
  y: number
) => {
  const current = blockLayouts.schedule;

  const scheduleElement = document.querySelector(
    `[data-planner-block-id="schedule"]`
  );

  if (!scheduleElement) {
    return { x, y };
  }

  // 드래그가 끝난 현재 실제 시간표 테두리
  const scheduleRect =
    scheduleElement.getBoundingClientRect();

  const overlapsFreeBlock = freeBlocks.some(
    (freeBlock) => {
      const freeElement = document.querySelector(
        `[data-free-block-id="${freeBlock.id}"]`
      );

      if (!freeElement) return false;

      const freeRect =
        freeElement.getBoundingClientRect();

      return (
        scheduleRect.left < freeRect.right &&
        scheduleRect.right > freeRect.left &&
        scheduleRect.top < freeRect.bottom &&
        scheduleRect.bottom > freeRect.top
      );
    }
  );

  if (overlapsFreeBlock) {
    return {
      x: current.x,
      y: current.y,
    };
  }

  return { x, y };
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
const resizeBlock = (
  id: BlockId,
  width: number,
  height: number
) => {
  setBlockLayouts((prev) => ({
    ...prev,
    [id]: {
      ...prev[id],
      width: Math.max(180, Math.round(width)),
      height: Math.max(100, Math.round(height)),
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
    JSON.stringify({
      plannerType,
      pageSize,
      style,
      selectedTheme,
      selectedCategory,
      selectedTemplate,
      selectedBlocks,
      blockLayouts,
      freeBlocks,
    })
  );
  setSaveMessage("저장 완료! 다음에 열어도 이 배치를 불러옵니다.");
  setTimeout(() => setSaveMessage(""), 2500);
};

useEffect(() => {
  window.localStorage.setItem(
    "diary-lab-save",
    JSON.stringify({
      plannerType,
      pageSize,
      style,
      selectedTheme,
      selectedCategory,
      selectedTemplate,
      selectedBlocks,
      blockLayouts,
      freeBlocks,
    })
  );
}, [
  plannerType,
  pageSize,
  style,
  selectedTheme,
  selectedCategory,
  selectedTemplate,
  selectedBlocks,
  blockLayouts,
  freeBlocks,
]);
const saveTemplate = () => {
  if (!templateName.trim()) {
    alert("템플릿 이름을 입력해주세요.");
    return;
  }

  const currentTemplates = JSON.parse(
    localStorage.getItem("diary-lab-templates") || "[]"
  );

  const newTemplate = {
    name: templateName,
    plannerType,
    pageSize,
    style,
    selectedTheme,
    selectedCategory,
    selectedTemplate,
    selectedBlocks,
    blockLayouts,
  };

const existingIndex = currentTemplates.findIndex(
  (item: any) => item.name === templateName
);

let nextTemplates;

if (existingIndex >= 0) {
  nextTemplates = [...currentTemplates];
  nextTemplates[existingIndex] = newTemplate;
} else {
  nextTemplates = [
    ...currentTemplates,
    newTemplate,
  ];
}
  localStorage.setItem(
    "diary-lab-templates",
    JSON.stringify(nextTemplates)
  );

  setSavedTemplates(nextTemplates);
  setTemplateName("");

  alert("템플릿 저장 완료!");
};
const deleteTemplate = (name: string) => {
  if (!confirm(`"${name}" 템플릿을 삭제할까요?`)) {
    return;
  }

  const nextTemplates = savedTemplates.filter(
    (item) => item.name !== name
  );

  localStorage.setItem(
    "diary-lab-templates",
    JSON.stringify(nextTemplates)
  );

  setSavedTemplates(nextTemplates);
};
const weeklySplitIndex = Math.ceil(blocks.length / 2);

const weeklyLeftBlocks = blocks.slice(0, weeklySplitIndex);
const weeklyRightBlocks = blocks.slice(weeklySplitIndex);

const renderBlockCanvas = (
  pageBlocks: typeof blocks,
  pageKey: string
) => (
  <div
    className={`planner-canvas relative h-full overflow-hidden ${
  canvasBorderStyle === "dashed"
    ? "border-2 border-dashed"
    : canvasBorderStyle === "solid"
    ? "border-2 border-solid"
    : "border-0"
}`}
    style={{
  borderColor: theme.line,
  backgroundColor: theme.page,
backgroundImage:
  gridBackground === "dot"
    ? "radial-gradient(#d4d4d4 1px, transparent 1px)"
    : gridBackground === "line"
    ? `
      linear-gradient(#e5e5e5 1px, transparent 1px),
      linear-gradient(90deg, #e5e5e5 1px, transparent 1px)
        `
    : "none",
  backgroundSize:
    gridBackground === "dot"
      ? "20px 20px"
      : gridBackground === "line"
      ? "20px 20px, 20px 20px, 100% 100%"
      : undefined,
      backgroundPosition: "0 0",

      borderRight:
  gridBackground === "line"
    ? "1px solid #e5e5e5"
    : undefined,
}}
    >
       {pageBlocks.map((block) => {
      const layout = blockLayouts[block.id];

      return (
        <motion.div
          key={`${pageKey}-${block.id}`}
          data-planner-block-id={block.id}
          drag
          dragMomentum={false}
          dragElastic={0}
          initial={false}
          animate={{
            x: layout.x,
            y: layout.y,
          }}
          onDragEnd={(_, info) => {
  const gridSize = 30;

  const nextX =
    Math.round(
      (layout.x + info.offset.x) / gridSize
    ) * gridSize;

  const nextY =
    Math.round(
      (layout.y + info.offset.y) / gridSize
    ) * gridSize;

  const safePosition =
    block.id === "schedule"
      ? preventScheduleOverlap(nextX, nextY)
      : { x: nextX, y: nextY };

  updateBlockPosition(
    block.id,
    safePosition.x,
    safePosition.y
  );
}}
           onPointerDown={() => {
    setSelectedSchedule(true);
    setSelectedFreeBlockId("");
           }}
className="absolute cursor-grab active:cursor-grabbing"
          style={{
            width: layout.width,
            height: layout.height,
          }}
        >
          {selectedSchedule && (
  <div className="no-print pointer-events-none absolute inset-0 z-50 rounded-2xl border-2 border-neutral-900" />
)}
          <PreviewBlock
            id={block.id}
            label={block.label}
            layout={layout}
            theme={theme}
            onSizeChange={changeBlockSize}
            onResize={resizeBlock}
          />
        </motion.div>
      );
    })}
{freeBlocks.map((freeBlock) => {
  const layout = freeBlock;

  return (
    <motion.div
      key={freeBlock.id}
      data-free-block-id={freeBlock.id}
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={false}
      animate={{
        x: layout.x,
        y: layout.y,
      }}
      onDragEnd={(_, info) => {
        const gridSize = 30;

        const nextX =
          Math.round(
            (freeBlock.x + info.offset.x) / gridSize
          ) * gridSize;

        const nextY =
          Math.round(
            (freeBlock.y + info.offset.y) / gridSize
          ) * gridSize;

        const safePosition = preventFreeBlockOverlap(
          freeBlock.id,
          nextX,
          nextY
        );

        setFreeBlocks((previous) =>
          previous.map((block) =>
            block.id === freeBlock.id
              ? {
                  ...block,
                  x: safePosition.x,
                  y: safePosition.y,
                }
              : block
          )
        );
      }}
      className="absolute cursor-grab active:cursor-grabbing"
style={{
  width: layout.width,
  height: layout.height,
}}
      onPointerDown={() => {
  setSelectedSchedule(false);
  setSelectedFreeBlockId(freeBlock.id);
}}
      
    >
      {selectedFreeBlockId === freeBlock.id && (
  <div className="no-print pointer-events-none absolute -inset-1 rounded-2xl border-2 border-neutral-900" />
)}
      {freeBlock.type === "schedule" ? (
  <div
    className="h-full rounded-2xl bg-white p-4"
  >
    <div
      className="mb-3 font-bold"
      style={{
        fontSize: `${freeBlock.titleSize}px`,
        textAlign: freeBlock.titleAlign,
      }}
    >
      {freeBlock.title}
    </div>

    <HalfHourScheduleRows
  startTime={freeBlock.scheduleStart ?? "08:00"}
  layout={layout}
  timeInterval={freeBlock.scheduleInterval ?? 30}
/>
  </div>
) : (
  <FreeBlock
    title={freeBlock.title}
    rowCount={freeBlock.rowCount}
    showCheckbox={freeBlock.showCheckbox}
    titleAlign={freeBlock.titleAlign}
    titleSize={freeBlock.titleSize}
    lineColor={theme.line}
  />
)}

      <FreeBlockResizeHandle
        freeBlock={freeBlock}
        theme={theme}
        onResize={(id, width, height) => {
          setFreeBlocks((previous) =>
            previous.map((block) =>
              block.id === id
                ? {
                    ...block,
                    width,
                    height,
                  }
                : block
            )
          );
        }}
      />
    </motion.div>
  );
})}
{gridBackground === "line" && (
  <div
    className="pointer-events-none absolute bottom-0 left-0 right-0"
    style={{
      height: "1px",
      backgroundColor: "#e5e5e5",
      zIndex: 50,
    }}
  />
)}
  </div>
);

return (
      <div className="min-h-screen bg-[#f7f4ef] text-neutral-900">
<style>{`
  @page {
    margin: 3mm;
  }
const saveTemplate = () => {
  if (!templateName.trim()) {
    alert("템플릿 이름을 입력해주세요.");
    return;
  }
const deleteTemplate = (name: string) => {
  const nextTemplates =
    savedTemplates.filter(
      (item) => item.name !== name
    );

  localStorage.setItem(
    "diary-lab-templates",
    JSON.stringify(nextTemplates)
  );

  setSavedTemplates(nextTemplates);
};
  const savedTemplates = JSON.parse(
    localStorage.getItem("diary-lab-templates") ||
      "[]"
  );

  const newTemplate = {
    name: templateName,
    plannerType,
    pageSize,
    style,
    selectedTheme,
    timetableStart,
    selectedBlocks,
    blockLayouts,
  };

  const updatedTemplates = [
    ...savedTemplates,
    newTemplate,
  ];

  localStorage.setItem(
    "diary-lab-templates",
    JSON.stringify(updatedTemplates)
  );

  alert("템플릿 저장 완료!");
};
  #print-area {
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  @media print {
  .monthly-spread {
  display: block !important;
}

.monthly-page {
  width: 100% !important;
  min-height: 100vh !important;
  break-after: page;
  page-break-after: always;
  box-sizing: border-box;
}

.monthly-page:last-child {
  break-after: auto;
  page-break-after: auto;
}
    body * {
      visibility: hidden;
    }

    #print-area,
    #print-area * {
      visibility: visible;
    }

    #print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      box-shadow: none !important;
      min-height: auto !important;
    }

    .no-print {
      display: none !important;
    }
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
              추천받고,<br />색을 바꾸고,<br />저장까지 완성하세요.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
              추천 위클리 템플릿, 자동 정렬, 색상 커스터마이징까지 한 번에 사용할 수 있습니다.
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
                <div className="rounded-2xl p-4 font-bold" style={{ backgroundColor: theme.soft }}>원하는 단위로 조절하는 시간표</div>
                <div className="grid grid-cols-2 gap-3"><div className="h-28 rounded-2xl" style={{ backgroundColor: theme.soft }} /><div className="h-28 rounded-2xl" style={{ backgroundColor: theme.soft }} /></div>
              </div>
            </div>
          </motion.div>
        </section>
        
        <section id="maker" className="mx-auto max-w-7xl px-6 py-16">

          <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
            <Card className="no-print min-w-0 overflow-hidden rounded-3xl border-0 bg-white shadow-sm">
              <CardContent className="space-y-6 p-6">
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-black"><CalendarDays className="h-5 w-5" /> 종류</h3>
                  <div className="grid grid-cols-3 gap-2">{typeOptions.map((type) => <button key={type} onClick={() => setPlannerType(type)} className={`rounded-2xl border px-3 py-3 text-sm ${plannerType === type ? "border-neutral-900 bg-neutral-900 text-white" : "bg-white"}`}>{type}</button>)}</div>
                </section>
                
                <div className="mt-4">
  <div className="mb-2 text-sm font-bold">
    페이지 테두리
  </div>
  

  <div className="grid grid-cols-3 gap-2">
    <button
      type="button"
      onClick={() => setCanvasBorderStyle("dashed")}
      className={`rounded-xl border px-3 py-2 text-sm ${
        canvasBorderStyle === "dashed"
          ? "bg-neutral-900 text-white"
          : "bg-white"
      }`}
    >
      점선
    </button>

    <button
      type="button"
      onClick={() => setCanvasBorderStyle("solid")}
      className={`rounded-xl border px-3 py-2 text-sm ${
        canvasBorderStyle === "solid"
          ? "bg-neutral-900 text-white"
          : "bg-white"
      }`}
    >
      실선
    </button>

    <button
      type="button"
      onClick={() => setCanvasBorderStyle("none")}
      className={`rounded-xl border px-3 py-2 text-sm ${
        canvasBorderStyle === "none"
          ? "bg-neutral-900 text-white"
          : "bg-white"
      }`}
    >
      없음
    </button>
  </div>
  <div className="mt-4">
  <div className="mb-2 text-sm font-bold">
    그리드 배경
  </div>

  <div className="grid grid-cols-3 gap-2">
    <button
      type="button"
      onClick={() => setGridBackground("none")}
      className={`rounded-xl border px-3 py-2 text-sm ${
        gridBackground === "none"
          ? "bg-neutral-900 text-white"
          : "bg-white"
      }`}
    >
      없음
    </button>

    <button
      type="button"
      onClick={() => setGridBackground("dot")}
      className={`rounded-xl border px-3 py-2 text-sm ${
        gridBackground === "dot"
          ? "bg-neutral-900 text-white"
          : "bg-white"
      }`}
    >
      점
    </button>

    <button
      type="button"
      onClick={() => setGridBackground("line")}
      className={`rounded-xl border px-3 py-2 text-sm ${
        gridBackground === "line"
          ? "bg-neutral-900 text-white"
          : "bg-white"
      }`}
    >
      실선
    </button>
  </div>
</div>
</div>
        <section>
  <h3 className="mb-3 flex items-center gap-2 text-lg font-black">
    <CalendarDays className="h-5 w-5" /> 시간표 설정
  </h3>
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
                <section>
<section className="border-t pt-6">
  <h3 className="mb-3 text-lg font-black">
    자유 블록
  </h3>
{selectedFreeBlock && (
  <FreeBlockSettings
    title={selectedFreeBlock.title}
    onTitleChange={(title) =>
      setFreeBlocks((previous) =>
        previous.map((block) =>
          block.id === selectedFreeBlockId
            ? { ...block, title }
            : block
        )
      )
    }
    titleAlign={selectedFreeBlock.titleAlign}
    onTitleAlignChange={(titleAlign) =>
      setFreeBlocks((previous) =>
        previous.map((block) =>
          block.id === selectedFreeBlockId
            ? { ...block, titleAlign }
            : block
        )
      )
    }
    titleSize={selectedFreeBlock.titleSize}
    onTitleSizeChange={(titleSize) =>
      setFreeBlocks((previous) =>
        previous.map((block) =>
          block.id === selectedFreeBlockId
            ? { ...block, titleSize }
            : block
        )
      )
    }
    rowCount={selectedFreeBlock.rowCount}
    onRowCountChange={(rowCount) =>
      setFreeBlocks((previous) =>
        previous.map((block) =>
          block.id === selectedFreeBlockId
            ? { ...block, rowCount }
            : block
        )
      )
    }
    showCheckbox={selectedFreeBlock.showCheckbox}
    onShowCheckboxChange={(showCheckbox) =>
      setFreeBlocks((previous) =>
        previous.map((block) =>
          block.id === selectedFreeBlockId
            ? { ...block, showCheckbox }
            : block
        )
      )
    }
  />
  
)}
{selectedFreeBlock?.type === "schedule" && (
  <div className="rounded-2xl border bg-white p-4">
    <div className="mb-3 text-sm font-bold">시간표 설정</div>

    <label className="mb-2 block text-sm">
      시작 시간
    </label>

    <input
      type="time"
      value={selectedFreeBlock.scheduleStart ?? "08:00"}
      onChange={(e) =>
        setFreeBlocks((previous) =>
          previous.map((block) =>
            block.id === selectedFreeBlockId
              ? {
                  ...block,
                  scheduleStart: e.target.value,
                }
              : block
          )
        )
      }
      className="mb-4 w-full rounded-xl border px-3 py-2"
    />

    <div className="mb-2 text-sm">
      시간 간격
    </div>

    <div className="grid grid-cols-3 gap-2">
      {[15, 30, 60].map((interval) => (
        <button
          key={interval}
          type="button"
          onClick={() =>
            setFreeBlocks((previous) =>
              previous.map((block) =>
                block.id === selectedFreeBlockId
                  ? {
                      ...block,
                      scheduleInterval: interval as 15 | 30 | 60,
                    }
                  : block
              )
            )
          }
          className={`rounded-xl border px-3 py-2 text-sm ${
            (selectedFreeBlock.scheduleInterval ?? 30) === interval
              ? "bg-neutral-900 text-white"
              : "bg-white"
          }`}
        >
          {interval}분
        </button>
      ))}
    </div>
  </div>
)}

  <button
    type="button"
    onClick={addFreeBlock}
    className="mt-3 w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
  >
    + 자유 블록 추가
  </button>
  <button
  type="button"
  onClick={addScheduleBlock}
  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
>
  + 시간표 추가
</button>
  <button
    type="button"
    onClick={duplicateSelectedFreeBlock}
    className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
  >
    선택한 자유 블록 복제
  </button>

  <button
    type="button"
    onClick={deleteSelectedFreeBlock}
    className="mt-2 w-full rounded-xl border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
  >
    선택한 자유 블록 삭제
  </button>

  <div className="mt-2 text-center text-xs text-neutral-500">
    자유 블록 수: {freeBlocks.length}
  </div>
</section>
<div className="mt-3 space-y-2">
  {freeBlocks.map((block, index) => (
    <button
      key={block.id}
      type="button"
      onClick={() => setSelectedFreeBlockId(block.id)}
      className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
        selectedFreeBlockId === block.id
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "bg-white"
      }`}
    >
      자유 블록 {index + 1} · {block.title}
    </button>
  ))}
</div>
</section>
<section>
  <h3 className="mb-3 text-lg font-black">
    템플릿 저장
  </h3>

  <input
    value={templateName}
    onChange={(e) => setTemplateName(e.target.value)}
    placeholder="예: 공부용 A5"
    className="w-full rounded-2xl border p-3"
  />

  <button
    onClick={saveTemplate}
    className="mt-2 w-full rounded-2xl bg-black p-3 text-white"
  >
    템플릿 저장
  </button>
</section>

<section>
  <h3 className="mb-3 text-lg font-black">
    저장된 템플릿
  </h3>

{savedTemplates.map((template, index) => (
  <div
    key={index}
    className="mb-2 flex gap-2"
  >
    <button
      onClick={() => {       
        setSelectedBlocks(
          template.selectedBlocks
        );
        setBlockLayouts(
          template.blockLayouts
        );
      }}
      className="flex-1 rounded-xl border p-3 text-left"
    >
      {template.name}
    </button>

    <button
      onClick={() =>
        deleteTemplate(template.name)
      }
      className="rounded-xl border px-3"
    >
      🗑
    </button>
  </div>
))}
</section>


                <div className="grid grid-cols-2 gap-2">
<div className="col-span-2">
  <div className="mb-2 text-sm font-bold">
    저장 용지 크기
  </div>

  <div className="grid grid-cols-3 gap-2">
    {(["A4", "A5", "B5"] as const).map((size) => (
      <button
        key={size}
        type="button"
        onClick={() => setWordPageSize(size)}
        className={`rounded-xl border px-3 py-2 text-sm ${
          wordPageSize === size
            ? "border-neutral-900 bg-neutral-900 text-white"
            : "bg-white"
        }`}
      >
        {size}
      </button>
    ))}
  </div>
</div>
                  <Button onClick={saveAsWord}>
  <Download className="h-4 w-4" />
  Word / 한글 저장
</Button>
</div>
              </CardContent>
            </Card>

            <Card className="min-w-0 rounded-3xl border-0 bg-white shadow-sm">
              <CardContent className="overflow-x-auto p-2 md:p-4">
<div
  id="print-area"
  className="planner-spread flex w-max gap-6"
>
  {/* 데일리: 1페이지 */}
  {plannerType === "데일리" && (
    <div
      className="planner-page shrink-0 rounded-3xl"
      style={{
        width: currentPageSize.width,
        height: currentPageSize.height,
        padding: marginOptions.normal.padding,
        paddingTop: 8,
        backgroundColor: theme.page,
      }}
    >
      <div
  className="mb-3 flex items-start justify-between pb-0"
  style={{ borderColor: theme.line }}
>
        <div className="no-print">
          <h2
            className="text-2xl font-black"
            style={{ color: theme.accent }}
          >
            데일리 플래너
          </h2>
        </div>

        <div
          className="ml-auto text-center"
          style={{
            borderColor: theme.line,
            backgroundColor: theme.block,
          }}
        >
          <div className="text-xs text-neutral-400">
            DATE
          </div>

          <div className="mt-1 text-xs">
            ____ . ____ . ____
          </div>
        </div>
      </div>

      <div className="h-full">
  {renderBlockCanvas(blocks, "daily")}
</div>
    </div>
  )}

  {/* 위클리: 왼쪽 페이지 */}
  {plannerType === "위클리" && (
    <>
      <div
        className="planner-page shrink-0 rounded-3xl "
        style={{
          width: currentPageSize.width,
          height: currentPageSize.height,
          padding: marginOptions.normal.padding,
          paddingTop: 8,
          backgroundColor: theme.page,
        }}
      >
        <div
          className="mb-3 flex items-center justify-between border-b pb-2"
          style={{ borderColor: theme.line }}
        >
          <div
            className="font-black"
            style={{ color: theme.accent }}
          >
            WEEKLY · 1
          </div>

          <div className="text-xs text-neutral-400">
            ____ . ____ ~ ____ . ____
          </div>
        </div>

        <div style={{ height: "calc(100% - 45px)" }}>
          {renderBlockCanvas(
            weeklyLeftBlocks,
            "weekly-left"
          )}
        </div>
      </div>

      {/* 위클리: 오른쪽 페이지 */}
      <div
        className="planner-page shrink-0 rounded-3xl "
        style={{
          width: currentPageSize.width,
          height: currentPageSize.height,
          padding: marginOptions.normal.padding,
          paddingTop: 8,
          backgroundColor: theme.page,
        }}
      >
        <div
          className="mb-0 flex items-center justify-between border-b pb-0"
          style={{ borderColor: theme.line }}
        >
          <div
            className="font-black"
            style={{ color: theme.accent }}
          >
            WEEKLY · 2
          </div>

          <div className="text-xs text-neutral-400">
            ____ . ____ ~ ____ . ____
          </div>
        </div>

        <div style={{ height: "calc(100% - 45px)" }}>
          {renderBlockCanvas(
            weeklyRightBlocks,
            "weekly-right"
          )}
        </div>
      </div>
    </>
  )}

  {/* 먼슬리: 왼쪽 페이지 */}
  {plannerType === "먼슬리" && (
    <>
      <div
        className="planner-page shrink-0 rounded-3xl "
        style={{
  width: currentPageSize.width,
  height: currentPageSize.height,
  padding: marginOptions.normal.padding,
  paddingTop: 8,
  backgroundColor: theme.page,
  boxSizing: "border-box",
}}
      >
        <div
          className="mb-0 flex items-start justify-between border-b pb-0"
          style={{ borderColor: theme.line }}
        >
          <div
            className="font-black"
            style={{ color: theme.accent }}
          >
            MONTHLY · 1
          </div>

          <div
            className="rounded-xl border px-3 py-2"
            style={{
              borderColor: theme.line,
              backgroundColor: theme.block,
            }}
          >
            <div className="mb-1 text-center text-[10px] font-semibold">
              MONTH
            </div>

            <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={index}
                  className="rounded border px-1"
                  style={{ borderColor: theme.line }}
                >
                  {index + 1}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-2 grid w-full grid-cols-3 gap-1 text-center text-xs font-bold">
          {["SUN", "MON", "TUE", "WED"].map((day) => (
            <div
              key={day}
              className="py-2"
              style={{ color: theme.accent }}
            >
              {day}
            </div>
          ))}
        </div>

        <div
  className="grid w-full min-w-0 grid-cols-3 gap-1"
  style={{ height: "calc(100% - 105px)" }}
>
          {Array.from({ length: 20 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border"
              style={{
                borderColor: theme.line,
                backgroundColor: theme.block,
              }}
            />
          ))}
        </div>
      </div>

      {/* 먼슬리: 오른쪽 페이지 */}
      <div
        className="planner-page shrink-0 overflow-hidden rounded-3xl "
        style={{
          width: currentPageSize.width,
          height: currentPageSize.height,
          padding: marginOptions.normal.padding,
          backgroundColor: theme.page,
          boxSizing: "border-box",
        }}
      >
        <div
          className="mb-0 flex items-start justify-between border-b pb-0"
          style={{ borderColor: theme.line }}
        >
          <div
            className="font-black"
            style={{ color: theme.accent }}
          >
            MONTHLY · 2
          </div>

          <div
            className="rounded-xl border px-3 py-2"
            style={{
              borderColor: theme.line,
              backgroundColor: theme.block,
            }}
          >
            <div className="mb-1 text-center text-[10px] font-semibold">
              MONTH
            </div>
            
            <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={index}
                  className="rounded border px-1"
                  style={{ borderColor: theme.line }}
                >
                  {index + 1}
                </span>
              ))}
            </div>
          </div>
        </div>

         <div className="mb-2 grid w-full grid-cols-3 gap-1 text-center text-xs font-bold">
    {["THU", "FRI", "SAT"].map((day) => (
      <div
        key={day}
        className="min-w-0 py-2"
        style={{ color: theme.accent }}
      >
        {day}
      </div>
    ))}
  </div>

  <div
    className="grid w-full min-w-0 grid-cols-3 gap-1"
    style={{ height: "calc(100% - 105px)" }}
  >
    {Array.from({ length: 15 }).map((_, index) => (
      <div
        key={index}
        className="min-w-0 rounded-lg border"
        style={{
          borderColor: theme.line,
          backgroundColor: theme.block,
        }}
      />
    ))}
  </div>
</div>    </>
  )}
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