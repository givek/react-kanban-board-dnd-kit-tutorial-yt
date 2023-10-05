import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  id: UniqueIdentifier;
}

function TaskCard({ id }: Props) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    attributes,
    transform,
    transition,
  } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const draggingActiveClasses = isDragging
    ? "opacity-30 border-2 border-rose-200"
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 bg-white h-[100px] min-h-[100px] items-center flex hover:ring-2 hover:ring-inset hover:ring-rose-200 cursor-grab relative ${draggingActiveClasses}`}
    >
      {/* <div> */}
      <p className="my-auto w-full">{id}</p>
      {/* </div> */}
    </div>
  );
}

export default TaskCard;
