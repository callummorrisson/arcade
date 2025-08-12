import MainNav from "./main-nav/main-nav";
import QuickSearch from "./quick-search/quick-search";
import styles from "./header.module.scss";
import Link from "next/link";
import Logo from "./logo";

export default function Header() {
  return (
    <div className={styles["site-header"]}>
      <div className={styles["start"]}>
        <Link href="/" className={styles["logo"]}>
          <Logo />
        </Link>
      </div>

      <QuickSearch />

      <div className={styles["end"]}>
        <MainNav />
      </div>
    </div>
  );
}
