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
    <div className={`ui-section-intro ${alignClass} ${className}`.trim()}>
      {eyebrow ? (
        <p className="ui-section-intro-eyebrow text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF] md:text-[13px]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="ui-section-intro-title mt-0 ui-heading-lg text-[#111827]">{title}</h2>
      {description ? <p className="ui-section-intro-copy m-0 ui-copy-compact text-[#6a7d96]">{description}</p> : null}
    </div>
  );
}
