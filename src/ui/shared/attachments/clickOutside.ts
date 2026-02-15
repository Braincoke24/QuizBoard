// src/ui/shared/attachments/clickOutside.ts

/**
 * Attachment that calls `onOutside` when clicking outside the bound element.
 */
export function clickOutside(onOutside: () => void) {
    return (node: HTMLElement) => {
        function handleClick(event: MouseEvent): void {
            if (!node.contains(event.target as Node)) {
                onOutside()
            }
        }

        document.addEventListener("click", handleClick, true)

        return () => {
            document.removeEventListener("click", handleClick, true)
        }
    }
}
