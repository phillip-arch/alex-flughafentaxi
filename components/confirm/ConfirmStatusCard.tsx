'use client';

import { ReactNode } from 'react';

type ConfirmStatusCardProps = {
  icon: ReactNode;
  eyebrow?: string;
  eyebrowClassName?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export default function ConfirmStatusCard({
  icon,
  eyebrow,
  eyebrowClassName = 'text-[#1679FF]',
  title,
  description,
  children,
}: ConfirmStatusCardProps) {
  return (
    <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
      <div className="mx-auto flex max-w-[42rem] flex-col items-center text-center">
        {icon}

        <div className="mt-14 flex flex-col items-center gap-6">
          {eyebrow ? (
            <p className={`text-[12px] font-semibold uppercase tracking-[0.18em] ${eyebrowClassName}`}>
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[2.6rem]">
            {title}
          </h1>
          <p className="max-w-[34rem] text-[1rem] leading-8 text-[#5d6b7c] md:text-[1.06rem]">
            {description}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
