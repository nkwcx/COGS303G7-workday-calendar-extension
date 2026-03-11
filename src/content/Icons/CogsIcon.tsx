import { useState } from "react";

interface IProps {
  size: number;
  onClick: () => void;
  active?: boolean;
}

const colorHover = "#ffffffff";
const color = "#efefefff";
const colorActive = "#ffffffff";

// UBC CSS-inspired brain/cog icon
const CogsIcon = ({ size, onClick, active }: IProps) => {
  const [hovered, setHovered] = useState(false);
  const stroke = active ? colorActive : hovered ? colorHover : color;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ cursor: "pointer", opacity: active ? 1 : 0.85 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Simplified head/screen outline resembling the UBC CSS logo */}
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Antenna */}
      <path
        d="M12 5 C12 5, 13 2.5, 14.5 2"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="14.5" cy="1.8" r="0.7" fill={stroke} />
      {/* Eyes */}
      <circle cx="9" cy="14" r="1" fill={stroke} />
      <circle cx="15" cy="14" r="1" fill={stroke} />
    </svg>
  );
};

export default CogsIcon;
