interface AddAnotherLabelButtonProps {
  onClick: () => void;
}

export default function AddAnotherLabelButton(props: AddAnotherLabelButtonProps) {
  return (
    <button
          className={`
        overflow-hidden 
        w-full h-24 flex-1
        px-4 py-6
        flex flex-row justify-center items-center
        bg-gray-200 hover:bg-gray-300 shadow rounded-xl
        transform hover:scale-110 transition-all`}

        onClick={props.onClick}
        >
            <svg
              className="w-10 h-10 -ml-1 text-black opacity-40 flex-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
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
            <p className="ml-2 text-gray-800 opacity-80 text-center tracking-wide">
              Add Another Label
            </p>
        </button>
  );
}