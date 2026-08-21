import React, { useState, useEffect } from "react";
import { catService } from "../services/api";
import CatCard from "../components/CatCard";
import FiltersCard from "../components/FiltersCard";

export default function CatalogPage() {
  const [cats, setCats] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [breed, setBreed] = useState("All Breeds");
  const [ageGroup, setAgeGroup] = useState("All Ages");
  const [gender, setGender] = useState("All Genders");
  const [priceRange, setPriceRange] = useState("All Prices");

  // Pagination states
  const [page, setPage] = useState(1);
  const limit = 20;

  // Unique breeds list for filter
  const [breeds, setBreeds] = useState([]);

  useEffect(() => {
    // Fetch all cats once to extract unique breeds
    catService
      .list({ limit: 100 })
      .then((data) => {
        const uniqueBreeds = [
          ...new Set(data.items.map((c) => c.breed)),
        ].filter(Boolean);
        setBreeds(uniqueBreeds);
      })
      .catch((err) => console.error("Error fetching breeds:", err));
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      setLoading(true);
      setError(null);

      const params = {
        skip: (page - 1) * limit,
        limit,
      };

      if (search.trim()) params.search = search.trim();
      if (breed !== "All Breeds") params.breed = breed;
      if (gender !== "All Genders") params.gender = gender;
      if (ageGroup !== "All Ages") params.age_group = ageGroup;

      if (priceRange !== "All Prices") {
        if (priceRange === "0-200") {
          params.min_price = 0;
          params.max_price = 200;
        } else if (priceRange === "200-500") {
          params.min_price = 200;
          params.max_price = 500;
        } else if (priceRange === "500-1000") {
          params.min_price = 500;
          params.max_price = 1000;
        } else if (priceRange === "1000+") {
          params.min_price = 1000;
        }
      }

      try {
        const data = await catService.list(params);
        setCats(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error("Error fetching cats:", err);
        setError("Failed to load cats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input
    const delayDebounce = setTimeout(
      () => {
        fetchCats();
      },
      search ? 300 : 0,
    );

    return () => clearTimeout(delayDebounce);
  }, [search, breed, ageGroup, gender, priceRange, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, breed, ageGroup, gender, priceRange]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6 items-start p-6 w-full max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col gap-2 items-center text-center p-6 w-full">
        <h1 className="font-bold text-[#eb590d] text-3xl md:text-4xl">
          Find Your Perfect Feline Companion
        </h1>
        <p className="text-[#7a7066] text-base md:text-lg">
          Browse healthy, vaccinated, and loving cats from verified sellers.
        </p>
      </div>

      {/* Filters */}
      <FiltersCard
        search={search}
        setSearch={setSearch}
        breed={breed}
        setBreed={setBreed}
        ageGroup={ageGroup}
        setAgeGroup={setAgeGroup}
        gender={gender}
        setGender={setGender}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        breeds={breeds}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg w-full text-center">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12 w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb590d]"></div>
        </div>
      ) : (
        <>
          {/* Empty State */}
          {cats.length === 0 ? (
            <div className="bg-white border border-[#e5e0d9] p-12 rounded-[14px] text-center w-full shadow-sm">
              <p className="text-lg font-semibold text-[#1f1712] mb-2">
                No cats found matching your criteria.
              </p>
              <p className="text-[#7a7066]">Try adjusting your filters!</p>
            </div>
          ) : (
            /* Cat Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full justify-items-center">
              {cats.map((cat) => (
                <CatCard key={cat.id} cat={cat} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white border border-[#e5e0d9] flex items-center justify-between p-4 rounded-[10px] w-full shadow-sm mt-6">
              <p className="text-[#7a7066] text-sm">
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)}{" "}
                of {total} cats
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="bg-white border border-[#e5e0d9] text-[#1f1712] text-sm px-4 py-2 rounded-[10px] hover:bg-[#faf7f2] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="bg-[#eb590d] text-white text-sm px-4 py-2 rounded-[10px] font-medium">
                  {page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="bg-white border border-[#e5e0d9] text-[#1f1712] text-sm px-4 py-2 rounded-[10px] hover:bg-[#faf7f2] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
