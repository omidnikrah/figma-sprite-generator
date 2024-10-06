export const calculateMaxDimensions = (iconData: Record<string, any>, iconNames: string[]): { iconWidth: number, iconHeight: number } => {
    let maxWidth = 0;
    let maxHeight = 0;

    for (const name of iconNames) {
        const { width, height } = iconData[name];
        if (width > maxWidth) maxWidth = width;
        if (height > maxHeight) maxHeight = height;
    }

    return { iconWidth: maxWidth, iconHeight: maxHeight };
}
