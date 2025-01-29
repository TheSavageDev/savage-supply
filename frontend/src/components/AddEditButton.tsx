interface AddEditButtonProps {
  onClick: (value: boolean) => void;
  text: string;
}

export const AddEditButton = ({ onClick, text }: AddEditButtonProps) => {
  return (
    <button
      onClick={() => onClick(true)}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:border-1 dark:border-gray-700 dark:bg-blue-950 dark:hover:bg-blue-800"
    >
      {text}
    </button>
  );
};
