import { useMemo } from "react";
import { useMarketplaceStore } from "@/state/marketplaceStore";
import ModelCard from "@/components/model-card";

export default function MarketplaceGrid() {
  const {
    models,
    selectedCategory,
    searchQuery,
    selectedType,
    sortBy,
    sortOrder,
    downloadModel,
    installModel,
    uninstallModel,
  } = useMarketplaceStore();

  // Filter and sort models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (model) => model.category === selectedCategory
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((model) => model.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query) ||
          model.author.toLowerCase().includes(query) ||
          model.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort models
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "size":
          aValue = a.size;
          bValue = b.size;
          break;
        case "downloads":
          aValue = a.downloads;
          bValue = b.downloads;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "date":
          aValue = new Date(a.id).getTime(); // Using ID as date proxy
          bValue = new Date(b.id).getTime();
          break;
        default:
          aValue = a.downloads;
          bValue = b.downloads;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [models, selectedCategory, selectedType, searchQuery, sortBy, sortOrder]);

  if (filteredAndSortedModels.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No models found</h3>
        <p className="text-neutral-400">
          Try adjusting your search criteria or browse different categories
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredAndSortedModels.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          onDownload={downloadModel}
          onInstall={installModel}
          onUninstall={uninstallModel}
        />
      ))}
    </div>
  );
}

