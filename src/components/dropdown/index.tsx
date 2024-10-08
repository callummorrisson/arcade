"use client";

import style from "./dropdown.module.scss";
import { FaChevronDown } from "react-icons/fa";

export default function Dropdown<T extends string | number>({
  selected,
  items,
  onChange,
}: Readonly<DropdownProps<T>>) {
  const selectedLabel = items.find((x) => x.value === selected)?.label;
  return (
    <div className={style.dropdown} tabIndex={0}>
      <div className={style["current-option"]}>
        <span>{selectedLabel || "--select one--"}</span>
        <FaChevronDown />
      </div>
      <div className={style["options-container"]}>
        <div className={style.options}>
          {items.map((x) => {
            const v = x.value;
            return (
              <label key={x.value} className={style.option}>
                <input
                  type="radio"
                  value={x.value}
                  onChange={() => {
                    onChange(v);
                  }}
                  checked={x.value === selected}
                />
                {x.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface DropDownOption<T> {
  label: string | number;
  value: T;
}

interface DropdownProps<T extends string | number> {
  selected: T;
  items: DropDownOption<T>[];
  onChange: (value: T) => void;
}
