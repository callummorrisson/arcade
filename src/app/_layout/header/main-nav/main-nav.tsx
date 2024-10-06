import Link from "next/link";
import { IconType } from "react-icons";
import { FaHome, FaSearch } from "react-icons/fa";
import styles from "./main-nav.module.scss";
import { GiHamburgerMenu } from "react-icons/gi";
import Logo from "./logo";

export default function MainNav() {
  return (
    <>
      <button title="Menu" className={styles["menu-button"]}>
        <div className={styles["menu-icon"]}>
          <GiHamburgerMenu />
        </div>

        <div className={styles["nav-wrapper"]}>
          <nav>
            <ul>
              <li>{IconLink("Home", FaHome, "/")}</li>
              <li>{IconLink("Search", FaSearch, "/games")}</li>
            </ul>
          </nav>
        </div>
      </button>
      <Link href="/" className={styles["logo"]}>
        <Logo />
      </Link>
    </>
  );
}

function IconLink(text: string, icon: IconType, url: string) {
  return (
    <Link href={url}>
      <i>{icon({})}</i>
      <span>{text}</span>
    </Link>
  );
}
