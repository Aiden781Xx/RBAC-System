import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

export function Tabs({ children, defaultValue }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, className = '' }) {
  const context = useContext(TabsContext);
  if (!context) return null;
  const { value: current, setValue } = context;
  const active = current === value;
  return (
    <button
      className={`${className} ${active ? 'font-semibold' : ''}`}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const context = useContext(TabsContext);
  if (!context) return null;
  const { value: current } = context;
  if (current !== value) return null;
  return <div className={className}>{children}</div>;
}
