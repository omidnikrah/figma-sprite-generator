import { showUI } from "@create-figma-plugin/utilities";

import { Layout } from "@src/constants";

const updateSelectionCount = () => {
  const selectedItems = figma.currentPage.selection.length;
  figma.ui.postMessage({ type: "selection-change", data: { selectedItemsCount: selectedItems } });
};

const handleCreateSprite = async () => {
  const selectedNodes = figma.currentPage.selection;

  if (selectedNodes.length === 0) {
    figma.ui.postMessage({ type: "error", data: { message: "Please select some icons." } });
    return;
  }

  const { exportedImages, iconsData, hasDuplicatedNames } = await processSelectedNodes(selectedNodes);

  if (hasDuplicatedNames) {
    figma.ui.postMessage({ type: "duplicate-name-error", data: { message: "The name of the icons must be unique!" } });
  } else {
    figma.ui.postMessage({ type: "sprite-created", data: { exportedImages, iconsData } });
  }
};

const processSelectedNodes = async (selectedNodes: readonly SceneNode[]) => {
  const iconsData: IconsData = {};
  const exportedImages: ExportedImages = [];
  let hasDuplicatedNames = false;
  let index = 0;

  for (const node of selectedNodes) {
    if ("exportAsync" in node && "name" in node) {
      const { width, height } = node;
      const exportedImage = await node.exportAsync({ format: "PNG" });
      exportedImages.push(exportedImage);

      if (iconsData[node.name]) {
        hasDuplicatedNames = true;
        break;
      }

      const row = Math.floor(index / Layout.ICONS_PER_ROW);
      const col = index % Layout.ICONS_PER_ROW;

      iconsData[node.name] = {
        x: col * (width + Layout.ICONS_PADDING),
        y: row * (height + Layout.ICONS_PADDING),
        width,
        height,
      };
    }
    index++;
  }

  return { exportedImages, iconsData, hasDuplicatedNames };
};

export default function () {
  figma.on("selectionchange", updateSelectionCount);

  figma.ui.onmessage = async msg => {
    if (msg.type === "create-sprite") {
      await handleCreateSprite();
    }
  };

  showUI({
    height: 300,
    width: 360,
  });
}
