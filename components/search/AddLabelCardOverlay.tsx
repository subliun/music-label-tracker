import styles from "./../label/LabelStyles.module.css";

export default function AddLabelCardOverlay(props: { children: React.ReactNode }) {
  return (
    <div className={`relative`}>
      {props.children}

      <div
        className={`${styles["label-overlay"]} 
      absolute top-0 w-full h-full flex flex-col justify-center items-center 
      hover:bg-opacity-80 bg-coolGray-900 rounded-xl`}
      >
        <div className="w-32 h-32 -mt-8 bg-none bg-opacity-90 hover:bg-opacity-80">
          <svg
            className=""
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            stroke="white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <p className="text-white uppercase font-semibold tracking-widest">add</p>
        </div>
      </div>
    </div>
  );
}
