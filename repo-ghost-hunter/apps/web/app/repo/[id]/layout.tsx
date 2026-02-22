import { BaseLayout } from '@/components/layout/BaseLayout';

export default function RepoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseLayout>{children}</BaseLayout>;
}
