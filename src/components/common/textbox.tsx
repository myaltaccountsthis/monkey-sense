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
}

const TextBox = forwardRef(({ onChange = () => {}, onEnter = () => {}, valueRef, placeholder, startContent, endContent, className }: TextBoxProps, ref: React.LegacyRef<HTMLInputElement>) => {
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
        <div className="flex flex-row">
            <div className="w-0 h-full relative">
                <div className="absolute left-0 h-full flex flex-col justify-center">
                    {startContent}
                </div>
            </div>
            <input className={twMerge("rounded-md border-2 border-black border-solid bg-gray-100 hover:bg-gray-200 transition-colors duration-75", className)} ref={ref} name="inputbox" id="inputbox" type="text" onInput={onInput} onKeyDown={onKeyDown} value={valueRef.current} placeholder={placeholder} autoComplete="off" />
            <div className="w-0 h-full relative">
                <div className="absolute right-0 h-full flex flex-col justify-center">
                    {endContent}
                </div>
            </div>
        </div>
    );
});
TextBox.displayName = "TextBox";

export default TextBox;