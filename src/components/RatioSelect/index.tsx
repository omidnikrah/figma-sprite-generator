import { useState, useRef, useEffect } from "preact/compat";

import { DEFAULT_RATIO } from "@src/configs";

export type RatioItem = {
  value: number;
  label: string;
};

const RATIO_VALUES: RatioItem[] = [
  {
    value: 0.5,
    label: "0.5x",
  },
  {
    value: 0.75,
    label: "0.75x",
  },
  {
    value: 1,
    label: "1x",
  },
  {
    value: 1.5,
    label: "1.5x",
  },
  {
    value: 2,
    label: "2x",
  },
  {
    value: 3,
    label: "3x",
  },
];

interface IRatioSelectProps {
  onChange: (value: RatioItem["value"]) => void;
}

export const RatioSelect = ({ onChange }: IRatioSelectProps) => {
  const [selectedRatio, setSelectedRatio] = useState<RatioItem>(DEFAULT_RATIO);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);

  const handleRatioChange = (ratio: RatioItem) => {
    setSelectedRatio(ratio);
    onChange(ratio.value);
  };

  useEffect(() => {
    if (containerRef.current && selectedButtonRef.current && highlighterRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const selectedRect = selectedButtonRef.current.getBoundingClientRect();

      highlighterRef.current.style.left = `${selectedRect.left - containerRect.left}px`;
      highlighterRef.current.style.width = `${selectedRect.width}px`;
      highlighterRef.current.style.height = `${selectedRect.height}px`;
    }
  }, [selectedRatio]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center rounded-lg bg-white p-2 font-mono shadow-sm transition-all duration-300 ease-in-out"
    >
      <div ref={highlighterRef} className="absolute rounded-md bg-gray-900 transition-all duration-300 ease-in-out" />
      {RATIO_VALUES.map(ratio => (
        <button
          key={ratio.value}
          ref={selectedRatio.value === ratio.value ? selectedButtonRef : null}
          className={`relative z-10 px-3 py-1 text-xs font-medium transition-colors duration-200 ${
            selectedRatio.value === ratio.value ? "text-white" : "text-gray-700 hover:text-gray-900"
          }`}
          onClick={() => handleRatioChange(ratio)}
        >
          {ratio.label}
        </button>
      ))}
    </div>
  );
};
