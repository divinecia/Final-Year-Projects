import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';

type LogoProps = {
  className?: string;
  size?: number;
  alt?: string;
  priority?: boolean;
};

export function Logo({
  className,
  size = 100,
  alt = 'Househelp Logo',
  priority = true,
}: LogoProps) {
  return (
    <Image
      src="/icons/icon.png" // Assuming the icon is in the public directory at /icons/icon.png
      alt={alt}
      width={size}
      height={size}
      className={clsx('object-contain rounded-[40%]', className)}
      priority={priority}
      draggable={false}
    />
  );
}

type LogoWithNameProps = {
  className?: string;
  logoSize?: number;
  textClassName?: string;
  children?: React.ReactNode;
};

export function LogoWithName({
  className,
  logoSize = 32,
  textClassName,
  children,
}: LogoWithNameProps) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <Logo className="h-8 w-8" size={logoSize} />
      <span
        className={clsx(
          'font-headline text-xl font-bold tracking-tight text-foreground',
          textClassName
        )}
      >
        {children ?? 'Househelp'}
      </span>
    </div>
  );
}
