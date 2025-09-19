import {
  Modal,
  ModalContent,
  ModalBody,
  useSwitch,
  VisuallyHidden,
} from "@heroui/react";
import styles from "./SettingsModal.module.css";
import {
  BiCog,
  BiLayer,
  BiMoon,
  BiPaint,
  BiSun,
  BiInfoCircle,
} from "react-icons/bi";
import { useState } from "react";
import { useTheme } from "@heroui/use-theme";
import { AnimatePresence, motion } from "framer-motion";
import { useThemeContext } from "@/contexts/ThemeContext";

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
  const [activeTab, setActiveTab] = useState(settingsNavItems[0].key);
  const { primaryColor, setPrimaryColor } = useThemeContext();

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
                          <div className={styles["settings-content-row"]}>
                            <div className="flex flex-col gap-1">
                              <p>Primary Color</p>
                              <p className="text-xs text-default-500">
                                Choose your primary color for the application
                              </p>
                            </div>
                            <PrimaryColorPicker
                              color={primaryColor}
                              onChange={setPrimaryColor}
                            />
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

const ThemeSwitch = () => {
  const { Component, slots, getBaseProps, getInputProps, getWrapperProps } =
    useSwitch({});
  const { theme, setTheme } = useTheme();

  const handleThemeChange = () => {
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

interface PrimaryColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const PrimaryColorPicker = ({ color, onChange }: PrimaryColorPickerProps) => {
  const predefinedColors = [
    "#f76f53", // Original orange
    "#3182ce", // Blue
    "#38a169", // Green
    "#d53f8c", // Pink
    "#805ad5", // Purple
    "#dd6b20", // Orange
    "#e53e3e", // Red
    "#319795", // Teal
    "#d69e2e", // Yellow
    "#4c51bf", // Indigo
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className={`w-12 h-12 rounded-lg border-2 border-default-200 cursor-pointer ${styles["color-picker-input"]}`}
          style={{ backgroundColor: color }}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{color.toUpperCase()}</span>
          <span className="text-xs text-default-500">Custom color</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {predefinedColors.map((predefinedColor) => (
          <button
            key={predefinedColor}
            onClick={() => onChange(predefinedColor)}
            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
              color === predefinedColor
                ? "border-primary ring-2 ring-primary/20"
                : "border-default-200 hover:border-default-300"
            }`}
            style={{ backgroundColor: predefinedColor }}
            title={predefinedColor}
          />
        ))}
      </div>
    </div>
  );
};
