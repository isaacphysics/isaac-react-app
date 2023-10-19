import { KeyboardCode, DroppableContainer, KeyboardCoordinateGetter } from "@dnd-kit/core";
import { CLOZE_DROP_ZONE_ID_PREFIX, CLOZE_ITEM_SECTION_ID } from "./constants";
import { sortBy } from "lodash";
import { isDefined } from "./miscUtils";

// Adapted from https://github.com/clauderic/dnd-kit/blob/5811986e7544a5e80039870a015e38df805eaad1/packages/sortable/src/sensors/keyboard/sortableKeyboardCoordinates.ts

const directions: string[] = [KeyboardCode.Up, KeyboardCode.Down];

export const customKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { context: { active, collisionRect, draggingNodeRect, droppableContainers, over } },
) => {
  if (!directions.includes(event.code)) return;

  event.preventDefault();

  if (!active || !collisionRect) {
    return;
  }

  const currentId = over?.id || active.id;

  // Get drop-zone droppables ordered by index
  const dropZoneContainers = sortBy(
    droppableContainers.toArray().filter((dc) => dc.id.toString().startsWith(CLOZE_DROP_ZONE_ID_PREFIX)),
    (dc: DroppableContainer) => dc.id,
  );

  // Get non-selected item droppables ordered left-to-right
  const itemSectionDroppableContainer = droppableContainers.get(CLOZE_ITEM_SECTION_ID);
  if (!itemSectionDroppableContainer) return;
  const nsiIds: string[] | undefined = itemSectionDroppableContainer?.data.current?.itemIds;
  const nsiDroppableContainers: DroppableContainer[] = nsiIds
    ? nsiIds.map((id) => droppableContainers.get(id)).filter(isDefined)
    : [];

  // Compile all droppables we care about in order
  const orderedDroppableContainers = dropZoneContainers.concat(
    nsiDroppableContainers?.length > 0 ? nsiDroppableContainers : [itemSectionDroppableContainer],
  );

  let nextDroppable;
  switch (event.code) {
    case KeyboardCode.Up:
      nextDroppable =
        orderedDroppableContainers[
          Math.max(
            0,
            orderedDroppableContainers.findIndex((dc) => dc.data.current?.itemId === currentId || dc.id === currentId) -
              1,
          )
        ];
      break;
    case KeyboardCode.Down:
      nextDroppable =
        orderedDroppableContainers[
          Math.min(
            orderedDroppableContainers.length - 1,
            orderedDroppableContainers.findIndex((dc) => dc.data.current?.itemId === currentId || dc.id === currentId) +
              1,
          )
        ];
      break;
  }

  const rect = nextDroppable?.rect.current;
  return rect && draggingNodeRect
    ? {
        x: rect.left + rect.width / 2 - draggingNodeRect?.width / 2,
        y: rect.top + rect.height / 2 - draggingNodeRect?.height / 2,
      }
    : undefined;
};
