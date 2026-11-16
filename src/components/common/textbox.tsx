import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface TextBoxProps {
    onChange?: () => void;
    onEnter?: () => void;
    valueRef: React.MutableRefObject<string>;
    placeholder?: string;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

const TextBox = forwardRef(({ onChange = () => {}, onEnter = () => {}, valueRef, placeholder, startContent, endContent, className, disabled = false }: TextBoxProps, ref: React.LegacyRef<HTMLInputElement>) => {
    const [_, forceUpdate] = useState(0);
    const onInput = (e: React.FormEvent<HTMLInputElement>) => {
        valueRef.current = e.currentTarget.value;
        onChange();
        forceUpdate(x => x + 1);
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter")
            onEnter();
    };
    return (
        <div className="answer-field relative flex flex-row w-80 max-w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                {startContent}
            </div>
            <input className={twMerge("box-border min-w-0 w-full rounded-md border border-black border-solid px-10 py-2 bg-gray-100 hover:bg-gray-200 placeholder:text-base transition-colors duration-150", className)} ref={ref} disabled={disabled} name="inputbox" id="inputbox" type="text" aria-label={placeholder || "Answer"} onInput={onInput} onKeyDown={onKeyDown} value={valueRef.current} placeholder={placeholder} autoComplete="off" />
            <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                {endContent}
            </div>
        </div>
    );
});
TextBox.displayName = "TextBox";

export default TextBox;