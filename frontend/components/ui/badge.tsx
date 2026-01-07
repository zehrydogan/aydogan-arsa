import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: 'bg-blue-100 text-blue-800',
            destructive: 'bg-red-500 text-white',
            outline: 'border border-gray-300 text-gray-700',
            secondary: 'bg-gray-100 text-gray-800'
        }

        return (
            <div
                ref={ref}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className || ''}`}
                {...props}
            />
        )
    }
)
Badge.displayName = "Badge"

export { Badge }