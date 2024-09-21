import { forwardRef, useState } from "react";

interface TextBoxProps {
    onChange: () => void;
    onEnter: () => void;
    valueRef: React.MutableRefObject<string>;
}

const TextBox = forwardRef(({ onChange, onEnter, valueRef }: TextBoxProps, ref: React.LegacyRef<HTMLInputElement>) => {
    const [_, forceUpdate] = useState(0);
    const onInput = (e: React.FormEvent<HTMLInputElement>) => {
        valueRef.current = e.currentTarget.value;
        onChange();
        forceUpdate(x => x + 1);
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.key === "Enter" && onEnter();
    };
    return (
        <div>
            <input ref={ref} name="inputbox" id="inputbox" type="text" onInput={onInput} onKeyDown={onKeyDown} value={valueRef.current} />
        </div>
    );
})

export default TextBox;