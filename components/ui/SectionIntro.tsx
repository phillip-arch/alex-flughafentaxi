type SectionIntroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
};

export default function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: SectionIntroProps) {
  const alignClass = align === 'center' ? 'mx-auto text-center' : '';

  return (
    <div className={`ui-text-block-sm ${alignClass} ${className}`.trim()}>
      {eyebrow ? (
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="ui-heading-lg text-[#111827]">{title}</h2>
      {description ? <p className="ui-copy-compact text-[#6a7d96]">{description}</p> : null}
    </div>
  );
}
