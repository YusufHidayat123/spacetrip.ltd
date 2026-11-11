// Generates crisp studio garment flat-lay SVG illustrations matched to garment silhouette & colorway
export function generateGarmentSvg({
  silhouette,
  primaryHex,
  secondaryHex = "#2A2A28",
  accentHex = "#D8D5CD",
  label = "",
}) {
  const bg = "#EAE8E2";
  const stroke = "#1D1D1B";

  let garmentPaths = "";

  switch (silhouette) {
    case "tee":
    case "baby-tee": {
      const crop = silhouette === "baby-tee" ? 110 : 0;
      garmentPaths = `
        <path d="M190,130 L110,175 L80,275 L155,295 L175,235 L175,${560 - crop} L425,${560 - crop} L425,235 L445,295 L520,275 L490,175 L410,130 Q355,170 300,170 Q245,170 190,130 Z"
          fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M235,134 Q300,185 365,134" fill="none" stroke="${secondaryHex}" stroke-width="10" stroke-linecap="round"/>
        <path d="M235,134 Q300,185 365,134" fill="none" stroke="${stroke}" stroke-width="2"/>
        <line x1="175" y1="${544 - crop}" x2="425" y2="${544 - crop}" stroke="${secondaryHex}" stroke-width="1.5" stroke-dasharray="4 4"/>
        ${label === "graphic" ? `
          <circle cx="300" cy="295" r="46" fill="none" stroke="${accentHex}" stroke-width="2.5" opacity="0.85"/>
          <ellipse cx="300" cy="295" rx="70" ry="18" fill="none" stroke="${accentHex}" stroke-width="2" transform="rotate(-18 300 295)" opacity="0.8"/>
          <circle cx="300" cy="295" r="10" fill="${accentHex}" opacity="0.85"/>
        ` : label === "pocket" ? `
          <path d="M335,235 L385,235 L385,282 L360,296 L335,282 Z" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        ` : ""}
      `;
      break;
    }

    case "shirt":
    case "flannel":
    case "blouse": {
      const hasPlaid = silhouette === "flannel";
      garmentPaths = `
        <path d="M205,125 L105,170 L60,420 L125,435 L165,245 L165,575 L435,575 L435,245 L475,435 L540,420 L495,170 L395,125 Z"
          fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
        ${hasPlaid ? `
          <g opacity="0.24" stroke="${secondaryHex}" stroke-width="14">
            <line x1="210" y1="130" x2="210" y2="570"/>
            <line x1="295" y1="130" x2="295" y2="570"/>
            <line x1="385" y1="130" x2="385" y2="570"/>
            <line x1="165" y1="240" x2="435" y2="240"/>
            <line x1="165" y1="360" x2="435" y2="360"/>
            <line x1="165" y1="480" x2="435" y2="480"/>
          </g>
        ` : label === "stripe" ? `
          <g opacity="0.25" stroke="${secondaryHex}" stroke-width="4">
            <line x1="205" y1="140" x2="205" y2="570"/>
            <line x1="240" y1="140" x2="240" y2="570"/>
            <line x1="275" y1="140" x2="275" y2="570"/>
            <line x1="325" y1="140" x2="325" y2="570"/>
            <line x1="360" y1="140" x2="360" y2="570"/>
            <line x1="395" y1="140" x2="395" y2="570"/>
          </g>
        ` : ""}
        <path d="M235,125 L300,190 L365,125 L335,112 L300,150 L265,112 Z" fill="${primaryHex}" stroke="${stroke}" stroke-width="2.2"/>
        <line x1="300" y1="190" x2="300" y2="575" stroke="${stroke}" stroke-width="2"/>
        <rect x="200" y="245" width="66" height="74" rx="4" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        <rect x="334" y="245" width="66" height="74" rx="4" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        <circle cx="300" cy="235" r="4" fill="${accentHex}" stroke="${stroke}" stroke-width="1.5"/>
        <circle cx="300" cy="300" r="4" fill="${accentHex}" stroke="${stroke}" stroke-width="1.5"/>
        <circle cx="300" cy="365" r="4" fill="${accentHex}" stroke="${stroke}" stroke-width="1.5"/>
        <circle cx="300" cy="430" r="4" fill="${accentHex}" stroke="${stroke}" stroke-width="1.5"/>
        <circle cx="300" cy="495" r="4" fill="${accentHex}" stroke="${stroke}" stroke-width="1.5"/>
      `;
      break;
    }

    case "jacket":
    case "bomber":
    case "varsity":
    case "track": {
      const sleeveFill = silhouette === "varsity" ? accentHex : primaryHex;
      garmentPaths = `
        <path d="M195,128 L95,175 L55,445 L125,460 L165,250 L165,575 L435,575 L435,250 L475,460 L545,445 L505,175 L405,128 Z"
          fill="${sleeveFill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="165" y="128" width="270" height="447" fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5"/>
        <path d="M225,128 L300,175 L375,128 L350,108 L250,108 Z" fill="${secondaryHex}" stroke="${stroke}" stroke-width="2.2"/>
        <rect x="165" y="545" width="270" height="30" fill="${secondaryHex}" stroke="${stroke}" stroke-width="2"/>
        <line x1="300" y1="175" x2="300" y2="545" stroke="${stroke}" stroke-width="3"/>
        <rect x="195" y="395" width="70" height="82" rx="4" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        <rect x="335" y="395" width="70" height="82" rx="4" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        ${silhouette === "track" ? `
          <rect x="165" y="270" width="270" height="42" fill="${accentHex}" opacity="0.7"/>
        ` : ""}
      `;
      break;
    }

    case "hoodie":
    case "crewneck":
    case "knit": {
      const isHoodie = silhouette === "hoodie";
      garmentPaths = `
        <path d="M200,145 L100,190 L60,455 L125,470 L165,270 L165,575 L435,575 L435,270 L475,470 L540,455 L500,190 L400,145 Z"
          fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
        ${isHoodie ? `
          <path d="M220,150 Q215,85 300,82 Q385,85 380,150 Q300,188 220,150 Z" fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5"/>
          <path d="M235,148 Q300,110 365,148" fill="none" stroke="${secondaryHex}" stroke-width="3"/>
          <line x1="280" y1="168" x2="280" y2="235" stroke="${accentHex}" stroke-width="3" stroke-linecap="round"/>
          <line x1="320" y1="168" x2="320" y2="235" stroke="${accentHex}" stroke-width="3" stroke-linecap="round"/>
          <path d="M205,405 L395,405 L415,525 L185,525 Z" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        ` : `
          <path d="M235,145 Q300,190 365,145" fill="none" stroke="${secondaryHex}" stroke-width="12" stroke-linecap="round"/>
          <path d="M235,145 Q300,190 365,145" fill="none" stroke="${stroke}" stroke-width="2"/>
        `}
        <rect x="165" y="548" width="270" height="27" fill="${secondaryHex}" opacity="0.22"/>
      `;
      break;
    }

    case "vest": {
      garmentPaths = `
        <path d="M200,120 L155,145 L155,270 L165,565 L435,565 L445,270 L445,145 L400,120 L355,120 L300,220 L245,120 Z"
          fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="300" y1="220" x2="300" y2="565" stroke="${stroke}" stroke-width="2.5"/>
        <rect x="188" y="255" width="76" height="75" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        <rect x="336" y="255" width="76" height="75" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        <rect x="185" y="385" width="90" height="105" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        <rect x="325" y="385" width="90" height="105" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
      `;
      break;
    }

    case "cargo":
    case "denim":
    case "pants": {
      const isCargo = silhouette === "cargo";
      garmentPaths = `
        <path d="M185,110 L415,110 L445,620 L330,620 L300,320 L270,620 L155,620 Z"
          fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="185" y="110" width="230" height="34" fill="${primaryHex}" stroke="${stroke}" stroke-width="2.2"/>
        <line x1="300" y1="144" x2="300" y2="265" stroke="${stroke}" stroke-width="2"/>
        <circle cx="300" cy="127" r="5" fill="${accentHex}" stroke="${stroke}" stroke-width="1.5"/>
        ${isCargo ? `
          <rect x="148" y="305" width="44" height="108" rx="4" fill="${primaryHex}" stroke="${stroke}" stroke-width="2.2"/>
          <rect x="408" y="305" width="44" height="108" rx="4" fill="${primaryHex}" stroke="${stroke}" stroke-width="2.2"/>
          <line x1="148" y1="330" x2="192" y2="330" stroke="${stroke}" stroke-width="1.8"/>
          <line x1="408" y1="330" x2="452" y2="330" stroke="${stroke}" stroke-width="1.8"/>
        ` : `
          <path d="M185,180 Q218,192 232,144" fill="none" stroke="${accentHex}" stroke-width="2"/>
          <path d="M415,180 Q382,192 368,144" fill="none" stroke="${accentHex}" stroke-width="2"/>
        `}
      `;
      break;
    }

    case "skirt": {
      garmentPaths = `
        <path d="M210,125 L390,125 L455,580 L145,580 Z"
          fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="210" y="125" width="180" height="32" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        <rect x="158" y="290" width="48" height="90" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
        <rect x="394" y="290" width="48" height="90" fill="${primaryHex}" stroke="${stroke}" stroke-width="2"/>
      `;
      break;
    }

    case "dress": {
      garmentPaths = `
        <path d="M225,115 L250,115 L265,185 Q300,205 335,185 L350,115 L375,115 L395,255 L455,610 L145,610 L205,255 Z"
          fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="205" y1="295" x2="395" y2="295" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="5 5"/>
      `;
      break;
    }

    case "cap": {
      garmentPaths = `
        <path d="M165,365 C165,220 435,220 435,365 L165,365 Z"
          fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5"/>
        <path d="M150,365 C150,415 470,415 495,380 C440,348 220,348 150,365 Z"
          fill="${secondaryHex}" stroke="${stroke}" stroke-width="2.5"/>
        <path d="M300,256 L300,360" stroke="${stroke}" stroke-width="1.8" opacity="0.5"/>
        <path d="M225,275 L210,360" stroke="${stroke}" stroke-width="1.8" opacity="0.5"/>
        <path d="M375,275 L390,360" stroke="${stroke}" stroke-width="1.8" opacity="0.5"/>
        <circle cx="300" cy="250" r="7" fill="${secondaryHex}" stroke="${stroke}" stroke-width="1.8"/>
      `;
      break;
    }

    case "bag": {
      garmentPaths = `
        <path d="M175,260 Q175,120 300,120 Q425,120 425,260" fill="none" stroke="${secondaryHex}" stroke-width="18" stroke-linecap="round"/>
        <rect x="145" y="255" width="310" height="275" rx="14" fill="${primaryHex}" stroke="${stroke}" stroke-width="2.5"/>
        <path d="M145,280 L455,280 L435,390 L165,390 Z" fill="${primaryHex}" stroke="${stroke}" stroke-width="2.2"/>
        <rect x="275" y="370" width="50" height="36" rx="4" fill="${secondaryHex}" stroke="${stroke}" stroke-width="2"/>
      `;
      break;
    }

    case "belt":
    default: {
      garmentPaths = `
        <circle cx="300" cy="360" r="145" fill="none" stroke="${primaryHex}" stroke-width="46"/>
        <circle cx="300" cy="360" r="168" fill="none" stroke="${stroke}" stroke-width="2.5"/>
        <circle cx="300" cy="360" r="122" fill="none" stroke="${stroke}" stroke-width="2.5"/>
        <rect x="260" y="182" width="80" height="64" rx="8" fill="none" stroke="#8C8C88" stroke-width="10"/>
        <rect x="260" y="182" width="80" height="64" rx="8" fill="none" stroke="${stroke}" stroke-width="2"/>
      `;
      break;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="${bg}"/>
  <g filter="drop-shadow(0px 18px 24px rgba(14,14,14,0.10))">
    ${garmentPaths}
  </g>
</svg>`;
}

