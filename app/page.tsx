import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-center mb-4">
        🍽️ {t("common.appName")}
      </h1>
      <p className="text-muted text-center">{t("emptyState.description")}</p>
    </main>
  );
}
