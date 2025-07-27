import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  
  // Close sidebar when route changes
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-black">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-20 lg:hidden p-2 bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="h-6 w-6" />
      </button>
      <main className="lg:pl-72 min-h-screen transition-all duration-300">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20 lg:pt-8 text-gray-300"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default MainLayout;