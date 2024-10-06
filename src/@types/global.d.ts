interface IconData {
  x: number;
  y: number;
  width: number;
  height: number;
}

type IconsData = Record<string, IconData>;
type ExportedImages = Uint8Array[];

interface MessagesDataMap {
  "selection-change": { selectedItemsCount: number };
  "duplicate-name-error": { message: string };
  "sprite-created": { exportedImages: ExportedImages; iconsData: IconsData };
  error: { message: string };
}

type PluginMessages = {
  [K in keyof MessagesDataMap]: {
    type: K;
    data: MessagesDataMap[K];
  };
}[keyof MessagesDataMap];
