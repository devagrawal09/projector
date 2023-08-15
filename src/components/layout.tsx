import {
  useUser,
  SignedIn,
  UserButton,
  SignedOut,
  SignInButton,
  OrganizationSwitcher,
} from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"] });

export function Layout(props: PropsWithChildren) {
  const { user } = useUser();

  return (
    <>
      <div
        className={`flex gap-5 justify-between px-5 py-2 ${inter.className}`}
      >
        Hello there,{" "}
        <SignedIn>
          {user?.firstName} <span className="grow"></span>{" "}
          <OrganizationSwitcher /> <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          Stranger{" "}
          <SignInButton>
            <button className="btn btn-primary">Sign in</button>
          </SignInButton>
        </SignedOut>
      </div>
      {props.children}
    </>
  );
}
