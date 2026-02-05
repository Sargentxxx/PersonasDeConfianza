export async function generateStaticParams() {
  return [{ taskId: "placeholder" }];
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
