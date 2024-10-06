import { zipSync } from "fflate";

export const createZipFile = async (files: Record<string, Uint8Array>): Promise<void> => {
  const zip = zipSync(files);
  const blob = new Blob([zip], { type: "application/zip" });
  const zipUrl = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = zipUrl;
  downloadLink.download = "sprite.zip";
  downloadLink.click();

  URL.revokeObjectURL(zipUrl);
};

export const createZip = async (
  canvas: HTMLCanvasElement,
  iconData: IconsData,
): Promise<Record<string, Uint8Array>> => {
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
  if (!blob) throw new Error("Failed to create blob from canvas");

  const spriteBuffer = await blob.arrayBuffer();
  const jsonString = JSON.stringify(iconData, null, 2);

  return {
    "sprite.png": new Uint8Array(spriteBuffer),
    "sprite.json": new TextEncoder().encode(jsonString),
  };
};
