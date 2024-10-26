export interface AutoScaleTextProps {
  text: string;
  alignHorizontal?: HorizontalTextAlignment;
  alignVertical?: VerticalTextAlignment;
}

type HorizontalTextAlignment = "left" | "center" | "right";
type VerticalTextAlignment = "top" | "center" | "bottom";

const HMap: {
  [_ in HorizontalTextAlignment]: { x: string; textAnchor: string };
} = {
  left: { x: "0%", textAnchor: "start" },
  center: { x: "50%", textAnchor: "middle" },
  right: { x: "100%", textAnchor: "end" },
};

const VMap: {
  [_ in VerticalTextAlignment]: { y: string; dominantBaseline: string };
} = {
  top: { y: "0%", dominantBaseline: "start" },
  center: { y: "50%", dominantBaseline: "middle" },
  bottom: { y: "100%", dominantBaseline: "end" },
};

export default function AutoScaleText({
  text,
  alignHorizontal = "center",
  alignVertical = "center",
}: AutoScaleTextProps) {
  // not sure font size matters, I just picked a nice number
  const fontSize = 11;
  // general guestimation based on average aspect ratio of fonts, should be tuned
  const averageLetterAspectRatio = 0.6;
  // 10000 here just makes it so if the text is empty we don't take up crazy height
  const viewBowWidth =
    (text.length || 10000) * fontSize * averageLetterAspectRatio;

  const { x, textAnchor } = HMap[alignHorizontal];
  const { y, dominantBaseline } = VMap[alignVertical];

  return (
    <svg viewBox={`0 0 ${viewBowWidth} ${fontSize}`}>
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
        fontSize={fontSize}
        fill="currentColor"
      >
        {text}
      </text>
    </svg>
  );
}
