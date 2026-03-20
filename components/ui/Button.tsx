import Link from 'next/link';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost-dark' | 'booking-primary';

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonProps =
  | (SharedProps &
      Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
        href?: never;
      })
  | (SharedProps & {
      href: string;
    });

function getVariantClass(variant: ButtonVariant) {
  switch (variant) {
    case 'secondary':
      return 'ui-button ui-button-secondary';
    case 'ghost-dark':
      return 'ui-button ui-button-ghost-dark';
    case 'booking-primary':
      return 'ui-button ui-button-booking-primary';
    default:
      return 'ui-button ui-button-primary';
  }
}

export default function Button(props: ButtonProps) {
  const variant = props.variant ?? 'primary';
  const className = `${getVariantClass(variant)}${props.className ? ` ${props.className}` : ''}`;

  if ('href' in props) {
    const href = props.href as string;
    const { children } = props;
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const { children, type = 'button', ...buttonProps } = props;
  return (
    <button type={type} {...buttonProps} className={className}>
      {children}
    </button>
  );
}
