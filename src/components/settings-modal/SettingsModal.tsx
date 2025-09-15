import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Select,
  SelectItem,
  useSwitch,
  VisuallyHidden,
} from "@heroui/react";
import styles from "./SettingsModal.module.css";
import {
  BiCog,
  BiError,
  BiLayer,
  BiMoon,
  BiPaint,
  BiHelpCircle,
  BiSun,
  BiWrench,
  BiInfoCircle,
} from "react-icons/bi";
import { useState } from "react";
import { useTheme } from "@heroui/use-theme";
import { AnimatePresence, motion } from "framer-motion";

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
  {
    label: "Advanced",
    key: "advanced",
    icon: BiLayer,
  },
  {
    label: "About",
    key: "about",
    icon: BiInfoCircle,
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
        <ModalBody className="p-0">
          <div className="flex h-96">
            <div className={styles["settings-modal-nav"]}>
              {settingsNavItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.12 * index }}
                  className={`${styles["settings-modal-nav-item"]} ${
                    activeTab === item.key
                      ? styles["settings-modal-nav-item-active"]
                      : ""
                  }`}
                  onClick={() => setActiveTab(item.key)}
                >
                  <item.icon
                    className={`${
                      activeTab === item.key ? "text-primary" : ""
                    }`}
                  />
                  <span>{item.label}</span>
                </motion.div>
              ))}
            </div>
            <motion.div className={styles["settings-content"]}>
              <AnimatePresence mode="wait">
                {settingsNavItems.map((item) => (
                  <motion.div
                    key={item.key}
                    initial={{
                      opacity: item.key === activeTab ? 1 : 0,
                    }}
                    animate={{ opacity: item.key === activeTab ? 1 : 0 }}
                    exit={{ opacity: item.key === activeTab ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className={styles["settings-content-wrapper"]}
                  >
                    {activeTab === "general" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut",
                          delay: 0.1,
                        }}
                        className={styles["settings-content-wrapper"]}
                      >
                        <div className={styles["settings-content-header"]}>
                          <h4>General Settings</h4>
                        </div>

                        <div className={styles["settings-content-body"]}>
                          <div className={styles["settings-content-row"]}>
                            <p>Theme</p>
                            <ThemeSwitch />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {activeTab === "appearance" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut",
                          delay: 0.1,
                        }}
                        className={styles["settings-content-wrapper"]}
                      >
                        <div className={styles["settings-content-header"]}>
                          <h4>Appearance Settings</h4>
                        </div>

                        <div className={styles["settings-content-body"]}>
                          <div className={styles["settings-content-row"]}>
                            <p>Theme</p>
                            <ThemeSwitch />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {/* {activeTab === "general" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className={styles["settings-content-wrapper"]}
                >
                  <div className={styles["settings-content-header"]}>
                    <h4>General Settings</h4>
                  </div>

                  <div className={styles["settings-content-body"]}>
                    <div className={styles["settings-content-row"]}>
                      <p>Theme</p>
                      <ThemeSwitch />
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === "appearance" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className={styles["settings-content-wrapper"]}
                >
                  <div className={styles["settings-content-header"]}>
                    <h4>Appearance Settings</h4>
                  </div>

                  <div className={styles["settings-content-body"]}>
                    <div className={styles["settings-content-row"]}>
                      <p>Theme</p>
                      <ThemeSwitch />
                    </div>
                  </div>
                </motion.div>
              )} */}
            </motion.div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const ThemeSwitch = (props) => {
  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch(props);
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (e: any) => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex flex-col gap-2">
      <Component {...getBaseProps()}>
        <VisuallyHidden>
          <input {...getInputProps()} />
        </VisuallyHidden>
        <div
          {...getWrapperProps()}
          onClick={handleThemeChange}
          className={slots.wrapper({
            class: [
              "w-8 h-8",
              "flex items-center justify-center",
              "rounded-lg bg-default-100 hover:opacity-70 transition-all duration-300",
            ],
          })}
        >
          {theme === "light" ? <BiSun color="white" /> : <BiMoon />}
        </div>
      </Component>
    </div>
  );
};
