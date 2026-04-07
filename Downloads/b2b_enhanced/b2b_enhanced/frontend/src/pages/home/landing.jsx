import { Hero } from '../../components/home/hero';
import { Problem } from '../../components/home/problem';
import { HowItWorks } from '../../components/home/HowItWorks';
import { DashboardPreviews } from '../../components/home/dashboardPreview';
import { Trust } from '../../components/home/trust';
import { Pricing } from '../../components/home/pricing';
import { motion } from 'motion/react';
import { Footer } from '../../components/footer';
import { useEffect } from "react";

export default function Homepage() {
  useEffect(() => {
    const darkMode = localStorage.getItem("theme") === "dark";
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero />
      <Problem />
      <HowItWorks />
      <DashboardPreviews />
      <Trust />
      <Pricing />
      < Footer />
    </motion.div>
  );
}
