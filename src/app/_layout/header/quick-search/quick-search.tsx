"use client"
import { FaSearch } from "react-icons/fa";
import styles from "./quick-search.module.scss";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchUrlQueryParam } from "@/app/games/_components/search-store";

export default function QuickSearch() {
  const router = useRouter();
  const [keywords, setKeywords] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(`/games?${SearchUrlQueryParam.Keywords}=${encodeURIComponent(keywords.trim())}`);
  }

  return (
    <form autoComplete="off" onSubmit={handleSubmit} className={styles["quick-search"]}>
      <input
        type="text"
        name="query"
        onChange={(e: ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value)}
        value={keywords}
      />
      <button type="submit"><FaSearch /></button>
    </form>
  );
}