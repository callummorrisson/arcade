export interface AutoScaleTextProps {
  text: string;
}

export default function AutoScaleText({ text }: AutoScaleTextProps) {
  // not sure font size matters, I just picked a nice number
  const fontSize = 11;
  // general guestimation based on average aspect ratio of fonts, should be tuned
  const averageLetterAspectRatio = 0.6;
  // 10000 here just makes it so if the text is empty we don't take up crazy height
  const viewBowWidth =
    (text.length || 10000) * fontSize * averageLetterAspectRatio;
  return (
    <svg viewBox={`0 0 ${viewBowWidth} ${fontSize}`}>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={fontSize}
        fill="currentColor"
      >
        {text}
      </text>
    </svg>
  );
}
