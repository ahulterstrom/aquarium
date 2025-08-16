import { Toaster as Sonner, ToasterProps } from "sonner";
import { toast as sonnerToast } from "sonner";

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group pointer-events-auto"
      offset={"1rem"}
      expand
      visibleToasts={5}
      // closeButton={true}
      toastOptions={{
        unstyled: true,
        style: {
          // opacity: 1,
          background: "transparent",
        },
        classNames: {
          // toast: "bg-red-500 pointer-events-auto",
          // content: "bg-red-500",
          toast: "glass group toast group-[.toaster]:pointer-events-auto",
          title: "group-[.toast]:text-foreground",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        ...props.toastOptions,
      }}
      {...props}
    />
  );
};

export function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toast.title ?? "Notification"}
      description={toast.description}
      button={
        toast.button && {
          label: toast.button.label,
          onClick: () => console.log("Button clicked"),
        }
      }
    />
  ));
}

/** A fully custom toast that still maintains the animations and interactions. */
function Toast(props: ToastProps) {
  const { title, description, button, id } = props;

  return (
    <div className="glass flex w-full items-center rounded-lg p-4 ring-1 shadow-lg ring-black/5 md:max-w-[364px]">
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {button && (
        <div className="ml-5 shrink-0 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
          <button
            className="rounded bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
            onClick={() => {
              button.onClick();
              sonnerToast.dismiss(id);
            }}
          >
            {button.label}
          </button>
        </div>
      )}
    </div>
  );
}

// export default function Headless() {
//   return (
//     <button
//       className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white"
//       onClick={() => {
//         toast({
//           title: 'This is a headless toast',
//           description: 'You have full control of styles and jsx, while still having the animations.',
//           button: {
//             label: 'Reply',
//             onClick: () => sonnerToast.dismiss(),
//           },
//         });
//       }}
//     >
//       Render toast
//     </button>
//   );
// }

interface ToastProps {
  id: string | number;
  title?: string;
  description: string;
  button?: {
    label: string;
    onClick: () => void;
  };
}
