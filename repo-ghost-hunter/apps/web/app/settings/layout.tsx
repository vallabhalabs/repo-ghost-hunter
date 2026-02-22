import { BaseLayout } from '@/components/layout/BaseLayout';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseLayout>{children}</BaseLayout>;
}
