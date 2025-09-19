import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  BiSearch,
  BiSort,
  BiFilter,
  BiDownload,
  BiUpload,
  BiCog,
  BiGridAlt,
  BiListUl,
} from "react-icons/bi";
import { useMarketplaceStore } from "@/state/marketplaceStore";

const SORT_OPTIONS = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size" },
  { key: "downloads", label: "Downloads" },
  { key: "rating", label: "Rating" },
  { key: "date", label: "Date Added" },
];

const TYPE_OPTIONS = [
  { key: "all", label: "All Types" },
  { key: "model", label: "Models" },
  { key: "lora", label: "LoRAs" },
  { key: "embedding", label: "Embeddings" },
  { key: "vae", label: "VAEs" },
  { key: "scheduler", label: "Schedulers" },
];

interface MarketplaceFiltersProps {
  onImportCustom: () => void;
  onManageModels: () => void;
}

export default function MarketplaceFilters({
  onImportCustom,
  onManageModels,
}: MarketplaceFiltersProps) {
  const {
    categories,
    selectedCategory,
    searchQuery,
    selectedType,
    sortBy,
    sortOrder,
    viewMode,
    setSelectedCategory,
    setSearchQuery,
    setSelectedType,
    setSortBy,
    setSortOrder,
    setViewMode,
  } = useMarketplaceStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSortChange = (value: string) => {
    if (value === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(value as any);
      setSortOrder("desc");
    }
  };

  useEffect(() => {
    console.log(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Main Filters */}
      <Card className="bg-neutral-800/50">
        <CardBody className="p-4 gap-4">
          {/* Category Tabs */}
          <div className="flex-1">
            <Tabs
              selectedKey={selectedCategory}
              onSelectionChange={(key) => setSelectedCategory(key as string)}
              variant="underlined"
              classNames={{
                tabList: "gap-2 w-full relative rounded-none p-0 ",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary",
              }}
            >
              {categories.map((category) => (
                <Tab
                  key={category.id}
                  title={
                    <div
                      className="flex items-center gap-2 rounded-lg px-1.5 py-1"
                      style={{
                        backgroundColor:
                          selectedCategory === category.id
                            ? "hsl(var(--heroui-primary))"
                            : "transparent",
                        color:
                          selectedCategory === category.id
                            ? "hsl(var(--heroui-primary-foreground))"
                            : "default",
                      }}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                      <Chip size="sm" variant="flat" color="default">
                        {category.count}
                      </Chip>
                    </div>
                  }
                />
              ))}
            </Tabs>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* View Switcher */}
            <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
              <Button
                isIconOnly
                size="sm"
                variant={viewMode === "grid" ? "solid" : "light"}
                color={viewMode === "grid" ? "primary" : "default"}
                style={{
                  backgroundColor:
                    viewMode === "grid"
                      ? "hsl(var(--heroui-primary))"
                      : "transparent",
                  color:
                    viewMode === "grid"
                      ? "hsl(var(--heroui-primary-foreground))"
                      : "default",
                }}
                onPress={() => setViewMode("grid")}
              >
                <BiGridAlt />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant={viewMode === "list" ? "solid" : "light"}
                color={viewMode === "list" ? "primary" : "default"}
                style={{
                  backgroundColor:
                    viewMode === "list"
                      ? "hsl(var(--heroui-primary))"
                      : "transparent",
                  color:
                    viewMode === "list"
                      ? "hsl(var(--heroui-primary-foreground))"
                      : "default",
                }}
                onPress={() => setViewMode("list")}
              >
                <BiListUl />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="bordered"
                size="sm"
                startContent={<BiUpload />}
                onPress={onImportCustom}
              >
                Import
              </Button>
              <Button
                variant="bordered"
                size="sm"
                startContent={<BiCog />}
                onPress={onManageModels}
              >
                Manage
              </Button>
              <Button
                variant="light"
                size="sm"
                startContent={<BiFilter />}
                onPress={() => setShowAdvanced(!showAdvanced)}
              >
                Filters
              </Button>
            </div>
            {/* Search */}
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<BiSearch />}
              className="flex-1"
              classNames={{
                inputWrapper: "bg-background border-neutral-700",
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card className="bg-neutral-800/50">
          <CardBody className="p-4">
            <div className="flex flex-wrap gap-4">
              {/* Type Filter */}
              <Select
                placeholder="Filter by type"
                selectedKeys={selectedType ? [selectedType] : []}
                onSelectionChange={(keys) =>
                  setSelectedType(Array.from(keys)[0] as string)
                }
                className="w-48"
                size="sm"
                classNames={{
                  trigger: "bg-background border-neutral-700",
                }}
              >
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Sort Options */}
              <Select
                placeholder="Sort by"
                selectedKeys={sortBy ? [sortBy] : []}
                onSelectionChange={(keys) =>
                  handleSortChange(Array.from(keys)[0] as string)
                }
                className="w-48"
                size="sm"
                classNames={{
                  trigger: "bg-background border-neutral-700",
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    <div className="flex items-center gap-2">
                      <BiSort size={14} />
                      <span>{option.label}</span>
                      {sortBy === option.key && (
                        <span className="text-xs text-neutral-400">
                          ({sortOrder === "asc" ? "↑" : "↓"})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </Select>

              {/* Sort Order Toggle */}
              <Button
                variant="flat"
                size="sm"
                startContent={<BiSort />}
                onPress={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="min-w-0"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="flex gap-4 hidden">
        <Card className="bg-neutral-800/50 flex-1">
          <CardBody className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Available Models</p>
                <p className="text-xl font-semibold">
                  {categories.find((c) => c.id === "all")?.count || 0}
                </p>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-neutral-800/50 flex-1">
          <CardBody className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Installed</p>
                <p className="text-xl font-semibold">
                  {categories.find((c) => c.id === "all")?.count || 0}
                </p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-neutral-800/50 flex-1">
          <CardBody className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Downloads</p>
                <p className="text-xl font-semibold">
                  {categories.find((c) => c.id === "all")?.count || 0}K
                </p>
              </div>
              <div className="text-2xl">⬇️</div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
