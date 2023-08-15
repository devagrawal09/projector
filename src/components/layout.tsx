import { Inter } from "next/font/google";
import { PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"] });

export function Layout(props: PropsWithChildren) {
  return (
    <>
      <div
        className={`flex gap-5 justify-between px-5 py-2 ${inter.className}`}
      >
        Hello there, Stranger
      </div>
      {props.children}
    </>
  );
}
