import { FilterComponent } from "./filterbuilder";
import style from "./filters.module.scss";

export default class Filters {
  static MinMax(props: React.ComponentProps<FilterComponent<number>>) {
    function handleChange(op: "min" | "max", value: number) {
      const result = {...props.value };
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
}
