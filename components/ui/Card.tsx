import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'default' | 'muted' | 'dark' | 'section';

const variantClassMap: Record<CardVariant, string> = {
  default: 'ui-card',
  muted: 'ui-card-muted',
  dark: 'ui-card-dark',
  section: 'ui-section-card',
};

export default function Card({
  as,
  children,
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant;
  as?: ElementType;
}) {
  const Component = as ?? 'div';
  const resolvedClassName = `${variantClassMap[variant]}${className ? ` ${className}` : ''}`;

  return (
    <Component {...props} className={resolvedClassName}>
      {children}
    </Component>
  );
}
