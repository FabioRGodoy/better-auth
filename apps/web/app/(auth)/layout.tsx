export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 min-h-screen">{children}</div>;
}
