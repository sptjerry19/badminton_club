import { AvatarSelector } from "@/components/avatar/avatar-selector";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-2xl">
          🏸
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">ShuttlePro</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chọn avatar của bạn để vào câu lạc bộ
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <AvatarSelector />
      </div>
    </div>
  );
}
