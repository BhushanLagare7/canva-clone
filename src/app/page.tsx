import { protectServer } from "@/features/auth/utils";

export default async function Home() {
  const session = await protectServer();

  return (
    <div>
      <p>Logged in as {session.user?.email}</p>
    </div>
  );
}
