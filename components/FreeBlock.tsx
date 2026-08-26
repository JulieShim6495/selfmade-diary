"use client";

type FreeBlockProps = {
  title: string;
  rowCount: number;
  showCheckbox: boolean;
  lineColor: string;
  titleAlign: "left" | "center" | "right";
  titleSize: number;
};

export default function FreeBlock({
  title,
  rowCount,
  showCheckbox,
  lineColor,
  titleAlign,
  titleSize,
}: FreeBlockProps) 
{
return (
  <div
    className="h-full rounded-2xl px-4 py-3"
    style={{ backgroundColor: "#ffffff" }}
  >
   <h3
  className={`mb-4 font-bold ${
    titleAlign === "center"
      ? "text-center"
      : titleAlign === "right"
        ? "text-right"
        : "text-left"
  }`}
  style={{ fontSize: `${titleSize}px` }}
>
        {title}
      </h3>

      <div className="space-y-3">
        {Array.from({ length: rowCount }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-2"
          >
            {showCheckbox && (
              <span
                className="h-4 w-4 shrink-0 rounded-sm border"
                style={{ borderColor: lineColor }}
              />
            )}

            <div
              className="h-5 flex-1 border-b"
              style={{ borderColor: lineColor }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}