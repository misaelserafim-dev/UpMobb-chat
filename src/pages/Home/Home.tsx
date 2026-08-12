import { HomeTemplate } from "../../templates/Home/HomeTemplate.tsx";
import type { HomeProps } from "./Home.ts";
import "./Home.css";

export function Home(_props: HomeProps) {
  return (
    <HomeTemplate>
      <div className="home" />
    </HomeTemplate>
  );
}
