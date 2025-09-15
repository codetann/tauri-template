import { Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import styles from "./AudioPage.module.css";

export default function AudioPage() {
  return (
    <div>
      <FloatingInput />
    </div>
  );
}

function FloatingInput() {
  return (
    <div className={STYLES["floating-input"]}>
      <textarea
        placeholder="Enter your text here"
        className={STYLES["textarea"]}
      />
      <div className={STYLES["footer"]}>
        <Select
          placeholder="Select a task"
          className="hover:bg-background"
          classNames={{
            base: "bg-background hover:bg-background",
            mainWrapper: "bg-background",
            trigger:
              "bg-background border-2 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-900",
            listboxWrapper: "bg-background",
            listbox: "bg-background",

            itemWrapper: "bg-background",
            itemLabel: "bg-background",
            itemDescription: "bg-background",
            itemIcon: "bg-background",
          }}
        >
          <SelectItem>Text to Speach</SelectItem>
          <SelectItem>Text to Audio</SelectItem>
        </Select>
        <Select
          size="lg"
          placeholder="Select a model"
          className="hover:bg-background"
          classNames={{
            base: "bg-background hover:bg-background",
            mainWrapper: "bg-background",
            trigger:
              "bg-background border-2 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-900",
            listboxWrapper: "bg-background",
            listbox: "bg-background",

            itemWrapper: "bg-background",
            itemLabel: "bg-background",
            itemDescription: "bg-background",
            itemIcon: "bg-background",
          }}
        >
          <SelectItem>Text to Speach</SelectItem>
          <SelectItem>Text to Audio</SelectItem>
        </Select>
      </div>
    </div>
  );
}

const STYLES = {
  ["floating-input"]:
    "fixed bottom-10 left-1/2 -translate-x-1/2 shadow-2xl w-[40rem] h-42 rounded-xl bg-background border-neutral-200 dark:border-neutral-800 border-[1px] p-4 flex flex-col gap-2",

  ["textarea"]: "bg-background w-full resize-none  p-2 rounded-md h-full",
  ["footer"]: "flex justify-between items-center",
};
