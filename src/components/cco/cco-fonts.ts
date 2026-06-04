import { Geist, Geist_Mono } from 'next/font/google';

/** Loaded only by CCo overlay — does not affect main admin typography. */
export const ccoGeistSans = Geist({
  subsets: ['latin'],
  variable: '--font-cco-sans',
  display: 'swap',
});

export const ccoGeistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-cco-mono',
  display: 'swap',
});

export const ccoFontClassName = `${ccoGeistSans.variable} ${ccoGeistMono.variable}`;
