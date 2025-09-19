import { useState, useEffect } from "react";
import {
  MarketplaceFilters,
  MarketplaceGrid,
  MarketplaceList,
  ModelManagement,
  CustomModelImport,
  Page,
} from "@/components";
import { ModelCategory, useMarketplaceStore } from "@/state/marketplaceStore";
import { Button, Chip, Tab, Tabs } from "@heroui/react";
import { BiPlus } from "react-icons/bi";

export default function MarketplacePage() {
  const {
    loadModels,
    loadInstalledModels,
    viewMode,
    categories,
    selectedCategory,
    setSelectedCategory,
  } = useMarketplaceStore();
  const [activeTab, setActiveTab] = useState<"browse" | "manage">("browse");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    // Load models and installed models when component mounts
    loadModels();
    loadInstalledModels();
  }, [loadModels, loadInstalledModels]);

  const handleImportCustom = () => {
    setIsImportModalOpen(true);
  };

  const handleManageModels = () => {
    setActiveTab("manage");
  };

  const handleCategoryClick = (category: ModelCategory) => {
    setSelectedCategory(category.id);
  };

  return (
    <Page>
      <div className="p-4  w-86 border-r border-divider">
        <h1 className="text-3xl font-bold  mb-10 ">Marketplace</h1>
        <h3 className="text-sm font-bold mb-2">Categories</h3>
        <div className="flex flex-col h-[100%] justify-between gap-2  ">
          <ul className="w-full space-y-2">
            {categories.map((category: ModelCategory) => {
              const isSelected = category.id === selectedCategory;
              const buttonClassName = `w-full flex justify-between items-center px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700  cursor-pointer rounded-xl transition-all duration-200 ${
                isSelected
                  ? "dark:bg-neutral-800 bg-neutral-200 text-primary border-primary"
                  : " dark:text-neutral-400 text-neutral-600"
              }`;
              return (
                <li
                  key={category.id}
                  className="w-full flex justify-center items-center "
                >
                  <button
                    className={buttonClassName}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="flex gap-2 align-center leading-none ">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <Chip size="sm" variant="flat" color="default">
                      {category.count}
                    </Chip>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="w-full">
            <Button className="w-full">
              <BiPlus />
              Add Model
            </Button>
          </div>
        </div>

        {/* <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          variant="underlined"
          isVertical
          className="w-full justify-start"
          classNames={{
            tabList:
              "gap-4 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: " px-0 h-12 w-0 ",

            tabContent: "group-data-[selected=true]:text-primary",
          }}
        >
          {categories.map((category: ModelCategory) => (
            <Tab
              key={category.id}
              className="w-full  flex justify-between  bg-blue-50"
            >
              <div className="w-max flex justify-between bg-red-500">
                <div className="w-full">
                  <span className="pr-2">{category.icon}</span>
                  <span className="">{category.name}</span>
                </div>
                <Chip size="sm" variant="flat" color="default">
                  {category.count}
                </Chip>
              </div>
            </Tab>
          ))}
        </Tabs> */}
      </div>
      <div className="p-6">
        {/* Header */}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "browse"
                ? "bg-primary text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
            onClick={() => setActiveTab("browse")}
          >
            Browse Models
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "manage"
                ? "bg-primary "
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
            onClick={() => setActiveTab("manage")}
          >
            Manage Installed
          </button>
        </div>

        {/* Content */}
        {activeTab === "browse" ? (
          <div className="space-y-6">
            {/* Filters */}
            <MarketplaceFilters
              onImportCustom={handleImportCustom}
              onManageModels={handleManageModels}
            />

            {/* Models View */}
            {viewMode === "grid" ? <MarketplaceGrid /> : <MarketplaceList />}
          </div>
        ) : (
          <ModelManagement />
        )}
      </div>

      {/* Custom Model Import Modal */}
      <CustomModelImport
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </Page>
  );
}
