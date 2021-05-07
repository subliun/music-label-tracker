import styles from "./../label/LabelStyles.module.css";

interface RemoveLabelCardOverlayProps {
  children: React.ReactNode;

  onRemoveLabelClick: (e: React.MouseEvent) => void;
}

export default function RemoveLabelCardOverlay(props: RemoveLabelCardOverlayProps) {
  return (
    <div className={`relative group transform hover:scale-110 transition-all`}>
      {props.children}

      <div
        className={`
       absolute -top-3 left-3 w-full h-full flex flex-row justify-end items-start rounded-xl`}
      >
        <button
          className={`opacity-0 hover-none:opacity-100 group-hover:opacity-100
        p-1
        flex flex-row justify-center items-center 
        text-white bg-red-500 hover:bg-red-600 border-gray-100 border-2 rounded-full
        transition-all duration-300`}
        onClick={props.onRemoveLabelClick}
        >
          <svg
            className="w-6 h-6 transform rotate-45 "
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
