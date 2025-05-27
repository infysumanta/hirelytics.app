"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function UnauthorizedPage() {
  const router = useRouter();
  const t = useTranslations("Auth");

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ExclamationTriangleIcon className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {t("unauthorized")}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {t("unauthorizedMessage")}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="min-w-32"
            >
              {t("goBack")}
            </Button>
            <Button
              onClick={handleGoToDashboard}
              variant="outline"
              className="min-w-32"
            >
              {t("dashboard")}
            </Button>
            <Button
              onClick={handleLogout}
              variant="default"
              className="min-w-32"
            >
              {t("logout")}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
