interface NoResultsProps {
  q: string
}

export default function NoSearchResults(props: NoResultsProps) {
  return (
    <div className="space-x-2 flex items-baseline font-normal text-xl">
      <span className="">No results for query <q><span className="font-medium italic">{props.q}</span></q></span>
      <span className="text-2xl tracking-widest">:(</span>
    </div>
  );
}