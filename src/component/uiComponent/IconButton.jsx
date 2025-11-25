export default function IconButton({
  icon: Icon,
  ref,
  onClick,
  variant = "default",
  size = "md",
  className = "",
  ariaLabel = "icon button",
  text = "",
}) {
  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  const variantClasses = {
    default: "bg-card hover:bg-muted text-foreground shadow-sm rounded-full",
    primary:
      "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-full",
    ghost:
      "hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm rounded-full",
    normal: "text-muted-foreground hover:text-foreground transition-smooth",
    primary2:
      "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-md",
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
    xxl: "w-20 h-20",
  };

  return (
    <div className="flex flex-col items-center ">
      <button
        ref={ref}
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(
          " flex items-center justify-center transition-all duration-200  ",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
      >
        {Icon && (
          <Icon
            className={
              size === "sm"
                ? "w-4 h-4"
                : size === "lg"
                ? "w-6 h-6"
                : size === "xl"
                ? "w-7 h-7"
                : size === "xxl"
                ? "w-9 h-9"
                : "w-5 h-5"
            }
          />
        )}
      </button>
      {text && <div className="mt-6 font-body">{text}</div>}
    </div>
  );
}
