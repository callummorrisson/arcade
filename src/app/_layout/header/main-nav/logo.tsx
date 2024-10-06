export default function Logo() {
  return <SvgLogo />;
}

// this should all be calculated at build time so shouldn't slow anything down.
// none of our letters have descenders, so for now we'll let the baseline be as low as possible.
const viewPortHeight = 100;
const strokeWidth = 5;
const kerning = 5;
const xHeight = 75;

const characterWidth = xHeight;
const capHeight = viewPortHeight - xHeight;
const halfStroke = strokeWidth / 2;
const baseline = viewPortHeight - halfStroke;

const ascenderTop = halfStroke;
const radius = (characterWidth - strokeWidth) / 2;
const centerX = xHeight / 2;
const centerY = capHeight + centerX;

function SvgLogo() {
  return (
    <svg
      stroke="currentColor"
      strokeWidth={strokeWidth}
      fill="transparent"
      viewBox={`0 0 ${characterWidth * 6 + kerning * 5} ${viewPortHeight}`}
      height="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g name="a">
        <circle cx={centerX} cy={centerY} r={radius} />
        <line
          x1={radius + centerX}
          x2={radius + centerX}
          y1={centerY}
          y2={baseline}
        />
      </g>
      <g name="r" transform={`translate(${characterWidth + kerning},0)`}>
        <path
          d={`M ${halfStroke} ${baseline} 
              L ${halfStroke} ${centerY} 
              A ${radius} ${radius} 0 0 1 ${radius + centerX} ${centerY}`}
        />
      </g>
      <g name="c" transform={`translate(${2 * (characterWidth + kerning)},0)`}>
        <path
          d={`M ${radius + centerX} ${centerY} 
              A ${radius} ${radius} 0 1 0 ${centerX} ${baseline}}`}
        />
      </g>
      <g name="a" transform={`translate(${3 * (characterWidth + kerning)},0)`}>
        <circle cx={centerX} cy={centerY} r={radius} />
        <line
          x1={radius + centerX}
          x2={radius + centerX}
          y1={centerY}
          y2={baseline}
        />
      </g>
      <g name="d" transform={`translate(${4 * (characterWidth + kerning)},0)`}>
        <circle cx={centerX} cy={centerY} r={radius} />
        <line
          x1={radius + centerX}
          x2={radius + centerX}
          y1={centerY}
          y2={ascenderTop}
        />
      </g>
      <g name="e" transform={`translate(${5 * (characterWidth + kerning)},0)`}>
        <path
          d={`M ${halfStroke} ${centerY} 
              L ${radius + centerX} ${centerY} 
              A ${radius} ${radius} 0 1 0 ${centerX} ${baseline}}`}
        />
      </g>
    </svg>
  );
}
