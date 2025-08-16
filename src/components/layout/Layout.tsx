import { NavBar } from "@/components";
import styles from "./Layout.module.css";

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
  return <header className={styles["layout-header"]}>Header</header>;
}

function LayoutBody({ children }: LayoutBodyProps) {
  return <div className={styles["layout-body"]}>{children}</div>;
}

function LayoutContent({ children }: LayoutContentProps) {
  return <div className={styles["layout-content"]}>{children}</div>;
}
