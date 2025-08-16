import { Tooltip, useDisclosure } from "@heroui/react";
import styles from "./NavBar.module.css";
import {
  BiCog,
  BiMusic,
  BiHome,
  BiImage,
  BiText,
  BiVideo,
  BiWrench,
  BiMessage,
} from "react-icons/bi";
import { Button } from "../Button";
import { SettingsModal } from "../settings-modal";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: BiHome,
  },
  {
    label: "Text",
    href: "/",
    icon: BiMessage,
  },
  {
    label: "Images",
    href: "/",
    icon: BiImage,
  },
  {
    label: "Audio",
    href: "/",
    icon: BiMusic,
  },
  {
    label: "Video",
    href: "/",
    icon: BiVideo,
  },
  {
    label: "Tools",
    href: "/",
    icon: BiWrench,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: BiCog,
  },
];

export default function NavBar() {
  const settingsModal = useDisclosure();

  const handleNavItemClick = (href: string) => {
    if (href === "/settings") {
      settingsModal.onOpen();
    }
  };

  return (
    <aside className={styles.navbar}>
      {navItems.map((item) => (
        <Tooltip
          key={item.href}
          content={item.label}
          placement="right"
          closeDelay={0}
        >
          <Button
            isIconOnly
            key={item.href}
            className={styles.navItem}
            color="default"
            variant="light"
            size="lg"
            onPress={() => handleNavItemClick(item.href)}
          >
            <item.icon size={24} />
          </Button>
        </Tooltip>
      ))}
      <SettingsModal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.onClose}
      />
    </aside>
  );
}
