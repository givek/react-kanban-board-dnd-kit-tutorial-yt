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
    <div className="bg-gray-100 w-[308px] min-w-[308px] px-6 py-2 flex-1">
      <div className="mb-4">
        <div>{id}</div>
      </div>
      <div ref={setNodeRef} className="flex flex-col gap-4">
        {/* <div className="h-full"> */}
        {children}
        {/* </div> */}
      </div>
    </div>
  );
}

export default ColumnContainer;
