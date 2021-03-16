import styles from "./../label/LabelStyles.module.css";

export default function RemoveLabelCardOverlay(props: { children: React.ReactNode }) {
  return (
    <div className={``}>
      {props.children}

      <div
        className={`${styles["label-overlay"]} 
      absolute top-0 w-full h-full flex flex-col justify-center items-center rounded-xl`}
      >
        <div
          className={`
        p-1
        flex flex-row justify-center items-center 
        text-white bg-red-500 hover:bg-red-600 border-gray-100 border-2 rounded-md`}
        >
          <svg
            className="w-16 h-16"
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
        </div>
      </div>
    </div>
  );
}
