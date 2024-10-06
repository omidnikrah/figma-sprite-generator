import { render } from "@create-figma-plugin/ui";
import { Fragment, useEffect, useState } from "preact/compat";
import { twMerge } from "tailwind-merge";

import { Loading, ReadyState, SelectingState } from "@src/components";
import { Layout } from "@src/constants";
import { calculateMaxDimensions } from "@src/helpers";
import { FileService } from "@src/services";

import "!./styles/output.css";

enum PLUGIN_STATUS {
  INIT,
  GENERATING,
  GENERATED,
}

const SpritePlugin = () => {
  const [selectedIconsCount, setSelectedItemsCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [status, setStatus] = useState<PLUGIN_STATUS>(PLUGIN_STATUS.INIT);

  const createCanvas = (width: number, height: number): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    return canvas;
  };

  const drawImagesOnCanvas = async (
    ctx: CanvasRenderingContext2D,
    exportedImages: Uint8Array[],
    iconsData: IconsData,
  ) => {
    const iconsPerRow = Layout.ICONS_PER_ROW;
    const padding = Layout.ICONS_PADDING;
    const iconNames = Object.keys(iconsData);

    const imagePromises = exportedImages.map((image, index) => {
      return new Promise<void>(resolve => {
        const img = new Image();
        const blob = new Blob([image], { type: "image/png" });
        img.src = URL.createObjectURL(blob);

        img.onload = () => {
          const iconName = iconNames[index];
          const iconInfo = iconsData[iconName];

          const row = Math.floor(index / iconsPerRow);
          const col = index % iconsPerRow;
          const x = col * (iconInfo.width + padding);
          const y = row * (iconInfo.height + padding);

          ctx.drawImage(img, x, y, iconInfo.width, iconInfo.height);

          resolve();
        };

        img.onerror = () => {
          console.error(`Failed to load image for icon ${iconNames[index]}`);
          resolve();
        };
      });
    });

    await Promise.all(imagePromises);
  };

  const handleSpriteCreation = async (exportedImages: ExportedImages, iconsData: IconsData) => {
    setStatus(PLUGIN_STATUS.GENERATING);

    const { iconWidth, iconHeight } = calculateMaxDimensions(iconsData, Object.keys(iconsData));

    const iconsPerRow = Layout.ICONS_PER_ROW;
    const padding = Layout.ICONS_PADDING;
    const iconNames = Object.keys(iconsData);

    const numRows = Math.ceil(iconNames.length / iconsPerRow);
    const canvasWidth = (iconWidth + padding) * iconsPerRow;
    const canvasHeight = (iconHeight + padding) * numRows;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setErrorMessage("Failed to initialize canvas");
      setStatus(PLUGIN_STATUS.INIT);
      return;
    }

    await drawImagesOnCanvas(ctx, exportedImages, iconsData);

    const zipFiles = await FileService.createZip(canvas, iconsData);
    await FileService.createZipFile(zipFiles);

    // Just a tiny fake delay to let the loading effect shine ⏳✨
    setTimeout(() => {
      setStatus(PLUGIN_STATUS.GENERATED);
    }, 1000);
  };

  const handlePluginMessages = async (pluginMessage: PluginMessages) => {
    switch (pluginMessage.type) {
      case "selection-change":
        setSelectedItemsCount(pluginMessage.data.selectedItemsCount);
        break;
      case "sprite-created":
        await handleSpriteCreation(pluginMessage.data.exportedImages, pluginMessage.data.iconsData);
        break;
      case "duplicate-name-error":
      case "error":
        console.log(pluginMessage);
        setErrorMessage(pluginMessage.data.message);
        break;

      default:
        break;
    }
  };

  const handleGenerateAndDownload = () => {
    if (status === PLUGIN_STATUS.GENERATED) {
      setErrorMessage("");
      setSelectedItemsCount(0);
      setStatus(PLUGIN_STATUS.INIT);
    } else {
      parent.postMessage({ pluginMessage: { type: "create-sprite" } }, "*");
    }
  };

  useEffect(() => {
    window.onmessage = async event => {
      const { pluginMessage } = event.data;

      await handlePluginMessages(pluginMessage);
    };
  }, []);

  const isInit = status === PLUGIN_STATUS.INIT;
  const isGenerating = status === PLUGIN_STATUS.GENERATING;
  const isGenerated = status === PLUGIN_STATUS.GENERATED;

  return (
    <section className="flex size-full flex-col justify-between">
      <div className="flex size-full flex-col items-center justify-center">
        {!isGenerated && <SelectingState selectedIconsCount={selectedIconsCount} />}
        {isGenerated && <ReadyState />}
      </div>

      <div className="flex items-center justify-center">
        {errorMessage && <span className="absolute -mt-20 block text-center text-base text-red">{errorMessage}</span>}

        <button
          className={twMerge(
            "flex h-12 w-full shrink-0 appearance-none items-center justify-center rounded-lg bg-black text-base text-white transition-all disabled:opacity-25",
            isGenerating && "bg-white text-black",
          )}
          disabled={!selectedIconsCount}
          onClick={handleGenerateAndDownload}
        >
          {isInit && "Generate Sprite"}

          {isGenerating && (
            <Fragment>
              Generate Sprite <Loading />
            </Fragment>
          )}

          {isGenerated && "Start Again"}
        </button>
      </div>
    </section>
  );
};

export default render(SpritePlugin);
