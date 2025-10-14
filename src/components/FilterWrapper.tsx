import React from 'react';

interface FilterWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const FilterWrapper = ({ children, title, className = '' }: FilterWrapperProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
};

export default FilterWrapper;