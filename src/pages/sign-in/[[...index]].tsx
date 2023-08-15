import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex w-full justify-center min-h-screen">
      <div className="flex flex-col justify-center">
        <SignIn />
      </div>
    </main>
  );
}
