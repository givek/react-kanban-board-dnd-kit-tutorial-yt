import { useState } from "react";
import { Column, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal, unstable_batchedUpdates } from "react-dom";
import TaskCard from "./TaskCard";

const defaultCols: Column[] = [
  {
    id: "todo",
    title: "Todo",
  },
  {
    id: "doing",
    title: "Work in progress",
  },
  {
    id: "done",
    title: "Done",
  },
  {
    id: "done1",
    title: "Done1",
  },
  {
    id: "done2",
    title: "Done2",
  },
  {
    id: "done3",
    title: "Done3",
  },
  {
    id: "done4",
    title: "Done4",
  },
  {
    id: "done5",
    title: "Done5",
  },
  {
    id: "done6",
    title: "Done6",
  },
  {
    id: "done7",
    title: "Done7",
  },
];

const defaultTasks: Task[] = [
  {
    id: "1",
    columnId: "todo",
    content: "List admin APIs for dashboard",
  },
  {
    id: "2",
    columnId: "todo",
    content: "Develop user registration functionality",
  },
  {
    id: "3",
    columnId: "doing",
    content: "Conduct security testing",
  },
  {
    id: "4",
    columnId: "doing",
    content: "Analyze competitors",
  },
  {
    id: "5",
    columnId: "done",
    content: "Create UI kit documentation",
  },
  {
    id: "6",
    columnId: "done",
    content: "Dev meeting",
  },
  {
    id: "7",
    columnId: "done",
    content: "Deliver dashboard prototype",
  },
  {
    id: "8",
    columnId: "todo",
    content: "Optimize application performance",
  },
  {
    id: "9",
    columnId: "todo",
    content: "Implement data validation",
  },
  {
    id: "10",
    columnId: "todo",
    content: "Design database schema",
  },
  {
    id: "11",
    columnId: "todo",
    content: "Integrate SSL web certificates into workflow",
  },
  {
    id: "12",
    columnId: "doing",
    content: "Implement error logging and monitoring",
  },
  {
    id: "13",
    columnId: "doing",
    content: "Design and implement responsive UI",
  },
];

type Items = { [key: UniqueIdentifier]: UniqueIdentifier[] };

export const TRASH_ID = "void";

const PLACEHOLDER_ID = "placeholder";

function KanbanBoard() {
  // const [columns, setColumns] = useState<Column[]>(defaultCols);

  // const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const [items, setItems] = useState<Items>(
    Object.fromEntries(
      defaultCols.map((col) => [
        col.id,
        defaultTasks
          .filter((task) => task.columnId === col.id)
          .map((task) => task.id),
      ])
    )
  );

  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
  );

  const [clonedItems, setClonedItems] = useState<Items | null>(null);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }

  return (
    <div className="flex flex-row">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={({ active }) => {
          setActiveId(active.id);
          setClonedItems(items);
        }}
        onDragOver={({ active, over }) => {
          console.log("onDragOver", active, over);

          const overId = over?.id;

          if (overId == null || overId === TRASH_ID || active.id in items) {
            return;
          }

          const overContainer = findContainer(overId);
          const activeContainer = findContainer(active.id);

          if (!overContainer || !activeContainer) {
            return;
          }

          if (activeContainer !== overContainer) {
            setItems((items) => {
              const activeItems = items[activeContainer];
              const overItems = items[overContainer];
              const overIndex = overItems.indexOf(overId);
              const activeIndex = activeItems.indexOf(active.id);

              let newIndex: number;

              if (overId in items) {
                console.log("Over-In-Items");

                newIndex = overItems.length + 1;
              } else {
                console.log("Over-In-Else");

                const isBelowOverItem =
                  over &&
                  active.rect.current.translated &&
                  active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;

                newIndex =
                  overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
              }

              return {
                ...items,
                [activeContainer]: items[activeContainer].filter(
                  (item) => item !== active.id
                ),
                [overContainer]: [
                  ...items[overContainer].slice(0, newIndex),
                  items[activeContainer][activeIndex],
                  ...items[overContainer].slice(
                    newIndex,
                    items[overContainer].length
                  ),
                ],
              };
            });
          }
        }}
        onDragEnd={({ active, over }) => {
          // if (active.id in items && over?.id) {
          //   setContainers((containers) => {
          //     const activeIndex = containers.indexOf(active.id);
          //     const overIndex = containers.indexOf(over.id);

          //     return arrayMove(containers, activeIndex, overIndex);
          //   });
          // }

          const activeContainer = findContainer(active.id);

          if (!activeContainer) {
            setActiveId(null);
            return;
          }

          const overId = over?.id;

          if (overId == null) {
            setActiveId(null);
            return;
          }

          // if (overId === TRASH_ID) {
          //   setItems((items) => ({
          //     ...items,
          //     [activeContainer]: items[activeContainer].filter(
          //       (id) => id !== activeId
          //     ),
          //   }));
          //   setActiveId(null);
          //   return;
          // }

          // if (overId === PLACEHOLDER_ID) {
          //   const newContainerId = getNextContainerId();

          //   unstable_batchedUpdates(() => {
          //     setContainers((containers) => [...containers, newContainerId]);
          //     setItems((items) => ({
          //       ...items,
          //       [activeContainer]: items[activeContainer].filter(
          //         (id) => id !== activeId
          //       ),
          //       [newContainerId]: [active.id],
          //     }));
          //     setActiveId(null);
          //   });
          //   return;
          // }

          const overContainer = findContainer(overId);

          if (overContainer) {
            const activeIndex = items[activeContainer].indexOf(active.id);
            const overIndex = items[overContainer].indexOf(overId);

            if (activeIndex !== overIndex) {
              setItems((items) => ({
                ...items,
                [overContainer]: arrayMove(
                  items[overContainer],
                  activeIndex,
                  overIndex
                ),
              }));
            }
          }

          setActiveId(null);
        }}
        // cancelDrop={cancelDrop}
        // onDragCancel={onDragCancel}
      >
        {containers.map((containerId) => (
          <SortableContext
            items={items[containerId]}
            strategy={verticalListSortingStrategy}
          >
            <ColumnContainer
              key={containerId}
              id={containerId}
              items={items[containerId]}
            >
              {items[containerId].map((value) => {
                return <TaskCard key={value} id={value} />;
              })}
            </ColumnContainer>
          </SortableContext>
        ))}
        <DragOverlay>
          {activeId ? <TaskCard id={activeId} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
