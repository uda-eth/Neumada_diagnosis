import { Plus } from "lucide-react";
import { Button } from "./button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/translations";

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  const { t } = useTranslation();
  const [location] = useLocation();

  // Don't show FAB on event creation page
  if (location === '/create') return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-20 right-4 md:hidden z-50"
    >
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        onClick={onClick}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">{t('create')}</span>
      </Button>
    </motion.div>
  );
}
