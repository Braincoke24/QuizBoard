export const keyCodeNameMap = (keyCode: string): string => {
    if (keyCode.startsWith("Digit")) return keyCode.slice(5)
    if (keyCode.startsWith("Numpad")) return "Num" + keyCode.slice(6)
    if (keyCode.startsWith("Key")) return keyCode.slice(3)

    return keyCode
}
