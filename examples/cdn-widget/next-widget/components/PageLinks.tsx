"use client";

import Link from "next/link";

export default function PageLinks() {
  return (
    <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
      <Link
        href="/test"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
      >
        Test Page
      </Link>
      <Link
        href="/another"
        className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/145 dark:hover:bg-[#1a1a1a] md:w-[158px]"
      >
        Another Page
      </Link>
    </div>
  );
}