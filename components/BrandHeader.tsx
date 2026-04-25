import Image from "next/image";

interface Props {
  className?: string;
  compact?: boolean;
}

export default function BrandHeader({
  className = "",
  compact = false,
}: Props) {
  const logoSize = compact ? 24 : 30;
  return (
    <header className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/icons/logo.png"
        alt=""
        width={logoSize}
        height={logoSize}
        priority
        className="select-none"
      />
      <div className="flex flex-col leading-tight">
        <span className="text-base font-semibold tracking-tight text-[#1a3a2a]/85">
          Ghars
        </span>
        {!compact && (
          <span
            className="text-[10px] text-[#1a3a2a]/55 -mt-0.5"
            dir="rtl"
            lang="ar"
            aria-hidden="true"
          >
            غَرْس
          </span>
        )}
      </div>
    </header>
  );
}
