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
  BiHomeAlt,
  BiHomeAlt2,
  BiSolidHome,
  BiShoppingBag,
} from "react-icons/bi";
import { Button } from "../Button";
import { SettingsModal } from "../settings-modal";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "@/styles/variables";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: BiHome,
  },
  {
    label: "Text",
    href: "/text",
    icon: BiMessage,
  },
  {
    label: "Images",
    href: "/images",
    icon: BiImage,
  },
  {
    label: "Audio",
    href: "/audio",
    icon: BiMusic,
  },
  {
    label: "Video",
    href: "/video",
    icon: BiVideo,
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: BiShoppingBag,
  },
  {
    label: "Tools",
    href: "/tools",
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
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavItemClick = (href: string) => {
    if (href === "/settings") {
      return settingsModal.onOpen();
    }

    navigate(href);
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
            className={`${styles["nav-item"]} ${
              location.pathname === item.href ? styles["nav-item-active"] : ""
            }`}
            color="default"
            variant="light"
            size="md"
            radius="full"
            onPress={() => handleNavItemClick(item.href)}
            // style={{
            //   color:
            //     location.pathname === item.href
            //       ? colors.primary.color
            //       : "var(--color-white-alpha-700)",
            //   backgroundColor:
            //     location.pathname === item.href
            //       ? colors.primary.color
            //       : "transparent",
            // }}
          >
            <item.icon size={20} />
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
