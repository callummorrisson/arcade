"use client";

import RadioButtons from "../radio-buttons";
import styles from "./dropdown.module.scss";
import { FaChevronDown } from "react-icons/fa";

export default function Dropdown<T extends string | number>({
  selected,
  items,
  onChange,
}: Readonly<DropdownProps<T>>) {
  const selectedLabel = items.find((x) => x.value === selected)?.label;
  return (
    <div className={styles.dropdown} tabIndex={0}>
      <div className={styles["current-option"]}>
        <span>{selectedLabel || "--select one--"}</span>
        <FaChevronDown />
      </div>
      <div className={styles["options-container"]}>
        <div className={styles.options}>
          <RadioButtons
            options={items}
            showRadio={false}
            onChange={onChange}
            selected={selected}
          />
        </div>
      </div>
    </div>
  );
}

interface DropdownProps<T extends string | number> {
  selected: T;
  items: DropDownOption<T>[];
  onChange: (value: T) => void;
}

interface DropDownOption<T> {
  label: string | number;
  value: T;
}
