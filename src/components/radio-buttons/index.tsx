import { ReactNode } from "react";
import style from "./radio-button-group.module.scss";

export default function RadioButtons<T extends string | number | boolean>({
  options,
  showRadio,
  onChange,
  selected,
}: Readonly<RadioButtonsProps<T>>) {
  return (
    <>
      {options.map((x, i) => {
        const v = x.value;
        return (
          <label
            key={i}
            className={`${style["option"]} ${!showRadio ? "hide-radio" : ""}`}
          >
            <input
              type="radio"
              value={v.toString()}
              checked={v === selected}
              onChange={() => {
                onChange(v);
              }}
            />
            {x.label}
          </label>
        );
      })}
    </>
  );
}

interface RadioButtonsProps<T extends string | number | boolean> {
  options: RadioButtonOption<T>[];
  selected: T;
  onChange: (value: T) => void;
  showRadio: boolean;
}

interface RadioButtonOption<T> {
  label: NonNullable<ReactNode>;
  value: T;
}
