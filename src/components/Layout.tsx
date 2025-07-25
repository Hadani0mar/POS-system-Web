
import React, { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`container mx-auto ${isMobile ? 'pt-20' : 'pt-24'}`}>
      {children}
    </div>
  );
};

export default Layout;
