import { FilterComponent } from "./filterbuilder";
import style from "./filters.module.scss";

export default class Filters {
  static MinMaxNumber(props: React.ComponentProps<FilterComponent<number>>) {
    function handleChange(op: "min" | "max", value: number) {
      const result = { ...props.value };
      if (value > 0) {
        result[op] = value;
      } else {
        delete result[op];
      }

      props.onChange(result);
    }

    return (
      <div className={style.minmax}>
        <label>
          <span>Min</span>
          <input
            type="number"
            value={props.value.min ?? ""}
            onChange={(e) => handleChange("min", +e.currentTarget.value)}
          />
        </label>
        <label>
          <span>Max</span>
          <input
            type="number"
            value={props.value.max ?? ""}
            onChange={(e) => handleChange("max", +e.currentTarget.value)}
          />
        </label>
      </div>
    );
  }

  static MinMaxDate(props: React.ComponentProps<FilterComponent<Date>>) {
    function handleChange(
      op: "min" | "max",
      value: string,
      val = Date.parse(value)
    ) {
      const result = { ...props.value };
      if (!isNaN(val)) {
        result[op] = new Date(val);
      } else {
        delete result[op];
      }

      props.onChange(result);
    }

    return (
      <div className={style.minmax}>
        <label>
          <span>Min</span>
          <input
            type="date"
            value={props.value.min?.toISOString().substring(0, 10) ?? ""}
            onChange={(e) => handleChange("min", e.currentTarget.value)}
          />
        </label>
        <label>
          <span>Max</span>
          <input
            type="date"
            value={props.value.max?.toISOString().substring(0, 10) ?? ""}
            onChange={(e) => handleChange("max", e.currentTarget.value)}
          />
        </label>
      </div>
    );
  }
}


