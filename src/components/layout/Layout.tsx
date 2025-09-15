import { Button, NavBar } from "@/components";
import styles from "./Layout.module.css";
import { BiSolidChess, BiRadar } from "react-icons/bi";
import { LiaGripLinesSolid } from "react-icons/lia";
import { FaRegCircle } from "react-icons/fa";
import { LuCircleSlash2 } from "react-icons/lu";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

interface LayoutBodyProps {
  children: React.ReactNode;
}

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main className={styles.layout}>
      <LayoutHeader />
      <LayoutBody>
        <NavBar />
        <LayoutContent>{children}</LayoutContent>
      </LayoutBody>
    </main>
  );
}

function LayoutHeader() {
  const location = useLocation();
  return (
    <header className={styles["layout-header"]}>
      <div className={styles["layout-header-left"]}>
        <LuCircleSlash2 size={20} className="text-primary pb-1 " />

        <h5 className={styles["layout-header-title"]}>
          Play<i className="text-sm">(</i>
          <i className="text-primary">
            {/* <i className="opacity-100 text-md text-colors-background-DEFAULT  ">
              -
            </i> */}
            ai
          </i>
          <i className="text-sm">)</i>
        </h5>
      </div>
      {/* <div className={styles["layout-header-right"]}>
        {location.pathname.split("/").map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div> */}
    </header>
  );
}

function LayoutBody({ children }: LayoutBodyProps) {
  return <div className={styles["layout-body"]}>{children}</div>;
}

function LayoutContent({ children }: LayoutContentProps) {
  return <div className={styles["layout-content"]}>{children}</div>;
}
