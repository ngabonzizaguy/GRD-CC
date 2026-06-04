import { Geist, Geist_Mono } from 'next/font/google';


export const lmxGeistSans = Geist({
  subsets: ['latin'],
  variable: '--font-lmx-sans',
  display: 'swap',
});

export const lmxGeistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-lmx-mono',
  display: 'swap',
});

export const lmxFontClassName = `${lmxGeistSans.variable} ${lmxGeistMono.variable}`;
