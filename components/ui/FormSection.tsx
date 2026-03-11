import type { HTMLAttributes, ReactNode } from 'react';

export default function FormSection({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <section
      {...props}
      className={`rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)]${className ? ` ${className}` : ''}`}
    >
      {children}
    </section>
  );
}
