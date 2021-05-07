interface LabelReleaseCountProps {
  releaseCount: number;
  fontSizeClass?: string;
}

export default function LabelReleaseCount(props: LabelReleaseCountProps) {
  let fontSize = props.fontSizeClass ?? "text-sm";

  return (
    <p className={`font-light ${fontSize} `}>
      {props.releaseCount + " " + (props.releaseCount === 1 ? "release" : "releases")}
    </p>
  );
}
