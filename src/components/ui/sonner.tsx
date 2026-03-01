import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-900/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border-white/20 group-[.toaster]:shadow-2xl",
          description: "group-[.toast]:text-slate-300",
          actionButton:
            "group-[.toast]:bg-orange-500/90 group-[.toast]:backdrop-blur-sm group-[.toast]:text-white group-[.toast]:hover:bg-orange-600",
          cancelButton:
            "group-[.toast]:bg-slate-800/80 group-[.toast]:backdrop-blur-sm group-[.toast]:text-slate-300",
          error: "!bg-rose-900/90 !backdrop-blur-xl !border-rose-500/50 !text-white",
          success: "!bg-emerald-900/90 !backdrop-blur-xl !border-emerald-500/50 !text-white",
          info: "!bg-blue-900/90 !backdrop-blur-xl !border-blue-500/50 !text-white",
          warning: "!bg-amber-900/90 !backdrop-blur-xl !border-amber-500/50 !text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
