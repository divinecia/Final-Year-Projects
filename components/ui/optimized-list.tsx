'use client';

import { memo, useMemo } from 'react';

interface ListItem {
  id: string;
  [key: string]: unknown;
}

interface OptimizedListProps<T extends ListItem> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T) => string;
  className?: string;
}

function OptimizedListComponent<T extends ListItem>({ 
  items, 
  renderItem, 
  keyExtractor = (item) => item.id,
  className = '' 
}: OptimizedListProps<T>) {
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => ({
      key: keyExtractor(item),
      content: renderItem(item, index),
      item
    }));
  }, [items, renderItem, keyExtractor]);

  return (
    <div className={className}>
      {memoizedItems.map(({ key, content }) => (
        <div key={key}>
          {content}
        </div>
      ))}
    </div>
  );
}

export const OptimizedList = memo(OptimizedListComponent) as typeof OptimizedListComponent;