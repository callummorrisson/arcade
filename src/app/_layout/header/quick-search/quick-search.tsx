"use client"
import { FaSearch } from "react-icons/fa";
import styles from "./quick-search.module.scss";
import { ChangeEvent, useState } from "react";
import { SearchUrlQueryParam } from "@/app/games/_components/search-store";

export default function QuickSearch() {
  const [keywords, setKeywords] = useState('');

  return (
    <form autoComplete="off" action="/games" method="GET" className={styles["quick-search"]}>
      <input
        type="text"
        name={SearchUrlQueryParam.Keywords}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value)}
        value={keywords}
      />
      <button type="submit"><FaSearch /></button>
    </form>
  );
}