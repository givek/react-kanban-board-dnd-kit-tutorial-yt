import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";

interface Props {
  children: React.ReactNode;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
}

function ColumnContainer({ id, items, children }: Props) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: "container",
      children: items,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 w-[308px] min-w-[308px] px-2 overflow-y-auto"
    >
      <div className="h-[60px] flex items-center justify-between">
        <div className="flex gap-2">{id}</div>
      </div>
      <div>
        <ul className="flex flex-col gap-2">{children}</ul>
      </div>
    </div>
  );
}

export default ColumnContainer;
