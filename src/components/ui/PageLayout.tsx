import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBackgroundElements?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  showBackgroundElements = true,
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/10 flex items-center justify-center p-4 relative overflow-hidden ${className}`}>
      {showBackgroundElements && (
        <>
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </>
      )}
      
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;