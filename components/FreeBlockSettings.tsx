"use client";

type TitleAlign = "left" | "center";

type FreeBlockSettingsProps = {
  title: string;
  onTitleChange: (title: string) => void;

  titleAlign: TitleAlign;
  onTitleAlignChange: (value: TitleAlign) => void;

  titleSize: number;
  onTitleSizeChange: (size: number) => void;

  rowCount: number;
  onRowCountChange: (count: number) => void;

  showCheckbox: boolean;
onShowCheckboxChange: (show: boolean) => void;
};

export default function FreeBlockSettings({
  title,
  onTitleChange,
  titleAlign,
  onTitleAlignChange,
  titleSize,
  onTitleSizeChange,
  rowCount,
  onRowCountChange,
   showCheckbox,
  onShowCheckboxChange,
}: FreeBlockSettingsProps) {
  return (
  <div className="rounded-2xl border bg-white p-4">
    <h3 className="text-lg font-bold">
      자유 블록 설정
    </h3>

    {/* 제목 */}
    <div className="mt-5">
      <div className="mb-3 text-sm font-bold">
        📝 제목
      </div>

      <label className="mb-2 block text-sm font-medium">
        자유 블록 제목
      </label>

      <input
        type="text"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="예: 오늘의 목표"
      />
    </div>

    {/* 스타일 */}
    <div className="mt-5 border-t pt-5">
      <div className="mb-3 text-sm font-bold">
        🎨 스타일
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">
          제목 정렬
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onTitleAlignChange("left")}
            className={`rounded-lg border px-3 py-2 text-sm ${
              titleAlign === "left"
                ? "bg-neutral-900 text-white"
                : "bg-white"
            }`}
          >
            왼쪽
          </button>

          <button
            type="button"
            onClick={() => onTitleAlignChange("center")}
            className={`rounded-lg border px-3 py-2 text-sm ${
              titleAlign === "center"
                ? "bg-neutral-900 text-white"
                : "bg-white"
            }`}
          >
            가운데
          </button>
                <button
        type="button"
        onClick={() => onTitleAlignChange("right")}
        className={`rounded-lg border px-3 py-2 text-sm ${
          titleAlign === "right"
            ? "bg-neutral-900 text-white"
            : "bg-white"
        }`}
      >
        오른쪽
      </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-sm font-medium">
          제목 크기
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              onTitleSizeChange(Math.max(12, titleSize - 1))
            }
            className="flex h-8 w-8 items-center justify-center rounded-md border"
          >
            −
          </button>

          <span className="min-w-10 text-center text-sm font-semibold">
            {titleSize}px
          </span>

          <button
            type="button"
            onClick={() =>
              onTitleSizeChange(Math.min(32, titleSize + 1))
            }
            className="flex h-8 w-8 items-center justify-center rounded-md border"
          >
            +
          </button>
        </div>
      </div>
    </div>

    {/* 내용 */}
    <div className="mt-5 border-t pt-5">
      <div className="mb-3 text-sm font-bold">
        📄 내용
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">
          줄 수
        </div>
      
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              onRowCountChange(Math.max(1, rowCount - 1))
            }
            className="flex h-8 w-8 items-center justify-center rounded-md border"
          >
            −
          </button>

          <span className="min-w-8 text-center text-sm font-semibold">
            {rowCount}
          </span>

          <button
            type="button"
            onClick={() =>
              onRowCountChange(Math.min(20, rowCount + 1))
            }
            className="flex h-8 w-8 items-center justify-center rounded-md border"
          >
            +
          </button>
          
        </div>
        <div className="mt-5">
  <label className="flex cursor-pointer items-center justify-between rounded-xl border p-3">
    <span className="text-sm font-medium">
      체크박스 사용
    </span>

    <input
      type="checkbox"
      checked={showCheckbox ?? true}
      onChange={(event) =>
        onShowCheckboxChange(event.target.checked)
      }
      className="h-5 w-5"
    />
  </label>
</div>
      </div>
    </div>
  </div>
  );
}