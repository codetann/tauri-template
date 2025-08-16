import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Select,
  SelectItem,
} from "@heroui/react";
import styles from "./SettingsModal.module.css";
import { BiCog, BiPaint } from "react-icons/bi";
import { useState } from "react";
import { useTheme } from "@heroui/use-theme";

const settingsNavItems = [
  {
    label: "General",
    key: "general",
    icon: BiCog,
  },
  {
    label: "Appearance",
    key: "appearance",
    icon: BiPaint,
  },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(settingsNavItems[0].key);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles["settings-modal"]}
      size="2xl"
    >
      <ModalContent>
        {/* <ModalHeader>
          <h1>Settings</h1>
        </ModalHeader> */}
        <ModalBody className=" ">
          <div className="flex h-96">
            <div className={styles["settings-modal-nav"]}>
              {settingsNavItems.map((item) => (
                <div
                  key={item.label}
                  className={`${styles["settings-modal-nav-item"]} ${
                    activeTab === item.key
                      ? styles["settings-modal-nav-item-active"]
                      : ""
                  }`}
                  onClick={() => setActiveTab(item.key)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className={styles["settings-content"]}>
              {activeTab === "general" && (
                <div>
                  <h3>General</h3>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between gap-2 w-full ">
                      <p>Theme</p>
                      <Select
                        defaultSelectedKeys={theme}
                        className="w-40"
                        onChange={(e) => setTheme(e.target.value)}
                      >
                        <SelectItem key="light" textValue="Light">
                          Light
                        </SelectItem>
                        <SelectItem key="dark" textValue="Dark">
                          Dark
                        </SelectItem>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "appearance" && <div>Appearance</div>}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
