import MainNav from "./main-nav/main-nav";
import QuickSearch from "./quick-search";
import styles from "./header.module.scss";

export default function Header() {
  return (
    <div className={styles["site-header"]}>
      <div className={styles["start"]}>
        <MainNav />
      </div>

      <QuickSearch />

      <div className={styles["end"]}></div>
    </div>
  );
}
