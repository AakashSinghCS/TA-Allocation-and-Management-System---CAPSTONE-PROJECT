import { toast } from "react-toastify";

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export function showToastConfirmation(
  options: ConfirmationOptions
): Promise<boolean> {
  const {
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'warning'
  } = options;

  return new Promise((resolve) => {
    const toastId = toast(
      <div>
        <div className="font-semibold mb-2 text-gray-900">{title}</div>
        <div className="mb-3 text-sm text-gray-700">{message}</div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium transition-colors"
            onClick={() => {
              toast.dismiss(toastId);
              resolve(false);
            }}
          >
            {cancelText}
          </button>
          <button
            className={`px-3 py-1 rounded text-white text-sm font-medium transition-colors ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : type === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={() => {
              toast.dismiss(toastId);
              resolve(true);
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        closeButton: false,
        className: "toast-confirmation",
      }
    );
  });
}

export function showToastSuccess(message: string, autoClose: number = 3000) {
  toast.success(message, { autoClose });
}

export function showToastError(message: string, autoClose: number = 4000) {
  toast.error(message, { autoClose });
}

export function showToastInfo(message: string, autoClose: number = 3000) {
  toast.info(message, { autoClose });
}
