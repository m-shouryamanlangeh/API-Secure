"use client";

import { cn } from "@/lib/utils";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 fixed top-0 left-0 z-50 border-r border-neutral-200 dark:border-neutral-700",
        className
      )}
      animate={{
        width: animate ? (open ? "200px" : "60px") : "200px",
      }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
        type: "tween",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-neutral-800 dark:text-neutral-200 cursor-pointer hover:scale-110 transition-transform"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between overflow-y-auto",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: Partial<RouterLinkProps>;
}) => {
  const { open, animate } = useSidebar();
  return (
    <RouterLink
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          x: animate ? (open ? 0 : -10) : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
          opacity: { duration: 0.25 },
        }}
        className={cn(
          "text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition-transform duration-200 whitespace-pre !p-0 !m-0",
          !open && animate && "pointer-events-none"
        )}
        style={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
        }}
      >
        {link.label}
      </motion.span>
    </RouterLink>
  );
};
