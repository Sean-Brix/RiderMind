import { useDroppable } from '@dnd-kit/core';

export default function DroppableArea({ children, id }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
}
